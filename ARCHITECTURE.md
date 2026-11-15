# Architecture

FocusGrove is a single-page React app with no backend. Everything — state, history, settings — lives in `localStorage`; a service worker makes the app work offline.

```
main.jsx
└─ ErrorBoundary            crash screen instead of a blank page (no store dependency)
   └─ AppStoreProvider      reducer + persistence + cross-tab sync
      └─ ThemeRoot          resolves prefs.theme (+ the OS setting) → <html data-theme>
         └─ LanguageRoot    applies prefs.lang, remounts the UI on change
         └─ ToastProvider   toasts, suppressed during focus (distraction lock)
            └─ App          timer (usePomodoro), tabs (useTab), screens, sheets
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
| `src/lib/sound.js` | Web Audio engine: unlock, chimes, phase-end sound + vibration, synthesised background sounds. |
| `src/lib/unlocks.js`, `src/lib/forest.js` | Plant unlock thresholds; My forest periods (day/week/month/year, Monday weeks). |
| `src/lib/levels.js` | XP (completed focus minutes) → level, progress and title. |
| `src/lib/challenge.js` | Friend challenges: create, encode/decode/validate links, status. |
| `src/lib/yearmap.js`, `src/lib/season.js` | Year map data; the season the forest scene dresses for. |
| `src/hooks/` | React wiring: `usePomodoro`, `useStrictMode`, `useTicker`, `useWakeLock`, `useSoundscape`, `useTab`, `useToday`, … |
| `src/components/` | UI, grouped by area (timer, growth, forest, stats, settings, sound, onboarding, layout, share, feedback…). |
| `public/sw.js` | Service worker; `vite.config.js` injects the hashed asset list at build time. |

## State

```js
{
  schemaVersion: 6,
  categories: [{ id, name, color, growth: 'tolgy' | 'fenyves' | 'szikla' | 'gomba' | 'nyir' | 'cseresznye' }],
  sessions:   [{ id, categoryId, start, end, durationSec, status: 'completed' | 'failed', reason?, plannedSec? }],
  selectedCategoryId,
  timer: null | { phase: 'focus' | 'break', categoryId, startedAt, endsAt, durationSec, breakSec?, pageLoadId? },
  prefs: {
    breakGuide: 'breathing' | 'stretch', lang: 'hu' | 'en', feedback: null | { shownAt, dismissals, rating },
    onboarded: boolean,
    sound: { chime: 'harang' | 'csengo' | 'madar' | 'fa' | 'off', volume: 0..1, vibrate: boolean,
             ambient: 'off' | 'eso' | 'erdo' | 'patak' | 'zaj', ambientVolume: 0..1 },
    theme: 'system' | 'light' | 'dark', preset: '25' | '50' | '90', dailyGoal: 1..12, nickname: string (≤ 20),
    avatar: 'sprout' | 'fox' | 'owl' | 'deer' | 'bear' | 'hedgehog' | 'rabbit' | 'squirrel' | 'frog',
  },
  challenges: [{ id, role: 'host' | 'guest', goal, days: 3 | 7 | 14, start: 'YYYY-MM-DD', opponent, opponentDone, opponentAt, createdAt }],
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

## Theme and design system

Colours are CSS variables holding `R G B` (`src/index.css`): the neutral `zinc` scale flips between dark and light (950 is always the page, 50 the strongest text), and the accent tokens (`sand`, `olive-200/300/900`, `rose`) shift so small text keeps its contrast on paper. `tailwind.config.js` maps every class to those variables, so one set of classes serves both themes; `dark:` utilities follow `<html data-theme>`. `index.html` sets `data-theme` before the first paint; `ThemeRoot` keeps it in sync with the preference and the OS. The forest scene picks a night or day palette and a seasonal one in JS (`ForestScene.jsx`).

Fonts are bundled: Exo 2 (titles, timer and other numbers, with tabular figures) and Nunito (text), each subset to Latin plus the Hungarian ő/ű, about 76 kB together, precached by the service worker.

The visual language follows the design mock-ups: a green gradient header (`Hero`) with greeting, daily tagline and avatar; the first card of each screen overlaps it (`-mt-12`); `.pale-card` (summary), `.leaf-card` (green "flashcards" with a lime blob and a pale wave, used by `LeafTile`), `.bar-fill` (maroon by day, lime by night), `.btn-primary` (forest-green pill) and `.btn-bark` (bark-brown pill) live in `index.css`; waves and pine silhouettes in `components/art/Shapes.jsx`. Header, card, leaf, bar and tab-bar colours are theme variables too.

## Focus lengths, goals, levels

`PRESETS` in `lib/config.js` defines 25/5, 50/10 and 90/15. `START_FOCUS` reads `prefs.preset` and stores the break length on the timer (`breakSec`), so changing the preset never affects a running block. A failed block stores `plannedSec` so its withered plant shows how far it got. The daily goal and levels are derived from the sessions on render (`useProgress`), never stored.

## Challenges (no server)

A challenge is created locally (`role: 'host'`) and shared as `…/#k=<base64url JSON>` holding `{ id, goal, days, start, nickname, count, sender role, time }`. `useChallengeInbox` reads the token on load and on `hashchange`, removes it from the address, and validates every field (`decodeChallenge`: id format, ranges, real calendar date within ±60 days, sane timestamps, ≤ 600 characters, nickname stripped of control/invisible characters). An unknown host link is an invitation (accept → `role: 'guest'`); a link from the other side updates the opponent's count only if it is newer; one's own link changes nothing. Each side's count is only as fresh as the last link received.

## Updates

`public/sw.js` precaches the build. The **first** install takes over immediately (offline from the first visit); an **update** installs and waits, so an open app never loses the files it is running. `src/lib/updates.js` owns the rest:

- it registers the worker, notices a waiting one (`updatefound` → `installed` while a controller exists), asks it for its version over a `MessageChannel`, and publishes `{ status: 'ready', version }` (`useUpdate`);
- `checkForUpdate()` calls `registration.update()` — quietly when the app returns to the foreground (at most every 30 minutes), visibly from **Profile → About**;
- `applyUpdate()` posts `SKIP_WAITING`, waits for `controllerchange` and reloads (with a timeout fallback); the next load shows "Updated: FocusGrove x.y.z";
- if the page already runs the waiting version (a manual reload fetched the new shell), the worker is activated silently, without a prompt;
- the prompt lives in `Banners`, which render nothing during a focus block — a reload would fail the block.

`vite.config.js` writes the asset list, a content hash and the app version into `dist/sw.js`.

## Screens and navigation

`useTab` maps four screens to URL hashes (`#fokusz`, `#erdo`, `#statisztika`, `#profil`; the old `#beallitasok` still opens Profile), so the browser/Android back button moves between them and a reload keeps the screen. `BottomNav` (phones) and `HeaderNav` (`md` and up) render the same items. While a focus block runs the screen is forced to the timer and the header and tabs are not rendered. The phone tab bar is a dock floating above the bottom edge (`padding-bottom: max(0.75rem, safe-area-inset-bottom + 0.5rem)`), over the page colour, so it sits correctly with gesture bars, three-button bars and rounded display corners alike. The menu highlights at once (`tab`) while the content follows through `useDeferredValue`, and the lazy screens are preloaded on idle, so switching never shows a loading state. Forest, Stats, Settings, the introduction and the share panel are lazy chunks.

The first run (welcome → local profile → focus choice, or welcome → restore a backup) shows while `prefs.onboarded` is false (never over a running block); the migration to schema 3 marks existing users with sessions as onboarded. The profile is just `prefs.nickname` and `prefs.avatar`: there is no account or password, and restoring a backup fills in a missing name and avatar.

## Sound

Everything is synthesised with Web Audio — there are no audio files.

- **Unlock.** Mobile browsers only start audio inside a user gesture. `unlockAudio()` creates/resumes the shared `AudioContext` in the Start tap (and the last onboarding tap), so the chime can play when the block ends 25 minutes later.
- **Phase end.** `usePomodoro` calls `playPhaseEnd(phase, sound)` right after `completePhase()`: the focus chime repeats three times (a tap stops it) and vibrates `[400,150,400,150,700]` where `navigator.vibrate` exists (Android); a naturally ended break rings once. A skipped break makes no sound.
- **Background sounds.** `useSoundscape(owned, sound)` plays the chosen loop (noise buffers shaped by filters and LFOs, plus scheduled bird calls / drops) only in the tab that owns the running block, and stops only what it started, so a preview in Settings is not cut off.
- **Limits.** iOS mutes web audio when the ring/silent switch is on and has no vibration API; media volume applies. These are platform rules the app cannot override.

## Unlocks and My forest

`lib/unlocks.js` holds the thresholds (`GROWTH_UNLOCKS`: birch 10, cherry 25 completed sessions); the category form disables locked species and the celebration announces a new one when the count crosses a threshold. `lib/forest.js` computes the period ranges for My forest; failed sessions render as withered plants (an SVG colour-matrix filter plus a slight bend in `ForestScene`).

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

Bundle (production, gzip): main JS 105 kB, CSS 20 kB (incl. the two tiny Hungarian font subsets), fonts 72 kB; Forest, Stats, Settings, the introduction and Share load on demand. The service worker precaches all of it for offline use.
