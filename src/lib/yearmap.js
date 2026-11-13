import { addDays, dayKey } from './time'

/* The year map: every day of a year as a tile, coloured by how much you focused. */

/** dayKey → { min, count } for completed sessions. */
export function dayTotals(sessions) {
  const out = new Map()
  for (const s of sessions) {
    if (s.status !== 'completed') continue
    const key = dayKey(s.end)
    const day = out.get(key) ?? { min: 0, count: 0 }
    day.min += s.durationSec / 60
    day.count++
    out.set(key, day)
  }
  return out
}

/** Twelve months: first day, length, and the Monday-based column of the 1st. */
export function monthsOf(year) {
  return Array.from({ length: 12 }, (_, month) => {
    const first = new Date(year, month, 1)
    return { month, first, length: new Date(year, month + 1, 0).getDate(), offset: (first.getDay() + 6) % 7 }
  })
}

/** 0 (nothing) … 4 (two hours or more). */
export function intensity(min) {
  if (!min) return 0
  if (min < 25) return 1
  if (min < 60) return 2
  if (min < 120) return 3
  return 4
}

/** Totals for one calendar year: active days, minutes, best day, longest run of active days. */
export function yearSummary(totals, year) {
  let activeDays = 0
  let minutes = 0
  let best = null
  let run = 0
  let longestRun = 0
  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = addDays(d, 1)) {
    const key = dayKey(d)
    const day = totals.get(key)
    if (day) {
      activeDays++
      minutes += day.min
      if (!best || day.min > best.min) best = { key, min: day.min }
      run++
      longestRun = Math.max(longestRun, run)
    } else run = 0
  }
  return { activeDays, minutes, best, longestRun }
}
