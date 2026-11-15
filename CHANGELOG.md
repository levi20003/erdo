# Changelog

All notable changes. Dates are release dates in Europe/Budapest.

## 1.4.0 — 2026-11-15 · In-app updates, a designer's pass, a dock that fits every phone

### Added
- **Update from inside the app.** A new version downloads quietly and waits; a banner ("Új verzió érhető el · Frissítés") and **Profile → About → Check for updates** switch to it with one tap and confirm the version afterwards. The app also looks for updates whenever it returns to the foreground. An update is never offered or applied during a focus block (a reload would fail it).
- **Plant preview**: tap a plant in the collection to watch it grow through its five stages.
- **Ten hand-drawn avatars** (fox, owl, deer, bear, hedgehog, rabbit, squirrel, frog, robin, sprout) replace the emoji, so they look the same on every phone.

### Changed
- **Bottom navigation** is now a dock that floats above the bottom edge: it stays clear of rounded display corners and of the Android gesture bar / iPhone home indicator (safe-area inset), with the page colour around and under it, and content fades out behind it. The installed app runs as `standalone` (was `fullscreen`, which hid the system bars and fought with gestures). Tested at Pixel 9a size (411 × 899 at 2.625×) with 0, 24 and 48 px insets.
- **Tab switching is instant**: screens are fetched in the background once the app is idle, the menu reacts at once and the content swaps without a loading flash or a smooth-scroll race.
- **A design pass over every screen**, with one shared vocabulary (labels, hints, inputs, switch, slider with filled track, chips, settings-style list rows):
  - Focus: the summary card shows today as "3/4 sessions", what is left to the goal and the ring; sound and full-screen sit in the timer card's corners; on short phones the card compacts so Start stays on screen.
  - My forest: a three-number row (grown · withered · focus), a meadow panel, share as a full-width button; the collection shows "Available" chips or a bar towards the unlock.
  - Stats: the year is a compact heat map (one column per week, scrolls to today on phones, full width on desktop); weekly values sit above their bars; the feedback question moved between cards.
  - Profile: regrouped into Appearance (theme, language), Focus (length, daily goal), Sounds, Categories, Your data and About.
  - Toasts are bark-brown snack bars above the dock; banners, sheets, the crash screen and the share image follow the same look; a new app icon; the status-bar colour follows what is at the top of the screen.
- Category colours moved to a palette that matches the app (forest, leaf, moss, amber, terracotta, maroon, bark, sky). Storage schema 6 migrates categories that still wore an old palette colour; custom colours are untouched.

### Fixed
- After a deploy, an open app could hit "this part didn't load" on a screen it hadn't opened yet: the old files were deleted as soon as the new worker took over. The new worker now waits, and that message offers the update button.

## 1.3.0 — 2026-11-13 · New look: meadow and forest night

### Added
- **Local profile, no account**: a name and a forest-animal avatar, shown in the header ("Szia, Levi!") and on the new Profile tab, and used as the nickname in challenge links. Editable any time; nothing leaves the device.
- **New first run** in the style of the design: a welcome screen with the forest edge, a "sign up" that creates the local profile, a "sign in" that restores a backup on a new device (profile included), and a "what are you focusing on?" list.
- **Summary card** on the Focus screen: the current category (tap to switch), today's sessions and focus time, the daily goal, and a goal ring in percent.

### Changed
- The whole app follows the new design: a green header with greeting, daily tagline and avatar; a pale summary card overlapping it; green "flashcard" tiles with progress bars for level, next plant and the plant collection; bold uppercase section titles with arrows; a bark-brown bottom tab bar (Focus · My forest · Stats · Profile); bark-brown and forest-green pill buttons.
- Fonts: Exo 2 for titles and numbers, Nunito for text (bundled, Latin + Hungarian, ~76 kB).
- Light mode is the design's meadow (white and pale lime, forest green, bark-brown text, maroon accents); dark mode is the forest at night (bark browns, moss greens, lime accents). The forest scene's daylight palette matches.
- Settings became the **Profile** tab (`#profil`; old `#beallitasok` links still work).
- Storage schema 5 (`prefs.avatar`); restoring a backup also fills in a missing name and avatar.

## 1.2.0 — 2026-11-13 · Light and dark, a new look, levels, challenges

### Added
- **Light and dark mode.** Follows the device by default; a switch in the header and a System / Light / Dark choice in Settings override it. Applied before the first paint (no flash). In light mode the forest scene is daylight, in dark mode a night sky.
- **Choosable focus lengths**: 25/5 (Pomodoro, default), 50/10 (deep work), 90/15 (flow). Strict Mode applies to all of them; a withered plant remembers how far the block got.
- **Daily goal** (1–12 sessions, default 4): a ring on the Focus screen, tap to change; reaching it is celebrated.
- **Forester levels**: 1 XP per completed focus minute, each level a little further than the last, ten titles from *Seed* to *Spirit of the forest*. The celebration fills the XP bar and announces a level-up.
- **Your year**: twelve small calendars coloured by focus time; tap a day for its sessions and minutes.
- **Challenge a friend** — without a server or an account: the challenge (goal, length, nickname, session count) travels in a link; the friend accepts it and sends their score back with a link of their own. Every field of an incoming link is validated.
- **Four new plants**: Sunflower (3 sessions), Red maple (40), Weeping willow (60), Giant sequoia (100).
- **Seasons**: the scene dresses for spring (flowers, petals), summer (fireflies), autumn (fallen and falling leaves) and winter (snow).
- Greeting by time of day, focus tips that change during a long block, a playful plant that wiggles when tapped, haptic taps on Android.

### Changed
- New visual design: bundled Inter and Fraunces fonts (subset to Latin + Hungarian, ~80 kB, precached), thin tabular timer digits, a single themed colour system, softer cards with depth, a floating tab bar with a sliding indicator, segmented controls that slide, count-up numbers, staggered card and plant animations.
- Stats: a level header with the headline numbers, the challenges card and the year map; the "total" card became "Insights".
- Storage schema 4 (`prefs.theme`, `preset`, `dailyGoal`, `nickname`, `challenges`), migrated automatically; backups include challenges.

### Fixed
- The breathing guide, streak flame, timelines and sliders used fixed dark colours.

## 1.1.0 — 2026-11-12 · Sounds, My forest, four screens

### Added
- **End-of-timer sound that always plays**, with or without background sound. The audio is unlocked by the Start tap (or the last onboarding tap), so iOS allows it 25 minutes later. The focus chime rings three times (stops on a tap); the end of a break rings once. Four chimes (bell, chime, bird, wood) plus off, volume, preview, and vibration on Android.
- **Background sounds during focus**: rain, forest with birds, stream, brown noise. Synthesised on the device (no audio files, no network), free, with their own volume; switchable from the timer without leaving the session.
- **Four screens** — Focus, My forest, Stats, Settings — with a bottom tab bar on phones and header tabs on larger screens. Each screen has its own address (`#erdo`, …), so the back button and reload keep your place. During focus everything but the timer steps away.
- **My forest**: your plants by day / week / month / year with previous/next, grown and withered counts and focus minutes; tap a plant for its category, time, length and (for a withered one) why it failed. Share the period you're looking at.
- **Withered plants**: a failed block now leaves a dry, bent plant in the forest instead of vanishing.
- **Two unlockable plants**: Birch at 10 completed sessions, Cherry tree at 25 — announced in the completion celebration, shown in the My forest collection and selectable for a category (locked ones show how many sessions remain).
- **First-run introduction**: three short cards (how a block works, what fails it, sounds and breaks), then "what are you focusing on?" and how to install. Skippable; replayable from Settings.
- **Today strip** on the Focus screen: today's sessions, streak, next plant to unlock.
- Friendly empty states for My forest and Stats that lead to the timer.

### Changed
- Storage schema 3: `prefs.onboarded` and `prefs.sound` (migrated; existing users skip the introduction).
- Category chips scroll in one row on phones; the idle timer shows the plant name and path instead of stage dots.
- Forest, Stats, Settings, introduction and sharing load on demand: main bundle 82.6 kB gzip.

### Fixed
- The end-of-block chime was silent on iPhone (the audio context was created outside a user gesture) and very quiet elsewhere (15% volume); breaks ended without any sound.

## 1.0.0 — 2026-10-26 · Production readiness

### Added
- **Versioned storage.** Saved data carries `schemaVersion` (now 2). Deterministic migrations (`src/lib/migrations.js`) upgrade older data; an untouched copy is kept before the first rewrite. Data written by a newer version is read best-effort and its unknown fields are preserved.
- **Crash screen** (error boundary) with reload, emergency data download, and reset-with-backup.
- **Local error log**: timestamped, anonymised, capped (50 entries / 16 KB), downloadable and clearable in Settings; never sent anywhere.
- **Settings sheet**: language, JSON backup, CSV export, restore from backup (merge — nothing is lost), error log, about.
- **CSV export** with UTF-8 BOM, `;` + decimal comma in Hungarian (`,` + point in English), and spreadsheet-formula neutralisation.
- **Share my forest**: a 1080×1350 image of your plants and numbers, via the native share sheet or as a download.
- **English** localisation with per-key Hungarian fallback; locale-aware dates, numbers and units.
- **My progress**: last 7 days vs the previous 7, active days, average, favourite category, best day.
- **Feedback prompt** after 5 completed sessions: inline, dismissable, at most twice, never during focus.
- **Tests and CI**: 62 Vitest unit tests, 14 Playwright E2E tests, ESLint; CI workflow; deploy gated on lint and unit tests.
- Docs: ARCHITECTURE, TESTING, PRIVACY, PRODUCT_METRICS, marketing materials.

### Changed
- Timer ticks once per displayed second, aligned to the countdown (was every 250 ms); dashboard cards are memoised.
- Ambient SVG motion runs only in the live focus scene; only the active breathing arc animates. Idle dashboard: 0 layouts/s (was ~4); break screen: 6 layouts per 5 s (was 301).
- Store split into `boot` / `actions` / `usePersistence` / `reducer`; Strict Mode and ticker logic moved into framework-free modules.
- "Data upgraded" notices are informational (neutral), not alerts.

### Fixed
- Reduced-motion users never saw the completion celebration (it ended invisible); it now shows as a still card.
- `SET_PREF` with a prototype key (`__proto__`) crashed the reducer.
- Storage full: the app now frees its own clutter and retries instead of silently failing.
- Literal invisible BOM characters in source replaced with escapes.
- "1 sessions" in English; untranslated theme badge.

## 0.4.0 — 2026-10-23
- Stability: corrupt storage no longer blanks the page; 5 s Strict Mode grace; screen wake lock; background completion waits for return; cross-tab sync without duplicates; midnight rollover; 320 px layout.
- Automatic focus mode (dashboard hides during focus); live olive/gold border.

## 0.3.0 — 2026-10-23
- Live status ring, completion celebration (flare + firefly swarm) before the break, prominent streak card with milestones, five-stage growth stepper.

## 0.2.0 — 2026-10-22
- GitHub Pages deployment with sub-path support.

## 0.1.0 — 2026-10-22
- First version: strict 25/5 cycle, Erdő theme, categories, dashboard, PWA.
