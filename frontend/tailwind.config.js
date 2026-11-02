/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#0B0B0D',
          secondary: '#141416',
          card: '#1B1B1F',
          elevated: '#222226',
          border: '#34343A',
          text: '#F5F5F5',
          muted: '#A1A1AA',
          silver: '#C0C0C0',
          orange: '#FF7900',
          orangeHover: '#FF922B',
          red: '#EF4444',
          green: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
