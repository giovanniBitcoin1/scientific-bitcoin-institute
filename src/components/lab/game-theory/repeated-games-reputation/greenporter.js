// Module 06, Panel B "Price wars without cheating", after Green and Porter
// (1984), simplified. Two firms in module 02's market see the price, not
// each other's output, and the price is noisy:
//   price = 10 − Q + noise, the noise normal with standard deviation σ.
// Quiet rounds: both produce 2.25 (mean price 5.5, profit π_C = 10.125).
// A cheat produces 3.375, the best reply to 2.25 (mean price 4.375, profit
// π_D = 11.390625 for the cheat). War rounds: Cournot (mean price 4, profit
// π_N = 9) whatever happens. A quiet round whose price is below the trigger
// p̄ starts a war of L rounds, then quiet again.
// Pure logic, shared by the panel and scripts/lab/check-game-theory-06.mjs.
import { Phi } from '../incomplete-information-signalling/globalgame.js'
import { mulberry32, randNormal } from '../../rng.js'

export const PI_C = 10.125
export const PI_D = 11.390625
export const PI_N = 9
export const MEAN_QUIET = 5.5
export const MEAN_CHEAT = 4.375
export const MEAN_WAR = 4

export const DEFAULTS = { sigma: 0.5, trigger: 4.5, L: 5, delta: 0.9 }
export const GRID = {
  sigma: { min: 0.1, max: 1.5, step: 0.05 },
  trigger: { min: 3, max: 5.5, step: 0.05 },
  L: { min: 1, max: 30, step: 1 },
  delta: { min: 0.5, max: 0.99, step: 0.01 },
}

// The values of the trigger slider, 3, 3.05, … 5.5 (rounded to the step).
export const TRIGGERS = Array.from({ length: 51 }, (_, i) => Math.round((3 + 0.05 * i) * 100) / 100)

// False alarm (a quiet round below p̄) and the chance a cheat is caught.
export function alarms(sigma, trigger) {
  if (sigma <= 0) return { p0: trigger > MEAN_QUIET ? 1 : 0, p1: trigger > MEAN_CHEAT ? 1 : 0 }
  return { p0: Phi((trigger - MEAN_QUIET) / sigma), p1: Phi((trigger - MEAN_CHEAT) / sigma) }
}

// The rule (p̄, L) at patience δ:
//   x = (π_C − π_N)/((1 − δ) + δ p0 (1 − δ^L))
//   margin = δ (p1 − p0)(1 − δ^L) x − (π_D − π_C)  (≥ 0: cheating does not pay;
//            the one-shot deviation principle: one cheat, then the rule)
//   value per round = π_C − δ p0 (1 − δ^L) x  (= π_N + (1 − δ) x)
//   long-run share of quiet rounds = 1/(1 + p0 L)
export function evaluate({ sigma, trigger, L, delta }) {
  const { p0, p1 } = alarms(sigma, trigger)
  const dl = 1 - delta ** L
  const x = (PI_C - PI_N) / ((1 - delta) + delta * p0 * dl)
  const margin = delta * (p1 - p0) * dl * x - (PI_D - PI_C)
  const value = PI_C - delta * p0 * dl * x
  const peace = 1 / (1 + p0 * L)
  return { p0, p1, x, margin, value, peace, works: margin >= 0, longRun: peace * PI_C + (1 - peace) * PI_N }
}

// The best rule on the slider grid: the pair (p̄, L) with the highest value
// per round whose margin is ≥ 0. For each p̄ the shortest L that works is the
// best (the value falls with L). Ties go to the first found (lowest p̄).
export function bestRule(sigma, delta) {
  let best = null
  for (const trigger of TRIGGERS) {
    for (let L = GRID.L.min; L <= GRID.L.max; L++) {
      const e = evaluate({ sigma, trigger, L, delta })
      if (!e.works) continue
      if (!best || e.value > best.value + 1e-12) best = { trigger, L, ...e }
      break
    }
  }
  return best
}

// Does some p̄ on the slider grid work with a war of L rounds at δ?
export function someTriggerWorks(sigma, delta, L = 30) {
  return TRIGGERS.some((trigger) => evaluate({ sigma, trigger, L, delta }).margin >= 0)
}

// The least δ for which some trigger works (bisection on δ in (0, 1)).
export function leastDelta(sigma, L = 30, iters = 50) {
  let lo = 0
  let hi = 0.999999
  if (!someTriggerWorks(sigma, hi, L)) return null
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2
    if (someTriggerWorks(sigma, mid, L)) hi = mid
    else lo = mid
  }
  return hi
}

// Panel B's small chart: least δ against σ = 0.05, 0.10, … 1.5.
export const SIGMAS = Array.from({ length: 30 }, (_, i) => Math.round(0.05 * (i + 1) * 100) / 100)
export function leastDeltaCurve(L = 30) {
  return SIGMAS.map((s) => [s, leastDelta(s, L)])
}

// The least δ without noise: the cheat is always caught and no alarm is
// false, so δ(1 − δ^L)/(1 − δ) ≥ (π_D − π_C)/(π_C − π_N); as L grows this is
// δ ≥ 9/17.
export const NOISELESS = (PI_D - PI_C) / (PI_D - PI_N)

// ------------------------------------------------------------------ Samples

// A sample of `rounds` rounds with nobody cheating. Seeded: noise from the
// lab's mulberry32 through Box–Muller (randNormal). Returns the prices, the
// war flag of each round, the number of wars and the share of quiet rounds.
export function sample({ sigma, trigger, L }, rounds = 200, seed = 1) {
  const random = mulberry32(seed)
  const prices = new Float64Array(rounds)
  const war = new Uint8Array(rounds)
  let left = 0
  let wars = 0
  let quiet = 0
  for (let t = 0; t < rounds; t++) {
    const noise = sigma * randNormal(random)
    if (left > 0) {
      war[t] = 1
      prices[t] = MEAN_WAR + noise
      left--
    } else {
      quiet++
      prices[t] = MEAN_QUIET + noise
      if (prices[t] < trigger) {
        left = L
        wars++
      }
    }
  }
  return { prices, war, wars, quiet: quiet / rounds, seed }
}
