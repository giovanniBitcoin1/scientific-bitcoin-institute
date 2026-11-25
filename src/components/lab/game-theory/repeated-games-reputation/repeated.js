// Module 06, figures F1 and F2: module 01's prisoner's dilemma played again
// and again. Pure logic, shared by the figures and by
// scripts/lab/check-game-theory-06.mjs.
//
// Payoffs (row, column): CC (R, R), CD (S, T), DC (T, S), DD (P, P), with
// R = 3, S = 0, P = 1 and the temptation T = 5 unless a figure changes it.
// A stream u_0, u_1, … is weighted by δ^t; its average payoff is
// (1 − δ)(u_0 + δ u_1 + δ² u_2 + …), on the scale of one round.

export const R = 3
export const S = 0
export const P = 1
export const T_DEFAULT = 5

// ------------------------------------------------------------------ F1

// Grim trigger: cooperate until someone defects, then defect for ever.
// Cooperating gives R on average; defecting today gives (1 − δ)T + δP.
export function threshold(T, r = R, p = P) {
  return (T - r) / (T - p)
}

export function averages(T, delta, r = R, p = P) {
  return { cooperate: r, defect: (1 - delta) * T + delta * p }
}

// The two rows of bars of F1, rounds 0 … n − 1: full height u_t and
// discounted height δ^t u_t.
export function bars(T, delta, n = 12, r = R, p = P) {
  const rows = { cooperate: [], defect: [] }
  for (let t = 0; t < n; t++) {
    const w = delta ** t
    rows.cooperate.push({ t, u: r, d: w * r })
    const u = t === 0 ? T : p
    rows.defect.push({ t, u, d: w * u })
  }
  return rows
}

// Which plan wins at (T, δ): 'cooperate', 'defect' or 'tie' (within 1e-12).
export function winner(T, delta) {
  const a = averages(T, delta)
  const g = a.cooperate - a.defect
  if (Math.abs(g) < 1e-12) return 'tie'
  return g > 0 ? 'cooperate' : 'defect'
}

// ------------------------------------------------------------------ F2

// The four cells as points of the plane of average payoffs (v1, v2).
export const CELLS = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] }
export const MINMAX = 1

// The feasible set: the convex hull of the four cells, a quadrilateral,
// listed counter-clockwise.
export const FEASIBLE = [CELLS.DD, CELLS.DC, CELLS.CC, CELLS.CD]

const EPS = 1e-12

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

// Inside a convex polygon listed counter-clockwise (the border included).
export function insidePolygon(poly, v) {
  for (let i = 0; i < poly.length; i++) {
    if (cross(poly[i], poly[(i + 1) % poly.length], v) < -1e-9) return false
  }
  return true
}

export function feasible(v) {
  return insidePolygon(FEASIBLE, v)
}

// Barycentric coordinates of v in the triangle a, b, c.
function barycentric(v, a, b, c) {
  const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
  const l1 = ((b[1] - c[1]) * (v[0] - c[0]) + (c[0] - b[0]) * (v[1] - c[1])) / d
  const l2 = ((c[1] - a[1]) * (v[0] - c[0]) + (a[0] - c[0]) * (v[1] - c[1])) / d
  return [l1, l2, 1 - l1 - l2]
}

// The public lottery of the simple scheme: the weights of the four cells.
// A point with v1 + v2 > 5 is a mixture of CC, CD and DC; any other point
// of CD, DC and DD. Null when the point is not feasible.
export function weights(v) {
  if (!feasible(v)) return null
  const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x)
  if (v[0] + v[1] > 5 + EPS) {
    const [a, b, c] = barycentric(v, CELLS.CC, CELLS.CD, CELLS.DC)
    return { CC: clean(a), CD: clean(b), DC: clean(c), DD: 0 }
  }
  const [b, c, d] = barycentric(v, CELLS.CD, CELLS.DC, CELLS.DD)
  return { CC: 0, CD: clean(b), DC: clean(c), DD: clean(d) }
}

// The patience the scheme needs at v: each round the lottery picks a cell
// and both play it; whoever deviates is punished with D for ever (average
// 1). A player told to cooperate against a cooperator gives up 2 by
// obeying (5 instead of 3), one told to cooperate against a defector gives
// up 1 (1 instead of 0): the constraints δ(v_i − 1) ≥ (1 − δ)·2 and
// δ(v_i − 1) ≥ (1 − δ)·1. So δ ≥ 2/(1 + min v) when CC is in the lottery,
// δ ≥ 1/min v otherwise; 0 at DD itself (the stage equilibrium).
// Returns { feasible, rational, delta } where delta is null when the point
// is not feasible, Infinity when it is not individually rational, and 1 on
// the lines v_i = 1 (sustainable only in the limit δ → 1).
export function deltaNeeded(v) {
  if (!feasible(v)) return { feasible: false, rational: false, delta: null }
  const m = Math.min(v[0], v[1])
  if (Math.abs(v[0] - 1) < EPS && Math.abs(v[1] - 1) < EPS) return { feasible: true, rational: true, delta: 0 }
  if (m < 1 - EPS) return { feasible: true, rational: false, delta: Infinity }
  const delta = v[0] + v[1] > 5 + EPS ? 2 / (1 + m) : 1 / m
  return { feasible: true, rational: true, delta: Math.min(1, delta) }
}

// Sustainable at δ < 1: rational, and δ at least the patience needed; a
// point on the line v_i = 1 (other than DD) needs δ → 1 and never is.
export function sustainable(v, delta) {
  const d = deltaNeeded(v)
  if (!d.feasible || !d.rational) return false
  if (d.delta === 0) return true
  if (d.delta >= 1 - EPS) return false
  return delta >= d.delta - EPS
}

// The individually rational part of the feasible set: v1 ≥ 1 and v2 ≥ 1.
// Its corners are (1, 1), (13/3, 1), (3, 3), (1, 13/3); area 20/3.
export function clip(poly, a, b, c) {
  // Keep the half-plane a·x + b·y ≥ c (Sutherland–Hodgman, one edge).
  const out = []
  const val = (q) => a * q[0] + b * q[1] - c
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const vp = val(p)
    const vq = val(q)
    if (vp >= 0) out.push(p)
    if ((vp >= 0) !== (vq >= 0)) {
      const s = vp / (vp - vq)
      out.push([p[0] + s * (q[0] - p[0]), p[1] + s * (q[1] - p[1])])
    }
  }
  // Drop repeated corners (a clipping line through a corner adds it twice).
  return out.filter((p, i) => {
    const q = out[(i + 1) % out.length]
    return out.length < 2 || Math.abs(p[0] - q[0]) > 1e-12 || Math.abs(p[1] - q[1]) > 1e-12
  })
}

export function area(poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    s += p[0] * q[1] - q[0] * p[1]
  }
  return Math.abs(s) / 2
}

export function rationalSet() {
  return clip(clip(FEASIBLE, 1, 0, MINMAX), 0, 1, MINMAX)
}

// The part sustainable at δ, as up to two polygons: the points with
// v1 + v2 ≤ 5 and min v ≥ 1/δ, and those with v1 + v2 ≥ 5 and
// min v ≥ 2/δ − 1. Empty pieces are dropped.
export function sustainableSet(delta) {
  if (delta <= 0) return []
  const pieces = []
  const m1 = 1 / delta
  let lower = clip(clip(clip(FEASIBLE, 1, 0, m1), 0, 1, m1), -1, -1, -5)
  if (lower.length >= 3 && area(lower) > 1e-12) pieces.push(lower)
  const m2 = 2 / delta - 1
  let upper = clip(clip(clip(FEASIBLE, 1, 0, m2), 0, 1, m2), 1, 1, 5)
  if (upper.length >= 3 && area(upper) > 1e-12) pieces.push(upper)
  return pieces
}

// Share of the individually rational set that is sustainable at δ, on a
// grid of n × n cells over the square [1, 13/3]² (cell centres).
export function sustainableShare(delta, n = 1500) {
  const lo = 1
  const hi = 13 / 3
  const h = (hi - lo) / n
  let ir = 0
  let ok = 0
  for (let i = 0; i < n; i++) {
    const x = lo + (i + 0.5) * h
    for (let j = 0; j < n; j++) {
      const y = lo + (j + 0.5) * h
      const v = [x, y]
      if (!feasible(v)) continue
      ir++
      if (sustainable(v, delta)) ok++
    }
  }
  return ok / ir
}
