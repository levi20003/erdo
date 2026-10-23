import { describe, expect, it } from 'vitest'
import { STAGE_AT, stageOf } from '../lib/growth'
import { computeStreak } from '../lib/stats'

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime()
const done = (end, status = 'completed') => ({ id: String(end), categoryId: 'tanulas', start: end - 1500e3, end, durationSec: 1500, status })

describe('computeStreak', () => {
  it('counts consecutive days and stays alive until midnight', () => {
    const sessions = [done(at(2026, 10, 20)), done(at(2026, 10, 21)), done(at(2026, 10, 22))]
    expect(computeStreak(sessions, new Date(at(2026, 10, 22, 20))).current).toBe(3)
    // Nothing yet today: yesterday's streak still counts...
    expect(computeStreak(sessions, new Date(at(2026, 10, 23, 9)))).toMatchObject({ current: 3, doneToday: false })
    // ...but a full missed day breaks it.
    expect(computeStreak(sessions, new Date(at(2026, 10, 24, 9))).current).toBe(0)
  })

  it('ignores failed sessions and reports the longest run', () => {
    const sessions = [done(at(2026, 10, 1)), done(at(2026, 10, 2)), done(at(2026, 10, 3)), done(at(2026, 10, 10)), done(at(2026, 10, 11), 'failed')]
    expect(computeStreak(sessions, new Date(at(2026, 10, 11)))).toMatchObject({ current: 1, longest: 3 })
  })

  it('handles a month boundary', () => {
    const sessions = [done(at(2026, 10, 31)), done(at(2026, 11, 1))]
    expect(computeStreak(sessions, new Date(at(2026, 11, 1))).current).toBe(2)
  })
})

describe('growth stages', () => {
  it('maps progress to the five stages at the documented thresholds', () => {
    expect(STAGE_AT.map(stageOf)).toEqual([0, 1, 2, 3, 4])
    expect(stageOf(0.079)).toBe(0)
    expect(stageOf(0.5)).toBe(2)
    expect(stageOf(1)).toBe(4)
  })
})
