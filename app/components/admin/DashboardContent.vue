<script setup>
const loading = ref(true)
const stats = ref({})

const dateFrom = ref('')
const dateTo = ref('')

async function fetchStats() {
  loading.value = true
  try {
    const params = {}
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    
    const data = await $fetch('/api/admin/stats', { params })
    stats.value = data
    
    if (!dateFrom.value && data.date_from) {
      dateFrom.value = data.date_from
    }
    if (!dateTo.value && data.date_to) {
      dateTo.value = data.date_to
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function applyDateFilter() {
  if (dateFrom.value && dateTo.value) {
    fetchStats()
  }
}

function resetDateFilter() {
  dateFrom.value = ''
  dateTo.value = ''
  fetchStats()
}

function formatPrice(amount) {
  if (!amount) return '$0'
  return '$' + amount.toLocaleString('es-CL')
}

function getCurrentMonth() {
  return new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

onMounted(fetchStats)
</script>

<template>
  <div class="ml-0 lg:ml-5 mt-5">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Resumen del sistema - {{ getCurrentMonth() }}</p>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      <div class="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-2">Cargando estadísticas...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Card Principal de Ingresos -->
      <div class="bg-gradient-to-r from-softGreen to-pastelGreen rounded-2xl shadow-lg p-6 text-white">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p class="text-white-100 text-sm font-medium mb-1">Ingresos en el período</p>
            <p class="text-white-100 text-4xl lg:text-5xl font-bold">{{ formatPrice(stats.revenue_custom) }}</p>
            <p class="text-white-100 text-sm mt-2">
              Desde {{ stats.date_from }} hasta {{ stats.date_to }}
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div class="flex flex-col">
              <label class="text-xs text-any-100 mb-1"><strong>Desde</strong></label>
              <input 
                type="date" 
                v-model="dateFrom"
                class="px-3 py-2 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
              />
            </div>
            <div class="flex flex-col">
              <label class="text-xs text-any-100 mb-1"><strong>Hasta</strong></label>
              <input 
                type="date" 
                v-model="dateTo"
                class="px-3 py-2 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
              />
            </div>
            <div class="flex items-end gap-2 mt-auto">
              <button 
                @click="applyDateFilter"
                class="px-4 py-2 bg-white text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
              >
                Aplicar
              </button>
              <button 
                @click="resetDateFilter"
                class="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-400 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards Principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Pacientes</p>
              <p class="text-3xl font-bold text-teal-600 mt-1">{{ stats.patients_count || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Profesionales</p>
              <p class="text-3xl font-bold text-blue-600 mt-1">{{ stats.professionals_count || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Reservas del mes</p>
              <p class="text-3xl font-bold text-purple-600 mt-1">{{ stats.bookings_month || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Horarios (7 días)</p>
              <p class="text-3xl font-bold text-rose-600 mt-1">{{ stats.upcoming_slots_week || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Segunda fila -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-500">Especialidades</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.specialties_count || 0 }}</p>
            </div>
            <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-500">Paquetes activos</p>
              <p class="text-2xl font-bold text-gray-800 mt-1">{{ stats.packages_count || 0 }}</p>
            </div>
            <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-500">Reservas por estado</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="text-center p-2 bg-amber-50 rounded-lg">
              <p class="text-lg font-bold text-amber-600">{{ stats.bookings_by_status?.pending_payment || 0 }}</p>
              <p class="text-xs text-gray-600">Pendiente</p>
            </div>
            <div class="text-center p-2 bg-green-50 rounded-lg">
              <p class="text-lg font-bold text-green-600">{{ (stats.bookings_by_status?.confirmed || 0) + (stats.bookings_by_status?.manually_confirmed || 0) }}</p>
              <p class="text-xs text-gray-600">Confirmadas</p>
            </div>
            <div class="text-center p-2 bg-blue-50 rounded-lg">
              <p class="text-lg font-bold text-blue-600">{{ stats.bookings_by_status?.manually_booked || 0 }}</p>
              <p class="text-xs text-gray-600">Manuales</p>
            </div>
            <div class="text-center p-2 bg-red-50 rounded-lg">
              <p class="text-lg font-bold text-red-600">{{ stats.bookings_by_status?.cancelled || 0 }}</p>
              <p class="text-xs text-gray-600">Canceladas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
