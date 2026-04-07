const rateLimits = new Map()

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 10

export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/bookings')) {
    return
  }

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getRequestHeader(event, 'x-real-ip')
    || event.node.req.socket.remoteAddress
    || 'unknown'

  const now = Date.now()
  const key = `rate:${ip}`

  let record = rateLimits.get(key)

  if (!record || now - record.timestamp > WINDOW_MS) {
    record = { count: 1, timestamp: now }
    rateLimits.set(key, record)
  } else {
    record.count++
  }

  if (record.count > MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Demasiadas solicitudes. Intentá de nuevo en una hora.',
    })
  }

  setResponseHeader(event, 'X-RateLimit-Limit', MAX_REQUESTS.toString())
  setResponseHeader(event, 'X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count).toString())
})
