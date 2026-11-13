import { memo } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { Wave } from '../art/Shapes'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'

const RING = ['#f2a541', '#d64545']

/**
 * The design's pale card under the header: the current category (as the
 * "language" chip), today's numbers, and the daily-goal ring in percent.
 */
function SummaryCard({ onCategories, onGoal, className = '' }) {
  const { state } = useAppStore()
  const categories = useCategoryLookup()
  const { todayCount, todayMin, goal, streak } = useProgress()
  const category = categories[state.selectedCategoryId]
  const pct = Math.min(100, Math.round((todayCount / goal) * 100))
  const focusing = state.timer?.phase === 'focus'

  return (
    <section aria-label={t.summary.label} className={`pale-card animate-fade-up p-4 sm:p-5 ${className}`}>
      <span aria-hidden="true" className="absolute -right-8 -top-10 -z-10 h-28 w-36 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-zinc-950/30 dark:bg-white/5" />
      <Wave variant="low" fill="rgb(255 255 255 / 0.35)" className="absolute inset-x-0 bottom-0 -z-10 h-8 w-full dark:opacity-20" />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCategories}
              disabled={focusing}
              aria-label={t.summary.category(category?.name ?? '')}
              className="press flex min-h-10 max-w-full items-center gap-2 rounded-xl bg-white/60 py-1 pl-1 pr-2.5 text-sm font-bold shadow-sm ring-1 ring-black/5 disabled:opacity-60 dark:bg-white/10 dark:ring-white/10"
            >
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 dark:bg-zinc-900">
                <ForestScene item={category?.growth} color={category?.color} progress={1} backdrop={false} className="size-full" />
              </span>
              <span className="truncate">{category?.name}</span>
              <Icon name="chevronDown" size={15} className="opacity-60" />
            </button>
            {streak.current > 0 && (
              <span className="chip bg-white/50 text-sand ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                <Icon name="flame" size={12} /> {streak.current} {t.days}
              </span>
            )}
          </div>
          <dl className="mt-3 flex flex-col gap-1 text-[13px]">
            <div className="flex gap-1">
              <dt className="font-extrabold">{t.summary.today}</dt>
              <dd>{t.summary.sessions(todayCount)}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-extrabold">{t.summary.today}</dt>
              <dd>{t.summary.focus(formatMinutes(todayMin))}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-extrabold">{t.summary.goal}</dt>
              <dd>{t.summary.goalValue(goal)}</dd>
            </div>
          </dl>
        </div>
        <button type="button" onClick={onGoal} aria-label={`${t.goal.ring(todayCount, goal)}. ${t.goal.edit}`} className="press shrink-0 rounded-full">
          <Ring value={todayCount / goal} size={96} stroke={7} gradient={RING} track="rgb(0 0 0 / 0.08)" glow={pct >= 100}>
            {pct >= 100 ? (
              <Icon name="check" size={30} strokeWidth={2.8} className="animate-pop-in text-[#d64545]" />
            ) : (
              <span className="num text-[1.35rem] font-bold text-[#e0803c]">{pct}%</span>
            )}
          </Ring>
        </button>
      </div>
    </section>
  )
}

export default memo(SummaryCard)
