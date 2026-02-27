<script setup>
const props = defineProps({
  professional: Object,
  package: Object,
  selectedSlots: Array
})
const emit = defineEmits(['toggle', 'next', 'prev'])

const { data: slots, pending } = await useFetch('/api/slots', {
  query: { professional_id: props.professional?.id }
})

const required = computed(() => props.package?.sessions ?? 1)
const count = computed(() => props.selectedSlots.length)
const isComplete = computed(() => count.value === required.value)

// Agrupar slots por fecha
const grouped = computed(() => {
  if (!slots.value) return {}
  return slots.value.reduce((acc, slot) => {
    const dateKey = new Date(slot.start_time).toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(slot)
    return acc
  }, {})
})

const formatTime = (iso) => new Date(iso).toLocaleTimeString('es-CL', {
  hour: '2-digit', minute: '2-digit'
})

const isSelected = (slot) => props.selectedSlots.some(s => s.id === slot.id)
const isDisabled = (slot) => !isSelected(slot) && isComplete.value
</script>

<template>
  <div class="space-y-5">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-800">Elige tus horarios</h2>
      <p class="text-gray-500 text-sm">
        Debes seleccionar
        <span class="font-semibold text-teal-600">{{ required }} {{ required === 1 ? 'horario' : 'horarios' }}</span>
      </p>
    </div>

    <!-- Contador de progreso -->
    <div :class="[
      'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold',
      isComplete ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
    ]">
      <span>{{ isComplete ? '✓' : 'ǃ' }}</span>
      <span>{{ count }} de {{ required }} {{ required === 1 ? 'horario seleccionado' : 'horarios seleccionados' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-10">
      <div class="w-8 h-8 border-4 border-softGreen border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Sin slots disponibles -->
    <div v-else-if="!slots?.length" class="text-center py-8 text-gray-400">
      <p class="text-4xl mb-2">📅</p>
      <p class="font-medium">No hay horarios disponibles</p>
      <p class="text-sm mt-1">Intenta con otro profesional</p>
    </div>

    <!-- Lista de slots agrupados por día -->
    <div v-else class="max-h-64 overflow-y-auto space-y-4 pr-1">
      <div v-for="(daySlots, dateKey) in grouped" :key="dateKey">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 capitalize sticky top-0 bg-white py-1">
          {{ dateKey }}
        </p>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="slot in daySlots" :key="slot.id"
            @click="!isDisabled(slot) && emit('toggle', slot)"
            :class="[
              'py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150',
              isSelected(slot)
                ? 'bg-softGreen text-white border-softGreen shadow-md'
                : isDisabled(slot)
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-softGreen hover:bg-teal-50'
            ]"
          >
            {{ formatTime(slot.start_time) }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <button
        @click="emit('prev')"
        class="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
      >
        ← Volver
      </button>
      <button
        @click="emit('next')"
        :disabled="!isComplete"
        class="flex-1 bg-softGreen hover:bg-softGreen/70 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all"
      >
        Continuar →
      </button>
    </div>
  </div>
</template>