import { useCallback, useEffect, useState } from 'react'

/*
 * The current screen lives in the URL hash (#fokusz, #erdo, …): the Android back
 * button steps between screens, and a reload keeps the screen.
 */
const HASHES = { focus: 'fokusz', forest: 'erdo', stats: 'statisztika', settings: 'profil' }
// Older links and bookmarks.
const LEGACY = { beallitasok: 'settings' }
export const TAB_IDS = Object.keys(HASHES)

const fromHash = () => TAB_IDS.find((id) => window.location.hash === `#${HASHES[id]}`) ?? LEGACY[window.location.hash.slice(1)] ?? 'focus'

export function useTab() {
  const [tab, setTabState] = useState(fromHash)

  useEffect(() => {
    const onHash = () => setTabState(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setTab = useCallback((next) => {
    if (next === fromHash()) return
    window.location.hash = HASHES[next]
    // Straight to the top: a smooth scroll racing the screen change looks jittery on phones.
    window.scrollTo(0, 0)
  }, [])

  return [tab, setTab]
}
