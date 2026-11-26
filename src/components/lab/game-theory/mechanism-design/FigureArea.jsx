import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { makeRule, curve, f1Readout } from './myerson.js'
import { num } from '../auctions/fmt.js'

// Live figure F1, "The price is an area": the allocation x(z) against the bid
// z (0–100) for one object (highest rival bid h), two ad slots (click rates 1
// and α2, rival bids 60 and 30) or a lottery x = z/(z + H). For a bid b, the
// area under the curve from 0 to b is the bidder's payoff when b is her value
// (orange); the rest of the rectangle b × x(b) is Myerson's payment (blue).

const SKY = '#0369a1'
const PAY_FILL = '#bae6fd'
const KEEP_FILL = '#fed7aa'

const T = {
  en: {
    rules: { single: 'One object', slots: 'Two ad slots', lottery: 'A lottery' },
    h: 'h, the highest rival bid',
    alpha: 'α2, clicks of the second slot',
    H: 'H, the others’ weight in the lottery',
    b: 'b, your bid',
    how: {
      single: 'You win when your bid is above h (a tie is a coin toss).',
      slots: 'Rival bids 60 and 30: above 60 you get the top slot (1 click), between 30 and 60 the second (α2 clicks).',
      lottery: 'You win with probability z/(z + H): more for a higher bid, never certain.',
    },
    xAxis: 'your bid z',
    yAxis: 'x(z)',
    legend: ['x(z), what you get', 'your payoff: the area under x', 'your payment: the rest of b × x(b)'],
    x: 'x(b), what you get',
    p: 'p(b) = b·x(b) − area',
    keep: 'your payoff if b is your value',
    aria: 'The allocation against the bid, with the payoff and the payment shaded',
  },
  it: {
    rules: { single: 'Un oggetto', slots: 'Due spazi pubblicitari', lottery: 'Una lotteria' },
    h: 'h, l’offerta rivale più alta',
    alpha: 'α2, i clic del secondo spazio',
    H: 'H, il peso degli altri nella lotteria',
    b: 'b, la tua offerta',
    how: {
      single: 'Vinci quando la tua offerta supera h (in caso di parità si tira a sorte).',
      slots: 'Offerte rivali 60 e 30: sopra 60 hai lo spazio in alto (1 clic), tra 30 e 60 il secondo (α2 clic).',
      lottery: 'Vinci con probabilità z/(z + H): di più con un’offerta più alta, mai con certezza.',
    },
    xAxis: 'la tua offerta z',
    yAxis: 'x(z)',
    legend: ['x(z), ciò che ottieni', 'il tuo payoff: l’area sotto x', 'il tuo pagamento: il resto di b × x(b)'],
    x: 'x(b), ciò che ottieni',
    p: 'p(b) = b·x(b) − area',
    keep: 'il tuo payoff se b è il tuo valore',
    aria: 'L’allocazione in funzione dell’offerta, con il payoff e il pagamento ombreggiati',
  },
}

export default function FigureArea({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [id, setId] = useState('single')
  const [h, setH] = useState(60)
  const [alpha, setAlpha] = useState(0.8)
  const [H, setHH] = useState(50)
  const [b, setB] = useState(80)
  const rule = makeRule(id, { h, alpha, H })
  const r = f1Readout(rule, b)
  const full = curve(rule, 0, 100)
  const under = curve(rule, 0, b)
  const d = (v, k = 2) => num(v, lang, k)

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2" data-role="area-rule">
            {['single', 'slots', 'lottery'].map((k) => (
              <Pill key={k} active={id === k} onClick={() => setId(k)} data-rule={k}>{L.rules[k]}</Pill>
            ))}
          </div>
          <p className="text-xs text-slate-600 leading-snug">{L.how[id]}</p>
          {id === 'single' && <Slider label={L.h} min={0} max={100} step={1} value={h} onChange={setH} />}
          {id === 'slots' && <Slider label={L.alpha} min={0} max={1} step={0.05} value={alpha} onChange={(v) => setAlpha(Math.round(v * 100) / 100)} format={(v) => d(v)} />}
          {id === 'lottery' && <Slider label={L.H} min={5} max={100} step={1} value={H} onChange={setHH} />}
          <Slider label={L.b} min={0} max={100} step={1} value={b} onChange={setB} />
        </div>
        <div className="min-w-0" data-role="area-chart">
          <Chart
            height={180}
            x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: L.xAxis }}
            y={{ min: 0, max: 1, ticks: [0, 0.5, 1], label: L.yAxis, labelSide: 'left', format: (y) => d(y, 1) }}
            series={[]}
            marks={[{ x: b, color: ORANGE_DARK }]}
            aria={L.aria}
          >
            {({ sx, sy }) => {
              const keep = [...under, [b, 0], [0, 0]].map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')
              const payP = [[0, r.x], [b, r.x], ...[...under].reverse()].map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')
              return (
                <g>
                  <polygon points={payP} fill={PAY_FILL} opacity="0.85" data-role="area-pay" />
                  <polygon points={keep} fill={KEEP_FILL} opacity="0.9" data-role="area-keep" />
                  <polyline points={full.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
                  <line x1={sx(0)} x2={sx(b)} y1={sy(r.x)} y2={sy(r.x)} stroke={SKY} strokeWidth="1" strokeDasharray="3 3" />
                </g>
              )
            }}
          </Chart>
          <Legend items={[{ label: L.legend[0], color: INK }, { label: L.legend[1], color: KEEP_FILL, bar: true }, { label: L.legend[2], color: PAY_FILL, bar: true }]} />
        </div>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1 grid-cols-3 text-sm max-w-3xl" data-role="area-readout">
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">{L.x}</dt>
          <dd className="font-mono tabular-nums text-slate-900" data-value="x">{d(r.x, 4)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">{L.p}</dt>
          <dd className="font-mono tabular-nums text-slate-900" data-value="p">{d(r.p, 4)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">{L.keep}</dt>
          <dd className="font-mono tabular-nums text-slate-900" data-value="payoff">{d(r.payoff, 4)}</dd>
        </div>
      </dl>
    </div>
  )
}
