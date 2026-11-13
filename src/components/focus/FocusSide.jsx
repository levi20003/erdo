import { memo } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { growthItem } from '../../lib/growth'
import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { unlockProgress } from '../../lib/unlocks'
import ChallengeTeaser from '../challenge/ChallengeTeaser'
import ForestScene from '../growth/ForestScene'
import { useCountUp } from '../../hooks/useCountUp'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'

const tile =
  'press group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900 p-4 text-left shadow-card transition-shadow hover:shadow-lift'

/** Level, the next plant to unlock, and challenges — the "keep going" column next to the timer. */
function FocusSide({ onOpen, onChallenge, className = '' }) {
  const { level, title, next, completedCount, todayMin } = useProgress()
  const xp = Math.round(useCountUp(level.xp - level.floor, { duration: 1100 }))
  const span = level.next - level.floor
  const nextItem = next && growthItem(next.id)
  const nextProgress = unlockProgress(completedCount, next)

  return (
    <div className={`grid grid-cols-2 gap-3 lg:grid-cols-1 ${className}`}>
      <button type="button" onClick={() => onOpen('stats')} className={`${tile} animate-fade-up`}>
        <div className="flex items-center gap-3">
          <Ring value={level.progress} size={48} stroke={5}>
            <span className="num font-display text-lg font-semibold text-zinc-50">{level.level}</span>
          </Ring>
          <div className="min-w-0">
            <p className="eyebrow">{t.level.label(level.level)}</p>
            <p className="truncate font-display text-base font-medium text-zinc-50">{title}</p>
          </div>
        </div>
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#80844d,#c9ab84)] transition-[width] duration-1000 ease-out" style={{ width: `${level.progress * 100}%` }} />
          </div>
          <p className="num mt-1.5 text-xs text-zinc-500">
            {t.level.xp(xp, span)} · {t.today.toLowerCase()} {formatMinutes(todayMin)}
          </p>
        </div>
      </button>

      <button type="button" onClick={() => onOpen('forest')} className={`${tile} animate-fade-up [animation-delay:60ms]`}>
        {nextItem ? (
          <>
            <div className="flex items-center gap-3">
              <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-950">
                <ForestScene item={nextItem.id} color="#7d8247" progress={1} backdrop={false} className="size-full opacity-40 grayscale transition duration-500 group-hover:opacity-70 group-hover:grayscale-0" />
                <Icon name="lock" size={14} className="absolute text-zinc-300" />
              </span>
              <div className="min-w-0">
                <p className="eyebrow">{t.home.next}</p>
                <p className="truncate font-display text-base font-medium text-zinc-50">{nextItem.name}</p>
              </div>
            </div>
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-sand transition-[width] duration-1000 ease-out" style={{ width: `${Math.max(4, nextProgress * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-sand">{t.home.nextValue(next.remaining)}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-300">{t.home.allUnlocked}</p>
        )}
      </button>

      <ChallengeTeaser onOpen={onChallenge} className="col-span-2 animate-fade-up [animation-delay:120ms] lg:col-span-1" />
    </div>
  )
}

export default memo(FocusSide)
