import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, MONO, ORANGE_DARK } from '../../network/ui.jsx'
import { stationary, rates } from './selfish.js'
import { num } from '../auctions/fmt.js'

// Live figure F1, "Hide and release": the states of her private lead, 0, the
// tie 0′, 1, 2, 3 and 4 or more, as a Markov chain with its transition
// probabilities; each node's area is its stationary probability. Readouts:
// p0, p0′, p1 and the rest, her share R against α, and the orphaned blocks per
// 100 mined.

const T = {
  en: {
    alpha: 'α, her share of the hash rate',
    gamma: 'γ, the others who build on her block in a race',
    p0: 'p0, no lead',
    p0p: 'p0′, a race',
    p1: 'p1, a lead of 1',
    rest: 'the rest (2 or more)',
    R: 'R, her share of the chain',
    a: 'α, her share of the work',
    oA: 'her orphaned blocks per 100 mined',
    oH: 'the others’ orphaned blocks per 100 mined',
    ties: 'Out of 0′: α she wins with two blocks; γ(1 − α) one block each; (1 − γ)(1 − α) the others win with two.',
    area: 'Node areas are the stationary probabilities.',
    aria: 'The chain of her private lead with its transition probabilities',
    pays: 'R > α: selfish mining pays',
    notPays: 'R ≤ α: it does not pay',
  },
  it: {
    alpha: 'α, la sua quota dell’hash rate',
    gamma: 'γ, gli altri che costruiscono sul suo blocco in una gara',
    p0: 'p0, nessun vantaggio',
    p0p: 'p0′, una gara',
    p1: 'p1, vantaggio di 1',
    rest: 'il resto (2 o più)',
    R: 'R, la sua quota della catena',
    a: 'α, la sua quota del lavoro',
    oA: 'suoi blocchi orfani ogni 100 trovati',
    oH: 'blocchi orfani degli altri ogni 100 trovati',
    ties: 'Da 0′: con α vince il miner con due blocchi; con γ(1 − α) un blocco ciascuno; con (1 − γ)(1 − α) vincono gli altri con due.',
    area: 'Le aree dei nodi sono le probabilità stazionarie.',
    aria: 'La catena del suo vantaggio privato con le probabilità di transizione',
    pays: 'R > α: il selfish mining conviene',
    notPays: 'R ≤ α: non conviene',
  },
}

const W = 340
const H = 196
const Y = 92
const X = { 0: 34, 1: 132, 2: 196, 3: 254, 4: 308 }
const PP = { x: 83, y: 168 } // 0′
const RMAX = 26

export default function FigureChain({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [a, setA] = useState(0.35)
  const [g, setG] = useState(0)
  const s = stationary(a)
  const r = rates(a, g)
  const p3 = s.pk(3)
  const p4 = Math.max(0, 1 - s.p0 - s.p0p - s.p1 - s.p2 - p3)
  const rad = (p) => Math.max(3, RMAX * Math.sqrt(p))
  const d = (x, k = 4) => num(x, lang, k)
  const b = 1 - a
  const nodes = [
    { key: '0', x: X[0], y: Y, p: s.p0, label: '0' },
    { key: '1', x: X[1], y: Y, p: s.p1, label: '1' },
    { key: '2', x: X[2], y: Y, p: s.p2, label: '2' },
    { key: '3', x: X[3], y: Y, p: p3, label: '3' },
    { key: '4', x: X[4], y: Y, p: p4, label: '4+' },
    { key: "0'", x: PP.x, y: PP.y, p: s.p0p, label: '0′' },
  ]
  const lab = (x, y, t, anchor = 'middle', color = SLATE) => (
    <text x={x} y={y} textAnchor={anchor} fontSize="8.5" fontFamily={MONO} fill={color}>{t}</text>
  )
  const arrow = 'url(#gt13-arrow)'
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <div className="min-w-0">
          <Slider label={L.alpha} min={0} max={0.49} step={0.01} value={a} onChange={(x) => setA(Math.round(x * 100) / 100)} format={(x) => (Math.abs(x - 1 / 3) < 1e-12 ? '1/3' : d(x, 2))} />
          <Pill className="mt-1 normal-case" active={Math.abs(a - 1 / 3) < 1e-12} onClick={() => setA(1 / 3)} data-role="chain-third">α = 1/3</Pill>
        </div>
        <Slider label={L.gamma} min={0} max={1} step={0.05} value={g} onChange={(x) => setG(Math.round(x * 100) / 100)} format={(x) => d(x, 2)} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="chain-svg">
            <defs>
              <marker id="gt13-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 z" fill={SLATE} />
              </marker>
            </defs>
            {/* 0 → 0 (1 − α) */}
            <path d={`M${X[0] - 10},${Y - 22} C${X[0] - 34},${Y - 58} ${X[0] + 34},${Y - 58} ${X[0] + 10},${Y - 22}`} fill="none" stroke={SLATE} markerEnd={arrow} />
            {lab(X[0], Y - 52, '1 − α')}
            {/* forward arrows α */}
            {[[0, 1], [1, 2], [2, 3], [3, 4]].map(([i, j]) => (
              <g key={`f${i}`}>
                <line x1={X[i] + 14} y1={Y - 4} x2={X[j] - 14} y2={Y - 4} stroke={ORANGE_DARK} markerEnd={arrow} />
                {lab((X[i] + X[j]) / 2, Y - 8, 'α', 'middle', ORANGE_DARK)}
              </g>
            ))}
            {/* back arrows 1 − α: 3 → 2, 4+ → 3 */}
            {[[3, 2], [4, 3]].map(([i, j]) => (
              <g key={`b${i}`}>
                <line x1={X[i] - 14} y1={Y + 6} x2={X[j] + 14} y2={Y + 6} stroke={SLATE} markerEnd={arrow} />
                {lab((X[i] + X[j]) / 2, Y + 16, '1 − α')}
              </g>
            ))}
            {/* 4+ → 4+ α */}
            <path d={`M${X[4] - 8},${Y - 20} C${X[4] - 26},${Y - 52} ${X[4] + 26},${Y - 52} ${X[4] + 8},${Y - 20}`} fill="none" stroke={ORANGE_DARK} markerEnd={arrow} />
            {lab(X[4], Y - 46, 'α', 'middle', ORANGE_DARK)}
            {/* 2 → 0 (1 − α): she publishes both */}
            <path d={`M${X[2] - 4},${Y - 18} C${X[2] - 30},${Y - 84} ${X[0] + 40},${Y - 84} ${X[0] + 14},${Y - 18}`} fill="none" stroke={SLATE} markerEnd={arrow} />
            {lab((X[0] + X[2]) / 2 + 10, Y - 66, '1 − α')}
            {/* 1 → 0′ (1 − α) */}
            <line x1={X[1] - 8} y1={Y + 14} x2={PP.x + 14} y2={PP.y - 10} stroke={SLATE} markerEnd={arrow} />
            {lab(X[1] + 2, Y + 44, '1 − α', 'start')}
            {/* 0′ → 0: three ways */}
            <path d={`M${PP.x - 12},${PP.y - 6} C${PP.x - 40},${PP.y - 10} ${X[0] - 14},${Y + 40} ${X[0] - 6},${Y + 16}`} fill="none" stroke={ORANGE_DARK} markerEnd={arrow} />
            <path d={`M${PP.x - 6},${PP.y - 12} C${PP.x - 18},${PP.y - 34} ${X[0] + 10},${Y + 36} ${X[0] + 4},${Y + 18}`} fill="none" stroke={INK} markerEnd={arrow} />
            <path d={`M${PP.x},${PP.y - 14} C${PP.x + 2},${PP.y - 40} ${X[0] + 30},${Y + 30} ${X[0] + 14},${Y + 12}`} fill="none" stroke={SLATE} strokeDasharray="3 2" markerEnd={arrow} />
            {lab(4, PP.y + 2, `α ${d(a, 2)}`, 'start', ORANGE_DARK)}
            {lab(4, PP.y + 13, `γ(1−α) ${d(g * b, 2)}`, 'start', INK)}
            {lab(4, PP.y + 24, `(1−γ)(1−α) ${d((1 - g) * b, 2)}`, 'start', SLATE)}
            {nodes.map((n) => (
              <g key={n.key} data-node={n.key}>
                <circle cx={n.x} cy={n.y} r={rad(n.p)} fill={n.key === '0' || n.key === "0'" ? '#e2e8f0' : '#fed7aa'} stroke={n.key === '0' || n.key === "0'" ? SLATE : ORANGE_DARK} strokeWidth="1" />
                <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fontFamily={MONO} fill={INK}>{n.label}</text>
              </g>
            ))}
          </svg>
          <p className="text-xs text-slate-500 leading-snug">{L.ties} {L.area}</p>
        </div>
        <div className="min-w-0 space-y-1">
          <dl className="grid gap-1 text-sm" data-role="chain-readout">
            {[['p0', s.p0], ['p0p', s.p0p], ['p1', s.p1], ['rest', s.rest]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-slate-600">{L[k]}</dt><dd className="font-mono tabular-nums" data-value={k}>{d(v)}</dd></div>
            ))}
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-1"><dt className="text-slate-600">{L.R}</dt><dd className="font-mono tabular-nums font-semibold" data-value="R">{d(r.R)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.a}</dt><dd className="font-mono tabular-nums" data-value="alpha">{d(a)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-slate-200 pt-1"><dt className="text-slate-600">{L.oA}</dt><dd className="font-mono tabular-nums" data-value="oA">{d(100 * r.oA, 2)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.oH}</dt><dd className="font-mono tabular-nums" data-value="oH">{d(100 * r.oH, 2)}</dd></div>
          </dl>
          <p className={`text-sm font-semibold ${r.R > a + 1e-12 ? 'text-orange-700' : 'text-slate-600'}`} data-value="pays">{r.R > a + 1e-12 ? L.pays : L.notPays}</p>
        </div>
      </div>
    </div>
  )
}
