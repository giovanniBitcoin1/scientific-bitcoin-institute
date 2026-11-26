// Functional checks of Game Theory Lab module 12 "Designing the rules": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones in the lecture, the
// observe lists and the exercises (all pinned by check-game-theory-12.mjs).
// It also times the panels at their largest settings and checks a few
// Italian readouts at 375 px.
//
//   node modules/game-theory-mechanism-design.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const SLUG = 'mechanism-design'
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/${SLUG}`, 1500)

const PANEL = 'main section .space-y-14 > div'
const val = (scope, k, page = p) => page.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
const clickSel = (sel, page = p) =>
  page.evaluate((s) => {
    const e = document.querySelector(s)
    if (!e) throw new Error('no element ' + s)
    e.click()
  }, sel)
const setSlider = (root, k, label, value, page = p) =>
  page.evaluate(
    (s, i, l, v) => {
      const r = document.querySelectorAll(s)[i]
      const lab = [...r.querySelectorAll('label')].find((x) => x.innerText.trim() === l)
      if (!lab) throw new Error('no slider ' + l)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    root,
    k,
    label,
    value,
  )
// Time a change: until React has updated the DOM, and until the second
// animation frame (headless frame scheduling makes the latter vary).
const timed = (fn, page = p) =>
  page.evaluate(async (src) => {
    const t0 = performance.now()
    // eslint-disable-next-line no-new-func
    new Function(src)()
    await new Promise((r) => setTimeout(r, 0))
    const t1 = performance.now()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    return `${Math.round(t1 - t0)} ms (second frame ${Math.round(performance.now() - t0)} ms)`
  }, fn)
const sliderSrc = (root, k, label, v) => `
  const r = document.querySelectorAll(${JSON.stringify(root)})[${k}]
  const lab = [...r.querySelectorAll('label')].find((x) => x.innerText.trim() === ${JSON.stringify(label)})
  const input = document.getElementById(lab.htmlFor)
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(String(v))})
  input.dispatchEvent(new Event('input', { bubbles: true }))`
const clickSrc = (sel) => `document.querySelector(${JSON.stringify(sel)}).click()`

// ---- Figure F1
const f1 = async () => [await val('area-readout', 'x'), await val('area-readout', 'p'), await val('area-readout', 'payoff')].join(' ')
ok('F1 default (one object, h = 60, b = 80): x 1.0000, p 60.0000, payoff 20.0000 (exercise 1)', (await f1()) === '1.0000 60.0000 20.0000', await f1())
ok('F1 shades the payoff and the payment', (await p.$$('[data-role="area-keep"]')).length === 1 && (await p.$$('[data-role="area-pay"]')).length === 1)
await clickSel('[data-role="area-rule"] [data-rule="slots"]')
await setSlider('figure', 0, 'b, your bid', 100)
await sleep(30)
const s100 = await f1()
await setSlider('figure', 0, 'b, your bid', 45)
await sleep(30)
ok('F1 two slots, α2 = 0.8: b = 100: 1, 36, 64; b = 45: 0.8, 24, 12', s100 === '1.0000 36.0000 64.0000' && (await f1()) === '0.8000 24.0000 12.0000', `${s100} | ${await f1()}`)
await clickSel('[data-role="area-rule"] [data-rule="lottery"]')
const LOT = []
for (const b of [25, 50, 100]) {
  await setSlider('figure', 0, 'b, your bid', b)
  await sleep(30)
  LOT.push(await f1())
}
ok('F1 lottery, H = 50: b = 25: 0.3333, 3.6066, 4.7267; b = 50: 0.5, 9.6574, 15.3426; b = 100: 0.6667, 21.5973, 45.0694', LOT.join(' | ') === '0.3333 3.6066 4.7267 | 0.5000 9.6574 15.3426 | 0.6667 21.5973 45.0694', LOT.join(' | '))

// ---- Figure F2
const f2 = async () => [await val('trade-readout', 'chance'), await val('trade-readout', 'gains'), await val('trade-readout', 'budget')].join(' ')
const marks = () => p.$$eval('[data-role="trade-marks"] li', (ls) => ls.map((l) => l.dataset.ok).join(','))
ok('F2 default (trade whenever v ≥ c): 0.5000, 16.67, −16.67; marks yes, yes, yes, no (exercise 6)', (await f2()) === '0.5000 16.67 −16.67' && (await marks()) === 'yes,yes,yes,no', `${await f2()} ${await marks()}`)
await clickSel('[data-role="trade-rule"] [data-rule="posted"]')
await sleep(30)
const post50 = await f2()
await setSlider('figure', 1, 'p, the posted price', 30)
await sleep(30)
ok('F2 posted price 50: 0.2500, 12.50, 0.00; at 30: 0.2100, 10.50; marks no, yes, yes, yes', post50 === '0.2500 12.50 0.00' && (await f2()) === '0.2100 10.50 0.00' && (await marks()) === 'no,yes,yes,yes', `${post50} | ${await f2()}`)
await clickSel('[data-role="trade-rule"] [data-rule="split"]')
await sleep(30)
ok('F2 split the difference: 0.2813 (9/32), 14.06, 0.00', (await f2()) === '0.2813 14.06 0.00' && (await marks()) === 'no,yes,yes,yes', await f2())

// ---- Panel A
const tp = async () => [await val('tp-readout', 'truth'), await val('tp-readout', 'best'), await val('tp-readout', 'ok')].join(' | ')
ok('Panel A default (one object, h = 60, Myerson, v = 80): truth 20.00, best 20.00 at 60.1–100.0, yes (observe 1)', (await tp()) === '20.00 | 20.00 at r = 60.1–100.0 | yes', await tp())
await clickSel('[data-role="tp-pay"] [data-pay="bid"]')
await sleep(30)
ok('Panel A pay your bid: truth 0.00, best 19.90 at 60.1, no (observe 2)', (await tp()) === '0.00 | 19.90 at r = 60.1 | no', await tp())
await clickSel('[data-role="tp-alloc"] [data-alloc="slots"]')
await clickSel('[data-role="tp-pay"] [data-pay="gsp"]')
await setSlider(PANEL, 0, 'v, your true value', 100)
await sleep(30)
const gsp8 = await tp()
const th = await val('tp-readout', 'threshold')
await clickSel('[data-role="tp-pay"] [data-pay="myerson"]')
await sleep(30)
const my8 = await tp()
ok('Panel A slots, v = 100: GSP truth 40.00, best 56.00 at 30.1–59.9, no; threshold 0.5714; Myerson 64.00, yes (observe 3, exercise 2)', gsp8 === '40.00 | 56.00 at r = 30.1–59.9 | no' && th.includes('α2 ≤ 0.5714') && my8.startsWith('64.00 | 64.00') && my8.endsWith('yes'), `${gsp8} || ${th} || ${my8}`)
await clickSel('[data-role="tp-pay"] [data-pay="gsp"]')
await setSlider(PANEL, 0, 'α2, clicks of the second slot', 0.5)
await sleep(30)
ok('Panel A slots, α2 = 0.5, GSP: the truth is best, 40.00 (observe 3)', (await tp()).startsWith('40.00 | 40.00') && (await tp()).endsWith('yes'), await tp())
await clickSel('[data-role="tp-alloc"] [data-alloc="lottery"]')
await setSlider(PANEL, 0, 'v, your true value', 80)
await sleep(30)
const lotM = await tp()
await clickSel('[data-role="tp-pay"] [data-pay="bid"]')
await sleep(30)
ok('Panel A lottery, v = 80: Myerson 32.22 at 80.0 only; pay your bid 18.75 at 30.6 (observe 4); the GSP pill is gone and Myerson is used', lotM === '32.22 | 32.22 at r = 80.0 | yes' && (await tp()) === '0.00 | 18.75 at r = 30.6 | no' && (await p.$$('[data-role="tp-pay"] [data-pay="gsp"]')).length === 0, `${lotM} || ${await tp()}`)
await clickSel('[data-role="tp-pay"] [data-pay="myerson"]')
await clickSel('[data-role="tp-alloc"] [data-alloc="middle"]')
const MID = []
for (const v of [70, 50, 30]) {
  await setSlider(PANEL, 0, 'v, your true value', v)
  await sleep(30)
  MID.push(await tp())
}
ok('Panel A "win only in the middle": v = 70 truth 20, best 30 at 40.0–59.9; v = 50 10 / 20; v = 30 0 / 20 (observe 5, exercise 3)', MID[0] === '20.00 | 30.00 at r = 40.0–59.9 | no' && MID[1].startsWith('10.00 | 20.00') && MID[2].startsWith('0.00 | 20.00'), MID.join(' || '))
await clickSel('[data-role="tp-alloc"] [data-alloc="reserve"]')
await setSlider(PANEL, 0, 'v, your true value', 40)
await sleep(30)
const r40 = await tp()
await setSlider(PANEL, 0, 'v, your true value', 80)
await sleep(30)
ok('Panel A reserve 50: v = 40 keeps 0 with reports 0.0–49.9 (observe 6); v = 80 keeps 30', r40 === '0.00 | 0.00 at r = 0.0–49.9 | yes' && (await tp()).startsWith('30.00 | 30.00'), `${r40} || ${await tp()}`)
{
  await clickSel('[data-role="tp-alloc"] [data-alloc="lottery"]')
  const ms = await timed(sliderSrc(PANEL, 0, 'v, your true value', 63))
  info(`timing: Panel A, a change of v (lottery, 1,001 reports): ${ms}`)
}

// ---- Panel B
const vp = (i, k) => p.$eval(`[data-role="vp-table"] tr[data-bidder="${i}"] [data-value="${k}"]`, (e) => e.innerText.trim())
const rev = () => val('vp-readout', 'revenue')
const leave = () => p.$$eval('[data-role="vp-leave"] li', (ls) => ls.map((l) => l.innerText.split(':').pop().trim()).join(','))
const row = async (i) => `${await vp(i, 'gets')} ${await vp(i, 'pays')} ${await vp(i, 'payoff')}`
ok('Panel B default "Two items, three bidders": A to 1, B to 2; pays 5, 4, 0; revenue 9; without each bidder 7, 5, 7 (observe 1)',
  (await row(1)) === 'A 5 3' && (await row(2)) === 'B 4 2' && (await row(3)) === '— 0 0' && (await rev()) === '9' && (await leave()) === '7,5,7', `${await row(1)} | ${await row(2)} | ${await rev()} | ${await leave()}`)
await clickSel('[data-role="vp-presets"] [data-preset="lonely"]')
await sleep(30)
ok('Panel B "The lonely auction": A to 2, B to 3, revenue 0; without bidder 3, 4 (observe 2, exercise 4)', (await vp(2, 'gets')) === 'A' && (await vp(3, 'gets')) === 'B' && (await rev()) === '0' && (await leave()).split(',')[2] === '4', `${await rev()} ${await leave()}`)
await clickSel('[data-role="vp-presets"] [data-preset="names"]')
await sleep(30)
const one = await row(2)
await clickSel('[data-role="vp-names"] [data-names="two"]')
await sleep(30)
ok('Panel B "Two names": as one person AB, pays 4, keeps 2; as two names she gets AB for 0 and keeps 6, revenue 0 (observe 3, exercise 5)', one === 'AB 4 2' && (await p.$eval('[data-role="vp-person"]', (e) => e.innerText)).includes('gets AB, worth 6 to her, pays 0: payoff 6') && (await rev()) === '0', `${one} | ${await p.$eval('[data-role="vp-person"]', (e) => e.innerText)}`)
await clickSel('[data-role="vp-presets"] [data-preset="collude"]')
await sleep(30)
const col = `${await row(2)} | ${await row(3)}`
await clickSel('[data-role="vp-truth"]')
await sleep(30)
ok('Panel B "Losers collude": 2 and 3 win A and B, pay 0, keep 1 each; with bids = values bidder 1 wins AB, pays 2, keeps 2 (observe 4)', col === 'A 0 1 | B 0 1' && (await row(1)) === 'AB 2 2', `${col} || ${await row(1)}`)
{
  // AB is raised to the larger single bid; four bidders.
  await clickSel('[data-n="4"]')
  await sleep(30)
  const setCell = (label, v) => p.evaluate((l, x) => {
    const input = document.querySelector(`[data-role="vp-table"] input[aria-label="${l}"]`)
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(x))
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, label, v)
  await setCell('Bidder 4 bids A', 9)
  await sleep(30)
  const ab = await p.$eval('[data-role="vp-table"] input[aria-label="Bidder 4 bids AB"]', (e) => e.value)
  ok('Panel B four bidders: a bid of 9 for A raises AB to 9; bidder 4 wins A and pays the harm she does', ab === '9' && (await vp(4, 'gets')) === 'A' && (await p.$$('[data-role="vp-table"] tr[data-bidder]')).length === 4, `${ab} ${await row(4)}`)
}

// ---- Panel C
const cell = (rule, k) => p.$eval(`[data-role="cp-table"] td[data-rule="${rule}"] [data-value="${k}"]`, (e) => e.innerText.trim())
const cp = async (rule) => [await cell(rule, 'honest'), await cell(rule, 'cheat'), await cell(rule, 'servedCheat'), await cell(rule, 'usersHonest'), await cell(rule, 'usersCheat')].join(' ')
ok('Panel C default (20, 10): uniform honest 475.21, cheating 546.62 = monopolistic, served 9.22, users 262.51 → 153.77; pay your bid 476.15 both; all 10,000 blocks equal (observe 1, 3)',
  (await cp('uniform')) === '475.21 546.62 9.22 262.51 153.77' && (await cell('monopolistic', 'honest')) === '546.62' && (await cell('pyb', 'honest')) === '476.15' && (await cell('pyb', 'cheat')) === '476.15'
  && (await p.$eval('[data-role="cp-same"]', (e) => e.innerText)).includes('10,000 of 10,000'), `${await cp('uniform')} | ${await p.$eval('[data-role="cp-same"]', (e) => e.innerText)}`)
ok('Panel C one fake: 523.81 instead of 476.19, a gain of 47.62 (observe 2, exercise 7)', (await p.$eval('[data-role="cp-fake"]', (e) => e.innerText)).includes('523.81 instead of 476.19, a gain of 47.62'))
await setSlider(PANEL, 2, 'k, the slots in the block', 20)
await sleep(40)
ok('Panel C k = 20: honest 0.00, cheating 578.47, served 11.06, users 999.23 → 211.75; one fake 95.24 (observe 4)', (await cp('uniform')) === '0.00 578.47 11.06 999.23 211.75' && (await p.$eval('[data-role="cp-fake"]', (e) => e.innerText)).includes('95.24 instead of 0.00'), await cp('uniform'))
await setSlider(PANEL, 2, 'k, the slots in the block', 1)
await sleep(40)
ok('Panel C k = 1: cheating 95.23 against 90.45; the winner keeps 0.00 (observe 5)', (await cell('uniform', 'cheat')) === '95.23' && (await cell('uniform', 'honest')) === '90.45' && (await cell('uniform', 'usersCheat')) === '0.00')
{
  await setSlider(PANEL, 2, 'k, the slots in the block', 21)
  await sleep(40)
  ok('Panel C k = 21 > n: no k-th bid, the single-fake line says so', (await p.$eval('[data-role="cp-fake"]', (e) => e.innerText)).startsWith('Uniform price: with k > n there is no k-th bid'))
  const msN = await timed(sliderSrc(PANEL, 2, 'n, the users', 40))
  info(`timing: Panel C, n from 20 to 40 (k = 21, 10,000 blocks): ${msN}`)
  const msK = await timed(sliderSrc(PANEL, 2, 'k, the slots in the block', 60))
  info(`timing: Panel C at its largest (n = 40, k = 60, 10,000 blocks), a change of k: ${msK}`)
  const msK2 = await timed(sliderSrc(PANEL, 2, 'k, the slots in the block', 39))
  info(`timing: Panel C n = 40, k = 39 (the bid table rebuilt), a change of k: ${msK2}`)
  const msA = await timed(clickSrc('[data-role="cp-again"]'))
  info(`timing: Panel C, "Run again" at n = 40, k = 39: ${msA}`)
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/${SLUG}`, 1500)
ok('Italian at 375 px: F1 60,0000; F2 16,67; Panel A "20,00 con r = 60,1–100,0"; Panel B revenue 9; Panel C 546,62',
  (await val('area-readout', 'p', q)) === '60,0000' && (await val('trade-readout', 'gains', q)) === '16,67' && (await val('tp-readout', 'best', q)) === '20,00 con r = 60,1–100,0'
  && (await val('vp-readout', 'revenue', q)) === '9' && (await q.$eval('[data-role="cp-table"] td[data-rule="uniform"] [data-value="cheat"]', (e) => e.innerText.trim())) === '546,62',
  `${await val('tp-readout', 'best', q)}`)
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
const tableFits = await q.$eval('[data-role="vp-table"]', (t) => Math.round(t.getBoundingClientRect().right - t.parentElement.getBoundingClientRect().right))
ok('Italian at 375 px: Panel B\'s table fits its box', tableFits <= 0, `${tableFits}`)
info(`figure heights at 375 px (IT): ${(await q.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
const q2 = await newPage(ctx, { width: 1280, lang: 'it', admin: true })
await go(q2, `${site.url}${lab.basePath}/${SLUG}`, 1500)
info(`figure heights at 1280 px (IT): ${(await q2.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0 && q2.errors.length === 0, [...q.errors, ...q2.errors].join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
