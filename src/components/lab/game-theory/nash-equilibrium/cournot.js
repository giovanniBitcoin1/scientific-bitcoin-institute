// Quantity competition (Cournot): firms choose how much to produce, the price
// is a − (total output), firm i pays c_i for each unit. Pure logic, shared by
// Figure F2 and scripts/lab/check-game-theory-02.mjs.

export const A = 10
export const COST = 1

// What firm i should produce when the others produce `others` in total.
export const bestResponse = (others, a, c) => Math.max(0, (a - c - others) / 2)

export const price = (a, total) => Math.max(0, a - total)
export const profit = (a, c, own, others) => (price(a, own + others) - c) * own

export function describe(a, c1, c2, q1, q2) {
  return { q1, q2, price: price(a, q1 + q2), profit1: profit(a, c1, q1, q2), profit2: profit(a, c2, q2, q1) }
}

// Two firms: the point where the two best-response lines cross.
export function equilibrium(a, c1, c2) {
  let q1 = (a - 2 * c1 + c2) / 3
  let q2 = (a - 2 * c2 + c1) / 3
  // A firm whose cost is too high stays out and the other is a monopolist.
  if (q1 < 0) [q1, q2] = [0, bestResponse(0, a, c2)]
  if (q2 < 0) [q1, q2] = [bestResponse(0, a, c1), 0]
  return describe(a, c1, c2, q1, q2)
}

// n firms with the same cost: each produces (a − c)/(n + 1).
export function symmetric(a, c, n) {
  const q = (a - c) / (n + 1)
  const p = a - n * q
  return { q, total: n * q, price: p, profit: (p - c) * q }
}

// The cartel of two equal firms: the monopoly output, shared.
export function cartel(a, c) {
  const q = (a - c) / 4
  return describe(a, c, c, q, q)
}

// The firms answer each other in turn, firm 1 first: the points visited.
// Stops after `max` moves or when a move is shorter than `tol`.
export function adjust(a, c1, c2, q1, q2, max = 40, tol = 1e-3) {
  const path = [[q1, q2]]
  for (let n = 0; n < max; n++) {
    let step
    if (n % 2 === 0) {
      const next = bestResponse(q2, a, c1)
      step = Math.abs(next - q1)
      q1 = next
    } else {
      const next = bestResponse(q1, a, c2)
      step = Math.abs(next - q2)
      q2 = next
    }
    path.push([q1, q2])
    if (step < tol && n > 0) break
  }
  return path
}
