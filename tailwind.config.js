/** @type {import('tailwindcss').Config} */

// Themed colours are CSS variables (index.css) holding "R G B", so light and dark
// share every class and Tailwind's opacity modifiers (bg-zinc-900/60) keep working.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // `dark:` utilities follow the resolved theme on <html data-theme>, not just the OS setting.
  darkMode: ['selector', '[data-theme="dark"]'],
  // Hover styles only on devices that can hover: no 'sticky' hover after taps on phones.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // The neutral scale flips between themes: 950 is always the page, 50 the strongest text.
        zinc: {
          50: v('z50'),
          100: v('z100'),
          200: v('z200'),
          300: v('z300'),
          400: v('z400'),
          500: v('z500'),
          600: v('z600'),
          700: v('z700'),
          800: v('z800'),
          900: v('z900'),
          950: v('z950'),
        },
        // "olive" is the forest green of the design (header, primary button).
        olive: {
          DEFAULT: '#2d7749',
          200: v('olive-200'),
          300: v('olive-300'),
          400: '#40a064',
          500: '#2d7749',
          600: '#1f5a37',
          900: v('olive-900'),
        },
        sand: {
          DEFAULT: v('sand'),
          100: v('sand-100'),
          200: v('sand-200'),
          300: v('sand-300'),
          400: v('sand'),
          500: v('sand-500'),
          900: v('sand-900'),
        },
        // Text on green / bark fills: light in both themes.
        cream: '#f7f8e8',
        bark: '#483838',
        lime: '#d2d79f',
        rose: v('rose'),
      },
      fontFamily: {
        // Bundled and precached (src/assets/fonts), so the app looks the same offline.
        sans: ['"Nunito Var"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"Exo 2 Var"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        button: '0 10px 24px -12px rgb(45 119 73 / 0.9), inset 0 1px 0 rgb(255 255 255 / 0.25)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-out': { from: { opacity: 1 }, to: { opacity: 0 } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        'scene-in': { from: { opacity: 0, transform: 'scale(0.94)' }, to: { opacity: 1, transform: 'none' } },
        'slide-from-right': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-from-left': { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'none' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'sheet-down': { from: { transform: 'none' }, to: { transform: 'translateY(100%)' } },
        'pop-in': { from: { opacity: 0, transform: 'scale(0.9) translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        'pop-out': { from: { opacity: 1, transform: 'none' }, to: { opacity: 0, transform: 'scale(0.97) translateY(4px)' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(10px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        'toast-out': { from: { opacity: 1, transform: 'none' }, to: { opacity: 0, transform: 'translateY(6px) scale(0.98)' } },
        // A plant (or a tile) springing out of the ground.
        sprout: {
          '0%': { opacity: 0, transform: 'scale(0.2) translateY(12px)' },
          '60%': { opacity: 1, transform: 'scale(1.08) translateY(-2px)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0)' },
          '20%': { transform: 'rotate(-6deg) scale(1.04)' },
          '45%': { transform: 'rotate(5deg)' },
          '70%': { transform: 'rotate(-3deg)' },
          '85%': { transform: 'rotate(1.5deg)' },
        },
        // Light sweeping across the start button.
        shimmer: {
          '0%, 55%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        bar: { from: { transform: 'scaleY(0)' }, to: { transform: 'none' } },
        // Live session: the timer card's border breathes between olive and gold.
        'live-glow': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgb(64 160 100 / 0.4), 0 0 48px -16px rgb(64 160 100 / 0.55)' },
          '50%': { boxShadow: '0 0 0 1px rgb(204 212 120 / 0.6), 0 0 72px -14px rgb(204 212 120 / 0.5)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'fade-out': 'fade-out 180ms ease-in both',
        'fade-up': 'fade-up 420ms cubic-bezier(.2,.8,.2,1) both',
        'scene-in': 'scene-in 500ms cubic-bezier(.2,.8,.2,1) both',
        'slide-from-right': 'slide-from-right 320ms cubic-bezier(.2,.8,.2,1) both',
        'slide-from-left': 'slide-from-left 320ms cubic-bezier(.2,.8,.2,1) both',
        'sheet-up': 'sheet-up 340ms cubic-bezier(.2,.8,.2,1) both',
        'sheet-down': 'sheet-down 200ms ease-in both',
        'pop-in': 'pop-in 260ms cubic-bezier(.34,1.56,.64,1) both',
        'pop-out': 'pop-out 180ms ease-in both',
        'toast-in': 'toast-in 260ms cubic-bezier(.2,.8,.2,1) both',
        'toast-out': 'toast-out 180ms ease-in both',
        sprout: 'sprout 620ms cubic-bezier(.34,1.56,.64,1) both',
        wiggle: 'wiggle 700ms ease-in-out both',
        shimmer: 'shimmer 4.5s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        bar: 'bar 800ms cubic-bezier(.2,.8,.2,1) both',
        'live-glow': 'live-glow 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
