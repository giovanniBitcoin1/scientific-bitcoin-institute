// Functional checks of Game Theory Lab module 11 "Auctions": the two live
// figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones in the lecture, the observe
// lists and the exercises (all pinned by check-game-theory-11.mjs). It also
// times the three panels at their largest settings and Panel C's revenue
// chart, and checks a few Italian readouts at 375 px.
//
//   node modules/game-theory-auctions.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const SLUG = 'auctions'
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
// Time a change inside the page: until React has updated the DOM (the
// computation and the render: a task after the event), and until the second
// animation frame (which in headless Chrome also waits for frame scheduling,
// so it varies from run to run; a trace showed about 50 ms of script in a
// 250–1,000 ms wait). Returns "X ms (second frame Y ms)".
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
const f1 = (k) => val('truth-readout', k)
ok('F1 default (second price, v = 60, h = 50, b = 60): "you win and pay 50: payoff 10"; b = v is a best bid, every bid above 50 gives 10',
  (await f1('bid')) === 'you win and pay 50: payoff 10' && (await f1('best')) === 'b = v is a best bid whatever h is: here every bid above 50 gives 10.', await f1('best'))
await setSlider('figure', 0, 'h, the highest other bid', 70)
await setSlider('figure', 0, 'b, your bid', 80)
await sleep(30)
ok('F1 exercise 1: h = 70, b = 80: "you win and pay 70: payoff −10"; at b = v: "you lose: payoff 0"', (await f1('bid')) === 'you win and pay 70: payoff −10' && (await f1('truth')) === 'you lose: payoff 0', `${await f1('bid')} | ${await f1('truth')}`)
await setSlider('figure', 0, 'h, the highest other bid', 50)
await setSlider('figure', 0, 'b, your bid', 40)
await sleep(30)
ok('F1 exercise 1: h = 50, b = 40: "you lose: payoff 0"; at b = v: payoff 10', (await f1('bid')) === 'you lose: payoff 0' && (await f1('truth')) === 'you win and pay 50: payoff 10')
await setSlider('figure', 0, 'b, your bid', 50)
await sleep(30)
ok('F1 a tie (b = h = 50): won half the time, payoff 5', (await f1('bid')) === 'a tie, won half the time: payoff 5', await f1('bid'))
await clickSel('[data-role="truth-rule"] [data-rule="first"]')
await setSlider('figure', 0, 'b, your bid', 55)
await sleep(30)
ok('F1 first price, v = 60, h = 50: b = 55 pays 55, payoff 5; b = v gives 0; the best bid is "just above h = 50"', (await f1('bid')) === 'you win and pay 55: payoff 5' && (await f1('truth')) === 'you win and pay 60: payoff 0' && (await f1('best')).startsWith('The best bid is just above h = 50'), await f1('best'))
{
  // A mouse click on the chart moves h (mouse, so no Move needed); then → moves it by 1.
  await p.$eval('[data-role="truth-chart"]', (e) => e.scrollIntoView({ block: 'center' }))
  await sleep(30)
  const box = await p.$eval('[data-role="truth-chart"] svg', (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
  // x = 38 + (80/100)(320 − 46) in the 320-wide viewBox: h = 80.
  await p.mouse.click(box.x + (box.w * (38 + 0.8 * 274)) / 320, box.y + box.h * 0.5)
  await sleep(30)
  const h1 = await f1('best')
  await p.evaluate(() => document.querySelector('[data-role="truth-chart"]').focus())
  await p.keyboard.press('ArrowLeft')
  await sleep(30)
  ok('F1 mouse: a click at bid 80 on the chart sets h = 80 (no bid gives more than 0 at v = 60); ← then gives h = 79', h1.startsWith('No bid gives more than 0') && (await p.evaluate(() => [...document.querySelectorAll('figure')[0].querySelectorAll('label')].find((l) => l.innerText.startsWith('h,')).parentElement.innerText)).includes('79'), h1)
}

// ---- Figure F2
const f2 = async () => [await val('shading-readout', 'bid'), await val('shading-readout', 'chance'), await val('shading-readout', 'payoff')].join(' ')
ok('F2 default (n = 2, v = 80): 40.00, 0.8000, 32.0000 (exercise 2)', (await f2()) === '40.00 0.8000 32.0000', await f2())
const F2 = []
for (const [n, v] of [[5, 80], [2, 50], [3, 30], [10, 100]]) {
  await setSlider('figure', 1, 'n, the bidders', n)
  await setSlider('figure', 1, 'v, your value', v)
  await sleep(30)
  F2.push(await f2())
}
ok('F2 (5, 80) 64.00 0.4096 6.5536; (2, 50) 25.00 0.5000 12.5000; (3, 30) 20.00 0.0900 0.9000; (10, 100) 90.00 1.0000 10.0000', F2.join(' | ') === '64.00 0.4096 6.5536 | 25.00 0.5000 12.5000 | 20.00 0.0900 0.9000 | 90.00 1.0000 10.0000', F2.join(' | '))

// ---- Panel A
const ra = (k) => val('ra-readout', k)
const raRow = (fm) => p.$$eval(`[data-role="ra-table"] tr[data-format="${fm}"] td[data-value]`, (els) => els.map((e) => e.innerText.trim()).join(' | '))
ok('Panel A default (n = 2, first price, 10,000, run 1): 33.26 ± 0.12 (exact 33.33), sd 11.81 (11.79); bidders 33.26 (observe 1)',
  (await ra('mean')) === '33.26 ± 0.12' && (await ra('meanExact')) === '33.33' && (await ra('sd')) === '11.81' && (await ra('sdExact')) === '11.79' && (await ra('bidders')) === '33.26', await ra('mean'))
ok('Panel A table: second price 33.12 ± 0.24, sd 23.55 (23.57); all-pay 33.17 ± 0.21, sd 21.11 (21.08) (observe 1)',
  (await raRow('second')) === '33.12 ± 0.24 | 33.33 | 23.55 | 23.57' && (await raRow('allpay')) === '33.17 ± 0.21 | 33.33 | 21.11 | 21.08', `${await raRow('second')} || ${await raRow('allpay')}`)
await setSlider(PANEL, 0, 'r, the reserve price', 50)
await sleep(40)
ok('Panel A reserve 50: first 41.46, second 41.44 (exact 41.67), no sale 0.2538 (0.2500), bidders 16.59 (observe 3)',
  (await ra('mean')).startsWith('41.46') && (await raRow('second')).startsWith('41.44') && (await ra('meanExact')) === '41.67' && (await ra('none')) === '0.2538' && (await ra('noneExact')) === '0.2500' && (await ra('bidders')) === '16.59', `${await ra('mean')} ${await ra('none')} ${await ra('bidders')}`)
await setSlider(PANEL, 0, 'r, the reserve price', 0)
await setSlider(PANEL, 0, 'n, the bidders', 3)
await sleep(40)
ok('Panel A three bidders: 49.74 (first), 49.94 (second), exact 50.00 (observe 4)', (await ra('mean')).startsWith('49.74') && (await raRow('second')).startsWith('49.94') && (await ra('meanExact')) === '50.00')
await setSlider(PANEL, 0, 'n, the bidders', 10)
await sleep(40)
ok('Panel A ten bidders: exact 81.82; exact sd 7.47, 11.13, 56.46 (observe 5)', (await ra('meanExact')) === '81.82' && (await raRow('first')).endsWith('7.47') && (await raRow('second')).endsWith('11.13') && (await raRow('allpay')).endsWith('56.46'), `${await raRow('first')} || ${await raRow('allpay')}`)
{
  const ms = await timed(clickSrc('[data-role="ra-counts"] [data-count="100000"]'))
  info(`timing: Panel A at its largest (n = 10, 100,000 auctions, the three formats), the click to the new readout: ${ms}`)
  const ms2 = await timed(clickSrc('[data-role="ra-again"]'))
  info(`timing: Panel A, "Run again" at n = 10 and 100,000 auctions: ${ms2}`)
  await clickSel('[data-role="ra-formats"] [data-format="allpay"]')
  await sleep(40)
  ok('Panel A all-pay at n = 10: the reserve is greyed and the histogram spans 0–200', (await p.$eval('[data-role="ra-reserve"]', (e) => e.className)).includes('opacity-50') && (await p.$eval('[data-role="ra-bids"]', (e) => e.innerText)).startsWith('All-pay'))
}
await setSlider(PANEL, 0, 'n, the bidders', 2)
await clickSel('[data-role="ra-formats"] [data-format="first"]')
await clickSel('[data-role="ra-again"]') // back to... run 3; the observe value is run 1
await sleep(40)
{
  // Reload to get run no. 1 at 100,000 auctions.
  await go(p, `${site.url}${lab.basePath}/${SLUG}`, 1500)
  await clickSel('[data-role="ra-counts"] [data-count="100000"]')
  await sleep(60)
  ok('Panel A at 100,000 auctions, two bidders, first price: 33.33 ± 0.04 (observe 6)', (await ra('mean')) === '33.33 ± 0.04', await ra('mean'))
}

// ---- Panel B
const wc = (k) => val('wc-readout', k)
ok('Panel B default (n = 5, a = 10, first, k = 0): −6.64 ± 0.03 (−6.67); loses 0.9691 (0.9688); too high 0.9691; revenue 157.11 (156.67) (observe 1)',
  (await wc('profit')) === '−6.64 ± 0.03' && (await wc('profitExact')) === '−6.67' && (await wc('lose')) === '0.9691' && (await wc('loseExact')) === '0.9688' && (await wc('high')) === '0.9691' && (await wc('revenueExact')) === '156.67', `${await wc('profit')} ${await wc('lose')}`)
await clickSel('[data-role="wc-presets"] [data-preset="even"]')
await sleep(30)
ok('Panel B "Break even": exact profit 0.00, loses 0.5913 (0.5981) (observe 2)', (await wc('profitExact')) === '0.00' && (await wc('lose')) === '0.5913' && (await wc('loseExact')) === '0.5981', await wc('lose'))
await clickSel('[data-role="wc-presets"] [data-preset="eq"]')
await sleep(30)
ok('Panel B "Equilibrium": 3.36 (3.33), never loses, revenue 147.11 (146.67) (observe 3)', (await wc('profit')).startsWith('3.36') && (await wc('profitExact')) === '3.33' && (await wc('lose')) === '0.0000' && (await wc('revenue')) === '147.11' && (await wc('revenueExact')) === '146.67')
await clickSel('[data-role="wc-formats"] [data-format="second"]')
await clickSel('[data-role="wc-presets"] [data-preset="zero"]')
await sleep(30)
const sec0 = await wc('profit')
await clickSel('[data-role="wc-presets"] [data-preset="eq"]')
await sleep(30)
ok('Panel B second price: k = 0 gives −3.30 (−3.33); equilibrium discount 6.00, revenue 147.77 (147.33) (observe 4)', sec0.startsWith('−3.30') && (await p.$eval('[data-role="wc-lines"] [data-value="eq"]', (e) => e.innerText)).includes(': 6.00,') && (await wc('revenue')) === '147.77' && (await wc('revenueExact')) === '147.33', sec0)
await clickSel('[data-role="wc-formats"] [data-format="first"]')
await clickSel('[data-role="wc-presets"] [data-preset="zero"]')
const wcN = []
for (const n of [2, 12]) {
  await setSlider(PANEL, 1, 'n, the bidders', n)
  await sleep(30)
  wcN.push(`${await wc('profit')} (${await wc('profitExact')})`)
}
ok('Panel B n = 2 and 12, first price, k = 0: −3.31 (−3.33) and −8.45 (−8.46) (observe 5)', wcN[0].startsWith('−3.31') && wcN[0].endsWith('(−3.33)') && wcN[1].startsWith('−8.45') && wcN[1].endsWith('(−8.46)'), wcN.join(' | '))
{
  await setSlider(PANEL, 1, 'a, the largest error (±a)', 25)
  const ms = await timed(sliderSrc(PANEL, 1, 'k, the discount (bid = estimate − k)', 7))
  info(`timing: Panel B at its largest (n = 12, a = 25, 10,000 auctions), a change of k: ${ms}`)
  await sleep(30)
  ok('Panel B a = 25, n = 12, k = 7: exact profit 7 − 25·11/13 = −14.15', (await wc('profitExact')) === '−14.15', await wc('profitExact'))
}

// ---- Panel C
const cell = (rule, k) => p.$eval(`[data-role="bp-table"] td[data-rule="${rule}"] [data-value="${k}"]`, (e) => e.innerText.trim())
const bp = async (rule) => `${await cell(rule, 'mean')} ${await cell(rule, 'sd')} ${await cell(rule, 'served')}`
ok('Panel C default (20, 10): pay your bid 476.15 sd 20.77; uniform 475.21 sd 106.56 (exact 106.48); monopolistic 546.62, 9.22 served; exact 476.19 (observe 1)',
  (await bp('pyb')) === '476.15 20.77 10.00' && (await bp('uniform')) === '475.21 106.56 10.00' && (await bp('monopolistic')) === '546.62 92.61 9.22' && (await cell('pyb', 'meanExact')) === '476.19' && (await cell('uniform', 'sdExact')) === '106.48',
  `${await bp('pyb')} | ${await bp('uniform')} | ${await bp('monopolistic')}`)
await setSlider(PANEL, 2, 'k, the slots in the block', 20)
await sleep(40)
ok('Panel C k = 20: nothing for pay your bid and the uniform price; monopolistic 578.47, 11.06 served; the "room for everyone" line (observe 3)', (await cell('pyb', 'mean')) === '0.00' && (await cell('uniform', 'mean')) === '0.00' && (await cell('monopolistic', 'mean')) === '578.47' && (await cell('monopolistic', 'served')) === '11.06' && (await p.$$('[data-role="bp-room"]')).length === 1)
await setSlider(PANEL, 2, 'k, the slots in the block', 1)
await sleep(40)
ok('Panel C k = 1: pay your bid 90.47 (exact 90.48) (observe 5)', (await cell('pyb', 'mean')) === '90.47' && (await cell('pyb', 'meanExact')) === '90.48')
{
  await setSlider(PANEL, 2, 'k, the slots in the block', 10)
  const msN = await timed(sliderSrc(PANEL, 2, 'n, the users', 40))
  info(`timing: Panel C, n from 20 to 40 (10,000 blocks and the revenue chart, k = 1 … 80, recomputed): ${msN}`)
  const msK = await timed(sliderSrc(PANEL, 2, 'k, the slots in the block', 39))
  info(`timing: Panel C at its largest (n = 40, k = 39, 10,000 blocks), a change of k: ${msK}`)
  const msA = await timed(clickSrc('[data-role="bp-again"]'))
  info(`timing: Panel C, "Run again" at n = 40, k = 39: ${msA}`)
  await sleep(30)
  ok('Panel C n = 40, k = 39: exact 100·39·1/41 = 95.12', (await cell('pyb', 'meanExact')) === '95.12', await cell('pyb', 'meanExact'))
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/${SLUG}`, 1500)
ok('Italian at 375 px: F1 "vinci e paghi 50: payoff 10"; F2 40,00; Panel A 33,26 ± 0,12; Panel B −6,64 ± 0,03; Panel C 476,15',
  (await val('truth-readout', 'bid', q)) === 'vinci e paghi 50: payoff 10' && (await val('shading-readout', 'bid', q)) === '40,00' && (await val('ra-readout', 'mean', q)) === '33,26 ± 0,12'
  && (await val('wc-readout', 'profit', q)) === '−6,64 ± 0,03' && (await q.$eval('[data-role="bp-table"] td[data-rule="pyb"] [data-value="mean"]', (e) => e.innerText.trim())) === '476,15',
  await val('truth-readout', 'bid', q))
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
info(`figure heights at 375 px (IT): ${(await q.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
const q2 = await newPage(ctx, { width: 1280, lang: 'it', admin: true })
await go(q2, `${site.url}${lab.basePath}/${SLUG}`, 1500)
info(`figure heights at 1280 px (IT): ${(await q2.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0 && q2.errors.length === 0, [...q.errors, ...q2.errors].join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
