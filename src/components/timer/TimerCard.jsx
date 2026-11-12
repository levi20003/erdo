import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import CategorySelect from './CategorySelect'
import PomodoroCore from './PomodoroCore'

const iconButton =
  'grid size-11 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 active:scale-95'

/**
 * The timer tile. During a focus block it becomes the whole page (App hides the
 * rest): only the scene, the clock and Give Up remain, plus small sound and
 * full-screen buttons, and the border pulses olive/gold to show it is live.
 */
export default function TimerCard({ pomodoro, onFullscreen, onSound, className = '' }) {
  const { sound } = useAppStore().state.prefs
  const focusing = pomodoro.timer?.phase === 'focus'
  const soundLabel = sound.ambient === 'off' ? t.sound.button : t.sound.ambients[sound.ambient]

  return (
    <section
      aria-label="Pomodoro"
      className={`relative flex min-w-0 flex-col items-center gap-4 overflow-hidden rounded-3xl sm:gap-5 border bg-zinc-900 p-4 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.035)] transition-[border-color,box-shadow] duration-700 sm:p-6 ${
        focusing ? 'animate-live-glow justify-center gap-y-4 border-sand/35 sm:gap-y-6' : 'border-zinc-800/70'
      } ${className}`}
    >
      {/* Ambient olive glow behind the ring; brighter while focusing. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[42%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(95_98_57/0.22),transparent_65%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-50'
        }`}
      />

      {focusing ? (
        <div className="absolute right-2 top-2 z-10 flex">
          <button type="button" onClick={onSound} aria-label={t.sound.button} title={soundLabel} className={iconButton}>
            <Icon name={sound.ambient === 'off' ? 'volumeOff' : 'volume'} size={17} />
          </button>
          <button type="button" onClick={onFullscreen} aria-label={t.fullscreen} title={t.fullscreen} className={iconButton}>
            <Icon name="expand" size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative flex w-full animate-fade-in items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSound}
              className="flex min-h-10 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/50 px-3.5 text-xs text-zinc-300 transition hover:border-zinc-700"
            >
              <Icon name={sound.ambient === 'off' ? 'volumeOff' : 'volume'} size={15} className="text-sand" />
              {soundLabel}
            </button>
            <button type="button" onClick={onFullscreen} aria-label={t.fullscreen} title={t.fullscreen} className={iconButton}>
              <Icon name="expand" size={16} />
            </button>
          </div>
          <div className="relative w-full animate-fade-in">
            <CategorySelect />
          </div>
        </>
      )}

      <div className="relative w-full">
        <PomodoroCore pomodoro={pomodoro} />
      </div>

      {focusing && (
        <p className="relative flex animate-fade-in items-center gap-1.5 text-center text-xs text-sand/80">
          <Icon name="lock" size={12} className="shrink-0" /> {t.strictNote}
        </p>
      )}
    </section>
  )
}
