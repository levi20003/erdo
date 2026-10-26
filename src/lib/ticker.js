/**
 * Delay until the displayed countdown can next change: the next whole-second
 * boundary before `endsAt`, or `wakeAt` if sooner (+5 ms to land just past it).
 * null when the phase is over.
 */
export function nextTickDelay(endsAt, wakeAt, now) {
  const untilEnd = endsAt - now
  if (untilEnd <= 0) return null
  let delay = (untilEnd % 1000 || 1000) + 5
  if (wakeAt != null && wakeAt > now) delay = Math.min(delay, wakeAt - now + 5)
  return delay
}

/**
 * Calls onTick(now) immediately and then exactly when the display can change.
 * Time is read from the clock on every tick, never accumulated, so it cannot
 * drift; one timeout is pending at a time. Returns { stop, resync }.
 */
export function startTicker({ endsAt, wakeAt, onTick, now = Date.now }) {
  let id = null
  const run = () => {
    const current = now()
    onTick(current)
    const delay = nextTickDelay(endsAt, wakeAt, current)
    id = delay === null ? null : setTimeout(run, delay)
  }
  run()
  return {
    stop: () => clearTimeout(id),
    resync: () => {
      clearTimeout(id)
      run()
    },
  }
}
