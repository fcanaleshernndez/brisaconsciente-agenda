import { query } from "../../../utils/db";
import { z } from "zod";
import { logError } from "../../../utils/logger";

const updatePatientSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  is_minor: z.boolean().default(false),
  guardian_name: z.string().optional(),
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
    const data = updatePatientSchema.parse(body);

    if (data.is_minor && !data.guardian_name) {
      throw createError({
        statusCode: 400,
        statusMessage: "El nombre del responsable es requerido para menores de edad",
      });
    }

    const existing = await query(
      `SELECT id FROM patients WHERE email = $1 AND id != $2`,
      [data.email, id]
    );

    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe otro paciente con ese email",
      });
    }

    const { rows } = await query(
      `UPDATE patients 
       SET full_name = $1, email = $2, phone = $3, is_minor = $4, guardian_name = $5
       WHERE id = $6
       RETURNING id, full_name, email, phone, is_minor, guardian_name, created_at`,
      [
        data.full_name,
        data.email,
        data.phone || null,
        data.is_minor,
        data.is_minor ? data.guardian_name : null,
        id,
      ]
    );

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Paciente no encontrado",
      });
    }

    return rows[0];
  } catch (error) {
    logError({
      endpoint: '/api/admin/patients/:id',
      method: 'PUT',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: "Error al actualizar paciente: " + error,
    });
  }
});
