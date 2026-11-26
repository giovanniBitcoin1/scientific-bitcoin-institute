import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { ALLOC, makeRule, scanReports, gspThreshold } from './myerson.js'
import { num } from '../auctions/fmt.js'

// Panel A, "Lying does not pay": an allocation rule, a payment rule and a
// true value v; the payoff v·x(r) − p(r) of every report r from 0 to 100
// (every 0.1), the truth r = v marked and the best reports highlighted.

const GREEN = '#15803d'

const T = {
  en: {
    alloc: { single: 'One object', reserve: 'With a reserve', slots: 'Two ad slots', lottery: 'A lottery', middle: 'Win only in the middle' },
    allocHow: {
      single: 'one object; you win above the highest rival bid h',
      reserve: 'one object; the rival bids 30, and you win above the reserve as well',
      slots: 'rival bids 60 and 30; the top slot gets 1 click, the second α2',
      lottery: 'you win with probability r/(r + H)',
      middle: 'you win only with a report from 40 to just under 60: not monotone',
    },
    pays: { myerson: 'Myerson’s payment', bid: 'Pay your bid', gsp: 'Generalized second price' },
    paysHow: {
      myerson: 'p(r) = r·x(r) − ∫₀ʳ x(z) dz',
      bid: 'the winner pays her bid (per click for the slots)',
      gsp: 'each slot pays the next bid per click: 60 for the top, 30 for the second',
    },
    h: 'h, the highest rival bid',
    reserve: 'the reserve price',
    alpha: 'α2, clicks of the second slot',
    H: 'H, the lottery’s weight of the others',
    v: 'v, your true value',
    rAxis: 'your report r',
    pAxis: 'payoff',
    legend: ['your payoff', 'r = v', 'best reports'],
    truth: 'payoff of the truth',
    best: 'best payoff',
    at: 'at r =',
    truthBest: 'the truth is a best report',
    yes: 'yes',
    no: 'no',
    threshold: (t) => `The generalized second price makes the truth best for this v only if α2 ≤ ${t}.`,
    always: 'For this v the generalized second price makes the truth best for every α2 (below 60 the truth takes the second slot or nothing).',
    aria: 'Your payoff against your report, with the truth and the best reports marked',
  },
  it: {
    alloc: { single: 'Un oggetto', reserve: 'Con riserva', slots: 'Due spazi pubblicitari', lottery: 'Una lotteria', middle: 'Vinci solo nel mezzo' },
    allocHow: {
      single: 'un oggetto; vinci sopra l’offerta rivale più alta h',
      reserve: 'un oggetto; il rivale offre 30, e vinci anche sopra il prezzo di riserva',
      slots: 'offerte rivali 60 e 30; lo spazio in alto ha 1 clic, il secondo α2',
      lottery: 'vinci con probabilità r/(r + H)',
      middle: 'vinci solo dichiarando da 40 a poco meno di 60: non è monotona',
    },
    pays: { myerson: 'Pagamento di Myerson', bid: 'Paghi la tua offerta', gsp: 'Secondo prezzo generalizzato' },
    paysHow: {
      myerson: 'p(r) = r·x(r) − ∫₀ʳ x(z) dz',
      bid: 'chi vince paga la sua offerta (per clic negli spazi)',
      gsp: 'ogni spazio paga l’offerta successiva per clic: 60 quello in alto, 30 il secondo',
    },
    h: 'h, l’offerta rivale più alta',
    reserve: 'il prezzo di riserva',
    alpha: 'α2, i clic del secondo spazio',
    H: 'H, il peso degli altri nella lotteria',
    v: 'v, il tuo vero valore',
    rAxis: 'la tua dichiarazione r',
    pAxis: 'payoff',
    legend: ['il tuo payoff', 'r = v', 'le dichiarazioni migliori'],
    truth: 'payoff della verità',
    best: 'payoff migliore',
    at: 'con r =',
    truthBest: 'la verità è una dichiarazione migliore',
    yes: 'sì',
    no: 'no',
    threshold: (t) => `Il secondo prezzo generalizzato rende migliore la verità per questo v solo se α2 ≤ ${t}.`,
    always: 'Per questo v il secondo prezzo generalizzato rende migliore la verità per ogni α2 (sotto 60 la verità prende il secondo spazio o niente).',
    aria: 'Il tuo payoff in funzione della tua dichiarazione, con la verità e le dichiarazioni migliori segnate',
  },
}

const niceRange = (lo, hi) => {
  const top = Math.max(10, Math.ceil(hi / 10) * 10)
  const bot = Math.min(0, Math.floor(lo / 10) * 10)
  return [bot, top]
}

export default function TruthPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [id, setId] = useState('single')
  const [payRule, setPayRule] = useState('myerson')
  const [h, setH] = useState(60)
  const [reserve, setReserve] = useState(50)
  const [alpha, setAlpha] = useState(0.8)
  const [H, setHH] = useState(50)
  const [v, setV] = useState(80)
  const pr = payRule === 'gsp' && id !== 'slots' ? 'myerson' : payRule
  const rule = makeRule(id, { h, alpha, H, reserve })
  const scan = useMemo(() => scanReports(rule, pr, v), [id, pr, h, alpha, H, reserve, v]) // eslint-disable-line react-hooks/exhaustive-deps
  const d = (x, k = 2) => num(x, lang, k)
  const [lo, hi] = niceRange(Math.min(...scan.pts.map((q) => q[1])), Math.max(...scan.pts.map((q) => q[1])))
  const where = scan.ranges.map((g) => (g.from === g.to ? d(g.from, 1) : `${d(g.from, 1)}–${d(g.to, 1)}`)).join(', ')
  const th = gspThreshold(v)

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-role="tp-alloc">
        {ALLOC.map((k) => (
          <Pill key={k} active={id === k} onClick={() => setId(k)} data-alloc={k}>{L.alloc[k]}</Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" data-role="tp-pay">
        {['myerson', 'bid', 'gsp'].map((k) =>
          k === 'gsp' && id !== 'slots' ? null : (
            <Pill key={k} active={pr === k} onClick={() => setPayRule(k)} data-pay={k}>{L.pays[k]}</Pill>
          ),
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">
        {L.alloc[id]}: {L.allocHow[id]}. {L.pays[pr]}: {L.paysHow[pr]}.
      </p>
      <div className="mt-2 grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.v} min={0} max={100} step={1} value={v} onChange={setV} />
        {id === 'single' && <Slider label={L.h} min={0} max={100} step={1} value={h} onChange={setH} />}
        {id === 'reserve' && <Slider label={L.reserve} min={0} max={100} step={1} value={reserve} onChange={setReserve} />}
        {id === 'slots' && <Slider label={L.alpha} min={0} max={1} step={0.05} value={alpha} onChange={(x) => setAlpha(Math.round(x * 100) / 100)} format={(x) => d(x)} />}
        {id === 'lottery' && <Slider label={L.H} min={5} max={100} step={1} value={H} onChange={setHH} />}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0" data-role="tp-chart">
          <Chart
            height={190}
            x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: L.rAxis }}
            y={{ min: lo, max: hi, ticks: [lo, 0, hi].filter((t, i, a) => a.indexOf(t) === i), label: L.pAxis, labelSide: 'left', format: (y) => d(y, 0) }}
            series={[{ points: scan.pts, color: INK, width: 1.75 }]}
            marks={[{ x: v, color: ORANGE_DARK }]}
            aria={L.aria}
          >
            {({ sx, sy }) => (
              <g>
                {scan.ranges.map((g, i) =>
                  g.from === g.to ? (
                    <circle key={i} cx={sx(g.from)} cy={sy(scan.best)} r="3.5" fill={GREEN} />
                  ) : (
                    <line key={i} x1={sx(g.from)} x2={sx(g.to)} y1={sy(scan.best)} y2={sy(scan.best)} stroke={GREEN} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                  ),
                )}
              </g>
            )}
          </Chart>
          <Legend items={[{ label: L.legend[0], color: INK }, { label: L.legend[1], color: ORANGE_DARK }, { label: L.legend[2], color: GREEN }]} />
        </div>
        <dl className="grid gap-1 text-sm content-start" data-role="tp-readout">
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.truth}</dt><dd className="font-mono tabular-nums" data-value="truth">{d(scan.truth)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.best}</dt><dd className="font-mono tabular-nums text-right" data-value="best">{d(scan.best)} {L.at} {where}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.truthBest}</dt><dd className={`font-mono font-semibold ${scan.truthBest ? 'text-green-700' : 'text-orange-700'}`} data-value="ok">{scan.truthBest ? L.yes : L.no}</dd></div>
          {id === 'slots' && (
            <p className="mt-2 text-xs text-slate-600 leading-snug" data-value="threshold">{th === null ? L.always : L.threshold(d(th, 4))}</p>
          )}
        </dl>
      </div>
    </div>
  )
}
