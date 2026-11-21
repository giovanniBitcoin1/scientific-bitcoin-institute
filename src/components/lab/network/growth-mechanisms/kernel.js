// Network Lab module 06: measuring the attachment rule of a growing network
// from two snapshots. The network is grown to N2 nodes; the first snapshot is
// the network of the first N1 nodes. Only the links made by the nodes born
// between the two snapshots towards nodes of the first snapshot are counted,
// each against the degree its target had at the first snapshot.

// Degrees at the first snapshot: the links made by nodes born before N1. For a
// directed network (copying) the degree is in-degree + out-degree (m).
export function snapshotDegrees(net, N1) {
  const deg = new Int32Array(N1)
  const L = net.A.length
  for (let e = 0; e < L; e++) {
    if (net.A[e] >= N1) continue
    deg[net.B[e]]++
    if (!net.directed) deg[net.A[e]]++
  }
  if (net.directed) for (let v = 0; v < N1; v++) deg[v] += net.m
  return deg
}

// Classes by degree at the first snapshot: for each k that occurs, the number
// of nodes, the links they gained between the snapshots and the links gained
// per node, Π(k). `gained` counts links from nodes N1 … N2 − 1 to old nodes.
export function kernelTable(net, N1, N2 = net.n) {
  const deg = snapshotDegrees(net, N1)
  let kMax = 0
  for (const k of deg) if (k > kMax) kMax = k
  const nodes = new Float64Array(kMax + 1)
  const gained = new Float64Array(kMax + 1)
  for (const k of deg) nodes[k]++
  let links = 0
  for (let e = 0; e < net.A.length; e++) {
    const a = net.A[e]
    if (a < N1 || a >= N2) continue
    const b = net.B[e]
    if (b >= N1) continue
    gained[deg[b]]++
    links++
  }
  const rows = []
  for (let k = 1; k <= kMax; k++) if (nodes[k] > 0) rows.push({ k, nodes: nodes[k], gained: gained[k], rate: gained[k] / nodes[k] })
  return { deg, rows, links, N1, N2 }
}

// The cumulative kernel κ(k) = Σ_(k' ≤ k) Π(k'), summed from the smallest
// degree over the classes that occur, and the slope of ln κ against ln k by
// least squares; for Π ∝ k^α it tends to α + 1, so α = slope − 1. Two ranges:
//   alpha     from the smallest degree to the largest degree held by at
//             least CUM_MIN_NODES nodes (every class in between);
//   alphaAll  every class, up to the largest degree.
// Where most degrees do not occur (the sparse top of the range), κ grows only
// at the few classes that do and the slope comes out low: the result depends
// on the range fitted.
export const CUM_MIN_NODES = 10
function slopeOf(points) {
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const p of points) {
    const x = Math.log(p.k)
    const y = Math.log(p.kappa)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  const n = points.length
  return n > 1 ? (n * sxy - sx * sy) / (n * sxx - sx * sx) : NaN
}
export function cumulativeFit(table, minNodes = CUM_MIN_NODES) {
  let sum = 0
  const points = []
  for (const r of table.rows) {
    sum += r.rate
    points.push({ k: r.k, kappa: sum, nodes: r.nodes })
  }
  const positive = points.filter((p) => p.kappa > 0)
  let top = -Infinity
  for (const p of points) if (p.nodes >= minNodes) top = Math.max(top, p.k)
  const use = positive.filter((p) => p.k <= top)
  const slope = slopeOf(use)
  const slopeAll = slopeOf(positive)
  return { points, slope, alpha: slope - 1, alphaAll: slopeAll - 1, from: use.length ? use[0].k : NaN, to: top, toAll: positive.length ? positive[positive.length - 1].k : NaN, used: use.length }
}

// Maximum likelihood, conditional on the first snapshot: each counted link
// chose its target among the old nodes with probability k^α / Σ_j k_j^α. With
// n_k old nodes and c_k links into class k (L links in all),
//   ln L(α) = α Σ c_k ln k − L ln Σ n_k k^α,
// whose derivative is L (mean of ln k over the links − mean of ln k weighted
// by n_k k^α) and whose second derivative is −L × (the weighted variance).
// Newton's method from α = 1; standard error 1/√(L × variance) at the maximum.
export function kernelMLE(table) {
  const rows = table.rows
  const L = table.links
  if (!L) return { alpha: NaN, se: NaN, links: 0 }
  let target = 0
  for (const r of rows) target += r.gained * Math.log(r.k)
  target /= L
  const moments = (alpha) => {
    // weighted mean and variance of ln k with weights n_k k^α, computed in
    // logs so that large α cannot overflow
    let top = -Infinity
    for (const r of rows) top = Math.max(top, alpha * Math.log(r.k) + Math.log(r.nodes))
    let w = 0
    let m1 = 0
    let m2 = 0
    for (const r of rows) {
      const x = Math.log(r.k)
      const wi = Math.exp(alpha * x + Math.log(r.nodes) - top)
      w += wi
      m1 += wi * x
      m2 += wi * x * x
    }
    m1 /= w
    return { mean: m1, variance: Math.max(m2 / w - m1 * m1, 1e-12) }
  }
  let alpha = 1
  for (let it = 0; it < 100; it++) {
    const { mean, variance } = moments(alpha)
    const step = (target - mean) / variance
    const next = alpha + Math.max(-1, Math.min(1, step))
    if (Math.abs(next - alpha) < 1e-10) {
      alpha = next
      break
    }
    alpha = next
  }
  const { variance } = moments(alpha)
  const se = 1 / Math.sqrt(L * variance)
  // When (nearly) every link went to the nodes of the top class the likelihood
  // keeps rising with α and has no maximum: no estimate.
  if (!(se < 1) || rows.filter((r) => r.gained > 0).length < 2) return { alpha: NaN, se: NaN, links: L, degenerate: true }
  return { alpha, se, links: L }
}

// Both estimates for one network.
export function measure(net, N1, N2 = net.n) {
  const table = kernelTable(net, N1, N2)
  return { table, cumulative: cumulativeFit(table), mle: kernelMLE(table) }
}
