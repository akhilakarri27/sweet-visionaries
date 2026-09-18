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
          primary: '#E85D04',       // 🟧 Primary Orange (Buttons, CTA, highlights)
          'primary-hover': '#D04E00',
          'light-orange': '#FFF0E6',// 🟠 Light Orange (Offers/background sections)
          bg: '#FFF9F5',            // 🤍 Page Background
          card: '#FFFFFF',          // ⬜ Card (Product/category cards)
          charcoal: '#241B18',      // 🟤 Main Text (Headings)
          muted: '#6B625D',         // ⚪ Secondary Text (Descriptions)
          gold: {
            light: '#E5BF75',
            DEFAULT: '#D4A24C',     // 🟡 Gold Accent (Premium details)
            dark: '#B8842E',
            rich: '#D4A24C',
          },
          success: '#2E8B57',       // 🟢 Success (Stock/order status)
          cream: '#FFF0E6',
          ivory: '#FFF9F5',
          surface: '#FFF0E6',
          border: '#EEDDD2',
          maroon: {
            light: '#F47324',
            DEFAULT: '#E85D04',     // Mapped to Primary Orange
            dark: '#C74A00',
          },
          amber: {
            DEFAULT: '#E85D04',
            dark: '#C74A00',
          },
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(232, 93, 4, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(232, 93, 4, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'gold': '0 8px 25px -4px rgba(212, 162, 76, 0.35)',
        'primary': '0 8px 25px -4px rgba(232, 93, 4, 0.35)',
        'float': '0 20px 40px -10px rgba(232, 93, 4, 0.25)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A24C 0%, #E5BF75 50%, #B8842E 100%)',
        'primary-gradient': 'linear-gradient(135deg, #E85D04 0%, #F47324 100%)',
        'maroon-gradient': 'linear-gradient(135deg, #E85D04 0%, #C74A00 100%)',
        'warm-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%)',
        'hero-pattern': 'radial-gradient(circle at 50% 50%, rgba(232, 93, 4, 0.08) 0%, rgba(255, 249, 245, 0) 70%)',
      }
    },
  },
  plugins: [],
}
