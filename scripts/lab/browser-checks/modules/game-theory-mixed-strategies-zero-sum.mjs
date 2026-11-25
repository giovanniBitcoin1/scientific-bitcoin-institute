// Functional checks of Game Theory Lab module 03 "Mixed strategies and
// zero-sum games": the two live figures and the three panels are driven like
// a reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises. It also times the survey,
// fictitious play with 100,000 rounds and the simulated players.
//
//   node modules/game-theory-mixed-strategies-zero-sum.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/mixed-strategies-zero-sum`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const text = async (sel, k = 0) => flat(await p.evaluate((s, i) => document.querySelectorAll(s)[i].innerText, sel, k))
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
const click = (sel, k, label) =>
  p.evaluate(
    (s, i, l) => {
      const b = [...document.querySelectorAll(s)[i].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    sel,
    k,
    label,
  )
// Sets the raw value of the range input with this label (for a log slider, its position 0–1000).
const setSlider = (sel, k, label, value) =>
  p.evaluate(
    (s, i, l, v) => {
      const root = document.querySelectorAll(s)[i]
      const lab = [...root.querySelectorAll('label')].find((x) => x.innerText.trim() === l)
      if (!lab) throw new Error('no slider ' + l)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    sel,
    k,
    label,
    value,
  )
const waitFor = async (fn, ms = 120000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(50)
  }
  return -1
}
const crossings = () => p.$$eval('[data-role="crossing"]', (c) => c.length)
const pick = async (id) => {
  await p.select('[data-role="square-preset"]', id)
  await sleep(150)
}
let t

// ---- Figure F1: two best responses in a square
t = await role('square-list')
ok('F1 opens on the battle of the sexes: 3 equilibria, the mixed one p = 2/3, q = 1/3, payoffs 2/3 and 2/3; 3 crossings drawn', t.includes('3 equilibria') && t.includes('p = 2/3, q = 1/3: payoffs 2/3 and 2/3 (mixed)') && (await crossings()) === 3, t)
await pick('penalty')
t = await role('square-list')
ok('F1 penalty kick: one equilibrium, p = 0.385, q = 0.420, payoffs 79.57 and 20.43', t.includes('One equilibrium') && t.includes('p = 0.385, q = 0.420: payoffs 79.57 and 20.43 (mixed)') && (await crossings()) === 1, t)
await pick('stag')
t = await role('square-list')
ok('F1 stag hunt: (1, 1), (0, 0) and p = q = 2/3 with 8/3 each', t.includes('p = 1, q = 1: payoffs 4 and 4') && t.includes('p = 0, q = 0: payoffs 2 and 2') && t.includes('p = 2/3, q = 2/3: payoffs 8/3 and 8/3 (mixed)'), t)
await pick('pd')
ok("F1 Prisoner's Dilemma: one crossing, at p = 0, q = 0", (await crossings()) === 1 && (await role('square-list')).includes('p = 0, q = 0: payoffs 1 and 1 (pure)'))
await pick('exercise1')
ok('F1 exercise 1: p = 3/4, q = 1/2, payoffs 3/2 and 3/2', (await role('square-list')).includes('p = 3/4, q = 1/2: payoffs 3/2 and 3/2 (mixed)'))
await pick('pennies')
ok('F1 matching pennies: one crossing at the centre', (await crossings()) === 1 && (await role('square-list')).includes('p = 1/2, q = 1/2'))
await pick('coordination')
ok('F1 pure coordination: three crossings', (await crossings()) === 3)
await pick('chicken')
ok('F1 chicken: (1, 0), (0, 1), (1/2, 1/2) with 2 each', (await role('square-list')).includes('p = 1/2, q = 1/2: payoffs 2 and 2 (mixed)') && (await crossings()) === 3)

// ---- Figure F2: the best worst case
t = await role('minimax-readout')
ok('F2 default: kicker L 38.5%, keeper L 42.0%, value 79.57%; always L 58.30%, always R 69.92%', t.includes('The kicker shoots L 38.5% of the time, the keeper goes L 42.0%, and the kick scores 79.57%') && t.includes('Always L guarantees 58.30%, always R 69.92%.'), t)
ok('F2 sliders show the lecture rates with two decimals', (await text('figure', 1)).includes('Kicker L, keeper R 94.97'))
await setSlider('figure', 1, 'Kicker R, keeper R', 80)
await sleep(150)
t = await role('minimax-readout')
ok('F2 R/R at 80: 26.0%, 30.2%, 83.90% (exercise 3)', t.includes('shoots L 26.0%') && t.includes('goes L 30.2%') && t.includes('83.90%') && t.includes('always R 80.00%'), t)
await click('figure', 1, "Keeper's side")
await sleep(150)
ok("F2 keeper's side: the axis and legend change, the readout stays", (await text('figure', 1)).includes('P(keeper goes L)') && (await text('figure', 1)).includes('kicker shoots L') && (await role('minimax-readout')).includes('83.90%'))
for (const [k, v] of [['Kicker L, keeper L', 90], ['Kicker L, keeper R', 95], ['Kicker R, keeper L', 60], ['Kicker R, keeper R', 70]]) await setSlider('figure', 1, k, v)
await sleep(150)
t = await role('minimax-readout')
ok('F2 with 90, 95 / 60, 70: no crossing inside, always L guarantees 90.00%', t.includes('no crossing inside') && t.includes('Always L guarantees the kicker 90.00%'), t)
await click('figure', 1, 'Back to the lecture’s numbers')
await sleep(150)
ok('F2 back to the lecture numbers', (await role('minimax-readout')).includes('79.57%'))

// ---- Panel A: all the equilibria
const A = `${PANEL}:nth-of-type(1)`
t = await role('all-eq')
ok('Panel A opens on random table no. 1 (3 × 3): plays C / plays 1, plays B / plays 3, and the mix 1 with 3/7, 3 with 4/7; B with 1/8, C with 7/8; payoffs 63/8 and 51/7', (await text(PANEL, 0)).includes('RANDOM TABLE NO. 1') && t.includes('3 EQUILIBRIA') && t.includes('row player: 1 with 3/7, 3 with 4/7') && t.includes('column player: B with 1/8, C with 7/8') && t.includes('expected payoffs 63/8 and 51/7') && t.includes('row player: plays 3 column player: plays B'), t)
await click(PANEL, 0, 'Rock beats scissors by 2')
await sleep(150)
t = await role('all-eq')
ok('Panel A rock worth 2: one equilibrium, Rock 1/4, Paper 1/2, Scissors 1/4, payoffs 0 and 0', t.includes('ONE EQUILIBRIUM') && t.includes('Rock with 1/4, Paper with 1/2, Scissors with 1/4') && t.includes('expected payoffs 0 and 0'), t)
await click(PANEL, 0, 'Rock-paper-scissors')
await sleep(150)
ok('Panel A rock-paper-scissors: 1/3 each', (await role('all-eq')).includes('Rock with 1/3, Paper with 1/3, Scissors with 1/3'))
await click(PANEL, 0, 'Penalty kick')
await sleep(150)
t = await role('all-eq')
ok('Panel A penalty kick: L with 0.385 and 0.420, payoffs 79.57 and 20.43', t.includes('L with 0.385, R with 0.615') && t.includes('L with 0.420, R with 0.580') && t.includes('79.57 and 20.43'), t)
await click(PANEL, 0, "Shapley's game")
await sleep(150)
ok("Panel A Shapley's game: one equilibrium, a third each, 1/3 and 1/3", (await role('all-eq')).includes('1 with 1/3, 2 with 1/3, 3 with 1/3') && (await role('all-eq')).includes('expected payoffs 1/3 and 1/3'))
await click(PANEL, 0, 'Exercise 5')
await sleep(150)
ok('Panel A exercise 5: U with 1/2, D with 1/2, value 2', (await role('all-eq')).includes('U with 1/2, D with 1/2') && (await role('all-eq')).includes('expected payoffs 2 and 2'))
await setSlider(PANEL, 0, 'Size m × m', 4)
await sleep(300)
t = await role('all-eq')
const n4 = Number((t.match(/(\d+) EQUILIBRIA|ONE EQUILIBRIUM/) || [])[1] || 1)
ok('Panel A at 4 × 4: a random table with 16 cells and an odd number of equilibria', (await p.$$eval(`${A} [role="cell"]`, (c) => c.length)) === 16 && n4 % 2 === 1, t.slice(0, 120))
let t0 = Date.now()
await click(PANEL, 0, 'New game')
await waitFor(async () => (await text(PANEL, 0)).includes('RANDOM TABLE NO. 2'), 10000)
info(`"New game" at 4 × 4 took ${Date.now() - t0} ms`)
const surveyDone = () => waitFor(async () => (await p.$('[data-role="all-eq-survey"]')) && !(await text(PANEL, 0)).includes('Computing…') && (await p.$$eval('[data-role="all-eq-survey"] tbody tr', (r) => r.length)) === 3)
const surveyTable = async () => flat(await p.$eval('[data-role="all-eq-survey"] table', (e) => e.innerText))
await click(PANEL, 0, 'Survey')
const tSmall = await surveyDone()
t = await surveyTable()
ok('Panel A survey, 2,000 games: m = 2 → 1.230 0.885 0.115; m = 4 → 2.163 0.532 0.376 0.072 0.020; no even count', tSmall >= 0 && t.includes('2 1.230 0.885 0.115 0.000 0.000 0 0.122') && t.includes('4 2.163 0.532 0.376 0.072 0.020 0 0.254'), t)
await setSlider(PANEL, 0, 'Games G per size', 10000)
await sleep(200)
await click(PANEL, 0, 'Survey')
const tMid = await surveyDone()
t = await surveyTable()
ok('Panel A survey, 10,000 games: m = 4 → 2.133 0.538 0.377 0.067 0.018 0 0.252', tMid >= 0 && t.includes('4 2.133 0.538 0.377 0.067 0.018 0 0.252'), t)
await setSlider(PANEL, 0, 'Games G per size', 20000)
await sleep(200)
await click(PANEL, 0, 'Survey')
const tBig = await surveyDone()
t = await surveyTable()
ok('Panel A survey, 20,000 games: m = 2 → 1.251 0.875 0.125; m = 3 → 1.627 0.707 0.276 0.013 0.004; m = 4 → 2.130 0.536 0.380 0.068 0.016; no pure 0.125, 0.212, 0.253', tBig >= 0 && t.includes('2 1.251 0.875 0.125 0.000 0.000 0 0.125') && t.includes('3 1.627 0.707 0.276 0.013 0.004 0 0.212') && t.includes('4 2.130 0.536 0.380 0.068 0.016 0 0.253'), t)
info(`timing: "Survey" (m = 2, 3, 4) with 2,000 games ${(tSmall / 1000).toFixed(1)} s, 10,000 games ${(tMid / 1000).toFixed(1)} s, 20,000 games ${(tBig / 1000).toFixed(1)} s`)

// ---- Panel B: learning to mix
t = await role('fp-readout')
ok('Panel B opens on matching pennies, 10,000 rounds: gap 0.0065; gaps 0.0500, 0.0170; runs 1, 2, 3, 4, 5…, 141 runs; average 0.503 (value 1/2)', t.includes('now 0.0065') && t.includes('100: 0.0500') && t.includes('1,000: 0.0170') && t.includes('1, 2, 3, 4, 5, 6') && t.includes('141 runs in 10,000 rounds') && t.includes('0.503 (value of the game 1/2)'), t)
t0 = Date.now()
await setSlider(PANEL, 1, 'Rounds', 1000)
await waitFor(async () => (await role('fp-readout')).includes('in 100,000 rounds'), 20000)
const tFp = Date.now() - t0
t = await role('fp-readout')
ok('Panel B 100,000 rounds: gap 0.0016', t.includes('now 0.0016') && t.includes('100,000: 0.0016'), t)
info(`timing: fictitious play with 100,000 rounds (matching pennies), slider to readout ${tFp} ms`)
await click(PANEL, 1, "Shapley's game")
await sleep(400)
t = await role('fp-readout')
ok("Panel B Shapley's game, 100,000 rounds: runs 1, 1, 2, 4, 6, 9, 14, 21…, 28 runs; gap 0.2508; smallest from round 100 0.173 (round 78,765)", t.includes('1, 1, 2, 4, 6, 9, 14, 21, 31, 46, 68, 100, 147, 216') && t.includes('28 runs in 100,000 rounds') && t.includes('100,000: 0.2508') && t.includes('smallest gap from round 100 on: 0.173 (round 78,765)'), t)
await setSlider(PANEL, 1, 'Rounds', 667)
await sleep(400)
t = await role('fp-readout')
ok("Panel B Shapley's game back at 10,000 rounds (the slider snaps to it): 22 runs, gap 0.2554, smallest 0.173 (round 7,929)", t.includes('22 runs in 10,000 rounds') && t.includes('now 0.2554') && t.includes('(round 7,929)'), t)
await click(PANEL, 1, 'Penalty kick')
await sleep(300)
ok('Panel B penalty kick, 10,000 rounds: average 79.51 (value 79.57)', (await role('fp-readout')).includes('79.51 (value of the game 79.57)'), await role('fp-readout'))
await click(PANEL, 1, 'Rock worth 2')
await sleep(300)
ok('Panel B rock worth 2: average 0.000 (value 0); runs 1, 4, 3, 5, 12', (await role('fp-readout')).includes('0.000 (value of the game 0)') && (await role('fp-readout')).includes('1, 4, 3, 5, 12'))
await click(PANEL, 1, 'Column player')
await sleep(200)
ok('Panel B column player: the legend still names Rock, Paper, Scissors', (await text(PANEL, 1)).includes('Scissors'))

// ---- Panel C: can you be read?
for (let k = 0; k < 20; k++) await click(PANEL, 2, 'Heads')
await sleep(150)
t = await role('reader-score')
ok('Panel C, always heads for 20 rounds: the machine wins all 20, rate 1.000', t.includes('You 0') && t.includes('Machine 20') && t.includes('1.000'), t)
await click(PANEL, 2, 'Start again')
for (let k = 0; k < 20; k++) await click(PANEL, 2, k % 2 ? 'Tails' : 'Heads')
await sleep(150)
t = await role('reader-score')
ok('Panel C, strict alternation for 20 rounds: the machine loses rounds 2 and 4 only (18 of 20, 0.900)', t.includes('You 2') && t.includes('Machine 18') && t.includes('0.900'), t)
await click(PANEL, 2, 'Start again')
await click(PANEL, 2, 'Let a coin play 100 rounds for me')
await sleep(150)
t = await role('reader-score')
ok('Panel C, the first coin: the machine wins 55 of 100 (0.550)', t.includes('Machine 55') && t.includes('0.550'), t)
const simDone = () => waitFor(async () => (await p.$('[data-role="reader-sim"]')) && !(await text(PANEL, 2)).includes('Computing…') && (await role('reader-sim')).includes('400 players'))
await click(PANEL, 2, 'Play')
const tSim = await simDone()
t = await role('reader-sim')
ok('Panel C, switches too often, s = 0.6: mean 0.595, spread 0.012', tSim >= 0 && t.includes('mean win rate 0.595') && t.includes('deviation) 0.012'), t)
info(`timing: 400 simulated players, 2,000 rounds each: ${(tSim / 1000).toFixed(1)} s`)
await setSlider(PANEL, 2, 'Chance s of changing side', 0.7)
await sleep(150)
await click(PANEL, 2, 'Play')
await simDone()
ok('Panel C, s = 0.7: mean 0.698', (await role('reader-sim')).includes('0.698'), await role('reader-sim'))
await click(PANEL, 2, 'Favours heads')
await sleep(150)
await click(PANEL, 2, 'Play')
await simDone()
ok('Panel C, favours heads, h = 0.6: mean 0.597', (await role('reader-sim')).includes('0.597'), await role('reader-sim'))
await click(PANEL, 2, 'A fair coin')
await sleep(150)
await click(PANEL, 2, 'Play')
await simDone()
ok('Panel C, a fair coin: mean 0.500', (await role('reader-sim')).includes('mean win rate 0.500'), await role('reader-sim'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
