import { mulberry32 } from '../../rng.js'
import { barabasiAlbert, erdosRenyiGnm, buildCSR } from '../../graphUtils.js'
import { configurationModel, powerDegrees, degreesOf } from '../heavy-tails-done-right/configmodel.js'
import { swapper } from '../what-are-we-measuring/nullmodels.js'

// Network Lab module 08, "Who connects to whom": degree correlations, the
// structural cutoff, the rich club, rewiring with the degrees fixed, removal
// of nodes, two-group mixing and the majority illusion. Plain functions on
// networks { n, A, B } (simple, undirected), so Node can check them.

export { degreesOf }

// A seed for the j-th item of a family.
export const seedOf = (seed, j) => (seed ^ Math.imul(j + 1, 0x9e3779b1)) >>> 0

// ---------------------------------------------------------------- Sources

export const SOURCES = ['pa', 'power', 'poisson']

// Preferential attachment (module 06): m + 1 nodes all linked, then each
// newcomer brings m links to distinct nodes chosen ∝ degree.
export function paNetwork(N, m, seed) {
  const g = barabasiAlbert(N, m, seed)
  return { n: N, A: g.A, B: g.B }
}

// Module 05's configuration model with p_k ∝ k^(−γ), k ≥ k_min, the
// self-links and repeated links erased.
export function erasedNetwork(N, gamma, kMin, seed) {
  const random = mulberry32(seed)
  const net = configurationModel(powerDegrees(N, gamma, kMin, random), random)
  return { n: N, A: net.A, B: net.B }
}

// A random network with N nodes and ⟨k⟩ N / 2 links.
export function poissonNetwork(N, meanK, seed) {
  const g = erdosRenyiGnm(N, Math.round((meanK * N) / 2), seed)
  return { n: N, A: g.A, B: g.B }
}

export function makeSource({ source, N, m = 2, gamma = 2.5, kMin = 2, meanK = 4, seed }) {
  if (source === 'pa') return paNetwork(N, m, seed)
  if (source === 'power') return erasedNetwork(N, gamma, kMin, seed)
  return poissonNetwork(N, meanK, seed)
}

// ---------------------------------------------------------------- Correlations

// Newman's r: the Pearson correlation of the degrees at the two ends of a
// link, every link counted in both directions.
export function pearsonR(net, k = degreesOf(net)) {
  const L = net.A.length
  let sxy = 0
  let sx = 0
  let sx2 = 0
  for (let e = 0; e < L; e++) {
    const a = k[net.A[e]]
    const b = k[net.B[e]]
    sxy += a * b
    sx += a + b
    sx2 += a * a + b * b
  }
  const mxy = sxy / L
  const mx = sx / (2 * L)
  const vx = sx2 / (2 * L) - mx * mx
  return vx > 1e-12 ? (mxy - mx * mx) / vx : NaN
}

// The rank of every degree value among the 2L link ends, ties given their
// average rank (ranks run from 1 to 2L).
export function endRanks(net, k = degreesOf(net)) {
  let max = 0
  for (let v = 0; v < net.n; v++) if (k[v] > max) max = k[v]
  // a node of degree d holds d of the 2L ends
  const count = new Float64Array(max + 1)
  for (let v = 0; v < net.n; v++) count[k[v]] += k[v]
  const rank = new Float64Array(max + 1)
  let below = 0
  for (let d = 0; d <= max; d++) {
    rank[d] = below + (count[d] + 1) / 2
    below += count[d]
  }
  return rank
}

// Spearman's ρ: the Pearson correlation of the ranks of the degrees at the two
// ends of a link, over the same pairs as r.
export function spearmanRho(net, k = degreesOf(net)) {
  const rank = endRanks(net, k)
  const L = net.A.length
  let sxy = 0
  let sx = 0
  let sx2 = 0
  for (let e = 0; e < L; e++) {
    const a = rank[k[net.A[e]]]
    const b = rank[k[net.B[e]]]
    sxy += a * b
    sx += a + b
    sx2 += a * a + b * b
  }
  const mx = sx / (2 * L)
  const vx = sx2 / (2 * L) - mx * mx
  return vx > 1e-12 ? (sxy / L - mx * mx) / vx : NaN
}

// Moments, ⟨k²⟩/⟨k⟩ and the two cutoffs.
export function degreeSummary(net, k = degreesOf(net)) {
  let s1 = 0
  let s2 = 0
  let max = 0
  for (let v = 0; v < net.n; v++) {
    s1 += k[v]
    s2 += k[v] * k[v]
    if (k[v] > max) max = k[v]
  }
  const k1 = s1 / net.n
  return { k1, k2: s2 / net.n, uncorrelated: s1 ? s2 / s1 : NaN, max, ks: structuralCutoff(k1, net.n) }
}

// Two nodes of degrees k and k' share about k k' / (⟨k⟩ N) links; that is 1
// at k = k' = (⟨k⟩ N)^(1/2).
export const structuralCutoff = (meanK, N) => Math.sqrt(meanK * N)

// k_nn(k): the mean degree of the neighbours of a node, averaged over the
// nodes of degree k. Exact for k ≤ 10, then in classes a tenth of a decade
// wide (each point at the mean k of its nodes).
export function knnCurve(net, k = degreesOf(net)) {
  const n = net.n
  const sum = new Float64Array(n)
  for (let e = 0; e < net.A.length; e++) {
    sum[net.A[e]] += k[net.B[e]]
    sum[net.B[e]] += k[net.A[e]]
  }
  const cls = (d) => (d <= 10 ? d : 10 + Math.ceil(10 * Math.log10(d / 10) + 1e-9))
  const acc = new Map()
  for (let v = 0; v < n; v++) {
    if (!k[v]) continue
    const c = cls(k[v])
    const a = acc.get(c) || { k: 0, knn: 0, nodes: 0 }
    a.k += k[v]
    a.knn += sum[v] / k[v]
    a.nodes++
    acc.set(c, a)
  }
  return [...acc.keys()].sort((x, y) => x - y).map((c) => {
    const a = acc.get(c)
    return [a.k / a.nodes, a.knn / a.nodes, a.nodes]
  })
}

// Slope of log k_nn against log k by least squares over the points of the
// curve with k ≥ kFrom, each point weighted by its number of nodes.
export function knnSlope(curve, kFrom = 1) {
  let w = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y, nodes] of curve) {
    if (x < kFrom || !(y > 0)) continue
    const lx = Math.log(x)
    const ly = Math.log(y)
    w += nodes
    sx += nodes * lx
    sy += nodes * ly
    sxx += nodes * lx * lx
    sxy += nodes * lx * ly
  }
  const d = w * sxx - sx * sx
  return d > 0 ? (w * sxy - sx * sy) / d : NaN
}

// ---------------------------------------------------------------- Rich club

// φ(k) = 2 E_{>k} / (N_{>k} (N_{>k} − 1)): the density of links among the
// nodes of degree above k, for k = 0 … max − 1.
export function richClub(net, k = degreesOf(net)) {
  let max = 0
  for (let v = 0; v < net.n; v++) if (k[v] > max) max = k[v]
  const nodesAt = new Float64Array(max + 1)
  for (let v = 0; v < net.n; v++) nodesAt[k[v]]++
  const linksAt = new Float64Array(max + 1) // links whose lower end has degree d
  for (let e = 0; e < net.A.length; e++) linksAt[Math.min(k[net.A[e]], k[net.B[e]])]++
  const nodes = new Float64Array(max + 1)
  const links = new Float64Array(max + 1)
  let nAbove = 0
  let eAbove = 0
  for (let d = max; d >= 0; d--) {
    nodes[d] = nAbove // nodes of degree > d
    links[d] = eAbove // links with both ends of degree > d
    nAbove += nodesAt[d]
    eAbove += linksAt[d]
  }
  const phi = new Float64Array(max)
  for (let d = 0; d < max; d++) phi[d] = nodes[d] > 1 ? (2 * links[d]) / (nodes[d] * (nodes[d] - 1)) : NaN
  return { phi, nodes: nodes.subarray(0, max), links: links.subarray(0, max), max }
}

export const RC_RANDOMISATIONS = 20
export const RC_SWAPS = 10 // swap attempts per link between two randomisations
export const RC_MIN_NODES = 5 // φ is shown where at least this many nodes are above k

// The normalised rich-club coefficient as a job: φ(k) of the network, and its
// mean over `count` states of a chain of module 02's swaps (no self-links,
// no repeated links), RC_SWAPS · L attempts apart and as many before the first.
export function richClubJob(net, seed, count = RC_RANDOMISATIONS, swaps = RC_SWAPS) {
  const k = degreesOf(net)
  const observed = richClub(net, k)
  const sums = new Float64Array(observed.max)
  const squares = new Float64Array(observed.max)
  const seen = new Float64Array(observed.max)
  let done = 0
  function* iter() {
    const sw = swapper(net, mulberry32(seed))
    const L = net.A.length
    for (let s = 0; s < count; s++) {
      const chunk = Math.max(1, Math.floor(L / 4))
      for (let a = 0; a < swaps * L; a += chunk) {
        sw.mix(Math.min(chunk, swaps * L - a))
        yield (s + a / (swaps * L)) / count
      }
      const rc = richClub(sw.net, k)
      for (let d = 0; d < observed.max; d++)
        if (Number.isFinite(rc.phi[d])) {
          sums[d] += rc.phi[d]
          squares[d] += rc.phi[d] * rc.phi[d]
          seen[d]++
        }
      done++
      yield done / count
    }
  }
  const snapshot = () => {
    const points = []
    for (let d = 0; d < observed.max; d++) {
      if (observed.nodes[d] < RC_MIN_NODES) continue
      const rand = seen[d] ? sums[d] / seen[d] : NaN
      const sd = seen[d] > 1 ? Math.sqrt(Math.max(0, (squares[d] - seen[d] * rand * rand) / (seen[d] - 1))) : NaN
      points.push({ k: d, phi: observed.phi[d], rand, sd, ratio: rand > 0 ? observed.phi[d] / rand : NaN, nodes: observed.nodes[d] })
    }
    return { done, count, finished: done === count, points }
  }
  return { iter: iter(), snapshot }
}

// ---------------------------------------------------------------- Rewiring

const keyOf = (n, a, b) => (a < b ? a * n + b : b * n + a)

// Xulvi-Brunet and Sokolov's rewiring, with the degrees fixed. One step takes
// two links at random. With probability p the four ends are ordered by degree
// and joined as (1st, 2nd) and (3rd, 4th) towards assortative, or (1st, 4th)
// and (2nd, 3rd) towards disassortative; otherwise they are re-paired at
// random. A step that would make a self-link or a link that already exists
// is refused. Ties in degree are broken by a random number drawn per step.
export function rewirer(net, random) {
  const n = net.n
  const A = Int32Array.from(net.A)
  const B = Int32Array.from(net.B)
  const L = A.length
  const k = degreesOf(net)
  const keys = new Set()
  for (let e = 0; e < L; e++) keys.add(keyOf(n, A[e], B[e]))
  let attempts = 0
  let accepted = 0
  const four = new Int32Array(4)
  const tie = new Float64Array(4)

  function step(mode, p) {
    attempts++
    if (L < 2) return false
    const e1 = Math.floor(random() * L)
    const e2 = Math.floor(random() * L)
    if (e1 === e2) return false
    four[0] = A[e1]
    four[1] = B[e1]
    four[2] = A[e2]
    four[3] = B[e2]
    if (four[0] === four[2] || four[0] === four[3] || four[1] === four[2] || four[1] === four[3]) return false
    let x1, y1, x2, y2
    if (mode !== 'random' && random() < p) {
      for (let i = 0; i < 4; i++) tie[i] = random()
      const order = [0, 1, 2, 3].sort((i, j) => k[four[j]] - k[four[i]] || tie[j] - tie[i])
      const [h1, h2, h3, h4] = order.map((i) => four[i])
      if (mode === 'assortative') [x1, y1, x2, y2] = [h1, h2, h3, h4]
      else [x1, y1, x2, y2] = [h1, h4, h2, h3]
    } else if (random() < 0.5) [x1, y1, x2, y2] = [four[0], four[2], four[1], four[3]]
    else [x1, y1, x2, y2] = [four[0], four[3], four[1], four[2]]
    const k1 = keyOf(n, x1, y1)
    const k2 = keyOf(n, x2, y2)
    const old1 = keyOf(n, four[0], four[1])
    const old2 = keyOf(n, four[2], four[3])
    if ((k1 === old1 && k2 === old2) || (k1 === old2 && k2 === old1)) return true // already so paired
    if (keys.has(k1) || keys.has(k2)) return false
    keys.delete(old1)
    keys.delete(old2)
    keys.add(k1)
    keys.add(k2)
    A[e1] = x1
    B[e1] = y1
    A[e2] = x2
    B[e2] = y2
    accepted++
    return true
  }

  return {
    net: { n, A, B },
    step,
    run(count, mode, p) {
      for (let i = 0; i < count; i++) step(mode, p)
    },
    get attempts() {
      return attempts
    },
    get accepted() {
      return accepted
    },
  }
}

// `swaps` · L steps of the rewiring on a copy of the network.
export function rewire(net, { mode = 'assortative', p = 1, swaps = 10, seed = 1 }) {
  const rw = rewirer(net, mulberry32(seed))
  rw.run(Math.round(swaps * net.A.length), mode, p)
  return rw.net
}

// Same degrees, no self-link, no repeated link.
export function isSimpleWithDegrees(net, k) {
  const keys = new Set()
  for (let e = 0; e < net.A.length; e++) {
    const a = net.A[e]
    const b = net.B[e]
    if (a === b) return false
    const key = keyOf(net.n, a, b)
    if (keys.has(key)) return false
    keys.add(key)
  }
  const now = degreesOf(net)
  for (let v = 0; v < net.n; v++) if (now[v] !== k[v]) return false
  return true
}

// ---------------------------------------------------------------- Removal

// The share of nodes in the largest component after the first j nodes of
// `order` are removed, for every j = 0 … n, in one backward pass: the nodes
// are put back in reverse order and joined with a union–find.
export function giantCurve(net, order) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const parent = new Int32Array(n).fill(-1) // −1: not yet back
  const size = new Int32Array(n)
  const find = (v) => {
    while (parent[v] !== v) {
      parent[v] = parent[parent[v]]
      v = parent[v]
    }
    return v
  }
  const curve = new Float64Array(n + 1)
  let largest = 0
  for (let j = n - 1; j >= 0; j--) {
    const v = order[j]
    parent[v] = v
    size[v] = 1
    if (largest < 1) largest = 1
    for (let i = g.offsets[v]; i < g.offsets[v + 1]; i++) {
      const u = g.neighbors[i]
      if (parent[u] < 0) continue
      let a = find(v)
      let b = find(u)
      if (a === b) continue
      if (size[a] < size[b]) [a, b] = [b, a]
      parent[b] = a
      size[a] += size[b]
      if (size[a] > largest) largest = size[a]
    }
    curve[j] = largest / n
  }
  curve[n] = 0
  return curve
}

// Random order of the nodes.
export function randomOrder(n, random) {
  const order = Int32Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  return order
}

// Highest degree first, the degrees of the intact network (not recomputed as
// nodes go); ties in random order.
export function attackOrder(k, random) {
  const order = randomOrder(k.length, random)
  return Int32Array.from([...order].sort((a, b) => k[b] - k[a]))
}

// ---------------------------------------------------------------- Two groups

// Growth with two groups. Each newcomer is in group 1 (the minority) with
// probability q, otherwise in group 0, and brings m links to distinct older
// nodes. For each link it picks its own group with probability h, the other
// one otherwise, then a node of that group ∝ degree (uniformly while the group
// has no links yet). The first m + 1 nodes are all linked to one another.
export function growGroups({ N, m = 2, q = 0.2, h = 0.8, seed = 1 }) {
  const random = mulberry32(seed)
  const group = new Uint8Array(N)
  const m0 = m + 1
  const total = (m0 * (m0 - 1)) / 2 + (N - m0) * m
  const A = new Int32Array(total)
  const B = new Int32Array(total)
  const ends = [new Int32Array(2 * total), new Int32Array(2 * total)]
  const endCount = [0, 0]
  const members = [new Int32Array(N), new Int32Array(N)]
  const memberCount = [0, 0]
  const join = (v) => {
    members[group[v]][memberCount[group[v]]++] = v
  }
  let e = 0
  const add = (a, b) => {
    A[e] = a
    B[e] = b
    e++
    ends[group[a]][endCount[group[a]]++] = a
    ends[group[b]][endCount[group[b]]++] = b
  }
  for (let v = 0; v < m0; v++) {
    group[v] = random() < q ? 1 : 0
    join(v)
  }
  for (let v = 1; v < m0; v++) for (let u = 0; u < v; u++) add(v, u)
  const chosen = new Int32Array(m)
  for (let v = m0; v < N; v++) {
    group[v] = random() < q ? 1 : 0
    const frozen = [endCount[0], endCount[1]] // the newcomer's own links do not count yet
    for (let j = 0; j < m; j++) {
      let u = -1
      for (let tries = 0; tries < 100 && u < 0; tries++) {
        let g = random() < h ? group[v] : 1 - group[v]
        if (!memberCount[g]) g = 1 - g
        const c = frozen[g] ? ends[g][Math.floor(random() * frozen[g])] : members[g][Math.floor(random() * memberCount[g])]
        if (!chosen.subarray(0, j).includes(c)) u = c
      }
      if (u < 0) for (u = 0; chosen.subarray(0, j).includes(u); u++);
      chosen[j] = u
    }
    for (let j = 0; j < m; j++) add(v, chosen[j])
    join(v)
  }
  return { n: N, A, B, group }
}

// The mixing matrix of a two-valued trait, as shares of link ends: e[i][j] is
// the share of link ends of a node in group i whose other end is in group j,
// over all 2L ends, so e is symmetric and sums to 1. a_i = Σ_j e_ij.
// assortativity: (Σ e_ii − Σ a_i²) / (1 − Σ a_i²) (Newman 2003).
// inside_i = e_ii / a_i: the share of group i's links that stay inside.
// coleman_i, Coleman's index: (inside_i − w_i) / (1 − w_i) when inside_i ≥ w_i,
// (inside_i − w_i) / w_i otherwise, w_i the share of nodes in group i; it runs
// from −1 (no link inside) through 0 (as by chance) to 1 (all links inside).
export function mixing(net, group) {
  const e = [
    [0, 0],
    [0, 0],
  ]
  const L = net.A.length
  for (let x = 0; x < L; x++) {
    const ga = group[net.A[x]]
    const gb = group[net.B[x]]
    e[ga][gb] += 0.5 / L
    e[gb][ga] += 0.5 / L
  }
  const a = [e[0][0] + e[0][1], e[1][0] + e[1][1]]
  const sumA2 = a[0] * a[0] + a[1] * a[1]
  let ones = 0
  for (let v = 0; v < net.n; v++) ones += group[v]
  const w = [1 - ones / net.n, ones / net.n]
  const inside = [e[0][0] / a[0], e[1][1] / a[1]]
  return {
    e,
    a,
    w,
    assortativity: (e[0][0] + e[1][1] - sumA2) / (1 - sumA2),
    inside,
    coleman: inside.map((h, i) => coleman(h, w[i])),
  }
}

export const coleman = (h, w) => (h >= w ? (h - w) / (1 - w) : (h - w) / w)

// The same quantities from a mixing matrix given directly (exercise 3).
export function mixingFromMatrix(e, w) {
  const a = [e[0][0] + e[0][1], e[1][0] + e[1][1]]
  const sumA2 = a[0] * a[0] + a[1] * a[1]
  const inside = [e[0][0] / a[0], e[1][1] / a[1]]
  return { a, assortativity: (e[0][0] + e[1][1] - sumA2) / (1 - sumA2), inside, coleman: inside.map((h, i) => coleman(h, w[i])) }
}

// ---------------------------------------------------------------- Majority illusion

// The nodes to colour: round(share · n) of them, the highest degrees first
// (ties in random order) or at random.
export function colourNodes(k, share, how, random) {
  const n = k.length
  const count = Math.round(share * n)
  const order = how === 'top' ? attackOrder(k, random) : randomOrder(n, random)
  const coloured = new Uint8Array(n)
  for (let i = 0; i < count; i++) coloured[order[i]] = 1
  return coloured
}

// The share of nodes coloured, and the share of nodes (of degree ≥ 1) more
// than half of whose neighbours are coloured; per node, the coloured
// neighbours and the degree.
export function illusion(net, coloured) {
  const n = net.n
  const k = degreesOf(net)
  const seen = new Int32Array(n)
  for (let e = 0; e < net.A.length; e++) {
    if (coloured[net.B[e]]) seen[net.A[e]]++
    if (coloured[net.A[e]]) seen[net.B[e]]++
  }
  let col = 0
  let majority = 0
  let withLinks = 0
  for (let v = 0; v < n; v++) {
    col += coloured[v]
    if (!k[v]) continue
    withLinks++
    if (2 * seen[v] > k[v]) majority++
  }
  return { coloured: col / n, majority: withLinks ? majority / withLinks : NaN, seen, k }
}
