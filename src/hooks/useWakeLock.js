import { useEffect } from 'react'

/**
 * Keeps the screen on while `active` (Screen Wake Lock API: Chrome/Android,
 * Safari 16.4+). Without it a phone left on the desk auto-locks mid-focus, which
 * the browser reports as leaving the app. The lock drops whenever the page is
 * hidden, so it is re-acquired on return. Unsupported or refused → no-op.
 */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel = null
    let cancelled = false

    const acquire = async () => {
      if (document.hidden || sentinel) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) return lock.release().catch(() => {})
        sentinel = lock
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null
        })
      } catch {
        // Battery saver, permissions policy, or not visible: carry on without it.
      }
    }
    const onVisibility = () => !document.hidden && acquire()

    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [active])
}
