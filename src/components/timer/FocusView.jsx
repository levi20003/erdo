import { useEffect } from 'react'
import { growthItem } from '../../lib/growth'
import { t } from '../../lib/strings'
import { useCategoryLookup } from '../../store/AppStore'
import Icon from '../ui/Icon'
import PomodoroCore from './PomodoroCore'

/** Immersive, distraction-free layer: the forest, the clock and the one essential control. */
export default function FocusView({ pomodoro, onExit }) {
  const categories = useCategoryLookup()
  const category = categories[pomodoro.timer?.categoryId]
  const focusing = pomodoro.timer?.phase === 'focus'

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onExit()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onExit])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.fullscreen}
      className="fixed inset-0 z-40 flex animate-fade-in flex-col overflow-hidden bg-zinc-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[42%] size-[150vmax] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(95_98_57/0.28),rgb(9_9_11/0)_40%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-60'
        }`}
      />
      <header className="relative flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
          {category && <span className="size-2 shrink-0 rounded-full" style={{ background: category.color }} />}
          <span className="truncate">
            {category?.name ?? 'FocusGrove'}
            {category && <span className="text-zinc-700"> · {growthItem(category.growth).name}</span>}
          </span>
        </p>
        <button
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
        >
          <Icon name="collapse" size={14} /> {t.exitFullscreen}
        </button>
      </header>
      <div className="relative flex flex-1 items-center justify-center">
        <PomodoroCore pomodoro={pomodoro} large />
      </div>
      <p className={`relative flex items-center justify-center gap-1.5 text-[11px] text-zinc-600 transition-opacity ${focusing ? 'opacity-100' : 'opacity-0'}`}>
        <Icon name="lock" size={12} /> {t.focusLocked}
      </p>
    </div>
  )
}
