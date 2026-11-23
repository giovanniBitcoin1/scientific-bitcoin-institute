import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { cascadesAt, windowJob, paDegree, B_DEFAULT, B_SOURCES, B_SEEDS, B_N, B_TRIALS, B_TOP, B_BINS, GLOBAL } from './experiments.js'
import { cascadeWindow } from './contagion.js'

// Panel B, "The cascade window": Watts's threshold rule on a random network
// (or on preferential attachment), one seed at a time.

const T = {
  en: {
    sources: { poisson: 'Random network', pa: 'Preferential attachment' },
    seeds: { random: 'Seed: a random node', top: `Seed: one of the ${B_TOP} largest hubs` },
    phi: 'Threshold, φ',
    z: 'Mean degree, z',
    note: `${B_N.toLocaleString('en-US')} nodes. A node adopts, for good, once a share φ of its neighbours has. Each of ${B_TRIALS} cascades starts from one seed; it is "global" when it passes ${Math.round(GLOBAL * 100)}% of the nodes.`,
    paNote: (z) => `Preferential attachment brings a whole number of links per new node, so the mean degree is even: ${z} here.`,
    vulnerable: (K) => `Vulnerable nodes (k ≤ ${K})`,
    condition: 'Cascade condition (above 1?)',
    global: 'Global cascades',
    size: 'Mean size of the global ones',
    window: (w) => (w ? `For a random network the condition holds for z between ${w[0]} and ${w[1]}.` : 'For a random network the condition never holds at this threshold: no window.'),
    hist: 'Cascade sizes (share of N)',
    share: 'share of cascades',
    sweep: 'Sweep the mean degree',
    running: 'Computing…',
    sweepTitle: 'Against the mean degree z',
    legend: { global: 'share of seeds that start a global cascade', size: 'mean size of the global ones', window: 'window from the condition' },
    hubs: (k) => `The ${B_TOP} largest hubs have at least ${k} links.`,
    ariaHist: 'Histogram of cascade sizes as shares of the network',
    ariaSweep: 'Share of seeds that start a global cascade and mean size of global cascades against the mean degree, with the window given by the cascade condition',
    locale: 'en-US',
  },
  it: {
    sources: { poisson: 'Rete casuale', pa: 'Aggancio preferenziale' },
    seeds: { random: 'Seme: un nodo a caso', top: `Seme: uno dei ${B_TOP} hub più grandi` },
    phi: 'Soglia, φ',
    z: 'Grado medio, z',
    note: `${B_N.toLocaleString('it-IT')} nodi. Un nodo adotta, per sempre, quando una quota φ dei suoi vicini ha adottato. Ognuna delle ${B_TRIALS} cascate parte da un solo seme; è «globale» quando supera il ${Math.round(GLOBAL * 100)}% dei nodi.`,
    paNote: (z) => `L'aggancio preferenziale porta un numero intero di collegamenti per ogni nuovo nodo, quindi il grado medio è pari: qui ${z}.`,
    vulnerable: (K) => `Nodi vulnerabili (k ≤ ${K})`,
    condition: 'Condizione di cascata (sopra 1?)',
    global: 'Cascate globali',
    size: 'Dimensione media di quelle globali',
    window: (w) => (w ? `Per una rete casuale la condizione vale per z tra ${w[0]} e ${w[1]}.` : "Per una rete casuale la condizione non vale mai con questa soglia: nessuna finestra."),
    hist: 'Dimensioni delle cascate (quota di N)',
    share: 'quota delle cascate',
    sweep: 'Scansione del grado medio',
    running: 'Calcolo in corso…',
    sweepTitle: 'Al variare del grado medio z',
    legend: { global: 'quota di semi che avviano una cascata globale', size: 'dimensione media di quelle globali', window: 'finestra dalla condizione' },
    hubs: (k) => `I ${B_TOP} hub più grandi hanno almeno ${k} collegamenti.`,
    ariaHist: 'Istogramma delle dimensioni delle cascate come quote della rete',
    ariaSweep: 'Quota di semi che avviano una cascata globale e dimensione media delle cascate globali al variare del grado medio, con la finestra data dalla condizione di cascata',
    locale: 'it-IT',
  },
}

export default function WindowPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(B_DEFAULT.source)
  const [seeds, setSeeds] = useState(B_DEFAULT.seeds)
  const [phi, setPhi] = useState(B_DEFAULT.phi)
  const [z, setZ] = useState(B_DEFAULT.z)
  const r = useMemo(() => cascadesAt({ source, phi, z, seeds }), [source, phi, z, seeds])
  const win = useMemo(() => cascadeWindow(phi), [phi])
  const sweep = useExperiment()
  const sw = sweep.data && sweep.data.source === source && sweep.data.phi === phi && sweep.data.seeds === seeds && sweep.data.rows.length ? sweep.data : null
  const topBin = Math.max(0.2, Math.ceil(Math.max(...r.bins) * 5) / 5)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {B_SOURCES.map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
        {B_SEEDS.map((id) => (
          <Pill key={id} active={seeds === id} onClick={() => setSeeds(id)} data-seeds={id}>
            {t.seeds[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.phi} min={0.05} max={0.4} step={0.01} value={phi} onChange={(v) => setPhi(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <Slider label={t.z} min={0.5} max={8} step={0.05} value={z} onChange={(v) => setZ(Math.round(v * 20) / 20)} format={(v) => num(source === 'pa' ? paDegree(v) : v, 2)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
      {source === 'pa' && <p className="mt-1 text-xs text-slate-500 leading-snug">{t.paNote(r.z)}</p>}
      <p className="mt-1 text-xs text-slate-500 leading-snug">{`${t.window(win ? [num(win[0], 2), num(win[1], 2)] : null)} ${t.hubs(r.kTop)}`}</p>

      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="cascades" data-source={source} data-seeds={seeds} data-phi={phi} data-z={r.z} data-links={r.links} data-vulnerable={r.vulnerable.toFixed(3)} data-condition={r.condition.toFixed(2)} data-global={r.global.toFixed(3)} data-size={Number.isFinite(r.meanGlobal) ? r.meanGlobal.toFixed(3) : ''} data-window={win ? win.map((x) => x.toFixed(2)).join(' ') : ''} data-ktop={r.kTop}>
        <Stat label={t.vulnerable(r.K)}>{num(r.vulnerable, 3)}</Stat>
        <Stat label={t.condition}>{num(r.condition, 2)}</Stat>
        <Stat label={t.global}>
          <span style={{ color: ORANGE_DARK }}>{num(r.global, 3)}</span>
        </Stat>
        <Stat label={t.size}>{num(r.meanGlobal, 3)}</Stat>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.hist}</Eyebrow>
          <Chart x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => (v === 1 ? '1' : num(v, 2)) }} y={{ min: 0, max: topBin, ticks: [0, topBin / 2, topBin], label: t.share, format: (v) => num(v, 1) }} height={180} aria={t.ariaHist} series={[]}>
            {({ sx, sy }) => r.bins.map((b, i) => (b > 0 ? <rect key={i} x={sx(i / B_BINS) + 0.5} y={sy(b)} width={sx((i + 1) / B_BINS) - sx(i / B_BINS) - 1} height={sy(0) - sy(b)} fill={i / B_BINS < GLOBAL ? SLATE : ORANGE_DARK} /> : null))}
          </Chart>
        </div>
        <div className="min-w-0">
          <Pill primary onClick={() => sweep.run(windowJob({ source, phi, seeds }))} disabled={sweep.running} data-action="sweep">
            {t.sweep}
          </Pill>
          {sweep.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(sweep.progress * 100)}%`}</p>}
          {sw && (
            <div className="mt-3" data-readout="window" data-done={sw.done && !sweep.running ? '1' : '0'} data-global={sw.rows.map((x) => `${x.z}:${x.global.toFixed(2)}`).join(' ')} data-size={sw.rows.map((x) => `${x.z}:${Number.isFinite(x.meanGlobal) ? x.meanGlobal.toFixed(3) : '-'}`).join(' ')}>
              <Eyebrow>{t.sweepTitle}</Eyebrow>
              <Chart
                x={{ min: 0, max: 8, ticks: [0, 2, 4, 6, 8], label: 'z' }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
                height={190}
                aria={t.ariaSweep}
                marks={[...(source === 'poisson' && sw.window ? sw.window.filter((x) => x <= 8).map((x) => ({ x, color: SLATE })) : []), { x: r.z, color: MUTED, dashed: true }]}
                series={[
                  { points: sw.rows.filter((x) => Number.isFinite(x.meanGlobal)).map((x) => [x.z, x.meanGlobal]), color: INK, width: 1.2, dots: 1.6 },
                  { points: sw.rows.map((x) => [x.z, x.global]), color: ORANGE_DARK, width: 2, dots: 2 },
                ]}
              />
              <Legend items={[{ label: t.legend.global, color: ORANGE_DARK }, { label: t.legend.size, color: INK }, ...(source === 'poisson' && sw.window ? [{ label: t.legend.window, color: SLATE }] : [])]} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
