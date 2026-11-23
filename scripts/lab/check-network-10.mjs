// Self-checks for Network Lab module 10, "Weights, flows and navigation". They
// run the same code as the page (weights.js, flow.js, kleinberg.js,
// experiments.js, figures.js) and compare it with brute force, closed forms
// and the answers of the exercises.
//
//   node scripts/lab/check-network-10.mjs [section]
//
// Sections: exercises, paths, flow, disparity, strength, payments, kleinberg,
// big, panels, page. Exits with code 1 if any check fails. Lines starting with
// INFO report the numbers quoted in the lecture, the "what to observe" lists
// and the exercises; checks starting "quoted on the page" pin them. Run it
// whole: the section "page" uses the numbers of the others. "big" (the
// lattices of 160,000 and 640,000 nodes) takes the longest, about a minute.
import { readFileSync } from 'node:fs'
import {
  seedOf, csr, nodeReport, filterAlpha, strengths, disparities, backbone, weightedNetwork, strengthExponent, dijkstra, pathTo,
  floydWarshall, betweenness, spearman, ranks, drain,
} from '../../src/components/lab/network/weights-flows-navigation/weights.js'
import {
  directedNet, flowNet, addPair, maxFlow, flowPaths, minCutBrute, widestRoute, widestBrute, forwardProbability, routeProbability,
  evenParts, paymentNetwork, disjointRoutes, analysePair, pay, CAP_MEDIAN, CAP_SIGMA, PAY_M,
} from '../../src/components/lab/network/weights-flows-navigation/flow.js'
import { offsetTable, drawOffset, distanceLaw, buildLattice, greedyRoute, randomPairs, routeStats, torusDistance, wrapDist } from '../../src/components/lab/network/weights-flows-navigation/kleinberg.js'
import {
  panelA, backboneA, pathsJob, A_DEFAULT, payNet, pickPair, pairReadout, pairsJob, successAt, successCurves, halfPoint, B_DEFAULT, B_FRACTIONS,
  panelC, C_DEFAULT, meanSteps, sweepAlphaJob, sweepLJob, C_SIZES, C_SWEEP_PAIRS,
} from '../../src/components/lab/network/weights-flows-navigation/experiments.js'
import { F1_START, F2_PRESETS, solvePreset } from '../../src/components/lab/network/weights-flows-navigation/figures.js'
import { mulberry32 } from '../../src/components/lab/rng.js'

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
const near = (v, want, tol) => Math.abs(v - want) <= tol
const root = new URL('../../', import.meta.url)
export const results = {}

// a small random weighted network: n nodes, a ring so that it is connected, plus extra links
function smallNet(n, extra, seed) {
  const random = mulberry32(seed)
  const A = []
  const B = []
  const has = new Set()
  const add = (a, b) => {
    const key = a < b ? a * n + b : b * n + a
    if (a === b || has.has(key)) return
    has.add(key)
    A.push(a)
    B.push(b)
  }
  for (let i = 0; i < n; i++) add(i, (i + 1) % n)
  for (let j = 0; j < extra; j++) add(Math.floor(random() * n), Math.floor(random() * n))
  const cost = Float64Array.from(A, () => 1 + Math.floor(random() * 9))
  return { g: { n, A: Int32Array.from(A), B: Int32Array.from(B) }, cost }
}

// ---------------------------------------------------------------- exercises

if (section('exercises')) {
  // 1
  const r = nodeReport(F1_START)
  check('Exercise 1: weights 5, 1, 1, 1, 1, 1 give s = 10, k = 6, Y = 0.30, 1/k = 0.167', r.s === 10 && r.k === 6 && near(r.Y, 0.3, 1e-12) && f3(r.even) === '0.167', `${r.s} ${r.k} ${r.Y} ${r.even}`)
  check('Exercise 1: α of the link of weight 5 is (1 − 0.5)^5 = 0.03125 < 0.05', near(r.alpha[0], 0.03125, 1e-15) && r.alpha[0] < 0.05)
  check('Exercise 1: α of a link of weight 1 is 0.9^5 = 0.59049', near(r.alpha[1], 0.59049, 1e-12))
  // 2
  const g2 = { n: 4, A: Int32Array.from([0, 0, 2, 1, 2]), B: Int32Array.from([1, 2, 1, 3, 3]) }
  const cost2 = Float64Array.from([4, 1, 2, 1, 5])
  const c2 = csr(4, g2.A, g2.B)
  const d2 = dijkstra(c2, cost2, 0)
  check('Exercise 2: the cheapest route from A to D is A–C–B–D, cost 4', d2.dist[3] === 4 && pathTo(d2.prev, 3).join('') === '0213', `${d2.dist[3]} ${pathTo(d2.prev, 3)}`)
  const h2 = dijkstra(c2, new Float64Array(5).fill(1), 0)
  check('Exercise 2: the fewest links are 2 (A–B–D costs 5, A–C–D costs 6)', h2.dist[3] === 2 && cost2[0] + cost2[3] === 5 && cost2[1] + cost2[4] === 6)
  // 3
  const p3 = solvePreset(F2_PRESETS[0])
  check('Exercise 3: widest single route 2, maximum flow 5', p3.widest.width === 2 && p3.maxFlow === 5, `${p3.widest.width} ${p3.maxFlow} ${p3.widest.label}`)
  check('Exercise 3: a minimum cut is {s→a, s→b}, capacity 5', p3.cutCapacity === 5 && p3.cut.join(',') === '0,1', `${p3.cut} ${p3.cutCapacity}`)
  const paths3 = p3.paths.map((q) => `${q.label} ${q.amount}`).sort().join('; ')
  check('Exercise 3: the flow splits into s–a–t 2, s–b–t 2, s–a–b–t 1', paths3 === 's–a–b–t 1; s–a–t 2; s–b–t 2', paths3)
  results.f2 = F2_PRESETS.map(solvePreset)
  // 4
  const c = 1e6
  const one = routeProbability([c, c, c], 500000)
  const two = routeProbability([c, c, c], 250000)
  const four = routeProbability([c, c, c], 125000)
  results.ex4 = { one, two, both: two ** 2, four, all: four ** 4 }
  check('Exercise 4: one route of three channels for 500,000: 0.125', f3(one) === '0.125', String(one))
  check('Exercise 4: two parts of 250,000: 0.422 per route, 0.178 for both', f3(two) === '0.422' && f3(two ** 2) === '0.178', `${two} ${two ** 2}`)
  check('Exercise 4: four parts of 125,000: 0.670 per route, 0.201 for all four', f3(four) === '0.670' && f3(four ** 4) === '0.201', `${four} ${four ** 4}`)
}

// ---------------------------------------------------------------- paths

if (section('paths')) {
  let worst = 0
  let pathBad = 0
  for (let j = 0; j < 20; j++) {
    const { g, cost } = smallNet(12 + j, 10 + 2 * j, seedOf(101, j))
    const D = floydWarshall(g, cost)
    const c = csr(g.n, g.A, g.B)
    for (let s = 0; s < g.n; s++) {
      const d = dijkstra(c, cost, s)
      for (let t = 0; t < g.n; t++) {
        worst = Math.max(worst, Math.abs(d.dist[t] - D[s][t]))
        // the route found adds up to its cost
        const p = pathTo(d.prev, t)
        let sum = 0
        for (let i = 1; i < p.length; i++) {
          let best = Infinity
          for (let q = c.off[p[i - 1]]; q < c.off[p[i - 1] + 1]; q++) if (c.nbr[q] === p[i]) best = Math.min(best, cost[c.eid[q]])
          sum += best
        }
        if (sum !== d.dist[t]) pathBad++
      }
    }
  }
  check('Dijkstra agrees with Floyd–Warshall on 20 small random weighted networks (every pair)', worst === 0, String(worst))
  check('Dijkstra: every route returned adds up to its cost', pathBad === 0, String(pathBad))
  // betweenness with costs against a count over all cheapest routes
  let bad = 0
  for (let j = 0; j < 10; j++) {
    const { g, cost } = smallNet(9 + (j % 3), 6 + j, seedOf(202, j))
    const use = j < 5 ? cost : new Float64Array(cost.length).fill(1)
    const D = floydWarshall(g, use)
    const c = csr(g.n, g.A, g.B)
    // number of cheapest routes between every pair, by dynamic programming over increasing cost
    const count = Array.from({ length: g.n }, () => new Float64Array(g.n))
    for (let s = 0; s < g.n; s++) {
      const order = Array.from({ length: g.n }, (_, i) => i).sort((a, b) => D[s][a] - D[s][b])
      count[s][s] = 1
      for (const v of order) {
        if (v === s) continue
        for (let q = c.off[v]; q < c.off[v + 1]; q++) {
          const u = c.nbr[q]
          if (D[s][u] + use[c.eid[q]] === D[s][v]) count[s][v] += count[s][u]
        }
      }
    }
    const direct = new Float64Array(g.n)
    for (let s = 0; s < g.n; s++) for (let t = s + 1; t < g.n; t++) for (let v = 0; v < g.n; v++) if (v !== s && v !== t && D[s][v] + D[v][t] === D[s][t]) direct[v] += (count[s][v] * count[v][t]) / count[s][t]
    const bc = betweenness(g, use)
    for (let v = 0; v < g.n; v++) if (Math.abs(bc[v] - direct[v]) > 1e-9) bad++
  }
  check('betweenness with costs (and with every cost 1) agrees with a direct count over all cheapest routes, 10 networks', bad === 0, String(bad))
  check('Spearman: ranks with ties, ρ = 1 for a monotone map and −1 for its reverse', ranks([3, 1, 3, 2]).join(',') === '3.5,1,3.5,2' && near(spearman([1, 2, 3, 4], [2, 4, 8, 16]), 1, 1e-12) && near(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1, 1e-12))
}

// ---------------------------------------------------------------- flow

if (section('flow')) {
  let worst = 0
  let wideBad = 0
  let pathsBad = 0
  let conserveBad = 0
  for (let j = 0; j < 50; j++) {
    const random = mulberry32(seedOf(303, j))
    const n = 5 + (j % 6) // 5 … 10 nodes
    const arcs = []
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && random() < 0.35) arcs.push([u, v, 1 + Math.floor(random() * 9)])
    const net = directedNet(n, arcs)
    const mf = maxFlow(net, 0, n - 1)
    const brute = minCutBrute(net, 0, n - 1)
    worst = Math.max(worst, Math.abs(mf.value - brute), Math.abs(mf.cutCapacity - brute))
    // conservation at inner nodes and capacity limits
    const net2 = new Float64Array(n)
    for (let a = 0; a < net.to.length; a++) {
      if (mf.flow[a] > net.cap[a]) conserveBad++
      net2[net.from[a]] -= mf.flow[a]
      net2[net.to[a]] += mf.flow[a]
    }
    for (let v = 1; v < n - 1; v++) if (net2[v] !== 0) conserveBad++
    if (net2[n - 1] !== mf.value) conserveBad++
    const paths = flowPaths(net, mf.flow, 0, n - 1)
    if (paths.reduce((x, p) => x + p.amount, 0) !== mf.value) pathsBad++
    const w = widestRoute(net, net.cap, 0, n - 1)
    const wb = widestBrute(net, net.cap, 0, n - 1)
    if ((w ? w.width : 0) !== wb) wideBad++
    if (w && Math.min(...w.arcs.map((a) => net.cap[a])) !== w.width) wideBad++
  }
  check('maximum flow = minimum cut (brute force over the sets holding the source) on 50 random small networks', worst === 0, String(worst))
  check('the flow respects every capacity and is conserved at every inner node', conserveBad === 0, String(conserveBad))
  check('the routes of the decomposition add up to the maximum flow', pathsBad === 0, String(pathsBad))
  check('widest route agrees with brute force over every simple route on the same 50 networks', wideBad === 0, String(wideBad))
  // channels: pairs of arcs with two balances
  let chBad = 0
  for (let j = 0; j < 20; j++) {
    const random = mulberry32(seedOf(304, j))
    const n = 6 + (j % 4)
    const net = flowNet(n)
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (random() < 0.5) addPair(net, u, v, Math.floor(random() * 8), Math.floor(random() * 8))
    const mf = maxFlow(net, 0, n - 1)
    if (mf.value !== minCutBrute(net, 0, n - 1)) chBad++
    const w = widestRoute(net, net.cap, 0, n - 1)
    if ((w ? w.width : 0) !== widestBrute(net, net.cap, 0, n - 1)) chBad++
  }
  check('the same on 20 small networks of channels (two balances per pair of arcs)', chBad === 0, String(chBad))
  const six = solvePreset(F2_PRESETS[1])
  info(`figure F2, second network: widest route ${six.widest.label} carries ${six.widest.width}; maximum flow ${six.maxFlow} by ${six.paths.map((p) => `${p.label} ${p.amount}`).join(', ')}; minimum cut arcs ${six.cut.map((i) => F2_PRESETS[1].arcs[i].slice(0, 2).map((v) => F2_PRESETS[1].names[v]).join('→')).join(', ')} = ${six.cutCapacity}`)
  check('figure F2, second network: widest route 3, maximum flow 8, minimum cut the four middle arcs', six.widest.width === 3 && six.maxFlow === 8 && six.cut.join(',') === '2,3,4,5' && six.cutCapacity === 8)
}

// ---------------------------------------------------------------- disparity

if (section('disparity')) {
  let worst = 0
  for (let k = 1; k <= 30; k++) worst = Math.max(worst, Math.abs(nodeReport(new Array(k).fill(2.5)).Y - 1 / k))
  check('disparity: Y = 1/k for equal weights, k = 1 … 30', worst < 1e-12, worst.toExponential(1))
  check('disparity: one dominant link gives Y near 1', nodeReport([1000, 1, 1, 1]).Y > 0.99)
  // the p-value against its definition: cut [0, 1] at k − 1 uniform points; how often is a given piece ≥ p?
  const random = mulberry32(seedOf(404, 1))
  let gap = 0
  const cases = [[4, 0.5], [6, 0.5], [6, 0.2], [10, 0.3], [3, 0.7]]
  for (const [k, p] of cases) {
    let hit = 0
    const T = 200000
    for (let i = 0; i < T; i++) {
      const cuts = Array.from({ length: k - 1 }, () => random()).sort((a, b) => a - b)
      if (cuts[0] >= p) hit++ // the first piece runs from 0 to the first cut
    }
    gap = Math.max(gap, Math.abs(hit / T - filterAlpha(p, k)))
  }
  check('disparity filter: (1 − p)^(k − 1) is the chance that a piece of a random split is at least p (5 cases, 200,000 splits each, within 0.005)', gap < 0.005, f3(gap))
  // closed form on a whole network, and the rule "significant for at least one end"
  const a = panelA({ ...A_DEFAULT, N: 500 })
  const bb = backbone(a.g, a.w, 0.05, a.sk)
  let bad = 0
  for (let e = 0; e < a.g.A.length; e++) {
    const pa = Math.pow(1 - a.w[e] / a.sk.s[a.g.A[e]], a.sk.k[a.g.A[e]] - 1)
    const pb = Math.pow(1 - a.w[e] / a.sk.s[a.g.B[e]], a.sk.k[a.g.B[e]] - 1)
    if ((pa < 0.05 || pb < 0.05) !== !!bb.keep[e]) bad++
  }
  check('disparity filter on a network: a link is kept exactly when its closed-form p-value is below α for one of its ends', bad === 0)
  const Y = disparities(a.g, a.w, a.sk.s)
  check('disparity of every node lies between 1/k and 1', Array.from(Y).every((y, i) => y >= 1 / a.sk.k[i] - 1e-12 && y <= 1 + 1e-12))
  check('α = 1 keeps nothing less than every link with k > 1 at an end… and α = 0 keeps none', backbone(a.g, a.w, 0, a.sk).links === 0 && backbone(a.g, a.w, 1.0000001, a.sk).links === a.g.A.length)
}

// ---------------------------------------------------------------- strength

if (section('strength')) {
  const flat = panelA({ N: 2000, theta: 0, sigma: 0, shuffle: false })
  check('strength: with θ = 0 and no noise every weight is 1 and s = k', Array.from(flat.sk.s).every((s, i) => s === flat.sk.k[i]))
  check('strength: with θ = 0 and no noise, β = 1 within 0.02', near(flat.beta, 1, 0.02), flat.beta.toFixed(4))
  const betas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => {
    const net = weightedNetwork({ N: 2000, theta: 0.5, sigma: 0, seed: seedOf(505, j) })
    const sk = strengths(net.g, net.w)
    return strengthExponent(sk.k, sk.s).slope
  })
  info(`strength: θ = 0.5, no noise, N = 2,000, ten seeds: β from ${f2(Math.min(...betas))} to ${f2(Math.max(...betas))}, mean ${f2(betas.reduce((a, b) => a + b, 0) / 10)}`)
  results.betaHalf = betas
  check('strength: with θ = 0.5, β lies between 1.2 and 1.5 for ten seeds (below 1 + θ: hubs link to small nodes)', betas.every((b) => b > 1.2 && b < 1.5), betas.map(f2).join(' '))
}

// ---------------------------------------------------------------- payments

if (section('payments')) {
  const random = mulberry32(seedOf(606, 1))
  let gap = 0
  const cases = [[10, 3], [10, 10], [10, 11], [1000, 1], [1000, 250], [1000, 999], [7, 4], [1, 1], [50000, 20000], [99, 50]]
  for (const [c, a] of cases) {
    let ok = 0
    const T = 100000
    for (let i = 0; i < T; i++) if (Math.floor(random() * (c + 1)) >= a) ok++
    gap = Math.max(gap, Math.abs(ok / T - forwardProbability(c, a)))
  }
  check('uncertainty model: (c + 1 − a)/(c + 1) against 100,000 uniform balances on single channels, 10 cases, within 0.01', gap < 0.01, gap.toFixed(4))
  check('even parts: 10 in 4 parts is 3, 3, 2, 2 and the parts add up', evenParts(10, 4).join(',') === '3,3,2,2' && evenParts(1000001, 3).reduce((a, b) => a + b, 0) === 1000001)
  const pn = payNet(B_DEFAULT.N)
  let balBad = 0
  for (let e = 0; e < pn.channels; e++) if (pn.net.cap[2 * e] + pn.net.cap[2 * e + 1] !== pn.capacity[2 * e] || pn.net.cap[2 * e] < 0 || pn.net.cap[2 * e + 1] < 0) balBad++
  check('payment network: the two balances of every channel add up to its capacity', balBad === 0)
  const caps = Array.from({ length: pn.channels }, (_, e) => pn.capacity[2 * e]).sort((a, b) => a - b)
  const share = Array.from({ length: pn.channels }, (_, e) => pn.net.cap[2 * e] / pn.capacity[2 * e]).reduce((a, b) => a + b, 0) / pn.channels
  info(`payment network, N = ${pn.n}: ${pn.channels} channels, median capacity ${Math.round(caps[caps.length >> 1])}, mean share on the first side ${f3(share)}`)
  check('payment network: median capacity within 10% of 1,000,000 and balances split evenly on average (0.5 ± 0.02)', near(caps[caps.length >> 1], CAP_MEDIAN, 0.1 * CAP_MEDIAN) && near(share, 0.5, 0.02) && CAP_SIGMA === 1 && PAY_M === 3)
  // routes share no channel; the three strategies are ordered
  const job = drain(pairsJob(pn, 200))
  let shared = 0
  let order = 0
  for (const pair of job.pairs) {
    const used = new Set()
    for (const r of pair.routes) for (const a of r.arcs) {
      if (used.has(a >> 1)) shared++
      used.add(a >> 1)
    }
    for (const f of B_FRACTIONS) {
      const p = pay(pair, Math.max(1, Math.round(f * pair.out)))
      if ((p.single || p.split) && !p.full) order++
      if (p.pSplit < p.pSingle) order++
    }
  }
  check('payments: the routes of a pair share no channel; whatever succeeds without knowledge also succeeds with it', shared === 0 && order === 0, `${shared} ${order}`)
  // the model's probability against fresh balances on the same routes
  const again = mulberry32(seedOf(606, 2))
  let predicted = 0
  let observed = 0
  let trials = 0
  for (const pair of job.pairs) {
    const a = 200000
    const caps1 = pair.routes[0].capacities
    predicted += routeProbability(caps1, a)
    for (let i = 0; i < 50; i++) {
      observed += caps1.every((c) => Math.floor(again() * (c + 1)) >= a) ? 1 : 0
      trials++
    }
  }
  check('uncertainty model on whole routes: mean predicted success against fresh uniform balances (200 routes × 50 draws, within 0.02)', near(predicted / job.pairs.length, observed / trials, 0.02), `${f3(predicted / job.pairs.length)} ${f3(observed / trials)}`)
}

// ---------------------------------------------------------------- kleinberg

const MINE = { 50: [12.9, 14.5], 100: [21.0, 23.0], 200: [33.9, 32.8] }

if (section('kleinberg')) {
  // offsets drawn with the right distribution: chi-square over the distances
  for (const [L, alpha] of [[30, 0], [30, 1.5], [30, 2], [31, 2], [30, 3.5]]) {
    const table = offsetTable(L, alpha)
    const law = distanceLaw(L, alpha)
    const random = mulberry32(seedOf(707, Math.round(alpha * 10) + L))
    const T = 400000
    const seen = new Float64Array(L + 1)
    let zero = 0
    for (let i = 0; i < T; i++) {
      const o = drawOffset(table, random)
      const r = wrapDist(o % L, L) + wrapDist(Math.floor(o / L), L)
      if (r === 0) zero++
      seen[r]++
    }
    let chi = 0
    let dof = -1
    let first = 0
    for (let r = 1; r <= L; r++)
      if (law[r] > 0) {
        chi += (seen[r] - T * law[r]) ** 2 / (T * law[r])
        dof++
        // the first distances, in units of the standard error of a count
        if (r <= 3) first = Math.max(first, Math.abs(seen[r] - T * law[r]) / Math.sqrt(T * law[r] * (1 - law[r])))
      }
    // 99.9% point of chi-square, Wilson–Hilferty
    const limit = dof * (1 - 2 / (9 * dof) + 3.09 * Math.sqrt(2 / (9 * dof))) ** 3
    check(`Kleinberg, L = ${L}, α = ${alpha}: 400,000 offsets follow r^(−α) (chi-square ${f1(chi)} on ${dof} degrees of freedom, limit ${f1(limit)}; distances 1, 2, 3 within 4 standard errors)`, zero === 0 && chi < limit && first < 4, `largest gap on r = 1, 2, 3: ${first.toFixed(2)} standard errors`)
  }
  // greedy routing always arrives, never takes more steps than the lattice distance, and every step is a contact
  let bad = 0
  for (const alpha of [0, 1, 2, 3]) {
    const lat = buildLattice(40, alpha, seedOf(708, alpha))
    for (const [s, t] of randomPairs(40, 500, seedOf(709, alpha))) {
      const path = []
      const steps = greedyRoute(lat, s, t, path)
      if (path[path.length - 1] !== t || steps !== path.length - 1 || steps > torusDistance(40, s, t)) bad++
      for (let i = 1; i < path.length; i++) {
        const local = torusDistance(40, path[i - 1], path[i]) === 1
        if (!local && lat.long[path[i - 1]] !== path[i]) bad++
        if (torusDistance(40, path[i], t) >= torusDistance(40, path[i - 1], t)) bad++
      }
    }
  }
  check('greedy routing: 2,000 routes all arrive, each step is a lattice neighbour or the long-range contact and gets closer to the target', bad === 0, String(bad))
  results.steps = {}
  for (const L of [50, 100, 200]) {
    const got = [0, 1, 1.5, 2, 2.5, 3].map((alpha) => meanSteps(L, alpha))
    results.steps[L] = got
    info(`Kleinberg, L = ${L}, ${C_SWEEP_PAIRS} pairs: mean steps ${got.map(f1).join(', ')} at α = 0, 1, 1.5, 2, 2.5, 3`)
    const [m0, m2] = MINE[L]
    check(`Kleinberg, L = ${L}: mean steps at α = 0 and 2 within 15% of the expected ${m0} and ${m2}`, near(got[0], m0, 0.15 * m0) && near(got[3], m2, 0.15 * m2), `${f1(got[0])} ${f1(got[3])}`)
  }
}

// ---------------------------------------------------------------- big

if (section('big')) {
  results.big = {}
  for (const [L, mine] of [[400, [55.1, 37.7, 45.0]], [800, [87.2, 53.1, 61.6]]]) {
    const t0 = Date.now()
    const got = [0, 1.5, 2].map((alpha) => meanSteps(L, alpha))
    results.big[L] = got
    info(`Kleinberg, L = ${L} (${(L * L).toLocaleString('en-US')} nodes), ${C_SWEEP_PAIRS} pairs: mean steps ${got.map(f1).join(', ')} at α = 0, 1.5, 2 (expected ${mine.join(', ')}); ${((Date.now() - t0) / 1000).toFixed(1)} s`)
    check(`Kleinberg, L = ${L}: within 15% of the expected values`, got.every((v, i) => near(v, mine[i], 0.15 * mine[i])), got.map(f1).join(' '))
  }
  if (results.steps) {
    const ratio = (L, s) => s[L === 400 || L === 800 ? 2 : 3] / s[0]
    const all = { ...results.steps, ...results.big }
    info(`ratio of α = 2 to α = 0: ${[50, 100, 200, 400, 800].map((L) => `${f2(ratio(L, all[L]))} at L = ${L}`).join(', ')}`)
  }
}

// ---------------------------------------------------------------- panels

if (section('panels')) {
  // Panel A
  const A = {}
  for (const [name, p] of Object.entries({
    def: A_DEFAULT,
    shuffled: { ...A_DEFAULT, shuffle: true },
    flat: { ...A_DEFAULT, theta: 0, sigma: 0 },
    noise: { ...A_DEFAULT, theta: 0 },
    one: { ...A_DEFAULT, theta: 1 },
  })) {
    const a = panelA(p)
    const t0 = Date.now()
    const paths = drain(pathsJob(a))
    const ms = Date.now() - t0
    const bb = [0.01, 0.05, 0.2].map((alpha) => backboneA(a, alpha))
    const at = (k) => a.yRows.reduce((b, r) => (Math.abs(r.k - k) < Math.abs(b.k - k) ? r : b))
    A[name] = { beta: a.beta, bb, paths, links: a.links, y3: at(3), y10: at(10), y30: at(30), ms }
    info(`Panel A ${name}: β ${f2(a.beta)}; mean Y at k = 3, ≈10, ≈30: ${f3(at(3).value)}, ${f3(at(10).value)} (k̄ ${f1(at(10).k)}), ${f3(at(30).value)} (k̄ ${f1(at(30).k)}); backbone at α = 0.01, 0.05, 0.2: links ${bb.map((b) => f3(b.linkShare)).join(' ')}, weight ${bb.map((b) => f3(b.weightShare)).join(' ')}, nodes ${bb.map((b) => f3(b.nodeShare)).join(' ')}, largest ${bb.map((b) => f3(b.largestShare)).join(' ')}; routes differ ${f3(paths.differ)}, hops ${f2(paths.hopsShort)} → ${f2(paths.hopsCheap)}, Spearman ${f3(paths.rho)}; ${ms} ms`)
  }
  results.A = A
  check('Panel A: with every weight 1 the cheapest route is a shortest one and the two betweenness rankings coincide', A.flat.paths.differ === 0 && near(A.flat.paths.rho, 1, 1e-9), `${A.flat.paths.differ} ${A.flat.paths.rho}`)
  check('Panel A: with every weight 1, Y = 1/k and the filter keeps nothing at α = 0.05', A.flat.bb[1].links === 0 && near(A.flat.y3.value, 1 / 3, 1e-12))
  const big = panelA({ ...A_DEFAULT, N: 5000 })
  const t0 = Date.now()
  drain(pathsJob(big))
  info(`Panel A at N = 5,000: routes and betweenness from 200 sources take ${Date.now() - t0} ms in Node`)

  // Panel B
  const pn = payNet(B_DEFAULT.N)
  const B = { readouts: {} }
  for (const pick of ['random', 'hubs', 'small']) {
    const [s, t] = pickPair(pn, pick, B_DEFAULT.pair)
    const r = pairReadout(pn, s, t)
    B.readouts[pick] = r
    info(`Panel B, ${pick}: nodes ${s} → ${t} (degrees ${r.degS}, ${r.degT}); outgoing ${r.out}, incoming ${r.incoming}; widest route ${r.widest} in ${r.widestHops} hops; maximum flow ${r.maxFlow}; cut of ${r.cutSize} channels (at sender ${r.cutAtSender}, at receiver ${r.cutAtReceiver})`)
    check(`Panel B, ${pick}: widest route ≤ maximum flow ≤ the sender's outgoing and the receiver's incoming balance`, r.widest <= r.maxFlow && r.maxFlow <= r.out && r.maxFlow <= r.incoming)
  }
  const t1 = Date.now()
  const job = drain(pairsJob(pn))
  B.ms = Date.now() - t1
  B.rows = successCurves(job.pairs)
  B.half = { single: halfPoint(B.rows, 'single'), split: halfPoint(B.rows, 'split'), full: halfPoint(B.rows, 'full') }
  B.at = successAt(job.pairs, B_DEFAULT.fraction)
  B.atSender = job.pairs.filter((p) => p.maxFlow === p.out).length / job.pairs.length
  info(`Panel B: 500 pairs analysed in ${B.ms} ms`)
  for (const r of B.rows) info(`Panel B, a = ${f2(r.fraction)} of outgoing: single ${f3(r.single)} (model ${f3(r.pSingle)}), split ${f3(r.split)} (model ${f3(r.pSplit)}, parts ${f2(r.parts)}), full ${f3(r.full)}`)
  info(`Panel B: below one half at ${f3(B.half.single)} (single), ${f3(B.half.split)} (split), ${f3(B.half.full)} (full knowledge); maximum flow equals the outgoing balance for ${f3(B.atSender)} of the pairs`)
  results.B = B
  for (const N of [200, 2000]) {
    const p2 = payNet(N)
    const t2 = Date.now()
    const j2 = drain(pairsJob(p2))
    const rows = successCurves(j2.pairs)
    info(`Panel B, N = ${N}: 500 pairs in ${Date.now() - t2} ms; half points ${f3(halfPoint(rows, 'single'))} / ${f3(halfPoint(rows, 'split'))} / ${f3(halfPoint(rows, 'full'))}`)
  }

  // Panel C
  const C = { def: panelC(C_DEFAULT), small: panelC({ L: 40, alpha: 2 }) }
  info(`Panel C default (L = ${C_DEFAULT.L}, α = ${C_DEFAULT.alpha}, 200 pairs): mean ${f1(C.def.mean)}, median ${C.def.median}, mean lattice distance ${f1(C.def.lattice)}`)
  info(`Panel C, L = 40, α = 2: mean ${f1(C.small.mean)}, median ${C.small.median}; drawn route ${C.small.route.length - 1} steps for a lattice distance of ${torusDistance(40, C.small.pair[0], C.small.pair[1])}`)
  C.sweeps = {}
  for (const L of [50, 100, 200, 400]) {
    const t2 = Date.now()
    const sw = drain(sweepAlphaJob(L))
    C.sweeps[L] = sw
    info(`Panel C, Sweep α at L = ${L}: ${sw.rows.map((r) => f1(r.mean)).join(' ')}; minimum at α = ${sw.best}; ${Date.now() - t2} ms`)
  }
  const t3 = Date.now()
  C.sweepL = drain(sweepLJob())
  info(`Panel C, Sweep L (${C_SIZES.join(', ')}): ${C.sweepL.curves.map((c) => `α = ${c.alpha}: ${c.points.map((p) => f1(p[1])).join(' ')}, slope ${f2(c.slope)}`).join('; ')}; ${Date.now() - t3} ms`)
  results.C = C
  check('Panel C: the sweeps give the same numbers as the self-check of the lattice', !results.steps || [50, 100, 200].every((L) => C.sweeps[L].rows.find((r) => r.alpha === 2).mean === results.steps[L][3]))
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (results.A && results.B && results.C && results.steps && results.big) {
    const lectureEn = readFileSync(new URL('src/content/network-lab/weights-flows-navigation.en.md', root), 'utf8')
    const lectureIt = readFileSync(new URL('src/content/network-lab/weights-flows-navigation.it.md', root), 'utf8')
    const mod = await import('../../src/components/lab/network/weights-flows-navigation/texts.js')
    const pageText = [JSON.stringify(mod.observe), JSON.stringify(mod.exercises)].join(' ')
    const enOf = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    const pc = (v) => `${enOf(100 * v, 1)}%`
    const n0 = (v) => v.toLocaleString('en-US')
    const quoted = (name, phrases, where = pageText) => {
      const missing = phrases.filter((p) => !where.includes(p))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.join(' | '))
    }
    const { A, B, C } = results
    const d = A.def
    quoted('Panel A, strength and disparity', [`β = ${enOf(d.beta, 2)}, as in the airport network`, `${enOf(d.y3.value, 3)} against 0.333 at k = 3, and ${enOf(d.y10.value, 3)} against 0.100 at k = 10`, `β falls to ${enOf(A.shuffled.beta, 2)}`])
    check('Panel A: the class of degree 10 holds only nodes of degree 10', d.y10.k === 10 && d.y3.k === 3)
    quoted('Panel A, backbone', [
      `keeps ${pc(d.bb[1].linkShare)} of the links, which carry ${pc(d.bb[1].weightShare)} of the weight and reach ${pc(d.bb[1].nodeShare)} of the nodes`,
      `${pc(d.bb[2].linkShare)} of the links, ${pc(d.bb[2].weightShare)} of the weight, ${pc(d.bb[2].nodeShare)} of the nodes, and a largest component of ${pc(d.bb[2].largestShare)}`,
      `${pc(A.one.bb[1].linkShare)} of the links hold ${pc(A.one.bb[1].weightShare)} of it`,
      `its largest component holds ${pc(A.shuffled.bb[1].largestShare)} of the nodes`,
    ])
    quoted('Panel A, routes', [`for ${pc(d.paths.differ)} of the pairs (${enOf(d.paths.hopsCheap, 2)} links on average against ${enOf(d.paths.hopsShort, 2)})`, `ρ = ${enOf(d.paths.rho, 3)}`])
    const R = B.readouts
    quoted('Panel B, pairs', [
      `the sender has ${n0(R.random.out)} on its side`,
      `carries ${n0(R.random.widest)} and crosses ${R.random.widestHops} channels; the maximum flow is ${n0(R.random.maxFlow)}`,
      `the sender's own ${R.random.cutSize} channels`,
      `the maximum flow is ${n0(R.small.maxFlow)} and the cut is at the receiver`,
      `${n0(R.hubs.maxFlow)} can flow, against ${n0(R.hubs.widest)} on the best single route, and the minimum cut has ${R.hubs.cutSize} channels`,
    ])
    check('Panel B, pairs: the cut is at the sender (random pair), at the receiver (small nodes), not all at one end (hubs)', R.random.cutAtSender && R.random.maxFlow === R.random.out && R.small.cutAtReceiver && R.small.maxFlow === R.small.incoming && !R.hubs.cutAtSender && !R.hubs.cutAtReceiver)
    const row = (f) => B.rows.find((r) => r.fraction === f)
    const four = [0.01, 0.05, 0.1, 0.2].map(row)
    quoted('Panel B, payments', [
      `succeeds ${pc(four[0].single)} of the time; at 5%, ${pc(four[1].single)}; at 10%, ${pc(four[2].single)}; at 20%, ${pc(four[3].single)}`,
      `It falls below one half at about ${Math.round(100 * B.half.single)}%`,
      `succeed ${four.slice(0, 3).map((r) => pc(r.full)).join(', ')} and ${pc(four[3].full)} of the time, and half still succeed at ${Math.round(100 * B.half.full)}% of the balance`,
      `${four.slice(0, 3).map((r) => pc(r.split)).join(', ')} and ${pc(four[3].split)} at the same four amounts`,
      `(${enOf(four[3].parts, 2)} on average at 20%)`,
      `gives a single route ${pc(four[3].pSingle)} on average and ${pc(four[3].single)} succeed`,
    ])
    check('Panel B: the model and the observed success of a single route agree within 0.05 up to half the outgoing balance', B.rows.filter((r) => r.fraction <= 0.5).every((r) => Math.abs(r.single - r.pSingle) < 0.05))
    check('Panel B: splitting blind never changes the success of a single route by more than 0.02', B.rows.every((r) => Math.abs(r.split - r.single) < 0.02), B.rows.map((r) => (r.split - r.single).toFixed(3)).join(' '))
    quoted('Panel C, default and route', [`${enOf(C.def.mean, 1)} steps on average (median ${C.def.median}) between nodes that are ${enOf(C.def.lattice, 1)} steps apart`, `${C.small.route.length - 1} steps for a distance of ${C.small.routeLattice}, of which ${C.small.jumps} along long-range links, all within the first 5 steps; the last 9 are on the grid`])
    const hop = C.small.route.map((v, i) => (i ? torusDistance(40, C.small.route[i - 1], v) : 0))
    check('Panel C, drawn route: the long jumps are within the first 5 steps and the last 9 steps are on the grid', hop.slice(6).every((x) => x === 1) && hop.slice(6).length === 9 && hop.slice(1, 6).filter((x) => x > 1).length === C.small.jumps, hop.join(' '))
    const s100 = C.sweeps[100]
    const at = (sw, a) => sw.rows.find((r) => r.alpha === a).mean
    quoted('Panel C, sweeps', [
      `${enOf(at(s100, 0), 1)} steps at α = 0, a minimum of ${enOf(at(s100, s100.best), 1)} at α = ${s100.best}, ${enOf(at(s100, 2), 1)} at α = 2, and ${enOf(at(s100, 4), 1)} at α = 4`,
      `the minimum moves to α = ${C.sweeps[400].best}`,
      `${C.sweepL.curves.slice(0, 3).map((c) => `${enOf(c.slope, 2)} for α = ${c.alpha}`).join(', ')} and ${enOf(C.sweepL.curves[3].slope, 2)} for α = 2.5`,
      `(${enOf(at(C.sweeps[50], 2), 1)} against ${enOf(at(C.sweeps[50], 0), 1)} steps at L = 50) and is well ahead at L = 400 (${enOf(at(C.sweeps[400], 2), 1)} against ${enOf(at(C.sweeps[400], 0), 1)})`,
    ])
    const S = results.steps
    const ratio = (L) => S[L][3] / S[L][0]
    const r800 = results.big[800][2] / results.big[800][0]
    quoted('Exercise 5', [
      ...[50, 100, 200].map((L) => `L = ${L}: ${S[L].map((v) => enOf(v, 1)).join(', ')}, lowest at α = ${C.sweeps[L].best}`),
      `is ${[50, 100, 200].map((L) => enOf(ratio(L), 2)).join(', ')}`,
      `the ratio is ${enOf(r800, 2)} and α = 1.5 is still ahead of 2`,
    ])
    check('Exercise 5: α = 2 overtakes α = 0 between L = 100 and L = 200, and at L = 800 α = 1.5 is ahead of 2', ratio(100) > 1 && ratio(200) < 1 && results.big[800][1] < results.big[800][2])
    quoted('Exercise 6', [
      `${pc(row(0.05).single)} at 5% of the sender's outgoing balance and ${pc(row(0.1).single)} at 10%, so it crosses one half at about ${Math.round(100 * B.half.single)}%`,
      `${pc(row(0.05).split)} and ${pc(row(0.1).split)}, the same crossing`,
      `${pc(row(0.4).full)} at 40%, ${pc(row(0.5).full)} at 50%, ${pc(row(0.7).full)} at 70% and ${pc(row(0.8).full)} at 80%, crossing one half at about ${Math.round(100 * B.half.full)}%`,
      `${pc(row(1).full)} of the payments would still be possible`,
    ])
    check('Exercise 6: one route and several cross one half at the same rounded amount', Math.round(100 * B.half.single) === Math.round(100 * B.half.split))
    quoted('Exercise 4, the limit', [`e^(−1.5) = ${enOf(Math.exp(-1.5), 3)}`])
    // lecture
    quoted('lecture, weights', [`give β = ${enOf(d.beta, 2)}`, `back to ${enOf(A.shuffled.beta, 2)}`, `in ${Math.round(100 * d.paths.differ)}% of the pairs`, `Spearman correlation of ${enOf(d.paths.rho, 2)}`], lectureEn)
    const maxGain = Math.max(...B.rows.map((r) => r.split - r.single))
    info(`Panel B: largest gain of blind splitting over one blind route ${maxGain.toFixed(4)} (at ${B.rows.find((r) => r.split - r.single === maxGain).fraction} of the balance)`)
    quoted('lecture, box: the largest gain of blind splitting', [`splitting blind adds at most ${enOf(100 * maxGain, 1)} percentage points of success`, 'splitting blindly gains little', 'first shipped an experimental plugin built on their method in version 23.08 (August 2023)'], lectureEn)
    quoted('lecture, box (IT): the largest gain of blind splitting', [`aggiunge al massimo ${enOf(100 * maxGain, 1).replace('.', ',')} punti percentuali di successo`, 'ha distribuito per la prima volta un plugin sperimentale'], lectureIt)
    quoted('lecture, box', [`at ${Math.round(100 * B.half.single)}% of the sender's balance`, `still succeed at ${Math.round(100 * B.half.full)}%`, 'a synthetic network, not Lightning data'], lectureEn)
    quoted(
      'lecture, navigation',
      [
        `is ${enOf(at(s100, 0), 1)} at α = 0 and ${enOf(at(s100, 2), 1)} at α = 2, and the lowest, ${enOf(at(s100, s100.best), 1)}, is at α = ${s100.best}`,
        `the minimum has moved to α = ${C.sweeps[400].best}`,
        `${results.big[800].slice(0, 2).map((v) => enOf(v, 1)).join(', ')} and ${enOf(results.big[800][2], 1)} steps at α = 0, 1.5 and 2`,
        `${enOf(ratio(50), 2)} at L = 50, ${enOf(ratio(200), 2)} at L = 200, ${enOf(r800, 2)} at L = 800`,
      ],
      lectureEn,
    )
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
    info(`Lightning box words: EN ${(box(lectureEn).match(/\S+/g) || []).length}, IT ${(box(lectureIt).match(/\S+/g) || []).length}`)
    check('lectures: one box, on Lightning, in each language', [lectureEn, lectureIt].every((x) => (x.match(/```box/g) || []).length === 1 && box(x).startsWith('Lightning')))
    check('lectures and texts never call the course free', ![lectureEn, lectureIt, pageText].some((x) => /\bfree\b|gratuit|gratis/i.test(x)))
  } else info('run the whole check to pin the texts')
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
