import { useMemo, useState } from 'react'
import { useToday } from '../../hooks/useToday'
import { dailySeries, minutesByCategory } from '../../lib/stats'
import { t } from '../../lib/strings'
import { addDays, dayKey, formatMinutes, lastNDays, weekdayShort } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import CategoryBars, { DELETED } from './CategoryBars'

const MAX_WEEKS_BACK = 52
const shortDate = (d) => d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })

/** Rolling 7-day window; ‹ › steps back through history with a directional slide. */
export default function WeeklyChart({ className }) {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()
  const [offset, setOffset] = useState(0)
  const todayKey = useToday()
  const [direction, setDirection] = useState('left')

  const oldestOffset = useMemo(() => {
    if (!sessions.length) return 0
    const first = Math.min(...sessions.map((s) => s.end))
    return Math.min(MAX_WEEKS_BACK, Math.floor((Date.now() - first) / (7 * 864e5)))
  }, [sessions])

  const { days, series, byCategory, total } = useMemo(() => {
    const days = lastNDays(7, addDays(new Date(), -7 * offset))
    const series = dailySeries(sessions, days)
    return {
      days,
      series,
      byCategory: minutesByCategory(sessions, new Set(days.map(dayKey))),
      total: series.reduce((sum, d) => sum + d.total, 0),
    }
  }, [sessions, offset, todayKey])

  const go = (delta) => {
    setDirection(delta > 0 ? 'right' : 'left')
    setOffset((o) => Math.min(oldestOffset, Math.max(0, o + delta)))
  }

  // Scale to at least two pomodoros so a single session doesn't fill the column.
  const max = Math.max(50, ...series.map((d) => d.total))
  const rangeLabel = offset === 0 ? t.last7 : `${shortDate(days[0])} – ${shortDate(days[6])}`
  const navButton = 'grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-25'

  return (
    <Card
      title={t.week}
      icon={<Icon name="chart" size={13} />}
      className={className}
      action={
        <div className="-mr-1.5 ml-auto flex items-center gap-0.5">
          <button type="button" aria-label={t.prevWeek} disabled={offset >= oldestOffset} onClick={() => go(1)} className={navButton}>
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="min-w-[5.5rem] whitespace-nowrap text-center text-xs tabular-nums text-zinc-400" aria-live="polite">
            {rangeLabel}
          </span>
          <button type="button" aria-label={t.nextWeek} disabled={offset === 0} onClick={() => go(-1)} className={navButton}>
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      }
    >
      <div key={offset} className={direction === 'right' ? 'animate-slide-from-left' : 'animate-slide-from-right'}>
        <div className="mb-5 flex items-baseline gap-3">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-100">{formatMinutes(total)}</p>
          <p className="text-xs text-zinc-500">
            {formatMinutes(total / 7)} {t.perDay}
          </p>
        </div>

        <ol className="mb-6 flex h-36 items-end gap-1.5 sm:gap-2" aria-label="Fókuszidő naponta">
          {series.map((day) => {
            const isToday = day.key === todayKey
            return (
              <li key={day.key} className="group flex h-full min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 flex-col-reverse overflow-hidden rounded-lg bg-zinc-800/40 transition-colors group-hover:bg-zinc-800/70">
                  {Object.entries(day.byCategory).map(([id, min]) => (
                    <div
                      key={id}
                      className="w-full border-t border-zinc-900 first:border-t-0"
                      style={{ height: `${(min / max) * 100}%`, background: (categories[id] ?? DELETED).color }}
                    />
                  ))}
                  <span className="pointer-events-none absolute inset-x-0 top-1 text-center text-[10px] tabular-nums text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100">
                    {day.total ? Math.round(day.total) : ''}
                  </span>
                </div>
                <span className={`text-[11px] ${isToday ? 'font-medium text-sand' : 'text-zinc-500'}`}>{weekdayShort(day.date)}</span>
              </li>
            )
          })}
        </ol>

        {total ? <CategoryBars minutes={byCategory} /> : <p className="text-sm text-zinc-500">{t.noDataWeek}</p>}
      </div>
    </Card>
  )
}
