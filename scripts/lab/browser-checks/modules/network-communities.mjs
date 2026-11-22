// Functional checks of Network Lab module 09 "Communities": the two live
// figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-09.mjs pins down in Node). It also times the
// page-load work of Panel C and the three sweeps.
//
//   node modules/network-communities.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

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
    const el = document.querySelector('[data-readout="detect"]')
    if (!el) return
    if (!window.__t.shown) window.__t.shown = performance.now()
    if (el.dataset.done === '1' && !window.__t.done) window.__t.done = performance.now()
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
await go(p, `${site.url}${lab.basePath}/communities`, 300)

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
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, sel)
  await sleep(200)
}
const waitData = async (sel, key, want, tries = 1200) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, key)) === want) return true
    await sleep(100)
  }
  return false
}
const r3 = (s) => Number(s).toFixed(3)

// ---- page load: Panel C runs one network at once
const DET = `${C} [data-readout="detect"]`
const cDone = await waitData(DET, 'done', '1')
const T = await p.evaluate(() => window.__t)
console.log(`NOTE  page load: Panel C (4,000 nodes, spectral bisection and Louvain) done ${((T.done - T.shown) / 1000).toFixed(1)} s after it appeared, across animation frames`)
await settle(p)

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const SP = `${F1} [data-readout="split"]`
ok('split figure, start: Q 0.235, inside 0.735, expected 0.500', r3(await data(SP, 'q')) === '0.235' && r3(await data(SP, 'inside')) === '0.735' && r3(await data(SP, 'expected')) === '0.500', await text(SP))
ok('split figure: 16 nodes and 34 links drawn', await p.evaluate((x) => document.querySelectorAll(`${x} svg g[data-node]`).length === 16 && document.querySelectorAll(`${x} svg line`).length === 34, F1))
await tap(`${F1} g[data-node="2"]`)
const afterTap = await data(SP, 'q')
ok('split figure: tapping node 3 moves it back and raises Q', Number(afterTap) > 0.235, afterTap)
await tap(`${F1} button[data-action="best"]`)
ok('split figure, best split: Q 0.411, inside 0.912', r3(await data(SP, 'q')) === '0.411' && r3(await data(SP, 'inside')) === '0.912' && (await data(SP, 'best')) === '1', await text(SP))
await tap(`${F1} button[data-action="reset"]`)
ok('split figure: Start again returns to 0.235', r3(await data(SP, 'q')) === '0.235')

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const RG = `${F2} [data-readout="ring"]`
ok('ring figure, n = 16: each clique wins', Number(await data(RG, 'one')) > Number(await data(RG, 'pairs')), `${await data(RG, 'one')} ${await data(RG, 'pairs')}`)
await setRange(F2, 0, 30)
ok('ring figure, n = 30: 0.8758 and 0.8879 (exercise 2)', (await data(RG, 'one')) === '0.8758' && (await data(RG, 'pairs')) === '0.8879', `${await data(RG, 'one')} ${await data(RG, 'pairs')}`)
await setRange(F2, 0, 22)
ok('ring figure, n = 22: a tie', (await data(RG, 'one')) === (await data(RG, 'pairs')))
await tap(`${F2} button[data-view="pairs"]`)
ok('ring figure: the pairs view is selected', await p.evaluate((x) => document.querySelector(`${x} button[data-view="pairs"]`).getAttribute('aria-pressed') === 'true', F2))

// ---- Panel A
const FD = `${A} [data-readout="find"]`
ok('find, default: planted Q 0.389, found 0.391, 4 groups, NMI 0.925', r3(await data(FD, 'qplanted')) === '0.389' && r3(await data(FD, 'qfound')) === '0.391' && (await data(FD, 'groups')) === '4' && r3(await data(FD, 'nmi')) === '0.925', await text(FD))
ok('find: a drawing of the network', await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 1, A))
let t0 = await now()
await tap(`${A} button[data-action="sweep"]`)
const SWA = `${A} [data-readout="sweep-a"]`
const sweptA = await waitData(SWA, 'done', '1')
console.log(`NOTE  find: "Sweep k_out" (13 values, 20 networks, two methods) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('find, sweep: Louvain NMI 1.000 … 0.996 0.975 0.793 0.448 0.217 0.132 0.074 0.049', sweptA && (await data(SWA, 'louvain')) === '1.000 1.000 1.000 1.000 1.000 0.996 0.975 0.793 0.448 0.217 0.132 0.074 0.049', await data(SWA, 'louvain'))
ok('find, sweep: label propagation 1.000 1.000 1.000 0.993 0.920 0.768 0.427 0.000 0.007 0.000 …', (await data(SWA, 'lp')) === '1.000 1.000 1.000 0.993 0.920 0.768 0.427 0.000 0.007 0.000 0.000 0.000 0.000', await data(SWA, 'lp'))
t0 = await now()
await tap(`${A} button[data-action="random"]`)
const RQ = `${A} [data-readout="random-q"]`
const rDone = await waitData(RQ, 'done', '1')
console.log(`NOTE  find: "Random networks" (15 networks of 1,000 nodes) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('find, random networks: Q 0.522 0.325 0.226', rDone && (await data(RQ, 'q')) === '0.522 0.325 0.226', await data(RQ, 'q'))
await tap(`${A} button[data-source="random"]`)
ok('find, random network of the panel: Q 0.204 in 7 groups, blocks −0.011', r3(await data(FD, 'qfound')) === '0.204' && (await data(FD, 'groups')) === '7' && r3(await data(FD, 'qplanted')) === '-0.011', await text(FD))
await tap(`${A} button[data-method="lp"]`)
ok('find, random network, label propagation: one group', (await data(FD, 'groups')) === '1')
await tap(`${A} button[data-source="karate"]`)
await tap(`${A} button[data-method="louvain"]`)
ok('find, karate club: factions 0.358, Louvain seed 1 4 groups Q 0.419, NMI 0.490', r3(await data(FD, 'qplanted')) === '0.358' && r3(await data(FD, 'qfound')) === '0.419' && (await data(FD, 'groups')) === '4' && r3(await data(FD, 'nmi')) === '0.490', await text(FD))
ok('find, karate club: no k_out slider', await p.evaluate((x) => document.querySelectorAll(`${x} input[type=range]`).length === 0, A))
let best = 0
for (let s = 0; s < 30; s++) {
  best = Math.max(best, Number(await data(FD, 'qfound')))
  await tap(`${A} button[data-action="seed"]`)
}
ok('find, karate club: stepping through 30 seeds reaches 0.4198', best.toFixed(4) === '0.4198', String(best))

// ---- Panel B
const RS = `${B} [data-readout="resolution"]`
ok('resolution, default: 0.8758 and 0.8879, Louvain 16 groups, 28 merged, γ range 1.364–31.059', (await data(RS, 'one')) === '0.8758' && (await data(RS, 'pairs')) === '0.8879' && (await data(RS, 'groups')) === '16' && (await data(RS, 'merged')) === '28' && (await data(RS, 'lo')) === '1.364' && (await data(RS, 'hi')) === '31.059', await text(RS))
ok('resolution: a drawing of the ring', await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 1, B))
await setRange(B, 2, 434) // γ ≈ 2 on the log slider (0.1–100)
ok('resolution, γ = 2: the 30 cliques', (await data(RS, 'gamma')) === '2' && (await data(RS, 'groups')) === '30' && (await data(RS, 'split')) === '0', `${await data(RS, 'gamma')} ${await text(RS)}`)
await setRange(B, 2, 333) // γ = 1
await setRange(B, 0, 20)
ok('resolution, n = 20: one group per clique', (await data(RS, 'groups')) === '20' && (await data(RS, 'merged')) === '0', await text(RS))
await setRange(B, 0, 60)
await setRange(B, 1, 3)
ok('resolution, n = 60, s = 3: 0.7333 against 0.8417, Louvain 14 groups', (await data(RS, 'one')) === '0.7333' && (await data(RS, 'pairs')) === '0.8417' && (await data(RS, 'groups')) === '14', await text(RS))

// ---- Panel C
ok('detect, default: overlap 0.725, Louvain Q 0.281 with 12 groups, NMI 0.021', cDone && (await data(DET, 'overlap')) === '0.725' && (await data(DET, 'lq')) === '0.281' && (await data(DET, 'lg')) === '12' && (await data(DET, 'ln')) === '0.021', await text(DET))
t0 = await now()
await tap(`${C} button[data-action="sweep"]`)
const SWC = `${C} [data-readout="sweep-c"]`
const sweptC = await waitData(SWC, 'done', '1', 3000)
console.log(`NOTE  detect: "Sweep" (11 multiples, 3 networks of 4,000 nodes) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('detect, sweep: overlap 0.015 0.014 0.016 0.023 0.013 0.120 0.463 0.710 0.928 0.987 1.000', sweptC && (await data(SWC, 'overlap')) === '0.015 0.014 0.016 0.023 0.013 0.120 0.463 0.710 0.928 0.987 1.000', await data(SWC, 'overlap'))
ok('detect, sweep: a chart with the threshold marked', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length === 2, C))
await setRange(C, 1, 3)
await setRange(C, 2, 3)
ok('detect, c̄ = 3: the multiple is clamped at √3 and c_out shows 0.00', (await text(C)).includes('1.73') && (await text(DET)).includes('0.00'), await text(DET))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
