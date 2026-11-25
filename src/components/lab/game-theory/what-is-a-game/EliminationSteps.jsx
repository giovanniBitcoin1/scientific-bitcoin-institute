import { useMemo, useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import PayoffTable, { TableLegend } from '../PayoffTable.jsx'
import { eliminate, afterSteps, bestResponses, stableCells } from './games.js'

// A game with its iterated elimination, one deletion per press of "Next
// step". Used by figure F1 and by the sample game of Panel C. When nothing
// more can be deleted, the best responses and the stable cells of what is
// left are marked. Give it a `key` that changes with the game, so the steps
// start again.

const T = {
  en: {
    next: 'Next step',
    reset: 'Reset',
    start: 'Nothing deleted yet. Is any row or column worse than another whatever the other player does?',
    row: 'row',
    col: 'column',
    step: (n, name, by, who) =>
      `Step ${n}: ${name} goes. ${by} pays the ${who} player more against everything still in play.`,
    solved: (r, c) => `One cell is left: (${r}, ${c}).`,
    stuck: (r, c) => `Nothing more can be deleted: a ${r} × ${c} game is left.`,
    none: 'Nothing can be deleted: no strategy is strictly dominated.',
    stable: (list) =>
      list.length === 0 ? 'It has no stable cell.' : list.length === 1 ? `Stable cell: ${list[0]}.` : `Stable cells: ${list.join(' and ')}.`,
  },
  it: {
    next: 'Passo successivo',
    reset: 'Ricomincia',
    start: "Ancora nulla di cancellato. C'è una riga o una colonna peggiore di un'altra qualunque cosa faccia l'altro giocatore?",
    row: 'riga',
    col: 'colonna',
    step: (n, name, by, who) =>
      `Passo ${n}: ${name} esce. ${by} dà di più al giocatore di ${who} contro tutto ciò che è ancora in gioco.`,
    solved: (r, c) => `Resta una sola cella: (${r}, ${c}).`,
    stuck: (r, c) => `Non si può cancellare altro: resta un gioco ${r} × ${c}.`,
    none: 'Non si può cancellare nulla: nessuna strategia è strettamente dominata.',
    stable: (list) =>
      list.length === 0 ? 'Non ha celle stabili.' : list.length === 1 ? `Cella stabile: ${list[0]}.` : `Celle stabili: ${list.join(' e ')}.`,
  },
}

export default function EliminationSteps({ game, lang = 'en', format, compact = false, aria }) {
  const t = T[lang] || T.en
  const result = useMemo(() => eliminate(game), [game])
  const [shown, setShown] = useState(0)
  const n = Math.min(shown, result.steps.length)
  const done = n === result.steps.length
  const state = afterSteps(game, result.steps, n)
  const marks = done ? bestResponses(game, state.rows, state.cols) : null
  const stable = done ? stableCells(game, state.rows, state.cols) : []

  const nameOf = (s, index) => (s.player === 'row' ? game.rows : game.cols)[index]
  let line
  if (n === 0 && !done) line = t.start
  else {
    const parts = []
    if (n > 0) {
      const s = result.steps[n - 1]
      parts.push(t.step(n, nameOf(s, s.index), nameOf(s, s.by), s.player === 'row' ? t.row : t.col))
    }
    if (done) {
      const cells = stable.map(([i, j]) => `(${game.rows[i]}, ${game.cols[j]})`)
      if (state.rows.length === 1 && state.cols.length === 1) parts.push(t.solved(game.rows[state.rows[0]], game.cols[state.cols[0]]))
      else parts.push(n === 0 ? t.none : t.stuck(state.rows.length, state.cols.length), t.stable(cells))
    }
    line = parts.join(' ')
  }

  return (
    <div className="min-w-0">
      <PayoffTable game={game} marks={marks} goneR={state.goneR} goneC={state.goneC} stable={stable} format={format} compact={compact} aria={aria} />
      <TableLegend lang={lang} marks={done} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill primary disabled={done} onClick={() => setShown(n + 1)}>
          {t.next}
        </Pill>
        <Pill disabled={n === 0} onClick={() => setShown(0)}>
          {t.reset}
        </Pill>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug min-h-[3.75rem]" aria-live="polite" data-role="elimination-line">
        {line}
      </p>
    </div>
  )
}
