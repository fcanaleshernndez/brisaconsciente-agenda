import { query } from "../../utils/db";
import { logError } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const { rows } = await query(`
      SELECT id, name FROM specialties ORDER BY name
    `);
    return rows;
  } catch (error) {
    logError({
      endpoint: '/api/admin/specialties',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error conectando a la base de datos',
    });
  }
});
