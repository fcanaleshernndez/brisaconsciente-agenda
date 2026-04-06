import { query } from "../../utils/db";
import { logError } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const page = parseInt(String(queryParams.page)) || 1
  const limit = parseInt(String(queryParams.limit)) || 50
  const offset = (page - 1) * limit
  
  const level = queryParams.level as string | undefined
  const dateFrom = queryParams.date_from as string | undefined
  const dateTo = queryParams.date_to as string | undefined
  const search = queryParams.search as string | undefined

  try {
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (dateFrom) {
      whereClause += ` AND created_at >= $${paramIndex}`
      params.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      whereClause += ` AND created_at <= $${paramIndex}`
      params.push(dateTo + 'T23:59:59')
      paramIndex++
    }

    if (search) {
      whereClause += ` AND (message ILIKE $${paramIndex} OR context::text ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    const countSql = `SELECT COUNT(*) as total FROM app_logs ${whereClause}`
    const { rows: countResult } = await query(countSql, params)
    const total = parseInt(countResult[0].total)
    const totalPages = Math.ceil(total / limit)

    const dataSql = `
      SELECT id, level, message, context, created_at
      FROM app_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const { rows } = await query(dataSql, params)

    const logs = rows.map(r => {
      let parsedContext = null
      if (r.context) {
        if (typeof r.context === 'string') {
          try {
            parsedContext = JSON.parse(r.context)
          } catch {
            parsedContext = r.context
          }
        } else {
          parsedContext = r.context
        }
      }
      return {
        ...r,
        context: parsedContext
      }
    })

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
    
  } catch (error) {
    logError({
      endpoint: '/api/admin/logs',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar logs: ' + error,
    })
  }
})
