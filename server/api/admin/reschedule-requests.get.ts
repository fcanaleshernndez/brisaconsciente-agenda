import { query } from "../../utils/db"

export default defineEventHandler(async (event) => {
  try {
    const sql = `
      SELECT 
        rh.id,
        rh.created_at as requested_at,
        rh.status,
        rh.completed_at,
        rh.booking_id as original_booking_id,
        rh.new_booking_id,
        s.start_time as original_date,
        s.id as original_slot_id,
        p.id as patient_id,
        p.full_name as patient_name,
        p.email as patient_email,
        prof.id as professional_id,
        prof.first_name || ' ' || prof.last_name as professional_name,
        orig_b.id as original_booking_id
      FROM reschedule_history rh
      JOIN availability_slots s ON s.id = rh.original_slot_id
      JOIN patients p ON p.id = rh.patient_id
      JOIN professionals prof ON prof.id = rh.professional_id
      LEFT JOIN booking_slots bs ON bs.slot_id = rh.original_slot_id
      LEFT JOIN bookings orig_b ON orig_b.id = bs.booking_id
      WHERE rh.status = 'pending'
      ORDER BY rh.created_at DESC
    `

    const { rows } = await query(sql)

    return rows.map(r => ({
      ...r,
      original_date: r.original_date,
      pending: r.status === 'pending'
    }))
  } catch (error) {
    console.error('Error getting reschedule requests:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar solicitudes de reagendamiento'
    })
  }
})
