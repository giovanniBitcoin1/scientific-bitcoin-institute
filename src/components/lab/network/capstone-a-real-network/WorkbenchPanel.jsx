import { useMemo, useState } from 'react'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { groupColor } from '../communities/palette.js'
import { shapeJob, degreeJob, centralityJob, mixingJob, communities, againstLabels, agreement, weightsReport, REWIRINGS, BOOT_SETS, BACKBONE_ALPHA } from './capstone.js'
import NetworkPicker from './NetworkPicker.jsx'
import { useActive, shortName } from './store.js'

// Panel A, "The workbench": six cards in the order of the course, each run
// on its button on the largest component of the chosen network. On the
// airports the cards that take seconds show the precomputed values at once
// (the same jobs, the same seeds), with a button to compute them again.

const T = {
  en: {
    locale: 'en-US',
    run: 'Run',
    again: 'Compute again',
    running: 'Computing…',
    stored: 'Precomputed values (same code, same seeds).',
    sampled: (s) => `Distances and betweenness from ${s} sampled sources: estimates.`,
    noNet: 'Read a network first.',
    giant: (n, w) => `Everything below is measured on the largest component: ${n} of the ${w} nodes.`,
    cards: {
      shape: ['1', 'Size and shape', 'modules 01, 02'],
      degrees: ['2', 'Degrees', 'module 05'],
      centrality: ['3', 'Centrality', 'module 03'],
      mixing: ['4', 'Mixing', 'module 08'],
      community: ['5', 'Communities', 'module 09'],
      weights: ['6', 'Weights', 'module 10'],
    },
    nodes: 'Nodes',
    links: 'Links',
    components: 'Components',
    sizes: 'Sizes of the components',
    density: 'Density',
    meanK: 'Mean degree',
    maxK: 'Largest degree',
    measure: 'Measure',
    here: 'This network',
    rewired: `${REWIRINGS} rewirings`,
    z: 'z',
    distance: 'Mean distance',
    diameter: 'Diameter',
    clustering: 'Mean clustering',
    transitivity: 'Transitivity',
    r: 'Assortativity r',
    ratio: 'this network ÷ rewirings',
    short: { clustering: 'clust.', transitivity: 'trans.', distance: 'dist.' },
    median: 'Median degree',
    ones: 'Share with one link',
    kMin: 'k_min chosen',
    alpha: 'Exponent α',
    tail: 'Nodes in the tail',
    p: (s) => `p-value (${s} sets)`,
    verdict: 'Verdict',
    verdicts: { small: 'tail too small to say', narrow: 'tail too narrow to say', untested: 'not tested', ruledOut: 'power law ruled out', alternative: 'another candidate fits better', plausible: 'power law plausible' },
    against: 'Against',
    cand: { exponential: 'exponential', lognormal: 'lognormal', cutoff: 'power law with cut-off' },
    favours: { pos: 'power law better', neg: 'alternative better', none: 'cannot tell' },
    drift: 'α at fixed k_min',
    ccdf: 'P(K ≥ k)',
    alphaChart: 'α against k_min',
    noFit: 'Too few distinct degrees for a fit.',
    top: 'The first ten',
    measures: { degree: 'Degree', betweenness: 'Betweenness', closeness: 'Closeness', pagerank: 'PageRank' },
    rho: 'Rank correlation, degree and betweenness',
    zero: 'Share with betweenness 0',
    scatter: 'Betweenness against degree',
    rhoS: "Spearman's ρ",
    slope: 'Slope of k_nn(k)',
    rNull: 'r in the rewirings',
    knn: 'Mean degree of the neighbours, k_nn(k)',
    rich: 'Rich-club ratio against the rewirings',
    richMax: 'Largest ratio',
    Q: 'Modularity Q',
    groups: 'Groups',
    runNo: 'Run',
    prev: 'NMI with the previous run',
    labels: (name) => `NMI with the labels (${name})`,
    qLabels: 'Q of the labels',
    runAgain: 'Run again',
    groupsTitle: 'Sizes of the groups',
    hubs: 'Largest hub of each group',
    more: (m) => `and ${m} smaller groups`,
    beta: 'Exponent β of s ∝ k^β',
    w1: 'Share of links with weight 1',
    wMean: 'Mean weight',
    wMax: 'Largest weight',
    backbone: `Backbone at ${BACKBONE_ALPHA}`,
    backboneValue: (l, s, n) => `${l} links (${s}), ${n} nodes`,
    strength: 'Strength against degree',
    noWeights: 'This network has no weights.',
    aria: { ratio: 'Clustering, transitivity and mean distance of the network divided by their mean in the rewirings', ccdf: 'Cumulative distribution of the degrees on logarithmic axes', alpha: 'Fitted exponent against the lower cut-off k_min', scatter: 'Betweenness against degree on logarithmic axes', knn: 'Mean degree of the neighbours against the degree, on logarithmic axes', rich: 'Rich-club ratio against the degree', groups: 'Sizes of the groups found', strength: 'Mean strength against degree on logarithmic axes, with the fitted power law' },
  },
  it: {
    locale: 'it-IT',
    run: 'Esegui',
    again: 'Calcola di nuovo',
    running: 'Calcolo in corso…',
    stored: 'Valori precalcolati (stesso codice, stessi semi).',
    sampled: (s) => `Distanze e betweenness da ${s} sorgenti campionate: sono stime.`,
    noNet: 'Prima leggi una rete.',
    giant: (n, w) => `Tutto ciò che segue è misurato sulla componente più grande: ${n} dei ${w} nodi.`,
    cards: {
      shape: ['1', 'Dimensioni e forma', 'moduli 01, 02'],
      degrees: ['2', 'Gradi', 'modulo 05'],
      centrality: ['3', 'Centralità', 'modulo 03'],
      mixing: ['4', 'Mescolamento', 'modulo 08'],
      community: ['5', 'Comunità', 'modulo 09'],
      weights: ['6', 'Pesi', 'modulo 10'],
    },
    nodes: 'Nodi',
    links: 'Collegamenti',
    components: 'Componenti',
    sizes: 'Dimensioni delle componenti',
    density: 'Densità',
    meanK: 'Grado medio',
    maxK: 'Grado massimo',
    measure: 'Misura',
    here: 'Questa rete',
    rewired: `${REWIRINGS} ricablature`,
    z: 'z',
    distance: 'Distanza media',
    diameter: 'Diametro',
    clustering: 'Clustering medio',
    transitivity: 'Transitività',
    r: 'Assortatività r',
    ratio: 'questa rete ÷ ricablature',
    short: { clustering: 'clust.', transitivity: 'trans.', distance: 'dist.' },
    median: 'Grado mediano',
    ones: 'Quota con un solo collegamento',
    kMin: 'k_min scelto',
    alpha: 'Esponente α',
    tail: 'Nodi nella coda',
    p: (s) => `p-value (${s} insiemi)`,
    verdict: 'Verdetto',
    verdicts: { small: 'coda troppo piccola per dirlo', narrow: 'coda troppo stretta per dirlo', untested: 'non verificata', ruledOut: 'legge di potenza esclusa', alternative: 'un altro candidato si adatta meglio', plausible: 'legge di potenza plausibile' },
    against: 'Contro',
    cand: { exponential: 'esponenziale', lognormal: 'lognormale', cutoff: 'legge di potenza con taglio' },
    favours: { pos: 'meglio la legge di potenza', neg: "meglio l'alternativa", none: 'non si può dire' },
    drift: 'α con k_min fissato',
    ccdf: 'P(K ≥ k)',
    alphaChart: 'α al variare di k_min',
    noFit: 'Troppo pochi gradi distinti per un adattamento.',
    top: 'I primi dieci',
    measures: { degree: 'Grado', betweenness: 'Betweenness', closeness: 'Closeness', pagerank: 'PageRank' },
    rho: 'Correlazione di rango, grado e betweenness',
    zero: 'Quota con betweenness 0',
    scatter: 'Betweenness rispetto al grado',
    rhoS: 'ρ di Spearman',
    slope: 'Pendenza di k_nn(k)',
    rNull: 'r nelle ricablature',
    knn: 'Grado medio dei vicini, k_nn(k)',
    rich: 'Rapporto di rich club rispetto alle ricablature',
    richMax: 'Rapporto massimo',
    Q: 'Modularità Q',
    groups: 'Gruppi',
    runNo: 'Esecuzione',
    prev: "NMI con l'esecuzione precedente",
    labels: (name) => `NMI con le etichette (${name})`,
    qLabels: 'Q delle etichette',
    runAgain: 'Esegui di nuovo',
    groupsTitle: 'Dimensioni dei gruppi',
    hubs: 'Hub più grande di ogni gruppo',
    more: (m) => `e altri ${m} gruppi più piccoli`,
    beta: 'Esponente β di s ∝ k^β',
    w1: 'Quota di collegamenti con peso 1',
    wMean: 'Peso medio',
    wMax: 'Peso massimo',
    backbone: `Dorsale a ${BACKBONE_ALPHA}`,
    backboneValue: (l, s, n) => `${l} collegamenti (${s}), ${n} nodi`,
    strength: 'Forza rispetto al grado',
    noWeights: 'Questa rete non ha pesi.',
    aria: { ratio: 'Clustering, transitività e distanza media della rete divisi per la loro media nelle ricablature', ccdf: 'Distribuzione cumulativa dei gradi su assi logaritmici', alpha: 'Esponente stimato al variare del taglio inferiore k_min', scatter: 'Betweenness rispetto al grado su assi logaritmici', knn: 'Grado medio dei vicini rispetto al grado, su assi logaritmici', rich: 'Rapporto di rich club rispetto al grado', groups: 'Dimensioni dei gruppi trovati', strength: 'Forza media rispetto al grado su assi logaritmici, con la legge di potenza stimata' },
  },
}

const LABEL_NAMES = { airports: { en: 'regions', it: 'regioni' }, karate: { en: 'factions', it: 'fazioni' } }

// A logarithmic axis that covers [lo, hi] with whole powers of ten.
function logAxis(lo, hi) {
  const a = Math.floor(Math.log10(Math.max(lo, 1e-12)) + 1e-9)
  const b = Math.max(a + 1, Math.ceil(Math.log10(Math.max(hi, 1e-12)) - 1e-9))
  const step = Math.max(1, Math.ceil((b - a) / 4))
  const ticks = []
  for (let e = a; e <= b; e += step) ticks.push(10 ** e)
  return { min: 10 ** a, max: 10 ** b, log: true, ticks }
}

// One card's job: the live result once it has been run on this network,
// otherwise the precomputed one (airports).
function useCard(entry, name, makeJob) {
  const exp = useExperiment()
  const [tag, setTag] = useState(null)
  const mine = tag === entry.key
  const live = mine && exp.data && exp.data.done && !exp.running ? exp.data : null
  const stored = entry.pre && !(mine && exp.running) ? entry.pre[name] : null
  return {
    data: live || stored,
    stored: !live && !!stored,
    running: mine && exp.running,
    progress: exp.progress,
    run: () => {
      setTag(entry.key)
      exp.run(makeJob())
    },
  }
}

function Card({ t, id, card, children, done }) {
  const [no, title, mod] = t.cards[id]
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4 min-w-0" data-card={id} data-done={done ? '1' : '0'}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-serif text-lg text-slate-900">
          <span className="font-mono text-xs text-orange-600 mr-2">{no}</span>
          {title}
          <span className="ml-2 font-mono text-xs text-slate-400">{mod}</span>
        </h4>
        {card && (
          <Pill primary={!card.data} onClick={card.run} disabled={card.running} data-action="run">
            {card.data ? t.again : t.run}
          </Pill>
        )}
      </div>
      {card && card.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(card.progress * 100)}%`}</p>}
      {card && card.stored && <p className="mt-1 text-xs text-slate-500">{t.stored}</p>}
      {children}
    </section>
  )
}

const Table = ({ head, rows }) => (
  <div className="mt-3 overflow-x-auto">
    <table className="w-full text-xs font-mono tabular-nums">
      <thead>
        <tr className="text-left text-slate-500">
          {head.map((h, i) => (
            <th key={i} className="font-normal pr-3 pb-1 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-100 text-slate-800">
            {r.map((c, j) => (
              <td key={j} className="pr-3 py-1 whitespace-nowrap">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default function WorkbenchPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const entry = useActive()
  const g = entry.giant
  const num = (v, d = 2) => (v != null && Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const int = (v) => (v != null && Number.isFinite(v) ? Math.round(v).toLocaleString(t.locale) : '–')
  const opts = { sources: entry.sources }
  const shape = useCard(entry, 'shape', () => shapeJob(g, opts))
  const degrees = useCard(entry, 'degrees', () => degreeJob(g))
  const centrality = useCard(entry, 'centrality', () => centralityJob(g, opts))
  const mixing = useCard(entry, 'mixing', () => mixingJob(g))
  // Louvain and the weights take a moment at most: they run at once on the
  // airports and on a button elsewhere.
  const [comm, setComm] = useState({ key: null, run: 0 })
  const commRun = comm.key === entry.key ? comm.run : entry.id === 'airports' ? 0 : -1
  const community = useMemo(() => {
    if (!g || commRun < 0) return null
    const now = communities(g, commRun)
    const before = commRun > 0 ? communities(g, commRun - 1) : null
    return { ...now, previous: before ? agreement(now.partition, before.partition) : null, labels: againstLabels(g, now.partition) }
  }, [g, commRun])
  const [wKey, setWKey] = useState(null)
  const weights = useMemo(() => (g && g.w && (wKey === entry.key || entry.id === 'airports') ? weightsReport(g) : null), [g, wKey, entry])

  if (!g)
    return (
      <div>
        <NetworkPicker lang={lang} active={entry} full />
        <p className="mt-3 text-sm text-slate-600">{t.noNet}</p>
      </div>
    )

  const s = shape.data
  const d = degrees.data
  const c = centrality.data
  const m = mixing.data
  const name = (v) => shortName(entry, v)
  const nullRow = (label, x, dec) => [label, num(x.observed, dec), x.mean == null || !Number.isFinite(x.mean) ? '–' : `${num(x.mean, dec)} ± ${num(x.sd, dec)}`, num(x.z, 1)]
  const ratios = s && s.null.distance.mean ? ['clustering', 'transitivity', 'distance'].map((id) => (s.null[id].mean > 0 ? s.null[id].observed / s.null[id].mean : 0)) : null
  const fav = (x) => (x.p < 0.1 ? (x.R > 0 ? t.favours.pos : t.favours.neg) : t.favours.none)
  const richPts = m ? m.rich.filter((x) => x.k >= 1 && Number.isFinite(x.ratio)) : []
  const richMax = richPts.reduce((a, x) => Math.max(a, x.ratio), 0)
  const scatter = c && c.done !== false && c.betweenness ? c.top.betweenness.length && Array.from(c.betweenness, (b, v) => [c.degree[v], b]).filter((p) => p[1] > 0).sort((x, y) => y[1] - x[1]).slice(0, 800) : null

  return (
    <div>
      <NetworkPicker lang={lang} active={entry} full />
      <p className="mt-3 text-xs text-slate-500 leading-snug">{t.giant(int(g.n), int(g.whole.n))}</p>
      {entry.sources && <p className="mt-1 text-xs text-orange-700 leading-snug" data-sampled={entry.sources.length}>{t.sampled(entry.sources.length)}</p>}

      <div className="mt-3 grid gap-4 lg:grid-cols-2 items-start" data-readout="workbench" data-net={entry.id} data-nodes={g.n} data-links={g.A.length}>
        <Card t={t} id="shape" card={shape} done={!!s}>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2" data-components={g.whole.components} data-sizes={g.whole.sizes.join(' ')}>
            <Stat label={t.nodes}>{int(g.whole.n)}</Stat>
            <Stat label={t.links}>{int(g.whole.links)}</Stat>
            <Stat label={t.components}>{int(g.whole.components)}</Stat>
            {g.whole.components > 1 && <Stat label={t.sizes} wide>{g.whole.sizes.slice(0, 8).join(', ')}{g.whole.sizes.length > 8 ? ', …' : ''}</Stat>}
          </div>
          {s && (
            <div data-values="shape" data-distance={num(s.distance, 4)} data-diameter={s.diameter} data-clustering={num(s.clustering, 4)} data-null-clustering={num(s.null.clustering.mean, 3)} data-null-distance={num(s.null.distance.mean, 2)} data-null-r={num(s.null.r.mean, 3)} data-z-r={num(s.null.r.z, 1)}>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label={t.density}>{num(s.density, 4)}</Stat>
                <Stat label={t.meanK}>{num(s.meanK, 2)}</Stat>
                <Stat label={t.maxK}>{int(s.maxK)}</Stat>
                <Stat label={t.diameter}>{int(s.diameter)}</Stat>
              </div>
              <Table head={[t.measure, t.here, t.rewired, t.z]} rows={[nullRow(t.distance, s.null.distance, 2), nullRow(t.clustering, s.null.clustering, 3), nullRow(t.transitivity, s.null.transitivity, 3), nullRow(t.r, s.null.r, 3)]} />
              {ratios && (
                <div className="mt-3 max-w-xs">
                  <Eyebrow>{t.ratio}</Eyebrow>
                  <Chart x={{ min: 0, max: 3, ticks: [0.5, 1.5, 2.5], format: (v) => t.short[['clustering', 'transitivity', 'distance'][Math.floor(v)]] }} y={{ min: 0, max: Math.max(2, Math.ceil(Math.max(...ratios))), ticks: [0, 1, Math.max(2, Math.ceil(Math.max(...ratios)))] }} height={130} aria={t.aria.ratio} series={[{ points: [[0, 1], [3, 1]], color: MUTED, dashed: true, width: 1 }]}>
                    {({ sx, sy }) => ratios.map((v, i) => <rect key={i} x={sx(i + 0.25)} y={sy(v)} width={sx(i + 0.75) - sx(i + 0.25)} height={Math.max(0, sy(0) - sy(v))} fill={ORANGE_DARK} />)}
                  </Chart>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card t={t} id="degrees" card={degrees} done={!!d}>
          {d && (
            <div data-values="degrees" data-median={d.median} data-max={d.max} data-kmin={d.fit ? d.fit.kMin : ''} data-alpha={d.fit ? num(d.fit.alpha, 2) : ''} data-p={d.p == null ? '' : num(d.p, 3)} data-verdict={d.verdict} data-drift={d.at.map((x) => `${x.kMin}:${num(x.alpha, 2)}`).join(' ')}>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label={t.median}>{num(d.median, 0)}</Stat>
                <Stat label={t.maxK}>{int(d.max)}</Stat>
                <Stat label={t.ones}>{num(d.ones, 3)}</Stat>
                {d.fit && <Stat label={t.kMin}>{int(d.fit.kMin)}</Stat>}
                {d.fit && <Stat label={t.alpha}>{`${num(d.fit.alpha, 2)} ± ${num(d.fit.se, 2)}`}</Stat>}
                {d.fit && <Stat label={t.tail}>{int(d.fit.tail)}</Stat>}
                {d.fit && <Stat label={t.p(d.sets)}>{d.p == null ? '–' : d.p === 0 ? `< ${num(1 / d.sets, 3)}` : num(d.p, 3)}</Stat>}
                <Stat label={t.verdict} wide>
                  <span style={{ color: ORANGE_DARK }}>{t.verdicts[d.verdict]}</span>
                </Stat>
              </div>
              {!d.fit && <p className="mt-2 text-sm text-slate-600">{t.noFit}</p>}
              {d.compare && <Table head={[t.against, 'R', 'p', '']} rows={['lognormal', 'exponential', 'cutoff'].map((id) => [t.cand[id], num(d.compare[id].R, 1), d.compare[id].p < 0.001 ? `< ${num(0.001, 3)}` : num(d.compare[id].p, 3), fav(d.compare[id])])} />}
              {d.at.length > 0 && <Table head={[t.drift, ...d.at.map((x) => String(x.kMin))]} rows={[['α', ...d.at.map((x) => num(x.alpha, 2))]]} />}
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Eyebrow>{t.ccdf}</Eyebrow>
                  <Chart x={{ ...logAxis(1, d.max), label: 'k' }} y={logAxis(1 / d.n, 1)} height={150} aria={t.aria.ccdf} series={[...(d.fit ? [{ points: [d.fit.kMin, d.max].map((k) => [k, (d.fit.tail / d.n) * (k / d.fit.kMin) ** (1 - d.fit.alpha)]), color: MUTED, dashed: true, width: 1.2 }] : []), { points: d.ccdf, color: ORANGE_DARK, line: false, dots: 1.6 }]} />
                </div>
                {d.scan.length > 1 && (
                  <div className="min-w-0">
                    <Eyebrow>{t.alphaChart}</Eyebrow>
                    <Chart x={{ ...logAxis(1, d.scan[d.scan.length - 1][0]), label: 'k_min' }} y={{ min: 1, max: Math.max(3, Math.ceil(Math.max(...d.scan.map((x) => x[1])))), ticks: [1, 2, 3, Math.max(3, Math.ceil(Math.max(...d.scan.map((x) => x[1]))))].filter((v, i, a) => a.indexOf(v) === i) }} height={150} aria={t.aria.alpha} series={[{ points: d.scan, color: INK, width: 1.5 }]} marks={d.fit ? [{ x: d.fit.kMin, color: ORANGE_DARK, dashed: true }] : []} />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card t={t} id="centrality" card={centrality} done={!!(c && c.top)}>
          {c && c.top && (
            <div data-values="centrality" data-top-degree={c.top.degree.slice(0, 5).map((v) => g.names[v]).join(' ')} data-top-betweenness={c.top.betweenness.slice(0, 5).map((v) => g.names[v]).join(' ')} data-rho={num(c.rho, 3)} data-zero={num(c.zeroShare, 3)}>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label={t.rho}>{num(c.rho, 3)}</Stat>
                <Stat label={t.zero}>{num(c.zeroShare, 3)}</Stat>
              </div>
              <Table head={['', ...['degree', 'betweenness', 'closeness', 'pagerank'].map((id) => t.measures[id])]} rows={c.top.degree.map((_, i) => [String(i + 1), ...['degree', 'betweenness', 'closeness', 'pagerank'].map((id) => (c.top[id][i] == null ? '' : `${name(c.top[id][i])} ${id === 'degree' ? int(c.degree[c.top.degree[i]]) : num(c[id][c.top[id][i]], id === 'closeness' ? 3 : 4)}`))])} />
              {scatter && scatter.length > 2 && (
                <div className="mt-3 max-w-sm">
                  <Eyebrow>{t.scatter}</Eyebrow>
                  <Chart x={{ ...logAxis(1, Math.max(...scatter.map((p) => p[0]))), label: 'k' }} y={logAxis(Math.min(...scatter.map((p) => p[1])), Math.max(...scatter.map((p) => p[1])))} height={160} aria={t.aria.scatter} series={[{ points: scatter, color: ORANGE_DARK, line: false, dots: 1.4, opacity: 0.8 }]} />
                </div>
              )}
            </div>
          )}
        </Card>

        <Card t={t} id="mixing" card={mixing} done={!!m}>
          {m && (
            <div data-values="mixing" data-r={num(m.r, 4)} data-rho={num(m.rho, 3)} data-null-r={num(m.null.mean, 3)} data-z={num(m.null.z, 1)} data-rich-max={num(richMax, 2)}>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label={t.r}>{num(m.r, 3)}</Stat>
                <Stat label={t.rhoS}>{num(m.rho, 3)}</Stat>
                <Stat label={t.slope}>{num(m.slope, 2)}</Stat>
                <Stat label={t.rNull}>{`${num(m.null.mean, 3)} ± ${num(m.null.sd, 3)}`}</Stat>
                <Stat label={t.z}>{num(m.null.z, 1)}</Stat>
                <Stat label={t.richMax}>{richPts.length ? num(richMax, 2) : '–'}</Stat>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <Eyebrow>{t.knn}</Eyebrow>
                  <Chart x={{ ...logAxis(1, Math.max(...m.knn.map((p) => p[0]))), label: 'k' }} y={logAxis(Math.min(...m.knn.map((p) => p[1])), Math.max(...m.knn.map((p) => p[1])))} height={150} aria={t.aria.knn} series={[{ points: m.knn, color: ORANGE_DARK, width: 1.2, dots: 1.8 }]} />
                </div>
                {richPts.length > 1 && (
                  <div className="min-w-0">
                    <Eyebrow>{t.rich}</Eyebrow>
                    <Chart x={{ ...logAxis(1, Math.max(2, richPts[richPts.length - 1].k)), label: 'k' }} y={{ min: 0.5, max: Math.max(1.5, Math.ceil(richMax * 2) / 2), ticks: [0.5, 1, Math.max(1.5, Math.ceil(richMax * 2) / 2)], format: (v) => num(v, 1) }} height={150} aria={t.aria.rich} series={[{ points: [[1, 1], [Math.max(2, richPts[richPts.length - 1].k), 1]], color: MUTED, dashed: true, width: 1 }, { points: richPts.map((x) => [x.k, x.ratio]), color: INK, width: 1.5 }]} />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card t={t} id="community" done={!!community}>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill primary={!community} onClick={() => setComm({ key: entry.key, run: Math.max(0, commRun + 1) })} data-action="run">
              {community ? t.runAgain : t.run}
            </Pill>
          </div>
          {community && (
            <div data-values="community" data-run={commRun} data-q={num(community.Q, 4)} data-groups={community.count} data-previous={community.previous == null ? '' : num(community.previous, 3)} data-nmi={community.labels ? num(community.labels.nmi, 3) : ''} data-hubs={community.groups.slice(0, 8).map((x) => `${x.size}:${g.names[x.hub]}`).join(' ')}>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label={t.runNo}>{commRun + 1}</Stat>
                <Stat label={t.Q}>{num(community.Q, 3)}</Stat>
                <Stat label={t.groups}>{int(community.count)}</Stat>
                <Stat label={t.prev}>{num(community.previous, 3)}</Stat>
                {community.labels && <Stat label={t.labels((LABEL_NAMES[entry.id] || {})[lang] || '')}>{num(community.labels.nmi, 3)}</Stat>}
                {community.labels && <Stat label={t.qLabels}>{num(community.labels.Q, 3)}</Stat>}
              </div>
              <div className="mt-3 max-w-sm">
                <Eyebrow>{t.groupsTitle}</Eyebrow>
                <Chart x={{ min: 0, max: Math.min(community.count, 30), ticks: [] }} y={{ min: 0, max: community.groups[0].size, ticks: [0, community.groups[0].size] }} height={120} aria={t.aria.groups} series={[]}>
                  {({ sx, sy }) => community.groups.slice(0, 30).map((x, i) => <rect key={i} x={sx(i) + 0.5} y={sy(x.size)} width={Math.max(1, sx(i + 1) - sx(i) - 1)} height={Math.max(0.5, sy(0) - sy(x.size))} fill={groupColor(i)} />)}
                </Chart>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-snug">
                <span className="font-mono uppercase tracking-wider text-slate-500">{t.hubs}: </span>
                {community.groups.slice(0, 8).map((x) => `${name(x.hub)} (${int(x.size)})`).join(', ')}
                {community.count > 8 ? `, ${t.more(community.count - 8)}` : ''}
              </p>
            </div>
          )}
        </Card>

        <Card t={t} id="weights" done={!!weights}>
          {!g.w && <p className="mt-2 text-sm text-slate-600">{t.noWeights}</p>}
          {g.w && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill primary={!weights} onClick={() => setWKey(entry.key)} disabled={!!weights} data-action="run">
                {t.run}
              </Pill>
            </div>
          )}
          {weights && (
            <div data-values="weights" data-beta={num(weights.beta, 2)} data-ones={num(weights.ones, 3)} data-max={weights.max} data-backbone={weights.backbone.links}>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Stat label={t.beta}>{num(weights.beta, 2)}</Stat>
                <Stat label={t.w1}>{num(weights.ones, 3)}</Stat>
                <Stat label={t.wMean}>{num(weights.mean, 2)}</Stat>
                <Stat label={t.wMax}>{`${num(weights.max, 0)}${weights.maxLink ? ` (${g.names[weights.maxLink[0]]}–${g.names[weights.maxLink[1]]})` : ''}`}</Stat>
                <Stat label={t.backbone} wide>{t.backboneValue(int(weights.backbone.links), num(weights.backbone.linkShare, 3), int(weights.backbone.nodes))}</Stat>
              </div>
              {weights.rows.length > 1 && (
                <div className="mt-3 max-w-sm">
                  <Eyebrow>{t.strength}</Eyebrow>
                  <Chart x={{ ...logAxis(1, weights.rows[weights.rows.length - 1][0]), label: 'k' }} y={{ ...logAxis(Math.min(...weights.rows.map((r) => r[1])), Math.max(...weights.rows.map((r) => r[1]))), label: 's', labelSide: 'left' }} height={150} aria={t.aria.strength} series={[{ points: [weights.rows[0][0], weights.rows[weights.rows.length - 1][0]].map((k) => [k, weights.c * k ** weights.beta]), color: MUTED, dashed: true, width: 1.2 }, { points: weights.rows, color: ORANGE_DARK, line: false, dots: 2 }]} />
                  <Legend items={[{ label: `s = ${num(weights.c, 2)} k^${num(weights.beta, 2)}`, color: SLATE, dashed: true }]} />
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
