// server/api/bookings/status.get.ts
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const { token } = getQuery(event)

    const sql = `
        SELECT 
        b.status, b.total_amount_clp, p.full_name as patient_name,
        prof.first_name || ' ' || prof.last_name as professional_name,
        pt.session_count
        FROM bookings b
        JOIN patients p ON b.patient_id = p.id
        JOIN professionals prof ON b.professional_id = prof.id
        JOIN package_types pt ON b.package_type_id = pt.id
        JOIN payments pay ON b.id = pay.booking_id
        WHERE pay.flow_token = $1
    `

    const { rows } = await query(sql, [token])
    return rows[0] || null
})