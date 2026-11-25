import { mulberry32 } from '../../rng.js'

// Cheap talk in the uniform–quadratic example of Crawford and Sobel (1982).
// An expert knows θ, uniform on 0–1, and sends a message; a decision maker
// then picks an action y. The decision maker's loss is (y − θ)², the
// expert's (y − θ − b)². In an equilibrium with N messages the expert says
// which of N intervals θ lies in, and the decision maker acts at its
// midpoint. Pure logic, shared by Panel C and scripts/lab/check-game-theory-05.mjs.

export const DEFAULT_B = 0.1
export const SIM_CASES = 10000
export const SIM_SEED = 5300
export const NO_TALK = 1 / 12

// The largest N with 2N(N − 1)b < 1. With b = 0 there is no largest (the
// expert can tell everything): the page stops at MAX_N.
export const MAX_N = 12
export function maxIntervals(b, cap = Infinity) {
  if (b <= 0) return Math.min(cap, MAX_N)
  let N = 1
  while (2 * (N + 1) * N * b < 1 && N < cap) N++
  return N
}

// The boundaries a_0 = 0 < a_1 < … < a_N = 1: a_i = i a_1 + 2 i(i − 1) b,
// a_1 = (1 − 2N(N − 1)b)/N. Null when N intervals are impossible at b.
export function partition(b, N) {
  if (2 * N * (N - 1) * b >= 1 && N > 1) return null
  const a1 = (1 - 2 * N * (N - 1) * b) / N
  const a = Array.from({ length: N + 1 }, (_, i) => i * a1 + 2 * i * (i - 1) * b)
  a[N] = 1
  return a
}

export const lengths = (a) => a.slice(1).map((x, i) => x - a[i])
export const actions = (a) => a.slice(1).map((x, i) => (x + a[i]) / 2)

// The decision maker's expected loss: the sum of the cubes of the lengths
// over 12. The expert's is that plus b².
export function losses(a, b) {
  const dm = lengths(a).reduce((s, L) => s + L ** 3, 0) / 12
  return { dm, expert: dm + b * b }
}

// In closed form for the most informative partition: 1/(12N²) + b²(N² − 1)/3.
export const closedLoss = (b, N) => 1 / (12 * N * N) + (b * b * (N * N - 1)) / 3

// At every inner boundary the expert is indifferent between the two
// neighbouring actions: the largest gap between its two losses.
export function indifferenceGap(a, b) {
  const y = actions(a)
  let gap = 0
  for (let i = 1; i < a.length - 1; i++) {
    const t = a[i] + b
    gap = Math.max(gap, Math.abs((y[i - 1] - t) ** 2 - (y[i] - t) ** 2))
  }
  return gap
}

// Letting the expert decide: it picks θ + b, so the decision maker loses b².
export const delegationLoss = (b) => b * b

// "Simulate": draw θ, the expert names its interval, the decision maker acts
// at the midpoint; the average losses.
export function simulate(b, N, cases = SIM_CASES, seed = SIM_SEED) {
  const a = partition(b, N)
  const y = actions(a)
  const random = mulberry32(seed)
  let dm = 0
  let ex = 0
  for (let k = 0; k < cases; k++) {
    const th = random()
    let i = 0
    while (i < N - 1 && th >= a[i + 1]) i++
    dm += (y[i] - th) ** 2
    ex += (y[i] - th - b) ** 2
  }
  return { dm: dm / cases, expert: ex / cases, cases }
}

// "Survey": against b from 0.005 to 0.3 in steps of 0.005, the largest N and
// the decision maker's loss in that equilibrium, with b² and 1/12.
export function survey(from = 0.005, to = 0.3, step = 0.005) {
  const out = []
  const n = Math.round((to - from) / step)
  for (let k = 0; k <= n; k++) {
    const b = Math.round((from + k * step) * 1e6) / 1e6
    const N = maxIntervals(b)
    out.push({ b, N, loss: losses(partition(b, N), b).dm, delegation: delegationLoss(b) })
  }
  return out
}
