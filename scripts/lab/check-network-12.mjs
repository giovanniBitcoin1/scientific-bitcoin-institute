// Self-checks for Network Lab module 12, "Epidemics on networks". They run
// the same code as the page (epidemic.js, experiments.js, figures.js) and
// compare it with direct recomputation, closed forms and the answers of the
// exercises.
//
//   node scripts/lab/check-network-12.mjs [section]
//
// Sections: exercises, percolation, seeds, timestep, immunise, lattice, sis,
// figures, panels, page. Exits with code 1 if any check fails. Lines starting
// with INFO report the numbers quoted in the lecture, the "what to observe"
// lists and the exercises; checks starting "quoted on the page" pin them. Run
// it whole: the section "page" uses the numbers of the others. It takes about
// a minute and a half (the SIS sweeps and the ten other seeds of each
// comparison).
import { readFileSync } from 'node:fs'
import {
  thresholdT, r0, thresholdSIS, immuneShare, finalSizeMixing, empiricalFamily, outbreakTheory, seedProbability, bondPercolation, percolationMean,
  outbreakFrom, spread, transmissibility, cumulative, timeTo, logLogSlope, squareLattice, edgeTime, sisPrevalence, acquaintanceOrder,
} from '../../src/components/lab/network/epidemics-on-networks/epidemic.js'
import {
  makeNet, netA, sweepJob, theoryCurve, seedsJob, seedsOfDegree, sisJob, netsB, spreadJob, netC, immuniseJob, immuneOrders, stopsAt, drain,
  A_DEFAULT, A_SEED, A_TRIALS, B_DEFAULT, B_L, B_N, B_RUNS, C_DEFAULT, C_RUNS, LARGE, MEAN_K, SIS_MU, STRATEGIES,
} from '../../src/components/lab/network/epidemics-on-networks/experiments.js'
import {
  seedNet, seedOutbreaks, mixingCurve, latticeCurve, ladderAt, ladderCurve, ladderExponent, ladderSlope, F1_N, F1_T, F1_RUNS, F1_BIG, MIX, LAT, LADDER,
} from '../../src/components/lab/network/epidemics-on-networks/figures.js'
import { poissonFamily, giant } from '../../src/components/lab/network/heavy-tails-done-right/genfun.js'
import { seedOf, largestComponent, criticalFraction } from '../../src/components/lab/network/robustness-and-cascades/robust.js'
import { spreadSI } from '../../src/components/lab/network/what-are-we-measuring/friends.js'
import { buildCSR, connectedComponents } from '../../src/components/lab/graphUtils.js'
import { mulberry32 } from '../../src/components/lab/rng.js'

const only = process.argv[2]
const section = (name) => !only || only === name
let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
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
const OTHER = Array.from({ length: 10 }, (_, j) => 880000 + 131 * j) // ten other seeds for the comparisons with a tolerance
const TS = [0.25, 0.3, 0.4, 0.5]
const TS_PA = [0.15, 0.2, 0.25, 0.3, 0.4, 0.5]
const GS = [0.05, 0.1, 0.2, 0.3, 0.5]

// ---------------------------------------------------------------- exercises

if (section('exercises')) {
  // 1
  const a = { Tc: thresholdT(4, 20), R: r0(0.3, 4, 20) }
  const b = { Tc: thresholdT(4, 100), R: r0(0.3, 4, 100) }
  check('exercise 1: random network with ⟨k⟩ = 4, T_c = 0.25 and R0 = 1.2 at T = 0.3', near(a.Tc, 0.25, 1e-12) && near(a.R, 1.2, 1e-12), `${a.Tc} ${a.R}`)
  check('exercise 1: ⟨k⟩ = 4, ⟨k²⟩ = 100, T_c = 0.0417 and R0 = 7.2', f4(b.Tc) === '0.0417' && near(b.R, 7.2, 1e-12), `${f4(b.Tc)} ${b.R}`)
  check('exercise 1: T_c is module 11\'s formula read the other way, f_c = 1 − T_c', near(criticalFraction(4, 20), 1 - a.Tc, 1e-12) && near(criticalFraction(4, 100), 1 - b.Tc, 1e-12))
  // 2
  const S = [1.2, 2, 3].map(finalSizeMixing)
  check('exercise 2: S = 1 − e^(−R S) gives 0.314, 0.797, 0.940 for R = 1.2, 2, 3', S.map(f3).join(' ') === '0.314 0.797 0.940', S.map(f4).join(' '))
  check('exercise 2: each S solves its equation, and the generating functions of a Poisson family give the same', S.every((s, i) => near(s, 1 - Math.exp(-[1.2, 2, 3][i] * s), 1e-9) && near(s, outbreakTheory(poissonFamily(4), [1.2, 2, 3][i] / 4).S, 1e-6)))
  check('exercise 2: no outbreak at R = 1 or below', finalSizeMixing(1) === 0 && finalSizeMixing(0.8) === 0)
  // 3
  const th = outbreakTheory(poissonFamily(4), 0.5)
  results.ex3 = th
  const p3 = [1, 4, 10].map((k) => seedProbability(th.w, k))
  check('exercise 3: u = 0.2032, w = 0.6016', f4(th.u) === '0.2032' && f4(th.w) === '0.6016', `${th.u} ${th.w}`)
  check('exercise 3: a seed with 1, 4, 10 links starts a large outbreak with probability 0.398, 0.869, 0.994', p3.map(f3).join(' ') === '0.398 0.869 0.994', p3.map(f4).join(' '))
  check('exercise 3: the final share 1 − G0(w) is 0.797, the S of exercise 2 at R = 2', f3(th.S) === '0.797' && near(th.S, S[1], 1e-6))
  // 4
  const g4 = [1 - 1 / 3, immuneShare(a.Tc, 0.5), immuneShare(b.Tc, 0.5)]
  check('exercise 4: 0.667 with homogeneous mixing and R0 = 3; 0.5 and 0.917 at T = 0.5', g4.map(f3).join(' ') === '0.667 0.500 0.917', g4.map(f4).join(' '))
  // 5
  const s82 = ladderSlope(8, 2)
  const s42 = ladderSlope(4, 2)
  info(`exercise 5: fitted slope of the ladder over 20 rungs, a = 8, b = 2: ${f3(s82)}; a = 4, b = 2: ${f3(s42)}`)
  check('exercise 5: ln a / ln b is 3 for a = 8, b = 2 and 2 for a = 4, b = 2', near(ladderExponent(8, 2), 3, 1e-12) && near(ladderExponent(4, 2), 2, 1e-12))
  check('exercise 5: the fitted slope of the ladder is within 0.02 of ln a / ln b', near(s82, 3, 0.02) && near(s42, 2, 0.02) && [[3, 1.5], [10, 4], [2, 3], [10, 1.5]].every(([x, y]) => near(ladderSlope(x, y), ladderExponent(x, y), 0.02)))
  check('exercise 5: one rung later the ladder has grown by the factor a (N(bt) = a N(t), to 1 part in 1,000)', [10, 37.3, 200].every((t) => near(ladderAt(2 * t, 8, 2) / ladderAt(t, 8, 2), 8, 0.008)), [10, 37.3, 200].map((t) => f4(ladderAt(2 * t, 8, 2) / ladderAt(t, 8, 2))).join(' '))
}

// ---------------------------------------------------------------- percolation

const poissonAt = (seed, N = 10000) => makeNet(seed, { source: 'poisson', N })
const paAt = (seed, N = 10000) => makeNet(seed, { source: 'pa', N })

if (section('percolation')) {
  // against a direct search of the components of the kept links
  let same = true
  for (let j = 0; j < 30; j++) {
    const on = makeNet(4242 + j, { source: ['poisson', 'pa', 'power'][j % 3], N: 60 + 10 * (j % 5) })
    const T = 0.2 + 0.03 * j
    const immune = j % 2 ? Uint8Array.from({ length: on.n }, (_, v) => (v % 4 === 0 ? 1 : 0)) : null
    const got = bondPercolation(on.net, T, mulberry32(j), immune)
    const random = mulberry32(j)
    const A = []
    const B = []
    for (let e = 0; e < on.links; e++) {
      const a = on.net.A[e]
      const b = on.net.B[e]
      if (immune && (immune[a] || immune[b])) continue
      if (random() >= T) continue
      A.push(a)
      B.push(b)
    }
    const want = largestComponent(buildCSR(on.n, A, B), immune ? immune.map((x) => 1 - x) : null).size
    if (got !== want) same = false
  }
  check('percolation: the largest component by union–find equals a direct search of the kept links, with and without immune nodes (30 small networks)', same)
  const on = netA({ source: 'poisson', N: 10000 })
  check('percolation: T = 1 gives the largest component of the network and T = 0 a single node', bondPercolation(on.net, 1, mulberry32(1)) === connectedComponents(on.g).largest && bondPercolation(on.net, 0, mulberry32(1)) === 1)
  // the generating functions of the degrees
  const fam = on.fam
  check('theory: the generating functions of the degree list have G0(1) = G1(1) = 1 and G1\'(1) = (⟨k²⟩ − ⟨k⟩)/⟨k⟩', near(fam.G0(1), 1, 1e-9) && near(fam.G1(1), 1, 1e-9) && near((fam.G1(1) - fam.G1(1 - 1e-6)) / 1e-6, fam.slope, 1e-3))
  check('theory: at T = 1 it is module 05\'s giant component', near(outbreakTheory(poissonFamily(3), 1).S, giant(poissonFamily(3)).S, 1e-9))
  check('theory: nothing at or below T_c, something just above', outbreakTheory(fam, on.Tc).S === 0 && outbreakTheory(fam, on.Tc + 0.02).S > 0.01)
  // random network, N = 10,000, mean of 3 runs
  const measure = (net, Ts, seed) => {
    const random = mulberry32(seed)
    return Ts.map((T) => percolationMean(net, T, 3, random))
  }
  const got = measure(on.net, TS, 7)
  const theory = TS.map((T) => outbreakTheory(poissonFamily(4), T).S)
  const own = TS.map((T) => outbreakTheory(fam, T).S)
  results.percPoisson = { got, theory, own, on }
  info(`percolation, random network, N = 10,000, ⟨k⟩ = ${f3(on.mean)}, ⟨k²⟩ = ${f3(on.mean2)}, T_c = ${f4(on.Tc)}`)
  info(`percolation, random network, T = ${TS.join(', ')}: measured ${got.map(f3).join(', ')}; 1 − G0(w) for Poisson degrees ${theory.map(f3).join(', ')}; for the degrees of this network ${own.map(f3).join(', ')}; expected in the prompt 0.04, 0.30, 0.64, 0.79`)
  check('percolation, random network: within 0.05 of 1 − G0(w) at T = 0.3 and within 0.03 at T = 0.4 and 0.5', near(got[1], theory[1], 0.05) && near(got[2], theory[2], 0.03) && near(got[3], theory[3], 0.03))
  check('percolation, random network: the theory is 0, 0.314, 0.642, 0.797', theory.map(f3).join(' ') === '0.000 0.314 0.642 0.797')
  const gaps = [0, 0, 0, 0]
  const at25 = []
  for (const s of OTHER) {
    const o = poissonAt(s)
    const v = measure(o.net, TS, s + 1)
    at25.push(v[0])
    for (let i = 1; i < 4; i++) gaps[i] = Math.max(gaps[i], Math.abs(v[i] - theory[i]))
  }
  info(`percolation, ten other random networks: largest gap from the theory at T = 0.3, 0.4, 0.5: ${gaps.slice(1).map(f3).join(', ')}; at T = 0.25 (the threshold) the measured share runs from ${f3(Math.min(...at25))} to ${f3(Math.max(...at25))}`)
  check('percolation, ten other random networks: the same limits hold', gaps[1] <= 0.05 && gaps[2] <= 0.03 && gaps[3] <= 0.03)
  results.at25 = at25
  // preferential attachment
  const pa = netA({ source: 'pa', N: 10000 })
  const gotPa = measure(pa.net, TS_PA, 9)
  results.percPa = { got: gotPa, on: pa }
  info(`percolation, preferential attachment m = 2, N = 10,000: ⟨k²⟩ = ${f3(pa.mean2)}, T_c = ${f4(pa.Tc)} (expected about 0.07); T = ${TS_PA.join(', ')}: ${gotPa.map(f3).join(', ')}; expected in the prompt 0.08, 0.18, 0.31, 0.44, 0.63, 0.77`)
  check('percolation, preferential attachment: T_c from the formula is about 0.07 (0.06 to 0.09)', pa.Tc > 0.06 && pa.Tc < 0.09)
  check('percolation, preferential attachment: within 0.03 of the values expected in the prompt', gotPa.every((v, i) => near(v, [0.08, 0.18, 0.31, 0.44, 0.63, 0.77][i], 0.03)))
  const tcs = OTHER.map((s) => paAt(s).Tc)
  info(`percolation, ten other preferential-attachment networks: T_c from ${f4(Math.min(...tcs))} to ${f4(Math.max(...tcs))}`)
  // the power-law configuration model against its own generating functions
  const pw = netA({ source: 'power', N: 10000, gamma: 2.5 })
  const gotPw = measure(pw.net, TS_PA, 11)
  const thPw = TS_PA.map((T) => outbreakTheory(pw.fam, T).S)
  results.percPower = { got: gotPw, theory: thPw, on: pw }
  info(`percolation, power law γ = 2.5 from k = 2, N = 10,000: ⟨k⟩ = ${f3(pw.mean)}, ⟨k²⟩ = ${f3(pw.mean2)}, T_c = ${f4(pw.Tc)}; T = ${TS_PA.join(', ')}: measured ${gotPw.map(f3).join(', ')}; theory ${thPw.map(f3).join(', ')}`)
  check('percolation, power-law configuration model: within 0.03 of the generating functions of its degrees', gotPw.every((v, i) => near(v, thPw[i], 0.03)))
}

// ---------------------------------------------------------------- seeds

if (section('seeds')) {
  const th = outbreakTheory(poissonFamily(4), 0.5)
  const ks = [1, 2, 3, 4, 5, 6, 7, 8]
  const one = (on, seed) => {
    const random = mulberry32(seed)
    const ws = {}
    return ks.map((k) => seedsOfDegree(on, 0.5, k, 1000, random, ws))
  }
  const on = netA({ source: 'poisson', N: 10000 })
  const got = one(on, 21)
  const want = ks.map((k) => seedProbability(th.w, k))
  results.seedK = { got, want }
  info(`seeds, random network, T = 0.5, k = 1 … 8, 1,000 trials each: measured ${got.map(f3).join(', ')}; 1 − w^k ${want.map(f3).join(', ')}`)
  check('seeds: the probability of a large outbreak by seed degree is within 0.05 of 1 − w^k for k = 1 … 8', got.every((v, i) => near(v, want[i], 0.05)), `largest gap ${f3(Math.max(...got.map((v, i) => Math.abs(v - want[i]))))}`)
  let worst = 0
  for (const s of OTHER) worst = Math.max(worst, ...one(poissonAt(s), s + 3).map((v, i) => Math.abs(v - want[i])))
  info(`seeds, ten other random networks: largest gap ${f3(worst)}`)
  check('seeds, ten other random networks: the same limit holds', worst <= 0.05)
  // a seed never reaches more than its component, and T = 1 reaches all of it
  const comp = connectedComponents(on.g)
  let ok = true
  const ws = {}
  const random = mulberry32(3)
  for (let i = 0; i < 200; i++) {
    const v = Math.floor(random() * on.n)
    if (outbreakFrom(on.g, v, 1, random, ws) !== comp.sizes[comp.label[v]]) ok = false
    if (outbreakFrom(on.g, v, 0, random, ws) !== 1) ok = false
  }
  check('seeds: with T = 1 an outbreak is the whole component of its seed, with T = 0 the seed alone', ok)
}

// ---------------------------------------------------------------- timestep

if (section('timestep')) {
  const on = netA({ source: 'poisson', N: 10000 })
  let same = true
  for (let j = 0; j < 5; j++) {
    const a = spread(on.g, 17 * j, 0.2, Infinity, mulberry32(j))
    const b = spreadSI(on.g, 17 * j, 0.2, mulberry32(j))
    if (a.steps !== b.steps || a.when.some((v, i) => v !== b.when[i])) same = false
  }
  check('time steps: with no recovery the module\'s spread is module 02\'s spreadSI, node for node', same)
  const one = spread(on.g, 5, 0.3, 3, mulberry32(8))
  const cum = cumulative(one.when, one.steps)
  check('time steps: the cumulative curve starts at 1, never falls and ends at the number of nodes reached', cum[0] === 1 && cum.every((v, i) => i === 0 || v >= cum[i - 1]) && cum[one.steps] === one.when.filter((v) => v >= 0).length && timeTo(cum, 1) === 0)
  // time-stepped SIR against percolation with T = 1 − (1 − β)^d
  const compare = (o, beta, d, trials, seed) => {
    const T = transmissibility(beta, d)
    const random = mulberry32(seed)
    const ws = {}
    const stat = () => ({ large: 0, sum: 0 })
    const a = stat()
    const b = stat()
    for (let i = 0; i < trials; i++) {
      const v = Math.floor(random() * o.n)
      const run = spread(o.g, v, beta, d, random)
      let size = 0
      for (let q = 0; q < o.n; q++) if (run.when[q] >= 0) size++
      if (size > LARGE * o.n) {
        a.large++
        a.sum += size / o.n
      }
      const s2 = outbreakFrom(o.g, v, T, random, ws)
      if (s2 > LARGE * o.n) {
        b.large++
        b.sum += s2 / o.n
      }
    }
    return { T, steps: [a.large / trials, a.sum / a.large], perc: [b.large / trials, b.sum / b.large] }
  }
  check('time steps: T = 1 − (1 − β)^d, 0.5904 for β = 0.2 and d = 4', f4(transmissibility(0.2, 4)) === '0.5904' && transmissibility(0.5, 1) === 0.5)
  const c = compare(on, 0.2, 4, 2000, 31)
  const th = outbreakTheory(poissonFamily(4), c.T).S
  results.timestep = c
  info(`time steps, random network, β = 0.2, d = 4 (T = ${f4(c.T)}), 2,000 outbreaks each: share of large outbreaks ${f3(c.steps[0])} time-stepped, ${f3(c.perc[0])} by percolation; mean size of the large ones ${f3(c.steps[1])} and ${f3(c.perc[1])}; theory ${f3(th)} for both`)
  // sampling error of a share near 0.87 over 2,000 trials is 0.0075; of the difference of two, 0.011
  check('time steps: the time-stepped SIR and percolation give the same share of large outbreaks (within 0.035, three standard errors of the difference) and the same mean size (within 0.01)', near(c.steps[0], c.perc[0], 0.035) && near(c.steps[1], c.perc[1], 0.01))
  check('time steps: both agree with the generating functions (share within 0.03, size within 0.01)', [c.steps, c.perc].every((x) => near(x[0], th, 0.03) && near(x[1], th, 0.01)))
  let worstShare = 0
  let worstSize = 0
  for (const s of OTHER) {
    const x = compare(poissonAt(s), 0.2, 4, 1000, s + 5)
    worstShare = Math.max(worstShare, Math.abs(x.steps[0] - x.perc[0]))
    worstSize = Math.max(worstSize, Math.abs(x.steps[1] - x.perc[1]))
  }
  info(`time steps, ten other random networks (1,000 outbreaks each): largest difference in the share ${f3(worstShare)}, in the mean size ${f3(worstSize)}`)
  check('time steps, ten other random networks: share within 0.05 (three standard errors with 1,000 outbreaks), size within 0.01', worstShare <= 0.05 && worstSize <= 0.01)
}

// ---------------------------------------------------------------- immunise

const EXPECTED = {
  poisson: { random: [0.73, 0.66, 0.52, 0.36, 0.02], degree: [0.64, 0.46, 0.01, 0, 0], acquaintance: [0.72, 0.62, 0.43, 0.2, 0] },
  pa: { random: [0.71, 0.64, 0.51, 0.38, 0.17], degree: [0.05, 0, 0, 0, 0], acquaintance: [0.58, 0.39, 0.03, 0, 0] },
}

if (section('immunise')) {
  const on = netC({ source: 'poisson', N: 2000 })
  const orders = immuneOrders(on, mulberry32(4))
  const distinct = (o) => new Set(o).size === o.length
  check('immunise: the three orders hold distinct nodes; random and by degree hold all of them, by degree in decreasing order', STRATEGIES.every((s) => distinct(orders[s])) && orders.random.length === on.n && orders.degree.length === on.n && orders.degree.every((v, i) => i === 0 || on.k[v] <= on.k[orders.degree[i - 1]]))
  check('immunise: acquaintance never picks a node without links and reaches 90% of the nodes', orders.acquaintance.every((v) => on.k[v] > 0) && orders.acquaintance.length === Math.round(0.9 * on.n))
  // the first nodes immunised by acquaintance have the degree of a random friend, ⟨k²⟩/⟨k⟩
  const big = netC({ source: 'poisson', N: 10000 })
  const acq = acquaintanceOrder(big.g, mulberry32(6), 500)
  const kAcq = acq.reduce((s, v) => s + big.k[v], 0) / acq.length
  info(`immunise: mean degree of the first 500 nodes immunised by acquaintance on the random network ${f2(kAcq)}; ⟨k²⟩/⟨k⟩ = ${f2(big.mean2 / big.mean)}; ⟨k⟩ = ${f2(big.mean)}`)
  check('immunise: the first 500 immunised by acquaintance have mean degree within 0.3 of ⟨k²⟩/⟨k⟩', near(kAcq, big.mean2 / big.mean, 0.3))
  check('immunise: g_c for random immunisation of the random network at T = 0.5 is 0.5', near(immuneShare(big.Tc, 0.5), 0.5, 0.005) && immuneShare(thresholdT(4, 20), 0.5) === 0.5, f4(immuneShare(big.Tc, 0.5)))
  results.immune = {}
  const notes = []
  for (const source of ['poisson', 'pa']) {
    const o = netC({ source, N: 10000 })
    const [r, secs] = timed(() => drain(immuniseJob(o, 0.5)))
    results.immune[source] = { on: o, r }
    info(`immunise, ${source}, N = 10,000, T = 0.5, mean of ${C_RUNS} runs (${f2(secs)} s): g_c = ${f3(r.gc)}; below 1% of N from g = ${STRATEGIES.map((s) => `${s} ${stopsAt(r.rows, s)}`).join(', ')}`)
    for (const s of STRATEGIES) {
      const v = GS.map((g) => r.rows[Math.round(g * 100)].size[s])
      const kk = GS.map((g) => r.rows[Math.round(g * 100)].k[s])
      const exp = EXPECTED[source][s]
      info(`  ${s}: g = 5, 10, 20, 30, 50%: ${v.map(f3).join(', ')}; expected ${exp.map(f2).join(', ')}; mean degree of the immunised ${kk.map(f2).join(', ')}`)
      v.forEach((x, i) => {
        if (!near(x, exp[i], 0.05)) notes.push(`${source} ${s} g = ${GS[i]}: ${f3(x)} against ${f2(exp[i])}`)
      })
    }
  }
  check('immunise: every value of exercise 6 is within 0.05 of the one expected in the prompt', notes.length === 0, notes.join('; '))
  // ten other networks, three runs each, at the values of exercise 6
  const spread6 = {}
  for (const source of ['poisson', 'pa']) {
    for (const s of STRATEGIES) spread6[`${source} ${s}`] = GS.map(() => [Infinity, -Infinity])
    for (const seed of OTHER) {
      const o = makeNet(seed, { source, N: 10000 })
      const random = mulberry32(seed + 9)
      const ws = {}
      const sums = Object.fromEntries(STRATEGIES.map((s) => [s, GS.map(() => 0)]))
      for (let run = 0; run < 3; run++) {
        const ord = immuneOrders(o, random)
        for (const s of STRATEGIES) {
          GS.forEach((g, i) => {
            if (!ws.immune) ws.immune = new Uint8Array(o.n)
            ws.immune.fill(0)
            for (let q = 0; q < Math.round(g * o.n); q++) ws.immune[ord[s][q]] = 1
            sums[s][i] += bondPercolation(o.net, 0.5, random, ws.immune, ws) / o.n / 3
          })
        }
      }
      for (const s of STRATEGIES) sums[s].forEach((v, i) => {
        const range = spread6[`${source} ${s}`][i]
        range[0] = Math.min(range[0], v)
        range[1] = Math.max(range[1], v)
      })
    }
  }
  results.spread6 = spread6
  const wide = []
  for (const [key, ranges] of Object.entries(spread6)) {
    info(`immunise, ten other networks, ${key}: ${ranges.map((r) => `${f3(r[0])}–${f3(r[1])}`).join(', ')}`)
    const [source, s] = key.split(' ')
    ranges.forEach((r, i) => {
      if (Math.max(Math.abs(r[0] - EXPECTED[source][s][i]), Math.abs(r[1] - EXPECTED[source][s][i])) > 0.05) wide.push(`${key} g = ${GS[i]}: ${f3(r[0])}–${f3(r[1])} against ${f2(EXPECTED[source][s][i])}`)
    })
  }
  results.wide = wide
  info(`immunise, ten other networks: values further than 0.05 from the prompt's: ${wide.length ? wide.join('; ') : 'none'}`)
  check('immunise, ten other networks: away from a threshold (expected value above 0.3 or equal to 0) every value is within 0.05 of the prompt\'s', wide.every((w) => {
    const exp = Number(w.split('against ')[1])
    return exp > 0 && exp <= 0.3
  }), wide.join('; '))
}

// ---------------------------------------------------------------- lattice

if (section('lattice')) {
  const net = squareLattice(B_L)
  const g = buildCSR(net.n, net.A, net.B)
  check('lattice: 100 × 100 nodes, 2 L (L − 1) links, four corners of degree 2', net.n === B_N && net.A.length === 2 * B_L * (B_L - 1) && [0, B_L - 1, B_N - B_L, B_N - 1].every((v) => g.offsets[v + 1] - g.offsets[v] === 2))
  const slopeOf = (seed) => {
    const run = spreadSI(g, Math.floor(B_L / 2) * (B_L + 1), 0.2, mulberry32(seed))
    const edge = edgeTime(run.when, B_L)
    const cum = cumulative(run.when, edge)
    return { edge, slope: logLogSlope(Array.from(cum, (c, t) => [t, c]).filter(([t]) => t >= edge / 4)) }
  }
  const first = slopeOf(1)
  const others = OTHER.map(slopeOf)
  info(`lattice SI, β = 0.2, from the centre: the infection reaches the edge at step ${first.edge}; log-log slope of the cumulative curve from a quarter of that time ${f3(first.slope)}; ten other seeds ${f3(Math.min(...others.map((x) => x.slope)))} to ${f3(Math.max(...others.map((x) => x.slope)))}`)
  // The prompt asked for 2.0 ± 0.15. Single runs on 100 × 100 sit a little above 2 (the front takes some steps to
  // form, so the curve is (t − t0)², steeper than t² on log-log axes) and scatter by ±0.13: the limit for one run is
  // set at ±0.25 from these eleven seeds. The mean of the panel's 20 runs is held to ±0.15 in the section "panels",
  // and on a lattice three times as wide the bias shrinks.
  check('lattice SI: the log-log slope of one run is 2.0 ± 0.25, for the first seed and ten others', [first, ...others].every((x) => near(x.slope, 2, 0.25)))
  const wide = squareLattice(300)
  const gw = buildCSR(wide.n, wide.A, wide.B)
  const ws = OTHER.map((seed) => {
    const run = spreadSI(gw, 150 * 301, 0.2, mulberry32(seed))
    const edge = edgeTime(run.when, 300)
    return logLogSlope(Array.from(cumulative(run.when, edge), (c, t) => [t, c]).filter(([t]) => t >= edge / 4))
  })
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
  info(`lattice SI: mean slope of the ten other seeds ${f3(mean(others.map((x) => x.slope)))} on 100 × 100 and ${f3(mean(ws))} on 300 × 300 (${f3(Math.min(...ws))} to ${f3(Math.max(...ws))})`)
  check('lattice SI: on 300 × 300 every one of ten runs is within 0.15 of 2, and the mean is closer to 2 than on 100 × 100', ws.every((v) => near(v, 2, 0.15)) && Math.abs(mean(ws) - 2) < Math.abs(mean(others.map((x) => x.slope)) - 2))
  results.lattice = { first, others }
}

// ---------------------------------------------------------------- sis

if (section('sis')) {
  const on = netA({ source: 'poisson', N: 2000 })
  const low = sisPrevalence(on.g, 0.1 * SIS_MU, SIS_MU, mulberry32(1))
  const high = sisPrevalence(on.g, 0.5 * SIS_MU, SIS_MU, mulberry32(1))
  check('SIS: with β = 0 the infection is gone, with μ = 0 everyone stays infected', sisPrevalence(on.g, 0, 0.2, mulberry32(1)) === 0 && sisPrevalence(on.g, 0.1, 0, mulberry32(1)) === 1)
  check('SIS, random network: extinct at β/μ = 0.1, endemic at 0.5 (the theory puts the threshold at 0.2)', low === 0 && high > 0.3, `${f3(low)} ${f3(high)}`)
  check('SIS: the mean-field threshold is ⟨k⟩/⟨k²⟩', near(thresholdSIS(4, 20), 0.2, 1e-12))
}

// ---------------------------------------------------------------- figures

if (section('figures')) {
  const net = seedNet()
  const comp = connectedComponents(net.g)
  const ones = net.k.filter((d) => d === 1).length
  info(`F1: ${net.n} nodes, ${net.A.length} links, ${ones} nodes with one link; the hub is node ${net.hub} with ${net.k[net.hub]} links; degrees of the top five ${[...net.k].sort((a, b) => b - a).slice(0, 5).join(', ')}; default seed node ${net.leaf} (one link)`)
  check('F1: 80 nodes in one piece, with nodes of one link and a hub of at least 12', net.n === F1_N && comp.count === 1 && ones >= 5 && net.k[net.hub] >= 12 && net.k[net.leaf] === 1)
  const hub = seedOutbreaks(net, net.hub)
  const leaf = seedOutbreaks(net, net.leaf)
  results.f1 = { net, hub, leaf }
  info(`F1, T = ${F1_T}, ${F1_RUNS} outbreaks: from the hub ${f3(hub.big)} reach more than a quarter of the nodes (mean size ${f2(hub.mean)}); from node ${net.leaf} ${f3(leaf.big)} (mean size ${f2(leaf.mean)}); classes ${hub.bins.join(' ')} | ${leaf.bins.join(' ')}`)
  check('F1: every batch has 200 outbreaks, and the hub\'s share above a quarter is at least 0.3 more than the leaf\'s', hub.bins.reduce((a, b) => a + b) === F1_RUNS && leaf.bins.reduce((a, b) => a + b) === F1_RUNS && hub.big - leaf.big >= 0.3)
  check('F1: pressing again draws a new batch, and the same batch is reproducible', seedOutbreaks(net, net.leaf, 1).bins.join() !== leaf.bins.join() && seedOutbreaks(net, net.leaf, 0).bins.join() === leaf.bins.join())
  const shares = Array.from({ length: net.n }, (_, v) => seedOutbreaks(net, v).big)
  const byOne = shares.filter((_, v) => net.k[v] === 1)
  info(`F1: over all seeds the share runs from ${f3(Math.min(...shares))} to ${f3(Math.max(...shares))}; among the ${ones} nodes with one link from ${f3(Math.min(...byOne))} to ${f3(Math.max(...byOne))}`)
  results.f1.byOne = byOne
  results.f1.shares = shares
  // F2
  const mix = mixingCurve()
  check('F2, mixing: from one case to N, and exponential at first (rate r)', near(mix[0][1], 1, 1e-9) && near(mix[mix.length - 1][1], MIX.N, 1) && near(Math.log(mix[8][1] / mix[4][1]) / (mix[8][0] - mix[4][0]), MIX.r, 0.005))
  const lat = latticeCurve()
  results.f2 = { lat }
  info(`F2, lattice ${LAT.L} × ${LAT.L}, β = ${LAT.beta}: reaches the edge at step ${lat.edge} with ${lat.points[lat.points.length - 1][1]} infected; log-log slope ${f3(lat.slope)}`)
  check('F2, lattice: the log-log slope is 2.0 ± 0.15', near(lat.slope, 2, 0.15))
  const lc = ladderCurve(LADDER.a, LADDER.b)
  check('F2, ladder: the curve rises all the way and the default exponent is 3', lc.every((p, i) => i === 0 || p[1] > lc[i - 1][1]) && ladderExponent(LADDER.a, LADDER.b) === 3)
  check('F2, ladder: p exceeds ln a / ln b over the whole range of the sliders', ladderExponent(10, 1.5) < LADDER.p)
}

// ---------------------------------------------------------------- panels

if (section('panels')) {
  // Panel A
  const A = {}
  for (const [id, params] of [['def', A_DEFAULT], ['pa', { ...A_DEFAULT, source: 'pa' }], ['power', { ...A_DEFAULT, source: 'power' }], ['small', { ...A_DEFAULT, source: 'pa', N: 1000 }], ['big', { ...A_DEFAULT, source: 'pa', N: 20000 }], ['powerBig', { ...A_DEFAULT, source: 'power', N: 20000 }], ['powerSmall', { ...A_DEFAULT, source: 'power', N: 1000 }]]) {
    const on = netA(params)
    const [sw, secs] = timed(() => drain(sweepJob(on)))
    A[id] = { on, sw, theory: theoryCurve(on) }
    info(`Panel A, ${id} (${on.source}, N = ${on.n}): ${on.links} links, ⟨k⟩ = ${f3(on.mean)}, ⟨k²⟩ = ${f2(on.mean2)}, T_c = ${f4(on.Tc)}, ⟨k⟩/⟨k²⟩ = ${f4(on.sis)}; sweep ${f2(secs)} s; share at T = 0.05, 0.1, 0.2, 0.3, 0.5: ${[5, 10, 20, 30, 50].map((i) => f3(sw.rows[i].share)).join(', ')}${on.fam ? `; theory ${[5, 10, 20, 30, 50].map((i) => f3(A[id].theory[i][1])).join(', ')}` : ''}`)
  }
  for (const id of ['def', 'pa', 'power']) {
    const x = A[id]
    const [sd, secs] = timed(() => drain(seedsJob(x.on, 0.5)))
    x.seeds = sd
    const th = x.on.fam ? outbreakTheory(x.on.fam, 0.5) : null
    x.th = th
    info(`Panel A, ${id}, ${A_TRIALS} seeds at T = 0.5 (${f2(secs)} s): large ${f3(sd.large)}, mean size of the large ones ${f3(sd.meanLarge)}, of the others ${f2(sd.meanSmall)} nodes (largest ${sd.maxSmall}); first class ${f3(sd.bins[0])}; by degree ${sd.byK.filter((r) => r.seeds >= 10 && r.k <= 20).map((r) => `${r.k}: ${f2(r.large / r.seeds)} (${r.seeds})`).join(', ')}${th ? `; w = ${f4(th.w)}, S = ${f3(th.S)}` : ''}`)
  }
  check('Panel A: the sweep has 101 values of T and rises from 1/N to the largest component of the network', A.def.sw.rows.length === 101 && near(A.def.sw.rows[0].share, 1 / A.def.on.n, 1e-12) && near(A.def.sw.rows[100].share, connectedComponents(A.def.on.g).largest / A.def.on.n, 1e-12))
  check('Panel A, random network: the sweep is within 0.03 of the theory curve from T = 0.3 up', A.def.sw.rows.every((r, i) => r.T < 0.3 || near(r.share, A.def.theory[i][1], 0.03)))
  check('Panel A: 1,000 seeds give the share of large outbreaks and their size within 0.04 of 1 − G0(w), on the random network and on the power-law one', ['def', 'power'].every((id) => near(A[id].seeds.large, A[id].th.S, 0.04) && near(A[id].seeds.meanLarge, A[id].th.S, 0.04)))
  // One network per size does not show the trend (⟨k²⟩ of a single heavy-tailed network swings widely): 20 per size do.
  const tcN = {}
  for (const source of ['poisson', 'pa', 'power']) {
    tcN[source] = [1000, 10000, 100000].map((N) => {
      const v = Array.from({ length: 20 }, (_, j) => makeNet(770000 + j, { source, N }).Tc)
      return { N, mean: v.reduce((a, b) => a + b, 0) / v.length, min: Math.min(...v), max: Math.max(...v) }
    })
    info(`T_c from the formula, mean of 20 networks (smallest to largest), ${source}: ${tcN[source].map((x) => `N = ${x.N}: ${f3(x.mean)} (${f3(x.min)} to ${f3(x.max)})`).join('; ')}`)
  }
  results.tcN = tcN
  check('T_c against N, mean of 20 networks: it falls as the heavy-tailed networks grow, and stays at 0.25 for the random one', ['pa', 'power'].every((s) => tcN[s][0].mean > tcN[s][1].mean && tcN[s][1].mean > tcN[s][2].mean) && tcN.poisson.every((x) => near(x.mean, 0.25, 0.005)))
  info(`T_c against N, the panel's own single networks at N = 1,000, 10,000, 20,000 (reported, not checked): preferential attachment ${f4(A.small.on.Tc)}, ${f4(A.pa.on.Tc)}, ${f4(A.big.on.Tc)}; power law ${f4(A.powerSmall.on.Tc)}, ${f4(A.power.on.Tc)}, ${f4(A.powerBig.on.Tc)}`)
  for (const id of ['def', 'pa', 'power', 'small']) {
    const [sis, secs] = timed(() => drain(sisJob(A[id].on)))
    A[id].sis = sis
    info(`Panel A, ${id}, SIS (${f2(secs)} s): ⟨k⟩/⟨k²⟩ = ${f3(A[id].on.sis)}; prevalence above 1% from β/μ = ${sis.from}; at 0.1, 0.2, 0.3, 0.4, 0.5: ${[5, 10, 15, 20, 25].map((i) => f3(sis.rows[i].prevalence)).join(', ')}`)
  }
  check('Panel A, SIS: the infection persists from a lower β/μ on the heavy-tailed networks than on the random one, and never below ⟨k⟩/⟨k²⟩', A.pa.sis.from < A.def.sis.from && A.power.sis.from < A.def.sis.from && ['def', 'pa', 'power'].every((id) => A[id].sis.from >= A[id].on.sis))
  results.A = A
  // Panel B
  const nets = netsB()
  const B = { nets }
  for (const [id, params] of [['si', B_DEFAULT], ['sir', { ...B_DEFAULT, model: 'sir' }]]) {
    const [r, secs] = timed(() => drain(spreadJob(nets, params)))
    B[id] = r
    for (const net of ['poisson', 'pa', 'lattice']) {
      const s = r.nets[net]
      info(`Panel B, ${id}, ${net} (${f2(secs)} s for the three): T = ${f4(r.T)}; ${s.large} of ${s.runs} runs large; times to 1%, 10%, 50%: ${s.times.map((x) => x.toFixed(1)).join(', ')}; final ${f3(s.final)}; mean degree of the newly infected at steps 1, 2, 3, 5, 10, 15, 20: ${[1, 2, 3, 5, 10, 15, 20].map((t) => (s.newK.find((p) => p[0] === t) || [0, NaN])[1].toFixed(1)).join(', ')}${s.slope ? `; log-log slope ${f3(s.slope)} up to step ${s.edge.toFixed(1)}` : ''}`)
    }
  }
  info(`Panel B: ⟨k²⟩/⟨k⟩ = ${f2(nets.poisson.mean2 / nets.poisson.mean)} (random), ${f2(nets.pa.mean2 / nets.pa.mean)} (preferential attachment), ${f2(nets.lattice.mean2 / nets.lattice.mean)} (lattice); largest component of the random network ${f3(nets.poisson.giant)}`)
  const si = B.si.nets
  check('Panel B, SI: every run is large; preferential attachment reaches 1%, 10% and 50% first, the lattice last', ['poisson', 'pa', 'lattice'].every((id) => si[id].large === B_RUNS) && [0, 1, 2].every((i) => si.pa.times[i] < si.poisson.times[i] && si.poisson.times[i] < si.lattice.times[i]))
  check('Panel B, SI: hubs first — on preferential attachment the first nodes infected have more than twice the mean degree, and the degree falls below the mean by the end; on the lattice it is 4 or less throughout', si.pa.newK[0][1] > 2 * MEAN_K && si.pa.newK[si.pa.newK.length - 1][1] < MEAN_K && si.lattice.newK.every((p) => p[1] <= 4))
  check('Panel B, SI: on the random network the early cases have the degree of a random friend, ⟨k²⟩/⟨k⟩ (within 0.5 over steps 1 to 8)', si.poisson.newK.filter((p) => p[0] <= 8).every((p) => near(p[1], nets.poisson.mean2 / nets.poisson.mean, 0.5)))
  check('Panel B, SI: the lattice curve has log-log slope 2.0 ± 0.15', near(si.lattice.slope, 2, 0.15), f3(si.lattice.slope))
  {
    const [r, secs] = timed(() => drain(spreadJob(nets, { model: 'sir', beta: 0.1, d: 4 })))
    B.low = r
    info(`Panel B, SIR with β = 0.1, d = 4 (${f2(secs)} s): T = ${f4(r.T)}; large runs ${['poisson', 'pa', 'lattice'].map((id) => `${id} ${r.nets[id].large}`).join(', ')}`)
  }
  results.B = B
  // Panel C
  const C = {}
  for (const [id, params] of [['def', C_DEFAULT], ['pa', { ...C_DEFAULT, source: 'pa' }]]) {
    const on = netC(params)
    const [r, secs] = timed(() => drain(immuniseJob(on, params.T)))
    C[id] = { on, r }
    info(`Panel C, ${id} (${f2(secs)} s): T_c = ${f4(on.Tc)}, g_c = ${f3(r.gc)}; below 1% of N from g = ${STRATEGIES.map((s) => `${s} ${stopsAt(r.rows, s)}`).join(', ')}; at g = 0.2: ${STRATEGIES.map((s) => `${s} ${f3(r.rows[20].size[s])} (mean degree ${f2(r.rows[20].k[s])})`).join(', ')}; at g = 0: ${f3(r.rows[0].size.random)}`)
  }
  for (const [id, source] of [['def1', 'poisson'], ['pa1', 'pa']]) {
    const on = netC({ ...C_DEFAULT, source })
    const r = drain(immuniseJob(on, 1))
    C[id] = { on, r }
    info(`Panel C, ${source}, T = 1: g_c = ${f3(r.gc)}; below 1% of N from g = ${STRATEGIES.map((s) => `${s} ${stopsAt(r.rows, s)}`).join(', ')}`)
  }
  info(`Panel C, preferential attachment, g = 0.05: ${STRATEGIES.map((s) => `${s} ${f3(C.pa.r.rows[5].size[s])} (mean degree ${f2(C.pa.r.rows[5].k[s])})`).join(', ')}`)
  check('Panel C: 91 values of g; with nobody immune the three strategies agree within 0.02', C.def.r.rows.length === 91 && [C.def, C.pa].every((x) => STRATEGIES.every((s) => near(x.r.rows[0].size[s], x.r.rows[0].size.random, 0.02))))
  check('Panel C: by degree stops the outbreak with the fewest immunised, then acquaintance, then at random, on both networks', [C.def, C.pa].every((x) => stopsAt(x.r.rows, 'degree') < stopsAt(x.r.rows, 'acquaintance') && stopsAt(x.r.rows, 'acquaintance') < stopsAt(x.r.rows, 'random')))
  check('Panel C: random immunisation stops the outbreak within 0.1 of g_c on the random network', near(stopsAt(C.def.r.rows, 'random'), C.def.r.gc, 0.1))
  results.C = C
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (results.A && results.B && results.C && results.seedK && results.spread6 && results.f1 && results.f2 && results.tcN) {
    const lectureEn = readFileSync(new URL('src/content/network-lab/epidemics-on-networks.en.md', root), 'utf8')
    const lectureIt = readFileSync(new URL('src/content/network-lab/epidemics-on-networks.it.md', root), 'utf8')
    const mod = await import('../../src/components/lab/network/epidemics-on-networks/texts.js')
    const pageText = [JSON.stringify(mod.observe), JSON.stringify(mod.exercises)].join(' ')
    const enOf = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    const e3 = (v) => enOf(v, 3)
    const e2 = (v) => enOf(v, 2)
    const e1 = (v) => enOf(v, 1)
    const pct = (v) => `${Math.round(100 * v)}%`
    const and3 = (a) => `${a[0]}, ${a[1]} and ${a[2]}`
    const quoted = (name, phrases, where = pageText) => {
      const missing = phrases.filter((p) => !where.includes(p))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.join(' | '))
    }
    const { A, B, C, tcN } = results
    const d = A.def
    const sw = (x, i) => e3(x.sw.rows[i].share)
    const th = (x, i) => e3(x.theory[i][1])
    // ---- Panel A
    quoted('Panel A, default', [`⟨k²⟩ = ${e2(d.on.mean2)} and T_c = ${e3(d.on.Tc)}`, `${sw(d, 30)} at T = 0.3 (theory ${th(d, 30)}) and ${sw(d, 50)} at T = 0.5 (theory ${th(d, 50)})`, `${sw(d, 20)} at T = 0.2`])
    quoted('Panel A, preferential attachment', [`⟨k²⟩ = ${e2(A.pa.on.mean2)} and T_c = ${e3(A.pa.on.Tc)}`, `holds ${sw(A.pa, 20)} of the nodes`, `it holds ${sw(A.pa, 50)}`])
    check('Panel A: at T = 0.5 the largest component is a little smaller under preferential attachment than in the random network, and at T = 0.2 the random network has less than 1%', A.pa.sw.rows[50].share < d.sw.rows[50].share && d.sw.rows[50].share - A.pa.sw.rows[50].share < 0.05 && d.sw.rows[20].share < 0.01)
    quoted('Panel A, power law', [`⟨k²⟩ = ${e2(A.power.on.mean2)}, T_c = ${e3(A.power.on.Tc)}`, `${sw(A.power, 10)} at T = 0.1, as the theory says`, `T_c = ${e3(A.powerSmall.on.Tc)}, ${e3(A.power.on.Tc)} and ${e3(A.powerBig.on.Tc)}`])
    check('Panel A, power law: theory and measurement agree to three decimals at T = 0.1, and the three sizes are not in order', sw(A.power, 10) === th(A.power, 10) && !(A.powerSmall.on.Tc > A.power.on.Tc && A.power.on.Tc > A.powerBig.on.Tc))
    const sd = d.seeds
    const byK = (k) => sd.byK.find((r) => r.k === k) || { seeds: 0, large: 0 }
    const share = (k) => e2(byK(k).large / byK(k).seeds)
    quoted('Panel A, seeds', [
      `${e3(sd.large)} of the outbreaks are large (theory ${e3(d.th.S)}), with mean size ${e3(sd.meanLarge)}; the others reach ${e2(sd.meanSmall)} nodes on average and never more than ${sd.maxSmall}`,
      `${share(2)} with two links, ${share(4)} with four, 1.00 from seven up`,
      `shows ${share(1)}, from only ${byK(1).seeds} seeds, where the formula gives ${e2(seedProbability(d.th.w, 1))}`,
      `finds ${e3(results.seedK.got[0])}`,
    ])
    check('Panel A, seeds: every degree shown from seven up has probability 1.00', sd.byK.filter((r) => r.k >= 7 && r.seeds >= 10).every((r) => r.large === r.seeds) && sd.byK.filter((r) => r.k >= 7 && r.seeds >= 10).length >= 2)
    quoted('Panel A, SIS', [`from β/μ = ${e2(d.sis.from)} on the random network (the line is at ${e3(d.on.sis)}), from ${e2(A.pa.sis.from)} under preferential attachment (${e3(A.pa.on.sis)}) and from ${e2(A.power.sis.from)} on the power law (${e3(A.power.on.sis)})`])
    // ---- Panel B
    const si = B.si.nets
    const sir = B.sir.nets
    const low = B.low.nets
    const times = (s) => and3(s.times.map(e1))
    const kAt = (s, t) => e1((s.newK.find((p) => p[0] === t) || [0, NaN])[1])
    quoted('Panel B, default', [`${times(si.pa)} under preferential attachment; ${times(si.poisson)} in the random network; ${times(si.lattice)} on the lattice`, `with slope ${e2(si.lattice.slope)}`])
    quoted('Panel B, degrees', [
      `have ${kAt(si.pa, 1)} links on average and those at step 2 have ${kAt(si.pa, 2)}; then the degree falls, to ${kAt(si.pa, 5)} at step 5, ${kAt(si.pa, 10)} at step 10 and ${kAt(si.pa, 20)} at step 20`,
      `⟨k²⟩/⟨k⟩ = ${e2(B.nets.poisson.mean2 / B.nets.poisson.mean)}`,
      `is ${kAt(si.poisson, 20)} at step 20`,
    ])
    check('Panel B: on the random network the mean degree of the newly infected is within 0.5 of 5 over the first ten steps shown', si.poisson.newK.filter((p) => p[0] <= 10).every((p) => near(p[1], 5, 0.5)))
    const latK = si.lattice.newK.map((p) => p[1])
    info(`Panel B, lattice: mean degree of the newly infected from ${f2(Math.min(...latK))} to ${f2(Math.max(...latK))}`)
    check('Panel B: on the lattice it shows as 4.0 at every step before the infection reaches the edge', si.lattice.newK.filter((q) => q[0] < si.lattice.edge - 1).every((q) => e1(q[1]) === '4.0') && Math.min(...latK) < 3.95)
    quoted('Panel B, SIR', [`T = ${e3(B.sir.T)}, and ${sir.poisson.large}, ${sir.pa.large} and ${sir.lattice.large} of the 20 runs`, `after ${and3([sir.poisson, sir.pa, sir.lattice].map((s) => e1(s.times[2])))} steps`])
    check('Panel B, SIR: each time to 50% is longer than with SI, and the order is the same', ['poisson', 'pa', 'lattice'].every((id) => sir[id].times[2] > si[id].times[2]) && sir.pa.times[2] < sir.poisson.times[2] && sir.poisson.times[2] < sir.lattice.times[2])
    quoted('Panel B, lower β', [`T = ${e3(B.low.T)}`, `has ${low.poisson.large} large runs of 20, and preferential attachment only ${low.pa.large}`])
    const twos = B.nets.pa.seeds.filter((v) => B.nets.pa.k[v] === 2).length
    check('Panel B, lower β: nothing spreads on the lattice (T below 0.5), and most seeds of the preferential-attachment network have two links', low.lattice.large === 0 && B.low.T < 0.5 && twos > B_RUNS / 2, `${twos} of ${B_RUNS}`)
    // ---- Panel C
    const row = (x, g) => x.r.rows[Math.round(g * 100)]
    const stop = (x, s) => stopsAt(x.r.rows, s)
    const c = C.def
    const p = C.pa
    quoted('Panel C, default', [
      `reaches ${e3(row(c, 0).size.random)} of the nodes`,
      `it reaches ${e3(row(c, 0.2).size.random)} if they are chosen at random, ${e3(row(c, 0.2).size.acquaintance)} by acquaintance and ${e3(row(c, 0.2).size.degree)} by degree. The mean degree of the immunised is ${e2(row(c, 0.2).k.random)}, ${e2(row(c, 0.2).k.acquaintance)} and ${e2(row(c, 0.2).k.degree)}`,
      `g_c = ${e3(c.r.gc)} for immunisation at random, and the black curve falls below 1% of N at g = ${e2(stop(c, 'random'))}`,
      `over at ${e2(stop(c, 'acquaintance'))}, by degree at ${e2(stop(c, 'degree'))}`,
    ])
    quoted('Panel C, preferential attachment', [
      `g_c = ${e3(p.r.gc)}. At g = 0.20 the outbreak is ${e3(row(p, 0.2).size.random)} at random, ${e3(row(p, 0.2).size.acquaintance)} by acquaintance and ${e3(row(p, 0.2).size.degree)} by degree, and the immunised have ${e2(row(p, 0.2).k.random)}, ${e2(row(p, 0.2).k.acquaintance)} and ${e2(row(p, 0.2).k.degree)} links`,
      `below 1% of N at ${e2(stop(p, 'random'))}, ${e2(stop(p, 'acquaintance'))} and ${e2(stop(p, 'degree'))}`,
      `have ${e2(row(p, 0.05).k.degree)} links on average, by acquaintance ${e2(row(p, 0.05).k.acquaintance)}, at random ${e2(row(p, 0.05).k.random)}, and the outbreak is ${e3(row(p, 0.05).size.degree)}, ${e3(row(p, 0.05).size.acquaintance)} and ${e3(row(p, 0.05).size.random)}`,
    ])
    const ratio = row(p, 0.05).k.acquaintance / row(p, 0.05).k.random
    check('Panel C: by acquaintance the immunised are almost three times as connected as at random (2.5 to 3), and about three quarters of the nodes are out when the random curve falls below 1%', ratio > 2.5 && ratio < 3 && near(stop(p, 'random'), 0.75, 0.03) && stop(p, 'random') < p.r.gc, f2(ratio))
    quoted('Panel C, T = 1', [
      `g_c = ${e3(C.def1.r.gc)} (measured ${e2(stop(C.def1, 'random'))}), acquaintance ${e2(stop(C.def1, 'acquaintance'))} and degree ${e2(stop(C.def1, 'degree'))}`,
      `g_c = ${e3(C.pa1.r.gc)} and the three curves fall below 1% at ${e2(stop(C.pa1, 'random'))}, ${e2(stop(C.pa1, 'acquaintance'))} and ${e2(stop(C.pa1, 'degree'))}`,
    ])
    // ---- Exercises
    quoted('Exercise 1', ['T_c = 4/(20 − 4) = 0.25', 'R0 = 0.3 × 16/4 = 1.2', 'T_c = 4/(100 − 4) = 0.0417 and R0 = 0.3 × 96/4 = 7.2', '0.75 and 0.958'])
    const m11 = (await import('../../src/components/lab/network/robustness-and-cascades/texts.js')).exercises[0].solution.en
    check('Exercise 1: 0.75 and 0.958 are the critical fractions of module 11, exercise 1, and 7.2 is six times 1.2', m11.includes('0.75') && m11.includes('0.958') && near(criticalFraction(4, 100), 0.958, 0.0005))
    quoted('Exercise 2', ['0.314, 0.797 and 0.940', 'still misses 6%'])
    check('Exercise 2: about a third at R = 1.2, and 6% missed at R = 3', near(finalSizeMixing(1.2), 1 / 3, 0.03) && Math.round(100 * (1 - finalSizeMixing(3))) === 6)
    quoted('Exercise 3', [
      'u = 0.2032, and w = 1 − T + Tu = 0.6016',
      '1 − w = 0.398, 1 − w⁴ = 0.869 and 1 − w¹⁰ = 0.994',
      `${byK(4).large} of the ${byK(4).seeds} seeds with four links started a large outbreak (${share(4)}) and ${byK(1).large} of the ${byK(1).seeds} with one link (${share(1)}); only ${byK(10).seeds} seeds had ten links, too few to show, and all ${byK(10).large} did`,
      `finds ${e3(results.seedK.got[0])} and ${e3(results.seedK.got[3])} for one and four links`,
    ])
    check('Exercise 3: fewer than ten seeds had ten links, and all of them started a large outbreak', byK(10).seeds < 10 && byK(10).seeds > 0 && byK(10).large === byK(10).seeds)
    quoted('Exercise 4', ['1 − 1/R0 = 0.667', '1 − 0.25/0.5 = 0.5, and 1 − 0.0417/0.5 = 0.917', '(2 and 12 here)', 'eleven nodes in twelve'])
    check('Exercise 4: T/T_c is 2 and 12, and 0.917 is eleven twelfths', near(0.5 / thresholdT(4, 20), 2, 1e-9) && near(0.5 / thresholdT(4, 100), 12, 1e-9) && near(11 / 12, immuneShare(thresholdT(4, 100), 0.5), 1e-9))
    quoted('Exercise 5', [`slopes ${e2(ladderExponent(8, 2))} and ${e2(ladderExponent(4, 2))}, and the lattice gives a fitted slope of ${e2(results.f2.lat.slope)}`])
    const six = (x, s) => GS.map((g) => e3(row(x, g).size[s])).join(', ')
    const r6 = results.spread6['pa degree'][0]
    quoted('Exercise 6', [
      `Random network. At random: ${six(c, 'random')}. By degree: ${six(c, 'degree')}. Acquaintance: ${six(c, 'acquaintance')}.`,
      `Preferential attachment. At random: ${six(p, 'random')}. By degree: ${six(p, 'degree')}. Acquaintance: ${six(p, 'acquaintance')}.`,
      `(${e3(row(p, 0.5).size.random)} against ${e3(row(c, 0.5).size.random)} at 50%)`,
      `leaves in the random network, ${e3(row(c, 0.5).size.random)}`,
      `between ${e3(r6[0])} and ${e3(r6[1])} where this one gives ${e3(row(p, 0.05).size.degree)}`,
    ])
    check('Exercise 6: 20% by acquaintance under preferential attachment leaves what 50% at random leaves in the random network (to 0.01)', near(row(p, 0.2).size.acquaintance, row(c, 0.5).size.random, 0.01))
    check('Exercise 6: the panel\'s values are those of the section "immunise"', results.immune && GS.every((g) => STRATEGIES.every((s) => row(c, g).size[s] === results.immune.poisson.r.rows[Math.round(g * 100)].size[s] && row(p, g).size[s] === results.immune.pa.r.rows[Math.round(g * 100)].size[s])))
    // ---- lecture
    quoted('lecture, one number', ['which gives 80% for R0 = 2'], lectureEn)
    check('lecture: S is 80% to the nearest per cent for R0 = 2', Math.round(100 * finalSizeMixing(2)) === 80)
    quoted('lecture, on a network', [`has T_c = ${e3(d.on.Tc)}, and at T = 0.5 the largest component holds ${sw(d, 50)} of its 10,000 nodes, where the formula says ${th(d, 50)}`, `has T_c = ${e3(A.pa.on.Tc)}`], lectureEn)
    quoted('lecture, the threshold against N', [
      `T_c = ${and3(tcN.pa.map((x) => e3(x.mean)))} for preferential attachment with 1,000, 10,000 and 100,000 nodes, and ${and3(tcN.power.map((x) => e3(x.mean)))} for a power law with γ = 2.5`,
      `stays at ${e3(tcN.poisson[1].mean)}`,
    ], lectureEn)
    const w3 = outbreakTheory(poissonFamily(4), 0.5).w
    quoted('lecture, seeds', [`that is ${e2(seedProbability(w3, 1))} for a node with one link and ${e2(seedProbability(w3, 10))} for a node with ten`, 'about 0.16', '73% of the cases', '6% more than eight'], lectureEn)
    quoted('lecture, hubs first', [`have ${kAt(si.pa, 1)} links on average, against a mean degree of 4, and half the network is infected after ${e1(si.pa.times[2])} steps`, `takes ${e1(si.poisson.times[2])}`, 'about 5 links, not 4'], lectureEn)
    quoted('lecture, immunisation', [
      `${pct(stop(p, 'random'))} of the nodes are immunised at random, ${pct(stop(p, 'acquaintance'))} by acquaintance and ${pct(stop(p, 'degree'))} by degree`,
      `the three figures are ${pct(stop(c, 'random'))}, ${pct(stop(c, 'acquaintance'))} and ${pct(stop(c, 'degree'))}`,
    ], lectureEn)
    quoted('lecture, growth and box', ['fitted the early phase of 20 outbreaks', 'N ∝ t^3.046', '3.37 (2011–15), 3.00 (2016–19), 1.93 (2020–22) and 1.01 (2023–26)', 'supplement, section S2'], lectureEn)
    const cl13 = readFileSync(new URL('src/content/lab/bitcoin-complex-system.en.md', root), 'utf8')
    check('lecture, box: the exponent and the DOI are those of Complexity Lab module 13, and the box links to it and to the Publications page', cl13.includes('t^3.046') && cl13.includes('10.5281/zenodo.19387099') && lectureEn.includes('10.5281/zenodo.19387099') && lectureEn.includes('(/lab/bitcoin-complex-system)') && lectureEn.includes('(/research/publications#preprint)'))
    const m05 = readFileSync(new URL('src/content/network-lab/heavy-tails-done-right.en.md', root), 'utf8')
    const pecere = lectureEn.split(/\r?\n/).find((l) => l.startsWith('- Pecere'))
    check('lecture: the Pecere preprint is cited as in module 05', !!pecere && m05.includes(pecere))
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
    check('lectures: the box says nothing about the price', ![lectureEn, lectureIt].some((x) => /\bprice|prezzo|\$|USD/i.test(box(x))))
    // the reading lists hold two titles with "scale-free": the test looks at everything before them
    check('lectures and texts never call the course free', ![body(lectureEn), body(lectureIt), pageText].some((x) => /\bfree\b|gratuit|gratis/i.test(x)))
    check('lectures: the same seventeen references in both languages', [lectureEn, lectureIt].every((x) => x.split('<!-- simulation -->')[1].split(/\r?\n/).filter((l) => l.startsWith('- ')).length === 17))
    check('exercises: six — three on paper, two on paper and in the simulation, one in the simulation', mod.exercises.length === 6 && mod.exercises.filter((e) => e.type === 'paper').length === 3 && mod.exercises.filter((e) => e.type === 'both').length === 2 && mod.exercises.filter((e) => e.type === 'sim').length === 1)
  } else info('run the whole check to pin the texts')
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
