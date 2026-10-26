import { useEffect, useState } from 'react'
import { save, subscribe } from '../lib/storage'

/**
 * Saves every state change and keeps tabs in sync: another tab's save replaces
 * ours instead of being overwritten by it. Returns false while saves fail.
 */
export function usePersistence(state, dispatch) {
  const [saving, setSaving] = useState(true)

  useEffect(() => setSaving(save(state)), [state])
  useEffect(() => subscribe((next) => dispatch({ type: 'HYDRATE', state: next })), [dispatch])

  return saving
}
