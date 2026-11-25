import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, MUTED, ORANGE_DARK, MONO } from '../../network/ui.jsx'
import Chart from '../../network/charts.jsx'
import {
  braessGame, braessStart, braessSurvey, counts, startState, oneSwitch, loads, totalCost, potential,
  fourGame, fourStart, enumerate, BRAESS_STARTS, FOUR_STARTS,
} from './atomic.js'
import { toNumber, div, frac, cmp } from './frac.js'
import { num } from './fmt.js'

// Panel B, "Drivers who count": best-response dynamics in an atomic
// congestion game, exact (frac.js). Preset "Braess" (default): n drivers on
// Braess's network, s → v and w → t costing k/n, a shortcut of cost c that
// can be closed. Preset "Four drivers": the worst case for affine costs.
// Every change of setting goes back to the chosen start. "random" draws
// start no. 1; choosing it again draws the next one.

const SKY = '#0369a1'
const NODES = { s: [24, 80], v: [150, 20], w: [150, 140], t: [276, 80] }

const T = {
  en: {
    presets: { braess: 'Braess, n drivers', four: 'Four drivers, the worst case' },
    n: 'n, the drivers',
    c: 'c, the shortcut’s cost',
    shortcut: 'Shortcut v → w',
    open: 'open',
    closed: 'closed',
    start: 'Start',
    starts: { upper: 'all on the upper route', half: 'half upper, half lower', random: 'random', direct: 'all direct', detours: 'all detours' },
    seed: (s) => `start no. ${s} (seed ${s})`,
    one: 'One switch',
    end: 'To the end',
    reset: 'Reset',
    routes: ['upper', 'lower', 'zigzag'],
    fourRoutes: ['direct', 'detour'],
    log: 'Switches',
    logHead: ['#', 'driver', 'from', 'to', 'his gain', 'drop of Φ'],
    none: 'No switch yet.',
    ended: 'Ended: a full turn with no switch. This is an equilibrium.',
    running: (k) => `${k} switch${k === 1 ? '' : 'es'} so far.`,
    counts: 'Now: upper, lower, zigzag',
    perDriver: 'Cost per driver now',
    total: 'Total cost now',
    phi: 'Φ now',
    opt: 'The planner’s optimum',
    best: 'Best equilibrium',
    worst: 'Worst equilibrium',
    poa: 'Price of anarchy',
    pos: 'Price of stability',
    profile: 'Now: drivers 1–4',
    chartPhi: 'Φ against the number of switches',
    chartAvg: 'cost per driver against the number of switches',
    chartTot: 'total cost against the number of switches',
    fourNote: 'Roads e1 to e4 cost the number of their users; z1 and z2 cost nothing. Each driver takes his own road alone, or a detour of two roads. Solid line: his choice now; dashed: the other.',
    netAria: 'Braess’s network with the number of drivers on each road',
    fourAria: 'The four drivers, the six roads and the roads each driver uses',
  },
  it: {
    presets: { braess: 'Braess, n automobilisti', four: 'Quattro automobilisti, il caso peggiore' },
    n: 'n, gli automobilisti',
    c: 'c, il costo della scorciatoia',
    shortcut: 'Scorciatoia v → w',
    open: 'aperta',
    closed: 'chiusa',
    start: 'Partenza',
    starts: { upper: 'tutti sul percorso in alto', half: 'metà in alto, metà in basso', random: 'casuale', direct: 'tutti diretti', detours: 'tutti in deviazione' },
    seed: (s) => `partenza n. ${s} (seme ${s})`,
    one: 'Un cambio',
    end: 'Fino alla fine',
    reset: 'Da capo',
    routes: ['in alto', 'in basso', 'zigzag'],
    fourRoutes: ['diretto', 'deviazione'],
    log: 'Cambi',
    logHead: ['#', 'chi', 'da', 'a', 'suo guadagno', 'calo di Φ'],
    none: 'Ancora nessun cambio.',
    ended: 'Finito: un giro intero senza cambi. È un equilibrio.',
    running: (k) => `${k} ${k === 1 ? 'cambio' : 'cambi'} finora.`,
    counts: 'Ora: in alto, in basso, zigzag',
    perDriver: 'Costo per automobilista ora',
    total: 'Costo totale ora',
    phi: 'Φ ora',
    opt: 'L’ottimo del pianificatore',
    best: 'Equilibrio migliore',
    worst: 'Equilibrio peggiore',
    poa: 'Prezzo dell’anarchia',
    pos: 'Prezzo della stabilità',
    profile: 'Ora: automobilisti 1–4',
    chartPhi: 'Φ in funzione del numero di cambi',
    chartAvg: 'costo per automobilista in funzione del numero di cambi',
    chartTot: 'costo totale in funzione del numero di cambi',
    fourNote: 'Le strade da e1 a e4 costano il numero dei loro utenti; z1 e z2 non costano nulla. Ogni automobilista prende da solo la sua strada, o una deviazione di due strade. Linea continua: la sua scelta ora; tratteggiata: l’altra.',
    netAria: 'La rete di Braess con il numero di automobilisti su ogni strada',
    fourAria: 'I quattro automobilisti, le sei strade e le strade che ciascuno usa',
  },
}

function BraessNet({ k, open, c, L, lang }) {
  const [u, l, z] = k
  const roads = [
    ['sv', 's', 'v', u + z, -16, -4],
    ['vt', 'v', 't', u, 16, -4],
    ['sw', 's', 'w', l, -16, 14],
    ['wt', 'w', 't', l + z, 16, 14],
    ['vw', 'v', 'w', open ? z : null, 26, 4],
  ]
  const total = u + l + z
  return (
    <svg viewBox="0 0 300 160" className="w-full h-auto" role="img" aria-label={L.netAria} data-role="atomic-net">
      {roads.map(([id, a, b, cnt, dx, dy]) => {
        const [x1, y1] = NODES[a]
        const [x2, y2] = NODES[b]
        return (
          <g key={id} data-road={id} data-count={cnt ?? 'closed'}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTED} strokeDasharray={cnt === null ? '4 3' : undefined} />
            {cnt > 0 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ORANGE_DARK} strokeWidth={2 + (12 * cnt) / total} opacity="0.85" strokeLinecap="round" />}
            <text x={(x1 + x2) / 2 + dx} y={(y1 + y2) / 2 + dy} fontSize="10" fontFamily={MONO} fill={INK} textAnchor="middle">
              {cnt === null ? (lang === 'it' ? 'chiusa' : 'closed') : id === 'vw' ? `${cnt} · c = ${num(c, lang, 2)}` : cnt}
            </text>
          </g>
        )
      })}
      {Object.entries(NODES).map(([key, [x, y]]) => (
        <g key={key}>
          <circle cx={x} cy={y} r="11" fill="white" stroke={INK} strokeWidth="1.5" />
          <text x={x} y={y + 4} fontSize="12" fontFamily={MONO} fill={INK} textAnchor="middle">{key}</text>
        </g>
      ))}
    </svg>
  )
}

// Drivers on the left, the six roads on the right; a line from a driver to
// each road of his choice (solid) and of his other option (dashed).
function FourNet({ game, profile, L }) {
  const n = loads(game, profile)
  const W = 300
  const H = 168
  const dy = (i) => 22 + i * 40
  const ry = (e) => 14 + e * 28
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.fourAria} data-role="four-net">
      {game.players.map((pl, i) =>
        pl.strategies.map((st, s) =>
          st.map((e) => (
            <line key={`${i}${s}${e}`} x1={40} y1={dy(i)} x2={200} y2={ry(e)} stroke={s === profile[i] ? ORANGE_DARK : MUTED} strokeWidth={s === profile[i] ? 2.2 : 1} strokeDasharray={s === profile[i] ? undefined : '3 3'} />
          )),
        ),
      )}
      {game.players.map((_, i) => (
        <g key={i} data-driver={i + 1} data-choice={profile[i]}>
          <circle cx={30} cy={dy(i)} r="11" fill="white" stroke={INK} strokeWidth="1.5" />
          <text x={30} y={dy(i) + 4} fontSize="11" fontFamily={MONO} fill={INK} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      {game.resources.map((r, e) => (
        <g key={r.id} data-road={r.id} data-count={n[e]}>
          <rect x={200} y={ry(e) - 10} width={92} height={20} rx="4" fill="white" stroke={e < 4 ? INK : MUTED} />
          <text x={208} y={ry(e) + 4} fontSize="10" fontFamily={MONO} fill={INK}>{r.id}</text>
          <text x={286} y={ry(e) + 4} fontSize="10" fontFamily={MONO} fill={SLATE} textAnchor="end">
            {e < 4 ? n[e] : `${n[e]} · 0`}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function AtomicPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n4 = (v) => num(v, lang, 4)
  const [preset, setPreset] = useState('braess')
  const [nDrivers, setNDrivers] = useState(10)
  const [c, setC] = useState(0)
  const [open, setOpen] = useState(true)
  const [start, setStart] = useState('upper')
  const [seed, setSeed] = useState(1)
  const braess = preset === 'braess'
  const game = useMemo(() => (braess ? braessGame(nDrivers, c, open) : fourGame()), [braess, nDrivers, c, open])
  const p0 = useMemo(() => (braess ? braessStart(game, start, seed) : fourStart(start, seed)), [game, braess, start, seed])
  const [run, setRun] = useState(() => ({ key: null }))
  const key = `${preset}|${nDrivers}|${c}|${open}|${start}|${seed}`
  const cur = run.key === key ? run : { key, state: startState(p0), moves: [] }
  const m = game.players.length
  const avgOf = (p) => toNumber(div(totalCost(game, p), frac(m)))
  const history = useMemo(() => {
    const pts = [[0, toNumber(potential(game, p0)), braess ? avgOf(p0) : toNumber(totalCost(game, p0))]]
    cur.moves.forEach((mv, i) => {
      pts.push([i + 1, toNumber(mv.phiAfter), braess ? mv.avgAfter : mv.totalAfter])
    })
    return pts
  }, [cur.moves, game, p0]) // eslint-disable-line react-hooks/exhaustive-deps

  const decorate = (mv, profile) => ({ ...mv, avgAfter: avgOf(profile), totalAfter: toNumber(totalCost(game, profile)) })
  const doOne = () => {
    const r = oneSwitch(game, cur.state)
    setRun({ key, state: r.state, moves: r.move ? [...cur.moves, decorate(r.move, r.state.profile)] : cur.moves })
  }
  const doEnd = () => {
    let s = cur.state
    const moves = [...cur.moves]
    while (!s.done) {
      const r = oneSwitch(game, s)
      s = r.state
      if (r.move) moves.push(decorate(r.move, s.profile))
    }
    setRun({ key, state: s, moves })
  }
  const reset = () => setRun({ key: null })

  const survey = useMemo(() => {
    if (braess) return braessSurvey(nDrivers, c, open)
    const all = enumerate(game)
    const eqs = all.filter((x) => x.eq).sort((a, b) => cmp(a.total, b.total))
    const opt = all.reduce((best, x) => (!best || cmp(x.total, best.total) < 0 ? x : best), null)
    return { opt: { cost: opt.total }, best: { cost: eqs[0].total }, worst: { cost: eqs[eqs.length - 1].total } }
  }, [braess, nDrivers, c, open, game])
  const prof = cur.state.profile
  const kNow = counts(prof)
  const routes = braess ? L.routes : L.fourRoutes
  const starts = braess ? BRAESS_STARTS : FOUR_STARTS
  const setPresetTo = (k) => {
    setPreset(k)
    setStart(k === 'braess' ? 'upper' : 'direct')
    setSeed(1)
  }
  const pickStart = (k) => {
    if (k === 'random' && start === 'random') setSeed(seed + 1)
    else {
      setStart(k)
      setSeed(1)
    }
    setRun({ key: null })
  }
  const showCost = (f) => n4(toNumber(f))
  const lastMoves = cur.moves.slice(-12)
  const yMaxPhi = Math.max(...history.map((h) => h[1])) * 1.05
  const yMinPhi = Math.min(...history.map((h) => h[1])) * 0.95
  const yMaxC = Math.max(...history.map((h) => h[2])) * 1.05
  const yMinC = Math.min(...history.map((h) => h[2])) * 0.95
  const xMax = Math.max(1, history.length - 1)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="atomic-presets">
        {['braess', 'four'].map((k) => (
          <Pill key={k} active={preset === k} onClick={() => setPresetTo(k)}>{L.presets[k]}</Pill>
        ))}
      </div>
      {braess && (
        <>
          <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
            <Slider label={L.n} min={2} max={40} step={1} value={nDrivers} onChange={setNDrivers} />
            <Slider label={L.c} min={0} max={1} step={0.05} value={c} onChange={(v) => setC(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span>{L.shortcut}</span>
            <Pill active={open} onClick={() => setOpen(true)} data-role="atomic-open">{L.open}</Pill>
            <Pill active={!open} onClick={() => setOpen(false)} data-role="atomic-closed">{L.closed}</Pill>
          </div>
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700" data-role="atomic-starts">
        <span>{L.start}</span>
        {starts.map((k) => (
          <Pill key={k} active={start === k} onClick={() => pickStart(k)} data-start={k}>{L.starts[k]}</Pill>
        ))}
        {start === 'random' && <span className="text-xs text-slate-500 font-mono" data-role="atomic-seed">{L.seed(seed)}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={doOne} disabled={cur.state.done} data-role="atomic-one">{L.one}</Pill>
        <Pill primary onClick={doEnd} disabled={cur.state.done} data-role="atomic-end">{L.end}</Pill>
        <Pill onClick={reset} data-role="atomic-reset">{L.reset}</Pill>
        <span className="text-xs text-slate-600" data-role="atomic-status">{cur.state.done ? L.ended : cur.moves.length ? L.running(cur.moves.length) : L.none}</span>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          {braess ? <BraessNet k={kNow} open={open} c={c} L={L} lang={lang} /> : <FourNet game={game} profile={prof} L={L} />}
          {!braess && <p className="text-xs text-slate-500 leading-snug">{L.fourNote}</p>}
        </div>
        <div className="min-w-0">
          <Chart
            height={110}
            x={{ min: 0, max: xMax, ticks: [0, xMax], label: '#' }}
            y={{ min: yMinPhi, max: yMaxPhi, ticks: [yMinPhi, yMaxPhi], label: 'Φ', labelSide: 'left', format: (v) => num(v, lang, 1) }}
            series={[{ points: history.map((h) => [h[0], h[1]]), color: ORANGE_DARK, dots: history.length < 60 }]}
            aria={L.chartPhi}
          />
          <Chart
            height={110}
            x={{ min: 0, max: xMax, ticks: [0, xMax], label: '#' }}
            y={{ min: yMinC, max: yMaxC, ticks: [yMinC, yMaxC], label: braess ? L.perDriver : L.total, labelSide: 'left', format: (v) => num(v, lang, 2) }}
            series={[{ points: history.map((h) => [h[0], h[2]]), color: SKY, dots: history.length < 60 }]}
            aria={braess ? L.chartAvg : L.chartTot}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl" data-role="atomic-readout">
        {braess ? (
          <Stat label={L.counts}><span data-value="counts">{open ? kNow.join(', ') : `${kNow[0]}, ${kNow[1]}, –`}</span></Stat>
        ) : (
          <Stat label={L.profile}><span data-value="profile">{prof.map((s) => (s ? 'D' : 'd')).join(' ')}</span></Stat>
        )}
        <Stat label={braess ? L.perDriver : L.total}><span data-value="cost">{braess ? n4(avgOf(prof)) : showCost(totalCost(game, prof))}</span></Stat>
        <Stat label={L.phi}><span data-value="phi">{showCost(potential(game, prof))}</span></Stat>
        <Stat label={L.opt}>
          <span data-value="opt">{showCost(survey.opt.cost)}{braess ? ` (${survey.opt.counts.join(', ')})` : ''}</span>
        </Stat>
        <Stat label={L.best}>
          <span data-value="best">{showCost(survey.best.cost)}{braess ? ` (${survey.best.counts.join(', ')})` : ''}</span>
        </Stat>
        <Stat label={L.worst}>
          <span data-value="worst">{showCost(survey.worst.cost)}{braess ? ` (${survey.worst.counts.join(', ')})` : ''}</span>
        </Stat>
        <Stat label={L.poa}><span data-value="poa">{n4(toNumber(survey.worst.cost) / toNumber(survey.opt.cost))}</span></Stat>
        <Stat label={L.pos}><span data-value="pos">{n4(toNumber(survey.best.cost) / toNumber(survey.opt.cost))}</span></Stat>
      </div>
      {!braess && (
        <p className="mt-1 text-xs text-slate-500">{lang === 'it' ? 'd = diretto, D = deviazione.' : 'd = direct, D = detour.'}</p>
      )}

      <div className="mt-3 max-w-3xl" data-role="atomic-log">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">{L.log}</p>
        {cur.moves.length === 0 ? (
          <p className="text-sm text-slate-500">{L.none}</p>
        ) : (
          <table className="mt-1 w-full text-xs font-mono tabular-nums">
            <thead>
              <tr className="text-slate-500 text-left">
                {L.logHead.map((h) => <th key={h} className="pr-2 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {lastMoves.map((mv, i) => {
                const no = cur.moves.length - lastMoves.length + i + 1
                return (
                  <tr key={no} className="text-slate-900" data-move={no}>
                    <td className="pr-2 text-slate-500">{no}</td>
                    <td className="pr-2">{mv.player + 1}</td>
                    <td className="pr-2">{routes[mv.from]}</td>
                    <td className="pr-2">{routes[mv.to]}</td>
                    <td className="pr-2" data-gain>{showCost(mv.gain)}</td>
                    <td className="pr-2" data-drop>{showCost(mv.drop)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
