// Functional checks of Network Lab module 08 "Who connects to whom": the two
// live figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-08.mjs pins down in Node). It also times the
// page-load work of Panels A and B and the "Grow N" sweep.
//
//   node modules/network-who-connects-to-whom.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
const now = () => p.evaluate(() => performance.now())
// record, from inside the page, when each panel's readout first appears and
// when its work is done (performance.now() counts from the navigation)
await p.evaluateOnNewDocument(() => {
  window.__t = {}
  new MutationObserver(() => {
    for (const id of ['hubs', 'robust']) {
      const el = document.querySelector(`[data-readout="${id}"]`)
      if (!el) continue
      if (!window.__t[`${id}Shown`]) window.__t[`${id}Shown`] = performance.now()
      if (el.dataset.done === '1' && !window.__t[`${id}Done`]) window.__t[`${id}Done`] = performance.now()
    }
  }).observe(document, { subtree: true, childList: true, attributes: true })
})
await go(p, `${site.url}${lab.basePath}/who-connects-to-whom`, 300)

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
const waitData = async (sel, key, want, tries = 900) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, key)) === want) return true
    await sleep(100)
  }
  return false
}
const r3 = (s) => Number(s).toFixed(3)

// ---- page load: Panels A and B start their work at once
const HUBS = `${A} [data-readout="hubs"]`
const ROB = `${B} [data-readout="robust"]`
const aDone = await waitData(HUBS, 'done', '1')
const bDone = await waitData(ROB, 'done', '1')
const T = await p.evaluate(() => window.__t)
const secs = (a, b) => ((T[b] - T[a]) / 1000).toFixed(1)
console.log(`NOTE  page load: Panel A (network, readouts and 20 rich-club randomisations) done ${secs('hubsShown', 'hubsDone')} s after it appeared, Panel B ${secs('robustShown', 'robustDone')} s; both run across animation frames`)
await settle(p)

// ---- F1
const F1 = 'figure:nth-of-type(1)'
const WA = `${F1} [data-readout="wiring-assortative"]`
const WD = `${F1} [data-readout="wiring-disassortative"]`
const first = [await data(WA, 'r'), await data(WD, 'r')]
ok('wirings figure, first deal: r 0.12 and −0.43, ρ 0.79 and −0.82', r3(first[0]).startsWith('0.12') && Number(first[1]).toFixed(2) === '-0.43' && Number(await data(WA, 'rho')).toFixed(2) === '0.79' && Number(await data(WD, 'rho')).toFixed(2) === '-0.82', `${first} ${await data(WA, 'rho')} ${await data(WD, 'rho')}`)
ok('wirings figure: two drawings', await p.evaluate((x) => document.querySelectorAll(`${x} canvas`).length === 2, F1))
await tap(`${F1} button[data-action="deal"]`)
const second = [Number(await data(WA, 'r')), Number(await data(WD, 'r'))]
ok('wirings figure: "Deal new degrees" changes the networks, the assortative r stays above the disassortative one', (await data(WA, 'r')) !== first[0] && second[0] > second[1], String(second))

// ---- F2
const F2 = 'figure:nth-of-type(2)'
const IL = `${F2} [data-readout="illusion"]`
ok('illusion figure, disassortative: 6 of 20 see a coloured majority, 3 coloured', (await data(IL, 'majority')) === '6' && (await text(IL)).includes('3 of 20 (15%)'), await text(IL))
ok('illusion figure: 20 nodes and 28 links drawn', await p.evaluate((x) => document.querySelectorAll(`${x} svg circle`).length === 20 && document.querySelectorAll(`${x} svg line`).length === 28, F2))
await tap(`${F2} button[data-mode="neutral"]`)
ok('illusion figure, neutral mixing: 2 of 20', (await data(IL, 'majority')) === '2', await text(IL))

// ---- Panel A
ok('hubs, as built: r −0.056, ρ −0.307, largest degree 190', aDone && r3(await data(HUBS, 'r')) === '-0.056' && r3(await data(HUBS, 'rho')) === '-0.307' && (await data(HUBS, 'max')) === '190', await text(HUBS))
ok('hubs: k_s 200 and the k_nn slope −0.23 shown', (await text(HUBS)).includes('200') && (await text(HUBS)).includes('-0.23'), await text(HUBS))
ok('hubs: three charts', await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`).length === 3, A))
let t0 = await now()
await tap(`${A} button[data-action="sweep"]`)
const SW = `${A} [data-readout="sweep"]`
const swept = await waitData(SW, 'done', '1')
console.log(`NOTE  hubs: "Grow N" (three sizes up to 100,000, three seeds) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('hubs, Grow N: r −0.095, −0.048, −0.023 and ρ −0.307, −0.301, −0.307', swept && (await data(SW, 'r')) === '-0.095 -0.048 -0.023' && (await data(SW, 'rho')) === '-0.307 -0.301 -0.307', `${await data(SW, 'r')} | ${await data(SW, 'rho')}`)
await tap(`${A} button[data-source="power"]`)
await setRange(A, 1, 2.2)
await waitData(HUBS, 'done', '1')
ok('hubs, power law γ = 2.2: r −0.096, ρ −0.126, largest degree 2,220', r3(await data(HUBS, 'r')) === '-0.096' && r3(await data(HUBS, 'rho')) === '-0.126' && (await data(HUBS, 'max')) === '2220', await text(HUBS))
await tap(`${A} button[data-source="pa"]`)
await tap(`${A} button[data-mode="assortative"]`)
await setRange(A, 1, 1) // p = 1
t0 = await now()
await waitData(HUBS, 'done', '1')
console.log(`NOTE  hubs: rewiring 10 swaps per link and the rich club took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('hubs, towards assortative, p = 1: r 0.355, ρ 0.963', r3(await data(HUBS, 'r')) === '0.355' && r3(await data(HUBS, 'rho')) === '0.963', await text(HUBS))
await tap(`${A} button[data-mode="disassortative"]`)
await waitData(HUBS, 'done', '1')
ok('hubs, towards disassortative, p = 1: r −0.166, ρ −0.957', r3(await data(HUBS, 'r')) === '-0.166' && r3(await data(HUBS, 'rho')) === '-0.957', await text(HUBS))

// ---- Panel B
const row = (id, key) => data(`${ROB} tr[data-wiring="${id}"]`, key)
ok('robustness, PA: r 0.304, −0.022, −0.150', bDone && (await row('assortative', 'r')) === '0.304' && (await row('neutral', 'r')) === '-0.022' && (await row('disassortative', 'r')) === '-0.150')
ok('robustness, random removal at 20/50/80%: 0.559 0.193 0.021 | 0.768 0.362 0.039 | 0.782 0.411 0.015', (await row('assortative', 'random')) === '0.559 0.193 0.021' && (await row('neutral', 'random')) === '0.768 0.362 0.039' && (await row('disassortative', 'random')) === '0.782 0.411 0.015', `${await row('assortative', 'random')} | ${await row('neutral', 'random')} | ${await row('disassortative', 'random')}`)
ok('robustness, attack at 2/5/10%: 0.980 0.950 0.900 | 0.949 0.857 0.646 | 0.761 0.518 0.346', (await row('assortative', 'attack')) === '0.980 0.950 0.900' && (await row('neutral', 'attack')) === '0.949 0.857 0.646' && (await row('disassortative', 'attack')) === '0.761 0.518 0.346', `${await row('assortative', 'attack')} | ${await row('neutral', 'attack')} | ${await row('disassortative', 'attack')}`)
ok('robustness: two charts of three curves', await p.evaluate((x) => [...document.querySelectorAll(`${x} svg[role=img]`)].map((s) => s.querySelectorAll('polyline').length).join() === '3,3', B))
await tap(`${B} button[data-source="power"]`)
await waitData(ROB, 'done', '0', 20)
await waitData(ROB, 'done', '1')
ok('robustness, power law: the assortative wiring keeps r at −0.014 with ρ 0.912', (await row('assortative', 'r')) === '-0.014' && (await row('assortative', 'rho')) === '0.912')

// ---- Panel C
const G = `${C} [data-readout="groups"]`
const IC = `${C} [data-readout="illusion-c"]`
ok('groups, defaults: assortativity 0.458, inside 0.862 and 0.596, Coleman 0.282 and 0.500', (await data(G, 'assort')) === '0.458' && (await data(G, 'inside')) === '0.862 0.596' && (await data(G, 'coleman')) === '0.282 0.500', await text(G))
ok('groups: illusion with the top 10% coloured, 26.2% see a majority', (await data(IC, 'majority')) === '0.262' && (await data(IC, 'coloured')) === '0.100', await text(IC))
await tap(`${C} button[data-action="rewire"]`)
ok('groups: rewired towards disassortative, 66.1%', (await data(IC, 'majority')) === '0.661', await text(IC))
await tap(`${C} button[data-how="random"]`)
ok('groups: coloured at random and rewired, 0.7%', (await data(IC, 'majority')) === '0.007', await text(IC))
await setRange(C, 1, 0)
ok('groups: h = 0, every link crosses, assortativity −0.999', (await data(G, 'assort')) === '-0.999', await text(G))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
