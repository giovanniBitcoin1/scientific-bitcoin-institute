import { mulberry32 } from './rng.js'

// Graph helpers on typed arrays, shared by the network modules.
//
// A graph is stored in compressed sparse row (CSR) form: the neighbours of
// node v are neighbors[offsets[v]] … neighbors[offsets[v + 1] − 1]. Nodes are
// 0 … n − 1 and every undirected edge is stored in both directions. Edge lists
// are two parallel arrays A, B (edge e joins A[e] and B[e]).

// ---------------------------------------------------------------- Structure

export function buildCSR(n, A, B, m = A.length) {
  const offsets = new Int32Array(n + 1)
  for (let e = 0; e < m; e++) {
    offsets[A[e] + 1]++
    offsets[B[e] + 1]++
  }
  for (let v = 0; v < n; v++) offsets[v + 1] += offsets[v]
  const fill = offsets.slice(0, n)
  const neighbors = new Int32Array(2 * m)
  for (let e = 0; e < m; e++) {
    neighbors[fill[A[e]]++] = B[e]
    neighbors[fill[B[e]]++] = A[e]
  }
  return { n, m, offsets, neighbors }
}

export function degree(g, v) {
  return g.offsets[v + 1] - g.offsets[v]
}

// ---------------------------------------------------------------- Search

// Breadth-first search from `source`: dist[v] is the number of steps on a
// shortest path, or −1 when v cannot be reached. `dist` and `queue` may be
// passed in to avoid allocating when BFS runs many times on one graph.
export function bfsDistances(g, source, dist = new Int32Array(g.n), queue = new Int32Array(g.n)) {
  const { offsets, neighbors } = g
  dist.fill(-1)
  dist[source] = 0
  queue[0] = source
  let head = 0
  let tail = 1
  while (head < tail) {
    const u = queue[head++]
    const du = dist[u] + 1
    for (let i = offsets[u], end = offsets[u + 1]; i < end; i++) {
      const v = neighbors[i]
      if (dist[v] < 0) {
        dist[v] = du
        queue[tail++] = v
      }
    }
  }
  return dist
}

// One shortest path from a to b as a list of nodes [a, …, b], or null when
// they are in different components. BFS stops as soon as b is reached.
export function shortestPath(g, a, b) {
  const { n, offsets, neighbors } = g
  const parent = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)
  parent[a] = a
  queue[0] = a
  let head = 0
  let tail = 1
  while (head < tail && parent[b] < 0) {
    const u = queue[head++]
    for (let i = offsets[u], end = offsets[u + 1]; i < end; i++) {
      const v = neighbors[i]
      if (parent[v] < 0) {
        parent[v] = u
        queue[tail++] = v
      }
    }
  }
  if (parent[b] < 0) return null
  const path = [b]
  for (let v = b; v !== a; v = parent[v]) path.push(parent[v])
  return path.reverse()
}

// Labels every node with its component index (0, 1, …, in order of the
// lowest node in each component).
export function connectedComponents(g) {
  const { n, offsets, neighbors } = g
  const label = new Int32Array(n).fill(-1)
  const queue = new Int32Array(n)
  const sizes = []
  let largest = 0
  for (let s = 0; s < n; s++) {
    if (label[s] >= 0) continue
    const c = sizes.length
    label[s] = c
    queue[0] = s
    let head = 0
    let tail = 1
    while (head < tail) {
      const u = queue[head++]
      for (let i = offsets[u], end = offsets[u + 1]; i < end; i++) {
        const v = neighbors[i]
        if (label[v] < 0) {
          label[v] = c
          queue[tail++] = v
        }
      }
    }
    sizes.push(tail)
    if (tail > largest) largest = tail
  }
  return { label, count: sizes.length, sizes, largest }
}

// ---------------------------------------------------------------- Measures

// Local clustering of node v: the fraction of pairs of its neighbours that are
// themselves linked. `average` is the mean over all nodes (the Watts–Strogatz
// C); nodes with fewer than two neighbours count as 0.
export function clustering(g) {
  const { n, offsets, neighbors } = g
  const local = new Float64Array(n)
  const mark = new Int32Array(n).fill(-1)
  let sum = 0
  for (let v = 0; v < n; v++) {
    const start = offsets[v]
    const end = offsets[v + 1]
    const d = end - start
    if (d < 2) continue
    for (let i = start; i < end; i++) mark[neighbors[i]] = v
    let links = 0 // each link between two neighbours is seen twice
    for (let i = start; i < end; i++) {
      const u = neighbors[i]
      for (let j = offsets[u], uend = offsets[u + 1]; j < uend; j++) {
        if (mark[neighbors[j]] === v) links++
      }
    }
    local[v] = links / (d * (d - 1))
    sum += local[v]
  }
  return { average: n ? sum / n : 0, local }
}

// Mean shortest-path length L, from BFS run at every node in `sources` (all
// nodes when omitted, which makes L exact). Pairs in different components
// are left out of the mean and counted in `unreachable`. histogram[d] is the
// number of (source, target) pairs at distance d; pairs are ordered, so with
// all sources each unordered pair appears twice.
export function averagePathLength(g, sources) {
  const n = g.n
  const dist = new Int32Array(n)
  const queue = new Int32Array(n)
  const histogram = [0]
  const count = sources ? sources.length : n
  let sum = 0
  let pairs = 0
  let unreachable = 0
  for (let i = 0; i < count; i++) {
    bfsDistances(g, sources ? sources[i] : i, dist, queue)
    for (let v = 0; v < n; v++) {
      const d = dist[v]
      if (d > 0) {
        sum += d
        pairs++
        while (histogram.length <= d) histogram.push(0)
        histogram[d]++
      } else if (d < 0) {
        unreachable++
      }
    }
  }
  return { mean: pairs ? sum / pairs : NaN, pairs, unreachable, histogram, exact: !sources }
}

// `count` distinct nodes chosen uniformly at random (partial Fisher–Yates).
export function sampleNodes(n, count, random) {
  const pool = new Int32Array(n)
  for (let i = 0; i < n; i++) pool[i] = i
  const c = Math.min(count, n)
  for (let i = 0; i < c; i++) {
    const j = i + Math.floor(random() * (n - i))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }
  return pool.slice(0, c)
}

// ---------------------------------------------------------------- Models

// Ring lattice: node i is linked to i ± 1, …, i ± k/2 (mod n), k even.
// Edge e = (j − 1)·n + i joins i to its j-th clockwise neighbour, so the
// edges come in k/2 laps around the ring, nearest neighbours first.
export function ringLattice(n, k) {
  const h = k / 2
  const A = new Int32Array(n * h)
  const B = new Int32Array(n * h)
  for (let j = 1; j <= h; j++) {
    for (let i = 0; i < n; i++) {
      A[(j - 1) * n + i] = i
      B[(j - 1) * n + i] = (i + j) % n
    }
  }
  return { A, B }
}

const edgeKey = (n, a, b) => (a < b ? a * n + b : b * n + a)

// Moves the far end of edge e to a uniformly random node w, keeping its near
// end i = A[e]. w may be neither i itself nor a node already linked to i.
function rewireEdge(n, A, B, keys, e, random) {
  const i = A[e]
  let w = -1
  for (let attempt = 0; attempt < 32 && w < 0; attempt++) {
    const c = Math.floor(random() * n)
    if (c !== i && !keys.has(edgeKey(n, i, c))) w = c
  }
  if (w < 0) {
    // Nearly saturated node (small dense graphs): pick among the free targets.
    const free = []
    for (let c = 0; c < n; c++) if (c !== i && !keys.has(edgeKey(n, i, c))) free.push(c)
    if (!free.length) return false
    w = free[Math.floor(random() * free.length)]
  }
  keys.delete(edgeKey(n, i, B[e]))
  keys.add(edgeKey(n, i, w))
  B[e] = w
  return true
}

function latticeWithKeys(n, k) {
  const { A, B } = ringLattice(n, k)
  const keys = new Set()
  for (let e = 0; e < A.length; e++) keys.add(edgeKey(n, A[e], B[e]))
  return { A, B, keys, rewired: new Uint8Array(A.length) }
}

// Watts–Strogatz (1998): visit the lattice edges lap by lap and rewire each
// with probability p. Every edge draws its coin whatever p is, and each edge
// has its own stream for the new endpoint, so for one seed raising p only adds
// shortcuts: the set rewired at p is contained in the set rewired at any
// larger p. rewired[e] = 1 marks the shortcuts.
export function wattsStrogatz(n, k, p, seed) {
  const { A, B, keys, rewired } = latticeWithKeys(n, k)
  const coin = mulberry32(seed)
  let shortcuts = 0
  for (let e = 0; e < A.length; e++) {
    if (coin() < p) {
      const stream = mulberry32(Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(e + 1, 0xc2b2ae35))
      if (rewireEdge(n, A, B, keys, e, stream)) {
        rewired[e] = 1
        shortcuts++
      }
    }
  }
  return { A, B, rewired, shortcuts }
}

// The same lattice with the first `steps` edges of a seeded random order
// rewired one after another: the "one shortcut at a time" view of the model.
export function rewireSequence(n, k, steps, seed) {
  const { A, B, keys, rewired } = latticeWithKeys(n, k)
  const m = A.length
  const order = sampleNodes(m, m, mulberry32(seed ^ 0x5bd1e995))
  const random = mulberry32(seed ^ 0x27d4eb2f)
  let shortcuts = 0
  for (let s = 0; s < Math.min(steps, m); s++) {
    if (rewireEdge(n, A, B, keys, order[s], random)) {
      rewired[order[s]] = 1
      shortcuts++
    }
  }
  return { A, B, rewired, shortcuts }
}

// Erdős–Rényi G(n, M): M distinct edges chosen uniformly among all pairs.
export function erdosRenyiGnm(n, M, seed) {
  const random = mulberry32(seed)
  const target = Math.min(M, (n * (n - 1)) / 2)
  const A = new Int32Array(target)
  const B = new Int32Array(target)
  const keys = new Set()
  let e = 0
  while (e < target) {
    const a = Math.floor(random() * n)
    const b = Math.floor(random() * n)
    if (a === b) continue
    const key = edgeKey(n, a, b)
    if (keys.has(key)) continue
    keys.add(key)
    A[e] = a
    B[e] = b
    e++
  }
  return { A, B }
}

// Barabási–Albert (1999) growth. The network starts as a complete graph on
// m + 1 nodes; every later node arrives with m links to distinct earlier
// nodes. With preferential attachment the targets are drawn from the list of
// all edge endpoints so far, in which node i appears k_i times: a uniform
// pick from that list chooses i with probability proportional to its degree.
// With `uniform: true` every earlier node is equally likely instead.
//
// Edges are stored in order of arrival, and the random stream does not depend
// on n, so for one seed the first t nodes of a larger network are exactly the
// network grown to t nodes. edgesUpTo[t] is the number of edges among the
// first t nodes (so A, B truncated there is the network at size t).
export function barabasiAlbert(n, m, seed, { uniform = false } = {}) {
  const m0 = m + 1
  const N = Math.max(n, m0)
  const total = (m0 * (m0 - 1)) / 2 + (N - m0) * m
  const A = new Int32Array(total)
  const B = new Int32Array(total)
  const ends = new Int32Array(2 * total) // every edge endpoint, once per link
  const edgesUpTo = new Int32Array(N + 1)
  const random = mulberry32(seed)
  const chosen = new Int32Array(m)
  let e = 0
  for (let v = 1; v < m0; v++) {
    for (let u = 0; u < v; u++) {
      A[e] = v
      B[e] = u
      ends[2 * e] = v
      ends[2 * e + 1] = u
      e++
    }
    edgesUpTo[v + 1] = e
  }
  for (let v = m0; v < N; v++) {
    for (let j = 0; j < m; j++) {
      let u
      do {
        u = uniform ? Math.floor(random() * v) : ends[Math.floor(random() * 2 * e)]
      } while (chosen.subarray(0, j).includes(u))
      chosen[j] = u
    }
    // Endpoints are appended only after all m targets are drawn, so a node's
    // own new links do not raise its chances within the same step.
    for (let j = 0; j < m; j++) {
      A[e] = v
      B[e] = chosen[j]
      ends[2 * e] = v
      ends[2 * e + 1] = chosen[j]
      e++
    }
    edgesUpTo[v + 1] = e
  }
  return { A, B, edgesUpTo, m0 }
}

// Degree of every node from an edge list (the first m edges).
export function degrees(n, A, B, m = A.length) {
  const k = new Int32Array(n)
  for (let e = 0; e < m; e++) {
    k[A[e]]++
    k[B[e]]++
  }
  return k
}

// Complementary cumulative distribution of a sample of non-negative integers:
// one point { k, p } per distinct value k, with p = P(K ≥ k).
export function ccdfInt(sample) {
  let max = 0
  for (let i = 0; i < sample.length; i++) if (sample[i] > max) max = sample[i]
  const count = new Int32Array(max + 1)
  for (let i = 0; i < sample.length; i++) count[sample[i]]++
  const out = []
  let above = sample.length
  for (let k = 0; k <= max; k++) {
    if (count[k]) out.push({ k, p: above / sample.length })
    above -= count[k]
  }
  return out
}

// Maximum-likelihood exponent γ of a discrete power law P(k) ∝ k^(−γ), k ≥ kMin,
// in the approximation of Clauset, Shalizi and Newman (2009):
// γ̂ ≈ 1 + N / Σ ln(k_i / (kMin − ½)), over the N values k_i ≥ kMin.
// The standard error is (γ̂ − 1) / √N.
export function powerLawMLEDiscrete(sample, kMin) {
  let N = 0
  let sum = 0
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] >= kMin) {
      N++
      sum += Math.log(sample[i] / (kMin - 0.5))
    }
  }
  const gamma = N && sum > 0 ? 1 + N / sum : NaN
  return { gamma, error: (gamma - 1) / Math.sqrt(N), N }
}

// Size of the largest connected component as nodes are removed in `order`:
// largest[r] is its size once the first r nodes of `order` are gone
// (r = 0 … n). Computed backwards, adding nodes in reverse order to a
// union–find structure, so the whole curve costs about one pass over the edges.
export function removalCurve(g, order) {
  const { n, offsets, neighbors } = g
  const parent = new Int32Array(n)
  const size = new Int32Array(n)
  const present = new Uint8Array(n)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const largest = new Int32Array(n + 1)
  let best = 0
  for (let r = n - 1; r >= 0; r--) {
    const v = order[r]
    present[v] = 1
    parent[v] = v
    size[v] = 1
    for (let i = offsets[v], end = offsets[v + 1]; i < end; i++) {
      const u = neighbors[i]
      if (!present[u]) continue
      let a = find(u)
      let b = find(v)
      if (a === b) continue
      if (size[a] < size[b]) [a, b] = [b, a]
      parent[b] = a
      size[a] += size[b]
    }
    const s = size[find(v)]
    if (s > best) best = s
    largest[r] = best
  }
  return largest
}
