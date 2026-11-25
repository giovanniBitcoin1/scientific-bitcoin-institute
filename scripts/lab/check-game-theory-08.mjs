// Self-checks for Game Theory Lab module 08, "Congestion and the price of
// anarchy". They run the same code as the page (pigou.js, braess.js,
// parallel.js, atomic.js, costsharing.js, frac.js) and compare it with exact
// values, closed forms, independent computations and the numbers the texts
// quote.
//
//   node scripts/lab/check-game-theory-08.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// defaults, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'

const M = '../../src/components/lab/game-theory/congestion-price-of-anarchy/'
const F = await import(M + 'frac.js')
const P = await import(M + 'pigou.js')
const B = await import(M + 'braess.js')
const A = await import(M + 'parallel.js')
const T = await import(M + 'atomic.js')
const C = await import(M + 'costsharing.js')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const big = (_, v) => (typeof v === 'bigint' ? `n` : v)
const same = (a, b) => JSON.stringify(a, big) === JSON.stringify(b, big)
const time = (fn) => {
  const t0 = performance.now()
  const r = fn()
  return [r, performance.now() - t0]
}
const fr = (n, d = 1) => F.frac(n, d)
const N = F.toNumber
const feq = (a, b) => F.cmp(a, b) === 0

// ------------------------------------------------------------------ fractions

console.log('— Fractions')
{
  check('frac reduces and keeps the sign in the numerator', same(fr(6, -4), { n: -3n, d: 2n }))
  check('0.05 and 0.1 from sliders are exact: 1/20 and 1/10', feq(F.fromDecimal(0.05, 2), fr(1, 20)) && feq(F.fromDecimal(0.1, 2), fr(1, 10)) && feq(F.fromDecimal(0.3, 2), fr(3, 10)))
  check('H_4 = 25/12 exactly', feq(F.harmonic(4), fr(25, 12)))
}

// ------------------------------------------------------------------ F1, Pigou

console.log('— F1: Pigou\'s two roads')
{
  const ps = [1, 1.5, 2, 3, 4, 5, 6, 8, 10]
  const xs = ['0.5000', '0.5429', '0.5774', '0.6300', '0.6687', '0.6988', '0.7230', '0.7598', '0.7868']
  const cs = ['0.7500', '0.6743', '0.6151', '0.5275', '0.4650', '0.4176', '0.3803', '0.3246', '0.2847']
  const poa = ['1.3333', '1.4831', '1.6258', '1.8956', '2.1505', '2.3944', '2.6297', '3.0808', '3.5121']
  const tolls = ['0.5000', '0.6000', '0.6667', '0.7500', '0.8000', '0.8333', '0.8571', '0.8889', '0.9091']
  check('optimum x* for p = 1, 1.5, 2, 3, 4, 5, 6, 8, 10', same(ps.map((p) => f4(P.optimumShare(p))), xs), ps.map((p) => f4(P.optimumShare(p))).join(' '))
  check('its cost', same(ps.map((p) => f4(P.optimumCost(p))), cs), ps.map((p) => f4(P.optimumCost(p))).join(' '))
  check('the price of anarchy (4/3 at p = 1)', same(ps.map((p) => f4(P.priceOfAnarchy(p))), poa) && close(P.priceOfAnarchy(1), 4 / 3), ps.map((p) => f4(P.priceOfAnarchy(p))).join(' '))
  check('the toll at the optimum, p/(p + 1)', same(ps.map((p) => f4(P.withToll(p).toll)), tolls) && ps.every((p) => close(P.withToll(p).toll, p / (p + 1))))
  // Independent: the optimum by a fine grid search on the average cost.
  const grid = (p) => {
    let best = [0, Infinity]
    for (let i = 0; i <= 200000; i++) {
      const x = i / 200000
      const v = P.average(x, p)
      if (v < best[1]) best = [x, v]
    }
    return best
  }
  check('a grid search over x (step 5e-6) finds the same optimum and cost', ps.every((p) => {
    const [x, v] = grid(p)
    return Math.abs(x - P.optimumShare(p)) < 1e-4 && Math.abs(v - P.optimumCost(p)) < 1e-9
  }))
  check('the closed form 1 − p(p + 1)^(−(p+1)/p) equals the average cost at x*', ps.every((p) => close(P.optimumCost(p), P.average(P.optimumShare(p), p))))
  check('the price of anarchy grows without limit: above 3.5 at p = 10, rising in p', ps.every((p, i) => i === 0 || P.priceOfAnarchy(p) > P.priceOfAnarchy(ps[i - 1])) && P.priceOfAnarchy(10) > 3.5)
  check('at p = 1 the average cost at x = 0.25, 0.5, 0.75, 1 is 0.8125, 0.75, 0.8125, 1', same([0.25, 0.5, 0.75, 1].map((x) => P.average(x, 1)), [0.8125, 0.75, 0.8125, 1]))
  const t1 = P.withToll(1)
  check('with the toll at p = 1: time plus toll is 1 on both roads, the revenue 0.25', close(P.timePlusToll(t1.share, 1), 1) && close(t1.paid, 1) && close(t1.revenue, 0.25))
  check('with the toll, time plus toll is 1 at x* for every p (drivers stop at the optimum)', ps.every((p) => close(P.timePlusToll(P.optimumShare(p), p), 1)))
  check('selfish drivers: the lower road never costs more than 1, so everyone takes it and pays 1', P.EQ_SHARE === 1 && P.EQ_COST === 1)
  check('exercise 1: 1/√3 = 0.577; 1 − 2/(3√3) = 0.615; 1.626; 2x² = 2/3 at the optimum',
    close(P.optimumShare(2), 1 / Math.sqrt(3)) && f3(P.optimumShare(2)) === '0.577' && close(P.optimumCost(2), 1 - 2 / (3 * Math.sqrt(3))) && f3(P.optimumCost(2)) === '0.615' && f3(P.priceOfAnarchy(2)) === '1.626' && close(P.withToll(2).toll, 2 / 3))
}

// ------------------------------------------------------------------ F2, Braess

console.log('— F2: Braess\'s paradox')
{
  const e0 = B.equilibrium(0)
  const e25 = B.equilibrium(0.25)
  const e5 = B.equilibrium(0.5)
  const sh = (e) => [e.shares.u, e.shares.l, e.shares.z]
  check('c = 0: (0, 0, 1), cost 2', same(sh(e0), [0, 0, 1]) && e0.cost === 2 && close(e0.average, 2))
  check('c = 0.25: (0.25, 0.25, 0.5), cost 1.75', same(sh(e25), [0.25, 0.25, 0.5]) && e25.cost === 1.75 && close(e25.average, 1.75))
  check('c = 0.5 and above: (0.5, 0.5, 0), 1.5', [0.5, 0.6, 0.75, 1].every((c) => same(sh(B.equilibrium(c)), [0.5, 0.5, 0]) && B.equilibrium(c).cost === 1.5))
  check('closed: (0.5, 0.5, 0), 1.5', same(sh(B.equilibrium(0, false)), [0.5, 0.5, 0]) && B.equilibrium(0.3, false).cost === 1.5)
  const cs = Array.from({ length: 21 }, (_, i) => i * 0.05)
  check('the formula agrees with a direct check of Wardrop\'s conditions at every c of the slider, open and closed',
    cs.every((c) => B.isWardrop(B.equilibrium(c).shares, c, true) && B.isWardrop(B.equilibrium(c, false).shares, c, false)))
  check('  and the closed network\'s split is not an equilibrium once a shortcut faster than 1/2 opens', cs.every((c) => B.isWardrop({ u: 0.5, l: 0.5, z: 0 }, c, true) === (c >= 0.5 - 1e-12)))
  check('every route in use costs 2 − c below 1/2 (the route costs equal the formula)', cs.filter((c) => c < 0.5).every((c) => {
    const e = B.equilibrium(c)
    return close(e.costs.upper, 2 - c) && close(e.costs.lower, 2 - c) && close(e.costs.zigzag, 2 - c) && close(e.average, 2 - c)
  }))
  check('and no other split satisfies Wardrop (grid of shares, step 0.01, c = 0, 0.25)', [0, 0.25].every((c) => {
    let found = 0
    for (let i = 0; i <= 100; i++) for (let j = 0; i + j <= 100; j++) {
      const s = { u: i / 100, l: j / 100, z: (100 - i - j) / 100 }
      if (B.isWardrop(s, c, true, 1e-9)) {
        found++
        if (!(close(s.u, B.equilibrium(c).shares.u, 1e-9) && close(s.z, B.equilibrium(c).shares.z, 1e-9))) return false
      }
    }
    return found === 1
  }))
  // The planner: grid search over the shares.
  const plan = (c) => {
    let best = Infinity
    for (let i = 0; i <= 200; i++) for (let j = 0; i + j <= 200; j++) best = Math.min(best, B.totalCost({ u: i / 200, l: j / 200, z: (200 - i - j) / 200 }, c))
    return best
  }
  check('the planner\'s cost is 1.5 at every c (grid search, step 0.005), without the shortcut', cs.every((c) => close(plan(c), 1.5, 1e-12)) && B.PLANNER === 1.5)
  check('exercise 2: at c = 0.25 the shares are 0.25, 0.25, 0.5 and the cost 1.75', same(sh(e25), [0.25, 0.25, 0.5]) && e25.cost === 1.75)
  const [, ms] = time(() => {
    for (let i = 0; i < 1000; i++) B.equilibrium(i / 1000)
    B.curve(100)
  })
  info(`F2: 1,000 equilibria and the curve in ${ms.toFixed(1)} ms`)
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: parallel roads')
{
  const pig = (d) => A.solve(A.PIGOU.a, A.PIGOU.b, d, A.PIGOU.r)
  check('"Pigou" for d = 1, 2, 3, 4: 4/3, 1.6258, 1.8956, 2.1505, equal to F1\'s ratio at p = d',
    [1, 2, 3, 4].every((d) => close(pig(d).ratio, P.priceOfAnarchy(d))) && same([1, 2, 3, 4].map((d) => f4(pig(d).ratio)), ['1.3333', '1.6258', '1.8956', '2.1505']))
  const v3 = (x) => `(${x.map(f4).join(', ')})`
  {
    const a = [1, 2, 0.5]
    const b = [0, 0.5, 1]
    const s1 = A.solve(a, b, 1, 1)
    const s2 = A.solve(a, b, 1, 2)
    check('a = (1, 2, 0.5), b = (0, 0.5, 1), d = 1, r = 1: (0.8333, 0.1667, 0), 0.8333; (0.6071, 0.1786, 0.2143), 0.7589; 1.0980',
      v3(s1.eq) === '(0.8333, 0.1667, 0.0000)' && f4(s1.eqCost) === '0.8333' && v3(s1.opt) === '(0.6071, 0.1786, 0.2143)' && f4(s1.optCost) === '0.7589' && f4(s1.ratio) === '1.0980',
      `${v3(s1.eq)} ${f4(s1.eqCost)} ${v3(s1.opt)} ${f4(s1.optCost)} ${f4(s1.ratio)}`)
    check('  exact: equilibrium 5/6, 1/6 at level 5/6; optimum 17/28, 5/28, 3/14', close(s1.eq[0], 5 / 6) && close(s1.eq[1], 1 / 6) && close(s1.level, 5 / 6) && close(s1.opt[0], 17 / 28) && close(s1.opt[1], 5 / 28) && close(s1.opt[2], 3 / 14))
    check('r = 2: (1.2143, 0.3571, 0.4286), 2.4286; (0.8929, 0.3214, 0.7857), 2.2589; 1.0751',
      v3(s2.eq) === '(1.2143, 0.3571, 0.4286)' && f4(s2.eqCost) === '2.4286' && v3(s2.opt) === '(0.8929, 0.3214, 0.7857)' && f4(s2.optCost) === '2.2589' && f4(s2.ratio) === '1.0751',
      `${v3(s2.eq)} ${f4(s2.eqCost)} ${v3(s2.opt)} ${f4(s2.optCost)} ${f4(s2.ratio)}`)
  }
  {
    const s1 = A.solve([1, 1], [0, 0.5], 1, 1)
    const s2 = A.solve([1, 1], [0, 0.5], 2, 1)
    const v2 = (x) => `(${x.map(f4).join(', ')})`
    check('a = (1, 1), b = (0, 0.5), r = 1, d = 1: (0.75, 0.25), 0.75; (0.625, 0.375), 0.71875; 1.0435',
      close(s1.eq[0], 0.75) && close(s1.eq[1], 0.25) && close(s1.eqCost, 0.75) && close(s1.opt[0], 0.625) && close(s1.opt[1], 0.375) && close(s1.optCost, 0.71875) && f4(s1.ratio) === '1.0435')
    check('d = 2: (0.75, 0.25), 0.5625; (0.5833, 0.4167), 0.4792; 1.1739',
      close(s2.eq[0], 0.75) && close(s2.eqCost, 0.5625) && v2(s2.opt) === '(0.5833, 0.4167)' && f4(s2.optCost) === '0.4792' && f4(s2.ratio) === '1.1739', `${v2(s2.eq)} ${f4(s2.eqCost)} ${v2(s2.opt)} ${f4(s2.optCost)} ${f4(s2.ratio)}`)
    check('exercise 3: tolls x·c\'(x) at the optimum are 0.625 and 0.375, and with them the equilibrium is the optimum',
      close(s1.opt[0] * 1, 0.625) && close(s1.opt[1] * 1, 0.375) && (() => {
        const tolled = A.equilibrium([1, 1], [0 + 0.625, 0.5 + 0.375], 1, 1)
        return close(tolled.flows[0], 0.625) && close(tolled.flows[1], 0.375)
      })())
  }
  // Independent: the equilibrium satisfies Wardrop's conditions; the optimum
  // has equal marginal costs; neither can be beaten by moving a little flow.
  {
    const random = mulberry32(99)
    let okW = true
    let okLocal = true
    for (let k = 0; k < 300; k++) {
      const n = 2 + Math.floor(random() * 9)
      const d = 1 + Math.floor(random() * 4)
      const r = 0.1 + Math.floor(random() * 50) / 10
      const { a, b } = A.randomInstance(n, random)
      if (k % 10 === 0) a[0] = 0 // some roads of constant cost
      const s = A.solve(a, b, d, r)
      const L = Math.min(...s.eq.map((x, i) => (x > 1e-12 ? A.roadCost(a[i], b[i], d, x) : Infinity)))
      const tol = 1e-9 * Math.max(1, L)
      for (let i = 0; i < n; i++) {
        const ci = A.roadCost(a[i], b[i], d, s.eq[i])
        if (s.eq[i] > 1e-12 && Math.abs(ci - L) > tol) okW = false
        if (s.eq[i] <= 1e-12 && ci < L - tol) okW = false
      }
      if (Math.abs(s.eq.reduce((x, y) => x + y, 0) - r) > 1e-12 * r || Math.abs(s.opt.reduce((x, y) => x + y, 0) - r) > 1e-12 * r) okW = false
      // Moving 1e-4 of the flow between two roads never lowers the optimum's cost.
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (i === j || s.opt[i] < 1e-4) continue
        const g = [...s.opt]
        g[i] -= 1e-4
        g[j] += 1e-4
        if (A.totalCost(a, b, d, g) < s.optCost - 1e-12) okLocal = false
      }
    }
    check('300 random instances (n 2–10, d 1–4, r 0.1–5, some constant roads): Wardrop\'s conditions hold within 1e-9, flows add up to r within 1e-12', okW)
    check('  and moving 1e-4 of flow between two roads never lowers the optimum\'s cost', okLocal)
  }
  {
    const s = A.solve([0, 0, 1], [0.3, 0.3, 0], 1, 1)
    check('constant roads: two at 0.3 and x: x carries 0.3, the two share the other 0.7 at level 0.3', close(s.eq[2], 0.3) && close(s.eq[0], 0.35) && close(s.eq[1], 0.35) && close(s.level, 0.3))
  }
  // The bound and the doubled demand over the whole grid.
  {
    let maxOver = -Infinity
    let allDoubled = true
    const [, ms] = time(() => {
      for (const n of [2, 3, 5, 10]) for (const d of [1, 2, 4]) for (const r of [0.5, 1, 2]) {
        const s = A.survey(n, d, r)
        maxOver = Math.max(maxOver, s.largest - A.bound(d))
        if (!s.allDoubled) allDoubled = false
      }
    })
    check('1,000 instances for each (n, d, r) in {2, 3, 5, 10} × {1, 2, 4} × {0.5, 1, 2}: the ratio never exceeds the bound for d', maxOver <= 1e-12, `largest margin ${maxOver.toExponential(2)}`)
    check('  and the equilibrium never costs more than the optimum with demand 2r', allDoubled)
    info(`Panel A: the 36 surveys of 1,000 instances in ${(ms / 1000).toFixed(2)} s`)
  }
  {
    const want = { 1: [1.038, 1.25, 0.29], 2: [1.097, 1.536, 0.54], 4: [1.236, 2.091, 0.7] }
    for (const d of [1, 2, 4]) {
      const [s, ms] = time(() => A.survey(3, d, 1))
      info(`survey n = 3, d = ${d}, r = 1 (seed 1): mean ${f3(s.mean)}, largest ${f3(s.largest)}, share above 1.05 ${f2(s.above)} (prompt: ${want[d].join(', ')}); ${ms.toFixed(0)} ms`)
    }
    for (const d of [1, 2, 4]) {
      const rows = []
      for (let seed = 1; seed <= 10; seed++) {
        const s = A.survey(3, d, 1, 1000, seed)
        rows.push(`${f3(s.mean)}/${f3(s.largest)}/${f2(s.above)}`)
      }
      info(`  d = ${d}, seeds 1–10 (mean/largest/above): ${rows.join(' ')}`)
    }
  }
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: drivers who count')
const avgOf = (g, p) => F.div(T.totalCost(g, p), fr(g.players.length))
{
  const g = T.braessGame(10, 0)
  const s = T.braessSurvey(10, 0)
  const list = (sv) => sv.equilibria.map((e) => `(${e.counts.join(', ')}) ${f2(N(e.cost))}`).join('; ')
  check('n = 10, c = 0: optimum 1.5 per driver at (5, 5, 0)', same(s.opt.counts, [5, 5, 0]) && feq(s.opt.cost, fr(3, 2)))
  check('equilibria (0, 0, 10) at 2, (0, 1, 9) and (1, 0, 9) at 1.91, (1, 1, 8) at 1.82, and no other', s.equilibria.length === 4
    && ['0,0,10:2', '0,1,9:191/100', '1,0,9:191/100', '1,1,8:91/50'].every((w) => s.equilibria.some((e) => `${e.counts}:${F.show(e.cost)}` === w)), list(s))
  check('price of anarchy 4/3, of stability 1.2133', feq(s.poa, fr(4, 3)) && f4(N(s.pos)) === '1.2133')
  const s25 = T.braessSurvey(10, 0.25)
  check('c = 1/4: a single equilibrium (3, 3, 4) at 1.68 (ratio 1.12)', s25.equilibria.length === 1 && same(s25.equilibria[0].counts, [3, 3, 4]) && feq(s25.best.cost, fr(42, 25)) && feq(s25.pos, fr(28, 25)), list(s25))
  const s50 = T.braessSurvey(10, 0.5)
  check('c = 1/2: (5, 5, 0) at 1.5', s50.equilibria.length === 1 && same(s50.equilibria[0].counts, [5, 5, 0]) && feq(s50.best.cost, fr(3, 2)), list(s50))
  // The survey by counts against the generic engine on every profile (n = 6).
  {
    const g6 = T.braessGame(6, 0)
    const byEngine = new Set()
    for (const p of T.allProfiles(g6)) if (T.isEquilibrium(g6, p)) byEngine.add(T.counts(p).join(','))
    const byCounts = new Set(T.braessSurvey(6, 0).equilibria.map((e) => e.counts.join(',')))
    check('the equilibria by counts are those of the engine over all 729 profiles (n = 6, c = 0)', same([...byEngine].sort(), [...byCounts].sort()), [...byEngine].join(' '))
  }
  // Dynamics from all on the upper route.
  const run = (c, start) => {
    const gg = T.braessGame(10, c)
    return { gg, ...T.toTheEnd(gg, T.startState(T.braessStart(gg, start))) }
  }
  {
    const r0 = run(0, 'upper')
    const names = T.BRAESS_ROUTES
    const desc = r0.moves.map((m) => `${m.player + 1}:${names[m.from]}→${names[m.to]} ${F.show(m.gain)}`).join(', ')
    check('c = 0 from all on the upper route: nine switches, driver 1 to lower (gain 0.9), drivers 2 to 9 to zigzag (gains 0.8 down to 0.1)',
      r0.moves.length === 9 && r0.moves[0].player === 0 && r0.moves[0].to === 1 && feq(r0.moves[0].gain, fr(9, 10))
      && r0.moves.slice(1).every((m, k) => m.player === k + 1 && m.to === 2 && feq(m.gain, fr(8 - k, 10))), desc)
    check('  ending at (1, 1, 8), Φ from 15.5 to 11', same(T.counts(r0.state.profile), [1, 1, 8]) && feq(r0.moves[0].phiBefore, fr(31, 2)) && feq(r0.moves[8].phiAfter, fr(11)))
    check('  every switch: the gain equals the drop of Φ', r0.moves.every((m) => feq(m.gain, m.drop)))
    check('  and the nine gains add up to 4.5', feq(F.sum(r0.moves.map((m) => m.gain)), fr(9, 2)))
    const r25 = run(0.25, 'upper')
    check('c = 1/4: seven switches to (3, 3, 4), final Φ 12.6', r25.moves.length === 7 && same(T.counts(r25.state.profile), [3, 3, 4]) && feq(T.potential(r25.gg, r25.state.profile), fr(63, 5)))
    const h0 = run(0, 'half')
    const h25 = run(0.25, 'half')
    check('from half upper, half lower: c = 0, eight switches to (1, 1, 8); c = 1/4, four to (3, 3, 4)',
      h0.moves.length === 8 && same(T.counts(h0.state.profile), [1, 1, 8]) && h25.moves.length === 4 && same(T.counts(h25.state.profile), [3, 3, 4]))
    check('  every switch, from every start and c of the slider (n = 10, seeds 1–10 for random): gain = drop of Φ, and the end is an equilibrium', (() => {
      for (let i = 0; i <= 20; i++) for (const open of [true, false]) {
        const c = i / 20
        const gg = T.braessGame(10, c, open)
        for (const start of ['upper', 'half', ...Array.from({ length: 10 }, (_, k) => k + 1)]) {
          const p0 = typeof start === 'number' ? T.braessStart(gg, 'random', start) : T.braessStart(gg, start)
          const r = T.toTheEnd(gg, T.startState(p0))
          if (!r.moves.every((m) => feq(m.gain, m.drop) && F.cmp(m.gain, F.ZERO) > 0)) return false
          if (!T.isEquilibrium(gg, r.state.profile)) return false
        }
      }
      return true
    })())
  }
  // Other n at c = 0.
  {
    const row = (n, c = 0, open = true) => {
      const s = T.braessSurvey(n, c, open)
      return { s, opt: N(s.opt.cost), best: N(s.best.cost), worst: N(s.worst.cost), bestC: s.best.counts, worstC: s.worst.counts }
    }
    const n2 = row(2)
    const n3 = row(3)
    const n4 = row(4)
    const n20 = row(20)
    check('n = 2: optimum 1.5; best 1.5 at (1, 1, 0), worst 2', n2.opt === 1.5 && n2.best === 1.5 && same(n2.bestC, [1, 1, 0]) && n2.worst === 2)
    check('n = 3: optimum 1.5556 at (1, 1, 1); best 1.5556, worst 2 (ratio 1.2857)', f4(n3.opt) === '1.5556' && same(n3.s.opt.counts, [1, 1, 1]) && f4(n3.best) === '1.5556' && n3.worst === 2 && f4(n3.worst / n3.opt) === '1.2857')
    check('n = 4: optimum 1.5; best 1.625 at (1, 1, 2), worst 2', n4.opt === 1.5 && n4.best === 1.625 && same(n4.bestC, [1, 1, 2]) && n4.worst === 2)
    check('n = 20: optimum 1.5; best 1.905 at (1, 1, 18), worst 2', n20.opt === 1.5 && n20.best === 1.905 && same(n20.bestC, [1, 1, 18]) && n20.worst === 2)
    const m20 = row(20, 0.25)
    check('n = 20, c = 1/4: best 1.68 at (6, 6, 8), worst 1.75 at (5, 5, 10)', m20.best === 1.68 && same(m20.bestC, [6, 6, 8]) && m20.worst === 1.75 && same(m20.worstC, [5, 5, 10]))
    check('without the shortcut: optimum and every equilibrium 1.5 for even n (2 to 40)', Array.from({ length: 20 }, (_, i) => 2 * i + 2).every((n) => {
      const s = T.braessSurvey(n, 0, false)
      return N(s.opt.cost) === 1.5 && s.equilibria.every((e) => N(e.cost) === 1.5)
    }))
    info(`n = 3 at c = 0, equilibria: ${n3.s.equilibria.map((e) => `(${e.counts.join(', ')}) ${f4(N(e.cost))}`).join('; ')}`)
    const [, ms] = time(() => {
      const gg = T.braessGame(40, 0)
      T.toTheEnd(gg, T.startState(T.braessStart(gg, 'upper')))
      T.braessSurvey(40, 0)
    })
    info(`n = 40: "To the end" from all upper plus the survey in ${ms.toFixed(0)} ms`)
  }
  // Four drivers.
  {
    const g4 = T.fourGame()
    const all = T.enumerate(g4)
    const totals = all.map((x) => N(x.total))
    const eqs = all.filter((x) => x.eq)
    check('four drivers: 16 profiles, totals from 4 to 13', all.length === 16 && Math.min(...totals) === 4 && Math.max(...totals) === 13, totals.join(' '))
    check('exactly two equilibria: all direct (4, Φ = 4) and all detours (10, Φ = 8); ratio 5/2',
      eqs.length === 2 && same(eqs[0].profile, [0, 0, 0, 0]) && N(eqs[0].total) === 4 && N(eqs[0].phi) === 4 && same(eqs[1].profile, [1, 1, 1, 1]) && N(eqs[1].total) === 10 && N(eqs[1].phi) === 8)
    const det = [1, 1, 1, 1]
    const n = T.loads(g4, det)
    check('exercise 6: from all detours each switch leaves the switcher\'s cost unchanged (3 for drivers 1 and 2, 2 for drivers 3 and 4)',
      [3, 3, 2, 2].every((c, i) => N(T.playerCost(g4, det, i, n)) === c && N(T.costIfSwitch(g4, det, i, 0, n)) === c))
    const ends = []
    for (let seed = 1; seed <= 10; seed++) {
      const r = T.toTheEnd(g4, T.startState(T.fourStart('random', seed)))
      ends.push(r.state.profile.join(''))
      if (!r.moves.every((m) => feq(m.gain, m.drop))) check(`four drivers seed ${seed}: gain = drop of Φ`, false)
    }
    info(`four drivers, random starts seeds 1–10: starts ${Array.from({ length: 10 }, (_, k) => T.fourStart('random', k + 1).join('')).join(' ')}; ends ${ends.join(' ')} (0 = direct, 1 = detour)`)
    check('random starts (seeds 1 to 10) all end at an equilibrium', ends.every((e) => e === '0000' || e === '1111'))
  }
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: sharing the cost of a road')
{
  const H = (k) => N(F.harmonic(k))
  check('H_2 to H_5: 1.5, 1.8333, 2.0833, 2.2833; H_10 2.928968, H_20 3.597740',
    same([2, 3, 4, 5].map((k) => f4(H(k))), ['1.5000', '1.8333', '2.0833', '2.2833']) && H(10).toFixed(6) === '2.928968' && H(20).toFixed(6) === '3.597740')
  const hubRun = (k, eps = 0.1) => {
    const g = C.hubGame(k, eps)
    return { g, ...T.toTheEnd(g, T.startState(C.shared(g))) }
  }
  for (const k of [3, 4, 5, 10]) {
    const r = hubRun(k)
    check(`the hub, k = ${k}, ε = 0.1: from everyone at the hub every player leaves, in the order k, k − 1, ..., 1`, same(r.moves.map((m) => m.player + 1), Array.from({ length: k }, (_, i) => k - i)) && r.state.profile.every((s) => s === 0))
  }
  {
    const r = hubRun(20)
    const order = r.moves.map((m) => m.player + 1)
    check('k = 20: the turn order gives 19, 20, 17, 18, 15, 16, 13, 14, 11, 12, then 10 down to 1', same(order, [19, 20, 17, 18, 15, 16, 13, 14, 11, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]), order.join(' '))
  }
  const ratios = [3, 4, 5, 10, 20].map((k) => {
    const g = C.hubGame(k, 0.1)
    const eq = C.equilibria(g)
    return { k, eq, ratio: N(F.div(eq[0].cost, C.optimum(g))) }
  })
  check('the equilibrium costs H_k and is the only one; ratios 1.6667 (k = 3), 1.8939 (4), 2.0758 (5), 2.6627 (10), 3.2707 (20)',
    ratios.every((x) => x.eq.length === 1 && feq(x.eq[0].cost, F.harmonic(x.k))) && same(ratios.map((x) => f4(x.ratio)), ['1.6667', '1.8939', '2.0758', '2.6627', '3.2707']), ratios.map((x) => f4(x.ratio)).join(' '))
  {
    const g = C.hubGame(10, 0.01)
    check('at ε = 0.01 and k = 10, 2.9000', f4(N(F.div(C.equilibria(g)[0].cost, C.optimum(g)))) === '2.9000')
  }
  check('the optimum is min(1 + ε, H_k): 1.1 for k ≥ 2 at ε = 0.1; H_1 = 1 for k = 1', feq(C.optimum(C.hubGame(4, 0.1)), fr(11, 10)) && feq(C.optimum(C.hubGame(1, 0.1)), fr(1)))
  check('the list of the hub\'s equilibria is the brute force over all 2^k profiles (k = 2 to 10; ε = 0.01, 0.1, 0.5, and ties at ε = 0.5, k = 2)', (() => {
    for (let k = 2; k <= 10; k++) for (const eps of [0.01, 0.1, 0.25, 0.5]) {
      const g = C.hubGame(k, eps)
      const brute = []
      for (const p of T.allProfiles(g)) if (T.isEquilibrium(g, p)) brute.push(p.join(''))
      const listed = C.equilibria(g).map((e) => e.profile.join(''))
      if (!same(brute.sort(), listed.sort())) return false
    }
    return true
  })())
  {
    const g = C.hubGame(2, 0.5)
    info(`hub k = 2, ε = 0.5 (a tie: 1.5/2 = 0.75 against 1/2 and 1): equilibria ${C.equilibria(g).map((e) => e.profile.join('')).join(' ')}`)
  }
  for (const k of [2, 5, 10]) {
    const g = C.twoRoadsGame(k, 0.1)
    const eq = C.equilibria(g)
    check(`two roads, k = ${k}, ε = 0.1: exactly two equilibria, all on B (1.1, the optimum) and all on A (${k}); worst/best = k/1.1`,
      eq.length === 2 && eq.some((e) => e.onA === 0 && feq(e.cost, fr(11, 10))) && eq.some((e) => e.onA === k && feq(e.cost, fr(k))) && feq(C.optimum(g), fr(11, 10)))
    const brute = []
    for (const p of T.allProfiles(g)) if (T.isEquilibrium(g, p)) brute.push(p.join(''))
    check(`  the same by brute force over all 2^${k} profiles`, same(brute.sort(), eq.map((e) => e.profile.join('')).sort()))
  }
  check('Φ = Σ_e c_e H(n_e) equals Rosenthal\'s sum, and every switch\'s gain equals the drop of Φ (hub and two roads, k 2–20, ε 0.01–0.5, random starts)', (() => {
    for (const k of [2, 3, 5, 10, 20]) for (const eps of [0.01, 0.1, 0.5]) for (const g of [C.hubGame(k, eps), C.twoRoadsGame(k, eps)]) {
      for (let seed = 1; seed <= 5; seed++) {
        const p0 = T.randomProfile(g, seed)
        if (!feq(C.phiShared(g, p0), T.potential(g, p0))) return false
        const r = T.toTheEnd(g, T.startState(p0))
        if (!r.moves.every((m) => feq(m.gain, m.drop) && F.cmp(m.gain, F.ZERO) > 0)) return false
        if (r.moves.length && !feq(r.moves[r.moves.length - 1].phiAfter, C.phiShared(g, r.state.profile))) return false
        if (!T.isEquilibrium(g, r.state.profile)) return false
      }
    }
    return true
  })())
  {
    const g = C.hubGame(4, 0.1)
    const eq = C.equilibria(g)[0]
    check('exercise 5: k = 4, ε = 0.1: 4, 3, 2, 1; H_4 = 25/12 ≈ 2.083 against 1.1, a ratio of 1.894', same(hubRun(4).moves.map((m) => m.player + 1), [4, 3, 2, 1]) && feq(eq.cost, fr(25, 12)) && f3(N(eq.cost)) === '2.083' && f3(N(eq.cost) / 1.1) === '1.894')
  }
  check('the H_k bound: the best equilibrium (smallest Φ) never costs more than H_k times the optimum (hub and two roads, k 2–12, ε 0.01–0.5, brute force)', (() => {
    for (let k = 2; k <= 12; k++) for (const eps of [0.01, 0.1, 0.5]) for (const g of [C.hubGame(k, eps), C.twoRoadsGame(k, eps)]) {
      let best = null
      for (const p of T.allProfiles(g)) {
        const phi = T.potential(g, p)
        if (!best || F.lt(phi, best.phi)) best = { p, phi }
      }
      if (!T.isEquilibrium(g, best.p)) return false
      if (F.cmp(T.totalCost(g, best.p), F.mul(F.harmonic(k), C.optimum(g))) > 0) return false
    }
    return true
  })())
  const [, ms] = time(() => {
    const g = C.hubGame(20, 0.1)
    T.toTheEnd(g, T.startState(C.shared(g)))
    C.equilibria(g)
  })
  info(`Panel C: k = 20 "To the end" and the list of equilibria in ${ms.toFixed(0)} ms`)
}

// ------------------------------------------------------------------ Quoted on the page

const textsPath = resolve(root, 'src/components/lab/game-theory/congestion-price-of-anarchy/texts.js')
const lecturePath = (l) => `src/content/game-theory-lab/congestion-price-of-anarchy.${l}.md`
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
  const vec = (x, d = 4) => [`(${x.map((v) => (v === 0 ? '0' : v.toFixed(d))).join(', ')})`, `(${x.map((v) => (v === 0 ? '0' : itn(v.toFixed(d)))).join('; ')})`]

  // ---- The lecture
  const b10 = T.braessSurvey(10, 0)
  const hub10 = N(F.harmonic(10))
  check('lecture numbers are the code\'s: 3/4 and 4/3; 1.626, 2.151, 3.512; 1.5, 2, 2 − c, 1/2; 1.896; 1.82 against 1.5, 2; 2.93',
    close(P.optimumCost(1), 0.75) && close(P.priceOfAnarchy(1), 4 / 3) && f3(P.priceOfAnarchy(2)) === '1.626' && f3(P.priceOfAnarchy(4)) === '2.151' && f3(P.priceOfAnarchy(10)) === '3.512'
    && f3(P.priceOfAnarchy(3)) === '1.896' && B.equilibrium(0).cost === 2 && B.equilibrium(0, false).cost === 1.5 && close(B.equilibrium(0.3).cost, 1.7) && f2(N(b10.best.cost)) === '1.82' && N(b10.worst.cost) === 2 && N(b10.opt.cost) === 1.5
    && hub10.toFixed(2) === '2.93' && close(P.withToll(1).toll, 0.5) && close(1 - P.optimumCost(1), 0.25))
  quoted('lecture: two roads', body, ['(1920)', ['1 hour', '1 ora'], '3/4', '4/3', ['price of anarchy', 'prezzo dell\'anarchia'], '(1999)', ['coordination ratio', '*coordination ratio*'], ['Papadimitriou 2001', 'Papadimitriou 2001'], 'x^p', '1.626 ', 'p = 2', '2.151 ', 'p = 4', '3.512 ', 'p = 10'])
  quoted('lecture: equal costs, and a hidden objective', body, ['(1952)', '(1956)', 'Σ_e ∫_0^{f_e} c_e(x) dx', 'Σ_e f_e c_e(f_e)', 'c_e(x) + x c_e\'(x)', 'x c_e\'(x)', '1/2', '1/2 + 1/2 = 1', '1/4'])
  quoted('lecture: Braess\'s paradox', body, ['(1968)', '1.5', 'x + 0 + x', '2', '1 − 2c', '2 − c', 'c < 1/2', ['(1991)', '(1991)'], '/network-lab/weights-flows-navigation'])
  quoted('lecture: how bad can it get', body, ['(2002)', 'a x + b', '4/3', ['Roughgarden (2003)', 'Roughgarden (2003)'], ['1.626 for p = 2', '1,626 per p = 2'], ['1.896 for p = 3', '1,896 per p = 3'], ['2.151 for p = 4', '2,151 per p = 4'], ['twice the traffic', 'doppio del traffico']])
  quoted('lecture: drivers who count', body, ['(1973)', 'Σ_e (c_e(1) + c_e(2) + ... + c_e(n_e))', '(1996)', '10', 'k/10', ['1, 1 and 8', '1, 1 e 8'], '1.82', '1.5', '2', '5/2', ['Awerbuch, Azar and Epstein 2005', 'Awerbuch, Azar ed Epstein 2005'], ['Christodoulou and Koutsoupias 2005', 'Christodoulou e Koutsoupias 2005'], ['Fabrikant, Papadimitriou and Talwar 2004', 'Fabrikant, Papadimitriou e Talwar 2004']])
  quoted('lecture: the best equilibrium', body, ['Σ_e c_e (1 + 1/2 + ... + 1/n_e)', 'H_k = 1 + 1/2 + ... + 1/k', '2.93', '1/i', '1 + ε', '(1 + ε)/k', '1/k', 'k/(1 + ε)', ['Wexler and Roughgarden 2004', 'Wexler e Roughgarden 2004']])
  check('the hub: the last player pays (1 + ε)/k, more than his own road\'s 1/k, at every ε > 0 (k = 2–20, ε = 0.01–0.5)', [2, 5, 10, 20].every((k) => [0.01, 0.1, 0.5].every((e) => (1 + e) / k > 1 / k)))

  // ---- What to observe
  {
    const { a, b } = A.instance(3, 1)
    const s1 = A.solve(a, b, 1, 1)
    const pig1 = A.solve(A.PIGOU.a, A.PIGOU.b, 1, 1)
    const pig4 = A.solve(A.PIGOU.a, A.PIGOU.b, 4, 1)
    const sv = (n, d, r) => A.survey(n, d, r)
    const s31 = sv(3, 1, 1)
    const s34 = sv(3, 4, 1)
    const s34a = sv(3, 4, 0.1)
    const s34b = sv(3, 4, 5)
    const s101 = sv(10, 1, 1)
    check('observe A: instance no. 1 leaves road 2 empty at equilibrium and at the optimum', s1.eq[1] === 0 && s1.opt[1] === 0)
    quoted('observe, Panel A', observe.parallel, [
      vec(s1.eq), f4(s1.eqCost), vec(s1.opt), f4(s1.optCost), f4(s1.ratio), f4(s1.opt2Cost), f4(pig1.ratio), f4(pig4.ratio),
      f3(s31.mean), f3(s31.largest), f2(s31.above), f3(s34.mean), f3(s34.largest), f3(A.bound(4)), f2(s34.above),
      ['r = **0.1**', 'r = **0,1**'], f3(s34a.mean), ['r = **5**', 'r = **5**'], f3(s34b.mean), f3(s34b.largest), f2(s34b.above), f3(s101.mean), f3(s101.largest), '4/3',
    ])
    check('observe A: every survey quoted held the doubled-demand check', [s31, s34, s34a, s34b, s101].every((s) => s.allDoubled))
  }
  {
    const run = (n, c, start, open = true, seed = 1) => {
      const g = T.braessGame(n, c, open)
      const p0 = T.braessStart(g, start, seed)
      return { g, p0, ...T.toTheEnd(g, T.startState(p0)) }
    }
    const avg = (r) => N(F.div(T.totalCost(r.g, r.state.profile), F.frac(r.g.n)))
    const r0 = run(10, 0, 'upper')
    const r25 = run(10, 0.25, 'upper')
    const r50 = run(10, 0.5, 'upper')
    const rc = run(10, 0, 'upper', false)
    const r40 = run(40, 0, 'upper')
    const s40 = T.braessSurvey(40, 0)
    const s25 = T.braessSurvey(10, 0.25)
    const g4 = T.fourGame()
    const f1 = T.fourStart('random', 1)
    const f1r = T.toTheEnd(g4, T.startState(f1))
    check('observe B: nine switches to (1, 1, 8); seven to (3, 3, 4), the only equilibrium; c = 0.5 ends at (5, 5, 0); closed: five switches to (5, 5, 0); n = 40: 39 switches to (1, 1, 38); the random four-driver start no. 1 is (detour, direct, detour, detour) and three switches, drivers 1, 3, 4, lead to all direct',
      r0.moves.length === 9 && same(T.counts(r0.state.profile), [1, 1, 8]) && r25.moves.length === 7 && same(T.counts(r25.state.profile), [3, 3, 4]) && s25.equilibria.length === 1
      && same(T.counts(r50.state.profile), [5, 5, 0]) && rc.moves.length === 5 && same(T.counts(rc.state.profile), [5, 5, 0]) && r40.moves.length === 39 && same(T.counts(r40.state.profile), [1, 1, 38])
      && same(f1, [1, 0, 1, 1]) && same(f1r.moves.map((m) => m.player + 1), [1, 3, 4]) && same(f1r.state.profile, [0, 0, 0, 0]))
    quoted('observe, Panel B', observe.atomic, [
      f4(N(r0.moves[0].gain)), f4(N(r0.moves[1].gain)), f4(N(r0.moves[8].gain)), f4(N(r0.moves[0].phiBefore)), f4(N(r0.moves[8].phiAfter)), f4(avg(r0)),
      f4(N(b10.opt.cost)), '(5, 5, 0)', f4(N(b10.best.cost)), '(1, 1, 8)', f4(N(b10.worst.cost)), '(0, 0, 10)', f4(N(b10.poa)), f4(N(b10.pos)),
      ['c = **0.25**', 'c a **0,25**'], '(3, 3, 4)', f4(avg(r25)), f4(N(s25.pos)), ['c = **0.5**', 'c = **0,5**'], f4(avg(r50)), f4(avg(rc)),
      ['n = **40**', 'n a **40**'], '39', '(1, 1, 38)', f4(avg(r40)), f4(N(s40.pos)),
      f4(N(T.totalCost(g4, [1, 1, 1, 1]))), f4(N(T.totalCost(g4, [0, 0, 0, 0]))), f4(N(T.totalCost(g4, [1, 1, 1, 1])) / 4), f4(N(T.totalCost(g4, f1))),
    ])
  }
  {
    const hub = (k, eps) => {
      const g = C.hubGame(k, eps)
      const r = T.toTheEnd(g, T.startState(C.shared(g)))
      return { g, r, ratio: N(C.equilibria(g)[0].cost) / N(C.optimum(g)) }
    }
    const h10 = hub(10, 0.1)
    const h01 = hub(10, 0.01)
    const h20 = hub(20, 0.1)
    const h5 = hub(10, 0.5)
    const two = C.twoRoadsGame(10, 0.1)
    const twoEq = C.equilibria(two)
    check('observe C: the orders 10 … 1; 19, 20, 17, 18, …; 7, 8, 9, 10, 5, 6, 3, 4, 2, 1; two roads: exactly two equilibria',
      same(h10.r.moves.map((m) => m.player + 1), [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]) && same(h01.r.moves.map((m) => m.player + 1), [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      && same(h20.r.moves.slice(0, 10).map((m) => m.player + 1), [19, 20, 17, 18, 15, 16, 13, 14, 11, 12]) && same(h5.r.moves.map((m) => m.player + 1), [7, 8, 9, 10, 5, 6, 3, 4, 2, 1]) && twoEq.length === 2)
    quoted('observe, Panel C', observe.sharing, [
      f4(N(C.optimum(h10.g))), f4(N(h10.r.moves[0].gain)), f4(1.1 / 10), f4(0.1), f4(N(C.phiShared(h10.g, C.shared(h10.g)))), f4(hub10), f4(h10.ratio),
      ['ε = **0.01**', 'ε a **0,01**'], f4(h01.ratio), ['k = **20**', 'k a **20**'], '19, 20, 17, 18, 15, 16, 13, 14, 11, 12', f4(h20.ratio),
      ['ε = **0.5**', 'ε = **0,5**'], '7, 8, 9, 10, 5, 6, 3, 4, 2, 1', f4(h5.ratio), f4(N(twoEq[1].cost)), f4(N(twoEq[0].cost)), f4(10 / 1.1), '1.0000',
    ])
  }

  // ---- The exercises
  {
    const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
    quoted('exercise 1', sol(0), ['x³ + 1 − x', '3x² − 1', 'x* = 1/√3 = 0.577', '1 − 2/(3√3) = 0.615', '1/0.615 = 1.626', '2x²', '2/3', '1/3 + 2/3 = 1'])
    check('exercise 2 numbers are the code\'s: u = c, z = 1 − 2c, 2 − c; 0.25, 0.25, 0.5, 1.75', same([0.25, 0.25, 0.5], [B.equilibrium(0.25).shares.u, B.equilibrium(0.25).shares.l, B.equilibrium(0.25).shares.z]) && B.equilibrium(0.25).cost === 1.75)
    quoted('exercise 2', sol(1), ['2 − u', '2 − 2u + c', 'u = c', 'z = 1 − 2c', '2 − c', 'c = 0.25', '0.25', '0.5', '1.75'])
    {
      const s = A.solve([1, 1], [0, 0.5], 1, 1)
      check('exercise 3 numbers are the code\'s: (0.75, 0.25), 0.75; (0.625, 0.375), 0.71875 = 0.625² + 0.375 × 0.875; 1.0435; tolls 0.625 and 0.375 give 1.25 on both roads',
        close(s.eq[0], 0.75) && close(s.eqCost, 0.75) && close(s.opt[0], 0.625) && close(s.optCost, 0.71875) && close(0.625 ** 2 + 0.375 * 0.875, 0.71875) && f4(s.ratio) === '1.0435' && close(0.625 + 0.625, 1.25) && close(0.5 + 0.375 + 0.375, 1.25))
    }
    quoted('exercise 3', sol(2), ['x = 0.75', '0.71875', '0.625² + 0.375 × 0.875', '0.75/0.71875 = 1.0435', ['0.625 and 0.375', '0,625 e 0,375'], ['0.625 + 0.625 = 1.25', '0,625 + 0,625 = 1,25'], '0.875 + 0.375 = 1.25'])
    {
      const g = T.braessGame(10, 0)
      const p = T.fromCounts(1, 1, 8)
      const n = T.loads(g, p)
      const costs = [0, 1, 2].map((r) => N(T.playerCost(g, p, r === 0 ? 0 : r === 1 ? 1 : 2, n)))
      check('exercise 4 numbers are the code\'s: 1.9, 1.9, 1.8; 1.82; the upper driver would pay 2 and 1.9, a zigzag driver 1.9; Φ 15.5 and 11',
        same(costs, [1.9, 1.9, 1.8]) && N(T.costIfSwitch(g, p, 0, 1, n)) === 2 && N(T.costIfSwitch(g, p, 0, 2, n)) === 1.9 && N(T.costIfSwitch(g, p, 9, 0, n)) === 1.9 && N(T.costIfSwitch(g, p, 9, 1, n)) === 1.9
        && N(T.potential(g, T.fromCounts(10, 0, 0))) === 15.5 && N(T.potential(g, p)) === 11 && T.isEquilibrium(g, p))
    }
    quoted('exercise 4', sol(3), ['0.9', '1.9', '1.8', '(1.9 + 1.9 + 8 × 1.8)/10 = 1.82', '(1 + 2 + ... + 10)/10 + 10 = 5.5 + 10 = 15.5', '4.5 + 1 + 1 + 4.5 = 11', '4.5', '0.9 + 0.8 + ... + 0.1'])
    quoted('exercise 5', sol(4), ['1.1/4 = 0.275', '0.25', '1.1/3 ≈ 0.367', '1/3 ≈ 0.333', '1.1/2 = 0.55', '(0.5)', '4, 3, 2, 1', 'H_4 = 25/12 ≈ 2.083', '1.1', '1.894'])
    check('exercise 5 numbers are the code\'s: 0.275, 0.367, 0.333, 0.55', f3(1.1 / 4) === '0.275' && f3(1.1 / 3) === '0.367' && f3(1 / 3) === '0.333' && f2(1.1 / 2) === '0.55')
    {
      const g = T.fourGame()
      const dir = [0, 0, 0, 0]
      const n = T.loads(g, dir)
      check('exercise 6 numbers are the code\'s: from all direct a detour costs 4, 4, 2, 2; from all detours each switch leaves 3, 3, 2, 2',
        same([0, 1, 2, 3].map((i) => N(T.costIfSwitch(g, dir, i, 1, n))), [4, 4, 2, 2]))
    }
    quoted('exercise 6', sol(5), ['2 + 2 = 4', '2 + 1 = 3', '10/4 = 5/2', ['(3 for drivers 1 and 2, 2 for drivers 3 and 4)', '(3 per gli automobilisti 1 e 2, 2 per il 3 e il 4)']])
  }

  // ---- The rules of the lab
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language, with the DRAFT marker on the first line',
    ['en', 'it'].every((l) => words(body[l]) >= 1400 && words(body[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(body[l])}`).join(', '))
  const allText = (l) => lecture[l] + observe.parallel[l] + observe.atomic[l] + observe.sharing[l] + exercises.map((x) => x.statement[l] + x.solution[l]).join(' ')
  check('the texts never call the course free (roads of cost 0 are "costless")', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l))))
  check('the lecture links to the Network Lab\'s module 10 and has no Bitcoin box (Bitcoin named only in the "Next" section)',
    ['en', 'it'].every((l) => lecture[l].includes('(/network-lab/weights-flows-navigation)') && !lecture[l].includes('```box') && (body[l].match(/bitcoin/gi) || []).length === 1))
  check('the lecture never calls a road case "real" (none was found in a peer-reviewed study) and never says peer-reviewed', ['en', 'it'].every((l) => !/peer.reviewed|real road|caso reale/i.test(allText(l))))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
if (failures) process.exitCode = 1
