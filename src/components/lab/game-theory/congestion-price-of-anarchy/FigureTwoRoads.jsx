import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { pigou, average, timePlusToll } from './pigou.js'
import { num } from './fmt.js'

// Live figure F1, "Two roads": Pigou's example. The cost per driver on each
// road against x, the share on the lower road: the upper road flat at 1, the
// lower road x^p, and the average cost x^(p+1) + (1 − x). With the toll on,
// the curve (1 + p)x^p of time plus toll. Sliders and SVG only: nothing
// captures a swipe.

const SKY = '#0369a1'
const UPPER = '#64748b'

const T = {
  en: {
    p: 'p, the lower road takes x^p hours',
    x: 'x, your share on the lower road',
    toll: 'Toll on the lower road',
    on: 'on',
    off: 'off',
    avgAt: 'Average cost at your x',
    eq: 'Equilibrium: share, cost',
    opt: 'Optimum: share x*, cost',
    poa: 'Price of anarchy',
    paid: 'Toll at x*, time plus toll',
    revenue: 'Toll revenue',
    legend: ['upper road, 1', 'lower road, x^p', 'average cost', 'lower road, time plus toll'],
    marks: { eq: 'equilibrium', opt: 'x*', you: 'you' },
    xLabel: 'x →',
    yLabel: 'hours',
    aria: 'Pigou’s two roads: the cost of each road and the average cost against the share on the lower road',
  },
  it: {
    p: 'p, la strada in basso richiede x^p ore',
    x: 'x, la tua quota sulla strada in basso',
    toll: 'Pedaggio sulla strada in basso',
    on: 'sì',
    off: 'no',
    avgAt: 'Costo medio al tuo x',
    eq: 'Equilibrio: quota, costo',
    opt: 'Ottimo: quota x*, costo',
    poa: 'Prezzo dell’anarchia',
    paid: 'Pedaggio in x*, tempo più pedaggio',
    revenue: 'Incasso del pedaggio',
    legend: ['strada in alto, 1', 'strada in basso, x^p', 'costo medio', 'strada in basso, tempo più pedaggio'],
    marks: { eq: 'equilibrio', opt: 'x*', you: 'tu' },
    xLabel: 'x →',
    yLabel: 'ore',
    aria: 'Le due strade di Pigou: il costo di ciascuna strada e il costo medio in funzione della quota sulla strada in basso',
  },
}

export default function FigureTwoRoads({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n = (v, d = 4) => num(v, lang, d)
  const [p, setP] = useState(1)
  const [x, setX] = useState(0.5)
  const [toll, setToll] = useState(false)
  const g = pigou(p, x)
  const xs = Array.from({ length: 101 }, (_, i) => i / 100)
  const eqX = toll ? g.optShare : 1
  const series = [
    { points: xs.map((v) => [v, 1]), color: UPPER, width: 1.5 },
    { points: xs.map((v) => [v, v ** p]), color: ORANGE_DARK },
    { points: xs.map((v) => [v, average(v, p)]), color: INK, width: 2 },
  ]
  if (toll) series.push({ points: xs.map((v) => [v, timePlusToll(v, p)]), color: SKY, dashed: true })
  const marks = [
    { x: eqX, color: ORANGE_DARK, label: L.marks.eq, dashed: true },
    { x: g.optShare, color: SKY, label: L.marks.opt, row: true },
  ]

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.p} min={1} max={6} step={0.5} value={p} onChange={setP} format={(v) => n(v, 1)} />
        <Slider label={L.x} min={0} max={1} step={0.01} value={x} onChange={(v) => setX(Math.round(v * 100) / 100)} format={(v) => n(v, 2)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
        <span>{L.toll}</span>
        <Pill active={!toll} onClick={() => setToll(false)} data-role="toll-off">{L.off}</Pill>
        <Pill active={toll} onClick={() => setToll(true)} data-role="toll-on">{L.on}</Pill>
      </div>
      <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] items-start max-w-3xl">
        <div className="min-w-0" data-role="pigou-chart">
          <Chart
            height={150}
            x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: L.xLabel, format: (v) => (v === 0 || v === 1 ? String(v) : n(v, 2)) }}
            y={{ min: 0, max: 1.5, ticks: [0, 0.5, 1, 1.5], label: L.yLabel, labelSide: 'left', format: (v) => n(v, 1) }}
            series={series}
            marks={marks}
            aria={L.aria}
          >
            {({ sx, sy }) => (
              <g>
                <circle cx={sx(x)} cy={sy(g.average)} r="4" fill="white" stroke={INK} strokeWidth="2" data-role="pigou-you" />
                <text x={sx(x) + (x > 0.8 ? -6 : 6)} y={sy(g.average) + 12} fontSize="9" fill={INK} textAnchor={x > 0.8 ? 'end' : 'start'} fontFamily="IBM Plex Mono, monospace">
                  {L.marks.you}
                </text>
              </g>
            )}
          </Chart>
          <Legend items={L.legend.slice(0, toll ? 4 : 3).map((label, i) => ({ label, color: [UPPER, ORANGE_DARK, INK, SKY][i], dashed: i === 3 }))} />
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1.5 text-sm" data-role="pigou-readout">
          {[
            [L.avgAt, n(g.average), 'avg'],
            [L.eq, toll ? `${n(g.optShare)}, ${n(g.tolled.paid)}` : `${n(1, 0)}, ${n(1, 0)}`, 'eq'],
            [L.opt, `${n(g.optShare)}, ${n(g.optCost)}`, 'opt'],
            [L.poa, n(g.poa), 'poa'],
            ...(toll
              ? [
                  [L.paid, `${n(g.tolled.toll)}, ${n(g.tolled.paid)}`, 'toll'],
                  [L.revenue, n(g.tolled.revenue), 'revenue'],
                ]
              : []),
          ].map(([label, v, key]) => (
            <div key={key} className="min-w-0">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="font-mono tabular-nums text-slate-900" data-value={key}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
