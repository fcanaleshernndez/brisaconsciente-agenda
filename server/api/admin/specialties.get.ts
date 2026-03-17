import { query } from "../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const { rows } = await query(`
      SELECT id, name FROM specialties ORDER BY name
    `);
    return rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error conectando a la base de datos',
    });
  }
});
