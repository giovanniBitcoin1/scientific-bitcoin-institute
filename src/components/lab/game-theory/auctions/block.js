// Panel C, "A block for sale": n users want one slot each in a block of k
// slots; values are uniform between 0 and 100. Three rules: pay your bid (as
// in Bitcoin today), the uniform price (every winner pays the highest losing
// bid) and the monopolistic price of Lavi, Sattath and Zohar (every included
// user pays the lowest included bid; the miner includes the j ≤ k highest
// bids that maximise j times the j-th highest bid). Plain JS, seeded.
import { mulberry32 } from '../../rng.js'

export const BLOCK_COUNTS = [1000, 10000]
export const RULES = ['pyb', 'uniform', 'monopolistic']

const LF = [0]
for (let i = 1; i <= 200; i++) LF[i] = LF[i - 1] + Math.log(i)
const logChoose = (N, j) => LF[N] - LF[j] - LF[N - j]

// log P(Bin(N, x) ≥ m), 0 < x < 1, 0 ≤ m ≤ N. Every term is positive; the sum
// starts from the largest term of the tail, so no term overflows or vanishes
// before the others.
export function logTail(N, x, m) {
  if (m <= 0) return 0
  if (m > N) return -Infinity
  const lx = Math.log(x)
  const l1 = Math.log1p(-x)
  const mode = Math.min(N, Math.max(m, Math.floor((N + 1) * x)))
  const r = x / (1 - x)
  let s = 1
  let t = 1
  for (let j = mode; j < N; j++) {
    t *= ((N - j) / (j + 1)) * r
    s += t
  }
  t = 1
  for (let j = mode; j > m; j--) {
    t *= (j / (N - j + 1)) / r
    s += t
  }
  return logChoose(N, mode) + mode * lx + (N - mode) * l1 + Math.log(s)
}

// The pay-your-bid equilibrium bid of a user with value x (units of 100):
// ((n − k)/n) · P(Bin(n, x) ≥ n − k + 1) / P(Bin(n − 1, x) ≥ n − k) for k < n,
// and 0 when k ≥ n. It is E[Y | Y < x], Y the k-th highest of the other n − 1
// values; for k = 1 the first-price bid (n − 1)x/n.
export function pybBid(n, k, x) {
  if (k >= n || x <= 0) return 0
  if (x >= 1) return (n - k) / n
  return ((n - k) / n) * Math.exp(logTail(n, x, n - k + 1) - logTail(n - 1, x, n - k))
}

// Exact moments (units of 100). Pay your bid and the uniform price both raise
// k(n − k)/(n + 1) on average (0 when k ≥ n); the uniform price is k times the
// (k + 1)-th highest value, a Beta(n − k, k + 1) variable.
export const meanExact = (n, k) => (k >= n ? 0 : (k * (n - k)) / (n + 1))
export const sdUniformExact = (n, k) => (k >= n ? 0 : k * Math.sqrt(((n - k) * (k + 1)) / ((n + 1) ** 2 * (n + 2))))
// The expected value of the k highest of n values (all of them when k ≥ n).
export const valueTopExact = (n, k) => {
  const j = Math.min(k, n)
  return (j * (2 * n + 1 - j)) / (2 * (n + 1))
}

// One run of `blocks` blocks: for each rule the mean revenue, its standard
// deviation and standard error, the users served, the value of the users
// served and the average price per included user (all in the 0–100 scale).
// The pay-your-bid bids are read from a table of 16,385 points (linear
// interpolation, within 3e-7 of the formula on the 0–100 scale: checked by the
// self-check); `bidFn` replaces it (the self-check passes the formula itself).
export function runBlocks({ n, k, blocks = 10000, seed = 1, bidFn }) {
  const random = mulberry32(seed)
  const bidOf = bidFn || (k < n ? bidTable(n, k, 1 << 14) : () => 0)
  const acc = Object.fromEntries(RULES.map((r) => [r, { s: 0, s2: 0, served: 0, value: 0 }]))
  const add = (a, rev, served, value) => {
    a.s += rev
    a.s2 += rev * rev
    a.served += served
    a.value += value
  }
  const v = new Float64Array(n)
  const slots = Math.min(k, n)
  for (let t = 0; t < blocks; t++) {
    for (let i = 0; i < n; i++) v[i] = random()
    v.sort() // ascending: v[n − 1] is the highest
    const at = (j) => v[n - j] // the j-th highest, j = 1 … n
    let top = 0
    let pyb = 0
    let bestJ = 0
    let best = -1
    let bestValue = 0
    for (let j = 1; j <= slots; j++) {
      const x = at(j)
      top += x
      if (k < n) pyb += bidOf(x)
      if (j * x > best) {
        best = j * x
        bestJ = j
        bestValue = top
      }
    }
    add(acc.pyb, 100 * pyb, slots, 100 * top)
    add(acc.uniform, k < n ? 100 * k * at(k + 1) : 0, slots, 100 * top)
    add(acc.monopolistic, 100 * best, bestJ, 100 * bestValue)
  }
  const out = {}
  for (const r of RULES) {
    const a = acc[r]
    const mean = a.s / blocks
    const sd = Math.sqrt(Math.max(0, a.s2 / blocks - mean * mean) * (blocks / (blocks - 1)))
    out[r] = { mean, sd, se: sd / Math.sqrt(blocks), served: a.served / blocks, value: a.value / blocks, price: a.served > 0 ? a.s / a.served : 0 }
  }
  return out
}

// The monopolistic price's average revenue for every k from 1 to kMax, from
// the same blocks (one sort per block): the best j·v_(j) over j ≤ k, which
// stops changing once k reaches n. Fixed seed, for the chart.
export function monopolisticCurve(n, kMax, blocks = 10000, seed = 1) {
  const random = mulberry32(seed)
  const sum = new Float64Array(kMax + 1)
  const served = new Float64Array(kMax + 1)
  const v = new Float64Array(n)
  for (let t = 0; t < blocks; t++) {
    for (let i = 0; i < n; i++) v[i] = random()
    v.sort()
    let best = -1
    let bestJ = 0
    for (let k = 1; k <= kMax; k++) {
      if (k <= n) {
        const x = v[n - k]
        if (k * x > best) {
          best = k * x
          bestJ = k
        }
      }
      sum[k] += best
      served[k] += bestJ
    }
  }
  return Array.from({ length: kMax }, (_, i) => ({ k: i + 1, mean: (100 * sum[i + 1]) / blocks, served: served[i + 1] / blocks }))
}

// A table of the pay-your-bid bid on a grid of `size` + 1 points, read by
// linear interpolation.
export function bidTable(n, k, size = 1 << 16) {
  const tab = new Float64Array(size + 1)
  for (let i = 0; i <= size; i++) tab[i] = pybBid(n, k, i / size)
  return (x) => {
    const p = x * size
    const i = Math.min(size - 1, Math.floor(p))
    return tab[i] + (tab[i + 1] - tab[i]) * (p - i)
  }
}
