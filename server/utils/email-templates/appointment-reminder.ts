import { EMAIL_CONFIG } from '../email'

export interface AppointmentReminderData {
  patientName: string
  professionalName: string
  specialty: string
  date: string
  time: string
  hoursUntil: number
  meetLink?: string | null
}

function renderMeetLink(meetLink?: string | null): string {
  if (!meetLink) return ''
  if (meetLink.startsWith('http')) {
    return `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Videollamada:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <a href="${meetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4285F4 0%, #6366F1 100%); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">Unirse a la videollamada</a>
        </td>
      </tr>
    `
  }
  return `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Videollamada:</strong></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">${meetLink}</td>
    </tr>
  `
}

export function appointmentReminderTemplate(data: AppointmentReminderData) {
  const timeText = data.hoursUntil <= 24 
    ? 'mañana' 
    : `en ${data.hoursUntil} horas`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #A8D5BA 0%, #B8E6D5 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">${EMAIL_CONFIG.companyName}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">Centro Terapéutico</p>
      </div>
      
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #A8D5BA; margin: 0 0 15px 0; font-size: 18px;">Recordatorio de tu cita</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.patientName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">Te recordamos que tienes una cita programada <strong>${timeText}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Profesional:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.professionalName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Especialidad:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.specialty}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Hora:</strong></td>
            <td style="padding: 8px 0;">${data.time}</td>
          </tr>
          ${renderMeetLink(data.meetLink)}
        </table>
        
        <p style="margin: 0 0 10px 0; font-size: 14px;">Por favor arrive 10 minutos antes para preparar tu sesión.</p>
        <p style="margin: 0 0 10px 0; font-size: 14px;">Si necesitas cancelar o reagendar, contáctanos con la mayor anticipación posible.</p>
        
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #666;">
          Este es un email automático. No respondas directamente a este mensaje.
        </p>
      </div>
    </body>
    </html>
  `
}
