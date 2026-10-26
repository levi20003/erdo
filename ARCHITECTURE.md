# Architecture

FocusGrove is a single-page React app with no backend. Everything — state, history, settings — lives in `localStorage`; a service worker makes the app work offline.

```
main.jsx
└─ ErrorBoundary            crash screen instead of a blank page (no store dependency)
   └─ AppStoreProvider      reducer + persistence + cross-tab sync
      └─ LanguageRoot       applies prefs.lang, remounts the UI on change
         └─ ToastProvider   toasts, suppressed during focus (distraction lock)
            └─ App          timer (usePomodoro), dashboard, sheets
```

## Source layout

| Path | Responsibility |
| --- | --- |
| `src/store/reducer.js` | All state transitions. Pure: time-dependent actions carry `now`. |
| `src/store/actions.js` | Action creators (read the clock, the reducer doesn't). |
| `src/store/boot.js` | Reads saved state once per page load, lazily (no import-time side effects). |
| `src/store/usePersistence.js` | Saves every state change; applies other tabs' saves (`HYDRATE`). |
| `src/store/AppStore.jsx` | Context provider composing the above. |
| `src/lib/storage.js` | `localStorage` I/O: load + migrate + repair, save with quota recovery, cross-tab events. |
| `src/lib/migrations.js` | Versioned, pure migration steps. |
| `src/lib/sanitize.js` | Field-by-field validation of any saved data into a valid current-version state. |
| `src/lib/errorLog.js` | Local, anonymised, capped error log. |
| `src/lib/ticker.js` | Countdown tick scheduling (framework-free, unit-tested). |
| `src/lib/strictGuard.js` | Strict Mode decisions (framework-free, unit-tested). |
| `src/lib/strings.js`, `src/lib/i18n/*` | Localisation (Hungarian default + fallback, English). |
| `src/lib/exportData.js` | JSON backup/restore, CSV export. |
| `src/lib/shareCard.js` | Canvas rendering of the share image. |
| `src/lib/insights.js`, `src/lib/stats.js` | Derived numbers (streak, totals, weekly comparison). |
| `src/hooks/` | React wiring: `usePomodoro`, `useStrictMode`, `useTicker`, `useWakeLock`, `useToday`, … |
| `src/components/` | UI, grouped by area (timer, growth, dashboard, categories, settings, share, feedback…). |
| `public/sw.js` | Service worker; `vite.config.js` injects the hashed asset list at build time. |

## State

```js
{
  schemaVersion: 2,
  categories: [{ id, name, color, growth: 'tolgy' | 'fenyves' | 'szikla' | 'gomba' }],
  sessions:   [{ id, categoryId, start, end, durationSec, status: 'completed' | 'failed', reason? }],
  selectedCategoryId,
  timer: null | { phase: 'focus' | 'break', categoryId, startedAt, endsAt, durationSec, pageLoadId? },
  prefs: { breakGuide: 'breathing' | 'stretch', lang: 'hu' | 'en', feedback: null | { shownAt, dismissals, rating } },
}
```

Session ids are derived from the focus block's start (`s-<startedAt>`), so the same block can never be logged twice — not even by two tabs.

## Persistence, versioning and recovery

`storage.load()` runs once per page load and returns `{ state, status }`:

| Status | Meaning | What the user sees |
| --- | --- | --- |
| `empty` | First run | Defaults |
| `ok` | Current version | — |
| `migrated` | Older schema, upgraded; untouched copy saved as `focusgrove:v1:backup-v<N>` | Info notice |
| `newer` | Written by a newer app version; read best-effort, unknown fields preserved on save, copy saved | Info notice |
| `repaired` | Unreadable JSON; defaults used, raw copy saved as `focusgrove:v1:corrupt-<time>` | Warning |
| `unavailable` / `failing` | Storage blocked or writes failing | Warning |

`save()` skips identical writes. On `QuotaExceededError` it frees space the app owns (corrupt copies, most of the error log) and retries once; it never throws.

**Adding a schema change:** bump `SCHEMA_VERSION` in `lib/config.js`, add `STEPS[N]` in `lib/migrations.js` (pure, keeps unknown fields), extend `lib/sanitize.js`, and add a case to `__tests__/migrations.test.js`. The storage key stays `focusgrove:v1` so existing data keeps loading.

## Timer engine

- The timer stores **timestamps** (`startedAt`, `endsAt`); remaining time is always `endsAt − now`, clamped to the phase length. Nothing accumulates, so nothing drifts.
- `lib/ticker.js` schedules exactly one timeout, at the next whole-second boundary of the countdown (or the end of the celebration), and re-reads the clock whenever the page becomes visible. One render per visible change; no stacked intervals.
- Completion is keyed by the phase's identity, so a block completes once even if effects re-run. A focus block completes only in the tab that runs it, and only while the user is present.
- After a completed block, the break's `startedAt` is set `CELEBRATION_MS` (3.6 s) in the future: the celebration plays first, then exactly 5 minutes of break.
- There is deliberately **no pause** — the strict 25/5 cycle is the product.

## Strict Mode

`lib/strictGuard.js` decides; `hooks/useStrictMode.js` feeds it `visibilitychange`, `pagehide`, `blur` and `focus`.

- Leaving starts an absence. Returning within `LEAVE_GRACE_MS` (5 s) forgives it; otherwise the block fails — decided by a timer where the page keeps running, or on return where the OS froze timers.
- A focus block found at page load (reload / reopen) fails. A block started in another tab is mirrored, not enforced.
- `useWakeLock` keeps the screen on during focus and re-acquires the lock on return; unsupported browsers just skip it. The web cannot distinguish a manual screen lock from an app switch, so locking the phone counts as leaving.

## Localisation

`t` is one live object imported everywhere. `setLanguage()` replaces its contents with Hungarian merged with the target language (missing keys fall back to Hungarian, arrays merge by index), sets `<html lang>`, and `LanguageRoot` remounts the UI. Dates and numbers use `getLocale()` (`hu-HU` / `en-GB`). A unit test enforces key parity between the dictionaries.

## Errors

- `ErrorBoundary` catches render errors and offers reload, an emergency download (raw saved data + error log) and a reset that backs up first.
- `installGlobalErrorHandlers` logs uncaught errors and rejections. Storage, service worker, share and lazy-chunk failures are logged where they happen.
- Lazy screens (`lib/lazy.jsx`) show a "please reload" message if their chunk can't load (e.g. a deploy happened while the page was open).

## Performance

Measured in Chromium (5 s samples): an idle dashboard does **zero** layouts per second; a break went from 301 to 6 layouts and from 446 ms to 98 ms of main-thread work. The changes that got there:

- one render per displayed second instead of four, and dashboard cards memoised;
- ambient SVG motion (sway, spores, glow) runs only in the live focus scene (`motion-off` elsewhere);
- only the active breathing arc animates;
- `prefers-reduced-motion` disables motion and shows the celebration as a still card.

Bundle (production, gzip): main JS 78.7 kB, CSS 8.2 kB; Settings (2.0 kB) and Share (2.6 kB) load on demand. The service worker precaches all of it for offline use.
