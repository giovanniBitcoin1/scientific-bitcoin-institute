import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { STAG, qStar, riskDominant, clampPayoffs } from './conventions.js'

// Live figure F1: the stag hunt as a question of confidence. The expected
// payoff of hunting the stag and of hunting hare against q, the probability
// that the other hunts the stag; where the two lines cross is q*. Sliders
// only, so it never captures a swipe.

const SKY = '#0369a1'

const T = {
  en: {
    a: 'Both hunt the stag: a',
    c: 'Hare, the other hunts the stag: c',
    d: 'Both hunt hare: d',
    stag: 'hunt the stag: a q',
    hare: 'hunt hare: c q + d (1 − q)',
    axis: 'q',
    need: (q) => `Hunting the stag is the best response only if the other hunts it with probability above q* = ${q}.`,
    payoff: (a, d) => `Payoff dominant: both hunt the stag (${a} each against ${d}).`,
    risk: {
      stag: 'Risk dominant: both hunt the stag too, because q* is below 1/2.',
      hare: 'Risk dominant: both hunt hare, because q* is above 1/2.',
      neither: 'Risk dominant: neither, because q* is exactly 1/2.',
    },
    alone: 'Hunting the stag alone pays b = 0.',
    aria: 'Expected payoff of hunting the stag and of hunting hare against the probability q that the other hunts the stag; the two lines cross at q*',
  },
  it: {
    a: 'Entrambi al cervo: a',
    c: "Lepre, l'altro va al cervo: c",
    d: 'Entrambi alla lepre: d',
    stag: 'cacciare il cervo: a q',
    hare: 'cacciare la lepre: c q + d (1 − q)',
    axis: 'q',
    need: (q) => `Cacciare il cervo è la miglior risposta solo se l'altro lo caccia con probabilità superiore a q* = ${q}.`,
    payoff: (a, d) => `Dominante nei payoff: entrambi al cervo (${a} ciascuno contro ${d}).`,
    risk: {
      stag: 'Rischio-dominante: ancora entrambi al cervo, perché q* è sotto 1/2.',
      hare: 'Rischio-dominante: entrambi alla lepre, perché q* è sopra 1/2.',
      neither: 'Rischio-dominante: nessuno dei due, perché q* è esattamente 1/2.',
    },
    alone: 'Cacciare il cervo da soli dà b = 0.',
    aria: "Payoff atteso di cacciare il cervo e di cacciare la lepre in funzione della probabilità q che l'altro cacci il cervo; le due rette si incrociano in q*",
  },
}

const show = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

export default function FigureStagHunt({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [p, setP] = useState(STAG)
  const q = qStar(p)
  const top = Math.max(4, Math.ceil(p.a / 2) * 2)
  const set = (key) => (v) => setP((old) => clampPayoffs(old, key, v))
  const dec = lang === 'it' ? (s) => s.replace('.', ',') : (s) => s

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start">
      <div className="min-w-0">
        <Chart
          aria={t.aria}
          height={200}
          x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: t.axis }}
          y={{ min: 0, max: top, ticks: Array.from({ length: top / 2 + 1 }, (_, i) => 2 * i) }}
          marks={[{ x: q, color: INK, dashed: true, label: `q* = ${q.toFixed(3)}` }]}
          series={[
            { points: [[0, p.b], [1, p.a]], color: ORANGE_DARK, width: 2.25 },
            { points: [[0, p.d], [1, p.c]], color: SKY, width: 2.25 },
          ]}
        />
        <Legend items={[{ label: t.stag, color: ORANGE_DARK }, { label: t.hare, color: SKY }]} />
      </div>
      <div className="min-w-0 space-y-2">
        <Slider label={t.a} min={3.5} max={8} step={0.5} value={p.a} onChange={set('a')} format={show} />
        <Slider label={t.c} min={0.5} max={7.5} step={0.5} value={p.c} onChange={set('c')} format={show} />
        <Slider label={t.d} min={0.5} max={7.5} step={0.5} value={p.d} onChange={set('d')} format={show} />
        <p className="text-sm text-slate-700 leading-snug" data-role="stag-readout">
          {t.need(dec(q.toFixed(3)))} {t.payoff(dec(show(p.a)), dec(show(p.d)))}{' '}
          <strong className="text-slate-900 font-semibold">{t.risk[riskDominant(p)]}</strong>
        </p>
        <p className="text-xs text-slate-500 leading-snug">{t.alone}</p>
      </div>
    </div>
  )
}
