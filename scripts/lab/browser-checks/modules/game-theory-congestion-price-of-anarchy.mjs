// Functional checks of Game Theory Lab module 08 "Congestion and the price
// of anarchy": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises. It also times F2's slider,
// Panel A's 1,000 instances, Panel B's "To the end" at n = 40 and Panel C's
// "To the end" at k = 20, and checks a few Italian readouts.
//
//   node modules/game-theory-congestion-price-of-anarchy.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/congestion-price-of-anarchy`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ').trim()
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
const has = async (name) => !!(await p.$(`[data-role="${name}"]`))
const val = (scope, k) => p.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
const attrs = (sel, a) => p.$$eval(sel, (els, x) => els.map((e) => e.getAttribute(x)), a)
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
const waitFor = async (fn, ms = 60000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(5)
  }
  return -1
}

// ---- Figure F1: two roads
const f1 = (k) => val('pigou-readout', k)
ok('F1 default p = 1, x = 0.5: average 0.7500; equilibrium 1, 1; optimum 0.5000, 0.7500; price of anarchy 1.3333',
  (await f1('avg')) === '0.7500' && (await f1('eq')) === '1, 1' && (await f1('opt')) === '0.5000, 0.7500' && (await f1('poa')) === '1.3333', `${await f1('avg')} ${await f1('eq')} ${await f1('opt')} ${await f1('poa')}`)
const avgAt = []
for (const x of [0.25, 0.75, 1]) {
  await setSlider('figure', 0, 'x, your share on the lower road', x)
  await sleep(60)
  avgAt.push(await f1('avg'))
}
ok('F1 p = 1: the average cost at x = 0.25, 0.75, 1 is 0.8125, 0.8125, 1.0000', avgAt.join(' ') === '0.8125 0.8125 1.0000', avgAt.join(' '))
await click('figure', 0, 'on')
await sleep(80)
ok('F1 toll on at p = 1: toll 0.5000, time plus toll 1.0000; revenue 0.2500; equilibrium at x* = 0.5000',
  (await f1('toll')) === '0.5000, 1.0000' && (await f1('revenue')) === '0.2500' && (await f1('eq')) === '0.5000, 1.0000', `${await f1('toll')} ${await f1('revenue')}`)
await setSlider('figure', 0, 'p, the lower road takes x^p hours', 2)
await sleep(80)
ok('F1 p = 2 (exercise 1): optimum 0.5774, 0.6151; price of anarchy 1.6258; toll 0.6667',
  (await f1('opt')) === '0.5774, 0.6151' && (await f1('poa')) === '1.6258' && (await f1('toll')) === '0.6667, 1.0000', `${await f1('opt')} ${await f1('poa')} ${await f1('toll')}`)
const poas = []
for (const pp of [1.5, 3, 4, 5, 6]) {
  await setSlider('figure', 0, 'p, the lower road takes x^p hours', pp)
  await sleep(60)
  poas.push(`${await f1('opt')}|${await f1('poa')}`)
}
ok('F1 p = 1.5, 3, 4, 5, 6: optimum and price of anarchy as the self-check',
  poas.join(' ') === '0.5429, 0.6743|1.4831 0.6300, 0.5275|1.8956 0.6687, 0.4650|2.1505 0.6988, 0.4176|2.3944 0.7230, 0.3803|2.6297', poas.join(' '))
await click('figure', 0, 'off')

// ---- Figure F2: Braess's paradox
const f2 = (k) => val('braess-readout', k)
const flows = () => attrs('[data-role="braess-net"] [data-road]', 'data-flow')
ok('F2 default (open, c = 0): shares 0.00, 0.00, 1.00; routes 2.00; average 2.00, planner 1.50, ratio 1.3333; widths sv 1, vt 0, sw 0, wt 1, vw 1',
  (await f2('shares')) === '0.00, 0.00, 1.00' && (await f2('costs')) === '2.00, 2.00, 2.00' && (await f2('avg')) === '2.00' && (await f2('planner')) === '1.50' && (await f2('ratio')) === '1.3333'
  && (await flows()).join(' ') === '1.0000 0.0000 0.0000 1.0000 1.0000', (await flows()).join(' '))
let t0 = Date.now()
await setSlider('figure', 1, 'c, the shortcut’s cost in hours', 0.25)
const tF2 = await waitFor(async () => (await f2('avg')) === '1.75', 5000)
info(`timing: F2 slider move to readout ${tF2} ms (call to readout ${Date.now() - t0} ms)`)
ok('F2 c = 0.25 (exercise 2): shares 0.25, 0.25, 0.50; every route 1.75', (await f2('shares')) === '0.25, 0.25, 0.50' && (await f2('costs')) === '1.75, 1.75, 1.75' && (await f2('avg')) === '1.75')
await setSlider('figure', 1, 'c, the shortcut’s cost in hours', 0.5)
await sleep(60)
ok('F2 c = 0.5: (0.50, 0.50, 0.00), 1.50', (await f2('shares')) === '0.50, 0.50, 0.00' && (await f2('avg')) === '1.50' && (await f2('ratio')) === '1.0000')
await setSlider('figure', 1, 'c, the shortcut’s cost in hours', 0)
await click('figure', 1, 'closed')
await sleep(60)
ok('F2 closed: (0.50, 0.50, –), 1.50; the shortcut drawn dashed and empty', (await f2('shares')) === '0.50, 0.50, –' && (await f2('avg')) === '1.50' && (await flows())[4] === '0.0000')
await click('figure', 1, 'open')

// ---- Panel A
const av = (k) => val('parallel-readout', k)
const sv = (k) => val('parallel-survey', k)
const bars = async () => (await attrs('[data-role="parallel-bars"] [data-road]', 'data-eq')).join(' ') + ' / ' + (await attrs('[data-role="parallel-bars"] [data-road]', 'data-opt')).join(' ')
ok('Panel A opens on instance no. 1 (n = 3, d = 1, r = 1): (0.7814, 0, 0.2186) at 0.4928; (0.6942, 0, 0.3058) at 0.4806; ratio 1.0253; 0.4928 ≤ 1.6170 (observe 1)',
  (await role('parallel-which')).startsWith('Instance no. 1') && (await bars()) === '0.7814 0.0000 0.2186 / 0.6942 0.0000 0.3058' && (await av('eq')) === '0.4928' && (await av('opt')) === '0.4806' && (await av('ratio')) === '1.0253' && (await av('doubled')) === '0.4928 ≤ 1.6170: holds',
  `${await bars()} ${await av('ratio')} ${await av('doubled')}`)
await click(PANEL, 0, 'Pigou')
await sleep(80)
ok('Panel A Pigou, d = 1: 1.3333, the bound (observe 2)', (await av('ratio')) === '1.3333' && (await av('bound')) === '1.3333')
await setSlider(PANEL, 0, 'd, the degree of the costs', 4)
await sleep(80)
ok('Panel A Pigou, d = 4: 2.1505, the bound (observe 2)', (await av('ratio')) === '2.1505' && (await av('bound')) === '2.1505')
await setSlider(PANEL, 0, 'd, the degree of the costs', 1)
await click(PANEL, 0, 'New instance')
await sleep(80)
ok('Panel A "New instance" after Pigou goes back to random instance no. 1', (await role('parallel-which')).startsWith('Instance no. 1') && (await av('ratio')) === '1.0253')
// Exercise 3: two roads x and 0.5 + x are not a random instance; the panel's
// instance no. 1 with n = 2 is checked instead for the doubled demand.
t0 = Date.now()
await click(PANEL, 0, '1,000 instances')
const tA = await waitFor(() => has('parallel-survey'), 10000)
info(`timing: Panel A "1,000 instances" (n = 3, d = 1) click to histogram ${tA} ms (call to result ${Date.now() - t0} ms)`)
ok('Panel A 1,000 instances, d = 1: mean 1.036, largest 1.289, above 1.05 0.27, doubled check yes (observe 3)',
  (await sv('s-mean')) === '1.036' && (await sv('s-largest')) === '1.289' && (await sv('s-above')) === '0.27' && (await sv('s-doubled')) === 'yes', `${await sv('s-mean')} ${await sv('s-largest')} ${await sv('s-above')}`)
await setSlider(PANEL, 0, 'd, the degree of the costs', 4)
await sleep(60)
ok('Panel A the survey is hidden when d changes', !(await has('parallel-survey')))
t0 = Date.now()
await click(PANEL, 0, '1,000 instances')
const tA4 = await waitFor(() => has('parallel-survey'), 10000)
info(`timing: Panel A "1,000 instances" (n = 3, d = 4) ${tA4} ms`)
ok('Panel A d = 4: 1.245, 2.110, 0.72; bound 2.151 (observe 4)', (await sv('s-mean')) === '1.245' && (await sv('s-largest')) === '2.110' && (await sv('s-above')) === '0.72' && (await sv('s-bound')) === '2.151')
const surveyAt = async (label, v) => {
  await setSlider(PANEL, 0, label, v)
  await sleep(40)
  await click(PANEL, 0, '1,000 instances')
  await waitFor(() => has('parallel-survey'), 10000)
  return `${await sv('s-mean')}/${await sv('s-largest')}/${await sv('s-above')}`
}
ok('Panel A d = 4, r = 0.1: mean 1.000 (observe 5)', (await surveyAt('r, the demand', 0.1)).startsWith('1.000/'))
const r5 = await surveyAt('r, the demand', 5)
ok('Panel A d = 4, r = 5: 1.007, 1.382, 0.02 (observe 5)', r5 === '1.007/1.382/0.02', r5)
await setSlider(PANEL, 0, 'r, the demand', 1)
await setSlider(PANEL, 0, 'd, the degree of the costs', 1)
const n10 = await surveyAt('n, the roads', 10)
ok('Panel A n = 10, d = 1: 1.046, 1.212 (observe 6)', n10.startsWith('1.046/1.212/'), n10)

// ---- Panel B
const bv = (k) => val('atomic-readout', k)
const moves = () => p.$$eval('[data-role="atomic-log"] [data-move]', (rows) => rows.map((r) => [...r.querySelectorAll('td')].map((td) => td.innerText.trim()).join(' ')))
ok('Panel B defaults (n = 10, c = 0, all upper): counts 10, 0, 0; cost 2.0000; Φ 15.5000; optimum 1.5000 (5, 5, 0), best 1.8200 (1, 1, 8), worst 2.0000 (0, 0, 10); 1.3333 and 1.2133 (observe 2)',
  (await bv('counts')) === '10, 0, 0' && (await bv('cost')) === '2.0000' && (await bv('phi')) === '15.5000' && (await bv('opt')) === '1.5000 (5, 5, 0)' && (await bv('best')) === '1.8200 (1, 1, 8)' && (await bv('worst')) === '2.0000 (0, 0, 10)' && (await bv('poa')) === '1.3333' && (await bv('pos')) === '1.2133',
  `${await bv('opt')} ${await bv('best')} ${await bv('worst')} ${await bv('pos')}`)
await click(PANEL, 1, 'One switch')
await sleep(60)
ok('Panel B one switch: driver 1, upper to lower, gain 0.9000 = drop of Φ', (await moves()).join('|') === '1 1 upper lower 0.9000 0.9000', (await moves()).join('|'))
await click(PANEL, 1, 'To the end')
await sleep(100)
const mv = await moves()
ok('Panel B to the end: nine switches, drivers 2–9 to the zigzag with gains 0.8 … 0.1, each equal to the drop of Φ; ends (1, 1, 8) at 1.8200, Φ 11.0000 (observe 1, exercise 4)',
  mv.length === 9 && mv.slice(1).every((r, i) => r === `${i + 2} ${i + 2} upper zigzag ${(0.8 - i / 10).toFixed(4)} ${(0.8 - i / 10).toFixed(4)}`) && (await bv('counts')) === '1, 1, 8' && (await bv('cost')) === '1.8200' && (await bv('phi')) === '11.0000' && (await role('atomic-status')).startsWith('Ended'),
  mv.join('|'))
await setSlider(PANEL, 1, 'c, the shortcut’s cost', 0.25)
await sleep(60)
await click(PANEL, 1, 'To the end')
await sleep(100)
ok('Panel B c = 0.25: seven switches to (3, 3, 4) at 1.6800; best = worst, both prices 1.1200 (observe 3)',
  (await moves()).length === 7 && (await bv('counts')) === '3, 3, 4' && (await bv('cost')) === '1.6800' && (await bv('poa')) === '1.1200' && (await bv('pos')) === '1.1200')
await setSlider(PANEL, 1, 'c, the shortcut’s cost', 0.5)
await sleep(60)
await click(PANEL, 1, 'To the end')
await sleep(100)
ok('Panel B c = 0.5: ends at 1.5000 (observe 3)', (await bv('cost')) === '1.5000' && (await bv('counts')) === '5, 5, 0')
await setSlider(PANEL, 1, 'c, the shortcut’s cost', 0)
await click(PANEL, 1, 'closed')
await sleep(60)
await click(PANEL, 1, 'To the end')
await sleep(100)
ok('Panel B closed: five switches to (5, 5, –) at 1.5000 (observe 4)', (await moves()).length === 5 && (await bv('counts')) === '5, 5, –' && (await bv('cost')) === '1.5000')
await click(PANEL, 1, 'open')
await setSlider(PANEL, 1, 'n, the drivers', 40)
await sleep(100)
t0 = Date.now()
await click(PANEL, 1, 'To the end')
const tB = await waitFor(async () => (await role('atomic-status')).startsWith('Ended'), 20000)
info(`timing: Panel B "To the end" at n = 40 (39 switches) ${tB} ms (call to readout ${Date.now() - t0} ms)`)
ok('Panel B n = 40: 39 switches to (1, 1, 38) at 1.9512; price of stability 1.3008 (observe 5)',
  (await role('atomic-status')).startsWith('Ended') && (await bv('counts')) === '1, 1, 38' && (await bv('cost')) === '1.9512' && (await bv('pos')) === '1.3008' && (await p.$$eval('[data-role="atomic-log"] [data-move]', (r) => r[r.length - 1].getAttribute('data-move'))) === '39')
await click(PANEL, 1, 'Four drivers, the worst case')
await sleep(80)
ok('Panel B four drivers, all direct: nothing to do; optimum 4.0000, best 4.0000, worst 10.0000, price of anarchy 2.5000',
  (await bv('cost')) === '4.0000' && (await bv('opt')) === '4.0000' && (await bv('best')) === '4.0000' && (await bv('worst')) === '10.0000' && (await bv('poa')) === '2.5000' && (await has('four-net')))
await click(PANEL, 1, 'all detours')
await sleep(60)
await click(PANEL, 1, 'To the end')
await sleep(80)
ok('Panel B four drivers from all detours: no switch, cost 10.0000, Φ 8.0000 (observe 6, exercise 6)', (await moves()).length === 0 && (await bv('cost')) === '10.0000' && (await bv('phi')) === '8.0000' && (await role('atomic-status')).startsWith('Ended'))
await click(PANEL, 1, 'random')
await sleep(60)
const startCost = await bv('cost')
await click(PANEL, 1, 'To the end')
await sleep(80)
const fm = await moves()
ok('Panel B four drivers, random start no. 1 (D d D D, 11.0000): three switches, drivers 1, 3, 4, to all direct at 4.0000 (observe 6)',
  startCost === '11.0000' && fm.length === 3 && fm.map((r) => r.split(' ')[1]).join(',') === '1,3,4' && (await bv('profile')) === 'd d d d' && (await bv('cost')) === '4.0000', `${startCost} ${fm.join('|')}`)

// ---- Panel C
const cv = (k) => val('share-readout', k)
const order = () => p.$$eval('[data-role="share-log"] [data-move] [data-player]', (c) => c.map((x) => x.innerText.trim()).join(','))
ok('Panel C defaults (hub, k = 10, ε = 0.1, all at the hub): cost 1.1000, Φ 3.2219, optimum 1.1000, H_10 2.9290; one equilibrium, 0 at the hub: 2.9290; ratios 2.6627',
  (await cv('cost')) === '1.1000' && (await cv('phi')) === '3.2219' && (await cv('opt')) === '1.1000' && (await cv('H')) === '2.9290' && (await cv('eqs')) === '0 at the hub: 2.9290' && (await cv('worst')) === '2.6627' && (await cv('best')) === '2.6627',
  `${await cv('phi')} ${await cv('eqs')}`)
await click(PANEL, 2, 'One switch')
await sleep(60)
ok('Panel C one switch: player 10 leaves, gain 0.0100 (observe 1)', (await order()) === '10' && (await p.$eval('[data-role="share-log"] [data-gain]', (e) => e.innerText.trim())) === '0.0100')
await click(PANEL, 2, 'To the end')
await sleep(80)
ok('Panel C to the end: 10, 9, …, 1; cost 2.9290, Φ 2.9290 (observe 1)', (await order()) === '10,9,8,7,6,5,4,3,2,1' && (await cv('cost')) === '2.9290' && (await cv('phi')) === '2.9290')
const gainsDrops = await p.$$eval('[data-role="share-log"] [data-move]', (rows) => rows.every((r) => r.querySelector('[data-gain]').innerText === r.querySelector('[data-drop]').innerText))
ok('Panel C every gain equals the drop of Φ in the log', gainsDrops)
await setSlider(PANEL, 2, 'ε', 0.01)
await sleep(60)
ok('Panel C ε = 0.01: ratio 2.9000 (observe 2)', (await cv('worst')) === '2.9000')
await setSlider(PANEL, 2, 'ε', 0.1)
await setSlider(PANEL, 2, 'k, the players', 20)
await sleep(60)
t0 = Date.now()
await click(PANEL, 2, 'To the end')
const tC = await waitFor(async () => (await role('share-status')).startsWith('Ended'), 20000)
info(`timing: Panel C "To the end" at k = 20 ${tC} ms (call to readout ${Date.now() - t0} ms)`)
// The log keeps the last 12 of the 20 switches (19, 20, 17, 18, 15, 16, 13, 14, then these).
ok('Panel C k = 20: the log ends 11, 12, 10, 9, …, 1, twenty switches in all; ratio 3.2707 (observe 3)',
  (await order()) === '11,12,10,9,8,7,6,5,4,3,2,1' && (await role('share-status')).startsWith('Ended') && (await p.$$eval('[data-role="share-log"] [data-move]', (r) => r[0].getAttribute('data-move'))) === '9' && (await cv('worst')) === '3.2707', await order())
await setSlider(PANEL, 2, 'k, the players', 10)
await setSlider(PANEL, 2, 'ε', 0.5)
await sleep(60)
await click(PANEL, 2, 'To the end')
await sleep(80)
ok('Panel C k = 10, ε = 0.5: order 7, 8, 9, 10, 5, 6, 3, 4, 2, 1; ratio 1.9526 (observe 4)', (await order()) === '7,8,9,10,5,6,3,4,2,1' && (await cv('worst')) === '1.9526', await order())
await setSlider(PANEL, 2, 'ε', 0.1)
await click(PANEL, 2, 'Two roads')
await sleep(60)
await click(PANEL, 2, 'To the end')
await sleep(60)
ok('Panel C two roads, k = 10, from A: nothing moves, 10.0000; equilibria 0 on A 1.1000 and 10 on A 10.0000; 9.0909 and 1.0000 (observe 5)',
  (await order()) === '' && (await cv('cost')) === '10.0000' && (await cv('eqs')) === '0 on A: 1.1000; 10 on A: 10.0000' && (await cv('worst')) === '9.0909' && (await cv('best')) === '1.0000', await cv('eqs'))
await click(PANEL, 2, 'The hub')
await setSlider(PANEL, 2, 'k, the players', 4)
await sleep(60)
await click(PANEL, 2, 'To the end')
await sleep(60)
ok('Panel C exercise 5 (k = 4, ε = 0.1): 4, 3, 2, 1; cost 2.0833; ratio 1.8939', (await order()) === '4,3,2,1' && (await cv('cost')) === '2.0833' && (await cv('worst')) === '1.8939')

ok('no console errors (English)', p.errors.length === 0, p.errors.join(' | '))

// ---- Italian: a few readouts with the decimal comma
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/congestion-price-of-anarchy`, 1500)
const qv = (scope, k) => q.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
ok('Italian at 375 px: F1 prezzo dell’anarchia 1,3333; F2 1,3333; Panel A 1,0253; Panel B 1,2133; Panel C 2,6627',
  (await qv('pigou-readout', 'poa')) === '1,3333' && (await qv('braess-readout', 'ratio')) === '1,3333' && (await qv('parallel-readout', 'ratio')) === '1,0253' && (await qv('atomic-readout', 'pos')) === '1,2133' && (await qv('share-readout', 'worst')) === '2,6627')
ok('Italian Panel C names the hub: “0 all’hub: 2,9290”', (await qv('share-readout', 'eqs')) === '0 all’hub: 2,9290', await qv('share-readout', 'eqs'))
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
const heights = await q.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 375 px (IT): ${heights.join(', ')}`)
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0, q.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
