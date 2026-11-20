import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { mulberry32 } from '../../rng.js'
import { forceLayout, ccdfInt } from '../../graphUtils.js'
import { ORANGE_DARK, INK, SLATE, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { naturalCutoff } from './zeta.js'
import {
  dialNetwork, dialJob, degreesOf, DIAL_SEED, DIAL_DEFAULT, DISTANCE_SOURCES, EXP_GAMMAS, EXP_KMIN, EXP_SIZES, EXP_RUNS, EXP_KINDS,
} from './configmodel.js'

// Panel A, "A dial for the exponent": a configuration-model network whose
// degrees are drawn from p_k ∝ k^(−γ), k ≥ k_min. Self-links are removed and
// repeated links merged. Every number is computed on the full network; when it
// has more than DRAW_N nodes the drawing shows a smaller network of the same
// kind (same γ, k_min and seed). The canvas has no pointer handlers.

const DRAW_N = 250
const COLORS = { 'g2.2': ORANGE_DARK, 'g2.6': '#0284c7', g3: '#16a34a', g4: INK, random: '#94a3b8' }

const T = {
  en: {
    gamma: 'Degree exponent γ',
    kMin: 'Smallest degree, k_min',
    n: 'Nodes, N',
    fresh: 'New network',
    network: (i) => `Network ${i}`,
    drawSame: 'Drawn: the whole network. Node size follows the degree.',
    drawSmall: (n) => `Drawn: a network of the same kind with ${DRAW_N} nodes. Numbers: the full network, N = ${n}. Node size follows the degree.`,
    ccdf: 'Degrees: share of nodes with at least k links',
    reference: (s) => `slope −(γ − 1) = −${s}`,
    data: 'this network',
    N: 'Nodes N',
    L: 'Links L',
    k1: 'Mean degree ⟨k⟩',
    k2: '⟨k²⟩',
    ratio: '⟨k²⟩ / ⟨k⟩',
    max: 'Largest degree · as drawn · natural cutoff',
    self: 'Self-links created · formula',
    rep: 'Repeated links created · formula',
    giant: 'Share in the largest component',
    distance: `Average distance (${DISTANCE_SOURCES} sources)`,
    experiment: 'Experiment: how it grows with N',
    run: 'Run the experiment',
    stop: 'Stop',
    running: 'Computing…',
    expNote: `Median of ${EXP_RUNS} networks at each size, k_min = ${EXP_KMIN}. Random: a random network with the N and L of the γ = 2.6 one. Dashed: k_min N^(1/(γ−1)).`,
    kinds: { 'g2.2': 'γ = 2.2', 'g2.6': 'γ = 2.6', g3: 'γ = 3', g4: 'γ = 4', random: 'Random' },
    chartMax: 'Largest degree',
    chartRatio: '⟨k²⟩ / ⟨k⟩',
    chartDistance: 'Average distance',
    table: (n) => `At N = ${n}`,
    col: ['Network', 'Largest degree', '⟨k²⟩/⟨k⟩', 'Distance'],
    ariaNet: 'A network with power-law degrees; larger circles are nodes with more links',
    ariaCcdf: 'Share of nodes with at least k links against k, on logarithmic axes, with a reference line',
    aria: (what) => `${what} against the number of nodes, one curve per kind of network`,
    locale: 'en-US',
  },
  it: {
    gamma: 'Esponente dei gradi γ',
    kMin: 'Grado minimo, k_min',
    n: 'Nodi, N',
    fresh: 'Nuova rete',
    network: (i) => `Rete ${i}`,
    drawSame: 'Disegnata: la rete intera. La dimensione dei nodi segue il grado.',
    drawSmall: (n) => `Disegnata: una rete dello stesso tipo con ${DRAW_N} nodi. Numeri: la rete completa, N = ${n}. La dimensione dei nodi segue il grado.`,
    ccdf: 'Gradi: quota di nodi con almeno k collegamenti',
    reference: (s) => `pendenza −(γ − 1) = −${s}`,
    data: 'questa rete',
    N: 'Nodi N',
    L: 'Collegamenti L',
    k1: 'Grado medio ⟨k⟩',
    k2: '⟨k²⟩',
    ratio: '⟨k²⟩ / ⟨k⟩',
    max: 'Grado massimo · estratto · cutoff naturale',
    self: 'Cappi creati · formula',
    rep: 'Collegamenti ripetuti creati · formula',
    giant: 'Quota nella componente più grande',
    distance: `Distanza media (${DISTANCE_SOURCES} sorgenti)`,
    experiment: 'Esperimento: come cresce con N',
    run: "Avvia l'esperimento",
    stop: 'Ferma',
    running: 'Calcolo in corso…',
    expNote: `Mediana di ${EXP_RUNS} reti per ogni dimensione, k_min = ${EXP_KMIN}. Casuale: una rete casuale con gli stessi N e L di quella con γ = 2,6. Tratteggiate: k_min N^(1/(γ−1)).`,
    kinds: { 'g2.2': 'γ = 2,2', 'g2.6': 'γ = 2,6', g3: 'γ = 3', g4: 'γ = 4', random: 'Casuale' },
    chartMax: 'Grado massimo',
    chartRatio: '⟨k²⟩ / ⟨k⟩',
    chartDistance: 'Distanza media',
    table: (n) => `Con N = ${n}`,
    col: ['Rete', 'Grado massimo', '⟨k²⟩/⟨k⟩', 'Distanza'],
    ariaNet: 'Una rete con gradi a legge di potenza; i cerchi più grandi sono i nodi con più collegamenti',
    ariaCcdf: 'Quota di nodi con almeno k collegamenti al variare di k, su assi logaritmici, con una retta di riferimento',
    aria: (what) => `${what} al variare del numero di nodi, una curva per tipo di rete`,
    locale: 'it-IT',
  },
}

// 200 … 20,000 on a logarithmic slider, rounded to two significant digits.
const roundN = (v) => {
  const p = 10 ** (Math.floor(Math.log10(v)) - 1)
  return Math.round(v / p) * p
}
const decades = (lo, hi) => {
  const out = []
  for (let e = Math.round(Math.log10(lo)); 10 ** e <= hi * 1.0001; e++) out.push(10 ** e)
  return out
}

function layoutOf(net, seed) {
  const random = mulberry32(seed)
  const start = new Float64Array(2 * net.n)
  for (let i = 0; i < start.length; i++) start[i] = random()
  return fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, start, 0.1, 120), net.n)
}

export default function DialPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [gamma, setGamma] = useState(DIAL_DEFAULT.gamma)
  const [kMin, setKMin] = useState(DIAL_DEFAULT.kMin)
  const [nRaw, setNRaw] = useState(DIAL_DEFAULT.n)
  const [nonce, setNonce] = useState(0)
  const exp = useExperiment()
  const n = roundN(nRaw)
  const seed = DIAL_SEED + nonce
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')

  const d = useMemo(() => dialNetwork(gamma, kMin, n, seed), [gamma, kMin, n, seed])
  const drawing = useMemo(() => {
    const net = n > DRAW_N ? dialNetwork(gamma, kMin, DRAW_N, seed).net : d.net
    const k = degreesOf(net)
    const links = Array.from(net.A, (a, e) => ({ a, b: net.B[e], color: 'rgba(100, 116, 139, 0.3)', width: 0.7 }))
    const order = Array.from(k, (_, i) => i).sort((a, b) => k[a] - k[b])
    const nodes = order.map((i) => ({ i, r: Math.min(13, 1.6 + 1.1 * Math.sqrt(k[i])), fill: k[i] >= 10 ? ORANGE_DARK : INK, stroke: '#fff', lineWidth: 0.6 }))
    return { pos: layoutOf(net, seed), links, nodes }
  }, [d, gamma, kMin, n, seed])

  const s = d.stats
  const ccdf = useMemo(() => ccdfInt(s.degrees).filter((p) => p.k >= 1).map((p) => [p.k, p.p]), [s])
  const xMax = 10 ** Math.max(1, Math.ceil(Math.log10(Math.max(s.max, 2))))
  const yMin = 10 ** -Math.ceil(Math.log10(n))
  // The reference line stops where it leaves the chart.
  const refEnd = Math.min(xMax, kMin * yMin ** (-1 / (gamma - 1)))
  const ref = [
    [kMin, 1],
    [refEnd, (refEnd / kMin) ** -(gamma - 1)],
  ]

  const data = exp.data
  const sizes = EXP_SIZES
  const series = (field) =>
    data
      ? EXP_KINDS.map((id) => ({
          points: data.median[id].map((c, i) => (c ? [sizes[i], c[field]] : null)).filter(Boolean),
          color: COLORS[id],
          width: 1.8,
          dots: 2,
        }))
      : []
  const refs = EXP_GAMMAS.map((g) => ({
    points: [sizes[0], sizes[sizes.length - 1]].map((N) => [N, naturalCutoff(N, g, EXP_KMIN)]),
    color: COLORS[`g${g}`],
    dashed: true,
    width: 1,
    opacity: 0.7,
  }))
  const xN = { min: 100, max: 1e5, log: true, ticks: decades(100, 1e5), label: 'N' }
  const lastIndex = data ? data.median.random.reduce((best, c, i) => (c ? i : best), -1) : -1

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        <Slider label={t.gamma} min={2.1} max={4} step={0.1} value={gamma} onChange={setGamma} format={(v) => dec(v, 1)} />
        <Slider label={t.kMin} min={1} max={4} step={1} value={kMin} onChange={setKMin} />
        <Slider label={t.n} min={200} max={20000} log value={nRaw} onChange={setNRaw} format={(v) => int(roundN(v))} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill onClick={() => setNonce((v) => v + 1)}>{t.fresh}</Pill>
        <span className="font-mono text-xs text-slate-500" data-readout="which">
          {t.network(nonce + 1)}
        </span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <NetCanvas pos={drawing.pos} nodes={drawing.nodes} links={drawing.links} aria={t.ariaNet} maxHeight={320} ratio={0.85} />
          <p className="mt-2 text-xs text-slate-500 leading-snug">{n > DRAW_N ? t.drawSmall(int(n)) : t.drawSame}</p>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.ccdf}</Eyebrow>
          <Chart
            x={{ min: 1, max: xMax, log: true, ticks: decades(1, xMax), label: 'k' }}
            y={{ min: yMin, max: 1, log: true, ticks: decades(yMin, 1) }}
            height={200}
            aria={t.ariaCcdf}
            series={[
              { points: ref, color: SLATE, dashed: true, width: 1.3 },
              { points: ccdf, color: ORANGE_DARK, line: false, dots: 2 },
            ]}
          />
          <Legend
            items={[
              { label: t.data, color: ORANGE_DARK },
              { label: t.reference(dec(gamma - 1, 1)), color: SLATE, dashed: true },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2" data-readout="dial">
        <Stat label={t.N}>{int(n)}</Stat>
        <Stat label={t.L}>{int(s.L)}</Stat>
        <Stat label={t.k1}>{dec(s.k1)}</Stat>
        <Stat label={t.k2}>{dec(s.k2, 1)}</Stat>
        <Stat label={t.ratio}>{dec(s.ratio, 1)}</Stat>
        <Stat label={t.max} wide>
          {int(s.max)} · {int(d.given.max)} · {int(d.cutoff)}
        </Stat>
        <Stat label={t.self}>
          {int(d.net.selfLinks)} · {dec(d.expected.selfLinks, 1)}
        </Stat>
        <Stat label={t.rep}>
          {int(d.net.repeated)} · {dec(d.expected.repeated, 1)}
        </Stat>
        <Stat label={t.giant}>{dec(s.giant, 3)}</Stat>
        <Stat label={t.distance}>{dec(s.distance)}</Stat>
      </div>

      <div className="mt-8">
        <Eyebrow>{t.experiment}</Eyebrow>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {exp.running ? (
            <Pill onClick={exp.cancel}>{t.stop}</Pill>
          ) : (
            <Pill primary onClick={() => exp.run(dialJob())} data-action="experiment">
              {t.run}
            </Pill>
          )}
          <span className="font-mono text-xs text-slate-500" aria-live="polite">
            {exp.running ? `${t.running} ${Math.round(exp.progress * 100)}%` : ''}
          </span>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-5 md:grid-cols-3 items-start">
          <div className="min-w-0">
            <Eyebrow>{t.chartMax}</Eyebrow>
            <Chart x={xN} y={{ min: 1, max: 1e5, log: true, ticks: decades(1, 1e5) }} height={170} aria={t.aria(t.chartMax)} series={[...refs, ...series('max')]} />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.chartRatio}</Eyebrow>
            <Chart x={xN} y={{ min: 1, max: 1000, log: true, ticks: decades(1, 1000) }} height={170} aria={t.aria(t.chartRatio)} series={series('ratio')} />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.chartDistance}</Eyebrow>
            <Chart x={xN} y={{ min: 0, max: 16, ticks: [0, 4, 8, 12, 16], format: (v) => String(v) }} height={170} aria={t.aria(t.chartDistance)} series={series('distance')} />
          </div>
        </div>
        <Legend items={EXP_KINDS.map((id) => ({ label: t.kinds[id], color: COLORS[id] }))} />
        <p className="mt-2 text-xs text-slate-500 leading-snug">{t.expNote}</p>
        {lastIndex >= 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full max-w-xl text-sm" data-readout="experiment" data-done={data.done && !exp.running ? '1' : '0'}>
              <caption className="text-left font-mono text-xs uppercase tracking-wider text-orange-600 font-semibold pb-1">{t.table(int(sizes[lastIndex]))}</caption>
              <thead>
                <tr>
                  {t.col.map((c, i) => (
                    <th key={c} scope="col" className={`pb-1 px-2 font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold ${i ? 'text-right' : 'text-left pl-0'}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXP_KINDS.map((id) => {
                  const c = data.median[id][lastIndex]
                  return (
                    <tr key={id} className="border-t border-slate-100" data-kind={id}>
                      <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-baseline" style={{ background: COLORS[id] }} />
                        {t.kinds[id]}
                      </th>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{c ? int(c.max) : '–'}</td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{c ? dec(c.ratio, 1) : '–'}</td>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{c ? dec(c.distance) : '–'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
