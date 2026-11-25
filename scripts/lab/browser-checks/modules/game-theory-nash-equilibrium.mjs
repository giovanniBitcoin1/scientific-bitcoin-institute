// Functional checks of Game Theory Lab module 02 "Nash equilibrium": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones in the lecture, the observe
// lists and the exercises. It also times the two experiments.
//
//   node modules/game-theory-nash-equilibrium.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/nash-equilibrium`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const text = async (sel, k = 0) => flat(await p.evaluate((s, i) => document.querySelectorAll(s)[i].innerText, sel, k))
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
// Clicks the button with this label inside the k-th element matching `sel`.
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
const disabled = (sel, k, label) =>
  p.evaluate((s, i, l) => [...document.querySelectorAll(s)[i].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase()).disabled, sel, k, label)
// Moves the slider with this label inside the k-th element matching `sel`.
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
const waitFor = async (fn, ms = 90000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(50)
  }
  return -1
}
let t

// ---- Figure F1: how sure must you be?
t = await role('stag-readout')
ok('F1 default (a = 4, c = 3, d = 2): q* = 0.667, payoff dominant stag, risk dominant hare', t.includes('q* = 0.667') && t.includes('Payoff dominant: both hunt the stag (4 each against 2)') && t.includes('Risk dominant: both hunt hare, because q* is above 1/2.'), t)
await setSlider('figure', 0, 'Both hunt the stag: a', 6)
await sleep(150)
t = await role('stag-readout')
ok('F1 a = 6: q* = 0.400, the stag is risk dominant too', t.includes('q* = 0.400') && t.includes('Risk dominant: both hunt the stag too, because q* is below 1/2.'), t)
await setSlider('figure', 0, 'Both hunt the stag: a', 5)
await sleep(150)
t = await role('stag-readout')
ok('F1 a = 5: q* = 0.500, neither is risk dominant', t.includes('q* = 0.500') && t.includes('Risk dominant: neither'), t)
await setSlider('figure', 0, 'Both hunt the stag: a', 8)
await sleep(150)
ok('F1 a = 8: q* = 0.286', (await role('stag-readout')).includes('q* = 0.286'))
// The order a > c ≥ d is kept: c cannot pass a, d cannot pass c.
await setSlider('figure', 0, 'Both hunt the stag: a', 4)
await setSlider('figure', 0, 'Hare, the other hunts the stag: c', 7)
await sleep(150)
await setSlider('figure', 0, 'Both hunt hare: d', 7)
await sleep(150)
t = await text('figure', 0)
ok('F1: c stops at 3.5 below a = 4, and d at c', t.includes('Hare, the other hunts the stag: c 3.5') && t.includes('Both hunt hare: d 3.5') && (await role('stag-readout')).includes('q* = 0.875'), t.slice(0, 300))

// ---- Figure F2: where the best responses cross
t = await role('cournot-readout')
ok('F2 default: starts at 1.00 and 8.00 (price 1.00); equilibrium 3.00 and 3.00, price 4.00, profits 9.00 and 9.00; the cartel point is drawn', t.includes('Starting point: quantities 1.00 and 8.00, price 1.00, profits 0.00 and 0.00') && t.includes('Equilibrium: quantities 3.00 and 3.00, price 4.00, profits 9.00 and 9.00') && !!(await p.$('[data-role="cartel-point"]')), t)
// A click on the plane at (q1, q2): the plot area is 26…292 by 8…238 in a 300 × 262 viewBox.
const clickPlane = async (q1, q2) => {
  const svg = await p.$('figure svg[viewBox="0 0 300 262"]')
  await svg.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await sleep(250)
  const box = await svg.boundingBox()
  await p.mouse.click(box.x + ((26 + (q1 / 10) * 266) / 300) * box.width, box.y + ((238 - (q2 / 10) * 230) / 262) * box.height)
  await sleep(200)
}
await clickPlane(0, 0)
t = await role('cournot-readout')
ok('F2: a click at the origin starts the firms from 0.00 and 0.00', t.includes('Starting point: quantities 0.00 and 0.00, price 10.00'), t)
await click('figure', 1, 'Adjust')
await sleep(520)
t = await role('cournot-readout')
ok('F2 Adjust: the first move takes firm 1 to 4.50', /After [12] moves?: quantities 4\.50 and (0\.00|2\.25)/.test(t), t)
// The button is disabled while the path is drawn and stays so at its end: wait for the last move (14).
const tAdjust = await waitFor(async () => /After 14 moves/.test(await role('cournot-readout')) && (await disabled('figure', 1, 'Adjust')), 20000)
t = await role('cournot-readout')
ok('F2 Adjust: the firms end at 3.00 and 3.00, price 4.00, and the button is disabled', tAdjust >= 0 && /After 14 moves: quantities 3\.00 and 3\.00, price 4\.00, profits 9\.0\d and 9\.0\d/.test(t), t)
await setSlider('figure', 1, 'Cost of firm 2: c₂', 2.5)
await sleep(200)
t = await role('cournot-readout')
ok('F2 costs 1 and 2.5: equilibrium 3.50 and 2.00, price 4.50, profits 12.25 and 4.00; no cartel point', t.includes('Equilibrium: quantities 3.50 and 2.00, price 4.50, profits 12.25 and 4.00') && !(await p.$('[data-role="cartel-point"]')) && t.includes('Starting point'), t)

// ---- Panel A: find the equilibria
const A = `${PANEL}:nth-child(1)`
const cellClick = (k) => p.evaluate((s, i) => document.querySelectorAll(`${s} [role="cell"]`)[i].click(), A, k)
const walkDone = () => waitFor(async () => !(await role('walk-line')).includes('walking…') && !(await role('walk-line')).startsWith('Choose'), 15000)
t = await role('eq-readout')
ok('Panel A opens on a 3 × 3 table with no equilibrium; elimination leaves all 9 cells; Walk is disabled', t.includes('Equilibria none') && t.includes('all 9 cells') && t.includes('No cell chosen yet.') && (await disabled(PANEL, 0, 'Walk')) && (await p.$$eval(`${A} [role="cell"]`, (c) => c.length)) === 9, t)
await cellClick(0)
await sleep(150)
t = await role('eq-readout')
ok('Panel A, cell (1, A): the row player would move to 3 (4 → 8), the column player to C (2 → 6)', t.includes('At (1, A): the row player would move to 3 (4 → 8); the column player would move to C (2 → 6).'), t)
await click(PANEL, 0, 'Walk')
await walkDone()
t = await role('walk-line')
ok('Panel A, Walk from (1, A): six moves, the last four a cycle', t.includes('(1, A) → (3, A) → (3, B) → (2, B) → (2, C) → (3, C) → (3, B). After 6 moves the walk is in a cycle of 4 cells and never stops.'), t)
await click(PANEL, 0, 'New game')
await sleep(200)
t = await role('eq-readout')
ok('Panel A, table no. 2: one equilibrium (1, A), solved by elimination; one cell is ringed', t.includes('Equilibria (1, A)') && t.includes('(1, A): solved') && (await p.$$eval(`${A} [data-stable]`, (c) => c.length)) === 1, t)
await cellClick(4)
await click(PANEL, 0, 'Walk')
await walkDone()
t = await role('walk-line')
ok('Panel A, table no. 2, Walk from (2, B): stops at (1, A) after 3 moves', t.includes('(2, B) → (3, B) → (3, A) → (1, A). Stops at the equilibrium (1, A) after 3 moves.'), t)
await cellClick(0)
await click(PANEL, 0, 'Walk')
await walkDone()
ok('Panel A, Walk from the equilibrium itself: nobody moves', (await role('walk-line')).includes('Nobody moves: (1, A) is an equilibrium.') && (await role('eq-readout')).includes('Nobody gains by moving alone'))
await click(PANEL, 0, 'Stag hunt')
await sleep(200)
t = await role('eq-readout')
ok('Panel A stag hunt: equilibria (Stag, Stag) and (Hare, Hare), elimination leaves all 4 cells', t.includes('Equilibria (Stag, Stag) (Hare, Hare)') && t.includes('all 4 cells'), t)
await cellClick(2)
await click(PANEL, 0, 'Walk')
await walkDone()
t = await role('walk-line')
ok('Panel A stag hunt: from (Hare, Stag), in the first column, the walk stops at (Stag, Stag)', t.includes('(Hare, Stag) → (Stag, Stag). Stops at the equilibrium (Stag, Stag) after 1 move.'), t)
await cellClick(1)
await click(PANEL, 0, 'Walk')
await walkDone()
ok('Panel A stag hunt: from (Stag, Hare), in the second column, it stops at (Hare, Hare)', (await role('walk-line')).includes('Stops at the equilibrium (Hare, Hare) after 1 move.'))
await click(PANEL, 0, 'Matching pennies')
await sleep(200)
await cellClick(0)
await click(PANEL, 0, 'Walk')
await walkDone()
t = await role('walk-line')
ok('Panel A matching pennies: no equilibrium, a cycle of 4 cells', (await role('eq-readout')).includes('Equilibria none') && t.includes('cycle of 4 cells'), t)
await click(PANEL, 0, "Prisoner's Dilemma")
await sleep(200)
ok("Panel A Prisoner's Dilemma: one equilibrium, (D, D), solved", (await role('eq-readout')).includes('Equilibria (D, D)') && (await role('eq-readout')).includes('(D, D): solved'))
await setSlider(PANEL, 0, 'Size m × m', 5)
await sleep(200)
ok('Panel A at 5 × 5: a random table with 25 cells', (await p.$$eval(`${A} [role="cell"]`, (c) => c.length)) === 25 && (await text(A)).includes('RANDOM TABLE NO. 1'))
// Survey with the default 2,000 games, then with 20,000.
const surveyDone = () => waitFor(async () => (await p.$('[data-role="eq-survey"]')) && !(await text(A)).includes('Computing…') && (await p.$$eval('[data-role="eq-survey"] tbody tr', (r) => r.length)) === 7)
await click(PANEL, 0, 'Survey')
const tSmall = await surveyDone()
t = flat(await p.$eval('[data-role="eq-survey"] table', (e) => e.innerText))
ok('Panel A survey with 2,000 games: seven sizes; at m = 2 the walks end at an equilibrium exactly in the games that have one', tSmall >= 0 && t.includes('2 0.993 0.122 0.762 0.115 0.000 0.877 1.000'), t)
await setSlider(PANEL, 0, 'Games G per size', 20000)
await sleep(200)
await click(PANEL, 0, 'Survey')
const tBig = await surveyDone()
t = flat(await p.$eval('[data-role="eq-survey"] table', (e) => e.innerText))
ok('Panel A survey with 20,000 games: m = 2 → 1.000, 0.125, 0.750, 0.125, 0.000, 0.875, 1.000; m = 8 → 0.995, 0.322, 0.419, 0.206, 0.053, 0.523, 0.771', tBig >= 0 && t.includes('2 1.000 0.125 0.750 0.125 0.000 0.875 1.000') && t.includes('8 0.995 0.322 0.419 0.206 0.053 0.523 0.771'), t)
info(`timing: "Survey" with 2,000 games took ${(tSmall / 1000).toFixed(1)} s, with 20,000 games ${(tBig / 1000).toFixed(1)} s`)
info(`survey, 20,000 games: ${t}`)

// ---- Panel B: which convention?
t = await role('conv-readout')
ok('Panel B default: q* 0.667, tipping point 0.732, 7 or more needed in a sample of 10, risk dominant hare', t.includes('q* of the game 0.667') && t.includes('Tipping point of the sampled rule 0.732') && t.includes('sample of 10 7 or more') && t.includes('Risk dominant hare'), t)
ok('Panel B, the run on the page: after 9 sweeps everyone hunts hare', (await role('conv-run')).includes('After 9 sweeps everyone hunts hare.'), await role('conv-run'))
await click(PANEL, 1, 'Run')
await sleep(200)
ok('Panel B, Run: a second run is drawn', (await role('conv-run')).includes('RUN 2'))
const scanDone = () => waitFor(async () => (await p.$('[data-role="conv-scan"]')) && !(await text(PANEL, 1)).includes('Computing…') && (await p.$$eval('[data-role="conv-scan"] tbody tr', (r) => r.length)) === 21)
await click(PANEL, 1, 'Scan the starting share')
const tScan = await scanDone()
t = flat(await p.$eval('[data-role="conv-scan"] table', (e) => e.innerText))
ok('Panel B scan, default: 0 up to 0.60, 0.005 at 0.65, 0.140 at 0.70, 0.830 at 0.75, 1 from 0.80', tScan >= 0 && t.includes('0.60 0.000') && t.includes('0.65 0.005') && t.includes('0.70 0.140') && t.includes('0.75 0.830') && t.includes('0.80 1.000') && t.includes('1.00 1.000 0.0'), t)
info(`timing: "Scan the starting share" at N = 200 took ${(tScan / 1000).toFixed(1)} s`)
await setSlider(PANEL, 1, 'Both hunt the stag: a', 6)
await sleep(200)
t = await role('conv-readout')
ok('Panel B a = 6: q* 0.400, tipping point 0.361, exactly 4 of 10 is a tie, risk dominant stag; the run from 0.70 ends on the stag', t.includes('q* of the game 0.400') && t.includes('0.361') && t.includes('more than 4; with exactly 4 the player does not change') && t.includes('Risk dominant stag') && (await role('conv-run')).includes('everyone hunts the stag.') && (await role('conv-run')).includes('RUN 1'), t)
ok('Panel B: the scan of the old settings is hidden', !(await p.$('[data-role="conv-scan"]')))
await click(PANEL, 1, 'Scan the starting share')
await scanDone()
t = flat(await p.$eval('[data-role="conv-scan"] table', (e) => e.innerText))
ok('Panel B scan, a = 6: 0 at 0.30, 0.295 at 0.35, 0.980 at 0.40, 1 at 0.45', t.includes('0.30 0.000') && t.includes('0.35 0.295') && t.includes('0.40 0.980') && t.includes('0.45 1.000'), t)
await setSlider(PANEL, 1, 'Both hunt the stag: a', 4)
await setSlider(PANEL, 1, 'Sample size k', 50)
await sleep(200)
ok('Panel B k = 50: tipping point 0.704', (await role('conv-readout')).includes('0.704') && (await role('conv-readout')).includes('sample of 50 34 or more'), await role('conv-readout'))
await setSlider(PANEL, 1, 'Sample size k', 5)
await sleep(200)
ok('Panel B k = 5: tipping point 0.869', (await role('conv-readout')).includes('0.869') && (await role('conv-readout')).includes('sample of 5 4 or more'))
await setSlider(PANEL, 1, 'Sample size k', 10)
await setSlider(PANEL, 1, 'Population N', 1000)
await sleep(300)
await click(PANEL, 1, 'Scan the starting share')
const tScanBig = await scanDone()
t = flat(await p.$eval('[data-role="conv-scan"] table', (e) => e.innerText))
ok('Panel B scan at N = 1,000: 0.005 at 0.70 and 0.920 at 0.75', tScanBig >= 0 && t.includes('0.70 0.005') && t.includes('0.75 0.920'), t)
info(`timing: "Scan the starting share" at N = 1,000 took ${(tScanBig / 1000).toFixed(1)} s`)
await setSlider(PANEL, 1, 'Starting share of stag hunters x₀', 1)
await sleep(200)
ok('Panel B x₀ = 1: everyone hunts the stag from the start', (await role('conv-run')).includes('After 0 sweeps everyone hunts the stag.'))

// ---- Panel C: a contest for a prize
t = await role('contest-eq')
ok('Panel C opens on five equal players: effort 16.00, share 20.0%, profit 4.00 each; total 80.00; 80.00 (80.0%) spent', t.includes('5 1.0 16.00 20.0% 4.00') && t.includes('5 of 5') && t.includes('Total effort 80.00') && t.includes('80.00 (80.0%)'), t)
await setSlider(PANEL, 2, 'Players n', 2)
await sleep(150)
t = await role('contest-eq')
ok('Panel C n = 2: total 50.00, profit 25.00 each', t.includes('2 1.0 25.00 50.0% 25.00') && t.includes('Total effort 50.00'), t)
await setSlider(PANEL, 2, 'Players n', 10)
await sleep(150)
t = await role('contest-eq')
ok('Panel C n = 10: total 90.00, profit 1.00 each', t.includes('10 1.0 9.00 10.0% 1.00') && t.includes('Total effort 90.00'), t)
await click(PANEL, 2, 'One at a time')
await sleep(250)
t = await role('contest-adjust')
ok('Panel C n = 10, "One at a time": after 30 rounds the total is 90.00', t.includes('After 30 rounds the total effort is 90.00; the equilibrium is 90.00.'), t)
await click(PANEL, 2, 'All at once')
await sleep(250)
t = await role('contest-adjust')
ok('Panel C n = 10, "All at once": after 30 rounds the total is 0.00', t.includes('After 30 rounds the total effort is 0.00; the equilibrium is 90.00.'), t)
await setSlider(PANEL, 2, 'Players n', 3)
await sleep(150)
ok('Panel C n = 3, "All at once": settles at 66.67', (await role('contest-adjust')).includes('After 30 rounds the total effort is 66.67; the equilibrium is 66.67.'))
await setSlider(PANEL, 2, 'Players n', 4)
await sleep(150)
t = await role('contest-adjust')
ok('Panel C n = 4, "All at once": still off the equilibrium of 75.00 after 30 rounds', /After 30 rounds the total effort is 81\.\d\d; the equilibrium is 75\.00\./.test(t), t)
await click(PANEL, 2, 'Miners')
await sleep(200)
t = await role('contest-eq')
ok('Panel C "Miners": efforts 23.44, 19.53, 15.63, 3.91; shares 37.5%, 31.3%, 25.0%, 6.3%; profits 14.06, 9.77, 6.25, 0.39; cost 2.0 stays out', t.includes('1 1.0 23.44 37.5% 14.06') && t.includes('1 1.1 19.53 31.3% 9.77') && t.includes('1 1.2 15.63 25.0% 6.25') && t.includes('1 1.5 3.91 6.3% 0.39') && t.includes('1 2.0 stays out'), t)
ok('Panel C "Miners": 4 of 5 stay in, total effort 62.50, 69.53 (69.5%) spent', t.includes('4 of 5') && t.includes('Total effort 62.50') && t.includes('69.53 (69.5%)'), t)
await click(PANEL, 2, 'One at a time')
await sleep(200)
ok('Panel C "Miners", "One at a time": 62.50 after 30 rounds', (await role('contest-adjust')).includes('After 30 rounds the total effort is 62.50; the equilibrium is 62.50.'))
await click(PANEL, 2, 'All at once')
await sleep(200)
t = await role('contest-adjust')
ok('Panel C "Miners", "All at once": still swinging after 30 rounds (63.3)', /After 30 rounds the total effort is 63\.\d\d; the equilibrium is 62\.50\./.test(t), t)
await setSlider(PANEL, 2, 'Prize V', 50)
await sleep(200)
t = await role('contest-eq')
ok('Panel C "Miners" with a prize of 50: total 31.25, the same shares', t.includes('Total effort 31.25') && t.includes('1 1.0 11.72 37.5% 7.03') && t.includes('1 1.5 1.95 6.3% 0.20'), t)
await setSlider(PANEL, 2, 'Prize V', 100)
await click(PANEL, 2, 'One 10% cheaper')
await setSlider(PANEL, 2, 'Players n', 10)
await sleep(200)
t = await role('contest-eq')
ok('Panel C "One 10% cheaper", n = 10: shares 18.2% and 9.1%, total 90.91, 89.3% spent', t.includes('1 0.9 16.53 18.2% 3.31') && t.includes('9 1.0 8.26 9.1% 0.83') && t.includes('Total effort 90.91') && t.includes('(89.3%)'), t)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
