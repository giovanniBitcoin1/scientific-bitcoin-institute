import { mulberry32 } from '../../rng.js'
import { seedOf, csr, weightedNetwork, strengths, disparities, byDegree, strengthExponent, backbone, brandesFrom, spearman, powerFit } from './weights.js'
import { paymentNetwork, analysePair, pay, amountOf, maxFlow, widestRoute, PAY_M } from './flow.js'
import { buildLattice, randomPairs, routeStats, greedyRoute, torusDistance } from './kleinberg.js'

// Network Lab module 10: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-10.mjs.

export { drain } from './weights.js'

// ---------------------------------------------------------------- Panel A

export const A_SEED = 10001
export const A_DEFAULT = { N: 2000, theta: 0.5, sigma: 0.5, shuffle: false, alpha: 0.05 }
export const A_SOURCES = 200

const netSeedA = ({ N, theta, sigma }) => seedOf(A_SEED, N + 100000 * Math.round(theta * 10) + 10000000 * Math.round(sigma * 10))

// The network, strength against degree with its fitted β, disparity against degree.
export function panelA({ N, theta, sigma, shuffle }) {
  const net = weightedNetwork({ N, theta, sigma, shuffle, seed: netSeedA({ N, theta, sigma }) })
  const sk = strengths(net.g, net.w)
  const fit = strengthExponent(sk.k, sk.s)
  const Y = disparities(net.g, net.w, sk.s)
  return { ...net, sk, beta: fit.slope, fitC: fit.c, sRows: fit.rows, yRows: byDegree(sk.k, Y), links: net.g.A.length }
}

export const backboneA = (a, alpha) => backbone(a.g, a.w, alpha, a.sk)

// Routes and betweenness from 200 random sources, each with one random
// target: the route with the fewest links against the cheapest one when a link
// of weight w costs 1/w, and betweenness with and without weights, estimated
// from those same sources.
export function pathsJob(a, sources = A_SOURCES) {
  const { g, w } = a
  const n = g.n
  const c = csr(n, g.A, g.B)
  const unit = new Float64Array(w.length).fill(1)
  const cost = Float64Array.from(w, (x) => 1 / x)
  const random = mulberry32(seedOf(A_SEED, 77 + n))
  const order = Int32Array.from({ length: n }, (_, i) => i)
  const count = Math.min(sources, n)
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (n - i))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  const targets = Array.from({ length: count }, (_, i) => {
    let t
    do t = Math.floor(random() * n)
    while (t === order[i])
    return t
  })
  const bcHops = new Float64Array(n)
  const bcCost = new Float64Array(n)
  const wsH = {}
  const wsC = {}
  let done = 0
  let differ = 0
  let hopsShort = 0
  let hopsCheap = 0
  let rho = NaN
  function* iter() {
    for (let i = 0; i < count; i++) {
      brandesFrom(c, unit, order[i], bcHops, wsH)
      brandesFrom(c, cost, order[i], bcCost, wsC)
      const h = wsH.hops[targets[i]]
      const hc = wsC.hops[targets[i]]
      if (hc > h) differ++
      hopsShort += h
      hopsCheap += hc
      done++
      yield done / count
    }
    rho = spearman(bcHops, bcCost)
  }
  return {
    iter: iter(),
    snapshot: () => ({ pairs: done, differ: done ? differ / done : NaN, hopsShort: hopsShort / done, hopsCheap: hopsCheap / done, rho, done: done === count && Number.isFinite(rho) }),
  }
}

// ---------------------------------------------------------------- Panel B

export const B_SEED = 10002
export const B_DEFAULT = { N: 1000, pick: 'random', pair: 1, fraction: 0.2 }
export const B_PAIRS = 500
export const B_FRACTIONS = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

export const payNet = (N) => paymentNetwork({ N, seed: seedOf(B_SEED, N) })

// A sender and a receiver: two random nodes, the two nodes with most
// channels, or two random nodes among those with the fewest (three).
export function pickPair(pn, pick, j = 1) {
  if (pick === 'hubs') {
    const top = Array.from({ length: pn.n }, (_, i) => i).sort((a, b) => pn.degree[b] - pn.degree[a] || a - b)
    return [top[0], top[1]]
  }
  const random = mulberry32(seedOf(B_SEED, 5000 + j + (pick === 'small' ? 100000 : 0)))
  const pool = pick === 'small' ? Array.from({ length: pn.n }, (_, i) => i).filter((i) => pn.degree[i] === PAY_M) : null
  const draw = () => (pool ? pool[Math.floor(random() * pool.length)] : Math.floor(random() * pn.n))
  for (;;) {
    const s = draw()
    const t = draw()
    if (s !== t && pn.out[s] > 0) return [s, t]
  }
}

// What the panel shows about one pair: the most a single route can carry (the
// widest route by the balances), the maximum flow and the minimum cut.
export function pairReadout(pn, s, t) {
  const mf = maxFlow(pn.net, s, t)
  const wide = widestRoute(pn.net, pn.net.cap, s, t)
  let incoming = 0
  for (let a = pn.net.first[t]; a >= 0; a = pn.net.next[a]) incoming += pn.net.cap[a ^ 1]
  return {
    s,
    t,
    degS: pn.degree[s],
    degT: pn.degree[t],
    out: pn.out[s],
    incoming,
    widest: wide ? wide.width : 0,
    widestHops: wide ? wide.arcs.length : 0,
    maxFlow: mf.value,
    cutSize: mf.cut.length,
    cutAtSender: mf.cut.every((a) => pn.net.from[a] === s),
    cutAtReceiver: mf.cut.every((a) => pn.net.to[a] === t),
  }
}

// 500 random pairs, analysed once; a payment of any amount is then read off.
export function pairsJob(pn, count = B_PAIRS) {
  const random = mulberry32(seedOf(B_SEED, 9000 + pn.n))
  const pairs = []
  function* iter() {
    while (pairs.length < count) {
      const s = Math.floor(random() * pn.n)
      const t = Math.floor(random() * pn.n)
      if (s === t || !(pn.out[s] > 0)) continue
      pairs.push(analysePair(pn, s, t))
      yield pairs.length / count
    }
  }
  return { iter: iter(), snapshot: () => ({ n: pn.n, pairs, count, done: pairs.length === count }) }
}

// Success of the three strategies when every sender pays `fraction` of its
// outgoing balance, with the mean probability the uncertainty model gives to
// the routes chosen.
export function successAt(pairs, fraction) {
  const r = { single: 0, split: 0, full: 0, pSingle: 0, pSplit: 0, parts: 0 }
  for (const pair of pairs) {
    const p = pay(pair, amountOf(pair, fraction))
    r.single += p.single ? 1 : 0
    r.split += p.split ? 1 : 0
    r.full += p.full ? 1 : 0
    r.pSingle += p.pSingle
    r.pSplit += p.pSplit
    r.parts += p.parts
  }
  for (const key of Object.keys(r)) r[key] /= pairs.length || 1
  return { fraction, ...r }
}

export const successCurves = (pairs) => B_FRACTIONS.map((f) => successAt(pairs, f))

// The amount, as a fraction of the outgoing balance, at which a curve first
// drops below one half (linear interpolation between the points of the grid).
export function halfPoint(rows, key) {
  for (let i = 0; i < rows.length; i++)
    if (rows[i][key] < 0.5) {
      if (i === 0) return rows[0].fraction
      const a = rows[i - 1]
      const b = rows[i]
      return a.fraction + ((a[key] - 0.5) / (a[key] - b[key])) * (b.fraction - a.fraction)
    }
  return NaN
}

// ---------------------------------------------------------------- Panel C

export const C_SEED = 10003
export const C_DEFAULT = { L: 100, alpha: 2 }
export const C_PAIRS = 200
export const C_SWEEP_PAIRS = 2000
export const C_ALPHAS = Array.from({ length: 17 }, (_, i) => i / 4)
export const C_SIZES = [25, 50, 100, 200, 400]
export const C_SLOPE_ALPHAS = [0, 1.5, 2, 2.5]
export const C_DRAW_MAX = 40

const latticeSeed = (L, alpha) => seedOf(C_SEED, L * 1000 + Math.round(alpha * 100))
export const latticeOf = (L, alpha) => buildLattice(L, alpha, latticeSeed(L, alpha))

// The panel's lattice: 200 random pairs, and the route of the first pair.
export function panelC({ L, alpha }) {
  const lat = latticeOf(L, alpha)
  const pairs = randomPairs(L, C_PAIRS, seedOf(C_SEED, 7 + L))
  const stats = routeStats(lat, pairs)
  const route = []
  if (L <= C_DRAW_MAX) greedyRoute(lat, pairs[0][0], pairs[0][1], route)
  let jumps = 0
  for (let i = 1; i < route.length; i++) if (torusDistance(L, route[i - 1], route[i]) > 1) jumps++
  return { L, alpha, lat, mean: stats.mean, median: stats.median, lattice: stats.lattice, route, routeLattice: torusDistance(L, pairs[0][0], pairs[0][1]), jumps, pair: pairs[0] }
}

// Mean steps of greedy routing over 2,000 random pairs on one lattice.
export function meanSteps(L, alpha, pairs = C_SWEEP_PAIRS) {
  return routeStats(latticeOf(L, alpha), randomPairs(L, pairs, seedOf(C_SEED, 31 + L))).mean
}

// "Sweep α": mean steps for α = 0, 0.25, …, 4 at one size.
export function sweepAlphaJob(L) {
  const rows = []
  function* iter() {
    for (const alpha of C_ALPHAS) {
      rows.push({ alpha, mean: meanSteps(L, alpha) })
      yield rows.length / C_ALPHAS.length
    }
  }
  return {
    iter: iter(),
    snapshot: () => {
      const best = rows.reduce((b, r) => (b && b.mean <= r.mean ? b : r), null)
      return { L, rows: rows.slice(), best: best ? best.alpha : NaN, done: rows.length === C_ALPHAS.length }
    },
  }
}

// "Sweep L": mean steps against L for four values of α, with the slopes on log axes.
export function sweepLJob(sizes = C_SIZES, alphas = C_SLOPE_ALPHAS) {
  const curves = alphas.map((alpha) => ({ alpha, points: [] }))
  const total = sizes.length * alphas.length
  let done = 0
  function* iter() {
    for (const L of sizes)
      for (const c of curves) {
        c.points.push([L, meanSteps(L, c.alpha)])
        yield ++done / total
      }
  }
  return {
    iter: iter(),
    snapshot: () => ({
      sizes,
      curves: curves.map((c) => ({ alpha: c.alpha, points: c.points.slice(), slope: c.points.length > 1 ? powerFit(c.points).slope : NaN })),
      done: done === total,
    }),
  }
}
