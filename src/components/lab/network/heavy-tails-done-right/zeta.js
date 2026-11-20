// Discrete power laws, exactly: p(k) = k^(−γ) / ζ(γ, k_min) for k ≥ k_min,
// where ζ(s, q) = Σ_{n ≥ 0} (n + q)^(−s) is the Hurwitz zeta function.
// Plain functions, no React, so Node can check them.

// B_2, B_4, … B_14
const BERNOULLI = [1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6]

// Hurwitz zeta by Euler–Maclaurin: the first terms are summed one by one until
// the argument reaches 15, the rest is an integral plus seven correction terms.
// Relative error below 1e-13 for s > 1. It also works for s < 1 (s ≠ 1), where
// it gives the analytic continuation: differences ζ(s, a) − ζ(s, b + 1) are then
// still the finite sums Σ_{k = a}^{b} k^(−s).
export function hurwitz(s, q = 1) {
  let sum = 0
  let a = q
  while (a < 15) {
    sum += a ** -s
    a += 1
  }
  const as = a ** -s
  let tail = (a * as) / (s - 1) + as / 2
  let term = (s * as) / a
  let fact = 2
  for (let j = 1; j <= 7; j++) {
    tail += (BERNOULLI[j - 1] / fact) * term
    term *= ((s + 2 * j - 1) * (s + 2 * j)) / (a * a)
    fact *= (2 * j + 1) * (2 * j + 2)
  }
  return sum + tail
}

// Σ_{k = a}^{b} k^(−s), for any s ≠ 1 (b may be Infinity when s > 1).
export const powerSum = (s, a, b = Infinity) => hurwitz(s, a) - (Number.isFinite(b) ? hurwitz(s, b + 1) : 0)

// The power law p(k) ∝ k^(−γ) on k_min … k_max (k_max may be Infinity).
//   pmf(k), sf(k) = P(K ≥ k), moment(n) = ⟨k^n⟩ (Infinity when it diverges)
export function powerLaw(gamma, kMin = 1, kMax = Infinity) {
  const Z = powerSum(gamma, kMin, kMax)
  return {
    gamma,
    kMin,
    kMax,
    Z,
    pmf: (k) => (k < kMin || k > kMax ? 0 : k ** -gamma / Z),
    sf: (k) => (k <= kMin ? 1 : k > kMax ? 0 : powerSum(gamma, k, kMax) / Z),
    moment: (n) => (!Number.isFinite(kMax) && gamma - n <= 1 ? Infinity : powerSum(gamma - n, kMin, kMax) / Z),
  }
}

// A sampler for the power law: random() → k. The first TABLE values are found
// in a table of cumulative probabilities; beyond it the survival function is
// inverted with the zeta function (doubling, then bisection), so the draw is
// exact however far the tail goes. With a finite k_max, larger draws are
// thrown away and drawn again.
const TABLE = 2000
export function powerLawSampler(gamma, kMin = 1, kMax = Infinity) {
  const Z = hurwitz(gamma, kMin)
  const size = Math.min(TABLE, Number.isFinite(kMax) ? kMax - kMin + 1 : TABLE)
  const cum = new Float64Array(size)
  let c = 0
  for (let i = 0; i < size; i++) {
    c += (kMin + i) ** -gamma / Z
    cum[i] = c
  }
  const top = cum[size - 1]
  const sf = (k) => hurwitz(gamma, k) / Z
  const draw = (random) => {
    const r = random()
    if (r < top) {
      if (r < cum[0]) return kMin
      let lo = 0
      let hi = size - 1
      // the smallest index with cum[index] > r
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (cum[mid] > r) hi = mid
        else lo = mid
      }
      return kMin + hi
    }
    // k with sf(k + 1) < 1 − r ≤ sf(k)
    const target = 1 - r
    let lo = kMin + size - 1
    let hi = lo * 2 + 2
    while (sf(hi) >= target) {
      lo = hi
      hi *= 2
    }
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (sf(mid) >= target) lo = mid
      else hi = mid
    }
    return lo
  }
  if (!Number.isFinite(kMax)) return draw
  return (random) => {
    let k = draw(random)
    while (k > kMax) k = draw(random)
    return k
  }
}

// ∫_T^∞ t^(−s) e^(−μ t) dt, by Simpson's rule in y = ln(t / T). Needs μ > 0 or
// s > 1. Used for what is left of a sum after its first few thousand terms.
export function expPowerTail(s, mu, T) {
  if (mu <= 0) return T ** (1 - s) / (s - 1)
  if (mu * T > 700) return 0
  let Y = Math.log(Math.max(45 / (mu * T), 1.5))
  if (s > 1) Y = Math.min(Y, 40 / (s - 1))
  const steps = 400
  const h = Y / steps
  const g = (y) => Math.exp((1 - s) * y - mu * T * Math.exp(y))
  let sum = g(0) + g(Y)
  for (let i = 1; i < steps; i++) sum += (i % 2 ? 4 : 2) * g(i * h)
  return (T ** (1 - s) * sum * h) / 3
}

// Polylogarithm Li_s(x) = Σ_{k ≥ 1} x^k / k^s for 0 ≤ x ≤ 1 (s > 1 at x = 1).
// The powers k^(−s) are kept for the last few values of s.
const TERMS = 4000
const powerTables = new Map()
function powers(s) {
  let t = powerTables.get(s)
  if (!t) {
    t = new Float64Array(TERMS + 1)
    for (let k = 1; k <= TERMS; k++) t[k] = k ** -s
    if (powerTables.size > 40) powerTables.clear()
    powerTables.set(s, t)
  }
  return t
}
export function polylog(s, x) {
  if (x <= 0) return 0
  if (x >= 1) return s > 1 ? hurwitz(s, 1) : Infinity
  const t = powers(s)
  const mu = -Math.log(x)
  const K = Math.min(TERMS, Math.ceil(40 / mu))
  let sum = 0
  let xk = 1
  for (let k = 1; k <= K; k++) {
    xk *= x
    sum += xk * t[k]
  }
  if (K === TERMS && mu * K < 40) sum += expPowerTail(s, mu, K + 0.5)
  return sum
}

// The natural cutoff: about one node in N has a degree beyond it.
export const naturalCutoff = (N, gamma, kMin = 1) => kMin * N ** (1 / (gamma - 1))

// The same idea for a Poisson distribution: the largest k that at least one
// node in N is expected to reach, N · P(K ≥ k) ≥ 1.
export function poissonLargest(N, mean) {
  if (mean <= 0) return 0
  // P(K ≥ k) summed from the top, so that small tails keep their precision.
  const logp = (k) => {
    let l = -mean + k * Math.log(mean)
    for (let i = 2; i <= k; i++) l -= Math.log(i)
    return l
  }
  const sf = (k) => {
    let sum = 0
    let term = Math.exp(logp(k))
    for (let j = k; j < k + 200 && term > 0; j++) {
      sum += term
      term *= mean / (j + 1)
    }
    return sum
  }
  let k = Math.max(1, Math.floor(mean))
  while (N * sf(k + 1) >= 1) k++
  return k
}

// How the average distance grows with N in a random network with a power-law
// degree distribution: the scaling, not the distance itself.
export const distanceScale = {
  above3: (N) => Math.log(N),
  at3: (N) => Math.log(N) / Math.log(Math.log(N)),
  below3: (N) => Math.log(Math.log(N)),
}
