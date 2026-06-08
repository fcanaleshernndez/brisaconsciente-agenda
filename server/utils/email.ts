import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_CONFIG: any = {
  from: process.env.EMAIL_FROM,
  companyName: 'Brisa Consciente',
  website: process.env.NUXT_PUBLIC_URL || 'https://brisaconsciente.cl',
}

export interface Session {
  date: string
  startTime: string
  endTime: string
  meetLink?: string | null
}

export async function sendBookingConfirmationEmail(patientEmail: string, data: {
  patientName: string
  professionalName: string
  specialty: string
  sessions: Session[]
  amount: number
  bookingId: number
}) {
  const { bookingConfirmationTemplate } = await import('./email-templates/booking-confirmation')
  
  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(data.amount)

  const html = bookingConfirmationTemplate({
    ...data,
    amount: formattedAmount as any,
  })

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: patientEmail,
      subject: `Reserva Confirmada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendProfessionalNotificationEmail(professionalEmail: string, data: {
  professionalName: string
  patientName: string
  specialty: string
  sessions: Session[]
  amount: number
  bookingId: number
  packageName: string
}) {
  const { professionalNotificationTemplate } = await import('./email-templates/professional-notification')
  
  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(data.amount)

  const html = professionalNotificationTemplate({
    ...data,
    amount: formattedAmount as any,
  })

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: professionalEmail,
      subject: `Nueva Reserva Asignada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending professional notification email:', error)
    return { success: false, error }
  }
}

export async function sendRescheduleNotificationEmail(patientEmail: string, data: {
  patientName: string
  professionalName: string
  date: string
  time: string
  endTime: string
}) {
  const { rescheduleNotificationTemplate } = await import('./email-templates/reschedule-notification')

  const html = rescheduleNotificationTemplate(data)

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: patientEmail,
      subject: `Tu cita necesita ser reagendada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending reschedule notification email:', error)
    return { success: false, error }
  }
}

export async function sendRescheduleProfessionalEmail(professionalEmail: string, data: {
  professionalName: string
  patientName: string
  date: string
  time: string
  endTime: string
}) {
  const { rescheduleProfessionalNotificationTemplate } = await import('./email-templates/reschedule-professional-notification')

  const html = rescheduleProfessionalNotificationTemplate(data)

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: professionalEmail,
      subject: `Cita marcada para reagendamiento - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending professional reschedule notification email:', error)
    return { success: false, error }
  }
}

export async function sendCancellationPatientEmail(patientEmail: string, data: {
  patientName: string
  professionalName: string
  date: string
  time: string
  endTime: string
}) {
  const { cancellationPatientTemplate } = await import('./email-templates/cancellation-notification')

  const html = cancellationPatientTemplate(data)

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: patientEmail,
      subject: `Tu cita ha sido cancelada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending cancellation email to patient:', error)
    return { success: false, error }
  }
}

export async function sendCancellationProfessionalEmail(professionalEmail: string, data: {
  professionalName: string
  patientName: string
  date: string
  time: string
  endTime: string
}) {
  const { cancellationProfessionalTemplate } = await import('./email-templates/cancellation-notification')

  const html = cancellationProfessionalTemplate(data)

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: professionalEmail,
      subject: `Cita cancelada - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending cancellation email to professional:', error)
    return { success: false, error }
  }
}

export async function sendReminderEmail(data: {
  patientEmail: string
  patientName: string
  professionalName: string
  date: string
  time: string
  meetLink?: string | null
  sessionType: string
  packageName: string
}) {
  const { appointmentReminderTemplate } = await import('./email-templates/appointment-reminder')

  const html = appointmentReminderTemplate({
    patientName: data.patientName,
    professionalName: data.professionalName,
    specialty: data.sessionType,
    date: data.date,
    time: data.time,
    hoursUntil: 24,
    meetLink: data.meetLink,
  })

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.patientEmail,
      subject: `Recordatorio de tu sesión - ${EMAIL_CONFIG.companyName}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return { success: false, error }
  }
}
