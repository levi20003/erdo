import { t } from '../../lib/strings'
import { dayKey, lastNDays } from '../../lib/time'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

export default function StreakTile({ streak }) {
  return (
    <Card title={t.streak} icon={<Icon name="calendar" size={13} />}>
      <div className="flex items-center gap-3">
        <span className={`grid size-12 place-items-center rounded-2xl ${streak.current ? 'bg-sand-900 text-sand ring-1 ring-sand/20' : 'bg-zinc-800 text-zinc-600'}`}>
          <Icon name="flame" size={24} />
        </span>
        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-100">
            {streak.current} <span className="text-base font-normal text-zinc-500">{t.days}</span>
          </p>
          <p className="text-xs text-zinc-500">
            {t.best}: {streak.longest} {t.days}
          </p>
        </div>
      </div>
      <ol className="mt-5 flex justify-between" aria-label="Fókusz napok a héten">
        {lastNDays(7).map((d) => (
          <li key={dayKey(d)} className="flex flex-col items-center gap-1.5">
            <span className={`size-2.5 rounded-full transition-colors ${streak.days.has(dayKey(d)) ? 'bg-sand shadow-[0_0_8px_rgb(201_171_132/0.5)]' : 'bg-zinc-800'}`} />
            <span className="text-[10px] uppercase text-zinc-600">{d.toLocaleDateString('hu-HU', { weekday: 'narrow' })}</span>
          </li>
        ))}
      </ol>
      {!streak.doneToday && streak.current > 0 && <p className="mt-4 text-xs text-sand">{t.keepStreak}</p>}
    </Card>
  )
}
