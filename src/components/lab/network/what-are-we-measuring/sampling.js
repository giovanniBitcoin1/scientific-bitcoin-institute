import {
  buildCSR,
  bfsDistances,
  connectedComponents,
  clustering,
  erdosRenyiGnm,
  barabasiAlbert,
  wattsStrogatz,
} from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'

// Panel A, "The observer": a true network, seven ways of observing it, and
// the numbers read off both. Pure logic, shared by the panel and by
// scripts/lab/check-network-02.mjs.
//
// A network is { n, A, B }: n nodes and the link list as two parallel arrays
// (link e joins A[e] and B[e]), with no self-links and no repeated links.
// An observation returns the observed network in the same form, with its own
// node numbering, plus `nodeOf` (observed node → true node, or null when all
// nodes are kept under their own number) and method-specific extras.

// ---------------------------------------------------------------- Truth

export const TRUTH_N = 600

// Each preset can also be built smaller (the panel draws a 150-node copy):
// same model, same parameters, same average degree.
export const TRUTHS = {
  random: (seed, n = TRUTH_N) => ({ n, ...pick(erdosRenyiGnm(n, 3 * n, seed)) }),
  scaleFree: (seed, n = TRUTH_N) => ({ n, ...pick(barabasiAlbert(n, 3, seed)) }),
  smallWorld: (seed, n = TRUTH_N) => ({ n, ...pick(wattsStrogatz(n, 6, 0.05, seed)) }),
  dense: (seed, n = TRUTH_N) => ({ n, ...pick(erdosRenyiGnm(n, 10 * n, seed)) }),
}

function pick({ A, B }) {
  return { A, B }
}

export const csr = (net) => buildCSR(net.n, net.A, net.B)

// ---------------------------------------------------------------- Measures

// Triangles and connected triples from the local clustering of graphUtils:
// e_v = C_v · k_v(k_v − 1)/2 links among the neighbours of v, and every
// triangle is counted once at each of its three corners.
export function triangleCounts(g) {
  const cl = clustering(g)
  let corners = 0
  let triples = 0
  for (let v = 0; v < g.n; v++) {
    const k = g.offsets[v + 1] - g.offsets[v]
    const pairs = (k * (k - 1)) / 2
    triples += pairs
    corners += Math.round(cl.local[v] * pairs)
  }
  const triangles = corners / 3
  return { triangles, triples, transitivity: triples ? (3 * triangles) / triples : 0, avgClustering: cl.average }
}

// The three numbers of the bias curves: cheap enough for hundreds of samples.
export function quickStats(net) {
  const g = csr(net)
  const L = net.A.length
  const comp = connectedComponents(g)
  const tri = triangleCounts(g)
  return {
    n: net.n,
    L,
    meanDegree: net.n ? (2 * L) / net.n : 0,
    triangles: tri.triangles,
    triples: tri.triples,
    transitivity: tri.transitivity,
    giant: net.n ? comp.largest / net.n : 0,
  }
}

// Everything the panel reads off a network. Distances are exact (a search
// from every node of the largest component).
export function fullStats(net) {
  const g = csr(net)
  const n = net.n
  const L = net.A.length
  const degree = new Int32Array(n)
  let maxDegree = 0
  for (let v = 0; v < n; v++) {
    degree[v] = g.offsets[v + 1] - g.offsets[v]
    if (degree[v] > maxDegree) maxDegree = degree[v]
  }
  const histogram = new Array(maxDegree + 1).fill(0)
  for (let v = 0; v < n; v++) histogram[degree[v]]++

  const comp = connectedComponents(g)
  const big = comp.sizes.indexOf(comp.largest)
  const dist = new Int32Array(n)
  const queue = new Int32Array(n)
  let sum = 0
  let pairs = 0
  for (let s = 0; s < n; s++) {
    if (comp.label[s] !== big) continue
    bfsDistances(g, s, dist, queue)
    for (let v = 0; v < n; v++) {
      if (dist[v] > 0) {
        sum += dist[v]
        pairs++
      }
    }
  }
  const tri = triangleCounts(g)
  return {
    n,
    L,
    degree,
    maxDegree,
    histogram,
    meanDegree: n ? (2 * L) / n : 0,
    transitivity: tri.transitivity,
    triangles: tri.triangles,
    giant: n ? comp.largest / n : 0,
    largest: n ? comp.largest : 0,
    avgDistance: pairs ? sum / pairs : 0,
  }
}

// First and second moment of the degrees, and the percolation threshold
// p_c = ⟨k⟩ / (⟨k²⟩ − ⟨k⟩) below which a random sample has no giant component.
export function moments(net) {
  const k = new Int32Array(net.n)
  for (let e = 0; e < net.A.length; e++) {
    k[net.A[e]]++
    k[net.B[e]]++
  }
  let s1 = 0
  let s2 = 0
  for (let v = 0; v < net.n; v++) {
    s1 += k[v]
    s2 += k[v] * k[v]
  }
  const k1 = s1 / net.n
  const k2 = s2 / net.n
  return { k1, k2, friend: k1 ? k2 / k1 : 0, pc: k2 > k1 ? k1 / (k2 - k1) : Infinity }
}

// ---------------------------------------------------------------- Helpers

// The subgraph induced by the nodes with keep[v] = 1, renumbered 0 … n' − 1.
export function induced(net, keep) {
  const map = new Int32Array(net.n).fill(-1)
  const nodeOf = []
  for (let v = 0; v < net.n; v++) {
    if (keep[v]) {
      map[v] = nodeOf.length
      nodeOf.push(v)
    }
  }
  const A = []
  const B = []
  for (let e = 0; e < net.A.length; e++) {
    const a = map[net.A[e]]
    const b = map[net.B[e]]
    if (a >= 0 && b >= 0) {
      A.push(a)
      B.push(b)
    }
  }
  return { n: nodeOf.length, A: Int32Array.from(A), B: Int32Array.from(B), nodeOf }
}

const target = (net, f) => Math.max(1, Math.min(net.n, Math.round(f * net.n)))
const key = (n, a, b) => (a < b ? a * n + b : b * n + a)

// ---------------------------------------------------------------- Observations

// Random nodes: each node is kept with probability f, with the links among
// the kept nodes.
export function observeNodes(net, f, random) {
  const keep = new Uint8Array(net.n)
  for (let v = 0; v < net.n; v++) if (random() < f) keep[v] = 1
  return induced(net, keep)
}

// Random links: every node is kept, each link with probability f.
export function observeLinks(net, f, random) {
  const A = []
  const B = []
  for (let e = 0; e < net.A.length; e++) {
    if (random() < f) {
      A.push(net.A[e])
      B.push(net.B[e])
    }
  }
  return { n: net.n, A: Int32Array.from(A), B: Int32Array.from(B), nodeOf: null }
}

// Snowball: a random seed, then its neighbours, then theirs, wave after wave,
// until round(f·N) nodes are in (the last wave is cut where the quota is
// reached). If the seed's component runs out first, a new random seed starts
// another snowball. The sample is the subgraph induced by the nodes reached.
export function observeSnowball(net, f, random, g = csr(net)) {
  const want = target(net, f)
  const keep = new Uint8Array(net.n)
  const wave = new Int32Array(net.n).fill(-1)
  const queue = new Int32Array(net.n)
  let head = 0
  let tail = 0
  let waves = 0
  let seeds = 0
  while (tail < want) {
    if (head === tail) {
      let s
      do s = Math.floor(random() * net.n)
      while (keep[s])
      keep[s] = 1
      wave[s] = 0
      queue[tail++] = s
      seeds++
      continue
    }
    const u = queue[head++]
    for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end && tail < want; i++) {
      const v = g.neighbors[i]
      if (!keep[v]) {
        keep[v] = 1
        wave[v] = wave[u] + 1
        if (wave[v] > waves) waves = wave[v]
        queue[tail++] = v
      }
    }
  }
  return { ...induced(net, keep), waves, seeds }
}

// Random walk: from a random node with at least one link, step to a random
// neighbour until round(f·N) distinct nodes have been visited (or maxSteps).
// The walker reports the true degree of the node it stands on at every step:
// `plain` is the ordinary average of those degrees, `harmonic` the average
// with each visit weighted by 1/k, that is steps / Σ(1/k). The sample is the
// subgraph induced by the visited nodes.
export function observeWalk(net, f, random, g = csr(net), maxSteps = 400 * net.n) {
  const want = target(net, f)
  const keep = new Uint8Array(net.n)
  const deg = (v) => g.offsets[v + 1] - g.offsets[v]
  let v
  let guard = 0
  do v = Math.floor(random() * net.n)
  while (deg(v) === 0 && ++guard < 10000)
  let distinct = 0
  let steps = 0
  let sumK = 0
  let sumInv = 0
  if (deg(v) === 0) return { ...induced(net, keep), steps: 0, plain: 0, harmonic: 0, complete: false }
  for (;;) {
    if (!keep[v]) {
      keep[v] = 1
      distinct++
    }
    const k = deg(v)
    steps++
    sumK += k
    sumInv += 1 / k
    if (distinct >= want || steps >= maxSteps) break
    v = g.neighbors[g.offsets[v] + Math.floor(random() * k)]
  }
  return { ...induced(net, keep), steps, plain: sumK / steps, harmonic: steps / sumInv, complete: distinct >= want }
}

// A walk of a fixed number of steps, for the two estimators alone.
export function walkEstimates(net, steps, random, g = csr(net)) {
  const deg = (v) => g.offsets[v + 1] - g.offsets[v]
  let v
  do v = Math.floor(random() * net.n)
  while (deg(v) === 0)
  let sumK = 0
  let sumInv = 0
  for (let s = 0; s < steps; s++) {
    const k = deg(v)
    sumK += k
    sumInv += 1 / k
    v = g.neighbors[g.offsets[v] + Math.floor(random() * k)]
  }
  return { plain: sumK / steps, harmonic: steps / sumInv }
}

// Directions from a source: the shortest-path tree found by a breadth-first
// search from each of `sources` random nodes, to every node it can reach.
// Only the links of the trees are observed; with several sources, their union.
// The observed nodes are the ones reached.
export function observeTrees(net, sources, random, g = csr(net)) {
  const seen = new Uint8Array(net.n)
  const keys = new Set()
  const parent = new Int32Array(net.n)
  const queue = new Int32Array(net.n)
  const chosen = []
  const count = Math.min(sources, net.n)
  while (chosen.length < count) {
    const s = Math.floor(random() * net.n)
    if (!chosen.includes(s)) chosen.push(s)
  }
  for (const s of chosen) {
    parent.fill(-1)
    parent[s] = s
    seen[s] = 1
    queue[0] = s
    let head = 0
    let tail = 1
    while (head < tail) {
      const u = queue[head++]
      for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end; i++) {
        const v = g.neighbors[i]
        if (parent[v] < 0) {
          parent[v] = u
          seen[v] = 1
          keys.add(key(net.n, u, v))
          queue[tail++] = v
        }
      }
    }
  }
  const map = new Int32Array(net.n).fill(-1)
  const nodeOf = []
  for (let v = 0; v < net.n; v++) {
    if (seen[v]) {
      map[v] = nodeOf.length
      nodeOf.push(v)
    }
  }
  const A = []
  const B = []
  for (let e = 0; e < net.A.length; e++) {
    if (keys.has(key(net.n, net.A[e], net.B[e]))) {
      A.push(map[net.A[e]])
      B.push(map[net.B[e]])
    }
  }
  return { n: nodeOf.length, A: Int32Array.from(A), B: Int32Array.from(B), nodeOf, sources: chosen }
}

// Spurious links: round(f·L) links that do not exist are added between random
// pairs (never a self-link, never a pair already linked). `added` counts them.
export function observeSpurious(net, f, random) {
  const L = net.A.length
  const free = (net.n * (net.n - 1)) / 2 - L
  const extra = Math.min(Math.round(f * L), free)
  const keys = new Set()
  for (let e = 0; e < L; e++) keys.add(key(net.n, net.A[e], net.B[e]))
  const A = new Int32Array(L + extra)
  const B = new Int32Array(L + extra)
  A.set(net.A)
  B.set(net.B)
  let e = L
  while (e < L + extra) {
    const a = Math.floor(random() * net.n)
    const b = Math.floor(random() * net.n)
    if (a === b) continue
    const k = key(net.n, a, b)
    if (keys.has(k)) continue
    keys.add(k)
    A[e] = a
    B[e] = b
    e++
  }
  return { n: net.n, A, B, nodeOf: null, added: extra }
}

// Merged nodes: round(f·N) times, two different nodes chosen at random are
// taken for the same one. Each merge leaves one node fewer; the merged node
// inherits the links of both (a link between the two disappears, and a
// neighbour of both is linked once). `merges` counts them, `sizeOf[v]` is the
// number of true nodes inside observed node v.
export function observeMerged(net, f, random) {
  const merges = Math.min(Math.round(f * net.n), net.n - 1)
  const parent = Int32Array.from({ length: net.n }, (_, i) => i)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  let done = 0
  while (done < merges) {
    const a = find(Math.floor(random() * net.n))
    const b = find(Math.floor(random() * net.n))
    if (a === b) continue
    parent[Math.max(a, b)] = Math.min(a, b)
    done++
  }
  const map = new Int32Array(net.n).fill(-1)
  const nodeOf = []
  const sizeOf = []
  for (let v = 0; v < net.n; v++) {
    const r = find(v)
    if (map[r] < 0) {
      map[r] = nodeOf.length
      nodeOf.push(r)
      sizeOf.push(0)
    }
    sizeOf[map[r]]++
  }
  const n = nodeOf.length
  const keys = new Set()
  const A = []
  const B = []
  for (let e = 0; e < net.A.length; e++) {
    const a = map[find(net.A[e])]
    const b = map[find(net.B[e])]
    if (a === b) continue
    const k = key(n, a, b)
    if (keys.has(k)) continue
    keys.add(k)
    A.push(a)
    B.push(b)
  }
  return { n, A: Int32Array.from(A), B: Int32Array.from(B), nodeOf, sizeOf, merges }
}

// ---------------------------------------------------------------- Methods
// How the panel drives each observation. `x` is the slider value: a fraction,
// or a number of sources. `exact(x)` gives the expected observed/true ratios
// where theory has one.

export const METHODS = {
  nodes: {
    min: 0.05, max: 1, step: 0.05, initial: 0.3, grid: range(0.05, 1, 0.05),
    run: (net, x, random) => observeNodes(net, x, random),
    exact: (x) => ({ meanDegree: x, transitivity: 1 }),
  },
  links: {
    min: 0.05, max: 1, step: 0.05, initial: 0.3, grid: range(0.05, 1, 0.05),
    run: (net, x, random) => observeLinks(net, x, random),
    exact: (x) => ({ meanDegree: x, transitivity: x }),
  },
  snowball: {
    min: 0.05, max: 1, step: 0.05, initial: 0.3, grid: range(0.05, 1, 0.05),
    run: (net, x, random, g) => observeSnowball(net, x, random, g),
  },
  walk: {
    min: 0.05, max: 1, step: 0.05, initial: 0.3, grid: range(0.05, 1, 0.05),
    run: (net, x, random, g) => observeWalk(net, x, random, g),
  },
  trees: {
    min: 1, max: 10, step: 1, initial: 1, grid: range(1, 10, 1), integer: true,
    run: (net, x, random, g) => observeTrees(net, x, random, g),
  },
  spurious: {
    min: 0, max: 0.5, step: 0.02, initial: 0.1, grid: range(0, 0.5, 0.05),
    run: (net, x, random) => observeSpurious(net, x, random),
    exact: (x) => ({ meanDegree: 1 + x }),
  },
  merged: {
    min: 0, max: 0.1, step: 0.01, initial: 0.05, grid: range(0, 0.1, 0.01),
    run: (net, x, random) => observeMerged(net, x, random),
  },
}

function range(lo, hi, step) {
  const out = []
  for (let i = 0; lo + i * step <= hi + 1e-9; i++) out.push(Number((lo + i * step).toFixed(4)))
  return out
}

// ---------------------------------------------------------------- The panel's samples

export const TRUTH_SEED = 1
export const TRUTH_IDS = ['random', 'scaleFree', 'smallWorld', 'dense']
export const METHOD_IDS = ['nodes', 'links', 'snowball', 'walk', 'trees', 'spurious', 'merged']

// Seed of the sample the panel shows for a given truth, method, slider value
// and press of "New sample" (nonce 0 is the first one). Kept here so that the
// self-check script can reproduce the numbers on the page.
export const sampleSeed = (truthId, methodId, x, nonce = 0) =>
  (0x5eed ^
    Math.imul(TRUTH_IDS.indexOf(truthId) + 1, 0x9e3779b1) ^
    Math.imul(METHOD_IDS.indexOf(methodId) + 1, 0x85ebca6b) ^
    Math.imul(Math.round(x * 1000) + 1, 0xc2b2ae35) ^
    Math.imul(nonce + 1, 0x27d4eb2f)) >>>
  0

export function panelSample(truthId, methodId, x, nonce = 0) {
  const net = TRUTHS[truthId](TRUTH_SEED)
  return METHODS[methodId].run(net, x, mulberry32(sampleSeed(truthId, methodId, x, nonce)), csr(net))
}

export const BIAS_SEED = 0xb1a5

// ---------------------------------------------------------------- Bias curves

export const BIAS_RUNS = 30

// The experiment behind the bias curves, as a job for useExperiment: for each
// x of the method's grid, `runs` independent observations of the same true
// network, and the observed/true ratio of ⟨k⟩, transitivity and share of the
// largest component. The observations are pooled: ⟨k⟩ is all the link ends
// over all the nodes of the `runs` samples, and transitivity all their
// triangles over all their triples, so that a small sample with no triple at
// all does not count as "transitivity 0". The share of the largest component
// is the mean over the samples. Yields its progress after every observation.
export function biasJob(net, methodId, seed, runs = BIAS_RUNS) {
  const method = METHODS[methodId]
  const g = csr(net)
  const truth = quickStats(net)
  const points = method.grid.map((x) => ({ x, runs: 0, nodes: 0, links: 0, triangles: 0, triples: 0, giant: 0 }))
  function* iter() {
    const total = points.length * runs
    let done = 0
    for (let r = 0; r < runs; r++) {
      for (let i = 0; i < points.length; i++) {
        const random = mulberry32((seed ^ Math.imul(r + 1, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0)
        const s = quickStats(method.run(net, points[i].x, random, g))
        const p = points[i]
        p.nodes += s.n
        p.links += s.L
        p.triangles += s.triangles
        p.triples += s.triples
        p.giant += s.giant
        p.runs++
        yield ++done / total
      }
    }
  }
  const ratio = (value, reference) => (reference ? value / reference : 0)
  return {
    iter: iter(),
    snapshot: () => ({
      methodId,
      truth,
      points: points
        .filter((p) => p.runs > 0)
        .map((p) => ({
          x: p.x,
          runs: p.runs,
          meanDegree: ratio(p.nodes ? (2 * p.links) / p.nodes : 0, truth.meanDegree),
          transitivity: ratio(p.triples ? (3 * p.triangles) / p.triples : 0, truth.transitivity),
          giant: ratio(p.giant / p.runs, truth.giant),
        })),
    }),
  }
}
