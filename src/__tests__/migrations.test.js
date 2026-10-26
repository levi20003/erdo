import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from '../lib/config'
import { MIGRATION_STEPS, migrate, storedVersion } from '../lib/migrations'
import { sanitizeState } from '../lib/sanitize'

const legacy = {
  categories: [{ id: 'a', name: 'Tanulás', color: '#5f6239' }],
  sessions: [{ id: 's1', categoryId: 'a', start: 0, end: 1_500_000, durationSec: 1500, status: 'completed' }],
  prefs: { breakGuide: 'stretch' },
}

describe('migrations', () => {
  it('has a step for every version below the current one', () => {
    for (let v = 1; v < SCHEMA_VERSION; v++) expect(typeof MIGRATION_STEPS[v]).toBe('function')
  })

  it('treats unversioned data as version 1', () => {
    expect(storedVersion(legacy)).toBe(1)
    expect(storedVersion({ ...legacy, schemaVersion: 'x' })).toBe(1)
  })

  it('upgrades legacy data and keeps the user’s choices', () => {
    const { data, from, newer } = migrate(legacy)
    expect(from).toBe(1)
    expect(newer).toBe(false)
    expect(data.schemaVersion).toBe(SCHEMA_VERSION)
    expect(data.prefs).toMatchObject({ breakGuide: 'stretch', lang: 'hu' })
    expect(data.sessions).toEqual(legacy.sessions)
  })

  it('is deterministic and idempotent', () => {
    const once = migrate(legacy).data
    expect(migrate(legacy).data).toEqual(once)
    expect(migrate(once).data).toEqual(once)
  })

  it('does not touch data from a newer app version', () => {
    const future = { ...legacy, schemaVersion: SCHEMA_VERSION + 1, garden: [1, 2] }
    const result = migrate(future)
    expect(result.newer).toBe(true)
    expect(result.data).toBe(future)
  })

  it('sanitizeState runs migrations and assigns growth items to old categories', () => {
    const s = sanitizeState(legacy)
    expect(s.schemaVersion).toBe(SCHEMA_VERSION)
    expect(s.categories[0].growth).toBe('tolgy')
    expect(s.prefs).toEqual({ breakGuide: 'stretch', lang: 'hu', feedback: null })
  })
})
