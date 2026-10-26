import { useId } from 'react'
import { stageOf } from '../../lib/growth'
import { GROUND_Y, ITEM_RENDERERS } from './items'

// Deterministic background silhouettes and firefly positions.
const FAR_TREES = [12, 30, 46, 64, 150, 166, 184, 198, 80, 122].map((x, i) => ({ x, h: 26 + ((i * 7) % 14) }))
const NEAR_TREES = [4, 24, 172, 192].map((x, i) => ({ x, h: 44 + ((i * 11) % 16) }))
const FIREFLIES = [
  [46, 96, 0, 8, 6, -9],
  [150, 84, 1.5, 10, -7, -6],
  [64, 128, 3, 9, 5, -12],
  [138, 124, 4.2, 11, -6, -8],
  [100, 52, 2.2, 12, 8, 6],
  [30, 140, 5.4, 9, 7, -5],
  [172, 108, 6, 10, -5, -10],
]

const tree = (x, h, w) => `M${x} ${GROUND_Y + 4 - h}L${x - w} ${GROUND_Y + 6}H${x + w}Z`

/**
 * Circular "window" into the Erdő: dusk sky, layered tree line, ground, the
 * growing item and — while focusing — drifting fireflies.
 */
export default function ForestScene({ item = 'tolgy', color = '#7d8247', progress = 0, alive = false, backdrop = true, className = '' }) {
  const id = useId().replace(/:/g, '')
  const Item = ITEM_RENDERERS[item] ?? ITEM_RENDERERS.tolgy
  const p = Math.min(1, Math.max(0, progress))
  const stage = stageOf(p)

  return (
    // Ambient motion (sway, spores, glow) runs only while the scene is live; static
    // scenes — idle, icons, previews — stay still and cost nothing per frame.
    <svg viewBox={backdrop ? '0 0 200 200' : '34 34 132 132'} className={`block ${alive ? '' : 'motion-off'} ${className}`} role="img" aria-hidden={!backdrop || undefined}>
      {backdrop && (
        <>
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d0e0a" />
              <stop offset="0.7" stopColor="#171912" />
            </linearGradient>
            <radialGradient id={`${id}-glow`} cx="0.5" cy="0.62" r="0.5">
              <stop offset="0" stopColor="#c9ab84" stopOpacity="0.35" />
              <stop offset="1" stopColor="#c9ab84" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="200" fill={`url(#${id}-sky)`} />
          <circle cx="152" cy="46" r="10" fill="#e6d6bf" opacity="0.08" />
          <circle cx="152" cy="46" r="5" fill="#e6d6bf" opacity="0.14" />
          {FAR_TREES.map(({ x, h }) => (
            <path key={`f${x}`} d={tree(x, h + 18, 9)} fill="#1c1e16" />
          ))}
          <ellipse
            className="glow-pulse"
            cx="100"
            cy="120"
            rx="90"
            ry="70"
            fill={`url(#${id}-glow)`}
            style={{ opacity: 0.25 + 0.75 * p, transition: 'opacity 2s ease' }}
          />
          {NEAR_TREES.map(({ x, h }) => (
            <path key={`n${x}`} d={tree(x, h + 30, 13)} fill="#22251a" />
          ))}
          <path d={`M0 ${GROUND_Y + 3}Q50 ${GROUND_Y - 6} 100 ${GROUND_Y + 1}T200 ${GROUND_Y - 2}V200H0Z`} fill="#15170f" />
          <path
            d="M24 158l2-6 2 6M44 160l1.5-5 1.5 5M156 158l2-6 2 6M176 160l1.5-5 1.5 5M134 162l1.5-4 1.5 4M60 163l1.5-4 1.5 4"
            stroke="#2d3120"
            strokeWidth="1.2"
            fill="none"
          />
        </>
      )}

      <Item p={p} color={color} />

      {backdrop && alive && (
        <>
          <circle key={stage} className="stage-bloom" cx="100" cy="118" r="34" fill="none" stroke="#c9ab84" strokeWidth="0.8" />
          {FIREFLIES.map(([cx, cy, delay, dur, dx, dy]) => (
            <circle
              key={`${cx}-${cy}`}
              className="firefly"
              cx={cx}
              cy={cy}
              r="1.3"
              fill="#f3ebdf"
              style={{ '--delay': `${delay}s`, '--dur': `${dur}s`, '--dx': `${dx}px`, '--dy': `${dy}px` }}
            />
          ))}
        </>
      )}
    </svg>
  )
}
