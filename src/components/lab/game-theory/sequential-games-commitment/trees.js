import { mulberry32 } from '../../rng.js'
import { range } from '../what-is-a-game/games.js'

// Games in time with two players and perfect information: trees, backward
// induction, the table of plans and its pure Nash equilibria, subgame
// perfection checked by brute force, and the survey of random two-move
// trees. Pure logic, shared by Figure F1, Panel A and
// scripts/lab/check-game-theory-04.mjs.
//
// A tree is made of decision nodes { player, moves: [{ name, short, child }] }
// and leaves { payoffs: [u0, u1] }, payoffs always in the order of the two
// players (player 0, player 1), whoever moves at the root. `prepare` gives
// every node an id (depth-first order) and its path from the root.

export const node = (player, moves) => ({ player, moves: moves.map(([name, short, child]) => ({ name, short, child })) })
export const leaf = (u0, u1) => ({ payoffs: [u0, u1] })
export const isLeaf = (n) => !!n.payoffs

export function prepare(root) {
  const nodes = []
  const decision = [[], []]
  const visit = (n, path, depth, parent) => {
    n.id = nodes.length
    n.path = path
    n.depth = depth
    n.parent = parent
    nodes.push(n)
    if (isLeaf(n)) return
    decision[n.player].push(n)
    n.moves.forEach((m, k) => visit(m.child, [...path, m.name], depth + 1, { node: n, move: k }))
  }
  visit(root, [], 0, null)
  const depth = Math.max(...nodes.map((n) => n.depth))
  return { root, nodes, decision, depth, leaves: nodes.filter(isLeaf) }
}

// ------------------------------------------------------------------ Backward induction

// Solves the tree from the leaves. Ties go to the first move (the lowest
// index) and are flagged. Returns, for every decision node, the move chosen
// and the payoffs it leads to; `order` lists the decision nodes in the order
// they are solved (deepest first); `path` the nodes visited from the root.
export function backwardInduction(t) {
  const choice = new Map()
  const value = new Map()
  const tie = new Map()
  const order = []
  const solve = (n) => {
    if (isLeaf(n)) {
      value.set(n.id, n.payoffs)
      return n.payoffs
    }
    const vals = n.moves.map((m) => solve(m.child))
    let best = 0
    for (let k = 1; k < vals.length; k++) if (vals[k][n.player] > vals[best][n.player]) best = k
    tie.set(n.id, vals.some((v, k) => k !== best && v[n.player] === vals[best][n.player]))
    choice.set(n.id, best)
    value.set(n.id, vals[best])
    return vals[best]
  }
  solve(t.root)
  // Solving order: by height (leaves are height 0), then depth-first.
  const height = new Map()
  const h = (n) => {
    if (isLeaf(n)) return 0
    const v = 1 + Math.max(...n.moves.map((m) => h(m.child)))
    height.set(n.id, v)
    return v
  }
  h(t.root)
  const dec = t.nodes.filter((n) => !isLeaf(n))
  order.push(...dec.slice().sort((x, y) => height.get(x.id) - height.get(y.id) || x.id - y.id))
  const path = [t.root]
  let n = t.root
  while (!isLeaf(n)) {
    n = n.moves[choice.get(n.id)].child
    path.push(n)
  }
  return { choice, value, tie, order, height, path, outcome: n, anyTie: [...tie.values()].some(Boolean) }
}

// The profile of plans that backward induction gives, as indices into the
// lists of `plans`.
export function biProfile(t, bi = backwardInduction(t)) {
  return [0, 1].map((p) => t.decision[p].map((n) => bi.choice.get(n.id)))
}

// ------------------------------------------------------------------ Plans and the table

// Every plan of player p: one move index for each of p's decision nodes, in
// the order of t.decision[p] (the first node varies slowest).
export function plans(t, p) {
  const nodes = t.decision[p]
  let out = [[]]
  for (const n of nodes) out = out.flatMap((pl) => n.moves.map((_, k) => [...pl, k]))
  return out
}

// A plan's name: the short labels of its moves, in node order.
export function planName(t, p, plan) {
  if (plan.length === 0) return '–'
  return plan.map((k, i) => t.decision[p][i].moves[k].short).join('')
}

// The leaf reached when the two players follow their plans, from node `from`.
export function play(t, profile, from = t.root) {
  const index = [0, 1].map((p) => new Map(t.decision[p].map((n, i) => [n.id, i])))
  let n = from
  const visited = [n]
  while (!isLeaf(n)) {
    n = n.moves[profile[n.player][index[n.player].get(n.id)]].child
    visited.push(n)
  }
  return { leaf: n, visited }
}

// The table of plans: rows are player 0's plans, columns player 1's; the
// payoffs { a, b } are player 0's and player 1's.
export function tableOf(t) {
  const P0 = plans(t, 0)
  const P1 = plans(t, 1)
  const a = P0.map(() => new Array(P1.length))
  const b = P0.map(() => new Array(P1.length))
  const leafOf = P0.map(() => new Array(P1.length))
  P0.forEach((x, i) =>
    P1.forEach((y, j) => {
      const { leaf: l } = play(t, [x, y])
      a[i][j] = l.payoffs[0]
      b[i][j] = l.payoffs[1]
      leafOf[i][j] = l.id
    }),
  )
  return {
    rows: P0.map((x) => planName(t, 0, x)),
    cols: P1.map((y) => planName(t, 1, y)),
    a,
    b,
    plans: [P0, P1],
    leafOf,
  }
}

// Pure Nash equilibria of a table: cells where neither player gains strictly
// by changing plan alone.
export function pureNash(g) {
  const out = []
  const m = g.a.length
  const n = g.a[0].length
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let ok = true
      for (let r = 0; r < m && ok; r++) if (g.a[r][j] > g.a[i][j]) ok = false
      for (let c = 0; c < n && ok; c++) if (g.b[i][c] > g.b[i][j]) ok = false
      if (ok) out.push([i, j])
    }
  }
  return out
}

// ------------------------------------------------------------------ Subgame perfection, by brute force

// Decision nodes of the subtree below n (n included), per player.
function subtreeNodes(n) {
  const out = [[], []]
  const visit = (x) => {
    if (isLeaf(x)) return
    out[x.player].push(x)
    x.moves.forEach((m) => visit(m.child))
  }
  visit(n)
  return out
}

// Is the profile a Nash equilibrium of every subgame? For each decision node
// every alternative plan of each player inside the subtree is tried against
// the other's plan: no strict gain is allowed. Independent of
// backwardInduction (it never uses it).
export function isSubgamePerfect(t, profile) {
  const index = [0, 1].map((p) => new Map(t.decision[p].map((n, i) => [n.id, i])))
  for (const n of t.nodes) {
    if (isLeaf(n)) continue
    const base = play(t, profile, n).leaf.payoffs
    const sub = subtreeNodes(n)
    for (const p of [0, 1]) {
      const own = sub[p]
      if (own.length === 0) continue
      // Every assignment of moves to p's nodes in the subtree.
      let assignments = [[]]
      for (const x of own) assignments = assignments.flatMap((as) => x.moves.map((_, k) => [...as, k]))
      for (const as of assignments) {
        const alt = profile[p].slice()
        own.forEach((x, i) => (alt[index[p].get(x.id)] = as[i]))
        const prof = p === 0 ? [alt, profile[1]] : [profile[0], alt]
        if (play(t, prof, n).leaf.payoffs[p] > base[p]) return false
      }
    }
  }
  return true
}

// For a profile that is not subgame perfect: the deepest decision node where
// the mover would gain by changing that one move, given the rest of the
// profile. { node, player, move, better, got, could } or null.
export function emptyThreat(t, profile) {
  const index = [0, 1].map((p) => new Map(t.decision[p].map((n, i) => [n.id, i])))
  const dec = t.nodes.filter((n) => !isLeaf(n)).sort((x, y) => y.depth - x.depth || x.id - y.id)
  for (const n of dec) {
    const p = n.player
    const k = profile[p][index[p].get(n.id)]
    const got = play(t, profile, n).leaf.payoffs[p]
    let best = null
    n.moves.forEach((m, j) => {
      if (j === k) return
      const v = play(t, profile, m.child).leaf.payoffs[p]
      if (v > got && (!best || v > best.could)) best = { better: j, could: v }
    })
    if (best) return { node: n, player: p, move: k, better: best.better, got, could: best.could }
  }
  return null
}

// Everything Panel A shows about a tree.
export function analyse(t) {
  const bi = backwardInduction(t)
  const g = tableOf(t)
  const eq = pureNash(g).map(([i, j]) => {
    const profile = [g.plans[0][i], g.plans[1][j]]
    const spe = isSubgamePerfect(t, profile)
    return { cell: [i, j], profile, spe, leaf: g.leafOf[i][j], threat: spe ? null : emptyThreat(t, profile) }
  })
  return { bi, table: g, eq }
}

// ------------------------------------------------------------------ Two-move trees and two-by-two games

// The first player chooses U or D, then the second, having seen it, L or R.
// cells: payoffs [u0, u1] at (U, L), (U, R), (D, L), (D, R).
export function twoStage(cells, names = { U: ['U', 'U'], D: ['D', 'D'], L: ['L', 'L'], R: ['R', 'R'] }) {
  const [UL, UR, DL, DR] = cells
  const second = (x, y) => node(1, [[...names.L, leaf(...x)], [...names.R, leaf(...y)]])
  return prepare(node(0, [[...names.U, second(UL, UR)], [...names.D, second(DL, DR)]]))
}

// The same cells with the second player moving first.
export function twoStageReversed(cells) {
  const [UL, UR, DL, DR] = cells
  const first = (x, y) => node(0, [['U', 'U', leaf(...x)], ['D', 'D', leaf(...y)]])
  return prepare(node(1, [['L', 'L', first(UL, DL)], ['R', 'R', first(UR, DR)]]))
}

// Three stages: first player, second player, first player again (8 leaves).
export function threeStage(leaves) {
  let k = 0
  const third = () => node(0, [['u', 'u', leaf(...leaves[k++])], ['d', 'd', leaf(...leaves[k++])]])
  const second = () => node(1, [['L', 'L', third()], ['R', 'R', third()]])
  return prepare(node(0, [['U', 'U', second()], ['D', 'D', second()]]))
}

// The pure equilibria of the two-by-two game played at the same time.
export function simultaneous(cells) {
  const [UL, UR, DL, DR] = cells
  const g = { a: [[UL[0], UR[0]], [DL[0], DR[0]]], b: [[UL[1], UR[1]], [DL[1], DR[1]]] }
  return pureNash(g).map(([i, j]) => [g.a[i][j], g.b[i][j]])
}

// ------------------------------------------------------------------ Random trees

export const TREE_SEED = 4100 // the trees of "New tree"
export const SURVEY_SEED = 4400 // the survey
export const DEFAULT_TREES = 2000

// No ties that matter: the first player's four payoffs are all different,
// and so are the second player's two payoffs after each first move (and,
// for the reversed order, the first player's two payoffs after each column).
export function tiesMatter(cells) {
  const u0 = cells.map((c) => c[0])
  if (new Set(u0).size < 4) return true
  if (cells[0][1] === cells[1][1] || cells[2][1] === cells[3][1]) return true
  return false
}

// Random tree no. `index` with whole payoffs 0–9 (redrawn while ties matter).
export function randomCells(index, seed = TREE_SEED) {
  const random = mulberry32(seed + index)
  for (;;) {
    const cells = range(4).map(() => [Math.floor(random() * 10), Math.floor(random() * 10)])
    if (!tiesMatter(cells)) return cells
  }
}

// ------------------------------------------------------------------ Survey

function tally() {
  return {
    trees: 0, nash: { 1: 0, 2: 0, 3: 0, more: 0 }, notSpe: 0, differs: 0, secondBetter: 0,
    first: { better: 0, worse: 0, same: 0 }, bothFirst: 0, bothSecond: 0,
    noPure: 0, noPureBothSecond: 0, withPure: 0, leaderAbove: 0, leaderBelow: 0, biUnique: 0,
  }
}

export function surveyShares(t) {
  const n = t.trees || 1
  return {
    trees: t.trees,
    nash1: t.nash[1] / n, nash2: t.nash[2] / n, nash3: t.nash[3] / n, nashMore: t.nash.more,
    notSpe: t.notSpe / n, differs: t.differs / n, secondBetter: t.differs ? t.secondBetter / t.differs : 0,
    better: t.first.better / n, worse: t.first.worse / n, same: t.first.same / n,
    bothFirst: t.bothFirst / n, bothSecond: t.bothSecond / n,
    noPure: t.noPure / n, noPureBothSecond: t.noPure ? t.noPureBothSecond / t.noPure : 0,
    withPure: t.withPure / n, leaderAbove: t.withPure ? t.leaderAbove / t.withPure : 0, leaderBelow: t.leaderBelow,
    biUnique: t.biUnique,
  }
}

// One tree of the survey: payoffs uniform on 0–1.
export function surveyOne(cells, t) {
  const tree = twoStage(cells)
  const { bi, table, eq } = analyse(tree)
  t.trees++
  const k = eq.length
  if (k <= 3) t.nash[k]++
  else t.nash.more++
  if (eq.filter((e) => e.spe).length === 1 && eq.find((e) => e.spe).leaf === bi.outcome.id) t.biUnique++
  const bad = eq.filter((e) => !e.spe)
  if (bad.length) t.notSpe++
  const other = bad.filter((e) => e.leaf !== bi.outcome.id)
  if (other.length) {
    t.differs++
    const l = tree.nodes[other[0].leaf]
    if (l.payoffs[1] > bi.outcome.payoffs[1]) t.secondBetter++
  }
  // As a two-by-two game: moving first (this tree) or second (reversed).
  const lead = bi.outcome.payoffs
  const follow = backwardInduction(twoStageReversed(cells)).outcome.payoffs
  if (lead[0] > follow[0]) t.first.better++
  else if (lead[0] < follow[0]) t.first.worse++
  else t.first.same++
  if (lead[0] > follow[0] && follow[1] > lead[1]) t.bothFirst++
  if (lead[0] < follow[0] && follow[1] < lead[1]) t.bothSecond++
  const sim = simultaneous(cells)
  if (sim.length === 0) {
    t.noPure++
    if (lead[0] < follow[0] && follow[1] < lead[1]) t.noPureBothSecond++
  } else {
    t.withPure++
    const best = Math.max(...sim.map((s) => s[0]))
    if (lead[0] > best) t.leaderAbove++
    if (lead[0] < best) t.leaderBelow++
  }
  void table
}

export function surveyJob({ trees = DEFAULT_TREES, seed = SURVEY_SEED } = {}) {
  const t = tally()
  const random = mulberry32(seed)
  function* iter() {
    for (let k = 0; k < trees; k++) {
      surveyOne(range(4).map(() => [random(), random()]), t)
      if (k % 20 === 19) yield (k + 1) / trees
    }
  }
  return { iter: iter(), snapshot: () => surveyShares(t) }
}

export function survey(cfg) {
  const job = surveyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}
