import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
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
import { pdf, ccdfSorted, paretoMLE } from '../distributions.js'
import {
  sortedCopy,
  giniSorted,
  lorenzSorted,
  median,
  mean,
  topShare,
  histogram,
  SUGAR_SIDE,
  SUGAR_MAX,
  SUGAR_DEFAULTS,
  createSugarscape,
  sugarscapeStep,
  sugarWealth,
  EXCHANGE_MODELS,
  EXCHANGE_DEFAULTS,
  createExchange,
  exchangeTrades,
  sweeps,
  GROWTH_DEFAULTS,
  growthAlpha,
  createGrowth,
  growthStep,
} from '../wealth.js'

// Wealth and inequality, in three panels: Sugarscape, agents harvesting a
// landscape; kinetic exchange models, where each trade is a collision; and
// the Bouchaud–Mézard model of multiplicative growth with exchange.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const SLATE_DARK = '#475569' // slate-600
const SLATE_LIGHT = '#cbd5e1' // slate-300
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

const MAX_CANVAS = 500 // css px
const HIST_MAX = 600 // points in the history charts

// Panel A: sugar 0 … 4 from near-white to a pale sand.
const SUGAR_LOW = [248, 250, 252] // slate-50
const SUGAR_HIGH = [245, 208, 140]

// Panel B
const HIST_HI = 6 // wealth histogram on [0, 6] times the mean
const HIST_BINS = 30

// Panel C
const MAX_STEPS = 5000 // past this, fortunes with J = 0 leave the floating-point range

const T = {
  en: {
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    seed: 'Seed',
    stepLabel: 'step',
    sweepLabel: 'sweep',
    population: 'Population',
    meanW: 'Mean wealth',
    medianW: 'Median wealth',
    gini: 'Gini coefficient',
    top10: 'Top 10% share',
    richest: 'Richest agent',
    giniChart: 'Gini coefficient over time',
    giniAria: 'The Gini coefficient against time.',
    lorenzChart: 'Lorenz curve',
    lorenzAria: 'Lorenz curve: share of all wealth held by the poorest fraction of agents, with the diagonal of perfect equality dashed.',
    lorenzLine: 'Lorenz curve',
    equality: 'perfect equality',
    poorest: 'poorest share of agents',
    held: 'share of wealth',

    sugar: 'Sugarscape',
    agents: 'Agents',
    regrowth: 'Regrowth per step',
    visionMax: 'Maximum vision',
    metabolismMax: 'Maximum metabolism',
    endowMin: 'Initial sugar, from',
    endowMax: 'Initial sugar, to',
    lifespan: 'Finite lifespans',
    onOff: { off: 'Off', on: 'On' },
    ageMin: 'Lifespan, from',
    ageMax: 'Lifespan, to',
    speed: 'Steps per second',
    sugarNote:
      'A 50 × 50 landscape that wraps around at the edges, with two sugar peaks; each cell holds 0 to 4 units. Each step, in random order, every agent looks along the four lattice directions as far as its vision allows, moves to the nearest unoccupied cell with the most sugar (its own included), harvests all of it and burns its metabolism. An agent whose sugar falls below zero dies. Then every cell regrows, up to its capacity. Vision, metabolism and initial sugar are drawn uniformly. With finite lifespans each agent also dies at an age drawn from the range, and every agent that dies is replaced by a newcomer, so the population stays constant.',
    sugarAria: 'The sugar landscape in pale tints, darker where there is more sugar, with agents as small slate dots; the richest tenth of the agents are ringed in orange.',
    sugarKey: (v) => `sugar ${v}`,
    agentKey: 'agent',
    richKey: 'richest 10%',
    deaths: (s, a, b) => `Died of hunger: ${s} · of old age: ${a} · newcomers: ${b}`,
    histChart: 'Wealth distribution',
    histAria: 'Bar chart of the share of agents in each range of sugar held.',
    shareAgents: 'share of agents',
    sugarRange: (lo, hi) => `sugar ${lo}–${hi}`,

    exchange: 'Trading as collisions',
    model: 'Model',
    models: {
      random: 'Random exchange',
      saving: 'Saving λ',
      yardsale: 'Yard sale f',
      redistribute: 'Yard sale + redistribution χ',
    },
    modelNotes: {
      random:
        'Two agents chosen at random pool their money and split it at a uniformly random point. Money is conserved and nobody goes into debt. Everyone starts with the same amount.',
      saving:
        'Each of the two keeps a fraction λ of its money; the rest is pooled and split at a random point.',
      yardsale:
        'A fair coin decides which of the two wins; the winner takes a fraction f of the poorer partner’s wealth. Every trade is fair: the expected gain is zero for both.',
      redistribute:
        'The yard sale, and after every N trades each agent’s wealth moves a fraction χ of the way towards the mean.',
    },
    N: 'Agents N',
    lambda: 'Saving propensity λ',
    f: 'Stake f',
    chi: 'Redistribution χ per sweep',
    tradesPerFrame: 'Trades per frame',
    sweepNote: 'Time is counted in sweeps of N trades: on average each agent trades twice per sweep.',
    sweepStat: 'Sweeps',
    logY: 'Log y',
    histChart2: 'Wealth distribution',
    hist2Aria: 'Dots for the share of agents per unit of wealth, against wealth in units of the mean; for random exchange the exponential prediction is drawn as a line.',
    wealthAxis: 'wealth / mean',
    density: 'density',
    expLine: 'exponential, e^(−w)',
    simDots: 'simulation',
    above: (k, h) => `${k} agents hold more than ${h} times the mean (off the chart).`,
    halfRef: 'G = ½, the exponential',
    richChart: 'Share of the richest agent over time',
    richAria: 'The share of all wealth held by the single richest agent, against time.',

    growth: 'Multiplicative growth',
    sigma: 'Volatility σ',
    J: 'Coupling J',
    r: 'Average growth per step',
    N2: 'Agents N',
    stepsPerFrame: 'Steps per frame',
    growthNote:
      'Each step every fortune is multiplied by an independent random lognormal factor: on average it grows by the rate set above, and its logarithm has variance 2σ². Then each agent receives J times the gap between the mean and its own wealth (an exchange with everyone else, which leaves the total unchanged). Bouchaud and Mézard’s mean-field theory predicts a Pareto tail with exponent 1 + J/σ².',
    stepStat: 'Step',
    alphaHat: 'Tail exponent, MLE',
    alphaTheory: 'Theory, 1 + J/σ²',
    noTheory: 'J = 0: no steady state',
    tailN: (n) => `${n} agents above x_min`,
    ccdfChart: 'Tail of the wealth distribution',
    ccdfKey: 'P(W ≥ w): share of agents with at least w times the mean wealth',
    ccdfAria: 'Log–log plot of the share of agents with at least w times the mean wealth, with the theoretical slope drawn from x_min.',
    xMin: 'x_min, in units of the mean',
    theoryLine: (a) => `slope −${a}, theory`,
    xMinLine: 'x_min',
    meanMedChart: 'Mean and median wealth over time',
    meanMedAria: 'Mean and median wealth against time, on a logarithmic scale.',
    meanLine: 'mean',
    medianLine: 'median',
    stopped: (n) => `Stopped at ${n} steps.`,
  },
  it: {
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    seed: 'Seme',
    stepLabel: 'passo',
    sweepLabel: 'giro',
    population: 'Popolazione',
    meanW: 'Ricchezza media',
    medianW: 'Ricchezza mediana',
    gini: 'Coefficiente di Gini',
    top10: 'Quota del 10% più ricco',
    richest: 'Agente più ricco',
    giniChart: 'Coefficiente di Gini nel tempo',
    giniAria: 'Il coefficiente di Gini contro il tempo.',
    lorenzChart: 'Curva di Lorenz',
    lorenzAria: 'Curva di Lorenz: quota della ricchezza totale posseduta dalla frazione più povera degli agenti, con la diagonale dell’uguaglianza perfetta tratteggiata.',
    lorenzLine: 'curva di Lorenz',
    equality: 'uguaglianza perfetta',
    poorest: 'quota più povera degli agenti',
    held: 'quota della ricchezza',

    sugar: 'Sugarscape',
    agents: 'Agenti',
    regrowth: 'Ricrescita per passo',
    visionMax: 'Vista massima',
    metabolismMax: 'Metabolismo massimo',
    endowMin: 'Zucchero iniziale, da',
    endowMax: 'Zucchero iniziale, a',
    lifespan: 'Vita limitata',
    onOff: { off: 'No', on: 'Sì' },
    ageMin: 'Durata della vita, da',
    ageMax: 'Durata della vita, a',
    speed: 'Passi al secondo',
    sugarNote:
      'Un paesaggio 50 × 50 che si richiude ai bordi, con due picchi di zucchero; ogni cella ne contiene da 0 a 4 unità. A ogni passo, in ordine casuale, ogni agente guarda lungo le quattro direzioni del reticolo fin dove arriva la sua vista, si sposta sulla cella libera più vicina con più zucchero (compresa la propria), lo raccoglie tutto e ne consuma quanto vuole il suo metabolismo. Un agente il cui zucchero scende sotto zero muore. Poi ogni cella ricresce, fino alla sua capacità. Vista, metabolismo e zucchero iniziale sono estratti in modo uniforme. Con la vita limitata ogni agente muore anche a un’età estratta nell’intervallo, e ogni agente che muore è sostituito da un nuovo arrivato, così la popolazione resta costante.',
    sugarAria: 'Il paesaggio di zucchero in tinte chiare, più scure dove c’è più zucchero, con gli agenti come piccoli punti ardesia; il decimo più ricco degli agenti è cerchiato in arancione.',
    sugarKey: (v) => `zucchero ${v}`,
    agentKey: 'agente',
    richKey: '10% più ricco',
    deaths: (s, a, b) => `Morti di fame: ${s} · di vecchiaia: ${a} · nuovi arrivati: ${b}`,
    histChart: 'Distribuzione della ricchezza',
    histAria: 'Grafico a barre della quota di agenti in ogni intervallo di zucchero posseduto.',
    shareAgents: 'quota di agenti',
    sugarRange: (lo, hi) => `zucchero ${lo}–${hi}`,

    exchange: 'Scambi come urti',
    model: 'Modello',
    models: {
      random: 'Scambio casuale',
      saving: 'Risparmio λ',
      yardsale: 'Mercatino f',
      redistribute: 'Mercatino + redistribuzione χ',
    },
    modelNotes: {
      random:
        'Due agenti scelti a caso mettono insieme il loro denaro e lo dividono in un punto casuale uniforme. Il denaro si conserva e nessuno va in debito. Tutti partono con la stessa somma.',
      saving:
        'Ognuno dei due tiene per sé una frazione λ del suo denaro; il resto viene messo in comune e diviso in un punto casuale.',
      yardsale:
        'Una moneta equa decide chi dei due vince; il vincitore prende una frazione f della ricchezza del più povero dei due. Ogni scambio è equo: il guadagno atteso è zero per entrambi.',
      redistribute:
        'Il mercatino, e dopo ogni N scambi la ricchezza di ogni agente si sposta di una frazione χ verso la media.',
    },
    N: 'Agenti N',
    lambda: 'Propensione al risparmio λ',
    f: 'Posta f',
    chi: 'Redistribuzione χ per giro',
    tradesPerFrame: 'Scambi per fotogramma',
    sweepNote: 'Il tempo si conta in giri di N scambi: in media ogni agente scambia due volte per giro.',
    sweepStat: 'Giri',
    logY: 'y log',
    histChart2: 'Distribuzione della ricchezza',
    hist2Aria: 'Punti per la quota di agenti per unità di ricchezza, contro la ricchezza in unità della media; per lo scambio casuale la previsione esponenziale è disegnata come linea.',
    wealthAxis: 'ricchezza / media',
    density: 'densità',
    expLine: 'esponenziale, e^(−w)',
    simDots: 'simulazione',
    above: (k, h) => `${k} agenti hanno più di ${h} volte la media (fuori dal grafico).`,
    halfRef: 'G = ½, l’esponenziale',
    richChart: 'Quota dell’agente più ricco nel tempo',
    richAria: 'La quota della ricchezza totale posseduta dal singolo agente più ricco, contro il tempo.',

    growth: 'Crescita moltiplicativa',
    sigma: 'Volatilità σ',
    J: 'Accoppiamento J',
    r: 'Crescita media per passo',
    N2: 'Agenti N',
    stepsPerFrame: 'Passi per fotogramma',
    growthNote:
      'A ogni passo ogni patrimonio è moltiplicato per un fattore casuale lognormale indipendente: in media cresce del tasso scelto sopra, e il suo logaritmo ha varianza 2σ². Poi ogni agente riceve J volte la differenza tra la media e la propria ricchezza (uno scambio con tutti gli altri, che lascia invariato il totale). La teoria di campo medio di Bouchaud e Mézard prevede una coda di Pareto con esponente 1 + J/σ².',
    stepStat: 'Passo',
    alphaHat: 'Esponente della coda, MLE',
    alphaTheory: 'Teoria, 1 + J/σ²',
    noTheory: 'J = 0: nessuno stato stazionario',
    tailN: (n) => `${n} agenti sopra x_min`,
    ccdfChart: 'Coda della distribuzione della ricchezza',
    ccdfKey: 'P(W ≥ w): quota di agenti con almeno w volte la ricchezza media',
    ccdfAria: 'Grafico log–log della quota di agenti con almeno w volte la ricchezza media, con la pendenza teorica tracciata da x_min.',
    xMin: 'x_min, in unità della media',
    theoryLine: (a) => `pendenza −${a}, teoria`,
    xMinLine: 'x_min',
    meanMedChart: 'Ricchezza media e mediana nel tempo',
    meanMedAria: 'Ricchezza media e mediana contro il tempo, in scala logaritmica.',
    meanLine: 'media',
    medianLine: 'mediana',
    stopped: (n) => `Fermato a ${n} passi.`,
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)
const fmtPct = (v, locale, d = 0) => `${fmtFixed(v * 100, d, locale)}%`

// Three significant figures, switching to powers of ten outside 0.01 … 10⁵.
function fmtSig(v, locale) {
  if (!Number.isFinite(v)) return '–'
  const a = Math.abs(v)
  if (a !== 0 && (a < 0.01 || a >= 1e5)) return v.toExponential(2).replace('e+', 'e')
  return v.toLocaleString(locale, { maximumSignificantDigits: 3 })
}

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const powTick = (v) => {
  const e = Math.round(Math.log10(v))
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${String(e).replace(/./g, (c) => SUPERSCRIPT[c])}`
}

// Powers of ten covering [lo, hi], for the domain and ticks of a log axis;
// over many decades only every few get a tick.
function decades(lo, hi) {
  const a = Math.floor(Math.log10(lo))
  const b = Math.max(a + 1, Math.ceil(Math.log10(hi) - 1e-9))
  const every = Math.ceil((b - a + 1) / 7)
  const ticks = []
  for (let e = b; e >= a; e -= every) ticks.unshift(10 ** e)
  return { domain: [10 ** a, 10 ** b], ticks }
}

// A round number at least v, for the right end of a histogram.
function niceCeil(v) {
  if (!(v > 0)) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p
  return 10 * p
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

function LineSwatch({ color, width = 2, dashed = false }) {
  return (
    <span
      className="inline-block w-5 shrink-0"
      style={{ borderTop: `${width}px ${dashed ? 'dashed' : 'solid'} ${color}` }}
      aria-hidden="true"
    />
  )
}

function DotSwatch({ color, size = 8, border, square = false }) {
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

// A Scatter drawn only as a line, for curves.
const NoDot = () => null
const SmallDot = ({ cx, cy }) => <circle cx={cx} cy={cy} r={2.5} fill={ORANGE} />

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

// A history of points { x, ...values }; whenever it reaches HIST_MAX points,
// every other point is dropped, so a long run keeps an even outline.
function record(hist, point) {
  hist.push(point)
  if (hist.length > HIST_MAX) {
    let k = 0
    for (let i = 0; i < hist.length; i += 2) hist[k++] = hist[i]
    hist.length = k
  }
}

// A line chart of one or more histories. Series: { key, name, color, dashed }.
const HistoryChart = memo(function HistoryChart({ data, series, aria, locale, xLabel, yDomain, yTicks, yLog = false, fmt, tickFmt = fmt, refY, height = 'h-44' }) {
  const xMax = data.length ? data[data.length - 1].x : 1
  return (
    <div className={`mt-3 ${height} -ml-4`} role="img" aria-label={aria}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 22, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[0, xMax > 0 ? xMax : 1]} tickFormatter={(v) => fmtSig(v, locale)} tick={axisTick} stroke={MUTED} />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            scale={yLog ? 'log' : 'auto'}
            allowDataOverflow={yLog}
            tickFormatter={tickFmt}
            width={44}
            tick={axisTick}
            stroke={MUTED}
          />
          {refY != null && <ReferenceLine y={refY} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />}
          <Tooltip
            formatter={(v, name) => [fmt(v), name]}
            labelFormatter={(v) => `${xLabel} ${fmtSig(v, locale)}`}
            contentStyle={tooltipStyle}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 3' : undefined}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// The Lorenz curve of a sorted sample, with the diagonal of perfect equality.
const DIAGONAL = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
]
const LorenzChart = memo(function LorenzChart({ sorted, t, locale }) {
  const data = useMemo(() => lorenzSorted(sorted).map(({ p, L }) => ({ x: p, y: L })), [sorted])
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <div className="min-w-0">
      <PanelTitle>{t.lorenzChart}</PanelTitle>
      <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.lorenzAria}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[0, 1]} ticks={ticks} tickFormatter={(v) => fmtPct(v, locale)} tick={axisTick} stroke={MUTED} />
            <YAxis dataKey="y" type="number" domain={[0, 1]} ticks={ticks} tickFormatter={(v) => fmtPct(v, locale)} width={44} tick={axisTick} stroke={MUTED} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(v, name) => [fmtPct(v, locale, 1), name === 'x' ? t.poorest : t.held]}
              contentStyle={tooltipStyle}
            />
            <Scatter data={DIAGONAL} line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }} shape={NoDot} isAnimationActive={false} />
            <Scatter data={data} line={{ stroke: ORANGE, strokeWidth: 2 }} shape={NoDot} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <Legend>
        <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.lorenzLine}</LegendItem>
        <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.equality}</LegendItem>
      </Legend>
    </div>
  )
})

const GINI_TICKS = [0, 0.25, 0.5, 0.75, 1]

// ---------------------------------------------------------------- Panel A

function newSugarscape(o) {
  const s = createSugarscape(o)
  const hist = []
  const w = sortedCopy(sugarWealth(s))
  record(hist, { x: 0, gini: giniSorted(w) })
  return { s, hist }
}

function SugarscapePanel({ t, locale }) {
  const [o, setO] = useState(SUGAR_DEFAULTS)
  const [speed, setSpeed] = useState(20)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  // Every setting but the regrowth rate rebuilds the landscape.
  const { regrowth, ...build } = o
  const key = JSON.stringify(build)
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newSugarscape(o)
    ref.current.key = key
  }
  const model = ref.current
  const { s } = model
  s.o.regrowth = regrowth

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const acc = useRef(0)

  const set = (patch) => {
    setPlaying(false)
    acc.current = 0
    setO((prev) => ({ ...prev, ...patch }))
    bump(true)
  }

  const step = () => {
    sugarscapeStep(s)
    record(model.hist, { x: s.t, gini: giniSorted(sortedCopy(sugarWealth(s))) })
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * speed
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

  const sorted = sortedCopy(sugarWealth(s))
  const n = sorted.length
  const topCount = Math.max(1, Math.round(n * 0.1))
  const richLine = n ? sorted[n - topCount] : Infinity

  // ---- drawing: sugar as tints, agents as dots, the richest tenth ringed.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const css = Math.min(avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, css, css)
    const side = SUGAR_SIDE
    const cell = css / side
    for (let k = 0; k < side * side; k++) {
      const v = s.sugar[k] / SUGAR_MAX
      const c = SUGAR_LOW.map((lo, i) => Math.round(lo + (SUGAR_HIGH[i] - lo) * v))
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`
      // Cells overlap by a hair so no seams show between them.
      ctx.fillRect((k % side) * cell, Math.floor(k / side) * cell, cell + 0.5, cell + 0.5)
    }
    const r = Math.max(1.5, cell * 0.32)
    ctx.fillStyle = SLATE_DARK
    for (const a of s.agents) {
      ctx.beginPath()
      ctx.arc((a.x + 0.5) * cell, (a.y + 0.5) * cell, r, 0, 2 * Math.PI)
      ctx.fill()
    }
    ctx.strokeStyle = ORANGE
    ctx.lineWidth = Math.max(1.25, cell * 0.16)
    for (const a of s.agents) {
      if (a.wealth < richLine) continue
      ctx.beginPath()
      ctx.arc((a.x + 0.5) * cell, (a.y + 0.5) * cell, r + ctx.lineWidth * 0.75, 0, 2 * Math.PI)
      ctx.stroke()
    }
  })

  const giniData = useMemo(
    () => model.hist.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const chartSorted = useMemo(
    () => sortedCopy(sugarWealth(s)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const hist = useMemo(() => {
    const m = chartSorted.length
    const hi = niceCeil(m ? chartSorted[m - 1] * 1.0001 : 1)
    const bins = 20
    const h = histogram(chartSorted, 0, hi, bins)
    const width = hi / bins
    const lab = (v) => fmtSig(v, locale)
    return h.bins.map((b, i) => ({ x: lab(i * width), share: m ? b.count / m : 0, range: t.sugarRange(lab(i * width), lab((i + 1) * width)) }))
  }, [chartSorted, locale, t])

  const intSlider = (label, k, min, max, stepV = 1) => (
    <Slider label={label} min={min} max={max} step={stepV} value={o[k]} onChange={(v) => set({ [k]: v })} />
  )

  return (
    <div className={panel}>
      <PanelTitle>A · {t.sugar}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {intSlider(t.agents, 'agents', 100, 800, 50)}
        <Slider
          label={t.regrowth}
          min={0.25}
          max={4}
          step={0.25}
          value={regrowth}
          onChange={(v) => setO((prev) => ({ ...prev, regrowth: v }))}
          format={(v) => fmtFixed(v, 2, locale)}
        />
        {intSlider(t.visionMax, 'visionMax', 1, 6)}
        {intSlider(t.metabolismMax, 'metabolismMax', 1, 4)}
        <Slider label={t.endowMin} min={0} max={50} step={1} value={o.endowMin} onChange={(v) => set({ endowMin: v, endowMax: Math.max(v, o.endowMax) })} />
        <Slider label={t.endowMax} min={0} max={50} step={1} value={o.endowMax} onChange={(v) => set({ endowMax: v, endowMin: Math.min(v, o.endowMin) })} />
      </div>
      <div className="mt-4">
        <Chips label={t.lifespan} options={['off', 'on']} value={o.lifespan ? 'on' : 'off'} names={t.onOff} onChange={(v) => set({ lifespan: v === 'on' })} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {o.lifespan && (
          <>
            <Slider label={t.ageMin} min={20} max={200} step={5} value={o.ageMin} onChange={(v) => set({ ageMin: v, ageMax: Math.max(v, o.ageMax) })} />
            <Slider label={t.ageMax} min={20} max={200} step={5} value={o.ageMax} onChange={(v) => set({ ageMax: v, ageMin: Math.min(v, o.ageMin) })} />
          </>
        )}
        <Slider label={t.speed} min={1} max={60} step={1} value={speed} onChange={setSpeed} />
        {intSlider(t.seed, 'seed', 1, 50)}
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            acc.current = 0
            setPlaying((p) => !p)
          }}
          onStep={() => {
            step()
            bump(true)
          }}
          onReset={() => {
            setPlaying(false)
            ref.current = null
            bump(true)
          }}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.sugarNote}</p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.sugarAria} className="block mx-auto outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        {[0, 2, 4].map((v) => {
          const c = SUGAR_LOW.map((lo, i) => Math.round(lo + ((SUGAR_HIGH[i] - lo) * v) / SUGAR_MAX))
          return (
            <LegendItem key={v} swatch={<DotSwatch color={`rgb(${c.join(',')})`} square border={`1px solid ${GRID}`} />}>
              {t.sugarKey(v)}
            </LegendItem>
          )
        })}
        <LegendItem swatch={<DotSwatch color={SLATE_DARK} />}>{t.agentKey}</LegendItem>
        <LegendItem swatch={<DotSwatch color={SLATE_DARK} border={`2px solid ${ORANGE}`} size={11} />}>{t.richKey}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.stepStat}>{fmtInt(s.t, locale)}</Stat>
        <Stat label={t.population}>{fmtInt(n, locale)}</Stat>
        <Stat label={t.meanW}>{fmtFixed(mean(sorted), 1, locale)}</Stat>
        <Stat label={t.medianW}>{fmtFixed(median(sorted), 1, locale)}</Stat>
        <Stat label={t.gini}>
          <span className="text-orange-700">{fmtFixed(giniSorted(sorted), 3, locale)}</span>
        </Stat>
        <Stat label={t.top10}>{fmtPct(topShare(sorted, 0.1), locale, 1)}</Stat>
      </div>
      <p className="mt-2 font-mono text-xs text-slate-500">{t.deaths(fmtInt(s.starved, locale), fmtInt(s.aged, locale), fmtInt(s.births, locale))}</p>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.giniChart}</PanelTitle>
        <HistoryChart
          data={giniData}
          series={[{ key: 'gini', name: t.gini, color: ORANGE }]}
          aria={t.giniAria}
          locale={locale}
          xLabel={t.stepLabel}
          yDomain={[0, 1]}
          yTicks={GINI_TICKS}
          fmt={(v) => fmtFixed(v, 3, locale)}
          tickFmt={(v) => fmtFixed(v, 2, locale)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.histChart}</PanelTitle>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.histAria}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hist} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap={1}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="x" tick={axisTick} stroke={MUTED} minTickGap={8} />
                <YAxis width={44} tick={axisTick} stroke={MUTED} tickFormatter={(v) => fmtPct(v, locale)} />
                <Tooltip
                  formatter={(v) => [fmtPct(v, locale, 1), t.shareAgents]}
                  labelFormatter={(_, p) => (p && p[0] ? p[0].payload.range : '')}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="share" fill={SLATE} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <LorenzChart sorted={chartSorted} t={t} locale={locale} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function newExchange(o) {
  const m = createExchange(o)
  const hist = []
  record(hist, { x: 0, gini: 0, rich: 1 / o.N })
  return { m, hist }
}

function ExchangePanel({ t, locale }) {
  const [o, setO] = useState(EXCHANGE_DEFAULTS)
  const [perFrame, setPerFrame] = useState(2000)
  const [logY, setLogY] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  const key = JSON.stringify(o)
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newExchange(o)
    ref.current.key = key
  }
  const sim = ref.current
  const { m } = sim

  const set = (patch) => {
    setPlaying(false)
    setO((prev) => ({ ...prev, ...patch }))
    bump(true)
  }

  const snapshot = () => {
    const sorted = sortedCopy(m.w)
    record(sim.hist, { x: sweeps(m), gini: giniSorted(sorted), rich: sorted[sorted.length - 1] / sorted.length })
  }

  useAnimationLoop(() => {
    // Trade in chunks within a ~12 ms budget, so slow devices stay responsive.
    const begin = performance.now()
    let left = Math.round(perFrame)
    while (left > 0 && performance.now() - begin < 12) {
      const k = Math.min(left, 20000)
      exchangeTrades(m, k)
      left -= k
    }
    snapshot()
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const sorted = sortedCopy(m.w)
  const N = sorted.length
  const histData = useMemo(
    () => sim.hist.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim, version],
  )
  const chartSorted = useMemo(
    () => sortedCopy(m.w),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim, version],
  )

  // Wealth in units of the mean, which stays 1.
  const dist = useMemo(() => {
    const h = histogram(chartSorted, 0, HIST_HI, HIST_BINS)
    const dots = h.bins.filter((b) => b.count > 0).map((b) => ({ x: b.x, y: b.density }))
    const line = []
    if (o.model === 'random') for (let i = 0; i <= 60; i++) line.push({ x: (HIST_HI * i) / 60, y: pdf('exponential', { mean: 1 }, (HIST_HI * i) / 60) })
    const ys = [...dots, ...line].map((d) => d.y).filter((y) => y > 0)
    const y = logY ? decades(Math.min(...ys, 1) * 0.9, Math.max(...ys, 1)) : null
    return { dots, line, above: h.above, y }
  }, [chartSorted, o.model, logY])

  const xTicks = [0, 1, 2, 3, 4, 5, 6]
  const param =
    o.model === 'saving' ? (
      <Slider label={t.lambda} min={0} max={0.95} step={0.05} value={o.lambda} onChange={(v) => set({ lambda: v })} format={(v) => fmtFixed(v, 2, locale)} />
    ) : o.model === 'yardsale' || o.model === 'redistribute' ? (
      <Slider label={t.f} min={0.01} max={0.5} step={0.01} value={o.f} onChange={(v) => set({ f: v })} format={(v) => fmtFixed(v, 2, locale)} />
    ) : null

  return (
    <div className={panel}>
      <PanelTitle>B · {t.exchange}</PanelTitle>
      <div className="mt-4">
        <Chips label={t.model} options={EXCHANGE_MODELS} value={o.model} names={t.models} onChange={(v) => set({ model: v })} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.modelNotes[o.model]}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {param}
        {o.model === 'redistribute' && (
          <Slider label={t.chi} min={0.001} max={0.1} log value={o.chi} onChange={(v) => set({ chi: Number(v.toPrecision(2)) })} format={(v) => fmtSig(v, locale)} />
        )}
        <Slider label={t.N} min={200} max={5000} step={100} value={o.N} onChange={(v) => set({ N: v })} format={(v) => fmtInt(v, locale)} />
        <Slider label={t.tradesPerFrame} min={100} max={200000} log value={perFrame} onChange={setPerFrame} format={(v) => fmtInt(Number(v.toPrecision(2)), locale)} />
        <Slider label={t.seed} min={1} max={50} step={1} value={o.seed} onChange={(v) => set({ seed: v })} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => setPlaying((p) => !p)}
          onReset={() => {
            setPlaying(false)
            ref.current = null
            bump(true)
          }}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.sweepNote}</p>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.sweepStat}>{fmtInt(sweeps(m), locale)}</Stat>
        <Stat label={t.gini}>
          <span className="text-orange-700">{fmtFixed(giniSorted(sorted), 3, locale)}</span>
        </Stat>
        <Stat label={t.top10}>{fmtPct(topShare(sorted, 0.1), locale, 1)}</Stat>
        <Stat label={t.richest}>{fmtPct(sorted[N - 1] / N, locale, 2)}</Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PanelTitle>{t.histChart2}</PanelTitle>
            <button type="button" className={chip(logY)} aria-pressed={logY} onClick={() => setLogY((v) => !v)}>
              {t.logY}
            </button>
          </div>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.hist2Aria}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" domain={[0, HIST_HI]} ticks={xTicks} tick={axisTick} stroke={MUTED} />
                {logY ? (
                  <YAxis dataKey="y" type="number" scale="log" domain={dist.y.domain} ticks={dist.y.ticks} tickFormatter={powTick} allowDataOverflow width={44} tick={axisTick} stroke={MUTED} />
                ) : (
                  <YAxis dataKey="y" type="number" domain={[0, 'auto']} tickFormatter={(v) => fmtFixed(v, 2, locale)} width={44} tick={axisTick} stroke={MUTED} />
                )}
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v, name) => (name === 'x' ? [fmtFixed(v, 2, locale), t.wealthAxis] : [fmtSig(v, locale), t.density])}
                  contentStyle={tooltipStyle}
                />
                {dist.line.length > 0 && <Scatter data={dist.line} line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }} shape={NoDot} isAnimationActive={false} />}
                <Scatter data={dist.dots} shape={SmallDot} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} size={6} />}>{t.simDots}</LegendItem>
            {dist.line.length > 0 && <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.expLine}</LegendItem>}
          </Legend>
          <p className="mt-1 font-mono text-xs text-slate-500">{t.wealthAxis}</p>
          {dist.above > 0 && <p className="mt-1 text-xs text-slate-500">{t.above(fmtInt(dist.above, locale), HIST_HI)}</p>}
        </div>
        <LorenzChart sorted={chartSorted} t={t} locale={locale} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.giniChart}</PanelTitle>
          <HistoryChart
            data={histData}
            series={[{ key: 'gini', name: t.gini, color: ORANGE }]}
            aria={t.giniAria}
            locale={locale}
            xLabel={t.sweepLabel}
            yDomain={[0, 1]}
            yTicks={GINI_TICKS}
            fmt={(v) => fmtFixed(v, 3, locale)}
            tickFmt={(v) => fmtFixed(v, 2, locale)}
            refY={o.model === 'random' ? 0.5 : null}
          />
          {o.model === 'random' && (
            <Legend>
              <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.halfRef}</LegendItem>
            </Legend>
          )}
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.richChart}</PanelTitle>
          <HistoryChart
            data={histData}
            series={[{ key: 'rich', name: t.richest, color: SLATE }]}
            aria={t.richAria}
            locale={locale}
            xLabel={t.sweepLabel}
            yDomain={[0, (max) => niceCeil(Math.max(max, 0.01))]}
            fmt={(v) => fmtPct(v, locale, 2)}
            tickFmt={(v) => fmtPct(v, locale, v < 0.1 ? 1 : 0)}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

function newGrowth(N, seed, params) {
  const g = createGrowth({ N, seed, ...params })
  const hist = []
  record(hist, { x: 0, mean: 1, median: 1 })
  return { g, hist }
}

function GrowthPanel({ t, locale }) {
  const [sigma, setSigma] = useState(GROWTH_DEFAULTS.sigma)
  const [J, setJ] = useState(GROWTH_DEFAULTS.J)
  const [r, setR] = useState(GROWTH_DEFAULTS.r)
  const [N, setN] = useState(GROWTH_DEFAULTS.N)
  const [seed, setSeed] = useState(GROWTH_DEFAULTS.seed)
  const [perFrame, setPerFrame] = useState(5)
  const [xMin, setXMin] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  // σ, J and the growth rate act on the running population; N and the seed restart it.
  const key = `${N}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newGrowth(N, seed, { sigma, J, r })
    ref.current.key = key
  }
  const sim = ref.current
  const { g } = sim
  Object.assign(g.o, { sigma, J, r })

  const reset = (fn) => {
    setPlaying(false)
    fn()
    bump(true)
  }

  const step = () => {
    growthStep(g)
    const sorted = sortedCopy(g.W)
    record(sim.hist, { x: g.t, mean: mean(sorted), median: median(sorted) })
  }

  useAnimationLoop(() => {
    const begin = performance.now()
    for (let k = 0; k < perFrame && g.t < MAX_STEPS && performance.now() - begin < 12; k++) step()
    if (g.t >= MAX_STEPS) setPlaying(false)
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const chart = useMemo(
    () => {
      const avg = mean(g.W)
      const rel = Float64Array.from(g.W, (v) => v / avg).sort()
      const pts = ccdfSorted(rel, 200)
      const lo = Math.max(pts.length ? pts[pts.length - 1].x : 0.01, 1e-4)
      const hi = Math.max(rel[rel.length - 1], 10)
      const x = decades(Math.max(lo, 1e-3), hi)
      const y = decades(1 / rel.length, 1)
      const mle = paretoMLE(rel, xMin)
      const n = rel.length
      // P(W ≥ x_min), to anchor the theoretical line.
      let above = 0
      for (let i = n - 1; i >= 0 && rel[i] >= xMin; i--) above++
      const a = growthAlpha(g.o.sigma, g.o.J)
      const ref =
        g.o.J > 0 && above > 0
          ? [xMin, x.domain[1]].map((v) => ({ x: v, p: (above / n) * (v / xMin) ** -a }))
          : []
      const top = Math.max(1, Math.round(n * 0.01))
      let topSum = 0
      for (let i = n - top; i < n; i++) topSum += rel[i]
      const hist = sim.hist.slice()
      const ys = hist.flatMap((p) => [p.mean, p.median]).filter((v) => v > 0)
      const yTime = decades(Math.min(...ys, 1), Math.max(...ys, 1))
      return { pts, x, y, mle, ref, alpha: a, above, rich: rel[n - 1] / n, top1: topSum / n, hist, yTime }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim, version, xMin, sigma, J],
  )

  const sorted = sortedCopy(g.W)

  return (
    <div className={panel}>
      <PanelTitle>C · {t.growth}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.sigma} min={0.02} max={0.3} step={0.01} value={sigma} onChange={setSigma} format={(v) => fmtFixed(v, 2, locale)} />
        <Slider label={t.J} min={0} max={0.05} step={0.001} value={J} onChange={setJ} format={(v) => fmtFixed(v, 3, locale)} />
        <Slider label={t.r} min={0} max={0.02} step={0.001} value={r} onChange={setR} format={(v) => fmtPct(v, locale, 1)} />
        <Slider label={t.N2} min={500} max={10000} step={500} value={N} onChange={(v) => reset(() => setN(v))} format={(v) => fmtInt(v, locale)} />
        <Slider label={t.stepsPerFrame} min={1} max={50} step={1} value={perFrame} onChange={setPerFrame} />
        <Slider label={t.seed} min={1} max={50} step={1} value={seed} onChange={(v) => reset(() => setSeed(v))} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => setPlaying((p) => !p && g.t < MAX_STEPS)}
          onStep={() => {
            if (g.t < MAX_STEPS) step()
            bump(true)
          }}
          onReset={() => reset(() => (ref.current = null))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.growthNote}</p>
      {g.t >= MAX_STEPS && <p className="mt-2 font-mono text-xs text-slate-500">{t.stopped(fmtInt(MAX_STEPS, locale))}</p>}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.stepStat}>{fmtInt(g.t, locale)}</Stat>
        <Stat label={t.alphaHat}>
          <span className="text-orange-700">{fmtFixed(chart.mle.alpha, 2, locale)}</span>
          <span className="text-slate-500"> ± {fmtFixed(chart.mle.error, 2, locale)}</span>
          <span className="block text-xs text-slate-500">{t.tailN(fmtInt(chart.mle.N, locale))}</span>
        </Stat>
        <Stat label={t.alphaTheory}>{J > 0 ? fmtFixed(chart.alpha, 2, locale) : <span className="text-xs">{t.noTheory}</span>}</Stat>
        <Stat label={t.meanW}>{fmtSig(mean(sorted), locale)}</Stat>
        <Stat label={t.medianW}>{fmtSig(median(sorted), locale)}</Stat>
        <Stat label={t.richest}>{fmtPct(chart.rich, locale, 2)}</Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.ccdfChart}</PanelTitle>
          <div className="mt-3 h-64 -ml-4" role="img" aria-label={t.ccdfAria}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" scale="log" domain={chart.x.domain} ticks={chart.x.ticks} tickFormatter={powTick} allowDataOverflow tick={axisTick} stroke={MUTED} />
                <YAxis dataKey="p" type="number" scale="log" domain={chart.y.domain} ticks={chart.y.ticks} tickFormatter={powTick} allowDataOverflow width={44} tick={axisTick} stroke={MUTED} />
                <ReferenceLine x={xMin} stroke={MUTED} strokeWidth={1} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v, name) => (name === 'x' ? [fmtSig(v, locale), 'w'] : [v.toPrecision(3), 'P(W ≥ w)'])}
                  contentStyle={tooltipStyle}
                />
                <Scatter data={chart.pts} fill={ORANGE} shape="circle" isAnimationActive={false} />
                {chart.ref.length > 0 && (
                  <Scatter data={chart.ref} line={{ stroke: INK, strokeWidth: 1.25, strokeDasharray: '5 4' }} shape={NoDot} isAnimationActive={false} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<DotSwatch color={ORANGE} />}>{t.simDots}</LegendItem>
            {chart.ref.length > 0 && <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.theoryLine(fmtFixed(chart.alpha, 2, locale))}</LegendItem>}
            <LegendItem swatch={<LineSwatch color={MUTED} width={1} />}>{t.xMinLine}</LegendItem>
          </Legend>
          <p className="mt-1 font-mono text-xs text-slate-500">{t.ccdfKey}</p>
          <div className="mt-4 max-w-sm">
            <Slider label={t.xMin} min={1} max={10} step={0.5} value={xMin} onChange={setXMin} format={(v) => fmtFixed(v, 1, locale)} />
          </div>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.meanMedChart}</PanelTitle>
          <HistoryChart
            data={chart.hist}
            series={[
              { key: 'mean', name: t.meanLine, color: ORANGE },
              { key: 'median', name: t.medianLine, color: SLATE, dashed: true },
            ]}
            aria={t.meanMedAria}
            locale={locale}
            xLabel={t.stepLabel}
            yDomain={chart.yTime.domain}
            yTicks={chart.yTime.ticks}
            yLog
            fmt={(v) => fmtSig(v, locale)}
            tickFmt={powTick}
            height="h-64"
          />
          <Legend>
            <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.meanLine}</LegendItem>
            <LegendItem swatch={<LineSwatch color={SLATE} dashed />}>{t.medianLine}</LegendItem>
          </Legend>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function WealthInequality({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <SugarscapePanel t={t} locale={locale} />
      <ExchangePanel t={t} locale={locale} />
      <GrowthPanel t={t} locale={locale} />
    </div>
  )
}
