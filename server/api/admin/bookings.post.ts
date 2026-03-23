import { z } from "zod";

const manualBookingSchema = z.object({
  patient_id: z.number().int().positive("Paciente requerido"),
  professional_id: z.number().int().positive("Profesional requerido"),
  package_type_id: z.number().int().positive("Paquete requerido"),
  slot_ids: z.array(z.number().int().positive()).min(1),
  paid: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = manualBookingSchema.parse(body);
    const client = await (await import("../../utils/db")).useDb().connect()

    try {
      await client.query('BEGIN')

      const priceRes = await client.query(`
        SELECT price_clp FROM professional_prices
        WHERE professional_id = $1 AND package_type_id = $2 AND is_active = true
      `, [data.professional_id, data.package_type_id])

      if (priceRes.rowCount === 0) {
        throw createError({ statusCode: 400, message: 'Precio no encontrado para este profesional y paquete' })
      }

      const total_amount_clp = priceRes.rows[0].price_clp

      const slotsRes = await client.query(`
        SELECT COUNT(*) as count FROM availability_slots
        WHERE id = ANY($1::int[])
          AND professional_id = $2
          AND status = 'available'
      `, [data.slot_ids, data.professional_id])

      if (parseInt(slotsRes.rows[0].count) !== data.slot_ids.length) {
        throw createError({ statusCode: 409, message: 'Uno o más horarios ya no están disponibles' })
      }

      const bookingRes = await client.query(`
        INSERT INTO bookings (patient_id, professional_id, package_type_id, total_amount_clp, status, paid_at)
        VALUES ($1, $2, $3, $4, 'manually_confirmed', $5)
        RETURNING id, status, paid_at
      `, [data.patient_id, data.professional_id, data.package_type_id, total_amount_clp, data.paid ? new Date() : null])

      const bookingId = bookingRes.rows[0].id

      for (const slotId of data.slot_ids) {
        await client.query(`
          INSERT INTO booking_slots (booking_id, slot_id)
          VALUES ($1, $2)
        `, [bookingId, slotId])

        await client.query(`
          UPDATE availability_slots
          SET status = 'manually_booked'
          WHERE id = $1
        `, [slotId])
      }

      await client.query('COMMIT')

      return {
        success: true,
        booking_id: bookingId,
        message: 'Reserva manual creada exitosamente'
      }
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear reserva manual: ' + error,
    });
  }
});
