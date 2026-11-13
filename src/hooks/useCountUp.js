import { useEffect, useRef, useState } from 'react'

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * A number that counts up (or down) to `value` with an ease-out, starting from
 * `from` on mount and from the previous value afterwards. Reduced motion: no animation.
 */
export function useCountUp(value, { duration = 900, from = 0, delay = 0 } = {}) {
  const [shown, setShown] = useState(() => (reduced() ? value : from))
  const current = useRef(shown)

  useEffect(() => {
    if (reduced() || current.current === value) {
      current.current = value
      setShown(value)
      return
    }
    const start = current.current
    let raf = 0
    let t0 = 0
    const step = (ts) => {
      if (!t0) t0 = ts + delay
      const p = Math.min(1, Math.max(0, (ts - t0) / duration))
      const eased = 1 - (1 - p) ** 3
      const next = start + (value - start) * eased
      current.current = next
      setShown(next)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, delay])

  return shown
}
