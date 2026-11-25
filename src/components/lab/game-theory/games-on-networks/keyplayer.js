// The key player (Panel B), after Ballester, Calvó-Armengol and Zenou: with
// complements and δ below 1/λ_max the equilibrium is x = (I − δG)⁻¹ 1, each
// effort a Katz–Bonacich centrality b_i. Removing player i lowers total
// effort by b_i² / m_ii, m_ii the i-th diagonal entry of M = (I − δG)⁻¹ (the
// intercentrality). Plain JavaScript, checked by check-game-theory-09.mjs.
import { graph, inverse, lambdaMax } from './netgames.js'

// M = (I − δG)⁻¹, the efforts b = M 1 and their total.
export function katz(g, delta) {
  const A = g.adj.map((r, i) => r.map((v, j) => (i === j ? 1 : 0) - delta * v))
  const M = inverse(A)
  const b = M.map((r) => r.reduce((s, v) => s + v, 0))
  return { M, b, total: b.reduce((s, v) => s + v, 0) }
}

export const intercentralities = (g, delta) => {
  const { M, b } = katz(g, delta)
  return b.map((bi, i) => (bi * bi) / M[i][i])
}

// The network without player i (the others keep their numbers in `keep`).
export function without(g, i) {
  const keep = Array.from({ length: g.n }, (_, k) => k).filter((k) => k !== i)
  const idx = new Map(keep.map((k, t) => [k, t]))
  const e = g.edges.filter(([a, b]) => a !== i && b !== i).map(([a, b]) => [idx.get(a), idx.get(b)])
  return { g: graph(g.n - 1, e), keep }
}

// Total effort after removing player i, computed again from scratch.
export function totalWithout(g, delta, i) {
  return katz(without(g, i).g, delta).total
}

const argmax = (v) => v.reduce((best, x, i) => (x > v[best] + 1e-9 ? i : best), 0)

// Everything Panel B shows at one δ.
export function analyse(g, delta) {
  const { M, b, total } = katz(g, delta)
  const inter = b.map((bi, i) => (bi * bi) / M[i][i])
  // Ties (within 1e-9, as on the ring) go to the lower number.
  const order = (v) => v.map((x, i) => i).sort((p, q) => (Math.abs(v[q] - v[p]) > 1e-9 ? v[q] - v[p] : p - q))
  return { b, inter, total, mostActive: argmax(b), key: argmax(inter), byEffort: order(b), byInter: order(inter) }
}

// The slider's upper end: the last step of 0.01 strictly below 1/λ_max.
export function sliderMax(g) {
  const lim = 1 / lambdaMax(g)
  let m = Math.floor(lim * 100 + 1e-9) / 100
  if (m >= lim - 1e-9) m = Math.round((m - 0.01) * 100) / 100
  return m
}

// δ at which players i and j have the same effort, by bisection on [lo, hi]
// (the difference must change sign there).
export function crossing(g, i, j, lo, hi) {
  const f = (d) => {
    const { b } = katz(g, d)
    return b[i] - b[j]
  }
  let a = lo
  let c = hi
  let fa = f(a)
  if (fa * f(c) > 0) return null
  for (let k = 0; k < 200 && c - a > 1e-13; k++) {
    const m = (a + c) / 2
    const fm = f(m)
    if (fm * fa <= 0) c = m
    else {
      a = m
      fa = fm
    }
  }
  return (a + c) / 2
}
