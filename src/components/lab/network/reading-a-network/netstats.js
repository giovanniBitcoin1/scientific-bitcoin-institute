import {
  buildCSR,
  bfsDistances,
  connectedComponents,
  clustering,
  ringLattice,
  erdosRenyiGnm,
} from '../../graphUtils.js'

// The "network microscope": a small editable undirected network, the numbers
// read off it, and its presets. Pure logic on top of graphUtils.js, shared by
// the panel and by scripts/lab/check-network-01.mjs.
//
// A network is { labels: [string], edges: [[a, b]] } with 0 ≤ a, b < N, no
// self-loops and no repeated links.

export const MAX_NODES = 60

// ---------------------------------------------------------------- Measures

export function analyze(net) {
  const n = net.labels.length
  const L = net.edges.length
  const A = Int32Array.from(net.edges, (e) => e[0])
  const B = Int32Array.from(net.edges, (e) => e[1])
  const g = buildCSR(n, A, B)

  const degree = new Int32Array(n)
  let maxDegree = 0
  for (let v = 0; v < n; v++) {
    degree[v] = g.offsets[v + 1] - g.offsets[v]
    if (degree[v] > maxDegree) maxDegree = degree[v]
  }
  const histogram = new Array(maxDegree + 1).fill(0)
  for (let v = 0; v < n; v++) histogram[degree[v]]++

  // Triangles and connected triples. For node v, e_v = C_v · k_v(k_v − 1)/2 is
  // the number of links among its neighbours; every triangle is counted at
  // each of its three corners.
  const cl = clustering(g)
  let corners = 0
  let triples = 0
  for (let v = 0; v < n; v++) {
    const pairs = (degree[v] * (degree[v] - 1)) / 2
    triples += pairs
    corners += Math.round(cl.local[v] * pairs)
  }
  const triangles = corners / 3

  // Distances inside the largest component (the first one of that size).
  const comp = connectedComponents(g)
  const big = comp.sizes.indexOf(comp.largest)
  const dist = new Int32Array(n)
  const queue = new Int32Array(n)
  let diameter = 0
  let sum = 0
  let pairs = 0
  for (let s = 0; s < n; s++) {
    if (comp.label[s] !== big) continue
    bfsDistances(g, s, dist, queue)
    for (let v = 0; v < n; v++) {
      if (dist[v] > 0) {
        sum += dist[v]
        pairs++
        if (dist[v] > diameter) diameter = dist[v]
      }
    }
  }

  return {
    g,
    n,
    L,
    degree,
    maxDegree,
    histogram,
    meanDegree: n ? (2 * L) / n : 0,
    density: n > 1 ? L / ((n * (n - 1)) / 2) : 0,
    components: comp.count,
    componentLabel: comp.label,
    componentSizes: comp.sizes,
    largest: n ? comp.largest : 0,
    diameter,
    avgDistance: pairs ? sum / pairs : 0,
    local: cl.local,
    avgClustering: cl.average,
    triangles,
    transitivity: triples ? (3 * triangles) / triples : 0,
  }
}

// Distances from one node, with its largest distance (eccentricity).
export function distancesFrom(stats, source) {
  const dist = bfsDistances(stats.g, source)
  let far = 0
  for (let v = 0; v < stats.n; v++) if (dist[v] > far) far = dist[v]
  return { dist, far }
}

// Row order for the matrix view that puts each component in one block:
// largest component first, original order inside each.
export function orderByComponent(stats) {
  const rank = stats.componentSizes
    .map((size, c) => ({ size, c }))
    .sort((a, b) => b.size - a.size || a.c - b.c)
    .map((x) => x.c)
  const pos = new Array(rank.length)
  rank.forEach((c, i) => (pos[c] = i))
  return Array.from({ length: stats.n }, (_, v) => v).sort(
    (a, b) => pos[stats.componentLabel[a]] - pos[stats.componentLabel[b]] || a - b,
  )
}

// ---------------------------------------------------------------- Editing

export const hasEdge = (net, a, b) =>
  net.edges.some((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))

// Each returns a new network, or the same one when the edit is not allowed.
export function addNode(net, label) {
  if (net.labels.length >= MAX_NODES) return net
  return { labels: [...net.labels, label], edges: net.edges }
}

export function addEdge(net, a, b) {
  const n = net.labels.length
  if (a === b || a < 0 || b < 0 || a >= n || b >= n || hasEdge(net, a, b)) return net
  return { labels: net.labels, edges: [...net.edges, [a, b]] }
}

export function removeEdge(net, a, b) {
  if (!hasEdge(net, a, b)) return net
  return {
    labels: net.labels,
    edges: net.edges.filter((e) => !((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))),
  }
}

export function removeNode(net, v) {
  if (v < 0 || v >= net.labels.length) return net
  const shift = (x) => (x > v ? x - 1 : x)
  return {
    labels: net.labels.filter((_, i) => i !== v),
    edges: net.edges.filter((e) => e[0] !== v && e[1] !== v).map((e) => [shift(e[0]), shift(e[1])]),
  }
}

// A label not yet in use: the smallest positive integer.
export function freshLabel(net) {
  const taken = new Set(net.labels)
  let i = 1
  while (taken.has(String(i))) i++
  return String(i)
}

// ---------------------------------------------------------------- Presets

const numbered = (n) => Array.from({ length: n }, (_, i) => String(i + 1))
const fromArrays = ({ A, B }) => Array.from(A, (a, e) => [a, B[e]])

export const RANDOM_SEED = 7

// `layout` tells the panel how to place the nodes: "circle", "line" or "force".
export const PRESETS = {
  path: () => ({
    labels: numbered(10),
    edges: Array.from({ length: 9 }, (_, i) => [i, i + 1]),
    layout: 'line',
  }),
  ring: () => ({ labels: numbered(20), edges: fromArrays(ringLattice(20, 4)), layout: 'circle' }),
  random: () => ({ labels: numbered(30), edges: fromArrays(erdosRenyiGnm(30, 45, RANDOM_SEED)), layout: 'force' }),
  // n triangles sharing node 0.
  windmill: (n = 10) => {
    const edges = []
    for (let t = 0; t < n; t++) {
      const a = 1 + 2 * t
      edges.push([0, a], [0, a + 1], [a, a + 1])
    }
    return { labels: numbered(2 * n + 1), edges, layout: 'force' }
  },
  complete: (n = 8) => {
    const edges = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) edges.push([a, b])
    return { labels: numbered(n), edges, layout: 'circle' }
  },
  // Two groups with no link between them: a tight group of 5 and a looser one of 7.
  groups: () => ({
    labels: numbered(12),
    edges: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [2, 3], [2, 4], [3, 4],
      [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 5], [5, 8], [6, 10],
    ],
    layout: 'force',
  }),
  // Real networks: `data` is the JSON stored in src/data/lab/networks/.
  fromData: (data) => ({ labels: [...data.nodes], edges: data.edges.map((e) => [...e]), layout: 'force' }),
}
