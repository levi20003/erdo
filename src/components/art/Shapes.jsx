/*
 * The organic shapes of the design: soft waves between colour bands, and a
 * row of pine silhouettes. Decorative only (aria-hidden), sized by their box.
 */

const WAVES = {
  // A gentle double hump, like the brown band under "SIGN UP".
  hill: 'M0 34C28 6 62 4 92 24S160 58 200 18V80H0Z',
  // A long swell, like the splash screen's brown and green bands.
  swell: 'M0 52C40 20 86 14 124 30S182 54 200 40V80H0Z',
  // Low and wide: the bottom edge of a header.
  low: 'M0 28C50 50 120 4 200 26V80H0Z',
}

/** A wave filling the bottom of its box with `fill` (the colour of what comes below). */
export function Wave({ variant = 'hill', fill = 'currentColor', flip = false, className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 80" preserveAspectRatio="none" className={`block ${flip ? '-scale-x-100' : ''} ${className}`}>
      <path d={WAVES[variant]} fill={fill} />
    </svg>
  )
}

// Deterministic pines: x, height, width.
const PINES = [
  [4, 70, 14], [16, 92, 16], [30, 62, 12], [42, 84, 15], [56, 58, 12], [68, 78, 14], [82, 66, 13], [94, 88, 16],
  [108, 60, 12], [120, 80, 15], [134, 64, 12], [146, 94, 17], [160, 70, 13], [172, 86, 15], [186, 62, 12], [198, 78, 14],
]
/** One pine: three jagged tiers and a short trunk, standing on y = 100. */
function pine(x, h, w) {
  const top = 100 - h
  const [y1, y2, y3] = [top + h * 0.34, top + h * 0.64, top + h * 0.95]
  const [w1, w2, w3] = [w * 0.45, w * 0.72, w]
  const pts = [
    [x, top],
    [x + w1, y1], [x + w1 * 0.35, y1],
    [x + w2, y2], [x + w2 * 0.35, y2],
    [x + w3, y3], [x + 1.5, y3],
    [x + 1.5, 96], [x - 1.5, 96],
    [x - 1.5, y3], [x - w3, y3],
    [x - w2 * 0.35, y2], [x - w2, y2],
    [x - w1 * 0.35, y1], [x - w1, y1],
  ]
  return `M${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join('L')}Z`
}

/** A forest edge in silhouette, as at the bottom of the splash screen. */
export function Pines({ fill = '#0f0d0d', className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax slice" className={`block ${className}`}>
      {PINES.map(([x, h, w]) => (
        <path key={x} d={pine(x, h, w)} fill={fill} />
      ))}
      <rect y="94" width="200" height="6" fill={fill} />
    </svg>
  )
}
