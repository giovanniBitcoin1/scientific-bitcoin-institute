import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, Pill, Eyebrow, Stat, fmt } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { PRIZE, MINERS, ROUNDS, equalCosts, oneCheaper, equilibrium, adjust, percent } from './contest.js'

// Panel C: a contest for a prize. Each player spends effort at a cost per
// unit and wins with a chance equal to their share of the total effort. The
// equilibrium is shown in closed form; two buttons let the players adjust,
// one at a time or all at once, starting 10% above it.

const PRESET_IDS = ['equal', 'cheaper', 'miners']

const T = {
  en: {
    presets: { equal: 'Equal costs', cheaper: 'One 10% cheaper', miners: 'Miners' },
    n: 'Players n',
    v: 'Prize V',
    eq: 'The equilibrium',
    cols: ['Players', 'Cost per unit', 'Effort, each', 'Share, each', 'Profit, each'],
    out: 'stays out',
    staying: 'Players who stay in',
    of: (m, n) => `${m} of ${n}`,
    total: 'Total effort',
    spent: 'Spent of the prize',
    spentValue: (amount, share) => `${amount} (${share})`,
    turn: 'One at a time',
    once: 'All at once',
    chart: { turn: 'One at a time: total effort, round after round', once: 'All at once: total effort, round after round' },
    round: 'round',
    legendTotal: 'total effort',
    legendEq: 'equilibrium',
    after: (r, total, eq) => `After ${r} rounds the total effort is ${total}; the equilibrium is ${eq}.`,
    start: 'Every player starts 10% above the equilibrium effort.',
    pick: 'Press one of the two buttons to let the players adjust.',
    aria: 'Total effort after each round of the adjustment, with the equilibrium as a dashed line',
  },
  it: {
    presets: { equal: 'Costi uguali', cheaper: 'Uno costa il 10% in meno', miners: 'Miner' },
    n: 'Giocatori n',
    v: 'Premio V',
    eq: "L'equilibrio",
    cols: ['Giocatori', 'Costo unitario', 'Sforzo, ciascuno', 'Quota, ciascuno', 'Profitto, ciascuno'],
    out: 'resta fuori',
    staying: 'Giocatori che restano in gara',
    of: (m, n) => `${m} su ${n}`,
    total: 'Sforzo totale',
    spent: 'Speso, rispetto al premio',
    spentValue: (amount, share) => `${amount} (${share})`,
    turn: 'Uno alla volta',
    once: 'Tutti insieme',
    chart: { turn: 'Uno alla volta: sforzo totale, turno dopo turno', once: 'Tutti insieme: sforzo totale, turno dopo turno' },
    round: 'turno',
    legendTotal: 'sforzo totale',
    legendEq: 'equilibrio',
    after: (r, total, eq) => `Dopo ${r} turni lo sforzo totale è ${total}; l'equilibrio è ${eq}.`,
    start: "Ogni giocatore parte il 10% sopra lo sforzo di equilibrio.",
    pick: 'Premi uno dei due pulsanti per far correggere gli sforzi ai giocatori.',
    aria: "Sforzo totale dopo ogni turno dell'aggiustamento, con l'equilibrio come linea tratteggiata",
  },
}

export default function ContestPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [preset, setPreset] = useState('equal')
  const [n, setN] = useState(5)
  const [V, setV] = useState(PRIZE)
  const [mode, setMode] = useState(null)

  const costs = useMemo(() => (preset === 'miners' ? MINERS : preset === 'cheaper' ? oneCheaper(n) : equalCosts(n)), [preset, n])
  const eq = useMemo(() => equilibrium(costs, V), [costs, V])
  const path = useMemo(() => (mode ? adjust(costs, mode, ROUNDS, V) : null), [costs, mode, V])

  // Players with the same cost are shown on one line.
  const groups = []
  costs.forEach((c, i) => {
    const g = groups.find((x) => x.cost === c)
    if (g) g.count++
    else groups.push({ cost: c, count: 1, effort: eq.efforts[i], share: eq.shares[i], profit: eq.profits[i] })
  })

  const dec = lang === 'it' ? (s) => s.replace('.', ',') : (s) => s
  const pct = (x) => dec(percent(x))
  const yTop = path ? Math.max(eq.total * 1.25, ...path.totals) * 1.05 : eq.total * 1.3
  const tick = yTop > 160 ? 50 : yTop > 80 ? 25 : yTop > 40 ? 10 : 5
  const yTicks = Array.from({ length: Math.floor(yTop / tick) + 1 }, (_, i) => i * tick)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <Pill key={id} active={preset === id} onClick={() => setPreset(id)}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        {preset !== 'miners' && <Slider label={t.n} min={2} max={20} step={1} value={n} onChange={setN} />}
        <Slider label={t.v} min={50} max={200} step={50} value={V} onChange={setV} />
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-2 items-start">
        <div className="min-w-0" data-role="contest-eq">
          <Eyebrow>{t.eq}</Eyebrow>
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  {t.cols.map((h) => (
                    <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 py-2 text-left align-bottom font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-900">
                {groups.map((g) => (
                  <tr key={g.cost} className={g.share === 0 ? 'text-slate-400' : ''}>
                    <td className="border-b border-slate-100 px-2 py-1.5">{g.count}</td>
                    <td className="border-b border-slate-100 px-2 py-1.5">{dec(g.cost.toFixed(1))}</td>
                    {g.share === 0 ? (
                      <td colSpan={3} className="border-b border-slate-100 px-2 py-1.5 font-sans">
                        {t.out}
                      </td>
                    ) : (
                      <>
                        <td className="border-b border-slate-100 px-2 py-1.5">{dec(fmt(g.effort, 2))}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5">{pct(g.share)}</td>
                        <td className="border-b border-slate-100 px-2 py-1.5">{dec(fmt(g.profit, 2))}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Stat label={t.staying}>
              <span className="font-sans">{t.of(eq.m, costs.length)}</span>
            </Stat>
            <Stat label={t.total}>{dec(fmt(eq.total, 2))}</Stat>
            <Stat label={t.spent}>{t.spentValue(dec(fmt(eq.spent, 2)), pct(eq.spentShare))}</Stat>
          </div>
        </div>

        <div className="min-w-0" data-role="contest-adjust">
          <div className="flex flex-wrap gap-2">
            <Pill primary={mode !== 'turn'} active={mode === 'turn'} onClick={() => setMode('turn')}>
              {t.turn}
            </Pill>
            <Pill primary={mode !== 'once'} active={mode === 'once'} onClick={() => setMode('once')}>
              {t.once}
            </Pill>
          </div>
          {path ? (
            <div className="mt-3">
              <Eyebrow>{t.chart[mode]}</Eyebrow>
              <Chart
                aria={t.aria}
                height={190}
                x={{ min: 0, max: ROUNDS, ticks: [0, 5, 10, 15, 20, 25, 30], label: t.round }}
                y={{ min: 0, max: yTop, ticks: yTicks }}
                series={[
                  { points: [[0, eq.total], [ROUNDS, eq.total]], color: INK, dashed: true, width: 1 },
                  { points: path.totals.map((v, r) => [r, v]), color: ORANGE_DARK, dots: 1.8 },
                ]}
              />
              <Legend items={[{ label: t.legendTotal, color: ORANGE_DARK }, { label: t.legendEq, color: INK, dashed: true }]} />
              <p className="mt-1 text-sm text-slate-700">{t.after(ROUNDS, dec(fmt(path.totals[ROUNDS], 2)), dec(fmt(eq.total, 2)))}</p>
              <p className="mt-1 text-xs text-slate-500">{t.start}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">{t.pick}</p>
          )}
        </div>
      </div>
    </div>
  )
}
