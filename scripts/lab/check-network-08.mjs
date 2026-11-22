// Self-checks for Network Lab module 08, "Who connects to whom". They run the
// same code as the page (mixing.js, experiments.js, figures.js) and compare it
// with brute force, closed forms and the answers of the exercises.
//
//   node scripts/lab/check-network-08.mjs [section]
//
// Sections: r, spearman, rewiring, growth, erased, richclub, robust, groups,
// exercises, figures, page. Exits with code 1 if any check fails. Lines
// starting with INFO report the numbers quoted in the lecture, the "what to
// observe" lists and the exercises; checks starting "quoted on the page" pin
// them. Run it whole: the section "page" uses the numbers of the others.
import { readFileSync } from 'node:fs'
import {
  pearsonR, spearmanRho, degreesOf, rewirer, rewire, isSimpleWithDegrees, paNetwork, erasedNetwork, poissonNetwork,
  structuralCutoff, richClub, richClubJob, RC_MIN_NODES, giantCurve, randomOrder, attackOrder, mixing, mixingFromMatrix,
  coleman, illusion, colourNodes, growGroups, seedOf, knnCurve, knnSlope, degreeSummary,
} from '../../src/components/lab/network/who-connects-to-whom/mixing.js'
import {
  drain, panelAJob, A_DEFAULT, sweepJob, SWEEP_SIZES, robustJob, B_DEFAULT, WIRINGS, RANDOM_AT, ATTACK_AT, groupsState,
  illusionState, C_DEFAULT, KNN_FROM,
} from '../../src/components/lab/network/who-connects-to-whom/experiments.js'
import { twoWirings, illusionFigure, havelHakimi, F2_DEGREES } from '../../src/components/lab/network/who-connects-to-whom/figures.js'
import { assortativity } from '../../src/components/lab/network/what-are-we-measuring/nullmodels.js'
import { spearman } from '../../src/components/lab/network/centrality/centrality.js'
import { naturalCutoff } from '../../src/components/lab/network/heavy-tails-done-right/zeta.js'
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
const near = (v, want, tol) => Math.abs(v - want) <= tol
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length
const net = (n, edges) => ({ n, A: Int32Array.from(edges, (e) => e[0]), B: Int32Array.from(edges, (e) => e[1]) })
export const results = {}

// brute force: the 2L ordered pairs of end degrees, and a plain Pearson
function endPairs(g) {
  const k = degreesOf(g)
  const x = []
  const y = []
  for (let e = 0; e < g.A.length; e++) {
    x.push(k[g.A[e]], k[g.B[e]])
    y.push(k[g.B[e]], k[g.A[e]])
  }
  return { x, y }
}
function pearson(x, y) {
  const mx = mean(x)
  const my = mean(y)
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my)
    sxx += (x[i] - mx) ** 2
    syy += (y[i] - my) ** 2
  }
  return sxy / Math.sqrt(sxx * syy)
}
// average ranks by sorting, ties given the mean of their positions
function avgRanks(x) {
  const idx = x.map((_, i) => i).sort((a, b) => x[a] - x[b])
  const r = new Array(x.length)
  for (let i = 0; i < idx.length; ) {
    let j = i
    while (j + 1 < idx.length && x[idx[j + 1]] === x[idx[i]]) j++
    for (let t = i; t <= j; t++) r[idx[t]] = (i + j) / 2 + 1
    i = j + 1
  }
  return r
}
const randomNets = () =>
  Array.from({ length: 20 }, (_, j) => {
    const s = seedOf(31, j)
    if (j % 3 === 0) return paNetwork(200 + 37 * j, 1 + (j % 4), s)
    if (j % 3 === 1) return erasedNetwork(300 + 20 * j, 2.1 + 0.07 * j, 1 + (j % 2), s)
    return poissonNetwork(150 + 10 * j, 2 + (j % 5), s)
  })

// ---------------------------------------------------------------- r

if (section('r')) {
  const star = net(5, [[0, 1], [0, 2], [0, 3], [0, 4]])
  const path = net(4, [[0, 1], [1, 2], [2, 3]])
  check('r: star with four leaves is −1', near(pearsonR(star), -1, 1e-12), String(pearsonR(star)))
  check('r: path of four nodes is −0.5', near(pearsonR(path), -0.5, 1e-12), String(pearsonR(path)))
  let worst = 0
  let worst02 = 0
  for (const g of randomNets()) {
    const { x, y } = endPairs(g)
    worst = Math.max(worst, Math.abs(pearsonR(g) - pearson(x, y)))
    worst02 = Math.max(worst02, Math.abs(pearsonR(g) - assortativity(g)))
  }
  check('r: agrees with a brute-force Pearson over the link ends on 20 random networks (within 1e-10)', worst < 1e-10, worst.toExponential(2))
  check("r: agrees with module 02's assortativity on the same 20 networks", worst02 < 1e-10, worst02.toExponential(2))
}

// ---------------------------------------------------------------- spearman

if (section('spearman')) {
  let worst = 0
  let worst03 = 0
  for (const g of randomNets()) {
    const { x, y } = endPairs(g)
    const direct = pearson(avgRanks(x), avgRanks(y))
    worst = Math.max(worst, Math.abs(spearmanRho(g) - direct))
    worst03 = Math.max(worst03, Math.abs(spearmanRho(g) - spearman(Float64Array.from(x), Float64Array.from(y))))
  }
  check('Spearman ρ: agrees with ranks computed by sorting, ties averaged, on 20 random networks (within 1e-10)', worst < 1e-10, worst.toExponential(2))
  check("Spearman ρ: agrees with module 03's spearman on the same pairs", worst03 < 1e-9, worst03.toExponential(2))
  const star = net(5, [[0, 1], [0, 2], [0, 3], [0, 4]])
  check('Spearman ρ: star with four leaves is −1', near(spearmanRho(star), -1, 1e-12))
}

// ---------------------------------------------------------------- rewiring

if (section('rewiring')) {
  for (const [mode, p] of [['assortative', 1], ['disassortative', 1], ['assortative', 0.5], ['random', 0]]) {
    const g = paNetwork(200, 2, 77)
    const k = degreesOf(g)
    const rw = rewirer(g, mulberry32(5))
    let ok = true
    for (let i = 0; i < 3000 && ok; i++) {
      rw.step(mode, p)
      ok = isSimpleWithDegrees(rw.net, k)
    }
    check(`rewiring (${mode}, p = ${p}): degrees unchanged, no self-link, no repeated link after each of 3,000 steps`, ok, `${rw.accepted} accepted of ${rw.attempts}`)
  }
  const g = paNetwork(10000, 2, 4242)
  const ps = [0, 0.25, 0.5, 0.75, 1]
  const rows = {}
  for (const mode of ['assortative', 'disassortative']) rows[mode] = ps.map((p) => {
    const w = rewire(g, { mode, p, swaps: 10, seed: 5 })
    return { r: pearsonR(w), rho: spearmanRho(w) }
  })
  info(`rewiring PA 10,000, 10 swaps per link, p = ${ps.join(', ')}: assortative r ${rows.assortative.map((x) => f3(x.r)).join(', ')}, ρ ${rows.assortative.map((x) => f3(x.rho)).join(', ')}`)
  info(`  disassortative r ${rows.disassortative.map((x) => f3(x.r)).join(', ')}, ρ ${rows.disassortative.map((x) => f3(x.rho)).join(', ')}`)
  const up = (a) => a.every((x, i) => i === 0 || x > a[i - 1])
  check('rewiring: r and ρ increase with p towards assortative', up(rows.assortative.map((x) => x.r)) && up(rows.assortative.map((x) => x.rho)))
  check('rewiring: r and ρ decrease with p towards disassortative', up(rows.disassortative.map((x) => -x.r)) && up(rows.disassortative.map((x) => -x.rho)))
}

// ---------------------------------------------------------------- growth

if (section('growth')) {
  const sw = drain(sweepJob({ source: 'pa', gamma: 2.5 }))
  results.sweepPA = sw
  const want = [-0.09, -0.04, -0.02]
  sw.rows.forEach((row, i) => {
    info(`PA m = 2, N = ${row.N}: r ${row.r.map(f3).join(', ')} (mean ${f3(row.rMean)}), ρ ${row.rho.map(f3).join(', ')} (mean ${f3(row.rhoMean)})`)
    check(`PA, N = ${row.N.toLocaleString('en-US')}: r of each seed within 0.03 of ${want[i]} (expected)`, row.r.every((v) => near(v, want[i], 0.03)))
    // at 1,000 nodes ρ swings more: twelve other seeds gave −0.261 to −0.329, so the limit there is 0.04
    const tol = row.N === 1000 ? 0.04 : 0.03
    check(`PA, N = ${row.N.toLocaleString('en-US')}: ρ of each seed within ${tol} of −0.30 (expected ± 0.03; ± 0.04 at 1,000 from twelve seeds)`, row.rho.every((v) => near(v, -0.3, tol)))
  })
  check('PA: |r| shrinks with N while ρ does not (means)', Math.abs(sw.rows[0].rMean) > Math.abs(sw.rows[1].rMean) && Math.abs(sw.rows[1].rMean) > Math.abs(sw.rows[2].rMean) && sw.rows.every((r) => r.rhoMean < -0.25))
  // ten more seeds at 100,000, for the record
  const r10 = []
  const rho10 = []
  for (let s = 0; s < 10; s++) {
    const g = paNetwork(100000, 2, seedOf(999, s))
    r10.push(pearsonR(g))
    rho10.push(spearmanRho(g))
  }
  info(`PA 100,000, ten other seeds: r ${f3(Math.min(...r10))} to ${f3(Math.max(...r10))}, ρ ${f3(Math.min(...rho10))} to ${f3(Math.max(...rho10))}`)
  const rho1k = Array.from({ length: 12 }, (_, s) => spearmanRho(paNetwork(1000, 2, 5000 + s)))
  info(`PA 1,000, twelve other seeds: ρ ${f3(Math.min(...rho1k))} to ${f3(Math.max(...rho1k))}`)
  check('PA 1,000, twelve other seeds: ρ within 0.04 of −0.30', rho1k.every((v) => near(v, -0.3, 0.04)))
}

// ---------------------------------------------------------------- erased

if (section('erased')) {
  const sw = drain(sweepJob({ source: 'power', gamma: 2.2 }))
  results.sweep22 = sw
  for (const row of sw.rows) info(`erased CM γ = 2.2, N = ${row.N}: r ${row.r.map(f3).join(', ')} (mean ${f3(row.rMean)}), ρ ${row.rho.map(f3).join(', ')} (mean ${f3(row.rhoMean)})`)
  const at10 = sw.rows[1]
  check('erased CM γ = 2.2, 10,000 nodes: mean r and mean ρ of the three seeds below −0.1 (expected −0.13 and −0.14)', at10.rMean < -0.1 && at10.rhoMean < -0.1, `${f3(at10.rMean)} ${f3(at10.rhoMean)}`)
  // the spread over ten more seeds
  const r10 = []
  const rho10 = []
  for (let s = 0; s < 10; s++) {
    const g = erasedNetwork(10000, 2.2, 2, seedOf(777, s))
    r10.push(pearsonR(g))
    rho10.push(spearmanRho(g))
  }
  info(`erased CM γ = 2.2, 10,000, ten other seeds: r ${r10.map(f2).join(' ')}; ρ ${rho10.map(f2).join(' ')}`)
  check('erased CM γ = 2.2, 10,000, ten other seeds: every r and ρ below 0 and their means below −0.1', [...r10, ...rho10].every((v) => v < 0) && mean(r10) < -0.1 && mean(rho10) < -0.1, `${f3(mean(r10))} ${f3(mean(rho10))}`)
  const sw3 = drain(sweepJob({ source: 'power', gamma: 3 }))
  results.sweep3 = sw3
  for (const row of sw3.rows) info(`erased CM γ = 3, N = ${row.N}: r ${row.r.map(f3).join(', ')}, ρ ${row.rho.map(f3).join(', ')}`)
  check('erased CM γ = 3, 10,000 nodes: |r| below 0.05 for each seed', sw3.rows[1].r.every((v) => Math.abs(v) < 0.05))
  const poi = drain(sweepJob({ source: 'poisson', gamma: 2.5 }))
  results.sweepPoisson = poi
  info(`Poisson ⟨k⟩ = 4: r means ${poi.rows.map((r) => f3(r.rMean)).join(', ')}, ρ means ${poi.rows.map((r) => f3(r.rhoMean)).join(', ')}`)
  check('Poisson: |r| and |ρ| below 0.02 at 10,000 and 100,000 nodes', poi.rows.slice(1).every((r) => Math.abs(r.rMean) < 0.02 && Math.abs(r.rhoMean) < 0.02))
  // structural cutoff: the erased model loses links mostly between hubs
  const g = erasedNetwork(10000, 2.2, 2, seedOf(777, 0))
  const s = degreeSummary(g)
  info(`erased CM γ = 2.2, 10,000: ⟨k⟩ ${f2(s.k1)}, k_s ${f2(s.ks)}, largest degree ${s.max}, natural cutoff ${f2(naturalCutoff(10000, 2.2, 2))}`)
}

// ---------------------------------------------------------------- richclub

if (section('richclub')) {
  // A network drawn uniformly among the simple networks with its degrees (as the
  // swaps draw them) must give 1 within the noise; the erased configuration model
  // is a different null when the tail is heavy, and the check reports it.
  const zOf = (rc) => {
    const pts = rc.points.filter((p) => p.nodes >= 20 && p.sd > 0)
    return { pts, z: Math.max(...pts.map((p) => Math.abs(p.phi - p.rand) / p.sd)), ratio: Math.max(...pts.map((p) => Math.abs(p.ratio - 1))) }
  }
  const e25 = erasedNetwork(10000, 2.5, 2, 5)
  const nets = [
    ['Poisson ⟨k⟩ = 4', poissonNetwork(10000, 4, 5)],
    ['erased CM γ = 3', erasedNetwork(10000, 3, 2, 5)],
    ['the γ = 2.5 erased network after 40 swaps per link', rewire(e25, { mode: 'random', p: 0, swaps: 40, seed: 3 })],
  ]
  for (const [name, g] of nets) {
    const { pts, z, ratio } = zOf(drain(richClubJob(g, 11)))
    info(`rich club, ${name}, 10,000 nodes: ${pts.length} values of k with ≥ 20 nodes above; largest |ratio − 1| ${f3(ratio)}, largest |φ − mean| / sd ${f2(z)}`)
    check(`rich club, ${name}: the normalised coefficient is 1 within 3 sd of the randomisations wherever ≥ 20 nodes are above k`, z < 3)
  }
  {
    const { pts, z, ratio } = zOf(drain(richClubJob(e25, 11)))
    const top = pts[pts.length - 1]
    results.rcErased = { ratio, top }
    info(`rich club, erased CM γ = 2.5 itself: largest |ratio − 1| ${f3(ratio)}, largest z ${f2(z)}; at k = ${top.k} (${top.nodes} nodes above) ratio ${f2(top.ratio)}: erasing repeated links is not the swap null when the tail is heavy`)
  }
  // φ by hand on a small network: a triangle plus a pendant node
  const g = net(4, [[0, 1], [1, 2], [0, 2], [2, 3]])
  const rc = richClub(g)
  // degrees 2, 2, 3, 1: above 0 all four nodes (4 links of 6), above 1 nodes 0, 1, 2 (3 of 3), above 2 only node 2
  check('rich club: φ(0) = 4/6, φ(1) = 1, φ(2) undefined on a triangle with a pendant node', near(rc.phi[0], 4 / 6, 1e-12) && rc.phi[1] === 1 && Number.isNaN(rc.phi[2]))
  results.panelA = drain(panelAJob(A_DEFAULT))
  const a = results.panelA.stats
  info(`Panel A default (PA, 10,000, no rewiring): r ${f3(a.r)}, ρ ${f3(a.rho)}, k_s ${f2(a.ks)}, largest ${a.max}, ⟨k²⟩/⟨k⟩ ${f2(a.uncorrelated)}, k_nn slope from k = ${KNN_FROM} ${f3(a.slope)}`)
  const ratios = results.panelA.rc.points
  const at = (kk) => ratios.find((p) => p.k === kk)
  info(`Panel A default: rich-club ratio at k = 5, 10, 20, 40: ${[5, 10, 20, 40].map((kk) => (at(kk) ? f2(at(kk).ratio) : '–')).join(', ')}`)
  for (const mode of ['assortative', 'disassortative']) {
    const s = drain(panelAJob({ ...A_DEFAULT, mode, p: 1 }))
    results[`panelA_${mode}`] = s
    info(`Panel A, ${mode} p = 1: r ${f3(s.stats.r)}, ρ ${f3(s.stats.rho)}, k_nn slope ${f3(s.stats.slope)}, ratio at 10, 20, 40: ${[10, 20, 40].map((kk) => { const p = s.rc.points.find((x) => x.k === kk); return p ? f2(p.ratio) : '–' }).join(', ')}`)
  }
  for (const gamma of [2.2, 2.5, 3]) {
    const s = drain(panelAJob({ ...A_DEFAULT, source: 'power', gamma }))
    results[`panelA_power${gamma}`] = s
    info(`Panel A, erased CM γ = ${gamma}, 10,000: r ${f3(s.stats.r)}, ρ ${f3(s.stats.rho)}, k_s ${f2(s.stats.ks)}, largest ${s.stats.max}, k_nn slope ${f3(s.stats.slope)}`)
  }
  const p = drain(panelAJob({ ...A_DEFAULT, source: 'poisson' }))
  results.panelA_poisson = p
  info(`Panel A, Poisson: r ${f3(p.stats.r)}, ρ ${f3(p.stats.rho)}, k_s ${f2(p.stats.ks)}, largest ${p.stats.max}`)
}

// ---------------------------------------------------------------- robust

if (section('robust')) {
  for (const src of ['pa', 'power']) {
    const t = Date.now()
    const s = drain(robustJob({ ...B_DEFAULT, source: src }))
    results[`robust_${src}`] = s
    info(`Panel B, ${src}, ${Date.now() - t} ms`)
    for (const id of WIRINGS) {
      const w = s.wirings[id]
      info(`  ${id}: r ${f3(w.r)}, ρ ${f3(w.rho)}; random ${RANDOM_AT.join('/')}: ${w.tableRandom.map(f3).join(', ')}; attack ${ATTACK_AT.join('/')}: ${w.tableAttack.map(f3).join(', ')}`)
    }
    check(`Panel B, ${src}: the three wirings keep the degrees and stay simple`, WIRINGS.every((id) => isSimpleWithDegrees(s.nets[id], s.k)))
    const W = s.wirings
    const rhoOrder = W.assortative.rho > W.neutral.rho && W.neutral.rho > W.disassortative.rho
    if (src === 'pa') check('Panel B, pa: r > 0 assortative, r < 0 disassortative, and ρ ordered assortative > neutral > disassortative', W.assortative.r > 0 && W.disassortative.r < 0 && rhoOrder)
    // with a power-law sequence (γ = 2.5) the hubs are above k_s, and even the
    // assortative wiring leaves r just below 0: the sign is checked on ρ, r reported
    else check('Panel B, power: ρ > 0 assortative, ρ < 0 disassortative, ordered; r ordered too', W.assortative.rho > 0 && W.disassortative.rho < 0 && rhoOrder && W.assortative.r > W.neutral.r && W.neutral.r > W.disassortative.r, `r ${f3(W.assortative.r)}, ${f3(W.neutral.r)}, ${f3(W.disassortative.r)}`)
  }
}

// ---------------------------------------------------------------- groups

if (section('groups')) {
  const s = groupsState(C_DEFAULT)
  results.groups = s
  info(`Panel C default (q = ${C_DEFAULT.q}, h = ${C_DEFAULT.h}): minority share ${f3(s.w[1])}; e ${s.e.flat().map(f3).join(' ')}; assortativity ${f3(s.assortativity)}; inside ${s.inside.map(f3).join(', ')}; Coleman ${s.coleman.map(f3).join(', ')}; degree r ${f3(s.r)}`)
  check('Panel C: the mixing matrix is symmetric and sums to 1', near(s.e[0][1], s.e[1][0], 1e-12) && near(s.e[0][0] + s.e[0][1] + s.e[1][0] + s.e[1][1], 1, 1e-12))
  const grid = {}
  for (const q of [0.05, 0.2, 0.5]) for (const h of [0, 0.5, 0.8, 1]) {
    const g = groupsState({ q, h })
    grid[`${q}_${h}`] = g
    info(`  q ${q}, h ${h}: minority ${f3(g.w[1])}, assortativity ${f3(g.assortativity)}, inside ${g.inside.map(f3).join(', ')}, Coleman ${g.coleman.map(f3).join(', ')}`)
  }
  results.groupsGrid = grid
  check('Panel C: h = 1 gives assortativity above 0.99 and h = 0 below −0.99', ['0.05', '0.2', '0.5'].every((q) => grid[`${q}_1`].assortativity > 0.99 && grid[`${q}_0`].assortativity < -0.99))
  const ill = {}
  for (const how of ['top', 'random']) for (const rewired of [false, true]) for (const share of [0.05, 0.1, 0.2]) {
    const x = illusionState(s.net, { share, how, rewired })
    ill[`${how}_${rewired}_${share}`] = x
  }
  results.illusion = ill
  for (const share of [0.05, 0.1, 0.2]) info(`  illusion, share ${share}: top ${f3(ill[`top_false_${share}`].majority)}, top rewired ${f3(ill[`top_true_${share}`].majority)}, random ${f3(ill[`random_false_${share}`].majority)}, random rewired ${f3(ill[`random_true_${share}`].majority)}; r rewired ${f3(ill[`top_true_${share}`].r)}`)
  check('Panel C: colouring the highest degrees shows a majority to more nodes than colouring at random, and the disassortative rewiring raises it', [0.05, 0.1, 0.2].every((sh) => ill[`top_false_${sh}`].majority > ill[`random_false_${sh}`].majority && ill[`top_true_${sh}`].majority > ill[`top_false_${sh}`].majority))
}

// ---------------------------------------------------------------- exercises

if (section('exercises')) {
  // 2: k_s and the natural cutoff
  check('Exercise 2: k_s = 2,000 for N = 10⁶, ⟨k⟩ = 4', near(structuralCutoff(4, 1e6), 2000, 1e-9))
  check('Exercise 2: natural cutoff 20,000 at γ = 2.5 and 2,000 at γ = 3 (k_min = 2)', near(naturalCutoff(1e6, 2.5, 2), 20000, 1e-6) && near(naturalCutoff(1e6, 3, 2), 2000, 1e-9))
  // 3: the mixing matrix
  const e = [[0.64, 0.06], [0.06, 0.24]]
  const m3 = mixingFromMatrix(e, [0.7, 0.3])
  check('Exercise 3: r = 0.30/0.42 = 0.714', near(m3.assortativity, 0.3 / 0.42, 1e-12) && f3(m3.assortativity) === '0.714', String(m3.assortativity))
  check("Exercise 3: 91.4% of A's links stay in A; Coleman 0.714 for both groups", f3(m3.inside[0]) === '0.914' && f3(m3.coleman[0]) === '0.714' && f3(m3.coleman[1]) === '0.714')
  check('Exercise 3: e_AA = 0.64, e_BB = 0.24, e_AB = e_BA = 0.06 from 700 A, 300 B, ten friends each, 80% of B in B', near(0.3 * 0.8, 0.24, 1e-12) && near(0.3 * 0.2, 0.06, 1e-12) && near(0.7 - 0.06, 0.64, 1e-12))
  check("Coleman's index: 0 at chance, 1 all inside, −1 none inside", coleman(0.3, 0.3) === 0 && coleman(1, 0.3) === 1 && coleman(0, 0.3) === -1)
  // 4: the star and K2,4
  const star = net(6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]])
  const s4 = illusion(star, Uint8Array.from([1, 0, 0, 0, 0, 0]))
  check('Exercise 4: star with five leaves, centre coloured: 1/6 coloured, 5/6 see a coloured majority', near(s4.coloured, 1 / 6, 1e-12) && near(s4.majority, 5 / 6, 1e-12))
  const k24 = net(6, [0, 1].flatMap((c) => [2, 3, 4, 5].map((u) => [c, u])))
  const i24 = illusion(k24, Uint8Array.from([1, 1, 0, 0, 0, 0]))
  const allSee = [2, 3, 4, 5].every((v) => i24.seen[v] === i24.k[v])
  check('Exercise 4: K2,4 with the two centres coloured: every uncoloured node sees only coloured neighbours (1/3 coloured, 4/6 see a majority)', allSee && near(i24.coloured, 1 / 3, 1e-12) && near(i24.majority, 4 / 6, 1e-12))
  // 1 again, from the exercise's own statement
  check('Exercise 1: −1 and −0.5', near(pearsonR(net(5, [[0, 1], [0, 2], [0, 3], [0, 4]])), -1, 1e-12) && near(pearsonR(net(4, [[0, 1], [1, 2], [2, 3]])), -0.5, 1e-12))
}

// ---------------------------------------------------------------- figures

if (section('figures')) {
  const hh = havelHakimi(F2_DEGREES)
  check('F2: Havel–Hakimi builds the degree sequence exactly, simple', hh && isSimpleWithDegrees(hh, Int32Array.from(F2_DEGREES)))
  check('Havel–Hakimi: refuses a sequence that is not graphical (3, 3, 1, 1)', havelHakimi([3, 3, 1, 1]) === null)
  const deals = Array.from({ length: 10 }, (_, j) => twoWirings(j))
  const same = deals.every((d) => isSimpleWithDegrees(d.assortative.net, d.deg) && isSimpleWithDegrees(d.disassortative.net, d.deg))
  check('F1: in ten deals both wirings keep the degree sequence and stay simple', same)
  check('F1: in ten deals r and ρ are higher in the assortative wiring than in the disassortative one', deals.every((d) => d.assortative.r > d.disassortative.r && d.assortative.rho > d.disassortative.rho))
  info(`F1, first deal: assortative r ${f2(deals[0].assortative.r)}, ρ ${f2(deals[0].assortative.rho)}; disassortative r ${f2(deals[0].disassortative.r)}, ρ ${f2(deals[0].disassortative.rho)}`)
  info(`F1, ten deals: assortative r ${deals.map((d) => f2(d.assortative.r)).join(' ')}; disassortative r ${deals.map((d) => f2(d.disassortative.r)).join(' ')}`)
  const F = illusionFigure()
  results.F2 = F
  const cnt = (x) => Math.round(x.majority * 20)
  info(`F2: disassortative r ${f3(F.disassortative.r)}, ${cnt(F.disassortative)} of 20 see a coloured majority; neutral r ${f3(F.neutral.r)}, ${cnt(F.neutral)} of 20`)
  check('F2: 3 of 20 coloured, and more nodes see a coloured majority in the disassortative wiring', near(F.disassortative.coloured, 0.15, 1e-12) && cnt(F.disassortative) > cnt(F.neutral))
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (!only) {
    const texts = readFileSync(new URL('../../src/components/lab/network/who-connects-to-whom/texts.js', import.meta.url), 'utf8')
    const lectureEn = readFileSync(new URL('../../src/content/network-lab/who-connects-to-whom.en.md', import.meta.url), 'utf8')
    const lectureIt = readFileSync(new URL('../../src/content/network-lab/who-connects-to-whom.it.md', import.meta.url), 'utf8')
    // the page formats with toLocaleString; so do these checks
    // the texts write the minus sign as −, the page as -
    const en = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, '−')
    const int = (v) => Math.round(v).toLocaleString('en-US')
    const pc = (v) => `${en(100 * v, 1)}%`
    const pc0 = (v) => `${Math.round(100 * v)}%`
    const and = (list) => list.join(', ').replace(/, ([^,]*)$/, ' and $1')
    const quoted = (name, strings, where = texts) => {
      const missing = strings.filter((x) => !where.includes(x))
      check(`quoted on the page — ${name}`, missing.length === 0, missing.length ? `not in the text: ${missing.join(' | ')}` : strings.join(' | '))
    }
    const A = results.panelA.stats
    const rcAt = (st, kk) => st.rc.points.find((x) => x.k === kk).ratio
    const ratios = [5, 10, 20, 40].map((kk) => en(rcAt(results.panelA, kk), 2))
    const sw = results.sweepPA.rows
    const s22 = results.sweep22.rows
    const P22 = results['panelA_power2.2'].stats
    const P3 = results.panelA_power3.stats
    const As = results.panelA_assortative
    const Ds = results.panelA_disassortative
    quoted('Panel A, as built', [`r = ${en(A.r, 3)} and ρ = ${en(A.rho, 3)}`, `falls with slope ${en(A.slope, 2)} from k = 3`, `The largest degree, ${A.max}, is just under k_s = ${int(A.ks)}`])
    quoted('Panel A, Grow N', [`from ${en(sw[0].rMean, 3)} at 1,000 nodes to ${en(sw[1].rMean, 3)} at 10,000 and ${en(sw[2].rMean, 3)} at 100,000; ρ stays at ${and(sw.map((r) => en(r.rhoMean, 3)))}`])
    quoted('Panel A, power law and Poisson', [`the largest degree is ${int(P22.max)}, far above k_s = ${int(P22.ks)}`, `r = ${en(P22.r, 3)} and ρ = ${en(P22.rho, 3)}`, `At γ = 3 the largest degree, ${P3.max}, is below k_s = ${int(P3.ks)}, and r = ${en(P3.r, 3)}`, `**Poisson**: r = ${en(results.panelA_poisson.stats.r, 3)}`])
    quoted('Panel A, rich club', [`the ratio to the randomisations is ${and(ratios)} at k = 5, 10, 20 and 40`, `the ratio is ${and([10, 20, 40].map((kk) => en(rcAt(As, kk), 2)))} at k = 10, 20 and 40`])
    check('Panel A, rich club: towards disassortative the ratio is 0 at k = 10, 20 and 40', [10, 20, 40].every((kk) => rcAt(Ds, kk) === 0))
    quoted('Panel A, p = 1', [`towards assortative ρ reaches ${en(As.stats.rho, 3)} and r only ${en(As.stats.r, 3)}; towards disassortative ρ = ${en(Ds.stats.rho, 3)} and r = ${en(Ds.stats.r, 3)}`, `The k_nn slope goes to ${en(As.stats.slope, 2)} and ${en(Ds.stats.slope, 2)}`])
    const p25 = results['panelA_power2.5']
    const top = p25.rc.points.filter((x) => x.nodes >= 20)
    const best = top.reduce((a, b) => (b.ratio > a.ratio ? b : a))
    quoted('Panel A, power law 2.5 rich club', [`the ratio climbs to ${en(best.ratio, 2)} for the ${best.nodes} nodes of highest degree`])
    // lecture
    quoted('lecture, Grow N', [`gives a mean r of ${en(sw[0].rMean, 3)}, ${en(sw[1].rMean, 3)} and ${en(sw[2].rMean, 3)} at 1,000, 10,000 and 100,000 nodes, while ρ stays at ${en(sw[0].rhoMean, 2)}, ${en(sw[1].rhoMean, 2)} and ${en(sw[2].rhoMean, 2)}`], lectureEn)
    quoted('lecture, structural cutoff', [`k_s is ${int(P22.ks)} and the largest degree ${int(P22.max)}; r is ${en(P22.r, 3)} and ρ ${en(P22.rho, 3)}. At γ = 3 the largest degree, ${P3.max}, stays below k_s and r is ${en(P3.r, 3)}`], lectureEn)
    check('lecture, structural cutoff: at γ = 3 the largest degree is below k_s', P3.max < P3.ks)
    quoted('lecture, rich club', [`gives a ratio of ${and(ratios)} at k = 5, 10, 20 and 40`], lectureEn)
    quoted('lecture, rewiring', [`reaches ρ = ${en(As.stats.rho, 3)} one way and ${en(Ds.stats.rho, 3)} the other, while r reaches only ${en(As.stats.r, 3)} and ${en(Ds.stats.r, 3)}`], lectureEn)
    // Panel B
    const B = results.robust_pa.wirings
    const Bp = results.robust_power.wirings
    const row = (w, key) => w[key].map((v) => en(v, 2)).join(', ')
    quoted('Panel B, r and ρ', [`reach r = ${en(B.assortative.r, 2)}, ${en(B.neutral.r, 2)} and ${en(B.disassortative.r, 2)}, and ρ = ${en(B.assortative.rho, 2)}, ${en(B.neutral.rho, 2)} and ${en(B.disassortative.rho, 2)}`])
    quoted('Panel B, attack', [`holds ${en(B.assortative.tableAttack[2], 2)} of the nodes in the assortative wiring, ${en(B.neutral.tableAttack[2], 2)} in the neutral one, ${en(B.disassortative.tableAttack[2], 2)} in the disassortative one`])
    quoted('Panel B, random', [`at 20% removed ${en(B.assortative.tableRandom[0], 2)}, ${en(B.neutral.tableRandom[0], 2)} and ${en(B.disassortative.tableRandom[0], 2)}; at 50%, ${en(B.assortative.tableRandom[1], 2)}, ${en(B.neutral.tableRandom[1], 2)} and ${en(B.disassortative.tableRandom[1], 2)}`])
    const cross = (a, b, from = 11) => {
      for (let i = from; i < a.length; i++) if (a[i][1] > b[i][1]) return i
      return null
    }
    const c1 = cross(B.assortative.random, B.disassortative.random)
    quoted('Panel B, crossing', [`passes the disassortative one only beyond ${c1}% removed`])
    const c2 = cross(B.neutral.random, B.disassortative.random, 1)
    check('Exercise 6: the disassortative giant is above the neutral one up to 65% removed and below it by 70%', c2 > 65 && c2 <= 70, String(c2))
    quoted('Panel B, power law', [`at ${en(Bp.assortative.r, 2)}, while ρ is ${en(Bp.assortative.rho, 2)}`, `${and(Bp.disassortative.tableAttack.map((v) => en(v, 2)))} at 2%, 5% and 10% removed`])
    quoted('Exercise 6', [`assortative ${row(B.assortative, 'tableRandom')}; neutral ${row(B.neutral, 'tableRandom')}; disassortative ${row(B.disassortative, 'tableRandom')}`, `assortative ${row(B.assortative, 'tableAttack')}; neutral ${row(B.neutral, 'tableAttack')}; disassortative ${row(B.disassortative, 'tableAttack')}`, `keeps ${pc0(B.assortative.tableAttack[2])} of its nodes together with the top 10% of degrees gone, the disassortative one ${pc0(B.disassortative.tableAttack[2])}`])
    quoted('lecture, robustness', [`leaves ${pc0(B.assortative.tableAttack[2])} of the nodes in the largest component of the assortative wiring, ${pc0(B.neutral.tableAttack[2])} of the neutral one and ${pc0(B.disassortative.tableAttack[2])} of the disassortative one`, `the assortative giant holds ${pc0(B.assortative.tableRandom[0])}, against ${pc0(B.neutral.tableRandom[0])} and ${pc0(B.disassortative.tableRandom[0])}`], lectureEn)
    // Panel C
    const G = results.groups
    const gg = results.groupsGrid
    const ill = results.illusion
    quoted('Panel C, default', [`the minority is ${pc(G.w[1])} of the nodes, and the attribute assortativity is ${en(G.assortativity, 3)}`, `${pc(G.inside[0])} of the majority's links stay inside against ${pc(G.inside[1])} of the minority's`, `${en(G.coleman[0], 3)} and ${en(G.coleman[1], 3)}`])
    quoted('Panel C, q = 0.5 and h = 0', [`at h = 0.5 the assortativity is ${en(gg['0.5_0.5'].assortativity, 3)}`, `at h = 0.8 it is ${en(gg['0.5_0.8'].assortativity, 3)}, with ${pc(gg['0.5_0.8'].inside[0])} and ${pc(gg['0.5_0.8'].inside[1])} of the links inside`, `the assortativity is ${en(gg['0.2_0'].assortativity, 3)}`])
    check('Panel C, q = 0.5, h = 0.8: the two groups keep shares inside within 1 point', Math.abs(gg['0.5_0.8'].inside[0] - gg['0.5_0.8'].inside[1]) < 0.01)
    quoted('Panel C, q = 0.05', [`keeps only ${pc(gg['0.05_0.8'].inside[1])} of its links inside, Coleman ${en(gg['0.05_0.8'].coleman[1], 3)}, and the majority's index is ${en(gg['0.05_0.8'].coleman[0], 3)}`])
    const sh = [0.05, 0.1, 0.2]
    quoted('Panel C, illusion', [`seen by ${and(sh.map((x) => pc(ill[`top_false_${x}`].majority)))} of the nodes`, `at random: ${and(sh.map((x) => pc(ill[`random_false_${x}`].majority)))}`, `the same coloured nodes: ${and(sh.map((x) => pc(ill[`top_true_${x}`].majority)))}`])
    quoted('lecture, illusion and groups', [`shows a coloured majority to ${pc(ill['top_false_0.1'].majority)} of the nodes; rewired towards disassortative with the same degrees, to ${pc(ill['top_true_0.1'].majority)}`, `stay inside only ${pc(G.inside[1])} of the time, against ${pc(G.inside[0])} for the majority`], lectureEn)
    // exercise 5
    quoted('Exercise 5', [`r ${sw.map((r) => en(r.rMean, 3)).join(', ')}; ρ ${sw.map((r) => en(r.rhoMean, 3)).join(', ')}`, `r ${s22.map((r) => en(r.rMean, 3)).join(', ')}; ρ ${s22.map((r) => en(r.rhoMean, 3)).join(', ')}`])
    // the two lectures, and the Italian texts, carry the same numbers
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    const body = (text) => text.split('<!-- simulation -->')[0]
    check('quoted on the page — the two lectures carry the same numbers', numbers(body(lectureEn)) === numbers(body(lectureIt)))
    const mod = await import('../../src/components/lab/network/who-connects-to-whom/texts.js')
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
