import { useEffect, useRef } from 'react'
import { chime } from '../lib/chime'
import { PAGE_LOAD_ID } from '../lib/pageLoad'
import { formatClock } from '../lib/time'
import { useAppStore } from '../store/AppStore'
import { useTicker } from './useTicker'
import { away, useStrictMode } from './useStrictMode'
import { useWakeLock } from './useWakeLock'

/**
 * Drives the 25/5 cycle. Remaining time is derived from `endsAt`, so it is
 * immune to throttled background timers and device sleep, and cannot drift.
 */
export function usePomodoro() {
  const { state, actions } = useAppStore()
  const { timer } = state
  // A break's startedAt is in the future during the celebration: wake up when it ends.
  const now = useTicker(timer?.endsAt, timer?.phase === 'break' ? timer.startedAt : null)

  // Clamped to the phase length: `now` can lag one tick behind right after a phase change.
  const remainingSec = timer ? Math.min(timer.durationSec, Math.max(0, Math.ceil((timer.endsAt - now) / 1000))) : null
  const progress = timer ? 1 - remainingSec / timer.durationSec : 0
  // The break is scheduled to start after the completion celebration.
  const celebrating = timer?.phase === 'break' && now < timer.startedAt
  const focusing = timer?.phase === 'focus'

  useStrictMode(timer, actions.failFocus)
  useWakeLock(focusing && timer.pageLoadId === PAGE_LOAD_ID)

  // One completion per phase: keyed by the phase's own identity, not by render.
  const completedRef = useRef(null)
  useEffect(() => {
    if (!timer || remainingSec !== 0) return
    const key = `${timer.phase}-${timer.startedAt}`
    if (completedRef.current === key) return
    if (timer.phase === 'focus') {
      // Only the tab that runs the block completes it, and only once the user is
      // back: if they left, Strict Mode decides on return whether it still counts.
      if (timer.pageLoadId !== PAGE_LOAD_ID || away.since !== null) return
      chime()
    }
    completedRef.current = key
    actions.completePhase()
    // `now` too: a block that ran out while the user was briefly away completes on the tick after they return.
  }, [timer, remainingSec, now, actions])

  useEffect(() => {
    document.title = timer ? `${formatClock(remainingSec)} · FocusGrove` : 'FocusGrove'
  }, [timer, remainingSec])

  return { timer, remainingSec, progress, celebrating }
}
