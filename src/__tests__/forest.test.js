import { describe, expect, it } from 'vitest'
import { isCurrentPeriod, periodRange, sessionsIn, shiftPeriod } from '../lib/forest'
import { isUnlocked, nextUnlock, unlockedAt } from '../lib/unlocks'

const d = (y, m, day, h = 12) => new Date(y, m - 1, day, h)

describe('forest periods', () => {
  it('weeks run Monday to Monday, months and years are calendar ones', () => {
    // 2026-11-12 is a Thursday.
    const week = periodRange('week', d(2026, 11, 12))
    expect(week.start).toEqual(d(2026, 11, 9, 0))
    expect(week.end).toEqual(d(2026, 11, 16, 0))
    expect(periodRange('week', d(2026, 11, 15)).start).toEqual(d(2026, 11, 9, 0)) // Sunday belongs to the same week
    expect(periodRange('month', d(2026, 11, 12))).toEqual({ start: d(2026, 11, 1, 0), end: d(2026, 12, 1, 0) })
    expect(periodRange('year', d(2026, 11, 12))).toEqual({ start: d(2026, 1, 1, 0), end: d(2027, 1, 1, 0) })
  })

  it('steps across month and year boundaries', () => {
    expect(shiftPeriod('month', d(2026, 1, 31), -1)).toEqual(d(2025, 12, 1, 0))
    expect(shiftPeriod('day', d(2026, 3, 1), -1).getDate()).toBe(28)
    expect(isCurrentPeriod('week', shiftPeriod('week', new Date(), -1))).toBe(false)
    expect(isCurrentPeriod('week', new Date())).toBe(true)
  })

  it('selects sessions by their end time, oldest first', () => {
    const s = (id, end) => ({ id, end })
    const list = [s('b', d(2026, 11, 12, 15).getTime()), s('a', d(2026, 11, 12, 9).getTime()), s('x', d(2026, 11, 13, 0).getTime())]
    expect(sessionsIn(list, periodRange('day', d(2026, 11, 12))).map((x) => x.id)).toEqual(['a', 'b'])
  })
})

describe('plant unlocks', () => {
  it('starts with four plants and unlocks birch at 10, cherry at 25', () => {
    expect(isUnlocked('tolgy', 0)).toBe(true)
    expect(isUnlocked('nyir', 9)).toBe(false)
    expect(isUnlocked('nyir', 10)).toBe(true)
    expect(nextUnlock(3)).toEqual({ id: 'nyir', at: 10, remaining: 7 })
    expect(nextUnlock(10)).toEqual({ id: 'cseresznye', at: 25, remaining: 15 })
    expect(nextUnlock(25)).toBeNull()
    expect(unlockedAt(10)).toBe('nyir')
    expect(unlockedAt(11)).toBeNull()
  })
})
