<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
      <div v-if="pending" class="animate-pulse">
        <div class="h-12 w-12 bg-teal-100 rounded-full mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Verificando pago...</h2>
      </div>

      <div v-else-if="booking?.status === 'confirmed'">
        <div
          class="w-20 h-20 bg-pastelGreen/20 text-softGreen rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-check text-4xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h1>
        <p class="text-gray-500 mb-4">
          Hola <span class="text-teal-600 font-semibold">{{ booking.patient_name }}</span>, tu pago ha sido procesado
          con éxito.
        </p>
        
        <div class="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-left mb-4 text-sm space-y-2">
          <p class="text-gray-700"><strong class="text-gray-800">Profesional:</strong> {{ booking.professional_name }}</p>
          <p class="text-gray-700"><strong class="text-gray-800">Sesiones:</strong> {{ booking.session_count }}</p>
          <p class="text-gray-700"><strong class="text-gray-800">Monto:</strong> <span class="text-teal-600 font-bold">{{ formatCLP(booking.total_amount_clp) }}</span></p>
          <p class="text-gray-700"><strong class="text-gray-800">Código de reserva:</strong> <span class="font-mono text-teal-600 font-semibold">{{ booking.public_code }}</span></p>
          <p v-if="booking.public_payment_code" class="text-gray-700"><strong class="text-gray-800">Código de pago:</strong> <span class="font-mono text-gray-600 text-xs">{{ booking.public_payment_code }}</span></p>
        </div>

        <div v-if="booking.slots && booking.slots.length > 0" class="bg-softBlue/10 rounded-2xl border border-softBlue/30 p-4 text-left mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Tus sesiones programadas:</h3>
          <div class="space-y-2">
            <div v-for="(slot, index) in booking.slots" :key="index" class="text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 font-medium">Sesión {{ index + 1 }}</span>
                <span class="text-gray-500">{{ formatTimeES(slot.start_time) }} - {{ formatTimeES(slot.end_time) }}</span>
              </div>
              <span class="text-gray-700">{{ formatDateES(slot.start_time) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <button @click="downloadReceipt"
            class="flex-1 bg-pastelBlue hover:bg-softBlue/80 text-white font-medium py-2 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
            <i class="fas fa-download"></i>
            Descargar Comprobante
          </button>
        </div>

        <p class="text-xs text-gray-500 mb-6 bg-amber-50 p-3 rounded-lg">
          <i class="fas fa-envelope mr-1"></i>
          La información de tu reserva será enviada al correo: <strong>{{ booking.patient_email }}</strong>
        </p>

      </div>

      <div v-else>
        <div class="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-times text-4xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Pago no realizado</h1>
        <p class="text-gray-500 mb-8">
          No pudimos confirmar tu pago. Los horarios seleccionados han sido liberados.
        </p>
        <NuxtLink to="/"
          class="block w-full border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Reintentar Reserva
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { jsPDF } from 'jspdf'

const route = useRoute()
const config = useRuntimeConfig()
const token = route.query.token || null

const booking = ref(null)
const pending = ref(true)
let attempts = 0
const MAX_ATTEMPTS = 15

const EMAIL_CONFIG = {
  companyName: config.public.companyName || 'Brisa Consciente'
}

const formatCLP = (n) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
}).format(n)

const formatDateES = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date).replace('.', '')
}

const formatTimeES = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(date)
}

async function checkStatus() {
  if (attempts >= MAX_ATTEMPTS) {
    pending.value = false
    return
  }

  try {
    const data = await $fetch('/api/bookings/status', {
      params: { token }
    })

    console.log(`Intento ${attempts + 1}:`, data?.status)

    if (data?.status === 'confirmed' || data?.status === 'failed') {
      booking.value = data
      pending.value = false
    } else {
      attempts++
      setTimeout(checkStatus, 2000)
    }
  } catch (err) {
    console.error('Error checkStatus:', err)
    pending.value = false
  }
}

function downloadReceipt() {
  if (!booking.value) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 25

  doc.setFillColor(168, 213, 186)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(EMAIL_CONFIG.companyName, pageWidth / 2, 18, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Centro Terapeutico', pageWidth / 2, 28, { align: 'center' })

  doc.setTextColor(51, 51, 51)
  y = 55

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(168, 213, 186)
  doc.text('COMPROBANTE DE PAGO', pageWidth / 2, y, { align: 'center' })
  y += 15

  doc.setFontSize(10)
  doc.setTextColor(102, 102, 102)
  doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, pageWidth / 2, y, { align: 'center' })
  y += 15

  doc.setDrawColor(168, 213, 186)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  doc.setTextColor(51, 51, 51)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos de la Reserva', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const addField = (label, value) => {
    doc.setFont('helvetica', 'normal')
    doc.text(label + ':', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(value, margin + 45, y)
    y += 7
  }

  addField('Codigo Reserva', String(booking.value.public_code || booking.value.id))
  addField('Codigo Pago', String(booking.value.public_payment_code || booking.value.payment_id || 'N/A'))
  addField('Profesional', booking.value.professional_name)
  addField('Paquete', booking.value.package_name || 'N/A')
  addField('Sesiones', String(booking.value.session_count))
  doc.setTextColor(0, 128, 0)
  addField('Total Pagado', formatCLP(booking.value.total_amount_clp))
  y += 5

  doc.setTextColor(51, 51, 51)
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(96, 195, 231)
  doc.text('Sesiones Programadas', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setTextColor(51, 51, 51)

  if (booking.value.slots && booking.value.slots.length > 0) {
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, y - 4, pageWidth - margin * 2, booking.value.slots.length * 10 + 8, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.text('#', margin + 2, y + 2)
    doc.text('Fecha', margin + 20, y + 2)
    doc.text('Horario', margin + 90, y + 2)
    y += 7

    doc.setFont('helvetica', 'normal')
    booking.value.slots.forEach((slot, i) => {
      doc.text(`${i + 1}`, margin + 2, y)
      doc.text(formatDateES(slot.start_time), margin + 20, y)
      doc.text(`${formatTimeES(slot.start_time)} - ${formatTimeES(slot.end_time)}`, margin + 90, y)
      y += 10
    })
  }
  y += 5

  doc.setTextColor(51, 51, 51)
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del Paciente', margin, y)
  y += 8

  doc.setFontSize(10)
  addField('Nombre', booking.value.patient_name)
  addField('Email', booking.value.patient_email)
  if (booking.value.paid_at) {
    addField('Confirmado el', new Date(booking.value.paid_at).toLocaleString('es-CL'))
  }

  y = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Este comprobante fue generado automaticamente por el sistema.', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.text(EMAIL_CONFIG.companyName + ' - www.brisaconsciente.cl', pageWidth / 2, y, { align: 'center' })

  doc.save(`comprobante-${booking.value.public_code || booking.value.id}.pdf`)
}

onMounted(() => {
  if (token) {
    checkStatus()
  } else {
    console.warn('Sin token en URL')
    pending.value = false
  }
})
</script>