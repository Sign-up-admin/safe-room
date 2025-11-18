/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          50: '#ffffff',
          100: '#f8f4f1',
          150: '#f1ede9',
          200: '#e8e0d9',
          300: '#d4c4b7',
          400: '#b8a293',
          500: '#9c8170',
          600: '#806055',
          700: '#644741',
          800: '#48302d',
          900: '#2c1918',
        },
        foreground: {
          50: '#ffffff',
          100: '#ffffff',
          150: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          350: '#bfbfbf',
          400: '#a3a3a3',
          450: '#8b8b8b',
          500: '#737373',
          550: '#5c5c5c',
          600: '#525252',
          650: '#404040',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          100: '#acbce5',
          200: '#8a9fd3',
          300: '#6882c1',
          400: '#4665af',
          500: '#24489d',
          600: '#1e3a7d',
          700: '#182c5d',
          800: '#121e3d',
          900: '#0c101d',
        },
        muted: {
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        stroke: {
          350: '#d1d5db',
        },
      },
      fontFamily: {
        'ligatures': ['Ginto', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      fontSize: {
        'base-dense': ['1rem', { lineHeight: '1.625rem' }],
      },
      borderRadius: {
        '5xl': '1.75rem',
      },
      boxShadow: {
        'tinted-xl': 'rgba(0, 0, 0, 0.08) 0px 16px 24px 0px',
        'tinted-2xl': 'rgba(248, 188, 140, 0.18) 0px 16px 48px 0px',
      },
      backdropBlur: {
        '2xl': '32px',
      },
      backdropSaturate: {
        200: '2',
      },
      spacing: {
        'user-input': '1rem',
      },
      maxWidth: {
        'chat': 'min(100%,48rem)',
        'expanded-composer': 'min(100%,48rem)',
      },
      minWidth: {
        'secondary-panel-slim': '20rem',
        'secondary-panel': '24rem',
      },
      minHeight: {
        'composer': '4rem',
        'user-input-shallow': '5.5rem',
      },
      height: {
        'user-input': '22px',
        'dvh': '100dvh',
        'sidebar': 'calc(100dvh - 3.5rem)',
      },
      width: {
        'sidebar': '290px',
      },
      zIndex: {
        '60': '60',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
