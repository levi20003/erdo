/** An on/off switch (role="switch"); the label is the row it sits in. */
export default function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 ${checked ? 'bg-olive-400' : 'bg-zinc-700'}`}
    >
      <span className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-spring ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}
