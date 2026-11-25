// Two-player games in normal form: tables, best responses, strict dominance,
// iterated elimination, stable cells, the survey of the 576 ordinal two-by-two
// games and the map of the symmetric ones. Pure logic, shared by the figures,
// the panels and scripts/lab/check-game-theory-01.mjs.
//
// A game is { rows, cols, a, b }: the names of the row player's and of the
// column player's strategies, and two matrices. a[i][j] is what the row player
// gets and b[i][j] what the column player gets when the row player chooses i
// and the column player j.

export function makeGame(rows, cols, cells) {
  return {
    rows,
    cols,
    a: cells.map((row) => row.map((c) => c[0])),
    b: cells.map((row) => row.map((c) => c[1])),
  }
}

export const range = (n) => Array.from({ length: n }, (_, i) => i)

const grid = (m, n) => Array.from({ length: m }, () => new Array(n).fill(false))

// Best responses among the strategies still in play (R rows, C columns), ties
// included. row[i][j]: i is a best reply of the row player to column j;
// col[i][j]: j is a best reply of the column player to row i.
export function bestResponses(g, R = range(g.a.length), C = range(g.a[0].length)) {
  const row = grid(g.a.length, g.a[0].length)
  const col = grid(g.a.length, g.a[0].length)
  for (const j of C) {
    let best = -Infinity
    for (const i of R) if (g.a[i][j] > best) best = g.a[i][j]
    for (const i of R) if (g.a[i][j] === best) row[i][j] = true
  }
  for (const i of R) {
    let best = -Infinity
    for (const j of C) if (g.b[i][j] > best) best = g.b[i][j]
    for (const j of C) if (g.b[i][j] === best) col[i][j] = true
  }
  return { row, col }
}

// Cells where the two marks meet: neither player gains by moving alone.
export function stableCells(g, R = range(g.a.length), C = range(g.a[0].length)) {
  const { row, col } = bestResponses(g, R, C)
  const out = []
  for (const i of R) for (const j of C) if (row[i][j] && col[i][j]) out.push([i, j])
  return out
}

// The first row k that is strictly better than row i against every column
// still in play, or -1. Only single strategies are tried, not mixtures.
export function rowDominator(g, i, R, C) {
  for (const k of R) {
    if (k === i) continue
    let better = true
    for (const j of C) {
      if (!(g.a[k][j] > g.a[i][j])) {
        better = false
        break
      }
    }
    if (better) return k
  }
  return -1
}

export function colDominator(g, j, R, C) {
  for (const k of C) {
    if (k === j) continue
    let better = true
    for (const i of R) {
      if (!(g.b[i][k] > g.b[i][j])) {
        better = false
        break
      }
    }
    if (better) return k
  }
  return -1
}

// Every strictly dominated strategy among those in play:
// [{ player: 'row' | 'col', index, by }], rows first.
export function dominated(g, R = range(g.a.length), C = range(g.a[0].length)) {
  const out = []
  for (const i of R) {
    const by = rowDominator(g, i, R, C)
    if (by >= 0) out.push({ player: 'row', index: i, by })
  }
  for (const j of C) {
    const by = colDominator(g, j, R, C)
    if (by >= 0) out.push({ player: 'col', index: j, by })
  }
  return out
}

// Iterated elimination of strictly dominated strategies, one strategy per
// step. `pick` chooses which of the dominated strategies goes next (default:
// the first, rows before columns); with strict dominance what is left does not
// depend on it. Returns { steps, rows, cols }: the deletions in order and the
// strategies that survive.
export function eliminate(g, pick = (list) => list[0]) {
  let R = range(g.a.length)
  let C = range(g.a[0].length)
  const steps = []
  for (;;) {
    const list = dominated(g, R, C)
    if (!list.length) break
    const step = pick(list)
    steps.push(step)
    if (step.player === 'row') R = R.filter((i) => i !== step.index)
    else C = C.filter((j) => j !== step.index)
  }
  return { steps, rows: R, cols: C }
}

// The state after the first n steps of an elimination.
export function afterSteps(g, steps, n) {
  const goneR = new Set()
  const goneC = new Set()
  for (const s of steps.slice(0, n)) (s.player === 'row' ? goneR : goneC).add(s.index)
  return {
    rows: range(g.a.length).filter((i) => !goneR.has(i)),
    cols: range(g.a[0].length).filter((j) => !goneC.has(j)),
    goneR,
    goneC,
  }
}

// A strategy that is strictly better than each of the player's other
// strategies whatever the other player does, or -1.
export function dominantStrategy(g, player) {
  const R = range(g.a.length)
  const C = range(g.a[0].length)
  const own = player === 'row' ? R : C
  for (const s of own) {
    const beatsAll = own.every((o) => {
      if (o === s) return true
      if (player === 'row') return C.every((j) => g.a[s][j] > g.a[o][j])
      return R.every((i) => g.b[i][s] > g.b[i][o])
    })
    if (beatsAll && own.length > 1) return s
  }
  return -1
}

// Cells that no other cell beats for both players at once.
export function unbeatenCells(g) {
  const cells = []
  for (const i of range(g.a.length)) for (const j of range(g.a[0].length)) cells.push([i, j])
  return cells.filter(
    ([i, j]) => !cells.some(([k, l]) => g.a[k][l] > g.a[i][j] && g.b[k][l] > g.b[i][j]),
  )
}

// True when some other cell is better for both players than cell (i, j).
export const beatenForBoth = (g, i, j) => !unbeatenCells(g).some(([k, l]) => k === i && l === j)

// ------------------------------------------------------------------ Presets

// Figure F1: three three-by-three games.
export const F1_PRESETS = {
  four: makeGame(['U', 'M', 'D'], ['L', 'C', 'R'], [
    [[4, 8], [5, 5], [4, 3]],
    [[1, 8], [4, 0], [6, 1]],
    [[5, 2], [9, 9], [0, 1]],
  ]),
  halfway: makeGame(['U', 'M', 'D'], ['L', 'C', 'R'], [
    [[2, 2], [3, 7], [9, 1]],
    [[8, 8], [1, 6], [3, 1]],
    [[3, 5], [7, 8], [0, 1]],
  ]),
  nothing: makeGame(['U', 'M', 'D'], ['L', 'C', 'R'], [
    [[8, 3], [5, 1], [6, 9]],
    [[0, 7], [7, 9], [3, 6]],
    [[9, 7], [2, 8], [7, 0]],
  ]),
}

// Panel A: the classic two-by-two games, cells in the order top-left,
// top-right, bottom-left, bottom-right. The strategy names are in the panel.
export const CLASSICS = {
  pd: [[3, 3], [0, 5], [5, 0], [1, 1]],
  stag: [[4, 4], [0, 3], [3, 0], [2, 2]],
  chicken: [[3, 3], [1, 4], [4, 1], [0, 0]],
  battle: [[2, 1], [0, 0], [0, 0], [1, 2]],
  pennies: [[1, 0], [0, 1], [0, 1], [1, 0]],
  coordination: [[1, 1], [0, 0], [0, 0], [1, 1]],
}

export const twoByTwo = (cells, rows = ['A', 'B'], cols = ['A', 'B']) =>
  makeGame(rows, cols, [
    [cells[0], cells[1]],
    [cells[2], cells[3]],
  ])

// The first table of the lecture: D dominates U, then R beats L.
export const LECTURE_GAME = makeGame(['U', 'D'], ['L', 'R'], [
  [[2, 1], [0, 0]],
  [[3, 0], [1, 2]],
])

// Exercise 1.
export const EXERCISE_1 = makeGame(['U', 'M', 'D'], ['L', 'C', 'R'], [
  [[3, 2], [1, 4], [6, 1]],
  [[5, 3], [3, 5], [2, 2]],
  [[4, 6], [2, 1], [1, 4]],
])

// Everything Panel A shows about a game.
export function describe(g) {
  const out = eliminate(g)
  return {
    marks: bestResponses(g),
    dominated: dominated(g),
    elimination: out,
    solved: out.rows.length === 1 && out.cols.length === 1,
    stable: stableCells(g),
    unbeaten: unbeatenCells(g),
    dominantRow: dominantStrategy(g, 'row'),
    dominantCol: dominantStrategy(g, 'col'),
  }
}

// ------------------------------------------------- The 576 ordinal games

function permutations(list) {
  if (list.length <= 1) return [list]
  return list.flatMap((x, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p]))
}

// The 24 ways one player can rank the four cells (4 = best). A table is a
// pair of rankings, as two flat lists in the order top-left, top-right,
// bottom-left, bottom-right.
export const RANKINGS = permutations([1, 2, 3, 4])

const flatGame = (a, b) => twoByTwo([0, 1, 2, 3].map((c) => [a[c], b[c]]))

// Renaming the strategies and swapping the players, as index maps on the
// four cells.
const SWAP_ROWS = [2, 3, 0, 1]
const SWAP_COLS = [1, 0, 3, 2]
const TRANSPOSE = [0, 2, 1, 3]
const apply = (v, map) => map.map((c) => v[c])

// The tables obtained from (a, b) by renaming strategies (4 of them) and, if
// `players`, also by swapping the two players (8).
export function relabelings(a, b, players = false) {
  const out = []
  for (const r of [false, true]) {
    for (const c of [false, true]) {
      let x = a
      let y = b
      if (r) [x, y] = [apply(x, SWAP_ROWS), apply(y, SWAP_ROWS)]
      if (c) [x, y] = [apply(x, SWAP_COLS), apply(y, SWAP_COLS)]
      out.push([x, y])
      if (players) out.push([apply(y, TRANSPOSE), apply(x, TRANSPOSE)])
    }
  }
  return out
}

const keyOf = (a, b) => a.join('') + b.join('')
const canonical = (a, b, players) => relabelings(a, b, players).map(([x, y]) => keyOf(x, y)).sort()[0]

// A table is symmetric when the column player's payoffs are the row player's
// with the roles exchanged: b[i][j] = a[j][i].
const isSymmetric = (a, b) => keyOf(apply(a, TRANSPOSE), []) === keyOf(b, [])

export function surveyOrdinal() {
  const s = {
    total: 0,
    stable: [0, 0, 0],
    dominant: { both: 0, one: 0, neither: 0 },
    solved: 0,
    pdLike: 0,
    renamed: { total: 0, stable: [0, 0, 0], pdLike: 0, both: 0, solved: 0 },
    swapped: { total: 0, stable: [0, 0, 0], pdLike: 0, symmetric: 0 },
    symmetricTables: 0,
  }
  const seen4 = new Set()
  const seen8 = new Set()
  const symmetricClasses = new Set()
  for (const a of RANKINGS) {
    for (const b of RANKINGS) {
      const g = flatGame(a, b)
      const d = describe(g)
      const nStable = d.stable.length
      const both = d.dominantRow >= 0 && d.dominantCol >= 0
      const pd = both && beatenForBoth(g, d.dominantRow, d.dominantCol)
      s.total++
      s.stable[nStable]++
      if (both) s.dominant.both++
      else if (d.dominantRow >= 0 || d.dominantCol >= 0) s.dominant.one++
      else s.dominant.neither++
      if (d.solved) s.solved++
      if (pd) s.pdLike++
      const k4 = canonical(a, b, false)
      if (!seen4.has(k4)) {
        seen4.add(k4)
        s.renamed.total++
        s.renamed.stable[nStable]++
        if (pd) s.renamed.pdLike++
        if (both) s.renamed.both++
        if (d.solved) s.renamed.solved++
      }
      const k8 = canonical(a, b, true)
      if (!seen8.has(k8)) {
        seen8.add(k8)
        s.swapped.total++
        s.swapped.stable[nStable]++
        if (pd) s.swapped.pdLike++
      }
      if (isSymmetric(a, b)) {
        s.symmetricTables++
        symmetricClasses.add(k8)
      }
    }
  }
  s.swapped.symmetric = symmetricClasses.size
  return s
}

// --------------------------------------- The map of symmetric 2 × 2 games

// Both players choose C or D. With R = 1 for (C, C) and P = 0 for (D, D), a
// player who chooses D against C gets T and one who chooses C against D gets S.
export const tsGame = (T, S) =>
  makeGame(['C', 'D'], ['C', 'D'], [
    [[1, 1], [S, T]],
    [[T, S], [0, 0]],
  ])

const EPS = 1e-9

// Where (T, S) falls: 'pd' (T > 1, S < 0), 'stag' (T < 1, S < 0), 'chicken'
// (T > 1, S > 0) or 'harmony' (T < 1, S > 0); `border` when T = 1 or S = 0.
export function classifyTS(T, S) {
  const onT = Math.abs(T - 1) < EPS
  const onS = Math.abs(S) < EPS
  const g = tsGame(T, S)
  const dom = dominantStrategy(g, 'row')
  return {
    border: onT || onS,
    region: onT || onS ? null : T > 1 ? (S < 0 ? 'pd' : 'chicken') : S < 0 ? 'stag' : 'harmony',
    dominant: dom < 0 ? null : g.rows[dom],
    stable: stableCells(g).map(([i, j]) => [g.rows[i], g.cols[j]]),
    game: g,
  }
}
