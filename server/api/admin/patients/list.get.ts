import { query } from "../../../utils/db";
import { logError } from "../../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const { rows } = await query(`
      SELECT id, full_name, email, phone
      FROM patients
      ORDER BY full_name
    `)
    return rows
  } catch (error) {
    logError({
      endpoint: '/api/admin/patients/list',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar pacientes',
    })
  }
})
