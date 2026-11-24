import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { removalCurves, percolationCurve, cascadeShares, thresholds, curveAt, FRACTIONS, RANDOM_ORDERS, PERC_RUNS, PHI_DEFAULT, GLOBAL, TOP_SEEDS } from './capstone.js'
import NetworkPicker from './NetworkPicker.jsx'
import useBetweenness from './useBetweenness.js'
import { useActive } from './store.js'

// Panel B, "Stress tests", on the largest component of the chosen network:
// removal of nodes (module 11), a germ (module 12), a fashion (module 13).

const SHARES = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5]
const SKY = '#0284c7'

const T = {
  en: {
    locale: 'en-US',
    noNet: 'Read a network in the workbench first.',
    removal: 'Removal: the largest component against the share of nodes removed',
    orders: { random: `at random (mean of ${RANDOM_ORDERS} orders)`, degree: 'by degree, fixed order', recomputed: 'by degree, recomputed', betweenness: 'by betweenness, fixed order' },
    short: { random: 'Random', degree: 'Degree', recomputed: 'Degree, recomputed', betweenness: 'Betweenness' },
    removed: 'Removed',
    addBc: 'Add removal by betweenness',
    running: 'Computing…',
    x: 'share removed',
    germ: 'A germ: each link passes it with probability T',
    tc: 'T_c from the moments',
    fc: 'f_c for random failures',
    moments: '⟨k⟩ and ⟨k²⟩',
    r0: 'R0 at T = 0.1',
    percNote: `Largest cluster when each link is kept with probability T, mean of ${PERC_RUNS} runs per point.`,
    cluster: 'largest cluster',
    fashion: 'A fashion: a node adopts once a share φ of its neighbours has',
    phi: 'Threshold, φ',
    all: (s) => (s ? `Seeds that go global (${s} sampled)` : 'Seeds that go global (every node)'),
    top: (n) => `Of the ${n} with most links`,
    largest: 'Largest cascade',
    fashionNote: `One seed at a time; a cascade is global above ${Math.round(GLOBAL * 100)}% of the nodes.`,
    ofN: (a, b) => `${a} of ${b}`,
    aria: { removal: 'Share of the nodes in the largest component against the share removed, for four orders of removal', perc: 'Largest cluster against the transmissibility T, with the threshold from the moments' },
  },
  it: {
    locale: 'it-IT',
    noNet: 'Prima leggi una rete nel banco di lavoro.',
    removal: 'Rimozione: la componente più grande al variare della quota di nodi rimossi',
    orders: { random: `a caso (media di ${RANDOM_ORDERS} ordini)`, degree: 'per grado, ordine fisso', recomputed: 'per grado, ricalcolato', betweenness: 'per betweenness, ordine fisso' },
    short: { random: 'A caso', degree: 'Grado', recomputed: 'Grado, ricalcolato', betweenness: 'Betweenness' },
    removed: 'Rimossi',
    addBc: 'Aggiungi la rimozione per betweenness',
    running: 'Calcolo in corso…',
    x: 'quota rimossa',
    germ: 'Un germe: ogni collegamento lo trasmette con probabilità T',
    tc: 'T_c dai momenti',
    fc: 'f_c per i guasti casuali',
    moments: '⟨k⟩ e ⟨k²⟩',
    r0: 'R0 con T = 0,1',
    percNote: `Ammasso più grande quando ogni collegamento è tenuto con probabilità T, media di ${PERC_RUNS} prove per punto.`,
    cluster: 'ammasso più grande',
    fashion: 'Una moda: un nodo adotta quando una quota φ dei suoi vicini ha adottato',
    phi: 'Soglia, φ',
    all: (s) => (s ? `Semi che diventano globali (${s} campionati)` : 'Semi che diventano globali (ogni nodo)'),
    top: (n) => `Dei ${n} con più collegamenti`,
    largest: 'Cascata più grande',
    fashionNote: `Un seme alla volta; una cascata è globale sopra il ${Math.round(GLOBAL * 100)}% dei nodi.`,
    ofN: (a, b) => `${a} su ${b}`,
    aria: { removal: 'Quota dei nodi nella componente più grande al variare della quota rimossa, per quattro ordini di rimozione', perc: 'Ammasso più grande al variare della trasmissibilità T, con la soglia data dai momenti' },
  },
}

const COLORS = { random: SLATE, degree: ORANGE_DARK, recomputed: INK, betweenness: SKY }

export default function StressPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const entry = useActive()
  const g = entry.giant
  const [phi, setPhi] = useState(PHI_DEFAULT)
  const bc = useBetweenness(entry)
  const num = (v, d = 2) => (v != null && Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const removal = useMemo(() => {
    if (!g) return null
    if (entry.pre) return entry.pre.removal
    return removalCurves(g, { betweenness: bc.values })
  }, [g, entry, bc.values])
  const perc = useMemo(() => (g ? (entry.pre ? entry.pre.percolation : percolationCurve(g)) : null), [g, entry])
  const th = useMemo(() => (g ? thresholds(g) : null), [g])
  const fashion = useMemo(() => (g ? cascadeShares(g, phi, { seeds: entry.sources }) : null), [g, phi, entry])

  if (!g)
    return (
      <div>
        <NetworkPicker lang={lang} active={entry} />
        <p className="mt-3 text-sm text-slate-600">{t.noNet}</p>
      </div>
    )

  const ids = ['random', 'degree', 'recomputed', 'betweenness'].filter((id) => removal[id])
  const tMin = perc[0][0]

  return (
    <div>
      <NetworkPicker lang={lang} active={entry} />
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start" data-readout="stress" data-net={entry.id} data-nodes={g.n} data-tc={num(th.Tc, 4)} data-fc={num(th.fc, 3)} data-removal={ids.map((id) => `${id}:${SHARES.map((f) => num(curveAt(removal[id], f), 2)).join(',')}`).join(' ')} data-perc={perc.map((p) => `${p[0]}:${num(p[1], 2)}`).join(' ')} data-phi={phi} data-cascade-all={num(fashion.all, 3)} data-cascade-top={fashion.top} data-cascade-largest={num(fashion.largest, 2)}>
        <div className="min-w-0">
          <Eyebrow>{t.removal}</Eyebrow>
          <Chart x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: t.x, format: (v) => num(v, 2) }} y={{ min: 0, max: 1, ticks: [0, 0.5, 1], format: (v) => num(v, 1) }} height={190} aria={t.aria.removal} series={ids.map((id) => ({ points: FRACTIONS.map((f, i) => [f, removal[id][i]]), color: COLORS[id], width: id === 'random' ? 1.5 : 1.8, dashed: id === 'recomputed' }))} />
          <Legend items={ids.map((id) => ({ label: t.orders[id], color: COLORS[id], dashed: id === 'recomputed' }))} />
          {!removal.betweenness && (
            <div className="mt-2">
              <Pill onClick={bc.request} disabled={bc.running} data-action="betweenness">
                {t.addBc}
              </Pill>
              {bc.running && <span className="ml-2 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(bc.progress * 100)}%`}</span>}
            </div>
          )}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="font-normal pr-3 pb-1">{t.removed}</th>
                  {SHARES.map((f) => (
                    <th key={f} className="font-normal pr-2 pb-1">{`${Math.round(f * 100)}%`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ids.map((id) => (
                  <tr key={id} className="border-t border-slate-100 text-slate-800">
                    <td className="pr-3 py-1 whitespace-nowrap" style={{ color: COLORS[id] }}>{t.short[id]}</td>
                    {SHARES.map((f) => (
                      <td key={f} className="pr-2 py-1">{num(curveAt(removal[id], f), 2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.germ}</Eyebrow>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat label={t.tc}>
              <span style={{ color: ORANGE_DARK }}>{num(th.Tc, 4)}</span>
            </Stat>
            <Stat label={t.fc}>{num(th.fc, 3)}</Stat>
            <Stat label={t.moments}>{`${num(th.mean, 3)} · ${num(th.mean2, 2)}`}</Stat>
            <Stat label={t.r0}>{num(th.r0(0.1), 2)}</Stat>
          </div>
          <div className="mt-3">
            <Chart x={{ min: tMin, max: 1, log: true, ticks: [0.01, 0.1, 1], label: 'T', format: (v) => num(v, v < 0.1 ? 2 : v < 1 ? 1 : 0) }} y={{ min: 0, max: 1, ticks: [0, 0.5, 1], label: t.cluster, labelSide: 'left', format: (v) => num(v, 1) }} height={170} aria={t.aria.perc} marks={th.Tc >= tMin && th.Tc <= 1 ? [{ x: th.Tc, color: MUTED, dashed: true, label: 'T_c' }] : []} series={[{ points: perc, color: ORANGE_DARK, width: 1.8, dots: 1.8 }]} />
          </div>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.percNote}</p>

          <div className="mt-5">
            <Eyebrow>{t.fashion}</Eyebrow>
            <div className="mt-2 max-w-xs">
              <Slider label={t.phi} min={0.05} max={0.5} step={0.01} value={phi} onChange={(v) => setPhi(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Stat label={t.all(entry.sources ? entry.sources.length : 0)}>
                <span style={{ color: ORANGE_DARK }}>{num(fashion.all, 3)}</span>
              </Stat>
              <Stat label={t.top(Math.min(TOP_SEEDS, g.n))}>{t.ofN(fashion.top, fashion.of)}</Stat>
              <Stat label={t.largest}>{num(fashion.largest, 2)}</Stat>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-snug">{t.fashionNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
