/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: '#FCFCFA',
          card: '#FFFFFF',
          panel: '#F4F4F2',
          hover: '#EFEFEF',
          active: '#E5E5E2',
        },
        txt: {
          primary: '#1A1A19',
          secondary: '#5C5C57',
          tertiary: '#8E8D88',
        },
        border: {
          light: '#EBEBE9',
          DEFAULT: '#E1E1DD',
          dark: '#A1A19D',
        },
        accent: {
          DEFAULT: '#2E5C8A',
          soft: '#E8EEF5',
          border: '#B2C6DB',
        },
        entity: {
          you: '#0F172A',
          company: '#DC2626',
          segment: '#059669',
          policy: '#D97706',
          concept: '#7C3AED',
          event: '#E11D48',
          product: '#4F46E5',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
