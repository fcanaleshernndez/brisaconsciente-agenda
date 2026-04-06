import { query } from "../../utils/db";
import { z } from "zod";
import { logError } from "../../utils/logger";

const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string()
})

const createSlotSchema = z.object({
  professional_id: z.number().int().positive(),
  date: z.string(),
  slots: z.array(timeSlotSchema).min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parsed = createSlotSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datos inválidos',
      })
    }

    const { professional_id, date, slots } = parsed.data

    const conflicts = []

    for (const slot of slots) {
      const startDateTime = new Date(`${date}T${slot.start}:00`)
      const endDateTime = new Date(`${date}T${slot.end}:00`)

      const checkSql = `
        SELECT start_time, end_time, status 
        FROM availability_slots 
        WHERE professional_id = $1 
          AND (
            (start_time < $3 AND end_time > $2)
            OR
            (start_time >= $2 AND start_time < $3)
            OR
            (start_time = $2)
          )
      `
      
      const { rows } = await query(checkSql, [professional_id, startDateTime, endDateTime])
      
      if (rows.length > 0) {
        conflicts.push({
          start: slot.start,
          end: slot.end,
          existing: rows.map(r => ({
            start: new Date(r.start_time).toISOString().slice(11,16),
            end: new Date(r.end_time).toISOString().slice(11,16),
            status: r.status
          }))
        })
      }
    }

    if (conflicts.length > 0) {
      return { 
        success: false, 
        conflict: true,
        message: 'Existen conflictos con horarios existentes',
        conflicts
      }
    }

    const insertSql = `
      INSERT INTO availability_slots (professional_id, start_time, end_time, status)
      VALUES ($1, $2, $3, 'available')
      RETURNING id
    `

    const createdIds = []
    
    for (const slot of slots) {
      const startDateTime = new Date(`${date}T${slot.start}:00`)
      const endDateTime = new Date(`${date}T${slot.end}:00`)
      
      const { rows } = await query(insertSql, [professional_id, startDateTime, endDateTime])
      createdIds.push(rows[0].id)
    }
    
    return { success: true, created: createdIds.length }
  } catch (error) {
    logError({
      endpoint: '/api/admin/slots',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear horarios: ' + error,
    })
  }
})
