// Functional checks of Network Lab module 12 "Epidemics on networks": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-12.mjs pins down in Node). It also times the
// page-load work and the jobs behind the buttons.
//
//   node modules/network-epidemics-on-networks.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import path from 'node:path'
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep, SHOTS } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
const now = () => p.evaluate(() => performance.now())
await p.evaluateOnNewDocument(() => {
  window.__t = {}
  new MutationObserver(() => {
    for (const id of ['threshold', 'spread', 'immune']) {
      const el = document.querySelector(`[data-readout="${id}"]`)
      if (!el) continue
      if (!window.__t[`${id}Shown`]) window.__t[`${id}Shown`] = performance.now()
      if (el.dataset.done === '1' && !window.__t[`${id}Done`]) window.__t[`${id}Done`] = performance.now()
    }
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
await go(p, `${site.url}${lab.basePath}/epidemics-on-networks`, 300)

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
  await sleep(350)
}
const tap = async (sel) => {
  await p.evaluate((x) => {
    const el = document.querySelector(x)
    if (!el) throw new Error('nothing at ' + x)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, sel)
  await sleep(200)
}
const waitData = async (sel, key, want, tries = 1500) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, key)) === want) return true
    await sleep(100)
  }
  return false
}

// ---- page load
const TH = `${A} [data-readout="threshold"]`
const SP = `${B} [data-readout="spread"]`
const IM = `${C} [data-readout="immune"]`
const aDone = await waitData(TH, 'done', '1')
const bDone = await waitData(SP, 'done', '1')
const cDone = await waitData(IM, 'done', '1')
const T = await p.evaluate(() => window.__t)
const secs = (id) => ((T[`${id}Done`] - T[`${id}Shown`]) / 1000).toFixed(1)
console.log(`NOTE  page load: Panel A (101 values of T, 10 percolations each, 10,000 nodes) done ${secs('threshold')} s after it appeared; Panel B (60 runs on three networks) ${secs('spread')} s; Panel C (91 values of g, three strategies, 5 runs) ${secs('immune')} s; all across animation frames`)
await settle(p)

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const SD = `${F1} [data-readout="seed"]`
ok('seed figure, start: node 5 with one link, 80 nodes and 126 links drawn, nothing run yet', (await data(SD, 'seed')) === '5' && (await data(SD, 'k')) === '1' && (await data(SD, 'big')) === '' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg g[data-node]`).length === 80 && document.querySelectorAll(`${x} svg line`).length >= 126, F1)), await text(SD))
await tap(`${F1} button[data-action="run"]`)
ok('seed figure: from the node with one link 97 of 200 outbreaks pass a quarter of the nodes', (await data(SD, 'big')) === '97' && (await data(SD, 'bins')).split(' ').reduce((a, b) => a + Number(b), 0) === 200, `${await data(SD, 'big')} | ${await data(SD, 'bins')}`)
await tap(`${F1} button[data-action="hub"]`)
ok('seed figure: choosing another seed clears the histogram', (await data(SD, 'seed')) === '2' && (await data(SD, 'k')) === '19' && (await data(SD, 'big')) === '')
await tap(`${F1} button[data-action="run"]`)
ok('seed figure: from the hub (19 links) 199 of 200, and the earlier result is listed below', (await data(SD, 'big')) === '199' && (await text(F1)).includes('Earlier: node 5, 1 link: 97'), await text(SD))
await tap(`${F1} g[data-node="40"]`)
ok('seed figure: tapping a node makes it the seed', (await data(SD, 'seed')) === '40' && (await data(SD, 'k')) === '1')

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const GR = `${F2} [data-readout="growth"]`
const lines = () => p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join(' '), F2)
ok('growth figure, start: everyone in contact, two charts with the curve and its guide', (await data(GR, 'kind')) === 'mixing' && (await lines()) === '2 2', await lines())
await tap(`${F2} button[data-kind="lattice"]`)
ok('growth figure, lattice: fitted slope 2.143, shown as 2.14', (await data(GR, 'kind')) === 'lattice' && (await data(GR, 'slope')) === '2.143' && (await text(GR)).includes('Fitted slope 2.14'), await text(GR))
await tap(`${F2} button[data-kind="ladder"]`)
ok('growth figure, ladder: a = 8, b = 2 gives the exponent 3', (await data(GR, 'exponent')) === '3.000' && (await text(GR)).includes('= 3.00'), await text(GR))
await setRange(F2, 0, 4)
ok('growth figure, ladder: a = 4, b = 2 gives 2', (await data(GR, 'exponent')) === '2.000', await text(GR))
await setRange(F2, 1, 1.5)
await setRange(F2, 0, 10)
ok('growth figure, ladder: the steepest setting of the sliders (a = 10, b = 1.5) still draws', (await data(GR, 'exponent')) === '5.679' && (await lines()) === '2 2', `${await data(GR, 'exponent')} ${await lines()}`)

// ---- Panel A
const NW = `${A} [data-readout="network"]`
const SE = `${A} [data-readout="seeds"]`
const SI = `${A} [data-readout="sis"]`
ok('threshold, default: 10,000 nodes, 20,000 links, T_c 0.250; at T = 0.5 the largest component 0.796, theory 0.797', aDone && (await data(NW, 'links')) === '20000' && (await data(NW, 'tc')) === '0.250' && (await data(TH, 'share')) === '0.796' && (await data(TH, 'theory')) === '0.797', await text(TH))
ok('threshold: two curves, measured and theory', (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`)[0].querySelectorAll('polyline').length, A)) === 2)
await setRange(A, 1, 0.3)
ok('threshold, T = 0.3: 0.319, theory 0.313', (await data(TH, 'share')) === '0.319' && (await data(TH, 'theory')) === '0.313', await text(TH))
await setRange(A, 1, 0.2)
ok('threshold, T = 0.2: 0.008', (await data(TH, 'share')) === '0.008', await text(TH))
await setRange(A, 1, 0.5)
let t0 = await now()
await tap(`${A} button[data-action="seeds"]`)
const seeded = await waitData(SE, 'done', '1')
console.log(`NOTE  threshold: "Run 1,000 seeds" at T = 0.5, 10,000 nodes, took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('threshold, 1,000 seeds: 0.801 large, mean size 0.796, the others 1.68 nodes', seeded && (await data(SE, 'large')) === '0.801' && (await data(SE, 'meanlarge')) === '0.796' && (await data(SE, 'meansmall')) === '1.68', await text(SE))
const byk = (await data(SE, 'byk')) || ''
ok('threshold, 1,000 seeds, by degree: 0.25 with one link, 0.68 with two, 0.86 with four, 1.00 with seven; ten links not shown', ['1:0.25', '2:0.68', '4:0.86', '7:1.00'].every((x) => byk.split(' ').includes(x)) && !byk.includes('10:'), byk)
t0 = await now()
await tap(`${A} button[data-action="sis"]`)
let sisDone = await waitData(SI, 'done', '1', 3000)
console.log(`NOTE  threshold: "Run the SIS sweep" on the random network, 10,000 nodes, took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('threshold, SIS, random network: prevalence above 1% from β/μ = 0.24, line at 0.200', sisDone && (await data(SI, 'from')) === '0.24' && (await data(NW, 'sis')) === '0.200', await text(SI))
await (await p.$(A)).screenshot({ path: path.join(SHOTS, 'el-epidemics-on-networks-panel1-seeds-1280.png') })
await tap(`${A} button[data-source="pa"]`)
await waitData(TH, 'done', '1')
await sleep(300)
ok('threshold, preferential attachment: ⟨k²⟩ 57.03, T_c 0.075, 0.776 at T = 0.5, no theory curve; the seeds and the SIS chart of the other network are gone', (await data(NW, 'mean2')) === '57.03' && (await data(NW, 'tc')) === '0.075' && (await data(TH, 'share')) === '0.776' && (await data(TH, 'theory')) === '' && !(await p.$(SE)) && !(await p.$(SI)), await text(TH))
await setRange(A, 1, 0.2)
ok('threshold, preferential attachment, T = 0.2: 0.188', (await data(TH, 'share')) === '0.188', await text(TH))
t0 = await now()
await tap(`${A} button[data-action="sis"]`)
sisDone = await waitData(SI, 'done', '1', 3000)
console.log(`NOTE  threshold: the SIS sweep under preferential attachment took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('threshold, SIS, preferential attachment: from 0.10, line at 0.070', sisDone && (await data(SI, 'from')) === '0.1' && (await data(NW, 'sis')) === '0.070', await text(SI))
await tap(`${A} button[data-source="power"]`)
await waitData(TH, 'done', '1')
await setRange(A, 1, 0.1)
ok('threshold, power law γ = 2.5: ⟨k²⟩ 127.62, T_c 0.035, 0.086 at T = 0.1 (theory 0.086)', (await data(NW, 'mean2')) === '127.62' && (await data(NW, 'tc')) === '0.035' && (await data(TH, 'share')) === '0.086' && (await data(TH, 'theory')) === '0.086', await text(TH))
t0 = await now()
await tap(`${A} button[data-action="sis"]`)
sisDone = await waitData(SI, 'done', '1', 3000)
console.log(`NOTE  threshold: the SIS sweep on the power law took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('threshold, SIS, power law: from 0.06, line at 0.034', sisDone && (await data(SI, 'from')) === '0.06' && (await data(NW, 'sis')) === '0.034', await text(SI))
const tcs = []
for (const i of [0, 3, 4]) {
  await setRange(A, 0, i)
  await waitData(TH, 'done', '1')
  await sleep(300)
  tcs.push(await data(NW, 'tc'))
}
ok('threshold, power law at N = 1,000, 10,000, 20,000: T_c 0.026, 0.035, 0.011', tcs.join(' ') === '0.026 0.035 0.011', tcs.join(' '))

// ---- Panel B
const net = async (id) => {
  const sel = `${B} tr[data-net="${id}"]`
  return { times: await data(sel, 'times'), large: await data(sel, 'large'), final: await data(sel, 'final'), k1: await data(sel, 'k1') }
}
let pa = await net('pa')
let po = await net('poisson')
let la = await net('lattice')
// the page formats with toLocaleString, which shows 12.95 as 13.0 and 15.45 as 15.5; the data attributes use toFixed
ok('hubs, default SI: times to 1%, 10%, 50% — preferential attachment 7.3 9.8 12.9 (shown 13.0), random 10.3 15.4 (shown 15.5) 20.0, lattice 19.3 54.8 116.3', bDone && pa.times === '7.3 9.8 12.9' && po.times === '10.3 15.4 20.0' && la.times === '19.3 54.8 116.3' && (await text(SP)).includes('13.0') && (await text(SP)).includes('15.5'), `${pa.times} | ${po.times} | ${la.times}`)
ok('hubs, default SI: first cases under preferential attachment have 11.7 links; lattice slope 2.130; three charts with three curves each', pa.k1 === '11.7' && (await data(SP, 'slope')) === '2.130' && (await p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join(' '), B)) === '3 3 3', `${pa.k1} ${await data(SP, 'slope')}`)
await tap(`${B} button[data-model="sir"]`)
await waitData(SP, 'model', 'sir')
await waitData(SP, 'done', '1')
pa = await net('pa')
po = await net('poisson')
la = await net('lattice')
ok('hubs, SIR with d = 4: T 0.5904; 17, 18 and 19 large runs; half the nodes after 21.4, 13.9 and 136.4 steps', (await data(SP, 't')) === '0.5904' && `${po.large} ${pa.large} ${la.large}` === '17 18 19' && po.times.endsWith('21.4') && pa.times.endsWith('13.9') && la.times.endsWith('136.4'), `${po.large} ${pa.large} ${la.large} | ${po.times} | ${pa.times} | ${la.times}`)
await setRange(B, 0, 0.1)
await waitData(SP, 't', '0.3439')
await waitData(SP, 'done', '1')
pa = await net('pa')
po = await net('poisson')
la = await net('lattice')
ok('hubs, SIR with β = 0.10: T 0.3439; 13 large runs on the random network, 7 under preferential attachment, none on the lattice, which leaves the charts', `${po.large} ${pa.large} ${la.large}` === '13 7 0' && (await p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join(' '), B)) === '2 2 2', `${po.large} ${pa.large} ${la.large}`)

// ---- Panel C
const strat = async (id) => {
  const sel = `${C} tr[data-strategy="${id}"]`
  return { size: await data(sel, 'size'), k: await data(sel, 'k'), stops: await data(sel, 'stops') }
}
const three = async (key) => [(await strat('random'))[key], (await strat('degree'))[key], (await strat('acquaintance'))[key]].join(' ')
ok('vaccinate, default g = 0.20: at random 0.511, by degree 0.012, acquaintance 0.435; mean degrees 4.02, 6.99, 4.89; g_c 0.499', cDone && (await three('size')) === '0.511 0.012 0.435' && (await three('k')) === '4.02 6.99 4.89' && (await data(IM, 'gc')) === '0.499', `${await three('size')} | ${await three('k')}`)
ok('vaccinate, default: below 1% of N from g = 0.54, 0.22, 0.44; one chart with three curves', (await three('stops')) === '0.54 0.22 0.44' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length, C)) === 3, await three('stops'))
const ex6 = async () => {
  const out = { random: [], degree: [], acquaintance: [] }
  for (const g of [0.05, 0.1, 0.2, 0.3, 0.5]) {
    await setRange(C, 2, g)
    for (const s of Object.keys(out)) out[s].push((await strat(s)).size)
  }
  return `${out.random.join(' ')} | ${out.degree.join(' ')} | ${out.acquaintance.join(' ')}`
}
let e6 = await ex6()
ok('exercise 6, random network: 0.728 0.655 0.511 0.346 0.023 | 0.644 0.444 0.012 0.003 0.001 | 0.705 0.623 0.435 0.204 0.004', e6 === '0.728 0.655 0.511 0.346 0.023 | 0.644 0.444 0.012 0.003 0.001 | 0.705 0.623 0.435 0.204 0.004', e6)
await setRange(C, 2, 0)
ok('vaccinate, nobody immune: 0.800', (await strat('random')).size === '0.800', await three('size'))
await tap(`${C} button[data-source="pa"]`)
await sleep(300)
await waitData(IM, 'done', '1')
e6 = await ex6()
ok('exercise 6, preferential attachment: 0.711 0.638 0.500 0.377 0.149 | 0.074 0.004 0.001 0.000 0.000 | 0.574 0.388 0.023 0.004 0.001', e6 === '0.711 0.638 0.500 0.377 0.149 | 0.074 0.004 0.001 0.000 0.000 | 0.574 0.388 0.023 0.004 0.001', e6)
ok('vaccinate, preferential attachment: g_c 0.846; below 1% of N from 0.74, 0.08, 0.24', (await data(IM, 'gc')) === '0.846' && (await three('stops')) === '0.74 0.08 0.24', `${await data(IM, 'gc')} ${await three('stops')}`)
await setRange(C, 2, 0.05)
ok('vaccinate, preferential attachment, g = 0.05: mean degrees 4.16, 21.01, 11.70', (await three('k')) === '4.16 21.01 11.70', await three('k'))
await setRange(C, 1, 1)
await waitData(IM, 't', '1')
await waitData(IM, 'done', '1')
ok('vaccinate, preferential attachment, T = 1: g_c 0.923; below 1% from 0.84, 0.18, 0.4', (await data(IM, 'gc')) === '0.923' && (await three('stops')) === '0.84 0.18 0.4', `${await data(IM, 'gc')} ${await three('stops')}`)
await tap(`${C} button[data-source="poisson"]`)
await sleep(300)
await waitData(IM, 'done', '1')
ok('vaccinate, random network, T = 1: g_c 0.749; below 1% from 0.75, 0.42, 0.62', (await data(IM, 'gc')) === '0.749' && (await three('stops')) === '0.75 0.42 0.62', `${await data(IM, 'gc')} ${await three('stops')}`)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
