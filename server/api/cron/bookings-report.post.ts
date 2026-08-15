// server/api/cron/bookings-report.post.ts
import { Pool } from 'pg'
import ExcelJS from 'exceljs'
import path from 'node:path'
import fs from 'node:fs'
import { logError } from '../../utils/logger'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const HEADERS = ['ID', 'Paciente', 'Profesional', 'Horarios', 'Monto', 'Estado', 'Pagado']

const dateFormatter = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFormatter = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' })

interface BookingRow {
  id: number
  booking_status: string
  total_amount_clp: number | null
  paid_at: string | null
  created_at: string | null
  patient_name: string | null
  patient_email: string | null
  professional_first_name: string | null
  professional_last_name: string | null
  specialty: string | null
}

interface SlotRow {
  booking_id: number
  start_time: string | null
  end_time: string | null
  slot_status: string | null
}

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  manually_confirmed: 'Manualmente confirmada',
  cancelled: 'Cancelada',
  canceled: 'Cancelada',
  failed: 'Fallida',
  rescheduled: 'Reagendada',
}

const SLOT_STATUS_LABELS: Record<string, string> = {
  booked: 'OK',
  manually_booked: 'MAN',
  rescheduled: 'REA',
  held: 'RES',
  available: 'DIS',
  canceled: 'CAN',
}

function formatDate(dateStr: any): string {
  if (!dateStr) return '-'
  return dateFormatter.format(new Date(dateStr))
}

function formatTime(dateStr: any): string {
  if (!dateStr) return ''
  return timeFormatter.format(new Date(dateStr))
}

function formatPrice(amount: any): string {
  if (!amount) return '-'
  return '$' + Number(amount).toLocaleString('es-CL')
}

function bookingStatusLabel(status: string | null | undefined): string {
  if (!status) return '-'
  return BOOKING_STATUS_LABELS[status] || status
}

function slotStatusLabel(status: string | null | undefined): string {
  if (!status) return '-'
  return SLOT_STATUS_LABELS[status] || status
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'x-cron-secret')
  const cronSecret = process.env.CRON_SECRET || 'a-super-cron-secret-string'

  if (authHeader !== cronSecret) {
    setResponseStatus(event, 401)
    return { success: false, error: 'Unauthorized' }
  }

  let client
  try {
    client = await pool.connect()

    const bookingsRes = await client.query(`
      SELECT
        b.id,
        b.status AS booking_status,
        b.total_amount_clp,
        b.paid_at,
        b.created_at,
        p.full_name AS patient_name,
        p.email AS patient_email,
        pr.first_name AS professional_first_name,
        pr.last_name AS professional_last_name,
        s.name AS specialty
      FROM bookings b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN professionals pr ON b.professional_id = pr.id
      LEFT JOIN specialties s ON pr.specialty_id = s.id
      WHERE EXISTS (
        SELECT 1
        FROM booking_slots bs
        JOIN availability_slots a ON bs.slot_id = a.id
        WHERE bs.booking_id = b.id
          AND a.start_time >= (date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago')
          AND a.start_time < ((date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') + INTERVAL '1 week') AT TIME ZONE 'America/Santiago')
      )
      ORDER BY b.created_at DESC
    `)
    const bookings = bookingsRes.rows as BookingRow[]

    const bookingIds = bookings.map(r => r.id)
    const slotsMap: Record<number, SlotRow[]> = {}

    if (bookingIds.length > 0) {
      const slotsRes = await client.query(`
        SELECT
          bs.booking_id,
          a.start_time,
          a.end_time,
          a.status AS slot_status
        FROM booking_slots bs
        JOIN availability_slots a ON bs.slot_id = a.id
        WHERE bs.booking_id = ANY($1)
        ORDER BY a.start_time ASC
      `, [bookingIds])

      ;(slotsRes.rows as SlotRow[]).forEach(slot => {
        const existing = slotsMap[slot.booking_id]
        if (!existing) {
          slotsMap[slot.booking_id] = [slot]
        } else {
          existing.push(slot)
        }
      })
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Brisa Consciente'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Reservas')

    sheet.columns = HEADERS.map((header, index) => ({
      header,
      key: `col${index}`,
      width: header === 'Paciente' || header === 'Profesional' || header === 'Horarios' ? 40 : 16,
    }))

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0D9488' },
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
    headerRow.height = 20

    bookings.forEach(b => {
      const slots = slotsMap[b.id] || []
      const horarios = slots.map(slot =>
        `[${slotStatusLabel(slot.slot_status)}] ${formatDate(slot.start_time)} ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
      ).join('\n')

      sheet.addRow({
        col0: b.id,
        col1: `${b.patient_name || ''}${b.patient_email ? `\n${b.patient_email}` : ''}`,
        col2: `${b.professional_first_name || ''} ${b.professional_last_name || ''}${b.specialty ? `\n${b.specialty}` : ''}`.trim(),
        col3: horarios,
        col4: formatPrice(b.total_amount_clp),
        col5: bookingStatusLabel(b.booking_status),
        col6: b.paid_at ? 'Pagado' : 'No Pagado',
      })
    })

    sheet.getColumn(4).alignment = { vertical: 'top', wrapText: true }
    sheet.getColumn(2).alignment = { vertical: 'top', wrapText: true }
    sheet.getColumn(3).alignment = { vertical: 'top', wrapText: true }
    sheet.getColumn(4).numFmt = '@'

    bookings.forEach((_, i) => {
      const row = sheet.getRow(i + 2)
      row.alignment = { vertical: 'top' }
      row.eachCell(cell => {
        cell.alignment = { vertical: 'top', wrapText: true }
      })
    })

    const dateStr = new Date().toISOString().slice(0, 10)
    const dir = path.join(process.cwd(), 'reports')
    fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, `reservas-${dateStr}.xlsx`)

    await workbook.xlsx.writeFile(filePath)

    const weekBoundsRes = await client.query(`
      SELECT
        (date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago'))::date AS week_start,
        (date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') + INTERVAL '6 days')::date AS week_end
    `)
    const weekStart = weekBoundsRes.rows[0].week_start
    const weekEnd = weekBoundsRes.rows[0].week_end

    const { sendBookingsReportEmail } = await import('../../utils/email')
    const formatDay = (d: any) => new Date(d).toISOString().slice(0, 10)
    const reportEmail = await sendBookingsReportEmail({
      to: 'brisaconscientesalud@gmail.com',
      weekStart: formatDay(weekStart),
      weekEnd: formatDay(weekEnd),
      count: bookings.length,
      attachment: {
        filename: path.basename(filePath),
        content: fs.readFileSync(filePath),
      },
    })

    return {
      success: true,
      weekStart,
      weekEnd,
      count: bookings.length,
      filePath,
      emailSent: reportEmail.success,
      emailError: reportEmail.success ? undefined : reportEmail.error,
      generatedAt: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('Cron bookings report error:', error)
    logError({
      endpoint: '/api/cron/bookings-report',
      method: 'POST',
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    setResponseStatus(event, 500)
    return { success: false, error: error.message }
  } finally {
    client?.release()
  }
})
