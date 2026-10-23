import { useMemo } from 'react'
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
import { completed, computeStreak, totalMinutes } from './lib/stats'
import { t } from './lib/strings'
import { useAppStore } from './store/AppStore'

export default function App() {
  const { sessions } = useAppStore().state
  const pomodoro = usePomodoro() // single timer instance shared by the card and Focus View
  const focusView = useFullscreen()

  const stats = useMemo(() => {
    const done = completed(sessions).length
    return {
      streak: computeStreak(sessions),
      totalMin: totalMinutes(sessions),
      completedCount: done,
      failedCount: sessions.length - done,
    }
  }, [sessions])

  return (
    <>
      {/* The dashboard is inert behind Focus View: no focus, clicks or screen-reader access. */}
      <div
        inert={focusView.open ? '' : undefined}
        className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 overflow-x-clip px-3 pb-6 pt-[max(1rem,env(safe-area-inset-top))] min-[400px]:px-4 sm:px-6"
      >
        <header className="flex items-center gap-3 px-1 py-2">
          <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="size-10 rounded-xl ring-1 ring-zinc-800" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
              Focus<span className="text-sand">Grove</span>
            </h1>
            <p className="truncate text-xs text-zinc-500">{t.appTagline}</p>
          </div>
        </header>

        <Banners />

        <main className="grid min-w-0 grid-cols-1 gap-3 min-[400px]:gap-4 md:grid-cols-4">
          <TimerCard pomodoro={pomodoro} onFullscreen={focusView.enter} className="md:col-span-2 md:row-span-2" />
          <StreakTile streak={stats.streak} />
          <TotalTile totalMin={stats.totalMin} completedCount={stats.completedCount} failedCount={stats.failedCount} />
          <DailyChart className="md:col-span-2" />
          <WeeklyChart className="md:col-span-2" />
          <CategoryManager className="md:col-span-2" />
        </main>

        <footer className="mt-auto text-center text-xs text-zinc-600">{t.footer}</footer>
      </div>

      {focusView.open && <FocusView pomodoro={pomodoro} onExit={focusView.exit} />}
      <SessionCelebration celebrating={pomodoro.celebrating} />
      <SessionToasts />
    </>
  )
}
