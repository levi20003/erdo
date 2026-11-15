import Icon from './Icon'

const TONES = {
  green: 'bg-olive-900 text-olive-300',
  accent: 'bg-sand/15 text-sand',
  neutral: 'bg-zinc-800 text-zinc-300',
  danger: 'bg-rose/15 text-rose',
}

/**
 * One row of a settings-style list: icon tile, title, a line of description, and
 * something on the right (a chevron for rows that open something). A button when
 * `onClick` is given, a link with `href`, otherwise plain.
 */
export default function ListRow({ icon, tone = 'green', title, description, right, onClick, href, disabled = false, className = '' }) {
  const Tag = href ? 'a' : onClick ? 'button' : 'div'
  const interactive = Boolean(href || onClick)
  return (
    <Tag
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : onClick ? { type: 'button', onClick, disabled } : {})}
      className={`flex min-h-14 w-full items-center gap-3 py-2.5 text-left ${interactive ? 'group transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40' : ''} ${className}`}
    >
      {icon && (
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-100">{title}</span>
        {description && <span className="block text-xs leading-snug text-zinc-500">{description}</span>}
      </span>
      {right ?? (interactive && <Icon name="chevronRight" size={18} className="text-zinc-500 transition-transform group-hover:translate-x-0.5" />)}
    </Tag>
  )
}
