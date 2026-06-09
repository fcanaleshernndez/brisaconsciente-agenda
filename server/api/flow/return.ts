export default defineEventHandler(async (event) => {
  let token = getQuery(event).token as string || ''

  if (!token) {
    try {
      const body = await readBody(event)
      token = body?.token || body?.flowToken || ''
    } catch {
      // body not available
    }
  }

  if (!token) {
    return sendRedirect(event, '/pago/resultado?error=missing_token', 302)
  }

  return sendRedirect(event, `/pago/resultado?token=${token}`, 302)
})