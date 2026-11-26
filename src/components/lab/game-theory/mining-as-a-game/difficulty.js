import { mulberry32 } from '../../rng.js'
import { rates } from './selfish.js'

// Panel B, "The difficulty catches up". The attack starts at the beginning
// of a difficulty period. Until the first adjustment blocks are mined at one
// per 10 minutes and the chain grows by G = r_A + r_H per block mined; after
// 2016 chain blocks the difficulty falls so that the chain grows at one per
// 10 minutes again, and her income per 10 minutes becomes R. Rewards are
// counted in blocks.

export const PERIOD = 2016
export const PER_DAY = 144 // ten-minute intervals in a day
export const PERIOD_DAYS = PERIOD / PER_DAY // 14

export function expected(a, g) {
  const r = rates(a, g)
  const T1 = PERIOD_DAYS / r.G
  const before = r.rA / a
  const after = r.R / a
  const breakEven = r.R > a + 1e-12 ? (T1 * (r.R - r.rA)) / (r.R - a) : null
  // Her expected cumulative reward (blocks) on day t, and honest mining's.
  const selfish = (t) => PER_DAY * (t <= T1 ? r.rA * t : r.rA * T1 + r.R * (t - T1))
  const honest = (t) => PER_DAY * a * t
  return { ...r, T1, before, after, breakEven, selfish, honest }
}

// The adjustments on the expected line within the horizon: T1, then every
// 14 days (the chain grows at one block per 10 minutes after the first).
export function adjustments(T1, horizon) {
  const out = []
  for (let t = T1; t <= horizon + 1e-9; t += PERIOD_DAYS) out.push(t)
  return out
}

// One simulated path: blocks found at exponential times (a Poisson process),
// SM1 played block by block, the difficulty retargeted every 2016 chain blocks
// from the time the period took, as Bitcoin does (here without the factor-4
// clamp, which this attack never reaches). Returns her cumulative reward
// sampled every `step` days and the days of the adjustments.
export function simulatePath({ alpha: a, gamma: g, horizon, seed = 1, step = 0.25 }) {
  const rnd = mulberry32(seed)
  let rate = PER_DAY // blocks mined per day at the current difficulty
  let t = 0
  let lead = 0
  let tie = false
  let mine = 0 // her chain blocks
  let chain = 0
  let periodStart = 0
  let nextAdjust = PERIOD
  const adj = []
  const pts = [[0, 0]]
  let nextSample = step
  for (;;) {
    t += -Math.log(1 - rnd()) / rate
    while (nextSample <= Math.min(t, horizon) + 1e-12) {
      pts.push([nextSample, mine])
      nextSample += step
    }
    if (t > horizon) break
    const hers = rnd() < a
    let dA = 0
    let dH = 0
    if (tie) {
      tie = false
      if (hers) dA = 2
      else if (rnd() < g) {
        dA = 1
        dH = 1
      } else dH = 2
    } else if (hers) lead++
    else if (lead === 0) dH = 1
    else if (lead === 1) {
      lead = 0
      tie = true
    } else if (lead === 2) {
      lead = 0
      dA = 2
    } else {
      lead--
      dA = 1
    }
    mine += dA
    chain += dA + dH
    while (chain >= nextAdjust) {
      // The period's 2016 blocks took t − periodStart days instead of 14: the
      // difficulty is scaled by 14/(t − periodStart), the rate of blocks
      // found by its inverse.
      rate *= (t - periodStart) / PERIOD_DAYS
      periodStart = t
      adj.push(t)
      nextAdjust += PERIOD
    }
  }
  if (pts[pts.length - 1][0] < horizon - 1e-9) pts.push([horizon, mine])
  return { pts, adj, end: mine }
}
