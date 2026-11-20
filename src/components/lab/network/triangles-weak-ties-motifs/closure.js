import { erdosRenyiGnm } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { overlap, triangleStats, distanceStats } from './overlap.js'

// Panel A, "Close the triangle": a sparse random network that grows one link
// at a time. With probability p the new link joins two neighbours of a random
// node who are not yet linked (a triangle closes); otherwise it joins two
// random nodes. Pure logic, shared by the panel and by
// scripts/lab/check-network-04.mjs.

export const CLOSURE_N = 200
export const START_LINKS = 200
export const END_LINKS = 800
export const CLOSURE_SEED = 11
export const RECORD_EVERY = 20 // links between two points of the curves
const TRIES = 200

export function closureRun(p, seed = CLOSURE_SEED, { n = CLOSURE_N, startLinks = START_LINKS, endLinks = END_LINKS } = {}) {
  const adj = Array.from({ length: n }, () => new Set())
  const lists = Array.from({ length: n }, () => [])
  const A = []
  const B = []
  const add = (a, b) => {
    adj[a].add(b)
    adj[b].add(a)
    lists[a].push(b)
    lists[b].push(a)
    A.push(a)
    B.push(b)
  }
  const start = erdosRenyiGnm(n, startLinks, seed)
  for (let e = 0; e < start.A.length; e++) add(start.A[e], start.B[e])
  const random = mulberry32((seed ^ 0x51ed270b) >>> 0)
  const pick = (k) => Math.floor(random() * k)
  let closed = 0
  let last = null

  // Adds one link; returns it, or null when the run is over.
  function step() {
    if (A.length >= endLinks) return null
    if (random() < p) {
      for (let t = 0; t < TRIES; t++) {
        const v = pick(n)
        const nb = lists[v]
        if (nb.length < 2) continue
        const a = nb[pick(nb.length)]
        const b = nb[pick(nb.length)]
        if (a === b || adj[a].has(b)) continue
        add(a, b)
        closed++
        last = { a, b, via: v }
        return last
      }
      // No open pair found: the link falls back to a random one.
    }
    for (;;) {
      const a = pick(n)
      const b = pick(n)
      if (a === b || adj[a].has(b)) continue
      add(a, b)
      last = { a, b, via: -1 }
      return last
    }
  }

  return {
    n,
    adj,
    A,
    B,
    step,
    get links() {
      return A.length
    },
    get closed() {
      return closed
    },
    get last() {
      return last
    },
    get done() {
      return A.length >= endLinks
    },
  }
}

// What the panel reads off a run at this moment.
export function closureStats(run) {
  const tri = triangleStats(run.adj)
  const dist = distanceStats(run.adj)
  const L = run.A.length
  let local = 0
  for (let e = 0; e < L; e++) if (overlap(run.adj, run.A[e], run.B[e]).common === 0) local++
  return {
    links: L,
    density: (2 * L) / (run.n * (run.n - 1)),
    transitivity: tri.transitivity,
    clustering: tri.avgClustering,
    triangles: tri.triangles,
    distance: dist.avgDistance,
    giant: dist.giant,
    pieces: dist.pieces,
    localBridges: L ? local / L : 0,
  }
}

// A whole run at once: the statistics every RECORD_EVERY links, first and
// last moments included.
export function closureCurve(p, seed = CLOSURE_SEED, options) {
  const run = closureRun(p, seed, options)
  const points = [closureStats(run)]
  while (run.step()) if ((run.links - points[0].links) % RECORD_EVERY === 0 || run.done) points.push(closureStats(run))
  return { run, points, final: points[points.length - 1] }
}
