// server/utils/flow.ts
import crypto from 'node:crypto'

const FLOW_API_URL = process.env.FLOW_API_URL || 'https://www.flow.cl/api'
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || ''
const FLOW_API_KEY = process.env.FLOW_API_KEY || ''

export function sign(params: Record<string, string>): string {
    // Forzamos el orden exacto que Flow espera (alfabético simple)
    const keys = Object.keys(params).sort((a, b) => a.localeCompare(b)) // Ordenación alfabética estándar
    const toSign = keys.map(k => `${k}${params[k]}`).join('')
    
    console.log('NUEVO TO SIGN:', toSign) // Verifica si el orden cambió
    
    return crypto.createHmac('sha256', FLOW_SECRET_KEY).update(toSign).digest('hex')
}

export async function flowCreatePayment(input: {
    subject: string
    amount: number
    commerceOrder: string
    email: string
    urlConfirmation: string
    urlReturn: string
}) {
    // Todos los valores como string desde el inicio para que la firma sea consistente
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

    console.log('=== FLOW PARAMS ===', JSON.stringify(params, null, 2))
    console.log('=== TO SIGN ===', Object.keys(params).sort().map(k => `${k}${params[k]}`).join(''))

    const s = sign(params)
    const body = new URLSearchParams({ ...params, s })

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