/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%': { margin: '0px' },
          '100%': {},
        },
        slideUp: {
          '0%': {},
          '100%': { margin: '0px' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': {},
        },
        fadeOut: {
          '0%': {},
          '100%': { opacity: 0 },
        }
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeOut: 'fadeOut 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
