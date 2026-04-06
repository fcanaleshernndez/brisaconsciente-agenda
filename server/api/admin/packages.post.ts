import { query } from "../../utils/db";
import { z } from "zod";
import { logError } from "../../utils/logger";

const createPackageSchema = z.object({
  name: z.string().min(1),
  session_count: z.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parsed = createPackageSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos inválidos',
      })
    }

    const { name, session_count } = parsed.data

    const sql = `
      INSERT INTO package_types (name, session_count)
      VALUES ($1, $2)
      RETURNING id, name, session_count
    `

    const { rows } = await query(sql, [name, session_count])
    
    return { success: true, package: rows[0] }
  } catch (error) {
    logError({
      endpoint: '/api/admin/packages',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear paquete: ' + error,
    })
  }
})
