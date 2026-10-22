# FocusGrove

Ultra-focused, offline-first 25/5 Pomodoro PWA. React 18 · Vite 6 · Tailwind CSS 3.4.
No backend and no external APIs. All data lives in `localStorage` (`focusgrove:v1`).

```bash
npm install
npm run dev                         # http://localhost:5173
npm run build && npm run preview    # production build + service worker (installable)
npm run icons                       # regenerate PNG app icons (needs Python + Pillow)
```

## How it behaves
| Feature | Where |
| --- | --- |
| Erdő theme: each category grows Öreg Tölgy, Fenyves, Mohás Szikla or Erdei Gomba through 5 stages | `src/lib/growth.js`, `src/components/growth/` |
| Fixed 25 min focus → 5 min break (no pause button) | `src/lib/config.js`, `src/store/reducer.js` |
| Break guide: box breathing (4-4-4-4) or 5 × 1-min stretches | `src/components/breaks/BreakGuide.jsx` |
| Distraction lock: toasts are queued during focus and shown afterwards; install/offline banners hidden | `src/components/toast/ToastProvider.jsx`, `src/components/Banners.jsx` |
| Fullscreen Focus View (Fullscreen API, with an overlay fallback for iOS) | `src/hooks/useFullscreen.js`, `src/components/timer/FocusView.jsx` |
| Strict Mode: tab hidden → fail; window blur → fail after 2 s unless focus returns; reload or close mid-session → fail | `src/hooks/useStrictMode.js` |
| Categories: create, rename, recolour (palette + custom picker), pick growth item, delete (bottom sheets) | `src/components/categories/`, `src/components/ui/Sheet.jsx` |
| Streak, total hours, success rate, today timeline, 7-day stacked chart with week-by-week history | `src/components/dashboard/`, `src/lib/stats.js` |
| PWA: `manifest.json`, PNG + maskable icons, service worker that precaches the hashed build | `public/`, `vite.config.js` (`precacheManifest` plugin) |

Failed sessions under 30 s are discarded. Longer ones are logged as `failed` and count towards the success rate, but not towards focus time or the streak. Deleting a category keeps its history, labelled "Törölt kategória".

All UI text is in `src/lib/strings.js`.

## Motion
Growth parts fade and scale in per stage (`.grow-part`), foliage sways, and fireflies drift during focus. All keyframes live in `src/index.css` and `tailwind.config.js`. Everything is disabled under `prefers-reduced-motion`.
