import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill } from '../../network/ui.jsx'
import { Legend } from '../../network/charts.jsx'
import { toNumber } from '../congestion-price-of-anarchy/frac.js'
import PowerBars, { BAR_COLORS } from './PowerBars.jsx'
import { powerIndices, COUNCIL_1958, COUNCIL_NAMES, COUNCIL_WEIGHTS } from './voting.js'
import { dec, fracText, num } from './fmt.js'

// Live figure F2, "Luxembourg's vote": the six members of the Council of the
// first European Communities (weights 4, 4, 4, 2, 2, 1), a quota slider from
// 9 to 17, bars of weight share against the Shapley–Shubik index (or the
// normalised Banzhaf index), each index, and a line for Luxembourg.

const TOTAL = 17

const T = {
  en: {
    quota: 'Quota (of 17 votes)',
    ss: 'Shapley–Shubik',
    bz: 'Banzhaf',
    head: ['member', 'votes', 'share', 'Shapley–Shubik', 'Banzhaf'],
    legend: ['share of the votes', 'power index'],
    lux0: (q) => `Luxembourg's power at quota ${q}: 0. Every other weight is even, and so is the quota: adding 1 never turns a losing total into a winning one.`,
    lux: (q, ss, bz) => `Luxembourg's power at quota ${q}: ${ss} (Shapley–Shubik), ${bz} (Banzhaf), with 1/17 = 0.06 of the votes.`,
    aria: 'Bars of each member’s share of the votes and power index',
  },
  it: {
    quota: 'Quota (su 17 voti)',
    ss: 'Shapley–Shubik',
    bz: 'Banzhaf',
    head: ['membro', 'voti', 'quota voti', 'Shapley–Shubik', 'Banzhaf'],
    legend: ['quota dei voti', 'indice di potere'],
    lux0: (q) => `Il potere del Lussemburgo con quota ${q}: 0. Tutti gli altri pesi sono pari, e anche la quota: aggiungere 1 non trasforma mai un totale perdente in uno vincente.`,
    lux: (q, ss, bz) => `Il potere del Lussemburgo con quota ${q}: ${ss} (Shapley–Shubik), ${bz} (Banzhaf), con 1/17 = 0,06 dei voti.`,
    aria: 'Barre della quota dei voti e dell’indice di potere di ogni membro',
  },
}

export default function FigureVotes({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [quota, setQuota] = useState(12)
  const [which, setWhich] = useState('ss')
  const r = powerIndices(COUNCIL_WEIGHTS, quota)
  const names = COUNCIL_NAMES[lang] || COUNCIL_NAMES.en
  const idx = which === 'ss' ? r.ss : r.banzhaf
  const groups = COUNCIL_1958.map((p, i) => ({ label: p.key, share: p.weight / TOTAL, index: toNumber(idx[i]) }))
  const lux = r.ss[5]

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto] items-end max-w-3xl">
        <Slider label={L.quota} min={9} max={17} step={1} value={quota} onChange={setQuota} />
        <div className="flex gap-2" data-role="votes-switch">
          <Pill active={which === 'ss'} onClick={() => setWhich('ss')} data-index="ss">{L.ss}</Pill>
          <Pill active={which === 'bz'} onClick={() => setWhich('bz')} data-index="bz">{L.bz}</Pill>
        </div>
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <PowerBars groups={groups} aria={L.aria} role="votes-bars" max={0.4} />
          <Legend items={L.legend.map((label, i) => ({ label: i === 1 ? `${label}: ${which === 'ss' ? L.ss : L.bz}` : label, color: [BAR_COLORS.share, BAR_COLORS.index][i], bar: true }))} />
        </div>
        <div className="min-w-0">
          <table className="w-full text-xs font-mono tabular-nums" data-role="votes-table">
            <thead>
              <tr className="text-slate-500 text-left">
                {L.head.map((h) => (
                  <th key={h} className="font-normal pr-2 pb-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COUNCIL_1958.map((p, i) => (
                <tr key={p.key} data-member={p.key}>
                  <td className="pr-2 py-0.5 font-sans">{names[p.key]}</td>
                  <td className="pr-2">{p.weight}</td>
                  <td className="pr-2">{num(p.weight / TOTAL, lang, 3)}</td>
                  <td className="pr-2" data-value="ss">{fracText(r.ss[i])}</td>
                  <td data-value="bz">{dec(r.banzhaf[i], lang, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-slate-800 leading-snug" data-role="votes-lux" data-zero={lux.n === 0n ? 'yes' : 'no'}>
            {lux.n === 0n ? L.lux0(quota) : L.lux(quota, fracText(lux), dec(r.banzhaf[5], lang, 4))}
          </p>
        </div>
      </div>
    </div>
  )
}
