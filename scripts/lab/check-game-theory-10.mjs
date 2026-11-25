// Self-checks for Game Theory Lab module 10, "Coalitions: how to share the
// pie". They run the same code as the page (simplex.js, coalitions.js,
// voting.js, bankruptcy.js, and module 08's frac.js) and compare it with
// exact values, with independent computations and with the numbers the
// texts quote.
//
//   node scripts/lab/check-game-theory-10.mjs
//
// Exits with code 1 if any check fails. Lines starting with INFO report
// numbers that are not checked (timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { frac, ZERO, add, sub, mul, div, cmp, eq, show, toNumber } from '../../src/components/lab/game-theory/congestion-price-of-anarchy/frac.js'
import { solveLP } from '../../src/components/lab/game-theory/coalitions-sharing/simplex.js'
import {
  makeGame, shapley, shapleyByOrders, shapley3, partnersGame, coreRule3, coreCorners3, coreTest, leastCore, superadditive, convex, inCore, objections, savingsGame, nucleolus, presetGame, analyse, full, popcount, properCoalitions, label, xOf,
} from '../../src/components/lab/game-theory/coalitions-sharing/coalitions.js'
import {
  powerIndices, powerByEnumeration, splitLargest, largestNeeded, COUNCIL_WEIGHTS, POOL_SHARES, POOL_QUOTAS, VOTING_PRESETS,
} from '../../src/components/lab/game-theory/coalitions-sharing/voting.js'
import { proportional, cea, cel, talmud, shapleyRule, randomArrival, estateGame, allRules, curves, RULES } from '../../src/components/lab/game-theory/coalitions-sharing/bankruptcy.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const T0 = performance.now()
const F = (v) => (typeof v === 'object' ? v : frac(v))
const fr = (s) => {
  const [a, b] = String(s).split('/')
  return frac(BigInt(a), BigInt(b ?? 1))
}
const sameFr = (xs, want) => xs.length === want.length && xs.every((x, i) => eq(x, F(typeof want[i] === 'string' ? fr(want[i]) : want[i])))
const showAll = (xs) => xs.map(show).join(', ')
const f2 = (x) => toNumber(x).toFixed(2)
const f4 = (x) => toNumber(x).toFixed(4)
const sameSet = (a, b) => a.length === b.length && a.every((p) => b.some((q) => p.every((v, i) => eq(v, F(q[i])))))
const pts = (cs) => cs.map((p) => `(${p.map(show).join(', ')})`).join(' ')

// ------------------------------------------------------------------ Simplex

console.log('— The simplex against hand-solved cases and brute force')
{
  // min x + y, x + 2y ≥ 4, 3x + y ≥ 6, x, y ≥ 0: the corner (8/5, 6/5), 14/5.
  const a = solveLP({ c: [1, 1], rows: [{ a: [1, 2], op: '>=', b: 4 }, { a: [3, 1], op: '>=', b: 6 }], free: false })
  check('min x + y with x + 2y ≥ 4, 3x + y ≥ 6: (8/5, 6/5), value 14/5', a.status === 'optimal' && sameFr(a.x, ['8/5', '6/5']) && eq(a.value, fr('14/5')), `${showAll(a.x)}; ${show(a.value)}`)
  // Chvátal's cycling example (max 10x1 − 57x2 − 9x3 − 24x4): optimum 1 at (1, 0, 1, 0).
  const b = solveLP({
    c: [-10, 57, 9, 24],
    rows: [
      { a: [fr('1/2'), fr('-11/2'), fr('-5/2'), 9], op: '<=', b: 0 },
      { a: [fr('1/2'), fr('-3/2'), fr('-1/2'), 1], op: '<=', b: 0 },
      { a: [1, 0, 0, 0], op: '<=', b: 1 },
    ],
    free: false,
  })
  check("Chvátal's cycling example ends (Bland's rule) at (1, 0, 1, 0), value 1", b.status === 'optimal' && sameFr(b.x, [1, 0, 1, 0]) && eq(b.value, frac(-1)), `${showAll(b.x)}; ${b.pivots} pivots`)
  // Beale's example: min −3/4 x1 + 150 x2 − 1/50 x3 + 6 x4: −1/20 at (1/25, 0, 1, 0).
  const c = solveLP({
    c: [fr('-3/4'), 150, fr('-1/50'), 6],
    rows: [
      { a: [fr('1/4'), -60, fr('-1/25'), 9], op: '<=', b: 0 },
      { a: [fr('1/2'), -90, fr('-1/50'), 3], op: '<=', b: 0 },
      { a: [0, 0, 1, 0], op: '<=', b: 1 },
    ],
    free: false,
  })
  check("Beale's cycling example: (1/25, 0, 1, 0), value −1/20", c.status === 'optimal' && sameFr(c.x, ['1/25', 0, 1, 0]) && eq(c.value, fr('-1/20')), `${showAll(c.x)}; ${c.pivots} pivots`)
  const d = solveLP({ c: [1], rows: [{ a: [1], op: '>=', b: 1 }, { a: [1], op: '<=', b: 0 }], free: true })
  const e = solveLP({ c: [-1], rows: [{ a: [1], op: '>=', b: 0 }], free: true })
  const g = solveLP({ c: [1, 1], rows: [{ a: [1, 1], op: '=', b: 3 }, { a: [1, -1], op: '=', b: 1 }, { a: [2, 0], op: '=', b: 4 }], free: true })
  check('x ≥ 1 and x ≤ 0 is infeasible; min −x with x ≥ 0 is unbounded; a redundant equation is dropped (x + y = 3, x − y = 1, 2x = 4: (2, 1))', d.status === 'infeasible' && e.status === 'unbounded' && g.status === 'optimal' && sameFr(g.x, [2, 1]))
  // Brute force: every vertex of {x ≥ 0, A x ≥ b} in 3 variables, by solving
  // each 3 × 3 system of tight constraints exactly.
  const solve3 = (M, r) => {
    const A = M.map((row, i) => [...row.map(F), F(r[i])])
    for (let col = 0; col < 3; col++) {
      const p = A.findIndex((row, i) => i >= col && row[col].n !== 0n)
      if (p < 0) return null
      ;[A[col], A[p]] = [A[p], A[col]]
      for (let i = 0; i < 3; i++) {
        if (i === col) continue
        const f = div(A[i][col], A[col][col])
        A[i] = A[i].map((v, j) => sub(v, mul(f, A[col][j])))
      }
    }
    return A.map((row, i) => div(row[3], row[i]))
  }
  const random = mulberry32(1010)
  let agree = 0
  const K = 150
  for (let k = 0; k < K; k++) {
    const m = 3 + Math.floor(random() * 3)
    const rows = Array.from({ length: m }, () => ({ a: [0, 1, 2].map(() => Math.floor(random() * 7) - 1), op: '>=', b: Math.floor(random() * 9) - 2 }))
    const cst = [0, 1, 2].map(() => 1 + Math.floor(random() * 5))
    const r = solveLP({ c: cst, rows, free: false })
    const all = [...rows.map((x) => [x.a, x.b]), [[1, 0, 0], 0], [[0, 1, 0], 0], [[0, 0, 1], 0]]
    let best = null
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) for (let l = j + 1; l < all.length; l++) {
      const x = solve3([all[i][0], all[j][0], all[l][0]], [all[i][1], all[j][1], all[l][1]])
      if (!x) continue
      const ok = all.every(([a, b]) => cmp(a.reduce((s, v, t) => add(s, mul(F(v), x[t])), ZERO), F(b)) >= 0)
      if (!ok) continue
      const val = x.reduce((s, v, t) => add(s, mul(F(cst[t]), v)), ZERO)
      if (best == null || cmp(val, best) < 0) best = val
    }
    // Positive costs and x ≥ 0: bounded below, so optimal or infeasible.
    if (best == null ? r.status === 'infeasible' : r.status === 'optimal' && eq(r.value, best)) agree++
  }
  check(`${K} random LPs in 3 variables: the simplex's optimum equals the best vertex found by brute force (or both say infeasible)`, agree === K, `${agree} of ${K}`)
}

// ------------------------------------------------------------------ F1

console.log('— F1: the partners, the Shapley value and the core')
const P = (ab, ac, bc) => partnersGame(ab, ac, bc)
{
  const sh = (ab, ac, bc) => shapley3(ab, ac, bc)
  check('(70, 60, 40) and (80, 70, 50) both give 125/3, 95/3, 80/3', sameFr(sh(70, 60, 40), ['125/3', '95/3', '80/3']) && sameFr(sh(80, 70, 50), ['125/3', '95/3', '80/3']))
  check('(90, 60, 40): 45, 35, 20; (100, 100, 100): 100/3 each', sameFr(sh(90, 60, 40), [45, 35, 20]) && sameFr(sh(100, 100, 100), ['100/3', '100/3', '100/3']))
  check('the partners: 41.67, 31.67, 26.67', sh(70, 60, 40).map(f2).join(', ') === '41.67, 31.67, 26.67')
  const random = mulberry32(2024)
  let ok = 0
  for (let k = 0; k < 300; k++) {
    const r = () => Math.floor(random() * 41) * 5
    const g = P(r(), r(), r())
    if (sameFr(shapley3(g.v[3], g.v[5], g.v[6]), shapleyByOrders(g)) && sameFr(shapley(g), shapleyByOrders(g))) ok++
  }
  check('the three-player formula, the general formula and the average over the 6 orders agree on 300 random games', ok === 300, `${ok}`)
  const random5 = mulberry32(2025)
  let ok5 = 0
  for (let k = 0; k < 40; k++) {
    const n = 4 + (k % 2)
    const g = makeGame(n, (m) => (m === 0 ? 0 : Math.floor(random5() * 50) - 10))
    if (sameFr(shapley(g), shapleyByOrders(g))) ok5++
  }
  check('the formula and the average over all orders agree on 40 random games of 4 and 5 players (24 and 120 orders)', ok5 === 40)

  const corners = (ab, ac, bc) => coreCorners3(P(ab, ac, bc))
  const inside = (ab, ac, bc) => inCore(P(ab, ac, bc), sh(ab, ac, bc))
  check('(70, 60, 40): corners (60, 40, 0), (60, 10, 30), (30, 40, 30); the Shapley value inside', sameSet(corners(70, 60, 40), [[60, 40, 0], [60, 10, 30], [30, 40, 30]]) && inside(70, 60, 40), pts(corners(70, 60, 40)))
  check('(90, 60, 40): corners (60, 40, 0), (60, 30, 10), (50, 40, 10); the Shapley value outside', sameSet(corners(90, 60, 40), [[60, 40, 0], [60, 30, 10], [50, 40, 10]]) && !inside(90, 60, 40), pts(corners(90, 60, 40)))
  {
    const o = objections(P(90, 60, 40), sh(90, 60, 40))
    check('(90, 60, 40): only A and B object to the Shapley value, by 10 (they get 80 and could make 90)', o.length === 1 && o[0].mask === 3 && eq(o[0].by, frac(10)) && eq(xOf(sh(90, 60, 40), 3), frac(80)))
  }
  check('(80, 70, 50): the single point (50, 30, 20); the Shapley value outside', sameSet(corners(80, 70, 50), [[50, 30, 20]]) && !inside(80, 70, 50))
  check('(100, 100, 100): empty', corners(100, 100, 100).length === 0 && !coreTest(P(100, 100, 100)).nonempty)
  check('(60, 60, 60): corners (40, 40, 20), (40, 20, 40), (20, 40, 40)', sameSet(corners(60, 60, 60), [[40, 40, 20], [40, 20, 40], [20, 40, 40]]))
  check('exercise 3 with every pair 80: empty (the pairs need 120 each... 240 against 200)', corners(80, 80, 80).length === 0 && !coreRule3(80, 80, 80))
  check('the upper bounds x_A ≤ 60, x_B ≤ 40, x_C ≤ 30 for the partners (100 minus the other pair)', 100 - 40 === 60 && 100 - 60 === 40 && 100 - 70 === 30)
  {
    // Adding the same amount to every pair changes nothing: Shapley.
    const g = sh(70, 60, 40)
    check('adding 10 to every pair leaves the Shapley value as it was', [0, 5, 10, 30].every((t) => sameFr(sh(70 + t, 60 + t, 40 + t), g)))
  }
  // The slider grid of F1: the LP test, the three-player rule and the corners agree.
  let agree = 0
  let total = 0
  for (let ab = 0; ab <= 100; ab += 10) for (let ac = 0; ac <= 100; ac += 10) for (let bc = 0; bc <= 100; bc += 10) {
    total++
    const g = P(ab, ac, bc)
    const lp = coreTest(g).nonempty
    const rule = coreRule3(ab, ac, bc)
    const cs = coreCorners3(g).length > 0
    if (lp === rule && rule === cs) agree++
  }
  check(`on the grid of pairs 0, 10, …, 100 (${total} games) the LP's core test, the three-player rule and the corner search agree`, agree === total, `${agree} of ${total}`)
  // A random grid with v(N) and pairs of any size (including pairs above v(N)).
  const rr = mulberry32(77)
  let agree2 = 0
  for (let k = 0; k < 400; k++) {
    const vN = 20 + Math.floor(rr() * 100)
    const p = [0, 1, 2].map(() => Math.floor(rr() * 1.4 * vN))
    const g = partnersGame(p[0], p[1], p[2], vN)
    if (coreTest(g).nonempty === coreRule3(p[0], p[1], p[2], vN)) agree2++
  }
  check('on 400 random three-player games (v(i) = 0, pairs up to 1.4 v(N)) the LP agrees with the rule', agree2 === 400, `${agree2}`)
  // Shapley in the core exactly when the corners' polygon contains it.
  check('the game v(N) = 72 with pairs 60, 48, 30: Shapley 32, 23, 17, outside the core; corners (42, 24, 6), (42, 18, 12), (36, 24, 12)', (() => {
    const g = partnersGame(60, 48, 30, 72)
    return sameFr(shapley(g), [32, 23, 17]) && !inCore(g, shapley(g)) && sameSet(coreCorners3(g), [[42, 24, 6], [42, 18, 12], [36, 24, 12]])
  })())
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: presets')
const A = {}
{
  const t = performance.now()
  A.gloves3 = analyse(presetGame('gloves3'))
  A.gloves5 = analyse(presetGame('gloves5'))
  for (const n of [3, 4, 5]) A[`majority${n}`] = analyse(presetGame('majority', n))
  for (const n of [3, 4, 5]) A[`unanimity${n}`] = analyse(presetGame('unanimity', n))
  A.airport = analyse(presetGame('airport'))
  A.partners = analyse(presetGame('partners'))
  A.partners90 = analyse(presetGame('partners90'))
  info(`Panel A, all presets analysed in ${Math.round(performance.now() - t)} ms`)
  const g3 = A.gloves3
  check('gloves (L, L, R): Shapley 1/6, 1/6, 2/3; core {(0, 0, 1)}', sameFr(g3.phi, ['1/6', '1/6', '2/3']) && g3.core.nonempty && sameSet(coreCorners3(g3.value), [[0, 0, 1]]) && sameFr(g3.least.x, [0, 0, 1]))
  const g5 = A.gloves5
  check('gloves (L, L, R, R, R): Shapley 13/20, 13/20, 7/30, 7/30, 7/30; the least core point (1, 1, 0, 0, 0), ε = 0', sameFr(g5.phi, ['13/20', '13/20', '7/30', '7/30', '7/30']) && g5.core.nonempty && sameFr(g5.least.x, [1, 1, 0, 0, 0]) && eq(g5.least.eps, ZERO), showAll(g5.least.x))
  {
    // The core is {(1, 1, 0, 0, 0)}: the LP maximum of each right glove's share over the core is 0.
    const g = presetGame('gloves5')
    const coreRows = properCoalitions(5).map((m) => ({ a: [0, 1, 2, 3, 4].map((i) => (m & (1 << i) ? 1 : 0)), op: '>=', b: g.v[m] }))
    coreRows.push({ a: [1, 1, 1, 1, 1], op: '=', b: g.v[31] })
    const tops = [0, 1, 2, 3, 4].map((i) => {
      const lo = solveLP({ c: [0, 1, 2, 3, 4].map((j) => (j === i ? 1 : 0)), rows: coreRows }).value
      const hi = solveLP({ c: [0, 1, 2, 3, 4].map((j) => (j === i ? -1 : 0)), rows: coreRows }).value
      return [lo, mul(frac(-1), hi)]
    })
    check('gloves (L, L, R, R, R): over the core each share has min = max, so the core is the single point (1, 1, 0, 0, 0)', tops.every(([lo, hi], i) => eq(lo, hi) && eq(lo, frac(i < 2 ? 1 : 0))))
  }
  for (const n of [3, 4, 5]) {
    const m = A[`majority${n}`]
    const want = { 3: '1/3', 4: '1/4', 5: '2/5' }[n]
    check(`majority with ${n} players: 1/${n} each, core empty, least core ε = ${want}`, m.phi.every((x) => eq(x, frac(1, n))) && !m.core.nonempty && eq(m.least.eps, fr(want)), `ε = ${show(m.least.eps)}`)
  }
  check('the partners with every pair 100: least core ε = 100/3; with every pair 80: 40/3', eq(leastCore(P(100, 100, 100)).eps, fr('100/3')) && eq(leastCore(P(80, 80, 80)).eps, fr('40/3')))
  const ap = A.airport
  check('airport 10, 15, 30: cost shares 10/3, 35/6, 125/6, in the core, savings game convex', sameFr(ap.phi, ['10/3', '35/6', '125/6']) && ap.shapleyIn && ap.convex, showAll(ap.phi))
  check('airport: each stretch paid equally by the planes that need it (Littlechild–Owen): 10/3, 10/3 + 5/2, 10/3 + 5/2 + 15', sameFr(ap.phi, [div(frac(10), frac(3)), add(fr('10/3'), fr('5/2')), add(add(fr('10/3'), fr('5/2')), frac(15))]))
  check('airport: the savings game is v(S) = Σ c(i) − c(S) (v(N) = 55 − 30 = 25), its Shapley value is c(i) minus the cost share', eq(ap.value.v[7], frac(25)) && sameFr(ap.phiValue, [sub(frac(10), ap.phi[0]), sub(frac(15), ap.phi[1]), sub(frac(30), ap.phi[2])]))
  for (const n of [3, 4, 5]) {
    const u = A[`unanimity${n}`]
    check(`unanimity of 1 and 2, n = ${n}: 1/2, 1/2 and 0 for every other player`, sameFr(u.phi, ['1/2', '1/2', ...Array(n - 2).fill(0)]) && u.shapleyIn && u.convex)
  }
  check('the partners: superadditive, not convex (C adds 40 to B but 30 to A and B), Shapley in the core', A.partners.superadditive && !A.partners.convex && A.partners.shapleyIn)
  check('the partners with v(AB) = 90: Shapley 45, 35, 20 outside the core, A and B object by 10', sameFr(A.partners90.phi, [45, 35, 20]) && !A.partners90.shapleyIn && A.partners90.shapleyObjections.length === 1 && A.partners90.shapleyObjections[0].mask === 3)
  check('gloves and majority are superadditive; majority is not convex; the gloves are not convex', [A.gloves3, A.gloves5, A.majority3, A.majority4, A.majority5].every((x) => x.superadditive) && !A.majority3.convex && !A.gloves3.convex)
  check('convex games have the Shapley value in the core (Shapley 1971): 200 random convex games of 3–5 players', (() => {
    const r = mulberry32(31)
    let ok = 0
    for (let k = 0; k < 200; k++) {
      const n = 3 + (k % 3)
      // A sum of unanimity games with positive weights is convex.
      const ws = Array.from({ length: 1 << n }, (_, m) => (m && r() < 0.4 ? Math.floor(r() * 9) + 1 : 0))
      const g = makeGame(n, (m) => ws.reduce((s, w, t) => s + ((t & m) === t ? w : 0), 0))
      if (convex(g).ok && inCore(g, shapley(g))) ok++
    }
    return ok === 200
  })())
  check('the core test and the least core agree: nonempty exactly when ε ≤ 0 (all presets)', Object.values(A).every((a) => a.core.nonempty === (cmp(a.least.eps, ZERO) <= 0)))
  check('when ε ≤ 0 the least core point is in the core (all presets)', Object.values(A).every((a) => !a.core.nonempty || inCore(a.value, a.least.x)))
  check('superadditive (partners) is reported false when a pair is worth less than its two members', !superadditive(makeGame(3, (m) => ({ 1: 5, 2: 5, 3: 6, 7: 20 })[m] ?? 0)).ok)
  // 5-player timing (the page runs one analysis per change).
  const g = makeGame(5, (m) => (popcount(m) >= 2 ? popcount(m) * 7 + (m % 5) : 0))
  const t1 = performance.now()
  analyse(g)
  info(`Panel A, one 5-player analysis: ${Math.round(performance.now() - t1)} ms`)
}

// ------------------------------------------------------------------ Voting

console.log('— F2 and Panel B: power indices')
const council = (q) => powerIndices(COUNCIL_WEIGHTS, q)
{
  const SS = {
    9: ['7/30', '7/30', '7/30', '1/10', '1/10', '1/10'],
    10: ['4/15', '4/15', '4/15', '1/10', '1/10', '0'],
    11: ['7/30', '7/30', '7/30', '1/10', '1/10', '1/10'],
    12: ['7/30', '7/30', '7/30', '3/20', '3/20', '0'],
    13: ['13/60', '13/60', '13/60', '7/60', '7/60', '7/60'],
    14: ['3/10', '3/10', '3/10', '1/20', '1/20', '0'],
    15: ['4/15', '4/15', '4/15', '1/15', '1/15', '1/15'],
    16: ['1/5', '1/5', '1/5', '1/5', '1/5', '0'],
    17: ['1/6', '1/6', '1/6', '1/6', '1/6', '1/6'],
  }
  for (const [q, want] of Object.entries(SS)) {
    const r = council(Number(q))
    check(`1958 Council, quota ${q}: Shapley–Shubik ${want.join(', ')}`, sameFr(r.ss, want), showAll(r.ss))
  }
  const b = council(12)
  check('quota 12: Banzhaf swings 10, 10, 10, 6, 6, 0; normalised 0.2381 ×3, 0.1429 ×2, 0; absolute 0.3125, 0.1875, 0', b.swings.join(',') === '10,10,10,6,6,0' && b.banzhaf.map(f4).join(',') === '0.2381,0.2381,0.2381,0.1429,0.1429,0.0000' && b.absolute.map(f4).join(',') === '0.3125,0.3125,0.3125,0.1875,0.1875,0.0000')
  check("Luxembourg's power is 0 at every even quota (10, 12, 14, 16) and positive at every odd one", [10, 12, 14, 16].every((q) => council(q).ss[5].n === 0n && council(q).swings[5] === 0) && [9, 11, 13, 15, 17].every((q) => council(q).ss[5].n > 0n))
  const p = powerIndices([49, 49, 2], 51)
  check('49–49–2 at 51: 1/3 each', sameFr(p.ss, ['1/3', '1/3', '1/3']) && p.swings.every((s) => s === p.swings[0]))
}
console.log('— Panel B: the illustrative pools')
const pools = (q) => powerIndices(POOL_SHARES, q)
{
  const row = (xs) => [...xs.slice(0, 6).map(f4), toNumber(xs.slice(5).reduce(add, ZERO)).toFixed(4)]
  const EXP = {
    51: { ss: ['0.3030', '0.2031', '0.2031', '0.0584', '0.0584', '0.0087', '0.1740'], bz: ['0.3322', '0.2209', '0.2209', '0.0579', '0.0579', '0.0055'] },
    34: { ss: ['0.2820', '0.1743', '0.1743', '0.0895', '0.0895', '0.0095'], bz: ['0.2756', '0.1880', '0.1880', '0.0951', '0.0951', '0.0079'] },
    67: { ss: ['0.2820', '0.1743', '0.1743', '0.0895', '0.0895', '0.0095'], bz: ['0.2756', '0.1880', '0.1880', '0.0951', '0.0951', '0.0079'] },
    26: { ss: ['0.3673', '0.1733', '0.1733', '0.0646', '0.0646', '0.0079'], bz: ['0.2422', '0.2343', '0.2343', '0.0483', '0.0483', '0.0096'] },
  }
  for (const q of POOL_QUOTAS) {
    const r = pools(q)
    const ss = row(r.ss)
    const bz = r.banzhaf.slice(0, 6).map(f4)
    const e = EXP[q]
    check(`pools at quota ${q}: Shapley–Shubik ${ss.slice(0, 6).join(', ')}${q === 51 ? ` (the twenty ${ss[6]})` : ''}; Banzhaf ${bz.join(', ')}`, ss.slice(0, 6).join() === e.ss.slice(0, 6).join() && bz.join() === e.bz.join() && (q !== 51 || ss[6] === e.ss[6]), `expected ${e.ss.join(', ')}; ${e.bz.join(', ')}`)
  }
  check('quota 34 and 67 are dual games (34 + 67 = 100 + 1): equal indices', sameFr(pools(34).ss, pools(67).ss) && sameFr(pools(34).banzhaf, pools(67).banzhaf))
  check('largest players needed: 1 at 26, 2 at 34, 3 at 51, 4 at 67', POOL_QUOTAS.map((q) => largestNeeded(POOL_SHARES, q)).join(',') === '1,2,3,4')
  const split = splitLargest(POOL_SHARES.map((w, i) => ({ name: `P${i + 1}`, weight: w })))
  const s = powerIndices(split.map((x) => x.weight), 51)
  check('"Split the largest" at 51 (13 and 13): Shapley–Shubik 0.1293 each (together 0.2586), then 0.2047, 0.2047, 0.0745, 0.0745, 0.0092', split[0].weight === 13 && split[1].weight === 13 && split.length === 26 && f4(s.ss[0]) === '0.1293' && f4(s.ss[1]) === '0.1293' && toNumber(add(s.ss[0], s.ss[1])).toFixed(4) === '0.2586' && s.ss.slice(2, 7).map(f4).join(', ') === '0.2047, 0.2047, 0.0745, 0.0745, 0.0092', `${s.ss.slice(0, 7).map(f4).join(', ')}`)
  info(`split at 51, Banzhaf: ${s.banzhaf.slice(0, 7).map(f4).join(', ')}`)
  check('the indices add up to 1 (Shapley–Shubik exactly; normalised Banzhaf exactly) for every quota 1 to 100 of the pools, and for the Council at 9 to 17', [...Array(100).keys()].map((k) => k + 1).every((q) => {
    const r = pools(q)
    return eq(r.ss.reduce(add, ZERO), frac(1)) && eq(r.banzhaf.reduce(add, ZERO), frac(1))
  }) && [9, 10, 11, 12, 13, 14, 15, 16, 17].every((q) => eq(council(q).ss.reduce(add, ZERO), frac(1))))
  const rnd = mulberry32(12)
  let ok = 0
  for (let k = 0; k < 60; k++) {
    const n = 2 + (k % 11)
    const w = Array.from({ length: n }, () => Math.floor(rnd() * 21))
    const W = w.reduce((a, b) => a + b, 0)
    const q = 1 + Math.floor(rnd() * Math.max(1, W))
    const dp = powerIndices(w, q)
    const en = powerByEnumeration(w, q)
    if (sameFr(dp.ss, en.ss) && dp.swings.join() === en.swings.join()) ok++
  }
  check('the dynamic programme agrees with enumeration on 60 random games of 2 to 12 players (weights 0 to 20, zero weights included)', ok === 60, `${ok}`)
  check('the 1958 Council and 49–49–2: the dynamic programme agrees with enumeration', [9, 12, 13, 17].every((q) => sameFr(council(q).ss, powerByEnumeration(COUNCIL_WEIGHTS, q).ss)) && sameFr(powerIndices([49, 49, 2], 51).ss, powerByEnumeration([49, 49, 2], 51).ss))
  {
    const w30 = Array.from({ length: 30 }, (_, i) => 100 - 3 * i)
    const t = performance.now()
    const r = powerIndices(w30, Math.ceil(w30.reduce((a, b) => a + b, 0) / 2))
    const ms = performance.now() - t
    info(`Panel B with 30 players (weights 100, 97, …, 13): ${Math.round(ms)} ms in Node`)
    check('30 players: the indices add up to 1 exactly', eq(r.ss.reduce(add, ZERO), frac(1)) && eq(r.banzhaf.reduce(add, ZERO), frac(1)))
  }
}

// ------------------------------------------------------------------ Bankruptcy

console.log('— Panel C: the estate')
const D3 = [100, 200, 300]
{
  const TABLE = {
    100: [['16.67', '33.33', '50.00'], ['33.33', '33.33', '33.33'], ['0.00', '0.00', '100.00'], ['33.33', '33.33', '33.33'], ['33.33', '33.33', '33.33']],
    150: [['25.00', '50.00', '75.00'], ['50.00', '50.00', '50.00'], ['0.00', '25.00', '125.00'], ['50.00', '50.00', '50.00'], ['33.33', '58.33', '58.33']],
    200: [['33.33', '66.67', '100.00'], ['66.67', '66.67', '66.67'], ['0.00', '50.00', '150.00'], ['50.00', '75.00', '75.00'], ['33.33', '83.33', '83.33']],
    250: [['41.67', '83.33', '125.00'], ['83.33', '83.33', '83.33'], ['0.00', '75.00', '175.00'], ['50.00', '100.00', '100.00'], ['41.67', '91.67', '116.67']],
    300: [['50.00', '100.00', '150.00'], ['100.00', '100.00', '100.00'], ['0.00', '100.00', '200.00'], ['50.00', '100.00', '150.00'], ['50.00', '100.00', '150.00']],
    400: [['66.67', '133.33', '200.00'], ['100.00', '150.00', '150.00'], ['33.33', '133.33', '233.33'], ['50.00', '125.00', '225.00'], ['66.67', '116.67', '216.67']],
    500: [['83.33', '166.67', '250.00'], ['100.00', '200.00', '200.00'], ['66.67', '166.67', '266.67'], ['66.67', '166.67', '266.67'], ['66.67', '166.67', '266.67']],
  }
  for (const [E, want] of Object.entries(TABLE)) {
    const r = allRules(D3, Number(E))
    const got = RULES.map((k) => r[k].map(f2))
    const nuc = nucleolus(estateGame(D3, Number(E))).x
    check(`claims 100, 200, 300, E = ${E}: proportional; equal awards; equal losses; Talmud; Shapley as the prompt, and the nucleolus is the Talmud's division`, got.every((row, i) => row.join() === want[i].join()) && sameFr(nuc, r.talmud), got.map((row) => row.join(' ')).join(' | '))
  }
  check("the Talmud's three estates: 100 equally, 200 as 50, 75, 75, 300 as 50, 100, 150 (exact)", sameFr(talmud(D3, 100), ['100/3', '100/3', '100/3']) && sameFr(talmud(D3, 200), [50, 75, 75]) && sameFr(talmud(D3, 300), [50, 100, 150]))
  check('at E = 200: proportional 100/3, 200/3, 100; equal awards 200/3 each; Shapley 100/3, 250/3, 250/3', sameFr(proportional(D3, 200), ['100/3', '200/3', 100]) && sameFr(cea(D3, 200), ['200/3', '200/3', '200/3']) && sameFr(shapleyRule(D3, 200), ['100/3', '250/3', '250/3']))
  // Every rule gives out exactly E, no one above her claim or below 0; random arrival = Shapley.
  let ok = 0
  let tot = 0
  let nucOk = 0
  let nucTot = 0
  const t = performance.now()
  for (const d1 of [0, 50, 100, 200]) for (const d2 of [100, 150, 300]) for (const d3 of [100, 250, 400]) {
    const d = [d1, d2, d3]
    const D = d1 + d2 + d3
    for (let E = 0; E <= D; E += 25) {
      tot++
      const r = allRules(d, E)
      const good = RULES.every((k) => eq(r[k].reduce(add, ZERO), frac(E)) && r[k].every((x, i) => x.n >= 0n && cmp(x, frac(d[i])) <= 0)) && sameFr(r.shapley, randomArrival(d, E))
      if (good) ok++
      if (E % 50 === 0) {
        nucTot++
        if (sameFr(nucleolus(estateGame(d, E)).x, r.talmud)) nucOk++
      }
    }
  }
  check(`on a grid of 36 claim vectors and estates in steps of 25 (${tot} problems): every rule gives out exactly E, no one above her claim or below 0, and the Shapley value equals random arrival (O'Neill)`, ok === tot, `${ok} of ${tot}`)
  check(`the nucleolus by sequential LPs equals the Talmud's rule on the same grid in steps of 50 (${nucTot} problems)`, nucOk === nucTot, `${nucOk} of ${nucTot}; ${Math.round(performance.now() - t)} ms`)
  // By hand: the satisfactions are x_A, x_B, x_C, 30 − x_C, 40 − x_B and
  // x_B + x_C − 40; with x_C ≤ 30 − t and x_B ≤ 40 − t the last is at most
  // 30 − 2t, so the best level is t = 10, at x_C = 20, x_B = 30.
  check('the nucleolus outside bankruptcy, solved by hand: the partners (50, 30, 20), every pair 10 above its worth; majority of 3: 1/3 each', sameFr(nucleolus(P(70, 60, 40)).x, [50, 30, 20]) && sameFr(nucleolus(presetGame('majority', 3)).x, ['1/3', '1/3', '1/3']))
  check('the contested garment (claims 1/2 and 1 of a garment worth 1): the Talmud gives 1/4 and 3/4', sameFr(talmud([fr('1/2'), 1], 1), ['1/4', '3/4']))
  check('Talmud rule with two creditors = the contested garment for every estate on a grid (each concedes what she does not claim, the rest is split equally)', (() => {
    let good = true
    for (const [a, b] of [[100, 200], [50, 300], [120, 120]]) for (let E = 0; E <= a + b; E += 10) {
      // b concedes to a what b does not claim, E − b (if positive), and a to
      // b likewise; what is left, claimed by both, is split equally.
      const conA = Math.max(0, E - b)
      const conB = Math.max(0, E - a)
      const rest = E - conA - conB
      const want = [frac(2 * conA + rest, 2), frac(2 * conB + rest, 2)]
      if (!sameFr(talmud([a, b], E), want)) good = false
    }
    return good
  })())
  const tc = performance.now()
  for (const rule of RULES) curves(rule, [500, 500, 500])
  info(`Panel C chart: the five rules over E = 0 to 1500 in steps of 5: ${Math.round(performance.now() - tc)} ms`)
}

// ------------------------------------------------------------------ The box

console.log('— The box: variance')
const HASH = { network: 1e21, miner: 1e15 } // H/s: 1 ZH/s and 1 PH/s
const BLOCKS_YEAR = 365 * 144
{
  const share = HASH.miner / HASH.network
  const perYear = share * BLOCKS_YEAR
  check('52,560 blocks a year (365 × 144)', BLOCKS_YEAR === 52560)
  check(`at 1 ZH/s a 1 PH/s miner has a share of one in a million and finds a block every ${(1 / perYear).toFixed(1)} years on average (about 19)`, share === 1e-6 && Math.round(1 / perYear) === 19, `${(1 / perYear).toFixed(2)}`)
}

// ------------------------------------------------------------------ Quoted on the page

const dir = 'src/components/lab/game-theory/coalitions-sharing'
const textsFile = resolve(root, `${dir}/texts.js`)
const lectureFile = (l) => `src/content/game-theory-lab/coalitions-sharing.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en'))) && existsSync(resolve(root, lectureFile('it')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')).replace(/\r/g, ''), it: read(lectureFile('it')).replace(/\r/g, '') }
  const itn = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // decimals the Italian way
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : itn(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const tup = (xs) => `(${xs.map(show).join(', ')})`
  const d2 = (xs) => xs.map(f2).join(', ')
  const body = { en: lecture.en.split(/<!--\s*simulation\s*-->/)[0], it: lecture.it.split(/<!--\s*simulation\s*-->/)[0] }
  const boxText = { en: (body.en.match(/```box[\s\S]*?```/) || [''])[0], it: (body.it.match(/```box[\s\S]*?```/) || [''])[0] }
  const noBox = { en: body.en.replace(/```box[\s\S]*?```/, ''), it: body.it.replace(/```box[\s\S]*?```/, '') }

  // ---- The lecture
  const partners = P(70, 60, 40)
  const sh = shapley3(70, 60, 40)
  check('lecture: the partners\' worths are the code\'s (70, 60, 40, 100) and the sum of the pairs is 170', partners.v[3].n === 70n && partners.v[5].n === 60n && partners.v[6].n === 40n && partners.v[7].n === 100n)
  quoted('lecture: the partners and the core', lecture, [
    ['A and B together can earn 70, A and C 60, B and C 40, and all three 100', 'A e B insieme possono guadagnare 70, A e C 60, B e C 40, e tutti e tre 100'],
    'x_C ≤ 100 − 70 = 30', 'x_B ≤ 40', 'x_A ≤ 60', ...coreCorners3(partners).map(tup),
    ['the pairs need 150 when there is 100 to share', 'le coppie chiedono 150 quando c\'è 100 da dividere'], '2(x_A + x_B + x_C) ≥ 300',
    ['the sum is 170, below 200', 'la somma è 170, sotto 200'],
  ])
  check('lecture: with every pair 100 the pairs ask for 150 and the core is empty', !coreTest(P(100, 100, 100)).nonempty && (100 + 100 + 100) / 2 === 150)
  // "a, b and c" in English, "a, b e c" in Italian.
  const and3 = (xs) => [`${xs[0]}, ${xs[1]} and ${xs[2]}`, `${itn(xs[0])}, ${itn(xs[1])} e ${itn(xs[2])}`]
  quoted('lecture: C\'s arrivals and the Shapley value', lecture, [
    ['after A alone she adds 60; after B alone, 40; last, 100 − 70 = 30', 'dopo il solo A aggiunge 60; dopo il solo B, 40; per ultimo, 100 − 70 = 30'],
    and3(sh.map(show)), and3(sh.map(f2)), and3(shapley3(90, 60, 40).map(show)),
    ['A and B would get 80, and they could make 90', 'A e B riceverebbero 80, e da soli potrebbero fare 90'],
  ])
  check('lecture: C adds 0, 60, 40 and 30 in the partners\' orders', [partners.v[4], sub(partners.v[5], partners.v[1]), sub(partners.v[6], partners.v[2]), sub(partners.v[7], partners.v[3])].map(show).join() === '0,60,40,30')
  quoted('lecture: gloves', lecture, [['each left glove 1/6 and the right glove 2/3', 'dà 1/6 a ogni guanto sinistro e 2/3 al destro'], tup(A.gloves3.least.x)])
  check('lecture: the gloves\' numbers are the code\'s', sameFr(A.gloves3.phi, ['1/6', '1/6', '2/3']) && sameFr(A.gloves3.least.x, [0, 0, 1]))
  quoted('lecture: the Council and the parties', lecture, [
    ['France, Germany and Italy had 4 votes each, Belgium and the Netherlands 2, Luxembourg 1', 'Francia, Germania e Italia avevano 4 voti ciascuna, Belgio e Paesi Bassi 2, il Lussemburgo 1'],
    ['12 of the 17', '12 voti su 17'], ['from 9 to 17', 'da 9 a 17'], ['49, 49 and 2 seats and a majority of 51', '49, 49 e 2 seggi e una maggioranza di 51'], ['1/3 each', '1/3 ciascuno'],
    ['an act proposed by the Commission', 'un atto proposto dalla Commissione'],
  ])
  check('lecture: the Council\'s weights and quota are the code\'s; Luxembourg 0 at 12; 49–49–2 a third each', COUNCIL_WEIGHTS.join() === '4,4,4,2,2,1' && VOTING_PRESETS.council.quota === 12 && council(12).ss[5].n === 0n && sameFr(powerIndices([49, 49, 2], 51).ss, ['1/3', '1/3', '1/3']))
  const t2 = talmud(D3, 200)
  quoted('lecture: the estate', lecture, [
    ['100, 200 and 300', '100, 200 e 300'], ['an estate of 200 as 50, 75 and 75', 'una di 200 come 50, 75 e 75'], ['300 as 50, 100 and 150', 'una di 300 come 50, 100 e 150'],
    ['the shares are 3/4 and 1/4', 'le quote sono 3/4 e 1/4'],
    [`proportional division gives ${d2(proportional(D3, 200)).replace('100.00', '100').replace(/, (?=[^,]*$)/, ' and ')}`, `la divisione proporzionale dà ${itn(d2(proportional(D3, 200))).replace('100,00', '100').replace(/, (?=[^,]*$)/, ' e ')}`],
    ((p) => [`gives ${p[0]}`, `dà ${p[1]}`])(and3(shapleyRule(D3, 200).map(f2))),
    ['Ketubot 93a', 'Ketubot 93a'], ['Bava Metzia 2a', 'Bava Metzia 2a'],
  ])
  check('lecture: the three estates are the code\'s Talmud', sameFr(talmud(D3, 100), ['100/3', '100/3', '100/3']) && sameFr(t2, [50, 75, 75]) && sameFr(talmud(D3, 300), [50, 100, 150]))
  // ---- The box
  {
    const avg = 1019e18 // H/s, the 30-day average quoted
    const years1 = 1 / ((HASH.miner / HASH.network) * BLOCKS_YEAR)
    const yearsAvg = 1 / ((HASH.miner / avg) * BLOCKS_YEAR)
    quoted('the box: hash rate and variance', boxText, [
      ['1,019 EH/s on 23 November', '1.019 EH/s il 23 novembre'], ['about 1 ZH/s', 'circa 1 ZH/s'], ['1 PH/s', '1 PH/s'], ['one in a million', 'uno su un milione'],
      ['52,560 blocks a year', '52.560 blocchi all\'anno'], [`one every ${Math.round(years1)} years`, `uno ogni ${Math.round(years1)} anni`],
    ])
    check(`the box: at 1,019 EH/s the 19 years become ${yearsAvg.toFixed(1)}, still "about 19" rounded; the text computes at 1 ZH/s`, Math.round(yearsAvg) === 19)
    const p51 = pools(51)
    const split = powerIndices(splitLargest(POOL_SHARES.map((w, i) => ({ name: `P${i + 1}`, weight: w }))).map((x) => x.weight), 51)
    const pc = (x) => `${Math.round(100 * x)}%`
    quoted('the box: power of the illustrative pools', boxText, [
      ['26% of the hash rate holds about ' + pc(toNumber(p51.ss[0])), '26% dell\'hash rate ha circa il ' + pc(toNumber(p51.ss[0]))],
      ['two pools of 13%', 'due pool del 13%'], ['about ' + pc(toNumber(add(split.ss[0], split.ss[1]))), 'circa il ' + pc(toNumber(add(split.ss[0], split.ss[1])))],
    ])
    check('the box names the authors as the papers do and calls the reading a hypothesis', ['en', 'it'].every((l) => ['Rosenfeld', 'Hougaard', 'Pourpouneh', 'Lewenberg', 'Sompolinsky', 'Rosenschein'].every((a) => boxText[l].includes(a))) && boxText.en.includes('a hypothesis, not a description') && boxText.it.includes('un\'ipotesi, non una descrizione'))
  }
  // ---- What to observe
  quoted('observe, Panel A', observe.coalitions, [
    and3(A.partners.phi.map(show)), ['the 6 orders', 'i 6 ordini'],
    [`minimum is ${show(A.partners.core.min)}`, `minimo del programma lineare è ${show(A.partners.core.min)}`], tup(A.partners.least.x),
    ['C adds 40 to B alone and only 30', 'C aggiunge 40 al solo B e solo 30'],
    and3(A.partners90.phi.map(show)), [`${show(A.partners90.shapleyObjections[0].by)} more`, `${show(A.partners90.shapleyObjections[0].by)} in più`],
    [`(minimum ${show(A.partners90.core.min)})`, `(minimo ${show(A.partners90.core.min)})`],
    [A.majority3, A.majority4, A.majority5].map((m) => show(m.core.min)).join(', '),
    [`ε = ${and3([A.majority3, A.majority4, A.majority5].map((m) => show(m.least.eps)))[0]}`, `ε = ${and3([A.majority3, A.majority4, A.majority5].map((m) => show(m.least.eps)))[1]}`],
    and3(A.gloves3.phi.map(show)), tup(A.gloves3.least.x),
    show(A.gloves5.phi[0]), show(A.gloves5.phi[2]), tup(A.gloves5.least.x),
    and3(A.airport.phi.map(show)), `v(N) = ${show(A.airport.value.v[7])}`,
  ])
  check('observe, Panel A: the facts behind the words', A.partners.core.nonempty && A.partners.shapleyIn && !A.partners.convex && A.partners90.core.nonempty && !A.partners90.shapleyIn && [A.majority3, A.majority4, A.majority5].every((m) => !m.core.nonempty) && A.airport.convex && A.airport.shapleyIn && [3, 4, 5].every((n) => A[`unanimity${n}`].phi.slice(2).every((x) => x.n === 0n)) && eq(A.majority5.least.eps, fr('2/5')))
  {
    const c = council(12)
    const p = pools(51)
    const n4 = (x) => f4(x)
    const s51 = powerIndices(splitLargest(POOL_SHARES.map((w, i) => ({ name: `P${i + 1}`, weight: w }))).map((x) => x.weight), 51)
    quoted('observe, Panel B', observe.voting, [
      n4(c.ss[0]), n4(c.ss[3]), n4(c.ss[5]), n4(c.banzhaf[0]), n4(c.banzhaf[3]), n4(c.absolute[0]), n4(c.absolute[3]), [`${c.totalSwings} swings`, `${c.totalSwings} in tutto`],
      n4(powerIndices([49, 49, 2], 51).ss[0]),
      ...[0, 1, 3, 5].flatMap((i) => [n4(p.ss[i]), n4(p.banzhaf[i])]),
      n4(pools(26).ss[0]), [0, 1, 3, 5].map((i) => n4(pools(34).ss[i])).join(', '),
      ['1, 2, 3 and 4', '1, 2, 3 e 4'], n4(s51.ss[0]), toNumber(add(s51.ss[0], s51.ss[1])).toFixed(4), n4(s51.ss[2]),
    ])
    check('observe, Panel B: three of the largest at the Council\'s 12 and at the pools\' 51; 34 and 67 dual', c.needed === 3 && p.needed === 3 && sameFr(pools(34).ss, pools(67).ss))
  }
  {
    const r = allRules(D3, 200)
    const row = (xs) => d2(xs)
    const c1 = []
    for (let E = 0; E <= 600; E += 5) if (eq(talmud(D3, E)[0], frac(50))) c1.push(E)
    const r450 = allRules(D3, 450)
    quoted('observe, Panel C', observe.estate, [
      '50, 75, 75', row(r.proportional), row(r.cea).split(', ')[0], row(r.cel), row(r.shapley),
      d2(talmud(D3, 100)).split(', ')[0], ['E = 150 to E = 450', 'E = 150 a E = 450'], ['to 100 at 600', 'fino a 100 con 600'],
      d2(r450.talmud).replace(/\.00/g, ''), row(r450.shapley),
    ].map((p) => (Array.isArray(p) ? p : [p.trim(), itn(p.trim())])))
    check('observe, Panel C: the first creditor is at 50 exactly from E = 150 to 450, Talmud = CEA at 100, = proportional = Shapley at 300, = CEL at 450; all claims paid at 600', c1[0] === 150 && c1.at(-1) === 450 && c1.length === 61 && sameFr(talmud(D3, 100), cea(D3, 100)) && sameFr(talmud(D3, 300), proportional(D3, 300)) && sameFr(talmud(D3, 300), shapleyRule(D3, 300)) && sameFr(r450.talmud, r450.cel) && sameFr(talmud(D3, 600), D3))
  }
  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 1', sol(0), [...coreCorners3(partners).map(tup), '125/3', '95/3', '80/3', ['41.67, 31.67, 26.67', '41,67, 31,67, 26,67']])
  quoted('exercise 2', sol(1), [...coreCorners3(P(90, 60, 40)).map(tup), ['45, 35 and 20', '45, 35 e 20'], ['get 80 and could make 90', 'ricevono 80 e da soli potrebbero fare 90']])
  quoted('exercise 3', sol(2), ['200 ≥ 300', '200 ≥ 240', '200 ≥ 180', ...coreCorners3(P(60, 60, 60)).map(tup)])
  check('exercise 3: pairs 100 and 80 empty, 60 the triangle', !coreTest(P(100, 100, 100)).nonempty && !coreTest(P(80, 80, 80)).nonempty && coreCorners3(P(60, 60, 60)).length === 3)
  quoted('exercise 4', sol(3), ['2/3', '1/6', tup(A.gloves3.least.x), ['4 of the 6 orders', '4 dei 6 ordini']])
  quoted('exercise 5', sol(4), ['7/30', '3/20', '13/60', '7/60'])
  check('exercise 5: the fractions are the code\'s', sameFr(council(12).ss, ['7/30', '7/30', '7/30', '3/20', '3/20', 0]) && sameFr(council(13).ss, ['13/60', '13/60', '13/60', '7/60', '7/60', '7/60']))
  quoted('exercise 6', sol(5), ['50, 75, 75', ['33.33, 66.67, 100', '33,33, 66,67, 100'], ['66.67 each', '66,67 ciascuno'], ['33.33, 83.33, 83.33', '33,33, 83,33, 83,33'], ['200, 200, 100, 0, 0, 0', '200, 200, 100, 0, 0, 0']])
  check('exercise 6: the numbers are the code\'s', sameFr(talmud(D3, 200), [50, 75, 75]) && d2(proportional(D3, 200)) === '33.33, 66.67, 100.00' && d2(cea(D3, 200)) === '66.67, 66.67, 66.67' && d2(shapleyRule(D3, 200)) === '33.33, 83.33, 83.33')
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language (the box not counted), with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(noBox[l]) >= 1400 && words(noBox[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(noBox[l])}, box ${words(boxText[l])}`).join('; '))
  check('the lecture places F1 and F2, has one box after the estate section, and names Bitcoin outside the box only in "Next"', ['en', 'it'].every((l) => /```figure\ncore\n```/.test(body[l]) && /```figure\nvotes\n```/.test(body[l]) && (body[l].match(/```box/g) || []).length === 1 && body[l].indexOf('```box') > body[l].indexOf(l === 'en' ? '## An estate' : "## Un'eredità") && (noBox[l].match(/bitcoin/gi) || []).length === 1))
  const allText = (l) => lecture[l] + Object.values(observe).map((o) => o[l]).join('') + exercises.map((x) => x.statement[l] + x.solution[l]).join('')
  check('the texts never call the course free, and never say peer-reviewed', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l)) && !/peer.reviewed/i.test(allText(l))))
  check('the Italian lecture uses the textbook terms: nucleo (core), valore di Shapley, nucleolo, gioco TU, maggioranza pesata, problema di bancarotta, gioco dei guanti', ['**nucleo** (*core*)', 'valore di Shapley', '**nucleolo**', 'giochi TU', 'maggioranza pesata', 'problema di bancarotta', 'gioco dei guanti', 'contributo marginale', 'giocatore nullo', 'bilanciato'].every((t) => lecture.it.includes(t)))
  check('the reading list has the chapters (Osborne 8, Shoham and Leyton-Brown 12, Jackson 12) and every paper cited in the lecture', ['Ch. 8', 'Ch. 12 (coalitional', 'Ch. 12 (allocation'].every((t) => lecture.en.includes(t)) && ['Gillies', 'Bondareva', 'Shapley, L. S. (1967)', 'Shapley, L. S. (1953)', 'Shapley, L. S. (1971)', 'Littlechild', 'Shubik', 'Banzhaf', 'Penrose', 'Schmeidler', "O'Neill", 'Aumann', 'Rosenfeld', 'Lewenberg', 'Pourpouneh'].every((t) => lecture.en.split('## Further reading')[1].includes(t) && lecture.it.split('## Letture consigliate')[1].includes(t)))
} else {
  info('texts.js or the lectures are not there yet: the "quoted on the page" checks are skipped')
}

info(`total time ${((performance.now() - T0) / 1000).toFixed(1)} s`)
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
