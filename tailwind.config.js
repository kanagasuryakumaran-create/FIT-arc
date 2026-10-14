/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        forest: {
          50: '#f2f9f5',
          100: '#e1f2e8',
          200: '#c5e4d2',
          300: '#9bcfb3',
          400: '#6bb48f',
          500: '#469871',
          600: '#327c59',
          700: '#276247',
          800: '#224e3a',
          900: '#1d4131',
        },
        wellness: {
          bg: '#FAFAF9',       // Warm off-white background
          card: '#FFFFFF',     // Clean white card surface
          subtle: '#F5F5F4',   // Warm subtle element fill
          border: '#E7E5E4',   // Warm stone border
          charcoal: '#1C1917', // Deep warm charcoal for headings
          muted: '#78716C',    // Muted secondary text
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 30px -4px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'floating': '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
        'emerald-sm': '0 2px 8px -1px rgba(5, 150, 105, 0.2)',
        'emerald-md': '0 4px 16px -2px rgba(5, 150, 105, 0.25)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
