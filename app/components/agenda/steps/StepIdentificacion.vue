<script setup>
const props = defineProps({
    name: String,
    email: String,
    isMinor: Boolean,
    guardianName: String
})
const emit = defineEmits(['update:name', 'update:email', 'update:isMinor', 'update:guardianName', 'next'])

const showConfirmModal = ref(false)

const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email || ''))
const isValidGuardianName = computed(() => !props.isMinor || props.guardianName?.trim().length > 2)
const canContinue = computed(() => {
    if (props.isMinor) {
        return isValidGuardianName.value
    }
    return props.name?.trim().length > 2 && isValidEmail.value
})

function handleNext() {
    if (canContinue.value) {
        showConfirmModal.value = true
    }
}

function confirmAndContinue() {
    showConfirmModal.value = false
    emit('next')
}
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

            <div class="bg-softGreen/20 rounded-xl p-4">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" :checked="isMinor" @change="emit('update:isMinor', $event.target.checked)"
                        class="w-5 h-5 text-teal-600 rounded focus:ring-teal-200" />
                    <span class="text-gray-700">El paciente es menor de edad</span>
                </label>
            </div>

            <div v-if="isMinor">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre del Responsable</label>
                <input type="text" placeholder="Ej: María Pérez (madre)" :value="guardianName"
                    @input="emit('update:guardianName', $event.target.value)"
                    class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none transition" />
                <p v-if="isMinor && !guardianName?.trim()" class="text-amber-600 text-sm mt-1">
                    Nombre del padre, madre o tutor legal
                </p>
            </div>
        </div>

        <button @click="handleNext" :disabled="!canContinue"
            class="w-full bg-softGreen hover:bg-softGreen/70 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg">
            Ver Profesionales →
        </button>
    </div>

    <!-- Modal de confirmación de correo -->
    <Teleport to="body">
        <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div class="text-center">
                    <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">¿Es correcto tu correo?</h3>
                    <p class="text-gray-600 mb-2">A este correo enviaremos los detalles de tu reserva:</p>
                    <p class="text-lg font-semibold text-teal-600 mb-6">{{ email }}</p>
                    
                    <div class="flex gap-3">
                        <button @click="showConfirmModal = false"
                            class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                            Corregir
                        </button>
                        <button @click="confirmAndContinue"
                            class="flex-1 px-4 py-3 bg-softGreen text-white rounded-xl font-medium hover:bg-softGreen/70 transition">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
