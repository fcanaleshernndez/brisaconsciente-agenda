// server/api/bookings.post.ts
import { z } from 'zod'
import { useDb } from '../utils/db'
import { BookingsRepo } from '../repos/bookings'
import { flowCreatePayment } from '#imports' 

const bookingSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  professional_id: z.number().int().positive(),
  package_type_id: z.number().int().positive(),
  slot_ids: z.array(z.number().int().positive()).min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Error parseando la información del proceso de agendamiento.' })
  }

  const { name, email, professional_id, package_type_id, slot_ids } = parsed.data
  const client = await useDb().connect()

  try {
    await client.query('BEGIN')

    // 1. Precio real desde DB (nunca del frontend)
    const priceRes = await client.query(`
      SELECT price_clp FROM professional_prices
      WHERE professional_id = $1 AND package_type_id = $2 AND is_active = true
    `, [professional_id, package_type_id])

    if (priceRes.rowCount === 0) {
      throw createError({ statusCode: 400, message: 'Precio no encontrado para este profesional y paquete' })
    }

    const total_amount_clp = priceRes.rows[0].price_clp

    // 2. Validar que los slots están disponibles y pertenecen al profesional
    const slotsRes = await client.query(`
      SELECT COUNT(*) as count FROM availability_slots
      WHERE id = ANY($1::int[])
        AND professional_id = $2
        AND status = 'available'
    `, [slot_ids, professional_id])

    if (parseInt(slotsRes.rows[0].count) !== slot_ids.length) {
      throw createError({ statusCode: 409, message: 'Uno o más horarios ya no están disponibles' })
    }

    // 3. Crear booking + paciente + booking_slots + hold de slots
    const bookingId = await BookingsRepo.create(client, {
      name, email, professional_id, package_type_id,
      total_amount_clp,
      slot_ids
    })

    // 4. Llamar a Flow (producción)
    const order = `BC-${bookingId}`
    const { url, token } = await flowCreatePayment({
      subject: `Brisa Consciente - Reserva ${order}`,
      amount: total_amount_clp,
      commerceOrder: order,
      email,
      urlConfirmation: process.env.FLOW_URL_CONFIRM!,
      urlReturn: process.env.FLOW_URL_RETURN!,
    })

    // 5. Guardar datos de pago en tabla payments
    await BookingsRepo.attachPayment(client, {
      booking_id: bookingId,
      flow_order_id: order,
      flow_token: token
    })

    await client.query('COMMIT')

    return {
      success: true,
      booking_id: bookingId,
      flow_url: `${url}?token=${token}`
    }

  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
})