<script setup>
const loading = ref(true)
const reservations = ref([])
const patients = ref([])
const professionals = ref([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const totalAmount = ref(0)

const showModal = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')

const showConfirmPaid = ref(false)
const reservationToToggle = ref(null)

const form = ref({
  patient_id: null,
  professional_id: null,
  package_type_id: null,
  slot_ids: [],
  paid: true,
})

const availableSlots = ref([])
const packages = ref([])
const loadingSlots = ref(false)

async function fetchReservations(page = 1) {
  loading.value = true
  try {
    const data = await $fetch(`/api/admin/bookings?page=${page}&limit=10`)
    reservations.value = data.data
    pagination.value = data.pagination
    totalAmount.value = data.total_amount || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPatients() {
  try {
    const data = await $fetch('/api/admin/patients/list')
    patients.value = data
  } catch (e) {
    console.error(e)
  }
}

async function fetchProfessionals() {
  try {
    const data = await $fetch('/api/admin/professionals')
    professionals.value = data.filter(p => p.is_active)
  } catch (e) {
    console.error(e)
  }
}

async function fetchPackages() {
  if (!form.value.professional_id) return
  loadingSlots.value = true
  try {
    const data = await $fetch(`/api/admin/prices/list?professional_id=${form.value.professional_id}`)
    packages.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loadingSlots.value = false
  }
}

async function fetchSlots() {
  if (!form.value.professional_id) return
  loadingSlots.value = true
  try {
    const data = await $fetch(`/api/admin/slots/available?professional_id=${form.value.professional_id}`)
    availableSlots.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loadingSlots.value = false
  }
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.value.totalPages) {
    fetchReservations(newPage)
  }
}

function openAddModal() {
  error.value = ''
  success.value = ''
  form.value = {
    patient_id: null,
    professional_id: null,
    package_type_id: null,
    slot_ids: [],
    paid: true,
  }
  availableSlots.value = []
  packages.value = []
  showModal.value = true
}

function onProfessionalChange() {
  form.value.package_type_id = null
  form.value.slot_ids = []
  fetchPackages()
  fetchSlots()
}

function toggleSlot(slotId) {
  const index = form.value.slot_ids.indexOf(slotId)
  if (index > -1) {
    form.value.slot_ids.splice(index, 1)
  } else {
    if (form.value.slot_ids.length < getRequiredSessions()) {
      form.value.slot_ids.push(slotId)
    }
  }
}

function isSlotSelected(slotId) {
  return form.value.slot_ids.includes(slotId)
}

function getRequiredSessions() {
  const pkg = packages.value.find(p => p.package_id === form.value.package_type_id)
  return pkg?.session_count || 1
}

function isSlotDisabled(slot) {
  return !isSlotSelected(slot.id) && form.value.slot_ids.length >= getRequiredSessions()
}

async function createManualBooking() {
  if (!form.value.patient_id || !form.value.professional_id || !form.value.package_type_id || form.value.slot_ids.length === 0) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await $fetch('/api/admin/bookings', {
      method: 'POST',
      body: form.value,
    })
    success.value = 'Reserva manual creada exitosamente'
    setTimeout(() => {
      showModal.value = false
      fetchReservations()
    }, 1500)
  } catch (e) {
    error.value = e.data?.statusMessage || 'Error al crear la reserva'
  } finally {
    saving.value = false
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-CL')
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit'
  })
}

function formatPrice(amount) {
  if (!amount) return '-'
  return '$' + amount.toLocaleString('es-CL')
}

function openConfirmPaid(reservation) {
  reservationToToggle.value = reservation
  showConfirmPaid.value = true
}

async function confirmTogglePaid() {
  if (!reservationToToggle.value) return
  const newPaid = !reservationToToggle.value.paid_at
  
  try {
    await $fetch(`/api/admin/bookings/${reservationToToggle.value.id}/paid`, {
      method: 'PUT',
      body: { paid: newPaid }
    })
    await fetchReservations(pagination.value.page)
  } catch (e) {
    console.error(e)
  } finally {
    showConfirmPaid.value = false
    reservationToToggle.value = null
  }
}

onMounted(async () => {
  await Promise.all([
    fetchReservations(),
    fetchPatients(),
    fetchProfessionals()
  ])
})
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="flex justify-between items-center mb-10 mt-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Reservas</h1>
        <p class="text-sm text-gray-500 mt-1">
          Total del mes actual: <span class="font-semibold text-teal-600">{{ formatPrice(totalAmount) }}</span>
        </p>
      </div>
      <button 
        @click="openAddModal"
        class="bg-softGreen text-white px-4 py-2 rounded-xl hover:bg-softGreen/60 transition"
      >
        + Crear Reserva Manual
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Cargando...</div>

    <div v-else-if="reservations.length === 0" class="text-center py-8 text-gray-500">
      No hay reservas registradas
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesional</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horarios</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in reservations" :key="r.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-600">#{{ r.id }}</td>
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-gray-800">{{ r.patient_name }}</div>
              <div class="text-xs text-gray-500">{{ r.patient_email }}</div>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm text-gray-800">{{ r.professional_first_name }} {{ r.professional_last_name }}</div>
              <div class="text-xs text-gray-500">{{ r.specialty }}</div>
            </td>
            <td class="px-4 py-3">
              <div v-for="(slot, idx) in r.slots" :key="idx" class="text-xs text-gray-600">
                {{ formatDate(slot.start) }} {{ formatTime(slot.start) }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatPrice(r.total_amount_clp) }}</td>
            <td class="px-4 py-3">
              <span :class="{
                'bg-amber-100 text-amber-700': r.booking_status === 'pending',
                'bg-green-100 text-green-700': r.booking_status === 'confirmed',
                'bg-purple-100 text-purple-600': r.booking_status === 'manually_confirmed',
                'bg-red-100 text-red-700': r.booking_status === 'cancelled'
              }" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ r.booking_status === 'pending' ? 'Pendiente' : r.booking_status === 'confirmed' ? 'Confirmada' : r.booking_status === 'manually_confirmed' ? 'Manualmente Confirmada' : 'Cancelada' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button 
                @click="openConfirmPaid(r)"
                :class="r.paid_at 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                class="px-2 py-1 rounded-full text-xs font-medium transition"
              >
                {{ r.paid_at ? '✓ Pagado' : 'No Pagado' }}
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

    <!-- Modal Crear Reserva Manual -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Crear Reserva Manual</h3>
          
          <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          
          <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">{{ success }}</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
              <select 
                v-model="form.patient_id"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option :value="null" disabled>Selecciona un paciente</option>
                <option v-for="p in patients" :key="p.id" :value="p.id">
                  {{ p.full_name }} - {{ p.email }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Profesional</label>
              <select 
                v-model="form.professional_id"
                @change="onProfessionalChange"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option :value="null" disabled>Selecciona un profesional</option>
                <option v-for="p in professionals" :key="p.id" :value="p.id">
                  {{ p.first_name }} {{ p.last_name }} - {{ p.specialty }}
                </option>
              </select>
            </div>

            <div v-if="form.professional_id">
              <label class="block text-sm font-medium text-gray-700 mb-2">Paquete / Servicio</label>
              <select 
                v-model="form.package_type_id"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option :value="null" disabled>Selecciona un paquete</option>
                <option v-for="pkg in packages" :key="pkg.package_id" :value="pkg.package_id">
                  {{ pkg.package_name }} ({{ pkg.session_count }} sesión{{ pkg.session_count > 1 ? 'es' : '' }}) - {{ formatPrice(pkg.price_clp) }}
                </option>
              </select>
            </div>

            <div v-if="form.package_type_id" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Horarios ({{ form.slot_ids.length }} / {{ getRequiredSessions() }})
              </label>
              <div v-if="loadingSlots" class="text-center py-4 text-gray-500">Cargando horarios...</div>
              <div v-else-if="availableSlots.length === 0" class="text-center py-4 text-gray-500">
                No hay horarios disponibles
              </div>
              <div v-else class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                <div v-for="slot in availableSlots" :key="slot.id" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input 
                    type="checkbox"
                    :checked="isSlotSelected(slot.id)"
                    :disabled="isSlotDisabled(slot)"
                    @change="toggleSlot(slot.id)"
                    class="w-4 h-4 text-teal-600 rounded"
                  />
                  <span class="text-sm text-gray-700">
                    {{ formatDate(slot.start_time) }} - {{ formatTime(slot.start_time) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input 
                v-model="form.paid"
                type="checkbox"
                id="paid"
                class="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label for="paid" class="text-sm text-gray-700">Marcar como pagado</label>
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
              @click="createManualBooking"
              :disabled="saving || !form.patient_id || !form.professional_id || !form.package_type_id || form.slot_ids.length === 0"
              class="flex-1 px-4 py-3 bg-softGreen text-white rounded-xl font-medium hover:bg-softGreen/70 transition disabled:opacity-50"
            >
              {{ saving ? 'Creando...' : 'Crear Reserva' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Pago -->
    <Teleport to="body">
      <div v-if="showConfirmPaid" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showConfirmPaid = false">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" @click.stop>
          <div class="text-center">
            <div :class="[
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
              reservationToToggle?.paid_at ? 'bg-amber-100' : 'bg-green-100'
            ]">
              <svg v-if="reservationToToggle?.paid_at" class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">
              {{ reservationToToggle?.paid_at ? '¿Marcar como no pagado?' : '¿Marcar como pagado?' }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ reservationToToggle?.paid_at 
                ? 'Se eliminará la fecha de pago de esta reserva.' 
                : 'Se registrará la fecha de pago actual.' }}
            </p>
            
            <div class="flex gap-3">
              <button @click="showConfirmPaid = false"
                class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button @click="confirmTogglePaid"
                class="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
