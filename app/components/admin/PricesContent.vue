<script setup>
const loading = ref(true)
const professionals = ref([])
const packages = ref([])
const selectedProfessional = ref(null)
const prices = ref([])
const loadingPrices = ref(false)

const showModal = ref(false)
const editingPrice = ref(null)
const formPackageId = ref(null)
const formPrice = ref(0)
const formIsActive = ref(true)
const saving = ref(false)
const formError = ref('')
const showConfirmDelete = ref(false)
const priceToDelete = ref(null)
const deleteError = ref('')

async function fetchProfessionals() {
  loading.value = true
  try {
    const [profsData, packagesData] = await Promise.all([
      $fetch('/api/admin/professionals'),
      $fetch('/api/admin/packages')
    ])
    professionals.value = profsData.filter(p => p.is_active)
    packages.value = packagesData
    if (professionals.value.length > 0) {
      selectedProfessional.value = professionals.value[0]
      await fetchPrices()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPrices() {
  if (!selectedProfessional.value) return
  loadingPrices.value = true
  try {
    const data = await $fetch(`/api/admin/prices?professional_id=${selectedProfessional.value.id}`)
    prices.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loadingPrices.value = false
  }
}

function onProfessionalChange() {
  fetchPrices()
}

function openAddModal() {
  editingPrice.value = null
  formPackageId.value = packages.value.length > 0 ? packages.value[0].id : null
  formPrice.value = 0
  formIsActive.value = true
  formError.value = ''
  showModal.value = true
}

function openEditModal(price) {
  editingPrice.value = price
  formPackageId.value = price.package_type_id
  formPrice.value = price.price_clp
  formIsActive.value = price.is_active
  formError.value = ''
  showModal.value = true
}

async function savePrice() {
  if (!formPackageId.value || formPrice.value < 0) {
    formError.value = 'Por favor completa todos los campos'
    return
  }

  saving.value = true
  try {
    if (editingPrice.value) {
      await $fetch(`/api/admin/prices/${editingPrice.value.id}`, {
        method: 'PUT',
        body: {
          price_clp: formPrice.value,
          is_active: formIsActive.value
        }
      })
    } else {
      await $fetch('/api/admin/prices', {
        method: 'POST',
        body: {
          professional_id: selectedProfessional.value.id,
          package_type_id: formPackageId.value,
          price_clp: formPrice.value,
          is_active: formIsActive.value
        }
      })
    }
    showModal.value = false
    await fetchPrices()
  } catch (e) {
    formError.value = e.data?.message || 'Error al guardar el precio'
    console.error(e)
  } finally {
    saving.value = false
  }
}

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value)
}

function isPackageAssigned(packageId) {
  return prices.value.some(p => p.package_type_id === packageId)
}

function deletePrice(price) {
  priceToDelete.value = price
  deleteError.value = ''
  showConfirmDelete.value = true
}

async function confirmDelete() {
  if (!priceToDelete.value) return
  
  try {
    await $fetch(`/api/admin/prices/${priceToDelete.value.id}`, {
      method: 'DELETE'
    })
    showConfirmDelete.value = false
    priceToDelete.value = null
    await fetchPrices()
  } catch (e) {
    deleteError.value = e.data?.message || 'Error al eliminar el precio'
    console.error(e)
  }
}

onMounted(fetchProfessionals)
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="mb-6 mt-5">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Gestión de Precios</h1>
      
      <!-- Select profesional -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Profesional</label>
            <select 
              v-model="selectedProfessional" 
              @change="onProfessionalChange"
              class="w-full md:w-auto md:min-w-80 border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option v-for="p in professionals" :key="p.id" :value="p">
                {{ p.first_name }} {{ p.last_name }} - {{ p.specialty }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              @click="openAddModal"
              :disabled="!selectedProfessional"
              class="h-[42px] bg-softGreen hover:bg-softGreen/70 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              + Añadir Precio
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedProfessional" class="text-center py-8 text-gray-500">
      Selecciona un profesional para ver sus precios
    </div>

    <div v-else-if="loadingPrices" class="text-center py-8 text-gray-500">
      Cargando precios...
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800">Precios de {{ selectedProfessional.first_name }} {{ selectedProfessional.last_name }}</h2>
      </div>
      
      <table v-if="prices.length > 0" class="w-full min-w-[500px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paquete</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sesiones</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="price in prices" :key="price.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ price.package_name }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ price.session_count }} sesión{{ price.session_count > 1 ? 'es' : '' }}</td>
            <td class="px-6 py-4 text-gray-800 font-medium">{{ formatCLP(price.price_clp) }}</td>
            <td class="px-6 py-4">
              <span :class="price.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" 
                class="px-2 py-1 rounded-full text-xs font-medium">
                {{ price.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-3">
                <button @click="openEditModal(price)" class="text-teal-600 hover:text-teal-800 text-sm font-medium">
                  Editar
                </button>
                <button @click="deletePrice(price)" class="text-red-500 hover:text-red-700 text-sm font-medium">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="p-8 text-center text-gray-500">
        No hay precios registrados para este profesional
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">
            {{ editingPrice ? 'Editar Precio' : 'Nuevo Precio' }}
          </h3>
          
          <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ formError }}</p>
          </div>
          
          <div class="space-y-4">
            <div v-if="!editingPrice">
              <label class="block text-sm font-medium text-gray-700 mb-2">Paquete</label>
              <select 
                v-model="formPackageId"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option v-for="pkg in packages.filter(p => !isPackageAssigned(p.id))" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} ({{ pkg.session_count }} sesiones)
                </option>
              </select>
              <p v-if="packages.filter(p => !isPackageAssigned(p.id)).length === 0" class="text-sm text-amber-600 mt-1">
                Todos los paquetes ya tienen precio asignado
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio (CLP)</label>
              <input 
                v-model.number="formPrice" 
                type="number" 
                min="0"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isActive"
                v-model="formIsActive"
                class="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label for="isActive" class="text-sm text-gray-700">Mostrar en el stepper</label>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="showModal = false"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button @click="savePrice"
              :disabled="saving || (!editingPrice && packages.filter(p => !isPackageAssigned(p.id)).length === 0)"
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
            <h3 class="text-xl font-bold text-gray-800 mb-2">¿Eliminar precio?</h3>
            <div v-if="deleteError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ deleteError }}</p>
            </div>
            <p v-else class="text-gray-600 mb-6">
              ¿Estás seguro de eliminar el precio de "{{ priceToDelete?.package_name }}"? Esta acción no se puede deshacer.
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
