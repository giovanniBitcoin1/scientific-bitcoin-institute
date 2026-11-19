import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { mulberry32 } from '../../rng.js'
import { forceLayout } from '../../graphUtils.js'
import { ORANGE_DARK, INK, SLATE, MONO, GRID, Pill, Eyebrow, Stat, fmt } from '../ui.jsx'
import NetCanvas, { fitUnit } from './NetCanvas.jsx'
import { MODEL_NETWORKS, STATISTICS, SWAPS_PER_LINK, NULL_SEED, fromData, swapper, nullJob, histogram } from './nullmodels.js'
import karateData from '../../../../data/lab/networks/karate-club.json'
import florentineData from '../../../../data/lab/networks/florentine-families.json'

// Panel B, "Compared to what?": one statistic of one network against the
// values it takes in random networks with the same N and L, or with the same
// degrees. The drawing shows the same-degrees randomisation at work: "Watch a
// swap" lights two links up and exchanges their ends. The canvas has no
// pointer handlers, so a swipe over it scrolls the page.

const SKY = '#0284c7'
const NETWORK_IDS = ['karate', 'florentine', 'smallWorld', 'scaleFree', 'random']
const STAT_IDS = ['transitivity', 'clustering', 'assortativity', 'distance', 'triangles']
const NULL_IDS = ['gnm', 'degrees']
const SWAP_MS = 900

const T = {
  en: {
    network: 'Network',
    networks: {
      karate: "Zachary's karate club",
      florentine: 'Florentine families',
      smallWorld: 'Small-world, N = 100, k = 4, rewiring 0.1',
      scaleFree: 'Scale-free, N = 100, m = 2',
      random: 'Random, N = 100, ⟨k⟩ = 4',
    },
    stat: 'Statistic',
    stats: {
      transitivity: 'Transitivity',
      clustering: 'Average clustering',
      assortativity: 'Assortativity',
      distance: 'Average distance',
      triangles: 'Triangles',
    },
    nullModel: 'Null model',
    nulls: { gnm: 'Same N and L', degrees: 'Same degrees' },
    samples: 'Randomisations',
    run: 'Run',
    computing: 'Computing…',
    observed: 'Observed',
    nullMean: 'Null mean',
    sd: 'Standard deviation',
    z: 'z-score',
    extreme: 'Samples at least as extreme',
    done: (m) => `${m} samples`,
    histAria: 'Histogram of the statistic in the null model, with the observed value marked',
    obsMark: 'observed',
    count: 'samples',
    howGnm: 'Each sample places the same number of links on pairs chosen at random.',
    howDegrees: (n) => `Each sample follows ${n} attempted swaps (${SWAPS_PER_LINK} per link); a swap that would create a self-link or a double link is refused.`,
    watch: 'Watch a swap',
    shuffle: 'Swap 100 times',
    reset: 'Original network',
    swaps: (n) => `${n} swap${n === 1 ? '' : 's'} made. Every node still has its original degree.`,
    swapNow: (a, b, c, d) => `${a}–${b} and ${c}–${d} become ${a}–${d} and ${c}–${b}.`,
    drawAria: 'Drawing of the network. Watch a swap highlights two links and exchanges their ends.',
    current: 'In this drawing',
  },
  it: {
    network: 'Rete',
    networks: {
      karate: 'Club di karate di Zachary',
      florentine: 'Famiglie fiorentine',
      smallWorld: 'Small-world, N = 100, k = 4, riconnessione 0.1',
      scaleFree: 'A invarianza di scala, N = 100, m = 2',
      random: 'Casuale, N = 100, ⟨k⟩ = 4',
    },
    stat: 'Statistica',
    stats: {
      transitivity: 'Transitività',
      clustering: 'Clustering medio',
      assortativity: 'Assortatività',
      distance: 'Distanza media',
      triangles: 'Triangoli',
    },
    nullModel: 'Modello nullo',
    nulls: { gnm: 'Stessi N e L', degrees: 'Stessi gradi' },
    samples: 'Randomizzazioni',
    run: 'Esegui',
    computing: 'Calcolo in corso…',
    observed: 'Osservato',
    nullMean: 'Media nulla',
    sd: 'Deviazione standard',
    z: 'z-score',
    extreme: 'Campioni almeno altrettanto estremi',
    done: (m) => `${m} campioni`,
    histAria: 'Istogramma della statistica nel modello nullo, con il valore osservato evidenziato',
    obsMark: 'osservato',
    count: 'campioni',
    howGnm: 'Ogni campione dispone lo stesso numero di collegamenti su coppie scelte a caso.',
    howDegrees: (n) => `Ogni campione segue ${n} scambi tentati (${SWAPS_PER_LINK} per collegamento); uno scambio che creerebbe un auto-collegamento o un collegamento doppio viene rifiutato.`,
    watch: 'Guarda uno scambio',
    shuffle: 'Scambia 100 volte',
    reset: 'Rete originale',
    swaps: (n) => `${n} scamb${n === 1 ? 'io eseguito' : 'i eseguiti'}. Ogni nodo ha ancora il suo grado originale.`,
    swapNow: (a, b, c, d) => `${a}–${b} e ${c}–${d} diventano ${a}–${d} e ${c}–${b}.`,
    drawAria: 'Disegno della rete. «Guarda uno scambio» evidenzia due collegamenti e ne scambia gli estremi.',
    current: 'In questo disegno',
  },
}

function loadNetwork(id) {
  if (id === 'karate') return { net: fromData(karateData), labels: karateData.nodes }
  if (id === 'florentine') return { net: fromData(florentineData), labels: florentineData.nodes }
  const net = MODEL_NETWORKS[id](1)
  return { net, labels: Array.from({ length: net.n }, (_, i) => String(i + 1)) }
}

function layout(net) {
  const random = mulberry32(0xb0b + net.n)
  const start = Float64Array.from({ length: 2 * net.n }, () => random())
  return fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, start, 0.1, 200), net.n)
}

const digits = (statId) => (statId === 'triangles' ? 0 : statId === 'distance' ? 3 : 3)

// Histogram of the null values, the observed value as a vertical line.
function NullHistogram({ data, statId, t }) {
  const W = 320
  const H = 170
  const L = 30
  const R = 8
  const TOP = 14
  const B = 24
  const integer = statId === 'triangles'
  const h = useMemo(() => {
    if (!data || !data.values.length) return null
    if (integer) {
      const lo = Math.min(data.observed, ...data.values) - 1
      const hi = Math.max(data.observed, ...data.values) + 1
      if (hi - lo <= 60) {
        const counts = new Array(hi - lo + 1).fill(0)
        for (const v of data.values) counts[Math.round(v) - lo]++
        return { lo: lo - 0.5, hi: hi + 0.5, counts, max: Math.max(1, ...counts) }
      }
    }
    return histogram(data.values, data.observed, 30)
  }, [data, integer])
  if (!h) return <div className="h-[170px]" />
  const sx = (v) => L + ((v - h.lo) / (h.hi - h.lo)) * (W - L - R)
  const bw = (W - L - R) / h.counts.length
  const sy = (c) => H - B - (c / h.max) * (H - B - TOP)
  const d = digits(statId)
  const ox = sx(data.observed)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.histAria}>
      <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke={SLATE} strokeWidth="1" />
      <line x1={L} x2={W - R} y1={sy(h.max)} y2={sy(h.max)} stroke={GRID} strokeWidth="1" />
      <text x={L - 4} y={sy(h.max) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
        {h.max}
      </text>
      <text x={L - 4} y={H - B + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
        0
      </text>
      {h.counts.map((c, i) =>
        c ? <rect key={i} x={L + i * bw + 0.4} y={sy(c)} width={Math.max(0.8, bw - 0.8)} height={H - B - sy(c)} fill={SLATE} opacity="0.75" /> : null,
      )}
      {[h.lo, (h.lo + h.hi) / 2, h.hi].map((v, i) => (
        <text key={i} x={sx(v)} y={H - B + 12} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} fontSize="9" fontFamily={MONO} fill={SLATE}>
          {fmt(v, integer ? 0 : 2)}
        </text>
      ))}
      <line x1={sx(data.mean)} x2={sx(data.mean)} y1={TOP} y2={H - B} stroke={INK} strokeWidth="1" strokeDasharray="3 3" />
      <line x1={ox} x2={ox} y1={TOP - 4} y2={H - B} stroke={ORANGE_DARK} strokeWidth="2.5" />
      <text x={ox + (ox > W * 0.65 ? -5 : 5)} y={TOP + 4} textAnchor={ox > W * 0.65 ? 'end' : 'start'} fontSize="10" fontFamily={MONO} fill={ORANGE_DARK}>
        {t.obsMark} {fmt(data.observed, d)}
      </text>
    </svg>
  )
}

export default function NullPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [networkId, setNetworkId] = useState('karate')
  const [statId, setStatId] = useState('transitivity')
  const [nullId, setNullId] = useState('gnm')
  const [samples, setSamples] = useState(200)
  const exp = useExperiment()

  const base = useMemo(() => {
    const { net, labels } = loadNetwork(networkId)
    return { net, labels, pos: layout(net) }
  }, [networkId])

  // ---- The experiment: rerun when anything changes.
  useEffect(() => {
    exp.run(nullJob(base.net, statId, nullId, samples, NULL_SEED))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, statId, nullId, samples])
  const data = exp.data && exp.data.statId === statId && exp.data.nullId === nullId ? exp.data : null

  // ---- The drawing: a copy of the network that swaps randomise.
  const swRef = useRef(null)
  const [view, setView] = useState({ version: 0, count: 0, flash: null })
  const timer = useRef(0)
  useEffect(() => {
    swRef.current = { base, sw: swapper(base.net, mulberry32(0x5a5a)) }
    setView({ version: 0, count: 0, flash: null })
    return () => clearTimeout(timer.current)
  }, [base])

  // The swapper of the network on screen (null for the instant between a
  // change of network and the effect above).
  const current = () => (swRef.current && swRef.current.base === base ? swRef.current.sw : null)

  const watch = () => {
    const sw = current()
    if (!sw || view.flash) return
    // Find a swap that would be accepted, show the two links, then apply it.
    const probe = swapper(sw.net, mulberry32(0x77 + view.count * 31))
    const s = probe.next()
    if (!s) return
    setView((v) => ({ ...v, flash: { stage: 'before', swap: s } }))
    timer.current = setTimeout(() => {
      swRef.current = { base, sw: probe }
      setView((v) => ({ version: v.version + 1, count: v.count + 1, flash: { stage: 'after', swap: s } }))
      timer.current = setTimeout(() => setView((v) => ({ ...v, flash: null })), SWAP_MS)
    }, SWAP_MS)
  }
  const shuffle = () => {
    const sw = current()
    if (!sw || view.flash) return
    let made = 0
    for (let i = 0; i < 100; i++) if (sw.next()) made++
    setView((v) => ({ version: v.version + 1, count: v.count + made, flash: null }))
  }
  const reset = () => {
    clearTimeout(timer.current)
    swRef.current = { base, sw: swapper(base.net, mulberry32(0x5a5a)) }
    setView({ version: 0, count: 0, flash: null })
  }

  const drawing = useMemo(() => {
    const sw = current()
    const net = sw ? sw.net : base.net
    const flash = view.flash
    const hot = flash ? (flash.stage === 'before' ? flash.swap.before : flash.swap.after) : []
    const isHot = (a, b) => hot.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))
    const links = []
    // While the two old links are lit, they are still in the network.
    for (let e = 0; e < net.A.length; e++) {
      if (!isHot(net.A[e], net.B[e])) links.push({ a: net.A[e], b: net.B[e], color: 'rgba(100, 116, 139, 0.5)', width: 1.1 })
    }
    for (const [a, b] of hot) links.push({ a, b, color: flash.stage === 'before' ? ORANGE_DARK : SKY, width: 3 })
    const deg = new Int32Array(net.n)
    for (let e = 0; e < net.A.length; e++) {
      deg[net.A[e]]++
      deg[net.B[e]]++
    }
    const touched = new Set(hot.flat())
    const nodes = Array.from({ length: net.n }, (_, i) => ({
      i,
      r: Math.min(11, 3 + 1.4 * Math.sqrt(deg[i])),
      fill: touched.has(i) ? INK : SLATE,
    }))
    return { links, nodes, value: STATISTICS[statId](net) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, view, statId])

  const d = digits(statId)
  const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'
  const L = base.net.A.length
  const flash = view.flash

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.network}
          <select value={networkId} onChange={(e) => setNetworkId(e.target.value)} className={select}>
            {NETWORK_IDS.map((id) => (
              <option key={id} value={id}>
                {t.networks[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.stat}
          <select value={statId} onChange={(e) => setStatId(e.target.value)} className={select}>
            {STAT_IDS.map((id) => (
              <option key={id} value={id}>
                {t.stats[id]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.nullModel}>
          <span className="text-sm font-medium text-slate-700">{t.nullModel}</span>
          {NULL_IDS.map((id) => (
            <Pill key={id} active={nullId === id} onClick={() => setNullId(id)}>
              {t.nulls[id]}
            </Pill>
          ))}
        </div>
        <Slider label={t.samples} min={200} max={2000} step={200} value={samples} onChange={setSamples} />
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{nullId === 'gnm' ? t.howGnm : t.howDegrees(SWAPS_PER_LINK * L)}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Eyebrow>
              {t.stats[statId]} · {t.nulls[nullId]}
            </Eyebrow>
            <span className="font-mono text-xs text-slate-500" aria-live="polite">
              {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : data ? t.done(data.samples) : ''}
            </span>
          </div>
          <NullHistogram data={data} statId={statId} t={t} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label={t.observed}>{data ? fmt(data.observed, d) : '–'}</Stat>
            <Stat label={t.nullMean}>{data ? fmt(data.mean, 3) : '–'}</Stat>
            <Stat label={t.sd}>{data ? fmt(data.sd, 3) : '–'}</Stat>
            <Stat label={t.z}>{data ? fmt(data.z, 2) : '–'}</Stat>
            <Stat label={t.extreme} wide>
              {data && Number.isFinite(data.extreme) ? `${fmt(100 * data.extreme, 1)}%` : '–'}
            </Stat>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill primary onClick={watch} disabled={!!flash || L < 2}>
              {t.watch}
            </Pill>
            <Pill onClick={shuffle} disabled={!!flash || L < 2}>
              {t.shuffle}
            </Pill>
            <Pill onClick={reset} disabled={view.count === 0 && !flash}>
              {t.reset}
            </Pill>
          </div>
          <div className="mt-2">
            <NetCanvas pos={base.pos} nodes={drawing.nodes} links={drawing.links} aria={t.drawAria} maxHeight={320} />
          </div>
          <p className="mt-2 min-h-[2.5rem] text-sm text-slate-700 leading-snug" aria-live="polite">
            {flash
              ? t.swapNow(base.labels[flash.swap.before[0][0]], base.labels[flash.swap.before[0][1]], base.labels[flash.swap.before[1][0]], base.labels[flash.swap.before[1][1]])
              : t.swaps(view.count)}{' '}
            <span className="font-mono text-slate-900">
              {t.current}: {t.stats[statId].toLowerCase()} {fmt(drawing.value, d)}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
