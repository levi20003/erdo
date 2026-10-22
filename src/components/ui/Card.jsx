/**
 * Bento tile: hairline border that brightens on hover, a faint inner top
 * highlight, and a sand accent line that fades in on hover.
 */
export default function Card({ title, icon, action, className = '', children }) {
  return (
    <section
      className={`group/card relative min-w-0 rounded-2xl border border-zinc-800/70 bg-zinc-900 p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.035)] transition-colors duration-300 hover:border-zinc-700/70 sm:p-6 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sand/25 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />
      {(title || action) && (
        <header className="mb-5 flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            {icon && <span className="text-zinc-600">{icon}</span>}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
