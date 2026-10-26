import { describe, expect, it } from 'vitest'
import { shouldAskFeedback } from '../components/feedback/FeedbackPrompt'
import { computeInsights } from '../lib/insights'
import { createInitialState, reducer } from '../store/reducer'

const DAY = 864e5
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime()
const session = (id, end, extra = {}) => ({ id, categoryId: 'tanulas', start: end - 1500e3, end, durationSec: 1500, status: 'completed', ...extra })

describe('insights', () => {
  it('compares the last 7 days with the 7 before and finds the best day and favourite', () => {
    const now = new Date(at(2026, 10, 26))
    const sessions = [
      session('a', at(2026, 10, 26)),
      session('b', at(2026, 10, 25)),
      session('c', at(2026, 10, 25, 15), { categoryId: 'kreativ' }),
      session('d', at(2026, 10, 15)),
      session('e', at(2026, 10, 24), { status: 'failed', durationSec: 600 }),
    ]
    const i = computeInsights(sessions, now)
    expect(i.last7Min).toBe(75)
    expect(i.deltaPct).toBe(200)
    expect(i.activeDays).toBe(3)
    expect(i.bestDay).toEqual({ key: '2026-10-25', min: 50 })
    expect(i.favoriteCategoryId).toBe('tanulas')
  })

  it('has no comparison when the previous week is empty', () => {
    expect(computeInsights([session('a', at(2026, 10, 26))], new Date(at(2026, 10, 26))).deltaPct).toBeNull()
  })
})

describe('feedback prompt rules', () => {
  const five = Array.from({ length: 5 }, (_, i) => session(`s${i}`, at(2026, 10, 20 + i)))
  const now = at(2026, 10, 26)

  it('waits for 5 completed sessions', () => {
    expect(shouldAskFeedback(five.slice(0, 4), null, now)).toBe(false)
    expect(shouldAskFeedback(five, null, now)).toBe(true)
  })

  it('never asks again after a rating, and at most twice after "not now"', () => {
    expect(shouldAskFeedback(five, { shownAt: now - 30 * DAY, dismissals: 0, rating: 4 }, now)).toBe(false)
    const many = Array.from({ length: 40 }, (_, i) => session(`m${i}`, at(2026, 9, 1) + i * DAY))
    expect(shouldAskFeedback(many, { shownAt: now - 30 * DAY, dismissals: 1, rating: null }, now)).toBe(true)
    expect(shouldAskFeedback(many, { shownAt: now - 3 * DAY, dismissals: 1, rating: null }, now)).toBe(false)
    expect(shouldAskFeedback(many, { shownAt: now - 30 * DAY, dismissals: 2, rating: null }, now)).toBe(false)
  })
})

describe('reducer: new actions', () => {
  const base = createInitialState(null)

  it('accepts only known preference values', () => {
    expect(reducer(base, { type: 'SET_PREF', key: 'lang', value: 'en' }).prefs.lang).toBe('en')
    expect(reducer(base, { type: 'SET_PREF', key: 'lang', value: 'xx' })).toBe(base)
    expect(reducer(base, { type: 'SET_PREF', key: '__proto__', value: 'x' })).toBe(base)
  })

  it('merges an import without duplicates; existing entries win', () => {
    const mine = { ...base, sessions: [session('x', 1000)] }
    const imported = { ...base, categories: [...base.categories, { id: 'new', name: 'Új', color: '#5f6239', growth: 'gomba' }], sessions: [session('x', 1000, { durationSec: 1 }), session('y', 2000)] }
    const merged = reducer(mine, { type: 'IMPORT_MERGE', imported })
    expect(merged.sessions.map((s) => s.id)).toEqual(['x', 'y'])
    expect(merged.sessions[0].durationSec).toBe(1500)
    expect(merged.categories.map((c) => c.id)).toContain('new')
    expect(merged.categories).toHaveLength(base.categories.length + 1)
  })

  it('never lets an edit change a category id', () => {
    const s = reducer(base, { type: 'UPDATE_CATEGORY', id: 'tanulas', patch: { id: 'hacked', name: 'Új név' } })
    expect(s.categories[0]).toMatchObject({ id: 'tanulas', name: 'Új név' })
  })

  it('records feedback state', () => {
    let s = reducer(base, { type: 'FEEDBACK_SHOWN', now: 5 })
    s = reducer(s, { type: 'FEEDBACK_DISMISS', now: 6 })
    expect(s.prefs.feedback).toMatchObject({ shownAt: 5, dismissals: 1, rating: null })
    s = reducer(s, { type: 'FEEDBACK_RATE', rating: 5, now: 7 })
    expect(s.prefs.feedback.rating).toBe(5)
    expect(reducer(s, { type: 'FEEDBACK_RATE', rating: 9, now: 8 })).toBe(s)
  })
})
