import { useRef } from 'react'
import { downloadBlob, fileDate } from '../../lib/download'
import { buildBackup, buildCsv, parseBackup } from '../../lib/exportData'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useToast } from '../toast/ToastProvider'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import ListRow from '../ui/ListRow'

/** Your data: backup, spreadsheet export, restore. Everything is a file on the device; nothing is uploaded. */
export default function DataCard({ className = '' }) {
  const { state, actions } = useAppStore()
  const { push } = useToast()
  const fileRef = useRef(null)

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

  const down = <Icon name="download" size={17} className="text-zinc-500" />
  return (
    <Card title={t.settings.data} icon={<Icon name="download" size={14} />} className={className}>
      <p className="hint -mt-1 mb-2">{t.settings.dataHint}</p>
      <div className="flex flex-col divide-y divide-zinc-800">
        <ListRow icon="download" title={t.settings.exportJson} description={t.settings.exportJsonHint} onClick={exportJson} right={down} />
        <ListRow icon="table" title={t.settings.exportCsv} description={t.settings.exportCsvHint} onClick={exportCsv} disabled={!state.sessions.length} right={down} />
        <ListRow icon="upload" tone="accent" title={t.settings.import} description={t.settings.importHint} onClick={() => fileRef.current?.click()} />
      </div>
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
    </Card>
  )
}
