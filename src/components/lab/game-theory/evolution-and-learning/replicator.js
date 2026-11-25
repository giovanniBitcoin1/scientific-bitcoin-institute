// The replicator equation, for figure F1 (two strategies, module 01's (T, S)
// map) and for Panel A (three strategies on a simplex). Pure logic, shared by
// the page and scripts/lab/check-game-theory-07.mjs. No library: the
// integrator is a plain fourth-order Runge–Kutta step.
import { classifyTS, CLASSICS } from '../what-is-a-game/games.js'

const EPS = 1e-12

// ------------------------------------------------ Two strategies (F1)

// With x the share of C in a (T, S) game (R = 1, P = 0):
//   f_C = x + S(1 − x),  f_D = T x,  ẋ = x(1 − x)[(1 − T)x + S(1 − x)].
export const gain = (x, T, S) => (1 - T) * x + S * (1 - x)
export const xdot = (x, T, S) => x * (1 - x) * gain(x, T, S)

// The interior rest point x* = S/(S + T − 1), or null when there is none
// strictly between 0 and 1.
export function interior(T, S) {
  const den = S + T - 1
  if (Math.abs(den) < EPS) return null
  const x = S / den
  return x > EPS && x < 1 - EPS ? x : null
}

// Rest points with their stability, from the sign of ẋ on each side.
// stable: true (attracts from both sides), false (repels), 'semi' (attracts
// from one side only; on the border of the map).
export function restPoints(T, S) {
  const pts = [0]
  const xs = interior(T, S)
  if (xs != null) pts.push(xs)
  pts.push(1)
  const h = 1e-6
  return pts.map((x) => {
    const left = x > 0 ? xdot(x - h, T, S) : null // > 0: pushed up, towards x
    const right = x < 1 ? xdot(x + h, T, S) : null // < 0: pushed down, towards x
    const inL = left == null ? null : left > 1e-18
    const inR = right == null ? null : right < -1e-18
    const sides = [inL, inR].filter((v) => v != null)
    const stable = sides.every(Boolean) ? true : sides.some(Boolean) ? 'semi' : false
    return { x, stable }
  })
}

// The fate of a population in a (T, S) game: the four regions of module 01's
// map are four fates.
//   'C'          C takes over (harmony)
//   'D'          D takes over (prisoner's dilemma)
//   'coexist'    a stable mixture x* (chicken)
//   'bistable'   C or D, depending on which side of x* we start (stag hunt)
//   'border'     T = 1 or S = 0, one of the borders
export function fate(T, S) {
  const c = classifyTS(T, S)
  const region = c.region
  const xs = interior(T, S)
  const kind = c.border ? 'border' : { harmony: 'C', pd: 'D', chicken: 'coexist', stag: 'bistable' }[region]
  return { region, border: c.border, kind, xStar: xs, rest: restPoints(T, S) }
}

// One RK4 step of size dt for ẋ = f(x), x a number or an array.
export function rk4(f, x, dt) {
  if (typeof x === 'number') {
    const k1 = f(x)
    const k2 = f(x + (dt / 2) * k1)
    const k3 = f(x + (dt / 2) * k2)
    const k4 = f(x + dt * k3)
    return x + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
  }
  const add = (a, b, s) => a.map((v, i) => v + s * b[i])
  const k1 = f(x)
  const k2 = f(add(x, k1, dt / 2))
  const k3 = f(add(x, k2, dt / 2))
  const k4 = f(add(x, k3, dt))
  return x.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
}

// The share of C at time t, from x0, with RK4 steps of dt.
export function phaseAt(T, S, x0, t, dt = 0.01) {
  let x = x0
  const n = Math.round(t / dt)
  for (let i = 0; i < n; i++) x = rk4((y) => xdot(y, T, S), x, dt)
  return x
}

// Figure F1's presets: module 01's games read on the (T, S) map.
// Chicken (3, 3), (1, 4), (4, 1), (0, 0) rescaled so that R = 1, P = 0:
// T = 4/3, S = 1/3; the stag hunt (4, 0, 3, 2): T = 1/2, S = −1; the dilemma
// (3, 0, 5, 1): T = 2, S = −1/2.
const toTS = ([cc, cd, dc, dd]) => {
  const R = cc[0]
  const P = dd[0]
  return { T: (dc[0] - P) / (R - P), S: (cd[0] - P) / (R - P) }
}
export const F1_PRESETS = {
  pd: toTS(CLASSICS.pd),
  stag: toTS(CLASSICS.stag),
  chicken: toTS(CLASSICS.chicken),
  harmony: { T: 0.5, S: 0.5 },
}

// ------------------------------------------- Three strategies (Panel A)

// Payoffs a[i][j] of strategy i against j. Fitness f = A x, average x·A x.
export function field(A) {
  return (x) => {
    const f = A.map((row) => row.reduce((s, v, j) => s + v * x[j], 0))
    const avg = f.reduce((s, v, i) => s + v * x[i], 0)
    return x.map((v, i) => v * (f[i] - avg))
  }
}

// Rock, paper, scissors: R beats S, P beats R, S beats P; a win pays a, a
// loss costs b, a tie 0. Rows and columns R, P, S.
export const rps = (a, b) => [
  [0, -b, a],
  [a, 0, -b],
  [-b, a, 0],
]

// Module 06's three strategies over 10 rounds of module 01's dilemma (R = 3,
// S = 0, T = 5, P = 1, no discounting): always cooperate, always defect, Tit
// for Tat. Computed by playing the rounds, not typed in.
export const REPEATED_NAMES = ['ALLC', 'ALLD', 'TFT']
export function repeatedMatrix(rounds = 10) {
  const [[R], [S], [T], [P]] = CLASSICS.pd
  const pay = { CC: R, CD: S, DC: T, DD: P }
  const move = {
    ALLC: () => 'C',
    ALLD: () => 'D',
    TFT: (last) => last ?? 'C',
  }
  return REPEATED_NAMES.map((me) =>
    REPEATED_NAMES.map((other) => {
      let total = 0
      let mine = null
      let theirs = null
      for (let r = 0; r < rounds; r++) {
        const a = move[me](theirs)
        const b = move[other](mine)
        total += pay[a + b]
        mine = a
        theirs = b
      }
      return total
    }),
  )
}

// The two thresholds of the preset, from the matrix.
// Edge ALLD–TFT (y the share of TFT): TFT wins when
//   y(TT − DT) + (1 − y)(TD − DD) > 0  →  y > (DD − TD)/((DD − TD) + (TT − DT)).
// Edge ALLC–TFT (x the share of ALLC; both residents earn TT = CC): ALLD
// invades when x·DC + (1 − x)·DT > TT  →  x > (TT − DT)/(DC − DT).
export function repeatedThresholds(A = repeatedMatrix()) {
  const [C, D, T] = [0, 1, 2]
  const tft = (A[D][D] - A[T][D]) / (A[D][D] - A[T][D] + (A[T][T] - A[D][T]))
  const allc = (A[T][T] - A[D][T]) / (A[D][C] - A[D][T])
  return { tft, allc }
}

// A trajectory from x0: RK4 with dt, to tEnd, keeping every `keep`-th point.
// The state is renormalised after each step (the sum drifts by rounding only).
export function trajectory(A, x0, { dt = 0.01, tEnd = 100, keep = 10 } = {}) {
  const f = field(A)
  let x = x0.slice()
  const pts = [x.slice()]
  const n = Math.round(tEnd / dt)
  for (let i = 1; i <= n; i++) {
    x = rk4(f, x, dt).map((v) => Math.max(0, v))
    const s = x[0] + x[1] + x[2]
    x = x.map((v) => v / s)
    if (i % keep === 0 || i === n) pts.push(x.slice())
  }
  return { points: pts, end: x, dt: dt * keep }
}

// x at times ts (ascending), RK4 with dt.
export function statesAt(A, x0, ts, dt = 0.01) {
  const f = field(A)
  let x = x0.slice()
  let step = 0
  const out = []
  for (const t of ts) {
    const n = Math.round(t / dt)
    for (; step < n; step++) x = rk4(f, x, dt)
    out.push(x.slice())
  }
  return out
}

export const product = (x) => x[0] * x[1] * x[2]

// The eigenvalues of the linearised replicator at the centre of RPS:
// (b − a)/6 ± i (a + b)/(2√3).
export const centreEigen = (a, b) => ({ re: (b - a) / 6, im: (a + b) / (2 * Math.sqrt(3)) })

// The same from a numerical Jacobian of (ẋ1, ẋ2), with x3 = 1 − x1 − x2.
export function numericEigen(A, x = [1 / 3, 1 / 3, 1 / 3], h = 1e-6) {
  const f = field(A)
  const g = (u, v) => f([u, v, 1 - u - v]).slice(0, 2)
  const [u, v] = x
  const du = g(u + h, v).map((p, i) => (p - g(u - h, v)[i]) / (2 * h))
  const dv = g(u, v + h).map((p, i) => (p - g(u, v - h)[i]) / (2 * h))
  const tr = du[0] + dv[1]
  const det = du[0] * dv[1] - dv[0] * du[1]
  const disc = tr * tr - 4 * det
  return disc < 0 ? { re: tr / 2, im: Math.sqrt(-disc) / 2 } : { re: tr / 2, im: 0, real: [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2] }
}

// The period of a closed orbit (between successive maxima of x_1, found by
// parabolic interpolation) and the time average of x over that period.
export function period(A, x0, { dt = 0.01, tEnd = 100 } = {}) {
  const f = field(A)
  let x = x0.slice()
  const hist = [x.slice()]
  const n = Math.round(tEnd / dt)
  for (let i = 0; i < n; i++) {
    x = rk4(f, x, dt)
    hist.push(x.slice())
  }
  const peaks = []
  for (let i = 1; i < hist.length - 1; i++) {
    const [a, b, c] = [hist[i - 1][0], hist[i][0], hist[i + 1][0]]
    if (b > a && b >= c) {
      const off = (a - c) / (2 * (a - 2 * b + c)) // vertex of the parabola, in steps
      peaks.push(i + off)
    }
  }
  if (peaks.length < 2) return null
  const P = (peaks[1] - peaks[0]) * dt
  // Time average over [peak0, peak1] with the trapezoid rule on the samples.
  const i0 = Math.round(peaks[0])
  const i1 = Math.round(peaks[1])
  const avg = [0, 0, 0]
  for (let i = i0; i < i1; i++) for (let k = 0; k < 3; k++) avg[k] += ((hist[i][k] + hist[i + 1][k]) / 2) * dt
  return { period: P, average: avg.map((v) => v / ((i1 - i0) * dt)), peaks: peaks.map((p) => p * dt) }
}

// Simplex coordinates: corner 0 at the top, 1 bottom left, 2 bottom right.
// Barycentric x → point (px, py) in a triangle of side `side`, and back.
export function toXY(x, side, ox = 0, oy = 0) {
  const h = (side * Math.sqrt(3)) / 2
  const C = [[side / 2, 0], [0, h], [side, h]]
  return [ox + x[0] * C[0][0] + x[1] * C[1][0] + x[2] * C[2][0], oy + x[0] * C[0][1] + x[1] * C[1][1] + x[2] * C[2][1]]
}
export function fromXY(px, py, side, ox = 0, oy = 0) {
  const h = (side * Math.sqrt(3)) / 2
  const u = px - ox
  const v = py - oy
  const x0 = 1 - v / h
  const x2 = (u - side / 2 + (side / 2) * (v / h)) / side
  const x1 = 1 - x0 - x2
  return [x0, x1, x2]
}
// Inside the triangle (all coordinates ≥ 0)?
export const inSimplex = (x, tol = 1e-9) => x.every((v) => v >= -tol)
