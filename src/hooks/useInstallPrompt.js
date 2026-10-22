import { useEffect, useState } from 'react'

/** Captures Chrome/Android's `beforeinstallprompt` so we can show our own install banner. */
export function useInstallPrompt() {
  const [event, setEvent] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setEvent(e)
    }
    const onInstalled = () => setEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!event) return
    event.prompt()
    await event.userChoice.catch(() => {})
    setEvent(null)
  }

  return { canInstall: Boolean(event), install, dismiss: () => setEvent(null) }
}
