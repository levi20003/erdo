import { describe, expect, it } from 'vitest'
import { PRESETS } from '../lib/config'
import { levelOf, titleIndex, xpOf } from '../lib/levels'
import { sanitizeState } from '../lib/sanitize'
import { seasonOf } from '../lib/season'
import { dayTotals, intensity, weeksOf, yearSummary } from '../lib/yearmap'
import { createInitialState, reducer } from '../store/reducer'

const T0 = new Date(2026, 10, 13, 9).getTime()

describe('focus lengths', () => {
  it('a 50-minute block is followed by a 10-minute break and logged as 50 minutes', () => {
    let s = reducer(createInitialState(null), { type: 'SET_PREF', key: 'preset', value: '50' })
    s = reducer(s, { type: 'START_FOCUS', now: T0, pageLoadId: 'p' })
    expect(s.timer).toMatchObject({ durationSec: PRESETS[50].focus, breakSec: PRESETS[50].break })
    expect(s.timer.endsAt - s.timer.startedAt).toBe(50 * 60e3)
    s = reducer(s, { type: 'COMPLETE_PHASE', now: s.timer.endsAt })
    expect(s.sessions[0].durationSec).toBe(3000)
    expect(s.timer.durationSec).toBe(600)
  })

  it('a failed long block remembers its planned length; unknown presets are refused', () => {
    let s = reducer(createInitialState(null), { type: 'SET_PREF', key: 'preset', value: '90' })
    expect(reducer(s, { type: 'SET_PREF', key: 'preset', value: '40' })).toBe(s)
    s = reducer(s, { type: 'START_FOCUS', now: T0, pageLoadId: 'p' })
    s = reducer(s, { type: 'FAIL_FOCUS', reason: 'hidden', now: T0 + 30 * 60e3 })
    expect(s.sessions[0]).toMatchObject({ durationSec: 1800, plannedSec: 5400, status: 'failed' })
  })

  it('saved timers must have a real length; sessions up to 90 minutes are kept', () => {
    const cats = [{ id: 'a', name: 'A', color: '#5f6239', growth: 'tolgy' }]
    const timer = (durationSec) => ({ phase: 'focus', categoryId: 'a', startedAt: T0, endsAt: T0 + durationSec * 1000, durationSec })
    expect(sanitizeState({ categories: cats, timer: timer(3000), schemaVersion: 4 }).timer).not.toBeNull()
    expect(sanitizeState({ categories: cats, timer: timer(2400), schemaVersion: 4 }).timer).toBeNull()
    const long = { id: 'x', categoryId: 'a', start: T0, end: T0 + 5400e3, durationSec: 5400, status: 'completed' }
    expect(sanitizeState({ categories: cats, sessions: [long, { ...long, id: 'y', durationSec: 6000 }], schemaVersion: 4 }).sessions.map((s) => s.id)).toEqual(['x'])
  })

  it('daily goal and theme are validated', () => {
    let s = createInitialState(null)
    expect(s.prefs).toMatchObject({ dailyGoal: 4, theme: 'system', preset: '25' })
    s = reducer(s, { type: 'SET_DAILY_GOAL', goal: 6 })
    expect(s.prefs.dailyGoal).toBe(6)
    expect(reducer(s, { type: 'SET_DAILY_GOAL', goal: 99 }).prefs.dailyGoal).toBe(4)
    expect(reducer(s, { type: 'SET_PREF', key: 'theme', value: 'light' }).prefs.theme).toBe('light')
    expect(reducer(s, { type: 'SET_PREF', key: 'theme', value: 'neon' })).toBe(s)
  })
})

describe('levels', () => {
  it('1 XP per completed minute; each level needs 25 XP more than the last', () => {
    const sessions = [
      { status: 'completed', durationSec: 1500 },
      { status: 'failed', durationSec: 900 },
      { status: 'completed', durationSec: 3000 },
    ]
    expect(xpOf(sessions)).toBe(75)
    expect(levelOf(0)).toMatchObject({ level: 1, floor: 0, next: 50, progress: 0 })
    expect(levelOf(49).level).toBe(1)
    expect(levelOf(50)).toMatchObject({ level: 2, floor: 50, next: 125 })
    expect(levelOf(125).level).toBe(3)
    expect(levelOf(1350).level).toBe(10)
  })

  it('titles change at 1, 2, 3, 5, 7, 10 …', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 10, 49, 50, 99].map(titleIndex)).toEqual([0, 1, 2, 2, 3, 3, 4, 5, 8, 9, 9])
  })
})

describe('year map and seasons', () => {
  it('grades days by minutes', () => {
    expect([0, 10, 25, 59, 60, 119, 120, 300].map(intensity)).toEqual([0, 1, 2, 2, 3, 3, 4, 4])
  })

  it('lays the year out as Monday-first week columns', () => {
    const weeks = weeksOf(2026)
    expect(weeks).toHaveLength(53)
    expect(weeks[0].map((d) => d && d.getDate())).toEqual([null, null, null, 1, 2, 3, 4]) // 1 Jan 2026: Thursday
    expect(weeks.at(-1).map((d) => d && d.getDate())).toEqual([28, 29, 30, 31, null, null, null])
    expect(weeks.flat().filter(Boolean)).toHaveLength(365)
    expect(weeksOf(2024).flat().filter(Boolean)).toHaveLength(366)
  })

  it('sums the year and finds the longest run of active days', () => {
    const at = (m, d, min) => ({ status: 'completed', durationSec: min * 60, end: new Date(2026, m, d, 10).getTime() })
    const totals = dayTotals([at(0, 1, 25), at(0, 2, 25), at(0, 2, 50), at(0, 3, 25), at(5, 1, 90), { status: 'failed', durationSec: 600, end: new Date(2026, 0, 4).getTime() }])
    expect(totals.get('2026-01-02')).toEqual({ min: 75, count: 2 })
    expect(yearSummary(totals, 2026)).toEqual({ activeDays: 4, minutes: 215, best: { key: '2026-06-01', min: 90 }, longestRun: 3 })
    expect(yearSummary(totals, 2025).activeDays).toBe(0)
  })

  it('knows the season', () => {
    expect([0, 2, 5, 8, 10, 11].map((m) => seasonOf(new Date(2026, m, 15)))).toEqual(['winter', 'spring', 'summer', 'autumn', 'autumn', 'winter'])
  })
})
