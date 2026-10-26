# Changelog

All notable changes. Dates are release dates in Europe/Budapest.

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
