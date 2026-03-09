import { query } from "#imports";

export default defineEventHandler(async (event) => {
  try {
    const sql = `
      SELECT 
        p.id, p.first_name, p.last_name, p.email, p.is_active,
        p.appointment_duration_minutes,
        s.id as specialty_id, s.name as specialty
      FROM professionals p
      LEFT JOIN specialties s ON p.specialty_id = s.id
      ORDER BY p.first_name, p.last_name
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
