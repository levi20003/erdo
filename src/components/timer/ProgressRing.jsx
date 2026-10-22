const R = 48
const C = 2 * Math.PI * R

/** Thin progress track framing the scene; the progress head carries a soft glow. */
export default function ProgressRing({ progress, color, children }) {
  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90 overflow-visible" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#27272a" strokeWidth="1.2" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.4s linear, stroke 0.6s ease', filter: `drop-shadow(0 0 2px ${color})` }}
        />
      </svg>
      <div className="absolute inset-[5.5%] overflow-hidden rounded-full">{children}</div>
    </div>
  )
}
