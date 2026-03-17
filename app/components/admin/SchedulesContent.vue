<script setup>
const loading = ref(true)
const professionals = ref([])
const selectedProfessional = ref(null)
const availability = ref([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const loadingSlots = ref(false)
const cleaningUp = ref(false)

const showModal = ref(false)
const selectedSlot = ref(null)
const showConfirmCleanup = ref(false)
const showAddSlots = ref(false)
const showConfirmReschedule = ref(false)
const selectedDate = ref('')
const timeSlots = ref([{ start: '09:00', end: '10:00' }])
const creatingSlots = ref(false)
const slotError = ref('')

function addTimeSlot() {
  const lastSlot = timeSlots.value[timeSlots.value.length - 1]
  timeSlots.value.push({ start: lastSlot.end, end: calculateEndTime(lastSlot.end) })
}

function removeTimeSlot(index) {
  timeSlots.value.splice(index, 1)
}

function calculateEndTime(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const endHour = (hours + 1) % 24
  return `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

async function fetchProfessionals() {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/professionals')
    professionals.value = data.filter(p => p.is_active)
    if (professionals.value.length > 0) {
      selectedProfessional.value = professionals.value[0]
      await fetchAvailability()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchAvailability(page = 1) {
  if (!selectedProfessional.value) return
  loadingSlots.value = true
  try {
    const data = await $fetch(`/api/admin/slots?professional_id=${selectedProfessional.value.id}&page=${page}&limit=10`)
    availability.value = data.data
    pagination.value = data.pagination
  } catch (e) {
    console.error(e)
  } finally {
    loadingSlots.value = false
  }
}

function onProfessionalChange() {
  fetchAvailability(1)
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.value.totalPages) {
    fetchAvailability(newPage)
  }
}

function confirmCleanup() {
  showConfirmCleanup.value = true
}

async function cleanupOldSlots() {
  if (!selectedProfessional.value) return
  cleaningUp.value = true
  showConfirmCleanup.value = false
  try {
    await $fetch('/api/admin/slots/cleanup', {
      method: 'POST',
      body: { professional_id: selectedProfessional.value.id }
    })
    await fetchAvailability()
  } catch (e) {
    console.error(e)
  } finally {
    cleaningUp.value = false
  }
}

function openPatientModal(slot) {
  selectedSlot.value = slot
  showConfirmReschedule.value = false
  showModal.value = true
}

function openRescheduleConfirm() {
  showConfirmReschedule.value = true
}

async function confirmReschedule() {
  if (!selectedSlot.value) return
  
  try {
    await $fetch(`/api/admin/slots/${selectedSlot.value.id}/status`, {
      method: 'PUT',
      body: { status: 'rescheduled' }
    })
    showModal.value = false
    showConfirmReschedule.value = false
    await fetchAvailability(pagination.value.page)
  } catch (e) {
    console.error(e)
  }
}

function openAddSlotsModal() {
  selectedDate.value = ''
  timeSlots.value = [{ start: '09:00', end: '10:00' }]
  slotError.value = ''
  showAddSlots.value = true
}

async function createSlots() {
  if (!selectedDate.value || !selectedProfessional.value || timeSlots.value.length === 0) return
  
  creatingSlots.value = true
  slotError.value = ''
  try {
    const response = await $fetch('/api/admin/slots', {
      method: 'POST',
      body: {
        professional_id: selectedProfessional.value.id,
        date: selectedDate.value,
        slots: timeSlots.value
      }
    })
    
    if (response.conflict) {
      slotError.value = 'Existen horarios conflictivos con otros ya registrados.'
      return
    }
    
    showAddSlots.value = false
    await fetchAvailability()
  } catch (e) {
    slotError.value = 'Error al crear los horarios. Intenta nuevamente.'
    console.error(e)
  } finally {
    creatingSlots.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('es-CL')
}

function isPast(slot) {
  return slot.status === 'available' && new Date(slot.start_time) < new Date()
}

async function toggleSlotStatus(slot) {
  const newStatus = slot.status === 'canceled' ? 'available' : 'canceled'
  
  if (newStatus === 'canceled' && slot.patient_name) {
    alert('No puedes cancelar un horario que ya tiene un paciente reservado')
    return
  }
  
  try {
    await $fetch(`/api/admin/slots/${slot.id}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    await fetchAvailability(pagination.value.page)
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchProfessionals)
</script>

<template>
  <div class="ml-0 lg:ml-5">
    <div class="mb-6 mt-5">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Gestión de Horarios</h1>
      
      <!-- Select profesional -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          <div class="flex flex-col sm:flex-row items-end gap-2 w-full sm:w-auto">
            <button 
              @click="openAddSlotsModal"
              class="h-[42px] bg-info hover:bg-info/70 text-white px-4 py-2 rounded-lg transition whitespace-nowrap w-full sm:w-auto"
            >
              + Añadir Horarios
            </button>
            <button 
              @click="confirmCleanup"
              :disabled="cleaningUp"
              class="h-[42px] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
            >
              {{ cleaningUp ? 'Limpiando...' : 'Limpiar horarios pasados' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedProfessional" class="text-center py-8 text-gray-500">
      Selecciona un profesional para ver su disponibilidad
    </div>

    <div v-else-if="loadingSlots" class="text-center py-8 text-gray-500">
      Cargando horarios...
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <div class="p-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-800">Horarios de {{ selectedProfessional.first_name }} {{ selectedProfessional.last_name }}</h2>
        <p class="text-sm text-gray-500">Duración de sesión: {{ selectedProfessional.appointment_duration_minutes }} minutos</p>
      </div>
      
      <table v-if="availability.length > 0" class="w-full min-w-[600px]">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="slot in availability" :key="slot.id" class="hover:bg-gray-50" :class="{
            'bg-red-50': isPast(slot),
            'bg-gray-50': slot.status === 'canceled'
          }">
            <td class="px-6 py-4">
              <span :class="isPast(slot) ? 'text-red-600' : (slot.status === 'canceled' ? 'text-gray-400' : 'text-gray-800')">
                {{ formatDate(slot.start_time) }}
              </span>
            </td>
            <td class="px-6 py-4" :class="slot.status === 'canceled' ? 'text-gray-400' : 'text-gray-600'">
              {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
            </td>
            <td class="px-6 py-4">
              <span :class="{
                'bg-green-100 text-green-700': slot.status === 'available' && !isPast(slot),
                'bg-red-100 text-red-700': slot.status === 'available' && isPast(slot),
                'bg-amber-100 text-amber-700': slot.status === 'held',
                'bg-red-100 text-red-700': slot.status === 'booked',
                'bg-blue-100 text-blue-700': slot.status === 'rescheduled',
                'bg-gray-100 text-gray-600': slot.status === 'canceled'
              }" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ slot.status === 'available' ? (isPast(slot) ? 'Vencido' : 'Disponible') : slot.status === 'held' ? 'Reservado' : slot.status === 'booked' ? 'Ocupado' : slot.status === 'rescheduled' ? 'Reagendado' : 'Cancelado' }}
              </span>
            </td>
            <td class="px-6 py-4" :class="slot.status === 'canceled' ? 'text-gray-400' : 'text-gray-600'">
              {{ slot.patient_name || '-' }}
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <button 
                  v-if="slot.status === 'available' && !slot.patient_name"
                  @click="toggleSlotStatus(slot)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium text-left"
                >
                  Cancelar
                </button>
                <button 
                  v-else-if="slot.status === 'canceled'"
                  @click="toggleSlotStatus(slot)"
                  class="text-green-600 hover:text-green-800 text-sm font-medium text-left"
                >
                  Activar
                </button>
                <button 
                  v-if="slot.patient_name"
                  @click="openPatientModal(slot)"
                  class="text-teal-600 hover:text-teal-800 text-sm font-medium text-left"
                >
                  Ver paciente
                </button>
                <span v-if="!slot.patient_name && slot.status !== 'canceled'" class="text-gray-400 text-sm">-</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="p-8 text-center text-gray-500">
        No hay horarios disponibles para este profesional
      </div>

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

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Información del Paciente</h3>
          
          <div v-if="selectedSlot" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase">Nombre</p>
                <p class="font-medium text-gray-800">{{ selectedSlot.patient_name }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Email</p>
                <p class="font-medium text-gray-800 break-all">{{ selectedSlot.patient_email }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Teléfono</p>
                <p class="font-medium text-gray-800">{{ selectedSlot.patient_phone || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Menor de edad</p>
                <p class="font-medium text-gray-800">{{ selectedSlot.is_minor ? 'Sí' : 'No' }}</p>
              </div>
              <div v-if="selectedSlot.guardian_name" class="sm:col-span-2">
                <p class="text-xs text-gray-500 uppercase">Responsable</p>
                <p class="font-medium text-gray-800">{{ selectedSlot.guardian_name }}</p>
              </div>
            </div>
            
            <hr class="my-4" />
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase">Estado Reserva</p>
                <p class="font-medium text-gray-800">{{ selectedSlot.booking_status }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Monto</p>
                <p class="font-medium text-gray-800">${{ selectedSlot.total_amount_clp?.toLocaleString('es-CL') }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Fecha Reserva</p>
                <p class="font-medium text-gray-800">{{ formatDateTime(selectedSlot.booking_created_at) }}</p>
              </div>
              <div v-if="selectedSlot.paid_at">
                <p class="text-xs text-gray-500 uppercase">Pagado</p>
                <p class="font-medium text-green-600">{{ formatDateTime(selectedSlot.paid_at) }}</p>
              </div>
            </div>

            <!-- Botón Reagendar -->
            <div v-if="selectedSlot.status === 'booked'" class="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-sm text-amber-700 mb-2">¿El paciente no pudo asistir y necesita reagendar?</p>
              <button 
                v-if="!showConfirmReschedule"
                @click="openRescheduleConfirm"
                class="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
              >
                Marcar como reagendado
              </button>
              <div v-else class="flex gap-2">
                <button 
                  @click="confirmReschedule"
                  class="flex-1 text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
                >
                  Confirmar
                </button>
                <button 
                  @click="showConfirmReschedule = false"
                  class="flex-1 text-sm border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          <button @click="showModal = false" class="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition">
            Cerrar
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmación Limpieza -->
    <Teleport to="body">
      <div v-if="showConfirmCleanup" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showConfirmCleanup = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <div class="text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">¿Estás seguro?</h3>
            <p class="text-gray-600 mb-6">
              Se eliminarán todos los horarios disponibles que ya han vencido desde el día anterior. Esta acción no se puede deshacer.
            </p>
            
            <div class="flex gap-3">
              <button @click="showConfirmCleanup = false"
                class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button @click="cleanupOldSlots"
                :disabled="cleaningUp"
                class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50">
                {{ cleaningUp ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Añadir Horarios -->
    <Teleport to="body">
      <div v-if="showAddSlots" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showAddSlots = false">
        <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" @click.stop>
          <h3 class="text-xl font-bold text-gray-800 mb-4">Añadir Horarios</h3>
          
          <div v-if="slotError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ slotError }}</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input 
                type="date" 
                v-model="selectedDate"
                class="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Horarios</label>
              <div v-for="(slot, index) in timeSlots" :key="index" class="flex items-center gap-2">
                <div class="grid grid-cols-2 gap-2 flex-1">
                  <input 
                    type="time" 
                    v-model="slot.start"
                    class="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                  <input 
                    type="time" 
                    v-model="slot.end"
                    class="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
                <button 
                  v-if="timeSlots.length > 1"
                  @click="removeTimeSlot(index)"
                  class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <button 
                @click="addTimeSlot"
                class="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Añadir otro horario
              </button>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="showAddSlots = false"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button @click="createSlots"
              :disabled="creatingSlots || !selectedDate || timeSlots.length === 0"
              class="flex-1 px-4 py-3 bg-info text-white rounded-xl font-medium hover:bg-info/70 transition disabled:opacity-50">
              {{ creatingSlots ? 'Creando...' : 'Crear Horarios' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
