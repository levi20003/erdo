import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import { dayKey } from '../../lib/time'
import { useAppStore } from '../../store/AppStore'
import { Pines } from '../art/Shapes'
import Avatar from '../profile/Avatar'
import { useTheme } from '../ThemeRoot'
import Icon from '../ui/Icon'
import { HeaderNav } from './Nav'

// The tagline changes once a day, like a quote of the day.
const tagline = () => {
  const list = t.hero.taglines
  const n = [...dayKey()].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return list[n % list.length]
}

/**
 * The green header: greeting on Focus, the screen's name elsewhere, one quiet
 * line of context under it, and the profile avatar. The first card of each
 * screen overlaps its lower edge.
 */
export default function Hero({ screen, tab = screen, onTab }) {
  const { state, actions } = useAppStore()
  const theme = useTheme()
  const { level, title, completedCount } = useProgress()
  const { nickname, avatar } = state.prefs
  const heading = screen === 'focus' ? t.hero.hi(nickname) : t.nav[screen]
  const sub =
    screen === 'forest' ? t.hero.forest(completedCount) : screen === 'stats' ? t.hero.stats(level.level, title) : screen === 'settings' ? t.hero.settings : tagline()

  return (
    <header className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgb(var(--hero-from)),rgb(var(--hero-to)))] pb-[4.5rem] pt-[max(1.1rem,env(safe-area-inset-top))] text-white">
      <span aria-hidden="true" className="absolute -right-12 -top-20 -z-10 size-56 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-[rgb(var(--blob))] opacity-[0.18]" />
      <span aria-hidden="true" className="absolute -left-16 top-10 -z-10 size-40 rounded-full bg-white opacity-[0.05]" />
      <Pines fill="rgb(0 0 0 / 0.1)" className="absolute inset-x-0 bottom-0 -z-10 h-20 w-full" />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 key={screen} className="animate-fade-up truncate font-display text-[1.75rem] font-bold leading-tight tracking-tight">
            {heading}
          </h1>
          <p key={`${screen}-sub`} className="animate-fade-up truncate text-sm text-white/80 [animation-delay:60ms]">
            {sub}
          </p>
        </div>
        <HeaderNav tab={tab} onChange={onTab} />
        <button
          type="button"
          onClick={() => actions.setPref('theme', theme === 'dark' ? 'light' : 'dark')}
          aria-label={t.theme.toggle}
          title={t.theme.toggle}
          className="press grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/25"
        >
          <span key={theme} className="animate-pop-in">
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} />
          </span>
        </button>
        <button type="button" onClick={() => onTab('settings')} aria-label={t.hero.profile} className="press rounded-full">
          <Avatar id={avatar} size={48} />
        </button>
      </div>
    </header>
  )
}
