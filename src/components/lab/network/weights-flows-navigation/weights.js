import { mulberry32, randNormal } from '../../rng.js'
import { barabasiAlbert } from '../../graphUtils.js'

// Network Lab module 10, "Weights, flows and navigation": weighted networks as
// plain functions, shared by the page and by scripts/lab/check-network-10.mjs.
// A network is { n, A, B } (link e joins A[e] and B[e]) with a weight w[e] per
// link; `csr` adds, for every node, its neighbours and the links that lead to
// them.

export const seedOf = (seed, k) => (Math.imul(seed ^ 0x9e3779b9, 2654435761) + Math.imul(k + 1, 40503)) >>> 0

export function drain(job) {
  for (const _ of job.iter);
  return job.snapshot()
}

export function csr(n, A, B) {
  const m = A.length
  const off = new Int32Array(n + 1)
  for (let e = 0; e < m; e++) {
    off[A[e] + 1]++
    off[B[e] + 1]++
  }
  for (let v = 0; v < n; v++) off[v + 1] += off[v]
  const fill = off.slice(0, n)
  const nbr = new Int32Array(2 * m)
  const eid = new Int32Array(2 * m)
  for (let e = 0; e < m; e++) {
    nbr[fill[A[e]]] = B[e]
    eid[fill[A[e]]++] = e
    nbr[fill[B[e]]] = A[e]
    eid[fill[B[e]]++] = e
  }
  return { n, m, off, nbr, eid }
}

// ---------------------------------------------------------------- strength and disparity

// Strength s = Σ w, degree k and disparity Y = Σ (w/s)² of one node, from the
// list of its weights; alpha[j] = (1 − w_j/s)^(k − 1) is the disparity filter's
// p-value of link j (Serrano, Boguñá and Vespignani 2009): the probability
// that, with s cut at k − 1 points chosen uniformly at random, a given piece
// is at least as large as this one.
export function nodeReport(weights) {
  const k = weights.length
  let s = 0
  for (const w of weights) s += w
  let Y = 0
  for (const w of weights) Y += (w / s) ** 2
  return { s, k, Y, even: 1 / k, alpha: weights.map((w) => filterAlpha(w / s, k)) }
}

export const filterAlpha = (p, k) => Math.pow(1 - p, k - 1)

export function strengths(g, w) {
  const s = new Float64Array(g.n)
  const k = new Int32Array(g.n)
  for (let e = 0; e < g.A.length; e++) {
    s[g.A[e]] += w[e]
    s[g.B[e]] += w[e]
    k[g.A[e]]++
    k[g.B[e]]++
  }
  return { s, k }
}

export function disparities(g, w, s) {
  const Y = new Float64Array(g.n)
  for (let e = 0; e < g.A.length; e++) {
    Y[g.A[e]] += (w[e] / s[g.A[e]]) ** 2
    Y[g.B[e]] += (w[e] / s[g.B[e]]) ** 2
  }
  return Y
}

// Degree classes: every degree up to 10 on its own, then a tenth of a decade.
export const degreeClass = (k) => (k <= 10 ? k : 10 + Math.floor(10 * Math.log10(k / 10) + 1e-9) + 1)

// Mean of `value` over the nodes of each degree class: [{ k (mean degree of the class), value, count }].
export function byDegree(k, value) {
  const acc = new Map()
  for (let i = 0; i < k.length; i++) {
    if (k[i] < 1) continue
    const c = degreeClass(k[i])
    let a = acc.get(c)
    if (!a) acc.set(c, (a = { k: 0, value: 0, count: 0 }))
    a.k += k[i]
    a.value += value[i]
    a.count++
  }
  return [...acc.entries()].sort((x, y) => x[0] - y[0]).map(([, a]) => ({ k: a.k / a.count, value: a.value / a.count, count: a.count }))
}

// Least squares on logarithms: y = c x^slope.
export function powerFit(points) {
  const n = points.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    const lx = Math.log(x)
    const ly = Math.log(y)
    sx += lx
    sy += ly
    sxx += lx * lx
    sxy += lx * ly
  }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { slope, c: Math.exp((sy - slope * sx) / n) }
}

// β of s ∝ k^β, fitted on the class means.
export function strengthExponent(k, s) {
  const rows = byDegree(k, s)
  return { rows, ...powerFit(rows.map((r) => [r.k, r.value])) }
}

// ---------------------------------------------------------------- the weighted network of Panel A

export const NET_M = 3

// Preferential attachment (m links per new node), then w_ij = (k_i k_j)^θ
// times a lognormal factor exp(σ z); with `shuffle` the same weights are dealt
// again to the links at random.
export function weightedNetwork({ N, theta, sigma, shuffle = false, seed, m = NET_M }) {
  const ba = barabasiAlbert(N, m, seedOf(seed, 1))
  const g = { n: N, A: ba.A, B: ba.B }
  const L = g.A.length
  const k = new Int32Array(N)
  for (let e = 0; e < L; e++) {
    k[g.A[e]]++
    k[g.B[e]]++
  }
  const noise = mulberry32(seedOf(seed, 2))
  const w = new Float64Array(L)
  for (let e = 0; e < L; e++) w[e] = Math.pow(k[g.A[e]] * k[g.B[e]], theta) * Math.exp(sigma * randNormal(noise))
  if (shuffle) {
    const random = mulberry32(seedOf(seed, 3))
    for (let i = L - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      const t = w[i]
      w[i] = w[j]
      w[j] = t
    }
  }
  return { g, w, k }
}

// ---------------------------------------------------------------- disparity filter

// A link is kept when its p-value is below `alpha` for at least one of its two
// ends. A node of degree 1 never makes its only link significant (its p-value
// is 1), so that link is judged from the other end.
export function backbone(g, w, alpha, sk = strengths(g, w)) {
  const { s, k } = sk
  const L = g.A.length
  const keep = new Uint8Array(L)
  const parent = Int32Array.from({ length: g.n }, (_, i) => i)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const touched = new Uint8Array(g.n)
  let links = 0
  let weight = 0
  let total = 0
  for (let e = 0; e < L; e++) {
    const a = g.A[e]
    const b = g.B[e]
    total += w[e]
    if (filterAlpha(w[e] / s[a], k[a]) < alpha || filterAlpha(w[e] / s[b], k[b]) < alpha) {
      keep[e] = 1
      links++
      weight += w[e]
      touched[a] = 1
      touched[b] = 1
      parent[find(a)] = find(b)
    }
  }
  let nodes = 0
  let largest = 0
  const size = new Int32Array(g.n)
  for (let v = 0; v < g.n; v++)
    if (touched[v]) {
      nodes++
      largest = Math.max(largest, ++size[find(v)])
    }
  return { keep, links, linkShare: links / L, weightShare: weight / total, nodes, nodeShare: nodes / g.n, largest, largestShare: largest / g.n }
}

// ---------------------------------------------------------------- shortest paths

// Binary min-heap of (key, value) pairs; stale entries are skipped by the caller.
export class MinHeap {
  constructor(capacity = 64) {
    this.keys = new Float64Array(capacity)
    this.vals = new Int32Array(capacity)
    this.size = 0
    this.key = 0
  }

  push(key, val) {
    if (this.size === this.keys.length) {
      const keys = new Float64Array(2 * this.size)
      keys.set(this.keys)
      this.keys = keys
      const vals = new Int32Array(2 * this.size)
      vals.set(this.vals)
      this.vals = vals
    }
    const { keys, vals } = this
    let i = this.size++
    while (i > 0) {
      const p = (i - 1) >> 1
      if (keys[p] <= key) break
      keys[i] = keys[p]
      vals[i] = vals[p]
      i = p
    }
    keys[i] = key
    vals[i] = val
  }

  // Removes the smallest pair: returns its value and leaves its key in `this.key`.
  pop() {
    const { keys, vals } = this
    const top = vals[0]
    this.key = keys[0]
    const n = --this.size
    if (n > 0) {
      const key = keys[n]
      const val = vals[n]
      let i = 0
      for (;;) {
        let c = 2 * i + 1
        if (c >= n) break
        if (c + 1 < n && keys[c + 1] < keys[c]) c++
        if (keys[c] >= key) break
        keys[i] = keys[c]
        vals[i] = vals[c]
        i = c
      }
      keys[i] = key
      vals[i] = val
    }
    return top
  }
}

// Dijkstra from `src` on the CSR `c` with a positive cost per link. Returns
// dist (Infinity when unreachable), prev (the node before, −1 at the source)
// and `order`, the nodes in the order they were settled.
export function dijkstra(c, cost, src, ws = {}) {
  const n = c.n
  const dist = ws.dist || new Float64Array(n)
  const prev = ws.prev || new Int32Array(n)
  const order = ws.order || new Int32Array(n)
  const done = ws.done || new Uint8Array(n)
  const heap = ws.heap || new MinHeap(256)
  dist.fill(Infinity)
  prev.fill(-1)
  done.fill(0)
  heap.size = 0
  dist[src] = 0
  heap.push(0, src)
  let count = 0
  while (heap.size) {
    const u = heap.pop()
    if (done[u]) continue
    done[u] = 1
    order[count++] = u
    const du = dist[u]
    for (let i = c.off[u], end = c.off[u + 1]; i < end; i++) {
      const v = c.nbr[i]
      const d = du + cost[c.eid[i]]
      if (d < dist[v]) {
        dist[v] = d
        prev[v] = u
        heap.push(d, v)
      }
    }
  }
  return { dist, prev, order, count }
}

export function pathTo(prev, t) {
  const path = []
  for (let v = t; v >= 0; v = prev[v]) path.push(v)
  return path.reverse()
}

// All-pairs costs by Floyd–Warshall, for the self-check.
export function floydWarshall(g, cost) {
  const n = g.n
  const D = Array.from({ length: n }, (_, i) => {
    const row = new Float64Array(n).fill(Infinity)
    row[i] = 0
    return row
  })
  for (let e = 0; e < g.A.length; e++) {
    const a = g.A[e]
    const b = g.B[e]
    if (cost[e] < D[a][b]) D[a][b] = D[b][a] = cost[e]
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) D[i][j] = D[i][k] + D[k][j]
  return D
}

const TIE = 1e-12
const tight = (du, c, dv) => Math.abs(du + c - dv) <= TIE * dv

// One source of Brandes' betweenness with costs: adds to `bc` the dependency
// of `src` on every other node. `ws` keeps the work arrays between calls; on
// return ws.dist holds the costs from `src` and ws.hops, for every node, the
// fewest links among its cheapest routes.
export function brandesFrom(c, cost, src, bc, ws) {
  const n = c.n
  if (!ws.sigma) {
    ws.dist = new Float64Array(n)
    ws.prev = new Int32Array(n)
    ws.order = new Int32Array(n)
    ws.done = new Uint8Array(n)
    ws.heap = new MinHeap(1024)
    ws.sigma = new Float64Array(n)
    ws.delta = new Float64Array(n)
    ws.hops = new Int32Array(n)
  }
  const { dist, order, count } = dijkstra(c, cost, src, ws)
  const { sigma, delta, hops } = ws
  sigma.fill(0)
  delta.fill(0)
  hops.fill(-1)
  sigma[src] = 1
  hops[src] = 0
  for (let q = 1; q < count; q++) {
    const v = order[q]
    const dv = dist[v]
    let sg = 0
    let h = Infinity
    for (let i = c.off[v], end = c.off[v + 1]; i < end; i++) {
      const u = c.nbr[i]
      if (dist[u] < dv && tight(dist[u], cost[c.eid[i]], dv)) {
        sg += sigma[u]
        if (hops[u] + 1 < h) h = hops[u] + 1
      }
    }
    sigma[v] = sg
    hops[v] = h
  }
  for (let q = count - 1; q > 0; q--) {
    const v = order[q]
    const dv = dist[v]
    const f = (1 + delta[v]) / sigma[v]
    for (let i = c.off[v], end = c.off[v + 1]; i < end; i++) {
      const u = c.nbr[i]
      if (dist[u] < dv && tight(dist[u], cost[c.eid[i]], dv)) delta[u] += sigma[u] * f
    }
    bc[v] += delta[v]
  }
  return ws
}

// Betweenness of every node, each unordered pair counted once.
export function betweenness(g, cost) {
  const c = csr(g.n, g.A, g.B)
  const bc = new Float64Array(g.n)
  const ws = {}
  for (let s = 0; s < g.n; s++) brandesFrom(c, cost, s, bc, ws)
  return bc.map((x) => x / 2)
}

// Average ranks (ties share the mean of their places) and Spearman's ρ.
export function ranks(x) {
  const idx = Array.from(x, (_, i) => i).sort((a, b) => x[a] - x[b])
  const r = new Float64Array(x.length)
  for (let i = 0; i < idx.length; ) {
    let j = i
    while (j + 1 < idx.length && x[idx[j + 1]] === x[idx[i]]) j++
    for (let q = i; q <= j; q++) r[idx[q]] = (i + j) / 2 + 1
    i = j + 1
  }
  return r
}

export function spearman(x, y) {
  const a = ranks(x)
  const b = ranks(y)
  const n = a.length
  let ma = 0
  let mb = 0
  for (let i = 0; i < n; i++) {
    ma += a[i]
    mb += b[i]
  }
  ma /= n
  mb /= n
  let sab = 0
  let saa = 0
  let sbb = 0
  for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb)
    saa += (a[i] - ma) ** 2
    sbb += (b[i] - mb) ** 2
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : NaN
}
