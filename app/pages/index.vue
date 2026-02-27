<script setup>

import StepHorarios from '~/components/agenda/steps/StepHorarios.vue'
import StepIdentificacion from '~/components/agenda/steps/StepIdentificacion.vue'
import StepPaquete from '~/components/agenda/steps/StepPaquete.vue'
import StepProfesional from '~/components/agenda/steps/StepProfesional.vue'
import StepResumen from '~/components/agenda/steps/StepResumen.vue'

const step = ref(0)
const totalSteps = 5

const form = reactive({
    name: '',
    email: '',
    professional: null,
    package: null,
    slots: []
})

// Navegación
const next = () => step.value++
const prev = () => step.value--

// Lógica de selección
const selectProfessional = (p) => {
    form.professional = p
    form.package = null
    form.slots = []
}

const selectPackage = (pkg) => {
    form.package = pkg
    form.slots = []
}

const toggleSlot = (slot) => {
    const idx = form.slots.findIndex(s => s.id === slot.id)
    if (idx >= 0) {
        form.slots.splice(idx, 1)
    } else if (form.slots.length < form.package.sessions) {
        form.slots.push(slot)
    }
}
</script>

<template>
    <div class="min-h-screen bg-pastelWhite/80 flex items-center justify-center p-4 font-sans">
        <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">

            <!-- Header con Logo y Progreso -->
            <div class="bg-softGreen p-4 text-white">

                <div class="flex items-center gap-2 mb-3">
                    <img
                        src="/img/logo1.png"
                        alt="Brisa Consciente"
                        class="h-20 w-auto object-contain drop-shadow-sm"
                    />
                    <div>
                        <h1 class="text-lg font-bold leading-tight">Brisa Consciente</h1>
                        <p class="text-white/90 text-sm">Centro Terapéutico</p>
                    </div>
                </div>

                <!-- Título del paso -->
                <p class="text-white/90 text-sm font-medium mb-3">Reserva tu sesión</p>

                <!-- Barra de progreso -->
                <div class="flex gap-2">
                    <div v-for="i in totalSteps" :key="i" :class="['h-1.5 flex-1 rounded-full transition-all duration-500',
                        (i - 1) <= step ? 'bg-white' : 'bg-black/20']">
                    </div>
                </div>
            </div>

            <div class="p-8">
                <!-- PASO 1: IDENTIFICACIÓN -->
                <StepIdentificacion v-if="step === 0" v-model:name="form.name" v-model:email="form.email"
                    @next="next" />

                <!-- PASO 2: PROFESIONAL -->
                <StepProfesional v-if="step === 1" :selected="form.professional" @select="selectProfessional"
                    @next="next" @prev="prev" />

                <!-- PASO 3: PAQUETE -->
                <StepPaquete v-if="step === 2" :professional="form.professional" :selected="form.package"
                    @select="selectPackage" @next="next" @prev="prev" />

                <!-- PASO 4: HORARIOS -->
                <StepHorarios v-if="step === 3" :professional="form.professional" :package="form.package"
                    :selected-slots="form.slots" @toggle="toggleSlot" @next="next" @prev="prev" />

                <!-- PASO 5: RESUMEN -->
                <StepResumen v-if="step === 4" :form="form" @prev="prev" />
            </div>
        </div>
    </div>
</template>