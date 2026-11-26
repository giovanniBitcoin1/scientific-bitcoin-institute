import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, Pill, Eyebrow, Stat, fmt } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import PayoffTable, { TableLegend } from '../PayoffTable.jsx'
import { CLASSICS, twoByTwo, bestResponses } from '../what-is-a-game/games.js'
import { SIZES, DEFAULT_GAMES, DEFAULT_TABLE_SIZE, tableOf, describeTable, movesAt, walk, surveyJob } from './equilibria.js'

// Panel A: find the equilibria of a table. A random table from 2 × 2 to 5 × 5
// with whole payoffs and no ties that matter, or one of the six classic games
// of module 01. A click on a cell shows who would move from there; "Walk" lets
// the two players take turns to best-respond, the row player first, until
// neither wants to move or the walk goes round in a cycle. "Survey" counts
// equilibria and walks in random games of every size from 2 to 8.

const SKY = '#0369a1'
const PRESET_IDS = ['pd', 'stag', 'chicken', 'battle', 'pennies', 'coordination']
const STEP_MS = 450

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
    size: 'Size m × m',
    newGame: 'New game',
    table: (n) => `Random table no. ${n}`,
    classic: 'A classic of module 01',
    hint: 'Click a cell to stand on it.',
    chosen: 'The chosen cell',
    reading: 'What the table says',
    eq: 'Equilibria',
    none: 'none',
    left: 'Iterated elimination leaves',
    leftOne: (cell) => `${cell}: solved`,
    leftAll: (n) => `all ${n} cells`,
    leftSome: (r, c, rows, cols) => `a ${r} × ${c} game: rows ${rows}; columns ${cols}`,
    at: (cell) => `At ${cell}`,
    pick: 'No cell chosen yet.',
    rowStays: 'the row player stays',
    colStays: 'the column player stays',
    rowMoves: (to, from, pay) => `the row player would move to ${to} (${from} → ${pay})`,
    colMoves: (to, from, pay) => `the column player would move to ${to} (${from} → ${pay})`,
    isEq: 'Nobody gains by moving alone: an equilibrium.',
    walk: 'Walk',
    walkTitle: 'The walk',
    noWalk: 'Choose a cell and press Walk: the players take turns to best-respond, the row player first.',
    going: 'walking…',
    endEq: (cell, n) => `Stops at the equilibrium ${cell} after ${n} ${n === 1 ? 'move' : 'moves'}.`,
    endStay: (cell) => `Nobody moves: ${cell} is an equilibrium.`,
    endCycle: (n, k) => `After ${n} ${n === 1 ? 'move' : 'moves'} the walk is in a cycle of ${k} cells and never stops.`,
    games: 'Games G per size',
    survey: 'Survey',
    stop: 'Stop',
    computing: 'Computing…',
    surveyTitle: (g) => `Random games, payoffs uniform on 0–1: ${g.toLocaleString('en-US')} of each size`,
    cols: ['m', 'Equilibria, mean', 'None', 'One', 'Two', 'Three or more', 'Walks that end at one', '… in games that have one'],
    chartNone: 'games with no equilibrium',
    chartWalks: 'walks that end at an equilibrium',
    chartHaving: '… in games that have one',
    aria: 'Payoff table of the game; click a cell to choose it',
    chartAria: 'Shares of random games and of walks against the size m',
  },
  it: {
    presets: {
      pd: 'Dilemma del prigioniero',
      stag: 'Caccia al cervo',
      chicken: 'Gioco del pollo',
      battle: 'Battaglia dei sessi',
      pennies: 'Pari o dispari',
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
    size: 'Dimensione m × m',
    newGame: 'Nuovo gioco',
    table: (n) => `Tabella casuale n. ${n}`,
    classic: 'Un classico del modulo 01',
    hint: 'Clicca una cella per sceglierla.',
    chosen: 'La cella scelta',
    reading: 'Che cosa dice la tabella',
    eq: 'Equilibri',
    none: 'nessuno',
    left: "L'eliminazione iterata lascia",
    leftOne: (cell) => `${cell}: risolto`,
    leftAll: (n) => `tutte le ${n} celle`,
    leftSome: (r, c, rows, cols) => `un gioco ${r} × ${c}: righe ${rows}; colonne ${cols}`,
    at: (cell) => `In ${cell}`,
    pick: 'Nessuna cella scelta.',
    rowStays: 'il giocatore di riga resta',
    colStays: 'il giocatore di colonna resta',
    rowMoves: (to, from, pay) => `il giocatore di riga passerebbe a ${to} (${from} → ${pay})`,
    colMoves: (to, from, pay) => `il giocatore di colonna passerebbe a ${to} (${from} → ${pay})`,
    isEq: 'Nessuno ci guadagna a spostarsi da solo: un equilibrio.',
    walk: 'Cammina',
    walkTitle: 'Il cammino',
    noWalk: 'Scegli una cella e premi Cammina: i giocatori danno a turno la miglior risposta, prima quello di riga.',
    going: 'in cammino…',
    endEq: (cell, n) => `Si ferma nell'equilibrio ${cell} dopo ${n} ${n === 1 ? 'mossa' : 'mosse'}.`,
    endStay: (cell) => `Nessuno si muove: ${cell} è un equilibrio.`,
    endCycle: (n, k) => `Dopo ${n} ${n === 1 ? 'mossa' : 'mosse'} il cammino è in un ciclo di ${k} celle e non si ferma più.`,
    games: 'Giochi G per dimensione',
    survey: 'Rassegna',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    surveyTitle: (g) => `Giochi casuali, payoff uniformi tra 0 e 1: ${g.toLocaleString('it-IT')} per dimensione`,
    cols: ['m', 'Equilibri, media', 'Nessuno', 'Uno', 'Due', 'Tre o più', 'Cammini che finiscono in un equilibrio', '… nei giochi che ne hanno uno'],
    chartNone: 'giochi senza equilibrio',
    chartWalks: 'cammini che finiscono in un equilibrio',
    chartHaving: '… nei giochi che ne hanno uno',
    aria: 'Tabella dei payoff del gioco; clicca una cella per sceglierla',
    chartAria: 'Quote di giochi casuali e di cammini in funzione della dimensione m',
  },
}

export default function EquilibriaPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [m, setM] = useState(DEFAULT_TABLE_SIZE)
  const [index, setIndex] = useState(0)
  const [preset, setPreset] = useState(null)
  const [cell, setCell] = useState(null) // the chosen cell
  const [steps, setSteps] = useState(null) // moves of the walk shown so far, or null
  const [games, setGames] = useState(DEFAULT_GAMES)
  const [surveyKey, setSurveyKey] = useState(null)
  const exp = useExperiment()

  const game = useMemo(() => {
    if (preset) return twoByTwo(CLASSICS[preset], t.names[preset], t.names[preset])
    return tableOf(m, index)
  }, [preset, m, index, t])
  const d = useMemo(() => describeTable(game), [game])
  const marks = useMemo(() => bestResponses(game), [game])
  const w = useMemo(() => (cell ? walk(game, cell[0], cell[1]) : null), [game, cell])

  const walking = steps != null && w && steps < w.moves.length
  useEffect(() => {
    if (!walking) return
    const id = setTimeout(() => setSteps((s) => s + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [walking, steps])

  const fresh = () => {
    setCell(null)
    setSteps(null)
  }
  const name = ([i, j]) => `(${game.rows[i]}, ${game.cols[j]})`
  const list = (items) => (items.length ? items.map(name).join(' ') : t.none)
  const e = d.left
  const cellsTotal = game.rows.length * game.cols.length
  const left = d.solved
    ? t.leftOne(name([e.rows[0], e.cols[0]]))
    : e.steps.length === 0
      ? t.leftAll(cellsTotal)
      : t.leftSome(e.rows.length, e.cols.length, e.rows.map((i) => game.rows[i]).join(', '), e.cols.map((j) => game.cols[j]).join(', '))

  // Where the walk is now, and the cells it has passed.
  const shown = steps == null ? 0 : Math.min(steps, w ? w.moves.length : 0)
  const here = w && steps != null ? w.path[shown] : cell
  const trail = w && steps != null ? w.path.slice(0, shown + 1) : []

  let atLine = t.pick
  if (here) {
    const [i, j] = here
    const mv = movesAt(game, i, j)
    if (mv.row === i && mv.col === j) atLine = `${t.at(name(here))}: ${t.isEq}`
    else {
      const rowPart = mv.row === i ? t.rowStays : t.rowMoves(game.rows[mv.row], game.a[i][j], game.a[mv.row][j])
      const colPart = mv.col === j ? t.colStays : t.colMoves(game.cols[mv.col], game.b[i][j], game.b[i][mv.col])
      atLine = `${t.at(name(here))}: ${rowPart}; ${colPart}.`
    }
  }

  let walkLine = t.noWalk
  if (w && steps != null) {
    const route = w.path.slice(0, shown + 1).map(name).join(' → ')
    const end = walking
      ? t.going
      : w.end === 'equilibrium'
        ? w.moves.length === 0
          ? t.endStay(name(w.cell))
          : t.endEq(name(w.cell), w.moves.length)
        : t.endCycle(w.moves.length, w.cycle.length)
    walkLine = `${route}. ${end}`
  }

  const showSurvey = exp.data && surveyKey === games
  const rows = showSurvey ? SIZES.filter((k) => exp.data[k] && exp.data[k].games > 0) : []
  const line = (field) => rows.map((k) => [k, exp.data[k][field]])

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <Pill
            key={id}
            active={preset === id}
            onClick={() => {
              setPreset(id)
              fresh()
            }}
          >
            {t.presets[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider
          label={t.size}
          min={2}
          max={5}
          step={1}
          value={m}
          onChange={(v) => {
            setM(v)
            setIndex(0)
            setPreset(null)
            fresh()
          }}
          format={(v) => `${v} × ${v}`}
        />
        <div>
          <Pill
            primary
            onClick={() => {
              if (preset) setPreset(null)
              else setIndex(index + 1)
              fresh()
            }}
          >
            {t.newGame}
          </Pill>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{preset ? t.classic : t.table(index + 1)}</Eyebrow>
          <div className="mt-2 max-w-sm">
            <PayoffTable
              game={game}
              marks={marks}
              stable={d.equilibria}
              selected={here}
              trail={trail}
              onCell={(i, j) => {
                setCell([i, j])
                setSteps(null)
              }}
              aria={t.aria}
            />
          </div>
          <TableLegend lang={lang} />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.hint}</p>
          <div className="mt-3">
            <Pill primary disabled={!cell || walking} onClick={() => setSteps(0)}>
              {t.walk}
            </Pill>
          </div>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.reading}</Eyebrow>
          <div className="mt-2 grid grid-cols-2 gap-3" data-role="eq-readout">
            <Stat label={t.eq}>{list(d.equilibria)}</Stat>
            <Stat label={t.left}>{left}</Stat>
            <Stat label={t.chosen} wide>
              <span className="font-sans">{atLine}</span>
            </Stat>
            <Stat label={t.walkTitle} wide>
              <span className="font-sans" data-role="walk-line">
                {walkLine}
              </span>
            </Stat>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider label={t.games} min={500} max={20000} step={500} value={games} onChange={setGames} format={(v) => v.toLocaleString('en-US')} />
        <div className="flex flex-wrap items-center gap-2">
          {exp.running ? (
            <Pill onClick={exp.cancel}>{t.stop}</Pill>
          ) : (
            <Pill
              primary
              onClick={() => {
                setSurveyKey(games)
                exp.run(surveyJob({ games }))
              }}
            >
              {t.survey}
            </Pill>
          )}
          {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
        </div>
      </div>

      {showSurvey && rows.length > 0 && (
        <div className="mt-4" data-role="eq-survey">
          <Eyebrow>{t.surveyTitle(games)}</Eyebrow>
          <div className="mt-2 grid gap-x-8 gap-y-4 lg:grid-cols-2 items-start">
            <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {t.cols.map((h) => (
                      <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left align-bottom font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums text-slate-900">
                  {rows.map((k) => (
                    <tr key={k}>
                      <td className="border-b border-slate-100 px-2 py-1.5">{k}</td>
                      {['mean', 'none', 'one', 'two', 'more', 'walks', 'walksHaving'].map((f) => (
                        <td key={f} className="border-b border-slate-100 px-2 py-1.5">
                          {fmt(exp.data[k][f], 3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="min-w-0">
              <Chart
                aria={t.chartAria}
                height={190}
                x={{ min: 2, max: 8, ticks: SIZES, label: 'm' }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }}
                series={[
                  { points: line('none'), color: INK, dots: true, dashed: true },
                  { points: line('walks'), color: ORANGE_DARK, dots: true },
                  { points: line('walksHaving'), color: SKY, dots: true },
                ]}
              />
              <Legend
                items={[
                  { label: t.chartNone, color: INK, dashed: true },
                  { label: t.chartWalks, color: ORANGE_DARK },
                  { label: t.chartHaving, color: SKY },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
