import { useId } from 'react'
import { stageOf } from '../../lib/growth'
import { seasonOf } from '../../lib/season'
import { useTheme } from '../ThemeRoot'
import { GROUND_Y, ITEM_RENDERERS } from './items'

// Deterministic background silhouettes, fireflies and falling bits.
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
const FALLING = Array.from({ length: 9 }, (_, i) => ({ x: 14 + ((i * 47) % 172), delay: i * 1.3, dur: 8 + (i % 4) * 1.6, dx: (i % 2 ? 1 : -1) * (8 + (i % 3) * 6) }))
const GROUND_BITS = [[34, 159], [58, 163], [76, 158], [128, 160], [146, 164], [168, 158], [44, 168], [158, 170]]

/* Night and day palettes, then the season tints the trees and the ground. */
const BASE = {
  dark: { skyTop: '#0d0e0a', skyBottom: '#171912', far: '#1c1e16', near: '#22251a', ground: '#15170f', grass: '#2d3120', glow: '#c9ab84' },
  light: { skyTop: '#cfe0d4', skyBottom: '#f3ead6', far: '#a9b891', near: '#86996b', ground: '#738a55', grass: '#5c7044', glow: '#ffe7b0' },
}
const SEASON = {
  spring: { dark: {}, light: { far: '#b3c495', near: '#8aa36a' }, bits: ['#e7b6c4', '#f6f0e4', '#f2d16b'], fall: '#efc3cf' },
  summer: { dark: {}, light: {}, bits: null, fall: null },
  autumn: { dark: { far: '#241f15', near: '#2b2416' }, light: { far: '#cfa66d', near: '#b5804c', ground: '#8a7a4a', grass: '#6f6436' }, bits: ['#c4623a', '#d98a3d', '#a8432c'], fall: '#d9773a' },
  winter: { dark: { far: '#1b2024', near: '#20262a', ground: '#262c30', grass: '#39424a', skyTop: '#0b0e12' }, light: { skyTop: '#d9e4ea', skyBottom: '#f2f4f2', far: '#a7b5b8', near: '#8a9a9d', ground: '#eef2f2', grass: '#c9d3d6' }, bits: null, fall: '#ffffff' },
}

const tree = (x, h, w) => `M${x} ${GROUND_Y + 4 - h}L${x - w} ${GROUND_Y + 6}H${x + w}Z`

/**
 * Circular "window" into the Erdő: night sky in dark mode, daylight in light
 * mode, dressed for the season; the growing item, and — while focusing —
 * fireflies (summer nights) or petals, leaves and snow drifting down.
 */
export default function ForestScene({ item = 'tolgy', color = '#7d8247', progress = 0, alive = false, withered = false, backdrop = true, className = '' }) {
  const id = useId().replace(/:/g, '')
  const theme = useTheme()
  const Item = ITEM_RENDERERS[item] ?? ITEM_RENDERERS.tolgy
  const p = Math.min(1, Math.max(0, progress))
  const stage = stageOf(p)
  const season = seasonOf()
  const look = SEASON[season]
  const c = { ...BASE[theme], ...look[theme] }
  const night = theme === 'dark'
  const winter = season === 'winter'

  return (
    // Ambient motion (sway, spores, glow) runs only while the scene is live; static
    // scenes — idle, icons, previews — stay still and cost nothing per frame.
    <svg viewBox={backdrop ? '0 0 200 200' : '34 34 132 132'} className={`block ${alive ? '' : 'motion-off'} ${className}`} role="img" aria-hidden={!backdrop || undefined}>
      {backdrop && (
        <>
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.skyTop} />
              <stop offset="0.72" stopColor={c.skyBottom} />
            </linearGradient>
            <radialGradient id={`${id}-glow`} cx="0.5" cy="0.62" r="0.5">
              <stop offset="0" stopColor={c.glow} stopOpacity={night ? 0.35 : 0.55} />
              <stop offset="1" stopColor={c.glow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="200" fill={`url(#${id}-sky)`} />
          {night ? (
            <>
              {[[30, 30], [62, 18], [118, 24], [178, 34], [92, 40], [44, 56], [168, 64]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="0.7" fill="#f3ebdf" opacity="0.45" />
              ))}
              <circle cx="152" cy="46" r="10" fill="#e6d6bf" opacity="0.08" />
              <circle cx="152" cy="46" r="5" fill="#e6d6bf" opacity="0.16" />
            </>
          ) : (
            <>
              <circle cx="150" cy="44" r="22" fill="#fff6dc" opacity="0.55" />
              <circle cx="150" cy="44" r="11" fill={winter ? '#fffdf5' : '#fff1c2'} />
              <path d="M30 40q8-8 18-3 6-6 14 0 8 0 8 7H28q-4-2 2-4Z" fill="#ffffff" opacity="0.75" />
              <path d="M104 26q6-5 13-2 5-4 10 1 6 0 6 5h-31q-3-2 2-4Z" fill="#ffffff" opacity="0.55" />
            </>
          )}
          {FAR_TREES.map(({ x, h }) => (
            <path key={`f${x}`} d={tree(x, h + 18, 9)} fill={c.far} />
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
            <g key={`n${x}`}>
              <path d={tree(x, h + 30, 13)} fill={c.near} />
              {winter && <path d={`M${x} ${GROUND_Y + 4 - h - 30}l-5 9h10Z`} fill="#f4f7f8" opacity={night ? 0.5 : 0.95} />}
            </g>
          ))}
          <path d={`M0 ${GROUND_Y + 3}Q50 ${GROUND_Y - 6} 100 ${GROUND_Y + 1}T200 ${GROUND_Y - 2}V200H0Z`} fill={c.ground} />
          <path
            d="M24 158l2-6 2 6M44 160l1.5-5 1.5 5M156 158l2-6 2 6M176 160l1.5-5 1.5 5M134 162l1.5-4 1.5 4M60 163l1.5-4 1.5 4"
            stroke={c.grass}
            strokeWidth="1.2"
            fill="none"
          />
          {look.bits &&
            GROUND_BITS.map(([x, y], i) =>
              season === 'spring' ? (
                <circle key={x} cx={x} cy={y} r="1.6" fill={look.bits[i % 3]} />
              ) : (
                <ellipse key={x} cx={x} cy={y} rx="2.6" ry="1.2" fill={look.bits[i % 3]} transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} />
              ),
            )}
          {winter && <path d={`M0 ${GROUND_Y + 4}Q50 ${GROUND_Y - 4} 100 ${GROUND_Y + 2}T200 ${GROUND_Y - 1}V${GROUND_Y + 8}H0Z`} fill="#f4f7f8" opacity={night ? 0.25 : 0.9} />}
        </>
      )}

      {withered ? (
        // A failed session: the plant as far as it got, drained of colour and drooping.
        <g filter={`url(#${id}-withered)`} style={{ transform: 'rotate(-9deg) scaleY(0.94)', transformOrigin: `100px ${GROUND_Y}px` }}>
          <defs>
            <filter id={`${id}-withered`}>
              <feColorMatrix type="saturate" values="0.05" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="0.62" intercept="0.06" />
                <feFuncG type="linear" slope="0.5" intercept="0.03" />
                <feFuncB type="linear" slope="0.38" />
              </feComponentTransfer>
            </filter>
          </defs>
          <Item p={p} color={color} />
        </g>
      ) : (
        <Item p={p} color={color} />
      )}

      {backdrop && alive && (
        <>
          <circle key={stage} className="stage-bloom" cx="100" cy="118" r="34" fill="none" stroke="#c9ab84" strokeWidth="0.8" />
          {look.fall
            ? FALLING.map((f, i) => (
                <ellipse
                  key={f.x}
                  className="fall"
                  cx={f.x}
                  cy="-6"
                  rx={winter ? 1.3 : 2.2}
                  ry={winter ? 1.3 : 1.1}
                  fill={look.fall}
                  opacity={winter && !night ? 0.95 : 0.85}
                  style={{ '--delay': `${f.delay}s`, '--dur': `${f.dur}s`, '--dx': `${f.dx}px`, '--rot': `${i % 2 ? 220 : -200}deg` }}
                />
              ))
            : FIREFLIES.map(([cx, cy, delay, dur, dx, dy]) => (
                <circle
                  key={`${cx}-${cy}`}
                  className="firefly"
                  cx={cx}
                  cy={cy}
                  r="1.3"
                  fill={night ? '#f3ebdf' : '#fff8d6'}
                  style={{ '--delay': `${delay}s`, '--dur': `${dur}s`, '--dx': `${dx}px`, '--dy': `${dy}px` }}
                />
              ))}
        </>
      )}
    </svg>
  )
}
