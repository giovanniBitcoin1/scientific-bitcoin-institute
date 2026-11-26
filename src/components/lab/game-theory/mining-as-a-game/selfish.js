// Module 13, "Mining as a game": Eyal and Sirer's selfish mining (SM1) as a
// Markov chain. Pure functions, no React, so that Node can check them
// (scripts/lab/check-game-theory-13.mjs).
//
// α is the attacker's share of the hash rate, γ the share of the honest miners
// that build on her block when two blocks of the same height compete. Each
// step of the chain is one block mined, by her with probability α. The states
// are her private lead: 0, the tie 0′ (a race between two blocks of the same
// height), 1, 2, 3, …
//
//   0  → 1 (α), stays 0 (1 − α: the others' block joins the chain)
//   1  → 2 (α), → 0′ (1 − α: she publishes her block, a race)
//   0′ → 0 always: α she wins both (2 for her); γ(1 − α) the others build on
//        her block (1 and 1); (1 − γ)(1 − α) the others' branch wins (2 for them)
//   2  → 3 (α), → 0 (1 − α: she publishes both, 2 for her)
//   k ≥ 3 → k + 1 (α), → k − 1 (1 − α: she publishes one, 1 for her)

// The closed form of Eyal and Sirer (2014), her share of the chain blocks.
export function relativeRevenue(a, g) {
  return (a * (1 - a) ** 2 * (4 * a + g * (1 - 2 * a)) - a ** 3) / (1 - a * (1 + (2 - a) * a))
}

// R > α exactly when α > (1 − γ)/(3 − 2γ).
export const threshold = (g) => (1 - g) / (3 - 2 * g)

// The stationary distribution in closed form (α < 1/2).
export function stationary(a) {
  const p0 = (1 - 2 * a) / (2 * a ** 3 - 4 * a ** 2 + 1)
  const p1 = a * p0
  const p0p = a * (1 - a) * p0
  const pk = (k) => (k === 0 ? p0 : k === 1 ? p1 : (a / (1 - a)) ** (k - 1) * p1)
  return { p0, p0p, p1, p2: pk(2), pk, rest: 1 - p0 - p0p - p1 }
}

// Expected rates per block mined, from the stationary distribution: her and
// the others' chain blocks (rA, rH) and orphaned blocks (oA, oH). The lead
// distribution may be given (numerically solved) or taken in closed form.
export function rates(a, g, dist = null) {
  const s = dist || stationary(a)
  const b = 1 - a
  // Σ_{k ≥ 3} p_k = p1 · Σ_{k ≥ 3} (α/(1 − α))^{k − 1} = p2 · q/(1 − q), q = α/(1 − α)
  const q = a / b
  const tail = dist ? dist.tail : s.p2 * (q / (1 - q))
  const rA = s.p0p * a * 2 + s.p0p * g * b + s.p2 * b * 2 + tail * b
  const rH = s.p0 * b + s.p0p * g * b + s.p0p * (1 - g) * b * 2
  const oA = s.p0p * (1 - g) * b
  const oH = s.p0p * (a + g * b) + s.p2 * b + tail * b
  const G = rA + rH
  return { rA, rH, oA, oH, G, R: rA / G }
}

// The stationary distribution solved numerically on a chain truncated at a
// lead of K (the top state only goes down): a check of the closed form.
export function stationaryNumeric(a, K = 400) {
  // States: 0, 0′, 1, …, K (index 0 = state 0, 1 = 0′, k + 1 = lead k).
  const n = K + 2
  let p = new Float64Array(n).fill(1 / n)
  const b = 1 - a
  for (let it = 0; it < 200000; it++) {
    const q = new Float64Array(n)
    q[2] += p[0] * a // 0 → 1
    q[0] += p[0] * b
    q[0] += p[1] // 0′ → 0
    q[3] += p[2] * a // 1 → 2
    q[1] += p[2] * b // 1 → 0′
    q[4 < n ? 4 : n - 1] += p[3] * a // 2 → 3
    q[0] += p[3] * b // 2 → 0
    for (let k = 3; k <= K; k++) {
      const i = k + 1
      if (k < K) q[i + 1] += p[i] * a
      else q[i] += p[i] * a
      q[i - 1] += p[i] * b
    }
    let d = 0
    for (let i = 0; i < n; i++) d = Math.max(d, Math.abs(q[i] - p[i]))
    p = q
    if (d < 1e-15) break
  }
  let tail = 0
  for (let k = 3; k <= K; k++) tail += p[k + 1]
  return { p0: p[0], p0p: p[1], p1: p[2], p2: p[3], tail, rest: 1 - p[0] - p[1] - p[2] }
}

// Per 100 blocks mined: her and the others' orphans, and the chain blocks.
export function per100(a, g) {
  const r = rates(a, g)
  return { oA: 100 * r.oA, oH: 100 * r.oH, chain: 100 * r.G }
}

// The best deviation of Panel C, read from its precomputed table: the
// optimal share at (α, γ), linear between the table's α.
export function curve(table, g, key = 'opt') {
  const row = table.cells.filter((c) => Math.abs(c.gamma - g) < 1e-9).sort((x, y) => x.alpha - y.alpha)
  return row.map((c) => [c.alpha, c[key]])
}
