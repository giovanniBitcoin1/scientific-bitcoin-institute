const pill =
  'px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-colors'
const primary = `${pill} border-orange-500 bg-orange-500 text-white hover:bg-orange-600`
const secondary = `${pill} border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300`

// Pill buttons for a simulation. Each button renders only when its handler is passed.
export default function SimControls({ playing, onPlayPause, onStep, onReset, labels = {} }) {
  const l = { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset', ...labels }
  return (
    <div className="flex flex-wrap gap-2">
      {onPlayPause && (
        <button type="button" onClick={onPlayPause} className={primary} aria-pressed={!!playing}>
          {playing ? l.pause : l.play}
        </button>
      )}
      {onStep && (
        <button type="button" onClick={onStep} className={secondary} disabled={playing}>
          {l.step}
        </button>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className={secondary}>
          {l.reset}
        </button>
      )}
    </div>
  )
}
