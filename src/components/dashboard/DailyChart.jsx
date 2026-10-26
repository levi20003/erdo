import { memo, useMemo } from 'react'
import { useToday } from '../../hooks/useToday'
import { minutesByCategory } from '../../lib/stats'
import { t } from '../../lib/strings'
import { dayKey, formatMinutes, startOfDay } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import CategoryBars, { DELETED } from './CategoryBars'

const DAY_MS = 864e5

/** Today: total, a 24-hour timeline of every session, and per-category bars. */
function DailyChart({ className }) {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()

  const currentDay = useToday()
  const { today, byCategory, total } = useMemo(() => {
    const key = currentDay
    const today = sessions.filter((s) => dayKey(s.end) === key)
    const byCategory = minutesByCategory(sessions, new Set([key]))
    return { today, byCategory, total: Object.values(byCategory).reduce((a, b) => a + b, 0) }
  }, [sessions, currentDay])

  const midnight = startOfDay().getTime()

  return (
    <Card title={t.today} icon={<Icon name="sun" size={13} />} className={className}>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-100">{formatMinutes(total)}</p>
        <p className="text-xs text-zinc-500">
          {t.sessionCount(today.filter((s) => s.status === 'completed').length)}
        </p>
      </div>

      <div className="mb-5">
        <div className="relative h-9 overflow-hidden rounded-xl bg-zinc-950/70 ring-1 ring-inset ring-zinc-800/60" aria-label={t.aria.timeline}>
          {today.map((s) => {
            const left = ((Math.max(s.start, midnight) - midnight) / DAY_MS) * 100
            const width = Math.max(0.6, ((s.end - Math.max(s.start, midnight)) / DAY_MS) * 100)
            const cat = categories[s.categoryId] ?? DELETED
            const failed = s.status === 'failed'
            return (
              <span
                key={s.id}
                title={`${cat.name} · ${formatMinutes(s.durationSec / 60)}${failed ? ` · ${t.exportFile.status.failed}` : ''}`}
                className="absolute inset-y-2 animate-fade-in rounded-[3px] transition-opacity hover:opacity-80"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: failed ? 'repeating-linear-gradient(45deg,#3f3f46 0 2px,transparent 2px 4px)' : cat.color,
                }}
              />
            )
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-zinc-600">
          {[0, 6, 12, 18, 24].map((h) => (
            <span key={h}>{h}:00</span>
          ))}
        </div>
      </div>

      <CategoryBars minutes={byCategory} />
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(DailyChart)
