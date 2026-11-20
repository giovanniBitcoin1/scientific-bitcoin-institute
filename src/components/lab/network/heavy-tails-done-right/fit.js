import { mulberry32 } from '../../rng.js'
import { hurwitz, powerLawSampler, expPowerTail } from './zeta.js'

// The recipe of Clauset, Shalizi and Newman (2009) for whole-number data:
// choose k_min by the Kolmogorov–Smirnov distance, estimate γ by exact maximum
// likelihood, test the fit with synthetic data sets, compare with other
// candidates by likelihood ratio. Plain functions, no React, so Node can check
// them.

// ---------------------------------------------------------------- Tables

// Distinct values of a sample, ascending, with what the fits need:
// count[i]; tailN[i], the number of values ≥ ks[i]; tailLog[i], Σ ln k over them.
export function tabulate(values) {
  const sorted = Int32Array.from(values).sort()
  const n = sorted.length
  const ks = []
  const count = []
  for (let i = 0; i < n; ) {
    let j = i
    while (j < n && sorted[j] === sorted[i]) j++
    ks.push(sorted[i])
    count.push(j - i)
    i = j
  }
  const d = ks.length
  const tailN = new Float64Array(d + 1)
  const tailLog = new Float64Array(d + 1)
  for (let i = d - 1; i >= 0; i--) {
    tailN[i] = tailN[i + 1] + count[i]
    tailLog[i] = tailLog[i + 1] + count[i] * Math.log(ks[i])
  }
  return { n, ks, count, tailN, tailLog, sorted }
}

// ---------------------------------------------------------------- Estimates

export const GAMMA_MIN = 1.05
export const GAMMA_MAX = 25

// Exact maximum likelihood for p(k) = k^(−γ) / ζ(γ, k_min): the γ that
// maximises −n ln ζ(γ, k_min) − γ Σ ln k_i. The function is concave, so a
// golden-section search finds it. `meanLog` is Σ ln k_i / n over the tail.
export function mleGamma(meanLog, kMin) {
  const f = (g) => Math.log(hurwitz(g, kMin)) + g * meanLog
  const R = (Math.sqrt(5) - 1) / 2
  let a = GAMMA_MIN
  let b = GAMMA_MAX
  let c = b - R * (b - a)
  let d = a + R * (b - a)
  let fc = f(c)
  let fd = f(d)
  while (b - a > 1e-7) {
    if (fc < fd) {
      b = d
      d = c
      fd = fc
      c = b - R * (b - a)
      fc = f(c)
    } else {
      a = c
      c = d
      fc = fd
      d = a + R * (b - a)
      fd = f(d)
    }
  }
  return (a + b) / 2
}

// The usual shortcut, γ ≈ 1 + n / Σ ln(k_i / (k_min − ½)): good for large
// k_min, wrong for small ones.
export const shortcutGamma = (nTail, sumLog, kMin) => 1 + nTail / (sumLog - nTail * Math.log(kMin - 0.5))

export function mleAt(tab, i) {
  const kMin = tab.ks[i]
  const nTail = tab.tailN[i]
  const gamma = mleGamma(tab.tailLog[i] / nTail, kMin)
  return { kMin, nTail, gamma, se: (gamma - 1) / Math.sqrt(nTail), shortcut: shortcutGamma(nTail, tab.tailLog[i], kMin) }
}

// Kolmogorov–Smirnov distance between the values ≥ ks[i] and the power law
// with exponent γ from ks[i]: the largest gap between the two P(K ≥ k), over
// every whole k (the model also falls between two observed values, so both
// ends of each gap are looked at).
export function ksDistance(tab, i, gamma) {
  const { ks, tailN } = tab
  const kMin = ks[i]
  const Z = hurwitz(gamma, kMin)
  const nTail = tailN[i]
  let D = 0
  let sf = 1 // model P(K ≥ ks[j])
  for (let j = i + 1; j <= ks.length; j++) {
    // just above ks[j − 1]: the model has lost p(ks[j − 1]), the data all of count[j − 1]
    const prev = ks[j - 1]
    sf -= prev ** -gamma / Z
    const emp = tailN[j] / nTail
    let gap = Math.abs(sf - emp)
    if (gap > D) D = gap
    if (j < ks.length && ks[j] > prev + 1) {
      sf = hurwitz(gamma, ks[j]) / Z
      gap = Math.abs(sf - emp)
      if (gap > D) D = gap
    }
  }
  return D
}

export const MIN_TAIL = 10

// Steps 2: every observed value with at least MIN_TAIL values at or above it
// (and at least two distinct ones) is tried as k_min; the one with the
// smallest KS distance wins.
export function fitRecipe(tab, { scan = false } = {}) {
  let best = null
  const all = scan ? [] : null
  for (let i = 0; i < tab.ks.length - 1; i++) {
    if (tab.tailN[i] < MIN_TAIL) break
    const fit = mleAt(tab, i)
    fit.D = ksDistance(tab, i, fit.gamma)
    fit.index = i
    if (all) all.push(fit)
    if (!best || fit.D < best.D) best = fit
  }
  if (!best) return null
  return all ? { ...best, scan: all } : best
}

// ---------------------------------------------------------------- Step 3: the test

export const BOOT_DEFAULT = 200
export const BOOT_MAX = 1000
export const BOOT_SEED = 0xb007

// One synthetic data set of the size of the data: each value comes from the
// fitted tail with probability n_tail / n, otherwise it is one of the observed
// values below k_min, picked at random.
export function syntheticSet(tab, fit, sampler, random, out = new Int32Array(tab.n)) {
  const n = tab.n
  const below = n - fit.nTail
  const pTail = fit.nTail / n
  for (let i = 0; i < n; i++) out[i] = random() < pTail ? sampler(random) : tab.sorted[Math.floor(random() * below)]
  return out
}

// The bootstrap as a job for useExperiment: `sets` synthetic data sets, each
// fitted again from scratch (k_min and γ); p is the share that fit worse than
// the data.
export function bootstrapJob(tab, fit, sets = BOOT_DEFAULT, seed = BOOT_SEED) {
  const random = mulberry32(seed)
  const sampler = powerLawSampler(fit.gamma, fit.kMin)
  const buffer = new Int32Array(tab.n)
  let done = 0
  let worse = 0
  function* iter() {
    for (let s = 0; s < sets; s++) {
      const syn = fitRecipe(tabulate(syntheticSet(tab, fit, sampler, random, buffer)))
      if (syn && syn.D >= fit.D) worse++
      done++
      yield done / sets
    }
  }
  return { iter: iter(), snapshot: () => ({ sets, done, worse, p: done ? worse / done : null, finished: done === sets }) }
}

export function bootstrapP(tab, fit, sets = BOOT_DEFAULT, seed = BOOT_SEED) {
  const job = bootstrapJob(tab, fit, sets, seed)
  for (const _ of job.iter);
  return job.snapshot().p
}

// ---------------------------------------------------------------- Step 4: other candidates

// Complementary error function, fractional error below 1.2e-7 everywhere.
export function erfc(x) {
  const z = Math.abs(x)
  const t = 1 / (1 + 0.5 * z)
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    )
  return x >= 0 ? r : 2 - r
}
const normalSf = (z) => 0.5 * erfc(z / Math.SQRT2)

// Nelder–Mead in two dimensions.
function minimise2(f, x0, step, iters = 300) {
  let pts = [x0, [x0[0] + step[0], x0[1]], [x0[0], x0[1] + step[1]]].map((p) => ({ p, v: f(p) }))
  for (let it = 0; it < iters; it++) {
    pts.sort((a, b) => a.v - b.v)
    if (Math.abs(pts[2].v - pts[0].v) < 1e-10 * (1 + Math.abs(pts[0].v))) break
    const cx = (pts[0].p[0] + pts[1].p[0]) / 2
    const cy = (pts[0].p[1] + pts[1].p[1]) / 2
    const at = (t) => {
      const p = [cx + t * (pts[2].p[0] - cx), cy + t * (pts[2].p[1] - cy)]
      return { p, v: f(p) }
    }
    const refl = at(-1)
    if (refl.v < pts[0].v) {
      const exp = at(-2)
      pts[2] = exp.v < refl.v ? exp : refl
    } else if (refl.v < pts[1].v) {
      pts[2] = refl
    } else {
      const con = at(refl.v < pts[2].v ? -0.5 : 0.5)
      if (con.v < Math.min(refl.v, pts[2].v)) pts[2] = con
      else {
        for (const k of [1, 2]) {
          const p = [(pts[0].p[0] + pts[k].p[0]) / 2, (pts[0].p[1] + pts[k].p[1]) / 2]
          pts[k] = { p, v: f(p) }
        }
      }
    }
  }
  pts.sort((a, b) => a.v - b.v)
  return pts[0]
}

// Each candidate returns logp(k), the log-probability of a tail value, and its
// total log-likelihood on the tail from ks[i].
const total = (tab, i, logp) => {
  let s = 0
  for (let j = i; j < tab.ks.length; j++) s += tab.count[j] * logp(tab.ks[j])
  return s
}

export function powerCandidate(tab, i, gamma) {
  const lz = Math.log(hurwitz(gamma, tab.ks[i]))
  const logp = (k) => -gamma * Math.log(k) - lz
  return { logp, logL: total(tab, i, logp), gamma }
}

// Exponential on whole numbers from k_min (a geometric distribution):
// p(k) = (1 − e^(−λ)) e^(−λ (k − k_min)). The maximum is in closed form.
export function exponentialCandidate(tab, i) {
  const kMin = tab.ks[i]
  let sum = 0
  for (let j = i; j < tab.ks.length; j++) sum += tab.count[j] * (tab.ks[j] - kMin)
  const lambda = Math.log(1 + tab.tailN[i] / sum)
  const l0 = Math.log(1 - Math.exp(-lambda))
  const logp = (k) => l0 - lambda * (k - kMin)
  return { logp, logL: total(tab, i, logp), lambda }
}

// Lognormal rounded to whole numbers and cut at k_min: p(k) is the lognormal
// probability of (k − ½, k + ½), divided by that of (k_min − ½, ∞). μ and σ by
// numerical maximum likelihood. The start of the tail may not lie more than
// eight standard deviations above μ: beyond that the lognormal is a power law
// in all but name and the numbers lose their meaning.
export function lognormalCandidate(tab, i) {
  const kMin = tab.ks[i]
  const make = (mu, sigma) => {
    const z0 = (Math.log(kMin - 0.5) - mu) / sigma
    const ln0 = Math.log(normalSf(z0))
    return (k) => {
      const a = (Math.log(k - 0.5) - mu) / sigma
      const b = (Math.log(k + 0.5) - mu) / sigma
      let lp
      if (b - a < 1e-3) lp = -0.5 * ((a + b) / 2) ** 2 - 0.9189385332046727 + Math.log(b - a)
      else {
        const p = a > 0 ? normalSf(a) - normalSf(b) : normalSf(-b) - normalSf(-a)
        lp = p > 0 ? Math.log(p) : -0.5 * ((a + b) / 2) ** 2 - 0.9189385332046727 + Math.log(b - a)
      }
      return lp - ln0
    }
  }
  const cost = ([mu, ls]) => {
    const sigma = Math.exp(ls)
    if (sigma < 0.05 || sigma > 30) return 1e300
    if ((Math.log(kMin - 0.5) - mu) / sigma > 8) return 1e300
    const v = -total(tab, i, make(mu, sigma))
    return Number.isFinite(v) ? v : 1e300
  }
  // Start from the mean and spread of ln k on the tail, and from a wider, lower one.
  const n = tab.tailN[i]
  const m = tab.tailLog[i] / n
  let v = 0
  for (let j = i; j < tab.ks.length; j++) v += tab.count[j] * (Math.log(tab.ks[j]) - m) ** 2
  const s = Math.max(0.2, Math.sqrt(v / n))
  let best = null
  for (const start of [[m, Math.log(s)], [Math.log(kMin) - s, Math.log(1.5 * s)], [Math.log(kMin) - 4 * s, Math.log(3 * s)]]) {
    const r = minimise2(cost, start, [0.5, 0.3])
    if (!best || r.v < best.v) best = r
  }
  const mu = best.p[0]
  const sigma = Math.exp(best.p[1])
  return { logp: make(mu, sigma), logL: -best.v, mu, sigma }
}

// Power law with an exponential cut-off: p(k) ∝ k^(−γ) e^(−λ k) from k_min.
// The normalising sum is taken term by term for 2,000 terms and as an
// integral beyond. It contains the pure power law (λ → 0), so its likelihood
// can only be higher.
const CUT_TERMS = 2000
export function cutoffNorm(gamma, lambda, kMin) {
  let Z = 0
  const last = kMin + CUT_TERMS - 1
  for (let k = kMin; k <= last; k++) {
    Z += k ** -gamma * Math.exp(-lambda * k)
    if (lambda * k > 45) return Z
  }
  return Z + expPowerTail(gamma, lambda, last + 0.5)
}
export const LAMBDA_MIN = 1e-7
export function cutoffCandidate(tab, i, gammaStart) {
  const kMin = tab.ks[i]
  const n = tab.tailN[i]
  let sumK = 0
  for (let j = i; j < tab.ks.length; j++) sumK += tab.count[j] * tab.ks[j]
  const cost = ([gamma, ll]) => {
    const lambda = Math.exp(ll)
    if (gamma < -5 || gamma > GAMMA_MAX || lambda < LAMBDA_MIN || lambda > 20) return 1e300
    return n * Math.log(cutoffNorm(gamma, lambda, kMin)) + gamma * tab.tailLog[i] + lambda * sumK
  }
  let best = null
  const mean = sumK / n
  for (const start of [[gammaStart, Math.log(0.1 / mean)], [Math.max(0.5, gammaStart - 1), Math.log(1 / mean)], [gammaStart, Math.log(1e-4 / mean)]]) {
    const r = minimise2(cost, start, [0.3, 1])
    if (!best || r.v < best.v) best = r
  }
  const gamma = best.p[0]
  const lambda = Math.exp(best.p[1])
  const lz = Math.log(cutoffNorm(gamma, lambda, kMin))
  const logp = (k) => -gamma * Math.log(k) - lambda * k - lz
  return { logp, logL: -best.v, gamma, lambda }
}

// Vuong's test for two candidates that do not contain each other. R is the
// log-likelihood ratio (positive: the first is favoured); p is the chance of a
// ratio this far from zero if the two were equally good.
export function vuong(tab, i, logpA, logpB) {
  const n = tab.tailN[i]
  let R = 0
  let sq = 0
  for (let j = i; j < tab.ks.length; j++) {
    const l = logpA(tab.ks[j]) - logpB(tab.ks[j])
    R += tab.count[j] * l
    sq += tab.count[j] * l * l
  }
  const variance = Math.max(sq / n - (R / n) ** 2, 0)
  const p = variance > 0 ? erfc(Math.abs(R) / Math.sqrt(2 * n * variance)) : 1
  return { R, p }
}

// Step 4 in one call: the power law against the exponential, the lognormal and
// the power law with a cut-off, all fitted to the tail from ks[i]. For the
// cut-off, which contains the power law, twice the ratio follows a chi-square
// with one degree of freedom, so p = erfc(√ratio).
export function compare(tab, fit) {
  const i = fit.index
  const power = powerCandidate(tab, i, fit.gamma)
  const exponential = exponentialCandidate(tab, i)
  const lognormal = lognormalCandidate(tab, i)
  const cutoff = cutoffCandidate(tab, i, fit.gamma)
  const gain = Math.max(0, cutoff.logL - power.logL)
  return {
    exponential: { ...vuong(tab, i, power.logp, exponential.logp), lambda: exponential.lambda },
    lognormal: { ...vuong(tab, i, power.logp, lognormal.logp), mu: lognormal.mu, sigma: lognormal.sigma },
    cutoff: { R: -gain, p: erfc(Math.sqrt(gain)), gamma: cutoff.gamma, lambda: cutoff.lambda },
  }
}

export const P_LIMIT = 0.1
export const SMALL_TAIL = 50

export const MIN_SPAN = 10 // the tail must cover at least a factor 10 in k

// The verdict in one word, from the tail size, the range of k the tail covers,
// the bootstrap p-value and the comparisons: 'small' (fewer than 50 values in
// the tail: nothing can be concluded), 'narrow' (the tail covers less than a
// decade of k: nothing can be concluded), 'untested', 'ruledOut',
// 'alternative' (not ruled out, but another candidate fits significantly
// better), 'plausible' (not ruled out; `open` lists the candidates that the
// ratio cannot tell apart from the power law).
export function verdict(fit, p, cmp, kMax) {
  if (!fit || fit.nTail < SMALL_TAIL) return { kind: 'small' }
  if (kMax / fit.kMin < MIN_SPAN) return { kind: 'narrow' }
  if (p == null || !cmp) return { kind: 'untested' }
  if (p <= P_LIMIT) return { kind: 'ruledOut' }
  const better = []
  const open = []
  for (const id of ['lognormal', 'exponential', 'cutoff']) {
    const c = cmp[id]
    if (c.R < 0 && c.p < P_LIMIT) better.push(id)
    else if (!(c.R > 0 && c.p < P_LIMIT)) open.push(id)
  }
  return better.length ? { kind: 'alternative', better, open } : { kind: 'plausible', open }
}

// ---------------------------------------------------------------- Four ways to get it wrong

function slope(xs, ys) {
  const n = xs.length
  if (n < 2) return NaN
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]
    sy += ys[i]
    sxx += xs[i] * xs[i]
    sxy += xs[i] * ys[i]
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

// γ from a straight line, by least squares on logarithmic axes, fitted to:
//   equalBins  the histogram with one bin per whole number (empty bins left out)
//   logBins    the histogram with bins that double in width, as a density
//   ccdf       the CCDF (its slope is −(γ − 1))
// and from maximum likelihood with k_min at the smallest value.
export function wrongWays(tab) {
  const { ks, count, tailN, n } = tab
  const lk = ks.map(Math.log)
  const equalBins = -slope(lk, count.map((c) => Math.log(c / n)))
  const bx = []
  const by = []
  for (let lo = 1, j = 0; j < ks.length; lo *= 2) {
    let c = 0
    while (j < ks.length && ks[j] < 2 * lo) c += count[j++]
    if (c) {
      bx.push(Math.log(Math.sqrt(lo * (2 * lo - 1))))
      by.push(Math.log(c / (n * lo)))
    }
  }
  const logBins = -slope(bx, by)
  const ccdf = 1 - slope(lk, ks.map((_, i) => Math.log(tailN[i] / n)))
  return { equalBins, logBins, ccdf, mleSmallest: mleAt(tab, 0).gamma, smallest: ks[0] }
}

// ---------------------------------------------------------------- Hill

// Hill's estimate of the tail exponent α of P(X ≥ x) ~ x^(−α) from the j
// largest values: j / Σ_{i ≤ j} ln(x_(i) / x_(j+1)). `desc` is sorted, largest first.
export function hill(desc, j) {
  let s = 0
  const base = Math.log(desc[j])
  for (let i = 0; i < j; i++) s += Math.log(desc[i]) - base
  return s > 0 ? j / s : NaN
}

// The Hill plot: [j, 1 + α(j)] (so that it reads as a degree exponent γ) at
// about `points` values of j spread evenly on a logarithmic axis.
export function hillPlot(tab, points = 60) {
  const n = tab.n
  const desc = Float64Array.from(tab.sorted).reverse()
  const cum = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) cum[i + 1] = cum[i] + Math.log(desc[i])
  const out = []
  let last = 0
  const jMax = n - 1
  for (let p = 0; p <= points; p++) {
    const j = Math.max(last + 1, Math.round(10 ** ((Math.log10(jMax) * p) / points)))
    if (j > jMax) break
    last = j
    const s = cum[j] - j * Math.log(desc[j])
    if (s > 0) out.push([j, 1 + j / s])
  }
  return out
}
