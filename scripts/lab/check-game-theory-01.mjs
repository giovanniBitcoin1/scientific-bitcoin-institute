// Self-checks for Game Theory Lab module 01, "What is a game?". They run the
// same code as the page (games.js, guessing.js, randomgames.js) and compare it
// with exact values, with independent brute-force computations and with the
// numbers the texts quote.
//
//   node scripts/lab/check-game-theory-01.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mulberry32, randInt } from '../../src/components/lab/rng.js'
import {
  makeGame, range, bestResponses, stableCells, dominated, eliminate, dominantStrategy, unbeatenCells, describe,
  F1_PRESETS, CLASSICS, twoByTwo, EXERCISE_1, LECTURE_GAME, RANKINGS, surveyOrdinal, classifyTS,
} from '../../src/components/lab/game-theory/what-is-a-game/games.js'
import {
  SHARE_PRESETS, DEFAULTS, MANY_SEED, P_VALUES, countsOf, factor, expected, levelGuess, firstLevelBelow, roundBelow,
  firstRound, playSequence, sequenceBelow, playMany, rankOf, histogram, moverPayoff, allSayOne,
} from '../../src/components/lab/game-theory/what-is-a-game/guessing.js'
import {
  SIZES, DEFAULT_SIZE, DEFAULT_GAMES, SURVEY_SEED, randomGame, analyze, survey, sampleGame,
} from '../../src/components/lab/game-theory/what-is-a-game/randomgames.js'
import { observe, exercises } from '../../src/components/lab/game-theory/what-is-a-game/texts.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')
const lecture = { en: read('src/content/game-theory-lab/what-is-a-game.en.md'), it: read('src/content/game-theory-lab/what-is-a-game.it.md') }

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol) => Math.abs(a - b) <= tol
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const it = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // numbers written the Italian way
const cells = (g, list) => list.map(([i, j]) => `(${g.rows[i]}, ${g.cols[j]})`).join(' ')
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const stepsOf = (g, e) => e.steps.map((s) => (s.player === 'row' ? g.rows : g.cols)[s.index]).join(' ')

// ------------------------------------------------- Independent brute force

// Pure equilibria straight from the definition, with no best-response marks.
function bruteStable(g) {
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

// ---------------------------------------------------------------- Panel A

console.log('— Panel A: the classic games')
{
  const pd = describe(twoByTwo(CLASSICS.pd, ['C', 'D'], ['C', 'D']))
  check("Prisoner's Dilemma: C dominated for both, solved at (D, D)", pd.dominated.length === 2 && pd.dominated.every((s) => s.index === 0 && s.by === 1) && pd.solved && same(pd.elimination.rows, [1]) && same(pd.elimination.cols, [1]) && same(pd.stable, [[1, 1]]))
  check("Prisoner's Dilemma: (D, D) is the only cell beaten for both", same(pd.unbeaten, [[0, 0], [0, 1], [1, 0]]))
  const two = { stag: [[0, 0], [1, 1]], chicken: [[0, 1], [1, 0]], battle: [[0, 0], [1, 1]], coordination: [[0, 0], [1, 1]] }
  for (const [id, expectedCells] of Object.entries(two)) {
    const d = describe(twoByTwo(CLASSICS[id]))
    check(`${id}: nothing dominated, two stable cells ${id === 'chicken' ? 'off' : 'on'} the diagonal`, d.dominated.length === 0 && !d.solved && same(d.stable, expectedCells), JSON.stringify(d.stable))
  }
  const mp = describe(twoByTwo(CLASSICS.pennies))
  check('matching pennies: nothing dominated, no stable cell', mp.dominated.length === 0 && mp.stable.length === 0)
  const edited = describe(twoByTwo([[6, 3], [0, 5], [5, 0], [1, 1]]))
  check('PD with the row payoff of (C, C) raised to 6: only the column C is dominated, still solved at (D, D) in two steps', edited.dominated.length === 1 && edited.dominated[0].player === 'col' && edited.solved && edited.elimination.steps.length === 2 && edited.elimination.steps[0].player === 'col' && same(edited.elimination.rows, [1]) && same(edited.elimination.cols, [1]))
  const lg = eliminate(LECTURE_GAME)
  check('first table of the lecture: U goes, then L; (D, R) is left; the column player has nothing dominated at the start', stepsOf(LECTURE_GAME, lg) === 'U L' && same(lg.rows, [1]) && same(lg.cols, [1]) && dominated(LECTURE_GAME).length === 1)
}

console.log('— Figure F1')
{
  const four = eliminate(F1_PRESETS.four)
  check('"Four steps": R, U, M, L go; (D, C) is left', stepsOf(F1_PRESETS.four, four) === 'R U M L' && same(four.rows, [2]) && same(four.cols, [1]), stepsOf(F1_PRESETS.four, four))
  check('"Four steps": R is deleted because of L, U and M because of D, L because of C', same(four.steps.map((s) => s.by), [0, 2, 2, 1]))
  const half = eliminate(F1_PRESETS.halfway)
  const left = stableCells(F1_PRESETS.halfway, half.rows, half.cols)
  check('"Stops half-way": R then U go; a 2 × 2 game is left with stable cells (M, L) and (D, C)', stepsOf(F1_PRESETS.halfway, half) === 'R U' && same(half.rows, [1, 2]) && same(half.cols, [0, 1]) && cells(F1_PRESETS.halfway, left) === '(M, L) (D, C)', cells(F1_PRESETS.halfway, left))
  const none = eliminate(F1_PRESETS.nothing)
  check('"Nothing to delete": nothing dominated, one stable cell (M, C)', none.steps.length === 0 && cells(F1_PRESETS.nothing, stableCells(F1_PRESETS.nothing)) === '(M, C)')
}

console.log('— Elimination and stable cells against brute force')
{
  const random = mulberry32(11)
  let orderOk = true
  let stableOk = true
  let keepOk = true
  let games = 0
  for (let k = 0; k < 2000; k++) {
    const m = 2 + randInt(random, 4)
    const n = 2 + randInt(random, 4)
    // Whole payoffs 0–5, so ties are common.
    const g = makeGame(range(m).map(String), range(n).map(String), range(m).map(() => range(n).map(() => [randInt(random, 6), randInt(random, 6)])))
    const first = eliminate(g)
    const last = eliminate(g, (list) => list[list.length - 1])
    const any = eliminate(g, (list) => list[randInt(random, list.length)])
    if (!same(first.rows, last.rows) || !same(first.cols, last.cols) || !same(first.rows, any.rows) || !same(first.cols, any.cols)) orderOk = false
    if (!same(stableCells(g), bruteStable(g))) stableOk = false
    // Elimination never deletes a stable cell.
    if (!bruteStable(g).every(([i, j]) => first.rows.includes(i) && first.cols.includes(j))) keepOk = false
    games++
  }
  check(`${games} random games with ties: what is left does not depend on the order of deletion`, orderOk)
  check(`${games} random games with ties: stable cells equal the brute-force equilibria`, stableOk)
  check(`${games} random games with ties: no stable cell is ever deleted`, keepOk)
}

// ------------------------------------------------------- The 576 tables

console.log('— Survey of the 576 ordinal tables')
const sv = surveyOrdinal()
{
  check('576 tables from 24 rankings each', RANKINGS.length === 24 && sv.total === 576)
  check('stable cells 0, 1, 2 in 72, 432, 72 tables', same(sv.stable, [72, 432, 72]), sv.stable.join(', '))
  check('dominant strategy for both 144, for one 288, for neither 144', sv.dominant.both === 144 && sv.dominant.one === 288 && sv.dominant.neither === 144)
  check('solved by elimination: 432', sv.solved === 432)
  check("like the Prisoner's Dilemma: 4 tables", sv.pdLike === 4)
  check('144 games when strategies are renamed: 18, 108, 18 with 0, 1, 2 stable cells', sv.renamed.total === 144 && same(sv.renamed.stable, [18, 108, 18]))
  check('of the 144: both dominant in 36 (a quarter), solved 108 (three quarters), one like the PD', sv.renamed.both === 36 && sv.renamed.solved === 108 && sv.renamed.pdLike === 1)
  check('78 games when the players are also swapped: 9, 57, 12; one like the PD', sv.swapped.total === 78 && same(sv.swapped.stable, [9, 57, 12]) && sv.swapped.pdLike === 1)
  check('12 symmetric ordinal games (24 symmetric tables)', sv.swapped.symmetric === 12 && sv.symmetricTables === 24)
  // One player's 24 rankings: 12 give a dominant strategy.
  const withDominant = RANKINGS.filter((a) => (a[0] > a[2]) === (a[1] > a[3])).length
  check("exercise 4: 12 of one player's 24 rankings give a dominant strategy; at least one player has one in 432 tables", withDominant === 12 && sv.dominant.both + sv.dominant.one === 432)
}

// ------------------------------------------------------------- Figure F2

console.log('— Figure F2: the map of symmetric games')
{
  const want = [
    [1.5, -0.5, 'pd', 'D', [['D', 'D']]],
    [0.5, -0.5, 'stag', null, [['C', 'C'], ['D', 'D']]],
    [1.5, 0.5, 'chicken', null, [['C', 'D'], ['D', 'C']]],
    [0.5, 0.5, 'harmony', 'C', [['C', 'C']]],
  ]
  for (const [T, S, region, dom, stable] of want) {
    const c = classifyTS(T, S)
    check(`(T, S) = (${T}, ${S}): ${region}, dominant ${dom || 'none'}, stable ${stable.map((x) => `(${x})`).join(' ')}`, c.region === region && c.dominant === dom && same(c.stable, stable) && !c.border)
  }
  let borders = 0
  let inside = 0
  let wrong = 0
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= 40; b++) {
      const T = Math.round(a * 5) / 100
      const S = Math.round(b * 5 - 100) / 100
      const c = classifyTS(T, S)
      if (c.border) borders++
      else {
        inside++
        const n = c.stable.length
        if ((c.region === 'pd' || c.region === 'harmony') !== (n === 1 && c.dominant != null)) wrong++
        if ((c.region === 'stag' || c.region === 'chicken') !== (n === 2 && c.dominant == null)) wrong++
      }
    }
  }
  check('every point of the 0.05 grid: T = 1 or S = 0 is "on the border" (81 points), the others have 1 stable cell and a dominant strategy (PD, harmony) or 2 and none (stag hunt, chicken)', borders === 81 && inside === 1600 && wrong === 0, `${borders} border, ${inside} inside, ${wrong} wrong`)
}

// ----------------------------------------------------------- Guessing game

console.log('— Guessing game: exact values')
const D = SHARE_PRESETS
const base = { N: DEFAULTS.N, p: DEFAULTS.p, sigma: DEFAULTS.sigma, shares: D.default }
{
  check('levels 1 to 4 at p = 2/3: 33.33, 22.22, 14.81, 9.88', same([1, 2, 3, 4].map((k) => f2(levelGuess(k, 2 / 3))), ['33.33', '22.22', '14.81', '9.88']))
  check('bounds of the elimination: 66.7, 44.4, 29.6, 19.8, 13.2', same([1, 2, 3, 4, 5].map((k) => (100 * (2 / 3) ** k).toFixed(1)), ['66.7', '44.4', '29.6', '19.8', '13.2']))
  check('first level below 1: level 10 (0.87; level 9 says 1.30); p = 1/2 level 6 (0.78); p = 0.9 level 38 (0.91)', firstLevelBelow(2 / 3) === 10 && f2(levelGuess(10, 2 / 3)) === '0.87' && f2(levelGuess(9, 2 / 3)) === '1.30' && firstLevelBelow(0.5) === 6 && f2(levelGuess(6, 0.5)) === '0.78' && firstLevelBelow(0.9) === 38 && f2(levelGuess(38, 0.9)) === '0.91')
  const ex = (shares, p) => expected(shares, p)
  const pair = (e) => `${f2(e.mean)} ${f2(e.target)}`
  check('default: f = 0.5963, expected mean 29.81, target 19.88', factor(D.default, 2 / 3).toFixed(4) === '0.5963' && pair(ex(D.default, 2 / 3)) === '29.81 19.88', pair(ex(D.default, 2 / 3)))
  check('deep thinkers: 15.56 and 10.37', pair(ex(D.deep, 2 / 3)) === '15.56 10.37')
  check('half at equilibrium: 14.26 and 9.51', pair(ex(D.half, 2 / 3)) === '14.26 9.51')
  check('default shares, p = 0.9: 41.55 and 37.39', pair(ex(D.default, 0.9)) === '41.55 37.39', pair(ex(D.default, 0.9)))
  const half = ex(D.default, 0.5)
  check('default shares, p = 1/2: 23.12 and 11.56 (exactly 23.125 and 11.5625)', close(half.mean, 23.125, 1e-9) && close(half.target, 11.5625, 1e-9), `${half.mean} ${half.target}`)
  check('counts: default 200, 350, 300, 100, 50 of 1,000; they always sum to N', same(countsOf(1000, D.default), [200, 350, 300, 100, 50]) && [100, 700, 1300, 5000].every((n) => [D.default, D.deep, D.half, [0.3, 0.3, 0.3, 0.05, 0.05], [1, 1, 1, 1, 1], [0.15, 0.15, 0.15, 0.15, 0.15]].every((s) => countsOf(n, s).reduce((x, y) => x + y, 0) === n && countsOf(n, s).every((c) => c >= 0))))
  check('the slider of p passes through 1/2, 2/3 and 0.9', P_VALUES.includes(0.5) && P_VALUES.includes(2 / 3) && P_VALUES.includes(0.9) && P_VALUES.every((v, i) => i === 0 || v > P_VALUES[i - 1]))
}

console.log('— Guessing game: one round')
const round1 = firstRound(base)
{
  let sum = 0
  for (const g of round1.guesses) sum += g
  let best = 0
  round1.guesses.forEach((g, i) => {
    if (Math.abs(g - round1.target) < Math.abs(round1.guesses[best] - round1.target)) best = i
  })
  check('the round: mean, target = p × mean and the winner agree with a direct computation', close(sum / 1000, round1.mean, 1e-9) && close(round1.target, (2 / 3) * round1.mean, 1e-12) && best === round1.winner)
  let inRange = true
  for (const g of round1.guesses) if (g < 0 || g > 100) inRange = false
  const h = histogram(round1)
  check('every guess is between 0 and 100; the histogram holds all 1,000', inRange && h.flat().reduce((x, y) => x + y, 0) === 1000 && same(h.map((row) => row.reduce((x, y) => x + y, 0)), [200, 350, 300, 100, 50]))
  check('rank of a guess: the target itself comes first, 100 comes last', rankOf(round1, round1.target) === 1 && rankOf(round1, 100) >= 990)
  info(`the round on the page: mean ${f2(round1.mean)}, target ${f2(round1.target)}, winning guess ${f2(round1.winnerGuess)}, kind ${round1.winnerKind}`)
}

console.log('— Guessing game: 1,000 plays, N = 1,000, σ = 2')
const many = {
  default: playMany(base),
  deep: playMany({ ...base, shares: D.deep }),
  half: playMany({ ...base, shares: D.half }),
  p09: playMany({ ...base, p: 0.9 }),
  p05: playMany({ ...base, p: 0.5 }),
}
{
  const within = (m, e) => close(m.mean, e.mean, 0.2) && close(m.target, e.target, 0.2)
  check('simulated means and targets within 0.2 of the exact values (default, deep thinkers, half at equilibrium, p = 0.9, p = 1/2)', within(many.default, expected(D.default, 2 / 3)) && within(many.deep, expected(D.deep, 2 / 3)) && within(many.half, expected(D.half, 2 / 3)) && within(many.p09, expected(D.default, 0.9)) && within(many.p05, expected(D.default, 0.5)), `default ${f2(many.default.mean)} ${f2(many.default.target)}; deep ${f2(many.deep.mean)} ${f2(many.deep.target)}; half ${f2(many.half.mean)} ${f2(many.half.target)}; p 0.9 ${f2(many.p09.mean)} ${f2(many.p09.target)}; p 1/2 ${f2(many.p05.mean)} ${f2(many.p05.target)}`)
  check('default: level 2 wins more than 850 times', many.default.wins[2] > 850, `wins by kind ${many.default.wins.join(' / ')}`)
  check('deep thinkers: level 3 wins every time', many.deep.wins[3] === 1000)
  info(`default, mean distance from the target by kind: ${many.default.dist.map((d) => d.toFixed(1)).join(' / ')}  (expected 34.0 / 13.5 / 2.6 / 5.1 / 19.9)`)
  info(`half at equilibrium, wins by kind: ${many.half.wins.join(' / ')}  (expected level 0 about 575, level 3 about 425); distances ${many.half.dist.map((d) => d.toFixed(1)).join(' / ')}`)
  info(`default with p = 0.9, wins by kind: ${many.p09.wins.join(' / ')}  (expected level 2 about 490, level 3 about 460)`)
  info(`default with p = 1/2, wins by kind: ${many.p05.wins.join(' / ')}`)
  // Ten other seeds, to say how far these counts swing.
  const sweep = (cfg) => range(10).map((s) => playMany({ ...base, ...cfg, seed: 7001 + s }).wins)
  const span = (list, k) => `${Math.min(...list.map((w) => w[k]))}–${Math.max(...list.map((w) => w[k]))}`
  const sd = sweep({})
  const sh = sweep({ shares: D.half })
  const s9 = sweep({ p: 0.9 })
  check('ten other seeds, default: level 2 always wins more than 850 times', sd.every((w) => w[2] > 850), `level 2 ${span(sd, 2)}, level 0 ${span(sd, 0)}, level 3 ${span(sd, 3)}`)
  info(`ten other seeds, half at equilibrium: level 0 ${span(sh, 0)}, level 3 ${span(sh, 3)}`)
  info(`ten other seeds, p = 0.9: level 2 ${span(s9, 2)}, level 3 ${span(s9, 3)}`)
  check('the experiment has a fixed seed: two runs give the same counts', same(playMany(base).wins, many.default.wins) && MANY_SEED === 4200)
}

console.log('— Guessing game: play again')
const seq = playSequence({ ...base, rounds: 40 })
{
  const fDefault = factor(D.default, 2 / 3)
  check('50 f^t falls below 1 in round 8 (default), 22 (p = 0.9), 6 (p = 1/2), 4 (deep thinkers)', roundBelow(fDefault) === 8 && roundBelow(factor(D.default, 0.9)) === 22 && roundBelow(factor(D.default, 0.5)) === 6 && roundBelow(factor(D.deep, 2 / 3)) === 4)
  const noNoise = (cfg) => sequenceBelow({ ...base, ...cfg, sigma: 0 })
  check('simulated with σ = 0: the same rounds, 8, 22, 6 and 4', noNoise({}) === 8 && noNoise({ p: 0.9 }) === 22 && noNoise({ p: 0.5 }) === 6 && noNoise({ shares: D.deep }) === 4, `${noNoise({})}, ${noNoise({ p: 0.9 })}, ${noNoise({ p: 0.5 })}, ${noNoise({ shares: D.deep })}`)
  const exact = playSequence({ ...base, sigma: 0, rounds: 8 })
  check('σ = 0: from round 2 on each mean is f times the one before', exact.slice(1).every((r, i) => close(r.mean, fDefault * exact[i].mean, 1e-9)))
  // The noise shrinks with the reference point (σ × ref / 50), so with noise
  // the mean follows 50 f^t as well. Round 1 has ref = 50: nothing changes there.
  const withNoise = (cfg) => sequenceBelow({ ...base, ...cfg })
  check('σ = 2, page seed: the mean falls below 1 in round 8 (default), 22 (p = 0.9), 6 (p = 1/2), 4 (deep thinkers)', withNoise({}) === 8 && withNoise({ p: 0.9 }) === 22 && withNoise({ p: 0.5 }) === 6 && withNoise({ shares: D.deep }) === 4, `${withNoise({})}, ${withNoise({ p: 0.9 })}, ${withNoise({ p: 0.5 })}, ${withNoise({ shares: D.deep })}; rounds 1–10: ${seq.slice(0, 10).map((r) => f2(r.mean)).join(' ')}`)
  check('σ = 2, default: from round 2 on each mean is within 3% of f times the one before, down to round 40', seq.slice(1).every((r, i) => close(r.mean / seq[i].mean, fDefault, 0.03 * fDefault)), `ratios between ${Math.min(...seq.slice(1).map((r, i) => r.mean / seq[i].mean)).toFixed(4)} and ${Math.max(...seq.slice(1).map((r, i) => r.mean / seq[i].mean)).toFixed(4)}; f = ${fDefault.toFixed(4)}`)
  const seeds40 = (cfg) => range(40).map((s) => sequenceBelow({ ...base, ...cfg, seed: 9001 + s }))
  const tally = (list) => [...new Set(list)].sort((x, y) => x - y).map((v) => `round ${v}: ${list.filter((x) => x === v).length}`).join(', ')
  const s40 = { def: seeds40({}), p09: seeds40({ p: 0.9 }), p05: seeds40({ p: 0.5 }), deep: seeds40({ shares: D.deep }) }
  check('σ = 2, 40 other seeds: round 8 (default), 6 (p = 1/2) and 4 (deep thinkers) in every seed', s40.def.every((x) => x === 8) && s40.p05.every((x) => x === 6) && s40.deep.every((x) => x === 4), `default ${tally(s40.def)}; p = 1/2 ${tally(s40.p05)}; deep ${tally(s40.deep)}`)
  check('σ = 2, 40 other seeds, p = 0.9: round 22, or 21 in a few seeds (50 f^21 is 1.02)', s40.p09.every((x) => x === 22 || x === 21) && s40.p09.filter((x) => x === 22).length >= 30 && f2(50 * factor(D.default, 0.9) ** 21) === '1.02', tally(s40.p09))
  info(`other noise levels, page seed, default / p = 0.9: ${[0.5, 1, 3, 5].map((sg) => `σ = ${sg}: ${sequenceBelow({ ...base, sigma: sg })} / ${sequenceBelow({ ...base, sigma: sg, p: 0.9 })}`).join('; ')}`)
}

console.log('— Guessing game with whole numbers')
{
  const all = range(96).map((k) => allSayOne(k + 5))
  check('"everyone says 1" is stable for N from 5 to 100, a tie at N = 4, not stable at N = 3', all.every((x) => x === 'stable') && allSayOne(4) === 'tie' && allSayOne(3) === 'unstable')
  check('N = 4: the mover to 0 gets the same quarter; N = 3: the mover takes the prize; N = 5: nothing', moverPayoff(4, 0) === 0.25 && moverPayoff(3, 0) === 1 && moverPayoff(5, 0) === 0)
  check('moving up never pays: 2 to 100 get nothing for N from 3 to 100', range(98).every((k) => range(99).every((g) => moverPayoff(k + 3, g + 2) === 0)))
}

// ------------------------------------------------------------ Random games

console.log('— Random games, 20,000 per size')
const big = survey({ sizes: SIZES, games: 20000 })
{
  const EXPECTED = {
    dominated: { 2: 0.746, 3: 0.774, 4: 0.729, 5: 0.643, 6: 0.535, 8: 0.321 },
    solved: { 2: 0.746, 3: 0.44, 4: 0.206, 5: 0.077, 6: 0.023, 8: 0.001 },
    none: { 2: 0.125, 3: 0.212, 4: 0.259, 5: 0.287, 6: 0.3, 8: 0.315 },
    one: { 2: 0.746, 3: 0.582, 4: 0.503, 5: 0.462, 6: 0.449, 8: 0.426 },
  }
  for (const [field, byM] of Object.entries(EXPECTED)) {
    const ms = Object.keys(byM).map(Number)
    const worst = Math.max(...ms.map((m) => Math.abs(big[m][field] - byM[m])))
    check(`${field}: within 0.015 of the expected values for m = 2, 3, 4, 5, 6, 8`, worst <= 0.015, `${ms.map((m) => f3(big[m][field])).join(', ')}; largest gap ${f3(worst)}`)
  }
  const cellsExpected = { 2: 1.76, 3: 4.09, 4: 9.05, 5: 17.45, 6: 29.15, 8: 60.0 }
  check('cells left on average: within 0.25 of the expected values', Object.entries(cellsExpected).every(([m, v]) => close(big[m].cells, v, 0.25)), Object.keys(cellsExpected).map((m) => f2(big[m].cells)).join(', '))
  check('m = 2: solved within 0.01 of 3/4, no stable cell within 0.01 of 1/8', close(big[2].solved, 0.75, 0.01) && close(big[2].none, 0.125, 0.01), `${big[2].solved} and ${big[2].none}`)
  check('m = 2: "something dominated", "solved" and "exactly one stable cell" are the same games', big[2].dominated === big[2].solved && big[2].solved === big[2].one)
  check('the three shares of stable cells sum to 1 at every size; a solved game has exactly one stable cell', SIZES.every((m) => close(big[m].none + big[m].one + big[m].more, 1, 1e-9)) && (() => {
    const random = mulberry32(3)
    for (let k = 0; k < 3000; k++) {
      const r = analyze(randomGame(random, 2 + (k % 4)))
      if (r.solved && r.stable !== 1) return false
    }
    return true
  })())
  check('a smaller survey is the beginning of a larger one (same games): 2,000 of size 3', same(survey({ sizes: [3], games: 2000 })[3], survey({ sizes: [3, 4], games: 2000 })[3]) && SURVEY_SEED === 5100)
  // Ten other seeds: how far a sample of 20,000 swings.
  for (const m of [2, 8]) {
    const runs = range(10).map((s) => survey({ sizes: [m], games: 20000, seed: 8037 + 37 * s })[m])
    const span = (f) => `${f3(Math.min(...runs.map((r) => r[f])))}–${f3(Math.max(...runs.map((r) => r[f])))}`
    info(`m = ${m}, ten other seeds: dominated ${span('dominated')}, solved ${m === 8 ? `${Math.min(...runs.map((r) => r.solved)).toFixed(4)}–${Math.max(...runs.map((r) => r.solved)).toFixed(4)}` : span('solved')}, no stable cell ${span('none')}, exactly one ${span('one')}`)
  }
}

// --------------------------------------------------------------- Exercises

console.log('— Exercises')
{
  const g = EXERCISE_1
  const start = dominated(g)
  check('exercise 1: before anything is deleted, D (by M) and R (by L) are dominated', start.length === 2 && start[0].player === 'row' && g.rows[start[0].index] === 'D' && g.rows[start[0].by] === 'M' && start[1].player === 'col' && g.cols[start[1].index] === 'R' && g.cols[start[1].by] === 'L')
  check('exercise 1: without D, L is dominated by C; without R, U is dominated by M', dominated(g, [0, 1], [0, 1, 2]).some((s) => s.player === 'col' && s.index === 0 && s.by === 1) && dominated(g, [0, 1, 2], [0, 1]).some((s) => s.player === 'row' && s.index === 0 && s.by === 1))
  const e = eliminate(g)
  const e2 = eliminate(g, (list) => list[list.length - 1])
  check('exercise 1: (M, C) is left, payoffs 3 and 5, in either order', same(e.rows, [1]) && same(e.cols, [1]) && same(e2.rows, [1]) && same(e2.cols, [1]) && g.a[1][1] === 3 && g.b[1][1] === 5)
  check('exercise 3 is the four points of Figure F2 (checked above); exercise 4 the survey (checked above)', true)
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))
}

// ------------------------------------------------------ Quoted on the page

console.log('— Quoted on the page')
{
  // Every phrase must be in the English text and, written the Italian way, in the Italian one.
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : it(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const w = many.default.wins
  const m1 = (x) => x.toFixed(1)

  quoted('lecture: the survey', lecture, [
    String(sv.renamed.total), // 144
    String(sv.swapped.total), // 78
    ['In a quarter of them', 'In un quarto di essi'],
    ['the only one of the 144', "l'unico dei 144"],
    ['three quarters are solved by dominance', 'tre quarti sono risolti dalla dominanza'],
    ['one eighth have two stable cells, and one eighth have none', 'un ottavo ha due celle stabili, e un ottavo non ne ha nessuna'],
  ])
  quoted('lecture: the guessing game', lecture, [
    '66.7', '44.4', ['29.6, 19.8, 13.2', '29,6; 19,8; 13,2'], '33.3', '22.2',
    [`an average of ${m1(round1.mean)}`, `una media di ${it(m1(round1.mean))}`],
    [`The target is ${m1(round1.target)}`, `Il bersaglio è ${it(m1(round1.target))}`],
    [`level 2 wins ${w[2]} times`, `il livello 2 vince ${w[2]} volte`],
  ])
  check('lecture: a level 2 player wins the round on the page, and the players who say 0 are second furthest from the target', round1.winnerKind === 2 && many.default.dist[4] > many.default.dist[1] && many.default.dist[4] < many.default.dist[0])
  const pct = (x) => `${Math.round(x * 100)}%`
  quoted('lecture: random games', lecture, [
    [`${pct(big[2].solved)} of the two-by-two`, `il ${pct(big[2].solved)} dei giochi due per due`],
    [`${pct(big[3].solved)} of the three-by-three`, `il ${pct(big[3].solved)} dei tre per tre`],
    [`${pct(big[5].solved)} of the five-by-five`, `l'${pct(big[5].solved)} dei cinque per cinque`],
  ])
  check('lecture: at 8 × 8 about one game in a thousand is solved (the page shows 0.001) and two in three have a stable cell', f3(big[8].solved) === '0.001' && big[8].solved > 0.0005 && big[8].solved < 0.0015 && close(1 - big[8].none, 2 / 3, 0.02), `${big[8].solved}, ${f3(1 - big[8].none)}`)

  quoted('observe, Panel A', observe.explorer, [String(sv.total), String(sv.solved), String(sv.stable[0]), String(sv.renamed.total), String(sv.swapped.total), [`Only ${sv.pdLike} tables`, `Solo ${sv.pdLike} tabelle`]])

  quoted('observe, Panel B', observe.guessing, [
    f2(round1.mean), f2(round1.target),
    [`level 2 wins ${w[2]} times, level 0 ${w[0]} times and level 3 ${w[3]} times`, `il livello 2 vince ${w[2]} volte, il livello 0 ${w[0]} volte e il livello 3 ${w[3]} volte`],
    m1(many.default.dist[4]), m1(many.default.dist[1]), m1(many.default.dist[0]),
    f2(expected(D.deep, 2 / 3).mean), f2(expected(D.deep, 2 / 3).target),
    [`Level 0 wins ${many.half.wins[0]} times and level 3 ${many.half.wins[3]} times`, `Il livello 0 vince ${many.half.wins[0]} volte e il livello 3 ${many.half.wins[3]} volte`],
    [`(${seq.slice(0, 8).map((r) => m1(r.mean)).join(', ')})`, `(${seq.slice(0, 8).map((r) => it(m1(r.mean))).join('; ')})`],
    [`${many.p09.wins[2]} and ${many.p09.wins[3]}`, `${many.p09.wins[2]} e ${many.p09.wins[3]}`],
    [`level 2 wins ${many.p05.wins[2]} times`, `il livello 2 vince ${many.p05.wins[2]} volte`],
    ['in round 8', 'al turno 8'],
    [`takes ${sequenceBelow({ ...base, p: 0.9 })} rounds`, `richiede ${sequenceBelow({ ...base, p: 0.9 })} turni`],
    [`only ${sequenceBelow({ ...base, p: 0.5 })}`, `solo ${sequenceBelow({ ...base, p: 0.5 })}`],
    [`need ${sequenceBelow({ ...base, shares: D.deep })}`, `ne bastano ${sequenceBelow({ ...base, shares: D.deep })}`],
  ])
  check('observe, Panel B: "every round multiplies the mean by about 0.6" (f = 0.5963)', factor(D.default, 2 / 3).toFixed(1) === '0.6')
  check('observe, Panel B: level 1 and the equilibrium kind never win; the half-at-equilibrium target is about 9.5; with p = 0.9 it is close to 37', w[1] === 0 && w[4] === 0 && m1(many.half.target) === '9.5' && Math.round(many.p09.target) === 37)

  const small = survey({ sizes: [DEFAULT_SIZE], games: DEFAULT_GAMES })[DEFAULT_SIZE]
  quoted('observe, Panel C', observe.dominance, [
    f3(small.dominated), f3(small.solved),
    [`from ${f3(big[2].solved)} at m = 2 to ${[3, 4, 5, 6, 7].map((m) => f3(big[m].solved)).join(', ')} and ${f3(big[8].solved)} at m = 8`, `da ${it(f3(big[2].solved))} per m = 2 a ${[3, 4, 5, 6, 7].map((m) => it(f3(big[m].solved))).join('; ')} e ${it(f3(big[8].solved))} per m = 8`],
    [`from ${f3(big[2].none)} to ${f3(big[8].none)}`, `da ${it(f3(big[2].none))} a ${it(f3(big[8].none))}`],
    [`from ${f3(big[2].one)} to ${f3(big[8].one)}`, `da ${it(f3(big[2].one))} a ${it(f3(big[8].one))}`],
    [`${m1(big[8].cells)} of the 64 cells`, `${it(m1(big[8].cells))} delle 64 celle`],
  ])
  check('observe, Panel C: at every size at least 0.66 of the games have a stable cell; the panel opens on 3 × 3 and 2,000 games', SIZES.every((m) => 1 - big[m].none >= 0.66) && DEFAULT_SIZE === 3 && DEFAULT_GAMES === 2000)

  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 2', sol(1), [['33.3, 22.2, 14.8', '33,3; 22,2; 14,8'], '9.9', '0.87', '1.30', '0.78', '0.91', ['level 10', 'livello 10'], ['level 6', 'livello 6'], ['level 38', 'livello 38']])
  quoted('exercise 4', sol(3), ['576', '144', '432', ['72 and 72', '72 e 72']])
  const e = (s, p) => expected(s, p)
  quoted('exercise 5', sol(4), [
    f2(e(D.default, 2 / 3).mean), f2(e(D.default, 2 / 3).target), f2(many.default.mean),
    [`wins ${w[2]} times, level 0 ${w[0]} times and level 3 ${w[3]} times`, `vince ${w[2]} volte, il livello 0 ${w[0]} volte e il livello 3 ${w[3]} volte`],
    f2(e(D.deep, 2 / 3).mean), f2(e(D.deep, 2 / 3).target), f2(e(D.half, 2 / 3).mean), f2(e(D.half, 2 / 3).target),
    [`level 0 wins ${many.half.wins[0]} times and level 3 ${many.half.wins[3]} times`, `il livello 0 vince ${many.half.wins[0]} volte e il livello 3 ${many.half.wins[3]} volte`],
  ])
  check('exercise 5: the 1,000 plays average 29.82 and 19.88; in "half at equilibrium" level 3 is about 5 from the target and the players at 0 are 9.5 away', f2(many.default.mean) === '29.82' && f2(many.default.target) === '19.88' && Math.round(many.half.dist[3]) === 5 && m1(many.half.dist[4]) === '9.5', `${f2(many.default.mean)} ${f2(many.default.target)} ${many.half.dist[3]} ${many.half.dist[4]}`)
  quoted('exercise 6', sol(5), [
    [`${[2, 3, 4].map((m) => f3(big[m].solved)).join(', ')} and ${f3(big[6].solved)}`, `${[2, 3, 4].map((m) => it(f3(big[m].solved))).join('; ')} e ${it(f3(big[6].solved))}`],
    f3(big[2].none), f3(big[8].none),
  ])

  // The sample game of the panel is drawn from its own seed and has no ties.
  const g = sampleGame(DEFAULT_SIZE)
  check('the sample game is 3 × 3, with 18 different payoffs between 0 and 1', g.a.length === 3 && new Set([...g.a.flat(), ...g.b.flat()]).size === 18 && [...g.a.flat(), ...g.b.flat()].every((v) => v >= 0 && v < 1))
  check('lecture words: between 1,400 and 1,700 in each language (markup included), with no DRAFT marker (removed after the review)', ['en', 'it'].every((l) => {
    const words = lecture[l].split(/<!--\s*simulation\s*-->/)[0].trim().split(/\s+/).length
    return words >= 1400 && words <= 1700 && !lecture[l].includes('<!-- DRAFT')
  }), ['en', 'it'].map((l) => `${l} ${lecture[l].split(/<!--\s*simulation\s*-->/)[0].trim().split(/\s+/).length}`).join(', '))
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(lecture[l] + observe.explorer[l] + observe.guessing[l] + observe.dominance[l])))
}

// ----------------------------------------------------------------- Timings

{
  let t0 = performance.now()
  playMany({ ...base, N: 5000 })
  const a = performance.now() - t0
  t0 = performance.now()
  survey({ sizes: SIZES, games: 2000 })
  const b = performance.now() - t0
  info(`timings in Node: 1,000 plays with N = 5,000 ${Math.round(a)} ms; all sizes with 2,000 games ${Math.round(b)} ms`)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
