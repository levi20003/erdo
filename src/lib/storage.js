import { SCHEMA_VERSION, STORAGE_KEY } from './config'
import { logError, trimErrorLog } from './errorLog'
import { storedVersion } from './migrations'
import { sanitizeState } from './sanitize'

/*
 * localStorage persistence. Everything here survives: storage being blocked
 * (private mode), full (quota), unreadable (malformed JSON), or written by an
 * older or newer version of the app.
 */

const KNOWN_KEYS = ['categories', 'sessions', 'selectedCategoryId', 'timer', 'prefs', 'schemaVersion']
export const BACKUP_PREFIX = `${STORAGE_KEY}:backup-`
export const CORRUPT_PREFIX = `${STORAGE_KEY}:corrupt-`

let lastWritten = null
// Top-level fields this version doesn't know (written by a newer version): kept on every save.
let passthrough = {}

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

function setIfAbsent(key, value) {
  try {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value)
  } catch (err) {
    logError('storage', err, 'backup write failed')
  }
}

/**
 * Reads, migrates and repairs the saved state.
 * status: 'ok' | 'empty' | 'migrated' | 'newer' | 'repaired' | 'unavailable'
 *  - migrated:  older schema, upgraded (raw copy kept under backup-v<N>)
 *  - newer:     written by a newer app version; read best-effort, unknown fields preserved
 *  - repaired:  unreadable JSON; defaults used, raw copy kept under corrupt-<time>
 */
export function load() {
  passthrough = {}
  if (!storageWorks()) return { state: sanitizeState(null), status: 'unavailable' }
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch (err) {
    logError('storage', err, 'read failed')
    return { state: sanitizeState(null), status: 'unavailable' }
  }
  if (!raw) return { state: sanitizeState(null), status: 'empty' }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    logError('storage', err, 'malformed JSON')
    setIfAbsent(`${CORRUPT_PREFIX}${Date.now()}`, raw)
    return { state: sanitizeState(null), status: 'repaired' }
  }

  const version = storedVersion(parsed)
  let status = 'ok'
  if (version !== SCHEMA_VERSION) {
    // One untouched copy per source version, taken before anything is rewritten.
    setIfAbsent(`${BACKUP_PREFIX}v${version}`, raw)
    status = version < SCHEMA_VERSION ? 'migrated' : 'newer'
  }
  if (version > SCHEMA_VERSION && parsed && typeof parsed === 'object') {
    passthrough = Object.fromEntries(Object.entries(parsed).filter(([k]) => !KNOWN_KEYS.includes(k)))
  }
  lastWritten = status === 'ok' ? raw : null
  return { state: sanitizeState(parsed), status, fromVersion: version }
}

function serialize(state) {
  const { categories, sessions, selectedCategoryId, timer, prefs } = state
  return JSON.stringify({ ...passthrough, schemaVersion: SCHEMA_VERSION, categories, sessions, selectedCategoryId, timer, prefs })
}

function isQuotaError(err) {
  return err?.name === 'QuotaExceededError' || err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err?.code === 22 || err?.code === 1014
}

/** Frees space we own, least valuable first: corrupt copies, then most of the error log. */
function freeSpace() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CORRUPT_PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // Ignore.
  }
  trimErrorLog(5)
}

/** Persists the state; returns false when the write failed even after freeing space. */
export function save(state) {
  const raw = serialize(state)
  if (raw === lastWritten) return true
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      localStorage.setItem(STORAGE_KEY, raw)
      lastWritten = raw
      return true
    } catch (err) {
      if (attempt === 0 && isQuotaError(err)) {
        freeSpace()
        continue
      }
      logError('storage', err, isQuotaError(err) ? 'quota exceeded' : 'write failed')
      return false
    }
  }
  return false
}

/** Calls `onChange(state)` when another tab writes the saved state. */
export function subscribe(onChange) {
  const onStorage = (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue || e.newValue === lastWritten) return
    try {
      const parsed = JSON.parse(e.newValue)
      lastWritten = e.newValue
      onChange(sanitizeState(parsed))
    } catch {
      // A half-written value; the next write brings a full one.
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

/** The raw saved string, for the crash screen's emergency download (bypasses the app state). */
export function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
