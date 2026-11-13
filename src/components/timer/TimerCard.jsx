import { t } from '../../lib/strings'
import Icon from '../ui/Icon'
import CategorySelect from './CategorySelect'
import PomodoroCore from './PomodoroCore'

/**
 * The timer tile. During a focus block it becomes the whole page (App hides the
 * rest): only the scene, the clock and Give Up remain, plus small sound and
 * full-screen buttons, and the border pulses olive/gold to show it is live.
 */
export default function TimerCard({ pomodoro, onFullscreen, onSound, className = '' }) {
  const focusing = pomodoro.timer?.phase === 'focus'
  const idle = !pomodoro.timer

  return (
    <section
      aria-label="Pomodoro"
      className={`relative flex min-w-0 flex-col items-center gap-4 overflow-hidden rounded-[2rem] border bg-zinc-900 p-4 shadow-card transition-[border-color,box-shadow] duration-700 sm:p-6 ${
        focusing ? 'animate-live-glow justify-center border-sand/35' : 'border-zinc-800/80'
      } ${className}`}
    >
      {/* Ambient glow behind the ring; brighter while focusing. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[40%] size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--glow)/0.22),transparent_62%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-60'
        }`}
      />

      {idle && (
        <div className="relative w-full animate-fade-in">
          <CategorySelect />
        </div>
      )}

      <div className="relative w-full">
        <PomodoroCore pomodoro={pomodoro} onSound={onSound} onFullscreen={onFullscreen} />
      </div>

      {focusing && (
        <p className="relative flex animate-fade-in items-center gap-1.5 text-center text-xs text-sand">
          <Icon name="lock" size={12} className="shrink-0" /> {t.strictNote}
        </p>
      )}
    </section>
  )
}
