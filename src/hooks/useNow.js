import { useEffect, useState } from 'react'

/** Current time, refreshed every `intervalMs` while `intervalMs` is not null. */
export function useNow(intervalMs) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (intervalMs == null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
