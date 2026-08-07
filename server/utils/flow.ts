// server/utils/flow.ts
import crypto from 'node:crypto'

export function sign(params: Record<string, string>, secretKey: string): string {
    const keys = Object.keys(params).sort()
    const toSign = keys.map(k => `${k}${params[k]}`).join('')
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex')
}

export async function flowCreatePayment(input: {
    subject: string
    amount: number
    commerceOrder: string
    email: string
    urlConfirmation: string
    urlReturn: string
}) {
    const FLOW_API_URL = (process.env.FLOW_API_URL || 'https://www.flow.cl/api').trim()
    const FLOW_API_KEY = (process.env.FLOW_API_KEY || '').trim()
    const FLOW_SECRET_KEY = (process.env.FLOW_SECRET_KEY || '').trim()

    const missing: string[] = []
    if (!FLOW_API_KEY) missing.push('FLOW_API_KEY')
    if (!FLOW_SECRET_KEY) missing.push('FLOW_SECRET_KEY')
    if (!input.subject) missing.push('subject')
    if (!input.amount) missing.push('amount')
    if (!input.commerceOrder) missing.push('commerceOrder')
    if (!input.email) missing.push('email')
    if (!input.urlConfirmation) missing.push('urlConfirmation')
    if (!input.urlReturn) missing.push('urlReturn')

    if (missing.length > 0) {
        throw createError({
            statusCode: 400,
            message: `Missing required Flow parameters: ${missing.join(', ')}`
        })
    }

    const params: Record<string, string> = {
        apiKey: FLOW_API_KEY,
        subject: input.subject,
        currency: 'CLP',
        amount: String(input.amount),
        commerceOrder: input.commerceOrder,
        email: input.email,
        urlConfirmation: input.urlConfirmation,
        urlReturn: input.urlReturn,
    }

    console.error('[flowCreatePayment] calling', `${FLOW_API_URL}/payment/create`, {
        params: Object.fromEntries(Object.entries(params).map(([k, v]) => [k, k === 'apiKey' ? `${String(v).slice(0, 8)}...` : v]))
    })

    const s = sign(params, FLOW_SECRET_KEY)
    const body = new URLSearchParams({ ...params, s }).toString().replace(/\+/g, '%20')

    const res = await fetch(`${FLOW_API_URL}/payment/create`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body
    })

    const json = await res.json() as any

    if (!res.ok || json.code) {
        throw createError({
            statusCode: 502,
            message: `Flow error: ${json.message || JSON.stringify(json)}`
        })
    }

    return { url: json.url as string, token: json.token as string }
}