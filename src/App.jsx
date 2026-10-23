import { useEffect, useMemo } from 'react'
import Banners from './components/Banners'
import SessionCelebration from './components/celebration/SessionCelebration'
import CategoryManager from './components/categories/CategoryManager'
import DailyChart from './components/dashboard/DailyChart'
import StreakTile from './components/dashboard/StreakTile'
import TotalTile from './components/dashboard/TotalTile'
import WeeklyChart from './components/dashboard/WeeklyChart'
import SessionToasts from './components/toast/SessionToasts'
import FocusView from './components/timer/FocusView'
import TimerCard from './components/timer/TimerCard'
import { useFullscreen } from './hooks/useFullscreen'
import { usePomodoro } from './hooks/usePomodoro'
import { useToday } from './hooks/useToday'
import { completed, computeStreak, totalMinutes } from './lib/stats'
import { t } from './lib/strings'
import { useAppStore } from './store/AppStore'

export default function App() {
  const { sessions } = useAppStore().state
  const pomodoro = usePomodoro() // single timer instance shared by the card and Focus View
  const focusView = useFullscreen()
  const today = useToday()
  // Contextual focus: once a block starts, everything but the timer steps away.
  const focusMode = pomodoro.timer?.phase === 'focus'

  useEffect(() => {
    if (focusMode) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [focusMode])

  const stats = useMemo(() => {
    const done = completed(sessions).length
    return {
      streak: computeStreak(sessions),
      totalMin: totalMinutes(sessions),
      completedCount: done,
      failedCount: sessions.length - done,
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
          </header>
        )}

        {!focusMode && <Banners />}

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
              <TotalTile totalMin={stats.totalMin} completedCount={stats.completedCount} failedCount={stats.failedCount} className="animate-fade-up" />
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
      <SessionToasts />
    </>
  )
}
