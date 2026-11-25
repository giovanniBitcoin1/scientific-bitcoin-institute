// Correlated equilibria of a two-by-two game, for figure F2 ("The traffic
// light") and for Panel C's table. Pure logic, no library: the vertices of
// the polytope are found by enumeration (every choice of tight constraints,
// one small linear solve each), and the payoffs by a convex hull.
//
// A lottery over the cells is p = [p00, p01, p10, p11] (row's strategy first).
// A mediator draws a cell and tells each player only his own part. It is a
// correlated equilibrium when nobody gains by disobeying: for each player and
// each recommendation, the four "obedience" constraints, plus p ≥ 0 and
// Σp = 1.

const EPS = 1e-9

// The four obedience constraints as rows c with c·p ≥ 0. a is the row
// player's payoff matrix and b the column player's.
export function obedience(a, b) {
  return [
    [a[0][0] - a[1][0], a[0][1] - a[1][1], 0, 0], // row told 0
    [0, 0, a[1][0] - a[0][0], a[1][1] - a[0][1]], // row told 1
    [b[0][0] - b[0][1], 0, b[1][0] - b[1][1], 0], // column told 0
    [0, b[0][1] - b[0][0], 0, b[1][1] - b[1][0]], // column told 1
  ]
}

// Solves M x = r (n × n) by Gaussian elimination with partial pivoting;
// null when M is singular.
function solve(M, r) {
  const n = r.length
  const A = M.map((row, i) => [...row, r[i]])
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[piv][c])) piv = i
    if (Math.abs(A[piv][c]) < 1e-12) return null
    ;[A[c], A[piv]] = [A[piv], A[c]]
    for (let i = 0; i < n; i++) {
      if (i === c) continue
      const f = A[i][c] / A[c][c]
      for (let k = c; k <= n; k++) A[i][k] -= f * A[c][k]
    }
  }
  return A.map((row, i) => row[n] / row[i])
}

function* choose(n, k, start = 0, acc = []) {
  if (acc.length === k) {
    yield acc
    return
  }
  for (let i = start; i < n; i++) yield* choose(n, k, i + 1, [...acc, i])
}

// The vertices of { p : G p ≥ 0, E p = e } in four dimensions. G are the
// inequality rows, E the equality rows (Σp = 1 among them).
export function vertices(G, E, e) {
  const k = 4 - E.length
  const out = []
  for (const idx of choose(G.length, k)) {
    const x = solve([...E, ...idx.map((i) => G[i])], [...e, ...idx.map(() => 0)])
    if (!x) continue
    if (!G.every((g) => g.reduce((s, v, i) => s + v * x[i], 0) >= -EPS)) continue
    const clean = x.map((v) => (Math.abs(v) < EPS ? 0 : v))
    if (!out.some((y) => y.every((v, i) => Math.abs(v - clean[i]) < 1e-7))) out.push(clean)
  }
  return out
}

const NONNEG = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
]
const SUM = [1, 1, 1, 1]

export const correlatedVertices = (a, b) => vertices([...obedience(a, b), ...NONNEG], [SUM], [1])

// The symmetric ones (p01 = p10), for the best and the worst symmetric
// correlated equilibrium of a symmetric game.
export const symmetricVertices = (a, b) => vertices([...obedience(a, b), ...NONNEG], [SUM, [0, 1, -1, 0]], [1, 0])

export const payoffOf = (a, b, p) => [
  p[0] * a[0][0] + p[1] * a[0][1] + p[2] * a[1][0] + p[3] * a[1][1],
  p[0] * b[0][0] + p[1] * b[0][1] + p[2] * b[1][0] + p[3] * b[1][1],
]

// Convex hull of points in the plane (Andrew's monotone chain),
// counter-clockwise, without repeated or collinear points.
export function hull(points) {
  const P = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1])
  if (P.length < 3) return P
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list) => {
    const h = []
    for (const p of list) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 1e-12) h.pop()
      h.push(p)
    }
    return h
  }
  const lower = half(P)
  const upper = half(P.slice().reverse())
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

export const area = (poly) => Math.abs(poly.reduce((s, p, i) => {
  const q = poly[(i + 1) % poly.length]
  return s + p[0] * q[1] - q[0] * p[1]
}, 0)) / 2

// ---------------------------------------------- Module 01's chicken, F2

// C = swerve, D = straight. (C, C) = (3, 3), (C, D) = (1, 4), (D, C) = (4, 1),
// (D, D) = (d, d), d the payoff of a crash (0 in module 01).
export const chicken = (d = 0) => ({
  a: [[3, 1], [4, d]],
  b: [[3, 4], [1, d]],
})

// The closed forms the enumeration must agree with.
export const formulas = (d) => ({
  q: (1 - d) / (2 - d), // the mixed equilibrium's probability of C
  m: (4 - 3 * d) / (2 - d), // its payoff
  best: { p: [(1 - d) / (3 - d), 1 / (3 - d), 1 / (3 - d), 0], payoff: (8 - 3 * d) / (3 - d) },
  worst: { p: [0, (1 - d) / (3 - 2 * d), (1 - d) / (3 - 2 * d), 1 / (3 - 2 * d)], payoff: (5 - 4 * d) / (3 - 2 * d) },
  coin: 2.5,
})

// Everything F2 draws at one value of d.
export function trafficLight(d) {
  const { a, b } = chicken(d)
  const verts = correlatedVertices(a, b)
  const region = hull(verts.map((p) => payoffOf(a, b, p)))
  const sym = symmetricVertices(a, b).map((p) => ({ p, payoff: payoffOf(a, b, p)[0] }))
  sym.sort((x, y) => y.payoff - x.payoff)
  const q = (1 - d) / (2 - d)
  const mixedP = [q * q, q * (1 - q), (1 - q) * q, (1 - q) * (1 - q)]
  return {
    d,
    vertices: verts,
    region,
    area: area(region),
    feasible: hull([[3, 3], [1, 4], [4, 1], [d, d]]),
    nash: [[4, 1], [1, 4], payoffOf(a, b, mixedP)],
    mixed: { q, payoff: payoffOf(a, b, mixedP)[0], p: mixedP },
    best: sym[0],
    worst: sym[sym.length - 1],
    coin: [[1, 4], [4, 1]],
  }
}

// ----------------------------------------------- Panel C's 2 × 2 table

// How much a player could gain per round by switching whenever he played a
// given action, from the table of frequencies f (f[i][j], summing to 1) in
// the game's own payoffs. For each player and action: the best switch's gain
// (0 if none gains). max is the largest of the four: 0 exactly at a
// correlated equilibrium.
export function violation(a, b, f) {
  const row = [0, 1].map((i) => Math.max(0, [0, 1].reduce((s, j) => s + f[i][j] * (a[1 - i][j] - a[i][j]), 0)))
  const col = [0, 1].map((j) => Math.max(0, [0, 1].reduce((s, i) => s + f[i][j] * (b[i][1 - j] - b[i][j]), 0)))
  return { row, col, max: Math.max(...row, ...col) }
}
