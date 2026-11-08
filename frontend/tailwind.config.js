/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F28C28',
          deep: '#D96516',
          cream: '#FFF9F0',
          dark: '#242424',
          accent: '#FFB03B',
          lightOrange: '#FFE9D6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 10px 25px -5px rgba(242, 140, 40, 0.25), 0 8px 10px -6px rgba(217, 101, 22, 0.2)',
        'brand-lg': '0 20px 35px -5px rgba(242, 140, 40, 0.35), 0 10px 15px -5px rgba(217, 101, 22, 0.25)',
      }
    },
  },
  plugins: [],
}
