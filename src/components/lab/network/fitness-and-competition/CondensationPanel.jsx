import { useEffect, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, SLATE, GRID, MONO, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { oneJob, oneTheory, ONE_DEFAULT, ONE_BIG, ONE_RUNS } from './experiments.js'
import { B_STAR } from './fitness.js'

// Panel B, "One node above the rest": m = 1, node 0 has fitness 1, every
// other node is uniform on [0, b]. The share of all links held by node 0 as
// the network grows, in ten runs, against the limit 1 − I(b) (0 above
// b* ≈ 0.797), and the particles of run 1 on their energy levels.

const T = {
  en: {
    b: 'The others are uniform on [0, b]',
    sizes: 'Nodes',
    running: 'Growing…',
    I: 'I(b)',
    predicted: 'Predicted share of node 0',
    measured: (n) => `Measured, mean of ${ONE_RUNS} runs at ${n}`,
    regime: 'Regime',
    condensed: 'condensation (b < 0.797)',
    fitGetRich: 'no condensation (b ≥ 0.797)',
    chart: 'Share of all links held by node 0',
    size: 'network size',
    run: 'one run',
    mean: 'mean',
    limit: 'limit',
    levels: 'Run 1 at the end: particles by energy level',
    node0: 'node 0 (ε = 0)',
    others: (lo, hi) => `ε ${lo}–${hi}`,
    aria: 'Share of all links held by node 0 against network size, on a logarithmic axis, for ten runs, their mean and the limit',
    ariaLevels: 'Number of links pointing to the nodes of each energy band in the final network, node 0 apart',
    locale: 'en-US',
  },
  it: {
    b: 'Gli altri sono uniformi su [0, b]',
    sizes: 'Nodi',
    running: 'Crescita in corso…',
    I: 'I(b)',
    predicted: 'Quota prevista del nodo 0',
    measured: (n) => `Misurata, media di ${ONE_RUNS} corse a ${n}`,
    regime: 'Regime',
    condensed: 'condensazione (b < 0,797)',
    fitGetRich: 'nessuna condensazione (b ≥ 0,797)',
    chart: 'Quota di tutti i collegamenti del nodo 0',
    size: 'dimensione della rete',
    run: 'una corsa',
    mean: 'media',
    limit: 'limite',
    levels: 'Corsa 1 alla fine: particelle per livello di energia',
    node0: 'nodo 0 (ε = 0)',
    others: (lo, hi) => `ε ${lo}–${hi}`,
    aria: 'Quota di tutti i collegamenti del nodo 0 al variare della dimensione della rete, su asse logaritmico, per dieci corse, la loro media e il limite',
    ariaLevels: "Numero di collegamenti che puntano ai nodi di ogni fascia di energia nella rete finale, a parte il nodo 0",
    locale: 'it-IT',
  },
}

function Levels({ levels, t, num }) {
  const W = 320
  const rows = levels.bins + 1
  const RH = 13
  const H = rows * RH + 6
  const LABEL = 92
  const max = Math.max(levels.zero, ...levels.counts)
  const width = (c) => ((W - LABEL - 44) * c) / Math.max(1, max)
  const band = levels.max / levels.bins
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.ariaLevels}>
      {[levels.zero, ...levels.counts].map((c, i) => {
        const y = 4 + i * RH
        const label = i === 0 ? t.node0 : t.others(num((i - 1) * band, 1), i === levels.bins ? '∞' : num(i * band, 1))
        return (
          <g key={i}>
            <text x={2} y={y + 8} fontSize="8" fontFamily={MONO} fill={i === 0 ? ORANGE_DARK : SLATE}>
              {label}
            </text>
            <rect x={LABEL} y={y + 1} width={Math.max(0.5, width(c))} height={RH - 4} fill={i === 0 ? ORANGE_DARK : INK} opacity={i === 0 ? 1 : 0.7} />
            <line x1={LABEL} x2={LABEL} y1={y} y2={y + RH} stroke={GRID} />
            <text x={LABEL + width(c) + 4} y={y + 8} fontSize="8" fontFamily={MONO} fill={SLATE}>
              {`${num((100 * c) / levels.links, 1)}%`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function CondensationPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [b, setB] = useState(ONE_DEFAULT.b)
  const [N, setN] = useState(ONE_DEFAULT.N)
  const exp = useExperiment()
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const int = (v) => Math.round(v).toLocaleString(t.locale)

  useEffect(() => {
    exp.run(oneJob({ b, N }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, N])

  const th = oneTheory(b)
  const data = exp.data && exp.data.params.b === b && exp.data.params.N === N ? exp.data : null
  const done = !!data && data.runs.length === data.wanted && !exp.running
  const last = data && data.mean ? data.mean[data.mean.length - 1] : null
  const pts = (arr) => data.sizes.map((s, j) => [s, arr[j]])
  const nTop = 10 ** Math.ceil(Math.log10(N))
  const ticks = []
  for (let v = 100; v <= nTop; v *= 10) ticks.push(v)

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 items-end">
        <Slider label={t.b} min={0.1} max={1} step={0.01} value={b} onChange={(v) => setB(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{t.sizes}</span>
          {[ONE_DEFAULT.N, ONE_BIG].map((n) => (
            <Pill key={n} active={N === n} onClick={() => setN(n)} data-size={n}>
              {int(n)}
            </Pill>
          ))}
          {exp.running && <span className="font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</span>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="condensation" data-done={done ? '1' : '0'} data-i={th.I.toFixed(4)} data-share={th.share.toFixed(4)} data-mean={last == null ? '' : last.toFixed(4)}>
        <Stat label={t.I}>{num(th.I, 3)}</Stat>
        <Stat label={t.predicted}>{num(th.share, 3)}</Stat>
        <Stat label={t.measured(int(N))}>{last == null ? '–' : num(last, 3)}</Stat>
        <Stat label={t.regime}>{b < B_STAR ? t.condensed : t.fitGetRich}</Stat>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.chart}</Eyebrow>
          {data && (
            <>
              <Chart
                x={{ min: 100, max: nTop, log: true, ticks, label: t.size }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
                height={190}
                aria={t.aria}
                series={[
                  { points: [[100, th.share], [nTop, th.share]], color: MUTED, dashed: true, width: 1.4 },
                  ...data.runs.map((r) => ({ points: pts(r), color: ORANGE_DARK, width: 0.9, opacity: 0.35 })),
                  ...(data.mean ? [{ points: pts(data.mean), color: INK, width: 2.2 }] : []),
                ]}
              />
              <Legend
                items={[
                  { label: t.run, color: ORANGE_DARK, opacity: 0.4 },
                  { label: t.mean, color: INK },
                  { label: `${t.limit} ${num(th.share, 3)}`, color: MUTED, dashed: true },
                ]}
              />
            </>
          )}
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.levels}</Eyebrow>
          {data && data.levels && <Levels levels={data.levels} t={t} num={num} />}
        </div>
      </div>
    </div>
  )
}
