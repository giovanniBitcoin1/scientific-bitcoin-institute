import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { mulberry32 } from '../../rng.js'
import { forceLayout } from '../../graphUtils.js'
import { ORANGE_DARK, INK, SLATE, Pill, Eyebrow, fmt } from '../ui.jsx'
import Chart, { Legend, ccdfPoints } from './charts.jsx'
import NetCanvas, { fitUnit } from './NetCanvas.jsx'
import {
  TRUTHS, TRUTH_N, TRUTH_SEED, TRUTH_IDS, METHOD_IDS, METHODS, BIAS_RUNS, BIAS_SEED, csr, fullStats, moments, biasJob, sampleSeed,
} from './sampling.js'

// Panel A, "The observer": the truth on one side, what is observed on the
// other. Seven ways of observing, the numbers read off both networks, the two
// degree distributions, and how the bias changes with the amount observed.
//
// Every number is computed on the full network of 600 nodes. The two drawings
// show a smaller network of the same kind (150 nodes, same model and
// parameters) observed in the same way: laying out and drawing 600 nodes is
// not smooth on a phone. The canvases have no pointer handlers.

const DRAW_N = 150
const SKY = '#0284c7'

const T = {
  en: {
    truth: 'Truth',
    truths: {
      random: 'Random, ⟨k⟩ = 6',
      scaleFree: 'Scale-free, m = 3',
      smallWorld: 'Small-world, k = 6, rewiring 0.05',
      dense: 'Dense random, ⟨k⟩ = 20',
    },
    method: 'Observation',
    methods: {
      nodes: 'Random nodes',
      links: 'Random links',
      snowball: 'Snowball',
      walk: 'Random walk',
      trees: 'Directions from a source',
      spurious: 'Spurious links',
      merged: 'Merged nodes',
    },
    slider: {
      nodes: 'Share of nodes kept, f',
      links: 'Share of links kept, f',
      snowball: 'Share of nodes reached, f',
      walk: 'Share of nodes visited, f',
      trees: 'Number of sources',
      spurious: 'Spurious links added, as a share of L',
      merged: 'Share of nodes merged with another',
    },
    how: {
      nodes: 'Each node is kept with probability f, together with the links among the kept nodes.',
      links: 'Every node is kept; each link is kept with probability f.',
      snowball: 'A random seed, its neighbours, their neighbours… until a share f of the nodes is in; then the links among them.',
      walk: 'A walker steps from node to random neighbour until it has seen a share f of the nodes; then the links among them.',
      trees: 'From each source, one shortest path to every other node. Only the links on those paths are seen.',
      spurious: 'Links that do not exist are recorded between random pairs.',
      merged: 'Random pairs of nodes are taken for one and the same node.',
    },
    again: 'New sample',
    drawTruth: 'The truth',
    drawObserved: 'What is observed',
    drawNote: `Drawn: a network of the same kind with ${DRAW_N} nodes. Numbers: the full network, N = ${TRUTH_N}.`,
    row: {
      n: 'Nodes N',
      l: 'Links L',
      k: 'Average degree ⟨k⟩',
      t: 'Transitivity',
      giant: 'Largest component, share of nodes',
      d: 'Average distance in it',
      kmax: 'Largest degree',
    },
    colTruth: 'Truth',
    colObserved: 'Observed',
    walk: (steps, plain, harmonic, k1, friend) =>
      `Walk of ${steps} steps. True degrees met: plain average ${plain} (⟨k²⟩/⟨k⟩ = ${friend}); weighted by 1/k: ${harmonic} (⟨k⟩ = ${k1}).`,
    snowball: (waves) => `${waves} wave${waves === 1 ? '' : 's'} from the seed.`,
    spurious: (m) => `${m} spurious link${m === 1 ? '' : 's'} added (blue in the drawing).`,
    merged: (m) => `${m} merge${m === 1 ? '' : 's'}: larger circles in the drawing hold more than one true node.`,
    trees: (s) => `${s} source${s === 1 ? '' : 's'} (ringed in the drawing).`,
    dist: 'Degree distributions',
    distTruth: 'truth',
    distObserved: 'observed',
    k: 'degree k',
    share: 'share of nodes',
    shareAbove: 'share of nodes with degree ≥ k',
    bias: 'Bias curves: observed / true',
    biasNote: (runs) => `${runs} samples of the same network pooled at each point. Dashed: exact expectation.`,
    biasK: '⟨k⟩',
    biasT: 'transitivity',
    biasG: 'largest component',
    computing: 'Computing…',
    ariaTruth: 'Drawing of the true network',
    ariaObserved: 'Drawing of the observed network: observed nodes and links are highlighted',
    ariaDist: 'Degree distribution of the true and of the observed network',
    ariaBias: 'Observed over true value of average degree, transitivity and largest component against the amount observed',
  },
  it: {
    truth: 'Verità',
    truths: {
      random: 'Casuale, ⟨k⟩ = 6',
      scaleFree: 'A invarianza di scala, m = 3',
      smallWorld: 'Small-world, k = 6, riconnessione 0.05',
      dense: 'Casuale densa, ⟨k⟩ = 20',
    },
    method: 'Osservazione',
    methods: {
      nodes: 'Nodi a caso',
      links: 'Collegamenti a caso',
      snowball: 'A valanga',
      walk: 'Cammino casuale',
      trees: 'Indicazioni da una sorgente',
      spurious: 'Collegamenti spuri',
      merged: 'Nodi fusi',
    },
    slider: {
      nodes: 'Quota di nodi conservati, f',
      links: 'Quota di collegamenti conservati, f',
      snowball: 'Quota di nodi raggiunti, f',
      walk: 'Quota di nodi visitati, f',
      trees: 'Numero di sorgenti',
      spurious: 'Collegamenti spuri aggiunti, come quota di L',
      merged: 'Quota di nodi fusi con un altro',
    },
    how: {
      nodes: 'Ogni nodo è conservato con probabilità f, insieme ai collegamenti tra i nodi conservati.',
      links: 'Tutti i nodi sono conservati; ogni collegamento è conservato con probabilità f.',
      snowball: 'Un seme a caso, i suoi vicini, i vicini dei vicini… finché non è dentro una quota f dei nodi; poi i collegamenti tra loro.',
      walk: 'Un camminatore passa da un nodo a un vicino a caso finché non ha visto una quota f dei nodi; poi i collegamenti tra loro.',
      trees: 'Da ogni sorgente, un cammino minimo verso ogni altro nodo. Si vedono solo i collegamenti su quei cammini.',
      spurious: 'Si registrano collegamenti che non esistono, tra coppie a caso.',
      merged: 'Coppie di nodi a caso vengono prese per un solo nodo.',
    },
    again: 'Nuovo campione',
    drawTruth: 'La verità',
    drawObserved: 'Ciò che si osserva',
    drawNote: `Disegnata: una rete dello stesso tipo con ${DRAW_N} nodi. Numeri: la rete completa, N = ${TRUTH_N}.`,
    row: {
      n: 'Nodi N',
      l: 'Collegamenti L',
      k: 'Grado medio ⟨k⟩',
      t: 'Transitività',
      giant: 'Componente più grande, quota dei nodi',
      d: 'Distanza media al suo interno',
      kmax: 'Grado massimo',
    },
    colTruth: 'Verità',
    colObserved: 'Osservato',
    walk: (steps, plain, harmonic, k1, friend) =>
      `Cammino di ${steps} passi. Gradi veri incontrati: media semplice ${plain} (⟨k²⟩/⟨k⟩ = ${friend}); pesata con 1/k: ${harmonic} (⟨k⟩ = ${k1}).`,
    snowball: (waves) => `${waves} ondat${waves === 1 ? 'a' : 'e'} dal seme.`,
    spurious: (m) => `${m} collegament${m === 1 ? 'o spurio aggiunto' : 'i spuri aggiunti'} (in blu nel disegno).`,
    merged: (m) => `${m} fusion${m === 1 ? 'e' : 'i'}: i cerchi più grandi nel disegno contengono più di un nodo vero.`,
    trees: (s) => `${s} sorgent${s === 1 ? 'e' : 'i'} (cerchiat${s === 1 ? 'a' : 'e'} nel disegno).`,
    dist: 'Distribuzioni dei gradi',
    distTruth: 'verità',
    distObserved: 'osservata',
    k: 'grado k',
    share: 'quota di nodi',
    shareAbove: 'quota di nodi con grado ≥ k',
    bias: 'Curve di distorsione: osservato / vero',
    biasNote: (runs) => `${runs} campioni della stessa rete, messi insieme, in ogni punto. Tratteggio: valore atteso esatto.`,
    biasK: '⟨k⟩',
    biasT: 'transitività',
    biasG: 'componente più grande',
    computing: 'Calcolo in corso…',
    ariaTruth: 'Disegno della rete vera',
    ariaObserved: 'Disegno della rete osservata: nodi e collegamenti osservati sono evidenziati',
    ariaDist: 'Distribuzione dei gradi della rete vera e di quella osservata',
    ariaBias: 'Rapporto tra valore osservato e vero di grado medio, transitività e componente più grande al variare della quantità osservata',
  },
}

function layout(net) {
  const random = mulberry32(0xd1a6 + net.n)
  const start = Float64Array.from({ length: 2 * net.n }, () => random())
  return fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, start, 0.1, 120), net.n)
}

const niceTicks = (max) => {
  const step = max <= 5 ? 1 : max <= 10 ? 2 : max <= 20 ? 5 : max <= 50 ? 10 : 20
  const out = []
  for (let v = 0; v <= max; v += step) out.push(v)
  return out
}

function Row({ label, a, b }) {
  return (
    <tr className="border-t border-slate-100">
      <th scope="row" className="py-1.5 pr-2 text-left font-normal font-sans text-slate-600 leading-snug">
        {label}
      </th>
      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{a}</td>
      <td className="py-1.5 pl-2 text-right font-mono tabular-nums text-orange-700">{b}</td>
    </tr>
  )
}

export default function ObserverPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [truthId, setTruthId] = useState('scaleFree')
  const [methodId, setMethodId] = useState('nodes')
  const [xs, setXs] = useState(() => Object.fromEntries(METHOD_IDS.map((id) => [id, METHODS[id].initial])))
  const [nonce, setNonce] = useState(0)
  const method = METHODS[methodId]
  const x = xs[methodId]

  // ---- The full network: every number comes from here.
  const truth = useMemo(() => {
    const net = TRUTHS[truthId](TRUTH_SEED)
    return { net, g: csr(net), stats: fullStats(net), moments: moments(net) }
  }, [truthId])
  const observed = useMemo(() => {
    const obs = method.run(truth.net, x, mulberry32(sampleSeed(truthId, methodId, x, nonce)), truth.g)
    return { obs, stats: fullStats(obs) }
  }, [truth, truthId, method, methodId, x, nonce])

  // ---- The small network that is drawn.
  const small = useMemo(() => {
    const net = TRUTHS[truthId](TRUTH_SEED, DRAW_N)
    return { net, g: csr(net), pos: layout(net) }
  }, [truthId])
  const drawing = useMemo(() => {
    const { net, g, pos } = small
    const obs = method.run(net, x, mulberry32(sampleSeed(truthId, methodId, x, nonce) ^ 0x1234), g)
    const of = (v) => (obs.nodeOf ? obs.nodeOf[v] : v)
    const seen = new Uint8Array(net.n)
    for (let v = 0; v < obs.n; v++) seen[of(v)] = 1
    const dense = net.A.length > 4 * net.n
    const truthLinks = Array.from(net.A, (a, e) => ({ a, b: net.B[e], color: `rgba(100, 116, 139, ${dense ? 0.22 : 0.45})`, width: 1 }))
    const truthNodes = Array.from({ length: net.n }, (_, i) => ({ i, r: 2.6, fill: SLATE }))
    const real = net.A.length
    const obsLinks = Array.from(obs.A, (a, e) => {
      const added = methodId === 'spurious' && e >= real
      return { a: of(a), b: of(obs.B[e]), color: added ? SKY : `rgba(234, 88, 12, ${dense ? 0.4 : 0.7})`, width: added ? 1.4 : 1.1 }
    })
    const obsNodes = []
    for (let i = 0; i < net.n; i++) if (!seen[i] && methodId !== 'merged') obsNodes.push({ i, r: 2, fill: '#e2e8f0' })
    for (let v = 0; v < obs.n; v++) obsNodes.push({ i: of(v), r: obs.sizeOf && obs.sizeOf[v] > 1 ? 5 : 2.8, fill: INK })
    if (obs.sources) for (const s of obs.sources) obsNodes.push({ i: s, r: 6.5, stroke: SKY, lineWidth: 2 })
    return { pos, truthLinks, truthNodes, obsLinks, obsNodes }
  }, [small, truthId, method, methodId, x, nonce])

  // ---- Bias curves, recomputed when the truth or the method changes.
  const exp = useExperiment()
  useEffect(() => {
    exp.run(biasJob(truth.net, methodId, BIAS_SEED))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truth, methodId])
  const bias = exp.data && exp.data.methodId === methodId ? exp.data : null

  const a = truth.stats
  const b = observed.stats
  const obs = observed.obs

  // Degree distributions: log axes for the heavy-tailed truth.
  const logAxes = truthId === 'scaleFree'
  const kMax = Math.max(a.maxDegree, b.maxDegree, 4)
  // With a heavy tail, the share of nodes with degree k or more (smooth on
  // log axes); otherwise the share with degree exactly k.
  const distPoints = (s) => (logAxes ? ccdfPoints(s.histogram.map((c) => c / Math.max(1, s.n))) : s.histogram.map((c, k) => [k, c / Math.max(1, s.n)]))
  const distX = logAxes
    ? { min: 1, max: Math.max(100, kMax), log: true, ticks: [1, 10, 100], label: t.k }
    : { min: 0, max: kMax, ticks: niceTicks(kMax), label: t.k }
  const yTop = Math.max(...a.histogram.map((c) => c / a.n), ...b.histogram.map((c) => c / Math.max(1, b.n)))
  const distY = logAxes
    ? { min: 1 / (2 * TRUTH_N), max: 1, log: true, ticks: [1, 0.1, 0.01, 0.001], label: t.shareAbove, format: (v) => String(v) }
    : { min: 0, max: Math.ceil(yTop * 10) / 10 || 0.1, ticks: [0, Math.ceil(yTop * 10) / 20, Math.ceil(yTop * 10) / 10], label: t.share, format: (v) => fmt(v, 2) }

  // Bias chart.
  const biasMax = bias ? Math.max(1.2, ...bias.points.flatMap((p) => [p.meanDegree, p.transitivity, p.giant])) : 1.2
  const yMax = biasMax <= 1.2 ? 1.2 : biasMax <= 2 ? 2 : Math.ceil(biasMax)
  const biasY = { min: 0, max: yMax, ticks: yMax <= 1.2 ? [0, 0.5, 1] : yMax <= 2 ? [0, 1, 2] : niceTicks(yMax).filter((v) => v % 1 === 0), format: (v) => String(v) }
  const biasX = { min: method.grid[0], max: method.grid[method.grid.length - 1], ticks: method.integer ? [1, 2, 4, 6, 8, 10] : methodId === 'merged' ? [0, 0.05, 0.1] : methodId === 'spurious' ? [0, 0.25, 0.5] : [0.05, 0.25, 0.5, 0.75, 1], label: methodId === 'trees' ? t.slider.trees : 'f', format: (v) => String(v) }
  const biasSeries = []
  if (bias) {
    const line = (key, color) => biasSeries.push({ points: bias.points.map((p) => [p.x, p[key]]), color, dots: 2 })
    if (method.exact) {
      const ex = method.grid.map((gx) => [gx, method.exact(gx)])
      if (ex[0][1].meanDegree != null) biasSeries.push({ points: ex.map(([gx, e]) => [gx, e.meanDegree]), color: INK, dashed: true, width: 1, opacity: 0.6 })
      if (ex[0][1].transitivity != null) biasSeries.push({ points: ex.map(([gx, e]) => [gx, e.transitivity]), color: ORANGE_DARK, dashed: true, width: 1, opacity: 0.7 })
    }
    line('giant', SKY)
    line('transitivity', ORANGE_DARK)
    line('meanDegree', INK)
  }

  const setX = (v) => setXs((old) => ({ ...old, [methodId]: v }))
  // A change of truth or of observation starts again from the first sample,
  // so the numbers quoted in "What to observe" can always be found again.
  const pick = (setter, value) => {
    setter(value)
    setNonce(0)
  }
  const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.truth}
          <select value={truthId} onChange={(e) => pick(setTruthId, e.target.value)} className={select}>
            {TRUTH_IDS.map((id) => (
              <option key={id} value={id}>
                {t.truths[id]} (N = {TRUTH_N})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.method}
          <select value={methodId} onChange={(e) => pick(setMethodId, e.target.value)} className={select}>
            {METHOD_IDS.map((id) => (
              <option key={id} value={id}>
                {t.methods[id]}
              </option>
            ))}
          </select>
        </label>
        <Slider
          label={t.slider[methodId]}
          min={method.min}
          max={method.max}
          step={method.step}
          value={x}
          onChange={setX}
          format={(v) => (method.integer ? String(v) : fmt(v, 2))}
        />
        <div>
          <Pill primary onClick={() => setNonce((v) => v + 1)}>
            {t.again}
          </Pill>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{t.how[methodId]}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <Eyebrow>{t.drawTruth}</Eyebrow>
          <div className="mt-2">
            <NetCanvas pos={drawing.pos} nodes={drawing.truthNodes} links={drawing.truthLinks} aria={t.ariaTruth} />
          </div>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.drawObserved}</Eyebrow>
          <div className="mt-2">
            <NetCanvas pos={drawing.pos} nodes={drawing.obsNodes} links={drawing.obsLinks} aria={t.ariaObserved} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.drawNote}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th />
                <th scope="col" className="pb-1 px-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {t.colTruth}
                </th>
                <th scope="col" className="pb-1 pl-2 text-right font-mono text-xs uppercase tracking-wider text-orange-600 font-semibold">
                  {t.colObserved}
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label={t.row.n} a={a.n} b={b.n} />
              <Row label={t.row.l} a={a.L} b={b.L} />
              <Row label={t.row.k} a={fmt(a.meanDegree, 2)} b={fmt(b.meanDegree, 2)} />
              <Row label={t.row.t} a={fmt(a.transitivity, 3)} b={fmt(b.transitivity, 3)} />
              <Row label={t.row.giant} a={fmt(a.giant, 3)} b={fmt(b.giant, 3)} />
              <Row label={t.row.d} a={fmt(a.avgDistance, 2)} b={fmt(b.avgDistance, 2)} />
              <Row label={t.row.kmax} a={a.maxDegree} b={b.maxDegree} />
            </tbody>
          </table>
          <p className="mt-2 min-h-[2.5rem] text-sm text-slate-700 leading-snug" aria-live="polite">
            {methodId === 'walk' && t.walk(obs.steps, fmt(obs.plain, 2), fmt(obs.harmonic, 2), fmt(truth.moments.k1, 2), fmt(truth.moments.friend, 2))}
            {methodId === 'snowball' && t.snowball(obs.waves)}
            {methodId === 'spurious' && t.spurious(obs.added)}
            {methodId === 'merged' && t.merged(obs.merges)}
            {methodId === 'trees' && t.trees(obs.sources.length)}
          </p>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.dist}</Eyebrow>
          <Chart
            x={distX}
            y={distY}
            aria={t.ariaDist}
            series={[
              { points: distPoints(a), color: INK, width: 1.5, dots: logAxes ? false : 1.8 },
              { points: distPoints(b), color: ORANGE_DARK, width: 1.75, dots: logAxes ? false : 2.2 },
            ]}
          />
          <Legend items={[{ label: t.distTruth, color: INK }, { label: t.distObserved, color: ORANGE_DARK }]} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Eyebrow>{t.bias}</Eyebrow>
          <span className="font-mono text-xs text-slate-500" aria-live="polite">
            {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : ''}
          </span>
        </div>
        <div className="max-w-xl">
          <Chart x={biasX} y={biasY} aria={t.ariaBias} height={190} series={biasSeries} marks={[{ x, color: '#94a3b8', dashed: true }]} />
          <Legend
            items={[
              { label: t.biasK, color: INK },
              { label: t.biasT, color: ORANGE_DARK },
              { label: t.biasG, color: SKY },
            ]}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.biasNote(BIAS_RUNS)}</p>
      </div>
    </div>
  )
}
