// Self-checks for Game Theory Lab module 07, "Evolution and learning". They
// run the same code as the page (ess.js, replicator.js, moran.js,
// correlated.js, hedge.js) and compare it with exact values, closed forms,
// independent computations and the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-07.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// defaults, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { ess2, symmetricNash2, essByMutants, HAWK_DOVE, DILEMMA, STAG, u } from '../../src/components/lab/game-theory/evolution-and-learning/ess.js'
import {
  xdot, interior, restPoints, fate, phaseAt, F1_PRESETS, field, rps, repeatedMatrix, repeatedThresholds, trajectory, statesAt, product,
  centreEigen, numericEigen, period, toXY, fromXY, rk4,
} from '../../src/components/lab/game-theory/evolution-and-learning/replicator.js'
import {
  GAMES, swapRoles, fitness, fixation, fixationConstant, closedForm, constantFit, xStar, thirdRule, riskDominant, curve, runMany, moranStep,
} from '../../src/components/lab/game-theory/evolution-and-learning/moran.js'
import { trafficLight, formulas, chicken, correlatedVertices, obedience, payoffOf, violation } from '../../src/components/lab/game-theory/evolution-and-learning/correlated.js'
import { run, bound, tunedEta, tunedBound, HEDGE_GAMES, equilibria, fromCentre, nearestPure, hedgeGame } from '../../src/components/lab/game-theory/evolution-and-learning/hedge.js'

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
// Four significant digits (two below 1e-6), as the prompt states its values.
const sig = (x) => (Math.abs(x) < 1e-6 ? x.toPrecision(2) : x.toPrecision(4))
// Within half a unit of the last digit kept (relative 5e-4, or 5e-2 below 1e-6).
const sameSig = (x, want) => Math.abs(x - want) <= Math.abs(want) * (Math.abs(want) < 1e-6 ? 5e-2 : 5e-4)

// ------------------------------------------------------------------ ESS

console.log('— ESS')
{
  const hd = ess2(HAWK_DOVE)
  check('chicken as hawk and dove: the only ESS is half doves, half hawks; neither pure strategy', hd.length === 1 && close(hd[0], 0.5, 1e-12), JSON.stringify(hd))
  check('  doves are invaded by hawks (4 > 3), hawks by doves (1 > 0)', HAWK_DOVE[1][0] === 4 && HAWK_DOVE[0][0] === 3 && HAWK_DOVE[0][1] === 1 && HAWK_DOVE[1][1] === 0)
  check('the dilemma: D is the ESS, nothing else', same(ess2(DILEMMA), [0]))
  const st = ess2(STAG)
  const nashSt = symmetricNash2(STAG)
  check('the stag hunt: both pure strategies are ESS; the mixed equilibrium (2/3 stag) is not', same(st, [1, 0]) && nashSt.length === 3 && close(nashSt[1], 2 / 3, 1e-12), `ESS ${JSON.stringify(st)}, Nash ${nashSt.map(f4).join(' ')}`)
  const random = mulberry32(7)
  check('the numerical test agrees: (1/2, 1/2) in chicken, D in the dilemma, stag and hare; not the stag hunt\'s mixture, not pure doves or hawks',
    essByMutants(HAWK_DOVE, [0.5, 0.5], random) && essByMutants(DILEMMA, [0, 1], random) && essByMutants(STAG, [1, 0], random) && essByMutants(STAG, [0, 1], random)
    && !essByMutants(STAG, [2 / 3, 1 / 3], random) && !essByMutants(HAWK_DOVE, [1, 0], random) && !essByMutants(HAWK_DOVE, [0, 1], random))
  const c = [1 / 3, 1 / 3, 1 / 3]
  check('rock, paper, scissors: the centre is an ESS when a > b, not when a = b or a < b',
    essByMutants(rps(1.5, 1), c, random) && !essByMutants(rps(1, 1), c, random) && !essByMutants(rps(1, 1.5), c, random))
  check('every ESS found is a symmetric Nash equilibrium', [HAWK_DOVE, DILEMMA, STAG].every((A) => ess2(A).every((p) => symmetricNash2(A).some((q) => close(p, q, 1e-12)))))
  check('u(x, y) is bilinear: u(½,½ ; ½,½) in chicken = 2', close(u(HAWK_DOVE, [0.5, 0.5], [0.5, 0.5]), 2, 1e-15))
}

// ------------------------------------------------------------------ F1

console.log('— F1: four fates on the (T, S) map')
{
  const P = F1_PRESETS
  check('presets from module 01\'s tables: dilemma (2, −0.5), stag hunt (0.5, −1), chicken (4/3, 1/3), harmony (0.5, 0.5)',
    P.pd.T === 2 && P.pd.S === -0.5 && P.stag.T === 0.5 && P.stag.S === -1 && close(P.chicken.T, 4 / 3, 1e-15) && close(P.chicken.S, 1 / 3, 1e-15) && P.harmony.T === 0.5 && P.harmony.S === 0.5)
  const fp = fate(P.pd.T, P.pd.S)
  const fs = fate(P.stag.T, P.stag.S)
  const fc = fate(P.chicken.T, P.chicken.S)
  const fh = fate(P.harmony.T, P.harmony.S)
  check('dilemma: D takes over, no interior point; 0 stable, 1 unstable', fp.kind === 'D' && fp.xStar === null && fp.rest[0].stable === true && fp.rest[1].stable === false)
  check('stag hunt: bistable, x* = 2/3 unstable, 0 and 1 stable', fs.kind === 'bistable' && close(fs.xStar, 2 / 3, 1e-12) && fs.rest[1].stable === false && fs.rest[0].stable === true && fs.rest[2].stable === true)
  check('chicken: coexistence at x* = 1/2, stable; 0 and 1 unstable', fc.kind === 'coexist' && close(fc.xStar, 0.5, 1e-12) && fc.rest[1].stable === true && fc.rest[0].stable === false && fc.rest[2].stable === false)
  check('harmony: C takes over', fh.kind === 'C' && fh.xStar === null && fh.rest[1].stable === true && fh.rest[0].stable === false)
  check('x* = S/(S + T − 1) is module 02\'s q* in the stag hunt (2/3) and 1/2 in chicken', close(interior(0.5, -1), 2 / 3, 1e-15) && close(interior(4 / 3, 1 / 3), 0.5, 1e-12))
  check('exercise 2: (4/3, 1/3) → 1/2 stable; (1/2, −1) → 2/3 unstable; (2, −1/2) → none, D takes over',
    close(fate(4 / 3, 1 / 3).xStar, 0.5, 1e-12) && fate(4 / 3, 1 / 3).rest[1].stable === true && close(fate(0.5, -1).xStar, 2 / 3, 1e-12) && fate(0.5, -1).rest[1].stable === false && fate(2, -0.5).xStar === null && fate(2, -0.5).kind === 'D')
  // Independent: ẋ from the two fitnesses.
  const T = 1.3
  const S = -0.4
  const x = 0.37
  const fC = x + S * (1 - x)
  const fD = T * x
  check('ẋ = x(1 − x)[(1 − T)x + S(1 − x)] equals x(f_C − f̄)', close(xdot(x, T, S), x * (fC - (x * fC + (1 - x) * fD)), 1e-15))
  const r = (x0, t, p = P.chicken) => phaseAt(p.T, p.S, x0, t)
  const ch = [r(0.1, 10), r(0.1, 20), r(0.1, 50), r(0.9, 10), r(0.9, 20), r(0.9, 50)]
  check('RK4, chicken from 0.1: 0.3779, 0.4762, 0.4998 at t = 10, 20, 50; from 0.9: 0.6221, 0.5238, 0.5002', same(ch.map(f4), ['0.3779', '0.4762', '0.4998', '0.6221', '0.5238', '0.5002']), ch.map(f4).join(' '))
  const sh = [r(0.6, 10, P.stag), r(0.7, 10, P.stag)]
  check('stag hunt from 0.6: 0.0043 at t = 10; from 0.7: 0.9558', f4(sh[0]) === '0.0043' && f4(sh[1]) === '0.9558', sh.map(f4).join(' '))
  const pd = [r(0.99, 5, P.pd), r(0.99, 10, P.pd)]
  check('dilemma from 0.99: 0.4992 at t = 5, 0.0472 at t = 10', f4(pd[0]) === '0.4992' && f4(pd[1]) === '0.0472', pd.map(f4).join(' '))
  // Independent: chicken is ẋ = x(1 − x)(1 − 2x)/3, which has a closed form
  // through ln[x(1 − x)/(1 − 2x)²]... simpler: halve dt and compare.
  const fine = phaseAt(P.chicken.T, P.chicken.S, 0.1, 10, 0.001)
  check('halving the step changes nothing at 4 decimals (dt = 0.001 vs 0.01)', f4(fine) === f4(ch[0]), `${fine.toFixed(8)} ${ch[0].toFixed(8)}`)
  check('on the border: T = 1 or S = 0 is reported as a border', fate(1, 0.5).border && fate(1.5, 0).border && !fate(1.5, 0.5).border)
  check('rest points always include 0 and 1', [[0.3, 0.7], [1.7, -0.8], [1.2, 0.2], [0.4, -0.6]].every(([a, b]) => restPoints(a, b)[0].x === 0 && restPoints(a, b).at(-1).x === 1))
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: rock, paper, scissors in a population')
const X0 = [0.5, 0.3, 0.2]
{
  const A = rps(1, 1)
  const traj = trajectory(A, X0, { keep: 1 })
  const dev = Math.max(...traj.points.map((x) => Math.abs(product(x) - 0.03)))
  check('a = b = 1: V = x_R x_P x_S stays 0.03 within 1e-9 up to t = 100', dev < 1e-9, dev.toExponential(2))
  const [per, msPer] = time(() => period(A, X0))
  check('the orbit\'s period (between maxima of x_R) is 11.398 within 0.01', close(per.period, 11.398, 0.01), per.period.toFixed(4))
  check('small cycles have period 2π√3 ≈ 10.883; this orbit is longer', close(2 * Math.PI * Math.sqrt(3), 10.883, 5e-4) && per.period > 10.883)
  check('the average over one period is (1/3, 1/3, 1/3) within 1e-3', per.average.every((v) => close(v, 1 / 3, 1e-3)), per.average.map(f4).join(' '))
  info(`period found in ${msPer.toFixed(0)} ms; peaks at ${per.peaks.slice(0, 3).map(f3).join(', ')}`)
  const ts = [5, 10, 25, 50]
  const want = {
    '2,1': [0.0355059, 0.0367385, 0.037035, 0.037037],
    '1.5,1': [0.0336301, 0.0355007, 0.0369071, 0.037035],
    '1,2': [0.0148565, 0.00249612, 1.11949e-7, 1.2794e-17],
    '1,1.5': [0.0238573, 0.0147011, 0.000702999, 5.86347e-8],
  }
  for (const [k, w] of Object.entries(want)) {
    const [a, b] = k.split(',').map(Number)
    const V = statesAt(rps(a, b), X0, ts).map(product)
    check(`a = ${a}, b = ${b}: V at t = 5, 10, 25, 50 is ${w.join(', ')} (4 significant digits; 2 below 1e-6)`, V.every((v, i) => sameSig(v, w[i])), V.map(sig).join(' '))
  }
  // Exercise 3: dV/dt = V(a − b)(1 − 3σ₂) at a random point.
  const x = [0.2, 0.45, 0.35]
  const fv = field(rps(1.7, 0.6))(x)
  const Vdot = fv[0] * x[1] * x[2] + x[0] * fv[1] * x[2] + x[0] * x[1] * fv[2]
  const sigma2 = x[0] * x[1] + x[1] * x[2] + x[2] * x[0]
  check('exercise 3: dV/dt = V(a − b)(1 − 3(x_R x_P + x_P x_S + x_S x_R))', close(Vdot, product(x) * (1.7 - 0.6) * (1 - 3 * sigma2), 1e-15))
  const eig = [[1, 1], [2, 1], [1, 2], [1.5, 1]].map(([a, b]) => [centreEigen(a, b), numericEigen(rps(a, b))])
  const wantEig = [[0, 0.57735], [-0.16667, 0.86603], [0.16667, 0.86603], [-0.08333, 0.72169]]
  check('eigenvalues at the centre: ±0.57735i; −0.16667 ± 0.86603i; +0.16667 ± 0.86603i; −0.08333 ± 0.72169i (formula and numerical Jacobian)',
    eig.every(([f, n], i) => f.re.toFixed(5) === wantEig[i][0].toFixed(5) && f.im.toFixed(5) === wantEig[i][1].toFixed(5) && close(f.re, n.re, 1e-7) && close(f.im, n.im, 1e-7)),
    eig.map(([f, n]) => `${f.re.toFixed(5)}±${f.im.toFixed(5)}i/${n.re.toFixed(5)}±${n.im.toFixed(5)}i`).join(' '))
  // The repeated dilemma.
  const M = repeatedMatrix()
  check('the preset\'s matrix, played out: [[30, 0, 30], [50, 10, 14], [30, 9, 30]]', same(M, [[30, 0, 30], [50, 10, 14], [30, 9, 30]]), JSON.stringify(M))
  const th = repeatedThresholds(M)
  check('thresholds 1/17 ≈ 0.059 (Tit for Tat against always defect) and 4/9 (always cooperate in its mix with Tit for Tat)', close(th.tft, 1 / 17, 1e-15) && close(th.allc, 4 / 9, 1e-15) && f3(th.tft) === '0.059')
  // Independent: on the D–TFT edge the dynamics go up above 1/17, down below.
  const edge = (y) => field(M)([0, 1 - y, y])[2]
  check('on the defect–Tit for Tat edge Tit for Tat grows above 1/17 and shrinks below', edge(1 / 17 + 0.001) > 0 && edge(1 / 17 - 0.001) < 0)
  const cEdge = (x) => field(M)([x, 0, 1 - x])
  check('on the cooperate–Tit for Tat edge nothing moves', [0.1, 0.5, 0.9].every((x) => cEdge(x).every((v) => Math.abs(v) < 1e-12)))
  const invade = (x) => M[1][0] * x + M[1][2] * (1 - x) - 30
  check('always defect can invade where always cooperate is more than 4/9: 14 + 36x > 30', invade(4 / 9 + 1e-3) > 0 && invade(4 / 9 - 1e-3) < 0 && M[1][2] === 14 && M[1][0] - M[1][2] === 36)
  const ends = [
    [[0.2, 0.2, 0.6], [0.1983, 0, 0.8017]],
    [[0.1, 0.6, 0.3], [0.0653, 0, 0.9347]],
    [[0.45, 0.1, 0.45], [0.2987, 0, 0.7013]],
    [[0.6, 0.05, 0.35], [0.1866, 0, 0.8134]],
  ]
  for (const [s, w] of ends) {
    const e = trajectory(M, s).end
    check(`from (${s.join(', ')}) the state at t = 100 is (${w.join(', ')})`, e.every((v, i) => f4(Math.abs(v)) === w[i].toFixed(4)), e.map(f4).join(' '))
  }
  for (const s of [[0.1, 0.85, 0.05], [0.3, 0.65, 0.05], [0.05, 0.9, 0.05]]) {
    const e = trajectory(M, s).end
    check(`from (${s.join(', ')}) always defect takes over`, e[1] > 0.999, e.map(f4).join(' '))
  }
  // Simplex coordinates.
  const pts = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.2, 0.5, 0.3]]
  check('simplex coordinates go there and back', pts.every((p) => fromXY(...toXY(p, 300, 10, 5), 300, 10, 5).every((v, i) => close(v, p[i], 1e-12))))
  const [, msTraj] = time(() => trajectory(rps(1, 1.5), X0))
  info(`one trajectory to t = 100 (10,000 RK4 steps) in ${msTraj.toFixed(1)} ms`)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: one mutant (the Moran process)')
{
  const cases = [[1, 10, 0.1], [1.1, 10, 0.14795], [1.1, 50, 0.09169], [1.5, 20, 0.333434], [0.9, 10, 0.059482], [1.01, 100, 0.015709]]
  const got = cases.map(([r, N]) => fixationConstant(r, N).rhoA)
  check('constant fitness: 0.1 (neutral, N = 10), 0.147950, 0.091690, 0.333434, 0.059482, 0.015709',
    got.every((g, i) => g.toFixed(6) === cases[i][2].toFixed(6)), got.map((g) => g.toFixed(6)).join(' '))
  check('  each equals the closed form (1 − 1/r)/(1 − 1/r^N)', cases.every(([r, N], i) => close(got[i], closedForm(r, N), 1e-14)))
  const N50 = (g, N, w) => {
    const { rhoA, rhoB } = fixation(g, N, w)
    return [N * rhoA, N * rhoB]
  }
  const stag = GAMES.stag('stag')
  const rows = [[50, 0.01, 0.7722, 1.0113], [100, 0.01, 0.5949, 1.0004], [50, 0.1, 0.0642, 0.9206], [100, 0.1, 0.0035, 0.5959], [20, 0.1, 0.3391, 1.0951], [10, 0.1, 0.5736, 1.1275]]
  for (const [N, w, a, b] of rows) {
    const [x, y] = N50(stag, N, w)
    check(`stag hunt N = ${N}, w = ${w}: N·ρ_stag ${a}, N·ρ_hare ${b}`, f4(x) === a.toFixed(4) && f4(y) === b.toFixed(4), `${f4(x)} ${f4(y)}`)
  }
  const s50 = fixation(stag, 50, 0.1)
  check('N = 50, w = 0.1: ρ_stag 0.001284, ρ_hare 0.018412, ratio 14.34', s50.rhoA.toFixed(6) === '0.001284' && s50.rhoB.toFixed(6) === '0.018412' && (s50.rhoB / s50.rhoA).toFixed(2) === '14.34',
    `${s50.rhoA.toFixed(6)} ${s50.rhoB.toFixed(6)} ${(s50.rhoB / s50.rhoA).toFixed(2)}`)
  const hare = fixation(GAMES.stag('hare'), 50, 0.1)
  check('swapping the roles of A and B swaps ρ_A and ρ_B (the switch stag/hare)', close(hare.rhoA, s50.rhoB, 1e-15) && close(hare.rhoB, s50.rhoA, 1e-15))
  const sw = [GAMES.pd('C'), GAMES.chicken('dove'), GAMES.coordination(0.3)].every((g) => {
    const x = fixation(g, 37, 0.2)
    const y = fixation(swapRoles(g), 37, 0.2)
    return close(x.rhoA, y.rhoB, 1e-15) && close(x.rhoB, y.rhoA, 1e-15)
  })
  check('  and the same for the dilemma, chicken and the coordination game', sw)
  const pd1 = N50(GAMES.pd('C'), 50, 0.1)
  const pd2 = N50(GAMES.pd('C'), 50, 0.01)
  check('dilemma N = 50: N·ρ_C, N·ρ_D = 0.0080, 7.1675 (w = 0.1); 0.6924, 1.4792 (w = 0.01)', [pd1, pd2].flat().map(f4).join() === '0.0080,7.1675,0.6924,1.4792', [pd1, pd2].flat().map(f4).join(' '))
  const ch1 = N50(GAMES.chicken('dove'), 50, 0.1)
  const ch2 = N50(GAMES.chicken('dove'), 50, 0.01)
  check('chicken N = 50: N·ρ_dove, N·ρ_hawk = 1.8769, 2.0126 (w = 0.1); 1.0669, 1.0964 (w = 0.01)', [ch1, ch2].flat().map(f4).join() === '1.8769,2.0126,1.0669,1.0964', [ch1, ch2].flat().map(f4).join(' '))
  const coord = (N, w, xs) => xs.map((x) => f4(N * fixation(GAMES.coordination(x), N, w).rhoA))
  const c1 = coord(50, 0.01, [0.2, 0.25, 0.3, 1 / 3, 0.4, 0.5])
  const c2 = coord(50, 0.1, [0.2, 0.25, 0.3, 1 / 3, 0.4, 0.5])
  const c3 = coord(100, 0.01, [0.2, 0.3, 1 / 3, 0.35, 0.4, 0.5])
  check('coordination N = 50, w = 0.01: N·ρ_A 1.0393, 1.0257, 1.0103, 0.9989, 0.9727, 0.9221 at x* = 0.2, 0.25, 0.3, 1/3, 0.4, 0.5', same(c1, ['1.0393', '1.0257', '1.0103', '0.9989', '0.9727', '0.9221']), c1.join(' '))
  check('coordination N = 50, w = 0.1: 1.3106, 1.1613, 1.0076, 0.9036, 0.6953, 0.4', same(c2, ['1.3106', '1.1613', '1.0076', '0.9036', '0.6953', '0.4000']), c2.join(' '))
  check('coordination N = 100, w = 0.01: 1.0784, 1.0189, 0.9959, 0.9836, 0.9437, 0.8462 at x* = 0.2, 0.3, 1/3, 0.35, 0.4, 0.5', same(c3, ['1.0784', '1.0189', '0.9959', '0.9836', '0.9437', '0.8462']), c3.join(' '))
  const g3 = GAMES.coordination(0.3)
  check('x* = d/(1 + d) is the unstable point; x* < 1/3 ⇔ a + 2b > c + 2d; x* < 1/2 ⇔ risk dominant',
    close(xStar(g3), 0.3, 1e-15) && thirdRule(g3) && !thirdRule(GAMES.coordination(0.34)) && riskDominant(GAMES.coordination(0.45)) && !riskDominant(GAMES.coordination(0.55)))
  check('the stag hunt: x* = 2/3 for stag, so hare is risk dominant', close(xStar(stag), 2 / 3, 1e-15) && !riskDominant(stag) && riskDominant(GAMES.stag('hare')))
  // Independent: ρ_A by solving the absorbing chain's linear equations.
  const direct = (g, N, w) => {
    // φ_i = P(up) φ_{i+1} + P(down) φ_{i−1} on the jump chain, φ_0 = 0, φ_N = 1:
    // with differences y_i = φ_i − φ_{i−1}, y_{i+1} = γ_i y_i.
    let y = 1
    const ys = [1]
    for (let i = 1; i < N; i++) {
      const [fA, fB] = fitness(g, N, w, i)
      y *= fB / fA
      ys.push(y)
    }
    const tot = ys.reduce((s, v) => s + v, 0)
    return ys[0] / tot
  }
  check('the formula agrees with a direct solution of the chain\'s equations', [[stag, 50, 0.1], [GAMES.pd('D'), 30, 0.3], [g3, 80, 0.05]].every(([g, N, w]) => close(fixation(g, N, w).rhoA, direct(g, N, w), 1e-15)))
  const [cv, msCurve] = time(() => curve((N) => (i) => fitness(stag, N, 0.1, i)))
  check('the chart: 99 values of N from 2 to 100, both curves', cv.A.length === 99 && cv.B.length === 99 && cv.A[0][0] === 2 && cv.A.at(-1)[0] === 100)
  info(`the chart computed in ${msCurve.toFixed(1)} ms`)
  check('fitness stays positive for w < 1 in every game (payoffs ≥ 0)', [stag, GAMES.pd('C'), GAMES.chicken('hawk'), g3].every((g) => [2, 10, 100].every((N) => Array.from({ length: N - 1 }, (_, k) => fitness(g, N, 0.899, k + 1)).every(([a, b]) => a > 0 && b > 0))))
  // Runs.
  const runs = [
    ['neutral, N = 10', constantFit(1), 10, 0.1, [0.098, 0.105]],
    ['r = 1.1, N = 10', constantFit(1.1), 10, closedForm(1.1, 10), [0.144, 0.155]],
    ['hare among stag hunters, N = 50, w = 0.1', (i) => fitness(GAMES.stag('hare'), 50, 0.1, i), 50, s50.rhoB, [0.0167, 0.0213]],
  ]
  for (const [name, fit, N, rho, [lo, hi]] of runs) {
    const [res, ms] = time(() => Array.from({ length: 10 }, (_, s) => runMany(fit, N, 10000, s + 1)))
    const se = Math.sqrt((rho * (1 - rho)) / 10000)
    const z = res.map((r) => (r.p - rho) / se)
    const ps = res.map((r) => r.p)
    check(`10,000 mutants, ${name}, seeds 1 to 10: each within 4 standard errors of ${rho.toFixed(4)}`, z.every((v) => Math.abs(v) < 4), `${Math.min(...ps).toFixed(4)}–${Math.max(...ps).toFixed(4)}, largest |z| ${Math.max(...z.map(Math.abs)).toFixed(2)}`)
    info(`  expected range ${lo}–${hi}: ${ps.every((p) => p >= lo && p <= hi) ? 'all inside' : 'not all inside'}; seeds 1–10: ${ps.map(f4).join(' ')}; ${(ms / 10).toFixed(0)} ms per 10,000`)
  }
  // The full process ends where the jump chain says (a rough check).
  {
    const random = mulberry32(99)
    const fit = (i) => fitness(GAMES.stag('hare'), 10, 0.1, i)
    let fixed = 0
    const n = 4000
    for (let r = 0; r < n; r++) {
      const pop = new Array(10).fill(0)
      pop[0] = 1
      let k = 1
      while (k > 0 && k < 10) {
        moranStep(pop, fit, random)
        k = pop.reduce((s, v) => s + v, 0)
      }
      if (k === 10) fixed++
    }
    const rho = fixation(GAMES.stag('hare'), 10, 0.1).rhoA
    const se = Math.sqrt((rho * (1 - rho)) / n)
    check('"Watch one": the full process fixes as often as the formula says (4,000 runs, N = 10, within 4 s.e.)', Math.abs(fixed / n - rho) < 4 * se, `${(fixed / n).toFixed(4)} vs ${rho.toFixed(4)}`)
  }
}

// ------------------------------------------------------------------ F2

console.log('— F2: the traffic light (correlated equilibria of chicken)')
{
  const t0 = trafficLight(0)
  const want = [[0, 0, 1, 0], [0, 1, 0, 0], [0.25, 0.25, 0.25, 0.25], [1 / 3, 1 / 3, 1 / 3, 0], [0, 1 / 3, 1 / 3, 1 / 3]]
  const has = (list, p) => list.some((v) => v.every((x, i) => close(x, p[i], 1e-9)))
  check('d = 0: five vertices, the pure equilibria, the mixed one, (1/3, 1/3, 1/3, 0) and (0, 1/3, 1/3, 1/3)', t0.vertices.length === 5 && want.every((p) => has(t0.vertices, p)), t0.vertices.map((p) => p.map(f3).join(',')).join(' | '))
  check('  best 8/3 at (1/3, 1/3, 1/3, 0), worst 5/3 at (0, 1/3, 1/3, 1/3)', close(t0.best.payoff, 8 / 3, 1e-12) && close(t0.worst.payoff, 5 / 3, 1e-12) && has([t0.best.p], want[3]) && has([t0.worst.p], want[4]))
  const quad = [[1, 4], [5 / 3, 5 / 3], [4, 1], [8 / 3, 8 / 3]]
  check('  payoff region: the quadrilateral (1, 4), (5/3, 5/3), (4, 1), (8/3, 8/3), area 3', t0.region.length === 4 && quad.every((q) => t0.region.some((r) => close(r[0], q[0], 1e-9) && close(r[1], q[1], 1e-9))) && close(t0.area, 3, 1e-12), `area ${t0.area}`)
  check('  mixed equilibrium: C with 1/2, payoff 2; the coin 2.5', close(t0.mixed.q, 0.5, 1e-15) && close(t0.mixed.payoff, 2, 1e-12))
  const rows = [[-1, 2.75, [0.5, 0.25, 0.25, 0], 1.8, 7 / 3, 2 / 3, 2.85], [-2, 2.8, null, 13 / 7, 2.5, 0.75, 2.8286], [0.5, 2.6, null, 1.5, 5 / 3, 1 / 3, 3.3]]
  for (const [d, best, bp, worst, mixed, q, ar] of rows) {
    const t = trafficLight(d)
    const ok = close(t.best.payoff, best, 1e-9) && close(t.worst.payoff, worst, 1e-9) && close(t.mixed.payoff, mixed, 1e-9) && close(t.mixed.q, q, 1e-9) && f4(t.area) === ar.toFixed(4) && (!bp || has([t.best.p], bp))
    check(`d = ${d}: best ${best}, worst ${f4(worst)}, mixed ${f4(mixed)} (C with ${f4(q)}), area ${ar}`, ok, `${f4(t.best.payoff)} ${f4(t.worst.payoff)} ${f4(t.mixed.payoff)} ${f4(t.mixed.q)} ${f4(t.area)}`)
  }
  // At every slider value, the enumeration agrees with the formulas.
  let worstGap = 0
  let nVerts = new Set()
  const [, ms] = time(() => {
    for (let k = -30; k <= 9; k++) {
      const d = k / 10
      const t = trafficLight(d)
      const F = formulas(d)
      nVerts.add(t.vertices.length)
      worstGap = Math.max(worstGap, Math.abs(t.mixed.q - F.q), Math.abs(t.mixed.payoff - F.m), Math.abs(t.best.payoff - F.best.payoff), Math.abs(t.worst.payoff - F.worst.payoff),
        ...t.best.p.map((v, i) => Math.abs(v - F.best.p[i])), ...t.worst.p.map((v, i) => Math.abs(v - F.worst.p[i])))
      // Every vertex is a correlated equilibrium.
      const { a, b } = chicken(d)
      const G = obedience(a, b)
      if (!t.vertices.every((p) => G.every((g) => g.reduce((s, v, i) => s + v * p[i], 0) >= -1e-9) && close(p.reduce((s, v) => s + v, 0), 1, 1e-9))) worstGap = Infinity
    }
  })
  check('the enumeration agrees with the formulas at all 40 slider values (d = −3 … 0.9), within 1e-12', worstGap < 1e-12, `largest gap ${worstGap.toExponential(1)}; vertex counts ${[...nVerts].join(', ')}`)
  info(`F2 at 40 values of d in ${ms.toFixed(1)} ms (${(ms / 40).toFixed(2)} ms per slider move)`)
  // Independent: the best symmetric CE by brute force on a grid of lotteries.
  {
    const { a, b } = chicken(0)
    const G = obedience(a, b)
    let best = -Infinity
    let worst = Infinity
    const n = 300
    for (let i = 0; i <= n; i++) for (let j = 0; i + 2 * j <= n; j++) {
      const p = [i / n, j / n, j / n, (n - i - 2 * j) / n]
      if (G.every((g) => g.reduce((s, v, k) => s + v * p[k], 0) >= -1e-12)) {
        const v = payoffOf(a, b, p)[0]
        best = Math.max(best, v)
        worst = Math.min(worst, v)
      }
    }
    check('a grid of 45,000 symmetric lotteries finds the same best and worst (8/3, 5/3)', close(best, 8 / 3, 1e-9) && close(worst, 5 / 3, 1e-9), `${f4(best)} ${f4(worst)}`)
  }
  check('exercise 6: told to swerve, the other swerves with probability 1/2 and the driver is indifferent (3·½ + 1·½ = 4·½ + 0·½)', 3 * 0.5 + 1 * 0.5 === 4 * 0.5 + 0 * 0.5)
  check('the coin (½ (C, D), ½ (D, C)) is a correlated equilibrium paying 2.5; payoff 8/3 > 2.5 > 2', violation(chicken(0).a, chicken(0).b, [[0, 0.5], [0.5, 0]]).max === 0 && 8 / 3 > 2.5)
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: learning by regret (Hedge)')
{
  check('the bound per round at T = 2,000, η = 0.1: ln 2/200 + 0.0125 = 0.0160', f4(bound(2000, 0.1)) === '0.0160' && close(Math.log(2) / 200 + 0.0125, bound(2000, 0.1), 1e-15))
  const Ts = [100, 1000, 10000]
  const etas = Ts.map((T) => tunedEta(T))
  const bs = Ts.map((T) => bound(T, tunedEta(T)))
  check('"η for this T": η = 0.2355, 0.0745, 0.0235; bound 0.0589, 0.0186, 0.0059 at T = 100, 1,000, 10,000', etas.map(f4).join() === '0.2355,0.0745,0.0235' && bs.map(f4).join() === '0.0589,0.0186,0.0059', `${etas.map(f4).join(' ')} / ${bs.map(f4).join(' ')}`)
  check('  and the tuned bound is √(ln 2/(2T))', Ts.every((T, i) => close(bs[i], tunedBound(T), 1e-15)))
  check('scaled payoffs lie in [0, 1], each player\'s lowest 0 and highest 1', HEDGE_GAMES.every((k) => {
    const g = hedgeGame(k)
    return [g.sa, g.sb].every((m) => Math.min(...m.flat()) === 0 && Math.max(...m.flat()) === 1)
  }))
  // The bound holds in every run, every game.
  let ratio = 0
  let ratioEnd = 0
  let where = ''
  let total = 0
  const [, msAll] = time(() => {
    for (const key of HEDGE_GAMES) for (const [T, eta] of [[500, 0.05], [2000, 0.1], [2000, 0.3], [5000, 0.02]]) for (let seed = 1; seed <= 20; seed++) {
      const r = run(key, { T, eta, seed })
      total++
      ratioEnd = Math.max(ratioEnd, Math.max(r.regR[T], r.regC[T]) / bound(T, eta))
      for (let t = 1; t <= T; t++) {
        const b = bound(t, eta)
        const m = Math.max(r.regR[t], r.regC[t]) / b
        if (m > ratio) {
          ratio = m
          where = `${key} T = ${T} η = ${eta} seed ${seed} t = ${t}`
        }
      }
    }
  })
  check(`the regret never exceeds the bound at any t: 5 games × 4 settings × seeds 1 to 20 (${total} runs)`, ratio <= 1, `largest ratio ${ratio.toFixed(3)} (${where}); the prompt's 0.898`)
  info(`${total} runs in ${msAll.toFixed(0)} ms; largest ratio at the last round T only: ${ratioEnd.toFixed(3)}`)
  // A start away from the centre: the general bound ln(1/π)/(ηt) + η/8.
  let ratio2 = 0
  for (const key of HEDGE_GAMES) for (let seed = 1; seed <= 20; seed++) {
    const r = run(key, { T: 2000, eta: 0.1, p0: 0.8, q0: 0.2, seed })
    for (let t = 1; t <= 2000; t++) ratio2 = Math.max(ratio2, r.regR[t] / bound(t, 0.1, 0.8), r.regC[t] / bound(t, 0.1, 0.2))
  }
  check('from the start (0.8, 0.2) the regret stays below ln(1/0.2)/(ηt) + η/8 (5 games, seeds 1 to 20)', ratio2 <= 1, `largest ratio ${ratio2.toFixed(3)}`)
  const D = { T: 2000, eta: 0.1 }
  const seeds = Array.from({ length: 10 }, (_, i) => i + 1)
  const chick = seeds.map((seed) => nearestPure('chicken', run('chicken', { ...D, seed }).final))
  check('chicken at the defaults, seeds 1 to 10: ends within 1e-6 of a pure equilibrium in every run', chick.every((c) => c.dist < 1e-6 && (same(c.eq, [1, 0]) || same(c.eq, [0, 1]))), chick.map((c) => `${c.eq.join('')}:${c.dist.toExponential(0)}`).join(' '))
  const pdRuns = seeds.map((seed) => run('pd', { ...D, seed }).final)
  check('the dilemma ends at (D, D) in every run', pdRuns.every(([p, q]) => p < 1e-6 && q < 1e-6), pdRuns.map(([p, q]) => `${p.toExponential(0)},${q.toExponential(0)}`).join(' '))
  const stRuns = seeds.map((seed) => run('stag', { ...D, seed }).final)
  check('the stag hunt from (0.5, 0.5) ends at (hare, hare) in every run', stRuns.every(([p, q]) => p < 1e-3 && q < 1e-3), stRuns.map(([p, q]) => `${p.toExponential(0)},${q.toExponential(0)}`).join(' '))
  const st8 = seeds.map((seed) => run('stag', { ...D, p0: 0.8, q0: 0.8, seed }).final)
  check('the stag hunt from (0.8, 0.8) ends at (stag, stag) in every run', st8.every(([p, q]) => p > 1 - 1e-3 && q > 1 - 1e-3), st8.map(([p, q]) => `${f4(p)},${f4(q)}`).join(' '))
  const bos = seeds.map((seed) => nearestPure('battle', run('battle', { ...D, seed }).final))
  check('the battle of the sexes ends at one of its pure equilibria in every run', bos.every((c) => c.dist < 1e-3), bos.map((c) => `${c.eq.join('')}:${c.dist.toExponential(0)}`).join(' '))
  info(`chicken ends: ${chick.map((c) => c.eq.join('')).join(' ')}; battle ends: ${bos.map((c) => c.eq.join('')).join(' ')}`)
  const pen = seeds.map((seed) => run('pennies', { ...D, seed }))
  check('pari o dispari: each player\'s frequency of his first action within 0.04 of 1/2', pen.every((r) => r.firstShare.every((s) => close(s, 0.5, 0.04))), pen.map((r) => r.firstShare.map(f3).join('/')).join(' '))
  check('  the row player\'s average scaled payoff within 0.03 of 1/2', pen.every((r) => close(r.averageScaledRow, 0.5, 0.03)), pen.map((r) => f3(r.averageScaledRow)).join(' '))
  const dEnd = pen.map((r) => fromCentre(r.final))
  const d200 = pen.map((r) => fromCentre([r.P[200], r.Q[200]]))
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
  check('  mean distance of the final (p, q) from the centre above 0.4 and above its mean at t = 200', mean(dEnd) > 0.4 && mean(dEnd) > mean(d200), `${f3(mean(dEnd))} and ${f3(mean(d200))}`)
  {
    const s50 = Array.from({ length: 50 }, (_, i) => run('pennies', { ...D, seed: i + 1 }))
    info(`pari o dispari over seeds 1–50: mean distance ${f3(mean(s50.map((r) => fromCentre(r.final))))} at the end, ${f3(mean(s50.map((r) => fromCentre([r.P[200], r.Q[200]]))))} at t = 200 (the prompt's 0.590 and 0.332)`)
  }
  const eqP = equilibria('pennies')
  check('pari o dispari has no pure equilibrium and its mixed one is the centre', eqP.pure.length === 0 && same(eqP.mixed, [0.5, 0.5]))
  check('chicken: two pure equilibria (swerve, go) and (go, swerve), mixed at 1/2', same(equilibria('chicken').pure, [[1, 0], [0, 1]]) && same(equilibria('chicken').mixed, [0.5, 0.5]))
  // The violation falls as T grows (in chicken, seeds 1–10).
  const vio = [500, 2000, 10000].map((T) => mean(seeds.map((seed) => run('pennies', { T, eta: tunedEta(T), seed }).violation.max)))
  check('the correlated-equilibrium violation of the table falls as T grows (pari o dispari, tuned η, mean over seeds 1–10)', vio[0] > vio[1] && vio[1] > vio[2], vio.map(f4).join(' '))
  const [, ms10k] = time(() => run('chicken', { T: 10000, eta: 0.1, seed: 1 }))
  info(`one run at T = 10,000 in ${ms10k.toFixed(1)} ms`)
}

// ------------------------------------------------------------------ Texts

const textsPath = resolve(root, 'src/components/lab/game-theory/evolution-and-learning/texts.js')
const lecturePath = (l) => `src/content/game-theory-lab/evolution-and-learning.${l}.md`
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
  const body = { en: lecture.en.split('<!-- simulation -->')[0], it: lecture.it.split('<!-- simulation -->')[0] }
  const triple = (x, d = 4) => [`(${x.map((v) => Math.abs(v).toFixed(d)).join(', ')})`, `(${x.map((v) => itn(Math.abs(v).toFixed(d))).join('; ')})`]

  // ---- The lecture
  const th = repeatedThresholds()
  const s50 = fixation(GAMES.stag('stag'), 50, 0.1)
  check('lecture numbers are the code\'s: doves invaded 4 > 3, hawks 1 > 0, ESS 1/2; x* 1/2 and 2/3; 1/17 ≈ 0.059 and 4/9; 0.148 and 0.059; 0.0184, 0.0013, 14 times; 0.0186; 8/3 ≈ 2.67, 2, 2.5',
    close(ess2(HAWK_DOVE)[0], 0.5, 1e-12) && close(interior(4 / 3, 1 / 3), 0.5, 1e-12) && close(interior(0.5, -1), 2 / 3, 1e-12) && f3(th.tft) === '0.059' && close(th.allc, 4 / 9, 1e-15)
    && f3(closedForm(1.1, 10)) === '0.148' && f3(closedForm(0.9, 10)) === '0.059' && f4(s50.rhoB) === '0.0184' && f4(s50.rhoA) === '0.0013' && Math.round(s50.rhoB / s50.rhoA) === 14
    && f4(tunedBound(1000)) === '0.0186' && f2(trafficLight(0).best.payoff) === '2.67' && close(trafficLight(0).mixed.payoff, 2, 1e-12) && repeatedMatrix().length === 3)
  quoted('lecture: strategies that spread', body, ['(3, 3), (1, 4), (4, 1), (0, 0)', '4 > 3', '1 > 0', '(1973)', '(1982)', '/lab/cooperation', '/game-theory-lab/nash-equilibrium'])
  quoted('lecture: the replicator equation', body, ['x(1 − x) [(1 − T)x + S(1 − x)]', 'x* = S/(S + T − 1)', '1/2', '2/3', ['Taylor and Jonker 1978', 'Taylor e Jonker 1978'], '1979'])
  quoted('lecture: rock, paper, scissors', body, ['(1/3, 1/3, 1/3)', '(a − b)', ['Hofbauer and Sigmund 1998', 'Hofbauer e Sigmund 1998'], '(1996)', ['10 rounds', '10 turni'], '1/17 ≈ 0.059', '4/9'])
  quoted('lecture: one mutant', body, ['(1958)', '1/N', '(1 − 1/r) / (1 − 1/r^N)', '0.148', 'r = 1.1', 'N = 10', '0.059', 'r = 0.9', '1 − w + w × (', '1/3', 'x* < 1/2', 'x* = 2/3', 'N = 50', 'w = 0.1', '0.0184', '0.0013', ['14 times less', '14 volte meno'], '(2004)', '(1993)'])
  quoted('lecture: learning', body, ['(1957)', ['Littlestone and Warmuth 1994', 'Littlestone e Warmuth 1994'], '1997', 'ln n / (ηT) + η/8', '√(ln n/(2T))', '0.0186', ['T = 1,000', 'T = 1.000'], '(Freund', '1999)'])
  quoted('lecture: where learning lands', body, ['(1974)', '1/3', '1/2', '3·½ + 1·½ = 4·½ + 0·½', '8/3 ≈ 2.67', '(2)', '(2.5)', '2000', ['lecture 13', 'lezione 13'], '2018'])

  // ---- What to observe, Panel A
  {
    const t1 = trajectory(rps(1, 1), X0, { keep: 10 })
    const avgOf = (pts) => {
      const a = [0, 0, 0]
      for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < 3; j++) a[j] += (pts[i][j] + pts[i + 1][j]) / 2
      return a.map((v) => v / (pts.length - 1))
    }
    const t2 = trajectory(rps(1.5, 1), X0, { keep: 10 })
    const t3 = trajectory(rps(1, 1.5), X0, { keep: 10 })
    const tr = trajectory(repeatedMatrix(), X0, { keep: 10 })
    const tD = trajectory(repeatedMatrix(), [0.1, 0.85, 0.05], { keep: 10 })
    const per = period(rps(1, 1), X0).period
    const e2 = centreEigen(1.5, 1)
    const e3 = centreEigen(1, 1.5)
    check('observe A: period about 11.4; the product at a > b reaches 1/27; at a < b it is below 1e-4 (shown in exponent form); always defect takes over from (0.1, 0.85, 0.05)',
      per.toFixed(1) === '11.4' && product(t2.end).toFixed(5) === '0.03704' && close(1 / 27, 0.037037, 1e-6) && product(t3.end) < 1e-4 && tD.end[1] > 0.9999 && t1.points.every((x) => Math.abs(product(x) - 0.03) < 1e-9))
    quoted('observe, Panel A', observe.rps, [
      '0.03', ['t = 100', 't = 100'], '11.4', triple(t1.end), triple(avgOf(t1.points), 3), '±0.57735i',
      `${e2.re.toFixed(5).replace('-', '−')} ± ${e2.im.toFixed(5)}i`, triple(t2.end), '1/27 = 0.03704',
      `+${e3.re.toFixed(5)} ± ${e3.im.toFixed(5)}i`, triple(t3.end), product(t3.end).toExponential(2), triple(tr.end), '1/17', '4/9', '(0.1, 0.85, 0.05)',
    ])
  }

  // ---- What to observe, Panel B
  {
    const run1 = runMany(constantFit(1.1), 10, 10000, 1)
    const st = GAMES.stag('stag')
    const f6 = (x) => x.toFixed(6)
    const c3 = fixation(GAMES.coordination(0.3), 50, 0.01).rhoA
    const c4 = fixation(GAMES.coordination(0.4), 50, 0.01).rhoA
    const pd = fixation(GAMES.pd('C'), 50, 0.1)
    const hd = fixation(GAMES.chicken('dove'), 50, 0.1)
    check('observe B: x* = 0.3 passes both tests, 0.4 neither; ρ_A above 1/N at 0.3, below at 0.4; dove and hawk both above 1/N',
      thirdRule(GAMES.coordination(0.3)) && xStar(GAMES.coordination(0.3)) < 1 / 3 && !thirdRule(GAMES.coordination(0.4)) && c3 > 0.02 && c4 < 0.02 && hd.rhoA > 0.02 && hd.rhoB > 0.02)
    quoted('observe, Panel B', observe.moran, [
      'r = 1.1', 'N = 10', f6(fixationConstant(1.1, 10).rhoA), f4(run1.p), `${f4(run1.lo)}–${f4(run1.hi)}`, f6(fixationConstant(0.9, 10).rhoA), f6(fixationConstant(1.1, 100).rhoA), f6(fixationConstant(0.9, 100).rhoA),
      f6(s50.rhoA), f6(s50.rhoB), (s50.rhoB / s50.rhoA).toFixed(2), f6(fixation(st, 10, 0.1).rhoA), f6(c3), f6(c4), f6(pd.rhoA), f6(pd.rhoB), f6(hd.rhoA), f6(hd.rhoB), '1/N = 0.02',
    ])
  }

  // ---- What to observe, Panel C
  {
    const D = { T: 2000, eta: 0.1 }
    const c1 = run('chicken', { ...D, seed: 1 })
    const c2 = run('chicken', { ...D, seed: 2 })
    const p1 = run('pennies', { ...D, seed: 1 })
    const eta10 = Math.round(tunedEta(10000) * 10000) / 10000
    const p10 = run('pennies', { T: 10000, eta: eta10, seed: 1 })
    const pd = run('pd', { ...D, seed: 1 })
    const st = run('stag', { ...D, seed: 1 })
    const st8 = run('stag', { ...D, p0: 0.8, q0: 0.8, seed: 1 })
    const bos = run('battle', { ...D, seed: 1 })
    const pair = (x) => [`(${x.map((v) => v.toFixed(4)).join(', ')})`, `(${x.map((v) => itn(v.toFixed(4))).join('; ')})`]
    check('observe C: chicken run 1 ends at (go, swerve), run 2 at (swerve, go); stag ends at hare from the centre, at stag from (0.8, 0.8); battle at (Concert, Concert)',
      same(nearestPure('chicken', c1.final).eq, [0, 1]) && same(nearestPure('chicken', c2.final).eq, [1, 0]) && st.final.every((v) => v < 1e-6) && st8.final.every((v) => v > 1 - 1e-6) && same(nearestPure('battle', bos.final).eq, [1, 1]))
    quoted('observe, Panel C', observe.hedge, [
      ['T = 2,000', 'T = 2.000'], 'η = 0.1', pair(c1.final), f3(c1.freq[1][0]), f3(c1.average[0]), f3(c1.average[1]), f4(c1.regR[2000]), f4(bound(2000, 0.1)), pair(c2.final),
      pair(p1.final), f3(p1.firstShare[0]), f3(p1.firstShare[1]), f3(p1.average[0]), f3(p1.average[1]),
      ['T = **10,000**', 'T a **10.000**'], `η = ${eta10}`, f4(bound(10000, eta10)), f4(p10.regR[10000]), f4(p10.regC[10000]), f4(p10.violation.max),
      f3(pd.freq[1][1]), ['(0.8, 0.8)', '(0,8; 0,8)'], f3(bos.freq[0][0]),
    ])
    check('observe C: chicken run 1 has equal regrets for both players at 4 decimals', f4(c1.regR[2000]) === f4(c1.regC[2000]))
  }

  // ---- The exercises
  {
    const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
    quoted('exercise 1', sol(0), ['4 > 3', '1 > 0', 'h = 1/2', '2h − 1'])
    quoted('exercise 2', sol(1), ['x* = S/(S + T − 1)', '= 1/2', '−2/3', '= 2/3', '3/2', 'x* = −1'])
    quoted('exercise 3', sol(2), ['a − b', '1/3', '0.03'])
    check('exercise 4 numbers are the code\'s: 9, 14, 10, 30; 10 + 4y and 9 + 21y; 14 + 36x > 30', same(repeatedMatrix(), [[30, 0, 30], [50, 10, 14], [30, 9, 30]]))
    quoted('exercise 4', sol(3), ['9', '14', '10 + 4y', '9 + 21y', '17y > 1', 'y > 1/17', '14 + 36x > 30', 'x > 4/9'])
    check('exercise 5 numbers are the code\'s: 0.0909/0.6145, 0.148; 0.059; 0.1; 0.0184 and 0.0013',
      f4(1 - 1 / 1.1) === '0.0909' && f4(1 - 1 / 1.1 ** 10) === '0.6145' && f3(1 - 1 / 0.9 ** 10) === '-1.868' && f4(1 - 1 / 0.9) === '-0.1111' && f3(closedForm(1.1, 10)) === '0.148' && f3(closedForm(0.9, 10)) === '0.059')
    quoted('exercise 5', sol(4), ['0.0909/0.6145 = 0.148', '−0.1111/(−1.868) = 0.059', '1/10 = 0.1', '0.0184', '0.0013', '14'])
    check('exercise 6 numbers are the code\'s: 8/3 ≈ 2.67; ln 2/200 + 0.0125 = 0.0160', f2(8 / 3) === '2.67' && f4(Math.log(2) / 200 + 0.0125) === '0.0160')
    quoted('exercise 6', sol(5), ['3·½ + 1·½ = 2', '4·½ + 0·½ = 2', '(3 + 1 + 4)/3 = 8/3 ≈ 2.67', 'ln 2/200 + 0.0125 = 0.0160'])
  }

  // ---- The rules of the lab
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language, with the DRAFT marker on the first line',
    ['en', 'it'].every((l) => words(body[l]) >= 1400 && words(body[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(body[l])}`).join(', '))
  const allText = (l) => lecture[l] + observe.rps[l] + observe.moran[l] + observe.hedge[l] + exercises.map((x) => x.statement[l] + x.solution[l]).join(' ')
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l))))
  check('the lecture links to the Complexity Lab\'s module 11 and has no Bitcoin box', ['en', 'it'].every((l) => lecture[l].includes('(/lab/cooperation)') && !lecture[l].includes('```box') && !/bitcoin/i.test(body[l])))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
if (failures) process.exitCode = 1
