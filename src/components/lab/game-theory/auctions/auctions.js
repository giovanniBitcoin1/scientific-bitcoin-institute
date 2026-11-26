// Game Theory Lab, module 11 "Auctions": the private-value auctions of one
// object. Values are independent and uniform between 0 and 100; inside the
// formulas they are written in units of 100 (x = v/100, ρ = r/100). Plain
// functions, no React: the page and scripts/lab/check-game-theory-11.mjs use
// the same code.

export const FORMATS = ['first', 'second', 'allpay']

// ---------------------------------------------------------------- F1

// Your payoff with value v when you bid b and the highest other bid is h.
// Second price: you pay h; first price: you pay b. A tie is won half the time.
export function payoffF1(rule, v, h, b) {
  if (b < h) return 0
  const win = rule === 'second' ? v - h : v - b
  return b > h ? win : win / 2
}

// What F1 says about the best bid: under the second price every bid above h
// is best when v > h, every bid below h when v < h, so b = v is always among
// them; under the first price the best is "just above h" when v > h.
export function bestF1(rule, v, h) {
  if (rule === 'second') return { truthBest: true, gain: Math.max(0, v - h) }
  return { truthBest: v <= h, gain: Math.max(0, v - h), justAbove: v > h }
}

// ---------------------------------------------------------------- F2

// First price, n bidders, the others bid (n − 1)/n of their values: you win
// against one of them when her value is below n b/(n − 1), on the scale 0–100.
export function winChanceF2(n, b) {
  return Math.min(1, (n * b) / (100 * (n - 1))) ** (n - 1)
}
export const payoffF2 = (n, v, b) => (v - b) * winChanceF2(n, b)
export const bestBidF2 = (n, v) => ((n - 1) * v) / n
export const bestPayoffF2 = (n, v) => v ** n / (n * 100 ** (n - 1))
// A numerical search on a fine grid, for the self-check.
export function searchBestF2(n, v, steps = 100000) {
  let best = 0
  let arg = 0
  for (let i = 0; i <= steps; i++) {
    const b = (v * i) / steps
    const p = payoffF2(n, v, b)
    if (p > best) {
      best = p
      arg = b
    }
  }
  return { bid: arg, payoff: best }
}

// ---------------------------------------------------------------- Bids (units of 100)

// The equilibrium bids with a reserve ρ (first and second price) or none
// (all-pay). A value below the reserve does not bid (null).
export function bid(format, n, x, rho = 0) {
  if (format === 'allpay') return ((n - 1) / n) * x ** n
  if (x < rho) return null
  if (format === 'second') return x
  return ((n - 1) / n) * x + (rho > 0 ? rho ** n / (n * x ** (n - 1)) : 0)
}

// ---------------------------------------------------------------- Exact moments

// Mean revenue (units of 100) with a reserve ρ, for the first and second price
// (and the all-pay with ρ = 0): (n − 1)/(n + 1) + ρ^n − 2n ρ^(n + 1)/(n + 1).
export const meanRevenue = (n, rho = 0) => (n - 1) / (n + 1) + rho ** n - (2 * n * rho ** (n + 1)) / (n + 1)
export const noSale = (n, rho = 0) => rho ** n

// Standard deviations without a reserve, closed forms (units of 100).
export function sdClosed(format, n) {
  if (format === 'second') return Math.sqrt((2 * (n - 1)) / ((n + 1) ** 2 * (n + 2)))
  if (format === 'first') return (n - 1) / ((n + 1) * Math.sqrt(n * (n + 2)))
  return Math.sqrt(n * ((n - 1) / n) ** 2 * (1 / (2 * n + 1) - 1 / (n + 1) ** 2))
}

// Composite Simpson's rule on [a, b] with m (even) intervals.
export function simpson(f, a, b, m = 2000) {
  if (b <= a) return 0
  const h = (b - a) / m
  let s = f(a) + f(b)
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h)
  return (s * h) / 3
}

// Mean and standard deviation of the revenue (units of 100), by numerical
// integration over the distribution of the order statistics: the first price
// pays b(Y1) when Y1 ≥ ρ (density n y^(n − 1)); the second price pays Y2 when
// Y2 ≥ ρ (density n(n − 1) y^(n − 2)(1 − y)), ρ when only Y1 ≥ ρ (probability
// n ρ^(n − 1)(1 − ρ)). The all-pay has no reserve: it uses the closed form.
export function moments(format, n, rho = 0) {
  if (format === 'allpay') return { mean: meanRevenue(n, 0), sd: sdClosed('allpay', n) }
  let m1
  let m2
  if (format === 'first') {
    const f = (k) => (y) => bid('first', n, y, rho) ** k * n * y ** (n - 1)
    m1 = simpson(f(1), rho, 1)
    m2 = simpson(f(2), rho, 1)
  } else {
    const dens = (y) => n * (n - 1) * y ** (n - 2) * (1 - y)
    const pOne = n * rho ** (n - 1) * (1 - rho)
    m1 = rho * pOne + simpson((y) => y * dens(y), rho, 1)
    m2 = rho * rho * pOne + simpson((y) => y * y * dens(y), rho, 1)
  }
  return { mean: m1, sd: Math.sqrt(Math.max(0, m2 - m1 * m1)) }
}

// The bidders' total payoff (units of 100): E[Y1; Y1 ≥ ρ] minus the mean
// revenue. Without a reserve 1/(n + 1) in every format.
export const biddersPayoff = (n, rho = 0) => (n / (n + 1)) * (1 - rho ** (n + 1)) - meanRevenue(n, rho)

// The best reserve on a grid (step in units of 100), for the self-check.
export function bestReserve(n, step = 0.0001) {
  let best = -1
  let arg = 0
  for (let r = 0; r <= 1 + 1e-12; r += step) {
    const m = meanRevenue(n, r)
    if (m > best) {
      best = m
      arg = r
    }
  }
  return { rho: arg, mean: best }
}
