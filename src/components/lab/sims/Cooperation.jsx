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
import { mulberry32 } from '../rng.js'
import {
  C,
  STRATEGIES,
  STRATEGY_IDS,
  DEFAULT_OPTIONS,
  checkPayoffs,
  runTournament,
  tournamentMatch,
  replicatorStep,
  createSpatial,
  spatialStep,
  coopShare,
  volunteerEquilibrium,
  volunteerMonteCarlo,
} from '../games.js'

// Cooperation and game theory, in four panels: a round-robin tournament of
// iterated Prisoner's Dilemma strategies, with a head-to-head replay;
// replicator dynamics over the tournament's payoffs; the Nowak–May game on a
// grid; and the volunteer's dilemma, formula against Monte Carlo.

const ORANGE = '#f7931a'
const ORANGE_LIGHT = '#fcd29f'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const SLATE_LIGHT = '#cbd5e1' // slate-300
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

const MAX_CANVAS = 560 // css px
const HIST_MAX = 600 // points in the history charts

// One colour per strategy, fixed whatever the selection. The strategies that
// can defect first are also drawn dashed, so identity never rests on colour alone.
const COLOR = {
  allc: '#2a78d6',
  tft: ORANGE,
  gtft: '#1baf7a',
  tf2t: '#6250d6',
  grim: '#e87ba4',
  wsls: '#008300',
  alld: INK,
  random: MUTED,
  stft: '#e34948',
  joss: '#eda100',
}
const DASHED = Object.fromEntries(STRATEGIES.map((s) => [s.id, !s.nice]))

// Panel B
const MAX_GEN = 5000

// Panel C
const NM_RANDOM_SHARE = 12 * Math.log(2) - 8 // ≈ 0.318, Nowak and May's value for 1.8 < b < 2

// Panel D
const VD_SIZES = Array.from({ length: 49 }, (_, k) => k + 2)
const VD_TRIALS = 4000 // groups per point of the chart
const VD_CHECK = 20000 // groups for the check at the chosen N

const T = {
  en: {
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    seed: 'Seed',
    stepLabel: 'step',
    genLabel: 'generation',
    names: {
      allc: 'Always Cooperate',
      alld: 'Always Defect',
      tft: 'Tit for Tat',
      gtft: 'Generous Tit for Tat',
      tf2t: 'Tit for Two Tats',
      grim: 'Grim Trigger',
      wsls: 'Win-Stay, Lose-Shift',
      random: 'Random',
      stft: 'Suspicious Tit for Tat',
      joss: 'Joss',
    },
    rules: {
      allc: 'always cooperates',
      alld: 'always defects',
      tft: 'cooperates first, then copies your last move',
      gtft: 'like Tit for Tat, but forgives a defection with the probability set below',
      tf2t: 'defects only after two defections in a row',
      grim: 'cooperates until you defect once, then defects for ever',
      wsls: 'repeats its move after T or R, switches after P or S',
      random: 'cooperates or defects with equal odds',
      stft: 'defects first, then copies your last move',
      joss: 'Tit for Tat that defects instead of cooperating 10% of the time',
    },

    tournament: "Axelrod's tournament",
    entrants: 'Entrants',
    all: 'All',
    none: 'None',
    payoffs: 'Payoffs',
    pT: 'T, temptation',
    pR: 'R, reward',
    pP: 'P, punishment',
    pS: "S, sucker's payoff",
    pdOrder: 'T > R > P > S fails: with these payoffs the game is not a Prisoner’s Dilemma.',
    pdAlt: '2R > T + S fails: two players taking turns at exploiting each other would earn more than steady cooperation.',
    length: 'Match length',
    lengths: { fixed: 'Fixed', random: 'Random' },
    rounds: (n) => `${n} rounds`,
    w: 'Continuation probability w',
    wKey: (m) => `mean length ${m} rounds`,
    noise: 'Noise ε (a move is flipped)',
    generosity: 'Generous TFT forgives',
    reps: 'Repetitions',
    runTournament: 'Run tournament',
    tourNote:
      'Every entrant plays every other one, and also a copy of itself (its score there is the mean of the two copies). Both players see the moves actually made, mistakes included. Scores are mean payoffs per round over all matches, averaged over the repetitions.',
    stale: 'The settings have changed since this run: press Run tournament to update.',
    needTwo: 'Choose at least two entrants.',
    ranking: 'Ranking, mean payoff per round',
    rankAria: 'Horizontal bars ranking the strategies by mean payoff per round.',
    refR: (v) => `R = ${v}: what two cooperators earn per round`,
    headToHead: 'Head to head',
    h2hNote: (r) => `The match as played in the first repetition (${r} rounds). Each column is a round.`,
    h2hAria: (a, b) => `Two strips of coloured cells, one per round: the moves of ${a} on top and of ${b} below. Slate is cooperate, orange is defect.`,
    coop: 'cooperate',
    defect: 'defect',
    total: 'Total',
    perRound: 'per round',
    coopRate: (v) => `cooperated ${v}`,
    vs: 'against',

    evolution: 'Evolution of strategies',
    evoNote:
      "The entrants of Panel A start with equal shares. Each generation, a strategy's share grows in proportion to its mean payoff against the current population (the payoffs per round of Panel A's last run, so its noise and payoffs too), relative to the population's mean payoff: the discrete replicator equation.",
    evoNoTour: 'Run the tournament in Panel A first.',
    gps: 'Generations per second',
    generation: 'Generation',
    leader: 'Largest share',
    meanPay: 'Mean payoff',
    meanPayKey: 'per round, whole population',
    sharesChart: 'Shares over generations',
    sharesAria: 'One line per strategy: its share of the population against the generation. Current shares are listed in the legend.',
    dashedKey: 'dashed: strategies that may defect first',

    grid: 'Cooperation on a grid',
    side: 'Grid side',
    b: 'Temptation b',
    start: 'Start',
    starts: { random: 'Random', defector: 'Single defector (kaleidoscope)' },
    share0: 'Initial cooperators',
    speed: 'Steps per second',
    gridNote:
      'Each cell plays the one-shot game with the 9 cells of its neighbourhood, itself included, with R = 1, T = b and P = S = 0. Then all cells at once copy the strategy of the best scorer among those 9 (keeping their own on a tie). The grid wraps around at the edges.',
    gridAria: 'A grid of cells: cooperators in slate, defectors in orange, lighter tints for cells that have just changed strategy.',
    cc: 'cooperator',
    dd: 'defector',
    dc: 'new cooperator',
    cd: 'new defector',
    stepStat: 'Step',
    coopStat: 'Cooperators',
    newC: 'New cooperators',
    newD: 'New defectors',
    coopChart: 'Share of cooperators over time',
    coopAria: 'Share of cooperators against the time step.',
    nmRef: (v) => `Nowak and May, 1.8 < b < 2: 12 ln 2 − 8 ≈ ${v}`,

    volunteer: "The volunteer's dilemma",
    cost: 'Cost of volunteering c',
    loss: 'Loss if nobody volunteers a',
    N: 'Group size N',
    vdNote:
      'If at least one player volunteers, the volunteers pay c and the others pay nothing; if nobody does, everyone loses a. At the symmetric equilibrium each player stays out with the probability q that makes volunteering and staying out pay the same: −c = −a·q^(N−1).',
    q: 'Each player stays out',
    vol: 'Each player volunteers',
    pNone: 'Nobody volunteers',
    expected: 'Expected volunteers',
    mcNone: (v, se) => `Monte Carlo: ${v} ± ${se}`,
    mcFree: (v, c) => `staying out, simulated payoff ${v} (theory −c = ${c})`,
    vdChart: 'Probability that nobody volunteers, against group size',
    vdAria: 'Probability that nobody volunteers against group size N, from the formula as a line and from Monte Carlo groups as dots, with the limit c/a dashed.',
    lineNone: 'nobody volunteers, formula',
    dotsNone: (m) => `Monte Carlo, ${m} groups per N`,
    lineQ: 'each player stays out, q',
    limit: (v) => `limit c/a = ${v}`,
  },
  it: {
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    seed: 'Seme',
    stepLabel: 'passo',
    genLabel: 'generazione',
    names: {
      allc: 'Coopera sempre',
      alld: 'Defeziona sempre',
      tft: 'Tit for Tat',
      gtft: 'Tit for Tat generoso',
      tf2t: 'Tit for Two Tats',
      grim: 'Grim Trigger',
      wsls: 'Vinci-resta, perdi-cambia',
      random: 'Casuale',
      stft: 'Tit for Tat sospettoso',
      joss: 'Joss',
    },
    rules: {
      allc: 'coopera sempre',
      alld: 'defeziona sempre',
      tft: "coopera alla prima mossa, poi copia l'ultima mossa dell'avversario",
      gtft: 'come Tit for Tat, ma perdona una defezione con la probabilità scelta qui sotto',
      tf2t: 'defeziona solo dopo due defezioni di fila',
      grim: "coopera finché l'avversario defeziona una volta, poi defeziona per sempre",
      wsls: 'ripete la mossa dopo T o R, la cambia dopo P o S',
      random: 'coopera o defeziona con la stessa probabilità',
      stft: "defeziona alla prima mossa, poi copia l'ultima mossa dell'avversario",
      joss: 'un Tit for Tat che il 10% delle volte defeziona invece di cooperare',
    },

    tournament: 'Il torneo di Axelrod',
    entrants: 'Partecipanti',
    all: 'Tutti',
    none: 'Nessuno',
    payoffs: 'Guadagni',
    pT: 'T, tentazione',
    pR: 'R, ricompensa',
    pP: 'P, punizione',
    pS: 'S, guadagno del babbeo',
    pdOrder: 'T > R > P > S non vale: con questi guadagni il gioco non è un dilemma del prigioniero.',
    pdAlt: '2R > T + S non vale: due giocatori che si sfruttano a turno guadagnerebbero più che cooperando sempre.',
    length: 'Durata della partita',
    lengths: { fixed: 'Fissa', random: 'Casuale' },
    rounds: (n) => `${n} turni`,
    w: 'Probabilità di continuare w',
    wKey: (m) => `durata media ${m} turni`,
    noise: 'Rumore ε (una mossa viene invertita)',
    generosity: 'Il TFT generoso perdona',
    reps: 'Ripetizioni',
    runTournament: 'Avvia il torneo',
    tourNote:
      'Ogni partecipante affronta tutti gli altri e anche una copia di se stesso (lì il suo punteggio è la media delle due copie). Entrambi vedono le mosse fatte davvero, errori compresi. I punteggi sono guadagni medi per turno su tutte le partite, mediati sulle ripetizioni.',
    stale: 'Le impostazioni sono cambiate da questo torneo: premi Avvia il torneo per aggiornarlo.',
    needTwo: 'Scegli almeno due partecipanti.',
    ranking: 'Classifica, guadagno medio per turno',
    rankAria: 'Barre orizzontali che ordinano le strategie per guadagno medio per turno.',
    refR: (v) => `R = ${v}: quanto guadagnano per turno due cooperatori`,
    headToHead: 'Testa a testa',
    h2hNote: (r) => `La partita come è stata giocata nella prima ripetizione (${r} turni). Ogni colonna è un turno.`,
    h2hAria: (a, b) => `Due strisce di celle colorate, una per turno: le mosse di ${a} sopra e di ${b} sotto. Ardesia è cooperare, arancione è defezionare.`,
    coop: 'coopera',
    defect: 'defeziona',
    total: 'Totale',
    perRound: 'per turno',
    coopRate: (v) => `ha cooperato ${v}`,
    vs: 'contro',

    evolution: "L'evoluzione delle strategie",
    evoNote:
      'I partecipanti del pannello A partono con quote uguali. A ogni generazione la quota di una strategia cresce in proporzione al suo guadagno medio contro la popolazione del momento (i guadagni per turno dell’ultimo torneo del pannello A, quindi anche con il suo rumore e i suoi guadagni), rispetto al guadagno medio della popolazione: l’equazione del replicatore discreta.',
    evoNoTour: 'Avvia prima il torneo nel pannello A.',
    gps: 'Generazioni al secondo',
    generation: 'Generazione',
    leader: 'Quota maggiore',
    meanPay: 'Guadagno medio',
    meanPayKey: 'per turno, tutta la popolazione',
    sharesChart: 'Quote nelle generazioni',
    sharesAria: 'Una linea per strategia: la sua quota della popolazione contro la generazione. Le quote attuali sono elencate nella legenda.',
    dashedKey: 'tratteggio: strategie che possono defezionare per prime',

    grid: 'La cooperazione su una griglia',
    side: 'Lato della griglia',
    b: 'Tentazione b',
    start: 'Partenza',
    starts: { random: 'Casuale', defector: 'Un solo defezionista (caleidoscopio)' },
    share0: 'Cooperatori iniziali',
    speed: 'Passi al secondo',
    gridNote:
      'Ogni cella gioca la partita singola con le 9 celle del suo vicinato, compresa se stessa, con R = 1, T = b e P = S = 0. Poi tutte le celle insieme copiano la strategia di chi ha guadagnato di più tra quelle 9 (a parità, tengono la propria). La griglia si richiude ai bordi.',
    gridAria: 'Una griglia di celle: cooperatori in ardesia, defezionisti in arancione, tinte più chiare per le celle che hanno appena cambiato strategia.',
    cc: 'cooperatore',
    dd: 'defezionista',
    dc: 'nuovo cooperatore',
    cd: 'nuovo defezionista',
    stepStat: 'Passo',
    coopStat: 'Cooperatori',
    newC: 'Nuovi cooperatori',
    newD: 'Nuovi defezionisti',
    coopChart: 'Quota di cooperatori nel tempo',
    coopAria: 'Quota di cooperatori contro il passo di tempo.',
    nmRef: (v) => `Nowak e May, 1,8 < b < 2: 12 ln 2 − 8 ≈ ${v}`,

    volunteer: 'Il dilemma del volontario',
    cost: 'Costo del volontario c',
    loss: 'Perdita se nessuno si offre a',
    N: 'Dimensione del gruppo N',
    vdNote:
      'Se almeno un giocatore si offre, i volontari pagano c e gli altri niente; se non si offre nessuno, tutti perdono a. All’equilibrio simmetrico ogni giocatore resta fuori con la probabilità q che rende uguali i guadagni di offrirsi e di restare fuori: −c = −a·q^(N−1).',
    q: 'Ogni giocatore resta fuori',
    vol: 'Ogni giocatore si offre',
    pNone: 'Non si offre nessuno',
    expected: 'Volontari attesi',
    mcNone: (v, se) => `Monte Carlo: ${v} ± ${se}`,
    mcFree: (v, c) => `restando fuori, guadagno simulato ${v} (teoria −c = ${c})`,
    vdChart: 'Probabilità che nessuno si offra, contro la dimensione del gruppo',
    vdAria: 'Probabilità che nessuno si offra contro la dimensione del gruppo N, dalla formula come linea e da gruppi Monte Carlo come punti, con il limite c/a tratteggiato.',
    lineNone: 'nessuno si offre, formula',
    dotsNone: (m) => `Monte Carlo, ${m} gruppi per N`,
    lineQ: 'ogni giocatore resta fuori, q',
    limit: (v) => `limite c/a = ${v}`,
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)
const fmtPct = (v, locale, d = 0) => `${fmtFixed(v * 100, d, locale)}%`

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

function Warning({ children }) {
  return <p className="mt-2 text-xs text-orange-700 leading-relaxed">⚠ {children}</p>
}

// A Scatter drawn only as a line, for curves.
const NoDot = () => null
// Monte Carlo points, small enough for the formula's line to show through.
const SmallDot = ({ cx, cy }) => <circle cx={cx} cy={cy} r={2.5} fill={SLATE} />

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

// A line chart of one or more histories. Series: { key, name, color, dashed }.
const HistoryChart = memo(function HistoryChart({ data, series, aria, locale, xLabel, yDomain, yTicks, fmt, tickFmt = fmt, refY, height = 'h-44' }) {
  const xMax = Math.max(1, data.length ? data[data.length - 1].x : 1)
  return (
    <div className={`mt-3 ${height} -ml-4`} role="img" aria-label={aria}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[0, xMax]} allowDecimals={false} tick={axisTick} stroke={MUTED} />
          <YAxis domain={yDomain} ticks={yTicks} tickFormatter={tickFmt} width={44} tick={axisTick} stroke={MUTED} />
          {refY != null && <ReferenceLine y={refY} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />}
          <Tooltip
            formatter={(v, name) => [fmt(v), name]}
            labelFormatter={(v) => `${xLabel} ${fmtInt(v, locale)}`}
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

// ---------------------------------------------------------------- Panel A

const DEFAULT_TOUR = {
  selected: STRATEGY_IDS,
  payoffs: DEFAULT_OPTIONS.payoffs,
  length: 'fixed',
  w: 0.99,
  noise: 0,
  generosity: DEFAULT_OPTIONS.generosity,
  reps: DEFAULT_OPTIONS.reps,
  seed: DEFAULT_OPTIONS.seed,
}

// Tournament options for games.js from the panel's settings.
function tourOptions(s) {
  return {
    ...DEFAULT_OPTIONS,
    payoffs: s.payoffs,
    w: s.length === 'random' ? s.w : 0,
    noise: s.noise,
    generosity: s.generosity,
    reps: s.reps,
    seed: s.seed,
  }
}

function playTournament(s) {
  const ids = STRATEGY_IDS.filter((id) => s.selected.includes(id))
  const o = tourOptions(s)
  return { ...runTournament(ids, o), options: o, settings: s }
}

// The moves of one match as two strips of cells: slate C, orange D.
function MoveStrips({ match, names, a, b, t }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const ROW = 16
  const GAP = 6

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const n = match.rounds
    const ctx = prepareCanvas(canvas, avail, 2 * ROW + GAP)
    const w = avail / n
    for (const [k, moves] of [match.movesA, match.movesB].entries()) {
      const y = k * (ROW + GAP)
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = moves[i] === C ? SLATE : ORANGE
        // Cells overlap by a hair so no seams show between them.
        ctx.fillRect(i * w, y, w + 0.5, ROW)
      }
    }
  })

  return (
    <div className="mt-3">
      <p className="font-mono text-xs text-slate-600">{names[a]}</p>
      <div ref={wrapRef} className="mt-1 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.h2hAria(names[a], names[b])} className="block" />
      </div>
      <p className="mt-1 font-mono text-xs text-slate-600">{names[b]}</p>
    </div>
  )
}

function TournamentPanel({ t, locale, settings, setSettings, result, onRun }) {
  const s = settings
  const set = (patch) => setSettings((prev) => ({ ...prev, ...patch }))
  const setPay = (k, v) => set({ payoffs: { ...s.payoffs, [k]: v } })
  const pd = checkPayoffs(s.payoffs)
  const enough = s.selected.length >= 2
  const stale = result && result.settings !== s

  const toggle = (id) =>
    set({ selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id] })

  // Head to head: two entrants of the last run.
  const [pair, setPair] = useState(['tft', 'alld'])
  const ids = result ? result.ids : []
  const a = ids.includes(pair[0]) ? pair[0] : ids[0]
  const b = ids.includes(pair[1]) ? pair[1] : ids[Math.min(1, ids.length - 1)]
  const match = useMemo(() => (result && a && b ? tournamentMatch(a, b, result.options, 0, true) : null), [result, a, b])
  const coopRate = (moves) => moves.reduce((n, m) => n + (m === C ? 1 : 0), 0) / moves.length

  const top = result ? Math.max(result.options.payoffs.R, ...result.scores) : 1
  const f1 = (v) => fmtFixed(v, 1, locale)
  const select =
    'w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-orange-400 focus:outline-none'

  return (
    <div className={panel}>
      <PanelTitle>A · {t.tournament}</PanelTitle>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-slate-700">{t.entrants}</legend>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {STRATEGIES.map(({ id }) => (
            <label key={id} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer min-w-0">
              <input type="checkbox" checked={s.selected.includes(id)} onChange={() => toggle(id)} className="mt-1 accent-orange-600" />
              <span className="min-w-0">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <LineSwatch color={COLOR[id]} dashed={DASHED[id]} />
                  {t.names[id]}
                </span>
                <span className="block text-xs text-slate-500">{t.rules[id]}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" className={chip(false)} onClick={() => set({ selected: STRATEGY_IDS })}>
            {t.all}
          </button>
          <button type="button" className={chip(false)} onClick={() => set({ selected: [] })}>
            {t.none}
          </button>
        </div>
      </fieldset>

      <p className="mt-5 text-sm font-medium text-slate-700">{t.payoffs}</p>
      <div className="mt-2 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Slider label={t.pT} min={0} max={10} step={0.5} value={s.payoffs.T} onChange={(v) => setPay('T', v)} format={f1} />
        <Slider label={t.pR} min={0} max={10} step={0.5} value={s.payoffs.R} onChange={(v) => setPay('R', v)} format={f1} />
        <Slider label={t.pP} min={0} max={10} step={0.5} value={s.payoffs.P} onChange={(v) => setPay('P', v)} format={f1} />
        <Slider label={t.pS} min={0} max={10} step={0.5} value={s.payoffs.S} onChange={(v) => setPay('S', v)} format={f1} />
      </div>
      {!pd.order && <Warning>{t.pdOrder}</Warning>}
      {pd.order && !pd.alternation && <Warning>{t.pdAlt}</Warning>}

      <div className="mt-5 space-y-3">
        <Chips label={t.length} options={['fixed', 'random']} value={s.length} names={t.lengths} onChange={(v) => set({ length: v })} />
      </div>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        {s.length === 'fixed' ? (
          <p className="text-sm text-slate-600 self-center">{t.rounds(fmtInt(DEFAULT_OPTIONS.rounds, locale))}</p>
        ) : (
          <div>
            <Slider label={t.w} min={0.9} max={0.995} step={0.005} value={s.w} onChange={(v) => set({ w: v })} format={(v) => fmtFixed(v, 3, locale)} />
            <p className="mt-1 font-mono text-xs text-slate-500">{t.wKey(fmtInt(1 / (1 - s.w), locale))}</p>
          </div>
        )}
        <Slider label={t.noise} min={0} max={0.1} step={0.005} value={s.noise} onChange={(v) => set({ noise: v })} format={(v) => fmtFixed(v, 3, locale)} />
        <Slider label={t.generosity} min={0} max={0.5} step={0.01} value={s.generosity} onChange={(v) => set({ generosity: v })} format={(v) => fmtPct(v, locale)} />
        <Slider label={t.reps} min={1} max={20} step={1} value={s.reps} onChange={(v) => set({ reps: v })} />
        <Slider label={t.seed} min={1} max={50} step={1} value={s.seed} onChange={(v) => set({ seed: v })} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SimControls onReset={enough ? onRun : undefined} labels={{ reset: t.runTournament }} />
        {!enough && <p className="text-xs text-orange-700">{t.needTwo}</p>}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.tourNote}</p>
      {stale && <p className="mt-2 font-mono text-xs text-slate-500">{t.stale}</p>}

      {result && (
        <div className="mt-6 min-w-0">
          <PanelTitle>{t.ranking}</PanelTitle>
          <ol className="mt-3 space-y-1.5" aria-label={t.rankAria}>
            {result.ranking.map((i, k) => {
              const id = result.ids[i]
              return (
                <li key={id} className="grid grid-cols-[1.25rem_minmax(0,9.5rem)_minmax(0,1fr)_3rem] sm:grid-cols-[1.5rem_13rem_minmax(0,1fr)_3.5rem] items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 tabular-nums">{k + 1}</span>
                  <span className="inline-flex items-center gap-1.5 min-w-0 text-slate-700">
                    <LineSwatch color={COLOR[id]} dashed={DASHED[id]} />
                    <span className="truncate" title={t.names[id]}>{t.names[id]}</span>
                  </span>
                  <span className="relative h-3 rounded-sm bg-slate-100">
                    <span
                      className="absolute inset-y-0 left-0 rounded-sm"
                      style={{ width: `${(100 * result.scores[i]) / top}%`, background: k === 0 ? ORANGE : SLATE }}
                    />
                    <span
                      className="absolute -inset-y-0.5 border-l border-dashed border-slate-900"
                      style={{ left: `${(100 * result.options.payoffs.R) / top}%` }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-right text-slate-900 tabular-nums">{fmtFixed(result.scores[i], 3, locale)}</span>
                </li>
              )
            })}
          </ol>
          <Legend>
            <LegendItem swatch={<LineSwatch color={INK} width={1} dashed />}>{t.refR(f1(result.options.payoffs.R))}</LegendItem>
          </Legend>

          {match && (
            <div className="mt-6 min-w-0">
              <PanelTitle>{t.headToHead}</PanelTitle>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <select className={select} value={a} onChange={(e) => setPair([e.target.value, b])} aria-label={`${t.headToHead} 1`}>
                  {ids.map((id) => (
                    <option key={id} value={id}>
                      {t.names[id]}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">{t.vs}</span>
                <select className={select} value={b} onChange={(e) => setPair([a, e.target.value])} aria-label={`${t.headToHead} 2`}>
                  {ids.map((id) => (
                    <option key={id} value={id}>
                      {t.names[id]}
                    </option>
                  ))}
                </select>
              </div>
              <MoveStrips match={match} names={t.names} a={a} b={b} t={t} />
              <Legend>
                <LegendItem swatch={<DotSwatch color={SLATE} square />}>{t.coop}</LegendItem>
                <LegendItem swatch={<DotSwatch color={ORANGE} square />}>{t.defect}</LegendItem>
              </Legend>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.h2hNote(fmtInt(match.rounds, locale))}</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
                {[
                  [a, match.scoreA, match.movesA],
                  [b, match.scoreB, match.movesB],
                ].map(([id, score, moves], k) => (
                  <Stat key={k} label={`${t.total}, ${t.names[id]}`}>
                    <span className={match.scoreA === match.scoreB || (k === 0) === match.scoreA > match.scoreB ? 'text-orange-700' : ''}>
                      {fmtFixed(score, 1, locale)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {fmtFixed(score / match.rounds, 3, locale)} {t.perRound} · {t.coopRate(fmtPct(coopRate(moves), locale))}
                    </span>
                  </Stat>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function newPopulation(result) {
  const n = result.ids.length
  const x = new Array(n).fill(1 / n)
  const hist = createHistory(1)
  const point = (g, x) => Object.fromEntries([['x', g], ...result.ids.map((id, i) => [id, x[i]])])
  record(hist, 0, point(0, x))
  return { result, x, gen: 0, hist, point }
}

function EvolutionPanel({ t, locale, result }) {
  const [gps, setGps] = useState(20)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()
  const ref = useRef(null)
  const acc = useRef(0)

  if (result && (!ref.current || ref.current.result !== result)) ref.current = newPopulation(result)
  const pop = ref.current

  // A new tournament restarts the population.
  useEffect(() => {
    setPlaying(false)
    acc.current = 0
    bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const step = () => {
    pop.x = replicatorStep(pop.x, pop.result.matrix)
    pop.gen++
    const { x, ...values } = pop.point(pop.gen, pop.x)
    record(pop.hist, pop.gen, values)
  }

  useAnimationLoop((dt) => {
    acc.current += (Math.min(dt, 100) / 1000) * gps
    while (acc.current >= 1 && pop.gen < MAX_GEN) {
      step()
      acc.current -= 1
    }
    if (pop.gen >= MAX_GEN) setPlaying(false)
    setFrame((f) => f + 1)
    bump()
  }, playing && !!pop)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const data = useMemo(
    () => (pop ? pop.hist.points.slice() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pop, version],
  )

  if (!pop) {
    return (
      <div className={panel}>
        <PanelTitle>B · {t.evolution}</PanelTitle>
        <p className="mt-3 text-sm text-slate-600">{t.evoNoTour}</p>
      </div>
    )
  }

  const { ids, matrix } = pop.result
  const lead = pop.x.reduce((best, v, i) => (v > pop.x[best] ? i : best), 0)
  let meanPay = 0
  for (let i = 0; i < ids.length; i++) for (let j = 0; j < ids.length; j++) meanPay += pop.x[i] * matrix[i][j] * pop.x[j]

  return (
    <div className={panel}>
      <PanelTitle>B · {t.evolution}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Slider label={t.gps} min={1} max={100} step={1} value={gps} onChange={setGps} />
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
            ref.current = newPopulation(result)
            bump(true)
          }}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.evoNote}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.generation}>{fmtInt(pop.gen, locale)}</Stat>
        <Stat label={t.leader}>
          <span className="text-orange-700">{fmtPct(pop.x[lead], locale, 1)}</span>
          <span className="block text-xs text-slate-500 truncate">{t.names[ids[lead]]}</span>
        </Stat>
        <Stat label={t.meanPay}>
          {fmtFixed(meanPay, 3, locale)}
          <span className="block text-xs text-slate-500">{t.meanPayKey}</span>
        </Stat>
      </div>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.sharesChart}</PanelTitle>
        <HistoryChart
          data={data}
          series={ids.map((id) => ({ key: id, name: t.names[id], color: COLOR[id], dashed: DASHED[id] }))}
          aria={t.sharesAria}
          locale={locale}
          xLabel={t.genLabel}
          yDomain={[0, 1]}
          yTicks={[0, 0.25, 0.5, 0.75, 1]}
          fmt={(v) => fmtPct(v, locale, 1)}
          tickFmt={(v) => fmtPct(v, locale)}
          height="h-64"
        />
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
          {ids.map((id, i) => (
            <li key={id} className="flex items-center gap-1.5 min-w-0">
              <LineSwatch color={COLOR[id]} dashed={DASHED[id]} />
              <span className="truncate">{t.names[id]}</span>
              <span className="ml-auto text-slate-900 tabular-nums">{fmtPct(pop.x[i], locale, 1)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{t.dashedKey}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

// Cell colours, packed as RGBA for ImageData: [was][is], C = 0, D = 1.
const hexRGB = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16))
const CELL_RGB = [
  [hexRGB(SLATE), hexRGB(ORANGE_LIGHT)],
  [hexRGB(SLATE_LIGHT), hexRGB(ORANGE)],
]

function newGrid(n, start, share, seed) {
  const g = createSpatial(n, start, share, mulberry32(seed))
  const hist = createHistory(1)
  record(hist, 0, { coop: coopShare(g) })
  return { g, hist }
}

function GridPanel({ t, locale }) {
  const [n, setN] = useState(99)
  const [b, setB] = useState(1.85)
  const [start, setStart] = useState('defector')
  const [share, setShare] = useState(0.9)
  const [seed, setSeed] = useState(1)
  const [speed, setSpeed] = useState(10)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion()

  const key = `${n}-${start}-${share}-${seed}`
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = newGrid(n, start, share, seed)
    ref.current.key = key
  }
  const model = ref.current
  const { g } = model

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const offRef = useRef(null)
  const avail = useElementWidth(wrapRef)
  const acc = useRef(0)

  const reset = (fn) => {
    setPlaying(false)
    acc.current = 0
    fn()
    bump(true)
  }

  const step = () => {
    spatialStep(g, b)
    record(model.hist, g.t, { coop: coopShare(g) })
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

  // ---- drawing: one pixel per cell on an offscreen canvas, scaled up crisply.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !avail) return
    const css = Math.min(avail, MAX_CANVAS)
    const ctx = prepareCanvas(canvas, css, css)
    if (!offRef.current) offRef.current = document.createElement('canvas')
    const off = offRef.current
    if (off.width !== g.n) {
      off.width = g.n
      off.height = g.n
    }
    const octx = off.getContext('2d')
    const img = octx.createImageData(g.n, g.n)
    const { s, prev } = g
    for (let k = 0; k < s.length; k++) {
      const rgb = CELL_RGB[prev[k]][s[k]]
      img.data[4 * k] = rgb[0]
      img.data[4 * k + 1] = rgb[1]
      img.data[4 * k + 2] = rgb[2]
      img.data[4 * k + 3] = 255
    }
    octx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(off, 0, 0, css, css)
  })

  let coop = 0
  let newC = 0
  let newD = 0
  for (let k = 0; k < g.s.length; k++) {
    if (g.s[k] === C) coop++
    if (g.prev[k] !== g.s[k]) g.s[k] === C ? newC++ : newD++
  }

  const coopData = useMemo(
    () => model.hist.points.slice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, version],
  )
  const inBand = b > 1.8 && b < 2

  return (
    <div className={panel}>
      <PanelTitle>C · {t.grid}</PanelTitle>
      <div className="mt-4 space-y-3">
        <Chips label={t.start} options={['defector', 'random']} value={start} names={t.starts} onChange={(v) => reset(() => setStart(v))} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.b} min={1} max={2.5} step={0.01} value={b} onChange={setB} format={(v) => fmtFixed(v, 2, locale)} />
        <Slider label={t.side} min={51} max={199} step={2} value={n} onChange={(v) => reset(() => setN(v))} format={(v) => `${v} × ${v}`} />
        {start === 'random' && (
          <>
            <Slider label={t.share0} min={0.05} max={0.95} step={0.05} value={share} onChange={(v) => reset(() => setShare(v))} format={(v) => fmtPct(v, locale)} />
            <Slider label={t.seed} min={1} max={50} step={1} value={seed} onChange={(v) => reset(() => setSeed(v))} />
          </>
        )}
        <Slider label={t.speed} min={1} max={30} step={1} value={speed} onChange={setSpeed} />
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
          onReset={() => reset(() => (ref.current = null))}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.gridNote}</p>

      <div ref={wrapRef} className="mt-4 min-w-0">
        <canvas ref={canvasRef} role="img" aria-label={t.gridAria} className="block mx-auto outline outline-1 outline-slate-200" />
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={SLATE} square />}>{t.cc}</LegendItem>
        <LegendItem swatch={<DotSwatch color={ORANGE} square />}>{t.dd}</LegendItem>
        <LegendItem swatch={<DotSwatch color={SLATE_LIGHT} square />}>{t.dc}</LegendItem>
        <LegendItem swatch={<DotSwatch color={ORANGE_LIGHT} square />}>{t.cd}</LegendItem>
      </Legend>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.stepStat}>{fmtInt(g.t, locale)}</Stat>
        <Stat label={t.coopStat}>
          <span className="text-orange-700">{fmtPct(coop / g.s.length, locale, 1)}</span>
        </Stat>
        <Stat label={t.newC}>{fmtInt(newC, locale)}</Stat>
        <Stat label={t.newD}>{fmtInt(newD, locale)}</Stat>
      </div>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.coopChart}</PanelTitle>
        <HistoryChart
          data={coopData}
          series={[{ key: 'coop', name: t.coopStat, color: SLATE }]}
          aria={t.coopAria}
          locale={locale}
          xLabel={t.stepLabel}
          yDomain={[0, 1]}
          yTicks={[0, 0.25, 0.5, 0.75, 1]}
          fmt={(v) => fmtPct(v, locale, 1)}
          tickFmt={(v) => fmtPct(v, locale)}
          refY={inBand ? NM_RANDOM_SHARE : null}
        />
        <Legend>
          <LegendItem swatch={<LineSwatch color={SLATE} />}>{t.coopStat}</LegendItem>
          {inBand && <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.nmRef(fmtFixed(NM_RANDOM_SHARE, 3, locale))}</LegendItem>}
        </Legend>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel D

function VolunteerPanel({ t, locale }) {
  const [c, setC] = useState(1)
  const [a, setA] = useState(4)
  const [N, setN] = useState(5)

  const eq = volunteerEquilibrium(c, a, N)

  // The curve against N, with a Monte Carlo point for each size.
  const curve = useMemo(() => {
    const random = mulberry32(2024)
    const line = []
    const qLine = []
    const dots = []
    for (const n of VD_SIZES) {
      const e = volunteerEquilibrium(c, a, n)
      line.push({ x: n, y: e.none })
      qLine.push({ x: n, y: e.q })
      dots.push({ x: n, y: volunteerMonteCarlo(e.q, n, VD_TRIALS, random).none })
    }
    return { line, qLine, dots }
  }, [c, a])

  const check = useMemo(() => volunteerMonteCarlo(eq.q, N, VD_CHECK, mulberry32(7 + N)), [eq.q, N])
  const se = Math.sqrt((eq.none * (1 - eq.none)) / VD_CHECK)

  return (
    <div className={panel}>
      <PanelTitle>D · {t.volunteer}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider
          label={t.loss}
          min={0.5}
          max={10}
          step={0.1}
          value={a}
          onChange={(v) => {
            setA(v)
            if (c >= v) setC(Math.round((v - 0.1) * 10) / 10)
          }}
          format={(v) => fmtFixed(v, 1, locale)}
        />
        <Slider label={t.cost} min={0.1} max={Math.round((a - 0.1) * 10) / 10} step={0.1} value={c} onChange={setC} format={(v) => fmtFixed(v, 1, locale)} />
        <Slider label={t.N} min={2} max={50} step={1} value={N} onChange={setN} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.vdNote}</p>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
        <Stat label={t.q}>
          q = {fmtFixed(eq.q, 3, locale)}
        </Stat>
        <Stat label={t.vol}>{fmtPct(1 - eq.q, locale, 1)}</Stat>
        <Stat label={t.expected}>{fmtFixed(N * (1 - eq.q), 2, locale)}</Stat>
        <Stat label={t.pNone}>
          <span className="text-orange-700">{fmtPct(eq.none, locale, 1)}</span>
        </Stat>
      </div>
      <p className="mt-2 font-mono text-xs text-slate-500 leading-relaxed">
        N = {N}: {t.mcNone(fmtPct(check.none, locale, 1), fmtPct(se, locale, 1))} · {t.mcFree(`−${fmtFixed(a * check.othersNone, 2, locale)}`, `−${fmtFixed(c, 1, locale)}`)}
      </p>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.vdChart}</PanelTitle>
        <div className="mt-3 h-64 -ml-4" role="img" aria-label={t.vdAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={[0, 50]} ticks={[2, 10, 20, 30, 40, 50]} tick={axisTick} stroke={MUTED} />
              <YAxis dataKey="y" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => fmtFixed(v, 2, locale)} width={44} tick={axisTick} stroke={MUTED} />
              <ReferenceLine y={c / a} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
              <ReferenceLine x={N} stroke={MUTED} strokeWidth={1} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(v, name) => (name === 'x' ? [fmtInt(v, locale), 'N'] : [fmtFixed(v, 3, locale), 'p'])}
                separator=" "
                contentStyle={tooltipStyle}
              />
              <Scatter data={curve.qLine} line={{ stroke: SLATE_LIGHT, strokeWidth: 2 }} shape={NoDot} isAnimationActive={false} />
              <Scatter data={curve.dots} shape={SmallDot} isAnimationActive={false} />
              <Scatter data={curve.line} line={{ stroke: ORANGE, strokeWidth: 2 }} shape={NoDot} isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.lineNone}</LegendItem>
          <LegendItem swatch={<DotSwatch color={SLATE} size={6} />}>{t.dotsNone(fmtInt(VD_TRIALS, locale))}</LegendItem>
          <LegendItem swatch={<LineSwatch color={SLATE_LIGHT} />}>{t.lineQ}</LegendItem>
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.limit(fmtFixed(c / a, 3, locale))}</LegendItem>
        </Legend>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function Cooperation({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  // Panel A's settings and last tournament live here: Panel B evolves its payoffs.
  const [settings, setSettings] = useState(DEFAULT_TOUR)
  const [result, setResult] = useState(() => playTournament(DEFAULT_TOUR))
  return (
    <div className="space-y-6">
      <TournamentPanel t={t} locale={locale} settings={settings} setSettings={setSettings} result={result} onRun={() => setResult(playTournament(settings))} />
      <EvolutionPanel t={t} locale={locale} result={result} />
      <GridPanel t={t} locale={locale} />
      <VolunteerPanel t={t} locale={locale} />
    </div>
  )
}
