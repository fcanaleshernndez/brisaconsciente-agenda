<script setup>
import { nextTick } from 'vue'
import StepHorarios from '~/components/agenda/steps/StepHorarios.vue'
import StepIdentificacion from '~/components/agenda/steps/StepIdentificacion.vue'
import StepPaquete from '~/components/agenda/steps/StepPaquete.vue'
import StepProfesional from '~/components/agenda/steps/StepProfesional.vue'
import StepResumen from '~/components/agenda/steps/StepResumen.vue'

const config = useRuntimeConfig()
const siteKey = config.public.recaptchaSiteKey

useHead({
  title: 'Agenda Digital Brisa Consciente | Agenda tu sesión de terapias online',
  meta: [
    { name: 'description', content: 'Agenda Digital Brisa Consciente. Reserva tus sesiones de terapias online. Elige profesional, horario y paga de forma segura.' },
    { property: 'og:title', content: 'Agenda Digital Brisa Consciente' },
    { property: 'og:description', content: 'Agenda tus sesiones de terapias online. Elige profesional, horario y paga de forma segura.' },
    { property: 'og:type', content: 'website' },
  ],
})

const step = ref(0)
const totalSteps = 5

const form = reactive({
  name: '',
  email: '',
  isMinor: false,
  guardianName: '',
  professional: null,
  package: null,
  slots: []
})

const showBooking = ref(false)

const next = () => step.value++
const prev = () => step.value--

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

function loadRecaptcha() {
  if (document.querySelector('script[src*="recaptcha/api.js"]')) return
  const script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

const startBooking = () => {
  showBooking.value = true
  loadRecaptcha()
  nextTick(() => {
    const el = document.getElementById('booking-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
</script>

<template>
  <div class="min-h-screen bg-pastelWhite/80 font-sans">
    <template v-if="!showBooking">
      <!-- Hero Section -->
      <section class="relative overflow-hidden bg-gradient-to-br from-softGreen/70 via-white to-pastelBlue/70">
        <div class="max-w-5xl mx-auto px-4 py-20 md:py-32">
          <div class="flex flex-col md:flex-row items-center gap-10">
            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-3 mb-4">
                <img src="/img/logo1.png" alt="Brisa Consciente" class="h-16 w-auto" />
              </div>
              <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
                Agenda Digital -
                Brisa Consciente
              </h1>
              <p class="text-lg text-gray-500 mb-8 max-w-lg">
                Agenda tus sesiones de terapias online de forma fácil y segura. 
                Elige tu profesional, selecciona el horario que más te acomode y 
                paga con total tranquilidad.
              </p>
              <button
                @click="startBooking"
                class="inline-block bg-softGreen hover:bg-pastelGreen text-white font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Agendar sesión
              </button>
            </div>
            <div class="flex-1 flex justify-center">
              <img src="/img/logo1.png" alt="Brisa Consciente" class="h-48 md:h-64 w-auto opacity-80" />
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-pastelWhite/80 to-transparent"></div>
      </section>

      <!-- Cómo funciona -->
      <section class="py-20 px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">¿Cómo funciona?</h2>
          <div class="grid md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-softGreen text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 class="font-semibold text-gray-700 mb-2">Elige tu profesional</h3>
              <p class="text-gray-500 text-sm">Conoce a nuestro equipo y selecciona al terapeuta ideal para ti.</p>
            </div>
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-softGreen text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 class="font-semibold text-gray-700 mb-2">Selecciona tu plan</h3>
              <p class="text-gray-500 text-sm">Elige entre sesión individual o paquete de sesiones según tu necesidad.</p>
            </div>
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-softGreen text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 class="font-semibold text-gray-700 mb-2">Escoge horarios</h3>
              <p class="text-gray-500 text-sm">Revisa la disponibilidad y agenda las fechas que prefieras.</p>
            </div>
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-softGreen text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">4</div>
              <h3 class="font-semibold text-gray-700 mb-2">Paga y confirma</h3>
              <p class="text-gray-500 text-sm">Paga de forma segura y recibe tu confirmación por email.</p>
            </div>
          </div>
        </div>
      </section>


      <!-- CTA Final -->
      <section class="py-20 px-4 text-center">
        <h2 class="text-3xl font-bold text-gray-800">¿Listo para comenzar?</h2>
        <p class="text-gray-500 mb-8 text-lg">Agenda tu primera sesión en pocos minutos.</p>
        <button
          @click="startBooking"
          class="inline-block bg-softGreen hover:bg-pastelGreen text-white font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          Agendar sesión
        </button>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-800 text-gray-400 py-10 px-4">
        <div class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm">&copy; {{ new Date().getFullYear() }} Brisa Consciente &mdash; Centro Terapéutico</p>
          <div class="flex gap-6 text-sm">
            <NuxtLink to="/privacidad" class="hover:text-white transition-colors">Política de Privacidad</NuxtLink>
          </div>
        </div>
      </footer>
    </template>

    <template v-if="showBooking">
      <!-- Booking Flow -->
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
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
            <div class="flex items-center justify-between mb-3">
              <p class="text-white/90 text-sm font-medium">Reserva tu sesión</p>
              <button
                @click="showBooking = false"
                class="text-white/80 hover:text-white text-sm underline transition-colors"
              >
                Volver
              </button>
            </div>
            <div class="flex gap-2">
              <div v-for="i in totalSteps" :key="i" :class="['h-1.5 flex-1 rounded-full transition-all duration-500',
                (i - 1) <= step ? 'bg-white' : 'bg-black/20']">
              </div>
            </div>
          </div>

          <div class="p-8">
            <StepIdentificacion v-if="step === 0"
              v-model:name="form.name"
              v-model:email="form.email"
              v-model:isMinor="form.isMinor"
              v-model:guardianName="form.guardianName"
              @next="next" />

            <StepProfesional v-if="step === 1" :selected="form.professional" @select="selectProfessional"
              @next="next" @prev="prev" />

            <StepPaquete v-if="step === 2" :professional="form.professional" :selected="form.package"
              @select="selectPackage" @next="next" @prev="prev" />

            <StepHorarios v-if="step === 3" :professional="form.professional" :package="form.package"
              :selected-slots="form.slots" @toggle="toggleSlot" @next="next" @prev="prev" />

            <StepResumen v-if="step === 4" :form="form" @prev="prev" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
