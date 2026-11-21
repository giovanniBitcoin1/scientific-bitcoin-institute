// Self-checks for Network Lab module 06, "Growth mechanisms". They run the
// same code as the page (growth.js, kernel.js, experiments.js, figures.js)
// and compare it with exact distributions, the mean-field approximation and
// the answers of the exercises.
//
//   node scripts/lab/check-network-06.mjs [section]
//
// Sections: sampler, exact, meanfield, nonlinear, copying, local, optimisation,
// kernel, exercises, page. Exits with code 1 if any check fails. Lines starting
// with INFO report the numbers quoted in the lecture, the "what to observe"
// lists and the exercises; checks starting "quoted on the page" pin them.
import { readFileSync } from 'node:fs'
import { mulberry32 } from '../../src/components/lab/rng.js'
import {
  Fenwick, growKernel, growLinkSelection, growCopying, growRandomWalk, growOptimisation,
  priceDistribution, offsetDistribution, uniformDistribution, degreeShares, hubStats,
} from '../../src/components/lab/network/growth-mechanisms/growth.js'
import { kernelTable, kernelMLE, measure } from '../../src/components/lab/network/growth-mechanisms/kernel.js'
import {
  historyRun, historyJob, HISTORY_DEFAULT, mechanism, MECH_DEFAULT, kernelRun, kernelJob, KERNEL_DEFAULT, seedOf,
} from '../../src/components/lab/network/growth-mechanisms/experiments.js'
import { hubShare, snapshots } from '../../src/components/lab/network/growth-mechanisms/figures.js'
import { tabulate, mleAt, fitRecipe } from '../../src/components/lab/network/heavy-tails-done-right/fit.js'

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
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length
const sd = (a) => Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1))
const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const drain = (job) => {
  for (const _ of job.iter);
  return job.snapshot()
}
export const results = {}

// ---------------------------------------------------------------- Sampler

if (section('sampler')) {
  const w = [1, 2, 3, 4, 10, 0, 5, 0.5]
  const F = new Fenwick(w.length)
  w.forEach((v, i) => F.set(i, v))
  const total = w.reduce((a, b) => a + b, 0)
  const random = mulberry32(61)
  const c = new Array(w.length).fill(0)
  for (let i = 0; i < 1e6; i++) c[F.draw(random)]++
  const rel = w.map((v, i) => (v ? c[i] / 1e6 / (v / total) - 1 : c[i]))
  check('sampler: 10⁶ draws on fixed weights, every frequency within 1% of its weight, and a zero weight never drawn', w.every((v, i) => (v ? Math.abs(rel[i]) <= 0.01 : c[i] === 0)), rel.map((x) => f4(x)).join(' '))
  // set to zero and back, as growKernel does
  F.set(4, 0)
  const c2 = new Array(w.length).fill(0)
  for (let i = 0; i < 2e5; i++) c2[F.draw(random)]++
  F.set(4, 10)
  check('sampler: a weight set to 0 is never drawn, and the total follows', c2[4] === 0 && near(F.total, total, 1e-9))
}

// ---------------------------------------------------------------- Exact distributions

if (section('exact')) {
  const want = { 0: [0.5, 0.2, 0.1, 0.0571], 2: [0.4286, 0.2143, 0.119, 0.0714], '-1': [0.6, 0.1714, 0.0762, 0.0416] }
  for (const A of [0, 2, -1]) {
    const ex = offsetDistribution(2, A, 10)
    check(`rate equation, m = 2, A = ${A}: p_2 … p_5 are the expected ${want[A].join(', ')}`, [2, 3, 4, 5].every((k, i) => near(ex[k], want[A][i], 5e-5)), [2, 3, 4, 5].map((k) => f4(ex[k])).join(' '))
    const net = growKernel({ N: 50000, m: 2, A, seed: 6010 })
    const P = degreeShares(net.deg)
    check(`linear kernel with offset A = ${A}, m = 2, N = 50,000: p_2 … p_5 within 0.005 of the rate equation`, [2, 3, 4, 5].every((k) => near(P[k], ex[k], 0.005)), [2, 3, 4, 5].map((k) => `${f4(P[k])}/${f4(ex[k])}`).join(' '))
  }
  const u = uniformDistribution(2, 10)
  const netU = growKernel({ N: 50000, m: 2, alpha: 0, seed: 6011 })
  const PU = degreeShares(netU.deg)
  check('uniform attachment, m = 2: p_k = (1/3)(2/3)^(k−2) = 0.3333, 0.2222, 0.1481, and N = 50,000 within 0.005', near(u[2], 1 / 3, 1e-12) && near(u[3], 2 / 9, 1e-12) && near(u[4], 4 / 27, 1e-12) && [2, 3, 4].every((k) => near(PU[k], u[k], 0.005)), [2, 3, 4].map((k) => `${f4(PU[k])}/${f4(u[k])}`).join(' '))
  // the tail exponent of the offset model, γ = 3 + A/m, from the exact ratios
  const ex = offsetDistribution(2, 2, 20000)
  const slope = Math.log(ex[20000] / ex[10000]) / Math.log(2)
  check('rate equation, A = 2, m = 2: the far tail falls as k^(−4) (γ = 3 + A/m)', near(-slope, 4, 0.01), f3(-slope))
}

// ---------------------------------------------------------------- Mean field

if (section('meanfield')) {
  const births = [100, 1000, 5000]
  const at = births.map(() => [])
  for (let s = 0; s < 100; s++) {
    const net = growKernel({ N: 10000, m: 2, seed: seedOf(6020, s) })
    births.forEach((t, i) => at[i].push(net.deg[t]))
  }
  const mf = births.map((t) => 2 * Math.sqrt(10000 / t))
  births.forEach((t, i) => info(`mean field, node ${t}: mean ${f2(mean(at[i]))}, sd ${f2(sd(at[i]))} over 100 networks; m (N/t_i)^(1/2) = ${f2(mf[i])}`))
  check('mean field, m = 2, N = 10,000, 100 networks: mean degree of the nodes born at steps 100, 1,000 and 5,000 within 15% of m (N/t_i)^(1/2)', births.every((_, i) => Math.abs(mean(at[i]) / mf[i] - 1) <= 0.15), births.map((_, i) => `${f2(mean(at[i]))}/${f2(mf[i])}`).join(' '))
  results.meanfield = { m100: mean(at[0]), sd100: sd(at[0]) }
  check('quoted on the page — exercise 1: node 100 has about 19 links on average over 100 networks, standard deviation about 12', Math.round(mean(at[0])) === 19 && Math.round(sd(at[0])) === 12, `${f2(mean(at[0]))} ± ${f2(sd(at[0]))}`)
  // the same with nine other sets of 100 networks: how far the mean of node 100 swings
  const others = []
  for (let b = 1; b <= 9; b++) {
    const v = []
    for (let s = 0; s < 100; s++) v.push(growKernel({ N: 10000, m: 2, seed: seedOf(6020 + b * 1000, s) }).deg[100])
    others.push(mean(v))
  }
  info(`mean field, node 100, nine other sets of 100 networks: means ${others.map(f2).join(', ')}`)
}

// ---------------------------------------------------------------- Nonlinear kernel

if (section('nonlinear')) {
  const out = {}
  for (const alpha of [0.5, 1, 1.5, 2]) {
    const runs = []
    for (let s = 0; s < 10; s++) {
      const net = growKernel({ N: 10000, m: 1, alpha, seed: seedOf(6030, s) })
      const h = hubStats(net.deg)
      runs.push({ share: h.share, hub: h.hub })
    }
    out[alpha] = runs
    info(`nonlinear, α = ${alpha}, m = 1, N = 10,000: share linked to the biggest hub ${runs.map((r) => `${(100 * r.share).toFixed(2)}%`).join(' ')}; its birth index ${runs.map((r) => r.hub).join(' ')}`)
  }
  const sh = (a) => out[a].map((r) => r.share)
  check('nonlinear, α = 0.5: the biggest hub is linked to less than 0.5% of the nodes in all 10 networks', sh(0.5).every((v) => v < 0.005), f4(Math.max(...sh(0.5))))
  check('nonlinear, α = 1: median share between 1% and 3%', median(sh(1)) >= 0.01 && median(sh(1)) <= 0.03, f4(median(sh(1))))
  check('nonlinear, α = 1.5: median share above 90%', median(sh(1.5)) > 0.9, f4(median(sh(1.5))))
  check('nonlinear, α = 2: at least 99% in 9 of 10', sh(2).filter((v) => v >= 0.99).length >= 9, `${sh(2).filter((v) => v >= 0.99).length} of 10`)
}

// ---------------------------------------------------------------- Copying

if (section('copying')) {
  const want = { 0.5: [0.5, 0.2, 0.1, 0.0571], 0.8: [0.3846, 0.2198, 0.1319, 0.0824] }
  for (const p of [0.5, 0.8]) {
    const a = (2 * p) / (1 - p)
    const ex = priceDistribution(2, a, 10)
    check(`Price's distribution, c = 2, p = ${p} (a = ${f2(a)}): p_0 … p_3 are the expected ${want[p].join(', ')}`, [0, 1, 2, 3].every((q) => near(ex[q], want[p][q], 5e-5)), [0, 1, 2, 3].map((q) => f4(ex[q])).join(' '))
    const net = growCopying({ N: 100000, m: 2, p, seed: 6040 })
    const P = degreeShares(net.inDeg)
    const gaps = Array.from({ length: 8 }, (_, q) => Math.abs(P[q] - ex[q]))
    check(`copying, N = 100,000, m = 2, p = ${p}: in-degree shares q = 0 … 7 within 0.005 of Price's`, gaps.every((g) => g <= 0.005), `largest gap ${f4(Math.max(...gaps))}; ${[0, 1, 2, 3].map((q) => `${f4(P[q])}/${f4(ex[q])}`).join(' ')}`)
  }
}

// ---------------------------------------------------------------- Link selection, random walk

if (section('local')) {
  const net = growLinkSelection({ N: 20000, m: 2, seed: 6050 })
  const k = kernelMLE(kernelTable(net, 16000))
  check('link selection, N = 20,000, m = 2: the kernel by maximum likelihood over the last fifth is within 0.05 of 1', near(k.alpha, 1, 0.05), `${f3(k.alpha)} ± ${f3(k.se)}`)
  // every link from a newer node to an older one, and the m links of a new node to m distinct nodes
  const distinct = (g) => {
    const seen = new Map()
    for (let e = 0; e < g.A.length; e++) {
      if (!(g.A[e] > g.B[e])) return false
      const key = `${g.A[e]}-${g.B[e]}`
      if (seen.has(key)) return false
      seen.set(key, 1)
    }
    return true
  }
  check('link selection and kernel growth: every link from a newer node to an older one, never twice', distinct(net) && distinct(growKernel({ N: 5000, m: 3, alpha: 2, seed: 6053 })))
  const w0 = growRandomWalk({ N: 20000, m: 2, steps: 0, seed: 6051 })
  const P = degreeShares(w0.deg)
  const u = uniformDistribution(2, 6)
  check('random walk with ℓ = 0 is uniform attachment: p_2 … p_4 within 0.005', [2, 3, 4].every((kk) => near(P[kk], u[kk], 0.005)), [2, 3, 4].map((kk) => `${f4(P[kk])}/${f4(u[kk])}`).join(' '))
  for (const steps of [1, 2, 6]) {
    const w = growRandomWalk({ N: 20000, m: 2, steps, seed: 6052 })
    info(`random walk, ℓ = ${steps}: kernel over the last fifth ${f3(kernelMLE(kernelTable(w, 16000)).alpha)}, largest degree ${hubStats(w.deg).max}`)
  }
}

// ---------------------------------------------------------------- Optimisation

if (section('optimisation')) {
  const stars = [0.5, 0.7].map((d) => growOptimisation({ N: 3000, delta: d, seed: 6060 }))
  check('optimisation, N = 3,000: δ = 0.5 and 0.7 give an exact star (every node linked to the root)', stars.every((s) => s.deg[0] === 2999))
  const rows = [1, 1.4, 1.5, 2, 4, 10, 100, 1000].map((d) => {
    const s = growOptimisation({ N: 3000, delta: d, seed: 6060 })
    return { d, root: s.deg[0], max: hubStats(s.deg).max }
  })
  info(`optimisation, N = 3,000: ${rows.map((r) => `δ = ${r.d}: root ${r.root}, largest ${r.max}`).join('; ')}`)
  const four = rows.findIndex((r) => r.d === 4)
  check('optimisation: the largest degree falls as δ grows from 4 to 1,000', rows.slice(four).every((r, i, a) => i === 0 || r.max <= a[i - 1].max), rows.slice(four).map((r) => r.max).join(' ≥ '))
  results.optimisation = rows
}

// ---------------------------------------------------------------- Kernel estimates

if (section('kernel')) {
  for (const alpha of [0.5, 1, 1.5]) {
    const s = drain(kernelJob({ source: 'kernel', alpha, N1: 5000, dN: 2000 }, 20))
    info(`kernel, α = ${alpha}, N1 = 5,000, ΔN = 2,000, 20 networks: maximum likelihood ${f3(s.mle.mean)} ± ${f3(s.mle.sd)} (${f3(s.mle.min)} … ${f3(s.mle.max)}); cumulative slope up to the last class of 10 nodes ${f3(s.cumulative.mean)} ± ${f3(s.cumulative.sd)}; over every class ${f3(s.cumulativeAll.mean)} ± ${f3(s.cumulativeAll.sd)}`)
    if (alpha !== 0.5) check(`kernel, α = ${alpha}: the mean of 20 maximum-likelihood estimates is within 0.03 of α`, near(s.mle.mean, alpha, 0.03), f3(s.mle.mean))
    else info(`kernel, α = 0.5: bias of maximum likelihood ${f3(s.mle.mean - 0.5)}`)
  }
}

// ---------------------------------------------------------------- Exercises 1 to 4

if (section('exercises')) {
  // 1. mean field, m = 2, N = 10,000
  const k100 = 2 * Math.sqrt(10000 / 100)
  const tReach = 2500 * (k100 / 2) ** 2
  const born = 10000 * (2 / 20) ** 2
  check('exercise 1: node 100 has degree 20; node 2,500 reaches it at 250,000 nodes; degree above 20 means born before step 100, 1% of the nodes; P(K > k) = (m/k)² differentiates to 2m²/k³', near(k100, 20, 1e-12) && near(tReach, 250000, 1e-6) && near(born, 100, 1e-9) && near(born / 10000, 0.01, 1e-12) && near(((2 / 20) ** 2 - (2 / 20.001) ** 2) / 0.001, (2 * 4) / 20 ** 3, 1e-6))
  // 2. exact CCDF of the linear model
  const m = 2
  const pk = (k) => (2 * m * (m + 1)) / (k * (k + 1) * (k + 2))
  let tail10 = 0
  for (let k = 10; k < 2e6; k++) tail10 += pk(k)
  const cc = (k) => (m * (m + 1)) / (k * (k + 1))
  check('exercise 2: P(K ≥ k) = m(m+1)/(k(k+1)): 0.0545 at k = 10 and 0.000594 at 100 (mean field 0.04 and 0.0004); the ratio tends to 1.5', near(tail10, cc(10), 1e-6) && f4(cc(10)) === '0.0545' && cc(100).toPrecision(3) === '0.000594' && near((m / 10) ** 2, 0.04, 1e-12) && near(cc(1e5) / (m / 1e5) ** 2, 1.5, 1e-4), `${f4(cc(10))} ${cc(100).toPrecision(3)} ratio at 10: ${f3(cc(10) / 0.04)}, at 100: ${f3(cc(100) / 0.0004)}`)
  check('quoted on the page — exercise 2: the mean field is low by a factor 1.36 at k = 10 and 1.49 at k = 100', f2(cc(10) / 0.04) === '1.36' && f2(cc(100) / 0.0004) === '1.49')
  const offset = offsetDistribution(2, 0, 10)
  check('exercise 2: the rate equation with A = 0 is 2m(m+1)/(k(k+1)(k+2))', [2, 3, 4, 5, 6].every((k) => near(offset[k], pk(k), 1e-12)))
  check('exercise 2 (c): γ = 3 + A/m with m = 2 gives 2.5 for A = −1 and 4 for A = 2', 3 + -1 / 2 === 2.5 && 3 + 2 / 2 === 4)
  // 3. the hub's share of the next link
  const shares = [0.5, 1, 1.5, 2].map((a) => hubShare(100, a))
  check('exercise 3: hub of 100, 1,000 nodes of 2: 0.007, 0.048, 0.26, 0.71', shares.map((s, i) => (i < 2 ? f3(s) : f2(s))).join(' ') === '0.007 0.048 0.26 0.71', shares.map((s) => s.toFixed(4)).join(' '))
  // 4. copying exponents
  const g = [0.2, 0.5, 0.8].map((p) => (2 - p) / (1 - p))
  check('exercise 4: (2 − p)/(1 − p) = 2.25, 3 and 6', near(g[0], 2.25, 1e-12) && near(g[1], 3, 1e-12) && near(g[2], 6, 1e-12))
  // and the rate: p/t + (1 − p) q/(m t) ∝ q + mp/(1 − p)
  const p = 0.5
  const t = 1000
  const rate = (q) => p / t + ((1 - p) * q) / (m * t)
  check('exercise 4: the rate p/t + (1 − p) q/(m t) is proportional to q + mp/(1 − p)', [0, 1, 5, 20].every((q) => near(rate(q) / rate(0), (q + (m * p) / (1 - p)) / ((m * p) / (1 - p)), 1e-12)))
  for (const pp of [0.5, 0.8]) {
    const big = growCopying({ N: 100000, m: 2, p: pp, seed: 6041 })
    const tab = tabulate(Array.from(big.inDeg).filter((q) => q >= 1))
    const at10 = mleAt(tab, tab.ks.indexOf(10))
    const rec = fitRecipe(tab)
    info(`exercise 4, copying p = ${pp}, N = 100,000: maximum likelihood above q = 10, ${f2(at10.gamma)} on ${at10.nTail} values; module-05 recipe k_min ${rec.kMin}, ${f2(rec.gamma)} ± ${f2(rec.se)} (theory ${f2((2 - pp) / (1 - pp))})`)
  }
}

// ---------------------------------------------------------------- What the page shows

if (section('page')) {
  const pct = (v) => `${(100 * v).toFixed(1)}%`
  // Panel A
  const runInfo = (label, params) => {
    const one = historyRun(params, 0)
    const s = drain(historyJob(params)).summary
    info(`Panel A, ${label}, run 1: largest degree ${one.max}, hub born ${one.hub + 1}, share ${pct(one.share)}, leader fixed from size ${one.settles}, leader at N/10 final ${one.leaderAtTenth === one.hub}`)
    info(`Panel A, ${label}, 20 runs: hub born median ${s.hubMedian + 1} (${s.hubMin + 1}–${s.hubMax + 1}); share median ${pct(s.shareMedian)} (${pct(s.shareMin)}–${pct(s.shareMax)}); first ten ${s.firstTen} of 20; same leader at N/10 ${s.sameLeader} of 20`)
    return { one, s }
  }
  results.A = {
    base: runInfo('α = 1, m = 2, N = 5,000', HISTORY_DEFAULT),
    a15: runInfo('α = 1.5', { ...HISTORY_DEFAULT, alpha: 1.5 }),
    a05: runInfo('α = 0.5', { ...HISTORY_DEFAULT, alpha: 0.5 }),
    big: runInfo('α = 1, N = 20,000', { ...HISTORY_DEFAULT, N: 20000 }),
    off: runInfo('α = 1, A = 3', { ...HISTORY_DEFAULT, A: 3 }),
  }
  // Panel B
  const mech = (label, id, params = {}) => {
    const r = mechanism(id, params)
    info(`Panel B, ${label}: N ${r.N}, largest ${r.max} (node ${r.hub + 1}), share ${pct(r.share)}, ⟨k²⟩/⟨k⟩ ${f2(r.ratio)}, kernel ${f3(r.kernel.alpha)} ± ${f3(r.kernel.se)}${r.tail ? `; tail: theory ${f2(r.tail.theory)}, ${r.tail.fit ? `recipe k_min ${r.tail.fit.kMin}, ${f2(r.tail.fit.gamma)} ± ${f2(r.tail.fit.se)} on ${r.tail.fit.nTail}` : 'no fit'}` : ''}`)
    return r
  }
  results.B = {}
  for (const id of ['linear', 'uniform', 'linkSelection', 'copying', 'walk', 'optimisation']) results.B[id] = mech(id, id)
  for (const p of [0, 0.2, 0.8, 0.95]) results.B[`copying${p}`] = mech(`copying, p = ${p}`, 'copying', { p })
  for (const steps of [0, 2, 3, 6]) results.B[`walk${steps}`] = mech(`walk, ℓ = ${steps}`, 'walk', { steps })
  for (const delta of [0.1, 1, 2, 4, 30, 100, 1000]) results.B[`opt${delta}`] = mech(`optimisation, δ = ${delta}`, 'optimisation', { delta })
  // Panel C
  const kern = (label, params) => {
    const r = kernelRun(params)
    const s = drain(kernelJob(params))
    info(`Panel C, ${label}: ${r.table.links} links; cumulative ${f3(r.cumulative.alpha)} (to k = ${r.cumulative.to}), every class ${f3(r.cumulative.alphaAll)} (to ${r.cumulative.toAll}); ML ${f3(r.mle.alpha)} ± ${f3(r.mle.se)}. 20 networks: cumulative ${f3(s.cumulative.mean)} ± ${f3(s.cumulative.sd)}, every class ${f3(s.cumulativeAll.mean)} ± ${f3(s.cumulativeAll.sd)}, ML ${f3(s.mle.mean)} ± ${f3(s.mle.sd)} (${f3(s.mle.min)} … ${f3(s.mle.max)})`)
    return { r, s }
  }
  results.C = { base: kern('default', KERNEL_DEFAULT) }
  for (const a of [0, 0.5, 1.5, 2]) results.C[`a${a}`] = kern(`α = ${a}`, { ...KERNEL_DEFAULT, alpha: a })
  for (const src of ['linkSelection', 'copying', 'walk', 'optimisation']) results.C[src] = kern(src, { ...KERNEL_DEFAULT, source: src })
  for (const a of [0.5, 1, 1.5]) results.C[`ex${a}`] = kern(`exercise 6, α = ${a}, N1 = 5,000, ΔN = 2,000`, { source: 'kernel', alpha: a, N1: 5000, dN: 2000 })
  for (const dN of [100, 500, 1000, 2000, 5000]) {
    const s = drain(kernelJob({ source: 'kernel', alpha: 1, N1: 5000, dN }))
    info(`Panel C, α = 1, N1 = 5,000, ΔN = ${dN}: mean standard error of ML ${f3(s.se.mean)}; spread of ML over 20 networks ${f3(s.mle.sd)}; mean ${f3(s.mle.mean)}`)
  }
  // ---- quoted on the page: every string below must appear in texts.js (EN)
  const texts = readFileSync(new URL('../../src/components/lab/network/growth-mechanisms/texts.js', import.meta.url), 'utf8')
  const en = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  const int = (v) => Math.round(v).toLocaleString('en-US')
  const P1 = (v) => `${en(100 * v, 1)}%`
  const quoted = (name, strings, where = texts) => {
    const missing = strings.filter((x) => !where.includes(x))
    check(`quoted on the page — ${name}`, missing.length === 0, missing.length ? `not in the text: ${missing.join(' | ')}` : strings.join(' | '))
  }
  const A = results.A
  quoted('Panel A, run 1', [`the very first node, with ${A.base.one.max} links`, `linked to ${P1(A.base.one.share)} of the network`, `from a size of ${A.base.one.settles} nodes`])
  check('Panel A, run 1: the hub is the first node and the leader at N/10 is the final one', A.base.one.hub === 0 && A.base.one.leaderAtTenth === A.base.one.hub)
  const S = A.base.s
  quoted('Panel A, 20 runs', [`in ${S.firstTen} of the 20 runs (median: the ${S.hubMedian + 1}nd node; range: 1st to ${S.hubMax + 1}th)`, `linked to ${P1(S.shareMedian)} of the nodes (from ${P1(S.shareMin)} to ${P1(S.shareMax)})`, `in ${S.sameLeader} of the 20 runs`])
  check('Panel A, 20 runs: the smallest birth order is the 1st node', S.hubMin === 0)
  quoted('Panel A, N = 20,000', [`median ${P1(A.big.s.shareMedian)}`, `Still ${A.big.s.firstTen} of 20 hubs among the first ten nodes`])
  quoted('Panel A, α = 1.5', [`linked to ${P1(A.a15.s.shareMedian)} of the nodes (median; from ${P1(A.a15.s.shareMin)} to ${P1(A.a15.s.shareMax)})`])
  check('Panel A, α = 1.5: among the first ten in all 20, same leader in all 20', A.a15.s.firstTen === 20 && A.a15.s.sameLeader === 20)
  quoted('Panel A, α = 0.5', [`the median share is ${P1(A.a05.s.shareMedian)}`, `the largest degree is ${A.a05.one.max}`, `(${A.a05.s.firstTen} of 20 among the first ten)`, `settled only at ${int(A.a05.one.settles)} nodes`, `in ${A.a05.s.sameLeader} runs of 20`])
  quoted('Panel A, A = 3', [`the largest degree is ${A.off.one.max}`])
  quoted('Exercise 5', [`in ${S.firstTen} runs of 20 and is linked to ${P1(S.shareMedian)} of the nodes (median; from ${P1(S.shareMin)} to ${P1(S.shareMax)})`, `linked to ${P1(A.a15.s.shareMedian)} of the nodes (from ${P1(A.a15.s.shareMin)} to ${P1(A.a15.s.shareMax)})`, `among the first ten in ${A.a05.s.firstTen} of 20 runs, but linked to only ${P1(A.a05.s.shareMedian)} (from ${P1(A.a05.s.shareMin)} to ${P1(A.a05.s.shareMax)})`])
  const B = results.B
  const kernTxt = (r) => `${en(r.kernel.alpha, 2)} ± ${en(r.kernel.se, 2)}`
  quoted('Panel B, reference and uniform', [`largest degree ${B.linear.max}, ⟨k²⟩/⟨k⟩ = ${en(B.linear.ratio, 1)}`, `last fifth of the growth is ${kernTxt(B.linear)}`, `the largest degree is ${B.uniform.max}, ⟨k²⟩/⟨k⟩ = ${en(B.uniform.ratio, 1)}, and the kernel is ${kernTxt(B.uniform)}`])
  quoted('Panel B, link selection', [`largest degree ${B.linkSelection.max}, ⟨k²⟩/⟨k⟩ = ${en(B.linkSelection.ratio, 1)}, kernel ${kernTxt(B.linkSelection)}`])
  const tail = (r) => `${en(r.tail.fit.gamma, 2)} ± ${en(r.tail.fit.se, 2)} from q = ${r.tail.fit.kMin}`
  quoted('Panel B, copying', [`the kernel is ${kernTxt(B.copying)}`, `the module-05 recipe gives ${tail(B.copying)}`, `the recipe ${tail(B['copying0.8'])}`, `2.25 against ${en(B['copying0.2'].tail.fit.gamma, 2)}`, `links from ${P1(B['copying0.2'].share)} of the others`])
  quoted('Exercise 4', [`the recipe gives ${tail(B.copying)} at p = 0.5 and ${tail(B['copying0.8'])} at p = 0.8`])
  quoted('Panel B, random walk', [`the kernel is ${en(B.walk.kernel.alpha, 2)}, above linear`, `linked to ${P1(B.walk.share)} of the network (${int(B.walk.max)} links)`, `${en(B.walk2.kernel.alpha, 2)} at ℓ = 2, ${en(B.walk3.kernel.alpha, 2)} at ℓ = 3, ${en(B.walk6.kernel.alpha, 2)} at ℓ = 6`, `(largest degree ${B.walk0.max})`, `the one-step walk (${en(B.walk.kernel.alpha, 2)})`])
  check('Panel B, optimisation at δ = 1: a star', B.opt1.max === B.opt1.N - 1)
  quoted('Panel B, optimisation', [`the root still takes ${P1(B.opt2.share).replace('.0%', '%')} of the nodes`, `at δ = 4 it takes ${P1(B.opt4.share)} (${int(B.opt4.max)} links)`, `At δ = 10 the largest degree is ${B.optimisation.max}`, `at δ = 100 it is ${B.opt100.max}, and at δ = 1,000 it is ${B.opt1000.max}, with ⟨k²⟩/⟨k⟩ = ${en(B.opt1000.ratio, 2)}`, `optimisation at δ = 10 (${en(B.optimisation.kernel.alpha, 2)})`])
  const C = results.C
  const sd2 = (s) => `${en(s.mean, 2)} ± ${en(s.sd, 2)}`
  quoted('Panel C, default', [`which make ${int(C.base.r.table.links)} links`, `up to k = ${C.base.r.cumulative.to} (the largest degree held by at least 10 nodes) gives ${en(C.base.r.cumulative.alpha, 2)}`, `up to k = ${C.base.r.cumulative.toAll}, gives ${en(C.base.r.cumulative.alphaAll, 2)}`, `maximum likelihood gives ${en(C.base.r.mle.alpha, 2)} ± ${en(C.base.r.mle.se, 2)}`])
  quoted('Panel C, 20 networks', [`cumulative ${sd2(C.base.s.cumulative)}, every class ${sd2(C.base.s.cumulativeAll)}, maximum likelihood ${sd2(C.base.s.mle)} (from ${en(C.base.s.mle.min, 2)} to ${en(C.base.s.mle.max, 2)})`])
  quoted('Panel C, α = 0.5, 0, 1.5', [`maximum likelihood ${sd2(C['a0.5'].s.mle)}, cumulative ${sd2(C['a0.5'].s.cumulative)}`, `still says ${en(C.a0.s.cumulative.mean, 2)}, maximum likelihood ${en(C.a0.s.mle.mean, 2)}`, `maximum likelihood ${sd2(C['a1.5'].s.mle)}`, `(${sd2(C['a1.5'].s.cumulative)})`])
  quoted('Panel C, sources', [`link selection ${sd2(C.linkSelection.s.mle)} and copying ${sd2(C.copying.s.mle)}`, `random walk ${sd2(C.walk.s.mle)}`, `δ = 10 ${sd2(C.optimisation.s.mle)}`])
  const ex = (a) => C[`ex${a}`].s
  quoted('Exercise 6', [`Maximum likelihood: ${en(ex(0.5).mle.mean, 2)}, ${en(ex(1).mle.mean, 2)} and ${en(ex(1.5).mle.mean, 2)}`, `${en(ex(0.5).cumulative.mean, 2)}, ${en(ex(1).cumulative.mean, 2)} and ${en(ex(1.5).cumulative.mean, 2)}, the last one with a spread of ${en(ex(1.5).cumulative.sd, 2)}`, `over every class: ${en(ex(0.5).cumulativeAll.mean, 2)}, ${en(ex(1).cumulativeAll.mean, 2)} and ${en(ex(1.5).cumulativeAll.mean, 2)}`])
  {
    const s100 = drain(kernelJob({ source: 'kernel', alpha: 1, N1: 5000, dN: 100 })).se.mean
    const need = 100 * (s100 / 0.05) ** 2
    const s170 = drain(kernelJob({ source: 'kernel', alpha: 1, N1: 5000, dN: 170 })).se.mean
    info(`exercise 6: mean standard error at ΔN = 100 is ${f3(s100)}; ΔN for 0.05: ${need.toFixed(0)}; at ΔN = 170 the mean standard error is ${f3(s170)}`)
    quoted('Exercise 6, standard error', [`${en(s100, 3)} with 100 new nodes`, `100 × (${en(s100, 3)}/0.05)² ≈ ${Math.round(need / 10) * 10} new nodes`])
    check('exercise 6: at ΔN = 170 the mean standard error is within 0.005 of 0.05', near(s170, 0.05, 0.005), f3(s170))
    const one = (dN) => kernelRun({ source: 'kernel', alpha: 1, N1: 5000, dN }).mle.se
    quoted('Panel C, the standard error as ΔN moves (one network, as the panel shows it)', [`${en(one(100), 2)} with 100 new nodes, ${en(one(1000), 2)} with 1,000, ${en(one(5000), 2)} with 5,000`])
  }
  {
    // the lecture
    const lectureEn = readFileSync(new URL('../../src/content/network-lab/growth-mechanisms.en.md', import.meta.url), 'utf8')
    const lectureIt = readFileSync(new URL('../../src/content/network-lab/growth-mechanisms.it.md', import.meta.url), 'utf8')
    const shares = [1, 1.5, 2].map((a) => hubShare(100, a))
    quoted('lecture: the hub of the figure', [`takes ${P1(shares[0])} of the next link when α = 1`, `At α = 1.5 it takes ${Math.round(100 * shares[1])}%, at α = 2 it takes ${Math.round(100 * shares[2])}%`], lectureEn)
    quoted('lecture: the kernel estimates on 20 networks', [`gives α = ${en(C.base.s.cumulative.mean, 2)} on average over 20 networks`, `fitted over every degree that occurs, ${en(C.base.s.cumulativeAll.mean, 2)}`, `gives ${sd2(C.base.s.mle)} on the same networks`], lectureEn)
    quoted('lecture: α = 1.5', [`the first simulation's biggest hub is linked to ${Math.round(100 * A.a15.s.shareMedian)}% of them`], lectureEn)
    quoted('lecture: the one-step walk', [`measures a kernel of ${en(B.walk.kernel.alpha, 2)}, above linear`], lectureEn)
    check('lecture: "a hub linked to a quarter of the network" (one-step walk)', Math.round(4 * B.walk.share) === 1, P1(B.walk.share))
    quoted('lecture: rerun history', [`one of the first ten nodes in ${S.firstTen} runs out of 20`, `still the leader at the end in ${S.sameLeader} runs`], lectureEn)
    check('lecture: optimisation measures a kernel above 1 (δ = 10)', B.optimisation.kernel.alpha > 1)
    quoted('lecture: mean field', ['ends with about 19 links on average, close to the mean-field 20, with a standard deviation of about 12'], lectureEn)
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    const body = (text) => text.split('<!-- simulation -->')[0]
    check('quoted on the page — the two lectures carry the same numbers', numbers(body(lectureEn)) === numbers(body(lectureIt)))
  }
  {
    // the Italian texts carry the same numbers as the English ones
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    const mod = await import('../../src/components/lab/network/growth-mechanisms/texts.js')
    const diff = []
    const pairs = [...Object.entries(mod.observe), ...mod.exercises.flatMap((e, i) => [[`exercise ${i + 1} statement`, e.statement], [`exercise ${i + 1} solution`, e.solution]])]
    for (const [name, v] of pairs) if (numbers(v.en) !== numbers(v.it)) diff.push(name)
    check('quoted on the page — the Italian "what to observe" lists and exercises carry the same numbers as the English ones', diff.length === 0, diff.join(', '))
  }
  // F2
  for (let k = 0; k < 3; k++) {
    const s = snapshots(k)
    info(`F2, sample ${k + 1}: ${s.table.links} links to old nodes; ${s.table.rows.map((r) => `k ${r.k}: ${r.nodes}/${r.gained}`).join(', ')}`)
  }
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
