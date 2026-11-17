/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F7F8FA',
          surface: '#FFFFFF',
          sidebar: '#172235',
          text: '#202938',
          secondary: '#6B7280',
          border: '#E5E7EB',
          accent: '#2563A6',
          accentHover: '#1D4F85',
          success: '#27834A',
          warning: '#D69A32',
          error: '#C34848',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
