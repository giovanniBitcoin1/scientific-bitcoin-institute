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
  GRID_SIDE,
  lineImage,
  squareImage,
  kochImage,
  sierpinskiImage,
  randomWalkImage,
  createDLA,
  addDLAParticle,
  boxSizes,
  occupied,
  boxCount,
  occupiedBoxes,
  fitDimension,
  massRadius,
} from '../fractals.js'
import {
  siteValues,
  openingOrder,
  createPercolation,
  openSite,
  findRoot,
  isOpen,
  pourFromTop,
  newmanZiffRun,
  binomialSmooth,
  crossing,
  P_C_SITE,
} from '../percolation.js'

// Fractals and percolation, in three panels: box counting on exact and grown
// fractals; a site-percolation grid with a p slider, a Newman–Ziff sweep and a
// fluid poured from the top; and an experiment that locates p_c from where the
// spanning curves of different lattice sizes cross.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'
const SERIES = ['#fdba74', '#fb923c', '#ea580c', '#7c2d12'] // orange-300/400/600/900, small → large L

const MAX_SHAPE_CANVAS = 520 // css px
const MAX_GRID_CANVAS = 560

const SHAPES = ['line', 'square', 'koch', 'sierpinski', 'dla', 'walk']
const DLA_SIDE = 512
// Exact box-counting dimensions; DLA's is the accepted numerical value.
const THEORY = {
  line: 1,
  square: 2,
  koch: Math.log(4) / Math.log(3),
  sierpinski: Math.log(3) / Math.log(2),
  dla: 1.71,
  walk: 2,
}
// Default fit range in pixels, per grid side.
const FIT_DEFAULT = { [GRID_SIDE]: [4, 256], [DLA_SIDE]: [8, 64] }
const OVERLAY_DEFAULT = { [GRID_SIDE]: 64, [DLA_SIDE]: 32 }

// Percolation colours: closed, open, largest cluster, spanning cluster, fluid.
const RGB = {
  closed: [51, 65, 85], // slate-700
  open: [248, 250, 252], // slate-50
  largest: [253, 186, 116], // orange-300
  span: [234, 88, 12], // orange-600
  fluid: [2, 132, 199], // sky-600
}
// Other clusters when "colour all clusters" is on; no orange, which marks the largest.
const CLUSTER_RGB = [
  '#0e7490',
  '#1e3a8a',
  '#15803d',
  '#6d28d9',
  '#0284c7',
  '#64748b',
  '#a5b4fc',
  '#7dd3fc',
  '#86efac',
  '#c4b5fd',
  '#94a3b8',
  '#155e75',
].map((c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)))

const EXP_L = [16, 32, 64, 128]
const P_GRID = Array.from({ length: 121 }, (_, k) => Math.round((0.35 + 0.004 * k) * 1e4) / 1e4)
const P_FINE = Array.from({ length: 701 }, (_, k) => 0.56 + 0.0001 * k)

const T = {
  en: {
    measuring: 'Measuring a fractal',
    shape: 'Shape',
    shapes: {
      line: 'Straight line',
      square: 'Filled square',
      koch: 'Koch curve',
      sierpinski: 'Sierpiński triangle',
      dla: 'DLA cluster',
      walk: 'Random-walk path',
    },
    iteration: 'Iteration',
    walkSteps: 'Steps of the walk',
    newWalk: 'New walk',
    particles: 'Particles',
    newCluster: 'New cluster',
    controls: { play: 'Grow', pause: 'Pause', step: 'Step', reset: 'Reset' },
    dlaNote: (n, full) =>
      `${n.toLocaleString('en-US')} particles${full ? ' — the cluster has reached the edge of the lattice' : ''}. Each new particle starts on a circle just outside the cluster and wanders until it touches it.`,
    overlay: 'Show boxes',
    boxSize: 'Box size ε',
    boxFmt: (s, g) => `${s} px · 1/ε = ${fmtRatio(g / s)}`,
    fitLo: 'Smallest box in the fit',
    fitHi: 'Largest box in the fit',
    canvasAria: (name, g) => `${name} drawn on a ${g} × ${g} pixel grid.`,
    boxes: 'Occupied boxes N(ε)',
    measured: 'Measured D̂',
    boxD: 'D̂, box counting',
    massD: 'D̂, mass–radius',
    massRange: (a, b) => `r = ${a}–${b} px`,
    exact: 'Exact D',
    accepted: 'Accepted D',
    limit: 'D in the limit',
    exactNote: {
      dla: 'Two estimators, two answers. Box counting covers the cluster with boxes; the mass–radius relation counts the particles M(r) within distance r of the seed and fits M ∝ r^D, from r = 4 px to half the cluster radius (the outer rim is still growing). On 10,000 particles box counting usually gives about 1.6 and mass–radius about 1.65–1.72, against 1.71 measured on far larger clusters. Each method weighs the scales differently, and a finite cluster spans only a few doublings of scale: a fractal dimension measured on real data means little without the method and the range that produced it.',
      walk: 'The trace of a random walk fills the plane only slowly: D = 2 is reached in the limit of an infinitely long walk. Try 10³ and then 10⁶ steps.',
      koch: 'At iteration n the smallest wiggles are 3⁻ⁿ of the width. Boxes smaller than that see straight segments, and the fit drifts towards 1.',
    },
    chartTitle: 'Box counting: N(ε) against 1/ε',
    chartAria: 'Log–log plot of the number of occupied boxes against the inverse box size, with the fitted line.',
    legendFit: 'boxes in the fit',
    legendOut: 'boxes outside the fit',
    legendLine: (d) => `fit, slope D̂ = ${d}`,
    legendTheory: 'slope of the exact value',
    tooltipX: (v) => `1/ε = ${fmtRatio(v)}`,
    tooltipN: 'boxes',
    fitNote:
      'The fit is a least-squares straight line through log N against log(1/ε) for the boxes between the two sliders. The ε marked by the dashed orange line is the one shown on the picture.',

    percolation: 'Percolation',
    gridL: 'Grid side L',
    p: 'Open probability p',
    seed: 'Seed',
    newGrid: 'New grid',
    colourAll: 'Colour all clusters',
    sweep: 'Sweep p',
    sweepControls: { play: 'Play', pause: 'Pause', reset: 'Back to p = 0' },
    sweepSpeed: 'Sweep speed (Δp per second)',
    sweepNote:
      'Play opens the closed sites one at a time, in the random order fixed by the seed (the Newman–Ziff sweep), and stops when a cluster first connects top and bottom.',
    spannedAt: (p, n, f) => `A spanning cluster appeared at p = ${p} (${n} sites open, ${f} of the grid).`,
    pour: 'Pour from the top',
    stopPour: 'Stop pouring',
    gridAria: (L, p) => `Site percolation on a ${L} × ${L} grid with p = ${p}.`,
    legendClosed: 'closed',
    legendOpen: 'open',
    legendLargest: 'largest cluster',
    legendSpan: 'spanning cluster',
    legendFluid: 'fluid',
    spanning: 'Spanning',
    yes: 'yes',
    no: 'no',
    clusters: 'Clusters',
    largestStat: 'Largest cluster',
    ofGrid: 'of the grid',
    vsPc: 'p − p_c',
    fluidStat: 'Fluid',
    fluidDepth: (row, L) => `row ${row} of ${L}`,
    fluidBottom: (k) => `bottom reached after ${k} steps`,
    fluidNone: 'no open site on top',
    pcNote:
      'p_c ≈ 0.5927 is the critical point of site percolation on the square lattice, known only numerically. Near it the largest cluster is a fractal full of holes, and clusters of every size appear.',

    experiment: 'Finding the critical point',
    runs: 'Runs per lattice size',
    runAgain: 'Run again',
    cancel: 'Cancel',
    progress: (p) => `Sweeping lattices … ${Math.round(p * 100)}%`,
    cancelled: (p) => `Cancelled at ${Math.round(p * 100)}%: partial averages.`,
    expNote: (T) =>
      `For each L, ${T} Newman–Ziff sweeps open the L² sites in random order and record when a cluster first spans top to bottom and how big the largest cluster is after every site. Averages over a binomial number of open sites turn them into curves in p.`,
    spanTitle: 'Spanning probability R(p)',
    spanAria: 'Probability that a cluster spans top to bottom, against p, for four lattice sizes.',
    massTitle: 'Largest cluster, fraction of all sites',
    massAria: 'Fraction of sites in the largest cluster, against p, for four lattice sizes.',
    seriesL: (L) => `L = ${L}`,
    pcLine: 'p_c = 0.5927',
    crossStat: 'L = 64 and L = 128 cross at',
    crossNone: '–',
    expCaption:
      'Larger lattices make the transition sharper. Below p_c a large lattice is less likely to be spanned than a small one, above p_c it is more likely; so the curves cross close to p_c, and the crossing point is a good estimate of it even from small lattices.',
    tooltipP: (p) => `p = ${p}`,
  },
  it: {
    measuring: 'Misurare un frattale',
    shape: 'Forma',
    shapes: {
      line: 'Segmento',
      square: 'Quadrato pieno',
      koch: 'Curva di Koch',
      sierpinski: 'Triangolo di Sierpiński',
      dla: 'Aggregato DLA',
      walk: 'Cammino casuale',
    },
    iteration: 'Iterazione',
    walkSteps: 'Passi del cammino',
    newWalk: 'Nuovo cammino',
    particles: 'Particelle',
    newCluster: 'Nuovo aggregato',
    controls: { play: 'Fai crescere', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    dlaNote: (n, full) =>
      `${n.toLocaleString('it-IT')} particelle${full ? ' — l\'aggregato ha raggiunto il bordo del reticolo' : ''}. Ogni nuova particella parte da una circonferenza appena fuori dall'aggregato e vaga finché non lo tocca.`,
    overlay: 'Mostra le scatole',
    boxSize: 'Lato della scatola ε',
    boxFmt: (s, g) => `${s} px · 1/ε = ${fmtRatio(g / s, 'it-IT')}`,
    fitLo: 'Scatola più piccola nel fit',
    fitHi: 'Scatola più grande nel fit',
    canvasAria: (name, g) => `${name} disegnato su una griglia di ${g} × ${g} pixel.`,
    boxes: 'Scatole occupate N(ε)',
    measured: 'D̂ misurata',
    boxD: 'D̂, conteggio a scatole',
    massD: 'D̂, massa–raggio',
    massRange: (a, b) => `r = ${a}–${b} px`,
    exact: 'D esatta',
    accepted: 'D accettata',
    limit: 'D al limite',
    exactNote: {
      dla: "Due stimatori, due risposte. Il conteggio a scatole copre l'aggregato di scatole; la relazione massa–raggio conta le particelle M(r) entro la distanza r dal seme e fa il fit di M ∝ r^D, da r = 4 px a metà del raggio dell'aggregato (il bordo esterno sta ancora crescendo). Su 10.000 particelle il conteggio a scatole dà di solito circa 1,6 e la massa–raggio circa 1,65–1,72, contro l'1,71 misurato su aggregati molto più grandi. Ogni metodo pesa le scale in modo diverso, e un aggregato finito copre solo pochi raddoppi di scala: una dimensione frattale misurata su dati reali dice poco senza il metodo e l'intervallo che l'hanno prodotta.",
      walk: 'La traccia di un cammino casuale riempie il piano solo lentamente: D = 2 si raggiunge al limite di un cammino infinitamente lungo. Prova 10³ e poi 10⁶ passi.',
      koch: "All'iterazione n le increspature più piccole sono 3⁻ⁿ della larghezza. Le scatole più piccole di così vedono segmenti dritti, e il fit scivola verso 1.",
    },
    chartTitle: 'Conteggio a scatole: N(ε) contro 1/ε',
    chartAria: "Grafico log–log del numero di scatole occupate contro l'inverso del lato, con la retta del fit.",
    legendFit: 'scatole nel fit',
    legendOut: 'scatole fuori dal fit',
    legendLine: (d) => `fit, pendenza D̂ = ${d}`,
    legendTheory: 'pendenza del valore esatto',
    tooltipX: (v) => `1/ε = ${fmtRatio(v, 'it-IT')}`,
    tooltipN: 'scatole',
    fitNote:
      "Il fit è una retta ai minimi quadrati di log N contro log(1/ε) per le scatole comprese tra i due cursori. L'ε segnato dalla linea arancione tratteggiata è quello mostrato sul disegno.",

    percolation: 'Percolazione',
    gridL: 'Lato della griglia L',
    p: 'Probabilità di apertura p',
    seed: 'Seme',
    newGrid: 'Nuova griglia',
    colourAll: 'Colora tutti i cluster',
    sweep: 'Scansione di p',
    sweepControls: { play: 'Avvia', pause: 'Pausa', reset: 'Torna a p = 0' },
    sweepSpeed: 'Velocità (Δp al secondo)',
    sweepNote:
      "Avvia apre i siti chiusi uno alla volta, nell'ordine casuale fissato dal seme (la scansione di Newman–Ziff), e si ferma quando un cluster collega per la prima volta l'alto e il basso.",
    spannedAt: (p, n, f) => `Un cluster percolante è comparso a p = ${p} (${n} siti aperti, ${f} della griglia).`,
    pour: "Versa dall'alto",
    stopPour: 'Smetti di versare',
    gridAria: (L, p) => `Percolazione di sito su una griglia ${L} × ${L} con p = ${p}.`,
    legendClosed: 'chiuso',
    legendOpen: 'aperto',
    legendLargest: 'cluster più grande',
    legendSpan: 'cluster percolante',
    legendFluid: 'fluido',
    spanning: 'Percola',
    yes: 'sì',
    no: 'no',
    clusters: 'Cluster',
    largestStat: 'Cluster più grande',
    ofGrid: 'della griglia',
    vsPc: 'p − p_c',
    fluidStat: 'Fluido',
    fluidDepth: (row, L) => `riga ${row} di ${L}`,
    fluidBottom: (k) => `fondo raggiunto dopo ${k} passi`,
    fluidNone: 'nessun sito aperto in alto',
    pcNote:
      'p_c ≈ 0,5927 è il punto critico della percolazione di sito sul reticolo quadrato, noto solo numericamente. Vicino a p_c il cluster più grande è un frattale pieno di buchi, e compaiono cluster di ogni dimensione.',

    experiment: 'Trovare il punto critico',
    runs: 'Ripetizioni per lato',
    runAgain: 'Ripeti',
    cancel: 'Annulla',
    progress: (p) => `Scansioni in corso … ${Math.round(p * 100)}%`,
    cancelled: (p) => `Annullato al ${Math.round(p * 100)}%: medie parziali.`,
    expNote: (T) =>
      `Per ogni L, ${T} scansioni di Newman–Ziff aprono gli L² siti in ordine casuale e registrano quando un cluster collega per la prima volta l'alto e il basso e quanto è grande il cluster maggiore dopo ogni sito. Le medie su un numero binomiale di siti aperti le trasformano in curve in funzione di p.`,
    spanTitle: 'Probabilità di percolazione R(p)',
    spanAria: "Probabilità che un cluster colleghi l'alto e il basso, in funzione di p, per quattro lati del reticolo.",
    massTitle: 'Cluster più grande, frazione di tutti i siti',
    massAria: 'Frazione dei siti nel cluster più grande, in funzione di p, per quattro lati del reticolo.',
    seriesL: (L) => `L = ${L}`,
    pcLine: 'p_c = 0,5927',
    crossStat: 'L = 64 e L = 128 si incrociano a',
    crossNone: '–',
    expCaption:
      'I reticoli più grandi rendono la transizione più netta. Sotto p_c un reticolo grande ha meno probabilità di essere attraversato di uno piccolo, sopra p_c ne ha di più; così le curve si incrociano vicino a p_c, e il punto di incrocio ne è una buona stima anche con reticoli piccoli.',
    tooltipP: (p) => `p = ${p}`,
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)

function fmtRatio(v, locale = 'en-US') {
  return Number.isInteger(v) ? v.toLocaleString(locale) : v.toLocaleString(locale, { maximumFractionDigits: 1 })
}

function fmtPct(v, locale) {
  return `${(v * 100).toLocaleString(locale, { maximumFractionDigits: v < 0.1 ? 2 : 1 })}%`
}

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

// Sizes a canvas to css × css pixels at the device pixel ratio and returns
// its context; `smooth` is for pictures drawn smaller than their pixel grid.
function prepareCanvas(canvas, css, smooth = false) {
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(1, Math.round(css * dpr))
  if (canvas.width !== w || canvas.height !== w) {
    canvas.width = w
    canvas.height = w
  }
  canvas.style.width = `${css}px`
  canvas.style.height = `${css}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = smooth
  return ctx
}

// Display size of an n × n grid: an integer number of device pixels per cell
// when it fits, otherwise scaled down to the available width.
function gridSize(n, availW, max) {
  const dpr = window.devicePixelRatio || 1
  const side = Math.min(availW, max)
  const k = Math.floor((side * dpr) / n)
  if (k >= 1) return { css: (n * k) / dpr, down: false }
  return { css: side, down: true }
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

const chip = (active) =>
  `px-2.5 py-1 rounded-full border text-xs font-mono transition-colors ${
    active
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300'
  }`

function Stat({ label, children }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 min-w-0">
      <span className="block text-xs text-slate-500 font-sans">{label}</span>
      <span className="block mt-0.5 text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

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

function LineSwatch({ color, width = 2, dashed = false }) {
  return (
    <span
      className="inline-block w-5 shrink-0"
      style={{ borderTop: `${width}px ${dashed ? 'dashed' : 'solid'} ${color}` }}
      aria-hidden="true"
    />
  )
}

function DotSwatch({ color, size = 8, square = false, border }) {
  return (
    <span
      className={`inline-block shrink-0 ${square ? 'rounded-sm' : 'rounded-full'}`}
      style={{ width: size, height: size, background: color, border }}
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

// A Scatter drawn only as a line, for fitted and reference slopes.
const NoDot = () => null

// ---------------------------------------------------------------- Panel A

function shapeImage(shape, kochN, walkSteps, walkSeed) {
  if (shape === 'line') return lineImage()
  if (shape === 'square') return squareImage()
  if (shape === 'koch') return kochImage(kochN)
  if (shape === 'sierpinski') return sierpinskiImage()
  return randomWalkImage(walkSteps, walkSeed)
}

// A picture of an image at `dpx` device pixels per side. A display pixel is
// inked if any image pixel inside it is occupied, so one-pixel lines stay
// visible when the picture is smaller than the image.
function renderImage(pixels, g, dpx) {
  const canvas = document.createElement('canvas')
  canvas.width = dpx
  canvas.height = dpx
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(dpx, dpx)
  const px = img.data
  px.fill(255)
  const k = dpx / g
  for (let j = 0; j < pixels.length; j++) {
    const p = pixels[j]
    const o = 4 * (Math.floor(((p / g) | 0) * k) * dpx + Math.floor((p % g) * k))
    px[o] = 15
    px[o + 1] = 23
    px[o + 2] = 42
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}

function FractalPanel({ t, locale }) {
  const [shape, setShape] = useState('koch')
  const [kochN, setKochN] = useState(6)
  const [walkSteps, setWalkSteps] = useState(100000)
  const [walkSeed, setWalkSeed] = useState(1)
  const [particles, setParticles] = useState(10000)
  const [dlaSeed, setDlaSeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [dlaVersion, setDlaVersion] = useState(0)
  const [overlay, setOverlay] = useState(true)
  const g = shape === 'dla' ? DLA_SIDE : GRID_SIDE
  const sizes = useMemo(() => boxSizes(g), [g])
  const [fit, setFit] = useState(() => {
    const s = boxSizes(GRID_SIDE)
    return { g: GRID_SIDE, lo: s.indexOf(FIT_DEFAULT[GRID_SIDE][0]), hi: s.indexOf(FIT_DEFAULT[GRID_SIDE][1]) }
  })
  const [eps, setEps] = useState({ g: GRID_SIDE, k: boxSizes(GRID_SIDE).indexOf(OVERLAY_DEFAULT[GRID_SIDE]) })

  // Switching between the two grid sides resets the box choices to defaults.
  const fitLo = fit.g === g ? fit.lo : sizes.indexOf(FIT_DEFAULT[g][0])
  const fitHi = fit.g === g ? fit.hi : sizes.indexOf(FIT_DEFAULT[g][1])
  const epsK = eps.g === g ? eps.k : sizes.indexOf(OVERLAY_DEFAULT[g])

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)

  const dla = useRef(null)
  if (!dla.current) dla.current = createDLA(DLA_SIDE, 1)
  const newCluster = (seed) => {
    setPlaying(false)
    setDlaSeed(seed)
    dla.current = createDLA(DLA_SIDE, seed)
    setDlaVersion((v) => v + 1)
  }

  useAnimationLoop(() => {
    const st = dla.current
    const start = performance.now()
    while (st.count < particles && performance.now() - start < 12) {
      if (!addDLAParticle(st)) break
    }
    if (st.count >= particles || st.full) setPlaying(false)
    setDlaVersion((v) => v + 1)
  }, playing && shape === 'dla')

  const steps = useDeferredValue(walkSteps)
  const staticImage = useMemo(
    () => (shape === 'dla' ? null : shapeImage(shape, kochN, steps, walkSeed)),
    [shape, kochN, steps, walkSeed],
  )
  const pixels = useMemo(
    () => (shape === 'dla' ? Uint32Array.from(dla.current.order) : occupied(staticImage)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shape, staticImage, dlaVersion],
  )
  const counts = useMemo(() => boxCount(pixels, g, sizes), [pixels, g, sizes])
  const result = fitDimension(sizes, counts, g, fitLo, fitHi)
  const mass = useMemo(
    () => (shape === 'dla' ? massRadius(dla.current) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shape, dlaVersion],
  )

  // ---- drawing

  const picture = useRef({ key: null, canvas: null })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const css = Math.min(avail, MAX_SHAPE_CANVAS)
    const ctx = prepareCanvas(canvas, css)
    const dpx = canvas.width
    const pic = picture.current
    if (pic.key !== pixels || pic.dpx !== dpx) {
      pic.key = pixels
      pic.dpx = dpx
      pic.canvas = renderImage(pixels, g, Math.min(dpx, g))
    }
    ctx.drawImage(pic.canvas, 0, 0, dpx, dpx)
    if (!overlay) return
    const s = sizes[epsK]
    const { nb, seen } = occupiedBoxes(pixels, g, s)
    const k = dpx / g
    ctx.fillStyle = 'rgba(247, 147, 26, 0.38)'
    for (let by = 0; by < nb; by++) {
      for (let bx = 0; bx < nb; bx++) {
        if (!seen[by * nb + bx]) continue
        const x0 = Math.round(bx * s * k)
        const y0 = Math.round(by * s * k)
        ctx.fillRect(x0, y0, Math.min(dpx, Math.round((bx + 1) * s * k)) - x0, Math.min(dpx, Math.round((by + 1) * s * k)) - y0)
      }
    }
    // Box edges, when the boxes are big enough to see.
    if (s * k >= 6) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.45)'
      for (let b = 1; b < nb; b++) {
        const q = Math.round(b * s * k)
        ctx.fillRect(q, 0, 1, dpx)
        ctx.fillRect(0, q, dpx, 1)
      }
    }
  })

  // ---- chart

  const chart = useMemo(() => {
    const inFit = []
    const outFit = []
    sizes.forEach((s, k) => {
      const row = { x: g / s, y: counts[k] }
      if (k >= fitLo && k <= fitHi) inFit.push(row)
      else outFit.push(row)
    })
    const xs = [g / sizes[fitLo], g / sizes[fitHi]]
    const line = Number.isFinite(result.slope)
      ? xs.map((x) => ({ x, y: Math.exp(result.intercept) * x ** result.slope }))
      : []
    // The exact slope, drawn through the centre of the fitted points.
    const mx = (Math.log(xs[0]) + Math.log(xs[1])) / 2
    const my = result.intercept + result.slope * mx
    const theory = Number.isFinite(my) ? xs.map((x) => ({ x, y: Math.exp(my + THEORY[shape] * (Math.log(x) - mx)) })) : []
    const maxY = Math.max(...counts, 10)
    return { inFit, outFit, line, theory, x: decades(1, g), y: decades(1, maxY) }
  }, [sizes, counts, g, fitLo, fitHi, result.slope, result.intercept, shape])

  const exactLabel = shape === 'dla' ? t.accepted : shape === 'walk' ? t.limit : t.exact
  const dHat = fmtFixed(result.slope, 3, locale)
  const st = dla.current

  return (
    <div className={panel}>
      <PanelTitle>A · {t.measuring}</PanelTitle>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 mr-1">{t.shape}</span>
        {SHAPES.map((s) => (
          <button
            key={s}
            type="button"
            className={chip(shape === s)}
            aria-pressed={shape === s}
            onClick={() => {
              setShape(s)
              // A fresh DLA cluster starts growing as soon as it is shown.
              const c = dla.current
              setPlaying(s === 'dla' && c.count === 1 && !c.full)
            }}
          >
            {t.shapes[s]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {shape === 'koch' && (
          <div className="max-w-sm">
            <Slider label={t.iteration} min={0} max={7} step={1} value={kochN} onChange={setKochN} />
          </div>
        )}
        {shape === 'walk' && (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Slider
              label={t.walkSteps}
              min={1000}
              max={1000000}
              log
              value={walkSteps}
              onChange={(v) => setWalkSteps(Math.round(v))}
              format={(v) => fmtInt(v, locale)}
            />
            <SimControls onReset={() => setWalkSeed((s) => s + 1)} labels={{ reset: t.newWalk }} />
          </div>
        )}
        {shape === 'dla' && (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Slider
                label={t.particles}
                min={500}
                max={10000}
                step={500}
                value={particles}
                onChange={setParticles}
                format={(v) => fmtInt(v, locale)}
              />
              <div className="flex flex-wrap gap-2">
                <SimControls
                  playing={playing}
                  onPlayPause={() => setPlaying((p) => !p && st.count < particles && !st.full)}
                  onReset={() => newCluster(dlaSeed)}
                  labels={t.controls}
                />
                <SimControls onReset={() => newCluster(dlaSeed + 1)} labels={{ reset: t.newCluster }} />
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed" aria-live="polite">
              {t.dlaNote(st.count, st.full)}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider
          label={t.boxSize}
          min={0}
          max={sizes.length - 1}
          step={1}
          value={epsK}
          onChange={(k) => setEps({ g, k })}
          format={(k) => t.boxFmt(sizes[k], g)}
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} className="accent-orange-600" />
          <span className="text-sm font-medium text-slate-700">{t.overlay}</span>
        </label>
      </div>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria(t.shapes[shape], g)}
          className="block mx-auto bg-white outline outline-1 outline-slate-200"
        />
      </div>

      <div className={`mt-5 grid grid-cols-2 gap-3 font-mono text-sm ${mass ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <Stat label={t.boxes}>{fmtInt(counts[epsK], locale)}</Stat>
        <Stat label={mass ? t.boxD : t.measured}>
          <span className="text-orange-700">{dHat}</span>
        </Stat>
        {mass && (
          <Stat label={t.massD}>
            <span className="text-orange-700">{fmtFixed(mass.slope, 3, locale)}</span>
            {Number.isFinite(mass.slope) && (
              <span className="block text-xs text-slate-500">{t.massRange(fmtInt(mass.rMin, locale), fmtInt(mass.rMax, locale))}</span>
            )}
          </Stat>
        )}
        <div className={mass ? '' : 'col-span-2 sm:col-span-1'}>
          <Stat label={exactLabel}>
            {shape === 'dla' ? '≈ ' : ''}
            {fmtFixed(THEORY[shape], shape === 'koch' || shape === 'sierpinski' ? 3 : shape === 'dla' ? 2 : 0, locale)}
          </Stat>
        </div>
      </div>
      {t.exactNote[shape] && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.exactNote[shape]}</p>}

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.chartTitle}</PanelTitle>
        <div className="mt-3 h-64 -ml-4" role="img" aria-label={t.chartAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
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
                dataKey="y"
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
              <ReferenceLine x={g / sizes[epsK]} stroke={ORANGE} strokeDasharray="4 4" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, name) => (name === 'x' ? [t.tooltipX(v), ''] : [fmtInt(v, locale), t.tooltipN])}
                separator=" "
                contentStyle={tooltipStyle}
              />
              <Scatter data={chart.outFit} fill={MUTED} shape="circle" isAnimationActive={false} />
              <Scatter data={chart.inFit} fill={ORANGE} shape="circle" isAnimationActive={false} />
              <Scatter
                data={chart.theory}
                line={{ stroke: SLATE, strokeWidth: 1.25, strokeDasharray: '2 3' }}
                shape={NoDot}
                isAnimationActive={false}
              />
              <Scatter
                data={chart.line}
                line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }}
                shape={NoDot}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.legendFit}</LegendItem>
          <LegendItem swatch={<DotSwatch color={MUTED} />}>{t.legendOut}</LegendItem>
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.legendLine(dHat)}</LegendItem>
          <LegendItem swatch={<LineSwatch color={SLATE} width={1.5} dashed />}>{t.legendTheory}</LegendItem>
        </Legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Slider
            label={t.fitLo}
            min={0}
            max={sizes.length - 1}
            step={1}
            value={fitLo}
            onChange={(k) => {
              const lo = Math.min(k, sizes.length - 2)
              setFit({ g, lo, hi: Math.max(fitHi, lo + 1) })
            }}
            format={(k) => t.boxFmt(sizes[k], g)}
          />
          <Slider
            label={t.fitHi}
            min={0}
            max={sizes.length - 1}
            step={1}
            value={fitHi}
            onChange={(k) => {
              const hi = Math.max(k, 1)
              setFit({ g, lo: Math.min(fitLo, hi - 1), hi })
            }}
            format={(k) => t.boxFmt(sizes[k], g)}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.fitNote}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

// Number of sorted values below p (binary search).
function countBelow(sorted, p) {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < p) lo = mid + 1
    else hi = mid
  }
  return lo
}

// A p that opens exactly the first n sites of the sweep order.
function thresholdAt(sorted, n) {
  if (n <= 0) return 0
  if (n >= sorted.length) return 1
  return (sorted[n - 1] + sorted[n]) / 2
}

function PercolationPanel({ t, locale }) {
  const [L, setL] = useState(120)
  const [p, setP] = useState(0.55)
  const [seed, setSeed] = useState(1)
  const [colourAll, setColourAll] = useState(false)
  const [sweeping, setSweeping] = useState(false)
  const [speed, setSpeed] = useState(0.03)
  const [pouring, setPouring] = useState(false)
  const [flash, setFlash] = useState(false)
  const [found, setFound] = useState(null) // where the last sweep first spanned
  const [, setFrame] = useState(0)

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)

  // Site values for this L and seed, and the sweep order they imply.
  const grid = useMemo(() => {
    const u = siteValues(L, seed)
    const order = openingOrder(u)
    const sorted = new Float64Array(order.length)
    for (let k = 0; k < order.length; k++) sorted[k] = u[order[k]]
    return { L, order, sorted }
  }, [L, seed])

  // The union–find state, advanced site by site when p rises and rebuilt
  // when it falls. Lives in a ref: it is far too large for React state.
  const perc = useRef(null)
  const sync = (n) => {
    let cur = perc.current
    if (!cur || cur.grid !== grid || n < cur.n) {
      cur = perc.current = { grid, st: createPercolation(grid.L), n: 0, acc: 0 }
    }
    for (; cur.n < n; cur.n++) openSite(cur.st, grid.order[cur.n])
    return cur
  }
  const cur = sync(countBelow(grid.sorted, p))
  const st = cur.st
  const N = L * L

  // Fluid poured on the current grid; any change of the grid empties it.
  const pour = useRef(null)
  if (pour.current && (pour.current.st !== st || pour.current.n !== cur.n)) pour.current = null

  useEffect(() => {
    if (!flash) return
    const id = setTimeout(() => setFlash(false), 1600)
    return () => clearTimeout(id)
  }, [flash])

  // ---- sweep

  useAnimationLoop((dt) => {
    const c = perc.current
    const s = c.st
    const wasSpanning = s.spanRoot >= 0
    c.acc += (Math.min(dt, 100) / 1000) * speed * N
    let k = Math.floor(c.acc)
    c.acc -= k
    let stop = false
    while (k-- > 0 && c.n < N) {
      openSite(s, grid.order[c.n++])
      if (!wasSpanning && s.spanRoot >= 0) {
        setFound({ p: thresholdAt(grid.sorted, c.n), n: c.n })
        setFlash(true)
        stop = true
        break
      }
    }
    if (c.n >= N) stop = true
    if (stop) setSweeping(false)
    setP(thresholdAt(grid.sorted, c.n))
  }, sweeping)

  // ---- pouring

  useAnimationLoop(() => {
    const f = pour.current
    if (!f) return setPouring(false)
    f.shown = Math.min(f.layers.length, f.shown + Math.max(1, Math.round(L / 60)))
    if (f.shown >= f.layers.length) setPouring(false)
    setFrame((x) => x + 1)
  }, pouring)

  const startPour = () => {
    setSweeping(false)
    const flood = pourFromTop((i) => isOpen(st, i), L)
    pour.current = { ...flood, shown: 0, st, n: cur.n }
    setPouring(true)
  }

  // ---- drawing

  const bitmap = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const size = gridSize(L, avail, MAX_GRID_CANVAS)
    const ctx = prepareCanvas(canvas, size.css, size.down)
    if (!bitmap.current || bitmap.current.L !== L) {
      const c = document.createElement('canvas')
      c.width = L
      c.height = L
      const bctx = c.getContext('2d')
      bitmap.current = { L, canvas: c, ctx: bctx, img: bctx.createImageData(L, L) }
    }
    const { img } = bitmap.current
    const px = img.data
    const largest = st.largestRoot >= 0 ? findRoot(st, st.largestRoot) : -1
    const span = st.spanRoot >= 0 ? findRoot(st, st.spanRoot) : -1
    for (let i = 0; i < N; i++) {
      let c
      if (!isOpen(st, i)) c = RGB.closed
      else {
        const r = findRoot(st, i)
        if (r === span) c = RGB.span
        else if (r === largest) c = RGB.largest
        else if (colourAll) c = CLUSTER_RGB[(Math.imul(r, 2654435761) >>> 0) % CLUSTER_RGB.length]
        else c = RGB.open
      }
      const o = 4 * i
      px[o] = c[0]
      px[o + 1] = c[1]
      px[o + 2] = c[2]
      px[o + 3] = 255
    }
    const f = pour.current
    if (f) {
      const end = f.shown >= f.layers.length ? f.order.length : f.layers[f.shown]
      for (let k = 0; k < end; k++) {
        const o = 4 * f.order[k]
        px[o] = RGB.fluid[0]
        px[o + 1] = RGB.fluid[1]
        px[o + 2] = RGB.fluid[2]
      }
    }
    bitmap.current.ctx.putImageData(img, 0, 0)
    ctx.drawImage(bitmap.current.canvas, 0, 0, canvas.width, canvas.height)
  })

  // ---- stats

  const spanning = st.spanRoot >= 0
  const f = pour.current
  let fluid = null
  if (f) {
    if (!f.order.length) fluid = t.fluidNone
    else {
      const end = f.shown >= f.layers.length ? f.order.length : f.layers[f.shown]
      let deepest = 0
      for (let k = 0; k < end; k++) deepest = Math.max(deepest, (f.order[k] / L) | 0)
      fluid =
        f.bottom >= 0 && f.shown > f.bottom ? t.fluidBottom(fmtInt(f.bottom, locale)) : t.fluidDepth(deepest + 1, L)
    }
  }
  const pFmt = (v) => fmtFixed(v, 3, locale)

  const changeGrid = (fn) => {
    setSweeping(false)
    setPouring(false)
    setFound(null)
    fn()
  }

  return (
    <div className={panel}>
      <PanelTitle>B · {t.percolation}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.gridL} min={20} max={400} step={10} value={L} onChange={(v) => changeGrid(() => setL(v))} />
        <Slider
          label={t.p}
          min={0}
          max={1}
          step={0.001}
          value={p}
          onChange={(v) => {
            setSweeping(false)
            setPouring(false)
            setP(v)
          }}
          format={pFmt}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-slate-700">
          {t.seed} {seed}
        </span>
        <SimControls onReset={() => changeGrid(() => setSeed((s) => s + 1))} labels={{ reset: t.newGrid }} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={colourAll} onChange={(e) => setColourAll(e.target.checked)} className="accent-orange-600" />
          <span className="text-sm font-medium text-slate-700">{t.colourAll}</span>
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-slate-700">{t.sweep}</p>
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
          <SimControls
            playing={sweeping}
            onPlayPause={() => {
              setPouring(false)
              if (!sweeping) perc.current.acc = 0
              setSweeping((s) => !s && perc.current.n < N)
            }}
            onReset={() => {
              setSweeping(false)
              setPouring(false)
              setFound(null)
              setP(0)
            }}
            labels={t.sweepControls}
          />
          <Slider
            label={t.sweepSpeed}
            min={0.003}
            max={0.3}
            log
            value={speed}
            onChange={setSpeed}
            format={(v) => fmtFixed(v, v < 0.01 ? 3 : 2, locale)}
          />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{t.sweepNote}</p>
        {found && (
          <p className="text-sm text-orange-700 font-mono" aria-live="polite">
            {t.spannedAt(fmtFixed(found.p, 4, locale), fmtInt(found.n, locale), fmtPct(found.n / N, locale))}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <SimControls
          onReset={() => {
            if (pouring) setPouring(false)
            else startPour()
          }}
          labels={{ reset: pouring ? t.stopPour : t.pour }}
        />
      </div>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <div
          className={`mx-auto w-fit max-w-full rounded-sm transition-shadow duration-300 ${
            flash ? 'ring-4 ring-orange-500 ring-offset-2' : ''
          }`}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={t.gridAria(L, pFmt(p))}
            className="block bg-white outline outline-1 outline-slate-200"
          />
        </div>
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color="#334155" square />}>{t.legendClosed}</LegendItem>
        <LegendItem swatch={<DotSwatch color="#f8fafc" square border="1px solid #cbd5e1" />}>{t.legendOpen}</LegendItem>
        <LegendItem swatch={<DotSwatch color="#fdba74" square />}>{t.legendLargest}</LegendItem>
        <LegendItem swatch={<DotSwatch color="#ea580c" square />}>{t.legendSpan}</LegendItem>
        <LegendItem swatch={<DotSwatch color="#0284c7" square />}>{t.legendFluid}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.spanning}>
          <span className={spanning ? 'text-orange-700' : ''}>{spanning ? t.yes : t.no}</span>
        </Stat>
        <Stat label={t.clusters}>{fmtInt(st.clusters, locale)}</Stat>
        <Stat label={t.largestStat}>
          {fmtPct(st.largest / N, locale)} <span className="text-slate-500 text-xs">{t.ofGrid}</span>
        </Stat>
        <Stat label={t.vsPc}>
          {p - P_C_SITE >= 0 ? '+' : '−'}
          {fmtFixed(Math.abs(p - P_C_SITE), 3, locale)}
        </Stat>
        {fluid && (
          <div className="col-span-2 sm:col-span-4">
            <Stat label={t.fluidStat}>
              <span aria-live="polite">{fluid}</span>
            </Stat>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.pcNote}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

function makeExperimentJob(runs, round) {
  const acc = EXP_L.map((L) => ({
    L,
    N: L * L,
    runs: 0,
    span: new Float64Array(L * L + 1), // runs that first spanned at n open sites
    largest: new Float64Array(L * L + 1), // sum over runs of the largest cluster after n sites
  }))
  const iter = (function* () {
    const total = EXP_L.length * runs
    let done = 0
    for (const a of acc) {
      const random = mulberry32(5000 + 7919 * round + a.L)
      for (let r = 0; r < runs; r++) {
        const run = newmanZiffRun(a.L, random)
        a.span[run.spanAt]++
        for (let n = 0; n <= a.N; n++) a.largest[n] += run.largest[n]
        a.runs++
        done++
        yield done / total
      }
    }
  })()
  return { iter, snapshot: () => summariseRuns(acc) }
}

// Turns the per-n averages into curves in p: R(p), the spanning probability,
// and the average fraction of sites in the largest cluster.
function summariseRuns(acc) {
  const curves = {}
  const fine = {}
  for (const a of acc) {
    if (!a.runs) continue
    const R = new Float64Array(a.N + 1)
    const P = new Float64Array(a.N + 1)
    let sum = 0
    for (let n = 0; n <= a.N; n++) {
      sum += a.span[n]
      R[n] = sum / a.runs
      P[n] = a.largest[n] / (a.runs * a.N)
    }
    curves[a.L] = { R: binomialSmooth(R, a.N, P_GRID), P: binomialSmooth(P, a.N, P_GRID) }
    if (a.L === 64 || a.L === 128) fine[a.L] = binomialSmooth(R, a.N, P_FINE)
  }
  const rowsR = P_GRID.map((p, k) => {
    const row = { p }
    for (const L of EXP_L) if (curves[L]) row[`L${L}`] = curves[L].R[k]
    return row
  })
  const rowsP = P_GRID.map((p, k) => {
    const row = { p }
    for (const L of EXP_L) if (curves[L]) row[`L${L}`] = curves[L].P[k]
    return row
  })
  const cross = fine[64] && fine[128] ? crossing(P_FINE, fine[64], fine[128]) : null
  return { rowsR, rowsP, cross, runs: acc.map((a) => a.runs) }
}

function SweepChart({ title, aria, rows, t, locale }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-2 h-56 -ml-4" role="img" aria-label={aria}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="p"
              type="number"
              domain={[0.35, 0.83]}
              ticks={[0.4, 0.5, 0.6, 0.7, 0.8]}
              tickFormatter={(v) => fmtFixed(v, 1, locale)}
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(v) => fmtFixed(v, 2, locale)}
              width={44}
              tick={axisTick}
              stroke={MUTED}
            />
            <ReferenceLine x={P_C_SITE} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
            <Tooltip
              formatter={(v, name) => [fmtFixed(v, 3, locale), name]}
              labelFormatter={(p) => t.tooltipP(fmtFixed(p, 3, locale))}
              contentStyle={tooltipStyle}
            />
            {EXP_L.map((L, i) => (
              <Line
                key={L}
                type="linear"
                dataKey={`L${L}`}
                name={t.seriesL(L)}
                stroke={SERIES[i]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ExperimentPanel({ t, locale }) {
  const [runs, setRuns] = useState(200)
  const exp = useExperiment()
  const rounds = useRef(0)
  const start = () => exp.run(makeExperimentJob(runs, rounds.current++))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => start(), [])

  const data = exp.data

  return (
    <div className={panel}>
      <PanelTitle>C · {t.experiment}</PanelTitle>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.expNote(runs)}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={t.runs} min={20} max={500} step={10} value={runs} onChange={setRuns} />
        <div className="flex flex-wrap gap-2">
          <SimControls onReset={start} labels={{ reset: t.runAgain }} />
          {exp.running && <SimControls onReset={exp.cancel} labels={{ reset: t.cancel }} />}
        </div>
      </div>
      {exp.running && (
        <>
          <ProgressBar progress={exp.progress} />
          <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
            {t.progress(exp.progress)}
          </p>
        </>
      )}
      {exp.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled(exp.progress)}</p>}

      <Legend>
        {EXP_L.map((L, i) => (
          <LegendItem key={L} swatch={<LineSwatch color={SERIES[i]} />}>
            {t.seriesL(L)}
          </LegendItem>
        ))}
        <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.pcLine}</LegendItem>
      </Legend>

      <div className="mt-3 grid gap-6 lg:grid-cols-2">
        <SweepChart title={t.spanTitle} aria={t.spanAria} rows={data ? data.rowsR : []} t={t} locale={locale} />
        <SweepChart title={t.massTitle} aria={t.massAria} rows={data ? data.rowsP : []} t={t} locale={locale} />
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
        <Stat label={t.crossStat}>
          <span className="text-orange-700">{data && data.cross != null ? `p ≈ ${fmtFixed(data.cross, 4, locale)}` : t.crossNone}</span>
          <span className="text-slate-500"> · p_c ≈ {fmtFixed(P_C_SITE, 4, locale)}</span>
        </Stat>
      </div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">{t.expCaption}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function FractalsPercolation({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <FractalPanel t={t} locale={locale} />
      <PercolationPanel t={t} locale={locale} />
      <ExperimentPanel t={t} locale={locale} />
    </div>
  )
}
