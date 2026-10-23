import { BREAK_SEC, FOCUS_SEC } from '../../lib/config'
import { growthItem, stageOf } from '../../lib/growth'
import { t } from '../../lib/strings'
import { formatClock } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { BreakGuideToggle, BreathingGuide, StretchGuide } from '../breaks/BreakGuide'
import ForestScene from '../growth/ForestScene'
import ProgressRing from './ProgressRing'
import StageStepper from './StageStepper'
import TimerControls from './TimerControls'

/**
 * Ring + Erdő scene (or break guide) + growth stages + clock + controls.
 * Shared by the card and Focus View; `large` is the stripped-down Focus View variant.
 */
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
      {/* Sized by height too, so the clock and Give Up stay on short screens (iPhone SE 1st gen: 568 px). */}
      <div className={large ? 'w-[min(80vw,52dvh,28rem)]' : 'w-full max-w-[min(18rem,40dvh)]'}>
        <ProgressRing progress={timer ? progress : 0} color={onBreak ? '#c9ab84' : category?.color ?? '#5f6239'} live={phase === 'focus'}>
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
          <StageStepper
            item={item}
            stage={stage}
            progress={growth}
            active={phase === 'focus'}
            color={category?.color ?? '#5f6239'}
            compact={large}
          />
        )}
        <p
          className={`font-mono font-extralight tabular-nums leading-none tracking-tight text-zinc-50 ${large ? 'text-7xl sm:text-8xl' : 'text-6xl'}`}
          aria-label={`${t.phase[phase]}: ${formatClock(timer ? remainingSec : FOCUS_SEC)}`}
        >
          {formatClock(timer ? remainingSec : FOCUS_SEC)}
        </p>
      </div>

      {onBreak && <BreakGuideToggle value={state.prefs.breakGuide} onChange={(v) => actions.setPref('breakGuide', v)} />}
      <TimerControls timer={timer} />
    </div>
  )
}
