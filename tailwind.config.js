/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bubbleBlue: '#CFE9FF',
        bubblePink: '#FFD6E7'
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-18px) scale(1.05)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pop: 'pop .18s cubic-bezier(.2,.9,.3,1)'
      }
    },
  },
  plugins: [],
}
