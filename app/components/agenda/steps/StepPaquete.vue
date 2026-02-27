<script setup>
const props = defineProps({
  professional: Object,
  selected: Object
})
const emit = defineEmits(['select', 'next', 'prev'])

const formatCLP = (n) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0
}).format(n)
</script>

<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-800">Elige tu paquete</h2>
      <p class="text-gray-500 text-sm">
        Con <span class="text-teal-600 font-semibold">{{ professional.first_name }} {{ professional.last_name }}</span>
      </p>
    </div>

    <div class="space-y-3">
      <button
        v-for="pkg in professional.pricing" :key="pkg.package_id"
        @click="emit('select', pkg)"
        :class="[
          'relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
          selected?.package_id === pkg.package_id
            ? 'border-pastelGreen bg-pastelGreen/10 shadow-md shadow-teal-100'
            : 'border-gray-100 hover:border-black/10 hover:bg-gray-50'
        ]"
      >
        <!-- Badge ahorro -->
        <span
          v-if="pkg.sessions > 1"
          class="absolute top-4 right-4 bg-softGreen text-white text-xs font-bold px-2.5 py-1 rounded-full"
        >
          PACK
        </span>

        <div class="flex items-start gap-3">
          <div :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
            selected?.package_id === pkg.package_id ? 'bg-softBlue/30 text-white' : 'bg-gray-100'
          ]">
            {{ pkg.sessions === 1 ? '1️⃣' : '📦' }}
          </div>
          <div class="flex-1">
            <p class="font-bold text-gray-800 text-lg">{{ pkg.package_name }}</p>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ pkg.sessions }} {{ pkg.sessions === 1 ? 'sesión' : 'sesiones' }} · 60 min · Online
            </p>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-teal-600">{{ formatCLP(pkg.price) }}</span>
              <span v-if="pkg.sessions > 1" class="text-xs text-gray-400">
                ({{ formatCLP(Math.round(pkg.price / pkg.sessions)) }} c/u)
              </span>
            </div>
          </div>
        </div>
      </button>
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
        :disabled="!selected"
        class="flex-1 bg-softGreen hover:bg-softGreen/70 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all"
      >
        Continuar →
      </button>
    </div>
  </div>
</template>