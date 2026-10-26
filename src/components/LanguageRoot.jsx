import { setLanguage } from '../lib/strings'
import { useAppStore } from '../store/AppStore'

/**
 * Applies the saved language before anything renders, and remounts the UI when
 * it changes so every component reads the new text. Timer and data live in the
 * store above this point, so a language switch never touches a running session.
 */
export default function LanguageRoot({ children }) {
  const { lang } = useAppStore().state.prefs
  setLanguage(lang)
  return <div key={lang} className="contents">{children}</div>
}
