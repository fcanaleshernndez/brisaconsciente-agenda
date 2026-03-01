// server/repos/bookings.ts
import type { PoolClient } from 'pg'

export const BookingsRepo = {
  async create(client: PoolClient, data: {
    name: string
    email: string
    professional_id: number
    package_type_id: number
    total_amount_clp: number
    slot_ids: number[]
  }) {
    // 1. Crear o reutilizar paciente
    const patientRes = await client.query(`
      INSERT INTO patients (full_name, email)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [data.name, data.email])

    let patientId: number

    if (patientRes.rowCount === 0) {
      // Ya existía, buscarlo
      const existing = await client.query(
        `SELECT id FROM patients WHERE email = $1`, [data.email]
      )
      patientId = existing.rows[0].id
    } else {
      patientId = patientRes.rows[0].id
    }

    // 2. Crear la reserva
    const bookingRes = await client.query(`
      INSERT INTO bookings (patient_id, professional_id, package_type_id, total_amount_clp, status)
      VALUES ($1, $2, $3, $4, 'pending_payment')
      RETURNING id
    `, [patientId, data.professional_id, data.package_type_id, data.total_amount_clp])

    const bookingId = bookingRes.rows[0].id

    // 3. Insertar relación booking -> slots
    for (const slotId of data.slot_ids) {
      await client.query(`
        INSERT INTO booking_slots (booking_id, slot_id) VALUES ($1, $2)
      `, [bookingId, slotId])
    }

    // 4. Marcar slots como 'held' con expiración de 15 minutos
    await client.query(`
      UPDATE availability_slots
      SET status = 'held', held_until = NOW() + interval '15 minutes'
      WHERE id = ANY($1::int[])
    `, [data.slot_ids])

    return bookingId
  },

  async attachPayment(client: PoolClient, data: {
    booking_id: number
    flow_order_id: string
    flow_token: string
  }) {
    await client.query(`
      INSERT INTO payments (booking_id, flow_order_id, flow_token, status)
      VALUES ($1, $2, $3, 'pending')
    `, [data.booking_id, data.flow_order_id, data.flow_token])
  }
}