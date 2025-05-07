/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0e9dea",
      },
      animation: {
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },  
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
