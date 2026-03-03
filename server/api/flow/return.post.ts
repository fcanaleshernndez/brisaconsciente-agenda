// server/api/flow/return.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = getQuery(event)

  const token = body.token
  const orderId = query.order
  
  return sendRedirect(
    event,
    `/pago/resultado?token=${token}&order=${orderId}`,
    302
  )
})