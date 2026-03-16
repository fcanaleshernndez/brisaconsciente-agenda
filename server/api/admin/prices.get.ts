import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const professionalId = getQuery(event).professional_id

    if (!professionalId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere professional_id',
      })
    }

    const sql = `
      SELECT 
        pp.id,
        pp.professional_id,
        pp.package_type_id,
        pp.price_clp,
        pp.is_active,
        pt.name as package_name,
        pt.session_count
      FROM professional_prices pp
      JOIN package_types pt ON pp.package_type_id = pt.id
      WHERE pp.professional_id = $1
      ORDER BY pt.session_count ASC
    `
    
    const { rows } = await query(sql, [professionalId])
    return rows
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener precios',
    })
  }
})
