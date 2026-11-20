import { mulberry32 } from '../../rng.js'
import { undirected, degree, closeness, betweenness, eigenvector, pagerank, spearman, topK, overlap } from './centrality.js'

// Panel C, "How fragile is a ranking?": the true network, a copy with links
// missing or with spurious links added, and how far the ranking of the nodes
// moves under each measure.

export const FRAGILE_MEASURES = ['degree', 'closeness', 'betweenness', 'eigenvector', 'pagerank']
export const ERROR_IDS = ['missing', 'spurious']
export const FRACTIONS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]
export const FRAGILE_RUNS = 30
export const FRAGILE_JOB_SEED = 0xf4a61
export const TOP = 10

// The five measures of the panel on one network. The eigenvector iteration
// is capped: a network broken into pieces by missing links can take very long
// to settle to the last digit, and the ranking does not need it.
export function fiveMeasures(net) {
  const G = undirected(net)
  return {
    degree: degree(G),
    closeness: closeness(G),
    betweenness: betweenness(G),
    eigenvector: eigenvector(G, { tol: 1e-10, maxIter: 3000 }).vector,
    pagerank: pagerank(G, 0.85, { tol: 1e-11 }).vector,
  }
}

// Missing links: round(f·L) links, chosen at random, are not recorded.
export function dropLinks(net, f, random) {
  const L = net.A.length
  const drop = Math.min(L, Math.round(f * L))
  const idx = Int32Array.from({ length: L }, (_, i) => i)
  for (let i = 0; i < drop; i++) {
    const j = i + Math.floor(random() * (L - i))
    const t = idx[i]
    idx[i] = idx[j]
    idx[j] = t
  }
  const kept = idx.subarray(drop)
  return { n: net.n, A: Int32Array.from(kept, (e) => net.A[e]), B: Int32Array.from(kept, (e) => net.B[e]) }
}

// Spurious links: round(f·L) links that do not exist are recorded between
// random pairs (never a self-link, never a pair already linked).
export function addLinks(net, f, random) {
  const L = net.A.length
  const free = (net.n * (net.n - 1)) / 2 - L
  const extra = Math.min(Math.round(f * L), free)
  const key = (a, b) => (a < b ? a * net.n + b : b * net.n + a)
  const keys = new Set()
  for (let e = 0; e < L; e++) keys.add(key(net.A[e], net.B[e]))
  const A = new Int32Array(L + extra)
  const B = new Int32Array(L + extra)
  A.set(net.A)
  B.set(net.B)
  for (let e = L; e < L + extra; ) {
    const a = Math.floor(random() * net.n)
    const b = Math.floor(random() * net.n)
    if (a === b || keys.has(key(a, b))) continue
    keys.add(key(a, b))
    A[e] = a
    B[e] = b
    e++
  }
  return { n: net.n, A, B }
}

export const perturb = (net, errorId, f, random) => (errorId === 'missing' ? dropLinks(net, f, random) : addLinks(net, f, random))

// The experiment, as a job for useExperiment. For each fraction of the grid,
// `runs` observed copies of the network; for each measure, the Spearman
// correlation between the true and the observed scores and the share of the
// true top ten still in the observed top ten, averaged over the copies.
export function fragilityJob(net, errorId, seed = FRAGILE_JOB_SEED, runs = FRAGILE_RUNS) {
  const truth = fiveMeasures(net)
  const top = Math.min(TOP, net.n)
  const zero = () => Object.fromEntries(FRAGILE_MEASURES.map((id) => [id, 0]))
  const points = FRACTIONS.map((x) => ({ x, runs: 0, spearman: zero(), counted: zero(), overlap: zero() }))
  function* iter() {
    const total = points.length * runs
    let done = 0
    for (let r = 0; r < runs; r++) {
      for (let i = 0; i < points.length; i++) {
        const random = mulberry32((seed ^ Math.imul(r + 1, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca6b)) >>> 0)
        const p = points[i]
        const seen = fiveMeasures(perturb(net, errorId, p.x, random))
        for (const id of FRAGILE_MEASURES) {
          const rho = spearman(truth[id], seen[id])
          if (Number.isFinite(rho)) {
            p.spearman[id] += rho
            p.counted[id]++
          }
          p.overlap[id] += overlap(topK(truth[id], top, random), topK(seen[id], top, random))
        }
        p.runs++
        yield ++done / total
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({
      errorId,
      top,
      points: points
        .filter((p) => p.runs > 0)
        .map((p) => ({
          x: p.x,
          runs: p.runs,
          spearman: Object.fromEntries(FRAGILE_MEASURES.map((id) => [id, p.counted[id] ? p.spearman[id] / p.counted[id] : NaN])),
          overlap: Object.fromEntries(FRAGILE_MEASURES.map((id) => [id, p.overlap[id] / p.runs])),
        })),
    }),
  }
}
