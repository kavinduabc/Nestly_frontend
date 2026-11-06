/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E56',
          50: '#E8F5F1',
          100: '#C5E8DC',
          200: '#8DD1BB',
          300: '#55BA9A',
          400: '#1D9E75',
          500: '#0F6E56',
          600: '#0C5A46',
          700: '#094536',
          800: '#063025',
          900: '#031A15',
        },
        teal: {
          light: '#1D9E75',
          DEFAULT: '#0F6E56',
        },
        amber: {
          accent: '#EF9F27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
