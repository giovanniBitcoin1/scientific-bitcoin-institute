// Self-checks for Network Lab module 13, "Social contagion and network
// effects". They run the same code as the page (contagion.js, experiments.js,
// figures.js) and compare it with direct recomputation, closed forms and the
// answers of the exercises.
//
//   node scripts/lab/check-network-13.mjs [section]
//
// Sections: exercises, information, thresholds, window, cascades, hubs,
// longties, clusters, figures, panels, page. Exits with code 1 if any check
// fails. Lines starting with INFO report the numbers quoted in the lecture,
// the "what to observe" lists and the exercises; checks starting "quoted on
// the page" pin them. Run it whole: the section "page" uses the numbers of
// the others. It takes about a minute (the ten other seeds of each
// comparison).
import { readFileSync } from 'node:fs'
import {
  cascadeSequence, wrongCascade, noCascadeAfter, majorityRight, cascadeStats, wrongShareOf, majorityOf, riot, riotStaircase, riotOrder, normalCdf, crowdCurve, smoothOutcome,
  jumpSd, sampleCrowd, marketEquilibria, marketStep, marketPath, MAX_PRICE, bassF, bassRate, bassPeak, bassNumerical, needByShare, needByCount,
  cascade, stepsTo, cascadeBrute, clusterDensity, vulnerableUpTo, cascadeCondition, cascadeConditionOf, cascadeWindow,
} from '../../src/components/lab/network/social-contagion-network-effects/contagion.js'
import {
  drain, crowd, crowdHistogram, crowdOutcomes, sdSweep, CROWD_N, CROWD_DEFAULT, CROWDS, MARKET_DEFAULT, BASS_DEFAULT, netB, cascadeSizes, summarise,
  cascadesAt, windowJob, B_DEFAULT, B_N, B_TRIALS, B_ZS, B_ZS_PA, GLOBAL, paDegree, longTiesOnce, longTiesAt, longTiesJob, C_N, C_K, C_NETS, C_PS,
  C_REACH, SPREADS, clusterNet, clusterOnce, clustersAt, clustersJob, averagePoint, K_GROUP, K_IN, K_NETS, K_DEFAULT, K_OUTS,
} from '../../src/components/lab/network/social-contagion-network-effects/experiments.js'
import {
  riotThresholds, riotRun, sequenceAt, batchAt, RIOT_N, F2_N, F2_RUNS, F2_DEFAULT_Q,
} from '../../src/components/lab/network/social-contagion-network-effects/figures.js'
import { spread } from '../../src/components/lab/network/epidemics-on-networks/epidemic.js'
import { makeSource } from '../../src/components/lab/network/who-connects-to-whom/mixing.js'
import { buildCSR, ringLattice, clustering, wattsStrogatz } from '../../src/components/lab/graphUtils.js'
import { mulberry32, randNormal } from '../../src/components/lab/rng.js'

const only = process.argv[2]
const section = (name) => !only || only === name
let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const f1 = (x) => x.toFixed(1)
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const near = (v, want, tol) => Math.abs(v - want) <= tol
const root = new URL('../../', import.meta.url)
const results = {}
const timed = (f) => {
  const t0 = performance.now()
  const r = f()
  return [r, (performance.now() - t0) / 1000]
}
const OTHER = Array.from({ length: 10 }, (_, j) => 990000 + 137 * j) // ten other seeds for the comparisons with a tolerance
const range = (a) => `${f3(Math.min(...a))} to ${f3(Math.max(...a))}`
const meanOf = (a) => a.reduce((x, y) => x + y, 0) / a.length

// ---------------------------------------------------------------- exercises

if (section('exercises')) {
  // 1
  const th = riotThresholds()
  const moved = th.map((v) => (v === 1 ? 2 : v))
  const home = th.slice(1)
  check('exercise 1: thresholds 0, 1, …, 99 — all 100 join', riot(th) === 100 && riotStaircase(th).length === 101 && riotOrder(th).length === 100)
  check('exercise 1: with the threshold 1 turned into a 2, one person', riot(moved) === 1 && riotOrder(moved).join() === '0')
  check('exercise 1: with the person of threshold 0 at home, nobody', riot(home) === 0 && riotOrder(home).length === 0)
  // 2
  const w = [0.6, 0.7].map(wrongCascade)
  check('exercise 2: a cascade is wrong with probability 0.308 at q = 0.6 and 0.155 at q = 0.7', w.map(f3).join(' ') === '0.308 0.155', w.map(f4).join(' '))
  // the walk of the difference: from 0, two steps end at ±2 or back at 0, so P(wrong) = (1 − q)² / (q² + (1 − q)²)
  const chain = (q) => {
    // probability of reaching −2 before +2 from 0, by solving the three equations of the walk on {−1, 0, 1}
    // h(−1) = (1 − q) + q h(0), h(1) = (1 − q) h(0), h(0) = q h(1) + (1 − q) h(−1)
    const h0 = ((1 - q) * (1 - q)) / (1 - 2 * q * (1 - q))
    return h0
  }
  check('exercise 2: the formula is the chance that a ±1 walk reaches −2 before +2', [0.55, 0.6, 0.7, 0.8, 0.9].every((q) => near(chain(q), wrongCascade(q), 1e-12)))
  check('exercise 2: no cascade after ten people at q = 0.6 is 0.48⁵ = 0.025', near(noCascadeAfter(10, 0.6), 0.48 ** 5, 1e-15) && f3(noCascadeAfter(10, 0.6)) === '0.025', f4(noCascadeAfter(10, 0.6)))
  check('exercise 2: the majority of 25 independent people is right with probability 0.846', f3(majorityRight(25, 0.6)) === '0.846', f4(majorityRight(25, 0.6)))
  info(`exercise 2: majority of 25 at q = 0.6 ${f4(majorityRight(25, 0.6))}; of 30 (an even split counts as half) ${f4(majorityRight(30, 0.6))}; a wrong cascade ${f4(wrongCascade(0.6))}`)
  // 3
  const eq = marketEquilibria(0.16)
  check('exercise 3: at price 0.16 the equilibria are 0, 0.2 and 0.8', near(eq.tipping, 0.2, 1e-12) && near(eq.high, 0.8, 1e-12) && marketStep(0, 0.16) === 0)
  check('exercise 3: 0.2 is unstable (a little below falls, a little above rises) and 0.8 is stable (both sides return)', marketStep(0.19, 0.16) < 0.19 && marketStep(0.21, 0.16) > 0.21 && marketStep(0.79, 0.16) > 0.79 && marketStep(0.81, 0.16) < 0.81)
  check('exercise 3: the highest price at which the good can exist is 0.25', MAX_PRICE === 0.25 && marketEquilibria(0.2501) === null && near(marketEquilibria(0.25).tipping, 0.5, 1e-9) && near(marketEquilibria(0.25).high, 0.5, 1e-9))
  const p15 = marketPath(0.15, 0.16)
  const p25 = marketPath(0.25, 0.16)
  results.market = { p15, p25 }
  info(`exercise 3: from 15% the path is ${p15.slice(0, 3).map(f3).join(', ')}; from 25%: ${p25.slice(0, 8).map(f3).join(', ')} … ${f4(p25[p25.length - 1])}; within 0.001 of 0.8 after ${p25.findIndex((z) => Math.abs(z - 0.8) < 0.001)} steps`)
  check('exercise 3: given to 15% the good goes back to zero, given to 25% it climbs to 0.8', p15[1] === 0 && p15[p15.length - 1] === 0 && near(p25[p25.length - 1], 0.8, 1e-6) && p25.every((z, i) => i === 0 || z > p25[i - 1] - 1e-12))
  // 4
  const pk = bassPeak(0.03, 0.38)
  check('exercise 4: adoption is fastest at t* = 6.19 years, with 0.46 adopted', f2(pk.t) === '6.19' && f2(pk.F) === '0.46' && near(bassF(pk.t, 0.03, 0.38), pk.F, 1e-12), `${f4(pk.t)} ${f4(pk.F)}`)
  check('exercise 4: the share is 0.331 after 5 years and 0.813 after 10; 0.259 after 10 with q = 0', f3(bassF(5, 0.03, 0.38)) === '0.331' && f3(bassF(10, 0.03, 0.38)) === '0.813' && f3(bassF(10, 0.03, 0)) === '0.259' && near(bassF(10, 0.03, 0), 1 - Math.exp(-0.3), 1e-12))
  info(`exercise 4: peak rate ${f4(pk.rate)} a year = (p + q)²/(4q); F(t*) = ${f4(pk.F)}; F(5) = ${f4(bassF(5, 0.03, 0.38))}; F(10) = ${f4(bassF(10, 0.03, 0.38))}; F(20) = ${f4(bassF(20, 0.03, 0.38))}`)
  let worst = 0
  for (const [p, q] of [[0.03, 0.38], [0.01, 0.5], [0.05, 0.2], [0.03, 0], [0.1, 1], [0.001, 0.38]]) for (const t of [1, 5, 10, 20, 40]) worst = Math.max(worst, Math.abs(bassF(t, p, q) - bassNumerical(t, p, q)))
  check('Bass: the closed form agrees with a Runge–Kutta integration of dF/dt = (p + qF)(1 − F) to 1e-9, for six settings and five times', worst < 1e-9, worst.toExponential(1))
  check('Bass: the rate at t* is the largest on a fine grid, and equals (p + q)²/(4q)', near(bassRate(pk.t, 0.03, 0.38), pk.rate, 1e-12) && Array.from({ length: 4000 }, (_, i) => i / 100).every((t) => bassRate(t, 0.03, 0.38) <= pk.rate + 1e-12))
  // 5
  // (a) four nodes all linked to one another, each with one link to an adopter outside: three quarters inside
  const A = [0, 0, 0, 1, 1, 2, 0, 1, 2, 3]
  const B = [1, 2, 3, 2, 3, 3, 4, 5, 6, 7]
  const g = buildCSR(8, A, B)
  const member = Uint8Array.from([1, 1, 1, 1, 0, 0, 0, 0])
  check('exercise 5a: a group with three quarters of its links inside is entered at q = 1/4 and not at q = 0.26', clusterDensity(g, member) === 0.75 && cascade(g, [4, 5, 6, 7], needByShare(g, 0.25)).size === 8 && cascade(g, [4, 5, 6, 7], needByShare(g, 0.26)).size === 4)
  check('exercise 5a: q = b/(a + b) ≤ 1/4 means a ≥ 3b', near(1 / (3 + 1), 0.25, 1e-12) && 1 / (2.9 + 1) > 0.25)
  check('exercise 5b: with φ = 0.18 the nodes with k ≤ 5 fall to a single neighbour', vulnerableUpTo(0.18) === 5 && 1 / 5 >= 0.18 && 1 / 6 < 0.18)
}

// ---------------------------------------------------------------- information cascades

if (section('information')) {
  const QS = [0.6, 0.7, 0.8, 0.9]
  const stats = QS.map((q) => cascadeStats(F2_N, q, 100000, mulberry32(1300 + Math.round(q * 10))))
  results.information = stats
  info(`information cascades, 100,000 sequences of ${F2_N}: wrong cascades at q = ${QS.join(', ')}: ${stats.map((s) => f4(wrongShareOf(s))).join(', ')}; formula ${QS.map((q) => f4(wrongCascade(q))).join(', ')}; expected in the prompt 0.308, 0.155, 0.059, 0.012`)
  check('information cascades: the share of wrong cascades is within 0.01 of the formula at q = 0.6, 0.7, 0.8, 0.9', stats.every((s, i) => near(wrongShareOf(s), wrongCascade(QS[i]), 0.01)))
  check('information cascades: the formula gives 0.308, 0.155, 0.059, 0.012', QS.map((q) => f3(wrongCascade(q))).join(' ') === '0.308 0.155 0.059 0.012')
  let worst = 0
  for (const s of OTHER) QS.forEach((q) => (worst = Math.max(worst, Math.abs(wrongShareOf(cascadeStats(F2_N, q, 100000, mulberry32(s + Math.round(q * 10)))) - wrongCascade(q)))))
  info(`information cascades, ten other seeds: largest gap from the formula ${f4(worst)}`)
  check('information cascades, ten other seeds: the same limit holds', worst <= 0.01)
  // no cascade after ten people: the eleventh still decides by their own signal
  let none = 0
  const random = mulberry32(77)
  for (let i = 0; i < 100000; i++) if (cascadeSequence(11, 0.6, random).start < 0) none++
  info(`information cascades: no cascade after ten people at q = 0.6, 100,000 sequences: ${f4(none / 100000)}; 0.48⁵ = ${f4(0.48 ** 5)}`)
  check('information cascades: no cascade after ten people at q = 0.6 is 0.025 (within 0.002)', near(none / 100000, 0.48 ** 5, 0.002))
  check('information cascades: the majority of the same thirty signals is right as often as the binomial says (within 0.005)', stats.every((s, i) => near(majorityOf(s), majorityRight(F2_N, QS[i]), 0.005)), stats.map((s, i) => `${f4(majorityOf(s))}/${f4(majorityRight(F2_N, QS[i]))}`).join(' '))
  // the rule itself
  let ok = true
  for (let j = 0; j < 2000; j++) {
    const s = cascadeSequence(30, 0.6, mulberry32(j))
    let diff = 0
    for (let i = 0; i < 30; i++) {
      const inCascade = Math.abs(diff) >= 2
      if (inCascade !== (s.start >= 0 && i >= s.start)) ok = false
      if (inCascade ? s.choices[i] !== (diff > 0 ? 1 : 0) : s.choices[i] !== s.signals[i]) ok = false
      if (!inCascade) diff += s.choices[i] ? 1 : -1
    }
    if (s.start >= 0 && s.right !== (diff > 0)) ok = false
  }
  check('information cascades: before the cascade every choice is the person\'s signal; from the moment the choices differ by two everyone follows (2,000 sequences)', ok)
}

// ---------------------------------------------------------------- thresholds

if (section('thresholds')) {
  check('normal distribution: Φ(0) = 0.5, Φ(1.96) = 0.9750021, Φ(−2.5) = 0.0062097, Φ(−x) = 1 − Φ(x)', normalCdf(0) === 0.5 && near(normalCdf(1.96), 0.9750021, 1e-7) && near(normalCdf(-2.5), 0.0062097, 1e-7) && [0.3, 1.1, 2.7, 4].every((x) => near(normalCdf(-x), 1 - normalCdf(x), 1e-14)))
  const SDS = [10, 12, 12.2, 12.3, 15, 50, 100]
  const fixed = SDS.map((sd) => smoothOutcome(100, 25, sd))
  const jump = jumpSd(100, 25)
  results.smooth = { fixed, jump }
  info(`thresholds, smooth curve, N = 100, mean 25: outcome at standard deviation ${SDS.join(', ')}: ${fixed.map(f2).join(', ')}; expected in the prompt 0.8, 4.0, 5.5, 100, 100, 90.5, 65.9; the jump is at ${f4(jump)} (expected 12.22)`)
  check('thresholds, smooth curve: 0.8, 4.0, 5.5 at standard deviation 10, 12, 12.2; 100.0 at 12.3 and 15; 90.5 at 50; 65.9 at 100', fixed.map(f1).join(' ') === '0.8 4.0 5.5 100.0 100.0 90.5 65.9')
  check('thresholds, smooth curve: each outcome is a fixed point of r = N F(r), and the lowest one', fixed.every((r, i) => near(crowdCurve(100, 25, SDS[i], r), r, 1e-8) && Array.from({ length: 200 }, (_, j) => (j * r) / 200).every((x) => crowdCurve(100, 25, SDS[i], x) > x)))
  check('thresholds, smooth curve: the jump is at 12.22', f2(jump) === '12.22' && smoothOutcome(100, 25, jump - 0.01) < 10 && smoothOutcome(100, 25, jump + 0.01) > 99)
  // sampled crowds
  const sampled = (sd, seed, count = 2000) => {
    const random = mulberry32(seed)
    let above = 0
    for (let i = 0; i < count; i++) if (riot(sampleCrowd(100, 25, sd, () => randNormal(random))) > 50) above++
    return above / count
  }
  const SD4 = [10, 12, 15, 20]
  const EXP4 = [0, 0.15, 0.79, 1]
  const got = SD4.map((sd) => sampled(sd, 4100 + sd))
  results.sampled = got
  info(`thresholds, 2,000 sampled crowds per value: share ending above 50 at standard deviation ${SD4.join(', ')}: ${got.map(f3).join(', ')}; expected in the prompt 0.00, 0.15, 0.79, 1.00`)
  check('thresholds, sampled crowds: within 0.04 of the expected shares', got.every((v, i) => near(v, EXP4[i], 0.04)))
  const others = SD4.map((sd) => OTHER.map((s) => sampled(sd, s + sd)))
  info(`thresholds, sampled crowds, ten other seeds: ${SD4.map((sd, i) => `${sd}: ${range(others[i])}`).join('; ')}`)
  check('thresholds, sampled crowds, ten other seeds: the same limit holds', others.every((a, i) => a.every((v) => near(v, EXP4[i], 0.04))))
  // the three ways of computing an outcome agree
  let same = true
  const random = mulberry32(5)
  for (let j = 0; j < 300; j++) {
    const t = sampleCrowd(100, 25, 5 + (j % 30), () => randNormal(random))
    const a = riot(t)
    const st = riotStaircase(t)
    if (a !== st[st.length - 1] || a !== riotOrder(t).length) same = false
    if (st.some((v, i) => i > 0 && v <= st[i - 1])) same = false
  }
  check('thresholds: the sorted count, the staircase and the one-by-one order give the same outcome (300 crowds), and the staircase only climbs', same)
}

// ---------------------------------------------------------------- the cascade condition

if (section('window')) {
  const PHIS = [0.1, 0.18, 0.25, 0.3]
  const w = PHIS.map((phi) => cascadeWindow(phi))
  results.window = w
  info(`cascade condition, random network: window in z for φ = ${PHIS.join(', ')}: ${w.map((x) => (x ? `${f2(x[0])} to ${f2(x[1])}` : 'none')).join('; ')}; expected in the prompt 1.00 to 13.66; 1.02 to 5.76; 1.11 to 3.86; none`)
  check('cascade condition: the window is 1.00 to 13.66 for φ = 0.1, 1.02 to 5.76 for 0.18, 1.11 to 3.86 for 0.25, and there is none for 0.3', w.slice(0, 3).map((x) => `${f2(x[0])} ${f2(x[1])}`).join(' | ') === '1.00 13.66 | 1.02 5.76 | 1.11 3.86' && w[3] === null)
  check('cascade condition: it equals 1 at both ends of each window and exceeds 1 inside', w.slice(0, 3).every((x, i) => near(cascadeCondition(x[0], PHIS[i]), 1, 1e-6) && near(cascadeCondition(x[1], PHIS[i]), 1, 1e-6) && cascadeCondition((x[0] + x[1]) / 2, PHIS[i]) > 1))
  check('cascade condition: vulnerable up to k = 10, 5, 4, 3 for φ = 0.1, 0.18, 0.25, 0.3', PHIS.map(vulnerableUpTo).join(' ') === '10 5 4 3')
  // with every degree vulnerable it is the condition for a giant component, z > 1
  check('cascade condition: with a threshold so low that every node is vulnerable it is z itself, the condition for a giant component', [0.5, 1, 2, 3].every((z) => near(cascadeCondition(z, 0.001), z, 1e-6)))
  const on = netB({ source: 'poisson', z: 4 })
  const own = cascadeConditionOf(on.k, 0.18)
  info(`cascade condition at z = 4, φ = 0.18: ${f4(cascadeCondition(4, 0.18))} from the Poisson degrees, ${f4(own)} from the degrees of the panel's network`)
  check('cascade condition: the sum over the degrees of a random network of 10,000 nodes is within 0.05 of the Poisson value', near(own, cascadeCondition(4, 0.18), 0.05))
}

// ---------------------------------------------------------------- cascades on a network

if (section('cascades')) {
  // the queue against synchronous sweeps over all nodes
  let same = true
  let timing = true
  for (let j = 0; j < 40; j++) {
    const net = makeSource({ source: ['poisson', 'pa', 'power'][j % 3], N: 60 + 10 * (j % 5), m: 2, meanK: 2 + (j % 4), seed: 5150 + j })
    const g = buildCSR(net.n, net.A, net.B)
    const random = mulberry32(j)
    const seeds = Array.from({ length: 1 + (j % 4) }, () => Math.floor(random() * net.n))
    const need = j % 2 ? needByShare(g, 0.1 + 0.02 * j) : needByCount(g, 1 + (j % 3))
    const ws = {}
    const a = cascade(g, seeds, need, ws)
    const b = cascadeBrute(g, seeds, need)
    if (a.size !== b.size || a.steps !== b.steps) same = false
    for (let i = 0; i < a.size; i++) if (ws.round[ws.queue[i]] !== b.when[ws.queue[i]]) timing = false
    for (let t = 1; t <= a.size; t++) if (stepsTo(ws, t) !== [...b.when].filter((x) => x >= 0).sort((x, y) => x - y)[t - 1]) timing = false
  }
  check('cascade: the queue gives the same adopters as synchronous sweeps over all nodes (40 small networks, by share and by count, one to four seeds)', same)
  check('cascade: every node adopts at the same synchronous step in both, and the step at which the count reaches any target agrees', timing)
  // degree 0 never adopts; adopters never go back (the set only grows with more seeds)
  {
    const g = buildCSR(5, [0, 1], [1, 2])
    check('cascade: a node without links never adopts, even with threshold 0', cascade(g, [0], needByShare(g, 0)).size === 3 && needByShare(g, 0)[3] > 5)
    const need = needByShare(g, 0.6)
    check('cascade: need = ⌈φ k⌉, at least one (0.6 of two links is two neighbours)', Array.from(need.slice(0, 3)).join() === '1,2,1' && cascade(g, [0], need).size === 1 && cascade(g, [0, 2], need).size === 3)
  }
  // simple contagion from one seed is module 12's SI spread with β = 1
  {
    const on = netB({ source: 'poisson', z: 4 })
    const need = needByCount(on.g, 1)
    let ok = true
    for (const seed of [3, 500, 9000]) {
      const ws = {}
      const a = cascade(on.g, [seed], need, ws)
      const b = spread(on.g, seed, 1, Infinity, mulberry32(1))
      for (let i = 0; i < a.size; i++) if (b.when[ws.queue[i]] !== ws.round[ws.queue[i]]) ok = false
      if (a.size !== b.when.filter((x) => x >= 0).length) ok = false
    }
    check('cascade: with one adopting neighbour enough, it is module 12\'s SI spread with β = 1, node for node and step for step', ok)
  }
  // what is left when a cascade stops is a cluster of density above 1 − φ
  {
    let ok = true
    for (const z of [3, 5, 5.8, 7]) {
      const on = netB({ source: 'poisson', z })
      const need = needByShare(on.g, 0.18)
      const ws = {}
      for (const seed of [1, 77, 4242]) {
        const r = cascade(on.g, [seed], need, ws)
        const left = new Uint8Array(on.n).fill(1)
        for (let i = 0; i < r.size; i++) left[ws.queue[i]] = 0
        if (!(clusterDensity(on.g, left) > 1 - 0.18)) ok = false
      }
    }
    check('cascade: the nodes left out when a cascade stops always form a cluster of density above 1 − φ (12 cascades)', ok)
  }
  // the window, 1,000 seeds per z over two networks
  const ZS = [1, 1.5, 2, 3, 4, 5, 5.5, 5.8, 6, 6.2, 6.5]
  const EXP = [0, 0.54, 0.75, 0.89, 0.84, 0.72, 0.41, 0.14, 0.06, 0, 0]
  const EXP_SIZE = { 1.5: 0.58, 2: 0.8, 3: 0.94, 4: 0.98, 5: 0.99 }
  const sweep = (base) => ZS.map((z) => {
    const sizes = []
    const per = []
    for (const variant of [0, 1]) {
      const on = netB({ source: 'poisson', z }, variant, base)
      const s = cascadeSizes(on, 0.18, 'random', 500, mulberry32(base + Math.round(z * 100) + variant))
      sizes.push(...s)
      per.push(summarise(s).global)
    }
    return { z, ...summarise(Float64Array.from(sizes)), per }
  })
  const [got, secs] = timed(() => sweep(1313))
  results.sweep = got
  info(`cascades, random network, N = 10,000, φ = 0.18, 1,000 seeds per z over two networks (${f1(secs)} s): share of global cascades at z = ${ZS.join(', ')}: ${got.map((r) => f2(r.global)).join(', ')}; expected in the prompt ${EXP.map(f2).join(', ')}`)
  info(`cascades: the two networks separately: ${got.map((r) => `${r.z}: ${r.per.map(f2).join('/')}`).join('; ')}`)
  info(`cascades: mean size of the global ones: ${got.filter((r) => r.global > 0).map((r) => `${r.z}: ${f3(r.meanGlobal)}`).join('; ')}; expected 0.58, 0.80, 0.94, 0.98, 0.99 at z = 1.5, 2, 3, 4, 5 and above 0.99 beyond`)
  const others = OTHER.map((s) => sweep(s))
  const spreadOf = ZS.map((_, i) => others.map((o) => o[i].global))
  info(`cascades, ten other pairs of networks: share of global cascades ${ZS.map((z, i) => `${z}: ${f2(Math.min(...spreadOf[i]))}–${f2(Math.max(...spreadOf[i]))}`).join('; ')}`)
  results.sweepOthers = spreadOf
  // Limits set from these eleven pairs (ranges above): well inside the window (z = 1.5 to 4) they stay within 0.06 of
  // the prompt's values; at z = 5 the pairs run from 0.65 to 0.73 (0.08). At the upper edge the share swings from one
  // network to the next: there the checks ask only for the order.
  const inside = (r) => r.z >= 1.5 && r.z <= 4
  const gapOf = (pick) => Math.max(...[got, ...others].flatMap((o) => o.filter(pick).map((r) => Math.abs(r.global - EXP[ZS.indexOf(r.z)]))))
  check('cascades: well inside the window (z = 1.5 to 4) the share of global cascades is within 0.06 of the expected values, and within 0.08 at z = 5, here and for ten other pairs of networks', gapOf(inside) <= 0.06 && gapOf((r) => r.z === 5) <= 0.08, `largest gaps ${f3(gapOf(inside))} and ${f3(gapOf((r) => r.z === 5))}`)
  const edge = [got, ...others].map((o) => [o[0].global, o[10].global])
  info(`cascades, all eleven pairs: largest share at z = 1: ${f3(Math.max(...edge.map((e) => e[0])))}; at z = 6.5: ${f3(Math.max(...edge.map((e) => e[1])))}`)
  check('cascades: none at z = 1, and at most 5 in 1,000 at z = 6.5, here and for ten other pairs', edge.every((e) => e[0] === 0 && e[1] <= 0.005))
  check('cascades: at the upper edge the share falls from z = 5 to 5.5 to 6 to 6.5, here and for ten other pairs', [got, ...others].every((o) => o[5].global > o[6].global && o[6].global > o[8].global && o[8].global >= o[10].global))
  check('cascades: the global ones have mean size within 0.03 of 0.58, 0.80, 0.94, 0.98, 0.99 at z = 1.5, 2, 3, 4, 5, here and for ten other pairs', [got, ...others].every((o) => o.every((r) => !(r.z in EXP_SIZE) || near(r.meanGlobal, EXP_SIZE[r.z], 0.03))))
  check('cascades: beyond z = 5 a global cascade takes more than 0.99 of the nodes, here and for ten other pairs', [got, ...others].every((o) => o.every((r) => r.z <= 5 || !(r.global > 0) || r.meanGlobal > 0.99)))
  // nothing in between: sizes are below 10% or above half
  check('cascades: from z = 2 up no cascade ends between 10% and 50% of the nodes', got.filter((r) => r.z >= 2).every((r) => r.bins.slice(2, 10).every((b) => b === 0)))
}

// ---------------------------------------------------------------- hubs

if (section('hubs')) {
  const five = (source, mode, base) => Array.from({ length: 5 }, (_, j) => {
    const on = netB({ source, z: 4 }, j, base)
    return summarise(cascadeSizes(on, 0.18, mode, 400, mulberry32(base + 31 * j + (mode === 'top' ? 7 : 0)))).global
  })
  const got = {}
  for (const source of ['poisson', 'pa']) for (const mode of ['random', 'top']) got[`${source} ${mode}`] = five(source, mode, 1717)
  results.hubs = got
  for (const [key, v] of Object.entries(got)) info(`hubs, mean degree 4, φ = 0.18, five networks, 400 seeds each, ${key}: ${v.map(f3).join(', ')}; mean ${f3(meanOf(v))}`)
  info('hubs: expected in the prompt 0.88 (random network), 0.25 (preferential attachment, m = 2), 1.00 from the 20 nodes of highest degree in both')
  const others = { poisson: OTHER.map((s) => meanOf(five('poisson', 'random', s))), pa: OTHER.map((s) => meanOf(five('pa', 'random', s))) }
  info(`hubs, ten other sets of five networks, random seeds: random network ${range(others.poisson)}; preferential attachment ${range(others.pa)}`)
  results.hubsOthers = others
  check('hubs: from a random seed the random network cascades in 0.88 ± 0.04 of the cases, here and for ten other sets', [meanOf(got['poisson random']), ...others.poisson].every((v) => near(v, 0.88, 0.04)))
  check('hubs: preferential attachment with the same mean degree in 0.25 ± 0.05, here and for ten other sets', [meanOf(got['pa random']), ...others.pa].every((v) => near(v, 0.25, 0.05)))
  check('hubs: from one of the 20 nodes of highest degree, always, in both', got['poisson top'].every((v) => v === 1) && got['pa top'].every((v) => v === 1))
  const pa = netB({ source: 'pa', z: 4 })
  check('hubs: preferential attachment with m = 2 has mean degree 4 (to 0.01), and odd mean degrees are rounded to even ones', near(pa.mean, 4, 0.01) && paDegree(4.75) === 4 && paDegree(5) === 6 && paDegree(0.5) === 2)
}

// ---------------------------------------------------------------- long ties

if (section('longties')) {
  // the lattice
  const lat = longTiesOnce(0, 1)
  check('long ties, p = 0: the ring has 4 neighbours on either side, and 90% is reached in exactly 562 steps (simple) and 749 (complex)', lat.shortcuts === 0 && lat.simple.steps === 562 && lat.complex.steps === 749, `${lat.simple.steps} ${lat.complex.steps}`)
  check('long ties, p = 0: that is 4 and 3 nodes a step on each side, from 9 seeds', Math.ceil((C_REACH * C_N - 9) / 8) === 562 && Math.ceil((C_REACH * C_N - 9) / 6) === 749 && C_K === 8)
  {
    const { A, B } = ringLattice(40, 8)
    const g = buildCSR(40, A, B)
    const ws = {}
    cascade(g, [0, 1, 2, 3, 4, 36, 37, 38, 39], needByCount(g, 2), ws)
    const at1 = Array.from(ws.queue.slice(0, ws.size)).filter((v) => ws.round[v] === 1).sort((a, b) => a - b)
    cascade(g, [0, 1, 2, 3, 4, 36, 37, 38, 39], needByCount(g, 1), ws)
    const s1 = Array.from(ws.queue.slice(0, ws.size)).filter((v) => ws.round[v] === 1).sort((a, b) => a - b)
    check('long ties: on the ring the first step of complex contagion takes the 3 nearest nodes on each side, of simple contagion the 4 nearest', at1.join() === '5,6,7,33,34,35' && s1.join() === '5,6,7,8,32,33,34,35')
  }
  const PS = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 0.5, 1]
  const EXP_S = [562, 119, 42, 20, 11, 7, 5, 4, 4]
  const EXP_C = [749, 749, 741, 630, 241, 76, 45, NaN, NaN]
  const run = (base) => PS.map((p) => longTiesAt(p, 20, base))
  const [got, secs] = timed(() => run(1919))
  results.longties = got
  info(`long ties, N = 5,000, 20 networks per p (${f1(secs)} s), p = ${PS.join(', ')}`)
  info(`  simple, steps to 90%: ${got.map((r) => f1(r.simple.steps)).join(', ')}; expected ${EXP_S.join(', ')}`)
  info(`  complex, steps to 90%: ${got.map((r) => (r.complex.reached ? `${f1(r.complex.steps)}${r.complex.reached < 20 ? ` (${r.complex.reached} of 20)` : ''}` : '–')).join(', ')}; expected 749, 749, 741, 630, 241, 76, 45, no spread, no spread`)
  info(`  complex, share reached: ${got.map((r) => f3(r.complex.share)).join(', ')}`)
  const others = OTHER.map(run)
  const col = (i, id) => others.map((o) => o[i][id].steps)
  info(`long ties, ten other sets of 20 networks: simple ${PS.map((p, i) => `${p}: ${f1(Math.min(...col(i, 'simple')))}–${f1(Math.max(...col(i, 'simple')))}`).join('; ')}`)
  info(`long ties, ten other sets: complex ${PS.slice(0, 7).map((p, i) => `${p}: ${f1(Math.min(...col(i, 'complex')))}–${f1(Math.max(...col(i, 'complex')))}`).join('; ')}`)
  info(`long ties, ten other sets: complex at p = 0.3 reaches 90% in ${others.map((o) => o[6].complex.reached).join(', ')} of 20 networks; share reached at p = 0.5: ${range(others.map((o) => o[7].complex.share))}; at p = 1: ${range(others.map((o) => o[8].complex.share))}`)
  results.longOthers = others
  const all = [got, ...others]
  // Limits set from these eleven sets of 20 networks (see the ranges printed above). With a handful of shortcuts
  // (p = 0.001: 20 rewired links among 20,000) the mean of 20 networks still moves by tens of steps.
  check('long ties, simple: within 40% of the expected steps at p = 0.001, within 15% from p = 0.003 to 0.1, within 1 step at p = 0.3 and above, for all eleven sets', all.every((o) => near(o[1].simple.steps, EXP_S[1], 0.4 * EXP_S[1]) && [2, 3, 4, 5].every((i) => near(o[i].simple.steps, EXP_S[i], 0.15 * EXP_S[i])) && [6, 7, 8].every((i) => near(o[i].simple.steps, EXP_S[i], 1))))
  // At p = 0.3 only some of the 20 networks reach 90% (13 to 19 here) and the mean is over those: 37 to 43 steps in
  // these eleven sets, against 45 in the prompt, so that point is held to 25%.
  check('long ties, complex: within 1% of 749 at p = 0.001, within 5% at 0.003, within 15% at p = 0.01 to 0.1, within 25% at 0.3, for all eleven sets', all.every((o) => near(o[1].complex.steps, 749, 7.5) && near(o[2].complex.steps, 741, 37) && [3, 4, 5].every((i) => near(o[i].complex.steps, EXP_C[i], 0.15 * EXP_C[i])) && near(o[6].complex.steps, 45, 0.25 * 45)))
  const at05 = all.reduce((sum, o) => sum + o[7].complex.reached, 0)
  const at1 = all.reduce((sum, o) => sum + o[8].complex.reached, 0)
  results.longAt05 = { reached: at05, nets: 20 * all.length }
  info(`long ties, complex, all eleven sets: 90% reached in ${at05} of ${20 * all.length} networks at p = 0.5 and in ${at1} at p = 1`)
  // The prompt expected no spread at all at p = 0.5. It is nearly so: of these 220 networks 4 do spread (about 2%).
  check('long ties, complex: at p = 0.5 it spreads in fewer than 5% of 220 networks, and in none at p = 1 (share below 0.01 in every set)', at05 < 11 && at1 === 0 && all.every((o) => o[8].complex.share < SPREADS) && all.filter((o) => o[7].complex.share < SPREADS).length >= all.length - at05)
  check('long ties, simple: every network is reached entirely at every p', all.every((o) => o.every((r) => r.simple.reached === 20 && r.simple.share > 0.999)))
  // the two findings
  const speedS = got[0].simple.steps / got[3].simple.steps
  const speedC = got[0].complex.steps / got[3].complex.steps
  info(`long ties, finding 1: at p = 0.01 simple contagion is ${f1(speedS)} times faster than on the ring, complex contagion ${f2(speedC)} times; at p = 0.1 they are ${f1(got[0].simple.steps / got[5].simple.steps)} and ${f1(got[0].complex.steps / got[5].complex.steps)} times faster`)
  const ratiosC = all.map((o) => o[0].complex.steps / o[3].complex.steps)
  results.ratiosC = ratiosC
  info(`long ties, finding 1, all eleven sets: at p = 0.01 complex contagion is ${f2(Math.min(...ratiosC))} to ${f2(Math.max(...ratiosC))} times faster than on the ring, simple contagion ${f1(Math.min(...all.map((o) => o[0].simple.steps / o[3].simple.steps)))} to ${f1(Math.max(...all.map((o) => o[0].simple.steps / o[3].simple.steps)))} times`)
  check('long ties, finding 1: at p = 0.01 simple contagion is more than 20 times faster and complex contagion less than 1.35 times, for all eleven sets', all.every((o) => o[0].simple.steps / o[3].simple.steps > 20) && ratiosC.every((r) => r < 1.35))
  check('long ties, finding 1: more rewiring speeds complex contagion up as well (p = 0.1 at least 8 times faster than the ring), until it stops spreading at p = 0.5 (mean share below 0.06 in every set)', all.every((o) => o[0].complex.steps / o[5].complex.steps > 8 && o[7].complex.share < 0.06))
  // clustering is what complex contagion travels on
  const cc = [0, 0.1, 0.5, 1].map((p) => {
    const w = wattsStrogatz(C_N, C_K, p, 4321)
    return clustering(buildCSR(C_N, w.A, w.B)).average
  })
  results.clusteringWS = cc
  info(`long ties: mean clustering of one network at p = 0, 0.1, 0.5, 1: ${cc.map(f3).join(', ')}`)
  check('long ties: the ring has clustering 9/14 = 0.643, and rewiring destroys it (below 0.1 at p = 0.5)', near(cc[0], 9 / 14, 1e-9) && cc[2] < 0.1 && cc[1] > cc[2] && cc[2] > cc[3])
}

// ---------------------------------------------------------------- clusters

if (section('clusters')) {
  // the block model
  const { net, g } = clusterNet(4, 0)
  let inside = 0
  let across = 0
  for (let e = 0; e < net.A.length; e++) (net.A[e] < K_GROUP) === (net.B[e] < K_GROUP) ? inside++ : across++
  info(`clusters, one network at k_out = 4: ${net.n} nodes, ${inside} links inside the groups (${f2((2 * inside) / net.n)} per node), ${across} between them (${f2(across / K_GROUP)} per node)`)
  check('clusters: two groups of 500, about 10 links inside per node and k_out between (within 0.5)', net.n === 2 * K_GROUP && near((2 * inside) / net.n, K_IN, 0.5) && near(across / K_GROUP, 4, 0.5) && g.n === 1000)
  const QS = [0.5, 0.4, 0.3]
  const KS = [1, 2, 3, 4, 5]
  const EXP = { 0.5: [0, 0.01, 0.04, 0.74, 1], 0.4: [0.01, 0.16, 1, 1, 1], 0.3: [0.53, 1, 1, 1, 1] }
  const run = (base) => Object.fromEntries(QS.map((q) => [q, KS.map((k) => clustersAt(k, q, 30, base))]))
  const [got, secs] = timed(() => run(2121))
  results.clusters = got
  for (const q of QS) info(`clusters, 30 networks per point (${f1(secs)} s for all), q = ${q}, k_out = 1 … 5: share of the second group ${got[q].map((r) => f3(r.share)).join(', ')}; share of runs in which it falls ${got[q].map((r) => f2(r.over)).join(', ')}; largest share among the runs in which it holds ${got[q].map((r) => f3(r.stuck)).join(', ')}; expected ${EXP[q].map(f2).join(', ')}; the average outside share equals q at k_out = ${f2(averagePoint(q))}`)
  const others = OTHER.map(run)
  for (const q of QS) info(`clusters, ten other sets of 30 networks, q = ${q}: ${KS.map((k, i) => `${k}: ${f2(Math.min(...others.map((o) => o[q][i].share)))}–${f2(Math.max(...others.map((o) => o[q][i].share)))}`).join('; ')}`)
  results.clusterOthers = others
  const all = [got, ...others]
  // Points whose expected value is 0 or 1 (to 0.05) are held to 0.06; the others are all-or-nothing from one network
  // to the next (30 networks: one more or one fewer moves the share by 0.03), and are held to 0.3.
  const sharp = (e) => e <= 0.05 || e >= 0.95
  check('clusters: where the expected share is 0 or 1 (to 0.05) the measured one is within 0.06, for all eleven sets', all.every((o) => QS.every((q) => o[q].every((r, i) => !sharp(EXP[q][i]) || near(r.share, EXP[q][i], 0.06)))))
  check('clusters: at the three all-or-nothing points (q = 0.5 and k_out = 4; q = 0.4 and 2; q = 0.3 and 1) the share is within 0.3 of the expected one, for all eleven sets', all.every((o) => near(o[0.5][3].share, 0.74, 0.3) && near(o[0.4][1].share, 0.16, 0.3) && near(o[0.3][0].share, 0.53, 0.3)), `q = 0.5, k_out = 4: ${range(all.map((o) => o[0.5][3].share))}; q = 0.4, 2: ${range(all.map((o) => o[0.4][1].share))}; q = 0.3, 1: ${range(all.map((o) => o[0.3][0].share))}`)
  // all or nothing
  const shares = Array.from({ length: 200 }, (_, j) => clusterOnce(4, 0.5, j, 2121))
  const mid = shares.filter((s) => s > 0.3 && s < 0.95).length
  const high = shares.filter((s) => s >= 0.95).length
  results.allOrNothing = { mid, high, shares }
  info(`clusters, q = 0.5, k_out = 4, 200 networks: the second group falls (95% or more) in ${high}, holds (30% or less) in ${200 - high - mid}, in between in ${mid}; where it holds the share is at most ${f3(Math.max(...shares.filter((s) => s <= 0.3)))}`)
  check('clusters: at q = 0.5 and k_out = 4 the runs are all-or-nothing (of 200 networks at most 5 end between 30% and 95%)', mid <= 5 && high > 100 && high < 180)
  // finding 2: the group falls well before the average outside share reaches q
  info(`clusters, finding 2: at q = 0.5 the average outside share equals q at k_out = ${f2(averagePoint(0.5))}; the group falls in most runs from k_out = 4, where that share is ${f3(4 / 14)}`)
  check('clusters, finding 2: at q = 0.5 the second group always falls at k_out = 5, where the average outside share is 1/3, for all eleven sets', all.every((o) => o[0.5][4].share > 0.99) && near(averagePoint(0.5), 10, 1e-12))
  // a cluster denser than 1 − q is never entered: eight nodes all linked to one another, each with two links to adopters
  {
    const A = []
    const B = []
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
      A.push(a)
      B.push(b)
    }
    for (let a = 0; a < 8; a++) for (const d of [0, 1]) {
      A.push(a)
      B.push(8 + ((a + d) % 8))
    }
    const gg = buildCSR(16, A, B)
    const member = Uint8Array.from({ length: 16 }, (_, v) => (v < 8 ? 1 : 0))
    const out = [8, 9, 10, 11, 12, 13, 14, 15]
    const d = clusterDensity(gg, member)
    check('a cluster in which every node has 7 of its 9 links inside (density 0.778) is not entered at q = 0.25 or 0.5, and is entered at q = 0.2', near(d, 7 / 9, 1e-12) && d > 1 - 0.25 && cascade(gg, out, needByShare(gg, 0.25)).size === 8 && cascade(gg, out, needByShare(gg, 0.5)).size === 8 && !(d > 1 - 0.2) && cascade(gg, out, needByShare(gg, 0.2)).size === 16)
  }
  // and what is left of the second group when the cascade stops is such a cluster
  {
    let ok = true
    let seen = 0
    const ws = {}
    for (let j = 0; j < 30; j++) {
      const c = clusterNet(3, j, 2121)
      const first = Array.from({ length: K_GROUP }, (_, i) => i)
      const r = cascade(c.g, first, needByShare(c.g, 0.5), ws)
      if (r.size === c.g.n) continue
      seen++
      const left = new Uint8Array(c.g.n).fill(1)
      for (let i = 0; i < r.size; i++) left[ws.queue[i]] = 0
      if (!(clusterDensity(c.g, left) > 0.5)) ok = false
    }
    check('clusters: whenever the cascade stops, the nodes left form a cluster in which everyone has more than 1 − q of their links inside (30 networks at k_out = 3, q = 0.5)', ok && seen > 20, `${seen} stopped`)
  }
  // who lets it in: the nodes of the second group that adopt at the first step have more outside links than the average
  {
    let k1 = 0
    let n1 = 0
    let kAll = 0
    const ws = {}
    for (let j = 0; j < 30; j++) {
      const c = clusterNet(4, j, 2121)
      const first = Array.from({ length: K_GROUP }, (_, i) => i)
      cascade(c.g, first, needByShare(c.g, 0.5), ws)
      for (let v = K_GROUP; v < 2 * K_GROUP; v++) {
        let out = 0
        for (let i = c.g.offsets[v]; i < c.g.offsets[v + 1]; i++) if (c.g.neighbors[i] < K_GROUP) out++
        kAll += out
        if (ws.round[v] === 1 && ws.done[v] === ws.stamp) {
          k1 += out
          n1++
        }
      }
    }
    results.entry = { first: n1 / 30, kFirst: k1 / n1, kAll: kAll / (30 * K_GROUP) }
    info(`clusters, q = 0.5, k_out = 4, 30 networks: ${f1(n1 / 30)} nodes of the second group adopt at the first step, on average; they have ${f2(k1 / n1)} outside links against ${f2(kAll / (30 * K_GROUP))} for the whole group`)
    check('clusters: the nodes that let the cascade in have more than 1.5 times the outside links of the average node of their group', k1 / n1 > 1.5 * (kAll / (30 * K_GROUP)))
  }
}

// ---------------------------------------------------------------- figures

if (section('figures')) {
  const th = riotThresholds()
  const order = riotRun(th)
  check('F1: a hundred people with thresholds 0 to 99; started, they join in order, all of them', th.length === RIOT_N && order.length === 100 && order.every((v, i) => v === i))
  const moved = th.slice()
  moved[1] = 2
  check('F1: with person 1 at threshold 2 the riot stops at one person; lowered back, it is whole again', riotRun(moved).join() === '0' && riotRun(th).length === 100)
  const up50 = th.slice()
  up50[50] = 51
  info(`F1: raising the threshold of person 50 by one stops the riot at ${riotRun(up50).length}; lowering that of person 1 to 0 leaves ${riotRun(th.map((v) => (v === 1 ? 0 : v))).length}`)
  check('F1: raising any one threshold by one stops the riot at that person; lowering any one changes nothing', [1, 17, 50, 99].every((i) => riotRun(th.map((v) => (v === i ? v + 1 : v))).length === i) && [1, 17, 50, 99].every((i) => riotRun(th.map((v) => (v === i ? v - 1 : v))).length === 100))
  // F2
  const s = sequenceAt(F2_DEFAULT_Q, 0)
  const b = batchAt(F2_DEFAULT_Q, 0)
  results.f2 = { s, b, other: {} }
    info(`F2, q = ${F2_DEFAULT_Q}, first sequence: signals ${Array.from(s.signals).join('')}; choices ${Array.from(s.choices).join('')}; the cascade starts with person ${s.start + 1} and is ${s.right ? 'right' : 'wrong'}`)
  info(`F2, q = ${F2_DEFAULT_Q}, first batch of ${F2_RUNS}: ${b.cascades} cascades, ${b.wrong} wrong (${f3(wrongShareOf(b))}; formula ${f3(wrongCascade(F2_DEFAULT_Q))}); majority of the thirty signals right ${f3(majorityOf(b))} (binomial ${f3(majorityRight(F2_N, F2_DEFAULT_Q))})`)
  for (const q of [0.55, 0.7, 0.9]) {
    const x = batchAt(q, 0)
    info(`F2, q = ${q}, first batch: wrong ${f3(wrongShareOf(x))} (formula ${f3(wrongCascade(q))}), majority right ${f3(majorityOf(x))} (binomial ${f3(majorityRight(F2_N, q))}), ${x.cascades} cascades`)
    results.f2.other[q] = x
      }
  check('F2: a batch of 1,000 gives the share of wrong cascades within 0.05 of the formula and the majority within 0.04 of the binomial, at q = 0.55, 0.6, 0.7, 0.9 and for five batches each', [0.55, 0.6, 0.7, 0.9].every((q) => [0, 1, 2, 3, 4].every((j) => near(wrongShareOf(batchAt(q, j)), wrongCascade(q), 0.05) && near(majorityOf(batchAt(q, j)), majorityRight(F2_N, q), 0.04))))
  check('F2: the first batch is unchanged after the later ones were drawn (every field of a batch is a whole number)', JSON.stringify(results.f2.b) === JSON.stringify(batchAt(F2_DEFAULT_Q, 0)) && Object.values(b).every(Number.isInteger))
  check('F2: the same sequence and batch come back for the same number, and a new number gives new ones', Array.from(sequenceAt(0.6, 0).signals).join('') === Array.from(s.signals).join('') && Array.from(sequenceAt(0.6, 1).signals).join('') !== Array.from(s.signals).join('') && batchAt(0.6, 1).wrong !== b.wrong)
}

// ---------------------------------------------------------------- panels

if (section('panels')) {
  // Panel A, a crowd
  const c = crowd(CROWD_DEFAULT.mean, CROWD_DEFAULT.sd)
  const h = crowdHistogram(CROWD_DEFAULT.mean, CROWD_DEFAULT.sd)
  const [sw, secsA] = timed(() => sdSweep(CROWD_DEFAULT.mean))
  const A = { c, h, sw }
  info(`Panel A, crowd, mean 25, standard deviation 12: this crowd ends at ${c.outcome} (staircase ${c.staircase.join(' → ')}); the smooth curve at ${f2(c.smooth)}; lowest thresholds ${Array.from(c.sorted.slice(0, 8)).map(f1).join(', ')}`)
  info(`Panel A, 200 crowds at 25 and 12: ${f3(h.above)} end above 50; average outcome ${f1(h.average)}; from ${h.min} to ${h.max}; classes ${h.bins.join(' ')}`)
  for (const sd of [10, 15, 20, 30]) {
    const x = crowd(25, sd)
    const y = crowdHistogram(25, sd)
    A[`sd${sd}`] = { c: x, h: y }
    info(`Panel A, standard deviation ${sd}: this crowd ends at ${x.outcome}, the smooth curve at ${f2(x.smooth)}; of 200 crowds ${f3(y.above)} end above 50 (average ${f1(y.average)}, from ${y.min} to ${y.max})`)
  }
  info(`Panel A, sweep of the standard deviation (${f2(secsA)} s): smooth outcome and share of crowds above 50 at 5, 10, 11, 12, 13, 14, 15, 20, 30, 50: ${[5, 10, 11, 12, 13, 14, 15, 20, 30, 50].map((sd) => `${sd}: ${f1(sw[sd - 1].smooth)} / ${f2(sw[sd - 1].above)}`).join('; ')}`)
  const firstHalf = sw.find((r) => r.above >= 0.5)
  info(`Panel A, sweep: the smooth outcome jumps between ${sw.find((r) => r.smooth > 50).sd - 1} and ${sw.find((r) => r.smooth > 50).sd}; half the sampled crowds end above 50 from standard deviation ${firstHalf.sd}; the share is above 0 from ${sw.find((r) => r.above > 0).sd} and reaches 1 at ${sw.find((r) => r.above === 1).sd}`)
  check('Panel A: the crowd on show is not one of the 200 of the histogram, and its outcome is the end of its staircase', c.outcome === riot(c.thresholds) && crowdOutcomes(25, 12, 3).length === 3 && h.bins.reduce((a, b) => a + b) === CROWDS)
  check('Panel A, sweep: the smooth outcome jumps between 12 and 13, while the share of sampled crowds above 50 climbs gradually (between 0.05 and 0.95 over at least four values)', sw[11].smooth < 10 && sw[12].smooth > 99 && sw.filter((r) => r.above > 0.05 && r.above < 0.95).length >= 4)
  check('Panel A: defaults are the market of exercise 3 and the Bass coefficients of exercise 4', MARKET_DEFAULT.p === 0.16 && MARKET_DEFAULT.z0 === 0.25 && BASS_DEFAULT.p === 0.03 && BASS_DEFAULT.q === 0.38)
  results.A = A
  // Panel B
  const B = {}
  const [bd, secsB] = timed(() => cascadesAt(B_DEFAULT))
  B.def = bd
  info(`Panel B, default (random network, z = 4, φ = 0.18, ${B_TRIALS} random seeds; ${f2(secsB)} s): ${bd.links} links; ${f3(bd.vulnerable)} of the nodes are vulnerable (k ≤ ${bd.K}); condition ${f2(bd.condition)}; global ${f3(bd.global)}; mean size of the global ones ${f3(bd.meanGlobal)}; first class ${f3(bd.bins[0])}`)
  for (const [id, params] of [['z3', { ...B_DEFAULT, z: 3 }], ['z5', { ...B_DEFAULT, z: 5 }], ['z575', { ...B_DEFAULT, z: 5.75 }], ['z58', { ...B_DEFAULT, z: 5.8 }], ['z6', { ...B_DEFAULT, z: 6 }], ['z62', { ...B_DEFAULT, z: 6.2 }], ['phi30', { ...B_DEFAULT, phi: 0.3 }], ['phi10', { ...B_DEFAULT, phi: 0.1 }], ['phi25', { ...B_DEFAULT, phi: 0.25 }], ['pa', { ...B_DEFAULT, source: 'pa' }], ['top', { ...B_DEFAULT, seeds: 'top' }], ['paTop', { ...B_DEFAULT, source: 'pa', seeds: 'top' }], ['z6top', { ...B_DEFAULT, z: 6, seeds: 'top' }], ['z7top', { ...B_DEFAULT, z: 7, seeds: 'top' }]]) {
    B[id] = cascadesAt(params)
    info(`Panel B, ${id} (${params.source}, z = ${B[id].z}, ${params.seeds}): vulnerable ${f3(B[id].vulnerable)}; condition ${f2(B[id].condition)}; global ${f3(B[id].global)}; mean size ${f3(B[id].meanGlobal)}; the 20 nodes of highest degree have at least ${B[id].kTop} links`)
  }
  for (const [id, params] of [['sweep', B_DEFAULT], ['sweepPa', { ...B_DEFAULT, source: 'pa' }], ['sweepTop', { ...B_DEFAULT, seeds: 'top' }], ['sweep10', { ...B_DEFAULT, phi: 0.1 }], ['sweep25', { ...B_DEFAULT, phi: 0.25 }]]) {
    const [r, secs] = timed(() => drain(windowJob(params)))
    B[id] = r
    info(`Panel B, ${id} (${f1(secs)} s): window ${r.window ? `${f2(r.window[0])} to ${f2(r.window[1])}` : 'none'}; global by z: ${r.rows.map((x) => `${x.z}: ${f2(x.global)}`).join(' ')}`)
    info(`  mean size of the global ones: ${r.rows.filter((x) => x.global > 0).map((x) => `${x.z}: ${f3(x.meanGlobal)}`).join(' ')}`)
  }
  check('Panel B: the sweep has 31 values of z from 0.5 to 8 (4 under preferential attachment), and its row at z = 4 is the panel at z = 4', B.sweep.rows.length === 31 && B_ZS[0] === 0.5 && B_ZS[30] === 8 && B.sweepPa.rows.length === B_ZS_PA.length && B.sweep.rows[14].z === 4 && B.sweep.rows[14].global === bd.global)
  check('Panel B: global cascades only inside the window given by the condition, give or take one step of the sweep', B.sweep.rows.every((r) => !(r.global > 0.02) || (r.z > B.sweep.window[0] - 0.01 && r.z < B.sweep.window[1] + 0.26)))
  check('Panel B: a cascade is global above 10% of the nodes, and the network has 10,000', GLOBAL === 0.1 && bd.n === B_N)
  results.B = B
  // Panel C
  const [lt, secsC] = timed(() => drain(longTiesJob()))
  info(`Panel C, long ties, ${C_NETS} networks per p (${f1(secsC)} s), p = ${C_PS.join(', ')}`)
  info(`  simple, steps to 90%: ${lt.rows.map((r) => f1(r.simple.steps)).join(', ')}`)
  info(`  complex, steps to 90%: ${lt.rows.map((r) => (r.complex.reached ? `${f1(r.complex.steps)}${r.complex.reached < C_NETS ? ` (${r.complex.reached} of ${C_NETS})` : ''}` : '–')).join(', ')}`)
  info(`  complex, share reached: ${lt.rows.map((r) => f3(r.complex.share)).join(', ')}`)
  const C = { lt, cl: {} }
  for (const q of [0.5, 0.4, 0.3]) {
    const [r, secs] = timed(() => drain(clustersJob(q)))
    C.cl[q] = r
    info(`Panel C, clusters, q = ${q}, ${K_NETS} networks per point (${f1(secs)} s): average point k_out = ${f2(r.average)}; share by k_out: ${r.rows.filter((x) => x.kOut <= 6).map((x) => `${x.kOut}: ${f3(x.share)} (${Math.round(x.over * K_NETS)})`).join(' ')}`)
  }
  check('Panel C, long ties: ten values of p, the first is the ring with 562 and 749 steps', lt.rows.length === C_PS.length && lt.rows[0].simple.steps === 562 && lt.rows[0].complex.steps === 749)
  check('Panel C, clusters: 21 values of k_out from 0 to 10; with no links between the groups nobody adopts, with 10 everybody does (q = 0.5)', C.cl[0.5].rows.length === K_OUTS.length && C.cl[0.5].rows[0].share === 0 && C.cl[0.5].rows[20].share > 0.99 && K_DEFAULT.q === 0.5)
  results.C = C
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (results.A && results.B && results.C && results.f2 && results.longties && results.sweepOthers && results.longAt05 && results.smooth) {
    const slug = 'social-contagion-network-effects'
    const lectureEn = readFileSync(new URL(`src/content/network-lab/${slug}.en.md`, root), 'utf8')
    const lectureIt = readFileSync(new URL(`src/content/network-lab/${slug}.it.md`, root), 'utf8')
    const mod = await import(`../../src/components/lab/network/${slug}/texts.js`)
    const pageText = [JSON.stringify(mod.observe), JSON.stringify(mod.exercises)].join(' ')
    const enOf = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    const e3 = (v) => enOf(v, 3)
    const e2 = (v) => enOf(v, 2)
    const e1 = (v) => enOf(v, 1)
    const quoted = (name, phrases, where = pageText) => {
      const missing = phrases.filter((p) => !where.includes(p))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.join(' | '))
    }
    const { A, B, C } = results
    // ---- Panel A
    const sw = (sd) => A.sw[sd - 1]
    quoted('Panel A, a crowd', [
      `the next lowest threshold is ${e1(A.c.sorted[2])}`,
      `${A.c.outcome} people, where the smooth curve says ${e1(A.c.smooth)}`,
      `${e3(A.h.above)} of them end above 50, and the average outcome is ${e1(A.h.average)}`,
    ])
    check('Panel A, a crowd: two thresholds are 0, and the histogram has two heaps (fewer than 5 of 200 crowds end between 10 and 90)', A.c.sorted[1] === 0 && A.c.sorted[2] > 2 && A.h.bins.slice(2, 18).reduce((x, y) => x + y) < 5)
    quoted('Panel A, other standard deviations', [`At 10 this crowd ends at ${A.sd10.c.outcome} and none of the 200 passes 50`, `At 15 it ends at ${A.sd15.c.outcome}, as the smooth curve does, and ${e3(A.sd15.h.above)} of the 200 pass 50`])
    check('Panel A: at 10 no crowd passes 50, and at 15 the smooth curve ends at 100', A.sd10.h.above === 0 && e1(A.sd15.c.smooth) === '100.0')
    quoted('Panel A, sweep', [
      `jumps between 12 and 13, from ${e1(sw(12).smooth)} people to ${e1(sw(13).smooth)}`,
      `is ${e2(sw(11).above)} at 11, ${e2(sw(12).above)} at 12, ${e2(sw(13).above)} at 13, ${e2(sw(14).above)} at 14, ${e2(sw(15).above)} at 15 and ${e2(sw(20).above)} at 20`,
      `to ${e1(sw(50).smooth)} at 50`,
    ])
    const p25 = marketPath(MARKET_DEFAULT.z0, MARKET_DEFAULT.p, 400)
    const eq = marketEquilibria(MARKET_DEFAULT.p)
    quoted('Panel A, a market', [`tipping point ${e3(eq.tipping)}, stable share ${e3(eq.high)}`, `the share climbs, ${e3(p25[1])}, ${e3(p25[2])}, ${e3(p25[3])}, and settles at ${e3(p25[400])}`, `it is ${e3(marketPath(0.15, 0.16)[1])} at the first step`])
    const pk = bassPeak(BASS_DEFAULT.p, BASS_DEFAULT.q)
    quoted('Panel A, Bass', [`after ${e2(pk.t)} years, when ${e3(pk.F)} have adopted, at ${enOf(pk.rate, 4)} a year`])
    check('Panel A, Bass: with q = 0 the rate is highest at the start and only falls', bassPeak(0.03, 0).t === 0 && bassRate(0, 0.03, 0) > bassRate(1, 0.03, 0) && bassRate(1, 0.03, 0) > bassRate(5, 0.03, 0))
    // ---- Panel B
    const d = B.def
    const row = (r, z) => r.rows.find((x) => x.z === z)
    quoted('Panel B, default', [`${e3(d.vulnerable)} of the nodes are vulnerable (k ≤ ${d.K}) and the cascade condition is ${e2(d.condition)}`, `Of 200 random seeds ${e3(d.global)} start a global cascade, and a global cascade takes ${e3(d.meanGlobal)} of the nodes`])
    check('Panel B, default: the histogram has two bars and nothing between them', d.bins.filter((x) => x > 0).length === 2 && d.bins[0] > 0 && d.bins[19] > 0)
    quoted('Panel B, sweep', [
      `Nothing up to z = 1; ${e2(row(B.sweep, 1.25).global)} at 1.25; ${e2(row(B.sweep, 3.75).global)} at 3.75; ${e2(row(B.sweep, 5).global)} at 5; ${e2(row(B.sweep, 5.5).global)} at 5.5; ${e2(row(B.sweep, 5.75).global)} at 5.75; ${e2(row(B.sweep, 6).global)} at 6`,
      `${e2(B.sweep.window[0])} and ${e2(B.sweep.window[1])}`,
      `${e3(row(B.sweep, 1.25).meanGlobal)} at z = 1.25, ${e3(row(B.sweep, 2).meanGlobal)} at 2, ${e3(row(B.sweep, 4).meanGlobal)} at 4, ${e3(row(B.sweep, 5.75).meanGlobal)} at 5.75`,
    ])
    check('Panel B, sweep: nothing up to z = 1, and 3.75 is where the share is highest', B.sweep.rows.filter((x) => x.z <= 1).every((x) => x.global === 0) && B.sweep.rows.every((x) => x.global <= row(B.sweep, 3.75).global))
    quoted('Panel B, outside the window', [`the condition is ${e2(B.z6.condition)} and still ${e3(B.z6.global)} of the seeds, ${Math.round(B.z6.global * 200)} of 200`])
    quoted('Panel B, hubs', [`More nodes are vulnerable, ${e3(B.pa.vulnerable)}, and yet only ${e3(B.pa.global)} of the seeds`, `at least ${B.pa.kTop} links`, `: ${e3(B.paTop.global)}, in this network and in the random one`])
    check('Panel B, hubs: from the 20 largest hubs every seed succeeds on both networks at z = 4, and none on the random network at z = 7', B.top.global === 1 && B.paTop.global === 1 && B.z7top.global === 0)
    const w10 = cascadeWindow(0.1)
    const w25 = cascadeWindow(0.25)
    quoted('Panel B, other thresholds', [`from ${e2(w10[0])} to ${e2(w10[1])} and ${e3(B.phi10.global)} of the seeds succeed`, `from ${e2(w25[0])} to ${e2(w25[1])}, z = 4 is just outside, and ${e3(B.phi25.global)} succeed`])
    check('Panel B: at φ = 0.30 there is no window and no seed succeeds at z = 4', cascadeWindow(0.3) === null && B.phi30.global === 0)
    // ---- Panel C
    const lt = (p) => C.lt.rows.find((r) => r.p === p)
    const st = (x) => (Number.isInteger(x) ? String(x) : e1(x))
    quoted('Panel C, long ties', [
      `simple contagion needs ${st(lt(0).simple.steps)} steps to reach 90% of the nodes and complex contagion ${st(lt(0).complex.steps)}`,
      `simple contagion takes ${st(lt(0.001).simple.steps)} steps, complex ${st(lt(0.001).complex.steps)}. One in a hundred: ${st(lt(0.01).simple.steps)} and ${st(lt(0.01).complex.steps)}`,
      `${Math.round(lt(0).simple.steps / lt(0.01).simple.steps)} times smaller`,
      `${st(lt(0.03).complex.steps)} steps at p = 0.03, ${st(lt(0.1).complex.steps)} at 0.1, ${st(lt(0.2).complex.steps)} at 0.2`,
      `At p = 0.3 it reaches 90% in ${lt(0.3).complex.reached} networks of 10; at 0.5 it reaches ${e3(lt(0.5).complex.share)} of the nodes, and at 1 it reaches ${e3(lt(1).complex.share)}`,
    ])
    check('Panel C, long ties: at p = 0.5 and 1 simple contagion needs about 4 steps', near(lt(0.5).simple.steps, 4, 0.2) && near(lt(1).simple.steps, 4, 0.2))
    const cl = (q, k) => C.cl[q].rows.find((r) => r.kOut === k)
    quoted('Panel C, clusters', [
      `on average ${e3(4 / 14)} of its links to the first`,
      `falls in ${Math.round(cl(0.5, 4).over * 20)} networks of 20 (${e3(cl(0.5, 4).share)} of its nodes on average)`,
      `${e3(cl(0.5, 3).share)} at k_out = 3, ${e3(cl(0.5, 3.5).share)} at 3.5, ${e3(cl(0.5, 4.5).share)} at 4.5`,
      `is at k_out = ${averagePoint(0.5)}`,
      `(the line is at ${e2(averagePoint(0.4))})`,
      `falls in ${Math.round(cl(0.3, 1).over * 20)} networks of 20 with k_out = 1 (the line is at ${e2(averagePoint(0.3))})`,
    ])
    check('Panel C, clusters: at q = 0.4 the step is between k_out = 2 and 2.5', cl(0.4, 2).share < 0.2 && cl(0.4, 2.5).share > 0.9)
    // ---- Exercises
    quoted('Exercise 1', ['All 100', 'the riot is 1 person', 'nobody moves: 0'])
    const b = results.f2.b
    quoted('Exercise 2', ['0.16/0.52 = 0.308', '0.09/0.58 = 0.155', '0.48⁵ = 0.025', 'a binomial sum, 0.846', `gives ${b.wrong} wrong cascades in 1,000 (${e3(wrongShareOf(b))})`, `right ${e3(majorityOf(b))} of the time (${e3(majorityRight(F2_N, 0.6))} expected for thirty)`])
    check('Exercise 2: the first batch at q = 0.6 has 1,000 cascades', b.cascades === 1000)
    quoted('Exercise 3', ['z = 0.2 and z = 0.8', 'above a price of 0.25 only zero is left', `the share goes ${e3(p25[1])}, ${e3(p25[2])}, ${e3(p25[3])}, ${e3(p25[4])} and on to 0.8`])
    quoted('Exercise 4', ['F = 1/2 − p/(2q) = 0.46', 'ln(12.67)/0.41 = 6.19 years', `After 5 years F = ${e3(bassF(5, 0.03, 0.38))} and after 10 years ${e3(bassF(10, 0.03, 0.38))}`, `1 − e^(−0.3) = ${e3(bassF(10, 0.03, 0))}`])
    check('Exercise 4: q/p = 12.67, and almost half of all adoption falls between year 5 and year 10', e2(0.38 / 0.03) === '12.67' && near(bassF(10, 0.03, 0.38) - bassF(5, 0.03, 0.38), 0.5, 0.03))
    quoted('Exercise 5', ['q ≤ 1/4, that is a ≥ 3b', 'k ≤ 5', `with ${B.pa.kTop} links and φ = 0.18, ${Math.ceil(0.18 * B.pa.kTop - 1e-9)} adopting neighbours`, `from ${e3(B.pa.global)} of random seeds under preferential attachment`])
    const at001 = [results.longties, ...results.longOthers].map((o) => o[3].complex.steps)
    const at58 = [results.sweep[7].global, ...results.sweepOthers[7]]
    quoted('Exercise 6', [
      `Simple: ${st(lt(0).simple.steps)}, ${st(lt(0.01).simple.steps)}, ${st(lt(0.1).simple.steps)} and ${st(lt(0.5).simple.steps)} steps. Complex: ${st(lt(0).complex.steps)}, ${st(lt(0.01).complex.steps)} and ${st(lt(0.1).complex.steps)}, and at p = 0.5 it does not spread (${e3(lt(0.5).complex.share)} of the nodes)`,
      `give ${Math.round(Math.min(...at001))} to ${Math.round(Math.max(...at001))} steps at p = 0.01`,
      `did spread in ${results.longAt05.reached} networks of ${results.longAt05.nets}`,
      `(b) ${e3(B.z3.global)}, ${e3(B.z5.global)}, ${e3(B.z58.global)} and ${e3(B.z62.global)}`,
      `finds ${e2(Math.min(...at58))} to ${e2(Math.max(...at58))} at z = 5.8`,
    ])
    check('Exercise 6: one link in a hundred saves complex contagion 8% of its steps and makes simple contagion 29 times faster; ten in a hundred make complex contagion about ten times faster', Math.round(100 * (1 - lt(0.01).complex.steps / 749)) === 8 && Math.round(562 / lt(0.01).simple.steps) === 29 && near(749 / lt(0.1).complex.steps, 10, 0.5))
    // ---- lecture
    quoted('lecture, wrong together', [`which is ${e2(wrongCascade(0.6))} for q = 0.6`, `right ${Math.round(100 * majorityRight(25, 0.6))}% of the time`, '14,341 people listened to 48 unknown songs', 'one of eight separate'], lectureEn)
    quoted('lecture, thresholds', ['creeps up to about 6 people, and near 12.2 it jumps to nearly 100', `where the smooth curve stops at ${Math.round(A.c.smooth)} people, ${Math.round(100 * A.h.above)}% of 200 crowds`], lectureEn)
    check('lecture, thresholds: the smooth outcome is about 6 just below the jump at 12.2', near(smoothOutcome(100, 25, 12.2), 5.5, 0.6) && f1(results.smooth.jump) === '12.2')
    quoted('lecture, Bass', ['A meta-analysis of 213 applications', 'p = 0.03 and q = 0.38'], lectureEn)
    quoted('lecture, the cascade window', [
      `runs from z = ${e2(B.sweep.window[0])} to ${e2(B.sweep.window[1])}`,
      `at z = 4, ${e3(d.global)} of 200 random seeds start a global cascade. At z = 5.75 only ${e3(B.z575.global)} do, and those that do take ${e3(B.z575.meanGlobal)} of the nodes`,
      `cascades from ${e3(B.pa.global)} of random seeds`,
    ], lectureEn)
    quoted('lecture, complex contagion', [
      `in ${st(lt(0).simple.steps)} steps, and in ${st(lt(0.01).simple.steps)} when one link in a hundred is rewired; complex contagion goes from ${st(lt(0).complex.steps)} to ${st(lt(0.01).complex.steps)}`,
      `it reaches ${e3(lt(0.5).complex.share)} of the nodes`,
      '1,528 people', '54% of those in clustered networks against 38% in random ones',
    ], lectureEn)
    quoted('lecture, box', ['k = 1.69', 'k = 1.838', '1.59, 2.64, 3.28 and 6.83', 'supplement, section S2', '(/lab/bitcoin-complex-system)', '(/research/publications#preprint)'], lectureEn)
    const cl13 = readFileSync(new URL('src/content/lab/bitcoin-complex-system.en.md', root), 'utf8')
    const m12 = readFileSync(new URL('src/content/network-lab/epidemics-on-networks.en.md', root), 'utf8')
    check('lecture, box: 1.838 is the exponent Complexity Lab module 13 cites, and the two Zenodo references are the lines of module 12', cl13.includes('N^1.838') && lectureEn.split(/\r?\n/).filter((l) => l.startsWith('- Santostasi') || l.startsWith('- Pecere')).every((l) => m12.includes(l)) && lectureEn.split(/\r?\n/).filter((l) => l.startsWith('- Santostasi') || l.startsWith('- Pecere')).length === 2)
    const m08 = readFileSync(new URL('src/content/network-lab/who-connects-to-whom.en.md', root), 'utf8')
    check('lecture: Aral et al. and Shalizi and Thomas are cited as in module 08', lectureEn.split(/\r?\n/).filter((l) => l.startsWith('- Aral') || l.startsWith('- Shalizi')).every((l) => m08.includes(l)))
    check('lecture: links to modules 04, 08, 09, 12 and 14 and to Complexity Lab modules 03 and 13', ['/network-lab/triangles-weak-ties-motifs', '/network-lab/who-connects-to-whom', '/network-lab/communities', '/network-lab/epidemics-on-networks', '/network-lab/capstone-a-real-network', '/lab/small-worlds', '/lab/bitcoin-complex-system'].every((l) => lectureEn.includes(`(${l})`) && lectureIt.includes(`(${l})`)))
    // the two lectures, and the Italian texts, carry the same numbers
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    const body = (text) => text.split('<!-- simulation -->')[0]
    check('quoted on the page — the two lectures carry the same numbers', numbers(body(lectureEn)) === numbers(body(lectureIt)))
    const diff = []
    const pairs = [...Object.entries(mod.observe), ...mod.exercises.flatMap((e, i) => [[`exercise ${i + 1} statement`, e.statement], [`exercise ${i + 1} solution`, e.solution]])]
    for (const [name, v] of pairs) if (numbers(v.en) !== numbers(v.it)) diff.push(name)
    check('quoted on the page — the Italian "what to observe" lists and exercises carry the same numbers as the English ones', diff.length === 0, diff.join(', '))
    const words = (text) => (body(text).match(/\S+/g) || []).length
    info(`lecture words (with markup, up to the simulation marker): EN ${words(lectureEn)}, IT ${words(lectureIt)}`)
    check('lectures: 1,400–1,700 words each', [lectureEn, lectureIt].every((x) => words(x) >= 1400 && words(x) <= 1700), `${words(lectureEn)} / ${words(lectureIt)}`)
    check('lectures: the DRAFT marker is the first line', [lectureEn, lectureIt].every((x) => x.startsWith('<!-- DRAFT: to be reviewed by Adriano -->')))
    const box = (x) => (x.match(/```box\r?\n([\s\S]*?)```/) || [])[1] || ''
    info(`Bitcoin box words: EN ${(box(lectureEn).match(/\S+/g) || []).length}, IT ${(box(lectureIt).match(/\S+/g) || []).length}`)
    check('lectures: one box, on Bitcoin, in each language, and two live figures', [lectureEn, lectureIt].every((x) => (x.match(/```box/g) || []).length === 1 && box(x).includes('Bitcoin') && (x.match(/```figure/g) || []).length === 2))
    check('lectures: the box gives no price, forecast or current statistic (no currency sign, no year besides the citations)', ![lectureEn, lectureIt].some((x) => /\$|USD|€|forecast|prevision/i.test(box(x))))
    check('lectures and texts never call the course free', ![body(lectureEn), body(lectureIt), pageText].some((x) => /\bfree\b|gratuit|gratis/i.test(x)))
    check('lectures: the same twenty-seven references in both languages', [lectureEn, lectureIt].every((x) => x.split('<!-- simulation -->')[1].split(/\r?\n/).filter((l) => l.startsWith('- ')).length === 27))
    check('exercises: six — three on paper, two on paper and in the page, one in the simulation', mod.exercises.length === 6 && mod.exercises.filter((e) => e.type === 'paper').length === 3 && mod.exercises.filter((e) => e.type === 'both').length === 2 && mod.exercises.filter((e) => e.type === 'sim').length === 1)
  } else info('run the whole check to pin the texts')
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
