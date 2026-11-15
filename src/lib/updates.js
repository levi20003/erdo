import { APP_VERSION } from './config'
import { logError } from './errorLog'

/*
 * In-app updates.
 *
 * An installed app can stay open in the background for days, so "the next time
 * you open it" may be far away. The service worker therefore installs a new
 * version quietly and WAITS; this module notices it, the app shows "Update",
 * and one tap switches over and reloads. The app also checks by itself when it
 * comes back to the foreground, and the Profile screen has "Check for updates".
 *
 * status: 'idle' | 'checking' | 'latest' | 'ready' | 'error'
 */
const CHECK_EVERY_MS = 30 * 60 * 1000
const UPDATED_FLAG = 'focusgrove:just-updated'

let registration = null
let reloadOnTakeover = false
let silentTakeover = false
let lastCheck = 0
let state = { supported: false, status: 'idle', version: null }
const listeners = new Set()

function set(patch) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export const subscribeUpdates = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getUpdateState = () => state

/** Asks a worker which app version it carries; null if it doesn't answer (an older worker). */
function versionOf(worker) {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    const timer = setTimeout(() => resolve(null), 1500)
    channel.port1.onmessage = (event) => {
      clearTimeout(timer)
      resolve(typeof event.data?.version === 'string' ? event.data.version : null)
    }
    try {
      worker.postMessage({ type: 'GET_VERSION' }, [channel.port2])
    } catch {
      clearTimeout(timer)
      resolve(null)
    }
  })
}

/** A new worker is installed and waiting. */
async function onWaiting(worker) {
  const version = await versionOf(worker)
  if (version && version === APP_VERSION) {
    // The page already runs this version (e.g. after a manual reload): just let the worker take over.
    silentTakeover = true
    worker.postMessage({ type: 'SKIP_WAITING' })
    return
  }
  set({ status: 'ready', version })
}

function track(reg) {
  registration = reg
  set({ supported: true })
  if (reg.waiting && navigator.serviceWorker.controller) onWaiting(reg.waiting)
  reg.addEventListener('updatefound', () => {
    const worker = reg.installing
    if (!worker) return
    worker.addEventListener('statechange', () => {
      // "installed" while another worker controls the page = an update (not the first install).
      if (worker.state === 'installed' && navigator.serviceWorker.controller) onWaiting(worker)
    })
  })
}

/** Registers the service worker and starts watching for updates. Production only. */
export function registerServiceWorker(url) {
  if (!('serviceWorker' in navigator)) return
  const hadController = Boolean(navigator.serviceWorker.controller)
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(url)
      .then(track)
      .catch((err) => logError('sw', err, 'registration failed'))
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (silentTakeover) {
      silentTakeover = false
      return
    }
    if (reloadOnTakeover) return window.location.reload()
    // Another window of the app applied the update: this one still shows the old files.
    if (hadController) set({ status: 'ready' })
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate({ quiet: true })
  })
}

const settled = (worker) =>
  new Promise((resolve) => {
    if (worker.state === 'installed' || worker.state === 'redundant' || worker.state === 'activated') return resolve()
    const timer = setTimeout(resolve, 30000)
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' || worker.state === 'redundant' || worker.state === 'activated') {
        clearTimeout(timer)
        resolve()
      }
    })
  })

/**
 * Looks for a new version. `quiet` checks (coming back to the app) are rate
 * limited and never show "checking" or "up to date".
 */
export async function checkForUpdate({ quiet = false } = {}) {
  if (!registration || state.status === 'ready' || state.status === 'checking') return state.status
  if (quiet && Date.now() - lastCheck < CHECK_EVERY_MS) return state.status
  lastCheck = Date.now()
  if (!quiet) set({ status: 'checking' })
  try {
    await registration.update()
    const worker = registration.installing || registration.waiting
    if (worker) {
      await settled(worker)
      if (registration.waiting) await onWaiting(registration.waiting)
      else if (!quiet && state.status === 'checking') set({ status: 'latest' })
    } else if (!quiet) set({ status: 'latest' })
  } catch (err) {
    if (!quiet) set({ status: 'error' })
    else logError('sw', err, 'update check failed')
  }
  return state.status
}

/** Switches to the waiting version and reloads. Never call it during a focus block: a reload fails the block. */
export function applyUpdate() {
  try {
    sessionStorage.setItem(UPDATED_FLAG, '1')
  } catch {
    // Private mode: the "updated" confirmation is skipped, nothing else.
  }
  const waiting = registration?.waiting
  if (!waiting) return window.location.reload()
  reloadOnTakeover = true
  waiting.postMessage({ type: 'SKIP_WAITING' })
  // If the takeover never arrives (a stuck worker), reload anyway: the network-first shell brings the new files.
  setTimeout(() => window.location.reload(), 4000)
}

/** True once, on the first load after applyUpdate(). */
export function consumeJustUpdated() {
  try {
    if (sessionStorage.getItem(UPDATED_FLAG) !== '1') return false
    sessionStorage.removeItem(UPDATED_FLAG)
    return true
  } catch {
    return false
  }
}
