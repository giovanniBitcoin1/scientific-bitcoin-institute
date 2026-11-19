import { mulberry32 } from './rng.js'

// Site percolation on an L × L square lattice with open (non-wrapping)
// boundaries. Site i = y·L + x is open with probability p; open sites that
// share a side belong to the same cluster. A cluster spans when it touches
// both the top row and the bottom row.
//
// Clusters are kept in a union–find structure (Newman & Ziff, 2000): parent[i]
// points towards the root of i's cluster, and a root holds minus its size.
// Opening sites one at a time and merging with open neighbours costs almost
// nothing per site, so a single pass sweeps every p from 0 to 1.

const CLOSED = 0x7fffffff // parent value of a closed site
const TOP = 1
const BOTTOM = 2

// ---------------------------------------------------------------- Random grids

// One uniform number per site. The grid at probability p is { i : u[i] < p },
// so for a fixed seed raising p only ever opens more sites.
export function siteValues(L, seed) {
  const random = mulberry32(seed)
  const u = new Float64Array(L * L)
  for (let i = 0; i < u.length; i++) u[i] = random()
  return u
}

export function siteGrid(L, p, seed) {
  const u = siteValues(L, seed)
  const open = new Uint8Array(L * L)
  for (let i = 0; i < u.length; i++) open[i] = u[i] < p ? 1 : 0
  return open
}

// Sites in increasing order of their value: the order in which a sweep of p
// opens them.
export function openingOrder(u) {
  return Int32Array.from(u.keys()).sort((a, b) => u[a] - u[b])
}

// A random permutation of the L² sites (Fisher–Yates).
export function randomOrder(N, random) {
  const order = new Int32Array(N)
  for (let i = 0; i < N; i++) order[i] = i
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  return order
}

// ---------------------------------------------------------------- Union–find

export function createPercolation(L) {
  const N = L * L
  return {
    L,
    N,
    parent: new Int32Array(N).fill(CLOSED),
    edge: new Uint8Array(N), // TOP | BOTTOM flags, valid at roots
    open: 0, // number of open sites
    clusters: 0,
    largest: 0, // size of the largest cluster
    largestRoot: -1,
    spanRoot: -1, // root of a spanning cluster, or -1
    spanAt: 0, // number of open sites when a cluster first spanned
  }
}

export function findRoot(st, i) {
  const parent = st.parent
  let r = i
  while (parent[r] >= 0) r = parent[r]
  // Path halving keeps later searches short.
  while (parent[i] >= 0 && parent[i] !== r) {
    const next = parent[i]
    parent[i] = r
    i = next
  }
  return r
}

export const isOpen = (st, i) => st.parent[i] !== CLOSED

function merge(st, a, b) {
  const parent = st.parent
  let ra = findRoot(st, a)
  let rb = findRoot(st, b)
  if (ra === rb) return ra
  // The smaller cluster joins the larger one.
  if (parent[ra] > parent[rb]) {
    const t = ra
    ra = rb
    rb = t
  }
  parent[ra] += parent[rb]
  parent[rb] = ra
  st.edge[ra] |= st.edge[rb]
  st.clusters--
  return ra
}

// Opens site i and merges it with its open neighbours.
export function openSite(st, i) {
  const { L, parent } = st
  if (parent[i] !== CLOSED) return
  parent[i] = -1
  st.open++
  st.clusters++
  const y = (i / L) | 0
  const x = i - y * L
  st.edge[i] = (y === 0 ? TOP : 0) | (y === L - 1 ? BOTTOM : 0)
  let r = i
  if (x > 0 && parent[i - 1] !== CLOSED) r = merge(st, r, i - 1)
  if (x < L - 1 && parent[i + 1] !== CLOSED) r = merge(st, r, i + 1)
  if (y > 0 && parent[i - L] !== CLOSED) r = merge(st, r, i - L)
  if (y < L - 1 && parent[i + L] !== CLOSED) r = merge(st, r, i + L)
  r = findRoot(st, r)
  const size = -parent[r]
  // Clusters only grow, so the largest is either unchanged or the one just touched.
  if (size >= st.largest) {
    st.largest = size
    st.largestRoot = r
  }
  if (st.spanRoot < 0 && st.edge[r] === (TOP | BOTTOM)) {
    st.spanRoot = r
    st.spanAt = st.open
  }
}

// Size of the cluster containing site i (0 if closed).
export function clusterSize(st, i) {
  return isOpen(st, i) ? -st.parent[findRoot(st, i)] : 0
}

// The grid at probability p for site values u, built by opening every site
// with u[i] < p.
export function percolationAt(u, L, p) {
  const st = createPercolation(L)
  for (let i = 0; i < u.length; i++) if (u[i] < p) openSite(st, i)
  return st
}

// ---------------------------------------------------------------- Labels

// Cluster label for every site: the root index, or -1 for a closed site. Also
// returns the sizes by root, the number of clusters, the largest one and
// whether some cluster spans top to bottom.
export function labelClusters(open, L) {
  const st = createPercolation(L)
  for (let i = 0; i < open.length; i++) if (open[i]) openSite(st, i)
  const label = new Int32Array(L * L)
  for (let i = 0; i < label.length; i++) label[i] = open[i] ? findRoot(st, i) : -1
  const spanning = st.spanRoot >= 0 ? findRoot(st, st.spanRoot) : -1
  return {
    label,
    count: st.clusters,
    largestRoot: st.largestRoot >= 0 ? findRoot(st, st.largestRoot) : -1,
    largestSize: st.largest,
    spanning,
    sizeOf: (root) => -st.parent[root],
  }
}

export const spans = (open, L) => labelClusters(open, L).spanning >= 0

export const largestFraction = (open, L) => labelClusters(open, L).largestSize / (L * L)

// ---------------------------------------------------------------- Pouring

// Breadth-first flood from every open site of the top row: the order in which
// a fluid poured on top wets the open sites, layer by layer. `layers[k]` is
// the index in `order` where layer k starts (layer 0 is the top row);
// `bottom` is the layer that first reaches the bottom row, or -1.
export function pourFromTop(isOpenAt, L) {
  const N = L * L
  const seen = new Uint8Array(N)
  const order = new Int32Array(N)
  const layers = [0]
  let head = 0
  let tail = 0
  for (let x = 0; x < L; x++) {
    if (isOpenAt(x)) {
      seen[x] = 1
      order[tail++] = x
    }
  }
  let bottom = L === 1 && tail > 0 ? 0 : -1
  while (head < tail) {
    const end = tail
    layers.push(end)
    for (; head < end; head++) {
      const i = order[head]
      const y = (i / L) | 0
      const x = i - y * L
      const visit = (j) => {
        if (!seen[j] && isOpenAt(j)) {
          seen[j] = 1
          order[tail++] = j
          if (bottom < 0 && j >= N - L) bottom = layers.length - 1
        }
      }
      if (x > 0) visit(i - 1)
      if (x < L - 1) visit(i + 1)
      if (y > 0) visit(i - L)
      if (y < L - 1) visit(i + L)
    }
  }
  return { order: order.subarray(0, tail), layers, bottom }
}

// ---------------------------------------------------------------- Newman–Ziff

// One sweep: sites open in random order. Returns the number of open sites at
// which a cluster first spans, and the size of the largest cluster after each
// number n = 0 … N of open sites.
export function newmanZiffRun(L, random) {
  const st = createPercolation(L)
  const order = randomOrder(st.N, random)
  const largest = new Int32Array(st.N + 1)
  for (let n = 0; n < st.N; n++) {
    openSite(st, order[n])
    largest[n + 1] = st.largest
  }
  return { spanAt: st.spanAt, largest }
}

// Converts an average over runs with exactly n open sites (n = 0 … N) into
// the average at probability p, where the number of open sites is binomial:
// Q(p) = Σₙ C(N, n) pⁿ (1 − p)^(N − n) Qₙ. Returns one value per p in `ps`.
export function binomialSmooth(Qn, N, ps) {
  const lgamma = logFactorials(N)
  return ps.map((p) => {
    if (p <= 0) return Qn[0]
    if (p >= 1) return Qn[N]
    const mean = N * p
    const sd = Math.sqrt(N * p * (1 - p))
    const lo = Math.max(0, Math.floor(mean - 10 * sd - 1))
    const hi = Math.min(N, Math.ceil(mean + 10 * sd + 1))
    const lp = Math.log(p)
    const lq = Math.log(1 - p)
    let sum = 0
    let wsum = 0
    for (let n = lo; n <= hi; n++) {
      const w = Math.exp(lgamma[N] - lgamma[n] - lgamma[N - n] + n * lp + (N - n) * lq)
      sum += w * Qn[n]
      wsum += w
    }
    return sum / wsum
  })
}

const factorialCache = new Map()
function logFactorials(N) {
  let f = factorialCache.get(N)
  if (!f) {
    f = new Float64Array(N + 1)
    for (let n = 1; n <= N; n++) f[n] = f[n - 1] + Math.log(n)
    factorialCache.set(N, f)
  }
  return f
}

// Where two curves sampled at the same points cross, by linear interpolation
// between the samples on either side of a sign change of a − b. Far from the
// transition both curves sit at 0 or 1 and their difference is noise, so of
// all sign changes the one where the curves are closest to ½ is returned, or
// null if they never cross.
export function crossing(xs, a, b) {
  let best = null
  let bestDist = Infinity
  for (let k = 1; k < xs.length; k++) {
    const d0 = a[k - 1] - b[k - 1]
    const d1 = a[k] - b[k]
    if (!(d0 * d1 < 0)) continue
    const x = xs[k - 1] + ((xs[k] - xs[k - 1]) * d0) / (d0 - d1)
    const dist = Math.abs((a[k] + b[k] + a[k - 1] + b[k - 1]) / 4 - 0.5)
    if (dist < bestDist) {
      bestDist = dist
      best = x
    }
  }
  return best
}

export const P_C_SITE = 0.592746
