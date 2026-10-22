import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { PAGE_LOAD_ID } from '../lib/pageLoad'
import { load, save } from '../lib/storage'
import { createInitialState, reducer } from './reducer'

const StoreContext = createContext(null)

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(load()))

  useEffect(() => save(state), [state])

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

  const value = useMemo(() => ({ state, actions }), [state, actions])
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
