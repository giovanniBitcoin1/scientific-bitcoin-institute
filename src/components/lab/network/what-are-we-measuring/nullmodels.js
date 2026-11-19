import {
  buildCSR,
  bfsDistances,
  connectedComponents,
  erdosRenyiGnm,
  barabasiAlbert,
  wattsStrogatz,
} from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { triangleCounts } from './sampling.js'

// Panel B, "Compared to what?": one statistic of one network, and the values
// the same statistic takes in two families of random networks.
//
//   same N and L   the L links are placed on random pairs
//   same degrees   every node keeps its degree; the wiring is randomised by
//                  swapping the ends of two links at a time, refusing a swap
//                  that would create a self-link or a double link
//
// A network is { n, A, B } as in sampling.js. Pure logic, shared by the panel
// and by scripts/lab/check-network-02.mjs.

export const SWAPS_PER_LINK = 20
export const NULL_SEED = 0xc0ffee // the panel's seed, so the self-check reproduces its numbers

// ---------------------------------------------------------------- Networks

const pick = ({ A, B }) => ({ A, B })

export const MODEL_NETWORKS = {
  smallWorld: (seed) => ({ n: 100, ...pick(wattsStrogatz(100, 4, 0.1, seed)) }),
  scaleFree: (seed) => ({ n: 100, ...pick(barabasiAlbert(100, 2, seed)) }),
  random: (seed) => ({ n: 100, ...pick(erdosRenyiGnm(100, 200, seed)) }),
}

// From the JSON stored in src/data/lab/networks/.
export const fromData = (data) => ({
  n: data.nodes.length,
  A: Int32Array.from(data.edges, (e) => e[0]),
  B: Int32Array.from(data.edges, (e) => e[1]),
})

// ---------------------------------------------------------------- Statistics

// Degree assortativity: the Pearson correlation between the degrees at the
// two ends of a link, each link counted in both directions.
export function assortativity(net) {
  const k = new Int32Array(net.n)
  const L = net.A.length
  for (let e = 0; e < L; e++) {
    k[net.A[e]]++
    k[net.B[e]]++
  }
  let sxy = 0
  let sx = 0
  let sx2 = 0
  for (let e = 0; e < L; e++) {
    const a = k[net.A[e]]
    const b = k[net.B[e]]
    sxy += 2 * a * b
    sx += a + b
    sx2 += a * a + b * b
  }
  const m = 2 * L
  const varX = sx2 / m - (sx / m) ** 2
  return varX > 1e-12 ? (sxy / m - (sx / m) ** 2) / varX : NaN
}

// Average distance between the pairs of the largest component.
export function averageDistance(net) {
  const g = buildCSR(net.n, net.A, net.B)
  const comp = connectedComponents(g)
  const big = comp.sizes.indexOf(comp.largest)
  const dist = new Int32Array(net.n)
  const queue = new Int32Array(net.n)
  let sum = 0
  let pairs = 0
  for (let s = 0; s < net.n; s++) {
    if (comp.label[s] !== big) continue
    bfsDistances(g, s, dist, queue)
    for (let v = 0; v < net.n; v++) {
      if (dist[v] > 0) {
        sum += dist[v]
        pairs++
      }
    }
  }
  return pairs ? sum / pairs : NaN
}

const tri = (net) => triangleCounts(buildCSR(net.n, net.A, net.B))

export const STATISTICS = {
  transitivity: (net) => tri(net).transitivity,
  clustering: (net) => tri(net).avgClustering,
  assortativity,
  distance: averageDistance,
  triangles: (net) => tri(net).triangles,
}

// ---------------------------------------------------------------- Swaps

const key = (n, a, b) => (a < b ? a * n + b : b * n + a)

// A network being randomised with its degrees fixed. `attempt()` tries one
// swap and returns what it did, or null when the swap is refused:
//
//   links (a, b) and (c, d)  →  (a, d) and (c, b)
//
// with the second link taken in either direction at random, so that both ways
// of exchanging the ends are possible.
export function swapper(net, random) {
  const n = net.n
  const A = Int32Array.from(net.A)
  const B = Int32Array.from(net.B)
  const L = A.length
  const keys = new Set()
  for (let e = 0; e < L; e++) keys.add(key(n, A[e], B[e]))
  let attempts = 0
  let accepted = 0

  function attempt() {
    attempts++
    if (L < 2) return null
    const e1 = Math.floor(random() * L)
    const e2 = Math.floor(random() * L)
    if (e1 === e2) return null
    const a = A[e1]
    const b = B[e1]
    let c = A[e2]
    let d = B[e2]
    if (random() < 0.5) [c, d] = [d, c]
    // new links a–d and c–b
    if (a === d || c === b) return null
    const k1 = key(n, a, d)
    const k2 = key(n, c, b)
    if (k1 === k2 || keys.has(k1) || keys.has(k2)) return null
    keys.delete(key(n, a, b))
    keys.delete(key(n, c, d))
    keys.add(k1)
    keys.add(k2)
    A[e1] = a
    B[e1] = d
    A[e2] = c
    B[e2] = b
    accepted++
    return { e1, e2, before: [[a, b], [c, d]], after: [[a, d], [c, b]] }
  }

  return {
    net: { n, A, B },
    attempt,
    // `count` attempts; returns how many were accepted.
    mix(count) {
      let ok = 0
      for (let i = 0; i < count; i++) if (attempt()) ok++
      return ok
    },
    // Keeps trying until a swap is accepted (for "Watch a swap").
    next(maxTries = 2000) {
      for (let i = 0; i < maxTries; i++) {
        const s = attempt()
        if (s) return s
      }
      return null
    },
    get attempts() {
      return attempts
    },
    get accepted() {
      return accepted
    },
  }
}

// ---------------------------------------------------------------- Experiment

export function summarize(values, observed) {
  const m = values.length
  if (!m) return { samples: 0, mean: NaN, sd: NaN, z: NaN, extreme: NaN, min: NaN, max: NaN }
  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    sum += v
    if (v < min) min = v
    if (v > max) max = v
  }
  const mean = sum / m
  let ss = 0
  for (const v of values) ss += (v - mean) ** 2
  const sd = m > 1 ? Math.sqrt(ss / (m - 1)) : NaN
  // Share of null samples at least as far from the null mean as the observed
  // value, on the same side.
  let extreme = 0
  for (const v of values) if (observed >= mean ? v >= observed : v <= observed) extreme++
  return { samples: m, mean, sd, z: sd > 1e-12 ? (observed - mean) / sd : NaN, extreme: extreme / m, min, max }
}

// A job for useExperiment: `samples` random networks from one null model,
// the statistic on each. With "degrees" the samples are successive states of
// one chain of swaps, SWAPS_PER_LINK · L attempts apart (and as many before
// the first one).
export function nullJob(net, statId, nullId, samples, seed) {
  const stat = STATISTICS[statId]
  const observed = stat(net)
  const L = net.A.length
  const values = []
  let accepted = 0
  let attempted = 0
  function* iter() {
    if (nullId === 'degrees') {
      const sw = swapper(net, mulberry32(seed))
      for (let s = 0; s < samples; s++) {
        accepted += sw.mix(SWAPS_PER_LINK * L)
        attempted += SWAPS_PER_LINK * L
        const v = stat(sw.net)
        if (Number.isFinite(v)) values.push(v)
        yield (s + 1) / samples
      }
    } else {
      for (let s = 0; s < samples; s++) {
        const v = stat({ n: net.n, ...pick(erdosRenyiGnm(net.n, L, (seed + Math.imul(s + 1, 0x9e3779b1)) >>> 0)) })
        if (Number.isFinite(v)) values.push(v)
        yield (s + 1) / samples
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({ statId, nullId, observed, values: values.slice(), accepted, attempted, ...summarize(values, observed) }),
  }
}

// Histogram of the null values with the observed one inside the range.
export function histogram(values, observed, bins = 30) {
  let lo = observed
  let hi = observed
  for (const v of values) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  if (hi - lo < 1e-12) {
    lo -= 0.5
    hi += 0.5
  }
  const pad = (hi - lo) * 0.04
  lo -= pad
  hi += pad
  const counts = new Array(bins).fill(0)
  for (const v of values) counts[Math.min(bins - 1, Math.floor(((v - lo) / (hi - lo)) * bins))]++
  return { lo, hi, counts, max: Math.max(1, ...counts) }
}
