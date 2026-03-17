import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event)
    const professionalId = queryParams.professional_id
    const page = parseInt(String(queryParams.page)) || 1
    const limit = parseInt(String(queryParams.limit)) || 10
    const offset = (page - 1) * limit

    if (!professionalId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere professional_id',
      })
    }

    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const twoMonthsAgoStr = twoMonthsAgo.toISOString()

    const countSql = `
      SELECT COUNT(*) as total 
      FROM availability_slots 
      WHERE professional_id = $1 AND start_time >= $2
    `
    const { rows: countResult } = await query(countSql, [professionalId, twoMonthsAgoStr])
    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    const sql = `
      SELECT 
        s.id, 
        s.professional_id, 
        s.start_time, 
        s.end_time, 
        s.status, 
        s.held_until,
        b.id as booking_id,
        b.status as booking_status,
        b.total_amount_clp,
        b.created_at as booking_created_at,
        b.paid_at,
        p.id as patient_id,
        p.full_name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.is_minor,
        p.guardian_name
      FROM availability_slots s
      LEFT JOIN booking_slots bs ON s.id = bs.slot_id
      LEFT JOIN bookings b ON bs.booking_id = b.id
      LEFT JOIN patients p ON b.patient_id = p.id
      WHERE s.professional_id = $1 AND s.start_time >= $2
      ORDER BY s.start_time DESC
      LIMIT $3 OFFSET $4
    `
    
    const { rows } = await query(sql, [professionalId, twoMonthsAgoStr, limit, offset])
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error conectando a la base de datos',
    })
  }
})
