import { useEffect, useState } from 'react'
import { startTicker } from '../lib/ticker'

/**
 * Current time for a running phase, refreshed exactly when the display can
 * change (lib/ticker.js). Returning to the page re-reads the clock at once,
 * since background tabs throttle timers.
 */
export function useTicker(endsAt, wakeAt) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    if (endsAt == null) return
    const ticker = startTicker({ endsAt, wakeAt, onTick: setNow })
    const onVisible = () => !document.hidden && ticker.resync()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      ticker.stop()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [endsAt, wakeAt])

  return now
}
