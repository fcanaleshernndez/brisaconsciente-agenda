import { query } from "./db";

export interface LogError {
  endpoint: string
  method?: string
  error: string
  stack?: string
  body?: any
  params?: any
  slot_id?: number
  booking_id?: number
  patient_id?: number
  professional_id?: number
}

export async function logError(context: LogError) {
  try {
    await query(`
      INSERT INTO app_logs (level, message, context)
      VALUES ('ERROR', $1, $2)
    `, [context.endpoint, JSON.stringify(context)])
  } catch (error) {
    console.error('Failed to write error log to database:', error)
    console.error(`[ERROR] ${context.endpoint}:`, context)
  }
}
