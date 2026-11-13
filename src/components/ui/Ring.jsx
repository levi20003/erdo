import { useId } from 'react'

/**
 * A circular progress ring with content in the middle. The arc animates when the
 * value changes; `gradient` ([from, to]) paints it like the design's goal ring,
 * `glow` adds a soft halo once the ring is full.
 */
export default function Ring({ value, size = 56, stroke = 5, color = 'rgb(var(--sand))', gradient, track = 'rgb(var(--z800))', glow = false, label, children, className = '' }) {
  const id = useId().replace(/:/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.min(1, Math.max(0, value))
  const paint = gradient ? `url(#${id})` : color
  return (
    <span role={label ? 'img' : undefined} aria-label={label} className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90 overflow-visible" aria-hidden="true">
        {gradient && (
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={gradient[0]} />
              <stop offset="1" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={paint}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)', filter: glow && p >= 1 ? `drop-shadow(0 0 6px ${gradient ? gradient[1] : color})` : undefined }}
        />
      </svg>
      <span className="relative grid place-items-center">{children}</span>
    </span>
  )
}
