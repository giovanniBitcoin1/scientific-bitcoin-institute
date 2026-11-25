// Functional checks of Game Theory Lab module 10 "Coalitions: how to share
// the pie": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises (all pinned by
// check-game-theory-10.mjs). It also times Panel A at 5 players, Panel B with
// 30 players and "Split the largest", and Panel C's chart, and checks a few
// Italian readouts at 375 px.
//
//   node modules/game-theory-coalitions-sharing.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const SLUG = 'coalitions-sharing'
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/${SLUG}`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ').trim()
const val = (scope, k, page = p) => page.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
const attr = (sel, a, page = p) => page.$eval(sel, (e, x) => e.getAttribute(x), a)
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
const setInput = (sel, value) =>
  p.evaluate(
    (s, v) => {
      const input = document.querySelector(s)
      if (!input) throw new Error('no input ' + s)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    sel,
    value,
  )
const waitFor = async (fn, ms = 20000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(5)
  }
  return -1
}

// ---- Figure F1
const f1 = (k) => val('core-readout', k)
ok('F1 default (70, 60, 40): Shapley 125/3 (41.67), 95/3 (31.67), 80/3 (26.67), in the core; corners (60, 10, 30) (60, 40, 0) (30, 40, 30)',
  (await f1('shapley')) === '125/3 (41.67), 95/3 (31.67), 80/3 (26.67) · in the core' && (await f1('core')) === '3 corners: (60, 10, 30) (60, 40, 0) (30, 40, 30)', `${await f1('shapley')} | ${await f1('core')}`)
ok('F1 default division (34, 33, 33): only A and B object, by 3 (67 against 70)',
  (await f1('division')) === '(34, 33, 33)' && (await f1('objections')) === 'A and B object: they get 67, could make 70 (+3)', await f1('objections'))
await clickSel('[data-role="core-presets"] [data-preset="outside"]')
await sleep(40)
ok('F1 "Outside" (90, 60, 40): 45, 35, 20 outside the core; corners (60, 30, 10) (60, 40, 0) (50, 40, 10) (exercise 2)',
  (await f1('shapley')) === '45, 35, 20 · outside the core' && (await f1('core')) === '3 corners: (60, 30, 10) (60, 40, 0) (50, 40, 10)', `${await f1('shapley')} | ${await f1('core')}`)
await clickSel('[data-role="core-presets"] [data-preset="single"]')
await sleep(40)
ok('F1 "A single point" (80, 70, 50): the core is (50, 30, 20); Shapley still 125/3, 95/3, 80/3, outside',
  (await f1('core')) === 'a single point: (50, 30, 20)' && (await f1('shapley')) === '125/3 (41.67), 95/3 (31.67), 80/3 (26.67) · outside the core', await f1('core'))
await clickSel('[data-role="core-presets"] [data-preset="empty"]')
await sleep(40)
ok('F1 "Empty" (100, 100, 100): "the pairs ask for … = 150 > 100"; Shapley 100/3 each',
  (await f1('core')) === 'the core is empty: the pairs ask for (v(AB) + v(AC) + v(BC))/2 = 150 > 100' && (await f1('shapley')).startsWith('100/3 (33.33), 100/3 (33.33), 100/3 (33.33)'), await f1('core'))
for (const [k, l] of [[0, 'v(AB)'], [1, 'v(AC)'], [2, 'v(BC)']]) await setSlider('figure', 0, l, 60)
await sleep(40)
ok('F1 every pair 60: corners (40, 20, 40) (40, 40, 20) (20, 40, 40) (exercise 3)', (await f1('core')) === '3 corners: (40, 20, 40) (40, 40, 20) (20, 40, 40)', await f1('core'))
for (const l of ['v(AB)', 'v(AC)', 'v(BC)']) await setSlider('figure', 0, l, 80)
await sleep(40)
ok('F1 every pair 80: empty, the pairs ask for 120 (exercise 3)', (await f1('core')).endsWith('= 120 > 100'), await f1('core'))
await clickSel('[data-role="core-presets"] [data-preset="inside"]')
await p.evaluate(() => document.querySelector('[data-role="core-triangle"]').focus())
await p.keyboard.press('ArrowRight')
await p.keyboard.press('ArrowRight')
await p.keyboard.press('ArrowUp')
await sleep(40)
ok('F1 keys: → → ↑ from (34, 33, 33) give (32, 34, 34) (→ moves 1 from A to B; ↑ moves 1 to C from the larger of A and B, here B)', (await f1('division')) === '(32, 34, 34)', await f1('division'))
{
  // A click near the C corner (mouse, so no Move needed) moves the division there.
  const box = await p.$eval('[data-role="core-triangle"]', (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
  await p.mouse.click(box.x + box.w * 0.5, box.y + box.h * 0.2)
  await sleep(40)
  const d = (await f1('division')).slice(1, -1).split(', ').map(Number)
  ok('F1 mouse: a click near C moves the division there (whole numbers adding up to 100, C the largest)', d.length === 3 && d[0] + d[1] + d[2] === 100 && d[2] > 60 && d.every(Number.isInteger), d.join(', '))
  const o = await f1('objections')
  ok('F1 with C above 60 both A and B pairs object', o.includes('A and B object') && (await attr('[data-role="core-readout"] [data-value="objections"]', 'data-count')) !== '0', o)
}

// ---- Figure F2
const ss = () => p.$$eval('[data-role="votes-table"] [data-value="ss"]', (els) => els.map((e) => e.innerText.trim()).join(', '))
const SS = {
  9: '7/30, 7/30, 7/30, 1/10, 1/10, 1/10', 10: '4/15, 4/15, 4/15, 1/10, 1/10, 0', 11: '7/30, 7/30, 7/30, 1/10, 1/10, 1/10', 12: '7/30, 7/30, 7/30, 3/20, 3/20, 0',
  13: '13/60, 13/60, 13/60, 7/60, 7/60, 7/60', 14: '3/10, 3/10, 3/10, 1/20, 1/20, 0', 15: '4/15, 4/15, 4/15, 1/15, 1/15, 1/15', 16: '1/5, 1/5, 1/5, 1/5, 1/5, 0', 17: '1/6, 1/6, 1/6, 1/6, 1/6, 1/6',
}
const got = []
let luxOk = true
for (const q of Object.keys(SS)) {
  await setSlider('figure', 1, 'Quota (of 17 votes)', q)
  await sleep(30)
  got.push(await ss())
  const zero = (await attr('[data-role="votes-lux"]', 'data-zero')) === 'yes'
  if (zero !== (Number(q) % 2 === 0)) luxOk = false
}
ok('F2 Shapley–Shubik at quotas 9 to 17 as the self-check', got.join(' | ') === Object.values(SS).join(' | '), got.join(' | '))
ok("F2 Luxembourg's line says 0 exactly at the even quotas 10, 12, 14, 16", luxOk)
await setSlider('figure', 1, 'Quota (of 17 votes)', 12)
await sleep(30)
const bz = await p.$$eval('[data-role="votes-table"] [data-value="bz"]', (els) => els.map((e) => e.innerText.trim()).join(', '))
ok('F2 quota 12: Banzhaf 0.2381 ×3, 0.1429 ×2, 0.0000', bz === '0.2381, 0.2381, 0.2381, 0.1429, 0.1429, 0.0000', bz)

// ---- Panel A
const ca = (k) => val('ca-readout', k)
const caPreset = async (id, size) => {
  await clickSel(`[data-role="ca-presets"] [data-preset="${id}"]`)
  if (size) await clickSel(`[data-role="ca-sizes"] [data-size="${size}"]`)
  await sleep(40)
}
ok('Panel A default (the partners): Shapley over 6 orders; superadditive, not convex; minimum 85; core point 50, 30, 20; Shapley in the core (observe 1)',
  (await ca('shapley')) === '125/3 (41.67), 95/3 (31.67), 80/3 (26.67)' && (await ca('tests')) === 'Superadditive: yes · Convex: no' && (await ca('core')) === 'minimum 85, v(N) = 100: the core is nonempty' && (await ca('point')) === '50, 30, 20' && (await ca('shapleyIn')) === 'yes',
  `${await ca('core')} | ${await ca('point')}`)
await caPreset('partners90')
ok('Panel A partners with v(AB) = 90: 45, 35, 20; minimum 95; "no: AB would get 10 more" (observe 2)', (await ca('shapley')) === '45, 35, 20' && (await ca('core')).startsWith('minimum 95') && (await ca('shapleyIn')) === 'no: AB would get 10 more on its own', await ca('shapleyIn'))
const maj = []
for (const n of [3, 4, 5]) {
  await caPreset('majority', n)
  maj.push(`${await ca('core')} | ${await ca('least')}`)
}
ok('Panel A majority 3, 4, 5: empty (minimum 3/2, 4/3, 5/3); least core ε = 1/3, 1/4, 2/5 (observe 3)',
  maj[0].startsWith('minimum 3/2, v(N) = 1: the core is empty | ε = 1/3 (0.33)') && maj[1].startsWith('minimum 4/3, v(N) = 1: the core is empty | ε = 1/4 (0.25)') && maj[2].startsWith('minimum 5/3, v(N) = 1: the core is empty | ε = 2/5 (0.40)'), maj.join(' || '))
await caPreset('gloves3')
ok('Panel A gloves L L R: 1/6, 1/6, 2/3; core point 0, 0, 1; the core is the corner of player 3 (exercise 4)', (await ca('shapley')) === '1/6 (0.17), 1/6 (0.17), 2/3 (0.67)' && (await ca('point')) === '0, 0, 1' && (await attr('[data-role="ca-triangle"] [data-role="core-area"]', 'data-corners')) === '1')
await caPreset('gloves5')
ok('Panel A gloves L L R R R: 13/20, 13/20, 7/30 ×3; core point 1, 1, 0, 0, 0 (observe 4)', (await ca('shapley')) === '13/20 (0.65), 13/20 (0.65), 7/30 (0.23), 7/30 (0.23), 7/30 (0.23)' && (await ca('point')) === '1, 1, 0, 0, 0', await ca('shapley'))
await caPreset('airport')
ok('Panel A airport: cost shares 10/3, 35/6, 125/6; savings game convex; in the core (observe 5)', (await ca('shapley')) === '10/3 (3.33), 35/6 (5.83), 125/6 (20.83)' && (await ca('tests')) === 'Superadditive: yes · Convex: yes' && (await ca('shapleyIn')) === 'yes' && (await ca('core')).includes('v(N) = 25'), await ca('shapley'))
await caPreset('unanimity', 5)
ok('Panel A unanimity of 1 and 2, n = 5: 1/2, 1/2, 0, 0, 0 (observe 6)', (await ca('shapley')) === '1/2 (0.50), 1/2 (0.50), 0, 0, 0', await ca('shapley'))
{
  // Timing at 5 players: edit v(N) and wait for the readout.
  const before = await ca('shapley')
  const t0 = Date.now()
  await setInput('[data-role="ca-table"] input[data-mask="31"]', 2)
  const t = await waitFor(async () => (await ca('shapley')) !== before)
  info(`timing: Panel A at 5 players, one edit to the new readout: ${t} ms (call to readout ${Date.now() - t0} ms)`)
  // The extra 1 of v(N) goes to whoever arrives last: 1/5 to each player.
  ok('Panel A edit at 5 players: v(N) = 2 gives 7/10, 7/10, 1/5, 1/5, 1/5 and the note says "Edited by you."', (await ca('shapley')) === '7/10 (0.70), 7/10 (0.70), 1/5 (0.20), 1/5 (0.20), 1/5 (0.20)' && (await p.$eval('[data-role="ca-note"]', (e) => e.innerText)).includes('Edited by you.'), await ca('shapley'))
}

// ---- Panel B
const vb = (k) => val('vb-readout', k)
const col = (k) => p.$$eval(`[data-role="vb-table"] [data-value="${k}"]`, (els) => els.map((e) => e.innerText.trim()))
ok('Panel B default (1958 Council, 12): S–S 0.2333 ×3, 0.1500 ×2, 0.0000; absolute 0.3125, 0.1875, 0; 3 largest; 42 swings (observe 1)',
  (await col('ss')).join(' ') === '0.2333 0.2333 0.2333 0.1500 0.1500 0.0000' && (await col('abs')).join(' ') === '0.3125 0.3125 0.3125 0.1875 0.1875 0.0000' && (await vb('needed')) === '3' && (await vb('swings')) === '42')
await clickSel('[data-role="vb-presets"] [data-preset="parties"]')
await sleep(40)
ok('Panel B 49–49–2: 0.3333 each on both indices (observe 2)', (await col('ss')).join(' ') === '0.3333 0.3333 0.3333' && (await col('bz')).join(' ') === '0.3333 0.3333 0.3333')
await clickSel('[data-role="vb-presets"] [data-preset="pools"]')
await sleep(60)
const pools = async () => [(await col('ss')).slice(0, 6).join(' '), (await col('bz')).slice(0, 6).join(' '), await vb('needed')]
const P = {}
for (const q of [26, 34, 51, 67]) {
  await clickSel(`[data-role="vb-quotas"] [data-quota="${q}"]`)
  await sleep(60)
  P[q] = await pools()
}
ok('Panel B pools at 51: S–S 0.3030 0.2031 0.2031 0.0584 0.0584 0.0087; Banzhaf 0.3322 0.2209 0.2209 0.0579 0.0579 0.0055; 3 largest (observe 3)',
  P[51][0] === '0.3030 0.2031 0.2031 0.0584 0.0584 0.0087' && P[51][1] === '0.3322 0.2209 0.2209 0.0579 0.0579 0.0055' && P[51][2] === '3', P[51].join(' | '))
ok('Panel B pools at 26, 34, 67: 0.3673 first at 26; 34 and 67 equal (0.2820 0.1743 0.1743 0.0895 0.0895 0.0095); 1, 2, 4 largest (observe 4)',
  P[26][0].startsWith('0.3673') && P[34][0] === '0.2820 0.1743 0.1743 0.0895 0.0895 0.0095' && P[34][0] === P[67][0] && P[34][1] === P[67][1] && P[26][2] === '1' && P[34][2] === '2' && P[67][2] === '4', `${P[26][0]} | ${P[34][0]} | ${P[67][0]}`)
await clickSel('[data-role="vb-quotas"] [data-quota="51"]')
await sleep(40)
{
  const t0 = Date.now()
  await clickSel('[data-role="vb-split"]')
  const t = await waitFor(async () => (await p.$$('[data-role="vb-split-line"]')).length > 0)
  info(`timing: Panel B "Split the largest" with 25 → 26 players: ${t} ms (call to readout ${Date.now() - t0} ms)`)
  const s = (await col('ss')).slice(0, 7).join(' ')
  ok('Panel B split at 51: 0.1293 0.1293 0.2047 0.2047 0.0745 0.0745 0.0092; "together they now have 0.2586 … against 0.3030" (observe 5)',
    s === '0.1293 0.1293 0.2047 0.2047 0.0745 0.0745 0.0092' && (await p.$eval('[data-role="vb-split-line"]', (e) => e.innerText)).includes('0.2586 (Shapley–Shubik), against 0.3030'), s)
}
{
  // Up to 30 players: add four, time a quota change and a split, then the button is off.
  for (let k = 0; k < 3; k++) await p.evaluate(() => [...document.querySelectorAll('[data-role="vb-weights"] button')].find((b) => b.textContent.trim().toLowerCase() === 'add a player').click())
  await sleep(40)
  await setInput('[data-role="vb-quota"]', 40)
  await sleep(40)
  const before = (await col('ss')).join(' ')
  const t0 = Date.now()
  await setInput('[data-role="vb-quota"]', 50)
  const t = await waitFor(async () => (await col('ss')).join(' ') !== before)
  const n = (await col('ss')).length
  info(`timing: Panel B with ${n} players, a quota change to the new table: ${t} ms (call to readout ${Date.now() - t0} ms)`)
  const t1 = Date.now()
  await clickSel('[data-role="vb-split"]')
  const t2 = await waitFor(async () => (await col('ss')).length === 30)
  info(`timing: Panel B "Split the largest" from 29 to 30 players: ${t2} ms (call to readout ${Date.now() - t1} ms)`)
  const sum = (await col('ss')).reduce((s, x) => s + Number(x), 0)
  ok('Panel B at 30 players: indices shown for all 30, adding up to 1 (within the rounding of 30 four-digit numbers), and "Split the largest" is off', n === 29 && (await col('ss')).length === 30 && Math.abs(sum - 1) < 0.002 && (await p.$eval('[data-role="vb-split"]', (e) => e.disabled)), `${n}, sum ${sum.toFixed(4)}`)
}

// ---- Panel C
const row = (r) => p.$$eval(`[data-role="ec-table"] tr[data-rule="${r}"] td[data-value]`, (els) => els.map((e) => e.innerText.trim()).join(', '))
const allRows = async () => [await row('proportional'), await row('cea'), await row('cel'), await row('talmud'), await row('shapley')]
const r200 = await allRows()
ok('Panel C default (100, 200, 300; 200): proportional 33.33, 66.67, 100.00; CEA 66.67 ×3; CEL 0.00, 50.00, 150.00; Talmud 50.00, 75.00, 75.00; Shapley 33.33, 83.33, 83.33 (observe 1, exercise 6)',
  r200.join(' | ') === '33.33, 66.67, 100.00 | 66.67, 66.67, 66.67 | 0.00, 50.00, 150.00 | 50.00, 75.00, 75.00 | 33.33, 83.33, 83.33', r200.join(' | '))
await clickSel('[data-role="ec-presets"] [data-estate="100"]')
await sleep(30)
const t100 = await row('talmud')
await clickSel('[data-role="ec-presets"] [data-estate="300"]')
await sleep(30)
const t300 = await row('talmud')
ok('Panel C estates 100 and 300: Talmud 33.33 each, then 50, 100, 150 (observe 2)', t100 === '33.33, 33.33, 33.33' && t300 === '50.00, 100.00, 150.00' && (await row('proportional')) === t300 && (await row('shapley')) === t300)
await setSlider(PANEL, 2, 'Estate E (at most D = 600)', 450)
await sleep(30)
ok('Panel C E = 450: Talmud 50, 150, 250 = CEL; Shapley 66.67, 141.67, 241.67 (observe 4)', (await row('talmud')) === '50.00, 150.00, 250.00' && (await row('cel')) === '50.00, 150.00, 250.00' && (await row('shapley')) === '66.67, 141.67, 241.67')
{
  // Each claim change recomputes the five divisions and the chart (E = 0 to D
  // in steps of 5); timed inside the page, up to the second animation frame.
  const ms = await p.evaluate(async (s) => {
    const root = document.querySelectorAll(s)[2]
    const t0 = performance.now()
    for (const k of [1, 2, 3]) {
      const lab = [...root.querySelectorAll('label')].find((x) => x.innerText.trim() === `Claim d${k}`)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '500')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    }
    return Math.round(performance.now() - t0)
  }, PANEL)
  info(`timing: Panel C, three claims moved to 500 one after the other (D up to 1,500, the chart redrawn each time): ${ms} ms in all`)
  ok('Panel C at claims 500, 500, 500 and E = 450: every rule gives 150 each', (await allRows()).every((r) => r === '150.00, 150.00, 150.00'), (await allRows()).join(' | '))
  await clickSel('[data-role="ec-table"] tr[data-rule="shapley"] button')
  await sleep(30)
  ok('Panel C chart follows the chosen rule ("Shapley")', (await p.$eval('[data-role="ec-rule"]', (e) => e.innerText)).startsWith('Shapley (random arrival)'))
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/${SLUG}`, 1500)
ok('Italian at 375 px: F1 "125/3 (41,67); 95/3 (31,67); 80/3 (26,67) · nel nucleo"; F2 Lussemburgo 0; Panel A "minimo 85"; Panel B 0,2333; Panel C Talmud 50,00, 75,00, 75,00',
  (await val('core-readout', 'shapley', q)) === '125/3 (41,67); 95/3 (31,67); 80/3 (26,67) · nel nucleo' && (await attr('[data-role="votes-lux"]', 'data-zero', q)) === 'yes'
  && (await val('ca-readout', 'core', q)).startsWith('minimo 85') && (await q.$$eval('[data-role="vb-table"] [data-value="ss"]', (els) => els[0].innerText.trim())) === '0,2333'
  && (await q.$$eval('[data-role="ec-table"] tr[data-rule="talmud"] td[data-value]', (els) => els.map((e) => e.innerText.trim()).join(' '))) === '50,00 75,00 75,00',
  await val('core-readout', 'shapley', q))
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
