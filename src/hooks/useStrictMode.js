import { useEffect } from 'react'
import { LEAVE_GRACE_MS } from '../lib/config'
import { PAGE_LOAD_ID } from '../lib/pageLoad'
import { BOOT_FOCUS_STARTED_AT } from '../store/AppStore'

/**
 * Shared with usePomodoro: while the user is away, completion waits for this
 * hook's verdict, so a block can't "finish" in a background tab and then count.
 */
export const away = { since: null }

/**
 * Strict Mode enforcement during a focus block owned by this page:
 *  - tab hidden, app backgrounded, other window focused → fails unless back within LEAVE_GRACE_MS
 *    (decided by a timer where the page keeps running, or on return where the OS froze it)
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
      if (startedAt === BOOT_FOCUS_STARTED_AT) failFocus('reload')
      return
    }

    let reason = null
    let graceTimer
    const leave = (why) => {
      if (away.since !== null) return
      away.since = Date.now()
      reason = why
      graceTimer = setTimeout(() => failFocus(reason), LEAVE_GRACE_MS)
    }
    const back = () => {
      if (away.since === null) return
      const gone = Date.now() - away.since
      clearTimeout(graceTimer)
      away.since = null
      if (gone > LEAVE_GRACE_MS) failFocus(reason)
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
      clearTimeout(graceTimer)
      away.since = null
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [active, owned, startedAt, failFocus])
}
