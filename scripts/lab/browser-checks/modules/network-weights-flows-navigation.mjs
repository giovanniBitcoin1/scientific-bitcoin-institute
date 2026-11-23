// Functional checks of Network Lab module 10 "Weights, flows and navigation":
// the two live figures and the three panels are driven like a reader would,
// and the numbers they show are compared with the ones quoted in the lecture,
// the "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-10.mjs pins down in Node). It also times the
// page-load work of Panels A and B and the two sweeps of Panel C.
//
//   node modules/network-weights-flows-navigation.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
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
    for (const id of ['routes', 'payments']) {
      const el = document.querySelector(`[data-readout="${id}"]`)
      if (!el) continue
      if (!window.__t[`${id}Shown`]) window.__t[`${id}Shown`] = performance.now()
      if (el.dataset.done === '1' && !window.__t[`${id}Done`]) window.__t[`${id}Done`] = performance.now()
    }
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
await go(p, `${site.url}${lab.basePath}/weights-flows-navigation`, 300)

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
const r2 = (s) => Number(s).toFixed(2)

// ---- page load: Panel A runs 200 sources, Panel B analyses 500 pairs
const RT = `${A} [data-readout="routes"]`
const PY = `${B} [data-readout="payments"]`
const aDone = await waitData(RT, 'done', '1')
const bDone = await waitData(PY, 'done', '1')
const T = await p.evaluate(() => window.__t)
console.log(`NOTE  page load: Panel A (routes and betweenness from 200 sources, 2,000 nodes) done ${((T.routesDone - T.routesShown) / 1000).toFixed(1)} s after it appeared; Panel B (500 pairs, 1,000 nodes) ${((T.paymentsDone - T.paymentsShown) / 1000).toFixed(1)} s; both across animation frames`)
await settle(p)

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const ST = `${F1} [data-readout="strength"]`
ok('strength figure, start (exercise 1): s 10, k 6, Y 0.3000, 1/k 0.1667, α of link 1 0.0313, one link kept', (await data(ST, 's')) === '10' && (await data(ST, 'k')) === '6' && (await data(ST, 'y')) === '0.3000' && (await data(ST, 'even')) === '0.1667' && (await data(ST, 'alpha')).startsWith('0.0313 0.5905') && (await data(ST, 'kept')) === '1', await text(ST))
ok('strength figure: six links drawn and six sliders', await p.evaluate((x) => document.querySelectorAll(`${x} svg line`).length === 6 && document.querySelectorAll(`${x} input[type=range]`).length === 6, F1))
await tap(`${F1} button[data-action="equal"]`)
ok('strength figure, all equal: Y = 1/k = 0.1667 and no link kept', (await data(ST, 'y')) === '0.1667' && (await data(ST, 'kept')) === '0', await text(ST))
await setRange(F1, 0, 20)
ok('strength figure: raising one weight to 20 raises Y and marks that link', Number(await data(ST, 'y')) > 0.3 && (await data(ST, 'kept')) === '1' && (await text(F1)).includes('★'), await data(ST, 'y'))
await tap(`${F1} button[data-action="reset"]`)
ok('strength figure: Start again returns to Y 0.3000', (await data(ST, 'y')) === '0.3000')

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const FL = `${F2} [data-readout="flow"]`
ok('flow figure, exercise 3: widest 2, maximum flow 5, cut {s→a, s→b} = 5', (await data(FL, 'widest')) === '2' && (await data(FL, 'maxflow')) === '5' && (await data(FL, 'cut')) === '5' && (await data(FL, 'cutarcs')) === 's→a s→b', await text(FL))
ok('flow figure, exercise 3: routes s–a–t 2, s–a–b–t 1, s–b–t 2', (await data(FL, 'paths')).split(', ').sort().join('; ') === 's–a–b–t 1; s–a–t 2; s–b–t 2', await data(FL, 'paths'))
await tap(`${F2} button[data-view="flow"]`)
ok('flow figure: the flow view writes flow / capacity on the links', (await text(F2)).includes('3/3') && (await text(FL)).includes('maximum flow is 5'), await text(FL))
await tap(`${F2} button[data-view="cut"]`)
ok('flow figure: the cut view names the links of the cut', (await text(FL)).includes('s→a and s→b'), await text(FL))
await tap(`${F2} button[data-preset="six"]`)
ok('flow figure, six nodes: widest 3, maximum flow 8, the four middle links cut', (await data(FL, 'widest')) === '3' && (await data(FL, 'maxflow')) === '8' && (await data(FL, 'cutarcs')) === 'a→c a→d b→c b→d', await text(FL))

// ---- Panel A
const WG = `${A} [data-readout="weights"]`
const BB = `${A} [data-readout="backbone"]`
ok('weights, default: β 1.45, 5,994 links, two charts', r2(await data(WG, 'beta')) === '1.45' && (await data(WG, 'links')) === '5994' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`).length, A)) === 2, await data(WG, 'beta'))
ok('weights, backbone at 0.05: links 0.046, weight 0.195, nodes 0.141, largest 0.112', (await data(BB, 'links')) === '0.046' && (await data(BB, 'weight')) === '0.195' && (await data(BB, 'nodes')) === '0.141' && (await data(BB, 'largest')) === '0.112', await text(BB))
ok('weights, routes: 67.5% of pairs differ, 3.71 → 4.80 links, ρ 0.660', aDone && (await data(RT, 'differ')) === '0.675' && (await data(RT, 'hops')) === '3.71 4.80' && (await data(RT, 'rho')) === '0.660', await text(RT))
await setRange(A, 3, 853) // α ≈ 0.2 on the log slider (0.001–0.5)
ok('weights, backbone at 0.2: links 0.229, weight 0.519, nodes 0.601, largest 0.546', (await data(BB, 'alpha')) === '0.2' && (await data(BB, 'links')) === '0.229' && (await data(BB, 'weight')) === '0.519' && (await data(BB, 'nodes')) === '0.601' && (await data(BB, 'largest')) === '0.546', `${await data(BB, 'alpha')} ${await text(BB)}`)
await setRange(A, 3, 629) // back to α ≈ 0.05
ok('weights: the α slider returns to 0.05', (await data(BB, 'alpha')) === '0.05' && (await data(BB, 'links')) === '0.046', await data(BB, 'alpha'))
await tap(`${A} button[data-action="shuffle"]`)
await waitData(RT, 'done', '1')
ok('weights, shuffled: β 1.01, largest component of the backbone 0.013', r2(await data(WG, 'beta')) === '1.01' && (await data(BB, 'largest')) === '0.013', `${await data(WG, 'beta')} ${await text(BB)}`)
await tap(`${A} button[data-action="shuffle"]`)
await setRange(A, 1, 1)
await waitData(RT, 'done', '1')
ok('weights, θ = 1: 15.2% of the links hold 69.0% of the weight', (await data(BB, 'links')) === '0.152' && (await data(BB, 'weight')) === '0.690', await text(BB))
await setRange(A, 1, 0)
await setRange(A, 2, 0)
await sleep(300)
await waitData(RT, 'done', '1')
ok('weights, θ = 0 and no noise: no pair differs, ρ = 1, the filter keeps nothing', (await data(RT, 'differ')) === '0.000' && (await data(RT, 'rho')) === '1.000' && (await data(BB, 'links')) === '0.000' && r2(await data(WG, 'beta')) === '1.00', `${await text(RT)} ${await text(BB)}`)

// ---- Panel B
const PR = `${B} [data-readout="pair"]`
ok('payments: the panel says the network is synthetic, not Lightning data', (await text(B)).includes('A synthetic network, not Lightning data'))
ok('payments, random pair: outgoing 3,922,500, widest route 827,166, maximum flow 3,922,500, cut of 3 channels', (await data(PR, 'out')) === '3922500' && (await data(PR, 'widest')) === '827166' && (await data(PR, 'maxflow')) === '3922500' && (await data(PR, 'cut')) === '3', await text(PR))
await tap(`${B} button[data-pick="hubs"]`)
ok('payments, hubs: maximum flow 55,670,642, widest route 3,510,243, cut of 111 channels', (await data(PR, 'maxflow')) === '55670642' && (await data(PR, 'widest')) === '3510243' && (await data(PR, 'cut')) === '111', await text(PR))
await tap(`${B} button[data-pick="small"]`)
ok('payments, small nodes: maximum flow 945,059, the cut at the receiver', (await data(PR, 'maxflow')) === '945059' && (await text(PR)).includes("the receiver's own channels"), await text(PR))
await tap(`${B} button[data-action="next"]`)
ok('payments: Next pair changes the pair', (await data(PR, 'maxflow')) !== '945059')
ok('payments at 20%: single 0.210 (model 0.195), split 0.222, full 0.894', bDone && (await data(PY, 'single')) === '0.210' && (await data(PY, 'psingle')) === '0.195' && (await data(PY, 'split')) === '0.222' && (await data(PY, 'full')) === '0.894', await text(PY))
ok('payments, curve of a single route: 0.916 0.802 0.600 0.386 0.276 0.210 0.122 0.078 0.044 0.026 0.012 0.008 0.002 0.000', (await data(PY, 'curveSingle')) === '0.916 0.802 0.600 0.386 0.276 0.210 0.122 0.078 0.044 0.026 0.012 0.008 0.002 0.000', await data(PY, 'curveSingle'))
ok('payments, curve of up to four routes: 0.922 0.816 0.602 0.390 0.288 0.222 0.128 0.076 0.052 0.030 0.014 0.008 0.002 0.000', (await data(PY, 'curveSplit')) === '0.922 0.816 0.602 0.390 0.288 0.222 0.128 0.076 0.052 0.030 0.014 0.008 0.002 0.000', await data(PY, 'curveSplit'))
ok('payments, curve with every balance known: 1.000 1.000 0.994 0.952 0.928 0.894 0.798 0.718 0.636 0.584 0.508 0.446 0.384 0.332', (await data(PY, 'curveFull')) === '1.000 1.000 0.994 0.952 0.928 0.894 0.798 0.718 0.636 0.584 0.508 0.446 0.384 0.332', await data(PY, 'curveFull'))
ok('payments: a chart with three curves', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length === 3, B))
await setRange(B, 1, 0.05)
ok('payments at 5%: single 0.600, full 0.994', (await data(PY, 'single')) === '0.600' && (await data(PY, 'full')) === '0.994', await text(PY))

// ---- Panel C
const NV = `${C} [data-readout="navigate"]`
ok('navigate, default: mean 23.6, median 23, grid distance 50.6, no drawing at L = 100', (await data(NV, 'mean')) === '23.6' && (await data(NV, 'median')) === '23' && (await data(NV, 'lattice')) === '50.6' && (await data(NV, 'route')) === '', await text(NV))
await setRange(C, 0, 40)
ok('navigate, L = 40: a route of 14 steps for a distance of 20, 3 long jumps, drawn', (await data(NV, 'route')) === '14 20 3' && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] circle`).length, C)) === 2, await data(NV, 'route'))
await setRange(C, 0, 100)
let t0 = await now()
await tap(`${C} button[data-action="sweep-alpha"]`)
const SA = `${C} [data-readout="sweep-alpha"]`
const sweptA = await waitData(SA, 'done', '1')
console.log(`NOTE  navigate: "Sweep α" at L = 100 (17 values, 2,000 pairs each) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('navigate, Sweep α at L = 100: 21.3 … 19.4 at 1.25 … 22.8 … 46.9, lowest at 1.25', sweptA && (await data(SA, 'means')) === '21.3 20.5 20.2 19.7 19.5 19.4 19.6 20.9 22.8 25.5 29.6 34.5 38.2 41.5 44.0 45.8 46.9' && (await data(SA, 'best')) === '1.25', await data(SA, 'means'))
ok('navigate, Sweep α: the means are listed under the chart', (await text(SA)).includes('α 1.25: 19.4'))
t0 = await now()
await tap(`${C} button[data-action="sweep-l"]`)
const SL = `${C} [data-readout="sweep-l"]`
const sweptL = await waitData(SL, 'done', '1', 3000)
console.log(`NOTE  navigate: "Sweep L" (5 sizes up to 400 × 400, 4 exponents) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('navigate, Sweep L: slopes 0.70 0.54 0.58 0.74', sweptL && (await data(SL, 'slopes')) === '0.70 0.54 0.58 0.74', await data(SL, 'slopes'))
ok('navigate, Sweep L: four curves', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img] polyline`).length === 4, SL))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
