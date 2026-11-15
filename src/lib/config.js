/**
 * Focus lengths. Pomodoro 25/5 is the default; 50/10 and 90/15 are for deep
 * work. There is still no pause: Strict Mode applies to every length.
 */
export const PRESETS = {
  25: { focus: 25 * 60, break: 5 * 60 },
  50: { focus: 50 * 60, break: 10 * 60 },
  90: { focus: 90 * 60, break: 15 * 60 },
}
export const PRESET_IDS = ['25', '50', '90']
export const DEFAULT_PRESET = '25'
export const FOCUS_SEC = PRESETS[DEFAULT_PRESET].focus
export const BREAK_SEC = PRESETS[DEFAULT_PRESET].break
export const FOCUS_LENGTHS = PRESET_IDS.map((id) => PRESETS[id].focus)
export const BREAK_LENGTHS = PRESET_IDS.map((id) => PRESETS[id].break)
export const MAX_FOCUS_SEC = Math.max(...FOCUS_LENGTHS)

/** Appearance: follow the device, or force light / dark. */
export const THEMES = ['system', 'light', 'dark']

/** Completed sessions per day the "daily goal" ring counts towards. */
export const DEFAULT_DAILY_GOAL = 4
export const MAX_DAILY_GOAL = 12

/** The local profile: a nickname (also shown to a friend in a challenge link) and an avatar. No account, no password. */
export const MAX_NICKNAME = 20
export const AVATARS = ['sprout', 'fox', 'owl', 'deer', 'bear', 'hedgehog', 'rabbit', 'squirrel', 'frog', 'bird']
export const DEFAULT_AVATAR = 'sprout'

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
 *   3 — prefs.onboarded, prefs.sound
 *   4 — prefs.theme, prefs.preset, prefs.dailyGoal, prefs.nickname, challenges
 *   5 — prefs.avatar (local profile: nickname + avatar, no account)
 *   6 — category colours moved from the old olive/sand palette to the current one
 */
export const SCHEMA_VERSION = 6

/** End-of-phase sounds (synthesised in lib/sound.js; no audio files). */
export const CHIMES = ['harang', 'csengo', 'madar', 'fa', 'off']
/** Background sounds during focus (also synthesised). */
export const AMBIENTS = ['off', 'eso', 'erdo', 'patak', 'zaj']
export const DEFAULT_SOUND = { chime: 'harang', volume: 0.8, vibrate: true, ambient: 'off', ambientVolume: 0.5 }

/** Plants available from the start; the others unlock after this many completed sessions. */
export const STARTER_GROWTH = ['tolgy', 'fenyves', 'szikla', 'gomba']
export const GROWTH_UNLOCKS = { napraforgo: 3, nyir: 10, cseresznye: 25, juhar: 40, fuz: 60, mamutfenyo: 100 }

/** Where "Write a suggestion" leads: a pre-filled GitHub issue the user can review before sending. */
export const FEEDBACK_URL = 'https://github.com/levi20003/erdo/issues/new'

/** The feedback prompt appears after this many completed sessions, never during focus. */
export const FEEDBACK_AFTER = 5

/** Injected at build time from package.json (vite.config.js `define`). */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

export const DEFAULT_CATEGORIES = [
  { id: 'tanulas', name: 'Tanulás', color: '#62a16a', growth: 'tolgy' },
  { id: 'fejlesztes', name: 'Fejlesztés', color: '#2d7749', growth: 'fenyves' },
  { id: 'kreativ', name: 'Kreatív', color: '#e0903c', growth: 'gomba' },
  { id: 'fokusz', name: 'Fókusz Munkamenet', color: '#a8b545', growth: 'szikla' },
]

/** Category colours: forest, leaf, moss, amber, terracotta, maroon, bark, sky. */
export const PALETTE = ['#2d7749', '#62a16a', '#a8b545', '#e0903c', '#c2553f', '#8b3a3a', '#7e5454', '#5b8fa8']

/** The pre-1.4 palette → today's (schema 6 migration). Colours picked with the custom picker are left alone. */
export const LEGACY_COLORS = {
  '#5f6239': '#2d7749',
  '#7d8247': '#62a16a',
  '#8f9d7a': '#a8b545',
  '#c9ab84': '#e0903c',
  '#b07d5b': '#c2553f',
  '#a8747a': '#8b3a3a',
  '#6f8191': '#5b8fa8',
  '#a1a1aa': '#7e5454',
}
