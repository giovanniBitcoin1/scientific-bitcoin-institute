// Bitcoin's subsidy schedule, in integer satoshis as the reference
// implementation computes it: 50 BTC at height 0, halved (rounding down)
// every 210,000 blocks; after 33 halvings the subsidy is 0. Dates: the real
// dates of the first four halvings, then ten minutes a block from the fourth
// (height 840,000, 20 April 2024).

export const SAT = 100000000
export const INTERVAL = 210000
export const INITIAL_SAT = 50 * SAT
export const TODAY_FEES = 0.02 // BTC per block: the test value of the exercises
export const TARGET = 3.125 + TODAY_FEES // 3.145 BTC per block

// Subsidy in satoshis at a height (an integer division by 2^k, as a shift).
export function subsidySat(height) {
  const k = Math.floor(height / INTERVAL)
  if (k >= 64) return 0
  return Math.floor(INITIAL_SAT / 2 ** k)
}
export const subsidyBTC = (height) => subsidySat(height) / SAT

// The number of halvings after which the subsidy is 0, and the total supply
// in satoshis (a BigInt-free sum: every term is below 2^53).
export function totals() {
  let k = 0
  let total = 0
  while (Math.floor(INITIAL_SAT / 2 ** k) > 0) {
    total += INTERVAL * Math.floor(INITIAL_SAT / 2 ** k)
    k++
  }
  return { halvings: k, totalSat: total }
}

// Dates as decimal years. Halvings 1–4 at their real dates; from height
// 840,000 on, ten minutes a block; before the first halving, the genesis
// block (3 January 2009).
const dayToYear = (y, m, d) => {
  const t = Date.UTC(y, m - 1, d)
  const y0 = Date.UTC(y, 0, 1)
  const y1 = Date.UTC(y + 1, 0, 1)
  return y + (t - y0) / (y1 - y0)
}
export const ANCHORS = [
  [0, dayToYear(2009, 1, 3)],
  [210000, dayToYear(2012, 11, 28)],
  [420000, dayToYear(2016, 7, 9)],
  [630000, dayToYear(2020, 5, 11)],
  [840000, dayToYear(2024, 4, 20)],
]
const YEAR_DAYS = 365.2425
export function heightToYear(h) {
  if (h >= 840000) return ANCHORS[4][1] + ((h - 840000) * 600) / 86400 / YEAR_DAYS
  for (let i = 0; i < 4; i++) {
    const [h0, y0] = ANCHORS[i]
    const [h1, y1] = ANCHORS[i + 1]
    if (h <= h1) return y0 + ((h - h0) / (h1 - h0)) * (y1 - y0)
  }
  return ANCHORS[4][1]
}
export function yearToHeight(y) {
  if (y >= ANCHORS[4][1]) return 840000 + Math.floor(((y - ANCHORS[4][1]) * YEAR_DAYS * 86400) / 600)
  for (let i = 0; i < 4; i++) {
    const [h0, y0] = ANCHORS[i]
    const [h1, y1] = ANCHORS[i + 1]
    if (y <= y1) return Math.max(0, Math.floor(h0 + ((y - y0) / (y1 - y0)) * (h1 - h0)))
  }
  return 840000
}

// The subsidy "in" a year: after that year's halving, for the halving years
// 2028, 2032, 2036 and 2040 (heights 1,050,000 … 1,680,000). The year of
// the k-th halving from height 840,000 on.
export const halvingYear = (k) => heightToYear(k * INTERVAL)
export function subsidyAfterHalvingIn(year) {
  // The first halving whose date falls in that calendar year.
  for (let k = 0; k <= 33; k++) {
    const y = halvingYear(k)
    if (Math.floor(y) === year) return { k, height: k * INTERVAL, subsidy: subsidyBTC(k * INTERVAL), date: y }
  }
  return null
}

// The fees per block needed to keep `target` BTC per block, and their
// multiple of today's fees.
export function feesNeeded(subsidy, target = TARGET, today = TODAY_FEES) {
  const fees = Math.max(0, target - subsidy)
  return { fees, multiple: fees / today }
}

// The step curve of the subsidy for F2: one point before and after each
// halving, as [year, BTC].
export function stepPoints(endYear = 2141) {
  const out = []
  for (let k = 0; k <= 33; k++) {
    const y0 = heightToYear(k * INTERVAL)
    if (y0 > endYear) break
    const s = subsidyBTC(k * INTERVAL)
    const y1 = Math.min(endYear, heightToYear((k + 1) * INTERVAL))
    out.push([y0, s], [y1, s])
  }
  return out
}
