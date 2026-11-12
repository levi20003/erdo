import { addDays, startOfDay } from './time'

/* Grouping sessions into the forest's day / week / month / year views. */
export const PERIODS = ['day', 'week', 'month', 'year']

/** [start, end) of the period containing `anchor`. Weeks start on Monday. */
export function periodRange(period, anchor) {
  const d = startOfDay(anchor)
  if (period === 'week') {
    const start = addDays(d, -((d.getDay() + 6) % 7))
    return { start, end: addDays(start, 7) }
  }
  if (period === 'month') return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 1) }
  if (period === 'year') return { start: new Date(d.getFullYear(), 0, 1), end: new Date(d.getFullYear() + 1, 0, 1) }
  return { start: d, end: addDays(d, 1) }
}

/** The anchor `delta` periods before (negative) or after (positive). */
export function shiftPeriod(period, anchor, delta) {
  const d = new Date(anchor)
  if (period === 'week') return addDays(d, 7 * delta)
  if (period === 'month') return new Date(d.getFullYear(), d.getMonth() + delta, 1)
  if (period === 'year') return new Date(d.getFullYear() + delta, 0, 1)
  return addDays(d, delta)
}

export const isCurrentPeriod = (period, anchor, now = new Date()) =>
  periodRange(period, anchor).start.getTime() === periodRange(period, now).start.getTime()

/** Sessions (grown and withered) that ended inside the range, oldest first. */
export function sessionsIn(sessions, { start, end }) {
  const from = start.getTime()
  const to = end.getTime()
  return sessions.filter((s) => s.end >= from && s.end < to).sort((a, b) => a.end - b.end)
}
