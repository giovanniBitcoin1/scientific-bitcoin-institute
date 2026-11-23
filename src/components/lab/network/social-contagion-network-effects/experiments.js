import { mulberry32, randNormal } from '../../rng.js'
import { buildCSR, wattsStrogatz } from '../../graphUtils.js'
import { makeSource, degreesOf } from '../who-connects-to-whom/mixing.js'
import { seedOf, moments } from '../robustness-and-cascades/robust.js'
import { twoGroupSBM } from '../communities/community.js'
import {
  riot, riotStaircase, sampleCrowd, smoothOutcome, needByShare, needByCount, cascade, stepsTo, cascadeConditionOf, cascadeWindow, vulnerableUpTo,
} from './contagion.js'

// Network Lab module 13: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-13.mjs.

export { drain } from '../robustness-and-cascades/robust.js'

// ---------------------------------------------------------------- Panel A: a crowd

export const A_SEED = 13001
export const CROWD_N = 100
export const CROWD_DEFAULT = { mean: 25, sd: 12 }
export const CROWDS = 200 // crowds in the histogram and per point of the sweep
export const CROWD_BINS = 20
export const SWEEP_SDS = Array.from({ length: 50 }, (_, i) => i + 1)

const crowdRandom = (mean, sd, j) => {
  const random = mulberry32(seedOf(A_SEED, Math.round(mean * 10) + 1000 * Math.round(sd * 10) + 1000003 * j))
  return () => randNormal(random)
}

// Crowd number j with these settings: its thresholds, the staircase from 0 and the outcome.
export function crowd(mean, sd, j = 0) {
  const thresholds = sampleCrowd(CROWD_N, mean, sd, crowdRandom(mean, sd, j))
  const staircase = riotStaircase(thresholds)
  const sorted = Float64Array.from(thresholds).sort()
  return { thresholds, sorted, staircase, outcome: staircase[staircase.length - 1], smooth: smoothOutcome(CROWD_N, mean, sd) }
}

// The outcomes of `count` crowds drawn from the same distribution (crowds
// 1 … count: crowd 0 is the one on show).
export function crowdOutcomes(mean, sd, count = CROWDS) {
  const normal = crowdRandom(mean, sd, 1)
  const out = new Int32Array(count)
  for (let c = 0; c < count; c++) out[c] = riot(sampleCrowd(CROWD_N, mean, sd, normal))
  return out
}

export function crowdHistogram(mean, sd, count = CROWDS) {
  const out = crowdOutcomes(mean, sd, count)
  const bins = new Int32Array(CROWD_BINS)
  let above = 0
  let sum = 0
  for (const r of out) {
    bins[Math.min(CROWD_BINS - 1, Math.floor((r / CROWD_N) * CROWD_BINS))]++
    if (r > CROWD_N / 2) above++
    sum += r
  }
  return { mean, sd, count, bins: Array.from(bins), above: above / count, average: sum / count, min: Math.min(...out), max: Math.max(...out) }
}

// The standard deviation from 1 to 50: the outcome of the smooth curve, and
// the share of 200 sampled crowds that end above half.
export function sdSweep(mean, sds = SWEEP_SDS, count = CROWDS) {
  return sds.map((sd) => {
    const out = crowdOutcomes(mean, sd, count)
    let above = 0
    for (const r of out) if (r > CROWD_N / 2) above++
    return { sd, smooth: smoothOutcome(CROWD_N, mean, sd), above: above / count }
  })
}

export const MARKET_DEFAULT = { p: 0.16, z0: 0.25 }
export const BASS_DEFAULT = { p: 0.03, q: 0.38 }

// ---------------------------------------------------------------- Panel B: the cascade window

export const B_SEED = 13002
export const B_N = 10000
export const B_DEFAULT = { source: 'poisson', phi: 0.18, z: 4, seeds: 'random' }
export const B_SOURCES = ['poisson', 'pa']
export const B_SEEDS = ['random', 'top']
export const B_TRIALS = 200
export const B_TOP = 20
export const GLOBAL = 0.1 // a cascade is global above 10% of the nodes
export const B_BINS = 20
export const B_ZS = Array.from({ length: 31 }, (_, i) => 0.5 + i * 0.25)
export const B_ZS_PA = [2, 4, 6, 8] // preferential attachment has mean degree 2m

// Preferential attachment brings m links per node: the mean degree is the
// nearest even number, at least 2.
export const paDegree = (z) => Math.max(2, 2 * Math.round(z / 2))

// A network of the panel. `variant` picks another network with the same settings.
export function netB({ source, z, N = B_N }, variant = 0, base = B_SEED) {
  const zz = source === 'pa' ? paDegree(z) : z
  const j = Math.round(zz * 100) + (source === 'pa' ? 100000 : 0) + 1000000 * variant + N
  const net = makeSource({ source, N, m: zz / 2, meanK: zz, seed: seedOf(base, j) })
  const k = degreesOf(net)
  const order = Array.from({ length: net.n }, (_, i) => i).sort((a, b) => k[b] - k[a] || a - b)
  return { source, z: zz, n: net.n, net, g: buildCSR(net.n, net.A, net.B), k, links: net.A.length, mean: moments(k).mean, top: order.slice(0, B_TOP), kTop: k[order[B_TOP - 1]] }
}

// `trials` cascades, each from one seed: a node drawn at random, or one of
// the 20 nodes of highest degree. Returns the size of each as a share of N.
export function cascadeSizes(on, phi, mode, trials, random, ws = {}) {
  const need = needByShare(on.g, phi)
  const sizes = new Float64Array(trials)
  const one = [0]
  for (let i = 0; i < trials; i++) {
    one[0] = mode === 'top' ? on.top[Math.floor(random() * on.top.length)] : Math.floor(random() * on.n)
    sizes[i] = cascade(on.g, one, need, ws).size / on.n
  }
  return sizes
}

export function summarise(sizes) {
  let global = 0
  let sum = 0
  const bins = new Int32Array(B_BINS)
  for (const s of sizes) {
    bins[Math.min(B_BINS - 1, Math.floor(s * B_BINS))]++
    if (s > GLOBAL) {
      global++
      sum += s
    }
  }
  return { trials: sizes.length, global: global / sizes.length, meanGlobal: global ? sum / global : NaN, bins: Array.from(bins, (b) => b / sizes.length) }
}

const trialRandom = (on, phi, mode, variant = 0) => mulberry32(seedOf(B_SEED, 7000 + Math.round(on.z * 100) + 1000 * Math.round(phi * 100) + (on.source === 'pa' ? 500000 : 0) + (mode === 'top' ? 250000 : 0) + 1000000 * variant))

// The panel at one mean degree: 200 seeds on one network.
export function cascadesAt(params, trials = B_TRIALS) {
  const on = netB(params)
  const s = summarise(cascadeSizes(on, params.phi, params.seeds, trials, trialRandom(on, params.phi, params.seeds)))
  const K = vulnerableUpTo(params.phi)
  let vulnerable = 0
  for (let v = 0; v < on.n; v++) if (on.k[v] > 0 && on.k[v] <= K) vulnerable++
  return { ...params, z: on.z, n: on.n, links: on.links, meanK: on.mean, kTop: on.kTop, K, vulnerable: vulnerable / on.n, condition: cascadeConditionOf(on.k, params.phi), ...s }
}

// The sweep of the mean degree: one network and 200 seeds for each z.
export function windowJob({ source, phi, seeds }, trials = B_TRIALS) {
  const zs = source === 'pa' ? B_ZS_PA : B_ZS
  const rows = []
  function* iter() {
    for (const z of zs) {
      const on = netB({ source, z })
      yield (rows.length + 0.3) / zs.length
      const s = summarise(cascadeSizes(on, phi, seeds, trials, trialRandom(on, phi, seeds)))
      rows.push({ z, global: s.global, meanGlobal: s.meanGlobal })
      yield rows.length / zs.length
    }
  }
  return { iter: iter(), snapshot: () => ({ source, phi, seeds, window: cascadeWindow(phi), rows: rows.slice(), done: rows.length === zs.length }) }
}

// ---------------------------------------------------------------- Panel C: long ties

export const C_SEED = 13003
export const C_N = 5000
export const C_K = 8 // 4 nearest neighbours on either side
export const C_NETS = 10
export const C_REACH = 0.9
export const C_PS = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.2, 0.3, 0.5, 1]
export const SPREADS = 0.01 // below this share the contagion "does not spread"

// One small-world network (Complexity Lab module 03's generator) and the two
// contagions on it, from one node drawn at random and all its neighbours.
export function longTiesOnce(p, seed, N = C_N, ws = {}) {
  const net = wattsStrogatz(N, C_K, p, seed)
  const g = buildCSR(N, net.A, net.B)
  const start = Math.floor(mulberry32(seed ^ 0x5f3759df)() * N)
  const seeds = [start]
  for (let i = g.offsets[start]; i < g.offsets[start + 1]; i++) seeds.push(g.neighbors[i])
  const out = { shortcuts: net.shortcuts }
  for (const [id, count] of [['simple', 1], ['complex', 2]]) {
    const r = cascade(g, seeds, needByCount(g, count), ws)
    out[id] = { share: r.size / N, steps: stepsTo(ws, C_REACH * N), last: r.steps }
  }
  return out
}

// The mean over `nets` networks at one p: the share reached, and the steps to
// 90% over the networks in which 90% was reached.
export function longTiesAt(p, nets = C_NETS, base = C_SEED, N = C_N, ws = {}) {
  const out = { p, nets }
  const acc = { simple: { share: 0, steps: 0, reached: 0 }, complex: { share: 0, steps: 0, reached: 0 } }
  for (let j = 0; j < nets; j++) {
    const one = longTiesOnce(p, seedOf(base, Math.round(p * 100000) + 1000003 * j), N, ws)
    for (const id of ['simple', 'complex']) {
      acc[id].share += one[id].share / nets
      if (Number.isFinite(one[id].steps)) {
        acc[id].steps += one[id].steps
        acc[id].reached++
      }
    }
  }
  for (const id of ['simple', 'complex']) out[id] = { share: acc[id].share, steps: acc[id].reached ? acc[id].steps / acc[id].reached : NaN, reached: acc[id].reached }
  return out
}

export function longTiesJob(ps = C_PS, nets = C_NETS) {
  const rows = []
  const ws = {}
  function* iter() {
    for (const p of ps) {
      rows.push(longTiesAt(p, nets, C_SEED, C_N, ws))
      yield rows.length / ps.length
    }
  }
  return { iter: iter(), snapshot: () => ({ rows: rows.slice(), done: rows.length === ps.length }) }
}

// ---------------------------------------------------------------- Panel C: clusters

export const K_SEED = 13004
export const K_GROUP = 500
export const K_IN = 10 // mean number of links inside one's group
export const K_NETS = 20
export const K_DEFAULT = { q: 0.5, kOut: 4 }
export const K_OUTS = Array.from({ length: 21 }, (_, i) => i / 2)

// Module 09's block model: c_in = N p_in gives c_in/2 links inside per node.
export function clusterNet(kOut, j, base = K_SEED) {
  const net = twoGroupSBM(2 * K_GROUP, 2 * K_IN, 2 * kOut, seedOf(base, Math.round(kOut * 100) + 100003 * j))
  return { net, g: buildCSR(net.n, net.A, net.B) }
}

// Everyone in the first group has adopted; threshold q for the others.
// Returns the share of the second group that adopts.
export function clusterOnce(kOut, q, j, base = K_SEED, ws = {}) {
  const { g } = clusterNet(kOut, j, base)
  if (!ws.first) ws.first = Array.from({ length: K_GROUP }, (_, i) => i)
  const r = cascade(g, ws.first, needByShare(g, q), ws)
  return (r.size - K_GROUP) / K_GROUP
}

// Over `nets` networks: the mean share, the share of runs in which more than
// half of the second group adopted, and the largest share among the others.
export function clustersAt(kOut, q, nets = K_NETS, base = K_SEED, ws = {}) {
  let sum = 0
  let over = 0
  let stuck = 0
  for (let j = 0; j < nets; j++) {
    const s = clusterOnce(kOut, q, j, base, ws)
    sum += s
    if (s > 0.5) over++
    else if (s > stuck) stuck = s
  }
  return { kOut, share: sum / nets, over: over / nets, stuck, nets }
}

// The mean outside share of a node of the second group is k_out/(10 + k_out):
// it equals q at k_out = 10 q/(1 − q).
export const averagePoint = (q) => (K_IN * q) / (1 - q)

export function clustersJob(q, kOuts = K_OUTS, nets = K_NETS) {
  const rows = []
  const ws = {}
  function* iter() {
    for (const kOut of kOuts) {
      rows.push(clustersAt(kOut, q, nets, K_SEED, ws))
      yield rows.length / kOuts.length
    }
  }
  return { iter: iter(), snapshot: () => ({ q, average: averagePoint(q), rows: rows.slice(), done: rows.length === kOuts.length }) }
}
