import { buildCSR, barabasiAlbert } from '../../graphUtils.js'
import { largestComponent } from './robust.js'

// Network Lab module 11: the fixed data and the logic of the two live figures.

// ---------------------------------------------------------------- F1, "Fail or target"

export const F1_N = 60
export const F1_M = 2
export const F1_SEED = 1101
export const F1_ORDER_SEED = 1102

// A heavy-tailed network of 60 nodes (preferential attachment, two links per
// new node).
export function failNet() {
  const g = barabasiAlbert(F1_N, F1_M, F1_SEED)
  return { n: F1_N, A: g.A, B: g.B, g: buildCSR(F1_N, g.A, g.B) }
}

// The node an attack takes next: the highest degree among the nodes left,
// counting only links to nodes left (ties: the lowest index). −1 if none.
export function nextTarget(net, removed) {
  let best = -1
  let top = -1
  for (let v = 0; v < net.n; v++) {
    if (removed[v]) continue
    let d = 0
    for (let i = net.g.offsets[v]; i < net.g.offsets[v + 1]; i++) if (!removed[net.g.neighbors[i]]) d++
    if (d > top) {
      top = d
      best = v
    }
  }
  return best
}

// What the figure shows after a list of removals: who is gone, who is in the
// largest component and how large it is.
export function failState(net, removedList) {
  const removed = new Uint8Array(net.n)
  for (const v of removedList) removed[v] = 1
  const alive = Uint8Array.from(removed, (x) => 1 - x)
  const big = removedList.length < net.n ? largestComponent(net.g, alive) : { size: 0, label: new Int32Array(net.n), id: -2 }
  return { removed, size: big.size, inGiant: Uint8Array.from({ length: net.n }, (_, v) => (alive[v] && big.label[v] === big.id ? 1 : 0)) }
}

// ---------------------------------------------------------------- F2, "The cascade"

// Two networks of 15 nodes. Node i of A and node i of B depend on each other.
export const F2_N = 15
export const F2_A = [[0, 1], [0, 2], [2, 3], [2, 4], [3, 5], [5, 6], [5, 7], [7, 8], [7, 9], [9, 10], [9, 11], [11, 12], [11, 13], [13, 14], [2, 6], [10, 12], [1, 3], [8, 11]]
export const F2_B = [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [6, 8], [8, 9], [8, 10], [10, 11], [10, 12], [11, 13], [12, 14], [10, 14], [9, 11], [4, 8], [8, 11]]
export const F2_START = { side: 0, node: 3 }

const csrOf = (links) => buildCSR(F2_N, Int32Array.from(links, (l) => l[0]), Int32Array.from(links, (l) => l[1]))
export const F2_G = [csrOf(F2_A), csrOf(F2_B)]

// The rounds of the cascade when `node` of network `side` (0 = A, 1 = B) is
// removed. Round 1 is in that network: the node fails, and so does whatever is
// cut off from the network's largest component. Every later round is in the
// other network: first the nodes whose partner has failed, then the ones cut
// off. It stops at the first round in which nothing fails. Each round lists
// who failed and why, and `dead` gives, for each network, the round in which
// each node failed (0 = still working).
export function dependenceCascade(side, node, g = F2_G) {
  const n = g[0].n
  const dead = [new Int32Array(n), new Int32Array(n)]
  const rounds = []
  let s = side
  for (let r = 1; ; r++) {
    const partner = []
    const cut = []
    if (r === 1) dead[s][node] = 1
    else
      for (let v = 0; v < n; v++)
        if (!dead[s][v] && dead[1 - s][v]) {
          dead[s][v] = r
          partner.push(v)
        }
    const alive = Uint8Array.from(dead[s], (x) => (x ? 0 : 1))
    const big = largestComponent(g[s], alive)
    for (let v = 0; v < n; v++)
      if (alive[v] && big.label[v] !== big.id) {
        dead[s][v] = r
        cut.push(v)
      }
    if (r > 1 && !partner.length && !cut.length) break
    rounds.push({ side: s, partner, cut })
    s = 1 - s
  }
  let left = 0
  for (let v = 0; v < n; v++) if (!dead[0][v] && !dead[1][v]) left++
  return { rounds, dead, left }
}
