import { useEffect, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { longTiesJob, clustersJob, averagePoint, C_N, C_K, C_NETS, C_PS, C_REACH, K_GROUP, K_IN, K_NETS, K_DEFAULT } from './experiments.js'

// Panel C, "Clusters and long ties": simple against complex contagion on a
// small-world ring, and a cascade trying to enter a second group.

const P0 = 0.0003 // where p = 0 sits on the logarithmic axis

const T = {
  en: {
    views: { ties: 'Long ties', clusters: 'Clusters' },
    tiesNote: `A ring of ${C_N.toLocaleString('en-US')} nodes, each linked to its ${C_K / 2} nearest neighbours on either side; each link is rewired with probability p (the small-world model). One node and all its neighbours have adopted. Simple contagion: one adopting neighbour is enough. Complex contagion: two are needed. Everyone decides at the same time, step after step. Means of ${C_NETS} networks for each p.`,
    steps: `Steps to reach ${Math.round(C_REACH * 100)}% of the nodes`,
    reached: 'Share of the nodes reached',
    simple: 'simple',
    complex: 'complex',
    table: { p: 'p', s: 'simple: steps', c: 'complex: steps', share: 'complex: share reached' },
    never: 'does not spread',
    some: (n) => ` (${n} of ${C_NETS} networks)`,
    running: 'Computing…',
    q: 'Threshold, q',
    kOut: 'Links to the other group per node, k_out',
    clustersNote: `Two groups of ${K_GROUP} nodes. Each node has on average ${K_IN} links inside its group and k_out to the other one. Everyone in the first group has adopted; a node of the second adopts once a share q of its neighbours has. ${K_NETS} networks for each value of k_out.`,
    share: 'Share of the second group that adopts',
    falls: 'Networks in which it falls',
    of: (a, b) => `${a} of ${b}`,
    outside: 'Average share of links to the first group',
    point: 'That share equals q at k_out =',
    chart: 'Share of the second group that adopts, against k_out',
    legend: { average: 'where the average outside share equals q' },
    ariaSteps: 'Steps to reach ninety per cent of the nodes against the rewiring probability, for simple and complex contagion, logarithmic axes',
    ariaShare: 'Share of the nodes reached against the rewiring probability, for simple and complex contagion',
    ariaClusters: 'Share of the second group that adopts against the number of links between the groups per node',
    locale: 'en-US',
  },
  it: {
    views: { ties: 'Legami lunghi', clusters: 'Gruppi' },
    tiesNote: `Un anello di ${C_N.toLocaleString('it-IT')} nodi, ciascuno collegato ai ${C_K / 2} vicini più prossimi da ogni lato; ogni collegamento è ricablato con probabilità p (il modello small-world). Un nodo e tutti i suoi vicini hanno adottato. Contagio semplice: basta un vicino che ha adottato. Contagio complesso: ne servono due. Tutti decidono nello stesso momento, passo dopo passo. Medie su ${C_NETS} reti per ogni p.`,
    steps: `Passi per raggiungere il ${Math.round(C_REACH * 100)}% dei nodi`,
    reached: 'Quota dei nodi raggiunta',
    simple: 'semplice',
    complex: 'complesso',
    table: { p: 'p', s: 'semplice: passi', c: 'complesso: passi', share: 'complesso: quota raggiunta' },
    never: 'non si diffonde',
    some: (n) => ` (${n} reti su ${C_NETS})`,
    running: 'Calcolo in corso…',
    q: 'Soglia, q',
    kOut: "Collegamenti verso l'altro gruppo per nodo, k_out",
    clustersNote: `Due gruppi di ${K_GROUP} nodi. Ogni nodo ha in media ${K_IN} collegamenti dentro il proprio gruppo e k_out verso l'altro. Tutti nel primo gruppo hanno adottato; un nodo del secondo adotta quando una quota q dei suoi vicini ha adottato. ${K_NETS} reti per ogni valore di k_out.`,
    share: 'Quota del secondo gruppo che adotta',
    falls: 'Reti in cui cede',
    of: (a, b) => `${a} su ${b}`,
    outside: 'Quota media di collegamenti verso il primo gruppo',
    point: 'Quella quota è pari a q con k_out =',
    chart: 'Quota del secondo gruppo che adotta, al variare di k_out',
    legend: { average: 'dove la quota esterna media è pari a q' },
    ariaSteps: 'Passi per raggiungere il novanta per cento dei nodi al variare della probabilità di ricablatura, per contagio semplice e complesso, assi logaritmici',
    ariaShare: 'Quota dei nodi raggiunta al variare della probabilità di ricablatura, per contagio semplice e complesso',
    ariaClusters: 'Quota del secondo gruppo che adotta al variare del numero di collegamenti tra i gruppi per nodo',
    locale: 'it-IT',
  },
}

function Ties({ t, num }) {
  const exp = useExperiment()
  useEffect(() => {
    exp.run(longTiesJob())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const d = exp.data
  const rows = d ? d.rows : []
  const done = d && d.done && !exp.running
  const px = (p) => (p === 0 ? P0 : p)
  const xAxis = { min: P0, max: 1, log: true, ticks: [P0, 0.001, 0.01, 0.1, 1], label: 'p', format: (v) => (v === P0 ? '0' : num(v, v < 0.01 ? 3 : v < 0.1 ? 2 : v < 1 ? 1 : 0)) }
  const steps = (id) => rows.filter((r) => r[id].reached > 0).map((r) => [px(r.p), r[id].steps])
  const fmtSteps = (x) => (x.reached ? `${num(x.steps, Number.isInteger(x.steps) ? 0 : 1)}${x.reached < C_NETS ? t.some(x.reached) : ''}` : t.never)
  return (
    <div>
      <p className="mt-3 text-xs text-slate-500 leading-snug">{t.tiesNote}</p>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
      <div className="mt-3 overflow-x-auto" data-readout="ties" data-done={done ? '1' : '0'}>
        <table className="w-full text-sm font-mono tabular-nums">
          <thead>
            <tr className="text-xs text-slate-500 text-left">
              <th className="py-1 pr-2 font-normal">{t.table.p}</th>
              <th className="py-1 pr-2 font-normal">{t.table.s}</th>
              <th className="py-1 pr-2 font-normal">{t.table.c}</th>
              <th className="py-1 pr-2 font-normal">{t.table.share}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.p} className="border-t border-slate-200" data-p={r.p} data-simple={r.simple.reached ? r.simple.steps.toFixed(1) : ''} data-complex={r.complex.reached ? r.complex.steps.toFixed(1) : ''} data-reached={r.complex.reached} data-share={r.complex.share.toFixed(3)}>
                <td className="py-1 pr-2">{num(r.p, r.p === 0 || r.p === 1 ? 0 : r.p < 0.01 ? 3 : r.p < 0.1 ? 2 : 1)}</td>
                <td className="py-1 pr-2">{fmtSteps(r.simple)}</td>
                <td className="py-1 pr-2" style={{ color: ORANGE_DARK }}>
                  {fmtSteps(r.complex)}
                </td>
                <td className="py-1 pr-2">{num(r.complex.share, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 1 && (
        <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
          <div className="min-w-0">
            <Eyebrow>{t.steps}</Eyebrow>
            <Chart x={xAxis} y={{ min: 1, max: 1000, log: true, ticks: [1, 10, 100, 1000] }} height={200} aria={t.ariaSteps} series={[{ points: steps('simple'), color: INK, width: 1.8, dots: 2 }, { points: steps('complex'), color: ORANGE_DARK, width: 1.8, dots: 2 }]} />
            <Legend items={[{ label: t.simple, color: INK }, { label: t.complex, color: ORANGE_DARK }]} />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.reached}</Eyebrow>
            <Chart
              x={xAxis}
              y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
              height={200}
              aria={t.ariaShare}
              series={[{ points: rows.map((r) => [px(r.p), r.simple.share]), color: INK, width: 1.8, dots: 2 }, { points: rows.map((r) => [px(r.p), r.complex.share]), color: ORANGE_DARK, width: 1.8, dots: 2 }]}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Clusters({ t, num }) {
  const [q, setQ] = useState(K_DEFAULT.q)
  const [kOut, setKOut] = useState(K_DEFAULT.kOut)
  const exp = useExperiment()
  useEffect(() => {
    exp.run(clustersJob(q))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])
  const d = exp.data && exp.data.q === q ? exp.data : null
  const done = d && d.done && !exp.running
  const row = done ? d.rows.find((r) => r.kOut === kOut) : null
  const avg = averagePoint(q)
  return (
    <div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.q} min={0.1} max={0.6} step={0.05} value={q} onChange={(v) => setQ(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
        <Slider label={t.kOut} min={0} max={10} step={0.5} value={kOut} onChange={(v) => setKOut(Math.round(v * 2) / 2)} format={(v) => num(v, 1)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.clustersNote}</p>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="clusters" data-done={done ? '1' : '0'} data-q={q} data-kout={kOut} data-share={row ? row.share.toFixed(3) : ''} data-over={row ? Math.round(row.over * row.nets) : ''} data-average={avg.toFixed(2)} data-shares={d ? d.rows.map((r) => `${r.kOut}:${r.share.toFixed(3)}`).join(' ') : ''}>
        <Stat label={t.share}>
          <span style={{ color: ORANGE_DARK }}>{row ? num(row.share, 3) : '–'}</span>
        </Stat>
        <Stat label={t.falls}>{row ? t.of(Math.round(row.over * row.nets), row.nets) : '–'}</Stat>
        <Stat label={t.outside}>{num(kOut / (K_IN + kOut), 3)}</Stat>
        <Stat label={t.point}>{num(avg, 2)}</Stat>
      </div>
      {d && d.rows.length > 1 && (
        <div className="mt-4 max-w-xl">
          <Eyebrow>{t.chart}</Eyebrow>
          <Chart
            x={{ min: 0, max: 10, ticks: [0, 2, 4, 6, 8, 10], label: 'k_out' }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
            height={200}
            aria={t.ariaClusters}
            marks={[{ x: avg, color: SLATE }, { x: kOut, color: MUTED, dashed: true }]}
            series={[{ points: d.rows.map((r) => [r.kOut, r.share]), color: ORANGE_DARK, width: 2, dots: 2.2 }]}
          />
          <Legend items={[{ label: t.legend.average, color: SLATE }]} />
        </div>
      )}
    </div>
  )
}

export default function TiesPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [view, setView] = useState('ties')
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['ties', 'clusters'].map((id) => (
          <Pill key={id} active={view === id} onClick={() => setView(id)} data-view={id}>
            {t.views[id]}
          </Pill>
        ))}
      </div>
      {view === 'ties' && <Ties t={t} num={num} />}
      {view === 'clusters' && <Clusters t={t} num={num} />}
    </div>
  )
}
