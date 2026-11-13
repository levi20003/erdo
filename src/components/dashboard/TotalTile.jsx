import { memo } from 'react'
import { t } from '../../lib/strings'
import { formatMinutes, parseDayKey, shortDate } from '../../lib/time'
import { useCategoryLookup } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

function TotalTile({ completedCount, failedCount, insights, onShare, className = '' }) {
  const categories = useCategoryLookup()
  const attempts = completedCount + failedCount
  const rate = attempts ? Math.round((completedCount / attempts) * 100) : 0
  const favorite = insights?.favoriteCategoryId ? categories[insights.favoriteCategoryId] : null

  return (
    <Card title={t.insights.title} icon={<Icon name="sparkle" size={13} />} className={className}>
      <dl className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-zinc-950/60 p-3 ring-1 ring-inset ring-zinc-800/80">
          <dt className="text-[11px] text-zinc-500">{t.sessions}</dt>
          <dd className="num font-display text-2xl font-semibold text-zinc-50">{completedCount}</dd>
        </div>
        <div className="rounded-2xl bg-zinc-950/60 p-3 ring-1 ring-inset ring-zinc-800/80">
          <dt className="text-[11px] text-zinc-500">{t.successRate}</dt>
          <dd className="num font-display text-2xl font-semibold text-zinc-50">{attempts ? `${rate}%` : '—'}</dd>
        </div>
      </dl>

      {insights && completedCount > 0 && (
        <div className="mt-5">
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-zinc-500">{t.insights.thisWeek}</dt>
              <dd className="text-right tabular-nums text-zinc-200">
                {formatMinutes(insights.last7Min)}
                {insights.deltaPct !== null && (
                  <span className={`block text-[11px] ${insights.deltaPct >= 0 ? 'text-olive-300' : 'text-zinc-500'}`}>
                    {t.insights.vsLast(insights.deltaPct)}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-zinc-500">
                {insights.activeDays} {t.insights.activeDays}
              </dt>
              <dd className="text-right tabular-nums text-zinc-200">
                {formatMinutes(insights.avgPerActiveDayMin)} <span className="text-zinc-500">{t.insights.avgPerActiveDay}</span>
              </dd>
            </div>
            {favorite && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-500">{t.insights.favorite}</dt>
                <dd className="flex min-w-0 items-center gap-1.5 text-zinc-200">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: favorite.color }} />
                  <span className="truncate">{favorite.name}</span>
                </dd>
              </div>
            )}
            {insights.bestDay && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-500">{t.insights.bestDay}</dt>
                <dd className="tabular-nums text-zinc-200">
                  {shortDate(parseDayKey(insights.bestDay.key))} · {formatMinutes(insights.bestDay.min)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {completedCount > 0 && (
        <button
          type="button"
          onClick={onShare}
          className="btn-ghost mt-5 min-h-11 w-full"
        >
          <Icon name="share" size={15} className="text-sand" /> {t.share.title}
        </button>
      )}
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(TotalTile)
