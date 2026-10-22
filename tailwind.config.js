/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Hover styles only on devices that can hover: no 'sticky' hover after taps on phones.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#5f6239',
          200: '#c9cb9c',
          300: '#a9ac72',
          400: '#80844d',
          500: '#5f6239',
          600: '#4b4d2c',
          900: '#202116',
        },
        sand: {
          DEFAULT: '#c9ab84',
          100: '#f3ebdf',
          200: '#e6d6bf',
          300: '#d9c09f',
          400: '#c9ab84',
          500: '#b08f63',
          900: '#2a2319',
        },
      },
      fontFamily: {
        // System stacks only: nothing is downloaded, so the app looks the same offline.
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-out': { from: { opacity: 1 }, to: { opacity: 0 } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        'scene-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'none' } },
        'slide-from-right': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-from-left': { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'none' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'sheet-down': { from: { transform: 'none' }, to: { transform: 'translateY(100%)' } },
        'pop-in': { from: { opacity: 0, transform: 'scale(0.96) translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
        'pop-out': { from: { opacity: 1, transform: 'none' }, to: { opacity: 0, transform: 'scale(0.97) translateY(4px)' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(10px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        'toast-out': { from: { opacity: 1, transform: 'none' }, to: { opacity: 0, transform: 'translateY(6px) scale(0.98)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'fade-out': 'fade-out 180ms ease-in both',
        'fade-up': 'fade-up 320ms cubic-bezier(.2,.8,.2,1) both',
        'scene-in': 'scene-in 500ms cubic-bezier(.2,.8,.2,1) both',
        'slide-from-right': 'slide-from-right 320ms cubic-bezier(.2,.8,.2,1) both',
        'slide-from-left': 'slide-from-left 320ms cubic-bezier(.2,.8,.2,1) both',
        'sheet-up': 'sheet-up 320ms cubic-bezier(.2,.8,.2,1) both',
        'sheet-down': 'sheet-down 200ms ease-in both',
        'pop-in': 'pop-in 220ms cubic-bezier(.2,.8,.2,1) both',
        'pop-out': 'pop-out 180ms ease-in both',
        'toast-in': 'toast-in 260ms cubic-bezier(.2,.8,.2,1) both',
        'toast-out': 'toast-out 180ms ease-in both',
      },
    },
  },
  plugins: [],
}
