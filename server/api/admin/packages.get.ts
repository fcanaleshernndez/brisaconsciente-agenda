import { query } from "../../utils/db";

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
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener paquetes',
    })
  }
})
