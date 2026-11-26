// Panel A, "Same revenue, different risk": many auctions of one object with n
// bidders whose values are uniform between 0 and 100. The same draws are
// auctioned under the three formats, each with its equilibrium bids (the
// reserve applies to the first and second price only). Plain JS, seeded.
import { mulberry32 } from '../../rng.js'
import { bid, FORMATS } from './auctions.js'

export const AUCTION_COUNTS = [1000, 10000, 100000]
export const HIST_BINS = 25
// The all-pay can raise more than 100 (up to 100(n − 1)): with three or more
// bidders the histogram spans 0–200, its last bin holding everything above.
export const histMax = (n) => (n <= 2 ? 100 : 200)

// One run: for each format the mean revenue, its standard deviation and
// standard error, the share with no sale, the bidders' average total payoff
// (the winner's value minus all payments), and a histogram of the revenue.
export function runAuctions({ n, r = 0, auctions = 10000, seed = 1 }) {
  const random = mulberry32(seed)
  const rho = r / 100
  const top = histMax(n)
  const acc = Object.fromEntries(FORMATS.map((f) => [f, { s: 0, s2: 0, none: 0, surplus: 0, hist: new Array(HIST_BINS).fill(0) }]))
  const add = (a, rev, sold, value) => {
    a.s += rev
    a.s2 += rev * rev
    if (!sold) a.none++
    a.surplus += (sold ? value : 0) - rev
    a.hist[Math.min(HIST_BINS - 1, Math.floor((rev * HIST_BINS) / top))]++
  }
  // The all-pay bid ((n − 1)/n) v^n is summed as v^n (by repeated products,
  // faster than a power) and scaled once per auction; the result is the same
  // as bid('allpay', …) summed, up to rounding (checked by the self-check).
  const c = (n - 1) / n
  for (let t = 0; t < auctions; t++) {
    let y1 = -1
    let y2 = -1
    let allpay = 0
    for (let i = 0; i < n; i++) {
      const v = random()
      if (v > y1) {
        y2 = y1
        y1 = v
      } else if (v > y2) y2 = v
      let pw = v
      for (let j = 1; j < n; j++) pw *= v
      allpay += pw
    }
    const sold = y1 >= rho
    add(acc.first, sold ? 100 * bid('first', n, y1, rho) : 0, sold, 100 * y1)
    add(acc.second, sold ? 100 * (y2 > rho ? y2 : rho) : 0, sold, 100 * y1)
    add(acc.allpay, 100 * c * allpay, true, 100 * y1)
  }
  const out = { histMax: top }
  for (const f of FORMATS) {
    const a = acc[f]
    const mean = a.s / auctions
    const sd = Math.sqrt(Math.max(0, a.s2 / auctions - mean * mean) * (auctions / (auctions - 1)))
    out[f] = { mean, sd, se: sd / Math.sqrt(auctions), noSale: a.none / auctions, surplus: a.surplus / auctions, hist: a.hist }
  }
  return out
}
