// Functional checks of Game Theory Lab module 09 "Games on networks": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones in the lecture, the observe
// lists and the exercises. It also times Panel A's "Best responses" on the
// grid, Panel B's removal and Panel C's "To the end" at n = 12, and checks a
// few Italian readouts at 375 px.
//
//   node modules/game-theory-games-on-networks.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/games-on-networks`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ').trim()
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
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
const clickSel = (sel) =>
  p.evaluate((s) => {
    const e = document.querySelector(s)
    if (!e) throw new Error('no element ' + s)
    e.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, sel)
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

// ---- Figure F1
const f1 = (k) => val('star-readout', k)
const sizes = () => attrs('[data-role="star-net"] [data-player]', 'data-effort')
ok('F1 default δ = 0.25: hub 2.6667 (8/3), leaf 1.6667 (5/3), total 9.3333; best responses agree; complements',
  (await f1('hub')) === '2.6667' && (await f1('leaf')) === '1.6667' && (await f1('total')) === '9.3333' && (await f1('br')).startsWith('agree (1e-9)') && (await f1('regime')).startsWith('complements'),
  `${await f1('hub')} ${await f1('leaf')} ${await f1('br')}`)
const F1 = { '-0.45': '0.0000 1.0000 4.0000', '-0.25': '0.0000 1.0000 4.0000', '-0.2': '0.2381 0.9524 4.0476', '-0.1': '0.6250 0.9375 4.3750', 0: '1.0000 1.0000 5.0000', 0.1: '1.4583 1.1458 6.0417', 0.3: '3.4375 2.0313 11.5625', 0.45: '14.7368 7.6316 45.2632' }
const got = []
let allAgree = true
for (const d of Object.keys(F1)) {
  await setSlider('figure', 0, 'δ, the effect of a neighbour’s effort', d)
  await sleep(50)
  got.push(`${await f1('hub')} ${await f1('leaf')} ${await f1('total')}`)
  if (!(await f1('br')).startsWith('agree (1e-9)')) allAgree = false
}
ok('F1 at δ = −0.45, −0.25, −0.2, −0.1, 0, 0.1, 0.3, 0.45: hub, leaf, total as the self-check, and best responses agree at each', got.join(' | ') === Object.values(F1).join(' | ') && allAgree, got.join(' | '))
await setSlider('figure', 0, 'δ, the effect of a neighbour’s effort', -0.25)
await sleep(50)
ok('F1 δ = −0.25: the hub stops (regime), node sizes 0 and 1 (exercise 1)', (await f1('regime')).includes('the hub does nothing') && (await sizes()).join(' ') === '0.0000 1.0000 1.0000 1.0000 1.0000')
await setSlider('figure', 0, 'δ, the effect of a neighbour’s effort', 0.25)

// ---- Figure F2
const f2 = (k) => val('formation-readout', k)
const regionAt = async () => p.$eval('[data-role="formation-readout"] [data-value="region"]', (e) => e.getAttribute('data-region'))
ok('F2 default (n = 6, (0.50, 0.40)): star efficient and stable; totals 3.00, 6.00, 0.00; the star is pairwise stable',
  (await f2('point')) === '(0.50, 0.40)' && (await regionAt()) === 'star-stable' && (await f2('totals')) === '3.00, 6.00, 0.00' && (await f2('efficient')) === 'the star' && (await f2('stable')) === 'yes',
  `${await f2('point')} ${await f2('totals')}`)
await p.evaluate(() => document.querySelector('[data-role="formation-plane"]').focus()) // an SVG: page.focus wants an HTMLElement
for (let i = 0; i < 20; i++) await p.keyboard.press('ArrowDown')
await sleep(50)
ok('F2 arrow keys: 20 × down gives (0.50, 0.20): complete efficient and the only stable one; 9.00 against 8.00; the star not stable, two leaves gain by linking (exercise 5)',
  (await f2('point')) === '(0.50, 0.20)' && (await regionAt()) === 'complete' && (await f2('totals')) === '9.00, 8.00, 0.00' && (await f2('efficient')) === 'the complete network' && (await f2('stable')).includes('two leaves'), `${await f2('point')} ${await f2('totals')}`)
for (let i = 0; i < 50; i++) await p.keyboard.press('ArrowUp')
await sleep(50)
ok('F2 (0.50, 0.70): star efficient but not stable; star 3.00; the hub gains by cutting (exercise 5)',
  (await f2('point')) === '(0.50, 0.70)' && (await regionAt()) === 'star-unstable' && (await f2('totals')).split(', ')[1] === '3.00' && (await f2('stable')).includes('the hub'))
for (let i = 0; i < 50; i++) await p.keyboard.press('ArrowUp')
await sleep(50)
ok('F2 (0.50, 1.20): empty efficient; the star −2.00 (exercise 5)', (await f2('point')) === '(0.50, 1.20)' && (await regionAt()) === 'empty' && (await f2('totals')).split(', ')[1] === '−2.00' && (await f2('efficient')) === 'the empty network')
await setSlider('figure', 1, 'n, the players', 8)
await p.evaluate(() => document.querySelector('[data-role="formation-plane"]').focus())
for (let i = 0; i < 80; i++) await p.keyboard.press('ArrowDown')
await sleep(50)
ok('F2 n = 8, (0.50, 0.40): star efficient, 11.90 (self-check)', (await f2('point')) === '(0.50, 0.40)' && (await f2('totals')).split(', ')[1] === '11.90' && (await regionAt()) === 'star-stable')
const regions = await attrs('[data-role="formation-plane"] [data-region]', 'data-region')
ok('F2 draws the four regions', regions.join(' ') === 'complete star-stable star-unstable empty', regions.join(' '))

// ---- Panel A
const av = (k) => val('pg-readout', k)
await click(PANEL, 0, 'Specialized equilibria')
await sleep(60)
const sets = async () => p.$$eval('[data-role="pg-list"] [data-set]', (b) => b.map((x) => x.getAttribute('data-set') + (x.getAttribute('data-stable') === 'yes' ? '*' : '')).join(' '))
ok('Panel A line of 5: four sets, {1, 3, 5} the only stable one (observe 1, exercise 2)', (await sets()) === '{1, 3, 5}* {1, 4} {2, 4} {2, 5}', await sets())
await clickSel('[data-role="pg-list"] [data-set="{1, 4}"]')
await sleep(50)
ok('Panel A {1, 4}: total 2.0000, specialized, an equilibrium, not stable', (await av('total')) === '2.0000' && (await av('specialized')) === 'yes' && (await av('equilibrium')) === 'yes' && (await av('stable')) === 'no')
const runEnds = []
for (let k = 1; k <= 5; k++) {
  await click(PANEL, 0, 'Best responses')
  await sleep(40)
  runEnds.push(`${await av('total')}/${await av('specialized')}/${await av('stable')}`)
}
ok('Panel A line runs 1–4 end at total 3 (stable), run 5 at total 2, not specialized, an equilibrium (observe 2)',
  runEnds.slice(0, 4).every((x) => x === '3.0000/yes/yes') && runEnds[4] === '2.0000/no/no' && (await av('equilibrium')) === 'yes' && (await av('efforts')) === '0.4470, 0.5530, 0.0000, 0.9149, 0.0851', `${runEnds.join(' ')} ${await av('efforts')}`)
await click(PANEL, 0, 'Star of 6')
await sleep(40)
await click(PANEL, 0, 'Best responses')
await sleep(40)
ok('Panel A star of 6, run 1: leaves work, total 5.0000, stable, 2 turns (observe 3)', (await av('total')) === '5.0000' && (await av('stable')) === 'yes' && (await role('pg-status')).includes('2 turns') && (await av('efforts')) === '0.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000')
await click(PANEL, 0, 'Specialized equilibria')
await sleep(40)
ok('Panel A star of 6 list: {2, 3, 4, 5, 6} stable (5), {1} (1)', (await sets()) === '{2, 3, 4, 5, 6}* {1}')
await click(PANEL, 0, 'Ring of 6')
await click(PANEL, 0, 'Specialized equilibria')
await sleep(40)
ok('Panel A ring: {1, 3, 5} and {2, 4, 6} stable, the opposite pairs not (exercise 3)', (await sets()) === '{1, 3, 5}* {2, 4, 6}* {1, 4} {2, 5} {3, 6}', await sets())
await click(PANEL, 0, '3 × 3 grid')
await click(PANEL, 0, 'Specialized equilibria')
await sleep(40)
const gridSets = (await sets()).split(' {')
ok('Panel A grid: ten sets, {1, 3, 5, 7, 9} and {2, 4, 6, 8} stable', gridSets.length === 10 && (await sets()).startsWith('{1, 3, 5, 7, 9}* {2, 4, 6, 8}*'))
let tA = 0
for (let k = 1; k <= 5; k++) {
  const t0 = Date.now()
  await click(PANEL, 0, 'Best responses')
  const w = await waitFor(async () => (await role('pg-status')).startsWith(`Run no. ${k}:`), 5000)
  tA = Math.max(tA, w)
  info(`timing: Panel A "Best responses" on the grid, run ${k}: ${w} ms (call to readout ${Date.now() - t0} ms)`)
}
ok('Panel A grid run 5: not specialized, total 3.0000, an equilibrium; player 2 at 1, players 4 and 7 0.5427 and 0.4573 (observe 5)',
  (await av('specialized')) === 'no' && (await av('total')) === '3.0000' && (await av('equilibrium')) === 'yes' && (await av('efforts')) === '0.0000, 1.0000, 0.0000, 0.5427, 0.0000, 0.0786, 0.4573, 0.0000, 0.9214', await av('efforts'))

// ---- Panel B
const bv = (k) => val('kp-readout', k)
const rv = (k) => val('kp-removed', k)
const tab = () => p.$$eval('[data-role="kp-table"] tbody tr', (r) => r.map((x) => [...x.querySelectorAll('[data-value]')].map((c) => c.innerText).join('/')))
ok('Panel B bridge δ = 0.3: λ 2.3475, 0.4260; total 26.8779; rankings 1, 4, 5, … and 4, 1, 5, … (observe 1)',
  (await bv('lambda')) === '2.3475, 0.4260' && (await bv('total')) === '26.8779' && (await bv('byEffort')) === '1, 4, 5, 2, 3, 6, 7, 8, 9' && (await bv('byInter')) === '4, 1, 5, 2, 3, 6, 7, 8, 9')
const t3 = await tab()
ok('Panel B table at 0.3: efforts and intercentralities as the self-check',
  t3.join(' ') === '4.1655/10.9163 3.2138/7.4260 3.2138/7.4260 4.1241/11.3988 3.4600/8.4355 2.7882/6.1645 2.0380/3.6831 2.0380/3.6831 1.8365/3.0288', t3.join(' '))
const tb0 = Date.now()
await clickSel('[data-role="kp-net"] [data-player="4"]')
const tB = await waitFor(async () => !!(await p.$('[data-role="kp-removed"]')), 5000)
info(`timing: Panel B removal of player 4: ${tB} ms (call to readout ${Date.now() - tb0} ms)`)
ok('Panel B remove player 4: new total 15.4791, drop 11.3988 = intercentrality (observe 2)', (await rv('newTotal')) === '15.4791' && (await rv('drop')) === '11.3988' && (await rv('inter')) === '11.3988' && (await rv('equal')).startsWith('yes'))
await click(PANEL, 1, 'Restore')
await sleep(40)
await clickSel('[data-role="kp-table"] tbody tr[data-player="1"]')
await sleep(40)
ok('Panel B remove player 1 (from the table): 15.9616, drop 10.9163 (observe 2)', (await rv('newTotal')) === '15.9616' && (await rv('drop')) === '10.9163' && (await rv('equal')).startsWith('yes'))
await click(PANEL, 1, 'Restore')
await sleep(30)
let allEqual = true
for (let i = 1; i <= 9; i++) {
  await clickSel(`[data-role="kp-table"] tbody tr[data-player="${i}"]`)
  await sleep(30)
  if (!(await p.$('[data-role="kp-removed"]')) || !(await rv('equal')).startsWith('yes')) allEqual = false
  await click(PANEL, 1, 'Restore')
  await sleep(20)
}
ok('Panel B every removal on the bridge at 0.3: drop = b_i²/m_ii', allEqual)
await setSlider(PANEL, 1, 'δ, complements', 0.1)
await sleep(50)
const t1 = await tab()
ok('Panel B δ = 0.1: player 4 most active (1.4013) and key (1.9038; player 1 1.8784) (observe 3, exercise 4)', t1[3] === '1.4013/1.9038' && t1[0].endsWith('/1.8784') && (await bv('byEffort')).startsWith('4,') && (await bv('byInter')).startsWith('4,'), `${t1[3]} ${t1[0]}`)
await setSlider(PANEL, 1, 'δ, complements', 0.26)
await sleep(40)
const at26 = await bv('byEffort')
await setSlider(PANEL, 1, 'δ, complements', 0.27)
await sleep(40)
ok('Panel B the most active changes between 0.26 (4) and 0.27 (1); the key player stays 4', at26.startsWith('4,') && (await bv('byEffort')).startsWith('1,') && (await bv('byInter')).startsWith('4,'))
await setSlider(PANEL, 1, 'δ, complements', 0.99)
await sleep(40)
const maxAttr = await p.evaluate((s) => {
  const lab = [...document.querySelectorAll(s)[1].querySelectorAll('label')].find((x) => x.innerText.trim() === 'δ, complements')
  return document.getElementById(lab.htmlFor).max
}, PANEL)
ok('Panel B the slider ends at 0.42 on the bridge; total 517.6051 there (observe 4)', maxAttr === '0.42' && (await bv('total')) === '517.6051', `${maxAttr} ${await bv('total')}`)
await setSlider(PANEL, 1, 'δ, complements', 0.3)
for (const [net, want] of [['Line of 5', '3,'], ['Star of 6', '1,'], ['Ring of 6', '1,']]) {
  await click(PANEL, 1, net)
  await sleep(40)
  ok(`Panel B ${net} at 0.3: key player first in ${want}`, (await bv('byInter')).startsWith(want))
}
ok('Panel B ring of 6: λ 2.0000, 0.5000; total 15.0000; the slider ends at 0.49', (await bv('lambda')) === '2.0000, 0.5000' && (await bv('total')) === '15.0000' && (await tab()).every((r) => r === '2.5000/4.9863'))
await click(PANEL, 1, 'Line of 5')
await sleep(40)
ok('Panel B line of 5: total 10.0137, player 3 4.2994 (observe 5)', (await bv('total')) === '10.0137' && (await tab())[2].endsWith('/4.2994'))

// ---- Panel C
const cv = (k) => val('nf-readout', k)
const st = () => role('nf-status')
await click(PANEL, 2, 'To the end')
await sleep(60)
ok('Panel C defaults (8, 0.5, 0.4, empty, run 1): 31 steps, 13 changes (11 added, 2 cut); 9 links; 3, 3, 3, 2, 2, 2, 2, 1; 9.80 against 11.90; pairwise stable (observe 1)',
  (await st()).includes('31 steps, 13 changes (11 links added, 2 cut)') && (await st()).includes('pairwise stable') && (await cv('links')) === '9' && (await cv('degrees')) === '3, 3, 3, 2, 2, 2, 2, 1' && (await cv('total')) === '9.80' && (await cv('efficient')) === '11.90' && (await cv('stable')) === 'yes',
  await st())
const totals = []
for (let k = 2; k <= 5; k++) {
  await click(PANEL, 2, 'New run')
  await click(PANEL, 2, 'To the end')
  await sleep(40)
  totals.push(await cv('total'))
}
ok('Panel C runs 2–5: 10.50, 9.80, 10.50, 9.60 (observe 2)', totals.join(' ') === '10.50 9.80 10.50 9.60', totals.join(' '))
await click(PANEL, 2, 'New run') // run 6: back to run 1 needs a reload, so the c checks use the run in hand
await setSlider(PANEL, 2, 'c, the cost of a link to each end', 0.2)
let allComplete = true
for (const s of ['empty', 'complete', 'random (p = 0.3)']) {
  await click(PANEL, 2, s)
  await click(PANEL, 2, 'To the end')
  await sleep(40)
  if ((await cv('links')) !== '28' || (await cv('total')) !== '16.80') allComplete = false
}
ok('Panel C c = 0.2: every start ends complete, 28 links, 16.80 (observe 3)', allComplete)
await setSlider(PANEL, 2, 'c, the cost of a link to each end', 1.5)
let allEmpty = true
for (const s of ['empty', 'complete', 'random (p = 0.3)']) {
  await click(PANEL, 2, s)
  await click(PANEL, 2, 'To the end')
  await sleep(40)
  if ((await cv('links')) !== '0' || (await cv('stable')) !== 'yes') allEmpty = false
}
ok('Panel C c = 1.5: every start ends empty (observe 5)', allEmpty)
ok('no console errors (English)', p.errors.length === 0, p.errors.join(' | '))

// A fresh page for the runs no. 1 of observe 4 and 6 and for the timing.
const r = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(r, `${site.url}${lab.basePath}/games-on-networks`, 1500)
const rcv = (k) => r.$eval(`[data-role="nf-readout"] [data-value="${k}"]`, (e) => e.innerText.trim())
const rst = async () => flat(await r.$eval('[data-role="nf-status"]', (e) => e.innerText))
const rclick = (label) => r.evaluate((s, l) => {
  const b = [...document.querySelectorAll(s)[2].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
  if (!b) throw new Error('no button ' + l)
  b.click()
}, PANEL, label)
const rslider = (label, v) => r.evaluate((s, l, x) => {
  const lab = [...document.querySelectorAll(s)[2].querySelectorAll('label')].find((y) => y.innerText.trim() === l)
  const input = document.getElementById(lab.htmlFor)
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(x))
  input.dispatchEvent(new Event('input', { bubbles: true }))
}, PANEL, label, v)
await rslider('c, the cost of a link to each end', 0.6)
await sleep(40)
await rclick('To the end')
await sleep(40)
ok('Panel C c = 0.6 from empty: 0 steps, stays empty (observe 4, exercise 6)', (await rst()).includes('0 steps') && (await rcv('links')) === '0' && (await rcv('stable')) === 'yes')
await rclick('complete')
await rclick('To the end')
await sleep(40)
ok('Panel C c = 0.6 from complete, run 1: 155 steps, 28 cut, ends empty; the star 9.10 (observe 4)', (await rst()).includes('155 steps, 28 changes (0 links added, 28 cut)') && (await rcv('links')) === '0' && (await rcv('efficient')) === '9.10', await rst())
await rclick('empty')
await rslider('c, the cost of a link to each end', 0.4)
await rslider('n, the players', 12)
await sleep(40)
const tc0 = Date.now()
await rclick('To the end')
const tC = await waitFor(async () => (await rst()).includes('pairwise stable'), 20000)
info(`timing: Panel C "To the end" at n = 12: ${tC} ms (call to readout ${Date.now() - tc0} ms)`)
ok('Panel C n = 12, run 1 from empty: 359 steps, 20 links, 26.25 against 29.70 (observe 6)', (await rst()).includes('359 steps') && (await rcv('links')) === '20' && (await rcv('total')) === '26.25' && (await rcv('efficient')) === '29.70', await rst())
ok('no console errors (second page)', r.errors.length === 0, r.errors.join(' | '))
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/games-on-networks`, 1500)
const qv = (scope, k) => q.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
ok('Italian at 375 px: F1 2,6667 and 1,6667; F2 3,00, 6,00, 0,00 and “stella efficiente e stabile a coppie”; Panel B 26,8779 and 2,3475, 0,4260; Panel C “sì” not yet pressed',
  (await qv('star-readout', 'hub')) === '2,6667' && (await qv('star-readout', 'leaf')) === '1,6667' && (await qv('formation-readout', 'totals')) === '3,00, 6,00, 0,00' && (await qv('formation-readout', 'region')) === 'stella efficiente e stabile a coppie'
  && (await qv('kp-readout', 'total')) === '26,8779' && (await qv('kp-readout', 'lambda')) === '2,3475, 0,4260' && (await qv('nf-readout', 'stable')) === 'non ancora',
  `${await qv('formation-readout', 'totals')} | ${await qv('kp-readout', 'lambda')}`)
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
const heights = await q.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 375 px (IT): ${heights.join(', ')}`)
const q2 = await newPage(ctx, { width: 1280, lang: 'it', admin: true })
await go(q2, `${site.url}${lab.basePath}/games-on-networks`, 1500)
info(`figure heights at 1280 px (IT): ${(await q2.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0 && q2.errors.length === 0, [...q.errors, ...q2.errors].join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
