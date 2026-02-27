<script setup>
const props = defineProps({ form: Object })
const emit = defineEmits(['prev'])

const loading = ref(false)
const error = ref(null)

const formatCLP = (n) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
}).format(n)

const formatSlot = (iso) => new Date(iso).toLocaleDateString('es-CL', {
  weekday: 'long', day: 'numeric', month: 'long'
}) + ' · ' + new Date(iso).toLocaleTimeString('es-CL', {
  hour: '2-digit', minute: '2-digit'
})

const handlePay = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        name: props.form.name,
        email: props.form.email,
        professional_id: props.form.professional.id,
        package_type_id: props.form.package.package_id,
        slot_ids: props.form.slots.map(s => s.id)
      }
    })
    // Redirigir a Flow cuando esté integrado
    // window.location.href = data.flow_url
    alert('✅ Reserva creada. Aquí irá la URL de Flow: ' + data.flow_url)
  } catch (e) {
    error.value = 'Hubo un problema al procesar tu reserva. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-800">Resumen de tu reserva</h2>
      <p class="text-gray-500 text-sm">Revisa todo antes de pagar</p>
    </div>

    <!-- Tarjeta resumen -->
    <div class="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">

      <!-- Paciente -->
      <div class="flex justify-between items-center">
        <span class="text-gray-500">Paciente</span>
        <span class="font-semibold text-gray-800">{{ form.name }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-500">Correo</span>
        <span class="font-semibold text-gray-800 truncate ml-4">{{ form.email }}</span>
      </div>

      <hr class="border-gray-200" />

      <!-- Profesional y paquete -->
      <div class="flex justify-between items-center">
        <span class="text-gray-500">Profesional</span>
        <span class="font-semibold text-gray-800">
          {{ form.professional.first_name }} {{ form.professional.last_name }}
        </span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-500">Especialidad</span>
        <span class="font-semibold text-teal-600">{{ form.professional.specialty }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-500">Paquete</span>
        <span class="font-semibold text-gray-800">{{ form.package.package_name }}</span>
      </div>

      <hr class="border-gray-200" />

      <!-- Sesiones -->
      <div>
        <p class="text-gray-500 mb-2 font-medium">Sesiones agendadas</p>
        <div
          v-for="(slot, i) in form.slots" :key="slot.id"
          class="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
        >
          <span class="text-gray-400 text-xs font-bold">SESIÓN {{ i + 1 }}</span>
          <span class="font-medium text-gray-700 capitalize text-right text-xs">
            {{ formatSlot(slot.start_time) }}
          </span>
        </div>
      </div>

      <hr class="border-gray-200" />

      <!-- Total -->
      <div class="flex justify-between items-center pt-1">
        <span class="font-bold text-gray-800 text-base">Total a pagar</span>
        <span class="font-bold text-teal-600 text-2xl">{{ formatCLP(form.package.price) }}</span>
      </div>
    </div>

    <!-- Aviso política de cancelación -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-center">
      ⚠️ Puedes cancelar con al menos <strong>24 horas de anticipación</strong> para recibir reembolso.
    </div>

    <!-- Error -->
    <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

    <!-- Botones -->
    <div class="flex gap-3">
      <button
        @click="emit('prev')"
        :disabled="loading"
        class="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
      >
        ← Volver
      </button>
      <button
        @click="handlePay"
        :disabled="loading"
        class="flex-1 bg-softGreen hover:bg-softGreen/70 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        {{ loading ? 'Procesando...' : 'Ir a pagar' }}
      </button>
    </div>
  </div>
</template>