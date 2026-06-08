import { exchangeCodeForToken } from '../../../utils/googleCalendar'

function getBaseUrl(event: any): string {
  const host = getHeader(event, 'host') || process.env.NUXT_PUBLIC_URL || ''
  const proto = getHeader(event, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const error = query.error as string

  if (error) {
    return sendError(event, createError({
      statusCode: 400,
      message: 'Autorización rechazada: ' + error,
    }))
  }

  if (!code) {
    return sendError(event, createError({
      statusCode: 400,
      message: 'Código de autorización requerido',
    }))
  }

  try {
    const tokens = await exchangeCodeForToken(code, getBaseUrl(event))

    if (!tokens.refresh_token) {
      setResponseStatus(event, 200)
      setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Google Auth - Brisa Consciente</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 16px; border-radius: 8px; margin: 20px 0; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 14px; word-break: break-all; }
        </style>
        </head>
        <body>
          <h2>Autorización Exitosa</h2>
          <div class="warning">
            <strong>Importante:</strong> Google no devolvió un nuevo refresh_token.
            Esto ocurre porque ya existe un refresh_token válido.
            Si el actual está funcionando, no necesitas hacer nada.
          </div>
          <p>Access Token obtenido correctamente.</p>
          <p><a href="/admin">Volver al panel</a></p>
        </body>
        </html>
      `
    }

    const newRefreshToken = tokens.refresh_token

    setResponseStatus(event, 200)
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Google Auth - Brisa Consciente</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
        .success { background: #d4edda; border: 1px solid #28a745; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .token-box { background: #f8f9fa; border: 1px solid #ddd; padding: 16px; border-radius: 8px; margin: 20px 0; }
        code { display: block; background: #f4f4f4; padding: 12px; border-radius: 4px; font-size: 13px; word-break: break-all; margin: 10px 0; border: 1px solid #e0e0e0; }
        .btn { display: inline-block; padding: 8px 16px; background: #A8D5BA; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px; }
        .hint { color: #666; font-size: 14px; }
      </style>
      </head>
      <body>
        <h2>Nuevo Token Generado</h2>
        <div class="success">Autorización de Google Calendar exitosa.</div>
        <div class="token-box">
          <strong>Nuevo GOOGLE_REFRESH_TOKEN:</strong>
          <code>${newRefreshToken}</code>
        </div>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>Copia el token de arriba</li>
          <li>Ve a Railway &rarr; Variables &rarr; pega en <code>GOOGLE_REFRESH_TOKEN</code></li>
          <li>Reinicia la app en Railway</li>
        </ol>
        <a href="/admin" class="btn">Volver al panel</a>
      </body>
      </html>
    `
  } catch (error: any) {
    setResponseStatus(event, 500)
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Error - Google Auth</title></head>
      <body style="font-family: Arial; max-width: 600px; margin: 40px auto; padding: 20px;">
        <h2>Error de Autorización</h2>
        <p style="color: #dc3545;">${error.message}</p>
        <a href="/api/admin/google-auth/url">Intentar de nuevo</a>
      </body>
      </html>
    `
  }
})
