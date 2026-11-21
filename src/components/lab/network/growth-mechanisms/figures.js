import { growKernel } from './growth.js'
import { kernelTable } from './kernel.js'
import { seedOf } from './experiments.js'

// Network Lab module 06: the logic of the two live figures.

// F1 "How fast do the rich get richer?": one hub with K links and `others`
// nodes with `k` links each; with Π ∝ k^α, the share of the next link that
// goes to the hub.
export const RICH_OTHERS = 1000
export const RICH_K = 2
export function hubShare(K, alpha, others = RICH_OTHERS, k = RICH_K) {
  const h = K ** alpha
  return h / (h + others * k ** alpha)
}

// F2 "Two snapshots": a linear preferential-attachment network of 30 nodes
// (m = 2), then 10 more; the old nodes, the links they gained and the table
// by degree class at the first snapshot.
export const SNAP_N1 = 30
export const SNAP_DN = 10
export const SNAP_M = 2
export const SNAP_SEED = 6300
export function snapshots(sample = 0) {
  const net = growKernel({ N: SNAP_N1 + SNAP_DN, m: SNAP_M, alpha: 1, A: 0, seed: seedOf(SNAP_SEED, sample) })
  const table = kernelTable(net, SNAP_N1)
  const gained = new Int32Array(SNAP_N1)
  for (let e = 0; e < net.A.length; e++) if (net.A[e] >= SNAP_N1 && net.B[e] < SNAP_N1) gained[net.B[e]]++
  return { net, table, gained }
}
