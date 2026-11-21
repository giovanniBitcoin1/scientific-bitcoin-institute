import { mulberry32 } from '../../rng.js'
import { Fenwick } from '../growth-mechanisms/growth.js'

// Network Lab module 07, "Fitness and competition": the growing networks of
// the module, as plain functions shared by the panels, the live figures and
// scripts/lab/check-network-07.mjs. As in module 06 (whose Fenwick sampler is
// reused), node i is born at step i (0-based): the network has i + 1 nodes
// once node i is in. A network is { n, A, B, deg, ... } with the links in the
// order they were made, A[e] the newer end and B[e] the older one.

export const seedOf = (seed, i) => (seed + Math.imul(i + 1, 0x9e3779b1)) >>> 0

// ---------------------------------------------------------------- Fitness distributions

// A distribution of fitness is { kind, ... }:
//   equal                    η = 1 for every node
//   uniform                  uniform on [0, 1]
//   exponential { scale }    ρ ∝ e^(−η/scale), truncated to [0, 1]
//   two { share, a }         η = 1 for a share of the nodes, η = a for the rest
//   beta { zeta }            ρ = (1 + ζ)(1 − η)^ζ on [0, 1]
//   oneAbove { b }           uniform on [0, b] (Panel B adds one node of fitness 1)
export const DISTS = ['equal', 'uniform', 'exponential', 'two']

export function drawFitness(dist, random) {
  switch (dist.kind) {
    case 'equal':
      return 1
    case 'uniform':
      return random()
    case 'exponential': {
      const s = dist.scale
      return -s * Math.log(1 - random() * (1 - Math.exp(-1 / s)))
    }
    case 'two':
      return random() < dist.share ? 1 : dist.a
    case 'beta':
      return 1 - random() ** (1 / (1 + dist.zeta))
    case 'oneAbove':
      return dist.b * random()
    default:
      throw new Error(`unknown fitness ${dist.kind}`)
  }
}

// Simpson's rule for ∫ f on [a, b], n even.
function simpson(f, a, b, n = 4000) {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
  return (s * h) / 3
}

// ∫ ρ(η) η / (C − η) dη for C above the largest fitness. For a continuous ρ on
// [0, top] the substitution x = ln(C − η) turns the integrand into ρ(η) η,
// smooth even when C is close to top.
export function fitnessIntegral(dist, C) {
  switch (dist.kind) {
    case 'equal':
      return 1 / (C - 1)
    case 'uniform':
      return -1 + C * Math.log(C / (C - 1))
    case 'oneAbove': {
      // (1/b) ∫_0^b η/(C − η) dη
      const b = dist.b
      return (-b + C * Math.log(C / (C - b))) / b
    }
    case 'two':
      return dist.share / (C - 1) + ((1 - dist.share) * dist.a) / (C - dist.a)
    case 'exponential': {
      const s = dist.scale
      const norm = s * (1 - Math.exp(-1 / s))
      const rho = (eta) => Math.exp(-eta / s) / norm
      return simpson((x) => {
        const eta = C - Math.exp(x)
        return rho(eta) * eta
      }, Math.log(C - 1), Math.log(C))
    }
    case 'beta': {
      const z = dist.zeta
      return simpson((x) => {
        const eta = C - Math.exp(x)
        return (1 + z) * Math.max(0, 1 - eta) ** z * eta
      }, Math.log(C - 1), Math.log(C), 20000)
    }
    default:
      throw new Error(`unknown fitness ${dist.kind}`)
  }
}

// The largest fitness, and the integral at C equal to it (Infinity when it
// diverges): below 1 the equation for C has no solution and the links condense.
export function fitnessTop(dist) {
  switch (dist.kind) {
    case 'oneAbove':
      return { top: 1, limit: -1 - Math.log(1 - Math.min(dist.b, 1)) / dist.b }
    case 'beta':
      return { top: 1, limit: 1 / dist.zeta }
    default:
      // equal, two values: an atom at 1; uniform, exponential: ρ(1) > 0. All diverge.
      return { top: 1, limit: Infinity }
  }
}

// C from ∫ ρ(η) η/(C − η) dη = 1, by bisection on (1, 2] (the integral falls
// as C grows, and it is at most 1/(C − 1) since η ≤ 1). Closed forms where
// they exist: equal fitness gives 2.
export function solveC(dist) {
  if (dist.kind === 'equal') return { C: 2, condensed: false, limit: Infinity }
  const { limit } = fitnessTop(dist)
  if (limit <= 1) return { C: 1, condensed: true, limit }
  let lo = 1 + 1e-12
  let hi = 2
  for (let it = 0; it < 200 && hi - lo > 1e-13; it++) {
    const mid = (lo + hi) / 2
    if (fitnessIntegral(dist, mid) > 1) lo = mid
    else hi = mid
  }
  return { C: (lo + hi) / 2, condensed: false, limit }
}

// I(b) of Panel B: one node of fitness 1, the others uniform on [0, b].
export const oneAboveI = (b) => -1 - Math.log(1 - b) / b
// The b at which I(b) = 1, by bisection.
export function oneAboveThreshold() {
  let lo = 0.5
  let hi = 0.99
  for (let it = 0; it < 100; it++) {
    const mid = (lo + hi) / 2
    if (oneAboveI(mid) < 1) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
export const B_STAR = oneAboveThreshold()
// The share of all links that the fittest node keeps in the limit.
export const condensateShare = (b) => (b < B_STAR ? 1 - oneAboveI(b) : 0)

// ---------------------------------------------------------------- Growth with fitness

// Log-spaced network sizes from `from` to N, at most `count` of them.
export function logSizes(N, count = 60, from = 10) {
  const out = new Set()
  for (let j = 0; j <= count; j++) out.add(Math.round(from * (N / from) ** (j / count)))
  return [...out].filter((s) => s >= from && s <= N).sort((a, b) => a - b)
}

// Growth from a clique of m + 1 nodes; node t links to m distinct existing
// nodes, each chosen with probability ∝ η_i k_i (k_i its current degree). The
// fitnesses are drawn first, all of them, so that they do not depend on the
// growth; `eta` may also be given. A chosen node's weight is set to 0 until the
// m targets are drawn.
//
//   track    node indices whose degree is recorded at the sizes `sizes`
//   half     record every node's degree at nine sizes from N/2 to N
//            (N/2 × 2^(j/8)), for the slope of ln k against ln t
export function growFitness({ N, m = 2, dist = { kind: 'uniform' }, seed = 1, eta = null, track = null, sizes = null, half = false }) {
  const random = mulberry32(seed)
  if (!eta) {
    eta = new Float64Array(N)
    for (let i = 0; i < N; i++) eta[i] = drawFitness(dist, random)
  }
  const deg = new Int32Array(N)
  const L = (m * (m + 1)) / 2 + (N - m - 1) * m
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  let e = 0
  const tree = new Fenwick(N)
  for (let a = 0; a <= m; a++)
    for (let b = 0; b < a; b++) {
      src[e] = a
      dst[e] = b
      e++
      deg[a]++
      deg[b]++
    }
  for (let v = 0; v <= m; v++) tree.set(v, eta[v] * deg[v])
  let leader = 0
  for (let v = 1; v <= m; v++) if (deg[v] > deg[leader]) leader = v
  let changes = 0
  const history = track ? track.map(() => new Float64Array(sizes.length)) : null
  let nextSize = 0
  const record = (size) => {
    while (history && nextSize < sizes.length && sizes[nextSize] <= size) {
      if (sizes[nextSize] === size) track.forEach((v, j) => (history[j][nextSize] = v < size ? deg[v] : NaN))
      else track.forEach((_, j) => (history[j][nextSize] = NaN))
      nextSize++
    }
  }
  const halfSizes = half ? Array.from({ length: 9 }, (_, j) => Math.round((N / 2) * 2 ** (j / 8))) : null
  const halfDeg = half ? halfSizes.map(() => new Int32Array(Math.floor(N / 2))) : null
  let nextHalf = 0
  const recordHalf = (size) => {
    while (half && nextHalf < 9 && halfSizes[nextHalf] === size) {
      halfDeg[nextHalf].set(deg.subarray(0, Math.floor(N / 2)))
      nextHalf++
    }
  }
  record(m + 1)
  const chosen = new Int32Array(m)
  for (let t = m + 1; t < N; t++) {
    for (let j = 0; j < m; j++) {
      const u = tree.draw(random)
      chosen[j] = u
      tree.set(u, 0)
    }
    for (let j = 0; j < m; j++) {
      const u = chosen[j]
      src[e] = t
      dst[e] = u
      e++
      deg[u]++
      tree.set(u, eta[u] * deg[u])
      if (deg[u] > deg[leader]) {
        if (u !== leader) changes++
        leader = u
      }
    }
    deg[t] = m
    tree.set(t, eta[t] * m)
    record(t + 1)
    recordHalf(t + 1)
  }
  // the fittest node (the older one on a tie)
  let fittest = 0
  for (let v = 1; v < N; v++) if (eta[v] > eta[fittest]) fittest = v
  // the final leader: largest degree, the older one on a tie
  let top = 0
  for (let v = 1; v < N; v++) if (deg[v] > deg[top]) top = v
  let fitter = 0
  for (let v = 0; v < N; v++) if (eta[v] > eta[top]) fitter++
  return { n: N, m, A: src, B: dst, deg, eta, leader: top, changes, fittest, fitter, history, halfSizes, halfDeg }
}

// The slope of ln k against ln t over the second half of the growth, for the
// nodes born in the first half whose degree had at least doubled (k ≥ 2m) by
// the middle, or for the nodes born before `bornBefore` if it is given.
export function fitnessSlopes(net, C, { bornBefore = null } = {}) {
  const { halfSizes, halfDeg, eta, m } = net
  const xs = halfSizes.map(Math.log)
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0)
  const out = []
  const last = bornBefore ?? halfDeg[0].length
  for (let v = 0; v < last; v++) {
    if (bornBefore == null && halfDeg[0][v] < 2 * m) continue
    let my = 0
    for (let j = 0; j < 9; j++) my += Math.log(halfDeg[j][v])
    my /= 9
    let sxy = 0
    for (let j = 0; j < 9; j++) sxy += (xs[j] - mx) * (Math.log(halfDeg[j][v]) - my)
    out.push({ v, slope: sxy / sxx, theory: eta[v] / C })
  }
  return out
}

export function correlation(xs, ys) {
  const n = xs.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  return sxy / Math.sqrt(sxx * syy)
}

// ---------------------------------------------------------------- One node above the rest

// m = 1. Node 0 has fitness 1, every other node is uniform on [0, b]; the
// clique is nodes 0 and 1. Returns the share of all links held by node 0 at
// the sizes `sizes`.
export function growOneAbove({ N, b = 0.5, seed = 1, sizes = null }) {
  const random = mulberry32(seed)
  const eta = new Float64Array(N)
  eta[0] = 1
  for (let i = 1; i < N; i++) eta[i] = b * random()
  const net = growFitness({ N, m: 1, eta, seed: seedOf(seed, 7), track: [0], sizes: sizes || [N] })
  // with m = 1 the network has size − 1 links
  const share = (sizes || [N]).map((s, j) => net.history[0][j] / (s - 1))
  return { ...net, sizes: sizes || [N], share }
}

// Particles on energy levels: ε = −ln η, one particle per link on the level
// of the older end (the node it points to). Histogram of the particles of the
// nodes other than node 0 in bins of ε, and node 0's own count.
export function energyLevels(net, { bins = 12, max = 4.8 } = {}) {
  const counts = new Float64Array(bins)
  let zero = 0
  for (let e = 0; e < net.B.length; e++) {
    const v = net.B[e]
    if (v === 0) {
      zero++
      continue
    }
    const eps = -Math.log(Math.max(net.eta[v], 1e-12))
    counts[Math.min(bins - 1, Math.floor((eps / max) * bins))]++
  }
  return { zero, counts, links: net.B.length, bins, max }
}

// ---------------------------------------------------------------- Ageing

// m = 1; node t links to one existing node i with probability ∝ k_i τ^(−ν),
// τ = t − i its age. Every weight changes at every step, so the weights are
// recomputed exactly at each step from a table of τ^(−ν): O(N²) in all, as a
// generator that yields every `chunk` steps (the panels run it as a job).
export function* ageingSteps({ N, nu = 0, seed = 1, chunk = 200 }, out) {
  const random = mulberry32(seed)
  const age = new Float64Array(N + 1)
  for (let a = 1; a <= N; a++) age[a] = a ** -nu
  const deg = new Int32Array(N)
  const src = new Int32Array(N - 1)
  const dst = new Int32Array(N - 1)
  src[0] = 1
  dst[0] = 0
  deg[0] = 1
  deg[1] = 1
  for (let t = 2; t < N; t++) {
    let total = 0
    for (let i = 0; i < t; i++) total += deg[i] * age[t - i]
    let u = random() * total
    let target = t - 1
    for (let i = 0; i < t; i++) {
      u -= deg[i] * age[t - i]
      if (u < 0) {
        target = i
        break
      }
    }
    src[t - 1] = t
    dst[t - 1] = target
    deg[target]++
    deg[t] = 1
    if (t % chunk === 0) yield t / N
  }
  Object.assign(out, { n: N, m: 1, A: src, B: dst, deg, nu })
}

export function growAgeing(params) {
  const out = {}
  for (const _ of ageingSteps(params, out));
  return out
}

// ---------------------------------------------------------------- Accelerating growth

// Node n (n ≥ 2) brings round(m₀ n^θ + r) links, r the remainder carried from
// the newcomers before it, so that the total follows Σ m₀ n^θ; targets are
// distinct and chosen with probability ∝ k (linear preferential attachment).
// Starts from nodes 0 and 1 linked.
export function accelCounts(N, theta, m0 = 1) {
  const c = new Int32Array(N)
  let carry = 0
  for (let n = 2; n < N; n++) {
    const x = m0 * n ** theta + carry
    const k = Math.min(n, Math.max(1, Math.round(x)))
    c[n] = k
    carry = x - k
  }
  return c
}

export function growAccelerating({ N, theta = 0.3, m0 = 1, seed = 1 }) {
  const random = mulberry32(seed)
  const c = accelCounts(N, theta, m0)
  let L = 1
  for (let n = 2; n < N; n++) L += c[n]
  const src = new Int32Array(L)
  const dst = new Int32Array(L)
  const linksAt = new Float64Array(N + 1) // links once the network has s nodes
  const deg = new Int32Array(N)
  const tree = new Fenwick(N)
  src[0] = 1
  dst[0] = 0
  deg[0] = 1
  deg[1] = 1
  tree.set(0, 1)
  tree.set(1, 1)
  let e = 1
  linksAt[2] = 1
  let chosen = new Int32Array(16)
  for (let n = 2; n < N; n++) {
    const k = c[n]
    if (chosen.length < k) chosen = new Int32Array(2 * k)
    for (let j = 0; j < k; j++) {
      const u = tree.draw(random)
      chosen[j] = u
      tree.set(u, 0)
    }
    for (let j = 0; j < k; j++) {
      const u = chosen[j]
      src[e] = n
      dst[e] = u
      e++
      deg[u]++
      tree.set(u, deg[u])
    }
    deg[n] = k
    tree.set(n, k)
    linksAt[n + 1] = e
  }
  return { n: N, A: src, B: dst, deg, linksAt, theta }
}

// Adjacency in the order the links were made: for each node, first the older
// nodes it linked to at birth, then the newer nodes that linked to it, in order
// of birth. So the network at size s is read by stopping at the first
// neighbour ≥ s.
export function adjacency(net) {
  const n = net.n
  const start = new Int32Array(n + 1)
  for (let e = 0; e < net.A.length; e++) {
    start[net.A[e] + 1]++
    start[net.B[e] + 1]++
  }
  for (let v = 0; v < n; v++) start[v + 1] += start[v]
  const fill = start.slice(0, n)
  const nb = new Int32Array(start[n])
  // links are in order of the newer end, so each list gets its older
  // neighbours (at the node's birth) before its newer ones, in birth order
  for (let e = 0; e < net.A.length; e++) {
    const a = net.A[e]
    const b = net.B[e]
    nb[fill[a]++] = b
    nb[fill[b]++] = a
  }
  return { start, nb }
}

// The average distance in the network at size s, from `sources` BFS roots
// drawn at random among its nodes (every node is reachable: each newcomer
// links to older nodes).
export function averageDistance(adj, s, sources, random, scratch) {
  const { start, nb } = adj
  const dist = scratch && scratch.length >= s ? scratch : new Int32Array(s)
  const queue = new Int32Array(s)
  let sum = 0
  let pairs = 0
  for (let r = 0; r < sources; r++) {
    dist.fill(-1, 0, s)
    const root = Math.floor(random() * s)
    let head = 0
    let tail = 0
    queue[tail++] = root
    dist[root] = 0
    while (head < tail) {
      const v = queue[head++]
      const dv = dist[v] + 1
      for (let p = start[v]; p < start[v + 1]; p++) {
        const w = nb[p]
        if (w >= s) {
          // the newer neighbours come in birth order: the rest are newer still
          if (w > v) break
          continue
        }
        if (dist[w] < 0) {
          dist[w] = dv
          sum += dv
          pairs++
          queue[tail++] = w
        }
      }
    }
  }
  return sum / pairs
}

// Least-squares slope of ln y against ln x.
export function logSlope(points) {
  const xs = points.map((p) => Math.log(p[0]))
  const ys = points.map((p) => Math.log(p[1]))
  const n = xs.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
  }
  return sxy / sxx
}

export const accelGamma = (theta) => 3 + (2 * theta) / (1 - theta)

// ---------------------------------------------------------------- The race (F1)

// Mean field: k_i(t) = m (t/t_i)^(η_i/C). The latecomer (t₂, η₂) catches the
// incumbent (t₁, η₁) when η₁ (ln t − ln t₁) = η₂ (ln t − ln t₂):
// ln t* = (η₂ ln t₂ − η₁ ln t₁)/(η₂ − η₁). Never when η₂ ≤ η₁.
export function overtakeLn(t1, eta1, t2, eta2) {
  if (eta2 <= eta1) return null
  return (eta2 * Math.log(t2) - eta1 * Math.log(t1)) / (eta2 - eta1)
}
