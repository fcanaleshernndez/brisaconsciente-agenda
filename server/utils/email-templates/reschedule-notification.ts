import { EMAIL_CONFIG } from '../email'

export interface RescheduleNotificationData {
  patientName: string
  professionalName: string
  date: string
  time: string
  endTime: string
}

export function rescheduleNotificationTemplate(data: RescheduleNotificationData) {
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
        <h2 style="color: #60c3e7; margin: 0 0 15px 0; font-size: 18px;">Tu cita necesita ser reagendada</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.patientName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">Lamentamos informarte que tu cita programada ha sido marcada para reagendamiento.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #fff3cd; border-radius: 8px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;"><strong>Fecha cancelada:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; text-decoration: line-through; color: #999;"><strong>Horario cancelado:</strong></td>
            <td style="padding: 8px 0; text-decoration: line-through; color: #999;">${data.time} - ${data.endTime}</td>
          </tr>
        </table>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #A8D5BA; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #155724;">
            <strong>¡No te preocupes!</strong><br>
            Pronto recibirás un nuevo correo con la fecha y hora de tu nueva cita.
          </p>
        </div>
        
        <p style="margin: 0 0 10px 0; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #666;">
          Este es un email automático. No respondas directamente a este mensaje.
        </p>
      </div>
    </body>
    </html>
  `
}
