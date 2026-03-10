import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const sql = `
      SELECT id, full_name, email, phone, is_minor, guardian_name, created_at
      FROM patients
      ORDER BY full_name
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
