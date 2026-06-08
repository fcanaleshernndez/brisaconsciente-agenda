import { z } from 'zod'
import { logError } from '../../utils/logger'

const verifySchema = z.object({
  token: z.string().min(1),
  action: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await verifySchema.parse(await readBody(event))
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  const host = getHeader(event, 'host') || ''

  // Skip reCAPTCHA on local/development environments
  if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('ngrok')) {
    return { success: true, score: 1, dev_bypass: true }
  }

  if (!secretKey) {
    throw createError({
      statusCode: 500,
      message: 'RECAPTCHA_SECRET_KEY not configured',
    })
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', secretKey)
    params.append('response', body.token)

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }).then(r => r.json())

    const score = response.success ? response.score : 0
    const threshold = 0.3

    if (!response.success || score < threshold) {
      return {
        success: false,
        score,
        message: 'Verificación de seguridad fallida',
      }
    }

    return {
      success: true,
      score,
    }
  } catch (error: any) {
    logError({
      endpoint: '/api/recaptcha/verify',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return {
      success: false,
      message: 'Error verificando reCAPTCHA',
    }
  }
})
