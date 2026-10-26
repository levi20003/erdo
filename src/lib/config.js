/** The cycle is intentionally fixed: 25 minutes of focus, then 5 minutes of break. */
export const FOCUS_SEC = 25 * 60
export const BREAK_SEC = 5 * 60

/** Completion celebration shown between focus and break; the 5-minute break starts after it. */
export const CELEBRATION_MS = 3600

/** Streak milestones shown on the streak card (days). */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365]

/**
 * Leaving the app (tab switch, app switch, another window) fails the focus block
 * unless the user is back within this time — forgiving an accidental swipe or
 * app-switcher peek, not a real departure.
 */
export const LEAVE_GRACE_MS = 5000

/** Failed sessions shorter than this are discarded instead of logged. */
export const MIN_LOGGED_FAIL_SEC = 30

// The key name predates schema versioning; it stays so existing data keeps loading.
export const STORAGE_KEY = 'focusgrove:v1'

/**
 * Version of the saved data's shape. Bump it together with a new entry in
 * lib/migrations.js whenever the stored shape changes.
 *   1 — unversioned data from before 1.0 (categories, sessions, timer, prefs.breakGuide)
 *   2 — schemaVersion field, prefs.lang, prefs.feedback
 */
export const SCHEMA_VERSION = 2

/** Where "Write a suggestion" leads: a pre-filled GitHub issue the user can review before sending. */
export const FEEDBACK_URL = 'https://github.com/levi20003/erdo/issues/new'

/** The feedback prompt appears after this many completed sessions, never during focus. */
export const FEEDBACK_AFTER = 5

/** Injected at build time from package.json (vite.config.js `define`). */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

export const DEFAULT_CATEGORIES = [
  { id: 'tanulas', name: 'Tanulás', color: '#7d8247', growth: 'tolgy' },
  { id: 'fejlesztes', name: 'Fejlesztés', color: '#5f6239', growth: 'fenyves' },
  { id: 'kreativ', name: 'Kreatív', color: '#c9ab84', growth: 'gomba' },
  { id: 'fokusz', name: 'Fókusz Munkamenet', color: '#8f9d7a', growth: 'szikla' },
]

export const PALETTE = ['#5f6239', '#7d8247', '#8f9d7a', '#c9ab84', '#b07d5b', '#a8747a', '#6f8191', '#a1a1aa']
