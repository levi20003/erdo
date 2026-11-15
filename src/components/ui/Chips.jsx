import Icon from './Icon'

/** A wrapping row of pill choices (radiogroup): for four or more options, where a segmented control would be cramped. */
export default function Chips({ label, options, value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`press inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
              on ? 'border-transparent bg-olive text-white shadow-button' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100'
            }`}
          >
            {o.icon && <Icon name={o.icon} size={15} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
