import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { overloadNet, cascadeJob, sweepAlphaJob, B_DEFAULT, B_SIZES, B_RUNS, B_MEAN_K } from './experiments.js'

// Panel B, "Overload": Motter and Lai's cascade. Every node can carry (1 + α)
// times its load in the intact network; one node is removed, the loads are
// computed again, whatever is above its capacity fails, and so on.

const T = {
  en: {
    sources: { pa: 'Preferential attachment', poisson: 'Random network' },
    N: 'Nodes, N',
    alpha: 'Tolerance α',
    triggers: { top: 'Remove the node of highest load', random: `Remove a random node (${B_RUNS} runs)` },
    note: `Mean degree ${B_MEAN_K}. The load of a node is the number of shortest paths that pass through it or end at it (when several are equally short, each counts for its share). Capacity = (1 + α) × the load in the intact network. After every round the loads of what is left are computed again, and every node above its capacity fails at once.`,
    top: (v, k, load, mean) => `Highest load: node ${v}, degree ${k}, load ${load}; the mean load is ${mean}.`,
    G: 'Largest component at the end, G',
    rounds: 'Rounds',
    failed: 'Nodes failed, trigger included',
    mean: (n) => `mean of ${n} runs`,
    running: 'Computing…',
    sweep: 'Sweep α',
    sweepNote: 'G at α = 0, 0.1, …, 1 for both triggers. About five seconds at 400 nodes, half a minute at 1,000.',
    chart: 'G against the tolerance',
    legendTop: 'highest load removed',
    legendRandom: `random node (mean of ${B_RUNS})`,
    drawNote: (random) => `${random ? 'The first of the runs. ' : ''}Orange ring: the node removed. Orange: failed by overload. Dark: still working, in the largest component. Grey: still working, cut off.`,
    aria: 'The network after the cascade: failed nodes, working nodes in the largest component and working nodes cut off',
    ariaChart: 'Final share of nodes in the largest component against the tolerance, for the two triggers',
    locale: 'en-US',
  },
  it: {
    sources: { pa: 'Aggancio preferenziale', poisson: 'Rete casuale' },
    N: 'Nodi, N',
    alpha: 'Tolleranza α',
    triggers: { top: 'Togli il nodo di carico più alto', random: `Togli un nodo a caso (${B_RUNS} prove)` },
    note: `Grado medio ${B_MEAN_K}. Il carico di un nodo è il numero di cammini minimi che lo attraversano o che vi terminano (quando più cammini sono ugualmente brevi, ciascuno conta per la sua quota). Capacità = (1 + α) × il carico nella rete intatta. Dopo ogni turno i carichi di ciò che resta sono ricalcolati, e ogni nodo sopra la sua capacità si guasta insieme agli altri.`,
    top: (v, k, load, mean) => `Carico più alto: nodo ${v}, grado ${k}, carico ${load}; il carico medio è ${mean}.`,
    G: 'Componente più grande alla fine, G',
    rounds: 'Turni',
    failed: 'Nodi guasti, innesco compreso',
    mean: (n) => `media di ${n} prove`,
    running: 'Calcolo in corso…',
    sweep: 'Scorri α',
    sweepNote: 'G per α = 0, 0,1, …, 1 con entrambi gli inneschi. Circa cinque secondi con 400 nodi, mezzo minuto con 1.000.',
    chart: 'G al variare della tolleranza',
    legendTop: 'tolto il carico più alto',
    legendRandom: `nodo a caso (media di ${B_RUNS})`,
    drawNote: (random) => `${random ? 'La prima delle prove. ' : ''}Anello arancione: il nodo tolto. Arancione: guasti per sovraccarico. Scuro: ancora in funzione, nella componente più grande. Grigio: ancora in funzione, tagliati fuori.`,
    aria: 'La rete dopo la cascata: nodi guasti, nodi in funzione nella componente più grande e nodi in funzione tagliati fuori',
    ariaChart: 'Quota finale di nodi nella componente più grande al variare della tolleranza, per i due inneschi',
    locale: 'it-IT',
  },
}

// Three decimals, rounded as the page's own numbers are (0.0075 → 0.008).
const r3 = (v) => (Math.round(v * 1000 + 1e-9) / 1000).toFixed(3)

export default function OverloadPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(B_DEFAULT.source)
  const [sizeIdx, setSizeIdx] = useState(B_SIZES.indexOf(B_DEFAULT.N))
  const [alpha, setAlpha] = useState(B_DEFAULT.alpha)
  const [trigger, setTrigger] = useState(B_DEFAULT.trigger)
  const N = B_SIZES[sizeIdx]
  const on = useMemo(() => overloadNet({ source, N }), [source, N])
  const pos = useMemo(() => {
    const random = mulberry32(11 + N)
    const start = Float64Array.from({ length: 2 * N }, () => random())
    return fitUnit(forceLayout(N, on.net.A, on.net.B, on.net.A.length, start, 0.1, N > 600 ? 80 : 140), N)
  }, [on, N])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(cascadeJob(on, alpha, trigger))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, alpha, trigger])
  const d = exp.data && exp.data.done && exp.data.n === N && exp.data.source === source && exp.data.alpha === alpha && exp.data.trigger === trigger && !exp.running ? exp.data : null
  const sw = useExperiment()
  const [swKey, setSwKey] = useState('')
  const key = `${source}-${N}`
  const sweep = swKey === key && sw.data ? sw.data : null

  const pic = useMemo(() => {
    if (!d || !d.first) return null
    const { failedRound, inGiant } = d.first
    const up = (v) => failedRound[v] < 0
    const links = []
    for (let e = 0; e < on.net.A.length; e++) {
      const a = on.net.A[e]
      const b = on.net.B[e]
      const ok = up(a) && up(b)
      links.push({ a, b, color: ok ? 'rgba(100, 116, 139, 0.5)' : 'rgba(226, 232, 240, 0.9)', width: ok ? 0.8 : 0.5 })
    }
    links.sort((x, y) => (x.width > y.width ? 1 : x.width < y.width ? -1 : 0))
    const big = on.k.reduce((m, x) => Math.max(m, x), 1)
    const nodes = []
    for (let v = 0; v < N; v++) {
      const r = 1.4 + 4.5 * Math.sqrt(on.k[v] / big)
      if (failedRound[v] === 0) nodes.push({ i: v, r: r + 1.5, fill: '#ffffff', stroke: ORANGE_DARK, lineWidth: 2.5 })
      else if (failedRound[v] > 0) nodes.push({ i: v, r, fill: ORANGE_DARK })
      else nodes.push({ i: v, r, fill: inGiant[v] ? INK : MUTED })
    }
    return { links, nodes }
  }, [d, on, N])
  const mean = on.load0.reduce((s, x) => s + x, 0) / N

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['pa', 'poisson'].map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.N} min={0} max={B_SIZES.length - 1} step={1} value={sizeIdx} onChange={(v) => setSizeIdx(Math.round(v))} format={(v) => B_SIZES[Math.round(v)].toLocaleString(t.locale)} />
        <Slider label={t.alpha} min={0} max={1} step={0.05} value={alpha} onChange={(v) => setAlpha(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {['top', 'random'].map((id) => (
          <Pill key={id} active={trigger === id} onClick={() => setTrigger(id)} data-trigger={id}>
            {t.triggers[id]}
          </Pill>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
      <p className="mt-1 font-mono text-xs text-slate-600">{t.top(on.top, on.k[on.top], Math.round(on.load0[on.top]).toLocaleString(t.locale), Math.round(mean).toLocaleString(t.locale))}</p>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div
        className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
        data-readout="overload"
        data-done={d ? '1' : '0'}
        data-alpha={alpha}
        data-trigger={trigger}
        data-g={d ? r3(d.G) : ''}
        data-rounds={d ? d.rounds.toFixed(2) : ''}
        data-failed={d ? d.failed.toFixed(2) : ''}
      >
        <Stat label={t.G}>
          <span style={{ color: ORANGE_DARK }}>{d ? num(d.G, 3) : '–'}</span>
          {d && trigger === 'random' ? ` · ${t.mean(d.runs)}` : ''}
        </Stat>
        <Stat label={t.rounds}>{d ? num(d.rounds, trigger === 'random' ? 2 : 0) : '–'}</Stat>
        <Stat label={t.failed}>{d ? num(d.failed, trigger === 'random' ? 2 : 0) : '–'}</Stat>
      </div>

      {pic && (
        <div className="mt-4 max-w-xl">
          <NetCanvas pos={pos} nodes={pic.nodes} links={pic.links} aria={t.aria} maxHeight={340} />
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.drawNote(trigger === 'random')}</p>
        </div>
      )}

      <div className="mt-6">
        <Eyebrow>{t.chart}</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <Pill
            primary
            disabled={sw.running}
            onClick={() => {
              setSwKey(key)
              sw.run(sweepAlphaJob(on))
            }}
            data-action="sweep-alpha"
          >
            {t.sweep}
          </Pill>
          {sw.running && swKey === key && <span className="font-mono text-xs text-slate-500">{`${t.running} ${Math.round(sw.progress * 100)}%`}</span>}
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-snug">{t.sweepNote}</p>
        {sweep && sweep.rows.length > 0 && (
          <div
            className="mt-3 max-w-xl"
            data-readout="sweep"
            data-done={sweep.done && !sw.running ? '1' : '0'}
            data-top={sweep.rows.map((r) => r3(r.top)).join(' ')}
            data-random={sweep.rows.map((r) => r3(r.random)).join(' ')}
            data-rounds={sweep.rows.map((r) => r.roundsTop).join(' ')}
          >
            <Chart
              x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: 'α', format: (v) => num(v, 1) }}
              y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: 'G', labelSide: 'left', format: (v) => num(v, 2) }}
              height={180}
              aria={t.ariaChart}
              marks={[{ x: alpha, color: MUTED, dashed: true }]}
              series={[
                { points: sweep.rows.map((r) => [r.alpha, r.random]), color: SLATE, width: 1.6, dots: 2, dashed: true },
                { points: sweep.rows.map((r) => [r.alpha, r.top]), color: ORANGE_DARK, width: 1.8, dots: 2 },
              ]}
            />
            <Legend items={[{ label: t.legendTop, color: ORANGE_DARK }, { label: t.legendRandom, color: SLATE, dashed: true }]} />
            <p className="mt-1 font-mono text-xs text-slate-600">{`G: ${sweep.rows.map((r) => `α ${num(r.alpha, 1)}: ${num(r.top, 2)} / ${num(r.random, 2)}`).join(' · ')}`}</p>
          </div>
        )}
      </div>
    </div>
  )
}
