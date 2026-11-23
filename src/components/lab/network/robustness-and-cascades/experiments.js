import { mulberry32 } from '../../rng.js'
import { buildCSR } from '../../graphUtils.js'
import { makeSource, giantCurve, randomOrder, attackOrder, degreesOf, pearsonR, spearmanRho } from '../who-connects-to-whom/mixing.js'
import {
  seedOf, moments, criticalFraction, recomputedDegreeOrder, betweennessOrderJob, robustness, collapsePoint, onionJob, sameLayerShare,
  loads, cascadeSteps, mutualGiant,
} from './robust.js'

// Network Lab module 11: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-11.mjs.

export { drain } from './robust.js'

// ---------------------------------------------------------------- Panel A

export const A_SEED = 11001
export const A_DEFAULT = { source: 'pa', N: 1000, meanK: 4, gamma: 2.5, f: 0.2 }
export const A_SOURCES = ['poisson', 'pa', 'power']
export const A_SIZES = [200, 500, 1000, 2000, 5000, 10000]
export const A_KMIN = 2
export const A_RUNS = 20
export const A_SMALL = 1000 // recomputed betweenness and "Make it robust" up to this size
export const A_ATTEMPTS = 20000
export const A_POINTS = 250
export const COLLAPSE = 0.01

// Preferential attachment brings m = ⟨k⟩/2 links per new node.
export const paM = (meanK) => Math.max(1, Math.round(meanK / 2))

export function sourceNet({ source, N, meanK, gamma }) {
  const seed = seedOf(A_SEED, N + 100000 * Math.round(meanK * 10) + 10000000 * Math.round(gamma * 10) + A_SOURCES.indexOf(source))
  return makeSource({ source, N, m: paM(meanK), gamma, kMin: A_KMIN, meanK, seed })
}

const summary = (curve) => ({ curve, fc: collapsePoint(curve, COLLAPSE), R: robustness(curve) })

// The network, f_c from the formula, and the curves that cost little: random
// removal (mean of 20 orders), attack by the degrees of the intact network,
// attack by recomputed degree.
export function panelA(params, runs = A_RUNS) {
  const net = sourceNet(params)
  const n = net.n
  const k = degreesOf(net)
  const mo = moments(k)
  const random = mulberry32(seedOf(A_SEED, 7 + n))
  const mean = new Float64Array(n + 1)
  let fc = 0
  let R = 0
  for (let r = 0; r < runs; r++) {
    const c = giantCurve(net, randomOrder(n, random))
    for (let i = 0; i <= n; i++) mean[i] += c[i] / runs
    fc += collapsePoint(c, COLLAPSE) / runs
    R += robustness(c) / runs
  }
  return {
    net,
    k,
    links: net.A.length,
    mean: mo.mean,
    mean2: mo.mean2,
    fcTheory: criticalFraction(mo.mean, mo.mean2),
    random: { curve: mean, fc, R },
    degree: summary(giantCurve(net, attackOrder(k, random))),
    recomputed: summary(giantCurve(net, recomputedDegreeOrder(net))),
  }
}

export const valueAt = (curve, f) => curve[Math.round(f * (curve.length - 1))]

// A curve thinned to at most A_POINTS + 1 points [f, share] for the chart.
export function thin(curve, points = A_POINTS) {
  const n = curve.length - 1
  const out = []
  const step = Math.max(1, Math.floor(n / points))
  for (let q = 0; q <= n; q += step) out.push([q / n, curve[q]])
  if (out[out.length - 1][0] < 1) out.push([1, curve[n]])
  return out
}

// Attack by betweenness: recomputed before every removal up to A_SMALL nodes,
// the betweenness of the intact network beyond.
export function betweennessJob(net) {
  const recompute = net.n <= A_SMALL
  const job = betweennessOrderJob(net, { recompute })
  let result = null
  function* iter() {
    yield* job.iter
    result = summary(giantCurve(net, job.snapshot().order))
  }
  return { iter: iter(), snapshot: () => ({ n: net.n, links: net.A.length, recompute, ...(result || {}), done: !!result }) }
}

// "Make it robust" on the panel's network.
export const robustJob = (net, attempts = A_ATTEMPTS, onAccept = null) => onionJob(net, seedOf(A_SEED, 500 + net.n), { attempts, onAccept })

export const wiring = (net) => ({ r: pearsonR(net), rho: spearmanRho(net), layered: sameLayerShare(net) })

// ---------------------------------------------------------------- Panel B

export const B_SEED = 11002
export const B_DEFAULT = { source: 'pa', N: 400, alpha: 0.2, trigger: 'top' }
export const B_SIZES = [200, 400, 600, 800, 1000]
export const B_MEAN_K = 4
export const B_RUNS = 20
export const B_ALPHAS = Array.from({ length: 11 }, (_, i) => i / 10)

// The network, the loads of the intact network (shortest paths through each
// node, its own included), the node of highest load and 20 random nodes.
export function overloadNet({ source, N }) {
  const net = makeSource({ source, N, m: paM(B_MEAN_K), meanK: B_MEAN_K, seed: seedOf(B_SEED, N + (source === 'pa' ? 0 : 50000)) })
  const g = buildCSR(net.n, net.A, net.B)
  const load0 = loads(g, null, true)
  let top = 0
  for (let v = 1; v < N; v++) if (load0[v] > load0[top]) top = v
  const random = mulberry32(seedOf(B_SEED, 900 + N))
  const picks = Array.from({ length: B_RUNS }, () => Math.floor(random() * N))
  return { source, net, g, n: N, load0, top, picks, k: degreesOf(net) }
}

// One setting of the panel: the cascade from the node of highest load, or the
// 20 cascades from the random nodes (the first one is the one drawn).
export function cascadeJob(on, alpha, trigger) {
  const triggers = trigger === 'top' ? [on.top] : on.picks
  const runs = []
  function* iter() {
    for (const t of triggers) {
      const state = {}
      for (const _ of cascadeSteps(on.g, on.load0, alpha, t, state)) yield runs.length / triggers.length
      runs.push({ trigger: t, G: state.G, rounds: state.rounds, failed: state.failed, failedRound: state.failedRound, inGiant: state.inGiant })
      yield runs.length / triggers.length
    }
  }
  const mean = (key) => runs.reduce((s, r) => s + r[key], 0) / (runs.length || 1)
  return {
    iter: iter(),
    snapshot: () => ({ n: on.n, source: on.source, alpha, trigger, runs: runs.length, G: mean('G'), rounds: mean('rounds'), failed: mean('failed'), first: runs[0] || null, done: runs.length === triggers.length }),
  }
}

// "Sweep α": G for both triggers at α = 0, 0.1, …, 1.
export function sweepAlphaJob(on, alphas = B_ALPHAS) {
  const rows = []
  const total = alphas.length * (1 + on.picks.length)
  let done = 0
  function* iter() {
    for (const alpha of alphas) {
      const row = { alpha, top: NaN, roundsTop: NaN, random: 0, roundsRandom: 0 }
      const run = function* (t) {
        const state = {}
        for (const _ of cascadeSteps(on.g, on.load0, alpha, t, state)) yield done / total
        done++
        return state
      }
      const s = yield* run(on.top)
      row.top = s.G
      row.roundsTop = s.rounds
      for (const t of on.picks) {
        const q = yield* run(t)
        row.random += q.G / on.picks.length
        row.roundsRandom += q.rounds / on.picks.length
      }
      rows.push(row)
      yield done / total
    }
  }
  return { iter: iter(), snapshot: () => ({ n: on.n, source: on.source, rows: rows.slice(), done: rows.length === alphas.length }) }
}

// ---------------------------------------------------------------- Panel C

export const C_SEED = 11003
export const C_DEFAULT = { kind: 'random', N: 10000, meanK: 4, p: 0.7 }
export const C_SIZES = [1000, 2000, 5000, 10000, 20000]
export const C_GAMMA = 2.5
export const C_KMIN = 2
export const C_STEP = 0.01

// Two independent networks on the same labels (node i of one depends on node i
// of the other) and one random order in which the nodes of A are kept.
export function coupledPair({ kind, N, meanK }, run = 0) {
  const base = N + 100000 * Math.round(meanK * 10) + (kind === 'power' ? 7 : 0) + 1000000 * run
  const make = (j) => makeSource({ source: kind === 'power' ? 'power' : 'poisson', N, gamma: C_GAMMA, kMin: C_KMIN, meanK, seed: seedOf(C_SEED, base + j) })
  const na = make(1)
  const nb = make(2)
  const order = randomOrder(N, mulberry32(seedOf(C_SEED, base + 3)))
  return { kind, n: N, a: buildCSR(N, na.A, na.B), b: buildCSR(N, nb.A, nb.B), order, meanK: (na.A.length + nb.A.length) / N, mo: moments(degreesOf(na)) }
}

// Keep the first p N nodes of the order and let the cascade run.
export function coupledAt(pair, p, ws = {}) {
  const n = pair.n
  const keep = Math.round(p * n)
  if (!ws.alive) ws.alive = new Uint8Array(n)
  ws.alive.fill(0)
  for (let i = 0; i < keep; i++) ws.alive[pair.order[i]] = 1
  const r = mutualGiant(pair.a, pair.b, ws.alive, ws)
  return { p, mutual: r.size / n, single: r.single / n, rounds: r.rounds }
}

// The whole curve, p = 0, 0.01, …, 1.
export function coupledSweepJob(pair, step = C_STEP) {
  const rows = []
  const count = Math.round(1 / step)
  const ws = {}
  function* iter() {
    for (let i = 0; i <= count; i++) {
      rows.push(coupledAt(pair, i / count, ws))
      yield rows.length / (count + 1)
    }
  }
  return {
    iter: iter(),
    snapshot: () => {
      const first = rows.find((r) => r.mutual >= COLLAPSE)
      const firstSingle = rows.find((r) => r.single >= COLLAPSE)
      const peak = rows.reduce((b, r) => (b && b.rounds >= r.rounds ? b : r), null)
      return { n: pair.n, kind: pair.kind, rows: rows.slice(), pc: first ? first.p : NaN, pcSingle: firstSingle ? firstSingle.p : NaN, peak, done: rows.length === count + 1 }
    },
  }
}
