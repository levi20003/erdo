import { STAGE_AT } from '../../lib/growth'
import { t } from '../../lib/strings'
import Icon from '../ui/Icon'

/**
 * Five-step growth path (Makk → … → Öreg Tölgy). Finished steps are filled
 * with a check, the current one pops and pulses when reached, and the
 * connector to the next step fills live as the stage progresses.
 */
export default function StageStepper({ item, stage, progress, active, color, durationSec, compact = false }) {
  const last = item.stages.length - 1
  const next = stage + 1
  const stageFraction = active && next <= last ? (progress - STAGE_AT[stage]) / (STAGE_AT[next] - STAGE_AT[stage]) : 0
  const minutesToNext = active && next <= last ? Math.max(1, Math.ceil(((STAGE_AT[next] - progress) * durationSec) / 60)) : null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* The dots only mean something while a block runs; idle shows the name and the path. */}
      {active && <ol className="flex items-center" aria-label={active ? t.aria.stage(stage + 1, last + 1, item.stages[stage]) : item.name}>
        {item.stages.map((name, i) => {
          const done = active && i < stage
          const current = active && i === stage
          return (
            <li key={name} className="flex items-center">
              {i > 0 && (
                <span className="relative h-1 w-4 overflow-hidden rounded-full bg-zinc-800 min-[380px]:w-6 sm:w-7" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${active && i <= stage ? 100 : active && i === next ? stageFraction * 100 : 0}%`, background: color }}
                  />
                </span>
              )}
              <span
                key={current ? `current-${name}` : name}
                title={name}
                className={`grid shrink-0 place-items-center rounded-full transition-colors duration-500 ${compact ? 'size-5' : 'size-6'} ${
                  current ? 'node-pop node-pulse bg-zinc-900 ring-2' : done ? '' : 'border border-zinc-700 bg-zinc-900'
                }`}
                style={{
                  background: done ? color : undefined,
                  '--tw-ring-color': current ? color : undefined,
                  '--pulse': current ? `${color}99` : undefined,
                }}
              >
                {done ? (
                  <Icon name="check" size={compact ? 11 : 12} strokeWidth={3} className="text-cream" />
                ) : current ? (
                  <span className="size-2 rounded-full" style={{ background: color }} />
                ) : (
                  <span className="size-1 rounded-full bg-zinc-600" />
                )}
              </span>
            </li>
          )
        })}
      </ol>}

      <div className="flex flex-col items-center">
        <p key={active ? stage : 'idle'} className={`font-display text-lg font-medium leading-snug text-zinc-50 ${active ? 'stage-in' : ''}`}>
          {active ? item.stages[stage] : item.name}
        </p>
        {/* Idle: the name is enough (keeps Start above the fold); live: what grows next and when. */}
        {!compact && active && <p className="text-xs text-zinc-500">{minutesToNext ? t.nextStage(item.stages[next], minutesToNext) : t.fullyGrown}</p>}
      </div>
    </div>
  )
}
