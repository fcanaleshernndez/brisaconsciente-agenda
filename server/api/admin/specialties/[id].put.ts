import { query } from "../../../utils/db";
import { z } from "zod";

const updateSpecialtySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID requerido",
      });
    }

    const body = await readBody(event);
    const data = updateSpecialtySchema.parse(body);

    const existing = await query(
      `SELECT id FROM specialties WHERE LOWER(name) = LOWER($1) AND id != $2`,
      [data.name, id]
    );

    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe otra especialidad con ese nombre",
      });
    }

    const { rows } = await query(
      `UPDATE specialties SET name = $1 WHERE id = $2 RETURNING id, name`,
      [data.name, id]
    );

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Especialidad no encontrada",
      });
    }

    return rows[0];
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error al actualizar especialidad: " + error,
    });
  }
});
