import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { profitExact, loseExact, tooHighExact, revenueExact, breakEven, eqDiscount, eqProfit, runCommonValue, CV_COUNTS } from './commonvalue.js'
import { num, int, pm } from './fmt.js'

// Panel B, "The winner's curse": a jar of coins worth V, uniform between 100
// and 200; each of n bidders sees V + e, e uniform within ±a, and bids her
// estimate minus a discount k; first or second price (sealed). The chart
// gives the winner's average profit against k: the exact line, and the
// simulated points (the same draws at every k, so the points are this run's
// average error subtracted from each k). "Run again" n uses seed n.

const SKY = '#0369a1'
const clampK = (k, a) => Math.min(2 * a, Math.max(-a, k))

const T = {
  en: {
    n: 'n, the bidders',
    a: 'a, the largest error (±a)',
    k: 'k, the discount (bid = estimate − k)',
    first: 'First price',
    second: 'Second price',
    presets: 'Set k:',
    zero: 'Bid the estimate',
    even: 'Break even',
    eq: 'Equilibrium',
    auctions: 'Auctions:',
    again: 'Run again',
    run: (s) => `Run no. ${s} (seed ${s})`,
    profit: 'Winner’s average profit',
    lose: 'Winner loses money',
    high: 'Winner’s estimate too high',
    revenue: 'Seller’s average revenue',
    exact: 'exact',
    breakEven: (k) => `Break-even discount: ${k}.`,
    equilibrium: (fm, k, p) => `Equilibrium discount away from the ends of the range (${fm}): ${k}, and there the winner earns ${p} on average.`,
    fms: { first: 'first price', second: 'second price' },
    chart: 'The winner’s average profit against the discount k',
    axis: 'k',
    legend: ['exact', 'simulated (same draws at every k)', 'your k'],
    aria: 'The winner’s average profit against the discount, exact line and simulated points',
  },
  it: {
    n: 'n, gli offerenti',
    a: 'a, l’errore massimo (±a)',
    k: 'k, lo sconto (offerta = stima − k)',
    first: 'Primo prezzo',
    second: 'Secondo prezzo',
    presets: 'Imposta k:',
    zero: 'Offri la stima',
    even: 'Pareggio',
    eq: 'Equilibrio',
    auctions: 'Aste:',
    again: 'Nuova prova',
    run: (s) => `Prova n. ${s} (seme ${s})`,
    profit: 'Profitto medio del vincitore',
    lose: 'Il vincitore ci rimette',
    high: 'Stima del vincitore troppo alta',
    revenue: 'Ricavo medio del venditore',
    exact: 'esatto',
    breakEven: (k) => `Sconto di pareggio: ${k}.`,
    equilibrium: (fm, k, p) => `Sconto di equilibrio lontano dagli estremi dell’intervallo (${fm}): ${k}, e lì il vincitore guadagna in media ${p}.`,
    fms: { first: 'primo prezzo', second: 'secondo prezzo' },
    chart: 'Il profitto medio del vincitore in funzione dello sconto k',
    axis: 'k',
    legend: ['esatto', 'simulato (stesse estrazioni per ogni k)', 'il tuo k'],
    aria: 'Il profitto medio del vincitore in funzione dello sconto, retta esatta e punti simulati',
  },
}

export default function CursePanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const f2 = (v) => num(v, lang, 2)
  const [n, setN] = useState(5)
  const [a, setA] = useState(10)
  const [kRaw, setK] = useState(0)
  const [format, setFormat] = useState('first')
  const [auctions, setAuctions] = useState(10000)
  const [seed, setSeed] = useState(1)
  const k = clampK(kRaw, a)
  const sim = useMemo(() => runCommonValue({ n, a, k, format, auctions, seed }), [n, a, k, format, auctions, seed])
  const ks = Array.from({ length: 13 }, (_, i) => -a + (i * 3 * a) / 12)
  const lo = profitExact(format, n, a, -a)
  const hi = profitExact(format, n, a, 2 * a)
  const yMin = Math.floor(Math.min(lo, -1) / 5) * 5
  const yMax = Math.ceil(Math.max(hi, 1) / 5) * 5
  const setA2 = (v) => {
    setA(v)
    setK(clampK(kRaw, v))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-role="wc-formats">
        <Pill active={format === 'first'} onClick={() => setFormat('first')} data-format="first">{L.first}</Pill>
        <Pill active={format === 'second'} onClick={() => setFormat('second')} data-format="second">{L.second}</Pill>
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.n} min={2} max={12} step={1} value={n} onChange={setN} />
        <Slider label={L.a} min={1} max={25} step={1} value={a} onChange={setA2} />
        <Slider label={L.k} min={-a} max={2 * a} step={0.5} value={k} onChange={setK} format={(x) => num(x, lang, Number.isInteger(x * 2) ? 1 : 2)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="wc-presets">
        <span>{L.presets}</span>
        <Pill onClick={() => setK(0)} data-preset="zero">{L.zero}</Pill>
        <Pill onClick={() => setK(breakEven(format, n, a))} data-preset="even">{L.even}</Pill>
        <Pill onClick={() => setK(eqDiscount(format, n, a))} data-preset="eq">{L.eq}</Pill>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="wc-counts">
        <span>{L.auctions}</span>
        {CV_COUNTS.map((c) => (
          <Pill key={c} active={auctions === c} onClick={() => setAuctions(c)} data-count={c}>{int(c, lang)}</Pill>
        ))}
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="wc-again">{L.again}</Pill>
        <span className="font-mono" data-role="wc-seed">{L.run(seed)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl" data-role="wc-readout">
        <Stat label={L.profit}>
          <span data-value="profit">{pm(sim.profit, sim.se, lang)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="profitExact">{f2(profitExact(format, n, a, k))}</span></span>
        </Stat>
        <Stat label={L.lose}>
          <span data-value="lose">{num(sim.lose, lang, 4)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="loseExact">{num(loseExact(format, n, a, k), lang, 4)}</span></span>
        </Stat>
        <Stat label={L.high}>
          <span data-value="high">{num(sim.tooHigh, lang, 4)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="highExact">{num(tooHighExact(n), lang, 4)}</span></span>
        </Stat>
        <Stat label={L.revenue}>
          <span data-value="revenue">{f2(sim.revenue)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="revenueExact">{f2(revenueExact(format, n, a, k))}</span></span>
        </Stat>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl" data-role="wc-lines">
        <span data-value="even">{L.breakEven(f2(breakEven(format, n, a)))}</span>{' '}
        <span data-value="eq">{L.equilibrium(L.fms[format], f2(eqDiscount(format, n, a)), f2(eqProfit(format, n, a)))}</span>
      </p>

      <div className="mt-4 max-w-md" data-role="wc-chart">
        <p className="text-xs text-slate-500 mb-1">{L.chart}</p>
        <Chart
          height={170}
          x={{ min: -a, max: 2 * a, ticks: [-a, 0, a, 2 * a], label: L.axis, format: (x) => num(x, lang, 0) }}
          y={{ min: yMin, max: yMax, ticks: [yMin, 0, yMax].filter((t, i, arr) => arr.indexOf(t) === i), format: (y) => num(y, lang, 0) }}
          series={[
            { points: [[-a, 0], [2 * a, 0]], color: SLATE, width: 1, dashed: true, opacity: 0.6 },
            { points: [[-a, lo], [2 * a, hi]], color: INK, width: 1.75 },
            { points: ks.map((x) => [x, x - sim.priceError]), color: SKY, line: false, dots: 2.6 },
          ]}
          marks={[{ x: k, color: ORANGE_DARK }]}
          aria={L.aria}
        />
        <Legend items={[{ label: L.legend[0], color: INK }, { label: L.legend[1], color: SKY }, { label: L.legend[2], color: ORANGE_DARK }]} />
      </div>
    </div>
  )
}
