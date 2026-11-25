import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { MONO, SLATE, INK, ORANGE_DARK } from '../../network/ui.jsx'
import { bars, averages, threshold, winner, T_DEFAULT } from './repeated.js'

// Live figure F1, "How much patience?": module 01's prisoner's dilemma with
// R = 3, S = 0, P = 1 and a temptation T. Two rows of bars for rounds 0 to
// 11: "cooperate" (3, 3, 3, …) and "defect in round 0" (T, then 1 for ever),
// each bar drawn at its discounted height δ^t u_t over a faint bar at full
// height. Sliders and SVG only: nothing captures a swipe.

export const num = (v, lang, d = 2) => (lang === 'it' ? v.toFixed(d).replace('.', ',') : v.toFixed(d))

const W = 320
const ROW = 50
const TOP = 12
const LEFT = 8
const N = 12
const BW = (W - LEFT - 4) / N

const T = {
  en: {
    T: 'T, the temptation',
    delta: 'δ, patience',
    rows: ['cooperate: 3, 3, 3, …', 'defect in round 0: T, then 1 for ever'],
    round: 'round t →',
    coop: 'Average, cooperating',
    defect: 'Average, defecting now',
    star: 'Threshold δ* = (T − 3)/(T − 1)',
    wins: 'At this δ',
    win: { cooperate: 'cooperation holds', defect: 'defecting pays', tie: 'a tie' },
    note: 'In the punishment phase both defect for ever; cooperating once there gives 0 instead of 1 and changes nothing, so the threat is credible.',
    aria: 'Two rows of bars, one per round: the payoffs of cooperating and of defecting in round 0, each shown at full height and at its discounted height',
  },
  it: {
    T: 'T, la tentazione',
    delta: 'δ, la pazienza',
    rows: ['cooperare: 3, 3, 3, …', 'defezionare al turno 0: T, poi 1 per sempre'],
    round: 'turno t →',
    coop: 'Media, cooperando',
    defect: 'Media, defezionando ora',
    star: 'Soglia δ* = (T − 3)/(T − 1)',
    wins: 'Con questo δ',
    win: { cooperate: 'la cooperazione regge', defect: 'defezionare conviene', tie: 'un pareggio' },
    note: 'Nella fase di punizione entrambi defezionano per sempre; cooperare una volta lì dà 0 invece di 1 e non cambia nulla, quindi la minaccia è credibile.',
    aria: 'Due righe di barre, una per turno: i payoff del cooperare e del defezionare al turno 0, ciascuno a piena altezza e alla sua altezza scontata',
  },
}

export default function FigurePatience({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [temptation, setTemptation] = useState(T_DEFAULT)
  const [delta, setDelta] = useState(0.6)
  const b = bars(temptation, delta, N)
  const a = averages(temptation, delta)
  const top = Math.max(temptation, 3)
  const H = TOP + 2 * ROW + 34
  const w = winner(temptation, delta)
  const row = (items, y0, color) =>
    items.map((it) => {
      const x = LEFT + it.t * BW + 1.5
      const full = ((ROW - 14) * it.u) / top
      const disc = ((ROW - 14) * it.d) / top
      return (
        <g key={it.t}>
          <rect x={x} y={y0 + ROW - full} width={BW - 3} height={full} fill={color} opacity="0.16" />
          <rect x={x} y={y0 + ROW - disc} width={BW - 3} height={disc} fill={color} data-bar={it.t} />
        </g>
      )
    })

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.T} min={3.5} max={10} step={0.5} value={temptation} onChange={setTemptation} format={(v) => num(v, lang, 1)} />
        <Slider label={L.delta} min={0} max={0.99} step={0.01} value={delta} onChange={setDelta} format={(v) => num(v, lang, 2)} />
      </div>
      <div className="mt-3 max-w-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="patience-bars">
          <text x={LEFT} y={TOP - 2} fontSize="9" fontFamily={MONO} fill={INK}>
            {L.rows[0]}
          </text>
          {row(b.cooperate, TOP, INK)}
          <text x={LEFT} y={TOP + ROW + 10} fontSize="9" fontFamily={MONO} fill={ORANGE_DARK}>
            {L.rows[1]}
          </text>
          {row(b.defect, TOP + ROW + 12, ORANGE_DARK)}
          <line x1={LEFT} x2={W - 4} y1={TOP + 2 * ROW + 12} y2={TOP + 2 * ROW + 12} stroke={SLATE} />
          {b.cooperate.map((it) => (
            <text key={it.t} x={LEFT + it.t * BW + BW / 2} y={TOP + 2 * ROW + 22} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="middle">
              {it.t}
            </text>
          ))}
          <text x={W - 4} y={H - 2} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">
            {L.round}
          </text>
        </svg>
      </div>
      <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm max-w-3xl" data-role="patience-readout">
        {[
          [L.coop, num(a.cooperate, lang, 3), 'coop'],
          [L.defect, num(a.defect, lang, 3), 'defect'],
          [L.star, num(threshold(temptation), lang, 3), 'star'],
          [L.wins, L.win[w], 'winner'],
        ].map(([label, v, key]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-mono tabular-nums text-slate-900" data-value={key}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{L.note}</p>
    </div>
  )
}
