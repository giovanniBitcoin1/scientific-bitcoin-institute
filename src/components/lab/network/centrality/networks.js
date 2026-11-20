import { mulberry32 } from '../../rng.js'
import { erdosRenyiGnm, barabasiAlbert, wattsStrogatz } from '../../graphUtils.js'

// The small networks of module 03. A network is { n, A, B, names }, with
// optional hand-made positions `pos` (flat x0, y0, x1, y1, … in the unit
// square). Florence and the karate club come from src/data/lab/networks/ and
// are passed in by the caller (the page imports the JSON, Node reads it).

const build = (names, pairs, extra = {}) => ({
  n: names.length,
  A: Int32Array.from(pairs, (p) => p[0]),
  B: Int32Array.from(pairs, (p) => p[1]),
  names,
  ...extra,
})

export const fromData = (data) => build(data.nodes, data.edges)

// ---------------------------------------------------------------- Krackhardt's kite

// Ten people and eighteen ties: the invented example of Krackhardt (1990),
// built so that three measures of centrality crown three different people.
const KITE_NAMES = ['Andre', 'Beverly', 'Carol', 'Diane', 'Ed', 'Fernando', 'Garth', 'Heather', 'Ike', 'Jane']
const KITE_PAIRS = [
  [0, 1], [0, 2], [0, 3], [0, 5],
  [1, 3], [1, 4], [1, 6],
  [2, 3], [2, 5],
  [3, 4], [3, 5], [3, 6],
  [4, 6],
  [5, 6], [5, 7],
  [6, 7],
  [7, 8],
  [8, 9],
]
// The kite lying on its side: the diamond on the left, the tail on the right.
const KITE_POS = [
  0.16, 0.2, // Andre
  0.16, 0.8, // Beverly
  0.0, 0.34, // Carol
  0.27, 0.5, // Diane
  0.0, 0.66, // Ed
  0.46, 0.22, // Fernando
  0.46, 0.78, // Garth
  0.66, 0.5, // Heather
  0.83, 0.5, // Ike
  1.0, 0.5, // Jane
]
export const KITE = build(KITE_NAMES, KITE_PAIRS, { pos: Float64Array.from(KITE_POS) })

// ---------------------------------------------------------------- Two groups and a bridge

// Two groups of ten, each a random network with 20 links of its own, joined
// by a single link. In each group the end of the bridge is the member with
// the fewest links (the lowest-numbered one among equals): the go-between is
// deliberately not the best connected. Seeds are tried in order until the
// group is in one piece.
function group(seed) {
  for (let s = seed; ; s++) {
    const { A, B } = erdosRenyiGnm(10, 20, s)
    const adj = Array.from({ length: 10 }, () => [])
    for (let e = 0; e < 20; e++) {
      adj[A[e]].push(B[e])
      adj[B[e]].push(A[e])
    }
    const seen = new Set([0])
    const stack = [0]
    while (stack.length) for (const v of adj[stack.pop()]) if (!seen.has(v)) seen.add(v) && stack.push(v)
    if (seen.size < 10) continue
    let end = 0
    for (let v = 1; v < 10; v++) if (adj[v].length < adj[end].length) end = v
    return { pairs: Array.from(A, (a, e) => [a, B[e]]), end }
  }
}

export const GROUPS = (() => {
  const left = group(31)
  const right = group(57)
  const names = [...'abcdefghij', ...'klmnopqrst']
  const pairs = [...left.pairs, ...right.pairs.map(([a, b]) => [a + 10, b + 10]), [left.end, right.end + 10]]
  return build(names, pairs, { bridge: [left.end, right.end + 10] })
})()

// ---------------------------------------------------------------- Figure F2

// Six nodes for "Scores from neighbours": a triangle a–b–c, with d hanging
// from c, and e and f hanging from d. The triangle keeps the repeated sums
// from flipping back and forth.
export const SIX = build(
  ['a', 'b', 'c', 'd', 'e', 'f'],
  [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [3, 5]],
  { pos: Float64Array.from([0.06, 0.14, 0.06, 0.86, 0.34, 0.5, 0.66, 0.5, 0.94, 0.14, 0.94, 0.86]) },
)

// ---------------------------------------------------------------- The web of Panel B

// Twelve pages, 21 links (A[e] → B[e]), no pair linked in both directions.
//   A, B, C, D, E, I   a core: from each of them every other can be reached
//   F                  a page nobody links to
//   G                  linked only from F
//   H                  a page with no outgoing links
//   J → K → L → J      a closed loop: links lead in (from I), none leads out
const WEB_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const W = Object.fromEntries(WEB_NAMES.map((name, i) => [name, i]))
const WEB_LINKS = [
  'AB', 'AC', 'BC', 'BD', 'CD', 'CE', 'DA', 'DE', 'EA', 'EI', 'EH', 'IB', 'IJ',
  'FA', 'FB', 'FG', 'GD', 'GH',
  'JK', 'KL', 'LJ',
].map((s) => [W[s[0]], W[s[1]]])
const WEB_POS = {
  F: [0.04, 0.1], G: [0.04, 0.62], A: [0.3, 0.06], B: [0.5, 0.3], C: [0.24, 0.42], D: [0.2, 0.84],
  E: [0.44, 0.7], H: [0.24, 1.0], I: [0.68, 0.52], J: [0.86, 0.3], K: [1.0, 0.62], L: [0.8, 0.84],
}
export const WEB = build(WEB_NAMES, WEB_LINKS, {
  pos: Float64Array.from(WEB_NAMES.flatMap((name) => WEB_POS[name])),
  roles: { source: W.F, dangling: W.H, loop: [W.J, W.K, W.L] },
})

// ---------------------------------------------------------------- Panel C

export const FRAGILE_SEED = 3
export const FRAGILE = {
  scaleFree: (seed = FRAGILE_SEED) => {
    const { A, B } = barabasiAlbert(300, 2, seed)
    return { n: 300, A, B }
  },
  smallWorld: (seed = FRAGILE_SEED) => {
    const { A, B } = wattsStrogatz(300, 6, 0.1, seed)
    return { n: 300, A, B }
  },
}

// A seeded starting layout for the force-directed drawings.
export function startLayout(n, seed) {
  const random = mulberry32(seed)
  return Float64Array.from({ length: 2 * n }, () => random())
}
