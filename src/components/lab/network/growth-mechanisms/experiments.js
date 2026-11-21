import { growKernel, grow, ccdf, hubStats, leaderSettles } from './growth.js'
import { measure } from './kernel.js'
import { tabulate, fitRecipe } from '../heavy-tails-done-right/fit.js'

// Network Lab module 06: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-06.mjs.

export const seedOf = (seed, i) => (seed + Math.imul(i + 1, 0x9e3779b1)) >>> 0

// ---------------------------------------------------------------- Panel A: rerun history

export const HISTORY_SEED = 6000
export const HISTORY_RUNS = 20
export const HISTORY_DEFAULT = { alpha: 1, A: 0, m: 2, N: 5000 }

// One run of Panel A: the network, its leader history and the numbers shown.
export function historyRun(params, run = 0, seed = HISTORY_SEED) {
  const net = growKernel({ ...params, seed: seedOf(seed, run), track: true })
  const h = hubStats(net.deg)
  const tenth = Math.max(params.m + 1, Math.floor(params.N / 10))
  return {
    net,
    run,
    hub: h.hub,
    max: h.max,
    share: h.share,
    ratio: h.ratio,
    leaderAtTenth: net.leaderAt[tenth - 1],
    settles: leaderSettles(net.leaderAt),
  }
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}

// The twenty runs. Each yields its CCDF (thinned to at most ~120 points), the
// birth index of its biggest hub and the share of nodes linked to it.
export function historyJob(params, runs = HISTORY_RUNS, seed = HISTORY_SEED) {
  const out = []
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const x = historyRun(params, r, seed)
      out.push({ run: r, hub: x.hub, max: x.max, share: x.share, sameLeader: x.leaderAtTenth === x.hub, settles: x.settles, ccdf: thin(ccdf(x.net.deg, 1)) })
      yield (r + 1) / runs
    }
  }
  return { iter: iter(), snapshot: () => ({ params, runs: out.slice(), wanted: runs, summary: summarise(out) }) }
}

export function summarise(list) {
  if (!list.length) return null
  const hubs = list.map((x) => x.hub)
  const shares = list.map((x) => x.share)
  return {
    count: list.length,
    hubMedian: median(hubs),
    hubMin: Math.min(...hubs),
    hubMax: Math.max(...hubs),
    shareMedian: median(shares),
    shareMin: Math.min(...shares),
    shareMax: Math.max(...shares),
    firstTen: hubs.filter((v) => v < 10).length,
    sameLeader: list.filter((x) => x.sameLeader).length,
  }
}

// At most about `points` points of a CCDF, evenly spread in log k.
export function thin(points, count = 120) {
  if (points.length <= count) return points
  const out = []
  const lo = Math.log(points[0][0])
  const hi = Math.log(points[points.length - 1][0])
  let next = lo
  const step = (hi - lo) / count
  for (const p of points) {
    if (Math.log(p[0]) >= next) {
      out.push(p)
      next = Math.log(p[0]) + step
    }
  }
  if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1])
  return out
}

// ---------------------------------------------------------------- Panel B: who needs to know the degrees?

export const MECH_SEED = 6100
export const MECH_DEFAULT = { N: 20000, m: 2, p: 0.5, steps: 1, delta: 10, optN: 5000 }

// One mechanism: its network, the degree CCDF (in-degrees for copying), the
// hub, and the kernel exponent by maximum likelihood over the last fifth of
// the growth (the first snapshot at 0.8 N). For copying, also the module-05
// fit of the in-degree tail (values ≥ 1).
export function mechanism(id, params = {}) {
  const P = { ...MECH_DEFAULT, ...params }
  const N = id === 'optimisation' ? P.optN : P.N
  const net = grow(id, { ...P, N, seed: MECH_SEED })
  const deg = id === 'copying' ? net.inDeg : net.deg
  const hubDeg = hubStats(deg)
  const kernel = measure(net, Math.floor(0.8 * N), N).mle
  let tail = null
  if (id === 'copying') {
    const values = Array.from(net.inDeg).filter((q) => q >= 1)
    const fit = fitRecipe(tabulate(values))
    const a = (P.m * P.p) / (1 - P.p)
    tail = { fit, theory: (2 - P.p) / (1 - P.p), a }
  }
  return {
    id,
    N,
    net,
    ccdf: thin(ccdf(deg, 1)),
    max: hubDeg.max,
    hub: hubDeg.hub,
    // the other nodes linked to the hub (for copying, the distinct nodes that
    // link to it: a node may link to the same target twice)
    share: (id === 'copying' ? linkedTo(net, hubDeg.hub) : hubDeg.max) / (N - 1),
    ratio: hubDeg.ratio,
    kernel,
    tail,
  }
}

function linkedTo(net, v) {
  const seen = new Set()
  for (let e = 0; e < net.A.length; e++) if (net.B[e] === v && net.A[e] !== v) seen.add(net.A[e])
  return seen.size
}

// ---------------------------------------------------------------- Panel C: measure the attachment rule

export const KERNEL_SEED = 6200
export const KERNEL_DEFAULT = { source: 'kernel', alpha: 1, N1: 5000, dN: 1000 }
export const KERNEL_RUNS = 20
export const KERNEL_SOURCES = ['kernel', 'linkSelection', 'copying', 'walk', 'optimisation']
const SOURCE_PARAMS = { kernel: {}, linkSelection: {}, copying: { p: 0.5 }, walk: { steps: 1 }, optimisation: { delta: 10 } }

export function kernelNetwork({ source, alpha, N1, dN }, run = 0, seed = KERNEL_SEED) {
  const N = N1 + dN
  return grow(source, { N, m: source === 'optimisation' ? 1 : 2, alpha, A: 0, ...SOURCE_PARAMS[source], seed: seedOf(seed, run) })
}

export function kernelRun(params, run = 0, seed = KERNEL_SEED) {
  const net = kernelNetwork(params, run, seed)
  return { net, ...measure(net, params.N1, params.N1 + params.dN) }
}

// Both estimates on KERNEL_RUNS networks.
export function kernelJob(params, runs = KERNEL_RUNS, seed = KERNEL_SEED) {
  const out = []
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const x = kernelRun(params, r, seed)
      out.push({ cumulative: x.cumulative.alpha, cumulativeAll: x.cumulative.alphaAll, mle: x.mle.alpha, se: x.mle.se })
      yield (r + 1) / runs
    }
  }
  const stats = (key) => {
    // networks with no estimate (every link to one hub) are left out; `count` says how many remain
    const v = out.map((x) => x[key]).filter(Number.isFinite)
    if (!v.length) return { mean: NaN, sd: NaN, min: NaN, max: NaN, count: 0 }
    const mean = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length)
    const sd = v.length > 1 ? Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (v.length - 1)) : NaN
    return { mean, sd, min: Math.min(...v), max: Math.max(...v), count: v.length }
  }
  return {
    iter: iter(),
    snapshot: () => ({ params, done: out.length, wanted: runs, cumulative: out.length ? stats('cumulative') : null, cumulativeAll: out.length ? stats('cumulativeAll') : null, mle: out.length ? stats('mle') : null, se: out.length ? stats('se') : null }),
  }
}
