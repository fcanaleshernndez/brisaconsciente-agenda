import { query } from "../../../../utils/db";
import { sendRescheduleNotificationEmail, sendRescheduleProfessionalEmail, sendCancellationPatientEmail, sendCancellationProfessionalEmail } from "../../../../utils/email";
import { logError } from "../../../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID requerido',
      })
    }

    const body = await readBody(event)
    const newStatus = body?.status

    if (!newStatus || !['available', 'held', 'booked', 'rescheduled', 'canceled'].includes(newStatus)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Estado inválido',
      })
    }

    if (newStatus === 'rescheduled') {
      const slotRes = await query(`
        SELECT 
          s.start_time,
          s.end_time,
          s.calendar_event_id,
          p.full_name as patient_name,
          p.email as patient_email,
          p.id as patient_id,
          prof.first_name || ' ' || prof.last_name as professional_name,
          prof.id as professional_id,
          prof.email as professional_email,
          b.id as booking_id
        FROM availability_slots s
        JOIN booking_slots bs ON bs.slot_id = s.id
        JOIN bookings b ON b.id = bs.booking_id
        JOIN patients p ON p.id = b.patient_id
        JOIN professionals prof ON prof.id = s.professional_id
        WHERE s.id = $1
      `, [id])

      if (slotRes.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Slot no encontrado o sin reserva asociada',
        })
      }

      const slot = slotRes.rows[0]

      await query(`UPDATE availability_slots SET status = 'rescheduled' WHERE id = $1`, [id])

      await query(`
        INSERT INTO reschedule_history (booking_id, original_slot_id, patient_id, professional_id, status)
        VALUES ($1, $2, $3, $4, 'pending')
      `, [slot.booking_id, id, slot.patient_id, slot.professional_id])

      const formattedDate = new Date(slot.start_time).toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const startTime = new Date(slot.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      const endTime = new Date(slot.end_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

      if (slot.patient_email) {
        sendRescheduleNotificationEmail(slot.patient_email, {
          patientName: slot.patient_name,
          professionalName: slot.professional_name,
          date: formattedDate,
          time: startTime,
          endTime: endTime,
        })
      }

      if (slot.professional_email) {
        sendRescheduleProfessionalEmail(slot.professional_email, {
          professionalName: slot.professional_name,
          patientName: slot.patient_name,
          date: formattedDate,
          time: startTime,
          endTime: endTime,
        })
      }

      return { success: true, message: 'Slot reagendado y pacientes notificados' }
    }

    if (newStatus === 'canceled') {
      const slotInfo = await query(`
        SELECT status FROM availability_slots WHERE id = $1
      `, [id])

      if (slotInfo.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Slot no encontrado',
        })
      }

      const currentStatus = slotInfo.rows[0].status

      if (currentStatus === 'available') {
        await query(`UPDATE availability_slots SET status = 'canceled' WHERE id = $1`, [id])
        return { success: true, message: 'Horario bloqueado del stepper' }
      }

      const slotRes = await query(`
        SELECT 
          s.start_time,
          s.end_time,
          s.calendar_event_id,
          p.full_name as patient_name,
          p.email as patient_email,
          p.id as patient_id,
          prof.first_name || ' ' || prof.last_name as professional_name,
          prof.id as professional_id,
          prof.email as professional_email,
          b.id as booking_id
        FROM availability_slots s
        JOIN booking_slots bs ON bs.slot_id = s.id
        JOIN bookings b ON b.id = bs.booking_id
        JOIN patients p ON p.id = b.patient_id
        JOIN professionals prof ON prof.id = s.professional_id
        WHERE s.id = $1
      `, [id])

      if (slotRes.rows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Slot no encontrado o sin reserva asociada',
        })
      }

      const slot = slotRes.rows[0]

      await query(`UPDATE availability_slots SET status = 'canceled' WHERE id = $1`, [id])

      const formattedDate = new Date(slot.start_time).toLocaleDateString('es-CL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const startTime = new Date(slot.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      const endTime = new Date(slot.end_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

      if (slot.patient_email) {
        sendCancellationPatientEmail(slot.patient_email, {
          patientName: slot.patient_name,
          professionalName: slot.professional_name,
          date: formattedDate,
          time: startTime,
          endTime: endTime,
        })
      }

      if (slot.professional_email) {
        sendCancellationProfessionalEmail(slot.professional_email, {
          professionalName: slot.professional_name,
          patientName: slot.patient_name,
          date: formattedDate,
          time: startTime,
          endTime: endTime,
        })
      }

      return { success: true, message: 'Slot cancelado y pacientes notificados' }
    }

    const sql = `
      UPDATE availability_slots 
      SET status = $1
      WHERE id = $2
      RETURNING id, status
    `

    const { rows } = await query(sql, [newStatus, id])
    
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Slot no encontrado',
      })
    }
    
    return { success: true, slot: rows[0] }
  } catch (error) {
    logError({
      endpoint: '/api/admin/slots/:id/status',
      method: 'PUT',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar estado: ' + error,
    })
  }
})
