import { memo, useMemo } from 'react'
import { growthItem } from '../../lib/growth'
import { completed, computeStreak } from '../../lib/stats'
import { t } from '../../lib/strings'
import { dayKey, formatMinutes } from '../../lib/time'
import { nextUnlock } from '../../lib/unlocks'
import { useAppStore } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'

const tile =
  'flex min-h-20 min-w-0 flex-col items-start justify-between gap-1 rounded-2xl border border-zinc-800/70 bg-zinc-900 p-3 text-left transition hover:border-zinc-700 active:scale-[0.98]'

/** Three glanceable numbers under the timer; each opens the screen with the details. */
function TodayStrip({ today, onOpen, className = '' }) {
  const { sessions } = useAppStore().state
  const { minutes, plants, streak, next } = useMemo(() => {
    const done = completed(sessions)
    const todays = done.filter((s) => dayKey(s.end) === today)
    return {
      minutes: todays.reduce((m, s) => m + s.durationSec / 60, 0),
      plants: todays.length,
      streak: computeStreak(sessions).current,
      next: nextUnlock(done.length),
    }
  }, [sessions, today])

  return (
    <div className={`grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 ${className}`}>
      <button type="button" onClick={() => onOpen('stats')} className={tile}>
        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">{t.home.today}</span>
        <span className="text-lg font-semibold tabular-nums leading-tight text-zinc-50">{formatMinutes(minutes)}</span>
        <span className="w-full truncate text-xs text-zinc-400">{t.home.plantsToday(plants)}</span>
      </button>
      <button type="button" onClick={() => onOpen('stats')} className={tile}>
        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">{t.home.streak}</span>
        <span className="flex items-center gap-1 text-lg font-semibold tabular-nums leading-tight text-zinc-50">
          <Icon name="flame" size={16} className={streak ? 'text-sand' : 'text-zinc-600'} />
          {streak}
        </span>
        <span className="w-full truncate text-xs text-zinc-400">{t.home.streakValue(streak)}</span>
      </button>
      <button type="button" onClick={() => onOpen('forest')} className={tile}>
        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">{t.home.next}</span>
        {next ? (
          <>
            <span className="flex w-full min-w-0 items-center gap-1">
              <span className="hidden size-6 shrink-0 place-items-center overflow-hidden rounded-md bg-zinc-950 opacity-80 min-[440px]:grid">
                <ForestScene item={next.id} color="#7d8247" progress={1} backdrop={false} className="size-full" />
              </span>
              <span className="min-w-0 truncate text-[13px] font-medium text-zinc-100 sm:text-sm">{growthItem(next.id).name}</span>
            </span>
            <span className="w-full truncate text-xs text-sand">{t.home.nextValue(next.remaining)}</span>
          </>
        ) : (
          <span className="text-sm text-zinc-200">{t.home.allUnlocked}</span>
        )}
      </button>
    </div>
  )
}

export default memo(TodayStrip)
