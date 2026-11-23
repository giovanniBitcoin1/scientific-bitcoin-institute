// Self-checks for Network Lab module 11, "Robustness and cascades". They run
// the same code as the page (robust.js, experiments.js, figures.js) and
// compare it with direct recomputation, closed forms and the answers of the
// exercises.
//
//   node scripts/lab/check-network-11.mjs [section]
//
// Sections: exercises, curves, loads, random, attack, coupled, overload,
// onion, figures, panels, page. Exits with code 1 if any check fails. Lines
// starting with INFO report the numbers quoted in the lecture, the "what to
// observe" lists and the exercises; checks starting "quoted on the page" pin
// them. Run it whole: the section "page" uses the numbers of the others. It
// takes about two minutes ("panels" runs the attack by recomputed betweenness
// and the two sweeps of the overload panel).
import { readFileSync } from 'node:fs'
import {
  seedOf, moments, criticalFraction, recomputedDegreeOrder, recomputedDegreesAlong, loads, loadsBrute, betweennessOrderJob, robustness, collapsePoint,
  giantCurveBrute, largestComponent, cascade, mutualTheory, singleTheory, coupledConstant, layerMatrix, drain,
} from '../../src/components/lab/network/robustness-and-cascades/robust.js'
import {
  panelA, valueAt, betweennessJob, robustJob, wiring, sourceNet, A_DEFAULT, A_ATTEMPTS, COLLAPSE,
  overloadNet, cascadeJob, sweepAlphaJob, B_DEFAULT,
  coupledPair, coupledAt, coupledSweepJob, C_DEFAULT,
} from '../../src/components/lab/network/robustness-and-cascades/experiments.js'
import { failNet, nextTarget, failState, dependenceCascade, F1_N, F1_ORDER_SEED, F2_A, F2_B, F2_N, F2_START } from '../../src/components/lab/network/robustness-and-cascades/figures.js'
import { giantCurve, randomOrder, attackOrder, degreesOf, makeSource, isSimpleWithDegrees } from '../../src/components/lab/network/who-connects-to-whom/mixing.js'
import { betweenness as betweenness10 } from '../../src/components/lab/network/weights-flows-navigation/weights.js'
import { buildCSR } from '../../src/components/lab/graphUtils.js'
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
  return [r, performance.now() - t0]
}
const netOf = (n, links) => ({ n, A: Int32Array.from(links, (l) => l[0]), B: Int32Array.from(links, (l) => l[1]) })
const small = (j) => {
  const n = 30 + 5 * (j % 7)
  const source = ['pa', 'poisson', 'power'][j % 3]
  return makeSource({ source, N: n, m: 1 + (j % 2), meanK: 2 + (j % 3), gamma: 2.5, kMin: 1 + (j % 2), seed: seedOf(4242, j) })
}

// ---------------------------------------------------------------- exercises

if (section('exercises')) {
  // 1
  const a = criticalFraction(4, 4 * 4 + 4)
  const b = criticalFraction(4, 100)
  check('Exercise 1: a random network with ⟨k⟩ = 4 has ⟨k²⟩ = 20 and f_c = 0.75', a === 0.75, String(a))
  check('Exercise 1: ⟨k⟩ = 4 and ⟨k²⟩ = 100 give f_c = 1 − 1/24 = 0.958', near(b, 1 - 1 / 24, 1e-15) && f3(b) === '0.958', f4(b))
  // 2
  const c = coupledConstant()
  results.constant = c
  check('the minimum of y/(1 − e^(−y))² is 2.4554, at y = 1.2564', f4(c.value) === '2.4554' && f4(c.y) === '1.2564', `${c.value} at ${c.y}`)
  const pc = c.value / 4
  check('Exercise 2: with ⟨k⟩ = 4 the mutual giant component vanishes below p = 0.614', f3(pc) === '0.614', f4(pc))
  check('Exercise 2: just above, it holds 1.2564/4 = 0.314 of the nodes', f3(c.y / 4) === '0.314' && near(mutualTheory(pc + 1e-7, 4), c.y / 4, 2e-3), `${f4(c.y / 4)}; solved at p_c + 10⁻⁷: ${f4(mutualTheory(pc + 1e-7, 4))}`)
  check('Exercise 2: just below, nothing', mutualTheory(pc - 1e-4, 4) === 0)
  check('Exercise 2: a single network needs p > 1/4 and grows from zero', singleTheory(0.25, 4) < 1e-3 && singleTheory(0.24, 4) === 0 && near(singleTheory(0.26, 4), 0.0196, 2e-3) && singleTheory(0.3, 4) > singleTheory(0.26, 4), `${f4(singleTheory(0.25, 4))} ${f4(singleTheory(0.26, 4))} ${f4(singleTheory(0.3, 4))}`)
  info(`theory, ⟨k⟩ = 4: mutual at p = 0.62, 0.65, 0.70, 0.80, 1: ${[0.62, 0.65, 0.7, 0.8, 1].map((p) => f3(mutualTheory(p, 4))).join(', ')}; single at the same p: ${[0.62, 0.65, 0.7, 0.8, 1].map((p) => f3(singleTheory(p, 4))).join(', ')}`)
  // 3
  const star = netOf(6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]])
  const complete = netOf(6, [0, 1, 2, 3, 4, 5].flatMap((i) => [0, 1, 2, 3, 4, 5].filter((j) => j > i).map((j) => [i, j])))
  const Rs = robustness(giantCurve(star, recomputedDegreeOrder(star)))
  const Rc = robustness(giantCurve(complete, recomputedDegreeOrder(complete)))
  check('Exercise 3: a star with five leaves has R = 5/36 = 0.139', near(Rs, 5 / 36, 1e-12) && f3(Rs) === '0.139', f4(Rs))
  check('Exercise 3: a complete network of six nodes has R = 15/36 = 0.417', near(Rc, 15 / 36, 1e-12) && f3(Rc) === '0.417', f4(Rc))
  check('Exercise 3: the same with the degrees of the intact network', near(robustness(giantCurve(star, attackOrder(degreesOf(star), mulberry32(1)))), 5 / 36, 1e-12))
  // 4
  const p = (f, k) => f ** k
  check('Exercise 4: 0.5⁸ = 0.0039 and 0.8⁸ = 0.168', p(0.5, 8).toFixed(4) === '0.0039' && f3(p(0.8, 8)) === '0.168', `${p(0.5, 8)} ${p(0.8, 8)}`)
  check('Exercise 4: 0.5¹⁰ = 0.00098 and 0.8¹⁰ = 0.107', p(0.5, 10).toFixed(5) === '0.00098' && f3(p(0.8, 10)) === '0.107', `${p(0.5, 10)} ${p(0.8, 10)}`)
}

// ---------------------------------------------------------------- curves

if (section('curves')) {
  let same = 0
  let total = 0
  let highest = true
  let firstBetween = true
  for (let j = 0; j < 20; j++) {
    const net = small(j)
    const random = mulberry32(seedOf(99, j))
    const orders = [randomOrder(net.n, random), attackOrder(degreesOf(net), random), recomputedDegreeOrder(net), drain(betweennessOrderJob(net)).order, drain(betweennessOrderJob(net, { recompute: true })).order]
    for (const order of orders) {
      const fast = giantCurve(net, order)
      const slow = giantCurveBrute(net, order)
      total++
      if (fast.every((v, i) => v === slow[i]) && new Set(order).size === net.n) same++
    }
    if (!recomputedDegreesAlong(net, orders[2]).every((s) => s.degree === s.highest)) highest = false
    const bc = loadsBrute(buildCSR(net.n, net.A, net.B))
    if (bc[orders[4][0]] !== Math.max(...bc) && Math.max(...bc) - bc[orders[4][0]] > 1e-9) firstBetween = false
    if (bc[orders[3][0]] !== Math.max(...bc) && Math.max(...bc) - bc[orders[3][0]] > 1e-9) firstBetween = false
  }
  check('removal curves: the union–find pass equals a direct search of the components at every step (20 small networks, 5 orders each)', same === total, `${same} of ${total}`)
  check('recomputed degree: every node removed has the highest degree left at that moment (20 networks, every step)', highest)
  check('attack by betweenness: the first node removed has the highest betweenness (20 networks, both versions)', firstBetween)
}

// ---------------------------------------------------------------- loads

if (section('loads')) {
  let worst = 0
  let worst10 = 0
  for (let j = 0; j < 12; j++) {
    const net = small(j)
    const g = buildCSR(net.n, net.A, net.B)
    const random = mulberry32(seedOf(7, j))
    const alive = Uint8Array.from({ length: net.n }, () => (random() < 0.8 ? 1 : 0))
    for (const [mask, endpoints] of [[null, false], [null, true], [alive, false], [alive, true]]) {
      const fast = loads(g, mask, endpoints)
      const slow = loadsBrute(g, mask, endpoints)
      for (let v = 0; v < net.n; v++) worst = Math.max(worst, Math.abs(fast[v] - slow[v]))
    }
    const ten = betweenness10(net, new Float64Array(net.A.length).fill(1))
    const mine = loads(g)
    for (let v = 0; v < net.n; v++) worst10 = Math.max(worst10, Math.abs(ten[v] - mine[v]))
  }
  check('loads: Brandes equals a direct count of shortest paths over all pairs (12 networks; whole and with nodes missing; with and without the paths that end at the node)', worst < 1e-9, worst.toExponential(1))
  check("loads: the same betweenness as module 10's (unit costs)", worst10 < 1e-9, worst10.toExponential(1))
  const path = netOf(4, [[0, 1], [1, 2], [2, 3]])
  const l = loads(buildCSR(4, path.A, path.B), null, true)
  check('loads: on a path of four nodes the two middle nodes carry 2 + 3 = 5 and the ends 3', l.join(' ') === '3 5 5 3', l.join(' '))
}

// ---------------------------------------------------------------- random removal

if (section('random')) {
  const points = []
  const table = [0, 0, 0]
  for (let j = 0; j < 10; j++) {
    const net = makeSource({ source: 'poisson', N: 10000, meanK: 4, seed: seedOf(5150, j) })
    const c = giantCurve(net, randomOrder(net.n, mulberry32(seedOf(5151, j))))
    points.push(collapsePoint(c, COLLAPSE))
    ;[0.5, 0.7, 0.8].forEach((f, i) => (table[i] += valueAt(c, f) / 10))
  }
  const mean = points.reduce((a, b) => a + b, 0) / 10
  info(`random removal, random networks ⟨k⟩ = 4, N = 10,000, 10 networks: below 1% of N at ${points.map(f3).join(' ')}; mean ${f3(mean)}; largest component at 50%, 70%, 80%: ${table.map(f3).join(', ')}`)
  check('random removal on random networks (⟨k⟩ = 4, N = 10,000): the largest component falls below 1% of N between 72% and 80% removed, mean of 10 (theory 75%)', mean > 0.72 && mean < 0.8, f3(mean))
  check('theory: f_c = 0.75 for ⟨k⟩ = 4, and the single-network curve at f = 0.5 is 0.398', criticalFraction(4, 20) === 0.75 && f3(singleTheory(0.5, 4)) === '0.398')
  check('random removal: at 50% removed the largest component is within 0.02 of the theory', near(table[0], singleTheory(0.5, 4), 0.02), `${f3(table[0])} against ${f3(singleTheory(0.5, 4))}`)
}

// ---------------------------------------------------------------- attack

if (section('attack')) {
  const points = []
  for (let j = 0; j < 10; j++) {
    const net = makeSource({ source: 'pa', N: 10000, m: 2, seed: seedOf(6160, j) })
    points.push(collapsePoint(giantCurve(net, attackOrder(degreesOf(net), mulberry32(seedOf(6161, j)))), COLLAPSE))
  }
  const mean = points.reduce((a, b) => a + b, 0) / 10
  info(`attack by initial degree, preferential attachment m = 2, N = 10,000, 10 networks: below 1% of N at ${points.map(f3).join(' ')}; mean ${f3(mean)}`)
  check('attack on preferential attachment (m = 2, N = 10,000, initial degree): the largest component is below 1% of N before 25% removed, in all 10 networks (expected about 17%)', points.every((x) => x < 0.25), `mean ${f3(mean)}`)
}

// ---------------------------------------------------------------- coupled

if (section('coupled')) {
  const at = [0.65, 0.7, 0.8]
  const sums = [0, 0, 0]
  let worst = 0
  let zeros = 0
  const at58 = []
  const at62 = []
  for (let run = 0; run < 10; run++) {
    const pair = coupledPair({ kind: 'random', N: 10000, meanK: 4 }, run)
    at.forEach((p, i) => {
      const r = coupledAt(pair, p)
      sums[i] += r.mutual / 10
      worst = Math.max(worst, Math.abs(r.mutual - mutualTheory(p, 4)))
    })
    const r = coupledAt(pair, 0.58)
    at58.push(r.mutual)
    if (r.mutual < COLLAPSE) zeros++
    at62.push(coupledAt(pair, 0.62).mutual)
  }
  results.coupled62 = at62
  info(`coupled random networks, ⟨k⟩ = 4, N = 10,000, 10 pairs: mutual giant at p = 0.65, 0.70, 0.80: ${sums.map(f3).join(', ')} (theory ${at.map((p) => f3(mutualTheory(p, 4))).join(', ')}); largest distance of a single run from the theory ${f3(worst)}`)
  info(`coupled, p = 0.58: ${at58.map(f4).join(' ')}; p = 0.62: ${at62.map(f3).join(' ')} (theory ${f3(mutualTheory(0.62, 4))})`)
  check('coupled networks: the mutual giant at p = 0.65, 0.70 and 0.80 is within 0.03 of the theory curve, in each of 10 runs', worst < 0.03, f3(worst))
  check('coupled networks: at p = 0.58 the mutual giant is below 1% of N in at least 9 of 10 runs', zeros >= 9, `${zeros} of 10`)
  // the cascade against a slow, direct version
  let agree = true
  for (let j = 0; j < 10; j++) {
    const pair = coupledPair({ kind: 'random', N: 200, meanK: 4 }, j)
    for (const p of [0.5, 0.7, 0.9]) {
      const fast = coupledAt(pair, p)
      const alive = new Uint8Array(200)
      for (let i = 0; i < Math.round(p * 200); i++) alive[pair.order[i]] = 1
      for (let changed = true; changed; ) {
        changed = false
        for (const g of [pair.a, pair.b]) {
          const big = largestComponent(g, alive)
          for (let v = 0; v < 200; v++)
            if (alive[v] && big.label[v] !== big.id) {
              alive[v] = 0
              changed = true
            }
        }
      }
      if (alive.reduce((a, b) => a + b, 0) !== Math.round(fast.mutual * 200)) agree = false
    }
  }
  check('coupled networks: the cascade ends on a set that is connected in both networks, the same one a slow version finds (10 pairs of 200 nodes, 3 values of p)', agree)
}

// ---------------------------------------------------------------- overload

if (section('overload')) {
  let all = true
  for (const source of ['pa', 'poisson']) {
    const on = overloadNet({ source, N: 400 })
    for (const t of [on.top, ...on.picks.slice(0, 5)]) {
      const c = cascade(on.g, on.load0, 100, t)
      if (c.failed !== 1 || c.rounds !== 0) all = false
    }
  }
  check('Motter–Lai: with α = 100 no node fails but the trigger (two networks, the top node and 5 random ones)', all)
  const on = overloadNet({ source: 'pa', N: 200 })
  const c0 = cascade(on.g, on.load0, 0.2, on.top)
  // direct replay with the brute-force loads
  const alive = new Uint8Array(200).fill(1)
  alive[on.top] = 0
  let rounds = 0
  for (;;) {
    const now = loadsBrute(on.g, alive, true)
    const over = []
    for (let v = 0; v < 200; v++) if (alive[v] && now[v] > 1.2 * on.load0[v] * (1 + 1e-9)) over.push(v)
    if (!over.length) break
    for (const v of over) alive[v] = 0
    rounds++
  }
  check('Motter–Lai: a cascade replayed with the direct count of shortest paths fails the same nodes in the same number of rounds (200 nodes, α = 0.2)', rounds === c0.rounds && [...alive].every((a, v) => a === c0.alive[v]), `${rounds} rounds, ${200 - alive.reduce((a, b) => a + b, 0)} failed`)
}

// ---------------------------------------------------------------- onion

if (section('onion')) {
  const a = panelA(A_DEFAULT)
  const k = degreesOf(a.net)
  let ok = true
  let rising = true
  let last = -Infinity
  const [o, ms] = timed(() =>
    drain(
      robustJob(a.net, A_ATTEMPTS, (net, R) => {
        if (!isSimpleWithDegrees(net, k)) ok = false
        if (!(R > last)) rising = false
        last = R
      }),
    ),
  )
  results.onion = { a, o }
  check('robustness optimisation: degrees unchanged, no self-link, no repeated link after every accepted swap', ok && isSimpleWithDegrees(o.net, k), `${o.accepted} accepted`)
  check('robustness optimisation: R rises at every accepted swap', rising && o.history.every((h, i) => i === 0 || h[1] > o.history[i - 1][1]))
  check('robustness optimisation: R of the result, recomputed from scratch, is the R reported', near(robustness(giantCurve(o.net, recomputedDegreeOrder(o.net))), o.R, 1e-15) && near(o.R0, a.recomputed.R, 1e-15))
  const w0 = wiring(a.net)
  const w1 = wiring(o.net)
  results.onion.w0 = w0
  results.onion.w1 = w1
  const random = mulberry32(31)
  const meanR = (net, order) => {
    let s = 0
    for (let i = 0; i < 20; i++) s += robustness(giantCurve(net, order())) / 20
    return s
  }
  const rnd0 = meanR(a.net, () => randomOrder(a.net.n, random))
  const rnd1 = meanR(o.net, () => randomOrder(a.net.n, random))
  const ini0 = meanR(a.net, () => attackOrder(k, random))
  const ini1 = meanR(o.net, () => attackOrder(k, random))
  results.onion.other = { rnd0, rnd1, ini0, ini1 }
  info(`robustness optimisation, default network (preferential attachment, N = 1,000, ⟨k⟩ = 4), ${o.tried.toLocaleString('en-US')} swaps tried, ${o.accepted} accepted, ${ms.toFixed(0)} ms: R ${f3(o.R0)} → ${f3(o.R)}; collapse point ${f3(collapsePoint(o.curve0))} → ${f3(collapsePoint(o.curve))}`)
  info(`  r ${f3(w0.r)} → ${f3(w1.r)}; ρ ${f3(w0.rho)} → ${f3(w1.rho)}; links between degrees at most one apart ${f3(w0.layered)} → ${f3(w1.layered)}`)
  info(`  not optimised for: R under attack by initial degree ${f3(ini0)} → ${f3(ini1)}; R under random removal ${f3(rnd0)} → ${f3(rnd1)}`)
  info(`  R after 1,000, 5,000, 10,000 swaps tried: ${[1000, 5000, 10000].map((t) => f3(o.history.filter((h) => h[0] <= t).pop()[1])).join(', ')}`)
  check('robustness optimisation: the gain is not an artefact of the order of ties: R under the attack by initial degree, ties at random, rises too', ini1 > ini0 + 0.05, `${f3(ini0)} → ${f3(ini1)}`)
}

// ---------------------------------------------------------------- figures

if (section('figures')) {
  const net = failNet()
  const attack = []
  const removed = new Uint8Array(F1_N)
  const sizes = [failState(net, []).size]
  for (let i = 0; i < F1_N; i++) {
    const v = nextTarget(net, removed)
    removed[v] = 1
    attack.push(v)
    sizes.push(failState(net, attack).size)
  }
  const order = randomOrder(F1_N, mulberry32(F1_ORDER_SEED))
  const rsizes = Array.from({ length: F1_N + 1 }, (_, i) => failState(net, Array.from(order.slice(0, i))).size)
  results.f1 = { sizes, rsizes, links: net.A.length }
  info(`F1: ${F1_N} nodes, ${net.A.length} links, highest degree ${Math.max(...degreesOf(net))}; largest component after 0, 5, 10, 15, 20 removals: attack ${[0, 5, 10, 15, 20].map((i) => sizes[i]).join(', ')}; random ${[0, 5, 10, 15, 20].map((i) => rsizes[i]).join(', ')}`)
  check('F1: the network is connected, and after 10 removals the attack leaves a smaller largest component than random removal', sizes[0] === F1_N && sizes[10] < rsizes[10])
  check('F1: both sequences end with nothing', sizes[F1_N] === 0 && rsizes[F1_N] === 0)
  const c = dependenceCascade(F2_START.side, F2_START.node)
  results.f2 = c
  info(`F2: ${F2_A.length} and ${F2_B.length} links; removing node ${F2_START.node + 1} of A: ${c.rounds.length} rounds, ${c.left} of ${F2_N} left; ${c.rounds.map((r, i) => `${i + 1}${'AB'[r.side]}: ${r.partner.length}+${r.cut.length}`).join(', ')}`)
  const mild = Array.from({ length: F2_N }, (_, v) => dependenceCascade(0, v)).map((x) => `${x.rounds.length}/${x.left}`)
  info(`F2: rounds/left for each node of A: ${mild.join(' ')}`)
  const gA = buildCSR(F2_N, Int32Array.from(F2_A, (l) => l[0]), Int32Array.from(F2_A, (l) => l[1]))
  const gB = buildCSR(F2_N, Int32Array.from(F2_B, (l) => l[0]), Int32Array.from(F2_B, (l) => l[1]))
  const alive = Uint8Array.from({ length: F2_N }, (_, v) => (c.dead[0][v] || c.dead[1][v] ? 0 : 1))
  check('F2: both networks are connected, and what is left at the end is connected in both', largestComponent(gA, null).size === F2_N && largestComponent(gB, null).size === F2_N && largestComponent(gA, alive).size === c.left && largestComponent(gB, alive).size === c.left)
  check('F2: at the end a node has failed in one network exactly when it has failed in the other', c.dead[0].every((d, v) => !!d === !!c.dead[1][v]))
}

// ---------------------------------------------------------------- panels

if (section('panels')) {
  // Panel A
  const A = {}
  for (const [id, params] of Object.entries({
    def: A_DEFAULT,
    poisson: { ...A_DEFAULT, source: 'poisson' },
    power: { ...A_DEFAULT, source: 'power' },
    paBig: { ...A_DEFAULT, N: 10000 },
    poissonBig: { ...A_DEFAULT, source: 'poisson', N: 10000 },
  })) {
    const [a, ms] = timed(() => panelA(params))
    A[id] = a
    info(`Panel A ${id}: ${a.net.n} nodes, ${a.links} links, ⟨k⟩ ${f2(a.mean)}, ⟨k²⟩ ${f2(a.mean2)}, f_c formula ${f3(a.fcTheory)}; random: below 1% at ${f3(a.random.fc)}, R ${f3(a.random.R)}; initial degree: ${f3(a.degree.fc)}, R ${f3(a.degree.R)}; recomputed degree: ${f3(a.recomputed.fc)}, R ${f3(a.recomputed.R)}; ${ms.toFixed(0)} ms`)
    info(`  random at 50%, 70%, 80%: ${[0.5, 0.7, 0.8].map((f) => f3(valueAt(a.random.curve, f))).join(', ')}; initial degree at 1%, 5%, 10%, 20%: ${[0.01, 0.05, 0.1, 0.2].map((f) => f3(valueAt(a.degree.curve, f))).join(', ')}; recomputed degree at the same: ${[0.01, 0.05, 0.1, 0.2].map((f) => f3(valueAt(a.recomputed.curve, f))).join(', ')}`)
  }
  for (const id of ['def', 'poisson', 'paBig']) {
    const [b, ms] = timed(() => drain(betweennessJob(A[id].net)))
    A[id].between = b
    info(`Panel A ${id}, betweenness (${b.recompute ? 'recomputed' : 'intact network'}): below 1% at ${f3(b.fc)}, R ${f3(b.R)}; at 5%, 10%, 20%: ${[0.05, 0.1, 0.2].map((f) => f3(valueAt(b.curve, f))).join(', ')}; ${ms.toFixed(0)} ms`)
  }
  results.A = A
  check('Panel A: the default page-load work takes less than 2 s in Node', timed(() => panelA(A_DEFAULT))[1] < 2000)
  check('Panel A: on the default network the four orders rank random > initial degree > recomputed degree > recomputed betweenness by R', A.def.random.R > A.def.degree.R && A.def.degree.R > A.def.recomputed.R && A.def.recomputed.R > A.def.between.R)
  // Panel B
  const B = {}
  for (const source of ['pa', 'poisson']) {
    const on = overloadNet({ ...B_DEFAULT, source })
    const [sw, ms] = timed(() => drain(sweepAlphaJob(on)))
    B[source] = { on, sw }
    info(`Panel B ${source}, N = ${on.n}: top node ${on.top} (degree ${on.k[on.top]}, load ${on.load0[on.top].toFixed(0)}; mean load ${(on.load0.reduce((a, b) => a + b, 0) / on.n).toFixed(0)}); sweep ${ms.toFixed(0)} ms`)
    for (const r of sw.rows) info(`  α ${r.alpha.toFixed(1)}: top G ${f3(r.top)} in ${r.roundsTop} rounds; random G ${f3(r.random)} in ${f2(r.roundsRandom)} rounds on average`)
  }
  const def = drain(cascadeJob(B.pa.on, B_DEFAULT.alpha, 'top'))
  const defRandom = drain(cascadeJob(B.pa.on, B_DEFAULT.alpha, 'random'))
  B.def = def
  B.defRandom = defRandom
  info(`Panel B default (pa, α = ${B_DEFAULT.alpha}): top trigger G ${f3(def.G)}, ${def.rounds} rounds, ${def.failed} failed; random triggers G ${f3(defRandom.G)}, ${f2(defRandom.rounds)} rounds, ${f2(defRandom.failed)} failed on average`)
  results.B = B
  check('Panel B: the single cascade agrees with the sweep at the same α', near(def.G, B.pa.sw.rows.find((r) => near(r.alpha, B_DEFAULT.alpha, 1e-9)).top, 1e-12))
  // Panel C
  const C = {}
  for (const [id, params] of Object.entries({ def: C_DEFAULT, power: { ...C_DEFAULT, kind: 'power' }, k6: { ...C_DEFAULT, meanK: 6 } })) {
    const pair = coupledPair(params)
    const [sw, ms] = timed(() => drain(coupledSweepJob(pair)))
    C[id] = { pair, sw }
    const row = (p) => sw.rows[Math.round(p * 100)]
    info(`Panel C ${id}: ⟨k⟩ ${f3(pair.meanK)}; mutual giant above 1% from p = ${sw.pc} (2.4554/⟨k⟩ = ${f3(results.constant ? results.constant.value / pair.meanK : 2.4554 / pair.meanK)}), single from ${sw.pcSingle} (1/⟨k⟩ = ${f3(1 / pair.meanK)}); most rounds ${sw.peak.rounds} at p = ${sw.peak.p}; ${ms.toFixed(0)} ms`)
    info(`  p: mutual (rounds) | single — ${[0.5, 0.58, 0.6, 0.61, 0.62, 0.63, 0.65, 0.7, 0.8, 0.9, 1].map((p) => `${p}: ${f3(row(p).mutual)} (${row(p).rounds}) | ${f3(row(p).single)}`).join('; ')}`)
  }
  results.C = C
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (results.A && results.B && results.C && results.onion && results.constant && results.coupled62 && results.f1 && results.f2) {
    const lectureEn = readFileSync(new URL('src/content/network-lab/robustness-and-cascades.en.md', root), 'utf8')
    const lectureIt = readFileSync(new URL('src/content/network-lab/robustness-and-cascades.it.md', root), 'utf8')
    const mod = await import('../../src/components/lab/network/robustness-and-cascades/texts.js')
    const pageText = [JSON.stringify(mod.observe), JSON.stringify(mod.exercises)].join(' ')
    const enOf = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    const e3 = (v) => enOf(v, 3)
    const e2 = (v) => enOf(v, 2).replace('-', '−')
    const pc = (v) => `${enOf(100 * v, 1)}%`
    const n0 = (v) => Math.round(v).toLocaleString('en-US')
    const quoted = (name, phrases, where = pageText) => {
      const missing = phrases.filter((p) => !where.includes(p))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.join(' | '))
    }
    const { A, B, C } = results
    const { o, w0, w1, other } = results.onion
    const d = A.def
    // Panel A
    quoted('Panel A, default', [`f_c = ${e3(d.fcTheory)}`, `below 1% of N at ${e3(d.random.fc)}, with R = ${e3(d.random.R)}`, `happens at ${e3(d.degree.fc)} (R = ${e3(d.degree.R)}), and with the degrees recomputed at ${e3(d.recomputed.fc)} (R = ${e3(d.recomputed.R)})`])
    const q = A.poisson
    quoted('Panel A, random network', [`the formula gives ${e3(q.fcTheory)}`, `${e3(q.degree.fc)} by initial degree (R = ${e3(q.degree.R)}) and ${e3(q.recomputed.fc)} recomputed (R = ${e3(q.recomputed.R)})`, `reaches 1% only at ${e3(q.random.fc)}`, `with 10,000 nodes it is ${e3(A.poissonBig.random.fc)}`])
    quoted('Panel A, betweenness', [`${e3(d.between.fc)} and R = ${e3(d.between.R)}`, `it leaves ${e3(valueAt(d.between.curve, 0.1))} of the nodes connected, where the recomputed degree leaves ${e3(valueAt(d.recomputed.curve, 0.1))}`])
    check('Panel A: the attack by recomputed betweenness has the lowest R and the earliest collapse of the four orders', d.between.recompute && d.between.R < d.recomputed.R && d.between.fc < d.recomputed.fc)
    quoted('Panel A, power law', [`⟨k²⟩ is ${enOf(A.power.mean2, 1)}, the formula gives ${e3(A.power.fcTheory)}`, `leaves ${e3(valueAt(A.power.recomputed.curve, 0.1))} at f = 0.10`])
    const m0 = layerMatrix(d.net, d.k)
    const m1 = layerMatrix(o.net, d.k)
    const last = m0.names.length - 1
    const pr = (v) => `${Math.round(100 * v)}%`
    info(`Panel A, classes ${m0.names.join(', ')} (${m0.nodes.join(', ')} nodes); diagonal before ${m0.share.map((r, i) => pr(r[i])).join(' ')}; after ${m1.share.map((r, i) => pr(r[i])).join(' ')}`)
    quoted('Panel A, Make it robust', [
      `rises from ${e3(o.R0)} to ${e3(o.R)} and the collapse moves from ${e3(collapsePoint(o.curve0))} to ${e3(collapsePoint(o.curve))}`,
      `ρ goes from ${e2(w0.rho)} to ${e2(w1.rho)}`,
      `from ${pc(w0.layered)} to ${pc(w1.layered)}`,
      `send ${pr(m0.share[last][0])} of their links to nodes of degree 2 and ${pr(m0.share[last][last])} to one another`,
      `After, ${pr(m1.share[0][0])} of the links of the nodes of degree 2 stay among themselves, and the hubs send ${pr(m1.share[last][0])} to them and ${pr(m1.share[last][last])} to one another`,
      `under random removal R falls from ${e3(other.rnd0)} to ${e3(other.rnd1)}`,
    ])
    check('Panel A: before the swaps no node of degree 2 is linked to another, the lowest class is "≤2" and holds only nodes of degree 2, and the last class is 21+', m0.share[0][0] === 0 && m0.names[0] === '≤2' && Math.min(...d.k) === 2 && m0.names[last] === '21+')
    // Panel B
    const on = B.pa.on
    const rowB = (sw, a) => sw.rows.find((r) => near(r.alpha, a, 1e-9))
    const meanLoad = (x) => x.load0.reduce((s, v) => s + v, 0) / x.n
    quoted('Panel B, default', [`has degree ${on.k[on.top]} and a load of ${n0(on.load0[on.top])}, against a mean of ${n0(meanLoad(on))}`, `a cascade of ${B.def.rounds} rounds in which ${B.def.failed} nodes fail`, `holds ${e3(B.def.G)} of the nodes`])
    quoted('Panel B, random node', [`on average ${enOf(B.defRandom.failed, 2)} nodes fail, the trigger included, and G = ${e3(B.defRandom.G)}`])
    const sp = B.pa.sw
    const longest = sp.rows.reduce((b, r) => (b.roundsTop >= r.roundsTop ? b : r))
    quoted('Panel B, sweep', [
      `G is ${e3(rowB(sp, 0).top)} at α = 0, ${e3(rowB(sp, 0.3).top)} at 0.3, ${e3(rowB(sp, 0.4).top)} at 0.4, ${e3(rowB(sp, 0.5).top)} at 0.5 and ${e3(rowB(sp, 1).top)} at 1`,
      `longest, ${longest.roundsTop} rounds, at α = ${longest.alpha}`,
      `G is ${e3(rowB(sp, 0).random)} at α = 0 and already ${e3(rowB(sp, 0.1).random)} at 0.1`,
    ])
    check('Panel B: one value of α has the longest cascade', sp.rows.filter((r) => r.roundsTop === longest.roundsTop).length === 1)
    const sq = B.poisson.sw
    const onq = B.poisson.on
    quoted('Panel B, random network', [
      `the highest load is ${n0(onq.load0[onq.top])}, the mean ${n0(meanLoad(onq))}`,
      `leaves ${e3(rowB(sq, 0.1).top)} at α = 0.1, after ${rowB(sq, 0.1).roundsTop} rounds, and ${e3(rowB(sq, 0.2).top)} at 0.2; a random node leaves ${e3(rowB(sq, 0.1).random)} and ${e3(rowB(sq, 0.2).random)}`,
    ])
    check('Panel B, random network: 0.980 is the largest component of the intact network', e3(largestComponent(onq.g, null).size / onq.n) === e3(rowB(sq, 0.2).random) || near(largestComponent(onq.g, null).size / onq.n, rowB(sq, 0.2).random, 0.003), e3(largestComponent(onq.g, null).size / onq.n))
    // Panel C
    const cr = (id, p) => C[id].sw.rows[Math.round(p * 100)]
    quoted('Panel C, default', [
      `holds ${e3(cr('def', 0.7).mutual)} of the nodes (theory ${e3(mutualTheory(0.7, 4))}) after ${cr('def', 0.7).rounds} steps, while a single network would keep ${e3(cr('def', 0.7).single)}`,
      `At 0.65 the pair keeps ${e3(cr('def', 0.65).mutual)}; at 0.62, ${e3(cr('def', 0.62).mutual)} after ${cr('def', 0.62).rounds} steps; at 0.61, nothing, after ${cr('def', 0.61).rounds} steps`,
      `2.4554/4 = ${e3(results.constant.value / 4)}`,
      `at 0.61 still holds ${e3(cr('def', 0.61).single)}`,
      `a peak of ${C.def.sw.peak.rounds} at p = ${enOf(C.def.sw.peak.p, 2)}`,
    ])
    check('Panel C: at p = 0.61 the mutual giant is below 1% of N, and the peak of the steps is there', cr('def', 0.61).mutual < COLLAPSE && C.def.sw.peak.p === 0.61)
    quoted('Panel C, mean degree 6', [`appears at p = ${enOf(C.k6.sw.pc, 2)} (formula ${e3(results.constant.value / 6)})`])
    const kp = C.power.pair.meanK
    quoted('Panel C, power law', [`mean degree ${enOf(kp, 2)}`, `only at p = ${enOf(C.power.sw.pc, 2)}, where two random networks of that mean degree would need ${e3(results.constant.value / kp)}`, `passes 1% at p = ${enOf(C.power.sw.pcSingle, 2)}, against 1/⟨k⟩ = ${e3(1 / kp)}`])
    // Exercises
    const big = (a) => `${[0.5, 0.7, 0.8].map((f) => e3(valueAt(a.random.curve, f))).join(', ')}; by degree: ${[0.01, 0.05, 0.1, 0.2].map((f) => e3(valueAt(a.degree.curve, f))).join(', ')}`
    quoted('Exercise 5', [`Random network, at random: ${big(A.poissonBig)}`, `Preferential attachment, at random: ${big(A.paBig)}`])
    const ratio80 = valueAt(A.paBig.random.curve, 0.8) / valueAt(A.poissonBig.random.curve, 0.8)
    check('Exercise 5: at 80% removed at random the heavy-tailed network keeps a component about ten times as large (8 to 12), and at 20% by degree the random network keeps about two thirds', ratio80 > 8 && ratio80 < 12 && near(valueAt(A.poissonBig.degree.curve, 0.2), 2 / 3, 0.03), `${f2(ratio80)}`)
    const six = [0.6, 0.62, 0.65, 0.7, 0.8]
    const c62 = results.coupled62
    quoted('Exercise 6', [
      `${six.slice(0, 4).map((p) => e3(cr('def', p).mutual)).join(', ')} and ${e3(cr('def', 0.8).mutual)}; the theory gives 0, ${six.slice(1, 4).map((p) => e3(mutualTheory(p, 4))).join(', ')} and ${e3(mutualTheory(0.8, 4))}`,
      `between ${e3(Math.min(...c62))} and ${e3(Math.max(...c62))} at p = 0.62`,
    ])
    check('Exercise 6: the theory gives 0 at p = 0.60', mutualTheory(0.6, 4) === 0)
    // lecture
    quoted('lecture, random failure', [`gives ${e3(d.fcTheory)} for 1,000 nodes grown by preferential attachment and ${e3(A.paBig.fcTheory)} for 10,000, against 0.75`], lectureEn)
    quoted('lecture, attack', [
      `leaves a largest component of ${e3(valueAt(A.poissonBig.random.curve, 0.5))} of the nodes in the random network and ${e3(valueAt(A.paBig.random.curve, 0.5))} under preferential attachment`,
      `leaves ${e3(valueAt(A.poissonBig.degree.curve, 0.2))} in the random network and ${e3(valueAt(A.paBig.degree.curve, 0.2))} under preferential attachment`,
    ], lectureEn)
    quoted('lecture, onion', [`${n0(o.tried)} attempted swaps raise R from ${e3(o.R0)} to ${e3(o.R)}, and Spearman's ρ of module 08 from ${e2(w0.rho)} to ${e2(w1.rho)}`, `under random removal R falls from ${e3(other.rnd0)} to ${e3(other.rnd1)}`], lectureEn)
    quoted('lecture, overload', [`with ${on.n} nodes and α = 0.2`, `leaves a largest component of ${e3(B.def.G)} of the nodes; removing a random one leaves ${e3(B.defRandom.G)}`, `${e3(rowB(sq, 0.2).top)} is left`], lectureEn)
    quoted('lecture, coupled', [
      'p > 2.4554/⟨k⟩',
      'jumps to 1.2564/⟨k⟩, about 31% of the nodes when ⟨k⟩ = 4',
      `keeping 62% of the nodes leaves a mutual giant component of ${e3(cr('def', 0.62).mutual)}; keeping 61% leaves nothing, after ${cr('def', 0.61).rounds} steps`,
      `of mean degree ${enOf(kp, 2)}, need p = ${enOf(C.power.sw.pc, 2)}, where two random networks of that mean degree would need ${e3(results.constant.value / kp)}`,
    ], lectureEn)
    check('lecture: 1.2564/4 is 31% to the nearest per cent', Math.round((100 * results.constant.y) / 4) === 31)
    quoted('lecture, box', ['8 full-relay and 2 block-relay-only outbound connections', 'version 0.10.1', 'feeler connections (0.13.1) and test-before-evict (0.17.0)', 'in November 2015, 13 autonomous systems hosted 30% of the nodes', 'On a Lightning snapshot of 1 February 2019'], lectureEn)
    const m01 = readFileSync(new URL('src/content/network-lab/reading-a-network.en.md', root), 'utf8')
    check('lecture, box: the numbers of outbound connections are those of module 01', m01.includes('8 full-relay and 2 block-relay-only outbound connections'))
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
    check('lectures and texts never call the course free', ![lectureEn, lectureIt, pageText].some((x) => /\bfree\b|gratuit|gratis/i.test(x)))
    check('exercises: six, four on paper and two in the simulation', mod.exercises.length === 6 && mod.exercises.filter((e) => e.type === 'paper').length === 4 && mod.exercises.filter((e) => e.type === 'sim').length === 2)
  } else info('run the whole check to pin the texts')
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
