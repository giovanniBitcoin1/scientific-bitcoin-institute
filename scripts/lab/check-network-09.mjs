// Self-checks for Network Lab module 09, "Communities". They run the same
// code as the page (community.js, experiments.js, figures.js) and compare it
// with direct sums, closed forms and the answers of the exercises.
//
//   node scripts/lab/check-network-09.mjs [section]
//
// Sections: q, nmi, louvain, lp, ring, benchmark, random, spectral, figures,
// page. Exits with code 1 if any check fails. Lines starting with INFO report
// the numbers quoted in the lecture, the "what to observe" lists and the
// exercises; checks starting "quoted on the page" pin them. Run it whole: the
// section "page" uses the numbers of the others.
import { readFileSync } from 'node:fs'
import {
  modularity, modularityDirect, modularityTerms, louvain, louvainBest, labelPropagation, nmi, relabel, groupCount,
  fromEdges, randomGnm, gnBenchmark, ringOfCliques, cliquePartition, pairPartition, ringQ, ringGammaRange,
  twoGroupSBM, spectralJob, overlap, drain, seedOf, cliqueReport,
} from '../../src/components/lab/network/communities/community.js'
import {
  karateFrom, panelA, A_DEFAULT, sweepAJob, randomQJob, panelB, B_DEFAULT, panelCJob, sweepCJob, C_DEFAULT, cInOut,
  benchmarkNet, RANDOM_K,
} from '../../src/components/lab/network/communities/experiments.js'
import { F1_NET, F1_START, bestSplit, ringCurve } from '../../src/components/lab/network/communities/figures.js'
import { mulberry32 } from '../../src/components/lab/rng.js'

const only = process.argv[2]
const section = (name) => !only || only === name
let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const near = (v, want, tol) => Math.abs(v - want) <= tol
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length
const root = new URL('../../', import.meta.url)
const karateData = JSON.parse(readFileSync(new URL('src/data/lab/networks/karate-club.json', root), 'utf8'))
const KARATE = karateFrom(karateData)
export const results = {}

const randomNets = () =>
  Array.from({ length: 20 }, (_, j) => {
    const n = 60 + 20 * j
    return randomGnm(n, Math.round((n * (3 + (j % 6))) / 2), seedOf(77, j))
  })

// ---------------------------------------------------------------- q

if (section('q')) {
  const tri = fromEdges(6, [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5], [2, 3]])
  const split = Int32Array.from([0, 0, 0, 1, 1, 1])
  check('Exercise 1: the two triangles give Q = 5/14', near(modularity(tri, split), 5 / 14, 1e-12), String(modularity(tri, split)))
  check('Exercise 1: one group gives Q = 0', near(modularity(tri, new Int32Array(6)), 0, 1e-12))
  check('Exercise 1: every node alone gives Q = −34/196', near(modularity(tri, Int32Array.from([0, 1, 2, 3, 4, 5])), -34 / 196, 1e-12))
  const t = modularityTerms(tri, split)
  check('Exercise 1: terms 6/7 inside and 1/2 expected', near(t.inside, 6 / 7, 1e-12) && near(t.expected, 0.5, 1e-12))
  let worst = 0
  for (const g of randomNets()) {
    const p = louvain(g, { seed: 3 }).partition
    worst = Math.max(worst, Math.abs(modularity(g, p, 1) - modularity(g, p)))
  }
  check('Q_γ = Q at γ = 1 on 20 random networks', worst === 0)
  const fac = KARATE.factions
  const lv = louvainBest(KARATE.g, Array.from({ length: 100 }, (_, i) => i + 1))
  results.karate = { factions: modularity(KARATE.g, fac), best: lv.Q, groups: groupCount(lv.partition), partition: lv.partition }
  const d1 = Math.abs(modularity(KARATE.g, fac) - modularityDirect(KARATE.g, fac))
  const d2 = Math.abs(lv.Q - modularityDirect(KARATE.g, lv.partition))
  check('karate club: Q of the factions and of the best partition agree with the direct sum over pairs (within 1e-12)', d1 < 1e-12 && d2 < 1e-12, `${d1.toExponential(1)} ${d2.toExponential(1)}`)
  check('karate club: 34 members, 78 links, factions of 17 and 17', KARATE.g.n === 34 && KARATE.g.A.length === 78 && fac.filter((x) => x === 0).length === 17)
  info(`karate club: factions (NetworkX "club" labels, unweighted) Q = ${f4(results.karate.factions)}`)
  check('Exercise 4: the factions give Q = 0.3582', f4(results.karate.factions) === '0.3582')
}

// ---------------------------------------------------------------- nmi

if (section('nmi')) {
  // direct: 2 I(X;Y) / (H(X) + H(Y)) from the joint frequencies, in nested loops
  const direct = (x, y) => {
    const N = x.length
    const a = relabel(x)
    const b = relabel(y)
    const ga = groupCount(a)
    const gb = groupCount(b)
    const P = Array.from({ length: ga }, () => new Array(gb).fill(0))
    for (let i = 0; i < N; i++) P[a[i]][b[i]] += 1 / N
    const pa = P.map((r) => r.reduce((s, v) => s + v, 0))
    const pb = P[0].map((_, j) => P.reduce((s, r) => s + r[j], 0))
    let I = 0
    for (let i = 0; i < ga; i++) for (let j = 0; j < gb; j++) if (P[i][j] > 0) I += P[i][j] * Math.log(P[i][j] / (pa[i] * pb[j]))
    const H = (p) => -p.reduce((s, v) => s + (v > 0 ? v * Math.log(v) : 0), 0)
    return (2 * I) / (H(pa) + H(pb))
  }
  const random = mulberry32(5)
  let worst = 0
  for (let t = 0; t < 50; t++) {
    const N = 20 + Math.floor(random() * 200)
    const x = Int32Array.from({ length: N }, () => Math.floor(random() * (2 + (t % 7))))
    const y = Int32Array.from({ length: N }, (_, i) => (random() < 0.5 ? x[i] : Math.floor(random() * (2 + (t % 5)))))
    worst = Math.max(worst, Math.abs(nmi(x, y) - direct(x, y)))
  }
  check('NMI agrees with 2I/(H(X) + H(Y)) computed directly on 50 random pairs (within 1e-12)', worst < 1e-12, worst.toExponential(2))
  let relab = 0
  for (let t = 0; t < 20; t++) {
    const N = 50 + 7 * t
    const x = Int32Array.from({ length: N }, () => Math.floor(random() * 6))
    const perm = [5, 3, 0, 1, 4, 2].map((v) => v + 10 * t)
    const y = Int32Array.from(x, (v) => perm[v])
    relab = Math.max(relab, Math.abs(nmi(x, x) - 1), Math.abs(nmi(x, y) - 1))
  }
  check('NMI = 1 for identical partitions and for any relabelling', relab < 1e-12, relab.toExponential(2))
}

// ---------------------------------------------------------------- louvain

if (section('louvain')) {
  let movesBad = 0
  let predBad = 0
  let moves = 0
  let cover = true
  for (const g of randomNets().slice(0, 10)) {
    let prev = modularity(g, Int32Array.from({ length: g.n }, (_, i) => i))
    louvain(g, {
      seed: 2,
      onMove: ({ dQ, partition }) => {
        const q = modularity(g, partition())
        moves++
        if (!(q > prev)) movesBad++
        if (Math.abs(q - prev - dQ) > 1e-10) predBad++
        prev = q
      },
    })
  }
  check(`Louvain: every move raises Q, by the predicted amount (${moves} moves on 10 random networks)`, movesBad === 0 && predBad === 0, `${movesBad} not rising, ${predBad} off`)
  let notLess = 0
  let worstGap = 0
  const qs = []
  for (const [j, g] of randomNets().entries()) {
    const lv = louvain(g, { seed: j + 1 })
    const lp = labelPropagation(g, { seed: j + 1 })
    if (lv.partition.length !== g.n || lv.partition.some((x) => x < 0 || x >= groupCount(lv.partition))) cover = false
    if (lv.Q >= lp.Q - 1e-12) notLess++
    worstGap = Math.max(worstGap, lp.Q - lv.Q)
    qs.push(`${f3(lv.Q)}/${f3(lp.Q)}`)
  }
  check('Louvain: the final partition gives every node one group', cover)
  info(`Louvain against label propagation on 20 random networks, Q (Louvain/LP): ${qs.join(' ')}`)
  // The prompt asks for "at least that of label propagation, or report how
  // often not": it is not, once in 20 (0.490 against 0.492). Reported, and
  // the check asks only that Louvain is never more than 0.01 below.
  results.lvVsLp = { notLess, worstGap }
  info(`Louvain's Q is at least label propagation's on ${notLess} of 20 random networks; the largest shortfall is ${worstGap.toFixed(4)}`)
  check('Louvain: never more than 0.01 below label propagation on the 20 random networks', worstGap <= 0.01, worstGap.toFixed(4))
  const all = Array.from({ length: 100 }, (_, i) => louvain(KARATE.g, { seed: i + 1 }).Q)
  const best = Math.max(...all)
  results.karateSeeds = { best, worst: Math.min(...all), mean: mean(all), hits: all.filter((q) => f4(q) === f4(best)).length }
  info(`karate club, Louvain over 100 seeds: best ${f4(best)}, mean ${f4(mean(all))}, worst ${f4(Math.min(...all))}; the best reached by ${results.karateSeeds.hits} seeds`)
  check('karate club: the best Q over 100 seeds is 0.4198', f4(best) === '0.4198', f4(best))
  const bp = louvainBest(KARATE.g, Array.from({ length: 100 }, (_, i) => i + 1))
  check('karate club: the best partition has four groups', groupCount(bp.partition) === 4)
  const sizes = [...new Set(bp.partition)].map((c) => bp.partition.filter((x) => x === c).length).sort((a, b) => b - a)
  info(`karate club, best partition: group sizes ${sizes.join(', ')}; NMI with the factions ${f3(nmi(bp.partition, KARATE.factions))}`)
  results.karateSizes = sizes
  results.karateBestNmi = nmi(bp.partition, KARATE.factions)
}

// ---------------------------------------------------------------- lp

if (section('lp')) {
  const runs = Array.from({ length: 100 }, (_, i) => labelPropagation(KARATE.g, { seed: i + 1 }))
  const qs = runs.map((r) => r.Q)
  const one = runs.filter((r) => groupCount(r.partition) === 1).length
  results.karateLp = { mean: mean(qs), best: Math.max(...qs), one }
  info(`karate club, label propagation over 100 seeds: mean Q ${f3(mean(qs))}, best ${f3(Math.max(...qs))}; a single group in ${one} runs`)
  check('label propagation: every run stops with each node holding a most frequent label around it (under 200 sweeps)', runs.every((r) => r.sweeps < 200))
}

// ---------------------------------------------------------------- ring

if (section('ring')) {
  const cases = [
    [30, 5, '0.8758', '0.8879'],
    [20, 5, '0.8591', '0.8545'],
    [24, 5, '0.8712', '0.8674'],
  ]
  for (const [n, s, a, b] of cases) {
    const g = ringOfCliques(n, s)
    const one = modularity(g, cliquePartition(n, s))
    const pairs = modularity(g, pairPartition(n, s))
    const c = ringQ(n, s)
    check(`ring n = ${n}, s = ${s}: closed forms equal the computed Q (${f4(one)}, ${f4(pairs)})`, near(one, c.one, 1e-12) && near(pairs, c.pairs, 1e-12))
    const want = n === 24 ? [b, a] : [a, b]
    check(`ring n = ${n}, s = ${s}: each clique ${want[0]}, pairs ${want[1]}`, f4(one) === want[0] && f4(pairs) === want[1], `${f4(one)} ${f4(pairs)}`)
    const L = c.L
    const d = c.d
    check(`ring n = ${n}, s = ${s}: the difference is n[1/(2L) − (d/2L)²]`, near(pairs - one, n * (1 / (2 * L) - (d / (2 * L)) ** 2), 1e-12))
  }
  let ok = true
  for (let s = 3; s <= 10; s++)
    for (let n = 4; n <= 60; n += 2) {
      const c = ringQ(n, s)
      if (c.pairs > c.one + 1e-12 !== n > s * (s - 1) + 2) ok = false
    }
  check('ring: pairs beat single cliques exactly when n > s(s − 1) + 2, for every even n 4–60 and s 3–10', ok)
  const r = ringGammaRange(30, 5)
  let inRange = true
  for (const gm of [r.lo * 1.05, Math.sqrt(r.lo * r.hi), r.hi * 0.95]) {
    const g = ringOfCliques(30, 5)
    if (modularity(g, cliquePartition(30, 5), gm) <= modularity(g, pairPartition(30, 5), gm)) inRange = false
  }
  check(`ring n = 30, s = 5: inside the range γ ${r.lo.toFixed(2)}–${r.hi.toFixed(1)} each clique beats pairs`, inRange)
  // brute force the split bound on one clique: every subset
  const brute = (n, s) => {
    const g = ringOfCliques(n, s)
    let hi = Infinity
    for (let mask = 1; mask < (1 << s) - 1; mask++) {
      const p = cliquePartition(n, s)
      for (let i = 0; i < s; i++) if (mask & (1 << i)) p[i] = n
      // Q_γ(split) − Q_γ(one) = −a(s − a)/L + γ X, linear in γ: find the γ where it crosses 0
      const q0a = modularity(g, p, 0) - modularity(g, cliquePartition(n, s), 0)
      const q1a = modularity(g, p, 1) - modularity(g, cliquePartition(n, s), 1)
      const slope = q1a - q0a
      if (slope > 0) hi = Math.min(hi, -q0a / slope)
    }
    return hi
  }
  let rangeOk = true
  for (const [n, s] of [[30, 5], [10, 3], [60, 10], [8, 7]]) if (!near(brute(n, s), ringGammaRange(n, s).hi, 1e-9)) rangeOk = false
  check('ring: the upper end of the γ range equals a brute force over every split of one clique', rangeOk)
  const B = panelB(B_DEFAULT)
  results.panelB = B
  info(`Panel B default (n = 30, s = 5, γ = 1): Louvain ${B.report.groups} groups, ${B.report.split} cliques split, ${B.report.merged} merged, Q ${f4(B.qFound)}; γ range ${B.range.lo.toFixed(2)}–${B.range.hi.toFixed(1)}`)
  const gm = {}
  for (const g of [0.5, 1, 1.2, 1.5, 2, 5, 20, 40]) {
    const b = panelB({ ...B_DEFAULT, gamma: g })
    gm[g] = b.report
    info(`Panel B, γ = ${g}: ${b.report.groups} groups, split ${b.report.split}, merged ${b.report.merged}`)
  }
  results.gammaRuns = gm
  let small = true
  for (let n = 4; n <= 22; n += 2) {
    const b = panelB({ n, s: 5, gamma: 1 })
    if (b.report.groups !== n || b.report.split || b.report.merged) small = false
  }
  check('Panel B, s = 5: for every even n up to 22 Louvain returns one group per clique', small)
  check('Panel B, γ: merging at 1.2, the 30 cliques at 1.5, every clique split at 40 (90 groups)', gm[1.2].merged > 0 && gm[1.5].groups === 30 && gm[1.5].split === 0 && gm[40].groups === 90 && gm[40].split === 30)
  const big = panelB({ n: 60, s: 3, gamma: 1 })
  results.ring60 = big
  info(`Panel B, n = 60, s = 3: one ${f4(big.qOne)}, pairs ${f4(big.qPairs)}, Louvain ${f4(big.qFound)} with ${big.report.groups} groups, merged ${big.report.merged}; γ range ${big.range.lo.toFixed(2)}–${big.range.hi.toFixed(1)}`)
}

// ---------------------------------------------------------------- benchmark

if (section('benchmark')) {
  const sw = drain(sweepAJob())
  results.sweepA = sw.rows
  for (const r of sw.rows) info(`benchmark k_out = ${r.kOut} (μ = ${r.mu.toFixed(3)}): NMI Louvain ${f3(r.louvain)}, label propagation ${f3(r.lp)} (${r.count} networks)`)
  const at = (k) => sw.rows.find((r) => r.kOut === k)
  check('benchmark: Louvain mean NMI ≥ 0.95 for k_out ≤ 6', sw.rows.filter((r) => r.kOut <= 6).every((r) => r.louvain >= 0.95))
  info(`expected 1.00, 1.00, 0.96 at k_out = 2, 4, 6: got ${[2, 4, 6].map((k) => at(k).louvain.toFixed(2)).join(', ')}`)
  const below = (key) => sw.rows.find((r) => r[key] < 0.5)
  results.below = { louvain: below('louvain'), lp: below('lp') }
  info(`first k_out with NMI < 0.5: Louvain ${below('louvain').kOut} (μ = ${below('louvain').mu}), label propagation ${below('lp').kOut} (μ = ${below('lp').mu})`)
  let n = 0
  let L = 0
  for (let j = 0; j < 20; j++) {
    const g = benchmarkNet(4, j)
    n += g.n
    L += g.A.length
  }
  check('benchmark: 128 nodes, mean degree 16 within 0.3 (20 networks)', n === 20 * 128 && near((2 * L) / n, 16, 0.3), ((2 * L) / n).toFixed(2))
  const A = panelA(A_DEFAULT, KARATE)
  results.panelA = A
  info(`Panel A default (benchmark, k_out = 6, Louvain, seed 1): planted Q ${f3(A.qPlanted)}, found ${f3(A.qFound)}, ${A.groups} groups, NMI ${f3(A.nmi)}, ${A.L} links`)
  const views = {}
  for (const source of ['gn', 'karate', 'random'])
    for (const method of ['louvain', 'lp']) {
      const v = panelA({ ...A_DEFAULT, source, method }, KARATE)
      views[`${source}_${method}`] = v
      info(`Panel A ${source} ${method}: planted Q ${f3(v.qPlanted)}, found ${f3(v.qFound)}, ${v.groups} groups, NMI ${f3(v.nmi)}`)
    }
  results.views = views
}

// ---------------------------------------------------------------- random

if (section('random')) {
  const r = drain(randomQJob())
  results.randomQ = r.rows
  info(`random networks, 1,000 nodes, Louvain, mean of 5: ${r.rows.map((x) => `⟨k⟩ = ${x.k}: Q ${f3(x.Q)}, ${x.groups.toFixed(1)} groups`).join('; ')}`)
  const want = { 4: 0.52, 8: 0.32, 16: 0.22 }
  check('random networks: Louvain Q within 0.03 of 0.52, 0.32, 0.22 at mean degree 4, 8, 16', r.rows.every((x) => near(x.Q, want[x.k], 0.03)), r.rows.map((x) => f3(x.Q)).join(' '))
  check('random networks: mean degree 4, 8, 16', RANDOM_K.join() === '4,8,16')
}

// ---------------------------------------------------------------- spectral

if (section('spectral')) {
  // power iteration against a dense eigen-decomposition on a small network (Jacobi)
  const g = twoGroupSBM(80, 9, 1, 11)
  const n = g.n
  const L = g.A.length
  const k = new Float64Array(n)
  for (let e = 0; e < L; e++) k[g.A[e]]++, k[g.B[e]]++
  const Bm = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => -(k[i] * k[j]) / (2 * L)))
  for (let e = 0; e < L; e++) Bm[g.A[e]][g.B[e]] += 1, Bm[g.B[e]][g.A[e]] += 1
  const lam = jacobiTop(Bm)
  const sp = drain(spectralJob(g, { seed: 1, maxIter: 20000, tol: 1e-12 }))
  check('spectral: power iteration finds the largest eigenvalue of B on an 80-node network (dense Jacobi)', near(sp.lambda, lam, 1e-6), `${sp.lambda.toFixed(6)} ${lam.toFixed(6)}`)
  const c = C_DEFAULT.c
  const rows = {}
  for (const x of [0.6, 2]) {
    const ov = []
    for (let j = 0; j < 3; j++) ov.push(drain(panelCJob({ N: 4000, c, x }, j)).overlap)
    rows[x] = mean(ov)
    info(`spectral, c̄ = 10, N = 4,000, ${x} × threshold: overlaps ${ov.map(f3).join(' ')}, mean ${f3(mean(ov))}`)
  }
  check('spectral: at 0.6 times the threshold the mean overlap of three networks is below 0.1', rows[0.6] < 0.1, f3(rows[0.6]))
  check('spectral: at 2 times the threshold it is above 0.8', rows[2] > 0.8, f3(rows[2]))
  const sc = drain(sweepCJob({ N: 4000, c: 10 }))
  results.sweepC = sc.rows
  info(`sweep c̄ = 10, N = 4,000: ${sc.rows.map((r) => `${r.x}: ${f3(r.overlap)} (Louvain NMI ${f3(r.louvainNmi)})`).join('; ')}`)
  const def = drain(panelCJob(C_DEFAULT))
  results.panelC = def
  info(`Panel C default: c_in ${def.cIn.toFixed(2)}, c_out ${def.cOut.toFixed(2)}, inside ${f3(def.inside)}, overlap ${f3(def.overlap)}, ${def.iterations} iterations, Louvain Q ${f3(def.louvainQ)}, ${def.louvainGroups} groups, NMI ${f3(def.louvainNmi)}`)
  const sparse = {}
  for (const x of [0.6, 1, 1.5]) {
    const r = drain(panelCJob({ N: 10000, c: 3, x }))
    sparse[x] = r
    info(`c̄ = 3, N = 10,000, ${x} × threshold (c_in ${r.cIn.toFixed(2)}, c_out ${r.cOut.toFixed(2)}): overlap ${f3(r.overlap)}, Louvain Q ${f3(r.louvainQ)}, ${r.louvainGroups} groups, NMI ${f3(r.louvainNmi)}`)
  }
  results.sparse = sparse
  const p = cInOut(3, 3)
  check('Panel C: at c̄ = 3 the multiple stops at √3, where c_out = 0', p.clamped && near(p.cOut, 0, 1e-12) && near(p.x, Math.sqrt(3), 1e-12))
  const ex = cInOut(3, 3 / (2 * Math.sqrt(3)))
  check('Exercise 3: c_in = 4.5, c_out = 1.5 is c_in − c_out = 3, below 2√3 = 3.46; 75% inside', near(ex.cIn, 4.5, 1e-12) && near(ex.cOut, 1.5, 1e-12) && 3 < 2 * Math.sqrt(3))
  check('Exercise 3: with c̄ = 10, c_in > 10 + √10 = 13.16', (10 + Math.sqrt(10)).toFixed(2) === '13.16')
}

function jacobiTop(M) {
  const n = M.length
  const a = M.map((r) => r.slice())
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2
    if (off < 1e-22) break
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let r = 0; r < n; r++) {
          const arp = a[r][p]
          const arq = a[r][q]
          a[r][p] = c * arp - s * arq
          a[r][q] = s * arp + c * arq
        }
        for (let r = 0; r < n; r++) {
          const apr = a[p][r]
          const aqr = a[q][r]
          a[p][r] = c * apr - s * aqr
          a[q][r] = s * apr + c * aqr
        }
      }
  }
  let top = -Infinity
  for (let i = 0; i < n; i++) top = Math.max(top, a[i][i])
  return top
}

// ---------------------------------------------------------------- figures

if (section('figures')) {
  const g = F1_NET
  check('F1: 16 nodes', g.n === 16, `${g.n} nodes, ${g.A.length} links`)
  const best = bestSplit(g)
  let brute = -Infinity
  for (let mask = 0; mask < 1 << 16; mask++) {
    const p = Int32Array.from({ length: 16 }, (_, i) => (mask >> i) & 1)
    brute = Math.max(brute, modularity(g, p))
  }
  check('F1: the best split equals a brute force over all 2¹⁶ two-group splits', near(best.Q, brute, 1e-12), `${f4(best.Q)} ${f4(brute)}`)
  results.f1 = { start: modularity(g, F1_START), startTerms: modularityTerms(g, F1_START), best: best.Q, bestTerms: modularityTerms(g, best.partition), L: g.A.length }
  info(`F1: ${g.A.length} links; start Q ${f3(results.f1.start)} (inside ${f3(results.f1.startTerms.inside)}, expected ${f3(results.f1.startTerms.expected)}); best Q ${f3(best.Q)} (inside ${f3(results.f1.bestTerms.inside)}, expected ${f3(results.f1.bestTerms.expected)})`)
  check('F1: the start is below the best split', results.f1.start < best.Q - 0.01)
  const curve = ringCurve(5)
  const cross = curve.find((p) => p.pairs > p.one)
  check('F2: with s = 5 the pairs first win at n = 24 (tie at 22)', cross.n === 24 && near(curve.find((p) => p.n === 22).pairs, curve.find((p) => p.n === 22).one, 1e-12))
  check('F2: n runs over the even values 6–40', curve.length === 18 && curve[0].n === 6 && curve[17].n === 40)
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (!only) {
    const lectureEn = readFileSync(new URL('src/content/network-lab/communities.en.md', root), 'utf8')
    const lectureIt = readFileSync(new URL('src/content/network-lab/communities.it.md', root), 'utf8')
    const mod = await import('../../src/components/lab/network/communities/texts.js')
    const pageText = [JSON.stringify(mod.observe), JSON.stringify(mod.exercises)].join(' ')
    const enOf = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
    const quoted = (name, phrases, where = pageText) => {
      const missing = phrases.filter((p) => !where.includes(p))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.join(' | '))
    }
    const K = results.karate
    const sw = results.sweepA
    const at = (k) => sw.find((r) => r.kOut === k)
    const R = results.randomQ
    const sc = results.sweepC
    const sx = (x) => sc.find((r) => r.x === x)
    const V = results.views
    const B = results.panelB
    const big = results.ring60
    const C = results.panelC
    const S = results.sparse
    // observe and exercises
    quoted('Panel A, default', [`planted partition gives Q = ${enOf(V.gn_louvain.qPlanted, 3)}`, `Louvain finds ${V.gn_louvain.groups} groups with Q = ${enOf(V.gn_louvain.qFound, 3)} and NMI ${enOf(V.gn_louvain.nmi, 3)}`])
    quoted('Panel A, sweep', [`Louvain stays above 0.95 up to k_out = 6 (${[5, 6].map((k) => enOf(at(k).louvain, 3)).join(' and ')} at 5 and 6), then falls: ${[7, 8, 9].map((k) => enOf(at(k).louvain, 3)).join(', ')} at k_out = 7, 8, 9`, `Label propagation gives way earlier: ${[4, 5, 6, 7].map((k) => enOf(at(k).lp, 3)).join(', ')} at k_out = 4, 5, 6, 7`])
    quoted('Panel A, random', [`Q = ${R.map((x) => enOf(x.Q, 3)).join(', ')}`, `with ${R.map((x) => Math.round(x.groups)).join(', ')} groups`, `the random network of the panel, Louvain finds Q = ${enOf(V.random_louvain.qFound, 3)}`])
    quoted('Panel A, karate', [`the factions give Q = ${enOf(K.factions, 3)}`, `Louvain with seed 1 finds ${V.karate_louvain.groups} groups and Q = ${enOf(V.karate_louvain.qFound, 3)}`, `NMI with the factions is ${enOf(V.karate_louvain.nmi, 3)}`])
    quoted('Panel B', [`each clique alone gives Q = ${enOf(B.qOne, 4)} and pairs ${enOf(B.qPairs, 4)}`, `Louvain finds ${B.report.groups} groups`, `Q = ${enOf(B.qFound, 4)}`, `between ${enOf(B.range.lo, 2)} and ${enOf(B.range.hi, 1)}`, `${enOf(big.qOne, 4)} against ${enOf(big.qPairs, 4)} for pairs`, `Louvain reaches ${enOf(big.qFound, 4)} with ${big.report.groups} groups`])
    quoted('Panel C, default', [`overlap is ${enOf(C.overlap, 2)}`, `Louvain splits the same network into ${C.louvainGroups} groups`, `Q = ${enOf(C.louvainQ, 3)}`])
    quoted('Panel C, sweep', [`${[0, 0.6, 0.8, 1, 1.2, 1.5, 2, 3].map((x) => enOf(sx(x).overlap, 2)).join(', ')}`])
    quoted('Panel C, sparse', [`${[0.6, 1, 1.5].map((x) => S[x].louvainGroups).join(', ')} groups`, `Q of ${[0.6, 1, 1.5].map((x) => enOf(S[x].louvainQ, 2)).join(', ')}`, `NMI ${[0.6, 1, 1.5].map((x) => enOf(S[x].louvainNmi, 2)).join(', ')}`])
    quoted('Exercise 4', [`the factions give Q = ${enOf(K.factions, 4)}`, `Louvain's best over 100 seeds is ${enOf(K.best, 4)}, with four groups of ${results.karateSizes.slice(0, 3).join(', ')} and ${results.karateSizes[3]} members, reached by ${results.karateSeeds.hits} seeds`])
    quoted('Panel A, planted random', [`against ${enOf(V.random_louvain.qPlanted, 3).replace('-', '−')} for the four blocks of 32`, `Q = ${enOf(V.random_louvain.qFound, 3)} in ${V.random_louvain.groups} groups`])
    check('Panel A, random network: label propagation leaves one group', V.random_lp.groups === 1)
    check('Panel A, sweep: label propagation returns one label from k_out = 7 on (NMI below 0.01)', sw.filter((r) => r.kOut >= 7).every((r) => r.lp < 0.01))
    quoted('Exercise 5, label propagation', [`already at k_out = 6, μ = 0.375 (${enOf(at(6).lp, 2)})`, `the ${enOf(R[2].Q, 2)} is close to the 0.25`])
    quoted('Panel C, default numbers', [`c_in = ${enOf(C.cIn, 2)}, c_out = ${enOf(C.cOut, 2)}, ${enOf(100 * C.inside, 1)}% of the links inside`, `its NMI with the two planted groups is ${enOf(C.louvainNmi, 3)}`])
    check('Exercise 6: Louvain at c̄ = 3 returns between 550 and 580 groups, Q within 0.62–0.68, NMI ≤ 0.10', [0.6, 1, 1.5].every((x) => S[x].louvainGroups >= 550 && S[x].louvainGroups <= 580 && S[x].louvainQ > 0.62 && S[x].louvainQ < 0.68 && S[x].louvainNmi <= 0.105))
    quoted('Exercise 5', [`${[6, 7, 8, 9].map((k) => enOf(at(k).louvain, 2)).join(', ')} at k_out = 6, 7, 8, 9`, `${R.map((x) => enOf(x.Q, 2)).join(', ')}`])
    quoted('Exercise 6', [`${[0.6, 0.8, 1, 1.2, 1.5, 2].map((x) => enOf(sx(x).overlap, 2)).join(', ')} at 0.6, 0.8, 1.0, 1.2, 1.5, 2.0 times the threshold`])
    // lecture
    quoted('lecture, karate', [`the factions give Q = ${enOf(K.factions, 3)}`], lectureEn)
    quoted('lecture, random', [`Q = ${R.map((x) => enOf(x.Q, 2)).join(', ')} at mean degree 4, 8 and 16`], lectureEn)
    quoted('lecture, sweep C', [`${enOf(sx(0.6).overlap, 2)} at 0.6 times the threshold`, `${enOf(sx(2).overlap, 2)} at twice it`], lectureEn)
    quoted('lecture, benchmark', [`NMI ${enOf(at(6).louvain, 2)} at k_out = 6 and ${enOf(at(8).louvain, 2)} at k_out = 8`], lectureEn)
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
    check('lectures: no Bitcoin box in this module', ![lectureEn, lectureIt].some((x) => /bitcoin/i.test(x)))
  } else info('run the whole check to pin the texts')
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
