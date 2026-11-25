// Module 06, the Bitcoin box "The miner's dilemma", after Eyal (2015). Two
// pools and the rest of the network mining honestly; pool i has power m_i
// (the whole network has power 1) and sends x_i of it into the other pool,
// where those miners send partial proofs of work but throw away any full
// block they find (block withholding). Then
//   R_i = (m_i − x_i)/(1 − x_1 − x_2)   the share of blocks pool i finds,
//   r_1 = (m_2 R_1 + x_1 (R_1 + R_2))/(m_1 m_2 + m_1 x_1 + m_2 x_2),
// r_2 likewise with 1 and 2 exchanged: the revenue of pool i's miners per
// unit of power, 1 when nobody attacks; the others earn 1/(1 − x_1 − x_2).
// Pure logic, shared by the self-check (the box quotes its numbers).

export function revenues(m1, m2, x1, x2) {
  const lost = 1 - x1 - x2
  const R1 = (m1 - x1) / lost
  const R2 = (m2 - x2) / lost
  const r1 = (m2 * R1 + x1 * (R1 + R2)) / (m1 * m2 + m1 * x1 + m2 * x2)
  const r2 = (m1 * R2 + x2 * (R1 + R2)) / (m1 * m2 + m2 * x2 + m1 * x1)
  const others = (1 - m1 - m2) > 0 ? 1 / lost : null
  return { r1, r2, others, R1, R2 }
}

// Every block is paid to someone: m_1 r_1 + m_2 r_2 + (1 − m_1 − m_2)/(1 − x_1 − x_2).
export function totalPaid(m1, m2, x1, x2) {
  const { r1, r2 } = revenues(m1, m2, x1, x2)
  return m1 * r1 + m2 * r2 + (1 - m1 - m2) / (1 - x1 - x2)
}

const GOLD = (Math.sqrt(5) - 1) / 2

// Pool 1's best response to x2 (or pool 2's, with the roles exchanged):
// maximise r_i over x_i in [0, m_i) by a grid of 2,000 points refined by
// golden-section search around the best grid point.
export function bestResponse(mi, mj, xj, n = 2000) {
  const f = (x) => revenues(mi, mj, x, xj).r1
  const top = mi * (1 - 1e-9)
  let bi = 0
  let bv = f(0)
  for (let k = 1; k < n; k++) {
    const x = (top * k) / n
    const v = f(x)
    if (v > bv) {
      bv = v
      bi = k
    }
  }
  let a = (top * Math.max(0, bi - 1)) / n
  let b = (top * Math.min(n, bi + 1)) / n
  let c = b - GOLD * (b - a)
  let d = a + GOLD * (b - a)
  let fc = f(c)
  let fd = f(d)
  for (let i = 0; i < 200 && b - a > 1e-15; i++) {
    if (fc > fd) {
      b = d
      d = c
      fd = fc
      c = b - GOLD * (b - a)
      fc = f(c)
    } else {
      a = c
      c = d
      fc = fd
      d = a + GOLD * (b - a)
      fd = f(d)
    }
  }
  const x = (a + b) / 2
  return f(x) >= bv ? x : (top * bi) / n
}

// The equilibrium: alternating best responses from (0, 0) until both move
// by less than 1e-10.
export function equilibrium(m1, m2, maxRounds = 500) {
  let x1 = 0
  let x2 = 0
  for (let i = 0; i < maxRounds; i++) {
    const n1 = bestResponse(m1, m2, x2)
    const n2 = bestResponse(m2, m1, n1)
    const moved = Math.max(Math.abs(n1 - x1), Math.abs(n2 - x2))
    x1 = n1
    x2 = n2
    if (moved < 1e-10) return { x1, x2, rounds: i + 1, ...revenues(m1, m2, x1, x2) }
  }
  return { x1, x2, rounds: maxRounds, ...revenues(m1, m2, x1, x2), converged: false }
}

// One pool attacks alone, the other does not.
export function alone(m1, m2) {
  const x1 = bestResponse(m1, m2, 0)
  return { x1, ...revenues(m1, m2, x1, 0) }
}

// The two-by-two game at the equilibrium rates (symmetric pools): each pool
// either attacks with its equilibrium x or not. Payoffs (pool 1, pool 2).
export function twoByTwo(m) {
  const eq = equilibrium(m, m)
  const x = eq.x1
  const none = revenues(m, m, 0, 0)
  const one = revenues(m, m, x, 0)
  const both = revenues(m, m, x, x)
  const game = {
    NN: [none.r1, none.r2],
    AN: [one.r1, one.r2],
    NA: [one.r2, one.r1],
    AA: [both.r1, both.r2],
  }
  // Grim trigger in this prisoner's dilemma: δ ≥ (T − R)/(T − P).
  const T = one.r1
  const R = none.r1
  const P = both.r1
  return { x, game, threshold: (T - R) / (T - P) }
}
