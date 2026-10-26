import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStrictGuard } from '../lib/strictGuard'
import { nextTickDelay, startTicker } from '../lib/ticker'

describe('strict mode guard (fake timers)', () => {
  beforeEach(() => vi.useFakeTimers({ now: 0 }))
  afterEach(() => vi.useRealTimers())

  const guard = () => {
    const onFail = vi.fn()
    return { g: createStrictGuard({ graceMs: 5000, onFail }), onFail }
  }

  it('forgives a short absence', () => {
    const { g, onFail } = guard()
    g.leave('hidden')
    vi.advanceTimersByTime(1000)
    g.back()
    vi.advanceTimersByTime(60_000)
    expect(onFail).not.toHaveBeenCalled()
  })

  it('fails once the grace period passes while away (page keeps running)', () => {
    const { g, onFail } = guard()
    g.leave('blur')
    vi.advanceTimersByTime(5001)
    expect(onFail).toHaveBeenCalledWith('blur')
    g.back()
    expect(onFail).toHaveBeenCalledTimes(1)
  })

  it('fails on return when the OS froze timers during a long absence', () => {
    const { g, onFail } = guard()
    g.leave('hidden')
    vi.setSystemTime(30_000) // time passed, but no timer ran (mobile background)
    g.back()
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(onFail).toHaveBeenCalledWith('hidden')
  })

  it('keeps the first reason and ignores repeated leave events (blur then hidden)', () => {
    const { g, onFail } = guard()
    g.leave('blur')
    vi.advanceTimersByTime(2000)
    g.leave('hidden')
    expect(g.awaySince()).toBe(0)
    vi.advanceTimersByTime(3001)
    expect(onFail).toHaveBeenCalledWith('blur')
  })

  it('leaves no pending timer after dispose', () => {
    const { g, onFail } = guard()
    g.leave('hidden')
    g.dispose()
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(10_000)
    expect(onFail).not.toHaveBeenCalled()
  })
})

describe('ticker (fake timers)', () => {
  beforeEach(() => vi.useFakeTimers({ now: 1_000_000 }))
  afterEach(() => vi.useRealTimers())

  it('schedules at whole-second boundaries of the countdown', () => {
    expect(nextTickDelay(1_000_000 + 25_000, null, 1_000_000)).toBe(1005)
    expect(nextTickDelay(1_000_000 + 24_400, null, 1_000_000)).toBe(405)
    expect(nextTickDelay(1_000_000, null, 1_000_000)).toBeNull()
    // wakeAt sooner than the next second (end of the celebration)
    expect(nextTickDelay(1_000_000 + 300_000, 1_000_000 + 200, 1_000_000)).toBe(205)
  })

  it('ticks once per displayed second, keeps one timer, and stops at the end', () => {
    const ticks = []
    const t = startTicker({ endsAt: Date.now() + 10_000, wakeAt: null, onTick: (n) => ticks.push(n) })
    expect(vi.getTimerCount()).toBe(1)
    vi.advanceTimersByTime(10_100)
    // initial tick + one per second (10)
    expect(ticks).toHaveLength(11)
    expect(vi.getTimerCount()).toBe(0)
    // No drift: every tick landed 5 ms past a whole second of the countdown.
    for (const n of ticks.slice(1)) expect((n - 1_000_000) % 1000).toBe(5)
    t.stop()
  })

  it('stop() leaves nothing pending and resync() does not double up', () => {
    const t = startTicker({ endsAt: Date.now() + 60_000, wakeAt: null, onTick: () => {} })
    t.resync()
    t.resync()
    expect(vi.getTimerCount()).toBe(1)
    t.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
