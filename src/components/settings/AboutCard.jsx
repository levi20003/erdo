import { useState } from 'react'
import { useUpdate } from '../../hooks/useUpdate'
import { applyUpdate, checkForUpdate } from '../../lib/updates'
import { APP_VERSION, FEEDBACK_URL } from '../../lib/config'
import { downloadBlob, fileDate } from '../../lib/download'
import { clearErrorLog, readErrorLog } from '../../lib/errorLog'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import ListRow from '../ui/ListRow'

/** About: version and privacy, replay the introduction, write a suggestion, the local error log. */
export default function AboutCard({ className = '' }) {
  const { actions } = useAppStore()
  const [errorCount, setErrorCount] = useState(() => readErrorLog().length)
  const update = useUpdate()
  const ready = update.status === 'ready'
  const updateLine =
    update.status === 'checking'
      ? t.update.checking
      : update.status === 'latest'
        ? t.update.latest
        : update.status === 'error'
          ? t.update.error
          : ready
            ? t.update.availableVersion(update.version)
            : t.update.current(APP_VERSION)

  const downloadErrors = () => {
    const payload = { app: 'FocusGrove', kind: 'error-log', appVersion: APP_VERSION, exportedAt: new Date().toISOString(), entries: readErrorLog() }
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `focusgrove-hibanaplo-${fileDate()}.json`)
  }

  return (
    <Card title={t.settings.about} icon={<Icon name="info" size={14} />} className={className}>
      <div className="flex flex-col divide-y divide-zinc-800">
        <ListRow icon="sprout" title={t.settings.version(APP_VERSION)} description={t.settings.privacy} className="pt-0" />
        {update.supported && (
          <ListRow
            icon={ready ? 'sparkle' : update.status === 'latest' ? 'check' : 'refresh'}
            tone={ready ? 'accent' : update.status === 'error' ? 'danger' : 'green'}
            title={ready ? t.update.applyNow : t.update.check}
            description={<span aria-live="polite">{updateLine}</span>}
            disabled={update.status === 'checking'}
            onClick={ready ? applyUpdate : () => checkForUpdate()}
            right={update.status === 'checking' ? <Icon name="refresh" size={18} className="animate-spin text-zinc-500" /> : undefined}
          />
        )}
        <ListRow icon="play" tone="neutral" title={t.settings.replayIntro} onClick={actions.showOnboarding} />
        <ListRow icon="chat" tone="neutral" title={t.feedback.write} description={t.settings.feedbackHint} href={FEEDBACK_URL} />
        <ListRow
          icon="alert"
          tone={errorCount ? 'danger' : 'neutral'}
          title={t.settings.errorLog}
          description={t.settings.errorLogHint(errorCount)}
          className="pb-0"
          right={
            errorCount > 0 && (
              <span role="group" aria-label={t.settings.errorLogActions} className="flex shrink-0">
                <button type="button" onClick={downloadErrors} aria-label={t.settings.errorLogDownload} title={t.settings.errorLogDownload} className="icon-btn">
                  <Icon name="download" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearErrorLog()
                    setErrorCount(0)
                  }}
                  aria-label={t.settings.errorLogClear}
                  title={t.settings.errorLogClear}
                  className="icon-btn"
                >
                  <Icon name="trash" size={16} />
                </button>
              </span>
            )
          }
        />
      </div>
    </Card>
  )
}
