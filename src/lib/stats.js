import { addDays, dayKey } from './time'

export const completed = (sessions) => sessions.filter((s) => s.status === 'completed')

/** { [categoryId]: minutes } for completed sessions on the given day keys. */
export function minutesByCategory(sessions, keys) {
  const out = {}
  for (const s of completed(sessions)) {
    if (keys.has(dayKey(s.end))) out[s.categoryId] = (out[s.categoryId] ?? 0) + s.durationSec / 60
  }
  return out
}

/** One bucket per day: { key, date, total, byCategory }. */
export function dailySeries(sessions, days) {
  const map = new Map(days.map((date) => [dayKey(date), { key: dayKey(date), date, total: 0, byCategory: {} }]))
  for (const s of completed(sessions)) {
    const b = map.get(dayKey(s.end))
    if (!b) continue
    const min = s.durationSec / 60
    b.total += min
    b.byCategory[s.categoryId] = (b.byCategory[s.categoryId] ?? 0) + min
  }
  return [...map.values()]
}

export const totalMinutes = (sessions) => completed(sessions).reduce((sum, s) => sum + s.durationSec / 60, 0)

/**
 * Consecutive days with at least one completed session. Today not being done
 * yet doesn't break the streak — it stays alive until midnight.
 */
export function computeStreak(sessions, today = new Date()) {
  const days = new Set(completed(sessions).map((s) => dayKey(s.end)))

  let current = 0
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1)
  while (days.has(dayKey(cursor))) {
    current++
    cursor = addDays(cursor, -1)
  }

  let longest = 0
  let run = 0
  let prev = null
  for (const key of [...days].sort()) {
    run = prev && dayKey(addDays(prev, 1)) === key ? run + 1 : 1
    longest = Math.max(longest, run)
    const [y, m, d] = key.split('-').map(Number)
    prev = new Date(y, m - 1, d)
  }

  return { current, longest, doneToday: days.has(dayKey(today)), days }
}
