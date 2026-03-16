<script setup>
const loading = ref(true)
const packages = ref([])
const loadingPackages = ref(false)

const showModal = ref(false)
const editingPackage = ref(null)
const formName = ref('')
const formSessions = ref(1)
const saving = ref(false)
const formError = ref('')
const showConfirmDelete = ref(false)
const packageToDelete = ref(null)
const deleteError = ref('')

async function fetchPackages() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/packages')
    packages.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingPackage.value = null
  formName.value = ''
  formSessions.value = 1
  formError.value = ''
  showModal.value = true
}

function openEditModal(pkg) {
  editingPackage.value = pkg
  formName.value = pkg.name
  formSessions.value = pkg.session_count
  formError.value = ''
  showModal.value = true
}

async function savePackage() {
  if (!formName.value.trim() || formSessions.value < 1) {
    formError.value = 'Por favor completa todos los campos'
    return
  }

  saving.value = true
  try {
    if (editingPackage.value) {
      await $fetch(`/api/admin/packages/${editingPackage.value.id}`, {
        method: 'PUT',
        body: {
          name: formName.value,
          session_count: formSessions.value
        }
      })
    } else {
      await $fetch('/api/admin/packages', {
        method: 'POST',
        body: {
          name: formName.value,
          session_count: formSessions.value
        }
      })
    }
    showModal.value = false
    await fetchPackages()
  } catch (e) {
    formError.value = 'Error al guardar el paquete'
    console.error(e)
  } finally {
    saving.value = false
  }
}

function deletePackage(pkg) {
  packageToDelete.value = pkg
  deleteError.value = ''
  showConfirmDelete.value = true
}

async function confirmDelete() {
  if (!packageToDelete.value) return
  deleteError.value = ''
  
  try {
    await $fetch(`/api/admin/packages/${packageToDelete.value.id}`, {
      method: 'DELETE'
    })
    showConfirmDelete.value = false
    packageToDelete.value = null
    await fetchPackages()
  } catch (e) {
    deleteError.value = e.data?.message || 'Error al eliminar el paquete'
  }
}

onMounted(fetchPackages)
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <h1 class="text-2xl font-bold text-gray-800">Paquetes</h1>
      <button @click="openAddModal" class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/70 transition">
        + Añadir Paquete
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="packages.length === 0" class="text-center py-8 text-gray-500">
      No hay paquetes registrados
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[400px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ pkg.name }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ pkg.session_count }} sesión{{ pkg.session_count > 1 ? 'es' : '' }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-3">
                <button @click="openEditModal(pkg)" class="text-teal-600 hover:text-teal-800 text-sm font-medium">
                  Editar
                </button>
                <button @click="deletePackage(pkg)" class="text-red-500 hover:text-red-700 text-sm font-medium">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ editingPackage ? 'Editar Paquete' : 'Nuevo Paquete' }}
          </h3>
          
          <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ formError }}</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Paquete</label>
              <input 
                v-model="formName" 
                type="text" 
                placeholder="Ej: Pack 4 Sesiones"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad de Sesiones</label>
              <input 
                v-model.number="formSessions" 
                type="number" 
                min="1"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="showModal = false"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button @click="savePackage"
              :disabled="saving"
              class="flex-1 px-4 py-3 bg-softGreen text-white rounded-xl font-medium hover:bg-softGreen/70 transition disabled:opacity-50">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmación Eliminar -->
    <Teleport to="body">
      <div v-if="showConfirmDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showConfirmDelete = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">¿Eliminar paquete?</h3>
            <div v-if="deleteError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ deleteError }}</p>
            </div>
            <p v-else class="text-gray-600 mb-6">
              ¿Estás seguro de eliminar el paquete "{{ packageToDelete?.name }}"? Esta acción no se puede deshacer.
            </p>
            
            <div class="flex gap-3">
              <button @click="showConfirmDelete = false"
                class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button @click="confirmDelete"
                class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
