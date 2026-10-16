import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import useExperiment from '../useExperiment.js'
import { mulberry32 } from '../rng.js'
import {
  buildCSR,
  sampleNodes,
  erdosRenyiGnm,
  barabasiAlbert,
  degrees,
  ccdfInt,
  powerLawMLEDiscrete,
  removalCurve,
} from '../graphUtils.js'
import {
  FAMILIES,
  sample,
  pdf,
  ccdfExact,
  logBinnedHistogram,
  ccdfSorted,
  runningMean,
  topShare,
  paretoMLE,
} from '../distributions.js'

// Scale-free networks and heavy tails, in three panels: a network grown node
// by node with preferential (or uniform) attachment and its degree CCDF; four
// distributions sampled side by side with bell curves; and the robustness
// experiment, random failure vs targeted attack on BA and ER networks.

const ORANGE = '#f7931a' // hubs, BA
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const BA_LINE = '#ea580c' // orange-600
const ER_COLOR = '#0284c7' // sky-600
const MONO = 'IBM Plex Mono, monospace'

const DRAW_MAX = 500 // above this many nodes the drawing freezes
const HUBS = 5
const ITERS_PER_FRAME = 3
const KMIN_MAX = 20

const ROB_N = 1000
const ROB_M = 2
const F_GRID = Array.from({ length: 33 }, (_, i) => i * 0.025) // 0 … 0.8

const DIST_PARAMS = {
  gaussian: { mu: 10, sigma: 2 },
  exponential: { mean: 10 },
  lognormal: { mu: Math.log(10), sigma: 1 },
  pareto: { xMin: 1 }, // α comes from the slider
}
const KINDS = ['gaussian', 'exponential', 'lognormal', 'pareto']

const T = {
  en: {
    grow: 'Grow a network',
    n: 'Final size n',
    m: 'Links per new node m',
    speed: 'Speed (nodes per frame)',
    seed: 'Seed',
    newNetwork: 'New network',
    preferential: 'Preferential attachment',
    uniform: 'Uniform attachment',
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    canvasAria:
      'Drawing of the growing network. Node size grows with the square root of the degree; the five largest hubs are orange, all other nodes grey.',
    legend: { hub: `${HUBS} largest hubs`, node: 'other nodes (size ∝ √degree)' },
    frozen: (d) =>
      `Drawing frozen at the first ${d} nodes (node sizes still follow their degree). Statistics and chart cover the whole network.`,
    nodes: 'Nodes',
    edges: 'Edges',
    meanDegree: 'Mean degree ⟨k⟩',
    maxDegree: 'Max degree',
    top1: 'Edge ends held by top 1%',
    gammaHat: 'γ̂ (MLE estimate)',
    ccdfTitle: 'Degree distribution, P(K ≥ k)',
    ccdfAria:
      'Log–log scatter plot of the share of nodes with degree at least k, for the grown network and for a random graph with the same size and mean degree, with a dashed reference line of slope −2.',
    seriesBA: (uniform) => (uniform ? 'grown network (uniform)' : 'grown network (preferential)'),
    seriesER: 'random graph, same n and ⟨k⟩',
    slope: 'slope −2 (γ = 3)',
    kMin: 'k_min for the estimate',
    gammaNote: (kMin) =>
      `γ̂ = 1 + N / Σ ln(kᵢ / (k_min − ½)) over the N nodes with k ≥ ${kMin} (discrete approximation of Clauset, Shalizi and Newman). It is an estimate that assumes the tail is a power law: with k_min = m it comes out well below 3, because at small k the model's degree distribution bends away from a straight line. Raise k_min and watch it move.`,
    tooltipK: (k) => `k = ${k}`,
    tails: 'Heavy tails vs bell curves',
    kinds: { gaussian: 'Gaussian', exponential: 'Exponential', lognormal: 'Lognormal', pareto: 'Pareto' },
    params: {
      gaussian: 'mean 10, standard deviation 2',
      exponential: 'mean 10',
      lognormal: 'median 10, σ = 1 for ln x',
      pareto: (a) => `x_min = 1, P(X > x) = x^(−${a.toFixed(2)})`,
    },
    alpha: 'Tail exponent α',
    sampleSize: 'Sample size N',
    newSample: 'New sample',
    histTitle: 'Histogram, logarithmic bins',
    histAria: 'Log–log plot of the sample histogram with logarithmic bins, with the exact density as a dashed line.',
    ccdfTitle2: 'CCDF, P(X ≥ x)',
    ccdf2Aria: 'Log–log plot of the share of the sample at least x, with the exact curve as a dashed line.',
    meanTitle: 'Running mean vs sample size',
    meanAria:
      'Mean of the first n values of the sample as n grows, on a logarithmic n axis, with the exact mean as a dashed horizontal line.',
    sampleLegend: 'sample',
    exactLegend: 'exact',
    sampleMean: 'Sample mean',
    exactMean: (v) => `exact ${v}`,
    median: 'Median',
    max: 'Max',
    top20: 'Share held by top 20%',
    alphaHat: 'α̂ (MLE, x_min known)',
    onlyPareto: 'Pareto only',
    alphaNote: 'α̂ = N / Σ ln(xᵢ / x_min), standard error α̂ / √N.',
    tailsNote:
      'Only positive values can sit on a log axis; a Gaussian sample with mean 10 and σ = 2 has essentially none below zero. For α ≤ 2 the Pareto variance is infinite and the running mean keeps jumping; for α ≤ 1 there would be no mean at all.',
    tooltipN: (n) => `n = ${n.toLocaleString('en-US')}`,
    robustness: 'Random failure vs targeted attack',
    robTitle: `Largest component S vs fraction removed f, n = ${ROB_N}`,
    robAria:
      'Line chart of the largest connected component, as a fraction of the original network, against the fraction of nodes removed, for random failures and targeted attacks on a scale-free and a random network.',
    curves: { baR: 'BA, random failure', baA: 'BA, targeted attack', erR: 'ER, random failure', erA: 'ER, targeted attack' },
    trials: 'Realisations T',
    run: { play: 'Run', pause: 'Cancel' },
    running: 'Computing…',
    done: (t) => `Average of ${t} realisation${t === 1 ? '' : 's'} of each network.`,
    cancelled: (p) => `Cancelled at ${Math.round(p * 100)}%: partial averages.`,
    robNote: `BA: Barabási–Albert with n = ${ROB_N}, m = ${ROB_M} (mean degree ≈ 4). ER: random graph with the same number of nodes and edges. Random failure removes nodes in a random order. Targeted attack removes them in decreasing order of their degree in the intact network: degrees are not recomputed after each removal, and ties are broken at random. S is measured as a fraction of the original ${ROB_N} nodes.`,
    tooltipF: (f) => `f = ${f.toFixed(3)}`,
  },
  it: {
    grow: 'Fai crescere una rete',
    n: 'Dimensione finale n',
    m: 'Collegamenti per nuovo nodo m',
    speed: 'Velocità (nodi per fotogramma)',
    seed: 'Seme',
    newNetwork: 'Nuova rete',
    preferential: 'Aggancio preferenziale',
    uniform: 'Aggancio uniforme',
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    canvasAria:
      'Disegno della rete che cresce. La dimensione dei nodi cresce con la radice quadrata del grado; i cinque hub più grandi sono arancioni, tutti gli altri nodi grigi.',
    legend: { hub: `${HUBS} hub più grandi`, node: 'altri nodi (dimensione ∝ √grado)' },
    frozen: (d) =>
      `Disegno fermo ai primi ${d} nodi (la dimensione dei nodi segue ancora il loro grado). Statistiche e grafico riguardano l'intera rete.`,
    nodes: 'Nodi',
    edges: 'Collegamenti',
    meanDegree: 'Grado medio ⟨k⟩',
    maxDegree: 'Grado massimo',
    top1: "Estremi dei collegamenti all'1% più connesso",
    gammaHat: 'γ̂ (stima di massima verosimiglianza)',
    ccdfTitle: 'Distribuzione dei gradi, P(K ≥ k)',
    ccdfAria:
      'Grafico log–log della frazione di nodi con grado almeno k, per la rete cresciuta e per un grafo casuale con la stessa dimensione e lo stesso grado medio, con una retta tratteggiata di pendenza −2.',
    seriesBA: (uniform) => (uniform ? 'rete cresciuta (uniforme)' : 'rete cresciuta (preferenziale)'),
    seriesER: 'grafo casuale, stessi n e ⟨k⟩',
    slope: 'pendenza −2 (γ = 3)',
    kMin: 'k_min per la stima',
    gammaNote: (kMin) =>
      `γ̂ = 1 + N / Σ ln(kᵢ / (k_min − ½)) sugli N nodi con k ≥ ${kMin} (approssimazione discreta di Clauset, Shalizi e Newman). È una stima che presuppone una coda a legge di potenza: con k_min = m risulta ben sotto 3, perché per k piccoli la distribuzione dei gradi del modello si piega rispetto a una retta. Alza k_min e guarda come cambia.`,
    tooltipK: (k) => `k = ${k}`,
    tails: 'Code pesanti e curve a campana',
    kinds: { gaussian: 'Gaussiana', exponential: 'Esponenziale', lognormal: 'Lognormale', pareto: 'Pareto' },
    params: {
      gaussian: 'media 10, deviazione standard 2',
      exponential: 'media 10',
      lognormal: 'mediana 10, σ = 1 per ln x',
      pareto: (a) => `x_min = 1, P(X > x) = x^(−${a.toFixed(2).replace('.', ',')})`,
    },
    alpha: 'Esponente della coda α',
    sampleSize: 'Dimensione del campione N',
    newSample: 'Nuovo campione',
    histTitle: 'Istogramma, classi logaritmiche',
    histAria:
      "Grafico log–log dell'istogramma del campione con classi logaritmiche, con la densità esatta come linea tratteggiata.",
    ccdfTitle2: 'CCDF, P(X ≥ x)',
    ccdf2Aria: 'Grafico log–log della frazione del campione almeno pari a x, con la curva esatta tratteggiata.',
    meanTitle: 'Media progressiva e dimensione del campione',
    meanAria:
      'Media dei primi n valori del campione al crescere di n, su un asse n logaritmico, con la media esatta come linea orizzontale tratteggiata.',
    sampleLegend: 'campione',
    exactLegend: 'esatta',
    sampleMean: 'Media del campione',
    exactMean: (v) => `esatta ${v}`,
    median: 'Mediana',
    max: 'Massimo',
    top20: 'Quota del 20% più alto',
    alphaHat: 'α̂ (MV, x_min noto)',
    onlyPareto: 'solo Pareto',
    alphaNote: 'α̂ = N / Σ ln(xᵢ / x_min), errore standard α̂ / √N.',
    tailsNote:
      "Su un asse logaritmico stanno solo valori positivi; un campione gaussiano con media 10 e σ = 2 in pratica non ne ha sotto lo zero. Per α ≤ 2 la varianza della Pareto è infinita e la media progressiva continua a saltare; per α ≤ 1 la media non esisterebbe affatto.",
    tooltipN: (n) => `n = ${n.toLocaleString('it-IT')}`,
    robustness: 'Guasti casuali e attacchi mirati',
    robTitle: `Componente più grande S e frazione rimossa f, n = ${ROB_N}`,
    robAria:
      "Grafico a linee della componente connessa più grande, come frazione della rete originale, in funzione della frazione di nodi rimossi, per guasti casuali e attacchi mirati su una rete a invarianza di scala e su una rete casuale.",
    curves: {
      baR: 'BA, guasti casuali',
      baA: 'BA, attacco mirato',
      erR: 'ER, guasti casuali',
      erA: 'ER, attacco mirato',
    },
    trials: 'Realizzazioni T',
    run: { play: 'Calcola', pause: 'Annulla' },
    running: 'Calcolo in corso…',
    done: (t) => `Media di ${t} realizzazion${t === 1 ? 'e' : 'i'} di ciascuna rete.`,
    cancelled: (p) => `Annullato al ${Math.round(p * 100)}%: medie parziali.`,
    robNote: `BA: Barabási–Albert con n = ${ROB_N}, m = ${ROB_M} (grado medio ≈ 4). ER: grafo casuale con lo stesso numero di nodi e di collegamenti. I guasti casuali rimuovono i nodi in ordine casuale. L'attacco mirato li rimuove in ordine decrescente del loro grado nella rete intatta: i gradi non vengono ricalcolati dopo ogni rimozione e i pareggi sono risolti a caso. S è misurata come frazione dei ${ROB_N} nodi originali.`,
    tooltipF: (f) => `f = ${f.toFixed(3).replace('.', ',')}`,
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const fmt = (v, d) => (v == null || !Number.isFinite(v) ? '–' : v.toFixed(d))

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const powTick = (v) => {
  const e = Math.round(Math.log10(v))
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${String(e).replace(/./g, (c) => SUPERSCRIPT[c])}`
}

// Powers of ten covering [lo, hi], for the domain and ticks of a log axis.
function decades(lo, hi) {
  const a = Math.floor(Math.log10(lo))
  const b = Math.max(a + 1, Math.ceil(Math.log10(hi) - 1e-9))
  const ticks = []
  for (let e = a; e <= b; e++) ticks.push(10 ** e)
  return { domain: [10 ** a, 10 ** b], ticks }
}

// Values spaced evenly in log between lo and hi, for drawing exact curves.
function logSpace(lo, hi, count = 60) {
  const a = Math.log10(lo)
  const b = Math.log10(hi)
  return Array.from({ length: count }, (_, i) => 10 ** (a + ((b - a) * i) / (count - 1)))
}

// Short numbers for statistics that range from about 1 to 10⁵.
function fmtNum(v, locale) {
  if (!Number.isFinite(v)) return '–'
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString(locale)
  return v.toLocaleString(locale, { maximumFractionDigits: Math.abs(v) >= 100 ? 1 : 2 })
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}

function PanelTitle({ children }) {
  return (
    <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
      {children}
    </p>
  )
}

const panel = 'bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 min-w-0'
const axisTick = { fontSize: 11, fontFamily: MONO }
const tooltipStyle = { fontFamily: MONO, fontSize: 12 }

const tab = (active) =>
  `px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
  }`

function Stat({ label, children, wide = false }) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 px-3 py-2.5 min-w-0 ${
        wide ? 'col-span-2 sm:col-span-3' : ''
      }`}
    >
      <span className="block text-xs text-slate-500 font-sans">{label}</span>
      <span className="block mt-0.5 text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

function LineSwatch({ color, width = 2, dashed = false }) {
  return (
    <span
      className="inline-block w-5 shrink-0"
      style={{ borderTop: `${width}px ${dashed ? 'dashed' : 'solid'} ${color}` }}
      aria-hidden="true"
    />
  )
}

function DotSwatch({ color, size = 8 }) {
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
      aria-hidden="true"
    />
  )
}

function Legend({ children }) {
  return <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">{children}</div>
}

function LegendItem({ swatch, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch} {children}
    </span>
  )
}

// A Scatter drawn only as a line, for exact curves and reference slopes.
const NoDot = () => null

function ProgressBar({ progress }) {
  return (
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
      <div
        className="h-full bg-orange-500 transition-[width] duration-150"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------- Panel A

// Places nodes [count, target) of the network next to the first node each one
// linked to, so a newcomer appears beside the node it chose.
function placeNodes(lay, net, target) {
  const { pos, random } = lay
  const m0 = net.m0
  while (lay.count < target) {
    const v = lay.count
    const K = 0.9 / Math.sqrt(v + 1)
    const a = random() * 2 * Math.PI
    if (v < m0) {
      pos[2 * v] = 0.5 + 0.05 * Math.cos((2 * Math.PI * v) / m0)
      pos[2 * v + 1] = 0.5 + 0.05 * Math.sin((2 * Math.PI * v) / m0)
    } else {
      const u = net.B[net.edgesUpTo[v]]
      pos[2 * v] = pos[2 * u] + K * Math.cos(a)
      pos[2 * v + 1] = pos[2 * u + 1] + K * Math.sin(a)
    }
    lay.count++
  }
}

// One Fruchterman–Reingold iteration on the nodes laid out so far: pairs repel
// with K²/d, edges attract with d²/K, a weak pull keeps the picture centred,
// and moves are capped by a temperature that follows lay.heat.
function relax(lay, net) {
  const { pos, disp } = lay
  const n = lay.count
  const edges = net.edgesUpTo[n]
  const K = 0.9 / Math.sqrt(n)
  const K2 = K * K
  const GRAVITY = 3
  disp.fill(0, 0, 2 * n)
  for (let i = 0; i < n; i++) {
    const xi = pos[2 * i]
    const yi = pos[2 * i + 1]
    for (let j = i + 1; j < n; j++) {
      const dx = xi - pos[2 * j]
      const dy = yi - pos[2 * j + 1]
      const f = K2 / Math.max(dx * dx + dy * dy, 1e-8)
      disp[2 * i] += dx * f
      disp[2 * i + 1] += dy * f
      disp[2 * j] -= dx * f
      disp[2 * j + 1] -= dy * f
    }
  }
  const { A, B } = net
  for (let e = 0; e < edges; e++) {
    const a = A[e]
    const b = B[e]
    const dx = pos[2 * a] - pos[2 * b]
    const dy = pos[2 * a + 1] - pos[2 * b + 1]
    const f = Math.sqrt(dx * dx + dy * dy) / K
    disp[2 * a] -= dx * f
    disp[2 * a + 1] -= dy * f
    disp[2 * b] += dx * f
    disp[2 * b + 1] += dy * f
  }
  const temp = 0.06 * lay.heat
  for (let i = 0; i < n; i++) {
    const dx = disp[2 * i] - GRAVITY * (pos[2 * i] - 0.5)
    const dy = disp[2 * i + 1] - GRAVITY * (pos[2 * i + 1] - 0.5)
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d > 0) {
      const s = Math.min(d, temp) / d
      pos[2 * i] += dx * s
      pos[2 * i + 1] += dy * s
    }
  }
  lay.heat *= 0.98
}

const COOL = 0.03 // below this heat the layout stops moving

// Indices of the `count` largest values (ties: lower index first).
function topIndices(values, count) {
  const idx = Array.from(values.keys())
  idx.sort((a, b) => values[b] - values[a] || a - b)
  return idx.slice(0, count)
}

function GrowNetwork({ t }) {
  const [n, setN] = useState(400)
  const [m, setM] = useState(2)
  const [uniform, setUniform] = useState(false)
  const [seed, setSeed] = useState(1)
  const [speed, setSpeed] = useState(2)
  const [kMinSel, setKMinSel] = useState(2)
  const [playing, setPlaying] = useState(false)
  const [settling, setSettling] = useState(false)
  const [nodes, setNodes] = useState(400)

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const addAcc = useRef(0)
  const layRef = useRef(null)
  const width = useElementWidth(wrapRef)
  const height = Math.round(clamp(width * 0.75, 280, 460))

  const net = useMemo(() => barabasiAlbert(n, m, seed, { uniform }), [n, m, seed, uniform])
  const m0 = net.m0
  const t1 = clamp(nodes, m0, n)
  const edges = net.edgesUpTo[t1]
  const kMin = Math.max(m, kMinSel)

  const deg = useMemo(() => degrees(t1, net.A, net.B, edges), [t1, net, edges])
  const hubs = useMemo(() => topIndices(deg, HUBS), [deg])
  const stats = useMemo(() => {
    let max = 0
    for (let i = 0; i < deg.length; i++) if (deg[i] > max) max = deg[i]
    const sorted = Int32Array.from(deg).sort()
    const top = Math.max(1, Math.ceil(deg.length / 100))
    let held = 0
    for (let i = deg.length - top; i < deg.length; i++) held += sorted[i]
    return { max, mean: (2 * edges) / t1, top1: edges ? held / (2 * edges) : NaN }
  }, [deg, edges, t1])

  // The chart and the estimate follow a deferred copy of the network size, so
  // fast growth never waits for recharts.
  const chartT = useDeferredValue(t1)
  const chart = useMemo(() => {
    const E = net.edgesUpTo[chartT]
    const k = degrees(chartT, net.A, net.B, E)
    const er = erdosRenyiGnm(chartT, E, Math.imul(seed, 7919) + 13)
    const kER = degrees(chartT, er.A, er.B)
    const ba = ccdfInt(k).filter((d) => d.k > 0)
    const rnd = ccdfInt(kER).filter((d) => d.k > 0)
    let kMax = 1
    for (const d of ba) kMax = Math.max(kMax, d.k)
    for (const d of rnd) kMax = Math.max(kMax, d.k)
    // BA's large-k tail, P(K ≥ k) ≈ m(m+1)/k²: a line of slope −2 on log–log axes.
    const c = m * (m + 1)
    const ref = logSpace(Math.sqrt(c), Math.max(kMax, Math.sqrt(c) * 2), 2).map((x) => ({ k: x, p: c / (x * x) }))
    return { ba, er: rnd, ref, x: decades(1, kMax), y: decades(1 / chartT, 1), mle: powerLawMLEDiscrete(k, kMin) }
  }, [net, chartT, seed, m, kMin])

  // A new network is shown fully grown; Play then regrows it from the seed clique.
  useEffect(() => {
    setPlaying(false)
    setNodes(n)
  }, [n, m, seed, uniform])
  useEffect(() => setKMinSel(m), [m])

  // Layout state lives in a ref: it changes every frame and only the canvas reads it.
  const layoutKey = `${m}-${seed}-${uniform}`
  const syncLayout = () => {
    let lay = layRef.current
    if (!lay || lay.key !== layoutKey) {
      lay = {
        key: layoutKey,
        pos: new Float64Array(2 * DRAW_MAX),
        disp: new Float64Array(2 * DRAW_MAX),
        count: 0,
        heat: 0,
        random: mulberry32(seed ^ 0x2545f491),
      }
      layRef.current = lay
    }
    const target = Math.min(t1, DRAW_MAX)
    if (target === lay.count) return
    if (target < lay.count) {
      lay.count = target
    } else {
      const fresh = target - lay.count
      placeNodes(lay, net, target)
      lay.heat = Math.max(lay.heat, fresh > 20 ? 1 : 0.35)
    }
    if (lay.heat > COOL) setSettling(true)
  }

  const draw = () => {
    const canvas = canvasRef.current
    const lay = layRef.current
    if (!canvas || !width || !lay) return
    const dpr = window.devicePixelRatio || 1
    // Resizing clears the canvas, so do it only when the size changes.
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const count = lay.count
    const { pos } = lay
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < count; i++) {
      minX = Math.min(minX, pos[2 * i])
      maxX = Math.max(maxX, pos[2 * i])
      minY = Math.min(minY, pos[2 * i + 1])
      maxY = Math.max(maxY, pos[2 * i + 1])
    }
    const pad = 18
    const scale = Math.min(
      (width - 2 * pad) / Math.max(maxX - minX, 0.05),
      (height - 2 * pad) / Math.max(maxY - minY, 0.05),
    )
    const offX = (width - (maxX - minX) * scale) / 2
    const offY = (height - (maxY - minY) * scale) / 2
    const X = (i) => offX + (pos[2 * i] - minX) * scale
    const Y = (i) => offY + (pos[2 * i + 1] - minY) * scale

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)'
    ctx.lineWidth = count <= 150 ? 1 : 0.6
    ctx.beginPath()
    for (let e = 0, end = net.edgesUpTo[count]; e < end; e++) {
      ctx.moveTo(X(net.A[e]), Y(net.A[e]))
      ctx.lineTo(X(net.B[e]), Y(net.B[e]))
    }
    ctx.stroke()

    const shrink = width < 480 ? 0.75 : 1
    const radius = (i) => Math.min(16, (1 + 0.75 * Math.sqrt(deg[i] || 0)) * shrink)
    const isHub = new Uint8Array(count)
    for (const h of hubs) if (h < count) isHub[h] = 1
    ctx.fillStyle = SLATE
    for (let i = 0; i < count; i++) {
      if (isHub[i]) continue
      ctx.beginPath()
      ctx.arc(X(i), Y(i), radius(i), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = ORANGE
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    for (const h of hubs) {
      if (h >= count) continue
      ctx.beginPath()
      ctx.arc(X(h), Y(h), radius(h), 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }

  useEffect(() => {
    syncLayout()
    draw()
  })

  useAnimationLoop(() => {
    if (playing) {
      addAcc.current += speed
      const add = Math.floor(addAcc.current)
      if (add) {
        addAcc.current -= add
        setNodes((v) => Math.min(v + add, n))
      }
    }
    const lay = layRef.current
    if (lay && lay.heat > COOL) {
      for (let i = 0; i < ITERS_PER_FRAME; i++) relax(lay, net)
      draw()
    } else if (!playing) {
      setSettling(false)
    }
  }, playing || settling)

  useEffect(() => {
    if (playing && t1 >= n) setPlaying(false)
  }, [playing, t1, n])

  const onPlayPause = () => {
    if (playing) return setPlaying(false)
    if (t1 >= n) setNodes(m0)
    addAcc.current = 0
    setPlaying(true)
  }

  const frozen = t1 > DRAW_MAX

  return (
    <div className={panel}>
      <PanelTitle>A · {t.grow}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.n} min={50} max={2000} step={10} value={n} onChange={setN} />
        <Slider label={t.m} min={1} max={5} step={1} value={m} onChange={setM} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-full border border-slate-200 p-0.5" role="group">
          <button type="button" className={tab(!uniform)} aria-pressed={!uniform} onClick={() => setUniform(false)}>
            {t.preferential}
          </button>
          <button type="button" className={tab(uniform)} aria-pressed={uniform} onClick={() => setUniform(true)}>
            {t.uniform}
          </button>
        </div>
        <span className="font-mono text-sm text-slate-600 tabular-nums">
          {t.seed} {seed}
        </span>
        <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newNetwork }} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <SimControls
          playing={playing}
          onPlayPause={onPlayPause}
          onStep={() => setNodes((v) => Math.min(clamp(v, m0, n) + 1, n))}
          onReset={() => {
            setPlaying(false)
            setNodes(m0)
          }}
          labels={t.controls}
        />
        <Slider
          label={t.speed}
          min={0.2}
          max={20}
          log
          value={speed}
          onChange={setSpeed}
          format={(v) => v.toFixed(v < 1 ? 2 : v < 10 ? 1 : 0)}
        />
      </div>

      <div ref={wrapRef} className="mt-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria}
          className="block w-full bg-white border border-slate-200 rounded"
        />
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={ORANGE} size={10} />}>{t.legend.hub}</LegendItem>
        <LegendItem swatch={<DotSwatch color={SLATE} size={6} />}>{t.legend.node}</LegendItem>
      </Legend>
      {frozen && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.frozen(DRAW_MAX)}</p>}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.nodes}>
          {t1} <span className="text-slate-500">/ {n}</span>
        </Stat>
        <Stat label={t.edges}>{edges}</Stat>
        <Stat label={t.meanDegree}>{fmt(stats.mean, 2)}</Stat>
        <Stat label={t.maxDegree}>{stats.max}</Stat>
        <Stat label={t.top1}>{fmt(stats.top1 * 100, 1)}%</Stat>
        <Stat label={t.gammaHat}>
          {fmt(chart.mle.gamma, 2)}
          <span className="text-slate-500"> ± {fmt(chart.mle.error, 2)}</span>
        </Stat>
      </div>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.ccdfTitle}</PanelTitle>
        <div className="mt-3 h-64 -ml-4" role="img" aria-label={t.ccdfAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="k"
                type="number"
                scale="log"
                domain={chart.x.domain}
                ticks={chart.x.ticks}
                tickFormatter={powTick}
                allowDataOverflow
                tick={axisTick}
                stroke={MUTED}
              />
              <YAxis
                dataKey="p"
                type="number"
                scale="log"
                domain={chart.y.domain}
                ticks={chart.y.ticks}
                tickFormatter={powTick}
                allowDataOverflow
                width={44}
                tick={axisTick}
                stroke={MUTED}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, name) => (name === 'k' ? [Math.round(v), 'k'] : [v.toPrecision(3), 'P(K ≥ k)'])}
                contentStyle={tooltipStyle}
              />
              <Scatter data={chart.er} fill={ER_COLOR} shape="circle" isAnimationActive={false} />
              <Scatter data={chart.ba} fill={ORANGE} shape="circle" isAnimationActive={false} />
              <Scatter
                data={chart.ref}
                line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }}
                shape={NoDot}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.seriesBA(uniform)}</LegendItem>
          <LegendItem swatch={<DotSwatch color={ER_COLOR} />}>{t.seriesER}</LegendItem>
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.slope}</LegendItem>
        </Legend>
        <div className="mt-4 max-w-sm">
          <Slider label={t.kMin} min={m} max={KMIN_MAX} step={1} value={kMin} onChange={setKMinSel} />
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.gammaNote(kMin)}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function MiniChart({ title, aria, children, legend }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-xs text-slate-600">{title}</p>
      <div className="mt-2 h-52 -ml-4" role="img" aria-label={aria}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {legend}
    </div>
  )
}

function HeavyTails({ t, locale }) {
  const [kind, setKind] = useState('pareto')
  const [alpha, setAlpha] = useState(1.5)
  const [N, setN] = useState(10000)
  const [seed, setSeed] = useState(1)

  const params = useMemo(
    () => (kind === 'pareto' ? { ...DIST_PARAMS.pareto, alpha } : DIST_PARAMS[kind]),
    [kind, alpha],
  )
  const values = useMemo(() => sample(kind, params, N, 5000 + seed), [kind, params, N, seed])
  const sorted = useMemo(() => Float64Array.from(values).sort(), [values])
  const exactMean = FAMILIES[kind].mean(params)

  const data = useMemo(() => {
    const hist = logBinnedHistogram(values, 5)
    const ccdf = ccdfSorted(sorted, 200)
    const lo = Math.max(sorted.find((v) => v > 0) ?? 1, 1e-3)
    const hi = sorted[sorted.length - 1]
    const x = decades(lo, hi)
    let dMin = Infinity
    let dMax = 0
    for (const b of hist) {
      dMin = Math.min(dMin, b.density)
      dMax = Math.max(dMax, b.density)
    }
    const hy = decades(dMin, dMax)
    const cy = decades(1 / sorted.length, 1)
    const xs = logSpace(x.domain[0], x.domain[1], 80)
    const pdfLine = xs.map((v) => ({ x: v, y: pdf(kind, params, v) })).filter((d) => d.y >= hy.domain[0] && d.y <= hy.domain[1])
    const ccdfLine = xs.map((v) => ({ x: v, y: ccdfExact(kind, params, v) })).filter((d) => d.y >= cy.domain[0] && d.y <= 1)
    return {
      hist: hist.map((b) => ({ x: b.x, y: b.density })),
      ccdf: ccdf.map((d) => ({ x: d.x, y: d.p })),
      pdfLine,
      ccdfLine,
      running: runningMean(values, 120),
      x,
      hy,
      cy,
    }
  }, [values, sorted, kind, params])

  const stats = useMemo(() => {
    let sum = 0
    for (let i = 0; i < values.length; i++) sum += values[i]
    const mid = sorted.length >> 1
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    return {
      mean: sum / values.length,
      median,
      max: sorted[sorted.length - 1],
      top20: topShare(sorted, 0.2),
      mle: kind === 'pareto' ? paretoMLE(values, params.xMin) : null,
    }
  }, [values, sorted, kind, params])

  const nTicks = decades(1, N)
  const desc = kind === 'pareto' ? t.params.pareto(alpha) : t.params[kind]
  const sampleLegend = (
    <Legend>
      <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.sampleLegend}</LegendItem>
      <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.exactLegend}</LegendItem>
    </Legend>
  )
  const logLogAxes = (y) => [
    <CartesianGrid key="g" stroke={GRID} strokeDasharray="3 3" />,
    <XAxis
      key="x"
      dataKey="x"
      type="number"
      scale="log"
      domain={data.x.domain}
      ticks={data.x.ticks}
      tickFormatter={powTick}
      allowDataOverflow
      tick={axisTick}
      stroke={MUTED}
    />,
    <YAxis
      key="y"
      dataKey="y"
      type="number"
      scale="log"
      domain={y.domain}
      ticks={y.ticks}
      tickFormatter={powTick}
      allowDataOverflow
      width={44}
      tick={axisTick}
      stroke={MUTED}
    />,
  ]
  const exactCurve = (points) => (
    <Scatter
      data={points}
      line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }}
      shape={NoDot}
      isAnimationActive={false}
    />
  )

  return (
    <div className={panel}>
      <PanelTitle>B · {t.tails}</PanelTitle>

      <div className="mt-4 inline-flex flex-wrap rounded-full border border-slate-200 p-0.5" role="group">
        {KINDS.map((k) => (
          <button key={k} type="button" className={tab(kind === k)} aria-pressed={kind === k} onClick={() => setKind(k)}>
            {t.kinds[k]}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs text-slate-500">{desc}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={kind === 'pareto' ? '' : 'opacity-40 pointer-events-none'} aria-disabled={kind !== 'pareto'}>
          <Slider
            label={t.alpha}
            min={1.1}
            max={3.5}
            step={0.05}
            value={alpha}
            onChange={setAlpha}
            format={(v) => v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          />
        </div>
        <Slider
          label={t.sampleSize}
          min={100}
          max={100000}
          log
          value={N}
          onChange={(v) => setN(Math.round(v))}
          format={(v) => Math.round(v).toLocaleString(locale)}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-slate-600 tabular-nums">
          {t.seed} {seed}
        </span>
        <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newSample }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <MiniChart title={t.histTitle} aria={t.histAria} legend={sampleLegend}>
          <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            {logLogAxes(data.hy)}
            <Scatter data={data.hist} fill={ORANGE} shape="circle" isAnimationActive={false} />
            {exactCurve(data.pdfLine)}
          </ScatterChart>
        </MiniChart>
        <MiniChart title={t.ccdfTitle2} aria={t.ccdf2Aria} legend={sampleLegend}>
          <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            {logLogAxes(data.cy)}
            <Scatter data={data.ccdf} fill={ORANGE} shape="circle" isAnimationActive={false} />
            {exactCurve(data.ccdfLine)}
          </ScatterChart>
        </MiniChart>
        <MiniChart
          title={t.meanTitle}
          aria={t.meanAria}
          legend={
            <Legend>
              <LegendItem swatch={<LineSwatch color={BA_LINE} />}>{t.sampleLegend}</LegendItem>
              <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.exactLegend}</LegendItem>
            </Legend>
          }
        >
          <LineChart data={data.running} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="n"
              type="number"
              scale="log"
              domain={nTicks.domain}
              ticks={nTicks.ticks}
              tickFormatter={powTick}
              allowDataOverflow
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis
              width={44}
              tick={axisTick}
              stroke={MUTED}
              domain={['auto', 'auto']}
              tickFormatter={(v) => fmtNum(v, locale)}
            />
            <Tooltip
              formatter={(v) => [fmtNum(v, locale), t.sampleMean]}
              labelFormatter={t.tooltipN}
              contentStyle={tooltipStyle}
            />
            {Number.isFinite(exactMean) && (
              <ReferenceLine y={exactMean} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" ifOverflow="extendDomain" />
            )}
            <Line type="linear" dataKey="mean" stroke={BA_LINE} strokeWidth={1.75} dot={false} isAnimationActive={false} />
          </LineChart>
        </MiniChart>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.sampleMean}>
          {fmtNum(stats.mean, locale)}
          <span className="block text-xs text-slate-500 mt-0.5">{t.exactMean(fmtNum(exactMean, locale))}</span>
        </Stat>
        <Stat label={t.median}>{fmtNum(stats.median, locale)}</Stat>
        <Stat label={t.max}>{fmtNum(stats.max, locale)}</Stat>
        <Stat label={t.top20}>{fmt(stats.top20 * 100, 1)}%</Stat>
        <Stat label={t.alphaHat}>
          {stats.mle ? (
            <>
              {fmt(stats.mle.alpha, 3)}
              <span className="text-slate-500"> ± {fmt(stats.mle.error, 3)}</span>
            </>
          ) : (
            <span className="text-slate-500 font-sans text-xs">{t.onlyPareto}</span>
          )}
        </Stat>
      </div>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">
        {kind === 'pareto' && `${t.alphaNote} `}
        {t.tailsNote}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

const SERIES = [
  { key: 'baR', color: BA_LINE, dashed: false },
  { key: 'baA', color: BA_LINE, dashed: true },
  { key: 'erR', color: INK, dashed: false },
  { key: 'erA', color: INK, dashed: true },
]

// T realisations of a BA network and an ER network with the same n and number
// of edges; each is taken apart at random and by targeted attack. One removal
// curve per yield.
function makeRobustnessJob(trials, seed) {
  const random = mulberry32(seed)
  const sums = Object.fromEntries(SERIES.map((s) => [s.key, new Float64Array(F_GRID.length)]))
  const done = Object.fromEntries(SERIES.map((s) => [s.key, 0]))
  const total = trials * SERIES.length
  function* iter() {
    let units = 0
    for (let tr = 0; tr < trials; tr++) {
      const ba = barabasiAlbert(ROB_N, ROB_M, Math.floor(random() * 2 ** 32))
      const er = erdosRenyiGnm(ROB_N, ba.A.length, Math.floor(random() * 2 ** 32))
      for (const [prefix, net] of [
        ['ba', ba],
        ['er', er],
      ]) {
        const g = buildCSR(ROB_N, net.A, net.B)
        const k = degrees(ROB_N, net.A, net.B)
        const failure = sampleNodes(ROB_N, ROB_N, random)
        // A random shuffle first, so the stable sort breaks degree ties at random.
        const attack = Array.from(sampleNodes(ROB_N, ROB_N, random)).sort((a, b) => k[b] - k[a])
        for (const [suffix, order] of [
          ['R', failure],
          ['A', attack],
        ]) {
          const curve = removalCurve(g, order)
          const key = prefix + suffix
          F_GRID.forEach((f, i) => {
            sums[key][i] += curve[Math.round(f * ROB_N)] / ROB_N
          })
          done[key]++
          units++
          yield units / total
        }
      }
    }
  }
  const snapshot = () =>
    F_GRID.map((f, i) => {
      const row = { f }
      for (const { key } of SERIES) row[key] = done[key] ? sums[key][i] / done[key] : null
      return row
    })
  return { iter: iter(), snapshot }
}

function Robustness({ t }) {
  const [trials, setTrials] = useState(3)
  const [ranTrials, setRanTrials] = useState(3)
  const seedRef = useRef(0)
  const exp = useExperiment()

  const onRun = () => {
    seedRef.current++
    setRanTrials(trials)
    exp.run(makeRobustnessJob(trials, 4000 + seedRef.current))
  }
  // Run once with the defaults on first display.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onRun, [])

  const data = exp.data || F_GRID.map((f) => ({ f }))

  return (
    <div className={panel}>
      <PanelTitle>C · {t.robustness}</PanelTitle>
      <p className="mt-3 font-mono text-xs text-slate-600">{t.robTitle}</p>
      <div className="mt-2 h-72 -ml-4" role="img" aria-label={t.robAria}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="f"
              type="number"
              domain={[0, 0.8]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8]}
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={40} tick={axisTick} stroke={MUTED} />
            <Tooltip
              formatter={(v, key) => [v == null ? '–' : v.toFixed(3), t.curves[key]]}
              labelFormatter={t.tooltipF}
              contentStyle={tooltipStyle}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={1.75}
                strokeDasharray={s.dashed ? '6 4' : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Legend>
        {SERIES.map((s) => (
          <LegendItem key={s.key} swatch={<LineSwatch color={s.color} dashed={s.dashed} />}>
            {t.curves[s.key]}
          </LegendItem>
        ))}
      </Legend>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.robNote}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={t.trials} min={1} max={10} step={1} value={trials} onChange={setTrials} />
        <SimControls playing={exp.running} onPlayPause={exp.running ? exp.cancel : onRun} labels={t.run} />
      </div>
      <ProgressBar progress={exp.progress} />
      <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
        {exp.running ? t.running : exp.cancelled ? t.cancelled(exp.progress) : t.done(ranTrials)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function ScaleFree({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <GrowNetwork t={t} />
      <HeavyTails t={t} locale={locale} />
      <Robustness t={t} />
    </div>
  )
}
