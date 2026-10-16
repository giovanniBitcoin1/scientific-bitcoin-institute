import { forwardRef, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import useExperiment from '../useExperiment.js'
import DrawToggle, { canEdit, drawCanvasClass } from '../DrawToggle.jsx'
import {
  runSpaceTime,
  diffCounts,
  singleCellRow,
  randomRow,
  langtonLambda,
  centreColumnSteps,
  mulberryBits,
  lcgBits,
  bytesFromBits,
  bitStats,
  findPeriod,
  WEAK_LCG,
} from '../ca.js'

// Elementary cellular automata, in three panels: a rule explorer with a
// space–time diagram (and a "flip one cell" twin run); a gallery of all 256
// rules from the same random row; and three bit sources, Rule 30's centre
// column, mulberry32 and a weak LCG, put through a few simple checks.

const ORANGE = '#f7931a' // cells where the flipped run differs
const INK = '#0f172a' // slate-900, live cells
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'
const INK_RGB = [15, 23, 42]
const ORANGE_RGB = [247, 147, 26]

const PRESETS = [30, 90, 110, 184, 54, 18]
const NEIGHBOURHOODS = [7, 6, 5, 4, 3, 2, 1, 0] // 111 … 000, Wolfram's order
const MAX_CANVAS_H = 640 // css px

const THUMB_W = 64
const THUMB_ROWS = 48
// Minimum thumbnail width and gap in css px: smaller on phones, where 256
// thumbnails would otherwise make a very long page.
const thumbLayout = (gridW) => (gridW < 520 ? { min: 44, gap: 6 } : { min: 80, gap: 8 })
const THUMBS_PER_FRAME = 32

const N_MIN = 1000
const N_MAX = 100000

const T = {
  en: {
    explorer: 'Rule explorer',
    rule: 'Rule',
    ruleSlider: 'Rule number',
    lambda: 'Langton λ',
    toggleBit: (nb, out) => `Neighbourhood ${nb}: output ${out}. Click to toggle.`,
    presets: 'Presets',
    initial: 'Initial row',
    inits: { single: 'Single cell', random: 'Random', draw: 'Draw your own' },
    density: 'Density of 1s',
    newRow: 'New random row',
    clear: 'Clear row',
    drawHint: 'Click or drag on the strip above the diagram to set cells of the first row. Lower the width for bigger cells.',
    stripAria: 'First row of the automaton. Click a cell to switch it on or off.',
    drawToggle: 'Draw',
    drawToggleHint: 'On a touch screen, switch Draw on to paint the strip with your finger; while it is off, swiping scrolls the page.',
    width: 'Width (cells)',
    steps: 'Time steps',
    boundary: 'Boundary',
    boundaries: { periodic: 'Periodic', fixed: 'Fixed 0' },
    speed: 'Speed (rows per frame)',
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    drawAll: 'Draw all',
    flip: 'Flip one cell',
    flipNote:
      'Runs a second copy whose first row differs in one cell: the centre cell, or, from a single cell, its right-hand neighbour. Orange cells are where the two runs disagree.',
    canvasAria: (rule) =>
      `Space–time diagram of rule ${rule}: each row is one time step, time runs downwards, live cells are dark.`,
    row: 'Row',
    live: 'Live cells in last row',
    differing: 'Differing cells in last row',
    diffTitle: 'Differing cells per row',
    diffAria: 'Line chart of the number of cells where the flipped run differs from the original, row by row.',
    tooltipT: (v) => `t = ${v}`,
    diffName: 'differing cells',
    gallery: 'Gallery of all 256 rules',
    galleryNote: (w, r) =>
      `Every rule from the same random row of ${w} cells (periodic boundary), ${r} rows each. Click a rule to load it in the explorer.`,
    newStart: 'New random start',
    filter: 'Filter by λ',
    all: 'All',
    shown: (k) => `${k} rule${k === 1 ? '' : 's'} shown`,
    rendering: 'Drawing…',
    loadRule: (r, l) => `Rule ${r}, λ = ${l}. Load it in the explorer.`,
    randomness: 'Randomness from order',
    bits: 'Number of bits N',
    newSeed: 'New seed',
    seed: 'Seed',
    sources: {
      rule30: 'Rule 30, centre column',
      mulberry: 'mulberry32',
      lcg: 'Weak LCG',
    },
    sourceNotes: {
      rule30: 'Centre cell of Rule 30 grown from a single cell, one bit per step. No seed.',
      mulberry: 'The generator used by every simulation in this course, 32 bits per call.',
      lcg: `x → (${WEAK_LCG.a}x + ${WEAK_LCG.c}) mod ${WEAK_LCG.m}, all 8 bits of x per step.`,
    },
    computing: (p) => `Computing Rule 30 … ${Math.round(p * 100)}%`,
    scatterAria: (name) =>
      `Scatter plot of consecutive bytes from ${name}: each point has the byte x_n across and the next byte x_(n+1) up.`,
    scatterAxes: 'x_n → across, x_n+1 ↑ up, 8-bit chunks',
    stat: 'Check',
    value: 'Value',
    ones: 'Share of 1s',
    runs: 'Runs',
    corr: 'Correlation r(1) … r(8)',
    blocks2: '2-bit blocks 00 · 01 · 10 · 11',
    blocks3: '3-bit blocks: largest gap from 1/8',
    period: 'Repeats',
    expect: (v, sd) => `expected ${v} ± ${sd}`,
    noise: (sd) => `noise ≈ ± ${sd}`,
    maxAbs: (v, k) => `largest |r| = ${v} at lag ${k}`,
    noPeriod: (p) => `not within ${p} bits`,
    everyP: (p) => `every ${p} bits`,
    verdictOk: 'Nothing suspicious in these simple counts.',
    verdictBad: 'Suspicious: ',
    issues: {
      period: (p) => `the sequence repeats every ${p} bits`,
      ones: 'the share of 1s is off',
      runs: (more) => (more ? 'too many runs' : 'too few runs'),
      corr: (k) => `bits ${k} apart are correlated`,
      blocks: 'some short patterns are too common',
    },
    disclaimer:
      'A simple illustration, not a formal test suite. A check is flagged when it lands more than 4 noise widths from what a fair coin would give (5 for the overlapping block counts, whose noise is larger); "repeats" looks for an exact period up to N/2. Passing these checks proves little: the weak LCG passes all of them at small N, yet its scatter plot gives it away at once.',
  },
  it: {
    explorer: 'Esplora le regole',
    rule: 'Regola',
    ruleSlider: 'Numero della regola',
    lambda: 'λ di Langton',
    toggleBit: (nb, out) => `Intorno ${nb}: risultato ${out}. Clicca per invertirlo.`,
    presets: 'Preimpostate',
    initial: 'Riga iniziale',
    inits: { single: 'Una cella', random: 'Casuale', draw: 'Disegnala tu' },
    density: 'Densità degli 1',
    newRow: 'Nuova riga casuale',
    clear: 'Svuota la riga',
    drawHint:
      'Clicca o trascina sulla striscia sopra il diagramma per impostare le celle della prima riga. Riduci la larghezza per avere celle più grandi.',
    stripAria: "Prima riga dell'automa. Clicca una cella per accenderla o spegnerla.",
    drawToggle: 'Disegna',
    drawToggleHint: 'Su uno schermo touch, attiva Disegna per dipingere la striscia con il dito; quando è spento, scorrere fa scorrere la pagina.',
    width: 'Larghezza (celle)',
    steps: 'Passi temporali',
    boundary: 'Bordo',
    boundaries: { periodic: 'Periodico', fixed: 'Fisso a 0' },
    speed: 'Velocità (righe per fotogramma)',
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    drawAll: 'Disegna tutto',
    flip: 'Inverti una cella',
    flipNote:
      "Esegue una seconda copia la cui prima riga differisce in una sola cella: quella centrale o, partendo da una sola cella, la sua vicina di destra. Le celle arancioni sono quelle in cui le due evoluzioni non coincidono.",
    canvasAria: (rule) =>
      `Diagramma spazio–tempo della regola ${rule}: ogni riga è un passo temporale, il tempo scorre verso il basso, le celle vive sono scure.`,
    row: 'Riga',
    live: "Celle vive nell'ultima riga",
    differing: "Celle diverse nell'ultima riga",
    diffTitle: 'Celle diverse per riga',
    diffAria:
      "Grafico a linee del numero di celle in cui l'evoluzione con la cella invertita differisce dall'originale, riga per riga.",
    tooltipT: (v) => `t = ${v}`,
    diffName: 'celle diverse',
    gallery: 'Galleria delle 256 regole',
    galleryNote: (w, r) =>
      `Tutte le regole a partire dalla stessa riga casuale di ${w} celle (bordo periodico), ${r} righe ciascuna. Clicca una regola per caricarla nell'esploratore.`,
    newStart: 'Nuovo inizio casuale',
    filter: 'Filtra per λ',
    all: 'Tutte',
    shown: (k) => `${k} regol${k === 1 ? 'a mostrata' : 'e mostrate'}`,
    rendering: 'Disegno in corso…',
    loadRule: (r, l) => `Regola ${r}, λ = ${l}. Caricala nell'esploratore.`,
    randomness: "Casualità dall'ordine",
    bits: 'Numero di bit N',
    newSeed: 'Nuovo seme',
    seed: 'Seme',
    sources: {
      rule30: 'Regola 30, colonna centrale',
      mulberry: 'mulberry32',
      lcg: 'LCG debole',
    },
    sourceNotes: {
      rule30: 'Cella centrale della regola 30 cresciuta da una sola cella, un bit per passo. Nessun seme.',
      mulberry: 'Il generatore usato da tutte le simulazioni di questo corso, 32 bit per chiamata.',
      lcg: `x → (${WEAK_LCG.a}x + ${WEAK_LCG.c}) mod ${WEAK_LCG.m}, tutti gli 8 bit di x a ogni passo.`,
    },
    computing: (p) => `Calcolo della regola 30 … ${Math.round(p * 100)}%`,
    scatterAria: (name) =>
      `Grafico a dispersione dei byte consecutivi di ${name}: ogni punto ha il byte x_n in orizzontale e il byte successivo x_(n+1) in verticale.`,
    scatterAxes: 'x_n → in orizzontale, x_n+1 ↑ in verticale, blocchi di 8 bit',
    stat: 'Controllo',
    value: 'Valore',
    ones: 'Quota di 1',
    runs: 'Sequenze (run)',
    corr: 'Correlazione r(1) … r(8)',
    blocks2: 'Blocchi di 2 bit 00 · 01 · 10 · 11',
    blocks3: 'Blocchi di 3 bit: scarto massimo da 1/8',
    period: 'Si ripete',
    expect: (v, sd) => `atteso ${v} ± ${sd}`,
    noise: (sd) => `rumore ≈ ± ${sd}`,
    maxAbs: (v, k) => `|r| massimo = ${v} al ritardo ${k}`,
    noPeriod: (p) => `non entro ${p} bit`,
    everyP: (p) => `ogni ${p} bit`,
    verdictOk: 'Niente di sospetto in questi semplici conteggi.',
    verdictBad: 'Sospetto: ',
    issues: {
      period: (p) => `la sequenza si ripete ogni ${p} bit`,
      ones: 'la quota di 1 è sbilanciata',
      runs: (more) => (more ? 'troppe sequenze' : 'troppo poche sequenze'),
      corr: (k) => `i bit a distanza ${k} sono correlati`,
      blocks: 'alcuni schemi brevi sono troppo frequenti',
    },
    disclaimer:
      "Una semplice illustrazione, non una batteria di test formali. Un controllo viene segnalato quando si scosta più di 4 volte il rumore da ciò che darebbe una moneta equa (5 per i conteggi di blocchi sovrapposti, il cui rumore è maggiore); «si ripete» cerca un periodo esatto fino a N/2. Superare questi controlli dimostra poco: l'LCG debole li supera tutti per N piccolo, eppure il suo grafico a dispersione lo smaschera subito.",
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)

const bitString = (n) => n.toString(2).padStart(3, '0')

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

// One pixel per cell: 1s dark, 0s white, and cells listed in `diff` orange.
function cellsToCanvas(width, rows, cells, diff) {
  const off = document.createElement('canvas')
  off.width = width
  off.height = rows
  const ctx = off.getContext('2d')
  const img = ctx.createImageData(width, rows)
  const px = img.data
  for (let i = 0, n = width * rows; i < n; i++) {
    const rgb = diff && diff[i] ? ORANGE_RGB : cells[i] ? INK_RGB : null
    const o = 4 * i
    px[o] = rgb ? rgb[0] : 255
    px[o + 1] = rgb ? rgb[1] : 255
    px[o + 2] = rgb ? rgb[2] : 255
    px[o + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return off
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

const chip = (active) =>
  `px-2.5 py-1 rounded-full border text-xs font-mono tabular-nums transition-colors ${
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

// ---------------------------------------------------------------- Panel A

const cellBox = (on) =>
  `block w-4 h-4 border ${on ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`

// Three input cells above the output cell; the output is a toggle button.
function RuleIcons({ rule, setRule, t }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-4 sm:gap-x-5 gap-y-3 w-fit">
      {NEIGHBOURHOODS.map((n) => {
        const out = (rule >> n) & 1
        return (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5" aria-hidden="true">
              {[4, 2, 1].map((b) => (
                <span key={b} className={cellBox(n & b)} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRule(rule ^ (1 << n))}
              aria-pressed={!!out}
              aria-label={t.toggleBit(bitString(n), out)}
              className="p-1 -m-1 rounded hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span className={`${cellBox(out)} ${out ? '' : 'hover:border-orange-400'}`} />
            </button>
            <span className="font-mono text-[10px] leading-none text-slate-500">{out}</span>
          </div>
        )
      })}
    </div>
  )
}

function RuleInput({ rule, setRule, t, locale }) {
  const [text, setText] = useState(String(rule))
  useEffect(() => setText(String(rule)), [rule])
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {t.rule}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={255}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const v = Number(e.target.value)
            if (e.target.value !== '' && Number.isInteger(v) && v >= 0 && v <= 255) setRule(v)
          }}
          onBlur={() => setText(String(rule))}
          className="w-20 rounded border border-slate-300 px-2 py-1 font-mono text-sm text-slate-900 tabular-nums focus:outline-none focus:border-orange-500"
        />
      </label>
      <span className="font-mono text-sm text-slate-600 tabular-nums">{rule.toString(2).padStart(8, '0')}</span>
      <span className="font-mono text-sm text-slate-900 tabular-nums">
        {t.lambda} = {fmtFixed(langtonLambda(rule), 3, locale)}
      </span>
    </div>
  )
}

// Display size of the space–time diagram: an integer number of device pixels
// per cell when the diagram fits, otherwise scaled down to the available width.
function diagramSize(cols, rows, availW) {
  const dpr = window.devicePixelRatio || 1
  const k = Math.floor(Math.min((availW * dpr) / cols, (MAX_CANVAS_H * dpr) / rows))
  if (k >= 1) return { cssW: (cols * k) / dpr, cssH: (rows * k) / dpr, down: false }
  const s = Math.min(availW / cols, MAX_CANVAS_H / rows)
  return { cssW: cols * s, cssH: rows * s, down: true }
}

const RuleExplorer = forwardRef(function RuleExplorer({ t, locale, rule, setRule }, ref) {
  const [width, setWidth] = useState(301)
  const [steps, setSteps] = useState(300)
  const [boundary, setBoundary] = useState('periodic')
  const [init, setInit] = useState('single')
  const [density, setDensity] = useState(0.5)
  const [rowSeed, setRowSeed] = useState(1)
  const [drawn, setDrawn] = useState([0]) // offsets from the centre cell
  const [drawOn, setDrawOn] = useState(false) // touch drawing armed
  const [flip, setFlip] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  const [shown, setShown] = useState(301)

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const stripRef = useRef(null)
  const acc = useRef(0)
  const paint = useRef(null)
  const avail = useElementWidth(wrapRef)

  const rows = steps + 1
  const periodic = boundary === 'periodic'
  const centre = width >> 1
  // Flipping the centre of a single-cell row would leave the twin empty, so
  // there the twin gets its right-hand neighbour switched on instead.
  const flipAt = init === 'single' ? centre + 1 : centre

  const initial = useMemo(() => {
    if (init === 'single') return singleCellRow(width)
    if (init === 'random') return randomRow(width, density, rowSeed)
    const row = new Uint8Array(width)
    for (const d of drawn) if (centre + d >= 0 && centre + d < width) row[centre + d] = 1
    return row
  }, [init, width, density, rowSeed, drawn, centre])

  const st = useMemo(() => runSpaceTime(initial, steps, rule, periodic), [initial, steps, rule, periodic])
  const twin = useMemo(() => {
    if (!flip) return null
    const other = initial.slice()
    other[flipAt] ^= 1
    const b = runSpaceTime(other, steps, rule, periodic)
    const mask = new Uint8Array(st.cells.length)
    for (let i = 0; i < mask.length; i++) mask[i] = st.cells[i] ^ b.cells[i]
    return { mask, counts: diffCounts(st, b) }
  }, [flip, initial, flipAt, steps, rule, periodic, st])

  const image = useMemo(
    () => cellsToCanvas(st.width, st.rows, st.cells, twin && twin.mask),
    [st, twin],
  )

  // A new configuration is shown in full; Play then redraws it row by row.
  useEffect(() => {
    setPlaying(false)
    setShown(rows)
  }, [rule, width, steps, boundary, init, density, rowSeed, drawn, rows])

  const t1 = clamp(shown, 1, rows)
  const size = avail ? diagramSize(width, rows, avail) : null

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !size) return
    // Scaling down averages cells into greys, which reads better than dropping them.
    const ctx = prepareCanvas(canvas, size.cssW, size.cssH, size.down)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const h = (t1 / rows) * canvas.height
    ctx.drawImage(image, 0, 0, width, t1, 0, 0, canvas.width, h)
  }

  const drawStrip = () => {
    const canvas = stripRef.current
    if (!canvas || !size) return
    const ctx = prepareCanvas(canvas, size.cssW, 28)
    const W = canvas.width
    const H = canvas.height
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    const x = (i) => Math.round((i * W) / width)
    ctx.fillStyle = INK
    for (let i = 0; i < width; i++) if (initial[i]) ctx.fillRect(x(i), 0, x(i + 1) - x(i), H)
    if (W / width >= 4) {
      // Cell borders, only when cells are wide enough to see them.
      ctx.fillStyle = GRID
      for (let i = 1; i < width; i++) ctx.fillRect(x(i), 0, 1, H)
    }
    ctx.fillStyle = ORANGE
    ctx.fillRect(x(centre), H - 3, x(centre + 1) - x(centre), 3)
  }

  useEffect(() => {
    draw()
    if (init === 'draw') drawStrip()
  })

  useAnimationLoop(() => {
    acc.current += speed
    const add = Math.floor(acc.current)
    if (!add) return
    acc.current -= add
    setShown((v) => Math.min(v + add, rows))
  }, playing)

  useEffect(() => {
    if (playing && t1 >= rows) setPlaying(false)
  }, [playing, t1, rows])

  const onPlayPause = () => {
    if (playing) return setPlaying(false)
    if (t1 >= rows) setShown(1)
    acc.current = 0
    setPlaying(true)
  }

  // Drawing the first row: the cell under the pointer takes the value chosen
  // when the press started, so a drag paints (or erases) a stretch of cells.
  const cellAt = (e) => {
    const r = stripRef.current.getBoundingClientRect()
    return clamp(Math.floor(((e.clientX - r.left) / r.width) * width), 0, width - 1)
  }
  // Sets cells a … b (in either order), so a fast drag leaves no gaps.
  const setCells = (a, b, on) => {
    const lo = Math.min(a, b) - centre
    const hi = Math.max(a, b) - centre
    setDrawn((prev) => {
      const set = new Set(prev)
      for (let d = lo; d <= hi; d++) {
        if (on) set.add(d)
        else set.delete(d)
      }
      return set.size === prev.length && prev.every((d) => set.has(d)) ? prev : [...set]
    })
  }
  const onPointerDown = (e) => {
    if (!canEdit(drawOn, e)) return
    const i = cellAt(e)
    paint.current = { on: !initial[i], last: i }
    e.currentTarget.setPointerCapture(e.pointerId)
    setCells(i, i, paint.current.on)
  }
  const onPointerMove = (e) => {
    const p = paint.current
    if (!p) return
    const i = cellAt(e)
    if (i === p.last) return
    setCells(p.last, i, p.on)
    p.last = i
  }
  const onPointerUp = () => {
    paint.current = null
  }

  // The chart follows a deferred copy of the visible rows, so it never slows the animation.
  const chartT = useDeferredValue(t1)
  const diffData = useMemo(() => {
    if (!twin) return []
    return Array.from({ length: chartT }, (_, i) => ({ t: i, d: twin.counts[i] }))
  }, [twin, chartT])

  let live = 0
  for (let i = (t1 - 1) * width, end = t1 * width; i < end; i++) live += st.cells[i]

  return (
    <div ref={ref} className={`${panel} scroll-mt-28`}>
      <PanelTitle>A · {t.explorer}</PanelTitle>

      <div className="mt-4 space-y-4">
        <RuleInput rule={rule} setRule={setRule} t={t} locale={locale} />
        <Slider label={t.ruleSlider} min={0} max={255} step={1} value={rule} onChange={setRule} />
        <RuleIcons rule={rule} setRule={setRule} t={t} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700 mr-1">{t.presets}</span>
          {PRESETS.map((p) => (
            <button key={p} type="button" className={chip(rule === p)} aria-pressed={rule === p} onClick={() => setRule(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{t.initial}</span>
          <Tabs options={['single', 'random', 'draw']} value={init} onChange={setInit} labels={t.inits} />
        </div>
        {init === 'random' && (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Slider
              label={t.density}
              min={0.01}
              max={0.99}
              step={0.01}
              value={density}
              onChange={setDensity}
              format={(v) => fmtFixed(v, 2, locale)}
            />
            <SimControls onReset={() => setRowSeed((s) => s + 1)} labels={{ reset: t.newRow }} />
          </div>
        )}
        {init === 'draw' && (
          <div className="flex flex-wrap items-center gap-3">
            <SimControls onReset={() => setDrawn([])} labels={{ reset: t.clear }} />
            <DrawToggle on={drawOn} onChange={setDrawOn} label={t.drawToggle} />
            <p className="text-xs text-slate-500 leading-relaxed flex-1 min-w-[12rem]">
              {t.drawHint} {t.drawToggleHint}
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label={t.width} min={50} max={600} step={1} value={width} onChange={setWidth} />
          <Slider label={t.steps} min={50} max={600} step={1} value={steps} onChange={setSteps} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{t.boundary}</span>
          <Tabs options={['periodic', 'fixed']} value={boundary} onChange={setBoundary} labels={t.boundaries} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <div className="flex flex-wrap gap-2">
          <SimControls
            playing={playing}
            onPlayPause={onPlayPause}
            onStep={() => setShown((v) => Math.min(clamp(v, 1, rows) + 1, rows))}
            onReset={() => {
              setPlaying(false)
              setShown(1)
            }}
            labels={t.controls}
          />
          <SimControls
            onReset={() => {
              setPlaying(false)
              setShown(rows)
            }}
            labels={{ reset: t.drawAll }}
          />
        </div>
        <Slider
          label={t.speed}
          min={0.25}
          max={10}
          log
          value={speed}
          onChange={setSpeed}
          format={(v) => fmtFixed(v, v < 1 ? 2 : v < 10 ? 1 : 0, locale)}
        />
      </div>

      <label className="mt-4 flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={flip}
          onChange={(e) => setFlip(e.target.checked)}
          className="mt-1 accent-orange-600"
        />
        <span>
          <span className="text-sm font-medium text-slate-700">{t.flip}</span>
          <span className="block text-xs text-slate-500 leading-relaxed">{t.flipNote}</span>
        </span>
      </label>

      <div ref={wrapRef} className="mt-4 min-w-0">
        {init === 'draw' && (
          <canvas
            ref={stripRef}
            role="img"
            aria-label={t.stripAria}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={`block mx-auto mb-1.5 border border-orange-300 cursor-crosshair ${drawCanvasClass(drawOn)}`}
          />
        )}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria(rule)}
          className="block mx-auto bg-white outline outline-1 outline-slate-200"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.row}>
          {t1 - 1} <span className="text-slate-500">/ {steps}</span>
        </Stat>
        <Stat label={t.live}>{live}</Stat>
        {twin && <Stat label={t.differing}>{twin.counts[t1 - 1]}</Stat>}
      </div>

      {twin && (
        <div className="mt-6 min-w-0">
          <PanelTitle>{t.diffTitle}</PanelTitle>
          <div className="mt-3 h-48 -ml-4" role="img" aria-label={t.diffAria}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diffData} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="t" type="number" domain={[0, steps]} tick={axisTick} stroke={MUTED} />
                <YAxis domain={[0, 'auto']} allowDecimals={false} width={44} tick={axisTick} stroke={MUTED} />
                <Tooltip
                  formatter={(v) => [v, t.diffName]}
                  labelFormatter={t.tooltipT}
                  contentStyle={tooltipStyle}
                />
                <Line type="linear" dataKey="d" stroke={ORANGE} strokeWidth={1.75} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
})

// ---------------------------------------------------------------- Panel B

function Gallery({ t, locale, rule, onPick }) {
  const [seed, setSeed] = useState(1)
  const [filter, setFilter] = useState(null) // null = all, else number of 1s in the rule (λ = k/8)
  const [done, setDone] = useState(0)
  const gridRef = useRef(null)
  const canvases = useRef([])
  const images = useRef([])
  const gridW = useElementWidth(gridRef)

  const { min, gap } = thumbLayout(gridW)
  const cols = Math.max(1, Math.floor((gridW + gap) / (min + gap)))
  const thumbW = gridW ? (gridW - (cols - 1) * gap) / cols : 0
  const thumbH = (thumbW * THUMB_ROWS) / THUMB_W

  // The drawing loop outlives the render it started in, so it reads the size from a ref.
  const sizeRef = useRef({ w: 0, h: 0 })
  sizeRef.current = { w: thumbW, h: thumbH }

  const blit = (r) => {
    const canvas = canvases.current[r]
    const img = images.current[r]
    const { w, h } = sizeRef.current
    if (!canvas || !img || !w) return
    const ctx = prepareCanvas(canvas, w, h)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  // Compute and draw the thumbnails a few dozen per frame.
  useEffect(() => {
    const row = randomRow(THUMB_W, 0.5, 7000 + seed)
    images.current = []
    setDone(0)
    let r = 0
    let frame
    const work = () => {
      const end = Math.min(256, r + THUMBS_PER_FRAME)
      for (; r < end; r++) {
        const st = runSpaceTime(row, THUMB_ROWS - 1, r, true)
        images.current[r] = cellsToCanvas(st.width, st.rows, st.cells)
        blit(r)
      }
      setDone(r)
      if (r < 256) frame = requestAnimationFrame(work)
    }
    frame = requestAnimationFrame(work)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  // Redraw everything when the thumbnails change size.
  useEffect(() => {
    for (let r = 0; r < 256; r++) blit(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbW])

  const ones = (r) => {
    let k = 0
    for (let n = 0; n < 8; n++) k += (r >> n) & 1
    return k
  }
  const visible = (r) => filter == null || ones(r) === filter
  let count = 0
  for (let r = 0; r < 256; r++) if (visible(r)) count++

  return (
    <div className={panel}>
      <PanelTitle>B · {t.gallery}</PanelTitle>
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">{t.galleryNote(THUMB_W, THUMB_ROWS)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 mr-1">{t.filter}</span>
        <button type="button" className={chip(filter == null)} aria-pressed={filter == null} onClick={() => setFilter(null)}>
          {t.all}
        </button>
        {Array.from({ length: 9 }, (_, k) => (
          <button key={k} type="button" className={chip(filter === k)} aria-pressed={filter === k} onClick={() => setFilter(k)}>
            {k}/8
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newStart }} />
        <span className="font-mono text-xs text-slate-500" aria-live="polite">
          {done < 256 ? t.rendering : t.shown(count)}
        </span>
      </div>
      {done < 256 && <ProgressBar progress={done / 256} />}

      <div
        ref={gridRef}
        className="mt-4 grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
      >
        {Array.from({ length: 256 }, (_, r) => (
          <button
            key={r}
            type="button"
            hidden={!visible(r)}
            onClick={() => onPick(r)}
            aria-label={t.loadRule(r, fmtFixed(langtonLambda(r), 3, locale))}
            aria-pressed={rule === r}
            className="group min-w-0 text-left"
          >
            <canvas
              ref={(el) => {
                canvases.current[r] = el
              }}
              className={`block w-full border ${
                rule === r ? 'border-orange-500 ring-2 ring-orange-400' : 'border-slate-200 group-hover:border-orange-400'
              }`}
              style={{ aspectRatio: `${THUMB_W} / ${THUMB_ROWS}` }}
            />
            <span
              className={`block mt-0.5 font-mono text-[11px] tabular-nums ${
                rule === r ? 'text-orange-600 font-semibold' : 'text-slate-500 group-hover:text-orange-600'
              }`}
            >
              {r}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

// Rule 30's centre column is the same for every visit, so it is computed once
// (for the largest N) and shared; smaller N use its first bits.
let rule30Bits = null

function makeRule30Job() {
  const out = new Uint8Array(N_MAX)
  const iter = (function* run() {
    yield* centreColumnSteps(30, N_MAX, out)
    rule30Bits = out
  })()
  return { iter, snapshot: () => rule30Bits }
}

// Verdict from the checks: the reasons for suspicion, or none.
function issuesOf(s, period, t, locale) {
  const issues = []
  if (period) issues.push(t.issues.period(fmtInt(period, locale)))
  if (Math.abs(s.fracOnes - 0.5) > 4 * s.fracSd) issues.push(t.issues.ones)
  if (Math.abs(s.runs - s.runsExpected) > 4 * s.runsSd) issues.push(t.issues.runs(s.runs > s.runsExpected))
  const lags = []
  s.autocorr.forEach((r, i) => {
    if (Math.abs(r) > 4 * s.autocorrSd) lags.push(i + 1)
  })
  if (lags.length) issues.push(t.issues.corr(lags.join(', ')))
  const blockOff = (b, p) => b.freq.some((f) => Math.abs(f - p) > 5 * Math.sqrt((p * (1 - p)) / b.total))
  if (blockOff(s.blocks2, 1 / 4) || blockOff(s.blocks3, 1 / 8)) issues.push(t.issues.blocks)
  return issues
}

function analyse(bits) {
  const s = bitStats(bits)
  const period = findPeriod(bits)
  const bytes = bytesFromBits(bits)
  return { s, period, bytes }
}

// Consecutive bytes (x_n, x_(n+1)) as points on a 256 × 256 grid, each one a
// square cell, with x_(n+1) growing upwards.
function PairScatter({ bytes, aria }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const w = useElementWidth(wrapRef)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !w) return
    const ctx = prepareCanvas(canvas, w, w)
    const S = canvas.width
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, S, S)
    if (!bytes) return
    const cell = Math.max(1, Math.ceil(S / 256))
    ctx.fillStyle = INK
    ctx.beginPath()
    for (let k = 0; k + 1 < bytes.length; k++) {
      const x = Math.floor((bytes[k] * S) / 256)
      const y = S - cell - Math.floor((bytes[k + 1] * S) / 256)
      ctx.rect(x, y, cell, cell)
    }
    ctx.fill()
  }, [bytes, w])
  return (
    <div ref={wrapRef} className="min-w-0">
      <canvas ref={canvasRef} role="img" aria-label={aria} className="block w-full outline outline-1 outline-slate-200" />
    </div>
  )
}

// r(1) … r(8) as bars around zero, with the ±2 noise band shaded.
function CorrBars({ values, sd }) {
  const W = 96
  const H = 28
  const top = Math.max(4 * sd, ...values.map((v) => Math.abs(v) || 0))
  const y = (v) => H / 2 - (v / top) * (H / 2 - 1)
  const bw = W / values.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-24 h-7" aria-hidden="true">
      <rect x="0" y={y(2 * sd)} width={W} height={y(-2 * sd) - y(2 * sd)} fill="#f1f5f9" />
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke={MUTED} strokeWidth="0.75" />
      {values.map((v, i) => {
        const hot = Math.abs(v) > 4 * sd
        return (
          <rect
            key={i}
            x={i * bw + 1.5}
            width={bw - 3}
            y={Math.min(y(v), H / 2)}
            height={Math.max(0.75, Math.abs(y(v) - H / 2))}
            fill={hot ? ORANGE : INK}
          />
        )
      })}
    </svg>
  )
}

function SourceCard({ name, note, result, t, locale, pending }) {
  const { s, period, bytes } = result || {}
  const issues = result ? issuesOf(s, period, t, locale) : []
  const f = (v, d) => fmtFixed(v, d, locale)
  let maxK = 0
  if (s) {
    for (let i = 1; i < s.autocorr.length; i++) if (Math.abs(s.autocorr[i]) > Math.abs(s.autocorr[maxK])) maxK = i
  }
  const gap3 = s ? Math.max(...s.blocks3.freq.map((x) => Math.abs(x - 1 / 8))) : NaN

  return (
    <div className="rounded-lg border border-slate-200 p-3 sm:p-4 min-w-0 flex flex-col">
      <p className="font-mono text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{note}</p>
      <div className="mt-3">
        <PairScatter bytes={bytes} aria={t.scatterAria(name)} />
        <p className="mt-1 font-mono text-[10px] text-slate-500">{t.scatterAxes}</p>
      </div>
      {pending ? (
        <p className="mt-3 font-mono text-xs text-slate-500" aria-live="polite">
          {pending}
        </p>
      ) : (
        <>
          <table className="mt-3 w-full text-xs">
            <thead className="sr-only">
              <tr>
                <th>{t.stat}</th>
                <th>{t.value}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              <tr>
                <td className="py-1.5 pr-2 text-slate-600">
                  {t.ones}
                  <span className="block text-[10px] text-slate-400">{t.expect(f(0.5, 1), f(s.fracSd, 4))}</span>
                </td>
                <td className="py-1.5 font-mono text-slate-900 tabular-nums text-right">{f(s.fracOnes, 4)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 text-slate-600">
                  {t.runs}
                  <span className="block text-[10px] text-slate-400">
                    {t.expect(fmtInt(s.runsExpected, locale), fmtInt(s.runsSd, locale))}
                  </span>
                </td>
                <td className="py-1.5 font-mono text-slate-900 tabular-nums text-right">{fmtInt(s.runs, locale)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 text-slate-600">
                  {t.corr}
                  <span className="block text-[10px] text-slate-400">
                    {t.maxAbs(f(Math.abs(s.autocorr[maxK]), 4), maxK + 1)}; {t.noise(f(s.autocorrSd, 4))}
                  </span>
                </td>
                <td className="py-1.5">
                  <div className="flex justify-end">
                    <CorrBars values={s.autocorr} sd={s.autocorrSd} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 text-slate-600" colSpan={2}>
                  {t.blocks2}
                  <span className="block font-mono text-slate-900 tabular-nums">
                    {s.blocks2.freq.map((x) => f(x, 3)).join(' · ')}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 text-slate-600">
                  {t.blocks3}
                  <span className="block text-[10px] text-slate-400">
                    {t.noise(f(Math.sqrt((1 / 8) * (7 / 8) / s.blocks3.total), 4))}
                  </span>
                </td>
                <td className="py-1.5 font-mono text-slate-900 tabular-nums text-right">{f(gap3, 4)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 text-slate-600">{t.period}</td>
                <td className="py-1.5 font-mono text-slate-900 tabular-nums text-right">
                  {period ? t.everyP(fmtInt(period, locale)) : t.noPeriod(fmtInt(s.n >> 1, locale))}
                </td>
              </tr>
            </tbody>
          </table>
          <p
            className={`mt-3 text-sm leading-snug ${issues.length ? 'text-orange-700' : 'text-slate-700'}`}
            aria-live="polite"
          >
            {issues.length ? `${t.verdictBad}${issues.join('; ')}.` : t.verdictOk}
          </p>
        </>
      )}
    </div>
  )
}

function Randomness({ t, locale }) {
  const [nSel, setNSel] = useState(20000)
  const [seed, setSeed] = useState(1)
  const exp = useExperiment()
  const ready = rule30Bits || exp.data

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!rule30Bits) exp.run(makeRule30Job())
  }, [])

  const n = useDeferredValue(nSel)
  const r30 = useMemo(() => (ready ? analyse(ready.subarray(0, n)) : null), [ready, n])
  const mul = useMemo(() => analyse(mulberryBits(n, seed)), [n, seed])
  const lcg = useMemo(() => analyse(lcgBits(n, seed)), [n, seed])

  return (
    <div className={panel}>
      <PanelTitle>C · {t.randomness}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider
          label={t.bits}
          min={N_MIN}
          max={N_MAX}
          log
          value={nSel}
          onChange={(v) => setNSel(clamp(Math.round(v / 1000) * 1000, N_MIN, N_MAX))}
          format={(v) => fmtInt(v, locale)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-slate-600 tabular-nums">
            {t.seed} {seed}
          </span>
          <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newSeed }} />
        </div>
      </div>
      {!ready && <ProgressBar progress={exp.progress} />}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SourceCard
          name={t.sources.rule30}
          note={t.sourceNotes.rule30}
          result={r30}
          pending={ready ? null : t.computing(exp.progress)}
          t={t}
          locale={locale}
        />
        <SourceCard name={t.sources.mulberry} note={t.sourceNotes.mulberry} result={mul} t={t} locale={locale} />
        <SourceCard name={t.sources.lcg} note={t.sourceNotes.lcg} result={lcg} t={t} locale={locale} />
      </div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">{t.disclaimer}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function CellularAutomata({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  const [rule, setRule] = useState(30)
  const explorerRef = useRef(null)

  const pick = (r) => {
    setRule(r)
    explorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <RuleExplorer ref={explorerRef} t={t} locale={locale} rule={rule} setRule={setRule} />
      <Gallery t={t} locale={locale} rule={rule} onPick={pick} />
      <Randomness t={t} locale={locale} />
    </div>
  )
}
