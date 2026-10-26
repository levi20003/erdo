import { addDays, dayKey, startOfDay } from './time'
import { completed } from './stats'

/*
 * "My progress" numbers, derived on the device from the session log. Nothing
 * extra is recorded: this is the only analytics FocusGrove has.
 */
export function computeInsights(sessions, now = new Date()) {
  const done = completed(sessions)
  const todayStart = startOfDay(now).getTime()
  const windowStart = addDays(todayStart, -6).getTime() // last 7 days including today
  const prevStart = addDays(todayStart, -13).getTime()

  let last7 = 0
  let prev7 = 0
  const perDay = new Map()
  const perCategory = new Map()
  for (const s of done) {
    const min = s.durationSec / 60
    if (s.end >= windowStart) last7 += min
    else if (s.end >= prevStart) prev7 += min
    const key = dayKey(s.end)
    perDay.set(key, (perDay.get(key) ?? 0) + min)
    perCategory.set(s.categoryId, (perCategory.get(s.categoryId) ?? 0) + min)
  }

  const totalMin = [...perDay.values()].reduce((a, b) => a + b, 0)
  const activeDays = perDay.size
  const best = [...perDay.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]
  const favorite = [...perCategory.entries()].sort((a, b) => b[1] - a[1])[0]

  return {
    last7Min: last7,
    // null when there is nothing to compare with (avoids a meaningless "+∞%").
    deltaPct: prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null,
    activeDays,
    avgPerActiveDayMin: activeDays ? totalMin / activeDays : 0,
    bestDay: best ? { key: best[0], min: best[1] } : null,
    favoriteCategoryId: favorite?.[0] ?? null,
  }
}
