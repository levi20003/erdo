import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Banners from './components/Banners'
import SessionCelebration from './components/celebration/SessionCelebration'
import CategoryManager from './components/categories/CategoryManager'
import DailyChart from './components/dashboard/DailyChart'
import StreakTile from './components/dashboard/StreakTile'
import TotalTile from './components/dashboard/TotalTile'
import WeeklyChart from './components/dashboard/WeeklyChart'
import FeedbackPrompt from './components/feedback/FeedbackPrompt'
import { consumeSettingsReopen } from './components/settings/reopen'
import SessionToasts from './components/toast/SessionToasts'
import FocusView from './components/timer/FocusView'
import TimerCard from './components/timer/TimerCard'
import Icon from './components/ui/Icon'
import Sheet from './components/ui/Sheet'
import { useFullscreen } from './hooks/useFullscreen'
import { usePomodoro } from './hooks/usePomodoro'
import { useToday } from './hooks/useToday'
import { computeInsights } from './lib/insights'
import { lazyScreen } from './lib/lazy'
import { completed, computeStreak, totalMinutes } from './lib/stats'
import { t } from './lib/strings'
import { useAppStore } from './store/AppStore'

// Opened on demand, so they stay out of the initial bundle.
const SettingsPanel = lazyScreen(() => import('./components/settings/SettingsPanel'))
const SharePanel = lazyScreen(() => import('./components/share/SharePanel'))
const sheetFallback = <div className="h-40 animate-pulse rounded-2xl bg-zinc-800/40" />

export default function App() {
  const { sessions } = useAppStore().state
  const pomodoro = usePomodoro() // single timer instance shared by the card and Focus View
  const focusView = useFullscreen()
  const today = useToday()
  const [settingsOpen, setSettingsOpen] = useState(consumeSettingsReopen)
  const [shareOpen, setShareOpen] = useState(false)
  const openShare = useCallback(() => setShareOpen(true), [])
  // Contextual focus: once a block starts, everything but the timer steps away.
  const focusMode = pomodoro.timer?.phase === 'focus'

  useEffect(() => {
    if (!focusMode) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [focusMode])

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
      {/* The dashboard is inert behind Focus View: no focus, clicks or screen-reader access. */}
      <div
        inert={focusView.open ? '' : undefined}
        className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 overflow-x-clip px-3 pb-6 pt-[max(1rem,env(safe-area-inset-top))] min-[400px]:px-4 sm:px-6"
      >
        {!focusMode && (
          <header className="flex items-center gap-3 px-1 py-2">
            <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="size-10 rounded-xl ring-1 ring-zinc-800" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                Focus<span className="text-sand">Grove</span>
              </h1>
              <p className="truncate text-xs text-zinc-500">{t.appTagline}</p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t.settings.open}
              title={t.settings.open}
              className="ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
            >
              <Icon name="settings" size={17} />
            </button>
          </header>
        )}

        {!focusMode && <Banners />}
        {/* Never during focus, and not over the completion celebration. */}
        {!focusMode && !pomodoro.celebrating && <FeedbackPrompt />}

        <main
          className={
            focusMode
              ? 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-2'
              : 'grid min-w-0 grid-cols-1 gap-3 min-[400px]:gap-4 md:grid-cols-4'
          }
        >
          <TimerCard
            pomodoro={pomodoro}
            onFullscreen={focusView.enter}
            className={focusMode ? 'min-h-[min(44rem,calc(100dvh-2.5rem))]' : 'md:col-span-2 md:row-span-2'}
          />
          {!focusMode && (
            <>
              <StreakTile streak={stats.streak} className="animate-fade-up" />
              <TotalTile
                totalMin={stats.totalMin}
                completedCount={stats.completedCount}
                failedCount={stats.failedCount}
                insights={stats.insights}
                onShare={openShare}
                className="animate-fade-up"
              />
              <DailyChart className="animate-fade-up md:col-span-2" />
              <WeeklyChart className="animate-fade-up md:col-span-2" />
              <CategoryManager className="animate-fade-up md:col-span-2" />
            </>
          )}
        </main>

        {!focusMode && <footer className="mt-auto text-center text-xs text-zinc-600">{t.footer}</footer>}
      </div>

      {focusView.open && <FocusView pomodoro={pomodoro} onExit={focusView.exit} />}
      <SessionCelebration celebrating={pomodoro.celebrating} />
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t.settings.title}>
        <Suspense fallback={sheetFallback}>
          <SettingsPanel />
        </Suspense>
      </Sheet>
      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} title={t.share.title}>
        <Suspense fallback={sheetFallback}>
          <SharePanel />
        </Suspense>
      </Sheet>
      <SessionToasts />
    </>
  )
}
