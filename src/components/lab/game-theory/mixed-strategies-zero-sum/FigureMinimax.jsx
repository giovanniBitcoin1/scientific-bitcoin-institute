import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { INK, Pill } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { PENALTY, minimax, vsKeeperLeft, vsKeeperRight, shootLeft, shootRight } from './mixed.js'

// Live figure F2: the best worst case in the penalty kick. Kicker's side:
// horizontal, the probability that the kicker shoots left; the scoring rate
// if the keeper goes left and if the keeper goes right; the lower of the two
// drawn thick, its peak marked. Keeper's side: horizontal, the probability
// that the keeper goes left; the scoring rate if the kicker shoots left and
// right; the higher drawn thick, its lowest point marked. Four sliders for
// the scoring rates. Sliders and buttons only, so it never captures a swipe.

const T = {
  en: {
    kicker: "Kicker's side",
    keeper: "Keeper's side",
    rates: { LL: 'Kicker L, keeper L', LR: 'Kicker L, keeper R', RL: 'Kicker R, keeper L', RR: 'Kicker R, keeper R' },
    xKicker: 'P(kicker shoots L)',
    xKeeper: 'P(keeper goes L)',
    vsL: 'keeper goes L',
    vsR: 'keeper goes R',
    shootL: 'kicker shoots L',
    shootR: 'kicker shoots R',
    worstKicker: 'the kicker’s worst case',
    worstKeeper: 'the keeper’s worst case',
    sides: 'R is the kicker’s natural side (left for a right-footed kicker), L the other. Scoring rates in per cent.',
    mixes: (x, y, v) => `The kicker shoots L ${x}% of the time, the keeper goes L ${y}%, and the kick scores ${v}% whatever either one does alone.`,
    pure: (side, v) => `With these numbers there is no crossing inside: a pure strategy is best. Always ${side} guarantees the kicker ${v}%, and the keeper can hold the kicker to it.`,
    always: (l, r) => `Always L guarantees ${l}%, always R ${r}%.`,
    reset: 'Back to the lecture’s numbers',
    aria: (who) => `Scoring rate against the probability of going left, for the ${who}; the thick line is the worst case and its marked point the best of the worst cases`,
  },
  it: {
    kicker: 'Dal lato del rigorista',
    keeper: 'Dal lato del portiere',
    rates: { LL: 'Rigorista S, portiere S', LR: 'Rigorista S, portiere D', RL: 'Rigorista D, portiere S', RR: 'Rigorista D, portiere D' },
    xKicker: 'P(il rigorista tira a S)',
    xKeeper: 'P(il portiere va a S)',
    vsL: 'il portiere va a S',
    vsR: 'il portiere va a D',
    shootL: 'il rigorista tira a S',
    shootR: 'il rigorista tira a D',
    worstKicker: 'il caso peggiore del rigorista',
    worstKeeper: 'il caso peggiore del portiere',
    sides: 'D è il lato naturale del rigorista (la sinistra per chi calcia di destro), S l’altro. Percentuali di realizzazione.',
    mixes: (x, y, v) => `Il rigorista tira a S il ${x}% delle volte, il portiere va a S il ${y}%, e il rigore va a segno il ${v}% delle volte qualunque cosa faccia uno dei due da solo.`,
    pure: (side, v) => `Con questi numeri non c'è un incrocio all'interno: è meglio una strategia pura. Sempre a ${side} garantisce al rigorista il ${v}%, e il portiere può tenerlo a quel valore.`,
    always: (l, r) => `Sempre a S garantisce il ${l}%, sempre a D il ${r}%.`,
    reset: 'Torna ai numeri della lezione',
    aria: (who) => `Percentuale di realizzazione in funzione della probabilità di andare a sinistra, per il ${who}; la linea spessa è il caso peggiore e il punto segnato il migliore dei casi peggiori`,
  },
}

const KEYS = ['LL', 'LR', 'RL', 'RR']

export default function FigureMinimax({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [r, setR] = useState(PENALTY)
  const [side, setSide] = useState('kicker')
  const m = minimax(r)
  const dec = (v, d) => {
    const s = v.toFixed(d)
    return lang === 'it' ? s.replace('.', ',') : s
  }
  const kicker = side === 'kicker'
  const f1 = kicker ? (x) => vsKeeperLeft(r, x) : (y) => shootLeft(r, y)
  const f2 = kicker ? (x) => vsKeeperRight(r, x) : (y) => shootRight(r, y)
  const at = kicker ? m.kickerLeft : m.keeperLeft
  const worst = kicker ? (x) => Math.min(f1(x), f2(x)) : (x) => Math.max(f1(x), f2(x))
  const knots = [0, at, 1].filter((v, k, a) => a.indexOf(v) === k).sort((a, b) => a - b)
  // The envelope breaks where the two lines cross, if they cross inside.
  const d0 = f1(0) - f2(0)
  const d1 = f1(1) - f2(1)
  const cross = d0 !== d1 ? d0 / (d0 - d1) : -1
  const env = [...new Set([...knots, ...(cross > 0 && cross < 1 ? [cross] : [])])].sort((a, b) => a - b).map((x) => [x, worst(x)])
  const L = kicker ? t.vsL : t.shootL
  const R = kicker ? t.vsR : t.shootR
  const pureSide = m.kickerLeft === 1 ? (lang === 'it' ? 'S' : 'L') : lang === 'it' ? 'D' : 'R'

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <Pill active={kicker} onClick={() => setSide('kicker')}>
            {t.kicker}
          </Pill>
          <Pill active={!kicker} onClick={() => setSide('keeper')}>
            {t.keeper}
          </Pill>
        </div>
        <div className="mt-2">
          <Chart
            aria={t.aria(kicker ? (lang === 'it' ? 'rigorista' : 'kicker') : lang === 'it' ? 'portiere' : 'keeper')}
            height={190}
            x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: kicker ? t.xKicker : t.xKeeper }}
            y={{ min: 50, max: 100, ticks: [50, 60, 70, 80, 90, 100] }}
            marks={[{ x: at, color: INK, dashed: true, label: dec(m.value, 1) }]}
            series={[
              { points: [[0, f1(0)], [1, f1(1)]], color: ROW_COLOR, width: 1.5 },
              { points: [[0, f2(0)], [1, f2(1)]], color: COL_COLOR, width: 1.5 },
              { points: env, color: INK, width: 4, opacity: 0.75 },
              { points: [[at, worst(at)]], color: INK, dots: true, line: false },
            ]}
          />
          <Legend
            items={[
              { label: L, color: ROW_COLOR },
              { label: R, color: COL_COLOR },
              { label: kicker ? t.worstKicker : t.worstKeeper, color: INK },
            ]}
          />
        </div>
      </div>
      <div className="min-w-0 space-y-1.5">
        <div>
          {KEYS.map((k) => (
            <Slider key={k} label={t.rates[k]} min={50} max={100} step={0.1} value={r[k]} onChange={(v) => setR((old) => ({ ...old, [k]: Math.round(v * 10) / 10 }))} format={(v) => dec(v, 2)} />
          ))}
        </div>
        <p className="text-sm text-slate-700 leading-snug" data-role="minimax-readout">
          {m.inside ? t.mixes(dec(100 * m.kickerLeft, 1), dec(100 * m.keeperLeft, 1), dec(m.value, 2)) : t.pure(pureSide, dec(m.value, 2))} {t.always(dec(m.alwaysLeft, 2), dec(m.alwaysRight, 2))}
        </p>
        <p className="text-xs text-slate-500 leading-snug">{t.sides}</p>
        {KEYS.some((k) => r[k] !== PENALTY[k]) && (
          <button type="button" className="text-xs text-orange-700 underline" onClick={() => setR(PENALTY)}>
            {t.reset}
          </button>
        )}
      </div>
    </div>
  )
}
