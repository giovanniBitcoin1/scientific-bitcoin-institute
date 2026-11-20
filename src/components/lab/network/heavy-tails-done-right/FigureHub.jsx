import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, MONO, sup } from '../ui.jsx'
import { powerLaw, naturalCutoff, poissonLargest } from './zeta.js'

// Live figure F1, "The biggest hub": for N nodes and a degree exponent γ
// (k_min = 1), three bars on a logarithmic axis: the largest degree to expect
// in a random (Poisson) network with the same mean degree, the natural cutoff
// of the power law, and N − 1, the most that a node can have.

const T = {
  en: {
    n: 'Nodes, N',
    gamma: 'Degree exponent γ',
    random: 'Random network, same ⟨k⟩',
    power: 'Power law: natural cutoff',
    all: 'Every other node, N − 1',
    share: (pct, mean) => `The biggest hub reaches ${pct} of all the nodes. Mean degree of both networks: ${mean}.`,
    aria: 'Three bars on a logarithmic axis: largest degree of a random network, natural cutoff of the power law, and N minus 1',
    locale: 'en-US',
  },
  it: {
    n: 'Nodi, N',
    gamma: 'Esponente dei gradi γ',
    random: 'Rete casuale, stesso ⟨k⟩',
    power: 'Legge di potenza: cutoff naturale',
    all: 'Tutti gli altri nodi, N − 1',
    share: (pct, mean) => `L'hub più grande raggiunge il ${pct} di tutti i nodi. Grado medio delle due reti: ${mean}.`,
    aria: 'Tre barre su un asse logaritmico: grado massimo di una rete casuale, cutoff naturale della legge di potenza e N meno 1',
    locale: 'it-IT',
  },
}

const W = 340
const LEFT = 8
const RIGHT = 8
const X = (v) => LEFT + (Math.log10(Math.max(v, 1)) / 9) * (W - LEFT - RIGHT)

export default function FigureHub({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [n, setN] = useState(1e6)
  const [gamma, setGamma] = useState(2.5)
  const N = Math.round(n)
  const mean = powerLaw(gamma, 1).moment(1)
  const cutoff = Math.min(naturalCutoff(N, gamma), N - 1)
  const random = poissonLargest(N, mean)
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const share = (100 * cutoff) / N
  const pct = `${dec(share, share >= 10 ? 0 : share >= 1 ? 1 : share >= 0.01 ? 2 : 4)}%`
  const bars = [
    { label: t.random, value: random, color: SLATE },
    { label: t.power, value: cutoff, color: ORANGE_DARK },
    { label: t.all, value: N - 1, color: INK },
  ]

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Slider label={t.n} min={100} max={1e9} log value={n} onChange={setN} format={(v) => int(v)} />
        <Slider label={t.gamma} min={2.1} max={4} step={0.05} value={gamma} onChange={setGamma} format={(v) => dec(v, 2)} />
      </div>
      <svg viewBox={`0 0 ${W} 150`} className="mt-3 w-full h-auto max-h-[240px]" role="img" aria-label={t.aria}>
        {Array.from({ length: 10 }, (_, e) => (
          <g key={e}>
            <line x1={X(10 ** e)} x2={X(10 ** e)} y1={8} y2={128} stroke={GRID} strokeWidth="1" />
            <text x={X(10 ** e)} y={142} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
              {e === 0 ? '1' : e === 1 ? '10' : `10${sup(e)}`}
            </text>
          </g>
        ))}
        {bars.map((b, i) => (
          <g key={b.label} data-bar={i} data-value={Math.round(b.value)}>
            <text x={LEFT} y={20 + i * 40} fontSize="10.5" fill={INK}>
              {b.label}
            </text>
            <rect x={X(1)} y={25 + i * 40} width={Math.max(2, X(b.value) - X(1))} height={13} fill={b.color} rx="2" />
            <text
              x={X(b.value) > W * 0.72 ? X(b.value) - 5 : X(b.value) + 5}
              y={35.5 + i * 40}
              textAnchor={X(b.value) > W * 0.72 ? 'end' : 'start'}
              fontSize="10.5"
              fontFamily={MONO}
              fontWeight="600"
              fill={X(b.value) > W * 0.72 ? '#fff' : INK}
            >
              {int(b.value)}
            </text>
          </g>
        ))}
        <line x1={X(1)} x2={X(1e9)} y1={128} y2={128} stroke={MUTED} strokeWidth="1" />
      </svg>
      <p className="mt-1 text-sm text-slate-700 leading-snug" aria-live="polite" data-readout="hub">
        {t.share(pct, dec(mean, 2))}
      </p>
    </div>
  )
}
