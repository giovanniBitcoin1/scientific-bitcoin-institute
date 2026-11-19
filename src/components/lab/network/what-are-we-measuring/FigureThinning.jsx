import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, Pill, fmt } from '../ui.jsx'
import Chart, { Legend } from './charts.jsx'
import { poisson, powerLaw, thin, mean } from './thinning.js'

// Live figure F2, "Thinning": every node keeps each of its links with
// probability p. The observed degree distribution is computed exactly by
// binomial thinning (thinning.js), not sampled. A Poisson stays a Poisson; a
// power law keeps its tail and bends at small degrees. Controls are buttons
// and a slider, so the figure never captures a swipe.

const TRUE = {
  poisson: poisson(8),
  power: powerLaw(2.5, 1, 1000),
}

const T = {
  en: {
    truth: 'True distribution',
    poisson: 'Poisson, ⟨k⟩ = 8',
    power: 'Power law, γ = 2.5',
    p: 'Share of links each node keeps, p',
    trueMean: 'True mean',
    obsMean: 'Observed mean',
    none: 'With no links',
    trueLine: 'true',
    obsLine: 'observed',
    k: 'degree k',
    share: 'share of nodes',
    aria: 'True and observed degree distributions',
    notePoisson: 'Still a Poisson, with mean p × 8.',
    notePower: 'Same slope in the tail; the small degrees bend.',
  },
  it: {
    truth: 'Distribuzione vera',
    poisson: 'Poisson, ⟨k⟩ = 8',
    power: 'Potenza, γ = 2.5',
    p: 'Quota di collegamenti conservata, p',
    trueMean: 'Media vera',
    obsMean: 'Media osservata',
    none: 'Senza collegamenti',
    trueLine: 'vera',
    obsLine: 'osservata',
    k: 'grado k',
    share: 'quota di nodi',
    aria: 'Distribuzioni dei gradi vera e osservata',
    notePoisson: 'Ancora una Poisson, con media p × 8.',
    notePower: 'Stessa pendenza nella coda; i gradi piccoli si piegano.',
  },
}

function Readout({ label, children }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-slate-500 leading-tight">{label}</span>
      <span className="block font-mono text-sm text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

export default function FigureThinning({ lang = 'en' }) {
  const t = T[lang] || T.en
  const f = fmt
  const [kind, setKind] = useState('power')
  const [p, setP] = useState(0.5)
  const P = TRUE[kind]
  const Q = useMemo(() => thin(P, p), [P, p])

  const pts = (D, from, to) => {
    const out = []
    for (let k = from; k <= to; k++) out.push([k, D[k]])
    return out
  }
  const isPower = kind === 'power'
  const x = isPower
    ? { min: 1, max: 1000, log: true, ticks: [1, 10, 100, 1000], label: t.k }
    : { min: 0, max: 20, ticks: [0, 5, 10, 15, 20], label: t.k }
  const y = isPower
    ? { min: 1e-8, max: 1, log: true, ticks: [1, 1e-2, 1e-4, 1e-6, 1e-8], label: t.share }
    : { min: 0, max: 0.7, ticks: [0, 0.2, 0.4, 0.6], label: t.share, format: (v) => f(v, 1) }

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[2fr_3fr] items-start">
      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.truth}>
          <Pill active={kind === 'poisson'} onClick={() => setKind('poisson')} className="!px-2.5 !py-1 !normal-case !tracking-normal">
            {t.poisson}
          </Pill>
          <Pill active={kind === 'power'} onClick={() => setKind('power')} className="!px-2.5 !py-1 !normal-case !tracking-normal">
            {t.power}
          </Pill>
        </div>
        <Slider label={t.p} min={0.05} max={1} step={0.05} value={p} onChange={setP} format={(v) => f(v, 2)} />
        <div className="grid grid-cols-3 gap-2">
          <Readout label={t.trueMean}>{f(mean(P), 2)}</Readout>
          <Readout label={t.obsMean}>{f(mean(Q), 2)}</Readout>
          <Readout label={t.none}>{f(100 * Q[0], 1)}%</Readout>
        </div>
        <p className="hidden sm:block text-xs text-slate-500 leading-snug">{isPower ? t.notePower : t.notePoisson}</p>
      </div>
      <div className="min-w-0">
        <Chart
          x={x}
          y={y}
          height={165}
          aria={t.aria}
          series={[
            { points: pts(P, isPower ? 1 : 0, isPower ? 1000 : 20), color: INK, width: 1.5, dots: isPower ? false : 1.8 },
            { points: pts(Q, isPower ? 1 : 0, isPower ? 1000 : 20), color: ORANGE_DARK, width: 2, dots: isPower ? false : 2.2 },
          ]}
        />
        <Legend items={[{ label: t.trueLine, color: INK }, { label: t.obsLine, color: ORANGE_DARK }]} />
      </div>
    </div>
  )
}
