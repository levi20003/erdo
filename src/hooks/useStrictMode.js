import { useEffect } from 'react'
import { LEAVE_GRACE_MS } from '../lib/config'
import { PAGE_LOAD_ID } from '../lib/pageLoad'
import { createStrictGuard } from '../lib/strictGuard'
import { bootFocusStartedAt } from '../store/boot'

/**
 * Shared with usePomodoro: while the user is away, completion waits for Strict
 * Mode's verdict, so a block can't "finish" in a background tab and then count.
 */
export const away = { since: null }

/**
 * Strict Mode for a focus block owned by this page (decisions: lib/strictGuard.js):
 *  - tab hidden, app backgrounded, other window focused → fails unless back within LEAVE_GRACE_MS
 *  - page reloaded or reopened mid-session → fails on load
 * A block started in ANOTHER tab is left to that tab; this one only mirrors it.
 * The web cannot tell a manual screen lock from an app switch, so locking counts as
 * leaving; useWakeLock keeps the screen from locking on its own.
 */
export function useStrictMode(timer, failFocus) {
  const active = timer?.phase === 'focus'
  const owned = timer?.pageLoadId === PAGE_LOAD_ID
  const startedAt = timer?.startedAt

  useEffect(() => {
    if (!active) return
    if (!owned) {
      if (startedAt === bootFocusStartedAt()) failFocus('reload')
      return
    }

    const guard = createStrictGuard({ graceMs: LEAVE_GRACE_MS, onFail: failFocus })
    const sync = () => {
      away.since = guard.awaySince()
    }
    const leave = (why) => {
      guard.leave(why)
      sync()
    }
    const back = () => {
      guard.back()
      sync()
    }

    const onVisibility = () => (document.hidden ? leave('hidden') : back())
    const onPageHide = () => leave('hidden')
    const onBlur = () => leave('blur')
    const onFocus = () => !document.hidden && back()

    // Already away when the block starts or this effect re-runs (rare, but don't miss it).
    if (document.hidden) leave('hidden')

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      guard.dispose()
      away.since = null
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [active, owned, startedAt, failFocus])
}
