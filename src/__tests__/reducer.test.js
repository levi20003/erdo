import { describe, expect, it } from 'vitest'
import { BREAK_SEC, CELEBRATION_MS, FOCUS_SEC } from '../lib/config'
import { createInitialState, reducer } from '../store/reducer'

const T0 = Date.UTC(2026, 9, 23, 10)
const start = (state = createInitialState(null)) => reducer(state, { type: 'START_FOCUS', now: T0, pageLoadId: 'p1' })

describe('pomodoro reducer', () => {
  it('ignores an early completion and completes exactly once', () => {
    let s = start()
    expect(reducer(s, { type: 'COMPLETE_PHASE', now: T0 + 60_000 })).toBe(s)
    s = reducer(s, { type: 'COMPLETE_PHASE', now: T0 + FOCUS_SEC * 1000 })
    expect(s.sessions).toHaveLength(1)
    expect(s.sessions[0]).toMatchObject({ status: 'completed', durationSec: FOCUS_SEC })
    // A second dispatch for the same block (double tick) is a no-op.
    expect(reducer(s, { type: 'COMPLETE_PHASE', now: T0 + FOCUS_SEC * 1000 + 10 })).toBe(s)
  })

  it('starts the 5-minute break after the celebration', () => {
    const done = T0 + FOCUS_SEC * 1000
    const s = reducer(start(), { type: 'COMPLETE_PHASE', now: done })
    expect(s.timer.phase).toBe('break')
    expect(s.timer.startedAt - done).toBe(CELEBRATION_MS)
    expect(s.timer.endsAt - s.timer.startedAt).toBe(BREAK_SEC * 1000)
  })

  it('logs a failure with the time actually focused, and discards very short ones', () => {
    const failed = reducer(start(), { type: 'FAIL_FOCUS', reason: 'hidden', now: T0 + 10 * 60_000 })
    expect(failed.timer).toBeNull()
    expect(failed.sessions[0]).toMatchObject({ status: 'failed', reason: 'hidden', durationSec: 600 })
    const tooShort = reducer(start(), { type: 'FAIL_FOCUS', reason: 'hidden', now: T0 + 10_000 })
    expect(tooShort.sessions).toHaveLength(0)
  })

  it('gives one focus block one session id, so two tabs cannot log it twice', () => {
    const a = reducer(start(), { type: 'COMPLETE_PHASE', now: T0 + FOCUS_SEC * 1000 })
    const b = reducer(start(), { type: 'COMPLETE_PHASE', now: T0 + FOCUS_SEC * 1000 + 300 })
    expect(a.sessions[0].id).toBe(b.sessions[0].id)
  })

  it('ignores a fail on a break and a start during focus', () => {
    const brk = reducer(start(), { type: 'COMPLETE_PHASE', now: T0 + FOCUS_SEC * 1000 })
    expect(reducer(brk, { type: 'FAIL_FOCUS', reason: 'hidden', now: brk.timer.startedAt + 1000 })).toBe(brk)
    const focusing = start()
    expect(reducer(focusing, { type: 'START_FOCUS', now: T0 + 5, pageLoadId: 'p2' })).toBe(focusing)
  })

  it('never deletes the last category or the one being focused on', () => {
    const one = { ...createInitialState(null), categories: [createInitialState(null).categories[0]] }
    expect(reducer(one, { type: 'DELETE_CATEGORY', id: 'tanulas' })).toBe(one)
    const s = start()
    expect(reducer(s, { type: 'DELETE_CATEGORY', id: s.timer.categoryId })).toBe(s)
  })
})
