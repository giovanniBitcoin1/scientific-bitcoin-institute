import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import Chart, { Legend } from '../charts.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import karateData from '../../../../data/lab/networks/karate-club.json'
import { karateFrom, panelA, sweepAJob, randomQJob, A_DEFAULT, A_SWEEP_NETS, RANDOM_N, RANDOM_NETS } from './experiments.js'
import { groupColor } from './palette.js'

// Panel A, "Find the groups": the Girvan–Newman benchmark, the karate club or
// a random network with the benchmark's nodes and links; Louvain or label
// propagation with a seed; the drawing coloured by the groups found, with the
// planted groups as rings. "Sweep k_out" and "Random networks" run on buttons.

const KARATE = karateFrom(karateData)

const T = {
  en: {
    sources: { gn: 'Benchmark, four groups of 32', karate: 'Karate club', random: 'Random, same nodes and links' },
    methods: { louvain: 'Louvain', lp: 'Label propagation' },
    kOut: 'Links per node across groups, k_out (of 16)',
    seed: 'Seed',
    next: 'Next seed',
    qPlanted: { gn: 'Q, planted groups', karate: 'Q, the two factions', random: 'Q, four blocks of 32 (no meaning here)' },
    qFound: 'Q, groups found',
    groups: 'Groups found',
    nmi: { gn: 'NMI with the planted groups', karate: 'NMI with the factions', random: 'NMI with the four blocks' },
    note: 'Fill: the groups found. Ring: the planted groups (for the karate club, the factions after the split; for the random network, four arbitrary blocks of 32).',
    sweep: 'Sweep k_out',
    sweepNote: `k_out from 0 to 12, ${A_SWEEP_NETS} benchmark networks per value, both methods.`,
    random: 'Random networks',
    randomNote: `Louvain on ${RANDOM_NETS} random networks of ${RANDOM_N.toLocaleString('en-US')} nodes at each mean degree.`,
    running: 'Computing…',
    chart: 'Mean NMI with the planted groups against μ = k_out/16',
    meanK: 'Mean degree',
    meanQ: 'Mean Q',
    meanG: 'Mean groups',
    aria: 'The network coloured by the groups found',
    ariaChart: 'Normalised mutual information against the mixing parameter for both methods',
    locale: 'en-US',
  },
  it: {
    sources: { gn: 'Benchmark, quattro gruppi di 32', karate: 'Club di karate', random: 'A caso, stessi nodi e collegamenti' },
    methods: { louvain: 'Louvain', lp: 'Propagazione delle etichette' },
    kOut: 'Collegamenti per nodo tra gruppi, k_out (su 16)',
    seed: 'Seme',
    next: 'Seme successivo',
    qPlanted: { gn: 'Q, gruppi impiantati', karate: 'Q, le due fazioni', random: 'Q, quattro blocchi di 32 (qui senza senso)' },
    qFound: 'Q, gruppi trovati',
    groups: 'Gruppi trovati',
    nmi: { gn: 'NMI con i gruppi impiantati', karate: 'NMI con le fazioni', random: 'NMI con i quattro blocchi' },
    note: 'Riempimento: i gruppi trovati. Anello: i gruppi impiantati (per il club di karate, le fazioni dopo la scissione; per la rete casuale, quattro blocchi arbitrari di 32).',
    sweep: 'Scorri k_out',
    sweepNote: `k_out da 0 a 12, ${A_SWEEP_NETS} reti benchmark per valore, entrambi i metodi.`,
    random: 'Reti casuali',
    randomNote: `Louvain su ${RANDOM_NETS} reti casuali di ${RANDOM_N.toLocaleString('it-IT')} nodi per ogni grado medio.`,
    running: 'Calcolo in corso…',
    chart: 'NMI media con i gruppi impiantati al variare di μ = k_out/16',
    meanK: 'Grado medio',
    meanQ: 'Q medio',
    meanG: 'Gruppi in media',
    aria: 'La rete colorata secondo i gruppi trovati',
    ariaChart: 'Informazione mutua normalizzata al variare del parametro di mescolamento, per i due metodi',
    locale: 'it-IT',
  },
}

const RING = ['#0f172a', '#94a3b8', '#ea580c', '#0284c7']

export default function FindPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(A_DEFAULT.source)
  const [kOut, setKOut] = useState(A_DEFAULT.kOut)
  const [method, setMethod] = useState(A_DEFAULT.method)
  const [seed, setSeed] = useState(A_DEFAULT.seed)
  const sweep = useExperiment()
  const rnd = useExperiment()
  const r = useMemo(() => panelA({ source, kOut, method, seed }, KARATE), [source, kOut, method, seed])
  const pos = useMemo(() => {
    const n = r.g.n
    const random = mulberry32(17)
    const start = Float64Array.from({ length: 2 * n }, () => random())
    return fitUnit(forceLayout(n, r.g.A, r.g.B, r.g.A.length, start, 0.1, n > 60 ? 220 : 300), n)
  }, [r.g])
  const big = r.g.n > 60
  const nodes = Array.from({ length: r.g.n }, (_, v) => ({ i: v, r: big ? 3.6 : 5.5, fill: groupColor(r.found[v]), stroke: RING[r.planted[v] % RING.length], lineWidth: big ? 1.6 : 2.2 }))
  const links = Array.from(r.g.A, (a, e) => ({ a, b: r.g.B[e], color: r.found[a] === r.found[r.g.B[e]] ? 'rgba(100, 116, 139, 0.35)' : 'rgba(100, 116, 139, 0.12)', width: 0.8 }))
  const sw = sweep.data
  const rq = rnd.data

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['gn', 'karate', 'random'].map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {['louvain', 'lp'].map((id) => (
          <Pill key={id} active={method === id} onClick={() => setMethod(id)} data-method={id}>
            {t.methods[id]}
          </Pill>
        ))}
        <span className="font-mono text-xs text-slate-500" data-readout="seed">{`${t.seed} ${seed}`}</span>
        <Pill onClick={() => setSeed((s) => s + 1)} data-action="seed">
          {t.next}
        </Pill>
      </div>
      {source !== 'karate' && (
        <div className="mt-3 max-w-md">
          <Slider label={t.kOut} min={0} max={12} step={1} value={kOut} onChange={(v) => setKOut(Math.round(v))} format={(v) => String(v)} />
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <NetCanvas pos={pos} nodes={nodes} links={links} aria={t.aria} maxHeight={320} ratio={0.9} />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
        </div>
        <div className="min-w-0 grid grid-cols-2 gap-2 content-start" data-readout="find" data-qplanted={r.qPlanted.toFixed(4)} data-qfound={r.qFound.toFixed(4)} data-groups={r.groups} data-nmi={r.nmi.toFixed(4)}>
          <Stat label={t.qPlanted[source]}>{num(r.qPlanted, 3)}</Stat>
          <Stat label={t.qFound}>{num(r.qFound, 3)}</Stat>
          <Stat label={t.groups}>{r.groups}</Stat>
          <Stat label={t.nmi[source]}>{num(r.nmi, 3)}</Stat>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Pill primary onClick={() => sweep.run(sweepAJob())} disabled={sweep.running} data-action="sweep">
              {sweep.running ? `${t.running} ${Math.round(sweep.progress * 100)}%` : t.sweep}
            </Pill>
            <p className="text-xs text-slate-500 leading-snug">{t.sweepNote}</p>
          </div>
          {sw && (
            <div className="mt-2" data-readout="sweep-a" data-done={sweep.running ? '0' : '1'} data-louvain={sw.rows.map((x) => (Number.isFinite(x.louvain) ? x.louvain.toFixed(3) : '')).join(' ')} data-lp={sw.rows.map((x) => (Number.isFinite(x.lp) ? x.lp.toFixed(3) : '')).join(' ')}>
              <Eyebrow>{t.chart}</Eyebrow>
              <Chart
                x={{ min: 0, max: 0.75, ticks: [0, 0.25, 0.5, 0.75], label: 'μ', format: (v) => num(v, 2) }}
                y={{ min: 0, max: 1, ticks: [0, 0.5, 1], label: 'NMI', labelSide: 'left', format: (v) => num(v, 1) }}
                height={160}
                aria={t.ariaChart}
                marks={[{ x: kOut / 16, color: MUTED, dashed: true }]}
                series={[
                  { points: sw.rows.filter((x) => x.count).map((x) => [x.mu, x.louvain]), color: ORANGE_DARK, dots: 2, width: 1.8 },
                  { points: sw.rows.filter((x) => x.count).map((x) => [x.mu, x.lp]), color: INK, dots: 2, width: 1.8, dashed: true },
                ]}
              />
              <Legend items={[{ label: t.methods.louvain, color: ORANGE_DARK }, { label: t.methods.lp, color: INK, dashed: true }]} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Pill primary onClick={() => rnd.run(randomQJob())} disabled={rnd.running} data-action="random">
              {rnd.running ? `${t.running} ${Math.round(rnd.progress * 100)}%` : t.random}
            </Pill>
            <p className="text-xs text-slate-500 leading-snug">{t.randomNote}</p>
          </div>
          {rq && (
            <table className="mt-2 w-full text-sm font-mono tabular-nums" data-readout="random-q" data-done={rnd.running ? '0' : '1'} data-q={rq.rows.map((x) => (Number.isFinite(x.Q) ? x.Q.toFixed(3) : '')).join(' ')}>
              <thead>
                <tr className="text-xs text-slate-500 text-left">
                  <th className="py-1 pr-3 font-normal">{t.meanK}</th>
                  <th className="py-1 pr-3 font-normal">{t.meanQ}</th>
                  <th className="py-1 font-normal">{t.meanG}</th>
                </tr>
              </thead>
              <tbody>
                {rq.rows.map((x) => (
                  <tr key={x.k} className="border-t border-slate-200">
                    <td className="py-1 pr-3">{x.k}</td>
                    <td className="py-1 pr-3">{num(x.Q, 3)}</td>
                    <td className="py-1">{num(x.groups, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
