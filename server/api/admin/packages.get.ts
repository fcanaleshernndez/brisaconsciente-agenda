import { query } from "../../utils/db";
import { logError } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const sql = `
      SELECT id, name, session_count, is_deleted, created_at
      FROM package_types
      WHERE is_deleted = FALSE
      ORDER BY session_count ASC
    `
    
    const { rows } = await query(sql)
    return rows
  } catch (error) {
    logError({
      endpoint: '/api/admin/packages',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener paquetes',
    })
  }
})
