import { frac, fromDecimal, add, mul, div, cmp, lt, harmonic, ZERO, ONE } from './frac.js'
import { makeGame, loads, totalCost } from './atomic.js'

// Panel C, "Sharing the cost of a road": network cost-sharing games. A road
// has a fixed cost C_e, split equally among the players who use it, so each
// user pays C_e/k when k use it. In the engine of atomic.js that is
// cost(k) = C_e/k; Rosenthal's Φ becomes Σ_e C_e H(n_e) and the total cost
// is the sum of the costs of the roads in use.

const share = (C) => (k) => (k ? div(C, frac(k)) : ZERO)

// "The hub": player i takes his own road to the target (cost 1/i) or a
// costless road to a hub and then the hub's road (cost 1 + ε, shared).
// Resources: own_1..own_k, link_1..link_k (costless), hub.
// Strategies: 0 own road, 1 the hub.
export function hubGame(k, eps) {
  const E = add(ONE, typeof eps === 'object' ? eps : fromDecimal(eps, 2))
  const resources = [
    ...Array.from({ length: k }, (_, i) => ({ id: `own${i + 1}`, fixed: frac(1, i + 1), cost: share(frac(1, i + 1)) })),
    ...Array.from({ length: k }, (_, i) => ({ id: `link${i + 1}`, fixed: ZERO, cost: () => ZERO })),
    { id: 'hub', fixed: E, cost: share(E) },
  ]
  const players = Array.from({ length: k }, (_, i) => ({ strategies: [[i], [k + i, 2 * k]] }))
  return { ...makeGame(resources, players), kind: 'hub', k, E }
}

// "Two roads": every player takes road A (cost k) or road B (cost 1 + ε).
// Strategies: 0 road A, 1 road B.
export function twoRoadsGame(k, eps) {
  const E = add(ONE, typeof eps === 'object' ? eps : fromDecimal(eps, 2))
  const resources = [
    { id: 'A', fixed: frac(k), cost: share(frac(k)) },
    { id: 'B', fixed: E, cost: share(E) },
  ]
  const players = Array.from({ length: k }, () => ({ strategies: [[0], [1]] }))
  return { ...makeGame(resources, players), kind: 'two', k, E }
}

// The two starts: everyone on the shared road (the hub, or road A) or
// everyone on the other.
export const shared = (game) => new Array(game.k).fill(game.kind === 'hub' ? 1 : 0)
export const other = (game) => new Array(game.k).fill(game.kind === 'hub' ? 0 : 1)

// Φ = Σ_e C_e H(n_e), written directly (the self-check compares it with
// Rosenthal's sum in atomic.js).
export function phiShared(game, profile) {
  const n = loads(game, profile)
  let p = ZERO
  n.forEach((m, e) => {
    if (m) p = add(p, mul(game.resources[e].fixed, harmonic(m)))
  })
  return p
}

// The optimum: min(1 + ε, H_k) for the hub (everyone at the hub, or nobody;
// a hub used by some is best used by all), 1 + ε for two roads.
export function optimum(game) {
  if (game.kind === 'two') return game.E
  const H = harmonic(game.k)
  return lt(game.E, H) ? game.E : H
}

// Every equilibrium with its cost.
// Two roads: by the number m on road A (the game is symmetric).
// The hub: with m players at the hub, a player i there stays only if
// (1 + ε)/m ≤ 1/i, and a player outside stays out only if
// 1/i ≤ (1 + ε)/(m + 1); for each m this fixes who must be in, who may be,
// and the sets are listed (the self-check compares the list with a brute
// force over all 2^k profiles for k ≤ 12).
export function equilibria(game) {
  const k = game.k
  const out = []
  if (game.kind === 'two') {
    for (let m = 0; m <= k; m++) {
      const p = [...new Array(m).fill(0), ...new Array(k - m).fill(1)]
      if (stableTwo(game, m)) out.push({ profile: p, onA: m, cost: totalCost(game, p) })
    }
    return out
  }
  const E = game.E
  for (let m = 0; m <= k; m++) {
    const mayIn = []
    const mustIn = []
    let feasible = true
    for (let i = 1; i <= k; i++) {
      const canIn = m > 0 && cmp(div(E, frac(m)), frac(1, i)) <= 0
      const canOut = cmp(frac(1, i), div(E, frac(m + 1))) <= 0
      if (!canIn && !canOut) feasible = false
      if (canIn && !canOut) mustIn.push(i)
      if (canIn && canOut) mayIn.push(i)
    }
    if (!feasible || mustIn.length > m || mustIn.length + mayIn.length < m) continue
    for (const extra of choose(mayIn, m - mustIn.length)) {
      const inHub = new Set([...mustIn, ...extra])
      const p = Array.from({ length: k }, (_, i) => (inHub.has(i + 1) ? 1 : 0))
      out.push({ profile: p, atHub: m, cost: totalCost(game, p) })
    }
  }
  return out
}

function stableTwo(game, m) {
  const k = game.k
  const A = game.resources[0].cost
  const B = game.resources[1].cost
  if (m > 0 && lt(B(k - m + 1), A(m))) return false
  if (m < k && lt(A(m + 1), B(k - m))) return false
  return true
}

function* choose(items, r, start = 0, acc = []) {
  if (acc.length === r) {
    yield [...acc]
    return
  }
  for (let i = start; i <= items.length - (r - acc.length); i++) {
    acc.push(items[i])
    yield* choose(items, r, i + 1, acc)
    acc.pop()
  }
}

export { harmonic }
