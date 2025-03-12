/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dolce-gold': '#FFE44D',
        'dolce-cream': '#F5F5DC',
        'dolce-dark': '#050505',
      },
      fontFamily: {
        'baskerville': ['Libre Baskerville', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 6s ease-in-out infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-12deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-12deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-20px) rotate(12deg)' },
        },
      },
    },
  },
  plugins: [],
}