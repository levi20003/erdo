import { APP_VERSION, SCHEMA_VERSION } from './config'
import { growthItem } from './growth'
import { sanitizeState } from './sanitize'
import { t } from './strings'

/*
 * Backups (JSON) and spreadsheet exports (CSV). Both are built locally and
 * handed to the user as files; nothing is uploaded.
 */

/** Full backup of the user's data (the running timer is deliberately left out). */
export function buildBackup(state, now = new Date()) {
  const { categories, sessions, selectedCategoryId, prefs } = state
  return {
    app: 'FocusGrove',
    kind: 'backup',
    appVersion: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    data: { schemaVersion: SCHEMA_VERSION, categories, sessions, selectedCategoryId, prefs },
  }
}

/**
 * Reads a backup file: our backup format, the crash screen's emergency file, or
 * a raw saved state. Any schema version is migrated and validated. Returns the
 * sanitized state, or null when the file is not FocusGrove data.
 */
export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(String(text).replace(/^\uFEFF/, ''))
  } catch {
    return null
  }
  let data = parsed
  if (parsed?.app === 'FocusGrove' && parsed.data) data = parsed.data
  else if (parsed?.app === 'FocusGrove' && typeof parsed.savedState === 'string') {
    try {
      data = JSON.parse(parsed.savedState)
    } catch {
      return null
    }
  }
  if (!data || typeof data !== 'object' || (!Array.isArray(data.sessions) && !Array.isArray(data.categories))) return null
  return sanitizeState(data)
}

/**
 * One CSV cell. Quotes when needed (separator, quote, line break, edge spaces)
 * and neutralises spreadsheet formulas: category names are user input, and a
 * cell starting with = + - @ would otherwise run as a formula when opened.
 */
export function csvCell(value, sep) {
  let s = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return s.includes(sep) || /["\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const pad = (n) => String(n).padStart(2, '0')
/** Local time, unambiguous and sortable: 2026-10-26 14:05 */
const dateTime = (ms) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Sessions as CSV, ready for Excel / Numbers / Sheets: UTF-8 BOM (so accented
 * letters survive Excel), CRLF line ends, and the separator and decimal mark
 * of the active language (Hungarian Excel expects ";" and ",").
 */
export function buildCsv(state) {
  const { csvHeaders, csvSeparator: sep, decimal, status, reason } = t.exportFile
  const categories = Object.fromEntries(state.categories.map((c) => [c.id, c]))
  const minutes = (sec) => {
    const m = Math.round((sec / 60) * 10) / 10
    return Number.isInteger(m) ? String(m) : String(m).replace('.', decimal)
  }
  const rows = state.sessions.map((s) => {
    const cat = categories[s.categoryId]
    return [
      dateTime(s.start),
      dateTime(s.end),
      minutes(s.durationSec),
      cat ? cat.name : t.deletedCategory,
      cat ? growthItem(cat.growth).name : '',
      status[s.status] ?? s.status,
      s.reason ? (reason[s.reason] ?? s.reason) : '',
    ]
  })
  return `\uFEFF${[csvHeaders, ...rows].map((r) => r.map((c) => csvCell(c, sep)).join(sep)).join('\r\n')}\r\n`
}
