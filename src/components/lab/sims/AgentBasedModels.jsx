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
import { EMPTY, GROUP_A, createCity, advance, sweep, isUnhappy, cityStats } from '../schelling.js'
import { createRoad, trafficStep, roadStats, roadRow, flowNoBraking } from '../traffic.js'

// Agent-based models, in four panels: Schelling's city; segregation against
// the tolerance threshold (an experiment); Nagel–Schreckenberg traffic on a
// ring, as a ring and as a space–time diagram; and the fundamental diagram of
// flow against density (an experiment).

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

const MAX_CANVAS = 560 // css px

// City: group A orange, group B slate, empty cells light; unhappy agents are
// drawn in a lighter shade of their colour, with a white dot on large cells.
const CITY_RGB = {
  empty: [248, 250, 252], // slate-50
  a: [247, 147, 26],
  b: [71, 85, 105], // slate-600
  aUnhappy: [252, 196, 128],
  bUnhappy: [148, 163, 184], // slate-400
}
const DOT_MIN_CELL = 6 // css px: smallest cell that gets a dot

const HIST_MAX = 600 // points in the history charts

// Experiment B: Schelling at increasing T.
const EXP_N = 50
const EXP_VACANCY = 0.1
const EXP_SHARE = 0.5
const EXP_CAP = 100 // sweeps that move somebody
const EXP_T = Array.from({ length: 17 }, (_, k) => Math.round(k * 5) / 100)

// Traffic.
const ST_ROWS = 240 // rows of the space–time diagram
const FLOW_WINDOW = 100 // steps over which the flow is averaged
const SUGIYAMA = { L: 66, cars: 22, vmax: 2, p: 0.2 }
const RULE184 = { density: 0.55 }

// Experiment D: the fundamental diagram.
const FD_L = 400
const FD_WARM = 500
const FD_STEPS = 500
const FD_P = [0, 0.1, 0.25]
const FD_RHO = Array.from({ length: 49 }, (_, k) => Math.round((k + 1) * 2) / 100)
const FD_COLOR = { 0: INK, 0.1: SLATE, 0.25: ORANGE }

const T = {
  en: {
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    cancel: 'Cancel',
    runAgain: 'Run again',
    cancelled: 'Cancelled: the runs finished so far are shown.',
    runs: 'Runs per value R',

    city: "Schelling's city",
    side: 'Grid side',
    vacancy: 'Empty cells',
    shareA: 'Share of group A',
    threshold: 'Threshold T (least share alike)',
    upper: 'Upper threshold',
    upperOpts: { off: 'Off', on: 'On' },
    upperU: 'U (most share alike)',
    rule: 'Unhappy agents move',
    rules: { random: 'To a random empty cell', nearest: 'To the nearest cell that suits them' },
    speed: 'Sweeps per second',
    cityNoteFn: (pct, k) =>
      `An agent is content if at least ${pct} of its occupied neighbours (the eight cells around it, wrapping around the edges) belong to its own group: with all eight occupied, that is ${k} or more alike. In each sweep the agents unhappy at its start move, in random order. Step runs one sweep.`,
    upperNote: (pct) => `With the upper threshold on, an agent is also unhappy if more than ${pct} of its neighbours are alike.`,
    cityAria: (n) => `Schelling's city on a ${n} × ${n} grid: group A orange, group B slate, empty cells light, unhappy agents in a lighter shade.`,
    legendA: 'group A',
    legendB: 'group B',
    legendEmpty: 'empty',
    legendUnhappy: 'unhappy (lighter, dotted)',
    segregation: 'Segregation index',
    randomStart: (v) => `random start ${v}`,
    unhappy: 'Unhappy',
    moves: 'Moves',
    sweeps: (n) => `in ${n} sweeps`,
    settled: 'Settled',
    settledOpts: { yes: 'yes', no: 'not yet', stuck: 'stuck' },
    stuckNote: 'unhappy agents with nowhere to go',
    segNote:
      'Segregation index: the mean share of same-group neighbours among each agent’s occupied neighbours. At a random start it is close to the chance of meeting your own group (0.5 for a 50/50 city).',
    segChart: 'Segregation index over sweeps',
    segAria: 'Segregation index against the number of sweeps, with the value at the random start.',
    unhappyChart: 'Share of unhappy agents over sweeps',
    unhappyAria: 'Share of unhappy agents against the number of sweeps.',
    sweepLabel: 'sweep',

    tolerance: 'Segregation vs tolerance',
    tolNote: (cap) =>
      `For each T from 0 to 0.8, R cities of 50 × 50 with 10% empty cells, two equal groups and random moves are run until they settle or until ${cap} sweeps have moved somebody. Each dot is one run. These settings are fixed and do not follow the sliders of Panel A.`,
    tolProgress: (p) => `Running cities … ${Math.round(p * 100)}%`,
    finalSeg: 'Final segregation index against T',
    finalAria: 'Final segregation index of each run against the threshold T, with the mean, and the value at a random start.',
    stepsChart: 'Sweeps to settle against T',
    stepsAria: 'Number of sweeps each run needed to settle against T; runs that did not settle are drawn at the cap.',
    settledRun: 'settled',
    notSettled: (cap) => `did not settle within ${cap} sweeps`,
    meanLine: 'mean',
    randomRef: 'random start (0.5)',
    capLabel: 'cap',
    tolReading:
      'Even with T near one third, an agent content to be in the minority, the city ends up far more segregated than the preferences ask for. Above T ≈ 0.65 settling slows sharply: the groups are already almost apart, and a city at rest needs their borders lined with empty cells, which random moves are slow to find.',

    traffic: 'Traffic on a ring',
    roadL: 'Road length (cells)',
    density: 'Density',
    densityFmt: (d, n) => `${d} · ${n} car${n === 1 ? '' : 's'}`,
    vmax: 'Top speed v_max',
    braking: 'Random braking p',
    stepsPerSec: 'Steps per second',
    start: 'Start',
    starts: { random: 'Random', even: 'Evenly spaced' },
    presets: 'Presets',
    sugiyama: 'Sugiyama 2008',
    rule184: 'Rule 184',
    trafficNote:
      'Cars drive anticlockwise on the ring and to the right in the diagram. At every step each car speeds up by 1 up to v_max, slows to the gap ahead, brakes by 1 more with probability p, then moves. A cell is the room one car takes in a dense jam (about 7.5 m) and a step is about a second.',
    sugiyamaNote:
      'Sugiyama 2008: 22 cars evenly spaced on a ring of 66 cells, starting at rest. The real track was 230 m, so here a cell is about 3.5 m, roughly one car length, and v_max = 2 is about 25 km/h at one step per second, close to the 30 km/h the drivers aimed for. The scale is a cartoon of the experiment, not a calibration: it puts the ring at the density where flow peaks without random braking. Set p = 0 and the flow stays perfect for ever.',
    rule184Note: 'Rule 184: v_max = 1 and no random braking. A car moves one cell if the cell ahead is empty, exactly the elementary automaton of Module 05.',
    ringAria: 'Cars on a circular road, coloured by speed; stopped cars are orange.',
    stAria: 'Space–time diagram: the road across, time running down; stopped cars orange.',
    ringTitle: 'The ring',
    stTitle: 'Space–time diagram (time runs down)',
    legendStopped: 'stopped',
    legendSlow: 'slow',
    legendFast: 'v_max',
    time: 'Time step',
    flow: 'Flow',
    flowKey: (n) => `cars / cell / step, last ${n} steps`,
    speedStat: 'Mean speed',
    speedKey: 'cells / step',
    stopped: 'Stopped',

    fundamental: 'The fundamental diagram',
    fdTitle: (v) => `Flow against density, v_max = ${v}`,
    fdAria: 'Mean flow against density for three values of the random braking p, with the line of the model without braking.',
    fdNote: (L, w, s) =>
      `For each density R roads of ${L} cells start from random positions, run ${w} steps to forget them, and the flow is averaged over the next ${s}. Follows the v_max of Panel C.`,
    fdProgress: (p) => `Driving … ${Math.round(p * 100)}%`,
    fdSeries: (p) => `p = ${p}`,
    fdTheory: 'p = 0 theory: min(ρ·v_max, 1 − ρ)',
    fdPeak: (p) => `Peak flow, p = ${p}`,
    fdPeakFmt: (j, r) => `${j} at ρ = ${r}`,
  },
  it: {
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    cancel: 'Annulla',
    runAgain: 'Ripeti',
    cancelled: 'Annullato: sono mostrate le prove completate finora.',
    runs: 'Prove per valore R',

    city: 'La città di Schelling',
    side: 'Lato della griglia',
    vacancy: 'Celle vuote',
    shareA: 'Quota del gruppo A',
    threshold: 'Soglia T (quota minima di simili)',
    upper: 'Soglia superiore',
    upperOpts: { off: 'No', on: 'Sì' },
    upperU: 'U (quota massima di simili)',
    rule: 'Gli agenti scontenti si spostano',
    rules: { random: 'In una cella vuota a caso', nearest: 'Nella cella più vicina che li soddisfa' },
    speed: 'Passate al secondo',
    cityNoteFn: (pct, k) =>
      `Un agente è contento se almeno il ${pct} dei vicini occupati (le otto celle attorno, che si richiudono ai bordi) appartiene al suo gruppo: con tutti e otto occupati, servono ${k} o più simili. In ogni passata si spostano, in ordine casuale, gli agenti scontenti all'inizio. Passo esegue una passata.`,
    upperNote: (pct) => `Con la soglia superiore attiva, un agente è scontento anche se più del ${pct} dei vicini gli è simile.`,
    cityAria: (n) => `La città di Schelling su una griglia ${n} × ${n}: gruppo A arancione, gruppo B ardesia, celle vuote chiare, agenti scontenti in una tinta più chiara.`,
    legendA: 'gruppo A',
    legendB: 'gruppo B',
    legendEmpty: 'vuota',
    legendUnhappy: 'scontento (più chiaro, con punto)',
    segregation: 'Indice di segregazione',
    randomStart: (v) => `partenza casuale ${v}`,
    unhappy: 'Scontenti',
    moves: 'Spostamenti',
    sweeps: (n) => `in ${n} passate`,
    settled: 'Stabile',
    settledOpts: { yes: 'sì', no: 'non ancora', stuck: 'bloccata' },
    stuckNote: 'agenti scontenti senza un posto dove andare',
    segNote:
      "Indice di segregazione: la quota media di vicini dello stesso gruppo tra i vicini occupati di ogni agente. Alla partenza casuale è vicino alla probabilità di incontrare il proprio gruppo (0,5 in una città divisa a metà).",
    segChart: 'Indice di segregazione nelle passate',
    segAria: "Indice di segregazione contro il numero di passate, con il valore alla partenza casuale.",
    unhappyChart: 'Quota di agenti scontenti nelle passate',
    unhappyAria: 'Quota di agenti scontenti contro il numero di passate.',
    sweepLabel: 'passata',

    tolerance: 'Segregazione e tolleranza',
    tolNote: (cap) =>
      `Per ogni T da 0 a 0,8, R città di 50 × 50 con il 10% di celle vuote, due gruppi uguali e spostamenti casuali evolvono finché si stabilizzano o finché ${cap} passate hanno spostato qualcuno. Ogni punto è una prova. Queste impostazioni sono fisse e non seguono i cursori del pannello A.`,
    tolProgress: (p) => `Città in corso … ${Math.round(p * 100)}%`,
    finalSeg: 'Indice di segregazione finale contro T',
    finalAria: 'Indice di segregazione finale di ogni prova contro la soglia T, con la media e il valore alla partenza casuale.',
    stepsChart: 'Passate per stabilizzarsi contro T',
    stepsAria: 'Numero di passate che ogni prova ha richiesto per stabilizzarsi contro T; le prove non stabilizzate sono disegnate al limite.',
    settledRun: 'stabilizzata',
    notSettled: (cap) => `non stabilizzata entro ${cap} passate`,
    meanLine: 'media',
    randomRef: 'partenza casuale (0,5)',
    capLabel: 'limite',
    tolReading:
      "Anche con T vicino a un terzo, un agente che accetta di essere in minoranza, la città finisce molto più segregata di quanto le preferenze chiedano. Sopra T ≈ 0,65 la stabilizzazione rallenta bruscamente: i gruppi sono già quasi separati, e una città in quiete ha bisogno di confini fiancheggiati da celle vuote, che gli spostamenti casuali trovano a fatica.",

    traffic: 'Traffico su un anello',
    roadL: 'Lunghezza della strada (celle)',
    density: 'Densità',
    densityFmt: (d, n) => `${d} · ${n} auto`,
    vmax: 'Velocità massima v_max',
    braking: 'Frenata casuale p',
    stepsPerSec: 'Passi al secondo',
    start: 'Partenza',
    starts: { random: 'Casuale', even: 'Equidistanti' },
    presets: 'Preimpostazioni',
    sugiyama: 'Sugiyama 2008',
    rule184: 'Regola 184',
    trafficNote:
      "Le auto girano in senso antiorario sull'anello e verso destra nel diagramma. A ogni passo ogni auto accelera di 1 fino a v_max, rallenta fino allo spazio libero davanti, frena di 1 in più con probabilità p, poi avanza. Una cella è lo spazio che un'auto occupa in una coda compatta (circa 7,5 m) e un passo è circa un secondo.",
    sugiyamaNote:
      "Sugiyama 2008: 22 auto equidistanti su un anello di 66 celle, ferme alla partenza. La pista vera era di 230 m, quindi qui una cella è circa 3,5 m, più o meno la lunghezza di un'auto, e v_max = 2 è circa 25 km/h con un passo al secondo, vicino ai 30 km/h a cui puntavano i guidatori. La scala è una caricatura dell'esperimento, non una calibrazione: mette l'anello alla densità in cui il flusso è massimo senza frenate casuali. Metti p = 0 e il flusso resta perfetto per sempre.",
    rule184Note: "Regola 184: v_max = 1 e nessuna frenata casuale. Un'auto avanza di una cella se la cella davanti è vuota: esattamente l'automa elementare del Modulo 05.",
    ringAria: "Auto su una strada circolare, colorate secondo la velocità; le auto ferme sono arancioni.",
    stAria: 'Diagramma spazio–tempo: la strada in orizzontale, il tempo che scorre verso il basso; auto ferme in arancione.',
    ringTitle: "L'anello",
    stTitle: 'Diagramma spazio–tempo (il tempo scorre in basso)',
    legendStopped: 'ferma',
    legendSlow: 'lenta',
    legendFast: 'v_max',
    time: 'Passo di tempo',
    flow: 'Flusso',
    flowKey: (n) => `auto / cella / passo, ultimi ${n} passi`,
    speedStat: 'Velocità media',
    speedKey: 'celle / passo',
    stopped: 'Ferme',

    fundamental: 'Il diagramma fondamentale',
    fdTitle: (v) => `Flusso contro densità, v_max = ${v}`,
    fdAria: 'Flusso medio contro densità per tre valori della frenata casuale p, con la retta del modello senza frenate.',
    fdNote: (L, w, s) =>
      `Per ogni densità R strade di ${L} celle partono da posizioni casuali, corrono ${w} passi per dimenticarle, e il flusso è mediato sui ${s} successivi. Segue la v_max del pannello C.`,
    fdProgress: (p) => `Guida in corso … ${Math.round(p * 100)}%`,
    fdSeries: (p) => `p = ${p}`,
    fdTheory: 'teoria per p = 0: min(ρ·v_max, 1 − ρ)',
    fdPeak: (p) => `Flusso massimo, p = ${p}`,
    fdPeakFmt: (j, r) => `${j} a ρ = ${r}`,
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)
const fmtPct = (v, locale, d = 0) => `${fmtFixed(v * 100, d, locale)}%`
const fmtNum = (v, locale) => v.toLocaleString(locale, { maximumFractionDigits: 2 })

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
// its context; `smooth` is for pictures drawn smaller than their pixel grid.
function prepareCanvas(canvas, cssW, cssH, smooth = false) {
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

// An offscreen w × h bitmap, reused while its size stays the same.
function useBitmap() {
  const ref = useRef(null)
  return (w, h = w) => {
    if (!ref.current || ref.current.w !== w || ref.current.h !== h) {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ref.current = { w, h, canvas, ctx, img: ctx.createImageData(w, h) }
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

function DotSwatch({ color, size = 8, square = false, border, dot = false }) {
  return (
    <span
      className={`relative inline-block shrink-0 ${square ? 'rounded-sm' : 'rounded-full'}`}
      style={{ width: size, height: size, background: color, border }}
      aria-hidden="true"
    >
      {dot && <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white" />}
    </span>
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

// A Scatter drawn only as a line, for means and reference curves.
const NoDot = () => null
// A hollow circle, for runs that did not settle.
const HollowDot = ({ cx, cy }) =>
  cx == null || cy == null ? null : <circle cx={cx} cy={cy} r={3.5} fill="#fff" stroke={SLATE} strokeWidth={1.5} />

const rgbCss = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`

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

// A small line chart of a history in [0, 1], with an optional reference value.
const MiniChart = memo(function MiniChart({ data, refY, aria, locale, xLabel, yLabel, percent }) {
  const xMax = Math.max(1, data.length ? data[data.length - 1].x : 1)
  const fmt = (v) => (percent ? fmtPct(v, locale) : fmtFixed(v, 2, locale))
  return (
    <div className="mt-3 h-44 -ml-4" role="img" aria-label={aria}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[0, xMax]} allowDecimals={false} tick={axisTick} stroke={MUTED} />
          <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={fmt} width={44} tick={axisTick} stroke={MUTED} />
          {refY != null && <ReferenceLine y={refY} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />}
          <Tooltip
            formatter={(v) => [fmt(v), yLabel]}
            labelFormatter={(v) => `${xLabel} ${fmtInt(v, locale)}`}
            contentStyle={tooltipStyle}
          />
          <Line type="linear" dataKey="y" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// ---------------------------------------------------------------- Panel A

// A history of the segregation index and the share unhappy, one point per
// sweep, thinned by half whenever it reaches HIST_MAX points.
function createHistory() {
  return { every: 1, x: [], seg: [], unhappy: [] }
}

function record(hist, x, seg, unhappy) {
  if (x % hist.every !== 0) return
  hist.x.push(x)
  hist.seg.push(seg)
  hist.unhappy.push(unhappy)
  if (hist.x.length > HIST_MAX) {
    hist.every *= 2
    const keep = hist.x.map((v) => v % hist.every === 0)
    hist.x = hist.x.filter((_, k) => keep[k])
    hist.seg = hist.seg.filter((_, k) => keep[k])
    hist.unhappy = hist.unhappy.filter((_, k) => keep[k])
  }
}

function newCity(n, vacancy, shareA, seed, opt) {
  const random = mulberry32(seed)
  const city = createCity(n, vacancy, shareA, random)
  const s = cityStats(city, opt)
  const hist = createHistory()
  record(hist, 0, s.segregation, s.unhappy)
  return { city, random, initialSeg: s.segregation, hist }
}

function CityPanel({ t, locale }) {
  const [n, setN] = useState(60)
  const [vacancy, setVacancy] = useState(0.1)
  const [shareA, setShareA] = useState(0.5)
  const [lo, setLo] = useState(0.3)
  const [upperOn, setUpperOn] = useState('off')
  const [hi, setHi] = useState(0.8)
  const [rule, setRule] = useState('random')
  const [speed, setSpeed] = useState(4)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(1)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  const opt = useMemo(() => ({ lo, hi: upperOn === 'on' ? hi : null, rule }), [lo, hi, upperOn, rule])

  const key = `${n}-${vacancy}-${shareA}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newCity(n, vacancy, shareA, seed, opt)
    ref.current.key = key
  }
  const model = ref.current
  const { city } = model

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const bitmap = useBitmap()
  const acc = useRef(0)

  // A new rule takes effect from a fresh sweep, and may unsettle the city.
  const changeRule = (fn) => {
    fn()
    city.open = false
    city.settled = false
    bump(true)
  }
  const resetCity = (fn) => {
    setPlaying(false)
    fn()
    bump(true)
  }

  const finishSweep = () => {
    const s = cityStats(city, opt)
    record(model.hist, city.sweeps, s.segregation, s.unhappy)
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * speed
    const begin = performance.now()
    while (acc.current >= 1 && performance.now() - begin < 12) {
      if (advance(city, opt, model.random, 400)) {
        acc.current -= 1
        if (city.settled) {
          acc.current = 0
          setPlaying(false)
          break
        }
        finishSweep()
      }
    }
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const onStep = () => {
    sweep(city, opt, model.random)
    if (!city.settled) finishSweep()
    setFrame((f) => f + 1)
    bump(true)
  }

  // ---- drawing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const size = gridSize(n, avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, size.css, size.css, size.down)
    const bm = bitmap(n)
    const px = bm.img.data
    const { g, N } = city
    const unhappy = []
    for (let i = 0; i < N; i++) {
      let c
      if (g[i] === EMPTY) c = CITY_RGB.empty
      else {
        const sad = isUnhappy(city, i, opt)
        if (sad) unhappy.push(i)
        c = g[i] === GROUP_A ? (sad ? CITY_RGB.aUnhappy : CITY_RGB.a) : sad ? CITY_RGB.bUnhappy : CITY_RGB.b
      }
      const o = 4 * i
      px[o] = c[0]
      px[o + 1] = c[1]
      px[o + 2] = c[2]
      px[o + 3] = 255
    }
    bm.ctx.putImageData(bm.img, 0, 0)
    ctx.drawImage(bm.canvas, 0, 0, canvas.width, canvas.height)
    if (size.css / n >= DOT_MIN_CELL) {
      const cell = canvas.width / n
      ctx.fillStyle = '#fff'
      for (const i of unhappy) {
        ctx.beginPath()
        ctx.arc(((i % n) + 0.5) * cell, (((i / n) | 0) + 0.5) * cell, cell * 0.16, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  })

  // ---- numbers and charts

  const stats = cityStats(city, opt)
  const status = city.settled ? (stats.unhappy > 0 ? 'stuck' : 'yes') : 'no'
  const segData = useMemo(
    () => model.hist.x.map((x, k) => ({ x, y: model.hist.seg[k] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const unhappyData = useMemo(
    () => model.hist.x.map((x, k) => ({ x, y: model.hist.unhappy[k] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const kAlike = Math.ceil(8 * lo - 1e-9)

  return (
    <div className={panel}>
      <PanelTitle>A · {t.city}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.side} min={20} max={150} step={2} value={n} onChange={(v) => resetCity(() => setN(v))} />
        <Slider
          label={t.vacancy}
          min={0.02}
          max={0.3}
          step={0.01}
          value={vacancy}
          onChange={(v) => resetCity(() => setVacancy(v))}
          format={(v) => fmtPct(v, locale)}
        />
        <Slider
          label={t.shareA}
          min={0.2}
          max={0.8}
          step={0.05}
          value={shareA}
          onChange={(v) => resetCity(() => setShareA(v))}
          format={(v) => fmtPct(v, locale)}
        />
        <Slider label={t.threshold} min={0} max={1} step={0.01} value={lo} onChange={(v) => changeRule(() => setLo(v))} format={(v) => fmtFixed(v, 2, locale)} />
        <Slider label={t.speed} min={0.5} max={30} log value={speed} onChange={setSpeed} format={(v) => fmtFixed(v, v < 10 ? 1 : 0, locale)} />
        {upperOn === 'on' && (
          <Slider label={t.upperU} min={0.3} max={1} step={0.05} value={hi} onChange={(v) => changeRule(() => setHi(v))} format={(v) => fmtFixed(v, 2, locale)} />
        )}
      </div>
      <div className="mt-4 space-y-3">
        <Chips label={t.upper} options={['off', 'on']} value={upperOn} names={t.upperOpts} onChange={(v) => changeRule(() => setUpperOn(v))} />
        <Chips label={t.rule} options={['random', 'nearest']} value={rule} names={t.rules} onChange={(v) => changeRule(() => setRule(v))} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            acc.current = 0
            setPlaying((p) => !p)
          }}
          onStep={onStep}
          onReset={() => resetCity(() => setSeed((s) => s + 1))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {t.cityNoteFn(fmtPct(lo, locale), kAlike)}
        {upperOn === 'on' && ` ${t.upperNote(fmtPct(hi, locale))}`}
      </p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.cityAria(n)} className="block mx-auto bg-white outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={rgbCss(CITY_RGB.a)} square />}>{t.legendA}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(CITY_RGB.b)} square />}>{t.legendB}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(CITY_RGB.empty)} square border="1px solid #cbd5e1" />}>{t.legendEmpty}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(CITY_RGB.aUnhappy)} size={10} square dot />}>{t.legendUnhappy}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.segregation}>
          <span className="text-orange-700">{fmtFixed(stats.segregation, 3, locale)}</span>
          <span className="block text-xs text-slate-500">{t.randomStart(fmtFixed(model.initialSeg, 3, locale))}</span>
        </Stat>
        <Stat label={t.unhappy}>{fmtPct(stats.unhappy, locale, 1)}</Stat>
        <Stat label={t.moves}>
          {fmtInt(city.moves, locale)}
          <span className="block text-xs text-slate-500">{t.sweeps(fmtInt(city.sweeps, locale))}</span>
        </Stat>
        <Stat label={t.settled}>
          {t.settledOpts[status]}
          {status === 'stuck' && <span className="block text-xs text-slate-500">{t.stuckNote}</span>}
        </Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.segNote}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.segChart}</PanelTitle>
          <MiniChart data={segData} refY={model.initialSeg} aria={t.segAria} locale={locale} xLabel={t.sweepLabel} yLabel={t.segregation} />
          <Legend>
            <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.segregation}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.randomStart(fmtFixed(model.initialSeg, 3, locale))}</LegendItem>
          </Legend>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.unhappyChart}</PanelTitle>
          <MiniChart data={unhappyData} aria={t.unhappyAria} locale={locale} xLabel={t.sweepLabel} yLabel={t.unhappy} percent />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function makeToleranceJob(R) {
  const runs = []
  const total = EXP_T.length * R
  const iter = (function* () {
    for (let ti = 0; ti < EXP_T.length; ti++) {
      const T0 = EXP_T[ti]
      const opt = { lo: T0, hi: null, rule: 'random' }
      for (let r = 0; r < R; r++) {
        const random = mulberry32(1000 * (ti + 1) + r)
        const city = createCity(EXP_N, EXP_VACANCY, EXP_SHARE, random)
        while (city.sweeps < EXP_CAP) {
          sweep(city, opt, random)
          if (city.settled) break
          yield (runs.length + city.sweeps / EXP_CAP) / total
        }
        const s = cityStats(city, opt)
        runs.push({ T: T0, seg: s.segregation, steps: city.sweeps, settled: city.settled })
        yield runs.length / total
      }
    }
  })()
  return { iter, snapshot: () => ({ runs: runs.slice() }) }
}

function TolerancePanel({ t, locale }) {
  const [R, setR] = useState(3)
  const exp = useExperiment()

  useEffect(() => {
    exp.run(makeToleranceJob(3))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runs = exp.data ? exp.data.runs : []
  const charts = useMemo(() => {
    const settledSeg = []
    const openSeg = []
    const settledSteps = []
    const openSteps = []
    const byT = new Map()
    for (const r of runs) {
      ;(r.settled ? settledSeg : openSeg).push({ x: r.T, y: r.seg })
      ;(r.settled ? settledSteps : openSteps).push({ x: r.T, y: r.settled ? r.steps : EXP_CAP })
      const m = byT.get(r.T) || { s: 0, n: 0 }
      m.s += r.seg
      m.n++
      byT.set(r.T, m)
    }
    const mean = [...byT].map(([x, m]) => ({ x, y: m.s / m.n }))
    return { settledSeg, openSeg, settledSteps, openSteps, mean }
  }, [runs])

  const tAxis = { dataKey: 'x', type: 'number', domain: [0, 0.8], ticks: [0, 0.2, 0.4, 0.6, 0.8], tickFormatter: (v) => fmtFixed(v, 1, locale), tick: axisTick, stroke: MUTED }
  const tip = (yName, digits) => ({
    cursor: { strokeDasharray: '3 3' },
    formatter: (v, name) => (name === 'x' ? [fmtFixed(v, 2, locale), 'T'] : [fmtFixed(v, digits, locale), yName]),
    separator: ' ',
    contentStyle: tooltipStyle,
  })

  return (
    <div className={panel}>
      <PanelTitle>B · {t.tolerance}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Slider label={t.runs} min={1} max={10} step={1} value={R} onChange={setR} />
        <div className="flex flex-wrap gap-2">
          <SimControls onReset={() => exp.run(makeToleranceJob(R))} labels={{ reset: t.runAgain }} />
          {exp.running && <SimControls onReset={exp.cancel} labels={{ reset: t.cancel }} />}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.tolNote(EXP_CAP)}</p>
      {exp.running && (
        <>
          <ProgressBar progress={exp.progress} />
          <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
            {t.tolProgress(exp.progress)}
          </p>
        </>
      )}
      {exp.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.finalSeg}</PanelTitle>
          <div className="mt-3 h-60 -ml-4" role="img" aria-label={t.finalAria}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis {...tAxis} />
                <YAxis dataKey="y" type="number" domain={[0.4, 1]} ticks={[0.4, 0.6, 0.8, 1]} tickFormatter={(v) => fmtFixed(v, 1, locale)} width={44} tick={axisTick} stroke={MUTED} />
                <ReferenceLine y={0.5} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
                <Tooltip {...tip(t.segregation, 3)} />
                <Scatter data={charts.mean} line={{ stroke: ORANGE, strokeWidth: 1.5 }} shape={NoDot} isAnimationActive={false} />
                <Scatter data={charts.settledSeg} fill={ORANGE} shape="circle" isAnimationActive={false} />
                <Scatter data={charts.openSeg} shape={<HollowDot />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.settledRun}</LegendItem>
            <LegendItem swatch={<DotSwatch color="#fff" border={`1.5px solid ${SLATE}`} />}>{t.notSettled(EXP_CAP)}</LegendItem>
            <LegendItem swatch={<LineSwatch color={ORANGE} width={1.5} />}>{t.meanLine}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.randomRef}</LegendItem>
          </Legend>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.stepsChart}</PanelTitle>
          <div className="mt-3 h-60 -ml-4" role="img" aria-label={t.stepsAria}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis {...tAxis} />
                <YAxis dataKey="y" type="number" domain={[0, EXP_CAP * 1.1]} ticks={[0, 25, 50, 75, 100]} width={44} tick={axisTick} stroke={MUTED} />
                <ReferenceLine
                  y={EXP_CAP}
                  stroke={SLATE}
                  strokeDasharray="4 4"
                  label={{ value: t.capLabel, position: 'insideTopLeft', fontSize: 11, fontFamily: MONO, fill: SLATE }}
                />
                <Tooltip {...tip(t.sweepLabel, 0)} />
                <Scatter data={charts.settledSteps} fill={ORANGE} shape="circle" isAnimationActive={false} />
                <Scatter data={charts.openSteps} shape={<HollowDot />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.settledRun}</LegendItem>
            <LegendItem swatch={<DotSwatch color="#fff" border={`1.5px solid ${SLATE}`} />}>{t.notSettled(EXP_CAP)}</LegendItem>
          </Legend>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.tolReading}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

// Colour of a car by speed: stopped cars orange, moving cars from light to
// dark slate as they approach v_max.
function speedRgb(v, vmax) {
  if (v <= 0) return [247, 147, 26]
  const s = vmax > 1 ? (v - 1) / (vmax - 1) : 1
  const lo = [148, 163, 184] // slate-400
  const hi = [15, 23, 42] // slate-900
  return [0, 1, 2].map((k) => Math.round(lo[k] + (hi[k] - lo[k]) * s))
}

function newTraffic(L, density, layout, seed) {
  const random = mulberry32(seed)
  const road = createRoad(L, density, random, layout)
  const rows = new Int8Array(ST_ROWS * L)
  rows.fill(-1, 0)
  roadRow(road, rows.subarray(0, L))
  return { road, random, rows, count: 1, head: 1, flows: new Float64Array(FLOW_WINDOW), flowSum: 0, nFlow: 0 }
}

function TrafficPanel({ t, locale, vmax, setVmax }) {
  const [L, setL] = useState(400)
  const [density, setDensity] = useState(0.15)
  const [p, setP] = useState(0.2)
  const [layout, setLayout] = useState('random')
  const [speed, setSpeed] = useState(10)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(1)
  const [preset, setPreset] = useState(null)
  const [, setFrame] = useState(0)

  const key = `${L}-${density}-${layout}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newTraffic(L, density, layout, seed)
    ref.current.key = key
  }
  const sim = ref.current
  const { road } = sim

  const ringWrap = useRef(null)
  const ringRef = useRef(null)
  const stWrap = useRef(null)
  const stRef = useRef(null)
  const ringAvail = useElementWidth(ringWrap)
  const stAvail = useElementWidth(stWrap)
  const bitmap = useBitmap()
  const acc = useRef(0)

  const step = () => {
    const sum = trafficStep(road, vmax, p, sim.random)
    const f = sum / road.L
    const k = road.t % FLOW_WINDOW
    sim.flowSum += f - sim.flows[k]
    sim.flows[k] = f
    sim.nFlow = Math.min(sim.nFlow + 1, FLOW_WINDOW)
    roadRow(road, sim.rows.subarray(sim.head * road.L, (sim.head + 1) * road.L))
    sim.head = (sim.head + 1) % ST_ROWS
    sim.count = Math.min(sim.count + 1, ST_ROWS)
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * speed
    const begin = performance.now()
    while (acc.current >= 1 && performance.now() - begin < 12) {
      step()
      acc.current -= 1
    }
    setFrame((f) => f + 1)
  }, playing)

  const reset = (fn, keepPreset = false) => {
    setPlaying(false)
    acc.current = 0
    if (!keepPreset) setPreset(null)
    fn()
  }

  const applyPreset = (name) => {
    reset(() => {
      if (name === 'sugiyama') {
        setL(SUGIYAMA.L)
        setDensity(SUGIYAMA.cars / SUGIYAMA.L)
        setVmax(SUGIYAMA.vmax)
        setP(SUGIYAMA.p)
        setLayout('even')
      } else {
        setVmax(1)
        setP(0)
        setDensity(RULE184.density)
        setLayout('random')
      }
      setSeed((s) => s + 1)
      setPreset(name)
    }, true)
  }

  // ---- drawing

  useEffect(() => {
    const canvas = ringRef.current
    if (!canvas || !ringAvail) return
    const css = Math.min(ringAvail, 340)
    const ctx = prepareCanvas(canvas, css, css, true)
    const dpr = window.devicePixelRatio || 1
    const W = canvas.width
    const c = W / 2
    const R = W / 2 - 12 * dpr
    ctx.clearRect(0, 0, W, W)
    ctx.strokeStyle = GRID
    ctx.lineWidth = 10 * dpr
    ctx.beginPath()
    ctx.arc(c, c, R, 0, 2 * Math.PI)
    ctx.stroke()
    const r = Math.max(1.5 * dpr, Math.min(5 * dpr, ((Math.PI * R) / road.L) * 0.9))
    // Stopped cars last, so they stay visible where dots overlap.
    for (const pass of [1, 0]) {
      for (let k = 0; k < road.n; k++) {
        const v = road.vel[k]
        if ((v === 0 ? 0 : 1) !== pass) continue
        // Anticlockwise from the top, as cell index grows.
        const a = -Math.PI / 2 - (2 * Math.PI * (road.pos[k] + 0.5)) / road.L
        ctx.fillStyle = rgbCss(speedRgb(v, vmax))
        ctx.beginPath()
        ctx.arc(c + R * Math.cos(a), c + R * Math.sin(a), r, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  })

  useEffect(() => {
    const canvas = stRef.current
    if (!canvas || !stAvail) return
    const Lr = road.L
    const ctx = prepareCanvas(canvas, stAvail, ST_ROWS, (stAvail * (window.devicePixelRatio || 1)) / Lr < 1)
    const bm = bitmap(Lr, ST_ROWS)
    const px = bm.img.data
    const palette = Array.from({ length: vmax + 1 }, (_, v) => speedRgb(v, vmax))
    // Oldest row at the top, newest at the bottom of what has been drawn so far.
    const first = (sim.head - sim.count + ST_ROWS) % ST_ROWS
    for (let y = 0; y < ST_ROWS; y++) {
      const row = y < sim.count ? ((first + y) % ST_ROWS) * Lr : -1
      for (let x = 0; x < Lr; x++) {
        const v = row < 0 ? -1 : sim.rows[row + x]
        const col = v < 0 ? [255, 255, 255] : palette[Math.min(v, vmax)]
        const o = 4 * (y * Lr + x)
        px[o] = col[0]
        px[o + 1] = col[1]
        px[o + 2] = col[2]
        px[o + 3] = 255
      }
    }
    bm.ctx.putImageData(bm.img, 0, 0)
    ctx.drawImage(bm.canvas, 0, 0, canvas.width, canvas.height)
  })

  const s = roadStats(road)
  const flow = sim.nFlow ? sim.flowSum / sim.nFlow : s.flow
  const note = preset === 'sugiyama' ? t.sugiyamaNote : preset === 'rule184' ? t.rule184Note : t.trafficNote

  return (
    <div className={panel}>
      <PanelTitle>C · {t.traffic}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.roadL} min={50} max={1000} step={10} value={L} onChange={(v) => reset(() => setL(v))} />
        <Slider
          label={t.density}
          min={0.02}
          max={0.8}
          step={0.01}
          value={density}
          onChange={(v) => reset(() => setDensity(v))}
          format={(v) => t.densityFmt(fmtFixed(v, 2, locale), road.n)}
        />
        <Slider
          label={t.vmax}
          min={1}
          max={5}
          step={1}
          value={vmax}
          onChange={(v) => {
            setPreset(null)
            setVmax(v)
          }}
        />
        <Slider
          label={t.braking}
          min={0}
          max={0.5}
          step={0.01}
          value={p}
          onChange={(v) => {
            setPreset(null)
            setP(v)
          }}
          format={(v) => fmtFixed(v, 2, locale)}
        />
        <Slider label={t.stepsPerSec} min={1} max={120} log value={speed} onChange={setSpeed} format={(v) => fmtInt(v, locale)} />
      </div>
      <div className="mt-4 space-y-3">
        <Chips label={t.start} options={['random', 'even']} value={layout} names={t.starts} onChange={(v) => reset(() => setLayout(v))} />
        <Chips label={t.presets} options={['sugiyama', 'rule184']} value={preset} names={{ sugiyama: t.sugiyama, rule184: t.rule184 }} onChange={applyPreset} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            acc.current = 0
            setPlaying((x) => !x)
          }}
          onStep={() => {
            step()
            setFrame((f) => f + 1)
          }}
          onReset={() => reset(() => setSeed((x) => x + 1), true)}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{note}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="min-w-0">
          <PanelTitle>{t.ringTitle}</PanelTitle>
          <div ref={ringWrap} className="mt-3 min-w-0">
            <canvas ref={ringRef} role="img" aria-label={t.ringAria} className="block mx-auto" />
          </div>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.stTitle}</PanelTitle>
          <div ref={stWrap} className="mt-3 min-w-0">
            <canvas ref={stRef} role="img" aria-label={t.stAria} className="block bg-white outline outline-1 outline-slate-200" />
          </div>
        </div>
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.legendStopped}</LegendItem>
        <LegendItem swatch={<DotSwatch color={rgbCss(speedRgb(1, 5))} />}>{t.legendSlow}</LegendItem>
        <LegendItem swatch={<DotSwatch color={INK} />}>{t.legendFast}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.time}>{fmtInt(road.t, locale)}</Stat>
        <Stat label={t.flow}>
          <span className="text-orange-700">{fmtFixed(flow, 3, locale)}</span>
          <span className="block text-xs text-slate-500">{t.flowKey(sim.nFlow || 1)}</span>
        </Stat>
        <Stat label={t.speedStat}>
          {fmtFixed(s.speed, 2, locale)}
          <span className="block text-xs text-slate-500">{t.speedKey}</span>
        </Stat>
        <Stat label={t.stopped}>{fmtPct(s.stopped, locale, 1)}</Stat>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel D

function makeDiagramJob(vmax, R) {
  const series = Object.fromEntries(FD_P.map((p) => [p, []]))
  const total = FD_P.length * FD_RHO.length * R
  let done = 0
  const iter = (function* () {
    for (const p of FD_P) {
      for (let i = 0; i < FD_RHO.length; i++) {
        const rho = FD_RHO[i]
        let sum = 0
        for (let r = 0; r < R; r++) {
          const random = mulberry32(7919 * (i + 1) + 31 * r + Math.round(p * 100))
          const road = createRoad(FD_L, rho, random)
          for (let k = 0; k < FD_WARM; k++) trafficStep(road, vmax, p, random)
          let s = 0
          for (let k = 0; k < FD_STEPS; k++) s += trafficStep(road, vmax, p, random)
          sum += s / (FD_STEPS * FD_L)
          done++
          yield done / total
        }
        series[p].push({ x: rho, y: sum / R })
      }
    }
  })()
  return { iter, snapshot: () => ({ vmax, series: Object.fromEntries(FD_P.map((p) => [p, series[p].slice()])) }) }
}

function DiagramPanel({ t, locale, vmax }) {
  const [R, setR] = useState(3)
  const exp = useExperiment()
  const rRef = useRef(R)
  rRef.current = R

  useEffect(() => {
    exp.run(makeDiagramJob(vmax, rRef.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vmax])

  const data = exp.data
  const shownV = data ? data.vmax : vmax
  const rc = 1 / (shownV + 1)
  const theory = [
    { x: 0, y: 0 },
    { x: rc, y: flowNoBraking(rc, shownV) },
    { x: 1, y: 0 },
  ]
  const peaks = FD_P.map((p) => {
    const pts = data ? data.series[p] : []
    return pts.reduce((b, d) => (!b || d.y > b.y ? d : b), null)
  })

  return (
    <div className={panel}>
      <PanelTitle>D · {t.fundamental}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Slider label={t.runs} min={1} max={10} step={1} value={R} onChange={setR} />
        <div className="flex flex-wrap gap-2">
          <SimControls onReset={() => exp.run(makeDiagramJob(vmax, R))} labels={{ reset: t.runAgain }} />
          {exp.running && <SimControls onReset={exp.cancel} labels={{ reset: t.cancel }} />}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.fdNote(FD_L, FD_WARM, FD_STEPS)}</p>
      {exp.running && (
        <>
          <ProgressBar progress={exp.progress} />
          <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
            {t.fdProgress(exp.progress)}
          </p>
        </>
      )}
      {exp.cancelled && <p className="mt-2 font-mono text-xs text-slate-500">{t.cancelled}</p>}

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.fdTitle(shownV)}</PanelTitle>
        <div className="mt-3 h-72 -ml-4" role="img" aria-label={t.fdAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => fmtFixed(v, 1, locale)} tick={axisTick} stroke={MUTED} />
              <YAxis dataKey="y" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => fmtFixed(v, 1, locale)} width={44} tick={axisTick} stroke={MUTED} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, name) => (name === 'x' ? [fmtFixed(v, 2, locale), 'ρ'] : [fmtFixed(v, 3, locale), t.flow])}
                separator=" "
                contentStyle={tooltipStyle}
              />
              <Scatter data={theory} line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }} shape={NoDot} isAnimationActive={false} />
              {FD_P.map((p) => (
                <Scatter key={p} data={data ? data.series[p] : []} fill={FD_COLOR[p]} shape="circle" isAnimationActive={false} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          {FD_P.map((p) => (
            <LegendItem key={p} swatch={<DotSwatch color={FD_COLOR[p]} />}>
              {t.fdSeries(fmtNum(p, locale))}
            </LegendItem>
          ))}
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.fdTheory}</LegendItem>
        </Legend>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-sm">
        {FD_P.map((p, k) => (
          <Stat key={p} label={t.fdPeak(fmtNum(p, locale))}>
            {peaks[k] ? t.fdPeakFmt(fmtFixed(peaks[k].y, 3, locale), fmtFixed(peaks[k].x, 2, locale)) : '–'}
          </Stat>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function AgentBasedModels({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  const [vmax, setVmax] = useState(5)
  return (
    <div className="space-y-6">
      <CityPanel t={t} locale={locale} />
      <TolerancePanel t={t} locale={locale} />
      <TrafficPanel t={t} locale={locale} vmax={vmax} setVmax={setVmax} />
      <DiagramPanel t={t} locale={locale} vmax={vmax} />
    </div>
  )
}
