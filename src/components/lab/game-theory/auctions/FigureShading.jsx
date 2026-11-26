import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Stat, INK, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { payoffF2, winChanceF2, bestBidF2 } from './auctions.js'
import { num } from './fmt.js'

// Live figure F2, "How much to shade": the first-price auction with n bidders
// whose values are uniform between 0 and 100; the others bid (n − 1)/n of
// their values. Your expected payoff (v − b) · min(1, n b/(100(n − 1)))^(n − 1)
// against your bid b from 0 to v, with the best bid (n − 1)v/n marked.

const STEPS = 200

const T = {
  en: {
    n: 'n, the bidders',
    v: 'v, your value',
    axis: 'your bid b',
    payoff: 'expected payoff',
    legend: ['expected payoff', 'the best bid (n − 1)v/n'],
    best: 'Best bid',
    chance: 'Chance of winning',
    payoffAt: 'Expected payoff',
    shade: (s) => `You bid ${s}% of your value; the gap is what you keep when you win.`,
    zero: 'With a value of 0 there is nothing to bid for.',
    aria: 'Your expected payoff against your bid in the first-price auction, with the best bid marked',
  },
  it: {
    n: 'n, gli offerenti',
    v: 'v, il tuo valore',
    axis: 'la tua offerta b',
    payoff: 'payoff atteso',
    legend: ['payoff atteso', 'l’offerta migliore (n − 1)v/n'],
    best: 'Offerta migliore',
    chance: 'Probabilità di vincere',
    payoffAt: 'Payoff atteso',
    shade: (s) => `Offri il ${s}% del tuo valore; la differenza è ciò che tieni quando vinci.`,
    zero: 'Con un valore di 0 non c’è nulla per cui offrire.',
    aria: 'Il tuo payoff atteso in funzione della tua offerta nell’asta al primo prezzo, con l’offerta migliore segnata',
  },
}

export default function FigureShading({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [n, setN] = useState(2)
  const [v, setV] = useState(80)
  const bb = bestBidF2(n, v)
  const pw = winChanceF2(n, bb)
  const pay = payoffF2(n, v, bb)
  const pts = v > 0 ? Array.from({ length: STEPS + 1 }, (_, i) => [(v * i) / STEPS, payoffF2(n, v, (v * i) / STEPS)]) : [[0, 0]]
  const yMax = Math.max(1, pay * 1.15)
  const yTop = yMax >= 10 ? Math.ceil(yMax / 5) * 5 : Math.ceil(yMax)
  const xMax = Math.max(v, 1)

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.n} min={2} max={10} step={1} value={n} onChange={setN} />
        <Slider label={L.v} min={0} max={100} step={1} value={v} onChange={setV} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] items-start max-w-3xl">
        <div className="min-w-0">
          <Chart
            height={170}
            x={{ min: 0, max: xMax, ticks: [0, Math.round(xMax / 4), Math.round(xMax / 2), Math.round((3 * xMax) / 4), Math.round(xMax)], label: L.axis }}
            y={{ min: 0, max: yTop, ticks: [0, yTop / 2, yTop], label: L.payoff, labelSide: 'left', format: (y) => num(y, lang, yTop >= 10 ? 0 : 1) }}
            series={[{ points: pts, color: INK, width: 2 }]}
            marks={v > 0 ? [{ x: bb, color: ORANGE_DARK }] : []}
            aria={L.aria}
          >
            {({ sx, sy }) => (v > 0 ? <circle cx={sx(bb)} cy={sy(pay)} r="4" fill={ORANGE_DARK} stroke="white" strokeWidth="1.5" /> : null)}
          </Chart>
          <Legend items={[{ label: L.legend[0], color: INK }, { label: L.legend[1], color: ORANGE_DARK }]} />
        </div>
        <div className="min-w-0 grid grid-cols-3 sm:grid-cols-1 gap-2" data-role="shading-readout">
          <Stat label={L.best}>
            <span data-value="bid">{num(bb, lang, 2)}</span>
          </Stat>
          <Stat label={L.chance}>
            <span data-value="chance">{num(pw, lang, 4)}</span>
          </Stat>
          <Stat label={L.payoffAt}>
            <span data-value="payoff">{num(pay, lang, 4)}</span>
          </Stat>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl" data-role="shading-note">
        {v > 0 ? L.shade(num((100 * (n - 1)) / n, lang, 0)) : L.zero}
      </p>
    </div>
  )
}
