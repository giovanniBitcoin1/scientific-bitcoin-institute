import { mulberry32 } from '../../rng.js'
import {
  makeSource, rewirer, pearsonR, spearmanRho, degreeSummary, knnCurve, knnSlope, degreesOf, richClubJob,
  giantCurve, randomOrder, attackOrder, growGroups, mixing, colourNodes, illusion, rewire, seedOf,
} from './mixing.js'

// Network Lab module 08: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-08.mjs.

// Runs a job to the end (Node, checks).
export function drain(job) {
  for (const _ of job.iter);
  return job.snapshot()
}

// ---------------------------------------------------------------- Panel A

export const A_SEED = 8001
export const A_DEFAULT = { source: 'pa', N: 10000, gamma: 2.5, mode: 'none', p: 0.5, swaps: 10 }
export const A_KMIN = 2
export const A_MEAN_K = 4
export const A_MAX_N = 100000
export const KNN_FROM = 3 // the k_nn slope is fitted from k = 3

// The panel's network: the source, then (if a mode is chosen) `swaps` · L
// steps of rewiring, then its readouts, then the rich club against 20
// randomisations.
export function panelAJob(params, seed = A_SEED) {
  const { source, N, gamma, mode, p, swaps } = params
  let net = null
  let stats = null
  let rc = null
  let rcJob = null
  function* iter() {
    net = makeSource({ source, N, gamma, kMin: A_KMIN, meanK: A_MEAN_K, seed })
    yield 0.05
    if (mode !== 'none') {
      const rw = rewirer(net, mulberry32(seedOf(seed, 1)))
      const total = Math.round(swaps * net.A.length)
      const chunk = 20000
      for (let i = 0; i < total; i += chunk) {
        rw.run(Math.min(chunk, total - i), mode, p)
        yield 0.05 + (0.25 * i) / total
      }
      net = rw.net
    }
    const k = degreesOf(net)
    const curve = knnCurve(net, k)
    stats = { r: pearsonR(net, k), rho: spearmanRho(net, k), ...degreeSummary(net, k), L: net.A.length, knn: curve, slope: knnSlope(curve, KNN_FROM) }
    yield 0.3
    rcJob = richClubJob(net, seedOf(seed, 2))
    for (const x of rcJob.iter) yield 0.3 + 0.7 * x
  }
  return {
    iter: iter(),
    snapshot: () => {
      rc = rcJob ? rcJob.snapshot() : null
      return { params, stats, rc, done: !!(rc && rc.finished) }
    },
  }
}

// "Grow N": r and ρ of the source (no rewiring) at three sizes, three seeds.
export const SWEEP_SIZES = [1000, 10000, 100000]
export const SWEEP_SEEDS = 3

export function sweepJob({ source, gamma }, seed = A_SEED) {
  const rows = SWEEP_SIZES.map((N) => ({ N, r: [], rho: [] }))
  function* iter() {
    const total = SWEEP_SIZES.length * SWEEP_SEEDS
    let done = 0
    for (let s = 0; s < SWEEP_SEEDS; s++)
      for (const row of rows) {
        const net = makeSource({ source, N: row.N, gamma, kMin: A_KMIN, meanK: A_MEAN_K, seed: seedOf(seed, 100 + s) })
        const k = degreesOf(net)
        row.r.push(pearsonR(net, k))
        row.rho.push(spearmanRho(net, k))
        yield ++done / total
      }
  }
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
  return {
    iter: iter(),
    snapshot: () => ({ source, gamma, done: rows.every((r) => r.r.length === SWEEP_SEEDS), rows: rows.map((r) => ({ ...r, rMean: r.r.length ? mean(r.r) : NaN, rhoMean: r.rho.length ? mean(r.rho) : NaN })) }),
  }
}

// ---------------------------------------------------------------- Panel B

export const B_SEED = 8002
export const B_DEFAULT = { source: 'pa', gamma: 2.5 }
export const B_N = 10000
export const B_SWAPS = 10
export const B_RUNS = 20
export const WIRINGS = ['assortative', 'neutral', 'disassortative']
export const RANDOM_AT = [0.2, 0.5, 0.8]
export const ATTACK_AT = [0.02, 0.05, 0.1]
export const CURVE_POINTS = 100 // random removal: f = 0, 0.01, …, 1; attack: f = 0, 0.002, …, 0.2
export const ATTACK_MAX = 0.2

// One degree sequence (the source), rewired three ways with B_SWAPS · L steps:
// towards assortative (p = 1), at random (neutral), towards disassortative
// (p = 1). For each wiring, the share of nodes in the largest component as
// nodes are removed at random and by decreasing degree (the degrees of the
// intact network, not recomputed), averaged over B_RUNS orders.
export function robustJob({ source, gamma }, seed = B_SEED, runs = B_RUNS) {
  const base = makeSource({ source, N: B_N, gamma, kMin: A_KMIN, meanK: A_MEAN_K, seed })
  const k = degreesOf(base)
  const out = {}
  function* iter() {
    const steps = WIRINGS.length * (1 + runs)
    let done = 0
    for (const [w, id] of WIRINGS.entries()) {
      const net = rewire(base, { mode: id === 'neutral' ? 'random' : id, p: id === 'neutral' ? 0 : 1, swaps: B_SWAPS, seed: seedOf(seed, w) })
      const o = { r: pearsonR(net), rho: spearmanRho(net), net, random: new Float64Array(CURVE_POINTS + 1), attack: new Float64Array(CURVE_POINTS + 1), runs: 0 }
      out[id] = o
      yield ++done / steps
      const order = mulberry32(seedOf(seed, 10 + w))
      for (let r = 0; r < runs; r++) {
        const cr = giantCurve(net, randomOrder(net.n, order))
        const ca = giantCurve(net, attackOrder(k, order))
        for (let i = 0; i <= CURVE_POINTS; i++) {
          o.random[i] += cr[Math.round((i / CURVE_POINTS) * net.n)]
          o.attack[i] += ca[Math.round(((i * ATTACK_MAX) / CURVE_POINTS) * net.n)]
        }
        o.runs++
        yield ++done / steps
      }
    }
  }
  const at = (curve, runsDone, f, max) => curve[Math.round((f / max) * CURVE_POINTS)] / runsDone
  return {
    iter: iter(),
    snapshot: () => {
      const wirings = {}
      for (const id of WIRINGS) {
        const o = out[id]
        if (!o || !o.runs) continue
        wirings[id] = {
          r: o.r,
          rho: o.rho,
          runs: o.runs,
          random: Array.from(o.random, (v, i) => [i / CURVE_POINTS, v / o.runs]),
          attack: Array.from(o.attack, (v, i) => [(i * ATTACK_MAX) / CURVE_POINTS, v / o.runs]),
          tableRandom: RANDOM_AT.map((f) => at(o.random, o.runs, f, 1)),
          tableAttack: ATTACK_AT.map((f) => at(o.attack, o.runs, f, ATTACK_MAX)),
        }
      }
      return { source, gamma, k, done: WIRINGS.every((id) => out[id] && out[id].runs === runs), wirings, nets: Object.fromEntries(Object.entries(out).map(([id, o]) => [id, o.net])) }
    },
  }
}

// ---------------------------------------------------------------- Panel C

export const C_SEED = 8003
export const C_N = 2000
export const C_M = 2
export const C_DEFAULT = { q: 0.2, h: 0.8, share: 0.1, how: 'top', rewired: false }
export const C_SWAPS = 10

// The two-group network and its mixing.
export function groupsState({ q, h }, seed = C_SEED) {
  const net = growGroups({ N: C_N, m: C_M, q, h, seed })
  return { net, ...mixing(net, net.group), r: pearsonR(net), rho: spearmanRho(net) }
}

// The majority illusion on that network: a share of the nodes coloured (the
// highest degrees or at random), on the network as grown and, with the
// switch, rewired towards disassortative (p = 1, C_SWAPS · L steps, same
// degrees). The same nodes are coloured in both.
export function illusionState(net, { share, how, rewired }, seed = C_SEED) {
  const k = degreesOf(net)
  const coloured = colourNodes(k, share, how, mulberry32(seedOf(seed, 3)))
  const wired = rewired ? rewire(net, { mode: 'disassortative', p: 1, swaps: C_SWAPS, seed: seedOf(seed, 4) }) : net
  const res = illusion(wired, coloured)
  return { coloured: res.coloured, majority: res.majority, r: pearsonR(wired), rho: spearmanRho(wired) }
}
