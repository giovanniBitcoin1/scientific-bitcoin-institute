import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Eyebrow, fmt, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { A, stackelberg, leaderProfit, monopolyThreshold, DEFAULT_C, DEFAULT_F } from './stackelberg.js'

// Panel B: Cournot's market of module 02 (a = 10, costs c1 and c2) with
// firm 1 choosing its quantity first. The two orders side by side; the
// leader's profit against its quantity, the follower best-responding; a
// fixed cost F that the follower pays only if it produces, and the leader's
// choice between sharing the market and keeping the follower out.

const T = {
  en: {
    c1: 'c1, firm 1’s cost per unit',
    c2: 'c2, firm 2’s cost per unit',
    F: 'F, firm 2’s fixed cost if it produces',
    head: ['', 'At the same time (module 02)', 'Firm 1 first'],
    rows: ['Quantity of firm 1', 'Quantity of firm 2', 'Price', 'Profit of firm 1', 'Profit of firm 2'],
    simNote: 'The column "at the same time" has no fixed cost: it is the market of module 02.',
    chartX: 'q1, the leader’s quantity →',
    chartY: 'leader’s profit',
    legendCurve: 'leader’s profit, the follower answering',
    cournot: 'Cournot',
    best: 'leader’s best',
    share: (q, p) => `The leader produces ${q} and lets the follower in: profit ${p}.`,
    limit: (L, p, s) => `The leader produces the limit quantity ${L}, the smallest that keeps the follower out: profit ${p}, more than the ${s} of sharing.`,
    limitOnly: (L, p) => `The leader produces the limit quantity ${L}, the smallest that keeps the follower out: profit ${p}.`,
    monopoly: (q, p, th) => `With F at or above ${th} the follower would stay out even against the monopoly quantity: the leader produces ${q} and earns the monopoly profit ${p}.`,
    shareBetter: (L, p) => `Keeping the follower out would take ${L} and leave the leader ${p}: not worth it.`,
    br: (q, b) => `Is the leader's ${q} a best response to the follower's quantity? No: that would be ${b}. It pays only because it cannot be taken back.`,
    aria: 'The leader’s profit against its quantity, with the Cournot quantity and the leader’s best quantity marked',
  },
  it: {
    c1: 'c1, costo unitario dell’impresa 1',
    c2: 'c2, costo unitario dell’impresa 2',
    F: 'F, costo fisso dell’impresa 2 se produce',
    head: ['', 'Insieme (modulo 02)', 'Prima l’impresa 1'],
    rows: ['Quantità dell’impresa 1', 'Quantità dell’impresa 2', 'Prezzo', 'Profitto dell’impresa 1', 'Profitto dell’impresa 2'],
    simNote: 'La colonna "insieme" non ha costo fisso: è il mercato del modulo 02.',
    chartX: 'q1, quantità di chi guida →',
    chartY: 'profitto di chi guida',
    legendCurve: 'profitto di chi guida, con la risposta di chi segue',
    cournot: 'Cournot',
    best: 'il meglio per chi guida',
    share: (q, p) => `Chi guida produce ${q} e lascia entrare chi segue: profitto ${p}.`,
    limit: (L, p, s) => `Chi guida produce la quantità limite ${L}, la più piccola che tiene fuori chi segue: profitto ${p}, più del ${s} della divisione.`,
    limitOnly: (L, p) => `Chi guida produce la quantità limite ${L}, la più piccola che tiene fuori chi segue: profitto ${p}.`,
    monopoly: (q, p, th) => `Con F pari o superiore a ${th} chi segue resterebbe fuori anche contro la quantità di monopolio: chi guida produce ${q} e guadagna il profitto di monopolio ${p}.`,
    shareBetter: (L, p) => `Tenere fuori chi segue richiederebbe ${L} e lascerebbe a chi guida ${p}: non conviene.`,
    br: (q, b) => `Il ${q} di chi guida è una risposta migliore alla quantità di chi segue? No: lo sarebbe ${b}. Conviene solo perché non si può ritirare.`,
    aria: 'Il profitto di chi guida in funzione della sua quantità, con segnate la quantità di Cournot e la quantità migliore per chi guida',
  },
}

export default function LeaderPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [c1, setC1] = useState(DEFAULT_C)
  const [c2, setC2] = useState(DEFAULT_C)
  const [F, setF] = useState(DEFAULT_F)
  const loc = (v, d = 3) => {
    const s = fmt(v, d).replace(/\.?0+$/, '') || '0'
    return lang === 'it' ? s.replace('.', ',') : s
  }
  const s = useMemo(() => stackelberg(A, c1, c2, F), [c1, c2, F])
  const xmax = A - c1
  const curve = useMemo(() => {
    const pts = []
    for (let q = 0; q <= xmax + 1e-9; q += xmax / 400) pts.push([q, leaderProfit(q, A, c1, c2, F)])
    if (F > 0 && s.L > 0 && s.L < xmax) pts.push([s.L, leaderProfit(s.L, A, c1, c2, F)])
    return pts.sort((x, y) => x[0] - y[0])
  }, [c1, c2, F, xmax, s.L])
  const ymax = Math.max(1, ...curve.map((p) => p[1])) * 1.15
  const yStep = ymax > 20 ? 10 : 5
  const yTicks = Array.from({ length: Math.floor(ymax / yStep) + 1 }, (_, k) => k * yStep)
  const b = s.best
  const cn = s.cournot
  const th = monopolyThreshold(A, c1, c2)
  const brToFollower = Math.max(0, (A - c1 - b.q2) / 2)
  const line =
    b.kind === 'share'
      ? t.share(loc(b.q1), loc(b.profit1))
      : b.kind === 'monopoly'
        ? t.monopoly(loc(b.q1), loc(b.profit1), loc(th, 4))
        : s.share
          ? t.limit(loc(b.q1), loc(b.profit1), loc(s.share.profit1))
          : t.limitOnly(loc(b.q1), loc(b.profit1))
  const cell = 'border-b border-slate-100 px-2 py-1.5'

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={t.c1} min={0} max={4} step={0.1} value={c1} onChange={setC1} format={(v) => loc(v, 1)} />
        <Slider label={t.c2} min={0} max={4} step={0.1} value={c2} onChange={setC2} format={(v) => loc(v, 1)} />
        <Slider label={t.F} min={0} max={6} step={0.05} value={F} onChange={setF} format={(v) => (lang === 'it' ? v.toFixed(2).replace('.', ',') : v.toFixed(2))} />
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white" data-role="leader-table">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {t.head.map((h, k) => (
                    <th key={k} className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left align-bottom font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {[
                  [cn.q1, b.q1],
                  [cn.q2, b.q2],
                  [cn.price, b.price],
                  [cn.profit1, b.profit1],
                  [cn.profit2, b.profit2],
                ].map(([x, y], k) => (
                  <tr key={k}>
                    <td className={cell}>{t.rows[k]}</td>
                    <td className={`${cell} font-mono tabular-nums text-slate-900`}>{loc(x, 4)}</td>
                    <td className={`${cell} font-mono tabular-nums text-slate-900`}>{loc(y, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.simNote}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700 leading-snug" data-role="leader-story">
            <p>{line}</p>
            {b.kind === 'share' && F > 0 && <p>{t.shareBetter(loc(s.deter.q1), loc(s.deter.profit1))}</p>}
            {b.kind === 'share' && <p>{t.br(loc(b.q1), loc(brToFollower))}</p>}
          </div>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.chartY}</Eyebrow>
          <Chart
            x={{ min: 0, max: xmax, ticks: Array.from({ length: Math.floor(xmax) + 1 }, (_, k) => k), label: t.chartX }}
            y={{ min: 0, max: ymax, ticks: yTicks }}
            series={[{ points: curve, color: INK, width: 2 }]}
            marks={[
              { x: cn.q1, color: SLATE, label: t.cournot, dashed: true },
              { x: b.q1, color: ORANGE_DARK, label: t.best, row: 1 },
            ]}
            height={190}
            aria={t.aria}
          />
          <Legend items={[{ label: t.legendCurve, color: INK }]} />
        </div>
      </div>
    </div>
  )
}
