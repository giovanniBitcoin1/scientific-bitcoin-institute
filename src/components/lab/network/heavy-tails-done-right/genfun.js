import { mulberry32 } from '../../rng.js'
import { hurwitz, polylog, powerLaw, powerLawSampler } from './zeta.js'
import { drawDegrees, poissonDraw, onesFoursDraw, configurationModel, giantShare } from './configmodel.js'

// The giant component by generating functions. A family is a degree
// distribution with one parameter:
//
//   G0(x) = Σ p_k x^k            a random node
//   G1(x) = Σ q_k x^k = G0'(x) / ⟨k⟩   the node at the end of a random link
//
// u = G1(u) is the probability that a link does not lead to the giant
// component, and S = 1 − G0(u) the share of the nodes in it.
// Plain functions, no React, so Node can check them.

export function poissonFamily(c) {
  const G = (x) => Math.exp(c * (x - 1))
  return { G0: G, G1: G, mean: c, slope: c, excess: c * c - c }
}

export function onesFoursFamily(f) {
  const mean = 1 + 3 * f
  return {
    G0: (x) => (1 - f) * x + f * x ** 4,
    G1: (x) => (1 - f + 4 * f * x ** 3) / mean,
    mean,
    slope: (12 * f) / mean,
    excess: 9 * f - 1,
  }
}

// Pure power law from k = 1. The mean is finite only above γ = 2 (at or below
// it a link always leads to a hub, so u = 0), the second moment only above 3.
export function powerFamily(gamma) {
  const z0 = hurwitz(gamma, 1)
  if (gamma <= 2) {
    return { G0: (x) => polylog(gamma, x) / z0, G1: (x) => (x >= 1 ? 1 : 0), mean: Infinity, slope: Infinity, excess: Infinity }
  }
  const z1 = hurwitz(gamma - 1, 1)
  const z2 = gamma > 3 ? hurwitz(gamma - 2, 1) : Infinity
  return {
    G0: (x) => polylog(gamma, x) / z0,
    G1: (x) => (x <= 0 ? 1 / z1 : x >= 1 ? 1 : polylog(gamma - 1, x) / (x * z1)),
    mean: z1 / z0,
    slope: (z2 - z1) / z1, // G1'(1) = (⟨k²⟩ − ⟨k⟩) / ⟨k⟩
    excess: (z2 - 2 * z1) / z0, // ⟨k²⟩ − 2⟨k⟩
  }
}

export const FAMILIES = {
  poisson: { make: poissonFamily, min: 0, max: 4, step: 0.05, initial: 1.5, mark: 1 },
  power: { make: powerFamily, min: 2, max: 4, step: 0.01, initial: 2.5, mark: null },
  onesFours: { make: onesFoursFamily, min: 0, max: 1, step: 0.01, initial: 0.25, mark: 1 / 9 },
}
export const FAMILY_IDS = ['poisson', 'power', 'onesFours']

// The fixed point u = G1(u) below 1, by bisection; 1 when there is none.
export function solveU(fam) {
  if (!(fam.slope > 1)) return 1
  const f = (u) => fam.G1(u) - u
  let lo = 0
  let hi = 1 - 1e-7
  if (f(lo) <= 0) return 0
  if (f(hi) >= 0) return 1
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function giant(fam) {
  const u = solveU(fam)
  return { u, S: Math.max(0, 1 - fam.G0(u)) }
}

// The iteration u → G1(u) from u = 0, as a list of values.
export function iterate(fam, steps) {
  const out = [0]
  for (let i = 0; i < steps; i++) out.push(fam.G1(out[i]))
  return out
}

// Where the pure power law loses its giant component: ζ(γ − 2) = 2 ζ(γ − 1).
export function powerThreshold() {
  const f = (g) => hurwitz(g - 2, 1) - 2 * hurwitz(g - 1, 1)
  let lo = 3.05
  let hi = 4
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
export const POWER_THRESHOLD = powerThreshold()
FAMILIES.power.mark = POWER_THRESHOLD

// ---------------------------------------------------------------- Networks

export const NET_N = 20000
export const NET_RUNS = 5
export const NET_SEED = 505
// The parameter values at which networks are built.
export const NET_GRID = {
  poisson: Array.from({ length: 16 }, (_, i) => (i + 1) * 0.25),
  power: Array.from({ length: 20 }, (_, i) => Math.round((2.1 + i * 0.1) * 10) / 10),
  onesFours: Array.from({ length: 21 }, (_, i) => Math.round(i * 5) / 100),
}

export function familyDraw(id, value, n = NET_N) {
  if (id === 'poisson') return poissonDraw(value)
  if (id === 'onesFours') return onesFoursDraw(value)
  return powerLawSampler(value, 1, n - 1)
}

// The largest component of one configuration-model network of the family.
export function networkGiant(id, value, seed, n = NET_N) {
  const random = mulberry32(seed)
  return giantShare(configurationModel(drawDegrees(n, familyDraw(id, value, n), random), random))
}

// Mean and standard deviation over `runs` networks.
export function networkGiantMean(id, value, runs = NET_RUNS, seed = NET_SEED, n = NET_N) {
  let s = 0
  let s2 = 0
  for (let r = 0; r < runs; r++) {
    const v = networkGiant(id, value, seed + 7919 * r + Math.round(value * 1000), n)
    s += v
    s2 += v * v
  }
  const mean = s / runs
  return { mean, sd: Math.sqrt(Math.max(0, s2 / runs - mean * mean)) }
}

// The theory curve S(parameter) on a fine grid, for the chart.
export function theoryCurve(id, points = 80) {
  const F = FAMILIES[id]
  const out = []
  for (let i = 0; i <= points; i++) {
    const x = F.min + ((F.max - F.min) * i) / points
    out.push([x, giant(F.make(x)).S])
  }
  return out
}

// The distributions of the figure "Follow a link": p_k, and q_k = (k + 1) p_(k+1) / ⟨k⟩.
export function followDistributions() {
  const fromP = (P) => {
    let k1 = 0
    let k2 = 0
    for (let k = 0; k < P.length; k++) {
      k1 += k * P[k]
      k2 += k * k * P[k]
    }
    const Q = new Float64Array(P.length)
    for (let k = 0; k + 1 < P.length; k++) Q[k] = ((k + 1) * P[k + 1]) / k1
    return { P, Q, mean: k1, excess: (k2 - k1) / k1 }
  }
  const poisson = new Float64Array(60)
  for (let k = 0, p = Math.exp(-3); k < 60; k++) {
    poisson[k] = p
    p *= 3 / (k + 1)
  }
  const cut = Math.round(10000 ** (1 / 1.5)) // the natural cutoff for N = 10,000, γ = 2.5
  const pl = powerLaw(2.5, 1, cut)
  const power = new Float64Array(cut + 1)
  for (let k = 1; k <= cut; k++) power[k] = pl.pmf(k)
  const onesFours = new Float64Array(5)
  onesFours[1] = 0.75
  onesFours[4] = 0.25
  return { poisson: fromP(poisson), power: { ...fromP(power), cut }, onesFours: fromP(onesFours) }
}
