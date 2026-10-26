import { getLocale, t } from './strings'

/** Local calendar day key, e.g. "2026-10-22". Sessions are bucketed by the day they ended. */
export function dayKey(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "2026-10-22" → that day's local midnight. */
export function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** The last `n` days ending today, oldest first. */
export const lastNDays = (n, from = new Date()) => Array.from({ length: n }, (_, i) => addDays(from, i - (n - 1)))

export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** 1500 -> "25:00" */
export function formatClock(sec) {
  const s = Math.max(0, Math.ceil(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** 95 → "1 ó 35 p" (hu) / "1 h 35 min" (en); 40 → "40 p" */
export function formatMinutes(min) {
  const m = Math.round(min)
  const h = Math.floor(m / 60)
  const u = t.units
  if (!h) return `${m} ${u.m}`
  return m % 60 ? `${h} ${u.h} ${m % 60} ${u.m}` : `${h} ${u.h}`
}

export const formatHours = (min) => (min / 60).toLocaleString(getLocale(), { maximumFractionDigits: 1, minimumFractionDigits: min > 0 && min < 600 ? 1 : 0 })

export const weekdayShort = (date) => new Date(date).toLocaleDateString(getLocale(), { weekday: 'short' }).replace('.', '')

export const weekdayNarrow = (date) => new Date(date).toLocaleDateString(getLocale(), { weekday: 'narrow' })

export const shortDate = (date) => new Date(date).toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' })

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
