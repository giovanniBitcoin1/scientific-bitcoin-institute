// Functional checks of Network Lab module 04 "Triangles, weak ties and
// motifs": the two live figures and the three panels are driven like a reader
// would, and the numbers they show are compared with the ones quoted in the
// lecture, the "what to observe" lists and the exercises (the same numbers
// that scripts/lab/check-network-04.mjs pins down in Node).
//
//   node modules/network-triangles-weak-ties-motifs.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/triangles-weak-ties-motifs`, 1500)
await settle(p)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const figText = async (i) => flat(await p.evaluate((k) => document.querySelectorAll('figure')[k].innerText, i))
const readout = async (panel, name) =>
  flat(await p.evaluate((sel, k, n) => document.querySelectorAll(sel)[k].querySelector(`[data-readout="${n}"]`)?.innerText || '', PANEL, panel, name))
const text = async (selector) => flat(await p.evaluate((sel) => document.querySelector(sel)?.innerText || '', selector))
// Sets a range input the way React expects (native setter, then an input event).
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
  await sleep(250)
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
  await sleep(200)
}
const tap = async (selector) => {
  await p.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) throw new Error('nothing at ' + sel)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, selector)
  await sleep(200)
}
const done = async (scope, name, tries = 240) => {
  for (let i = 0; i < tries; i++) {
    if (await p.evaluate((sel, n) => document.querySelector(`${sel} [data-readout="${n}"]`)?.dataset.done === '1', scope, name)) return true
    await sleep(250)
  }
  return false
}
const A = `${PANEL}:nth-child(1)`
const B = `${PANEL}:nth-child(2)`
const C = `${PANEL}:nth-child(3)`
const OVERLAP = 0
const PATTERNS = 1
const fig = (i) => `figure:nth-of-type(${i + 1})`

// ---- Figure "Overlap"
let t = await figText(OVERLAP)
ok('overlap figure starts on b–c: shared a and d, overlap 2/3 = 0.67', t.includes('Link b–c') && t.includes('shared neighbours: a, d') && t.includes('2/3 = 0.67'), t)
ok(
  'overlap figure: twelve nodes, eighteen links, three of them dashed (local bridges)',
  await p.$$eval('figure', (f, k) => f[k].querySelectorAll('circle').length === 12 && f[k].querySelectorAll('line[data-link]').length === 18 && f[k].querySelectorAll('line[stroke-dasharray]').length === 3, OVERLAP),
)
await tap('figure line[data-link="f-g"]')
t = await figText(OVERLAP)
ok('overlap figure, f–g: no shared neighbour, 0/4 = 0.00, a bridge', t.includes('Link f–g') && t.includes('no shared neighbour') && t.includes('0/4 = 0.00') && t.includes('the network splits in two'), t)
await tap('figure line[data-link="h-j"]')
t = await figText(OVERLAP)
ok('overlap figure, h–j: a local bridge that is not a bridge', t.includes('Link h–j') && t.includes('0/4 = 0.00') && t.includes('A local bridge: its two ends share nobody') && !t.includes('splits'), t)
await tap('figure line[data-link="a-b"]')
t = await figText(OVERLAP)
ok('overlap figure, a–b: shared c, 1/2 = 0.50', t.includes('shared neighbours: c.') && t.includes('1/2 = 0.50'), t)

// ---- Figure "Thirteen patterns"
t = await figText(PATTERNS)
ok('patterns figure: thirteen buttons, starting on the feed-forward loop (7 of 13)', (await p.$$eval('figure button[data-pattern]', (b) => b.length)) === 13 && t.includes('7 of 13') && t.includes('Feed-forward loop') && /where it turns up/i.test(t), t)
await tap('figure button[data-pattern="chain"]')
t = await figText(PATTERNS)
ok('patterns figure, chain: name and where it turns up (food webs)', t.includes('3 of 13') && t.includes('Chain') && t.includes('Food webs') && t.includes('Open:'), t)
await tap('figure button[data-pattern="cycle"]')
t = await figText(PATTERNS)
ok('patterns figure, cycle: name and where it turns up', t.includes('Three-node cycle') && t.includes('electronic circuits') && t.includes('Closed:'), t)
await tap('figure button[data-pattern="allMutual"]')
t = await figText(PATTERNS)
ok('patterns figure, all mutual: a name, and no "where" line', t.includes('13 of 13') && t.includes('All mutual') && !/where it turns up/i.test(t), t)

// ---- Panel A: close the triangle
t = await readout(0, 'closure')
ok('closure: starts at 200 links, no triangle, every link a local bridge, largest piece 0.815, distance 6.22', t.includes('Links 200') && t.includes('Transitivity 0.000') && t.includes('Local bridges 1.000') && t.includes('Largest piece 0.815') && t.includes('6.22'), t)
await click(A, 'Step')
t = await readout(0, 'closure')
ok('closure: Step adds one link, and the line below says which', t.includes('Links 201') && (await readout(0, 'last')).includes('Last link:'), t)
await click(A, 'Run to the end')
t = await readout(0, 'closure')
ok('closure, p = 0.5 at 800 links: 288 closures, transitivity 0.167 (random 0.033), clustering 0.235 (0.030), distance 2.88 (2.76), local bridges 0.180 (0.764)', t.includes('Links 800') && t.includes('on purpose 288') && t.includes('Transitivity 0.167 · random 0.033') && t.includes('Average clustering 0.235 · random 0.030') && t.includes('2.88 · random 2.76') && t.includes('Local bridges 0.180 · random 0.764'), t)
ok('closure: four charts, two curves each', await p.$$eval(`${A} svg[role=img]`, (s) => s.length === 4 && s.every((x) => x.querySelectorAll('polyline').length === 2)))
await setRange(A, 0, 1)
t = await readout(0, 'closure')
ok('closure: moving the slider starts again from 200 links', t.includes('Links 200'), t)
await click(A, 'Run to the end')
t = await readout(0, 'closure')
ok('closure, p = 1: 600 closures, transitivity 0.339, clustering 0.455, local bridges 0.009, largest piece still 0.815 (random 1.000)', t.includes('on purpose 600') && t.includes('Transitivity 0.339') && t.includes('Average clustering 0.455') && t.includes('Local bridges 0.009') && t.includes('Largest piece 0.815 · random 1.000'), t)
await setRange(A, 0, 0)
await click(A, 'Run to the end')
t = await readout(0, 'closure')
ok('closure, p = 0: the network is the random one (0.033 and 0.033, 0 closures)', t.includes('on purpose 0') && t.includes('Transitivity 0.033 · random 0.033') && t.includes('2.76 · random 2.76'), t)
await setRange(A, 0, 0.75)
await click(A, 'Play')
let finished = false
for (let i = 0; i < 80 && !finished; i++) {
  await sleep(250)
  finished = await p.evaluate((sel) => document.querySelector(`${sel} [data-readout="closure"]`).dataset.done === '1', A)
}
t = await readout(0, 'closure')
ok('closure, p = 0.75 with Play: the run reaches 800 links; transitivity 0.245, largest piece 0.950', finished && t.includes('Transitivity 0.245') && t.includes('Largest piece 0.950'), t)
await click(A, 'Reset')
ok('closure: Reset goes back to 200 links', (await readout(0, 'closure')).includes('Links 200'))

// ---- Panel B: weak ties hold it together
// How long the run of 300 networks takes, from the first curves to the end.
const doneNow = (sel) => p.evaluate((x) => document.querySelector(`${x} [data-readout="weak"]`)?.dataset.done === '1', sel)
// Times are performance.now() in the page: milliseconds from the start of navigation.
const now = () => p.evaluate(() => performance.now())
const timeRun = async () => {
  let firstCurves = null
  for (let i = 0; i < 1200; i++) {
    if (firstCurves === null && (await p.evaluate((x) => document.querySelectorAll(`${x} svg[role=img]`)[0]?.querySelectorAll('polyline').length === 5, B))) firstCurves = await now()
    if (await doneNow(B)) return { total: await now(), firstCurves }
    await sleep(50)
  }
  return null
}
// The page reloads Panel B from scratch so that the timing starts at the beginning of the run.
await p.goto(`${site.url}${lab.basePath}/triangles-weak-ties-motifs`, { waitUntil: 'domcontentloaded' })
const timing = await timeRun()
ok('weak ties: the experiment of 300 networks finishes', !!timing, JSON.stringify(timing))
if (timing) console.log(`NOTE  weak ties, switch on: 300 networks in ${(timing.total / 1000).toFixed(1)} s (from the start of navigation; first curves after ${((timing.firstCurves ?? 0) / 1000).toFixed(1)} s)`)
t = await text(B)
ok('weak ties: the table says "average of 300 networks"', t.toLowerCase().includes('average of 300 networks'), t.slice(0, 300))
ok('weak ties: the drawn network has 1,264 links and is in one piece', t.includes('0 OF 1,264 LINKS REMOVED') || t.toLowerCase().includes('0 of 1,264 links removed'), t.slice(0, 300))
ok('weak ties: at f = 0 the drawing is one piece of 200', (await readout(1, 'drawn')).includes('Largest piece: 200 of 200 nodes · pieces: 1'))
await setRange(B, 0, 0.04)
t = await readout(1, 'weak')
ok('weak ties, on, f = 0.04: weakest first 0.974', t.includes('Weakest first 0.974'), t)
await setRange(B, 0, 0.06)
t = await readout(1, 'weak')
ok('weak ties, on, f = 0.06: weakest first 0.413, strongest first 1.000, lowest overlap first 0.229', t.includes('Weakest first 0.413') && t.includes('Strongest first 1.000') && t.includes('Lowest overlap first 0.229'), t)
const drawn = await readout(1, 'drawn')
ok('weak ties: the drawing has lost links and is no longer one piece', /pieces: ([2-9]|\d\d)/.test(drawn), drawn)
await setRange(B, 0, 0.1)
t = await readout(1, 'weak')
ok('weak ties, on, f = 0.10: weakest first 0.129, strongest first 1.000', t.includes('Weakest first 0.129') && t.includes('Strongest first 1.000'), t)
await setRange(B, 0, 0.9)
t = await readout(1, 'weak')
ok('weak ties, on, f = 0.90: strongest first 0.455, at random 0.160', t.includes('Strongest first 0.455') && t.includes('At random 0.160'), t)
await setRange(B, 0, 0.8)
t = await readout(1, 'weak')
ok('weak ties, on, f = 0.80: strongest first 0.848, at random 0.822', t.includes('Strongest first 0.848') && t.includes('At random 0.822'), t)
// The three orders that ignore strength, read off the table at a few fractions, switch on.
const UNMOVED = ['At random', 'Lowest overlap first', 'Highest overlap first']
const FS = [0.05, 0.06, 0.5, 0.8, 0.86, 0.9]
const rowsAt = async () => {
  const out = []
  for (const f of FS) {
    await setRange(B, 0, f)
    const r = await readout(1, 'weak')
    out.push(UNMOVED.map((label) => (r.match(new RegExp(`${label} ([0-9.]+) ([0-9.]+)`)) || []).slice(1).join(' ')).join(' | '))
  }
  return out
}
const unmovedOn = await rowsAt()
await click(B, 'Strongest first')
ok('weak ties: two charts of five curves and one of one', await p.$$eval(`${B} svg[role=img]`, (s) => s.length === 3 && s[0].querySelectorAll('polyline').length === 5 && s[1].querySelectorAll('polyline').length === 5 && s[2].querySelectorAll('polyline').length === 1))
let tenths = await p.$eval(`${B} [data-readout="tenths"]`, (e) => e.dataset.values)
ok('weak ties, on: overlap by tenth of strength rises from 0.05 to 0.48', tenths.startsWith('0.05 ') && tenths.endsWith(' 0.48'), tenths)
await tap(`${B} button[data-switch="follow"]`)
await sleep(400)
const tOff = Date.now()
ok('weak ties, switch off: the experiment finishes', await done(B, 'weak'))
console.log(`NOTE  weak ties, switch off: 300 networks in about ${((Date.now() - tOff + 400) / 1000).toFixed(1)} s after the click`)
await setRange(B, 0, 0.8)
t = await readout(1, 'weak')
ok('weak ties, off, f = 0.80: weakest first 0.812, strongest first 0.823, at random 0.822', t.includes('Weakest first 0.812') && t.includes('Strongest first 0.823') && t.includes('At random 0.822'), t)
await setRange(B, 0, 0.85)
t = await readout(1, 'weak')
ok('weak ties, off, f = 0.85: weakest first 0.486, strongest first 0.508', t.includes('Weakest first 0.486') && t.includes('Strongest first 0.508'), t)
await setRange(B, 0, 0.06)
t = await readout(1, 'weak')
ok('weak ties, off, f = 0.06: weakest and strongest first 1.000, lowest overlap first still 0.229', t.includes('Weakest first 1.000') && t.includes('Strongest first 1.000') && t.includes('Lowest overlap first 0.229'), t)
const unmovedOff = await rowsAt()
ok('weak ties: at random, lowest and highest overlap first read the same with the switch on and off', unmovedOn.every((r, i) => r === unmovedOff[i] && r.split(' | ').every((x) => /^[0-9.]+ [0-9.]+$/.test(x))), `${unmovedOn.join(' / ')} || ${unmovedOff.join(' / ')}`)
tenths = await p.$eval(`${B} [data-readout="tenths"]`, (e) => e.dataset.values)
ok('weak ties, off: overlap by tenth of strength stays between 0.26 and 0.29', tenths.split(' ').every((v) => Number(v) >= 0.26 && Number(v) <= 0.29), tenths)
ok('weak ties: the drawing is a canvas that does not capture touch', await p.$$eval(`${B} canvas`, (c) => c.length === 1 && getComputedStyle(c[0]).touchAction !== 'none'))

// ---- Panel C: motif counter
const row = (id) => text(`${C} tr[data-pattern="${id}"]`)
ok('motifs: the experiment finishes', await done(C, 'motifs'))
t = await text(C)
ok('motifs: regulation-like network 1: 100 nodes, 116 links, 0 mutual', t.toLowerCase().includes('network 1: 100 nodes, 116 links, 0 mutual'), t.slice(0, 400))
ok('motifs, regulation-like, 200: feed-forward loop 39, 15.8, 3.3, 7.0', (await row('feedForward')).includes('39 15.8 3.3 7.0'), await row('feedForward'))
ok('motifs, regulation-like: fan-out 401 424.2 −7.0, fan-in 72 95.2 −7.0, chain 72 94.6 −6.5', (await row('fanOut')).includes('401 424.2 3.3 −7.0') && (await row('fanIn')).includes('72 95.2 3.3 −7.0') && (await row('chain')).includes('72 94.6 3.5 −6.5'), `${await row('fanOut')} | ${await row('fanIn')} | ${await row('chain')}`)
ok('motifs: thirteen rows in the table and thirteen in the bar chart', await p.evaluate((sel) => document.querySelectorAll(`${sel} tr[data-pattern]`).length === 13 && document.querySelectorAll(`${sel} svg[role=img] > g > g`).length >= 13, C))
await setRange(C, 0, 1000)
ok('motifs: 1,000 randomisations finish', await done(C, 'motifs'))
ok('motifs, regulation-like, 1,000: feed-forward loop 39, 15.7, 3.5, 6.7', (await row('feedForward')).includes('39 15.7 3.5 6.7'), await row('feedForward'))
await setRange(C, 0, 200)
await p.select(`${C} select`, 'foodWeb')
await sleep(400)
ok('motifs, food web: the experiment finishes', await done(C, 'motifs'))
ok('motifs, food web: feed-forward loop 0, 14.8, 3.9, −3.8; chain 461, 439.2, 5.8, 3.7', (await row('feedForward')).includes('0 14.8 3.9 −3.8') && (await row('chain')).includes('461 439.2 5.8 3.7'), `${await row('feedForward')} | ${await row('chain')}`)
await p.select(`${C} select`, 'random')
await sleep(400)
ok('motifs, random: the experiment finishes', await done(C, 'motifs'))
ok('motifs, random: feed-forward loop 6, 4.1, 2.1, 0.9; a dash for a pattern that never occurs', (await row('feedForward')).includes('6 4.1 2.1 0.9') && (await row('allMutual')).trim().endsWith('–'), `${await row('feedForward')} | ${await row('allMutual')}`)
await click(C, 'New network')
await sleep(300)
ok('motifs: "New network" draws network 2 and counts again', (await done(C, 'motifs')) && (await text(C)).toLowerCase().includes('network 2: 100 nodes, 150 links'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
