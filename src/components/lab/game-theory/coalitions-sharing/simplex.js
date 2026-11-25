// A small dense simplex on exact fractions (module 08's frac.js), with Bland's
// rule, for the linear programmes of module 10: the core test, the least core
// and the nucleolus. Exact, so that "the core is a single point" and "the
// core is empty" are decided without rounding. Two phases: phase 1 finds a
// feasible basis with artificial variables, phase 2 minimises the objective.
// Bland's rule (the lowest index enters, ties in the ratio test go to the
// lowest basic index) cannot cycle.
//
//   solveLP({ c, rows, free })
//     c     objective coefficients, minimised (fractions or integers)
//     rows  [{ a: [coefficients], op: '>=' | '<=' | '=', b }]
//     free  true: every variable is free (any sign); false: x ≥ 0;
//           or an array of booleans, one per variable
//   → { status: 'optimal' | 'infeasible' | 'unbounded', x, value, pivots }

import { frac, ZERO, add, sub, mul, div, cmp } from '../congestion-price-of-anarchy/frac.js'

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : frac(v))
const isZero = (a) => a.n === 0n
const neg = (a) => frac(-a.n, a.d)

export function solveLP({ c, rows, free = true }) {
  const nv = c.length
  const freeOf = (j) => (Array.isArray(free) ? free[j] : free)
  // Columns of the standard form: each variable as one column (x ≥ 0) or two
  // (x = p − q), then one slack or surplus per inequality, then artificials.
  const varCols = []
  let ncol = 0
  for (let j = 0; j < nv; j++) {
    varCols.push(freeOf(j) ? [ncol, ncol + 1] : [ncol])
    ncol += freeOf(j) ? 2 : 1
  }
  const nReal = ncol
  // Normalise every row to b ≥ 0; a '>=' row with b = 0 becomes '<='.
  const norm = rows.map((r) => {
    let a = r.a.map(F)
    let b = F(r.b)
    let op = r.op
    if (b.n < 0n || (b.n === 0n && op === '>=')) {
      a = a.map(neg)
      b = neg(b)
      op = op === '>=' ? '<=' : op === '<=' ? '>=' : '='
    }
    return { a, b, op }
  })
  const slackCol = norm.map((r) => (r.op === '=' ? -1 : ncol++))
  const nSlackEnd = ncol
  const artCol = norm.map((r) => (r.op === '<=' ? -1 : ncol++))
  const width = ncol
  // The tableau: one row per constraint, columns 0..width-1, then the rhs.
  const T = norm.map((r, i) => {
    const row = new Array(width + 1).fill(ZERO)
    for (let j = 0; j < nv; j++) {
      const v = r.a[j] || ZERO
      if (isZero(v)) continue
      const [p, q] = varCols[j]
      row[p] = v
      if (q != null) row[q] = neg(v)
    }
    if (slackCol[i] >= 0) row[slackCol[i]] = frac(r.op === '<=' ? 1 : -1)
    if (artCol[i] >= 0) row[artCol[i]] = frac(1)
    row[width] = r.b
    return row
  })
  const basis = norm.map((r, i) => (r.op === '<=' ? slackCol[i] : artCol[i]))
  let pivots = 0

  const pivot = (r, e) => {
    pivots++
    const p = T[r][e]
    const R = T[r].map((v) => (isZero(v) ? v : div(v, p)))
    T[r] = R
    for (let i = 0; i < T.length; i++) {
      if (i === r) continue
      const f = T[i][e]
      if (isZero(f)) continue
      const row = T[i]
      for (let j = 0; j <= width; j++) {
        if (!isZero(R[j])) row[j] = sub(row[j], mul(f, R[j]))
      }
    }
    basis[r] = e
  }

  // Reduced costs r_j = cost_j − Σ_i cost(basis_i) T_ij, and the objective
  // row pivoted along with the tableau.
  const run = (cost, allowed) => {
    const z = new Array(width + 1).fill(ZERO)
    for (let j = 0; j <= width; j++) {
      let s = j < width ? cost[j] : ZERO
      for (let i = 0; i < T.length; i++) {
        const cb = cost[basis[i]]
        if (!isZero(cb) && !isZero(T[i][j])) s = sub(s, mul(cb, T[i][j]))
      }
      z[j] = s
    }
    for (;;) {
      let e = -1
      for (let j = 0; j < width; j++) {
        if (allowed(j) && z[j].n < 0n) {
          e = j
          break
        }
      }
      if (e < 0) return 'optimal'
      let r = -1
      let best = null
      for (let i = 0; i < T.length; i++) {
        const a = T[i][e]
        if (a.n <= 0n) continue
        const ratio = div(T[i][width], a)
        const k = best == null ? -1 : cmp(ratio, best)
        if (best == null || k < 0 || (k === 0 && basis[i] < basis[r])) {
          best = ratio
          r = i
        }
      }
      if (r < 0) return 'unbounded'
      const f = z[e]
      pivot(r, e)
      for (let j = 0; j <= width; j++) {
        if (!isZero(T[r][j])) z[j] = sub(z[j], mul(f, T[r][j]))
      }
    }
  }

  // Phase 1: minimise the sum of the artificials.
  const isArt = (j) => j >= nSlackEnd
  if (artCol.some((k) => k >= 0)) {
    const cost1 = new Array(width).fill(ZERO).map((_, j) => (isArt(j) ? frac(1) : ZERO))
    run(cost1, () => true)
    let infeasible = false
    for (let i = 0; i < T.length; i++) {
      if (isArt(basis[i]) && !isZero(T[i][width])) infeasible = true
    }
    if (infeasible) return { status: 'infeasible', pivots }
    // Drive the artificials still in the basis (at 0) out of it; drop the
    // rows where that is impossible (they are redundant).
    for (let i = T.length - 1; i >= 0; i--) {
      if (!isArt(basis[i])) continue
      let j = 0
      while (j < nSlackEnd && isZero(T[i][j])) j++
      if (j < nSlackEnd) pivot(i, j)
      else {
        T.splice(i, 1)
        basis.splice(i, 1)
      }
    }
  }

  // Phase 2.
  const cost2 = new Array(width).fill(ZERO)
  for (let j = 0; j < nv; j++) {
    const cj = F(c[j])
    const [p, q] = varCols[j]
    cost2[p] = cj
    if (q != null) cost2[q] = neg(cj)
  }
  const status = run(cost2, (j) => !isArt(j))
  if (status === 'unbounded') return { status, pivots }
  const col = new Array(width).fill(ZERO)
  basis.forEach((b, i) => (col[b] = T[i][width]))
  const x = varCols.map(([p, q]) => (q == null ? col[p] : sub(col[p], col[q])))
  const value = x.reduce((s, xj, j) => add(s, mul(F(c[j]), xj)), ZERO)
  return { status: 'optimal', x, value, pivots, nReal }
}
