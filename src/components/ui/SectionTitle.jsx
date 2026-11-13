import Icon from './Icon'

/** "TOPICS →" from the design: a bold uppercase title, and an arrow when there is more to see. */
export default function SectionTitle({ children, onMore, moreLabel, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-1 ${className}`}>
      <h2 className="font-display text-lg font-bold uppercase tracking-[0.02em] text-zinc-100">{children}</h2>
      {onMore && (
        <button type="button" onClick={onMore} aria-label={moreLabel} className="press grid size-9 place-items-center rounded-full text-zinc-200 hover:bg-zinc-800">
          <Icon name="arrowRight" size={22} strokeWidth={2.2} />
        </button>
      )}
    </div>
  )
}
