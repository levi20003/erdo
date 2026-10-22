import { useEffect, useRef } from 'react'
import { growthItem } from '../../lib/growth'
import { t } from '../../lib/strings'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { useToast } from './ToastProvider'

/** Turns session events into toasts. Headless. */
export default function SessionToasts() {
  const { state } = useAppStore()
  const { push } = useToast()
  const categories = useCategoryLookup()
  const seen = useRef(state.sessions.length)
  const prevTimer = useRef(state.timer)

  useEffect(() => {
    const fresh = state.sessions.slice(seen.current)
    seen.current = state.sessions.length
    for (const s of fresh) {
      if (s.status === 'completed') push(t.toast.completed(growthItem(categories[s.categoryId]?.growth).name), 'success')
      else push(s.reason === 'gave-up' ? t.toast.gaveUp : t.toast.failed, 'danger')
    }
  }, [state.sessions, push]) // eslint-disable-line react-hooks/exhaustive-deps -- categories only label the toast

  useEffect(() => {
    const prev = prevTimer.current
    prevTimer.current = state.timer
    if (prev?.phase === 'break' && !state.timer && Date.now() >= prev.endsAt - 500) push(t.toast.breakOver)
  }, [state.timer, push])

  return null
}
