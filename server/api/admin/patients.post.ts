import { query } from "../../utils/db";
import { z } from "zod";
import { logError } from "../../utils/logger";

const createPatientSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  is_minor: z.boolean().default(false),
  guardian_name: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = createPatientSchema.parse(body);

    if (data.is_minor && !data.guardian_name) {
      throw createError({
        statusCode: 400,
        statusMessage: "El nombre del responsable es requerido para menores de edad",
      });
    }

    const existing = await query(
      `SELECT id FROM patients WHERE email = $1`,
      [data.email]
    );

    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "Ya existe un paciente con ese email",
      });
    }

    const { rows } = await query(
      `INSERT INTO patients (full_name, email, phone, is_minor, guardian_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, phone, is_minor, guardian_name, created_at`,
      [
        data.full_name,
        data.email,
        data.phone || null,
        data.is_minor,
        data.is_minor ? data.guardian_name : null,
      ]
    );

    return rows[0];
  } catch (error) {
    logError({
      endpoint: '/api/admin/patients',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: "Error al crear paciente: " + error,
    });
  }
});
