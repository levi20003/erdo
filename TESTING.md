# Testing

```bash
npm run lint        # ESLint
npm test            # Vitest unit tests (≈1 s)
npm run test:e2e    # Playwright: builds the app, serves it, runs the browser suite (≈30 s)
npm run check       # lint + unit tests + build
```

CI (`.github/workflows/ci.yml`) runs all of it on every push and pull request; the deploy workflow refuses to publish if lint or unit tests fail.

## Unit tests (`src/__tests__/`, Vitest)

| File | Covers |
| --- | --- |
| `reducer.test.js` | Start / complete / fail rules, double-dispatch, celebration → 5-min break, one id per block, guarded deletes |
| `features.test.js` | Validated prefs (incl. `__proto__`), import merge, category id immutability, feedback state, insights, feedback-prompt rules |
| `sanitize.test.js` | Repair of garbage, broken sessions/categories/timers, duplicates, ordering |
| `migrations.test.js` | Every step present, v1 → v2, determinism and idempotency, newer-version data untouched |
| `storage.test.js` | Empty, corrupt JSON (copy kept), legacy (backup kept), newer version (unknown fields preserved), full quota (frees space, retries), blocked storage, no duplicate writes |
| `errorLog.test.js` | Anonymisation, entry and size caps, never throws, clearing |
| `exportData.test.js` | CSV BOM / separators / decimal marks per language, quoting, formula neutralisation, backup round-trip, emergency-file import, rejection of foreign files |
| `strictGuard.test.js` | Strict Mode with fake timers (forgiven peek, timed fail, frozen-timer fail, single verdict, no leaked timers); ticker alignment, no drift, single pending timer |
| `i18n.test.js` | Key parity HU ↔ EN, per-key fallback, units/locale/growth names switch together |
| `streak.test.js` | Streak across midnight and month boundaries, growth-stage thresholds |

`src/__tests__/helpers/memoryStorage.js` simulates `localStorage`, including quota limits and blocked storage.

## End-to-end tests (`e2e/`, Playwright)

Run against the **production build** (service worker included), with Playwright's fake clock so a 25-minute block takes seconds.

| Spec | Scenario |
| --- | --- |
| `focus-cycle` | Start → focus mode (only timer + Give up, no pause) → forest grows, stepper advances → completion celebration → 5-min break with breathing guide → dashboard returns → persisted across reload; give-up confirmation sheet |
| `strict-and-reload` | 2 s away forgiven, 6 s away fails; block that ends while briefly away still completes; reload mid-focus fails, reload during break keeps it |
| `data` | Corrupt storage opens with warning + copy; legacy data migrated with backup; CSV export; JSON backup → wipe → restore (merge, idempotent); share card is a 1080×1350 PNG |
| `ux` | English switch persists; feedback prompt after 5 sessions, dismissable, never during focus; 375×667 phone has no horizontal overflow; reduced motion shows a still celebration |

Projects: `desktop` (Chromium) and `mobile` (Chromium at 375×667, touch). Locally, `reuseExistingServer` lets you keep a preview running.

## Manual device checklist (before a release)

Automated tests run in Chromium. These need a real phone:

**Android (Chrome, installed PWA)**
- [ ] Install from the browser menu; the app opens standalone with the icon.
- [ ] Airplane mode → reopen → app loads and a full cycle works.
- [ ] Leave the phone on the table during focus: the screen stays on (wake lock).
- [ ] Switch to another app for ~2 s and come back: session continues. ~10 s: session fails.
- [ ] Lock the phone with the power button during focus: session fails on return (documented limitation).
- [ ] Share card: the native share sheet opens with the image.

**iOS (Safari 16.4+, Add to Home Screen)**
- [ ] Add to Home Screen; launches full screen; safe areas (notch, home bar) respected.
- [ ] Offline reopen works.
- [ ] Wake lock keeps the screen on (Safari 16.4+; support in home-screen mode has varied between iOS versions — where it's missing the app just skips it, so note the iOS version you tested).
- [ ] App switch > 5 s fails the session; < 5 s continues.
- [ ] Share card opens the share sheet (or downloads).
- [ ] CSV opens in Numbers with accents intact.

**Desktop**
- [ ] CSV opens in Hungarian Excel with columns split and accents intact.
- [ ] Two tabs: completing in one shows up in the other; no duplicates.
