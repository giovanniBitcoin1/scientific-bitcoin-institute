import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, MUTED, ORANGE_DARK, MONO } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { equilibrium, curve, PLANNER } from './braess.js'
import { num } from './fmt.js'

// Live figure F2, "Braess's paradox": the network s, v, w, t with its five
// roads labelled by their costs; road widths show the equilibrium flows. A
// switch opens or closes the shortcut v → w, a slider sets its cost c. A
// small chart shows the equilibrium cost against c. SVG only.

const SKY = '#0369a1'
const W = 300
const H = 170
const NODES = { s: [24, 85], v: [150, 22], w: [150, 148], t: [276, 85] }

const T = {
  en: {
    open: 'Shortcut v → w',
    opened: 'open',
    closed: 'closed',
    c: 'c, the shortcut’s cost in hours',
    shares: 'Shares: upper, lower, zigzag',
    costs: 'Route costs: upper, lower, zigzag',
    avg: 'Average cost (equilibrium)',
    planner: 'The planner’s average',
    ratio: 'Ratio',
    closedRoute: 'closed',
    chartLegend: ['equilibrium', 'shortcut closed, and the planner: 1.5'],
    chart: 'the equilibrium cost against c',
    aria: 'Braess’s network: s to t through v or w, with a shortcut from v to w; road widths show the equilibrium flows',
  },
  it: {
    open: 'Scorciatoia v → w',
    opened: 'aperta',
    closed: 'chiusa',
    c: 'c, il costo della scorciatoia in ore',
    shares: 'Quote: in alto, in basso, zigzag',
    costs: 'Costi dei percorsi: in alto, in basso, zigzag',
    avg: 'Costo medio (equilibrio)',
    planner: 'La media del pianificatore',
    ratio: 'Rapporto',
    closedRoute: 'chiusa',
    chartLegend: ['equilibrio', 'scorciatoia chiusa, e il pianificatore: 1,5'],
    chart: 'il costo di equilibrio in funzione di c',
    aria: 'La rete di Braess: da s a t passando per v o per w, con una scorciatoia da v a w; lo spessore delle strade mostra i flussi di equilibrio',
  },
}

function Road({ from, to, flow, label, dashed = false, labelAt = 0.5, dx = 0, dy = 0, id }) {
  const [x1, y1] = NODES[from]
  const [x2, y2] = NODES[to]
  const mx = x1 + (x2 - x1) * labelAt + dx
  const my = y1 + (y2 - y1) * labelAt + dy
  return (
    <g data-road={id} data-flow={flow.toFixed(4)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTED} strokeWidth="1" strokeDasharray={dashed ? '4 3' : undefined} />
      {flow > 1e-9 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ORANGE_DARK} strokeWidth={2 + 12 * flow} strokeLinecap="round" opacity="0.85" />}
      <text x={mx} y={my} fontSize="10" fontFamily={MONO} fill={INK} textAnchor="middle">{label}</text>
    </g>
  )
}

export default function FigureBraess({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n = (v, d = 2) => num(v, lang, d)
  const [open, setOpen] = useState(true)
  const [c, setC] = useState(0)
  const e = equilibrium(c, open)
  const { u, l, z } = e.shares
  const sv = u + z
  const wt = l + z
  const pts = curve(100)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
        <span>{L.open}</span>
        <Pill active={open} onClick={() => setOpen(true)} data-role="shortcut-open">{L.opened}</Pill>
        <Pill active={!open} onClick={() => setOpen(false)} data-role="shortcut-closed">{L.closed}</Pill>
      </div>
      <div className="mt-2 max-w-md">
        <Slider label={L.c} min={0} max={1} step={0.05} value={c} onChange={(v) => setC(Math.round(v * 100) / 100)} format={(v) => n(v, 2)} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="braess-net">
          <Road id="sv" from="s" to="v" flow={sv} label={`x = ${n(sv)}`} dx={-26} dy={-12} />
          <Road id="vt" from="v" to="t" flow={u} label="1" dx={16} dy={-10} />
          <Road id="sw" from="s" to="w" flow={l} label="1" dx={-16} dy={18} />
          <Road id="wt" from="w" to="t" flow={wt} label={`x = ${n(wt)}`} dx={26} dy={20} />
          <Road id="vw" from="v" to="w" flow={open ? z : 0} label={open ? `c = ${n(c)}` : L.closedRoute} dashed={!open} dx={40} dy={4} />
          {Object.entries(NODES).map(([k, [x, y]]) => (
            <g key={k}>
              <circle cx={x} cy={y} r="11" fill="white" stroke={INK} strokeWidth="1.5" />
              <text x={x} y={y + 4} fontSize="12" fontFamily={MONO} fill={INK} textAnchor="middle">{k}</text>
            </g>
          ))}
        </svg>
        <div className="min-w-0">
          <Chart
            height={130}
            x={{ min: 0, max: 1, ticks: [0, 0.5, 1], label: 'c', format: (v) => n(v, 1) }}
            y={{ min: 1, max: 2.1, ticks: [1, 1.5, 2], format: (v) => n(v, 1) }}
            series={[
              { points: [[0, 1.5], [1, 1.5]], color: SKY, dashed: true, width: 1.5 },
              { points: pts, color: ORANGE_DARK },
            ]}
            aria={L.chart}
          >
            {({ sx, sy }) => <circle cx={sx(c)} cy={sy(e.cost)} r="4" fill={open ? ORANGE_DARK : SKY} stroke="white" strokeWidth="1.5" />}
          </Chart>
          <Legend items={L.chartLegend.map((label, i) => ({ label, color: [ORANGE_DARK, SKY][i], dashed: i === 1 }))} />
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm max-w-3xl" data-role="braess-readout">
        {[
          [L.shares, `${n(u)}, ${n(l)}, ${open ? n(z) : '–'}`, 'shares'],
          [L.costs, `${n(e.costs.upper)}, ${n(e.costs.lower)}, ${open ? n(e.costs.zigzag) : '–'}`, 'costs'],
          [L.avg, n(e.cost), 'avg'],
          [L.planner, n(PLANNER), 'planner'],
          [L.ratio, n(e.cost / PLANNER, 4), 'ratio'],
        ].map(([label, v, key]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-mono tabular-nums text-slate-900" data-value={key}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-xs text-slate-500 leading-snug max-w-3xl" style={{ color: SLATE }}>
        {lang === 'it' ? 'Percorsi: in alto s-v-t, in basso s-w-t, zigzag s-v-w-t.' : 'Routes: upper s-v-t, lower s-w-t, zigzag s-v-w-t.'}
      </p>
    </div>
  )
}
