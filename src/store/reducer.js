import { BREAK_SEC, DEFAULT_CATEGORIES, FOCUS_SEC, MIN_LOGGED_FAIL_SEC } from '../lib/config'
import { GROWTH_IDS } from '../lib/growth'
import { uid } from '../lib/time'

/**
 * State
 *  categories          [{ id, name, color, growth: 'tolgy'|'fenyves'|'szikla'|'gomba' }]
 *  sessions            [{ id, categoryId, start, end, durationSec, status: 'completed'|'failed', reason? }]
 *  selectedCategoryId
 *  timer               null | { phase: 'focus'|'break', categoryId, startedAt, endsAt, durationSec, pageLoadId? }
 *  prefs               { breakGuide: 'breathing'|'stretch' }
 *
 * Time-dependent actions carry `now`, so the reducer is pure and testable.
 */
export function createInitialState(stored) {
  const base = {
    categories: DEFAULT_CATEGORIES,
    sessions: [],
    selectedCategoryId: DEFAULT_CATEGORIES[0].id,
    timer: null,
    prefs: { breakGuide: 'breathing' },
  }
  if (!stored) return base
  const state = { ...base, ...stored, prefs: { ...base.prefs, ...stored.prefs } }
  // Categories saved before growth items existed get one assigned.
  state.categories = state.categories.map((c, i) => (c.growth ? c : { ...c, growth: GROWTH_IDS[i % GROWTH_IDS.length] }))
  if (!state.categories.some((c) => c.id === state.selectedCategoryId)) {
    state.selectedCategoryId = state.categories[0]?.id ?? null
  }
  return state
}

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
        id: uid(),
        categoryId: timer.categoryId,
        start: timer.startedAt,
        end: timer.endsAt,
        durationSec: timer.durationSec,
        status: 'completed',
      }
      return {
        ...state,
        sessions: [...state.sessions, session],
        timer: { phase: 'break', categoryId: timer.categoryId, startedAt: action.now, endsAt: action.now + BREAK_SEC * 1000, durationSec: BREAK_SEC },
      }
    }

    case 'FAIL_FOCUS': {
      if (timer?.phase !== 'focus') return state
      const end = Math.min(action.now, timer.endsAt)
      const elapsedSec = Math.round((end - timer.startedAt) / 1000)
      if (elapsedSec < MIN_LOGGED_FAIL_SEC) return { ...state, timer: null }
      const session = {
        id: uid(),
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

    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) }

    case 'DELETE_CATEGORY': {
      // Keep at least one category, and never delete the one being focused on.
      if (state.categories.length <= 1 || timer?.categoryId === action.id) return state
      const categories = state.categories.filter((c) => c.id !== action.id)
      const selectedCategoryId = state.selectedCategoryId === action.id ? categories[0].id : state.selectedCategoryId
      return { ...state, categories, selectedCategoryId }
    }

    case 'SET_PREF':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } }

    default:
      return state
  }
}
