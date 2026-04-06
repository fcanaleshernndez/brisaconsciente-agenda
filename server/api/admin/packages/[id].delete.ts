import { query } from "../../../utils/db";
import { logError } from "../../../utils/logger";

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
      SELECT COUNT(*) as count FROM professional_prices WHERE package_type_id = $1 AND is_active = TRUE
    `, [id])

    if (parseInt(checkPrices.rows[0].count) > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'No se puede desactivar el paquete porque hay precios activos asociados',
      })
    }

    const { rows } = await query(`
      UPDATE package_types SET is_deleted = TRUE WHERE id = $1 RETURNING id
    `, [id])

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Paquete no encontrado',
      })
    }

    return { success: true }
  } catch (error) {
    logError({
      endpoint: '/api/admin/packages/:id',
      method: 'DELETE',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: '' + error,
    })
  }
})
