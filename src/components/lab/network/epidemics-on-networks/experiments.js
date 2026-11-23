import { mulberry32 } from '../../rng.js'
import { buildCSR } from '../../graphUtils.js'
import { makeSource, randomOrder, attackOrder, degreesOf } from '../who-connects-to-whom/mixing.js'
import { seedOf, moments, largestComponent } from '../robustness-and-cascades/robust.js'
import { spreadSI } from '../what-are-we-measuring/friends.js'
import {
  thresholdT, thresholdSIS, empiricalFamily, outbreakTheory, bondPercolation, outbreakFrom, spread, transmissibility, cumulative, timeTo,
  squareLattice, edgeTime, logLogSlope, sisIter, acquaintanceOrder, degreePrefix, immuneShare,
} from './epidemic.js'

// Network Lab module 12: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-12.mjs.

export { drain } from '../robustness-and-cascades/robust.js'

export const MEAN_K = 4
export const KMIN = 2 // the power-law configuration model starts at k = 2
export const LARGE = 0.01 // an outbreak is "large" above 1% of N
const paM = MEAN_K / 2

// A network of the module with everything the panels read from it. The random
// network and the power-law one are configuration models, so the generating
// functions of their degrees give the theory; preferential attachment is not.
export function makeNet(base, { source, N, gamma = 2.5 }) {
  const j = N + 10000000 * Math.round(gamma * 10) + ['poisson', 'pa', 'power'].indexOf(source)
  const net = makeSource({ source, N, m: paM, gamma, kMin: KMIN, meanK: MEAN_K, seed: seedOf(base, j) })
  const k = degreesOf(net)
  const mo = moments(k)
  const config = source !== 'pa'
  return {
    source, N, gamma, net, g: buildCSR(net.n, net.A, net.B), k, n: net.n, links: net.A.length,
    mean: mo.mean, mean2: mo.mean2, Tc: thresholdT(mo.mean, mo.mean2), sis: thresholdSIS(mo.mean, mo.mean2),
    config, fam: config ? empiricalFamily(k) : null,
  }
}

// ---------------------------------------------------------------- Panel A

export const A_SEED = 12001
export const A_DEFAULT = { source: 'poisson', N: 10000, gamma: 2.5, T: 0.5 }
export const A_SOURCES = ['poisson', 'pa', 'power']
export const A_SIZES = [1000, 2000, 5000, 10000, 20000]
export const A_RUNS = 10
export const A_STEP = 0.01
export const A_TRIALS = 1000
export const A_BINS = 20
export const A_MAX_K = 20 // degrees shown in the chart of seeds
export const A_MIN_SEEDS = 10 // a degree is shown when at least this many seeds had it

export const netA = (params) => makeNet(A_SEED, params)

// SIR by percolation: for T = 0, 0.01, …, 1, the largest component as a share
// of N, mean of 10 percolations.
export function sweepJob(on, runs = A_RUNS, step = A_STEP) {
  const rows = []
  const count = Math.round(1 / step)
  const random = mulberry32(seedOf(A_SEED, 300 + on.n))
  const ws = {}
  function* iter() {
    for (let i = 0; i <= count; i++) {
      const T = i / count
      let s = 0
      for (let r = 0; r < runs; r++) {
        s += bondPercolation(on.net, T, random, null, ws)
        if (r % 3 === 2) yield (i + r / runs) / (count + 1)
      }
      rows.push({ T, share: s / runs / on.n })
      yield rows.length / (count + 1)
    }
  }
  return { iter: iter(), snapshot: () => ({ n: on.n, source: on.source, gamma: on.gamma, rows: rows.slice(), done: rows.length === count + 1 }) }
}

export function theoryCurve(on, step = A_STEP) {
  if (!on.config) return null
  const count = Math.round(1 / step)
  return Array.from({ length: count + 1 }, (_, i) => [i / count, outbreakTheory(on.fam, i / count).S])
}

// 1,000 outbreaks at one T, each from a seed drawn at random: their sizes, and
// how many were large, by the degree of the seed.
export function seedsJob(on, T, trials = A_TRIALS) {
  const random = mulberry32(seedOf(A_SEED, 700 + on.n + Math.round(T * 1000)))
  const bins = new Int32Array(A_BINS)
  const byK = new Map()
  const ws = {}
  let done = 0
  let large = 0
  let sumLarge = 0
  let sumSmall = 0
  let maxSmall = 0
  function* iter() {
    for (let i = 0; i < trials; i++) {
      const seed = Math.floor(random() * on.n)
      const size = outbreakFrom(on.g, seed, T, random, ws)
      const share = size / on.n
      bins[Math.min(A_BINS - 1, Math.floor(share * A_BINS))]++
      const row = byK.get(on.k[seed]) || { k: on.k[seed], seeds: 0, large: 0 }
      row.seeds++
      if (share > LARGE) {
        large++
        sumLarge += share
        row.large++
      } else {
        sumSmall += size
        if (size > maxSmall) maxSmall = size
      }
      byK.set(on.k[seed], row)
      done++
      if (i % 10 === 9) yield done / trials
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({
      n: on.n, source: on.source, gamma: on.gamma, T, trials: done,
      bins: Array.from(bins, (b) => b / (done || 1)),
      large: large / (done || 1),
      meanLarge: large ? sumLarge / large : NaN,
      meanSmall: done > large ? sumSmall / (done - large) : NaN,
      maxSmall,
      byK: [...byK.values()].sort((a, b) => a.k - b.k),
      done: done === trials,
    }),
  }
}

// The same question asked degree by degree, for the self-check: `trials`
// outbreaks from seeds of degree k drawn at random.
export function seedsOfDegree(on, T, degree, trials, random, ws = {}) {
  const pool = []
  for (let v = 0; v < on.n; v++) if (on.k[v] === degree) pool.push(v)
  if (!pool.length) return NaN
  let large = 0
  for (let i = 0; i < trials; i++) if (outbreakFrom(on.g, pool[Math.floor(random() * pool.length)], T, random, ws) > LARGE * on.n) large++
  return large / trials
}

// SIS: the share infected after a long run, against β/μ.
export const SIS_MU = 0.2
export const SIS_STEPS = 400
export const SIS_TAIL = 150
export const SIS_LAMBDAS = Array.from({ length: 26 }, (_, i) => i / 50)

export function sisJob(on, lambdas = SIS_LAMBDAS) {
  const rows = []
  const random = mulberry32(seedOf(A_SEED, 900 + on.n))
  function* iter() {
    for (const lambda of lambdas) {
      const it = sisIter(on.g, lambda * SIS_MU, SIS_MU, random, { steps: SIS_STEPS, tail: SIS_TAIL })
      let r = it.next()
      while (!r.done) {
        yield (rows.length + r.value) / lambdas.length
        r = it.next()
      }
      rows.push({ lambda, prevalence: r.value })
      yield rows.length / lambdas.length
    }
  }
  return {
    iter: iter(),
    snapshot: () => {
      const first = rows.find((r) => r.prevalence >= LARGE)
      return { n: on.n, source: on.source, gamma: on.gamma, rows: rows.slice(), from: first ? first.lambda : NaN, done: rows.length === lambdas.length }
    },
  }
}

// ---------------------------------------------------------------- Panel B

export const B_SEED = 12002
export const B_N = 10000
export const B_L = 100
export const B_RUNS = 20
export const B_DEFAULT = { model: 'si', beta: 0.2, d: 4 }
export const B_NETS = ['poisson', 'pa', 'lattice']
export const B_LEVELS = [0.01, 0.1, 0.5]

// The three networks, and 20 seeds for each: random nodes of the largest
// component for the two networks, the centre of the lattice every time.
export function netsB() {
  const out = {}
  for (const source of ['poisson', 'pa']) {
    const on = makeNet(B_SEED, { source, N: B_N })
    const giant = largestComponent(on.g, null)
    const random = mulberry32(seedOf(B_SEED, 50 + B_NETS.indexOf(source)))
    const seeds = []
    while (seeds.length < B_RUNS) {
      const v = Math.floor(random() * on.n)
      if (giant.label[v] === giant.id) seeds.push(v)
    }
    out[source] = { ...on, seeds, giant: giant.size / on.n }
  }
  const net = squareLattice(B_L)
  const k = degreesOf(net)
  const mo = moments(k)
  const centre = Math.floor(B_L / 2) + B_L * Math.floor(B_L / 2)
  out.lattice = { source: 'lattice', net, g: buildCSR(net.n, net.A, net.B), k, n: net.n, links: net.A.length, mean: mo.mean, mean2: mo.mean2, seeds: Array(B_RUNS).fill(centre), giant: 1 }
  return out
}

// One run. SI is module 02's spreadSI; SIR is the same with d infectious steps.
export function runSpread(on, seed, { model, beta, d }, random) {
  return model === 'si' ? spreadSI(on.g, seed, beta, random) : spread(on.g, seed, beta, d, random)
}

// The 20 runs on one network: the mean curve of the share infected so far,
// the mean degree of the nodes infected at each step, the mean times to 1%,
// 10% and 50% of N. For SIR only the runs that became large are averaged.
export function spreadSummary(on, params, runs = B_RUNS) {
  const random = mulberry32(seedOf(B_SEED, 100 + B_NETS.indexOf(on.source) + 10 * Math.round(params.beta * 100) + (params.model === 'si' ? 0 : 1000 * params.d)))
  const kept = []
  let edge = 0
  for (let r = 0; r < runs; r++) {
    const run = runSpread(on, on.seeds[r % on.seeds.length], params, random)
    const cum = cumulative(run.when, run.steps)
    if (cum[run.steps] <= LARGE * on.n) continue
    kept.push({ run, cum })
    if (on.source === 'lattice') edge += edgeTime(run.when, B_L)
  }
  const steps = kept.reduce((m, x) => Math.max(m, x.run.steps), 0)
  const curve = new Float64Array(steps + 1)
  const sumK = new Float64Array(steps + 1)
  const cnt = new Float64Array(steps + 1)
  const times = B_LEVELS.map(() => ({ sum: 0, reached: 0 }))
  for (const { run, cum } of kept) {
    for (let t = 0; t <= steps; t++) curve[t] += cum[Math.min(t, run.steps)] / on.n / kept.length
    for (let v = 0; v < on.n; v++) {
      const t = run.when[v]
      if (t < 0) continue
      sumK[t] += on.k[v]
      cnt[t]++
    }
    B_LEVELS.forEach((level, i) => {
      const t = timeTo(cum, level * on.n)
      if (Number.isFinite(t)) {
        times[i].sum += t
        times[i].reached++
      }
    })
  }
  const newK = []
  for (let t = 1; t <= steps; t++) if (cnt[t] >= 20) newK.push([t, sumK[t] / cnt[t]])
  const out = {
    source: on.source, large: kept.length, runs, steps,
    curve: Array.from(curve, (v, t) => [t, v]),
    newK,
    times: times.map((x) => (x.reached ? x.sum / x.reached : NaN)),
    reached: times.map((x) => x.reached),
    final: kept.length ? curve[steps] : 0,
    peakK: newK.reduce((b, p) => (b && b[1] >= p[1] ? b : p), null),
  }
  if (on.source === 'lattice' && kept.length) {
    out.edge = edge / kept.length
    // the slope of the mean curve on log-log axes, from a quarter of the way to the edge up to the edge
    out.slope = logLogSlope(out.curve.filter(([t]) => t >= out.edge / 4 && t <= out.edge))
  }
  return out
}

export function spreadJob(nets, params) {
  const out = {}
  function* iter() {
    let i = 0
    for (const id of B_NETS) {
      out[id] = spreadSummary(nets[id], params)
      yield ++i / B_NETS.length
    }
  }
  return { iter: iter(), snapshot: () => ({ ...params, T: params.model === 'si' ? 1 : transmissibility(params.beta, params.d), nets: { ...out }, done: B_NETS.every((id) => out[id]) }) }
}

// ---------------------------------------------------------------- Panel C

export const C_SEED = 12003
export const C_DEFAULT = { source: 'poisson', N: 10000, T: 0.5, g: 0.2 }
export const C_SOURCES = ['poisson', 'pa']
export const C_SIZES = [1000, 2000, 5000, 10000]
export const C_RUNS = 5
export const C_STEP = 0.01
export const C_GMAX = 0.9
export const STRATEGIES = ['random', 'degree', 'acquaintance']

export const netC = (params) => makeNet(C_SEED, params)

// The three orders in which the nodes are immunised, for one run.
export function immuneOrders(on, random) {
  const limit = Math.round(C_GMAX * on.n)
  return {
    random: randomOrder(on.n, random),
    degree: attackOrder(on.k, random),
    acquaintance: acquaintanceOrder(on.g, random, limit),
  }
}

// Immunise the first q nodes of an order, then one percolation at T: the
// largest component as a share of all N nodes.
export function immunisedOutbreak(on, order, q, T, random, ws = {}) {
  if (!ws.immune || ws.immune.length !== on.n) ws.immune = new Uint8Array(on.n)
  ws.immune.fill(0)
  for (let i = 0; i < q; i++) ws.immune[order[i]] = 1
  return bondPercolation(on.net, T, random, ws.immune, ws) / on.n
}

// The whole panel: for g = 0, 0.01, …, 0.9 and the three strategies, the size
// of a large outbreak (mean of 5 runs, each with its own orders) and the mean
// degree of those immunised.
export function immuniseJob(on, T, runs = C_RUNS, step = C_STEP) {
  const count = Math.round(C_GMAX / step)
  const rows = Array.from({ length: count + 1 }, (_, i) => ({ g: Math.round(i * step * 100) / 100, q: Math.round(i * step * on.n), size: { random: 0, degree: 0, acquaintance: 0 }, k: { random: 0, degree: 0, acquaintance: 0 }, n: { random: 0, degree: 0, acquaintance: 0 } }))
  const random = mulberry32(seedOf(C_SEED, 400 + on.n + Math.round(T * 1000) + (on.source === 'pa' ? 5 : 0)))
  const ws = {}
  let done = 0
  function* iter() {
    for (let r = 0; r < runs; r++) {
      const orders = immuneOrders(on, random)
      const prefix = {}
      for (const s of STRATEGIES) prefix[s] = degreePrefix(orders[s], on.k)
      for (let i = 0; i <= count; i++) {
        const row = rows[i]
        for (const s of STRATEGIES) {
          if (row.q > orders[s].length) continue
          row.size[s] += immunisedOutbreak(on, orders[s], row.q, T, random, ws)
          row.k[s] += row.q ? prefix[s][row.q] / row.q : 0
          row.n[s]++
        }
        if (i % 4 === 3) yield (r + i / (count + 1)) / runs
      }
      done++
      yield done / runs
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({
      n: on.n, source: on.source, T, gc: immuneShare(on.Tc, T), runs: done,
      rows: rows.map((row) => ({
        g: row.g,
        size: Object.fromEntries(STRATEGIES.map((s) => [s, row.n[s] ? row.size[s] / row.n[s] : NaN])),
        k: Object.fromEntries(STRATEGIES.map((s) => [s, row.n[s] && row.q ? row.k[s] / row.n[s] : NaN])),
      })),
      done: done === runs,
    }),
  }
}

// The first g at which a strategy leaves a large outbreak below 1% of N.
export function stopsAt(rows, strategy) {
  const row = rows.find((r) => r.size[strategy] < LARGE)
  return row ? row.g : NaN
}
