<script setup>
const route = useRoute()
const adminSection = useAdminSection()

const menuItems = [
  { name: 'Dashboard', key: 'dashboard', icon: 'home' },
  { name: 'Reservas', key: 'bookings', icon: 'calendar' },
  { name: 'Pacientes', key: 'patients', icon: 'users' },
  { name: 'Profesionales', key: 'professionals', icon: 'user-md' },
  { name: 'Horarios', key: 'schedules', icon: 'clock' },
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
        <svg v-else-if="item.icon === 'user-md'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <svg v-else-if="item.icon === 'folder'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <svg v-else-if="item.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ item.name }}
      </button>
    </nav>

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
</template>
