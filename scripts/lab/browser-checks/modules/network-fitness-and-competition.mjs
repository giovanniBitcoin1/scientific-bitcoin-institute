// Functional checks of Network Lab module 07 "Fitness and competition": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-07.mjs pins down in Node). It also times "Rerun
// 20 times", Panel B at 50,000 nodes and the ageing model at 20,000 nodes.
//
//   node modules/network-fitness-and-competition.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/fitness-and-competition`, 1500)
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
const waitData = async (sel, key, want, tries = 600) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, key)) === want) return true
    await sleep(100)
  }
  return false
}
const r2 = (s) => Number(s).toFixed(2)
const now = () => p.evaluate(() => performance.now())

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const RACE = `${F1} [data-readout="race"]`
ok('race figure, defaults: the latecomer overtakes at 10⁶ nodes', (await data(RACE, 'log10')) === '6.000' && (await text(RACE)).includes('10⁶'), await text(RACE))
await setRange(F1, 1, 0.8)
ok('race figure: incumbent fitness 0.8 moves it to 10¹⁵, off the chart', (await data(RACE, 'log10')) === '15.000' && (await text(RACE)).includes('10¹⁵'), await text(RACE))
await setRange(F1, 3, 0.5)
ok('race figure: η₂ ≤ η₁ gives "never"', (await data(RACE, 'log10')) === 'never' && (await text(RACE)).startsWith('Never'))

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const EN = `${F2} [data-readout="energy"]`
ok('energy figure: 12 nodes and 12 levels at the start', (await data(EN, 'size')) === '12' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg g`).length, F2)) === 12)
await tap(`${F2} button[data-action="add"]`)
ok('energy figure: "Add a node" grows it to 13', (await data(EN, 'size')) === '13' && (await text(EN)).includes('13 nodes, 12 particles'))
await tap(`${F2} button[data-action="boost"]`)
ok('energy figure: the switch puts node 4 on the lowest level and starts again from 12', (await data(EN, 'top')) === '3' && (await data(EN, 'size')) === '12')
for (let i = 0; i < 20; i++) await tap(`${F2} button[data-action="add"]`)
ok('energy figure: 30 nodes at most; the boosted node holds 10 of the 29 particles', (await data(EN, 'size')) === '30' && (await data(EN, 'topParticles')) === '10', await text(EN))

// ---- Panel A
const RUN = `${A} [data-readout="run"]`
ok('fit get rich, run 1: C 1.2550, the leader is the 6th node with 764 links, 488 fitter, 5 lead changes', (await data(RUN, 'c')) === '1.2550' && (await data(RUN, 'leader')) === '5' && (await data(RUN, 'leaderDeg')) === '764' && (await data(RUN, 'fitter')) === '488' && (await data(RUN, 'changes')) === '5', await text(RUN))
ok('fit get rich, run 1: correlations 0.48 and 0.70', r2(await data(RUN, 'corr')) === '0.48' && r2(await data(RUN, 'corrEarly')) === '0.70', `${await data(RUN, 'corr')} ${await data(RUN, 'corrEarly')}`)
ok('fit get rich: five charts', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`).length === 5, A))
let t0 = await now()
await tap(`${A} button[data-action="rerun"]`)
const finished = await waitData(`${A} [data-readout="twenty"]`, 'done', '1')
console.log(`NOTE  fit get rich: "Rerun 20 times" at N = 10,000 took ${(((await now()) - t0) / 1000).toFixed(1)} s in this browser`)
const TW = `${A} [data-readout="twenty"]`
ok('fit get rich, 20 runs: never the fittest, 17 among the ten oldest, median 976 fitter (169–2,302), lead changes 6', finished && (await data(TW, 'fittest')) === '0' && (await data(TW, 'oldest')) === '17' && (await text(TW)).includes('976 (169–2,302)') && (await data(TW, 'changes')) === '6', await text(TW))
await tap(`${A} button[data-kind="equal"]`)
ok('fit get rich, all equal: C = 2', (await data(RUN, 'c')) === '2.0000')
await tap(`${A} button[data-kind="exponential"]`)
ok('fit get rich, exponential 0.2: C shown as ≈ 1', (await text(RUN)).includes('≈ 1'))

// ---- Panel B
const CO = `${B} [data-readout="condensation"]`
ok('one above the rest, defaults: ten runs finish', await waitData(CO, 'done', '1'))
ok('one above the rest, b = 0.5: I 0.386, predicted 0.614, measured 0.622', (await data(CO, 'i')) === '0.3863' && (await data(CO, 'share')) === '0.6137' && (await data(CO, 'mean')) === '0.6222', await text(CO))
ok('one above the rest: eleven thin lines and a picture of the levels', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`)[0].querySelectorAll('polyline').length === 12 && document.querySelectorAll(`${x} svg[role=img]`)[1].querySelectorAll('rect').length === 13, B))
t0 = await now()
await tap(`${B} button[data-size="50000"]`)
await sleep(100)
const big = await waitData(CO, 'done', '1')
console.log(`NOTE  one above the rest: ten runs of 50,000 nodes took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('one above the rest, 50,000 nodes: mean 0.619', big && Number(await data(CO, 'mean')).toFixed(3) === '0.619', await data(CO, 'mean'))
await setRange(B, 0, 0.9)
await waitData(CO, 'done', '1')
ok('one above the rest, b = 0.9: no condensate predicted, 0.118 measured at 50,000', (await data(CO, 'share')) === '0.0000' && Number(await data(CO, 'mean')).toFixed(3) === '0.118', await data(CO, 'mean'))

// ---- Panel C
const AG = `${C} [data-readout="ageing"]`
ok('ageing, ν = 0, 10,000 nodes: largest degree 114, γ 2.73', (await waitData(AG, 'done', '1')) && (await data(AG, 'max')) === '114' && r2(await data(AG, 'gamma')) === '2.73', await text(AG))
ok('ageing: a drawing and a CCDF', await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 1, C))
await setRange(C, 0, 2)
await sleep(300)
ok('ageing, ν = 2: largest degree 8', (await waitData(AG, 'max', '8')))
await setRange(C, 0, -1)
await sleep(300)
ok('ageing, ν = −1: largest degree 861, held by the 2nd node', (await waitData(AG, 'max', '861')) && (await data(AG, 'hub')) === '1')
await setRange(C, 0, 0)
await waitData(AG, 'max', '114')
t0 = await now()
await setRange(C, 1, 1000) // N = 20,000, the last position of the log slider
await sleep(50)
const aged = await waitData(AG, 'done', '1')
console.log(`NOTE  ageing at 20,000 nodes took ${(((await now()) - t0) / 1000).toFixed(1)} s in this browser`)
ok('ageing at 20,000 nodes finishes', aged)
await tap(`${C} button[data-mode="accel"]`)
const AC = `${C} [data-readout="accel"]`
ok('accelerating, θ = 0.3, 10,000 nodes: slope 1.301, γ 3.60', (await waitData(AC, 'done', '1')) && (await data(AC, 'a')) === '1.301' && r2(await data(AC, 'gamma')) === '3.60', await text(AC))
ok('accelerating: three charts', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`).length === 3, C))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
