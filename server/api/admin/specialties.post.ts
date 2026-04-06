import { query } from "../../utils/db";
import { z } from "zod";
import { logError } from "../../utils/logger";

const createSpecialtySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = createSpecialtySchema.parse(body);

    const existing = await query(
      `SELECT id FROM specialties WHERE LOWER(name) = LOWER($1)`,
      [data.name]
    );

    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe una especialidad con ese nombre",
      });
    }

    const { rows } = await query(
      `INSERT INTO specialties (name) VALUES ($1) RETURNING id, name`,
      [data.name]
    );

    return rows[0];
  } catch (error) {
    logError({
      endpoint: '/api/admin/specialties',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: "Error al crear especialidad: " + error,
    });
  }
});
