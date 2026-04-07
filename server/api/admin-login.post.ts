import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { useDb } from '../utils/db'
import { logError } from '../utils/logger'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Credenciales inválidas' })
  }

  const { email, password } = parsed.data
  const client = await useDb().connect()

  try {
    const adminRes = await client.query(
      `SELECT id, email, password_hash, name FROM admins WHERE email = $1 AND is_active = true`,
      [email]
    )

    if (adminRes.rowCount === 0) {
      throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
    }

    const admin = adminRes.rows[0]
    const validPassword = await bcrypt.compare(password, admin.password_hash)

    if (!validPassword) {
      throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { admin_id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET || 'brisa-consciente-secret-key',
      { expiresIn: '8h' }
    )

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    }
  } catch (error) {
    logError({
      endpoint: '/api/admin-login',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  } finally {
    client.release()
  }
})
