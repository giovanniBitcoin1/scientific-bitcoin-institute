import { solveU } from '../heavy-tails-done-right/genfun.js'

// Network Lab module 12, "Epidemics on networks": thresholds from the degree
// moments, the SIR outbreak as bond percolation (each link kept with
// probability T), outbreaks from single seeds, the generating functions with
// a transmissibility, SIS and SI/SIR in discrete time, and immunisation.
// Plain functions on networks { n, A, B } (simple, undirected) and on CSR
// graphs, shared by the page and by scripts/lab/check-network-12.mjs.

// ---------------------------------------------------------------- Formulas

// T_c = ⟨k⟩ / (⟨k²⟩ − ⟨k⟩): module 11's critical fraction read the other way.
export const thresholdT = (mean, mean2) => (mean2 > mean ? mean / (mean2 - mean) : Infinity)

// R0 = T (⟨k²⟩ − ⟨k⟩) / ⟨k⟩.
export const r0 = (T, mean, mean2) => (T * (mean2 - mean)) / mean

// The SIS threshold of the heterogeneous mean-field theory, ⟨k⟩ / ⟨k²⟩.
export const thresholdSIS = (mean, mean2) => mean / mean2

// The share to immunise at random, g_c = 1 − T_c / T (0 when T ≤ T_c).
export const immuneShare = (Tc, T) => Math.max(0, 1 - Tc / T)

// Everyone mixing with everyone: the final share solves S = 1 − e^(−R S).
export function finalSizeMixing(R) {
  if (!(R > 1)) return 0
  let lo = 1e-9
  let hi = 1
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (1 - Math.exp(-R * mid) - mid > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// The generating functions of a list of degrees, as a family for module 05's
// solver: G0(x) = Σ p_k x^k, G1(x) = Σ k p_k x^(k−1) / ⟨k⟩.
export function empiricalFamily(k) {
  const count = new Map()
  let s1 = 0
  let s2 = 0
  for (let i = 0; i < k.length; i++) {
    count.set(k[i], (count.get(k[i]) || 0) + 1)
    s1 += k[i]
    s2 += k[i] * k[i]
  }
  const ks = [...count.keys()].sort((a, b) => a - b)
  const p = ks.map((d) => count.get(d) / k.length)
  const mean = s1 / k.length
  const mean2 = s2 / k.length
  return {
    G0: (x) => ks.reduce((s, d, i) => s + p[i] * x ** d, 0),
    G1: (x) => ks.reduce((s, d, i) => (d === 0 ? s : s + d * p[i] * x ** (d - 1)), 0) / mean,
    mean,
    mean2,
    slope: (mean2 - mean) / mean,
  }
}

// With transmissibility T: u solves u = G1(1 − T + T u), the probability that
// the node at the end of a link does not start a large outbreak beyond it;
// w = 1 − T + T u is the probability that a link leads to none; a seed with k
// links starts one with probability 1 − w^k; the final share is 1 − G0(w).
export function outbreakTheory(fam, T) {
  if (!(T * fam.slope > 1)) return { u: 1, w: 1, S: 0 }
  const u = solveU({ G1: (x) => fam.G1(1 - T + T * x), slope: T * fam.slope })
  const w = 1 - T + T * u
  return { u, w, S: Math.max(0, 1 - fam.G0(w)) }
}

export const seedProbability = (w, k) => 1 - w ** k

// ---------------------------------------------------------------- Percolation

// Keep each link with probability T and return the size of the largest
// component. Nodes with immune[v] = 1 are out, with all their links.
export function bondPercolation(net, T, random, immune = null, ws = {}) {
  const n = net.n
  if (!ws.parent || ws.parent.length !== n) {
    ws.parent = new Int32Array(n)
    ws.size = new Int32Array(n)
  }
  const { parent, size } = ws
  let largest = 0
  for (let v = 0; v < n; v++) {
    parent[v] = v
    size[v] = 1
    if (!largest && !(immune && immune[v])) largest = 1
  }
  const { A, B } = net
  for (let e = 0; e < A.length; e++) {
    let a = A[e]
    let b = B[e]
    if (immune && (immune[a] || immune[b])) continue
    if (random() >= T) continue
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    while (parent[b] !== b) {
      parent[b] = parent[parent[b]]
      b = parent[b]
    }
    if (a === b) continue
    if (size[a] < size[b]) {
      const t = a
      a = b
      b = t
    }
    parent[b] = a
    size[a] += size[b]
    if (size[a] > largest) largest = size[a]
  }
  return largest
}

// Mean share of the nodes in the largest component over `runs` percolations.
export function percolationMean(net, T, runs, random, immune = null, ws = {}) {
  let s = 0
  for (let r = 0; r < runs; r++) s += bondPercolation(net, T, random, immune, ws)
  return s / runs / net.n
}

// One SIR outbreak from a seed: every link out of an infected node passes the
// infection with probability T, once. Returns the number of nodes reached.
export function outbreakFrom(g, seed, T, random, ws = {}, immune = null) {
  if (!ws.seen || ws.seen.length !== g.n) {
    ws.seen = new Int32Array(g.n)
    ws.queue = new Int32Array(g.n)
    ws.stamp = 0
  }
  const { seen, queue } = ws
  const stamp = ++ws.stamp
  seen[seed] = stamp
  queue[0] = seed
  let tail = 1
  for (let h = 0; h < tail; h++) {
    const v = queue[h]
    for (let i = g.offsets[v], end = g.offsets[v + 1]; i < end; i++) {
      const u = g.neighbors[i]
      if (seen[u] === stamp || (immune && immune[u])) continue
      if (random() < T) {
        seen[u] = stamp
        queue[tail++] = u
      }
    }
  }
  return tail
}

// ---------------------------------------------------------------- Time steps

// SI or SIR in discrete steps from one seed. At every step each infectious
// node infects each susceptible neighbour with probability beta; a node is
// infectious for the d steps after the one in which it was infected
// (d = Infinity: SI, and then this is module 02's spreadSI, draw for draw).
// Returns the step at which every node was infected (−1: never) and the last
// step. With a finite d the final outbreak is percolation with
// T = 1 − (1 − beta)^d.
export function spread(g, seed, beta, d, random, maxSteps = 100000) {
  const when = new Int32Array(g.n).fill(-1)
  when[seed] = 0
  let active = [seed]
  let t = 0
  while (active.length && t < maxSteps) {
    t++
    const fresh = []
    const still = []
    for (const u of active) {
      let open = false
      for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end; i++) {
        const v = g.neighbors[i]
        if (when[v] >= 0) continue
        if (random() < beta) {
          when[v] = t
          fresh.push(v)
        } else open = true
      }
      if (open && t - when[u] < d) still.push(u)
    }
    active = still.concat(fresh)
  }
  return { when, steps: t }
}

export const transmissibility = (beta, d) => 1 - (1 - beta) ** d

// Cumulative number infected at steps 0 … steps.
export function cumulative(when, steps) {
  const c = new Int32Array(steps + 1)
  for (let v = 0; v < when.length; v++) if (when[v] >= 0 && when[v] <= steps) c[when[v]]++
  for (let t = 1; t <= steps; t++) c[t] += c[t - 1]
  return c
}

// The first step at which the cumulative count reaches `count` (NaN: never).
export function timeTo(cum, count) {
  for (let t = 0; t < cum.length; t++) if (cum[t] >= count) return t
  return NaN
}

// Least-squares slope of log y against log x over the points given.
export function logLogSlope(points) {
  let n = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    if (!(x > 0) || !(y > 0)) continue
    const a = Math.log(x)
    const b = Math.log(y)
    n++
    sx += a
    sy += b
    sxx += a * a
    sxy += a * b
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

// A square lattice of side L with open edges: node x + L y.
export function squareLattice(L) {
  const A = []
  const B = []
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const v = x + L * y
      if (x + 1 < L) {
        A.push(v)
        B.push(v + 1)
      }
      if (y + 1 < L) {
        A.push(v)
        B.push(v + L)
      }
    }
  }
  return { n: L * L, A: Int32Array.from(A), B: Int32Array.from(B) }
}

// The first step at which a node on the edge of the lattice is infected.
export function edgeTime(when, L) {
  let best = Infinity
  for (let i = 0; i < L; i++) {
    for (const v of [i, i + L * (L - 1), L * i, L - 1 + L * i]) if (when[v] >= 0 && when[v] < best) best = when[v]
  }
  return best
}

// ---------------------------------------------------------------- SIS

// SIS in discrete steps, everyone infected at the start. At every step each
// infected node infects each susceptible neighbour with probability beta,
// then each node that was infected at the start of the step recovers with
// probability mu. A generator that yields now and then and returns the mean
// share infected over the last `tail` steps (0 once the infection is extinct:
// there is no way back).
export function* sisIter(g, beta, mu, random, { steps = 400, tail = 150 } = {}) {
  const n = g.n
  const inf = new Uint8Array(n).fill(1)
  const mark = new Int32Array(n)
  let list = Int32Array.from({ length: n }, (_, i) => i)
  let count = n
  const fresh = new Int32Array(n)
  let sum = 0
  for (let t = 1; t <= steps; t++) {
    let f = 0
    for (let j = 0; j < count; j++) {
      const u = list[j]
      for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end; i++) {
        const v = g.neighbors[i]
        if (inf[v] || mark[v] === t) continue
        if (random() < beta) {
          mark[v] = t
          fresh[f++] = v
        }
      }
    }
    let kept = 0
    for (let j = 0; j < count; j++) {
      const u = list[j]
      if (random() < mu) inf[u] = 0
      else list[kept++] = u
    }
    for (let j = 0; j < f; j++) {
      inf[fresh[j]] = 1
      list[kept++] = fresh[j]
    }
    count = kept
    if (t > steps - tail) sum += count / n
    if (count === 0) break
    if (t % 10 === 0) yield t / steps
  }
  return sum / tail
}

export function sisPrevalence(g, beta, mu, random, opts) {
  const it = sisIter(g, beta, mu, random, opts)
  let r = it.next()
  while (!r.done) r = it.next()
  return r.value
}

// ---------------------------------------------------------------- Immunisation

// Acquaintance immunisation: draw a node at random and immunise one of its
// neighbours, drawn at random; repeat until `limit` distinct nodes are immune.
// Returns them in the order in which they were immunised (shorter than
// `limit` if 400 draws per node were not enough).
export function acquaintanceOrder(g, random, limit) {
  const n = g.n
  const done = new Uint8Array(n)
  const order = []
  for (let draws = 0; order.length < limit && draws < 400 * n; draws++) {
    const v = Math.floor(random() * n)
    const deg = g.offsets[v + 1] - g.offsets[v]
    if (!deg) continue
    const u = g.neighbors[g.offsets[v] + Math.floor(random() * deg)]
    if (done[u]) continue
    done[u] = 1
    order.push(u)
  }
  return Int32Array.from(order)
}

// Mean degree of the first q nodes of an order, for every q: prefix[q] / q.
export function degreePrefix(order, k) {
  const out = new Float64Array(order.length + 1)
  for (let i = 0; i < order.length; i++) out[i + 1] = out[i] + k[order[i]]
  return out
}
