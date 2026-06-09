<script setup lang="ts">
definePageMeta({
  layout: 'agenda'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Política de Privacidad</h1>
        <p class="text-gray-500 text-sm mb-6">Última actualización: Junio 2026</p>

        <section class="mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">1. Datos que recolectamos</h2>
          <p class="text-gray-600">Para gestionar las reservas de sesiones, recolectamos:</p>
          <ul class="list-disc pl-5 mt-2 text-gray-600 space-y-1">
            <li>Nombre completo del paciente</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Nombre del tutor (si el paciente es menor de edad)</li>
          </ul>
        </section>

        <section class="mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">2. Uso de los datos</h2>
          <p class="text-gray-600">Los datos se utilizan exclusivamente para:</p>
          <ul class="list-disc pl-5 mt-2 text-gray-600 space-y-1">
            <li>Gestionar y confirmar reservas de sesiones</li>
            <li>Enviar recordatorios de citas vía correo electrónico</li>
            <li>Enviar enlaces de videollamada (Jitsi)</li>
            <li>Comunicar cambios o cancelaciones</li>
          </ul>
        </section>

        <section class="mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">3. Almacenamiento</h2>
          <p class="text-gray-600">Los datos se almacenan en una base de datos segura. No compartimos datos personales con terceros, excepto los servicios necesarios para el funcionamiento:</p>
          <ul class="list-disc pl-5 mt-2 text-gray-600 space-y-1">
            <li>Jitsi Meet (generación de enlaces de videollamada)</li>
            <li>Flow (procesamiento de pagos)</li>
          </ul>
        </section>

        <section class="mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">4. Derechos del usuario</h2>
          <p class="text-gray-600">Puedes solicitar la eliminación de tus datos en cualquier momento contactando a <a href="mailto:info@brisaconsciente.cl" class="text-teal-600 hover:underline">info@brisaconsciente.cl</a>.</p>
        </section>

        <div class="mt-8 flex items-center justify-between">
          <NuxtLink to="/" class="text-teal-600 hover:underline text-sm">&larr; Volver</NuxtLink>
          <p class="text-gray-500 text-sm">Brisa Consciente &mdash; Centro Terapéutico</p>
        </div>
      </div>
    </div>
  </div>
</template>
