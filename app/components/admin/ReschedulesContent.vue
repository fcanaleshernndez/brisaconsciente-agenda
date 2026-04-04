<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-6 mt-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Solicitudes de Reagendamiento</h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ pendingCount }} solicitud{{ pendingCount !== 1 ? 'es' : '' }} pendiente{{ pendingCount !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="requests.length === 0" class="bg-white rounded-xl shadow-sm p-8 text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No hay solicitudes pendientes</h3>
      <p class="text-gray-500">Todas las citas han sido reagendadas correctamente.</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Original</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in requests" :key="r.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-gray-800">{{ r.patient_name }}</div>
              <div class="text-xs text-gray-500">{{ r.patient_email }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ r.professional_name }}</td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-700">{{ formatDate(r.original_date) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(r.original_date) }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ formatDateTime(r.requested_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const requests = ref([])
const loading = ref(true)
const pendingCount = computed(() => requests.value.length)

async function fetchRequests() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/reschedule-requests')
    requests.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-CL')
}

onMounted(() => {
  fetchRequests()
})
</script>
