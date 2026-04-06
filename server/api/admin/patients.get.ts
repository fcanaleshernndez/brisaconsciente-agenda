import { query } from "../../utils/db";
import { logError } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const queryPage = getQuery(event)
    const page = parseInt(String(queryPage.page)) || 1
    const limit = parseInt(String(queryPage.limit)) || 10
    const offset = (page - 1) * limit

    const countSql = `SELECT COUNT(*) as total FROM patients`
    const { rows: countResult } = await query(countSql)
    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    const sql = `
      SELECT id, full_name, email, phone, is_minor, guardian_name, created_at
      FROM patients
      ORDER BY full_name
      LIMIT $1 OFFSET $2
    `
    
    const { rows } = await query(sql, [limit, offset])
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  } catch (error) {
    logError({
      endpoint: '/api/admin/patients',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error conectando a la base de datos',
    })
  }
})
