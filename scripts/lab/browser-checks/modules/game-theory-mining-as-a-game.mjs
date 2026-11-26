// Functional checks of Game Theory Lab module 13 "Mining as a game": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones in the lecture, the observe
// lists and the exercises (all pinned by check-game-theory-13.mjs). It also
// times the panels at their largest settings and checks a few Italian
// readouts at 375 px.
//
//   node modules/game-theory-mining-as-a-game.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const SLUG = 'mining-as-a-game'
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/${SLUG}`, 1500)

const PANEL = 'main section .space-y-14 > div'
const val = (scope, k, page = p) => page.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
const text = (sel, page = p) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim())
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
const ALPHA = 'α, her share of the hash rate'
const GAMMA = 'γ, the others who build on her block in a race'

// ---- Figure F1
const f1 = async () => ['p0', 'p0p', 'p1', 'rest', 'R', 'oA', 'oH'].map((k) => val('chain-readout', k)).reduce(async (a, b) => [...(await a), await b], [])
ok('F1 default (α = 0.35, γ = 0): p0 0.5036, p0′ 0.1146, p1 0.1762, rest 0.2056, R 0.3665, orphans 7.45 and 17.38; it pays', (await f1()).join(' ') === '0.5036 0.1146 0.1762 0.2056 0.3665 7.45 17.38' && (await text('[data-value="pays"]')).startsWith('R > α'), (await f1()).join(' '))
ok('F1 draws six states', (await p.$$('[data-role="chain-svg"] [data-node]')).length === 6)
await clickSel('[data-role="chain-third"]')
await sleep(30)
const third = (await f1()).join(' ')
ok('F1 α = 1/3: p0 0.5294 (9/17), p0′ 0.1176 (2/17), p1 0.1765 (3/17), R 0.3333; it does not pay (exercise 1)', third.startsWith('0.5294 0.1176 0.1765') && third.includes(' 0.3333 ') && (await text('[data-value="pays"]')).startsWith('R ≤ α'), third)
await setSlider('figure', 0, ALPHA, 0.4)
await sleep(30)
ok('F1 α = 0.4, γ = 0: R 0.4837, orphans 5.90 and 23.61 (lecture)', (await f1()).slice(4).join(' ') === '0.4837 5.90 23.61', (await f1()).join(' '))

// ---- Figure F2
ok('F2 thresholds: γ = 0 0.3333, 1/2 0.2500, 1 0.0000, slider γ = 1/4 0.3000 (exercise 2)',
  (await val('thr-readout', 'g0')).includes('α > 0.3333') && (await val('thr-readout', 'g0.5')).includes('α > 0.2500') && (await val('thr-readout', 'g1')).includes('α > 0.0000') && (await val('thr-readout', 'slider')).includes('γ = 1/4: α > 0.3000'),
  await val('thr-readout', 'slider'))
ok('F2 marks four thresholds', (await p.$$('[data-role="thr-chart"] [data-threshold]')).length === 4)
await clickSel('[data-role="thr-best"]')
await sleep(30)
ok('F2 with the best deviation: γ = 0 0.3294, γ = 1/4 0.3000 (the same as SM1)', (await val('thr-readout', 'g0')).includes('best deviation: 0.3294') && (await val('thr-readout', 'slider')).includes('best deviation: 0.3000'), await val('thr-readout', 'g0'))
await setSlider('figure', 1, GAMMA, 0.1)
await sleep(30)
ok('F2 γ = 0.10: 0.3214; not in the table, and the readout says so', (await val('thr-readout', 'slider')).includes('α > 0.3214') && (await val('thr-readout', 'slider')).includes('the table has'), await val('thr-readout', 'slider'))

// ---- Panel A
const row = async (k) => [await p.$eval(`[data-role="ra-table"] tr[data-row="${k}"] [data-value="sim"]`, (e) => e.innerText.trim()), await p.$eval(`[data-role="ra-table"] tr[data-row="${k}"] [data-value="exact"]`, (e) => e.innerText.trim())].join(' / ')
const ra = async () => [await row('share'), await row('oA'), await row('oH'), await row('chain')].join(' | ')
ok('Panel A default (α 0.4, γ 0, 100,000, run 1): 0.4903 ± 0.0046 / 0.4837, 5.84 ± 0.10 / 5.90, 24.01 ± 0.29 / 23.61, 70.14 / 70.49; lead 27 (observe 1)',
  (await ra()) === '0.4903 ± 0.0046 / 0.4837 | 5.84 ± 0.10 / 5.90 | 24.01 ± 0.29 / 23.61 | 70.14 / 70.49' && (await p.$eval('[data-value="lead"]', (e) => e.innerText)) === '27', await ra())
ok('Panel A strip: 40 events', (await p.$$('[data-role="ra-strip"] [data-what]')).length === 40)
{
  const ms = await timed(clickSrc('[data-role="ra-counts"] [data-count="1000000"]'))
  info(`timing: Panel A, 1,000,000 blocks: ${ms}`)
}
await sleep(30)
ok('Panel A 1,000,000 blocks: 0.4843 ± 0.0013, 5.89, 23.65, 70.46 (observe 2, exercise 3)', (await ra()).startsWith('0.4843 ± 0.0013 / 0.4837 | 5.89 ± ') && (await ra()).includes('23.65 ± ') && (await ra()).endsWith('70.46 / 70.49'), await ra())
await clickSel('[data-role="ra-counts"] [data-count="100000"]')
await setSlider(PANEL, 0, GAMMA, 1)
await sleep(30)
ok('Panel A γ = 1: no orphans of hers, 0.5736 ± 0.0038 / 0.5674, chain still 70.14 (observe 3)', (await ra()).startsWith('0.5736 ± 0.0038 / 0.5674 | 0.00 ± 0.00 / 0.00') && (await ra()).endsWith('70.14 / 70.49'), await ra())
await setSlider(PANEL, 0, GAMMA, 0)
await setSlider(PANEL, 0, ALPHA, 0.3)
await sleep(30)
ok('Panel A α = 0.3: 0.2733 ± 0.0027 / 0.2731 (observe 4)', (await row('share')) === '0.2733 ± 0.0027 / 0.2731', await row('share'))
{
  await clickSel('[data-role="ra-counts"] [data-count="1000000"]')
  await sleep(30)
  const ms = await timed(sliderSrc(PANEL, 0, ALPHA, 0.49))
  info(`timing: Panel A at its largest (1,000,000 blocks), a change of α to 0.49: ${ms}`)
  const ms2 = await timed(clickSrc('[data-role="ra-again"]'))
  info(`timing: Panel A, "Run again" at 1,000,000 blocks: ${ms2}`)
}

// ---- Panel B
const df = async () => ['before', 'after', 'first', 'even'].map((k) => val('df-readout', k)).reduce(async (a, b) => [...(await a), await b], [])
ok('Panel B default (α 0.4, γ 0, 60 days): 85.25%, 120.93%, 19.86, 33.86; day 60: 3,771 against 3,456, path 3,741 (observe 1, exercise 4)',
  (await df()).join(' ') === '85.25% 120.93% 19.86 33.86' && (await val('df-readout', 'end')) === 'Day 60: selfish 3,771 blocks expected, honest 3,456; this path 3,741.', `${(await df()).join(' ')} | ${await val('df-readout', 'end')}`)
await setSlider(PANEL, 1, ALPHA, 0.35)
await setSlider(PANEL, 1, 'horizon, days', 90)
await sleep(30)
ok('Panel B α 0.35, 90 days: 104.72%, break-even 102.62 beyond the horizon; 4,506 against 4,536 (observe 2)', (await df())[1] === '104.72%' && (await df())[3] === '102.62 (beyond 90 days)' && (await val('df-readout', 'end')).includes('selfish 4,506 blocks expected, honest 4,536'), (await df()).join(' '))
await setSlider(PANEL, 1, ALPHA, 0.33)
await sleep(30)
ok('Panel B α 0.33: 99.08%, never (observe 3)', (await df())[1] === '99.08%' && (await df())[3] === 'never (R ≤ α)', (await df()).join(' '))
await setSlider(PANEL, 1, ALPHA, 0.35)
await setSlider(PANEL, 1, GAMMA, 0.5)
await sleep(30)
ok('Panel B α 0.35, γ 0.5: 89.36%, 118.87%, 29.12 (observe 4)', (await df())[0] === '89.36%' && (await df())[1] === '118.87%' && (await df())[3] === '29.12', (await df()).join(' '))
await setSlider(PANEL, 1, ALPHA, 0.3)
await setSlider(PANEL, 1, GAMMA, 1)
await sleep(30)
ok('Panel B α 0.3, γ 1: 100.00%, 126.87%, 17.76, 17.76 (exercise 5)', (await df()).join(' ') === '100.00% 126.87% 17.76 17.76', (await df()).join(' '))
{
  const ms = await timed(sliderSrc(PANEL, 1, ALPHA, 0.49))
  info(`timing: Panel B, 90 days, a change of α to 0.49: ${ms}`)
  const ms2 = await timed(clickSrc('[data-role="df-again"]'))
  info(`timing: Panel B, "Another path": ${ms2}`)
}

// ---- Panel C
const cell = (alpha, k) => p.$eval(`[data-role="bp-table"] tr[data-alpha="${alpha}"] [data-value="${k}"]`, (e) => e.innerText.trim())
ok('Panel C default (γ = 0): α 0.350 SM1 0.3665, best 0.3708; threshold 0.3294 against 0.3333 (observe 1, exercise 6)', (await cell('0.350', 'sm1')) === '0.3665' && (await cell('0.350', 'opt')) === '0.3708' && (await text('[data-role="bp-threshold"]')).includes('α = 0.3294; SM1 from 0.3333'), await text('[data-role="bp-threshold"]'))
ok('Panel C α = 0.35, γ = 0: 19 reached cells differ; relevant (1, 2) is W and outlined (observe 2)', (await text('[data-role="bp-diff"]')) === '19 reached cells differ from SM1.' && (await p.$eval('[data-fork="relevant"] [data-cell="1,2"]', (e) => `${e.dataset.act}${e.dataset.differs}`)) === 'Wyes', await text('[data-role="bp-diff"]'))
ok('Panel C maps: three forks of 81 cells', (await p.$$('[data-role="bp-policy"] [data-cell]')).length === 243)
await clickSel('[data-palpha="0.3"]')
await sleep(30)
ok('Panel C α = 0.30, γ = 0: honest mining (observe 3)', (await text('[data-role="bp-diff"]')).startsWith('Honest mining is optimal here'))
await clickSel('[data-gamma="0.5"]')
await clickSel('[data-palpha="0.4"]')
await sleep(30)
ok('Panel C γ = 1/2: threshold 0.2500 for both; α 0.400 0.5256 against 0.5725; 68 cells differ; relevant (2, 1) is M, outlined (observe 4)',
  (await text('[data-role="bp-threshold"]')).includes('α = 0.2500; SM1 from 0.2500') && (await cell('0.400', 'sm1')) === '0.5256' && (await cell('0.400', 'opt')) === '0.5725' && (await text('[data-role="bp-diff"]')) === '68 reached cells differ from SM1.'
  && (await p.$eval('[data-fork="relevant"] [data-cell="2,1"]', (e) => `${e.dataset.act}${e.dataset.differs}`)) === 'Myes', await text('[data-role="bp-diff"]'))
await clickSel('[data-gamma="1"]')
await sleep(30)
ok('Panel C γ = 1: α 0.300 best 0.4286, SM1 0.3806 (observe 5)', (await cell('0.300', 'opt')) === '0.4286' && (await cell('0.300', 'sm1')) === '0.3806')
await clickSel('[data-gamma="0.25"]')
await sleep(30)
ok('Panel C γ = 1/4: α 0.325 best 0.3439, SM1 0.3436; no policy map stored (observe 6)', (await cell('0.325', 'opt')) === '0.3439' && (await cell('0.325', 'sm1')) === '0.3436' && (await text('[data-role="bp-policy"]')).startsWith('Policy maps are stored'))
{
  const ms = await timed(clickSrc('[data-gamma="0"]'))
  info(`timing: Panel C, a change of γ: ${ms}`)
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
const hEn = await p.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))
info(`figure heights at 1280 px (EN): ${hEn.join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/${SLUG}`, 1500)
ok('Italian at 375 px: F1 R 0,3665; F2 "α > 0,3000"; Panel A 0,4903 ± 0,0046; Panel B 85,25%; Panel C 0,3708',
  (await val('chain-readout', 'R', q)) === '0,3665' && (await val('thr-readout', 'slider', q)).includes('α > 0,3000') && (await q.$eval('[data-role="ra-table"] tr[data-row="share"] [data-value="sim"]', (e) => e.innerText.trim())) === '0,4903 ± 0,0046'
  && (await val('df-readout', 'before', q)) === '85,25%' && (await q.$eval('[data-role="bp-table"] tr[data-alpha="0,350"] [data-value="opt"]', (e) => e.innerText.trim())) === '0,3708',
  `${await val('chain-readout', 'R', q)}`)
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
for (const role of ['ra-table', 'bp-table', 'ra-strip']) {
  const fits = await q.$eval(`[data-role="${role}"]`, (t) => Math.round(t.getBoundingClientRect().right - document.documentElement.clientWidth))
  ok(`Italian at 375 px: ${role} fits the screen`, fits <= 0, `${fits}`)
}
info(`figure heights at 375 px (IT): ${(await q.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
const q2 = await newPage(ctx, { width: 1280, lang: 'it', admin: true })
await go(q2, `${site.url}${lab.basePath}/${SLUG}`, 1500)
info(`figure heights at 1280 px (IT): ${(await q2.$$eval('figure', (fs) => fs.map((f) => Math.round(f.getBoundingClientRect().height)))).join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0 && q2.errors.length === 0, [...q.errors, ...q2.errors].join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
