import { memo } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { useProgress } from '../../hooks/useProgress'
import { growthItem } from '../../lib/growth'
import { t } from '../../lib/strings'
import { unlockProgress } from '../../lib/unlocks'
import ChallengeTeaser from '../challenge/ChallengeTeaser'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'
import SectionTitle from '../ui/SectionTitle'

/** The design's word-count bar: white track, maroon (day) / lime (night) fill. */
export function LeafBar({ value, label }) {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="h-2.5 w-full max-w-[9.5rem] overflow-hidden rounded-full bg-white shadow-inner">
        <div className="bar-fill h-full rounded-full transition-[width] duration-1000 ease-out" style={{ width: `${Math.max(4, Math.min(1, value) * 100)}%` }} />
      </div>
      {label && <span className="num text-[11px] font-semibold text-white/90">{label}</span>}
    </div>
  )
}

/** A green "flashcard" tile: uppercase title, a line under it, a bar, and art in the lime corner. */
export function LeafTile({ title, subtitle, children, art, onClick, className = '' }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={`leaf-card press group flex min-h-[7.5rem] flex-col p-4 text-left ${className}`}>
      {art && <span className="absolute right-2 top-2 size-14 transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-110">{art}</span>}
      <span className="max-w-[70%] font-display text-[15px] font-bold uppercase leading-tight tracking-[0.02em] drop-shadow-sm">{title}</span>
      {subtitle && <span className="mt-0.5 max-w-[70%] truncate text-xs font-semibold text-white/85">{subtitle}</span>}
      <span className="mt-auto">{children}</span>
    </Tag>
  )
}

/** Below the timer: level and next plant as green tiles, then challenges. */
function FocusSide({ onOpen, onChallenge, className = '' }) {
  const { level, title, next, completedCount } = useProgress()
  const xp = Math.round(useCountUp(level.xp - level.floor, { duration: 1100 }))
  const span = level.next - level.floor
  const nextItem = next && growthItem(next.id)

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SectionTitle onMore={() => onOpen('stats')} moreLabel={t.nav.stats}>
        {t.sections.growth}
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <LeafTile
          title={t.level.label(level.level)}
          subtitle={title}
          onClick={() => onOpen('stats')}
          className="animate-fade-up"
          art={
            <span className="grid size-full place-items-center rounded-full bg-white/25 font-display text-2xl font-bold text-white ring-2 ring-white/40">
              <Icon name="bolt" size={24} />
            </span>
          }
        >
          <LeafBar value={level.progress} label={t.level.xp(xp, span)} />
        </LeafTile>
        <LeafTile
          title={nextItem ? nextItem.name : t.home.allUnlocked}
          subtitle={t.home.next}
          onClick={() => onOpen('forest')}
          className="animate-fade-up [animation-delay:60ms]"
          art={
            nextItem && (
              <span className="relative block size-full">
                <ForestScene item={nextItem.id} color="#2d7749" progress={1} backdrop={false} className="size-full opacity-60 grayscale transition duration-500 group-hover:opacity-90 group-hover:grayscale-0" />
                <Icon name="lock" size={14} className="absolute bottom-0 right-0 text-white drop-shadow" />
              </span>
            )
          }
        >
          {next && <LeafBar value={unlockProgress(completedCount, next)} label={`${completedCount}/${next.at} · ${t.home.nextValue(next.remaining)}`} />}
        </LeafTile>
      </div>
      <SectionTitle className="mt-2" onMore={() => onOpen('stats')} moreLabel={t.challenge.title}>
        {t.sections.challenges}
      </SectionTitle>
      <ChallengeTeaser onOpen={onChallenge} className="animate-fade-up [animation-delay:120ms]" />
    </div>
  )
}

export default memo(FocusSide)
