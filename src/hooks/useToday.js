import { useEffect, useState } from 'react'
import { dayKey } from '../lib/time'

/**
 * Today's day key, updated at midnight and whenever the app comes back to the
 * foreground (a phone asleep overnight never fires the midnight timer).
 */
export function useToday() {
  const [today, setToday] = useState(dayKey)

  useEffect(() => {
    const sync = () => setToday(dayKey())
    const tomorrow = new Date()
    tomorrow.setHours(24, 0, 1, 0)
    const id = setTimeout(sync, tomorrow - Date.now())
    document.addEventListener('visibilitychange', sync)
    return () => {
      clearTimeout(id)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [today])

  return today
}
