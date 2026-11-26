import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { MONO, SLATE, INK, ORANGE_DARK, GRID } from '../../network/ui.jsx'
import { trafficLight } from './correlated.js'
import { num } from './FigureFates.jsx'

// Live figure F2, "The traffic light": the payoff plane of module 01's
// chicken, with d the payoff of a crash (straight, straight). Drawn: the feasible set,
// the Nash equilibria's payoffs, the coins between the two pure equilibria,
// and the payoffs of the correlated equilibria (the hull of the payoffs of
// the vertices of their polytope, enumerated in correlated.js). A slider and
// SVG only: nothing captures a swipe.

const S = 260
const PAD = 22
const ACCENT = '#fb923c' // orange-400
const SKY = '#0369a1'

const T = {
  en: {
    d: 'd, the payoff of a crash (straight, straight)',
    mixed: 'Mixed equilibrium',
    mixedV: (q, m) => `swerve with ${q}, payoff ${m}`,
    best: 'Best symmetric correlated',
    worst: 'Worst symmetric correlated',
    lot: (p, v) => `SS ${p[0]}, ST ${p[1]}, TS ${p[2]}, TT ${p[3]}; payoff ${v}`,
    coin: 'A coin between (straight, swerve) and (swerve, straight)',
    coinV: 'payoff 2.5 each',
    area: 'Area of the correlated region',
    legend: ['feasible', 'correlated equilibria', 'coins', 'Nash'],
    note: 'S = swerve, T = straight. The mediator draws a cell with these probabilities and tells each driver only his own part.',
    aria: 'The payoff plane of chicken: the feasible set, the payoffs of the correlated equilibria, the coins between the two pure equilibria and the Nash equilibria',
  },
  it: {
    d: 'd, il payoff di uno scontro (dritto, dritto)',
    mixed: 'Equilibrio misto',
    mixedV: (q, m) => `sterza con ${q}, payoff ${m}`,
    best: 'Correlato simmetrico migliore',
    worst: 'Correlato simmetrico peggiore',
    lot: (p, v) => `SS ${p[0]}, SD ${p[1]}, DS ${p[2]}, DD ${p[3]}; payoff ${v}`,
    coin: 'Una moneta tra (dritto, sterza) e (sterza, dritto)',
    coinV: 'payoff 2,5 a testa',
    area: 'Area della regione correlata',
    legend: ['ammissibili', 'equilibri correlati', 'monete', 'Nash'],
    note: 'S = sterza, D = dritto. Il mediatore estrae una cella con queste probabilità e dice a ogni guidatore solo la parte che lo riguarda.',
    aria: 'Il piano dei payoff del gioco del pollo: l’insieme ammissibile, i payoff degli equilibri correlati, le monete tra i due equilibri puri e gli equilibri di Nash',
  },
}

export default function FigureTraffic({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [d, setD] = useState(0)
  const n = (x, k = 3) => num(x, lang, k)
  const t = trafficLight(d)
  const LO = Math.min(-0.5, Math.floor(d) - 0.3)
  const HI = 4.4
  const sx = (v) => PAD + ((v - LO) / (HI - LO)) * (S - PAD - 6)
  const sy = (v) => S - PAD - ((v - LO) / (HI - LO)) * (S - PAD - 6)
  const poly = (pts) => pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')
  const ticks = []
  for (let v = Math.ceil(LO); v <= 4; v++) ticks.push(v)
  const p3 = (p) => p.map((x) => n(x, 3))

  return (
    <div>
      <div className="max-w-md">
        <Slider label={L.d} min={-3} max={0.9} step={0.1} value={d} onChange={(v) => setD(Math.round(v * 10) / 10)} format={(v) => n(v, 1)} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] items-start max-w-3xl">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-auto max-w-[17rem]" role="img" aria-label={L.aria} data-role="traffic-plane">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={sy(LO)} y2={sy(HI)} stroke={GRID} />
              <line x1={sx(LO)} x2={sx(HI)} y1={sy(v)} y2={sy(v)} stroke={GRID} />
              <text x={sx(v)} y={S - PAD + 11} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="middle">
                {String(v).replace('-', '−')}
              </text>
              <text x={PAD - 4} y={sy(v) + 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
                {String(v).replace('-', '−')}
              </text>
            </g>
          ))}
          <polygon points={poly(t.feasible)} fill="#e2e8f0" stroke={SLATE} strokeWidth="0.8" data-region="feasible" />
          <polygon points={poly(t.region)} fill={ACCENT} opacity="0.85" data-region="correlated" data-area={t.area.toFixed(4)} />
          <line x1={sx(1)} y1={sy(4)} x2={sx(4)} y2={sy(1)} stroke={SKY} strokeWidth="2" strokeDasharray="4 3" data-region="coins" />
          <circle cx={sx(2.5)} cy={sy(2.5)} r="2.5" fill={SKY} />
          {t.nash.slice(0, 2).map(([a, b]) => (
            <circle key={`${a}${b}`} cx={sx(a)} cy={sy(b)} r="4" fill={INK} data-nash="pure" />
          ))}
          <circle cx={sx(t.mixed.payoff)} cy={sy(t.mixed.payoff)} r="4" fill="white" stroke={INK} strokeWidth="2" data-nash="mixed" />
          <circle cx={sx(t.best.payoff)} cy={sy(t.best.payoff)} r="3.5" fill={ORANGE_DARK} stroke="white" strokeWidth="1.5" data-role="traffic-best" />
          <circle cx={sx(t.worst.payoff)} cy={sy(t.worst.payoff)} r="3.5" fill={ORANGE_DARK} stroke="white" strokeWidth="1.5" data-role="traffic-worst" />
          <text x={sx(3) + 5} y={sy(3) - 4} fontSize="8" fontFamily={MONO} fill={INK}>
            (3, 3)
          </text>
          <text x={sx(d) + 5} y={sy(d) + 10} fontSize="8" fontFamily={MONO} fill={INK}>
            (d, d)
          </text>
          <text x={S - 6} y={S - 2} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
            u1 →
          </text>
          <text x={PAD + 2} y={10} fontSize="8" fontFamily={MONO} fill={SLATE}>
            ↑ u2
          </text>
        </svg>
        <div className="min-w-0">
          <dl className="grid gap-y-1.5 text-sm" data-role="traffic-readout">
            {[
              [L.mixed, L.mixedV(n(t.mixed.q), n(t.mixed.payoff)), 'mixed'],
              [L.best, L.lot(p3(t.best.p), n(t.best.payoff)), 'best'],
              [L.worst, L.lot(p3(t.worst.p), n(t.worst.payoff)), 'worst'],
              [L.coin, L.coinV, 'coin'],
              [L.area, n(t.area, 4), 'area'],
            ].map(([label, v, key]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={key}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {L.legend.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: ['#e2e8f0', ACCENT, SKY, INK][i] }} />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{L.note}</p>
        </div>
      </div>
    </div>
  )
}
