import { mulberry32 } from '../../rng.js'

// Panel B, "When only fees pay": block rewards when part of the reward is
// fees. Blocks are found with exponential gaps (mean 1, ten minutes); fees
// arrive at a steady rate f per mean gap and the next block takes every
// pending fee (Carlsten et al.'s simplification: with a backlog of
// transactions the rewards are smoother). A block's reward is S + f·gap.
//
// Mean S + f; standard deviation f; coefficient of variation f/(S + f).
// P(reward > 2·mean) = P(gap > 2 + S/f) = exp(−2 − S/f);
// P(reward > 3·mean) = exp(−3 − 2S/f).

export function exact(S, f) {
  const mean = S + f
  if (f <= 0) return { mean, cv: 0, over2: 0, over3: 0 }
  return { mean, cv: f / mean, over2: Math.exp(-2 - S / f), over3: Math.exp(-3 - (2 * S) / f) }
}

// A seeded run of `blocks` blocks: the shares above twice and three times
// the mean with their standard errors, the sample mean and CV, and the last
// 100 rewards.
export function simulate({ S, f, blocks, seed }) {
  const rnd = mulberry32(seed)
  const mean = S + f
  let n2 = 0
  let n3 = 0
  let sum = 0
  let sum2 = 0
  const last = new Array(Math.min(100, blocks))
  for (let i = 0; i < blocks; i++) {
    const gap = -Math.log(1 - rnd())
    const r = S + f * gap
    sum += r
    sum2 += r * r
    if (r > 2 * mean) n2++
    if (r > 3 * mean) n3++
    const j = i - (blocks - last.length)
    if (j >= 0) last[j] = r
  }
  const m = sum / blocks
  const sd = Math.sqrt(Math.max(0, sum2 / blocks - m * m))
  const p2 = n2 / blocks
  const p3 = n3 / blocks
  return {
    mean: m,
    cv: m > 0 ? sd / m : 0,
    over2: p2,
    over2Se: Math.sqrt((p2 * (1 - p2)) / blocks),
    over3: p3,
    over3Se: Math.sqrt((p3 * (1 - p3)) / blocks),
    last,
  }
}
