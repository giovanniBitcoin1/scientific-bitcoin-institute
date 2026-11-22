import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, MONO, Pill } from '../ui.jsx'
import { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { illusionFigure } from './figures.js'

// Live figure F2, "What your friends show you": 20 nodes, the three hubs
// coloured. Every node shows how many of its neighbours are coloured out of
// its degree; a node that sees a coloured majority gets an orange ring. The
// switch re-pairs the same degrees at random. Plain SVG, no pointer handlers.

const T = {
  en: {
    dis: 'Hubs spread out (disassortative)',
    neutral: 'Neutral mixing, same degrees',
    overall: 'Coloured overall',
    see: 'See a coloured majority',
    of: (a, b) => `${a} of ${b}`,
    note: 'Each label: coloured neighbours / neighbours. An orange ring marks a node more than half of whose neighbours are coloured.',
    aria: 'A network of 20 nodes with three coloured hubs; each node labelled with the share of its neighbours that are coloured',
    locale: 'en-US',
  },
  it: {
    dis: 'Hub sparsi (disassortativa)',
    neutral: 'Mescolamento neutro, stessi gradi',
    overall: 'Colorati in tutto',
    see: 'Vedono una maggioranza colorata',
    of: (a, b) => `${a} su ${b}`,
    note: "Ogni etichetta: vicini colorati / vicini. Un anello arancione segna un nodo che ha colorati più di metà dei suoi vicini.",
    aria: 'Una rete di 20 nodi con tre hub colorati; ogni nodo porta la quota dei suoi vicini colorati',
    locale: 'it-IT',
  },
}

const W = 320
const H = 220
const PAD = 18

export default function FigureIllusion({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [mode, setMode] = useState('disassortative')
  const fig = useMemo(() => illusionFigure(), [])
  const state = fig[mode]
  const pos = useMemo(() => {
    const n = state.net.n
    const random = mulberry32(41)
    const start = Float64Array.from({ length: 2 * n }, () => random())
    return fitUnit(forceLayout(n, state.net.A, state.net.B, state.net.A.length, start, 0.1, 300), n)
  }, [state])
  const n = state.net.n
  const x = (v) => PAD + pos[2 * v] * (W - 2 * PAD)
  const y = (v) => PAD + pos[2 * v + 1] * (H - 2 * PAD)
  const majority = Math.round(state.majority * n)
  const pct = (a) => `${Math.round((100 * a) / n)}%`
  const sees = (v) => 2 * state.seen[v] > state.k[v]

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[
          ['disassortative', t.dis],
          ['neutral', t.neutral],
        ].map(([id, label]) => (
          <Pill key={id} active={mode === id} onClick={() => setMode(id)} data-mode={id}>
            {label}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
          {Array.from(state.net.A, (a, e) => (
            <line key={e} x1={x(a)} y1={y(a)} x2={x(state.net.B[e])} y2={y(state.net.B[e])} stroke="rgba(100, 116, 139, 0.55)" strokeWidth="1" />
          ))}
          {Array.from({ length: n }, (_, v) => {
            const hub = fig.coloured[v] === 1
            return (
              <g key={v}>
                <circle cx={x(v)} cy={y(v)} r={hub ? 9 : 5.5} fill={hub ? ORANGE_DARK : '#ffffff'} stroke={sees(v) ? ORANGE_DARK : INK} strokeWidth={sees(v) ? 3 : 1} />
                <text x={x(v)} y={y(v) - (hub ? 12 : 9)} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={INK}>
                  {`${state.seen[v]}/${state.k[v]}`}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 sm:w-44" data-readout="illusion" data-mode={mode} data-majority={majority} data-r={state.r.toFixed(3)}>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5">
            <span className="block text-xs text-slate-500">{t.overall}</span>
            <span className="block mt-0.5 font-mono text-sm text-slate-900">{`${t.of(3, n)} (${pct(3)})`}</span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5">
            <span className="block text-xs text-slate-500">{t.see}</span>
            <span className="block mt-0.5 font-mono text-sm text-slate-900">{`${t.of(majority, n)} (${pct(majority)})`}</span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5">
            <span className="block text-xs text-slate-500">r</span>
            <span className="block mt-0.5 font-mono text-sm text-slate-900">{state.r.toLocaleString(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
    </div>
  )
}
