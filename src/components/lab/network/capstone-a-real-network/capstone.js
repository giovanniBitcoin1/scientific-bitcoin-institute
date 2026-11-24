import { buildCSR, bfsDistances, connectedComponents, sampleNodes } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { swapper, SWAPS_PER_LINK } from '../what-are-we-measuring/nullmodels.js'
import { triangleCounts } from '../what-are-we-measuring/sampling.js'
import { undirected, pagerank, spearman } from '../centrality/centrality.js'
import { tabulate, fitRecipe, mleAt, bootstrapJob, compare, verdict, MIN_TAIL } from '../heavy-tails-done-right/fit.js'
import { pearsonR, spearmanRho, knnCurve, knnSlope, richClub, RC_MIN_NODES, giantCurve, randomOrder, attackOrder, degreesOf } from '../who-connects-to-whom/mixing.js'
import { louvain, nmi, modularity } from '../communities/community.js'
import { strengths, strengthExponent, backbone } from '../weights-flows-navigation/weights.js'
import { moments, criticalFraction, recomputedDegreeOrder, loadsFrom, largestComponent } from '../robustness-and-cascades/robust.js'
import { thresholdT, r0, percolationMean, spread } from '../epidemics-on-networks/epidemic.js'
import { needByShare, cascade } from '../social-contagion-network-effects/contagion.js'

// Network Lab module 14, "Capstone: a real network". No new method: every
// measure here is the function of the module that introduced it, put in the
// order of the course and made to run on any network { n, A, B } (simple,
// undirected), with optional weights w, names, labels and coordinates.
//
//   module 01  graphUtils.js            components, distances
//   module 02  nullmodels.js, sampling  the degree-preserving swap, triangles
//   module 03  centrality.js            PageRank, Spearman
//   module 05  fit.js                   the power-law recipe
//   module 08  mixing.js                r, ρ, k_nn, rich club, giantCurve
//   module 09  community.js             Louvain, modularity, NMI
//   module 10  weights.js               strength, its exponent, the backbone
//   module 11  robust.js                orders of removal, Brandes with a mask
//   module 12  epidemic.js              T_c, percolation of links, SI in steps
//   module 13  contagion.js             threshold cascades
//
// Shared by the page, by scripts/lab/build-network-14.mjs (through
// precompute.js) and by scripts/lab/check-network-14.mjs.

// ---------------------------------------------------------------- limits and seeds

export const EXACT_LIMIT = 5000 // up to here every source is used: distances and betweenness are exact
export const SAMPLE_SOURCES = 300 // above it, this many sampled sources
export const MAX_NODES = 30000 // nothing is run above these
export const MAX_LINKS = 150000

// Fixed once, before any result was seen (working rule on seeds).
export const SEEDS = { sources: 1407, rewire: 1401, bootstrap: 1402, louvain: 1403, removal: 1404, percolation: 1405, spread: 1406 }
export const seedOf = (seed, j) => (Math.imul(seed ^ 0x9e3779b9, 2654435761) + Math.imul(j + 1, 40503)) >>> 0

export const REWIRINGS = 10
export const BOOT_SETS = 200
export const KMINS = [2, 5, 10, 20, 30]
export const RANDOM_ORDERS = 10
export const FRACTIONS = Array.from({ length: 101 }, (_, i) => i / 100)
export const PERC_T = [0.005, 0.01, 0.015, 0.02, 0.03, 0.05, 0.075, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
export const PERC_RUNS = 10
export const PHI_DEFAULT = 0.18
export const GLOBAL = 0.1 // a cascade is global above this share of the nodes
export const TOP_SEEDS = 20
export const BETA_DEFAULT = 0.1
export const SPREAD_RUNS = 20
export const BACKBONE_ALPHA = 0.05
export const EARTH_KM = 6371

export function drain(job) {
  for (const _ of job.iter);
  return job.snapshot()
}

// ---------------------------------------------------------------- networks

// The airports from src/data/lab/networks/airports-2014.json.
export function airportsNet(data) {
  const n = data.nodes.code.length
  const L = data.links.length / 3
  const A = new Int32Array(L)
  const B = new Int32Array(L)
  const w = new Float64Array(L)
  for (let e = 0; e < L; e++) {
    A[e] = data.links[3 * e]
    B[e] = data.links[3 * e + 1]
    w[e] = data.links[3 * e + 2]
  }
  return {
    id: 'airports',
    n,
    A,
    B,
    w,
    names: data.nodes.code,
    geo: { lat: data.nodes.lat, lng: data.nodes.lng },
    labels: { of: Int32Array.from(data.nodes.region), names: data.regions },
    nodes: data.nodes,
    countries: data.countries,
  }
}

// A network stored as { nodes: [name], edges: [[a, b]] } (modules 03 and 09).
export function storedNet(id, data, labels = null) {
  return {
    id,
    n: data.nodes.length,
    A: Int32Array.from(data.edges, (e) => e[0]),
    B: Int32Array.from(data.edges, (e) => e[1]),
    w: null,
    names: data.nodes,
    labels,
  }
}

// The largest component as a network of its own; orig[i] is the node of the
// whole network that node i stands for, and sizes lists every component.
export function giantOf(net) {
  const g = buildCSR(net.n, net.A, net.B)
  const comp = connectedComponents(g)
  const big = comp.sizes.indexOf(comp.largest)
  const map = new Int32Array(net.n).fill(-1)
  const orig = []
  for (let v = 0; v < net.n; v++)
    if (comp.label[v] === big) {
      map[v] = orig.length
      orig.push(v)
    }
  const A = []
  const B = []
  const w = []
  for (let e = 0; e < net.A.length; e++)
    if (map[net.A[e]] >= 0) {
      A.push(map[net.A[e]])
      B.push(map[net.B[e]])
      if (net.w) w.push(net.w[e])
    }
  const pick = (list) => orig.map((v) => list[v])
  return {
    id: net.id,
    n: orig.length,
    A: Int32Array.from(A),
    B: Int32Array.from(B),
    w: net.w ? Float64Array.from(w) : null,
    names: pick(net.names),
    geo: net.geo ? { lat: pick(net.geo.lat), lng: pick(net.geo.lng) } : null,
    labels: net.labels ? { of: Int32Array.from(pick(net.labels.of)), names: net.labels.names } : null,
    orig: Int32Array.from(orig),
    map,
    whole: { n: net.n, links: net.A.length, components: comp.count, sizes: [...comp.sizes].sort((x, y) => y - x) },
  }
}

// The sources of the searches: null (every node) up to EXACT_LIMIT nodes,
// otherwise SAMPLE_SOURCES nodes drawn with a fixed seed.
export function sourcesFor(n, limit = EXACT_LIMIT, count = SAMPLE_SOURCES) {
  if (n <= limit) return null
  return Int32Array.from(sampleNodes(n, Math.min(count, n), mulberry32(SEEDS.sources))).sort()
}

export const tooLarge = (n, links) => (n > MAX_NODES ? 'nodes' : links > MAX_LINKS ? 'links' : null)

// ---------------------------------------------------------------- geography

const RAD = Math.PI / 180

// Great-circle distance in kilometres (haversine formula, radius 6,371 km).
export function greatCircle(lat1, lng1, lat2, lng2) {
  const a = Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lng2 - lng1) * RAD) / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function linkLengths(net) {
  const { lat, lng } = net.geo
  return Float64Array.from(net.A, (a, e) => greatCircle(lat[a], lng[a], lat[net.B[e]], lng[net.B[e]]))
}

// The `count` longest links, longest first: [{ e, km }].
export function longestLinks(net, count = 10, km = linkLengths(net)) {
  return Array.from(km, (_, e) => e)
    .sort((x, y) => km[y] - km[x] || x - y)
    .slice(0, count)
    .map((e) => ({ e, km: km[e] }))
}

export function lengthSummary(km) {
  const sorted = Float64Array.from(km).sort()
  const m = sorted.length
  let under = 0
  let over = 0
  for (const x of sorted) {
    if (x < 1000) under++
    if (x > 5000) over++
  }
  return { median: m % 2 ? sorted[(m - 1) / 2] : (sorted[m / 2 - 1] + sorted[m / 2]) / 2, under1000: under / m, over5000: over / m }
}

// ---------------------------------------------------------------- card 1: size and shape

const median = (values) => {
  const s = Float64Array.from(values).sort()
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN
}

// What needs no search: counts, degrees, triangles, r.
export function basicStats(net) {
  const g = buildCSR(net.n, net.A, net.B)
  const k = degreesOf(net)
  const tri = triangleCounts(g)
  const L = net.A.length
  let maxK = 0
  for (let v = 0; v < net.n; v++) if (k[v] > maxK) maxK = k[v]
  return { n: net.n, links: L, density: net.n > 1 ? (2 * L) / (net.n * (net.n - 1)) : 0, meanK: net.n ? (2 * L) / net.n : 0, maxK, clustering: tri.avgClustering, transitivity: tri.transitivity, r: pearsonR(net, k) }
}

// Mean distance over the pairs that are joined, and the largest distance
// found, by breadth-first search from `sources` (null: every node, exact).
function* distanceIter(net, sources, acc) {
  const g = buildCSR(net.n, net.A, net.B)
  const dist = new Int32Array(net.n)
  const queue = new Int32Array(net.n)
  const count = sources ? sources.length : net.n
  for (let i = 0; i < count; i++) {
    bfsDistances(g, sources ? sources[i] : i, dist, queue)
    for (let v = 0; v < net.n; v++)
      if (dist[v] > 0) {
        acc.sum += dist[v]
        acc.pairs++
        if (dist[v] > acc.max) acc.max = dist[v]
      }
    if (i % 16 === 15) yield (i + 1) / count
  }
}

export function distances(net, sources = null) {
  const acc = { sum: 0, pairs: 0, max: 0 }
  for (const _ of distanceIter(net, sources, acc));
  return { mean: acc.pairs ? acc.sum / acc.pairs : NaN, diameter: acc.max }
}

// A chain of module 02's swaps (degrees kept, no self-links, no repeated
// links): `count` states, SWAPS_PER_LINK · L attempts apart and as many
// before the first. `visit(net)` is called at each state. Yields progress.
function* rewirings(net, seed, count, visit, from = 0, span = 1) {
  const sw = swapper(net, mulberry32(seed))
  const L = net.A.length
  const total = SWAPS_PER_LINK * L
  const chunk = Math.max(1, Math.floor(L / 2))
  for (let s = 0; s < count; s++) {
    for (let a = 0; a < total; a += chunk) {
      sw.mix(Math.min(chunk, total - a))
      yield from + (span * (s + a / total)) / count
    }
    yield* visit(sw.net, s)
    yield from + (span * (s + 1)) / count
  }
}

function summary(values, observed) {
  const m = values.length
  if (!m) return { observed, mean: NaN, sd: NaN, z: NaN }
  const mean = values.reduce((a, b) => a + b, 0) / m
  const sd = m > 1 ? Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (m - 1)) : NaN
  return { observed, mean, sd, z: sd > 1e-12 ? (observed - mean) / sd : NaN }
}

// Card 1 as a job: the network's own numbers, then the same numbers for
// `count` rewirings that keep the degrees.
export function shapeJob(net, { seed = SEEDS.rewire, count = REWIRINGS, sources = sourcesFor(net.n) } = {}) {
  const basic = basicStats(net)
  const own = { sum: 0, pairs: 0, max: 0 }
  const samples = { clustering: [], transitivity: [], distance: [], r: [] }
  let phase = 0
  function* iter() {
    for (const p of distanceIter(net, sources, own)) yield 0.1 * p
    phase = 1
    if (net.A.length < 2) return
    yield* rewirings(net, seed, count, function* (rw) {
      const b = basicStats(rw)
      const acc = { sum: 0, pairs: 0, max: 0 }
      yield* distanceIter(rw, sources, acc)
      samples.clustering.push(b.clustering)
      samples.transitivity.push(b.transitivity)
      samples.r.push(b.r)
      samples.distance.push(acc.pairs ? acc.sum / acc.pairs : NaN)
    }, 0.1, 0.9)
    phase = 2
  }
  const snapshot = () => {
    const distance = own.pairs ? own.sum / own.pairs : NaN
    return {
      done: phase === 2 || (phase === 1 && net.A.length < 2),
      sampled: sources ? sources.length : 0,
      ...basic,
      distance: phase ? distance : NaN,
      diameter: phase ? own.max : NaN,
      rewirings: samples.r.length,
      null: {
        clustering: summary(samples.clustering, basic.clustering),
        transitivity: summary(samples.transitivity, basic.transitivity),
        distance: summary(samples.distance, distance),
        r: summary(samples.r, basic.r),
      },
    }
  }
  return { iter: iter(), snapshot }
}

// ---------------------------------------------------------------- card 2: degrees

// Module 05's recipe on the degrees: k_min by the KS distance, α by exact
// maximum likelihood, the bootstrap test, the comparison with the
// alternatives, and α at every k_min (the drift).
export function degreeJob(net, { sets = BOOT_SETS, seed = SEEDS.bootstrap } = {}) {
  const k = Int32Array.from(degreesOf(net)).filter((x) => x > 0)
  const tab = tabulate(k)
  const fit = tab.ks.length > 1 ? fitRecipe(tab, { scan: true }) : null
  const mom = moments(k)
  const at = []
  for (const kMin of KMINS) {
    const i = tab.ks.indexOf(kMin)
    if (i >= 0 && i < tab.ks.length - 1 && tab.tailN[i] >= MIN_TAIL) at.push({ kMin, alpha: mleAt(tab, i).gamma, tail: tab.tailN[i] })
  }
  const cmp = fit ? compare(tab, fit) : null
  const boot = fit ? bootstrapJob(tab, fit, sets, seed) : null
  let ones = 0
  for (const x of k) if (x === 1) ones++
  const kMax = tab.ks[tab.ks.length - 1]
  function* iter() {
    if (boot) yield* boot.iter
  }
  const snapshot = () => {
    const b = boot ? boot.snapshot() : null
    const finished = !boot || b.finished
    const v = verdict(fit, finished && b ? b.p : null, cmp, kMax)
    return {
      done: finished,
      n: k.length,
      mean: mom.mean,
      mean2: mom.mean2,
      median: median(k),
      max: kMax,
      ones: k.length ? ones / k.length : 0,
      ccdf: tab.ks.map((x, i) => [x, tab.tailN[i] / tab.n]),
      fit: fit ? { kMin: fit.kMin, alpha: fit.gamma, se: fit.se, tail: fit.nTail, D: fit.D } : null,
      scan: fit ? fit.scan.map((f) => [f.kMin, f.gamma]) : [],
      at,
      sets: b ? b.done : 0,
      worse: b ? b.worse : 0,
      p: b && b.done ? b.p : null,
      compare: cmp ? { exponential: { R: cmp.exponential.R, p: cmp.exponential.p }, lognormal: { R: cmp.lognormal.R, p: cmp.lognormal.p }, cutoff: { R: cmp.cutoff.R, p: cmp.cutoff.p } } : null,
      verdict: v.kind,
      better: v.better || [],
    }
  }
  return { iter: iter(), snapshot }
}

// ---------------------------------------------------------------- card 3: centrality

// The `count` largest values, largest first (ties: the lowest index).
export function topBy(values, count = 10) {
  return Array.from(values, (_, i) => i)
    .sort((a, b) => values[b] - values[a] || a - b)
    .slice(0, count)
}

// Place of node v when the values are sorted, largest first; nodes with a
// larger value come before it (1 = first; ties share the best place).
export function placeOf(values, v) {
  let before = 0
  for (let i = 0; i < values.length; i++) if (values[i] > values[v]) before++
  return before + 1
}

// Degree, betweenness (Brandes, module 11's version, one source at a time),
// closeness and PageRank. With sampled sources betweenness is scaled by
// N / sources and closeness is the inverse mean distance to the sources.
// Betweenness is normalised by the (N − 1)(N − 2)/2 pairs of other nodes.
export function centralityJob(net, { sources = sourcesFor(net.n) } = {}) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const degree = Int32Array.from(degreesOf(net))
  const raw = new Float64Array(n)
  const far = new Float64Array(n)
  const reach = new Int32Array(n)
  const count = sources ? sources.length : n
  let result = null
  function* iter() {
    const ws = {}
    for (let i = 0; i < count; i++) {
      const s = sources ? sources[i] : i
      loadsFrom(g, null, false, raw, ws, s, s + 1)
      const dist = ws.dist
      for (let v = 0; v < n; v++)
        if (dist[v] > 0) {
          far[v] += dist[v]
          reach[v]++
        }
      if (i % 8 === 7) yield (0.95 * (i + 1)) / count
    }
    const scale = (sources ? n / count : 1) / Math.max(1, (n - 1) * (n - 2))
    const betweenness = Float64Array.from(raw, (x) => x * scale)
    const closeness = Float64Array.from(far, (f, v) => (f > 0 ? (sources ? reach[v] / f : (reach[v] / (n - 1)) * (reach[v] / f)) : 0))
    yield 0.96
    const pr = pagerank(undirected(net), 0.85, { tol: 1e-10 }).vector
    let zero = 0
    for (let v = 0; v < n; v++) if (betweenness[v] < 1e-12) zero++
    result = {
      degree,
      betweenness,
      closeness,
      pagerank: pr,
      top: { degree: topBy(degree), betweenness: topBy(betweenness), closeness: topBy(closeness), pagerank: topBy(pr) },
      rho: spearman(degree, betweenness),
      zeroShare: n ? zero / n : 0,
    }
  }
  return { iter: iter(), snapshot: () => ({ done: !!result, sampled: sources ? count : 0, ...(result || {}) }) }
}

// Figure F2 labels the nodes that are among the OUT_TOP of highest
// betweenness with fewer than OUT_DEGREE links.
export const OUT_TOP = 60
export const OUT_DEGREE = 40
export const outliers = (degree, betweenness) => topBy(betweenness, OUT_TOP).filter((v) => degree[v] < OUT_DEGREE)

// ---------------------------------------------------------------- card 4: mixing

// r, ρ, k_nn(k) and the rich club, then r and the rich club of the same
// rewirings as card 1 (same seed, same chain).
export function mixingJob(net, { seed = SEEDS.rewire, count = REWIRINGS } = {}) {
  const k = degreesOf(net)
  const r = pearsonR(net, k)
  const rho = spearmanRho(net, k)
  const knn = knnCurve(net, k)
  const slope = knnSlope(knn, 3)
  const observed = richClub(net, k)
  const sums = new Float64Array(observed.max)
  const seen = new Float64Array(observed.max)
  const rs = []
  let finished = false
  function* iter() {
    if (net.A.length >= 2)
      yield* rewirings(net, seed, count, function* (rw) {
        rs.push(pearsonR(rw, k))
        const rc = richClub(rw, k)
        for (let d = 0; d < observed.max; d++)
          if (Number.isFinite(rc.phi[d])) {
            sums[d] += rc.phi[d]
            seen[d]++
          }
      })
    finished = true
  }
  const snapshot = () => {
    const rich = []
    for (let d = 0; d < observed.max; d++) {
      if (observed.nodes[d] < RC_MIN_NODES) continue
      const rand = seen[d] ? sums[d] / seen[d] : NaN
      rich.push({ k: d, nodes: observed.nodes[d], phi: observed.phi[d], rand, ratio: rand > 0 ? observed.phi[d] / rand : NaN })
    }
    return { done: finished, r, rho, knn: knn.map((p) => [p[0], p[1]]), slope, rewirings: rs.length, null: summary(rs, r), rich }
  }
  return { iter: iter(), snapshot }
}

// The rich-club ratio for the nodes of degree above k (NaN where it was not shown).
export const richAt = (rich, k) => {
  const p = rich.find((x) => x.k === k)
  return p ? p.ratio : NaN
}

// ---------------------------------------------------------------- card 5: communities

// One run of Louvain: the partition, Q, and the groups, largest first, each
// with its largest hub (ties: the lowest index).
export function communities(net, run = 0) {
  const res = louvain(net, { seed: seedOf(SEEDS.louvain, run) })
  const k = degreesOf(net)
  const groups = []
  for (let v = 0; v < net.n; v++) {
    const c = res.partition[v]
    if (!groups[c]) groups[c] = { id: c, size: 0, hub: v }
    groups[c].size++
    if (k[v] > k[groups[c].hub]) groups[c].hub = v
  }
  groups.sort((a, b) => b.size - a.size || a.id - b.id)
  return { run, partition: res.partition, Q: res.Q, count: groups.length, groups }
}

// Agreement (NMI, module 09) between a partition and the labels, over the
// nodes that have a label; and the modularity of the labels themselves, the
// nodes without one in a group of their own.
export function againstLabels(net, partition) {
  if (!net.labels) return null
  const lab = net.labels.of
  const x = []
  const y = []
  for (let v = 0; v < net.n; v++)
    if (lab[v] >= 0) {
      x.push(partition[v])
      y.push(lab[v])
    }
  const full = Int32Array.from(lab, (c) => (c >= 0 ? c : net.labels.names.length))
  return { nmi: nmi(Int32Array.from(x), Int32Array.from(y)), labelled: x.length, Q: modularity(net, full) }
}

export const agreement = (a, b) => nmi(a, b)

// ---------------------------------------------------------------- card 6: weights

export function weightsReport(net, alpha = BACKBONE_ALPHA) {
  if (!net.w) return null
  const sk = strengths(net, net.w)
  const fit = strengthExponent(sk.k, sk.s)
  const L = net.A.length
  let ones = 0
  let sum = 0
  let top = 0
  for (let e = 0; e < L; e++) {
    if (net.w[e] === 1) ones++
    sum += net.w[e]
    if (net.w[e] > net.w[top]) top = e
  }
  const bb = backbone(net, net.w, alpha, sk)
  return {
    beta: fit.slope,
    c: fit.c,
    rows: fit.rows.map((r) => [r.k, r.value]),
    ones: L ? ones / L : 0,
    mean: L ? sum / L : 0,
    max: L ? net.w[top] : 0,
    maxLink: L ? [net.A[top], net.B[top]] : null,
    backbone: { alpha, links: bb.links, linkShare: bb.linkShare, weightShare: bb.weightShare, nodes: bb.nodes, largest: bb.largest },
  }
}

// ---------------------------------------------------------------- stress tests

const sampleCurve = (curve, n) => FRACTIONS.map((f) => curve[Math.round(f * n)])

// The largest component (as a share of N) against the share of nodes
// removed: at random (the mean of `orders` orders), by degree in the order of
// the intact network and recomputed after every removal, and by the
// betweenness of the intact network when it is given.
export function removalCurves(net, { seed = SEEDS.removal, orders = RANDOM_ORDERS, betweenness = null } = {}) {
  const n = net.n
  const k = degreesOf(net)
  const random = mulberry32(seed)
  const mean = new Float64Array(FRACTIONS.length)
  for (let j = 0; j < orders; j++) {
    const c = sampleCurve(giantCurve(net, randomOrder(n, random)), n)
    for (let i = 0; i < mean.length; i++) mean[i] += c[i] / orders
  }
  const out = {
    random: Array.from(mean),
    degree: sampleCurve(giantCurve(net, attackOrder(k, random)), n),
    recomputed: sampleCurve(giantCurve(net, recomputedDegreeOrder(net)), n),
    betweenness: null,
  }
  if (betweenness) out.betweenness = sampleCurve(giantCurve(net, Int32Array.from(topBy(betweenness, n))), n)
  return out
}

export const curveAt = (curve, f) => curve[Math.round(f * 100)]

// What closing a set of nodes cuts off: the nodes still open that are no
// longer in the largest component.
export function closure(net, removed) {
  const g = buildCSR(net.n, net.A, net.B)
  const alive = new Uint8Array(net.n).fill(1)
  for (const v of removed) alive[v] = 0
  const lc = largestComponent(g, alive)
  const cut = []
  for (let v = 0; v < net.n; v++) if (alive[v] && lc.label[v] !== lc.id) cut.push(v)
  return { cut, left: lc.size / net.n }
}

// A germ: T_c and f_c from the moments, R0 at a transmissibility T.
export function thresholds(net) {
  const m = moments(degreesOf(net))
  return { ...m, Tc: thresholdT(m.mean, m.mean2), fc: criticalFraction(m.mean, m.mean2), r0: (T) => r0(T, m.mean, m.mean2) }
}

// The mean largest cluster (share of N) when each link is kept with probability T.
export function percolationCurve(net, { Ts = PERC_T, runs = PERC_RUNS, seed = SEEDS.percolation } = {}) {
  const random = mulberry32(seed)
  const ws = {}
  return Ts.map((T) => [T, percolationMean(net, T, runs, random, null, ws)])
}

// A fashion: a node adopts once a share phi of its neighbours has. The share
// of single seeds that start a cascade above GLOBAL of the nodes, from every
// node (or from the sampled seeds of a large network) and from the
// TOP_SEEDS nodes with most links, and the largest cascade.
export function cascadeShares(net, phi, { top = TOP_SEEDS, seeds = null } = {}) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const need = needByShare(g, phi)
  const ws = {}
  const count = seeds ? seeds.length : n
  let global = 0
  let largest = 0
  for (let i = 0; i < count; i++) {
    const size = cascade(g, [seeds ? seeds[i] : i], need, ws).size
    if (size > GLOBAL * n) global++
    if (size > largest) largest = size
  }
  const hubs = topBy(degreesOf(net), Math.min(top, n))
  let topGlobal = 0
  for (const v of hubs) if (cascade(g, [v], need, ws).size > GLOBAL * n) topGlobal++
  return { phi, all: count ? global / count : 0, largest: n ? largest / n : 0, top: topGlobal, of: hubs.length, seeds: count }
}

// ---------------------------------------------------------------- the spread

// SI in steps from one seed (module 12's `spread` with no recovery), `runs`
// times: the mean step of arrival at every node, and the first run whole.
export function arrivalJob(net, seed, beta = BETA_DEFAULT, { runs = SPREAD_RUNS, rngSeed = SEEDS.spread } = {}) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const random = mulberry32(seedOf(rngSeed, seed))
  const sum = new Float64Array(n)
  const hits = new Int32Array(n)
  let first = null
  let steps = 0
  let done = 0
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const s = spread(g, seed, beta, Infinity, random)
      if (!first) {
        first = s.when
        steps = s.steps
      }
      for (let v = 0; v < n; v++)
        if (s.when[v] >= 0) {
          sum[v] += s.when[v]
          hits[v]++
        }
      done++
      yield done / runs
    }
  }
  const snapshot = () => ({ done: done === runs, runs: done, seed, beta, first, steps, mean: Float64Array.from(sum, (x, v) => (hits[v] ? x / hits[v] : NaN)) })
  return { iter: iter(), snapshot }
}

export function flightsFrom(net, seed) {
  return bfsDistances(buildCSR(net.n, net.A, net.B), seed)
}

export function kmFrom(net, seed) {
  const { lat, lng } = net.geo
  return Float64Array.from(lat, (x, v) => greatCircle(lat[seed], lng[seed], x, lng[v]))
}

// Rank correlations of the mean arrival time with the distance in flights,
// the distance in kilometres (where there is a map) and the degree, over
// the nodes reached, the seed left out.
export function arrivalCorrelations(net, seed, mean) {
  const flights = flightsFrom(net, seed)
  const km = net.geo ? kmFrom(net, seed) : null
  const k = degreesOf(net)
  const t = []
  const f = []
  const d = []
  const q = []
  for (let v = 0; v < net.n; v++) {
    if (v === seed || !Number.isFinite(mean[v])) continue
    t.push(mean[v])
    f.push(flights[v])
    q.push(k[v])
    if (km) d.push(km[v])
  }
  return { reached: t.length, flights: spearman(t, f), km: km ? spearman(t, d) : null, degree: spearman(t, q) }
}
