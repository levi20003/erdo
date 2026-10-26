import { BREAK_SEC, CELEBRATION_MS, FOCUS_SEC, MIN_LOGGED_FAIL_SEC } from '../lib/config'
import { sanitizeState } from '../lib/sanitize'
import { uid } from '../lib/time'

/**
 * State
 *  categories          [{ id, name, color, growth: 'tolgy'|'fenyves'|'szikla'|'gomba' }]
 *  sessions            [{ id, categoryId, start, end, durationSec, status: 'completed'|'failed', reason? }]
 *  selectedCategoryId
 *  timer               null | { phase: 'focus'|'break', categoryId, startedAt, endsAt, durationSec, pageLoadId? }
 *                      A break's startedAt lies CELEBRATION_MS in the future: the completion celebration plays first.
 *  prefs               { breakGuide: 'breathing'|'stretch', lang: 'hu'|'en', feedback: null | { shownAt, dismissals, rating } }
 *  schemaVersion       SCHEMA_VERSION (lib/migrations.js)
 *
 * Time-dependent actions carry `now`, so the reducer is pure and testable.
 */
/** Initial state from saved data; anything missing or invalid falls back to defaults (see sanitize.js). */
export function createInitialState(stored) {
  return sanitizeState(stored)
}

const PREF_VALUES = { breakGuide: ['breathing', 'stretch'], lang: ['hu', 'en'] }

export function reducer(state, action) {
  const { timer } = state

  switch (action.type) {
    case 'START_FOCUS': {
      if (timer?.phase === 'focus' || !state.selectedCategoryId) return state
      return {
        ...state,
        timer: {
          phase: 'focus',
          categoryId: state.selectedCategoryId,
          startedAt: action.now,
          endsAt: action.now + FOCUS_SEC * 1000,
          durationSec: FOCUS_SEC,
          pageLoadId: action.pageLoadId,
        },
      }
    }

    case 'COMPLETE_PHASE': {
      // Ignore early or duplicate dispatches.
      if (!timer || action.now < timer.endsAt - 500) return state
      if (timer.phase === 'break') return { ...state, timer: null }
      const session = {
        // One focus block = one session: the id comes from its start, so a second tab can't log it twice.
        id: `s-${timer.startedAt}`,
        categoryId: timer.categoryId,
        start: timer.startedAt,
        end: timer.endsAt,
        durationSec: timer.durationSec,
        status: 'completed',
      }
      return {
        ...state,
        sessions: [...state.sessions, session],
        timer: {
          phase: 'break',
          categoryId: timer.categoryId,
          startedAt: action.now + CELEBRATION_MS,
          endsAt: action.now + CELEBRATION_MS + BREAK_SEC * 1000,
          durationSec: BREAK_SEC,
        },
      }
    }

    case 'FAIL_FOCUS': {
      if (timer?.phase !== 'focus') return state
      const end = Math.min(action.now, timer.endsAt)
      const elapsedSec = Math.round((end - timer.startedAt) / 1000)
      if (elapsedSec < MIN_LOGGED_FAIL_SEC) return { ...state, timer: null }
      const session = {
        id: `s-${timer.startedAt}`,
        categoryId: timer.categoryId,
        start: timer.startedAt,
        end,
        durationSec: elapsedSec,
        status: 'failed',
        reason: action.reason,
      }
      return { ...state, sessions: [...state.sessions, session], timer: null }
    }

    case 'SKIP_BREAK':
      return timer?.phase === 'break' ? { ...state, timer: null } : state

    case 'SELECT_CATEGORY':
      return timer?.phase === 'focus' ? state : { ...state, selectedCategoryId: action.id }

    case 'ADD_CATEGORY': {
      const category = { id: uid(), name: action.name, color: action.color, growth: action.growth }
      return { ...state, categories: [...state.categories, category], selectedCategoryId: category.id }
    }

    case 'UPDATE_CATEGORY': {
      // Only editable fields; ids never change, so sessions keep pointing at their category.
      const { name, color, growth } = action.patch
      const patch = Object.fromEntries(Object.entries({ name, color, growth }).filter(([, v]) => v !== undefined))
      return { ...state, categories: state.categories.map((c) => (c.id === action.id ? { ...c, ...patch } : c)) }
    }

    case 'DELETE_CATEGORY': {
      // Keep at least one category, and never delete the one being focused on.
      if (state.categories.length <= 1 || timer?.categoryId === action.id) return state
      const categories = state.categories.filter((c) => c.id !== action.id)
      const selectedCategoryId = state.selectedCategoryId === action.id ? categories[0].id : state.selectedCategoryId
      return { ...state, categories, selectedCategoryId }
    }

    case 'HYDRATE':
      // Another tab saved newer state; it is already sanitized.
      return action.state

    case 'SET_PREF':
      // Own keys only: a key like '__proto__' must not reach Object.prototype.
      if (!Object.hasOwn(PREF_VALUES, action.key) || !PREF_VALUES[action.key].includes(action.value)) return state
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } }

    case 'IMPORT_MERGE': {
      // Merge, never replace: nothing the user already has is lost. On an id clash the existing entry wins.
      const { imported } = action
      const catIds = new Set(state.categories.map((c) => c.id))
      const sessionIds = new Set(state.sessions.map((s) => s.id))
      const categories = [...state.categories, ...imported.categories.filter((c) => !catIds.has(c.id))]
      const sessions = [...state.sessions, ...imported.sessions.filter((s) => !sessionIds.has(s.id))].sort((a, b) => a.end - b.end)
      return { ...state, categories, sessions }
    }

    case 'FEEDBACK_SHOWN':
      return { ...state, prefs: { ...state.prefs, feedback: { dismissals: 0, rating: null, ...state.prefs.feedback, shownAt: action.now } } }

    case 'FEEDBACK_DISMISS': {
      const fb = state.prefs.feedback ?? { shownAt: action.now, rating: null, dismissals: 0 }
      return { ...state, prefs: { ...state.prefs, feedback: { ...fb, dismissals: fb.dismissals + 1 } } }
    }

    case 'FEEDBACK_RATE': {
      if (!Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5) return state
      const fb = state.prefs.feedback ?? { shownAt: action.now, dismissals: 0 }
      return { ...state, prefs: { ...state.prefs, feedback: { ...fb, rating: action.rating } } }
    }

    default:
      return state
  }
}
