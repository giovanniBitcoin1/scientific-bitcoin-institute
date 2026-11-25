import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, SLATE, INK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import NetDraw from './NetDraw.jsx'
import { NETWORKS, starFormula, starCurve, bestResponses } from './netgames.js'
import { num } from './fmt.js'

// Live figure F1, "Complements and substitutes": a star with a hub and four
// leaves; each player's best reply is x_i = max(0, 1 + δ Σ_j g_ij x_j). Node
// sizes show the equilibrium efforts at the δ of the slider; a small chart
// shows the hub's and a leaf's effort against δ. The figure finds the
// equilibrium twice, by the closed form and by best responses from zero,
// and says whether they agree.

const SKY = '#0369a1'
const STAR = NETWORKS.star5
const G = STAR.make()
const CURVE = starCurve()

const T = {
  en: {
    delta: 'δ, the effect of a neighbour’s effort',
    hub: 'Hub (player 1)',
    leaf: 'Each leaf',
    total: 'Total effort',
    regime: 'Regime',
    regimes: {
      complements: 'complements (δ > 0)',
      substitutes: 'substitutes (δ < 0)',
      none: 'no interaction: everyone works 1',
      hubstops: 'substitutes: the hub does nothing',
    },
    br: 'Best responses from zero',
    agree: (k) => `agree (1e-9), ${k} turns`,
    differ: 'they differ',
    chart: 'effort',
    legend: ['hub', 'leaf'],
    marks: { stop: 'hub stops', lim: 'limit ±0.5' },
    aria: 'A star: the hub, player 1, in the middle and four leaves; the size of each player shows its effort',
    chartAria: 'The efforts of the hub and of a leaf against δ, from −0.45 to 0.45',
  },
  it: {
    delta: 'δ, l’effetto dello sforzo di un vicino',
    hub: 'Hub (giocatore 1)',
    leaf: 'Ogni foglia',
    total: 'Sforzo totale',
    regime: 'Regime',
    regimes: {
      complements: 'complementi (δ > 0)',
      substitutes: 'sostituti (δ < 0)',
      none: 'nessuna interazione: tutti fanno 1',
      hubstops: 'sostituti: l’hub non fa nulla',
    },
    br: 'Migliori risposte da zero',
    agree: (k) => `coincidono (1e-9), ${k} giri`,
    differ: 'sono diversi',
    chart: 'sforzo',
    legend: ['hub', 'foglia'],
    marks: { stop: 'l’hub si ferma', lim: 'limite ±0,5' },
    aria: 'Una stella: l’hub, il giocatore 1, al centro e quattro foglie; la dimensione di ogni giocatore mostra il suo sforzo',
    chartAria: 'Gli sforzi dell’hub e di una foglia in funzione di δ, da −0,45 a 0,45',
  },
}

export const radiusOf = (x) => 7 + 3.6 * Math.sqrt(Math.max(0, x))

export default function FigureStar({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n = (v, d = 4) => num(v, lang, d)
  const [delta, setDelta] = useState(0.25)
  const f = starFormula(delta)
  const br = useMemo(() => bestResponses(G, delta), [delta])
  const x = [f.hub, f.leaf, f.leaf, f.leaf, f.leaf]
  const agree = br.ended && br.x.every((v, i) => Math.abs(v - x[i]) <= 1e-9)

  return (
    <div>
      <div className="max-w-md">
        <Slider label={L.delta} min={-0.45} max={0.45} step={0.01} value={delta} onChange={(v) => setDelta(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="max-w-[17rem] w-full mx-auto sm:mx-0">
          <NetDraw
            layout={STAR.layout}
            edges={G.edges}
            radius={(i) => radiusOf(x[i])}
            fill={(i) => (x[i] <= 1e-9 ? 'white' : i === 0 ? ORANGE_DARK : '#fdba74')}
            text={(i) => (i === 0 && x[0] > 1e-9 ? 'white' : undefined)}
            aria={L.aria}
            role="star-net"
            nodeData={(i) => ({ 'data-effort': x[i].toFixed(4) })}
          />
        </div>
        <div className="min-w-0">
          <Chart
            height={130}
            x={{ min: -0.5, max: 0.5, ticks: [-0.4, -0.2, 0, 0.2, 0.4], label: 'δ', format: (v) => num(v, lang, 2) }}
            y={{ min: 0, max: 16, ticks: [0, 4, 8, 12, 16], label: L.chart, labelSide: 'left' }}
            series={[
              { points: CURVE.hub, color: ORANGE_DARK },
              { points: CURVE.leaf, color: SKY },
            ]}
            marks={[
              { x: -0.25, color: SLATE, dashed: true, label: L.marks.stop, row: true },
              { x: -0.5, color: SLATE, dashed: true },
              { x: 0.5, color: SLATE, dashed: true, label: L.marks.lim },
              { x: delta, color: INK },
            ]}
            aria={L.chartAria}
          >
            {({ sx, sy }) => (
              <g>
                <circle cx={sx(delta)} cy={sy(f.hub)} r="3.5" fill={ORANGE_DARK} stroke="white" strokeWidth="1.2" />
                <circle cx={sx(delta)} cy={sy(f.leaf)} r="3.5" fill={SKY} stroke="white" strokeWidth="1.2" />
              </g>
            )}
          </Chart>
          <Legend items={L.legend.map((label, i) => ({ label, color: [ORANGE_DARK, SKY][i] }))} />
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm" data-role="star-readout">
            {[
              [L.hub, n(f.hub), 'hub'],
              [L.leaf, n(f.leaf), 'leaf'],
              [L.total, n(f.total), 'total'],
              [L.br, agree ? L.agree(br.turns) : L.differ, 'br'],
            ].map(([label, v, key]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900" data-value={key}>{v}</dd>
              </div>
            ))}
            <div className="col-span-2 min-w-0">
              <dt className="text-xs text-slate-500">{L.regime}</dt>
              <dd className="text-slate-900" data-value="regime" data-regime={f.regime}>{L.regimes[f.regime]}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
