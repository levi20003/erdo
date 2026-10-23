import { FOCUS_SEC } from '../../lib/config'
import { STAGE_AT } from '../../lib/growth'
import { t } from '../../lib/strings'
import Icon from '../ui/Icon'

/**
 * Five-step growth path (Makk → … → Öreg Tölgy). Finished steps are filled
 * with a check, the current one pops and pulses when reached, and the
 * connector to the next step fills live as the stage progresses.
 */
export default function StageStepper({ item, stage, progress, active, color, compact = false }) {
  const last = item.stages.length - 1
  const next = stage + 1
  const stageFraction = active && next <= last ? (progress - STAGE_AT[stage]) / (STAGE_AT[next] - STAGE_AT[stage]) : 0
  const minutesToNext = active && next <= last ? Math.max(1, Math.ceil(((STAGE_AT[next] - progress) * FOCUS_SEC) / 60)) : null

  return (
    <div className="flex flex-col items-center gap-2">
      <ol className="flex items-center" aria-label={active ? `${stage + 1}. ${t.stage} / ${last + 1}: ${item.stages[stage]}` : item.name}>
        {item.stages.map((name, i) => {
          const done = active && i < stage
          const current = active && i === stage
          return (
            <li key={name} className="flex items-center">
              {i > 0 && (
                <span className="relative h-0.5 w-4 overflow-hidden rounded-full bg-zinc-800 min-[380px]:w-6 sm:w-7" aria-hidden="true">
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
                  <Icon name="check" size={compact ? 11 : 12} strokeWidth={3} className="text-zinc-950" />
                ) : current ? (
                  <span className="size-2 rounded-full" style={{ background: color }} />
                ) : (
                  <span className="size-1 rounded-full bg-zinc-600" />
                )}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex min-h-[2.25rem] flex-col items-center">
        <p key={active ? stage : 'idle'} className={`text-sm font-medium text-zinc-100 ${active ? 'stage-in' : ''}`}>
          {active ? item.stages[stage] : item.name}
        </p>
        {!compact && (
          <p className="text-[11px] text-zinc-500">
            {!active
              ? t.stagePath(item.stages[0], item.stages[last])
              : minutesToNext
                ? t.nextStage(item.stages[next], minutesToNext)
                : t.fullyGrown}
          </p>
        )}
      </div>
    </div>
  )
}
