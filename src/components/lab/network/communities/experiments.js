import {
  louvain, labelPropagation, modularity, nmi, groupCount, gnBenchmark, gnGroups, randomGnm, fromData, twoGroupSBM,
  spectralJob, overlap, ringOfCliques, cliquePartition, pairPartition, ringQ, ringGammaRange, cliqueReport, seedOf,
  GN_K, GN_N,
} from './community.js'

// Network Lab module 09: the experiments behind the three panels, as plain
// functions and useExperiment jobs ({ iter, snapshot }), shared with
// scripts/lab/check-network-09.mjs. The karate club is the file module 03
// uses, src/data/lab/networks/karate-club.json (NetworkX, 78 links, the
// factions after the split in `mrHi`); the page imports the JSON and Node
// reads it, and both pass it to karateFrom.

export { drain } from './community.js'

// faction 0: Mr. Hi's members after the split; 1: the officer's
export function karateFrom(data) {
  const g = fromData(data)
  return { g, factions: Int32Array.from({ length: g.n }, (_, i) => (data.mrHi.includes(i) ? 0 : 1)) }
}

// ---------------------------------------------------------------- Panel A

export const A_SEED = 9001
export const A_DEFAULT = { source: 'gn', kOut: 6, method: 'louvain', seed: 1 }
export const A_SWEEP_NETS = 20
export const A_SWEEP_KOUT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const RANDOM_N = 1000
export const RANDOM_K = [4, 8, 16]
export const RANDOM_NETS = 5

export const benchmarkNet = (kOut, j = 0) => gnBenchmark(kOut, seedOf(A_SEED, 100 * kOut + j))

export const runMethod = (g, method, seed) => (method === 'lp' ? labelPropagation(g, { seed }) : louvain(g, { seed }))

// The panel's network and its readouts. For the random network the "planted"
// partition is the four blocks of 32, which mean nothing there.
export function panelA({ source, kOut, method, seed }, karate) {
  let g
  let planted
  if (source === 'karate') {
    g = karate.g
    planted = karate.factions
  } else {
    const bench = benchmarkNet(kOut)
    if (source === 'random') {
      g = randomGnm(GN_N, bench.A.length, seedOf(A_SEED, 7000 + kOut))
      planted = gnGroups()
    } else {
      g = bench
      planted = bench.planted
    }
  }
  const found = runMethod(g, method, seed)
  return {
    g,
    planted,
    found: found.partition,
    qPlanted: modularity(g, planted),
    qFound: found.Q,
    groups: groupCount(found.partition),
    nmi: nmi(found.partition, planted),
    L: g.A.length,
  }
}

// "Sweep k_out": 20 benchmark networks per value, mean NMI of both methods.
export function sweepAJob(seed = 1) {
  const rows = A_SWEEP_KOUT.map((kOut) => ({ kOut, mu: kOut / GN_K, louvain: [], lp: [] }))
  function* iter() {
    let done = 0
    const total = rows.length * A_SWEEP_NETS
    for (const row of rows)
      for (let j = 0; j < A_SWEEP_NETS; j++) {
        const g = benchmarkNet(row.kOut, j)
        row.louvain.push(nmi(louvain(g, { seed: seed + j }).partition, g.planted))
        row.lp.push(nmi(labelPropagation(g, { seed: seed + j }).partition, g.planted))
        yield ++done / total
      }
  }
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN)
  return {
    iter: iter(),
    snapshot: () => ({ rows: rows.map((r) => ({ kOut: r.kOut, mu: r.mu, louvain: mean(r.louvain), lp: mean(r.lp), count: r.louvain.length })) }),
  }
}

// "Random networks": Louvain's Q on G(n, M) with 1,000 nodes, mean degree 4, 8, 16.
export function randomQJob(seed = 1) {
  const rows = RANDOM_K.map((k) => ({ k, Q: [], groups: [] }))
  function* iter() {
    let done = 0
    for (const row of rows)
      for (let j = 0; j < RANDOM_NETS; j++) {
        const g = randomGnm(RANDOM_N, (RANDOM_N * row.k) / 2, seedOf(A_SEED, 9000 + 10 * row.k + j))
        const r = louvain(g, { seed: seed + j })
        row.Q.push(r.Q)
        row.groups.push(groupCount(r.partition))
        yield ++done / (rows.length * RANDOM_NETS)
      }
  }
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN)
  return { iter: iter(), snapshot: () => ({ rows: rows.map((r) => ({ k: r.k, Q: mean(r.Q), groups: mean(r.groups), count: r.Q.length })) }) }
}

// ---------------------------------------------------------------- Panel B

export const B_SEED = 9002
export const B_DEFAULT = { n: 30, s: 5, gamma: 1 }

export function panelB({ n, s, gamma }) {
  const g = ringOfCliques(n, s)
  const one = cliquePartition(n, s)
  const pairs = pairPartition(n, s)
  const closed = ringQ(n, s)
  const found = louvain(g, { seed: B_SEED, gamma })
  return {
    g,
    qOne: modularity(g, one),
    qPairs: modularity(g, pairs),
    qOneGamma: modularity(g, one, gamma),
    qPairsGamma: modularity(g, pairs, gamma),
    closed,
    condition: s * (s - 1) + 2,
    pairsWin: n > s * (s - 1) + 2,
    range: ringGammaRange(n, s),
    found: found.partition,
    qFound: found.Q,
    report: cliqueReport(found.partition, n, s),
  }
}

// ---------------------------------------------------------------- Panel C

export const C_SEED = 9003
export const C_DEFAULT = { N: 4000, c: 10, x: 1.5 }
export const C_SWEEP_X = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]
export const C_SWEEP_NETS = 3

// c_in − c_out = x · 2√c̄, with c̄ = (c_in + c_out)/2; c_out cannot fall below
// 0, so x stops at √c̄.
export function cInOut(c, x) {
  const xMax = Math.sqrt(c)
  const xe = Math.min(x, xMax)
  const d = xe * 2 * Math.sqrt(c)
  return { cIn: c + d / 2, cOut: c - d / 2, x: xe, clamped: x > xMax + 1e-12 }
}

const netSeed = (N, c, x, j) => seedOf(C_SEED, Math.round(N / 1000) * 1e6 + c * 1e4 + Math.round(x * 100) * 10 + j)

// One network: spectral bisection and Louvain.
export function panelCJob({ N, c, x }, j = 0) {
  const p = cInOut(c, x)
  let g = null
  let spec = null
  let lv = null
  let sj = null
  function* iter() {
    g = twoGroupSBM(N, p.cIn, p.cOut, netSeed(N, c, p.x, j))
    yield 0.02
    sj = spectralJob(g, { seed: seedOf(C_SEED, j) })
    for (const v of sj.iter) yield 0.02 + 0.88 * v
    spec = sj.snapshot()
    lv = louvain(g, { seed: 1 + j })
  }
  return {
    iter: iter(),
    snapshot: () => {
      const s = spec || (sj ? sj.snapshot() : null)
      return {
        params: { N, c, x },
        ...p,
        L: g ? g.A.length : 0,
        inside: p.cIn / (p.cIn + p.cOut),
        overlap: s ? overlap(s.partition, g.planted) : NaN,
        iterations: s ? s.iter : 0,
        converged: s ? s.converged : false,
        louvainQ: lv ? lv.Q : NaN,
        louvainGroups: lv ? groupCount(lv.partition) : NaN,
        louvainNmi: lv ? nmi(lv.partition, g.planted) : NaN,
        done: !!lv,
      }
    },
  }
}

// "Sweep": three networks per multiple of the threshold.
export function sweepCJob({ N, c }) {
  const rows = C_SWEEP_X.map((x) => ({ x, overlap: [], louvainNmi: [] }))
  let current = null
  function* iter() {
    const total = rows.length * C_SWEEP_NETS
    let done = 0
    for (const row of rows)
      for (let j = 0; j < C_SWEEP_NETS; j++) {
        current = panelCJob({ N, c, x: row.x }, j)
        for (const v of current.iter) yield (done + v) / total
        const r = current.snapshot()
        row.overlap.push(r.overlap)
        row.louvainNmi.push(r.louvainNmi)
        row.clamped = r.clamped
        done++
        yield done / total
      }
  }
  const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN)
  return {
    iter: iter(),
    snapshot: () => ({
      N,
      c,
      rows: rows.map((r) => ({ x: r.x, overlap: mean(r.overlap), louvainNmi: mean(r.louvainNmi), count: r.overlap.length, clamped: !!r.clamped })),
    }),
  }
}
