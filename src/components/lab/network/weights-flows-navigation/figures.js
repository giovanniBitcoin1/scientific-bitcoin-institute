import { directedNet, maxFlow, flowPaths, widestRoute } from './flow.js'

// Network Lab module 10: the fixed data of the two live figures.

// F1, "Strength and disparity": one node with six links (exercise 1).
export const F1_START = [5, 1, 1, 1, 1, 1]
export const F1_MAX = 20
export const F1_LEVEL = 0.05

// F2, "One route or several": two small directed networks with capacities.
// `arcs` are [from, to, capacity]; `pos` puts the nodes in the unit square.
export const F2_PRESETS = [
  {
    id: 'four',
    names: ['s', 'a', 'b', 't'],
    arcs: [[0, 1, 3], [0, 2, 2], [1, 3, 2], [1, 2, 1], [2, 3, 3]],
    pos: [[0.04, 0.5], [0.5, 0.1], [0.5, 0.9], [0.96, 0.5]],
    s: 0,
    t: 3,
  },
  {
    id: 'six',
    names: ['s', 'a', 'b', 'c', 'd', 't'],
    arcs: [[0, 1, 6], [0, 2, 5], [1, 3, 2], [1, 4, 2], [2, 3, 1], [2, 4, 3], [3, 5, 4], [4, 5, 6]],
    pos: [[0.04, 0.5], [0.34, 0.1], [0.34, 0.9], [0.66, 0.1], [0.66, 0.9], [0.96, 0.5]],
    s: 0,
    t: 5,
  },
]

// Everything the figure shows about a preset.
export function solvePreset(p) {
  const net = directedNet(p.names.length, p.arcs)
  const mf = maxFlow(net, p.s, p.t)
  const wide = widestRoute(net, net.cap, p.s, p.t)
  const name = (nodes) => nodes.map((v) => p.names[v]).join('–')
  return {
    net,
    widest: { width: wide.width, arcs: wide.arcs.map((a) => a >> 1), label: name(wide.nodes) },
    maxFlow: mf.value,
    flow: p.arcs.map((_, i) => mf.flow[2 * i]),
    paths: flowPaths(net, mf.flow, p.s, p.t).map((q) => ({ label: name(q.nodes), amount: q.amount, arcs: q.arcs.map((a) => a >> 1) })),
    cut: mf.cut.map((a) => a >> 1),
    cutCapacity: mf.cutCapacity,
    side: mf.side,
  }
}
