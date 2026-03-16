<script setup>
const loading = ref(true)
const patients = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

async function fetchPatients(page = 1) {
  loading.value = true
  try {
    const data = await $fetch(`/api/admin/patients?page=${page}&limit=10`)
    patients.value = data.data
    pagination.value = data.pagination
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.value.totalPages) {
    fetchPatients(newPage)
  }
}

onMounted(() => fetchPatients())
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <h1 class="text-2xl font-bold text-gray-800">Pacientes</h1>
      <button class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/70 transition">
        + Agregar
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="patients.length === 0" class="text-center py-8 text-gray-500">
      No hay pacientes registrados
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menor de edad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in patients" :key="p.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ p.full_name }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ p.email }}</td>
            <td class="px-6 py-4 text-gray-600">{{ p.phone || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="p.is_minor ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'" 
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ p.is_minor ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ p.guardian_name || '-' }}</td>
            <td class="px-6 py-4">
              <button class="text-teal-600 hover:text-teal-800 text-sm font-medium">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
