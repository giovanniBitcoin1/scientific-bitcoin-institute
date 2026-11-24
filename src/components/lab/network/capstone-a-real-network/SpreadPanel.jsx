import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart from '../charts.jsx'
import { degreesOf } from '../who-connects-to-whom/mixing.js'
import { arrivalJob, arrivalCorrelations, flightsFrom, kmFrom, closure, topBy, BETA_DEFAULT, SPREAD_RUNS } from './capstone.js'
import MapCanvas from './MapCanvas.jsx'
import NetworkPicker from './NetworkPicker.jsx'
import useBetweenness from './useBetweenness.js'
import { useActive, positionsOf, describe, findAirport, DRAW_LIMIT } from './store.js'

// Panel C, "The map and the spread": tap a seed and watch an SI spread fill
// the map, then compare the time of arrival with flights, kilometres and
// degree; or close airports and see what is cut off. A network without
// coordinates is drawn with the force layout and has no kilometres.

const IDLE = '#cbd5e1'
const CUT = '#ea580c'
const REACHED = '#ea580c'
const DOTS = 700 // at most this many dots per small chart

const T = {
  en: {
    locale: 'en-US',
    noNet: 'Read a network in the workbench first.',
    modes: { spread: 'Spread from a seed', close: 'Close an airport' },
    modesOther: { spread: 'Spread from a seed', close: 'Close a node' },
    beta: 'Probability per link and step, β',
    tap: { spread: 'Tap a node to start from it.', close: 'Tap a node to close it (tap again to reopen), or close the first n of a ranking.' },
    find: 'Code or city',
    go: 'Find',
    tooLarge: `More than ${DRAW_LIMIT.toLocaleString('en-US')} nodes and no coordinates: not drawn.`,
    seed: 'Seed',
    step: 'Step',
    reached: 'Reached',
    running: 'Computing…',
    replay: 'Replay',
    corr: `Mean time of arrival over ${SPREAD_RUNS} runs, rank correlation with:`,
    flights: 'distance in flights',
    links: 'distance in links',
    km: 'distance in km',
    degree: 'degree',
    arrival: 'mean arrival (steps)',
    n: 'How many, n',
    byDegree: 'Close the first n by degree',
    byBetweenness: 'Close the first n by betweenness',
    reopen: 'Reopen all',
    closed: 'Closed',
    cut: 'Cut off',
    left: 'Largest component left',
    cutList: 'Cut off: ',
    more: (m) => ` and ${m} more`,
    aria: { map: 'The network, with the nodes reached by the spread or cut off by the closures coloured', flights: 'Mean arrival time against distance in links', km: 'Mean arrival time against distance in kilometres', degree: 'Mean arrival time against degree' },
  },
  it: {
    locale: 'it-IT',
    noNet: 'Prima leggi una rete nel banco di lavoro.',
    modes: { spread: 'Contagio da un seme', close: 'Chiudi un aeroporto' },
    modesOther: { spread: 'Contagio da un seme', close: 'Chiudi un nodo' },
    beta: 'Probabilità per collegamento e passo, β',
    tap: { spread: 'Tocca un nodo per partire da lì.', close: 'Tocca un nodo per chiuderlo (toccalo di nuovo per riaprirlo), oppure chiudi i primi n di una classifica.' },
    find: 'Codice o città',
    go: 'Trova',
    tooLarge: `Più di ${DRAW_LIMIT.toLocaleString('it-IT')} nodi e nessuna coordinata: non disegnata.`,
    seed: 'Seme',
    step: 'Passo',
    reached: 'Raggiunti',
    running: 'Calcolo in corso…',
    replay: 'Rivedi',
    corr: `Tempo medio di arrivo su ${SPREAD_RUNS} prove, correlazione di rango con:`,
    flights: 'distanza in voli',
    links: 'distanza in collegamenti',
    km: 'distanza in km',
    degree: 'grado',
    arrival: 'arrivo medio (passi)',
    n: 'Quanti, n',
    byDegree: 'Chiudi i primi n per grado',
    byBetweenness: 'Chiudi i primi n per betweenness',
    reopen: 'Riapri tutto',
    closed: 'Chiusi',
    cut: 'Tagliati fuori',
    left: 'Componente più grande rimasta',
    cutList: 'Tagliati fuori: ',
    more: (m) => ` e altri ${m}`,
    aria: { map: 'La rete, con i nodi raggiunti dal contagio o tagliati fuori dalle chiusure in colore', flights: 'Tempo medio di arrivo rispetto alla distanza in collegamenti', km: 'Tempo medio di arrivo rispetto alla distanza in chilometri', degree: 'Tempo medio di arrivo rispetto al grado' },
  },
}

export default function SpreadPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const entry = useActive()
  const g = entry.giant
  const geo = !!(g && g.geo)
  const [mode, setMode] = useState('spread')
  const [beta, setBeta] = useState(BETA_DEFAULT)
  const [picked, setPicked] = useState({ key: null, seed: -1, closed: [] })
  const [n, setN] = useState(10)
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const exp = useExperiment()
  const bc = useBetweenness(entry)
  const mine = picked.key === entry.key
  const seed = mine ? picked.seed : -1
  const closed = mine ? picked.closed : []
  const num = (v, d = 2) => (v != null && Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const int = (v) => Math.round(v).toLocaleString(t.locale)

  const pos = useMemo(() => positionsOf(entry), [entry])
  const k = useMemo(() => (g ? degreesOf(g) : null), [g])
  const radii = useMemo(() => {
    if (!k) return null
    let max = 1
    for (const x of k) if (x > max) max = x
    return Float64Array.from(k, (x) => (geo ? 0.8 + 3.2 * Math.sqrt(x / max) : 3 + 5 * Math.sqrt(x / max)))
  }, [k, geo])

  const run = exp.data && exp.data.tag === `${entry.key}/${seed}/${beta}` ? exp.data : null
  const done = !!(run && run.done && !exp.running)
  const start = (v, b = beta) => {
    setPicked({ key: entry.key, seed: v, closed: [] })
    setStep(0)
    if (v < 0) return
    const job = arrivalJob(g, v, b)
    const tag = `${entry.key}/${v}/${b}`
    exp.run({ iter: job.iter, snapshot: () => ({ ...job.snapshot(), tag }) })
  }
  // the first run, replayed step by step
  useEffect(() => {
    if (!done || step >= run.steps) return undefined
    const id = setTimeout(() => setStep((s) => Math.min(run.steps, s + Math.max(1, Math.ceil(run.steps / 60)))), 90)
    return () => clearTimeout(id)
  }, [done, step, run])

  const stats = useMemo(() => {
    if (!done) return null
    const corr = arrivalCorrelations(g, seed, run.mean)
    const flights = flightsFrom(g, seed)
    const km = geo ? kmFrom(g, seed) : null
    const every = Math.max(1, Math.ceil(g.n / DOTS))
    const pts = { flights: [], km: [], degree: [] }
    let maxT = 1
    let maxF = 1
    for (let v = 0; v < g.n; v += every) {
      if (v === seed || !Number.isFinite(run.mean[v])) continue
      pts.flights.push([flights[v], run.mean[v]])
      pts.degree.push([k[v], run.mean[v]])
      if (km) pts.km.push([km[v], run.mean[v]])
      maxT = Math.max(maxT, run.mean[v])
      maxF = Math.max(maxF, flights[v])
    }
    return { corr, pts, maxT: Math.ceil(maxT / 10) * 10, maxF }
  }, [done, run, g, seed, geo, k])

  const shut = useMemo(() => (g && closed.length ? closure(g, closed) : null), [g, closed])

  const colors = useMemo(() => {
    if (!g) return null
    const out = new Array(g.n).fill(IDLE)
    if (mode === 'spread' && done) for (let v = 0; v < g.n; v++) if (run.first[v] >= 0 && run.first[v] <= step) out[v] = REACHED
    if (mode === 'close' && shut) {
      for (const v of shut.cut) out[v] = CUT
      for (const v of closed) out[v] = INK
    }
    return out
  }, [g, mode, done, run, step, shut, closed])
  const rings = useMemo(() => (mode === 'spread' && seed >= 0 ? [{ v: seed, color: INK }] : mode === 'close' ? closed.slice(0, 60).map((v) => ({ v, color: INK })) : []), [mode, seed, closed])

  if (!g)
    return (
      <div>
        <NetworkPicker lang={lang} active={entry} />
        <p className="mt-3 text-sm text-slate-600">{t.noNet}</p>
      </div>
    )

  const setClosed = (list) => setPicked({ key: entry.key, seed: -1, closed: list })
  const tap = (v) => {
    if (v < 0) return
    if (mode === 'spread') start(v)
    else setClosed(closed.includes(v) ? closed.filter((x) => x !== v) : [...closed, v])
  }
  const find = (e) => {
    e.preventDefault()
    const o = findAirport(query)
    if (o >= 0 && g.map[o] >= 0) tap(g.map[o])
  }
  const reachedNow = done ? run.first.reduce((a, w) => a + (w >= 0 && w <= step ? 1 : 0), 0) : 0
  const maxN = Math.max(1, Math.min(50, g.n - 2))
  const modes = entry.id === 'airports' ? t.modes : t.modesOther
  const small = (id, label, x, rho) => (
    <div className="min-w-0" key={id}>
      <Chart x={x} y={{ min: 0, max: stats.maxT, ticks: [0, stats.maxT / 2, stats.maxT], label: id === 'flights' ? t.arrival : undefined, labelSide: 'left' }} height={140} aria={t.aria[id]} series={[{ points: stats.pts[id], color: ORANGE_DARK, line: false, dots: 1.3, opacity: 0.7 }]} />
      <p className="text-xs text-slate-600">{`${label}: `}<span className="font-mono text-slate-900">{num(rho, 2)}</span></p>
    </div>
  )
  const logTicks = (max) => (max >= 100 ? [1, 10, 100] : max >= 10 ? [1, 10] : [1, Math.max(2, max)])
  const kMax = k.reduce((a, x) => Math.max(a, x), 1)

  return (
    <div>
      <NetworkPicker lang={lang} active={entry} />
      <div className="mt-3 flex flex-wrap gap-2">
        {['spread', 'close'].map((id) => (
          <Pill key={id} active={mode === id} onClick={() => setMode(id)} data-mode={id}>
            {modes[id]}
          </Pill>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.tap[mode]}</p>

      <div className="mt-2" data-map="spread">
        {pos ? <MapCanvas pos={pos} radii={radii} colors={colors} rings={rings} wrap={geo} onTap={tap} ratio={geo ? 0.46 : 0.7} maxHeight={geo ? 300 : 320} aria={t.aria.map} /> : <p className="text-sm text-slate-600">{t.tooLarge}</p>}
      </div>
      {entry.id === 'airports' && (
        <form onSubmit={find} className="mt-2 flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.find} aria-label={t.find} data-find="text" className="w-36 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-800" />
          <Pill type="submit" data-find="go">
            {t.go}
          </Pill>
        </form>
      )}

      {mode === 'spread' && (
        <div className="mt-3" data-readout="spread" data-net={entry.id} data-seed={seed >= 0 ? g.names[seed] : ''} data-done={done ? '1' : '0'} data-beta={beta} data-steps={done ? run.steps : ''} data-flights={stats ? num(stats.corr.flights, 2) : ''} data-km={stats && stats.corr.km != null ? num(stats.corr.km, 2) : ''} data-degree={stats ? num(stats.corr.degree, 2) : ''}>
          <div className="max-w-xs">
            <Slider label={t.beta} min={0.02} max={0.5} step={0.01} value={beta} onChange={(v) => { const b = Math.round(v * 100) / 100; setBeta(b); if (seed >= 0) start(seed, b) }} format={(v) => num(v, 2)} />
          </div>
          {seed >= 0 && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label={t.seed} wide>{describe(entry, seed)}</Stat>
              <Stat label={t.step}>{done ? `${step} / ${run.steps}` : '–'}</Stat>
              <Stat label={t.reached}>{done ? int(reachedNow) : '–'}</Stat>
            </div>
          )}
          {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
          {done && (
            <div className="mt-2">
              <Pill onClick={() => setStep(0)} data-action="replay">
                {t.replay}
              </Pill>
            </div>
          )}
          {stats && (
            <div className="mt-3">
              <Eyebrow>{t.corr}</Eyebrow>
              <div className={`mt-1 grid gap-4 ${geo ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {small('flights', geo ? t.flights : t.links, { min: 0, max: stats.maxF + 1, ticks: Array.from({ length: stats.maxF + 1 }, (_, i) => i).filter((i) => stats.maxF <= 6 || i % 2 === 0) }, stats.corr.flights)}
                {geo && small('km', t.km, { min: 0, max: 20000, ticks: [0, 5000, 10000, 15000], format: (v) => int(v) }, stats.corr.km)}
                {small('degree', t.degree, { min: 1, max: 10 ** Math.ceil(Math.log10(Math.max(2, kMax))), log: true, ticks: logTicks(kMax) }, stats.corr.degree)}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'close' && (
        <div className="mt-3" data-readout="closure" data-net={entry.id} data-closed={closed.map((v) => g.names[v]).join(' ')} data-cut={shut ? shut.cut.length : 0} data-left={shut ? num(shut.left, 3) : ''}>
          <div className="max-w-xs">
            <Slider label={t.n} min={1} max={maxN} step={1} value={Math.min(n, maxN)} onChange={setN} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill onClick={() => setClosed(topBy(k, Math.min(n, maxN)))} data-action="by-degree">
              {t.byDegree}
            </Pill>
            <Pill onClick={() => (bc.values ? setClosed(topBy(bc.values, Math.min(n, maxN))) : bc.request())} disabled={bc.running} data-action="by-betweenness">
              {t.byBetweenness}
            </Pill>
            <Pill onClick={() => setClosed([])} disabled={!closed.length} data-action="reopen">
              {t.reopen}
            </Pill>
            {bc.running && <span className="font-mono text-xs text-slate-500">{`${t.running} ${Math.round(bc.progress * 100)}%`}</span>}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 max-w-xl">
            <Stat label={t.closed}>{int(closed.length)}</Stat>
            <Stat label={t.cut}>
              <span style={{ color: ORANGE_DARK }}>{int(shut ? shut.cut.length : 0)}</span>
            </Stat>
            <Stat label={t.left}>{shut ? num(shut.left, 3) : num(1, 3)}</Stat>
          </div>
          {closed.length > 0 && closed.length <= 3 && <p className="mt-2 text-xs text-slate-600 leading-snug">{closed.map((v) => describe(entry, v)).join('; ')}</p>}
          {shut && shut.cut.length > 0 && (
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              {t.cutList}
              {shut.cut.slice(0, 30).map((v) => g.names[v]).join(', ')}
              {shut.cut.length > 30 ? t.more(shut.cut.length - 30) : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
