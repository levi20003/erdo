# FocusGrove

An offline-first focus timer PWA (strict Pomodoro: 25/5, 50/10 or 90/15). Every focus block grows a plant in your forest. There is no account, no ads, no tracking: all data stays in the browser's `localStorage`.

**Live:** https://levi20003.github.io/erdo/ · Hungarian (default) and English · Installable on Android, iOS and desktop.

## Features

- **Strict focus blocks.** 25/5 by default, 50/10 and 90/15 for deep work. No pause button by design. Leaving the app for more than 5 s fails the block; a reload fails it too. The screen is kept awake during focus (Screen Wake Lock).
- **Sounds.** An end-of-timer chime that plays even without background sound (repeats until you tap, vibrates on Android), and free background sounds during focus — rain, forest, stream, brown noise — synthesised on the device.
- **Erdő theme.** Four starter plants and six to unlock (Napraforgó at 3 sessions … Mamutfenyő at 100), five stages each, animated SVG; the scene follows the season and is day or night with the theme.
- **My forest.** Every block you finish grows a plant, every block you abandon leaves a withered one. Browse by day, week, month or year, tap a plant for its details, share a period.
- **Four screens.** Focus, My forest, Stats, Profile — a bark-brown tab bar on phones, back button works. A welcome screen and profile set-up on first run.
- **Focus mode.** When a block starts, everything else steps away: only the plant, the clock, sounds and *Give up* remain. Optional full-screen view.
- **Light and dark mode**, following the device or chosen in the header: a meadow by day, the forest at night.
- **Local profile, no account.** A name and a forest-animal avatar; a new phone "signs in" by restoring a backup.
- **Rewards.** Daily goal ring, forester levels (XP), completion celebration with level-ups and unlocks, daily streak, year map, weekly history, insights.
- **Challenge a friend** with a link — no server, no account; the friend replies with their score the same way.
- **Your data.** JSON backup and restore (merge), CSV export for spreadsheets, shareable forest image, local error log.
- **Resilient.** Versioned storage with migrations and automatic backups, repair of damaged data, recovery when storage is full, crash screen instead of a blank page.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # lint + unit tests + production build
npm run test:e2e     # Playwright end-to-end tests (builds and serves the app)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (no service worker) |
| `npm run build` | Production build into `dist/` (set `BASE_PATH=/erdo/` for GitHub Pages) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests against the production build |
| `npm run check` | lint + unit tests + build (what the deploy gate runs) |
| `npm run icons` | Regenerate PNG app icons (Python + Pillow) |

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`: lint → unit tests → build → GitHub Pages. `.github/workflows/ci.yml` additionally runs the Playwright suite on every push and pull request.

## Documentation

| Document | Contents |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Modules, state, persistence and migrations, timer engine, strict mode, i18n, performance |
| [TESTING.md](TESTING.md) | Test suites, how to run them, manual device checklist |
| [PRIVACY.md](PRIVACY.md) | What is stored, where, and what never leaves the device |
| [PRODUCT_METRICS.md](PRODUCT_METRICS.md) | The local metrics the app shows and how to measure the beta without tracking |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [docs/marketing/](docs/marketing/) | Landing page copy, TikTok/Reels concepts, beta feedback prompt (Hungarian) |

## Tech

React 18, Vite 6, Tailwind CSS 3.4. Runtime dependencies: `react` and `react-dom` only. Fonts: Exo 2 and Nunito (SIL Open Font License, bundled in `src/assets/fonts`). Dev tooling: Vitest, Playwright, ESLint.
