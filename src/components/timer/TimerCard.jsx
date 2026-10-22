import { t } from '../../lib/strings'
import Icon from '../ui/Icon'
import CategorySelect from './CategorySelect'
import PomodoroCore from './PomodoroCore'

export default function TimerCard({ pomodoro, onFullscreen, className = '' }) {
  const phase = pomodoro.timer?.phase ?? 'idle'
  const focusing = phase === 'focus'

  return (
    <section
      aria-label="Pomodoro"
      className={`relative flex min-w-0 flex-col items-center gap-6 overflow-hidden rounded-2xl border bg-zinc-900 p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.035)] transition-[border-color,box-shadow] duration-700 sm:p-6 ${
        focusing ? 'border-sand/30 shadow-[0_0_90px_-30px_rgb(201_171_132/0.35)]' : 'border-zinc-800/70 hover:border-zinc-700/70'
      } ${className}`}
    >
      {/* Ambient olive glow behind the ring; brighter while focusing. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[38%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(95_98_57/0.22),transparent_65%)] transition-opacity duration-1000 ${
          focusing ? 'opacity-100' : 'opacity-50'
        }`}
      />

      <div className="relative flex w-full items-center justify-between gap-3">
        <span className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-[11px] text-zinc-400">
          <Icon name="tree" size={13} className="text-olive-300" />
          Erdő · 25 / 5
        </span>
        <button
          type="button"
          onClick={onFullscreen}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          <Icon name="expand" size={14} /> <span className="hidden min-[380px]:inline">{t.fullscreen}</span>
        </button>
      </div>

      <div className="relative w-full">
        <CategorySelect disabled={focusing} />
      </div>
      <div className="relative w-full">
        <PomodoroCore pomodoro={pomodoro} />
      </div>

      <p
        className={`relative flex items-center gap-1.5 text-center text-[11px] text-sand/90 transition-opacity duration-500 ${focusing ? 'opacity-100' : 'invisible opacity-0'}`}
        aria-hidden={!focusing}
      >
        <Icon name="lock" size={12} /> {t.strictNote}
      </p>
    </section>
  )
}
