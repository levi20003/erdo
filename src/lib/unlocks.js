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
