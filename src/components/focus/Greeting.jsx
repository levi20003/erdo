import { memo } from 'react'
import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'

const partOfDay = (h) => (h < 5 ? 'night' : h < 10 ? 'morning' : h < 17 ? 'day' : h < 22 ? 'evening' : 'night')

/** "Good evening!", where today stands, the streak, and the daily goal ring (tap to change the goal). */
function Greeting({ onGoal }) {
  const { todayCount, goal, streak } = useProgress()
  const reached = todayCount >= goal
  const line = reached ? t.goal.reached : todayCount === 0 ? t.goal.first : t.goal.left(goal - todayCount)

  return (
    <div className="flex animate-fade-up items-center gap-4 px-1">
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-[1.7rem] font-medium leading-tight tracking-tight text-zinc-50">{t.greeting[partOfDay(new Date().getHours())]}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-400">
          <span>{line}</span>
          {streak.current > 0 && (
            <span className="chip bg-sand/15 text-sand">
              <Icon name="flame" size={12} /> {streak.current} {t.days}
            </span>
          )}
        </p>
      </div>
      <button type="button" onClick={onGoal} aria-label={`${t.goal.ring(todayCount, goal)}. ${t.goal.edit}`} className="press shrink-0 rounded-full">
        <Ring
          value={todayCount / goal}
          size={64}
          stroke={6}
          color={reached ? 'rgb(var(--sand))' : 'rgb(var(--olive-300))'}
          glow={reached}
        >
          {reached ? (
            <Icon name="check" size={22} strokeWidth={2.6} className="animate-pop-in text-sand" />
          ) : (
            <span className="num text-[15px] font-semibold text-zinc-50">
              {todayCount}
              <span className="text-zinc-500">/{goal}</span>
            </span>
          )}
        </Ring>
      </button>
    </div>
  )
}

export default memo(Greeting)
