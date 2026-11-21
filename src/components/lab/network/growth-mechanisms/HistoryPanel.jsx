import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { growKernel, ccdf } from './growth.js'
import { historyRun, historyJob, thin, seedOf, HISTORY_DEFAULT, HISTORY_RUNS, HISTORY_SEED } from './experiments.js'

// Panel A, "Rerun history": growth from a clique of m + 1 nodes, each new node
// linking to m distinct nodes with probability ∝ (k + A)^α. One run in
// detail, then the same model twenty times: the distribution is the same,
// the winner is not.

const DRAW_N = 300

const T = {
  en: {
    alpha: 'Kernel exponent α',
    A: 'Offset A',
    m: 'Links per new node, m',
    N: 'Nodes, N',
    grow: 'Grow',
    rerun: `Rerun ${HISTORY_RUNS} times`,
    stop: 'Stop',
    running: 'Growing…',
    run: (r) => `Run ${r}`,
    drawSmall: (n) => `Drawn: a network of the same kind with ${DRAW_N} nodes. Numbers: the full network, N = ${n}. Node size follows the degree; the biggest hub is dark.`,
    drawSame: 'Node size follows the degree; the biggest hub is dark.',
    max: 'Largest degree',
    born: 'Biggest hub, born',
    share: 'Share of nodes linked to it',
    settles: 'Leader fixed from size',
    tenth: 'Leader at N/10 is the final one',
    yes: 'yes',
    no: 'no',
    nth: (i) => `${i.toLocaleString('en-US')}${['th', 'st', 'nd', 'rd'][(i % 100 >= 11 && i % 100 <= 13) || i % 10 > 3 ? 0 : i % 10]}`,
    ccdf: 'Degree distribution, CCDF',
    slope: (g) => `slope −${g}`,
    byBirth: 'Degree against birth order',
    meanField: 'mean field',
    leader: 'Birth order of the leader as the network grows',
    size: 'network size',
    twenty: (n) => `${n} runs`,
    ccdfs: 'The CCDFs of all the runs',
    hubs: 'Birth order of the biggest hub, run by run',
    runAxis: 'run',
    table: 'Over the runs',
    rows: {
      born: 'Biggest hub born (median, range)',
      share: 'Share linked to it (median, range)',
      firstTen: 'Biggest hub among the first ten nodes',
      same: 'Leader at N/10 still the leader at the end',
    },
    of: (a, b) => `${a} of ${b}`,
    ariaNet: 'The network drawn, node size by degree',
    ariaCcdf: 'Complementary cumulative degree distribution on logarithmic axes',
    ariaBirth: 'Degree of each node against its birth order on logarithmic axes',
    ariaLeader: 'Birth order of the node with the largest degree as the network grows',
    ariaCcdfs: 'Degree distributions of all the runs overlaid',
    ariaHubs: 'Birth order of the biggest hub in each run',
    locale: 'en-US',
  },
  it: {
    alpha: 'Esponente del kernel α',
    A: 'Scostamento A',
    m: 'Collegamenti per nodo nuovo, m',
    N: 'Nodi, N',
    grow: 'Fai crescere',
    rerun: `Rifai ${HISTORY_RUNS} volte`,
    stop: 'Ferma',
    running: 'Crescita in corso…',
    run: (r) => `Corsa ${r}`,
    drawSmall: (n) => `Disegnata: una rete dello stesso tipo con ${DRAW_N} nodi. Numeri: la rete completa, N = ${n}. La dimensione dei nodi segue il grado; l'hub più grande è scuro.`,
    drawSame: "La dimensione dei nodi segue il grado; l'hub più grande è scuro.",
    max: 'Grado massimo',
    born: 'Hub più grande, nato',
    share: 'Quota di nodi collegati a lui',
    settles: 'Leader fisso dalla dimensione',
    tenth: 'Il leader a N/10 è quello finale',
    yes: 'sì',
    no: 'no',
    nth: (i) => `${i.toLocaleString('it-IT')}º`,
    ccdf: 'Distribuzione dei gradi, CCDF',
    slope: (g) => `pendenza −${g}`,
    byBirth: 'Grado e ordine di nascita',
    meanField: 'campo medio',
    leader: 'Ordine di nascita del leader mentre la rete cresce',
    size: 'dimensione della rete',
    twenty: (n) => `${n} corse`,
    ccdfs: 'Le CCDF di tutte le corse',
    hubs: "Ordine di nascita dell'hub più grande, corsa per corsa",
    runAxis: 'corsa',
    table: 'Sulle corse',
    rows: {
      born: 'Hub più grande nato (mediana, intervallo)',
      share: 'Quota collegata a lui (mediana, intervallo)',
      firstTen: 'Hub più grande tra i primi dieci nodi',
      same: 'Il leader a N/10 è ancora il leader alla fine',
    },
    of: (a, b) => `${a} su ${b}`,
    ariaNet: 'La rete disegnata, dimensione dei nodi secondo il grado',
    ariaCcdf: 'Distribuzione cumulativa complementare dei gradi su assi logaritmici',
    ariaBirth: 'Grado di ogni nodo al variare del suo ordine di nascita, su assi logaritmici',
    ariaLeader: 'Ordine di nascita del nodo con il grado massimo mentre la rete cresce',
    ariaCcdfs: 'Distribuzioni dei gradi di tutte le corse sovrapposte',
    ariaHubs: "Ordine di nascita dell'hub più grande in ogni corsa",
    locale: 'it-IT',
  },
}

const decadeTicks = (max) => {
  const out = []
  for (let v = 1; v <= max * 1.0001; v *= 10) out.push(v)
  return out
}
const logPoints = (n, count = 160) => {
  const out = new Set([1])
  for (let j = 0; j <= count; j++) out.add(Math.min(n - 1, Math.round(10 ** ((j / count) * Math.log10(n - 1)))))
  return [...out].sort((a, b) => a - b)
}

export default function HistoryPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [alpha, setAlpha] = useState(HISTORY_DEFAULT.alpha)
  const [A, setA] = useState(HISTORY_DEFAULT.A)
  const [m, setM] = useState(HISTORY_DEFAULT.m)
  const [N, setN] = useState(HISTORY_DEFAULT.N)
  const [run, setRun] = useState(0)
  const exp = useExperiment()
  const params = useMemo(() => ({ alpha, A: Math.max(A, -m + 0.5), m, N }), [alpha, A, m, N])
  const key = `${params.alpha}|${params.A}|${m}|${N}`
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const pct = (v) => `${dec(100 * v, 1)}%`

  // a new setting starts again from run 1 and drops the twenty runs
  useEffect(() => {
    setRun(0)
    exp.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const one = useMemo(() => historyRun(params, run), [params, run])
  const drawing = useMemo(() => {
    const net = N > DRAW_N ? growKernel({ ...params, N: DRAW_N, seed: seedOf(HISTORY_SEED, run) }) : one.net
    const n = net.n
    const random = mulberry32(5 + run)
    const start = Float64Array.from({ length: 2 * n }, () => random())
    const pos = fitUnit(forceLayout(n, net.A, net.B, net.A.length, start, 0.1, 120), n)
    let hub = 0
    for (let v = 0; v < n; v++) if (net.deg[v] > net.deg[hub]) hub = v
    const big = net.deg[hub]
    const links = Array.from(net.A, (a, e) => ({ a, b: net.B[e], color: 'rgba(100, 116, 139, 0.28)', width: 0.8 }))
    const nodes = Array.from({ length: n }, (_, v) => ({ i: v, r: 1.6 + 5.5 * Math.sqrt(net.deg[v] / big), fill: v === hub ? INK : ORANGE_DARK }))
    return { pos, links, nodes }
  }, [params, run, N, one])

  const linear = alpha === 1
  const gamma = 3 + params.A / m
  const cc = useMemo(() => thin(ccdf(one.net.deg, 1)), [one])
  const birth = useMemo(() => logPoints(N).map((i) => [i, one.net.deg[i]]), [one, N])
  const leader = useMemo(() => logPoints(N, 200).filter((s) => s > m).map((s) => [s + 1, one.net.leaderAt[s] + 1]), [one, N, m])
  const kMax = 10 ** Math.ceil(Math.log10(Math.max(10, one.max)))
  const beta = 1 / (2 + params.A / m)
  const mf = linear ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].filter((i) => i < N).map((i) => [i, (m + params.A) * (N / i) ** beta - params.A]) : []
  const yMinCcdf = 10 ** -Math.ceil(Math.log10(N))
  // the line of slope −(γ − 1) from (m, 1), stopped where it leaves the chart
  const kEnd = Math.min(kMax, m * yMinCcdf ** (-1 / (gamma - 1)))
  const slopeLine = linear ? [[m, 1], [kEnd, (kEnd / m) ** -(gamma - 1)]] : []

  const data = exp.data && exp.data.params && `${exp.data.params.alpha}|${exp.data.params.A}|${exp.data.params.m}|${exp.data.params.N}` === key ? exp.data : null
  const done = !!data && data.runs.length === data.wanted && !exp.running
  const sum = data && data.summary
  const ccMin = 10 ** -Math.ceil(Math.log10(N))
  const allMax = data ? 10 ** Math.ceil(Math.log10(Math.max(10, ...data.runs.map((r) => r.max)))) : kMax

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label={t.alpha} min={0} max={2} step={0.1} value={alpha} onChange={(v) => setAlpha(Math.round(v * 10) / 10)} format={(v) => dec(v, 1)} />
        <Slider label={t.A} min={-m + 0.5} max={5} step={0.5} value={params.A} onChange={setA} format={(v) => dec(v, 1)} />
        <Slider label={t.m} min={1} max={4} step={1} value={m} onChange={setM} />
        <Slider label={t.N} min={500} max={20000} log value={N} onChange={(v) => setN(Math.round(v / 100) * 100)} format={(v) => int(v)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill onClick={() => setRun((r) => r + 1)} data-action="grow">
          {t.grow}
        </Pill>
        {exp.running ? (
          <Pill onClick={exp.cancel}>{t.stop}</Pill>
        ) : (
          <Pill primary onClick={() => exp.run(historyJob(params))} data-action="rerun">
            {t.rerun}
          </Pill>
        )}
        <span className="font-mono text-xs text-slate-500" aria-live="polite">
          {exp.running ? `${t.running} ${Math.round(exp.progress * 100)}%` : t.run(run + 1)}
        </span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <NetCanvas pos={drawing.pos} nodes={drawing.nodes} links={drawing.links} aria={t.ariaNet} maxHeight={300} ratio={0.8} />
          <p className="mt-2 text-xs text-slate-500 leading-snug">{N > DRAW_N ? t.drawSmall(int(N)) : t.drawSame}</p>
          <div className="mt-3 grid grid-cols-2 gap-2" data-readout="run" data-hub={one.hub} data-max={one.max} data-share={one.share.toFixed(4)} data-settles={one.settles}>
            <Stat label={t.max}>{int(one.max)}</Stat>
            <Stat label={t.born}>{t.nth(one.hub + 1)}</Stat>
            <Stat label={t.share}>{pct(one.share)}</Stat>
            <Stat label={t.settles}>{int(one.settles)}</Stat>
            <Stat label={t.tenth} wide>
              {one.leaderAtTenth === one.hub ? t.yes : t.no}
            </Stat>
          </div>
        </div>
        <div className="min-w-0 space-y-4">
          <div>
            <Eyebrow>{t.ccdf}</Eyebrow>
            <Chart
              x={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: 'k' }}
              y={{ min: yMinCcdf, max: 1, log: true, ticks: decadeTicks(1 / yMinCcdf).map((v) => 1 / v).reverse(), label: 'P(K ≥ k)', labelSide: 'left' }}
              height={150}
              aria={t.ariaCcdf}
              series={[...(linear ? [{ points: slopeLine, color: MUTED, dashed: true, width: 1.3 }] : []), { points: cc, color: ORANGE_DARK, dots: 1.6, line: false }]}
            />
            {linear && <Legend items={[{ label: t.slope(dec(gamma - 1, 2)), color: MUTED, dashed: true }]} />}
          </div>
          <div>
            <Eyebrow>{t.byBirth}</Eyebrow>
            <Chart
              x={{ min: 1, max: 10 ** Math.ceil(Math.log10(N)), log: true, ticks: decadeTicks(N) }}
              y={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax) }}
              height={140}
              aria={t.ariaBirth}
              series={[...(linear ? [{ points: mf, color: INK, dashed: true, width: 1.3 }] : []), { points: birth, color: ORANGE_DARK, dots: 1.5, line: false }]}
            />
            {linear && <Legend items={[{ label: t.meanField, color: INK, dashed: true }]} />}
          </div>
          <div>
            <Eyebrow>{t.leader}</Eyebrow>
            <Chart
              x={{ min: 1, max: 10 ** Math.ceil(Math.log10(N)), log: true, ticks: decadeTicks(N), label: t.size }}
              y={{ min: 1, max: 10 ** Math.max(1, Math.ceil(Math.log10(Math.max(...leader.map((p) => p[1]))))), log: true, ticks: decadeTicks(10 ** Math.max(1, Math.ceil(Math.log10(Math.max(...leader.map((p) => p[1])))))) }}
              height={120}
              aria={t.ariaLeader}
              series={[{ points: leader, color: INK, width: 1.6 }]}
              marks={[{ x: one.settles, color: ORANGE_DARK, dashed: true }]}
            />
          </div>
        </div>
      </div>

      {data && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2 items-start">
          <div className="min-w-0">
            <Eyebrow>{t.ccdfs}</Eyebrow>
            <Chart
              x={{ min: 1, max: allMax, log: true, ticks: decadeTicks(allMax), label: 'k' }}
              y={{ min: ccMin, max: 1, log: true, ticks: decadeTicks(1 / ccMin).map((v) => 1 / v).reverse() }}
              height={160}
              aria={t.ariaCcdfs}
              series={data.runs.map((r) => ({ points: r.ccdf, color: ORANGE_DARK, width: 1, opacity: 0.45 }))}
            />
            <Eyebrow>{t.hubs}</Eyebrow>
            <Chart
              x={{ min: 0, max: HISTORY_RUNS + 1, ticks: [1, 5, 10, 15, 20], label: t.runAxis }}
              y={{ min: 1, max: 10 ** Math.ceil(Math.log10(N)), log: true, ticks: decadeTicks(N) }}
              height={130}
              aria={t.ariaHubs}
              series={[{ points: data.runs.map((r) => [r.run + 1, r.hub + 1]), color: INK, dots: 2.8, line: false }]}
            />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.table}: {t.twenty(data.runs.length)}</Eyebrow>
            {sum && (
              <table className="mt-2 w-full text-sm" data-readout="twenty" data-done={done ? '1' : '0'} data-first-ten={sum.firstTen} data-same={sum.sameLeader}>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rows.born}</th>
                    <td className="py-1.5 pl-2 text-right font-mono tabular-nums">
                      {t.nth(Math.round(sum.hubMedian + 1))} ({int(sum.hubMin + 1)}–{int(sum.hubMax + 1)})
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rows.share}</th>
                    <td className="py-1.5 pl-2 text-right font-mono tabular-nums">
                      {pct(sum.shareMedian)} ({pct(sum.shareMin)}–{pct(sum.shareMax)})
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rows.firstTen}</th>
                    <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{t.of(sum.firstTen, sum.count)}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rows.same}</th>
                    <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{t.of(sum.sameLeader, sum.count)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
