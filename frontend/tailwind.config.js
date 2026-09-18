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
          cream: '#FAF7F2',
          ivory: '#FFFDF9',
          surface: '#F5EFEB',
          border: '#E8DFD5',
          gold: {
            light: '#FBBF24',
            DEFAULT: '#D97706',
            dark: '#B45309',
            rich: '#CA8A04',
          },
          maroon: {
            light: '#9F1239',
            DEFAULT: '#881337',
            dark: '#4C0519',
          },
          amber: {
            DEFAULT: '#F59E0B',
            dark: '#D97706',
          },
          charcoal: '#1C1917',
          muted: '#78716C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(136, 19, 55, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(180, 83, 9, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'gold': '0 8px 25px -4px rgba(217, 119, 6, 0.25)',
        'float': '0 20px 40px -10px rgba(76, 5, 25, 0.2)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)',
        'maroon-gradient': 'linear-gradient(135deg, #881337 0%, #4C0519 100%)',
        'warm-gradient': 'linear-gradient(180deg, #FFFDF9 0%, #FAF7F2 100%)',
        'hero-pattern': 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.08) 0%, rgba(250, 247, 242, 0) 70%)',
      }
    },
  },
  plugins: [],
}
