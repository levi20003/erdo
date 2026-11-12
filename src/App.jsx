import { Suspense, useCallback, useMemo, useState } from 'react'
import Banners from './components/Banners'
import SessionCelebration from './components/celebration/SessionCelebration'
import FeedbackPrompt from './components/feedback/FeedbackPrompt'
import TodayStrip from './components/focus/TodayStrip'
import { BottomNav, HeaderNav } from './components/layout/Nav'
import { AmbientPicker } from './components/sound/SoundControls'
import SessionToasts from './components/toast/SessionToasts'
import FocusView from './components/timer/FocusView'
import TimerCard from './components/timer/TimerCard'
import Sheet, { useRetained } from './components/ui/Sheet'
import { useFullscreen } from './hooks/useFullscreen'
import { usePomodoro } from './hooks/usePomodoro'
import { useTab } from './hooks/useTab'
import { useToday } from './hooks/useToday'
import { computeInsights } from './lib/insights'
import { lazyScreen } from './lib/lazy'
import { completed, computeStreak, totalMinutes } from './lib/stats'
import { t } from './lib/strings'
import { useAppStore } from './store/AppStore'

// Everything but the Focus screen loads on demand (the service worker still precaches it for offline use).
const SharePanel = lazyScreen(() => import('./components/share/SharePanel'))
const ForestView = lazyScreen(() => import('./components/forest/ForestView'))
const StatsView = lazyScreen(() => import('./components/stats/StatsView'))
const SettingsView = lazyScreen(() => import('./components/settings/SettingsView'))
const Onboarding = lazyScreen(() => import('./components/onboarding/Onboarding'))
const sheetFallback = <div className="h-40 animate-pulse rounded-2xl bg-zinc-800/40" />

/*
 * Four screens — Focus, My forest, Stats, Settings — behind a bottom tab bar on
 * phones and header tabs on larger screens. During a focus block everything but
 * the timer steps away (no header, no tabs).
 */
export default function App() {
  const { state } = useAppStore()
  const { sessions } = state
  const pomodoro = usePomodoro() // single timer instance shared by the card and Focus View
  const focusView = useFullscreen()
  const today = useToday()
  const [tab, setTab] = useTab()
  const [share, setShare] = useState(null) // null | { scope }
  const [soundOpen, setSoundOpen] = useState(false)
  const shownShare = useRetained(share)

  const focusMode = pomodoro.timer?.phase === 'focus'
  const onboarding = !state.prefs.onboarded && !focusMode
  const screen = focusMode ? 'focus' : tab
  const goFocus = useCallback(() => setTab('focus'), [setTab])
  const openShareAll = useCallback(() => setShare({ scope: null }), [])
  const openShare = useCallback((scope) => setShare({ scope }), [])

  const stats = useMemo(() => {
    const done = completed(sessions).length
    return {
      streak: computeStreak(sessions),
      totalMin: totalMinutes(sessions),
      completedCount: done,
      failedCount: sessions.length - done,
      insights: computeInsights(sessions),
    }
  }, [sessions, today]) // eslint-disable-line react-hooks/exhaustive-deps -- `today` re-derives the streak at midnight

  return (
    <>
      {/* Inert behind Focus View and the introduction: no focus, clicks or screen-reader access. */}
      <div
        inert={focusView.open || onboarding ? '' : undefined}
        className={`mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 overflow-x-clip px-3 pt-[max(0.75rem,env(safe-area-inset-top))] min-[400px]:px-4 sm:px-6 ${
          focusMode ? 'pb-4' : 'pb-28 md:pb-8'
        }`}
      >
        {!focusMode && (
          <header className="flex items-center gap-3 px-1 py-1.5">
            <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="size-9 rounded-xl ring-1 ring-zinc-800" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-tight tracking-tight text-zinc-100">
                Focus<span className="text-sand">Grove</span>
              </h1>
              <p className="hidden truncate text-xs text-zinc-400 min-[400px]:block">{t.appTagline}</p>
            </div>
            <HeaderNav tab={screen} onChange={setTab} />
          </header>
        )}

        {!focusMode && <Banners />}
        {/* Never during focus or over the celebration; only where it doesn't interrupt a task. */}
        {!focusMode && !pomodoro.celebrating && (screen === 'focus' || screen === 'stats') && <FeedbackPrompt />}

        <main key={screen} className={focusMode ? 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center' : 'min-w-0 animate-fade-in'}>
          {screen === 'focus' && (
            <div
              className={
                focusMode
                  ? 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center'
                  : 'mx-auto grid w-full max-w-xl gap-3 lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-4'
              }
            >
              <TimerCard
                pomodoro={pomodoro}
                onFullscreen={focusView.enter}
                onSound={() => setSoundOpen(true)}
                className={focusMode ? 'min-h-[min(44rem,calc(100dvh-2rem))]' : ''}
              />
              {!focusMode && <TodayStrip today={today} onOpen={setTab} className="lg:sticky lg:top-4" />}
            </div>
          )}
          <Suspense fallback={sheetFallback}>
            {screen === 'forest' && <ForestView onStartFocus={goFocus} onShare={openShare} />}
            {screen === 'stats' && <StatsView stats={stats} onShare={openShareAll} onStartFocus={goFocus} />}
            {screen === 'settings' && (
              <>
                <SettingsView />
                <p className="mt-6 text-center text-xs text-zinc-400">{t.footer}</p>
              </>
            )}
          </Suspense>
        </main>
      </div>

      {!focusMode && !onboarding && <BottomNav tab={screen} onChange={setTab} />}
      {focusView.open && <FocusView pomodoro={pomodoro} onExit={focusView.exit} />}
      <SessionCelebration celebrating={pomodoro.celebrating} />
      <Sheet open={soundOpen} onClose={() => setSoundOpen(false)} title={t.sound.title}>
        <AmbientPicker />
      </Sheet>
      <Sheet open={share !== null} onClose={() => setShare(null)} title={t.share.title}>
        <Suspense fallback={sheetFallback}>{shownShare && <SharePanel scope={shownShare.scope} />}</Suspense>
      </Sheet>
      {onboarding && (
        <Suspense fallback={<div className="fixed inset-0 z-[70] bg-zinc-950" />}>
          <Onboarding onDone={goFocus} />
        </Suspense>
      )}
      <SessionToasts />
    </>
  )
}
