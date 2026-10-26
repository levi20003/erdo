import { memo } from 'react'
import { STREAK_MILESTONES } from '../../lib/config'
import { t } from '../../lib/strings'
import { dayKey, lastNDays, weekdayNarrow } from '../../lib/time'
import Bar from '../ui/Bar'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

const EMBERS = [
  [-5, 0, -3],
  [3, 0.8, 2],
  [0, 1.6, 4],
]

/** Flickering flame with a small leaf at its base; grey and still when there is no streak. */
function StreakFlame({ lit }) {
  return (
    <span
      className={`relative grid size-16 shrink-0 place-items-center rounded-2xl ${
        lit ? 'bg-[radial-gradient(circle_at_50%_70%,rgb(201_171_132/0.25),rgb(42_35_25)_70%)] ring-1 ring-sand/25' : 'bg-zinc-800/80'
      }`}
    >
      <svg viewBox="0 0 40 40" className="size-11" aria-hidden="true">
        <defs>
          <linearGradient id="flame-outer" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#b08f63" />
            <stop offset="1" stopColor="#e6d6bf" />
          </linearGradient>
        </defs>
        <g className={lit ? 'flame-outer' : ''}>
          <path d="M20 4c2 6 10 10 10 19a10 10 0 0 1-20 0c0-4 2-7 4-9 0 4 2 6 4 6 0-6-2-10 2-16Z" fill={lit ? 'url(#flame-outer)' : '#3f3f46'} />
        </g>
        {lit && (
          <g className="flame-inner">
            <path d="M20 17c1 3 5 5 5 9.5a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 0 2 1 3 2 3 0-3-.5-5 .5-7.5Z" fill="#f3ebdf" opacity="0.9" />
          </g>
        )}
        <path d="M20 33c-6 0-9 3-11 5 6 1 10-1 11-5Z" fill={lit ? '#80844d' : '#3f3f46'} />
        <path d="M20 33c5 0 8 2 10 4-5 1-9 0-10-4Z" fill={lit ? '#5f6239' : '#27272a'} />
        {lit &&
          EMBERS.map(([x, delay, dx]) => (
            <circle key={x} className="ember" cx={20 + x} cy="12" r="0.9" fill="#e6d6bf" style={{ '--delay': `${delay}s`, '--dx': `${dx}px` }} />
          ))}
      </svg>
    </span>
  )
}

function StreakTile({ streak, className = '' }) {
  const lit = streak.current > 0
  const next = STREAK_MILESTONES.find((m) => m > streak.current)
  const prev = [...STREAK_MILESTONES].reverse().find((m) => m <= streak.current) ?? 0
  const todayKey = dayKey()

  return (
    <Card
      title={t.streak}
      icon={<Icon name="flame" size={13} />}
      className={`${lit ? 'border-sand/25 hover:border-sand/40' : ''} ${className}`}
    >
      {lit && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-2xl bg-[radial-gradient(ellipse_at_30%_0%,rgb(201_171_132/0.12),transparent_70%)]"
        />
      )}
      <div className="relative flex items-center gap-4">
        <StreakFlame lit={lit} />
        <div className="min-w-0">
          <p className="text-5xl font-semibold leading-none tabular-nums tracking-tight text-zinc-50">{streak.current}</p>
          <p className="mt-1.5 text-xs text-zinc-400">{t.streakCard.unit}</p>
        </div>
      </div>

      <div className="relative mt-5">
        {next ? (
          <>
            <div className="mb-2 flex items-baseline justify-between gap-2 text-[11px]">
              <span className="text-zinc-400">{t.streakCard.nextMilestone(next)}</span>
              <span className="shrink-0 tabular-nums text-sand">{t.streakCard.remaining(next - streak.current)}</span>
            </div>
            <Bar value={streak.current - prev} max={next - prev} color="linear-gradient(90deg,#80844d,#c9ab84)" label={t.streakCard.nextMilestone(next)} />
          </>
        ) : (
          <p className="text-[11px] text-sand">{t.streakCard.allDone}</p>
        )}
      </div>

      <ol className="relative mt-5 flex justify-between" aria-label={t.aria.weekDays}>
        {lastNDays(7).map((d) => {
          const key = dayKey(d)
          const hit = streak.days.has(key)
          return (
            <li key={key} className="flex flex-col items-center gap-1.5">
              <span
                className={`grid size-6 place-items-center rounded-full transition-colors ${
                  hit ? 'bg-sand text-zinc-950 shadow-[0_0_10px_rgb(201_171_132/0.45)]' : 'bg-zinc-800/80 text-transparent'
                } ${key === todayKey && !hit ? 'ring-1 ring-sand/50' : ''}`}
              >
                <Icon name="check" size={11} strokeWidth={3} />
              </span>
              <span className={`text-[10px] uppercase ${key === todayKey ? 'text-sand' : 'text-zinc-600'}`}>
                {weekdayNarrow(d)}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="relative mt-4 text-xs">
        {!lit ? (
          <span className="text-zinc-500">{t.streakCard.start}</span>
        ) : streak.doneToday ? (
          <span className="text-olive-300">✓ {t.streakCard.doneToday} · {t.best}: {streak.longest} {t.days}</span>
        ) : (
          <span className="text-sand">{t.keepStreak}</span>
        )}
      </p>
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(StreakTile)
