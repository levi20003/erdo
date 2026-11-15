import { useSyncExternalStore } from 'react'
import { getUpdateState, subscribeUpdates } from '../lib/updates'

/** { supported, status, version } — see lib/updates.js. */
export const useUpdate = () => useSyncExternalStore(subscribeUpdates, getUpdateState)
