import { query } from "../utils/db";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const professionalId = queryParams.professional_id;

  if (!professionalId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'professional_id es requerido',
    });
  }

  try {
    // Traemos slots disponibles (status='available') 
    // que sean al menos 24 horas en el futuro
    const sql = `
      SELECT id, start_time, end_time
      FROM availability_slots
      WHERE professional_id = $1
        AND status = 'available'
        AND start_time > NOW() + INTERVAL '24 hours'
        AND start_time < NOW() + INTERVAL '3 months'
      ORDER BY start_time ASC
    `;
    
    const { rows } = await query(sql, [professionalId]);
    return rows;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar disponibilidad',
    });
  }
});