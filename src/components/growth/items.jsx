import { darken, lighten } from '../../lib/color'

/*
 * The four Erdő growth items, drawn on a 200×200 canvas with the ground at y=155.
 * Every item is fully drawn; <Part> hides the pieces whose stage hasn't been
 * reached yet and fades/scales them in when it is (see .grow-part in index.css).
 */
export const GROUND_Y = 155
const BARK = '#6e5b42'
const BARK_DARK = '#4f4130'

export function Part({ show, children }) {
  return (
    <g className="grow-part" data-show={show} style={{ transformOrigin: '50% 100%' }}>
      {children}
    </g>
  )
}

/** Wraps the growing body so it scales up smoothly from its base. */
function Grow({ scale, children }) {
  return (
    <g style={{ transform: `scale(${scale})`, transformOrigin: `100px ${GROUND_Y}px`, transition: 'transform 1.2s linear' }}>
      {children}
    </g>
  )
}

/* ---------------- Öreg Tölgy ---------------- */
export function Oak({ p, color }) {
  const dark = darken(color, 0.35)
  const mid = darken(color, 0.15)
  const light = lighten(color, 0.12)
  return (
    <>
      <Part show={p < 0.08}>
        <ellipse cx="100" cy="150" rx="5.5" ry="6.5" fill="#9a7b52" />
        <path d="M94 147.5a6 4.5 0 0 1 12 0Z" fill={BARK_DARK} />
        <path d="M100 143v-3" stroke={BARK_DARK} strokeWidth="1.5" strokeLinecap="round" />
      </Part>
      <Grow scale={0.4 + 0.6 * p}>
        <Part show={p >= 0.6}>
          <path d="M84 155c6-3 10-9 13-16l6 0c3 7 7 13 13 16Z" fill={BARK_DARK} />
        </Part>
        <Part show={p >= 0.08}>
          <path d="M95 155L97 104Q100 96 103 104L105 155Z" fill={BARK} />
        </Part>
        <Part show={p >= 0.45}>
          <path d="M99 124L82 106M101 117L119 101" stroke={BARK} strokeWidth="3.5" strokeLinecap="round" />
        </Part>
        <Part show={p >= 0.08 && p < 0.3}>
          <path d="M100 104c-9 0-14-6-14-12 8 0 14 4 14 12Z" fill={color} />
          <path d="M100 102c0-8 6-13 14-13 0 7-6 13-14 13Z" fill={light} />
        </Part>
        <g className="sway">
          <Part show={p >= 0.45}>
            <circle cx="76" cy="95" r="20" fill={dark} />
            <circle cx="124" cy="95" r="20" fill={dark} />
          </Part>
          <Part show={p >= 0.3}>
            <circle cx="100" cy="80" r="28" fill={mid} />
          </Part>
          <Part show={p >= 0.7}>
            <circle cx="87" cy="63" r="18" fill={color} />
            <circle cx="114" cy="61" r="19" fill={color} />
          </Part>
          <Part show={p >= 0.92}>
            <circle cx="106" cy="58" r="9" fill={light} opacity="0.55" />
            <circle cx="80" cy="88" r="2.4" fill="#c9ab84" />
            <circle cx="117" cy="84" r="2.4" fill="#c9ab84" />
            <circle cx="98" cy="96" r="2.4" fill="#c9ab84" />
          </Part>
        </g>
      </Grow>
    </>
  )
}

/* ---------------- Fenyves ---------------- */
function PineShape({ color, tiers = 4, show = [true, true, true, true] }) {
  const shades = [darken(color, 0.4), darken(color, 0.25), darken(color, 0.1), color]
  const paths = ['M100 96L66 140H134Z', 'M100 80L71 122H129Z', 'M100 64L76 102H124Z', 'M100 46L82 82H118Z']
  return (
    <>
      <path d="M100 155V132" stroke={BARK} strokeWidth="5" strokeLinecap="round" />
      <g className="sway-slow">
        {paths.slice(0, tiers).map((d, i) => (
          <Part key={d} show={show[i]}>
            <path d={d} fill={shades[i]} />
          </Part>
        ))}
      </g>
    </>
  )
}

export function Pine({ p, color }) {
  return (
    <>
      <Part show={p < 0.08}>
        <ellipse cx="100" cy="150" rx="5" ry="7" fill="#8a6a45" />
        <path d="M96 146h8M95.5 150h9M96 154h8" stroke={BARK_DARK} strokeWidth="1.2" />
      </Part>
      <Part show={p >= 0.6}>
        <g transform={`translate(58 ${GROUND_Y}) scale(0.55) translate(-100 -${GROUND_Y})`}>
          <PineShape color={darken(color, 0.15)} />
        </g>
      </Part>
      <Part show={p >= 0.8}>
        <g transform={`translate(144 ${GROUND_Y}) scale(0.65) translate(-100 -${GROUND_Y})`}>
          <PineShape color={darken(color, 0.08)} />
        </g>
      </Part>
      <Grow scale={0.4 + 0.6 * p}>
        <Part show={p >= 0.08}>
          <PineShape color={color} show={[true, p >= 0.3, p >= 0.45, p >= 0.65]} />
        </Part>
        <Part show={p >= 0.92}>
          <ellipse cx="88" cy="126" rx="2.2" ry="3.2" fill="#a8835a" />
          <ellipse cx="114" cy="110" rx="2.2" ry="3.2" fill="#a8835a" />
          <ellipse cx="104" cy="88" rx="2" ry="3" fill="#a8835a" />
        </Part>
      </Grow>
    </>
  )
}

/* ---------------- Mohás Szikla ---------------- */
function Fern({ x, dir, color, length = 34 }) {
  // Quadratic stem with leaflets placed along it.
  const sx = x
  const sy = GROUND_Y
  const cx = x + dir * 4
  const cy = GROUND_Y - length * 0.8
  const ex = x + dir * length * 0.7
  const ey = GROUND_Y - length
  const at = (t) => [(1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t * t * ey]
  const leaflets = Array.from({ length: 7 }, (_, i) => {
    const tt = 0.25 + i * 0.11
    const [lx, ly] = at(tt)
    const size = 6.5 * (1 - tt * 0.6)
    return (
      <g key={i}>
        <ellipse cx={lx - size * 0.7} cy={ly} rx={size} ry={size * 0.32} fill={color} transform={`rotate(${-25 * dir} ${lx} ${ly})`} />
        <ellipse cx={lx + size * 0.7} cy={ly} rx={size} ry={size * 0.32} fill={color} transform={`rotate(${25 * dir} ${lx} ${ly})`} />
      </g>
    )
  })
  return (
    <g className="sway">
      <path d={`M${sx} ${sy}Q${cx} ${cy} ${ex} ${ey}`} stroke={darken(color, 0.25)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {leaflets}
    </g>
  )
}

export function MossRock({ p, color }) {
  const light = lighten(color, 0.15)
  return (
    <Grow scale={0.85 + 0.15 * p}>
      <Part show={p >= 0.6}>
        <Fern x={64} dir={-1} color={darken(color, 0.1)} length={36} />
        <Fern x={138} dir={1} color={darken(color, 0.2)} length={30} />
      </Part>
      <path d="M58 155C55 135 66 112 88 106C104 101 126 104 138 118C147 128 146 146 142 155Z" fill="#3f3f46" />
      <path d="M70 124C80 110 96 106 114 108C100 113 86 118 72 132Z" fill="#52525b" opacity="0.8" />
      <path d="M118 128l8 8M92 138l-6 10" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" />
      <Part show={p >= 0.08}>
        {[
          [80, 132, 2.2],
          [121, 122, 1.8],
          [110, 141, 2.4],
          [92, 119, 1.6],
          [131, 136, 1.5],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}`} cx={cx} cy={cy} r={r} fill="#c9ab84" opacity="0.75" />
        ))}
      </Part>
      <Part show={p >= 0.3}>
        <path d="M68 117C78 104 104 99 124 105C135 109 141 117 139 124C128 116 112 114 100 118C88 121 78 125 68 129Z" fill={color} />
      </Part>
      <Part show={p >= 0.45}>
        <path d="M60 140C62 132 68 127 74 128C72 134 66 140 60 144Z" fill={light} />
        <path d="M134 124C140 128 143 136 142 144C138 140 135 132 134 124Z" fill={darken(color, 0.15)} />
        <path d="M84 112c6-4 14-5 20-3-6 2-13 4-20 3Z" fill={light} />
      </Part>
      <Part show={p >= 0.92}>
        {[
          [88, 108],
          [112, 104],
          [126, 110],
        ].map(([cx, cy]) => (
          <g key={cx}>
            <path d={`M${cx} ${cy + 1}v-6`} stroke={darken(color, 0.3)} strokeWidth="1" />
            <circle cx={cx} cy={cy - 6} r="2.6" fill="#e6d6bf" />
            <circle cx={cx} cy={cy - 6} r="1" fill="#c9ab84" />
          </g>
        ))}
      </Part>
    </Grow>
  )
}

/* ---------------- Erdei Gomba ---------------- */
function Mushroom({ x, scale = 1, cap, children }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y}) scale(${scale}) translate(-100 -${GROUND_Y})`}>
      <path d="M93 155C94 136 95 122 96 112H104C105 122 106 136 107 155Z" fill="#e6d6bf" />
      <path d="M96 128c3 2 5 2 8 0" stroke="#c9ab84" strokeWidth="1" fill="none" />
      <path d="M68 114C70 86 130 86 132 114C120 119 80 119 68 114Z" fill={cap} />
      <path d="M72 114C84 117 116 117 128 114" stroke={darken(cap, 0.35)} strokeWidth="1.2" fill="none" />
      {children}
    </g>
  )
}

export function Fungus({ p, color }) {
  const spores = [
    [92, 140, 0],
    [104, 132, 1.2],
    [110, 144, 2.4],
    [97, 126, 3.1],
    [86, 134, 4],
  ]
  return (
    <>
      <Part show={p < 0.08}>
        {spores.map(([cx, cy, d]) => (
          <circle key={cx + cy} className="spore" cx={cx} cy={cy} r="1.6" fill="#e6d6bf" style={{ '--delay': `${d}s` }} />
        ))}
      </Part>
      <Part show={p >= 0.08}>
        <path
          d="M100 156C88 157 78 154 66 157M100 156C112 158 124 154 136 157M84 156c-4 2-9 2-14 4M118 156c5 2 9 3 13 5"
          stroke="#d9c09f"
          strokeWidth="0.9"
          opacity="0.5"
          fill="none"
          strokeLinecap="round"
        />
      </Part>
      <Part show={p >= 0.65}>
        <Mushroom x={70} scale={0.42} cap={darken(color, 0.15)} />
      </Part>
      <Part show={p >= 0.8}>
        <Mushroom x={134} scale={0.55} cap={darken(color, 0.05)}>
          <circle cx="92" cy="102" r="3" fill="#f3ebdf" opacity="0.85" />
          <circle cx="110" cy="99" r="3.5" fill="#f3ebdf" opacity="0.85" />
        </Mushroom>
      </Part>
      <Grow scale={0.45 + 0.55 * p}>
        <Part show={p >= 0.3}>
          <Mushroom x={100} cap={color}>
            <Part show={p >= 0.6}>
              <circle cx="86" cy="104" r="4" fill="#f3ebdf" opacity="0.9" />
              <circle cx="104" cy="96" r="5" fill="#f3ebdf" opacity="0.9" />
              <circle cx="120" cy="106" r="3.5" fill="#f3ebdf" opacity="0.9" />
              <circle cx="96" cy="110" r="2.5" fill="#f3ebdf" opacity="0.9" />
            </Part>
          </Mushroom>
        </Part>
      </Grow>
      <Part show={p >= 0.92}>
        <ellipse cx="80" cy="154" rx="6" ry="2.2" fill="#a8835a" transform="rotate(-18 80 154)" />
        <ellipse cx="122" cy="155" rx="5" ry="2" fill="#7d8247" transform="rotate(14 122 155)" />
        <ellipse cx="112" cy="153" rx="4" ry="1.6" fill="#b08f63" transform="rotate(-8 112 153)" />
      </Part>
    </>
  )
}

export const ITEM_RENDERERS = { tolgy: Oak, fenyves: Pine, szikla: MossRock, gomba: Fungus }
