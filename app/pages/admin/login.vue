<script setup>
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const data = await $fetch('/api/admin-login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    if (data.success) {
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.admin))
      navigateTo('/admin')
    }
  } catch (e) {
    error.value = e.data?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <img src="/img/logo1.png" alt="Brisa Consciente" class="h-20 mx-auto mb-4 [filter:drop-shadow(0_0_0.5px_black)]" />
        <h1 class="text-2xl font-bold text-gray-800">Admin</h1>
        <p class="text-gray-500">Ingresa tus credenciales</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" required placeholder="admin@brisaconsciente.cl"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
          <input v-model="password" type="password" required placeholder="••••••••"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="w-full bg-softGreen hover:bg-softGreen/70 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50">
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
