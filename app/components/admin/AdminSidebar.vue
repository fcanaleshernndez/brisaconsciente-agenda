<script setup>
const route = useRoute()
const adminSection = useAdminSection()

const showHealthModal = ref(false)
const healthData = ref(null)
const healthLoading = ref(false)

const menuItems = [
  { name: 'Dashboard', key: 'dashboard', icon: 'home' },
  { name: 'Reservas', key: 'bookings', icon: 'calendar' },
  { name: 'Reagendados', key: 'reschedules', icon: 'refresh' },
  { name: 'Pacientes', key: 'patients', icon: 'users' },
  { name: 'Especialidades', key: 'specialties', icon: 'specialtie'},
  { name: 'Profesionales', key: 'professionals', icon: 'user-md' },
  { name: 'Horarios', key: 'schedules', icon: 'clock' },
  { name: 'Paquetes', key: 'packages', icon: 'package'},
  { name: 'Precios', key: 'prices', icon: 'price'}
]

const props = defineProps({
  admin: Object
})

const emit = defineEmits(['close'])

function setSection(key) {
  adminSection.value = key
  emit('close')
}

function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  navigateTo('/admin/login')
}

async function checkHealth() {
  healthLoading.value = true
  showHealthModal.value = true
  try {
    healthData.value = await $fetch('/api/health')
  } catch (e) {
    healthData.value = { status: 'error', error: e.message }
  } finally {
    healthLoading.value = false
  }
}
</script>

<template>
  <aside class="w-full lg:w-64 bg-white shadow-lg flex flex-col h-full">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <span class="font-bold text-gray-800"></span>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <button 
        v-for="item in menuItems" 
        :key="item.key"
        @click="setSection(item.key)"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition"
        :class="{ 'bg-teal-50 text-teal-600 font-medium': adminSection === item.key }"
      >
        <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg v-else-if="item.icon === 'calendar'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <svg v-else-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else-if="item.icon === 'specialtie'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
        <svg v-else-if="item.icon === 'user-md'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <svg v-else-if="item.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="item.icon === 'package'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <svg v-else-if="item.icon === 'price'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <svg v-else-if="item.icon === 'refresh'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ item.name }}
      </button>
    </nav>

    <!-- Health Check -->
    <div class="p-4 border-t border-gray-100">
      <button 
        @click="checkHealth"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Estado del sistema
      </button>
    </div>

    <!-- User -->
    <div class="p-4 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">{{ admin?.name }}</span>
        <button @click="logout" class="text-red-500 hover:text-red-700 text-sm font-medium">
          Salir
        </button>
      </div>
    </div>
  </aside>

  <!-- Health Modal -->
  <Teleport to="body">
    <div v-if="showHealthModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showHealthModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">Estado del Sistema</h3>
          <button @click="showHealthModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="healthLoading" class="text-center py-8">
          <div class="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-2 text-gray-500 text-sm">Verificando...</p>
        </div>

        <div v-else-if="healthData">
          <div class="mb-4 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" :class="healthData.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'"></span>
            <span class="font-medium" :class="healthData.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'">
              {{ healthData.status === 'healthy' ? 'Todos los servicios operativos' : 'Sistema con problemas' }}
            </span>
          </div>

          <div class="space-y-2">
            <div v-for="(service, name) in healthData.services" :key="name" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="font-medium text-gray-700 capitalize">{{ name }}</span>
              <div class="flex items-center gap-2">
                <span v-if="service.latency_ms" class="text-xs text-gray-400">{{ service.latency_ms }}ms</span>
                <span class="px-2 py-1 rounded-full text-xs font-medium" 
                  :class="service.status === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ service.status === 'up' ? 'UP' : 'DOWN' }}
                </span>
              </div>
            </div>
          </div>

          <p class="mt-4 text-xs text-gray-400 text-center">
            Actualizado: {{ new Date(healthData.timestamp).toLocaleString('es-CL') }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
