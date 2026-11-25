// Functional checks of Game Theory Lab module 04 "Games in time and credible
// commitment": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises. It also times the survey of
// Panel A (2,000 and 20,000 trees) and "Play" in Panel C.
//
//   node modules/game-theory-sequential-games-commitment.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/sequential-games-commitment`, 1500)

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
let t

// ---- Figure F1: a threat on a tree
const F1 = (k = 0) => p.evaluate((i) => document.querySelectorAll('figure')[i].querySelectorAll('[data-role="tree"] line[data-path]').length, k)
t = await role('entry-story')
ok('F1 opens with f = 0: the firm shares, the threat is empty, both get 2; the path has two orange edges', t.includes('gets 2 by sharing and 0 by fighting, so it shares: the threat is empty') && t.includes('both get 2') && (await F1()) === 2, t)
await setSlider('figure', 0, 'f, the firm’s payoff from fighting', 2)
await sleep(150)
ok('F1 f = 2: the firm is indifferent', (await role('entry-story')).includes('indifferent'), await role('entry-story'))
await setSlider('figure', 0, 'f, the firm’s payoff from fighting', 2.5)
await sleep(150)
t = await role('entry-story')
ok('F1 f = 2.5: the threat is credible by itself, the newcomer stays out; the path is one edge', t.includes('credible by itself') && t.includes('stays out') && (await F1()) === 1, t)
await setSlider('figure', 0, 'f, the firm’s payoff from fighting', 0)
await click('figure', 0, 'The firm can commit first')
await sleep(150)
t = await role('entry-story')
ok('F1 with commitment, k = 1: the firm commits and gets 4 − k = 3; the path runs commit → stay out', t.includes('4 − k = 3') && t.includes('so it commits') && (await F1()) === 2, t)
await setSlider('figure', 0, 'k, the cost of committing', 2)
await sleep(150)
ok('F1 k = 2: indifferent, the firm waits', (await role('entry-story')).includes('4 − k = 2, exactly what sharing gives'), await role('entry-story'))
await setSlider('figure', 0, 'k, the cost of committing', 2.5)
await sleep(150)
t = await role('entry-story')
ok('F1 k = 2.5: committing leaves 1.5, less than 2: the firm waits and they share; the path has three edges', t.includes('4 − k = 1.5, less than the 2 of sharing') && (await F1()) === 3, t)
await setSlider('figure', 0, 'f, the firm’s payoff from fighting', 3)
await sleep(150)
ok('F1 with commitment and f = 3: no commitment needed, the firm keeps 4', (await role('entry-story')).includes('credible without help'), await role('entry-story'))

// ---- Figure F2: the shrinking pie
const bars = () => p.$$eval('[data-role="pie"] rect[data-bar]', (r) => r.length)
t = await role('pie-readout')
ok('F2 opens on δ = 0.9, 10 rounds: 0.3428; with no last round 0.5263; 10 bars', t.includes('gets 0.3428') && t.includes('0.5263 = 1/(1 + δ)') && (await bars()) === 10, t)
for (const [T, v] of [[1, '1.0000'], [2, '0.1000'], [3, '0.9100'], [5, '0.8371']]) {
  await setSlider('figure', 1, 'Rounds T at most', T)
  await sleep(100)
  ok(`F2 T = ${T}: ${v} (exercise 4 and the self-check)`, (await role('pie-readout')).includes(`gets ${v}`) && (await bars()) === T, await role('pie-readout'))
}
await setSlider('figure', 1, 'Rounds T at most', 20)
await click('figure', 1, 'Different patience')
await sleep(100)
await setSlider('figure', 1, 'δ₂, the other player’s', 0.8)
await sleep(100)
ok('F2 different patience 0.9 and 0.8: limit 0.7143; 20 bars', (await role('pie-readout')).includes('0.7143 = (1 − δ₂)/(1 − δ₁δ₂)') && (await bars()) === 20, await role('pie-readout'))
await setSlider('figure', 1, 'δ₁, the first proposer’s', 0.8)
await setSlider('figure', 1, 'δ₂, the other player’s', 0.9)
await sleep(100)
ok('F2 the reverse, 0.8 and 0.9: 0.3571', (await role('pie-readout')).includes('0.3571'), await role('pie-readout'))

// ---- Panel A: solve the tree
const nash = () => role('tree-nash')
const solve = async () => {
  await click(PANEL, 0, 'Solve')
  return waitFor(async () => (await role('tree-status')).includes('Backward induction'), 20000)
}
t = await nash()
ok('Panel A opens on the entry game: 2 equilibria; (O, F) not subgame perfect, with the threat named; (E, S) subgame perfect', t.includes('2 NASH EQUILIBRIA') && t.includes('O, F · payoffs 0 and 4 NOT SUBGAME PERFECT') && t.includes('Firm: the plan says “Fight” after Enter, where it would get 0; “Share” would give 2.') && t.includes('E, S · payoffs 2 and 2 SUBGAME PERFECT'), t)
await click(PANEL, 0, 'Solve')
await sleep(200)
ok('Panel A "Solve" goes one node at a time (first the firm)', (await role('tree-status')).includes('Solved 0 of 2') || (await role('tree-status')).includes('Solved 1 of 2'), await role('tree-status'))
await waitFor(async () => (await role('tree-status')).includes('Backward induction'), 10000)
ok('Panel A entry game solved: payoffs 2 and 2, two orange edges', (await role('tree-status')).includes('payoffs 2 and 2') && (await p.evaluate((s) => document.querySelectorAll(s)[0].querySelectorAll('[data-role="tree"] line[data-path]').length, PANEL)) === 2)
await click(PANEL, 0, 'Entry with commitment (k = 1)')
await sleep(150)
t = await nash()
ok('Panel A entry with commitment: 5 equilibria, one subgame perfect', t.includes('5 NASH EQUILIBRIA') && t.split('NOT SUBGAME PERFECT').length - 1 === 4, t)
await solve()
ok('Panel A entry with commitment solved: (3, 0)', (await role('tree-status')).includes('payoffs 3 and 0'))
await click(PANEL, 0, 'Battle of the sexes in turn')
await sleep(150)
t = await nash()
ok('Panel A battle of the sexes in turn: 3 equilibria; (M, MM) not perfect, threat after Concert; the column player has 4 plans', t.includes('3 NASH EQUILIBRIA') && t.includes('M, MM · payoffs 1 and 2 NOT SUBGAME PERFECT') && t.includes('after Concert') && (await p.$$eval(`${PANEL}:nth-of-type(1) [role="columnheader"]`, (c) => c.length)) === 5, t)
await solve()
ok('Panel A battle of the sexes solved: (2, 1)', (await role('tree-status')).includes('payoffs 2 and 1'))
await click(PANEL, 0, 'Matching pennies in turn')
await sleep(150)
await solve()
t = await role('tree-status')
ok('Panel A matching pennies solved: the second mover wins (0 and 1), and the first mover is indifferent', t.includes('payoffs 0 and 1') && t.includes('indifferent'), t)
await click(PANEL, 0, 'Centipede')
await sleep(150)
t = await nash()
ok('Panel A centipede: 4 equilibria', t.includes('4 NASH EQUILIBRIA'), t)
await solve()
ok('Panel A centipede solved: (1, 0)', (await role('tree-status')).includes('payoffs 1 and 0'))
await click(PANEL, 0, 'Random tree')
await sleep(150)
ok('Panel A random tree no. 1: 2 equilibria', (await text(PANEL, 0)).includes('RANDOM TREE NO. 1') && (await nash()).includes('2 NASH EQUILIBRIA'))
await click(PANEL, 0, 'New tree')
await sleep(150)
ok('Panel A "New tree": random tree no. 2, 3 equilibria', (await text(PANEL, 0)).includes('RANDOM TREE NO. 2') && (await nash()).includes('3 NASH EQUILIBRIA'))
const row = (k) => p.$eval(`[data-role="tree-survey"] [data-row="${k}"]`, (e) => e.innerText.trim())
const surveyDone = () => waitFor(async () => (await p.$('[data-role="tree-survey"]')) && !(await text(PANEL, 0)).includes('Computing…'))
await click(PANEL, 0, 'Survey')
const tSmall = await surveyDone()
ok('Panel A survey, 2,000 trees: Nash 0.249, 0.509, 0.241; not perfect 0.750', tSmall >= 0 && (await row('nash')) === '0.249, 0.509, 0.241' && (await row('notSpe')) === '0.750', await row('nash'))
await setSlider(PANEL, 0, 'Trees G', 20000)
await sleep(150)
let t0 = Date.now()
await click(PANEL, 0, 'Survey')
const tBig = await surveyDone()
const want = { nash: '0.248, 0.502, 0.249', notSpe: '0.751', differs: '0.331', secondBetter: '0.502', first: '0.145, 0.123, 0.731', bothFirst: '0.105', bothSecond: '0.082', noPure: '0.125', noPureBothSecond: '0.651', leaderAbove: '0.048', leaderBelow: '0' }
const got = {}
for (const k of Object.keys(want)) got[k] = await row(k)
ok('Panel A survey, 20,000 trees: the numbers of the observe list and exercise 6', Object.keys(want).every((k) => got[k] === want[k]), JSON.stringify(got))
info(`timing: "Survey" with 2,000 trees ${(tSmall / 1000).toFixed(1)} s, 20,000 trees ${(tBig / 1000).toFixed(1)} s (click to table ${((Date.now() - t0) / 1000).toFixed(1)} s)`)

// ---- Panel B: leader and follower
t = await role('leader-table')
ok('Panel B defaults: simultaneous 3, 3, 4, 9, 9; leader 4.5, 2.25, 3.25, 10.125, 5.0625', t.includes('Quantity of firm 1 3 4.5') && t.includes('Quantity of firm 2 3 2.25') && t.includes('Price 4 3.25') && t.includes('Profit of firm 1 9 10.125') && t.includes('Profit of firm 2 9 5.0625'), t)
ok('Panel B: the leader\'s 4.5 is not a best response to 2.25 (3.375)', (await role('leader-story')).includes('that would be 3.375'))
const setF = async (v) => {
  await setSlider(PANEL, 1, 'F, firm 2’s fixed cost if it produces', v)
  await sleep(120)
  return role('leader-story')
}
t = await setF(0.4)
ok('Panel B F = 0.40: still shares; keeping out would leave 9.968… not worth it', t.includes('lets the follower in: profit 10.125') && t.includes('not worth it'), t)
t = await setF(0.45)
ok('Panel B F = 0.45: limit quantity 7.658, profit 10.275, more than 10.125', t.includes('limit quantity 7.658') && t.includes('profit 10.275, more than the 10.125'), t)
t = await setF(1)
ok('Panel B F = 1: limit quantity 7, profit 14 (exercise 3)', t.includes('limit quantity 7,') && t.includes('profit 14'), t)
t = await setF(5.05)
ok('Panel B F = 5.05: still the limit quantity 4.506', t.includes('limit quantity 4.506'), t)
t = await setF(5.1)
ok('Panel B F = 5.10: the follower stays out against the monopoly quantity 4.5, profit 20.25, threshold 5.0625', t.includes('5.0625') && t.includes('produces 4.5 and earns the monopoly profit 20.25'), t)
await setF(0)
await setSlider(PANEL, 1, 'c1, firm 1’s cost per unit', 0.5)
await sleep(120)
t = await role('leader-table')
ok('Panel B c1 = 0.5: leader 5, profit 12.5; at the same time 11.111', t.includes('Quantity of firm 1 3.3333 5') && t.includes('Profit of firm 1 11.1111 12.5'), t)
await setSlider(PANEL, 1, 'c1, firm 1’s cost per unit', 1)
await setSlider(PANEL, 1, 'c2, firm 2’s cost per unit', 2.5)
await sleep(120)
t = await role('leader-table')
ok('Panel B c2 = 2.5: 5.25 and 1.125, follower profit 1.2656', t.includes('5.25') && t.includes('1.125') && t.includes('1.2656'), t)

// ---- Panel C: dividing a pie
ok('Panel C defaults: closed form 0.40 worth 0.60; population 0.394 worth 0.602; offer 0.10 accepted by 23.9%, 0.215 (0.225)', (await role('ultimatum-closed')).includes('here 0.40, worth 0.60') && (await role('ultimatum-pop')).includes('0.394, worth 0.602') && (await role('ultimatum-offer')).includes('accepted by 23.9% of this population and earns 0.215 on average (0.225'))
t0 = Date.now()
await click(PANEL, 2, 'Play')
const tPlay = await waitFor(async () => !!(await p.$('[data-role="ultimatum-play"]')), 30000)
t = await role('ultimatum-play')
ok('Panel C "Play": best offer 0.40 (0.600); only 144 of the 1,000 proposers found it alone; 21 bars', t.includes('is 0.40 (0.600)') && t.includes('Only 144 of the 1,000') && (await p.$$eval('[data-role="ultimatum-bars"] rect', (r) => r.length)) === 21, t)
info(`timing: "Play" in Panel C ${(tPlay / 1000).toFixed(2)} s`)
await setSlider(PANEL, 2, 'm, the largest threshold', 0.2)
await sleep(150)
ok('Panel C m = 0.2: population 0.200 worth 0.800; the old "Play" result is hidden', (await role('ultimatum-pop')).includes('0.200, worth 0.800') && !(await p.$('[data-role="ultimatum-play"]')))
await click(PANEL, 2, 'Play')
await waitFor(async () => !!(await p.$('[data-role="ultimatum-play"]')), 30000)
ok('Panel C m = 0.2 "Play": 628 proposers find 0.20 alone', (await role('ultimatum-play')).includes('is 0.20 (0.800)') && (await role('ultimatum-play')).includes('Only 628'), await role('ultimatum-play'))
await setSlider(PANEL, 2, 'm, the largest threshold', 0.4)
await setSlider(PANEL, 2, 'N, responders', 5000)
await sleep(200)
ok('Panel C N = 5,000: best offer 0.400; an offer of 0.1 earns 0.231', (await role('ultimatum-pop')).includes('0.400, worth') && (await role('ultimatum-offer')).includes('earns 0.231'), await role('ultimatum-offer'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
