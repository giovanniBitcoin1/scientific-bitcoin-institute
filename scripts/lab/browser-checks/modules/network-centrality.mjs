// Functional checks of Network Lab module 03 "Centrality": the two live
// figures and the three panels are driven like a reader would, and the
// numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-03.mjs pins down in Node).
//
//   node modules/network-centrality.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/centrality`, 1500)
await settle(p)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const panelText = async (i) => flat(await p.evaluate((sel, k) => document.querySelectorAll(sel)[k].innerText, PANEL, i))
const figText = async (i) => flat(await p.evaluate((k) => document.querySelectorAll('figure')[k].innerText, i))
const readout = async (panel, name) =>
  flat(await p.evaluate((sel, k, n) => document.querySelectorAll(sel)[k].querySelector(`[data-readout="${n}"]`)?.innerText || '', PANEL, panel, name))
// Sets a range input the way React expects (native setter, then an input event).
const setRange = (scope, index, value) =>
  p.evaluate(
    (sel, k, v) => {
      const el = document.querySelectorAll(`${sel} input[type=range]`)[k]
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    scope,
    index,
    value,
  )
const choose = async (panel, index, value) => {
  const selects = await p.$$(`${PANEL}:nth-child(${panel + 1}) select`)
  await selects[index].select(value)
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
  await sleep(150)
}
// A tap on a node or on a link of Panel A's drawing.
const tap = async (selector) => {
  await p.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) throw new Error('nothing at ' + sel)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, selector)
  await sleep(200)
}
const A = `${PANEL}:nth-child(1)`
const B = `${PANEL}:nth-child(2)`
const C = `${PANEL}:nth-child(3)`
const node = (name) => `${A} g[data-node="${name}"]`

// The lecture places "Scores from neighbours" first and the kite second.
const SCORES = 0
const KITE = 1
const clickFig = async (index, label) => {
  await p.evaluate(
    (k, l) => {
      const b = [...document.querySelectorAll('figure')[k].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    index,
    label,
  )
  await sleep(150)
}

// ---- Figure "Three winners"
let t = await figText(KITE)
ok('kite figure, degree: Diane, 6 links', t.includes('First: Diane') && t.includes('6 links'), t)
await clickFig(KITE, 'Closeness')
t = await figText(KITE)
ok('kite figure, closeness: Fernando and Garth, 0.643', t.includes('First: Fernando and Garth') && t.includes('0.643'), t)
await clickFig(KITE, 'Betweenness')
t = await figText(KITE)
ok('kite figure, betweenness: Heather, 14 of the 36 pairs = 0.389', t.includes('First: Heather') && t.includes('14 of the 36 pairs') && t.includes('0.389'), t)
ok('kite figure: ten nodes and eighteen links are drawn', await p.$$eval('figure', (f, k) => f[k].querySelectorAll('circle').length === 10 && f[k].querySelectorAll('line').length === 18, KITE))

// ---- Figure "Scores from neighbours"
t = await figText(SCORES)
ok('scores figure starts at 0 steps with every score 1.000', t.includes('Steps: 0') && (t.match(/1.000/g) || []).length === 6, t)
await clickFig(SCORES, 'Step')
t = await figText(SCORES)
ok('scores figure, one step: a and b 0.667, c and d 1.000, e and f 0.333', t.includes('Steps: 1') && (t.match(/0.667/g) || []).length === 2 && (t.match(/0.333/g) || []).length === 2, t)
for (let i = 0; i < 3; i++) await clickFig(SCORES, '10 steps')
t = await figText(SCORES)
const gap = Number((t.match(/limit: ([\d.]+)/) || [])[1])
ok('scores figure, 31 steps: the scores have settled on the eigenvector centrality (0.782, 1.000, 0.714, 0.313)', t.includes('Steps: 31') && gap < 0.002 && /0.78[23]/.test(t) && t.includes('0.714') && t.includes('0.313'), t)
await clickFig(SCORES, 'Reset')
ok('scores figure: Reset goes back to 0 steps', (await figText(SCORES)).includes('Steps: 0'))

// ---- Panel A: rankings compared
t = await readout(0, 'top')
ok('rankings: Florence: Medici first under all seven measures', (t.match(/1 Medici/g) || []).length === 7, t)
ok('rankings: Florence: betweenness Medici 0.522, Guadagni 0.255; closeness 0.560; PageRank 0.146', t.includes('Betweenness 1 Medici 0.522 2 Guadagni 0.255') && t.includes('Closeness 1 Medici 0.560 2 Ridolfi 0.500') && t.includes('PageRank 1 Medici 0.146'), t)
await tap(node('Strozzi'))
t = await readout(0, 'node')
ok('rankings: tap the Strozzi: degree 2= of 15, betweenness 0.103 7 of 15, eigenvector 0.827 2 of 15', t.includes('Degree 4 2= of 15') && t.includes('Betweenness 0.103 7 of 15') && t.includes('Eigenvector 0.827 2 of 15'), t)
await click(A, 'Picks the two ends of a path')
await tap(node('Albizzi'))
await tap(node('Tornabuoni'))
t = await readout(0, 'paths')
ok('rankings: Albizzi to Tornabuoni: 2 shortest paths of 2 steps, none through the Strozzi', t.includes('Albizzi to Tornabuoni: 2 shortest paths of 2 steps') && t.includes('0 of 2 pass through Strozzi'), t)
await click(A, 'Inspects a node')
await tap(node('Medici'))
t = await readout(0, 'paths')
ok('rankings: with the Medici inspected: 1 of 2 passes through Medici, and both paths are listed', t.includes('1 of 2 passes through Medici') && t.includes('Albizzi – Medici – Tornabuoni') && t.includes('Albizzi – Guadagni – Tornabuoni'), t)
await setRange(A, 1, 1)
await sleep(250)
t = await readout(0, 'top')
ok('rankings: PageRank slider at 1: Medici 0.150 = 6/40', t.includes('PageRank 1 Medici 0.150 2= Guadagni 0.100 2= Strozzi 0.100'), t)
await setRange(A, 1, 0.85)
await click(A, 'Removes a node or a link')
await tap(node('Medici'))
t = await readout(0, 'state')
ok('rankings: remove the Medici: 14 nodes, 14 links, 3 pieces (11, 2, 1)', t.includes('Nodes: 14') && t.includes('Links: 14') && t.includes('Pieces: 3 (11, 2, 1)'), t)
t = await readout(0, 'top')
ok('rankings: then the Guadagni lead betweenness (0.314) and the Strozzi eigenvector centrality', t.includes('Betweenness 1 Guadagni 0.314 2 Bischeri 0.212 3 Strozzi 0.147') && t.includes('Eigenvector 1 Strozzi 1.000'), t)
await tap(`${A} g[data-link]`)
t = await readout(0, 'state')
ok('rankings: a tap on a link removes it (13 links)', t.includes('Links: 13'), t)
await click(A, 'Reset')
t = await readout(0, 'state')
ok('rankings: Reset restores 15 nodes, 20 links, 1 piece', t.includes('Nodes: 15') && t.includes('Links: 20') && t.includes('Pieces: 1 '), t)
await choose(0, 0, 'kite')
t = await readout(0, 'top')
ok('rankings: kite: degree Diane 6; closeness Fernando = Garth 0.643; betweenness Heather 0.389', t.includes('Degree 1 Diane 6') && t.includes('Closeness 1= Fernando 0.643 1= Garth 0.643') && t.includes('Betweenness 1 Heather 0.389'), t)
t = await readout(0, 'corr')
ok('rankings: kite: the correlation matrix shows 0.31 (betweenness–eigenvector) and 0.99 (degree–eigenvector)', t.includes('0.31') && t.includes('0.99'), t)
await choose(0, 0, 'karate')
t = await readout(0, 'top')
ok('rankings: karate club: degree 34 (17) then 1 (16); betweenness 1 0.438, 34 0.304; PageRank 34 0.101, 1 0.097', t.includes('Degree 1 34 17 2 1 16') && t.includes('Betweenness 1 1 0.438 2 34 0.304') && t.includes('PageRank 1 34 0.101 2 1 0.097'), t)
await choose(0, 0, 'groups')
t = await readout(0, 'top')
ok('rankings: two groups: the bridge ends l and b lead betweenness, b and l share first place for closeness', t.includes('Betweenness 1 l 0.531 2 b 0.526') && t.includes('Closeness 1= b 0.388 1= l 0.388'), t)
ok('rankings: the drawing is SVG and does not capture touch', await p.$$eval(`${A} svg`, (s) => s.length >= 1 && s.every((x) => getComputedStyle(x).touchAction !== 'none')))

// ---- Panel B: the random surfer
t = await readout(1, 'pages')
ok('surfer: α = 0.85: J 0.154 first, then K 0.147 and L 0.141; F last with 0.016 and hub 0.201', t.includes('J 0.154 2 0.051 0.080 0.000 0.049') && t.includes('K 0.147') && t.includes('L 0.141') && t.includes('F 0.016 0 0.000 0.045 0.201 0.000'), t)
await click(B, 'Step')
t = await readout(1, 'surfer')
ok('surfer: Step makes one step', t.includes('Steps: 1 '), t)
await setRange(B, 1, 1000)
await click(B, 'Play')
await sleep(4000)
await click(B, 'Pause')
t = await readout(1, 'surfer')
const steps = Number((t.match(/Steps: ([\d,]+)/) || [])[1]?.replace(/,/g, ''))
const share = Number((t.match(/J, K, L: ([\d.]+)/) || [])[1])
ok('surfer: at full speed the visits to the loop approach its PageRank, 0.441', steps > 20000 && Math.abs(share - 0.441) < 0.02 && t.includes('exact 0.441'), t)
await setRange(B, 0, 1)
await sleep(300)
t = await readout(1, 'pages')
ok('surfer: α = 1: J, K, L 0.333 each, every other page 0.000', (t.match(/ 0\.333 /g) || []).length >= 3 && t.includes('A 0.000 3') && t.includes('D 0.000 3') && t.includes('F 0.000 0'), t)
t = await readout(1, 'surfer')
ok('surfer: changing α starts the count again', t.includes('Steps: 0 '), t)
for (let i = 0; i < 93; i++) await p.evaluate((sel) => [...document.querySelectorAll(`${sel} button`)].find((x) => x.innerText.trim().toLowerCase() === 'step').click(), B)
await sleep(200)
t = await readout(1, 'surfer')
ok('surfer: α = 1: the surfer enters the loop at step 93 (on J, coming from I)', t.includes('Steps: 93 ') && t.includes('The surfer is on J') && t.includes('J, K, L: 0.011'), t)
await click(B, 'Every link two-way')
await sleep(300)
t = await readout(1, 'pages')
ok('surfer: two-way, α = 1: PageRank is links / 42: 0.119 with 5 links, 0.048 with 2', t.includes('A 0.119 5') && t.includes('E 0.119 5') && t.includes('H 0.048 2'), t)
await click(B, 'Every link two-way')
await setRange(B, 0, 0)
await sleep(300)
t = await readout(1, 'pages')
ok('surfer: α = 0: every page 0.083', (t.match(/ 0\.083 /g) || []).length >= 12, t)

// ---- Panel C: how fragile is a ranking?
const done = async () => {
  for (let i = 0; i < 240; i++) {
    if (await p.evaluate((sel) => document.querySelector(`${sel} [data-readout="fragility"]`)?.dataset.done === '1', C)) return true
    await sleep(250)
  }
  return false
}
ok('fragility: the experiment finishes', await done())
t = await readout(2, 'fragility')
ok('fragility: scale-free, missing links, f = 0.20: degree 0.84 / 0.93, eigenvector 0.77 / 0.81, PageRank 0.85 / 0.93', t.includes('Degree 0.84 0.93') && t.includes('Closeness 0.78 0.82') && t.includes('Betweenness 0.78 0.92') && t.includes('Eigenvector 0.77 0.81') && t.includes('PageRank 0.85 0.93'), t)
ok('fragility: two charts with five series of eleven points each', await p.$$eval(`${C} svg[role=img]`, (s) => s.length === 2 && s.every((x) => x.querySelectorAll('circle').length === 55)))
await choose(2, 1, 'spurious')
ok('fragility: spurious links: the experiment finishes', await done())
t = await readout(2, 'fragility')
ok('fragility: scale-free, spurious links, f = 0.20: eigenvector 0.94, closeness 0.93, degree 0.82, betweenness top ten 0.99', t.includes('Eigenvector 0.94') && t.includes('Closeness 0.93') && t.includes('Degree 0.82') && t.includes('Betweenness 0.85 0.99'), t)
await choose(2, 0, 'smallWorld')
await choose(2, 1, 'missing')
ok('fragility: small-world: the experiment finishes', await done())
await setRange(C, 0, 0)
await sleep(200)
t = await readout(2, 'fragility')
ok('fragility: small-world, f = 0: every correlation 1.00, top ten by degree only 0.82', t.includes('Degree 1.00 0.82') && t.includes('Closeness 1.00 1.00'), t)
await setRange(C, 0, 0.2)
await sleep(200)
t = await readout(2, 'fragility')
ok('fragility: small-world, missing links, f = 0.20: degree 0.48, betweenness 0.74, eigenvector 0.36 / 0.17', t.includes('Degree 0.48 0.41') && t.includes('Betweenness 0.74 0.49') && t.includes('Eigenvector 0.36 0.17'), t)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
