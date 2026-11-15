import { createContext, useContext, useEffect, useState } from 'react'
import { useAppStore } from '../store/AppStore'

/*
 * Light / dark. prefs.theme is 'system' (follow the device), 'light' or 'dark'.
 * index.html applies the same rule before the first paint, so there is no flash.
 */
const ThemeContext = createContext('dark')
// Dark unless the device asks for light (also when it states no preference).
const query = () => window.matchMedia?.('(prefers-color-scheme: light)')

export function resolveTheme(pref, systemDark) {
  if (pref === 'light' || pref === 'dark') return pref
  return systemDark ? 'dark' : 'light'
}

export default function ThemeRoot({ children }) {
  const pref = useAppStore().state.prefs.theme
  const [systemDark, setSystemDark] = useState(() => !query()?.matches)

  useEffect(() => {
    const mq = query()
    if (!mq) return
    const onChange = (e) => setSystemDark(!e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const theme = resolveTheme(pref, systemDark)

  useEffect(() => {
    // The status-bar colour follows what is at the top of the screen (see useThemeColor in App).
    document.documentElement.dataset.theme = theme
  }, [theme])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

/** 'light' | 'dark' — what is actually on screen. */
export const useTheme = () => useContext(ThemeContext)
