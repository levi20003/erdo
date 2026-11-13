import { GROWTH_UNLOCKS } from './config'
import { GROWTH_IDS } from './growth'

/*
 * Plant collection: four plants from the start, more unlock with completed
 * sessions (the app's take on Forest's tree shop — earned by focusing, never bought).
 */
export const unlockAt = (id) => GROWTH_UNLOCKS[id] ?? 0

export const isUnlocked = (id, completedCount) => completedCount >= unlockAt(id)

/** The next plant to unlock, or null when everything is unlocked. */
export function nextUnlock(completedCount) {
  const id = GROWTH_IDS.filter((g) => unlockAt(g) > completedCount).sort((a, b) => unlockAt(a) - unlockAt(b))[0]
  return id ? { id, at: unlockAt(id), remaining: unlockAt(id) - completedCount } : null
}

/** The plant unlocked by reaching exactly this many completed sessions, if any. */
export function unlockedAt(completedCount) {
  return GROWTH_IDS.find((g) => unlockAt(g) > 0 && unlockAt(g) === completedCount) ?? null
}

/** Progress (0…1) from the previous unlock towards `next` — so the bar restarts after every new plant. */
export function unlockProgress(completedCount, next) {
  if (!next) return 1
  const prev = Math.max(0, ...GROWTH_IDS.map(unlockAt).filter((at) => at < next.at))
  return Math.min(1, Math.max(0, (completedCount - prev) / (next.at - prev)))
}
