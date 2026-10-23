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
  const storageMessage =
    storage === 'failing' || storage === 'unavailable' ? t.toast.storageFailing : storage === 'repaired' ? t.toast.storageRepaired : null

  if (locked) return null

  return (
    <>
      {storageMessage && (
        <div role="alert" className="flex animate-fade-up items-start gap-2 rounded-2xl border border-[#a8747a]/40 bg-zinc-900 px-4 py-2.5 text-xs leading-relaxed text-[#e2b8bc]">
          <Icon name="alert" size={14} className="mt-0.5" /> {storageMessage}
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
