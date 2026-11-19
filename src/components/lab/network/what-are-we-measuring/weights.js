import { buildCSR, connectedComponents } from '../../graphUtils.js'

// Live figure "Where do you draw the line?": ten people and how often each
// pair was in contact (an invented table: 0 means never). Two tight groups,
// a–e and f–j, with a few weak ties between them. A threshold decides which
// contacts count as links.

export const LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

// [node, node, weight], weights 1 … 10.
export const PAIRS = [
  // first group
  [0, 1, 10], [0, 2, 8], [1, 2, 9], [0, 3, 6], [2, 3, 7], [1, 4, 6], [3, 4, 8], [2, 4, 5], [0, 4, 4],
  // second group
  [5, 6, 9], [5, 7, 7], [6, 7, 10], [6, 8, 6], [7, 8, 8], [5, 9, 5], [8, 9, 9], [7, 9, 6], [6, 9, 4],
  // weak ties between the groups
  [4, 5, 3], [2, 7, 2], [3, 8, 1], [1, 6, 1],
]

export const MAX_WEIGHT = 10

// Positions in a 320 × 200 box: the two groups side by side.
export const POSITIONS = [
  [40, 46], [110, 28], [96, 100], [34, 132], [118, 166],
  [202, 166], [222, 34], [224, 100], [286, 132], [280, 60],
]

// The network that survives a threshold: only pairs with weight ≥ threshold.
export function atThreshold(threshold) {
  const kept = PAIRS.filter((p) => p[2] >= threshold)
  const n = LABELS.length
  const g = buildCSR(n, Int32Array.from(kept, (p) => p[0]), Int32Array.from(kept, (p) => p[1]))
  const comp = connectedComponents(g)
  return {
    kept,
    L: kept.length,
    density: kept.length / ((n * (n - 1)) / 2),
    components: comp.count,
    isolated: comp.sizes.filter((s) => s === 1).length,
    largest: comp.largest,
  }
}
