import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'

export const NAV_ITEMS = [
  { id: 'focus', icon: 'clock' },
  { id: 'forest', icon: 'tree' },
  { id: 'stats', icon: 'chart' },
  { id: 'settings', icon: 'settings' },
]

/** Phone: a floating tab bar within thumb reach; a pill slides to the active tab. */
export function BottomNav({ tab, onChange }) {
  const vibrate = useAppStore().state.prefs.sound.vibrate
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav aria-label={t.nav.label} className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="relative mx-auto max-w-md rounded-[1.6rem] border border-zinc-800/80 bg-zinc-900/85 p-1.5 shadow-lift backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-1.5 rounded-[1.2rem] bg-olive/20 ring-1 ring-inset ring-olive/40 transition-transform duration-300 ease-spring"
          style={{ width: 'calc((100% - 0.75rem) / 4)', transform: `translateX(${index * 100}%)` }}
        />
        <ul className="relative grid grid-cols-4">
          {NAV_ITEMS.map(({ id, icon }) => {
            const active = tab === id
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    haptic(vibrate)
                    onChange(id)
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-[1.2rem] text-[11px] font-medium transition-colors duration-200 ${
                    active ? 'text-olive-200' : 'text-zinc-500 active:text-zinc-300'
                  }`}
                >
                  <Icon name={icon} size={20} strokeWidth={active ? 2.1 : 1.8} className={`transition-transform duration-300 ease-spring ${active ? '-translate-y-px scale-110' : ''}`} />
                  {t.nav[id]}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** Tablet and desktop: the same tabs as a segmented control in the header. */
export function HeaderNav({ tab, onChange }) {
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav aria-label={t.nav.label} className="hidden md:block">
      <ul className="relative grid grid-cols-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1 shadow-card backdrop-blur">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-xl bg-zinc-800 transition-transform duration-300 ease-spring"
          style={{ width: 'calc((100% - 0.5rem) / 4)', transform: `translateX(${index * 100}%)` }}
        />
        {NAV_ITEMS.map(({ id, icon }) => {
          const active = tab === id
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors ${
                  active ? 'text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon name={icon} size={16} className={active ? 'text-sand' : ''} />
                {t.nav[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
