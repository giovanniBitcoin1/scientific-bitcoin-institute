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
import { ccdfSorted, paretoMLE } from '../distributions.js'
import {
  MEAN_HEIGHT,
  createSandpile,
  addGrain,
  beginAvalanche,
  isRelaxing,
  wave,
  relax,
  dropGrain,
  randomSite,
  centreSite,
  meanHeight,
  activitySeries,
} from '../sandpile.js'
import {
  welchPSD,
  logBinSpectrum,
  logLogSlope,
  whiteNoise,
  pinkNoise,
  brownNoise,
  standardise,
} from '../noise.js'
import { TREE, createForest, forestStep } from '../forestfire.js'

// Self-organized criticality, in three panels: the Bak–Tang–Wiesenfeld
// sandpile with its mean height and avalanche statistics; white, pink and
// brown noise (and the sandpile's own activity) with their power spectra; and
// the Drossel–Schwabl forest-fire model.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

const MAX_CANVAS = 560 // css px

// Sandpile heights 0–3, light to dark; toppled sites flash orange.
const HEIGHT_RGB = [
  [241, 245, 249], // slate-100
  [191, 205, 219],
  [100, 116, 139], // slate-500
  [30, 41, 59], // slate-800
]
const FLASH_RGB = [247, 147, 26]
const ACTIVE_RGB = [194, 65, 12] // orange-700: unstable now

// Forest: empty, tree, burning.
const FOREST_RGB = { empty: [248, 250, 252], tree: [71, 94, 84], fire: [247, 147, 26] }

const LIVE_CAP = 200000 // most recent avalanches kept for the live CCDF
const COLLECT = 200000 // avalanches recorded by "Collect statistics"
const HIST_MAX = 600 // points in the mean-height and density charts

// Noise: samples, Welch segment, fit range in cycles per sample.
const NOISE_N = 65536
const NOISE_SEG = 1024
const FIT_LO = 1 / 512
const FIT_HI = 0.1
const SHOWN = 1000
const PILE_L = 64 // continuously driven sandpile
const PILE_RATE = 0.05 // grains per time step
const EXPECTED = { white: 0, pink: -1, brown: -2 }
const SOURCES = ['white', 'pink', 'brown', 'sandpile']

const T = {
  en: {
    sandpile: 'The sandpile',
    gridL: 'Grid side L',
    start: 'Start',
    starts: { empty: 'Empty', random: 'Random', overloaded: 'Overloaded' },
    drop: 'Drop grains',
    drops: { random: 'At random', centre: 'At the centre' },
    mode: 'Mode',
    modes: { grain: 'One grain', run: 'Run' },
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    waveSpeed: 'Waves per second',
    runSpeed: 'Grains per frame',
    grainNote:
      'One grain is dropped at a time and its avalanche is shown wave by wave: in each wave every unstable site (dark orange) topples once. Sites that have toppled are orange. Step advances one wave, or drops the next grain.',
    runNote: 'Many grains per frame, each avalanche relaxed at once. Orange marks the sites that toppled in the last avalanche.',
    pileAria: (L) => `Sandpile on a ${L} × ${L} grid; darker sites hold more grains.`,
    legendH: (h) => `${h} grain${h === 1 ? '' : 's'}`,
    legendToppled: 'toppled',
    legendUnstable: 'unstable',
    grains: 'Grains added',
    meanH: 'Mean height',
    lastAv: 'Last avalanche',
    lastFmt: (s, a, d) => `${s} · ${a} · ${d}`,
    lastKey: 'size · area · duration',
    largest: 'Largest so far',
    initial: 'initial collapse',
    heightTitle: 'Mean height against grains added',
    heightAria: 'Mean number of grains per site against the number of grains added, with the stationary value 2.125.',
    heightRef: 'stationary value 17/8 = 2.125 (infinite grid)',
    heightSeries: 'mean height',
    heightNote:
      'On a finite grid the plateau sits a little below 2.125, because sites near the open edge hold fewer grains; the gap shrinks roughly as 1/L.',
    ccdfTitle: 'Avalanche sizes: CCDF on log–log axes',
    ccdfAria: 'Fraction of avalanches with at least s topplings, against s, on logarithmic axes, with the fitted power law.',
    sourceLive: (n) => `${n} most recent avalanches with s ≥ 1 since the last reset (including the filling-up phase).`,
    sourceCollected: (n, L) => `${n} avalanches with s ≥ 1 collected in the stationary state, L = ${L}.`,
    sourceNone: 'No avalanches yet: press Play, or collect statistics.',
    series: 'avalanches',
    fitLine: (t) => `power law, τ̂ = ${t}`,
    sMinLine: 's_min',
    sMin: 's_min for the estimate',
    tauHat: 'τ̂ (MLE estimate)',
    tauN: (n) => `${n} avalanches with s ≥ s_min`,
    tauNote:
      'τ̂ = 1 + N / Σ ln(sᵢ / (s_min − ½)) over the N avalanches with s ≥ s_min, the discrete approximation of Module 04. It assumes a pure power law above s_min, but on a finite grid the distribution ends in a bump and a cut-off set by L, which pulls τ̂ up as s_min grows. Values around 1.2–1.3 are reported for large grids, and the exact exponent is still debated.',
    collect: 'Collect statistics',
    cancel: 'Cancel',
    collectNote: (n) =>
      `Drops ${n} grains on the current grid, first filling it until it is stationary (3L² grains in all since the reset), and records the size of every avalanche.`,
    warming: (p) => `Reaching the stationary state … ${Math.round(p * 100)}%`,
    collecting: (p) => `Collecting avalanches … ${Math.round(p * 100)}%`,
    cancelled: 'Cancelled: the live record is shown.',

    noise: 'White, pink and brown noise',
    source: 'Source',
    sources: { white: 'White', pink: 'Pink', brown: 'Brown', sandpile: 'Sandpile activity' },
    newSample: 'New sample',
    listen: 'Listen',
    stop: 'Stop',
    noAudio: 'Sound is not available in this browser.',
    listenNote: 'Plays two seconds of the selected noise at a moderate volume.',
    sandpileNote: `Topplings per time step of a ${PILE_L} × ${PILE_L} sandpile driven continuously: at each step a grain lands at a random site with probability ${PILE_RATE} and one wave of topplings runs, so avalanches can overlap. With these settings β̂ comes out near −1.8, close to 1/f² rather than 1/f; faster driving, or summing the signal over longer time bins, makes the slope shallower (around −1.4), so the exponent depends on how the pile is driven and observed. There is nothing to listen to here.`,
    seriesTitle: (n) => `Signal: the first ${n} samples`,
    seriesAria: 'The first thousand values of the selected signal against time.',
    psdTitle: 'Power spectral density on log–log axes',
    psdAria: 'Power spectral density of the signal against frequency on logarithmic axes, with the fitted slope.',
    psdSeries: 'spectrum (log-binned)',
    psdFit: (b) => `fit, slope β̂ = ${b}`,
    betaHat: 'Fitted slope β̂',
    betaExpected: 'Expected',
    open: 'open question',
    psdNote: (n, seg) =>
      `Welch estimate: ${n.toLocaleString('en-US')} samples cut into segments of ${seg} that overlap by half, each tapered with a Hann window; their spectra are averaged and then binned in log f. The slope is a least-squares fit for f between 1/512 and 0.1 cycles per sample.`,

    forest: 'Forest fires',
    forestL: 'Torus side L',
    growth: 'Growth probability p',
    ratio: 'Ratio p/f',
    stepsPerFrame: 'Steps per frame',
    forestNote:
      'At every step each empty site grows a tree with probability p and each tree is struck by lightning with probability f. A struck tree burns at once together with its whole cluster of connected trees (shown orange for one frame). The grid wraps around: it is a torus.',
    forestAria: (L) => `Forest on a ${L} × ${L} torus: trees dark, empty sites light, fires orange.`,
    legendEmpty: 'empty',
    legendTree: 'tree',
    legendFire: 'burning',
    time: 'Time step',
    density: 'Tree density',
    fires: 'Fires recorded',
    largestFire: 'Largest fire',
    ccdfSlope: (a, b) => `CCDF slope, s = ${a}–${b}`,
    densityTitle: 'Tree density against time',
    densityAria: 'Fraction of sites holding a tree against time.',
    densitySeries: 'tree density',
    fireTitle: 'Fire sizes: CCDF on log–log axes',
    fireAria: 'Fraction of fires burning at least s trees, against s, on logarithmic axes.',
    fireSeries: 'fires',
    fireRecord: (n, t0) =>
      `${n} fires since step ${t0}. Fires are recorded from 10/p steps after a reset or a change of p or p/f, to skip the transient.`,
    fireWaiting: (t0) => `Fires will be recorded from step ${t0}.`,
  },
  it: {
    sandpile: 'Il mucchio di sabbia',
    gridL: 'Lato della griglia L',
    start: 'Partenza',
    starts: { empty: 'Vuota', random: 'Casuale', overloaded: 'Sovraccarica' },
    drop: 'Granelli',
    drops: { random: 'A caso', centre: 'Al centro' },
    mode: 'Modalità',
    modes: { grain: 'Un granello', run: 'Continua' },
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    waveSpeed: 'Onde al secondo',
    runSpeed: 'Granelli per fotogramma',
    grainNote:
      "Cade un granello alla volta e la sua valanga è mostrata onda dopo onda: in ogni onda ogni sito instabile (arancione scuro) crolla una volta. I siti già crollati sono arancioni. Passo avanza di un'onda, o fa cadere il granello successivo.",
    runNote: "Molti granelli per fotogramma, ogni valanga risolta all'istante. L'arancione indica i siti crollati nell'ultima valanga.",
    pileAria: (L) => `Mucchio di sabbia su una griglia ${L} × ${L}; i siti più scuri contengono più granelli.`,
    legendH: (h) => `${h} granell${h === 1 ? 'o' : 'i'}`,
    legendToppled: 'crollato',
    legendUnstable: 'instabile',
    grains: 'Granelli aggiunti',
    meanH: 'Altezza media',
    lastAv: 'Ultima valanga',
    lastFmt: (s, a, d) => `${s} · ${a} · ${d}`,
    lastKey: 'dimensione · area · durata',
    largest: 'La più grande finora',
    initial: 'crollo iniziale',
    heightTitle: 'Altezza media contro granelli aggiunti',
    heightAria: 'Numero medio di granelli per sito contro il numero di granelli aggiunti, con il valore stazionario 2,125.',
    heightRef: 'valore stazionario 17/8 = 2,125 (griglia infinita)',
    heightSeries: 'altezza media',
    heightNote:
      'Su una griglia finita il plateau resta un poco sotto 2,125, perché i siti vicini al bordo aperto contengono meno granelli; la differenza si riduce all\'incirca come 1/L.',
    ccdfTitle: 'Dimensioni delle valanghe: CCDF su assi log–log',
    ccdfAria: 'Frazione delle valanghe con almeno s crolli, contro s, su assi logaritmici, con la legge di potenza stimata.',
    sourceLive: (n) => `Le ${n} valanghe più recenti con s ≥ 1 dall'ultimo azzeramento (fase di riempimento compresa).`,
    sourceCollected: (n, L) => `${n} valanghe con s ≥ 1 raccolte nello stato stazionario, L = ${L}.`,
    sourceNone: 'Ancora nessuna valanga: premi Avvia, o raccogli le statistiche.',
    series: 'valanghe',
    fitLine: (t) => `legge di potenza, τ̂ = ${t}`,
    sMinLine: 's_min',
    sMin: 's_min per la stima',
    tauHat: 'τ̂ (stima di massima verosimiglianza)',
    tauN: (n) => `${n} valanghe con s ≥ s_min`,
    tauNote:
      "τ̂ = 1 + N / Σ ln(sᵢ / (s_min − ½)) sulle N valanghe con s ≥ s_min, l'approssimazione discreta del Modulo 04. Presuppone una legge di potenza pura sopra s_min, ma su una griglia finita la distribuzione finisce con una gobba e un taglio fissati da L, che spingono τ̂ verso l'alto al crescere di s_min. Per griglie grandi si riportano valori attorno a 1,2–1,3, e l'esponente esatto è ancora discusso.",
    collect: 'Raccogli statistiche',
    cancel: 'Annulla',
    collectNote: (n) =>
      `Fa cadere ${n} granelli sulla griglia attuale, dopo averla riempita fino allo stato stazionario (3L² granelli in tutto dall'azzeramento), e registra la dimensione di ogni valanga.`,
    warming: (p) => `Verso lo stato stazionario … ${Math.round(p * 100)}%`,
    collecting: (p) => `Raccolta delle valanghe … ${Math.round(p * 100)}%`,
    cancelled: 'Annullato: è mostrata la registrazione continua.',

    noise: 'Rumore bianco, rosa e marrone',
    source: 'Sorgente',
    sources: { white: 'Bianco', pink: 'Rosa', brown: 'Marrone', sandpile: 'Attività del mucchio' },
    newSample: 'Nuovo campione',
    listen: 'Ascolta',
    stop: 'Ferma',
    noAudio: 'Il suono non è disponibile in questo browser.',
    listenNote: 'Riproduce due secondi del rumore scelto a volume moderato.',
    sandpileNote: `Crolli per passo di tempo di un mucchio ${PILE_L} × ${PILE_L} forzato in continuo: a ogni passo un granello cade su un sito a caso con probabilità ${String(PILE_RATE).replace('.', ',')} e si svolge un'onda di crolli, così le valanghe possono sovrapporsi. Con queste impostazioni β̂ risulta vicino a −1,8, più vicino a 1/f² che a 1/f; una forzatura più rapida, o sommare il segnale su intervalli di tempo più lunghi, rende la pendenza meno ripida (attorno a −1,4): l'esponente dipende da come il mucchio è forzato e osservato. Qui non c'è nulla da ascoltare.`,
    seriesTitle: (n) => `Segnale: i primi ${n} campioni`,
    seriesAria: 'I primi mille valori del segnale scelto in funzione del tempo.',
    psdTitle: 'Densità spettrale di potenza su assi log–log',
    psdAria: 'Densità spettrale di potenza del segnale contro la frequenza su assi logaritmici, con la pendenza stimata.',
    psdSeries: 'spettro (binning logaritmico)',
    psdFit: (b) => `fit, pendenza β̂ = ${b}`,
    betaHat: 'Pendenza stimata β̂',
    betaExpected: 'Attesa',
    open: 'questione aperta',
    psdNote: (n, seg) =>
      `Stima di Welch: ${n.toLocaleString('it-IT')} campioni divisi in segmenti di ${seg} sovrapposti per metà, ciascuno smussato con una finestra di Hann; i loro spettri sono mediati e poi raggruppati in classi di log f. La pendenza è un fit ai minimi quadrati per f tra 1/512 e 0,1 cicli per campione.`,

    forest: 'Incendi boschivi',
    forestL: 'Lato del toro L',
    growth: 'Probabilità di crescita p',
    ratio: 'Rapporto p/f',
    stepsPerFrame: 'Passi per fotogramma',
    forestNote:
      "A ogni passo ogni sito vuoto fa crescere un albero con probabilità p e ogni albero è colpito da un fulmine con probabilità f. Un albero colpito brucia subito insieme all'intero cluster di alberi connessi (mostrato in arancione per un fotogramma). La griglia si richiude su sé stessa: è un toro.",
    forestAria: (L) => `Foresta su un toro ${L} × ${L}: alberi scuri, siti vuoti chiari, incendi arancioni.`,
    legendEmpty: 'vuoto',
    legendTree: 'albero',
    legendFire: 'in fiamme',
    time: 'Passo di tempo',
    density: 'Densità degli alberi',
    fires: 'Incendi registrati',
    largestFire: "L'incendio più grande",
    ccdfSlope: (a, b) => `Pendenza della CCDF, s = ${a}–${b}`,
    densityTitle: 'Densità degli alberi nel tempo',
    densityAria: 'Frazione dei siti occupati da un albero in funzione del tempo.',
    densitySeries: 'densità degli alberi',
    fireTitle: 'Dimensioni degli incendi: CCDF su assi log–log',
    fireAria: 'Frazione degli incendi che bruciano almeno s alberi, contro s, su assi logaritmici.',
    fireSeries: 'incendi',
    fireRecord: (n, t0) =>
      `${n} incendi dal passo ${t0}. Gli incendi sono registrati da 10/p passi dopo un azzeramento o un cambio di p o di p/f, per saltare il transitorio.`,
    fireWaiting: (t0) => `Gli incendi saranno registrati dal passo ${t0}.`,
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)

function fmtSigned(v, d, locale) {
  if (!Number.isFinite(v)) return '–'
  return `${v < 0 ? '−' : v > 0 ? '+' : ''}${fmtFixed(Math.abs(v), d, locale)}`
}

const fmtCompact = (v, locale) => v.toLocaleString(locale, { notation: 'compact', maximumFractionDigits: 1 })

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

// An offscreen n × n bitmap, reused while n stays the same.
function useBitmap() {
  const ref = useRef(null)
  return (n) => {
    if (!ref.current || ref.current.n !== n) {
      const canvas = document.createElement('canvas')
      canvas.width = n
      canvas.height = n
      const ctx = canvas.getContext('2d')
      ref.current = { n, canvas, ctx, img: ctx.createImageData(n, n) }
    }
    return ref.current
  }
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

const rgbCss = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`

// A time series sampled at most HIST_MAX times: every `every` steps, with
// every other point dropped and the interval doubled when it fills up.
function createHistory(every) {
  return { every, x: [], y: [] }
}

function record(hist, x, y) {
  if (x % hist.every !== 0) return
  hist.x.push(x)
  hist.y.push(y)
  if (hist.x.length > HIST_MAX) {
    hist.every *= 2
    const x = []
    const y = []
    for (let k = 0; k < hist.x.length; k++) {
      if (hist.x[k] % hist.every === 0) {
        x.push(hist.x[k])
        y.push(hist.y[k])
      }
    }
    hist.x = x
    hist.y = y
  }
}

// Points for a CCDF chart, the y-axis domain, and the x-axis domain.
function ccdfChart(sorted) {
  if (!sorted.length) return { points: [], x: decades(1, 10), y: decades(0.1, 1) }
  const points = ccdfSorted(sorted, 160).map((d) => ({ x: d.x, y: d.p }))
  return { points, x: decades(1, sorted[sorted.length - 1]), y: decades(1 / sorted.length, 1) }
}

// A log–log CCDF chart shared by the sandpile and the forest panels.
const CcdfChart = memo(function CcdfChart({ chart, fit, sMin, aria, xName }) {
  return (
    <div className="mt-3 h-64 -ml-4" role="img" aria-label={aria}>
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
          {sMin != null && <ReferenceLine x={sMin} stroke={ORANGE} strokeDasharray="4 4" />}
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(v, name) => (name === 'x' ? [Math.round(v), xName] : [v.toPrecision(3), `P(S ≥ ${xName})`])}
            separator=" "
            contentStyle={tooltipStyle}
          />
          <Scatter data={chart.points} fill={ORANGE} shape="circle" isAnimationActive={false} />
          {fit && (
            <Scatter
              data={fit}
              line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }}
              shape={NoDot}
              isAnimationActive={false}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
})

// A line chart of a recorded history, with an optional reference value.
const HistoryChart = memo(function HistoryChart({ data, refY, aria, yDomain, yTicks, locale, xLabel, yLabel, digits }) {
  const xMax = Math.max(1, data.length ? data[data.length - 1].x : 1)
  return (
    <div className="mt-3 h-56 -ml-4" role="img" aria-label={aria}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, xMax]}
            tickFormatter={(v) => fmtCompact(v, locale)}
            tick={axisTick}
            stroke={MUTED}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={(v) => fmtFixed(v, 1, locale)}
            width={44}
            tick={axisTick}
            stroke={MUTED}
          />
          {refY != null && <ReferenceLine y={refY} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />}
          <Tooltip
            formatter={(v) => [fmtFixed(v, digits, locale), yLabel]}
            labelFormatter={(v) => `${xLabel} ${fmtInt(v, locale)}`}
            contentStyle={tooltipStyle}
          />
          <Line type="linear" dataKey="y" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

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

// ---------------------------------------------------------------- Panel A

function newPile(L, start, seed) {
  const random = mulberry32(seed)
  const st = createSandpile(L, start, random)
  beginAvalanche(st)
  const pile = {
    L,
    st,
    random,
    hist: createHistory(Math.max(1, Math.round((L * L) / 100))),
    head: [{ x: 0, y: meanHeight(st) }], // the starting point, never thinned
    live: new Int32Array(LIVE_CAP), // ring buffer of avalanche sizes ≥ 1
    nLive: 0,
    collected: null, // sizes from "Collect statistics"
    largest: 0,
    last: null, // { size, area, duration, initial }
    initial: isRelaxing(st), // an overloaded start collapses before any grain is added
    drop: -1,
    flash: new Int32Array(L * L), // avalanche stamp of the last toppling, in Run mode
    flashId: 0,
    hold: 0, // ms to keep a finished avalanche on screen in One-grain mode
  }
  return pile
}

// Records a finished avalanche.
function finish(pile) {
  const { st } = pile
  const av = { size: st.size, area: st.nSites, duration: st.duration, initial: pile.initial }
  // Run mode reports the last avalanche that toppled anything, matching the flash.
  if (av.size > 0 || pile.showEmpty) pile.last = av
  if (pile.initial) {
    pile.initial = false
    pile.head.push({ x: 0, y: meanHeight(st) })
  } else {
    if (av.size > 0) {
      pile.live[pile.nLive % LIVE_CAP] = av.size
      pile.nLive++
      if (av.size > pile.largest) pile.largest = av.size
    }
    record(pile.hist, st.grains, meanHeight(st))
  }
  return av
}

function startGrain(pile, dropMode) {
  const { st } = pile
  const i = dropMode === 'centre' ? centreSite(st) : randomSite(st, pile.random)
  pile.drop = i
  beginAvalanche(st)
  addGrain(st, i)
}

function makeCollectJob(pile, dropMode) {
  const { st, L } = pile
  const warm = 3 * L * L
  const sizes = new Int32Array(COLLECT)
  let n = 0
  const iter = (function* () {
    if (isRelaxing(st)) {
      relax(st)
      finish(pile)
    }
    const g0 = st.grains
    while (st.grains < warm) {
      startGrain(pile, dropMode)
      relax(st)
      finish(pile)
      if (st.grains % 64 === 0) yield { phase: 'warm', p: (st.grains - g0) / Math.max(1, warm - g0) }
    }
    for (let k = 0; k < COLLECT; k++) {
      startGrain(pile, dropMode)
      relax(st)
      const av = finish(pile)
      if (av.size > 0) sizes[n++] = av.size
      if (k % 16 === 0) yield { phase: 'collect', p: k / COLLECT }
    }
    pile.collected = sizes.slice(0, n).sort()
  })()
  let phase = 'warm'
  let progress = 0
  return {
    iter: {
      next() {
        const r = iter.next()
        if (r.value) {
          phase = r.value.phase
          progress = r.value.p
          return { done: r.done, value: progress }
        }
        return r
      },
    },
    snapshot: () => ({ phase, progress }),
  }
}

function SandpilePanel({ t, locale }) {
  const [L, setL] = useState(64)
  const [start, setStart] = useState('empty')
  const [dropMode, setDropMode] = useState('random')
  const [mode, setMode] = useState('run')
  const [playing, setPlaying] = useState(false)
  const [waveSpeed, setWaveSpeed] = useState(30)
  const [runSpeed, setRunSpeed] = useState(100)
  const [sMin, setSMin] = useState(10)
  const [seed, setSeed] = useState(1)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()
  const exp = useExperiment()

  const pileRef = useRef(null)
  if (!pileRef.current || pileRef.current.key !== `${L}-${start}-${seed}`) {
    pileRef.current = newPile(L, start, seed)
    pileRef.current.key = `${L}-${start}-${seed}`
  }
  const pile = pileRef.current
  pile.showEmpty = mode === 'grain'
  const { st } = pile

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const bitmap = useBitmap()
  const acc = useRef(0)

  const resetPile = (fn) => {
    setPlaying(false)
    if (exp.running) exp.cancel()
    fn()
    bump(true)
  }

  // One wave in One-grain mode, or the next grain when the pile is stable.
  const advance = () => {
    if (isRelaxing(st)) {
      wave(st)
      if (!isRelaxing(st)) {
        const av = finish(pile)
        if (av.size > 0) pile.hold = 350
      }
    } else {
      startGrain(pile, dropMode)
      if (!isRelaxing(st)) finish(pile)
    }
  }

  useAnimationLoop((dt) => {
    if (mode === 'grain') {
      if (pile.hold > 0) {
        pile.hold -= dt
      } else {
        acc.current += (Math.min(dt, 100) / 1000) * waveSpeed
        let k = Math.floor(acc.current)
        acc.current -= k
        while (k-- > 0) {
          advance()
          if (pile.hold > 0) break
        }
      }
    } else {
      const begin = performance.now()
      // Only the last avalanche that toppled anything is flashed.
      const mark = () => {
        if (!st.nSites) return
        const id = ++pile.flashId
        for (let k = 0; k < st.nSites; k++) pile.flash[st.sites[k]] = id
        pile.shownFlash = id
      }
      if (isRelaxing(st)) {
        relax(st)
        mark()
        finish(pile)
      }
      for (let g = 0; g < runSpeed && performance.now() - begin < 12; g++) {
        startGrain(pile, dropMode)
        relax(st)
        mark()
        finish(pile)
      }
    }
    setFrame((f) => f + 1)
    bump()
  }, playing && !exp.running)

  // Repaint when an animation stops, and as "Collect statistics" progresses.
  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])
  useEffect(() => {
    bump(!exp.running)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp.data, exp.running])

  // ---- drawing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const size = gridSize(L, avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, size.css, size.down)
    const bm = bitmap(L)
    const px = bm.img.data
    const { h, hit, avId } = st
    const flashRun = mode === 'run' && pile.shownFlash
    for (let i = 0; i < st.N; i++) {
      let c
      if (h[i] >= 4) c = ACTIVE_RGB
      else if (flashRun ? pile.flash[i] === pile.shownFlash : mode === 'grain' && hit[i] === avId) c = FLASH_RGB
      else c = HEIGHT_RGB[h[i]]
      const o = 4 * i
      px[o] = c[0]
      px[o + 1] = c[1]
      px[o + 2] = c[2]
      px[o + 3] = 255
    }
    bm.ctx.putImageData(bm.img, 0, 0)
    ctx.drawImage(bm.canvas, 0, 0, canvas.width, canvas.height)
    // Where the last grain landed, in One-grain mode.
    if (mode === 'grain' && pile.drop >= 0) {
      const cell = canvas.width / L
      const x = ((pile.drop % L) + 0.5) * cell
      const y = (((pile.drop / L) | 0) + 0.5) * cell
      const dpr = window.devicePixelRatio || 1
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.5 * dpr
      ctx.beginPath()
      ctx.arc(x, y, Math.max(4 * dpr, cell * 1.2), 0, 2 * Math.PI)
      ctx.stroke()
    }
  })

  // ---- charts

  const heightData = useMemo(
    () => [...pile.head, ...pile.hist.x.map((x, k) => ({ x, y: pile.hist.y[k] }))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pile, version],
  )
  const yMax = Math.max(2.5, ...pile.head.map((d) => d.y))
  const yTop = Math.ceil(yMax * 2) / 2

  const sorted = useMemo(() => {
    if (pile.collected) return pile.collected
    const n = Math.min(pile.nLive, LIVE_CAP)
    return pile.live.slice(0, n).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pile, version, exp.running])
  const ccdf = useMemo(() => ccdfChart(sorted), [sorted])
  const mle = useMemo(() => {
    const m = paretoMLE(sorted, sMin - 0.5)
    return { tau: 1 + m.alpha, error: m.error, N: m.N }
  }, [sorted, sMin])
  const fit = useMemo(() => {
    if (!Number.isFinite(mle.tau) || mle.N < 10) return null
    const p0 = mle.N / sorted.length
    const sMax = sorted[sorted.length - 1]
    return [sMin, Math.max(sMin * 10, sMax)].map((s) => ({ x: s, y: p0 * (s / sMin) ** -(mle.tau - 1) }))
  }, [mle, sorted, sMin])

  const sMaxSlider = Math.max(100, 10 ** Math.ceil(Math.log10(Math.max(10, sorted.length ? sorted[sorted.length - 1] / 10 : 10))))
  const last = pile.last
  const sourceText = pile.collected
    ? t.sourceCollected(fmtInt(sorted.length, locale), L)
    : sorted.length
      ? t.sourceLive(fmtInt(sorted.length, locale))
      : t.sourceNone
  const expState = exp.data

  return (
    <div className={panel}>
      <PanelTitle>A · {t.sandpile}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.gridL} min={20} max={200} step={2} value={L} onChange={(v) => resetPile(() => setL(v))} />
        <Slider
          label={mode === 'grain' ? t.waveSpeed : t.runSpeed}
          min={1}
          max={mode === 'grain' ? 240 : 5000}
          log
          value={mode === 'grain' ? waveSpeed : runSpeed}
          onChange={(v) => (mode === 'grain' ? setWaveSpeed(v) : setRunSpeed(Math.round(v)))}
          format={(v) => fmtInt(v, locale)}
        />
      </div>
      <div className="mt-4 space-y-3">
        <Chips label={t.start} options={['empty', 'random', 'overloaded']} value={start} names={t.starts} onChange={(v) => resetPile(() => setStart(v))} />
        <Chips label={t.drop} options={['random', 'centre']} value={dropMode} names={t.drops} onChange={setDropMode} />
        <Chips
          label={t.mode}
          options={['grain', 'run']}
          value={mode}
          names={t.modes}
          onChange={(v) => {
            acc.current = 0
            pile.hold = 0
            setMode(v)
          }}
        />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing && !exp.running}
          onPlayPause={() => {
            if (exp.running) exp.cancel()
            setPlaying((p) => !p)
          }}
          onStep={
            mode === 'grain'
              ? () => {
                  if (exp.running) return
                  pile.hold = 0
                  advance()
                  setFrame((f) => f + 1)
                  bump(true)
                }
              : undefined
          }
          onReset={() => resetPile(() => setSeed((s) => s + 1))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{mode === 'grain' ? t.grainNote : t.runNote}</p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.pileAria(L)} className="block mx-auto bg-white outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        {HEIGHT_RGB.map((c, h) => (
          <LegendItem key={h} swatch={<DotSwatch color={rgbCss(c)} square border={h === 0 ? '1px solid #cbd5e1' : undefined} />}>
            {t.legendH(h)}
          </LegendItem>
        ))}
        <LegendItem swatch={<DotSwatch color={ORANGE} square />}>{t.legendToppled}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(ACTIVE_RGB)} square />}>{t.legendUnstable}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.grains}>{fmtInt(st.grains, locale)}</Stat>
        <Stat label={t.meanH}>
          {fmtFixed(meanHeight(st), 3, locale)} <span className="text-slate-500 text-xs">/ {fmtFixed(MEAN_HEIGHT, 3, locale)}</span>
        </Stat>
        <Stat label={t.lastAv}>
          <span className="text-orange-700">
            {last ? t.lastFmt(fmtInt(last.size, locale), fmtInt(last.area, locale), fmtInt(last.duration, locale)) : '–'}
          </span>
          <span className="block text-xs text-slate-500">{last && last.initial ? t.initial : t.lastKey}</span>
        </Stat>
        <Stat label={t.largest}>{pile.largest ? fmtInt(pile.largest, locale) : '–'}</Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.heightTitle}</PanelTitle>
          <HistoryChart
            data={heightData}
            refY={MEAN_HEIGHT}
            aria={t.heightAria}
            yDomain={[0, yTop]}
            yTicks={Array.from({ length: Math.round(yTop * 2) + 1 }, (_, k) => k / 2).filter((v) => v === Math.round(v) || yTop <= 3)}
            locale={locale}
            xLabel={t.grains}
            yLabel={t.heightSeries}
            digits={3}
          />
          <Legend>
            <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.heightSeries}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.heightRef}</LegendItem>
          </Legend>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.heightNote}</p>
        </div>

        <div className="min-w-0">
          <PanelTitle>{t.ccdfTitle}</PanelTitle>
          <CcdfChart chart={ccdf} fit={fit} sMin={sMin} aria={t.ccdfAria} xName="s" />
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.series}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.fitLine(fmtFixed(mle.tau, 2, locale))}</LegendItem>
            <LegendItem swatch={<LineSwatch color={ORANGE} width={1.5} dashed />}>{t.sMinLine}</LegendItem>
          </Legend>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{sourceText}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Slider label={t.sMin} min={1} max={sMaxSlider} log value={sMin} onChange={(v) => setSMin(Math.max(1, Math.round(v)))} format={(v) => fmtInt(v, locale)} />
        <div className="font-mono text-sm">
          <Stat label={t.tauHat}>
            <span className="text-orange-700">{fmtFixed(mle.tau, 3, locale)}</span>
            <span className="text-slate-500"> ± {fmtFixed(mle.error, 3, locale)}</span>
            <span className="block text-xs text-slate-500">{t.tauN(fmtInt(mle.N, locale))}</span>
          </Stat>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.tauNote}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <SimControls
          onReset={() => {
            setPlaying(false)
            pile.collected = null
            pile.shownFlash = 0
            exp.run(makeCollectJob(pile, dropMode))
          }}
          labels={{ reset: t.collect }}
        />
        {exp.running && <SimControls onReset={exp.cancel} labels={{ reset: t.cancel }} />}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.collectNote(fmtInt(COLLECT, locale))}</p>
      {exp.running && expState && (
        <>
          <ProgressBar progress={expState.progress} />
          <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
            {expState.phase === 'warm' ? t.warming(expState.progress) : t.collecting(expState.progress)}
          </p>
        </>
      )}
      {exp.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled}</p>}
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function makeSignal(source, seed) {
  const random = mulberry32(seed)
  if (source === 'white') return whiteNoise(NOISE_N, random)
  if (source === 'pink') return pinkNoise(NOISE_N, random)
  if (source === 'brown') return brownNoise(NOISE_N, random)
  // A continuously driven sandpile, first brought to its stationary state.
  const st = createSandpile(PILE_L, 'empty')
  for (let g = 0; g < 3 * PILE_L * PILE_L; g++) dropGrain(st, randomSite(st, random))
  return activitySeries(st, random, PILE_RATE, NOISE_N)
}

function useNoisePlayer() {
  const ctxRef = useRef(null)
  const srcRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const supported = typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext)

  const stop = () => {
    const src = srcRef.current
    srcRef.current = null
    if (src) {
      try {
        src.stop()
      } catch {
        // already stopped
      }
    }
    setPlaying(false)
  }

  const play = (source, seed) => {
    stop()
    if (!supported) return
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    const n = Math.round(2 * ctx.sampleRate)
    const random = mulberry32(seed * 101 + 7)
    // Brown noise leaks back towards zero (corner near 15 Hz) so it does not drift out of range.
    const raw = source === 'white' ? whiteNoise(n, random) : source === 'pink' ? pinkNoise(n, random) : brownNoise(n, random, 0.998)
    const x = standardise(raw)
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    const fade = Math.round(0.03 * ctx.sampleRate)
    for (let i = 0; i < n; i++) {
      const env = Math.min(1, i / fade, (n - 1 - i) / fade)
      data[i] = Math.max(-1, Math.min(1, 0.15 * x[i])) * env
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = 0.6
    src.connect(gain).connect(ctx.destination)
    src.onended = () => {
      if (srcRef.current === src) {
        srcRef.current = null
        setPlaying(false)
      }
    }
    srcRef.current = src
    src.start()
    setPlaying(true)
  }

  useEffect(
    () => () => {
      try {
        srcRef.current?.stop()
      } catch {
        // already stopped
      }
      ctxRef.current?.close()
    },
    [],
  )
  return { playing, play, stop, supported }
}

function NoisePanel({ t, locale }) {
  const [source, setSource] = useState('pink')
  const [seed, setSeed] = useState(1)
  const player = useNoisePlayer()

  const result = useMemo(() => {
    const x = makeSignal(source, seed)
    const series = []
    for (let i = 0; i < SHOWN; i++) series.push({ x: i, y: x[i] })
    const w = welchPSD(x, NOISE_SEG)
    const binned = logBinSpectrum(w.f, w.p, 12)
    const fit = logLogSlope(binned, FIT_LO, FIT_HI)
    const fitLine = Number.isFinite(fit.slope)
      ? [FIT_LO, FIT_HI].map((f) => ({ x: f, y: Math.exp(fit.intercept) * f ** fit.slope }))
      : []
    const points = binned.map((d) => ({ x: d.f, y: d.p }))
    let lo = Infinity
    let hi = 0
    for (const d of points) {
      lo = Math.min(lo, d.y)
      hi = Math.max(hi, d.y)
    }
    return { series, points, fitLine, slope: fit.slope, y: decades(lo, hi), x: decades(1 / NOISE_SEG, 0.5) }
  }, [source, seed])

  const beta = fmtSigned(result.slope, 2, locale)
  const canListen = source !== 'sandpile'

  return (
    <div className={panel}>
      <PanelTitle>B · {t.noise}</PanelTitle>

      <div className="mt-4">
        <Chips
          label={t.source}
          options={SOURCES}
          value={source}
          names={t.sources}
          onChange={(v) => {
            player.stop()
            setSource(v)
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newSample }} />
        {canListen && player.supported && (
          <SimControls
            playing={player.playing}
            onPlayPause={() => (player.playing ? player.stop() : player.play(source, seed))}
            labels={{ play: t.listen, pause: t.stop }}
          />
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {canListen ? (player.supported ? t.listenNote : t.noAudio) : t.sandpileNote}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.seriesTitle(fmtInt(SHOWN, locale))}</PanelTitle>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.seriesAria}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.series} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" domain={[0, SHOWN]} ticks={[0, 250, 500, 750, 1000]} tick={axisTick} stroke={MUTED} />
                <YAxis domain={['auto', 'auto']} width={44} tick={axisTick} stroke={MUTED} tickFormatter={(v) => fmtCompact(v, locale)} />
                <Line type="linear" dataKey="y" stroke={SLATE} strokeWidth={1} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.psdTitle}</PanelTitle>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.psdAria}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  scale="log"
                  domain={result.x.domain}
                  ticks={result.x.ticks}
                  tickFormatter={powTick}
                  allowDataOverflow
                  tick={axisTick}
                  stroke={MUTED}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  scale="log"
                  domain={result.y.domain}
                  ticks={result.y.ticks}
                  tickFormatter={powTick}
                  allowDataOverflow
                  width={44}
                  tick={axisTick}
                  stroke={MUTED}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v, name) => (name === 'x' ? [v.toPrecision(3), 'f'] : [v.toPrecision(3), 'S(f)'])}
                  separator=" "
                  contentStyle={tooltipStyle}
                />
                <Scatter data={result.points} fill={ORANGE} shape="circle" isAnimationActive={false} />
                <Scatter
                  data={result.fitLine}
                  line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }}
                  shape={NoDot}
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.psdSeries}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.psdFit(beta)}</LegendItem>
          </Legend>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-sm">
        <Stat label={t.betaHat}>
          <span className="text-orange-700">{beta}</span>
        </Stat>
        <Stat label={t.betaExpected}>{source in EXPECTED ? fmtSigned(EXPECTED[source], 0, locale) : t.open}</Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.psdNote(NOISE_N, NOISE_SEG)}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

function newForest(L, seed) {
  return {
    L,
    st: createForest(L),
    random: mulberry32(seed),
    hist: createHistory(1),
    fires: [],
    largest: 0,
    from: 0, // fires are recorded from this step on
    flash: new Int32Array(L * L),
    flashId: 0,
  }
}

function ForestPanel({ t, locale }) {
  const [L, setL] = useState(200)
  const [p, setP] = useState(0.03)
  const [ratio, setRatio] = useState(1000)
  const [speed, setSpeed] = useState(5)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(1)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  const forestRef = useRef(null)
  if (!forestRef.current || forestRef.current.key !== `${L}-${seed}`) {
    forestRef.current = newForest(L, seed)
    forestRef.current.key = `${L}-${seed}`
    forestRef.current.from = Math.round(10 / p)
  }
  const forest = forestRef.current
  const { st } = forest

  // A change of p or p/f restarts the record of fires after a new transient.
  const changeParams = (fn) => {
    fn()
    forest.fires = []
    forest.largest = 0
    bump(true)
  }
  useEffect(() => {
    forest.from = st.t + Math.round(10 / p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, ratio])

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const bitmap = useBitmap()

  useAnimationLoop(() => {
    const f = p / ratio
    const begin = performance.now()
    const id = ++forest.flashId
    const onFire = (size) => {
      if (st.t >= forest.from) {
        forest.fires.push(size)
        if (size > forest.largest) forest.largest = size
      }
    }
    for (let k = 0; k < speed && performance.now() - begin < 14; k++) {
      const d = forestStep(st, forest.random, p, f, onFire)
      for (let j = 0; j < st.nBurning; j++) forest.flash[st.burning[j]] = id
      record(forest.hist, st.t, d)
    }
    forest.shown = id
    setFrame((x) => x + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const size = gridSize(L, avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, size.css, size.down)
    const bm = bitmap(L)
    const px = bm.img.data
    const { s } = st
    for (let i = 0; i < st.N; i++) {
      const c = s[i] === TREE ? FOREST_RGB.tree : forest.flash[i] === forest.shown && forest.shown ? FOREST_RGB.fire : FOREST_RGB.empty
      const o = 4 * i
      px[o] = c[0]
      px[o + 1] = c[1]
      px[o + 2] = c[2]
      px[o + 3] = 255
    }
    bm.ctx.putImageData(bm.img, 0, 0)
    ctx.drawImage(bm.canvas, 0, 0, canvas.width, canvas.height)
  })

  const densityData = useMemo(
    () => forest.hist.x.map((x, k) => ({ x, y: forest.hist.y[k] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forest, version],
  )
  const fireStats = useMemo(() => {
    const sorted = Int32Array.from(forest.fires).sort()
    const chart = ccdfChart(sorted)
    // Slope of the CCDF over its middle range: from 10 trees to a tenth of the largest fire.
    const hi = sorted.length ? sorted[sorted.length - 1] / 10 : 0
    const slope = hi >= 100 ? logLogSlope(chart.points, 10, hi, 'x', 'y').slope : NaN
    return { chart, slope, hi, n: sorted.length }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forest, version])

  return (
    <div className={panel}>
      <PanelTitle>C · {t.forest}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider
          label={t.forestL}
          min={100}
          max={300}
          step={10}
          value={L}
          onChange={(v) => {
            setPlaying(false)
            setL(v)
          }}
        />
        <Slider label={t.growth} min={0.005} max={0.1} step={0.005} value={p} onChange={(v) => changeParams(() => setP(v))} format={(v) => fmtFixed(v, 3, locale)} />
        <Slider label={t.ratio} min={10} max={10000} log value={ratio} onChange={(v) => changeParams(() => setRatio(v))} format={(v) => fmtInt(v, locale)} />
        <Slider label={t.stepsPerFrame} min={1} max={20} step={1} value={speed} onChange={setSpeed} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => setPlaying((x) => !x)}
          onReset={() => {
            setPlaying(false)
            setSeed((x) => x + 1)
            bump(true)
          }}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.forestNote}</p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.forestAria(L)} className="block mx-auto bg-white outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={rgbCss(FOREST_RGB.empty)} square border="1px solid #cbd5e1" />}>{t.legendEmpty}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(FOREST_RGB.tree)} square />}>{t.legendTree}</LegendItem>
        <LegendItem swatch={<DotSwatch color={ORANGE} square />}>{t.legendFire}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.time}>{fmtInt(st.t, locale)}</Stat>
        <Stat label={t.density}>{fmtFixed(st.trees / st.N, 3, locale)}</Stat>
        <Stat label={t.fires}>{fmtInt(fireStats.n, locale)}</Stat>
        <Stat label={t.largestFire}>{forest.largest ? fmtInt(forest.largest, locale) : '–'}</Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.densityTitle}</PanelTitle>
          <HistoryChart
            data={densityData}
            aria={t.densityAria}
            yDomain={[0, 0.6]}
            yTicks={[0, 0.2, 0.4, 0.6]}
            locale={locale}
            xLabel={t.time}
            yLabel={t.densitySeries}
            digits={3}
          />
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.fireTitle}</PanelTitle>
          <CcdfChart chart={fireStats.chart} aria={t.fireAria} xName="s" />
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {fireStats.n ? t.fireRecord(fmtInt(fireStats.n, locale), fmtInt(forest.from, locale)) : t.fireWaiting(fmtInt(forest.from, locale))}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
        <Stat label={t.ccdfSlope(10, Number.isFinite(fireStats.slope) ? fmtInt(fireStats.hi, locale) : '…')}>
          <span className="text-orange-700">{fmtSigned(fireStats.slope, 2, locale)}</span>
        </Stat>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function SelfOrganizedCriticality({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <SandpilePanel t={t} locale={locale} />
      <NoisePanel t={t} locale={locale} />
      <ForestPanel t={t} locale={locale} />
    </div>
  )
}
