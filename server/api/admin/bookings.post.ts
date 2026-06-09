import { z } from "zod";
import { sendBookingConfirmationEmail, sendProfessionalNotificationEmail } from "../../utils/email";
import { logError } from "../../utils/logger";
import { createVideoConference } from "../../utils/videoConference";
import { encryptId } from "../../utils/id-hash";

const manualBookingSchema = z.object({
  patient_id: z.number().int().positive("Paciente requerido"),
  professional_id: z.number().int().positive("Profesional requerido"),
  package_type_id: z.number().int().positive("Paquete requerido"),
  slot_ids: z.array(z.number().int().positive()).min(1),
  paid: z.boolean().default(true),
});

function formatDate(dateStr: any) {
  let date
  if (typeof dateStr === 'string') {
    date = new Date(dateStr + 'T00:00:00')
  } else if (dateStr instanceof Date) {
    date = dateStr
  } else {
    date = new Date(dateStr)
  }
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const data = manualBookingSchema.parse(body);
    const client = await (await import("../../utils/db")).useDb().connect()

    try {
      await client.query('BEGIN')

      const priceRes = await client.query(`
        SELECT price_clp FROM professional_prices
        WHERE professional_id = $1 AND package_type_id = $2 AND is_active = true
      `, [data.professional_id, data.package_type_id])

      if (priceRes.rowCount === 0) {
        throw createError({ statusCode: 400, message: 'Precio no encontrado para este profesional y paquete' })
      }

      const total_amount_clp = priceRes.rows[0].price_clp

      const slotsRes = await client.query(`
        SELECT 
          id,
          start_time,
          end_time,
          DATE(start_time) as slot_date,
          TO_CHAR(start_time, 'HH24:MI') as start_time_str,
          TO_CHAR(end_time, 'HH24:MI') as end_time_str
        FROM availability_slots
        WHERE id = ANY($1::int[])
          AND professional_id = $2
          AND status = 'available'
        ORDER BY start_time
      `, [data.slot_ids, data.professional_id])

      if (slotsRes.rowCount !== data.slot_ids.length) {
        throw createError({ statusCode: 409, message: 'Uno o más horarios ya no están disponibles' })
      }

      const slotsForEmail = slotsRes.rows.map(slot => ({
        date: formatDate(slot.slot_date),
        startTime: slot.start_time_str,
        endTime: slot.end_time_str,
        start_time: slot.start_time,
        end_time: slot.end_time,
        meetLink: null
      }))

      const bookingRes = await client.query(`
        INSERT INTO bookings (patient_id, professional_id, package_type_id, total_amount_clp, status, paid_at)
        VALUES ($1, $2, $3, $4, 'manually_confirmed', $5)
        RETURNING id, status, paid_at
      `, [data.patient_id, data.professional_id, data.package_type_id, total_amount_clp, data.paid ? new Date() : null])

      const bookingId = bookingRes.rows[0].id

      for (let i = 0; i < slotsRes.rows.length; i++) {
        const slot = slotsRes.rows[i]
        
        await client.query(`
          INSERT INTO booking_slots (booking_id, slot_id)
          VALUES ($1, $2)
        `, [bookingId, slot.id])

        await client.query(`
          UPDATE availability_slots
          SET status = 'manually_booked'
          WHERE id = $1
        `, [slot.id])
      }

      const firstSlotId = data.slot_ids[0]
      await client.query(`
        UPDATE reschedule_history
        SET new_booking_id = $1, 
            new_slot_id = $2, 
            status = 'completed',
            completed_at = NOW()
        WHERE patient_id = $3 
          AND professional_id = $4 
          AND status = 'pending'
      `, [bookingId, firstSlotId, data.patient_id, data.professional_id])

      await client.query('COMMIT')

      let meetLinks: string[] = []
      
      const meetingData = await client.query(`
        SELECT 
          p.full_name as patient_name,
          p.email as patient_email,
          prof.first_name || ' ' || prof.last_name as professional_name,
          prof.email as professional_email,
          s.name as specialty_name
        FROM bookings b
        JOIN patients p ON p.id = b.patient_id
        JOIN professionals prof ON prof.id = b.professional_id
        JOIN specialties s ON s.id = prof.specialty_id
        WHERE b.id = $1
      `, [bookingId])

      const bookingInfo = meetingData.rows[0]

      for (let i = 0; i < slotsRes.rows.length; i++) {
        const slot = slotsRes.rows[i]
        const slotForEmail: any = slotsForEmail[i]
        
        const meeting = await createVideoConference({
          summary: `Sesión ${i + 1}/${slotsRes.rows.length} - ${bookingInfo.professional_name} con ${bookingInfo.patient_name}`,
          description: `${bookingInfo.specialty_name}`,
          startTime: slot.start_time,
          endTime: slot.end_time,
          patientEmail: bookingInfo.patient_email,
          patientName: bookingInfo.patient_name,
          professionalEmail: bookingInfo.professional_email,
          professionalName: bookingInfo.professional_name,
        })

        await client.query(`
          UPDATE availability_slots
          SET meet_link = $1, calendar_event_id = $2
          WHERE id = $3
        `, [meeting.meetLink, meeting.eventId || null, slot.id])

        slotForEmail.meetLink = meeting.meetLink
        meetLinks.push(meeting.meetLink)
      }

      const emailData = await client.query(`
        SELECT 
          p.full_name as patient_name,
          p.email as patient_email,
          prof.first_name || ' ' || prof.last_name as professional_name,
          prof.email as professional_email,
          s.name as specialty_name,
          pt.name as package_name,
          b.total_amount_clp
        FROM bookings b
        JOIN patients p ON p.id = b.patient_id
        JOIN professionals prof ON prof.id = b.professional_id
        JOIN specialties s ON s.id = prof.specialty_id
        JOIN package_types pt ON pt.id = b.package_type_id
        WHERE b.id = $1
      `, [bookingId])

      if (emailData.rows[0] && slotsForEmail.length > 0) {
        const data = emailData.rows[0]

        const bookingCode = `BC-${encryptId(bookingId)}`

        sendBookingConfirmationEmail(data.patient_email, {
          patientName: data.patient_name,
          professionalName: data.professional_name,
          specialty: data.specialty_name,
          sessions: slotsForEmail,
          amount: data.total_amount_clp,
          bookingId: bookingId,
          bookingCode,
        })

        sendProfessionalNotificationEmail(data.professional_email, {
          professionalName: data.professional_name,
          patientName: data.patient_name,
          specialty: data.specialty_name,
          sessions: slotsForEmail,
          amount: data.total_amount_clp,
          bookingId: bookingId,
          packageName: data.package_name,
        })
      }

      return {
        success: true,
        booking_id: bookingId,
        message: 'Reserva manual creada exitosamente',
      }
      
    } catch (e) {
      await client.query('ROLLBACK')
      logError({
        endpoint: '/api/admin/bookings',
        method: 'POST',
        patient_id: data?.patient_id,
        professional_id: data?.professional_id,
        error: String(e),
        stack: e instanceof Error ? e.stack : undefined
      })
      throw e
    } finally {
      client.release()
    }
  } catch (error) {
    logError({
      endpoint: '/api/admin/bookings',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear reserva manual: ' + error,
    });
  }
});
