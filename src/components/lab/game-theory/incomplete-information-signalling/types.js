import { node, leaf, backwardInduction, isLeaf } from '../sequential-games-commitment/trees.js'
import { equilibrium as cournot, describe } from '../nash-equilibrium/cournot.js'

// Games with types. Pure logic, shared by Figure F1, the exercises and
// scripts/lab/check-game-theory-05.mjs. Module 04's trees.js is used as it is,
// one branch at a time: it has no chance moves, and it is not generalised.
//
// ------------------------------------------------------------------ The entry game with a tough or a weak incumbent
//
// The entry game of module 04 (same numbers), payoffs (newcomer, incumbent):
// stay out (0, 4); enter and share (2, 2); enter and fight (w, 3) if the
// incumbent is tough, (w, 0) if it is weak. Nature draws "tough" with
// probability t; the incumbent knows its type, the newcomer does not.

export const ENTRY = { out: [0, 4], share: [2, 2], fightTough: 3, fightWeak: 0 }
export const DEFAULT_T = 0.5
export const DEFAULT_W = -1

export const NAMES = {
  en: {
    tough: 'Tough', weak: 'Weak',
    out: ['Stay out', 'O'], in: ['Enter', 'E'], share: ['Share', 'S'], fight: ['Fight', 'F'],
  },
  it: {
    tough: 'Duro', weak: 'Debole',
    out: ['Resta fuori', 'F'], in: ['Entra', 'E'], share: ['Dividi', 'D'], fight: ['Combatti', 'C'],
  },
}

// The incumbent's own branch, as a one-player tree of module 04: after
// entry, share or fight. Solved by module 04's backward induction.
function incumbentBranch(type, w, n) {
  const fight = type === 'tough' ? ENTRY.fightTough : ENTRY.fightWeak
  return node(1, [
    [...n.share, leaf(...ENTRY.share)],
    [...n.fight, leaf(w, fight)],
  ])
}

// What each type of incumbent does after entry (backward induction on its
// own branch): { move: 0 share | 1 fight, payoffs } for 'tough' and 'weak'.
export function incumbentChoice(type, w = DEFAULT_W) {
  const t = { root: incumbentBranch(type, w, NAMES.en) }
  t.nodes = [t.root, ...t.root.moves.map((m) => m.child)]
  t.root.id = 0
  t.root.moves.forEach((m, k) => (m.child.id = k + 1))
  const bi = backwardInduction(t)
  return { move: bi.choice.get(0), payoffs: bi.outcome.payoffs }
}

// The newcomer's expected payoff from entering: 2(1 − t) + t w when the tough
// type fights and the weak one shares (computed from the choices, not assumed).
export function enterValue(t, w = DEFAULT_W) {
  const tough = incumbentChoice('tough', w).payoffs[0]
  const weak = incumbentChoice('weak', w).payoffs[0]
  return t * tough + (1 - t) * weak
}

export const threshold = (w = DEFAULT_W) => 2 / (2 - w)

// The Bayesian Nash equilibrium of the game: each type of incumbent
// best-responds after entry; the newcomer enters when entering pays strictly
// more than the 0 of staying out (at the threshold it stays out).
export function entryWithTypes({ t = DEFAULT_T, w = DEFAULT_W } = {}) {
  const tough = incumbentChoice('tough', w)
  const weak = incumbentChoice('weak', w)
  const value = t * tough.payoffs[0] + (1 - t) * weak.payoffs[0]
  const enters = value > ENTRY.out[0] + 1e-12
  const tie = Math.abs(value - ENTRY.out[0]) <= 1e-12
  return {
    t, w, tough, weak, value, enters, tie,
    threshold: threshold(w),
    get: { tough: enters ? tough.payoffs[1] : ENTRY.out[1], weak: enters ? weak.payoffs[1] : ENTRY.out[1] },
    newcomer: enters ? value : ENTRY.out[0],
  }
}

// The tree of Figure F1, in the shape GameTree.jsx draws: a chance node at
// the root (probabilities on its moves), the two newcomer nodes in one
// information set, then the incumbent of each type. Ids in depth-first order.
export function typesTree({ t = DEFAULT_T, w = DEFAULT_W } = {}, lang = 'en') {
  const n = NAMES[lang] || NAMES.en
  const newcomer = (type) => node(0, [
    [...n.out, leaf(...ENTRY.out)],
    [...n.in, incumbentBranch(type, w, n)],
  ])
  const root = {
    chance: true,
    moves: [
      { name: n.tough, short: n.tough, prob: t, child: newcomer('tough') },
      { name: n.weak, short: n.weak, prob: 1 - t, child: newcomer('weak') },
    ],
  }
  const nodes = []
  const visit = (x, depth, path) => {
    x.id = nodes.length
    x.depth = depth
    x.path = path
    nodes.push(x)
    if (!isLeaf(x)) x.moves.forEach((m) => visit(m.child, depth + 1, [...path, m.name]))
  }
  visit(root, 0, [])
  const tree = { root, nodes, leaves: nodes.filter(isLeaf), depth: Math.max(...nodes.map((x) => x.depth)) }
  const [toughNode, weakNode] = root.moves.map((m) => m.child)
  tree.infoSets = [[toughNode.id, weakNode.id]]
  tree.newcomerNodes = [toughNode, weakNode]
  tree.incumbentNodes = [toughNode.moves[1].child, weakNode.moves[1].child]
  return tree
}

// Everything F1 draws: the tree, the moves chosen at every decision node and
// the paths actually played, one per type.
export function typesFigure(cfg = {}, lang = 'en') {
  const eq = entryWithTypes(cfg)
  const tree = typesTree(cfg, lang)
  const choice = new Map()
  tree.newcomerNodes.forEach((x) => choice.set(x.id, eq.enters ? 1 : 0))
  choice.set(tree.incumbentNodes[0].id, eq.tough.move)
  choice.set(tree.incumbentNodes[1].id, eq.weak.move)
  const path = new Set([tree.root.id])
  for (const x of tree.newcomerNodes) {
    path.add(x.id)
    let y = x.moves[choice.get(x.id)].child
    path.add(y.id)
    if (!isLeaf(y)) path.add(y.moves[choice.get(y.id)].child.id)
  }
  return { eq, tree, choice, path }
}

// ------------------------------------------------------------------ Cournot with a hidden cost (exercise 4)
//
// The market of module 02, price a − Q with a = 10. Firm 1's cost is c1 = 1;
// firm 2's cost is low or high with equal chances, and only firm 2 knows it.
// Each type of firm 2 best-responds to q1; firm 1 best-responds to the mean
// of q2. Linear, so the equilibrium solves in closed form.

export const HIDDEN = { a: 10, c1: 1, low: 0, high: 2, p: 0.5 }

export const bestResponse = (others, a, c) => Math.max(0, (a - c - others) / 2)

export function hiddenCost({ a, c1, low, high, p } = HIDDEN) {
  const meanC = p * low + (1 - p) * high
  // q1 = (a − c1 − E q2)/2 and E q2 = (a − meanC − q1)/2.
  const q1 = (a - 2 * c1 + meanC) / 3
  const q2 = { low: bestResponse(q1, a, low), high: bestResponse(q1, a, high) }
  const at = (c, q) => describe(a, c1, c, q1, q)
  const low_ = at(low, q2.low)
  const high_ = at(high, q2.high)
  const known = { low: cournot(a, c1, low), high: cournot(a, c1, high) }
  return {
    q1, q2,
    price: { low: low_.price, high: high_.price },
    profit1: { low: low_.profit1, high: high_.profit1, mean: p * low_.profit1 + (1 - p) * high_.profit1 },
    profit2: { low: low_.profit2, high: high_.profit2 },
    known: {
      low: known.low, high: known.high,
      mean1: p * known.low.profit1 + (1 - p) * known.high.profit1,
    },
  }
}
