import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import PomodoroCore from './PomodoroCore'

const corner =
  'press grid size-11 place-items-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 shadow-card backdrop-blur hover:text-zinc-100'

/**
 * The timer tile. During a focus block it becomes the whole page (App hides the
 * rest): only the scene, the clock and Give Up remain, with sound and
 * full-screen in the corners, and the border pulses green/lime to show it is live.
 */
export default function TimerCard({ pomodoro, onFullscreen, onSound, className = '' }) {
  const { sound } = useAppStore().state.prefs
  const focusing = pomodoro.timer?.phase === 'focus'
  const ambientOn = sound.ambient !== 'off'

  return (
    <section
      aria-label="Pomodoro"
      className={`relative flex min-w-0 flex-col items-center gap-4 overflow-hidden rounded-3xl border bg-zinc-900 px-4 pb-5 pt-5 shadow-card transition-[border-color,box-shadow] duration-700 sm:p-6 ${
        focusing ? 'animate-live-glow justify-center border-olive-400/40' : 'border-zinc-800/80'
      } ${className}`}
    >
      {/* Ambient glow behind the ring; brighter while focusing. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[38%] size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--glow)/0.2),transparent_62%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-60'
        }`}
      />

      <div className="absolute inset-x-3 top-3 z-10 flex justify-between">
        <button type="button" onClick={onSound} aria-label={t.sound.button} title={ambientOn ? t.sound.ambients[sound.ambient] : t.sound.button} className={`${corner} relative`}>
          <Icon name={ambientOn ? 'volume' : 'volumeOff'} size={18} className={ambientOn ? 'text-olive-300' : ''} />
          {ambientOn && <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-olive-400 ring-2 ring-zinc-900" />}
        </button>
        <button type="button" onClick={onFullscreen} aria-label={t.fullscreen} title={t.fullscreen} className={corner}>
          <Icon name="expand" size={17} />
        </button>
      </div>

      <div className="relative w-full">
        <PomodoroCore pomodoro={pomodoro} />
      </div>

      {focusing && (
        <p className="relative flex animate-fade-in items-center gap-1.5 text-center text-xs text-zinc-500">
          <Icon name="lock" size={12} className="shrink-0 text-sand" /> {t.strictNote}
        </p>
      )}
    </section>
  )
}
