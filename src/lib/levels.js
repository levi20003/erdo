import { totalMinutes } from './stats'

/*
 * Forester levels: one XP per completed focus minute. Each level needs a bit
 * more than the last (50, 75, 100, … XP), so the first levels come quickly and
 * later ones mark real effort. Derived from the sessions, never stored.
 */

/** XP needed to go from `level` to the next one. */
export const xpStep = (level) => 50 + 25 * (level - 1)

export const xpOf = (sessions) => Math.floor(totalMinutes(sessions))

/** { level, xp, floor, next, progress } — floor/next: XP where this level starts and the next begins. */
export function levelOf(xp) {
  let level = 1
  let floor = 0
  while (xp >= floor + xpStep(level)) {
    floor += xpStep(level)
    level++
  }
  const next = floor + xpStep(level)
  return { level, xp, floor, next, progress: (xp - floor) / (next - floor) }
}

/** The level at which each title (t.levels.titles[i]) is earned. */
export const TITLE_LEVELS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50]

export function titleIndex(level) {
  let index = 0
  TITLE_LEVELS.forEach((at, i) => {
    if (level >= at) index = i
  })
  return index
}
