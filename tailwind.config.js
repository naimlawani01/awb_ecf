/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elite Cargo Brand Colors
        elite: {
          50: '#e6f5f3',
          100: '#c5ebe6',
          200: '#8fd9d1',
          300: '#52c4b8',
          400: '#1eada0',
          500: '#049181',
          600: '#037a6c', // Main brand color
          700: '#026358',
          800: '#024d45',
          900: '#013a34',
          950: '#012520',
        },
        // Primary colors (teal-based)
        primary: {
          50: '#e6f5f3',
          100: '#c5ebe6',
          200: '#8fd9d1',
          300: '#52c4b8',
          400: '#1eada0',
          500: '#049181',
          600: '#037a6c',
          700: '#026358',
          800: '#024d45',
          900: '#013a34',
          950: '#012520',
        },
        // Dark theme colors
        cargo: {
          dark: '#0d1f1c',      // Dark teal-tinted
          darker: '#081512',    // Darker background
          light: '#1a3330',     // Lighter card background
          accent: '#05b89e',    // Bright teal accent
          gold: '#d4a853',      // Muted gold for highlights
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#0ea5e9',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
