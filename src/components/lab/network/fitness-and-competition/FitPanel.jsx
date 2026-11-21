import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { fitnessRun, fitnessJob, FIT_DEFAULT, FIT_RUNS, FIT_M } from './experiments.js'

// Panel A, "The fit get rich": growth with attachment ∝ η_i k_i, m = 2.
// One run in detail (six tracked nodes, degree against fitness and birth
// order, the CCDF, fitness read from the growth), then twenty runs: who ends
// up in the lead.

const KINDS = ['equal', 'uniform', 'exponential', 'two']
const COLORS = ['#0f172a', '#475569', '#94a3b8', ORANGE_DARK, '#0284c7', '#7c3aed']

const T = {
  en: {
    kinds: { equal: 'All equal', uniform: 'Uniform', exponential: 'Exponential', two: 'Two values' },
    N: 'Nodes, N',
    scale: 'Scale of the exponential',
    share: 'Share with η = 1',
    a: 'Fitness of the others, a',
    grow: 'Grow',
    rerun: `Rerun ${FIT_RUNS} times`,
    stop: 'Stop',
    running: 'Growing…',
    run: (r) => `Run ${r}`,
    C: 'C',
    barely: 'just above 1',
    leader: 'Final leader',
    fittest: 'Fittest node',
    fitter: 'Nodes fitter than the leader',
    changes: 'Lead changes',
    corr: 'Slope against η/C, correlation',
    corrEarly: 'born before step 100',
    nodeLine: (v, eta, k) => `${v}, η ${eta}, k ${k}`,
    born: (v) => `node ${v}`,
    histories: 'Degree of six nodes as the network grows',
    size: 'network size',
    byFitness: 'Degree against fitness',
    byBirth: 'Degree against birth order',
    ccdf: 'Degree distribution, CCDF',
    slopeC: (c) => `slope −C = −${c}`,
    estimate: 'Fitness read from growth',
    estimateNote: (n) => `Slope of ln k against ln t over the second half of the growth, against η/C, for the ${n} nodes born in the first half whose degree had at least doubled by then. Dashed: equal.`,
    meanField: 'dashed: mean field',
    oldest: 'oldest',
    fittestTag: 'fittest',
    late: 'latecomer',
    table: 'Over the runs',
    rows: {
      fittest: 'Leader has the highest fitness',
      oldest: 'Leader among the ten oldest',
      fitter: 'Nodes fitter than the leader (median, range)',
      changes: 'Lead changes (median, range)',
    },
    of: (a, b) => `${a} of ${b}`,
    equalNote: 'All nodes have η = 1: this is module 06, with C = 2.',
    ariaHist: 'Degree of the tracked nodes against network size, on logarithmic axes, with mean-field lines',
    ariaFit: 'Degree of each node against its fitness',
    ariaBirth: 'Degree of each node against its birth order on logarithmic axes',
    ariaCcdf: 'Complementary cumulative degree distribution on logarithmic axes',
    ariaEst: 'Measured growth exponent of each node against its fitness divided by C',
    locale: 'en-US',
  },
  it: {
    kinds: { equal: 'Tutti uguali', uniform: 'Uniforme', exponential: 'Esponenziale', two: 'Due valori' },
    N: 'Nodi, N',
    scale: "Scala dell'esponenziale",
    share: 'Quota con η = 1',
    a: 'Fitness degli altri, a',
    grow: 'Fai crescere',
    rerun: `Rifai ${FIT_RUNS} volte`,
    stop: 'Ferma',
    running: 'Crescita in corso…',
    run: (r) => `Corsa ${r}`,
    C: 'C',
    barely: 'appena sopra 1',
    leader: 'Leader finale',
    fittest: 'Nodo più adatto',
    fitter: 'Nodi più adatti del leader',
    changes: 'Cambi di leader',
    corr: 'Pendenza contro η/C, correlazione',
    corrEarly: 'nati prima del passo 100',
    nodeLine: (v, eta, k) => `${v}, η ${eta}, k ${k}`,
    born: (v) => `nodo ${v}`,
    histories: 'Grado di sei nodi mentre la rete cresce',
    size: 'dimensione della rete',
    byFitness: 'Grado e fitness',
    byBirth: 'Grado e ordine di nascita',
    ccdf: 'Distribuzione dei gradi, CCDF',
    slopeC: (c) => `pendenza −C = −${c}`,
    estimate: 'La fitness letta dalla crescita',
    estimateNote: (n) => `Pendenza di ln k contro ln t nella seconda metà della crescita, al variare di η/C, per i ${n} nodi nati nella prima metà il cui grado a quel punto era almeno raddoppiato. Tratteggiata: uguaglianza.`,
    meanField: 'tratteggiate: campo medio',
    oldest: 'il più vecchio',
    fittestTag: 'il più adatto',
    late: 'ultimo arrivato',
    table: 'Sulle corse',
    rows: {
      fittest: 'Il leader ha la fitness più alta',
      oldest: 'Il leader è tra i dieci più vecchi',
      fitter: 'Nodi più adatti del leader (mediana, intervallo)',
      changes: 'Cambi di leader (mediana, intervallo)',
    },
    of: (a, b) => `${a} su ${b}`,
    equalNote: 'Tutti i nodi hanno η = 1: è il modulo 06, con C = 2.',
    ariaHist: 'Grado dei nodi seguiti al variare della dimensione della rete, su assi logaritmici, con le rette di campo medio',
    ariaFit: 'Grado di ogni nodo al variare della sua fitness',
    ariaBirth: 'Grado di ogni nodo al variare del suo ordine di nascita, su assi logaritmici',
    ariaCcdf: 'Distribuzione cumulativa complementare dei gradi su assi logaritmici',
    ariaEst: 'Esponente di crescita misurato di ogni nodo al variare della sua fitness divisa per C',
    locale: 'it-IT',
  },
}

const decadeTicks = (max) => {
  const out = []
  for (let v = 1; v <= max * 1.0001; v *= 10) out.push(v)
  return out
}

export default function FitPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [kind, setKind] = useState(FIT_DEFAULT.kind)
  const [N, setN] = useState(FIT_DEFAULT.N)
  const [scale, setScale] = useState(FIT_DEFAULT.scale)
  const [share, setShare] = useState(FIT_DEFAULT.share)
  const [a, setA] = useState(FIT_DEFAULT.a)
  const [run, setRun] = useState(0)
  const exp = useExperiment()
  const params = useMemo(() => ({ kind, N, scale, share, a }), [kind, N, scale, share, a])
  const key = `${kind}|${N}|${scale}|${share}|${a}`
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })

  useEffect(() => {
    setRun(0)
    exp.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const one = useMemo(() => fitnessRun(params, run), [params, run])
  const { net, C, tracked, sizes } = one
  const equal = kind === 'equal'
  // an exponential of small scale leaves C above 1 by less than any digit shown
  const Ctext = C - 1 < 5e-4 ? `≈ 1 (${t.barely})` : dec(C, 3)

  const kMax = 10 ** Math.ceil(Math.log10(Math.max(10, net.deg[net.leader])))
  const nTop = 10 ** Math.ceil(Math.log10(N))
  const hist = tracked.nodes.map((v, j) => ({
    v,
    color: COLORS[j],
    points: sizes.map((s, i) => [s, one.net.history[j][i]]).filter((p) => Number.isFinite(p[1])),
    mf: sizes.filter((s) => s > v).map((s) => [s, FIT_M * (s / (v + 1)) ** (net.eta[v] / C)]),
  }))
  // at most ~1,500 dots per scatter: every node by birth on a log grid, a stride by fitness
  const sample = useMemo(() => {
    const ids = new Set()
    for (let j = 0; j <= 400; j++) ids.add(Math.min(N - 1, Math.round(10 ** ((j / 400) * Math.log10(N - 1)))))
    ids.add(0)
    const stride = Math.max(1, Math.floor(N / 1100))
    const byFit = []
    for (let v = 0; v < N; v += stride) byFit.push(v)
    return { birth: [...ids].sort((x, y) => x - y), fit: byFit }
  }, [N])
  const fitDots = sample.fit.map((v) => [net.eta[v], net.deg[v]])
  const birthDots = sample.birth.map((v) => [v + 1, net.deg[v]])
  const yMinCcdf = 10 ** -Math.ceil(Math.log10(N))
  const uniform = kind === 'uniform'
  const kEnd = Math.min(kMax, FIT_M * yMinCcdf ** (-1 / C))
  const slopeLine = uniform ? [[FIT_M, 1], [kEnd, (kEnd / FIT_M) ** -C]] : []
  const est = one.slopes.map((x) => [x.theory, x.slope])
  const estMax = Math.max(1, ...est.map((p) => p[0]))

  const data = exp.data && exp.data.params && `${exp.data.params.kind}|${exp.data.params.N}|${exp.data.params.scale}|${exp.data.params.share}|${exp.data.params.a}` === key ? exp.data : null
  const done = !!data && data.runs.length === data.wanted && !exp.running
  const sum = data && data.summary
  const role = (r) => (r === 'old' ? t.oldest : r === 'fittest' ? t.fittestTag : t.late)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Pill key={k} active={kind === k} onClick={() => setKind(k)} data-kind={k}>
            {t.kinds[k]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Slider label={t.N} min={1000} max={20000} log value={N} onChange={(v) => setN(Math.round(v / 500) * 500)} format={(v) => int(v)} />
        {kind === 'exponential' && <Slider label={t.scale} min={0.05} max={1} step={0.05} value={scale} onChange={(v) => setScale(Math.round(v * 100) / 100)} format={(v) => dec(v, 2)} />}
        {kind === 'two' && <Slider label={t.share} min={0.01} max={0.5} step={0.01} value={share} onChange={(v) => setShare(Math.round(v * 100) / 100)} format={(v) => `${dec(100 * v, 0)}%`} />}
        {kind === 'two' && <Slider label={t.a} min={0.05} max={0.95} step={0.05} value={a} onChange={(v) => setA(Math.round(v * 100) / 100)} format={(v) => dec(v, 2)} />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill onClick={() => setRun((r) => r + 1)} data-action="grow">
          {t.grow}
        </Pill>
        {exp.running ? (
          <Pill onClick={exp.cancel}>{t.stop}</Pill>
        ) : (
          <Pill primary onClick={() => exp.run(fitnessJob(params))} data-action="rerun">
            {t.rerun}
          </Pill>
        )}
        <span className="font-mono text-xs text-slate-500" aria-live="polite">
          {exp.running ? `${t.running} ${Math.round(exp.progress * 100)}%` : t.run(run + 1)}
        </span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0 space-y-4">
          <div
            className="grid grid-cols-2 gap-2"
            data-readout="run"
            data-c={C.toFixed(4)}
            data-leader={net.leader}
            data-leader-deg={net.deg[net.leader]}
            data-fittest={net.fittest}
            data-fitter={net.fitter}
            data-changes={net.changes}
            data-corr={Number.isFinite(one.corr) ? one.corr.toFixed(3) : ''}
            data-corr-early={Number.isFinite(one.corrEarly) ? one.corrEarly.toFixed(3) : ''}
          >
            <Stat label={t.C}>{Ctext}</Stat>
            <Stat label={t.changes}>{int(net.changes)}</Stat>
            <Stat label={t.leader}>{t.nodeLine(t.born(int(net.leader + 1)), dec(net.eta[net.leader], 2), int(net.deg[net.leader]))}</Stat>
            <Stat label={t.fittest}>{equal ? '–' : t.nodeLine(t.born(int(net.fittest + 1)), dec(net.eta[net.fittest], 2), int(net.deg[net.fittest]))}</Stat>
            <Stat label={t.fitter}>{equal ? '–' : int(net.fitter)}</Stat>
            <Stat label={t.corr}>
              {equal ? '–' : `${dec(one.corr, 2)}; ${t.corrEarly}: ${dec(one.corrEarly, 2)}`}
            </Stat>
          </div>
          {equal && <p className="text-xs text-slate-500">{t.equalNote}</p>}
          <div>
            <Eyebrow>{t.histories}</Eyebrow>
            <Chart
              x={{ min: 1, max: nTop, log: true, ticks: decadeTicks(nTop), label: t.size }}
              y={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: 'k', labelSide: 'left' }}
              height={170}
              aria={t.ariaHist}
              series={[...hist.map((h) => ({ points: h.mf, color: h.color, dashed: true, width: 1, opacity: 0.6 })), ...hist.map((h) => ({ points: h.points, color: h.color, width: 1.8 }))]}
            />
            <Legend items={hist.map((h, j) => ({ label: `${t.born(int(h.v + 1))} (${role(tracked.roles[j])}, η ${dec(net.eta[h.v], 2)})`, color: h.color }))} />
            <p className="mt-1 text-xs text-slate-500">{t.meanField}</p>
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <div>
            <Eyebrow>{t.byFitness}</Eyebrow>
            <Chart
              x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: 'η', format: (v) => dec(v, 1) }}
              y={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax) }}
              height={130}
              aria={t.ariaFit}
              series={[{ points: fitDots, color: ORANGE_DARK, dots: 1.3, line: false, opacity: 0.6 }]}
            />
          </div>
          <div>
            <Eyebrow>{t.byBirth}</Eyebrow>
            <Chart
              x={{ min: 1, max: nTop, log: true, ticks: decadeTicks(nTop) }}
              y={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax) }}
              height={130}
              aria={t.ariaBirth}
              series={[{ points: birthDots, color: ORANGE_DARK, dots: 1.4, line: false }]}
            />
          </div>
          <div>
            <Eyebrow>{t.ccdf}</Eyebrow>
            <Chart
              x={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: 'k' }}
              y={{ min: yMinCcdf, max: 1, log: true, ticks: decadeTicks(1 / yMinCcdf).map((v) => 1 / v).reverse(), label: 'P(K ≥ k)', labelSide: 'left' }}
              height={140}
              aria={t.ariaCcdf}
              series={[...(uniform ? [{ points: slopeLine, color: MUTED, dashed: true, width: 1.3 }] : []), { points: one.ccdf, color: ORANGE_DARK, dots: 1.6, line: false }]}
            />
            {uniform && <Legend items={[{ label: t.slopeC(dec(C, 3)), color: MUTED, dashed: true }]} />}
          </div>
          {!equal && (
            <div>
              <Eyebrow>{t.estimate}</Eyebrow>
              <Chart
                x={{ min: 0, max: estMax, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1].filter((v) => v <= estMax), label: 'η/C', format: (v) => dec(v, 1) }}
                y={{ min: -0.4, max: 1.4, ticks: [-0.4, 0, 0.4, 0.8, 1.2], format: (v) => dec(v, 1) }}
                height={140}
                aria={t.ariaEst}
                series={[
                  { points: [[0, 0], [estMax, estMax]], color: INK, dashed: true, width: 1.2 },
                  { points: est, color: ORANGE_DARK, dots: 1.3, line: false, opacity: 0.55 },
                ]}
              />
              <p className="mt-1 text-xs text-slate-500 leading-snug">{t.estimateNote(int(est.length))}</p>
            </div>
          )}
        </div>
      </div>

      {sum && (
        <div className="mt-6">
          <Eyebrow>
            {t.table}: {sum.count}
          </Eyebrow>
          <table className="mt-2 w-full text-sm" data-readout="twenty" data-done={done ? '1' : '0'} data-fittest={sum.fittest} data-oldest={sum.oldest} data-fitter={sum.fitterMedian} data-changes={sum.changesMedian}>
            <tbody>
              {[
                ['fittest', equal ? '–' : t.of(sum.fittest, sum.count)],
                ['oldest', t.of(sum.oldest, sum.count)],
                ['fitter', equal ? '–' : `${int(sum.fitterMedian)} (${int(sum.fitterMin)}–${int(sum.fitterMax)})`],
                ['changes', `${dec(sum.changesMedian, sum.changesMedian % 1 ? 1 : 0)} (${int(sum.changesMin)}–${int(sum.changesMax)})`],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-slate-100">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                    {t.rows[k]}
                  </th>
                  <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
