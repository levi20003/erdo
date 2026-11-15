import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useUpdate } from '../hooks/useUpdate'
import { applyUpdate } from '../lib/updates'
import { useOnline } from '../hooks/useOnline'
import { t } from '../lib/strings'
import { useAppStore, useFocusLock } from '../store/AppStore'
import Icon from './ui/Icon'

/** Update, storage and offline notices and the install banner. All hidden by the distraction lock. */
export default function Banners() {
  const locked = useFocusLock()
  const online = useOnline()
  const { canInstall, install, dismiss } = useInstallPrompt()
  const { storage } = useAppStore()
  const update = useUpdate()
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

  const note = 'flex animate-fade-up items-center gap-3 rounded-2xl border bg-zinc-900 py-2.5 pl-2.5 pr-4 text-sm leading-snug shadow-card'
  const tile = 'grid size-9 shrink-0 place-items-center rounded-xl'
  return (
    <>
      {/* Never shown during a focus block (this component returns null then): updating reloads the page. */}
      {update.status === 'ready' && (
        <div role="status" className="leaf-card flex animate-fade-up items-center gap-3 py-2.5 pl-2.5 pr-2.5 text-sm">
          <span className={`${tile} bg-white/20`}>
            <Icon name="sparkle" size={17} />
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <span className="block font-bold">{t.update.available}</span>
            <span className="block text-xs text-white/85">{t.update.availableVersion(update.version)}</span>
          </span>
          <button type="button" onClick={applyUpdate} className="press min-h-10 rounded-xl bg-white px-3.5 font-display text-xs font-bold uppercase tracking-wide text-[#2d7749] shadow-sm">
            {t.update.apply}
          </button>
        </div>
      )}
      {storageNotice && (
        <div role={storageNotice.alert ? 'alert' : 'status'} className={`${note} ${storageNotice.alert ? 'border-rose/40 text-zinc-200' : 'border-zinc-800 text-zinc-400'}`}>
          <span className={`${tile} ${storageNotice.alert ? 'bg-rose/15 text-rose' : 'bg-zinc-800 text-zinc-400'}`}>
            <Icon name={storageNotice.alert ? 'alert' : 'info'} size={17} />
          </span>
          {storageNotice.text}
        </div>
      )}
      {!online && (
        <div className={`${note} border-zinc-800 text-zinc-400`}>
          <span className={`${tile} bg-zinc-800 text-zinc-400`}>
            <Icon name="offline" size={17} />
          </span>
          {t.toast.offline}
        </div>
      )}
      {canInstall && (
        <div className="leaf-card flex animate-fade-up items-center gap-3 py-2.5 pl-2.5 pr-2 text-sm font-bold">
          <span className={`${tile} bg-white/20`}>
            <Icon name="download" size={17} />
          </span>
          <span className="min-w-0 flex-1 leading-snug">{t.toast.installTitle}</span>
          <button type="button" onClick={install} className="press min-h-9 rounded-xl bg-white px-3.5 font-display text-xs font-bold uppercase tracking-wide text-[#2d7749] shadow-sm">
            {t.toast.install}
          </button>
          <button type="button" onClick={dismiss} aria-label={t.cancel} className="grid size-9 place-items-center rounded-xl text-white/80 hover:bg-white/15 hover:text-white">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </>
  )
}
