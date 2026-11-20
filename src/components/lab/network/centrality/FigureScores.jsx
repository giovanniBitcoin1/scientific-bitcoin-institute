import { useMemo, useState } from 'react'
import { INK, SLATE, MONO, ORANGE_DARK, Pill, fmt } from '../ui.jsx'
import { undirected, neighbourStep, eigenvector } from './centrality.js'
import { SIX } from './networks.js'

// Live figure F2, "Scores from neighbours": six nodes that all start with a
// score of 1. Every press of Step replaces each score by the sum of its
// neighbours' scores and rescales so that the largest is 1. The bars settle
// on the eigenvector centrality (the thin marks). Buttons only.

const T = {
  en: {
    step: 'Step',
    ten: '10 steps',
    reset: 'Reset',
    steps: 'Steps',
    gap: 'Largest distance from the limit',

    aria: (n) => `Six nodes and their scores after ${n} steps`,
    ariaBars: 'Current score of each node, with its limit',
  },
  it: {
    step: 'Passo',
    ten: '10 passi',
    reset: 'Azzera',
    steps: 'Passi',
    gap: 'Massima distanza dal limite',

    aria: (n) => `Sei nodi e i loro punteggi dopo ${n} passi`,
    ariaBars: 'Punteggio attuale di ogni nodo, con il suo limite',
  },
}

const X = (v) => 22 + SIX.pos[2 * v] * 156
const Y = (v) => 18 + SIX.pos[2 * v + 1] * 124
const start = () => new Float64Array(SIX.n).fill(1)

export default function FigureScores({ lang = 'en' }) {
  const t = T[lang] || T.en
  const G = useMemo(() => undirected(SIX), [])
  const limit = useMemo(() => eigenvector(G).vector, [G])
  const [state, setState] = useState(() => ({ x: start(), steps: 0 }))
  const advance = (count) =>
    setState((s) => {
      let x = s.x
      for (let i = 0; i < count; i++) x = neighbourStep(G, x)
      return { x, steps: s.steps + count }
    })
  const { x, steps } = state
  let gap = 0
  for (let v = 0; v < SIX.n; v++) gap = Math.max(gap, Math.abs(x[v] - limit[v]))

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-center">
      <svg viewBox="0 0 200 160" className="w-full h-auto max-h-[150px]" role="img" aria-label={t.aria(steps)}>
        {Array.from(SIX.A, (a, e) => (
          <line key={e} x1={X(a)} y1={Y(a)} x2={X(SIX.B[e])} y2={Y(SIX.B[e])} stroke={SLATE} strokeOpacity="0.6" strokeWidth="1.4" />
        ))}
        {SIX.names.map((name, v) => (
          <g key={name}>
            <circle cx={X(v)} cy={Y(v)} r={7 + 9 * x[v]} fill="#fff" stroke={INK} strokeWidth="1.5" />
            <circle cx={X(v)} cy={Y(v)} r={7 + 9 * x[v]} fill={ORANGE_DARK} fillOpacity={0.15 + 0.7 * x[v]} />
            <text x={X(v)} y={Y(v) + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fontWeight="700" fill={INK}>
              {name}
            </text>
          </g>
        ))}
      </svg>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Pill primary onClick={() => advance(1)}>
            {t.step}
          </Pill>
          <Pill onClick={() => advance(10)}>{t.ten}</Pill>
          <Pill onClick={() => setState({ x: start(), steps: 0 })}>{t.reset}</Pill>
        </div>
        <svg viewBox="0 0 300 84" className="w-full h-auto" role="img" aria-label={t.ariaBars}>
          {SIX.names.map((name, v) => (
            <g key={name} transform={`translate(0, ${v * 14})`}>
              <text x="2" y="10" fontSize="10" fontFamily={MONO} fill={INK}>
                {name}
              </text>
              <rect x="16" y="2" width="220" height="9" fill="#f1f5f9" />
              <rect x="16" y="2" width={220 * x[v]} height="9" fill={ORANGE_DARK} fillOpacity="0.85" />
              <line x1={16 + 220 * limit[v]} x2={16 + 220 * limit[v]} y1="0" y2="13" stroke={INK} strokeWidth="1.2" />
              <text x="298" y="10" textAnchor="end" fontSize="9.5" fontFamily={MONO} fill={SLATE}>
                {fmt(x[v], 3)}
              </text>
            </g>
          ))}
        </svg>
        <p className="font-mono text-xs text-slate-700 tabular-nums" aria-live="polite">
          {t.steps}: {steps} · {t.gap}: {fmt(gap, 3)}
        </p>
      </div>
    </div>
  )
}
