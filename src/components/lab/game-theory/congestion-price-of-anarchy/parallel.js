import { mulberry32 } from '../../rng.js'
import { priceOfAnarchy } from './pigou.js'

// Panel A, "How bad can it get?": n parallel roads between two towns, road
// i costing a_i x^d + b_i when it carries x, and a demand r split among them.
//
// Equilibrium: one level L, every used road at cost L and every unused one
// at least L; found by bisection on L. Optimum: the same with the marginal
// costs (d + 1)a_i x^d + b_i, i.e. the equilibrium of the roads with a_i
// replaced by (d + 1)a_i. A road with a_i = 0 costs b_i whatever it carries:
// it takes any amount at that level, so L never exceeds the smallest such
// b_i.

const ITER = 200

// The flow road i carries at level L (a_i > 0).
const flowAt = (L, a, b, d) => (L <= b ? 0 : ((L - b) / a) ** (1 / d))

export function equilibrium(a, b, d, r) {
  const n = a.length
  const cons = []
  for (let i = 0; i < n; i++) if (a[i] === 0) cons.push(i)
  const bc = cons.length ? Math.min(...cons.map((i) => b[i])) : Infinity
  const S = (L) => {
    let s = 0
    for (let i = 0; i < n; i++) if (a[i] > 0) s += flowAt(L, a[i], b[i], d)
    return s
  }
  const flows = new Array(n).fill(0)
  let L
  if (cons.length && S(bc) <= r) {
    // The constant roads at level bc take what the others leave.
    L = bc
    for (let i = 0; i < n; i++) if (a[i] > 0) flows[i] = flowAt(L, a[i], b[i], d)
    const tied = cons.filter((i) => b[i] === bc)
    const rest = r - S(bc)
    for (const i of tied) flows[i] = rest / tied.length
  } else {
    let lo = Math.min(...b)
    let hi = cons.length ? bc : Math.max(...b) + 1
    while (!cons.length && S(hi) < r) hi = 2 * hi + 1
    for (let k = 0; k < ITER && hi - lo > 0; k++) {
      const mid = (lo + hi) / 2
      if (mid === lo || mid === hi) break
      if (S(mid) < r) lo = mid
      else hi = mid
    }
    L = (lo + hi) / 2
    for (let i = 0; i < n; i++) if (a[i] > 0) flows[i] = flowAt(L, a[i], b[i], d)
    // Remove the last rounding of the bisection so the flows add up to r.
    const s = flows.reduce((x, y) => x + y, 0)
    if (s > 0) for (let i = 0; i < n; i++) flows[i] *= r / s
  }
  return { flows, level: L }
}

export const roadCost = (a, b, d, x) => a * x ** d + b
export const totalCost = (a, b, d, flows) => flows.reduce((s, x, i) => s + x * roadCost(a[i], b[i], d, x), 0)

export function optimum(a, b, d, r) {
  const r1 = equilibrium(a.map((v) => (d + 1) * v), b, d, r)
  return { flows: r1.flows, level: r1.level }
}

// The worst case for costs of degree d: Pigou's ratio with p = d.
export const bound = (d) => priceOfAnarchy(d)

// One instance: both flows, both costs, the ratio, and Roughgarden and
// Tardos's check that the equilibrium costs no more than the optimum would
// with demand 2r.
export function solve(a, b, d, r) {
  const eq = equilibrium(a, b, d, r)
  const opt = optimum(a, b, d, r)
  const opt2 = optimum(a, b, d, 2 * r)
  const eqCost = totalCost(a, b, d, eq.flows)
  const optCost = totalCost(a, b, d, opt.flows)
  const opt2Cost = totalCost(a, b, d, opt2.flows)
  return {
    eq: eq.flows,
    opt: opt.flows,
    level: eq.level,
    eqCost,
    optCost,
    ratio: eqCost / optCost,
    opt2Cost,
    doubled: eqCost <= opt2Cost * (1 + 1e-12),
  }
}

export const PIGOU = { a: [0, 1], b: [1, 0], r: 1 }

// Random instance number `seed`: a_i and b_i uniform on [0, 1], drawn in
// the order a_1, b_1, a_2, b_2, ...
export function randomInstance(n, random) {
  const a = []
  const b = []
  for (let i = 0; i < n; i++) {
    a.push(random())
    b.push(random())
  }
  return { a, b }
}
export const instance = (n, seed) => randomInstance(n, mulberry32(seed))

// "1,000 instances": one generator with seed 1, instances drawn one after
// the other. Returns the ratios and their summary.
export function survey(n, d, r, count = 1000, seed = 1) {
  const random = mulberry32(seed)
  const ratios = []
  let allDoubled = true
  let worst = null
  for (let k = 0; k < count; k++) {
    const { a, b } = randomInstance(n, random)
    const s = solve(a, b, d, r)
    ratios.push(s.ratio)
    if (!s.doubled) allDoubled = false
    if (!worst || s.ratio > worst.ratio) worst = { ratio: s.ratio, a, b }
  }
  const mean = ratios.reduce((x, y) => x + y, 0) / count
  const above = ratios.filter((x) => x > 1.05).length / count
  return { ratios, mean, largest: worst.ratio, worst, above, allDoubled, bound: bound(d) }
}

// Bins of a histogram from 1 to `top`.
export function histogram(values, top, bins = 20) {
  const h = new Array(bins).fill(0)
  for (const v of values) {
    const k = Math.min(bins - 1, Math.max(0, Math.floor(((v - 1) / (top - 1)) * bins)))
    h[k]++
  }
  return h
}
