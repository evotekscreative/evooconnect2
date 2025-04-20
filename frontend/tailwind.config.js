/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0e9dea", // Warna biru yang kamu pake di desain Laravel kamu
      },
    },
  },
  plugins: [],
}
