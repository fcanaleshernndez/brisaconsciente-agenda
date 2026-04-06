import { query } from "../../../../utils/db";
import { z } from "zod";
import { logError } from "../../../../utils/logger";

const updatePaidSchema = z.object({
  paid: z.boolean()
});

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID requerido",
      })
    }

    const body = await readBody(event)
    const data = updatePaidSchema.parse(body)

    const paid_at = data.paid ? new Date() : null

    const { rows } = await query(`
      UPDATE bookings SET paid_at = $1 WHERE id = $2 RETURNING id, paid_at
    `, [paid_at, id])

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Reserva no encontrada",
      })
    }

    return { success: true, paid_at: rows[0].paid_at }
  } catch (error) {
    logError({
      endpoint: '/api/admin/bookings/:id/paid',
      method: 'PUT',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: "Error al actualizar pago: " + error,
    })
  }
})
