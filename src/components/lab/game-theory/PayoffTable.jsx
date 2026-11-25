// The payoff table of a two-player game, shared by the modules of the Game
// Theory Lab (like network/ui.jsx for the Network Lab). Each cell shows the
// row player's payoff first (orange) and the column player's second (blue).
//
//   game      { rows, cols, a, b }: strategy names and the two payoff matrices
//   marks     { row[i][j], col[i][j] } best responses to underline (optional)
//   goneR     Set of deleted rows, goneC of deleted columns: greyed out
//   stable    [[i, j]] cells to ring (the stable cells)
//   format    how a payoff is written (default: as it is)
//   compact   payoffs one above the other, small type: for large tables
//   onStep    (player, i, j, delta) => void: shows − and + beside each payoff
//   corner    text of the top-left corner (optional)
//
// Plain HTML and buttons, so it never captures a swipe.

export const ROW_COLOR = '#c2410c' // orange-700, the row player
export const COL_COLOR = '#0369a1' // sky-700, the column player

const EMPTY = new Set()

function Payoff({ value, color, best, onMinus, onPlus, label }) {
  const number = (
    <span
      className={`tabular-nums ${best ? 'font-bold underline decoration-2 underline-offset-2' : ''}`}
      style={{ color }}
    >
      {value}
    </span>
  )
  if (!onMinus) return number
  const button =
    'w-6 h-6 rounded border border-slate-200 bg-white text-slate-500 leading-none hover:text-orange-600 hover:border-orange-300 disabled:opacity-30'
  return (
    <span className="inline-flex items-center gap-1">
      <button type="button" className={button} onClick={onMinus} aria-label={`${label} −1`}>
        −
      </button>
      <span className="w-4 text-center">{number}</span>
      <button type="button" className={button} onClick={onPlus} aria-label={`${label} +1`}>
        +
      </button>
    </span>
  )
}

export default function PayoffTable({
  game,
  marks = null,
  goneR = EMPTY,
  goneC = EMPTY,
  stable = [],
  format = String,
  compact = false,
  onStep = null,
  corner = '',
  aria,
}) {
  const { rows, cols, a, b } = game
  const isStable = (i, j) => stable.some(([x, y]) => x === i && y === j)
  const stacked = compact || !!onStep
  const text = compact ? 'text-[10px] sm:text-xs' : 'text-sm'
  const pad = compact ? 'px-0.5 py-1' : onStep ? 'px-1 py-2' : 'px-1 py-2.5'

  return (
    <div
      role="table"
      aria-label={aria}
      className={`grid gap-1 font-mono ${text}`}
      style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}
    >
      <div role="row" className="contents">
        <span role="columnheader" className="text-[10px] text-slate-400 self-end pb-0.5 pr-1">
          {corner}
        </span>
        {cols.map((name, j) => (
          <span
            key={j}
            role="columnheader"
            className={`text-center font-semibold pb-0.5 truncate ${goneC.has(j) ? 'opacity-30 line-through' : ''}`}
            style={{ color: COL_COLOR }}
          >
            {name}
          </span>
        ))}
      </div>
      {rows.map((name, i) => (
        <div role="row" className="contents" key={i}>
          <span
            role="rowheader"
            className={`self-center font-semibold pr-1.5 ${goneR.has(i) ? 'opacity-30 line-through' : ''}`}
            style={{ color: ROW_COLOR }}
          >
            {name}
          </span>
          {cols.map((_, j) => {
            const gone = goneR.has(i) || goneC.has(j)
            const ring = !gone && isStable(i, j)
            return (
              <div
                key={j}
                role="cell"
                data-stable={ring || undefined}
                data-gone={gone || undefined}
                className={`min-w-0 rounded-md border text-center ${pad} ${
                  gone
                    ? 'border-slate-200 bg-slate-100 opacity-30'
                    : ring
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400'
                      : 'border-slate-200 bg-white'
                } ${stacked ? 'flex flex-col items-center gap-1' : ''}`}
              >
                <Payoff
                  value={format(a[i][j])}
                  color={ROW_COLOR}
                  best={!gone && !!marks && marks.row[i][j]}
                  label={`${name}, ${cols[j]}: row`}
                  onMinus={onStep && (() => onStep('row', i, j, -1))}
                  onPlus={onStep && (() => onStep('row', i, j, 1))}
                />
                {!stacked && <span className="text-slate-400">, </span>}
                <Payoff
                  value={format(b[i][j])}
                  color={COL_COLOR}
                  best={!gone && !!marks && marks.col[i][j]}
                  label={`${name}, ${cols[j]}: column`}
                  onMinus={onStep && (() => onStep('col', i, j, -1))}
                  onPlus={onStep && (() => onStep('col', i, j, 1))}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// One line under a table saying how to read it.
export function TableLegend({ lang = 'en', marks = true }) {
  const t =
    lang === 'it'
      ? { row: 'giocatore di riga', col: 'giocatore di colonna', best: 'sottolineato: risposta migliore', stable: 'bordo arancione: cella stabile' }
      : { row: 'row player', col: 'column player', best: 'underlined: best response', stable: 'orange frame: stable cell' }
  return (
    <p className="mt-2 text-xs text-slate-500 leading-snug">
      <span className="font-semibold" style={{ color: ROW_COLOR }}>
        {t.row}
      </span>
      {', '}
      <span className="font-semibold" style={{ color: COL_COLOR }}>
        {t.col}
      </span>
      {marks && (
        <>
          {' · '}
          {t.best}
          {' · '}
          {t.stable}
        </>
      )}
    </p>
  )
}
