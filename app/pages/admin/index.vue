<script setup>
import DashboardContent from '~/components/admin/DashboardContent.vue'
import ProfessionalsContent from '~/components/admin/ProfessionalsContent.vue'

definePageMeta({
  layout: false
})

const admin = ref(null)
const token = ref('')
const adminSection = useAdminSection()

onMounted(() => {
  token.value = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  
  if (!token.value || !user) {
    navigateTo('/admin/login')
    return
  }
  
  admin.value = JSON.parse(user)
})
</script>

<template>
  <div v-if="admin" class="min-h-screen bg-gray-100 flex">
    <AdminSidebar :admin="admin" />
    
    <main class="flex-1 ml-64 p-8">
      <DashboardContent v-if="adminSection === 'dashboard'" />
      <div v-else-if="adminSection === 'bookings'">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Reservas</h1>
        <p class="text-gray-500">Próximamente...</p>
      </div>
      <div v-else-if="adminSection === 'patients'">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Pacientes</h1>
        <p class="text-gray-500">Próximamente...</p>
      </div>
      <ProfessionalsContent v-else-if="adminSection === 'professionals'" />
      <div v-else-if="adminSection === 'specialties'">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Especialidades</h1>
        <p class="text-gray-500">Próximamente...</p>
      </div>
      <div v-else-if="adminSection === 'schedules'">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Horarios</h1>
        <p class="text-gray-500">Próximamente...</p>
      </div>
    </main>
  </div>
</template>
