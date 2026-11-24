// Functional checks of Network Lab module 14 "Capstone: a real network": the
// two live figures and the three panels are driven like a reader would — the
// map drawn, an airport tapped, a network pasted into the box and a card run
// on it — and the numbers they show are compared with the ones quoted in the
// lecture, the "what to observe" lists and the exercises (the same numbers
// that scripts/lab/check-network-14.mjs pins down in Node). It also times the
// page-load work and the jobs behind the buttons.
//
//   node modules/network-capstone-a-real-network.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import path from 'node:path'
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep, noHScroll, SHOTS } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
const now = () => p.evaluate(() => performance.now())
const t00 = Date.now()
await go(p, `${site.url}${lab.basePath}/capstone-a-real-network`, 300)

const PANEL = 'main section .space-y-14 > div'
const A = `${PANEL}:nth-child(1)`
const B = `${PANEL}:nth-child(2)`
const C = `${PANEL}:nth-child(3)`
const F1 = '[data-figure="map"]'
const F2 = '[data-figure="outliers"]'
const flat = (s) => s.replace(/\s+/g, ' ')
const text = async (sel) => flat(await p.evaluate((x) => document.querySelector(x)?.innerText || '', sel))
const data = (sel, key) => p.evaluate((x, k) => document.querySelector(x)?.dataset[k], sel, key)
const tap = async (sel) => {
  await p.evaluate((x) => {
    const el = document.querySelector(x)
    if (!el) throw new Error('nothing at ' + x)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, sel)
  await sleep(250)
}
const waitData = async (sel, key, want, tries = 1500) => {
  for (let i = 0; i < tries; i++) {
    if ((await data(sel, key)) === want) return true
    await sleep(100)
  }
  return false
}
// type into a controlled input or textarea
const type = async (sel, value) => {
  await p.evaluate(
    (x, v) => {
      const el = document.querySelector(x)
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    sel,
    value,
  )
  await sleep(150)
}
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
  await sleep(400)
}
// a click on a canvas at a place of the map given as (longitude, latitude)
const clickMap = async (scope, lng, lat) => {
  await p.evaluate(
    (sel, x, y) => {
      const c = document.querySelector(`${sel} canvas`)
      const b = c.getBoundingClientRect()
      const PAD = 6
      const cx = b.left + PAD + x * (b.width - 2 * PAD)
      const cy = b.top + PAD + y * (b.height - 2 * PAD)
      c.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: cx, clientY: cy }))
    },
    scope,
    (lng + 180) / 360,
    (85 - lat) / 145,
  )
  await sleep(300)
}
// share of the pixels of a canvas that are not white
const inked = (scope) =>
  p.evaluate((sel) => {
    const c = document.querySelector(`${sel} canvas`)
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245)) n++
    return n / (d.length / 4)
  }, scope)
const find = async (scope, q) => {
  await type(`${scope} input[data-find="text"]`, q)
  await tap(`${scope} button[data-find="go"]`)
}

// ---- page load
await p.waitForSelector(`${C} [data-readout="spread"]`, { timeout: 60000 })
console.log(`NOTE  page load: ${((Date.now() - t00) / 1000).toFixed(1)} s from navigation to the last panel shown (the airports' cards show precomputed values; Louvain, the weights and the cascades at φ = 0.18 are computed while the page renders)`)
await settle(p)

// ---- F1, the map
const ink0 = await inked(F1)
ok('map: 3,214 airports and 18,858 links, coloured by community, and the canvas is drawn', (await data(F1, 'nodes')) === '3214' && (await data(F1, 'links')) === '18858' && (await data(F1, 'colour')) === 'community' && ink0 > 0.02, `ink ${ink0.toFixed(3)}`)
await clickMap(F1, 4.76, 52.31)
ok('map: a tap on the Netherlands selects Amsterdam (AMS), 248 routes, and draws its links', (await data(F1, 'selected')) === 'AMS' && (await data(F1, 'routes')) === '248' && (await data(F1, 'drawn')) === '248' && (await text(`${F1} [data-find="result"]`)).includes('Amsterdam'), `${await data(F1, 'selected')} ${await text(`${F1} [data-find="result"]`)}`)
await clickMap(F1, -150, -55)
ok('map: a tap on the empty ocean selects nothing', (await data(F1, 'selected')) === '')
await find(F1, 'KSLI')
ok('map: the record with code KSLI is "Los Alamitos Army Air Field · Solwesi, Zambia", 2 routes', (await data(F1, 'selected')) === 'KSLI' && (await data(F1, 'routes')) === '2' && (await text(`${F1} [data-find="result"]`)).includes('Los Alamitos Army Air Field · Solwesi, Zambia'), await text(`${F1} [data-find="result"]`))
await find(F1, 'anchorage')
ok('map: "anchorage" finds ANC, 34 routes', (await data(F1, 'selected')) === 'ANC' && (await data(F1, 'routes')) === '34')
await tap(`${F1} button[data-show="longest"]`)
const longest = ((await data(`${F1} [data-longest]`, 'longest')) || '').split(' ')
ok('map, the ten longest links: 16,082 and 15,937 km (in red, to KSLI), then 13,808 (Sydney–Dallas)', longest.length === 10 && longest[0] === '16082' && longest[1] === '15937' && longest[2] === '13808' && (await text(`${F1} [data-longest]`)).includes('In red: LUN–KSLI 16,082, NLA–KSLI 15,937'), await text(`${F1} [data-longest]`))
await tap(`${F1} button[data-show="top"]`)
ok('map: the 300 links with most airlines are drawn too (300 + 34 + 10 links)', (await data(F1, 'drawn')) === '344', await data(F1, 'drawn'))
await tap(`${F1} button[data-colour="region"]`)
ok('map: coloured by region, with a legend of nine regions', (await data(F1, 'colour')) === 'region' && (await p.evaluate((x) => document.querySelectorAll(`${x} p span.rounded-full`).length, F1)) === 9)
ok('map: the credit line of OpenFlights with a link to the Open Database License', (await text(`${F1} [data-credit]`)).includes('Contains information from the OpenFlights Airports and Routes Databases, which are made available under the Open Database License (ODbL) v1.0') && (await p.evaluate((x) => document.querySelector(`${x} [data-credit] a`).href, F1)) === 'https://opendatacommons.org/licenses/odbl/1-0/')
await (await p.$(F1)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-figure1-1280.png') })

// ---- F2, out of line
ok('outliers: 1,729 airports drawn; labelled ANC, PPT, POM, BET and YWG', (await data(F2, 'shown')) === '1729' && (await data(F2, 'labelled')) === 'ANC PPT POM BET YWG', `${await data(F2, 'shown')} ${await data(F2, 'labelled')}`)
await p.evaluate((sel) => {
  // the orange dot of Anchorage is the first labelled circle
  const dot = document.querySelector(`${sel} svg g g circle`)
  const b = dot.getBoundingClientRect()
  document.querySelector(`${sel} rect[data-plot]`).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2 }))
}, F2)
await sleep(300)
ok('outliers: a tap on the dot of Anchorage names it: 34 routes (place 284), betweenness 0.0594 (place 3)', (await data(F2, 'selected')) === 'ANC' && (await text(`${F2} [data-outlier="result"]`)).includes('34 routes (place 284) · betweenness 0.0594 (place 3)'), await text(`${F2} [data-outlier="result"]`))
await (await p.$(F2)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-figure2-1280.png') })

// ---- Panel A, the workbench, on the airports
const W = `${A} [data-readout="workbench"]`
const card = (id) => `${A} [data-card="${id}"]`
const val = (id, key) => data(`${card(id)} [data-values]`, key)
ok('workbench, airports: 3,188 nodes and 18,833 links in the largest component; 7 components of 3188 10 4 4 4 2 2', (await data(W, 'nodes')) === '3188' && (await data(W, 'links')) === '18833' && (await data(`${card('shape')} [data-components]`, 'components')) === '7' && (await data(`${card('shape')} [data-components]`, 'sizes')) === '3188 10 4 4 4 2 2')
ok('workbench, card 1 (precomputed): mean distance 3.9585, diameter 12, clustering 0.4928; rewirings 0.092, 3.24 and r = −0.103 (z 18.7)', (await val('shape', 'distance')) === '3.9585' && (await val('shape', 'diameter')) === '12' && (await val('shape', 'clustering')) === '0.4928' && (await val('shape', 'nullClustering')) === '0.092' && (await val('shape', 'nullDistance')) === '3.24' && (await val('shape', 'nullR')) === '-0.103' && (await val('shape', 'zR')) === '18.7', await text(card('shape')))
ok('workbench, card 2 (precomputed): median 3, maximum 248, k_min 2, α 1.71, p 0.000, power law ruled out; α drifts 1.71, 1.80, 1.90, 2.14, 2.40', (await val('degrees', 'median')) === '3' && (await val('degrees', 'max')) === '248' && (await val('degrees', 'kmin')) === '2' && (await val('degrees', 'alpha')) === '1.71' && (await val('degrees', 'p')) === '0.000' && (await val('degrees', 'verdict')) === 'ruledOut' && (await val('degrees', 'drift')) === '2:1.71 5:1.80 10:1.90 20:2.14 30:2.40', await text(card('degrees')))
ok('workbench, card 3 (precomputed): by degree AMS FRA CDG ISL ATL, by betweenness CDG LAX ANC DXB FRA; rank correlation 0.822; 0.458 with betweenness 0', (await val('centrality', 'topDegree')) === 'AMS FRA CDG ISL ATL' && (await val('centrality', 'topBetweenness')) === 'CDG LAX ANC DXB FRA' && (await val('centrality', 'rho')) === '0.822' && (await val('centrality', 'zero')) === '0.458', await text(card('centrality')))
ok('workbench, card 4 (precomputed): r = −0.0181, ρ = 0.034, rewirings −0.103 (z 18.7), largest rich-club ratio 1.35', (await val('mixing', 'r')) === '-0.0181' && (await val('mixing', 'rho')) === '0.034' && (await val('mixing', 'nullR')) === '-0.103' && (await val('mixing', 'z')) === '18.7' && (await val('mixing', 'richMax')) === '1.35', await text(card('mixing')))
ok('workbench, card 5, first run: Q = 0.6561, 25 groups, NMI with the regions 0.622', (await val('community', 'run')) === '0' && (await val('community', 'q')) === '0.6561' && (await val('community', 'groups')) === '25' && (await val('community', 'nmi')) === '0.622', await text(card('community')))
await tap(`${card('community')} button[data-action="run"]`)
ok('workbench, card 5, "Run again": Q = 0.6566, 21 groups, one of 131 around ANC; NMI with the previous run 0.920', (await val('community', 'run')) === '1' && (await val('community', 'q')) === '0.6566' && (await val('community', 'groups')) === '21' && (await val('community', 'hubs')).includes('131:ANC') && (await val('community', 'previous')) === '0.920', await text(card('community')))
ok('workbench, card 6: β = 1.12, 0.556 of the links with weight 1, largest weight 20, backbone of 325 links', (await val('weights', 'beta')) === '1.12' && (await val('weights', 'ones')) === '0.556' && (await val('weights', 'max')) === '20' && (await val('weights', 'backbone')) === '325' && (await text(card('weights'))).includes('ATL–ORD'), await text(card('weights')))
let t0 = await now()
await tap(`${card('centrality')} button[data-action="run"]`)
await sleep(300)
await waitData(card('centrality'), 'done', '1')
await settle(p)
console.log(`NOTE  workbench: "Compute again" on the centrality card (3,188 searches, PageRank) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('workbench, card 3 computed again in the page: the same lists and numbers', (await val('centrality', 'topBetweenness')) === 'CDG LAX ANC DXB FRA' && (await val('centrality', 'rho')) === '0.822' && !(await text(card('centrality'))).includes('Precomputed'), await text(card('centrality')))
t0 = await now()
await tap(`${card('shape')} button[data-action="run"]`)
await sleep(300)
await waitData(card('shape'), 'done', '1')
await settle(p)
console.log(`NOTE  workbench: "Compute again" on the first card (distances, ten rewirings with distances) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('workbench, card 1 computed again in the page: the same numbers', (await val('shape', 'distance')) === '3.9585' && (await val('shape', 'nullClustering')) === '0.092' && (await val('shape', 'nullDistance')) === '3.24' && (await val('shape', 'zR')) === '18.7', await text(card('shape')))
await (await p.$(A)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-panel1-1280.png') })

// ---- Panel B on the airports
const ST = `${B} [data-readout="stress"]`
const removal = async () => Object.fromEntries(((await data(ST, 'removal')) || '').split(' ').map((x) => x.split(':')))
let rm = await removal()
ok('stress, airports, removal at 1, 2, 5, 10, 15, 20, 30, 50%: random 0.99 … 0.37, degree 0.95 … 0.00, recomputed, betweenness', rm.random === '0.99,0.97,0.93,0.86,0.79,0.73,0.60,0.37' && rm.degree === '0.95,0.91,0.77,0.14,0.07,0.03,0.01,0.00' && rm.recomputed === '0.95,0.91,0.74,0.29,0.05,0.00,0.00,0.00' && rm.betweenness === '0.90,0.83,0.59,0.27,0.13,0.08,0.00,0.00', JSON.stringify(rm))
ok('stress, airports: T_c = 0.0156, f_c = 0.984; at φ = 0.18 0.016 of the seeds go global, 2 of the 20 hubs', (await data(ST, 'tc')) === '0.0156' && (await data(ST, 'fc')) === '0.984' && (await data(ST, 'cascadeAll')) === '0.016' && (await data(ST, 'cascadeTop')) === '2' && (await data(ST, 'perc')).includes('0.05:0.19'), `${await data(ST, 'perc')} ${await text(ST)}`)
await setRange(B, 0, 0.1)
ok('stress, airports, φ = 0.10: 0.300 of the seeds, 19 of the 20 hubs', (await data(ST, 'cascadeAll')) === '0.300' && (await data(ST, 'cascadeTop')) === '19')
await setRange(B, 0, 0.25)
ok('stress, airports, φ = 0.25: no seed, largest cascade 0.05', (await data(ST, 'cascadeAll')) === '0.000' && (await data(ST, 'cascadeTop')) === '0' && (await data(ST, 'cascadeLargest')) === '0.05')
await setRange(B, 0, 0.18)
await (await p.$(B)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-panel2-1280.png') })

// ---- Panel C on the airports
const SP = `${C} [data-readout="spread"]`
const CLO = `${C} [data-readout="closure"]`
ok('spread: the map of the 3,188 airports is drawn', (await inked(C)) > 0.02)
await find(C, 'ATL')
let done = await waitData(SP, 'done', '1', 600)
ok('spread from Atlanta, β = 0.1, 20 runs: rank correlations 0.71 with flights, 0.09 with kilometres, −0.87 with degree', done && (await data(SP, 'seed')) === 'ATL' && (await data(SP, 'flights')) === '0.71' && (await data(SP, 'km')) === '0.09' && (await data(SP, 'degree')) === '-0.87', await text(SP))
await clickMap(C, 12.25, 41.8)
done = await waitData(SP, 'seed', 'FCO', 100) && (await waitData(SP, 'done', '1', 600))
ok('spread: a tap on Rome starts from Fiumicino: 0.78, 0.29, −0.88', done && (await data(SP, 'flights')) === '0.78' && (await data(SP, 'km')) === '0.29' && (await data(SP, 'degree')) === '-0.88', `${await data(SP, 'seed')} ${await text(SP)}`)
await sleep(2500)
await (await p.$(C)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-panel3-1280.png') })
await tap(`${C} button[data-mode="close"]`)
await find(C, 'ANC')
ok('close Anchorage: 87 airports cut off', (await data(CLO, 'closed')) === 'ANC' && (await data(CLO, 'cut')) === '87', await text(CLO))
await tap(`${C} button[data-action="reopen"]`)
await find(C, 'AMS')
ok('close Amsterdam: none cut off', (await data(CLO, 'closed')) === 'AMS' && (await data(CLO, 'cut')) === '0')
await tap(`${C} button[data-action="by-degree"]`)
ok('close the first 10 by degree: 0.981 left', (await data(CLO, 'left')) === '0.981', await text(CLO))
await tap(`${C} button[data-action="by-betweenness"]`)
ok('close the first 10 by betweenness: 0.962 left', (await data(CLO, 'left')) === '0.962', await text(CLO))
await (await p.$(C)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-panel3-close-1280.png') })

// ---- the other networks, and one's own
await tap(`${A} button[data-net="karate"]`)
ok('karate club: the three panels follow the choice (34 nodes)', (await data(W, 'nodes')) === '34' && (await data(ST, 'nodes')) === '34' && (await data(`${C} [data-picker]`, 'net')) === 'karate')
ok('karate club: the cards wait for their buttons', !(await p.$(`${card('shape')} [data-values]`)) && !(await p.$(`${card('community')} [data-values]`)))
await tap(`${card('shape')} button[data-action="run"]`)
await waitData(card('shape'), 'done', '1')
await settle(p)
ok('karate club, card 1: mean distance 2.4082, diameter 5, clustering 0.5706', (await val('shape', 'distance')) === '2.4082' && (await val('shape', 'diameter')) === '5' && (await val('shape', 'clustering')) === '0.5706', await text(card('shape')))
await tap(`${card('community')} button[data-action="run"]`)
ok('karate club, card 5: Louvain finds 4 groups with Q = 0.4188, and the agreement with the two factions is shown', (await val('community', 'groups')) === '4' && (await val('community', 'q')) === '0.4188' && (await val('community', 'nmi')) !== '', await text(card('community')))
ok('karate club, card 6: no weights', (await text(card('weights'))).includes('no weights'))
ok('karate club, stress: T_c = 0.1477, and the removal by betweenness is there at once', (await data(ST, 'tc')) === '0.1477' && (await data(ST, 'removal')).includes('betweenness:'), await data(ST, 'removal'))
await tap(`${C} button[data-mode="spread"]`)
// taps on a grid until one lands on a node
for (let i = 0; i < 100 && !(await data(SP, 'seed')); i++) {
  await p.evaluate((sel, fx, fy) => {
    const c = document.querySelector(`${sel} canvas`)
    const b = c.getBoundingClientRect()
    c.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: b.left + fx * b.width, clientY: b.top + fy * b.height }))
  }, C, 0.05 + 0.1 * (i % 10), 0.05 + 0.1 * Math.floor(i / 10))
  await sleep(60)
}
done = await waitData(SP, 'done', '1', 300)
ok('karate club, spread: drawn with the force layout; a tap starts a spread, with no kilometres', done && (await data(SP, 'km')) === '' && (await data(SP, 'flights')) !== '', await text(SP))

await tap(`${A} button[data-net="own"]`)
ok('your own network: before anything is read the panels say so', (await text(A)).includes('Read a network first') && (await text(B)).includes('Read a network in the workbench first') && (await text(A)).includes('is not sent anywhere'))
await type(`${A} textarea[data-own="text"]`, '# a small network\na b\nb,c\nc;d 2\nd\ta\na c 3\nc a 2\ne e\nd e\nf g\njunk\n')
await tap(`${A} button[data-action="load"]`)
const OWN = `${A} [data-own="report"]`
ok('your own network: a pasted edge list with every separator, a comment, a repeated link, a self-link and a bad line is read: 7 nodes, 7 links, 1 self-link, 1 merged, 1 skipped; largest component 5', (await data(OWN, 'nodes')) === '7' && (await data(OWN, 'links')) === '7' && (await data(OWN, 'self')) === '1' && (await data(OWN, 'merged')) === '1' && (await data(OWN, 'skipped')) === '1' && (await data(W, 'nodes')) === '5', await text(OWN))
await tap(`${card('shape')} button[data-action="run"]`)
await waitData(card('shape'), 'done', '1')
await settle(p)
ok('your own network, card 1 run on it: 2 components (5 and 2), mean distance 1.5000, diameter 3', (await data(`${card('shape')} [data-components]`, 'sizes')) === '5 2' && (await val('shape', 'distance')) === '1.5000' && (await val('shape', 'diameter')) === '3', await text(card('shape')))
await tap(`${card('weights')} button[data-action="run"]`)
ok('your own network, card 6: the weights are read (largest 5, on a–c)', (await val('weights', 'max')) === '5' && (await text(card('weights'))).includes('a–c'), await text(card('weights')))
await tap(`${card('centrality')} button[data-action="run"]`)
await waitData(card('centrality'), 'done', '1')
ok('your own network, card 3 runs', ((await val('centrality', 'topDegree')) || '').split(' ').length === 5, await text(card('centrality')))
await type(`${A} textarea[data-own="text"]`, JSON.stringify({ nodes: [{ pub_key: '02aa', alias: 'alice' }, { pub_key: '03bb', alias: 'bob' }, { pub_key: '02cc', alias: '' }], edges: [{ channel_id: '1', node1_pub: '02aa', node2_pub: '03bb', capacity: '1000' }, { channel_id: '2', node1_pub: '03bb', node2_pub: '02aa', capacity: '500' }, { channel_id: '3', node1_pub: '03bb', node2_pub: '02cc', capacity: '2000' }] }))
await tap(`${A} button[data-action="load"]`)
ok('your own network: the JSON of describegraph is read: 3 nodes, 2 links (two channels of one pair merged)', (await data(OWN, 'nodes')) === '3' && (await data(OWN, 'links')) === '2' && (await data(OWN, 'merged')) === '1' && (await text(OWN)).includes('describegraph'), await text(OWN))
await type(`${A} textarea[data-own="text"]`, '{"foo": 1}')
await tap(`${A} button[data-action="load"]`)
ok('your own network: JSON of another kind is refused with a message', (await data(`${A} [data-own="error"]`, 'error')) === 'format')
// a network above 5,000 nodes: a ring of 6,000 with chords
const big = []
for (let i = 0; i < 6000; i++) big.push(`${i} ${(i + 1) % 6000}`, `${i} ${(i * 7 + 13) % 6000}`)
await type(`${A} textarea[data-own="text"]`, big.join('\n'))
await tap(`${A} button[data-action="load"]`)
await settle(p)
ok('your own network, 6,000 nodes: read, and the page says that 300 sources are sampled', (await data(OWN, 'nodes')) === '6000' && (await data(`${A} [data-sampled]`, 'sampled')) === '300' && (await text(A)).includes('300 sampled sources'), await text(OWN))
t0 = await now()
await tap(`${card('centrality')} button[data-action="run"]`)
await sleep(300)
await waitData(card('centrality'), 'done', '1')
console.log(`NOTE  workbench: the centrality card on 6,000 nodes (300 sampled sources) took ${(((await now()) - t0) / 1000).toFixed(1)} s`)
ok('your own network, 6,000 nodes: the centrality card runs on the sampled sources', ((await val('centrality', 'topBetweenness')) || '').split(' ').length === 5)
ok('your own network, 6,000 nodes: no map and too large to draw, and Panel C says so', (await text(C)).includes('not drawn'))
const huge = []
for (let i = 0; i < 30001; i++) huge.push(`${i} ${i + 1}`)
await type(`${A} textarea[data-own="text"]`, huge.join('\n'))
await tap(`${A} button[data-action="load"]`)
ok('your own network: more than 30,000 nodes are refused', (await data(`${A} [data-own="error"]`, 'error')) === 'nodes', await text(`${A} [data-own="error"]`))
await tap(`${A} button[data-net="airports"]`)
ok('back to the airports: the cards show their values again', (await val('shape', 'distance')) === '3.9585' && (await data(ST, 'tc')) === '0.0156')

// ---- 375 px
const m = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(m, `${site.url}${lab.basePath}/capstone-a-real-network`, 300)
await m.waitForSelector(`${C} [data-readout="spread"]`, { timeout: 60000 })
await settle(m)
ok('375 px, Italian: no horizontal scroll, and the credit line is in Italian', (await noHScroll(m)) && flat(await m.evaluate((x) => document.querySelector(x).innerText, `${F1} [data-credit]`)).includes('Contiene informazioni tratte dagli OpenFlights Airports and Routes Databases'))
await (await m.$(F1)).screenshot({ path: path.join(SHOTS, 'el-capstone-a-real-network-figure1-375.png') })
ok('375 px: no console errors', m.errors.length === 0, m.errors.join(' | '))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
