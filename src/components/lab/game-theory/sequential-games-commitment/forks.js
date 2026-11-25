import { mulberry32 } from '../../rng.js'

// The two forks of the Bitcoin box (Narayanan et al. 2016, ch. 5). Pure
// logic, checked by scripts/lab/check-game-theory-04.mjs.

// ------------------------------------------------------------------ The Bitcoin box

// A miner with a share α of the hash rate tries to orphan a block holding a
// transaction it dislikes, and gives up once that block has one
// confirmation (feather forking). It succeeds only by finding the next two
// blocks: chance α². Another miner who includes the transaction keeps its
// fee with chance 1 − α² and loses its whole block with chance α²: it pays
// only if fee > α²/(1 − α²) of the block's value. Over the next two blocks
// the attacker expects α(1 + α) blocks instead of 2α: one attempt costs it
// α(1 − α) of a block.
export const featherChance = (a) => a * a
export const feeThreshold = (a) => (a * a) / (1 - a * a)
export const attemptCost = (a) => a * (1 - a)

// n two-block races by simulation: { success, blocks } — the share of races
// the attacker wins and its mean number of blocks kept among the next two
// (an honest miner of the same size keeps 2α on average).
export function races(a, n = 200000, seed = 6100) {
  const random = mulberry32(seed)
  let wins = 0
  let blocks = 0
  for (let k = 0; k < n; k++) {
    if (random() < a) {
      // The attacker found the first block, on the parent of the target.
      if (random() < a) {
        wins++
        blocks += 2
      }
      // Otherwise the others confirm the target and the attacker's block is lost.
    } else {
      // The others confirmed the target first: the attacker gives up and mines
      // the next block on the longest chain like everyone else.
      if (random() < a) blocks += 1
    }
  }
  return { success: wins / n, blocks: blocks / n, cost: 2 * a - blocks / n }
}
