import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SCHEMA_VERSION, STORAGE_KEY } from '../lib/config'
import { installMemoryStorage } from './helpers/memoryStorage'

// storage.js keeps module state (last written value), so each test gets a fresh copy.
async function freshStorage(opts) {
  vi.resetModules()
  const mem = installMemoryStorage(opts)
  const mod = await import('../lib/storage')
  return { ...mod, mem }
}

const legacy = JSON.stringify({ sessions: [{ id: 's1', categoryId: 'tanulas', start: 0, end: 1_500_000, durationSec: 1500, status: 'completed' }] })

describe('storage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('starts empty on first run', async () => {
    const { load } = await freshStorage()
    expect(load()).toMatchObject({ status: 'empty' })
  })

  it('keeps unreadable data aside instead of overwriting it', async () => {
    const { load, mem } = await freshStorage()
    mem.data.set(STORAGE_KEY, '{oops')
    const result = load()
    expect(result.status).toBe('repaired')
    expect(result.state.sessions).toEqual([])
    const copies = [...mem.data.keys()].filter((k) => k.includes(':corrupt-'))
    expect(copies).toHaveLength(1)
    expect(mem.data.get(copies[0])).toBe('{oops')
  })

  it('migrates legacy data, backing it up once before the first rewrite', async () => {
    const { load, save, mem } = await freshStorage()
    mem.data.set(STORAGE_KEY, legacy)
    const result = load()
    expect(result).toMatchObject({ status: 'migrated', fromVersion: 1 })
    expect(mem.data.get(`${STORAGE_KEY}:backup-v1`)).toBe(legacy)
    expect(save(result.state)).toBe(true)
    expect(JSON.parse(mem.data.get(STORAGE_KEY)).schemaVersion).toBe(SCHEMA_VERSION)
    // A second load is a normal one and does not overwrite the original backup.
    mem.data.set(STORAGE_KEY + ':backup-v1', legacy)
    expect(load().status).toBe('ok')
  })

  it('preserves fields written by a newer app version', async () => {
    const { load, save, mem } = await freshStorage()
    mem.data.set(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, sessions: [], garden: { trees: 3 } }))
    const result = load()
    expect(result.status).toBe('newer')
    save({ ...result.state, selectedCategoryId: 'fokusz' })
    expect(JSON.parse(mem.data.get(STORAGE_KEY)).garden).toEqual({ trees: 3 })
  })

  it('frees its own clutter and retries when the quota is full', async () => {
    const { load, save, mem } = await freshStorage()
    const state = load().state
    mem.data.set(`${STORAGE_KEY}:corrupt-1`, 'x'.repeat(4000))
    mem.setQuota(3000)
    expect(save(state)).toBe(true)
    expect(mem.data.has(`${STORAGE_KEY}:corrupt-1`)).toBe(false)
  })

  it('reports failure (without throwing) when storage refuses writes', async () => {
    const { load, save, mem } = await freshStorage()
    const state = load().state
    mem.setQuota(10)
    expect(save(state)).toBe(false)
  })

  it('reports unavailable storage (private mode)', async () => {
    const { load } = await freshStorage({ broken: true })
    expect(load().status).toBe('unavailable')
  })

  it('skips identical writes', async () => {
    const { load, save } = await freshStorage()
    const state = load().state
    const spy = vi.spyOn(globalThis.localStorage, 'setItem')
    save(state)
    save(state)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
