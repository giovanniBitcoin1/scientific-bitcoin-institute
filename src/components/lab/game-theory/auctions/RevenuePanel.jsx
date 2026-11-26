import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { meanRevenue, moments, noSale, biddersPayoff, FORMATS } from './auctions.js'
import { runAuctions, AUCTION_COUNTS, HIST_BINS } from './montecarlo.js'
import { num, int, pm } from './fmt.js'

// Panel A, "Same revenue, different risk": n bidders, values uniform 0–100,
// equilibrium bids; first price (= Dutch), second price (= English) or
// all-pay; a reserve r for the first and second price. The same draws are
// auctioned under the three formats; the chosen one is shown against its
// exact values, with a histogram of its revenue and the others as outlines.
// "Run again" n uses seed n; any change of setting keeps the run number.

const COLORS = { first: ORANGE_DARK, second: '#0369a1', allpay: '#15803d' }

const T = {
  en: {
    n: 'n, the bidders',
    r: 'r, the reserve price',
    rOff: 'r, the reserve price (first and second price only)',
    formats: { first: 'First price (= Dutch)', second: 'Second price (= English)', allpay: 'All-pay' },
    short: { first: 'first price', second: 'second price', allpay: 'all-pay' },
    auctions: 'Auctions:',
    again: 'Run again',
    run: (s) => `Run no. ${s} (seed ${s})`,
    mean: 'Average revenue',
    sd: 'Standard deviation',
    none: 'No sale',
    bidders: 'Bidders’ payoff, in total',
    exact: 'exact',
    bids: {
      first: (rho) => (rho > 0 ? 'bid ((n − 1)/n)·v + r^n/(n·v^(n − 1)) in units of 100, if v ≥ r' : 'bid (n − 1)/n of the value'),
      second: (rho) => (rho > 0 ? 'bid the value, if it is at least r; pay the larger of r and the second bid' : 'bid the value; pay the second bid'),
      allpay: () => 'bid ((n − 1)/n)·v^n in units of 100; everyone pays her bid',
    },
    table: ['format', 'mean ± s.e.', 'exact', 'sd', 'exact'],
    hist: (f) => `Revenue in each auction: ${f} (bars), the other formats (outlines)`,
    share: 'share',
    revenue: 'revenue',
    above: (m) => `the last bin holds everything above ${m - m / HIST_BINS}`,
    aria: 'Histogram of the revenue per auction for the chosen format, with the other two formats as outlines',
  },
  it: {
    n: 'n, gli offerenti',
    r: 'r, il prezzo di riserva',
    rOff: 'r, il prezzo di riserva (solo primo e secondo prezzo)',
    formats: { first: 'Primo prezzo (= olandese)', second: 'Secondo prezzo (= inglese)', allpay: 'All-pay' },
    short: { first: 'primo prezzo', second: 'secondo prezzo', allpay: 'all-pay' },
    auctions: 'Aste:',
    again: 'Nuova prova',
    run: (s) => `Prova n. ${s} (seme ${s})`,
    mean: 'Ricavo medio',
    sd: 'Deviazione standard',
    none: 'Nessuna vendita',
    bidders: 'Payoff degli offerenti, in totale',
    exact: 'esatto',
    bids: {
      first: (rho) => (rho > 0 ? 'offerta ((n − 1)/n)·v + r^n/(n·v^(n − 1)) in unità di 100, se v ≥ r' : 'offerta pari a (n − 1)/n del valore'),
      second: (rho) => (rho > 0 ? 'offerta pari al valore, se è almeno r; si paga il maggiore tra r e la seconda offerta' : 'offerta pari al valore; si paga la seconda offerta'),
      allpay: () => 'offerta ((n − 1)/n)·v^n in unità di 100; ognuno paga la sua offerta',
    },
    table: ['formato', 'media ± e.s.', 'esatto', 'dev. st.', 'esatta'],
    hist: (f) => `Ricavo di ogni asta: ${f} (barre), gli altri formati (contorni)`,
    share: 'quota',
    revenue: 'ricavo',
    above: (m) => `l’ultima classe contiene tutto ciò che supera ${m - m / HIST_BINS}`,
    aria: 'Istogramma del ricavo per asta del formato scelto, con gli altri due formati come contorni',
  },
}

export default function RevenuePanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const f2 = (v) => num(v, lang, 2)
  const [n, setN] = useState(2)
  const [format, setFormat] = useState('first')
  const [r, setR] = useState(0)
  const [auctions, setAuctions] = useState(10000)
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => runAuctions({ n, r, auctions, seed }), [n, r, auctions, seed])
  const rhoOf = (fm) => (fm === 'allpay' ? 0 : r / 100)
  const exact = (fm) => {
    const rho = rhoOf(fm)
    return { mean: 100 * meanRevenue(n, rho), sd: 100 * moments(fm, n, rho).sd, none: fm === 'allpay' ? 0 : noSale(n, rho), bidders: 100 * biddersPayoff(n, rho) }
  }
  const ex = exact(format)
  const s = sim[format]
  const top = sim.histMax
  const width = top / HIST_BINS
  const shares = (fm) => sim[fm].hist.map((c) => c / auctions)
  const yMax = Math.max(0.05, ...FORMATS.map((fm) => Math.max(...shares(fm))))
  const yTop = Math.ceil(yMax * 10) / 10
  const outline = (fm) => {
    const h = shares(fm)
    const pts = [[0, 0]]
    h.forEach((y, i) => {
      pts.push([i * width, y], [(i + 1) * width, y])
    })
    pts.push([top, 0])
    return pts
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-role="ra-formats">
        {FORMATS.map((fm) => (
          <Pill key={fm} active={format === fm} onClick={() => setFormat(fm)} data-format={fm}>{L.formats[fm]}</Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.n} min={2} max={10} step={1} value={n} onChange={setN} />
        <div className={format === 'allpay' ? 'opacity-50' : ''} data-role="ra-reserve">
          <Slider label={format === 'allpay' ? L.rOff : L.r} min={0} max={90} step={5} value={r} onChange={setR} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="ra-counts">
        <span>{L.auctions}</span>
        {AUCTION_COUNTS.map((c) => (
          <Pill key={c} active={auctions === c} onClick={() => setAuctions(c)} data-count={c}>{int(c, lang)}</Pill>
        ))}
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="ra-again">{L.again}</Pill>
        <span className="font-mono" data-role="ra-seed">{L.run(seed)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl" data-role="ra-bids">{L.formats[format]}: {L.bids[format](rhoOf(format))}.</p>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl" data-role="ra-readout">
        <Stat label={L.mean}>
          <span data-value="mean">{pm(s.mean, s.se, lang)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="meanExact">{f2(ex.mean)}</span></span>
        </Stat>
        <Stat label={L.sd}>
          <span data-value="sd">{f2(s.sd)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="sdExact">{f2(ex.sd)}</span></span>
        </Stat>
        <Stat label={L.none}>
          <span data-value="none">{num(s.noSale, lang, 4)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="noneExact">{num(ex.none, lang, 4)}</span></span>
        </Stat>
        <Stat label={L.bidders}>
          <span data-value="bidders">{f2(s.surplus)}</span>
          <span className="block text-xs text-slate-500">{L.exact} <span data-value="biddersExact">{f2(ex.bidders)}</span></span>
        </Stat>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 mb-1">{L.hist(L.short[format])}</p>
          <Chart
            height={170}
            x={{ min: 0, max: top, ticks: [0, top / 4, top / 2, (3 * top) / 4, top], label: L.revenue, format: (x) => String(x) }}
            y={{ min: 0, max: yTop, ticks: [0, yTop / 2, yTop], label: L.share, labelSide: 'left', format: (y) => num(y, lang, 2) }}
            series={FORMATS.filter((fm) => fm !== format).map((fm) => ({ points: outline(fm), color: COLORS[fm], width: 1.25 }))}
            aria={L.aria}
          >
            {({ sx, sy }) => (
              <g data-role="ra-bars">
                {shares(format).map((y, i) => (
                  <rect key={i} x={sx(i * width) + 0.5} y={sy(y)} width={Math.max(0, sx(width) - sx(0) - 1)} height={Math.max(0, sy(0) - sy(y))} fill={COLORS[format]} opacity="0.55" />
                ))}
              </g>
            )}
          </Chart>
          <Legend items={FORMATS.map((fm) => ({ label: L.short[fm], color: COLORS[fm], bar: fm === format }))} />
          {top > 100 && <p className="text-xs text-slate-500 mt-1">{L.above(top)}</p>}
        </div>
        <div className="min-w-0">
          <table className="w-full text-xs font-mono tabular-nums" data-role="ra-table">
            <thead>
              <tr className="text-slate-500 text-left">
                {L.table.map((h, i) => (
                  <th key={i} className="font-normal pr-2 pb-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((fm) => {
                const e = exact(fm)
                return (
                  <tr key={fm} data-format={fm} className={fm === format ? 'bg-orange-50' : ''}>
                    <td className="pr-2 py-0.5 font-sans" style={{ color: COLORS[fm] }}>{L.short[fm]}</td>
                    <td className="pr-2" data-value="mean">{pm(sim[fm].mean, sim[fm].se, lang)}</td>
                    <td className="pr-2" data-value="meanExact">{f2(e.mean)}</td>
                    <td className="pr-2" data-value="sd">{f2(sim[fm].sd)}</td>
                    <td data-value="sdExact">{f2(e.sd)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
