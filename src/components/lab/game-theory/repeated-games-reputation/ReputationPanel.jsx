import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK, MONO, GRID as GRID_LINE } from '../../network/ui.jsx'
import { Legend } from '../../network/charts.jsx'
import { base, deterred, expectWeak, weakPayoff, toughPath, history, simulateWeak, DEFAULTS } from './chainstore.js'
import { num } from './FigurePatience.jsx'

// Panel C, "A reputation for toughness": the chain store with a little
// doubt (Kreps and Wilson 1982). N markets, one newcomer each, in turn; the
// incumbent is tough with probability t. A row of markets with what happened
// in each, the newcomers' belief before each market and the threshold b^k.
// Readouts: the markets deterred from the start, the payoffs, the exact
// expected entries and fights against a weak incumbent, and after
// "10,000 chains" the simulated averages. Sliders, pills and SVG only.

const W = 320
const SKY = '#0369a1'
const CHAINS = 10000
const MOVE_COLOR = { out: '#e2e8f0', fight: ORANGE_DARK, share: '#7dd3fc' }

const T = {
  en: {
    t: 't, the chance that the incumbent is tough',
    N: 'N, the markets',
    w: 'w, a fought newcomer’s payoff',
    types: { weak: 'Weak', tough: 'Tough', drawn: 'Drawn with probability t' },
    typeLabel: 'The incumbent',
    newHistory: 'New history',
    chains: '10,000 chains',
    letters: { out: 'O', fight: 'F', share: 'S' },
    legend: { out: 'O stays out', fight: 'F enters, fought', share: 'S enters, shared' },
    belief: 'belief before the market',
    thr: 'threshold b^k',
    market: 'market →',
    drawnTough: 'This time the incumbent is tough.',
    drawnWeak: 'This time the incumbent is weak.',
    history: (s) => `History no. ${s} (seed ${s})`,
    D: 'Deterred from the start, D',
    weakPay: 'Weak incumbent, 4D + 2(N − D)',
    noDoubt: (v) => `against ${v} without doubt`,
    toughPay: 'Tough incumbent',
    toughEntries: (e) => `${e} entr${e === 1 ? 'y' : 'ies'}`,
    entries: 'Expected entries (weak)',
    fights: 'Expected fights (weak)',
    sim: (e, f, mn, mx) => `10,000 chains against a weak incumbent: ${e} entries and ${f} fights on average; its payoff ${mn === mx ? `is ${mn} in every chain` : `ranges from ${mn} to ${mx}`}.`,
    b: (v) => `b = 2/(2 − w) = ${v}`,
    aria: 'A row of markets with what each newcomer did, the newcomers’ belief before each market and the threshold b^k',
  },
  it: {
    t: 't, la probabilità che l’incumbent sia duro',
    N: 'N, i mercati',
    w: 'w, il payoff di un entrante combattuto',
    types: { weak: 'Debole', tough: 'Duro', drawn: 'Estratto con probabilità t' },
    typeLabel: 'L’incumbent',
    newHistory: 'Nuova storia',
    chains: '10.000 catene',
    letters: { out: 'F', fight: 'C', share: 'D' },
    legend: { out: 'F resta fuori', fight: 'C entra, combattuto', share: 'D entra, si divide' },
    belief: 'credenza prima del mercato',
    thr: 'soglia b^k',
    market: 'mercato →',
    drawnTough: 'Questa volta l’incumbent è duro.',
    drawnWeak: 'Questa volta l’incumbent è debole.',
    history: (s) => `Storia n. ${s} (seme ${s})`,
    D: 'Scoraggiati fin dall’inizio, D',
    weakPay: 'Incumbent debole, 4D + 2(N − D)',
    noDoubt: (v) => `contro ${v} senza dubbio`,
    toughPay: 'Incumbent duro',
    toughEntries: (e) => `${e} ${e === 1 ? 'entrata' : 'entrate'}`,
    entries: 'Entrate attese (debole)',
    fights: 'Lotte attese (debole)',
    sim: (e, f, mn, mx) => `10.000 catene contro un incumbent debole: in media ${e} entrate e ${f} lotte; il suo payoff ${mn === mx ? `è ${mn} in ogni catena` : `va da ${mn} a ${mx}`}.`,
    b: (v) => `b = 2/(2 − w) = ${v}`,
    aria: 'Una riga di mercati con ciò che ha fatto ogni entrante, la credenza degli entranti prima di ogni mercato e la soglia b^k',
  },
}

export default function ReputationPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const f = (v, d = 4) => num(v, lang, d)
  const [t, setT] = useState(DEFAULTS.t)
  const [N, setN] = useState(DEFAULTS.N)
  const [w, setW] = useState(DEFAULTS.w)
  const [type, setType] = useState('weak')
  const [seed, setSeed] = useState(1)
  const [sim, setSim] = useState(null)
  const params = { t, N, w }
  const b = base(w)
  const h = useMemo(() => history({ t, N, w }, type, seed), [t, N, w, type, seed])
  const D = deterred(t, N, b)
  const ex = useMemo(() => expectWeak(t, N, w), [t, N, w])
  const tough = toughPath(t, N, w)
  const simShown = sim && sim.t === t && sim.N === N && sim.w === w ? sim : null

  // The row of markets and the belief chart.
  const cw = (W - 30) / N
  const X = (i) => 26 + i * cw
  const top = Math.max(b, t, 0.1)
  const CH = 90
  const Y = (v) => 34 + CH - (v / top) * CH
  const yTicks = [0, top / 2, top]

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.t} min={0} max={0.5} step={0.01} value={t} onChange={setT} format={(v) => f(v, 2)} />
        <Slider label={L.N} min={1} max={30} step={1} value={N} onChange={setN} />
        <Slider label={L.w} min={-3} max={-0.5} step={0.5} value={w} onChange={setW} format={(v) => f(v, 1)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2" data-role="rep-type">
        <span className="text-sm font-medium text-slate-700 mr-1">{L.typeLabel}</span>
        {['weak', 'tough', 'drawn'].map((k) => (
          <Pill key={k} active={type === k} onClick={() => setType(k)}>
            {L.types[k]}
          </Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="rep-new">
          {L.newHistory}
        </Pill>
        <Pill onClick={() => setSim({ t, N, w, ...simulateWeak(params, CHAINS, 1) })} data-role="rep-chains">
          {L.chains}
        </Pill>
        <span className="text-xs text-slate-500 font-mono" data-role="rep-seed">
          {L.history(seed)}
        </span>
      </div>
      {type === 'drawn' && (
        <p className="mt-2 text-sm text-slate-700" data-role="rep-drawn">
          {h.tough ? L.drawnTough : L.drawnWeak}
        </p>
      )}

      <div className="mt-3 max-w-2xl">
        <svg viewBox={`0 0 ${W} ${CH + 58}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="rep-row">
          {h.markets.map((m, i) => (
            <g key={i} data-market={i + 1} data-move={m.move}>
              <rect x={X(i) + 0.5} y={4} width={Math.max(1, cw - 1)} height={18} fill={MOVE_COLOR[m.move]} />
              {cw >= 8 && (
                <text x={X(i) + cw / 2} y={16.5} fontSize={cw >= 12 ? 9 : 7} fontFamily={MONO} textAnchor="middle" fill={m.move === 'fight' ? 'white' : INK}>
                  {L.letters[m.move]}
                </text>
              )}
            </g>
          ))}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={26} x2={W - 4} y1={Y(v)} y2={Y(v)} stroke={GRID_LINE} />
              <text x={22} y={Y(v) + 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
                {f(v, 2)}
              </text>
            </g>
          ))}
          <polyline
            points={h.markets.flatMap((m, i) => [`${X(i).toFixed(1)},${Y(Math.min(m.threshold, top)).toFixed(1)}`, `${(X(i) + cw).toFixed(1)},${Y(Math.min(m.threshold, top)).toFixed(1)}`]).join(' ')}
            fill="none"
            stroke={ORANGE_DARK}
            strokeWidth="1.5"
            data-role="rep-threshold"
          />
          <polyline
            points={h.markets.map((m, i) => `${(X(i) + cw / 2).toFixed(1)},${Y(m.belief).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={SKY}
            strokeWidth="1.5"
          />
          {h.markets.map((m, i) => (
            <circle key={i} cx={X(i) + cw / 2} cy={Y(m.belief)} r="1.8" fill={SKY} />
          ))}
          <line x1={26} x2={W - 4} y1={Y(0)} y2={Y(0)} stroke={SLATE} />
          {[1, Math.ceil(N / 2), N].filter((v, i, a) => a.indexOf(v) === i).map((k) => (
            <text key={k} x={X(k - 1) + cw / 2} y={CH + 46} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="middle">
              {k}
            </text>
          ))}
          <text x={W - 4} y={CH + 56} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
            {L.market}
          </text>
        </svg>
        <Legend
          items={[
            { label: L.legend.out, color: MOVE_COLOR.out, bar: true },
            { label: L.legend.fight, color: MOVE_COLOR.fight, bar: true },
            { label: L.legend.share, color: MOVE_COLOR.share, bar: true },
            { label: L.belief, color: SKY },
            { label: L.thr, color: ORANGE_DARK },
          ]}
        />
        <p className="mt-1 text-xs text-slate-500 font-mono">{L.b(f(b, 4))}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-3xl" data-role="rep-readout">
        <Stat label={L.D}>
          <span data-value="D">{D}</span>
        </Stat>
        <Stat label={L.weakPay}>
          <span data-value="weakPay">{weakPayoff(t, N, w)}</span>
          <span className="ml-2 font-sans text-xs text-slate-500">{L.noDoubt(2 * N)}</span>
        </Stat>
        <Stat label={L.toughPay}>
          <span data-value="toughPay">{tough.pay}</span>
          <span className="ml-2 font-sans text-xs text-slate-500" data-value="toughEntries">
            {L.toughEntries(tough.entries)}
          </span>
        </Stat>
        <Stat label={L.entries}>
          <span data-value="entries">{f(ex.entries)}</span>
        </Stat>
        <Stat label={L.fights}>
          <span data-value="fights">{f(ex.fights)}</span>
        </Stat>
      </div>
      {simShown && (
        <p className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl" data-role="rep-sim">
          {L.sim(f(simShown.entries), f(simShown.fights), simShown.minPay, simShown.maxPay)}
        </p>
      )}
    </div>
  )
}
