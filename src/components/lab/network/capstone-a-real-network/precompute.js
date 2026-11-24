import {
  airportsNet, giantOf, drain, shapeJob, degreeJob, centralityJob, mixingJob, communities, againstLabels, agreement, weightsReport,
  removalCurves, percolationCurve, cascadeShares, PHI_DEFAULT,
} from './capstone.js'

// What is too slow for a page load, computed once for the airports by
// `node scripts/lab/build-network-14.mjs` and stored in
// src/data/lab/precomputed/network-14-airports.json. Every entry is the
// snapshot of the job the page runs when "Compute again" is pressed, with the
// same seeds, so the stored numbers and the live ones are the same numbers.
// scripts/lab/check-network-14.mjs runs this again and compares the text.

export const LOUVAIN_RUNS = 10
export const PHIS = [0.1, PHI_DEFAULT, 0.25]

export function precompute(data, log = () => {}) {
  const net = giantOf(airportsNet(data))
  const shape = drain(shapeJob(net))
  log('size and shape, ten rewirings')
  const degrees = drain(degreeJob(net))
  log('degrees, bootstrap')
  const centrality = drain(centralityJob(net))
  log('centrality')
  const mixing = drain(mixingJob(net))
  log('mixing, rich club')
  const runs = Array.from({ length: LOUVAIN_RUNS }, (_, j) => communities(net, j))
  // Module 09's practice: of several runs, the partition of highest Q is the
  // one shown (on the map of Figure F1); the card of the workbench runs
  // Louvain itself, one run at a time.
  let best = 0
  for (let j = 1; j < runs.length; j++) if (runs[j].Q > runs[best].Q + 1e-12) best = j
  const community = {
    best,
    partition: runs[best].partition,
    groups: runs[best].groups,
    runs: runs.map((r, j) => ({ Q: r.Q, count: r.count, nmi: againstLabels(net, r.partition).nmi, previous: j ? agreement(r.partition, runs[j - 1].partition) : null })),
  }
  log('communities, ten runs')
  const weights = weightsReport(net)
  const removal = removalCurves(net, { betweenness: centrality.betweenness })
  const percolation = percolationCurve(net)
  const cascades = PHIS.map((phi) => cascadeShares(net, phi))
  log('weights and stress tests')
  return { n: net.n, links: net.A.length, shape, degrees, centrality, mixing, community, weights, removal, percolation, cascades }
}

// Six significant digits; typed arrays as plain ones; NaN as null.
const tidy = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? Number(v.toPrecision(6)) : null
  if (ArrayBuffer.isView(v) || Array.isArray(v)) return Array.from(v, tidy)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tidy(x)]))
  return v
}

export function serialisePre(pre) {
  const t = tidy(pre)
  return `{\n${Object.keys(t).map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(t[k])}`).join(',\n')}\n}\n`
}
