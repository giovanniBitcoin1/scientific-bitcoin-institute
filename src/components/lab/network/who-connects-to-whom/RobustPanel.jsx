import { useEffect, useState } from 'react'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { robustJob, B_DEFAULT, B_N, B_RUNS, B_SWAPS, WIRINGS, RANDOM_AT, ATTACK_AT, ATTACK_MAX } from './experiments.js'

// Panel B, "Mixing and robustness": one degree sequence wired three ways, and
// the largest component as nodes are removed at random or highest degree
// first (degrees of the intact network, not recomputed), mean of 20 orders.

const T = {
  en: {
    sources: { pa: 'Preferential attachment, m = 2', power: 'Power law, γ = 2.5, k_min = 2' },
    wirings: { assortative: 'assortative', neutral: 'neutral', disassortative: 'disassortative' },
    running: 'Rewiring and removing…',
    note: `${B_N.toLocaleString('en-US')} nodes, one degree sequence, ${B_SWAPS} swaps per link for each wiring: towards assortative (p = 1), at random (neutral), towards disassortative (p = 1). Each curve is the mean of ${B_RUNS} removal orders. The attack removes the highest degrees of the intact network first; degrees are not recomputed as nodes go.`,
    random: 'Random removal',
    attack: 'Attack on the hubs',
    removed: 'share removed',
    giant: 'largest component',
    wiring: 'Wiring',
    atRandom: 'random',
    atAttack: 'attack',
    aria: (what) => `Share of nodes in the largest component against the share of nodes removed, ${what}`,
    locale: 'en-US',
  },
  it: {
    sources: { pa: 'Aggancio preferenziale, m = 2', power: 'Legge di potenza, γ = 2,5, k_min = 2' },
    wirings: { assortative: 'assortativa', neutral: 'neutra', disassortative: 'disassortativa' },
    running: 'Ricablatura e rimozione in corso…',
    note: `${B_N.toLocaleString('it-IT')} nodi, una sola sequenza di gradi, ${B_SWAPS} scambi per collegamento per ogni cablaggio: verso assortativa (p = 1), a caso (neutra), verso disassortativa (p = 1). Ogni curva è la media di ${B_RUNS} ordini di rimozione. L'attacco toglie per primi i gradi più alti della rete intatta; i gradi non vengono ricalcolati man mano.`,
    random: 'Rimozione a caso',
    attack: 'Attacco agli hub',
    removed: 'quota rimossa',
    giant: 'componente più grande',
    wiring: 'Cablaggio',
    atRandom: 'a caso',
    atAttack: 'attacco',
    aria: (what) => `Quota di nodi nella componente più grande al variare della quota di nodi rimossi, ${what}`,
    locale: 'it-IT',
  },
}

const COLORS = { assortative: ORANGE_DARK, neutral: MUTED, disassortative: INK }

export default function RobustPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(B_DEFAULT.source)
  const exp = useExperiment()
  useEffect(() => {
    exp.run(robustJob({ ...B_DEFAULT, source }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])
  const d = exp.data && exp.data.source === source ? exp.data : null
  const W = d ? d.wirings : {}
  const ready = WIRINGS.filter((id) => W[id])
  const pct = (f) => `${Math.round(f * 100)}%`
  const pctFine = (f) => `${(f * 100).toLocaleString(t.locale, { maximumFractionDigits: 1 })}%`

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['pa', 'power'].map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.random}</Eyebrow>
          <Chart
            x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.removed, format: pct }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: t.giant, labelSide: 'left', format: (v) => num(v, 2) }}
            height={170}
            aria={t.aria(t.random.toLowerCase())}
            series={ready.map((id) => ({ points: W[id].random, color: COLORS[id], width: 1.8 }))}
          />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.attack}</Eyebrow>
          <Chart
            x={{ min: 0, max: ATTACK_MAX, ticks: [0, 0.05, 0.1, 0.15, 0.2], label: t.removed, format: pct }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: t.giant, labelSide: 'left', format: (v) => num(v, 2) }}
            height={170}
            aria={t.aria(t.attack.toLowerCase())}
            series={ready.map((id) => ({ points: W[id].attack, color: COLORS[id], width: 1.8 }))}
          />
        </div>
      </div>
      <Legend items={WIRINGS.map((id) => ({ label: t.wirings[id], color: COLORS[id] }))} />

      <div className="mt-4 overflow-x-auto" data-readout="robust" data-done={d && d.done ? '1' : '0'}>
        <table className="w-full text-sm font-mono tabular-nums">
          <thead>
            <tr className="text-xs text-slate-500 text-left">
              <th className="py-1 pr-2 font-normal">{t.wiring}</th>
              <th className="py-1 pr-2 font-normal">r</th>
              <th className="py-1 pr-2 font-normal">ρ</th>
              {RANDOM_AT.map((f) => (
                <th key={`r${f}`} className="py-1 pr-2 font-normal">{`${t.atRandom} ${pct(f)}`}</th>
              ))}
              {ATTACK_AT.map((f) => (
                <th key={`a${f}`} className="py-1 pr-2 font-normal">{`${t.atAttack} ${pctFine(f)}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WIRINGS.map((id) => {
              const w = W[id]
              const done = w && w.runs === B_RUNS
              return (
                <tr key={id} className="border-t border-slate-200" data-wiring={id} data-r={w ? w.r.toFixed(3) : ''} data-rho={w ? w.rho.toFixed(3) : ''} data-random={done ? w.tableRandom.map((v) => v.toFixed(3)).join(' ') : ''} data-attack={done ? w.tableAttack.map((v) => v.toFixed(3)).join(' ') : ''}>
                  <td className="py-1 pr-2">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: COLORS[id] }} />
                    {t.wirings[id]}
                  </td>
                  <td className="py-1 pr-2">{w ? num(w.r, 2) : '–'}</td>
                  <td className="py-1 pr-2">{w ? num(w.rho, 2) : '–'}</td>
                  {RANDOM_AT.map((f, i) => (
                    <td key={`r${f}`} className="py-1 pr-2">{done ? num(w.tableRandom[i], 2) : '–'}</td>
                  ))}
                  {ATTACK_AT.map((f, i) => (
                    <td key={`a${f}`} className="py-1 pr-2">{done ? num(w.tableAttack[i], 2) : '–'}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
