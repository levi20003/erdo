import { useMemo } from 'react'
import { levelOf, titleIndex, xpOf } from '../lib/levels'
import { completed, computeStreak } from '../lib/stats'
import { t } from '../lib/strings'
import { dayKey } from '../lib/time'
import { nextUnlock } from '../lib/unlocks'
import { useAppStore } from '../store/AppStore'
import { useToday } from './useToday'

/** Everything the "how am I doing" UI needs, derived from the sessions (never stored). */
export function useProgress() {
  const { sessions, prefs } = useAppStore().state
  const today = useToday()
  return useMemo(() => {
    const done = completed(sessions)
    const todays = done.filter((s) => dayKey(s.end) === today)
    const xp = xpOf(sessions)
    const level = levelOf(xp)
    return {
      xp,
      level,
      title: t.levels.titles[titleIndex(level.level)],
      todayCount: todays.length,
      todayMin: todays.reduce((m, s) => m + s.durationSec / 60, 0),
      goal: prefs.dailyGoal,
      completedCount: done.length,
      streak: computeStreak(sessions),
      next: nextUnlock(done.length),
    }
  }, [sessions, today, prefs.dailyGoal])
}
