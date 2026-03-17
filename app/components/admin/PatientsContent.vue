<script setup>
const loading = ref(true)
const patients = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({
  id: null,
  full_name: '',
  email: '',
  phone: '',
  is_minor: false,
  guardian_name: '',
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

function openAddModal() {
  isEditing.value = false
  error.value = ''
  form.value = {
    id: null,
    full_name: '',
    email: '',
    phone: '',
    is_minor: false,
    guardian_name: '',
  }
  showModal.value = true
}

function openEditModal(patient) {
  isEditing.value = true
  error.value = ''
  form.value = {
    id: patient.id,
    full_name: patient.full_name,
    email: patient.email,
    phone: patient.phone || '',
    is_minor: patient.is_minor,
    guardian_name: patient.guardian_name || '',
  }
  showModal.value = true
}

async function savePatient() {
  if (!form.value.full_name || !form.value.email) {
    error.value = 'El nombre y email son requeridos'
    return
  }

  if (form.value.is_minor && !form.value.guardian_name.trim()) {
    error.value = 'El nombre del responsable es requerido para menores de edad'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/patients/${form.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $fetch('/api/admin/patients', {
        method: 'POST',
        body: form.value,
      })
    }
    showModal.value = false
    await fetchPatients(pagination.value.page)
  } catch (e) {
    error.value = e.data?.statusMessage || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchPatients())
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <h1 class="text-2xl font-bold text-gray-800">Pacientes</h1>
      <button 
        @click="openAddModal"
        class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/70 transition"
      >
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
              <button 
                @click="openEditModal(p)"
                class="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Editar
              </button>
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

    <!-- Modal Agregar/Editar Paciente -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ isEditing ? 'Editar Paciente' : 'Agregar Paciente' }}
          </h3>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <input 
                v-model="form.full_name"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                v-model="form.email"
                type="email"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="juan@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input 
                v-model="form.phone"
                type="tel"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div class="flex items-center gap-2">
              <input 
                v-model="form.is_minor"
                type="checkbox"
                id="is_minor"
                class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label for="is_minor" class="text-sm text-gray-700">Menor de edad</label>
            </div>

            <div v-if="form.is_minor">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del responsable</label>
              <input 
                v-model="form.guardian_name"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="María Pérez (madre/tutor)"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button 
              @click="showModal = false"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button 
              @click="savePatient"
              :disabled="saving"
              class="flex-1 px-4 py-3 bg-softGreen text-white rounded-xl font-medium hover:bg-softGreen/70 transition disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
