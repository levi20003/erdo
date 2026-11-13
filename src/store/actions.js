import { PAGE_LOAD_ID } from '../lib/pageLoad'

/** Action creators. Time-dependent actions read the clock here so the reducer stays pure. */
export function createActions(dispatch) {
  return {
    startFocus: () => dispatch({ type: 'START_FOCUS', now: Date.now(), pageLoadId: PAGE_LOAD_ID }),
    completePhase: () => dispatch({ type: 'COMPLETE_PHASE', now: Date.now() }),
    failFocus: (reason) => dispatch({ type: 'FAIL_FOCUS', reason, now: Date.now() }),
    skipBreak: () => dispatch({ type: 'SKIP_BREAK' }),
    selectCategory: (id) => dispatch({ type: 'SELECT_CATEGORY', id }),
    addCategory: ({ name, color, growth }) => dispatch({ type: 'ADD_CATEGORY', name, color, growth }),
    updateCategory: (id, patch) => dispatch({ type: 'UPDATE_CATEGORY', id, patch }),
    deleteCategory: (id) => dispatch({ type: 'DELETE_CATEGORY', id }),
    setPref: (key, value) => dispatch({ type: 'SET_PREF', key, value }),
    importMerge: (imported) => dispatch({ type: 'IMPORT_MERGE', imported }),
    setSound: (patch) => dispatch({ type: 'SET_SOUND', patch }),
    completeOnboarding: (categoryId) => dispatch({ type: 'COMPLETE_ONBOARDING', categoryId }),
    showOnboarding: () => dispatch({ type: 'SHOW_ONBOARDING' }),
    setDailyGoal: (goal) => dispatch({ type: 'SET_DAILY_GOAL', goal }),
    setNickname: (name) => dispatch({ type: 'SET_NICKNAME', name }),
    addChallenge: (challenge) => dispatch({ type: 'ADD_CHALLENGE', challenge }),
    acceptChallenge: (link) => dispatch({ type: 'ACCEPT_CHALLENGE', link, now: Date.now() }),
    updateChallenge: (link) => dispatch({ type: 'UPDATE_CHALLENGE', link }),
    removeChallenge: (id) => dispatch({ type: 'REMOVE_CHALLENGE', id }),
    feedbackShown: () => dispatch({ type: 'FEEDBACK_SHOWN', now: Date.now() }),
    feedbackDismiss: () => dispatch({ type: 'FEEDBACK_DISMISS', now: Date.now() }),
    feedbackRate: (rating) => dispatch({ type: 'FEEDBACK_RATE', rating, now: Date.now() }),
  }
}
