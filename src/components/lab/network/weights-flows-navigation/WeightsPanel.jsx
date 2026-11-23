import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { panelA, backboneA, pathsJob, A_DEFAULT, A_SOURCES } from './experiments.js'
import { NET_M } from './weights.js'

// Panel A, "Weights matter": a preferential-attachment network whose weights
// follow the degrees of the two ends, w ∝ (k_i k_j)^θ, times lognormal noise;
// or the same links with the weights shuffled. Strength and disparity against
// degree, the disparity filter, and routes and betweenness with and without
// weights (from 200 random sources, across animation frames).

const T = {
  en: {
    N: 'Nodes, N',
    theta: 'θ: weight ∝ (k_i k_j)^θ',
    sigma: 'Noise σ (lognormal)',
    shuffle: 'Shuffle the weights',
    alpha: 'Disparity filter, α',
    model: `Preferential attachment, ${NET_M} links per new node. Each weight is (k_i k_j)^θ times exp(σ z), z a standard normal number. "Shuffle" deals the same weights to the links at random.`,
    sChart: 'Mean strength against degree',
    yChart: 'Mean disparity against degree',
    fit: (b) => `fit, β = ${b}`,
    data: 'the network',
    even: '1/k, even split',
    beta: 'β of s ∝ k^β',
    links: 'Links',
    backbone: 'The backbone at this level',
    keptLinks: 'Links kept',
    keptWeight: 'Weight kept',
    keptNodes: 'Nodes kept',
    largest: 'Largest component of the backbone',
    ofN: 'of the nodes',
    routes: `Routes from ${A_SOURCES} random sources`,
    routesNote: 'A link of weight w costs 1/w. A pair "differs" when its cheapest route has more links than its shortest one. Betweenness with and without weights is estimated from the same sources.',
    differ: 'Pairs whose two routes differ',
    hops: 'Mean links: shortest route → cheapest route',
    rho: 'Spearman ρ, betweenness with and without weights',
    running: 'Computing…',
    ariaS: 'Mean strength against degree on logarithmic axes, with the fitted power law',
    ariaY: 'Mean disparity against degree on logarithmic axes, with the line 1/k',
    locale: 'en-US',
  },
  it: {
    N: 'Nodi, N',
    theta: 'θ: peso ∝ (k_i k_j)^θ',
    sigma: 'Rumore σ (lognormale)',
    shuffle: 'Rimescola i pesi',
    alpha: 'Filtro di disparità, α',
    model: `Aggancio preferenziale, ${NET_M} collegamenti per ogni nuovo nodo. Ogni peso è (k_i k_j)^θ per exp(σ z), con z un numero normale standard. «Rimescola» ridistribuisce a caso gli stessi pesi sui collegamenti.`,
    sChart: 'Forza media al variare del grado',
    yChart: 'Disparità media al variare del grado',
    fit: (b) => `fit, β = ${b}`,
    data: 'la rete',
    even: '1/k, ripartizione uniforme',
    beta: 'β di s ∝ k^β',
    links: 'Collegamenti',
    backbone: 'La dorsale a questo livello',
    keptLinks: 'Collegamenti tenuti',
    keptWeight: 'Peso tenuto',
    keptNodes: 'Nodi tenuti',
    largest: 'Componente più grande della dorsale',
    ofN: 'dei nodi',
    routes: `Percorsi da ${A_SOURCES} sorgenti a caso`,
    routesNote: 'Un collegamento di peso w costa 1/w. Una coppia «differisce» quando il suo percorso meno costoso ha più collegamenti di quello più corto. La betweenness con e senza pesi è stimata dalle stesse sorgenti.',
    differ: 'Coppie in cui i due percorsi differiscono',
    hops: 'Collegamenti in media: percorso più corto → meno costoso',
    rho: 'ρ di Spearman, betweenness con e senza pesi',
    running: 'Calcolo in corso…',
    ariaS: 'Forza media al variare del grado su assi logaritmici, con la legge di potenza adattata',
    ariaY: 'Disparità media al variare del grado su assi logaritmici, con la retta 1/k',
    locale: 'it-IT',
  },
}

const decades = (lo, hi) => {
  const a = Math.floor(Math.log10(lo) + 1e-9)
  const b = Math.ceil(Math.log10(hi) - 1e-9)
  return Array.from({ length: Math.max(1, b - a) + 1 }, (_, i) => 10 ** (a + i))
}

export default function WeightsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const pct = (v) => `${num(100 * v, 1)}%`
  const [N, setN] = useState(A_DEFAULT.N)
  const [theta, setTheta] = useState(A_DEFAULT.theta)
  const [sigma, setSigma] = useState(A_DEFAULT.sigma)
  const [shuffle, setShuffle] = useState(A_DEFAULT.shuffle)
  const [alpha, setAlpha] = useState(A_DEFAULT.alpha)
  const a = useMemo(() => panelA({ N, theta, sigma, shuffle }), [N, theta, sigma, shuffle])
  const bb = useMemo(() => backboneA(a, alpha), [a, alpha])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(pathsJob(a))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a])
  const p = exp.data
  const ready = p && p.done && !exp.running

  const kMax = a.sRows[a.sRows.length - 1].k
  const kTicks = decades(1, kMax)
  const xAxis = { min: 1, max: kTicks[kTicks.length - 1], log: true, ticks: kTicks, label: 'k' }
  const sVals = a.sRows.map((r) => r.value)
  const sTicks = decades(Math.min(...sVals), Math.max(...sVals))
  const yVals = a.yRows.map((r) => r.value)
  const yTicks = decades(Math.min(...yVals, 1 / kMax), 1)
  const fitLine = [NET_M, kMax].map((k) => [k, a.fitC * k ** a.beta])

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label={t.N} min={500} max={5000} step={500} value={N} onChange={(v) => setN(Math.round(v / 500) * 500)} format={(v) => Math.round(v).toLocaleString(t.locale)} />
        <Slider label={t.theta} min={0} max={1} step={0.1} value={theta} onChange={(v) => setTheta(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
        <Slider label={t.sigma} min={0} max={1.5} step={0.1} value={sigma} onChange={(v) => setSigma(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <Pill active={shuffle} onClick={() => setShuffle((s) => !s)} data-action="shuffle">
          {t.shuffle}
        </Pill>
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.model}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start" data-readout="weights" data-beta={a.beta.toFixed(3)} data-links={a.links}>
        <div className="min-w-0">
          <Eyebrow>{t.sChart}</Eyebrow>
          <Chart
            x={xAxis}
            y={{ min: sTicks[0], max: sTicks[sTicks.length - 1], log: true, ticks: sTicks, label: 's', labelSide: 'left' }}
            height={170}
            aria={t.ariaS}
            series={[
              { points: fitLine, color: INK, width: 1.4, dashed: true },
              { points: a.sRows.map((r) => [r.k, r.value]), color: ORANGE_DARK, dots: 2.2, line: false },
            ]}
          />
          <Legend items={[{ label: t.data, color: ORANGE_DARK }, { label: t.fit(num(a.beta, 2)), color: INK, dashed: true }]} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.yChart}</Eyebrow>
          <Chart
            x={xAxis}
            y={{ min: yTicks[0], max: 1, log: true, ticks: yTicks, label: 'Y' }}
            height={170}
            aria={t.ariaY}
            series={[
              { points: [NET_M, kMax].map((k) => [k, 1 / k]), color: INK, width: 1.4, dashed: true },
              { points: a.yRows.map((r) => [r.k, r.value]), color: ORANGE_DARK, dots: 2.2, line: false },
            ]}
          />
          <Legend items={[{ label: t.data, color: ORANGE_DARK }, { label: t.even, color: INK, dashed: true }]} />
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.backbone}</Eyebrow>
          <div className="mt-2 max-w-md">
            <Slider label={t.alpha} min={0.001} max={0.5} log value={alpha} onChange={(v) => setAlpha(Number(v.toPrecision(2)))} format={(v) => num(v, v < 0.01 ? 4 : 3)} />
          </div>
          <div
            className="mt-3 grid grid-cols-2 gap-2"
            data-readout="backbone"
            data-alpha={alpha}
            data-links={bb.linkShare.toFixed(3)}
            data-weight={bb.weightShare.toFixed(3)}
            data-nodes={bb.nodeShare.toFixed(3)}
            data-largest={bb.largestShare.toFixed(3)}
          >
            <Stat label={t.keptLinks}>{`${pct(bb.linkShare)} (${bb.links.toLocaleString(t.locale)})`}</Stat>
            <Stat label={t.keptWeight}>
              <span style={{ color: ORANGE_DARK }}>{pct(bb.weightShare)}</span>
            </Stat>
            <Stat label={t.keptNodes}>{pct(bb.nodeShare)}</Stat>
            <Stat label={t.largest}>{`${pct(bb.largestShare)} ${t.ofN}`}</Stat>
          </div>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.routes}</Eyebrow>
          {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
          <div
            className="mt-2 grid grid-cols-2 gap-2"
            data-readout="routes"
            data-done={ready ? '1' : '0'}
            data-differ={ready ? p.differ.toFixed(3) : ''}
            data-rho={ready ? p.rho.toFixed(3) : ''}
            data-hops={ready ? `${p.hopsShort.toFixed(2)} ${p.hopsCheap.toFixed(2)}` : ''}
          >
            <Stat label={t.differ}>{ready ? pct(p.differ) : '–'}</Stat>
            <Stat label={t.rho}>
              <span style={{ color: ORANGE_DARK }}>{ready ? num(p.rho, 3) : '–'}</span>
            </Stat>
            <Stat label={t.hops} wide>
              {ready ? `${num(p.hopsShort, 2)} → ${num(p.hopsCheap, 2)}` : '–'}
            </Stat>
            <Stat label={t.beta}>{num(a.beta, 2)}</Stat>
            <Stat label={t.links}>{a.links.toLocaleString(t.locale)}</Stat>
          </div>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.routesNote}</p>
        </div>
      </div>
    </div>
  )
}
