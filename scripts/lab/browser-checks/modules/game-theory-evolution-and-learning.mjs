// Functional checks of Game Theory Lab module 07 "Evolution and learning":
// the two live figures and the three panels are driven like a reader would,
// and the numbers they show are compared with the ones in the lecture, the
// observe lists and the exercises. It also times F2's slider, Panel A's
// trajectory, Panel B's 10,000 mutants and "Watch one", and Panel C's run at
// T = 10,000.
//
//   node modules/game-theory-evolution-and-learning.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/evolution-and-learning`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ').trim()
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
const has = async (name) => !!(await p.$(`[data-role="${name}"]`))
const val = (scope, k) => p.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.replace(/\s+/g, ' ').trim())
const click = (sel, k, label) =>
  p.evaluate(
    (s, i, l) => {
      const b = [...document.querySelectorAll(s)[i].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase().replace(/^✎\s*/, '') === l.toLowerCase())
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    sel,
    k,
    label,
  )
const setSlider = (sel, k, label, value) =>
  p.evaluate(
    (s, i, l, v) => {
      const root = document.querySelectorAll(s)[i]
      const lab = [...root.querySelectorAll('label')].find((x) => x.innerText.trim() === l)
      if (!lab) throw new Error('no slider ' + l)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    sel,
    k,
    label,
    value,
  )
const waitFor = async (fn, ms = 60000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await sleep(10)
  }
  return -1
}
// A mouse click at viewBox coordinates (x, y) of an SVG of viewBox width W, height H.
const clickSvg = async (sel, x, y, W, H) => {
  const r = await p.$eval(sel, (s) => {
    s.scrollIntoView({ block: 'center', behavior: 'instant' })
    const b = s.getBoundingClientRect()
    return { x: b.left, y: b.top, w: b.width, h: b.height }
  })
  await p.mouse.click(r.x + (x / W) * r.w, r.y + (y / H) * r.h)
  await sleep(150)
}
let t

// ---- Figure F1: four fates
const fv = (k) => val('fates-readout', k)
const rests = () => p.$$eval('[data-role="fates-phase"] [data-rest]', (c) => c.map((x) => x.getAttribute('data-rest')).join(','))
ok('F1 default chicken (1.33, 0.33): coexistence, x* = 0.500 stable; rest points unstable, stable, unstable',
  (await fv('ts')) === '(1.33, 0.33)' && (await fv('region')) === 'Chicken' && (await fv('fate')) === 'C and D coexist at x*' && (await fv('xstar')) === '0.500, stable' && (await rests()) === 'unstable,stable,unstable', `${await fv('ts')} ${await rests()}`)
await click('figure', 0, 'Stag hunt')
await sleep(100)
ok('F1 stag hunt: bistable, x* = 0.667 unstable (exercise 2)', (await fv('fate')) === 'C or D, depending on the side of x*' && (await fv('xstar')) === '0.667, unstable' && (await rests()) === 'stable,unstable,stable')
await click('figure', 0, 'Dilemma')
await sleep(100)
ok('F1 dilemma (2.00, −0.50): D takes over, none inside', (await fv('ts')) === '(2.00, −0.50)' && (await fv('fate')) === 'D takes over' && (await fv('xstar')) === 'none inside' && (await rests()) === 'stable,unstable')
await click('figure', 0, 'Harmony')
await sleep(100)
ok('F1 harmony: C takes over', (await fv('fate')) === 'C takes over' && (await rests()) === 'unstable,stable')
await p.$eval('[data-role="fates-map"]', (s) => s.focus())
for (let i = 0; i < 12; i++) await p.keyboard.press('ArrowRight')
await sleep(100)
ok('F1 arrow keys move by 0.05: (1.10, 0.50) is chicken with x* = 0.833', (await fv('ts')) === '(1.10, 0.50)' && (await fv('region')) === 'Chicken' && (await fv('xstar')) === '0.833, stable', `${await fv('ts')} ${await fv('xstar')}`)
// The map: T from 0 to 2 over x 26…244, S from 1 to −1 over y 6…196, viewBox 250 × 214.
await clickSvg('[data-role="fates-map"]', 26 + (1.5 / 2) * 218, 6 + ((1 + 0.5) / 2) * 190, 250, 214)
ok('F1 a mouse click moves the point (near (1.5, −0.5): the dilemma)', /^\(1\.(49|50|51), −0\.(49|50|51)\)$/.test(await fv('ts')) && (await fv('region')) === "Prisoner's Dilemma", await fv('ts'))

// ---- Figure F2: the traffic light
const tv = (k) => val('traffic-readout', k)
ok('F2 d = 0: mixed 0.500/2.000; best 1/3, 1/3, 1/3, 0 → 2.667; worst → 1.667; coin 2.5; area 3.0000',
  (await tv('mixed')) === 'swerve with 0.500, payoff 2.000' && (await tv('best')) === 'SS 0.333, SG 0.333, GS 0.333, GG 0.000; payoff 2.667' && (await tv('worst')) === 'SS 0.000, SG 0.333, GS 0.333, GG 0.333; payoff 1.667'
  && (await tv('coin')) === 'payoff 2.5 each' && (await tv('area')) === '3.0000', await tv('best'))
let t0 = Date.now()
await setSlider('figure', 1, 'd, the payoff of a crash (go, go)', -1)
const tF2 = await waitFor(async () => (await tv('area')) === '2.8500', 5000)
ok('F2 d = −1: best 2.750 (0.5, 0.25, 0.25, 0), worst 1.800, mixed 0.667/2.333, area 2.8500', (await tv('best')) === 'SS 0.500, SG 0.250, GS 0.250, GG 0.000; payoff 2.750' && (await tv('worst')).endsWith('payoff 1.800') && (await tv('mixed')) === 'swerve with 0.667, payoff 2.333')
info(`timing: F2 after a slider move ${tF2} ms (call to readout ${Date.now() - t0} ms)`)
await setSlider('figure', 1, 'd, the payoff of a crash (go, go)', -2)
await sleep(100)
ok('F2 d = −2: best 2.800, worst 1.857, mixed 2.500, area 2.8286', (await tv('best')).endsWith('payoff 2.800') && (await tv('worst')).endsWith('payoff 1.857') && (await tv('mixed')) === 'swerve with 0.750, payoff 2.500' && (await tv('area')) === '2.8286')
await setSlider('figure', 1, 'd, the payoff of a crash (go, go)', 0.5)
await sleep(100)
ok('F2 d = 0.5: best 2.600, worst 1.500, mixed 1.667, area 3.3000', (await tv('best')).endsWith('payoff 2.600') && (await tv('worst')).endsWith('payoff 1.500') && (await tv('mixed')) === 'swerve with 0.333, payoff 1.667' && (await tv('area')) === '3.3000')
ok('F2 draws the feasible set, the correlated region, the coins and three Nash points', (await p.$$eval('[data-role="traffic-plane"] [data-nash]', (x) => x.length)) === 3 && !!(await p.$('[data-region="correlated"]')) && !!(await p.$('[data-region="coins"]')))

// ---- Panel A: rock, paper, scissors
const av = (k) => val('rps-readout', k)
ok('Panel A defaults a = b = 1: at t = 100 (0.4179, 0.1774, 0.4047), x1x2x3 0.03000, average (0.329, 0.336, 0.334), ± 0.57735i closed cycles (observe 1)',
  (await av('point')) === '(0.4179, 0.1774, 0.4047)' && (await av('V')) === '0.03000' && (await av('avg')) === '(0.329, 0.336, 0.334)' && (await av('eig')) === '± 0.57735i' && (await av('eigKind')) === 'closed cycles',
  `${await av('point')} ${await av('V')} ${await av('avg')} ${await av('eig')}`)
await click(PANEL, 0, 'Win more')
await sleep(150)
ok('Panel A "Win more": −0.08333 ± 0.72169i, in; (0.3333, 0.3334, 0.3334), 0.03704 (observe 2)', (await av('eig')) === '−0.08333 ± 0.72169i' && (await av('eigKind')) === 'the population spirals in' && (await av('point')) === '(0.3333, 0.3334, 0.3334)' && (await av('V')) === '0.03704', await av('eig'))
await click(PANEL, 0, 'Lose more')
await sleep(150)
ok('Panel A "Lose more": +0.08333 ± 0.72169i, out; (1.0000, 0.0000, 0.0000), 1.99e-17 (observe 3)', (await av('eig')) === '+0.08333 ± 0.72169i' && (await av('eigKind')) === 'the population spirals out' && (await av('point')) === '(1.0000, 0.0000, 0.0000)' && (await av('V')) === '1.99e-17', `${await av('eig')} ${await av('V')}`)
await setSlider(PANEL, 0, 'a, what a win pays', 2)
await setSlider(PANEL, 0, 'b, what a loss costs', 1)
await sleep(150)
ok('Panel A a = 2, b = 1: −0.16667 ± 0.86603i', (await av('eig')) === '−0.16667 ± 0.86603i', await av('eig'))
await click(PANEL, 0, 'Repeated dilemma')
await sleep(150)
ok('Panel A "Repeated dilemma": the matrix, two marks, no eigenvalues; from (0.5, 0.3, 0.2) to (0.0230, 0.0000, 0.9770) (observe 5)',
  (await role('rps-matrix')).includes('[30, 0, 30] [50, 10, 14] [30, 9, 30]') && (await p.$$eval('[data-role="rps-marks"] [data-mark]', (x) => x.length)) === 2 && !(await p.$('[data-role="rps-readout"] [data-value="eig"]')) && (await av('point')) === '(0.0230, 0.0000, 0.9770)', await av('point'))
// Click the simplex at (0.1, 0.85, 0.05): side 280, origin (20, 22), viewBox 320 × (280·√3/2 + 48).
{
  const side = 280
  const h = (side * Math.sqrt(3)) / 2
  const x = [0.1, 0.85, 0.05]
  const px = 20 + x[0] * (side / 2) + x[2] * side
  const py = 22 + (x[1] + x[2]) * h
  t0 = Date.now()
  await clickSvg('[data-role="rps-simplex"]', px, py, 320, h + 48)
  const tTraj = await waitFor(async () => (await p.$eval('[data-role="rps-readout"]', (e) => e.innerText)).includes('t = 100.0'), 20000)
  ok('Panel A a click starts a trajectory there; always defect takes over (observe 5)', (await p.$$eval('[data-role="rps-simplex"] [data-traj]', (g) => g.length)) === 2 && (await av('point')) === '(0.0000, 1.0000, 0.0000)', await av('point'))
  info(`timing: Panel A trajectory from the click to t = 100 drawn ${tTraj} ms (computed at once, drawn 0.8 time units per frame)`)
}
await click(PANEL, 0, 'Clear')
await sleep(100)
ok('Panel A "Clear": one trajectory left', (await p.$$eval('[data-role="rps-simplex"] [data-traj]', (g) => g.length)) === 1)
await click(PANEL, 0, 'Play')
await sleep(150)
const mid = await p.$eval('[data-role="rps-readout"]', (e) => e.innerText)
const tPlay = await waitFor(async () => (await p.$eval('[data-role="rps-readout"]', (e) => e.innerText)).includes('t = 100.0'), 20000)
ok('Panel A Play replays the trajectory from t = 0', !mid.includes('t = 100.0') && tPlay > 0)

// ---- Panel B: one mutant
const bv = (k) => val('moran-readout', k)
ok('Panel B defaults r = 1.1, N = 10: ρ_A 0.147950, ρ_B 0.062745, 1/N 0.100000 (observe 1, exercise 5)', (await bv('rhoA')) === '0.147950' && (await bv('rhoB')) === '0.062745' && (await bv('neutral')) === '0.100000')
t0 = Date.now()
await click(PANEL, 1, 'Run 10,000 mutants')
const tRun = await waitFor(async () => !!(await p.$('[data-role="moran-readout"] [data-value="measured"]')), 10000)
ok('Panel B run 1: 0.1504 (95%: 0.1434–0.1574) and its bar on the chart (observe 1)', (await bv('measured')) === '0.1504 (95%: 0.1434–0.1574), run 1' && (await has('moran-measured')), await bv('measured'))
info(`timing: Panel B "Run 10,000 mutants" (r = 1.1, N = 10) ${tRun} ms (click to readout ${Date.now() - t0} ms)`)
t0 = Date.now()
await click(PANEL, 1, 'Watch one')
const tWatch = await waitFor(async () => /took over|died out/.test(await role('moran-watch-text')), 120000)
t = await role('moran-watch-text')
ok('Panel B "Watch one" ends with the mutant fixed or lost', /took over|died out/.test(t), t)
info(`timing: Panel B "Watch one" at N = 10 ran to its end in ${tWatch} ms (${t})`)
await setSlider(PANEL, 1, 'r, the mutant’s fitness', 0.9)
await sleep(100)
ok('Panel B r = 0.9: 0.059482; the old measurement is hidden (observe 2)', (await bv('rhoA')) === '0.059482' && !(await p.$('[data-role="moran-readout"] [data-value="measured"]')))
await setSlider(PANEL, 1, 'N, the population', 100)
await sleep(100)
ok('Panel B r = 0.9, N = 100: 0.000003', (await bv('rhoA')) === '0.000003', await bv('rhoA'))
await click(PANEL, 1, 'Stag hunt')
await setSlider(PANEL, 1, 'N, the population', 50)
await sleep(100)
ok('Panel B stag hunt, N = 50, w = 0.1: stag 0.001284, the reverse 0.018412 (observe 3)', (await bv('rhoA')) === '0.001284' && (await bv('rhoB')) === '0.018412', `${await bv('rhoA')} ${await bv('rhoB')} ${await bv('ratio')}`)
await click(PANEL, 1, 'hare')
await sleep(100)
ok('Panel B hare mutant: 0.018412, ratio 14.34 (observe 3, exercise 5)', (await bv('rhoA')) === '0.018412' && (await bv('ratio')) === '14.34', `${await bv('rhoA')} ${await bv('ratio')}`)
t0 = Date.now()
await click(PANEL, 1, 'Run 10,000 mutants')
const tRun2 = await waitFor(async () => !!(await p.$('[data-role="moran-readout"] [data-value="measured"]')), 10000)
const meas = Number((await bv('measured')).split(' ')[0])
ok('Panel B 10,000 hare mutants: within 4 standard errors of 0.0184',Math.abs(meas - 0.018412) < 4 * Math.sqrt((0.018412 * (1 - 0.018412)) / 10000), String(meas))
info(`timing: Panel B "Run 10,000 mutants" (hare, N = 50, w = 0.1) ${tRun2} ms (click to readout ${Date.now() - t0} ms)`)
await click(PANEL, 1, 'stag')
await setSlider(PANEL, 1, 'N, the population', 10)
await sleep(100)
ok('Panel B stag mutant at N = 10: 0.057358 (observe 3)', (await bv('rhoA')) === '0.057358')
await click(PANEL, 1, 'Coordination')
await setSlider(PANEL, 1, 'N, the population', 50)
await setSlider(PANEL, 1, 'w, the intensity of selection', 338) // the log slider's position for w = 0.01
await sleep(100)
ok('Panel B coordination x* = 0.3, N = 50, w = 0.01: 0.020207, yes; yes (observe 4)', (await bv('rhoA')) === '0.020207' && (await bv('third')) === 'yes; yes', `${await bv('rhoA')} ${await bv('third')}`)
await setSlider(PANEL, 1, 'x*, the unstable point', 0.4)
await sleep(100)
ok('Panel B x* = 0.4: 0.019455, no; no (observe 4)', (await bv('rhoA')) === '0.019455' && (await bv('third')) === 'no; no')
await click(PANEL, 1, 'Dilemma')
await setSlider(PANEL, 1, 'w, the intensity of selection', 677) // w = 0.1
await sleep(100)
ok('Panel B dilemma N = 50, w = 0.1: C 0.000161, the reverse 0.143350 (observe 5)', (await bv('rhoA')) === '0.000161' && (await bv('rhoB')) === '0.143350', `${await bv('rhoA')} ${await bv('rhoB')}`)
await click(PANEL, 1, 'Hawk and dove')
await sleep(100)
ok('Panel B hawk and dove: dove 0.037537, hawk 0.040252 (observe 5)', (await bv('rhoA')) === '0.037537' && (await bv('rhoB')) === '0.040252')

// ---- Panel C: learning by regret
const cv = (k) => val('hedge-readout', k)
const cell = (ij) => p.$eval(`[data-role="hedge-table"] [data-cell="${ij}"]`, (e) => e.innerText.trim())
ok('Panel C defaults (chicken, T = 2,000, η = 0.1): final (0.0000, 1.0000), (go, swerve) 0.875, averages 3.674 and 1.147, regret 0.0036 each, bound 0.0160 (observe 1, exercise 6)',
  (await cv('final')) === '(0.0000, 1.0000)' && (await cell('10')) === '0.875' && (await cv('avg')) === '3.674, 1.147' && (await cv('regret')) === '0.0036, 0.0036' && (await cv('bound')) === '0.0160',
  `${await cv('final')} ${await cv('regret')} ${await cv('bound')}`)
await click(PANEL, 2, 'New run')
await sleep(100)
ok('Panel C run no. 2: the other pure equilibrium, (1.0000, 0.0000)', (await cv('final')) === '(1.0000, 0.0000)' && (await role('hedge-seed')).includes('Run no. 2'))
await click(PANEL, 2, 'Matching pennies')
await sleep(100)
ok('Panel C matching pennies, run no. 1 again: (0.0998, 0.0014), shares 0.516, 0.494, payoffs 0.499, 0.501 (observe 2)',
  (await role('hedge-seed')).includes('Run no. 1') && (await cv('final')) === '(0.0998, 0.0014)' && (await cv('first')) === '0.516, 0.494' && (await cv('avg')) === '0.499, 0.501', await cv('final'))
t0 = Date.now()
await setSlider(PANEL, 2, 'T, the rounds', 10000)
const tC = await waitFor(async () => (await cv('bound')) !== '0.0160', 5000)
info(`timing: Panel C run at T = 10,000 (slider to readout) ${tC} ms (call to readout ${Date.now() - t0} ms)`)
await click(PANEL, 2, 'η for this T')
await sleep(100)
ok('Panel C T = 10,000, "η for this T": η 0.0235, bound 0.0059, regrets 0.0028 and 0.0026, gain from switching 0.0031 (observe 3)',
  (await role(`hedge-seed`)).includes('Run no. 1') && (await cv('bound')) === '0.0059' && (await cv('regret')) === '0.0028, 0.0026' && (await cv('violation')) === '0.0031', `${await cv('bound')} ${await cv('regret')} ${await cv('violation')}`)
await setSlider(PANEL, 2, 'T, the rounds', 2000)
await setSlider(PANEL, 2, 'η, the learning rate', 0.1)
await click(PANEL, 2, 'Dilemma')
await sleep(100)
ok('Panel C dilemma: (D, D) 0.972 (observe 4)', (await cell('11')) === '0.972', await cell('11'))
await click(PANEL, 2, 'Stag hunt')
await sleep(100)
ok('Panel C stag hunt from (0.5, 0.5): (0.0000, 0.0000), hare', (await cv('final')) === '(0.0000, 0.0000)')
// The square: p across 26…232, q up 214…8, viewBox 240.
await clickSvg('[data-role="hedge-square"]', 26 + 0.8 * 206, 214 - 0.8 * 206, 240, 240)
ok('Panel C a click at (0.8, 0.8): the learners end at (stag, stag) (observe 4)', (await role('hedge-seed')).includes('start (0.80, 0.80)') && (await cv('final')) === '(1.0000, 1.0000)', `${await role('hedge-seed')} ${await cv('final')}`)
await click(PANEL, 2, 'Battle of the sexes')
await sleep(100)
ok('Panel C battle of the sexes: (Concert, Concert) 0.970 (observe 5)', (await cell('00')) === '0.970', await cell('00'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
