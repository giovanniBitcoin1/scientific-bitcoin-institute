import { mulberry32 } from '../../rng.js'
import { buildCSR } from '../../graphUtils.js'
import { seedOf } from '../robustness-and-cascades/robust.js'
import { spreadSI } from '../what-are-we-measuring/friends.js'
import { outbreakFrom, squareLattice, cumulative, edgeTime, logLogSlope } from './epidemic.js'

// Network Lab module 12: the fixed data and the logic of the two live figures.

// ---------------------------------------------------------------- F1, "One seed, many futures"

export const F1_N = 80
export const F1_SEED = 1201
export const F1_T = 0.5
export const F1_RUNS = 200
export const F1_BIG = 0.25 // "large": more than a quarter of the nodes
export const F1_BINS = 10

// A network of 80 nodes with a few hubs: it grows one node at a time, and
// each newcomer brings one link or two (equally likely) to older nodes chosen
// in proportion to their degree. So there are nodes with a single link.
export function seedNet() {
  const random = mulberry32(F1_SEED)
  const A = [1]
  const B = [0]
  const ends = [1, 0]
  for (let v = 2; v < F1_N; v++) {
    const m = random() < 0.5 ? 1 : 2
    const chosen = []
    while (chosen.length < m) {
      const u = ends[Math.floor(random() * ends.length)]
      if (!chosen.includes(u)) chosen.push(u)
    }
    for (const u of chosen) {
      A.push(v)
      B.push(u)
      ends.push(v, u)
    }
  }
  const net = { n: F1_N, A: Int32Array.from(A), B: Int32Array.from(B) }
  const g = buildCSR(net.n, net.A, net.B)
  const k = Array.from({ length: net.n }, (_, v) => g.offsets[v + 1] - g.offsets[v])
  let hub = 0
  for (let v = 1; v < net.n; v++) if (k[v] > k[hub]) hub = v
  // the default seed of the figure: the first node with a single link
  const leaf = k.findIndex((d) => d === 1)
  return { ...net, g, k, hub, leaf }
}

// 200 outbreaks from one seed at T = 0.5 (batch 0, 1, … for repeated presses):
// the sizes in ten classes of eight nodes, and the share above a quarter.
export function seedOutbreaks(net, seed, batch = 0, runs = F1_RUNS) {
  const random = mulberry32(seedOf(F1_SEED, 1000 * seed + batch))
  const bins = new Array(F1_BINS).fill(0)
  const ws = {}
  let big = 0
  let sum = 0
  for (let r = 0; r < runs; r++) {
    const size = outbreakFrom(net.g, seed, F1_T, random, ws)
    bins[Math.min(F1_BINS - 1, Math.floor(((size - 1) / net.n) * F1_BINS))]++
    if (size > F1_BIG * net.n) big++
    sum += size
  }
  return { seed, batch, runs, bins, big: big / runs, mean: sum / runs }
}

// ---------------------------------------------------------------- F2, "Exponential or power law?"

export const F2_SEED = 1202

// SI with everyone in contact: dI/dt = r I (1 − I/N), from one case.
export const MIX = { N: 10000, r: 0.5, tMax: 40 }
export function mixingCurve() {
  const out = []
  for (let i = 0; i <= 160; i++) {
    const t = (MIX.tMax * i) / 160
    out.push([t, MIX.N / (1 + (MIX.N - 1) * Math.exp(-MIX.r * t))])
  }
  return out
}

// SI on a square lattice from its centre, one run, up to the step at which
// the infection first touches the edge.
export const LAT = { L: 151, beta: 0.3 }
export function latticeCurve() {
  const net = squareLattice(LAT.L)
  const g = buildCSR(net.n, net.A, net.B)
  const centre = Math.floor(LAT.L / 2) * (LAT.L + 1)
  const run = spreadSI(g, centre, LAT.beta, mulberry32(F2_SEED))
  const edge = edgeTime(run.when, LAT.L)
  const cum = cumulative(run.when, edge)
  const points = Array.from(cum, (c, t) => [t, c]).slice(1)
  return { points, edge, slope: logLogSlope(points.filter(([t]) => t >= edge / 4)) }
}

// A ladder of groups: group k has m0 a^k members and is reached at time
// t0 b^k; each fills as an S-curve in the logarithm of time,
// m / (1 + (t_k / t)^p), so that every group takes the same share of its own
// arrival time to fill. (p must exceed ln a / ln b, or the groups still to
// come would outweigh the ones already reached: 12 is ample for the sliders.)
export const LADDER = { m0: 1, t0: 1, p: 12, groups: 40, a: 8, b: 2, shown: 8 }
export function ladderAt(t, a, b, groups = LADDER.groups) {
  let s = 0
  for (let k = 0; k < groups; k++) s += (LADDER.m0 * a ** k) / (1 + ((LADDER.t0 * b ** k) / t) ** LADDER.p)
  return s
}
export const ladderExponent = (a, b) => Math.log(a) / Math.log(b)

// The curve over the first `shown` rungs, evenly spaced in log t.
export function ladderCurve(a, b, shown = LADDER.shown) {
  const out = []
  const per = 30
  for (let i = -per / 2; i <= shown * per; i++) {
    const t = LADDER.t0 * b ** (i / per)
    out.push([t, ladderAt(t, a, b)])
  }
  return out
}

// The slope on log-log axes fitted over `periods` whole rungs, well inside
// the ladder.
export function ladderSlope(a, b, periods = 20) {
  const points = []
  const per = 40
  for (let i = 0; i < periods * per; i++) {
    const t = LADDER.t0 * b ** (5 + i / per)
    points.push([t, ladderAt(t, a, b)])
  }
  return logLogSlope(points)
}
