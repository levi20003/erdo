import { memo } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'

const RING = ['#f2a541', '#d64545']

function GoalRing({ size, stroke, todayCount, goal, onGoal, className = '' }) {
  const pct = Math.min(100, Math.round((todayCount / goal) * 100))
  const done = pct >= 100
  return (
    <button type="button" onClick={onGoal} aria-label={`${t.goal.ring(todayCount, goal)}. ${t.goal.edit}`} className={`press shrink-0 rounded-full ${className}`}>
      <Ring value={todayCount / goal} size={size} stroke={stroke} gradient={RING} track="rgb(var(--pale-ink) / 0.1)" glow={done}>
        {done ? (
          <Icon name="check" size={size * 0.34} strokeWidth={2.8} className="animate-pop-in text-[#d64545]" />
        ) : (
          <span className="num font-bold text-[#dd7a33]" style={{ fontSize: size * 0.25 }}>
            {pct}%
          </span>
        )}
      </Ring>
    </button>
  )
}

/**
 * The pale card under the header: what you are focusing on (tap to switch),
 * the streak, and where today stands against the daily goal.
 */
function SummaryCard({ onCategories, onGoal, className = '' }) {
  const { state } = useAppStore()
  const categories = useCategoryLookup()
  const { todayCount, todayMin, goal, streak } = useProgress()
  const category = categories[state.selectedCategoryId]
  const focusing = state.timer?.phase === 'focus'
  const line = todayCount >= goal ? t.goal.reached : todayCount === 0 ? t.goal.first : t.goal.left(goal - todayCount)

  return (
    <section aria-label={t.summary.label} className={`pale-card animate-fade-up p-4 sm:p-5 ${className}`}>
      <span aria-hidden="true" className="absolute -right-10 -top-14 -z-10 h-36 w-44 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-white/45 dark:bg-white/5" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCategories}
          disabled={focusing}
          aria-label={t.summary.category(category?.name ?? '')}
          className="press flex min-h-11 min-w-0 items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 text-sm font-bold shadow-sm ring-1 ring-black/5 disabled:opacity-60 dark:bg-white/10 dark:ring-white/10"
        >
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <ForestScene item={category?.growth} color={category?.color} progress={1} backdrop={false} className="size-full" />
          </span>
          <span className="truncate">{category?.name}</span>
          <Icon name="chevronDown" size={15} className="shrink-0 opacity-60" />
        </button>
        {streak.current > 0 && (
          <span className="chip ml-auto shrink-0 bg-white/60 py-1.5 text-sand ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
            <Icon name="flame" size={13} /> {streak.current} {t.days}
          </span>
        )}
        {/* Short phones: only this small ring; the details row below is hidden to keep Start on screen. */}
        <GoalRing size={44} stroke={5} todayCount={todayCount} goal={goal} onGoal={onGoal} className={`hidden short:block ${streak.current > 0 ? '' : 'ml-auto'}`} />
      </div>

      <div className="mt-4 flex items-center gap-4 short:hidden">
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-2">
            <span className="num font-display text-[2.1rem] font-bold leading-none">
              {todayCount}
              <span className="opacity-40">/{goal}</span>
            </span>
            <span className="text-sm font-bold opacity-80">{t.summary.count}</span>
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-snug">{line}</p>
          <p className="num mt-0.5 text-xs opacity-70">{t.summary.focusToday(formatMinutes(todayMin))}</p>
        </div>
        <GoalRing size={88} stroke={8} todayCount={todayCount} goal={goal} onGoal={onGoal} />
      </div>
    </section>
  )
}

export default memo(SummaryCard)
