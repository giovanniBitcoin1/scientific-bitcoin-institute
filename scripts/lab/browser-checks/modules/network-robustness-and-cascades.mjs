// Functional checks of Network Lab module 11 "Robustness and cascades": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-11.mjs pins down in Node). It also times the
// page-load work and the jobs behind the buttons.
//
//   node modules/network-robustness-and-cascades.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
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
    for (const id of ['network', 'overload', 'coupled']) {
      const el = document.querySelector(`[data-readout="${id}"]`)
      if (!el) continue
      if (!window.__t[`${id}Shown`]) window.__t[`${id}Shown`] = performance.now()
      if ((id === 'network' || el.dataset.done === '1') && !window.__t[`${id}Done`]) window.__t[`${id}Done`] = performance.now()
    }
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
await go(p, `${site.url}${lab.basePath}/robustness-and-cascades`, 300)

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
const order = async (id) => {
  const sel = `${A} tr[data-order="${id}"]`
  return `${await data(sel, 'at')} ${await data(sel, 'fc')} ${await data(sel, 'r')}`
}

// ---- page load
const OV = `${B} [data-readout="overload"]`
const CP = `${C} [data-readout="coupled"]`
const bDone = await waitData(OV, 'done', '1')
const cDone = await waitData(CP, 'done', '1')
const T = await p.evaluate(() => window.__t)
console.log(`NOTE  page load: Panel B (one cascade, 400 nodes) done ${((T.overloadDone - T.overloadShown) / 1000).toFixed(1)} s after it appeared; Panel C (101 values of p, two networks of 10,000 nodes) ${((T.coupledDone - T.coupledShown) / 1000).toFixed(1)} s; both across animation frames`)
await settle(p)

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const FL = `${F1} [data-readout="fail"]`
ok('fail figure, start: 60 of 60 nodes, 117 links drawn', (await data(FL, 'size')) === '60' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg line`).length >= 117, F1)), await text(FL))
for (let i = 0; i < 10; i++) await tap(`${F1} button[data-action="attack"]`)
ok('fail figure: ten hubs removed leave a largest component of 9', (await data(FL, 'view')) === 'attack' && (await data(FL, 'removed')) === '10' && (await data(FL, 'size')) === '9', await data(FL, 'attack'))
for (let i = 0; i < 10; i++) await tap(`${F1} button[data-action="random"]`)
ok('fail figure: ten random removals leave 45, and both curves are on the chart', (await data(FL, 'view')) === 'random' && (await data(FL, 'size')) === '45' && (await data(FL, 'attack')).split(' ').length === 11 && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length, F1)) === 2, await data(FL, 'random'))
await tap(`${F1} button[data-action="reset"]`)
ok('fail figure: Start again returns to 60', (await data(FL, 'size')) === '60' && (await data(FL, 'removed')) === '0')

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const CS = `${F2} [data-readout="cascade"]`
ok('cascade figure, start: node A4 about to fail, 30 nodes and 15 dependence links drawn', (await data(CS, 'start')) === 'A4' && (await data(CS, 'round')) === '0' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg circle`).length === 30 && document.querySelectorAll(`${x} svg line`).length === 15, F2)), await text(CS))
const seen = []
for (let i = 0; i < 7; i++) {
  await tap(`${F2} button[data-action="next"]`)
  seen.push(await data(CS, 'broken'))
}
ok('cascade figure: seven rounds from A4, 7 of 15 pairs left, then the button stops', (await data(CS, 'round')) === '7' && (await data(CS, 'rounds')) === '7' && (await data(CS, 'left')) === '7' && seen[6] === '8' && (await p.evaluate((x) => document.querySelector(`${x} button[data-action="next"]`).disabled, F2)) && (await text(CS)).includes('7 of 15 pairs still work'), `${seen.join(' ')} | ${await text(CS)}`)
ok('cascade figure: the broken pairs never decrease', seen.every((v, i) => i === 0 || Number(v) >= Number(seen[i - 1])), seen.join(' '))
await tap(`${F2} g[data-node="B13"]`)
ok('cascade figure: clicking a node starts from there', (await data(CS, 'start')) === 'B13' && (await data(CS, 'round')) === '1', await text(CS))
await tap(`${F2} button[data-action="reset"]`)
ok('cascade figure: Start again returns to A4', (await data(CS, 'start')) === 'A4' && (await data(CS, 'round')) === '0')

// ---- Panel A
const NW = `${A} [data-readout="network"]`
ok('attack, default: 1,000 nodes, 1,997 links, f_c 0.905', (await data(NW, 'links')) === '1997' && (await data(NW, 'fc')) === '0.905', await text(NW))
ok('attack, default: random 0.881 / R 0.416, initial degree 0.272 / 0.101, recomputed 0.207 / 0.097', (await order('random')).endsWith('0.881 0.416') && (await order('degree')).endsWith('0.272 0.101') && (await order('recomputed')).endsWith('0.207 0.097'), `${await order('random')} | ${await order('degree')} | ${await order('recomputed')}`)
ok('attack: three curves before betweenness is added', (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`)[0].querySelectorAll('polyline').length, A)) === 3)
await setRange(A, 2, 0.1)
ok('attack, f = 0.10: recomputed degree leaves 0.539', (await order('recomputed')).startsWith('0.539'), await order('recomputed'))
let t0 = await now()
await tap(`${A} button[data-action="betweenness"]`)
const btw = await waitData(`${A} [data-readout="orders"]`, 'between', '1', 3000)
console.log(`NOTE  attack: betweenness recomputed before every removal, 1,000 nodes, took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('attack, betweenness (recomputed): 0.172 at f = 0.10, below 1% at 0.158, R 0.082', btw && (await order('between')) === '0.172 0.158 0.082', await order('between'))
t0 = await now()
await tap(`${A} button[data-action="robust"]`)
const RB = `${A} [data-readout="robust"]`
const rb = await waitData(RB, 'done', '1', 3000)
console.log(`NOTE  attack: "Make it robust" (20,000 swaps tried, 1,000 nodes) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
await sleep(500)
ok('attack, Make it robust: R 0.097 → 0.221, ρ −0.317 → 0.307, layered links 0.168 → 0.311', rb && (await data(RB, 'r0')) === '0.097' && (await data(RB, 'r1')) === '0.221' && (await data(RB, 'rho')) === '-0.317 0.307' && (await data(RB, 'layered')) === '0.168 0.311', `${await data(RB, 'r0')} ${await data(RB, 'r1')} ${await data(RB, 'rho')} ${await data(RB, 'layered')}`)
ok('attack, Make it robust: a before/after chart and two tables by degree class; degree-2 nodes linked to each other 0% → 20%, hubs 8% → 19%', (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`).length, RB)) === 3 && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length, RB)) === 2 && (await data(`${A} [data-readout="mixing"]`, 'names')) === '≤2 3 4 5–6 7–10 11–20 21+' && (await data(`${A} [data-readout="mixing"]`, 'diag0')).startsWith('0.000 ') && (await data(`${A} [data-readout="mixing"]`, 'diag1')).startsWith('0.20') && Number((await data(`${A} [data-readout="mixing"]`, 'diag0')).split(' ')[6]).toFixed(2) === '0.08' && Number((await data(`${A} [data-readout="mixing"]`, 'diag1')).split(' ')[6]).toFixed(2) === '0.19', `${await data(`${A} [data-readout="mixing"]`, 'diag0')} | ${await data(`${A} [data-readout="mixing"]`, 'diag1')}`)
await (await p.$(A)).screenshot({ path: path.join(SHOTS, 'el-robustness-and-cascades-panel1-robust-1280.png') })
await tap(`${A} button[data-source="poisson"]`)
await sleep(300)
ok('attack, random network: f_c 0.748, random 0.831, initial degree 0.491 / 0.244, recomputed 0.325 / 0.204; the earlier results are gone', (await data(NW, 'fc')) === '0.748' && (await order('random')).includes(' 0.831 ') && (await order('degree')).endsWith('0.491 0.244') && (await order('recomputed')).endsWith('0.325 0.204') && (await p.evaluate((x) => !document.querySelector(x), RB)) && (await data(`${A} [data-readout="orders"]`, 'between')) === '0', `${await data(NW, 'fc')} ${await order('random')} | ${await order('degree')} | ${await order('recomputed')}`)
await setRange(A, 0, 5)
await sleep(600)
const ex5 = async () => {
  const out = []
  for (const f of [0.5, 0.7, 0.8]) {
    await setRange(A, 2, f)
    out.push((await order('random')).split(' ')[0])
  }
  for (const f of [0.01, 0.05, 0.1, 0.2]) {
    await setRange(A, 2, f)
    out.push((await order('degree')).split(' ')[0])
  }
  return out.join(' ')
}
let e5 = await ex5()
ok('exercise 5, random network, N = 10,000: 0.399 0.095 0.004 at random, 0.970 0.921 0.854 0.687 by degree; "Make it robust" is disabled', e5 === '0.399 0.095 0.004 0.970 0.921 0.854 0.687' && (await p.evaluate((x) => document.querySelector(`${x} button[data-action="robust"]`).disabled, A)), e5)
ok('attack, random network, N = 10,000: random removal reaches 1% at 0.766', (await order('random')).includes(' 0.766 '), await order('random'))
await tap(`${A} button[data-source="pa"]`)
await sleep(600)
e5 = await ex5()
ok('exercise 5, preferential attachment, N = 10,000: 0.389 0.130 0.038 at random, 0.975 0.835 0.563 0.006 by degree; f_c 0.932', e5 === '0.389 0.130 0.038 0.975 0.835 0.563 0.006' && (await data(NW, 'fc')) === '0.932', `${e5} ${await data(NW, 'fc')}`)
await setRange(A, 0, 2)
await tap(`${A} button[data-source="power"]`)
await setRange(A, 2, 0.1)
ok('attack, power law γ = 2.5: ⟨k²⟩ 120.3, f_c 0.961, recomputed degree leaves 0.150 at f = 0.10', (await data(NW, 'mean2')) === '120.31' && (await data(NW, 'fc')) === '0.961' && (await order('recomputed')).startsWith('0.150'), `${await data(NW, 'mean2')} ${await data(NW, 'fc')} ${await order('recomputed')}`)

// ---- Panel B
ok('overload, default: G 0.070 after 2 rounds, 161 nodes failed, a drawing', bDone && (await data(OV, 'g')) === '0.070' && (await data(OV, 'rounds')) === '2.00' && (await data(OV, 'failed')) === '161.00' && (await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length, B)) === 1, await text(OV))
ok('overload: the panel names the most loaded node (degree 55, load 25,793, mean 939)', (await text(B)).includes('degree 55, load 25,793; the mean load is 939'))
await tap(`${B} button[data-trigger="random"]`)
await waitData(OV, 'done', '1')
ok('overload, random node: G 0.996, 1.25 nodes failed on average', (await data(OV, 'g')) === '0.996' && (await data(OV, 'failed')) === '1.25', await text(OV))
await tap(`${B} button[data-trigger="top"]`)
await waitData(OV, 'done', '1')
t0 = await now()
await tap(`${B} button[data-action="sweep-alpha"]`)
const SW = `${B} [data-readout="sweep"]`
const swept = await waitData(SW, 'done', '1', 3000)
console.log(`NOTE  overload: "Sweep α" (11 values, 21 cascades each, 400 nodes) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('overload, Sweep α, highest load: 0.008 0.048 0.070 0.155 0.508 0.758 0.898 0.953 0.958 0.968 0.993', swept && (await data(SW, 'top')) === '0.008 0.048 0.070 0.155 0.508 0.758 0.898 0.953 0.958 0.968 0.993', await data(SW, 'top'))
ok('overload, Sweep α, random node: 0.256 0.991 … 0.998; rounds 1 1 2 4 8 6 5 2 2 2 1', (await data(SW, 'random')).startsWith('0.256 0.991 0.996') && (await data(SW, 'random')).endsWith('0.998') && (await data(SW, 'rounds')) === '1 1 2 4 8 6 5 2 2 2 1', `${await data(SW, 'random')} | ${await data(SW, 'rounds')}`)
await tap(`${B} button[data-source="poisson"]`)
await waitData(OV, 'done', '1')
ok('overload, random network at α = 0.2: G 0.930', (await data(OV, 'g')) === '0.930' && (await text(B)).includes('load 3,704; the mean load is 1,057'), await text(OV))
await setRange(B, 1, 0.1)
await waitData(OV, 'done', '1')
ok('overload, random network at α = 0.1: G 0.058 after 7 rounds', (await data(OV, 'g')) === '0.058' && (await data(OV, 'rounds')) === '7.00', await text(OV))

// ---- Panel C
ok('coupled, default p = 0.70: mutual 0.555, single 0.647, 7 steps; threshold from 0.62, most steps 31 at 0.61', cDone && (await data(CP, 'mutual')) === '0.555' && (await data(CP, 'single')) === '0.647' && (await data(CP, 'rounds')) === '7' && (await data(CP, 'pc')) === '0.62' && (await data(CP, 'peak')) === '31 0.61', await text(CP))
ok('coupled: the theory is shown beside the measurement (0.558) and the formula gives 0.614', (await text(CP)).includes('theory 0.558') && (await text(CP)).includes('2.4554/⟨k⟩ = 0.614'))
const ex6 = []
for (const v of [0.6, 0.62, 0.65, 0.7, 0.8]) {
  await setRange(C, 2, v)
  ex6.push(await data(CP, 'mutual'))
}
ok('exercise 6: 0.000 0.365 0.461 0.555 0.707', ex6.join(' ') === '0.000 0.365 0.461 0.555 0.707', ex6.join(' '))
await setRange(C, 2, 0.61)
ok('coupled, p = 0.61: nothing left after 31 steps, the single network holds 0.539', (await data(CP, 'mutual')) === '0.000' && (await data(CP, 'rounds')) === '31' && (await data(CP, 'single')) === '0.539', await text(CP))
ok('coupled: two charts, four curves and one', (await p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join(' '), C)) === '4 1')
await setRange(C, 1, 6)
await waitData(CP, 'done', '1')
ok('coupled, mean degree 6: threshold from 0.41 (formula 0.409)', (await data(CP, 'pc')) === '0.41' && (await text(CP)).includes('= 0.409'), await text(CP))
await setRange(C, 1, 4)
await tap(`${C} button[data-kind="power"]`)
await waitData(CP, 'done', '1')
ok('coupled, two power-law networks: mean degree 4.40, mutual giant from 0.68 (formula 0.558), single from 0.13', (await data(CP, 'k')) === '4.403' && (await data(CP, 'pc')) === '0.68' && (await data(CP, 'pcsingle')) === '0.13' && (await text(CP)).includes('= 0.558'), await text(CP))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
