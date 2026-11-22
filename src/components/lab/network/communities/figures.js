import { fromEdges, modularity, ringQ } from './community.js'

// The data behind the two live figures of module 09.

// F1 "Score a split": two dense groups of eight, nodes 0–7 and 8–15, joined by
// three links. Each group is a ring with chords.
const ringChords = (o, chords) => [
  ...Array.from({ length: 8 }, (_, i) => [o + i, o + ((i + 1) % 8)]),
  ...chords.map(([a, b]) => [o + a, o + b]),
]
const F1_EDGES = [
  ...ringChords(0, [[0, 2], [0, 4], [1, 3], [1, 5], [2, 6], [3, 7], [4, 6], [5, 7]]),
  ...ringChords(8, [[0, 2], [0, 4], [1, 3], [1, 5], [2, 6], [3, 7], [4, 6]]),
  [2, 9],
  [5, 12],
  [7, 14],
]
export const F1_NET = fromEdges(16, F1_EDGES)
// The figure opens with two members on the wrong side.
export const F1_START = Int32Array.from({ length: 16 }, (_, i) => (i < 8 ? 0 : 1))
F1_START[2] = 1
F1_START[12] = 0

// Positions: each group on a circle, the two circles side by side, the nodes
// that carry the cross links turned towards the middle.
export const F1_POS = (() => {
  const pos = new Float64Array(32)
  const place = (o, cx, turn) => {
    for (let i = 0; i < 8; i++) {
      const a = turn + (2 * Math.PI * i) / 8
      pos[2 * (o + i)] = cx + 0.19 * Math.cos(a)
      pos[2 * (o + i) + 1] = 0.5 + 0.38 * Math.sin(a)
    }
  }
  place(0, 0.25, -Math.PI / 2 + 0.3)
  place(8, 0.75, Math.PI / 2 + 0.9)
  return pos
})()

// The best split into two groups (at most two labels), by exhaustion over
// the 2¹⁵ splits with node 0 in group 0.
export function bestSplit(g) {
  const n = g.n
  let best = null
  const p = new Int32Array(n)
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    for (let i = 1; i < n; i++) p[i] = (mask >> (i - 1)) & 1
    const q = modularity(g, p)
    if (!best || q > best.Q + 1e-12) best = { Q: q, partition: Int32Array.from(p) }
  }
  return best
}

// F2 "Ring of cliques": Q of each clique alone and of pairs, n even from 6 to 40.
export const F2_S = 5
export const F2_MIN = 6
export const F2_MAX = 40
export function ringCurve(s = F2_S) {
  const out = []
  for (let n = F2_MIN; n <= F2_MAX; n += 2) {
    const q = ringQ(n, s)
    out.push({ n, one: q.one, pairs: q.pairs })
  }
  return out
}

// A drawing of a ring of n cliques of s nodes: the cliques on a big circle,
// each clique's nodes on a small one, node 0 facing the next clique and
// node 1 the previous.
export function ringPositions(n, s) {
  const pos = new Float64Array(2 * n * s)
  const R = 0.4
  const r = Math.min(0.08, (0.85 * Math.PI * R) / n)
  for (let c = 0; c < n; c++) {
    const a = (2 * Math.PI * c) / n - Math.PI / 2
    const cx = 0.5 + R * Math.cos(a)
    const cy = 0.5 + R * Math.sin(a)
    const tangent = a + Math.PI / 2
    for (let i = 0; i < s; i++) {
      // node 0 towards the next clique, node 1 towards the previous one
      const b = i === 0 ? tangent : i === 1 ? tangent + Math.PI : tangent + Math.PI + ((i - 1) * Math.PI) / (s - 1)
      pos[2 * (c * s + i)] = cx + r * Math.cos(b)
      pos[2 * (c * s + i) + 1] = cy + r * Math.sin(b)
    }
  }
  return pos
}
