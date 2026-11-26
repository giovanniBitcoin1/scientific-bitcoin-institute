// Panel B, "The winner's curse": a jar of coins worth V, uniform between 100
// and 200, the same for everyone; each of n bidders sees V + e, with e
// uniform within ±a, and bids her estimate minus a discount k. Exact values
// (they do not depend on V while every bidder uses the same discount), the
// equilibria away from the ends of the range, the payoff of one bidder who
// moves her bid while the others keep to the equilibrium (by numerical
// integration), and the seeded simulation.
import { mulberry32 } from '../../rng.js'
import { simpson } from './auctions.js'

export const V_MIN = 100
export const V_MAX = 200
export const CV_COUNTS = [1000, 10000]

const clamp01 = (v) => Math.min(1, Math.max(0, v))

// E[e_max] and E[e_(2)] for n errors uniform within ±a: a(n − 1)/(n + 1) and
// a(n − 3)/(n + 1). The price is set by the first in the first price, by the
// second in the second price.
export const errorOfPrice = (format, n, a) => (format === 'first' ? (a * (n - 1)) / (n + 1) : (a * (n - 3)) / (n + 1))
// The winner's average profit, k − E[error of the price].
export const profitExact = (format, n, a, k) => k - errorOfPrice(format, n, a)
export const breakEven = (format, n, a) => errorOfPrice(format, n, a)
// The share of auctions in which the winner loses money: the error that sets
// the price is above k. F = P(e < k).
export function loseExact(format, n, a, k) {
  const F = clamp01((k + a) / (2 * a))
  if (format === 'first') return 1 - F ** n
  return 1 - F ** n - n * F ** (n - 1) * (1 - F)
}
// The share in which the winner's estimate was above the true value.
export const tooHighExact = (n) => 1 - 2 ** -n
// The seller's average revenue: the mean value plus the price's error minus k.
export const revenueExact = (format, n, a, k) => (V_MIN + V_MAX) / 2 + errorOfPrice(format, n, a) - k
// The equilibrium discount away from the ends, and the winner's profit there.
export const eqDiscount = (format, n, a) => (format === 'first' ? a : (a * (n - 2)) / n)
export const eqProfit = (format, n, a) => (format === 'first' ? (2 * a) / (n + 1) : (2 * a * (n - 1)) / (n * (n + 1)))

// One bidder's expected payoff when the others bid their estimate minus the
// equilibrium discount and she bids hers minus the discount plus d. Away from
// the ends of the range the true value is uniform within ±a of her estimate:
// V = s + u. She beats another bidder when that bidder's error is below d − u.
// First price: she earns u + k − d with probability G(d − u)^(n − 1). Second
// price: she pays the highest other bid; with M the highest of the others'
// errors, she earns k − M when M < d − u, which integrates to
// (k + a) w^(n − 1) − 2a (n − 1)/n · w^n, w = G(d − u).
export function deviationPayoff(format, n, a, d, m = 4000) {
  const k = eqDiscount(format, n, a)
  const G = (t) => clamp01((t + a) / (2 * a))
  const f =
    format === 'first'
      ? (u) => (u + k - d) * G(d - u) ** (n - 1)
      : (u) => {
          const w = G(d - u)
          return (k + a) * w ** (n - 1) - ((2 * a * (n - 1)) / n) * w ** n
        }
  // Split at the kinks u = d − a and u = d + a.
  const cuts = [-a, ...[d - a, d + a].filter((c) => c > -a && c < a).sort((x, y) => x - y), a]
  let s = 0
  for (let i = 0; i + 1 < cuts.length; i++) s += simpson(f, cuts[i], cuts[i + 1], m)
  return s / (2 * a)
}

// The seeded simulation. Returns the winner's average profit with its
// standard error, the share in which she loses money, the share in which her
// estimate was too high, the seller's average revenue, and the average error
// that set the price (the chart uses it: with the same draws, the profit at
// any other k is that k minus this error).
export function runCommonValue({ n, a, k, format, auctions = 10000, seed = 1 }) {
  const random = mulberry32(seed)
  let s = 0
  let s2 = 0
  let lose = 0
  let high = 0
  let rev = 0
  let errSum = 0
  for (let t = 0; t < auctions; t++) {
    const V = V_MIN + (V_MAX - V_MIN) * random()
    let e1 = -Infinity
    let e2 = -Infinity
    for (let i = 0; i < n; i++) {
      const e = a * (2 * random() - 1)
      if (e > e1) {
        e2 = e1
        e1 = e
      } else if (e > e2) e2 = e
    }
    const err = format === 'first' ? e1 : e2
    const price = V + err - k
    const profit = V - price
    s += profit
    s2 += profit * profit
    if (profit < 0) lose++
    if (e1 > 0) high++
    rev += price
    errSum += err
  }
  const mean = s / auctions
  const sd = Math.sqrt(Math.max(0, s2 / auctions - mean * mean) * (auctions / (auctions - 1)))
  return { profit: mean, sd, se: sd / Math.sqrt(auctions), lose: lose / auctions, tooHigh: high / auctions, revenue: rev / auctions, priceError: errSum / auctions }
}
