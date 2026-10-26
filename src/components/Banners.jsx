import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useOnline } from '../hooks/useOnline'
import { t } from '../lib/strings'
import { useAppStore, useFocusLock } from '../store/AppStore'
import Icon from './ui/Icon'

/** Offline notice and install banner. Both are hidden by the distraction lock. */
export default function Banners() {
  const locked = useFocusLock()
  const online = useOnline()
  const { canInstall, install, dismiss } = useInstallPrompt()
  const { storage } = useAppStore()
  // Problems (data can't be saved / was damaged) are alerts; upgrade notices are informational.
  const storageNotice =
    storage === 'failing' || storage === 'unavailable'
      ? { text: t.toast.storageFailing, alert: true }
      : storage === 'repaired'
        ? { text: t.toast.storageRepaired, alert: true }
        : storage === 'newer'
          ? { text: t.storageNewer, alert: false }
          : storage === 'migrated'
            ? { text: t.storageMigrated, alert: false }
            : null

  if (locked) return null

  return (
    <>
      {storageNotice && (
        <div
          role={storageNotice.alert ? 'alert' : 'status'}
          className={`flex animate-fade-up items-start gap-2 rounded-2xl border bg-zinc-900 px-4 py-2.5 text-xs leading-relaxed ${
            storageNotice.alert ? 'border-[#a8747a]/40 text-[#e2b8bc]' : 'border-zinc-800 text-zinc-400'
          }`}
        >
          <Icon name={storageNotice.alert ? 'alert' : 'info'} size={14} className="mt-0.5" /> {storageNotice.text}
        </div>
      )}
      {!online && (
        <div className="flex animate-fade-up items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-400">
          <Icon name="offline" size={14} /> {t.toast.offline}
        </div>
      )}
      {canInstall && (
        <div className="flex animate-fade-up items-center gap-3 rounded-2xl border border-olive/50 bg-olive-900/70 px-4 py-2.5 text-sm text-olive-200">
          <Icon name="download" size={16} />
          <span className="flex-1">{t.toast.installTitle}</span>
          <button type="button" onClick={install} className="rounded-lg bg-olive px-3 py-1 text-xs font-medium text-sand-100 hover:bg-olive-400">
            {t.toast.install}
          </button>
          <button type="button" onClick={dismiss} aria-label={t.cancel} className="text-olive-300 hover:text-olive-200">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </>
  )
}
