import { STORAGE_KEY } from './config'
import { sanitizeState } from './sanitize'

let lastWritten = null

/** Whether localStorage can actually be written (private modes and blocked storage throw). */
function storageWorks() {
  try {
    const probe = `${STORAGE_KEY}:probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Reads and repairs the saved state.
 * status: 'ok' | 'empty' | 'repaired' (unreadable JSON, raw copy kept aside) | 'unavailable'
 */
export function load() {
  if (!storageWorks()) return { state: sanitizeState(null), status: 'unavailable' }
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { state: sanitizeState(null), status: 'unavailable' }
  }
  if (!raw) return { state: sanitizeState(null), status: 'empty' }
  try {
    lastWritten = raw
    return { state: sanitizeState(JSON.parse(raw)), status: 'ok' }
  } catch {
    // Keep the unreadable data instead of silently overwriting it.
    try {
      localStorage.setItem(`${STORAGE_KEY}:corrupt-${Date.now()}`, raw)
    } catch {
      // Nothing more we can do.
    }
    return { state: sanitizeState(null), status: 'repaired' }
  }
}

/** Persists the state; returns false when the write failed (quota, blocked storage). */
export function save(state) {
  const { categories, sessions, selectedCategoryId, timer, prefs } = state
  const raw = JSON.stringify({ categories, sessions, selectedCategoryId, timer, prefs })
  if (raw === lastWritten) return true
  try {
    localStorage.setItem(STORAGE_KEY, raw)
    lastWritten = raw
    return true
  } catch {
    return false
  }
}

/** Calls `onChange(state)` when another tab writes the saved state. */
export function subscribe(onChange) {
  const onStorage = (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === lastWritten) return
    try {
      lastWritten = e.newValue
      onChange(sanitizeState(JSON.parse(e.newValue)))
    } catch {
      // Ignore a half-written value; the next write will bring a full one.
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
