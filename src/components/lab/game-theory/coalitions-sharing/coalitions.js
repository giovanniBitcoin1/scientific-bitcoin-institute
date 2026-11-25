// Coalitional games with transferable utility, exactly: for Figure F1 and
// Panel A. A game is { n, v, names }, v an array of fractions indexed by the
// coalition's bitmask (player i is bit i; v[0] = 0). Fractions from module
// 08's frac.js; linear programmes from simplex.js.

import { frac, ZERO, ONE, add, sub, mul, div, cmp, eq, toNumber } from '../congestion-price-of-anarchy/frac.js'
import { solveLP } from './simplex.js'

export const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : frac(v))
export const full = (n) => (1 << n) - 1
export const popcount = (m) => {
  let k = 0
  while (m) {
    m &= m - 1
    k++
  }
  return k
}
export const members = (m, n) => Array.from({ length: n }, (_, i) => i).filter((i) => m & (1 << i))
// Every nonempty coalition other than N, smallest first, then by mask.
export const properCoalitions = (n) =>
  Array.from({ length: full(n) - 1 }, (_, k) => k + 1).sort((a, b) => popcount(a) - popcount(b) || a - b)

export function makeGame(n, worth, names) {
  const v = Array.from({ length: 1 << n }, (_, m) => (m === 0 ? ZERO : F(worth(m))))
  return { n, v, names: names || Array.from({ length: n }, (_, i) => String(i + 1)) }
}

export const label = (game, m) => members(m, game.n).map((i) => game.names[i]).join('')

// x(S) for a division x (fractions).
export const xOf = (x, m) => x.reduce((s, xi, i) => (m & (1 << i) ? add(s, xi) : s), ZERO)

const fact = (k) => {
  let f = 1n
  for (let i = 2n; i <= BigInt(k); i++) f *= i
  return f
}

// The Shapley value by the formula: φ_i = Σ_{S ∌ i} |S|!(n − |S| − 1)!/n! ×
// (v(S ∪ i) − v(S)).
export function shapley(game) {
  const { n, v } = game
  const nf = fact(n)
  return Array.from({ length: n }, (_, i) => {
    let s = ZERO
    for (let m = 0; m <= full(n); m++) {
      if (m & (1 << i)) continue
      const k = popcount(m)
      const w = frac(fact(k) * fact(n - k - 1), nf)
      s = add(s, mul(w, sub(v[m | (1 << i)], v[m])))
    }
    return s
  })
}

// All orders of the players (n! of them), for "the average over all orders".
export function orders(n) {
  const out = []
  const rec = (rest, acc) => {
    if (!rest.length) return out.push(acc)
    rest.forEach((p, k) => rec([...rest.slice(0, k), ...rest.slice(k + 1)], [...acc, p]))
  }
  rec(Array.from({ length: n }, (_, i) => i), [])
  return out
}

// The Shapley value as the panel computes it: each player is paid what she
// adds on arrival, averaged over the n! orders.
export function shapleyByOrders(game) {
  const { n, v } = game
  const all = orders(n)
  const tot = Array.from({ length: n }, () => ZERO)
  for (const o of all) {
    let m = 0
    for (const p of o) {
      tot[p] = add(tot[p], sub(v[m | (1 << p)], v[m]))
      m |= 1 << p
    }
  }
  return tot.map((t) => div(t, frac(all.length)))
}

// v(S ∪ T) ≥ v(S) + v(T) for disjoint S and T.
export function superadditive(game) {
  const { n, v } = game
  for (let s = 1; s <= full(n); s++) {
    for (let t = s + 1; t <= full(n); t++) {
      if (s & t) continue
      if (cmp(v[s | t], add(v[s], v[t])) < 0) return { ok: false, s, t }
    }
  }
  return { ok: true }
}

// Convex (supermodular): v(S ∪ T) + v(S ∩ T) ≥ v(S) + v(T) for all S, T; a
// player adds at least as much to a larger coalition.
export function convex(game) {
  const { n, v } = game
  for (let s = 0; s <= full(n); s++) {
    for (let t = s + 1; t <= full(n); t++) {
      if (cmp(add(v[s | t], v[s & t]), add(v[s], v[t])) < 0) return { ok: false, s, t }
    }
  }
  return { ok: true }
}

const indicator = (m, n) => Array.from({ length: n }, (_, i) => (m & (1 << i) ? 1 : 0))

// The core test of the prompt: minimise Σ x_i subject to x(S) ≥ v(S) for every
// proper coalition. The core is nonempty iff the minimum is at most v(N).
export function coreTest(game) {
  const { n, v } = game
  const rows = properCoalitions(n).map((m) => ({ a: indicator(m, n), op: '>=', b: v[m] }))
  const r = solveLP({ c: Array(n).fill(1), rows, free: true })
  return { min: r.value, x: r.x, nonempty: cmp(r.value, v[full(n)]) <= 0, pivots: r.pivots }
}

// The least core: the smallest ε for which some division of v(N) gives every
// proper coalition at least v(S) − ε. Variables x_1..x_n, ε (all free).
// When ε ≤ 0 the division found is in the core.
export function leastCore(game) {
  const { n, v } = game
  const rows = properCoalitions(n).map((m) => ({ a: [...indicator(m, n), 1], op: '>=', b: v[m] }))
  rows.push({ a: [...Array(n).fill(1), 0], op: '=', b: v[full(n)] })
  const r = solveLP({ c: [...Array(n).fill(0), 1], rows, free: true })
  return { eps: r.x[n], x: r.x.slice(0, n), pivots: r.pivots }
}

// The coalitions that object to a division x of v(N): those with v(S) > x(S),
// strictly (a gain of exactly 0 is not a reason to move), with the amount.
export function objections(game, x) {
  const out = []
  for (const m of properCoalitions(game.n)) {
    const d = sub(game.v[m], xOf(x, m))
    if (d.n > 0n) out.push({ mask: m, by: d })
  }
  return out
}
export const inCore = (game, x) => eq(xOf(x, full(game.n)), game.v[full(game.n)]) && objections(game, x).length === 0

// A cost game c(S) and its savings game v(S) = Σ_{i∈S} c({i}) − c(S).
export function savingsGame(costGame) {
  const { n, v: c } = costGame
  return makeGame(n, (m) => sub(members(m, n).reduce((s, i) => add(s, c[1 << i]), ZERO), c[m]), costGame.names)
}
// Shapley cost shares: c({i}) − φ_i(savings), which is also φ_i(c).
export const costShares = (costGame) => shapley(costGame)

// ---- Three players

// φ_A = (2v(N) + v(AB) + v(AC) − 2v(BC))/6 when every v(i) = 0.
export function shapley3(vAB, vAC, vBC, vN = 100) {
  const s = (a, b, c) => div(add(add(mul(frac(2), F(vN)), add(F(a), F(b))), mul(frac(-2), F(c))), frac(6))
  return [s(vAB, vAC, vBC), s(vAB, vBC, vAC), s(vAC, vBC, vAB)]
}
export const partnersGame = (vAB, vAC, vBC, vN = 100) => {
  const pairs = { 3: vAB, 5: vAC, 6: vBC }
  return makeGame(3, (m) => (m === 7 ? vN : pairs[m] ?? 0), ['A', 'B', 'C'])
}
// The three-player rule (v(i) = 0): the core is nonempty iff no pair is worth
// more than v(N) and the pairs add up to at most 2v(N).
export const coreRule3 = (vAB, vAC, vBC, vN = 100) =>
  [vAB, vAC, vBC].every((p) => cmp(F(p), F(vN)) <= 0) && cmp(add(add(F(vAB), F(vAC)), F(vBC)), mul(frac(2), F(vN))) <= 0

// The core of a three-player game as a polygon in exact fractions: the
// corners of {x : x(S) ≥ v(S) for every S, x(N) = v(N)}, in the plane
// (x_1, x_2), x_3 = v(N) − x_1 − x_2. Returns the corners in order around
// the polygon (one corner for a single point, two for a segment, none if
// the core is empty).
export function coreCorners3(game) {
  const vN = game.v[7]
  // Each constraint a·(x1, x2) ≥ b.
  const cons = properCoalitions(3).map((m) => {
    const has = (i) => (m & (1 << i) ? 1 : 0)
    // x(S) = has0 x1 + has1 x2 + has2 (vN − x1 − x2)
    const a1 = has(0) - has(2)
    const a2 = has(1) - has(2)
    return { a: [frac(a1), frac(a2)], b: sub(game.v[m], mul(frac(has(2)), vN)) }
  })
  const feasible = (p) => cons.every((k) => cmp(add(mul(k.a[0], p[0]), mul(k.a[1], p[1])), k.b) >= 0)
  const pts = []
  for (let i = 0; i < cons.length; i++) {
    for (let j = i + 1; j < cons.length; j++) {
      const [a, b] = cons[i].a
      const [c, d] = cons[j].a
      const det = sub(mul(a, d), mul(b, c))
      if (det.n === 0n) continue
      const x1 = div(sub(mul(cons[i].b, d), mul(b, cons[j].b)), det)
      const x2 = div(sub(mul(a, cons[j].b), mul(cons[i].b, c)), det)
      const p = [x1, x2]
      if (feasible(p) && !pts.some((q) => eq(q[0], x1) && eq(q[1], x2))) pts.push(p)
    }
  }
  const corners = pts.map(([x1, x2]) => [x1, x2, sub(sub(vN, x1), x2)])
  if (corners.length > 2) {
    const c = corners.map((p) => p.map(toNumber))
    const cx = c.reduce((s, p) => s + p[0], 0) / c.length
    const cy = c.reduce((s, p) => s + p[1], 0) / c.length
    const ang = c.map((p) => Math.atan2(p[1] - cy, p[0] - cx))
    return corners.map((p, k) => [p, ang[k]]).sort((a, b) => a[1] - b[1]).map((e) => e[0])
  }
  return corners
}

// ---- The nucleolus, by sequential linear programmes (Schmeidler 1969):
// maximise the smallest satisfaction x(S) − v(S) over the imputations, fix
// the coalitions that sit at that level in every optimal solution, and
// repeat with the others until the division is determined.

function rankOf(vectors, n) {
  const M = vectors.map((r) => r.map((x) => frac(x)))
  let rank = 0
  for (let col = 0; col < n && rank < M.length; col++) {
    let p = M.findIndex((r, i) => i >= rank && r[col].n !== 0n)
    if (p < 0) continue
    ;[M[rank], M[p]] = [M[p], M[rank]]
    for (let i = 0; i < M.length; i++) {
      if (i === rank || M[i][col].n === 0n) continue
      const f = div(M[i][col], M[rank][col])
      M[i] = M[i].map((x, j) => sub(x, mul(f, M[rank][j])))
    }
    rank++
  }
  return rank
}

export function nucleolus(game) {
  const { n, v } = game
  const N = full(n)
  const fixed = [] // { mask, level }
  let open = properCoalitions(n)
  const base = () => {
    const rows = [{ a: [...Array(n).fill(1), 0], op: '=', b: v[N] }]
    for (let i = 0; i < n; i++) rows.push({ a: [...indicator(1 << i, n), 0], op: '>=', b: v[1 << i] })
    for (const f of fixed) rows.push({ a: [...indicator(f.mask, n), 0], op: '=', b: add(v[f.mask], f.level) })
    return rows
  }
  let x = null
  let lps = 0
  for (let guard = 0; guard < 4 * (1 << n); guard++) {
    const rows = base()
    for (const m of open) rows.push({ a: [...indicator(m, n), -1], op: '>=', b: v[m] })
    const r = solveLP({ c: [...Array(n).fill(0), -1], rows, free: true })
    lps++
    if (r.status !== 'optimal') throw new Error(`nucleolus: ${r.status}`)
    const t = r.x[n]
    x = r.x.slice(0, n)
    // Which open coalitions are at level t in every optimal solution?
    const newly = []
    for (const m of open) {
      const rs = base()
      for (const m2 of open) rs.push({ a: [...indicator(m2, n), 0], op: '>=', b: add(v[m2], t) })
      const q = solveLP({ c: [...indicator(m, n).map((a) => -a), 0], rows: rs, free: true })
      lps++
      const most = sub(mul(frac(-1), q.value), v[m]) // max x(S) − v(S)
      if (eq(most, t)) newly.push(m)
    }
    if (!newly.length) throw new Error('nucleolus: no coalition fixed')
    for (const m of newly) fixed.push({ mask: m, level: t })
    const span = [indicator(N, n), ...fixed.map((f) => indicator(f.mask, n))]
    const rank = rankOf(span, n)
    if (rank === n) break
    open = open.filter((m) => !newly.includes(m) && rankOf([...span, indicator(m, n)], n) > rank)
    if (!open.length) break
  }
  return { x, fixed, lps }
}

// ---- Presets of Panel A

export const PRESETS = {
  partners: { n: 3, kind: 'value', names: ['A', 'B', 'C'], worth: (m) => ({ 3: 70, 5: 60, 6: 40, 7: 100 })[m] ?? 0 },
  partners90: { n: 3, kind: 'value', names: ['A', 'B', 'C'], worth: (m) => ({ 3: 90, 5: 60, 6: 40, 7: 100 })[m] ?? 0 },
  majority: { sizes: [3, 4, 5], kind: 'value', worth: (m, n) => (2 * popcount(m) > n ? 1 : 0) },
  gloves3: { n: 3, kind: 'value', worth: (m) => Math.min(popcount(m & 0b011), popcount(m & 0b100)) },
  gloves5: { n: 5, kind: 'value', worth: (m) => Math.min(popcount(m & 0b00011), popcount(m & 0b11100)) },
  airport: { n: 3, kind: 'cost', runways: [10, 15, 30], worth: (m) => Math.max(0, ...members(m, 3).map((i) => [10, 15, 30][i])) },
  unanimity: { sizes: [3, 4, 5], kind: 'value', worth: (m) => ((m & 0b11) === 0b11 ? 1 : 0) },
}
export const PRESET_IDS = ['partners', 'partners90', 'majority', 'gloves3', 'gloves5', 'airport', 'unanimity']

export function presetGame(id, size) {
  const p = PRESETS[id]
  const n = p.n ?? size ?? p.sizes[0]
  return { ...makeGame(n, (m) => p.worth(m, n), p.names), kind: p.kind }
}

// Everything Panel A shows for a game (a value game, or a cost game whose
// tests run on its savings game).
export function analyse(game) {
  const kind = game.kind || 'value'
  const value = kind === 'cost' ? savingsGame(game) : game
  const phi = shapleyByOrders(game)
  const sa = superadditive(value)
  const cv = convex(value)
  const ct = coreTest(value)
  const lc = leastCore(value)
  const phiValue = kind === 'cost' ? shapleyByOrders(value) : phi
  const shapleyIn = ct.nonempty && inCore(value, phiValue)
  const shapleyObjections = objections(value, phiValue)
  return { kind, value, phi, phiValue, superadditive: sa.ok, convex: cv.ok, core: ct, least: lc, shapleyIn, shapleyObjections }
}

export { ZERO, ONE, frac, add, sub, mul, div, cmp, eq, toNumber }
