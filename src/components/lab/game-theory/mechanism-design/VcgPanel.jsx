import { useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import { ITEMS, normalize, preset, vcg, revenueWithout } from './vcg.js'
import { num } from '../auctions/fmt.js'

// Panel B, "Pay for the harm you do": VCG for two objects, A and B, and 2 to
// 4 bidders. Each bidder has bids and true values for A, B and AB (AB at
// least the larger single bid: the panel raises it). Presets; a button sets
// the bids to the true values; a switch makes bidders 2 and 3 one person.

const T = {
  en: {
    presets: { three: 'Two items, three bidders', lonely: 'The lonely auction', names: 'Two names', collude: 'Losers collude' },
    one: 'As one person',
    two: 'As two names',
    bidders: 'Bidders:',
    truth: 'Bids = true values',
    merge: 'bidders 2 and 3 are one person',
    bids: 'bids',
    values: 'true values',
    bidder: (i) => `Bidder ${i}`,
    gets: 'gets',
    pays: 'pays',
    payoff: 'payoff',
    nothing: '—',
    revenue: 'Seller’s revenue',
    total: 'total of the bids in the allocation',
    leave: (i) => `without bidder ${i}`,
    person: (g, val, paid, pay) => `The person behind bidders 2 and 3 gets ${g || 'nothing'}, worth ${val} to her, pays ${paid}: payoff ${pay}.`,
    tie: 'The allocation with the largest total of bids among all (n + 1)² ways to give A and B to a bidder or to nobody; a tie goes to the first in the order A to bidder 1, 2, …, then to nobody, and for each B in the same order. Each bidder pays the others’ best total without her minus their total with her; payoffs use the true values.',
    leaveTitle: 'Revenue if one bidder leaves',
  },
  it: {
    presets: { three: 'Due oggetti, tre offerenti', lonely: 'L’asta solitaria', names: 'Due nomi', collude: 'I perdenti colludono' },
    one: 'Come una persona',
    two: 'Con due nomi',
    bidders: 'Offerenti:',
    truth: 'Offerte = valori veri',
    merge: 'gli offerenti 2 e 3 sono una persona',
    bids: 'offerte',
    values: 'valori veri',
    bidder: (i) => `Offerente ${i}`,
    gets: 'ottiene',
    pays: 'paga',
    payoff: 'payoff',
    nothing: '—',
    revenue: 'Ricavo del venditore',
    total: 'totale delle offerte nell’allocazione',
    leave: (i) => `senza l’offerente ${i}`,
    person: (g, val, paid, pay) => `La persona dietro gli offerenti 2 e 3 ottiene ${g || 'niente'}, che per lei vale ${val}, paga ${paid}: payoff ${pay}.`,
    tie: 'L’allocazione con il totale delle offerte più alto tra tutti gli (n + 1)² modi di dare A e B a un offerente o a nessuno; un pareggio va alla prima nell’ordine A all’offerente 1, 2, …, poi a nessuno, e per ognuna B nello stesso ordine. Ogni offerente paga il miglior totale degli altri senza di lei meno il loro totale con lei; i payoff usano i valori veri.',
    leaveTitle: 'Ricavo se un offerente se ne va',
  },
}

const blank = () => ({ A: 0, B: 0, AB: 0 })

function Cell({ value, onChange, label }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      step={1}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Math.min(99, Math.max(0, Math.round(Number(e.target.value) || 0))))}
      className="w-8 sm:w-12 rounded border border-slate-300 px-0.5 sm:px-1 py-0.5 text-right font-mono tabular-nums text-xs"
    />
  )
}

export default function VcgPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const start = preset('three')
  const [pid, setPid] = useState('three')
  const [bids, setBids] = useState(start.bids)
  const [values, setValues] = useState(start.values)
  const [merge, setMerge] = useState(false)
  const n = bids.length
  const d = (x) => num(x, lang, 0)

  const load = (id, sub) => {
    const p = preset(id === 'names' ? (sub === 'two' ? 'namesTwo' : 'namesOne') : id)
    setPid(id === 'names' ? `names-${sub || 'one'}` : id)
    setBids(p.bids)
    setValues(p.values)
    setMerge(p.merge)
  }
  const setN = (m) => {
    const grow = (xs) => (xs.length >= m ? xs.slice(0, m) : [...xs, ...Array.from({ length: m - xs.length }, blank)])
    setBids(grow(bids))
    setValues(grow(values))
    if (m < 3) setMerge(false)
    setPid('')
  }
  const edit = (which, i, item, x) => {
    const set = which === 'bids' ? setBids : setValues
    const cur = which === 'bids' ? bids : values
    set(cur.map((t, j) => (j === i ? normalize({ ...t, [item]: x }) : t)))
    setPid('')
  }
  const res = vcg(bids, values, { merge: merge && n >= 3 ? [1, 2] : null })
  const leave = revenueWithout(bids)
  const label = (g) => (g === '' ? L.nothing : g)

  return (
    <div>
      <div className="flex flex-wrap gap-2" data-role="vp-presets">
        {Object.keys(L.presets).map((k) => (
          <Pill key={k} active={pid === k || (k === 'names' && pid.startsWith('names'))} onClick={() => load(k)} data-preset={k}>{L.presets[k]}</Pill>
        ))}
      </div>
      {pid.startsWith('names') && (
        <div className="mt-2 flex flex-wrap gap-2" data-role="vp-names">
          <Pill active={pid === 'names-one'} onClick={() => load('names', 'one')} data-names="one">{L.one}</Pill>
          <Pill active={pid === 'names-two'} onClick={() => load('names', 'two')} data-names="two">{L.two}</Pill>
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{L.bidders}</span>
        {[2, 3, 4].map((m) => (
          <Pill key={m} active={n === m} onClick={() => setN(m)} data-n={m}>{m}</Pill>
        ))}
        <Pill onClick={() => { setBids(values.map((t) => ({ ...t }))); setPid('') }} data-role="vp-truth">{L.truth}</Pill>
        {n >= 3 && (
          <label className="inline-flex items-center gap-1.5 text-slate-700">
            <input type="checkbox" checked={merge} onChange={(e) => setMerge(e.target.checked)} className="accent-orange-600" data-role="vp-merge" />
            {L.merge}
          </label>
        )}
      </div>

      <div className="mt-3 max-w-3xl overflow-hidden">
        <table className="w-full text-[11px] sm:text-xs" data-role="vp-table">
          <thead>
            <tr className="text-left text-slate-500 align-bottom">
              <th className="font-normal pr-1" />
              <th className="font-normal pr-1 text-center" colSpan={3}>{L.bids}</th>
              <th className="font-normal pr-1 text-center" colSpan={3}>{L.values}</th>
              <th className="font-normal pr-1">{L.gets}</th>
              <th className="font-normal pr-1 text-right">{L.pays}</th>
              <th className="font-normal text-right">{L.payoff}</th>
            </tr>
            <tr className="text-slate-500 font-mono">
              <th />
              {[...ITEMS, ...ITEMS].map((it, q) => (
                <th key={q} className="font-normal text-center">{it}</th>
              ))}
              <th colSpan={3} />
            </tr>
          </thead>
          <tbody>
            {bids.map((t, i) => (
              <tr key={i} data-bidder={i + 1} className={i % 2 ? '' : 'bg-slate-50'}>
                <td className="pr-1 py-0.5 text-slate-700 whitespace-nowrap">{i + 1}</td>
                {ITEMS.map((it) => (
                  <td key={`b${it}`} className="py-0.5 pr-0.5 text-center"><Cell value={t[it]} label={`${L.bidder(i + 1)} ${L.bids} ${it}`} onChange={(x) => edit('bids', i, it, x)} /></td>
                ))}
                {ITEMS.map((it) => (
                  <td key={`v${it}`} className="py-0.5 pr-0.5 text-center"><Cell value={values[i][it]} label={`${L.bidder(i + 1)} ${L.values} ${it}`} onChange={(x) => edit('values', i, it, x)} /></td>
                ))}
                <td className="pr-1 font-mono" data-value="gets">{label(res.rows[i].gets)}</td>
                <td className="pr-1 font-mono tabular-nums text-right" data-value="pays">{d(res.rows[i].payment)}</td>
                <td className="font-mono tabular-nums text-right" data-value="payoff">{merge && n >= 3 && i === 2 ? '·' : d(res.rows[i].payoff)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {res.person && (
        <p className="mt-2 text-sm text-slate-800" data-role="vp-person">{L.person(res.person.gets, d(res.person.value), d(res.person.paid), d(res.person.payoff))}</p>
      )}
      <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm max-w-3xl" data-role="vp-readout">
        <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.revenue}</dt><dd className="font-mono tabular-nums font-semibold" data-value="revenue">{d(res.revenue)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.total}</dt><dd className="font-mono tabular-nums" data-value="total">{d(res.total)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-slate-500">{L.leaveTitle}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" data-role="vp-leave">
        {leave.map((r, i) => (
          <li key={i} data-leave={i + 1}><span className="text-slate-600">{L.leave(i + 1)}:</span> <span className="font-mono tabular-nums">{d(r)}</span></li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500 leading-snug max-w-3xl">{L.tie}</p>
    </div>
  )
}
