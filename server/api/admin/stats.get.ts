import { query } from "../../utils/db";
import { logError } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  
  const dateFrom = queryParams.date_from 
    ? new Date(String(queryParams.date_from))
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  
  const dateTo = queryParams.date_to 
    ? new Date(String(queryParams.date_to) + 'T23:59:59')
    : new Date()

  try {
    const stats: any = {}

    const patientsCount = await query(`SELECT COUNT(*) as count FROM patients`)
    stats.patients_count = parseInt(patientsCount.rows[0].count)

    const professionalsCount = await query(`SELECT COUNT(*) as count FROM professionals WHERE is_active = true`)
    stats.professionals_count = parseInt(professionalsCount.rows[0].count)

    const specialtiesCount = await query(`SELECT COUNT(*) as count FROM specialties`)
    stats.specialties_count = parseInt(specialtiesCount.rows[0].count)

    const packagesCount = await query(`SELECT COUNT(*) as count FROM package_types WHERE is_deleted = false`)
    stats.packages_count = parseInt(packagesCount.rows[0].count)

    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    const bookingsMonth = await query(`
      SELECT COUNT(*) as count FROM bookings WHERE created_at >= $1
    `, [currentMonthStart.toISOString()])
    stats.bookings_month = parseInt(bookingsMonth.rows[0].count)

    const revenueCustom = await query(`
      SELECT COALESCE(SUM(total_amount_clp), 0) as total FROM bookings b
      WHERE b.paid_at IS NOT NULL
        AND b.paid_at >= $1
        AND b.paid_at <= $2
        AND NOT EXISTS (
          SELECT 1 FROM booking_slots bs
          JOIN availability_slots a ON bs.slot_id = a.id
          JOIN reschedule_history rh ON rh.original_slot_id = a.id
          WHERE bs.booking_id = b.id 
            AND a.status = 'rescheduled'
            AND rh.status = 'completed'
        )
    `, [dateFrom.toISOString(), dateTo.toISOString()])
    stats.revenue_custom = parseInt(revenueCustom.rows[0].total)
    stats.date_from = dateFrom.toISOString().split('T')[0]
    stats.date_to = dateTo.toISOString().split('T')[0]

    const bookingsByStatus = await query(`
      SELECT status, COUNT(*) as count FROM bookings GROUP BY status
    `)
    stats.bookings_by_status = bookingsByStatus.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {})

    const upcomingSlots = await query(`
      SELECT COUNT(*) as count FROM availability_slots 
      WHERE status = 'available' 
        AND start_time > NOW() 
        AND start_time < NOW() + INTERVAL '7 days'
    `)
    stats.upcoming_slots_week = parseInt(upcomingSlots.rows[0].count)

    return stats
  } catch (error) {
    logError({
      endpoint: '/api/admin/stats',
      method: 'GET',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener estadísticas: ' + error,
    })
  }
})
