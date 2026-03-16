import { query } from "../../../utils/db";
import { z } from "zod";

const updatePriceSchema = z.object({
  price_clp: z.number().int().nonnegative(),
  is_active: z.boolean()
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
    const parsed = updatePriceSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos inválidos',
      })
    }

    const { price_clp, is_active } = parsed.data

    const sql = `
      UPDATE professional_prices 
      SET price_clp = $1, is_active = $2
      WHERE id = $3
      RETURNING id
    `

    const { rows } = await query(sql, [price_clp, is_active, id])
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Precio no encontrado',
      })
    }
    
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar precio: ' + error,
    })
  }
})
