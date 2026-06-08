import { getAuthUrl } from '../../../utils/googleCalendar'

function getBaseUrl(event: any): string {
  const host = getHeader(event, 'host') || process.env.NUXT_PUBLIC_URL || ''
  const proto = getHeader(event, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export default defineEventHandler(async (event) => {
  try {
    const url = getAuthUrl(getBaseUrl(event))
    return { success: true, url }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Error al generar URL de autorización: ' + error.message,
    })
  }
})
