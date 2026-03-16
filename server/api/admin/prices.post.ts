import { query } from "../../utils/db";
import { z } from "zod";

const createPriceSchema = z.object({
  professional_id: z.number().int().positive(),
  package_type_id: z.number().int().positive(),
  price_clp: z.number().int().nonnegative(),
  is_active: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parsed = createPriceSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos inválidos',
      })
    }

    const { professional_id, package_type_id, price_clp, is_active } = parsed.data

    const checkSql = `
      SELECT id FROM professional_prices 
      WHERE professional_id = $1 AND package_type_id = $2
    `
    const { rows: existing } = await query(checkSql, [professional_id, package_type_id])
    
    if (existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un precio para este profesional y paquete',
      })
    }

    const sql = `
      INSERT INTO professional_prices (professional_id, package_type_id, price_clp, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `

    const { rows } = await query(sql, [professional_id, package_type_id, price_clp, is_active])
    
    return { success: true, id: rows[0].id }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear precio: ' + error,
    })
  }
})
