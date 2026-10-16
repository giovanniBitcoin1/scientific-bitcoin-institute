import { mulberry32, randNormal } from './rng.js'

// Seeded samplers and summaries for comparing bell curves with heavy tails.
// Every sampler draws a fixed number of uniforms per value, so for one seed a
// sample of size N is the first N values of any larger sample.

// ---------------------------------------------------------------- Samplers

export const gaussian = (random, mu, sigma) => mu + sigma * randNormal(random)

export const exponential = (random, mean) => -mean * Math.log(1 - random())

export const lognormal = (random, mu, sigma) => Math.exp(mu + sigma * randNormal(random))

// Pareto with P(X > x) = (x / xMin)^(−α) for x ≥ xMin, by inverting the CCDF.
// 1 − random() lies in (0, 1], so the power is always finite.
export const pareto = (random, alpha, xMin) => xMin * (1 - random()) ** (-1 / alpha)

// The four families with the parameters used in the Lab. `p` holds the
// parameters; `mean` is the exact mean (Infinity when it does not exist).
export const FAMILIES = {
  gaussian: {
    draw: (r, p) => gaussian(r, p.mu, p.sigma),
    mean: (p) => p.mu,
  },
  exponential: {
    draw: (r, p) => exponential(r, p.mean),
    mean: (p) => p.mean,
  },
  lognormal: {
    draw: (r, p) => lognormal(r, p.mu, p.sigma),
    mean: (p) => Math.exp(p.mu + (p.sigma * p.sigma) / 2),
  },
  pareto: {
    draw: (r, p) => pareto(r, p.alpha, p.xMin),
    mean: (p) => (p.alpha > 1 ? (p.alpha * p.xMin) / (p.alpha - 1) : Infinity),
  },
}

export function sample(kind, params, N, seed) {
  const random = mulberry32(seed)
  const draw = FAMILIES[kind].draw
  const out = new Float64Array(N)
  for (let i = 0; i < N; i++) out[i] = draw(random, params)
  return out
}

// ---------------------------------------------------------------- Exact curves

// Complementary error function (Abramowitz & Stegun 7.1.26, error < 1.5e-7).
function erfc(x) {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * z)
  const y =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const r = y * Math.exp(-z * z)
  return x >= 0 ? r : 2 - r
}

const SQRT2 = Math.SQRT2
const SQRT2PI = Math.sqrt(2 * Math.PI)

// Probability density at x.
export function pdf(kind, p, x) {
  switch (kind) {
    case 'gaussian':
      return Math.exp(-(((x - p.mu) / p.sigma) ** 2) / 2) / (p.sigma * SQRT2PI)
    case 'exponential':
      return x < 0 ? 0 : Math.exp(-x / p.mean) / p.mean
    case 'lognormal':
      return x <= 0 ? 0 : Math.exp(-(((Math.log(x) - p.mu) / p.sigma) ** 2) / 2) / (x * p.sigma * SQRT2PI)
    case 'pareto':
      return x < p.xMin ? 0 : (p.alpha / p.xMin) * (x / p.xMin) ** (-p.alpha - 1)
    default:
      return NaN
  }
}

// P(X ≥ x).
export function ccdfExact(kind, p, x) {
  switch (kind) {
    case 'gaussian':
      return erfc((x - p.mu) / (p.sigma * SQRT2)) / 2
    case 'exponential':
      return x < 0 ? 1 : Math.exp(-x / p.mean)
    case 'lognormal':
      return x <= 0 ? 1 : erfc((Math.log(x) - p.mu) / (p.sigma * SQRT2)) / 2
    case 'pareto':
      return x < p.xMin ? 1 : (x / p.xMin) ** -p.alpha
    default:
      return NaN
  }
}

// ---------------------------------------------------------------- Summaries

// Histogram with bins of equal width in log x (`perDecade` bins per factor of
// ten), normalised as a density: count / (N · bin width). Only positive values
// can be placed on a log axis; empty bins are left out.
export function logBinnedHistogram(values, perDecade = 5) {
  let lo = Infinity
  let hi = -Infinity
  let N = 0
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v > 0) {
      if (v < lo) lo = v
      if (v > hi) hi = v
      N++
    }
  }
  if (!N) return []
  const start = Math.floor(Math.log10(lo) * perDecade)
  const bins = Math.floor(Math.log10(hi) * perDecade) - start + 1
  const count = new Float64Array(bins)
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v > 0) count[Math.min(bins - 1, Math.floor(Math.log10(v) * perDecade) - start)]++
  }
  const out = []
  for (let b = 0; b < bins; b++) {
    if (!count[b]) continue
    const left = 10 ** ((start + b) / perDecade)
    const right = 10 ** ((start + b + 1) / perDecade)
    out.push({ x: Math.sqrt(left * right), density: count[b] / (values.length * (right - left)), count: count[b] })
  }
  return out
}

// Empirical CCDF P(X ≥ x) of a sample sorted in ascending order, thinned to
// about `maxPoints` points spaced evenly in log(rank from the top), so the
// tail, where the interesting behaviour is, keeps all of its few points.
export function ccdfSorted(sorted, maxPoints = 200) {
  const N = sorted.length
  const out = []
  let lastRank = 0
  for (let j = 0; j < maxPoints; j++) {
    const rank = Math.round(N ** (j / (maxPoints - 1))) // values ≥ x: 1 … N
    if (rank <= lastRank) continue
    lastRank = rank
    const x = sorted[N - rank]
    if (x > 0) out.push({ x, p: rank / N })
  }
  return out
}

// Mean of the first n values at about `points` sample sizes spaced evenly in log n.
export function runningMean(values, points = 120) {
  const N = values.length
  const out = []
  let sum = 0
  let next = 1
  let j = 0
  for (let i = 0; i < N; i++) {
    sum += values[i]
    if (i + 1 >= next || i === N - 1) {
      out.push({ n: i + 1, mean: sum / (i + 1) })
      while (next <= i + 1) next = Math.ceil(N ** (++j / (points - 1)))
    }
  }
  return out
}

// Share of the total held by the largest `fraction` of a sorted (ascending) sample.
export function topShare(sorted, fraction) {
  const N = sorted.length
  const top = Math.max(1, Math.round(N * fraction))
  let all = 0
  let high = 0
  for (let i = 0; i < N; i++) {
    all += sorted[i]
    if (i >= N - top) high += sorted[i]
  }
  return all > 0 ? high / all : NaN
}

// Maximum-likelihood tail exponent α of a Pareto with known xMin, in the
// convention P(X > x) = (x / xMin)^(−α): α̂ = N / Σ ln(x_i / xMin), with
// standard error α̂ / √N. (The density then falls as x^(−(α+1)), and the same
// estimate written for that exponent is 1 + N / Σ ln(x_i / xMin).)
export function paretoMLE(values, xMin) {
  let N = 0
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    if (values[i] >= xMin) {
      N++
      sum += Math.log(values[i] / xMin)
    }
  }
  const alpha = sum > 0 ? N / sum : NaN
  return { alpha, error: alpha / Math.sqrt(N), N }
}
