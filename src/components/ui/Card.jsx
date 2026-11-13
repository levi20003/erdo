/**
 * Bento tile: soft surface, hairline border, and a gentle lift on hover
 * (shadow and a hint of gold along the top edge).
 */
export default function Card({ title, icon, action, className = '', children, as: Tag = 'section', ...rest }) {
  return (
    <Tag
      className={`group/card relative min-w-0 rounded-3xl border border-zinc-800/80 bg-zinc-900 p-5 shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-out hover:border-zinc-700/80 hover:shadow-lift sm:p-6 ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sand/30 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />
      {(title || action) && (
        <header className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {title && (
            <h2 className="eyebrow flex items-center gap-2">
              {icon && <span className="text-sand">{icon}</span>}
              {title}
            </h2>
          )}
          <span className="ml-auto">{action}</span>
        </header>
      )}
      {children}
    </Tag>
  )
}
