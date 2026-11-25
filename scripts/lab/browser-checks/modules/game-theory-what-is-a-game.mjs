// Functional checks of Game Theory Lab module 01 "What is a game?": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones in the lecture, the observe
// lists and the exercises. It also times the two experiments.
//
//   node modules/game-theory-what-is-a-game.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/what-is-a-game`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const text = async (sel, k = 0) => flat(await p.evaluate((s, i) => document.querySelectorAll(s)[i].innerText, sel, k))
const panelText = (i) => text(PANEL, i)
const figText = (i) => text('figure', i)
// Clicks the button with this label inside the k-th element matching `sel`.
const click = (sel, k, label) =>
  p.evaluate(
    (s, i, l) => {
      const b = [...document.querySelectorAll(s)[i].querySelectorAll('button')].find(
        (x) => x.innerText.trim().toLowerCase() === l.toLowerCase(),
      )
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    sel,
    k,
    label,
  )
const disabled = (sel, k, label) =>
  p.evaluate(
    (s, i, l) =>
      [...document.querySelectorAll(s)[i].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase()).disabled,
    sel,
    k,
    label,
  )
// Moves the slider with this label inside panel k to a value.
const setSlider = (k, label, value) =>
  p.evaluate(
    (s, i, l, v) => {
      const root = document.querySelectorAll(s)[i]
      const lab = [...root.querySelectorAll('label')].find((x) => x.innerText.trim() === l)
      if (!lab) throw new Error('no slider ' + l)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    PANEL,
    k,
    label,
    value,
  )
const waitFor = async (fn, ms = 60000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(50)
  }
  return -1
}

// ---- Figure F1
const inFig1 = (sel) => p.evaluate((q) => document.querySelectorAll('figure')[0].querySelectorAll(q).length, sel)
let t = await figText(0)
ok('F1: starts with nothing deleted', t.includes('Nothing deleted yet') && (await inFig1('[data-gone]')) === 0, t.slice(-200))
for (let i = 0; i < 4; i++) {
  await click('figure', 0, 'Next step')
  await sleep(120)
}
t = await figText(0)
ok('F1 "Four steps": after four steps one cell is left, (D, C), and Next step is disabled', t.includes('Step 4: L goes') && t.includes('One cell is left: (D, C).') && (await disabled('figure', 0, 'Next step')) && (await inFig1('[data-gone]')) === 8, t.slice(-260))
await click('figure', 0, 'Stops half-way')
await sleep(150)
await click('figure', 0, 'Next step')
await click('figure', 0, 'Next step')
await sleep(150)
t = await figText(0)
ok('F1 "Stops half-way": R then U go, a 2 × 2 game is left with stable cells (M, L) and (D, C)', t.includes('Step 2: U goes') && t.includes('a 2 × 2 game is left') && t.includes('Stable cells: (M, L) and (D, C).') && (await inFig1('[data-stable]')) === 2, t.slice(-260))
await click('figure', 0, 'Reset')
await sleep(120)
ok('F1: Reset starts again', (await figText(0)).includes('Nothing deleted yet'))
await click('figure', 0, 'Nothing to delete')
await sleep(150)
t = await figText(0)
ok('F1 "Nothing to delete": nothing is dominated, stable cell (M, C)', t.includes('Nothing can be deleted') && t.includes('Stable cell: (M, C).') && (await disabled('figure', 0, 'Next step')), t.slice(-260))

// ---- Figure F2
const readout = async () => flat(await p.$eval('[data-role="atlas-readout"]', (e) => e.innerText))
t = await readout()
ok("F2 default (1.5, −0.5): Prisoner's Dilemma, D dominant, (D, D)", t.includes("Game: Prisoner's Dilemma") && t.includes('Dominant strategy: D') && t.includes('Stable cells: (D, D)'), t)
// A click on the map at (T, S): the plot area is 30…292 by 8…208 in a 300 × 232 viewBox.
const clickMap = async (T, S) => {
  const svg = await p.$('figure:nth-of-type(1) svg[viewBox="0 0 300 232"], figure svg[viewBox="0 0 300 232"]')
  await svg.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await sleep(250)
  const box = await svg.boundingBox()
  await p.mouse.click(box.x + ((30 + (T / 2) * 262) / 300) * box.width, box.y + ((8 + ((1 - S) / 2) * 200) / 232) * box.height)
  await sleep(200)
}
await clickMap(0.5, -0.5)
t = await readout()
ok('F2 click at (0.5, −0.5): stag hunt, no dominant strategy, (C, C) and (D, D)', t.includes('Game: Stag hunt') && t.includes('Dominant strategy: none') && t.includes('(C, C) (D, D)'), t)
await clickMap(1.5, 0.5)
t = await readout()
ok('F2 click at (1.5, 0.5): chicken, (C, D) and (D, C)', t.includes('Game: Chicken') && t.includes('(C, D) (D, C)'), t)
await clickMap(0.5, 0.5)
t = await readout()
ok('F2 click at (0.5, 0.5): harmony, C dominant, (C, C)', t.includes('Game: Harmony') && t.includes('Dominant strategy: C') && t.includes('Stable cells: (C, C)'), t)
await clickMap(1, 0.5)
t = await readout()
ok('F2 click at (1, 0.5): on the border', t.includes('Game: On the border'), t)

// ---- Panel A
const explorer = async () => flat(await p.$eval('[data-role="explorer-readout"]', (e) => e.innerText))
t = await explorer()
ok("Panel A Prisoner's Dilemma: C dominated for both, (D, D) solved, (D, D) the only cell beaten for both", t.includes('C (row player: D is better); C (column player: D is better)') && t.includes('(D, D): solved') && t.includes('No other cell is better for both (C, C) (C, D) (D, C)'), t)
await click(PANEL, 0, 'Stag hunt')
await sleep(150)
t = await explorer()
ok('Panel A stag hunt: nothing dominated, stable (Stag, Stag) and (Hare, Hare)', t.includes('Strictly dominated none') && t.includes('all four cells') && t.includes('Stable cells (Stag, Stag) (Hare, Hare)'), t)
await click(PANEL, 0, 'Chicken')
await sleep(150)
ok('Panel A chicken: stable cells off the diagonal', (await explorer()).includes('Stable cells (Swerve, Straight) (Straight, Swerve)'))
await click(PANEL, 0, 'Matching pennies')
await sleep(150)
ok('Panel A matching pennies: no stable cell', (await explorer()).includes('Stable cells none'))
await click(PANEL, 0, "Prisoner's Dilemma")
await sleep(150)
for (let i = 0; i < 3; i++) {
  await p.evaluate((s) => document.querySelectorAll(s)[0].querySelector('button[aria-label="C, C: row +1"]').click(), PANEL)
  await sleep(80)
}
t = await explorer()
ok('Panel A: row payoff of (C, C) raised to 6: only the column C is dominated, still solved at (D, D)', t.includes('Strictly dominated C (column player: D is better) Iterated') && t.includes('(D, D): solved'), t)
await click(PANEL, 0, 'Survey all games')
await sleep(300)
t = flat(await p.$eval('[data-role="survey"]', (e) => e.innerText))
ok('Panel A survey: 576, 144, 78 games; stable cells 72/432/72, 18/108/18, 9/57/12; like the PD 4, 1, 1', t.includes('Games 576 144 78') && t.includes('No stable cell 72 18 9') && t.includes('One stable cell 432 108 57') && t.includes('Two stable cells 72 18 12') && t.includes("Like the Prisoner's Dilemma 4 1 1"), t.slice(0, 500))
ok('Panel A survey: dominant for both 144, one 288, neither 144; solved 432; 12 symmetric', t.includes('both 144 of 576') && t.includes('only 288 of 576') && t.includes('neither 144 of 576') && t.includes('elimination 432 of 576') && t.includes('Symmetric games 12 of 78'), t.slice(-300))

// ---- Panel B
t = await panelText(1)
ok('Panel B round on the page: mean 29.37, target 19.58, a level 2 player wins; expected 29.81, 19.88', t.includes('Mean 29.37') && t.includes('Target (2/3 × mean) 19.58') && t.includes('Winner Level 2') && t.includes('29.81, 19.88') && t.includes('Level 0 200') && t.includes('Equilibrium 50'), t.slice(0, 700))
await p.type(`${PANEL}:nth-child(2) input[type=text]`, '20')
await sleep(150)
t = flat(await p.$eval('[data-role="rank"]', (e) => e.innerText))
ok('Panel B: a guess of 20 is ranked among the 1,001', /Your guess would have come \d+ of 1,001/.test(t), t)
await click(PANEL, 1, 'Play 1,000 times')
await waitFor(async () => (await p.$('[data-role="many"]')) && flat(await p.$eval('[data-role="many"]', (e) => e.innerText)).includes('1,000 OF 1,000'))
t = flat(await p.$eval('[data-role="many"]', (e) => e.innerText))
ok('Panel B 1,000 plays: wins 57 / 0 / 917 / 26 / 0, distances 34.1 / 13.5 / 2.6 / 5.1 / 19.9, means 29.82 and 19.88', t.includes('Level 0 200 57 34.1') && t.includes('Level 1 350 0 13.5') && t.includes('Level 2 300 917 2.6') && t.includes('Level 3 100 26 5.1') && t.includes('Equilibrium 50 0 19.9') && t.includes('Mean of the means 29.82, of the targets 19.88'), t)
await click(PANEL, 1, '10 more rounds')
await sleep(300)
t = flat(await p.$eval('[data-role="rounds"]', (e) => e.innerText))
ok('Panel B, 10 more rounds with σ = 2: the mean falls below 1 in round 8', t.includes('The mean falls below 1 in round 8.') && t.includes('the noise shrinks with the mean'), t.slice(-300))
await setSlider(1, 'Noise σ', 0)
await sleep(200)
await click(PANEL, 1, '10 more rounds')
await sleep(300)
t = flat(await p.$eval('[data-role="rounds"]', (e) => e.innerText))
ok('Panel B with σ = 0: the mean falls below 1 in round 8', t.includes('The mean falls below 1 in round 8.'), t.slice(-200))
await setSlider(1, 'Noise σ', 2)
await click(PANEL, 1, 'Deep thinkers')
await sleep(200)
ok('Panel B deep thinkers: expected 15.56, 10.37', (await panelText(1)).includes('15.56, 10.37'))
await click(PANEL, 1, 'Play 1,000 times')
await waitFor(async () => (await p.$('[data-role="many"]')) && flat(await p.$eval('[data-role="many"]', (e) => e.innerText)).includes('1,000 OF 1,000'))
ok('Panel B deep thinkers: level 3 wins all 1,000', flat(await p.$eval('[data-role="many"]', (e) => e.innerText)).includes('Level 3 300 1,000'))
await click(PANEL, 1, 'Half at equilibrium')
await sleep(200)
await click(PANEL, 1, 'Play 1,000 times')
await waitFor(async () => (await p.$('[data-role="many"]')) && flat(await p.$eval('[data-role="many"]', (e) => e.innerText)).includes('1,000 OF 1,000'))
t = flat(await p.$eval('[data-role="many"]', (e) => e.innerText))
ok('Panel B half at equilibrium: level 0 wins 615 times and level 3 385', t.includes('Level 0 100 615') && t.includes('Level 3 100 385'), t)
// Timing: 1,000 plays with 5,000 players.
await click(PANEL, 1, 'Default')
await setSlider(1, 'Players N', 5000)
await sleep(300)
await click(PANEL, 1, 'Play 1,000 times')
const tMany = await waitFor(async () => (await p.$('[data-role="many"]')) && flat(await p.$eval('[data-role="many"]', (e) => e.innerText)).includes('1,000 OF 1,000'))
ok('Panel B: 1,000 plays with N = 5,000 finish', tMany >= 0)
info(`timing: "Play 1,000 times" at N = 5,000 took ${(tMany / 1000).toFixed(1)} s`)

// ---- Panel C
t = flat(await p.$eval('[data-role="size"]', (e) => e.innerText))
ok('Panel C opens on 2,000 games 3 × 3: dominated 0.788, solved 0.430, cells 4.05, stable cells 0.220 / 0.559 / 0.221', t.includes('strategy 0.788') && t.includes('elimination 0.430') && t.includes('4.05') && t.includes('No stable cell 0.220') && t.includes('Exactly one 0.559') && t.includes('Two or more 0.221'), t)
await click(PANEL, 2, 'All sizes')
const tAll = await waitFor(async () => (await p.$('[data-role="all-sizes"]')) && !(await panelText(2)).includes('Computing…') && (await p.$$eval('[data-role="all-sizes"] tbody tr', (r) => r.length)) === 7)
t = flat(await p.$eval('[data-role="all-sizes"] table', (e) => e.innerText))
ok('Panel C all sizes with 2,000 games: seven rows; m = 3 agrees with the readout (0.788, 0.430)', tAll >= 0 && t.includes('3 0.788 0.430 0.220 0.559 0.221'), t)
info(`timing: "All sizes" with 2,000 games took ${(tAll / 1000).toFixed(1)} s`)
info(`all sizes, 2,000 games: ${t}`)
await setSlider(2, 'Size m × m', 2)
await sleep(600)
t = flat(await p.$eval('[data-role="size"]', (e) => e.innerText))
const m2 = t.match(/strategy ([\d.]+) Solved by elimination ([\d.]+).*Exactly one ([\d.]+)/)
ok('Panel C at m = 2: dominated = solved = exactly one, near 3/4', !!m2 && m2[1] === m2[2] && m2[2] === m2[3] && Math.abs(Number(m2[1]) - 0.75) < 0.03, t)
const before = await p.$$eval(`${PANEL}:nth-child(3) [role="cell"]`, (c) => c.map((x) => x.innerText).join('|'))
await click(PANEL, 2, 'Another game')
await sleep(200)
const after = await p.$$eval(`${PANEL}:nth-child(3) [role="cell"]`, (c) => c.map((x) => x.innerText).join('|'))
ok('Panel C: "Another game" draws a different 2 × 2 sample', before !== after && after.split('|').length === 4, after)
await setSlider(2, 'Size m × m', 8)
await sleep(800)
ok('Panel C at m = 8: the sample has 64 cells', (await p.$$eval(`${PANEL}:nth-child(3) [role="cell"]`, (c) => c.length)) === 64)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
