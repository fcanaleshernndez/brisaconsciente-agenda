<script setup>
const loading = ref(true)
const professionals = ref([])
const specialties = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  specialty_id: null,
  appointment_duration_minutes: 60,
  is_active: true,
})

async function fetchProfessionals() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/professionals')
    professionals.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchSpecialties() {
  try {
    const data = await $fetch('/api/admin/specialties')
    specialties.value = data
  } catch (e) {
    console.error(e)
  }
}

function openAddModal() {
  isEditing.value = false
  error.value = ''
  form.value = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    specialty_id: null,
    appointment_duration_minutes: 60,
    is_active: true,
  }
  showModal.value = true
}

function openEditModal(professional) {
  isEditing.value = true
  error.value = ''
  form.value = {
    id: professional.id,
    first_name: professional.first_name,
    last_name: professional.last_name,
    email: professional.email,
    specialty_id: professional.specialty_id,
    appointment_duration_minutes: professional.appointment_duration_minutes,
    is_active: professional.is_active,
  }
  showModal.value = true
}

async function saveProfessional() {
  if (!form.value.first_name || !form.value.last_name || !form.value.email || !form.value.specialty_id) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/professionals/${form.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $fetch('/api/admin/professionals', {
        method: 'POST',
        body: form.value,
      })
    }
    showModal.value = false
    await fetchProfessionals()
  } catch (e) {
    error.value = e.data?.statusMessage || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchSpecialties()
  await fetchProfessionals()
})
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <h1 class="text-2xl font-bold text-gray-800">Profesionales</h1>
      <button 
        @click="openAddModal"
        class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/70 transition"
      >
        + Agregar
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="professionals.length === 0" class="text-center py-8 text-gray-500">
      No hay profesionales registrados
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[600px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in professionals" :key="p.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ p.first_name }} {{ p.last_name }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ p.specialty }}</td>
            <td class="px-6 py-4 text-gray-600">{{ p.email }}</td>
            <td class="px-6 py-4">
              <span :class="p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'" 
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ p.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
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
    </div>

    <!-- Modal Agregar/Editar Profesional -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ isEditing ? 'Editar Profesional' : 'Agregar Profesional' }}
          </h3>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input 
                  v-model="form.first_name"
                  type="text"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input 
                  v-model="form.last_name"
                  type="text"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Pérez"
                />
              </div>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
              <select 
                v-model="form.specialty_id"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option :value="null" disabled>Selecciona una especialidad</option>
                <option v-for="s in specialties" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Duración de sesión (minutos)</label>
              <input 
                v-model.number="form.appointment_duration_minutes"
                type="number"
                min="15"
                step="15"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div class="flex items-center gap-2">
              <input 
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label for="is_active" class="text-sm text-gray-700">Profesional activo</label>
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
              @click="saveProfessional"
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
