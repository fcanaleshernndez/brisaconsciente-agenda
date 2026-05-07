// server/api/flow/confirm.post.ts
import { useDb } from '../../utils/db'
import { sign } from '../../utils/flow'
import { resend, EMAIL_CONFIG } from '../../utils/email'
import { bookingConfirmationTemplate } from '../../utils/email-templates/booking-confirmation'
import { sendProfessionalNotificationEmail } from '../../utils/email'
import { logError } from '../../utils/logger'
import { createGoogleMeetMeeting } from '../../utils/googleCalendar'
import { formatSpanishDate, formatSpanishTime } from '../../utils/date'

async function getBookingEmailDetails(client: any, bookingId: number) {
  const result = await client.query(`
    SELECT 
      b.id as booking_id,
      b.total_amount_clp,
      p.full_name as patient_name,
      p.email as patient_email,
      prof.first_name || ' ' || prof.last_name as professional_name,
      prof.email as professional_email,
      s.name as specialty_name,
      pt.name as package_name,
      pt.session_count
    FROM bookings b
    JOIN patients p ON p.id = b.patient_id
    JOIN professionals prof ON prof.id = b.professional_id
    JOIN specialties s ON s.id = prof.specialty_id
    JOIN package_types pt ON pt.id = b.package_type_id
    WHERE b.id = $1
  `, [bookingId])
  return result.rows[0] || null
}

async function getBookingSlots(client: any, bookingId: number) {
  const result = await client.query(`
    SELECT 
      asl.id as slot_id,
      asl.start_time,
      asl.end_time,
      asl.meet_link
    FROM availability_slots asl
    JOIN booking_slots bs ON bs.slot_id = asl.id
    WHERE bs.booking_id = $1
    ORDER BY asl.start_time
  `, [bookingId])
  return result.rows
}

async function sendConfirmationEmail(bookingDetails: any, slots: any[]) {
  if (!bookingDetails?.patient_email || slots.length === 0) return
  
  const sessions = slots.map(slot => ({
    date: formatSpanishDate(slot.start_time),
    startTime: formatSpanishTime(slot.start_time),
    endTime: formatSpanishTime(slot.end_time),
    meetLink: slot.meet_link
  }))
  
  const html = bookingConfirmationTemplate({
    patientName: bookingDetails.patient_name,
    professionalName: bookingDetails.professional_name,
    specialty: bookingDetails.specialty_name,
    sessions: sessions,
    amount: bookingDetails.total_amount_clp,
    bookingId: bookingDetails.booking_id,
  })

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: bookingDetails.patient_email,
      subject: `Reserva Confirmada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError)
  }
}

async function sendProfessionalNotification(bookingDetails: any, slots: any[]) {
  if (!bookingDetails?.professional_email || slots.length === 0) return
  
  const sessions = slots.map(slot => ({
    date: formatSpanishDate(slot.start_time),
    startTime: formatSpanishTime(slot.start_time),
    endTime: formatSpanishTime(slot.end_time),
    meetLink: slot.meet_link
  }))
  
  try {
    await sendProfessionalNotificationEmail(bookingDetails.professional_email, {
      professionalName: bookingDetails.professional_name,
      patientName: bookingDetails.patient_name,
      specialty: bookingDetails.specialty_name,
      sessions: sessions,
      amount: bookingDetails.total_amount_clp,
      bookingId: bookingDetails.booking_id,
      packageName: bookingDetails.package_name,
    })
  } catch (emailError) {
    console.error('Error sending professional notification:', emailError)
  }
}

async function createMeetLinksForSlots(client: any, bookingDetails: any, slots: any[], bookingId: number) {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    
    if (!slot.meet_link) {
      try {
        const meeting = await createGoogleMeetMeeting({
          summary: `Sesión ${i + 1}/${slots.length} - ${bookingDetails.professional_name} con ${bookingDetails.patient_name}`,
          description: `${bookingDetails.specialty_name}\nReserva #${bookingId}`,
          startTime: slot.start_time,
          endTime: slot.end_time,
          patientEmail: bookingDetails.patient_email,
          patientName: bookingDetails.patient_name,
          professionalEmail: bookingDetails.professional_email,
          professionalName: bookingDetails.professional_name,
        })

        await client.query(`
          UPDATE availability_slots
          SET meet_link = $1, calendar_event_id = $2
          WHERE id = $3
        `, [meeting.meetLink, meeting.eventId, slot.slot_id])

        slot.meet_link = meeting.meetLink
      } catch (meetError: any) {
        console.error('Error creating Google Meet for slot:', meetError?.message || meetError)
        if (meetError?.response?.data) {
          console.error('Google API error details:', meetError.response.data)
        }
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body.token

  if (!token) throw createError({ statusCode: 400, message: 'Token missing' })

  const FLOW_API_URL = (process.env.FLOW_API_URL || 'https://www.flow.cl/api').trim()
  const FLOW_API_KEY = (process.env.FLOW_API_KEY || '').trim()
  const FLOW_SECRET_KEY = (process.env.FLOW_SECRET_KEY || '').trim()

  const statusParams: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    token,
  }

  const s = sign(statusParams, FLOW_SECRET_KEY)

  const statusUrl = new URL(`${FLOW_API_URL}/payment/getStatus`)
  statusUrl.searchParams.set('apiKey', FLOW_API_KEY)
  statusUrl.searchParams.set('token', token)
  statusUrl.searchParams.set('s', s)

  const flowRes = await fetch(statusUrl.toString(), {
    method: 'GET'
  })
  const flowStatus = await flowRes.json() as any

  const client = await useDb().connect()

  try {
    await client.query('BEGIN')

    const paymentRes = await client.query(
      'SELECT booking_id FROM payments WHERE flow_token = $1',
      [token]
    )

    if (paymentRes.rowCount === 0) throw new Error('Payment not found')
    const bookingId = paymentRes.rows[0].booking_id

    if (flowStatus.status === 2) {
      await client.query(
        "UPDATE bookings SET status = 'confirmed', paid_at = NOW() WHERE id = $1",
        [bookingId]
      )
      await client.query(
        "UPDATE payments SET status = 'paid', paid_at = NOW() WHERE flow_token = $1",
        [token]
      )
      await client.query(`
        UPDATE availability_slots 
        SET status = 'booked', held_until = NULL
        WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
      `, [bookingId])

      const bookingDetails = await getBookingEmailDetails(client, bookingId)
      const slots = await getBookingSlots(client, bookingId)
      
      if (bookingDetails && slots.length > 0) {
        await createMeetLinksForSlots(client, bookingDetails, slots, bookingId)
        await sendConfirmationEmail(bookingDetails, slots)
        await sendProfessionalNotification(bookingDetails, slots)
      }

    } else {
      await client.query(
        "UPDATE bookings SET status = 'failed', cancelled_at = NOW() WHERE id = $1",
        [bookingId]
      )
      await client.query(
        "UPDATE payments SET status = 'failed' WHERE flow_token = $1",
        [token]
      )
      await client.query(`
        UPDATE availability_slots 
        SET status = 'available', held_until = NULL
        WHERE id IN (SELECT slot_id FROM booking_slots WHERE booking_id = $1)
      `, [bookingId])
    }

    await client.query('COMMIT')
    return { status: 'ok' }

  } catch (e) {
    await client.query('ROLLBACK')
    logError({
      endpoint: '/api/flow/confirm',
      method: 'POST',
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined
    })
    throw e
  } finally {
    client.release()
  }
})