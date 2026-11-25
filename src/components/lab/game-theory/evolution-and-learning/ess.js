// Evolutionarily stable strategies of symmetric games. Pure logic for the
// lecture's examples and the self-check.
//
// A symmetric game is a square matrix A: A[i][j] is what strategy i earns
// against j. u(x, y) = x·A y for mixed strategies x, y (lists of shares).
// x is an ESS if for every mutant y ≠ x either u(x, x) > u(y, x), or
// u(x, x) = u(y, x) and u(x, y) > u(y, y).
import { CLASSICS } from '../what-is-a-game/games.js'

const EPS = 1e-12

export const u = (A, x, y) => x.reduce((s, xi, i) => s + xi * A[i].reduce((t, a, j) => t + a * y[j], 0), 0)

// The symmetric 2 × 2 game of one of module 01's classics, as a matrix of the
// row player's payoffs (rows and columns: first strategy, second strategy).
export const symmetric = (cells) => [
  [cells[0][0], cells[1][0]],
  [cells[2][0], cells[3][0]],
]

// Every ESS of a symmetric 2 × 2 game, exactly. Returned as the share p of
// the first strategy: 1, 0, or the interior mixture.
//  - pure i is an ESS when A[i][i] > A[j][i], or A[i][i] = A[j][i] and
//    A[i][j] > A[j][j] (against two strategies the pure mutant is the
//    hardest one);
//  - an interior p* (both strategies earn the same against it) is an ESS when
//    the advantage of the first strategy, g(y) = f_1(y) − f_2(y), falls as its
//    share y rises: then u(p*, y) − u(y, y) = −(slope)(y − p*)² > 0.
export function ess2(A) {
  const out = []
  const pure = (i) => {
    const j = 1 - i
    return A[i][i] > A[j][i] + EPS || (Math.abs(A[i][i] - A[j][i]) <= EPS && A[i][j] > A[j][j] + EPS)
  }
  if (pure(0)) out.push(1)
  // g(y) = y(A00 − A10) + (1 − y)(A01 − A11)
  const g0 = A[0][1] - A[1][1]
  const g1 = A[0][0] - A[1][0]
  const slope = g1 - g0
  if (Math.abs(slope) > EPS) {
    const p = -g0 / slope
    if (p > EPS && p < 1 - EPS && slope < 0) out.push(p)
  }
  if (pure(1)) out.push(0)
  return out
}

// Symmetric Nash equilibria of a 2 × 2 game, for comparison.
export function symmetricNash2(A) {
  const out = []
  if (A[0][0] >= A[1][0] - EPS) out.push(1)
  const g0 = A[0][1] - A[1][1]
  const slope = A[0][0] - A[1][0] - g0
  if (Math.abs(slope) > EPS) {
    const p = -g0 / slope
    if (p > EPS && p < 1 - EPS) out.push(p)
  }
  if (A[1][1] >= A[0][1] - EPS) out.push(0)
  return out
}

// A numerical test for any n: x against the pure strategies and `samples`
// random mutants (drawn with `random`), plus mutants close to x. True if
// every mutant meets one of the two conditions.
export function essByMutants(A, x, random, samples = 2000) {
  const n = x.length
  const tests = []
  for (let i = 0; i < n; i++) tests.push(x.map((_, k) => (k === i ? 1 : 0)))
  for (let s = 0; s < samples; s++) {
    const e = x.map(() => -Math.log(1 - random()))
    const sum = e.reduce((a, b) => a + b, 0)
    const y = e.map((v) => v / sum)
    tests.push(y)
    const eps = 0.01 * random()
    tests.push(x.map((v, k) => (1 - eps) * v + eps * y[k]))
  }
  return tests.every((y) => {
    if (y.every((v, k) => Math.abs(v - x[k]) < 1e-12)) return true
    const d1 = u(A, x, x) - u(A, y, x)
    if (d1 > 1e-12) return true
    if (d1 < -1e-12) return false
    return u(A, x, y) - u(A, y, y) > 1e-15
  })
}

// The lecture's three examples: module 01's chicken (C the dove, D the hawk),
// the dilemma and the stag hunt.
export const HAWK_DOVE = symmetric(CLASSICS.chicken)
export const DILEMMA = symmetric(CLASSICS.pd)
export const STAG = symmetric(CLASSICS.stag)
