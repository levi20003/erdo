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
    return (
      <main role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6 py-10 text-zinc-200">
        <span className="grid size-14 place-items-center rounded-2xl bg-rose/15 text-rose">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
        </span>
        <h1 className="font-display text-2xl font-bold text-zinc-50">{t.crash.title}</h1>
        <p className="text-sm leading-relaxed text-zinc-400">{t.crash.body}</p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary min-h-12">
            {t.crash.reload}
          </button>
          <button type="button" onClick={this.downloadEverything} className="btn-ghost min-h-12">
            {t.crash.download}
          </button>
          <button type="button" onClick={this.reset} className="min-h-11 rounded-xl text-sm font-bold text-rose transition hover:bg-zinc-900">
            {t.crash.reset}
          </button>
        </div>
      </main>
    )
  }
}
