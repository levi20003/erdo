/** A 0…1 slider with its label and a live percentage; `action` sits to the right of the track (e.g. a preview button). */
export default function Slider({ id, label, value, onChange, action }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="label">{label}</span>
        <span className="num text-sm font-semibold text-zinc-400">{Math.round(value * 100)}%</span>
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range"
          style={{ '--fill': `${value * 100}%` }}
        />
        {action}
      </div>
    </div>
  )
}
