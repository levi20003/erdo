import { APP_VERSION, SCHEMA_VERSION } from './config'

/*
 * Local, privacy-safe error log. Entries stay in this browser's localStorage;
 * nothing is ever sent anywhere. The user can download the log (e.g. to attach
 * to a bug report) or clear it from Settings.
 *
 * Anonymised by construction: no user data from the state is ever logged, URLs
 * are cut to file names, and anything resembling an email address, a long
 * number or a long quoted string is masked.
 */
export const ERROR_LOG_KEY = 'focusgrove:errors'
const MAX_ENTRIES = 50
const MAX_BYTES = 16 * 1024
const MAX_MESSAGE = 200
const MAX_FRAMES = 5

let writing = false

export function anonymize(text) {
  return String(text ?? '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\b(?:https?|file|blob):\/\/\S+?([^/\s]+?\.[cm]?jsx?(?::\d+){0,2})(?=[\s)]|$)/g, '$1')
    .replace(/\b(?:https?|file|blob):\/\/\S+/g, '[url]')
    .replace(/(["'`])[^"'`]{24,}\1/g, '$1…$1')
    .replace(/\d{6,}/g, '#')
    .slice(0, MAX_MESSAGE)
}

function frames(stack) {
  return String(stack ?? '')
    .split('\n')
    .slice(1, MAX_FRAMES + 1)
    .map((line) => anonymize(line.trim()))
    .filter(Boolean)
}

/** Coarse environment: browser family and OS only, never the full user agent. */
function environment() {
  try {
    const ua = navigator.userAgent
    const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other'
    const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other'
    const standalone = globalThis.matchMedia?.('(display-mode: standalone)').matches ? ' PWA' : ''
    return `${browser}/${os}${standalone}`
  } catch {
    return 'unknown'
  }
}

export function readErrorLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(entries) {
  let list = entries.slice(-MAX_ENTRIES)
  let raw = JSON.stringify(list)
  while (raw.length > MAX_BYTES && list.length > 1) {
    list = list.slice(Math.ceil(list.length / 4))
    raw = JSON.stringify(list)
  }
  localStorage.setItem(ERROR_LOG_KEY, raw)
}

/**
 * Records an error. Never throws and never recurses: logging must not be able
 * to break the app it is observing.
 * kind: 'render' | 'runtime' | 'promise' | 'storage' | 'sw' | …
 */
export function logError(kind, error, context) {
  if (writing) return
  writing = true
  try {
    const entry = {
      t: new Date().toISOString(),
      kind,
      msg: anonymize(error?.message ?? error),
      stack: frames(error?.stack),
      ...(context ? { ctx: anonymize(context) } : {}),
      v: APP_VERSION,
      sv: SCHEMA_VERSION,
      env: environment(),
    }
    write([...readErrorLog(), entry])
  } catch {
    // Storage unavailable or full: the log is best-effort.
  } finally {
    writing = false
  }
}

export function clearErrorLog() {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
  } catch {
    // Nothing to clear.
  }
}

/** Keeps only the newest `keep` entries (used to free space when storage is full). */
export function trimErrorLog(keep) {
  try {
    write(readErrorLog().slice(-keep))
  } catch {
    // Ignore.
  }
}

/** Global handlers for errors outside React's render (event handlers, timers, promises). */
export function installGlobalErrorHandlers() {
  window.addEventListener('error', (e) => logError('runtime', e.error ?? e.message))
  window.addEventListener('unhandledrejection', (e) => logError('promise', e.reason))
}
