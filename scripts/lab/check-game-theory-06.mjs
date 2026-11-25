// Self-checks for Game Theory Lab module 06, "Repeated games and
// reputation". They run the same code as the page (repeated.js,
// collusion.js, greenporter.js, chainstore.js, minersdilemma.js, and module
// 05's Φ through greenporter.js) and compare it with exact values, with
// independent computations and with the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-06.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// defaults, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  threshold, averages, bars, winner, CELLS, feasible, weights, deltaNeeded, sustainable, rationalSet, sustainableSet, sustainableShare, area,
} from '../../src/components/lab/game-theory/repeated-games-reputation/repeated.js'
import {
  cournotProfit, cartelOutput, cartelProfit, cheatProfit, cournotThreshold, heldOutputClosed, heldOutputBisect, holdMargin, heldCournot, bertrandThreshold, held, levels, thresholdTable, profit,
} from '../../src/components/lab/game-theory/repeated-games-reputation/collusion.js'
import {
  alarms, evaluate, bestRule, leastDelta, leastDeltaCurve, sample, NOISELESS, DEFAULTS as GP, TRIGGERS, PI_C, PI_D, PI_N,
} from '../../src/components/lab/game-theory/repeated-games-reputation/greenporter.js'
import {
  base, deterred, expectWeak, weakPayoff, toughPath, history, simulateWeak, fightProb, staysOut, DEFAULTS as CS,
} from '../../src/components/lab/game-theory/repeated-games-reputation/chainstore.js'
import {
  revenues, totalPaid, bestResponse, equilibrium, alone, twoByTwo,
} from '../../src/components/lab/game-theory/repeated-games-reputation/minersdilemma.js'

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
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const time = (fn) => {
  const t0 = performance.now()
  const r = fn()
  return [r, performance.now() - t0]
}

// ------------------------------------------------------------------ F1

console.log('— F1: the patience threshold of grim trigger')
{
  const Ts = [4, 5, 7, 10]
  const got = Ts.map((T) => threshold(T))
  check('δ* = (T − 3)/(T − 1) is 1/3, 1/2, 2/3, 7/9 at T = 4, 5, 7, 10', got.every((g, i) => close(g, [1 / 3, 1 / 2, 2 / 3, 7 / 9][i], 1e-15)), got.map(f4).join(' '))
  const a = averages(5, 0.6)
  check('δ = 0.6, T = 5: averages 3 and 2.6, cooperation wins', a.cooperate === 3 && close(a.defect, 2.6, 1e-12) && winner(5, 0.6) === 'cooperate', `${a.cooperate} ${a.defect}`)
  check('δ = 1/2, T = 5: a tie', winner(5, 0.5) === 'tie' && close(averages(5, 0.5).defect, 3, 1e-15))
  check('δ = 0.4, T = 5: defection wins', winner(5, 0.4) === 'defect')
  const b = bars(5, 0.6)
  const sumDef = b.defect.reduce((s, x) => s + x.d, 0)
  check('F1 bars: 12 rounds, defect row 5 then 1, discounted heights δ^t u_t', b.cooperate.length === 12 && b.defect[0].u === 5 && b.defect[1].u === 1 && close(b.defect[3].d, 0.216, 1e-12) && close(b.cooperate[2].d, 1.08, 1e-12))
  info(`F1: (1 − δ) × the 12 defect bars = ${f4(0.4 * sumDef)} (the full stream gives 2.6)`)
  // Exercise 1: temptation 7; expected rounds at δ = 0.9; punishment phase.
  check('exercise 1: T = 7 needs δ ≥ 2/3; 1/(1 − 0.9) = 10 rounds expected', close(threshold(7), 2 / 3, 1e-15) && close(1 / (1 - 0.9), 10, 1e-9))
}

// ------------------------------------------------------------------ F2

console.log('— F2: the folk theorem with a public lottery')
{
  const pts = [[[3, 3], 0.5], [[2.8, 2.8], 0.5263], [[2.5, 2.5], 0.4], [[2, 2], 0.5], [[1.5, 1.5], 0.6667], [[1.25, 1.25], 0.8], [[2, 3], 0.5], [[3, 2], 0.5], [[1.2, 4], 0.9091], [[2, 3.5], 0.6667]]
  const got = pts.map(([v]) => deltaNeeded(v).delta)
  check('δ needed at (3, 3) 0.5, (2.8, 2.8) 0.5263, (2.5, 2.5) 0.4, (2, 2) 0.5, (1.5, 1.5) 0.6667, (1.25, 1.25) 0.8, (2, 3) and (3, 2) 0.5, (1.2, 4) 0.9091, (2, 3.5) 0.6667',
    pts.every(([, want], i) => f4(got[i]) === want.toFixed(4)), got.map(f4).join(' '))
  check('(1.5, 4.2) is not feasible; (1, 1) needs no patience; (0.5, 4) is feasible but not individually rational',
    !feasible([1.5, 4.2]) && deltaNeeded([1.5, 4.2]).delta === null && deltaNeeded([1, 1]).delta === 0 && deltaNeeded([0.5, 4]).feasible && deltaNeeded([0.5, 4]).delta === Infinity)
  check('on the line v1 = 1 (other than DD) only in the limit: (1, 2) is never sustainable, DD always is',
    !sustainable([1, 2], 0.99) && sustainable([1, 1], 0) && sustainable([2.5, 2.5], 0.4) && !sustainable([2.5, 2.5], 0.39))
  const w1 = weights([2.8, 2.8])
  const w2 = weights([1.2, 4])
  const w3 = weights([2, 3])
  const w4 = weights([2.5, 2.5])
  const w5 = weights([2, 2])
  const r2 = (x) => Math.round(x * 100) / 100
  check('weights: (2.8, 2.8) CC 0.6, CD 0.2, DC 0.2', r2(w1.CC) === 0.6 && r2(w1.CD) === 0.2 && r2(w1.DC) === 0.2 && w1.DD === 0, JSON.stringify(w1))
  check('weights: (1.2, 4) CC 0.2, CD 0.68, DC 0.12', r2(w2.CC) === 0.2 && r2(w2.CD) === 0.68 && r2(w2.DC) === 0.12, JSON.stringify(w2))
  check('weights: (2, 3) CD 0.6, DC 0.4', w3.CC === 0 && r2(w3.CD) === 0.6 && r2(w3.DC) === 0.4 && w3.DD === 0, JSON.stringify(w3))
  check('weights: (2.5, 2.5) CD and DC half each; (2, 2) CD, DC, DD a third each', close(w4.CD, 0.5, 1e-12) && close(w4.DC, 0.5, 1e-12) && [w5.CD, w5.DC, w5.DD].every((x) => close(x, 1 / 3, 1e-12)))
  // Each weighted lottery gives back the point.
  const back = (w) => [0, 1].map((i) => w.CC * CELLS.CC[i] + w.CD * CELLS.CD[i] + w.DC * CELLS.DC[i] + w.DD * CELLS.DD[i])
  check('the lotteries give back their points', [[w1, [2.8, 2.8]], [w2, [1.2, 4]], [w3, [2, 3]]].every(([w, v]) => close(back(w)[0], v[0], 1e-12) && close(back(w)[1], v[1], 1e-12)))
  const ir = rationalSet()
  check('the individually rational set: corners (1, 1), (13/3, 1), (3, 3), (1, 13/3), area 20/3', close(area(ir), 20 / 3, 1e-12) && ir.length === 4, ir.map((p) => p.map(f3).join(',')).join(' '))
  const deltas = [0.4, 0.45, 0.5, 0.6, 0.75, 0.9, 0.99]
  const want = [0, 0.0232, 0.0752, 0.3113, 0.6446, 0.879, 0.988]
  const [shares, ms] = time(() => deltas.map((d) => sustainableShare(d, 1500)))
  check('share of the individually rational set sustainable (1,500 × 1,500 grid): 0, 0.0232, 0.0752, 0.3113, 0.6446, 0.879, 0.988 at δ = 0.4 … 0.99, within 0.002',
    shares.every((s, i) => close(s, want[i], 0.002)), shares.map(f4).join(' '))
  const exact = deltas.map((d) => sustainableSet(d).reduce((s, p) => s + area(p), 0) / (20 / 3))
  check('the polygons drawn in F2 have the same share (within 0.002)', exact.every((e, i) => close(e, shares[i], 0.002)), exact.map(f4).join(' '))
  info(`F2 grid shares computed in ${ms.toFixed(0)} ms (the page draws the polygons, not the grid)`)
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: can the cartel hold?')
{
  const rows = [
    [2, 9, 10.125, 11.390625, 0.5294],
    [3, 5.0625, 6.75, 9, 0.5714],
    [4, 3.24, 5.0625, 7.9102, 0.6098],
    [5, 2.25, 4.05, 7.29, 0.6429],
    [10, 0.6694, 2.025, 6.1256, 0.7516],
  ]
  for (const [n, pn, pc, pd, th] of rows) {
    const L = levels(n, 'cournot')
    const ok = f4(L.punishment) === pn.toFixed(4) && f4(L.cartel) === pc.toFixed(4) && f4(L.cheat) === pd.toFixed(4) && f4(L.threshold) === th.toFixed(4)
    check(`Cournot n = ${n}: punishment ${pn}, cartel ${pc}, cheat ${pd}, δ* ${th}`, ok, [L.punishment, L.cartel, L.cheat, L.threshold].map(f4).join(' '))
    const direct = (L.cheat - L.cartel) / (L.cheat - L.punishment)
    check(`  δ* is (π_D − π_C)/(π_D − π_N) for n = ${n}`, close(direct, L.threshold, 1e-12))
  }
  check('δ*(6) = 0.6712, δ*(8) = 0.7168', f4(cournotThreshold(6)) === '0.6712' && f4(cournotThreshold(8)) === '0.7168')
  check('exact fractions: 9/17, 4/7, 9/14, 121/161', [[2, 9 / 17], [3, 4 / 7], [5, 9 / 14], [10, 121 / 161]].every(([n, v]) => close(cournotThreshold(n), v, 1e-15)))
  check('Bertrand (n − 1)/n: 0.5, 0.667, 0.8, 0.9 at n = 2, 3, 5, 10', [2, 3, 5, 10].every((n) => close(bertrandThreshold(n), (n - 1) / n, 1e-15)))
  const ds = [0, 0.1, 0.2, 0.3, 0.4, 0.5]
  const want = [[3, 9], [2.8652, 9.3681], [2.7273, 9.6694], [2.5862, 9.8989], [2.4419, 10.0514], [2.2941, 10.1211]]
  const got = ds.map((d) => heldCournot(d, 2))
  check('n = 2, held output / profit at δ = 0 … 0.5: 3/9, 2.8652/9.3681, 2.7273/9.6694, 2.5862/9.8989, 2.4419/10.0514, 2.2941/10.1211',
    got.every((g, i) => f4(g.q) === want[i][0].toFixed(4) && f4(g.profit) === want[i][1].toFixed(4)), got.map((g) => `${f4(g.q)}/${f4(g.profit)}`).join(' '))
  const late = [9 / 17, 0.6, 0.9].map((d) => heldCournot(d, 2))
  check('from 9/17 on: 2.25 / 10.125', late.every((g) => g.q === 2.25 && g.profit === 10.125))
  const g5 = [0.3, 0.6].map((d) => heldCournot(d, 5))
  check('n = 5 at δ = 0.3 and 0.6: 1.2692 / 3.3683 and 0.9545 / 4.0351', f4(g5[0].q) === '1.2692' && f4(g5[0].profit) === '3.3683' && f4(g5[1].q) === '0.9545' && f4(g5[1].profit) === '4.0351',
    g5.map((g) => `${f4(g.q)}/${f4(g.profit)}`).join(' '))
  let worst = 0
  for (let n = 2; n <= 10; n++) {
    for (let i = 0; i < 100; i++) {
      const d = (i / 100) * cournotThreshold(n)
      worst = Math.max(worst, Math.abs(heldOutputClosed(d, n) - heldOutputBisect(d, n)))
    }
  }
  // At δ = 0 the two roots meet at the Cournot output (a double root), so
  // near it the condition is flat and a bisection only finds the root to
  // about the square root of the rounding error: hence 1e-6, not 1e-12.
  check('the closed form q(δ) agrees with a bisection on the condition (n = 2 … 10, 100 values of δ below δ* each, within 1e-6)', worst < 1e-6, `largest gap ${worst.toExponential(1)}`)
  check('the condition holds with equality at the held output (n = 2, δ = 0.3)', close(holdMargin(heldOutputClosed(0.3, 2), 0.3, 2), 0, 1e-12))
  check('exercise 2: 22.5/8.7 = 2.586 at δ = 0.3', close(heldOutputClosed(0.3, 2), 22.5 / 8.7, 1e-12) && f3(heldOutputClosed(0.3, 2)) === '2.586' && f3(heldCournot(0.3, 2).profit) === '9.899')
  const hb = [held(0.49, 2, 'bertrand'), held(0.5, 2, 'bertrand')]
  check('Bertrand n = 2: nothing below 1/2, everything from 1/2 (price 5.5, profit 10.125, share 1)', hb[0].profit === 0 && hb[0].share === 0 && hb[1].price === 5.5 && hb[1].profit === 10.125 && hb[1].share === 1)
  const hc = held(0.3, 2, 'cournot')
  check('share of the cartel\'s extra profit held, n = 2, δ = 0.3: (9.8989 − 9)/1.125 = 0.7990', f4(hc.share) === '0.7990', f4(hc.share))
  check('the threshold table has n = 2 … 10', thresholdTable().length === 9 && thresholdTable()[0].n === 2)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: price wars without cheating (Green and Porter)')
{
  const d = { ...GP }
  const a = alarms(d.sigma, d.trigger)
  check('σ = 0.5, p̄ = 4.5: p0 = 0.0228, p1 = 0.5987', f4(a.p0) === '0.0228' && f4(a.p1) === '0.5987', `${f4(a.p0)} ${f4(a.p1)}`)
  const Ls = [1, 2, 3, 4, 5, 10, 30]
  const ev = Ls.map((L) => evaluate({ ...d, L }))
  const margins = ['-0.6942', '-0.1991', '0.2316', '0.6079', '0.9377', '2.0857', '3.4033']
  const values = ['10.1024', '10.0829', '10.0659', '10.0510', '10.0380', '9.9926', '9.9406']
  const peace = ['0.9778', '0.9565', '0.9361', '0.9166', '0.8979', '0.8147', '0.5944']
  check('margins for L = 1, 2, 3, 4, 5, 10, 30: −0.6942, −0.1991, +0.2316, +0.6079, +0.9377, +2.0857, +3.4033', same(ev.map((e) => f4(e.margin)), margins), ev.map((e) => f4(e.margin)).join(' '))
  check('values 10.1024, 10.0829, 10.0659, 10.0510, 10.0380, 9.9926, 9.9406', same(ev.map((e) => f4(e.value)), values), ev.map((e) => f4(e.value)).join(' '))
  check('long-run peace 0.9778, 0.9565, 0.9361, 0.9166, 0.8979, 0.8147, 0.5944', same(ev.map((e) => f4(e.peace)), peace), ev.map((e) => f4(e.peace)).join(' '))
  check('value = π_N + (1 − δ) x (two ways to write it)', ev.every((e) => close(e.value, PI_N + (1 - d.delta) * e.x, 1e-12)))
  // Independent: the value by iterating the two Bellman equations.
  {
    const e5 = ev[4]
    let V = 0
    for (let i = 0; i < 5000; i++) {
      const W = (1 - d.delta ** 5) * PI_N + d.delta ** 5 * V
      V = (1 - d.delta) * PI_C + d.delta * ((1 - e5.p0) * V + e5.p0 * W)
    }
    const W = (1 - d.delta ** 5) * PI_N + d.delta ** 5 * V
    const cheat = (1 - d.delta) * PI_D + d.delta * ((1 - e5.p1) * V + e5.p1 * W)
    check('L = 5 by value iteration: the same value, and cheating once loses margin × (1 − δ)', close(V, e5.value, 1e-9) && close((V - cheat) / (1 - d.delta), e5.margin, 1e-7), `${f4(V)} ${f4((V - cheat) / (1 - d.delta))}`)
  }
  check('long-run profit at L = 5: 0.8979 × 10.125 + 0.1021 × 9 = 10.0101', f4(ev[4].longRun) === '10.0101', f4(ev[4].longRun))
  // Without noise the conditions give back 9/17.
  const noiseless = evaluate({ sigma: 0, trigger: 5, L: 1e6, delta: 9 / 17 })
  check('without noise (σ → 0, a very long war) the margin is 0 at δ = 9/17', close(noiseless.margin, 0, 1e-9) && close(NOISELESS, 9 / 17, 1e-15), noiseless.margin.toExponential(2))
  const sig = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5]
  const wantLd = ['0.5294', '0.5294', '0.5384', '0.6405', '0.7505', '0.8335', '0.8934', '0.9389']
  const [ld, msLd] = time(() => sig.map((s) => leastDelta(s, 30)))
  check('least δ with L = 30 on the slider grid of p̄: 0.5294 (σ = 0.05, 0.1), 0.5384, 0.6405, 0.7505, 0.8335, 0.8934, 0.9389', same(ld.map(f4), wantLd), ld.map(f4).join(' '))
  const [curve, msCurve] = time(() => leastDeltaCurve(30))
  check('chart 2: 30 values of σ, rising', curve.length === 30 && curve.every((p, i) => i === 0 || p[1] >= curve[i - 1][1] - 1e-9))
  info(`chart 2 computed in ${msCurve.toFixed(1)} ms (the eight values above in ${msLd.toFixed(1)} ms)`)
  const [br, msBr] = time(() => bestRule(d.sigma, d.delta))
  check('"Best rule" at the defaults: p̄ = 3.85, L = 19, value 10.1208, p0 = 0.0005, p1 = 0.1469, peace 0.9909, margin 0.0114',
    br.trigger === 3.85 && br.L === 19 && f4(br.value) === '10.1208' && f4(br.p0) === '0.0005' && f4(br.p1) === '0.1469' && f4(br.peace) === '0.9909' && f4(br.margin) === '0.0114',
    `${br.trigger} ${br.L} ${f4(br.value)} ${f4(br.p0)} ${f4(br.p1)} ${f4(br.peace)} ${f4(br.margin)}`)
  info(`"Best rule" computed in ${msBr.toFixed(1)} ms`)
  const br25 = bestRule(0.25, d.delta)
  check('"Best rule" at σ = 0.25: value 10.1250 to 4 decimals', f4(br25.value) === '10.1250', `${br25.trigger} ${br25.L} ${br25.value.toFixed(6)}`)
  info(`"Best rule" at σ = 0.25: p̄ = ${br25.trigger}, L = ${br25.L}, value ${br25.value.toFixed(6)} (the prompt's was p̄ = 4.1, L = 25: ${evaluate({ sigma: 0.25, trigger: 4.1, L: 25, delta: 0.9 }).value.toFixed(6)})`)
  const br1 = bestRule(1, d.delta)
  check('"Best rule" at σ = 1: p̄ = 3.45, L = 26, value 9.9616 (or a rule within 1e-4 of that value)', close(br1.value, 9.9616, 1e-4), `${br1.trigger} ${br1.L} ${f4(br1.value)}`)
  // The rule found really is the best on the grid.
  let bestValue = -Infinity
  for (const trigger of TRIGGERS) for (let L = 1; L <= 30; L++) {
    const e = evaluate({ sigma: d.sigma, trigger, L, delta: d.delta })
    if (e.works && e.value > bestValue) bestValue = e.value
  }
  check('brute force over all 51 × 30 rules finds no better value', close(bestValue, br.value, 1e-12))
  // Samples.
  const s1 = sample(d, 200, 1)
  info(`sample 200 rounds, seed 1: ${s1.wars} wars, quiet share ${f3(s1.quiet)}`)
  const long = []
  for (let seed = 1; seed <= 10; seed++) long.push(sample(d, 100000, seed).quiet)
  check('100,000 rounds at the defaults, seeds 1 to 10: each quiet share within 0.01 of 0.8979', long.every((q) => close(q, 0.8979, 0.01)), `${f4(Math.min(...long))}–${f4(Math.max(...long))}`)
  info(`quiet shares, seeds 1–10: ${long.map(f4).join(' ')}`)
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: a reputation for toughness (Kreps and Wilson)')
{
  const b = base(-1)
  check('b = 2/(2 − w) = 2/3 at w = −1', close(b, 2 / 3, 1e-15))
  const powers = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => f4(b ** k))
  check('b^k: 0.6667, 0.4444, 0.2963, 0.1975, 0.1317, 0.0878, 0.0585, 0.0390', same(powers, ['0.6667', '0.4444', '0.2963', '0.1975', '0.1317', '0.0878', '0.0585', '0.0390']), powers.join(' '))
  const D = deterred(0.05, 20, b)
  check('t = 0.05, w = −1, N = 20: D = 13 (k ≥ 8)', D === 13)
  // The path of beliefs: fights at k = 7, 5, 3 with 0.5469, 0.3910, 4/13.
  const p7 = 0.05
  const f7 = fightProb(p7, 7, b)
  const p6 = b ** 6
  const f5 = fightProb(p6, 5, b)
  const f3 = fightProb(b ** 4, 3, b)
  const f1 = fightProb(b ** 2, 1, b)
  check('weak fights with probability 0.5469 (k = 7), 0.3910 (k = 5), 4/13 (k = 3), 0 (k = 1)', f4(f7) === '0.5469' && f4(f5) === '0.3910' && close(f3, 4 / 13, 1e-12) && f1 === 0, [f7, f5, f3, f1].map(f4).join(' '))
  check('after a fight the newcomers at k = 6, 4, 2 stay out at the tie', staysOut(b ** 6, 6, b) && staysOut(b ** 4, 4, b) && staysOut(b ** 2, 2, b) && !staysOut(b ** 6, 5, b))
  check('exercise 5: belief after the fight at k = 7 is (2/3)^6 = 0.0878', f4(Math.max(0.05, b ** 6)) === '0.0878')
  const ex = expectWeak(0.05, 20, -1)
  check('weak payoff 66, expected entries 6.1735, fights 0.8265', weakPayoff(0.05, 20, -1) === 66 && f4(ex.entries) === '6.1735' && f4(ex.fights) === '0.8265', `${f4(ex.entries)} ${f4(ex.fights)}`)
  const tp = toughPath(0.05, 20, -1)
  check('tough payoff 76 with 4 entries', tp.pay === 76 && tp.entries === 4)
  const cases = [
    [{ t: 0.1, N: 20, w: -1 }, 15, 70, '4.4097', '0.5903', 77, 3],
    [{ t: 0.01, N: 20, w: -1 }, 9, 58, '10.0202', '0.9798', 74, 6],
    [{ t: 0.2, N: 20, w: -1 }, 17, 74, '2.6875', '0.3125', 78, 2],
    [{ t: 0.5, N: 20, w: -1 }, 19, 78, '1.0000', '0.0000', 79, 1],
    [{ t: 0, N: 20, w: -1 }, 0, 40, '20.0000', '0.0000', 60, 20],
    [{ t: 0.05, N: 20, w: -2 }, 16, 72, '3.5789', '0.4211', 78, 2],
    [{ t: 0.05, N: 20, w: -0.5 }, 7, 54, '11.3345', '1.6655', 73, 7],
    [{ t: 0.05, N: 5, w: -1 }, 0, 10, '4.7204', '0.2796', 17, 3],
    [{ t: 0.05, N: 50, w: -1 }, 43, 186, '6.1735', '0.8265', 196, 4],
  ]
  for (const [c, wD, wPay, wE, wF, tPay, tE] of cases) {
    const Dc = deterred(c.t, c.N, base(c.w))
    const e = expectWeak(c.t, c.N, c.w)
    const t = toughPath(c.t, c.N, c.w)
    const got = `${Dc}; ${weakPayoff(c.t, c.N, c.w)}, ${f4(e.entries)}, ${f4(e.fights)}; ${t.pay}, ${t.entries}`
    check(`t = ${c.t}, N = ${c.N}, w = ${c.w}: ${wD}; ${wPay}, ${wE}, ${wF}; ${tPay}, ${tE}`, got === `${wD}; ${wPay}, ${wE}, ${wF}; ${tPay}, ${tE}`, got)
  }
  // N = 1 is module 05's game: entry when t < b.
  check('N = 1 is module 05\'s game: entry when t < b (t = 0.6 enters, 0.7 stays out at w = −1)', expectWeak(0.6, 1, -1).entries === 1 && expectWeak(0.7, 1, -1).entries === 0 && expectWeak(2 / 3, 1, -1).entries === 0)
  const ent7 = [7, 10, 20, 30, 50].map((N) => f4(expectWeak(0.05, N, -1).entries))
  check('expected entries against a weak incumbent are 6.1735 whenever N ≥ 7', ent7.every((x) => x === '6.1735'), ent7.join(' '))
  // Tough with t = 0 fights all N.
  const h0 = history({ t: 0, N: 20, w: -1 }, 'tough', 1)
  check('with t = 0 a tough incumbent fights all 20 entrants', h0.markets.every((m) => m.move === 'fight') && h0.pay === 60)
  // Simulations.
  const sims = []
  let allPay = true
  const [, msSim] = time(() => {
    for (let seed = 1; seed <= 10; seed++) {
      const s = simulateWeak(CS, 10000, seed)
      sims.push(s)
      if (s.minPay !== 66 || s.maxPay !== 66) allPay = false
    }
  })
  check('10,000 chains against a weak incumbent, seeds 1 to 10: entries within 0.04 of 6.1735, fights within 0.04 of 0.8265',
    sims.every((s) => close(s.entries, 6.1735, 0.04) && close(s.fights, 0.8265, 0.04)), `entries ${f4(Math.min(...sims.map((s) => s.entries)))}–${f4(Math.max(...sims.map((s) => s.entries)))}, fights ${f4(Math.min(...sims.map((s) => s.fights)))}–${f4(Math.max(...sims.map((s) => s.fights)))}`)
  check('the weak incumbent earns exactly 66 in every one of the 100,000 chains', allPay)
  info(`10 × 10,000 chains in ${msSim.toFixed(0)} ms`)
  const hw = history(CS, 'weak', 1)
  check('a history has N markets, the belief before each and b^k', hw.markets.length === 20 && hw.markets[0].k === 20 && close(hw.markets[0].threshold, b ** 20, 1e-15) && hw.markets.slice(0, 13).every((m) => m.move === 'out'))
}

// ------------------------------------------------------------------ The box

console.log('— The box: the miner\'s dilemma (Eyal 2015)')
{
  // Independent: solve r1 = (R1 + x1 r2)/(m1 + x2), r2 = (R2 + x2 r1)/(m2 + x1).
  const solve = (m1, m2, x1, x2) => {
    const lost = 1 - x1 - x2
    const R1 = (m1 - x1) / lost
    const R2 = (m2 - x2) / lost
    let r1 = 1
    let r2 = 1
    for (let i = 0; i < 2000; i++) {
      r1 = (R1 + x1 * r2) / (m1 + x2)
      r2 = (R2 + x2 * r1) / (m2 + x1)
    }
    return [r1, r2]
  }
  const probe = [[0.25, 0.25, 0.04, 0.03], [0.3, 0.15, 0.05, 0.02], [0.2, 0.2, 0, 0.03]]
  check('Eyal\'s closed form equals the fixed point of the payment equations', probe.every(([a, b, c, d]) => {
    const r = revenues(a, b, c, d)
    const s = solve(a, b, c, d)
    return close(r.r1, s[0], 1e-12) && close(r.r2, s[1], 1e-12)
  }))
  check('nobody attacks: r = 1 for everyone', close(revenues(0.25, 0.25, 0, 0).r1, 1, 1e-15) && close(revenues(0.25, 0.25, 0, 0).r2, 1, 1e-15))
  const a = alone(0.25, 0.25)
  check('two pools of 0.25, one attacks alone: x = 0.0396 (0.158 of the pool), r = 1.0187 attacker, 0.8989 victim, 1.0412 others',
    f4(a.x1) === '0.0396' && f3(a.x1 / 0.25) === '0.158' && f4(a.r1) === '1.0187' && f4(a.r2) === '0.8989' && f4(a.others) === '1.0412', `${f4(a.x1)} ${f3(a.x1 / 0.25)} ${f4(a.r1)} ${f4(a.r2)} ${f4(a.others)}`)
  const [eq, msEq] = time(() => equilibrium(0.25, 0.25))
  check('both attack (equilibrium): x = 0.0373 each (0.149), r = 0.9194 each, 1.0806 others',
    f4(eq.x1) === '0.0373' && f4(eq.x2) === '0.0373' && f3(eq.x1 / 0.25) === '0.149' && f4(eq.r1) === '0.9194' && f4(eq.others) === '1.0806', `${f4(eq.x1)} ${f3(eq.x1 / 0.25)} ${f4(eq.r1)} ${f4(eq.others)} (${eq.rounds} rounds)`)
  info(`equilibrium of two pools of 0.25 in ${msEq.toFixed(0)} ms, ${eq.rounds} rounds`)
  // Best responses at the equilibrium are best (a fine scan).
  const scan = (xj) => {
    let best = -Infinity
    for (let k = 0; k <= 200000; k++) best = Math.max(best, revenues(0.25, 0.25, (0.25 * k) / 200000, xj).r1)
    return best
  }
  check('at the equilibrium neither pool can do better (scan of 200,001 points)', scan(eq.x2) <= revenues(0.25, 0.25, eq.x1, eq.x2).r1 + 1e-9)
  const g = twoByTwo(0.25)
  check('the two-by-two game at the equilibrium rates: (1, 1), (1.0186, 0.9039), (0.9039, 1.0186), (0.9194, 0.9194)',
    f4(g.game.NN[0]) === '1.0000' && f4(g.game.AN[0]) === '1.0186' && f4(g.game.AN[1]) === '0.9039' && f4(g.game.NA[0]) === '0.9039' && f4(g.game.AA[0]) === '0.9194',
    `${f4(g.game.AN[0])} ${f4(g.game.AN[1])} ${f4(g.game.AA[0])}`)
  check('it is a prisoner\'s dilemma: T > R > P > S', g.game.AN[0] > g.game.NN[0] && g.game.NN[0] > g.game.AA[0] && g.game.AA[0] > g.game.AN[1])
  check('grim-trigger threshold 0.1877', f4(g.threshold) === '0.1877', f4(g.threshold))
  const a2 = alone(0.2, 0.2)
  const e2 = equilibrium(0.2, 0.2)
  check('two pools of 0.2: alone 0.0239, 1.0114, 0.9150; both 0.0228, 0.9283', f4(a2.x1) === '0.0239' && f4(a2.r1) === '1.0114' && f4(a2.r2) === '0.9150' && f4(e2.x1) === '0.0228' && f4(e2.r1) === '0.9283',
    `${f4(a2.x1)} ${f4(a2.r1)} ${f4(a2.r2)} ${f4(e2.x1)} ${f4(e2.r1)}`)
  const a3 = alone(0.3, 0.3)
  const e3 = equilibrium(0.3, 0.3)
  check('two pools of 0.3: alone 0.0608, 1.0284, 0.8854; both 0.0567, 0.9147', f4(a3.x1) === '0.0608' && f4(a3.r1) === '1.0284' && f4(a3.r2) === '0.8854' && f4(e3.x1) === '0.0567' && f4(e3.r1) === '0.9147',
    `${f4(a3.x1)} ${f4(a3.r1)} ${f4(a3.r2)} ${f4(e3.x1)} ${f4(e3.r1)}`)
  const eu = equilibrium(0.25, 0.15)
  check('pools of 0.25 and 0.15: both attack, 0.0228 and 0.0199, r = 0.9550 and 0.8964', f4(eu.x1) === '0.0228' && f4(eu.x2) === '0.0199' && f4(eu.r1) === '0.9550' && f4(eu.r2) === '0.8964',
    `${f4(eu.x1)} ${f4(eu.x2)} ${f4(eu.r1)} ${f4(eu.r2)}`)
  const all = [[0.25, 0.25, a.x1, 0], [0.25, 0.25, eq.x1, eq.x2], [0.2, 0.2, e2.x1, e2.x2], [0.3, 0.3, e3.x1, e3.x2], [0.25, 0.15, eu.x1, eu.x2]]
  check('in every case m1 r1 + m2 r2 + (1 − m1 − m2)/(1 − x1 − x2) = 1', all.every((c) => close(totalPaid(...c), 1, 1e-12)))
}

// ------------------------------------------------------------------ Texts

const textsPath = resolve(root, 'src/components/lab/game-theory/repeated-games-reputation/texts.js')
const lecturePath = (l) => `src/content/game-theory-lab/repeated-games-reputation.${l}.md`
if (existsSync(textsPath) && existsSync(resolve(root, lecturePath('en'))) && existsSync(resolve(root, lecturePath('it')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsPath).href)
  const lecture = { en: read(lecturePath('en')).replace(/\r/g, ''), it: read(lecturePath('it')).replace(/\r/g, '') }
  const itn = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // decimals written the Italian way
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : itn(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const pct = (x) => (100 * x).toFixed(1)
  const body = (l) => lecture[l].split('<!-- simulation -->')[0]
  const box = (l) => (body(l).match(/```box[\s\S]*?```/) || [''])[0]
  const noBox = { en: body('en').replace(/```box[\s\S]*?```/, ''), it: body('it').replace(/```box[\s\S]*?```/, '') }
  const boxText = { en: box('en'), it: box('it') }

  // ---- The lecture
  check('lecture numbers are the code\'s: 1/(1 − 0.9) = 10; δ* = 1/2 at T = 5; (2.5, 2.5) needs 0.4, (3, 3) 0.5; giving up 1 and 2',
    close(1 / (1 - 0.9), 10, 1e-9) && threshold(5) === 0.5 && deltaNeeded([2.5, 2.5]).delta === 0.4 && deltaNeeded([3, 3]).delta === 0.5 && 1 - 0 === 1 && 5 - 3 === 2)
  quoted('lecture: playing again and the threshold', noBox, ['δ = 0.9', ['which is 10', 'cioè 10'], 'R = 3', 'S = 0', 'T = 5', 'P = 1', '= 1/2', ['0 instead of 1', '0 invece di 1'], '(1 − δ)5 + δ', 'Blackwell 1965', '/lab/cooperation'])
  quoted('lecture: the folk theorem', noBox, ['(2.5, 2.5)', 'δ ≥ 0.4', ['which needs 0.5', 'che richiede 0,5'], ['1 instead of 0', '1 invece di 0'], ['5 instead of 3', '5 invece di 3'], 'Friedman (1971)', '(1986)', ['1950s', 'anni Cinquanta']])
  const c2 = levels(2, 'cournot')
  check('lecture numbers are the code\'s: 2.25, 10.125, 9, 3.375, 11.390625, 9/17; 0.571, 0.643, 0.752; Bertrand 0.5, 0.667, 0.8, 0.9; q(0.3) = 2.586, 9.899',
    cartelOutput(2) === 2.25 && c2.cartel === 10.125 && c2.punishment === 9 && c2.cheat === 11.390625 && f3(cournotThreshold(3)) === '0.571' && f3(cournotThreshold(5)) === '0.643' && f3(cournotThreshold(10)) === '0.752'
    && [2, 3, 5, 10].map((n) => f3(bertrandThreshold(n))).join() === '0.500,0.667,0.800,0.900' && f3(heldCournot(0.3, 2).q) === '2.586' && f3(heldCournot(0.3, 2).profit) === '9.899'
    && close((27 - 15 * 0.3) / (9 - 0.3), heldOutputClosed(0.3, 2), 1e-12))
  quoted('lecture: collusion', noBox, ['a = 10, c = 1', '2.25', '10.125', '3.375', '11.390625', '9/17 ≈ 0.529', '0.571', '0.643', '0.752', '(n − 1)/n', '0.667', '0.8', '0.9', '(27 − 15δ) / (9 − δ)', '2.586', '9.899', 'δ = 0.3'])
  const gpd = evaluate(GP)
  const ld = [0.25, 0.5, 0.75, 1].map((s) => f2(leastDelta(s, 30)))
  check('lecture numbers are the code\'s: 2.3% and 60%; peace 0.898; L = 2 pays; least δ 0.53, 0.54, 0.64, 0.75, 0.83',
    pct(gpd.p0) === '2.3' && Math.round(100 * gpd.p1) === 60 && f3(gpd.peace) === '0.898' && evaluate({ ...GP, L: 2 }).margin < 0 && gpd.margin > 0 && f2(NOISELESS) === '0.53' && ld.join() === '0.54,0.64,0.75,0.83', ld.join())
  quoted('lecture: price wars', noBox, ['σ = 0.5', 'p̄ = 4.5', 'L = 5', '2.3%', '60%', '0.898', 'L = 2', '3.375', '9/17 ≈ 0.53', '0.54', '0.64', '0.75', '0.83', 'σ = 0.25', '1880–1886', 'Green', 'Porter (1983)'])
  const tp = toughPath(0.05, 20, -1)
  check('lecture numbers are the code\'s: 20 markets; first 13 stay out; last 7; 66 against 40; b = 2/3 at w = −1',
    deterred(0.05, 20, base(-1)) === 13 && 20 - 13 === 7 && deterred(0.05, 100, base(-1)) === 93 && weakPayoff(0.05, 20, -1) === 66 && weakPayoff(0, 20, -1) === 40 && close(base(-1), 2 / 3, 1e-15) && tp.entries === 4)
  quoted('lecture: the chain store and reputation', noBox, [['20 towns', '20 città'], '(0, 4)', '(2, 2)', '(−1, 0)', ['all 20 times', 'tutte e 20 le volte'], 'Selten (1978)', '3', 't = 0.05', ['first 13', 'primi 13'], ['last 7', 'ultimi 7'], '66', '40', 'b = 2/(2 − w)', '(2/3', 'w = −1', '(1982)'])
  // ---- The box
  const a = alone(0.25, 0.25)
  const eq = equilibrium(0.25, 0.25)
  const g = twoByTwo(0.25)
  check('box numbers are the code\'s: 15.8%, +1.9%, −10.1%, +4.1%; 14.9%, −8.1%, +8.1%; (1.019, 0.904), (0.919, 0.919); δ ≥ 0.19',
    pct(a.x1 / 0.25) === '15.8' && pct(a.r1 - 1) === '1.9' && pct(1 - a.r2) === '10.1' && pct(a.others - 1) === '4.1' && pct(eq.x1 / 0.25) === '14.9' && pct(1 - eq.r1) === '8.1' && pct(eq.others - 1) === '8.1'
    && f3(g.game.AN[0]) === '1.019' && f3(g.game.AN[1]) === '0.904' && f3(g.game.AA[0]) === '0.919' && f2(g.threshold) === '0.19')
  quoted('the box', boxText, ['25%', '15.8%', '1.9%', '10.1%', '4.1%', '14.9%', '8.1%', '(1, 1)', '(1.019, 0.904)', '(0.904, 1.019)', '(0.919, 0.919)', 'δ ≥ 0.19', 'Eyal (2015)'])

  // ---- What to observe, Panel A
  {
    const h05 = held(0.5, 2, 'cournot')
    const h053 = held(0.53, 2, 'cournot')
    const h03 = held(0.3, 2, 'cournot')
    const h0 = held(0, 2, 'cournot')
    const b05 = held(0.5, 2, 'bertrand')
    const b049 = held(0.49, 2, 'bertrand')
    const h10 = held(0.5, 10, 'cournot')
    const b10 = held(0.75, 10, 'bertrand')
    check('observe A: the defaults are n = 2, δ = 0.5 (in the panel); the table rows', thresholdTable().every((r) => r.cournot > 0 && r.bertrand > 0) && bertrandThreshold(2) < cournotThreshold(2) && [3, 4, 5, 6, 7, 8, 9, 10].every((n) => bertrandThreshold(n) > cournotThreshold(n)))
    quoted('observe, Panel A', observe.cartel, [
      'δ = 0.5', f4(cournotThreshold(2)), f4(h05.q), f4(h05.profit), f3(h05.share), ['From δ = 0.53', 'Da δ = 0,53'], h053.q === 2.25 ? '2.25' : 'x', '10.125',
      f4(h03.q), f4(h03.profit), f3(h03.share), [`only Cournot is left, ${h0.q} and ${h0.profit}`, `resta solo Cournot, ${h0.q} e ${h0.profit}`],
      b05.price === 5.5 ? '5.5' : 'x', ['at 0.49 nothing holds and the profit is 0', 'a 0,49 non regge nulla e il profitto è 0'].map((s) => (b049.profit === 0 ? s : 'x')),
      f4(cournotThreshold(10)), f4(h10.q), f4(h10.profit), f3(h10.share), b10.profit === 0 ? 'δ = 0.75' : 'x', '0.9',
      [`(${f3(bertrandThreshold(2))} against ${f3(cournotThreshold(2))})`, `(${itn(f3(bertrandThreshold(2)))} contro ${itn(f3(cournotThreshold(2)))})`],
      [`(${f3(bertrandThreshold(3))} against ${f3(cournotThreshold(3))}, and ${f3(bertrandThreshold(10))} against ${f3(cournotThreshold(10))}`, `(${itn(f3(bertrandThreshold(3)))} contro ${itn(f3(cournotThreshold(3)))}, e ${itn(f3(bertrandThreshold(10)))} contro ${itn(f3(cournotThreshold(10)))}`],
    ])
  }

  // ---- What to observe, Panel B
  {
    const e = evaluate(GP)
    const s1 = sample(GP, 200, 1)
    const s2 = sample(GP, 200, 2)
    const s4 = sample(GP, 200, 4)
    const e2 = evaluate({ ...GP, L: 2 })
    const e3 = evaluate({ ...GP, L: 3 })
    const br = bestRule(0.5, 0.9)
    const sb = sample({ ...GP, trigger: br.trigger, L: br.L }, 200, 1)
    const e1 = evaluate({ ...GP, sigma: 1 })
    const br1 = bestRule(1, 0.9)
    check('observe B: δ = 0.6 at σ = 0.5 has no rule; the best rule\'s sample no. 1 has no war', bestRule(0.5, 0.6) === null && sb.wars === 0)
    quoted('observe, Panel B', observe.wars, [
      f4(e.p0), f4(e.p1), f4(e.margin), f4(e.value), f4(e.peace), f4(e.longRun), [`Sample no. 1 has ${s1.wars} wars and a quiet share of ${f3(s1.quiet)}`, `Il campione n. 1 ha ${s1.wars} guerre e una quota di turni tranquilli di ${itn(f3(s1.quiet))}`],
      [`${f3(s2.quiet)} with ${s2.wars} wars in sample no. 2, ${f3(s4.quiet)} with ${s4.wars} wars in sample no. 4`, `${itn(f3(s2.quiet))} con ${s2.wars} guerre nel campione n. 2, ${itn(f3(s4.quiet))} con ${s4.wars} guerre nel campione n. 4`],
      f4(e2.margin).replace('-', '−'), f4(e3.margin), [`p̄ = ${br.trigger} and L = ${br.L}, value ${f4(br.value)}`, `p̄ = ${itn(String(br.trigger))} e L = ${br.L}, valore ${itn(f4(br.value))}`], `p0 = ${f4(br.p0)}`, f4(br.peace), `p1 = ${f4(br.p1)}`,
      f4(e1.margin).replace('-', '−'), [`p̄ = ${br1.trigger} and L = ${br1.L}, value ${f4(br1.value)}`, `p̄ = ${itn(String(br1.trigger))} e L = ${br1.L}, valore ${itn(f4(br1.value))}`], f3(br1.peace), f4(leastDelta(0.5, 30)),
    ])
    let near = true
    for (let seed = 1; seed <= 10; seed++) if (!close(sample(GP, 100000, seed).quiet, 0.898, 0.01)) near = false
    check('observe B: over 100,000 rounds the quiet share settles near 0.898 (seeds 1–10 within 0.01)', near)
  }

  // ---- What to observe, Panel C
  {
    const ex = expectWeak(0.05, 20, -1)
    const h = history(CS, 'weak', 1)
    const ht = history(CS, 'tough', 1)
    const s = simulateWeak(CS, 10000, 1)
    const fightsAt = ht.markets.map((m, i) => (m.move === 'fight' ? i + 1 : 0)).filter(Boolean)
    const tieAt = ht.markets.map((m, i) => (i >= 13 && m.move === 'out' ? i + 1 : 0)).filter(Boolean)
    check('observe C: history no. 1 shares at market 14 and the last six enter; tough fights at 14, 16, 18, 20, out at 15, 17, 19',
      h.markets[13].move === 'share' && h.markets.slice(14).every((m) => m.move === 'share') && same(fightsAt, [14, 16, 18, 20]) && same(tieAt, [15, 17, 19]))
    check('observe C: 10,000 chains give 66 in every chain', s.minPay === 66 && s.maxPay === 66)
    quoted('observe, Panel C', observe.reputation, [
      `D = ${deterred(0.05, 20, base(-1))}`, 'k ≥ 8', String(weakPayoff(0.05, 20, -1)), f4(ex.entries), f4(ex.fights), ['market 14', 'mercato 14'],
      ['14, 16, 18 and 20', '14, 16, 18 e 20'], ['15, 17 and 19', '15, 17 e 19'], ['76 with 4 entries', '76 con 4 entrate'].map((x) => (tp.pay === 76 ? x : 'x')),
      f4(s.entries), f4(s.fights), ['all 20 times (40)', 'tutte e 20 le volte (40)'], ['all 20 (60)', 'tutte e 20 (60)'].map((x) => (toughPath(0, 20, -1).pay === 60 ? x : 'x')),
      [`${deterred(0.5, 20, base(-1))} newcomers are deterred and the weak incumbent earns ${weakPayoff(0.5, 20, -1)}`, `sono scoraggiati ${deterred(0.5, 20, base(-1))} entranti e l'incumbent debole guadagna ${weakPayoff(0.5, 20, -1)}`],
      `(2/3)^5 = ${f4((2 / 3) ** 5)}`, ['earns 10', 'guadagna 10'].map((x) => (weakPayoff(0.05, 5, -1) === 10 && deterred(0.05, 5, base(-1)) === 0 ? x : 'x')),
      [`${deterred(0.05, 50, base(-1))} are deterred and it earns ${weakPayoff(0.05, 50, -1)}`, `ne sono scoraggiati ${deterred(0.05, 50, base(-1))} e guadagna ${weakPayoff(0.05, 50, -1)}`], 'N ≥ 7',
      [`(b = ${base(-2)}) ${deterred(0.05, 20, base(-2))} newcomers are deterred and the weak incumbent earns ${weakPayoff(0.05, 20, -2)}`, `(b = ${itn(String(base(-2)))}) sono scoraggiati ${deterred(0.05, 20, base(-2))} entranti e l'incumbent debole guadagna ${weakPayoff(0.05, 20, -2)}`],
      [`(b = ${base(-0.5)}) only ${deterred(0.05, 20, base(-0.5))}, and it earns ${weakPayoff(0.05, 20, -0.5)}`, `(b = ${itn(String(base(-0.5)))}) solo ${deterred(0.05, 20, base(-0.5))}, e guadagna ${weakPayoff(0.05, 20, -0.5)}`],
    ])
  }

  // ---- The exercises
  {
    const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
    quoted('exercise 1', sol(0), ['δ ≥ 1/2', 'δ ≥ 2/3', '1/(1 − δ) = 10', ['0 instead of 1', '0 invece di 1']])
    quoted('exercise 2', sol(1), ['= 9/17', '= 4/7', ['1/2 and 2/3', '1/2 e 2/3'], '22.5/8.7 = 2.586', '9.899'])
    check('exercise 3 numbers are the code\'s', close(area(rationalSet()), 20 / 3, 1e-12) && deltaNeeded([3, 3]).delta === 0.5 && deltaNeeded([2.5, 2.5]).delta === 0.4 && deltaNeeded([2, 2]).delta === 0.5)
    quoted('exercise 3', sol(2), ['(1, 13/3)', '(13/3, 1)', '20/3', '0.5', 'δ ≥ 0.4', ['half each', 'metà ciascuna'], ['a third each', 'un terzo ciascuna']])
    const e5 = evaluate({ ...GP, L: 5 })
    check('exercise 4 numbers are the code\'s', f4(e5.p0) === '0.0228' && f4(e5.p1) === '0.5987' && f3(e5.margin) === '0.938' && f3(1 - e5.peace) === '0.102' && f3(evaluate({ ...GP, L: 3 }).margin) === '0.232' && f3(evaluate({ ...GP, L: 2 }).margin) === '-0.199')
    quoted('exercise 4', sol(3), ['0.0228', '0.5987', '0.938', '0.898', '0.102', 'L = 3', '0.232', '−0.199'])
    const b = base(-1)
    check('exercise 5 numbers are the code\'s', f3(b ** 8) === '0.039' && f4(b ** 7) === '0.0585' && f3(fightProb(0.05, 7, b)) === '0.547' && f4(b ** 6) === '0.0878' && 13 * 4 + 7 * 2 === 66)
    quoted('exercise 5', sol(4), ['k ≥ 8', '0.039', '0.0585', ['first 13', 'primi 13'], '0.547', '0.0878', '13 × 4 + 7 × 2 = 66', '40'])
    check('exercise 6 numbers are the code\'s', deterred(0.05, 5, b) === 0 && weakPayoff(0.05, 5, -1) === 10 && f3(b ** 5) === '0.132' && deterred(0.05, 50, b) === 43 && weakPayoff(0.05, 50, -1) === 186 && f2(expectWeak(0.05, 50, -1).entries) === '6.17')
    quoted('exercise 6', sol(5), ['(2/3)^5 = 0.132', '10', '43', '43 × 4 + 7 × 2 = 186', '100', '6.17', 'N ≥ 7'])
  }

  // ---- The rules of the lab
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language (the box not counted), with the DRAFT marker on the first line',
    ['en', 'it'].every((l) => words(noBox[l]) >= 1400 && words(noBox[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(noBox[l])}`).join(', '))
  const allText = (l) => lecture[l] + observe.cartel[l] + observe.wars[l] + observe.reputation[l] + exercises.map((x) => x.statement[l] + x.solution[l]).join(' ')
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l))))
  check('the lecture links to the Complexity Lab\'s module 11 and has one Bitcoin box', ['en', 'it'].every((l) => lecture[l].includes('(/lab/cooperation)') && (lecture[l].match(/```box/g) || []).length === 1))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
if (failures) process.exitCode = 1
