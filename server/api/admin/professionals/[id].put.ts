import { query } from "../../../utils/db";
import { z } from "zod";
import { logError } from "../../../utils/logger";

const updateProfessionalSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  specialty_id: z.number().positive("Especialidad requerida"),
  appointment_duration_minutes: z.number().positive().default(60),
  is_active: z.boolean().default(true),
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
    const data = updateProfessionalSchema.parse(body);

    const existing = await query(
      `SELECT id FROM professionals WHERE email = $1 AND id != $2`,
      [data.email, id]
    );

    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe otro profesional con ese email",
      });
    }

    const { rows } = await query(
      `UPDATE professionals 
       SET first_name = $1, last_name = $2, email = $3, specialty_id = $4, 
           appointment_duration_minutes = $5, is_active = $6
       WHERE id = $7
       RETURNING id, first_name, last_name, email, is_active, appointment_duration_minutes`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.specialty_id,
        data.appointment_duration_minutes,
        data.is_active,
        id,
      ]
    );

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profesional no encontrado",
      });
    }

    const professional = rows[0];

    const specialtyResult = await query(
      `SELECT name FROM specialties WHERE id = $1`,
      [data.specialty_id]
    );

    return {
      ...professional,
      specialty_id: data.specialty_id,
      specialty: specialtyResult.rows[0]?.name,
    };
  } catch (error) {
    logError({
      endpoint: '/api/admin/professionals/:id',
      method: 'PUT',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: "Error al actualizar profesional: " + error,
    });
  }
});
