// Functional checks of Network Lab module 13 "Social contagion and network
// effects": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones quoted
// in the lecture, the "what to observe" lists and the exercises (the same
// numbers that scripts/lab/check-network-13.mjs pins down in Node). It also
// times the page-load work and the jobs behind the buttons.
//
//   node modules/network-social-contagion-network-effects.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
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
    for (const id of ['crowd', 'cascades', 'ties']) {
      const el = document.querySelector(`[data-readout="${id}"]`)
      if (!el) continue
      if (!window.__t[`${id}Shown`]) window.__t[`${id}Shown`] = performance.now()
      if (id === 'ties' && el.dataset.done === '1' && !window.__t.tiesDone) window.__t.tiesDone = performance.now()
    }
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
const t00 = Date.now()
await go(p, `${site.url}${lab.basePath}/social-contagion-network-effects`, 300)

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
const lines = (scope) => p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join(' '), scope)

// ---- page load
const TI = `${C} [data-readout="ties"]`
const cDone = await waitData(TI, 'done', '1')
const T = await p.evaluate(() => window.__t)
console.log(`NOTE  page load: Panel A (one crowd) and Panel B (a network of 10,000 nodes and 200 cascades) are computed while the page renders, ${((Date.now() - t00) / 1000).toFixed(1)} s from navigation to the last panel done; Panel C (100 small-world networks, two contagions on each) done ${((T.tiesDone - T.tiesShown) / 1000).toFixed(1)} s after it appeared, across animation frames`)
await settle(p)

// ---- F2, "Wrong together" (first in the lecture)
const F2 = 'figure:nth-of-type(1)'
const SQ = `${F2} [data-readout="sequence"]`
const BA = `${F2} [data-readout="batch"]`
ok('cascade figure, start: q = 0.6, thirty people; the cascade starts with person 3, is right, and 12 of the 28 who follow had a signal against it', (await data(SQ, 'q')) === '0.6' && (await data(SQ, 'start')) === '2' && (await data(SQ, 'right')) === '1' && (await data(SQ, 'against')) === '12' && (await data(SQ, 'signals')).length === 30 && (await p.evaluate((x) => document.querySelectorAll(`${x} svg g[data-person]`).length, F2)) === 30, await text(SQ))
ok('cascade figure: before the cascade the choices are the signals, after it they are all the same', await p.evaluate((x) => {
  const d = document.querySelector(x).dataset
  const s = Number(d.start)
  return d.choices.slice(0, s) === d.signals.slice(0, s) && new Set(d.choices.slice(s)).size === 1
}, SQ))
await tap(`${F2} button[data-action="batch"]`)
ok('cascade figure, 1,000 runs at q = 0.6: 1,000 cascades, 316 wrong (0.316; formula 0.308), majority right 0.846 (0.864 expected)', (await data(BA, 'cascades')) === '1000' && (await data(BA, 'wrong')) === '316' && (await data(BA, 'share')) === '0.316' && ['0.845', '0.846'].includes(await data(BA, 'majority')) && (await text(BA)).includes('0.308') && (await text(BA)).includes('0.846') && (await text(BA)).includes('0.864'), await text(BA))
await tap(`${F2} button[data-action="next"]`)
ok('cascade figure: "New sequence" draws another one', (await data(SQ, 'index')) === '1' && (await data(SQ, 'signals')) !== '111110101110010111000010101101', await text(SQ))
await setRange(F2, 0, 0.9)
ok('cascade figure, q = 0.9: a new sequence, and the batch of the other q is gone', (await data(SQ, 'q')) === '0.9' && (await data(SQ, 'index')) === '0' && !(await p.$(BA)))
await tap(`${F2} button[data-action="batch"]`)
ok('cascade figure, 1,000 runs at q = 0.9 (the second batch drawn on this page): 15 wrong, 0.015 (formula 0.012)', (await data(BA, 'wrong')) === '15' && (await data(BA, 'share')) === '0.015' && (await text(BA)).includes('0.012'), await text(BA))

// ---- F1, "The riot that almost happened"
const F1 = 'figure:nth-of-type(2)'
const RI = `${F1} [data-readout="riot"]`
const inCount = () => p.evaluate((x) => document.querySelectorAll(`${x} svg g[data-in="1"]`).length, F1)
ok('riot figure, start: a hundred people, thresholds 0 to 99, nobody in', (await data(RI, 'state')) === 'idle' && (await data(RI, 'outcome')) === '100' && (await inCount()) === 0 && (await p.evaluate((x) => [...document.querySelectorAll(`${x} svg g[data-person]`)].every((g, i) => g.dataset.threshold === String(i)) && document.querySelectorAll(`${x} svg g[data-person]`).length === 100, F1)))
let t0 = await now()
await tap(`${F1} button[data-action="start"]`)
let done = await waitData(RI, 'state', 'done', 200)
console.log(`NOTE  riot figure: a hundred people join one by one in ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('riot figure, Start: all 100 join', done && (await data(RI, 'joined')) === '100' && (await inCount()) === 100, await text(RI))
await tap(`${F1} g[data-person="1"]`)
ok('riot figure: a tap on the person with threshold 1 makes it 2 and clears the riot; the outcome is now 1', (await p.evaluate((x) => document.querySelector(`${x} g[data-person="1"]`).dataset.threshold, F1)) === '2' && (await data(RI, 'state')) === 'idle' && (await data(RI, 'outcome')) === '1' && (await inCount()) === 0)
await tap(`${F1} button[data-action="start"]`)
done = await waitData(RI, 'state', 'done', 100)
ok('riot figure, Start again: the riot stops at 1 person', done && (await data(RI, 'joined')) === '1' && (await inCount()) === 1 && (await text(RI)).includes('stops at 1 person'), await text(RI))
await tap(`${F1} button[data-action="down"]`)
await tap(`${F1} g[data-person="1"]`)
ok('riot figure: lowered back by one, the outcome is 100 again', (await data(RI, 'outcome')) === '100' && (await data(RI, 'changed')) === '0')
await tap(`${F1} g[data-person="0"]`)
ok('riot figure: a threshold never goes below 0', (await p.evaluate((x) => document.querySelector(`${x} g[data-person="0"]`).dataset.threshold, F1)) === '0')
await tap(`${F1} button[data-action="up"]`)
await tap(`${F1} g[data-person="50"]`)
ok('riot figure: person 50 raised by one, the riot would stop at 50; Reset restores 0 to 99', (await data(RI, 'outcome')) === '50')
await tap(`${F1} button[data-action="reset"]`)
ok('riot figure: Reset', (await data(RI, 'outcome')) === '100' && (await data(RI, 'changed')) === '0' && (await data(RI, 'state')) === 'idle')

// ---- Panel A
const CR = `${A} [data-readout="crowd"]`
ok('tipping, a crowd, default: mean 25, standard deviation 12; this crowd ends at 2 (staircase 0 2), the smooth curve at 4.0; one chart with four lines', (await data(CR, 'outcome')) === '2' && (await data(CR, 'stairs')) === '0 2' && (await data(CR, 'smooth')) === '4.0' && (await lines(A)) === '4', `${await text(CR)} | ${await lines(A)}`)
await tap(`${A} button[data-action="many"]`)
ok('tipping, 200 crowds: 0.170 end above 50, average outcome 19.1', (await data(CR, 'above')) === '0.170' && (await data(CR, 'average')) === '19.1' && (await data(`${A} [data-readout="histogram"]`, 'bins')).split(' ').reduce((a, b) => a + Number(b), 0) === 200, await text(CR))
t0 = await now()
await tap(`${A} button[data-action="sweep"]`)
console.log(`NOTE  tipping: "Sweep the standard deviation" (50 values, 200 crowds each) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
const SWA = `${A} [data-readout="sdsweep"]`
const smooth = ((await data(SWA, 'smooth')) || '').split(' ')
const above = ((await data(SWA, 'above')) || '').split(' ')
// the page's chart is drawn from the same numbers; the texts round 0.365 to 0.37 as toLocaleString does, toFixed gives 0.36
ok('tipping, sweep: the smooth curve is 4.0 at 12 and 100.0 at 13, 90.5 at 50; the share of crowds above 50 is 0.04, 0.17, 0.36/0.37, 0.65, 0.85 at 11 to 15 and 1.00 at 20', smooth[11] === '4.0' && smooth[12] === '100.0' && smooth[49] === '90.5' && above[10] === '0.04' && above[11] === '0.17' && ['0.36', '0.37'].includes(above[12]) && above[13] === '0.65' && above[14] === '0.85' && above[19] === '1.00', `${smooth.slice(9, 15).join(' ')} | ${above.slice(9, 20).join(' ')}`)
await setRange(A, 1, 15)
ok('tipping, standard deviation 15: this crowd ends at 100, and the histogram of the other setting is gone', (await data(CR, 'outcome')) === '100' && (await data(CR, 'above')) === '' && !(await p.$(`${A} [data-readout="histogram"]`)), await text(CR))
await tap(`${A} button[data-action="many"]`)
ok('tipping, standard deviation 15: 0.850 of 200 crowds end above 50', (await data(CR, 'above')) === '0.850', await text(CR))
await setRange(A, 1, 10)
await tap(`${A} button[data-action="many"]`)
ok('tipping, standard deviation 10: this crowd ends at 0 and no crowd passes 50', (await data(CR, 'outcome')) === '0' && (await data(CR, 'above')) === '0.000', await text(CR))
await tap(`${A} button[data-action="again"]`)
ok('tipping: "New crowd" draws another crowd', (await data(CR, 'index')) === '1')
await (await p.$(A)).screenshot({ path: path.join(SHOTS, 'el-social-contagion-network-effects-panel1-sweep-1280.png') })
await tap(`${A} button[data-view="market"]`)
const MK = `${A} [data-readout="market"]`
ok('tipping, a market, default: price 0.16, tipping point 0.200, stable share 0.800; from 0.25 the path is 0.250 0.360 0.556 0.712 0.775 … 0.800', (await data(MK, 'tipping')) === '0.200' && (await data(MK, 'high')) === '0.800' && (await data(MK, 'end')) === '0.800' && (await data(MK, 'path')).startsWith('0.250 0.360 0.556 0.712 0.775'), await text(MK))
await setRange(A, 1, 0.15)
ok('tipping, a market, starting share 0.15: back to 0.000 at the first step', (await data(MK, 'end')) === '0.000' && (await data(MK, 'path')).startsWith('0.150 0.000'), await text(MK))
await setRange(A, 0, 0.26)
await setRange(A, 1, 0.9)
ok('tipping, a market, price 0.26: no tipping point, and even from 0.90 the share ends at 0', (await data(MK, 'tipping')) === '' && (await data(MK, 'end')) === '0.000' && (await text(MK)).includes('above 1/4'), await text(MK))
await tap(`${A} button[data-view="bass"]`)
const BS = `${A} [data-readout="bass"]`
ok('tipping, Bass, default: fastest at 6.19 years with 0.461 adopted, 0.1106 a year; 0.331 after 5 years and 0.813 after 10', (await data(BS, 't')) === '6.19' && (await data(BS, 'f')) === '0.461' && (await data(BS, 'rate')) === '0.1106' && (await data(BS, 'f5')) === '0.331' && (await data(BS, 'f10')) === '0.813', await text(BS))
await setRange(A, 1, 0)
ok('tipping, Bass, q = 0: fastest at the start, and 0.259 after 10 years', (await data(BS, 't')) === '0.00' && (await data(BS, 'f10')) === '0.259' && (await lines(A)) === '1 1', await text(BS))

// ---- Panel B
const CA = `${B} [data-readout="cascades"]`
const WI = `${B} [data-readout="window"]`
ok('window, default: 20,000 links, 0.765 vulnerable, condition 1.75, 0.875 global, mean size 0.979; window 1.02 to 5.76', (await data(CA, 'links')) === '20000' && (await data(CA, 'vulnerable')) === '0.765' && (await data(CA, 'condition')) === '1.75' && (await data(CA, 'global')) === '0.875' && (await data(CA, 'size')) === '0.979' && (await data(CA, 'window')) === '1.02 5.76', await text(CA))
t0 = await now()
await tap(`${B} button[data-action="sweep"]`)
let swept = await waitData(WI, 'done', '1', 3000)
console.log(`NOTE  window: "Sweep the mean degree" (31 networks of 10,000 nodes, 200 cascades each) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
let g = ((await data(WI, 'global')) || '').split(' ')
let sz = ((await data(WI, 'size')) || '').split(' ')
ok('window, sweep: nothing up to z = 1; 0.35/0.36 at 1.25, 0.89 at 3.75, 0.72 at 5, 0.39 at 5.5, 0.18 at 5.75, 0.01 at 6; two curves', swept && ['0.5:0.00', '1:0.00', '3.75:0.89', '5:0.72', '5.5:0.39', '5.75:0.18', '6:0.01'].every((x) => g.includes(x)) && (g.includes('1.25:0.35') || g.includes('1.25:0.36')) && (await lines(B)).endsWith('2'), g.join(' '))
ok('window, sweep: mean size of the global cascades 0.366 at 1.25, 0.801 at 2, 0.979 at 4, 0.997 at 5.75', ['1.25:0.366', '2:0.801', '4:0.979', '5.75:0.997'].every((x) => sz.includes(x)), sz.join(' '))
await (await p.$(B)).screenshot({ path: path.join(SHOTS, 'el-social-contagion-network-effects-panel2-sweep-1280.png') })
const globals = []
for (const z of [3, 5, 5.8, 6.2, 6, 5.75]) {
  await setRange(B, 1, z)
  globals.push(await data(CA, 'global'))
}
ok('exercise 6b: 0.850, 0.720, 0.225, 0.005 at z = 3, 5, 5.8, 6.2; 0.010 at 6 and 0.180 at 5.75', globals.join(' ') === '0.850 0.720 0.225 0.005 0.010 0.180', globals.join(' '))
await setRange(B, 1, 6)
ok('window, z = 6: condition 0.90', (await data(CA, 'condition')) === '0.90', await text(CA))
await setRange(B, 1, 4)
await tap(`${B} button[data-source="pa"]`)
ok('window, preferential attachment at z = 4: 0.860 vulnerable, 0.285 global; the 20 largest hubs have at least 57 links; the sweep of the other network is gone', (await data(CA, 'vulnerable')) === '0.860' && (await data(CA, 'global')) === '0.285' && (await data(CA, 'ktop')) === '57' && !(await p.$(WI)), await text(CA))
await tap(`${B} button[data-seeds="top"]`)
ok('window, preferential attachment, seeds among the 20 largest hubs: 1.000', (await data(CA, 'global')) === '1.000', await text(CA))
await tap(`${B} button[data-source="poisson"]`)
ok('window, random network, seeds among the 20 largest hubs: 1.000 at z = 4', (await data(CA, 'global')) === '1.000', await text(CA))
await setRange(B, 1, 7)
ok('window, random network at z = 7: no hub starts anything', (await data(CA, 'global')) === '0.000', await text(CA))
await setRange(B, 1, 4)
await tap(`${B} button[data-seeds="random"]`)
const phis = []
for (const phi of [0.1, 0.25, 0.3]) {
  await setRange(B, 0, phi)
  phis.push(`${await data(CA, 'global')} [${await data(CA, 'window')}]`)
}
ok('window, z = 4, other thresholds: 0.975 at φ = 0.10 (window 1.00 to 13.66), 0.020 at 0.25 (1.11 to 3.86), 0.000 at 0.30 (no window)', phis.join(' | ') === '0.975 [1.00 13.66] | 0.020 [1.11 3.86] | 0.000 []', phis.join(' | '))

// ---- Panel C
const tie = async (pv) => {
  const sel = `${C} tr[data-p="${pv}"]`
  return { simple: await data(sel, 'simple'), complex: await data(sel, 'complex'), reached: await data(sel, 'reached'), share: await data(sel, 'share') }
}
const t0c = await tie('0')
const t001 = await tie('0.001')
const t01 = await tie('0.01')
const t03 = await tie('0.03')
const t1 = await tie('0.1')
const t2 = await tie('0.2')
const t3 = await tie('0.3')
const t5 = await tie('0.5')
const tOne = await tie('1')
ok('ties, the ring: 562 steps with simple contagion and 749 with complex', cDone && t0c.simple === '562.0' && t0c.complex === '749.0' && (await text(TI)).includes('562') && (await text(TI)).includes('749'), `${t0c.simple} ${t0c.complex}`)
ok('ties: 91.1 and 748.4 at p = 0.001; 19.4 and 685.9 at 0.01; complex 252.9 at 0.03, 76.0 at 0.1, 49.5 at 0.2', t001.simple === '91.1' && t001.complex === '748.4' && t01.simple === '19.4' && t01.complex === '685.9' && t03.complex === '252.9' && t1.complex === '76.0' && t2.complex === '49.5', `${t001.simple} ${t001.complex} | ${t01.simple} ${t01.complex} | ${t03.complex} ${t1.complex} ${t2.complex}`)
ok('ties: at p = 0.3 complex contagion reaches 90% in 8 networks of 10; at 0.5 it reaches 0.005 of the nodes and at 1 0.002; simple needs 6.8, 4.1 and 4.0 steps at 0.1, 0.5 and 1', t3.reached === '8' && t5.reached === '0' && t5.share === '0.005' && tOne.share === '0.002' && t1.simple === '6.8' && t5.simple === '4.1' && tOne.simple === '4.0' && (await text(TI)).includes('does not spread'), `${t3.reached} ${t5.share} ${tOne.share} | ${t1.simple} ${t5.simple} ${tOne.simple}`)
ok('ties: two charts with two curves each', (await lines(C)) === '2 2', await lines(C))
t0 = await now()
await tap(`${C} button[data-view="clusters"]`)
const CL = `${C} [data-readout="clusters"]`
let clDone = await waitData(CL, 'done', '1')
console.log(`NOTE  clusters: 21 values of k_out, 20 networks of 1,000 nodes each, took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
const shares = async () => Object.fromEntries(((await data(CL, 'shares')) || '').split(' ').map((x) => x.split(':')))
let sh = await shares()
ok('clusters, default q = 0.5, k_out = 4: 0.780 of the second group, in 15 networks of 20; average outside share 0.286; the average point is k_out = 10', clDone && (await data(CL, 'share')) === '0.780' && (await data(CL, 'over')) === '15' && (await data(CL, 'average')) === '10.00' && (await text(CL)).includes('0.286') && (await text(CL)).includes('15 of 20'), await text(CL))
ok('clusters, q = 0.5: 0.000 at k_out = 0, 0.044 at 3, 0.090 at 3.5, 1.000 at 4.5 and at 10', sh['0'] === '0.000' && sh['3'] === '0.044' && sh['3.5'] === '0.090' && sh['4.5'] === '1.000' && sh['10'] === '1.000', JSON.stringify(sh))
await setRange(C, 0, 0.4)
await waitData(CL, 'q', '0.4')
clDone = await waitData(CL, 'done', '1')
sh = await shares()
ok('clusters, q = 0.4: 0.114 at k_out = 2 and 0.956 at 2.5; the average point is 6.67', clDone && sh['2'] === '0.114' && sh['2.5'] === '0.956' && (await data(CL, 'average')) === '6.67', JSON.stringify(sh))
await setRange(C, 0, 0.3)
await waitData(CL, 'q', '0.3')
clDone = await waitData(CL, 'done', '1')
await setRange(C, 1, 1)
ok('clusters, q = 0.3, k_out = 1: the group falls in 11 networks of 20; the average point is 4.29', clDone && (await data(CL, 'over')) === '11' && (await data(CL, 'average')) === '4.29', await text(CL))
await (await p.$(C)).screenshot({ path: path.join(SHOTS, 'el-social-contagion-network-effects-panel3-clusters-1280.png') })

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
