import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, MUTED, ORANGE_DARK, MONO } from '../../network/ui.jsx'
import { startState, oneSwitch, loads, totalCost, playerCost } from './atomic.js'
import { hubGame, twoRoadsGame, shared, other, optimum, equilibria, phiShared, harmonic } from './costsharing.js'
import { toNumber, cmp } from './frac.js'
import { num } from './fmt.js'

// Panel C, "Sharing the cost of a road": a network cost-sharing game, the
// cost of each road split equally among its users, with best-response
// dynamics (players 1 to k in turn, strict improvement only). Preset "The
// hub" (default) or "Two roads". Every change of setting goes back to the
// chosen start.

const SKY = '#0369a1'

const T = {
  en: {
    presets: { hub: 'The hub', two: 'Two roads' },
    k: 'k, the players',
    eps: 'ε',
    start: 'Start',
    starts: { hub: ['everyone at the hub', 'everyone on his own road'], two: ['everyone on road A', 'everyone on road B'] },
    one: 'One switch',
    end: 'To the end',
    reset: 'Reset',
    ended: 'Ended: a full turn with no switch. This is an equilibrium.',
    running: (k) => `${k} switch${k === 1 ? '' : 'es'} so far.`,
    none: 'No switch yet.',
    choice: { hub: ['own road', 'hub'], two: ['A', 'B'] },
    pays: 'Who pays what',
    log: 'Switches',
    logHead: ['#', 'player', 'from', 'to', 'his gain', 'drop of Φ'],
    cost: 'Cost of the current state',
    phi: 'Φ = Σ c_e H(n_e) now',
    opt: 'The optimum',
    H: (k) => `H_${k}`,
    eqs: 'All equilibria and their costs',
    eqItem: (kind, m, c) => (kind === 'hub' ? `${m} at the hub: ${c}` : `${m} on A: ${c}`),
    worstR: 'Worst equilibrium / optimum',
    bestR: 'Best equilibrium / optimum',
    hubNote: (k) => `Player i’s own road costs 1/i; the road to the hub is costless; the hub’s road costs 1 + ε, split equally among its users. k = ${k}.`,
    twoNote: (k) => `Road A costs ${k}, road B costs 1 + ε; each is split equally among its users.`,
    aria: 'The players, their roads to the target and the roads in use',
  },
  it: {
    presets: { hub: 'L’hub', two: 'Due strade' },
    k: 'k, i giocatori',
    eps: 'ε',
    start: 'Partenza',
    starts: { hub: ['tutti all’hub', 'ognuno sulla sua strada'], two: ['tutti sulla strada A', 'tutti sulla strada B'] },
    one: 'Un cambio',
    end: 'Fino alla fine',
    reset: 'Da capo',
    ended: 'Finito: un giro intero senza cambi. È un equilibrio.',
    running: (k) => `${k} ${k === 1 ? 'cambio' : 'cambi'} finora.`,
    none: 'Ancora nessun cambio.',
    choice: { hub: ['sua strada', 'hub'], two: ['A', 'B'] },
    pays: 'Chi paga quanto',
    log: 'Cambi',
    logHead: ['#', 'chi', 'da', 'a', 'suo guadagno', 'calo di Φ'],
    cost: 'Costo dello stato attuale',
    phi: 'Φ = Σ c_e H(n_e) ora',
    opt: 'L’ottimo',
    H: (k) => `H_${k}`,
    eqs: 'Tutti gli equilibri e i loro costi',
    eqItem: (kind, m, c) => (kind === 'hub' ? `${m} all’hub: ${c}` : `${m} su A: ${c}`),
    worstR: 'Equilibrio peggiore / ottimo',
    bestR: 'Equilibrio migliore / ottimo',
    hubNote: (k) => `La strada del giocatore i costa 1/i; la strada verso l’hub è senza costo; la strada dell’hub costa 1 + ε, divisa in parti uguali tra chi la usa. k = ${k}.`,
    twoNote: (k) => `La strada A costa ${k}, la strada B costa 1 + ε; ciascuna è divisa in parti uguali tra chi la usa.`,
    aria: 'I giocatori, le loro strade verso la destinazione e le strade in uso',
  },
}

function Net({ game, profile, lang }) {
  const k = game.k
  const W = 300
  const H = 150
  const px = (i) => 14 + (i * (W - 28)) / Math.max(1, k - 1)
  const PY = 18
  const target = [W / 2, H - 16]
  const hubAt = [62, 92]
  const A = [92, 84]
  const Bn = [208, 84]
  const n = loads(game, profile)
  const lines = []
  for (let i = 0; i < k; i++) {
    const on = profile[i]
    if (game.kind === 'hub') {
      lines.push(<line key={`o${i}`} x1={px(i)} y1={PY} x2={target[0]} y2={target[1]} stroke={on === 0 ? ORANGE_DARK : MUTED} strokeWidth={on === 0 ? 1.8 : 0.7} strokeDasharray={on === 0 ? undefined : '3 3'} />)
      lines.push(<line key={`h${i}`} x1={px(i)} y1={PY} x2={hubAt[0]} y2={hubAt[1]} stroke={on === 1 ? SKY : MUTED} strokeWidth={on === 1 ? 1.4 : 0.5} strokeDasharray={on === 1 ? undefined : '2 3'} />)
    } else {
      const node = on === 0 ? A : Bn
      lines.push(<line key={`p${i}`} x1={px(i)} y1={PY} x2={node[0]} y2={node[1]} stroke={on === 0 ? ORANGE_DARK : SKY} strokeWidth="1.2" />)
    }
  }
  const hubUsers = game.kind === 'hub' ? n[2 * k] : 0
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={T[lang]?.aria || T.en.aria} data-role="share-net">
      {lines}
      {game.kind === 'hub' ? (
        <g data-road="hub" data-count={hubUsers}>
          <line x1={hubAt[0]} y1={hubAt[1]} x2={target[0]} y2={target[1]} stroke={hubUsers ? SKY : MUTED} strokeWidth={hubUsers ? 2 + (8 * hubUsers) / k : 1} />
          <circle cx={hubAt[0]} cy={hubAt[1]} r="8" fill="white" stroke={INK} />
          <text x={hubAt[0] - 12} y={hubAt[1] + 4} fontSize="9" fontFamily={MONO} fill={INK} textAnchor="end">hub</text>
          <text x={(hubAt[0] + target[0]) / 2 - 10} y={(hubAt[1] + target[1]) / 2 + 14} fontSize="9" fontFamily={MONO} fill={INK} textAnchor="middle">1 + ε</text>
        </g>
      ) : (
        [[A, 'A', n[0], `${k}`], [Bn, 'B', n[1], '1 + ε']].map(([[x, y], id, cnt, lab]) => (
          <g key={id} data-road={id} data-count={cnt}>
            <line x1={x} y1={y} x2={target[0]} y2={target[1]} stroke={cnt ? (id === 'A' ? ORANGE_DARK : SKY) : MUTED} strokeWidth={cnt ? 2 + (8 * cnt) / k : 1} />
            <circle cx={x} cy={y} r="8" fill="white" stroke={INK} />
            <text x={x} y={y + 3} fontSize="9" fontFamily={MONO} fill={INK} textAnchor="middle">{id}</text>
            <text x={x + (id === 'A' ? -12 : 12)} y={y + 22} fontSize="9" fontFamily={MONO} fill={INK} textAnchor={id === 'A' ? 'end' : 'start'}>{lab}</text>
          </g>
        ))
      )}
      {Array.from({ length: k }, (_, i) => (
        <g key={i} data-player={i + 1} data-choice={profile[i]}>
          <circle cx={px(i)} cy={PY} r={k > 12 ? 5.5 : 7} fill="white" stroke={INK} />
          <text x={px(i)} y={PY + 3} fontSize={k > 12 ? 6 : 8} fontFamily={MONO} fill={INK} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      <circle cx={target[0]} cy={target[1]} r="9" fill={INK} />
      <text x={target[0] + 14} y={target[1] + 4} fontSize="9" fontFamily={MONO} fill={SLATE}>{lang === 'it' ? 'destinazione' : 'target'}</text>
    </svg>
  )
}

export default function CostSharingPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n4 = (v) => num(v, lang, 4)
  const [preset, setPreset] = useState('hub')
  const [k, setK] = useState(10)
  const [eps, setEps] = useState(0.1)
  const [onShared, setOnShared] = useState(true)
  const game = useMemo(() => (preset === 'hub' ? hubGame(k, eps) : twoRoadsGame(k, eps)), [preset, k, eps])
  const p0 = useMemo(() => (onShared ? shared(game) : other(game)), [game, onShared])
  const key = `${preset}|${k}|${eps}|${onShared}`
  const [run, setRun] = useState({ key: null })
  const cur = run.key === key ? run : { key, state: startState(p0), moves: [] }
  const prof = cur.state.profile
  const n = loads(game, prof)
  const opt = optimum(game)
  const eqs = useMemo(() => equilibria(game).sort((a, b) => cmp(a.cost, b.cost)), [game])
  const ch = L.choice[game.kind]

  const doOne = () => {
    const r = oneSwitch(game, cur.state)
    setRun({ key, state: r.state, moves: r.move ? [...cur.moves, r.move] : cur.moves })
  }
  const doEnd = () => {
    let s = cur.state
    const moves = [...cur.moves]
    while (!s.done) {
      const r = oneSwitch(game, s)
      s = r.state
      if (r.move) moves.push(r.move)
    }
    setRun({ key, state: s, moves })
  }
  const lastMoves = cur.moves.slice(-12)
  const ratio = (f) => toNumber(f) / toNumber(opt)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="share-presets">
        {['hub', 'two'].map((p) => (
          <Pill key={p} active={preset === p} onClick={() => { setPreset(p); setOnShared(true) }}>{L.presets[p]}</Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.k} min={2} max={20} step={1} value={k} onChange={setK} />
        <Slider label={L.eps} min={0.01} max={0.5} step={0.01} value={eps} onChange={(v) => setEps(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700" data-role="share-starts">
        <span>{L.start}</span>
        {[true, false].map((s, i) => (
          <Pill key={i} active={onShared === s} onClick={() => { setOnShared(s); setRun({ key: null }) }} data-start={s ? 'shared' : 'other'}>
            {L.starts[game.kind][i]}
          </Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={doOne} disabled={cur.state.done} data-role="share-one">{L.one}</Pill>
        <Pill primary onClick={doEnd} disabled={cur.state.done} data-role="share-end">{L.end}</Pill>
        <Pill onClick={() => setRun({ key: null })} data-role="share-reset">{L.reset}</Pill>
        <span className="text-xs text-slate-600" data-role="share-status">{cur.state.done ? L.ended : cur.moves.length ? L.running(cur.moves.length) : L.none}</span>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <Net game={game} profile={prof} lang={lang} />
          <p className="text-xs text-slate-500 leading-snug">{game.kind === 'hub' ? L.hubNote(k) : L.twoNote(k)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">{L.pays}</p>
          <div className="mt-1 flex flex-wrap gap-1" data-role="share-pays">
            {prof.map((s, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded border text-xs font-mono tabular-nums ${s === (game.kind === 'hub' ? 1 : 0) ? 'border-sky-300 bg-sky-50' : 'border-orange-300 bg-orange-50'}`} data-pays={i + 1}>
                {i + 1} {ch[s]} {num(toNumber(playerCost(game, prof, i, n)), lang, 3)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-3xl" data-role="share-readout">
        <Stat label={L.cost}><span data-value="cost">{n4(toNumber(totalCost(game, prof, n)))}</span></Stat>
        <Stat label={L.phi}><span data-value="phi">{n4(toNumber(phiShared(game, prof)))}</span></Stat>
        <Stat label={L.opt}><span data-value="opt">{n4(toNumber(opt))}</span></Stat>
        <Stat label={L.H(k)}><span data-value="H">{n4(toNumber(harmonic(k)))}</span></Stat>
        <Stat label={L.worstR}><span data-value="worst">{n4(ratio(eqs[eqs.length - 1].cost))}</span></Stat>
        <Stat label={L.bestR}><span data-value="best">{n4(ratio(eqs[0].cost))}</span></Stat>
        <Stat label={L.eqs} wide>
          <span data-value="eqs">{eqs.map((e) => L.eqItem(game.kind, game.kind === 'hub' ? e.atHub : e.onA, n4(toNumber(e.cost)))).join('; ')}</span>
        </Stat>
      </div>

      <div className="mt-3 max-w-3xl" data-role="share-log">
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
                    <td className="pr-2" data-player>{mv.player + 1}</td>
                    <td className="pr-2">{ch[mv.from]}</td>
                    <td className="pr-2">{ch[mv.to]}</td>
                    <td className="pr-2" data-gain>{n4(toNumber(mv.gain))}</td>
                    <td className="pr-2" data-drop>{n4(toNumber(mv.drop))}</td>
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
