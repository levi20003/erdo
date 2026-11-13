import { memo, useMemo, useState } from 'react'
import { useToday } from '../../hooks/useToday'
import { getLocale, t } from '../../lib/strings'
import { dayKey, formatMinutes, parseDayKey } from '../../lib/time'
import { dayTotals, intensity, monthsOf, yearSummary } from '../../lib/yearmap'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

// Empty → light olive → deep olive → gold: more focus, warmer tile.
const SHADES = [
  'bg-zinc-800/70',
  'bg-[#80844d]/40',
  'bg-[#80844d]/75',
  'bg-[#a3a05f]',
  'bg-[#c9ab84] shadow-[0_0_6px_rgb(201_171_132/0.6)]',
]

/** The whole year as twelve small calendars; tap a day to see what you did. */
function YearMap({ className = '' }) {
  const { sessions } = useAppStore().state
  const todayKey = useToday()
  const thisYear = parseDayKey(todayKey).getFullYear()
  const firstYear = useMemo(() => (sessions.length ? new Date(Math.min(...sessions.map((s) => s.end))).getFullYear() : thisYear), [sessions, thisYear])
  const [year, setYear] = useState(thisYear)
  const [picked, setPicked] = useState(todayKey)
  const totals = useMemo(() => dayTotals(sessions), [sessions])
  const summary = useMemo(() => yearSummary(totals, year), [totals, year])
  const months = useMemo(() => monthsOf(year), [year])
  const locale = getLocale()
  const day = totals.get(picked)
  const nav = 'press grid size-9 place-items-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-25'

  return (
    <Card
      title={t.yearMap.title}
      icon={<Icon name="calendar" size={13} />}
      className={className}
      action={
        <div className="-mr-1 flex items-center gap-1">
          <button type="button" aria-label={t.yearMap.prev} disabled={year <= firstYear} onClick={() => setYear((y) => y - 1)} className={nav}>
            <Icon name="chevronLeft" size={16} />
          </button>
          <span className="num min-w-12 text-center text-sm font-semibold text-zinc-200" aria-live="polite">
            {year}
          </span>
          <button type="button" aria-label={t.yearMap.next} disabled={year >= thisYear} onClick={() => setYear((y) => y + 1)} className={nav}>
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="num font-display text-3xl font-semibold text-zinc-50">{formatMinutes(summary.minutes)}</p>
        <p className="text-xs text-zinc-500">
          {t.yearMap.activeDays(summary.activeDays)} · {t.yearMap.longestRun(summary.longestRun)}
        </p>
      </div>

      <div key={year} className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 xl:grid-cols-6">
        {months.map((m, mi) => (
          <div key={m.month} className="min-w-0 animate-fade-up" style={{ animationDelay: `${mi * 35}ms` }}>
            <p className="mb-1.5 text-[11px] font-medium capitalize text-zinc-400">{m.first.toLocaleDateString(locale, { month: 'short' }).replace('.', '')}</p>
            <div className="grid grid-cols-7 gap-[3px]">
              {Array.from({ length: m.offset }, (_, i) => (
                <span key={`e${i}`} aria-hidden="true" />
              ))}
              {Array.from({ length: m.length }, (_, i) => {
                const date = new Date(year, m.month, i + 1)
                const key = dayKey(date)
                const d = totals.get(key)
                const future = key > todayKey
                const selected = key === picked
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={future}
                    onClick={() => setPicked(key)}
                    aria-label={`${date.toLocaleDateString(locale, { month: 'long', day: 'numeric' })}: ${t.yearMap.day(d?.count ?? 0, formatMinutes(d?.min ?? 0))}`}
                    aria-pressed={selected}
                    className={`aspect-square w-full rounded-[3px] transition duration-200 hover:scale-125 disabled:opacity-30 ${SHADES[intensity(d?.min)]} ${
                      selected ? 'ring-2 ring-zinc-50 ring-offset-1 ring-offset-zinc-900' : key === todayKey ? 'ring-1 ring-sand' : ''
                    }`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        <p key={picked} className="animate-fade-in text-sm text-zinc-300" aria-live="polite">
          <span className="font-medium text-zinc-100">{parseDayKey(picked).toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' })}</span>
          <span className="text-zinc-500"> · </span>
          {t.yearMap.day(day?.count ?? 0, formatMinutes(day?.min ?? 0))}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500" aria-hidden="true">
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
