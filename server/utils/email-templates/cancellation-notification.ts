import { EMAIL_CONFIG } from '../email'

export interface CancellationPatientData {
  patientName: string
  professionalName: string
  date: string
  time: string
  endTime: string
}

export function cancellationPatientTemplate(data: CancellationPatientData) {
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
        <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 18px;">Tu cita ha sido cancelada</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.patientName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">Te informamos que tu cita ha sido cancelada.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>Profesional:</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${data.professionalName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;"><strong>Fecha cancelada:</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; text-decoration: line-through; color: #999;"><strong>Horario cancelado:</strong></td>
            <td style="padding: 10px 12px; text-decoration: line-through; color: #999;">${data.time} - ${data.endTime}</td>
          </tr>
        </table>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            Si deseas agendar una nueva cita, por favor contactanos o reserva nuevamente a través de nuestro sitio web.
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

export interface CancellationProfessionalData {
  professionalName: string
  patientName: string
  date: string
  time: string
  endTime: string
}

export function cancellationProfessionalTemplate(data: CancellationProfessionalData) {
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
        <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 18px;">Cita cancelada</h2>
        
        <p style="margin: 0 0 10px 0;">Hola <strong>${data.professionalName}</strong>,</p>
        <p style="margin: 0 0 15px 0;">Te informamos que la siguiente cita ha sido cancelada:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;"><strong>Paciente:</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${data.patientName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;"><strong>Fecha cancelada:</strong></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-decoration: line-through; color: #999;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; text-decoration: line-through; color: #999;"><strong>Horario cancelado:</strong></td>
            <td style="padding: 10px 12px; text-decoration: line-through; color: #999;">${data.time} - ${data.endTime}</td>
          </tr>
        </table>

        <p style="margin: 0 0 10px 0; font-size: 14px;">Este horario queda disponible para ser asignado a otra cita.</p>
        
        <p style="margin: 20px 0 0 0; font-size: 11px; color: #666;">
          Este es un email automático. No respondas directamente a este mensaje.
        </p>
      </div>
    </body>
    </html>
  `
}
