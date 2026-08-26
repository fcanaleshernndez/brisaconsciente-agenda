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
  nitro: {
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      '0 */2 * * *': ['cron:reminders'],
      // TESTING: cada 10 minutos - volver a '0 21 * * 0' (domingos 9pm) después de probar
      '*/10 * * * *': ['cron:bookings-report']
    }
  }
})