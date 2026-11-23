import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { netA, sweepJob, theoryCurve, seedsJob, sisJob, A_DEFAULT, A_SOURCES, A_SIZES, A_RUNS, A_STEP, A_TRIALS, A_BINS, A_MAX_K, A_MIN_SEEDS, KMIN, MEAN_K, SIS_MU, SIS_STEPS, SIS_TAIL, SIS_LAMBDAS } from './experiments.js'
import { outbreakTheory, seedProbability, r0 } from './epidemic.js'

// Panel A, "Threshold or no threshold": the SIR outbreak as percolation on
// three kinds of network, outbreaks from single seeds, and SIS as an option.

const T = {
  en: {
    sources: { poisson: 'Random network', pa: 'Preferential attachment', power: 'Power law' },
    N: 'Nodes, N',
    gamma: 'Exponent γ',
    T: 'Transmissibility, T',
    net: (n, l, k, k2) => `${n} nodes, ${l} links, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    powerNote: `Configuration model with p(k) ∝ k^(−γ) from k = ${KMIN}; its mean degree follows from γ and from the network drawn. The other two have mean degree ${MEAN_K}.`,
    note: `Each link is kept with probability T; the largest component, as a share of N, is the size of a large outbreak (mean of ${A_RUNS} percolations for each T). The theory curve comes from the generating functions of this network's degrees, and is drawn where the network is a configuration model.`,
    tc: 'T_c from the formula',
    r0: 'R0 at this T',
    size: 'Largest component at this T',
    theory: (v) => `theory ${v}`,
    noTheory: 'no theory: not a configuration model',
    running: 'Computing…',
    chart: 'Size of a large outbreak (share of N) against T',
    legend: { measured: 'measured', theory: 'generating functions' },
    seeds: `Run ${A_TRIALS.toLocaleString('en-US')} seeds`,
    seedsNote: (T) => `${A_TRIALS.toLocaleString('en-US')} outbreaks at T = ${T}, each from a seed drawn at random. "Large" means more than 1% of N.`,
    large: 'Large outbreaks',
    meanLarge: 'Mean size of the large ones',
    meanSmall: 'Mean size of the others',
    nodes: (v, m) => `${v} nodes (largest ${m})`,
    hist: 'Outbreak sizes (share of N)',
    byK: 'Probability of a large outbreak against the degree of the seed',
    byKNote: `A degree is shown when at least ${A_MIN_SEEDS} of the seeds had it. The line is 1 − w^k.`,
    k: 'degree of the seed',
    share: 'share of outbreaks',
    sis: 'Run the SIS sweep',
    sisNote: `SIS in discrete time: at every step each infected node infects each susceptible neighbour with probability β and recovers with probability μ = ${SIS_MU}. Everyone starts infected; the prevalence is the mean share infected over the last ${SIS_TAIL} of ${SIS_STEPS} steps, for β/μ = 0, ${SIS_LAMBDAS[1]}, …, ${SIS_LAMBDAS[SIS_LAMBDAS.length - 1]}. The line is ⟨k⟩/⟨k²⟩. A finite network can show a threshold that is lower with hubs and close to that line; it cannot show a threshold of zero, because its ⟨k²⟩ is finite, and once the last infected node recovers the infection never returns.`,
    sisChart: 'Prevalence against β/μ',
    sisFrom: 'Prevalence above 1% from β/μ =',
    sisLine: '⟨k⟩/⟨k²⟩',
    ariaChart: 'Share of nodes in the largest component against the transmissibility, measured and from the theory',
    ariaHist: 'Histogram of outbreak sizes as shares of the network',
    ariaByK: 'Probability of a large outbreak against the degree of the seed, measured and from the formula',
    ariaSis: 'Share infected after a long run of the SIS model against the ratio of infection to recovery probability',
    locale: 'en-US',
  },
  it: {
    sources: { poisson: 'Rete casuale', pa: 'Aggancio preferenziale', power: 'Legge di potenza' },
    N: 'Nodi, N',
    gamma: 'Esponente γ',
    T: 'Trasmissibilità, T',
    net: (n, l, k, k2) => `${n} nodi, ${l} collegamenti, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    powerNote: `Modello di configurazione con p(k) ∝ k^(−γ) da k = ${KMIN}; il suo grado medio segue da γ e dalla rete estratta. Le altre due hanno grado medio ${MEAN_K}.`,
    note: `Ogni collegamento è tenuto con probabilità T; la componente più grande, come quota di N, è la dimensione di un grande focolaio (media di ${A_RUNS} percolazioni per ogni T). La curva teorica viene dalle funzioni generatrici dei gradi di questa rete, ed è tracciata dove la rete è un modello di configurazione.`,
    tc: 'T_c dalla formula',
    r0: 'R0 a questo T',
    size: 'Componente più grande a questo T',
    theory: (v) => `teoria ${v}`,
    noTheory: 'nessuna teoria: non è un modello di configurazione',
    running: 'Calcolo in corso…',
    chart: 'Dimensione di un grande focolaio (quota di N) al variare di T',
    legend: { measured: 'misurata', theory: 'funzioni generatrici' },
    seeds: `Lancia ${A_TRIALS.toLocaleString('it-IT')} semi`,
    seedsNote: (T) => `${A_TRIALS.toLocaleString('it-IT')} focolai a T = ${T}, ciascuno da un seme estratto a caso. «Grande» significa più dell'1% di N.`,
    large: 'Focolai grandi',
    meanLarge: 'Dimensione media dei grandi',
    meanSmall: 'Dimensione media degli altri',
    nodes: (v, m) => `${v} nodi (il più grande ${m})`,
    hist: 'Dimensioni dei focolai (quota di N)',
    byK: 'Probabilità di un grande focolaio al variare del grado del seme',
    byKNote: `Un grado è mostrato quando almeno ${A_MIN_SEEDS} semi lo avevano. La linea è 1 − w^k.`,
    k: 'grado del seme',
    share: 'quota dei focolai',
    sis: 'Lancia la scansione SIS',
    sisNote: `SIS a tempo discreto: a ogni passo ogni nodo infetto infetta ciascun vicino suscettibile con probabilità β e guarisce con probabilità μ = ${String(SIS_MU).replace('.', ',')}. Tutti partono infetti; la prevalenza è la quota media di infetti negli ultimi ${SIS_TAIL} passi su ${SIS_STEPS}, per β/μ = 0, ${String(SIS_LAMBDAS[1]).replace('.', ',')}, …, ${String(SIS_LAMBDAS[SIS_LAMBDAS.length - 1]).replace('.', ',')}. La linea è ⟨k⟩/⟨k²⟩. Una rete finita può mostrare una soglia più bassa con gli hub e vicina a quella linea; non può mostrare una soglia nulla, perché il suo ⟨k²⟩ è finito, e quando l'ultimo nodo infetto guarisce l'infezione non torna più.`,
    sisChart: 'Prevalenza al variare di β/μ',
    sisFrom: "Prevalenza sopra l'1% da β/μ =",
    sisLine: '⟨k⟩/⟨k²⟩',
    ariaChart: 'Quota di nodi nella componente più grande al variare della trasmissibilità, misurata e dalla teoria',
    ariaHist: 'Istogramma delle dimensioni dei focolai come quote della rete',
    ariaByK: 'Probabilità di un grande focolaio al variare del grado del seme, misurata e dalla formula',
    ariaSis: 'Quota di infetti dopo una lunga simulazione del modello SIS al variare del rapporto tra probabilità di infezione e di guarigione',
    locale: 'it-IT',
  },
}

export default function ThresholdPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(A_DEFAULT.source)
  const [sizeIdx, setSizeIdx] = useState(A_SIZES.indexOf(A_DEFAULT.N))
  const [gamma, setGamma] = useState(A_DEFAULT.gamma)
  const [Tv, setT] = useState(A_DEFAULT.T)
  const N = A_SIZES[sizeIdx]
  const on = useMemo(() => netA({ source, N, gamma }), [source, N, gamma])
  const sweep = useExperiment()
  const seeds = useExperiment()
  const sis = useExperiment()
  useEffect(() => {
    sweep.run(sweepJob(on))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])
  const same = (d) => d && d.n === on.n && d.source === on.source && (on.source !== 'power' || d.gamma === on.gamma)
  const sw = same(sweep.data) ? sweep.data : null
  const swDone = sw && sw.done && !sweep.running
  const sd = same(seeds.data) && seeds.data.trials > 0 ? seeds.data : null
  const ss = same(sis.data) && sis.data.rows.length > 0 ? sis.data : null
  const theory = useMemo(() => theoryCurve(on), [on])
  const th = useMemo(() => (on.config ? outbreakTheory(on.fam, Tv) : null), [on, Tv])
  const row = swDone ? sw.rows[Math.round(Tv / A_STEP)] : null
  const thSeeds = sd && on.config ? outbreakTheory(on.fam, sd.T) : null
  const shownK = sd ? sd.byK.filter((r) => r.seeds >= A_MIN_SEEDS && r.k <= A_MAX_K) : []
  const topBin = sd ? Math.max(0.2, Math.ceil(Math.max(...sd.bins) * 5) / 5) : 1
  const sisTop = ss ? Math.max(0.1, Math.ceil(Math.max(...ss.rows.map((r) => r.prevalence)) * 10) / 10) : 0.5
  const lamMax = SIS_LAMBDAS[SIS_LAMBDAS.length - 1]

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {A_SOURCES.map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.N} min={0} max={A_SIZES.length - 1} step={1} value={sizeIdx} onChange={(v) => setSizeIdx(Math.round(v))} format={(v) => A_SIZES[Math.round(v)].toLocaleString(t.locale)} />
        <Slider label={t.T} min={0} max={1} step={0.01} value={Tv} onChange={(v) => setT(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        {source === 'power' && <Slider label={t.gamma} min={2.1} max={3.5} step={0.1} value={gamma} onChange={(v) => setGamma(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />}
      </div>
      <p className="mt-2 font-mono text-xs text-slate-600" data-readout="network" data-n={on.n} data-links={on.links} data-mean={on.mean.toFixed(3)} data-mean2={on.mean2.toFixed(2)} data-tc={on.Tc.toFixed(3)} data-sis={on.sis.toFixed(3)}>
        {t.net(on.n.toLocaleString(t.locale), on.links.toLocaleString(t.locale), num(on.mean, 2), num(on.mean2, 2))}
      </p>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
      {source === 'power' && <p className="mt-1 text-xs text-slate-500 leading-snug">{t.powerNote}</p>}
      {sweep.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(sweep.progress * 100)}%`}</p>}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2" data-readout="threshold" data-done={swDone ? '1' : '0'} data-t={Tv} data-share={row ? row.share.toFixed(3) : ''} data-theory={th ? th.S.toFixed(3) : ''} data-w={th ? th.w.toFixed(4) : ''}>
        <Stat label={t.tc}>{num(on.Tc, 3)}</Stat>
        <Stat label={t.r0}>{num(r0(Tv, on.mean, on.mean2), 2)}</Stat>
        <Stat label={t.size}>
          <span style={{ color: ORANGE_DARK }}>{row ? num(row.share, 3) : '–'}</span>
          {` · ${th ? t.theory(num(th.S, 3)) : t.noTheory}`}
        </Stat>
      </div>

      {sw && sw.rows.length > 1 && (
        <div className="mt-4 max-w-xl">
          <Eyebrow>{t.chart}</Eyebrow>
          <Chart
            x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: 'T', format: (v) => num(v, 1) }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
            height={190}
            aria={t.ariaChart}
            marks={[{ x: on.Tc, color: SLATE, label: 'T_c' }, { x: Tv, color: MUTED, dashed: true }]}
            series={[{ points: sw.rows.map((r) => [r.T, r.share]), color: ORANGE_DARK, width: 2.4 }, ...(theory ? [{ points: theory, color: INK, width: 1.1, dashed: true }] : [])]}
          />
          <Legend items={[{ label: t.legend.measured, color: ORANGE_DARK }, ...(theory ? [{ label: t.legend.theory, color: INK, dashed: true }] : [])]} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Pill primary onClick={() => seeds.run(seedsJob(on, Tv))} disabled={seeds.running} data-action="seeds">
          {t.seeds}
        </Pill>
        <Pill primary onClick={() => sis.run(sisJob(on))} disabled={sis.running} data-action="sis">
          {t.sis}
        </Pill>
      </div>
      {seeds.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(seeds.progress * 100)}%`}</p>}
      {sd && (
        <div className="mt-3" data-readout="seeds" data-done={sd.done && !seeds.running ? '1' : '0'} data-t={sd.T} data-large={sd.large.toFixed(3)} data-meanlarge={Number.isFinite(sd.meanLarge) ? sd.meanLarge.toFixed(3) : ''} data-meansmall={Number.isFinite(sd.meanSmall) ? sd.meanSmall.toFixed(2) : ''} data-byk={shownK.map((r) => `${r.k}:${(r.large / r.seeds).toFixed(2)}`).join(' ')}>
          <p className="text-xs text-slate-500 leading-snug">{t.seedsNote(num(sd.T, 2))}</p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Stat label={t.large}>{`${num(sd.large, 3)}${thSeeds ? ` · ${t.theory(num(thSeeds.S, 3))}` : ''}`}</Stat>
            <Stat label={t.meanLarge}>{`${num(sd.meanLarge, 3)}${thSeeds ? ` · ${t.theory(num(thSeeds.S, 3))}` : ''}`}</Stat>
            <Stat label={t.meanSmall}>{t.nodes(num(sd.meanSmall, 2), sd.maxSmall)}</Stat>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
            <div className="min-w-0">
              <Eyebrow>{t.hist}</Eyebrow>
              <Chart x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }} y={{ min: 0, max: topBin, ticks: [0, topBin / 2, topBin], label: t.share, format: (v) => num(v, 1) }} height={180} aria={t.ariaHist} series={[]}>
                {({ sx, sy }) => sd.bins.map((b, i) => (b > 0 ? <rect key={i} x={sx(i / A_BINS) + 0.5} y={sy(b)} width={sx((i + 1) / A_BINS) - sx(i / A_BINS) - 1} height={sy(0) - sy(b)} fill={i === 0 ? SLATE : ORANGE_DARK} /> : null))}
              </Chart>
            </div>
            <div className="min-w-0">
              <Eyebrow>{t.byK}</Eyebrow>
              <Chart
                x={{ min: 0, max: A_MAX_K, ticks: [0, 5, 10, 15, 20], label: t.k }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
                height={180}
                aria={t.ariaByK}
                series={[
                  ...(thSeeds ? [{ points: Array.from({ length: A_MAX_K + 1 }, (_, k) => [k, seedProbability(thSeeds.w, k)]), color: SLATE, width: 1.2, dashed: true }] : []),
                  { points: shownK.map((r) => [r.k, r.large / r.seeds]), color: INK, line: false, dots: 2.6 },
                ]}
              />
              <p className="mt-1 text-xs text-slate-500 leading-snug">{t.byKNote}</p>
            </div>
          </div>
        </div>
      )}

      {sis.running && <p className="mt-2 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(sis.progress * 100)}%`}</p>}
      {ss && (
        <div className="mt-4 max-w-xl" data-readout="sis" data-done={ss.done && !sis.running ? '1' : '0'} data-from={Number.isFinite(ss.from) ? ss.from : ''} data-prevalence={ss.rows.map((r) => r.prevalence.toFixed(3)).join(' ')}>
          <Eyebrow>{t.sisChart}</Eyebrow>
          <Chart
            x={{ min: 0, max: lamMax, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], label: 'β/μ', format: (v) => num(v, 1) }}
            y={{ min: 0, max: sisTop, ticks: [0, sisTop / 2, sisTop], format: (v) => num(v, 2) }}
            height={180}
            aria={t.ariaSis}
            marks={[{ x: on.sis, color: SLATE, label: t.sisLine }]}
            series={[{ points: ss.rows.map((r) => [r.lambda, r.prevalence]), color: ORANGE_DARK, width: 1.9, dots: 1.8 }]}
          />
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Stat label={t.sisFrom}>{ss.done ? num(ss.from, 2) : '–'}</Stat>
            <Stat label={t.sisLine}>{num(on.sis, 3)}</Stat>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500 leading-snug">{t.sisNote}</p>
    </div>
  )
}
