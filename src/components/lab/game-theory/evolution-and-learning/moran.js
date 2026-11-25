// The Moran process (Moran 1958) with a game, for Panel B. Pure logic,
// shared by the page and scripts/lab/check-game-theory-07.mjs.
//
// N individuals, i of type A and N − i of type B. At each step one is chosen
// to reproduce with probability proportional to fitness, and its offspring
// replaces one chosen at random. A meets B with payoffs
//   A vs A: a, A vs B: b, B vs A: c, B vs B: d,
// each meeting everyone else once (nobody plays himself), and
//   f_A(i) = 1 − w + w[a(i − 1) + b(N − i)]/(N − 1)
//   f_B(i) = 1 − w + w[c·i + d(N − i − 1)]/(N − 1).
import { mulberry32 } from '../../rng.js'
import { CLASSICS } from '../what-is-a-game/games.js'

// A game as { a, b, c, d } from one of module 01's symmetric classics, with
// the first strategy as A (or the second, if `swap`).
const fromClassic = (cells, swap = false) => {
  const [[aa], [ab], [ba], [bb]] = cells
  return swap ? { a: bb, b: ba, c: ab, d: aa } : { a: aa, b: ab, c: ba, d: bb }
}
export const GAMES = {
  stag: (mutant = 'stag') => fromClassic(CLASSICS.stag, mutant === 'hare'),
  pd: (mutant = 'C') => fromClassic(CLASSICS.pd, mutant === 'D'),
  chicken: (mutant = 'dove') => fromClassic(CLASSICS.chicken, mutant === 'hawk'),
  // A coordination game whose unstable point is x*: a = 1, b = c = 0,
  // d = x*/(1 − x*).
  coordination: (xStar = 0.3) => ({ a: 1, b: 0, c: 0, d: xStar / (1 - xStar) }),
}

export const swapRoles = (g) => ({ a: g.d, b: g.c, c: g.b, d: g.a })

export function fitness(g, N, w, i) {
  const fA = 1 - w + (w * (g.a * (i - 1) + g.b * (N - i))) / (N - 1)
  const fB = 1 - w + (w * (g.c * i + g.d * (N - i - 1))) / (N - 1)
  return [fA, fB]
}

// Fixation probabilities of a single A among B (ρ_A) and of a single B among
// A (ρ_B):
//   ρ_A = 1/(1 + Σ_{k=1}^{N−1} Π_{i=1}^{k} f_B(i)/f_A(i)),
//   ρ_B = ρ_A Π_{i=1}^{N−1} f_B(i)/f_A(i).
// `fit(i)` gives [f_A, f_B] with i A's.
export function fixationFrom(fit, N) {
  let prod = 1
  let sum = 1
  for (let k = 1; k <= N - 1; k++) {
    const [fA, fB] = fit(k)
    prod *= fB / fA
    sum += prod
  }
  const rhoA = 1 / sum
  return { rhoA, rhoB: rhoA * prod }
}

export const fixation = (g, N, w) => fixationFrom((i) => fitness(g, N, w, i), N)

// A mutant of constant fitness r among residents of fitness 1.
export const constantFit = (r) => () => [r, 1]
export const fixationConstant = (r, N) => fixationFrom(constantFit(r), N)
export const closedForm = (r, N) => (Math.abs(r - 1) < 1e-15 ? 1 / N : (1 - 1 / r) / (1 - 1 / r ** N))

// The unstable point of a coordination game, and the two conditions of the
// lecture: x* < 1/3 (weak selection, large N: ρ_A > 1/N) and its large-N
// form a + 2b > c + 2d; risk dominance x* < 1/2, i.e. a + b > c + d.
export const xStar = (g) => (g.d - g.b) / (g.a - g.b - g.c + g.d)
export const thirdRule = (g) => g.a + 2 * g.b > g.c + 2 * g.d
export const riskDominant = (g) => g.a + g.b > g.c + g.d

// N·ρ against N, for N = from … to: the chart of Panel B.
export function curve(fitFor, from = 2, to = 100) {
  const A = []
  const B = []
  for (let N = from; N <= to; N++) {
    const { rhoA, rhoB } = fixationFrom(fitFor(N), N)
    A.push([N, N * rhoA])
    B.push([N, N * rhoB])
  }
  return { A, B }
}

// One mutant, run to the end on the jump chain: the steps where nothing
// changes are skipped, which does not change where the chain ends. From i A's
// the next change is up with probability f_A/(f_A + f_B), down otherwise.
// Returns true if A fixes.
export function runOne(fit, N, random) {
  let i = 1
  while (i > 0 && i < N) {
    const [fA, fB] = fit(i)
    i += random() < fA / (fA + fB) ? 1 : -1
  }
  return i === N
}

// `runs` mutants with the seed: the share that fixed and a 95% interval.
export function runMany(fit, N, runs = 10000, seed = 1) {
  const random = mulberry32(seed)
  let fixed = 0
  for (let r = 0; r < runs; r++) if (runOne(fit, N, random)) fixed++
  const p = fixed / runs
  const se = Math.sqrt((p * (1 - p)) / runs)
  return { fixed, runs, p, se, lo: Math.max(0, p - 1.96 * se), hi: Math.min(1, p + 1.96 * se) }
}

// "Watch one": the full process, one event per call. `pop` is an array of
// 0 (B) and 1 (A). One individual reproduces (chosen in proportion to its
// fitness), one dies (chosen at random among all N, the parent included) and
// is replaced by the offspring. Returns { parent, dead }.
export function moranStep(pop, fit, random) {
  const N = pop.length
  const i = pop.reduce((s, v) => s + v, 0)
  const [fA, fB] = fit(i)
  let r = random() * (i * fA + (N - i) * fB)
  let parent = 0
  for (; parent < N - 1; parent++) {
    r -= pop[parent] ? fA : fB
    if (r < 0) break
  }
  const dead = Math.floor(random() * N)
  pop[dead] = pop[parent]
  return { parent, dead }
}
