<script setup>
const loading = ref(true)
const specialties = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({
  id: null,
  name: '',
})

async function fetchSpecialties() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/specialties')
    specialties.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEditing.value = false
  error.value = ''
  form.value = {
    id: null,
    name: '',
  }
  showModal.value = true
}

function openEditModal(specialty) {
  isEditing.value = true
  error.value = ''
  form.value = {
    id: specialty.id,
    name: specialty.name,
  }
  showModal.value = true
}

async function saveSpecialty() {
  if (!form.value.name.trim()) {
    error.value = 'El nombre es requerido'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/specialties/${form.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $fetch('/api/admin/specialties', {
        method: 'POST',
        body: form.value,
      })
    }
    showModal.value = false
    await fetchSpecialties()
  } catch (e) {
    error.value = e.data?.statusMessage || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSpecialties)
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <h1 class="text-2xl font-bold text-gray-800">Especialidades</h1>
      <button 
        @click="openAddModal"
        class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/70 transition"
      >
        + Agregar
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="specialties.length === 0" class="text-center py-8 text-gray-500">
      No hay especialidades registradas
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[400px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in specialties" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ s.name }}</div>
            </td>
            <td class="px-6 py-4">
              <button 
                @click="openEditModal(s)"
                class="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Agregar/Editar Especialidad -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ isEditing ? 'Editar Especialidad' : 'Agregar Especialidad' }}
          </h3>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input 
                v-model="form.name"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ej: Psicología, Quiropraxia, etc."
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
              @click="saveSpecialty"
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
