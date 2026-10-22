import { useCallback, useEffect, useState } from 'react'

/**
 * Focus View state. Uses the Fullscreen API where available (desktop, Android);
 * on iOS Safari the in-app overlay alone is used.
 */
export function useFullscreen() {
  const [open, setOpen] = useState(false)

  const enter = useCallback(() => {
    setOpen(true)
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {})
  }, [])

  const exit = useCallback(() => {
    setOpen(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }, [])

  // Leaving native fullscreen (Esc, system gesture) also closes the overlay.
  useEffect(() => {
    const onChange = () => !document.fullscreenElement && setOpen(false)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return { open, enter, exit }
}
