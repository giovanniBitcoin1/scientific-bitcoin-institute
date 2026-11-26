import { useId } from 'react'
import { securityBudget, bestA } from './budish.js'
import { num, int } from '../auctions/fmt.js'
import { money, pct } from './money.js'

// Shared by Panel A and Panel C: the inputs of the attack calculator, its
// outputs, and the verdict line of each objection. Inputs are kept in the
// model's units except V ($ million in the field) and the two shares (% in
// the field).

export const FIELDS = [
  { k: 'price', step: 100, min: 0 },
  { k: 'subsidy', step: 0.0625, min: 0 },
  { k: 'fees', step: 0.001, min: 0 },
  { k: 'hashrate', step: 1, min: 0.001 },
  { k: 'hwPrice', step: 0.01, min: 0 },
  { k: 'eff', step: 0.1, min: 0 },
  { k: 'elec', step: 0.001, min: 0 },
  { k: 'n', step: 1, min: 1, max: 1008, int: true },
  { k: 'V', step: 1, min: 0, scale: 1e6 },
  { k: 'rentShare', step: 0.01, min: 0, max: 100, scale: 0.01 },
  { k: 'loss', step: 1, min: 0, max: 100, scale: 0.01 },
]

export const LABELS = {
  en: {
    price: 'price, $ per BTC',
    subsidy: 'subsidy, BTC per block',
    fees: 'fees, BTC per block',
    hashrate: 'network hash rate, EH/s',
    hwPrice: 'hardware, $ per TH/s',
    eff: 'efficiency, J per TH',
    elec: 'electricity, $ per kWh',
    n: 'k + e, blocks',
    V: 'V_attack, $ million',
    rentShare: 'hash rate for rent, % of the network',
    loss: 'hardware value lost in a collapse, %',
    collapse: 'Collapse: the attack destroys the hardware’s value',
  },
  it: {
    price: 'prezzo, $ per BTC',
    subsidy: 'sussidio, BTC per blocco',
    fees: 'commissioni, BTC per blocco',
    hashrate: 'hash rate della rete, EH/s',
    hwPrice: 'hardware, $ per TH/s',
    eff: 'efficienza, J per TH',
    elec: 'elettricità, $ per kWh',
    n: 'k + e, blocchi',
    V: 'V_attack, milioni di $',
    rentShare: 'hash rate a noleggio, % della rete',
    loss: 'valore dell’hardware perso in un crollo, %',
    collapse: 'Crollo: l’attacco distrugge il valore dell’hardware',
  },
}

const shown = (f, v) => {
  const x = f.scale ? v / f.scale : v
  return Number(x.toPrecision(12))
}

export function NumberField({ f, value, onChange, label, note, children }) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={f.step}
        min={f.min}
        max={f.max}
        value={shown(f, value)}
        onChange={(e) => {
          let x = Number(e.target.value)
          if (!Number.isFinite(x)) return
          if (f.min != null) x = Math.max(f.min, x)
          if (f.max != null) x = Math.min(f.max, x)
          if (f.int) x = Math.round(x)
          onChange(f.scale ? x * f.scale : x)
        }}
        className="mt-1 w-full min-w-0 rounded border border-slate-200 px-2 py-1 font-mono text-sm tabular-nums"
        data-field={f.k}
      />
      {note && <p className="mt-0.5 text-xs text-slate-500 leading-snug" data-source={f.k}>{note}</p>}
      {children}
    </div>
  )
}

const O = {
  en: {
    pBlock: 'p_block = price × (subsidy + fees)',
    A: 'A*, the cheapest multiple (her share)',
    t: 't(A*), blocks',
    flow: 'gross flow cost A*·t(A*)·p_block',
    hardware: 'her hardware, A*·H·($ per TH/s)',
    energy: 'energy of the attack over t(A*) blocks',
    stock: 'stock she loses in a collapse',
    zero: 'Zero-profit check (equation 1)',
    honestEnergy: 'honest network’s energy per block',
    left: 'left for the hardware, per block and per year',
    capital: 'as a yearly return on the network’s hardware',
    vFlow: (c, v, yes) => `Flow (Budish): the flow deters attacks up to ${c}; this one is worth ${v}: ${yes ? 'deterred' : 'not deterred'}.`,
    vRent: (r, need, ok) => ok ? `Rent: ${r} of the network is for rent, more than the ${need} she needs: she could rent the attack.` : `Rent: only ${r} of the network is for rent, against the ${need} she needs: she must own the hardware.`,
    vStock: (on, s, tot, yes) => on ? `Collapse: she also loses ${s} of hardware; flow plus stock ${tot}: ${yes ? 'deterred' : 'not deterred'}.` : 'Collapse switch off: the hardware keeps its value, as in Budish’s flow model.',
    vEnergy: (e, sh) => `Energy: the attack itself burns ${e} of electricity, ${sh} of the flow cost.`,
    vWait: (c) => `Confirmations: if everyone waited a week (k + e = 1,008), the flow would deter attacks up to ${c}.`,
    vUsers: 'Users who refuse an attacking chain: outside every model here.',
  },
  it: {
    pBlock: 'p_block = prezzo × (sussidio + commissioni)',
    A: 'A*, il multiplo più economico (la sua quota)',
    t: 't(A*), blocchi',
    flow: 'costo lordo di flusso A*·t(A*)·p_block',
    hardware: 'il suo hardware, A*·H·($ per TH/s)',
    energy: 'energia dell’attacco in t(A*) blocchi',
    stock: 'stock che perde in un crollo',
    zero: 'Verifica del profitto nullo (equazione 1)',
    honestEnergy: 'energia della rete onesta per blocco',
    left: 'resta per l’hardware, per blocco e all’anno',
    capital: 'come rendimento annuo dell’hardware della rete',
    vFlow: (c, v, yes) => `Flusso (Budish): il flusso scoraggia attacchi fino a ${c}; questo vale ${v}: ${yes ? 'scoraggiato' : 'non scoraggiato'}.`,
    vRent: (r, need, ok) => ok ? `Noleggio: è a noleggio il ${r} della rete, più del ${need} che le serve: potrebbe noleggiare l’attacco.` : `Noleggio: è a noleggio solo il ${r} della rete, contro il ${need} che le serve: l’hardware deve possederlo.`,
    vStock: (on, s, tot, yes) => on ? `Crollo: perde anche ${s} di hardware; flusso più stock ${tot}: ${yes ? 'scoraggiato' : 'non scoraggiato'}.` : 'Crollo disattivato: l’hardware conserva il suo valore, come nel modello di flusso di Budish.',
    vEnergy: (e, sh) => `Energia: l’attacco in sé consuma ${e} di elettricità, il ${sh} del costo di flusso.`,
    vWait: (c) => `Conferme: se tutti attendessero una settimana (k + e = 1.008), il flusso scoraggerebbe attacchi fino a ${c}.`,
    vUsers: 'Utenti che rifiutano una catena d’attacco: fuori da ogni modello qui.',
  },
}

export function compute(x) {
  const r = securityBudget(x)
  const week = bestA(1008).At * r.pBlock
  return { ...r, week }
}

// The outputs and the verdicts as plain strings, for the page and for the
// summary that Panel C lets the reader copy.
export function outputLines(x, r, lang) {
  const L = O[lang] || O.en
  const d = (v, k = 2) => num(v, lang, k)
  return {
    values: [
      ['pBlock', L.pBlock, money(r.pBlock, lang)],
      ['A', L.A, `${d(r.A)} (${pct(r.share, lang, 1)})`],
      ['t', L.t, d(r.t)],
      ['flow', L.flow, money(r.flowCost, lang)],
      ['hardware', L.hardware, money(r.hardware, lang)],
      ['energy', L.energy, `${d(r.attackGWh)} GWh, ${money(r.attackEnergyCost, lang)}`],
      ...(x.collapse ? [['stock', L.stock, money(r.stockLost, lang)]] : []),
    ],
    zero: [
      ['honestEnergy', L.honestEnergy, `${money(r.honestEnergy, lang)} (${pct(r.energyShare, lang, 1)} ${lang === 'it' ? 'di p_block' : 'of p_block'})`],
      ['left', L.left, `${money(r.leftPerBlock, lang)}; ${money(r.leftPerYear, lang)}`],
      ['capital', L.capital, `${pct(r.capitalCost, lang, 1)}`],
    ],
    verdicts: [
      ['flow', L.vFlow(money(r.maxDeterred, lang), money(x.V, lang), r.deterred)],
      ['rent', L.vRent(pct(x.rentShare, lang), pct(r.A, lang, 0), r.rentCovers)],
      ['stock', L.vStock(x.collapse, money(r.stockLost, lang), money(r.totalWithStock, lang), r.deterredWithStock)],
      ['energy', L.vEnergy(money(r.attackEnergyCost, lang), pct(r.attackEnergyCost / r.flowCost, lang, 1))],
      ['wait', L.vWait(money(r.week, lang))],
      ['users', L.vUsers],
    ],
    zeroTitle: L.zero,
  }
}

export function Outputs({ x, r, lang, role }) {
  const o = outputLines(x, r, lang)
  const row = ([k, label, v]) => (
    <div key={k} className="flex justify-between gap-3">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-mono tabular-nums text-right" data-value={k}>{v}</dd>
    </div>
  )
  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start" data-role={role}>
      <dl className="grid gap-1 text-sm">
        {o.values.map(row)}
        <p className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-mono">{o.zeroTitle}</p>
        {o.zero.map(row)}
      </dl>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {o.verdicts.map(([k, s]) => <li key={k} data-verdict={k} className={k === 'flow' ? 'font-semibold text-slate-900' : ''}>{s}</li>)}
      </ul>
    </div>
  )
}

export const fmtInput = (k, v, lang) => {
  if (k === 'V') return money(v, lang)
  if (k === 'rentShare' || k === 'loss') return pct(v, lang)
  if (k === 'n' || k === 'price' || k === 'hashrate') return int(v, lang)
  return num(v, lang, k === 'fees' || k === 'elec' ? 4 : 2).replace(/0+$/, '').replace(/[.,]$/, '')
}
