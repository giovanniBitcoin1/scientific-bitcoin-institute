// Live figure "Thinning": what a degree distribution looks like when every
// node keeps each of its links independently with probability p. A node of
// true degree k is left with j links with the binomial probability
// C(k, j) p^j (1 − p)^(k − j), so the observed distribution is
//
//   q_j = Σ_k p_k · C(k, j) p^j (1 − p)^(k − j)
//
// computed here exactly, with no sampling. A distribution is an array P with
// P[k] the probability of degree k.

const logFactorial = [0]
function lf(n) {
  for (let i = logFactorial.length; i <= n; i++) logFactorial.push(logFactorial[i - 1] + Math.log(i))
  return logFactorial[n]
}

// Poisson with the given mean, k = 0 … kMax (kMax far in the tail, so the
// truncation is below rounding error).
export function poisson(mean, kMax = 100) {
  const P = new Float64Array(kMax + 1)
  for (let k = 0; k <= kMax; k++) P[k] = Math.exp(-mean + k * Math.log(mean) - lf(k))
  return P
}

// Power law p_k ∝ k^(−gamma) for k = kMin … kMax, normalised.
export function powerLaw(gamma, kMin = 1, kMax = 1000) {
  const P = new Float64Array(kMax + 1)
  let sum = 0
  for (let k = kMin; k <= kMax; k++) {
    P[k] = k ** -gamma
    sum += P[k]
  }
  for (let k = kMin; k <= kMax; k++) P[k] /= sum
  return P
}

export function thin(P, p) {
  const kMax = P.length - 1
  const Q = new Float64Array(kMax + 1)
  if (p >= 1) {
    Q.set(P)
    return Q
  }
  if (p <= 0) {
    for (let k = 0; k <= kMax; k++) Q[0] += P[k]
    return Q
  }
  lf(kMax)
  const lp = Math.log(p)
  const lq = Math.log(1 - p)
  for (let k = 0; k <= kMax; k++) {
    if (P[k] === 0) continue
    const base = Math.log(P[k]) + logFactorial[k]
    for (let j = 0; j <= k; j++) {
      Q[j] += Math.exp(base - logFactorial[j] - logFactorial[k - j] + j * lp + (k - j) * lq)
    }
  }
  return Q
}

export function total(P) {
  let s = 0
  for (let k = 0; k < P.length; k++) s += P[k]
  return s
}

export function mean(P) {
  let s = 0
  for (let k = 1; k < P.length; k++) s += k * P[k]
  return s
}

// Local slope of log P against log k between k1 and k2: the exponent a power
// law would have there (with its sign changed).
export function localExponent(P, k1, k2) {
  return -(Math.log(P[k2]) - Math.log(P[k1])) / (Math.log(k2) - Math.log(k1))
}
