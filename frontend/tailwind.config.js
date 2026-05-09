/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        alabaster: {
          DEFAULT: "#FFFFFF",
          surface: "#F9F9F9",
          border: "#E9ECEF",
          muted: "#6C757D",
          deep: "#111111",
        },
      },
    },
  },
  plugins: [],
}
