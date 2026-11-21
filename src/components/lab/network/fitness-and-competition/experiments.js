import { mulberry32 } from '../../rng.js'
import { tabulate, fitRecipe } from '../heavy-tails-done-right/fit.js'
import {
  seedOf, solveC, drawFitness, growFitness, fitnessSlopes, correlation, growOneAbove, condensateShare, oneAboveI, B_STAR,
  energyLevels, logSizes, ageingSteps, growAccelerating, adjacency, averageDistance, logSlope, accelGamma,
} from './fitness.js'

// Network Lab module 07: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-07.mjs.

const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

// P(K ≥ k) for every k that occurs, thinned to about `count` points evenly
// spread in log k.
export function ccdfThin(deg, from = 1, count = 120) {
  let max = 0
  for (const k of deg) if (k > max) max = k
  const c = new Float64Array(max + 1)
  for (const k of deg) c[k]++
  const pts = []
  let above = 0
  for (let k = max; k >= from; k--) {
    above += c[k]
    if (c[k] > 0) pts.push([k, above / deg.length])
  }
  pts.reverse()
  if (pts.length <= count) return pts
  const out = []
  const step = (Math.log(pts[pts.length - 1][0]) - Math.log(pts[0][0])) / count
  let next = -Infinity
  for (const p of pts)
    if (Math.log(p[0]) >= next) {
      out.push(p)
      next = Math.log(p[0]) + step
    }
  if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1])
  return out
}

// ---------------------------------------------------------------- Panel A: the fit get rich

export const FIT_SEED = 7000
export const FIT_RUNS = 20
export const FIT_M = 2
export const FIT_DEFAULT = { kind: 'uniform', N: 10000, scale: 0.2, share: 0.1, a: 0.5 }

export function distOf({ kind, scale, share, a }) {
  if (kind === 'exponential') return { kind, scale }
  if (kind === 'two') return { kind, share, a }
  return { kind }
}

// The six tracked nodes: the three oldest, the fittest, and the fittest node
// born between steps 10 and 99 and between 100 and 999 (the next fittest in
// that window if it is the fittest of all). Without repeats.
export function trackedNodes(eta, N) {
  let fittest = 0
  for (let v = 1; v < N; v++) if (eta[v] > eta[fittest]) fittest = v
  const best = (lo, hi, not) => {
    let b = -1
    for (let v = lo; v < Math.min(hi, N); v++) if (!not.includes(v) && (b < 0 || eta[v] > eta[b])) b = v
    return b
  }
  const out = [0, 1, 2]
  if (!out.includes(fittest)) out.push(fittest)
  const l1 = best(10, 100, out)
  if (l1 >= 0) out.push(l1)
  const l2 = best(100, 1000, out)
  if (l2 >= 0) out.push(l2)
  return { nodes: out, fittest, roles: out.map((v) => (v < 3 ? 'old' : v === fittest ? 'fittest' : 'late')) }
}

// One run of Panel A, with everything the panel shows.
export function fitnessRun(params, run = 0, seed = FIT_SEED) {
  const { N } = params
  const dist = distOf(params)
  const s = seedOf(seed, run)
  // the fitnesses first, to choose the tracked nodes
  const eta = drawAll(dist, N, s)
  const tracked = trackedNodes(eta, N)
  const sizes = logSizes(N, 60, 3)
  const net = growFitness({ N, m: FIT_M, eta, seed: seedOf(s, 1), track: tracked.nodes, sizes, half: true })
  const { C } = solveC(dist)
  const slopes = fitnessSlopes(net, C)
  const corrOf = (list) => (list.length > 2 && dist.kind !== 'equal' ? correlation(list.map((x) => x.theory), list.map((x) => x.slope)) : NaN)
  const early = fitnessSlopes(net, C, { bornBefore: 100 })
  return { net, dist, C, tracked, sizes, slopes, corr: corrOf(slopes), corrEarly: corrOf(early), ccdf: ccdfThin(net.deg, FIT_M) }
}

// Every node's fitness, from a generator of its own.
export function drawAll(dist, N, s) {
  const random = mulberry32(s)
  const eta = new Float64Array(N)
  for (let i = 0; i < N; i++) eta[i] = drawFitness(dist, random)
  return eta
}

// Twenty runs: is the final leader the fittest node, one of the ten oldest;
// how many nodes are fitter than it; how many times the lead changed hands.
export function fitnessJob(params, runs = FIT_RUNS, seed = FIT_SEED) {
  const out = []
  const dist = distOf(params)
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const s = seedOf(seed, r)
      const eta = drawAll(dist, params.N, s)
      const net = growFitness({ N: params.N, m: FIT_M, eta, seed: seedOf(s, 1) })
      out.push({ run: r, leader: net.leader, fittest: net.fittest, fitter: net.fitter, changes: net.changes, max: net.deg[net.leader], etaLeader: net.eta[net.leader] })
      yield (r + 1) / runs
    }
  }
  return { iter: iter(), snapshot: () => ({ params, runs: out.slice(), wanted: runs, summary: summariseFitness(out) }) }
}

export function summariseFitness(list) {
  if (!list.length) return null
  const fitter = list.map((x) => x.fitter)
  const changes = list.map((x) => x.changes)
  const born = list.map((x) => x.leader)
  return {
    count: list.length,
    // the leader has the highest fitness there is (no node is fitter)
    fittest: list.filter((x) => x.fitter === 0).length,
    oldest: list.filter((x) => x.leader < 10).length,
    fitterMedian: median(fitter),
    fitterMin: Math.min(...fitter),
    fitterMax: Math.max(...fitter),
    changesMedian: median(changes),
    changesMin: Math.min(...changes),
    changesMax: Math.max(...changes),
    bornMax: Math.max(...born),
  }
}

// ---------------------------------------------------------------- Panel B: one node above the rest

export const ONE_SEED = 7100
export const ONE_RUNS = 10
export const ONE_DEFAULT = { b: 0.5, N: 20000 }
export const ONE_BIG = 50000

export function oneTheory(b) {
  return { I: oneAboveI(b), share: condensateShare(b), condensed: b < B_STAR }
}

export function oneJob({ b, N }, runs = ONE_RUNS, seed = ONE_SEED) {
  const sizes = logSizes(N, 40, 100)
  const out = []
  let levels = null
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const x = growOneAbove({ N, b, seed: seedOf(seed, r), sizes })
      out.push(Array.from(x.share))
      if (r === 0) levels = energyLevels(x)
      yield (r + 1) / runs
    }
  }
  const snapshot = () => {
    const mean = out.length ? sizes.map((_, j) => out.reduce((s, sh) => s + sh[j], 0) / out.length) : null
    return { params: { b, N }, sizes, runs: out.slice(), wanted: runs, mean, levels, theory: oneTheory(b) }
  }
  return { iter: iter(), snapshot }
}

// ---------------------------------------------------------------- Panel C: age and density

export const AGE_SEED = 7200
export const AGE_DEFAULT = { nu: 0, N: 10000 }
export const AGE_MAX = 20000
export const AGE_DRAW = 300

export function ageingSummary(net) {
  let hub = 0
  for (let v = 1; v < net.n; v++) if (net.deg[v] > net.deg[hub]) hub = v
  const fit = fitRecipe(tabulate(net.deg))
  return { hub, max: net.deg[hub], share: net.deg[hub] / (net.n - 1), fit, ccdf: ccdfThin(net.deg, 1) }
}

export function ageingJob({ nu, N }, seed = AGE_SEED) {
  const net = {}
  let done = false
  let summary = null
  function* iter() {
    yield* ageingSteps({ N, nu, seed: seedOf(seed, 0), chunk: 100 }, net)
    summary = ageingSummary(net)
    done = true
  }
  return { iter: iter(), snapshot: () => ({ params: { nu, N }, done, net: done ? net : null, summary }) }
}

export const ACC_SEED = 7300
export const ACC_DEFAULT = { theta: 0.3, N: 10000 }
export const ACC_MAX = 20000
export const ACC_SOURCES = 20

export function accelJob({ theta, N }, seed = ACC_SEED) {
  let result = null
  function* iter() {
    const net = growAccelerating({ N, theta, seed: seedOf(seed, 0) })
    yield 0.4
    const pts = logSizes(N, 30, 100).map((s) => [s, net.linksAt[s]])
    const a = logSlope(pts)
    const adj = adjacency(net)
    const random = mulberry32(seedOf(seed, 1))
    const dSizes = logSizes(N, 8, 100)
    const dist = []
    for (let j = 0; j < dSizes.length; j++) {
      dist.push([dSizes[j], averageDistance(adj, dSizes[j], ACC_SOURCES, random)])
      yield 0.4 + (0.5 * (j + 1)) / dSizes.length
    }
    const fit = fitRecipe(tabulate(net.deg))
    let max = 0
    for (const k of net.deg) if (k > max) max = k
    result = { links: pts, a, dist, fit, max, L: net.A.length, mean: (2 * net.A.length) / N, ccdf: ccdfThin(net.deg, 1), theory: accelGamma(theta) }
  }
  return { iter: iter(), snapshot: () => ({ params: { theta, N }, done: !!result, result }) }
}

export const drain = (job) => {
  for (const _ of job.iter);
  return job.snapshot()
}
