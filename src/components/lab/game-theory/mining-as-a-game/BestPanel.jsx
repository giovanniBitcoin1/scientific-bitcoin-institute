import { useState } from 'react'
import { Pill, SLATE, MUTED, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { relativeRevenue, threshold, curve } from './selfish.js'
import { sm1Action, LETTER, FORKS } from './mdp.js'
import table from './optimal.json'
import { num } from '../auctions/fmt.js'

// Panel C, "The best deviation": the optimal share of the chain from
// Sapirshtein, Sompolinsky and Zohar's Markov decision process (precomputed
// with mdp.js by scripts/lab/gen-game-theory-13-optimal.mjs, T = 40) against
// α for the chosen γ, with SM1 and honest mining; the thresholds; the optimal
// policy of a chosen cell as a map of a and h, one per fork label, with the
// cells where it differs from SM1 outlined.

const GAMMAS = [0, 0.25, 0.5, 0.75, 1]
const GL = { 0: '0', 0.25: '1/4', 0.5: '1/2', 0.75: '3/4', 1: '1' }
const POL_ALPHAS = [0.3, 0.35, 0.4]
const ACT_STYLE = {
  A: 'bg-slate-300 text-slate-800',
  O: 'bg-orange-500 text-white',
  M: 'bg-sky-600 text-white',
  W: 'bg-emerald-100 text-emerald-900',
  '.': 'bg-white text-slate-300',
}
const BLUE = '#0369a1'

const T = {
  en: {
    gamma: 'γ:',
    xl: 'α',
    yl: 'her share of the chain',
    legend: ['best deviation (T = 40)', 'Eyal and Sirer (SM1)', 'honest mining, R = α'],
    head: ['α', 'honest', 'SM1', 'best'],
    th: (o, s) => `Threshold: the best deviation pays from α = ${o}; SM1 from ${s}.`,
    same: 'here the two thresholds coincide',
    trunc: 'Above about α = 0.4 a truncation at 40 blocks understates the optimum: Sapirshtein et al. report lower and upper bounds.',
    pol: 'Policy of the cell α =',
    polNone: 'Policy maps are stored for γ = 0, 1/2 and 1.',
    forks: { irrelevant: 'irrelevant (her block last)', relevant: 'relevant (an honest block last: she can match)', active: 'active (she has matched: a race)' },
    axes: 'rows a = 0…8 (her private blocks), columns h = 0…8 (the others’ since the fork)',
    keys: { A: 'adopt: give up her branch', O: 'override: publish h + 1 and win', M: 'match: publish h, a race', W: 'wait: keep mining in private', '.': 'never reached' },
    outlined: 'outlined: where the best policy differs from SM1',
    diff: (n) => `${n} reached cells differ from SM1.`,
    honest: 'Honest mining is optimal here: override at once with her block, adopt theirs.',
    aria: 'The best share of the chain against α, with SM1 and honest mining',
  },
  it: {
    gamma: 'γ:',
    xl: 'α',
    yl: 'la sua quota della catena',
    legend: ['deviazione migliore (T = 40)', 'Eyal e Sirer (SM1)', 'mining onesto, R = α'],
    head: ['α', 'onesto', 'SM1', 'migliore'],
    th: (o, s) => `Soglia: la deviazione migliore conviene da α = ${o}; SM1 da ${s}.`,
    same: 'qui le due soglie coincidono',
    trunc: 'Sopra circa α = 0,4 un troncamento a 40 blocchi sottostima l’ottimo: Sapirshtein e coautori riportano limiti inferiori e superiori.',
    pol: 'Politica della cella α =',
    polNone: 'Le mappe delle politiche sono salvate per γ = 0, 1/2 e 1.',
    forks: { irrelevant: 'irrelevant (l’ultimo blocco è suo)', relevant: 'relevant (l’ultimo è onesto: può pareggiarlo)', active: 'active (ha pareggiato: una gara)' },
    axes: 'righe a = 0…8 (i suoi blocchi privati), colonne h = 0…8 (quelli degli altri dalla biforcazione)',
    keys: { A: 'adopt: abbandona il suo ramo', O: 'override: pubblica h + 1 e vince', M: 'match: pubblica h, una gara', W: 'wait: continua a minare in privato', '.': 'mai raggiunta' },
    outlined: 'bordate: dove la politica migliore differisce da SM1',
    diff: (n) => `${n} celle raggiunte differiscono da SM1.`,
    honest: 'Qui il mining onesto è ottimo: override subito con il suo blocco, adopt del loro.',
    aria: 'La quota migliore della catena in funzione di α, con SM1 e il mining onesto',
  },
}

export default function BestPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [g, setG] = useState(0)
  const [pa, setPa] = useState(0.35)
  const d = (x, k = 4) => num(x, lang, k)
  const cells = table.cells.filter((c) => c.gamma === g).sort((x, y) => x.alpha - y.alpha)
  const sm1 = []
  for (let i = 0; i <= 50; i++) {
    const a = 0.2 + (0.25 * i) / 50
    sm1.push([a, relativeRevenue(a, g)])
  }
  const tb = table.thresholds.find((t) => t.gamma === g)
  const ytop = Math.ceil(Math.max(...cells.map((c) => c.opt)) * 10) / 10
  const yticks = []
  for (let v = 0.1; v <= ytop + 1e-9; v += 0.1) yticks.push(Math.round(v * 10) / 10)
  const pol = table.policies.find((p) => p.gamma === g && Math.abs(p.alpha - pa) < 1e-9)
  let ndiff = 0
  const grid = (fork, fi) =>
    pol.map[fork].map((row, a) =>
      [...row].map((ch, h) => {
        const differs = ch !== '.' && ch !== LETTER[sm1Action(a, h, fi, table.T)]
        if (differs) ndiff++
        return { ch, a, h, differs }
      }),
    )
  const grids = pol ? FORKS.map((k, fi) => [k, grid(k, fi)]) : []
  const honestCell = pol && cells.find((c) => Math.abs(c.alpha - pa) < 1e-9)?.honest
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="bp-gamma">
        <span>{L.gamma}</span>
        {GAMMAS.map((x) => (
          <Pill key={x} active={g === x} onClick={() => setG(x)} data-gamma={x}>{GL[x]}</Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0" data-role="bp-chart">
          <Chart
            height={200}
            x={{ min: 0.2, max: 0.45, ticks: [0.2, 0.25, 0.3, 0.35, 0.4], label: L.xl, format: (v) => d(v, 2) }}
            y={{ min: 0.1, max: ytop, ticks: yticks, label: L.yl, labelSide: 'left', format: (v) => d(v, 1) }}
            series={[
              { points: [[0.2, 0.2], [0.45, 0.45]], color: MUTED, width: 1.25, dashed: true },
              { points: sm1, color: BLUE, width: 1.5 },
              { points: curve(table, g), color: ORANGE_DARK, width: 2, dots: 2.2 },
            ]}
            marks={[{ x: tb.opt, color: ORANGE_DARK, dashed: true }, ...(Math.abs(tb.opt - tb.sm1) > 1e-4 ? [{ x: tb.sm1, color: BLUE, dashed: true }] : [])]}
            aria={L.aria}
          />
          <Legend items={[{ label: L.legend[0], color: ORANGE_DARK }, { label: L.legend[1], color: BLUE }, { label: L.legend[2], color: MUTED, dashed: true }]} />
          <p className="mt-1 text-sm text-slate-800" data-role="bp-threshold">
            {L.th(d(tb.opt), d(threshold(g)))}{Math.abs(tb.opt - tb.sm1) < 1e-4 ? ` (${L.same}).` : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{L.trunc}</p>
        </div>
        <table className="w-full text-xs tabular-nums font-mono" data-role="bp-table">
          <thead>
            <tr className="text-slate-500">
              {L.head.map((h, i) => <th key={i} className={`font-sans font-normal pb-1 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {cells.map((c) => (
              <tr key={c.alpha} className={`border-t border-slate-100 ${c.honest ? 'text-slate-400' : ''}`} data-alpha={d(c.alpha, 3)}>
                <td className="py-0.5">{Math.abs(c.alpha - 1 / 3) < 1e-9 ? '1/3' : d(c.alpha, 3)}</td>
                <td className="py-0.5 text-right">{d(c.alpha)}</td>
                <td className="py-0.5 text-right" data-value="sm1">{d(c.sm1)}</td>
                <td className={`py-0.5 text-right ${c.honest ? '' : 'font-semibold text-slate-900'}`} data-value="opt">{d(c.opt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5" data-role="bp-policy">
        {pol ? (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{L.pol}</span>
              {POL_ALPHAS.map((x) => (
                <Pill key={x} active={pa === x} onClick={() => setPa(x)} data-palpha={x}>{d(x, 2)}</Pill>
              ))}
              <span>γ = {GL[g]}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{L.axes}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {grids.map(([fork, rows]) => (
                <div key={fork} className="min-w-0" data-fork={fork}>
                  <p className="text-[11px] text-slate-600 mb-1 max-w-[180px] leading-tight">{L.forks[fork]}</p>
                  <div className="grid grid-cols-[repeat(9,18px)] gap-px">
                    {rows.flat().map((c) => (
                      <span
                        key={`${c.a}-${c.h}`}
                        data-cell={`${c.a},${c.h}`}
                        data-act={c.ch}
                        data-differs={c.differs ? 'yes' : 'no'}
                        title={`a = ${c.a}, h = ${c.h}: ${L.keys[c.ch]}`}
                        className={`h-[18px] flex items-center justify-center font-mono text-[10px] font-semibold rounded-[2px] ${ACT_STYLE[c.ch]} ${c.differs ? 'ring-2 ring-slate-900 ring-inset' : ''}`}
                      >
                        {c.ch === '.' ? '' : c.ch}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {['A', 'O', 'M', 'W'].map((k) => (
                <li key={k} className="inline-flex items-center gap-1"><span className={`inline-block w-3 h-3 rounded-[2px] ${ACT_STYLE[k]}`} />{L.keys[k]}</li>
              ))}
              <li className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-[2px] ring-2 ring-slate-900 ring-inset" />{L.outlined}</li>
            </ul>
            <p className="mt-1 text-sm text-slate-800" data-role="bp-diff">{honestCell ? L.honest : L.diff(ndiff)}</p>
          </>
        ) : (
          <p className="text-xs text-slate-500">{L.polNone}</p>
        )}
      </div>
    </div>
  )
}
