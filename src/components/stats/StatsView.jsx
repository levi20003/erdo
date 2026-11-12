import { t } from '../../lib/strings'
import DailyChart from '../dashboard/DailyChart'
import StreakTile from '../dashboard/StreakTile'
import TotalTile from '../dashboard/TotalTile'
import WeeklyChart from '../dashboard/WeeklyChart'
import ForestScene from '../growth/ForestScene'
import Card from '../ui/Card'

/** Statistics screen: streak, totals and insights, today, weekly history — or a friendly empty state. */
export default function StatsView({ stats, onShare, onStartFocus }) {
  if (!stats.completedCount && !stats.failedCount) {
    return (
      <Card className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <ForestScene item="tolgy" progress={0.3} backdrop={false} className="size-24" />
          <h2 className="text-lg font-semibold text-zinc-50">{t.statsEmpty.title}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{t.statsEmpty.body}</p>
          <button type="button" onClick={onStartFocus} className="mt-2 rounded-xl bg-olive px-5 py-3 text-sm font-medium text-sand-100 hover:bg-olive-400">
            {t.statsEmpty.cta}
          </button>
        </div>
      </Card>
    )
  }
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 min-[400px]:gap-4 md:grid-cols-2">
      <StreakTile streak={stats.streak} className="animate-fade-up" />
      <TotalTile
        totalMin={stats.totalMin}
        completedCount={stats.completedCount}
        failedCount={stats.failedCount}
        insights={stats.insights}
        onShare={onShare}
        className="animate-fade-up"
      />
      <DailyChart className="animate-fade-up" />
      <WeeklyChart className="animate-fade-up" />
    </div>
  )
}
