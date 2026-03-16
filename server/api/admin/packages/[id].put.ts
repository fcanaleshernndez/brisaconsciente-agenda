import { query } from "../../../utils/db";
import { z } from "zod";

const updatePackageSchema = z.object({
  name: z.string().min(1),
  session_count: z.number().int().positive()
})

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
    const parsed = updatePackageSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos inválidos',
      })
    }

    const { name, session_count } = parsed.data

    const sql = `
      UPDATE package_types 
      SET name = $1, session_count = $2
      WHERE id = $3
      RETURNING id, name, session_count
    `

    const { rows } = await query(sql, [name, session_count, id])
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paquete no encontrado',
      })
    }
    
    return { success: true, package: rows[0] }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar paquete: ' + error,
    })
  }
})
