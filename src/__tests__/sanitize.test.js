import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES } from '../lib/config'
import { sanitizeState } from '../lib/sanitize'

const session = (over = {}) => ({ id: 's1', categoryId: 'tanulas', start: 1000, end: 1501000, durationSec: 1500, status: 'completed', ...over })

describe('sanitizeState', () => {
  it('returns defaults for null, garbage and wrong types', () => {
    for (const raw of [null, undefined, 'x', 42, [], { categories: 'x', sessions: {}, timer: 'y' }]) {
      const s = sanitizeState(raw)
      expect(s.categories).toEqual(DEFAULT_CATEGORIES)
      expect(s.sessions).toEqual([])
      expect(s.timer).toBeNull()
      expect(s.selectedCategoryId).toBe('tanulas')
    }
  })

  it('drops only the broken sessions and keeps the rest', () => {
    const s = sanitizeState({
      sessions: [session(), null, { id: 2 }, session({ id: 's2', end: 0 }), session({ id: 's3', durationSec: NaN }), session({ id: 's4', status: 'weird' }), session({ id: 's5', start: 5000, end: 9000, durationSec: 4 })],
    })
    expect(s.sessions.map((x) => x.id)).toEqual(['s5', 's1'])
  })

  it('removes duplicate sessions and sorts by end time', () => {
    const s = sanitizeState({ sessions: [session({ id: 'b', start: 5, end: 9 }), session({ id: 'a', start: 1, end: 2 }), session({ id: 'b', start: 5, end: 9 })] })
    expect(s.sessions.map((x) => x.id)).toEqual(['a', 'b'])
  })

  it('repairs categories field by field', () => {
    const s = sanitizeState({ categories: [{ id: 'x', name: '  Olvasás  ', color: 'red', growth: 'banana' }, { id: 'x', name: 'Dup' }, { name: 'no id' }, { id: 'y', name: '' }] })
    expect(s.categories).toHaveLength(1)
    expect(s.categories[0]).toMatchObject({ id: 'x', name: 'Olvasás', growth: 'tolgy' })
    expect(s.categories[0].color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('rejects inconsistent timers and keeps valid ones', () => {
    expect(sanitizeState({ timer: { phase: 'focus' } }).timer).toBeNull()
    expect(sanitizeState({ timer: { phase: 'focus', categoryId: 'tanulas', startedAt: 10, endsAt: 5, durationSec: 1500 } }).timer).toBeNull()
    expect(sanitizeState({ timer: { phase: 'focus', categoryId: 'deleted', startedAt: 0, endsAt: 1500000, durationSec: 1500 } }).timer).toBeNull()
    expect(sanitizeState({ timer: { phase: 'focus', categoryId: 'tanulas', startedAt: 0, endsAt: 1500000, durationSec: 1500 } }).timer).toMatchObject({ phase: 'focus' })
  })

  it('falls back to the first category when the selected one is gone', () => {
    expect(sanitizeState({ selectedCategoryId: 'nope' }).selectedCategoryId).toBe('tanulas')
  })
})
