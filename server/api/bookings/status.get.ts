import { query } from '../../utils/db'
import { logError } from '../../utils/logger'
import { encryptId } from '../../utils/id-hash'

export default defineEventHandler(async (event) => {
    const { token, orderId, code } = getQuery(event)

    if (!token && !orderId && !code) {
        throw createError({ statusCode: 400, message: 'Se requiere token, orderId o code' })
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
        OR
        ($3::integer IS NOT NULL AND b.id = $3::integer)
        LIMIT 1
    `

    try {
        let bookingId: number | null = orderId ? parseInt(String(orderId), 10) || null : null
        if (!bookingId && code) {
            const { decryptId } = await import('../../utils/id-hash')
            bookingId = decryptId(String(code))
        }

        const { rows } = await query(sql, [
            token || null,
            bookingId,
            bookingId
        ])
        if (rows.length === 0) return null
        
        const booking = rows[0]
        
        booking.public_code = booking.id ? `BC-${encryptId(booking.id)}` : null
        booking.public_payment_code = booking.payment_id ? `BC-${encryptId(booking.payment_id)}` : null

        const slotsSql = `
            SELECT 
                start_time,
                end_time
            FROM availability_slots
            WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
            ORDER BY start_time
        `
        const { rows: slots } = await query(slotsSql, [booking.id])
        
        return {
            ...booking,
            slots: slots.map(slot => ({
                start_time: slot.start_time,
                end_time: slot.end_time
            }))
        }
    } catch (error) {
        logError({
            endpoint: '/api/bookings/status',
            method: 'GET',
            error: String(error),
            stack: error instanceof Error ? error.stack : undefined,
        })
        throw createError({ statusCode: 500, message: 'Internal Server Error' })
    }
})