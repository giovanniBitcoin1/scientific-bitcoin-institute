// Module 03, "Centrality": every measure of the module as plain functions,
// shared by the panels, the live figures and scripts/lab/check-network-03.mjs.
//
// A network is { n, A, B }: n nodes and the link list as two parallel arrays.
// `undirected(net)` and `directed(net)` turn it into the form the measures
// read, G = { n, out, inn, directed }: out[v] lists the nodes v points to and
// inn[v] the nodes pointing to v. In an undirected network the two lists are
// the same array (the neighbours of v), and a link a–b counts in both
// directions.

export function undirected(net) {
  const adj = Array.from({ length: net.n }, () => [])
  for (let e = 0; e < net.A.length; e++) {
    adj[net.A[e]].push(net.B[e])
    adj[net.B[e]].push(net.A[e])
  }
  return { n: net.n, out: adj, inn: adj, directed: false, links: net.A.length }
}

// A link e goes from A[e] to B[e].
export function directed(net) {
  const out = Array.from({ length: net.n }, () => [])
  const inn = Array.from({ length: net.n }, () => [])
  for (let e = 0; e < net.A.length; e++) {
    out[net.A[e]].push(net.B[e])
    inn[net.B[e]].push(net.A[e])
  }
  return { n: net.n, out, inn, directed: true, links: net.A.length }
}

// ---------------------------------------------------------------- Degree

export const degree = (G) => Float64Array.from(G.out, (list) => list.length)
export const inDegree = (G) => Float64Array.from(G.inn, (list) => list.length)

// ---------------------------------------------------------------- Distances

// Breadth-first search from s. dist[v] is the number of steps (−1 when v
// cannot be reached), sigma[v] the number of shortest paths from s to v and
// order the nodes reached, nearest first.
export function search(G, s) {
  const dist = new Int32Array(G.n).fill(-1)
  const sigma = new Float64Array(G.n)
  const order = []
  dist[s] = 0
  sigma[s] = 1
  order.push(s)
  for (let head = 0; head < order.length; head++) {
    const u = order[head]
    for (const v of G.out[u]) {
      if (dist[v] < 0) {
        dist[v] = dist[u] + 1
        order.push(v)
      }
      if (dist[v] === dist[u] + 1) sigma[v] += sigma[u]
    }
  }
  return { dist, sigma, order }
}

// Closeness: (N − 1) over the sum of the distances to everyone else. In a
// network in several pieces the sum runs over the r nodes that can be reached
// and the result is scaled by the share reached, r / (N − 1) (Wasserman and
// Faust's correction): in a connected network this changes nothing.
export function closeness(G) {
  const c = new Float64Array(G.n)
  if (G.n < 2) return c
  for (let s = 0; s < G.n; s++) {
    const { dist, order } = search(G, s)
    let sum = 0
    for (const v of order) sum += dist[v]
    const r = order.length - 1
    c[s] = sum > 0 ? (r / (G.n - 1)) * (r / sum) : 0
  }
  return c
}

// Harmonic closeness: the average of 1/distance to everyone else, with
// 1/∞ = 0 for a node that cannot be reached.
export function harmonic(G) {
  const h = new Float64Array(G.n)
  if (G.n < 2) return h
  for (let s = 0; s < G.n; s++) {
    const { dist, order } = search(G, s)
    let sum = 0
    for (const v of order) if (v !== s) sum += 1 / dist[v]
    h[s] = sum / (G.n - 1)
  }
  return h
}

// ---------------------------------------------------------------- Betweenness

// Betweenness of every node of an undirected network, by Brandes' algorithm:
// for each pair of other nodes, the share of their shortest paths that pass
// through the node, summed over the pairs (each pair once).
export function betweenness(G) {
  const bc = new Float64Array(G.n)
  const delta = new Float64Array(G.n)
  for (let s = 0; s < G.n; s++) {
    const { dist, sigma, order } = search(G, s)
    delta.fill(0)
    for (let i = order.length - 1; i > 0; i--) {
      const w = order[i]
      for (const v of G.out[w]) {
        if (dist[v] === dist[w] - 1) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
      }
      bc[w] += delta[w]
    }
  }
  for (let v = 0; v < G.n; v++) bc[v] /= 2
  return bc
}

// The same numbers by brute force, straight from the definition: for every
// pair s < t and every other node v, v is on σ(s,v)·σ(v,t) of the σ(s,t)
// shortest paths when d(s,v) + d(v,t) = d(s,t).
export function betweennessBrute(G) {
  const all = Array.from({ length: G.n }, (_, s) => search(G, s))
  const bc = new Float64Array(G.n)
  for (let s = 0; s < G.n; s++) {
    for (let t = s + 1; t < G.n; t++) {
      const d = all[s].dist[t]
      if (d < 0) continue
      for (let v = 0; v < G.n; v++) {
        if (v === s || v === t) continue
        if (all[s].dist[v] >= 0 && all[v].dist[t] >= 0 && all[s].dist[v] + all[v].dist[t] === d) {
          bc[v] += (all[s].sigma[v] * all[v].sigma[t]) / all[s].sigma[t]
        }
      }
    }
  }
  return bc
}

// Number of pairs of other nodes, the largest value betweenness can take.
export const pairsOfOthers = (n) => ((n - 1) * (n - 2)) / 2
export const normalized = (bc, n) => bc.map((b) => (n > 2 ? b / pairsOfOthers(n) : 0))

// Every shortest path from s to t, as lists of nodes (at most `cap` of them;
// `count` is the true number).
export function shortestPaths(G, s, t, cap = 60) {
  const { dist, sigma } = search(G, s)
  if (dist[t] < 0) return { count: 0, length: -1, paths: [] }
  const paths = []
  const walk = (v, tail) => {
    if (paths.length >= cap) return
    if (v === s) {
      paths.push([s, ...tail])
      return
    }
    for (const u of G.inn[v]) if (dist[u] === dist[v] - 1) walk(u, [v, ...tail])
  }
  walk(t, [])
  return { count: sigma[t], length: dist[t], paths }
}

// ---------------------------------------------------------------- Eigenvector

// One round of "replace every score by the sum of the scores of the nodes
// pointing to it, then rescale so that the largest is 1".
export function neighbourStep(G, x) {
  const y = new Float64Array(G.n)
  let max = 0
  for (let v = 0; v < G.n; v++) {
    let s = 0
    for (const u of G.inn[v]) s += x[u]
    y[v] = s
    if (s > max) max = s
  }
  if (max > 0) for (let v = 0; v < G.n; v++) y[v] /= max
  return y
}

// Leading eigenvector of the adjacency matrix (scores flow along the links,
// so a node collects from the nodes pointing to it), largest entry 1, and the
// leading eigenvalue. Power iteration on A + I: adding the identity leaves
// the eigenvectors alone and stops the scores of a bipartite network (a star,
// a path) from flipping back and forth for ever.
export function eigenvector(G, { tol = 1e-13, maxIter = 20000 } = {}) {
  let x = new Float64Array(G.n).fill(1)
  let iterations = 0
  let converged = G.n === 0
  while (!converged && iterations < maxIter) {
    const y = new Float64Array(G.n)
    let max = 0
    for (let v = 0; v < G.n; v++) {
      let s = x[v]
      for (const u of G.inn[v]) s += x[u]
      y[v] = s
      if (s > max) max = s
    }
    let change = 0
    for (let v = 0; v < G.n; v++) {
      y[v] /= max
      change = Math.max(change, Math.abs(y[v] - x[v]))
    }
    x = y
    iterations++
    converged = change < tol
  }
  // Rayleigh-style estimate of the eigenvalue: total of Ax over total of x.
  let ax = 0
  let sx = 0
  for (let v = 0; v < G.n; v++) {
    sx += x[v]
    for (const u of G.inn[v]) ax += x[u]
  }
  return { vector: x, value: sx > 0 ? ax / sx : 0, iterations, converged }
}

// ---------------------------------------------------------------- Katz

// Solves M x = b by Gaussian elimination with partial pivoting (M is a list
// of rows and is overwritten). Used on networks of a few dozen nodes.
export function solve(M, b) {
  const n = b.length
  const x = Float64Array.from(b)
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    if (Math.abs(M[pivot][col]) < 1e-300) return null
    if (pivot !== col) {
      ;[M[pivot], M[col]] = [M[col], M[pivot]]
      ;[x[pivot], x[col]] = [x[col], x[pivot]]
    }
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col]
      if (f === 0) continue
      for (let c = col; c < n; c++) M[r][c] -= f * M[col][c]
      x[r] -= f * x[col]
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = x[r]
    for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c]
    x[r] = s / M[r][r]
  }
  return x
}

// Katz centrality: x = α·(sum of the scores of the nodes pointing to me) + 1,
// solved exactly. α must stay below 1/λ, λ the leading eigenvalue. The result
// is rescaled so that the largest score is 1; `raw` keeps the solution.
export function katz(G, alpha) {
  const M = Array.from({ length: G.n }, (_, v) => {
    const row = new Float64Array(G.n)
    row[v] = 1
    for (const u of G.inn[v]) row[u] -= alpha
    return row
  })
  const raw = solve(M, new Float64Array(G.n).fill(1)) || new Float64Array(G.n)
  let max = 0
  for (const v of raw) if (v > max) max = v
  return { vector: raw.map((v) => (max > 0 ? v / max : 0)), raw }
}

// Katz with α given as a fraction of its limit 1/λ.
export function katzFraction(G, fraction, lambda = eigenvector(G).value) {
  return katz(G, lambda > 0 ? fraction / lambda : 0).vector
}

// ---------------------------------------------------------------- PageRank

// PageRank with damping α: a node shares its score equally among the nodes
// it points to; a node with no outgoing link spreads it evenly over all
// nodes; and a share 1 − α of every score is spread evenly as well (the
// random jump). The scores sum to 1.
//
// With α < 1 the plain iteration converges. With α = 1 it may circle for ever
// (a closed loop of three pages), so each round is averaged with the previous
// one: the "lazy" walk has the same resting distribution and always settles.
export function pagerank(G, alpha = 0.85, { tol = 1e-14, maxIter = 200000 } = {}) {
  const n = G.n
  let p = new Float64Array(n).fill(n ? 1 / n : 0)
  const lazy = alpha >= 1 ? 0.5 : 0
  let iterations = 0
  let converged = n === 0
  while (!converged && iterations < maxIter) {
    const q = new Float64Array(n)
    let dangling = 0
    for (let v = 0; v < n; v++) if (G.out[v].length === 0) dangling += p[v]
    const base = (1 - alpha) / n + (alpha * dangling) / n
    let change = 0
    for (let v = 0; v < n; v++) {
      let s = 0
      for (const u of G.inn[v]) s += p[u] / G.out[u].length
      q[v] = lazy * p[v] + (1 - lazy) * (base + alpha * s)
      change += Math.abs(q[v] - p[v])
    }
    p = q
    iterations++
    converged = change < tol
  }
  return { vector: p, iterations, converged }
}

// One step of the random surfer standing on page `at`. With probability α it
// follows one of the page's links, chosen at random; otherwise, or when the
// page has no outgoing link, it jumps to a page chosen at random.
export function surf(G, at, alpha, random) {
  const links = G.out[at]
  if (links.length && random() < alpha) return { next: links[Math.floor(random() * links.length)], jumped: false }
  return { next: Math.floor(random() * G.n), jumped: true }
}

// ---------------------------------------------------------------- Hubs and authorities

// Kleinberg's two scores. A page's authority is the sum of the hub scores of
// the pages pointing to it; its hub score is the sum of the authorities of
// the pages it points to. Repeating the two steps is power iteration on AᵀA.
// Both vectors are returned with sum 1; `value` is the eigenvalue of AᵀA.
export function hits(G, { tol = 1e-15, maxIter = 100000 } = {}) {
  const n = G.n
  let a = new Float64Array(n).fill(1 / Math.max(1, n))
  let h = new Float64Array(n)
  let value = 0
  let iterations = 0
  let converged = n === 0
  const sum = (x) => x.reduce((s, v) => s + v, 0)
  const hubsOf = (auth) => Float64Array.from(G.out, (list) => list.reduce((s, v) => s + auth[v], 0))
  const authOf = (hub) => Float64Array.from(G.inn, (list) => list.reduce((s, u) => s + hub[u], 0))
  while (!converged && iterations < maxIter) {
    h = hubsOf(a)
    const next = authOf(h)
    const total = sum(next)
    if (total === 0) break
    value = total / sum(a)
    let change = 0
    for (let v = 0; v < n; v++) {
      next[v] /= total
      change += Math.abs(next[v] - a[v])
    }
    a = next
    iterations++
    converged = change < tol
  }
  h = hubsOf(a)
  const th = sum(h)
  return { authority: a, hub: th > 0 ? h.map((v) => v / th) : h, value, iterations, converged }
}

// ---------------------------------------------------------------- Rankings

export const toSum = (x) => {
  let s = 0
  for (const v of x) s += v
  return s > 0 ? Float64Array.from(x, (v) => v / s) : Float64Array.from(x)
}

// Scores that differ by less than this are a tie (rounding noise of the
// iterations must not decide a ranking).
export const TIE = 1e-9

// Rank of every node, 1 for the largest score. Tied nodes share the average
// of the places they occupy (1, 2.5, 2.5, 4): the ranks Spearman needs.
export function ranks(values) {
  const idx = Array.from(values, (_, i) => i).sort((a, b) => values[b] - values[a])
  const rank = new Float64Array(values.length)
  for (let i = 0; i < idx.length; ) {
    let j = i
    while (j + 1 < idx.length && Math.abs(values[idx[j + 1]] - values[idx[i]]) <= TIE) j++
    for (let k = i; k <= j; k++) rank[idx[k]] = (i + j) / 2 + 1
    i = j + 1
  }
  return rank
}

// Place in the list as people write it: tied nodes share the best place
// (1, 2, 2, 4). `tied[v]` says whether v shares its place.
export function places(values) {
  const idx = Array.from(values, (_, i) => i).sort((a, b) => values[b] - values[a] || a - b)
  const place = new Int32Array(values.length)
  const tied = new Uint8Array(values.length)
  for (let i = 0; i < idx.length; ) {
    let j = i
    while (j + 1 < idx.length && Math.abs(values[idx[j + 1]] - values[idx[i]]) <= TIE) j++
    for (let k = i; k <= j; k++) {
      place[idx[k]] = i + 1
      tied[idx[k]] = j > i ? 1 : 0
    }
    i = j + 1
  }
  return { place, tied, order: idx }
}

// Spearman's rank correlation: Pearson's correlation of the two lists of
// ranks. NaN when one of the lists is all ties.
export function spearman(a, b) {
  const ra = ranks(a)
  const rb = ranks(b)
  const n = ra.length
  const mean = (n + 1) / 2
  let sab = 0
  let saa = 0
  let sbb = 0
  for (let i = 0; i < n; i++) {
    sab += (ra[i] - mean) * (rb[i] - mean)
    saa += (ra[i] - mean) ** 2
    sbb += (rb[i] - mean) ** 2
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : NaN
}

// The k nodes with the largest scores. Ties are broken at random, so that a
// measure with many equal scores is not credited with a top k it cannot
// actually tell apart.
export function topK(values, k, random) {
  const key = Float64Array.from(values, () => random())
  return Array.from(values, (_, i) => i)
    .sort((a, b) => (Math.abs(values[b] - values[a]) > TIE ? values[b] - values[a] : key[a] - key[b]))
    .slice(0, k)
}

export function overlap(listA, listB) {
  const set = new Set(listA)
  let both = 0
  for (const v of listB) if (set.has(v)) both++
  return listA.length ? both / listA.length : 0
}

// ---------------------------------------------------------------- All at once

export const MEASURE_IDS = ['degree', 'closeness', 'harmonic', 'betweenness', 'eigenvector', 'katz', 'pagerank']

export const KATZ_DEFAULT = 0.5 // α as a fraction of its limit 1/λ
export const DAMPING_DEFAULT = 0.85

// Every measure of Panel A on an undirected network. Betweenness is
// normalised by the number of pairs of other nodes.
export function allMeasures(net, { katzFrac = KATZ_DEFAULT, damping = DAMPING_DEFAULT } = {}) {
  const G = undirected(net)
  const eig = eigenvector(G)
  return {
    G,
    lambda: eig.value,
    degree: degree(G),
    closeness: closeness(G),
    harmonic: harmonic(G),
    betweenness: normalized(betweenness(G), G.n),
    eigenvector: eig.vector,
    katz: katzFraction(G, katzFrac, eig.value),
    pagerank: pagerank(G, damping).vector,
  }
}

// Spearman correlation between every pair of measures.
export function correlationMatrix(measures, ids = MEASURE_IDS) {
  return ids.map((a) => ids.map((b) => (a === b ? 1 : spearman(measures[a], measures[b]))))
}

// Connected components of an undirected G: sizes, largest first.
export function pieces(G) {
  const label = new Int32Array(G.n).fill(-1)
  const sizes = []
  for (let s = 0; s < G.n; s++) {
    if (label[s] >= 0) continue
    const { order } = search(G, s)
    for (const v of order) label[v] = sizes.length
    sizes.push(order.length)
  }
  return { label, sizes: sizes.slice().sort((a, b) => b - a), count: sizes.length }
}
