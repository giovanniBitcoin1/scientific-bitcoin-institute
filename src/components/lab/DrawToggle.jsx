// Pill switch that arms a canvas for touch drawing. While it is off, a finger
// on the canvas scrolls the page as usual and only mouse clicks edit it; while
// it is on, the canvas takes touch-action: none and captures the pointer.
// Pair it with `drawCanvasClass(on)` and gate the handlers with `canEdit`.

const base =
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider transition-colors'

export default function DrawToggle({ on, onChange, label = 'Draw' }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`${base} ${
        on
          ? 'border-orange-500 bg-orange-500 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300'
      }`}
    >
      <span aria-hidden="true">✎</span>
      {label}
    </button>
  )
}

// A pointer may edit the canvas when Draw is on, or when it is a mouse
// (a mouse click never scrolls the page).
export const canEdit = (on, e) => on || e.pointerType === 'mouse'

// Extra class for the canvas: touch-none only while drawing is armed.
export const drawCanvasClass = (on) => (on ? 'touch-none' : '')
