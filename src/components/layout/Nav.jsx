import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'

export const NAV_ITEMS = [
  { id: 'focus', icon: 'home' },
  { id: 'forest', icon: 'tree' },
  { id: 'stats', icon: 'chart' },
  { id: 'settings', icon: 'user' },
]

/** Phone: the design's bark-brown tab bar, within thumb reach; a soft pill slides to the active tab. */
export function BottomNav({ tab, onChange }) {
  const vibrate = useAppStore().state.prefs.sound.vibrate
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav
      aria-label={t.nav.label}
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-[1.75rem] bg-[linear-gradient(180deg,rgb(var(--tab-from)),rgb(var(--tab-to)))] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_-12px_rgb(0_0_0/0.45)] md:hidden"
    >
      <div className="relative mx-auto max-w-md">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-2xl bg-white/15 ring-1 ring-inset ring-white/15 transition-transform duration-300 ease-spring"
          style={{ width: '25%', transform: `translateX(${index * 100}%)` }}
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
                  className={`flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold transition-colors duration-200 ${
                    active ? 'text-lime' : 'text-[#f1e9e4]/75 active:text-white'
                  }`}
                >
                  <Icon name={icon} size={22} strokeWidth={active ? 2.3 : 2} className={`transition-transform duration-300 ease-spring ${active ? '-translate-y-px scale-110' : ''}`} />
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

/** Tablet and desktop: the same tabs inside the green header. */
export function HeaderNav({ tab, onChange }) {
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav aria-label={t.nav.label} className="hidden md:block">
      <ul className="relative grid grid-cols-4 rounded-2xl bg-black/15 p-1 ring-1 ring-inset ring-white/15 backdrop-blur">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-xl bg-white shadow-card transition-transform duration-300 ease-spring"
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
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                  active ? 'text-[#2d7749]' : 'text-white/85 hover:text-white'
                }`}
              >
                <Icon name={icon} size={16} />
                {t.nav[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
