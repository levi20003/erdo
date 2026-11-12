import { AMBIENTS, BREAK_SEC, CHIMES, DEFAULT_CATEGORIES, DEFAULT_SOUND, FOCUS_SEC, PALETTE, SCHEMA_VERSION, STARTER_GROWTH } from './config'
import { GROWTH_IDS } from './growth'
import { migrate } from './migrations'

export const LANGS = ['hu', 'en']

/*
 * Saved state is untrusted: an older version, a half-written save, a manual
 * edit or another tab may have left anything in it. Each field is repaired on
 * its own, so one bad value never costs the rest of the user's history.
 */

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isStr = (v) => typeof v === 'string' && v.length > 0
const HEX = /^#[0-9a-f]{6}$/i

function sanitizeCategories(raw) {
  if (!Array.isArray(raw)) return DEFAULT_CATEGORIES
  const seen = new Set()
  const out = []
  raw.forEach((c, i) => {
    if (!isObj(c) || !isStr(c.id) || seen.has(c.id)) return
    const name = typeof c.name === 'string' ? c.name.trim().slice(0, 40) : ''
    if (!name) return
    seen.add(c.id)
    out.push({
      id: c.id,
      name,
      color: typeof c.color === 'string' && HEX.test(c.color) ? c.color : PALETTE[i % PALETTE.length],
      // Categories saved before growth items existed get one assigned.
      growth: GROWTH_IDS.includes(c.growth) ? c.growth : STARTER_GROWTH[i % STARTER_GROWTH.length],
    })
  })
  return out.length ? out : DEFAULT_CATEGORIES
}

function sanitizeSessions(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  return raw
    .filter(
      (s) =>
        isObj(s) &&
        (isStr(s.id) || isNum(s.id)) &&
        isStr(s.categoryId) &&
        isNum(s.start) &&
        isNum(s.end) &&
        s.end >= s.start &&
        isNum(s.durationSec) &&
        s.durationSec > 0 &&
        s.durationSec <= FOCUS_SEC &&
        (s.status === 'completed' || s.status === 'failed'),
    )
    .map((s) => ({ ...s, id: String(s.id) }))
    .filter((s) => !seen.has(s.id) && seen.add(s.id))
    .sort((a, b) => a.end - b.end)
}

function sanitizeTimer(raw, categoryIds) {
  if (!isObj(raw)) return null
  const expected = raw.phase === 'focus' ? FOCUS_SEC : raw.phase === 'break' ? BREAK_SEC : null
  if (!expected || raw.durationSec !== expected) return null
  if (!isNum(raw.startedAt) || !isNum(raw.endsAt) || raw.endsAt <= raw.startedAt) return null
  if (!categoryIds.has(raw.categoryId)) return null
  return {
    phase: raw.phase,
    categoryId: raw.categoryId,
    startedAt: raw.startedAt,
    endsAt: raw.endsAt,
    durationSec: raw.durationSec,
    ...(isStr(raw.pageLoadId) ? { pageLoadId: raw.pageLoadId } : {}),
  }
}

function sanitizeFeedback(raw) {
  if (!isObj(raw)) return null
  return {
    // Unix ms of the last time the prompt was shown, and how often it was dismissed.
    shownAt: isNum(raw.shownAt) ? raw.shownAt : null,
    dismissals: Number.isInteger(raw.dismissals) && raw.dismissals >= 0 ? Math.min(raw.dismissals, 99) : 0,
    rating: Number.isInteger(raw.rating) && raw.rating >= 1 && raw.rating <= 5 ? raw.rating : null,
  }
}

const unit = (v, fallback) => (isNum(v) && v >= 0 && v <= 1 ? Math.round(v * 100) / 100 : fallback)

export function sanitizeSound(raw) {
  const src = isObj(raw) ? raw : {}
  return {
    chime: CHIMES.includes(src.chime) ? src.chime : DEFAULT_SOUND.chime,
    volume: unit(src.volume, DEFAULT_SOUND.volume),
    vibrate: typeof src.vibrate === 'boolean' ? src.vibrate : DEFAULT_SOUND.vibrate,
    ambient: AMBIENTS.includes(src.ambient) ? src.ambient : DEFAULT_SOUND.ambient,
    ambientVolume: unit(src.ambientVolume, DEFAULT_SOUND.ambientVolume),
  }
}

function sanitizePrefs(raw) {
  const src = isObj(raw) ? raw : {}
  return {
    breakGuide: src.breakGuide === 'stretch' ? 'stretch' : 'breathing',
    lang: LANGS.includes(src.lang) ? src.lang : 'hu',
    feedback: sanitizeFeedback(src.feedback),
    onboarded: src.onboarded === true,
    sound: sanitizeSound(src.sound),
  }
}

/**
 * Returns a complete, valid state of the current schema version built from
 * whatever `raw` holds: legacy data is migrated first (lib/migrations.js),
 * then every field is validated; null or garbage → defaults.
 */
export function sanitizeState(raw) {
  const src = isObj(raw) ? migrate(raw).data : {}
  const categories = sanitizeCategories(src.categories)
  const ids = new Set(categories.map((c) => c.id))
  return {
    categories,
    sessions: sanitizeSessions(src.sessions),
    selectedCategoryId: ids.has(src.selectedCategoryId) ? src.selectedCategoryId : categories[0].id,
    timer: sanitizeTimer(src.timer, ids),
    prefs: sanitizePrefs(src.prefs),
    schemaVersion: SCHEMA_VERSION,
  }
}
