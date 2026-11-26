import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK, GRID, MONO } from '../../network/ui.jsx'
import { solve, instance, survey, histogram, bound, PIGOU } from './parallel.js'
import { num } from './fmt.js'

// Panel A, "How bad can it get?": n parallel roads, road i costing
// a_i x^d + b_i, demand r. One instance at a time (random, seeded: "New
// instance" n uses seed n; or Pigou's two roads), with its equilibrium and
// optimum; "1,000 instances" draws a fresh sample with seed 1 for the
// current n, d, r, only on the button.

const SKY = '#0369a1'
const BINS = 20

const T = {
  en: {
    n: 'n, the roads',
    d: 'd, the degree of the costs',
    r: 'r, the demand',
    newInst: 'New instance',
    pigou: 'Pigou',
    many: '1,000 instances',
    which: (s) => (s === 'pigou' ? 'Pigou’s two roads: costs 1 and x^d, demand 1' : `Instance no. ${s} (seed ${s}); a_i, b_i uniform on [0, 1]`),
    road: (i) => `road ${i + 1}`,
    legend: ['equilibrium', 'optimum'],
    eqCost: 'Cost at equilibrium',
    optCost: 'Cost at the optimum',
    ratio: 'Ratio (price of anarchy here)',
    doubled: 'Equilibrium against optimum with demand 2r',
    holds: 'holds',
    fails: 'fails',
    flowsNote: 'Bars: the flow on each road; the cost of each road is a_i x^d + b_i. Costs are total travel time.',
    sTitle: (n, d, r) => `1,000 random instances, n = ${n}, d = ${d}, r = ${r} (seed 1)`,
    mean: 'Mean ratio',
    largest: 'Largest ratio found',
    above: 'Share above 1.05',
    bnd: (d) => `Bound for degree ${d}`,
    allDoubled: 'Doubled-demand check in every instance',
    yes: 'yes',
    no: 'no',
    histAria: 'Histogram of the ratios of the 1,000 instances, with the bound for the degree as a line',
    barsAria: 'The flow on each road at equilibrium and at the optimum',
  },
  it: {
    n: 'n, le strade',
    d: 'd, il grado dei costi',
    r: 'r, la domanda',
    newInst: 'Nuova istanza',
    pigou: 'Pigou',
    many: '1.000 istanze',
    which: (s) => (s === 'pigou' ? 'Le due strade di Pigou: costi 1 e x^d, domanda 1' : `Istanza n. ${s} (seme ${s}); a_i, b_i uniformi su [0, 1]`),
    road: (i) => `strada ${i + 1}`,
    legend: ['equilibrio', 'ottimo'],
    eqCost: 'Costo in equilibrio',
    optCost: 'Costo nell’ottimo',
    ratio: 'Rapporto (qui il prezzo dell’anarchia)',
    doubled: 'Equilibrio contro ottimo con domanda 2r',
    holds: 'vale',
    fails: 'non vale',
    flowsNote: 'Barre: il flusso su ogni strada; il costo di ogni strada è a_i x^d + b_i. I costi sono il tempo di viaggio totale.',
    sTitle: (n, d, r) => `1.000 istanze casuali, n = ${n}, d = ${d}, r = ${r} (seme 1)`,
    mean: 'Rapporto medio',
    largest: 'Rapporto massimo trovato',
    above: 'Quota sopra 1,05',
    bnd: (d) => `Limite per il grado ${d}`,
    allDoubled: 'Verifica con domanda doppia in ogni istanza',
    yes: 'sì',
    no: 'no',
    histAria: 'Istogramma dei rapporti delle 1.000 istanze, con il limite per il grado come linea',
    barsAria: 'Il flusso su ogni strada in equilibrio e nell’ottimo',
  },
}

function Bars({ a, b, d, s, L, lang }) {
  const n = (v, k = 2) => num(v, lang, k)
  const top = Math.max(...s.eq, ...s.opt, 1e-9)
  const rowH = 30
  const W = 320
  const X0 = 112
  const H = a.length * rowH + 6
  const len = (v) => (v / top) * (W - X0 - 46)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.barsAria} data-role="parallel-bars">
      {a.map((ai, i) => {
        const y = 4 + i * rowH
        return (
          <g key={i} data-road={i} data-eq={s.eq[i].toFixed(4)} data-opt={s.opt[i].toFixed(4)}>
            <text x={2} y={y + 10} fontSize="9" fontFamily={MONO} fill={INK}>{L.road(i)}</text>
            <text x={2} y={y + 22} fontSize="8" fontFamily={MONO} fill={SLATE}>{`${n(ai)}x${d > 1 ? `^${d}` : ''} + ${n(b[i])}`}</text>
            <rect x={X0} y={y + 2} width={Math.max(0.5, len(s.eq[i]))} height="10" fill={ORANGE_DARK} />
            <rect x={X0} y={y + 14} width={Math.max(0.5, len(s.opt[i]))} height="10" fill={SKY} />
            <text x={X0 + len(s.eq[i]) + 4} y={y + 11} fontSize="8" fontFamily={MONO} fill={INK}>{n(s.eq[i], 3)}</text>
            <text x={X0 + len(s.opt[i]) + 4} y={y + 23} fontSize="8" fontFamily={MONO} fill={INK}>{n(s.opt[i], 3)}</text>
          </g>
        )
      })}
      <line x1={X0} x2={X0} y1={2} y2={H - 2} stroke={GRID} />
    </svg>
  )
}

function Histogram({ sv, L, lang }) {
  const W = 320
  const H = 140
  const pad = { l: 30, r: 8, t: 10, b: 24 }
  const top = sv.bound
  const h = histogram(sv.ratios, top, BINS)
  const hmax = Math.max(...h, 1)
  const bw = (W - pad.l - pad.r) / BINS
  const sx = (v) => pad.l + ((v - 1) / (top - 1)) * (W - pad.l - pad.r)
  const sy = (c) => H - pad.b - (c / hmax) * (H - pad.t - pad.b)
  const ticks = [1, (1 + top) / 2, top]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.histAria} data-role="parallel-hist">
      {h.map((c, i) => (
        <rect key={i} x={pad.l + i * bw + 0.5} y={sy(c)} width={bw - 1} height={H - pad.b - sy(c)} fill={ORANGE_DARK} opacity="0.85" />
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke={SLATE} />
      {ticks.map((v) => (
        <text key={v} x={sx(v)} y={H - pad.b + 12} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="middle">{num(v, lang, 3)}</text>
      ))}
      <text x={pad.l - 4} y={sy(hmax) + 3} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">{hmax}</text>
      <text x={pad.l - 4} y={H - pad.b + 3} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">0</text>
      <line x1={sx(top)} x2={sx(top)} y1={pad.t} y2={H - pad.b} stroke={INK} strokeWidth="2" strokeDasharray="4 3" />
      <text x={sx(top) - 4} y={pad.t + 8} fontSize="9" fontFamily={MONO} fill={INK} textAnchor="end">{L.bnd(sv.d)}</text>
    </svg>
  )
}

export default function ParallelPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n4 = (v) => num(v, lang, 4)
  const [nRoads, setN] = useState(3)
  const [d, setD] = useState(1)
  const [r, setR] = useState(1)
  const [which, setWhich] = useState(1) // a seed, or 'pigou'
  const [sv, setSv] = useState(null)
  const inst = which === 'pigou' ? { a: PIGOU.a, b: PIGOU.b } : instance(nRoads, which)
  const s = useMemo(() => solve(inst.a, inst.b, d, r), [which, nRoads, d, r]) // eslint-disable-line react-hooks/exhaustive-deps
  const fresh = sv && sv.n === nRoads && sv.d === d && sv.r === r
  const rShown = num(r, lang, 1)

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.n} min={2} max={10} step={1} value={nRoads} onChange={(v) => { setN(v); if (which === 'pigou') setWhich(1) }} />
        <Slider label={L.d} min={1} max={4} step={1} value={d} onChange={setD} />
        <Slider label={L.r} min={0.1} max={5} step={0.1} value={r} onChange={(v) => setR(Math.round(v * 10) / 10)} format={(v) => num(v, lang, 1)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setWhich(which === 'pigou' ? 1 : which + 1)} data-role="parallel-new">{L.newInst}</Pill>
        <Pill active={which === 'pigou'} onClick={() => { setWhich('pigou'); setR(1) }} data-role="parallel-pigou">{L.pigou}</Pill>
        <Pill onClick={() => setSv({ ...survey(nRoads, d, r), n: nRoads, d, r })} data-role="parallel-many">{L.many}</Pill>
      </div>
      <p className="mt-2 text-xs text-slate-500 font-mono" data-role="parallel-which">{L.which(which)}</p>

      <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <Bars a={inst.a} b={inst.b} d={d} s={s} L={L} lang={lang} />
          <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-600">
            {L.legend.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3" style={{ background: [ORANGE_DARK, SKY][i] }} />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{L.flowsNote}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 content-start" data-role="parallel-readout">
          <Stat label={L.eqCost}><span data-value="eq">{n4(s.eqCost)}</span></Stat>
          <Stat label={L.optCost}><span data-value="opt">{n4(s.optCost)}</span></Stat>
          <Stat label={L.ratio}><span data-value="ratio">{n4(s.ratio)}</span></Stat>
          <Stat label={L.bnd(d)}><span data-value="bound">{n4(bound(d))}</span></Stat>
          <Stat label={L.doubled} wide>
            <span data-value="doubled">{n4(s.eqCost)} ≤ {n4(s.opt2Cost)}: {s.doubled ? L.holds : L.fails}</span>
          </Stat>
        </div>
      </div>

      {fresh && (
        <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl" data-role="parallel-survey">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-mono">{L.sTitle(nRoads, d, rShown)}</p>
            <Histogram sv={sv} L={L} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-2 content-start">
            <Stat label={L.mean}><span data-value="s-mean">{num(sv.mean, lang, 3)}</span></Stat>
            <Stat label={L.largest}><span data-value="s-largest">{num(sv.largest, lang, 3)}</span></Stat>
            <Stat label={L.above}><span data-value="s-above">{num(sv.above, lang, 2)}</span></Stat>
            <Stat label={L.bnd(d)}><span data-value="s-bound">{num(sv.bound, lang, 3)}</span></Stat>
            <Stat label={L.allDoubled} wide><span data-value="s-doubled">{sv.allDoubled ? L.yes : L.no}</span></Stat>
          </div>
        </div>
      )}
    </div>
  )
}
