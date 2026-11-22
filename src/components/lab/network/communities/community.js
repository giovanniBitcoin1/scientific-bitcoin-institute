import { mulberry32 } from '../../rng.js'

// Network Lab module 09, "Communities": modularity, Louvain, label
// propagation, normalised mutual information, the benchmarks and the
// spectral bisection of the modularity matrix. Plain functions on edge lists
// { n, A, B } (link e joins A[e] and B[e]); a partition is an Int32Array of
// group labels, one per node. Shared with scripts/lab/check-network-09.mjs.

// ---------------------------------------------------------------- basics

export const seedOf = (seed, k) => (Math.imul(seed ^ 0x9e3779b9, 2654435761) + Math.imul(k + 1, 40503)) >>> 0

export function fromEdges(n, edges) {
  return { n, A: Int32Array.from(edges, (e) => e[0]), B: Int32Array.from(edges, (e) => e[1]) }
}

export function fromData(data) {
  return fromEdges(data.nodes.length, data.edges)
}

export function degreesOf(g) {
  const k = new Int32Array(g.n)
  for (let e = 0; e < g.A.length; e++) {
    k[g.A[e]]++
    k[g.B[e]]++
  }
  return k
}

// Neighbour lists in compressed form: nbr[off[v]] … nbr[off[v + 1] − 1].
export function adjacency(g) {
  const off = new Int32Array(g.n + 1)
  for (let e = 0; e < g.A.length; e++) {
    off[g.A[e] + 1]++
    off[g.B[e] + 1]++
  }
  for (let v = 0; v < g.n; v++) off[v + 1] += off[v]
  const fill = off.slice(0, g.n)
  const nbr = new Int32Array(2 * g.A.length)
  for (let e = 0; e < g.A.length; e++) {
    nbr[fill[g.A[e]]++] = g.B[e]
    nbr[fill[g.B[e]]++] = g.A[e]
  }
  return { off, nbr }
}

// Labels renumbered 0, 1, 2, … in order of first appearance.
export function relabel(part) {
  const map = new Map()
  const out = new Int32Array(part.length)
  for (let i = 0; i < part.length; i++) {
    if (!map.has(part[i])) map.set(part[i], map.size)
    out[i] = map.get(part[i])
  }
  return out
}

export const groupCount = (part) => new Set(part).size

function shuffle(a, random) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

// ---------------------------------------------------------------- modularity

// The two terms of Q_γ = Σ_c [L_c/L − γ (d_c/2L)²]: the share of links inside
// the groups, and the share expected if the same degrees were wired at random.
export function modularityTerms(g, part) {
  const L = g.A.length
  const groups = relabel(part)
  const G = groupCount(groups)
  const inside = new Float64Array(G)
  const deg = new Float64Array(G)
  for (let e = 0; e < L; e++) {
    const a = groups[g.A[e]]
    const b = groups[g.B[e]]
    deg[a]++
    deg[b]++
    if (a === b) inside[a]++
  }
  let I = 0
  let E = 0
  for (let c = 0; c < G; c++) {
    I += inside[c] / L
    E += (deg[c] / (2 * L)) ** 2
  }
  return { inside: I, expected: E, groups: G }
}

export function modularity(g, part, gamma = 1) {
  if (!g.A.length) return 0
  const t = modularityTerms(g, part)
  return t.inside - gamma * t.expected
}

// The definition itself: Q = (1/2L) Σ_ij [A_ij − k_i k_j / 2L] δ(c_i, c_j),
// summed over every ordered pair. O(n²); for checks on small networks.
export function modularityDirect(g, part) {
  const n = g.n
  const L = g.A.length
  const k = degreesOf(g)
  const Aij = new Float64Array(n * n)
  for (let e = 0; e < L; e++) {
    Aij[g.A[e] * n + g.B[e]] += 1
    Aij[g.B[e] * n + g.A[e]] += 1
  }
  let s = 0
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (part[i] === part[j]) s += Aij[i * n + j] - (k[i] * k[j]) / (2 * L)
  return s / (2 * L)
}

// ---------------------------------------------------------------- Louvain

// Blondel, Guillaume, Lambiotte and Lefebvre (2008). Each level: visit the
// nodes in a random order from the seed and move each to the neighbouring
// group that raises Q_γ most, while any move raises it; then merge every group
// into one node (links inside become a self-loop weight) and repeat on the
// smaller network. Stops when a level makes no move. Returns the partition of
// the original nodes at the top level.
//
// onMove({ dQ, partition }) is called after every move, with the rise in Q_γ
// the move should give and a function returning the current partition of the
// original nodes (checks only).
export function louvain(g, { seed = 1, gamma = 1, onMove = null, maxLevels = 50 } = {}) {
  const random = mulberry32(seed)
  const L = g.A.length
  const n0 = g.n
  if (!L) return { partition: relabel(Int32Array.from({ length: n0 }, (_, i) => i)), Q: 0, levels: 0, moves: 0 }
  const m2 = 2 * L
  // level graph: weighted neighbour lists and self-loop weights
  let n = n0
  let { off, nbr } = adjacency(g)
  let w = new Float64Array(nbr.length).fill(1)
  let self = new Float64Array(n)
  let orig2node = Int32Array.from({ length: n0 }, (_, i) => i)
  let levels = 0
  let moves = 0
  for (let level = 0; level < maxLevels; level++) {
    const k = new Float64Array(n)
    for (let v = 0; v < n; v++) {
      let s = 2 * self[v]
      for (let p = off[v]; p < off[v + 1]; p++) s += w[p]
      k[v] = s
    }
    const comm = Int32Array.from({ length: n }, (_, i) => i)
    const tot = Float64Array.from(k)
    const toComm = new Float64Array(n)
    const touched = new Int32Array(n)
    const order = shuffle(Int32Array.from({ length: n }, (_, i) => i), random)
    let moved = false
    let improved = true
    const partitionNow = () => {
      const out = new Int32Array(n0)
      for (let i = 0; i < n0; i++) out[i] = comm[orig2node[i]]
      return out
    }
    while (improved) {
      improved = false
      for (const v of order) {
        const cv = comm[v]
        // weights from v to each neighbouring group
        let nt = 0
        for (let p = off[v]; p < off[v + 1]; p++) {
          const c = comm[nbr[p]]
          if (toComm[c] === 0) touched[nt++] = c
          toComm[c] += w[p]
        }
        tot[cv] -= k[v]
        const gainOf = (c) => toComm[c] - (gamma * tot[c] * k[v]) / m2
        const stay = gainOf(cv)
        let best = cv
        let bestGain = stay
        for (let t = 0; t < nt; t++) {
          const c = touched[t]
          if (c === cv) continue
          const gn = gainOf(c)
          if (gn > bestGain + 1e-12) {
            bestGain = gn
            best = c
          }
        }
        tot[best] += k[v]
        comm[v] = best
        for (let t = 0; t < nt; t++) toComm[touched[t]] = 0
        if (best !== cv) {
          moves++
          moved = true
          improved = true
          if (onMove) onMove({ dQ: (2 * (bestGain - stay)) / m2, partition: partitionNow })
        }
      }
    }
    if (!moved) break
    levels++
    // aggregate
    const lab = relabel(comm)
    const G = groupCount(lab)
    const selfN = new Float64Array(G)
    const maps = Array.from({ length: G }, () => new Map())
    for (let v = 0; v < n; v++) {
      const a = lab[v]
      selfN[a] += self[v]
      for (let p = off[v]; p < off[v + 1]; p++) {
        const b = lab[nbr[p]]
        if (a === b) selfN[a] += w[p] / 2
        else maps[a].set(b, (maps[a].get(b) || 0) + w[p])
      }
    }
    const offN = new Int32Array(G + 1)
    for (let a = 0; a < G; a++) offN[a + 1] = offN[a] + maps[a].size
    const nbrN = new Int32Array(offN[G])
    const wN = new Float64Array(offN[G])
    for (let a = 0; a < G; a++) {
      let p = offN[a]
      for (const [b, x] of maps[a]) {
        nbrN[p] = b
        wN[p++] = x
      }
    }
    for (let i = 0; i < n0; i++) orig2node[i] = lab[orig2node[i]]
    n = G
    off = offN
    nbr = nbrN
    w = wN
    self = selfN
  }
  const partition = relabel(orig2node)
  return { partition, Q: modularity(g, partition, gamma), levels, moves }
}

// Best of several seeds (the panel and the checks).
export function louvainBest(g, seeds, gamma = 1) {
  let best = null
  for (const s of seeds) {
    const r = louvain(g, { seed: s, gamma })
    if (!best || r.Q > best.Q + 1e-12) best = r
  }
  return best
}

// ---------------------------------------------------------------- label propagation

// Raghavan, Albert and Kumara (2007): every node starts with a label of its
// own; in a random order, each takes the label most frequent among its
// neighbours, ties broken at random; stop when every node holds a label that
// is among the most frequent around it (or after maxSweeps).
export function labelPropagation(g, { seed = 1, maxSweeps = 200 } = {}) {
  const random = mulberry32(seed)
  const n = g.n
  const { off, nbr } = adjacency(g)
  const label = Int32Array.from({ length: n }, (_, i) => i)
  const count = new Int32Array(n)
  const touched = new Int32Array(n)
  const order = Int32Array.from({ length: n }, (_, i) => i)
  const ties = new Int32Array(n)
  let sweeps = 0
  const counts = (v) => {
    let nt = 0
    for (let p = off[v]; p < off[v + 1]; p++) {
      const l = label[nbr[p]]
      if (count[l] === 0) touched[nt++] = l
      count[l]++
    }
    let top = 0
    for (let t = 0; t < nt; t++) if (count[touched[t]] > top) top = count[touched[t]]
    return { nt, top }
  }
  const clear = (nt) => {
    for (let t = 0; t < nt; t++) count[touched[t]] = 0
  }
  for (; sweeps < maxSweeps; ) {
    sweeps++
    shuffle(order, random)
    for (const v of order) {
      if (off[v + 1] === off[v]) continue
      const { nt, top } = counts(v)
      let nTies = 0
      for (let t = 0; t < nt; t++) if (count[touched[t]] === top) ties[nTies++] = touched[t]
      label[v] = ties[Math.floor(random() * nTies)]
      clear(nt)
    }
    let stable = true
    for (let v = 0; v < n && stable; v++) {
      if (off[v + 1] === off[v]) continue
      const { nt, top } = counts(v)
      if (count[label[v]] !== top) stable = false
      clear(nt)
    }
    if (stable) break
  }
  const partition = relabel(label)
  return { partition, Q: modularity(g, partition), sweeps }
}

// ---------------------------------------------------------------- NMI

// Normalised mutual information as in Danon, Díaz-Guilera, Duch and Arenas
// (2005): −2 Σ N_ij log(N_ij N / N_i N_j) / [Σ N_i log(N_i/N) + Σ N_j log(N_j/N)],
// from the confusion matrix N_ij. 1 when both partitions are one group.
export function nmi(x, y) {
  const N = x.length
  const a = relabel(x)
  const b = relabel(y)
  const ga = groupCount(a)
  const gb = groupCount(b)
  const joint = new Map()
  const na = new Float64Array(ga)
  const nb = new Float64Array(gb)
  for (let i = 0; i < N; i++) {
    na[a[i]]++
    nb[b[i]]++
    const key = a[i] * gb + b[i]
    joint.set(key, (joint.get(key) || 0) + 1)
  }
  let num = 0
  for (const [key, nij] of joint) {
    const i = Math.floor(key / gb)
    const j = key % gb
    num += nij * Math.log((nij * N) / (na[i] * nb[j]))
  }
  let den = 0
  for (const v of na) den += v * Math.log(v / N)
  for (const v of nb) den += v * Math.log(v / N)
  if (den === 0) return 1
  return (-2 * num) / den
}

// ---------------------------------------------------------------- networks

// Each pair is linked with probability p(group a, group b): a stochastic
// block model, pair by pair (small networks only).
export function blockModelDense(groups, prob, seed) {
  const random = mulberry32(seed)
  const n = groups.length
  const A = []
  const B = []
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (random() < prob(groups[i], groups[j])) {
        A.push(i)
        B.push(j)
      }
  return { n, A: Int32Array.from(A), B: Int32Array.from(B) }
}

// Girvan and Newman's benchmark: 128 nodes in four groups of 32; each node has
// on average 16 − k_out links inside its group and k_out to the other three.
export const GN_N = 128
export const GN_GROUPS = 4
export const GN_K = 16
export const gnGroups = () => Int32Array.from({ length: GN_N }, (_, i) => Math.floor(i / (GN_N / GN_GROUPS)))
export function gnBenchmark(kOut, seed) {
  const size = GN_N / GN_GROUPS
  const pIn = (GN_K - kOut) / (size - 1)
  const pOut = kOut / (GN_N - size)
  const groups = gnGroups()
  const g = blockModelDense(groups, (a, b) => (a === b ? pIn : pOut), seed)
  return { ...g, planted: groups }
}

// G(n, M): M distinct links chosen uniformly among all pairs.
export function randomGnm(n, M, seed) {
  const random = mulberry32(seed)
  const A = new Int32Array(M)
  const B = new Int32Array(M)
  const keys = new Set()
  let e = 0
  while (e < M) {
    const a = Math.floor(random() * n)
    const b = Math.floor(random() * n)
    if (a === b) continue
    const key = a < b ? a * n + b : b * n + a
    if (keys.has(key)) continue
    keys.add(key)
    A[e] = a
    B[e] = b
    e++
  }
  return { n, A, B }
}

// Two equal groups of N/2, sparse: c_in = N p_in and c_out = N p_out, so a node
// has on average c_in/2 links inside its group and c_out/2 across, and the
// mean degree is c̄ = (c_in + c_out)/2. The number of links of each kind is
// drawn from its Poisson law, then the links are placed at random (repeats
// and self-links redrawn), so the cost is proportional to the links.
export function twoGroupSBM(N, cIn, cOut, seed) {
  const random = mulberry32(seed)
  const h = N / 2
  const poisson = (mu) => {
    // normal approximation for large means, exact below
    if (mu > 50) return Math.max(0, Math.round(mu + Math.sqrt(mu) * gauss()))
    let k = 0
    let p = Math.exp(-mu)
    let s = p
    const u = random()
    while (u > s) {
      k++
      p *= mu / k
      s += p
    }
    return k
  }
  function gauss() {
    const u = 1 - random()
    const v = random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  // expected links: inside each group (h choose 2) p_in, across h² p_out
  const pIn = cIn / N
  const pOut = cOut / N
  const nIn = [poisson(((h * (h - 1)) / 2) * pIn), poisson(((h * (h - 1)) / 2) * pIn)]
  const nOut = poisson(h * h * pOut)
  const total = nIn[0] + nIn[1] + nOut
  const A = new Int32Array(total)
  const B = new Int32Array(total)
  const keys = new Set()
  let e = 0
  const place = (count, pick) => {
    for (let c = 0; c < count; ) {
      const [a, b] = pick()
      if (a === b) continue
      const key = a < b ? a * N + b : b * N + a
      if (keys.has(key)) continue
      keys.add(key)
      A[e] = a
      B[e] = b
      e++
      c++
    }
  }
  const r = () => Math.floor(random() * h)
  place(nIn[0], () => [r(), r()])
  place(nIn[1], () => [h + r(), h + r()])
  place(nOut, () => [r(), h + r()])
  const planted = Int32Array.from({ length: N }, (_, i) => (i < h ? 0 : 1))
  return { n: N, A, B, planted }
}

// Overlap with two planted groups: (accuracy − 1/2)/(1/2), up to swapping the
// two labels. `found` is a 0/1 labelling.
export function overlap(found, planted) {
  let agree = 0
  for (let i = 0; i < found.length; i++) if (found[i] === planted[i]) agree++
  const acc = Math.max(agree, found.length - agree) / found.length
  return 2 * acc - 1
}

// ---------------------------------------------------------------- ring of cliques

// n cliques of s nodes in a ring; node 0 of clique i is linked to node 1 of
// clique i + 1 (for s ≥ 2), one link between neighbours.
export function ringOfCliques(n, s) {
  const A = []
  const B = []
  for (let c = 0; c < n; c++) {
    const base = c * s
    for (let i = 0; i < s; i++) for (let j = i + 1; j < s; j++) A.push(base + i), B.push(base + j)
    const next = ((c + 1) % n) * s
    A.push(base)
    B.push(next + 1)
  }
  return { n: n * s, A: Int32Array.from(A), B: Int32Array.from(B), cliques: n, size: s }
}
export const cliquePartition = (n, s) => Int32Array.from({ length: n * s }, (_, i) => Math.floor(i / s))
// pairs (0,1), (2,3), …; with n odd the last clique stays alone
export const pairPartition = (n, s) => Int32Array.from({ length: n * s }, (_, i) => Math.floor(Math.floor(i / s) / 2))

// Closed forms, d = s(s − 1) + 2 and L = n(s(s − 1)/2 + 1), n even.
export function ringQ(n, s, gamma = 1) {
  const L = n * ((s * (s - 1)) / 2 + 1)
  const d = s * (s - 1) + 2
  const one = n * ((s * (s - 1)) / 2 / L - gamma * (d / (2 * L)) ** 2)
  const pairs = (n / 2) * ((s * (s - 1) + 1) / L - gamma * ((2 * d) / (2 * L)) ** 2)
  return { one, pairs, L, d }
}

// The range of γ in which "each clique a group" beats merging neighbouring
// cliques (any run of them) and splitting one clique in two:
// γ > 2L/d², and γ < min over splits of 2L a(s − a)/(d_S d_T).
export function ringGammaRange(n, s) {
  const { L, d } = ringQ(n, s)
  const lo = (2 * L) / (d * d)
  let hi = Infinity
  for (let a = 1; a < s; a++)
    for (let ext = 0; ext <= Math.min(2, a); ext++) {
      // a part of a nodes holding `ext` of the clique's two outer links
      if (s - a < 2 - ext) continue
      const dS = a * (s - 1) + ext
      const dT = d - dS
      hi = Math.min(hi, (2 * L * a * (s - a)) / (dS * dT))
    }
  return { lo, hi }
}

// How a found partition sits on the cliques: cliques split across groups,
// and groups holding more than one clique.
export function cliqueReport(part, n, s) {
  let split = 0
  const groupCliques = new Map()
  for (let c = 0; c < n; c++) {
    const labels = new Set()
    for (let i = 0; i < s; i++) labels.add(part[c * s + i])
    if (labels.size > 1) split++
    else {
      const l = part[c * s]
      groupCliques.set(l, (groupCliques.get(l) || 0) + 1)
    }
  }
  let merged = 0
  for (const v of groupCliques.values()) if (v > 1) merged += v
  return { groups: groupCount(part), split, merged }
}

// ---------------------------------------------------------------- spectral bisection

// Leading eigenvector of the modularity matrix B = A − k kᵀ/2L by power
// iteration on B + cI (c makes every eigenvalue positive), never storing B:
// B x = A x − k (k·x)/2L. Starts from a random vector with zero sum (the
// all-ones vector is an eigenvector of B with eigenvalue 0). A job: yields
// progress; snapshot returns the signs as a 0/1 partition.
export function spectralJob(g, { seed = 1, maxIter = 4000, tol = 1e-7, chunk = 25 } = {}) {
  const n = g.n
  const L = g.A.length
  const k = degreesOf(g)
  const { off, nbr } = adjacency(g)
  let kmax = 0
  let k2 = 0
  for (let i = 0; i < n; i++) {
    if (k[i] > kmax) kmax = k[i]
    k2 += k[i] * k[i]
  }
  const c = kmax + k2 / (2 * L || 1)
  const random = mulberry32(seed)
  let x = new Float64Array(n)
  let y = new Float64Array(n)
  let mean = 0
  for (let i = 0; i < n; i++) mean += (x[i] = random() - 0.5)
  mean /= n
  for (let i = 0; i < n; i++) x[i] -= mean
  const normalise = (v) => {
    let s = 0
    for (let i = 0; i < n; i++) s += v[i] * v[i]
    s = Math.sqrt(s) || 1
    for (let i = 0; i < n; i++) v[i] /= s
  }
  normalise(x)
  let lambda = 0
  let iter = 0
  let converged = false
  const step = () => {
    let kx = 0
    for (let i = 0; i < n; i++) kx += k[i] * x[i]
    const f = kx / (2 * L)
    let ray = 0
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let p = off[i]; p < off[i + 1]; p++) s += x[nbr[p]]
      const bx = s - k[i] * f
      ray += x[i] * bx
      y[i] = bx + c * x[i]
    }
    // keep orthogonal to the all-ones vector against rounding
    let m = 0
    for (let i = 0; i < n; i++) m += y[i]
    m /= n
    for (let i = 0; i < n; i++) y[i] -= m
    normalise(y)
    let diff = 0
    for (let i = 0; i < n; i++) diff += (y[i] - x[i]) ** 2
    const t = x
    x = y
    y = t
    lambda = ray
    iter++
    return Math.sqrt(diff)
  }
  function* iterGen() {
    while (iter < maxIter) {
      for (let j = 0; j < chunk && iter < maxIter; j++) {
        if (step() < tol) {
          converged = true
          return
        }
      }
      yield iter / maxIter
    }
  }
  return {
    iter: iterGen(),
    snapshot: () => ({ partition: Int32Array.from(x, (v) => (v >= 0 ? 1 : 0)), vector: x, lambda, iter, converged }),
  }
}

export function drain(job) {
  for (const _ of job.iter);
  return job.snapshot()
}
