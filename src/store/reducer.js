import { cleanName, MAX_CHALLENGES, sanitizeChallenge } from '../lib/challenge'
import { AVATARS, BREAK_SEC, CELEBRATION_MS, DEFAULT_AVATAR, MIN_LOGGED_FAIL_SEC, PRESET_IDS, PRESETS, THEMES } from '../lib/config'
import { sanitizeGoal, sanitizeSound, sanitizeState } from '../lib/sanitize'
import { uid } from '../lib/time'

/**
 * State
 *  categories          [{ id, name, color, growth: 'tolgy'|'fenyves'|'szikla'|'gomba' }]
 *  sessions            [{ id, categoryId, start, end, durationSec, status: 'completed'|'failed', reason? }]
 *  selectedCategoryId
 *  timer               null | { phase: 'focus'|'break', categoryId, startedAt, endsAt, durationSec, breakSec?, pageLoadId? }
 *                      A break's startedAt lies CELEBRATION_MS in the future: the completion celebration plays first.
 *  prefs               { breakGuide: 'breathing'|'stretch', lang: 'hu'|'en', feedback: null | { shownAt, dismissals, rating },
 *                        onboarded: boolean, sound: { chime, volume, vibrate, ambient, ambientVolume },
 *                        theme: 'system'|'light'|'dark', preset: '25'|'50'|'90', dailyGoal: 1..12, nickname }
 *  challenges          [{ id, role: 'host'|'guest', goal, days, start, opponent, opponentDone, opponentAt, createdAt }]
 *  schemaVersion       SCHEMA_VERSION (lib/migrations.js)
 *
 * Time-dependent actions carry `now`, so the reducer is pure and testable.
 */
/** Initial state from saved data; anything missing or invalid falls back to defaults (see sanitize.js). */
export function createInitialState(stored) {
  return sanitizeState(stored)
}

const PREF_VALUES = { breakGuide: ['breathing', 'stretch'], lang: ['hu', 'en'], theme: THEMES, preset: PRESET_IDS, avatar: AVATARS }

export function reducer(state, action) {
  const { timer } = state

  switch (action.type) {
    case 'START_FOCUS': {
      if (timer?.phase === 'focus' || !state.selectedCategoryId) return state
      const preset = PRESETS[state.prefs.preset] ?? PRESETS[25]
      return {
        ...state,
        timer: {
          phase: 'focus',
          categoryId: state.selectedCategoryId,
          startedAt: action.now,
          endsAt: action.now + preset.focus * 1000,
          durationSec: preset.focus,
          breakSec: preset.break,
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
      const breakSec = timer.breakSec ?? BREAK_SEC
      return {
        ...state,
        sessions: [...state.sessions, session],
        timer: {
          phase: 'break',
          categoryId: timer.categoryId,
          startedAt: action.now + CELEBRATION_MS,
          endsAt: action.now + CELEBRATION_MS + breakSec * 1000,
          durationSec: breakSec,
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
        // How long the block was meant to be: the withered plant shows how far it got.
        plannedSec: timer.durationSec,
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

    case 'SET_SOUND':
      // Every field is re-validated, so a bad value can't reach the audio code.
      return { ...state, prefs: { ...state.prefs, sound: sanitizeSound({ ...state.prefs.sound, ...action.patch }) } }

    case 'SET_DAILY_GOAL':
      return { ...state, prefs: { ...state.prefs, dailyGoal: sanitizeGoal(action.goal) } }

    case 'SET_NICKNAME':
      return { ...state, prefs: { ...state.prefs, nickname: cleanName(action.name) } }

    case 'ADD_CHALLENGE': {
      const challenge = sanitizeChallenge(action.challenge)
      if (!challenge || state.challenges.some((c) => c.id === challenge.id)) return state
      return { ...state, challenges: [challenge, ...state.challenges].slice(0, MAX_CHALLENGES) }
    }

    case 'ACCEPT_CHALLENGE': {
      // A friend's invitation (already validated by decodeChallenge): this user joins as the guest.
      const { link } = action
      if (state.challenges.some((c) => c.id === link.id)) return state
      const challenge = sanitizeChallenge({
        id: link.id,
        role: 'guest',
        goal: link.goal,
        days: link.days,
        start: link.start,
        opponent: link.name,
        opponentDone: link.done,
        opponentAt: link.at,
        createdAt: action.now,
      })
      return challenge ? { ...state, challenges: [challenge, ...state.challenges].slice(0, MAX_CHALLENGES) } : state
    }

    case 'UPDATE_CHALLENGE': {
      // The friend's latest count. An older link never overwrites a newer one.
      const { link } = action
      const challenges = state.challenges.map((c) =>
        c.id === link.id && c.role !== link.role && link.at > (c.opponentAt ?? 0)
          ? { ...c, opponent: link.name || c.opponent, opponentDone: link.done, opponentAt: link.at }
          : c,
      )
      return { ...state, challenges }
    }

    case 'REMOVE_CHALLENGE':
      return { ...state, challenges: state.challenges.filter((c) => c.id !== action.id) }

    case 'COMPLETE_ONBOARDING': {
      const selectedCategoryId = state.categories.some((c) => c.id === action.categoryId) ? action.categoryId : state.selectedCategoryId
      return { ...state, selectedCategoryId, prefs: { ...state.prefs, onboarded: true } }
    }

    case 'SHOW_ONBOARDING':
      return timer?.phase === 'focus' ? state : { ...state, prefs: { ...state.prefs, onboarded: false } }

    case 'IMPORT_MERGE': {
      // Merge, never replace: nothing the user already has is lost. On an id clash the existing entry wins.
      const { imported } = action
      const catIds = new Set(state.categories.map((c) => c.id))
      const sessionIds = new Set(state.sessions.map((s) => s.id))
      const categories = [...state.categories, ...imported.categories.filter((c) => !catIds.has(c.id))]
      const sessions = [...state.sessions, ...imported.sessions.filter((s) => !sessionIds.has(s.id))].sort((a, b) => a.end - b.end)
      const challengeIds = new Set(state.challenges.map((c) => c.id))
      const challenges = [...state.challenges, ...(imported.challenges ?? []).filter((c) => !challengeIds.has(c.id))].slice(0, MAX_CHALLENGES)
      // A restored profile fills in only what this device doesn't have yet.
      const from = imported.prefs ?? {}
      const prefs = {
        ...state.prefs,
        nickname: state.prefs.nickname || from.nickname || '',
        avatar: state.prefs.avatar === DEFAULT_AVATAR && from.avatar ? from.avatar : state.prefs.avatar,
      }
      return { ...state, categories, sessions, challenges, prefs }
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
