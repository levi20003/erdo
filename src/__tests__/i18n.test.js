import { afterEach, describe, expect, it } from 'vitest'
import en from '../lib/i18n/en'
import hu from '../lib/i18n/hu'
import { growthItem } from '../lib/growth'
import { getLocale, mergeStrings, setLanguage, t } from '../lib/strings'
import { formatMinutes } from '../lib/time'

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k
    return v && typeof v === 'object' && !Array.isArray(v) ? keys(v, path) : [path]
  })
}

describe('i18n', () => {
  afterEach(() => setLanguage('hu'))

  it('English covers every Hungarian key (fallback exists, but parity is the goal)', () => {
    const missing = keys(hu).filter((k) => !keys(en).includes(k))
    expect(missing).toEqual([])
  })

  it('English has no keys Hungarian lacks (would be silently ignored)', () => {
    expect(keys(en).filter((k) => !keys(hu).includes(k))).toEqual([])
  })

  it('falls back to Hungarian per key and keeps array items', () => {
    const merged = mergeStrings({ a: 'hu-a', b: 'hu-b', list: [{ x: 1, y: 2 }] }, { a: 'en-a', list: [{ x: 9 }] })
    expect(merged).toEqual({ a: 'en-a', b: 'hu-b', list: [{ x: 9, y: 2 }] })
  })

  it('switches text, units, locale and growth names together', () => {
    expect(formatMinutes(95)).toBe('1 ó 35 p')
    setLanguage('en')
    expect(t.start).toBe('Start focus')
    expect(formatMinutes(95)).toBe('1 h 35 min')
    expect(getLocale()).toBe('en-GB')
    expect(growthItem('tolgy').stages[0]).toBe('Acorn')
    // Stretch icons are shared: the English list inherits them from Hungarian.
    expect(t.stretches[0].icon).toBe('neck')
    setLanguage('xx')
    expect(t.start).toBe('Fókusz indítása')
  })
})
