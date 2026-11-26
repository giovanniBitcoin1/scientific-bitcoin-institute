// Self-checks for Game Theory Lab module 12, "Designing the rules". They run
// the same code as the page (myerson.js, vcg.js, bilateral.js, cheat.js) and
// compare it with exact values, with independent computations (numerical
// integration, brute force) and with the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-12.mjs
//
// Exits with code 1 if any check fails. Lines starting with INFO report
// numbers that are not checked (timings, simulated values).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { makeRule, alloc, area, myersonPay, pay, payoff, f1Readout, scanReports, gspThreshold, monotone } from '../../src/components/lab/game-theory/mechanism-design/myerson.js'
import { vcg, revenueWithout, preset, bestAssignment, worth, normalize } from '../../src/components/lab/game-theory/mechanism-design/vcg.js'
import { stats, statsGrid, buyerBid, sellerAsk, buyerPayoff, sellerPayoff, bestReply, trades, MARKS, PROPS } from '../../src/components/lab/game-theory/mechanism-design/bilateral.js'
import { runCheat, bestUniformCheat, bestUniformCheatFull, uniformWith, honestUniform, oneFake, honestUsers } from '../../src/components/lab/game-theory/mechanism-design/cheat.js'
import { runBlocks, pybBid } from '../../src/components/lab/game-theory/auctions/block.js'
import { mulberry32 } from '../../src/components/lab/rng.js'

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

// Simpson's rule on [a, b] with m (even) intervals, split at the given points.
function integrate(fn, a, b, breaks = [], m = 2000) {
  const pts = [a, ...breaks.filter((t) => t > a && t < b).sort((x, y) => x - y), b]
  let s = 0
  for (let q = 0; q + 1 < pts.length; q++) {
    const lo = pts[q]
    const hi = pts[q + 1]
    const h = (hi - lo) / m
    let t = fn(lo + 1e-12) + fn(hi - 1e-12)
    for (let i = 1; i < m; i++) t += (i % 2 ? 4 : 2) * fn(lo + i * h)
    s += (t * h) / 3
  }
  return s
}

// ------------------------------------------------------------------ F1

console.log('— F1: the price is an area')
{
  const one = makeRule('single', { h: 60 })
  const r = f1Readout(one, 80)
  check('one object, h = 60, b = 80: x 1, p 60, payoff 20', r.x === 1 && near(r.p, 60, 1e-12) && near(r.payoff, 20, 1e-12), `${r.x}, ${r.p}, ${r.payoff}`)
  const slots = makeRule('slots', { alpha: 0.8 })
  const a = f1Readout(slots, 100)
  const b = f1Readout(slots, 45)
  check('two slots, α2 = 0.8: b = 100: x 1, p 36, payoff 64; b = 45: x 0.8, p 24, payoff 12', a.x === 1 && near(a.p, 36, 1e-12) && near(a.payoff, 64, 1e-12) && b.x === 0.8 && near(b.p, 24, 1e-12) && near(b.payoff, 12, 1e-12), `${f(a.p)}, ${f(a.payoff)}; ${f(b.p)}, ${f(b.payoff)}`)
  check('the top slot costs α2·h2 + (1 − α2)·h1 (α2 = 0, 0.3, 0.5, 0.8, 1)', [0, 0.3, 0.5, 0.8, 1].every((al) => near(myersonPay(makeRule('slots', { alpha: al }), 90), al * 30 + (1 - al) * 60, 1e-12)))
  const lot = makeRule('lottery', { H: 50 })
  const L = [[25, 1 / 3, 3.6066, 4.7267], [50, 0.5, 9.6574, 15.3426], [100, 2 / 3, 21.5973, 45.0694]]
  for (const [bb, x, p, u] of L) {
    const g = f1Readout(lot, bb)
    check(`lottery, H = 50, b = ${bb}: x ${f(x)}, p ${p}, payoff ${u}`, near(g.x, x, 1e-12) && f(g.p) === f(p) && f(g.payoff) === f(u), `${f(g.x)}, ${f(g.p)}, ${f(g.payoff)}`)
  }
  check('lottery b = 100: the payoff is 100 − 50 ln 3', near(area(lot, 100), 100 - 50 * Math.log(3), 1e-12))
  // The payment by numerical integration against the closed form.
  let worst = 0
  for (const H of [5, 20, 50, 100]) for (const bb of [1, 10, 25, 50, 77, 100]) {
    const rule = makeRule('lottery', { H })
    const num = bb * alloc(rule, bb) - integrate((z) => alloc(rule, z), 0, bb)
    worst = Math.max(worst, Math.abs(num - myersonPay(rule, bb)))
  }
  check('lottery: b·x(b) − ∫₀ᵇ x by Simpson\'s rule (2,000 intervals) equals −bH/(b + H) + H ln(1 + b/H) within 1e-8 (H = 5 … 100, b = 1 … 100)', worst < 1e-8, worst.toExponential(1))
  // Step rules: the exact area against the integral split at the steps.
  let w2 = 0
  for (const rule of [one, slots, makeRule('reserve', { reserve: 50 }), makeRule('middle')]) for (const bb of [10, 35, 45, 59.5, 61, 80, 100]) {
    const breaks = rule.steps.map((s) => s[0])
    w2 = Math.max(w2, Math.abs(area(rule, bb) - integrate((z) => alloc(rule, z), 0, bb, breaks, 200)))
  }
  check('step rules: the exact area under x equals Simpson\'s rule split at the steps', w2 < 1e-9, w2.toExponential(1))
  check('a bid of 0 pays 0 under Myerson\'s formula (every rule)', ['single', 'reserve', 'slots', 'lottery', 'middle'].every((id) => myersonPay(makeRule(id), 0) === 0))
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: lying does not pay')
{
  // Myerson's payments and monotone rules: the truth is a best report for every v.
  const rules = [
    makeRule('single', { h: 60 }), makeRule('single', { h: 23 }), makeRule('reserve', { reserve: 50 }), makeRule('reserve', { reserve: 10 }),
    makeRule('slots', { alpha: 0.8 }), makeRule('slots', { alpha: 0.3 }), makeRule('lottery', { H: 50 }), makeRule('lottery', { H: 7 }),
  ]
  let ok = 0
  let tot = 0
  for (const rule of rules) for (let v = 0; v <= 100; v++) {
    tot++
    if (scanReports(rule, 'myerson', v).truthBest) ok++
  }
  check(`Myerson's formula and a monotone rule: the truth is a best report for every v = 0 … 100 (one object, reserve, slots, lottery; ${rules.length} settings, reports every 0.1)`, ok === tot, `${ok} of ${tot}`)
  const res = makeRule('reserve', { reserve: 50 })
  check('reserve 50, h = 30: v = 80 pays 50 and keeps 30; v = 40 keeps 0 and would lose 10 by winning', near(pay(res, 'myerson', 80), 50, 1e-12) && near(payoff(res, 'myerson', 80, 80), 30, 1e-12) && payoff(res, 'myerson', 40, 40) === 0 && near(payoff(res, 'myerson', 40, 70), -10, 1e-12))
  const s8 = makeRule('slots', { alpha: 0.8 })
  const s5 = makeRule('slots', { alpha: 0.5 })
  const two = (rule, pr) => [payoff(rule, pr, 100, 100), payoff(rule, pr, 100, 45)]
  check('slots, v = 100, α2 = 0.8: Myerson 64 (top) and 56 (second), GSP 40 and 56', list(two(s8, 'myerson'), 6) === list([64, 56], 6) && list(two(s8, 'gsp'), 6) === list([40, 56], 6), `${list(two(s8, 'myerson'))}; ${list(two(s8, 'gsp'))}`)
  check('slots, v = 100, α2 = 0.5: Myerson 55 and 35, GSP 40 and 35', list(two(s5, 'myerson'), 6) === list([55, 35], 6) && list(two(s5, 'gsp'), 6) === list([40, 35], 6), `${list(two(s5, 'myerson'))}; ${list(two(s5, 'gsp'))}`)
  check('the GSP threshold at v = 100 is 4/7', near(gspThreshold(100), 4 / 7, 1e-15))
  // The threshold against the scan, on a grid of v and α.
  let agree = 0
  let n = 0
  for (let v = 0; v <= 100; v += 5) for (let al = 0; al <= 1.0001; al += 0.05) {
    const a = Math.round(al * 100) / 100
    n++
    const th = gspThreshold(v)
    const want = th === null ? true : a <= th + 1e-12
    if (scanReports(makeRule('slots', { alpha: a }), 'gsp', v).truthBest === want) agree++
  }
  check(`GSP: the truth is a best report exactly when α2 ≤ (v − 60)/(v − 30) for v ≥ 60, always below 60 (grid of v and α2, ${n} cases)`, agree === n, `${agree} of ${n}`)
  const pyb = scanReports(makeRule('single', { h: 60 }), 'bid', 80)
  check('pay your bid, one object, h = 60, v = 80: the best report is just above 60 (60.1 on the grid of 0.1), not 80', pyb.ranges.length === 1 && near(pyb.ranges[0].from, 60.1, 1e-9) && near(pyb.ranges[0].to, 60.1, 1e-9) && !pyb.truthBest && pyb.truth === 0, `${pyb.ranges[0].from}, best ${f(pyb.best)}, truth ${pyb.truth}`)
  const mid = makeRule('middle')
  check('"win only in the middle": Myerson\'s p = 40 inside, −20 above 60, 0 below 40', near(myersonPay(mid, 45), 40, 1e-12) && near(myersonPay(mid, 59.9), 40, 1e-9) && near(myersonPay(mid, 60), -20, 1e-12) && near(myersonPay(mid, 90), -20, 1e-12) && myersonPay(mid, 39.9) === 0)
  const M = [[70, 20, 30], [50, 10, 20], [30, 0, 20]]
  for (const [v, t, b] of M) {
    const s = scanReports(mid, 'myerson', v)
    check(`"win only in the middle", v = ${v}: truth ${t}, best ${b}`, near(s.truth, t, 1e-9) && near(s.best, b, 1e-9) && !s.truthBest, `${f(s.truth)}, ${f(s.best)}`)
  }
  check('"win only in the middle", v = 70: bidding 50 gives 30', near(payoff(mid, 'myerson', 70, 50), 30, 1e-12))
  check('the middle rule is the only one that is not monotone', !monotone(mid) && ['single', 'reserve', 'slots', 'lottery'].every((id) => monotone(makeRule(id))))
  // No payment rule fixes the middle rule: any payment p(z) gives v·x(r) − p(r); truth best at v = 50 (inside) needs p(in) ≤ p(out) + 50 … a scan over constant payments inside and out.
  let fixable = false
  for (let pin = -100; pin <= 100; pin += 1) for (let pout = -100; pout <= 100; pout += 1) {
    // x = 1 inside [40, 60), 0 outside: the truth must be best for every v.
    let good = true
    for (let v = 0; v <= 100 && good; v += 1) {
      const inside = v >= 40 && v < 60
      const truth = inside ? v - pin : -pout
      const alt = inside ? -pout : v - pin
      if (alt > truth + 1e-12) good = false
    }
    if (good) fixable = true
  }
  check('no payment (constant inside and outside the middle, −100 … 100) makes the truth best for every v under "win only in the middle"', !fixable)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: pay for the harm you do')
{
  // Each payment equals the others' best total without the bidder minus their total with her, by a separate brute force.
  const brute = (bids) => {
    const n = bids.length
    const all = [...Array(n).keys()]
    const best = (act) => {
      let m = -Infinity
      for (let a = -1; a < n; a++) for (let b = -1; b < n; b++) {
        if ((a >= 0 && !act.includes(a)) || (b >= 0 && !act.includes(b))) continue
        let s = 0
        for (const i of act) s += a === i && b === i ? bids[i].AB : a === i ? bids[i].A : b === i ? bids[i].B : 0
        m = Math.max(m, s)
      }
      return m
    }
    return { total: best(all), best }
  }
  const three = preset('three')
  const r = vcg(three.bids, three.values)
  check('"Two items, three bidders": A to 1, B to 2, payments 5, 4, 0, revenue 9', r.a === 0 && r.b === 1 && r.rows.map((x) => x.payment).join() === '5,4,0' && r.revenue === 9)
  const w3 = vcg(three.bids.slice(0, 2))
  check('… without bidder 3: payments 5 and 2, revenue 7', w3.rows.map((x) => x.payment).join() === '5,2' && w3.revenue === 7 && revenueWithout(three.bids)[2] === 7)
  info(`"Two items, three bidders": revenue without each bidder ${revenueWithout(three.bids).join(', ')}`)
  const lonely = preset('lonely')
  const l = vcg(lonely.bids)
  check('"The lonely auction": A to 2, B to 3, payments 0, 0, 0, revenue 0', l.a === 1 && l.b === 2 && l.revenue === 0 && l.rows.every((x) => x.payment === 0))
  {
    // Without bidder 3, every assignment that ties for the best gives revenue 4.
    const b2 = lonely.bids.slice(0, 2)
    const top = bestAssignment(b2, [0, 1]).total
    const revs = []
    for (const a of [0, 1, -1]) for (const b of [0, 1, -1]) {
      const tot = worth(b2[0], 0, a, b) + worth(b2[1], 1, a, b)
      if (tot !== top) continue
      let rev = 0
      for (const i of [0, 1]) rev += bestAssignment(b2, [1 - i]).total - (tot - worth(b2[i], i, a, b))
      revs.push(rev)
    }
    check('… without bidder 3: revenue 4, whichever tied assignment is chosen', revenueWithout(lonely.bids)[2] === 4 && revs.length >= 2 && revs.every((x) => x === 4), revs.join(', '))
  }
  const one = preset('namesOne')
  const o = vcg(one.bids, one.values)
  check('"Two names", as one person: she wins AB, pays 4, keeps 2; the seller gets 4', o.a === 1 && o.b === 1 && o.rows[1].payment === 4 && o.rows[1].payoff === 2 && o.revenue === 4)
  const twoN = preset('namesTwo')
  const t = vcg(twoN.bids, twoN.values, { merge: [1, 2] })
  check('"Two names", as two: she wins A and B for 0 and keeps 6; the seller gets 0', t.a === 1 && t.b === 2 && t.person.gets === 'AB' && t.person.paid === 0 && t.person.payoff === 6 && t.revenue === 0)
  const col = preset('collude')
  const c = vcg(col.bids, col.values)
  check('"Losers collude": with bids of 10 they win A and B, pay 0 and keep 1 each', c.a === 1 && c.b === 2 && c.rows[1].payment === 0 && c.rows[2].payment === 0 && c.rows[1].payoff === 1 && c.rows[2].payoff === 1)
  const h = vcg(col.values, col.values)
  check('… with honest bids bidder 1 wins AB, pays 2, keeps 2', h.a === 0 && h.b === 0 && h.rows[0].payment === 2 && h.rows[0].payoff === 2)
  // Brute force on random tables: payments = the externality, truth weakly dominant for each bidder.
  const random = mulberry32(12)
  const rint = (m) => Math.floor(random() * (m + 1))
  const table = () => normalize({ A: rint(10), B: rint(10), AB: rint(16) })
  let pOk = 0
  let tOk = 0
  let cases = 0
  for (let s = 0; s < 300; s++) {
    const n = 2 + (s % 3)
    const vals = Array.from({ length: n }, table)
    const res = vcg(vals, vals)
    const br = brute(vals)
    cases++
    const all = [...Array(n).keys()]
    if (res.total === br.total && res.rows.every((row, i) => row.payment === br.best(all.filter((j) => j !== i)) - (res.total - worth(vals[i], i, res.a, res.b)) && row.payment >= 0 && row.payoff >= 0)) pOk++
    // Bidder 0 tries 200 other reports.
    let good = true
    const u0 = res.rows[0].payoff
    for (let q = 0; q < 200 && good; q++) {
      const lie = [table(), ...vals.slice(1)]
      if (vcg(lie, vals).rows[0].payoff > u0 + 1e-12) good = false
    }
    if (good) tOk++
  }
  check(`300 random tables (2 to 4 bidders): the allocation is the best total, each payment the others' best total without the bidder minus their total with her, every payment and payoff ≥ 0`, pOk === cases, `${pOk} of ${cases}`)
  check('… and bidder 1 never gains from any of 200 other reports (the truth is dominant)', tOk === cases, `${tOk} of ${cases}`)
  check('normalize: AB at least the larger single bid', normalize({ A: 5, B: 7, AB: 3 }).AB === 7 && normalize({ A: 5, B: 2, AB: 9 }).AB === 9)
}

// ------------------------------------------------------------------ F2

console.log('— F2: bilateral trade')
{
  const v = stats('vcg')
  check('efficient trade: chance 1/2, gains 16.6667, designer\'s budget −16.6667', v.chance === 0.5 && f(v.gains) === '16.6667' && f(v.budget) === '-16.6667')
  const p = stats('posted', 50)
  const p30 = stats('posted', 30)
  const p70 = stats('posted', 70)
  check('posted price 50: chance 1/4, gains 12.5, budget 0; 30 and 70: 0.21, 10.5', p.chance === 0.25 && near(p.gains, 12.5, 1e-12) && p.budget === 0 && [p30, p70].every((x) => near(x.chance, 0.21, 1e-12) && near(x.gains, 10.5, 1e-12)))
  const s = stats('split')
  check('split the difference: chance 9/32, gains 14.0625 (9/64 of 100), budget 0', near(s.chance, 9 / 32, 1e-15) && near(s.gains, 14.0625, 1e-12) && near(s.gains, 900 / 64, 1e-12))
  const grid = ['vcg', 'posted', 'split'].map((r) => [r, statsGrid(r, 50, 800)])
  check('the exact values agree with a midpoint grid of 800 × 800 within 0.02', grid.every(([r, g]) => near(g.chance, stats(r, 50).chance, 0.002) && near(g.gains, stats(r, 50).gains, 0.02) && near(g.budget, stats(r, 50).budget, 0.02)), grid.map(([r, g]) => `${r} ${f(g.chance)} ${f(g.gains, 3)} ${f(g.budget, 3)}`).join('; '))
  check('the bids give the region: 2v/3 + 100/12 ≥ 2c/3 + 25 exactly when v ≥ c + 25', [[10, 34], [10, 35], [10, 36], [40, 64.9], [40, 65], [0, 25]].every(([c, vv]) => (buyerBid(vv) >= sellerAsk(c) - 1e-12) === trades('split', c, vv)))
  const B = [[40, 35], [60, 48.333], [90, 68.333]]
  const gotB = B.map(([vv]) => bestReply((b) => buyerPayoff(vv, b)))
  check('given the seller\'s asks, the buyer\'s best bid is 2v/3 + 100/12: v = 40, 60, 90 give 35, 48.333, 68.333', gotB.every((g, i) => near(g, B[i][1], 1e-3) && near(g, buyerBid(B[i][0]), 1e-4)), list(gotB, 4))
  const S = [[10, 31.667], [30, 45], [60, 65]]
  const gotS = S.map(([c]) => bestReply((a) => sellerPayoff(c, a)))
  check('given the buyer\'s bids, the seller\'s best ask is 2c/3 + 25: c = 10, 30, 60 give 31.667, 45, 65', gotS.every((g, i) => near(g, S[i][1], 1e-3) && near(g, sellerAsk(S[i][0]), 1e-4)), list(gotS, 4))
  // The expected payoffs against an independent integration.
  const bInt = (vv, b) => integrate((c) => (b >= sellerAsk(c) ? vv - (b + sellerAsk(c)) / 2 : 0), 0, 100, [1.5 * (b - 25)], 400) / 100
  const sInt = (c, a) => integrate((vv) => (buyerBid(vv) >= a ? (a + buyerBid(vv)) / 2 - c : 0), 0, 100, [1.5 * (a - 100 / 12)], 400) / 100
  check('the buyer\'s and seller\'s expected payoffs equal Simpson\'s rule (6 cases each)', [[40, 30], [60, 50], [90, 70]].every(([vv, b]) => near(buyerPayoff(vv, b), bInt(vv, b), 1e-6)) && [[10, 30], [30, 50], [60, 70]].every(([c, a]) => near(sellerPayoff(c, a), sInt(c, a), 1e-6)))
  check('marks: no rule is efficient, truthful, voluntary and balanced at once; VCG fails only balance, the other two only efficiency', Object.values(MARKS).every((m) => !PROPS.every((q) => m[q])) && !MARKS.vcg.balanced && MARKS.vcg.efficient && !MARKS.posted.efficient && !MARKS.split.efficient)
  check('the split region lies inside the efficient one, and gains rank 16.67 > 14.06 > 12.5', f(stats('vcg').gains, 2) === '16.67' && f(stats('split').gains, 2) === '14.06' && stats('split').gains > stats('posted', 50).gains)
  // The best posted price is 50.
  let bp = 0
  for (let q = 0; q <= 100; q++) if (stats('posted', q).gains > stats('posted', bp).gains) bp = q
  check('the best posted price is 50', bp === 50)
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: who runs the auction?')
{
  // Mechanical rules on an explicit list of bids, for the brute force.
  const applyRule = (rule, reals, fakes, k) => {
    const all = [...reals.map((b) => ({ b, fake: false })), ...fakes.map((b) => ({ b, fake: true }))]
    all.sort((x, y) => y.b - x.b || (x.fake === y.fake ? 0 : x.fake ? 1 : -1))
    if (rule === 'monopolistic') {
      // The miner, who runs the rule, may take any J ≤ k: the real revenue for the best J.
      let best = 0
      let realCount = 0
      for (let J = 1; J <= Math.min(k, all.length); J++) {
        if (!all[J - 1].fake) realCount++
        best = Math.max(best, realCount * all[J - 1].b)
      }
      return best
    }
    const win = all.slice(0, k)
    if (rule === 'pyb') return win.filter((x) => !x.fake).reduce((s, x) => s + x.b, 0)
    const price = all.length > k ? all[k].b : 0
    return win.filter((x) => !x.fake).length * price
  }
  // Multisets of fakes from the candidates (just below each real bid, i.e. equal with ties against the fake, and three values above), up to k + 1 fakes.
  const multisets = (cands, m) => {
    const out = [[]]
    const rec = (start, cur) => {
      if (cur.length === m) return
      for (let q = start; q < cands.length; q++) {
        const nx = [...cur, cands[q]]
        out.push(nx)
        rec(q, nx)
      }
    }
    rec(0, [])
    return out
  }
  const random = mulberry32(2024)
  let ok = { pyb: 0, uniform: 0, monopolistic: 0, search: 0 }
  let tot = 0
  for (const [n, k] of [[5, 3], [6, 4], [4, 6], [5, 5], [3, 1]]) for (let t = 0; t < 40; t++) {
    tot++
    const v = Array.from({ length: n }, () => random()).sort((a, b) => b - a)
    const bids = v.map((x) => pybBid(n, k, x))
    const fakesFor = (bs) => multisets([...bs, bs[0] + 0.5, 1.5, 3], k + 1)
    const honest = { pyb: applyRule('pyb', bids, [], k), uniform: applyRule('uniform', v, [], k), monopolistic: applyRule('monopolistic', v, [], k) }
    const bestOf = (rule, bs) => Math.max(...fakesFor(bs).map((fk) => applyRule(rule, bs, fk, k)))
    if (bestOf('pyb', bids) <= honest.pyb + 1e-12) ok.pyb++
    if (bestOf('monopolistic', v) <= honest.monopolistic + 1e-12) ok.monopolistic++
    const bu = bestOf('uniform', v)
    let jv = 0
    for (let j = 1; j <= Math.min(k, n); j++) jv = Math.max(jv, j * v[j - 1])
    if (near(bu, jv, 1e-12)) ok.uniform++
    const fast = bestUniformCheat((j) => v[j - 1], n, k)
    const full = bestUniformCheatFull((j) => v[j - 1], n, k)
    if (near(fast.revenue, bu, 1e-12) && fast.revenue === full.revenue && fast.j === full.j) ok.search++
  }
  {
    // The page's search against the search over every place of the extra fake, on module 11's draws (n = 20 and 40).
    const rnd = mulberry32(77)
    let same = 0
    let N = 0
    for (const [n, k] of [[20, 10], [20, 20], [40, 60], [40, 39], [10, 5], [2, 1]]) for (let t = 0; t < 2000; t++) {
      const v = Array.from({ length: n }, () => rnd()).sort((a, b) => b - a)
      const at = (j) => v[j - 1]
      const a = bestUniformCheat(at, n, k)
      const b = bestUniformCheatFull(at, n, k)
      N++
      if (a.revenue === b.revenue && a.j === b.j) same++
    }
    check(`the page's search (three places per h) finds the same best and the same j as the search over every place, ${N} random blocks up to n = 40, k = 60`, same === N, `${same} of ${N}`)
  }
  check(`brute force over every multiset of up to k + 1 fakes (just below each real bid, or above them all), ${tot} random blocks with n, k = (5, 3), (6, 4), (4, 6), (5, 5), (3, 1): pay your bid never gains`, ok.pyb === tot, `${ok.pyb} of ${tot}`)
  check('… the monopolistic price never gains (the miner also choosing how many to include)', ok.monopolistic === tot, `${ok.monopolistic} of ${tot}`)
  check('… the uniform price at best earns the largest j·v_(j), j ≤ k: the monopolistic price\'s revenue', ok.uniform === tot, `${ok.uniform} of ${tot}`)
  check('… and the page\'s search (h high fakes, at most one more) finds the same best', ok.search === tot, `${ok.search} of ${tot}`)
  check('uniformWith: k − j high fakes and one just below the j-th real bid make the j-th bid the price', (() => {
    const v = [0.9, 0.7, 0.5, 0.3, 0.1]
    const at = (j) => v[j - 1]
    return [1, 2, 3].every((j) => {
      const r = uniformWith(at, 5, 3, 3 - j, j)
      return r.j === j && r.price === v[j - 1]
    })
  })())

  // Exact values.
  const E = [[5, 357.14, 380.95, 71.43], [10, 476.19, 523.81, 261.9], [15, 357.14, 428.57, 571.43]]
  check('n = 20, honest uniform, one fake, honest users\' payoff: k = 5: 357.14, 380.95, 71.43; k = 10: 476.19, 523.81, 261.90; k = 15: 357.14, 428.57, 571.43', E.every(([k, h, o, u]) => f(honestUniform(20, k), 2) === f(h, 2) && f(oneFake(20, k), 2) === f(o, 2) && f(honestUsers(20, k), 2) === f(u, 2)))
  check('k = 20: honest 0; all served at no cost, users\' payoff 1,000 (one fake below the 20th bid: 95.24; above n there is no k-th bid)', honestUniform(20, 20) === 0 && honestUsers(20, 20) === 1000 && f(oneFake(20, 20), 2) === '95.24' && oneFake(20, 21) === null)
  check('n = 10, k = 5: 227.27; 272.73; 136.36', f(honestUniform(10, 5), 2) === '227.27' && f(oneFake(10, 5), 2) === '272.73' && f(honestUsers(10, 5), 2) === '136.36')
  check('the honest users\' payoff is the value served minus the revenue: k(k + 1)/(2(n + 1)) = k(2n + 1 − k)/(2(n + 1)) − k(n − k)/(n + 1)', [[20, 5], [20, 10], [20, 15], [10, 5], [7, 3]].every(([n, k]) => near(honestUsers(n, k), 100 * ((k * (2 * n + 1 - k)) / (2 * (n + 1)) - (k * (n - k)) / (n + 1)), 1e-9)))
  {
    // One fake, simulated: k·v_(k) on module 11's draws.
    const random2 = mulberry32(5)
    let s = 0
    const N = 200000
    const vv = new Float64Array(20)
    for (let t = 0; t < N; t++) {
      for (let i = 0; i < 20; i++) vv[i] = random2()
      vv.sort()
      s += 10 * vv[20 - 10]
    }
    check('one fake just below the 10th bid, simulated (200,000 blocks): within 0.5% of 523.81', Math.abs((100 * s) / N / oneFake(20, 10) - 1) < 0.005, f((100 * s) / N, 2))
  }
  // Long runs against the prompt's simulation (2,000,000 blocks), within 1%.
  const BLOCKS = 2000000
  const t0 = performance.now()
  const R = {}
  for (const [n, k] of [[20, 5], [20, 10], [20, 15], [20, 20], [10, 5]]) R[`${n},${k}`] = runCheat({ n, k, blocks: BLOCKS, seed: 1 })
  const ms = performance.now() - t0
  const within = (x, w) => Math.abs(x / w - 1) <= 0.01
  const PROMPT = { '20,5': [381.5, 4.97, 45.3], '20,10': [546.8, 9.21, 153.5], '20,15': [578.0, 10.97, 209.1], '20,20': [578.8, 11.07, 212.3], '10,5': [284.6, 4.6, 61.9] }
  for (const [key, [rev, served, users]] of Object.entries(PROMPT)) {
    const u = R[key].uniform
    info(`Panel C ${key} (2,000,000 blocks): uniform honest ${f(u.honest.mean, 2)} (users ${f(u.honest.users, 2)}), cheating ${f(u.cheat.mean, 2)} ± ${f(u.cheat.se, 2)}, served ${f(u.cheat.served, 3)}, users ${f(u.cheat.users, 2)}; prompt ${rev}, ${served}, ${users}`)
    check(`n, k = ${key}: the best cheating ${rev}, users served ${served}, users' payoff ${users}, within 1%`, within(u.cheat.mean, rev) && within(u.cheat.served, served) && within(u.cheat.users, users), `${f(u.cheat.mean, 1)}, ${f(u.cheat.served, 2)}, ${f(u.cheat.users, 1)}`)
  }
  check('in every simulated block the cheating uniform price earns exactly the monopolistic price\'s revenue (5 runs of 2,000,000 blocks)', Object.values(R).every((x) => x.sameAsMonopolistic === BLOCKS), Object.values(R).map((x) => x.sameAsMonopolistic).join(', '))
  check('pay your bid and the monopolistic price: cheating equals honest in every run', Object.values(R).every((x) => near(x.pyb.cheat.mean, x.pyb.honest.mean, 1e-9) && near(x.monopolistic.cheat.mean, x.monopolistic.honest.mean, 1e-9)))
  const z = (x, ex) => Math.abs((x.mean - ex) / x.se)
  check('honest uniform and pay your bid within 4 standard errors of the exact mean; the honest users\' payoff within 0.5% of k(k + 1)/(2(n + 1))', [[20, 5], [20, 10], [20, 15], [10, 5]].every(([n, k]) => { const x = R[`${n},${k}`]; return z(x.uniform.honest, honestUniform(n, k)) < 4 && z(x.pyb.honest, honestUniform(n, k)) < 4 && Math.abs(x.uniform.honest.users / honestUsers(n, k) - 1) < 0.005 }))
  {
    // The same draws as module 11: the honest and monopolistic numbers agree with runBlocks.
    const a = runCheat({ n: 20, k: 10, blocks: 10000, seed: 1 })
    const b = runBlocks({ n: 20, k: 10, blocks: 10000, seed: 1 })
    check('the same draws as module 11\'s Panel C: 10,000 blocks, seed 1, give the same pay-your-bid, uniform and monopolistic means', near(a.pyb.honest.mean, b.pyb.mean, 1e-9) && near(a.uniform.honest.mean, b.uniform.mean, 1e-9) && near(a.monopolistic.honest.mean, b.monopolistic.mean, 1e-9), `${f(a.uniform.honest.mean, 2)} / ${f(b.uniform.mean, 2)}`)
  }
  info(`Panel C: five runs of 2,000,000 blocks in ${(ms / 1000).toFixed(1)} s`)
  const t1 = performance.now()
  runCheat({ n: 40, k: 60, blocks: 10000, seed: 1 })
  const t2 = performance.now()
  runCheat({ n: 40, k: 39, blocks: 10000, seed: 1 })
  const t3 = performance.now()
  runCheat({ n: 20, k: 10, blocks: 10000, seed: 1 })
  info(`Panel C in Node, 10,000 blocks: n = 40, k = 60 ${Math.round(t2 - t1)} ms; n = 40, k = 39 ${Math.round(t3 - t2)} ms; n = 20, k = 10 ${Math.round(performance.now() - t3)} ms`)
}

// ------------------------------------------------------------------ Quoted on the page

const dir = 'src/components/lab/game-theory/mechanism-design'
const textsFile = resolve(root, `${dir}/texts.js`)
const lectureFile = (l) => `src/content/game-theory-lab/mechanism-design.${l}.md`
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
  const two = (x) => f(x, 2).replace('-', '−')
  const body = { en: lecture.en.split(/<!--\s*simulation\s*-->/)[0], it: lecture.it.split(/<!--\s*simulation\s*-->/)[0] }
  const boxText = { en: (body.en.match(/```box[\s\S]*?```/) || [''])[0], it: (body.it.match(/```box[\s\S]*?```/) || [''])[0] }
  const noBox = { en: body.en.replace(/```box[\s\S]*?```/, ''), it: body.it.replace(/```box[\s\S]*?```/, '') }
  const sv = stats('vcg')
  const sp = stats('posted', 50)
  const ss = stats('split')

  // ---- The lecture
  quoted('lecture: Myerson\'s lemma and the optimal auction', noBox, [
    'p(b) = b·x(b) − ∫₀ᵇ x(z) dz', 'α2·h2 + (1 − α2)·h1', 'φ(v) = 2v − 100', 'v − (1 − F(v))/f(v)',
    ['a reserve of 50', 'una riserva di 50'],
  ])
  check('lecture: the top-slot formula is Myerson\'s payment; 2v − 100 is the virtual value of U(0, 100) and is 0 at 50; one object pays h', near(myersonPay(makeRule('slots', { alpha: 0.8 }), 100), 0.8 * 30 + 0.2 * 60, 1e-12) && [10, 50, 90].every((x) => near(x - (1 - x / 100) / (1 / 100), 2 * x - 100, 1e-9)) && near(myersonPay(makeRule('single', { h: 37 }), 80), 37, 1e-12))
  quoted('lecture: the limits of VCG', noBox, [
    ['both objects for 4', 'entrambi gli oggetti per 4'], ['the same auction earns 4', 'la stessa asta rende 4'],
    ['value A and B at 1 each can both bid 10', 'valutano A e B 1 ciascuno possono offrire entrambi 10'],
    ['values both objects at 6 pays 4 as one person and nothing as two', 'valuta entrambi gli oggetti 6 paga 4 come una persona sola e nulla con due nomi'],
  ])
  {
    const lo = vcg(preset('lonely').bids)
    const one = vcg(preset('namesOne').bids)
    const tw = vcg(preset('namesTwo').bids, preset('namesTwo').values, { merge: [1, 2] })
    const co = vcg(preset('collude').bids, preset('collude').values)
    check('lecture: the lonely auction earns 0, and 4 without bidder 3; two names 4 against 0; colluding losers pay 0', lo.revenue === 0 && revenueWithout(preset('lonely').bids)[2] === 4 && one.rows[1].payment === 4 && tw.person.paid === 0 && co.revenue === 0)
  }
  quoted('lecture: bilateral trade', noBox, [
    [`creates ${two(sv.gains)} on average`, `crea in media ${itn(two(sv.gains))}`], [`all of it, ${two(-sv.budget)} on average`, `tutta, in media ${itn(two(-sv.budget))}`],
    [`creates only ${f(sp.gains, 1)}`, `crea solo ${itn(f(sp.gains, 1))}`], [`creates ${two(ss.gains)} in its linear equilibrium`, `crea ${itn(two(ss.gains))} nel suo equilibrio lineare`],
    ['exceeds the cost by 25', 'supera il costo di 25'], [`${two(ss.gains)} is the most`, `${itn(two(ss.gains))} è il massimo`],
  ])
  // ---- The box
  {
    const r = runCheat({ n: 20, k: 10, blocks: 10000, seed: 1 })
    quoted('the box: Panel C\'s numbers', boxText, [
      ['20 users and 10 slots', '20 utenti e 10 posti'], two(honestUniform(20, 10)), two(oneFake(20, 10)),
      ['the best cheating about 547', "l'imbroglio migliore circa 547"], [`from ${two(honestUsers(20, 10))} to about 153.5`, `da ${itn(two(honestUsers(20, 10)))} a circa 153,5`],
      ['with room for all 20, 0 against about 579', 'con posto per tutti e 20, 0 contro circa 579'], ['5 August 2021', '5 agosto 2021'],
    ])
    check('the box: 476.19 and 523.81 exact; about 547, 153.5 and 579 are the 2,000,000-block values (546.6, 153.55, 578.85) rounded; the 10,000-block page agrees within 1%; honest 0 at k = 20', two(honestUniform(20, 10)) === '476.19' && two(oneFake(20, 10)) === '523.81' && Math.abs(r.uniform.cheat.mean / 547 - 1) < 0.01 && Math.abs(r.uniform.cheat.users / 153.5 - 1) < 0.01 && honestUniform(20, 20) === 0)
    check('the box names the authors, calls the reading a hypothesis, and uses Roughgarden\'s and Chung–Shi\'s wording', ['en', 'it'].every((l) => ['Babaioff', 'Dobzinski', 'Oren', 'Zohar', 'Roughgarden', 'Chung', 'Shi', 'EIP-1559', 'Sybil', 'OCA-proof'].every((a) => boxText[l].includes(a))) && boxText.en.includes('A hypothesis, not a description') && boxText.it.includes("Un'ipotesi, non una descrizione") && boxText.en.includes('no non-trivial rule') && boxText.it.includes('nessuna regola non banale') && boxText.en.includes('iterated removal of dominated strategies'))
  }
  // ---- What to observe (run no. 1, the panels' defaults)
  {
    const sA = (id, pr, v, o = {}) => scanReports(makeRule(id, o), pr, v)
    const a1 = sA('single', 'myerson', 80)
    const a2 = sA('single', 'bid', 80)
    const a3g = sA('slots', 'gsp', 100)
    const a3m = sA('slots', 'myerson', 100)
    const a3h = sA('slots', 'gsp', 100, { alpha: 0.5 })
    const a4m = sA('lottery', 'myerson', 80)
    const a4b = sA('lottery', 'bid', 80)
    const a5 = sA('middle', 'myerson', 70)
    const a6 = sA('reserve', 'myerson', 40)
    quoted('observe, Panel A', observe.truth, [
      ['pays 60 and keeps 20', 'paga 60 e tiene 20'], f(a2.ranges[0].from, 1), two(a2.best), ['keeps 64', 'tiene 64'], ['the truth keeps 40', 'la verità tiene 40'],
      ['from 30.1 to 59.9', 'da 30,1 a 59,9'], ['keeps 56', 'tiene 56'], f(gspThreshold(100), 4), '(4/7)', ['40 against 35', '40 contro 35'],
      ['is 80, keeping 32.22', 'è 80, che tiene 32,22'], ['is 30.6, keeping 18.75', 'è 30,6, che tiene 18,75'],
      ['pays you 20 for losing', 'ti paga 20 per perdere'], ['from 40 to 59.9 keeps 30', 'da 40 a 59,9 tiene 30'], ['up to 49.9', 'fino a 49,9'], ['the reserve, 50', 'la riserva, 50'],
    ])
    check('observe, Panel A: the numbers are the panel\'s', near(a1.truth, 20, 1e-9) && a1.truthBest && a1.ranges[0].from === 60.1 && a1.ranges[0].to === 100 && f(a2.best, 2) === '19.90' && a2.truth === 0
      && near(a3m.truth, 64, 1e-9) && near(a3g.truth, 40, 1e-9) && near(a3g.best, 56, 1e-9) && a3g.ranges[0].from === 30.1 && a3g.ranges[0].to === 59.9 && a3h.truthBest && near(payoff(makeRule('slots', { alpha: 0.5 }), 'gsp', 100, 45), 35, 1e-9)
      && a4m.ranges.length === 1 && a4m.ranges[0].from === 80 && a4m.ranges[0].to === 80 && f(a4m.truth, 2) === '32.22' && f(a4b.best, 2) === '18.75' && a4b.ranges[0].from === 30.6
      && near(a5.truth, 20, 1e-9) && near(a5.best, 30, 1e-9) && a5.ranges[0].from === 40 && a5.ranges[0].to === 59.9 && a6.truth === 0 && a6.ranges[0].from === 0 && a6.ranges[0].to === 49.9)
    const three = preset('three')
    const r3 = vcg(three.bids)
    quoted('observe, Panel B', observe.vcg, [
      ['(total 14)', '(totale 14)'], ['they pay 5 and 4, bidder 3 pays 0, and the seller gets 9', "pagano 5 e 4, l'offerente 3 paga 0, e il venditore riceve 9"],
      ['Without bidder 3 the revenue is 7: bidder 2 pays 2 instead of 4', "Senza l'offerente 3 il ricavo è 7: l'offerente 2 paga 2 invece di 4"],
      ['nobody pays, revenue 0', 'nessuno paga, ricavo 0'], ['Without bidder 3 the revenue is 4', "Senza l'offerente 3 il ricavo è 4"],
      ['wins it, pays 4 and keeps 2', 'lo vince, paga 4 e tiene 2'], ['she wins both for 0 and keeps 6', 'vince entrambi per 0 e tiene 6'],
      ['pay 0 and keep 1 each', 'pagano 0 e tengono 1 ciascuno'], ['bidder 1 wins AB, pays 2 and keeps 2', "l'offerente 1 vince AB, paga 2 e tiene 2"],
    ])
    check('observe, Panel B: total 14, revenue 9, without bidder 3 7 with bidder 2 paying 2', r3.total === 14 && r3.revenue === 9 && vcg(three.bids.slice(0, 2)).rows[1].payment === 2)
    const c10 = runCheat({ n: 20, k: 10, blocks: 10000, seed: 1 })
    const c20 = runCheat({ n: 20, k: 20, blocks: 10000, seed: 1 })
    const c1 = runCheat({ n: 20, k: 1, blocks: 10000, seed: 1 })
    const pmS = (x) => `${two(x.mean)} ± ${two(x.se)}`
    quoted('observe, Panel C', observe.cheat, [
      ['10,000 blocks', '10.000 blocchi'], pmS(c10.uniform.honest), two(honestUniform(20, 10)), pmS(c10.uniform.cheat), two(c10.monopolistic.honest.mean),
      ['in all 10,000 blocks', 'in tutti i 10.000 blocchi'], two(c10.uniform.cheat.served), two(c10.uniform.honest.users), two(c10.uniform.cheat.users),
      two(oneFake(20, 10)), two(oneFake(20, 10) - honestUniform(20, 10)), two(c10.pyb.honest.mean),
      two(c20.uniform.cheat.mean), two(c20.uniform.cheat.served), two(c20.uniform.honest.users), two(c20.uniform.cheat.users),
      two(c1.uniform.cheat.mean), two(c1.uniform.honest.mean), ['keeps 0.00', 'tiene 0,00'],
    ])
    check('observe, Panel C: cheating uniform = monopolistic in every block; pay your bid unchanged; k = 20 honest 0; k = 1 the winner keeps 0', c10.sameAsMonopolistic === 10000 && c10.uniform.cheat.mean === c10.monopolistic.honest.mean && c10.pyb.cheat.mean === c10.pyb.honest.mean && c20.uniform.honest.mean === 0 && two(c1.uniform.cheat.users) === '0.00')
  }
  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 1', sol(0), [['you pay 60', 'paghi 60'], ['keep 20', 'tieni 20'], '80 × 1'])
  check('exercise 1: F1\'s numbers', f1Readout(makeRule('single', { h: 60 }), 80).p === 60 && f1Readout(makeRule('single', { h: 60 }), 80).payoff === 20)
  quoted('exercise 2', sol(1), ['100 − 60 = 40', '0.8 × (100 − 30) = 56', '0.8 × 30 + 0.2 × 60 = 36', ['so 64', 'quindi 64'], '0.8 × 30 = 24', '80 − 24 = 56', 'α2 ≤ 4/7'])
  quoted('exercise 3', sol(2), ['70 × 0 − 20 = −20', ['the truth gives 20', 'la verità dà 20'], '50 − 10 = 40', ['keeping 30', 'tieni 30']])
  check('exercise 3: the middle rule pays −20 at 70 and 40 at 50', near(myersonPay(makeRule('middle'), 70), -20, 1e-12) && near(myersonPay(makeRule('middle'), 50), 40, 1e-12) && near(payoff(makeRule('middle'), 'myerson', 70, 50), 30, 1e-12))
  quoted('exercise 4', sol(3), [['total 8', 'totale 8'], ['Revenue 0', 'Ricavo 0'], ['revenue 4', 'ricavo 4']])
  quoted('exercise 5', sol(4), [['pays 4', 'paga 4'], ['keeps 2', 'tiene 2'], '4 − 4 = 0', ['keeps 6', 'tiene 6']])
  quoted('exercise 6', sol(5), ['100/6 = ' + two(sv.gains), ['the designer pays ' + two(-sv.budget), 'il progettista paga ' + itn(two(-sv.budget))], '1/2 × 1/2 = 1/4', '75 − 25 = 50', ['so 12.5', 'quindi 12,5'], '9/32', two(ss.gains), '9/64'])
  check('exercise 6: the chances are the code\'s', sv.chance === 0.5 && sp.chance === 0.25 && near(ss.chance, 9 / 32, 1e-15))
  quoted('exercise 7', sol(6), ['100 × 10/21', two(honestUniform(20, 10)), '100 × 11/21', '10 × 100 × 11/21 = ' + two(oneFake(20, 10)), ['about 547', 'circa 547']])
  check('seven exercises, each with a statement and a solution in both languages', exercises.length === 7 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language (the box not counted), with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(noBox[l]) >= 1400 && words(noBox[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(noBox[l])}, box ${words(boxText[l])}`).join('; '))
  check('the lecture places F1 and F2, has one box after the section on the limits, and names Bitcoin only in the box', ['en', 'it'].every((l) => /```figure\narea\n```/.test(body[l]) && /```figure\ntrade\n```/.test(body[l]) && (body[l].match(/```box/g) || []).length === 1 && body[l].indexOf('```box') > body[l].indexOf(l === 'en' ? '## What rules cannot do' : '## Ciò che le regole non possono fare') && !/bitcoin/i.test(noBox[l])))
  check('the lecture links modules 05 and 08', ['en', 'it'].every((l) => body[l].includes('(/game-theory-lab/incomplete-information-signalling)') && body[l].includes('(/game-theory-lab/congestion-price-of-anarchy)')))
  const allText = (l) => lecture[l] + Object.values(observe).map((o) => o[l]).join('') + exercises.map((x) => x.statement[l] + x.solution[l]).join('')
  check('the texts never call the course free, and never say peer-reviewed', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l)) && !/peer.reviewed/i.test(allText(l))))
  check('the Italian lecture uses the chosen terms (progettazione dei meccanismi, never "disegno"; compatibilità degli incentivi, never "con gli")', ['**progettazione dei meccanismi** (*mechanism design*)', '**principio di rivelazione**', '**meccanismo diretto**', '**compatibilità degli incentivi**', '**strategia dominante**', '**lemma di Myerson**', '**regola di allocazione**', '**monotona**', '**valore virtuale**', '**asta ottima**', '**meccanismo VCG** (Vickrey–Clarke–Groves)', '**esternalità**', '**razionalità individuale**', '**pareggio di bilancio**', '**scambio bilaterale**', '**asta doppia**', '**asta generalizzata al secondo prezzo** (*generalized second price*, GSP)', '**offerte sotto falso nome** (*false-name bids*', 'attacco Sybil', 'meccanismo delle commissioni (*transaction fee mechanism*)', 'commissione base (*base fee*)', '*payoff*', '*miner*'].every((t) => lecture.it.includes(t)) && !allText('it').includes('disegno dei meccanismi') && !allText('it').includes('compatibilità con gli incentivi'))
  check('the reading list has the chapters (Roughgarden lectures 3, 4, 5, 7; Nisan et al. 9; Krishna 5; Tadelis 14; Shoham and Leyton-Brown 10, 10.4.5) and every paper cited', ['Lectures 3 (', '4 (', '5 (', '7 (', 'Ch. 9 (', 'Ch. 5 (', 'Ch. 14 (', 'Ch. 10 (', '10.4.5'].every((t) => lecture.en.split('## Further reading')[1].includes(t)) && ['Gibbard', 'Myerson, R. B. (1979)', 'Dasgupta', 'Myerson, R. B. (1981)', 'Vickrey', 'Clarke', 'Groves', 'Satterthwaite', 'Chatterjee', 'Edelman', 'Varian', 'Ausubel', 'Yokoo', 'Babaioff', 'Roughgarden, T. (2021)', 'Chung'].every((t) => lecture.en.split('## Further reading')[1].includes(t) && lecture.it.split('## Letture consigliate')[1].includes(t)))
} else {
  info('texts.js or the lectures are not there yet: the "quoted on the page" checks are skipped')
}

info(`total time ${((performance.now() - T0) / 1000).toFixed(1)} s`)
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
