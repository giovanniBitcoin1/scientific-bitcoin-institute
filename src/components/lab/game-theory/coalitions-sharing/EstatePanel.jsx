import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, ORANGE_DARK, SLATE, INK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { allRules, curves, RULES, TALMUD } from './bankruptcy.js'
import { dec, num } from './fmt.js'

// Panel C, "An estate that cannot pay": three creditors with claims d1, d2,
// d3 and an estate E ≤ D. A table of five divisions at the current E
// (proportional, constrained equal awards, constrained equal losses, the
// Talmud's rule, the Shapley value of the estate's game), and a chart of each
// creditor's award against E under the chosen rule, with the Talmud's three
// estates marked.

const COLORS = ['#0369a1', ORANGE_DARK, '#15803d']

const T = {
  en: {
    claim: (i) => `Claim d${i}`,
    estate: (D) => `Estate E (at most D = ${D})`,
    presets: 'The Talmud’s estates:',
    rules: { proportional: 'Proportional', cea: 'Equal awards (CEA)', cel: 'Equal losses (CEL)', talmud: 'Talmud', shapley: 'Shapley (random arrival)' },
    long: {
      proportional: 'in proportion to the claims',
      cea: 'constrained equal awards: equal amounts, no one above her claim',
      cel: 'constrained equal losses: equal losses, no one below 0',
      talmud: 'equal awards on the half-claims up to D/2; then half of each claim, and equal losses on the other halves',
      shapley: 'the Shapley value of v(S) = max(0, E − claims outside S): creditors arrive in random order and are paid in full while money remains',
    },
    head: ['rule', 'creditor 1', 'creditor 2', 'creditor 3'],
    chart: (r) => `Awards against E: ${r}`,
    award: 'award',
    creditor: (i) => `creditor ${i}`,
    marks: 'the Talmud’s estates 100, 200, 300',
    aria: (r) => `Each creditor’s award against the estate, from 0 to D, under the rule “${r}”`,
  },
  it: {
    claim: (i) => `Credito d${i}`,
    estate: (D) => `Eredità E (al massimo D = ${D})`,
    presets: 'Le eredità del Talmud:',
    rules: { proportional: 'Proporzionale', cea: 'CEA (somme uguali)', cel: 'CEL (perdite uguali)', talmud: 'Talmud', shapley: 'Shapley (arrivo casuale)' },
    long: {
      proportional: 'in proporzione ai crediti',
      cea: 'constrained equal awards: somme uguali, nessuno oltre il suo credito',
      cel: 'constrained equal losses: perdite uguali, nessuno sotto 0',
      talmud: 'somme uguali sui mezzi crediti fino a D/2; poi metà di ogni credito, e perdite uguali sulle altre metà',
      shapley: 'il valore di Shapley di v(S) = max(0, E − crediti fuori da S): i creditori arrivano in ordine casuale e vengono pagati per intero finché il denaro basta',
    },
    head: ['regola', 'creditore 1', 'creditore 2', 'creditore 3'],
    chart: (r) => `Somme ricevute in funzione di E: ${r}`,
    award: 'somma',
    creditor: (i) => `creditore ${i}`,
    marks: 'le eredità del Talmud 100, 200, 300',
    aria: (r) => `La somma di ogni creditore in funzione dell’eredità, da 0 a D, con la regola «${r}»`,
  },
}

export default function EstatePanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [d, setD] = useState(TALMUD.claims)
  const [estate, setEstate] = useState(200)
  const [rule, setRule] = useState('talmud')
  const D = d[0] + d[1] + d[2]
  const E = Math.min(estate, D)
  const all = useMemo(() => allRules(d, E), [d.join(), E])
  const lines = useMemo(() => curves(rule, d), [rule, d.join()])
  const setClaim = (i, v) => setD(d.map((x, k) => (k === i ? v : x)))
  const isTalmud = d.join() === TALMUD.claims.join()
  const yMax = Math.max(10, ...d)
  const ticksX = D > 0 ? [0, Math.round(D / 4), Math.round(D / 2), Math.round((3 * D) / 4), D] : [0]

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3 max-w-3xl">
        {[0, 1, 2].map((i) => (
          <Slider key={i} label={L.claim(i + 1)} min={0} max={500} step={10} value={d[i]} onChange={(v) => setClaim(i, v)} />
        ))}
      </div>
      <div className="mt-2 max-w-md">
        <Slider label={L.estate(D)} min={0} max={Math.max(D, 5)} step={5} value={E} onChange={setEstate} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="ec-presets">
        <span>{L.presets}</span>
        {TALMUD.estates.map((e) => (
          <Pill key={e} active={isTalmud && E === e} onClick={() => { setD(TALMUD.claims); setEstate(e) }} data-estate={e}>{e}</Pill>
        ))}
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <table className="w-full text-xs font-mono tabular-nums" data-role="ec-table">
            <thead>
              <tr className="text-slate-500 text-left">
                {L.head.map((h) => (
                  <th key={h} className="font-normal pr-2 pb-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RULES.map((k) => (
                <tr key={k} data-rule={k} className={`cursor-pointer ${rule === k ? 'bg-orange-50' : 'hover:bg-slate-50'}`} onClick={() => setRule(k)}>
                  <td className="pr-2 py-0.5 font-sans">
                    <button type="button" className={`text-left ${rule === k ? 'text-orange-700 font-semibold' : 'underline decoration-dotted'}`} onClick={(e) => { e.stopPropagation(); setRule(k) }} aria-pressed={rule === k}>{L.rules[k]}</button>
                  </td>
                  {all[k].map((x, i) => (
                    <td key={i} className="pr-2" data-value={i}>{dec(x, lang, 2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-600 leading-snug" data-role="ec-rule">{L.rules[rule]}: {L.long[rule]}.</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 mb-1">{L.chart(L.rules[rule])}</p>
          <Chart
            height={180}
            x={{ min: 0, max: Math.max(D, 1), ticks: ticksX, label: 'E', format: (v) => String(v) }}
            y={{ min: 0, max: yMax, ticks: [0, Math.round(yMax / 2), yMax], label: L.award, labelSide: 'left' }}
            series={lines.map((p, i) => ({ points: p, color: COLORS[i] }))}
            marks={[...TALMUD.estates.filter((e) => e <= D).map((e) => ({ x: e, color: SLATE, dashed: true })), { x: E, color: INK }]}
            aria={L.aria(L.rules[rule])}
          >
            {({ sx, sy }) => (
              <g>
                {all[rule].map((x, i) => (
                  <circle key={i} cx={sx(E)} cy={sy(Number(x.n) / Number(x.d))} r="3.2" fill={COLORS[i]} stroke="white" strokeWidth="1" />
                ))}
              </g>
            )}
          </Chart>
          <Legend items={[...[0, 1, 2].map((i) => ({ label: `${L.creditor(i + 1)} (${num(d[i], lang, 0)})`, color: COLORS[i] })), { label: L.marks, color: SLATE, dashed: true }]} />
        </div>
      </div>
    </div>
  )
}
