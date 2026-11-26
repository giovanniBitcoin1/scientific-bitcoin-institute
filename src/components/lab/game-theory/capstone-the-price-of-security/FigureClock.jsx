import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { SLATE, ORANGE_DARK, MUTED } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { stepPoints, subsidyAfterHalvingIn, feesNeeded, subsidyBTC, yearToHeight, TODAY_FEES, TARGET } from './schedule.js'
import { num } from '../auctions/fmt.js'

// Live figure F2, "The halving clock": the subsidy per block from 2009 to
// 2140 on a log scale, today's fees, and, with a yearly growth of fees, the
// budget per block (subsidy plus fees). Readouts for the halving years 2028,
// 2032, 2036 and 2040: the subsidy and the fees needed to keep 3.145 BTC.

export const NOW = 2026 + 330 / 365 // 26 November 2026
const YEARS = [2028, 2032, 2036, 2040]

const T = {
  en: {
    g: 'growth of fees, % a year',
    xl: 'year',
    yl: 'BTC per block',
    legend: ['subsidy', 'fees today (0.02 BTC)', 'subsidy + growing fees', '3.145 BTC'],
    head: ['after the halving of', 'subsidy', 'fees needed', '× today', 'budget with this growth'],
    note: 'Ten minutes a block from the halving of April 2024; the earlier halvings at their real dates.',
    aria: 'The block subsidy from 2009 to 2140, on a log scale',
  },
  it: {
    g: 'crescita delle commissioni, % all’anno',
    xl: 'anno',
    yl: 'BTC per blocco',
    legend: ['sussidio', 'commissioni oggi (0,02 BTC)', 'sussidio + commissioni in crescita', '3,145 BTC'],
    head: ['dopo l’halving del', 'sussidio', 'commissioni necessarie', '× oggi', 'bilancio con questa crescita'],
    note: 'Dieci minuti a blocco dall’halving dell’aprile 2024; gli halving precedenti alle loro date reali.',
    aria: 'Il sussidio del blocco dal 2009 al 2140, in scala logaritmica',
  },
}

const TICKS = [1e-8, 1e-6, 1e-4, 1e-2, 1, 100]
const power = (v) => ({ 1e-8: '10⁻⁸', 1e-6: '10⁻⁶', 1e-4: '10⁻⁴', 1e-2: '10⁻²', 1: '1', 100: '100' })[v] ?? String(v)

export default function FigureClock({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [g, setG] = useState(0)
  const d = (x, k = 2) => num(x, lang, k)
  const steps = useMemo(() => stepPoints(2141), [])
  const fees = (y) => TODAY_FEES * (1 + g / 100) ** (y - NOW)
  const budget = useMemo(() => {
    const out = []
    for (let y = NOW; y <= 2141; y += 0.25) out.push([y, subsidyBTC(yearToHeight(y)) + fees(y)])
    return out
  }, [g])
  const rows = YEARS.map((y) => {
    const s = subsidyAfterHalvingIn(y)
    const need = feesNeeded(s.subsidy)
    return { y, s, need, then: s.subsidy + fees(s.date) }
  })
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.g} min={0} max={20} step={0.5} value={g} onChange={setG} format={(x) => `${d(x, 1)}%`} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0" data-role="clock-chart">
          <Chart
            height={170}
            x={{ min: 2009, max: 2141, ticks: [2009, 2040, 2070, 2100, 2140], label: L.xl }}
            y={{ min: 1e-8, max: 100, log: true, ticks: TICKS, label: L.yl, labelSide: 'left', format: power }}
            series={[
              { points: [[2009, TARGET], [2141, TARGET]], color: MUTED, width: 1, dashed: true },
              { points: [[NOW, TODAY_FEES], [2141, TODAY_FEES]], color: SLATE, width: 1.25, dashed: true },
              { points: steps, color: SLATE, width: 1.75 },
              ...(g > 0 ? [{ points: budget, color: ORANGE_DARK, width: 2 }] : []),
            ]}
            marks={[{ x: NOW, color: ORANGE_DARK, dashed: true }]}
            aria={L.aria}
          />
          <Legend items={[{ label: L.legend[0], color: SLATE }, { label: L.legend[1], color: SLATE, dashed: true }, ...(g > 0 ? [{ label: L.legend[2], color: ORANGE_DARK }] : []), { label: L.legend[3], color: MUTED, dashed: true }]} />
          <p className="mt-1 text-xs text-slate-500">{L.note}</p>
        </div>
        <table className="w-full text-xs tabular-nums" data-role="clock-table">
          <thead>
            <tr className="text-slate-500 text-left">
              {L.head.map((h, i) => <th key={i} className={`font-normal pb-1 ${i ? 'text-right' : ''}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr key={r.y} className="border-t border-slate-100" data-year={r.y}>
                <td className="py-1">{r.y}</td>
                <td className="py-1 text-right" data-value="subsidy">{num(r.s.subsidy, lang, 4)}</td>
                <td className="py-1 text-right" data-value="fees">{num(r.need.fees, lang, 4)}</td>
                <td className="py-1 text-right" data-value="mult">{num(r.need.multiple, lang, 1)}</td>
                <td className="py-1 text-right" data-value="budget">{num(r.then, lang, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
