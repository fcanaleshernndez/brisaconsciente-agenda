export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      companyName: 'Brisa Consciente',
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
    }
  },
  vite: {
    server: {
      allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io']
    }
  },
})