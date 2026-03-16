import { query } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID requerido',
      })
    }

    const checkPrices = await query(`
      SELECT COUNT(*) as count FROM professional_prices WHERE package_type_id = $1
    `, [id])

    if (parseInt(checkPrices.rows[0].count) > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'No se puede eliminar el paquete porque hay profesionales con precios asociados',
      })
    }

    const { rows } = await query(`
      DELETE FROM package_types WHERE id = $1 RETURNING id
    `, [id])

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paquete no encontrado',
      })
    }

    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '' + error,
    })
  }
})
