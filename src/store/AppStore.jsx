import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { PAGE_LOAD_ID } from '../lib/pageLoad'
import { load, save, subscribe } from '../lib/storage'
import { createInitialState, reducer } from './reducer'

const StoreContext = createContext(null)

// Read once at startup, before the first render.
const BOOT = load()

/** startedAt of a focus block that was already running when this page loaded (i.e. it was reloaded or reopened). */
export const BOOT_FOCUS_STARTED_AT = BOOT.state.timer?.phase === 'focus' ? BOOT.state.timer.startedAt : null

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(BOOT.state))
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => setSaveFailed(!save(state)), [state])
  // Keep tabs in sync: another tab's save replaces ours instead of being overwritten by it.
  useEffect(() => subscribe((next) => dispatch({ type: 'HYDRATE', state: next })), [])

  const actions = useMemo(
    () => ({
      startFocus: () => dispatch({ type: 'START_FOCUS', now: Date.now(), pageLoadId: PAGE_LOAD_ID }),
      completePhase: () => dispatch({ type: 'COMPLETE_PHASE', now: Date.now() }),
      failFocus: (reason) => dispatch({ type: 'FAIL_FOCUS', reason, now: Date.now() }),
      skipBreak: () => dispatch({ type: 'SKIP_BREAK' }),
      selectCategory: (id) => dispatch({ type: 'SELECT_CATEGORY', id }),
      addCategory: ({ name, color, growth }) => dispatch({ type: 'ADD_CATEGORY', name, color, growth }),
      updateCategory: (id, patch) => dispatch({ type: 'UPDATE_CATEGORY', id, patch }),
      deleteCategory: (id) => dispatch({ type: 'DELETE_CATEGORY', id }),
      setPref: (key, value) => dispatch({ type: 'SET_PREF', key, value }),
    }),
    [],
  )

  // 'unavailable' / 'repaired' come from startup; a failed save can happen any time (e.g. storage full).
  const storage = saveFailed ? 'failing' : BOOT.status
  const value = useMemo(() => ({ state, actions, storage }), [state, actions, storage])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useAppStore must be used inside <AppStoreProvider>')
  return ctx
}

/** True while a 25-minute focus block is running: the distraction lock is on. */
export function useFocusLock() {
  return useAppStore().state.timer?.phase === 'focus'
}

export function useCategoryLookup() {
  const { categories } = useAppStore().state
  return useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
}
