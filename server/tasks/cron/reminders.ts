// server/tasks/cron/reminders.ts
import { formatSpanishDate, formatSpanishTime } from '../../utils/date'
import { sendReminderEmail } from '../../utils/email'
import { encryptId } from '../../utils/id-hash'
import { useDb } from '../../utils/db'

export default defineTask({
  meta: {
    name: 'reminders',
    description: 'Envía emails de recordatorio para sesiones en las próximas 24 horas'
  },
  async run() {
    try {
      const pool = useDb()

      // Get bookings with slots in the next 24 hours that haven't had reminders sent
      const query = `
        SELECT
          b.id as booking_id,
          pt.name as package_name,
          p.full_name as patient_name,
          p.email as patient_email,
          prof.first_name || ' ' || prof.last_name as professional_name,
          s.name as specialty_name,
          sl.start_time,
          sl.meet_link
        FROM bookings b
        INNER JOIN patients p ON b.patient_id = p.id
        INNER JOIN professionals prof ON b.professional_id = prof.id
        INNER JOIN specialties s ON prof.specialty_id = s.id
        INNER JOIN package_types pt ON b.package_type_id = pt.id
        INNER JOIN booking_slots bs ON b.id = bs.booking_id
        INNER JOIN availability_slots sl ON bs.slot_id = sl.id
        WHERE (b.status = 'confirmed' OR b.status = 'manually_confirmed')
          AND sl.start_time > NOW()
          AND sl.start_time <= NOW() + INTERVAL '24 hours'
          AND b.reminder_sent_at IS NULL
        ORDER BY sl.start_time ASC
      `

      const result = await pool.query(query)
      const bookings = result.rows

      let sentCount = 0
      let errorCount = 0

      for (const booking of bookings) {
        try {
          const date = formatSpanishDate(booking.start_time)
          const time = formatSpanishTime(booking.start_time)

          const bookingCode = `BC-${encryptId(booking.booking_id)}`

          const emailResult = await sendReminderEmail({
            patientEmail: booking.patient_email,
            patientName: booking.patient_name,
            professionalName: booking.professional_name,
            date,
            time,
            meetLink: booking.meet_link,
            sessionType: booking.specialty_name,
            packageName: booking.package_name,
            bookingCode,
          })

          if (emailResult.success) {
            await pool.query(
              'UPDATE bookings SET reminder_sent_at = NOW() WHERE id = $1',
              [booking.booking_id]
            )
            sentCount++
          } else {
            errorCount++
          }
        } catch (err) {
          console.error(`Error sending reminder for booking ${booking.booking_id}:`, err)
          errorCount++
        }
      }

      console.log(`[CRON:reminders] Procesados ${bookings.length} - enviados ${sentCount}, errores ${errorCount}`)

      return {
        result: 'OK',
        processed: bookings.length,
        sent: sentCount,
        errors: errorCount
      }
    } catch (error: any) {
      console.error('[CRON:reminders] Error:', error)
      return {
        result: 'ERROR',
        error: error.message
      }
    }
  }
})
