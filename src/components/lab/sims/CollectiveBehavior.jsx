import { memo, useEffect, useMemo, useRef, useState } from 'react'
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
  SEP_DIST,
  FLEE_DIST,
  createFlock,
  flockStep,
  neighboursOf,
  flockOrder,
  flockGroups,
  meanNearest,
  VICSEK_EXPERIMENT,
  vicsekSweep,
} from '../flocking.js'
import vicsekPrecomputed from '../../../data/lab/precomputed/vicsek.json'
import { SHORT_LEN, WINDOW, createBridge, bridgeStep, shortShare, shortOpen, runBridge } from '../antbridge.js'

// Collective behaviour, in three panels: boids on a torus, with metric or
// topological neighbours and an optional predator; the Vicsek transition
// (an experiment); and the double bridge of Argentine ants, with a batch of
// colonies run on request.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

const MAX_CANVAS = 560 // css px
const HIST_MAX = 600 // points in the history charts

// Panel A: the world is a torus of side WORLD; groups join boids closer than LINK.
const WORLD = 100
const LINK = 8
const STEPS_PER_SEC = 60
const STATS_EVERY = 10 // steps between group / nearest-neighbour counts
const DEG = Math.PI / 180

// Panel B: the Vicsek experiment (settings shared with the precompute script).
const { density: VK_DENSITY, v0: VK_V0, warm: VK_WARM, measure: VK_MEASURE, sizes: VK_N, etas: VK_ETA } = VICSEK_EXPERIMENT
const VK_COLOR = { 100: MUTED, 400: SLATE, 1000: ORANGE }
// Mean |average of N random unit vectors| ≈ √π / (2√N), about 0.89 / √N.
const randomPhi = (N) => Math.sqrt(Math.PI) / (2 * Math.sqrt(N))

// Panel C: the double bridge.
const BRIDGE_RUN = 2000 // steps a colony runs in the batch, after the short branch opens
const BRIDGE_EVERY = 5 // steps between history points

const T = {
  en: {
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    cancel: 'Cancel',
    runAgain: 'Run again',
    cancelled: 'Cancelled: the runs finished so far are shown.',
    runs: 'Runs per value R',
    seed: 'Seed',
    stepLabel: 'step',

    flocking: 'Flocking',
    N: 'Boids N',
    sep: 'Separation weight',
    ali: 'Alignment weight',
    coh: 'Cohesion weight',
    radius: 'Perception radius',
    fov: 'Field of view',
    vmax: 'Max speed',
    noise: 'Noise (random turn)',
    noiseFmt: (v) => `${v} rad`,
    mode: 'Neighbours',
    modes: { metric: 'Metric (radius)', topological: 'Topological (k nearest)' },
    k: 'Neighbours k',
    predator: 'Predator',
    onOff: { off: 'Off', on: 'On' },
    flockNote: (sep) =>
      `The world wraps around at the edges and is ${WORLD} units across. Each boid steers away from neighbours closer than ${sep} units, towards their average heading and towards their average position, with the weights above, then turns by a random angle. Metric: its neighbours are all boids within the perception radius. Topological: the k nearest, however far. Either way only those inside its field of view.`,
    predatorNote: (d) => `The predator (dark, with its range dashed) chases the nearest boid, a little faster than the boids fly; boids within ${d} units of it flee.`,
    flockAria: 'Boids drawn as small slate triangles; one tracked boid in orange with lines to its current neighbours.',
    legendBoid: 'boid',
    legendTracked: 'tracked boid',
    legendNbr: 'its neighbours',
    legendPredator: 'predator',
    phi: 'Order φ',
    phiKey: '|mean heading|',
    groups: 'Groups',
    groupsKey: (d) => `boids within ${d} units linked`,
    largest: (v) => `largest ${v}`,
    nn: 'Nearest neighbour',
    nnKey: 'mean distance, units',
    time: 'Time step',
    phiChart: 'Order parameter over time',
    phiAria: 'Order parameter φ against the time step.',

    vicsek: 'The Vicsek transition',
    vkNote: (rho, v0, w, m) =>
      `Particles at density ${rho} per unit area (the interaction radius is 1) move at speed ${v0}; the box grows with N to keep the density fixed. For each noise η, R runs start with everyone heading the same way, take ${w} steps to forget it, and φ is averaged over the next ${m}. These settings are fixed and do not follow Panel A.`,
    vkProgress: (p) => `Flying … ${Math.round(p * 100)}%`,
    vkRun: 'Run',
    vkPrecomputed: (r) => `Curves precomputed with the same code and seeds (R = ${r}); press Run to recompute live.`,
    vkTitle: 'Order parameter against noise',
    vkAria: 'Order parameter against noise for three system sizes, with the value expected for random headings.',
    vkSeries: (n) => `N = ${n}`,
    vkRandom: (v) => `random headings, N = 1000 (≈ 1/√N, ${v})`,
    vkHalf: (n) => `φ = 0.5 at, N = ${n}`,
    vkReading:
      'At low noise everyone flies the same way and φ is close to 1; at η = 2π headings are random and φ falls to the level of chance, about 1/√N. In between, the drop gets steeper as N grows: the signature of a phase transition, blurred in small systems.',

    bridge: 'The double bridge',
    ratio: 'Length ratio long / short',
    rate: 'Ants per step',
    rho: 'Evaporation ρ',
    n: 'Exponent n',
    kChoice: 'Constant k',
    late: 'Open the short branch later',
    delay: 'Opens at step',
    speed: 'Steps per second',
    bridgeNote: (len) =>
      `Ants leave the nest (left), cross to the food (right) and come back, one unit per step; the short branch takes ${len} steps. At each end an ant picks a branch with probability P_i = (k + C_i)^n / Σ_j (k + C_j)^n, where C_i is the pheromone on branch i. Every crossing adds the same amount, whatever the branch's length; each step a fraction ρ evaporates.`,
    bridgeAria: 'The nest and the food joined by a short upper branch and a long lower branch; the thickness of each branch shows its pheromone, and ants are dots.',
    nest: 'Nest',
    food: 'Food',
    closed: 'closed',
    share: 'Short branch',
    shareKey: (w) => `share of last ${w} choices`,
    pherS: 'Pheromone, short',
    pherL: 'Pheromone, long',
    ants: 'Ants on the bridge',
    shareChart: 'Share choosing the short branch',
    shareAria: 'Share of recent choices that went to the short branch, against the time step.',
    pherChart: 'Pheromone on each branch',
    pherAria: 'Pheromone concentration on the short and the long branch, against the time step.',
    shortName: 'short',
    longName: 'long',
    batch: 'Many colonies',
    batchRuns: 'Colonies R',
    batchRun: 'Run colonies',
    batchNote: (steps) =>
      `Runs R colonies with the settings above, each for ${steps} steps after the short branch is open, and counts those whose last ${WINDOW} choices went mostly to the short branch.`,
    batchProgress: (p) => `Foraging … ${Math.round(p * 100)}%`,
    batchResult: (k, R, pct) => `${k} of ${R} colonies (${pct}) ended on the short branch`,
    batchMean: (v) => `mean final share on the short branch: ${v}`,
  },
  it: {
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    cancel: 'Annulla',
    runAgain: 'Ripeti',
    cancelled: 'Annullato: sono mostrate le prove completate finora.',
    runs: 'Prove per valore R',
    seed: 'Seme',
    stepLabel: 'passo',

    flocking: 'Lo stormo',
    N: 'Boid N',
    sep: 'Peso della separazione',
    ali: "Peso dell'allineamento",
    coh: 'Peso della coesione',
    radius: 'Raggio di percezione',
    fov: 'Campo visivo',
    vmax: 'Velocità massima',
    noise: 'Rumore (virata casuale)',
    noiseFmt: (v) => `${v} rad`,
    mode: 'Vicini',
    modes: { metric: 'Metrici (raggio)', topological: 'Topologici (k più vicini)' },
    k: 'Vicini k',
    predator: 'Predatore',
    onOff: { off: 'No', on: 'Sì' },
    flockNote: (sep) =>
      `Il mondo si richiude ai bordi ed è largo ${WORLD} unità. Ogni boid si allontana dai vicini più vicini di ${sep} unità, si orienta verso la loro direzione media e verso la loro posizione media, con i pesi qui sopra, poi vira di un angolo casuale. Metrici: i vicini sono tutti i boid entro il raggio di percezione. Topologici: i k più vicini, a qualunque distanza. In entrambi i casi solo quelli nel suo campo visivo.`,
    predatorNote: (d) => `Il predatore (scuro, con il suo raggio tratteggiato) insegue il boid più vicino, un po' più veloce dei boid; i boid entro ${d} unità fuggono.`,
    flockAria: 'Boid disegnati come piccoli triangoli ardesia; un boid seguito in arancione, con linee verso i suoi vicini del momento.',
    legendBoid: 'boid',
    legendTracked: 'boid seguito',
    legendNbr: 'i suoi vicini',
    legendPredator: 'predatore',
    phi: 'Ordine φ',
    phiKey: '|direzione media|',
    groups: 'Gruppi',
    groupsKey: (d) => `boid entro ${d} unità collegati`,
    largest: (v) => `il più grande ${v}`,
    nn: 'Vicino più prossimo',
    nnKey: 'distanza media, unità',
    time: 'Passo di tempo',
    phiChart: "Parametro d'ordine nel tempo",
    phiAria: "Parametro d'ordine φ contro il passo di tempo.",

    vicsek: 'La transizione di Vicsek',
    vkNote: (rho, v0, w, m) =>
      `Particelle a densità ${rho} per unità di area (il raggio d'interazione è 1) si muovono a velocità ${v0}; la scatola cresce con N per tenere fissa la densità. Per ogni rumore η, R prove partono con tutti nella stessa direzione, fanno ${w} passi per dimenticarla, e φ è mediato sui ${m} successivi. Queste impostazioni sono fisse e non seguono il pannello A.`,
    vkProgress: (p) => `In volo … ${Math.round(p * 100)}%`,
    vkRun: 'Esegui',
    vkPrecomputed: (r) => `Curve precalcolate con lo stesso codice e gli stessi semi (R = ${r}); premi Esegui per ricalcolarle dal vivo.`,
    vkTitle: "Parametro d'ordine contro il rumore",
    vkAria: "Parametro d'ordine contro il rumore per tre dimensioni del sistema, con il valore atteso per direzioni casuali.",
    vkSeries: (n) => `N = ${n}`,
    vkRandom: (v) => `direzioni casuali, N = 1000 (≈ 1/√N, ${v})`,
    vkHalf: (n) => `φ = 0,5 a, N = ${n}`,
    vkReading:
      'Con poco rumore tutti volano nella stessa direzione e φ è vicino a 1; a η = 2π le direzioni sono casuali e φ scende al livello del caso, circa 1/√N. In mezzo, la discesa diventa più ripida al crescere di N: il segno di una transizione di fase, sfumata nei sistemi piccoli.',

    bridge: 'Il doppio ponte',
    ratio: 'Rapporto di lunghezza lungo / corto',
    rate: 'Formiche per passo',
    rho: 'Evaporazione ρ',
    n: 'Esponente n',
    kChoice: 'Costante k',
    late: 'Apri il ramo corto più tardi',
    delay: 'Si apre al passo',
    speed: 'Passi al secondo',
    bridgeNote: (len) =>
      `Le formiche escono dal nido (a sinistra), raggiungono il cibo (a destra) e tornano, un'unità per passo; il ramo corto richiede ${len} passi. A ogni estremità una formica sceglie un ramo con probabilità P_i = (k + C_i)^n / Σ_j (k + C_j)^n, dove C_i è il feromone sul ramo i. Ogni attraversamento aggiunge la stessa quantità, qualunque sia la lunghezza del ramo; a ogni passo ne evapora una frazione ρ.`,
    bridgeAria: 'Il nido e il cibo uniti da un ramo corto in alto e uno lungo in basso; lo spessore di ogni ramo mostra il suo feromone, e le formiche sono punti.',
    nest: 'Nido',
    food: 'Cibo',
    closed: 'chiuso',
    share: 'Ramo corto',
    shareKey: (w) => `quota delle ultime ${w} scelte`,
    pherS: 'Feromone, corto',
    pherL: 'Feromone, lungo',
    ants: 'Formiche sul ponte',
    shareChart: 'Quota che sceglie il ramo corto',
    shareAria: 'Quota delle scelte recenti andate al ramo corto, contro il passo di tempo.',
    pherChart: 'Feromone su ciascun ramo',
    pherAria: 'Concentrazione di feromone sul ramo corto e su quello lungo, contro il passo di tempo.',
    shortName: 'corto',
    longName: 'lungo',
    batch: 'Molte colonie',
    batchRuns: 'Colonie R',
    batchRun: 'Avvia le colonie',
    batchNote: (steps) =>
      `Fa evolvere R colonie con le impostazioni qui sopra, ognuna per ${steps} passi dopo l'apertura del ramo corto, e conta quelle le cui ultime ${WINDOW} scelte sono andate per lo più al ramo corto.`,
    batchProgress: (p) => `Foraggiamento … ${Math.round(p * 100)}%`,
    batchResult: (k, R, pct) => `${k} colonie su ${R} (${pct}) hanno finito sul ramo corto`,
    batchMean: (v) => `quota finale media sul ramo corto: ${v}`,
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)
const fmtPct = (v, locale, d = 0) => `${fmtFixed(v * 100, d, locale)}%`

// Multiples of π/2 on the noise axis.
function fmtPi(v) {
  const q = Math.round(v / (Math.PI / 2))
  return ['0', 'π/2', 'π', '3π/2', '2π'][q] ?? fmtFixed(v, 1)
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

// Sizes a canvas to cssW × cssH pixels at the device pixel ratio and returns
// its context, scaled so that drawing is in css pixels.
function prepareCanvas(canvas, cssW, cssH) {
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(1, Math.round(cssW * dpr))
  const h = Math.max(1, Math.round(cssH * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)
  return ctx
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

function Chips({ label, options, value, onChange, names }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-700 mr-1">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" className={chip(value === o)} aria-pressed={value === o} onClick={() => onChange(o)}>
          {names[o]}
        </button>
      ))}
    </div>
  )
}

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

function DotSwatch({ color, size = 8, border }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
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

// A Scatter drawn only as a line, for curves.
const NoDot = () => null

// Repaints charts at most a few times per second while a simulation runs.
function useThrottledVersion(ms = 400) {
  const [version, setVersion] = useState(0)
  const last = useRef(0)
  const bump = (force = false) => {
    const now = performance.now()
    if (force || now - last.current > ms) {
      last.current = now
      setVersion((v) => v + 1)
    }
  }
  return [version, bump]
}

// A history sampled every `every` steps, thinned by half whenever it
// reaches HIST_MAX points. Each point is { x, ...values }.
function createHistory(every = 1) {
  return { every, points: [] }
}

function record(hist, x, values) {
  if (x % hist.every !== 0) return
  hist.points.push({ x, ...values })
  if (hist.points.length > HIST_MAX) {
    hist.every *= 2
    hist.points = hist.points.filter((p) => p.x % hist.every === 0)
  }
}

// A small line chart of one or more histories.
const HistoryChart = memo(function HistoryChart({ data, series, aria, locale, xLabel, yDomain, yTicks, fmt }) {
  const xMax = Math.max(1, data.length ? data[data.length - 1].x : 1)
  return (
    <div className="mt-3 h-44 -ml-4" role="img" aria-label={aria}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[0, xMax]} allowDecimals={false} tick={axisTick} stroke={MUTED} />
          <YAxis domain={yDomain} ticks={yTicks} tickFormatter={fmt} width={44} tick={axisTick} stroke={MUTED} />
          <Tooltip
            formatter={(v, name) => [fmt(v), name]}
            labelFormatter={(v) => `${xLabel} ${fmtInt(v, locale)}`}
            contentStyle={tooltipStyle}
          />
          {series.map((s) => (
            <Line key={s.key} type="linear" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// ---------------------------------------------------------------- Panel A

function newFlock(N, vmax, seed) {
  const random = mulberry32(seed)
  const flock = createFlock(N, WORLD, vmax, random)
  const hist = createHistory(5)
  record(hist, 0, { phi: flockOrder(flock) })
  return { flock, random, hist, stats: null }
}

// A boid as a small triangle pointing along (vx, vy), in css pixels.
function triangle(ctx, x, y, vx, vy, size) {
  const v = Math.hypot(vx, vy) || 1
  const ux = vx / v
  const uy = vy / v
  ctx.moveTo(x + ux * size, y + uy * size)
  ctx.lineTo(x - ux * size * 0.6 - uy * size * 0.5, y - uy * size * 0.6 + ux * size * 0.5)
  ctx.lineTo(x - ux * size * 0.6 + uy * size * 0.5, y - uy * size * 0.6 - ux * size * 0.5)
  ctx.closePath()
}

const wrapD = (d, L) => (d > L / 2 ? d - L : d < -L / 2 ? d + L : d)

function FlockPanel({ t, locale }) {
  const [N, setN] = useState(200)
  const [sep, setSep] = useState(2)
  const [ali, setAli] = useState(1)
  const [coh, setCoh] = useState(1)
  const [radius, setRadius] = useState(6)
  const [fov, setFov] = useState(270)
  const [vmax, setVmax] = useState(1)
  const [noise, setNoise] = useState(0.3)
  const [mode, setMode] = useState('metric')
  const [k, setK] = useState(7)
  const [predator, setPredator] = useState('off')
  const [seed, setSeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  const params = useMemo(
    () => ({ sep, ali, coh, radius, fov: fov * DEG, vmax, noise, mode, k, predator: predator === 'on' }),
    [sep, ali, coh, radius, fov, vmax, noise, mode, k, predator],
  )

  const key = `${N}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newFlock(N, vmax, seed)
    ref.current.key = key
  }
  const model = ref.current
  const { flock } = model

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const acc = useRef(0)

  const reset = (fn) => {
    setPlaying(false)
    acc.current = 0
    fn()
    bump(true)
  }

  const step = () => {
    flockStep(flock, params, model.random)
    record(model.hist, flock.t, { phi: flockOrder(flock) })
    if (flock.t % STATS_EVERY === 0) model.stats = null
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * STEPS_PER_SEC
    const begin = performance.now()
    while (acc.current >= 1 && performance.now() - begin < 12) {
      step()
      acc.current -= 1
    }
    if (acc.current > 3) acc.current = 0 // too slow to keep up: drop the backlog
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  // Groups and nearest-neighbour distances are recounted every few steps.
  if (!model.stats) {
    model.stats = { ...flockGroups(flock, LINK), nn: meanNearest(flock) }
  }
  const phi = flockOrder(flock)

  // ---- drawing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const css = Math.min(avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, css, css)
    const s = css / WORLD
    const size = Math.max(3, Math.min(6, s * 1.3))
    const { x, y, vx, vy } = flock
    const tracked = neighboursOf(flock, 0, params)
    const isNbr = new Set(tracked)

    // The tracked boid's perception range (metric) and links to its neighbours.
    ctx.strokeStyle = 'rgba(247, 147, 26, 0.5)'
    ctx.lineWidth = 1
    if (params.mode === 'metric') {
      ctx.setLineDash([3, 3])
      const a = Math.atan2(vy[0], vx[0])
      ctx.beginPath()
      if (fov < 360) {
        ctx.moveTo(x[0] * s, y[0] * s)
        ctx.arc(x[0] * s, y[0] * s, radius * s, a - params.fov / 2, a + params.fov / 2)
        ctx.closePath()
      } else ctx.arc(x[0] * s, y[0] * s, radius * s, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.beginPath()
    for (const j of tracked) {
      ctx.moveTo(x[0] * s, y[0] * s)
      ctx.lineTo((x[0] + wrapD(x[j] - x[0], WORLD)) * s, (y[0] + wrapD(y[j] - y[0], WORLD)) * s)
    }
    ctx.stroke()

    ctx.fillStyle = SLATE
    ctx.beginPath()
    for (let i = 1; i < flock.N; i++) if (!isNbr.has(i)) triangle(ctx, x[i] * s, y[i] * s, vx[i], vy[i], size)
    ctx.fill()
    ctx.fillStyle = 'rgba(247, 147, 26, 0.55)'
    ctx.beginPath()
    for (const j of tracked) triangle(ctx, x[j] * s, y[j] * s, vx[j], vy[j], size)
    ctx.fill()
    ctx.fillStyle = ORANGE
    ctx.strokeStyle = INK
    ctx.beginPath()
    triangle(ctx, x[0] * s, y[0] * s, vx[0], vy[0], size * 1.6)
    ctx.fill()
    ctx.stroke()

    if (params.predator) {
      const p = flock.predator
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(p.x * s, p.y * s, FLEE_DIST * s, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = INK
      ctx.beginPath()
      triangle(ctx, p.x * s, p.y * s, p.vx || 1, p.vy, size * 2.2)
      ctx.fill()
    }
  })

  const phiData = useMemo(
    () => model.hist.points.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )

  return (
    <div className={panel}>
      <PanelTitle>A · {t.flocking}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.N} min={20} max={600} step={10} value={N} onChange={(v) => reset(() => setN(v))} />
        <Slider label={t.seed} min={1} max={50} step={1} value={seed} onChange={(v) => reset(() => setSeed(v))} />
        <Slider label={t.sep} min={0} max={3} step={0.1} value={sep} onChange={setSep} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.ali} min={0} max={3} step={0.1} value={ali} onChange={setAli} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.coh} min={0} max={3} step={0.1} value={coh} onChange={setCoh} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.radius} min={2} max={20} step={0.5} value={radius} onChange={setRadius} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.fov} min={90} max={360} step={10} value={fov} onChange={setFov} format={(v) => `${v}°`} />
        <Slider label={t.vmax} min={0.3} max={2} step={0.1} value={vmax} onChange={setVmax} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.noise} min={0} max={2} step={0.05} value={noise} onChange={setNoise} format={(v) => t.noiseFmt(fmtFixed(v, 2, locale))} />
        {mode === 'topological' && <Slider label={t.k} min={1} max={15} step={1} value={k} onChange={setK} />}
      </div>
      <div className="mt-4 space-y-3">
        <Chips label={t.mode} options={['metric', 'topological']} value={mode} names={t.modes} onChange={setMode} />
        <Chips label={t.predator} options={['off', 'on']} value={predator} names={t.onOff} onChange={setPredator} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            acc.current = 0
            setPlaying((p) => !p)
          }}
          onReset={() => reset(() => (ref.current = null))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {t.flockNote(fmtFixed(SEP_DIST, 1, locale))}
        {predator === 'on' && ` ${t.predatorNote(FLEE_DIST)}`}
      </p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.flockAria} className="block mx-auto bg-slate-50 outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={SLATE} />}>{t.legendBoid}</LegendItem>
        <LegendItem swatch={<DotSwatch color={ORANGE} size={10} border={`1px solid ${INK}`} />}>{t.legendTracked}</LegendItem>
        <LegendItem swatch={<DotSwatch color="rgba(247, 147, 26, 0.55)" />}>{t.legendNbr}</LegendItem>
        {predator === 'on' && <LegendItem swatch={<DotSwatch color={INK} size={10} />}>{t.legendPredator}</LegendItem>}
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.phi}>
          <span className="text-orange-700">{fmtFixed(phi, 3, locale)}</span>
          <span className="block text-xs text-slate-500">{t.phiKey}</span>
        </Stat>
        <Stat label={t.groups}>
          {fmtInt(model.stats.groups, locale)}
          <span className="block text-xs text-slate-500">{t.largest(fmtPct(model.stats.largest, locale))}</span>
        </Stat>
        <Stat label={t.nn}>
          {fmtFixed(model.stats.nn, 2, locale)}
          <span className="block text-xs text-slate-500">{t.nnKey}</span>
        </Stat>
        <Stat label={t.time}>{fmtInt(flock.t, locale)}</Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.groupsKey(LINK)}.</p>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.phiChart}</PanelTitle>
        <HistoryChart
          data={phiData}
          series={[{ key: 'phi', name: t.phi, color: ORANGE }]}
          aria={t.phiAria}
          locale={locale}
          xLabel={t.stepLabel}
          yDomain={[0, 1]}
          yTicks={[0, 0.25, 0.5, 0.75, 1]}
          fmt={(v) => fmtFixed(v, 2, locale)}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function makeVicsekJob(R) {
  const series = Object.fromEntries(VK_N.map((n) => [n, []]))
  const iter = vicsekSweep(R, series)
  return { iter, snapshot: () => ({ series: Object.fromEntries(VK_N.map((n) => [n, series[n].slice()])) }) }
}

// The noise at which a curve first falls through φ = 0.5, by linear interpolation.
function halfCrossing(points) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (a.y >= 0.5 && b.y < 0.5) return a.x + ((a.y - 0.5) / (a.y - b.y)) * (b.x - a.x)
  }
  return null
}

function VicsekPanel({ t, locale }) {
  const [R, setR] = useState(VICSEK_EXPERIMENT.runs)
  const exp = useExperiment()

  // Until Run is pressed, show the stored curves (same code, same seeds).
  const precomputed = exp.data == null
  const data = precomputed ? vicsekPrecomputed : exp.data
  const base = randomPhi(1000)

  return (
    <div className={panel}>
      <PanelTitle>B · {t.vicsek}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Slider label={t.runs} min={1} max={10} step={1} value={R} onChange={setR} />
        <div className="flex flex-wrap gap-2">
          <SimControls onReset={() => exp.run(makeVicsekJob(R))} labels={{ reset: t.vkRun }} />
          {exp.running && <SimControls onReset={exp.cancel} labels={{ reset: t.cancel }} />}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {t.vkNote(fmtFixed(VK_DENSITY, 0, locale), fmtFixed(VK_V0, 1, locale), VK_WARM, VK_MEASURE)}
      </p>
      {precomputed && <p className="mt-2 font-mono text-xs text-slate-500">{t.vkPrecomputed(vicsekPrecomputed.R)}</p>}
      {exp.running && (
        <>
          <ProgressBar progress={exp.progress} />
          <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
            {t.vkProgress(exp.progress)}
          </p>
        </>
      )}
      {exp.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled}</p>}

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.vkTitle}</PanelTitle>
        <div className="mt-3 h-72 -ml-4" role="img" aria-label={t.vkAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 2 * Math.PI]}
                ticks={[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI]}
                tickFormatter={fmtPi}
                tick={axisTick}
                stroke={MUTED}
              />
              <YAxis dataKey="y" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => fmtFixed(v, 2, locale)} width={44} tick={axisTick} stroke={MUTED} />
              <ReferenceLine y={base} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, name) => (name === 'x' ? [fmtFixed(v, 2, locale), 'η'] : [fmtFixed(v, 3, locale), 'φ'])}
                separator=" "
                contentStyle={tooltipStyle}
              />
              {VK_N.map((n) => (
                <Scatter
                  key={n}
                  data={data ? data.series[n] : []}
                  fill={VK_COLOR[n]}
                  line={{ stroke: VK_COLOR[n], strokeWidth: 1.5 }}
                  shape="circle"
                  isAnimationActive={false}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          {VK_N.map((n) => (
            <LegendItem key={n} swatch={<DotSwatch color={VK_COLOR[n]} />}>
              {t.vkSeries(fmtInt(n, locale))}
            </LegendItem>
          ))}
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.vkRandom(fmtFixed(base, 3, locale))}</LegendItem>
        </Legend>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-sm">
        {VK_N.map((n) => {
          const pts = data ? data.series[n] : []
          const eta = pts.length === VK_ETA.length ? halfCrossing(pts) : null
          return (
            <Stat key={n} label={t.vkHalf(fmtInt(n, locale))}>
              {eta == null ? '–' : `η = ${fmtFixed(eta, 2, locale)}`}
            </Stat>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.vkReading}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

// The angle α of a circular arc of length s on a chord c (sin α / α = c / s),
// found by bisection; the arc spans 2α.
function arcAngle(ratio) {
  const target = 1 / ratio
  let lo = 1e-6
  let hi = Math.PI - 1e-6
  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2
    if (Math.sin(mid) / mid > target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// Geometry of the schematic: the short branch bulges up, the long one down,
// with drawn lengths in the true ratio. Returns a point function and the
// bounding box, in units of the chord.
const SHORT_DRAWN = 1.12 // drawn length of the short branch, in chords

function bridgeGeometry(ratio) {
  const arcs = [SHORT_DRAWN, SHORT_DRAWN * ratio].map((len, b) => {
    const a = arcAngle(len)
    const R = 0.5 / Math.sin(a)
    return { a, R, sag: R * (1 - Math.cos(a)), up: b === 0 }
  })
  // u in [0, 1] from nest (x = 0) to food (x = 1); y grows downwards.
  const point = (b, u) => {
    const { a, R, up } = arcs[b]
    const th = Math.PI / 2 + a - 2 * a * u
    const x = 0.5 + R * Math.cos(th)
    const yUp = -R * Math.cos(a) + R * Math.sin(th)
    return [x, up ? -yUp : yUp]
  }
  // An arc of more than half a circle bulges past the nest and the food.
  const side = Math.max(...arcs.map(({ a, R }) => (a > Math.PI / 2 ? R - 0.5 : 0)))
  return { point, top: arcs[0].sag, bottom: arcs[1].sag, side }
}

function newBridge(ratio, openAt, seed) {
  const random = mulberry32(seed)
  const bridge = createBridge(ratio, openAt)
  const hist = createHistory(BRIDGE_EVERY)
  record(hist, 0, { share: 0, s: 0, l: 0 })
  return { bridge, random, hist }
}

function makeBatchJob(ratio, openAt, p, R, seed) {
  const runs = []
  const steps = openAt + BRIDGE_RUN
  const iter = (function* () {
    for (let r = 0; r < R; r++) {
      runs.push(runBridge(ratio, openAt, p, steps, mulberry32(7919 * seed + r)))
      yield runs.length / R
    }
  })()
  return { iter, snapshot: () => ({ R, runs: runs.slice() }) }
}

function BridgePanel({ t, locale }) {
  const [ratio, setRatio] = useState(2)
  const [rate, setRate] = useState(1)
  const [rho, setRho] = useState(0.01)
  const [n, setN] = useState(2)
  const [k, setK] = useState(20)
  const [late, setLate] = useState('off')
  const [delay, setDelay] = useState(500)
  const [speed, setSpeed] = useState(30)
  const [seed, setSeed] = useState(1)
  const [batchR, setBatchR] = useState(20)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()
  const batch = useExperiment()

  const openAt = late === 'on' ? delay : 0
  const params = useMemo(() => ({ rate, rho, n, k }), [rate, rho, n, k])

  const key = `${ratio}-${openAt}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newBridge(ratio, openAt, seed)
    ref.current.key = key
  }
  const model = ref.current
  const { bridge } = model

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const acc = useRef(0)

  const reset = (fn) => {
    setPlaying(false)
    acc.current = 0
    fn()
    bump(true)
  }

  const step = () => {
    bridgeStep(bridge, params, model.random)
    record(model.hist, bridge.t, { share: shortShare(bridge), s: bridge.C[0], l: bridge.C[1] })
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * speed
    const begin = performance.now()
    while (acc.current >= 1 && performance.now() - begin < 12) {
      step()
      acc.current -= 1
    }
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  // ---- drawing

  const geom = useMemo(() => bridgeGeometry(ratio), [ratio])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const W = Math.min(avail, MAX_CANVAS)
    const margin = 34
    const maxH = 360
    const chord = Math.min((W - 2 * margin) / (1 + 2 * geom.side), (maxH - 2 * margin) / (geom.top + geom.bottom))
    const H = Math.ceil(chord * (geom.top + geom.bottom) + 2 * margin)
    const ox = (W - chord) / 2
    const oy = margin + chord * geom.top
    const ctx = prepareCanvas(canvas, W, H)
    const at = (b, u) => {
      const [x, y] = geom.point(b, u)
      return [ox + x * chord, oy + y * chord]
    }
    const trace = (b) => {
      ctx.beginPath()
      for (let q = 0; q <= 64; q++) {
        const [x, y] = at(b, q / 64)
        if (q === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    }
    const open = shortOpen(bridge)
    const cmax = Math.max(bridge.C[0], bridge.C[1], 1)
    for (const b of [1, 0]) {
      // The bare track, then pheromone on top: thicker and stronger with more.
      ctx.lineCap = 'round'
      ctx.strokeStyle = GRID
      ctx.lineWidth = 6
      ctx.setLineDash(b === 0 && !open ? [6, 6] : [])
      trace(b)
      ctx.stroke()
      ctx.setLineDash([])
      const f = bridge.C[b] / cmax
      if (f > 0.005) {
        ctx.strokeStyle = `rgba(247, 147, 26, ${0.25 + 0.75 * f})`
        ctx.lineWidth = 2 + 10 * f
        trace(b)
        ctx.stroke()
      }
    }
    if (!open) {
      const [x, y] = at(0, 0.5)
      ctx.fillStyle = SLATE
      ctx.font = `11px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(t.closed, x, y - 12)
    }

    ctx.fillStyle = 'rgba(51, 65, 85, 0.85)' // slate-700
    ctx.beginPath()
    for (const ant of bridge.ants) {
      const u = ant.pos / bridge.len[ant.branch]
      const [x, y] = at(ant.branch, ant.back ? 1 - u : u)
      ctx.moveTo(x + 2.5, y)
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI)
    }
    ctx.fill()

    // Labels above and outside the two ends, clear of both branches.
    ctx.font = `11px ${MONO}`
    for (const [u, label] of [
      [0, t.nest],
      [1, t.food],
    ]) {
      const x = ox + u * chord
      ctx.fillStyle = u === 0 ? INK : ORANGE
      ctx.beginPath()
      ctx.arc(x, oy, 9, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = INK
      ctx.textAlign = u === 0 ? 'right' : 'left'
      ctx.fillText(label, x + (u === 0 ? -8 : 8), oy - 14)
    }
  })

  // ---- numbers and charts

  const histData = useMemo(
    () => model.hist.points.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const pherMax = useMemo(() => {
    let m = 1
    for (const p of histData) m = Math.max(m, p.s, p.l)
    return m
  }, [histData])

  const runs = batch.data ? batch.data.runs : []
  const wins = runs.filter((r) => r.share > 0.5).length
  const meanShare = runs.length ? runs.reduce((a, r) => a + r.share, 0) / runs.length : null

  return (
    <div className={panel}>
      <PanelTitle>C · {t.bridge}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.ratio} min={1} max={3} step={0.1} value={ratio} onChange={(v) => reset(() => setRatio(v))} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.rate} min={0.1} max={3} step={0.1} value={rate} onChange={setRate} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.rho} min={0} max={0.05} step={0.001} value={rho} onChange={setRho} format={(v) => fmtFixed(v, 3, locale)} />
        <Slider label={t.n} min={1} max={3} step={0.1} value={n} onChange={setN} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.kChoice} min={1} max={50} step={1} value={k} onChange={setK} />
        <Slider label={t.speed} min={5} max={300} log value={speed} onChange={setSpeed} format={(v) => fmtInt(v, locale)} />
        <Slider label={t.seed} min={1} max={50} step={1} value={seed} onChange={(v) => reset(() => setSeed(v))} />
        {late === 'on' && <Slider label={t.delay} min={100} max={2000} step={50} value={delay} onChange={(v) => reset(() => setDelay(v))} />}
      </div>
      <div className="mt-4 space-y-3">
        <Chips label={t.late} options={['off', 'on']} value={late} names={t.onOff} onChange={(v) => reset(() => setLate(v))} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            acc.current = 0
            setPlaying((p) => !p)
          }}
          onReset={() => reset(() => (ref.current = null))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.bridgeNote(SHORT_LEN)}</p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.bridgeAria} className="block mx-auto" />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.share}>
          <span className="text-orange-700">{bridge.nRecent ? fmtPct(shortShare(bridge), locale) : '–'}</span>
          <span className="block text-xs text-slate-500">{t.shareKey(WINDOW)}</span>
        </Stat>
        <Stat label={t.pherS}>{fmtFixed(bridge.C[0], 1, locale)}</Stat>
        <Stat label={t.pherL}>{fmtFixed(bridge.C[1], 1, locale)}</Stat>
        <Stat label={t.time}>
          {fmtInt(bridge.t, locale)}
          <span className="block text-xs text-slate-500">
            {t.ants}: {fmtInt(bridge.ants.length, locale)}
          </span>
        </Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.shareChart}</PanelTitle>
          <HistoryChart
            data={histData}
            series={[{ key: 'share', name: t.share, color: ORANGE }]}
            aria={t.shareAria}
            locale={locale}
            xLabel={t.stepLabel}
            yDomain={[0, 1]}
            yTicks={[0, 0.25, 0.5, 0.75, 1]}
            fmt={(v) => fmtPct(v, locale)}
          />
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.pherChart}</PanelTitle>
          <HistoryChart
            data={histData}
            series={[
              { key: 's', name: t.shortName, color: ORANGE },
              { key: 'l', name: t.longName, color: SLATE },
            ]}
            aria={t.pherAria}
            locale={locale}
            xLabel={t.stepLabel}
            yDomain={[0, Math.ceil(pherMax)]}
            fmt={(v) => fmtFixed(v, 0, locale)}
          />
          <Legend>
            <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.shortName}</LegendItem>
            <LegendItem swatch={<LineSwatch color={SLATE} />}>{t.longName}</LegendItem>
          </Legend>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <PanelTitle>{t.batch}</PanelTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
          <Slider label={t.batchRuns} min={1} max={50} step={1} value={batchR} onChange={setBatchR} />
          <div className="flex flex-wrap gap-2">
            <SimControls onReset={() => batch.run(makeBatchJob(ratio, openAt, params, batchR, seed))} labels={{ reset: t.batchRun }} />
            {batch.running && <SimControls onReset={batch.cancel} labels={{ reset: t.cancel }} />}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.batchNote(fmtInt(BRIDGE_RUN, locale))}</p>
        {batch.running && (
          <>
            <ProgressBar progress={batch.progress} />
            <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
              {t.batchProgress(batch.progress)}
            </p>
          </>
        )}
        {batch.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled}</p>}
        {runs.length > 0 && (
          <p className="mt-3 font-mono text-sm text-slate-900" aria-live="polite">
            <span className="text-orange-700">{t.batchResult(wins, runs.length, fmtPct(wins / runs.length, locale))}</span>
            <span className="block text-xs text-slate-500">{t.batchMean(fmtPct(meanShare, locale))}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function CollectiveBehavior({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <FlockPanel t={t} locale={locale} />
      <VicsekPanel t={t} locale={locale} />
      <BridgePanel t={t} locale={locale} />
    </div>
  )
}
