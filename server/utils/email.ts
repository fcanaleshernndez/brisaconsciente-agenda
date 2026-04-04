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
