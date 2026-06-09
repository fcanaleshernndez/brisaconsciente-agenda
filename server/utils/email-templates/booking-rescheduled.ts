import { EMAIL_CONFIG } from '../email'

export interface BookingRescheduledData {
  patientName: string
  professionalName: string
  specialty: string
  oldDate: string
  oldTime: string
  newDate: string
  newTime: string
  bookingCode: string
}

export function bookingRescheduledTemplate(data: BookingRescheduledData) {
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
        <h2 style="color: #60c3e7; margin: 0 0 15px 0; font-size: 18px;">¡Cita Reagendada!</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.patientName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">Tu cita ha sido reagendada exitosamente. Estos son tus nuevos datos:</p>
        
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
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Fecha anterior:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;">${data.oldDate} - ${data.oldTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nueva fecha:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #60c3e7; font-weight: bold;">${data.newDate} - ${data.newTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Código:</strong></td>
            <td style="padding: 8px 0;">${data.bookingCode}</td>
          </tr>
        </table>
        
        <p style="margin: 0 0 10px 0; font-size: 14px;">Te esperamos en tu nueva fecha y hora.</p>
        
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #666;">
          Este es un email automático. No respondas directamente a este mensaje.
        </p>
      </div>
    </body>
    </html>
  `
}
