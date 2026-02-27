<script setup>
const props = defineProps({
    name: String,
    email: String
})
const emit = defineEmits(['update:name', 'update:email', 'next'])

const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email || ''))
const canContinue = computed(() => props.name?.trim().length > 2 && isValidEmail.value)
</script>

<template>
    <div class="space-y-6">
        <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">¡Hola! Comencemos</h2>
            <p class="text-gray-500">Ingresa tus datos para identificar tu reserva</p>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" placeholder="Ej: Juan Pérez" :value="name"
                    @input="emit('update:name', $event.target.value)"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none transition" />
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" placeholder="juan@ejemplo.com" :value="email"
                    @input="emit('update:email', $event.target.value)"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none transition" />
            </div>
        </div>

        <button @click="emit('next')" :disabled="!canContinue"
            class="w-full bg-softGreen hover:bg-softGreen/70 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
            Ver Profesionales →
        </button>
    </div>
</template>