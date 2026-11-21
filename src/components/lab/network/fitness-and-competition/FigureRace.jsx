import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, MUTED, sup } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { race, RACE_DEFAULT, RACE_T_MAX, RACE_C, RACE_M } from './figures.js'

// Live figure F1, "The race": an incumbent born at t₁ with fitness η₁ and a
// latecomer born at t₂ with η₂. Mean-field curves k(t) = m (t/t_i)^(η_i/C) on
// log axes and the time at which the latecomer overtakes, or "never".

const T = {
  en: {
    t1: 'Incumbent born at t₁',
    eta1: 'Incumbent fitness η₁',
    t2: 'Latecomer born at t₂',
    eta2: 'Latecomer fitness η₂',
    when: (t) => `The latecomer overtakes when the network has ${t} nodes.`,
    beyond: (t) => `The latecomer overtakes when the network has ${t} nodes: off the chart, and far beyond any real network.`,
    never: 'Never: with η₂ ≤ η₁ the latecomer grows no faster, and it started later.',
    note: `Curves drawn with m = ${RACE_M} and C = ${RACE_C} (fitness uniform on [0, 1]); neither changes the time of the overtaking.`,
    incumbent: 'incumbent',
    latecomer: 'latecomer',
    aria: 'Mean-field degree of the incumbent and of the latecomer against network size, on logarithmic axes',
    locale: 'en-US',
  },
  it: {
    t1: 'Il veterano nasce a t₁',
    eta1: 'Fitness del veterano η₁',
    t2: "L'ultimo arrivato nasce a t₂",
    eta2: "Fitness dell'ultimo arrivato η₂",
    when: (t) => `L'ultimo arrivato sorpassa quando la rete ha ${t} nodi.`,
    beyond: (t) => `L'ultimo arrivato sorpassa quando la rete ha ${t} nodi: fuori dal grafico, e ben oltre qualunque rete reale.`,
    never: "Mai: con η₂ ≤ η₁ l'ultimo arrivato non cresce più in fretta, ed è partito dopo.",
    note: `Curve disegnate con m = ${RACE_M} e C = ${String(RACE_C).replace('.', ',')} (fitness uniforme su [0, 1]); nessuno dei due cambia il momento del sorpasso.`,
    incumbent: 'veterano',
    latecomer: 'ultimo arrivato',
    aria: "Grado di campo medio del veterano e dell'ultimo arrivato al variare della dimensione della rete, su assi logaritmici",
    locale: 'it-IT',
  },
}

// birth times snap to two significant digits
const nice = (v) => Math.max(1, Number(v.toPrecision(2)))

const X_CAP = 30 // decades on the chart at most

// 12,345 below a million, 1.2 × 10⁷ beyond, in the page's locale.
export function bigNumber(v, locale) {
  if (v < 1e6) return Math.round(v).toLocaleString(locale)
  let e = Math.floor(Math.log10(v))
  let m = v / 10 ** e
  if (Math.round(m * 10) >= 100) {
    m /= 10
    e++
  }
  return `${m.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} × 10${sup(e)}`
}

const ticksOf = (decades) => {
  const step = Math.max(1, Math.ceil(decades / 6))
  const out = []
  for (let e = 0; e <= decades; e += step) out.push(10 ** e)
  return out
}

export default function FigureRace({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [t1, setT1] = useState(RACE_DEFAULT.t1)
  const [eta1, setEta1] = useState(RACE_DEFAULT.eta1)
  const [t2raw, setT2] = useState(RACE_DEFAULT.t2)
  const [eta2, setEta2] = useState(RACE_DEFAULT.eta2)
  const t2 = Math.max(t2raw, t1)
  const r = race({ t1, eta1, t2, eta2 })
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const big = (v) => bigNumber(v, t.locale)
  // a power of ten shown as 10ⁿ when it is one, else as sci()
  const timeText = (log10) => (Math.abs(log10 - Math.round(log10)) < 1e-9 && log10 >= 3 ? `10${sup(Math.round(log10))}` : big(10 ** log10))

  const want = r.log10T == null ? Math.log10(t2) + 3 : r.log10T + 1
  const decades = Math.min(X_CAP, Math.max(6, Math.ceil(want)))
  const xMax = 10 ** decades
  const offChart = r.log10T != null && r.log10T > decades
  const pts = (ti, eta) => {
    const out = []
    const a = Math.log10(ti)
    for (let j = 0; j <= 120; j++) {
      const x = 10 ** (a + ((decades - a) * j) / 120)
      out.push([x, r.k(x, ti, eta)])
    }
    return out
  }
  const kTop = Math.max(r.k(xMax, t1, eta1), r.k(xMax, t2, eta2), 10)
  const yDec = Math.max(1, Math.ceil(Math.log10(kTop)))

  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start">
      <div className="min-w-0 space-y-3">
        <Slider label={t.t1} min={1} max={RACE_T_MAX} log value={t1} onChange={(v) => setT1(nice(v))} format={(v) => big(Math.round(v))} />
        <Slider label={t.eta1} min={0.05} max={1} step={0.05} value={eta1} onChange={(v) => setEta1(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <Slider label={t.t2} min={1} max={RACE_T_MAX} log value={t2} onChange={(v) => setT2(nice(v))} format={(v) => big(Math.round(v))} />
        <Slider label={t.eta2} min={0.05} max={1} step={0.05} value={eta2} onChange={(v) => setEta2(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <p className="font-mono text-sm text-slate-900 leading-snug" data-readout="race" data-log10={r.log10T == null ? 'never' : r.log10T.toFixed(3)}>
          {r.log10T == null ? t.never : offChart ? t.beyond(timeText(r.log10T)) : t.when(timeText(r.log10T))}
        </p>
      </div>
      <div className="min-w-0">
        <Chart
          x={{ min: 1, max: xMax, log: true, ticks: ticksOf(decades), label: 't' }}
          y={{ min: 1, max: 10 ** yDec, log: true, ticks: ticksOf(yDec), label: 'k', labelSide: 'left' }}
          height={170}
          aria={t.aria}
          series={[
            { points: pts(t1, eta1), color: INK, width: 2 },
            { points: pts(t2, eta2), color: ORANGE_DARK, width: 2 },
          ]}
          marks={r.log10T != null && !offChart ? [{ x: 10 ** r.log10T, color: MUTED, dashed: true }] : []}
        />
        <Legend
          items={[
            { label: `${t.incumbent} (η₁ = ${num(eta1, 2)})`, color: INK },
            { label: `${t.latecomer} (η₂ = ${num(eta2, 2)})`, color: ORANGE_DARK },
          ]}
        />
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
      </div>
    </div>
  )
}
