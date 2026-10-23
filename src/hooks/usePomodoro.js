import { useEffect } from 'react'
import { chime } from '../lib/chime'
import { formatClock } from '../lib/time'
import { useAppStore } from '../store/AppStore'
import { useNow } from './useNow'
import { useStrictMode } from './useStrictMode'

/**
 * Drives the 25/5 cycle. Remaining time is derived from `endsAt`, so it is
 * immune to throttled background timers and device sleep.
 */
export function usePomodoro() {
  const { state, actions } = useAppStore()
  const { timer } = state
  const now = useNow(timer ? 250 : null)

  // Clamped to the phase length: `now` can lag one tick behind right after a phase change.
  const remainingSec = timer ? Math.min(timer.durationSec, Math.max(0, Math.ceil((timer.endsAt - now) / 1000))) : null
  const progress = timer ? 1 - remainingSec / timer.durationSec : 0
  // The break is scheduled to start after the completion celebration.
  const celebrating = timer?.phase === 'break' && now < timer.startedAt

  useStrictMode(timer, actions.failFocus)

  useEffect(() => {
    if (timer && remainingSec === 0) {
      actions.completePhase()
      chime()
    }
  }, [timer, remainingSec, actions])

  useEffect(() => {
    document.title = timer ? `${formatClock(remainingSec)} · FocusGrove` : 'FocusGrove'
  }, [timer, remainingSec])

  return { timer, remainingSec, progress, celebrating }
}
