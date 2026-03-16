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

    const { rows } = await query(`
      DELETE FROM professional_prices WHERE id = $1 RETURNING id
    `, [id])

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
      statusMessage: 'Error al eliminar precio: ' + error,
    })
  }
})
