import { createHash } from 'crypto'

const SECRET = process.env.JWT_SECRET || 'brisa-consciente-secret'
const KEY = createHash('sha256').update(SECRET).digest()

export function encryptId(id: number): string {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(id)
  for (let i = 0; i < 4; i++) {
    buf[i] ^= KEY[i]
  }
  return buf.readUInt32BE().toString(36)
}

export function decryptId(code: string): number {
  const clean = code.replace(/^BC-/, '')
  const num = parseInt(clean, 36)
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(num)
  for (let i = 0; i < 4; i++) {
    buf[i] ^= KEY[i]
  }
  return buf.readUInt32BE()
}
