import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const page = parseInt(String(queryParams.page)) || 1
  const limit = parseInt(String(queryParams.limit)) || 10
  const offset = (page - 1) * limit

  try {
    const countSql = `
      SELECT COUNT(*) as total FROM bookings
    `
    const { rows: countResult } = await query(countSql)
    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    const totalSql = `
      SELECT COALESCE(SUM(total_amount_clp), 0) as total_amount
      FROM bookings b
      WHERE b.paid_at IS NOT NULL 
        AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND NOT EXISTS (
          SELECT 1 FROM booking_slots bs
          JOIN availability_slots a ON bs.slot_id = a.id
          JOIN reschedule_history rh ON rh.original_slot_id = a.id
          WHERE bs.booking_id = b.id 
            AND a.status = 'rescheduled'
            AND rh.status = 'completed'
        )
    `
    const { rows: totalResult } = await query(totalSql)
    const totalAmount = parseInt(totalResult[0].total_amount)

    const sql = `
      SELECT 
        b.id,
        b.status as booking_status,
        b.total_amount_clp,
        b.created_at,
        b.paid_at,
        p.id as patient_id,
        p.full_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.is_minor,
        p.guardian_name,
        pr.id as professional_id,
        pr.first_name as professional_first_name,
        pr.last_name as professional_last_name,
        s.name as specialty
      FROM bookings b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN professionals pr ON b.professional_id = pr.id
      LEFT JOIN specialties s ON pr.specialty_id = s.id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `

    const { rows } = await query(sql, [limit, offset])

    const bookingIds = rows.filter(r => r.id).map(r => r.id)

    let slotsMap: any = {}
    if (bookingIds.length > 0) {
      const slotsSql = `
        SELECT 
          bs.booking_id,
          a.id as slot_id,
          a.start_time,
          a.end_time,
          a.status as slot_status
        FROM booking_slots bs
        JOIN availability_slots a ON bs.slot_id = a.id
        WHERE bs.booking_id = ANY($1)
        ORDER BY a.start_time ASC
      `
      const { rows: slotsRows } = await query(slotsSql, [bookingIds])

      slotsRows.forEach(slot => {
        if (!slotsMap[slot.booking_id]) {
          slotsMap[slot.booking_id] = []
        }
        slotsMap[slot.booking_id].push({
          id: slot.slot_id,
          start: slot.start_time,
          end: slot.end_time,
          status: slot.slot_status
        })
      })
    }

    const data = rows.map(r => ({
      ...r,
      slots: slotsMap[r.id] || []
    }))

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      total_amount: totalAmount
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar reservas: ' + error,
    })
  }
})
