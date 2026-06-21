/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#4F46E5', // Primary Indigo
          600: '#4338ca', // Hover Indigo
          700: '#3730a3', // Dark Indigo
          800: '#312e81',
          900: '#1e1b4b',
        },
        accent: {
          50: '#ecfeff',
          500: '#06B6D4', // Accent Cyan
          600: '#0891b2',
        },
        dark: {
          50: '#F8FAFC',  // Background
          100: '#6B7280', // Muted Text
          200: '#E2E8F0', // Border
          300: '#111827', // Text Primary
          700: '#cbd5e1',
          800: '#F1F5F9', // Surface / gray-100 (for inputs, secondary buttons)
          900: '#FFFFFF', // Card/Surface Background (White)
          950: '#F8FAFC', // Background
        }
      },
      fontSize: {
        'xs': ['14px', { lineHeight: '20px' }],
        'sm': ['16px', { lineHeight: '24px' }],
        'base': ['18px', { lineHeight: '28px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['22px', { lineHeight: '32px' }],
        '2xl': ['26px', { lineHeight: '34px' }],
        '3xl': ['32px', { lineHeight: '38px' }],
        '4xl': ['38px', { lineHeight: '44px' }],
        '5xl': ['50px', { lineHeight: '1' }],
        '6xl': ['62px', { lineHeight: '1' }],
        '7xl': ['74px', { lineHeight: '1' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(108, 99, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(108, 99, 255, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
