import { memo, useMemo, useState } from 'react'
import { useToday } from '../../hooks/useToday'
import { dailySeries, minutesByCategory } from '../../lib/stats'
import { t } from '../../lib/strings'
import { addDays, dayKey, formatMinutes, lastNDays, shortDate, weekdayShort } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import CategoryBars, { DELETED } from './CategoryBars'

const MAX_WEEKS_BACK = 52

/** Rolling 7-day window; ‹ › steps back through history with a directional slide. */
function WeeklyChart({ className }) {
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
    // todayKey isn't read inside, but it must recompute the window at midnight.
  }, [sessions, offset, todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (delta) => {
    setDirection(delta > 0 ? 'right' : 'left')
    setOffset((o) => Math.min(oldestOffset, Math.max(0, o + delta)))
  }

  // Scale to at least two pomodoros so a single session doesn't fill the column.
  const max = Math.max(50, ...series.map((d) => d.total))
  const rangeLabel = offset === 0 ? t.last7 : `${shortDate(days[0])} – ${shortDate(days[6])}`
  const navButton = 'icon-btn size-9'

  return (
    <Card
      title={t.week}
      icon={<Icon name="chart" size={14} />}
      className={className}
      action={
        <div className="-mr-2 flex items-center">
          <button type="button" aria-label={t.prevWeek} disabled={offset >= oldestOffset} onClick={() => go(1)} className={navButton}>
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="num min-w-[5.5rem] whitespace-nowrap text-center text-xs font-bold text-zinc-300" aria-live="polite">
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
          <p className="num font-display text-3xl font-semibold text-zinc-50">{formatMinutes(total)}</p>
          <p className="text-xs text-zinc-500">
            {formatMinutes(total / 7)} {t.perDay}
          </p>
        </div>

        <ol className="mb-6 flex h-40 items-end gap-1.5 sm:gap-2.5" aria-label={t.aria.perDay}>
          {series.map((day, i) => {
            const isToday = day.key === todayKey
            return (
              <li key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
                {/* The value sits above its column, never on top of the bar. */}
                <span className={`num h-3.5 text-[10px] font-bold leading-none ${day.total ? (isToday ? 'text-sand' : 'text-zinc-400') : 'text-transparent'}`}>{Math.round(day.total)}</span>
                <div className={`relative flex w-full flex-1 flex-col-reverse overflow-hidden rounded-xl ${isToday ? 'bg-zinc-800 ring-1 ring-inset ring-sand/40' : 'bg-zinc-800/60'}`}>
                  <div className="flex w-full origin-bottom animate-bar flex-col-reverse overflow-hidden rounded-xl" style={{ height: `${(day.total / max) * 100}%`, animationDelay: `${i * 50}ms` }}>
                    {Object.entries(day.byCategory).map(([id, min]) => (
                      <div key={id} className="w-full border-t border-zinc-900/60 first:border-t-0" style={{ height: `${(min / day.total) * 100}%`, background: (categories[id] ?? DELETED).color }} />
                    ))}
                  </div>
                </div>
                <span className={`text-[11px] capitalize ${isToday ? 'font-bold text-sand' : 'font-semibold text-zinc-500'}`}>{weekdayShort(day.date)}</span>
              </li>
            )
          })}
        </ol>

        {total ? <CategoryBars minutes={byCategory} /> : <p className="text-sm text-zinc-500">{t.noDataWeek}</p>}
      </div>
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(WeeklyChart)
