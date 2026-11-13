import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Segmented control with a thumb that slides to the selected option.
 * options: [{ id, label, sub? }] — rendered as a radiogroup.
 */
export default function Segmented({ options, value, onChange, label, size = 'md', disabled = false, className = '' }) {
  const refs = useRef({})
  const [thumb, setThumb] = useState(null)

  useLayoutEffect(() => {
    const el = refs.current[value]
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth })
  }, [value, options.length])

  const height = size === 'sm' ? 'min-h-9 text-xs' : 'min-h-10 text-sm'
  return (
    <div role="radiogroup" aria-label={label} className={`relative flex rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1 ${className}`}>
      {thumb && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-xl bg-zinc-800 shadow-card transition-[left,width] duration-300 ease-out"
          style={{ left: thumb.left, width: thumb.width }}
        />
      )}
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            ref={(el) => (refs.current[o.id] = el)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.aria}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={`relative z-10 flex flex-1 flex-col items-center justify-center rounded-xl px-2 font-medium transition-colors duration-200 ${height} ${
              active ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="leading-tight">{o.label}</span>
            {o.sub && <span className={`text-[10px] font-normal leading-tight ${active ? 'text-sand' : 'text-zinc-500'}`}>{o.sub}</span>}
          </button>
        )
      })}
    </div>
  )
}
