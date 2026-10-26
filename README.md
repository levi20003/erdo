# FocusGrove

An offline-first, strictly 25/5 Pomodoro PWA. Every focus block grows a plant in your forest. There is no account, no ads, no tracking: all data stays in the browser's `localStorage`.

**Live:** https://levi20003.github.io/erdo/ · Hungarian (default) and English · Installable on Android, iOS and desktop.

## Features

- **Strict 25/5 cycle.** No pause button by design. Leaving the app for more than 5 s fails the block; a reload fails it too. The screen is kept awake during focus (Screen Wake Lock).
- **Erdő theme.** Four growth items (Öreg Tölgy, Fenyves, Mohás Szikla, Erdei Gomba), five stages each, animated SVG.
- **Focus mode.** When a block starts, the dashboard steps away: only the plant, the clock and *Give up* remain. Optional full-screen view.
- **Rewards.** Completion celebration, daily streak with milestones, weekly history, local "My progress" insights.
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

React 18, Vite 6, Tailwind CSS 3.4. Runtime dependencies: `react` and `react-dom` only. Dev tooling: Vitest, Playwright, ESLint.
