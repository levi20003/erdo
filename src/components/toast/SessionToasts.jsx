import { useEffect, useRef } from 'react'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useToast } from './ToastProvider'

/** Turns session events into toasts. Headless. */
export default function SessionToasts() {
  const { state } = useAppStore()
  const { push } = useToast()
  const seen = useRef(state.sessions.length)
  const prevTimer = useRef(state.timer)

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
