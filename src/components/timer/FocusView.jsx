import { useEffect } from 'react'
import { t } from '../../lib/strings'
import Icon from '../ui/Icon'
import PomodoroCore from './PomodoroCore'

/**
 * Contextual Focus View: nothing but the growing item, the timer and the one
 * essential control. The exit stays available but recedes until hovered or focused.
 */
export default function FocusView({ pomodoro, onExit }) {
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
      className="fixed inset-0 z-40 flex animate-fade-in flex-col overflow-hidden bg-zinc-950 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[42%] size-[150vmax] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(95_98_57/0.28),rgb(9_9_11/0)_40%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-60'
        }`}
      />
      <button
        type="button"
        onClick={onExit}
        aria-label={t.exitFullscreen}
        title={t.exitFullscreen}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 grid size-10 place-items-center rounded-full text-zinc-500 opacity-80 transition hover:bg-zinc-900 hover:text-zinc-200 hover:opacity-100 focus-visible:opacity-100"
      >
        <Icon name="collapse" size={16} />
      </button>
      <div className="relative flex flex-1 items-center justify-center">
        <PomodoroCore pomodoro={pomodoro} large />
      </div>
    </div>
  )
}
