import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { INK, Pill, Eyebrow, Stat } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { FP_GAMES, FP_IDS, MARKS, DEFAULT_ROUNDS, play } from './fictitious.js'
import { showNumber } from './support.js'

// Panel B: fictitious play. Each player best-responds to the counts of the
// other's past moves; the chart shows the frequencies by round on a log axis,
// with the equilibrium as dashed lines. 100,000 rounds take well under a
// second, so the play is recomputed at once.

const COLORS = [ROW_COLOR, COL_COLOR, INK]

const T = {
  en: {
    games: {
      pennies: 'Matching pennies',
      penalty: 'Penalty kick',
      rps: 'Rock-paper-scissors',
      rps2: 'Rock worth 2',
      shapley: "Shapley's game",
    },
    names: {
      pennies: ['Heads', 'Tails'],
      penalty: ['L', 'R'],
      rps: ['Rock', 'Paper', 'Scissors'],
      rps2: ['Rock', 'Paper', 'Scissors'],
      shapley: [['1', '2', '3'], ['A', 'B', 'C']],
    },
    rounds: 'Rounds',
    row: 'Row player',
    col: 'Column player',
    start: (cell) => `Round 1 is ${cell}; ties go to the first strategy.`,
    eqLine: 'dashed: the equilibrium',
    gapNow: 'Largest gap from the equilibrium now',
    gaps: 'Largest gap after',
    runs: 'First runs (rounds in the same cell)',
    runCount: (n, r) => `${n.toLocaleString('en-US')} runs in ${r.toLocaleString('en-US')} rounds`,
    average: 'Row player’s average payoff',
    value: (v) => `value of the game ${v}`,
    smallest: (g, t) => `smallest gap from round 100 on: ${g} (round ${t.toLocaleString('en-US')})`,
    x: 'round',
    aria: 'Frequencies of the strategies by round, on a logarithmic axis, with the equilibrium as dashed lines',
  },
  it: {
    games: {
      pennies: 'Pari o dispari',
      penalty: 'Calcio di rigore',
      rps: 'Sasso-carta-forbici',
      rps2: 'Sasso che vale 2',
      shapley: 'Il gioco di Shapley',
    },
    names: {
      pennies: ['Testa', 'Croce'],
      penalty: ['S', 'D'],
      rps: ['Sasso', 'Carta', 'Forbici'],
      rps2: ['Sasso', 'Carta', 'Forbici'],
      shapley: [['1', '2', '3'], ['A', 'B', 'C']],
    },
    rounds: 'Turni',
    row: 'Giocatore di riga',
    col: 'Giocatore di colonna',
    start: (cell) => `Il turno 1 è ${cell}; a parità vince la prima strategia.`,
    eqLine: "tratteggio: l'equilibrio",
    gapNow: "Scarto massimo dall'equilibrio ora",
    gaps: 'Scarto massimo dopo',
    runs: 'Prime sequenze (turni nella stessa cella)',
    runCount: (n, r) => `${n.toLocaleString('it-IT')} sequenze in ${r.toLocaleString('it-IT')} turni`,
    average: 'Payoff medio del giocatore di riga',
    value: (v) => `valore del gioco ${v}`,
    smallest: (g, t) => `scarto minimo dal turno 100 in poi: ${g} (turno ${t.toLocaleString('it-IT')})`,
    x: 'turno',
    aria: "Frequenze delle strategie per turno, su asse logaritmico, con l'equilibrio tratteggiato",
  },
}

// The log slider moves in 1,000 steps: round to two significant digits, so
// that 1,000 and 10,000 can be reached again.
export const niceRounds = (v) => {
  const e = 10 ** (Math.floor(Math.log10(v)) - 1)
  return Math.min(100000, Math.max(100, Math.round(v / e) * e))
}

const roundTicks = (n) => [1, 10, 100, 1000, 10000, 100000].filter((v) => v <= n)

export default function LearningPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [id, setId] = useState('pennies')
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS)
  const [who, setWho] = useState('row')
  const r = useMemo(() => play(id, rounds), [id, rounds])
  const dec = (s) => (lang === 'it' ? s.replace('.', ',') : s)
  const nm = t.names[id]
  const rowNames = Array.isArray(nm[0]) ? nm[0] : nm
  const colNames = Array.isArray(nm[0]) ? nm[1] : nm
  const names = who === 'row' ? rowNames : colNames
  const eqv = who === 'row' ? r.eq.x : r.eq.y
  const last = r.series[r.series.length - 1]
  const start = FP_GAMES[id].start
  const zeroSum = FP_GAMES[id].zeroSum
  const digits = id === 'penalty' ? 2 : 3

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FP_IDS.map((k) => (
          <Pill key={k} active={id === k} onClick={() => setId(k)}>
            {t.games[k]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider label={t.rounds} min={100} max={100000} log value={rounds} onChange={(v) => setRounds(niceRounds(v))} format={(v) => Math.round(v).toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} />
        <div className="flex flex-wrap gap-2">
          <Pill active={who === 'row'} onClick={() => setWho('row')}>
            {t.row}
          </Pill>
          <Pill active={who === 'col'} onClick={() => setWho('col')}>
            {t.col}
          </Pill>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{t.start(`(${rowNames[start[0]]}, ${colNames[start[1]]})`)}</p>

      <div className="mt-4 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Chart
            aria={t.aria}
            height={200}
            x={{ min: 1, max: rounds, log: true, ticks: roundTicks(rounds), label: t.x }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }}
            series={[
              ...names.map((_, k) => ({ points: [[1, eqv[k]], [rounds, eqv[k]]], color: COLORS[k], width: 1, dashed: true })),
              ...names.map((_, k) => ({ points: r.series.map((s) => [s.t, (who === 'row' ? s.x : s.y)[k]]), color: COLORS[k], width: 2 })),
            ]}
          />
          <Legend items={[...names.map((n, k) => ({ label: n, color: COLORS[k] })), { label: t.eqLine, color: '#64748b', dashed: true }]} />
        </div>
        <div className="min-w-0 grid grid-cols-2 gap-3" data-role="fp-readout">
          <Stat label={t.gapNow}>{dec(last.gap.toFixed(4))}</Stat>
          <Stat label={t.gaps}>
            <span className="text-xs">
              {MARKS.filter((k) => k <= rounds).map((k) => (
                <span key={k} className="block">
                  {k.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')}: {dec(r.atMarks[k].gap.toFixed(4))}
                </span>
              ))}
            </span>
          </Stat>
          <Stat label={t.runs} wide>
            <span className="text-xs">
              {r.runs.slice(0, 14).join(', ')}
              {r.runs.length > 14 ? ', …' : ''}
              <span className="block font-sans text-slate-600">{t.runCount(r.runs.length, rounds)}</span>
              {id === 'shapley' && r.minGap != null && <span className="block font-sans text-slate-600">{t.smallest(dec(r.minGap.toFixed(3)), r.minGapAt)}</span>}
            </span>
          </Stat>
          {zeroSum && (
            <Stat label={t.average} wide>
              <span className="text-xs">
                {dec(r.final.average.toFixed(digits))} <span className="font-sans text-slate-600">({t.value(showNumber(r.value, digits, lang))})</span>
              </span>
            </Stat>
          )}
        </div>
      </div>
    </div>
  )
}
