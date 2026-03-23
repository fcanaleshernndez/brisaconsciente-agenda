import { query } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  try {
    const { rows } = await query(`
      SELECT id, full_name, email, phone
      FROM patients
      ORDER BY full_name
    `)
    return rows
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al consultar pacientes',
    })
  }
})
