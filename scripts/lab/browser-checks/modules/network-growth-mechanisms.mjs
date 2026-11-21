// Functional checks of Network Lab module 06 "Growth mechanisms": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-06.mjs pins down in Node). It also times "Rerun
// 20 times" at N = 20,000 and the optimisation model of Panel B.
//
//   node modules/network-growth-mechanisms.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/growth-mechanisms`, 1500)
await settle(p)

const PANEL = 'main section .space-y-14 > div'
const A = `${PANEL}:nth-child(1)`
const B = `${PANEL}:nth-child(2)`
const C = `${PANEL}:nth-child(3)`
const flat = (s) => s.replace(/\s+/g, ' ')
const text = async (sel) => flat(await p.evaluate((x) => document.querySelector(x)?.innerText || '', sel))
const data = (sel, key) => p.evaluate((x, k) => document.querySelector(x)?.dataset[k], sel, key)
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
const tap = async (sel) => {
  await p.evaluate((x) => {
    const el = document.querySelector(x)
    if (!el) throw new Error('nothing at ' + x)
    el.click()
  }, sel)
  await sleep(200)
}
const waitDone = async (sel, tries = 600) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, 'done')) === '1') return true
    await sleep(100)
  }
  return false
}

// ---- F1
const F1 = 'figure:nth-of-type(1)'
ok('rich figure: K = 100, α = 1, the hub takes 4.8% of the next link', (await text(`${F1} [data-readout="rich"]`)).includes('4.8%'), await text(`${F1} [data-readout="rich"]`))
await setRange(F1, 1, 2)
ok('rich figure: α = 2 gives 71.4%', (await text(`${F1} [data-readout="rich"]`)).includes('71.4%'), await text(`${F1} [data-readout="rich"]`))
await setRange(F1, 1, 1.5)
ok('rich figure: α = 1.5 gives 26.1%', (await text(`${F1} [data-readout="rich"]`)).includes('26.1%'))

// ---- F2
const F2 = 'figure:nth-of-type(2)'
ok('snapshots figure: five degree classes and a canvas', await p.evaluate((x) => document.querySelectorAll(`${x} tr[data-class]`).length === 5 && document.querySelectorAll(`${x} canvas`).length === 1, F2))
ok('snapshots figure, sample 1: 15 links from the new nodes to the old ones', (await data(`${F2} [data-readout="snapshots"]`, 'links')) === '15')
await tap(`${F2} button[data-action="sample"]`)
ok('snapshots figure: "New sample" draws sample 2 (19 links)', (await text(F2)).includes('Sample 2') && (await data(`${F2} [data-readout="snapshots"]`, 'links')) === '19')

// ---- Panel A
const RUN = `${A} [data-readout="run"]`
ok('history, run 1: the biggest hub is the first node, with 210 links, linked to 4.2%, leader fixed from 75', (await data(RUN, 'hub')) === '0' && (await data(RUN, 'max')) === '210' && (await data(RUN, 'share')) === '0.0420' && (await data(RUN, 'settles')) === '75', await text(RUN))
ok('history: drawing, three charts', await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 1 && document.querySelectorAll(`${x} svg[role=img]`).length === 3, A))
await tap(`${A} button[data-action="rerun"]`)
ok('history: twenty runs finish', await waitDone(`${A} [data-readout="twenty"]`))
let t = await text(`${A} [data-readout="twenty"]`)
ok('history, 20 runs: hub among the first ten in 18, same leader at N/10 in 16, share 3.6% (2.3%–5.3%)', (await data(`${A} [data-readout="twenty"]`, 'firstTen')) === '18' && (await data(`${A} [data-readout="twenty"]`, 'same')) === '16' && t.includes('3.6% (2.3%–5.3%)'), t)
ok('history: twenty CCDFs overlaid', await p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].some((s) => s.querySelectorAll('polyline').length === 20), A))
await tap(`${A} button[data-action="grow"]`)
ok('history: "Grow" draws run 2', (await text(A)).includes('Run 2'))
await setRange(A, 3, 1000) // N = 20,000 (log slider: the last position)
ok('history: N = 20,000 starts again from run 1', (await text(A)).includes('Run 1') && (await text(A)).includes('20,000'))
const t0 = await p.evaluate(() => performance.now())
await tap(`${A} button[data-action="rerun"]`)
const finished = await waitDone(`${A} [data-readout="twenty"]`)
const rerunMs = (await p.evaluate(() => performance.now())) - t0
console.log(`NOTE  history: "Rerun 20 times" at N = 20,000 took ${(rerunMs / 1000).toFixed(1)} s in this browser`)
t = await text(`${A} [data-readout="twenty"]`)
ok('history, N = 20,000: 18 of 20 hubs among the first ten, median share 1.8%', finished && (await data(`${A} [data-readout="twenty"]`, 'firstTen')) === '18' && t.includes('1.8% ('), t)

// ---- Panel B
const MECH = `${B} [data-readout="mechanism"]`
ok('mechanisms, preferential attachment: largest 347, ⟨k²⟩/⟨k⟩ 14.87, kernel 1.003', (await data(MECH, 'max')) === '347' && (await data(MECH, 'ratio')) === '14.87' && (await data(MECH, 'kernel')) === '1.003')
await tap(`${B} button[data-mechanism="uniform"]`)
ok('mechanisms, uniform: largest 28', (await data(MECH, 'max')) === '28')
await tap(`${B} button[data-mechanism="linkSelection"]`)
ok('mechanisms, link selection: largest 405, kernel 1.007', (await data(MECH, 'max')) === '405' && (await data(MECH, 'kernel')) === '1.007')
await tap(`${B} button[data-mechanism="copying"]`)
t = await text(B)
ok('mechanisms, copying p = 0.5: kernel 1.020, theory 3.00, recipe 2.65 ± 0.05 from q = 8', (await data(MECH, 'kernel')) === '1.020' && t.includes('3.00') && t.includes('2.65 ± 0.05') && t.includes('from q = 8'), t.slice(0, 600))
await tap(`${B} button[data-mechanism="walk"]`)
ok('mechanisms, random walk ℓ = 1: largest 5,052, share 25.3%', (await data(MECH, 'max')) === '5052' && (await text(MECH)).includes('25.3%'))
const tOpt = await p.evaluate(
  (x) =>
    new Promise((resolve) => {
      const start = performance.now()
      document.querySelector(`${x} button[data-mechanism="optimisation"]`).click()
      const poll = () => (document.querySelector(`${x} [data-readout="mechanism"]`)?.dataset.id === 'optimisation' ? requestAnimationFrame(() => resolve(performance.now() - start)) : setTimeout(poll, 5))
      poll()
    }),
  B,
)
console.log(`NOTE  mechanisms: the optimisation model at N = 5,000 appeared ${(tOpt / 1000).toFixed(2)} s after the click`)
await sleep(300)
ok('mechanisms, optimisation δ = 10: largest 211, a map is drawn', (await data(MECH, 'max')) === '211' && (await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 1, B)))

// ---- Panel C
const KER = `${C} [data-readout="kernel"]`
ok('kernel, defaults: cumulative 0.967, every class 0.581, maximum likelihood 0.992 ± 0.021', (await data(KER, 'cum')) === '0.967' && (await data(KER, 'cumAll')) === '0.581' && (await data(KER, 'mle')) === '0.992' && (await data(KER, 'se')) === '0.021', await text(KER))
ok('kernel: 1,919 links from new nodes to the 5,000 old ones', (await text(C)).includes('1,919 links from new nodes to the 5,000 old ones'))
await tap(`${C} button[data-action="repeat"]`)
ok('kernel: twenty networks finish', await waitDone(`${C} [data-readout="repeat"]`))
t = await text(`${C} [data-readout="repeat"]`)
ok('kernel, 20 networks: cumulative 0.99 ± 0.04, every class 0.62 ± 0.05, maximum likelihood 1.01 ± 0.02 (0.97 … 1.04)', t.includes('0.99 ± 0.04') && t.includes('0.62 ± 0.05') && t.includes('1.01 ± 0.02 (0.97 … 1.04)'), t)
await tap(`${C} button[data-source="walk"]`)
ok('kernel, one-step walk: maximum likelihood above 1.2', Number(await data(KER, 'mle')) > 1.2, await data(KER, 'mle'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
