import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: '#D2EF9A',
        black: '#1F1F1F',
        secondary: '#696C70',
        secondary2: '#A0A0A0',
        white: '#ffffff',
        surface: '#F7F7F7',
        red: '#DB4444',
        purple: '#8684D4',
        success: '#3DAB25',
        line: '#E9E9E9',
        outline: 'rgba(0, 0, 0, 0.15)',
        surface2: 'rgba(255, 255, 255, 0.2)',
        surface1: 'rgba(255, 255, 255, 0.1)',
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        pink: {
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        yellow: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        cyan: {
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    container: {
      padding: {
        DEFAULT: '16px',
      },
    },
  },
  plugins: [],
}
export default config
