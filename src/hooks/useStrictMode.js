import { useEffect } from 'react'
import { BLUR_GRACE_MS } from '../lib/config'
import { PAGE_LOAD_ID } from '../lib/pageLoad'

/**
 * Strict Mode enforcement during a focus block:
 *  - tab hidden / app backgrounded / screen locked  → fails immediately
 *  - window blur (another window or app focused)    → fails unless focus returns within BLUR_GRACE_MS
 *  - page reloaded or reopened mid-session          → fails on load
 */
export function useStrictMode(timer, failFocus) {
  const active = timer?.phase === 'focus'
  const fromThisPage = timer?.pageLoadId === PAGE_LOAD_ID

  useEffect(() => {
    if (!active) return

    if (!fromThisPage) {
      failFocus('reload')
      return
    }

    let blurTimer
    const onVisibility = () => document.hidden && failFocus('hidden')
    const onBlur = () => {
      clearTimeout(blurTimer)
      blurTimer = setTimeout(() => !document.hasFocus() && failFocus('blur'), BLUR_GRACE_MS)
    }
    const onFocus = () => clearTimeout(blurTimer)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(blurTimer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [active, fromThisPage, failFocus])
}
