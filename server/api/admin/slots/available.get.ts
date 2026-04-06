import { query } from "../../../utils/db";
import { logError } from "../../../utils/logger";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const professionalId = queryParams.professional_id

  if (!professionalId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'professional_id es requerido',
    })
  }

  try {
    const sql = `
      SELECT id, start_time, end_time
      FROM availability_slots
      WHERE professional_id = $1
        AND status = 'available'
        AND start_time > NOW() + INTERVAL '24 hours'
        AND start_time < NOW() + INTERVAL '3 months'
      ORDER BY start_time ASC
    `

    const { rows } = await query(sql, [professionalId])
    return rows
  } catch (error) {
    logError({
      endpoint: '/api/admin/slots/available',
      method: 'GET',
      professional_id: professionalId ? parseInt(String(professionalId)) : undefined,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar disponibilidad',
    })
  }
})
