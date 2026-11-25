// A contest for a prize V (Tullock): player i spends effort x_i at a cost c_i
// per unit and wins with probability x_i / (total effort). Pure logic, shared
// by Panel C and scripts/lab/check-game-theory-02.mjs.

export const PRIZE = 100
export const MINERS = [1.0, 1.1, 1.2, 1.5, 2.0]
export const START = 1.1 // the adjustment starts 10% above the equilibrium
export const ROUNDS = 30

export const equalCosts = (n) => new Array(n).fill(1)
export const oneCheaper = (n, cost = 0.9) => [cost, ...new Array(n - 1).fill(1)]

// The equilibrium in closed form. The players who stay in are the m cheapest,
// m being the largest number for which the m-th cost is below
// (sum of the m costs)/(m − 1). Returns, in the order of `costs`:
// shares s_i = 1 − c_i (m − 1)/Σc, efforts s_i X, profits V s_i², with the
// total effort X = V (m − 1)/Σc and the share of the prize that is spent.
export function equilibrium(costs, V = PRIZE) {
  const order = costs.map((c, i) => i).sort((x, y) => costs[x] - costs[y] || x - y)
  let m = 1
  let sum = costs[order[0]]
  let running = sum
  for (let n = 2; n <= costs.length; n++) {
    running += costs[order[n - 1]]
    if (costs[order[n - 1]] < running / (n - 1)) {
      m = n
      sum = running
    }
  }
  const shares = new Array(costs.length).fill(0)
  if (m >= 2) for (let n = 0; n < m; n++) shares[order[n]] = 1 - (costs[order[n]] * (m - 1)) / sum
  const total = m >= 2 ? (V * (m - 1)) / sum : 0
  const efforts = shares.map((s) => s * total)
  const profits = shares.map((s) => V * s * s)
  const spentShare = 1 - shares.reduce((x, s) => x + s * s, 0)
  return { m, sum, total, shares, efforts, profits, spentShare, spent: V * spentShare, staying: order.slice(0, m) }
}

// The cost below which one more player, added to those who stay in, would
// enter too.
export function entryCost(costs, V = PRIZE) {
  const e = equilibrium(costs, V)
  return e.sum / (e.m - 1)
}

// The best response to the others' total effort Y.
export function bestResponse(Y, c, V = PRIZE) {
  const x = Math.sqrt((V * Y) / c) - Y
  return x > 0 ? x : 0
}

const sumOf = (list) => list.reduce((x, y) => x + y, 0)

// One round in which the players best-respond in turn, each seeing the
// efforts already changed in this round.
export function roundInTurn(efforts, costs, V = PRIZE) {
  const x = [...efforts]
  let total = sumOf(x)
  for (let i = 0; i < x.length; i++) {
    const next = bestResponse(total - x[i], costs[i], V)
    total += next - x[i]
    x[i] = next
  }
  return x
}

// One round in which everyone best-responds to the previous round.
export function roundAtOnce(efforts, costs, V = PRIZE) {
  const total = sumOf(efforts)
  return efforts.map((xi, i) => bestResponse(total - xi, costs[i], V))
}

// The total effort round after round, starting START times the equilibrium
// efforts. totals[0] is the start.
export function adjust(costs, mode, rounds = ROUNDS, V = PRIZE, start = START) {
  const eq = equilibrium(costs, V)
  let x = eq.efforts.map((e) => e * start)
  const totals = [sumOf(x)]
  const step = mode === 'turn' ? roundInTurn : roundAtOnce
  for (let r = 0; r < rounds; r++) {
    x = step(x, costs, V)
    totals.push(sumOf(x))
  }
  return { totals, efforts: x, equilibrium: eq }
}

// The number of rounds after which the total stays within `tol` (relative) of
// the equilibrium, or null if it has not settled within `max` rounds.
export function roundsToSettle(costs, mode, tol = 1e-6, max = 2000, V = PRIZE) {
  const { totals, equilibrium: eq } = adjust(costs, mode, max, V)
  for (let r = totals.length - 1; r >= 0; r--) {
    if (Math.abs(totals[r] - eq.total) > tol * eq.total) return r + 1 > max ? null : r + 1
  }
  return 0
}

// A share as a percentage with one decimal. Shares such as 0.3125 come out of
// the arithmetic a hair below their value: the tiny addition makes 31.25 show
// as 31.3, as it would on paper.
export const percent = (x) => `${(100 * x + 1e-9).toFixed(1)}%`

// Near the equilibrium of n equal players, each round of "all at once"
// multiplies the gap by this.
export const atOnceFactor = (n) => (2 - n) / 2
