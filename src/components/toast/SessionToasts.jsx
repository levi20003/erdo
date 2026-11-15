import { useEffect, useRef } from 'react'
import { APP_VERSION } from '../../lib/config'
import { t } from '../../lib/strings'
import { consumeJustUpdated } from '../../lib/updates'
import { useAppStore } from '../../store/AppStore'
import { useToast } from './ToastProvider'

/** Turns session events (and a finished in-app update) into toasts. Headless. */
export default function SessionToasts() {
  const { state } = useAppStore()
  const { push } = useToast()
  const seen = useRef(state.sessions.length)
  const prevTimer = useRef(state.timer)

  // The first load after "Update": confirm which version is running now.
  useEffect(() => {
    if (consumeJustUpdated()) push(t.update.updated(APP_VERSION), 'success')
  }, [push])

  useEffect(() => {
    const fresh = state.sessions.slice(seen.current)
    seen.current = state.sessions.length
    for (const s of fresh) {
      // Completed sessions get the full-screen celebration instead of a toast.
      if (s.status !== 'completed') push(s.reason === 'gave-up' ? t.toast.gaveUp : t.toast.failed, 'danger')
    }
  }, [state.sessions, push])

  useEffect(() => {
    const prev = prevTimer.current
    prevTimer.current = state.timer
    if (prev?.phase === 'break' && !state.timer && Date.now() >= prev.endsAt - 500) push(t.toast.breakOver)
  }, [state.timer, push])

  return null
}
