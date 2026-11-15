import { useState } from 'react'
import { PRESETS } from '../../lib/config'
import { growthItem, stageOf } from '../../lib/growth'
import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { formatClock } from '../../lib/time'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { BreakGuideToggle, BreathingGuide, StretchGuide } from '../breaks/BreakGuide'
import ForestScene from '../growth/ForestScene'
import PresetPicker from './PresetPicker'
import ProgressRing from './ProgressRing'
import StageStepper from './StageStepper'
import TimerControls from './TimerControls'

// A small burst of leaves when the idle plant is tapped.
const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i - 4.5) * 0.32
  const d = 60 + (i % 3) * 18
  return { tx: Math.cos(a) * d, ty: Math.sin(a) * d, gold: i % 3 === 0, delay: (i % 4) * 0.03 }
})
const TIP_EVERY_SEC = 5 * 60

/**
 * Ring + Erdő scene (or break guide) + growth stages + clock + length + controls.
 * Shared by the card and Focus View; `large` is the stripped-down Focus View variant.
 */
export default function PomodoroCore({ pomodoro, large = false }) {
  const { state, actions } = useAppStore()
  const categories = useCategoryLookup()
  const [poke, setPoke] = useState(0)
  const { timer, remainingSec, progress } = pomodoro
  const phase = timer?.phase ?? 'idle'
  const category = categories[timer?.categoryId ?? state.selectedCategoryId]
  const item = growthItem(category?.growth)
  const onBreak = phase === 'break'
  const focusing = phase === 'focus'
  const growth = focusing ? progress : 0
  const stage = stageOf(growth)
  const breakElapsed = onBreak ? Math.max(0, timer.durationSec - remainingSec) : 0
  const idleSec = (PRESETS[state.prefs.preset] ?? PRESETS[25]).focus
  const clock = formatClock(timer ? remainingSec : idleSec)
  const { sound } = state.prefs
  const elapsed = focusing ? timer.durationSec - remainingSec : 0
  const tip = t.focusTips[Math.floor(elapsed / TIP_EVERY_SEC) % t.focusTips.length]

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
      {/* Sized by height too, so the clock and the button stay on short screens. */}
      <div className={`relative ${large ? 'w-[min(80vw,50dvh,28rem)]' : 'w-full max-w-[min(16rem,25dvh)] sm:max-w-[min(19rem,36dvh)]'}`}>
        <ProgressRing progress={timer ? progress : 0} color={onBreak ? '#ccd478' : category?.color ?? '#2d7749'} live={focusing}>
          {onBreak ? (
            <div key={`break-${state.prefs.breakGuide}`} className="size-full animate-scene-in">
              {state.prefs.breakGuide === 'stretch' ? <StretchGuide elapsedSec={breakElapsed} /> : <BreathingGuide elapsedSec={breakElapsed} />}
            </div>
          ) : (
            // Keyed by category so switching categories cross-fades to the new item.
            <div
              key={category?.id}
              aria-hidden="true"
              onClick={
                phase === 'idle'
                  ? () => {
                      haptic(sound.vibrate, 12)
                      setPoke((n) => n + 1)
                    }
                  : undefined
              }
              className={`relative size-full animate-scene-in ${phase === 'idle' ? 'cursor-pointer' : ''}`}
            >
              <div key={poke} className={`size-full ${poke ? 'animate-wiggle' : ''}`} style={{ transformOrigin: '50% 78%' }}>
                <ForestScene item={item.id} color={category?.color} progress={growth} alive={focusing} className="size-full" />
              </div>
              {poke > 0 && (
                <div key={`burst-${poke}`} className="pointer-events-none absolute left-1/2 top-[58%]">
                  {BURST.map((b, i) => (
                    <span
                      key={i}
                      className="swarm absolute size-2 rounded-[60%_0] "
                      style={{
                        background: b.gold ? '#d9c09f' : category?.color ?? '#62a16a',
                        '--tx': `${b.tx}px`,
                        '--ty': `${b.ty}px`,
                        '--delay': `${b.delay}s`,
                        animationDuration: '1.1s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ProgressRing>
      </div>

      <div className="flex flex-col items-center gap-1">
        {onBreak ? (
          <p className="eyebrow text-sand">{t.phase.break}</p>
        ) : (
          <StageStepper
            item={item}
            stage={stage}
            progress={growth}
            active={focusing}
            color={category?.color ?? '#2d7749'}
            durationSec={timer?.durationSec ?? idleSec}
            compact={large}
          />
        )}
        <p
          className={`num font-light leading-none text-zinc-50 ${large ? 'text-[5.5rem] sm:text-[7rem]' : 'text-[3.9rem] sm:text-[4.75rem]'}`}
          aria-label={`${t.phase[phase]}: ${clock}`}
        >
          {clock}
        </p>
        {focusing && (
          <p key={tip} className="mt-1 max-w-[18rem] animate-fade-in text-center text-xs leading-relaxed text-zinc-500">
            {tip}
          </p>
        )}
      </div>

      {phase === 'idle' && !large && <PresetPicker className="w-full max-w-[19rem]" />}
      {onBreak && <BreakGuideToggle value={state.prefs.breakGuide} onChange={(v) => actions.setPref('breakGuide', v)} />}
      <TimerControls timer={timer} />
    </div>
  )
}
