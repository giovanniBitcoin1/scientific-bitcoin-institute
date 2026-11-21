import { mulberry32 } from '../../rng.js'
import { adjacency, overlaps } from './overlap.js'

// Panel B, "Weak ties hold it together": eight groups of 25 with dense ties
// inside and sparse ties between, a strength on every link, and what is left
// of the network when links are removed in a chosen order. Pure logic, shared
// by the panel and by scripts/lab/check-network-04.mjs.

export const GROUPS = 8
export const GROUP_SIZE = 25
export const P_INSIDE = 0.5 // chance of a link between two members of a group
export const P_BETWEEN = 0.004 // chance of a link between members of two groups
export const NOISE = 0.1 // strength = overlap + a random number between 0 and NOISE
export const WEAK_RUNS = 300
export const WEAK_SEED = 2026
export const ORDER_IDS = ['weakest', 'strongest', 'lowOverlap', 'highOverlap', 'random']
export const STEPS = 100 // the curves have a point every 1/STEPS of the links

const seedOf = (seed, i) => (seed + Math.imul(i + 1, 0x9e3779b1)) >>> 0

// The network: { n, A, B, group, between } where `between` flags the links
// that join two groups.
export function groupNetwork(seed, pInside = P_INSIDE, pBetween = P_BETWEEN) {
  const random = mulberry32(seed)
  const n = GROUPS * GROUP_SIZE
  const group = Int32Array.from({ length: n }, (_, v) => Math.floor(v / GROUP_SIZE))
  const A = []
  const B = []
  const between = []
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const same = group[a] === group[b]
      if (random() < (same ? pInside : pBetween)) {
        A.push(a)
        B.push(b)
        between.push(same ? 0 : 1)
      }
    }
  }
  return { n, A: Int32Array.from(A), B: Int32Array.from(B), group, between: Uint8Array.from(between) }
}

function shuffled(count, random) {
  const order = Int32Array.from({ length: count }, (_, i) => i)
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  return order
}

// A strength for every link. With `follow`, the overlap of the link plus a
// random number between 0 and NOISE. Without, the same strengths dealt out
// again among the links at random, so that strength says nothing about
// position.
export function strengths(overlap, follow, random, noise = NOISE) {
  const w = Float64Array.from(overlap, (o) => o + noise * random())
  if (follow) return w
  const order = shuffled(w.length, random)
  return Float64Array.from(order, (e) => w[e])
}

// The links in the order in which they are removed. Equal values (many links
// have overlap 0) are taken in random order.
export function removalOrder(orderId, strength, overlap, random) {
  const order = shuffled(strength.length, random)
  if (orderId === 'random') return order
  const value = orderId === 'weakest' || orderId === 'strongest' ? strength : overlap
  const sign = orderId === 'weakest' || orderId === 'lowOverlap' ? 1 : -1
  return Int32Array.from(Array.from(order).sort((x, y) => sign * (value[x] - value[y])))
}

// For k = 0 … L links removed in `order`: the share of the largest piece, and
// the average size of the other pieces (0 while there is only one piece).
// Computed backwards, by putting the links back one at a time.
export function removalCurve(net, order) {
  const { n } = net
  const L = order.length
  const parent = Int32Array.from({ length: n }, (_, v) => v)
  const size = new Int32Array(n).fill(1)
  const find = (v) => {
    while (parent[v] !== v) {
      parent[v] = parent[parent[v]]
      v = parent[v]
    }
    return v
  }
  const giant = new Float64Array(L + 1)
  const others = new Float64Array(L + 1)
  let pieces = n
  let largest = 1
  const record = (k) => {
    giant[k] = largest / n
    others[k] = pieces > 1 ? (n - largest) / (pieces - 1) : 0
  }
  record(L)
  for (let k = L - 1; k >= 0; k--) {
    const e = order[k]
    const a = find(net.A[e])
    const b = find(net.B[e])
    if (a !== b) {
      const [big, small] = size[a] >= size[b] ? [a, b] : [b, a]
      parent[small] = big
      size[big] += size[small]
      pieces--
      if (size[big] > largest) largest = size[big]
    }
    record(k)
  }
  return { giant, others }
}

// The pieces left after the first k links of `order` are gone: a label per
// node, and which label is the largest piece.
export function piecesAfter(net, order, k) {
  const { n } = net
  const parent = Int32Array.from({ length: n }, (_, v) => v)
  const find = (v) => {
    while (parent[v] !== v) {
      parent[v] = parent[parent[v]]
      v = parent[v]
    }
    return v
  }
  for (let i = k; i < order.length; i++) {
    const a = find(net.A[order[i]])
    const b = find(net.B[order[i]])
    if (a !== b) parent[a] = b
  }
  const label = Int32Array.from({ length: n }, (_, v) => find(v))
  const count = new Map()
  for (const l of label) count.set(l, (count.get(l) || 0) + 1)
  let big = -1
  let largest = 0
  for (const [l, c] of count) {
    if (c > largest) {
      largest = c
      big = l
    }
  }
  return { label, big, largest, pieces: count.size }
}

// The generator that breaks ties in removal order `orderId`, seeded from the
// network's seed and the order alone. It is not the generator of the
// strengths, so the orders that ignore strength (at random, lowest and
// highest overlap first) are the same with the switch on and off.
export const orderRandom = (seed, orderId) => mulberry32(seedOf((seed ^ 0x2545f491) >>> 0, ORDER_IDS.indexOf(orderId)))

// One network with everything the panel shows about it.
export function weakSample(seed, follow, { pInside = P_INSIDE, pBetween = P_BETWEEN, noise = NOISE } = {}) {
  const net = groupNetwork(seed, pInside, pBetween)
  const overlap = overlaps(net, adjacency(net))
  const random = mulberry32((seed ^ 0x7f4a7c15) >>> 0)
  const strength = strengths(overlap, follow, random, noise)
  const orders = {}
  for (const id of ORDER_IDS) orders[id] = removalOrder(id, strength, overlap, orderRandom(seed, id))
  let betweenLinks = 0
  for (const b of net.between) betweenLinks += b
  return { net, overlap, strength, orders, betweenLinks, betweenShare: betweenLinks / net.A.length }
}

const atFraction = (curve, f) => {
  const L = curve.length - 1
  return curve[Math.round(f * L)]
}

// The curves of the panel, as a job for useExperiment: for each order, the
// two quantities at f = 0, 1/STEPS, …, 1, averaged over `runs` networks (the
// first one is the network the panel draws).
export function weakJob(follow, seed = WEAK_SEED, runs = WEAK_RUNS, options) {
  const fractions = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS)
  const zero = () => new Float64Array(STEPS + 1)
  const sum = Object.fromEntries(ORDER_IDS.map((id) => [id, { giant: zero(), others: zero() }]))
  let share = 0
  let first = null
  let done = 0
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const sample = weakSample(seedOf(seed, r), follow, options)
      if (r === 0) first = sample
      share += sample.betweenShare
      for (const id of ORDER_IDS) {
        const c = removalCurve(sample.net, sample.orders[id])
        for (let i = 0; i <= STEPS; i++) {
          sum[id].giant[i] += atFraction(c.giant, fractions[i])
          sum[id].others[i] += atFraction(c.others, fractions[i])
        }
      }
      done++
      yield done / runs
    }
  }
  return {
    iter: iter(),
    snapshot: () => {
      const d = Math.max(1, done)
      const mean = Object.fromEntries(ORDER_IDS.map((id) => [id, { giant: sum[id].giant.map((v) => v / d), others: sum[id].others.map((v) => v / d) }]))
      return { follow, fractions, mean, betweenShare: share / d, first, runs: done, wanted: runs }
    },
  }
}

// The same, all at once.
export function weakExperiment(follow, seed = WEAK_SEED, runs = WEAK_RUNS, options) {
  const job = weakJob(follow, seed, runs, options)
  for (const _ of job.iter);
  return job.snapshot()
}

// The largest piece when the fraction removed equals the share of links that
// join two groups (each network at its own share), averaged over the networks.
export function giantAtBetweenShare(follow, orderId, seed = WEAK_SEED, runs = WEAK_RUNS, options) {
  let sum = 0
  for (let r = 0; r < runs; r++) {
    const sample = weakSample(seedOf(seed, r), follow, options)
    sum += removalCurve(sample.net, sample.orders[orderId]).giant[sample.betweenLinks]
  }
  return sum / runs
}

// Mean overlap of the links in each tenth of the strengths, weakest first.
export function overlapByStrength(strength, overlap, bins = 10) {
  const order = Array.from(strength.keys()).sort((x, y) => strength[x] - strength[y])
  const out = []
  for (let b = 0; b < bins; b++) {
    const from = Math.floor((b * order.length) / bins)
    const to = Math.floor(((b + 1) * order.length) / bins)
    let so = 0
    let sw = 0
    for (let i = from; i < to; i++) {
      so += overlap[order[i]]
      sw += strength[order[i]]
    }
    const count = Math.max(1, to - from)
    out.push({ bin: b, strength: sw / count, overlap: so / count })
  }
  return out
}

// Pearson correlation between strength and overlap over the links.
export function correlation(x, y) {
  const m = x.length
  let sx = 0
  let sy = 0
  for (let i = 0; i < m; i++) {
    sx += x[i]
    sy += y[i]
  }
  sx /= m
  sy /= m
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < m; i++) {
    sxy += (x[i] - sx) * (y[i] - sy)
    sxx += (x[i] - sx) ** 2
    syy += (y[i] - sy) ** 2
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0
}

// Where the nodes are drawn: the groups on a circle, the members of each in a
// small disc (flat x0, y0, x1, y1, … in the unit square).
export function groupLayout() {
  const n = GROUPS * GROUP_SIZE
  const pos = new Float64Array(2 * n)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let v = 0; v < n; v++) {
    const g = Math.floor(v / GROUP_SIZE)
    const i = v % GROUP_SIZE
    const angle = (2 * Math.PI * g) / GROUPS - Math.PI / 2
    const r = 0.125 * Math.sqrt((i + 0.5) / GROUP_SIZE)
    pos[2 * v] = 0.5 + 0.37 * Math.cos(angle) + r * Math.cos(i * golden)
    pos[2 * v + 1] = 0.5 + 0.37 * Math.sin(angle) + r * Math.sin(i * golden)
  }
  return pos
}
