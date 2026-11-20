// Triangles around a link, for module 04: neighbourhood overlap, bridges and
// local bridges, transitivity and clustering, distances. A network is
// { n, A, B } (link e joins A[e] and B[e]); most functions take its adjacency,
// one Set of neighbours per node. Pure logic, shared by the page and by
// scripts/lab/check-network-04.mjs.

export function adjacency(net) {
  const adj = Array.from({ length: net.n }, () => new Set())
  for (let e = 0; e < net.A.length; e++) {
    adj[net.A[e]].add(net.B[e])
    adj[net.B[e]].add(net.A[e])
  }
  return adj
}

export function commonNeighbours(adj, a, b) {
  const out = []
  for (const v of adj[a]) if (v !== b && adj[b].has(v)) out.push(v)
  return out.sort((x, y) => x - y)
}

// Neighbourhood overlap of the link a–b: the neighbours the two ends share,
// divided by all the neighbours of either end, the ends themselves left out.
// A link whose ends have no other neighbour at all counts as 0.
export function overlap(adj, a, b) {
  let common = 0
  for (const v of adj[a]) if (v !== b && adj[b].has(v)) common++
  const others = adj[a].size - 1 + (adj[b].size - 1) - common
  return { common, others, value: others > 0 ? common / others : 0 }
}

// Is b still reachable from a when the link a–b is not used?
function reachableWithout(adj, a, b) {
  const seen = new Set([a])
  const stack = [a]
  while (stack.length) {
    const u = stack.pop()
    for (const v of adj[u]) {
      if (u === a && v === b) continue
      if (v === b) return true
      if (!seen.has(v)) {
        seen.add(v)
        stack.push(v)
      }
    }
  }
  return false
}

// A bridge: removing it leaves its two ends in different pieces.
export const isBridge = (adj, a, b) => !reachableWithout(adj, a, b)

// One row per link: overlap, whether it is a local bridge (its ends share no
// neighbour) and whether it is a bridge. Every bridge is a local bridge.
export function linkTable(net, adj = adjacency(net)) {
  return Array.from(net.A, (a, e) => {
    const b = net.B[e]
    const o = overlap(adj, a, b)
    const localBridge = o.common === 0
    return { a, b, ...o, localBridge, bridge: localBridge && isBridge(adj, a, b) }
  })
}

export function overlaps(net, adj = adjacency(net)) {
  return Float64Array.from(net.A, (a, e) => overlap(adj, a, net.B[e]).value)
}

export function localBridgeShare(net, adj = adjacency(net)) {
  const L = net.A.length
  if (!L) return 0
  let count = 0
  for (let e = 0; e < L; e++) if (overlap(adj, net.A[e], net.B[e]).common === 0) count++
  return count / L
}

// Triangles, connected triples, transitivity and average clustering (module
// 01): nodes with fewer than two neighbours count as 0 in the average.
export function triangleStats(adj) {
  const n = adj.length
  let corners = 0
  let triples = 0
  let sum = 0
  const local = new Float64Array(n)
  for (let v = 0; v < n; v++) {
    const nb = [...adj[v]]
    const k = nb.length
    if (k < 2) continue
    let linked = 0
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if (adj[nb[i]].has(nb[j])) linked++
    const pairs = (k * (k - 1)) / 2
    triples += pairs
    corners += linked
    local[v] = linked / pairs
    sum += local[v]
  }
  return {
    triangles: corners / 3,
    triples,
    transitivity: triples ? corners / triples : 0,
    avgClustering: n ? sum / n : 0,
    local,
  }
}

// Pieces of the network, and the average distance between the pairs of the
// largest one.
export function distanceStats(adj) {
  const n = adj.length
  const label = new Int32Array(n).fill(-1)
  const sizes = []
  const queue = new Int32Array(n)
  for (let s = 0; s < n; s++) {
    if (label[s] >= 0) continue
    const c = sizes.length
    label[s] = c
    queue[0] = s
    let head = 0
    let tail = 1
    while (head < tail) {
      const u = queue[head++]
      for (const v of adj[u]) {
        if (label[v] < 0) {
          label[v] = c
          queue[tail++] = v
        }
      }
    }
    sizes.push(tail)
  }
  const largest = Math.max(0, ...sizes)
  const big = sizes.indexOf(largest)
  const dist = new Int32Array(n)
  let sum = 0
  let pairs = 0
  for (let s = 0; s < n; s++) {
    if (label[s] !== big) continue
    dist.fill(-1)
    dist[s] = 0
    queue[0] = s
    let head = 0
    let tail = 1
    while (head < tail) {
      const u = queue[head++]
      for (const v of adj[u]) {
        if (dist[v] < 0) {
          dist[v] = dist[u] + 1
          sum += dist[v]
          pairs++
          queue[tail++] = v
        }
      }
    }
  }
  return { pieces: sizes.length, largest, giant: n ? largest / n : 0, avgDistance: pairs ? sum / pairs : 0 }
}

// ---------------------------------------------------------------- Figure "Overlap"

// Twelve people in two clusters joined by one link, f–g. Each cluster has
// tight corners and, on the right, a square: h–j and i–k are local bridges
// (their ends share nobody) without being bridges.
const NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
const PAIRS = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [3, 5], [4, 5],
  [5, 6],
  [6, 7], [6, 8], [7, 8], [7, 9], [8, 10], [9, 10], [9, 11], [10, 11],
]
const POS = [
  0.0, 0.5, // a
  0.12, 0.14, // b
  0.12, 0.86, // c
  0.27, 0.3, // d
  0.27, 0.74, // e
  0.4, 0.5, // f
  0.6, 0.5, // g
  0.73, 0.2, // h
  0.73, 0.8, // i
  0.9, 0.2, // j
  0.9, 0.8, // k
  1.0, 0.5, // l
]
export const TWO_CLUSTERS = {
  n: NAMES.length,
  A: Int32Array.from(PAIRS, (p) => p[0]),
  B: Int32Array.from(PAIRS, (p) => p[1]),
  names: NAMES,
  pos: Float64Array.from(POS),
}
