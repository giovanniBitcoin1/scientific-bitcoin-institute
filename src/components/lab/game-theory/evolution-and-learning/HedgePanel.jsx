import { useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { Pill, Stat, MONO, SLATE, INK, ORANGE_DARK, GRID } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { run, bound, tunedEta, equilibria, HEDGE_GAMES } from './hedge.js'
import { num } from './FigureFates.jsx'

// Panel C, "Learning by regret": two players run multiplicative weights
// (Hedge) in one of module 01's games, each seeing only his own payoffs and
// the other's actions. The run is recomputed at every change (T = 10,000
// takes a few milliseconds). The start (p0, q0) is set by clicking the unit
// square (by touch only with "Start" on: the DrawToggle rule). "New run" n
// uses seed n.

const SKY = '#0369a1'
const S = 240
const PAD = 26

const T_ = {
  en: {
    games: { chicken: 'Chicken', pennies: 'Matching pennies', pd: 'Dilemma', stag: 'Stag hunt', battle: 'Battle of the sexes' },
    names: { chicken: ['Swerve', 'Go'], pennies: ['Heads', 'Tails'], pd: ['C', 'D'], stag: ['Stag', 'Hare'], battle: ['Concert', 'Match'] },
    eta: 'η, the learning rate',
    T: 'T, the rounds',
    tune: 'η for this T',
    start: 'Start',
    newRun: 'New run',
    runNo: (s) => `Run no. ${s} (seed ${s})`,
    startAt: (p, q) => `start (${p}, ${q})`,
    p: (a) => `p, row plays ${a}`,
    q: (a) => `q, column plays ${a}`,
    final: 'Final (p, q)',
    first: 'Share of each player’s first action',
    avg: 'Average payoffs (the game’s units)',
    bnd: 'Bound per round at T',
    reg: 'Average regret at T (row, column)',
    vio: 'Gain from switching, per round (largest)',
    vioNote: 'Whenever a player played one action, how much more per round the other action would have paid him against what was actually played: 0 at a correlated equilibrium.',
    table: 'How often each cell was played',
    legend: ['row player', 'column player', 'bound'],
    chart: 'average regret against t',
    hint: 'Click the square to start from there.',
    aria: 'The unit square of (p, q) with the path of the two learners and the Nash equilibria',
  },
  it: {
    games: { chicken: 'Gioco del pollo', pennies: 'Pari o dispari', pd: 'Dilemma', stag: 'Caccia al cervo', battle: 'Battaglia dei sessi' },
    names: { chicken: ['Sterza', 'Dritto'], pennies: ['Testa', 'Croce'], pd: ['C', 'D'], stag: ['Cervo', 'Lepre'], battle: ['Concerto', 'Partita'] },
    eta: 'η, il tasso di apprendimento',
    T: 'T, i turni',
    tune: 'η per questo T',
    start: 'Partenza',
    newRun: 'Nuova prova',
    runNo: (s) => `Prova n. ${s} (seme ${s})`,
    startAt: (p, q) => `partenza (${p}; ${q})`,
    p: (a) => `p, la riga gioca ${a}`,
    q: (a) => `q, la colonna gioca ${a}`,
    final: '(p, q) finale',
    first: 'Quota della prima azione di ciascuno',
    avg: 'Payoff medi (nelle unità del gioco)',
    bnd: 'Limite per turno a T',
    reg: 'Regret medio a T (riga, colonna)',
    vio: 'Guadagno dal cambiare, per turno (il più grande)',
    vioNote: 'Ogni volta che un giocatore ha giocato un’azione, quanto in più per turno gli avrebbe reso l’altra contro ciò che è stato davvero giocato: 0 in un equilibrio correlato.',
    table: 'Quanto spesso è stata giocata ogni cella',
    legend: ['giocatore di riga', 'giocatore di colonna', 'limite'],
    chart: 'regret medio in funzione di t',
    hint: 'Clicca sul quadrato per partire da lì.',
    aria: 'Il quadrato unitario di (p, q) con il cammino dei due giocatori e gli equilibri di Nash',
  },
}

const sx = (p) => PAD + p * (S - PAD - 8)
const sy = (q) => S - PAD - q * (S - PAD - 8)

export default function HedgePanel({ lang = 'en' }) {
  const L = T_[lang] || T_.en
  const n = (v, d = 4) => num(v, lang, d)
  const [game, setGame] = useState('chicken')
  const [eta, setEta] = useState(0.1)
  const [T, setT] = useState(2000)
  const [start, setStart] = useState([0.5, 0.5])
  const [seed, setSeed] = useState(1)
  const [armed, setArmed] = useState(false)
  const svgRef = useRef(null)
  const r = useMemo(() => run(game, { T, eta, p0: start[0], q0: start[1], seed }), [game, T, eta, start, seed])
  const eq = equilibria(game)
  const nm = L.names[game]

  // The path, thinned to about 600 points.
  const step = Math.max(1, Math.floor(T / 600))
  const path = []
  for (let t = 0; t <= T; t += step) path.push([r.P[t], r.Q[t]])
  path.push([r.P[T], r.Q[T]])
  const regPts = (arr) => {
    const out = []
    for (let t = 10; t <= T; t += Math.max(1, Math.floor(T / 300))) out.push([t, arr[t]])
    return out
  }
  const bPts = regPts(Float64Array.from({ length: T + 1 }, (_, t) => (t ? Math.max(bound(t, eta, start[0]), bound(t, eta, start[1])) : 0)))
  const yTop = Math.max(0.02, bound(Math.max(10, Math.floor(T / 10)), eta, Math.min(start[0], start[1])))

  const onPointerDown = (e) => {
    if (!canEdit(armed, e)) return
    const b = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - b.left) / b.width) * S
    const y = ((e.clientY - b.top) / b.height) * S
    const p = (x - PAD) / (S - PAD - 8)
    const q = (S - PAD - y) / (S - PAD - 8)
    if (p < -0.05 || p > 1.05 || q < -0.05 || q > 1.05) return
    const c = (v) => Math.min(0.99, Math.max(0.01, Math.round(v * 100) / 100))
    setStart([c(p), c(q)])
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="hedge-games">
        {HEDGE_GAMES.map((k) => (
          <Pill key={k} active={game === k} onClick={() => { setGame(k); setSeed(1); setStart([0.5, 0.5]) }}>
            {L.games[k]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.eta} min={0.01} max={0.5} step={0.01} value={eta} onChange={(v) => setEta(Math.round(v * 10000) / 10000)} format={(v) => n(v, 4)} />
        <Slider label={L.T} min={100} max={10000} step={100} value={T} onChange={setT} format={(v) => v.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill onClick={() => setEta(Math.round(tunedEta(T) * 10000) / 10000)} data-role="hedge-tune">
          {L.tune}
        </Pill>
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="hedge-new">
          {L.newRun}
        </Pill>
        <DrawToggle on={armed} onChange={setArmed} label={L.start} />
        <span className="text-xs text-slate-500 font-mono" data-role="hedge-seed">
          {L.runNo(seed)}, {L.startAt(n(start[0], 2), n(start[1], 2))}
        </span>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${S} ${S}`}
            className={`w-full h-auto max-w-[16rem] cursor-crosshair ${drawCanvasClass(armed)}`}
            role="img"
            aria-label={L.aria}
            onPointerDown={onPointerDown}
            data-role="hedge-square"
            data-draw-surface
          >
            <rect x={sx(0)} y={sy(1)} width={sx(1) - sx(0)} height={sy(0) - sy(1)} fill="#f8fafc" stroke={SLATE} />
            {[0.25, 0.5, 0.75].map((v) => (
              <g key={v}>
                <line x1={sx(v)} x2={sx(v)} y1={sy(0)} y2={sy(1)} stroke={GRID} />
                <line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} stroke={GRID} />
              </g>
            ))}
            {[0, 0.5, 1].map((v) => (
              <g key={v}>
                <text x={sx(v)} y={S - PAD + 11} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="middle">{n(v, v === 0.5 ? 1 : 0)}</text>
                <text x={PAD - 4} y={sy(v) + 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">{n(v, v === 0.5 ? 1 : 0)}</text>
              </g>
            ))}
            <text x={sx(1)} y={S - 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">{L.p(nm[0])} →</text>
            <text x={2} y={sy(1) - 6} fontSize="8" fontFamily={MONO} fill={SLATE}>↑ {L.q(nm[0])}</text>
            <polyline points={path.map(([p, q]) => `${sx(p).toFixed(1)},${sy(q).toFixed(1)}`).join(' ')} fill="none" stroke={ORANGE_DARK} strokeWidth="1.2" strokeLinejoin="round" />
            {eq.pure.map(([p, q]) => (
              <circle key={`${p}${q}`} cx={sx(p)} cy={sy(q)} r="5" fill={INK} data-eq="pure" />
            ))}
            {eq.mixed && <circle cx={sx(eq.mixed[0])} cy={sy(eq.mixed[1])} r="4.5" fill="white" stroke={INK} strokeWidth="2" data-eq="mixed" />}
            <circle cx={sx(start[0])} cy={sy(start[1])} r="3" fill={SKY} />
            <circle cx={sx(r.final[0])} cy={sy(r.final[1])} r="4" fill={ORANGE_DARK} stroke="white" strokeWidth="1.5" />
          </svg>
          <p className="text-xs text-slate-500 leading-snug">{L.hint}</p>
        </div>
        <div className="min-w-0">
          <Chart
            height={150}
            x={{ min: 10, max: T, ticks: [10, Math.round(T / 2), T], label: 't' }}
            y={{ min: Math.min(0, ...regPts(r.regR).map((p) => p[1]), ...regPts(r.regC).map((p) => p[1])), max: yTop, ticks: [0, yTop / 2, yTop], format: (v) => n(v, 3) }}
            series={[
              { points: regPts(r.regR), color: ORANGE_DARK },
              { points: regPts(r.regC), color: SKY },
              { points: bPts, color: SLATE, dashed: true, width: 1.2 },
            ]}
            aria={L.chart}
          />
          <Legend items={L.legend.map((label, i) => ({ label, color: [ORANGE_DARK, SKY, SLATE][i], dashed: i === 2 }))} />
          <table className="mt-3 text-xs font-mono tabular-nums border-collapse" data-role="hedge-table">
            <caption className="text-left text-xs text-slate-500 font-sans pb-1">{L.table}</caption>
            <tbody>
              <tr>
                <td />
                {nm.map((c) => (
                  <td key={c} className="px-2 py-0.5 text-slate-500">{c}</td>
                ))}
              </tr>
              {[0, 1].map((i) => (
                <tr key={i}>
                  <td className="pr-2 text-slate-500">{nm[i]}</td>
                  {[0, 1].map((j) => (
                    <td key={j} className="px-2 py-1 border border-slate-200 bg-white text-slate-900 text-center" data-cell={`${i}${j}`}>
                      {n(r.freq[i][j], 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-3xl" data-role="hedge-readout">
        <Stat label={L.final}>
          <span data-value="final">({n(r.final[0])}, {n(r.final[1])})</span>
        </Stat>
        <Stat label={L.first}>
          <span data-value="first">{n(r.firstShare[0], 3)}, {n(r.firstShare[1], 3)}</span>
        </Stat>
        <Stat label={L.avg}>
          <span data-value="avg">{n(r.average[0], 3)}, {n(r.average[1], 3)}</span>
        </Stat>
        <Stat label={L.reg}>
          <span data-value="regret">{n(r.regR[T])}, {n(r.regC[T])}</span>
        </Stat>
        <Stat label={L.bnd}>
          <span data-value="bound">{n(Math.max(...r.bound))}</span>
        </Stat>
        <Stat label={L.vio}>
          <span data-value="violation">{n(r.violation.max)}</span>
        </Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug max-w-3xl">{L.vioNote}</p>
    </div>
  )
}
