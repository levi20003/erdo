/** Local calendar day key, e.g. "2026-10-22". Sessions are bucketed by the day they ended. */
export function dayKey(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

/** 95 -> "1 ó 35 p", 40 -> "40 p" */
export function formatMinutes(min) {
  const m = Math.round(min)
  const h = Math.floor(m / 60)
  if (!h) return `${m} p`
  return m % 60 ? `${h} ó ${m % 60} p` : `${h} ó`
}

export const formatHours = (min) => (min / 60).toLocaleString('hu-HU', { maximumFractionDigits: 1, minimumFractionDigits: min > 0 && min < 600 ? 1 : 0 })

export const weekdayShort = (date) => new Date(date).toLocaleDateString('hu-HU', { weekday: 'short' }).replace('.', '')

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
