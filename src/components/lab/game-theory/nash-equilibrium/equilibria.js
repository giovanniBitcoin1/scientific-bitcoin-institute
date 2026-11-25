import { mulberry32 } from '../../rng.js'
import { range, makeGame, stableCells, eliminate } from '../what-is-a-game/games.js'
import { randomGame, seedOf, SIZES, SURVEY_SEED } from '../what-is-a-game/randomgames.js'

// Nash equilibria in pure strategies of a two-player table, and the walk in
// which the two players take turns to best-respond. Games are the
// { rows, cols, a, b } objects of module 01 (what-is-a-game/games.js), whose
// stable cells are exactly these equilibria. Pure logic, shared by Panel A and
// scripts/lab/check-game-theory-02.mjs.

export { SIZES, SURVEY_SEED }
export const DEFAULT_GAMES = 2000
export const TABLE_SEED = 6100 // the games drawn by "New game"
export const DEFAULT_TABLE_SIZE = 3

// A cell from which neither player gains by changing alone.
export const equilibria = (g) => stableCells(g)

// Where the row player goes from (i, j): nowhere if i is already a best
// response to column j, otherwise to the first best response.
export function rowReply(g, i, j) {
  let best = i
  for (const k of range(g.a.length)) if (g.a[k][j] > g.a[best][j]) best = k
  return best
}

export function colReply(g, i, j) {
  let best = j
  for (const l of range(g.a[0].length)) if (g.b[i][l] > g.b[i][best]) best = l
  return best
}

// What each player would do at (i, j) if the other stayed put.
export function movesAt(g, i, j) {
  return { row: rowReply(g, i, j), col: colReply(g, i, j) }
}

// The walk from (i, j): the row player best-responds, then the column player,
// and so on. It ends at an equilibrium when neither wants to move, or in a
// cycle when a cell comes back with the same player to move.
// Returns { path, moves, end, cell, cycle }: the cells visited in order, who
// moved at each step, 'equilibrium' or 'cycle', the last cell, and for a
// cycle the cells that repeat for ever.
export function walk(g, i, j) {
  const path = [[i, j]]
  const moves = []
  const seen = new Map()
  let turn = 'row'
  let still = 0
  for (;;) {
    const key = `${i},${j},${turn}`
    if (seen.has(key)) return { path, moves, end: 'cycle', cell: [i, j], cycle: path.slice(seen.get(key), path.length - 1) }
    seen.set(key, path.length - 1)
    if (turn === 'row') {
      const k = rowReply(g, i, j)
      if (k !== i) {
        i = k
        still = 0
        path.push([i, j])
        moves.push('row')
      } else still++
    } else {
      const l = colReply(g, i, j)
      if (l !== j) {
        j = l
        still = 0
        path.push([i, j])
        moves.push('col')
      } else still++
    }
    if (still === 2) return { path, moves, end: 'equilibrium', cell: [i, j], cycle: null }
    turn = turn === 'row' ? 'col' : 'row'
  }
}

// ----------------------------------------------- Tables with whole payoffs

// m different whole numbers from 0 to 9, in random order.
function distinct(random, m) {
  const pool = range(10)
  for (let k = 0; k < m; k++) {
    const pick = k + Math.floor(random() * (10 - k))
    ;[pool[k], pool[pick]] = [pool[pick], pool[k]]
  }
  return pool.slice(0, m)
}

// A random m × m table (m up to 5) with whole payoffs 0 to 9 and no ties where
// they would matter: the row player's payoffs differ within every column, and
// the column player's within every row. Rows are numbered, columns lettered.
export function randomTable(random, m) {
  const a = range(m).map(() => new Array(m))
  const b = []
  for (let j = 0; j < m; j++) {
    const v = distinct(random, m)
    for (let i = 0; i < m; i++) a[i][j] = v[i]
  }
  for (let i = 0; i < m; i++) b.push(distinct(random, m))
  return { rows: range(m).map((i) => String(i + 1)), cols: range(m).map((j) => String.fromCharCode(65 + j)), a, b }
}

// Game number `index` of size m drawn by "New game".
export const tableOf = (m, index = 0, seed = TABLE_SEED) => randomTable(mulberry32(seed + 1000 * m + index), m)

// Everything Panel A shows about a table.
export function describeTable(g) {
  const left = eliminate(g)
  return { equilibria: equilibria(g), left, solved: left.rows.length === 1 && left.cols.length === 1 }
}

// Exercise 1.
export const EXERCISE_1 = makeGame(['U', 'M', 'D'], ['L', 'C', 'R'], [
  [[0, 7], [8, 8], [8, 3]],
  [[7, 4], [3, 2], [3, 1]],
  [[2, 0], [9, 2], [9, 8]],
])

// ------------------------------------------------------ Random-game survey

// One game with payoffs uniform on 0–1 (no ties): the number of equilibria and
// the number of starting cells from which the walk ends at one. Since the row
// player moves first, the walk from (i, j) is at (rb[j], j) after one step
// whatever i was; after that the column moves by j → cb[rb[j]]. It ends at an
// equilibrium exactly when that map reaches a fixed point.
export function analyzeWalks(g) {
  const m = g.a.length
  const rb = new Array(m)
  const cb = new Array(m)
  for (let j = 0; j < m; j++) {
    let best = 0
    for (let i = 1; i < m; i++) if (g.a[i][j] > g.a[best][j]) best = i
    rb[j] = best
  }
  for (let i = 0; i < m; i++) {
    let best = 0
    for (let j = 1; j < m; j++) if (g.b[i][j] > g.b[i][best]) best = j
    cb[i] = best
  }
  let count = 0
  for (let j = 0; j < m; j++) if (cb[rb[j]] === j) count++
  let columns = 0
  for (let j0 = 0; j0 < m; j0++) {
    let j = j0
    // m steps are enough to reach a fixed point if the walk ever does.
    for (let s = 0; s < m; s++) j = cb[rb[j]]
    if (cb[rb[j]] === j) columns++
  }
  return { equilibria: count, reach: columns * m, cells: m * m }
}

function tally() {
  return { games: 0, total: 0, none: 0, one: 0, two: 0, more: 0, reach: 0, having: 0, reachHaving: 0 }
}

function add(t, r) {
  t.games++
  t.total += r.equilibria
  if (r.equilibria === 0) t.none++
  else if (r.equilibria === 1) t.one++
  else if (r.equilibria === 2) t.two++
  else t.more++
  t.reach += r.reach / r.cells
  if (r.equilibria > 0) {
    t.having++
    t.reachHaving += r.reach / r.cells
  }
}

export function shares(t) {
  const n = t.games || 1
  return {
    games: t.games,
    mean: t.total / n,
    none: t.none / n,
    one: t.one / n,
    two: t.two / n,
    more: t.more / n,
    walks: t.reach / n,
    walksHaving: t.having ? t.reachHaving / t.having : null,
  }
}

// The survey as a job for useExperiment. The games are those of module 01's
// Panel C (same generator, same seeds), so the two pages count the same games.
// snapshot() → { [m]: shares }.
export function surveyJob({ sizes = SIZES, games = DEFAULT_GAMES, seed = SURVEY_SEED }) {
  const tallies = Object.fromEntries(sizes.map((m) => [m, tally()]))
  const total = sizes.length * games
  let done = 0
  function* iter() {
    for (const m of sizes) {
      const random = mulberry32(seedOf(m, seed))
      for (let k = 0; k < games; k++) {
        add(tallies[m], analyzeWalks(randomGame(random, m)))
        done++
        if (done % 20 === 0) yield done / total
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () => Object.fromEntries(sizes.map((m) => [m, shares(tallies[m])])),
  }
}

export function survey(cfg) {
  const job = surveyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}
