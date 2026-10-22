import { useEffect, useState } from 'react'

/** Progress bar that animates from zero on mount and on value changes. */
export default function Bar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(value)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80"
    >
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${shown}%`, background: color }} />
    </div>
  )
}
