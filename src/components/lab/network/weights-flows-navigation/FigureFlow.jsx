import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, MONO, Pill } from '../ui.jsx'
import { F2_PRESETS, solvePreset } from './figures.js'

// Live figure F2, "One route or several": a small directed network with
// capacities (the one of exercise 3, or a second one). Three views: the widest
// single route, the maximum flow with the routes it uses, the minimum cut.
// Plain SVG; only the buttons listen, so a swipe over the drawing scrolls.

const T = {
  en: {
    presets: { four: 'Exercise 3', six: 'Six nodes' },
    views: { widest: 'Widest route', flow: 'Maximum flow', cut: 'Minimum cut' },
    widest: (label, w) => `The widest single route is ${label}: it carries ${w}, the capacity of its narrowest link.`,
    flow: (v, paths) => `The maximum flow is ${v}: ${paths}. On each link: flow / capacity.`,
    cut: (arcs, c) => `Removing ${arcs} separates s from t. Their capacities add up to ${c}, the maximum flow: no smaller set of links does it.`,
    and: ' and ',
    aria: 'A directed network from s to t with a capacity on every link',
  },
  it: {
    presets: { four: 'Esercizio 3', six: 'Sei nodi' },
    views: { widest: 'Cammino più largo', flow: 'Flusso massimo', cut: 'Taglio minimo' },
    widest: (label, w) => `Il singolo percorso più largo è ${label}: porta ${w}, la capacità del suo collegamento più stretto.`,
    flow: (v, paths) => `Il flusso massimo è ${v}: ${paths}. Su ogni collegamento: flusso / capacità.`,
    cut: (arcs, c) => `Togliendo ${arcs} si separa s da t. Le loro capacità sommano ${c}, il flusso massimo: nessun insieme più piccolo di collegamenti ci riesce.`,
    and: ' e ',
    aria: 'Una rete orientata da s a t con una capacità su ogni collegamento',
  },
}

const W = 320
const H = 170
const PAD = 20
const R = 11

export default function FigureFlow({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [presetId, setPresetId] = useState('four')
  const [view, setView] = useState('widest')
  const preset = F2_PRESETS.find((p) => p.id === presetId)
  const sol = useMemo(() => solvePreset(preset), [preset])
  const x = (v) => PAD + preset.pos[v][0] * (W - 2 * PAD)
  const y = (v) => PAD + preset.pos[v][1] * (H - 2 * PAD)
  const arcName = (i) => `${preset.names[preset.arcs[i][0]]}→${preset.names[preset.arcs[i][1]]}`
  const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')}${t.and}${items[items.length - 1]}` : items[0])
  const on = (i) => (view === 'widest' ? sol.widest.arcs.includes(i) : view === 'flow' ? sol.flow[i] > 0 : sol.cut.includes(i))
  const text =
    view === 'widest'
      ? t.widest(sol.widest.label, sol.widest.width)
      : view === 'flow'
        ? t.flow(sol.maxFlow, sol.paths.map((p) => `${p.label} ${p.amount}`).join(', '))
        : t.cut(list(sol.cut.map(arcName)), sol.cutCapacity)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {F2_PRESETS.map((p) => (
          <Pill key={p.id} active={presetId === p.id} onClick={() => setPresetId(p.id)} data-preset={p.id}>
            {t.presets[p.id]}
          </Pill>
        ))}
        <span className="w-2" aria-hidden="true" />
        {['widest', 'flow', 'cut'].map((v) => (
          <Pill key={v} active={view === v} onClick={() => setView(v)} data-view={v}>
            {t.views[v]}
          </Pill>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full h-auto max-w-md bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
        <defs>
          {[['f2-on', ORANGE_DARK], ['f2-off', MUTED]].map(([id, color]) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
        </defs>
        {preset.arcs.map(([a, b, c], i) => {
          const dx = x(b) - x(a)
          const dy = y(b) - y(a)
          const len = Math.hypot(dx, dy)
          const ux = dx / len
          const uy = dy / len
          const hot = on(i)
          const mx = x(a) + dx * 0.5 - uy * 9
          const my = y(a) + dy * 0.5 + ux * 9
          return (
            <g key={i}>
              <line
                x1={x(a) + ux * R}
                y1={y(a) + uy * R}
                x2={x(b) - ux * (R + 2)}
                y2={y(b) - uy * (R + 2)}
                stroke={hot ? ORANGE_DARK : MUTED}
                strokeWidth={hot ? 2.4 : 1.3}
                strokeDasharray={view === 'cut' && hot ? '4 3' : undefined}
                markerEnd={`url(#${hot ? 'f2-on' : 'f2-off'})`}
              />
              <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fontFamily={MONO} fill={hot ? ORANGE_DARK : SLATE} fontWeight={hot ? 600 : 400}>
                {view === 'flow' ? `${sol.flow[i]}/${c}` : c}
              </text>
            </g>
          )
        })}
        {preset.names.map((name, v) => {
          const source = view === 'cut' && sol.side[v]
          return (
            <g key={v}>
              <circle cx={x(v)} cy={y(v)} r={R} fill={source ? INK : '#ffffff'} stroke={INK} strokeWidth="1.4" />
              <text x={x(v)} y={y(v) + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fill={source ? '#ffffff' : INK}>
                {name}
              </text>
            </g>
          )
        })}
      </svg>
      <p
        className="mt-2 text-sm text-slate-700 leading-snug"
        data-readout="flow"
        data-widest={sol.widest.width}
        data-maxflow={sol.maxFlow}
        data-cut={sol.cutCapacity}
        data-cutarcs={sol.cut.map(arcName).join(' ')}
        data-paths={sol.paths.map((p) => `${p.label} ${p.amount}`).join(', ')}
      >
        {text}
      </p>
    </div>
  )
}
