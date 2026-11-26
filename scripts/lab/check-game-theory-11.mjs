// Self-checks for Game Theory Lab module 11, "Auctions". They run the same
// code as the page (auctions.js, montecarlo.js, commonvalue.js, block.js) and
// compare it with exact values, with independent computations and with the
// numbers the texts quote.
//
//   node scripts/lab/check-game-theory-11.mjs
//
// Exits with code 1 if any check fails. Lines starting with INFO report
// numbers that are not checked (timings, simulated values).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  payoffF1, bestF1, winChanceF2, payoffF2, bestBidF2, bestPayoffF2, searchBestF2, bid, meanRevenue, noSale, sdClosed, moments, biddersPayoff, bestReserve, simpson, FORMATS,
} from '../../src/components/lab/game-theory/auctions/auctions.js'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { runAuctions } from '../../src/components/lab/game-theory/auctions/montecarlo.js'
import {
  profitExact, loseExact, tooHighExact, revenueExact, breakEven, eqDiscount, eqProfit, deviationPayoff, runCommonValue,
} from '../../src/components/lab/game-theory/auctions/commonvalue.js'
import { pybBid, meanExact, sdUniformExact, valueTopExact, runBlocks, monopolisticCurve, bidTable, logTail } from '../../src/components/lab/game-theory/auctions/block.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const T0 = performance.now()
const f = (v, d = 4) => (Object.is(Math.round(v * 10 ** d) / 10 ** d, -0) ? 0 : v).toFixed(d)
const near = (a, b, tol = 5e-5) => Math.abs(a - b) <= tol
const list = (xs, d = 4) => xs.map((x) => f(x, d)).join(', ')

// ------------------------------------------------------------------ F1

console.log('— F1: second price and first price, your payoff against your bid')
{
  check('second price, v = 60, h = 70: −10 at b = 80, 0 at b = 60', payoffF1('second', 60, 70, 80) === -10 && payoffF1('second', 60, 70, 60) === 0)
  check('second price, v = 60, h = 50: 0 at b = 40, 10 at b = 60', payoffF1('second', 60, 50, 40) === 0 && payoffF1('second', 60, 50, 60) === 10)
  check('a tie is won half the time: v = 60, h = b = 50 gives 5 (second) and 5 (first)', payoffF1('second', 60, 50, 50) === 5 && payoffF1('first', 60, 50, 50) === 5)
  let ok = 0
  let tot = 0
  for (let v = 0; v <= 100; v += 5) for (let h = 0; h <= 100; h += 5) {
    tot++
    const truth = payoffF1('second', v, h, v)
    let best = true
    for (let b = 0; b <= 100; b += 0.5) if (payoffF1('second', v, h, b) > truth + 1e-12) best = false
    if (best && bestF1('second', v, h).truthBest) ok++
  }
  check(`second price: b = v is a best bid for every v and h on a grid of 5 (${tot} pairs, bids in steps of 0.5)`, ok === tot, `${ok} of ${tot}`)
  check('first price, v = 60, h = 50: 60 − b for every b above 50, 0 below', [51, 55, 59.5, 60, 70].every((b) => payoffF1('first', 60, 50, b) === 60 - b) && [0, 30, 49.9].every((b) => payoffF1('first', 60, 50, b) === 0))
  let fp = 0
  for (let v = 5; v <= 100; v += 5) for (let h = 0; h < v; h += 5) if (payoffF1('first', v, h, v) === 0 && payoffF1('first', v, h, h + 0.5) > 0) fp++
  check('first price: bidding v always gives 0, and just above h does better whenever h < v', fp === 210, `${fp}`)
}

// ------------------------------------------------------------------ F2

console.log('— F2: how much to shade')
const F2CASES = [
  [80, 2, 40, 0.8, 32],
  [80, 5, 64, 0.4096, 6.5536],
  [50, 2, 25, 0.5, 12.5],
  [30, 3, 20, 0.09, 0.9],
  [100, 10, 90, 1, 10],
]
for (const [v, n, b, p, u] of F2CASES) {
  const bb = bestBidF2(n, v)
  const pw = winChanceF2(n, bb)
  const pay = payoffF2(n, v, bb)
  const s = searchBestF2(n, v)
  check(`v = ${v}, n = ${n}: best bid ${b}, chance ${p}, payoff ${u} (= v^n/(n·100^(n − 1))); a search finds the same bid`, near(bb, b, 1e-9) && near(pw, p, 1e-12) && near(pay, u, 1e-9) && near(bestPayoffF2(n, v), u, 1e-9) && near(s.bid, b, v / 100000 + 1e-9), `${bb}, ${pw}, ${pay}; search ${s.bid.toFixed(4)}`)
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: exact moments')
const MEANS = ['100/3', '50', '60', '200/3', '500/7', '75', '700/9', '80', '900/11'].map((s) => s.split('/').reduce((a, b) => a / b))
check('mean revenue for n = 2 … 10 is 100(n − 1)/(n + 1): 100/3, 50, 60, 200/3, 500/7, 75, 700/9, 80, 900/11', MEANS.every((m, i) => near(100 * meanRevenue(i + 2), m, 1e-9)))
const SDS = { 2: [23.5702, 11.7851, 21.0819], 3: [22.3607, 12.9099, 32.7327], 5: [17.8174, 11.2687, 44.9467], 10: [11.134, 7.4689, 56.4599] }
for (const [n, want] of Object.entries(SDS)) {
  const N = Number(n)
  const got = ['second', 'first', 'allpay'].map((fm) => 100 * sdClosed(fm, N))
  const num = ['second', 'first'].map((fm) => 100 * moments(fm, N, 0).sd)
  check(`n = ${n}: standard deviations (second, first, all-pay) ${want.join(', ')}; the numerical integration agrees`, got.every((g, i) => near(g, want[i])) && num.every((g, i) => near(g, got[i], 1e-6)), `${list(got)}; integrated ${list(num)}`)
}
check('the variance of the second price is 2n/(n − 1) times that of the first (n = 2 … 10)', [2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => near(sdClosed('second', n) ** 2 / sdClosed('first', n) ** 2, (2 * n) / (n - 1), 1e-12)))
const RES = [
  [2, 25, 37.5, 1 / 16, 20.2523, 12.606],
  [2, 50, 41.6667, 1 / 4, 25.6851, 24.2873],
  [3, 50, 53.125, 1 / 8, 23.5103, 20.9321],
  [5, 50, 67.1875, 1 / 32, 18.4594, 14.6155],
]
for (const [n, r, m, ns, s2, s1] of RES) {
  const rho = r / 100
  const a2 = moments('second', n, rho)
  const a1 = moments('first', n, rho)
  check(`n = ${n}, r = ${r}: mean ${m}, no sale ${ns}, standard deviations ${s2} (second) and ${s1} (first); the integrated means agree with the formula`, near(100 * meanRevenue(n, rho), m) && near(noSale(n, rho), ns, 1e-15) && near(100 * a2.sd, s2) && near(100 * a1.sd, s1) && near(a2.mean, meanRevenue(n, rho), 1e-9) && near(a1.mean, meanRevenue(n, rho), 1e-9), `${f(100 * meanRevenue(n, rho))}; ${f(100 * a2.sd)}, ${f(100 * a1.sd)}`)
}
{
  const want = { 2: 41.6667, 3: 53.125, 5: 67.1875, 10: 81.8271 }
  const got = Object.keys(want).map((n) => bestReserve(Number(n)))
  check('the best reserve is 50 for n = 2, 3, 5 and 10, with revenues 41.6667, 53.125, 67.1875, 81.8271', got.every((g, i) => near(g.rho, 0.5, 1e-4) && near(100 * g.mean, Object.values(want)[i])), got.map((g) => `${f(100 * g.rho, 2)}: ${f(100 * g.mean)}`).join('; '))
}
check('three bidders and no reserve: 50', near(100 * meanRevenue(3, 0), 50, 1e-9))
check('first-price bids with a reserve of 50: n = 2, v = 80: 55.625; v = 50: 50; n = 5, v = 80: 65.5259', near(100 * bid('first', 2, 0.8, 0.5), 55.625, 1e-9) && near(100 * bid('first', 2, 0.5, 0.5), 50, 1e-9) && near(100 * bid('first', 5, 0.8, 0.5), 65.5259), f(100 * bid('first', 5, 0.8, 0.5)))
check('all-pay bids at v = 80: 32 (n = 2), 26.2144 (n = 5)', near(100 * bid('allpay', 2, 0.8), 32, 1e-9) && near(100 * bid('allpay', 5, 0.8), 26.2144, 1e-9))
check("the bidders' total payoff without a reserve is 100/(n + 1): 33.3333, 16.6667, 9.0909 (n = 2, 5, 10)", [[2, 33.3333], [5, 16.6667], [10, 9.0909]].every(([n, w]) => near(100 * biddersPayoff(n, 0), w)))
check('no bid below the reserve; the first-price bid at the reserve is the reserve; the first-price bid is below the value', bid('first', 3, 0.4, 0.5) === null && near(bid('first', 3, 0.5, 0.5), 0.5, 1e-12) && [0.55, 0.7, 0.9, 1].every((x) => bid('first', 4, x, 0.5) < x))
{
  // At 100,000 auctions the simulated means are within 4 standard errors of the exact ones.
  const cases = [[2, 0], [2, 50], [3, 0], [5, 50], [10, 0], [10, 90]]
  const t = performance.now()
  let ok = 0
  let tot = 0
  const lines = []
  for (const [n, r] of cases) {
    const sim = runAuctions({ n, r, auctions: 100000, seed: 1 })
    for (const fm of FORMATS) {
      if (fm === 'allpay' && r > 0) continue
      tot++
      const rho = fm === 'allpay' ? 0 : r / 100
      const ex = 100 * meanRevenue(n, rho)
      const z = (sim[fm].mean - ex) / sim[fm].se
      const exSd = 100 * moments(fm, n, rho).sd
      const zNo = fm === 'allpay' ? 0 : (sim[fm].noSale - noSale(n, rho)) / Math.sqrt(Math.max(1e-12, (noSale(n, rho) * (1 - noSale(n, rho))) / 100000))
      if (Math.abs(z) < 4 && Math.abs(sim[fm].sd / exSd - 1) < 0.02 && Math.abs(zNo) < 4) ok++
      lines.push(`n ${n} r ${r} ${fm}: ${f(sim[fm].mean, 2)} ± ${f(sim[fm].se, 2)} (exact ${f(ex, 2)}, z ${z.toFixed(2)}), sd ${f(sim[fm].sd, 2)} (${f(exSd, 2)}), no sale ${f(sim[fm].noSale, 4)}`)
    }
  }
  const ms = performance.now() - t
  for (const l of lines) info(l)
  check(`at 100,000 auctions (run 1) the simulated means are within 4 standard errors, the standard deviations within 2% and the no-sale shares within 4 standard errors of the exact values (${tot} cases)`, ok === tot, `${ok} of ${tot}`)
  info(`Panel A: ${cases.length} runs of 100,000 auctions in ${Math.round(ms)} ms in Node`)
  const s2 = runAuctions({ n: 2, r: 0, auctions: 100000, seed: 1 })
  check("the simulated bidders' payoff with two bidders and no reserve is near 33.33 in the three formats", FORMATS.every((fm) => Math.abs(s2[fm].surplus - 100 / 3) < 0.5), FORMATS.map((fm) => f(s2[fm].surplus, 2)).join(', '))
  {
    // The panel's all-pay sum (products, scaled once) against bid() value by value.
    const r = runAuctions({ n: 7, r: 0, auctions: 5000, seed: 9 })
    const random = mulberry32(9)
    let s = 0
    for (let t = 0; t < 5000; t++) {
      let a = 0
      for (let i = 0; i < 7; i++) a += bid('allpay', 7, random())
      s += 100 * a
    }
    check('Panel A\'s all-pay revenue equals the sum of bid() over the same draws (n = 7, 5,000 auctions)', Math.abs(r.allpay.mean - s / 5000) < 1e-9, `${r.allpay.mean} vs ${s / 5000}`)
  }
  const t10 = performance.now()
  runAuctions({ n: 10, r: 0, auctions: 100000, seed: 2 })
  info(`Panel A at its largest (n = 10, 100,000 auctions): ${Math.round(performance.now() - t10)} ms in Node`)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: the winner\'s curse')
{
  const NS = [2, 3, 5, 10, 12]
  const a = 10
  const want = {
    first: [-3.3333, -5, -6.6667, -8.1818, -8.4615],
    second: [3.3333, 0, -3.3333, -6.3636, -6.9231],
    loseFirst: [0.75, 0.875, 0.96875, 0.99902, 0.99976],
    loseSecond: [0.25, 0.5, 0.8125, 0.98926, 0.99683],
    eqFirst: [6.6667, 5, 3.3333, 1.8182, 1.5385],
    eqSecond: [3.3333, 3.3333, 2.6667, 1.6364, 1.4103],
    discSecond: [0, 3.3333, 6, 8, 8.3333],
  }
  const g = {
    first: NS.map((n) => profitExact('first', n, a, 0)),
    second: NS.map((n) => profitExact('second', n, a, 0)),
    loseFirst: NS.map((n) => loseExact('first', n, a, 0)),
    loseSecond: NS.map((n) => loseExact('second', n, a, 0)),
    eqFirst: NS.map((n) => profitExact('first', n, a, eqDiscount('first', n, a))),
    eqSecond: NS.map((n) => profitExact('second', n, a, eqDiscount('second', n, a))),
    discSecond: NS.map((n) => eqDiscount('second', n, a)),
  }
  const same = (k, d = 4) => g[k].every((x, i) => f(x, d) === f(want[k][i], d))
  check('a = 10, n = 2, 3, 5, 10, 12, everyone bidding her estimate: first price −3.3333, −5, −6.6667, −8.1818, −8.4615', same('first'), list(g.first))
  check('… second price 3.3333, 0, −3.3333, −6.3636, −6.9231', same('second'), list(g.second))
  check('… the winner loses money with probability 0.75, 0.875, 0.96875, 0.99902, 0.99976 (first)', same('loseFirst', 5), list(g.loseFirst, 5))
  check('… and 0.25, 0.5, 0.8125, 0.98926, 0.99683 (second)', same('loseSecond', 5), list(g.loseSecond, 5))
  check('in equilibrium: first price (discount 10) 6.6667, 5, 3.3333, 1.8182, 1.5385 = 2a/(n + 1)', same('eqFirst') && NS.every((n, i) => near(g.eqFirst[i], eqProfit('first', n, a), 1e-12)) && NS.every((n) => eqDiscount('first', n, a) === 10), list(g.eqFirst))
  check('second price, discounts 0, 3.3333, 6, 8, 8.3333: 3.3333, 3.3333, 2.6667, 1.6364, 1.4103 = 2a(n − 1)/(n(n + 1))', same('eqSecond') && same('discSecond') && NS.every((n, i) => near(g.eqSecond[i], eqProfit('second', n, a), 1e-12)), list(g.eqSecond))
  check('the winner\'s estimate is too high with probability 1 − 2^(−n): 0.75 … 0.99976', NS.every((n, i) => near(tooHighExact(n), want.loseFirst[i], 5e-6)))
  check('the overpayment a(n − 1)/(n + 1) with a = 10: 3.33 with two bidders, 6.67 with five, 8.18 with ten', [2, 5, 10].map((n) => breakEven('first', n, 10).toFixed(2)).join(', ') === '3.33, 6.67, 8.18')
  check('the break-even discount: a(n − 1)/(n + 1) in the first price and a(n − 3)/(n + 1) in the second (profit 0 there)', [2, 5, 12].every((n) => near(profitExact('first', n, 7, breakEven('first', n, 7)), 0, 1e-12) && near(profitExact('second', n, 7, breakEven('second', n, 7)), 0, 1e-12)))
  check('the seller\'s revenue at a = 10, n = 5, k = 0: 156.6667 (first), 153.3333 (second)', near(revenueExact('first', 5, 10, 0), 156.6667) && near(revenueExact('second', 5, 10, 0), 153.3333))
}
{
  // The equilibria: one bidder moves her bid by d while the others keep to it.
  const DEV = {
    first: { 2: [3.3333, 3.2842, 3.3092], 5: [0.6667, 0.6417, 0.6448], 10: [0.1818, 0.1568, 0.1633] },
    second: { 3: [1.1111, 1.1106, 1.0955], 5: [0.5333, 0.5333, 0.5159], 10: [0.1636, 0.1636, 0.147] },
  }
  for (const fm of ['first', 'second']) for (const [n, want] of Object.entries(DEV[fm])) {
    const got = [0, 1, -1].map((d) => deviationPayoff(fm, Number(n), 10, d))
    check(`${fm} price, n = ${n}, a = 10: payoff ${want.join(', ')} at d = 0, +1, −1`, got.every((x, i) => f(x) === f(want[i])), list(got))
  }
  // d = 0 is a best response on a grid of d (weakly in the second price).
  let ok = 0
  let tot = 0
  for (const fm of ['first', 'second']) for (const n of [2, 3, 5, 10, 12]) {
    if (fm === 'second' && n === 2) continue
    tot++
    const p0 = deviationPayoff(fm, n, 10, 0)
    let best = true
    for (let d = -10; d <= 10; d += 0.25) if (deviationPayoff(fm, n, 10, d) > p0 + 1e-9) best = false
    if (best) ok++
  }
  check(`d = 0 is a best response on a grid of d from −10 to 10 in steps of 0.25 (first price n = 2, 3, 5, 10, 12; second price n = 3, 5, 10, 12)`, ok === tot, `${ok} of ${tot}`)
  check('the payoff at d = 0 is the winner\'s equilibrium profit divided by n (a = 10, both formats)', [3, 5, 10].every((n) => near(deviationPayoff('first', n, 10, 0), eqProfit('first', n, 10) / n, 1e-7) && near(deviationPayoff('second', n, 10, 0), eqProfit('second', n, 10) / n, 1e-7)))
  check('second price, n = 5 and 10: flat to four decimals above d = 0 (+0.5, +1), lower below', [5, 10].every((n) => f(deviationPayoff('second', n, 10, 0.5)) === f(deviationPayoff('second', n, 10, 0)) && f(deviationPayoff('second', n, 10, 1)) === f(deviationPayoff('second', n, 10, 0)) && deviationPayoff('second', n, 10, -1) < deviationPayoff('second', n, 10, 0) - 1e-3))
}
{
  const t = performance.now()
  let ok = 0
  let tot = 0
  for (const fm of ['first', 'second']) for (const [n, a, k] of [[2, 10, 0], [5, 10, 0], [5, 10, 10], [12, 25, -5], [3, 1, 2]]) {
    tot++
    const s = runCommonValue({ n, a, k, format: fm, auctions: 10000, seed: 1 })
    const z = (s.profit - profitExact(fm, n, a, k)) / s.se
    const pl = loseExact(fm, n, a, k)
    const zl = (s.lose - pl) / Math.sqrt(Math.max(1e-12, (pl * (1 - pl)) / 10000))
    const ph = tooHighExact(n)
    const zh = (s.tooHigh - ph) / Math.sqrt((ph * (1 - ph)) / 10000)
    if (Math.abs(z) < 4 && Math.abs(zl) < 4 && Math.abs(zh) < 4) ok++
    info(`Panel B ${fm} n ${n} a ${a} k ${k}: profit ${f(s.profit, 3)} ± ${f(s.se, 3)} (exact ${f(profitExact(fm, n, a, k), 3)}, z ${z.toFixed(2)}); loses ${f(s.lose, 4)} (${f(pl, 4)}); too high ${f(s.tooHigh, 4)}; revenue ${f(s.revenue, 2)} (${f(revenueExact(fm, n, a, k), 2)})`)
  }
  check(`simulated profits, losing shares and too-high shares within 4 standard errors (10,000 auctions, run 1, ${tot} cases)`, ok === tot, `${ok} of ${tot}`)
  info(`Panel B: ${tot} runs of 10,000 auctions in ${Math.round(performance.now() - t)} ms`)
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: a block for sale')
{
  const B = [
    [20, 10, [[10, 9.0189], [30, 26.3334], [50, 41.1901], [80, 49.9491], [100, 50]]],
    [20, 5, [[50, 46.1378], [80, 70.1388], [100, 75]]],
    [10, 3, [[50, 42.6087], [80, 64.2727], [100, 70]]],
  ]
  for (const [n, k, pts] of B) {
    const got = pts.map(([v]) => 100 * pybBid(n, k, v / 100))
    check(`pay-your-bid bids, n = ${n}, k = ${k}: ${pts.map(([v, b]) => `b(${v}) ${b}`).join(', ')}`, got.every((g, i) => f(g) === f(pts[i][1])), list(got))
  }
  check('k = 1 gives (n − 1)v/n (n = 2, 5, 20, 40; v = 10 … 100)', [2, 5, 20, 40].every((n) => [0.1, 0.37, 0.5, 0.8, 1].every((x) => near(pybBid(n, 1, x), ((n - 1) * x) / n, 1e-12))))
  check('k ≥ n: every bid is 0 (room for everyone)', [[20, 20], [20, 40], [5, 9]].every(([n, k]) => [0.2, 0.9].every((x) => pybBid(n, k, x) === 0)))
  // E[Y | Y < x], Y the k-th highest of the other n − 1 values, by integration.
  const condMean = (n, k, x) => {
    const N = n - 1
    const dens = (y) => y ** (N - k) * (1 - y) ** (k - 1)
    return simpson((y) => y * dens(y), 0, x, 4000) / simpson(dens, 0, x, 4000)
  }
  let ok = 0
  let tot = 0
  let worst = 0
  for (const [n, k] of [[20, 10], [20, 5], [10, 3], [40, 1], [40, 39], [7, 6], [30, 12]]) for (const x of [0.05, 0.2, 0.5, 0.77, 0.95]) {
    tot++
    const d = Math.abs(pybBid(n, k, x) - condMean(n, k, x))
    worst = Math.max(worst, d)
    if (d < 1e-8) ok++
  }
  check(`the formula equals E[Y | Y < v] by numerical integration (${tot} cases, n up to 40)`, ok === tot, `${ok} of ${tot}, largest difference ${worst.toExponential(1)}`)
  // Direct sums of the binomial tails agree with the log-space ones.
  const tailDirect = (N, x, m) => {
    let s = 0
    for (let j = m; j <= N; j++) {
      let c = 1
      for (let i = 0; i < j; i++) c = (c * (N - i)) / (i + 1)
      s += c * x ** j * (1 - x) ** (N - j)
    }
    return s
  }
  check('the binomial tails summed from the largest term equal the direct sums (N = 5 … 40, x = 0.01 … 0.99)', [5, 19, 20, 40].every((N) => [0.01, 0.3, 0.5, 0.9, 0.99].every((x) => [1, Math.floor(N / 2), N].every((m) => Math.abs(Math.exp(logTail(N, x, m)) / tailDirect(N, x, m) - 1) < 1e-10))))
  check('bids rise with the value and stay below it (n = 20, k = 10 and 5)', [10, 5].every((k) => {
    let prev = -1
    for (let v = 1; v <= 100; v++) {
      const b = pybBid(20, k, v / 100)
      if (b <= prev || b >= v / 100) return false
      prev = b
    }
    return true
  }))
}
{
  const M = [[5, 357.1429], [10, 476.1905], [15, 357.1429], [19, 90.4762], [20, 0], [40, 0]]
  check('n = 20: exact means 357.1429 (k = 5), 476.1905 (10), 357.1429 (15), 90.4762 (19), 0 (k ≥ 20)', M.every(([k, m]) => near(100 * meanExact(20, k), m)), M.map(([k]) => f(100 * meanExact(20, k))).join(', '))
  const S = [[5, 48.1571], [10, 106.4794], [15, 136.2089], [19, 86.2657]]
  check('n = 20: uniform-price standard deviations 48.1571, 106.4794, 136.2089, 86.2657', S.every(([k, s]) => near(100 * sdUniformExact(20, k), s)), S.map(([k]) => f(100 * sdUniformExact(20, k))).join(', '))
  check('n = 10, k = 5: 227.2727, 71.8699', near(100 * meanExact(10, 5), 227.2727) && near(100 * sdUniformExact(10, 5), 71.8699))
  check('the value of the k highest: 738.1 for 10 of 20, 1,000 for all 20', f(100 * valueTopExact(20, 10), 1) === '738.1' && f(100 * valueTopExact(20, 20), 1) === '1000.0')
  check('20 users and 10 slots: 10 × (10/21) × 100 = 476.19, 47.62 per winner', f(100 * meanExact(20, 10), 2) === '476.19' && f((100 * meanExact(20, 10)) / 10, 2) === '47.62')
}
{
  // Long runs (2,000,000 blocks) against the prompt's simulation, within 1%.
  const BLOCKS = 2000000
  const t = performance.now()
  const run = (n, k) => runBlocks({ n, k, blocks: BLOCKS, seed: 1 })
  let worst = 0
  for (const [n, k] of [[40, 1], [40, 20], [40, 39], [20, 10], [20, 5], [2, 1], [3, 2]]) {
    const tab = bidTable(n, k, 1 << 14)
    for (let i = 0; i < 20000; i++) worst = Math.max(worst, 100 * Math.abs(tab((i + 0.37) / 20000) - pybBid(n, k, (i + 0.37) / 20000)))
  }
  check('the page\'s table of the bid (16,385 points) is within 1e-6 of the formula on the 0–100 scale (n up to 40, 20,000 values each)', worst < 1e-6, worst.toExponential(1))
  {
    const a = runBlocks({ n: 20, k: 10, blocks: 20000, seed: 3 })
    const b = runBlocks({ n: 20, k: 10, blocks: 20000, seed: 3, bidFn: (x) => pybBid(20, 10, x) })
    check('20,000 blocks with the table and with the formula: the same pay-your-bid mean and standard deviation to 1e-4', Math.abs(a.pyb.mean - b.pyb.mean) < 1e-4 && Math.abs(a.pyb.sd - b.pyb.sd) < 1e-4, `${a.pyb.mean.toFixed(6)} vs ${b.pyb.mean.toFixed(6)}`)
  }
  const R = {}
  for (const [n, k] of [[20, 5], [20, 10], [20, 15], [20, 20], [20, 40], [10, 5], [10, 10]]) R[`${n},${k}`] = run(n, k)
  const ms = performance.now() - t
  const within = (x, w) => Math.abs(x / w - 1) <= 0.01
  const r = (n, k) => R[`${n},${k}`]
  for (const key of Object.keys(R)) {
    const x = R[key]
    info(`Panel C ${key} (2,000,000 blocks): pay-your-bid ${f(x.pyb.mean, 2)} sd ${f(x.pyb.sd, 2)}; uniform ${f(x.uniform.mean, 2)} sd ${f(x.uniform.sd, 2)}; monopolistic ${f(x.monopolistic.mean, 2)} sd ${f(x.monopolistic.sd, 2)}, served ${f(x.monopolistic.served, 3)}, value ${f(x.monopolistic.value, 2)} (all served ${f(x.uniform.value, 2)})`)
  }
  check('pay-your-bid standard deviation 16.03 (k = 5), 20.89 (10), 15.06 (15), within 1%', within(r(20, 5).pyb.sd, 16.03) && within(r(20, 10).pyb.sd, 20.89) && within(r(20, 15).pyb.sd, 15.06), `${f(r(20, 5).pyb.sd, 2)}, ${f(r(20, 10).pyb.sd, 2)}, ${f(r(20, 15).pyb.sd, 2)}`)
  check('monopolistic revenue 381.5, 546.8, 578.0, 579.0 (k = 5, 10, 15, 20) and the same at 40, within 1%', [[5, 381.5], [10, 546.8], [15, 578], [20, 579], [40, 579]].every(([k, w]) => within(r(20, k).monopolistic.mean, w)), [5, 10, 15, 20, 40].map((k) => f(r(20, k).monopolistic.mean, 1)).join(', '))
  check('users served 4.97, 9.21, 10.98, 11.08, within 1%', [[5, 4.97], [10, 9.21], [15, 10.98], [20, 11.08]].every(([k, w]) => within(r(20, k).monopolistic.served, w)), [5, 10, 15, 20].map((k) => f(r(20, k).monopolistic.served, 2)).join(', '))
  check('value served 700.2 against 738.1 (k = 10), 791.3 against 1,000.0 (k = 20), within 1%', within(r(20, 10).monopolistic.value, 700.2) && within(r(20, 10).uniform.value, 738.1) && within(r(20, 20).monopolistic.value, 791.3) && within(r(20, 20).uniform.value, 1000), `${f(r(20, 10).monopolistic.value, 1)}, ${f(r(20, 10).uniform.value, 1)}, ${f(r(20, 20).monopolistic.value, 1)}, ${f(r(20, 20).uniform.value, 1)}`)
  check('n = 10: monopolistic 284.6 (k = 5, served 4.60) and 311.4 (k = 10, served 5.85), within 1%', within(r(10, 5).monopolistic.mean, 284.6) && within(r(10, 5).monopolistic.served, 4.6) && within(r(10, 10).monopolistic.mean, 311.4) && within(r(10, 10).monopolistic.served, 5.85), `${f(r(10, 5).monopolistic.mean, 1)} (${f(r(10, 5).monopolistic.served, 2)}), ${f(r(10, 10).monopolistic.mean, 1)} (${f(r(10, 10).monopolistic.served, 2)})`)
  const z = (x, ex) => Math.abs((x.mean - ex) / x.se)
  check('pay-your-bid and the uniform price within 4 standard errors of the exact mean, the uniform price\'s standard deviation within 0.5% (n = 20, k = 5, 10, 15; n = 10, k = 5)', [[20, 5], [20, 10], [20, 15], [10, 5]].every(([n, k]) => z(r(n, k).pyb, 100 * meanExact(n, k)) < 4 && z(r(n, k).uniform, 100 * meanExact(n, k)) < 4 && Math.abs(r(n, k).uniform.sd / (100 * sdUniformExact(n, k)) - 1) < 0.005))
  check('k ≥ n: pay-your-bid and the uniform price raise exactly 0 and serve everyone', r(20, 20).pyb.mean === 0 && r(20, 40).uniform.mean === 0 && r(20, 20).pyb.served === 20)
  info(`Panel C: seven runs of 2,000,000 blocks in ${(ms / 1000).toFixed(1)} s`)
  const curve = monopolisticCurve(20, 40, 200000, 1)
  check('the chart\'s curve (one pass, 200,000 blocks) agrees with the separate runs within 1% at k = 5, 10, 20, and is flat from k = 20 to 40', [5, 10, 20].every((k) => within(curve[k - 1].mean, r(20, k).monopolistic.mean)) && curve.slice(19).every((c) => c.mean === curve[19].mean), [5, 10, 20, 40].map((k) => f(curve[k - 1].mean, 1)).join(', '))
}
{
  const t1 = performance.now()
  runBlocks({ n: 40, k: 39, blocks: 10000, seed: 1 })
  const t2 = performance.now()
  runBlocks({ n: 40, k: 20, blocks: 10000, seed: 1 })
  const t3 = performance.now()
  monopolisticCurve(40, 80, 10000, 1)
  const t4 = performance.now()
  info(`Panel C at its largest in Node: n = 40, k = 39, 10,000 blocks ${Math.round(t2 - t1)} ms; k = 20 ${Math.round(t3 - t2)} ms; the revenue chart (k = 1 … 80, 10,000 blocks) ${Math.round(t4 - t3)} ms`)
}

// ------------------------------------------------------------------ Quoted on the page

const dir = 'src/components/lab/game-theory/auctions'
const textsFile = resolve(root, `${dir}/texts.js`)
const lectureFile = (l) => `src/content/game-theory-lab/auctions.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en'))) && existsSync(resolve(root, lectureFile('it')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')).replace(/\r/g, ''), it: read(lectureFile('it')).replace(/\r/g, '') }
  const itn = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2').replace(/(\d),(\d{3})\b/g, '$1.$2') // decimals and thousands the Italian way
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : itn(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const two = (x) => f(x, 2)
  const and2 = (s) => [s, itn(s).replace(' and ', ' e ')]
  const body = { en: lecture.en.split(/<!--\s*simulation\s*-->/)[0], it: lecture.it.split(/<!--\s*simulation\s*-->/)[0] }
  const boxText = { en: (body.en.match(/```box[\s\S]*?```/) || [''])[0], it: (body.it.match(/```box[\s\S]*?```/) || [''])[0] }
  const noBox = { en: body.en.replace(/```box[\s\S]*?```/, ''), it: body.it.replace(/```box[\s\S]*?```/, '') }

  // ---- The lecture
  quoted('lecture: the running example, F1 and F2', noBox, [
    ['uniform between 0 and 100', 'uniformi tra 0 e 100'], '(n − 1)/n',
    ['a value of 80 you bid 40', 'un valore di 80 offri 40'], ['with probability 0.8', 'con probabilità 0,8'], '0.8 × 40 = 32',
    ['with ten bidders the bid is 90% of the value', "con dieci offerenti l'offerta è il 90% del valore"],
  ])
  check('lecture: 40, 0.8 and 32 are F2\'s numbers at v = 80, n = 2; 90% is (n − 1)/n at n = 10', bestBidF2(2, 80) === 40 && near(winChanceF2(2, 40), 0.8, 1e-12) && near(payoffF2(2, 80, 40), 32, 1e-12) && bestBidF2(10, 100) === 90)
  quoted('lecture: revenue equivalence and the reserve', noBox, [
    [`second price earns the expected lower value, ${two(100 / 3)}`, `secondo prezzo rende il valore più basso atteso, ${itn(two(100 / 3))}`],
    `${two(200 / 3)}/2 = ${two(100 / 3)}`, '100(n − 1)/(n + 1)',
    ...['second', 'first', 'allpay'].map((fm) => two(100 * sdClosed(fm, 2))),
    [`the best reserve is ${f(100 * bestReserve(2).rho, 0)}`, `il prezzo di riserva migliore è ${f(100 * bestReserve(2).rho, 0)}`],
    [`it earns ${two(100 * meanRevenue(2, 0.5))} instead of ${two(100 * meanRevenue(2, 0))}`, `rende ${itn(two(100 * meanRevenue(2, 0.5)))} invece di ${itn(two(100 * meanRevenue(2, 0)))}`],
    ['no sale a quarter of the time', 'nessuna vendita una volta su quattro'],
    [`three bidders and no reserve earn ${f(100 * meanRevenue(3, 0), 0)}`, `tre offerenti senza riserva rendono ${f(100 * meanRevenue(3, 0), 0)}`],
  ])
  check('lecture: the quarter is the no-sale chance at n = 2, r = 50', noSale(2, 0.5) === 0.25)
  quoted('lecture: the winner\'s curse', noBox, [
    'a(n − 1)/(n + 1)', ['with a = 10, by', 'con a = 10, di'], ...[2, 5, 10].map((n) => two(breakEven('first', n, 10))),
    'a(n − 2)/n', ['$8', '8 dollari'], ['$5.13', '5,13 dollari'], ['$10.01', '10,01 dollari'],
  ])
  check('lecture: the curse\'s numbers are the code\'s (3.33, 6.67, 8.18) and the equilibrium discounts are a and a(n − 2)/n', [2, 5, 10].map((n) => two(breakEven('first', n, 10))).join() === '3.33,6.67,8.18' && eqDiscount('first', 7, 10) === 10 && near(eqDiscount('second', 7, 10), (10 * 5) / 7, 1e-12))
  quoted('lecture: many units', noBox, ['100 k(n − k)/(n + 1)', '1998', ['ch. 13', 'cap. 13']])
  // ---- The box
  {
    const r20 = 100 * meanExact(20, 10)
    quoted('the box: Panel C\'s numbers', boxText, [
      ['4 million weight units', '4 milioni di unità di peso'], 'SegWit (2017)',
      [`20 users and 10 slots`, '20 utenti e 10 posti'], two(r20), ['room for all 20, nothing', 'posto per tutti e 20, nulla'],
      ['about 547 with 10 slots and about 579 with 20', 'circa 547 con 10 posti e circa 579 con 20'],
      ['serving about 11 users and leaving 9 out', 'servendo circa 11 utenti e lasciandone fuori 9'],
    ])
    check('the box: 476.19 exact, 0 with 20 slots; the prompt\'s 2,000,000-block values round to about 547 and 579, 11.08 served of 20 (9 out)', two(r20) === '476.19' && meanExact(20, 20) === 0 && Math.round(546.8) === 547 && Math.round(579.0) === 579 && Math.round(11.08) === 11 && 20 - Math.round(11.08) === 9)
    check('the box names the authors and calls the reading a hypothesis', ['en', 'it'].every((l) => ['Huberman', 'Leshno', 'Moallemi', 'Lavi', 'Sattath', 'Zohar', 'Yao'].every((a) => boxText[l].includes(a))) && boxText.en.includes('A hypothesis, not a description') && boxText.it.includes("Un'ipotesi, non una descrizione"))
  }
  // ---- What to observe (run no. 1, the panels' defaults)
  {
    const a2 = runAuctions({ n: 2, r: 0, auctions: 10000, seed: 1 })
    const a50 = runAuctions({ n: 2, r: 50, auctions: 10000, seed: 1 })
    const a3 = runAuctions({ n: 3, r: 0, auctions: 10000, seed: 1 })
    const a2big = runAuctions({ n: 2, r: 0, auctions: 100000, seed: 1 })
    const pmS = (x) => `${two(x.mean)} ± ${two(x.se)}`
    quoted('observe, Panel A', observe.revenue, [
      ['10,000 auctions', '10.000 aste'], pmS(a2.first), two(100 / 3), two(a2.first.sd), two(100 * sdClosed('first', 2)),
      two(a2.second.mean), two(a2.allpay.mean), and2(`${two(a2.second.sd)} and ${two(a2.allpay.sd)}`),
      and2(`${two(100 * sdClosed('second', 2))} and ${two(100 * sdClosed('allpay', 2))}`),
      two(a50.first.mean), two(a50.second.mean), two(100 * meanRevenue(2, 0.5)), f(a50.first.noSale, 4),
      ['from about 33 to about ' + f(a50.first.surplus, 1), 'da circa 33 a circa ' + itn(f(a50.first.surplus, 1))],
      two(a3.first.mean), two(a3.second.mean), two(100 * meanRevenue(10, 0)),
      ...['first', 'second', 'allpay'].map((fm) => two(100 * sdClosed(fm, 10))), pmS(a2big.first),
    ])
    check('observe, Panel A: the first price never exceeds 50 with two bidders; the bidders\' payoff starts near 33; at 100,000 the first price reads 33.33', [...a2.first.hist.keys()].every((i) => i < 13 || a2.first.hist[i] === 0) && Math.round(a2.first.surplus) === 33 && two(a2big.first.mean) === '33.33')
  }
  {
    const b0 = runCommonValue({ n: 5, a: 10, k: 0, format: 'first', auctions: 10000, seed: 1 })
    const be = runCommonValue({ n: 5, a: 10, k: breakEven('first', 5, 10), format: 'first', auctions: 10000, seed: 1 })
    const beq = runCommonValue({ n: 5, a: 10, k: 10, format: 'first', auctions: 10000, seed: 1 })
    const s0 = runCommonValue({ n: 5, a: 10, k: 0, format: 'second', auctions: 10000, seed: 1 })
    const seq = runCommonValue({ n: 5, a: 10, k: eqDiscount('second', 5, 10), format: 'second', auctions: 10000, seed: 1 })
    const b2 = runCommonValue({ n: 2, a: 10, k: 0, format: 'first', auctions: 10000, seed: 1 })
    const b12 = runCommonValue({ n: 12, a: 10, k: 0, format: 'first', auctions: 10000, seed: 1 })
    const neg = (x) => two(-x)
    quoted('observe, Panel B', observe.curse, [
      `${two(b0.profit).replace('-', '−')} ± ${two(b0.se)}`, two(profitExact('first', 5, 10, 0)).replace('-', '−'), f(b0.lose, 4), f(loseExact('first', 5, 10, 0), 4),
      two(breakEven('first', 5, 10)), f(be.lose, 4), f(loseExact('first', 5, 10, breakEven('first', 5, 10)), 4),
      two(beq.profit), two(profitExact('first', 5, 10, 10)), two(beq.revenue), two(revenueExact('first', 5, 10, 10)),
      neg(s0.profit), neg(profitExact('second', 5, 10, 0)), ['discount is 6', 'di equilibrio è 6'], two(seq.revenue), two(revenueExact('second', 5, 10, 6)),
      neg(b2.profit), neg(profitExact('first', 2, 10, 0)), neg(b12.profit), neg(profitExact('first', 12, 10, 0)),
    ])
    check('observe, Panel B: the too-high share equals the losing share at k = 0 (first price); the break-even profit is near 0; no loss in equilibrium; the second price earns more there', f(b0.tooHigh, 4) === f(b0.lose, 4) && Math.abs(be.profit) < 2 * be.se && beq.lose === 0 && eqDiscount('second', 5, 10) === 6 && revenueExact('second', 5, 10, 6) > revenueExact('first', 5, 10, 10))
  }
  {
    const c10 = runBlocks({ n: 20, k: 10, blocks: 10000, seed: 1 })
    const c20 = runBlocks({ n: 20, k: 20, blocks: 10000, seed: 1 })
    const c1 = runBlocks({ n: 20, k: 1, blocks: 10000, seed: 1 })
    const curve = monopolisticCurve(20, 40, 10000, 1)
    quoted('observe, Panel C', observe.block, [
      `${two(c10.pyb.mean)} ± ${two(c10.pyb.se)}`, `${two(c10.uniform.mean)} ± ${two(c10.uniform.se)}`, two(100 * meanExact(20, 10)),
      two(c10.pyb.sd), two(c10.uniform.sd), two(100 * sdUniformExact(20, 10)), two(c10.monopolistic.mean), two(c10.monopolistic.served),
      ['no user bids more than 50', 'nessun utente offre più di 50'], two(100 * pybBid(20, 10, 0.8)),
      two(c20.monopolistic.mean), two(c20.monopolistic.served), ['about ' + f(curve[39].mean, 0), 'circa ' + f(curve[39].mean, 0)],
      ['95% of their value', '95% del loro valore'], two(c1.pyb.mean), two(100 * meanExact(20, 1)),
    ])
    const peak = [...Array(40).keys()].map((i) => meanExact(20, i + 1))
    check('observe, Panel C: the bids top out at 50 (b(100)); the exact revenue peaks at k = 10 and is 0 from k = 20; the curve is flat from k = 20 and equals the k = 20 run', near(100 * pybBid(20, 10, 1), 50, 1e-9) && peak.indexOf(Math.max(...peak)) === 9 && peak.slice(19).every((x) => x === 0) && curve.slice(19).every((c) => c.mean === curve[19].mean) && two(curve[19].mean) === two(c20.monopolistic.mean) && bestBidF2(20, 100) === 95)
  }
  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 1', sol(0), [['you win and pay 70: a loss of 10', 'vinci e paghi 70: una perdita di 10'], ['a win worth 10 (60 − 50)', 'una vittoria che valeva 10 (60 − 50)'], ['gives 0 in the first case and 10 in the second', 'dà 0 nel primo caso e 10 nel secondo']])
  check('exercise 1: the numbers are F1\'s', payoffF1('second', 60, 70, 80) === -10 && payoffF1('second', 60, 50, 40) === 0 && payoffF1('second', 60, 50, 60) === 10 && payoffF1('second', 60, 70, 60) === 0)
  quoted('exercise 2', sol(1), ['b = 40', '0.8', '0.8 × 40 = 32'])
  quoted('exercise 3', sol(2), ['100/3', '200/3', two(100 / 3), '(200/3)/2', two(100 * meanRevenue(5)), '100 × 4/6', '100 × 5/6'])
  check('exercise 3: five bidders give 66.67 = the expected second value 4/6 = (4/5)(5/6)', two(100 * meanRevenue(5)) === '66.67' && near(4 / 6, (4 / 5) * (5 / 6), 1e-15))
  quoted('exercise 4', sol(3), ['1/4', '1/3 + 1/4 − 1/6 = 5/12', two(100 * meanRevenue(2, 0.5)), '100 × 2/4 = 50'])
  check('exercise 4: 5/12 and 1/4 are the code\'s', near(meanRevenue(2, 0.5), 5 / 12, 1e-15) && noSale(2, 0.5) === 0.25)
  quoted('exercise 5', sol(4), ['10(n − 1)/(n + 1)', and2([2, 5, 10].map((n) => two(profitExact('first', n, 10, 0)).replace('-', '−')).join(', ').replace(/, (?=[^,]*$)/, ' and '))])
  quoted('exercise 6', sol(5), [two(100 / 21 * 10), '10 × (10/21) × 100 = ' + two(100 * meanExact(20, 10)), ['0 for both', '0 per entrambi']])
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language (the box not counted), with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(noBox[l]) >= 1400 && words(noBox[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(noBox[l])}, box ${words(boxText[l])}`).join('; '))
  check('the lecture places F1 and F2, has one box after the many-units section, and names Bitcoin only in the box', ['en', 'it'].every((l) => /```figure\ntruth\n```/.test(body[l]) && /```figure\nshading\n```/.test(body[l]) && (body[l].match(/```box/g) || []).length === 1 && body[l].indexOf('```box') > body[l].indexOf(l === 'en' ? '## Many units' : '## Molte unità') && !/bitcoin/i.test(noBox[l])))
  check('the lecture links module 05 and module 02', ['en', 'it'].every((l) => body[l].includes('(/game-theory-lab/incomplete-information-signalling)') && body[l].includes('(/game-theory-lab/nash-equilibrium)')))
  const allText = (l) => lecture[l] + Object.values(observe).map((o) => o[l]).join('') + exercises.map((x) => x.statement[l] + x.solution[l]).join('')
  check('the texts never call the course free, and never say peer-reviewed', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l)) && !/peer.reviewed/i.test(allText(l))))
  check('the Italian lecture uses the chosen terms: asta inglese, asta olandese, busta chiusa, asta di Vickrey, valori privati, equivalenza del ricavo (never "dei ricavi"), prezzo di riserva, maledizione del vincitore, asta discriminatoria, prezzo uniforme, riduzione della domanda, *bid shading*, *all-pay*, peso, commissione, prezzo monopolistico', ['**asta inglese**', '**asta olandese**', 'busta chiusa', 'asta di Vickrey', '**valori privati**', '**equivalenza del ricavo**', '**prezzo di riserva**', '**maledizione del vincitore**', '**asta discriminatoria**', '**asta a prezzo uniforme**', '**riduzione della domanda**', '*bid shading*', '*all-pay*', 'unità di peso', 'commissione', 'prezzo monopolistico'].every((t) => lecture.it.includes(t)) && !allText('it').includes('equivalenza dei ricavi'))
  check('the reading list has the chapters (Krishna 2–3, 6, 12–13; Tadelis 13; Shoham and Leyton-Brown 11; Roughgarden lecture 2) and every paper cited', ['Ch. 2–3', 'ch. 6', 'ch. 12–13', 'Ch. 13 (auctions', 'Ch. 11 (auctions)', 'Lecture 2'].every((t) => lecture.en.includes(t)) && ['Vickrey', 'Myerson', 'Riley', 'Milgrom', 'Bulow', 'Capen', 'Bazerman', 'Kagel, J. H. and Levin', 'Harstad', 'Lucking-Reiley', 'Huberman', 'Lavi', 'Yao'].every((t) => lecture.en.split('## Further reading')[1].includes(t) && lecture.it.split('## Letture consigliate')[1].includes(t.replace(' and ', ' e '))))
} else {
  info('texts.js or the lectures are not there yet: the "quoted on the page" checks are skipped')
}

info(`total time ${((performance.now() - T0) / 1000).toFixed(1)} s`)
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
