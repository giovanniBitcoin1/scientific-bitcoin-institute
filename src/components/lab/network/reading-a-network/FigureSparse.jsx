import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, MONO, Pill, sci, sup } from '../ui.jsx'

// Live figure F2: how many links a network of N nodes has (N⟨k⟩/2) against how
// many it could have (N(N − 1)/2), on a log scale, with the density and the
// five networks of the lecture's table. Controls are a slider and buttons, so
// the figure never captures a swipe.

const K_VALUES = [3, 12, 60]

// N and ⟨k⟩ as in the table of the lecture.
const NETWORKS = [
  { id: 'florentine', N: 15, k: 2.67, dx: 2, dy: -6, anchor: 'start' },
  { id: 'karate', N: 34, k: 4.59, dx: -6, dy: 13, anchor: 'start' },
  { id: 'elegans', N: 282, k: 14, dx: 6, dy: -6, anchor: 'start' },
  { id: 'grid', N: 4941, k: 2.67, dx: -7, dy: 11, anchor: 'end' },
  { id: 'actors', N: 225226, k: 61, dx: 7, dy: -4, anchor: 'start' },
]

const T = {
  en: {
    n: 'Nodes N',
    k: 'Average degree ⟨k⟩',
    actual: 'Actual links N⟨k⟩/2',
    possible: 'Possible links N(N − 1)/2',
    density: 'Density',
    capped: 'A node cannot have more than N − 1 links: the network is complete.',
    axisX: 'N',
    axisY: 'density',
    names: { florentine: 'Florentine', karate: 'Karate', elegans: 'C. elegans', grid: 'Power grid', actors: 'Actors' },
    aria: 'Density against number of nodes on logarithmic axes, with five real networks',
  },
  it: {
    n: 'Nodi N',
    k: 'Grado medio ⟨k⟩',
    actual: 'Collegamenti reali N⟨k⟩/2',
    possible: 'Collegamenti possibili N(N − 1)/2',
    density: 'Densità',
    capped: 'Un nodo non può avere più di N − 1 collegamenti: la rete è completa.',
    axisX: 'N',
    axisY: 'densità',
    names: { florentine: 'Fiorentine', karate: 'Karate', elegans: 'C. elegans', grid: 'Rete elettrica', actors: 'Attori' },
    aria: 'Densità in funzione del numero di nodi su assi logaritmici, con cinque reti reali',
  },
}

const LOG_MAX = 18 // the bars span 1 … 10^18 links

// Plot area of the scatter (viewBox units): log N 1 … 9, log density 0 … −9.
const W = 320
const H = 140
const X0 = 34
const X1 = 312
const Y0 = 18
const Y1 = 118
const px = (logN) => X0 + ((logN - 1) / 8) * (X1 - X0)
const py = (logD) => Y0 + (-logD / 9) * (Y1 - Y0)

function Bar({ label, value, color }) {
  const pct = Math.max(1, (Math.log10(Math.max(value, 1)) / LOG_MAX) * 100)
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-slate-600 truncate">{label}</span>
        <span className="font-mono text-slate-900 tabular-nums whitespace-nowrap">{sci(value)}</span>
      </div>
      <div className="mt-0.5 h-2.5 rounded-sm bg-white border border-slate-200 overflow-hidden">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function FigureSparse({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [nRaw, setN] = useState(1000)
  const [k, setK] = useState(12)

  const N = Math.round(nRaw)
  const possible = (N * (N - 1)) / 2
  const capped = k > N - 1
  const actual = capped ? possible : (N * k) / 2
  const density = actual / possible

  // The line density = ⟨k⟩/(N − 1), from the smallest N that can carry ⟨k⟩.
  const line = []
  for (let lx = Math.log10(Math.max(10, k + 1)); lx <= 9.0001; lx += 0.1) {
    line.push(`${px(lx).toFixed(1)},${py(Math.log10(k / (10 ** lx - 1))).toFixed(1)}`)
  }

  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 items-start">
      <div className="space-y-2 min-w-0">
        <Slider label={t.n} min={10} max={1e9} log value={nRaw} onChange={setN} format={(v) => sci(Math.round(v))} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{t.k}</span>
          {K_VALUES.map((v) => (
            <Pill key={v} active={k === v} onClick={() => setK(v)} className="!px-2.5 !py-1">
              {v}
            </Pill>
          ))}
        </div>
        <Bar label={t.actual} value={actual} color={ORANGE_DARK} />
        <Bar label={t.possible} value={possible} color={SLATE} />
        <p className="text-sm text-slate-700">
          {t.density} = <span className="font-mono text-slate-900 tabular-nums">{sci(density)}</span>
          {capped && <span className="block text-xs text-slate-500 leading-snug">{t.capped}</span>}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.aria}>
        {[0, -3, -6, -9].map((d) => (
          <g key={d}>
            <line x1={X0} x2={X1} y1={py(d)} y2={py(d)} stroke={GRID} strokeWidth="1" />
            <text x={X0 - 4} y={py(d) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
              {d === 0 ? '1' : `10${sup(d)}`}
            </text>
          </g>
        ))}
        {[1, 3, 5, 7, 9].map((e) => (
          <text key={e} x={px(e)} y={Y1 + 12} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
            10{e === 1 ? '' : sup(e)}
          </text>
        ))}
        <text x={X1} y={H - 1} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
          {t.axisX}
        </text>
        <text x={X0 + 4} y={Y1 - 4} fontSize="9" fontFamily={MONO} fill={SLATE}>
          {t.axisY} = ⟨k⟩/(N − 1), ⟨k⟩ = {k}
        </text>
        <polyline points={line.join(' ')} fill="none" stroke={ORANGE_DARK} strokeWidth="1.5" />
        {NETWORKS.map((net) => {
          const x = px(Math.log10(net.N))
          const y = py(Math.log10(net.k / (net.N - 1)))
          return (
            <g key={net.id}>
              <circle cx={x} cy={y} r="3" fill={INK} />
              <text x={x + net.dx} y={y + net.dy} textAnchor={net.anchor} fontSize="9" fontFamily={MONO} fill={INK}>
                {t.names[net.id]}
              </text>
            </g>
          )
        })}
        <circle cx={px(Math.log10(N))} cy={py(Math.log10(density))} r="4.5" fill={ORANGE_DARK} stroke="#fff" strokeWidth="1.5" />
        <line x1={px(Math.log10(N))} x2={px(Math.log10(N))} y1={py(Math.log10(density)) + 5} y2={Y1} stroke={MUTED} strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}
