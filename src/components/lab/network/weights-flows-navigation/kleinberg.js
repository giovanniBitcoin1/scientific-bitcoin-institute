import { mulberry32 } from '../../rng.js'

// Network Lab module 10: Kleinberg's lattice. An L × L torus; node i sits at
// x = i mod L, y = floor(i / L) and has its four lattice neighbours plus one
// long-range contact, drawn with probability ∝ r^(−α), r being the lattice
// distance (steps along the grid, around the torus). Plain functions, shared
// with scripts/lab/check-network-10.mjs.

export const wrapDist = (d, L) => (d <= L - d ? d : L - d)

export function torusDistance(L, a, b) {
  const dx = Math.abs((a % L) - (b % L))
  const dy = Math.abs(Math.floor(a / L) - Math.floor(b / L))
  return wrapDist(dx, L) + wrapDist(dy, L)
}

// Cumulative weights r^(−α) over the L² − 1 offsets (dx, dy) ≠ (0, 0). On a
// torus the table is the same for every node, so it is built once per α.
export function offsetTable(L, alpha) {
  const cum = new Float64Array(L * L)
  const byR = new Float64Array(L + 1)
  for (let r = 1; r <= L; r++) byR[r] = Math.pow(r, -alpha)
  let total = 0
  for (let dy = 0; dy < L; dy++) {
    const ry = wrapDist(dy, L)
    for (let dx = 0; dx < L; dx++) {
      const r = ry + wrapDist(dx, L)
      if (r > 0) total += byR[r]
      cum[dy * L + dx] = total
    }
  }
  return { L, alpha, cum, total }
}

// One offset from the table: the first index whose cumulative weight exceeds u.
export function drawOffset(table, random) {
  const { cum, total } = table
  const u = random() * total
  let lo = 0
  let hi = cum.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cum[mid] > u) hi = mid
    else lo = mid + 1
  }
  return lo
}

// The exact probability that a long-range contact lies at distance r.
export function distanceLaw(L, alpha) {
  const p = new Float64Array(L + 1)
  let total = 0
  for (let dy = 0; dy < L; dy++)
    for (let dx = 0; dx < L; dx++) {
      const r = wrapDist(dy, L) + wrapDist(dx, L)
      if (r > 0) {
        const w = Math.pow(r, -alpha)
        p[r] += w
        total += w
      }
    }
  return p.map((x) => x / total)
}

// long[i] = the long-range contact of node i.
export function buildLattice(L, alpha, seed) {
  const table = offsetTable(L, alpha)
  const random = mulberry32(seed)
  const long = new Int32Array(L * L)
  for (let i = 0; i < L * L; i++) {
    const o = drawOffset(table, random)
    const x = ((i % L) + (o % L)) % L
    const y = (Math.floor(i / L) + Math.floor(o / L)) % L
    long[i] = y * L + x
  }
  return { L, alpha, long }
}

// Greedy routing: the message goes to whichever of the five contacts of its
// holder is closest to the target (a lattice neighbour when the long-range
// contact is no closer). A lattice neighbour is always one step closer, so the
// message always arrives. Returns the number of steps; with `path`, the nodes
// visited are pushed onto it.
export function greedyRoute(lat, s, t, path = null) {
  const { L, long } = lat
  const tx = t % L
  const ty = Math.floor(t / L)
  let x = s % L
  let y = Math.floor(s / L)
  let steps = 0
  if (path) path.push(s)
  while (x !== tx || y !== ty) {
    const ddx = (tx - x + L) % L
    const ddy = (ty - y + L) % L
    const d = wrapDist(ddx, L) + wrapDist(ddy, L)
    const far = long[y * L + x]
    const fx = far % L
    const fy = Math.floor(far / L)
    const dFar = wrapDist(Math.abs(fx - tx), L) + wrapDist(Math.abs(fy - ty), L)
    if (dFar < d - 1) {
      x = fx
      y = fy
    } else if (ddx !== 0) {
      x = ddx <= L - ddx ? (x + 1) % L : (x + L - 1) % L
    } else {
      y = ddy <= L - ddy ? (y + 1) % L : (y + L - 1) % L
    }
    steps++
    if (path) path.push(y * L + x)
  }
  return steps
}

export function randomPairs(L, count, seed) {
  const random = mulberry32(seed)
  const n = L * L
  const pairs = []
  while (pairs.length < count) {
    const s = Math.floor(random() * n)
    const t = Math.floor(random() * n)
    if (s !== t) pairs.push([s, t])
  }
  return pairs
}

export function routeStats(lat, pairs) {
  const steps = pairs.map(([s, t]) => greedyRoute(lat, s, t))
  const sorted = [...steps].sort((a, b) => a - b)
  const h = sorted.length >> 1
  const median = sorted.length % 2 ? sorted[h] : (sorted[h - 1] + sorted[h]) / 2
  const lattice = pairs.reduce((a, [s, t]) => a + torusDistance(lat.L, s, t), 0) / pairs.length
  return { mean: steps.reduce((a, b) => a + b, 0) / steps.length, median, lattice, steps }
}
