import { useMemo, useState } from 'react'
import { ORANGE_DARK, MUTED, Pill } from '../ui.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { snapshots, SNAP_N1, SNAP_DN } from './figures.js'

// Live figure F2, "Two snapshots": a preferential-attachment network of 30
// nodes, then 10 more. The 30 old nodes are coloured by the links they gained
// from the 10 new ones; the table counts, by degree at the first snapshot,
// the nodes, the links gained and the links gained per node.

const T = {
  en: {
    sample: 'New sample',
    colK: 'Degree',
    colNodes: 'Nodes',
    colGained: 'Links gained',
    colRate: 'Per node',
    legend: 'Old nodes: the darker, the more links gained. Small grey nodes: the 10 new ones.',
    noise: 'With 10 new nodes the ratio is mostly noise: that is why Panel C counts thousands.',
    caption: (n) => `Sample ${n}`,
    aria: 'A network of 40 nodes: 30 old ones coloured by the links they gained, and 10 new ones',
    locale: 'en-US',
  },
  it: {
    sample: 'Nuovo campione',
    colK: 'Grado',
    colNodes: 'Nodi',
    colGained: 'Collegamenti ricevuti',
    colRate: 'Per nodo',
    legend: 'Nodi vecchi: più sono scuri, più collegamenti hanno ricevuto. Piccoli nodi grigi: i 10 nuovi.',
    noise: 'Con 10 nodi nuovi il rapporto è soprattutto rumore: per questo il pannello C ne conta migliaia.',
    caption: (n) => `Campione ${n}`,
    aria: 'Una rete di 40 nodi: 30 vecchi colorati secondo i collegamenti ricevuti, e 10 nuovi',
    locale: 'it-IT',
  },
}

// Degree classes at the first snapshot (m = 2, so nobody has fewer than 2).
const CLASSES = [[2, 2], [3, 3], [4, 5], [6, 9], [10, Infinity]]
const SHADES = ['#fed7aa', '#fb923c', '#ea580c', '#9a3412'] // 0, 1, 2, 3+ links gained

export default function FigureSnapshots({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [sample, setSample] = useState(0)
  const d = useMemo(() => {
    const s = snapshots(sample)
    const n = s.net.n
    const random = mulberry32(17 + sample)
    const start = Float64Array.from({ length: 2 * n }, () => random())
    const pos = fitUnit(forceLayout(n, s.net.A, s.net.B, s.net.A.length, start, 0.1, 200), n)
    const links = Array.from(s.net.A, (a, e) => ({ a, b: s.net.B[e], color: a >= SNAP_N1 ? 'rgba(234, 88, 12, 0.55)' : 'rgba(100, 116, 139, 0.35)', width: a >= SNAP_N1 ? 1.3 : 1 }))
    const nodes = Array.from({ length: n }, (_, v) => (v < SNAP_N1 ? { i: v, r: 5, fill: SHADES[Math.min(3, s.gained[v])], stroke: '#fff', lineWidth: 1 } : { i: v, r: 3, fill: MUTED }))
    const rows = CLASSES.map(([lo, hi]) => {
      const inside = s.table.rows.filter((r) => r.k >= lo && r.k <= hi)
      const nodesIn = inside.reduce((x, r) => x + r.nodes, 0)
      const gainedIn = inside.reduce((x, r) => x + r.gained, 0)
      return { label: hi === Infinity ? `${lo}+` : lo === hi ? String(lo) : `${lo}–${hi}`, nodes: nodesIn, gained: gainedIn, rate: nodesIn ? gainedIn / nodesIn : NaN }
    })
    return { ...s, pos, links, nodes, rows }
  }, [sample])
  const num = (v) => v.toLocaleString(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const th = 'pb-1 px-2 font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold text-right'
  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start">
      <div className="min-w-0">
        <NetCanvas pos={d.pos} nodes={d.nodes} links={d.links} aria={t.aria} maxHeight={230} ratio={0.75} />
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.legend}</p>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <Pill onClick={() => setSample((v) => v + 1)} data-action="sample">
            {t.sample}
          </Pill>
          <span className="font-mono text-xs text-slate-500">{t.caption(sample + 1)}</span>
        </div>
        <table className="mt-2 w-full text-sm" data-readout="snapshots" data-links={d.table.links}>
          <thead>
            <tr>
              <th scope="col" className={th.replace('text-right', 'text-left pl-0')}>
                {t.colK}
              </th>
              <th scope="col" className={th}>
                {t.colNodes}
              </th>
              <th scope="col" className={th}>
                {t.colGained}
              </th>
              <th scope="col" className={th}>
                {t.colRate}
              </th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.label} className="border-t border-slate-100" data-class={r.label}>
                <td className="py-0.5 text-left font-mono tabular-nums text-slate-700">{r.label}</td>
                <td className="py-0.5 px-2 text-right font-mono tabular-nums">{r.nodes}</td>
                <td className="py-0.5 px-2 text-right font-mono tabular-nums">{r.gained}</td>
                <td className="py-0.5 px-2 text-right font-mono tabular-nums">{r.nodes ? num(r.rate) : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.noise}</p>
      </div>
    </div>
  )
}
