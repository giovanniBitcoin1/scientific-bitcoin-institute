import { useEffect, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { panelCJob, sweepCJob, cInOut, C_DEFAULT, C_SWEEP_NETS } from './experiments.js'

// Panel C, "Can they be found at all?": two equal groups in a sparse network,
// c_in − c_out set as a multiple of the threshold 2√c̄. Spectral bisection by
// the leading eigenvector of the modularity matrix (power iteration), its
// overlap with the planted groups, and Louvain on the same network. "Sweep"
// runs three networks per multiple.

const T = {
  en: {
    N: 'Nodes, N',
    c: 'Mean degree c̄',
    x: 'c_in − c_out, as a multiple of the threshold 2√c̄',
    model: 'Two equal groups. A pair inside a group is linked with probability c_in/N, a pair across with c_out/N: a node has on average c_in/2 links inside its group and c_out/2 across, and c̄ = (c_in + c_out)/2.',
    clamped: (m) => `c_out cannot go below 0: at this c̄ the multiple stops at √c̄ = ${m}.`,
    cin: 'c_in',
    cout: 'c_out',
    inside: "Share of a node's links inside its group",
    overlap: 'Spectral bisection: overlap with the planted groups',
    iter: 'Power iterations',
    lq: 'Louvain: Q',
    lg: 'Louvain: groups',
    ln: 'Louvain: NMI with the planted groups',
    overlapNote: 'Overlap = (share of nodes placed in their planted group − 1/2)/(1/2), with the two labels swapped if that gives more: 0 is chance, 1 is perfect.',
    notConverged: 'not settled',
    running: 'Computing…',
    sweep: 'Sweep',
    sweepNote: `${C_SWEEP_NETS} networks per multiple of the threshold, at the N and c̄ chosen above.`,
    chart: 'Overlap against (c_in − c_out)/2√c̄',
    spectral: 'spectral bisection, overlap',
    louvain: 'Louvain, NMI',
    threshold: 'threshold',
    ariaChart: 'Overlap of the spectral bisection and NMI of Louvain against the multiple of the detectability threshold',
    locale: 'en-US',
  },
  it: {
    N: 'Nodi, N',
    c: 'Grado medio c̄',
    x: 'c_in − c_out, come multiplo della soglia 2√c̄',
    model: "Due gruppi uguali. Una coppia nello stesso gruppo è collegata con probabilità c_in/N, una coppia tra gruppi con c_out/N: un nodo ha in media c_in/2 collegamenti nel suo gruppo e c_out/2 verso l'altro, e c̄ = (c_in + c_out)/2.",
    clamped: (m) => `c_out non può scendere sotto 0: con questo c̄ il multiplo si ferma a √c̄ = ${m}.`,
    cin: 'c_in',
    cout: 'c_out',
    inside: 'Quota dei collegamenti di un nodo dentro il suo gruppo',
    overlap: 'Bisezione spettrale: sovrapposizione con i gruppi impiantati',
    iter: 'Iterazioni del metodo delle potenze',
    lq: 'Louvain: Q',
    lg: 'Louvain: gruppi',
    ln: 'Louvain: NMI con i gruppi impiantati',
    overlapNote: "Sovrapposizione = (quota di nodi messi nel loro gruppo impiantato − 1/2)/(1/2), scambiando le due etichette se così è di più: 0 è il caso, 1 è perfetto.",
    notConverged: 'non assestato',
    running: 'Calcolo in corso…',
    sweep: 'Scorri',
    sweepNote: `${C_SWEEP_NETS} reti per ogni multiplo della soglia, con N e c̄ scelti sopra.`,
    chart: 'Sovrapposizione al variare di (c_in − c_out)/2√c̄',
    spectral: 'bisezione spettrale, sovrapposizione',
    louvain: 'Louvain, NMI',
    threshold: 'soglia',
    ariaChart: 'Sovrapposizione della bisezione spettrale e NMI di Louvain al variare del multiplo della soglia di rilevabilità',
    locale: 'it-IT',
  },
}

export default function DetectPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [N, setN] = useState(C_DEFAULT.N)
  const [c, setC] = useState(C_DEFAULT.c)
  const [x, setX] = useState(C_DEFAULT.x)
  const exp = useExperiment()
  const sweep = useExperiment()
  useEffect(() => {
    exp.run(panelCJob({ N, c, x }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N, c, x])
  const d = exp.data
  const p = cInOut(c, x)
  const sw = sweep.data && sweep.data.N === N && sweep.data.c === c ? sweep.data : null

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label={t.N} min={1000} max={10000} step={1000} value={N} onChange={(v) => setN(Math.round(v / 1000) * 1000)} format={(v) => Math.round(v).toLocaleString(t.locale)} />
        <Slider label={t.c} min={3} max={20} step={1} value={c} onChange={(v) => setC(Math.round(v))} format={(v) => String(v)} />
        <Slider label={t.x} min={0} max={3} step={0.1} value={x} onChange={(v) => setX(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.model}</p>
      {p.clamped && <p className="mt-1 text-xs text-orange-700 leading-snug">{t.clamped(num(Math.sqrt(c), 2))}</p>}
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div
        className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2"
        data-readout="detect"
        data-done={d && d.done ? '1' : '0'}
        data-overlap={d && d.done ? d.overlap.toFixed(3) : ''}
        data-lq={d && d.done ? d.louvainQ.toFixed(3) : ''}
        data-lg={d && d.done ? d.louvainGroups : ''}
        data-ln={d && d.done ? d.louvainNmi.toFixed(3) : ''}
      >
        <Stat label={t.cin}>{num(p.cIn, 2)}</Stat>
        <Stat label={t.cout}>{num(p.cOut, 2)}</Stat>
        <Stat label={t.inside}>{`${num(100 * (p.cIn / (p.cIn + p.cOut)), 1)}%`}</Stat>
        <Stat label={t.iter}>{d ? `${d.iterations.toLocaleString(t.locale)}${d.done && !d.converged ? ` (${t.notConverged})` : ''}` : '–'}</Stat>
        <Stat label={t.overlap} wide>
          <span style={{ color: ORANGE_DARK }}>{d && d.done ? num(d.overlap, 3) : '–'}</span>
        </Stat>
        <Stat label={t.lq}>{d && d.done ? num(d.louvainQ, 3) : '–'}</Stat>
        <Stat label={t.lg}>{d && d.done ? d.louvainGroups.toLocaleString(t.locale) : '–'}</Stat>
        <Stat label={t.ln} wide>
          {d && d.done ? num(d.louvainNmi, 3) : '–'}
        </Stat>
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.overlapNote}</p>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Pill primary onClick={() => sweep.run(sweepCJob({ N, c }))} disabled={sweep.running} data-action="sweep">
            {sweep.running ? `${t.running} ${Math.round(sweep.progress * 100)}%` : t.sweep}
          </Pill>
          <p className="text-xs text-slate-500 leading-snug">{t.sweepNote}</p>
        </div>
        {sw && (
          <div className="mt-2 max-w-xl" data-readout="sweep-c" data-done={sweep.running ? '0' : '1'} data-overlap={sw.rows.map((r) => (r.count === C_SWEEP_NETS ? r.overlap.toFixed(3) : '')).join(' ')}>
            <Eyebrow>{t.chart}</Eyebrow>
            <Chart
              x={{ min: 0, max: 3, ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3], label: '×', format: (v) => num(v, 1) }}
              y={{ min: 0, max: 1, ticks: [0, 0.5, 1], format: (v) => num(v, 1) }}
              height={170}
              aria={t.ariaChart}
              marks={[{ x: 1, color: MUTED, dashed: true, label: t.threshold }]}
              series={[
                { points: sw.rows.filter((r) => r.count === C_SWEEP_NETS && !(r.clamped && r.x > Math.sqrt(c) + 0.11)).map((r) => [r.x, r.overlap]), color: ORANGE_DARK, dots: 2, width: 1.8 },
                { points: sw.rows.filter((r) => r.count === C_SWEEP_NETS && !(r.clamped && r.x > Math.sqrt(c) + 0.11)).map((r) => [r.x, r.louvainNmi]), color: INK, dots: 2, width: 1.6, dashed: true },
              ]}
            />
            <Legend items={[{ label: t.spectral, color: ORANGE_DARK }, { label: t.louvain, color: INK, dashed: true }]} />
          </div>
        )}
      </div>
    </div>
  )
}
