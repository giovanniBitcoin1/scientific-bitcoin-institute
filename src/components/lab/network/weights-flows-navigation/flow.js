import { mulberry32, randNormal } from '../../rng.js'
import { barabasiAlbert } from '../../graphUtils.js'
import { MinHeap, seedOf } from './weights.js'

// Network Lab module 10: capacities, maximum flow, minimum cut, widest routes
// and the synthetic payment network of Panel B. Plain functions, shared with
// scripts/lab/check-network-10.mjs.
//
// A flow network keeps its arcs in pairs: arc 2i runs u → v and arc 2i + 1
// runs v → u, each the other's reverse in the residual graph (`a ^ 1`). A
// one-way link is a pair whose second capacity is 0; a payment channel is a
// pair holding the two balances.

export function flowNet(n) {
  return { n, first: new Int32Array(n).fill(-1), next: [], to: [], from: [], cap: [] }
}

export function addPair(net, u, v, capUV, capVU = 0) {
  for (const [a, b, c] of [[u, v, capUV], [v, u, capVU]]) {
    net.to.push(b)
    net.from.push(a)
    net.cap.push(c)
    net.next.push(net.first[a])
    net.first[a] = net.to.length - 1
  }
  return net.to.length - 2
}

// A directed network from a list of [u, v, capacity].
export function directedNet(n, arcs) {
  const net = flowNet(n)
  for (const [u, v, c] of arcs) addPair(net, u, v, c, 0)
  return net
}

// Maximum flow from s to t by Dinic's method on the residual graph. Returns
// the value, the residual capacities, the flow on every arc, the source side
// of a minimum cut and the arcs that cross it.
export function maxFlow(net, s, t) {
  const { n, first, next, to } = net
  const res = Float64Array.from(net.cap)
  const level = new Int32Array(n)
  const queue = new Int32Array(n)
  const it = new Int32Array(n)
  let value = 0
  const bfs = () => {
    level.fill(-1)
    level[s] = 0
    queue[0] = s
    let head = 0
    let tail = 1
    while (head < tail) {
      const u = queue[head++]
      for (let a = first[u]; a >= 0; a = next[a])
        if (res[a] > 0 && level[to[a]] < 0) {
          level[to[a]] = level[u] + 1
          queue[tail++] = to[a]
        }
    }
    return level[t] >= 0
  }
  const dfs = (u, limit) => {
    if (u === t) return limit
    for (; it[u] >= 0; it[u] = next[it[u]]) {
      const a = it[u]
      const v = to[a]
      if (res[a] > 0 && level[v] === level[u] + 1) {
        const got = dfs(v, Math.min(limit, res[a]))
        if (got > 0) {
          res[a] -= got
          res[a ^ 1] += got
          return got
        }
      }
    }
    return 0
  }
  if (s !== t)
    while (bfs()) {
      it.set(first)
      for (let got = dfs(s, Infinity); got > 0; got = dfs(s, Infinity)) value += got
    }
  // after the last search, `level` marks what the source still reaches
  const side = Uint8Array.from(level, (l) => (l >= 0 ? 1 : 0))
  const flow = Float64Array.from(net.cap, (c, a) => Math.max(0, c - res[a]))
  const cut = []
  for (let a = 0; a < to.length; a++) if (net.cap[a] > 0 && side[net.from[a]] && !side[to[a]]) cut.push(a)
  return { value, res, flow, side, cut, cutCapacity: cut.reduce((x, a) => x + net.cap[a], 0) }
}

// Splits a flow into routes from s to t: [{ nodes, arcs, amount }].
export function flowPaths(net, flow, s, t) {
  const f = Float64Array.from(flow)
  const paths = []
  for (let guard = 0; guard < 10 * f.length + 10; guard++) {
    const arcs = []
    const seen = new Uint8Array(net.n)
    let u = s
    seen[s] = 1
    while (u !== t) {
      let pick = -1
      for (let a = net.first[u]; a >= 0; a = net.next[a]) if (f[a] > 0 && !seen[net.to[a]] && (pick < 0 || a < pick)) pick = a
      if (pick < 0) break
      arcs.push(pick)
      u = net.to[pick]
      seen[u] = 1
    }
    if (u !== t) break
    const amount = Math.min(...arcs.map((a) => f[a]))
    for (const a of arcs) f[a] -= amount
    paths.push({ nodes: [s, ...arcs.map((a) => net.to[a])], arcs, amount })
  }
  return paths
}

// Minimum cut by brute force, for the self-check: the smallest total capacity
// leaving a set that holds s and not t, over all such sets.
export function minCutBrute(net, s, t) {
  let best = Infinity
  for (let mask = 0; mask < 1 << net.n; mask++) {
    if (!((mask >> s) & 1) || (mask >> t) & 1) continue
    let c = 0
    for (let a = 0; a < net.to.length; a++) if ((mask >> net.from[a]) & 1 && !((mask >> net.to[a]) & 1)) c += net.cap[a]
    if (c < best) best = c
  }
  return best
}

// The widest route from s to t, where arc a is `width[a]` wide (0 = closed):
// first the largest width a route can have at its narrowest arc, by a Dijkstra
// that maximises the bottleneck; then, among the routes that wide, one with
// the fewest arcs, by breadth-first search. Returns { width, arcs, nodes } or
// null when t cannot be reached.
export function widestRoute(net, width, s, t) {
  const { n, first, next, to } = net
  const best = new Float64Array(n)
  const done = new Uint8Array(n)
  const heap = new MinHeap(256)
  best[s] = Infinity
  heap.push(-Infinity, s)
  while (heap.size) {
    const u = heap.pop()
    if (done[u]) continue
    done[u] = 1
    if (u === t) break
    for (let a = first[u]; a >= 0; a = next[a]) {
      const b = Math.min(best[u], width[a])
      if (b > best[to[a]]) {
        best[to[a]] = b
        heap.push(-b, to[a])
      }
    }
  }
  const W = best[t]
  if (!(W > 0)) return null
  const via = new Int32Array(n).fill(-1)
  const seen = new Uint8Array(n)
  const queue = new Int32Array(n)
  let head = 0
  let tail = 1
  queue[0] = s
  seen[s] = 1
  while (head < tail && !seen[t]) {
    const u = queue[head++]
    // arcs in the order they were added, so the route does not depend on how the lists are linked
    const arcs = []
    for (let a = first[u]; a >= 0; a = next[a]) arcs.push(a)
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i]
      if (width[a] >= W && !seen[to[a]]) {
        seen[to[a]] = 1
        via[to[a]] = a
        queue[tail++] = to[a]
      }
    }
  }
  const arcs = []
  for (let v = t; v !== s; v = net.from[via[v]]) arcs.push(via[v])
  arcs.reverse()
  return { width: W, arcs, nodes: [s, ...arcs.map((a) => to[a])] }
}

// Widest route by brute force over every simple route, for the self-check.
export function widestBrute(net, width, s, t) {
  let best = 0
  const seen = new Uint8Array(net.n)
  const walk = (u, b) => {
    if (u === t) {
      if (b > best) best = b
      return
    }
    seen[u] = 1
    for (let a = net.first[u]; a >= 0; a = net.next[a]) if (width[a] > 0 && !seen[net.to[a]]) walk(net.to[a], Math.min(b, width[a]))
    seen[u] = 0
  }
  walk(s, Infinity)
  return best
}

// ---------------------------------------------------------------- payments

// A channel of capacity c whose balance is equally likely to be 0, 1, …, c
// forwards the amount a with probability (c + 1 − a)/(c + 1).
export const forwardProbability = (c, a) => (a > c ? 0 : (c + 1 - a) / (c + 1))

// Capacities: lognormal, median 1,000,000 (satoshi), σ = 1 on the natural log.
export const CAP_MEDIAN = 1e6
export const CAP_SIGMA = 1
export const PAY_M = 3
export const MAX_PARTS = 4

// The synthetic payment network: preferential attachment with m = 3 channels
// per new node; every channel has a whole-number capacity c, lognormal, and a
// balance drawn uniformly from 0 … c on one side, the rest on the other.
export function paymentNetwork({ N, seed, m = PAY_M }) {
  const ba = barabasiAlbert(N, m, seedOf(seed, 1))
  const random = mulberry32(seedOf(seed, 2))
  const net = flowNet(N)
  const L = ba.A.length
  const capacity = new Float64Array(2 * L) // per arc: the public capacity of its channel
  const degree = new Int32Array(N)
  const out = new Float64Array(N)
  for (let e = 0; e < L; e++) {
    const c = Math.max(1, Math.round(CAP_MEDIAN * Math.exp(CAP_SIGMA * randNormal(random))))
    const b = Math.floor(random() * (c + 1))
    addPair(net, ba.A[e], ba.B[e], b, c - b)
    capacity[2 * e] = capacity[2 * e + 1] = c
    degree[ba.A[e]]++
    degree[ba.B[e]]++
    out[ba.A[e]] += b
    out[ba.B[e]] += c - b
  }
  return { net, n: N, channels: L, capacity, degree, out }
}

// Up to four routes from s to t that share no channel: the widest by public
// capacity, then the widest of what is left, and so on.
export function disjointRoutes(pn, s, t, max = MAX_PARTS) {
  const width = Float64Array.from(pn.capacity)
  const routes = []
  for (let j = 0; j < max; j++) {
    const r = widestRoute(pn.net, width, s, t)
    if (!r) break
    routes.push({
      nodes: r.nodes,
      arcs: r.arcs,
      width: r.width,
      capacities: r.arcs.map((a) => pn.capacity[a]),
      canForward: Math.min(...r.arcs.map((a) => pn.net.cap[a])), // the smallest balance in the right direction
    })
    for (const a of r.arcs) width[a] = width[a ^ 1] = 0
  }
  return routes
}

// The amount cut into k whole parts as equal as possible.
export function evenParts(a, k) {
  const base = Math.floor(a / k)
  return Array.from({ length: k }, (_, j) => base + (j < a - base * k ? 1 : 0))
}

export const routeProbability = (capacities, a) => capacities.reduce((p, c) => p * forwardProbability(c, a), 1)

// Everything Panel B needs about one sender and one receiver, whatever the amount.
export function analysePair(pn, s, t) {
  const mf = maxFlow(pn.net, s, t)
  return { s, t, out: pn.out[s], maxFlow: mf.value, cutSize: mf.cut.length, routes: disjointRoutes(pn, s, t) }
}

// One payment of amount a between an analysed pair, by the three strategies.
//  single: the widest route by capacity carries it all;
//  split:  1 to 4 of the disjoint routes carry equal parts, the number of
//          parts being the one the uncertainty model rates most likely;
//  full:   whoever knows every balance succeeds exactly when a ≤ maximum flow.
export function pay(pair, a) {
  const { routes } = pair
  const pSingle = routeProbability(routes[0].capacities, a)
  let parts = 1
  let pSplit = pSingle
  for (let k = 2; k <= routes.length; k++) {
    const amounts = evenParts(a, k)
    let p = 1
    for (let j = 0; j < k; j++) p *= routeProbability(routes[j].capacities, amounts[j])
    if (p > pSplit) {
      pSplit = p
      parts = k
    }
  }
  const amounts = evenParts(a, parts)
  return {
    single: a <= routes[0].canForward,
    pSingle,
    split: amounts.every((x, j) => x <= routes[j].canForward),
    pSplit,
    parts,
    full: a <= pair.maxFlow,
  }
}

export const amountOf = (pair, fraction) => Math.max(1, Math.round(fraction * pair.out))
