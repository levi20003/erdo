/** The cycle is intentionally fixed: 25 minutes of focus, then 5 minutes of break. */
export const FOCUS_SEC = 25 * 60
export const BREAK_SEC = 5 * 60

/** Completion celebration shown between focus and break; the 5-minute break starts after it. */
export const CELEBRATION_MS = 3600

/** Streak milestones shown on the streak card (days). */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365]

/** A window blur (not a tab switch) fails the session if focus doesn't return within this time. */
export const BLUR_GRACE_MS = 2000

/** Failed sessions shorter than this are discarded instead of logged. */
export const MIN_LOGGED_FAIL_SEC = 30

export const STORAGE_KEY = 'focusgrove:v1'

export const DEFAULT_CATEGORIES = [
  { id: 'tanulas', name: 'Tanulás', color: '#7d8247', growth: 'tolgy' },
  { id: 'fejlesztes', name: 'Fejlesztés', color: '#5f6239', growth: 'fenyves' },
  { id: 'kreativ', name: 'Kreatív', color: '#c9ab84', growth: 'gomba' },
  { id: 'fokusz', name: 'Fókusz Munkamenet', color: '#8f9d7a', growth: 'szikla' },
]

export const PALETTE = ['#5f6239', '#7d8247', '#8f9d7a', '#c9ab84', '#b07d5b', '#a8747a', '#6f8191', '#a1a1aa']
