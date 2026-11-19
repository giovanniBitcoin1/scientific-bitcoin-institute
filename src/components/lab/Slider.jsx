import { useId } from 'react'

const RESOLUTION = 1000

// Labelled range input. With `log`, the thumb moves on a log10 scale between
// min and max (both must be > 0) and `step` is ignored.
export default function Slider({ label, min, max, step = 1, value, onChange, format, log = false }) {
  const id = useId()
  const shown = format ? format(value) : String(value)

  let inputProps
  if (log) {
    const lo = Math.log10(min)
    const hi = Math.log10(max)
    const pos = Math.round(((Math.log10(value) - lo) / (hi - lo)) * RESOLUTION)
    inputProps = {
      min: 0,
      max: RESOLUTION,
      step: 1,
      value: pos,
      onChange: (e) => onChange(10 ** (lo + (Number(e.target.value) / RESOLUTION) * (hi - lo))),
      'aria-valuetext': shown,
    }
  } else {
    inputProps = {
      min,
      max,
      step,
      value,
      onChange: (e) => onChange(Number(e.target.value)),
      'aria-valuetext': shown,
    }
  }

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="font-mono text-sm text-slate-900 tabular-nums">{shown}</span>
      </div>
      <input
        id={id}
        type="range"
        className="mt-1.5 w-full accent-orange-600 cursor-pointer"
        {...inputProps}
      />
    </div>
  )
}
