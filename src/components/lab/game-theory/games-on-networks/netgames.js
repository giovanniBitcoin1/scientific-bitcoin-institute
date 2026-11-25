// Games on networks, the shared logic of module 09: small undirected
// networks, their adjacency matrices, a symmetric eigenvalue method (Jacobi
// rotations), a matrix inverse (Gauss–Jordan), and the linear game of F1,
// where player i's best reply is x_i = max(0, 1 + δ Σ_j g_ij x_j). Plain
// JavaScript, no DOM: scripts/lab/check-game-theory-09.mjs imports it.
//
// Players are numbered from 0 here and from 1 on the page.

// A network of n players from a list of links [i, j] (0-based).
export function graph(n, edges, name = '') {
  const adj = Array.from({ length: n }, () => new Array(n).fill(0))
  const nbrs = Array.from({ length: n }, () => [])
  for (const [i, j] of edges) {
    if (i === j || adj[i][j]) continue
    adj[i][j] = adj[j][i] = 1
    nbrs[i].push(j)
    nbrs[j].push(i)
  }
  for (const l of nbrs) l.sort((a, b) => a - b)
  return { n, edges: edges.map(([i, j]) => [Math.min(i, j), Math.max(i, j)]), adj, nbrs, name }
}

const range = (n) => Array.from({ length: n }, (_, i) => i)
export const star = (leaves) => graph(leaves + 1, range(leaves).map((i) => [0, i + 1]), `star${leaves + 1}`)
export const line = (n) => graph(n, range(n - 1).map((i) => [i, i + 1]), `line${n}`)
export const ring = (n) => graph(n, range(n).map((i) => [i, (i + 1) % n]), `ring${n}`)
export function grid(rows, cols) {
  const e = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = r * cols + c
      if (c + 1 < cols) e.push([v, v + 1])
      if (r + 1 < rows) e.push([v, v + cols])
    }
  return graph(rows * cols, e, `grid${rows}x${cols}`)
}
// Panel B's "Bridge": a triangle 1–2–3; 1–4; 4–5, 4–6; 5–7, 5–8; 6–9.
export const bridge = () =>
  graph(9, [[0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [3, 5], [4, 6], [4, 7], [5, 8]], 'bridge')

// The networks of the module, with fixed layouts in a 300 × 170 box.
export const NETWORKS = {
  star5: { make: () => star(4), layout: [[150, 85], [150, 22], [233, 85], [150, 148], [67, 85]] },
  line5: { make: () => line(5), layout: [[30, 85], [90, 85], [150, 85], [210, 85], [270, 85]] },
  star6: {
    make: () => star(5),
    layout: [[150, 88], ...range(5).map((k) => [150 + 68 * Math.sin((2 * Math.PI * k) / 5), 88 - 68 * Math.cos((2 * Math.PI * k) / 5)])],
  },
  ring6: { make: () => ring(6), layout: range(6).map((k) => [150 + 70 * Math.sin((2 * Math.PI * k) / 6), 85 - 70 * Math.cos((2 * Math.PI * k) / 6)]) },
  grid3: { make: () => grid(3, 3), layout: range(9).map((v) => [90 + 60 * (v % 3), 25 + 60 * Math.floor(v / 3)]) },
  bridge: {
    make: bridge,
    layout: [[110, 85], [40, 40], [40, 130], [170, 85], [220, 40], [220, 130], [275, 18], [275, 70], [275, 140]],
  },
}

// ------------------------------------------------------------------ linear algebra

// Eigenvalues of a symmetric matrix by cyclic Jacobi rotations, ascending.
export function eigenvalues(A, tol = 1e-14) {
  const n = A.length
  const a = A.map((r) => r.slice())
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q]
    if (off < tol * tol) break
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let k = 0; k < n; k++) {
          const akp = a[k][p]
          const akq = a[k][q]
          a[k][p] = c * akp - s * akq
          a[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k]
          const aqk = a[q][k]
          a[p][k] = c * apk - s * aqk
          a[q][k] = s * apk + c * aqk
        }
      }
  }
  return range(n).map((i) => a[i][i]).sort((x, y) => x - y)
}

export const lambdaMax = (g) => eigenvalues(g.adj).at(-1)
export const lambdaMin = (g) => eigenvalues(g.adj)[0]

// Inverse by Gauss–Jordan elimination with partial pivoting.
export function inverse(A) {
  const n = A.length
  const m = A.map((r, i) => [...r, ...range(n).map((j) => (i === j ? 1 : 0))])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r
    if (Math.abs(m[piv][col]) < 1e-14) throw new Error('singular matrix')
    ;[m[col], m[piv]] = [m[piv], m[col]]
    const d = m[col][col]
    for (let k = 0; k < 2 * n; k++) m[col][k] /= d
    for (let r = 0; r < n; r++) {
      if (r === col || m[r][col] === 0) continue
      const f = m[r][col]
      for (let k = 0; k < 2 * n; k++) m[r][k] -= f * m[col][k]
    }
  }
  return m.map((r) => r.slice(n))
}

// ------------------------------------------------------------------ the linear game

export const reply = (g, delta, x, i) => Math.max(0, 1 + delta * g.nbrs[i].reduce((s, j) => s + x[j], 0))

// Best responses in turn, players 1 to n, from x0 until no effort moves by
// more than tol in a whole turn. Returns the efforts and the number of turns.
export function bestResponses(g, delta, x0 = new Array(g.n).fill(0), tol = 1e-13, maxTurns = 100000) {
  const x = x0.slice()
  for (let t = 1; t <= maxTurns; t++) {
    let moved = 0
    for (let i = 0; i < g.n; i++) {
      const v = reply(g, delta, x, i)
      moved = Math.max(moved, Math.abs(v - x[i]))
      x[i] = v
    }
    if (moved <= tol) return { x, turns: t, ended: true }
  }
  return { x, turns: maxTurns, ended: false }
}

// Largest gap between an effort and the best reply to the others.
export const equilibriumGap = (g, delta, x) => Math.max(...x.map((v, i) => Math.abs(v - reply(g, delta, x, i))))

// F1's star (a hub and four leaves) in closed form: while 1 + 4δ ≥ 0 the hub
// works (1 + 4δ)/(1 − 4δ²) and each leaf (1 + δ)/(1 − 4δ²); below, the hub
// stops and each leaf works 1. At 1 + 4δ = 0 both give hub 0, leaf 1: the
// regime is then "the hub stops".
export function starFormula(delta, leaves = 4) {
  if (1 + leaves * delta > 1e-12) {
    const d = 1 - leaves * delta * delta
    const hub = (1 + leaves * delta) / d
    const leaf = (1 + delta) / d
    return { hub, leaf, total: hub + leaves * leaf, regime: delta > 0 ? 'complements' : delta < 0 ? 'substitutes' : 'none' }
  }
  return { hub: 0, leaf: 1, total: leaves, regime: 'hubstops' }
}

// F1's chart: hub and leaf efforts at δ = −0.45, −0.44, ..., 0.45.
export function starCurve(lo = -0.45, hi = 0.45, step = 0.005) {
  const pts = { hub: [], leaf: [] }
  for (let k = Math.round(lo / step); k <= Math.round(hi / step); k++) {
    const d = k * step
    const f = starFormula(d)
    pts.hub.push([d, f.hub])
    pts.leaf.push([d, f.leaf])
  }
  return pts
}
