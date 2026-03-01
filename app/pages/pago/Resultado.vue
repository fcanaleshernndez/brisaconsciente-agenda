<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
      <div v-if="pending" class="animate-pulse">
        <div class="h-12 w-12 bg-teal-100 rounded-full mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-700">Verificando pago...</h2>
      </div>

      <div v-else-if="booking?.status === 'confirmed'">
        <div class="w-20 h-20 bg-pastelGreen/20 text-softGreen rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-check text-4xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h1>
        <p class="text-gray-500 mb-6">
          Hola <span class="text-teal-600 font-semibold">{{ booking.patient_name }}</span>, tu pago ha sido procesado con éxito.
        </p>
        <div class="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-left mb-8 text-sm space-y-1">
          <p class="text-gray-700"><strong class="text-gray-800">Profesional:</strong> {{ booking.professional_name }}</p>
          <p class="text-gray-700"><strong class="text-gray-800">Sesiones:</strong> {{ booking.session_count }}</p>
          <p class="text-teal-600 font-bold text-base mt-2">{{ formatCLP(booking.total_amount_clp) }}</p>
        </div>
        <NuxtLink to="/" class="block w-full bg-softGreen hover:bg-softGreen/70 text-white font-bold py-3 rounded-xl transition-all">
          Volver al Inicio
        </NuxtLink>
      </div>

      <div v-else>
        <div class="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-times text-4xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Pago no realizado</h1>
        <p class="text-gray-500 mb-8">
          No pudimos confirmar tu pago. Los horarios seleccionados han sido liberados.
        </p>
        <NuxtLink to="/" class="block w-full border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Reintentar Reserva
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const token = route.query.token

const formatCLP = (n) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
}).format(n)

// Consultamos el estado de la reserva usando el token de Flow
const { data: booking, pending } = await useFetch(`/api/bookings/status`, {
  params: { token }
})
</script>