import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, MONO, GRID } from '../../network/ui.jsx'
import { stats, MARKS, PROPS } from './bilateral.js'
import { num } from '../auctions/fmt.js'

// Live figure F2, "Two out of three": the square of the seller's cost c
// (horizontal) and the buyer's value v (vertical), both uniform 0–100, with
// the region where each rule trades shaded. Readouts: the chance of trade,
// the expected gains, the designer's average budget, and the four marks.

const FILL = '#fdba74'
const S = 200 // the square's side in the SVG
const PAD = { l: 30, b: 24, t: 8, r: 8 }

const T = {
  en: {
    rules: { vcg: 'Trade whenever v ≥ c (VCG)', posted: 'A posted price', split: 'Split the difference' },
    how: {
      vcg: 'Trade whenever the value is at least the cost; the buyer pays c, the seller receives v, and the designer pays the gap.',
      posted: 'Trade at p when the cost is at most p and the value at least p; each side just says yes or no.',
      split: 'Each names a price and they trade at the average if the bid is at least the ask; in the linear equilibrium the buyer bids 2v/3 + 100/12, the seller asks 2c/3 + 25, so they trade only when v ≥ c + 25.',
    },
    p: 'p, the posted price',
    c: 'c, the seller’s cost',
    v: 'v, the buyer’s value',
    chance: 'chance of trade',
    gains: 'expected gains from trade',
    budget: 'designer’s average budget',
    props: { efficient: 'efficient', truthful: 'truthful', voluntary: 'voluntary', balanced: 'balanced' },
    propsHow: 'efficient: trades whenever v ≥ c; truthful: the truth is dominant or an equilibrium; voluntary: nobody expects to lose by taking part; balanced: the designer neither pays nor keeps money.',
    none: 'No rule shows all four.',
    aria: 'The square of cost and value with the region where the rule trades shaded',
  },
  it: {
    rules: { vcg: 'Scambio quando v ≥ c (VCG)', posted: 'Un prezzo fisso', split: 'Dividere la differenza' },
    how: {
      vcg: 'Si scambia quando il valore è almeno il costo; il compratore paga c, il venditore riceve v, e il progettista paga la differenza.',
      posted: 'Si scambia a p quando il costo è al più p e il valore almeno p; ciascuno dice solo sì o no.',
      split: 'Ciascuno indica un prezzo e si scambia alla media se l’offerta è almeno la richiesta; nell’equilibrio lineare il compratore offre 2v/3 + 100/12, il venditore chiede 2c/3 + 25, e si scambia solo quando v ≥ c + 25.',
    },
    p: 'p, il prezzo fisso',
    c: 'c, il costo del venditore',
    v: 'v, il valore del compratore',
    chance: 'probabilità di scambio',
    gains: 'guadagni attesi dallo scambio',
    budget: 'bilancio medio del progettista',
    props: { efficient: 'efficiente', truthful: 'veritiero', voluntary: 'volontario', balanced: 'in pareggio' },
    propsHow: 'efficiente: si scambia ogni volta che v ≥ c; veritiero: dire il vero è dominante o un equilibrio; volontario: nessuno si aspetta di perdere partecipando; in pareggio: il progettista non paga né trattiene denaro.',
    none: 'Nessuna regola le ha tutte e quattro.',
    aria: 'Il quadrato di costo e valore con la regione in cui la regola scambia ombreggiata',
  },
}

export default function FigureTrade({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [rule, setRule] = useState('vcg')
  const [p, setP] = useState(50)
  const s = stats(rule, p)
  const X = (c) => PAD.l + (c / 100) * S
  const Y = (v) => PAD.t + S - (v / 100) * S
  const region =
    rule === 'vcg' ? [[0, 0], [100, 100], [0, 100]] : rule === 'posted' ? [[0, p], [p, p], [p, 100], [0, 100]] : [[0, 25], [75, 100], [0, 100]]
  const W = PAD.l + S + PAD.r
  const H = PAD.t + S + PAD.b
  const marks = MARKS[rule]

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-role="trade-rule">
        {['vcg', 'posted', 'split'].map((k) => (
          <Pill key={k} active={rule === k} onClick={() => setRule(k)} data-rule={k}>{L.rules[k]}</Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0 max-w-[280px] w-full mx-auto sm:mx-0">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="trade-square">
            <rect x={X(0)} y={Y(100)} width={S} height={S} fill="white" stroke={SLATE} strokeWidth="1" />
            {[25, 50, 75].map((t) => (
              <g key={t}>
                <line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(100)} stroke={GRID} />
                <line x1={X(0)} x2={X(100)} y1={Y(t)} y2={Y(t)} stroke={GRID} />
              </g>
            ))}
            <polygon points={region.map(([c, v]) => `${X(c).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')} fill={FILL} opacity="0.85" data-role="trade-region" />
            <line x1={X(0)} y1={Y(0)} x2={X(100)} y2={Y(100)} stroke={INK} strokeWidth="1.25" strokeDasharray="4 3" />
            {[0, 50, 100].map((t) => (
              <g key={`l${t}`}>
                <text x={X(t)} y={Y(0) + 12} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>{t}</text>
                <text x={X(0) - 4} y={Y(t) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>{t}</text>
              </g>
            ))}
            <text x={X(100)} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>c</text>
            <text x={X(0) + 4} y={Y(100) + 10} fontSize="9" fontFamily={MONO} fill={SLATE}>v</text>
          </svg>
          <p className="text-xs text-slate-500">{L.c} →, {L.v} ↑; v = c dashed.</p>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-xs text-slate-600 leading-snug">{L.how[rule]}</p>
          {rule === 'posted' && <Slider label={L.p} min={0} max={100} step={1} value={p} onChange={setP} />}
          <dl className="grid gap-1 text-sm" data-role="trade-readout">
            <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.chance}</dt><dd className="font-mono tabular-nums" data-value="chance">{num(s.chance, lang, 4)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.gains}</dt><dd className="font-mono tabular-nums" data-value="gains">{num(s.gains, lang, 2)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.budget}</dt><dd className="font-mono tabular-nums" data-value="budget">{num(s.budget, lang, 2)}</dd></div>
          </dl>
          <ul className="flex flex-wrap gap-2 text-xs" data-role="trade-marks">
            {PROPS.map((q) => (
              <li key={q} data-prop={q} data-ok={marks[q] ? 'yes' : 'no'} className={`rounded border px-2 py-0.5 ${marks[q] ? 'border-green-600 text-green-800 bg-green-50' : 'border-slate-300 text-slate-500 bg-slate-50 line-through'}`}>
                {marks[q] ? '✓' : '✗'} {L.props[q]}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 leading-snug">{L.propsHow} {L.none}</p>
        </div>
      </div>
    </div>
  )
}
