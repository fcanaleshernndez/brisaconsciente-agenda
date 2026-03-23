import { query } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const professionalId = queryParams.professional_id

  if (!professionalId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'professional_id es requerido',
    })
  }

  try {
    const { rows } = await query(`
      SELECT 
        pp.id as price_id,
        pt.id as package_id,
        pt.name as package_name,
        pt.session_count,
        pp.price_clp
      FROM professional_prices pp
      JOIN package_types pt ON pp.package_type_id = pt.id
      WHERE pp.professional_id = $1
        AND pp.is_active = true
        AND pt.is_deleted = false
      ORDER BY pt.session_count ASC
    `, [professionalId])

    return rows
  } catch (error: any) {
    console.error('Error querying prices:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar precios: ' + error.message,
    })
  }
})
