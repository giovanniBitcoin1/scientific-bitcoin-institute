import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, SLATE, MUTED, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend, powerLabel } from '../../network/charts.jsx'
import { attackDuration, bestA, BLOCKS_PER_DAY, BLOCKS_PER_YEAR } from './budish.js'
import { num, int } from '../auctions/fmt.js'
import { money, pct } from './money.js'
import { TEST } from './defaults.js'

// Live figure F1, "Flow against stock": the gross cost of the attack,
// A·t(A)·p_block, against the attacker's multiple A, with A* marked and the
// value at stake V_attack as a horizontal line (Budish's equations 2 and 3).

const T = {
  en: {
    n: 'k + e, blocks the merchant waits',
    A: 'A, the attacker’s multiple',
    V: 'V_attack, value at stake',
    p: 'p_block, paid per block',
    best: 'Best A',
    xl: 'A',
    yl: 'gross cost, $',
    legend: ['A·t(A)·p_block', 'V_attack', 'A*, the cheapest attack'],
    t: 't(A), expected duration in blocks',
    At: 'A·t(A)',
    share: 'the attacker’s share, A/(1 + A)',
    star: (a, at) => `A* = ${a}, A*·t(A*) = ${at}`,
    cost: 'gross cost of the attack',
    need: 'p_block needed for this V_attack',
    perBlock: 'per block',
    perDay: 'per day',
    perYear: 'per year',
    yes: 'Deterred: the attack costs more than it brings.',
    no: 'Not deterred: the attack costs less than it brings.',
    aria: 'Gross cost of the attack against the attacker’s multiple A',
  },
  it: {
    n: 'k + e, blocchi di attesa',
    A: 'A, il multiplo',
    V: 'V_attack, valore in gioco',
    p: 'p_block, pagato per blocco',
    best: 'A migliore',
    xl: 'A',
    yl: 'costo lordo, $',
    legend: ['A·t(A)·p_block', 'V_attack', 'A*, l’attacco più economico'],
    t: 't(A), durata attesa (blocchi)',
    At: 'A·t(A)',
    share: 'quota, A/(1 + A)',
    star: (a, at) => `A* = ${a}, A*·t(A*) = ${at}`,
    cost: 'costo lordo',
    need: 'p_block necessario',
    perBlock: 'per blocco',
    perDay: 'al giorno',
    perYear: 'all’anno',
    yes: 'Scoraggiato: costa più di quanto rende.',
    no: 'Non scoraggiato: costa meno di quanto rende.',
    aria: 'Costo lordo dell’attacco in funzione del multiplo A dell’attaccante',
  },
}

const decadeTicks = (lo, hi) => {
  const out = []
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) out.push(10 ** e)
  return out
}

export default function FigureFlow({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [n, setN] = useState(12)
  const [Aset, setA] = useState(null) // null: A* exactly
  const [V, setV] = useState(1e9)
  const [p, setP] = useState(TEST.price * (TEST.subsidy + TEST.fees))
  const best = useMemo(() => bestA(n), [n])
  const A = Aset ?? best.A
  const t = attackDuration(A, n)
  const At = A * t
  const cost = At * p
  const need = V / At
  const d = (x, k = 2) => num(x, lang, k)
  const curve = useMemo(() => {
    const out = []
    for (let i = 0; i <= 160; i++) {
      const a = 1.01 + (1.99 * i) / 160
      out.push([a, a * attackDuration(a, n)])
    }
    return out
  }, [n])
  const pts = curve.map(([a, m]) => [a, m * p])
  const lo = Math.min(V, ...pts.map((q) => q[1])) / 2
  const hi = Math.max(V, pts[0][1]) * 2
  const yt = decadeTicks(lo, hi)
  const yr = { min: yt[0], max: yt[yt.length - 1] }
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.n} min={1} max={1008} log value={n} onChange={(x) => { setN(Math.max(1, Math.min(1008, Math.round(x)))); setA(null) }} format={(x) => int(x, lang)} />
        <div className="flex items-end gap-3">
          <div className="flex-1 min-w-0">
            <Slider label={L.A} min={1.01} max={3} step={0.01} value={A} onChange={(x) => setA(Math.round(x * 100) / 100)} format={(x) => d(x)} />
          </div>
          <Pill active={Aset === null} onClick={() => setA(null)} data-role="flow-best">{L.best}</Pill>
        </div>
        <Slider label={L.V} min={1e6} max={1e11} log value={V} onChange={setV} format={(x) => money(x, lang)} />
        <Slider label={L.p} min={1e4} max={1e9} log value={p} onChange={setP} format={(x) => money(x, lang)} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0" data-role="flow-chart">
          <Chart
            height={170}
            x={{ min: 1, max: 3, ticks: [1, 1.5, 2, 2.5, 3], label: L.xl, format: (v) => d(v, 1) }}
            y={{ ...yr, log: true, ticks: yt, label: L.yl, labelSide: 'left', format: powerLabel }}
            series={[
              { points: [[1, V], [3, V]], color: SLATE, width: 1.25, dashed: true },
              { points: pts, color: ORANGE_DARK, width: 2 },
            ]}
            marks={[{ x: best.A, color: MUTED, dashed: true }]}
            aria={L.aria}
          >
            {({ sx, sy }) => <circle cx={sx(A)} cy={sy(cost)} r="4" fill="white" stroke={ORANGE_DARK} strokeWidth="2" data-role="flow-dot" />}
          </Chart>
          <Legend items={[{ label: L.legend[0], color: ORANGE_DARK }, { label: L.legend[1], color: SLATE, dashed: true }, { label: L.legend[2], color: MUTED, dashed: true }]} />
        </div>
        <dl className="grid gap-0.5 text-xs leading-snug content-start" data-role="flow-readout">
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.t}</dt><dd className="font-mono tabular-nums" data-value="t">{d(t)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.At}</dt><dd className="font-mono tabular-nums" data-value="At">{d(At)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.share}</dt><dd className="font-mono tabular-nums" data-value="share">{pct(A / (1 + A), lang, 1)}</dd></div>
          <p className="text-xs text-slate-500" data-value="star">{L.star(d(best.A), d(best.At))}</p>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-1"><dt className="text-slate-600">{L.cost}</dt><dd className="font-mono tabular-nums text-right" data-value="cost">{money(cost, lang)}</dd></div>
          <p className="text-slate-600 mt-0.5">{L.need}:</p>
          <div className="flex justify-between gap-3"><dt className="text-slate-600 pl-3">{L.perBlock}</dt><dd className="font-mono tabular-nums text-right" data-value="need">{money(need, lang)} ({pct(1 / At, lang)})</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600 pl-3">{L.perDay}</dt><dd className="font-mono tabular-nums text-right" data-value="needDay">{money(need * BLOCKS_PER_DAY, lang)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600 pl-3">{L.perYear}</dt><dd className="font-mono tabular-nums text-right" data-value="needYear">{money(need * BLOCKS_PER_YEAR, lang)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600 pl-3">×&nbsp;p_block</dt><dd className="font-mono tabular-nums text-right" data-value="needMult">{d(need / p, 1)}</dd></div>
          <p className={`mt-1 text-xs font-semibold ${cost > V ? 'text-slate-900' : 'text-orange-700'}`} data-value="verdict">{cost > V ? L.yes : L.no}</p>
        </dl>
      </div>
    </div>
  )
}
