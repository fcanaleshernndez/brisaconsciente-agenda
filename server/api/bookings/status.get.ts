import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const { token, orderId } = getQuery(event)

    if (!token && !orderId) {
        throw createError({ statusCode: 400, message: 'Se requiere token u orderId' })
    }

    const sql = `
        SELECT 
        b.id,
        b.status,
        b.total_amount_clp,
        b.paid_at,
        p.full_name        AS patient_name,
        p.email            AS patient_email,
        prof.first_name || ' ' || prof.last_name AS professional_name,
        pt.name            AS package_name,
        pt.session_count,
        pay.id             AS payment_id,
        pay.flow_token     AS payment_flow_token,
        pay.paid_at        AS payment_paid_at
        FROM bookings b
        JOIN patients p         ON p.id = b.patient_id
        JOIN professionals prof ON prof.id = b.professional_id
        JOIN package_types pt   ON pt.id = b.package_type_id
        LEFT JOIN payments pay  ON pay.booking_id = b.id
        WHERE 
        ($1::text IS NOT NULL AND pay.flow_token = $1)
        OR
        ($2::integer IS NOT NULL AND b.id = $2::integer)
        LIMIT 1
    `

    try {
        const { rows } = await query(sql, [
            token || null,
            orderId || null
        ])
        if (rows.length === 0) return null
        
        const booking = rows[0]
        
        const slotsSql = `
            SELECT 
                DATE(start_time) as slot_date,
                TO_CHAR(start_time, 'HH24:MI') as start_time,
                TO_CHAR(end_time, 'HH24:MI') as end_time
            FROM availability_slots
            WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
            ORDER BY start_time
        `
        const { rows: slots } = await query(slotsSql, [booking.id])
        
        return {
            ...booking,
            slots: slots.map(slot => ({
                date: slot.slot_date instanceof Date 
                    ? slot.slot_date.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : slot.slot_date,
                start_time: slot.start_time,
                end_time: slot.end_time
            }))
        }
    } catch (error) {
        console.error('Error en status.get:', error)
        throw createError({ statusCode: 500, message: 'Internal Server Error' })
    }
})