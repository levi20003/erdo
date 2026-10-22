import { BREAK_SEC, FOCUS_SEC } from '../../lib/config'
import { growthItem, stageOf } from '../../lib/growth'
import { t } from '../../lib/strings'
import { formatClock } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { BreakGuideToggle, BreathingGuide, StretchGuide } from '../breaks/BreakGuide'
import ForestScene from '../growth/ForestScene'
import ProgressRing from './ProgressRing'
import TimerControls from './TimerControls'

/** Ring + Erdő scene (or break guide) + growth stage + clock + controls. Shared by the card and Focus View. */
export default function PomodoroCore({ pomodoro, large = false }) {
  const { state, actions } = useAppStore()
  const categories = useCategoryLookup()
  const { timer, remainingSec, progress } = pomodoro
  const phase = timer?.phase ?? 'idle'
  const category = categories[timer?.categoryId ?? state.selectedCategoryId]
  const item = growthItem(category?.growth)
  const onBreak = phase === 'break'
  const growth = phase === 'focus' ? progress : 0
  const stage = stageOf(growth)
  const breakElapsed = onBreak ? Math.max(0, BREAK_SEC - remainingSec) : 0

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className={large ? 'w-[min(80vw,52dvh,28rem)]' : 'w-full max-w-[18rem]'}>
        <ProgressRing progress={timer ? progress : 0} color={onBreak ? '#c9ab84' : category?.color ?? '#5f6239'}>
          {onBreak ? (
            <div key={`break-${state.prefs.breakGuide}`} className="size-full animate-scene-in">
              {state.prefs.breakGuide === 'stretch' ? (
                <StretchGuide elapsedSec={breakElapsed} />
              ) : (
                <BreathingGuide elapsedSec={breakElapsed} />
              )}
            </div>
          ) : (
            // Keyed by category so switching categories cross-fades to the new item.
            <div key={category?.id} className="size-full animate-scene-in">
              <ForestScene item={item.id} color={category?.color} progress={growth} alive={phase === 'focus'} className="size-full" />
            </div>
          )}
        </ProgressRing>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        {onBreak ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sand/80">{t.phase.break}</p>
        ) : (
          <div key={`${category?.id}-${stage}`} className="flex animate-fade-up items-center gap-2 text-xs">
            <span className="font-medium text-zinc-300">{phase === 'focus' ? item.stages[stage] : item.name}</span>
            <span className="flex gap-1" aria-label={`${stage + 1}. ${t.stage} / 5`}>
              {item.stages.map((s, i) => (
                <span
                  key={s}
                  className="h-1 w-3 rounded-full transition-colors duration-700"
                  style={{ background: phase === 'focus' && i <= stage ? category?.color ?? '#5f6239' : '#3f3f46' }}
                />
              ))}
            </span>
          </div>
        )}
        <p
          className={`font-mono font-extralight tabular-nums leading-none tracking-tight text-zinc-50 ${large ? 'text-7xl sm:text-8xl' : 'text-6xl'}`}
          aria-label={`${t.phase[phase]}: ${formatClock(timer ? remainingSec : FOCUS_SEC)}`}
        >
          {formatClock(timer ? remainingSec : FOCUS_SEC)}
        </p>
        {phase === 'idle' && <p className="text-[11px] text-zinc-500">{t.willGrow}: {item.name}</p>}
      </div>

      {onBreak && <BreakGuideToggle value={state.prefs.breakGuide} onChange={(v) => actions.setPref('breakGuide', v)} />}
      <TimerControls timer={timer} />
    </div>
  )
}
