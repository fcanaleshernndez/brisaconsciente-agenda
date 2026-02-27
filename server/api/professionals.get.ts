import { query } from "../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const sql = `
      SELECT 
        p.id, p.first_name, p.last_name, s.name as specialty,
        json_agg(json_build_object(
          'package_id', pt.id,
          'package_name', pt.name,
          'sessions', pt.session_count,
          'price', pp.price_clp
        )) as pricing
      FROM professionals p
      JOIN specialties s ON p.specialty_id = s.id
      JOIN professional_prices pp ON p.id = pp.professional_id
      JOIN package_types pt ON pp.package_type_id = pt.id
      WHERE p.is_active = true AND pp.is_active = true
      GROUP BY p.id, s.name
    `;
    
    const { rows } = await query(sql);
    return rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error conectando a la base de datos',
    });
  }
});