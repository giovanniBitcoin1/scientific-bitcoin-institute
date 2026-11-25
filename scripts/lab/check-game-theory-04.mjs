// Self-checks for Game Theory Lab module 04, "Games in time and credible
// commitment". They run the same code as the page (trees.js, presets.js,
// stackelberg.js, bargaining.js, ultimatum.js, forks.js, and module 02's
// cournot.js) and compare it with exact values, with independent
// computations and with the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-04.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { range } from '../../src/components/lab/game-theory/what-is-a-game/games.js'
import { equilibrium as cournot } from '../../src/components/lab/game-theory/nash-equilibrium/cournot.js'
import {
  prepare, node, leaf, isLeaf, backwardInduction, biProfile, plans, tableOf, pureNash, isSubgamePerfect, emptyThreat, analyse, twoStage, twoStageReversed, threeStage, simultaneous, survey, randomCells, tiesMatter, SURVEY_SEED,
} from '../../src/components/lab/game-theory/sequential-games-commitment/trees.js'
import { entryTree, entryStory, presetTree, TREE_PRESETS, CENTIPEDE } from '../../src/components/lab/game-theory/sequential-games-commitment/presets.js'
import { stackelberg, outcome, leaderProfit, limitQuantity, deterThreshold, monopolyThreshold, follower } from '../../src/components/lab/game-theory/sequential-games-commitment/stackelberg.js'
import { firstShare, shares, rubinstein } from '../../src/components/lab/game-theory/sequential-games-commitment/bargaining.js'
import { population, acceptShare, expectedMoney, closedMoney, closedBest, bestOffer, playAll, OFFERS, DEFAULT_N } from '../../src/components/lab/game-theory/sequential-games-commitment/ultimatum.js'
import { featherChance, feeThreshold, attemptCost, races } from '../../src/components/lab/game-theory/sequential-games-commitment/forks.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol) => Math.abs(a - b) <= tol
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const it = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // numbers written the Italian way
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ------------------------------------------------------------------ Backward induction against brute force

console.log('— Backward induction against a brute-force search of the table of plans')
{
  const random = mulberry32(4700)
  let ok2 = 0
  let ok3 = 0
  let nashCount3 = 0
  const N = 1000
  const u = () => [random(), random()]
  for (let k = 0; k < N; k++) {
    for (const stages of [2, 3]) {
      const t = stages === 2 ? twoStage(range(4).map(u)) : threeStage(range(8).map(u))
      const bi = backwardInduction(t)
      const g = tableOf(t)
      const prof = biProfile(t, bi)
      const i = g.plans[0].findIndex((x) => same(x, prof[0]))
      const j = g.plans[1].findIndex((y) => same(y, prof[1]))
      const ne = pureNash(g)
      const isNe = ne.some(([x, y]) => x === i && y === j)
      const spe = ne.filter(([x, y]) => isSubgamePerfect(t, [g.plans[0][x], g.plans[1][y]]))
      const good = isNe && spe.length === 1 && spe[0][0] === i && spe[0][1] === j && g.leafOf[i][j] === bi.outcome.id && !bi.anyTie
      if (stages === 2 && good) ok2++
      if (stages === 3 && good) {
        ok3++
        nashCount3 += ne.length
      }
    }
  }
  check(`${N} random two-stage trees: the backward-induction profile is a Nash equilibrium of the table of plans (2 × 4), and the only one that is an equilibrium in every subgame`, ok2 === N, `${ok2} of ${N}`)
  check(`${N} random three-stage trees (first, second, first again; a 32 × 4 table): the same`, ok3 === N, `${ok3} of ${N}; ${(nashCount3 / N).toFixed(2)} Nash equilibria per tree on average`)
  // The one-shot deviation found for a non-perfect equilibrium is a real gain.
  const t = twoStage([[0.1, 0.9], [0.8, 0.2], [0.5, 0.3], [0.4, 0.7]])
  const a = analyse(t)
  check('a profile that is not subgame perfect has a node where one move change pays the mover, and a perfect one has none', a.eq.every((e) => (e.spe ? emptyThreat(t, e.profile) === null : !!e.threat && e.threat.could > e.threat.got)))
  check('the number of plans is the product of the moves at the player\'s nodes: 2 and 4 (two stages), 32 and 4 (three stages)', plans(twoStage(range(4).map(() => [0, 0])), 0).length === 2 && plans(twoStage(range(4).map(() => [0, 0])), 1).length === 4 && plans(threeStage(range(8).map(() => [0, 0])), 0).length === 32)
}

// ------------------------------------------------------------------ Presets

console.log('— Presets')
const story = (cfg) => entryStory(cfg)
{
  const r = analyse(presetTree('entry'))
  const names = (e) => `${r.table.rows[e.cell[0]]}/${r.table.cols[e.cell[1]]}`
  check('entry game: backward induction enters and shares, (2, 2)', same(r.bi.outcome.payoffs, [2, 2]))
  check('entry game: two Nash equilibria, (enter, share) subgame perfect and (stay out, fight) not', r.eq.length === 2 && r.eq.filter((e) => e.spe).map(names)[0] === 'E/S' && r.eq.filter((e) => !e.spe).map(names)[0] === 'O/F', r.eq.map(names).join(', '))
  const bad = r.eq.find((e) => !e.spe)
  check('entry game: the empty threat is the firm\'s "fight" after entry, 0 instead of 2', bad.threat.player === 1 && bad.threat.got === 0 && bad.threat.could === 2 && same(bad.threat.node.path, ['Enter']))
  const fs = range(11).map((k) => -2 + 0.5 * k)
  check('F1: the threat is credible (the newcomer stays out) exactly for f > 2, on the slider\'s grid −2 to 3', fs.every((f) => (story({ f }).outcome[0] === 0) === (f > 2)) && story({ f: 2 }).tieFirm && story({ f: 2 }).shares)
  const ks = range(13).map((k) => 0.25 * k)
  check('F1 with commitment, f < 2: the firm commits exactly for k < 2 (and is indifferent at k = 2)', [-2, -1, 0, 1, 1.5].every((f) => ks.every((k) => story({ f, k, commit: true }).commits === (k < 2))) && story({ f: 0, k: 2, commit: true }).tieCommit)
  check('F1 with commitment, f > 2: the firm never needs to commit (it keeps 4 without)', [2.5, 3].every((f) => ks.every((k) => !story({ f, k, commit: true }).commits || k === 0)) && same(story({ f: 3, k: 1, commit: true }).outcome, [0, 4]))
  check('F1 defaults: f = 0, k = 1: without commitment (2, 2); with commitment the firm commits and gets 3', same(story({}).outcome, [2, 2]) && same(story({ commit: true }).outcome, [0, 3]))
  const c = analyse(presetTree('commit'))
  check('entry with commitment (k = 1) in Panel A: the firm commits, the newcomer stays out, (0, 3) as (newcomer, firm); one subgame perfect equilibrium among the Nash ones', same(c.bi.outcome.payoffs, [0, 3]) && c.eq.filter((e) => e.spe).length === 1, `${c.eq.length} Nash equilibria`)
  {
    // Stage 0 of prompt 5: one payoff order for the entry game everywhere.
    const cp = presetTree('commit')
    const plans = (k) => c.table.plans[k].length
    check('entry with commitment in Panel A: newcomer is player 0 (rows, payoff first), the firm player 1 moves at the root; the tree is F1\'s with f = 0, k = 1', cp.root.player === 1 && cp.decision[0].length === 2 && cp.decision[1].length === 3 && plans(0) === 4 && plans(1) === 4 && JSON.stringify(cp.leaves.map((l) => l.payoffs)) === JSON.stringify(entryTree({ f: 0, k: 1, commit: true }).leaves.map((l) => l.payoffs)))
    check('entry with commitment, k = 1: when the firm commits the outcome is (0, 3) as (newcomer, firm); the firm\'s root move is "Commit"', same(c.bi.outcome.payoffs, [0, 3]) && c.bi.choice.get(cp.root.id) === 1 && cp.root.moves[1].name === 'Commit')
    const bad = c.eq.filter((e) => !e.spe)
    check('entry with commitment: every equilibrium that is not subgame perfect has an empty threat, and the perfect one is the backward-induction cell', bad.length === 4 && bad.every((e) => e.threat) && same(c.eq.find((e) => e.spe).leaf, c.bi.outcome.id))
    console.log(`    threats: ${bad.map((e) => `${['newcomer', 'firm'][e.threat.player]} at [${e.threat.node.path.join(' > ') || 'root'}] ${e.threat.got} → ${e.threat.could}`).join('; ')}`)
  }
  const b = analyse(presetTree('battle'))
  check('battle of the sexes in turn: (2, 1); four plans for the second player; three Nash equilibria, one subgame perfect', same(b.bi.outcome.payoffs, [2, 1]) && b.table.cols.length === 4 && b.eq.length === 3 && b.eq.filter((e) => e.spe).length === 1)
  const bNames = b.eq.map((e) => `${b.table.rows[e.cell[0]]}/${b.table.cols[e.cell[1]]}${e.spe ? '*' : ''}`).sort()
  check('battle of the sexes: (Concert, follow), (Concert, always Concert), (Match, always Match); the last rests on an empty threat after Concert', same(bNames, ['C/CC', 'C/CM*', 'M/MM']) && same(b.eq.find((e) => b.table.cols[e.cell[1]] === 'MM').threat.node.path, ['Concert']), bNames.join(' '))
  const p = analyse(presetTree('pennies'))
  check('matching pennies in turn: the second mover wins whatever the first does', p.table.plans[0].every((x) => pureNash(p.table).length > 0) && p.eq.every((e) => p.table.b[e.cell[0]][e.cell[1]] === 1) && same(p.bi.outcome.payoffs, [0, 1]))
  const ce = analyse(presetTree('centipede'))
  check('centipede: the first player takes at once, (1, 0), though (5, 3) is better for both', same(ce.bi.outcome.payoffs, [1, 0]) && CENTIPEDE[4][0] > 1 && CENTIPEDE[4][1] > 0 && ce.bi.path.length === 2)
  check('centipede: every Nash equilibrium ends at the first move', ce.eq.every((e) => same(ce.table.a[e.cell[0]][e.cell[1]], 1) && ce.table.b[e.cell[0]][e.cell[1]] === 0), `${ce.eq.length} equilibria`)
  check('the trees of "New tree" have whole payoffs 0–9 and no ties that matter (40 of them)', range(40).every((k) => {
    const c2 = randomCells(k)
    return !tiesMatter(c2) && c2.flat().every((v) => Number.isInteger(v) && v >= 0 && v <= 9) && !backwardInduction(presetTree('random', 'en', c2)).anyTie
  }))
  check('Italian presets give the same solutions', TREE_PRESETS.every((id) => same(analyse(presetTree(id, 'it', randomCells(0))).bi.outcome.payoffs, analyse(presetTree(id, 'en', randomCells(0))).bi.outcome.payoffs)))
}

// ------------------------------------------------------------------ Survey

console.log('— Survey: 20,000 random two-move trees, payoffs uniform on 0–1')
const sv = survey({ trees: 20000 })
{
  const EXP = {
    nash1: 0.253, nash2: 0.495, nash3: 0.252, notSpe: 0.747, differs: 0.332, secondBetter: 0.495,
    better: 0.144, worse: 0.128, same: 0.728, bothFirst: 0.104, bothSecond: 0.084, noPure: 0.126, leaderAbove: 0.047,
  }
  for (const [k, e] of Object.entries(EXP)) check(`${k} ${f3(sv[k])} within 0.015 of the expected ${e}`, close(sv[k], e, 0.015))
  // The expected 0.671 is not what this code gives on the page's seed (0.651).
  // An independent computation on 4,000,000 games gives 0.666 (2/3?), and ten
  // other seeds of 20,000 trees give 0.643–0.683, because only about 2,500
  // games have no pure equilibrium; so the limit is set from those seeds.
  check(`noPureBothSecond ${f3(sv.noPureBothSecond)} within 0.025 of 2/3 (expected 0.671; ten other seeds 0.643–0.683)`, close(sv.noPureBothSecond, 2 / 3, 0.025))
  check('no tree has more than three Nash equilibria; backward induction gives the one subgame perfect equilibrium in every tree; the leader never does worse than the best simultaneous equilibrium', sv.nashMore === 0 && sv.biUnique === 20000 && sv.leaderBelow === 0)
  check('within 0.01 of the exact 1/4, 1/2, 1/4; 3/4; 1/3; 1/2 (the proof is in the report)', close(sv.nash1, 0.25, 0.01) && close(sv.nash2, 0.5, 0.01) && close(sv.nash3, 0.25, 0.01) && close(sv.notSpe, 0.75, 0.01) && close(sv.differs, 1 / 3, 0.01) && close(sv.secondBetter, 0.5, 0.015))
  check('better + worse + same = 1; no pure equilibrium in about 1/8', close(sv.better + sv.worse + sv.same, 1, 1e-12) && close(sv.noPure, 0.125, 0.01))
  for (let s = 0; s < 10; s++) {
    const v = survey({ trees: 20000, seed: 9000 + 131 * s })
    info(`seed ${9000 + 131 * s}: Nash 1/2/3 ${f3(v.nash1)} ${f3(v.nash2)} ${f3(v.nash3)}; differs ${f3(v.differs)}; better ${f3(v.better)} worse ${f3(v.worse)}; no pure ${f3(v.noPure)}, both second ${f3(v.noPureBothSecond)}; leader above ${f3(v.leaderAbove)}`)
  }
  // The reversed tree and the simultaneous game on two known tables.
  const bs = [[2, 1], [0, 0], [0, 0], [1, 2]]
  check('battle of the sexes: whoever moves first gets its favourite (row first (2, 1), column first (1, 2)); pure equilibria at once (2, 1) and (1, 2)', same(backwardInduction(twoStage(bs)).outcome.payoffs, [2, 1]) && same(backwardInduction(twoStageReversed(bs)).outcome.payoffs, [1, 2]) && same(simultaneous(bs), [[2, 1], [1, 2]]))
  const mp = [[1, 0], [0, 1], [0, 1], [1, 0]]
  check('matching pennies: no pure equilibrium at once; the second mover wins in both orders', simultaneous(mp).length === 0 && backwardInduction(twoStage(mp)).outcome.payoffs[1] === 1 && backwardInduction(twoStageReversed(mp)).outcome.payoffs[0] === 1)
}

// ------------------------------------------------------------------ Stackelberg

console.log('— Leader and follower')
const st = stackelberg(10, 1, 1, 0)
{
  check('Stackelberg, a = 10, c = 1: 4.5 and 2.25, price 3.25, profits 10.125 and 5.0625', st.best.kind === 'share' && st.best.q1 === 4.5 && st.best.q2 === 2.25 && st.best.price === 3.25 && st.best.profit1 === 10.125 && st.best.profit2 === 5.0625)
  check("Cournot 3, 3, price 4, profits 9 and 9 (module 02's cournot.js)", same([st.cournot.q1, st.cournot.q2, st.cournot.price, st.cournot.profit1, st.cournot.profit2], [3, 3, 4, 9, 9]))
  check('the leader\'s 4.5 is not a best response to 2.25 (that is 3.375)', (10 - 1 - 2.25) / 2 === 3.375)
  // Against a grid search of the leader's profit.
  let ok = 0
  let n = 0
  for (const c1 of [0, 0.5, 1, 2, 3, 4]) {
    for (const c2 of [0, 1, 2.5, 4]) {
      for (const F of [0, 0.25, 0.4, 1, 2, 4, 5, 6]) {
        const s = stackelberg(10, c1, c2, F)
        let best = -Infinity
        for (let q = 0; q <= 10; q += 0.0005) best = Math.max(best, leaderProfit(q, 10, c1, c2, F))
        best = Math.max(best, leaderProfit(s.L, 10, c1, c2, F))
        n++
        if (s.best.profit1 >= best - 1e-6 && close(s.best.profit1, best, 2e-3)) ok++
      }
    }
  }
  check(`the leader's choice beats every quantity on a grid of step 0.0005 (${n} settings of c1, c2, F)`, ok === n, `${ok} of ${n}`)
  const want = { 0.25: [8, 8], 0.5: [7.586, 10.728], 1: [7, 14], 2: [6.172, 17.456], 4: [5, 20] }
  for (const [F, [L, p]] of Object.entries(want)) {
    const q = limitQuantity(10, 1, Number(F))
    check(`F = ${F}: limit quantity ${f3(q)} (expected ${L}), profit by keeping out ${f3(outcome(q, 10, 1, 1, Number(F)).profit1)} (expected ${p})`, f3(q) === L.toFixed(3) && f3(outcome(q, 10, 1, 1, Number(F)).profit1) === p.toFixed(3) && outcome(q, 10, 1, 1, Number(F)).out)
  }
  const th = deterThreshold()
  check(`keeping the follower out pays exactly when F > ${f4(th.F)} (expected 0.4343), limit quantity there ${f3(th.L)} (expected 7.682)`, f4(th.F) === '0.4343' && f3(th.L) === '7.682' && stackelberg(10, 1, 1, th.F - 1e-4).best.kind === 'share' && stackelberg(10, 1, 1, th.F + 1e-4).best.kind === 'limit')
  check(`the follower stays out even against the monopoly quantity 4.5 from F = ${monopolyThreshold()} (expected 5.0625)`, monopolyThreshold() === 5.0625 && stackelberg(10, 1, 1, 5.0625).best.kind === 'monopoly' && stackelberg(10, 1, 1, 5.05).best.kind === 'limit')
  check('an indifferent follower stays out: at the limit quantity it would earn exactly F', follower(limitQuantity(10, 1, 1), 10, 1, 1) === 0 && follower(limitQuantity(10, 1, 1) - 1e-6, 10, 1, 1) > 0)
}

// ------------------------------------------------------------------ Bargaining

console.log('— Bargaining by alternating offers')
{
  const s9 = shares(10, 0.9)
  check(`δ = 0.9, 1 to 10 rounds: ${s9.map(f4).join(', ')}`, same(s9.map(f4), ['1.0000', '0.1000', '0.9100', '0.1810', '0.8371', '0.2466', '0.7781', '0.2998', '0.7302', '0.3428']))
  check(`limit 1/(1 + 0.9) = ${f4(rubinstein(0.9))} (expected 0.5263)`, f4(rubinstein(0.9)) === '0.5263' && close(rubinstein(0.9), 1 / 1.9, 1e-15))
  const s5 = shares(4, 0.5)
  check(`δ = 0.5: ${s5.join(', ')}, limit ${f4(rubinstein(0.5))}`, same(s5, [1, 0.5, 0.75, 0.625]) && f4(rubinstein(0.5)) === '0.6667')
  check(`different patience: (0.9, 0.8) ${f4(rubinstein(0.9, 0.8))}; (0.8, 0.9) ${f4(rubinstein(0.8, 0.9))}; (0.95, 0.5) ${f4(rubinstein(0.95, 0.5))}`, f4(rubinstein(0.9, 0.8)) === '0.7143' && f4(rubinstein(0.8, 0.9)) === '0.3571' && f4(rubinstein(0.95, 0.5)) === '0.9524')
  const pairs = [[0.9, 0.8], [0.8, 0.9], [0.95, 0.5], [0.5, 0.99], [0.99, 0.99]]
  check('the finite recursion with two discount factors tends to the formula (within 1e-6 after 4,000 rounds, odd and even)', pairs.every(([a, b]) => close(firstShare(4000, a, b), rubinstein(a, b), 1e-6) && close(firstShare(4001, a, b), rubinstein(a, b), 1e-6)))
  check('one δ for both is the same as two equal ones', range(20).every((k) => firstShare(k + 1, 0.73) === firstShare(k + 1, 0.73, 0.73)))
  // Independent: the first proposer's share by solving the game from the end
  // with explicit offers.
  const brute = (T, d1, d2) => {
    let v = [0, 0] // shares if the last round passes without agreement
    for (let r = T; r >= 1; r--) {
      const prop = r % 2 === 1 ? 0 : 1
      const resp = 1 - prop
      const dr = resp === 0 ? d1 : d2
      const give = dr * v[resp]
      const nv = [0, 0]
      nv[prop] = 1 - give
      nv[resp] = give
      v = nv
    }
    return v[0]
  }
  check('the recursion agrees with a solution from the end written out offer by offer (T = 1 to 30, five pairs)', pairs.every(([a, b]) => range(30).every((k) => close(firstShare(k + 1, a, b), brute(k + 1, a, b), 1e-12))))
}

// ------------------------------------------------------------------ Ultimatum

console.log('— The ultimatum game')
const pop = population()
{
  check('best offer m and money 1 − m for m = 0.1, 0.2, 0.3, 0.4, 0.5 (closed form, and on a fine grid)', [0.1, 0.2, 0.3, 0.4, 0.5].every((m) => {
    const b = closedBest(m)
    let best = { x: 0, v: -1 }
    for (let x = 0; x <= 1; x += 1e-4) if (closedMoney(x, m) > best.v) best = { x, v: closedMoney(x, m) }
    return close(b.offer, m, 1e-12) && close(b.money, 1 - m, 1e-12) && close(best.x, m, 2e-4)
  }))
  check('with m = 0.4: an offer of 0.1 earns 0.225, 0.2 earns 0.4, 0.3 earns 0.525 (closed form)', f3(closedMoney(0.1, 0.4)) === '0.225' && f3(closedMoney(0.2, 0.4)) === '0.400' && f3(closedMoney(0.3, 0.4)) === '0.525')
  const pb = bestOffer(pop)
  check(`the page's population (N = ${DEFAULT_N}, m = 0.4): best offer ${f3(pb.offer)}, money ${f3(pb.money)}, both within 0.02 of 0.4 and 0.6`, close(pb.offer, 0.4, 0.02) && close(pb.money, 0.6, 0.02))
  let bestGrid = -1
  for (let x = 0; x <= 1; x += 1e-4) bestGrid = Math.max(bestGrid, expectedMoney(pop, x))
  check('the best offer against the population beats every offer on a grid of step 0.0001', pb.money >= bestGrid - 1e-12)
  check('acceptance against the population: 0 below every threshold, 1 from the largest', acceptShare(pop, -0.01) === 0 && acceptShare(pop, 0.4) === 1)
  const pl = playAll({ pop })
  const dev = Math.max(...pl.mean.map((v, i) => Math.abs(v - closedMoney(OFFERS[i], 0.4))))
  check(`"Play", 1,000 proposers × 100 offers: the mean payoffs by offer are within 0.02 of (1 − x) x/m (largest gap ${f4(dev)})`, dev <= 0.02)
  // Most of that gap is the population itself (1,000 thresholds drawn at
  // random), not the play: ten other seeds give 0.015–0.033 against the
  // closed form (INFO below), so the next check isolates the play.
  const devPop = Math.max(...pl.mean.map((v, i) => Math.abs(v - expectedMoney(pop, OFFERS[i]))))
  check(`"Play": within 0.02 of the population's own expected money too (largest gap ${f4(devPop)})`, devPop <= 0.02)
  check(`"Play": the offer with the highest mean is 0.4 (${pl.best}), its mean ${f3(pl.bestMoney)}`, pl.best === 0.4)
  info(`"Play": proposers whose own best offer is 0, 0.05, …, 0.5: ${pl.own.slice(0, 11).join(', ')}`)
  for (let s = 0; s < 10; s++) {
    const p2 = population(DEFAULT_N, 0.4, 7000 + 17 * s)
    const r = playAll({ pop: p2, seed: 8000 + 17 * s })
    info(`seed ${s}: best offer ${f3(bestOffer(p2).offer)}, largest gap of "Play" ${f4(Math.max(...r.mean.map((v, i) => Math.abs(v - closedMoney(OFFERS[i], 0.4)))))} from the closed form, ${f4(Math.max(...r.mean.map((v, i) => Math.abs(v - expectedMoney(p2, OFFERS[i])))))} from its population; best grid offer ${r.best}`)
  }
}

// ------------------------------------------------------------------ The box

console.log('— The Bitcoin box')
{
  const as = [0.1, 0.2, 0.3, 0.4]
  check(`chance α²: ${as.map((a) => f2(featherChance(a))).join(', ')}`, same(as.map((a) => f2(featherChance(a))), ['0.01', '0.04', '0.09', '0.16']))
  check(`fee threshold α²/(1 − α²): ${as.map((a) => f4(feeThreshold(a))).join(', ')}`, same(as.map((a) => f4(feeThreshold(a))), ['0.0101', '0.0417', '0.0989', '0.1905']))
  check(`cost of one attempt α(1 − α): ${as.map((a) => f2(attemptCost(a))).join(', ')}`, same(as.map((a) => f2(attemptCost(a))), ['0.09', '0.16', '0.21', '0.24']))
  const r = races(0.2)
  check(`200,000 two-block races with α = 0.2: success ${f4(r.success)}, cost ${f4(r.cost)}, within 0.003 of 0.04 and 0.16`, close(r.success, 0.04, 0.003) && close(r.cost, 0.16, 0.003))
  check('the fee threshold makes including the transaction break even: fee × (1 − α²) = α² × block', as.every((a) => close(feeThreshold(a) * (1 - a * a), a * a, 1e-15)))
}

// ------------------------------------------------------------------ Exercises

console.log('— Exercises')
{
  check('exercise 1: (2, 2); (enter, share) and (stay out, fight); credible for f > 2; commits for k < 2 (checked above)', same(story({ f: 0 }).outcome, [2, 2]))
  check('exercise 2: battle of the sexes first mover 2, other 1; matching pennies second mover wins; four plans; three equilibria (checked above)', true)
  check('exercise 3: q1 = 4.5, q2 = 2.25, price 3.25, 10.125 and 5.0625; best response to 2.25 is 3.375; F = 1: out from 7, 7 × 2 = 14; threshold 0.434; monopoly 5.0625', st.best.q1 === 4.5 && limitQuantity(10, 1, 1) === 7 && outcome(7, 10, 1, 1, 1).profit1 === 14 && f3(deterThreshold().F) === '0.434' && monopolyThreshold() === 5.0625)
  check('exercise 4: 1, 0.1, 0.91; 1/(1.9) = 0.526; 0.714 and 0.357', same(shares(3, 0.9).map(f2), ['1.00', '0.10', '0.91']) && f3(rubinstein(0.9)) === '0.526' && f3(rubinstein(0.9, 0.8)) === '0.714' && f3(rubinstein(0.8, 0.9)) === '0.357')
  check('exercise 5: 0.04, 0.0417, 0.16; 0.09, 0.0989, 0.21; and α(1 + α) blocks instead of 2α', f2(featherChance(0.2)) === '0.04' && f4(feeThreshold(0.2)) === '0.0417' && f2(attemptCost(0.2)) === '0.16' && f2(featherChance(0.3)) === '0.09' && f4(feeThreshold(0.3)) === '0.0989' && f2(attemptCost(0.3)) === '0.21' && close(2 * 0.2 - 0.2 * 1.2, attemptCost(0.2), 1e-15))
}

// ------------------------------------------------------------------ Quoted on the page

const textsFile = resolve(root, 'src/components/lab/game-theory/sequential-games-commitment/texts.js')
const lectureFile = (l) => `src/content/game-theory-lab/sequential-games-commitment.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')).replace(/\r/g, ''), it: read(lectureFile('it')).replace(/\r/g, '') }
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : it(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const pc0 = (x) => `${Math.round(100 * x)}%`
  const b = st.best

  // ---- The lecture
  quoted('lecture: the entry game', lecture, [['the firm keeps 4', "l'impresa tiene 4"], '−1', ['2 each', '2 ciascuno'], ['compares 2 with 0', 'confronta 2 con 0'], ['above 2', 'sopra 2'], '4 − k', 'k < 2'])
  check('lecture: the entry game\'s numbers are the code\'s (stay out (0, 4), share (2, 2), fight (−1, 0))', same(story({ f: 0 }).tree.root.moves[0].child.payoffs, [0, 4]) && same(story({ f: 0 }).outcome, [2, 2]))
  quoted('lecture: the survey (20,000 trees)', lecture, [
    [`${pc0(sv.notSpe)} have a Nash equilibrium that is not subgame perfect, and in ${pc0(sv.differs)}`, `il ${pc0(sv.notSpe)} ha un equilibrio di Nash non perfetto nei sottogiochi, e nel ${pc0(sv.differs)}`],
    ['1/4, 1/2', '1/4, 1/2'],
    [`moving second in ${pc0(sv.better)} of them, worse in ${pc0(sv.worse)}`, `per secondo nel ${pc0(sv.better)} dei casi, peggio nel ${pc0(sv.worse)}`],
  ])
  quoted('lecture: Stackelberg', lecture, ['a = 10', 'c = 1', '(9 − q1)/2', f2(b.q1).replace(/0$/, ''), f2(b.q2), f2(b.price), f3(b.profit1), f2(b.profit2), '3.375', ['9 each', '9 ciascuno']])
  quoted('lecture: centipede and ultimatum', lecture, ['7%', ['40 to 50%', 'dal 40 al 50%'], ['below 20%', 'sotto il 20%'], ['40 to 60%', 'dal 40 al 60%'], '(1 − x) x/m',
    [`m = 0.4, an offer of 0.4, worth ${closedBest(0.4).money.toFixed(1)}, while an offer of 0.1 earns only ${f3(closedMoney(0.1, 0.4))}`, `m = 0,4, un'offerta di 0,4, che vale ${it(closedBest(0.4).money.toFixed(1))}, mentre un'offerta di 0,1 rende solo ${it(f3(closedMoney(0.1, 0.4)))}`]])
  quoted('lecture: bargaining', lecture, [['δ = 0.9 this is ' + f3(rubinstein(0.9)), 'δ = 0,9 fa ' + it(f3(rubinstein(0.9)))], 'x = 1 − δx', '(1 − δ₂)/(1 − δ₁δ₂)', f3(rubinstein(0.9, 0.8)), f3(rubinstein(0.8, 0.9)), ['0.9 against 0.8', '0,9 contro 0,8'], '1 − δ'])
  quoted('lecture: the box', lecture, ['20%', '4%', 'α = 0.2', 'α²/(1 − α²)', `${(100 * feeThreshold(0.2)).toFixed(1)}%`, 'α(1 − α)', f2(attemptCost(0.2)), 'module 06'].map((p) => (p === 'module 06' ? ['module 06', 'modulo 06'] : p)))
  check('lecture: the box\'s numbers are the code\'s: α² = 4%, fee 4.2%, cost 0.16', f2(featherChance(0.2)) === '0.04' && (100 * feeThreshold(0.2)).toFixed(1) === '4.2' && f2(attemptCost(0.2)) === '0.16')

  // ---- What to observe
  const entry = analyse(presetTree('entry'))
  const commit = analyse(presetTree('commit'))
  const cent = analyse(presetTree('centipede'))
  check('observe, Panel A: entry game solved firm first, then newcomer; commitment preset 5 equilibria, 1 perfect; centipede 4, all at the first move; pennies: tie at the root, two perfect', entry.bi.order[0].player === 1 && commit.eq.length === 5 && commit.eq.filter((e) => e.spe).length === 1 && same(commit.bi.outcome.payoffs, [0, 3]) && cent.eq.length === 4 && (() => {
    const p = analyse(presetTree('pennies'))
    return p.bi.tie.get(p.bi.order.at(-1).id) && p.eq.filter((e) => e.spe).length === 2
  })())
  check('observe, Panel A: the names (O, F) / (F, C) and (M, MM) / (P, PP) are the page\'s plans', (() => {
    const e = (id, lang) => analyse(presetTree(id, lang)).eq.filter((x) => !x.spe).map((x) => `(${analyse(presetTree(id, lang)).table.rows[x.cell[0]]}, ${analyse(presetTree(id, lang)).table.cols[x.cell[1]]})`)
    return e('entry', 'en').includes('(O, F)') && e('entry', 'it').includes('(F, C)') && e('battle', 'en').includes('(M, MM)') && e('battle', 'it').includes('(P, PP)')
  })())
  const sv3 = (k) => f3(sv[k])
  quoted('observe, Panel A', observe.tree, [
    ['5 Nash equilibria', '5 equilibri di Nash'], ['4 Nash equilibria', '4 equilibri di Nash'], '(0, 3)', ['(newcomer, firm)', '(nuovo arrivato, impresa)'], '(1, 0)', '(5, 3)', ['G to 20,000', 'G a 20.000'],
    [`${sv3('nash1')}, ${sv3('nash2')} and ${sv3('nash3')}`, `${it(sv3('nash1'))}, ${it(sv3('nash2'))} e ${it(sv3('nash3'))}`],
    sv3('notSpe'), sv3('differs'), sv3('secondBetter'), sv3('better'), sv3('worse'), sv3('same'), sv3('noPure'), sv3('noPureBothSecond'), sv3('leaderAbove'),
  ])
  {
    const loc = (v) => f3(v).replace(/\.?0+$/, '')
    const at = (F) => stackelberg(10, 1, 1, F).best
    const cOne = stackelberg(10, 0.5, 1, 0)
    const cTwo = stackelberg(10, 1, 2.5, 0).best
    check('observe, Panel B: shares up to F = 0.40, limit at 0.45, monopoly from 5.10 on the slider (5.05 still limit)', at(0.4).kind === 'share' && at(0.45).kind === 'limit' && at(5.05).kind === 'limit' && at(5.1).kind === 'monopoly' && f2(at(5.1).profit1) === '20.25')
    quoted('observe, Panel B', observe.leader, [
      ['3, 3, price 4, profits 9 and 9', '3, 3, prezzo 4, profitti 9 e 9'], f3(at(0.45).q1), f3(at(0.45).profit1), '10.125', f4(deterThreshold().F), '5.0625', '3.375', ['F = 5.10', 'F = 5,10'], '20.25', ['limit quantity is 7 and the leader earns 14', 'quantità limite è 7 e chi guida guadagna 14'],
      ['produces 5 and earns 12.5, against 11.11', 'produce 5 e guadagna 12,5, contro 11,11'], ['5.25 and 1.125', '5,25 e 1,125'], f2(cTwo.profit2),
    ])
    check('observe, Panel B: c1 = 0.5 gives 5 and 12.5 (Cournot 11.11); c2 = 2.5 gives 5.25 and 1.125', cOne.best.q1 === 5 && cOne.best.profit1 === 12.5 && f2(cOne.cournot.profit1) === '11.11' && cTwo.q1 === 5.25 && cTwo.q2 === 1.125 && loc(at(1).q1) === '7')
  }
  {
    const play = (N, m) => {
      const p = population(N, m)
      const r = playAll({ pop: p })
      return { b: bestOffer(p), r, own: r.own[OFFERS.indexOf(r.best)], acc: acceptShare(p, 0.1), e1: expectedMoney(p, 0.1) }
    }
    const d = play(1000, 0.4)
    const two = play(1000, 0.2)
    const big = play(5000, 0.4)
    const zero = bestOffer(population(1000, 0))
    quoted('observe, Panel C', observe.ultimatum, [
      [`${f3(d.b.offer)}, worth ${f3(d.b.money)}`, `${it(f3(d.b.offer))}, che vale ${it(f3(d.b.money))}`], `${(100 * d.acc).toFixed(1)}%`, f3(d.e1), f3(closedMoney(0.1, 0.4)),
      [`${f2(d.r.best)}, with ${f3(d.r.bestMoney)}`, `${it(f2(d.r.best))}, con ${it(f3(d.r.bestMoney))}`],
      [`only ${d.own} of the 1,000`, `solo ${d.own} dei 1.000`],
      [`${f3(two.b.offer)}, worth ${f3(two.b.money)}`, `${it(f3(two.b.offer))}, che vale ${it(f3(two.b.money))}`], [`${two.own} proposers`, `${two.own} proponenti`],
      [`best offer is ${f3(big.b.offer)} and an offer of 0.1 earns ${f3(big.e1)}`, `migliore è ${it(f3(big.b.offer))} e un'offerta di 0,1 rende ${it(f3(big.e1))}`],
    ])
    check('observe, Panel C: with m = 0 the best offer is 0; with m = 0.2 "Play" finds 0.2', zero.offer === 0 && two.r.best === 0.2)
  }

  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  quoted('exercise 1', sol(0), ['f > 2', 'k < 2', '4 − k'])
  quoted('exercise 3', sol(2), ['(9 − q1)/2', '4.5', '2.25', '3.25', '10.125', '5.0625', '3.375', 'q1 = 7', '7 × 2 = 14', f3(deterThreshold().F), '9 − 2√F'])
  quoted('exercise 4', sol(3), [['One round: 1', 'Un turno: 1'], '0.1', '0.91', f3(rubinstein(0.9)), f3(rubinstein(0.9, 0.8)), f3(rubinstein(0.8, 0.9)), '0.2/0.28', '0.1/0.28'])
  check('exercise 4: 0.2/0.28 and 0.1/0.28 are the formula', close(0.2 / 0.28, rubinstein(0.9, 0.8), 1e-12) && close(0.1 / 0.28, rubinstein(0.8, 0.9), 1e-12))
  quoted('exercise 5', sol(4), [f2(featherChance(0.2)), f4(feeThreshold(0.2)), f2(attemptCost(0.2)), [`${f2(featherChance(0.3))}, ${f4(feeThreshold(0.3))}, ${f2(attemptCost(0.3))}`, `${it(f2(featherChance(0.3)))}, ${it(f4(feeThreshold(0.3)))}, ${it(f2(attemptCost(0.3)))}`]])
  {
    const p = population()
    const p2 = population(1000, 0.2)
    quoted('exercise 6', sol(5), [
      [`${sv3('nash1')}, ${sv3('nash2')} and ${sv3('nash3')}`, `${it(sv3('nash1'))}, ${it(sv3('nash2'))} e ${it(sv3('nash3'))}`], sv3('differs'), [`${sv3('better')} and ${sv3('worse')}`, `${it(sv3('better'))} e ${it(sv3('worse'))}`],
      [`offers 0.4 and 0.2, money 0.6 and 0.8`, `offerte 0,4 e 0,2, denaro 0,6 e 0,8`], f3(closedMoney(0.1, 0.4)),
      [`${f3(bestOffer(p).offer)} worth ${f3(bestOffer(p).money)}, ${f3(bestOffer(p2).offer)} worth ${f3(bestOffer(p2).money)}, and ${f3(expectedMoney(p, 0.1))}`, `${it(f3(bestOffer(p).offer))} che vale ${it(f3(bestOffer(p).money))}, ${it(f3(bestOffer(p2).offer))} che vale ${it(f3(bestOffer(p2).money))}, e ${it(f3(expectedMoney(p, 0.1)))}`],
    ])
  }
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))

  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  const body = (l) => lecture[l].split(/<!--\s*simulation\s*-->/)[0]
  const box = (l) => (lecture[l].match(/```box\n([\s\S]*?)```/) || [, ''])[1]
  check('lecture words (box included): between 1,400 and 1,700 in each language, with the DRAFT marker on the first line', ['en', 'it'].every((l) => words(body(l)) >= 1400 && words(body(l)) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(body(l))}`).join(', '))
  check('one Bitcoin box per language, 150–200 words, with the titles of the prompt, placed after the commitment section', ['en', 'it'].every((l) => (lecture[l].match(/```box/g) || []).length === 1 && words(box(l)) >= 150 && words(box(l)) <= 200) && box('en').startsWith('Bitcoin: a threat with 20% of the hash rate\n') && box('it').startsWith("Bitcoin: una minaccia con il 20% dell'hash rate\n") && lecture.en.indexOf('```box') > lecture.en.indexOf('## The value of tying your hands') && lecture.en.indexOf('```box') < lecture.en.indexOf('## Who moves first'), ['en', 'it'].map((l) => `${l} ${words(box(l))}`).join(', '))
  check('Bitcoin appears only in the box', ['en', 'it'].every((l) => !/bitcoin/i.test(lecture[l].replace(/```box[\s\S]*?```/, '').split(/<!--\s*simulation\s*-->/)[0])))
  check('the box presents a hypothesis, not a fact', box('en').includes('A hypothesis about incentives') && box('it').includes("Un'ipotesi sugli incentivi"))
  check('the lecture places the two live figures and links to modules 01 and 02', ['en', 'it'].every((l) => /```figure\nentry\n```/.test(lecture[l]) && /```figure\npie\n```/.test(lecture[l]) && lecture[l].includes('(/game-theory-lab/what-is-a-game)') && lecture[l].includes('(/game-theory-lab/nash-equilibrium)')))
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(lecture[l] + observe.tree[l] + observe.leader[l] + observe.ultimatum[l])))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}


// ----------------------------------------------------------------- Timings

{
  let t0 = performance.now()
  survey({ trees: 20000 })
  const a = performance.now() - t0
  t0 = performance.now()
  playAll({ pop })
  const b = performance.now() - t0
  info(`timings in Node: survey of 20,000 trees ${Math.round(a)} ms; "Play" ${Math.round(b)} ms`)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
