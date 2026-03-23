<script setup>
import DashboardContent from '~/components/admin/DashboardContent.vue'
import ProfessionalsContent from '~/components/admin/ProfessionalsContent.vue'
import PatientsContent from '~/components/admin/PatientsContent.vue'
import SchedulesContent from '~/components/admin/SchedulesContent.vue'
import PackagesContent from '~/components/admin/PackagesContent.vue'
import PricesContent from '~/components/admin/PricesContent.vue'
import SpecialtiesContent from '~/components/admin/SpecialtiesContent.vue'
import ReservationsContent from '~/components/admin/ReservationsContent.vue'

definePageMeta({
  layout: false
})

const admin = ref(null)
const token = ref('')
const adminSection = useAdminSection()
const sidebarOpen = ref(false)

onMounted(() => {
  token.value = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  
  if (!token.value || !user) {
    navigateTo('/admin/login')
    return
  }
  
  admin.value = JSON.parse(user)
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div v-if="admin" class="min-h-screen bg-gray-100">
    <!-- Botón hamburguesa móvil -->
    <button @click="toggleSidebar" class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Sidebar desktop fixed -->
    <div class="hidden lg:block lg:w-64 lg:fixed lg:top-0 lg:h-screen">
      <AdminSidebar :admin="admin" />
    </div>

    <!-- Sidebar móvil overlay -->
    <div :class="[
      'fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity',
      sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    ]" @click="sidebarOpen = false">
      <div :class="[
        'fixed left-0 top-0 h-full bg-white shadow-lg transform transition-transform duration-300 w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]" @click.stop>
        <AdminSidebar :admin="admin" @close="sidebarOpen = false" />
      </div>
    </div>
       
    <main class="w-full lg:pl-64 p-4 lg:pr-8 pt-16 lg:pt-8">
      <DashboardContent v-if="adminSection === 'dashboard'" />
      <ReservationsContent v-else-if="adminSection === 'bookings'" />
      <PatientsContent v-else-if="adminSection === 'patients'"/>
      <SpecialtiesContent v-else-if="adminSection === 'specialties'" />
      <ProfessionalsContent v-else-if="adminSection === 'professionals'" />
      <SchedulesContent v-else-if="adminSection === 'schedules'" />
      <PackagesContent v-else-if="adminSection === 'packages'" />
      <PricesContent v-else-if="adminSection === 'prices'" />
    </main>
  </div>
</template>
