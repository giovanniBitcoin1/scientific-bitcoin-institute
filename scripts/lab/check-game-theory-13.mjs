// Self-checks for Game Theory Lab module 13, "Mining as a game". They run
// the same code as the page (selfish.js, race.js, difficulty.js, mdp.js and
// the precomputed optimal.json) and compare it with closed forms, with
// independent computations (the chain solved numerically, the MDP rerun,
// many seeded paths) and with the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-13.mjs
//
// Exits with code 1 if any check fails. Lines starting with INFO report
// numbers that are not checked (timings, simulated values).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { relativeRevenue, threshold, stationary, stationaryNumeric, rates, per100 } from '../../src/components/lab/game-theory/mining-as-a-game/selfish.js'
import { runRace } from '../../src/components/lab/game-theory/mining-as-a-game/race.js'
import { expected, simulatePath, adjustments } from '../../src/components/lab/game-theory/mining-as-a-game/difficulty.js'
import { optimalShare, optimalThreshold, buildModel, sm1Policy, policyShare, greedy, policyMap, sm1Action, ACTIONS, LETTER, FORKS } from '../../src/components/lab/game-theory/mining-as-a-game/mdp.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')
const dir = 'src/components/lab/game-theory/mining-as-a-game'
const table = JSON.parse(read(`${dir}/optimal.json`))

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const T0 = performance.now()
const f = (v, d = 4) => (Object.is(Math.round(v * 10 ** d) / 10 ** d, -0) ? 0 : v).toFixed(d)
const near = (a, b, tol = 5e-7) => Math.abs(a - b) <= tol

// ------------------------------------------------------------------ The chain

console.log('— The chain: stationary distribution, R, orphans')
{
  let worst = 0
  const grid = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 1 / 3, 0.35, 0.4, 0.45]
  for (const a of grid) {
    const sn = stationaryNumeric(a, 400)
    for (const g of [0, 0.5, 1]) worst = Math.max(worst, Math.abs(rates(a, g, sn).R - relativeRevenue(a, g)), Math.abs(rates(a, g).R - relativeRevenue(a, g)))
  }
  check('the stationary distribution solved numerically (lead up to 400) gives the closed-form R for α = 0.05 … 0.45 and γ = 0, 1/2, 1 (within 1e-9)', worst < 1e-9, worst.toExponential(1))
  {
    // Near 1/2 the lead decays slowly ((α/(1 − α))^400 ≈ 1e-7 at 0.49): a longer chain.
    const sn = stationaryNumeric(0.49, 1500)
    const w = Math.max(...[0, 0.5, 1].map((g) => Math.abs(rates(0.49, g, sn).R - relativeRevenue(0.49, g))))
    check('α = 0.49, lead up to 1,500: the same within 1e-9', w < 1e-9, w.toExponential(1))
  }
  grid.push(0.49)
  const R6 = {
    0.25: ['0.195122', '0.250000', '0.304878'],
    0.3: ['0.273126', '0.326874', '0.380622'],
    [1 / 3]: ['0.333333', '0.384615', '0.435897'],
    0.35: ['0.366509', '0.416034', '0.465560'],
    0.4: ['0.483721', '0.525581', '0.567442'],
    0.45: ['0.651773', '0.680598', '0.709423'],
  }
  for (const [a, vals] of Object.entries(R6)) {
    const got = [0, 0.5, 1].map((g) => f(relativeRevenue(Number(a), g), 6))
    check(`R at α = ${f(Number(a), 4)} (γ = 0; 1/2; 1): ${vals.join('; ')}`, got.join() === vals.join(), got.join('; '))
  }
  check('R(1/3, 0) = 1/3 exactly (to 1e-15)', near(relativeRevenue(1 / 3, 0), 1 / 3, 1e-15))
  const th = [0, 0.25, 0.5, 0.75, 1].map(threshold)
  check('thresholds (1 − γ)/(3 − 2γ): 1/3, 0.3, 1/4, 1/6, 0', near(th[0], 1 / 3, 1e-15) && near(th[1], 0.3, 1e-15) && near(th[2], 0.25, 1e-15) && near(th[3], 1 / 6, 1e-15) && th[4] === 0, th.map((x) => f(x, 4)).join(', '))
  // R > α exactly above the threshold.
  let bad = 0
  for (let g = 0; g <= 1.0001; g += 0.05) for (let a = 0.005; a < 0.5; a += 0.005) {
    const t = threshold(g)
    if (Math.abs(a - t) < 1e-9) continue
    if (relativeRevenue(a, g) > a !== a > t) bad++
  }
  check('R > α exactly when α > (1 − γ)/(3 − 2γ) (γ every 0.05, α every 0.005)', bad === 0, `${bad} exceptions`)
  const s = stationary(1 / 3)
  check('α = 1/3: p0 9/17, p0′ 2/17, p1 3/17, p2 3/34', near(s.p0, 9 / 17, 1e-15) && near(s.p0p, 2 / 17, 1e-15) && near(s.p1, 3 / 17, 1e-15) && near(s.p2, 3 / 34, 1e-15), [s.p0, s.p0p, s.p1, s.p2].map((x) => f(x, 6)).join(', '))
  const G = [0.25, 0.3, 1 / 3, 0.35, 0.4, 0.45].map((a) => [0, 0.5, 1].map((g) => rates(a, g).G))
  check('G, chain blocks per block mined, is the same for every γ', G.every((row) => row.every((x) => near(x, row[0], 1e-14))))
  check('G: 0.82 (α = 0.25), 0.788184 (0.3), 13/17 (1/3), 0.751783 (0.35), 43/61 (0.4), 0.634318 (0.45)', near(G[0][0], 0.82, 1e-14) && f(G[1][0], 6) === '0.788184' && near(G[2][0], 13 / 17, 1e-14) && f(G[3][0], 6) === '0.751783' && near(G[4][0], 43 / 61, 1e-14) && f(G[5][0], 6) === '0.634318', G.map((r) => f(r[0], 6)).join(', '))
  const O = [[1 / 3, 0, '7.843', '15.686'], [0.4, 0, '5.902', '23.607'], [0.35, 0.5, '3.723', '21.098'], [0.3, 1, '0.000', '21.182']]
  for (const [a, g, x, y] of O) {
    const p = per100(a, g)
    check(`orphans per 100 mined at α = ${f(a, 4)}, γ = ${g}: hers ${x}, the others' ${y}`, f(p.oA, 3) === x && f(p.oH, 3) === y, `${f(p.oA, 3)}, ${f(p.oH, 3)}`)
  }
  let cons = 0
  for (const a of grid) for (const g of [0, 0.3, 0.5, 1]) {
    const r = rates(a, g)
    cons = Math.max(cons, Math.abs(r.rA + r.rH + r.oA + r.oH - 1), Math.abs(r.oA - (a - r.rA)))
  }
  check('every block mined ends in the chain or orphaned (r_A + r_H + o_A + o_H = 1), and her orphans are α − r_A', cons < 1e-14, cons.toExponential(1))
  const p4 = per100(0.4, 0)
  check('α = 0.4, γ = 0: share 0.4837; 29.5 of 100 orphaned, 23.6 of them the others\'; 70.49 in the chain', f(relativeRevenue(0.4, 0), 4) === '0.4837' && f(p4.oA + p4.oH, 1) === '29.5' && f(p4.oH, 1) === '23.6' && f(p4.chain, 2) === '70.49')
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: race the network')
{
  const pairs = [[0.1, 0], [0.2, 0.5], [0.25, 1], [0.3, 0], [1 / 3, 0.25], [0.35, 0.5], [0.4, 0], [0.4, 1], [0.45, 0.75], [0.49, 0.5]]
  const z = (x, ex, se) => (se === 0 ? (Math.abs(x - ex) < 1e-12 ? 0 : Infinity) : Math.abs(x - ex) / se)
  const t = performance.now()
  const rows = pairs.map(([a, g]) => {
    const r = runRace({ alpha: a, gamma: g, blocks: 1000000, seed: 1 })
    const p = per100(a, g)
    return { a, g, r, zs: z(r.share, relativeRevenue(a, g), r.shareSe), zA: z(r.oA, p.oA, r.oASe), zH: z(r.oH, p.oH, r.oHSe), chainDiff: Math.abs(r.chain - p.chain) }
  })
  const ms = performance.now() - t
  const worst = rows.reduce((m, x) => Math.max(m, x.zs, x.zA, x.zH), 0)
  check('1,000,000 blocks, run 1: her share and both orphan counts within 4 standard errors of the exact values, for ten (α, γ) pairs', worst < 4, `largest ${f(worst, 2)} standard errors`)
  for (const x of rows) info(`α ${f(x.a, 3)} γ ${x.g}: share ${f(x.r.share, 4)} ± ${f(x.r.shareSe, 4)} (exact ${f(relativeRevenue(x.a, x.g), 4)}), orphans ${f(x.r.oA, 2)} and ${f(x.r.oH, 2)}, chain ${f(x.r.chain, 2)}, longest lead ${x.r.maxLead}; z ${f(x.zs, 2)}, ${f(x.zA, 2)}, ${f(x.zH, 2)}`)
  check('γ = 1: she never loses a block (no orphans of hers in 1,000,000)', rows.filter((x) => x.g === 1).every((x) => x.r.oA === 0))
  check('the strip holds the last 40 events', rows.every((x) => x.r.strip.length === 40))
  info(`Panel A in Node: ten runs of 1,000,000 blocks in ${(ms / 1000).toFixed(2)} s`)
  const r4 = runRace({ alpha: 0.4, gamma: 0, blocks: 1000000, seed: 1 })
  info(`Exercise 3 (α 0.4, γ 0, 1,000,000 blocks, run 1): share ${f(r4.share, 4)} ± ${f(r4.shareSe, 4)}, orphans ${f(r4.oA, 2)} and ${f(r4.oH, 2)}, chain ${f(r4.chain, 2)}`)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: the difficulty catches up')
{
  const B = [
    [0.4, 0, '0.8525', '1.2093', '19.860', '33.860'],
    [0.35, 0.5, '0.8936', '1.1887', '18.622', '29.122'],
    [0.35, 0, '0.7872', '1.0472', '18.622', '102.622'],
    [0.3, 1, '1.0000', '1.2687', '17.762', '17.762'],
    [1 / 3, 0, '0.7647', '1.0000', '18.308', 'never'],
    [0.25, 0.75, '0.9100', '1.1098', '17.073', '31.073'],
  ]
  for (const [a, g, b, af, t1, be] of B) {
    const e = expected(a, g)
    const got = [f(e.before, 4), f(e.after, 4), f(e.T1, 3), e.breakEven === null ? 'never' : f(e.breakEven, 3)]
    check(`α = ${f(a, 4)}, γ = ${g}: before ${b}, after ${af}, first adjustment ${t1} days, break-even ${be}`, got.join() === [b, af, t1, be].join(), got.join('; '))
  }
  // The break-even day is where the two expected lines meet.
  let w = 0
  for (const [a, g] of [[0.4, 0], [0.35, 0.5], [0.35, 0], [0.25, 0.75], [0.45, 0.2]]) {
    const e = expected(a, g)
    w = Math.max(w, Math.abs(e.selfish(e.breakEven) - e.honest(e.breakEven)) / e.honest(e.breakEven))
  }
  check('on the break-even day her expected reward equals honest mining\'s', w < 1e-12, w.toExponential(1))
  check('the adjustments on the expected line: T1, then every 14 days', (() => { const e = expected(0.4, 0); const x = adjustments(e.T1, 60); return x.length === 3 && near(x[1] - x[0], 14, 1e-12) && near(x[2] - x[1], 14, 1e-12) })())
  check('α = 0.3, γ = 1: r_A = α exactly, so the break-even day is the day of the first adjustment', near(rates(0.3, 1).rA, 0.3, 1e-15) && near(expected(0.3, 1).breakEven, expected(0.3, 1).T1, 1e-12))
  // One simulated path against 200 others (seeds 1001–1200) for its spread.
  const t = performance.now()
  for (const [a, g, H] of [[0.4, 0, 60], [0.35, 0.5, 60], [0.3, 1, 90], [0.45, 0, 30]]) {
    const e = expected(a, g)
    const ends = Array.from({ length: 200 }, (_, i) => simulatePath({ alpha: a, gamma: g, horizon: H, seed: 1001 + i }).end)
    const m = ends.reduce((s, x) => s + x, 0) / ends.length
    const sd = Math.sqrt(ends.reduce((s, x) => s + (x - m) ** 2, 0) / (ends.length - 1))
    const p = simulatePath({ alpha: a, gamma: g, horizon: H, seed: 1 })
    const ex = e.selfish(H)
    check(`α = ${a}, γ = ${g}, ${H} days: the path of run 1 ends within 3 standard deviations of the expected line`, Math.abs(p.end - ex) < 3 * sd, `end ${p.end}, expected ${f(ex, 1)}, sd ${f(sd, 1)} (200 seeds, mean ${f(m, 1)})`)
  }
  info(`Panel B: 804 paths in ${((performance.now() - t) / 1000).toFixed(2)} s`)
}

// ------------------------------------------------------------------ Panel C

console.log('— Panel C: the best deviation')
const cell = (a, g) => table.cells.find((c) => Math.abs(c.alpha - a) < 1e-9 && Math.abs(c.gamma - g) < 1e-9)
{
  check('the table: T = 40, tolerance 1e-6, 12 values of α for each of the five γ, and the policies of nine cells', table.T === 40 && table.tol === 1e-6 && table.cells.length === 60 && [0, 0.25, 0.5, 0.75, 1].every((g) => table.cells.filter((c) => c.gamma === g).length === 12) && table.policies.length === 9)
  const t = performance.now()
  const P = [
    [1 / 3, 0, '0.33705'], [0.35, 0, '0.37075'], [0.375, 0, '0.42590'], [0.4, 0, '0.48824'],
    [0.35, 0.5, '0.43018'], [0.4, 0.5, '0.57251'], [0.3, 0.75, '0.37942'], [0.3, 1, '0.42857'],
  ]
  for (const [a, g, v] of P) {
    const r = optimalShare(a, g, { T: 40, tol: 1e-6 })
    const c = cell(a, g)
    check(`recomputed: α = ${f(a, 4)}, γ = ${g}: optimal ${v}; the table agrees within 1e-6`, f(r.share, 5) === v && Math.abs(c.opt - r.share) < 1e-6, `${f(r.share, 6)}, table ${c.opt}`)
  }
  for (const [a, g] of [[0.2, 0], [0.2, 0.5], [0.3, 0.25]]) {
    const r = optimalShare(a, g, { T: 40 })
    check(`honest mining is optimal at α = ${a}, γ = ${g} (recomputed and in the table)`, r.honest && cell(a, g).honest)
  }
  check('in the table, honest mining is optimal at α = 0.2 for γ ≤ 1/2 and not for γ ≥ 3/4', [0, 0.25, 0.5].every((g) => cell(0.2, g).honest) && [0.75, 1].every((g) => !cell(0.2, g).honest))
  check('SM1\'s column is the closed-form R', table.cells.every((c) => Math.abs(c.sm1 - relativeRevenue(c.alpha, c.gamma)) < 1e-7))
  const below = table.cells.filter((c) => c.opt < c.sm1 - 1e-6 || c.opt < c.alpha - 1e-6)
  check('the optimum is never below SM1\'s R, nor below α', below.length === 0, below.map((c) => `${c.alpha},${c.gamma}`).join(' '))
  const g1 = table.cells.filter((c) => c.gamma === 1).map((c) => Math.abs(c.opt - c.alpha / (1 - c.alpha)))
  check('γ = 1: the optimum equals α/(1 − α) for every α of the table (within 1e-4; truncation at T = 40)', g1.every((d) => d < 1e-4), `largest gap ${Math.max(...g1).toExponential(1)} at α = 0.45`)
  {
    const gaps = table.cells.filter((c) => c.gamma === 1).map((c) => `${f(c.alpha, 3)}: ${(c.alpha / (1 - c.alpha) - c.opt).toExponential(1)}`)
    check('γ = 1: within 1e-6 up to α = 0.4 (the gap above is truncation: the optimum is below α/(1 − α), never above)', table.cells.filter((c) => c.gamma === 1).every((c) => c.opt <= c.alpha / (1 - c.alpha) + 1e-6) && table.cells.filter((c) => c.gamma === 1 && c.alpha <= 0.4 + 1e-9).every((c) => Math.abs(c.opt - c.alpha / (1 - c.alpha)) < 1e-6), gaps.join(', '))
  }
  const paper = [[1 / 3, 0.33705], [0.35, 0.37077], [0.375, 0.426], [0.4, 0.48866]]
  info(`against Sapirshtein et al.'s table for γ = 0 (T = 95): ${paper.map(([a, v]) => `α ${f(a, 3)}: paper ${v}, ours ${f(cell(a, 0).opt, 5)}`).join('; ')}`)
  check('γ = 0: our T = 40 values are at most the paper\'s T = 95 values and within 5e-4 of them', paper.every(([a, v]) => cell(a, 0).opt <= v + 5e-6 && v - cell(a, 0).opt < 5e-4))
  // The SM1 policy evaluated inside the MDP gives back R.
  {
    const M40 = buildModel(0.35, 0, 40)
    const s40 = policyShare(M40, sm1Policy(M40)).share
    const M80 = buildModel(0.4, 0, 80)
    const s80 = policyShare(M80, sm1Policy(M80), { iters: 2000000, tol: 1e-15 }).share
    check('SM1 written as a policy of the MDP gives R: α = 0.35, γ = 0, T = 40 within 5e-5; α = 0.4, γ = 0, T = 80 within 1e-4', Math.abs(s40 - relativeRevenue(0.35, 0)) < 5e-5 && Math.abs(s80 - relativeRevenue(0.4, 0)) < 1e-4, `${f(s40, 6)} vs ${f(relativeRevenue(0.35, 0), 6)}; ${f(s80, 6)} vs ${f(relativeRevenue(0.4, 0), 6)}`)
  }
  // Thresholds.
  const tt = performance.now()
  const th0 = optimalThreshold(0, { lo: 0.3, hi: 0.34, tol: 1e-5 })
  const th1 = optimalThreshold(0.1, { lo: 0.3, hi: 0.34, tol: 1e-5 })
  check('thresholds of the best deviation: γ = 0 0.3294; γ = 0.1 0.3192 (SM1 0.3214)', f(th0, 4) === '0.3294' && f(th1, 4) === '0.3192' && f(threshold(0.1), 4) === '0.3214', `${f(th0, 5)}, ${f(th1, 5)}`)
  info(`two thresholds in ${((performance.now() - tt) / 1000).toFixed(2)} s`)
  const tb = Object.fromEntries(table.thresholds.map((x) => [x.gamma, x]))
  check('the table\'s thresholds: γ = 0 0.3294; γ = 1/4 and 1/2 the same as SM1 (0.3, 0.25); γ = 3/4 1/6; γ = 1 0', f(tb[0].opt, 4) === '0.3294' && f(tb[0.25].opt, 4) === '0.3000' && f(tb[0.5].opt, 4) === '0.2500' && f(tb[0.75].opt, 4) === '0.1667' && tb[1].opt < 1e-4, table.thresholds.map((x) => `${x.gamma}: ${x.opt}`).join(', '))
  // Policies: the table's maps are what the solver gives; the two maps of the prompt.
  const pol = (a, g) => table.policies.find((p) => Math.abs(p.alpha - a) < 1e-9 && p.gamma === g).map
  {
    const r = optimalShare(0.35, 0, { T: 40, tol: 1e-6 })
    const m = policyMap(r.model, greedy(r.model, r.rho, r.V), 8)
    check('the policy at α = 0.35, γ = 0, recomputed, is the table\'s', FORKS.every((k) => m[k].join() === pol(0.35, 0)[k].join()))
  }
  const diffs = (a, g) => {
    const m = pol(a, g)
    const out = []
    FORKS.forEach((k, fi) => m[k].forEach((row, aa) => [...row].forEach((ch, h) => {
      if (ch !== '.' && ch !== LETTER[sm1Action(aa, h, fi, 40)]) out.push(`${k[0]}(${aa},${h})${ch}`)
    })))
    return out
  }
  const d35 = diffs(0.35, 0)
  check('α = 0.35, γ = 0: she waits where SM1 adopts, one or two blocks behind (relevant (1, 2), (2, 3), (4, 6))', ['r(1,2)W', 'r(2,3)W', 'r(4,6)W'].every((x) => d35.includes(x)) && d35.filter((x) => x.endsWith('W')).every((x) => { const [aa, h] = x.slice(2, -2).split(',').map(Number); return h - aa >= 1 && h - aa <= 2 }), d35.join(' '))
  const d40 = diffs(0.4, 0.5)
  check('α = 0.4, γ = 1/2: she also matches where SM1 overrides, one block ahead when an honest block arrives (relevant (2, 1), (3, 2))', d40.includes('r(2,1)M') && d40.includes('r(3,2)M'), d40.join(' '))
  check('α = 0.3, γ = 0: honest mining (override at (1, 0), adopt at (0, 1), irrelevant after an adopt and relevant after an override; nothing else reached)', pol(0.3, 0).irrelevant[1][0] === 'O' && pol(0.3, 0).irrelevant[0][1] === 'A' && pol(0.3, 0).relevant[0][1] === 'A' && FORKS.every((k) => pol(0.3, 0)[k].join('').replace(/\./g, '').length === { irrelevant: 2, relevant: 1, active: 0 }[k]))
  info(`policy differences from SM1 (fork initial, (a, h), action): α 0.35 γ 0: ${d35.join(' ')}`)
  info(`α 0.4 γ 1/2: ${d40.join(' ')}`)
  info(`Panel C recomputations in ${((performance.now() - t) / 1000).toFixed(1)} s`)
}

// ------------------------------------------------------------------ Quoted on the page

const textsFile = resolve(root, `${dir}/texts.js`)
const lectureFile = (l) => `src/content/game-theory-lab/mining-as-a-game.${l}.md`
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
  const int = (x) => Math.round(x).toLocaleString('en-US')
  const pct = (x) => `${f(100 * x, 2)}%`
  const body = { en: lecture.en.split(/<!--\s*simulation\s*-->/)[0], it: lecture.it.split(/<!--\s*simulation\s*-->/)[0] }
  const reading = { en: lecture.en.split('## Further reading')[1] || '', it: lecture.it.split('## Letture consigliate')[1] || '' }
  // ---- The lecture
  const r4 = rates(0.4, 0)
  const p4 = per100(0.4, 0)
  const e4 = expected(0.4, 0)
  quoted('lecture: the chain and the threshold', body, [
    ['(2016, section 5.5)', '(2016, sezione 5.5)'],
    'R(α, γ) = [α(1 − α)²(4α + γ(1 − 2α)) − α³] / [1 − α(1 + (2 − α)α)]', 'α > (1 − γ) / (3 − 2γ)',
    ['a third if she loses every race (γ = 0), a quarter if she wins half of them (γ = 1/2), and zero if she wins them all (γ = 1)', 'un terzo se il miner perde ogni gara (γ = 0), un quarto se ne vince metà (γ = 1/2) e zero se le vince tutte (γ = 1)'],
    [`With α = 0.4 and γ = 0 her share is ${f(relativeRevenue(0.4, 0), 4)}, and ${f(p4.oA + p4.oH, 1)} of every 100 blocks found are orphaned, ${f(p4.oH, 1)} of them the others'`, `Con α = 0,4 e γ = 0 la sua quota è ${itn(f(relativeRevenue(0.4, 0), 4))}, e ${itn(f(p4.oA + p4.oH, 1))} blocchi ogni 100 trovati diventano orfani, ${itn(f(p4.oH, 1))} dei quali degli altri`],
    [`${f(p4.oA, 1)} of every 100, but the others lose four times as many`, `${itn(f(p4.oA, 1))} ogni 100, ma gli altri ne perdono quattro volte tanti`],
    ['(7 November 2013)', '(7 novembre 2013)'],
  ])
  check('lecture: at α = 0.4, γ = 0 the others lose four times as many blocks as she does (within 0.1%)', Math.abs(p4.oH / p4.oA - 4) < 0.004, f(p4.oH / p4.oA, 4))
  check('lecture: the thresholds quoted are the formula\'s (1/3, 1/4, 0)', near(threshold(0), 1 / 3, 1e-15) && near(threshold(0.5), 0.25, 1e-15) && threshold(1) === 0)
  quoted('lecture: the difficulty', body, [
    [`43/61, about ${f(r4.G, 3)}`, `43/61, circa ${f(r4.G, 3).replace(".", ",")}`], ['every 2016 blocks', 'ogni 2016 blocchi'],
    [`${pct(e4.before)} of the honest income, for 14/G = ${f(e4.T1, 2)} days`, `${itn(pct(e4.before))} del reddito onesto, per 14/G = ${itn(f(e4.T1, 2))} giorni`],
    [`${pct(e4.after)} of honest`, `${itn(pct(e4.after))} di quello onesto`], [`on day ${f(e4.breakEven, 2)}`, `il giorno ${itn(f(e4.breakEven, 2))}`],
    'T₁ · (R − r_A) / (R − α)',
  ])
  check('lecture: G = 43/61 at α = 0.4 (for every γ)', near(r4.G, 43 / 61, 1e-14) && near(rates(0.4, 1).G, 43 / 61, 1e-14))
  quoted('lecture: the best deviation', body, [
    ['their table gives 0.37077 at α = 0.35', 'la loro tabella dà 0,37077 con α = 0,35'], [`SM1's ${f(relativeRevenue(0.35, 0), 4)}`, `lo ${itn(f(relativeRevenue(0.35, 0), 4))} di SM1`],
    ['from about α = 0.329 instead of a third', 'da circa α = 0,329 anziché da un terzo'], [`truncated at 40 blocks: ${f(table.thresholds[0].opt, 4)}`, `con un **troncamento** a 40 blocchi: ${itn(f(table.thresholds[0].opt, 4))})`],
    ['From γ of about 0.2 on, the two thresholds coincide (a quarter at γ = 1/2)', 'Da γ di circa 0,2 in su le due soglie coincidono (un quarto con γ = 1/2)'],
  ])
  check('lecture: our γ = 0 threshold is 0.3294 and about 0.329; the γ = 1/2 threshold is 1/4 for both', f(table.thresholds[0].opt, 4) === '0.3294' && f(table.thresholds[0].opt, 3) === '0.329' && f(table.thresholds.find((t) => t.gamma === 0.5).opt, 4) === '0.2500' && table.thresholds.find((t) => t.gamma === 0.25).opt === table.thresholds.find((t) => t.gamma === 0.25).sm1)
  quoted('lecture: why it has not been seen', body, [
    [`earns ${pct(e4.before)} of the honest income for almost 20 days`, `incassa l'${itn(pct(e4.before))} del reddito onesto per quasi 20 giorni`],
    ['0.41% of blocks were stale in February 2016 (Gervais and coauthors, 2016)', 'lo 0,41% dei blocchi era orfano (*stale*) nel febbraio 2016 (Gervais e coautori, 2016)'],
    [`would orphan ${f(p4.oA + p4.oH, 1)} of every 100 blocks found`, `renderebbe orfani ${itn(f(p4.oA + p4.oH, 1))} blocchi ogni 100 trovati`],
    ['The reasons below are hypotheses, not findings.', 'Le ragioni qui sotto sono ipotesi, non risultati.'],
  ])
  check('lecture: "almost 20 days" is T1 = 19.86', e4.T1 > 19.5 && e4.T1 < 20)
  // ---- What to observe, Panel A (run no. 1)
  {
    const a = runRace({ alpha: 0.4, gamma: 0, blocks: 100000, seed: 1 })
    const b = runRace({ alpha: 0.4, gamma: 0, blocks: 1000000, seed: 1 })
    const c = runRace({ alpha: 0.4, gamma: 1, blocks: 100000, seed: 1 })
    const d = runRace({ alpha: 0.3, gamma: 0, blocks: 100000, seed: 1 })
    const pm = (x, s, k) => `${f(x, k)} ± ${f(s, k)}`
    quoted('observe, Panel A', observe.race, [
      ['100,000 blocks mined', '100.000 blocchi trovati'], pm(a.share, a.shareSe, 4), `R = ${f(relativeRevenue(0.4, 0), 4)}`, pm(a.oA, a.oASe, 2), pm(a.oH, a.oHSe, 2),
      [`exact ${f(p4.oA, 2)} and ${f(p4.oH, 2)}`, `esatti ${itn(f(p4.oA, 2))} e ${itn(f(p4.oH, 2))}`], f(a.chain, 2), [`exact ${f(p4.chain, 2)}`, `esatto ${itn(f(p4.chain, 2))}`], [`${a.maxLead} blocks`, `${a.maxLead} blocchi`],
      ['**1,000,000**', '**1.000.000**'], pm(b.share, b.shareSe, 4), [`orphans ${f(b.oA, 2)} and ${f(b.oH, 2)}, chain ${f(b.chain, 2)}`, `orfani ${itn(f(b.oA, 2))} e ${itn(f(b.oH, 2))}, catena ${itn(f(b.chain, 2))}`],
      `(${f(c.oA, 2)})`, pm(c.share, c.shareSe, 4), [`exact ${f(relativeRevenue(0.4, 1), 4)}`, `esatto ${itn(f(relativeRevenue(0.4, 1), 4))}`], [`stay at ${f(c.chain, 2)}`, `restano ${itn(f(c.chain, 2))}`],
      pm(d.share, d.shareSe, 4), [`exact ${f(relativeRevenue(0.3, 0), 4)}`, `esatto ${itn(f(relativeRevenue(0.3, 0), 4))}`],
    ])
    check('observe, Panel A: γ only decides whose blocks fill the chain (the same chain count at γ = 0 and 1); ten times the blocks, about a third of the error', c.chain === a.chain && c.oA === 0 && b.shareSe / a.shareSe > 0.25 && b.shareSe / a.shareSe < 0.4, f(b.shareSe / a.shareSe, 3))
  }
  // ---- What to observe, Panel B
  {
    const e35 = expected(0.35, 0)
    const e33 = expected(0.33, 0)
    const e5 = expected(0.35, 0.5)
    const p = simulatePath({ alpha: 0.4, gamma: 0, horizon: 60, seed: 1 })
    quoted('observe, Panel B', observe.difficulty, [
      pct(e4.before), [`on day ${f(e4.T1, 2)}`, `il giorno ${itn(f(e4.T1, 2))}`], pct(e4.after), [`on day ${f(e4.breakEven, 2)}`, `il giorno ${itn(f(e4.breakEven, 2))}`],
      `(${f(e4.T1, 2)} + 14)`, [`${int(e4.selfish(60))} blocks against ${int(e4.honest(60))}`, `${itn(int(e4.selfish(60)))} blocchi contro i ${itn(int(e4.honest(60)))}`], [`ends at ${int(p.end)}`, `finisce a ${itn(int(p.end))}`],
      pct(e35.after), [`on day ${f(e35.breakEven, 2)}`, `il giorno ${itn(f(e35.breakEven, 2))}`], [`${int(e35.selfish(90))} blocks expected against ${int(e35.honest(90))}`, `${itn(int(e35.selfish(90)))} blocchi attesi contro ${itn(int(e35.honest(90)))}`],
      pct(e33.after), pct(e5.before), pct(e5.after), f(e5.breakEven, 2),
    ])
    check('observe, Panel B: at α = 0.4, γ = 0 the break-even day is T1 + 14 (to 0.01 day), at α = 0.35 it is not; at α = 0.33 R < α', Math.abs(e4.breakEven - e4.T1 - 14) < 0.01 && Math.abs(e35.breakEven - e35.T1 - 14) > 1 && e33.breakEven === null && e35.breakEven > 90)
  }
  // ---- What to observe, Panel C
  const pol = (a, g) => table.policies.find((p) => Math.abs(p.alpha - a) < 1e-9 && p.gamma === g).map
  const ndiff = (a, g) => {
    let n = 0
    FORKS.forEach((k, fi) => pol(a, g)[k].forEach((row, aa) => [...row].forEach((ch, h) => { if (ch !== '.' && ch !== LETTER[sm1Action(aa, h, fi, 40)]) n++ })))
    return n
  }
  {
    const c = (a, g) => cell(a, g)
    quoted('observe, Panel C', observe.best, [
      ['up to α = 0.325', 'fino ad α = 0,325'], f(c(1 / 3, 0).opt, 4), [`${f(c(0.35, 0).opt, 4)} against ${f(c(0.35, 0).sm1, 4)}`, `${itn(f(c(0.35, 0).opt, 4))} contro ${itn(f(c(0.35, 0).sm1, 4))}`], [`from α = ${f(table.thresholds[0].opt, 4)}`, `da α = ${itn(f(table.thresholds[0].opt, 4))}`],
      [`${ndiff(0.35, 0)} reached cells differ`, `${ndiff(0.35, 0)} celle raggiunte differiscono`],
      [`both thresholds are ${f(table.thresholds.find((t) => t.gamma === 0.5).opt, 2)}`, `entrambe le soglie sono ${itn(f(table.thresholds.find((t) => t.gamma === 0.5).opt, 2))}`],
      [`${f(c(0.4, 0.5).opt, 4)} against ${f(c(0.4, 0.5).sm1, 4)}`, `${itn(f(c(0.4, 0.5).opt, 4))} contro ${itn(f(c(0.4, 0.5).sm1, 4))}`], [`(${ndiff(0.4, 0.5)} cells differ)`, `(${ndiff(0.4, 0.5)} celle differiscono)`], '(2, 1)',
      [`${f(c(0.3, 1).opt, 4)} at α = 0.3 against SM1's ${f(c(0.3, 1).sm1, 4)}`, `${itn(f(c(0.3, 1).opt, 4))} con α = 0,3 contro lo ${itn(f(c(0.3, 1).sm1, 4))} di SM1`],
      [`earns ${f(c(0.325, 0.25).opt, 4)}, SM1 ${f(c(0.325, 0.25).sm1, 4)}`, `rende ${itn(f(c(0.325, 0.25).opt, 4))}, SM1 ${itn(f(c(0.325, 0.25).sm1, 4))}`],
    ])
    check('observe, Panel C: honest optimal for α ≤ 0.325 at γ = 0 and not at 1/3; SM1 earns exactly 1/3 at 1/3; the map at (2, 1) relevant is M for α = 0.4, γ = 1/2 and O for SM1; α = 0.3, γ = 0 reaches two states', table.cells.filter((x) => x.gamma === 0).every((x) => x.honest === (x.alpha <= 0.325 + 1e-9)) && near(c(1 / 3, 0).sm1, 1 / 3, 1e-7) && pol(0.4, 0.5).relevant[2][1] === 'M' && sm1Action(2, 1, 1, 40) === 'override' && pol(0.3, 0).irrelevant.join('').replace(/\./g, '').length === 2 && Math.abs(c(0.3, 1).opt - 3 / 7) < 1e-6)
  }
  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  {
    const s = stationary(1 / 3)
    quoted('exercise 1', sol(0), ['2/27 − 4/9 + 1 = 17/27', '(1/3)/(17/27) = 9/17', 'p1 = 3/17', '(1/3)(2/3)(9/17) = 2/17', 'R = 1/3'])
    check('exercise 1: the code gives 9/17, 3/17, 2/17 and R = 1/3', near(s.p0, 9 / 17, 1e-15) && near(s.p1, 3 / 17, 1e-15) && near(s.p0p, 2 / 17, 1e-15) && near(relativeRevenue(1 / 3, 0), 1 / 3, 1e-15) && near(2 / 27 - 4 / 9 + 1, 17 / 27, 1e-15))
    quoted('exercise 2', sol(1), ['γ = 0: 1/3', '(3/4)/(5/2) = 0.3', '(1/2)/2 = 1/4', 'γ = 1: 0'])
    const b = runRace({ alpha: 0.4, gamma: 0, blocks: 1000000, seed: 1 })
    quoted('exercise 3', sol(2), [[`Exact: ${f(relativeRevenue(0.4, 0), 4)}; ${f(p4.oA, 2)} of hers and ${f(p4.oH, 2)}`, `Esatti: ${itn(f(relativeRevenue(0.4, 0), 4))}; ${itn(f(p4.oA, 2))} dei suoi e ${itn(f(p4.oH, 2))}`], f(p4.chain, 2), [`${f(b.share, 4)} ± ${f(b.shareSe, 4)}, ${f(b.oA, 2)} and ${f(b.oH, 2)}, ${f(b.chain, 2)}`, itn(`${f(b.share, 4)} ± ${f(b.shareSe, 4)}; ${f(b.oA, 2)} e ${f(b.oH, 2)}; ${f(b.chain, 2)}`)]])
    quoted('exercise 4', sol(3), ['G = 43/61', `R·G = ${f(r4.rA, 4)}`, `r_A/α = ${pct(e4.before)}`, `R/α = ${pct(e4.after)}`, `14/G = ${f(e4.T1, 2)}`, `(R − α) = ${f(e4.breakEven, 2)}`])
    check('exercise 4: r_A = R·G', near(r4.rA, r4.R * r4.G, 1e-15))
    const e3 = expected(0.3, 1)
    quoted('exercise 5', sol(4), [`(${pct(e3.before)})`, `R/α = ${f(e3.after, 4)}`, `(${f(e3.T1, 2)})`])
    quoted('exercise 6', sol(5), [`SM1: ${f(cell(0.35, 0).sm1, 4)}`, f(cell(0.35, 0).opt, 4), '0.37077', ['95 blocks instead of 40', '95 blocchi invece di 40'], `α = ${f(table.thresholds[0].opt, 4)}`])
    check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))
  }
  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,500 and 1,800 in each language (no box), with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(body[l]) >= 1500 && words(body[l]) <= 1800 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(body[l])}`).join('; '))
  check('the lecture places F1 and F2, has no box, and links modules 02, 04, 06, 10, 11 and 12', ['en', 'it'].every((l) => /```figure\nchain\n```/.test(body[l]) && /```figure\nthreshold\n```/.test(body[l]) && !body[l].includes('```box') && ['nash-equilibrium', 'sequential-games-commitment', 'repeated-games-reputation', 'coalitions-sharing', 'auctions', 'mechanism-design'].every((s) => body[l].includes(`(/game-theory-lab/${s})`))))
  check('eight sections, in the prompt\'s order', ['en', 'it'].every((l) => (body[l].match(/^## /gm) || []).length === 8))
  const allText = (l) => lecture[l] + Object.values(observe).map((o) => o[l]).join('') + exercises.map((x) => x.statement[l] + x.solution[l]).join('')
  check('the texts never call the course free, and never say peer-reviewed', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l)) && !/peer.reviewed/i.test(allText(l))))
  check('the Italian lecture uses the chosen terms (selfish mining kept, blocco orfano, soglia di redditività, aggiustamento della difficoltà, the four actions in English)', ['*selfish mining*', '**implementazione di riferimento**', '**catena più lunga**', '**orfani**', '**catena privata**', '**vantaggio**', '**gara**', '**catena di Markov**', '**distribuzione stazionaria**', '**quota dei blocchi**', '**soglia di redditività**', '**aggiustamento della difficoltà**', '**processo decisionale di Markov**', '**politica ottima**', '**troncamento**', '*adopt*', '*override*', '*match*', '*wait*', '*miner*', '*mining*', '*hash rate*', '*pool*', '*block withholding*', '*punitive forking*', '*feather fork*'].every((t) => lecture.it.includes(t)) && !/egoistic|profittabilit|regolazione della difficolt/i.test(allText('it')))
  check('the Italian texts make the miner masculine (no "lei", no "una miner")', !/\blei\b|una miner/i.test(allText('it')))
  check('the reading list has the chapters (Narayanan ch. 5, 5.5; Nakamoto sections 4, 6, 11) and every source cited', ['Ch. 5 (', '5.5', 'Sections 4 (', '6 (', '11 ('].every((t) => reading.en.includes(t)) && ['Narayanan', 'Nakamoto', 'Kroll', 'Eyal', 'Felten, E. W. (2013). Bitcoin isn\'t so broken after all', 'Sapirshtein', 'Grunspan', 'Nayak', 'Gervais'].every((t) => reading.en.includes(t) && reading.it.includes(t)))
  check('the lecture presents the reasons it has not been seen as hypotheses, and Felten\'s argument as his (coalition, fair-weather mining)', body.en.includes('fair-weather mining') && body.it.includes('*fair-weather mining*') && body.en.includes('a coalition of miners') && body.it.includes('una coalizione di miner'))
} else {
  info('texts.js or the lectures are not there yet: the "quoted on the page" checks are skipped')
}

info(`total time ${((performance.now() - T0) / 1000).toFixed(1)} s`)
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
