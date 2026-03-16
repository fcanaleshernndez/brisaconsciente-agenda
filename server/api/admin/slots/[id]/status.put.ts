import { query } from "../../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID requerido',
      })
    }

    const body = await readBody(event)
    const newStatus = body?.status

    if (!newStatus || !['available', 'held', 'booked', 'rescheduled'].includes(newStatus)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Estado inválido',
      })
    }

    const sql = `
      UPDATE availability_slots 
      SET status = $1
      WHERE id = $2
      RETURNING id, status
    `

    const { rows } = await query(sql, [newStatus, id])
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Slot no encontrado',
      })
    }
    
    return { success: true, slot: rows[0] }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar estado: ' + error,
    })
  }
})
