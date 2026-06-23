/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff5ff',
          100: '#dfe8ff',
          200: '#bfcfff',
          300: '#91a8ff',
          400: '#6d84ff',
          500: '#4a5fff',
          600: '#3a4fe6',
          700: '#313fbb',
          800: '#293291',
          900: '#22286f'
        }
      },
      boxShadow: {
        glow: '0 25px 80px rgba(74, 95, 255, 0.12)',
      },
    },
  },
  plugins: [],
};
