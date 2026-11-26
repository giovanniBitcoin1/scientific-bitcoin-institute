import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { pybBid, meanExact, sdUniformExact, runBlocks, monopolisticCurve, BLOCK_COUNTS, RULES } from './block.js'
import { num, int } from './fmt.js'

// Panel C, "A block for sale": n users want one slot each in a block of k
// slots, values uniform 0–100. Pay your bid (equilibrium bids), the uniform
// price (bids are values) and the monopolistic price (bids are values: an
// approximation). A table of the three rules; the pay-your-bid bid against
// the value; the average revenue against k from 1 to 2n (exact for the first
// two rules, which coincide; the monopolistic price simulated with 10,000
// blocks and seed 1, recomputed when n changes). "Run again" n uses seed n.

const COLORS = { pyb: ORANGE_DARK, uniform: '#0369a1', monopolistic: '#15803d' }
const CURVE_BLOCKS = 10000

const T = {
  en: {
    n: 'n, the users',
    k: 'k, the slots in the block',
    blocks: 'Blocks:',
    again: 'Run again',
    run: (s) => `Run no. ${s} (seed ${s})`,
    rules: { pyb: 'Pay your bid', uniform: 'Uniform price', monopolistic: 'Monopolistic price' },
    how: {
      pyb: 'as in Bitcoin today: the k highest bids are included and each pays her own bid; bids are the equilibrium bids',
      uniform: 'every included user pays the highest losing bid; bids are values (the truth is dominant)',
      monopolistic: 'every included user pays the lowest included bid; the miner includes the j ≤ k highest bids that maximise j times the j-th highest bid',
    },
    approx: 'In the monopolistic price, bids are taken to be values: an approximation, since shading pays less and less as users grow (Yao 2020).',
    rows: ['average revenue', 'exact', 'standard deviation', 'exact', 'users served', 'value served', 'price per included user'],
    room: 'There is room for everyone: pay your bid and the uniform price raise nothing.',
    bidChart: (n, k) => `Pay your bid: the equilibrium bid against the value (n = ${n}, k = ${k})`,
    bidLegend: ['the bid', 'bid = value'],
    value: 'value',
    bid: 'bid',
    revChart: (n) => `Average revenue against the block size k = 1 … ${2 * n}`,
    revLegend: ['pay your bid = uniform price (exact)', 'monopolistic price (simulated, 10,000 blocks, seed 1)'],
    slots: 'k',
    revenue: 'revenue',
    aria1: 'The pay-your-bid equilibrium bid against the value',
    aria2: 'The average revenue against the number of slots for the three rules',
  },
  it: {
    n: 'n, gli utenti',
    k: 'k, i posti nel blocco',
    blocks: 'Blocchi:',
    again: 'Nuova prova',
    run: (s) => `Prova n. ${s} (seme ${s})`,
    rules: { pyb: 'Paghi la tua offerta', uniform: 'Prezzo uniforme', monopolistic: 'Prezzo monopolistico' },
    how: {
      pyb: 'come in Bitcoin oggi: entrano le k offerte più alte e ognuno paga la sua offerta; le offerte sono quelle di equilibrio',
      uniform: 'ogni utente incluso paga l’offerta esclusa più alta; le offerte sono i valori (dire il vero è dominante)',
      monopolistic: 'ogni utente incluso paga l’offerta inclusa più bassa; il miner include le j ≤ k offerte più alte che massimizzano j per la j-esima offerta più alta',
    },
    approx: 'Nel prezzo monopolistico le offerte sono i valori: un’approssimazione, perché abbassare l’offerta rende sempre meno al crescere degli utenti (Yao 2020).',
    rows: ['ricavo medio', 'esatto', 'deviazione standard', 'esatta', 'utenti serviti', 'valore servito', 'prezzo per utente incluso'],
    room: 'C’è posto per tutti: con “paghi la tua offerta” e con il prezzo uniforme il ricavo è nullo.',
    bidChart: (n, k) => `Paghi la tua offerta: l’offerta di equilibrio in funzione del valore (n = ${n}, k = ${k})`,
    bidLegend: ['l’offerta', 'offerta = valore'],
    value: 'valore',
    bid: 'offerta',
    revChart: (n) => `Ricavo medio in funzione della dimensione del blocco k = 1 … ${2 * n}`,
    revLegend: ['paghi la tua offerta = prezzo uniforme (esatto)', 'prezzo monopolistico (simulato, 10.000 blocchi, seme 1)'],
    slots: 'k',
    revenue: 'ricavo',
    aria1: 'L’offerta di equilibrio di “paghi la tua offerta” in funzione del valore',
    aria2: 'Il ricavo medio in funzione del numero di posti per le tre regole',
  },
}

const niceTop = (v) => {
  if (v <= 0) return 10
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p
  return 10 * p
}

export default function BlockPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const f2 = (v) => num(v, lang, 2)
  const [n, setN] = useState(20)
  const [k, setK] = useState(10)
  const [blocks, setBlocks] = useState(10000)
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => runBlocks({ n, k, blocks, seed }), [n, k, blocks, seed])
  const curve = useMemo(() => monopolisticCurve(n, 2 * n, CURVE_BLOCKS, 1), [n])
  const bidPts = Array.from({ length: 101 }, (_, v) => [v, 100 * pybBid(n, k, v / 100)])
  const exactLine = Array.from({ length: 2 * n }, (_, i) => [i + 1, 100 * meanExact(n, i + 1)])
  const revTop = niceTop(Math.max(...curve.map((c) => c.mean), ...exactLine.map((p) => p[1])))
  const cell = (rule, row) => {
    const s = sim[rule]
    switch (row) {
      case 0: return <><span data-value="mean">{f2(s.mean)}</span><span className="block text-slate-500">± {f2(s.se)}</span></>
      case 1: return rule === 'monopolistic' ? '–' : <span data-value="meanExact">{f2(100 * meanExact(n, k))}</span>
      case 2: return <span data-value="sd">{f2(s.sd)}</span>
      case 3: return rule === 'uniform' ? <span data-value="sdExact">{f2(100 * sdUniformExact(n, k))}</span> : '–'
      case 4: return <span data-value="served">{f2(s.served)}</span>
      case 5: return <span data-value="value">{f2(s.value)}</span>
      default: return <span data-value="price">{f2(s.price)}</span>
    }
  }

  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.n} min={2} max={40} step={1} value={n} onChange={setN} />
        <Slider label={L.k} min={1} max={60} step={1} value={k} onChange={setK} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="bp-counts">
        <span>{L.blocks}</span>
        {BLOCK_COUNTS.map((c) => (
          <Pill key={c} active={blocks === c} onClick={() => setBlocks(c)} data-count={c}>{int(c, lang)}</Pill>
        ))}
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="bp-again">{L.again}</Pill>
        <span className="font-mono" data-role="bp-seed">{L.run(seed)}</span>
      </div>
      <ul className="mt-2 space-y-0.5 text-xs text-slate-600 leading-snug max-w-3xl">
        {RULES.map((r) => (
          <li key={r}>
            <span className="font-semibold" style={{ color: COLORS[r] }}>{L.rules[r]}</span>: {L.how[r]}.
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-slate-500 leading-snug max-w-3xl">{L.approx}</p>

      <table className="mt-3 w-full max-w-3xl text-[11px] sm:text-xs font-mono tabular-nums" data-role="bp-table">
        <thead>
          <tr className="text-left align-bottom">
            <th className="font-normal pr-2 pb-1" />
            {RULES.map((r) => (
              <th key={r} className="font-sans font-semibold pr-2 pb-1" style={{ color: COLORS[r] }}>{L.rules[r]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {L.rows.map((label, row) => (
            <tr key={row} data-row={row} className={row % 2 ? '' : 'bg-slate-50'}>
              <td className="pr-2 py-0.5 font-sans text-slate-600">{label}</td>
              {RULES.map((r) => (
                <td key={r} className="pr-2 py-0.5 align-top" data-rule={r}>{cell(r, row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {k >= n && <p className="mt-1 text-xs text-slate-600" data-role="bp-room">{L.room}</p>}

      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0" data-role="bp-bids">
          <p className="text-xs text-slate-500 mb-1">{L.bidChart(n, k)}</p>
          <Chart
            height={170}
            x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: L.value }}
            y={{ min: 0, max: 100, ticks: [0, 50, 100], label: L.bid, labelSide: 'left' }}
            series={[
              { points: [[0, 0], [100, 100]], color: SLATE, width: 1, dashed: true, opacity: 0.6 },
              { points: bidPts, color: COLORS.pyb, width: 2 },
            ]}
            aria={L.aria1}
          />
          <Legend items={[{ label: L.bidLegend[0], color: COLORS.pyb }, { label: L.bidLegend[1], color: SLATE, dashed: true }]} />
        </div>
        <div className="min-w-0" data-role="bp-revenue">
          <p className="text-xs text-slate-500 mb-1">{L.revChart(n)}</p>
          <Chart
            height={170}
            x={{ min: 1, max: 2 * n, ticks: [1, Math.round(n / 2), n, Math.round((3 * n) / 2), 2 * n], label: L.slots }}
            y={{ min: 0, max: revTop, ticks: [0, revTop / 2, revTop], label: L.revenue, labelSide: 'left', format: (y) => num(y, lang, 0) }}
            series={[
              { points: exactLine, color: INK, width: 1.75 },
              { points: curve.map((c) => [c.k, c.mean]), color: COLORS.monopolistic, width: 1.75 },
            ]}
            marks={[{ x: k, color: ORANGE_DARK }]}
            aria={L.aria2}
          />
          <Legend items={[{ label: L.revLegend[0], color: INK }, { label: L.revLegend[1], color: COLORS.monopolistic }]} />
        </div>
      </div>
    </div>
  )
}
