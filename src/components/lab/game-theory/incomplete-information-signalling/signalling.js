// Education as a signal, in the spirit of Spence (1973). Workers produce 1
// (low type) or 2 (high type); a share λ is high. Employers pay what they
// expect a worker to produce given the education they see. Education adds
// nothing to productivity; a unit costs c_L to a low type and c_H to a high
// type. Levels nobody chooses are read as low (wage 1). Pure logic, shared by
// Panel B and scripts/lab/check-game-theory-05.mjs.

export const LOW = 1
export const HIGH = 2
export const DEFAULTS = { lambda: 0.3, cL: 1, cH: 0.5 }
export const E_MAX = 4
const EPS = 1e-12

// The separating levels: from 1/c_L (the low type must not want to copy) to
// 1/c_H (the high type must want to pay). Empty when c_H > c_L; one point,
// with both types indifferent, when c_H = c_L.
export function separatingRange({ cL, cH }) {
  const lo = 1 / cL
  const hi = 1 / cH
  if (hi < lo - EPS) return null
  return { lo, hi, single: Math.abs(hi - lo) <= EPS }
}

// The pooling levels: from 0 to λ/max(c_L, c_H).
export const poolingRange = ({ lambda, cL, cH }) => ({ lo: 0, hi: lambda / Math.max(cL, cH) })

// A candidate equilibrium. kind 'separate': the high type takes e, the low
// type 0; kind 'pool': both take e. The wage at a level is the expected
// productivity of who takes it, and 1 at any other level.
export function candidate(kind, e, { lambda, cL, cH }) {
  // "Separating at 0" is not separating: both types take 0, which is pooling at 0.
  if (kind === 'separate' && e <= EPS) return { ...candidate('pool', 0, { lambda, cL, cH }), asked: 'separate' }
  const wageAt = (x) => {
    if (Math.abs(x - e) <= EPS) return kind === 'pool' ? LOW + lambda : HIGH
    return LOW
  }
  let payoff
  let choice
  if (kind === 'pool') {
    choice = { low: e, high: e }
  } else {
    choice = { low: 0, high: e }
  }
  payoff = { low: wageAt(choice.low) - cL * choice.low, high: wageAt(choice.high) - cH * choice.high }
  // The best deviation of each type: 0 (wage 1, or the level e itself) is the
  // only level worth trying, since every other level pays 1.
  const options = (c) => [
    { at: 0, pay: wageAt(0) },
    { at: e, pay: wageAt(e) - c * e },
  ]
  const dev = {}
  for (const [type, c] of [['low', cL], ['high', cH]]) {
    const best = options(c).reduce((a, x) => (x.pay > a.pay + EPS ? x : a), { at: choice[type], pay: payoff[type] })
    dev[type] = best.pay > payoff[type] + EPS ? best : null
  }
  const wasted = kind === 'pool' ? (lambda * cH + (1 - lambda) * cL) * e : lambda * cH * e
  return { kind, e, choice, payoff, deviation: dev, equilibrium: !dev.low && !dev.high, wasted, ck: choKreps(kind, e, { lambda, cL, cH }) }
}

// The test of Cho and Kreps (the intuitive criterion): a level that the low
// type could not gain from even if paid 2, but the high type could, must be
// read as high; if such a level exists, the high type deviates there and the
// candidate breaks. Returns the open interval of such levels, or null.
// Separating at e above 1/c_L: from 1/c_L to e. Pooling at e: from
// e + (1 − λ)/c_L to e + (1 − λ)/c_H.
export function choKreps(kind, e, { lambda, cL, cH }) {
  let lo
  let hi
  if (kind === 'separate') {
    lo = 1 / cL
    hi = e
  } else {
    lo = e + (1 - lambda) / cL
    hi = e + (1 - lambda) / cH
  }
  return hi > lo + EPS ? { lo, hi } : null
}

// Payoffs in the cheapest separation (e = 1/c_L) and in pooling at 0.
export function cheapest({ cL, cH }) {
  return { high: HIGH - cH / cL, low: LOW, e: 1 / cL }
}
export const poolAtZero = ({ lambda }) => LOW + lambda
export const crossing = ({ cL, cH }) => 1 - cH / cL

// ------------------------------------------------------------------ Brute force on a grid (for the self-check)

// Every level on a grid of step h from 0 to E_MAX, checked as a separating
// and as a pooling equilibrium by trying every level on the grid as a
// deviation. Returns the levels that pass.
export function bruteForce({ lambda, cL, cH }, h = 0.001) {
  const per = Math.round(1 / h)
  const n = Math.round(E_MAX * per)
  const grid = Array.from({ length: n + 1 }, (_, k) => k / per) // k/1000, as the page writes levels
  const sep = []
  const pool = []
  for (const e of grid) {
    for (const kind of ['separate', 'pool']) {
      if (kind === 'separate' && e === 0) continue // not separating
      const wage = (x) => (Math.abs(x - e) <= EPS ? (kind === 'pool' ? LOW + lambda : HIGH) : LOW)
      const own = kind === 'pool' ? { low: e, high: e } : { low: 0, high: e }
      let ok = true
      for (const [type, c] of [['low', cL], ['high', cH]]) {
        const u = wage(own[type]) - c * own[type]
        for (const x of grid) {
          if (wage(x) - c * x > u + EPS) {
            ok = false
            break
          }
        }
        if (!ok) break
      }
      if (ok) (kind === 'pool' ? pool : sep).push(e)
    }
  }
  return { sep, pool, h }
}
