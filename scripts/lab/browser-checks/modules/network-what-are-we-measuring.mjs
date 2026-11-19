// Functional checks of Network Lab module 02 "What are we measuring?": the
// two live figures and the three panels are driven like a reader would, and
// the numbers they show are compared with the ones quoted in the lecture, the
// "what to observe" lists and the exercises (the same numbers that
// scripts/lab/check-network-02.mjs pins down in Node).
//
//   node modules/network-what-are-we-measuring.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/what-are-we-measuring`, 1500)
await settle(p)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const panelText = async (i) => flat(await p.evaluate((sel, k) => document.querySelectorAll(sel)[k].innerText, PANEL, i))
const figText = async (i) => flat(await p.evaluate((k) => document.querySelectorAll('figure')[k].innerText, i))
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
const click = (scope, label) =>
  p.evaluate(
    (sel, l) => {
      const b = [...document.querySelectorAll(`${sel} button`)].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    scope,
    label,
  )

// ---- Figure 1: where do you draw the line?
const F1 = 'figure:nth-of-type(1)'
let t = await figText(0)
ok('figure 1, threshold 1: 22 links, one component', t.includes('Links L 22') && t.includes('Components 1'), t)
await setRange('figure', 0, 4)
await sleep(150)
t = await figText(0)
ok('figure 1, threshold 4: 18 links, the two groups separate', t.includes('Links L 18') && t.includes('Density 0.40') && t.includes('Components 2'), t)
ok('figure 1: only the links at or above the threshold are drawn', (await p.$$eval('figure svg', (svgs) => svgs[0].querySelectorAll('line').length)) === 18)
await setRange('figure', 0, 10)
await sleep(150)
t = await figText(0)
ok('figure 1, threshold 10: 2 links, 8 components', t.includes('Links L 2') && t.includes('Components 8'), t)
void F1

// ---- Figure 2: thinning (its slider is the second range input inside a figure)
t = await figText(1)
ok('figure 2, power law at p = 0.5: true mean 1.90, observed 0.95, 41.4% with no links', t.includes('True mean 1.90') && t.includes('Observed mean 0.95') && t.includes('41.4%'), t)
await p.evaluate(() => [...document.querySelectorAll('figure')[1].querySelectorAll('button')].find((b) => b.innerText.includes('Poisson')).click())
await setRange('figure', 1, 0.25)
await sleep(200)
t = await figText(1)
ok('figure 2, Poisson(8) at p = 0.25: observed mean 2.00, 13.5% with no links (e⁻²)', t.includes('True mean 8.00') && t.includes('Observed mean 2.00') && t.includes('13.5%'), t)

// ---- Panel A: the observer
const A = `${PANEL}:nth-child(1)`
await choose(0, 0, 'smallWorld')
await setRange(A, 0, 0.3)
await sleep(300)
t = await panelText(0)
ok('observer: small-world, random nodes at 0.3: ⟨k⟩ 6.00 → 1.67, transitivity 0.494 → 0.481', t.includes('Average degree ⟨k⟩ 6.00 1.67') && t.includes('Transitivity 0.494 0.481'), t.slice(0, 900))
await choose(0, 1, 'links')
t = await panelText(0)
ok('observer: small-world, random links at 0.3: transitivity 0.138', t.includes('Transitivity 0.494 0.138'), t.slice(0, 900))
await choose(0, 0, 'dense')
await choose(0, 1, 'trees')
t = await panelText(0)
ok('observer: dense truth, one source: 6000 → 599 links, ⟨k⟩ 20.00 → 2.00', t.includes('Links L 6000 599') && t.includes('Average degree ⟨k⟩ 20.00 2.00') && t.includes('1 source'), t.slice(0, 900))
await setRange(A, 0, 10)
await sleep(300)
t = await panelText(0)
ok('observer: dense truth, ten sources: 3984 links', t.includes('Links L 6000 3984') && t.includes('10 sources'), t.slice(0, 900))
await choose(0, 0, 'scaleFree')
await choose(0, 1, 'walk')
t = await panelText(0)
ok('observer: scale-free, random walk at 0.3: plain average 14.37, weighted 6.15', t.includes('plain average 14.37') && t.includes('weighted by 1/k: 6.15') && t.includes('⟨k²⟩/⟨k⟩ = 14.75'), t.slice(300, 1300))
const before = t
await click(A, 'New sample')
await sleep(300)
ok('observer: New sample draws another sample', (await panelText(0)) !== before)
await choose(0, 0, 'smallWorld')
await choose(0, 1, 'spurious')
await setRange(A, 0, 0.02)
await sleep(300)
t = await panelText(0)
ok('observer: small-world, 2% spurious links: distance 6.73 → 6.00, 36 links added', t.includes('Average distance in it 6.73 6.00') && t.includes('36 spurious links'), t.slice(0, 900))
await choose(0, 1, 'merged')
t = await panelText(0)
ok('observer: small-world, 5% merged: 570 nodes, largest degree 8 → 18', t.includes('Nodes N 600 570') && t.includes('Largest degree 8 18') && t.includes('30 merges'), t.slice(0, 900))
await settle(p)
ok('observer: the bias curves are drawn (three series of dots)', (await p.$$eval(`${A} svg`, (svgs) => svgs[svgs.length - 4].querySelectorAll('circle').length)) >= 30)
ok('observer: two canvases, neither captures touch', (await p.$$eval(`${A} canvas`, (cs) => cs.length === 2 && cs.every((c) => getComputedStyle(c).touchAction !== 'none'))))

// ---- Panel B: compared to what?
const Bp = `${PANEL}:nth-child(2)`
t = await panelText(1)
ok('null: karate club, transitivity, same N and L, 200 samples: observed 0.256, null mean 0.135, z 4.27', t.includes('Observed 0.256') && t.includes('Null mean 0.135') && t.includes('z-score 4.27') && t.includes('200 samples'), t.slice(0, 900))
await click(Bp, 'Same degrees')
await settle(p)
t = await panelText(1)
ok('null: same degrees: null mean 0.222, z 1.34, 9.5% at least as extreme, 1560 attempted swaps per sample', t.includes('Null mean 0.222') && t.includes('z-score 1.34') && t.includes('9.5%') && t.includes('1560 attempted swaps'), t.slice(0, 900))
await choose(1, 1, 'assortativity')
await settle(p)
t = await panelText(1)
ok('null: karate assortativity, same degrees: observed -0.476, null mean -0.307, z -3.61', t.includes('Observed -0.476') && t.includes('Null mean -0.307') && t.includes('z-score -3.61'), t.slice(0, 900))
await choose(1, 1, 'transitivity')
await click(Bp, 'Watch a swap')
await sleep(400)
t = await panelText(1)
ok('null: Watch a swap names the two links being exchanged', / and .+ become .+ and /.test(t), t.slice(-260))
await sleep(2200)
t = await panelText(1)
ok('null: after it, 1 swap made', t.includes('1 swap made'), t.slice(-260))
await click(Bp, 'Swap 100 times')
await sleep(300)
t = await panelText(1)
ok('null: Swap 100 times: 101 swaps made, the transitivity of the drawing has moved', t.includes('101 swaps made') && !t.includes('transitivity 0.256'), t.slice(-260))
await click(Bp, 'Original network')
await sleep(300)
t = await panelText(1)
ok('null: Original network restores it (0 swaps, transitivity 0.256)', t.includes('0 swaps made') && t.includes('transitivity 0.256'), t.slice(-260))
await choose(1, 0, 'florentine')
await choose(1, 1, 'triangles')
await settle(p)
t = await panelText(1)
ok('null: Florentine families, triangles: observed 3', t.includes('Observed 3 '), t.slice(0, 700))

// ---- Panel C: your friends have more friends
t = await panelText(2)
ok('friends: scale-free: 5.99 against 15.13, 903 of 1000', t.includes('5.99') && t.includes('15.13') && t.includes('903 of 1000 (90.3%)'), t.slice(0, 900))
ok('friends: early warning: lead 1.93 steps, friends ahead in 96% of 200 runs', t.includes('1.93 steps') && t.includes('96%') && t.includes('24.1') && t.includes('Average of 200 runs'), t.slice(0, 900))
await choose(2, 0, 'ring')
await settle(p)
t = await panelText(2)
ok('friends: ring lattice: 6.00 and 6.00, 0 of 1000', t.includes('⟨k⟩ 6.00') && t.includes('⟨k²⟩/⟨k⟩ 6.00') && t.includes('0 of 1000 (0.0%)'), t.slice(0, 900))
await choose(2, 0, 'karate')
await settle(p)
t = await panelText(2)
ok('friends: karate club: 4.59 against 7.77, 29 of 34, groups of 9', t.includes('4.59') && t.includes('7.77') && t.includes('29 of 34') && t.includes('Two groups of 9'), t.slice(0, 1200))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
