import { query } from '../utils/db'

export default defineEventHandler(async (event) => {
  const services: Record<string, any> = {}
  let healthy = true

  // Check Database
  const dbStart = Date.now()
  try {
    await query('SELECT 1')
    services.database = {
      status: 'up',
      latency_ms: Date.now() - dbStart
    }
  } catch (error: any) {
    healthy = false
    services.database = {
      status: 'down',
      error: error.message
    }
  }

  // Check Flow API
  const flowStart = Date.now()
  try {
    const apiKey = process.env.FLOW_API_KEY
    const apiUrl = (process.env.FLOW_API_URL || 'https://www.flow.cl/api').trim()
    
    if (!apiKey) {
      throw new Error('FLOW_API_KEY not configured')
    }

    const response = await fetch(`${apiUrl}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ apiKey }).toString()
    })

    services.flow = {
      status: 'up',
      latency_ms: Date.now() - flowStart
    }
  } catch (error: any) {
    healthy = false
    services.flow = {
      status: 'down',
      error: error.message,
      latency_ms: Date.now() - flowStart
    }
  }

  return {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services
  }
})
