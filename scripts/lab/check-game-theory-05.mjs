// Self-checks for Game Theory Lab module 05, "Incomplete information and
// signals". They run the same code as the page (types.js, lemons.js,
// signalling.js, cheaptalk.js, globalgame.js, and module 02's cournot.js and
// module 04's trees.js through types.js) and compare it with exact values,
// with independent computations and with the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-05.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// defaults, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { equilibrium as cournot } from '../../src/components/lab/game-theory/nash-equilibrium/cournot.js'
import { riskDominant } from '../../src/components/lab/game-theory/nash-equilibrium/conventions.js'
import { entryTree } from '../../src/components/lab/game-theory/sequential-games-commitment/presets.js'
import { backwardInduction } from '../../src/components/lab/game-theory/sequential-games-commitment/trees.js'
import {
  ENTRY, threshold, enterValue, entryWithTypes, incumbentChoice, typesTree, typesFigure, hiddenCost, bestResponse, HIDDEN,
} from '../../src/components/lab/game-theory/incomplete-information-signalling/types.js'
import {
  pricePath, endPoint, wholeMarket, roundsTo, sample, runMarket, market, exactCurves, survey as lemonSurvey, SURVEY_QMIN, SURVEY_B, DEFAULTS as LEMON,
} from '../../src/components/lab/game-theory/incomplete-information-signalling/lemons.js'
import {
  separatingRange, poolingRange, candidate, choKreps, cheapest, poolAtZero, crossing, bruteForce, DEFAULTS as EDU,
} from '../../src/components/lab/game-theory/incomplete-information-signalling/signalling.js'
import {
  maxIntervals, partition, lengths, actions, losses, closedLoss, indifferenceGap, delegationLoss, simulate, survey as talkSurvey, NO_TALK,
} from '../../src/components/lab/game-theory/incomplete-information-signalling/cheaptalk.js'
import {
  erf, erfc, Phi, nextCutoff, cutoffs, stepsTo, toTheEnd, stagAtHalf, END_TOL,
} from '../../src/components/lab/game-theory/incomplete-information-signalling/globalgame.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol) => Math.abs(a - b) <= tol
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const f5 = (x) => x.toFixed(5)
const it = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // numbers written the Italian way
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const range = (n) => Array.from({ length: n }, (_, k) => k)

// ------------------------------------------------------------------ Entry game with types

console.log('— The entry game with a tough or a weak incumbent')
{
  const ws = [-3, -2, -1.5, -1, -0.5, 0]
  const want = ['0.4000', '0.5000', '0.5714', '0.6667', '0.8000', '1.0000']
  check('t* = 2/(2 − w) is 0.4, 0.5, 0.5714, 0.6667, 0.8 and 1 for w = −3, −2, −1.5, −1, −0.5, 0', same(ws.map((w) => f4(threshold(w))), want), ws.map((w) => f4(threshold(w))).join(' '))
  check('backward induction on each branch: the tough type fights (3 > 2), the weak one shares (2 > 0), for every w on the slider', range(7).every((k) => {
    const w = -3 + 0.5 * k
    return incumbentChoice('tough', w).move === 1 && incumbentChoice('weak', w).move === 0
  }))
  check('the newcomer\'s expected payoff from entering is 2 − 3t at w = −1 (t on the slider\'s grid)', range(101).every((k) => close(enterValue(k / 100, -1), 2 - 3 * (k / 100), 1e-12)))
  check('the newcomer\'s payoff from entering is 2(1 − t) + t w for every w and t on the sliders', range(7).every((j) => range(101).every((k) => close(enterValue(k / 100, -3 + 0.5 * j), 2 * (1 - k / 100) + (k / 100) * (-3 + 0.5 * j), 1e-12))))
  check('it enters exactly when t < t* (at t* it is indifferent and stays out), on the sliders\' grid', range(7).every((j) => range(101).every((k) => {
    const w = -3 + 0.5 * j
    const t = k / 100
    return entryWithTypes({ t, w }).enters === (t < threshold(w) - 1e-12)
  })))
  const a = entryWithTypes({ t: 0.5, w: -1 })
  const b = entryWithTypes({ t: 0.7, w: -1 })
  check('exercise 1, t = 0.5: it enters and expects 0.5; the tough incumbent fights and gets 3, the weak one shares and gets 2', a.enters && close(a.value, 0.5, 1e-12) && a.get.tough === 3 && a.get.weak === 2)
  check('exercise 1, t = 0.7: it stays out; both types get 4 (being believed tough is worth 4 − 2 = 2 to the weak type)', !b.enters && b.get.tough === 4 && b.get.weak === 4 && b.get.weak - a.get.weak === 2)
  check('exercise 1: with w = −2 it enters when t < 1/2', threshold(-2) === 0.5 && entryWithTypes({ t: 0.49, w: -2 }).enters && !entryWithTypes({ t: 0.5, w: -2 }).enters)
  check('F1 numbers are module 04\'s: stay out (0, 4), share (2, 2); a weak incumbent is module 04\'s firm with f = 0 and w = −1', same(ENTRY.out, [0, 4]) && same(ENTRY.share, [2, 2]) && same(backwardInduction(entryTree({ f: 0 })).outcome.payoffs, incumbentChoice('weak', -1).payoffs))
  const tr = typesTree({ t: 0.5, w: -1 })
  check('F1 tree: a chance node at the root with probabilities t and 1 − t; two newcomer nodes in one information set, with the same move labels; 6 leaves', tr.root.chance && tr.root.moves[0].prob === 0.5 && tr.infoSets.length === 1 && tr.infoSets[0].length === 2 && same(tr.newcomerNodes[0].moves.map((m) => m.name), tr.newcomerNodes[1].moves.map((m) => m.name)) && tr.leaves.length === 6)
  const fig = typesFigure({ t: 0.5, w: -1 })
  check('F1 at the defaults: the paths played run through both newcomer nodes, Enter, then Fight (tough) and Share (weak)', fig.path.size === 7 && fig.choice.get(tr.newcomerNodes[0].id) === 1 && fig.choice.get(tr.incumbentNodes[0].id) === 1 && fig.choice.get(tr.incumbentNodes[1].id) === 0)
  const fig2 = typesFigure({ t: 0.7, w: -1 })
  check('F1 with t = 0.7: the paths end at Stay out (3 nodes on them)', fig2.path.size === 5 && fig2.choice.get(tr.newcomerNodes[0].id) === 0)
}

// ------------------------------------------------------------------ Cournot with a hidden cost

console.log('— Cournot with a hidden cost (exercise 4)')
{
  const h = hiddenCost()
  check('q1 = 3; q2 = 3.5 (cost 0) or 2.5 (cost 2); prices 3.5 and 4.5', close(h.q1, 3, 1e-12) && close(h.q2.low, 3.5, 1e-12) && close(h.q2.high, 2.5, 1e-12) && close(h.price.low, 3.5, 1e-12) && close(h.price.high, 4.5, 1e-12))
  check('profits: firm 1 7.5 or 10.5, mean 9; firm 2 12.25 or 6.25', close(h.profit1.low, 7.5, 1e-12) && close(h.profit1.high, 10.5, 1e-12) && close(h.profit1.mean, 9, 1e-12) && close(h.profit2.low, 12.25, 1e-12) && close(h.profit2.high, 6.25, 1e-12))
  check('known cost: firm 1 7.11 or 11.11, mean 9.11; firm 2 13.44 or 5.44', f2(h.known.low.profit1) === '7.11' && f2(h.known.high.profit1) === '11.11' && f2(h.known.mean1) === '9.11' && f2(h.known.low.profit2) === '13.44' && f2(h.known.high.profit2) === '5.44')
  // Each quantity is a best response for its type, checked on a fine grid.
  const grid = range(9001).map((k) => k / 1000)
  const p = (q) => HIDDEN.a - q
  const best1 = grid.reduce((a, q) => {
    const u = 0.5 * (p(q + h.q2.low) - 1) * q + 0.5 * (p(q + h.q2.high) - 1) * q
    return u > a.u ? { q, u } : a
  }, { q: 0, u: -Infinity })
  const bestType = (c) => grid.reduce((a, q) => ((p(q + h.q1) - c) * q > a.u ? { q, u: (p(q + h.q1) - c) * q } : a), { q: 0, u: -Infinity })
  check('each quantity is a best response for its type (searched on a grid of 0.001): firm 1 against the mean of the two types, each type against q1', close(best1.q, h.q1, 1e-9) && close(bestType(0).q, h.q2.low, 1e-9) && close(bestType(2).q, h.q2.high, 1e-9), `${best1.q}, ${bestType(0).q}, ${bestType(2).q}`)
  check('the low-cost type loses by being hidden (12.25 < 13.44), the high-cost type gains (6.25 > 5.44)', h.profit2.low < h.known.low.profit2 && h.profit2.high > h.known.high.profit2)
  check('the known-cost case is module 02\'s Cournot with costs 1 and 0, 1 and 2', same(h.known.low, cournot(10, 1, 0)) && bestResponse(3, 10, 0) === 3.5)
}

// ------------------------------------------------------------------ Lemons

console.log('— Lemons, the continuous model (exact)')
{
  const path = pricePath(0.2, 1.5, 4)
  check('(0.2, 1.5): prices 0.9, 0.825, 0.76875, 0.72656, …', same(path.map(f5), ['0.90000', '0.82500', '0.76875', '0.72656']), path.map(f5).join(' '))
  const e = endPoint(0.2, 1.5)
  check('(0.2, 1.5): end point 0.6; cars 1/2, gains 1/3; p_20 is the first price within 0.001 of it', close(e.price, 0.6, 1e-12) && close(e.cars, 0.5, 1e-12) && close(e.gains, 1 / 3, 1e-12) && roundsTo(0.2, 1.5) === 20)
  const triples = [[0.1, 1.5, '0.3000', '0.2222', '0.0808'], [0.2, 1.2, '0.3000', '0.1250', '0.0521'], [0.4, 1.2, '0.6000', '0.3333', '0.2381']]
  for (const [q, b, p, c, g] of triples) {
    const x = endPoint(q, b)
    check(`(${q}, ${b}): end ${p}, cars ${c}, gains ${g}`, f4(x.price) === p && f4(x.cars) === c && f4(x.gains) === g, `${f4(x.price)} ${f4(x.cars)} ${f4(x.gains)}`)
  }
  check('(0, any b below 2): the price ends at 0, nothing traded', range(19).every((k) => {
    const x = endPoint(0, 1.05 + 0.05 * k)
    return x.price === 0 && x.cars === 0 && x.gains === 0
  }))
  check('(0.2, 1.8) and (0.4, 1.5): the whole market, first price 1.08 and 1.05', endPoint(0.2, 1.8).whole && endPoint(0.4, 1.5).whole && f2(pricePath(0.2, 1.8, 1)[0]) === '1.08' && f2(pricePath(0.4, 1.5, 1)[0]) === '1.05')
  check('the whole market trades exactly when b ≥ 2/(1 + q_min) (sliders\' grid)', range(13).every((i) => range(20).every((j) => {
    const q = 0.05 * i
    const b = 1.05 + 0.05 * j
    return wholeMarket(q, b) === (b >= 2 / (1 + q) - 1e-12)
  })))
  check('exercise 2: whole market from b = 5/3 when q_min = 0.2', !wholeMarket(0.2, 5 / 3 - 0.001) && wholeMarket(0.2, 5 / 3))
  check('exercise 2: with q_min = 0, at any price p the cars offered are worth 0.75p < p to a buyer', range(100).every((k) => {
    const p = (k + 1) / 100
    return 1.5 * (p / 2) < p
  }))
  check('the exact curves agree with the end point formula', exactCurves(0.2).cars.every(([b, c]) => close(c, endPoint(0.2, b).cars, 1e-12)))
}

console.log('— Lemons, samples of cars')
{
  const runs = range(10).map((k) => market({ seed: k + 1 }))
  const span = (key, d = 3) => `${Math.min(...runs.map((r) => r[key])).toFixed(d)}–${Math.max(...runs.map((r) => r[key])).toFixed(d)}`
  info(`10,000 cars, (0.2, 1.5), seeds 1–10: end price ${span('price')}, cars ${span('cars')}, gains ${span('gains')}, rounds ${span('rounds', 0)} (expected in the prompt: 0.579–0.619, 0.476–0.529, 0.308–0.364, 21–25)`)
  check('every seed within 0.03 of 0.6 (price), within 0.035 of 1/2 (cars) and of 1/3 (gains)', runs.every((r) => close(r.price, 0.6, 0.03) && close(r.cars, 0.5, 0.035) && close(r.gains, 1 / 3, 0.035)))
  const more = range(30).map((k) => market({ seed: k + 11 }))
  const rr = [...runs, ...more].map((r) => r.rounds)
  info(`rounds over seeds 1–40: ${Math.min(...rr)}–${Math.max(...rr)}; prices ${Math.min(...more.map((r) => r.price)).toFixed(3)}–${Math.max(...more.map((r) => r.price)).toFixed(3)} over seeds 11–40`)
  check('rounds between 15 and 45 on seeds 1–40 (limit set from these 40 seeds, 18–41; the prompt expected 21–25), always more than the 20 the exact path needs to come within 0.001 of 0.6 minus five', rr.every((n) => n >= 15 && n <= 45), `${Math.min(...rr)}–${Math.max(...rr)}`)
  const small = range(10).map((k) => market({ seed: k + 1, N: 1000 }).price)
  info(`1,000 cars, seeds 1–10: end price ${Math.min(...small).toFixed(3)}–${Math.max(...small).toFixed(3)} (prompt: 0.53–0.64); not checked`)
  // The rule of the rounds, checked on a small hand-made market.
  const q = Float64Array.from([0.1, 0.3, 0.5, 0.7, 0.9])
  const r = runMarket(q, 1.5)
  // round 0: mean 0.5, price 0.75 → cars ≤ 0.75 stay: 4; mean 0.4, price 0.6 → 3; mean 0.3, price 0.45 → 2; mean 0.2, price 0.3 → 2 stay: stop.
  check('the rule on five cars 0.1 … 0.9, b = 1.5: prices 0.75, 0.6, 0.45, 0.3; 4 rounds; 2 cars traded', same(r.prices.map(f2), ['0.75', '0.60', '0.45', '0.30']) && r.rounds === 4 && r.traded === 2 && close(r.gains, 0.4 / 2.5, 1e-12))
  check('a sample is sorted, inside q_min–1, and the same for the same seed', (() => {
    const s = sample(1000, 0.2, 7)
    return s.every((x, i) => x >= 0.2 && x <= 1 && (i === 0 || x >= s[i - 1])) && same([...s], [...sample(1000, 0.2, 7)])
  })())
  const page = market({})
  info(`the page's first sample (seed 1, 10,000 cars, 0.2, 1.5): price ${f3(page.price)}, cars ${f3(page.cars)}, gains ${f3(page.gains)}, ${page.rounds} rounds`)
  const ex6 = [0, 0.1, 0.2, 0.4].map((qm) => market({ qmin: qm, seed: 1 }))
  info(`exercise 6, b = 1.5, seed 1: cars traded ${ex6.map((r) => f3(r.cars)).join(', ')}; prices ${ex6.map((r) => f3(r.price)).join(', ')}`)
  // At q_min = 0, b = 2 the exact model is on a knife edge: p_{t+1} = min(p_t, 1),
  // so any price below 1 stays, and a sample wanders. That dot is left out of the gap.
  const edge = (i, x) => SURVEY_QMIN[i] === 0 && x.b === 2
  const gap = (s) => Math.max(...s.dots.flatMap((d, i) => d.filter((x) => !edge(i, x)).map((x) => Math.abs(x.cars - endPoint(SURVEY_QMIN[i], x.b).cars))))
  const edgeDot = (s) => s.dots[0].find((x) => x.b === 2).cars
  const sv = lemonSurvey()
  const otherRuns = range(10).map((k) => lemonSurvey({ seed: 9000 + 1000 * k }))
  const others = otherRuns.map(gap)
  info(`survey dots against the exact share of cars, (0, 2) left out: largest gap ${f3(gap(sv))} on the page's seed, ${f3(Math.min(...others))}–${f3(Math.max(...others))} over ten other seeds; at (0, 2) the sample trades ${f3(edgeDot(sv))} on the page's seed and ${f3(Math.min(...otherRuns.map(edgeDot)))}–${f3(Math.max(...otherRuns.map(edgeDot)))} on the others (exact: 1)`)
  check('the survey: one sample at each b from 1.1 to 2.0 for q_min = 0, 0.1, 0.2, 0.4 (40 dots), each within 0.1 of the exact share of cars except at the knife edge (0, 2) (limit from the page\'s seed and ten others: largest 0.093)', SURVEY_B.length === 10 && sv.dots.every((d) => d.length === 10) && [sv, ...otherRuns].every((s) => gap(s) <= 0.1), f3(gap(sv)))
  check('the knife edge: at b = 2 the exact price path with q_min = 0 never moves once below 1 (p_{t+1} = min(p_t, 1))', pricePath(0, 2, 5).every((p) => p === 1) && close((2 * (0 + Math.min(0.7, 1))) / 2, 0.7, 1e-15))
}

// ------------------------------------------------------------------ Education

console.log('— Education as a signal')
{
  const configs = [[1, 0.5, 0.3], [1, 0.5, 0.5], [1, 0.5, 0.8], [1, 0.25, 0.3], [2, 0.5, 0.3]]
  for (const [cL, cH, lambda] of configs) {
    const cfg = { cL, cH, lambda }
    const bf = bruteForce(cfg)
    const sr = separatingRange(cfg)
    const pr = poolingRange(cfg)
    const near = (x, y) => close(x, y, bf.h / 2 + 1e-9)
    check(`(c_L, c_H, λ) = (${cL}, ${cH}, ${lambda}): brute force on a 0.001 grid finds separation on ${f3(sr.lo)}–${f3(sr.hi)} and pooling on 0–${f3(pr.hi)}, the intervals of Panel B`,
      near(bf.sep[0], sr.lo) && near(bf.sep.at(-1), sr.hi) && bf.sep.length === Math.round((bf.sep.at(-1) - bf.sep[0]) / bf.h) + 1 && near(bf.pool[0], 0) && near(bf.pool.at(-1), pr.hi) && bf.pool.length === Math.round(pr.hi / bf.h) + 1,
      `sep ${bf.sep[0]}–${bf.sep.at(-1)}, pool ${bf.pool[0]}–${bf.pool.at(-1)}`)
    check(`(${cL}, ${cH}, ${lambda}): the panel's candidate test agrees with brute force at every grid level`, range(4001).every((k) => {
      const e = k / 1000
      const s = e > 0 && candidate('separate', e, cfg).equilibrium
      const p = candidate('pool', e, cfg).equilibrium
      return s === bf.sep.includes(e) && p === bf.pool.includes(e)
    }))
    const ck = bf.sep.filter((e) => !choKreps('separate', e, cfg))
    check(`(${cL}, ${cH}, ${lambda}): only the cheapest separation passes Cho–Kreps (every separating e* at least 0.002 above 1/c_L fails), and no pooling level passes`, ck.length === 1 && near(ck[0], 1 / cL) && bf.sep.filter((e) => e >= 1 / cL + 0.002 - 1e-9).every((e) => choKreps('separate', e, cfg)) && bf.pool.every((e) => choKreps('pool', e, cfg)))
  }
  const eq = { cL: 1, cH: 1, lambda: 0.3 }
  const sr = separatingRange(eq)
  check('c_H = c_L: no strict separation (one level, 1/c_L, both indifferent) and every pooling level passes Cho–Kreps', sr.single && bruteForce(eq).sep.length === 1 && bruteForce(eq).pool.every((e) => !choKreps('pool', e, eq)))
  check('c_H > c_L: no separating level at all', separatingRange({ cL: 0.5, cH: 1, lambda: 0.3 }) === null && bruteForce({ cL: 0.5, cH: 1, lambda: 0.3 }).sep.length === 0)
  const p3 = choKreps('pool', 0, { cL: 1, cH: 0.5, lambda: 0.3 })
  const p8 = choKreps('pool', 0, { cL: 1, cH: 0.5, lambda: 0.8 })
  check('pooling at 0 is broken by the levels from 0.7 to 1.4 when λ = 0.3, and from 0.2 to 0.4 when λ = 0.8', close(p3.lo, 0.7, 1e-12) && close(p3.hi, 1.4, 1e-12) && close(p8.lo, 0.2, 1e-12) && close(p8.hi, 0.4, 1e-12))
  check('the breaking levels are those a low type would never choose even if paid 2, and a high type would choose if paid 2', range(2001).every((k) => {
    const x = k / 1000
    const lowNever = 2 - 1 * x < 1.3 - 1e-12
    const highWould = 2 - 0.5 * x > 1.3 + 1e-12
    return (lowNever && highWould) === (x > p3.lo + 1e-12 && x < p3.hi - 1e-12)
  }))
  const c = cheapest(EDU)
  check('payoffs: separation at 1, high 1.5 and low 1; pooling at 0, 1 + λ', c.e === 1 && c.high === 1.5 && c.low === 1 && poolAtZero({ lambda: 0.3 }) === 1.3 && poolAtZero({ lambda: 0.8 }) === 1.8)
  check('the high type\'s crossing at λ = 1 − c_H/c_L (0.5 at the defaults, 0.75 with c_H = 0.25)', crossing(EDU) === 0.5 && crossing({ cL: 1, cH: 0.25 }) === 0.75 && close(poolAtZero({ lambda: crossing(EDU) }), cheapest(EDU).high, 1e-12))
  check('lecture, λ = 0.8: the high type gets 1.5 in the cheapest separation and would get 1.8 if nobody signalled; the low type 1 instead of 1.8', cheapest(EDU).high === 1.5 && close(poolAtZero({ lambda: 0.8 }), 1.8, 1e-12))
  const dev = candidate('separate', 0.5, EDU)
  const dev2 = candidate('separate', 2.5, EDU)
  const dev3 = candidate('pool', 0.5, EDU)
  check('a candidate that fails names who deviates and where: separating at 0.5 (the low type copies, to 0.5), at 2.5 (the high type drops to 0), pooling at 0.5 with λ = 0.3 (the low type drops to 0; the high type stays, 0.5 ≤ λ/c_H = 0.6), pooling at 0.7 (both drop to 0)', dev.deviation.low && dev.deviation.low.at === 0.5 && !dev.deviation.high && dev2.deviation.high && dev2.deviation.high.at === 0 && !dev2.deviation.low && dev3.deviation.low && dev3.deviation.low.at === 0 && !dev3.deviation.high && candidate('pool', 0.7, EDU).deviation.high?.at === 0 && candidate('pool', 0.7, EDU).deviation.low?.at === 0)
  check('cost wasted per worker: separating at 1 with λ = 0.3 wastes 0.3 × 0.5 = 0.15; pooling at 0.2 wastes 0.2 × (0.3 × 0.5 + 0.7 × 1) = 0.17', close(candidate('separate', 1, EDU).wasted, 0.15, 1e-12) && close(candidate('pool', 0.2, EDU).wasted, 0.17, 1e-12))
}

// ------------------------------------------------------------------ Cheap talk

console.log('— Cheap talk')
{
  const bs = [0.3, 0.25, 0.2, 0.1, 0.08, 0.05, 0.04, 0.02, 0.01]
  const Ns = [1, 1, 2, 2, 3, 3, 4, 5, 7]
  check('largest N for b = 0.3, 0.25, 0.2, 0.1, 0.08, 0.05, 0.04, 0.02, 0.01: 1, 1, 2, 2, 3, 3, 4, 5, 7', same(bs.map((b) => maxIntervals(b)), Ns), bs.map((b) => maxIntervals(b)).join(' '))
  const drops = [1 / 4, 1 / 12, 1 / 24, 1 / 40]
  check('it drops at b = 1/4, 1/12, 1/24, 1/40', drops.every((d, i) => maxIntervals(d) === i + 1 && maxIntervals(d - 1e-9) === i + 2))
  const bnd = (b) => partition(b, maxIntervals(b)).slice(1, -1).map(f4)
  check('boundaries: b = 0.2: 0.1; b = 0.1: 0.3; b = 0.05: 0.1333, 0.4667; b = 0.02: 0.04, 0.16, 0.36, 0.64', same(bnd(0.2), ['0.1000']) && same(bnd(0.1), ['0.3000']) && same(bnd(0.05), ['0.1333', '0.4667']) && same(bnd(0.02), ['0.0400', '0.1600', '0.3600', '0.6400']))
  const want = ['0.08333', '0.08333', '0.06083', '0.03083', '0.02633', '0.01593', '0.01321', '0.00653', '0.00330']
  const got = bs.map((b) => f5(losses(partition(b, maxIntervals(b)), b).dm))
  check('decision maker\'s loss in the most informative equilibrium: 0.08333, 0.08333, 0.06083, 0.03083, 0.02633, 0.01593, 0.01321, 0.00653, 0.00330', same(got, want), got.join(' '))
  check('… equal to 1/(12N²) + b²(N² − 1)/3', bs.every((b) => close(losses(partition(b, maxIntervals(b)), b).dm, closedLoss(b, maxIntervals(b)), 1e-12)))
  check('with b = 0.05 and N = 2 the loss is 0.02333', f5(losses(partition(0.05, 2), 0.05).dm) === '0.02333')
  check('at every inner boundary the expert is indifferent within 1e-12 (every b on a 0.001 grid to 0.3, every possible N)', range(300).every((k) => {
    const b = (k + 1) / 1000
    return range(maxIntervals(b)).every((n) => indifferenceGap(partition(b, n + 1), b) < 1e-12)
  }))
  check('each interval is 4b longer than the one before', range(300).every((k) => {
    const b = (k + 1) / 1000
    const L = lengths(partition(b, maxIntervals(b)))
    return L.every((x, i) => i === 0 || close(x - L[i - 1], 4 * b, 1e-12))
  }))
  const s = simulate(0.1, 2, 200000)
  check('simulated, b = 0.1, N = 2, 200,000 draws: decision maker 0.0308 and expert 0.0408, each within 0.0005', close(s.dm, 0.0308, 0.0005) && close(s.expert, 0.0408, 0.0005), `${f5(s.dm)} ${f5(s.expert)}`)
  const better = range(288).every((k) => delegationLoss((k + 1) / 1000) < losses(partition((k + 1) / 1000, maxIntervals((k + 1) / 1000)), (k + 1) / 1000).dm)
  const worse = range(12).every((k) => delegationLoss((289 + k) / 1000) > losses(partition((289 + k) / 1000, 1), (289 + k) / 1000).dm)
  check('delegation is better for the decision maker than the most informative equilibrium for every b from 0.001 to 0.288, and worse from 0.289 to 0.3', better && worse)
  check('the switch is at b = 1/√12 = 0.2887', f4(Math.sqrt(1 / 12)) === '0.2887' && delegationLoss(Math.sqrt(1 / 12)) - NO_TALK < 1e-15)
  const sv = talkSurvey()
  check('the survey runs from b = 0.005 to 0.3 in 60 steps, with N from 10 down to 1', sv.length === 60 && sv[0].N === 10 && sv.at(-1).N === 1 && sv.every((x, i) => i === 0 || x.N <= sv[i - 1].N))
  check('with b = 0 the page stops at 12 intervals', maxIntervals(0) === 12)
  check('the midpoints are the decision maker\'s actions: b = 0.1 → 0.15 and 0.65', same(actions(partition(0.1, 2)).map(f2), ['0.15', '0.65']))
}

// ------------------------------------------------------------------ Global game

console.log('— The global game')
{
  // Φ against tabulated values (to 1e-12).
  const table = [[0, 0.5], [0.5, 0.6914624612740131], [1, 0.8413447460685429], [1.96, 0.9750021048517795], [-2, 0.022750131948179195], [3, 0.9986501019683699], [4, 0.9999683287581669], [-5, 2.866515718791939e-7], [2.5, 0.9937903346742238], [-6, 9.865876450376946e-10]]
  const err = Math.max(...table.map(([x, v]) => Math.abs(Phi(x) - v)))
  check('Φ (erf by Taylor series below 3, continued fraction of erfc above) matches ten tabulated values within 1e-12', err < 1e-12, `largest error ${err.toExponential(2)}`)
  check('erf(x) + erfc(x) = 1 and erf is odd on −5…5', range(101).every((k) => {
    const x = -5 + 0.1 * k
    return close(erf(x) + erfc(x), 1, 1e-14) && close(erf(-x), -erf(x), 1e-15)
  }))
  check('Φ is continuous where the two methods meet (x = 3√2)', close(Phi(3 * Math.SQRT2 - 1e-9), Phi(3 * Math.SQRT2 + 1e-9), 1e-12))
  const c = cutoffs(0.1, 5)
  const k = ['1.0000', '0.8521', '0.7547', '0.6861', '0.6367', '0.6006']
  const l = ['0.0000', '0.1479', '0.2453', '0.3139', '0.3633', '0.3994']
  check('σ = 0.1, cutoffs from above 1, 0.8521, 0.7547, 0.6861, 0.6367, 0.6006 and from below 0, 0.1479, 0.2453, 0.3139, 0.3633, 0.3994 (each within 0.0001)', c.k.every((x, i) => close(x, Number(k[i]), 0.0001)) && c.l.every((x, i) => close(x, Number(l[i]), 0.0001)), `${c.k.map(f4).join(' ')} | ${c.l.map(f4).join(' ')}`)
  check('each cutoff solves c\' + Φ((c\' − c)/(σ√2)) = 1 within 1e-12', range(5).every((i) => close(c.k[i + 1] + Phi((c.k[i + 1] - c.k[i]) / (0.1 * Math.SQRT2)), 1, 1e-12)))
  const sigmas = [1, 0.5, 0.2, 0.1, 0.05, 0.02]
  check('k_n + l_n = 1 at every step for every σ (to 1e-12)', sigmas.every((s) => {
    const x = cutoffs(s, 200)
    return x.k.every((v, i) => close(v + x.l[i], 1, 1e-12))
  }))
  const s02 = sigmas.map((s) => stepsTo(s, 0.02).steps)
  const s002 = sigmas.map((s) => stepsTo(s, 0.002).steps)
  check('steps until the open band is narrower than 0.02, σ = 1, 0.5, 0.2, 0.1, 0.05, 0.02: 3, 4, 8, 13, 24, 56', same(s02, [3, 4, 8, 13, 24, 56]), s02.join(' '))
  check('… narrower than 0.002: 5, 7, 12, 21, 38, 89', same(s002, [5, 7, 12, 21, 38, 89]), s002.join(' '))
  const ends = sigmas.map((s) => toTheEnd(s))
  check('both cutoffs end within 1e-6 of 1/2 for every σ ("To the end")', ends.every((e) => Math.abs(e.k - 0.5) <= END_TOL && Math.abs(e.l - 0.5) <= END_TOL))
  info(`"To the end" takes ${ends.map((e, i) => `${e.steps} (σ = ${sigmas[i]})`).join(', ')} steps`)
  check('the cutoffs fall from above and rise from below at every step until they reach 1/2 (to 1e-12)', sigmas.every((s) => {
    const x = cutoffs(s, 60)
    return x.k.every((v, i) => i === 0 || v < x.k[i - 1] || Math.abs(x.k[i - 1] - 0.5) < 1e-12) && x.l.every((v, i) => i === 0 || v > x.l[i - 1] || Math.abs(x.l[i - 1] - 0.5) < 1e-12) && x.k.every((v) => v >= 0.5 - 1e-15)
  }))
  check('exercise 6: a hunter with signal 1/2, when the other hunts the stag above 1/2, expects 1/2 − 1/2 = 0 from the stag, for every σ', sigmas.every((s) => Math.abs(stagAtHalf(s)) < 1e-15))
  const hunt = (th) => ({ a: th, b: th - 1, c: 0, d: 0 })
  check('1/2 is where the stag becomes risk dominant (module 02\'s riskDominant on the game with θ = 0.01 … 0.99: hare below 1/2, neither at 1/2, stag above)', range(99).every((k) => {
    const th = (k + 1) / 100
    return riskDominant(hunt(th)) === (k + 1 < 50 ? 'hare' : k + 1 === 50 ? 'neither' : 'stag')
  }))
  check('a smaller σ means a longer chain (steps to 0.02 grow as σ falls)', s02.every((v, i) => i === 0 || v > s02[i - 1]))
  check('one step from c = 1 is just below 1 and from c = 0 just above 0 for every σ on the slider (log grid)', range(21).every((j) => {
    const s = 10 ** (Math.log10(0.02) + (j / 20) * (0 - Math.log10(0.02)))
    const a = nextCutoff(1, s)
    const b = nextCutoff(0, s)
    return a < 1 && a > 0.5 && b > 0 && b < 0.5
  }))
}

// ------------------------------------------------------------------ Quoted on the page

const textsFile = resolve(root, 'src/components/lab/game-theory/incomplete-information-signalling/texts.js')
const lectureFile = (l) => `src/content/game-theory-lab/incomplete-information-signalling.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')).replace(/\r/g, ''), it: read(lectureFile('it')).replace(/\r/g, '') }
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : it(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const g = (x) => String(Number(x.toFixed(4))) // shortest form: 0.9, 0.6, 1.5

  // ---- The lecture
  const e15 = endPoint(0.2, 1.5)
  check('lecture numbers are the code\'s: entry game (0, 4), (2, 2), fight 3 / 0, −1; t* = 2/3', same(ENTRY.out, [0, 4]) && same(ENTRY.share, [2, 2]) && ENTRY.fightTough === 3 && ENTRY.fightWeak === 0 && close(threshold(-1), 2 / 3, 1e-15) && close(enterValue(0.3, -1), 2 - 0.9, 1e-12))
  quoted('lecture: the entry game with types', lecture, ['(0, 4)', '(2, 2)', '−1', '2 − 3t', '2/3', '2/(2 − w)', ['keeps 4 instead of 2', 'tiene 4 invece di 2'], ['module 06', 'modulo 06']])
  check('lecture numbers are the code\'s: lemons start at 0.9 and end at 0.6, half the cars and a third of the gains; q_min = 0 sells nothing', g(pricePath(0.2, 1.5, 1)[0]) === '0.9' && g(e15.price) === '0.6' && close(e15.cars, 0.5, 1e-12) && close(e15.gains, 1 / 3, 1e-12) && endPoint(0, 1.5).cars === 0)
  quoted('lecture: lemons', lecture, ['q_min = 0.2', ['price starts at 0.9', 'il prezzo parte da 0,9'], ['down to 0.6', 'fino a 0,6'], ['1.5 times', '1,5 volte'], ['Half of the cars', 'metà delle auto'], ['a third of the gains', 'un terzo dei guadagni'], 'q_min = 0', '2001'])
  const sr = separatingRange(EDU)
  check('lecture numbers are the code\'s: separation from 1 to 2, pooling from 0 to λ (c_L = 1), λ = 0.8: 1.5 against 1.8, low 1', sr.lo === 1 && sr.hi === 2 && poolingRange({ ...EDU, lambda: 0.8 }).hi === 0.8 && cheapest(EDU).high === 1.5 && close(poolAtZero({ lambda: 0.8 }), 1.8, 1e-12))
  quoted('lecture: signals', lecture, [['low productivity, 1, or high, 2', 'produttività bassa, 1, o alta, 2'], ['a low type 1 and a high type 1/2', '1 a un tipo basso e 1/2 a un tipo alto'], ['from 1 to 2 works', 'da 1 a 2'], ['from 0 to λ works', 'da 0 a λ'], '1 + λ', 'e* = 1', 'λ = 0.8', '2 − 1/2 = 1.5', '1.8', ['gets 1 instead of 1.8', 'ottiene 1 invece di 1,8'], '(1987)', '(1975)', '(1990)'])
  check('lecture numbers are the code\'s: cheap talk b = 0.1 → boundary 0.3; b = 0.05 → 3; b = 1/4 → none; 1/12 = 0.083; 0.031 at b = 0.1; b² = 0.01; delegation wins below 1/√12 = 0.29', g(partition(0.1, 2)[1]) === '0.3' && maxIntervals(0.05) === 3 && maxIntervals(0.25) === 1 && maxIntervals(0.2499) === 2 && f3(NO_TALK) === '0.083' && f3(losses(partition(0.1, 2), 0.1).dm) === '0.031' && delegationLoss(0.1).toFixed(2) === '0.01' && f2(Math.sqrt(1 / 12)) === '0.29')
  quoted('lecture: cheap talk', lecture, ['b = 0.1', ['"below 0.3" and "above 0.3"', '«sotto 0,3» e «sopra 0,3»'], ['b = 0.05 there are three', 'b = 0,05 sono tre'], 'b = 1/4', '4b', '1/12 ≈ 0.083', ['0.031 with b = 0.1', '0,031 con b = 0,1'], 'b² = 0.01', ['about 0.29', 'circa 0,29']])
  check('lecture numbers are the code\'s: 13 steps with σ = 0.1, 56 with σ = 0.02, to an open band narrower than 0.02', stepsTo(0.1, 0.02).steps === 13 && stepsTo(0.02, 0.02).steps === 56)
  quoted('lecture: the global game', lecture, ['θ − 1', ['narrower than 0.02 after 13 steps with σ = 0.1 and after 56 with σ = 0.02', 'più stretta di 0,02 dopo 13 passi con σ = 0,1 e dopo 56 con σ = 0,02'], ['single point, 1/2', 'solo punto, 1/2'], ['above 1/2', 'sopra 1/2'], '(1993)', '(1998)'])

  // ---- What to observe, Panel A
  {
    const page = market({})
    const q0 = market({ qmin: 0 })
    const q4 = market({ qmin: 0.4 })
    const b165 = market({ b: 1.65 })
    const b170 = market({ b: 1.7 })
    const n1k = market({ N: 1000 })
    const big = range(10).map((k) => market({ seed: k + 1 }).price)
    const small = range(10).map((k) => market({ seed: k + 1, N: 1000 }).price)
    const sv = lemonSurvey()
    const others = range(10).map((k) => lemonSurvey({ seed: 9000 + 1000 * k }).dots[0].find((x) => x.b === 2).cars)
    const at19 = sv.dots[0].find((x) => x.b === 1.9).cars
    const at2 = sv.dots[0].find((x) => x.b === 2).cars
    check('observe A: q_min = 0.4 and b = 1.70 trade the whole market in one round; b = 1.70 is above 5/3; the gains curve is below the cars curve', q4.rounds === 1 && q4.cars === 1 && b170.rounds === 1 && b170.cars === 1 && 1.7 > 5 / 3 && exactCurves(0.2).gains.every(([, v], i) => v <= exactCurves(0.2).cars[i][1] + 1e-12))
    quoted('observe, Panel A', observe.lemons, [
      [`falls from ${f3(page.prices[0])}`, `scende da ${it(f3(page.prices[0]))}`], [`stops at ${f3(page.price)} after ${page.rounds} rounds`, `si ferma a ${it(f3(page.price))} dopo ${page.rounds} turni`], f3(page.cars), f3(page.gains), [`(round ${roundsTo(0.2, 1.5)})`, `(turno ${roundsTo(0.2, 1.5)})`],
      [`down to ${f3(q0.price)} and only ${q0.traded} of the 10,000`, `fino a ${it(f3(q0.price))} e si vendono solo ${q0.traded} delle 10.000`], f3(q4.price),
      [`(${b165.rounds} rounds, ${f3(b165.cars)} of the cars)`, `(${b165.rounds} turni, lo ${it(f3(b165.cars))} delle auto)`],
      [`stops at ${f3(n1k.price)} after ${n1k.rounds} rounds`, `si ferma a ${it(f3(n1k.price))} dopo ${n1k.rounds} turni`],
      [`between ${f3(Math.min(...big))} and ${f3(Math.max(...big))}`, `tra ${it(f3(Math.min(...big)))} e ${it(f3(Math.max(...big)))}`], [`between ${f3(Math.min(...small))} and ${f3(Math.max(...small))}`, `tra ${it(f3(Math.min(...small)))} e ${it(f3(Math.max(...small)))}`],
      [`with ${f3(at19)} of the cars`, `con lo ${it(f3(at19))} delle auto`], [`the dot is ${f3(at2)}`, `il punto è ${it(f3(at2))}`], [`from ${f3(Math.min(...others))} to 1`, `tra ${it(f3(Math.min(...others)))} e 1`],
    ])
  }

  // ---- What to observe, Panel B
  {
    const s1 = candidate('separate', 1, EDU)
    const s15 = candidate('separate', 1.5, EDU)
    const s2 = candidate('separate', 2, EDU)
    const p0 = candidate('pool', 0, EDU)
    const p3 = candidate('pool', 0.3, EDU)
    check('observe B: separating at 1 is an equilibrium and passes; at 1.5 an equilibrium that fails on 1–1.5; at 2 the high type gets 1; above 2 it deviates; pooling at 0 and 0.3 are equilibria', s1.equilibrium && !s1.ck && s15.equilibrium && s15.ck.lo === 1 && s15.ck.hi === 1.5 && s2.equilibrium && s2.payoff.high === 1 && !candidate('separate', 2.01, EDU).equilibrium && p0.equilibrium && p3.equilibrium)
    check('observe B: c_H = c_L = 1 leaves only e = 1; c_H above c_L leaves none', separatingRange({ cL: 1, cH: 1, lambda: 0.3 }).single && separatingRange({ cL: 1, cH: 1.05, lambda: 0.3 }) === null)
    quoted('observe, Panel B', observe.signal, [
      [`from ${g(sr.lo)} to ${g(sr.hi)}`, `da ${g(sr.lo)} a ${g(sr.hi)}`], [`from 0 to ${g(poolingRange(EDU).hi)}`, `da 0 a ${it(g(poolingRange(EDU).hi))}`],
      [`high type gets ${g(s1.payoff.high)}, the low type ${g(s1.payoff.low)}`, `tipo alto ottiene ${it(g(s1.payoff.high))}, il tipo basso ${g(s1.payoff.low)}`], [`wastes ${g(s1.wasted)}`, `spreca ${it(g(s1.wasted))}`],
      [`between ${g(s15.ck.lo)} and ${g(s15.ck.hi)}`, `tra ${g(s15.ck.lo)} e ${it(g(s15.ck.hi))}`], [`gets ${g(s2.payoff.high)}, no more`, `ottiene ${g(s2.payoff.high)}, non più`],
      [`both types get ${g(p0.payoff.high)}`, `entrambi i tipi ottengono ${it(g(p0.payoff.high))}`], [`between ${g(p0.ck.lo)} and ${g(p0.ck.hi)}`, `tra ${it(g(p0.ck.lo))} e ${it(g(p0.ck.hi))}`],
      [`low type is down to ${g(p3.payoff.low)}, the high type to ${g(p3.payoff.high)}, and ${g(p3.wasted)}`, `tipo basso scende a ${g(p3.payoff.low)}, il tipo alto a ${it(g(p3.payoff.high))}, e si sprecano ${it(g(p3.wasted))}`],
      [`everyone ${g(poolAtZero({ lambda: 0.8 }))}, more than the ${g(cheapest(EDU).high)}`, `tutti ${it(g(poolAtZero({ lambda: 0.8 })))}, più dell'${it(g(cheapest(EDU).high))}`], `1 − c_H/c_L = ${g(crossing(EDU))}`,
    ])
  }

  // ---- What to observe, Panel C
  {
    const a1 = partition(0.1, 2)
    const l1 = losses(a1, 0.1)
    const sim = simulate(0.1, 2)
    const a5 = partition(0.05, 3)
    const L2 = lengths(partition(0.02, 5))
    const sv = talkSurvey()
    const drops = sv.filter((x, i) => i > 0 && x.N !== sv[i - 1].N)
    const above = sv.filter((x) => x.loss > x.delegation).map((x) => x.b)
    const below = sv.filter((x) => x.loss < x.delegation).map((x) => x.b)
    check('observe C: fewer intervals than the largest are worse for both, for every b on a 0.005 grid', range(60).every((k) => {
      const b = (k + 1) * 0.005
      const M = maxIntervals(b)
      return range(M - 1).every((n) => losses(partition(b, n + 1), b).dm > losses(partition(b, n + 2), b).dm && losses(partition(b, n + 1), b).expert > losses(partition(b, n + 2), b).expert)
    }))
    check('observe C: the drops of the survey are 10 → 7 at 0.01, 6 at 0.015, 5 at 0.02, 4 at 0.025, 3 at 0.045, 2 at 0.085, 1 at 0.25; the loss is above b² up to 0.285 and below from 0.29 (three points)', sv[0].N === 10 && same(drops.map((x) => [x.N, x.b]), [[7, 0.01], [6, 0.015], [5, 0.02], [4, 0.025], [3, 0.045], [2, 0.085], [1, 0.25]]) && Math.max(...above) === 0.285 && same(below, [0.29, 0.295, 0.3]))
    quoted('observe, Panel C', observe.talk, [
      [`boundary is at ${g(a1[1])}, the actions at ${g(actions(a1)[0])} and ${g(actions(a1)[1])}`, `confine è a ${it(g(a1[1]))}, le azioni a ${it(g(actions(a1)[0]))} e ${it(g(actions(a1)[1]))}`], f5(l1.dm), f5(l1.expert), f5(NO_TALK), f5(delegationLoss(0.1)),
      [`gives ${f5(sim.dm)} and ${f5(sim.expert)}`, `dà ${it(f5(sim.dm))} e ${it(f5(sim.expert))}`],
      [`boundaries ${f4(a5[1])} and ${f4(a5[2])}`, `confini ${it(f4(a5[1]))} e ${it(f4(a5[2]))}`], [`each ${g(4 * 0.05)} longer`, `più lungo di ${it(g(4 * 0.05))}`], f5(losses(a5, 0.05).dm), f5(losses(partition(0.05, 2), 0.05).dm),
      [`from ${g(L2[0])} to ${g(L2.at(-1))} long`, `lunghi da ${it(g(L2[0]))} a ${it(g(L2.at(-1)))}`], [`b², ${g(delegationLoss(0.25))}`, `b², ${it(g(delegationLoss(0.25)))}`], f3(Math.sqrt(1 / 12)),
      [`from 10 at b = 0.005 to 7, 6, 5, 4 by b = 0.025, to 3 at 0.045, 2 at 0.085 and 1 at 0.25`, `da 10 a b = 0,005 a 7, 6, 5, 4 entro b = 0,025; a 3 a 0,045; 2 a 0,085 e 1 a 0,25`],
      [`up to b = 0.285 and falls below it from 0.290`, `fino a b = 0,285 e scende sotto da 0,290`],
    ])
  }

  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  {
    const a = entryWithTypes({ t: 0.5, w: -1 })
    const b = entryWithTypes({ t: 0.7, w: -1 })
    check('exercise 1: the numbers of the solution are the code\'s', close(a.value, 0.5, 1e-12) && close(b.value, -0.1, 1e-12) && a.get.tough === 3 && a.get.weak === 2 && b.get.weak === 4)
    quoted('exercise 1', sol(0), ['t < 2/3', 't < 1/2', ['expects 2 − 1.5 = 0.5', 'si aspetta 2 − 1,5 = 0,5'], '−0.1', '4 − 2 = 2', '(3 > 2)', '(2 > 0)'])
  }
  {
    const p = pricePath(0.2, 1.5, 3)
    check('exercise 2: 0.9, 0.825, 0.769; 0.6; 1/2; 1/3; 5/3', f3(p[0]) === '0.900' && f3(p[1]) === '0.825' && f3(p[2]) === '0.769' && g(e15.price) === '0.6' && wholeMarket(0.2, 5 / 3) && !wholeMarket(0.2, 1.66))
    quoted('exercise 2', sol(1), ['0.75p', '0.825', '0.769', 'p = 0.6', '= 1/2', '= 1/3', 'b ≥ 5/3', '(0.36 − 0.04)/(1 − 0.04)'])
  }
  {
    const pz = choKreps('pool', 0, EDU)
    check('exercise 3: separation 1–2, pooling 0–0.3, payoffs 1.5, 1, 1.3; Cho–Kreps interval 0.7–1.4; λ above 1/2', sr.lo === 1 && sr.hi === 2 && poolingRange(EDU).hi === 0.3 && poolAtZero(EDU) === 1.3 && close(pz.lo, 0.7, 1e-12) && close(pz.hi, 1.4, 1e-12) && crossing(EDU) === 0.5)
    quoted('exercise 3', sol(2), [['e* from 1 to 2', 'e* da 1 a 2'], ['e from 0 to 0.3', 'e da 0 a 0,3'], ['high 1.5, low 1', 'alto 1,5, basso 1'], ['1.3 each', '1,3 ciascuno'], ['between 0.7 and 1.4', 'tra 0,7 e 1,4'], ['λ above 1/2', 'λ sopra 1/2'], '1 + λ > 1.5'])
  }
  {
    const h = hiddenCost()
    quoted('exercise 4', sol(3), [['q1 = 3', 'q1 = 3'], g(h.q2.low), g(h.q2.high), g(h.price.high), g(h.profit1.low), g(h.profit1.high), [`mean ${g(h.profit1.mean)}`, `media ${g(h.profit1.mean)}`], g(h.profit2.low), g(h.profit2.high),
      f2(h.known.low.profit1), f2(h.known.high.profit1), f2(h.known.mean1), f2(h.known.low.profit2), f2(h.known.high.profit2), '(9 − q1)/2'])
  }
  {
    const L01 = losses(partition(0.1, 2), 0.1).dm
    const a5 = partition(0.05, 3)
    check('exercise 5: (0.3³ + 0.7³)/12 = 0.0308; no talk 0.0833; delegation 0.01; b = 0.05: 0.133, 0.467, 0.0159, 0.0025', f4(L01) === '0.0308' && close(L01, (0.027 + 0.343) / 12, 1e-12) && f4(NO_TALK) === '0.0833' && f3(a5[1]) === '0.133' && f3(a5[2]) === '0.467' && f4(losses(a5, 0.05).dm) === '0.0159' && f4(delegationLoss(0.05)) === '0.0025')
    quoted('exercise 5', sol(4), ['(0.3³ + 0.7³)/12 = 0.0308', '0.0833', '0.01', '0.133', '0.467', '0.0159', '0.0025', "L′ = L + 4b"])
  }
  {
    const steps = [0.2, 0.1, 0.05, 0.02].map((s) => stepsTo(s, 0.02).steps)
    const ex = [0, 0.1, 0.2, 0.4].map((q) => market({ qmin: q }))
    const exact = [0, 0.1, 0.2, 0.4].map((q) => endPoint(q, 1.5).cars)
    const Ns = [0.2, 0.1, 0.05, 0.02].map((b) => maxIntervals(b))
    check('exercise 6: a hunter at 1/2 is indifferent (1/2 − 1/2 = 0)', Math.abs(stagAtHalf(0.1)) < 1e-15)
    quoted('exercise 6', sol(5), [
      [`F2: ${steps.slice(0, 3).join(', ')} and ${steps[3]} steps`, `F2: ${steps.slice(0, 3).join(', ')} e ${steps[3]} passi`],
      [`exact: 0, ${f3(exact[1])}, 1/2 and 1`, `esatto: 0; ${it(f3(exact[1]))}; 1/2 e 1`],
      [`${ex.slice(0, 3).map((r) => f3(r.cars)).join(', ')} and ${f3(ex[3].cars)}, end price ${f3(ex[2].price)}`, `${ex.slice(0, 3).map((r) => it(f3(r.cars))).join('; ')} e ${it(f3(ex[3].cars))}, prezzo finale ${it(f3(ex[2].price))}`],
      [`Simulation C: ${Ns.join(', ')}`, `Simulazione C: ${Ns.join(', ')}`], '1/2 − 1 × 1/2 = 0',
    ])
  }
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  const body = (l) => lecture[l].split(/<!--\s*simulation\s*-->/)[0]
  check('lecture words: between 1,400 and 1,700 in each language, with no DRAFT marker (removed after the review)', ['en', 'it'].every((l) => words(body(l)) >= 1400 && words(body(l)) <= 1700 && !lecture[l].includes('<!-- DRAFT')), ['en', 'it'].map((l) => `${l} ${words(body(l))}`).join(', '))
  check('no Bitcoin in this module and no box', ['en', 'it'].every((l) => !/bitcoin/i.test(lecture[l] + observe.lemons[l] + observe.signal[l] + observe.talk[l]) && !lecture[l].includes('```box')) && exercises.every((x) => !/bitcoin/i.test(x.statement.en + x.solution.en + x.statement.it + x.solution.it)))
  check('the lecture places the two live figures and links to modules 01, 02 and 04', ['en', 'it'].every((l) => /```figure\ntypes\n```/.test(lecture[l]) && /```figure\ndoubt\n```/.test(lecture[l]) && lecture[l].includes('(/game-theory-lab/what-is-a-game)') && lecture[l].includes('(/game-theory-lab/nash-equilibrium)') && lecture[l].includes('(/game-theory-lab/sequential-games-commitment)')))
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(lecture[l] + observe.lemons[l] + observe.signal[l] + observe.talk[l])))
  check('the same fourteen readings in both languages', ['en', 'it'].every((l) => (lecture[l].split(/<!--\s*simulation\s*-->/)[1].match(/^- /gm) || []).length === 14))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

// ----------------------------------------------------------------- Timings

{
  let t0 = performance.now()
  market({})
  const a = performance.now() - t0
  t0 = performance.now()
  lemonSurvey()
  const b = performance.now() - t0
  t0 = performance.now()
  simulate(0.1, 2)
  const c = performance.now() - t0
  t0 = performance.now()
  talkSurvey()
  const d = performance.now() - t0
  t0 = performance.now()
  toTheEnd(0.02)
  const e = performance.now() - t0
  info(`timings in Node: Panel A 10,000 cars ${a.toFixed(1)} ms; its survey ${Math.round(b)} ms; Panel C simulate ${c.toFixed(1)} ms, survey ${d.toFixed(1)} ms; F2 "To the end" at σ = 0.02 ${e.toFixed(1)} ms`)
}

void mulberry32
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
