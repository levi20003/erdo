const R = 48
const C = 2 * Math.PI * R

/**
 * Thin progress track framing the scene. While `live`, a blurred copy of the arc
 * breathes underneath and a glowing head pings at the current position, so
 * progress reads as real-time at a glance.
 */
export default function ProgressRing({ progress, color, live = false, children }) {
  const angle = 2 * Math.PI * progress
  const headX = 50 + R * Math.cos(angle)
  const headY = 50 + R * Math.sin(angle)
  const arc = {
    cx: 50,
    cy: 50,
    r: R,
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round',
    strokeDasharray: C,
    strokeDashoffset: C * (1 - progress),
    style: { transition: 'stroke-dashoffset 0.4s linear, stroke 0.6s ease' },
  }

  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90 overflow-visible" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#27272a" strokeWidth="1.2" />
        {live && <circle {...arc} strokeWidth="4" className="ring-breathe" style={{ ...arc.style, filter: 'blur(2.5px)' }} />}
        <circle {...arc} strokeWidth="1.6" style={{ ...arc.style, filter: `drop-shadow(0 0 2px ${color})` }} />
        {live && progress > 0.002 && (
          <g style={{ transform: `translate(${headX}px, ${headY}px)`, transition: 'transform 0.4s linear' }}>
            <circle r="1.7" fill={color} className="ring-ping" />
            <circle r="1.9" fill="#f3ebdf" style={{ filter: `drop-shadow(0 0 2.5px ${color})` }} />
          </g>
        )}
      </svg>
      <div className="absolute inset-[5.5%] overflow-hidden rounded-full">{children}</div>
    </div>
  )
}
