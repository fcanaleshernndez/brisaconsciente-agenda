// server/api/flow/confirm.post.ts
import { useDb } from '../../utils/db'
import { sign } from '../../utils/flow'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body.token

  if (!token) throw createError({ statusCode: 400, message: 'Token missing' })

  const FLOW_API_URL = (process.env.FLOW_API_URL || 'https://www.flow.cl/api').trim()
  const FLOW_API_KEY = (process.env.FLOW_API_KEY || '').trim()
  const FLOW_SECRET_KEY = (process.env.FLOW_SECRET_KEY || '').trim()

  const statusParams: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    token,
  }

  const s = sign(statusParams, FLOW_SECRET_KEY)

  const statusUrl = new URL(`${FLOW_API_URL}/payment/getStatus`)
  statusUrl.searchParams.set('apiKey', FLOW_API_KEY)
  statusUrl.searchParams.set('token', token)
  statusUrl.searchParams.set('s', s)

  const flowRes = await fetch(statusUrl.toString(), {
    method: 'GET'
  })
  const flowStatus = await flowRes.json() as any

  const client = await useDb().connect()

  try {
    await client.query('BEGIN')

    // Buscar el pago y la reserva asociada
    const paymentRes = await client.query(
      'SELECT booking_id FROM payments WHERE flow_token = $1',
      [token]
    )

    if (paymentRes.rowCount === 0) throw new Error('Payment not found')
    const bookingId = paymentRes.rows[0].booking_id

    if (flowStatus.status === 2) { // Status 2 = Pagado en Flow
      // A. ÉXITO: Confirmar reserva y slots
      await client.query(
        "UPDATE bookings SET status = 'confirmed', paid_at = NOW() WHERE id = $1",
        [bookingId]
      )
      await client.query(
        "UPDATE payments SET status = 'paid', paid_at = NOW() WHERE flow_token = $1",
        [token]
      )
      // Marcar slots como 'booked' definitivamente
      await client.query(`
        UPDATE availability_slots 
        SET status = 'booked', held_until = NULL
        WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
      `, [bookingId])

    } else {
      // B. FALLO (Opción A): Cancelar y liberar slots
      await client.query(
        "UPDATE bookings SET status = 'failed', cancelled_at = NOW() WHERE id = $1",
        [bookingId]
      )
      await client.query(
        "UPDATE payments SET status = 'failed' WHERE flow_token = $1",
        [token]
      )
      // Liberar slots para otros usuarios
      await client.query(`
        UPDATE availability_slots 
        SET status = 'available', held_until = NULL
        WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
      `, [bookingId])
    }

    await client.query('COMMIT')
    return { status: 'ok' }

  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})