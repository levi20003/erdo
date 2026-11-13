import { DEFAULT_DAILY_GOAL, MAX_DAILY_GOAL } from '../../lib/config'
import { t } from '../../lib/strings'
import { formatMinutes } from '../../lib/time'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import Sheet from '../ui/Sheet'

/** Daily goal: a big stepper plus quick picks. */
export default function GoalSheet({ open, onClose }) {
  const { state, actions } = useAppStore()
  const goal = state.prefs.dailyGoal ?? DEFAULT_DAILY_GOAL
  const set = (n) => actions.setDailyGoal(Math.min(MAX_DAILY_GOAL, Math.max(1, n)))
  const step = 'press grid size-14 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700 disabled:opacity-30'

  return (
    <Sheet open={open} onClose={onClose} title={t.goal.title} description={t.goal.hint}>
      <div className="flex items-center justify-center gap-6 py-2">
        <button type="button" aria-label={t.goal.less} disabled={goal <= 1} onClick={() => set(goal - 1)} className={step}>
          <Icon name="minus" size={22} />
        </button>
        <div className="w-24 text-center">
          <p key={goal} className="num animate-pop-in font-display text-6xl font-semibold text-zinc-50">
            {goal}
          </p>
          <p className="text-xs text-zinc-500">{t.goal.unit}</p>
        </div>
        <button type="button" aria-label={t.goal.more} disabled={goal >= MAX_DAILY_GOAL} onClick={() => set(goal + 1)} className={step}>
          <Icon name="plus" size={22} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">{t.goal.approx(formatMinutes(goal * 25))}</p>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {[2, 4, 6, 8].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => set(n)}
            aria-pressed={goal === n}
            className={`press min-h-11 rounded-xl border text-sm font-semibold ${goal === n ? 'border-olive-400 bg-olive/20 text-olive-200' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button type="button" onClick={onClose} className="btn-primary mt-5 min-h-12 w-full">
        {t.goal.done}
      </button>
    </Sheet>
  )
}
