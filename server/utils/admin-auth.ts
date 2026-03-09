import jwt from 'jsonwebtoken'

export const useAdminAuth = (event: any) => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'brisa-consciente-secret-key'
    )
    event.context.admin = decoded
    return decoded
  } catch {
    throw createError({ statusCode: 401, message: 'Token inválido o expirado' })
  }
}
