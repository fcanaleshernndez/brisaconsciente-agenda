import { query } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const professionalId = body?.professional_id

    if (!professionalId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere professional_id',
      })
    }

    const sql = `
      DELETE FROM availability_slots
      WHERE professional_id = $1
        AND status = 'available'
        AND start_time < CURRENT_DATE - INTERVAL '1 day'
      RETURNING id
    `

    const { rows } = await query(sql, [professionalId])
    return { deleted: rows.length }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al eliminar horarios',
    })
  }
})
