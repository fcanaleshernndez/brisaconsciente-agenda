// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        pastelWhite: "#FAF9F6",
        pastelPink: "#F2C1D1",
        softPink: "#FADADD",
        pastelGreen: "#B8E6D5",
        softGreen: "#A8D5BA",
        pastelBlue: "#60c3e7",
        softBlue: "#a5e3e9",
        baseGray: "#b3b3b3",
      },
    },
  },
  plugins: [],
}