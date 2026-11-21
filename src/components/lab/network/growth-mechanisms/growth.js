import { mulberry32 } from '../../rng.js'

// Network Lab module 06, "Growth mechanisms": the growing networks of the
// module, as plain functions shared by the panels, the live figures and
// scripts/lab/check-network-06.mjs. Every network is grown one node at a
// time; node i is born at step i (0-based), so the birth order is the index.
// A network is { n, m, A, B, deg, ... } with the links in the order they were
// made, A[e] the newer end (the node that made the link) and B[e] the older.

// ---------------------------------------------------------------- Sampler

// A Fenwick (binary indexed) tree over non-negative weights: set a weight and
// draw an index with probability proportional to its weight, both in
// O(log n). Weights are kept in `w` so that a change is applied as a delta.
export class Fenwick {
  constructor(size) {
    this.n = size
    this.tree = new Float64Array(size + 1)
    this.w = new Float64Array(size)
    this.total = 0
    let top = 1
    while (top * 2 <= size) top *= 2
    this.top = top
  }
  set(i, value) {
    const d = value - this.w[i]
    if (d === 0) return
    this.w[i] = value
    this.total += d
    for (let j = i + 1; j <= this.n; j += j & -j) this.tree[j] += d
  }
  // The index i with prefix(i) ≤ u < prefix(i + 1), for u in [0, total).
  find(u) {
    let pos = 0
    for (let step = this.top; step > 0; step >>= 1) {
      const next = pos + step
      if (next <= this.n && this.tree[next] <= u) {
        pos = next
        u -= this.tree[next]
      }
    }
    // Rounding can leave u just past the last positive weight: step back to it.
    let i = Math.min(pos, this.n - 1)
    while (i > 0 && this.w[i] === 0) i--
    return i
  }
  draw(random) {
    return this.find(random() * this.total)
  }
}

// ---------------------------------------------------------------- Growth with a kernel

export const KERNEL_DEFAULT = { alpha: 1, A: 0, m: 2, N: 5000 }

// Growth from a clique of m + 1 nodes; each new node makes m links to distinct
// existing nodes, chosen with probability ∝ (k + A)^α (k the degree). A chosen
// node's weight is set to 0 until the m targets are drawn, which is the same
// as drawing again when a target repeats. `track` records the leader (the
// node of largest degree, the older one on a tie) as the network grows.
export function growKernel({ N, m = 2, alpha = 1, A = 0, seed = 1, track = false }) {
  const random = mulberry32(seed)
  const deg = new Int32Array(N)
  const L = (m * (m + 1)) / 2 + (N - m - 1) * m
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  let e = 0
  const tree = new Fenwick(N)
  const weight = (k) => (k + A > 0 ? (k + A) ** alpha : 0)
  for (let a = 0; a <= m; a++)
    for (let b = 0; b < a; b++) {
      src[e] = a
      dst[e] = b
      e++
      deg[a]++
      deg[b]++
    }
  for (let v = 0; v <= m; v++) tree.set(v, weight(deg[v]))
  let leader = 0
  for (let v = 1; v <= m; v++) if (deg[v] > deg[leader]) leader = v
  const leaderAt = track ? new Int32Array(N) : null
  if (track) for (let t = 0; t <= m; t++) leaderAt[t] = leader
  const chosen = new Int32Array(m)
  const saved = new Float64Array(m)
  for (let t = m + 1; t < N; t++) {
    for (let j = 0; j < m; j++) {
      const u = tree.draw(random)
      chosen[j] = u
      saved[j] = tree.w[u]
      tree.set(u, 0)
    }
    for (let j = 0; j < m; j++) {
      const u = chosen[j]
      src[e] = t
      dst[e] = u
      e++
      deg[u]++
      tree.set(u, weight(deg[u]))
      if (deg[u] > deg[leader] || (deg[u] === deg[leader] && u < leader)) leader = u
    }
    deg[t] = m
    tree.set(t, weight(m))
    if (deg[t] > deg[leader]) leader = t
    if (track) leaderAt[t] = leader
  }
  return { n: N, m, A: src, B: dst, deg, leader, leaderAt }
}

// ---------------------------------------------------------------- Link selection

// Each new node picks a link at random and attaches to one of its two ends,
// m times, to m distinct nodes. The end of a random link is a node reached in
// proportion to its degree: linear preferential attachment with no degree in
// sight.
export function growLinkSelection({ N, m = 2, seed = 1 }) {
  const random = mulberry32(seed)
  const deg = new Int32Array(N)
  const L = (m * (m + 1)) / 2 + (N - m - 1) * m
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  let e = 0
  for (let a = 0; a <= m; a++)
    for (let b = 0; b < a; b++) {
      src[e] = a
      dst[e] = b
      e++
      deg[a]++
      deg[b]++
    }
  const chosen = new Int32Array(m)
  for (let t = m + 1; t < N; t++) {
    const links = e
    for (let j = 0; j < m; j++) {
      let u
      do {
        const l = Math.floor(random() * links)
        u = random() < 0.5 ? src[l] : dst[l]
      } while (chosen.subarray(0, j).includes(u))
      chosen[j] = u
    }
    for (let j = 0; j < m; j++) {
      src[e] = t
      dst[e] = chosen[j]
      e++
      deg[chosen[j]]++
    }
    deg[t] = m
  }
  return { n: N, m, A: src, B: dst, deg }
}

// ---------------------------------------------------------------- Copying

// Directed. The m + 1 starting nodes point to one another; every new node makes
// m links, each on its own: pick a node u at random; with probability p link
// to u, otherwise to the target of one of u's out-links, chosen at random
// (every node has exactly m out-links). Repeated links are allowed. `inDeg` is
// the number of links received; `deg` is in + out.
export function growCopying({ N, m = 2, p = 0.5, seed = 1 }) {
  const random = mulberry32(seed)
  const inDeg = new Int32Array(N)
  const L = N * m
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  let e = 0
  // out-links of node v are src/dst[v*m … v*m + m − 1]
  for (let a = 0; a <= m; a++)
    for (let b = 0; b <= m; b++) {
      if (a === b) continue
      src[e] = a
      dst[e] = b
      e++
      inDeg[b]++
    }
  for (let t = m + 1; t < N; t++) {
    for (let j = 0; j < m; j++) {
      const u = Math.floor(random() * t)
      const target = random() < p ? u : dst[u * m + Math.floor(random() * m)]
      src[e] = t
      dst[e] = target
      e++
    }
    for (let j = 0; j < m; j++) inDeg[dst[e - m + j]]++
  }
  const deg = Int32Array.from(inDeg, (q) => q + m)
  return { n: N, m, A: src, B: dst, inDeg, deg, directed: true }
}

// Price's in-degree distribution for c links per new node and offset a:
// p_q = B(q + a, 2 + a/c) / B(a, 1 + a/c). From B(x, y + 1) = B(x, y) y/(x + y)
// and B(x + 1, y) = B(x, y) x/(x + y): p_0 = (1 + a/c)/(1 + a + a/c) and
// p_q = p_(q−1) (q − 1 + a)/(q + a + 1 + a/c).
export function priceDistribution(c, a, qMax) {
  const out = new Float64Array(qMax + 1)
  const b = a / c
  out[0] = (1 + b) / (1 + a + b)
  for (let q = 1; q <= qMax; q++) out[q] = out[q - 1] * ((q - 1 + a) / (q + a + 1 + b))
  return out
}

// ---------------------------------------------------------------- Random walk

// Each new node makes m links; for each, a walker starts at a node chosen at
// random and takes ℓ steps along the links of the network built so far; the
// link goes where it stops (drawn again if that node is already chosen).
// ℓ = 0 is uniform attachment.
export function growRandomWalk({ N, m = 2, steps = 1, seed = 1 }) {
  const random = mulberry32(seed)
  const deg = new Int32Array(N)
  const L = (m * (m + 1)) / 2 + (N - m - 1) * m
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  // adjacency lists that grow with the network
  const nb = []
  let e = 0
  const add = (a, b) => {
    src[e] = a
    dst[e] = b
    e++
    nb[a].push(b)
    nb[b].push(a)
    deg[a]++
    deg[b]++
  }
  for (let v = 0; v < N; v++) nb.push(v <= m ? [] : null)
  for (let a = 0; a <= m; a++) for (let b = 0; b < a; b++) add(a, b)
  const chosen = new Int32Array(m)
  for (let t = m + 1; t < N; t++) {
    for (let j = 0; j < m; j++) {
      let u
      do {
        u = Math.floor(random() * t)
        for (let s = 0; s < steps; s++) {
          const list = nb[u]
          u = list[Math.floor(random() * list.length)]
        }
      } while (chosen.subarray(0, j).includes(u))
      chosen[j] = u
    }
    nb[t] = []
    for (let j = 0; j < m; j++) add(t, chosen[j])
  }
  return { n: N, m, A: src, B: dst, deg }
}

// ---------------------------------------------------------------- Optimisation

// Fabrikant, Koutsoupias and Papadimitriou (2002). Nodes arrive at uniform
// random positions in the unit square; node 0 is the root (the "centre" of the
// network). Each new node links to the one existing node j that minimises
// δ × distance + h_j, where h_j is the number of hops from j to the root; ties
// go to the lowest index. m = 1, so the network is a tree.
export function growOptimisation({ N, delta = 10, seed = 1, centre = true }) {
  const random = mulberry32(seed)
  const x = new Float64Array(N)
  const y = new Float64Array(N)
  const hops = new Int32Array(N)
  const deg = new Int32Array(N)
  const src = new Int32Array(N - 1)
  const dst = new Int32Array(N - 1)
  for (let v = 0; v < N; v++) {
    x[v] = random()
    y[v] = random()
  }
  if (centre) {
    x[0] = 0.5
    y[0] = 0.5
  }
  for (let t = 1; t < N; t++) {
    let best = 0
    let bestCost = Infinity
    const xt = x[t]
    const yt = y[t]
    for (let j = 0; j < t; j++) {
      const dx = xt - x[j]
      const dy = yt - y[j]
      const cost = delta * Math.sqrt(dx * dx + dy * dy) + hops[j]
      if (cost < bestCost) {
        bestCost = cost
        best = j
      }
    }
    src[t - 1] = t
    dst[t - 1] = best
    hops[t] = hops[best] + 1
    deg[t]++
    deg[best]++
  }
  return { n: N, m: 1, A: src, B: dst, deg, x, y, hops }
}

// ---------------------------------------------------------------- Mechanisms by id

export const MECHANISMS = ['linear', 'uniform', 'linkSelection', 'copying', 'walk', 'optimisation']

export function grow(id, { N, m = 2, p = 0.5, steps = 1, delta = 10, seed = 1, alpha = 1, A = 0 }) {
  switch (id) {
    case 'linear':
      return growKernel({ N, m, alpha: 1, A: 0, seed })
    case 'uniform':
      return growKernel({ N, m, alpha: 0, A: 0, seed })
    case 'kernel':
      return growKernel({ N, m, alpha, A, seed })
    case 'linkSelection':
      return growLinkSelection({ N, m, seed })
    case 'copying':
      return growCopying({ N, m, p, seed })
    case 'walk':
      return growRandomWalk({ N, m, steps, seed })
    case 'optimisation':
      return growOptimisation({ N, delta, seed })
    default:
      throw new Error(`unknown mechanism ${id}`)
  }
}

// ---------------------------------------------------------------- Exact distributions

// Linear kernel with offset, Π ∝ k + A, m links per node: the rate equation
// gives p_m = (2m + A)/(m(m + A) + 2m + A) and
// p_k = p_(k−1) (k − 1 + A)/(k + A + 2 + A/m); tail exponent γ = 3 + A/m.
export function offsetDistribution(m, A, kMax) {
  const out = new Float64Array(kMax + 1)
  out[m] = (2 * m + A) / (m * (m + A) + 2 * m + A)
  for (let k = m + 1; k <= kMax; k++) out[k] = (out[k - 1] * (k - 1 + A)) / (k + A + 2 + A / m)
  return out
}

// Uniform attachment, m links per node: p_k = (1/(m + 1)) (m/(m + 1))^(k − m).
export function uniformDistribution(m, kMax) {
  const out = new Float64Array(kMax + 1)
  for (let k = m; k <= kMax; k++) out[k] = (1 / (m + 1)) * (m / (m + 1)) ** (k - m)
  return out
}

// Degree histogram: share of the nodes with each degree, 0 … max.
export function degreeShares(deg) {
  let max = 0
  for (const k of deg) if (k > max) max = k
  const out = new Float64Array(max + 1)
  for (const k of deg) out[k]++
  for (let k = 0; k <= max; k++) out[k] /= deg.length
  return out
}

// P(K ≥ k) for every k that occurs: [[k, share]], k ≥ from.
export function ccdf(deg, from = 1) {
  const P = degreeShares(deg)
  const out = []
  let above = 0
  for (let k = P.length - 1; k >= 0; k--) {
    above += P[k]
    if (P[k] > 0 && k >= from) out.push([k, above])
  }
  return out.reverse()
}

// Summary of a degree sequence: largest degree, its node, the share of the
// other nodes linked to it, and ⟨k²⟩/⟨k⟩.
export function hubStats(deg) {
  let s1 = 0
  let s2 = 0
  let hub = 0
  for (let v = 0; v < deg.length; v++) {
    s1 += deg[v]
    s2 += deg[v] * deg[v]
    if (deg[v] > deg[hub]) hub = v
  }
  return { hub, max: deg[hub], share: deg[hub] / (deg.length - 1), ratio: s2 / s1, mean: s1 / deg.length }
}

// The size after which the leader no longer changes (from `leaderAt`).
export function leaderSettles(leaderAt) {
  const final = leaderAt[leaderAt.length - 1]
  let t = leaderAt.length - 1
  while (t > 0 && leaderAt[t - 1] === final) t--
  return t + 1 // the network has t + 1 nodes when the final leader takes over
}
