/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#211B19',
          darker: '#161210',
          dark: '#1C1614',
          surface: '#292321',
          elevated: '#332C2A',
        },
        charcoal: {
          DEFAULT: '#292321',
          light: '#3D3532',
          border: 'rgba(255, 245, 232, 0.12)',
        },
        bronze: {
          DEFAULT: '#8E725B',
          light: '#A68971',
          dark: '#6E5643',
        },
        ivory: {
          DEFAULT: '#FFF5E8',
          muted: '#C5B2A0',
          dim: '#9E8A78',
        },
        cream: {
          DEFAULT: '#FFF5E8',
          50: '#FFFFFF',
          100: '#FFFDF9',
          200: '#FFF5E8',
          300: '#FDECD4',
          400: '#FCE0BD',
        },
        beige: {
          DEFAULT: '#F0E1CE',
          light: '#F8F1E7',
          dark: '#E2CEB7',
        },
        chocolate: {
          DEFAULT: '#594337',
          light: '#725747',
          dark: '#413027',
          deep: '#2F2119',
        },
        gold: {
          DEFAULT: '#E9B95B',
          light: '#F2CE85',
          dark: '#D99F37',
          glow: 'rgba(233, 185, 91, 0.35)',
        },
        rose: {
          DEFAULT: '#E9B8B0',
          light: '#F4D2CC',
          dark: '#D89A90',
        },
        peach: {
          DEFAULT: '#F6C9A8',
          light: '#FBDDC6',
          dark: '#E8B188',
        },
        mutedBrown: {
          DEFAULT: '#927B6C',
          light: '#AA9586',
          dark: '#7A6455',
        },
        school: {
          gold: '#E9B95B',
          amber: '#D99F37',
          crimson: '#C84B31',
          navy: '#2D4059',
          sunset: '#E9B8B0',
          teal: '#4E9F8E',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        kalam: ['Kalam', 'cursive'],
        tamil: ['Noto Sans Tamil', 'Outfit', 'sans-serif'],
      },
      borderRadius: {
        'clay-card': '28px',
        'clay-button': '18px',
        'clay-input': '16px',
        'clay-sm': '14px',
        'clay-lg': '32px',
        'clay-xl': '40px',
      },
      boxShadow: {
        'clay': '8px 8px 20px rgba(89, 67, 55, 0.10), -8px -8px 20px rgba(255, 255, 255, 0.85)',
        'clay-hover': '12px 12px 26px rgba(89, 67, 55, 0.13), -10px -10px 24px rgba(255, 255, 255, 0.90)',
        'clay-card': '10px 10px 24px rgba(89, 67, 55, 0.10), -10px -10px 24px rgba(255, 255, 255, 0.90)',
        'clay-button': '6px 6px 14px rgba(89, 67, 55, 0.12), -5px -5px 12px rgba(255, 255, 255, 0.85)',
        'clay-pressed': 'inset 4px 4px 8px rgba(89, 67, 55, 0.15), inset -3px -3px 8px rgba(255, 255, 255, 0.70)',
        'clay-gold': '8px 8px 20px rgba(217, 159, 55, 0.25), -6px -6px 16px rgba(255, 255, 255, 0.90)',
        'clay-rose': '8px 8px 20px rgba(216, 154, 144, 0.25), -6px -6px 16px rgba(255, 255, 255, 0.90)',
        'clay-floating': '0 20px 35px -10px rgba(89, 67, 55, 0.18), 0 0 20px rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'swing': 'swing 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
