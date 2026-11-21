import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, SLATE, GRID, MONO, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { growAgeing, seedOf } from './fitness.js'
import { ageingJob, accelJob, AGE_DEFAULT, AGE_MAX, AGE_DRAW, AGE_SEED, ACC_DEFAULT, ACC_MAX } from './experiments.js'

// Panel C, "Age and density". Ageing: m = 1, attachment ∝ k τ^(−ν), τ the
// age, computed exactly (every weight recomputed at every step from a table
// of τ^(−ν)). Accelerating growth: the n-th newcomer brings round(n^θ) links,
// the remainder carried, by linear preferential attachment.

const T = {
  en: {
    modes: { ageing: 'Ageing', accel: 'Accelerating growth' },
    nu: 'Ageing exponent ν',
    N: 'Nodes, N',
    theta: 'Acceleration θ',
    running: 'Growing…',
    exact: 'Exact: every weight k τ^(−ν) is recomputed at every step, O(N²); up to 20,000 nodes.',
    mark0: 'ν = 0: module 06',
    mark1: 'ν = 1: no power law beyond',
    gamma: 'γ, module-05 recipe',
    from: (k) => `from k = ${k}`,
    max: 'Largest degree',
    share: 'Share of nodes linked to it',
    born: 'Biggest hub, born',
    nth: (i) => `node ${i}`,
    ccdf: 'Degree distribution, CCDF',
    drawn: `Drawn: a network of the same kind with ${AGE_DRAW} nodes. Node size follows the degree; the oldest node is dark.`,
    links: 'Links against nodes',
    fitted: (a) => `fitted slope ${a}`,
    line: (v) => `1 + θ = ${v}`,
    dist: 'Average distance as the network grows',
    size: 'network size',
    slopeA: 'Densification exponent a',
    meanDeg: 'Mean degree at the end',
    theory: '3 + 2θ/(1 − θ)',
    ariaCcdf: 'Complementary cumulative degree distribution on logarithmic axes',
    ariaNet: 'A small network grown with the same ageing exponent',
    ariaLinks: 'Number of links against number of nodes on logarithmic axes',
    ariaDist: 'Average distance against network size',
    ariaScale: 'The ageing exponent on a scale from −2 to 2, with ν = 0 and ν = 1 marked',
    locale: 'en-US',
  },
  it: {
    modes: { ageing: 'Invecchiamento', accel: 'Crescita accelerata' },
    nu: "Esponente dell'invecchiamento ν",
    N: 'Nodi, N',
    theta: 'Accelerazione θ',
    running: 'Crescita in corso…',
    exact: 'Esatto: ogni peso k τ^(−ν) viene ricalcolato a ogni passo, O(N²); fino a 20.000 nodi.',
    mark0: 'ν = 0: modulo 06',
    mark1: 'ν = 1: oltre, nessuna legge di potenza',
    gamma: 'γ, ricetta del modulo 05',
    from: (k) => `da k = ${k}`,
    max: 'Grado massimo',
    share: 'Quota di nodi collegati a lui',
    born: 'Hub più grande, nato',
    nth: (i) => `nodo ${i}`,
    ccdf: 'Distribuzione dei gradi, CCDF',
    drawn: `Disegnata: una rete dello stesso tipo con ${AGE_DRAW} nodi. La dimensione dei nodi segue il grado; il nodo più vecchio è scuro.`,
    links: 'Collegamenti e nodi',
    fitted: (a) => `pendenza adattata ${a}`,
    line: (v) => `1 + θ = ${v}`,
    dist: 'Distanza media mentre la rete cresce',
    size: 'dimensione della rete',
    slopeA: 'Esponente di densificazione a',
    meanDeg: 'Grado medio alla fine',
    theory: '3 + 2θ/(1 − θ)',
    ariaCcdf: 'Distribuzione cumulativa complementare dei gradi su assi logaritmici',
    ariaNet: "Una piccola rete cresciuta con lo stesso esponente dell'invecchiamento",
    ariaLinks: 'Numero di collegamenti al variare del numero di nodi, su assi logaritmici',
    ariaDist: 'Distanza media al variare della dimensione della rete',
    ariaScale: "L'esponente dell'invecchiamento su una scala da −2 a 2, con ν = 0 e ν = 1 segnati",
    locale: 'it-IT',
  },
}

const decadeTicks = (max) => {
  const out = []
  for (let v = 1; v <= max * 1.0001; v *= 10) out.push(v)
  return out
}

function NuScale({ nu, t }) {
  const W = 320
  const x = (v) => 10 + ((v + 2) / 4) * (W - 20)
  return (
    <svg viewBox={`0 0 ${W} 44`} className="w-full h-auto" role="img" aria-label={t.ariaScale}>
      <line x1={x(-2)} x2={x(2)} y1={10} y2={10} stroke={GRID} strokeWidth="2" />
      {[0, 1].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={4} y2={v === 1 ? 32 : 18} stroke={SLATE} strokeWidth="1.2" />
          <text x={v === 1 ? W - 4 : x(v) + 4} y={v === 1 ? 41 : 27} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor={v === 1 ? 'end' : 'middle'}>
            {v === 0 ? t.mark0 : t.mark1}
          </text>
        </g>
      ))}
      <circle cx={x(nu)} cy={10} r={4.5} fill={ORANGE_DARK} />
    </svg>
  )
}

function Ageing({ t, num, int }) {
  const [nu, setNu] = useState(AGE_DEFAULT.nu)
  const [N, setN] = useState(AGE_DEFAULT.N)
  const exp = useExperiment()
  useEffect(() => {
    exp.run(ageingJob({ nu, N }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nu, N])
  const data = exp.data && exp.data.params.nu === nu && exp.data.params.N === N && exp.data.done ? exp.data : null
  const s = data && data.summary
  const drawing = useMemo(() => {
    const net = growAgeing({ N: AGE_DRAW, nu, seed: seedOf(AGE_SEED, 9) })
    const n = net.n
    const random = mulberry32(17)
    const start = Float64Array.from({ length: 2 * n }, () => random())
    const pos = fitUnit(forceLayout(n, net.A, net.B, net.A.length, start, 0.1, 120), n)
    let big = 1
    for (const k of net.deg) if (k > big) big = k
    const links = Array.from(net.A, (a, e) => ({ a, b: net.B[e], color: 'rgba(100, 116, 139, 0.35)', width: 0.8 }))
    const nodes = Array.from({ length: n }, (_, v) => ({ i: v, r: 1.6 + 5.5 * Math.sqrt(net.deg[v] / big), fill: v === 0 ? INK : ORANGE_DARK }))
    return { pos, links, nodes }
  }, [nu])
  const kMax = s ? 10 ** Math.ceil(Math.log10(Math.max(10, s.max))) : 100
  const yMin = 10 ** -Math.ceil(Math.log10(N))

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Slider label={t.nu} min={-2} max={2} step={0.1} value={nu} onChange={(v) => setNu(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
          <NuScale nu={nu} t={t} />
        </div>
        <Slider label={t.N} min={1000} max={AGE_MAX} log value={N} onChange={(v) => setN(Math.round(v / 500) * 500)} format={(v) => int(v)} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {t.exact} {exp.running && <span className="font-mono">{`${t.running} ${Math.round(exp.progress * 100)}%`}</span>}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <NetCanvas pos={drawing.pos} nodes={drawing.nodes} links={drawing.links} aria={t.ariaNet} maxHeight={280} ratio={0.8} />
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.drawn}</p>
        </div>
        <div className="min-w-0 space-y-3">
          <div className="grid grid-cols-2 gap-2" data-readout="ageing" data-done={s ? '1' : '0'} data-max={s ? s.max : ''} data-hub={s ? s.hub : ''} data-gamma={s && s.fit ? s.fit.gamma.toFixed(3) : ''}>
            <Stat label={t.gamma}>{s && s.fit ? `${num(s.fit.gamma, 2)} ± ${num(s.fit.se, 2)}, ${t.from(int(s.fit.kMin))}` : '–'}</Stat>
            <Stat label={t.max}>{s ? int(s.max) : '–'}</Stat>
            <Stat label={t.born}>{s ? t.nth(int(s.hub + 1)) : '–'}</Stat>
            <Stat label={t.share}>{s ? `${num(100 * s.share, 1)}%` : '–'}</Stat>
          </div>
          <div>
            <Eyebrow>{t.ccdf}</Eyebrow>
            <Chart
              x={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: 'k' }}
              y={{ min: yMin, max: 1, log: true, ticks: decadeTicks(1 / yMin).map((v) => 1 / v).reverse(), label: 'P(K ≥ k)', labelSide: 'left' }}
              height={160}
              aria={t.ariaCcdf}
              series={s ? [{ points: s.ccdf, color: ORANGE_DARK, dots: 1.8, line: false }] : []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Accelerating({ t, num, int }) {
  const [theta, setTheta] = useState(ACC_DEFAULT.theta)
  const [N, setN] = useState(ACC_DEFAULT.N)
  const exp = useExperiment()
  useEffect(() => {
    exp.run(accelJob({ theta, N }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theta, N])
  const data = exp.data && exp.data.params.theta === theta && exp.data.params.N === N && exp.data.done ? exp.data : null
  const r = data && data.result
  const nTop = 10 ** Math.ceil(Math.log10(N))
  const lTop = r ? 10 ** Math.ceil(Math.log10(r.L)) : 1e5
  const kMax = r ? 10 ** Math.ceil(Math.log10(Math.max(10, r.max))) : 100
  const yMin = 10 ** -Math.ceil(Math.log10(N))
  const dMax = r ? Math.ceil(Math.max(...r.dist.map((p) => p[1])) + 0.5) : 5
  // the line 1 + θ through the last point
  const line = r ? [[100, r.links[r.links.length - 1][1] * (100 / N) ** (1 + theta)], [N, r.links[r.links.length - 1][1]]] : []

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label={t.theta} min={0} max={0.6} step={0.05} value={theta} onChange={(v) => setTheta(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <Slider label={t.N} min={1000} max={ACC_MAX} log value={N} onChange={(v) => setN(Math.round(v / 500) * 500)} format={(v) => int(v)} />
      </div>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="accel" data-done={r ? '1' : '0'} data-a={r ? r.a.toFixed(3) : ''} data-gamma={r && r.fit ? r.fit.gamma.toFixed(3) : ''}>
        <Stat label={t.slopeA}>{r ? num(r.a, 3) : '–'}</Stat>
        <Stat label={t.meanDeg}>{r ? num(r.mean, 1) : '–'}</Stat>
        <Stat label={t.gamma}>{r && r.fit ? `${num(r.fit.gamma, 2)} ± ${num(r.fit.se, 2)}, ${t.from(int(r.fit.kMin))}` : '–'}</Stat>
        <Stat label={t.theory}>{num(3 + (2 * theta) / (1 - theta), 2)}</Stat>
      </div>
      {r && (
        <div className="mt-4 grid gap-6 lg:grid-cols-3 items-start">
          <div className="min-w-0">
            <Eyebrow>{t.links}</Eyebrow>
            <Chart
              x={{ min: 100, max: nTop, log: true, ticks: decadeTicks(nTop).filter((v) => v >= 100), label: 'N' }}
              y={{ min: 100, max: lTop, log: true, ticks: decadeTicks(lTop).filter((v) => v >= 100), label: 'E', labelSide: 'left' }}
              height={150}
              aria={t.ariaLinks}
              series={[
                { points: line, color: MUTED, dashed: true, width: 1.4 },
                { points: r.links, color: ORANGE_DARK, dots: 1.8, line: false },
              ]}
            />
            <Legend items={[{ label: t.fitted(num(r.a, 3)), color: ORANGE_DARK }, { label: t.line(num(1 + theta, 2)), color: MUTED, dashed: true }]} />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.dist}</Eyebrow>
            <Chart
              x={{ min: 100, max: nTop, log: true, ticks: decadeTicks(nTop).filter((v) => v >= 100), label: t.size }}
              y={{ min: 0, max: dMax, ticks: Array.from({ length: dMax + 1 }, (_, i) => i) }}
              height={150}
              aria={t.ariaDist}
              series={[{ points: r.dist, color: INK, dots: 2.2, width: 1.5 }]}
            />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.ccdf}</Eyebrow>
            <Chart
              x={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: 'k' }}
              y={{ min: yMin, max: 1, log: true, ticks: decadeTicks(1 / yMin).map((v) => 1 / v).reverse(), label: 'P(K ≥ k)', labelSide: 'left' }}
              height={150}
              aria={t.ariaCcdf}
              series={[{ points: r.ccdf, color: ORANGE_DARK, dots: 1.6, line: false }]}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgeDensityPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [mode, setMode] = useState('ageing')
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['ageing', 'accel'].map((m) => (
          <Pill key={m} active={mode === m} onClick={() => setMode(m)} data-mode={m}>
            {t.modes[m]}
          </Pill>
        ))}
      </div>
      <div className="mt-4">{mode === 'ageing' ? <Ageing t={t} num={num} int={int} /> : <Accelerating t={t} num={num} int={int} />}</div>
    </div>
  )
}
