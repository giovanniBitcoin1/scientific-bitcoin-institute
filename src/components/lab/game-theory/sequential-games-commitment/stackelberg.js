import { A, bestResponse, price, equilibrium } from '../nash-equilibrium/cournot.js'

// Cournot's market of module 02 with a leader (Stackelberg): firm 1 chooses
// its quantity first, firm 2 sees it and best-responds. Optionally firm 2
// pays a fixed cost F if it produces; it stays out when its profit would not
// be above F (an indifferent follower stays out, so that the smallest
// quantity that keeps it out exists). Pure logic, shared by Panel B and
// scripts/lab/check-game-theory-04.mjs.

export { A }
export const DEFAULT_C = 1
export const DEFAULT_F = 0

// The follower's answer to q1: its quantity, or 0 if it stays out.
export function follower(q1, a, c2, F = 0) {
  const q2 = bestResponse(q1, a, c2)
  if (q2 <= 0) return 0
  // At its best response the follower earns q2² before the fixed cost (the
  // tolerance absorbs rounding at the limit quantity itself).
  return F > 0 && q2 * q2 <= F + 1e-9 ? 0 : q2
}

export function outcome(q1, a, c1, c2, F = 0) {
  const q2 = follower(q1, a, c2, F)
  const p = price(a, q1 + q2)
  return { q1, q2, price: p, profit1: (p - c1) * q1, profit2: q2 > 0 ? (p - c2) * q2 - F : 0, out: q2 === 0 }
}

// The leader's profit against its quantity, the follower answering.
export const leaderProfit = (q1, a, c1, c2, F = 0) => outcome(q1, a, c1, c2, F).profit1

// The smallest quantity that keeps the follower out: a − c2 − 2√F.
export const limitQuantity = (a, c2, F) => a - c2 - 2 * Math.sqrt(F)

// The leader's quantity if the follower enters: (a − 2c1 + c2)/2.
export const shareQuantity = (a, c1, c2) => Math.max(0, (a - 2 * c1 + c2) / 2)

// The monopoly quantity of firm 1.
export const monopolyQuantity = (a, c1) => Math.max(0, (a - c1) / 2)

// The leader's two options and the better one. `kind` is 'share' (the
// follower enters), 'limit' (the leader produces the limit quantity to keep
// it out) or 'monopoly' (the follower stays out even against the monopoly
// quantity).
export function stackelberg(a = A, c1 = DEFAULT_C, c2 = DEFAULT_C, F = 0) {
  const L = F > 0 ? limitQuantity(a, c2, F) : a - c2
  const qs = shareQuantity(a, c1, c2)
  const share = qs < L ? outcome(qs, a, c1, c2, F) : null
  const qm = monopolyQuantity(a, c1)
  const deterQ = Math.max(L, qm)
  const deter = outcome(deterQ, a, c1, c2, F)
  const deterKind = qm >= L ? 'monopoly' : 'limit'
  const best = share && share.profit1 >= deter.profit1 ? { ...share, kind: 'share' } : { ...deter, kind: deterKind }
  return { L, share, deter: { ...deter, kind: deterKind }, best, cournot: equilibrium(a, c1, c2) }
}

// For equal costs: above which F keeping the follower out pays, and the
// limit quantity there. Keeping out pays when (a − c − L) L exceeds the
// sharing profit (a − c)²/8, with L = a − c − 2√F: the smaller root of
// s(a − c − s) = (a − c)²/8 in s = 2√F.
export function deterThreshold(a = A, c = DEFAULT_C) {
  const m = a - c
  const s = (m - Math.sqrt(m * m - (4 * m * m) / 8)) / 2
  return { F: (s / 2) ** 2, L: m - s }
}

// From which F the follower stays out even against the monopoly quantity.
export function monopolyThreshold(a = A, c1 = DEFAULT_C, c2 = DEFAULT_C) {
  const q2 = bestResponse(monopolyQuantity(a, c1), a, c2)
  return q2 * q2
}
