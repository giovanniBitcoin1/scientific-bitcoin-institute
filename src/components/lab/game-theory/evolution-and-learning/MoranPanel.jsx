import { useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { mulberry32 } from '../../rng.js'
import { Pill, Stat, MONO, SLATE, INK, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { GAMES, fitness, fixationFrom, constantFit, curve, runMany, moranStep, xStar, thirdRule } from './moran.js'
import { num } from './FigureFates.jsx'

// Panel B, "One mutant": the Moran process with a game. Fixation
// probabilities from the formula (fast, so the chart of N·ρ against N is
// recomputed at every change); "Run 10,000 mutants" simulates the jump chain
// with seed n for run n; "Watch one" animates the full process on N dots,
// one event per frame.

const SKY = '#0369a1'
const RUNS = 10000
// The mutant's strategy in each game, as moran.js names it (A is the mutant).
const MUTANTS = { stag: ['stag', 'hare'], pd: ['C', 'D'], chicken: ['dove', 'hawk'] }

const T_ = {
  en: {
    games: { constant: 'Constant fitness', stag: 'Stag hunt', coordination: 'Coordination', pd: 'Dilemma', chicken: 'Hawk and dove' },
    mutant: 'The mutant',
    kinds: { stag: ['stag', 'hare'], pd: ['C', 'D'], chicken: ['dove', 'hawk'] },
    N: 'N, the population',
    w: 'w, the intensity of selection',
    r: 'r, the mutant’s fitness',
    x: 'x*, the unstable point',
    run: 'Run 10,000 mutants',
    watch: 'Watch one',
    stop: 'Stop',
    rhoA: 'ρ_A, one mutant takes over',
    rhoB: 'ρ_B, the reverse: one B among A',
    neutral: '1/N, a neutral mutant',
    ratio: 'ρ_A/ρ_B',
    measured: 'Measured',
    measuredV: (p, lo, hi, s) => `${p} (95%: ${lo}–${hi}), run ${s}`,
    third: 'x* < 1/3?',
    large: 'a + 2b > c + 2d?',
    yes: 'yes',
    no: 'no',
    payoffs: (g) => `A vs A ${g.a}, A vs B ${g.b}, B vs A ${g.c}, B vs B ${g.d}`,
    note: 'The runs skip the steps where nothing changes (the jump chain): the probability of fixation is the same. "Watch one" shows every step.',
    noW: 'In this game w does not apply: the mutant has fitness r, the others 1.',
    legend: ['A mutant among B', 'B mutant among A', 'neutral, 1'],
    chart: 'N·ρ against N',
    watching: (e, i, N) => `Step ${e}: ${i} mutant${i === 1 ? '' : 's'} of ${N}`,
    fixed: 'the mutant took over',
    lost: 'the mutant died out',
    aria: 'N dots, the population; orange dots are mutants',
  },
  it: {
    games: { constant: 'Fitness costante', stag: 'Caccia al cervo', coordination: 'Coordinamento', pd: 'Dilemma', chicken: 'Falco e colomba' },
    mutant: 'Il mutante',
    kinds: { stag: ['cervo', 'lepre'], pd: ['C', 'D'], chicken: ['colomba', 'falco'] },
    N: 'N, la popolazione',
    w: 'w, l’intensità della selezione',
    r: 'r, la fitness del mutante',
    x: 'x*, il punto instabile',
    run: '10.000 mutanti',
    watch: 'Guardane uno',
    stop: 'Ferma',
    rhoA: 'ρ_A, un mutante prende il sopravvento',
    rhoB: 'ρ_B, al contrario: un B tra gli A',
    neutral: '1/N, un mutante neutrale',
    ratio: 'ρ_A/ρ_B',
    measured: 'Misurato',
    measuredV: (p, lo, hi, s) => `${p} (95%: ${lo}–${hi}), prova ${s}`,
    third: 'x* < 1/3?',
    large: 'a + 2b > c + 2d?',
    yes: 'sì',
    no: 'no',
    payoffs: (g) => `A contro A ${g.a}, A contro B ${g.b}, B contro A ${g.c}, B contro B ${g.d}`,
    note: 'Le prove saltano i passi in cui non cambia nulla (la catena dei salti): la probabilità di fissazione è la stessa. «Guardane uno» mostra ogni passo.',
    noW: 'In questo gioco w non conta: il mutante ha fitness r, gli altri 1.',
    legend: ['mutante A tra i B', 'mutante B tra gli A', 'neutrale, 1'],
    chart: 'N·ρ in funzione di N',
    watching: (e, i, N) => `Passo ${e}: ${i} ${i === 1 ? 'mutante' : 'mutanti'} su ${N}`,
    fixed: 'il mutante ha preso il sopravvento',
    lost: 'il mutante si è estinto',
    aria: 'N punti, la popolazione; i punti arancioni sono mutanti',
  },
}

export default function MoranPanel({ lang = 'en' }) {
  const L = T_[lang] || T_.en
  const n = (v, d = 4) => num(v, lang, d)
  const [game, setGame] = useState('constant')
  const [kind, setKind] = useState(0)
  const [N, setN] = useState(10)
  const [w, setW] = useState(0.1)
  const [r, setR] = useState(1.1)
  const [xs, setXs] = useState(0.3)
  const [runNo, setRunNo] = useState(0)
  const [result, setResult] = useState(null)
  const [watch, setWatch] = useState(null)
  const rngRef = useRef(null)

  const g = game === 'constant' ? null : game === 'coordination' ? GAMES.coordination(xs) : GAMES[game](MUTANTS[game][kind])
  const key = `${game}|${kind}|${N}|${w}|${r}|${xs}`
  const fitFor = useMemo(() => (M) => (g ? (i) => fitness(g, M, w, i) : constantFit(r)), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const { rhoA, rhoB } = fixationFrom(fitFor(N), N)
  const cv = useMemo(() => curve(fitFor), [fitFor])
  const shown = result && result.key === key ? result : null

  const all = [...cv.A, ...cv.B].map((p) => p[1]).filter((v) => v > 0)
  const lo = Math.max(1e-4, 10 ** Math.floor(Math.log10(Math.min(0.5, ...all))))
  const hi = 10 ** Math.ceil(Math.log10(Math.max(2, ...all)))
  const yTicks = []
  for (let e = Math.round(Math.log10(lo)); e <= Math.round(Math.log10(hi)); e++) yTicks.push(10 ** e)

  const doRun = () => {
    const s = runNo + 1
    setRunNo(s)
    setResult({ key, ...runMany(fitFor(N), N, RUNS, s), seed: s })
  }
  const startWatch = () => {
    rngRef.current = mulberry32(runNo + 1001)
    const pop = new Array(N).fill(0)
    pop[0] = 1
    setWatch({ key, pop, events: 0, last: null, done: null })
  }
  const watching = watch && watch.key === key && !watch.done
  useAnimationLoop(() => {
    setWatch((s) => {
      if (!s || s.done) return s
      const pop = s.pop.slice()
      const ev = moranStep(pop, fitFor(pop.length), rngRef.current)
      const i = pop.reduce((p, v) => p + v, 0)
      return { ...s, pop, events: s.events + 1, last: ev, done: i === 0 ? 'lost' : i === pop.length ? 'fixed' : null }
    })
  }, !!watching)

  const cols = Math.ceil(Math.sqrt(N * 2.2))
  const rows = Math.ceil(N / cols)
  const cell = 300 / cols
  const showWatch = watch && watch.key === key
  const mutants = showWatch ? watch.pop.reduce((p, v) => p + v, 0) : 0

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="moran-games">
        {Object.keys(L.games).map((k) => (
          <Pill key={k} active={game === k} onClick={() => { setGame(k); setKind(0) }}>
            {L.games[k]}
          </Pill>
        ))}
      </div>
      {L.kinds[game] && (
        <div className="mt-2 flex flex-wrap items-center gap-2" data-role="moran-mutant">
          <span className="text-sm font-medium text-slate-700 mr-1">{L.mutant}</span>
          {L.kinds[game].map((nm, i) => (
            <Pill key={nm} active={kind === i} onClick={() => setKind(i)}>
              {nm}
            </Pill>
          ))}
        </div>
      )}
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.N} min={2} max={100} step={1} value={N} onChange={setN} />
        {game === 'constant' ? (
          <Slider label={L.r} min={0.5} max={2} step={0.01} value={r} onChange={(v) => setR(Math.round(v * 100) / 100)} format={(v) => n(v, 2)} />
        ) : (
          <Slider label={L.w} min={0.001} max={0.9} log value={w} onChange={(v) => setW(Number(v.toPrecision(2)))} format={(v) => n(v, v < 0.01 ? 4 : v < 0.1 ? 3 : 2)} />
        )}
        {game === 'coordination' && <Slider label={L.x} min={0.1} max={0.9} step={0.01} value={xs} onChange={(v) => setXs(Math.round(v * 100) / 100)} format={(v) => n(v, 2)} />}
      </div>
      <p className="mt-2 text-xs text-slate-500 font-mono" data-role="moran-payoffs">
        {g ? L.payoffs({ a: n(g.a, g.a % 1 ? 3 : 0), b: n(g.b, 0), c: n(g.c, 0), d: n(g.d, g.d % 1 ? 3 : 0) }) : L.noW}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={doRun} data-role="moran-run">
          {L.run}
        </Pill>
        <Pill onClick={watching ? () => setWatch((s) => ({ ...s, done: 'stopped' })) : startWatch} data-role="moran-watch">
          {watching ? L.stop : L.watch}
        </Pill>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-3xl" data-role="moran-readout">
        <Stat label={L.rhoA}>
          <span data-value="rhoA">{n(rhoA, 6)}</span>
        </Stat>
        <Stat label={L.rhoB}>
          <span data-value="rhoB">{rhoB < 1e-6 ? rhoB.toExponential(2) : n(rhoB, 6)}</span>
        </Stat>
        <Stat label={L.neutral}>
          <span data-value="neutral">{n(1 / N, 6)}</span>
        </Stat>
        <Stat label={L.ratio}>
          <span data-value="ratio">{rhoB > 0 ? (rhoA / rhoB >= 1e4 ? (rhoA / rhoB).toExponential(2) : n(rhoA / rhoB, 2)) : '–'}</span>
        </Stat>
        {game === 'coordination' && (
          <Stat label={`${L.third} ${L.large}`}>
            <span data-value="third">
              {xStar(g) < 1 / 3 ? L.yes : L.no}; {thirdRule(g) ? L.yes : L.no}
            </span>
          </Stat>
        )}
        {shown && (
          <Stat label={L.measured} wide>
            <span data-value="measured">{L.measuredV(n(shown.p), n(shown.lo), n(shown.hi), shown.seed)}</span>
          </Stat>
        )}
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <Chart
            height={170}
            x={{ min: 2, max: 100, ticks: [2, 25, 50, 75, 100], label: 'N' }}
            y={{ min: lo, max: hi, log: true, ticks: yTicks, label: 'N·ρ', labelSide: 'left' }}
            series={[
              { points: cv.A, color: ORANGE_DARK },
              { points: cv.B, color: SKY },
              { points: [[2, 1], [100, 1]], color: SLATE, dashed: true, width: 1 },
            ]}
            marks={[{ x: N, color: '#cbd5e1' }]}
            aria={L.chart}
          >
            {({ sx, sy }) =>
              shown && shown.p > 0 ? (
                <g data-role="moran-measured">
                  <line x1={sx(N)} x2={sx(N)} y1={sy(Math.max(lo, N * shown.lo))} y2={sy(N * shown.hi)} stroke={INK} strokeWidth="2" />
                  <circle cx={sx(N)} cy={sy(N * shown.p)} r="3" fill={INK} />
                </g>
              ) : null
            }
          </Chart>
          <Legend items={L.legend.map((label, i) => ({ label, color: [ORANGE_DARK, SKY, SLATE][i], dashed: i === 2 }))} />
        </div>
        <div className="min-w-0">
          <svg viewBox={`0 0 300 ${Math.max(40, rows * cell + 4)}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="moran-dots">
            {Array.from({ length: N }, (_, k) => {
              const on = showWatch ? watch.pop[k] : k === 0
              const hit = showWatch && watch.last && (watch.last.dead === k ? 'dead' : watch.last.parent === k ? 'parent' : null)
              return (
                <circle key={k} cx={(k % cols) * cell + cell / 2} cy={Math.floor(k / cols) * cell + cell / 2 + 2} r={Math.min(9, cell * 0.36)}
                  fill={on ? ORANGE_DARK : '#e2e8f0'} stroke={hit ? INK : 'none'} strokeWidth={hit === 'dead' ? 2 : 1} data-mutant={on ? 1 : 0} />
              )
            })}
          </svg>
          <p className="text-xs text-slate-600 font-mono" data-role="moran-watch-text">
            {showWatch ? `${L.watching(watch.events, mutants, N)}${watch.done === 'fixed' ? ` — ${L.fixed}` : watch.done === 'lost' ? ` — ${L.lost}` : ''}` : ' '}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug max-w-3xl">{L.note}</p>
    </div>
  )
}
