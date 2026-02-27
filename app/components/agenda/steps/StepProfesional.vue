<script setup>
    defineProps({ selected: Object })
    const emit = defineEmits(['select', 'next', 'prev'])
    const { data: professionals, pending } = await useFetch('/api/professionals')
</script>

<template>
    <div class="space-y-6">
        <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">Elige tu profesional</h2>
            <p class="text-gray-500 text-sm">Selecciona con quién quieres trabajar</p>
        </div>

        <div v-if="pending" class="flex justify-center py-10">
            <div class="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="space-y-3">
            <button v-for="p in professionals" :key="p.id" @click="emit('select', p)" :class="[
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                selected?.id === p.id
                    ? 'border-softGreen/60 bg-softBlue/20 shadow-md shadow-teal-100'
                    : 'border-gray-100 hover:border-pastelGreen hover:bg-pastelGreen/10'
            ]">
                <div :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
                    selected?.id === p.id ? 'bg-softGreen text-white' : 'bg-gray-100 text-gray-500'
                ]">
                    {{ p.first_name[0] }}{{ p.last_name[0] }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-800">{{ p.first_name }} {{ p.last_name }}</p>
                    <p class="text-sm text-teal-600">{{ p.specialty }}</p>
                </div>
                <div v-if="selected?.id === p.id" class="text-teal-500 text-xl shrink-0">✓</div>
            </button>
        </div>

        <div class="flex gap-3 pt-2">
            <button @click="emit('prev')"
                class="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
                ← Volver
            </button>
            <button @click="emit('next')" :disabled="!selected"
                class="flex-1 bg-softGreen hover:bg-softGreen/70 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all">
                Continuar →
            </button>
        </div>
    </div>
</template>