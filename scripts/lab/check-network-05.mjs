// Self-checks for Network Lab module 05, "Heavy tails, done right".
// They run the same code as the page (zeta.js, configmodel.js, genfun.js,
// fit.js, sources.js) and compare it with exact values and with theory.
//
//   node scripts/lab/check-network-05.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets or the seeds change. Lines starting with INFO report the numbers
// quoted in the lecture, the "what to observe" lists and the exercises.
// It takes a few minutes: it runs several thousand bootstrap fits.
import { readFileSync } from 'node:fs'
import { mulberry32, randNormal } from '../../src/components/lab/rng.js'
import { barabasiAlbert, degrees } from '../../src/components/lab/graphUtils.js'
import {
  hurwitz, powerLaw, powerLawSampler, polylog, naturalCutoff, poissonLargest, distanceScale,
} from '../../src/components/lab/network/heavy-tails-done-right/zeta.js'
import {
  drawDegrees, poissonDraw, pairStubs, simplify, moments, expectedDefects, dialNetwork, dialJob, DIAL_DEFAULT, DIAL_SEED,
  EXP_SIZES, EXP_KINDS, EXP_RUNS,
} from '../../src/components/lab/network/heavy-tails-done-right/configmodel.js'
import {
  poissonFamily, onesFoursFamily, powerFamily, giant, solveU, iterate, POWER_THRESHOLD, networkGiantMean, NET_GRID, NET_RUNS, NET_N,
  theoryCurve, followDistributions, FAMILY_IDS,
} from '../../src/components/lab/network/heavy-tails-done-right/genfun.js'
import {
  tabulate, mleAt, mleGamma, shortcutGamma, fitRecipe, bootstrapP, bootstrapJob, compare, verdict, wrongWays, hill, hillPlot, vuong,
  powerCandidate, exponentialCandidate, lognormalCandidate, cutoffNorm, erfc, BOOT_DEFAULT, BOOT_SEED,
} from '../../src/components/lab/network/heavy-tails-done-right/fit.js'
import {
  SOURCES, SOURCE_IDS, MYSTERIES, drawSample, attachmentPmf, DEFAULT_N, TAIL_START, PA_M,
} from '../../src/components/lab/network/heavy-tails-done-right/sources.js'

const only = process.argv[2] // optional: run one section (zeta, cutoff, config, genfun, fit, page)
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
const q = (name, cond, detail = '') => check(`quoted on the page — ${name}`, cond, detail)
const median = (a) => {
  const s = [...a].sort((x, y) => x - y)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const meanOf = (a) => a.reduce((x, v) => x + v, 0) / a.length
const sdOf = (a) => {
  const m = meanOf(a)
  return Math.sqrt(a.reduce((x, v) => x + (v - m) ** 2, 0) / a.length)
}

// ---------------------------------------------------------------- Hurwitz zeta, the power law

if (section('zeta')) {
  check('ζ(2.5, 1) = 1.341487', near(hurwitz(2.5, 1), 1.341487, 5e-7), hurwitz(2.5, 1).toFixed(10))
  check('ζ(2.5, 2) = 0.341487', near(hurwitz(2.5, 2), 0.341487, 5e-7), hurwitz(2.5, 2).toFixed(10))
  check('ζ(3, 1) = 1.202057', near(hurwitz(3, 1), 1.202057, 5e-7), hurwitz(3, 1).toFixed(10))
  check('ζ(2) = π²/6 and ζ(4) = π⁴/90 to 1e-12', near(hurwitz(2, 1), Math.PI ** 2 / 6, 1e-12) && near(hurwitz(4, 1), Math.PI ** 4 / 90, 1e-12))
  {
    // against a plain sum with an integral tail, for awkward arguments
    let worst = 0
    for (const [s, qq] of [[1.2, 1], [2.1, 3], [3.7, 10], [1.05, 2], [6, 1], [2.5, 250]]) {
      let sum = 0
      const K = 2e6
      for (let k = 0; k < K; k++) sum += (k + qq) ** -s
      const a = K + qq
      sum += a ** (1 - s) / (s - 1) + a ** -s / 2 + (s * a ** (-s - 1)) / 12
      worst = Math.max(worst, Math.abs(hurwitz(s, qq) - sum) / sum)
    }
    check('Hurwitz zeta agrees with a two-million-term sum to 1e-10 (six arguments)', worst < 1e-10, worst.toExponential(1))
  }
  const pl = powerLaw(2.5, 1)
  check('pure power law, γ = 2.5 from k = 1: p_1 = 0.7454, p_2 = 0.1318, mean = ζ(1.5)/ζ(2.5) = 1.9474', near(pl.pmf(1), 0.7454, 5e-5) && near(pl.pmf(2), 0.1318, 5e-5) && near(pl.moment(1), 1.9474, 5e-5), `${f4(pl.pmf(1))} ${f4(pl.pmf(2))} ${f4(pl.moment(1))}`)
  check('its second moment diverges; cut at k = 464 it is finite', pl.moment(2) === Infinity && Number.isFinite(powerLaw(2.5, 1, 464).moment(2)))
  {
    const random = mulberry32(1)
    const draw = powerLawSampler(2.5, 1)
    const N = 1e6
    let c1 = 0
    let c2 = 0
    let big = 0
    let sum = 0
    for (let i = 0; i < N; i++) {
      const k = draw(random)
      if (k === 1) c1++
      else if (k === 2) c2++
      if (k > 2000) big++
      if (k <= 1000) sum += k
    }
    check('sampler, 10⁶ draws: p_1 and p_2 within 0.002', near(c1 / N, pl.pmf(1), 0.002) && near(c2 / N, pl.pmf(2), 0.002), `${f4(c1 / N)} ${f4(c2 / N)}`)
    const want = N * pl.sf(2001)
    check('sampler: the number of draws beyond the table (k > 2,000) is within four standard deviations of N·P(K > 2,000)', Math.abs(big - want) < 4 * Math.sqrt(want), `${big} against ${want.toFixed(1)}`)
  }
  {
    const random = mulberry32(2)
    const draw = powerLawSampler(2.2, 3, 50)
    let ok = true
    for (let i = 0; i < 1e5; i++) {
      const k = draw(random)
      if (k < 3 || k > 50) ok = false
    }
    check('sampler with k_min = 3 and k_max = 50 stays inside', ok)
  }
  check('polylog: Li_2(1/2) = π²/12 − ln²2/2, and Li_s(x) near x = 1 joins ζ(s)', near(polylog(2, 0.5), Math.PI ** 2 / 12 - Math.log(2) ** 2 / 2, 1e-12) && near(polylog(2.4, 1 - 1e-9), hurwitz(2.4, 1), 1e-6), `${polylog(2.4, 1 - 1e-9)} ${hurwitz(2.4, 1)}`)
}

// ---------------------------------------------------------------- Natural cutoff

if (section('cutoff')) {
  const c = (g, kMin = 1, N = 1e6) => naturalCutoff(N, g, kMin)
  check('natural cutoff, N = 10⁶, k_min = 1: 100, 1,000, 10,000 and about 285,000 for γ = 4, 3, 2.5, 2.1', near(c(4), 100, 1e-6) && near(c(3), 1000, 1e-6) && near(c(2.5), 10000, 1e-6) && Math.round(c(2.1) / 1000) === 285, `${c(2.1).toFixed(0)}`)
  const meanPL = powerLaw(2.5, 1).moment(1)
  info(`largest expected degree of a random network, N = 10⁶: ⟨k⟩ = ${f3(meanPL)} (γ = 2.5) → ${poissonLargest(1e6, meanPL)}; ⟨k⟩ = ${f3(powerLaw(3, 1).moment(1))} (γ = 3) → ${poissonLargest(1e6, powerLaw(3, 1).moment(1))}; ⟨k⟩ = ${f3(powerLaw(2.1, 1).moment(1))} (γ = 2.1) → ${poissonLargest(1e6, powerLaw(2.1, 1).moment(1))}`)
  q('"about a dozen": a random network of 10⁶ nodes with the mean degree of the γ = 2.5 law has a largest expected degree of 12', poissonLargest(1e6, meanPL) === 12)
  check('three decades of k need N = 10^(3(γ−1)): 10⁶ at γ = 3, 10⁹ at γ = 4', near(Math.log10(1000 ** (3 - 1)), 6, 1e-9) && near(Math.log10(1000 ** (4 - 1)), 9, 1e-9))
  const N = 1e9
  q('distances for N = 10⁹: ln N = 20.7, ln N / ln ln N = 6.8, ln ln N = 3.0', f2(distanceScale.above3(N)).startsWith('20.7') && distanceScale.at3(N).toFixed(1) === '6.8' && distanceScale.below3(N).toFixed(1) === '3.0', `${f2(distanceScale.above3(N))} ${f2(distanceScale.at3(N))} ${f2(distanceScale.below3(N))}`)
  // The largest of N values, drawn directly. The sampler inverts the
  // distribution function, k = F⁻¹(r), and P(max ≤ k) = F(k)^N, so the largest
  // of N draws is F⁻¹(u^(1/N)) for a single uniform u.
  const largestOf = (draw, N) => (random) => {
    const u = random()
    const r = 1 + Math.expm1(Math.log(u) / N) // u^(1/N), accurate near 1
    return draw(() => r)
  }
  {
    // The direct draw against N draws by brute force, N = 1,000, 1,000 samples
    // each: two-sample Kolmogorov–Smirnov distance below its 1% critical value.
    for (const g of [2.5, 3]) {
      const draw = powerLawSampler(g, 1)
      const r1 = mulberry32(7001)
      const r2 = mulberry32(7002)
      const big = largestOf(draw, 1000)
      const brute = []
      const direct = []
      for (let s = 0; s < 1000; s++) {
        let mx = 0
        for (let i = 0; i < 1000; i++) mx = Math.max(mx, draw(r1))
        brute.push(mx)
        direct.push(big(r2))
      }
      brute.sort((a, b) => a - b)
      direct.sort((a, b) => a - b)
      let D = 0
      for (const k of new Set([...brute, ...direct])) {
        const below = (a) => {
          let lo = 0
          let hi = a.length
          while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (a[mid] <= k) lo = mid + 1
            else hi = mid
          }
          return lo / a.length
        }
        D = Math.max(D, Math.abs(below(brute) - below(direct)))
      }
      const crit = 1.628 * Math.sqrt(2 / 1000)
      check(`the largest of N = 1,000 values, γ = ${g}: drawn directly and by brute force, 1,000 samples each, the two distributions agree (KS distance below ${f3(crit)}, the 1% level)`, D < crit, `D = ${f3(D)}; medians ${median(brute)} and ${median(direct)}`)
    }
  }
  for (const [g, want] of [[2.5, 2 / 3], [3, 0.5]]) {
    const draw = powerLawSampler(g, 1)
    const base = 101 + g * 10 // the default seed; then ten others
    const slopes = []
    for (let j = 0; j <= 10; j++) {
      const random = mulberry32(base + j)
      const xs = []
      const ys = []
      for (const n of [1e3, 1e4, 1e5]) {
        const big = largestOf(draw, n)
        const maxes = Array.from({ length: 1000 }, () => big(random))
        xs.push(Math.log(n))
        ys.push(Math.log(median(maxes)))
      }
      slopes.push({ seed: base + j, sl: (ys[2] - ys[0]) / (xs[2] - xs[0]), medians: ys.map((y) => Math.round(Math.exp(y))) })
    }
    for (const r of slopes) info(`natural cutoff, γ = ${g}, seed ${r.seed}: slope ${f3(r.sl)} (medians ${r.medians.join(', ')})`)
    const worst = Math.max(...slopes.map((r) => Math.abs(r.sl - want)))
    check(`median largest degree over 1,000 samples, N = 10³, 10⁴, 10⁵, γ = ${g}: slope within 0.05 of 1/(γ − 1) = ${f3(want)}, for the default seed and ten others`, worst <= 0.05, `slopes ${slopes.map((r) => f3(r.sl)).join(' ')}; largest gap ${f3(worst)}; N^(1/(γ−1)) = ${[1e3, 1e4, 1e5].map((n) => Math.round(naturalCutoff(n, g))).join(', ')}`)
  }
  // Exercises 1 and 2
  check('exercise 1: k_min = 2, N = 10⁶ → 20,000, 2,000, 200; three decades need 10⁶ nodes at γ = 3 and about 32,000 at γ = 2.5', near(c(2.5, 2), 20000, 1e-6) && near(c(3, 2), 2000, 1e-6) && near(c(4, 2), 200, 1e-6) && Math.round(1000 ** 1.5) === 31623)
  {
    const g = 2.5
    const kMin = 2
    const C = (g - 1) * kMin ** (g - 1)
    const m1 = (K) => (C * (kMin ** (2 - g) - K ** (2 - g))) / (g - 2)
    const m2 = (K) => (C * (K ** (3 - g) - kMin ** (3 - g))) / (3 - g)
    const K6 = naturalCutoff(1e6, g, kMin)
    const K8 = naturalCutoff(1e8, g, kMin)
    check('exercise 2: ⟨k⟩ → 6; ⟨k²⟩ ≈ 1,190 and ⟨k²⟩/⟨k⟩ ≈ 200 at N = 10⁶; ⟨k²⟩ grows by about 4.7 at N = 10⁸ (100^(1/3) = 4.6)', near((kMin * (g - 1)) / (g - 2), 6, 1e-9) && near(m2(K6), 1190, 5) && near(m2(K6) / m1(K6), 200, 2) && near(m2(K8) / m2(K6), 4.7, 0.05) && near(100 ** (1 / 3), 4.64, 0.005), `⟨k²⟩ = ${m2(K6).toFixed(0)}, ratio ${(m2(K6) / m1(K6)).toFixed(1)} (with ⟨k⟩ = 6: ${(m2(K6) / 6).toFixed(1)}), factor ${f3(m2(K8) / m2(K6))}`)
    info(`exercise 2, whole numbers: ⟨k⟩ of the discrete law γ = 2.5, k_min = 2 is ${f3(powerLaw(2.5, 2).moment(1))}`)
  }
}

// ---------------------------------------------------------------- Configuration model

if (section('config')) {
  {
    const random = mulberry32(5)
    const deg = drawDegrees(3000, powerLawSampler(2.5, 2, 2999), random)
    const { A, B } = pairStubs(deg, random)
    const got = new Int32Array(3000)
    for (let e = 0; e < A.length; e++) {
      got[A[e]]++
      got[B[e]]++
    }
    check('pairing: before cleaning, every node has exactly the degree it was given (a self-link counts twice)', got.every((v, i) => v === deg[i]), `${A.length} links`)
    const s = simplify(3000, A, B)
    const keys = new Set()
    let clean = true
    for (let e = 0; e < s.A.length; e++) {
      const key = Math.min(s.A[e], s.B[e]) * 3000 + Math.max(s.A[e], s.B[e])
      if (s.A[e] === s.B[e] || keys.has(key)) clean = false
      keys.add(key)
    }
    const pairs = new Set()
    let self = 0
    for (let e = 0; e < A.length; e++) {
      if (A[e] === B[e]) self++
      else pairs.add(Math.min(A[e], B[e]) * 3000 + Math.max(A[e], B[e]))
    }
    check('cleaning: no self-link or repeated link is left, and the counts add up', clean && s.selfLinks === self && s.A.length === pairs.size && s.repeated === A.length - self - pairs.size, `${s.selfLinks} self-links, ${s.repeated} repeated`)
  }
  {
    const random = mulberry32(6)
    let self = 0
    let rep = 0
    for (let r = 0; r < 200; r++) {
      const deg = drawDegrees(10000, poissonDraw(4), random)
      const { A, B } = pairStubs(deg, random)
      const s = simplify(10000, A, B)
      self += s.selfLinks
      rep += s.repeated
    }
    check('Poisson degrees, ⟨k⟩ = 4, N = 10,000, 200 networks: 2 self-links and 4 repeated links on average, within 15% (the square over 4, not over 2)', near(self / 200, 2, 0.3) && near(rep / 200, 4, 0.6), `${f2(self / 200)} and ${f2(rep / 200)}`)
  }
  for (const [g, n] of [[3.5, 2000], [3.5, 20000], [2.5, 2000], [2.5, 20000], [2.2, 2000], [2.2, 20000]]) {
    let self = 0
    let rep = 0
    let eS = 0
    let eR = 0
    let lost = 0
    const R = 20
    for (let r = 0; r < R; r++) {
      const d = dialNetwork(g, 2, n, 100 + r)
      self += d.net.selfLinks
      rep += d.net.repeated
      eS += d.expected.selfLinks
      eR += d.expected.repeated
      lost += d.given.max - d.stats.max
    }
    info(`configuration model, γ = ${g}, k_min = 2, N = ${n}, mean of ${R}: self-links ${f2(self / R)} (formula ${f2(eS / R)}), repeated ${f2(rep / R)} (formula ${f2(eR / R)}), links lost by the biggest hub ${f2(lost / R)}`)
  }
}

// ---------------------------------------------------------------- Generating functions

if (section('genfun')) {
  const S = (fam) => giant(fam).S
  check('Poisson, ⟨k⟩ = 1.5, 2, 3: S = 0.5828, 0.7968, 0.9405', near(S(poissonFamily(1.5)), 0.5828, 5e-5) && near(S(poissonFamily(2)), 0.7968, 5e-5) && near(S(poissonFamily(3)), 0.9405, 5e-5), [1.5, 2, 3].map((c) => f4(S(poissonFamily(c)))).join(' '))
  {
    const s = S(poissonFamily(2))
    check('Poisson: S solves S = 1 − e^(−⟨k⟩S)', near(s, 1 - Math.exp(-2 * s), 1e-9))
  }
  check('Poisson at and below ⟨k⟩ = 1: no giant component', S(poissonFamily(1)) === 0 && S(poissonFamily(0.6)) === 0)
  const of = giant(onesFoursFamily(0.25))
  check('ones and fours, a quarter of fours: u = 0.5, S = 39/64 = 0.6094', near(of.u, 0.5, 1e-9) && near(of.S, 39 / 64, 1e-9), `${f4(of.u)} ${f4(of.S)}`)
  check('ones and fours: the threshold share is 1/9', S(onesFoursFamily(1 / 9 - 1e-3)) === 0 && S(onesFoursFamily(1 / 9 + 1e-3)) > 0 && near(onesFoursFamily(1 / 9).slope, 1, 1e-12))
  check('exercise 3: ⟨k⟩ = 1.75, q_0 = 3/7, q_3 = 4/7', near(onesFoursFamily(0.25).mean, 1.75, 1e-12) && near(onesFoursFamily(0.25).G1(0), 3 / 7, 1e-12))
  check('pure power law: ζ(γ − 2) = 2ζ(γ − 1) at γ = 3.4788', near(POWER_THRESHOLD, 3.4788, 5e-5), POWER_THRESHOLD.toFixed(6))
  {
    const got = [2.2, 2.5, 3, 3.4].map((g) => S(powerFamily(g)))
    check('pure power law: S = 0.862, 0.614, 0.201, 0.008 at γ = 2.2, 2.5, 3, 3.4', near(got[0], 0.862, 5e-4) && near(got[1], 0.614, 5e-4) && near(got[2], 0.201, 5e-4) && near(got[3], 0.008, 5e-4), got.map(f4).join(' '))
    check('pure power law: no giant component at γ = 3.5; all nodes in it at γ = 2', S(powerFamily(3.5)) === 0 && S(powerFamily(2)) === 1)
  }
  {
    const it = iterate(poissonFamily(2), 60)
    check('the iteration u → G1(u) from 0 climbs to the fixed point', it.every((v, i) => i === 0 || v >= it[i - 1]) && near(it[60], solveU(poissonFamily(2)), 1e-9))
  }
  {
    const d = followDistributions()
    const sum = (a) => a.reduce((x, v) => x + v, 0)
    check('"Follow a link": each p and q adds up to 1; for Poisson q = p', FAMILY_IDS.every((id) => near(sum(d[id].P), 1, 1e-9) && near(sum(d[id].Q), 1, 1e-9)) && d.poisson.P.every((v, k) => near(v, d.poisson.Q[k], 1e-12)))
    info(`"Follow a link": Poisson ⟨k⟩ = ${f2(d.poisson.mean)}, excess ${f2(d.poisson.excess)}; power law (cut at ${d.power.cut}) ⟨k⟩ = ${f2(d.power.mean)}, excess ${f2(d.power.excess)}, q beyond 11: ${f3(1 - sum(d.power.Q.slice(0, 12)))}, p beyond 11: ${f4(1 - sum(d.power.P.slice(0, 12)))}; ones and fours ⟨k⟩ = ${f2(d.onesFours.mean)}, excess ${f2(d.onesFours.excess)}`)
  }
  // Networks of 20,000 nodes
  {
    const a = networkGiantMean('poisson', 2)
    const b = networkGiantMean('onesFours', 0.25)
    check(`networks of ${NET_N} nodes (${NET_RUNS} each): S within 0.02 of the theory for Poisson ⟨k⟩ = 2 and for ones and fours`, near(a.mean, 0.7968, 0.02) && near(b.mean, 0.6094, 0.02), `${f4(a.mean)} ± ${f4(a.sd)} and ${f4(b.mean)} ± ${f4(b.sd)}`)
    for (const g of [2.2, 2.5, 3, 3.4, 3.6]) {
      const r = networkGiantMean('power', g)
      info(`networks of ${NET_N} nodes, pure power law γ = ${g}: S = ${f4(r.mean)} ± ${f4(r.sd)} (theory ${f4(S(powerFamily(g)))})`)
    }
  }
  // The precomputed file is what this code gives
  {
    const file = JSON.parse(readFileSync(new URL('../../src/data/lab/precomputed/network-05-giant.json', import.meta.url), 'utf8'))
    let ok = file.n === NET_N && file.runs === NET_RUNS
    for (const id of FAMILY_IDS) {
      const th = theoryCurve(id)
      if (file[id].theory.length !== th.length || th.some((p, i) => !near(p[1], file[id].theory[i][1], 1e-4))) ok = false
      if (file[id].dots.length !== NET_GRID[id].length) ok = false
    }
    for (const [id, i] of [['poisson', 7], ['power', 4], ['onesFours', 5]]) {
      const r = networkGiantMean(id, NET_GRID[id][i])
      if (!near(r.mean, file[id].dots[i][1], 1e-4)) ok = false
    }
    check('the precomputed curves and dots of Panel B are what the code gives now (rerun scripts/lab/precompute-network-05.mjs otherwise)', ok)
  }
}

// ---------------------------------------------------------------- The recipe

const sampleOf = (id, n, seed, params) => SOURCES[id].sample(n, mulberry32(seed), { gamma: 2.5, ...params })

if (section('fit')) {
  {
    const est = []
    const short = { 1: [], 2: [], 5: [], 10: [] }
    for (let s = 0; s < 100; s++) {
      const tab = tabulate(sampleOf('power', 10000, 1000 + s))
      est.push(mleAt(tab, 0).gamma)
      for (const kMin of [1, 2, 5, 10]) short[kMin].push(mleAt(tab, tab.ks.indexOf(kMin)).shortcut)
    }
    // spread expected from the curvature of the likelihood
    const h = 1e-3
    const L = (g) => Math.log(hurwitz(g, 1))
    const curv = (L(2.5 + h) - 2 * L(2.5) + L(2.5 - h)) / (h * h)
    check('exact maximum likelihood, 100 samples of 10,000 from γ = 2.5, k_min = 1: mean within 0.01 of 2.5, spread about 0.017', near(meanOf(est), 2.5, 0.01) && near(sdOf(est), 0.017, 0.004), `mean ${f4(meanOf(est))}, spread ${f4(sdOf(est))}; from the curvature ${f4(1 / Math.sqrt(10000 * curv))}; rule of thumb ${f4(1.5 / 100)}`)
    info(`the shortcut on the same samples (truth 2.5): k_min = 1 → ${f3(meanOf(short[1]))}, 2 → ${f3(meanOf(short[2]))}, 5 → ${f3(meanOf(short[5]))}, 10 → ${f3(meanOf(short[10]))}`)
    const exactAt = (kMin) => meanOf(Array.from({ length: 20 }, (_, s) => {
      const tab = tabulate(sampleOf('power', 10000, 1000 + s))
      return mleAt(tab, tab.ks.indexOf(kMin)).gamma
    }))
    info(`exact maximum likelihood at k_min = 2, 5, 10 (first 20 samples): ${f3(exactAt(2))}, ${f3(exactAt(5))}, ${f3(exactAt(10))}`)
  }
  {
    const chosen = []
    const gammas = []
    for (let s = 0; s < 100; s++) {
      const fit = fitRecipe(tabulate(sampleOf('tailBody', 10000, 2000 + s)))
      chosen.push(fit.kMin)
      gammas.push(fit.gamma)
    }
    const inRange = chosen.filter((k) => k >= 7 && k <= 15).length
    check('k_min by KS distance, power-law tail above 10 with another body, n = 10,000: between 7 and 15 in at least 80 samples of 100', inRange >= 80, `${inRange} of 100; median k_min ${median(chosen)}; exactly 10 in ${chosen.filter((k) => k === 10).length}; median γ ${f3(median(gammas))}`)
  }
  {
    let low = 0
    const ps = []
    for (let s = 0; s < 100; s++) {
      const tab = tabulate(sampleOf('power', 2000, 3000 + s))
      const p = bootstrapP(tab, fitRecipe(tab), 100, 77 + s)
      ps.push(p)
      if (p <= 0.1) low++
    }
    check('p-values, 100 pure power-law samples (n = 2,000, 100 synthetic sets each): the share with p ≤ 0.1 is between 0.03 and 0.2', low >= 3 && low <= 20, `${low} of 100; median p ${f2(median(ps))}`)
  }
  for (const id of ['lognormal', 'exponential']) {
    for (const [n, samples] of [[300, 50], [10000, 20], [30000, 20]]) {
      let out = 0
      const tails = []
      const kmins = []
      let small = 0
      let narrow = 0
      for (let s = 0; s < samples; s++) {
        const tab = tabulate(sampleOf(id, n, 4000 + s))
        const fit = fitRecipe(tab)
        tails.push(fit.nTail)
        kmins.push(fit.kMin)
        if (fit.nTail < 50) small++
        else if (tab.ks.at(-1) / fit.kMin < 10) narrow++
        if (bootstrapP(tab, fit, 100, 99 + s) <= 0.1) out++
      }
      info(`${id}, n = ${n}: power law ruled out (p ≤ 0.1) in ${out} of ${samples} samples; median n_tail ${median(tails)}, median k_min ${median(kmins)}; tail below 50 values in ${small}, tail narrower than a decade in ${narrow} more`)
    }
  }
  {
    let expWins = 0
    let plWins = 0
    let lnOpen = 0
    for (let s = 0; s < 100; s++) {
      const te = tabulate(sampleOf('exponential', 1000, 5000 + s))
      const ge = mleAt(te, 0).gamma
      const ve = vuong(te, 0, powerCandidate(te, 0, ge).logp, exponentialCandidate(te, 0).logp)
      if (ve.R < 0 && ve.p < 0.1) expWins++
      const tp = tabulate(sampleOf('power', 1000, 6000 + s))
      const gp = mleAt(tp, 0).gamma
      const vp = vuong(tp, 0, powerCandidate(tp, 0, gp).logp, exponentialCandidate(tp, 0).logp)
      if (vp.R > 0 && vp.p < 0.1) plWins++
      const vl = vuong(tp, 0, powerCandidate(tp, 0, gp).logp, lognormalCandidate(tp, 0).logp)
      if (!(vl.p < 0.1)) lnOpen++
    }
    check('likelihood ratio, k_min at the smallest value, n = 1,000: exponential data favour the exponential with p < 0.1 in at least 95 samples of 100', expWins >= 95, `${expWins}`)
    check('likelihood ratio: pure power-law data favour the power law over the exponential with p < 0.1 in at least 95 of 100', plWins >= 95, `${plWins}`)
    info(`likelihood ratio, pure power-law data against a lognormal: no decision (p ≥ 0.1) in ${lnOpen} of 100 samples`)
  }
  {
    check('erfc: erfc(0) = 1, erfc(1) = 0.157299, erfc(−1) = 1.842701, erfc(3) = 2.209e-5', near(erfc(0), 1, 5e-7) && near(erfc(1), 0.157299, 5e-7) && near(erfc(-1), 1.842701, 5e-7) && near(erfc(3) / 2.209e-5, 1, 1e-3))
    let Z = 0
    for (let k = 3; k < 4e5; k++) Z += k ** -2.2 * Math.exp(-0.0005 * k)
    check('normalising sum of the cut-off power law agrees with a plain sum (γ = 2.2, λ = 0.0005, from 3) to 1e-7', near(cutoffNorm(2.2, 0.0005, 3) / Z, 1, 1e-7), `${cutoffNorm(2.2, 0.0005, 3)} ${Z}`)
    check('with λ → 0 it is the Hurwitz zeta function', near(cutoffNorm(2.5, 1e-9, 2) / hurwitz(2.5, 2), 1, 1e-6))
  }
  {
    const N = 100000
    const net = barabasiAlbert(N, PA_M, 4)
    const k = degrees(N, net.A, net.B)
    const tab = tabulate(k)
    let worst = 0
    for (let d = 2; d <= 10; d++) {
      const i = tab.ks.indexOf(d)
      worst = Math.max(worst, Math.abs(tab.count[i] / N - attachmentPmf(d)))
    }
    check('preferential attachment, N = 100,000, m = 2: p_k within 0.01 of 2m(m+1)/(k(k+1)(k+2)) for k = 2 … 10', worst < 0.01, `largest gap ${worst.toFixed(4)}`)
    const fit = fitRecipe(tab)
    const at2 = mleAt(tab, 0)
    info(`preferential attachment, N = 100,000: the recipe gives γ = ${f3(fit.gamma)} ± ${f3(fit.se)} with k_min = ${fit.kMin} (n_tail = ${fit.nTail}); at k_min = 2 the shortcut gives ${f3(at2.shortcut)} and exact maximum likelihood ${f3(at2.gamma)}`)
  }
  {
    const random = mulberry32(8)
    const est = []
    for (let s = 0; s < 20; s++) {
      const x = Float64Array.from({ length: 10000 }, () => (1 - random()) ** (-1 / 1.5)).sort().reverse()
      est.push(hill(x, 1000))
    }
    check('Hill estimator, 10,000 exact Pareto values with tail exponent 1.5, j = 1,000: mean of 20 samples within 0.03 of 1.5', near(meanOf(est), 1.5, 0.03), f4(meanOf(est)))
    const tab = tabulate(sampleOf('power', 5000, 1))
    const hp = hillPlot(tab)
    const x = Float64Array.from(tab.sorted).reverse()
    check('the Hill plot is the Hill estimate at each j, plus one', hp.length > 30 && hp.every(([j, g]) => near(g, 1 + hill(x, j), 1e-9)))
  }
  {
    // Exercise 4
    const tab = tabulate([10, 11, 12, 14, 15, 18, 22, 30, 45, 90])
    const g = shortcutGamma(10, tab.tailLog[0], 10)
    const se = (g - 1) / Math.sqrt(10)
    check('exercise 4: the shortcut gives γ = 2.30 ± 0.41; about 670 values bring the error to 0.05', f2(g) === '2.30' && f2(se) === '0.41' && near(((g - 1) / 0.05) ** 2, 670, 5), `${f3(g)} ± ${f3(se)}; n = ${(((g - 1) / 0.05) ** 2).toFixed(0)}; exact maximum likelihood ${f3(mleGamma(tab.tailLog[0] / 10, 10))}`)
  }
}

// ---------------------------------------------------------------- Quoted on the page

if (section('page')) {
  const texts = readFileSync(new URL('../../src/components/lab/network/heavy-tails-done-right/texts.js', import.meta.url), 'utf8')
  const lectureEn = readFileSync(new URL('../../src/content/network-lab/heavy-tails-done-right.en.md', import.meta.url), 'utf8')
  const lectureIt = readFileSync(new URL('../../src/content/network-lab/heavy-tails-done-right.it.md', import.meta.url), 'utf8')
  const en = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  const int = (v) => Math.round(v).toLocaleString('en-US')
  // every string must appear in the English texts (observe lists and exercises)
  const quoted = (name, strings, where = texts) => {
    const missing = strings.filter((x) => !where.includes(x))
    q(name, missing.length === 0, missing.length ? `not in the text: ${missing.join(' | ')}` : strings.join(' | '))
  }

  // Panel A
  const dial = (g, kMin, n, seed) => {
    const r = dialNetwork(g, kMin, n, seed)
    const s = r.stats
    return { r, s, L: int(s.L), k1: en(s.k1, 2), k2: en(s.k2, 1), ratio: en(s.ratio, 1), max: int(s.max), given: int(r.given.max), cutoff: int(r.cutoff), self: int(r.net.selfLinks), selfF: en(r.expected.selfLinks, 1), rep: int(r.net.repeated), repF: en(r.expected.repeated, 1), d: en(s.distance, 2) }
  }
  const a = dial(DIAL_DEFAULT.gamma, DIAL_DEFAULT.kMin, DIAL_DEFAULT.n)
  info(`Panel A, start: ${JSON.stringify({ ...a, r: undefined, s: undefined })}`)
  quoted('Panel A at the start', [`${a.L} links`, `⟨k⟩ = ${a.k1}`, `⟨k²⟩ = ${a.k2}`, `⟨k²⟩/⟨k⟩ = ${a.ratio}`, `dealt ${a.given} half-links`, `(${a.cutoff})`, `keeps ${a.max} links`, `${a.self} self-links (the formula says ${a.selfF})`, `${a.rep} repeated links (the formula says ${a.repF}`])
  quoted('the lecture quotes the same hub: 315 half-links, 243 links', [`dealt ${a.given} half-links and keeps ${a.max} links`], lectureEn)
  quoted('and so does the Italian lecture', [`riceve ${a.given} mezzi collegamenti e conserva ${a.max} collegamenti`], lectureIt)
  {
    const maxes = Array.from({ length: 20 }, (_, i) => dialNetwork(2.5, 2, 2000, DIAL_SEED + i).given.max)
    quoted('Panel A, the first twenty networks', [`runs from ${int(Math.min(...maxes))} to ${int(Math.max(...maxes))}`])
  }
  const a4 = dial(4, 2, 2000)
  quoted('Panel A, γ = 4', [`${a4.L} links, largest degree ${a4.max} (cutoff ${a4.cutoff}), ${a4.self} self-links and no repeated link, ⟨k²⟩/⟨k⟩ = ${a4.ratio}, average distance ${a4.d}`])
  check('Panel A, γ = 4: no repeated link', a4.r.net.repeated === 0)
  const a21 = dial(2.1, 2, 2000)
  quoted('Panel A, γ = 2.1', [`dealt ${a21.given} half-links and keeps ${a21.max}`, `${a21.self} self-links and ${a21.rep} repeated links`, `⟨k²⟩/⟨k⟩ = ${a21.ratio} and the average distance is ${a21.d}`])
  const aBig = dial(2.5, 2, 20000)
  const a4Big = dial(4, 2, 20000)
  quoted('Panel A, N = 20,000', [`from ${a.k1} to ${aBig.k1}`, `from ${a.k2} to ${aBig.k2}`, `from ${a.max} to ${aBig.max}`, `stays at ${aBig.d}`, `(${a4.k2}, then ${a4Big.k2})`, `from ${a4.d} to ${a4Big.d}`])
  check('Panel A, N = 20,000: the distance is the one at N = 2,000', a.d === aBig.d)
  quoted('exercise 2 quotes the panel', [`${a.k1} at N = 2,000 and ${aBig.k1} at N = 20,000`, `from ${a.k2} to ${aBig.k2}`, `exact value for whole numbers is ${en(powerLaw(2.5, 2).moment(1), 2)}`])
  check('exercise 2: ⟨k²⟩ grows by about 2.6 in the panel', near(aBig.s.k2 / a.s.k2, 2.6, 0.06), f3(aBig.s.k2 / a.s.k2))
  {
    const t0 = Date.now()
    const job = dialJob()
    for (const _ of job.iter);
    const d = job.snapshot()
    const last = EXP_SIZES.length - 1
    const at = (i, f, digits) => EXP_KINDS.map((id) => (digits == null ? int(d.median[id][i][f]) : en(d.median[id][i][f], digits)))
    const mx = at(last, 'max')
    const ra = at(last, 'ratio', 1)
    const di = at(last, 'distance', 2)
    const d0 = at(0, 'distance', 2)
    info(`Panel A, experiment (${((Date.now() - t0) / 1000).toFixed(1)} s in Node): ${EXP_KINDS.map((id) => `${id}: ${d.median[id].map((c) => `${int(c.max)}/${en(c.ratio, 1)}/${en(c.distance, 2)}`).join(' ')}`).join(' || ')}`)
    quoted('Panel A, experiment at N = 100,000', [
      `${mx[0]} for γ = 2.2, ${mx[1]} for 2.6, ${mx[2]} for 3, ${mx[3]} for 4 and ${mx[4]} for the random network`,
      `is ${ra[0]}, ${ra[1]}, ${ra[2]}, ${ra[3]} and ${ra[4]}`,
      `${di[0]}, ${di[1]}, ${di[2]}, ${di[3]} and ${di[4]}`,
      `from ${d0[0]} to ${di[0]} at γ = 2.2 and from ${d0[3]} to ${di[3]} at γ = 4`,
    ])
    quoted('the lecture rounds the same distances', [`from ${en(Number(d0[3]), 1)} to ${en(Number(di[3]), 1)} at γ = 4, and from ${en(Number(d0[0]), 1)} to ${en(Number(di[0]), 1)} at γ = 2.2`], lectureEn)
    check('experiment: the largest degree grows with N faster for smaller γ, and the distance slower', d.median['g2.2'][last].max > d.median['g2.6'][last].max && d.median['g2.6'][last].max > d.median.g4[last].max && d.median['g2.2'][last].distance < d.median.g3[last].distance && d.median.g3[last].distance < d.median.g4[last].distance)
  }

  // Panel B
  const steps = (fam) => {
    const path = iterate(fam, 400)
    for (let k = 1; k <= 400; k++) if (Math.abs(path[k] - path[k - 1]) < 1e-6) return k
    return 400
  }
  const gi = (fam) => {
    const g = giant(fam)
    return { u: en(g.u, 4), S: en(g.S, 4) }
  }
  {
    const p15 = poissonFamily(1.5)
    const p11 = poissonFamily(1.1)
    quoted('Panel B, Poisson', [`u = ${gi(p15).u}, after ${steps(p15)} steps`, `= ${gi(p15).S}`, `u = ${gi(p11).u} (S = ${gi(p11).S}), but it takes ${steps(p11)} steps`, '⟨k²⟩ − 2⟨k⟩ = −0.09'])
    check('Panel B, Poisson 0.9: ⟨k²⟩ − 2⟨k⟩ = −0.09 and the staircase ends at 1', near(poissonFamily(0.9).excess, -0.09, 1e-9) && giant(poissonFamily(0.9)).u === 1)
    quoted('Panel B, ones and fours', [`S = ${gi(onesFoursFamily(0.12)).S}`, 'u = 0.5 and S = 0.6094'])
    check('Panel B, ones and fours at 0.10: no giant component, excess −0.1', giant(onesFoursFamily(0.1)).S === 0 && near(onesFoursFamily(0.1).excess, -0.1, 1e-9))
    const S = (g) => gi(powerFamily(g)).S
    quoted('Panel B, power law', [`γ = 2.5: S = ${S(2.5)}`, `At γ = 3, S = ${S(3)}; at 3.4, ${S(3.4)}`, `G1′(1) = ${en(powerFamily(3.5).slope, 3)}`, `S is ${S(3.45)} at γ = 3.45 and 0 at 3.5`])
    const file = JSON.parse(readFileSync(new URL('../../src/data/lab/precomputed/network-05-giant.json', import.meta.url), 'utf8'))
    const dot = (id, x) => en(file[id].dots.find((p) => p[0] === x)[1], 3)
    quoted('Panel B, the dots', [`${dot('poisson', 2)} against 0.7968`, `(${dot('power', 2.5)} and ${dot('power', 3)}, against ${S(2.5)} and ${S(3)})`, `(${dot('power', 2.2)} against ${S(2.2)})`, `(${dot('power', 3.4)} against ${S(3.4)} at γ = 3.4; ${dot('power', 3.6)} against 0 at 3.6)`])
  }

  // Panel C
  const recipe = (id, n, params = {}) => {
    const tab = tabulate(drawSample(id, n, params))
    const fit = fitRecipe(tab)
    const boot = bootstrapJob(tab, fit, BOOT_DEFAULT, BOOT_SEED)
    for (const _ of boot.iter);
    const { p, worse } = boot.snapshot()
    const cmp = compare(tab, fit)
    const kMax = tab.ks.at(-1)
    // As the panel shows it: below 1/sets when no synthetic set fitted worse,
    // three decimals below 0.01, so that it never reads 0.00.
    const ps = worse === 0 ? `< ${1 / BOOT_DEFAULT}` : en(p, p < 0.01 ? 3 : 2)
    return { tab, fit, p, worse, cmp, kMax, v: verdict(fit, p, cmp, kMax), w: wrongWays(tab), g: `${en(fit.gamma, 2)} ± ${en(fit.se, 2)}`, ps, R: (c) => en(cmp[c].R, 1).replace('-', '−') }
  }
  const show = (name, r) => info(`Panel C, ${name}: k_min ${r.fit.kMin}, γ ${r.g}, n_tail ${r.fit.nTail} of ${r.tab.n}, k up to ${r.kMax}, p ${r.ps}; lognormal ${r.R('lognormal')} (p ${en(r.cmp.lognormal.p, 2)}), exponential ${r.R('exponential')} (p ${en(r.cmp.exponential.p, 2)}), cut-off ${r.R('cutoff')} (p ${en(r.cmp.cutoff.p, 2)}); verdict ${r.v.kind}; wrong ways ${en(r.w.equalBins, 2)} ${en(r.w.logBins, 2)} ${en(r.w.ccdf, 2)} ${en(r.w.mleSmallest, 2)}`)
  const pl = recipe('power', DEFAULT_N)
  show('pure power law, 2,000', pl)
  quoted('Panel C, pure power law', [`k_min = ${pl.fit.kMin} and gives γ = ${pl.g}`, `p = ${pl.ps}, not ruled out`, `(ratio ${pl.R('exponential')})`, `${en(pl.w.equalBins, 2)} from a line through the histogram with equal bins, ${en(pl.w.logBins, 2)} with logarithmic bins, ${en(pl.w.ccdf, 2)} from a line through the CCDF, ${en(pl.w.mleSmallest, 2)} from maximum likelihood`])
  check('Panel C, pure power law: plausible; lognormal and cut-off cannot be told apart', pl.v.kind === 'plausible' && pl.v.open.join() === 'lognormal,cutoff')
  quoted('the lecture quotes the histogram fit, 1.49', [`gets ${en(pl.w.equalBins, 2)} that way`], lectureEn)
  const tb = recipe('tailBody', 20000)
  show('tail with a different body, 20,000', tb)
  quoted('Panel C, tail with a different body', [`minimum at k_min = ${tb.fit.kMin}`, `γ = ${tb.g} on ${int(tb.fit.nTail)} values, p = ${tb.ps}`, `k_min = 1 says ${en(tb.w.mleSmallest, 2)}`])
  const ln = recipe('lognormal', DEFAULT_N)
  show('lognormal, 2,000', ln)
  quoted('Panel C, lognormal', [`k_min = ${ln.fit.kMin} and keeps ${ln.fit.nTail} values of 2,000, from ${ln.fit.kMin} to ${ln.kMax}`, `γ = ${ln.g} and p = ${ln.ps}`])
  check('Panel C, lognormal: the verdict is "plausible", lognormal not told apart', ln.v.kind === 'plausible' && ln.v.open.includes('lognormal'))
  quoted('the lecture quotes the lognormal that passes', [`pass the test with p = ${ln.ps}, on the last ${ln.fit.nTail} of them`], lectureEn)
  const ex = recipe('exponential', DEFAULT_N)
  show('exponential, 2,000', ex)
  quoted('Panel C, exponential', [`k_min = ${ex.fit.kMin}, keeps ${ex.fit.nTail} values between ${ex.fit.kMin} and ${ex.kMax}`, `"γ = ${ex.g}" with p = ${ex.ps}`])
  check('Panel C, exponential: the verdict is "narrow"', ex.v.kind === 'narrow')
  const cu = recipe('cutoff', DEFAULT_N)
  show('cut-off, 2,000', cu)
  quoted('Panel C, cut-off', [`γ = ${cu.g} from k_min = ${cu.fit.kMin}, and p = ${cu.ps}`, `(ratio ${cu.R('cutoff')} for the cut-off law)`])
  check('Panel C, cut-off: ruled out', cu.v.kind === 'ruledOut')
  const pa = recipe('attachment', DEFAULT_N)
  const paBig = recipe('attachment', 50000)
  show('preferential attachment, 2,000', pa)
  show('preferential attachment, 50,000', paBig)
  quoted('Panel C, preferential attachment', [`k_min = ${pa.fit.kMin}, γ = ${pa.g}, and p = ${pa.ps}: ruled out`, `k_min = ${paBig.fit.kMin}, gives γ = ${paBig.g} on ${int(paBig.fit.nTail)} values and p = ${paBig.ps}`])
  check('Panel C, preferential attachment: ruled out at 2,000, not at 50,000', pa.v.kind === 'ruledOut' && paBig.p > 0.1)
  const th = recipe('thinned', DEFAULT_N)
  const thBig = recipe('thinned', 20000)
  show('sampled network, 2,000', th)
  show('sampled network, 20,000', thBig)
  quoted('Panel C, sampled network', [`γ = ${th.g} from k_min = ${th.fit.kMin}, with p = ${th.ps}`, `k_min = ${thBig.fit.kMin} and gives ${thBig.g}`])
  {
    const h = hillPlot(thBig.tab).filter(([j]) => j >= 30 && j <= 200)
    q('Panel C, sampled network, 20,000: the Hill plot stays between 2.3 and 2.7 from j = 30 to 200', h.length > 5 && h.every(([, g]) => g >= 2.3 && g <= 2.7), h.map(([j, g]) => `${j}:${f2(g)}`).join(' '))
  }
  // Exercise 6
  const m = MYSTERIES.map((x) => recipe(x.id))
  m.forEach((r, i) => show(`mystery ${i + 1}`, r))
  quoted('exercise 6, the mystery samples', [
    `Sample 1: k_min = ${m[0].fit.kMin}, γ = ${m[0].g} on ${int(m[0].fit.nTail)} values of 5,000, p = ${m[0].ps}`,
    `Sample 2: k_min = ${m[1].fit.kMin}, γ = ${m[1].g} on ${m[1].fit.nTail} values of 3,000, p = ${m[1].ps}`,
    `(ratio ${m[1].R('lognormal')})`,
    `Sample 3: γ = ${m[2].g} from k_min = ${m[2].fit.kMin} and p ${m[2].ps}: none of the ${BOOT_DEFAULT} synthetic sets fitted worse than the data`,
    `ratio of ${m[2].R('cutoff')} in favour of the cut-off law`,
  ])
  check('exercise 6: verdicts plausible, plausible (lognormal open), ruled out; sample 2 keeps 8% of the data; sample 3: no synthetic set fitted worse', m[0].v.kind === 'plausible' && m[1].v.kind === 'plausible' && m[1].v.open.includes('lognormal') && m[2].v.kind === 'ruledOut' && Math.round((100 * m[1].fit.nTail) / 3000) === 8 && m[2].worse === 0 && m[2].ps === '< 0.005')
  {
    // Exercise 6, sample 1: the range of its tail. The largest value is an
    // outlier; the natural cutoff of 1,968 values from k = 10 at γ = 2.6 is
    // 10 × 1,968^(1/1.6) ≈ 1,100, two decades.
    const t1 = m[0].tab
    const tail = t1.ks.filter((k) => k >= m[0].fit.kMin)
    const top = tail.slice(-3).reverse()
    const nc = naturalCutoff(m[0].fit.nTail, 2.6, m[0].fit.kMin)
    info(`exercise 6, sample 1: the tail runs from ${tail[0]} to ${top[0]} (${f2(Math.log10(top[0] / tail[0]))} decades); next largest ${top[1]}, ${top[2]}; 10 × ${m[0].fit.nTail}^(1/1.6) = ${nc.toFixed(0)}`)
    quoted('exercise 6, sample 1: the range of the tail', [`from ${tail[0]} to ${int(top[0])}`, `the next are ${int(top[1])} and ${int(top[2])}`, `10 × ${int(m[0].fit.nTail)}^(1/1.6) ≈ ${int(Math.round(nc / 100) * 100)}`])
    check('exercise 6, sample 1: 2.9 decades with its largest value, under 2.6 without it, and the natural cutoff near 1,100', Math.log10(top[0] / tail[0]) > 2.9 && Math.log10(top[1] / tail[0]) < 2.6 && Math.round(nc / 100) === 11, `${f3(Math.log10(top[0] / tail[0]))}, ${f3(Math.log10(top[1] / tail[0]))}, ${nc.toFixed(0)}`)
  }
  check('the mysteries are what Reveal says: tail with γ = 2.6, lognormal, cut-off', MYSTERIES.map((x) => x.source).join() === 'tailBody,lognormal,cutoff' && MYSTERIES[0].params.gamma === 2.6)
  const l300 = recipe('lognormal', 300)
  const l30k = recipe('lognormal', 30000)
  const l50k = recipe('lognormal', 50000)
  show('lognormal, 300', l300)
  show('lognormal, 30,000', l30k)
  show('lognormal, 50,000', l50k)
  quoted('exercise 6, lognormal', [
    `k_min = ${l300.fit.kMin}, γ = ${l300.g} and p = ${l300.ps}, ruled out`,
    `k_min = ${l30k.fit.kMin}, γ = ${l30k.g} on ${int(l30k.fit.nTail)} values, and p = ${l30k.ps}: not ruled out`,
    `ratio ${l30k.R('cutoff')}, p = ${en(l30k.cmp.cutoff.p, 2)}`,
    `At 50,000 values p comes down to ${l50k.ps}`,
  ])
  check('exercise 6, lognormal at 30,000: the verdict names the cut-off law as a better candidate', l30k.v.kind === 'alternative' && l30k.v.better.join() === 'cutoff')
  {
    // the shares quoted from the self-check: same samples as in the section above
    const share = (n, samples) => {
      let out = 0
      for (let s = 0; s < samples; s++) {
        const tab = tabulate(sampleOf('lognormal', n, 4000 + s))
        if (bootstrapP(tab, fitRecipe(tab), 100, 99 + s) <= 0.1) out++
      }
      return out
    }
    const s300 = share(300, 50)
    const s10k = share(10000, 20)
    quoted('the shares of lognormal samples ruled out', [`of 20 lognormal samples of 10,000 values only ${s10k} are ruled out`, `only ${s300} samples of 50 of this size are`])
  }
  {
    // exercise 4: the shortcut at k_min = 1
    const short = meanOf(Array.from({ length: 100 }, (_, s) => mleAt(tabulate(sampleOf('power', 10000, 1000 + s)), 0).shortcut))
    quoted('exercise 4: the shortcut at k_min = 1 gives 2.02 for γ = 2.5', [`the shortcut gives ${en(short, 2)}`])
  }
  // the Italian texts carry the same numbers
  {
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    const mod = await import('../../src/components/lab/network/heavy-tails-done-right/texts.js')
    const diff = []
    const pairs = [...Object.entries(mod.observe), ...mod.exercises.flatMap((e, i) => [[`exercise ${i + 1} statement`, e.statement], [`exercise ${i + 1} solution`, e.solution]])]
    for (const [name, v] of pairs) if (numbers(v.en) !== numbers(v.it)) diff.push(name)
    q('the Italian "what to observe" lists and exercises carry the same numbers as the English ones', diff.length === 0, diff.join(', '))
    const body = (text) => text.split('<!-- simulation -->')[0]
    q('and so do the two lectures', numbers(body(lectureEn)) === numbers(body(lectureIt)))
  }
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
