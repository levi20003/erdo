import { t } from '../../lib/strings'
import Icon from '../ui/Icon'

const BREATH_PHASE_SEC = 4 // box breathing: 4-4-4-4
const STRETCH_SEC = 60
const R = 45
const C = 2 * Math.PI * R
const GAP = 4
const SEG = C / 4 - GAP

/** Box breathing: an orb that expands/contracts, with four quarter arcs tracking the phases. */
export function BreathingGuide({ elapsedSec }) {
  const inCycle = elapsedSec % (BREATH_PHASE_SEC * 4)
  const phase = Math.floor(inCycle / BREATH_PHASE_SEC)
  const within = inCycle % BREATH_PHASE_SEC
  const expanded = phase === 0 || phase === 1
  const { label, hint } = t.breathing[phase]

  return (
    <div className="relative flex size-full items-center justify-center rounded-full bg-zinc-950">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => {
          const offset = -(i * (C / 4)) - GAP / 2
          const filled = i < phase ? SEG : i === phase ? (SEG * (within + 1)) / BREATH_PHASE_SEC : 0
          return (
            <g key={i}>
              <circle cx="50" cy="50" r={R} fill="none" stroke="#27272a" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${SEG} ${C}`} strokeDashoffset={offset} />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="#c9ab84"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${C}`}
                strokeDashoffset={offset}
                opacity={filled ? 1 : 0}
                // Only the active quarter animates; finished and upcoming ones are static (no per-frame work).
                style={i === phase ? { transition: 'stroke-dasharray 1s linear, opacity 0.3s' } : undefined}
              />
            </g>
          )
        })}
      </svg>
      <div
        aria-hidden="true"
        className="absolute size-[62%] rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(201_171_132/0.28),rgb(95_98_57/0.35)_60%,rgb(95_98_57/0.15))] ring-1 ring-sand/20"
        style={{ transform: `scale(${expanded ? 1 : 0.6})`, transition: `transform ${BREATH_PHASE_SEC}s cubic-bezier(.45,0,.55,1)` }}
      />
      <div className="relative flex flex-col items-center text-center" aria-live="polite">
        <p key={phase} className="animate-fade-up text-sm font-medium text-sand-200">
          {label}
        </p>
        <p className="font-mono text-3xl font-light tabular-nums text-sand-100">{BREATH_PHASE_SEC - within}</p>
        <p key={`h${phase}`} className="mt-0.5 max-w-[9rem] animate-fade-up text-[11px] leading-snug text-zinc-400">
          {hint}
        </p>
      </div>
    </div>
  )
}

/** Five one-minute stretches with an illustration, a per-stretch progress bar and step pips. */
export function StretchGuide({ elapsedSec }) {
  const index = Math.min(t.stretches.length - 1, Math.floor(elapsedSec / STRETCH_SEC))
  const within = Math.min(STRETCH_SEC, elapsedSec - index * STRETCH_SEC)
  const stretch = t.stretches[index]

  return (
    <div className="flex size-full items-center justify-center rounded-full bg-zinc-950">
      <div key={index} className="flex w-[78%] animate-fade-up flex-col items-center gap-2 text-center" aria-live="polite">
        <span className="grid size-12 place-items-center rounded-2xl bg-zinc-900 text-sand ring-1 ring-zinc-800">
          <Icon name={stretch.icon} size={26} strokeWidth={1.5} />
        </span>
        <p className="text-[11px] tabular-nums text-zinc-500">
          {index + 1} / {t.stretches.length}
        </p>
        <p className="text-sm font-medium leading-tight text-sand-200">{stretch.name}</p>
        <p className="text-[11px] leading-snug text-zinc-400">{stretch.hint}</p>
        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-sand transition-[width] duration-1000 ease-linear" style={{ width: `${(within / STRETCH_SEC) * 100}%` }} />
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {t.stretches.map((s, i) => (
            <span key={s.name} className={`size-1 rounded-full transition-colors ${i < index ? 'bg-sand/60' : i === index ? 'bg-sand' : 'bg-zinc-700'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

const MODES = [
  { key: 'breathing', icon: 'wind' },
  { key: 'stretch', icon: 'stretch' },
]

/** Segmented control with a sliding indicator. */
export function BreakGuideToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label={t.aria.breakType} className="relative grid grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-zinc-800 transition-transform duration-300 ease-out ${value === 'stretch' ? 'translate-x-full' : ''}`}
      />
      {MODES.map(({ key, icon }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={`relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
            value === key ? 'text-sand-200' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Icon name={icon} size={14} /> {t.breakGuide[key]}
        </button>
      ))}
    </div>
  )
}
