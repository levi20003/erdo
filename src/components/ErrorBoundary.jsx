import { Component } from 'react'
import { STORAGE_KEY } from '../lib/config'
import { downloadBlob, fileDate } from '../lib/download'
import { logError, readErrorLog } from '../lib/errorLog'
import { BACKUP_PREFIX, readRaw } from '../lib/storage'
import { t } from '../lib/strings'

/**
 * Last line of defence: a render error shows a recovery screen instead of a
 * blank page. It deliberately avoids the app store (which may be what broke)
 * and reads localStorage directly.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    logError('render', error, info?.componentStack?.split('\n').slice(1, 3).join(' '))
  }

  downloadEverything = () => {
    const payload = { app: 'FocusGrove', exportedAt: new Date().toISOString(), savedState: readRaw(), errorLog: readErrorLog() }
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `focusgrove-mentes-${fileDate()}.json`)
  }

  reset = () => {
    if (!window.confirm(t.crash.resetConfirm)) return
    try {
      const raw = readRaw()
      if (raw) localStorage.setItem(`${BACKUP_PREFIX}before-reset-${Date.now()}`, raw)
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage unavailable: a reload is all we can do.
    }
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    const button = 'rounded-xl px-4 py-3 text-sm font-medium transition sm:py-2.5'
    return (
      <main role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6 py-10 text-zinc-200">
        <h1 className="text-xl font-semibold text-zinc-50">{t.crash.title}</h1>
        <p className="text-sm leading-relaxed text-zinc-400">{t.crash.body}</p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => window.location.reload()} className={`${button} bg-olive text-sand-100 hover:bg-olive-400`}>
            {t.crash.reload}
          </button>
          <button type="button" onClick={this.downloadEverything} className={`${button} border border-zinc-800 text-zinc-300 hover:border-zinc-700`}>
            {t.crash.download}
          </button>
          <button type="button" onClick={this.reset} className={`${button} text-[#e2b8bc] hover:bg-zinc-900`}>
            {t.crash.reset}
          </button>
        </div>
      </main>
    )
  }
}
