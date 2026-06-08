import { EMAIL_CONFIG } from '../email'

export interface Session {
  date: string
  startTime: string
  endTime: string
  meetLink?: string | null
}

export interface ProfessionalNotificationData {
  professionalName: string
  patientName: string
  specialty: string
  sessions: Session[]
  amount: number | string
  bookingId: number
  packageName: string
}

export function professionalNotificationTemplate(data: ProfessionalNotificationData) {
  const formattedAmount = typeof data.amount === 'string' 
    ? data.amount 
    : new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(data.amount)

  const sessionsRows = data.sessions.map((session, index) => {
    let meetLinkHtml: string
    if (!session.meetLink) {
      meetLinkHtml = '<span style="color: #999; font-size: 12px;">Pendiente</span>'
    } else if (session.meetLink.startsWith('http')) {
      meetLinkHtml = `<a href="${session.meetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4285F4 0%, #6366F1 100%); color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; white-space: nowrap;">Unirse</a>`
    } else {
      meetLinkHtml = `<span style="color: #666; font-size: 11px;">${session.meetLink}</span>`
    }
    
    return `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${session.date}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${session.startTime} - ${session.endTime}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #eee; text-align: center;">${meetLinkHtml}</td>
    </tr>
  `}).join('')

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
        <h2 style="color: #A8D5BA; margin: 0 0 15px 0; font-size: 18px;">Nueva Reserva Asignada</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.professionalName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">El paciente <strong>${data.patientName}</strong> ha reservado las siguientes sesiones contigo.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Especialidad:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.specialty}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Paquete:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.packageName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total:</strong></td>
            <td style="padding: 8px 0;">${formattedAmount}</td>
          </tr>
        </table>

        <h3 style="color: #60c3e7; margin: 0 0 10px 0; font-size: 14px;">Sesiones programadas:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #f8f9fa; border-radius: 8px;">
          <thead>
            <tr style="background: #A8D5BA;">
              <th style="padding: 8px; text-align: center; color: white; font-size: 12px;">#</th>
              <th style="padding: 8px; text-align: left; color: white; font-size: 12px;">Fecha</th>
              <th style="padding: 8px; text-align: left; color: white; font-size: 12px;">Horario</th>
              <th style="padding: 8px; text-align: center; color: white; font-size: 12px;">Videollamada</th>
            </tr>
          </thead>
          <tbody>
            ${sessionsRows}
          </tbody>
        </table>
                 
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #666;">
          Este es un email automático. No respondas directamente a este mensaje.
        </p>
      </div>
    </body>
    </html>
  `
}
