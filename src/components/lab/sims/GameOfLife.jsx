import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  ScatterChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import useExperiment from '../useExperiment.js'
import DrawToggle, { canEdit, drawCanvasClass } from '../DrawToggle.jsx'
import {
  parseRule,
  stepLife,
  updateAges,
  population,
  randomFill,
  resizeGrid,
  hashGrid,
  createCycleDetector,
  PATTERNS,
  patternById,
  orient,
  stamp,
  parseTurmite,
  makeAnts,
  stepTurmites,
  createHighwayDetector,
} from '../life.js'

// The Game of Life and its relatives, in three panels: a Life-like automaton
// to draw on, stamp patterns into and run under any B/S rule; Langton's ant
// and other turmites; and an experiment that runs many random soups to the
// end and plots where they settle.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900, live cells
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'
const INK_RGB = [15, 23, 42]
const ORANGE_RGB = [247, 147, 26]
const AGE_FADE = 16 // generations for a new cell to fade from orange to ink
const MAX_CANVAS = 640 // css px

const RULE_PRESETS = [
  { rule: 'B3/S23', en: 'Life', it: 'Life' },
  { rule: 'B36/S23', en: 'HighLife', it: 'HighLife' },
  { rule: 'B2/S', en: 'Seeds', it: 'Seeds' },
  { rule: 'B3678/S34678', en: 'Day & Night', it: 'Day & Night' },
  { rule: 'B3/S012345678', en: 'Life without Death', it: 'Life without Death' },
]
const PATTERN_GROUPS = ['still', 'osc', 'ship', 'meth', 'gun', 'high']

const ANT_PRESETS = ['RL', 'RLR', 'LLRR', 'LRRRRRLLR']
// Turmite cell colours, one per state; state 0 is the empty background. No
// orange, which marks the ants.
const STATE_COLOURS = [
  '#f8fafc',
  '#0f172a',
  '#64748b',
  '#0e7490',
  '#cbd5e1',
  '#1e3a8a',
  '#7dd3fc',
  '#334155',
  '#15803d',
  '#a5b4fc',
  '#6d28d9',
  '#94a3b8',
]
const STATE_RGB = STATE_COLOURS.map((c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)))

const SOUP_N = 64
const SOUP_MAX_GEN = 2000
const SOUP_DENSITIES = Array.from({ length: 19 }, (_, k) => Math.round((k + 1) * 5) / 100)

const T = {
  en: {
    life: 'Game of Life',
    size: 'Grid size (cells per side)',
    boundary: 'Boundary',
    boundaries: { torus: 'Torus (wraps)', finite: 'Finite (dead edge)' },
    speed: 'Speed (generations per second)',
    max: 'Max',
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    resetNote: 'Reset returns to the grid as it was at generation 0.',
    clear: 'Clear',
    random: 'Random fill',
    density: 'Fill density',
    tool: 'Click on the grid to',
    draw: 'Draw cells',
    drawHint: 'Click a cell to switch it on or off; drag to paint.',
    stampHint: 'Click the grid to stamp the pattern there.',
    drawToggle: 'Draw',
    drawToggleHint: 'On a touch screen, switch Draw on to edit the grid with your finger; while it is off, swiping over the grid scrolls the page.',
    pattern: 'Pattern',
    groups: {
      still: 'Still lifes',
      osc: 'Oscillators',
      ship: 'Spaceships',
      meth: 'Methuselahs',
      gun: 'Guns',
      high: 'HighLife',
    },
    patterns: {
      block: 'Block',
      beehive: 'Beehive',
      loaf: 'Loaf',
      boat: 'Boat',
      blinker: 'Blinker (period 2)',
      toad: 'Toad (period 2)',
      beacon: 'Beacon (period 2)',
      pulsar: 'Pulsar (period 3)',
      pentadecathlon: 'Pentadecathlon (period 15)',
      glider: 'Glider',
      lwss: 'Lightweight spaceship',
      rpentomino: 'R-pentomino',
      acorn: 'Acorn',
      diehard: 'Diehard',
      gosper: 'Gosper glider gun',
      replicator: 'Replicator (HighLife)',
    },
    rotate: 'Rotate 90°',
    load: 'Load alone',
    loadNote: 'Clears the grid and places the pattern with room around it, enlarging the grid if needed and switching to the rule it belongs to.',
    rule: 'Rule',
    ruleField: 'Rule (B…/S…)',
    ruleError: 'Write it as B, digits 0–8, a slash, S, digits 0–8: for example B3/S23.',
    ages: 'Colour by age (new cells orange)',
    canvasAria: (rule, n) => `Game of Life grid, ${n} by ${n} cells, rule ${rule}. Live cells are dark.`,
    generation: 'Generation',
    population: 'Population',
    status: 'Status',
    extinct: 'died out',
    settled: (p, g) => `settled at gen ${g}: ${p === 1 ? 'still' : `period ${p}`}`,
    running: 'still changing',
    popTitle: 'Population',
    popAria: 'Line chart of the number of live cells against the generation.',
    tooltipGen: (v) => `generation ${v}`,
    popName: 'live cells',
    cycleNote:
      'The status compares each generation with the last 30: a repeat means the grid has settled into a cycle, which began at the generation shown.',
    ant: "Langton's ant and turmites",
    antSize: 'Grid size (cells per side, torus)',
    antRule: 'Turn rule',
    antField: 'Rule (letters L and R)',
    antError: 'Use 2 to 12 letters, each L or R.',
    antPresetNames: { RL: "Langton's ant", RLR: 'RLR', LLRR: 'LLRR', LRRRRRLLR: 'LRRRRRLLR' },
    spf: 'Steps per frame',
    ants: 'Number of ants',
    antExplain: (text) =>
      `On a cell of colour k the ant turns by letter k of "${text}" (R right, L left), moves the cell to the next colour and steps forward.`,
    antAria: (rule, n) => `Turmite grid, ${n} by ${n} cells, rule ${rule}. The ants are orange.`,
    steps: 'Steps',
    highway: 'Highway',
    hwOnly: 'tracked for one ant with rule RL',
    hwNone: 'not yet',
    hwSince: (s) => `since step ${s}`,
    hwBroken: (s) => `from step ${s}, then broken`,
    hwFirst: (s) => `first highway at step ${s}`,
    hwNote:
      "The highway is detected when, for at least four periods in a row, every 104 steps move the ant by the same two cells diagonally. On a torus it eventually runs into its own trail.",
    soups: 'Order from random soups',
    soupsPerDensity: 'Soups per density',
    runAgain: 'Run again',
    cancel: 'Cancel',
    soupNote: (n, g) =>
      `Random soups on a ${n} × ${n} torus, initial densities 0.05 … 0.95, each run until the grid repeats a previous state (any period) or for ${g} generations.`,
    progress: (p) => `Running soups … ${Math.round(p * 100)}%`,
    finalTitle: 'Final density vs initial density',
    settleTitle: 'Generations to settle vs initial density',
    finalAria: 'Scatter plot of the final density of live cells against the initial density, one dot per soup, with the mean as a line.',
    settleAria: 'Scatter plot of the number of generations each soup needed to settle against the initial density, with the mean as a line.',
    initial: 'initial density',
    finalName: 'final density',
    settleName: 'generations',
    meanName: 'mean',
    legendDots: 'one soup',
    legendLine: 'mean',
    caption: (u, g) =>
      `Small tori settle faster than the infinite plane: activity has less room to spread, and gliders that wrap around soon join a cycle or crash into the debris.${
        u ? ` ${u} soup${u === 1 ? '' : 's'} still changing after ${g} generations ${u === 1 ? 'is' : 'are'} plotted at ${g}.` : ''
      }`,
  },
  it: {
    life: 'Il Gioco della Vita',
    size: 'Dimensione della griglia (celle per lato)',
    boundary: 'Bordo',
    boundaries: { torus: 'Toro (si richiude)', finite: 'Finito (bordo morto)' },
    speed: 'Velocità (generazioni al secondo)',
    max: 'Max',
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    resetNote: 'Azzera riporta la griglia com\'era alla generazione 0.',
    clear: 'Svuota',
    random: 'Riempimento casuale',
    density: 'Densità di riempimento',
    tool: 'Cliccando sulla griglia',
    draw: 'Disegni celle',
    drawHint: 'Clicca una cella per accenderla o spegnerla; trascina per dipingere.',
    stampHint: 'Clicca sulla griglia per stampare lì la configurazione.',
    drawToggle: 'Disegna',
    drawToggleHint: 'Su uno schermo touch, attiva Disegna per modificare la griglia con il dito; quando è spento, scorrere sulla griglia fa scorrere la pagina.',
    pattern: 'Configurazione',
    groups: {
      still: 'Configurazioni stabili',
      osc: 'Oscillatori',
      ship: 'Navicelle',
      meth: 'Matusalemme',
      gun: 'Cannoni',
      high: 'HighLife',
    },
    patterns: {
      block: 'Blocco',
      beehive: 'Alveare',
      loaf: 'Pagnotta',
      boat: 'Barca',
      blinker: 'Lampeggiatore (periodo 2)',
      toad: 'Rospo (periodo 2)',
      beacon: 'Faro (periodo 2)',
      pulsar: 'Pulsar (periodo 3)',
      pentadecathlon: 'Pentadecathlon (periodo 15)',
      glider: 'Aliante',
      lwss: 'Navicella leggera',
      rpentomino: 'R-pentomino',
      acorn: 'Ghianda',
      diehard: 'Diehard',
      gosper: 'Cannone di Gosper',
      replicator: 'Replicatore (HighLife)',
    },
    rotate: 'Ruota di 90°',
    load: 'Carica da sola',
    loadNote:
      'Svuota la griglia e colloca la configurazione con spazio intorno, ingrandendo la griglia se serve e passando alla regola a cui appartiene.',
    rule: 'Regola',
    ruleField: 'Regola (B…/S…)',
    ruleError: 'Scrivila come B, cifre 0–8, una barra, S, cifre 0–8: per esempio B3/S23.',
    ages: 'Colora per età (celle nuove in arancione)',
    canvasAria: (rule, n) => `Griglia del Gioco della Vita, ${n} per ${n} celle, regola ${rule}. Le celle vive sono scure.`,
    generation: 'Generazione',
    population: 'Popolazione',
    status: 'Stato',
    extinct: 'estinta',
    settled: (p, g) => `stabile dalla gen. ${g}: ${p === 1 ? 'ferma' : `periodo ${p}`}`,
    running: 'ancora in evoluzione',
    popTitle: 'Popolazione',
    popAria: 'Grafico a linee del numero di celle vive in funzione della generazione.',
    tooltipGen: (v) => `generazione ${v}`,
    popName: 'celle vive',
    cycleNote:
      'Lo stato confronta ogni generazione con le ultime 30: una ripetizione significa che la griglia è entrata in un ciclo, iniziato alla generazione indicata.',
    ant: 'La formica di Langton e i turmiti',
    antSize: 'Dimensione della griglia (celle per lato, toro)',
    antRule: 'Regola di svolta',
    antField: 'Regola (lettere L e R)',
    antError: 'Usa da 2 a 12 lettere, ciascuna L o R.',
    antPresetNames: { RL: 'Formica di Langton', RLR: 'RLR', LLRR: 'LLRR', LRRRRRLLR: 'LRRRRRLLR' },
    spf: 'Passi per fotogramma',
    ants: 'Numero di formiche',
    antExplain: (text) =>
      `Su una cella di colore k la formica svolta secondo la lettera k di "${text}" (R a destra, L a sinistra), porta la cella al colore successivo e avanza di un passo.`,
    antAria: (rule, n) => `Griglia dei turmiti, ${n} per ${n} celle, regola ${rule}. Le formiche sono arancioni.`,
    steps: 'Passi',
    highway: 'Autostrada',
    hwOnly: 'rilevata per una formica con regola RL',
    hwNone: 'non ancora',
    hwSince: (s) => `dal passo ${s}`,
    hwBroken: (s) => `dal passo ${s}, poi interrotta`,
    hwFirst: (s) => `prima autostrada al passo ${s}`,
    hwNote:
      "L'autostrada viene rilevata quando, per almeno quattro periodi di fila, ogni 104 passi spostano la formica delle stesse due celle in diagonale. Su un toro prima o poi finisce contro la propria scia.",
    soups: 'Ordine da zuppe casuali',
    soupsPerDensity: 'Zuppe per densità',
    runAgain: 'Ripeti',
    cancel: 'Annulla',
    soupNote: (n, g) =>
      `Zuppe casuali su un toro di ${n} × ${n}, densità iniziali 0,05 … 0,95, ciascuna fatta evolvere finché la griglia ripete uno stato precedente (con qualsiasi periodo) o per ${g} generazioni.`,
    progress: (p) => `Zuppe in corso … ${Math.round(p * 100)}%`,
    finalTitle: 'Densità finale e densità iniziale',
    settleTitle: 'Generazioni per stabilizzarsi e densità iniziale',
    finalAria:
      'Grafico a dispersione della densità finale di celle vive in funzione della densità iniziale, un punto per zuppa, con la media come linea.',
    settleAria:
      'Grafico a dispersione del numero di generazioni necessarie a ogni zuppa per stabilizzarsi in funzione della densità iniziale, con la media come linea.',
    initial: 'densità iniziale',
    finalName: 'densità finale',
    settleName: 'generazioni',
    meanName: 'media',
    legendDots: 'una zuppa',
    legendLine: 'media',
    caption: (u, g) =>
      `I tori piccoli si stabilizzano prima del piano infinito: l'attività ha meno spazio per diffondersi, e gli alianti che fanno il giro della griglia entrano presto in un ciclo o finiscono contro i detriti.${
        u ? ` ${u === 1 ? 'Una zuppa ancora in evoluzione' : `${u} zuppe ancora in evoluzione`} dopo ${g} generazioni ${u === 1 ? 'è riportata' : 'sono riportate'} a ${g}.` : ''
      }`,
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)

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
// its context with smoothing off, so cells stay crisp squares.
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
function gridSize(n, availW) {
  const dpr = window.devicePixelRatio || 1
  const side = Math.min(availW, MAX_CANVAS)
  const k = Math.floor((side * dpr) / n)
  if (k >= 1) return { css: (n * k) / dpr, down: false }
  return { css: side, down: true }
}

// An offscreen canvas of one pixel per cell, with its ImageData reused
// between frames.
function makeBitmap(n) {
  const canvas = document.createElement('canvas')
  canvas.width = n
  canvas.height = n
  const ctx = canvas.getContext('2d')
  return { n, canvas, ctx, img: ctx.createImageData(n, n) }
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
const field =
  'rounded border px-2 py-1 font-mono text-sm text-slate-900 focus:outline-none min-w-0'

const tab = (active) =>
  `px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
  }`

const chip = (active) =>
  `px-2.5 py-1 rounded-full border text-xs font-mono transition-colors ${
    active
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300'
  }`

function Tabs({ options, value, onChange, labels }) {
  return (
    <div className="inline-flex flex-wrap rounded-full border border-slate-200 p-0.5" role="group">
      {options.map((o) => (
        <button key={o} type="button" className={tab(value === o)} aria-pressed={value === o} onClick={() => onChange(o)}>
          {labels[o]}
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

// A text field for a rule, with presets as chips. `parse` returns the
// canonical text or null; the field keeps what is typed until it is valid.
function RuleField({ label, fieldLabel, presets, value, onChange, parse, error, upper = true }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  const valid = parse(text) != null
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 mr-1">{label}</span>
        {presets.map((p) => (
          <button
            key={p.rule}
            type="button"
            className={chip(value === p.rule)}
            aria-pressed={value === p.rule}
            onClick={() => onChange(p.rule)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
        {fieldLabel}
        <input
          type="text"
          spellCheck={false}
          autoCapitalize="characters"
          value={text}
          aria-invalid={!valid}
          onChange={(e) => {
            const v = upper ? e.target.value.toUpperCase() : e.target.value
            setText(v)
            const canon = parse(v)
            if (canon != null) onChange(canon)
          }}
          onBlur={() => setText(value)}
          className={`${field} w-44 ${valid ? 'border-slate-300 focus:border-orange-500' : 'border-orange-500'}`}
        />
      </label>
      {!valid && <p className="text-xs text-orange-700">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------- Panel A

// Cells on the straight line from (x0, y0) to (x1, y1), so a fast drag leaves no gaps.
function lineCells(x0, y0, x1, y1) {
  const out = []
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    out.push([x0, y0])
    if (x0 === x1 && y0 === y1) return out
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}

// Where "load" puts a pattern: the gun in the corner opposite to where its
// gliders head, everything else in the centre.
function loadPosition(p, o, n, quarter) {
  if (!p.at) return [(n - o.w) >> 1, (n - o.h) >> 1]
  // The unrotated gun sends gliders down and to the right.
  let [dx, dy] = [1, 1]
  for (let q = 0; q < quarter; q++) [dx, dy] = [-dy, dx]
  const x = dx > 0 ? Math.round(p.at[0] * n) : n - o.w - Math.round(p.at[0] * n)
  const y = dy > 0 ? Math.round(p.at[1] * n) : n - o.h - Math.round(p.at[1] * n)
  return [x, y]
}

const HISTORY_MAX = 1500

// Ages for a grid that is a starting point: its cells count as old (drawn in
// ink), so only cells born afterwards show up orange.
function oldAges(grid) {
  const age = new Uint16Array(grid.length)
  for (let i = 0; i < grid.length; i++) if (grid[i]) age[i] = AGE_FADE
  return age
}

function LifePanel({ t, locale, lang }) {
  const [n, setN] = useState(150)
  const [boundary, setBoundary] = useState('torus')
  const [gps, setGps] = useState(15)
  const [maxSpeed, setMaxSpeed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [density, setDensity] = useState(0.3)
  const [seed, setSeed] = useState(1)
  const [ruleText, setRuleText] = useState('B3/S23')
  const [ages, setAges] = useState(true)
  const [tool, setTool] = useState('draw') // 'draw' or a pattern id
  const [quarter, setQuarter] = useState(0)
  const [drawOn, setDrawOn] = useState(false) // touch drawing armed
  const [, setFrame] = useState(0) // bumped to repaint the stats
  const [chart, setChart] = useState([])

  const torus = boundary === 'torus'
  const rule = useMemo(() => parseRule(ruleText), [ruleText])

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)

  // The simulation lives in a ref: grids are too large to copy into React state
  // every generation.
  const sim = useRef(null)
  if (!sim.current) {
    const grid = randomFill(new Uint8Array(150 * 150), 0.3, 1)
    sim.current = {
      n: 150,
      grid,
      next: new Uint8Array(150 * 150),
      age: oldAges(grid),
      initial: grid.slice(),
      gen: 0,
      pop: population(grid),
      detector: createCycleDetector(30),
      cycle: null,
      history: [],
      stride: 1,
      bitmap: null,
      hover: null,
      paint: null,
      acc: 0,
      lastChart: 0,
    }
  }

  const restartTracking = () => {
    const s = sim.current
    s.detector.reset()
    s.cycle = null
    s.detector.push(hashGrid(s.grid), s.gen)
  }

  // The current grid becomes generation 0.
  const startFrom = (grid, size = sim.current.n) => {
    const s = sim.current
    s.n = size
    s.grid = grid
    s.next = new Uint8Array(size * size)
    s.age = oldAges(grid)
    s.initial = grid.slice()
    s.gen = 0
    s.pop = population(grid)
    s.history = [{ g: 0, p: s.pop }]
    s.stride = 1
    restartTracking()
    setChart(s.history.slice())
    setFrame((f) => f + 1)
  }

  // Initial tracking for the starting soup.
  useEffect(() => {
    startFrom(sim.current.grid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A new size keeps the middle of the grid.
  useEffect(() => {
    const s = sim.current
    if (s.n === n) return
    startFrom(resizeGrid(s.grid, s.n, s.n, n, n), n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // Changing the rules or the boundary changes what counts as a repeat.
  useEffect(() => {
    restartTracking()
    setFrame((f) => f + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleText, boundary])

  // After an edit: at generation 0 the edit becomes part of the start;
  // later it only restarts the cycle detector.
  const edited = () => {
    const s = sim.current
    s.pop = population(s.grid)
    if (s.gen === 0) {
      s.initial = s.grid.slice()
      s.history = [{ g: 0, p: s.pop }]
      setChart(s.history.slice())
    }
    restartTracking()
    setFrame((f) => f + 1)
  }

  const advance = () => {
    const s = sim.current
    if (!rule) return
    s.pop = stepLife(s.grid, s.next, s.n, s.n, rule, torus)
    const tmp = s.grid
    s.grid = s.next
    s.next = tmp
    updateAges(s.age, s.grid)
    s.gen++
    if (!s.cycle) s.cycle = s.detector.push(hashGrid(s.grid), s.gen)
    if (s.gen % s.stride === 0) {
      s.history.push({ g: s.gen, p: s.pop })
      if (s.history.length > HISTORY_MAX) {
        // Keep every other point and sample half as often from now on.
        s.history = s.history.filter((_, i) => i % 2 === 0)
        s.stride *= 2
      }
    }
  }

  const publishChart = (force) => {
    const s = sim.current
    const now = performance.now()
    if (force || now - s.lastChart > 250) {
      s.lastChart = now
      const last = s.history[s.history.length - 1]
      setChart(last && last.g === s.gen ? s.history.slice() : [...s.history, { g: s.gen, p: s.pop }])
    }
  }

  useAnimationLoop((dt) => {
    const s = sim.current
    if (maxSpeed) {
      const start = performance.now()
      do advance()
      while (performance.now() - start < 12)
    } else {
      s.acc += (Math.min(dt, 100) / 1000) * gps
      const k = Math.min(Math.floor(s.acc), 8)
      if (!k) return
      s.acc -= k
      for (let i = 0; i < k; i++) advance()
    }
    setFrame((f) => f + 1)
    publishChart(false)
  }, playing && !!rule)

  // ---- drawing

  const draw = () => {
    const canvas = canvasRef.current
    const s = sim.current
    if (!canvas || !avail) return
    const size = gridSize(s.n, avail)
    const ctx = prepareCanvas(canvas, size.css, size.css, size.down)
    if (!s.bitmap || s.bitmap.n !== s.n) s.bitmap = makeBitmap(s.n)
    const { img } = s.bitmap
    const px = img.data
    for (let i = 0, len = s.grid.length; i < len; i++) {
      const o = 4 * i
      if (!s.grid[i]) {
        px[o] = px[o + 1] = px[o + 2] = 255
      } else if (ages && s.age[i] < AGE_FADE) {
        const f = (s.age[i] - 1) / (AGE_FADE - 1)
        px[o] = ORANGE_RGB[0] + (INK_RGB[0] - ORANGE_RGB[0]) * f
        px[o + 1] = ORANGE_RGB[1] + (INK_RGB[1] - ORANGE_RGB[1]) * f
        px[o + 2] = ORANGE_RGB[2] + (INK_RGB[2] - ORANGE_RGB[2]) * f
      } else {
        px[o] = INK_RGB[0]
        px[o + 1] = INK_RGB[1]
        px[o + 2] = INK_RGB[2]
      }
      px[o + 3] = 255
    }
    s.bitmap.ctx.putImageData(img, 0, 0)
    ctx.drawImage(s.bitmap.canvas, 0, 0, canvas.width, canvas.height)

    const cell = canvas.width / s.n
    if (cell >= 6) {
      ctx.fillStyle = GRID
      for (let k = 1; k < s.n; k++) {
        const p = Math.round(k * cell)
        ctx.fillRect(p, 0, 1, canvas.height)
        ctx.fillRect(0, p, canvas.width, 1)
      }
    }

    // Ghost of the pattern under the pointer.
    if (tool !== 'draw' && s.hover) {
      const o = orient(patternById(tool).cells, quarter)
      const x0 = s.hover[0] - (o.w >> 1)
      const y0 = s.hover[1] - (o.h >> 1)
      ctx.fillStyle = 'rgba(247, 147, 26, 0.55)'
      for (const [dx, dy] of o.cells) {
        let x = x0 + dx
        let y = y0 + dy
        if (torus) {
          x = (x + s.n) % s.n
          y = (y + s.n) % s.n
        } else if (x < 0 || y < 0 || x >= s.n || y >= s.n) continue
        ctx.fillRect(Math.round(x * cell), Math.round(y * cell), Math.max(1, Math.round(cell)), Math.max(1, Math.round(cell)))
      }
    }
  }

  useEffect(() => {
    draw()
  })

  // ---- pointer input

  const cellAt = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    const s = sim.current
    return [
      clamp(Math.floor(((e.clientX - r.left) / r.width) * s.n), 0, s.n - 1),
      clamp(Math.floor(((e.clientY - r.top) / r.height) * s.n), 0, s.n - 1),
    ]
  }

  const setCell = (x, y, v) => {
    const s = sim.current
    const i = y * s.n + x
    s.grid[i] = v
    s.age[i] = v ? AGE_FADE : 0
  }

  const onPointerDown = (e) => {
    if (!canEdit(drawOn, e)) return
    const s = sim.current
    const [x, y] = cellAt(e)
    if (tool === 'draw') {
      const v = s.grid[y * s.n + x] ? 0 : 1
      s.paint = { v, x, y }
      e.currentTarget.setPointerCapture(e.pointerId)
      setCell(x, y, v)
    } else {
      const o = orient(patternById(tool).cells, quarter)
      stamp(s.grid, s.n, s.n, o.cells, x - (o.w >> 1), y - (o.h >> 1), torus)
      for (let i = 0; i < s.grid.length; i++) if (s.grid[i] && !s.age[i]) s.age[i] = AGE_FADE
    }
    edited()
  }

  const onPointerMove = (e) => {
    if (!canEdit(drawOn, e)) return
    const s = sim.current
    const [x, y] = cellAt(e)
    if (s.paint) {
      if (x === s.paint.x && y === s.paint.y) return
      for (const [cx, cy] of lineCells(s.paint.x, s.paint.y, x, y)) setCell(cx, cy, s.paint.v)
      s.paint.x = x
      s.paint.y = y
      edited()
    } else if (tool !== 'draw' && (!s.hover || s.hover[0] !== x || s.hover[1] !== y)) {
      s.hover = [x, y]
      draw()
    }
  }

  const onPointerUp = () => {
    sim.current.paint = null
  }

  const onPointerLeave = () => {
    if (sim.current.hover) {
      sim.current.hover = null
      draw()
    }
  }

  // ---- actions

  const randomise = (nextSeed = seed + 1) => {
    setSeed(nextSeed)
    const s = sim.current
    startFrom(randomFill(new Uint8Array(s.n * s.n), density, nextSeed))
  }

  const loadAlone = () => {
    const p = patternById(tool)
    if (!p) return
    const size = Math.max(n, p.room || 0)
    const o = orient(p.cells, quarter)
    const [x0, y0] = loadPosition(p, o, size, quarter)
    const grid = stamp(new Uint8Array(size * size), size, size, o.cells, x0, y0, false)
    setPlaying(false)
    setRuleText(p.rule || 'B3/S23')
    startFrom(grid, size)
    setN(size)
  }

  const resetToStart = () => {
    setPlaying(false)
    const s = sim.current
    startFrom(s.initial.slice())
  }

  const s = sim.current
  const status =
    s.pop === 0 ? t.extinct : s.cycle ? t.settled(s.cycle.period, fmtInt(s.cycle.since, locale)) : t.running

  const chartData = useDeferredValue(chart)
  const presetChips = RULE_PRESETS.map((p) => ({ rule: p.rule, name: `${p[lang] || p.en} ${p.rule}` }))

  return (
    <div className={panel}>
      <PanelTitle>A · {t.life}</PanelTitle>

      <div className="mt-4 space-y-4">
        <RuleField
          label={t.rule}
          fieldLabel={t.ruleField}
          presets={presetChips}
          value={rule ? rule.text : ruleText}
          onChange={setRuleText}
          parse={(v) => parseRule(v)?.text ?? null}
          error={t.ruleError}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label={t.size} min={50} max={400} step={10} value={n} onChange={(v) => setN(v)} />
          <div className="flex flex-wrap items-center gap-3 sm:self-end">
            <span className="text-sm font-medium text-slate-700">{t.boundary}</span>
            <Tabs options={['torus', 'finite']} value={boundary} onChange={setBoundary} labels={t.boundaries} />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            {t.tool}
            <select
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              className="max-w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
            >
              <option value="draw">{t.draw}</option>
              {PATTERN_GROUPS.map((g) => (
                <optgroup key={g} label={t.groups[g]}>
                  {PATTERNS.filter((p) => p.group === g).map((p) => (
                    <option key={p.id} value={p.id}>
                      {t.patterns[p.id]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          {tool === 'draw' ? (
            <p className="text-xs text-slate-500 leading-relaxed">{t.drawHint}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <SimControls onReset={() => setQuarter((q) => (q + 1) % 4)} labels={{ reset: `${t.rotate} · ${quarter * 90}°` }} />
                <SimControls onReset={loadAlone} labels={{ reset: t.load }} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.stampHint} {t.loadNote}
              </p>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Slider
            label={t.density}
            min={0.05}
            max={0.95}
            step={0.01}
            value={density}
            onChange={setDensity}
            format={(v) => fmtFixed(v, 2, locale)}
          />
          <div className="flex flex-wrap gap-2">
            <SimControls onReset={() => randomise()} labels={{ reset: t.random }} />
            <SimControls onReset={() => startFrom(new Uint8Array(sim.current.n * sim.current.n))} labels={{ reset: t.clear }} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            sim.current.acc = 0
            setPlaying((p) => !p)
          }}
          onStep={() => {
            advance()
            setFrame((f) => f + 1)
            publishChart(true)
          }}
          onReset={resetToStart}
          labels={t.controls}
        />
        <div className="flex items-end gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <Slider label={t.speed} min={1} max={60} step={1} value={gps} onChange={setGps} format={(v) => (maxSpeed ? t.max : String(v))} />
          </div>
          <button type="button" className={chip(maxSpeed)} aria-pressed={maxSpeed} onClick={() => setMaxSpeed((m) => !m)}>
            {t.max}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{t.resetNote}</p>

      <label className="mt-4 flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={ages} onChange={(e) => setAges(e.target.checked)} className="accent-orange-600" />
        <span className="text-sm font-medium text-slate-700">{t.ages}</span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <DrawToggle on={drawOn} onChange={setDrawOn} label={t.drawToggle} />
        <p className="text-xs text-slate-500 leading-relaxed flex-1 min-w-[12rem]">{t.drawToggleHint}</p>
      </div>

      <div ref={wrapRef} className="mt-3 min-w-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria(rule ? rule.text : ruleText, s.n)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
          className={`block mx-auto bg-white outline outline-1 outline-slate-200 cursor-crosshair ${drawCanvasClass(drawOn)}`}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.generation}>{fmtInt(s.gen, locale)}</Stat>
        <Stat label={t.population}>{fmtInt(s.pop, locale)}</Stat>
        <div className="col-span-2 sm:col-span-1">
          <Stat label={t.status}>
            <span className={s.cycle || s.pop === 0 ? 'text-orange-700' : ''} aria-live="polite">
              {status}
            </span>
          </Stat>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.cycleNote}</p>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.popTitle}</PanelTitle>
        <div className="mt-3 h-48 -ml-4" role="img" aria-label={t.popAria}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="g" type="number" domain={[0, 'dataMax']} allowDecimals={false} tick={axisTick} stroke={MUTED} />
              <YAxis domain={[0, 'auto']} allowDecimals={false} width={48} tick={axisTick} stroke={MUTED} />
              <Tooltip formatter={(v) => [fmtInt(v, locale), t.popName]} labelFormatter={t.tooltipGen} contentStyle={tooltipStyle} />
              <Line type="linear" dataKey="p" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function makeAntSim(n, count) {
  return {
    n,
    grid: new Uint8Array(n * n),
    ants: makeAnts(count, n, n),
    steps: 0,
    highway: createHighwayDetector(),
    bitmap: null,
  }
}

function AntPanel({ t, locale }) {
  const [n, setN] = useState(200)
  const [ruleText, setRuleText] = useState('RL')
  const [spf, setSpf] = useState(20)
  const [count, setCount] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)

  const turmite = useMemo(() => parseTurmite(ruleText), [ruleText])
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const sim = useRef(null)
  if (!sim.current) sim.current = makeAntSim(n, count)

  const reset = () => {
    sim.current = makeAntSim(n, count)
    setFrame((f) => f + 1)
  }

  useEffect(() => {
    setPlaying(false)
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ruleText, count])

  const tracked = count === 1 && turmite && turmite.text === 'RL'

  const advance = (k) => {
    const s = sim.current
    if (!turmite) return
    if (tracked) {
      stepTurmites(s.grid, s.n, s.n, s.ants, turmite, k, (ant) => {
        s.steps++
        s.highway.push(ant, s.steps)
      })
    } else {
      stepTurmites(s.grid, s.n, s.n, s.ants, turmite, k)
      s.steps += k
    }
  }

  useAnimationLoop(() => {
    advance(Math.round(spf))
    setFrame((f) => f + 1)
  }, playing && !!turmite)

  const draw = () => {
    const canvas = canvasRef.current
    const s = sim.current
    if (!canvas || !avail) return
    const size = gridSize(s.n, avail)
    const ctx = prepareCanvas(canvas, size.css, size.css, size.down)
    if (!s.bitmap || s.bitmap.n !== s.n) s.bitmap = makeBitmap(s.n)
    const px = s.bitmap.img.data
    for (let i = 0, len = s.grid.length; i < len; i++) {
      const rgb = STATE_RGB[s.grid[i]]
      const o = 4 * i
      px[o] = rgb[0]
      px[o + 1] = rgb[1]
      px[o + 2] = rgb[2]
      px[o + 3] = 255
    }
    s.bitmap.ctx.putImageData(s.bitmap.img, 0, 0)
    ctx.drawImage(s.bitmap.canvas, 0, 0, canvas.width, canvas.height)
    // Ants as orange squares, at least 4 device pixels wide so they stay visible.
    const cell = canvas.width / s.n
    const a = Math.max(4, Math.round(cell))
    ctx.fillStyle = ORANGE
    for (const ant of s.ants) {
      const cx = (ant.x + 0.5) * cell
      const cy = (ant.y + 0.5) * cell
      ctx.fillRect(Math.round(cx - a / 2), Math.round(cy - a / 2), a, a)
    }
  }

  useEffect(() => {
    draw()
  })

  const s = sim.current
  const hw = s.highway
  const hwText = !tracked
    ? t.hwOnly
    : hw.active
      ? t.hwSince(fmtInt(hw.start, locale))
      : hw.start != null
        ? t.hwBroken(fmtInt(hw.start, locale))
        : t.hwNone
  const nStates = turmite ? turmite.text.length : 0

  return (
    <div className={panel}>
      <PanelTitle>B · {t.ant}</PanelTitle>

      <div className="mt-4 space-y-4">
        <RuleField
          label={t.antRule}
          fieldLabel={t.antField}
          presets={ANT_PRESETS.map((r) => ({ rule: r, name: t.antPresetNames[r] }))}
          value={turmite ? turmite.text : ruleText}
          onChange={setRuleText}
          parse={(v) => parseTurmite(v)?.text ?? null}
          error={t.antError}
        />
        {turmite && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">{t.antExplain(turmite.text)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5" aria-hidden="true">
              {Array.from({ length: nStates }, (_, k) => (
                <span key={k} className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600">
                  <span className="w-3.5 h-3.5 rounded-sm border border-slate-300" style={{ background: STATE_COLOURS[k] }} />
                  {k}: {turmite.text[k]}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label={t.antSize} min={100} max={400} step={10} value={n} onChange={setN} />
          <Slider label={t.ants} min={1} max={4} step={1} value={count} onChange={setCount} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <SimControls
          playing={playing}
          onPlayPause={() => setPlaying((p) => !p)}
          onStep={() => {
            advance(1)
            setFrame((f) => f + 1)
          }}
          onReset={() => {
            setPlaying(false)
            reset()
          }}
          labels={t.controls}
        />
        <Slider
          label={t.spf}
          min={1}
          max={5000}
          log
          value={spf}
          onChange={(v) => setSpf(clamp(Math.round(v), 1, 5000))}
          format={(v) => fmtInt(v, locale)}
        />
      </div>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.antAria(turmite ? turmite.text : ruleText, s.n)}
          className="block mx-auto bg-slate-50 outline outline-1 outline-slate-200"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-sm">
        <Stat label={t.steps}>{fmtInt(s.steps, locale)}</Stat>
        <Stat label={t.highway}>
          <span className={tracked && hw.active ? 'text-orange-700' : ''} aria-live="polite">
            {hwText}
          </span>
          {tracked && hw.first != null && hw.first !== hw.start && (
            <span className="block text-xs text-slate-500">{t.hwFirst(fmtInt(hw.first, locale))}</span>
          )}
        </Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.hwNote}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

// Every soup runs to its first repeated state (any period, so gliders
// circling the torus are caught too) or to SOUP_MAX_GEN generations.
function makeSoupJob(perDensity, round) {
  const life = parseRule('B3/S23')
  const N = SOUP_N
  const results = []
  const total = SOUP_DENSITIES.length * perDensity
  const iter = (function* run() {
    let a = new Uint8Array(N * N)
    let b = new Uint8Array(N * N)
    for (let k = 0; k < SOUP_DENSITIES.length; k++) {
      const d = SOUP_DENSITIES[k]
      for (let j = 0; j < perDensity; j++) {
        randomFill(a, d, 9000 + 100000 * round + 100 * k + j)
        const det = createCycleDetector(Infinity)
        det.push(hashGrid(a), 0)
        let found = null
        let gen = 0
        let pop = population(a)
        while (!found && gen < SOUP_MAX_GEN) {
          pop = stepLife(a, b, N, N, life, true)
          const tmp = a
          a = b
          b = tmp
          gen++
          found = det.push(hashGrid(a), gen)
          if (gen % 50 === 0) yield (results.length + gen / SOUP_MAX_GEN) / total
        }
        results.push({
          d,
          final: pop / (N * N),
          settle: found ? found.since : SOUP_MAX_GEN,
          settled: !!found,
        })
        yield results.length / total
      }
    }
  })()
  return { iter, snapshot: () => results.slice() }
}

function summarise(results) {
  const means = []
  for (const d of SOUP_DENSITIES) {
    const rs = results.filter((r) => r.d === d)
    if (!rs.length) continue
    const avg = (key) => rs.reduce((sum, r) => sum + r[key], 0) / rs.length
    means.push({ d, final: avg('final'), settle: avg('settle') })
  }
  return means
}

function SoupChart({ title, aria, points, means, yKey, yName, yFormat, t, locale }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-2 h-56 -ml-4" role="img" aria-label={aria}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="d"
              type="number"
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              tickFormatter={(v) => fmtFixed(v, 1, locale)}
              tick={axisTick}
              stroke={MUTED}
              label={{ value: t.initial, position: 'insideBottom', offset: -10, style: { ...axisTick, fill: '#64748b' } }}
            />
            <YAxis dataKey={yKey} domain={[0, 'auto']} width={52} tick={axisTick} stroke={MUTED} tickFormatter={yFormat} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const row = payload[0].payload
                // Soup rows carry `settled`; rows of means do not.
                const isMean = !('settled' in row)
                return (
                  <div className="bg-white border border-slate-200 rounded px-2.5 py-1.5" style={tooltipStyle}>
                    <div className="text-slate-500">
                      {t.initial} {fmtFixed(row.d, 2, locale)}
                    </div>
                    <div className="text-slate-900">
                      {isMean ? `${t.meanName}: ` : ''}
                      {yFormat(row[yKey])} {yName}
                    </div>
                  </div>
                )
              }}
            />
            <Scatter name="soup" data={points} fill={INK} fillOpacity={0.45} isAnimationActive={false} />
            <Scatter
              name="mean"
              data={means}
              line={{ stroke: ORANGE, strokeWidth: 2 }}
              shape={() => null}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SoupPanel({ t, locale }) {
  const [perDensity, setPerDensity] = useState(4)
  const exp = useExperiment()
  const runs = useRef(0)
  const start = () => exp.run(makeSoupJob(perDensity, runs.current++))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => start(), [])

  const results = exp.data || []
  const means = useMemo(() => summarise(results), [results])
  const unsettled = results.filter((r) => !r.settled).length

  return (
    <div className={panel}>
      <PanelTitle>C · {t.soups}</PanelTitle>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.soupNote(SOUP_N, SOUP_MAX_GEN)}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={t.soupsPerDensity} min={1} max={10} step={1} value={perDensity} onChange={setPerDensity} />
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

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-slate-600" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: INK, opacity: 0.45 }} />
          {t.legendDots}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-0.5" style={{ background: ORANGE }} />
          {t.legendLine}
        </span>
      </div>

      <div className="mt-3 grid gap-6 lg:grid-cols-2">
        <SoupChart
          title={t.finalTitle}
          aria={t.finalAria}
          points={results}
          means={means}
          yKey="final"
          yName={t.finalName}
          yFormat={(v) => fmtFixed(v, 3, locale)}
          t={t}
          locale={locale}
        />
        <SoupChart
          title={t.settleTitle}
          aria={t.settleAria}
          points={results}
          means={means}
          yKey="settle"
          yName={t.settleName}
          yFormat={(v) => fmtInt(v, locale)}
          t={t}
          locale={locale}
        />
      </div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">{t.caption(unsettled, fmtInt(SOUP_MAX_GEN, locale))}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function GameOfLife({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <LifePanel t={t} locale={locale} lang={lang} />
      <AntPanel t={t} locale={locale} />
      <SoupPanel t={t} locale={locale} />
    </div>
  )
}
