// A stag hunt with a little private doubt (a global game, after Carlsson and
// van Damme 1993). Hunting the stag pays θ if the other hunts it too and
// θ − 1 if not; hunting hare pays 0. Each hunter sees θ plus its own normal
// error of standard deviation σ (θ itself is spread so widely that, given its
// signal x, a hunter believes θ is normal around x with spread σ, and the
// other's signal normal around x with spread σ√2). Pure logic, shared by
// Figure F2 and scripts/lab/check-game-theory-05.mjs.

// ------------------------------------------------------------------ Φ
//
// erf by its Taylor series for |x| < 3 and by the continued fraction of erfc
// (Laplace's, evaluated backwards with 60 terms) for |x| ≥ 3; the error is
// below 1e-14 on the whole line (checked against tabulated values in the
// self-check), far below the 1e-7 the module needs.

const SQRT_PI = Math.sqrt(Math.PI)

export function erf(x) {
  if (x < 0) return -erf(-x)
  if (x < 3) {
    // 2/√π Σ (−1)^n x^(2n+1) / (n! (2n + 1))
    let term = x
    let sum = x
    const x2 = x * x
    for (let n = 1; n < 200; n++) {
      term *= -x2 / n
      const add = term / (2 * n + 1)
      sum += add
      if (Math.abs(add) < 1e-17 * Math.abs(sum)) break
    }
    return (2 / SQRT_PI) * sum
  }
  return 1 - erfc(x)
}

export function erfc(x) {
  if (x < 3) return 1 - erf(x)
  // erfc(x) = e^(−x²)/√π · 1/(x + (1/2)/(x + 1/(x + (3/2)/(x + 2/(x + …)))))
  let f = x
  for (let k = 60; k >= 1; k--) f = x + k / 2 / f
  return Math.exp(-x * x) / SQRT_PI / f
}

export const Phi = (x) => (x >= 0 ? 0.5 * (1 + erf(x / Math.SQRT2)) : 0.5 * erfc(-x / Math.SQRT2))

// ------------------------------------------------------------------ The cutoffs

export const DEFAULT_SIGMA = 0.1
export const SIGMA_MIN = 0.02
export const SIGMA_MAX = 1
export const END_TOL = 1e-6 // "To the end": both cutoffs within this of 1/2

// One step of deletion. If the other hunts the stag for sure above c (or the
// hare for sure below c), a hunter with signal x expects x from θ and loses 1
// with the chance that the other's signal is on the wrong side of c, so the
// stag pays x − Φ((c − x)/(σ√2)). The next cutoff c' makes that 0, that is
// c' + Φ((c' − c)/(σ√2)) = 1. Solved by bisection on 0–1 (the left side
// grows with c').
export function nextCutoff(c, sigma, iterations = 80) {
  const s = sigma * Math.SQRT2
  const h = (x) => x + Phi((x - c) / s) - 1
  let lo = Math.min(0, c)
  let hi = Math.max(1, c)
  for (let k = 0; k < iterations; k++) {
    const mid = (lo + hi) / 2
    if (h(mid) > 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

// The cutoffs step by step: k from above (k_0 = 1: above it the stag is
// dominant), l from below (l_0 = 0: below it the hare is dominant).
export function cutoffs(sigma, steps) {
  const k = [1]
  const l = [0]
  for (let n = 1; n <= steps; n++) {
    k.push(nextCutoff(k[n - 1], sigma))
    l.push(nextCutoff(l[n - 1], sigma))
  }
  return { k, l }
}

// Steps until the open band k_n − l_n is narrower than `width`.
export function stepsTo(sigma, width, max = 100000) {
  let k = 1
  let l = 0
  let n = 0
  while (k - l >= width && n < max) {
    k = nextCutoff(k, sigma)
    l = nextCutoff(l, sigma)
    n++
  }
  return { steps: n, k, l }
}

// "To the end": until both cutoffs are within END_TOL of 1/2.
export function toTheEnd(sigma, max = 100000) {
  let k = 1
  let l = 0
  let n = 0
  while ((Math.abs(k - 0.5) > END_TOL || Math.abs(l - 0.5) > END_TOL) && n < max) {
    k = nextCutoff(k, sigma)
    l = nextCutoff(l, sigma)
    n++
  }
  return { steps: n, k, l }
}

// The threshold equilibrium: a hunter with signal exactly 1/2, when the other
// hunts the stag above 1/2, expects 1/2 − 1 × (chance the other is below 1/2)
// = 1/2 − 1/2 = 0: indifferent.
export const stagAtHalf = (sigma) => 0.5 - Phi((0.5 - 0.5) / (sigma * Math.SQRT2))
