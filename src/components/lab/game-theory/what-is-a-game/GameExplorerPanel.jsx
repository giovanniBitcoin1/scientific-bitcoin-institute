import { useMemo, useState } from 'react'
import { Pill, Eyebrow, Stat } from '../../network/ui.jsx'
import PayoffTable, { TableLegend } from '../PayoffTable.jsx'
import { CLASSICS, twoByTwo, describe, surveyOrdinal } from './games.js'

// Panel A: a two-by-two game with eight payoffs (whole numbers 0 to 9) that
// can be edited with steppers; best responses, strictly dominated strategies,
// what iterated elimination leaves, the stable cells and the cells no other
// cell beats for both players are shown live. A button runs through all the
// 576 tables in which each player ranks the four cells from 1 to 4.

const PRESET_IDS = ['pd', 'stag', 'chicken', 'battle', 'pennies', 'coordination']

const T = {
  en: {
    presets: {
      pd: "Prisoner's Dilemma",
      stag: 'Stag hunt',
      chicken: 'Chicken',
      battle: 'Battle of the sexes',
      pennies: 'Matching pennies',
      coordination: 'Pure coordination',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Stag', 'Hare'],
      chicken: ['Swerve', 'Straight'],
      battle: ['Concert', 'Match'],
      pennies: ['Heads', 'Tails'],
      coordination: ['Left', 'Right'],
    },
    table: 'Payoffs',
    hint: 'Each cell: row player above, column player below. Use − and + to change a payoff (0 to 9).',
    reading: 'What the table says',
    dominated: 'Strictly dominated',
    rowP: 'row player',
    colP: 'column player',
    domItem: (who, name, by) => `${name} (${who}: ${by} is better)`,
    none: 'none',
    left: 'Iterated elimination leaves',
    leftOne: (cell) => `${cell}: solved`,
    leftAll: 'all four cells',
    leftSome: (r, c) => `a ${r} × ${c} game`,
    stable: 'Stable cells',
    unbeaten: 'No other cell is better for both',
    survey: 'Survey all games',
    hide: 'Hide the survey',
    surveyTitle: 'All the two-by-two games with no ties',
    surveyNote:
      'Each player ranks the four cells from 1 to 4: 24 rankings each, 576 tables. Many are the same game with the strategies renamed, or with the two players swapped.',
    cols: ['', 'All tables', 'Strategies renamed', 'Players swapped too'],
    rows: {
      total: 'Games',
      s0: 'No stable cell',
      s1: 'One stable cell',
      s2: 'Two stable cells',
      pd: "Like the Prisoner's Dilemma",
    },
    both: 'Dominant strategy for both',
    one: 'For one player only',
    neither: 'For neither',
    solved: 'Solved by elimination',
    symmetric: 'Symmetric games',
    of: (n, total) => `${n} of ${total}`,
    aria: 'Payoff table of a two-by-two game, with a − and a + button beside each payoff',
  },
  it: {
    presets: {
      pd: 'Dilemma del prigioniero',
      stag: 'Caccia al cervo',
      chicken: 'Gioco del pollo',
      battle: 'Battaglia dei sessi',
      pennies: 'Matching pennies',
      coordination: 'Coordinamento puro',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Cervo', 'Lepre'],
      chicken: ['Sterza', 'Dritto'],
      battle: ['Concerto', 'Partita'],
      pennies: ['Testa', 'Croce'],
      coordination: ['Sinistra', 'Destra'],
    },
    table: 'Payoff',
    hint: 'In ogni cella: sopra il giocatore di riga, sotto quello di colonna. Usa − e + per cambiare un payoff (da 0 a 9).',
    reading: 'Che cosa dice la tabella',
    dominated: 'Strettamente dominate',
    rowP: 'giocatore di riga',
    colP: 'giocatore di colonna',
    domItem: (who, name, by) => `${name} (${who}: ${by} è migliore)`,
    none: 'nessuna',
    left: "L'eliminazione iterata lascia",
    leftOne: (cell) => `${cell}: risolto`,
    leftAll: 'tutte e quattro le celle',
    leftSome: (r, c) => `un gioco ${r} × ${c}`,
    stable: 'Celle stabili',
    unbeaten: "Nessun'altra cella è migliore per entrambi",
    survey: 'Passa in rassegna tutti i giochi',
    hide: 'Nascondi la rassegna',
    surveyTitle: 'Tutti i giochi due per due senza pareggi',
    surveyNote:
      'Ogni giocatore ordina le quattro celle da 1 a 4: 24 ordinamenti ciascuno, 576 tabelle. Molte sono lo stesso gioco con le strategie rinominate, o con i due giocatori scambiati.',
    cols: ['', 'Tutte le tabelle', 'Strategie rinominate', 'Anche giocatori scambiati'],
    rows: {
      total: 'Giochi',
      s0: 'Nessuna cella stabile',
      s1: 'Una cella stabile',
      s2: 'Due celle stabili',
      pd: 'Come il dilemma del prigioniero',
    },
    both: 'Strategia dominante per entrambi',
    one: 'Per un solo giocatore',
    neither: 'Per nessuno',
    solved: "Risolti dall'eliminazione",
    symmetric: 'Giochi simmetrici',
    of: (n, total) => `${n} su ${total}`,
    aria: 'Tabella dei payoff di un gioco due per due, con un pulsante − e uno + accanto a ogni payoff',
  },
}

export default function GameExplorerPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [preset, setPreset] = useState('pd')
  const [cells, setCells] = useState(CLASSICS.pd)
  const [custom, setCustom] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)

  const names = t.names[preset]
  const game = useMemo(() => twoByTwo(cells, names, names), [cells, names])
  const d = useMemo(() => describe(game), [game])
  const survey = useMemo(() => (showSurvey ? surveyOrdinal() : null), [showSurvey])

  const load = (id) => {
    setPreset(id)
    setCells(CLASSICS[id])
    setCustom(false)
  }
  const step = (player, i, j, delta) => {
    const k = i * 2 + j
    const p = player === 'row' ? 0 : 1
    setCells(cells.map((c, n) => (n === k ? c.map((v, q) => (q === p ? Math.min(9, Math.max(0, v + delta)) : v)) : c)))
    setCustom(true)
  }

  const cell = ([i, j]) => `(${game.rows[i]}, ${game.cols[j]})`
  const list = (items) => (items.length ? items.map(cell).join(' ') : t.none)
  const dom = d.dominated.map((s) =>
    t.domItem(s.player === 'row' ? t.rowP : t.colP, (s.player === 'row' ? game.rows : game.cols)[s.index], (s.player === 'row' ? game.rows : game.cols)[s.by]),
  )
  const e = d.elimination
  const left = d.solved
    ? t.leftOne(cell([e.rows[0], e.cols[0]]))
    : e.steps.length === 0
      ? t.leftAll
      : t.leftSome(e.rows.length, e.cols.length)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <Pill key={id} active={preset === id && !custom} onClick={() => load(id)}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.table}</Eyebrow>
          <div className="mt-2 max-w-sm">
            <PayoffTable game={game} marks={d.marks} stable={d.stable} onStep={step} aria={t.aria} />
          </div>
          <TableLegend lang={lang} />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.hint}</p>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.reading}</Eyebrow>
          <div className="mt-2 grid grid-cols-2 gap-3" data-role="explorer-readout">
            <Stat label={t.dominated} wide>
              {dom.length ? dom.join('; ') : t.none}
            </Stat>
            <Stat label={t.left} wide>
              {left}
            </Stat>
            <Stat label={t.stable}>{list(d.stable)}</Stat>
            <Stat label={t.unbeaten}>{list(d.unbeaten)}</Stat>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Pill primary={!showSurvey} onClick={() => setShowSurvey(!showSurvey)}>
          {showSurvey ? t.hide : t.survey}
        </Pill>
      </div>

      {survey && (
        <div className="mt-4" data-role="survey">
          <Eyebrow>{t.surveyTitle}</Eyebrow>
          <p className="mt-1 text-sm text-slate-600 leading-snug max-w-3xl">{t.surveyNote}</p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  {t.cols.map((h) => (
                    <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 sm:px-3 py-2 text-left align-bottom font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-900">
                {[
                  [t.rows.total, survey.total, survey.renamed.total, survey.swapped.total],
                  [t.rows.s0, survey.stable[0], survey.renamed.stable[0], survey.swapped.stable[0]],
                  [t.rows.s1, survey.stable[1], survey.renamed.stable[1], survey.swapped.stable[1]],
                  [t.rows.s2, survey.stable[2], survey.renamed.stable[2], survey.swapped.stable[2]],
                  [t.rows.pd, survey.pdLike, survey.renamed.pdLike, survey.swapped.pdLike],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((v, k) => (
                      <td key={k} className={`border-b border-slate-100 px-2 sm:px-3 py-2 ${k === 0 ? 'font-sans text-slate-700' : ''}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat label={t.both}>{t.of(survey.dominant.both, survey.total)}</Stat>
            <Stat label={t.one}>{t.of(survey.dominant.one, survey.total)}</Stat>
            <Stat label={t.neither}>{t.of(survey.dominant.neither, survey.total)}</Stat>
            <Stat label={t.solved}>{t.of(survey.solved, survey.total)}</Stat>
            <Stat label={t.symmetric}>{t.of(survey.swapped.symmetric, survey.swapped.total)}</Stat>
          </div>
        </div>
      )}
    </div>
  )
}
