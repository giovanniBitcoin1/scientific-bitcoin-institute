import { mulberry32 } from '../../rng.js'

// Panel C, "Motif counter", and the figure "Thirteen patterns": the connected
// patterns of three nodes in a directed network, how often each occurs, and
// how often it occurs in randomised networks in which every node keeps its
// incoming, outgoing and mutual links. Pure logic, shared by the page and by
// scripts/lab/check-network-04.mjs.
//
// A directed network is { n, links } with links = [[from, to], …], no
// self-links and no duplicates. A mutual link is a pair of opposite links.

// ---------------------------------------------------------------- The thirteen patterns

// Each pattern is drawn on three places: 0 (top), 1 (bottom left), 2 (bottom
// right). The order is the one of the figure: open patterns first, then the
// closed ones, each time by number of mutual links.
const M = (a, b) => [[a, b], [b, a]]
export const PATTERNS = [
  { id: 'fanOut', links: [[0, 1], [0, 2]] },
  { id: 'fanIn', links: [[1, 0], [2, 0]] },
  { id: 'chain', links: [[1, 0], [0, 2]] },
  { id: 'mutualOut', links: [...M(1, 0), [0, 2]] },
  { id: 'mutualIn', links: [...M(1, 0), [2, 0]] },
  { id: 'twoMutual', links: [...M(1, 0), ...M(0, 2)] },
  { id: 'feedForward', links: [[0, 1], [1, 2], [0, 2]] },
  { id: 'cycle', links: [[0, 1], [1, 2], [2, 0]] },
  { id: 'pairOut', links: [...M(1, 2), [1, 0], [2, 0]] },
  { id: 'pairIn', links: [...M(1, 2), [0, 1], [0, 2]] },
  { id: 'cycleMutual', links: [...M(1, 2), [0, 1], [2, 0]] },
  { id: 'twoMutualOne', links: [...M(1, 0), ...M(0, 2), [1, 2]] },
  { id: 'allMutual', links: [...M(0, 1), ...M(0, 2), ...M(1, 2)] },
]
export const PATTERN_IDS = PATTERNS.map((p) => p.id)
export const indexOfPattern = (id) => PATTERN_IDS.indexOf(id)

// The six possible links among three nodes as six bits.
const BIT = [
  [0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1],
]
const PERMS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
]
const codeOfLinks = (links) => {
  let code = 0
  for (const [a, b] of links) code |= 1 << BIT.findIndex((x) => x[0] === a && x[1] === b)
  return code
}
// The smallest code among the six ways of naming the three nodes.
function canonical(code) {
  let best = 64
  for (const perm of PERMS) {
    let c = 0
    for (let i = 0; i < 6; i++) if (code & (1 << i)) c |= 1 << BIT.findIndex((x) => x[0] === perm[BIT[i][0]] && x[1] === perm[BIT[i][1]])
    if (c < best) best = c
  }
  return best
}
// CLASS[code] is the pattern that three nodes with those links form, or −1
// when they are not connected (fewer than two of the three pairs are linked).
export const CLASS = (() => {
  const byCanon = new Map(PATTERNS.map((p, i) => [canonical(codeOfLinks(p.links)), i]))
  const table = new Int8Array(64).fill(-1)
  for (let code = 0; code < 64; code++) {
    const pairs = (code & 3 ? 1 : 0) + (code & 12 ? 1 : 0) + (code & 48 ? 1 : 0)
    if (pairs < 2) continue
    table[code] = byCanon.has(canonical(code)) ? byCanon.get(canonical(code)) : -2
  }
  return table
})()

// ---------------------------------------------------------------- Counting

// n × n table of 0/1: has[a * n + b] is 1 when a → b.
export function matrix(net) {
  const has = new Uint8Array(net.n * net.n)
  for (const [a, b] of net.links) has[a * net.n + b] = 1
  return has
}

const codeOf = (has, n, u, v, w) =>
  has[u * n + v] | (has[v * n + u] << 1) | (has[u * n + w] << 2) | (has[w * n + u] << 3) | (has[v * n + w] << 4) | (has[w * n + v] << 5)

// How many times each pattern occurs: every set of three nodes that hang
// together is counted once, under the pattern formed by all the links among
// the three.
export function countPatterns(n, has) {
  const counts = new Int32Array(PATTERNS.length)
  const nb = Array.from({ length: n }, () => [])
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (has[a * n + b] || has[b * n + a]) nb[a].push(b), nb[b].push(a)
  for (let v = 0; v < n; v++) {
    const list = nb[v]
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const u = list[i]
        const w = list[j]
        // A closed triple is met from each of its three nodes: keep one.
        if ((has[u * n + w] || has[w * n + u]) && !(v < u && v < w)) continue
        counts[CLASS[codeOf(has, n, v, u, w)]]++
      }
    }
  }
  return counts
}

export const countNet = (net) => countPatterns(net.n, matrix(net))

// The same count the slow way: every set of three nodes is looked at.
export function countBrute(net) {
  const { n } = net
  const has = matrix(net)
  const counts = new Int32Array(PATTERNS.length)
  let connected = 0
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      for (let w = v + 1; w < n; w++) {
        const c = CLASS[codeOf(has, n, u, v, w)]
        if (c >= 0) {
          counts[c]++
          connected++
        }
      }
    }
  }
  return { counts, connected }
}

// For every node: links in, links out, and how many of them are mutual.
export function profile(n, has) {
  const inn = new Int32Array(n)
  const out = new Int32Array(n)
  const mutual = new Int32Array(n)
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (!has[a * n + b]) continue
      out[a]++
      inn[b]++
      if (has[b * n + a]) mutual[a]++
    }
  }
  return { inn, out, mutual }
}

// ---------------------------------------------------------------- Randomising

// A network being randomised. Single links exchange their targets,
//
//   a → b, c → d   becomes   a → d, c → b
//
// and mutual links exchange partners in the same way. A swap is refused when
// it would create a self-link, a double link, or a link between two nodes
// already joined in either direction (which would turn a single link into a
// mutual one). So every node keeps its incoming, outgoing and mutual links.
export function randomiser(net, random) {
  const { n } = net
  const has = matrix(net)
  const sa = []
  const sb = []
  const ma = []
  const mb = []
  for (const [a, b] of net.links) {
    if (!has[b * n + a]) {
      sa.push(a)
      sb.push(b)
    } else if (a < b) {
      ma.push(a)
      mb.push(b)
    }
  }
  const total = sa.length + ma.length
  const joined = (a, b) => has[a * n + b] || has[b * n + a]
  let attempts = 0
  let accepted = 0

  function attempt() {
    attempts++
    if (!total) return false
    const i = Math.floor(random() * total)
    if (i < sa.length) {
      const j = Math.floor(random() * sa.length)
      if (i === j) return false
      const a = sa[i]
      const b = sb[i]
      const c = sa[j]
      const d = sb[j]
      if (a === d || c === b || a === c || b === d || joined(a, d) || joined(c, b)) return false
      has[a * n + b] = 0
      has[c * n + d] = 0
      has[a * n + d] = 1
      has[c * n + b] = 1
      sb[i] = d
      sb[j] = b
    } else {
      const i2 = i - sa.length
      const j = Math.floor(random() * ma.length)
      if (i2 === j) return false
      const a = ma[i2]
      const b = mb[i2]
      let c = ma[j]
      let d = mb[j]
      if (random() < 0.5) [c, d] = [d, c]
      if (a === d || c === b || a === c || b === d || joined(a, d) || joined(c, b)) return false
      has[a * n + b] = has[b * n + a] = 0
      has[c * n + d] = has[d * n + c] = 0
      has[a * n + d] = has[d * n + a] = 1
      has[c * n + b] = has[b * n + c] = 1
      mb[i2] = d
      ma[j] = c
      mb[j] = b
    }
    accepted++
    return true
  }

  return {
    n,
    has,
    attempt,
    mix(count) {
      let ok = 0
      for (let k = 0; k < count; k++) if (attempt()) ok++
      return ok
    },
    get attempts() {
      return attempts
    },
    get accepted() {
      return accepted
    },
  }
}

// ---------------------------------------------------------------- Experiment

export const SWAPS_PER_LINK = 10 // attempted swaps per link between two randomised networks
export const NULL_DEFAULT = 200
export const NULL_MAX = 1000
export const MOTIF_SEED = 0x5eed04

// A job for useExperiment: `samples` randomised networks, successive states of
// one chain of swaps, and the counts of the thirteen patterns in each.
export function motifJob(net, samples = NULL_DEFAULT, seed = MOTIF_SEED) {
  const observed = countNet(net)
  const K = PATTERNS.length
  const sum = new Float64Array(K)
  const squares = new Float64Array(K)
  const sw = randomiser(net, mulberry32(seed))
  const perSample = SWAPS_PER_LINK * Math.max(1, net.links.length)
  let done = 0
  function* iter() {
    for (let s = 0; s < samples; s++) {
      sw.mix(perSample)
      const c = countPatterns(net.n, sw.has)
      for (let k = 0; k < K; k++) {
        sum[k] += c[k]
        squares[k] += c[k] * c[k]
      }
      done++
      yield done / samples
    }
  }
  return {
    iter: iter(),
    snapshot: () => {
      const mean = Array.from(sum, (v) => (done ? v / done : NaN))
      const sd = Array.from(squares, (v, k) => (done > 1 ? Math.sqrt(Math.max(0, (v - done * mean[k] ** 2) / (done - 1))) : NaN))
      const z = mean.map((m, k) => (sd[k] > 1e-9 ? (observed[k] - m) / sd[k] : NaN))
      return { observed: Array.from(observed), samples: done, wanted: samples, mean, sd, z, accepted: sw.accepted, attempted: sw.attempts }
    },
  }
}

// ---------------------------------------------------------------- Networks

const seedOf = (seed, salt) => (Math.imul(seed + 1, 0x9e3779b1) ^ salt) >>> 0

function collector(n) {
  const has = new Uint8Array(n * n)
  const links = []
  return {
    links,
    add(a, b) {
      if (a === b || has[a * n + b]) return false
      has[a * n + b] = 1
      links.push([a, b])
      return true
    },
  }
}

// Rows of nodes, top to bottom, for the drawing (flat positions in the unit
// square).
function rows(sizes, ys) {
  const pos = []
  sizes.forEach((size, r) => {
    for (let i = 0; i < size; i++) pos.push((i + 0.5) / size, ys[r])
  })
  return Float64Array.from(pos)
}

// Regulation-like: 6 master regulators, 14 regulators, 80 targets. Thirty
// times, a master X, a regulator Y and a target Z are drawn and the links
// X → Y, Y → Z and X → Z are added (a feed-forward loop is built in); then 30
// more links from a master or a regulator to a target.
export const REG = { masters: 6, regulators: 14, targets: 80, loops: 30, extra: 30 }
export function regulationNetwork(seed) {
  const random = mulberry32(seedOf(seed, 0x1a))
  const pick = (k) => Math.floor(random() * k)
  const n = REG.masters + REG.regulators + REG.targets
  const c = collector(n)
  for (let i = 0; i < REG.loops; i++) {
    const x = pick(REG.masters)
    const y = REG.masters + pick(REG.regulators)
    const z = REG.masters + REG.regulators + pick(REG.targets)
    c.add(x, y)
    c.add(y, z)
    c.add(x, z)
  }
  for (let added = 0; added < REG.extra; ) {
    if (c.add(pick(REG.masters + REG.regulators), REG.masters + REG.regulators + pick(REG.targets))) added++
  }
  return { n, links: c.links, pos: rows([REG.masters, REG.regulators, REG.targets], [0.04, 0.42, 0.96]), layers: [REG.masters, REG.regulators, REG.targets] }
}

// Layered like a food web: four levels of 30, 30, 25 and 15 species. Every
// species above the first level feeds on two to five species of the
// level just below; a link points from the eaten to the eater. Chains, and
// no loop of any kind.
export const WEB_LEVELS = [30, 30, 25, 15]
export function foodWebNetwork(seed) {
  const random = mulberry32(seedOf(seed, 0x2b))
  const pick = (k) => Math.floor(random() * k)
  const n = WEB_LEVELS.reduce((s, v) => s + v, 0)
  const c = collector(n)
  let below = 0
  for (let level = 1; level < WEB_LEVELS.length; level++) {
    const first = below + WEB_LEVELS[level - 1]
    for (let i = 0; i < WEB_LEVELS[level]; i++) {
      const meals = 2 + pick(4)
      for (let m = 0; m < meals; m++) c.add(below + pick(WEB_LEVELS[level - 1]), first + i)
    }
    below = first
  }
  // Drawn with the first level at the bottom.
  return { n, links: c.links, pos: rows(WEB_LEVELS, [0.96, 0.65, 0.35, 0.04]), layers: WEB_LEVELS }
}

// Random: 100 nodes and 150 links, each from a random node to another.
export const RANDOM_DIRECTED = { n: 100, links: 150 }
export function randomDirected(seed) {
  const random = mulberry32(seedOf(seed, 0x3c))
  const { n } = RANDOM_DIRECTED
  const c = collector(n)
  while (c.links.length < RANDOM_DIRECTED.links) c.add(Math.floor(random() * n), Math.floor(random() * n))
  const pos = new Float64Array(2 * n)
  for (let v = 0; v < n; v++) {
    pos[2 * v] = 0.5 + 0.5 * Math.cos((2 * Math.PI * v) / n)
    pos[2 * v + 1] = 0.5 + 0.5 * Math.sin((2 * Math.PI * v) / n)
  }
  return { n, links: c.links, pos }
}

export const MOTIF_NETWORKS = { regulation: regulationNetwork, foodWeb: foodWebNetwork, random: randomDirected }
export const MOTIF_NETWORK_IDS = ['regulation', 'foodWeb', 'random']
export const NETWORK_SEED = 1

// Number of mutual links of a network.
export function mutualLinks(net) {
  const has = matrix(net)
  let m = 0
  for (const [a, b] of net.links) if (a < b && has[b * net.n + a]) m++
  return m
}
