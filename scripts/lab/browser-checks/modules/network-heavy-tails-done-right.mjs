// Functional checks of Network Lab module 05 "Heavy tails, done right": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-05.mjs pins down in Node). It also reports how
// long the experiment of Panel A and the bootstrap of Panel C take.
//
//   node modules/network-heavy-tails-done-right.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/heavy-tails-done-right`, 1500)
await settle(p)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const figText = async (i) => flat(await p.evaluate((k) => document.querySelectorAll('figure')[k].innerText, i))
const readout = async (panel, name) =>
  flat(await p.evaluate((sel, k, n) => document.querySelectorAll(sel)[k].querySelector(`[data-readout="${n}"]`)?.innerText || '', PANEL, panel, name))
const attr = (scope, name, key) => p.evaluate((sel, n, k) => document.querySelector(`${sel} [data-readout="${n}"]`)?.dataset[k], scope, name, key)
const text = async (selector) => flat(await p.evaluate((sel) => document.querySelector(sel)?.innerText || '', selector))
// Sets a range input the way React expects (native setter, then an input event).
const setRange = async (scope, index, value) => {
  await p.evaluate(
    (sel, k, v) => {
      const el = document.querySelectorAll(`${sel} input[type=range]`)[k]
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    scope,
    index,
    value,
  )
  await sleep(300)
}
const click = async (scope, label) => {
  await p.evaluate(
    (sel, l) => {
      const b = [...document.querySelectorAll(`${sel} button`)].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    scope,
    label,
  )
  await sleep(250)
}
const tap = async (selector) => {
  await p.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) throw new Error('nothing at ' + sel)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, selector)
  await sleep(250)
}
// Waits until data-<key> of a readout is '1'; returns the seconds it took, or null.
const waitFor = async (scope, name, key = 'done', tries = 600) => {
  const t0 = Date.now()
  for (let i = 0; i < tries; i++) {
    if ((await attr(scope, name, key)) === '1') return (Date.now() - t0) / 1000
    await sleep(100)
  }
  return null
}
const A = `${PANEL}:nth-child(1)`
const B = `${PANEL}:nth-child(2)`
const C = `${PANEL}:nth-child(3)`
const fig = (i) => `figure:nth-of-type(${i + 1})`
const figures = await p.$$eval('figure', (f) => f.length)
ok('two live figures', figures === 2, String(figures))
const bars = (i) => p.$$eval('figure', (f, k) => [...f[k].querySelectorAll('g[data-bar]')].map((g) => g.dataset.value).join(' '), i)

// ---- Figure "The biggest hub"
let t = await figText(0)
ok('hub figure, N = 10⁶ and γ = 2.5: bars 12, 10,000 and 999,999; the hub reaches 1.00% of the nodes', (await bars(0)) === '12 10000 999999' && t.includes('1.00% of all the nodes') && t.includes('1.95'), `${await bars(0)} | ${t.slice(-120)}`)
await p.evaluate(() => {
  const el = document.querySelectorAll('figure')[0].querySelectorAll('input[type=range]')[1]
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '3')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
await sleep(250)
ok('hub figure, γ = 3: bars 10, 1,000 and 999,999', (await bars(0)) === '10 1000 999999', await bars(0))
await p.evaluate(() => {
  const f = document.querySelectorAll('figure')[0].querySelectorAll('input[type=range]')
  const set = (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  set(f[0], '1000')
  set(f[1], '4')
})
await sleep(250)
ok('hub figure, N = 10⁹ and γ = 4: the natural cutoff is 1,000', (await bars(0)).split(' ')[1] === '1000', await bars(0))

// ---- Figure "Follow a link"
t = await figText(1)
ok('follow figure starts on the power law: means 1.88 and 15.53, 13 pairs of bars', t.includes('1.88') && t.includes('15.53') && (await p.$$eval('figure', (f) => f[1].querySelectorAll('svg[role=img] rect').length)) === 26, t.slice(0, 300))
await tap('figure button[data-dist="poisson"]')
t = await figText(1)
ok('follow figure, Poisson: both means are 3.00', (t.match(/3\.00/g) || []).length >= 2, t.slice(0, 300))
await tap('figure button[data-dist="onesFours"]')
t = await figText(1)
ok('follow figure, ones and fours: 1.75 and 1.71', t.includes('1.75') && t.includes('1.71'), t.slice(0, 300))

// ---- Panel A: a dial for the exponent
t = await readout(0, 'dial')
ok(
  'dial, start: 4,351 links, ⟨k⟩ 4.35, ⟨k²⟩ 107.8, ratio 24.8, largest 243 · 315 · 317, self-links 14 · 15.8, repeated 130 · 250.9, distance 4.20',
  t.includes('4,351') && t.includes('4.35') && t.includes('107.8') && t.includes('24.8') && t.includes('243 · 315 · 317') && t.includes('14 · 15.8') && t.includes('130 · 250.9') && t.includes('1.000') && t.includes('4.20'),
  t,
)
ok('dial: one canvas that does not capture touch, and a CCDF with a reference line', await p.$$eval(`${A} canvas`, (c) => c.length === 1 && getComputedStyle(c[0]).touchAction !== 'none') && (await p.$$eval(`${A} svg[role=img]`, (s) => s[0].querySelectorAll('polyline').length === 1 && s[0].querySelectorAll('circle').length > 20)))
await setRange(A, 0, 4)
t = await readout(0, 'dial')
ok('dial, γ = 4: 2,440 links, largest 23 · 23 · 25, ratio 3.1, distance 11.16', t.includes('2,440') && t.includes('23 · 23 · 25') && t.includes('3.1') && t.includes('11.16'), t)
await setRange(A, 0, 2.1)
t = await readout(0, 'dial')
ok('dial, γ = 2.1: largest 673 · 1,548, 127 self-links, 1,529 repeated, ratio 83.3, distance 3.03', t.includes('673 · 1,548') && t.includes('127 ·') && t.includes('1,529 ·') && t.includes('83.3') && t.includes('3.03'), t)
await setRange(A, 0, 2.5)
await setRange(A, 2, 1000)
t = await readout(0, 'dial')
ok('dial, N = 20,000: ⟨k⟩ 4.62, ⟨k²⟩ 285.6, largest 1,278, distance 4.20; the drawing is a smaller network', t.includes('20,000') && t.includes('4.62') && t.includes('285.6') && t.includes('1,278') && t.includes('4.20') && (await text(A)).includes('same kind with 250 nodes'), t)
await setRange(A, 2, 500)
await click(A, 'New network')
ok('dial: "New network" draws network 2, with other numbers', (await readout(0, 'which')).includes('Network 2') && !(await readout(0, 'dial')).includes('4,351'))
await tap(`${A} button[data-action="experiment"]`)
const expTime = await waitFor(A, 'experiment', 'done', 1200)
ok('dial: the experiment finishes', expTime != null, `${expTime} s`)
console.log(`NOTE  Panel A, the experiment took ${expTime?.toFixed(1)} s in this browser`)
const kind = (id) => text(`${A} tr[data-kind="${id}"]`)
ok('dial, experiment at N = 100,000: γ = 2.2 → 10,994, 721.9, 3.54; γ = 4 → 63, 3.1, 15.77; random → 15, 5.2, 8.19', (await kind('g2.2')).includes('10,994 721.9 3.54') && (await kind('g4')).includes('63 3.1 15.77') && (await kind('random')).includes('15 5.2 8.19'), `${await kind('g2.2')} | ${await kind('g2.6')} | ${await kind('g3')} | ${await kind('g4')} | ${await kind('random')}`)
ok('dial, experiment: γ = 2.6 → 1,448, 38.1, 5.16; γ = 3 → 1,170, 13.8, 7.50', (await kind('g2.6')).includes('1,448 38.1 5.16') && (await kind('g3')).includes('1,170 13.8 7.50'))
ok('dial: three experiment charts with five curves each (plus four dashed lines on the first)', await p.$$eval(`${A} svg[role=img]`, (s) => s.length === 4 && s[1].querySelectorAll('polyline').length === 9 && s[2].querySelectorAll('polyline').length === 5 && s[3].querySelectorAll('polyline').length === 5))

// ---- Panel B: the giant component, by bookkeeping
t = await readout(1, 'giant')
ok('giant, Poisson ⟨k⟩ = 1.5: fixed point u = 0.4172, S = 0.5828, G1′(1) = 1.500', t.includes('0.4172') && t.includes('0.5828') && t.includes('1.500') && t.includes('Steps 0'), t)
await click(B, 'Step')
ok('giant: Step takes one step of the iteration', (await readout(1, 'giant')).includes('Steps 1'))
await click(B, 'Play')
const conv = await waitFor(B, 'giant', 'converged', 400)
t = await readout(1, 'giant')
ok('giant: Play runs to the fixed point in 26 steps', conv != null && t.includes('Steps 26') && t.includes('u after these steps 0.4172'), t)
await click(B, 'Reset')
ok('giant: Reset goes back to step 0', (await readout(1, 'giant')).includes('Steps 0'))
await setRange(B, 0, 0.9)
t = await readout(1, 'giant')
ok('giant, ⟨k⟩ = 0.9: u = 1, S = 0, ⟨k²⟩ − 2⟨k⟩ = −0.090', t.includes('fixed point 1.0000') && t.includes('fixed point 0.0000') && t.includes('-0.090'), t)
await setRange(B, 0, 1.1)
t = await readout(1, 'giant')
ok('giant, ⟨k⟩ = 1.1: u = 0.8239, S = 0.1761', t.includes('0.8239') && t.includes('0.1761'), t)
ok('giant: two charts; the right one has 16 dots for Poisson', await p.$$eval(`${B} svg[role=img]`, (s) => s.length === 2 && s[1].querySelectorAll('circle').length === 16))
await tap(`${B} button[data-family="onesFours"]`)
t = await readout(1, 'giant')
ok('giant, ones and fours at a quarter: u = 0.5000, S = 0.6094', t.includes('0.5000') && t.includes('0.6094'), t)
await setRange(B, 0, 0.12)
ok('giant, ones and fours at 0.12: S = 0.0748', (await readout(1, 'giant')).includes('0.0748'))
await setRange(B, 0, 0.1)
ok('giant, ones and fours at 0.10: no giant component', (await readout(1, 'giant')).includes('fixed point 0.0000'))
await tap(`${B} button[data-family="power"]`)
t = await readout(1, 'giant')
ok('giant, power law γ = 2.5: S = 0.6136, G1′(1) grows without bound; 20 dots', t.includes('0.6136') && t.includes('grows without bound') && (await p.$$eval(`${B} svg[role=img]`, (s) => s[1].querySelectorAll('circle').length === 20)), t)
await setRange(B, 0, 3)
ok('giant, power law γ = 3: S = 0.2014', (await readout(1, 'giant')).includes('0.2014'))
await setRange(B, 0, 3.4)
ok('giant, power law γ = 3.4: S = 0.0082', (await readout(1, 'giant')).includes('0.0082'))
await setRange(B, 0, 3.5)
t = await readout(1, 'giant')
ok('giant, power law γ = 3.5: nothing left, G1′(1) = 0.947', t.includes('fixed point 0.0000') && t.includes('0.947'), t)
await setRange(B, 0, 2)
t = await readout(1, 'giant')
ok('giant, power law γ = 2: u = 0 and S = 1', t.includes('fixed point 0.0000') && t.includes('fixed point 1.0000'), t)
ok('giant: the threshold is marked at γ = 3.4788', (await text(B)).includes('3.4788'))

// ---- Panel C: is it a power law?
const way = (id) => text(`${C} tr[data-way="${id}"]`)
const cand = (id) => text(`${C} tr[data-candidate="${id}"]`)
const runTest = async () => {
  await tap(`${C} button[data-action="test"]`)
  return waitFor(C, 'p', 'done', 3000)
}
t = await readout(2, 'fit')
ok('recipe, pure power law, 2,000: k_min 1, γ = 2.48 ± 0.03, tail 2,000 / 2,000', t.includes('Chosen k_min 1') && t.includes('2.48 ± 0.03') && t.includes('2,000 / 2,000'), t)
ok('recipe: before the test the verdict asks for it', (await attr(C, 'verdict', 'kind')) === 'untested')
ok('recipe, four ways to get it wrong: 1.49, 2.36, 2.46, 2.48; the truth 2.50', (await way('equalBins')).includes('1.49') && (await way('logBins')).includes('2.36') && (await way('ccdf')).includes('2.46') && (await way('mle')).includes('2.48') && (await way('truth')).includes('2.50'))
const t2000 = await runTest()
t = await readout(2, 'p')
ok('recipe, pure power law: the test gives p = 0.73; verdict "plausible"', t2000 != null && t.includes('0.73') && (await attr(C, 'verdict', 'kind')) === 'plausible', `${t} | ${await readout(2, 'verdict')}`)
console.log(`NOTE  Panel C, bootstrap with 200 sets at n = 2,000 took ${t2000?.toFixed(1)} s in this browser`)
ok('recipe, step 4: exponential excluded (618.2), no decision against the lognormal and the cut-off', (await cand('exponential')).includes('618.2') && (await cand('exponential')).includes('power law favoured') && (await cand('lognormal')).includes('no decision') && (await cand('cutoff')).includes('no decision'), `${await cand('lognormal')} | ${await cand('exponential')} | ${await cand('cutoff')}`)
ok('recipe: three charts (CCDF, KS distance, Hill plot)', await p.$$eval(`${C} svg[role=img]`, (s) => s.length === 3))
await setRange(C, 0, 1000)
t = await readout(2, 'fit')
ok('recipe, pure power law, 50,000: γ = 2.49 ± 0.01, and the old test result is dropped', t.includes('2.49 ± 0.01') && t.includes('50,000 / 50,000') && (await attr(C, 'verdict', 'kind')) === 'untested', t)
const t50000 = await runTest()
ok('recipe, 50,000 values: the test finishes', t50000 != null, await readout(2, 'p'))
console.log(`NOTE  Panel C, bootstrap with 200 sets at n = 50,000 took ${t50000?.toFixed(1)} s in this browser`)
await setRange(C, 0, 482)
await p.select(`${C} select`, 'lognormal')
await sleep(400)
t = await readout(2, 'fit')
ok('recipe, lognormal, 2,000: k_min 14, γ = 2.81 ± 0.13, 202 / 2,000, tail 14 … 223', t.includes('Chosen k_min 14') && t.includes('2.81 ± 0.13') && t.includes('202 / 2,000') && t.includes('14 … 223'), t)
await runTest()
ok('recipe, lognormal: p = 0.86, and the verdict cannot tell it from a lognormal', (await readout(2, 'p')).includes('0.86') && (await attr(C, 'verdict', 'kind')) === 'plausible' && (await readout(2, 'verdict')).includes('a lognormal'), await readout(2, 'verdict'))
await p.select(`${C} select`, 'exponential')
await sleep(400)
t = await readout(2, 'fit')
ok('recipe, exponential: k_min 27, γ = 5.65 ± 0.49, 89 values, 27 … 72; the verdict refuses (less than a factor of ten)', t.includes('Chosen k_min 27') && t.includes('5.65 ± 0.49') && t.includes('27 … 72') && (await attr(C, 'verdict', 'kind')) === 'narrow' && (await readout(2, 'verdict')).includes('less than a factor of ten'), `${t} | ${await readout(2, 'verdict')}`)
await p.select(`${C} select`, 'cutoff')
await sleep(400)
await runTest()
ok('recipe, cut-off: γ = 2.14 ± 0.03, p = 0.02, ruled out, ratio −12.6', (await readout(2, 'fit')).includes('2.14 ± 0.03') && (await readout(2, 'p')).includes('0.02') && (await attr(C, 'verdict', 'kind')) === 'ruledOut' && (await cand('cutoff')).includes('-12.6'), `${await readout(2, 'p')} | ${await cand('cutoff')}`)
await p.select(`${C} select`, 'attachment')
await sleep(400)
await runTest()
ok('recipe, preferential attachment, 2,000: k_min 2, γ = 2.52 ± 0.03, p = 0.01, truth 3.00', (await readout(2, 'fit')).includes('2.52 ± 0.03') && (await readout(2, 'p')).includes('0.01') && (await way('truth')).includes('3.00'), `${await readout(2, 'fit')} | ${await readout(2, 'p')}`)
await p.select(`${C} select`, 'thinned')
await sleep(400)
await runTest()
ok('recipe, sampled network, 2,000: γ = 2.93 ± 0.04 with p = 0.73, truth 2.50', (await readout(2, 'fit')).includes('2.93 ± 0.04') && (await readout(2, 'p')).includes('0.73') && (await way('truth')).includes('2.50'), `${await readout(2, 'fit')} | ${await readout(2, 'p')}`)
await p.select(`${C} select`, 'tailBody')
await sleep(400)
await setRange(C, 0, 853)
t = await readout(2, 'fit')
ok('recipe, tail with a different body, 20,000: k_min 10, γ = 2.52 ± 0.02, 7,988 values; maximum likelihood from 1 says 1.39', t.includes('Chosen k_min 10') && t.includes('2.52 ± 0.02') && t.includes('7,988') && (await way('mle')).includes('1.39'), t)
await p.select(`${C} select`, 'mystery2')
await sleep(400)
ok('recipe, mystery 2: the truth is hidden and the sliders are gone', (await way('truth')).includes('hidden') && (await p.$$eval(`${C} input[type=range]`, (r) => r.length)) === 1)
await runTest()
t = await readout(2, 'fit')
ok('recipe, mystery 2: k_min 15, γ = 2.96 ± 0.13, 244 / 3,000, p = 0.70', t.includes('Chosen k_min 15') && t.includes('2.96 ± 0.13') && t.includes('244 / 3,000') && (await readout(2, 'p')).includes('0.70'), `${t} | ${await readout(2, 'p')}`)
await tap(`${C} button[data-action="reveal"]`)
ok('recipe, mystery 2: Reveal says it was a lognormal, and the test result stays', (await readout(2, 'about')).includes('It was: Lognormal') && (await readout(2, 'p')).includes('0.70') && (await way('truth')).includes('not a power law'), await readout(2, 'about'))
await p.select(`${C} select`, 'mystery1')
await sleep(400)
await runTest()
ok('recipe, mystery 1: k_min 10, γ = 2.63 ± 0.04, p = 0.76', (await readout(2, 'fit')).includes('2.63 ± 0.04') && (await readout(2, 'p')).includes('0.76'), `${await readout(2, 'fit')} | ${await readout(2, 'p')}`)
await p.select(`${C} select`, 'mystery3')
await sleep(400)
await runTest()
ok('recipe, mystery 3: γ = 2.13 ± 0.01, p < 0.005 (no synthetic set of 200 fitted worse), ruled out, ratio −46.3', (await readout(2, 'fit')).includes('2.13 ± 0.01') && (await readout(2, 'p')).includes('< 0.005 (none of the 200 synthetic sets fitted worse)') && !/0\.00(?!\d)/.test(await readout(2, 'p')) && (await attr(C, 'verdict', 'kind')) === 'ruledOut' && (await cand('cutoff')).includes('-46.3'), `${await readout(2, 'p')} | ${await cand('cutoff')}`)
ok('recipe, mystery 3: the verdict says p < 0.005 and that no synthetic set fitted worse', (await readout(2, 'verdict')).includes('Power law ruled out (p < 0.005: none of the 200 synthetic sets fitted worse than the data).'), await readout(2, 'verdict'))
ok('recipe, mystery 3: the comparison table shows no p of 0.00', !/0\.00(?!\d)/.test(await readout(2, 'compare')), await readout(2, 'compare'))
await p.select(`${C} select`, 'lognormal')
await sleep(400)
await setRange(C, 0, 177)
await runTest()
ok('recipe, lognormal, 300: k_min 4, γ = 2.09 ± 0.10, p = 0.03', (await readout(2, 'fit')).includes('2.09 ± 0.10') && (await readout(2, 'fit')).includes('/ 300') && (await readout(2, 'p')).includes('0.03'), `${await readout(2, 'fit')} | ${await readout(2, 'p')}`)
await setRange(C, 0, 918)
await runTest()
ok('recipe, lognormal, 30,000: k_min 24, γ = 3.08 ± 0.06, 1,229 values, p = 0.21; the verdict names the cut-off law', (await readout(2, 'fit')).includes('3.08 ± 0.06') && (await readout(2, 'fit')).includes('1,229 / 30,000') && (await readout(2, 'p')).includes('0.21') && (await attr(C, 'verdict', 'kind')) === 'alternative' && (await readout(2, 'verdict')).includes('cut-off'), `${await readout(2, 'fit')} | ${await readout(2, 'p')} | ${await readout(2, 'verdict')}`)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
