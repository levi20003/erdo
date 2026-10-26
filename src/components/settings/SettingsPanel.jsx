import { useRef, useState } from 'react'
import { APP_VERSION } from '../../lib/config'
import { downloadBlob, fileDate } from '../../lib/download'
import { clearErrorLog, readErrorLog } from '../../lib/errorLog'
import { buildBackup, buildCsv, parseBackup } from '../../lib/exportData'
import { LANGUAGES, getLanguage, t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useToast } from '../toast/ToastProvider'
import { markSettingsReopen } from './reopen'

const section = 'flex flex-col gap-3 border-t border-zinc-800 pt-5 first:border-t-0 first:pt-0'
const heading = 'text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500'
const hint = 'text-xs leading-relaxed text-zinc-500'
const button =
  'rounded-xl border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800/60 disabled:opacity-40'

/** Contents of the Settings sheet: language, data backup/export/restore, error log, about. Lazy-loaded. */
export default function SettingsPanel() {
  const { state, actions } = useAppStore()
  const { push } = useToast()
  const fileRef = useRef(null)
  const [errorCount, setErrorCount] = useState(() => readErrorLog().length)
  const lang = getLanguage()

  const exportJson = () =>
    downloadBlob(new Blob([JSON.stringify(buildBackup(state), null, 2)], { type: 'application/json' }), `focusgrove-mentes-${fileDate()}.json`)

  const exportCsv = () => downloadBlob(new Blob([buildCsv(state)], { type: 'text/csv;charset=utf-8' }), `focusgrove-munkamenetek-${fileDate()}.csv`)

  const importFile = async (file) => {
    const imported = parseBackup(await file.text())
    if (!imported) return push(t.importResult.invalid, 'danger')
    const sessionIds = new Set(state.sessions.map((s) => s.id))
    const catIds = new Set(state.categories.map((c) => c.id))
    const newSessions = imported.sessions.filter((s) => !sessionIds.has(s.id)).length
    const newCategories = imported.categories.filter((c) => !catIds.has(c.id)).length
    if (!newSessions && !newCategories) return push(t.importResult.nothing)
    actions.importMerge(imported)
    push(t.importResult.done(newSessions, newCategories), 'success')
  }

  const downloadErrors = () => {
    const payload = { app: 'FocusGrove', kind: 'error-log', appVersion: APP_VERSION, exportedAt: new Date().toISOString(), entries: readErrorLog() }
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `focusgrove-hibanaplo-${fileDate()}.json`)
  }

  return (
    <div className="flex flex-col gap-5">
      <section className={section}>
        <h3 className={heading}>{t.settings.language}</h3>
        <div role="radiogroup" aria-label={t.settings.language} className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="radio"
              lang={code}
              aria-checked={lang === code}
              onClick={() => {
                if (code === lang) return
                markSettingsReopen()
                actions.setPref('lang', code)
              }}
              className={`${button} ${lang === code ? 'border-olive-400 bg-olive-900/50' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className={section}>
        <h3 className={heading}>{t.settings.data}</h3>
        <p className={hint}>{t.settings.dataHint}</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={exportJson} className={button}>
            {t.settings.exportJson}
          </button>
          <button type="button" onClick={exportCsv} className={button} disabled={!state.sessions.length}>
            {t.settings.exportCsv}
          </button>
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} className={button}>
          {t.settings.import}
        </button>
        <p className={hint}>{t.settings.importHint}</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          data-testid="import-input"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) importFile(file)
          }}
        />
      </section>

      <section className={section}>
        <h3 className={heading}>{t.settings.errorLog}</h3>
        <p className={hint}>{t.settings.errorLogHint(errorCount)}</p>
        {errorCount > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={downloadErrors} className={button}>
              {t.settings.errorLogDownload}
            </button>
            <button
              type="button"
              onClick={() => {
                clearErrorLog()
                setErrorCount(0)
              }}
              className={button}
            >
              {t.settings.errorLogClear}
            </button>
          </div>
        )}
      </section>

      <section className={section}>
        <h3 className={heading}>{t.settings.about}</h3>
        <p className="text-sm text-zinc-300">{t.settings.version(APP_VERSION)}</p>
        <p className={hint}>{t.settings.privacy}</p>
      </section>
    </div>
  )
}
