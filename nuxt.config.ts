export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL
  },
  vite: {
    server: {
      allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io']
    }
  },
})