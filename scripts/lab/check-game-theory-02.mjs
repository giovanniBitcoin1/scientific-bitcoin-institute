// Self-checks for Game Theory Lab module 02, "Nash equilibrium". They run the
// same code as the page (equilibria.js, conventions.js, cournot.js,
// contest.js, and module 01's games.js and randomgames.js) and compare it with
// exact values, with independent brute-force computations and with the
// numbers the texts quote.
//
//   node scripts/lab/check-game-theory-02.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32, randInt } from '../../src/components/lab/rng.js'
import { makeGame, range, eliminate, CLASSICS, twoByTwo } from '../../src/components/lab/game-theory/what-is-a-game/games.js'
import { randomGame, survey as survey01 } from '../../src/components/lab/game-theory/what-is-a-game/randomgames.js'
import {
  SIZES, DEFAULT_GAMES, DEFAULT_TABLE_SIZE, equilibria, walk, movesAt, randomTable, tableOf, describeTable, EXERCISE_1, analyzeWalks, survey,
} from '../../src/components/lab/game-theory/nash-equilibrium/equilibria.js'
import {
  STAG, DEFAULTS, X0_VALUES, RUN_SEED, stagPayoff, harePayoff, qStar, riskDominant, clampPayoffs, stagAfter, tippingPoint, runOnce, manyRuns, scan, chanceAt,
} from '../../src/components/lab/game-theory/nash-equilibrium/conventions.js'
import * as cournot from '../../src/components/lab/game-theory/nash-equilibrium/cournot.js'
import {
  PRIZE, MINERS, START, ROUNDS, equalCosts, oneCheaper, equilibrium as contestEq, entryCost, bestResponse as contestBR, roundInTurn, roundAtOnce, adjust, roundsToSettle, atOnceFactor, percent,
} from '../../src/components/lab/game-theory/nash-equilibrium/contest.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol) => Math.abs(a - b) <= tol
const f1 = (x) => x.toFixed(1)
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const it = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // numbers written the Italian way
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const cellName = (g, [i, j]) => `(${g.rows[i]}, ${g.cols[j]})`
const cells = (g, list) => list.map((c) => cellName(g, c)).join(' ')
const sum = (list) => list.reduce((x, y) => x + y, 0)

// ------------------------------------------------- Independent brute force

// Equilibria straight from the definition.
function bruteEquilibria(g) {
  const out = []
  for (const i of range(g.a.length)) {
    for (const j of range(g.a[0].length)) {
      const rowOk = range(g.a.length).every((k) => g.a[k][j] <= g.a[i][j])
      const colOk = range(g.a[0].length).every((l) => g.b[i][l] <= g.b[i][j])
      if (rowOk && colOk) out.push([i, j])
    }
  }
  return out
}

// The walk written again, on its own: positions and whose turn it is.
function bruteWalkEnds(g, i, j) {
  const arg = (list) => list.indexOf(Math.max(...list))
  const seen = new Set()
  let turn = 0
  let quiet = 0
  for (let n = 0; n < 10000; n++) {
    const key = `${i}|${j}|${turn}`
    if (seen.has(key)) return null
    seen.add(key)
    if (turn === 0) {
      const col = g.a.map((r) => r[j])
      if (col[i] < Math.max(...col)) {
        i = arg(col)
        quiet = 0
      } else quiet++
    } else if (g.b[i][j] < Math.max(...g.b[i])) {
      j = arg(g.b[i])
      quiet = 0
    } else quiet++
    if (quiet === 2) return [i, j]
    turn = 1 - turn
  }
  return null
}

// ---------------------------------------------------------------- Panel A

console.log('— Equilibria and walks')
{
  const random = mulberry32(21)
  let eqOk = true
  let keepOk = true
  let solvedOk = true
  let walkOk = true
  let endOk = true
  let games = 0
  let solved = 0
  for (let n = 0; n < 2000; n++) {
    const m = 2 + randInt(random, 4)
    const k = 2 + randInt(random, 4)
    // Mixed sizes; one game in two has whole payoffs 0–5 (ties are common), the other payoffs on 0–1.
    const g = n % 2
      ? makeGame(range(m).map(String), range(k).map(String), range(m).map(() => range(k).map(() => [randInt(random, 6), randInt(random, 6)])))
      : makeGame(range(m).map(String), range(k).map(String), range(m).map(() => range(k).map(() => [random(), random()])))
    const eq = equilibria(g)
    const brute = bruteEquilibria(g)
    if (!same(eq, brute)) eqOk = false
    const left = eliminate(g)
    if (!brute.every(([i, j]) => left.rows.includes(i) && left.cols.includes(j))) keepOk = false
    if (left.rows.length === 1 && left.cols.length === 1) {
      solved++
      if (!(brute.length === 1 && brute[0][0] === left.rows[0] && brute[0][1] === left.cols[0])) solvedOk = false
    }
    for (const i of range(m)) {
      for (const j of range(k)) {
        const w = walk(g, i, j)
        const b = bruteWalkEnds(g, i, j)
        if ((w.end === 'equilibrium') !== (b !== null)) walkOk = false
        if (w.end === 'equilibrium' && !(same(w.cell, b) && brute.some((c) => same(c, w.cell)))) endOk = false
        if (w.end === 'cycle' && !(w.cycle.length >= 4 && w.cycle.every((c) => !brute.some((e) => same(e, c))))) endOk = false
        if (!same(w.path[0], [i, j]) || w.moves.length !== w.path.length - 1) endOk = false
      }
    }
    games++
  }
  check(`${games} random games of mixed sizes: equilibria equal a brute-force search`, eqOk)
  check(`${games} random games: every equilibrium survives iterated elimination`, keepOk)
  check(`${games} random games: a game solved by elimination has exactly one equilibrium, the cell that is left (${solved} such games)`, solvedOk && solved > 100)
  check(`${games} random games, every starting cell: the walk ends as an independent version says (equilibrium or cycle)`, walkOk)
  check('a walk that stops, stops at an equilibrium; a cycle has at least four cells and none is an equilibrium', endOk)
}

console.log('— Panel A: tables and presets')
{
  const names = { pd: 1, stag: 2, chicken: 2, battle: 2, pennies: 0, coordination: 2 }
  check('the six classics of module 01 have 1, 2, 2, 2, 0 and 2 equilibria', Object.entries(names).every(([id, n]) => equilibria(twoByTwo(CLASSICS[id])).length === n))
  const mp = twoByTwo(CLASSICS.pennies)
  const w = walk(mp, 0, 0)
  check('matching pennies: the walk from any cell is a cycle through all four cells', range(2).every((i) => range(2).every((j) => walk(mp, i, j).end === 'cycle' && walk(mp, i, j).cycle.length === 4)), `from the first cell: ${w.path.map((c) => c.join('')).join(' → ')}`)
  const pd = twoByTwo(CLASSICS.pd)
  check("Prisoner's Dilemma: every walk ends at (D, D) in at most two moves", range(2).every((i) => range(2).every((j) => same(walk(pd, i, j).cell, [1, 1]) && walk(pd, i, j).moves.length <= 2)))
  const sh = twoByTwo(CLASSICS.stag)
  check('stag hunt: walks from the first column end at (Stag, Stag), from the second at (Hare, Hare)', range(2).every((i) => same(walk(sh, i, 0).cell, [0, 0]) && same(walk(sh, i, 1).cell, [1, 1])))
  let tieFree = true
  let whole = true
  for (const m of [2, 3, 4, 5]) {
    for (let index = 0; index < 300; index++) {
      const g = tableOf(m, index)
      for (const j of range(m)) if (new Set(g.a.map((r) => r[j])).size !== m) tieFree = false
      for (const i of range(m)) if (new Set(g.b[i]).size !== m) tieFree = false
      if (![...g.a.flat(), ...g.b.flat()].every((v) => Number.isInteger(v) && v >= 0 && v <= 9)) whole = false
    }
  }
  check('"New game", 300 tables of each size 2 to 5: whole payoffs 0 to 9, no two equal row payoffs in a column, nor column payoffs in a row', tieFree && whole)
  const first = tableOf(DEFAULT_TABLE_SIZE, 0)
  const d = describeTable(first)
  info(`the table on the page (${DEFAULT_TABLE_SIZE} × ${DEFAULT_TABLE_SIZE}): equilibria ${cells(first, d.equilibria) || 'none'}; elimination leaves ${d.left.rows.length} × ${d.left.cols.length}; rows ${JSON.stringify(first.a)}, ${JSON.stringify(first.b)}`)
  const counts = [2, 3, 4, 5].map((m) => {
    const c = [0, 0, 0, 0]
    for (let index = 0; index < 300; index++) c[Math.min(3, equilibria(tableOf(m, index)).length)]++
    return `m = ${m}: ${c.join('/')}`
  })
  info(`300 "New game" tables per size, with 0/1/2/3+ equilibria: ${counts.join('; ')}`)
  check('movesAt: at an equilibrium nobody moves; elsewhere somebody does', [2, 3, 4, 5].every((m) => range(50).every((index) => {
    const g = tableOf(m, index)
    const eq = equilibria(g)
    return range(m).every((i) => range(m).every((j) => {
      const mv = movesAt(g, i, j)
      return (mv.row === i && mv.col === j) === eq.some((c) => same(c, [i, j]))
    }))
  })))
}

console.log('— Random games, 20,000 per size')
const big = survey({ games: 20000 })
{
  const EXPECTED = {
    none: [0.124, 0.217, 0.261, 0.288, 0.294, 0.313, 0.312],
    one: [0.749, 0.577, 0.502, 0.468, 0.456, 0.43, 0.428],
    two: [0.127, 0.196, 0.215, 0.212, 0.209, 0.208, 0.206],
    more: [0, 0.009, 0.022, 0.032, 0.041, 0.049, 0.053],
    walks: [0.876, 0.766, 0.692, 0.633, 0.598, 0.555, 0.529],
    walksHaving: [1.0, 0.979, 0.937, 0.89, 0.848, 0.808, 0.769],
  }
  const means = SIZES.map((m) => big[m].mean)
  check('mean number of equilibria within 0.02 of 1 at every size (exactly 1 in theory: m² cells, each one with probability 1/m²)', means.every((v) => close(v, 1, 0.02)), means.map(f3).join(', '))
  for (const [field, list] of Object.entries(EXPECTED)) {
    const worst = Math.max(...SIZES.map((m, n) => Math.abs(big[m][field] - list[n])))
    check(`${field}: within 0.015 of the expected values for m = 2 to 8`, worst <= 0.015, `${SIZES.map((m) => f3(big[m][field])).join(', ')}; largest gap ${f3(worst)}`)
  }
  check('the four shares sum to 1 at every size', SIZES.every((m) => close(big[m].none + big[m].one + big[m].two + big[m].more, 1, 1e-9)))
  check('m = 2: a walk ends at an equilibrium exactly when the game has one (walks = 1 − none; 1 among games that have one)', close(big[2].walks, 1 - big[2].none, 1e-12) && big[2].walksHaving === 1, `${big[2].walks} and ${1 - big[2].none}`)
  // The games are module 01's: the shares of stable cells must be the same numbers.
  const old = survey01({ sizes: SIZES, games: 20000 })
  check('same games as module 01: none, one and two-or-more are the numbers of check-game-theory-01, exactly', SIZES.every((m) => big[m].none === old[m].none && big[m].one === old[m].one && close(big[m].two + big[m].more, old[m].more, 1e-12)), `m = 8: ${f3(big[8].none)}, ${f3(big[8].one)}, ${f3(big[8].two + big[8].more)}`)
  // The shortcut of the survey against the walk itself.
  const random = mulberry32(31)
  let fastOk = true
  for (let n = 0; n < 1500; n++) {
    const m = 2 + (n % 7)
    const g = randomGame(random, m)
    const fast = analyzeWalks(g)
    let reach = 0
    for (const i of range(m)) for (const j of range(m)) if (walk(g, i, j).end === 'equilibrium') reach++
    if (fast.equilibria !== bruteEquilibria(g).length || fast.reach !== reach || fast.cells !== m * m) fastOk = false
  }
  check('1,500 random games of sizes 2 to 8: the survey counts equilibria and walks like the brute force and the walk of the panel', fastOk)
  check('a smaller survey is the beginning of a larger one: 2,000 of size 3', same(survey({ sizes: [3], games: 2000 })[3], survey({ sizes: [3, 4], games: 2000 })[3]) && DEFAULT_GAMES === 2000)
  for (const m of [2, 8]) {
    const runs = range(10).map((s) => survey({ sizes: [m], games: 20000, seed: 8037 + 37 * s })[m])
    const span = (f) => `${f3(Math.min(...runs.map((r) => r[f])))}–${f3(Math.max(...runs.map((r) => r[f])))}`
    info(`m = ${m}, ten other seeds: mean ${span('mean')}, none ${span('none')}, one ${span('one')}, two ${span('two')}, three or more ${span('more')}, walks ${span('walks')}, among games with one ${span('walksHaving')}`)
  }
}

// ---------------------------------------------------------------- Stag hunt

console.log('— Stag hunt and Figure F1')
{
  const q = (a) => qStar({ ...STAG, a })
  check('q* = 2/3, 1/2, 2/5 and 2/7 for a = 4, 5, 6 and 8 (b = 0, c = 3, d = 2)', close(q(4), 2 / 3, 1e-12) && close(q(5), 1 / 2, 1e-12) && close(q(6), 2 / 5, 1e-12) && close(q(8), 2 / 7, 1e-12))
  check('at q* the two expected payoffs are equal; above it stag pays more, below it hare', [4, 5, 6, 8].every((a) => {
    const p = { ...STAG, a }
    return close(stagPayoff(p, q(a)), harePayoff(p, q(a)), 1e-12) && stagPayoff(p, q(a) + 0.01) > harePayoff(p, q(a) + 0.01) && stagPayoff(p, q(a) - 0.01) < harePayoff(p, q(a) - 0.01)
  }))
  const steps = range(10).map((n) => 3.5 + n * 0.5)
  check('stag is risk dominant exactly when a > 5 (a from 3.5 to 8 in steps of 0.5); neither at a = 5', steps.every((a) => riskDominant({ ...STAG, a }) === (a > 5 ? 'stag' : a < 5 ? 'hare' : 'neither')))
  let ordered = true
  const random = mulberry32(41)
  let p = { ...STAG }
  for (let n = 0; n < 3000; n++) {
    const key = ['a', 'c', 'd'][randInt(random, 3)]
    const value = key === 'a' ? 3.5 + 0.5 * randInt(random, 10) : 0.5 + 0.5 * randInt(random, 15)
    p = clampPayoffs(p, key, value)
    if (!(p.a > p.c && p.c >= p.d && p.d > 0 && p.b === 0)) ordered = false
  }
  check('3,000 random moves of the three sliders: always a > c ≥ d > 0, b = 0', ordered)
}

console.log('— Conventions: the tipping point of the sampled rule')
const tip = (a, k) => tippingPoint(qStar({ ...STAG, a }), k)
{
  const EXPECTED = { 4: [0.869, 0.732, 0.734, 0.704], 6: [0.347, 0.361, 0.372, 0.382], 5: [0.5, 0.5, 0.5, 0.5] }
  for (const [a, list] of Object.entries(EXPECTED)) {
    const mine = [5, 10, 20, 50].map((k) => tip(Number(a), k))
    check(`a = ${a}, k = 5, 10, 20, 50: tipping point ${list.join(', ')}`, mine.every((v, n) => close(v, list[n], 0.0006)), mine.map((v) => v.toFixed(4)).join(', '))
  }
  check('the tipping point is a rest point: x = P(count > q* k) + x P(count = q* k)', [[4, 10], [6, 10], [4, 50], [6, 5]].every(([a, k]) => close(stagAfter(tip(a, k), qStar({ ...STAG, a }), k), tip(a, k), 1e-9)))
  check('below it the share falls on average, above it it rises (default payoffs, k = 10)', stagAfter(0.7, 2 / 3, 10) < 0.7 && stagAfter(0.76, 2 / 3, 10) > 0.76)
  check('with q* = 2/3 a sample of ten needs 7 stag hunters; with q* = 0.4 exactly 4 of 10 is a tie', Math.ceil((2 / 3) * 10) === 7 && Math.abs(0.4 * 10 - 4) < 1e-9)
  info(`larger samples, default payoffs: k = 100 ${f3(tip(4, 100))}, k = 200 ${f3(tip(4, 200))} (q* = 0.667)`)
}

console.log('— Conventions: the population, N = 200, k = 10, 400 runs per point')
const base = { payoffs: STAG, N: 200, k: 10 }
{
  const LISTS = [
    ['default payoffs', base, [[0.65, 0.005], [0.7, 0.155], [0.75, 0.775], [0.8, 1.0]], 0.75],
    ['a = 6', { ...base, payoffs: { ...STAG, a: 6 } }, [[0.3, 0], [0.35, 0.225], [0.4, 0.953], [0.45, 1.0]], 0.35],
    ['a = 5', { ...base, payoffs: { ...STAG, a: 5 } }, [[0.4, 0], [0.5, 0.52], [0.6, 1.0]], 0.5],
    ['k = 50, default payoffs', { ...base, k: 50 }, [[0.7, 0.54], [0.75, 1.0]], 0.7],
  ]
  for (const [name, cfg, list, near] of LISTS) {
    const mine = list.map(([x0]) => chanceAt(cfg, x0, 400))
    const first = mine[0].stag
    const last = mine[mine.length - 1].stag
    const n = list.findIndex(([x0]) => x0 === near)
    // With k = 50 the list starts at the tipping point itself: only its last value and the nearest are checked.
    const firstOk = name.startsWith('k = 50') || first < 0.05
    check(`${name}: ${firstOk && name.startsWith('k = 50') ? '' : 'below 0.05 at the first value, '}above 0.95 at the last, within 0.12 of ${list[n][1]} at x0 = ${near}`, firstOk && last > 0.95 && close(mine[n].stag, list[n][1], 0.12), list.map(([x0, e], i) => `${x0}: ${f3(mine[i].stag)} (expected ${e}; ${f1(mine[i].sweeps)} sweeps)`).join('; '))
  }
  const all = [0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9].map((x0) => chanceAt(base, x0, 400).sweeps)
  check('runs settle in 3 to 8 sweeps on average (default payoffs, x0 from 0.5 to 0.9)', all.every((s) => s >= 3 && s <= 8), all.map(f1).join(', '))
  const r = runOnce({})
  check('one run is the same every time (fixed seed) and every run ends with everyone doing the same', same(runOnce({}).series, r.series) && r.end !== 'open' && RUN_SEED === 6200 && range(40).every((s) => runOnce({ x0: 0.05 * (s % 21) }, 900 + s).end !== 'open'))
  check('a population that starts with everyone, or nobody, hunting the stag stays there', runOnce({ x0: 1 }).end === 'stag' && runOnce({ x0: 1 }).sweeps === 0 && runOnce({ x0: 0 }).end === 'hare')
  for (const [name, cfg, x0] of [['default, x0 = 0.70', base, 0.7], ['default, x0 = 0.75', base, 0.75], ['a = 6, x0 = 0.35', { ...base, payoffs: { ...STAG, a: 6 } }, 0.35], ['a = 5, x0 = 0.5', { ...base, payoffs: { ...STAG, a: 5 } }, 0.5], ['k = 50, x0 = 0.70', { ...base, k: 50 }, 0.7]]) {
    const v = range(10).map((s) => manyRuns({ ...cfg, x0 }, 400, 777 + 13 * s).stag)
    info(`${name}, ten other seeds: ${f3(Math.min(...v))}–${f3(Math.max(...v))}`)
  }
}

// ------------------------------------------------------------------ Cournot

console.log('— Cournot and Figure F2')
{
  const e = cournot.equilibrium(10, 1, 1)
  check('a = 10, c = 1: 3 and 3, price 4, profit 9 each', same([e.q1, e.q2, e.price, e.profit1, e.profit2], [3, 3, 4, 9, 9]))
  const prices = [1, 2, 3, 5, 10, 100].map((n) => cournot.symmetric(10, 1, n).price)
  check('n = 1, 2, 3, 5, 10, 100 firms: price 5.5, 4, 3.25, 2.5, 1.818, 1.089', same(prices.map(f3), ['5.500', '4.000', '3.250', '2.500', '1.818', '1.089']), prices.map(f3).join(', '))
  check('n firms: each quantity is a best response to the others', [1, 2, 3, 5, 10, 100].every((n) => close(cournot.bestResponse((n - 1) * cournot.symmetric(10, 1, n).q, 10, 1), cournot.symmetric(10, 1, n).q, 1e-12)))
  const u = cournot.equilibrium(10, 1, 2.5)
  check('costs 1 and 2.5: 3.5 and 2, price 4.5', same([u.q1, u.q2, u.price], [3.5, 2, 4.5]))
  let fixed = true
  for (let c1 = 0; c1 <= 4; c1 += 0.5) for (let c2 = 0; c2 <= 4; c2 += 0.5) {
    const x = cournot.equilibrium(10, c1, c2)
    if (!close(cournot.bestResponse(x.q2, 10, c1), x.q1, 1e-12) || !close(cournot.bestResponse(x.q1, 10, c2), x.q2, 1e-12) || !(x.q1 > 0 && x.q2 > 0)) fixed = false
  }
  check('every pair of costs of the sliders (0 to 4, step 0.5): both produce, and the crossing point is a best response for each', fixed)
  const path = cournot.adjust(10, 1, 1, 0, 0)
  const seq = path.slice(1, 7).map((p, n) => (n % 2 === 0 ? p[0] : p[1]))
  check('taking turns from (0, 0): 4.5, 2.25, 3.375, 2.8125, 3.094, 2.953, …, converging to 3', same(seq.map((v) => Number(v.toFixed(4))), [4.5, 2.25, 3.375, 2.8125, 3.0938, 2.9531]) && close(path[path.length - 1][0], 3, 0.002) && close(path[path.length - 1][1], 3, 0.002), `${path.length - 1} moves; ${seq.join(', ')}`)
  check('each move of the adjustment halves the distance of the mover\'s rival from 3', range(8).every((n) => close(Math.abs(seq[n + 1] ?? 3) >= 0 ? Math.abs((path[n + 2][(n + 1) % 2] - 3) / (path[n + 1][n % 2] - 3)) : 0.5, 0.5, 1e-9)))
  const k = cournot.cartel(10, 1)
  const dev = cournot.bestResponse(k.q2, 10, 1)
  const after = cournot.describe(10, 1, 1, dev, k.q2)
  check('exercise 3: cartel 2.25 each, price 5.5, profit 10.125; best response 3.375, price 4.375, profits 11.39 and 7.59', same([k.q1, k.price, k.profit1, dev, after.price], [2.25, 5.5, 10.125, 3.375, 4.375]) && f2(after.profit1) === '11.39' && f2(after.profit2) === '7.59')
}

// ------------------------------------------------------------------ Contest

console.log('— Contest: equal costs')
const NS = [2, 3, 4, 5, 10, 20]
const settleTurn = Object.fromEntries(NS.map((n) => [n, roundsToSettle(equalCosts(n), 'turn')]))
{
  const totals = NS.map((n) => contestEq(equalCosts(n)).total)
  const profits = NS.map((n) => contestEq(equalCosts(n)).profits[0])
  check('V = 100, n = 2, 3, 4, 5, 10, 20: total effort 50, 66.67, 75, 80, 90, 95; profit each 25, 11.11, 6.25, 4, 1, 0.25', same(totals.map(f2), ['50.00', '66.67', '75.00', '80.00', '90.00', '95.00']) && same(profits.map(f2), ['25.00', '11.11', '6.25', '4.00', '1.00', '0.25']))
  check('the closed form is V (n − 1)/n² each, and the share spent is (n − 1)/n', NS.every((n) => close(contestEq(equalCosts(n)).efforts[0], (PRIZE * (n - 1)) / (n * n), 1e-9) && close(contestEq(equalCosts(n)).spentShare, (n - 1) / n, 1e-12)))
  check('"One at a time" settles for every n (within 1e-6 of the equilibrium total, from 10% above)', NS.every((n) => settleTurn[n] !== null), NS.map((n) => `n = ${n}: ${settleTurn[n]} rounds`).join(', '))
  // From a random start, as in the prompt.
  const fromRandom = NS.map((n) => {
    const random = mulberry32(51 + n)
    let x = range(n).map(() => 50 * random())
    const eq = contestEq(equalCosts(n))
    for (let r = 1; r <= 5000; r++) {
      x = roundInTurn(x, equalCosts(n))
      if (Math.max(...x.map((v) => Math.abs(v - eq.efforts[0]))) < 1e-6) return r
    }
    return null
  })
  info(`"One at a time" from a random start, rounds until every effort is within 1e-6: ${NS.map((n, i) => `n = ${n}: ${fromRandom[i]}`).join(', ')}  (the prompt: 4, 10, 14, 19, 47, 163)`)
  const gap = (n, r) => {
    const a = adjust(equalCosts(n), 'once', Math.max(r, 1))
    return (a.totals[r] - a.equilibrium.total) / a.equilibrium.total
  }
  check('"All at once", n = 2 and 3: the gap shrinks (below 0.001 after 10 rounds)', Math.abs(gap(2, 10)) < 0.001 && Math.abs(gap(3, 10)) < 0.001, `n = 2: ${[1, 2, 5, 10].map((r) => gap(2, r).toFixed(4)).join(', ')}; n = 3: ${[1, 2, 5, 10].map((r) => gap(3, r).toFixed(4)).join(', ')}`)
  const g4 = [1, 2, 5, 10].map((r) => Math.abs(gap(4, r)))
  check('"All at once", n = 4: the gap stays near 10% (0.105, 0.099, 0.103, 0.095 after 1, 2, 5, 10 rounds)', same(g4.map(f3), ['0.105', '0.099', '0.103', '0.095']), g4.map(f3).join(', '))
  check('"All at once", n = 5, 10 and 20: the gap grows (larger after 2 rounds than at the start, and above 0.4 somewhere in the first 6)', [5, 10, 20].every((n) => Math.abs(gap(n, 2)) > 0.1 && range(6).some((r) => Math.abs(gap(n, r + 1)) > 0.4)), [5, 10, 20].map((n) => `n = ${n}: ${[1, 2, 3, 4, 5, 6].map((r) => gap(n, r).toFixed(3)).join(', ')}`).join('; '))
  // Near the equilibrium the gap is multiplied by (2 − n)/2: measured from 0.1% above.
  const ratio = (n) => {
    const a = adjust(equalCosts(n), 'once', 1, PRIZE, 1.001)
    return (a.totals[1] - a.equilibrium.total) / (a.totals[0] - a.equilibrium.total)
  }
  check('near the equilibrium each round of "All at once" multiplies the gap by (2 − n)/2', NS.every((n) => close(ratio(n), atOnceFactor(n), 0.01 * Math.max(1, Math.abs(atOnceFactor(n))))), NS.map((n) => `n = ${n}: ${ratio(n).toFixed(3)} against ${atOnceFactor(n)}`).join(', '))
  check('the adjustment starts 10% above the equilibrium and runs 30 rounds', START === 1.1 && ROUNDS === 30 && close(adjust(equalCosts(5), 'turn').totals[0], 88, 1e-9) && adjust(equalCosts(5), 'turn').totals.length === 31)
}

console.log('— Contest: unequal costs')
const miners = contestEq(MINERS)
{
  check('"Miners": four stay in; total effort 62.5; shares 0.375, 0.3125, 0.25, 0.0625, 0', miners.m === 4 && close(miners.total, 62.5, 1e-9) && miners.shares.every((s, i) => close(s, [0.375, 0.3125, 0.25, 0.0625, 0][i], 1e-12)))
  check('"Miners": efforts 23.44, 19.53, 15.63, 3.91, 0; profits 14.06, 9.77, 6.25, 0.39, 0', same(miners.efforts.map(f2), ['23.44', '19.53', '15.63', '3.91', '0.00']) && same(miners.profits.map(f2), ['14.06', '9.77', '6.25', '0.39', '0.00']), `${miners.efforts.map(f2).join(', ')}; ${miners.profits.map(f2).join(', ')}`)
  const spending = sum(miners.efforts.map((x, i) => x * MINERS[i]))
  check('"Miners": 69.53 of the prize is spent, Σ s² = 0.3047; spending is Σ c x, and profits are what is left of the prize', f2(miners.spent) === '69.53' && (1 - miners.spentShare).toFixed(4) === '0.3047' && close(spending, miners.spent, 1e-9) && close(sum(miners.profits), PRIZE - spending, 1e-9))
  check('"Miners": the fifth enters below a cost of 1.6 (1.59 in, 1.6 and 1.61 out)', close(entryCost(MINERS), 1.6, 1e-12) && contestEq([1.0, 1.1, 1.2, 1.5, 1.59]).m === 5 && contestEq([1.0, 1.1, 1.2, 1.5, 1.6]).m === 4 && contestEq([1.0, 1.1, 1.2, 1.5, 1.61]).m === 4)
  const half = contestEq(MINERS, 50)
  check('"Miners" with V = 50: total effort 31.25 and the same shares', close(half.total, 31.25, 1e-9) && same(half.shares, miners.shares))
  const oc = contestEq(oneCheaper(10))
  check('"One 10% cheaper", n = 10: total 90.91, shares 0.1818 and 0.0909, spent 0.8926', f2(oc.total) === '90.91' && oc.shares[0].toFixed(4) === '0.1818' && oc.shares.slice(1).every((s) => s.toFixed(4) === '0.0909') && oc.spentShare.toFixed(4) === '0.8926')
  const o5 = contestEq(oneCheaper(5, 0.8))
  check('one 20% cheaper among five: shares 1/3 and 1/6, total 83.33', close(o5.shares[0], 1 / 3, 1e-12) && o5.shares.slice(1).every((s) => close(s, 1 / 6, 1e-12)) && f2(o5.total) === '83.33')
  const presets = [['Miners', MINERS], ...range(19).flatMap((n) => [[`equal ${n + 2}`, equalCosts(n + 2)], [`cheaper ${n + 2}`, oneCheaper(n + 2)]])]
  let fixed = true
  let bound = true
  let sums = true
  for (const [, costs] of presets) {
    const e = contestEq(costs)
    const total = sum(e.efforts)
    costs.forEach((c, i) => {
      if (!close(contestBR(total - e.efforts[i], c), e.efforts[i], 1e-9)) fixed = false
    })
    if (!same(roundAtOnce(e.efforts, costs).map((x) => x.toFixed(8)), e.efforts.map((x) => x.toFixed(8)))) fixed = false
    if (!close(sum(e.shares), 1, 1e-12) || !close(total, e.total, 1e-9)) sums = false
    for (const i of e.staying) costs.forEach((cj, j) => {
      if (e.shares[j] < 1 - cj / costs[i] - 1e-12) bound = false
    })
  }
  check(`in every preset (${presets.length} lists of costs) the closed form is a fixed point of the best responses, also for those who stay out`, fixed)
  check('in every preset the shares sum to 1 and the efforts to the total', sums)
  check("in every preset Arnosti and Weinberg's bound holds: if i stays in, the share of j is at least 1 − c_j/c_i", bound)
  // A brute-force equilibrium for unequal costs: best responses in turn from a flat start.
  let x = MINERS.map(() => 10)
  for (let r = 0; r < 500; r++) x = roundInTurn(x, MINERS)
  check('"Miners": best responses in turn from 10 each reach the closed form', x.every((v, i) => close(v, miners.efforts[i], 1e-6)), x.map(f2).join(', '))
  info(`"Miners": "One at a time" settles in ${roundsToSettle(MINERS, 'turn')} rounds, "All at once" in ${roundsToSettle(MINERS, 'once')}`)
}

// --------------------------------------------------------------- Exercises

console.log('— Exercises')
{
  const g = EXERCISE_1
  const left = eliminate(g)
  check('exercise 1: only U goes (dominated by D), and nothing else', left.steps.length === 1 && left.steps[0].player === 'row' && g.rows[left.steps[0].index] === 'U' && g.rows[left.steps[0].by] === 'D')
  check('exercise 1: equilibria (M, L) with payoffs 7 and 4, and (D, R) with 9 and 8', cells(g, equilibria(g)) === '(M, L) (D, R)' && same([g.a[1][0], g.b[1][0], g.a[2][2], g.b[2][2]], [7, 4, 9, 8]))
  const w1 = walk(g, 0, 0)
  const w2 = walk(g, 0, 1)
  check('exercise 1: from (U, L) the row player moves to M and the walk stops at (M, L); from (U, C) it goes to (D, C), then to (D, R)', cells(g, w1.path) === '(U, L) (M, L)' && same(w1.moves, ['row']) && cells(g, w2.path) === '(U, C) (D, C) (D, R)' && same(w2.moves, ['row', 'col']), `${cells(g, w1.path)}; ${cells(g, w2.path)}`)
  check('exercise 2 is the q* check above (2/3, 1/2, 2/5; risk dominant for a above 5); exercise 3 the Cournot checks', true)
  // Exercise 4: Bertrand on a grid of prices in cents, cost 100, unit demand.
  const c = 100
  const pay = (p, q) => (p < q ? p - c : p === q ? (p - c) / 2 : 0)
  const prices = range(121).map((n) => 60 + n) // 0.60 to 1.80
  const isEq = (p, q) => prices.every((x) => pay(x, q) <= pay(p, q) + 1e-12) && prices.every((x) => pay(x, p) <= pay(q, p) + 1e-12)
  const eqs = []
  for (const p of prices) for (const q of prices) if (isEq(p, q)) eqs.push([p, q])
  check('exercise 4, on a grid of whole cents (cost 100): (100, 100) is an equilibrium; the only others are the two the grid adds, (101, 101) and (102, 102) — with any price allowed they are undercut', same(eqs, [[100, 100], [101, 101], [102, 102]]), JSON.stringify(eqs))
  // With finer and finer prices only cost-pricing survives the limit.
  const fine = (step) => {
    const ps = range(Math.round(40 / step) + 1).map((n) => 90 + n * step)
    const out = []
    for (const p of ps) if (ps.every((x) => pay(x, p) <= pay(p, p) + 1e-12)) out.push(p)
    return out
  }
  check('exercise 4: with a grid ten times finer the symmetric equilibria are 100, 100.1 and 100.2: they close on the cost', same(fine(0.1).map((v) => v.toFixed(1)), ['100.0', '100.1', '100.2']))
  const ex5 = [2, 5, 10].map((n) => contestEq(equalCosts(n)))
  check('exercise 5: totals 50, 80, 90 and profits 25, 4, 1 for n = 2, 5, 10; V Y/(x + Y)² = 1 at the equilibrium', same(ex5.map((e) => f2(e.total)), ['50.00', '80.00', '90.00']) && same(ex5.map((e) => f2(e.profits[0])), ['25.00', '4.00', '1.00']) && [2, 5, 10].every((n, i) => close((PRIZE * (n - 1) * ex5[i].efforts[0]) / ex5[i].total ** 2, 1, 1e-12)))
  check('exercise 5, "Miners": shares 1 − c × 3/4.8; total 62.5; 69.5 spent, 100 × (1 − 0.3047); entry below 1.6', MINERS.slice(0, 4).every((cst, i) => close(miners.shares[i], 1 - (cst * 3) / 4.8, 1e-12)) && close(miners.sum, 4.8, 1e-12) && f1(miners.spent) === '69.5')
}

// ------------------------------------------------------ Quoted on the page

const textsFile = resolve(root, 'src/components/lab/game-theory/nash-equilibrium/texts.js')
const lectureFile = (l) => `src/content/game-theory-lab/nash-equilibrium.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')), it: read(lectureFile('it')) }
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : it(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const pct = (x) => `${Math.round(x * 100)}%`
  const small = survey({ games: DEFAULT_GAMES })
  const scan200 = scan(base)
  const at = (list, x0) => list.find((p) => close(p.x0, x0, 1e-9))
  const scan6 = scan({ ...base, payoffs: { ...STAG, a: 6 } })
  const run = runOnce({})
  const once = (n, r) => adjust(equalCosts(n), 'once').totals[r]

  // ---- The lecture
  quoted('lecture: random games', lecture, [
    [`of the eight-by-eight games, ${pct(big[8].none)} have none and ${pct(big[8].two + big[8].more)} have two or more`, `dei giochi otto per otto, il ${pct(big[8].none)} non ne ha e il ${pct(big[8].two + big[8].more)} ne ha due o più`],
    [`from only ${pct(big[8].walks)} of them at eight by eight`, `solo dal ${pct(big[8].walks)} delle celle in quelli otto per otto`],
    ['One two-by-two game in eight has no equilibrium and one in eight has two', 'Un gioco due per due su otto non ha equilibri e uno su otto ne ha due'],
    ['from seven starting cells in eight at two by two', 'da sette celle di partenza su otto nei giochi due per due'],
    ['about a third of the large random games', 'circa un terzo dei grandi giochi casuali'],
  ])
  check('lecture: at two by two one game in eight has no equilibrium, one in eight has two, and seven walks in eight end at one (within 0.01; exactly 1/8, 1/8 and 7/8 in theory); "about a third" has none at eight by eight', close(big[2].none, 1 / 8, 0.01) && close(big[2].two, 1 / 8, 0.01) && big[2].more === 0 && close(big[2].walks, 7 / 8, 0.01) && close(big[8].none, 1 / 3, 0.03), `${f3(big[2].none)}, ${f3(big[2].two)}, ${f3(big[2].walks)}, ${f3(big[8].none)}`)
  quoted('lecture: the stag hunt', lecture, [
    'q* = 2/3',
    [`about ${f2(tip(4, 10))}`, `circa ${it(f2(tip(4, 10)))}`],
    ['about one time in seven', 'circa una volta su sette'],
    ['about four times in five', 'circa quattro volte su cinque'],
  ])
  {
    // The words are pinned to the 400-run numbers of the check (0.125 and 0.785), not to the page's 200-run scan.
    const p70 = chanceAt(base, 0.7, 400).stag
    const p75 = chanceAt(base, 0.75, 400).stag
    check('lecture: "about one time in seven" and "about four times in five" are the 400-run chances from 0.70 and 0.75, within 0.03 of 1/7 and 4/5', close(p70, 1 / 7, 0.03) && close(p75, 4 / 5, 0.03), `${f3(p70)} and ${f3(p75)} (1/7 = 0.143, 4/5 = 0.800)`)
  }
  quoted('lecture: Cournot', lecture, [
    ['5.5 for a monopoly, 4 with two firms, 2.5 with five and 1.82 with ten', '5,5 per un monopolio, 4 con due imprese, 2,5 con cinque e 1,82 con dieci'],
  ])
  check('lecture: those prices are the code\'s', same([1, 2, 5, 10].map((n) => Number(cournot.symmetric(10, 1, n).price.toFixed(2))), [5.5, 4, 2.5, 1.82]))
  quoted('lecture: the contest and the box', lecture, [
    ['37.5%, 31.3%, 25%, 6.3%', '37,5%, 31,3%, 25%, 6,3%'],
    ['1.0, 1.1, 1.2, 1.5 and 2.0', '1,0; 1,1; 1,2; 1,5 e 2,0'],
  ])
  check('lecture: the shares of the box are the code\'s (37.5, 31.3, 25, 6.3 and nothing)', same(miners.shares.map(percent), ['37.5%', '31.3%', '25.0%', '6.3%', '0.0%']) && same(MINERS.map(f1), ['1.0', '1.1', '1.2', '1.5', '2.0']), miners.shares.map((s) => (100 * s).toFixed(2)).join(', '))
  check('lecture: with two players half the prize is spent, with ten nine tenths', contestEq(equalCosts(2)).spentShare === 0.5 && close(contestEq(equalCosts(10)).spentShare, 0.9, 1e-12))

  // ---- What to observe
  const firstTable = tableOf(DEFAULT_TABLE_SIZE, 0)
  const ft = describeTable(firstTable)
  {
    const w = walk(firstTable, 0, 0)
    const all = range(3).flatMap((i) => range(3).map((j) => walk(firstTable, i, j)))
    check('observe, Panel A: table no. 1 has no equilibrium; from (1, A) six moves, the last four a cycle (3, B), (2, B), (2, C), (3, C); every walk ends in that cycle', ft.equilibria.length === 0 && w.moves.length === 6 && cells(firstTable, w.cycle) === '(3, B) (2, B) (2, C) (3, C)' && all.every((x) => x.end === 'cycle' && same([...x.cycle].sort(), [...w.cycle].sort())), cells(firstTable, w.path))
    const second = tableOf(DEFAULT_TABLE_SIZE, 1)
    const d2 = describeTable(second)
    const all2 = range(3).flatMap((i) => range(3).map((j) => walk(second, i, j)))
    check('observe, Panel A: table no. 2 has one equilibrium, (1, A), elimination leaves that cell, and every walk ends there in at most 3 moves', cells(second, d2.equilibria) === '(1, A)' && d2.solved && all2.every((x) => x.end === 'equilibrium' && same(x.cell, [0, 0])) && Math.max(...all2.map((x) => x.moves.length)) === 3)
    let inside = true
    for (let index = 0; index < 200; index++) {
      const g = tableOf(4, index)
      const d4 = describeTable(g)
      if (!d4.equilibria.every(([i, j]) => d4.left.rows.includes(i) && d4.left.cols.includes(j)) || (d4.solved && d4.equilibria.length !== 1)) inside = false
    }
    check('observe, Panel A: in the first 200 tables of size 4 every equilibrium is inside what elimination leaves', inside)
  }
  quoted('observe, Panel A', observe.equilibria, [
    [`${f3(big[2].none)} at m = 2`, `${it(f3(big[2].none))} per m = 2`],
    [`${f3(big[8].none)} at m = 8`, `${it(f3(big[8].none))} per m = 8`],
    [`from ${f3(big[2].walks)} to ${f3(big[8].walks)}`, `da ${it(f3(big[2].walks))} a ${it(f3(big[8].walks))}`],
    [`${f3(big[8].walksHaving)}`, `${it(f3(big[8].walksHaving))}`],
    [`${f3(big[8].more)}`, `${it(f3(big[8].more))}`],
  ])
  check('observe, Panel A: with 20,000 games the mean is between 0.99 and 1.01 at every size', SIZES.every((m) => big[m].mean >= 0.99 && big[m].mean <= 1.01), SIZES.map((m) => f3(big[m].mean)).join(', '))
  info(`Panel A opens on: equilibria ${cells(firstTable, ft.equilibria) || 'none'}, elimination leaves ${ft.left.rows.length} × ${ft.left.cols.length}`)
  info(`survey with the default 2,000 games: mean ${SIZES.map((m) => f3(small[m].mean)).join(', ')}; none ${SIZES.map((m) => f3(small[m].none)).join(', ')}; walks ${SIZES.map((m) => f3(small[m].walks)).join(', ')}`)

  quoted('observe, Panel B', observe.conventions, [
    [`after ${run.sweeps} sweeps`, `dopo ${run.sweeps} passate`],
    f3(tip(4, 10)),
    f3(at(scan200, 0.7).stag), f3(at(scan200, 0.75).stag),
    f3(tip(6, 10)),
    f3(at(scan6, 0.35).stag), f3(at(scan6, 0.4).stag),
    f3(tip(4, 50)), f3(tip(4, 5)),
  ])
  check('observe, Panel B: the run on the page starts at 0.7 and ends with everyone hunting hare; the scan is 0 up to 0.60 and 1 from 0.80 (default), 0 up to 0.30 and 1 from 0.45 (a = 6)', run.end === 'hare' && run.series[0] === 0.7 && scan200.every((p) => (p.x0 > 0.605 || p.stag === 0) && (p.x0 < 0.795 || p.stag === 1)) && scan6.every((p) => (p.x0 > 0.305 || p.stag === 0) && (p.x0 < 0.445 || p.stag === 1)), `default: ${scan200.filter((p) => p.x0 > 0.55 && p.x0 < 0.85).map((p) => `${p.x0}: ${f3(p.stag)}`).join(', ')}; a = 6: ${scan6.filter((p) => p.x0 > 0.2 && p.x0 < 0.5).map((p) => `${p.x0}: ${f3(p.stag)}`).join(', ')}; run ${run.series.map(f3).join(' ')}`)
  {
    const run6 = runOnce({ payoffs: { ...STAG, a: 6 } })
    const big1000 = scan({ ...base, N: 1000 })
    check('observe, Panel B: with a = 6 the run from 0.70 ends with everyone hunting the stag; q* = 0.400', run6.end === 'stag' && f3(qStar({ ...STAG, a: 6 })) === '0.400' && f3(qStar(STAG)) === '0.667')
    quoted('observe, Panel B: N = 1,000', observe.conventions, [
      [`${f3(at(big1000, 0.7).stag)} at x₀ = 0.70 and ${f3(at(big1000, 0.75).stag)} at 0.75`, `${it(f3(at(big1000, 0.7).stag))} per x₀ = 0,70 e ${it(f3(at(big1000, 0.75).stag))} per 0,75`],
    ])
  }
  check('the scan has 21 starting shares and 200 runs each', X0_VALUES.length === 21 && scan200.length === 21 && scan200.every((p) => p.runs === DEFAULTS.runs) && DEFAULTS.runs === 200)

  quoted('observe, Panel C', observe.contest, [
    ['50.00, 80.00 and 90.00', '50,00; 80,00 e 90,00'],
    '62.50', '69.53',
    [`${miners.shares.slice(0, 3).map(percent).join(', ')} and ${percent(miners.shares[3])}`, `${miners.shares.slice(0, 3).map((s) => it(percent(s))).join(', ')} e ${it(percent(miners.shares[3]))}`],
    [`(${[0, 1, 2, 3].map((r) => f1(once(4, r))).join(', ')}…)`, `(${[0, 1, 2, 3].map((r) => it(f1(once(4, r)))).join('; ')}…)`],
    [`(${[0, 1, 2, 3].map((r) => f1(once(10, r))).join(', ')})`, `(${[0, 1, 2, 3].map((r) => it(f1(once(10, r)))).join('; ')})`],
    [`after ${settleTurn[10]} rounds`, `dopo ${settleTurn[10]} turni`],
    [`from ${f1(adjust(equalCosts(10), 'turn').totals[0])} to ${f1(adjust(equalCosts(10), 'turn').totals[1])}`, `da ${it(f1(adjust(equalCosts(10), 'turn').totals[0]))} a ${it(f1(adjust(equalCosts(10), 'turn').totals[1]))}`],
    [`from ${f2(contestEq(equalCosts(2)).profits[0])} to ${f2(contestEq(equalCosts(5)).profits[0])} and to ${f2(contestEq(equalCosts(10)).profits[0])}`, `da ${it(f2(contestEq(equalCosts(2)).profits[0]))} a ${it(f2(contestEq(equalCosts(5)).profits[0]))} e a ${it(f2(contestEq(equalCosts(10)).profits[0]))}`],
    '90.91', [percent(contestEq(oneCheaper(10)).shares[0]), it(percent(contestEq(oneCheaper(10)).shares[0]))], [percent(contestEq(oneCheaper(10)).shares[1]), it(percent(contestEq(oneCheaper(10)).shares[1]))],
  ])
  check('observe, Panel C: the miner with cost 1.5 has a share six times smaller than the cheapest; the cheaper player of "One 10% cheaper" has twice the share of the others', close(miners.shares[0] / miners.shares[3], 6, 1e-9) && close(contestEq(oneCheaper(10)).shares[0] / contestEq(oneCheaper(10)).shares[1], 2, 1e-9))
  check('observe, Panel C: with n = 4 the total of "All at once" swings between about 82 and 67 for all 30 rounds', adjust(equalCosts(4), 'once').totals.every((v, r) => (r % 2 === 0 ? v > 81 && v < 83 : v > 66.5 && v < 68.5)))
  check('observe, Panel C: "All at once" with n = 10 overshoots to 213.8 in the second round, has everyone out in the third, and they stay out', f1(once(10, 2)) === '213.8' && range(28).every((r) => once(10, r + 3) === 0))
  check('observe, Panel C: with n = 5 the total of "All at once" is below 10 and above 115 somewhere in 30 rounds', Math.min(...adjust(equalCosts(5), 'once').totals) < 10 && Math.max(...adjust(equalCosts(5), 'once').totals) > 115, adjust(equalCosts(5), 'once').totals.map(f1).join(' '))
  check('observe, Panel C: "Miners", "All at once" still swings after 30 rounds (between 61 and 64), "One at a time" has settled within 0.01 by round 5', (() => {
    const a = adjust(MINERS, 'once').totals
    const b = adjust(MINERS, 'turn').totals
    return a[29] > 61 && a[29] < 62.4 && a[30] > 62.6 && a[30] < 64 && Math.abs(b[5] - 62.5) < 0.01
  })(), `${f2(adjust(MINERS, 'once').totals[29])}, ${f2(adjust(MINERS, 'once').totals[30])}; turn round 5 ${adjust(MINERS, 'turn').totals[5].toFixed(4)}`)

  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 1', sol(0), ['(M, L)', '(D, R)', '(D, C)'])
  quoted('exercise 2', sol(1), ['2/3, 1/2', '2/5'])
  quoted('exercise 3', sol(2), ['10.125', '3.375', '4.375', '11.39', '7.59', ['5.5, 4, 2.5, 1.82 and 1.09', '5,5; 4; 2,5; 1,82 e 1,09']])
  check('exercise 3: the price with 100 firms is 1.09', f2(cournot.symmetric(10, 1, 100).price) === '1.09')
  quoted('exercise 5', sol(4), [['50, 80 and 90', '50, 80 e 90'], ['25, 4 and 1', '25, 4 e 1'], ['0.375, 0.3125, 0.25', '0,375; 0,3125; 0,25'], '0.0625', '62.5', '69.5', '0.3047', '1.6', '31.25'])
  quoted('exercise 6', sol(5), [
    [`${f3(big[2].none)} at m = 2 and ${f3(big[8].none)} at m = 8`, `${it(f3(big[2].none))} per m = 2 e ${it(f3(big[8].none))} per m = 8`],
    [`${f3(big[2].walks)} at m = 2 and ${f3(big[8].walks)} at m = 8`, `${it(f3(big[2].walks))} per m = 2 e ${it(f3(big[8].walks))} per m = 8`],
    f3(tip(4, 10)), f3(tip(6, 10)),
    ['0.667 and 0.4', '0,667 e 0,4'],
  ])
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words
  const words = (s) => s.trim().split(/\s+/).length
  const body = (l) => lecture[l].split(/<!--\s*simulation\s*-->/)[0]
  check('lecture words: between 1,400 and 1,700 in each language (markup and box included), with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(body(l)) >= 1400 && words(body(l)) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(body(l))}`).join(', '))
  const box = (l) => (lecture[l].match(/```box\n([\s\S]*?)```/) || [, ''])[1]
  check('one Bitcoin box, after the contests, 150 to 200 words in each language (title included)', ['en', 'it'].every((l) => (lecture[l].match(/```box/g) || []).length === 1 && words(box(l)) >= 150 && words(box(l)) <= 200) && box('en').startsWith('Bitcoin: mining as a contest') && box('it').startsWith('Bitcoin: il mining come gara'), ['en', 'it'].map((l) => `${l} ${words(box(l))}`).join(', '))
  check('the lecture places the two live figures and links to module 01', ['en', 'it'].every((l) => /```figure\nstaghunt\n```/.test(lecture[l]) && /```figure\ncournot\n```/.test(lecture[l]) && lecture[l].includes('(/game-theory-lab/what-is-a-game)')))
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b(?! entry)|gratuit|gratis/i.test(lecture[l] + observe.equilibria[l] + observe.conventions[l] + observe.contest[l])))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

// ----------------------------------------------------------------- Timings

{
  let t0 = performance.now()
  survey({ games: 20000 })
  const a = performance.now() - t0
  t0 = performance.now()
  scan({ ...base, N: 1000 })
  const b = performance.now() - t0
  info(`timings in Node: survey of all sizes with 20,000 games ${Math.round(a)} ms; scan of the starting share with N = 1,000 ${Math.round(b)} ms`)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
