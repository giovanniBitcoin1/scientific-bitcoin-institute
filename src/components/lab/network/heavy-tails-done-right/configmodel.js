import { mulberry32 } from '../../rng.js'
import { buildCSR, connectedComponents, averagePathLength, sampleNodes, erdosRenyiGnm } from '../../graphUtils.js'
import { powerLawSampler, naturalCutoff } from './zeta.js'

// The configuration model: node i gets k_i half-links, and the half-links are
// joined in random pairs. Plain functions, no React, so Node can check them.

// n degrees from `draw(random)`. The total must be even to be paired off: the
// last node is drawn again until it is.
export function drawDegrees(n, draw, random) {
  const deg = new Int32Array(n)
  let sum = 0
  for (let i = 0; i < n; i++) {
    deg[i] = draw(random)
    sum += deg[i]
  }
  while (sum % 2) {
    sum -= deg[n - 1]
    deg[n - 1] = draw(random)
    sum += deg[n - 1]
  }
  return deg
}

// A Poisson draw with the given mean (multiplication method; fine for the
// small means used here).
export const poissonDraw = (mean) => {
  const limit = Math.exp(-mean)
  return (random) => {
    let k = 0
    let p = random()
    while (p > limit) {
      k++
      p *= random()
    }
    return k
  }
}

// "Ones and fours": four links with probability `share`, otherwise one.
export const onesFoursDraw = (share) => (random) => (random() < share ? 4 : 1)

// Joins the half-links in random pairs. The result is a multigraph: it may
// hold self-links (A[e] = B[e]) and repeated links.
export function pairStubs(deg, random) {
  let total = 0
  for (let i = 0; i < deg.length; i++) total += deg[i]
  const stubs = new Int32Array(total)
  let s = 0
  for (let i = 0; i < deg.length; i++) for (let j = 0; j < deg[i]; j++) stubs[s++] = i
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = stubs[i]
    stubs[i] = stubs[j]
    stubs[j] = tmp
  }
  const m = total >> 1
  const A = new Int32Array(m)
  const B = new Int32Array(m)
  for (let e = 0; e < m; e++) {
    A[e] = stubs[2 * e]
    B[e] = stubs[2 * e + 1]
  }
  return { A, B }
}

// Removes the self-links and merges the repeated links of a multigraph.
// selfLinks: links from a node to itself. repeated: links beyond the first
// between the same two nodes (three links between a and b count as two).
export function simplify(n, A, B) {
  const m = A.length
  let selfLinks = 0
  const offsets = new Int32Array(n + 1)
  for (let e = 0; e < m; e++) {
    if (A[e] === B[e]) selfLinks++
    else offsets[Math.min(A[e], B[e]) + 1]++
  }
  for (let v = 0; v < n; v++) offsets[v + 1] += offsets[v]
  const fill = offsets.slice(0, n)
  const other = new Int32Array(m - selfLinks)
  for (let e = 0; e < m; e++) {
    if (A[e] === B[e]) continue
    const lo = Math.min(A[e], B[e])
    other[fill[lo]++] = Math.max(A[e], B[e])
  }
  const stamp = new Int32Array(n)
  const outA = new Int32Array(m - selfLinks)
  const outB = new Int32Array(m - selfLinks)
  let kept = 0
  for (let v = 0; v < n; v++) {
    for (let i = offsets[v]; i < offsets[v + 1]; i++) {
      const u = other[i]
      if (stamp[u] === v + 1) continue
      stamp[u] = v + 1
      outA[kept] = v
      outB[kept] = u
      kept++
    }
  }
  return { A: outA.slice(0, kept), B: outB.slice(0, kept), selfLinks, repeated: m - selfLinks - kept }
}

// Mean and second moment of a list of degrees.
export function moments(deg) {
  let s1 = 0
  let s2 = 0
  let max = 0
  for (let i = 0; i < deg.length; i++) {
    s1 += deg[i]
    s2 += deg[i] * deg[i]
    if (deg[i] > max) max = deg[i]
  }
  const k1 = s1 / deg.length
  const k2 = s2 / deg.length
  return { k1, k2, ratio: k1 ? k2 / k1 : 0, max }
}

// What the pairing is expected to create, from the degrees given:
// (⟨k²⟩ − ⟨k⟩) / (2⟨k⟩) self-links and ((⟨k²⟩ − ⟨k⟩) / ⟨k⟩)² / 4 repeated links.
// (Two given nodes are joined twice with probability k_i(k_i − 1) k_j(k_j − 1) /
// (2 (2L)²): two half-links chosen at each end, two ways of pairing them. Summed
// over the pairs of nodes this gives the square over 4. The formula holds while
// repeated links are rare; with a heavy tail it overshoots by far.)
export function expectedDefects(deg) {
  const { k1, k2 } = moments(deg)
  const r = k1 ? (k2 - k1) / k1 : 0
  return { selfLinks: r / 2, repeated: (r * r) / 4 }
}

// A simple network with (nearly) the degrees given: paired, then cleaned.
export function configurationModel(deg, random) {
  const multi = pairStubs(deg, random)
  const simple = simplify(deg.length, multi.A, multi.B)
  return { n: deg.length, ...simple, given: deg, multi }
}

export function degreesOf(net) {
  const k = new Int32Array(net.n)
  for (let e = 0; e < net.A.length; e++) {
    k[net.A[e]]++
    k[net.B[e]]++
  }
  return k
}

export const DISTANCE_SOURCES = 20

// The readouts of a network: links, moments of the degrees, share of the
// largest component, average distance from a sample of sources (pairs that
// cannot reach each other are left out).
export function networkStats(net, random, sources = DISTANCE_SOURCES) {
  const g = buildCSR(net.n, net.A, net.B)
  const k = degreesOf(net)
  const comp = connectedComponents(g)
  const dist = averagePathLength(g, sampleNodes(net.n, sources, random))
  return { L: net.A.length, ...moments(k), degrees: k, giant: comp.largest / net.n, distance: dist.mean }
}

export const giantShare = (net) => connectedComponents(buildCSR(net.n, net.A, net.B)).largest / net.n

// ---------------------------------------------------------------- Panel A

export const DIAL_SEED = 2600
export const DIAL_DEFAULT = { gamma: 2.5, kMin: 2, n: 2000 }

// A power-law degree never exceeds N − 1: a simple network has no room for it.
export const powerDegrees = (n, gamma, kMin, random) => drawDegrees(n, powerLawSampler(gamma, kMin, n - 1), random)

// The panel's network: degrees from p_k ∝ k^(−γ), k ≥ k_min, paired and cleaned.
export function dialNetwork(gamma, kMin, n, seed = DIAL_SEED) {
  const random = mulberry32(seed)
  const net = configurationModel(powerDegrees(n, gamma, kMin, random), random)
  const stats = networkStats(net, random)
  return { net, stats, given: moments(net.given), expected: expectedDefects(net.given), cutoff: naturalCutoff(n, gamma, kMin) }
}

// The experiment: largest degree, ⟨k²⟩/⟨k⟩ and average distance against N,
// for four exponents and for a random network with the N and L of the γ = 2.6
// one. Each point is the median of EXP_RUNS networks: the largest degree of a
// heavy-tailed sample swings so much that a mean of a few runs says little.
export const EXP_GAMMAS = [2.2, 2.6, 3, 4]
export const EXP_KMIN = 2
export const EXP_SIZES = [100, 316, 1000, 3162, 10000, 31623, 100000]
export const EXP_RUNS = 10
export const EXP_SEED = 5150
export const EXP_SOURCES = 10
export const EXP_KINDS = [...EXP_GAMMAS.map((g) => `g${g}`), 'random']
export const EXP_FIELDS = ['max', 'ratio', 'distance']

const medianOf = (list) => {
  const s = [...list].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

export function dialJob(runs = EXP_RUNS, seed = EXP_SEED, sizes = EXP_SIZES) {
  const all = Object.fromEntries(EXP_KINDS.map((id) => [id, sizes.map(() => [])]))
  let done = 0
  const total = runs * sizes.length * EXP_KINDS.length
  function* iter() {
    for (let r = 0; r < runs; r++) {
      for (let s = 0; s < sizes.length; s++) {
        const n = sizes[s]
        for (const gamma of EXP_GAMMAS) {
          const random = mulberry32(seed + 1000 * r + 10 * s + Math.round(gamma * 10))
          const net = configurationModel(powerDegrees(n, gamma, EXP_KMIN, random), random)
          yield (done + 0.5) / total
          all[`g${gamma}`][s].push(networkStats(net, random, EXP_SOURCES))
          yield ++done / total
          if (gamma === 2.6) {
            const er = erdosRenyiGnm(n, net.A.length, seed + 1000 * r + 10 * s + 7)
            all.random[s].push(networkStats({ n, A: er.A, B: er.B }, random, EXP_SOURCES))
            yield ++done / total
          }
        }
      }
    }
  }
  const snapshot = () => ({
    sizes,
    runs,
    done: done === total,
    median: Object.fromEntries(
      EXP_KINDS.map((id) => [
        id,
        all[id].map((list) => (list.length ? Object.fromEntries([...EXP_FIELDS.map((f) => [f, medianOf(list.map((st) => st[f]))]), ['runs', list.length]]) : null)),
      ]),
    ),
  })
  return { iter: iter(), snapshot }
}
