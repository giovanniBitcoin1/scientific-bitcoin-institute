import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, MUTED, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { relativeRevenue, threshold, curve } from './selfish.js'
import table from './optimal.json'
import { num } from '../auctions/fmt.js'

// Live figure F2, "When does it pay?": Eyal and Sirer's share R against α
// for γ = 0, 1/2, 1 and for a γ slider, with the line R = α and each
// threshold (1 − γ)/(3 − 2γ) marked. A switch adds the best deviation from
// Panel C's precomputed table (dashed), for the γ the table has.

const COL = { 0: '#0369a1', 0.5: '#15803d', 1: '#7c3aed' }
const FIXED = [0, 0.5, 1]

const T = {
  en: {
    gamma: 'γ, the others who build on her block in a race',
    best: 'Add the best deviation (Simulation C)',
    xl: 'α',
    yl: 'her share of the chain',
    line: 'R = α (honest mining)',
    th: (g, t) => `Threshold for γ = ${g}: α > ${t}`,
    bestTh: (t) => `best deviation: ${t}`,
    noTable: 'the table has γ = 0, 1/4, 1/2, 3/4 and 1',
    R40: 'R at α = 0.4',
    aria: 'Her share of the chain against her share of the hash rate',
  },
  it: {
    gamma: 'γ, gli altri che costruiscono sul suo blocco in una gara',
    best: 'Aggiungi la deviazione migliore (Simulazione C)',
    xl: 'α',
    yl: 'la sua quota della catena',
    line: 'R = α (mining onesto)',
    th: (g, t) => `Soglia per γ = ${g}: α > ${t}`,
    bestTh: (t) => `deviazione migliore: ${t}`,
    noTable: 'la tabella ha γ = 0, 1/4, 1/2, 3/4 e 1',
    R40: 'R con α = 0,4',
    aria: 'La sua quota della catena in funzione della sua quota dell’hash rate',
  },
}

const pts = (g) => {
  const out = []
  for (let i = 0; i <= 100; i++) {
    const a = (0.5 * i) / 100
    out.push([a, Math.min(1, relativeRevenue(a, g))])
  }
  return out
}
const GAMMA_LABEL = { 0: '0', 0.25: '1/4', 0.5: '1/2', 0.75: '3/4', 1: '1' }

export default function FigureThreshold({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [g, setG] = useState(0.25)
  const [best, setBest] = useState(false)
  const d = (x, k = 4) => num(x, lang, k)
  const gl = (x) => GAMMA_LABEL[x] ?? d(x, 2)
  const inTable = table.cells.some((c) => Math.abs(c.gamma - g) < 1e-9)
  const series = [
    { points: [[0, 0], [0.5, 0.5]], color: MUTED, width: 1.25, dashed: true },
    ...FIXED.map((x) => ({ points: pts(x), color: COL[x], width: 1.5 })),
    { points: pts(g), color: ORANGE_DARK, width: 2.25 },
  ]
  if (best) {
    for (const x of FIXED) series.push({ points: curve(table, x), color: COL[x], width: 1.5, dashed: true })
    if (inTable && !FIXED.includes(g)) series.push({ points: curve(table, g), color: ORANGE_DARK, width: 1.75, dashed: true })
  }
  const ths = [...FIXED, g].map((x) => [x, threshold(x)])
  const thBest = (x) => table.thresholds.find((t) => Math.abs(t.gamma - x) < 1e-9)
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl items-end">
        <Slider label={L.gamma} min={0} max={1} step={0.05} value={g} onChange={(x) => setG(Math.round(x * 100) / 100)} format={(x) => gl(x)} />
        <div><Pill active={best} onClick={() => setBest(!best)} data-role="thr-best">{L.best}</Pill></div>
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0" data-role="thr-chart">
          <Chart
            height={200}
            x={{ min: 0, max: 0.5, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], label: L.xl, format: (v) => d(v, 1) }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: L.yl, labelSide: 'left', format: (v) => d(v, 2) }}
            series={series}
            aria={L.aria}
          >
            {({ sx, sy }) => (
              <g>
                {ths.map(([x, t], i) => (
                  <circle key={i} cx={sx(t)} cy={sy(t)} r={i === 3 ? 4 : 3} fill="white" stroke={i === 3 ? ORANGE_DARK : COL[x]} strokeWidth="1.75" data-threshold={x} />
                ))}
              </g>
            )}
          </Chart>
          <Legend items={[{ label: 'γ = 0', color: COL[0] }, { label: 'γ = 1/2', color: COL[0.5] }, { label: 'γ = 1', color: COL[1] }, { label: `γ = ${gl(g)}`, color: ORANGE_DARK }, { label: L.line, color: MUTED, dashed: true }]} />
        </div>
        <div className="min-w-0 space-y-1.5 text-sm" data-role="thr-readout">
          {[...FIXED, g].map((x, i) => {
            const tb = thBest(x)
            return (
              <p key={i} className={i === 3 ? 'font-semibold text-slate-900' : 'text-slate-700'} data-value={i === 3 ? 'slider' : `g${x}`}>
                {L.th(gl(x), d(threshold(x)))}
                {best && tb && <span className="block text-xs font-normal text-slate-600">{L.bestTh(d(tb.opt))}</span>}
                {best && !tb && i === 3 && <span className="block text-xs font-normal text-slate-500">{L.noTable}</span>}
              </p>
            )
          })}
          <p className="text-xs text-slate-600 border-t border-slate-200 pt-1" data-value="R40">{L.R40}, γ = {gl(g)}: {d(relativeRevenue(0.4, g))}</p>
        </div>
      </div>
    </div>
  )
}
