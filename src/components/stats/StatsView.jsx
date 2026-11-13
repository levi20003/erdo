import { t } from '../../lib/strings'
import ChallengesCard from '../challenge/ChallengesCard'
import DailyChart from '../dashboard/DailyChart'
import StreakTile from '../dashboard/StreakTile'
import TotalTile from '../dashboard/TotalTile'
import WeeklyChart from '../dashboard/WeeklyChart'
import ForestScene from '../growth/ForestScene'
import ProfileHero from '../profile/ProfileHero'
import Card from '../ui/Card'
import YearMap from './YearMap'

/** Statistics: level and headline numbers, streak, challenges, the year, the week, today, insights. */
export default function StatsView({ stats, onShare, onStartFocus, onChallenge }) {
  if (!stats.completedCount && !stats.failedCount) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Card>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="animate-float">
              <ForestScene item="tolgy" progress={0.3} backdrop={false} className="size-28" />
            </span>
            <h2 className="font-display text-2xl font-medium text-zinc-50">{t.statsEmpty.title}</h2>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{t.statsEmpty.body}</p>
            <button type="button" onClick={onStartFocus} className="btn-primary mt-2 min-h-12">
              {t.statsEmpty.cta}
            </button>
          </div>
        </Card>
        <ChallengesCard onOpen={onChallenge} />
      </div>
    )
  }
  const stagger = (i) => ({ animationDelay: `${i * 60}ms` })
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
      <ProfileHero totalMin={stats.totalMin} completedCount={stats.completedCount} bestStreak={stats.streak.longest} className="animate-fade-up md:col-span-2" />
      <div className="animate-fade-up" style={stagger(1)}>
        <StreakTile streak={stats.streak} className="h-full" />
      </div>
      <div className="animate-fade-up" style={stagger(2)}>
        <ChallengesCard onOpen={onChallenge} className="h-full" />
      </div>
      <div className="animate-fade-up md:col-span-2" style={stagger(3)}>
        <YearMap />
      </div>
      <div className="animate-fade-up" style={stagger(4)}>
        <WeeklyChart className="h-full" />
      </div>
      <div className="animate-fade-up" style={stagger(5)}>
        <DailyChart className="h-full" />
      </div>
      <div className="animate-fade-up md:col-span-2" style={stagger(6)}>
        <TotalTile completedCount={stats.completedCount} failedCount={stats.failedCount} insights={stats.insights} onShare={onShare} />
      </div>
    </div>
  )
}
