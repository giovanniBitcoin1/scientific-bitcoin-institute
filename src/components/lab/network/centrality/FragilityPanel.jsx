import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, Eyebrow, fmt } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { fromData, FRAGILE } from './networks.js'
import { FRAGILE_MEASURES, ERROR_IDS, FRAGILE_RUNS, FRAGILE_JOB_SEED, TOP, fragilityJob } from './fragility.js'
import karateData from '../../../../data/lab/networks/karate-club.json'

// Panel C, "How fragile is a ranking?": the same network observed with links
// missing or with spurious links, 30 times at each fraction, and how well the
// observed ranking agrees with the true one under five measures.

const COLORS = { degree: INK, closeness: '#0284c7', betweenness: ORANGE_DARK, eigenvector: '#16a34a', pagerank: '#7c3aed' }
const NET_IDS = ['scaleFree', 'smallWorld', 'karate']

const T = {
  en: {
    network: 'True network',
    nets: {
      scaleFree: 'Scale-free, N = 300, m = 2',
      smallWorld: 'Small-world, N = 300, k = 6, rewiring 0.1',
      karate: 'Karate club, N = 34',
    },
    error: 'Error in the observation',
    errors: { missing: 'Missing links', spurious: 'Spurious links' },
    how: {
      missing: 'A share f of the links, chosen at random, is not recorded.',
      spurious: 'Links that do not exist are recorded between random pairs: f times the true number of links.',
    },
    measures: { degree: 'Degree', closeness: 'Closeness', betweenness: 'Betweenness', eigenvector: 'Eigenvector', pagerank: 'PageRank' },
    spearman: 'Rank correlation between true and observed ranking (Spearman)',
    overlap: (k) => `Share of the true top ${k} still in the observed top ${k}`,
    f: 'f',
    fraction: 'Read the curves at f',
    measure: 'Measure',
    colSpearman: 'Spearman',
    colOverlap: (k) => `Top ${k}`,
    note: (runs) => `Each point is the average of ${runs} observed copies of the same network. Ties in a top ten are broken at random.`,
    computing: 'Computing…',
    ariaS: 'Spearman correlation between true and observed ranking against the fraction of wrong links, for five measures',
    ariaO: 'Overlap of the true and observed top ten against the fraction of wrong links, for five measures',
  },
  it: {
    network: 'Rete vera',
    nets: {
      scaleFree: 'A invarianza di scala, N = 300, m = 2',
      smallWorld: 'Small-world, N = 300, k = 6, riconnessione 0.1',
      karate: 'Club di karate, N = 34',
    },
    error: "Errore nell'osservazione",
    errors: { missing: 'Collegamenti mancanti', spurious: 'Collegamenti spuri' },
    how: {
      missing: 'Una quota f dei collegamenti, scelti a caso, non viene registrata.',
      spurious: 'Si registrano collegamenti che non esistono, tra coppie a caso: f volte il numero vero di collegamenti.',
    },
    measures: { degree: 'Grado', closeness: 'Vicinanza', betweenness: 'Intermediazione', eigenvector: 'Autovettore', pagerank: 'PageRank' },
    spearman: 'Correlazione di rango tra classifica vera e osservata (Spearman)',
    overlap: (k) => `Quota dei primi ${k} veri ancora tra i primi ${k} osservati`,
    f: 'f',
    fraction: 'Leggi le curve a f',
    measure: 'Misura',
    colSpearman: 'Spearman',
    colOverlap: (k) => `Primi ${k}`,
    note: (runs) => `Ogni punto è la media di ${runs} copie osservate della stessa rete. I pari merito tra i primi dieci sono sciolti a caso.`,
    computing: 'Calcolo in corso…',
    ariaS: 'Correlazione di Spearman tra classifica vera e osservata al variare della quota di collegamenti sbagliati, per cinque misure',
    ariaO: 'Sovrapposizione tra i primi dieci veri e osservati al variare della quota di collegamenti sbagliati, per cinque misure',
  },
}

const load = (id) => (id === 'karate' ? fromData(karateData) : FRAGILE[id]())

export default function FragilityPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [netId, setNetId] = useState('scaleFree')
  const [errorId, setErrorId] = useState('missing')
  const [f, setF] = useState(0.2)
  const exp = useExperiment()
  const net = useMemo(() => load(netId), [netId])
  const key = `${netId}/${errorId}`

  useEffect(() => {
    const job = fragilityJob(net, errorId, FRAGILE_JOB_SEED)
    const snapshot = job.snapshot
    job.snapshot = () => ({ ...snapshot(), key })
    exp.run(job)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, errorId])
  const data = exp.data && exp.data.key === key ? exp.data : null
  const points = data ? data.points : []
  const top = Math.min(TOP, net.n)

  const series = (field) =>
    FRAGILE_MEASURES.map((id) => ({ points: points.map((p) => [p.x, p[field][id]]), color: COLORS[id], dots: 1.8, width: 1.6 }))
  const x = { min: 0, max: 0.5, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], label: t.f, format: (v) => String(v) }
  const y = { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => String(v) }
  const at = points.find((p) => Math.abs(p.x - f) < 1e-9)
  const done = at && at.runs === FRAGILE_RUNS && !exp.running
  const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'
  const legend = FRAGILE_MEASURES.map((id) => ({ label: t.measures[id], color: COLORS[id] }))

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.network}
          <select value={netId} onChange={(e) => setNetId(e.target.value)} className={select}>
            {NET_IDS.map((id) => (
              <option key={id} value={id}>
                {t.nets[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.error}
          <select value={errorId} onChange={(e) => setErrorId(e.target.value)} className={select}>
            {ERROR_IDS.map((id) => (
              <option key={id} value={id}>
                {t.errors[id]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{t.how[errorId]}</p>
      <p className="mt-1 h-4 font-mono text-xs text-slate-500" aria-live="polite">
        {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : ''}
      </p>

      <div className="mt-2 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.spearman}</Eyebrow>
          <Chart x={x} y={y} aria={t.ariaS} height={200} series={series('spearman')} marks={[{ x: f, color: '#94a3b8', dashed: true }]} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.overlap(top)}</Eyebrow>
          <Chart x={x} y={y} aria={t.ariaO} height={200} series={series('overlap')} marks={[{ x: f, color: '#94a3b8', dashed: true }]} />
        </div>
      </div>
      <Legend items={legend} />

      <div className="mt-5 grid gap-x-6 gap-y-3 md:grid-cols-2 items-start">
        <Slider label={t.fraction} min={0} max={0.5} step={0.05} value={f} onChange={setF} format={(v) => fmt(v, 2)} />
        <table className="w-full text-sm" data-readout="fragility" data-done={done ? '1' : '0'}>
          <thead>
            <tr>
              <th scope="col" className="pb-1 pr-2 text-left font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                {t.measure}
              </th>
              <th scope="col" className="pb-1 px-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                {t.colSpearman}
              </th>
              <th scope="col" className="pb-1 pl-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                {t.colOverlap(top)}
              </th>
            </tr>
          </thead>
          <tbody>
            {FRAGILE_MEASURES.map((id) => (
              <tr key={id} className="border-t border-slate-100">
                <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-baseline" style={{ background: COLORS[id] }} />
                  {t.measures[id]}
                </th>
                <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{at ? fmt(at.spearman[id], 2) : '–'}</td>
                <td className="py-1.5 pl-2 text-right font-mono tabular-nums text-slate-900">{at ? fmt(at.overlap[id], 2) : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note(FRAGILE_RUNS)}</p>
    </div>
  )
}
