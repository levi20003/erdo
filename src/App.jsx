import { Suspense, useCallback, useMemo, useState } from 'react'
import Banners from './components/Banners'
import SessionCelebration from './components/celebration/SessionCelebration'
import ChallengeSheet from './components/challenge/ChallengeSheet'
import InviteSheet from './components/challenge/InviteSheet'
import { useChallengeInbox } from './components/challenge/useChallengeInbox'
import FeedbackPrompt from './components/feedback/FeedbackPrompt'
import FocusSide from './components/focus/FocusSide'
import GoalSheet from './components/focus/GoalSheet'
import CategorySheet from './components/focus/CategorySheet'
import SummaryCard from './components/focus/SummaryCard'
import Hero from './components/layout/Hero'
import { BottomNav } from './components/layout/Nav'
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
const sheetFallback = <div className="h-40 animate-pulse rounded-3xl bg-zinc-800/40" />

/*
 * Four screens — Focus, My forest, Stats, Settings — behind a floating tab bar on
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
  const [goalOpen, setGoalOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [challenge, setChallenge] = useState(undefined) // undefined: closed · null: new · object: send score
  const shownShare = useRetained(share)
  const shownChallenge = useRetained(challenge === undefined ? undefined : { c: challenge })
  const { invite, closeInvite } = useChallengeInbox()

  const focusMode = pomodoro.timer?.phase === 'focus'
  const onboarding = !state.prefs.onboarded && !focusMode
  const screen = focusMode ? 'focus' : tab
  const goFocus = useCallback(() => setTab('focus'), [setTab])
  const openShareAll = useCallback(() => setShare({ scope: null }), [])
  const openShare = useCallback((scope) => setShare({ scope }), [])
  const openGoal = useCallback(() => setGoalOpen(true), [])
  const openCategories = useCallback(() => setCategoriesOpen(true), [])
  const openChallenge = useCallback((c) => setChallenge(c), [])

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
      <div inert={focusView.open || onboarding ? '' : undefined} className="min-h-dvh overflow-x-clip">
        {!focusMode && <Hero screen={screen} onTab={setTab} />}
        <div
          className={`relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 min-[400px]:px-4 sm:px-6 ${
            focusMode ? 'min-h-dvh pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]' : '-mt-12 pb-32 md:pb-10'
          }`}
        >
          {!focusMode && <Banners />}
          {/* Only on Stats: on the Focus screen it would push the Start button below the fold on phones. */}
          {!focusMode && !pomodoro.celebrating && screen === 'stats' && <FeedbackPrompt />}

          <main key={screen} className={focusMode ? 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center' : 'min-w-0 animate-fade-up'}>
            {screen === 'focus' && (
              <div
                className={
                  focusMode
                    ? 'mx-auto flex w-full max-w-xl flex-1 flex-col justify-center'
                    : 'mx-auto grid w-full max-w-xl gap-4 lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start'
                }
              >
                <div className="flex min-w-0 flex-col gap-4">
                  {!focusMode && <SummaryCard onCategories={openCategories} onGoal={openGoal} />}
                  <TimerCard
                    pomodoro={pomodoro}
                    onFullscreen={focusView.enter}
                    onSound={() => setSoundOpen(true)}
                    className={focusMode ? 'min-h-[min(46rem,calc(100dvh-2rem))] justify-center' : ''}
                  />
                </div>
                {!focusMode && <FocusSide onOpen={setTab} onChallenge={openChallenge} className="lg:sticky lg:top-4 lg:pt-14" />}
              </div>
            )}
            <Suspense fallback={sheetFallback}>
              {screen === 'forest' && <ForestView onStartFocus={goFocus} onShare={openShare} />}
              {screen === 'stats' && <StatsView stats={stats} onShare={openShareAll} onStartFocus={goFocus} onChallenge={openChallenge} onGoal={openGoal} />}
              {screen === 'settings' && (
                <>
                  <SettingsView onGoal={openGoal} />
                  <p className="mt-6 text-center text-xs text-zinc-500">{t.footer}</p>
                </>
              )}
            </Suspense>
          </main>
        </div>
      </div>

      {!focusMode && !onboarding && <BottomNav tab={screen} onChange={setTab} />}
      {focusView.open && <FocusView pomodoro={pomodoro} onExit={focusView.exit} />}
      <SessionCelebration celebrating={pomodoro.celebrating} />
      <Sheet open={soundOpen} onClose={() => setSoundOpen(false)} title={t.sound.title}>
        <AmbientPicker />
      </Sheet>
      <GoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} />
      <CategorySheet open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <ChallengeSheet open={challenge !== undefined} onClose={() => setChallenge(undefined)} challenge={shownChallenge?.c ?? null} />
      <InviteSheet invite={onboarding ? null : invite} onClose={closeInvite} onAccepted={() => setTab('stats')} />
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
