<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-6 mt-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Logs de Errores</h1>
        <p class="text-sm text-gray-500 mt-1">
          Errores del sistema para debugging
        </p>
      </div>
      <button 
        @click="fetchLogs"
        class="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
      >
        Actualizar
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div class="flex flex-wrap gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input 
            type="date" 
            v-model="filters.dateFrom"
            @change="fetchLogs"
            class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input 
            type="date" 
            v-model="filters.dateTo"
            @change="fetchLogs"
            class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
          <input 
            type="text" 
            v-model="filters.search"
            @input="debouncedFetch"
            placeholder="Buscar en endpoint o error..."
            class="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="logs.length === 0" class="bg-white rounded-xl shadow-sm p-8 text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Sin errores</h3>
      <p class="text-gray-500">No se han registrado errores en el sistema.</p>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="bg-white rounded-xl shadow-sm p-4"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">ERROR</span>
            <span class="text-sm font-mono text-gray-600">{{ log.message }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400 whitespace-nowrap">
              {{ formatDateTime(log.created_at) }}
            </span>
            <button 
              @click="deleteLog(log.id)"
              class="text-red-500 hover:text-red-700 p-1"
              title="Eliminar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="log.context" class="mt-3 bg-gray-50 rounded-lg p-3">
          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div v-if="log.context.method">
              <span class="text-gray-500">Método:</span>
              <span class="ml-1 font-mono text-gray-700">{{ log.context.method }}</span>
            </div>
            <div v-if="log.context.patient_id">
              <span class="text-gray-500">Patient ID:</span>
              <span class="ml-1 font-mono text-gray-700">{{ log.context.patient_id }}</span>
            </div>
            <div v-if="log.context.slot_id">
              <span class="text-gray-500">Slot ID:</span>
              <span class="ml-1 font-mono text-gray-700">{{ log.context.slot_id }}</span>
            </div>
            <div v-if="log.context.booking_id">
              <span class="text-gray-500">Booking ID:</span>
              <span class="ml-1 font-mono text-gray-700">{{ log.context.booking_id }}</span>
            </div>
          </div>
          
          <details class="mt-2">
            <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Ver detalles completos
            </summary>
            <pre class="mt-2 text-xs font-mono text-gray-600 bg-white rounded p-2 overflow-x-auto">{{ JSON.stringify(log.context, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4">
        <div class="text-sm text-gray-500">
          Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span class="px-3 py-1 text-sm text-gray-600">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </span>
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
const logs = ref([])
const pagination = ref({ page: 1, limit: 50, total: 0, totalPages: 0 })

const filters = ref({
  dateFrom: '',
  dateTo: '',
  search: ''
})

async function fetchLogs(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '50'
    })
    
    if (filters.value.dateFrom) params.append('date_from', filters.value.dateFrom)
    if (filters.value.dateTo) params.append('date_to', filters.value.dateTo)
    if (filters.value.search) params.append('search', filters.value.search)
    
    const data = await $fetch(`/api/admin/logs?${params.toString()}`)
    logs.value = data.data
    pagination.value = data.pagination
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.value.totalPages) {
    fetchLogs(newPage)
  }
}

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchLogs()
  }, 500)
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('es-CL')
}

async function deleteLog(logId) {
  if (!confirm('¿Eliminar este log?')) return
  
  try {
    await $fetch(`/api/admin/logs/${logId}`, { method: 'DELETE' })
    await fetchLogs(pagination.value.page)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchLogs()
})
</script>
