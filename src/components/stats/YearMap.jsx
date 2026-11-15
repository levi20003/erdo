import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react'
import { useToday } from '../../hooks/useToday'
import { getLocale, t } from '../../lib/strings'
import { dayKey, formatMinutes, parseDayKey } from '../../lib/time'
import { dayTotals, intensity, weeksOf, yearSummary } from '../../lib/yearmap'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

// Empty → pale green → deep green → accent (maroon by day, lime by night): more focus, stronger tile.
const SHADES = ['bg-zinc-800', 'bg-olive-300/35', 'bg-olive-300/60', 'bg-olive-300', 'bg-sand shadow-[0_0_6px_rgb(var(--sand)/0.6)]']

/** The whole year as a heat map, one column per week; tap a day to see what you did. */
function YearMap({ className = '' }) {
  const { sessions } = useAppStore().state
  const todayKey = useToday()
  const thisYear = parseDayKey(todayKey).getFullYear()
  const firstYear = useMemo(() => (sessions.length ? new Date(Math.min(...sessions.map((s) => s.end))).getFullYear() : thisYear), [sessions, thisYear])
  const [year, setYear] = useState(thisYear)
  const [picked, setPicked] = useState(todayKey)
  const totals = useMemo(() => dayTotals(sessions), [sessions])
  const summary = useMemo(() => yearSummary(totals, year), [totals, year])
  const weeks = useMemo(() => weeksOf(year), [year])
  const scroller = useRef(null)
  const locale = getLocale()
  const day = totals.get(picked)

  // On a phone the map is wider than the card: start at today (or the year's end), not in January.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const target = el.querySelector('[data-today]') ?? el.lastElementChild?.lastElementChild
    if (target) el.scrollLeft = target.offsetLeft - el.clientWidth * 0.65
  }, [year])

  return (
    <Card
      title={t.yearMap.title}
      icon={<Icon name="calendar" size={14} />}
      className={className}
      action={
        <div className="-mr-2 flex items-center">
          <button type="button" aria-label={t.yearMap.prev} disabled={year <= firstYear} onClick={() => setYear((y) => y - 1)} className="icon-btn size-9">
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="num min-w-12 text-center text-sm font-bold text-zinc-200" aria-live="polite">
            {year}
          </span>
          <button type="button" aria-label={t.yearMap.next} disabled={year >= thisYear} onClick={() => setYear((y) => y + 1)} className="icon-btn size-9">
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="num font-display text-3xl font-bold text-zinc-50">{formatMinutes(summary.minutes)}</p>
        <p className="text-xs text-zinc-500">
          {t.yearMap.activeDays(summary.activeDays)} · {t.yearMap.longestRun(summary.longestRun)}
        </p>
      </div>

      <div ref={scroller} className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <div key={year} className="grid w-full min-w-max animate-fade-in grid-flow-col auto-cols-[minmax(0.875rem,1fr)] gap-[3px]" style={{ gridTemplateRows: 'auto repeat(7, auto)' }}>
          {weeks.map((week, wi) => {
            // A month's name sits over the week that holds its 1st.
            const first = week.find((d) => d && d.getDate() === 1)
            return (
              <Fragment key={wi}>
                <span className="h-4 w-0 whitespace-nowrap text-[10px] font-semibold capitalize leading-4 text-zinc-500" aria-hidden="true">
                  {first ? first.toLocaleDateString(locale, { month: 'short' }).replace('.', '') : ''}
                </span>
                {week.map((date, di) => {
                  if (!date) return <span key={di} aria-hidden="true" />
                  const key = dayKey(date)
                  const d = totals.get(key)
                  const selected = key === picked
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={key > todayKey}
                      data-today={key === todayKey ? '' : undefined}
                      onClick={() => setPicked(key)}
                      aria-label={`${date.toLocaleDateString(locale, { month: 'long', day: 'numeric' })}: ${t.yearMap.day(d?.count ?? 0, formatMinutes(d?.min ?? 0))}`}
                      aria-pressed={selected}
                      className={`aspect-square w-full rounded-[3px] transition duration-150 hover:scale-125 disabled:opacity-35 ${SHADES[intensity(d?.min)]} ${
                        selected ? 'ring-2 ring-zinc-50 ring-offset-1 ring-offset-zinc-900' : key === todayKey ? 'ring-1 ring-sand' : ''
                      }`}
                    />
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p key={picked} className="animate-fade-in text-sm text-zinc-400" aria-live="polite">
          <span className="font-bold text-zinc-100">{parseDayKey(picked).toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' })}</span>
          <span> · </span>
          {t.yearMap.day(day?.count ?? 0, formatMinutes(day?.min ?? 0))}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500" aria-hidden="true">
          {t.yearMap.less}
          {SHADES.map((s, i) => (
            <span key={i} className={`size-2.5 rounded-[3px] ${s}`} />
          ))}
          {t.yearMap.more}
        </div>
      </div>
    </Card>
  )
}

export default memo(YearMap)
