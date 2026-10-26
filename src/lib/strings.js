import en from './i18n/en'
import hu from './i18n/hu'

/*
 * Localization. Hungarian is the default and the fallback: a key missing from
 * another language resolves to its Hungarian text, never to undefined.
 *
 * `t` is one live object: components import it once and read it at render time.
 * setLanguage() swaps its contents; App remounts on a language change, so every
 * component re-renders with the new text.
 */
const DICTIONARIES = { hu, en }
const LOCALES = { hu: 'hu-HU', en: 'en-GB' }

export const LANGUAGES = [
  { code: 'hu', label: 'Magyar' },
  { code: 'en', label: 'English' },
]

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Deep merge where `over` wins; arrays merge by index so a partial translation still has every item. */
export function mergeStrings(base, over) {
  if (Array.isArray(base)) return base.map((item, i) => (over?.[i] === undefined ? item : mergeStrings(item, over[i])))
  if (isPlain(base)) {
    const out = {}
    for (const key of Object.keys(base)) out[key] = over && key in over ? mergeStrings(base[key], over[key]) : base[key]
    return out
  }
  return over === undefined ? base : over
}

let current = 'hu'
export const t = mergeStrings(hu, {})

export function setLanguage(lang) {
  const next = DICTIONARIES[lang] ? lang : 'hu'
  if (next === current) return
  current = next
  const merged = mergeStrings(hu, DICTIONARIES[next])
  for (const key of Object.keys(t)) delete t[key]
  Object.assign(t, merged)
  if (typeof document !== 'undefined') document.documentElement.lang = next
}

export const getLanguage = () => current
/** BCP 47 locale for Intl date and number formatting. */
export const getLocale = () => LOCALES[current]
