import { createContext, useContext, useMemo, useReducer } from 'react'
import { createActions } from './actions'
import { getBoot } from './boot'
import { createInitialState, reducer } from './reducer'
import { usePersistence } from './usePersistence'

/*
 * App state: one reducer (store/reducer.js), persisted to localStorage
 * (store/usePersistence.js), loaded once per page (store/boot.js).
 */
const StoreContext = createContext(null)

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState(getBoot().state))
  const saving = usePersistence(state, dispatch)
  const actions = useMemo(() => createActions(dispatch), [])

  // Startup status ('migrated', 'repaired', 'unavailable', …) unless saving is failing right now.
  const storage = saving ? getBoot().status : 'failing'
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
