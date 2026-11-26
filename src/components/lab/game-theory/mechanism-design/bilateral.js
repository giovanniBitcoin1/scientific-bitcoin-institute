// F2, "Two out of three": a buyer with value v and a seller with cost c, both
// private and uniform between 0 and 100. Three rules (plain JS):
//   vcg     trade whenever v ≥ c; the buyer pays c, the seller receives v
//   posted  a posted price p: trade when c ≤ p ≤ v, at p
//   split   split the difference, in its linear equilibrium (Chatterjee and
//           Samuelson 1983): the buyer bids 2v/3 + 100/12, the seller asks
//           2c/3 + 25; trade when the bid is at least the ask, v ≥ c + 25, at
//           the average of the two
// Everything per pair on the 0–100 scale: the chance of trade, the expected
// gains E[(v − c)·trade], and the designer's average budget (what the buyer
// pays minus what the seller receives).

export const RULES = ['vcg', 'posted', 'split']
export const GAP = 25 // split the difference trades when v ≥ c + 25

export const buyerBid = (v) => (2 * v) / 3 + 100 / 12
export const sellerAsk = (c) => (2 * c) / 3 + 25

export const trades = (rule, c, v, p = 50) => (rule === 'vcg' ? v >= c : rule === 'posted' ? c <= p && p <= v : v >= c + GAP)

// Exact values.
export function stats(rule, p = 50) {
  if (rule === 'vcg') return { chance: 1 / 2, gains: 100 / 6, budget: -100 / 6 }
  if (rule === 'posted') {
    const q = p / 100
    return { chance: q * (1 - q), gains: (p * (100 - p)) / 200, budget: 0 }
  }
  // v − c ≥ 25: the triangle of side 75; gains ∫ d(100 − d) from 25 to 100 over 10⁴.
  const s = 1 - GAP / 100
  return { chance: (s * s) / 2, gains: ((50 * 100 ** 2 - 100 ** 3 / 3) - (50 * GAP ** 2 - GAP ** 3 / 3)) / 1e4, budget: 0 }
}

// The four properties of each rule.
export const MARKS = {
  vcg: { efficient: true, truthful: true, voluntary: true, balanced: false },
  posted: { efficient: false, truthful: true, voluntary: true, balanced: true },
  split: { efficient: false, truthful: true, voluntary: true, balanced: true },
}
export const PROPS = ['efficient', 'truthful', 'voluntary', 'balanced']

// The same by the midpoint rule on an m × m grid (for the self-check).
export function statsGrid(rule, p = 50, m = 400) {
  let n = 0
  let g = 0
  let bud = 0
  const h = 100 / m
  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
    const c = (i + 0.5) * h
    const v = (j + 0.5) * h
    if (!trades(rule, c, v, p)) continue
    n++
    g += v - c
    if (rule === 'vcg') bud += c - v // posted and split: the buyer pays what the seller receives
  }
  const N = m * m
  return { chance: n / N, gains: g / N, budget: bud / N }
}

// Split the difference: the buyer's expected payoff from a bid b against the
// seller's asks 2c/3 + 25, and the seller's from an ask a against the buyer's
// bids 2v/3 + 100/12 (per pair, the other's type uniform on 0–100).
export function buyerPayoff(v, b) {
  const cBar = Math.min(100, Math.max(0, 1.5 * (b - 25))) // the asks below b
  return ((v - b / 2 - 12.5) * cBar - cBar * cBar / 6) / 100
}
export function sellerPayoff(c, a) {
  const vLow = Math.min(100, Math.max(0, 1.5 * (a - 100 / 12))) // the bids above a
  return (((a + 100 / 12) / 2 - c) * (100 - vLow) + (100 * 100 - vLow * vLow) / 6) / 100
}

// The best reply by a grid of 0.01 and a golden-section refinement.
export function bestReply(f, lo = 0, hi = 100) {
  let bx = lo
  let by = -Infinity
  for (let x = lo; x <= hi + 1e-9; x += 0.01) {
    const y = f(x)
    if (y > by) {
      by = y
      bx = x
    }
  }
  let a = Math.max(lo, bx - 0.02)
  let b = Math.min(hi, bx + 0.02)
  const g = (Math.sqrt(5) - 1) / 2
  for (let it = 0; it < 80; it++) {
    const x1 = b - g * (b - a)
    const x2 = a + g * (b - a)
    if (f(x1) >= f(x2)) b = x2
    else a = x1
  }
  return (a + b) / 2
}
