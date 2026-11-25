// Functional checks of Game Theory Lab module 05 "Incomplete information and
// signals": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises. It also times Panel A with
// 10,000 cars and its "Survey", Panel C's "Simulate" and "Survey", and F2's
// "To the end" at σ = 0.02.
//
//   node modules/game-theory-incomplete-information-signalling.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/incomplete-information-signalling`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ')
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
const has = async (name) => !!(await p.$(`[data-role="${name}"]`))
const click = (sel, k, label) =>
  p.evaluate(
    (s, i, l) => {
      const b = [...document.querySelectorAll(s)[i].querySelectorAll('button')].find((x) => x.innerText.trim().toLowerCase() === l.toLowerCase())
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
    await sleep(20)
  }
  return -1
}
let t

// ---- Figure F1: who is the incumbent?
const pathEdges = () => p.evaluate(() => document.querySelectorAll('figure')[0].querySelectorAll('[data-role="tree"] line[data-path]').length)
const tree = await p.evaluate(() => {
  const s = document.querySelectorAll('figure')[0].querySelector('[data-role="tree"]')
  return { chance: s.querySelectorAll('[data-chance]').length, chanceText: s.querySelector('[data-chance] text').textContent, sets: s.querySelectorAll('[data-infoset]').length, leaves: s.querySelectorAll('[data-leaf]').length, text: s.textContent }
})
ok('F1 draws one chance node marked N, one information set (dashed), six leaves, probabilities on Nature\'s moves', tree.chance === 1 && tree.chanceText === 'N' && tree.sets === 1 && tree.leaves === 6 && tree.text.includes('Tough 0.50') && tree.text.includes('Weak 0.50'), JSON.stringify(tree))
t = await role('types-story')
ok('F1 defaults t = 0.5, w = −1: the tough type fights, the weak shares; entering pays 0.50; t* = 0.667; it enters; six orange edges', t.includes('The tough incumbent fights') && t.includes('= 0.50 on average') && t.includes('t* = 2/(2 − w) = 0.667') && t.includes('the newcomer enters') && t.includes('gets 3') && (await pathEdges()) === 6, t)
await setSlider('figure', 0, 't, chance the incumbent is tough', 0.7)
await sleep(120)
t = await role('types-choice')
ok('F1 t = 0.7: stays out, both types keep 4 (exercise 1); four orange edges', t.includes('stays out') && t.includes('keep 4') && (await role('types-value')).includes('= −0.10 on average') && (await pathEdges()) === 4, t)
await setSlider('figure', 0, 't, chance the incumbent is tough', 0.5)
await setSlider('figure', 0, 'w, the newcomer’s payoff when fought', -2)
await sleep(120)
t = await role('types-story')
ok('F1 w = −2, t = 0.5: exactly t* = 0.500, indifferent, stays out (exercise 1)', t.includes('t* = 2/(2 − w) = 0.500') && t.includes('exactly t*'), t)
await setSlider('figure', 0, 'w, the newcomer’s payoff when fought', -3)
await sleep(120)
ok('F1 w = −3: t* = 0.400', (await role('types-threshold')).includes('0.400'))
await setSlider('figure', 0, 'w, the newcomer’s payoff when fought', -1)

// ---- Figure F2: a little doubt
const val = (k) => p.$eval(`[data-role="global-readout"] [data-value="${k}"]`, (e) => e.innerText.trim())
ok('F2 opens at σ = 0.1, step 0: k = 1.0000, l = 0.0000, open band 1.0000', (await val('step')) === '0' && (await val('k')) === '1.0000' && (await val('l')) === '0.0000' && (await val('width')) === '1.0000')
for (let i = 0; i < 5; i++) await click('figure', 1, 'Next step')
await sleep(120)
ok('F2 five steps at σ = 0.1: k = 0.6006, l = 0.3994 (the self-check)', (await val('step')) === '5' && (await val('k')) === '0.6006' && (await val('l')) === '0.3994', `${await val('k')} ${await val('l')}`)
await click('figure', 1, 'To the end')
await sleep(120)
ok('F2 "To the end" at σ = 0.1: 43 steps, both cutoffs 0.5000', (await val('step')) === '43' && (await val('k')) === '0.5000' && (await val('l')) === '0.5000', await val('step'))
await setSlider('figure', 1, 'σ, the spread of each hunter’s error', 0) // log slider: position 0 is σ = 0.02
await sleep(120)
ok('F2 σ = 0.020: back to step 0', (await val('step')) === '0' && (await p.evaluate(() => document.querySelectorAll('figure')[1].innerText)).includes('0.020'))
let t0 = Date.now()
await click('figure', 1, 'To the end')
const tEnd = await waitFor(async () => (await val('step')) !== '0', 10000)
ok('F2 "To the end" at σ = 0.02: 190 steps, both cutoffs 0.5000', (await val('step')) === '190' && (await val('k')) === '0.5000', await val('step'))
info(`timing: F2 "To the end" at σ = 0.02 ${tEnd} ms (click to readout ${Date.now() - t0} ms)`)
await click('figure', 1, 'Reset')
await sleep(100)
ok('F2 "Reset": step 0', (await val('step')) === '0')

// ---- Panel A: the market that empties
t = await role('lemons-result')
ok('Panel A opens on sample no. 1 (10,000 cars): 27 rounds, price 0.594, cars 0.493, gains 0.326 (observe 1)', t.includes('27 rounds') && t.includes('ends at 0.594') && t.includes('0.493 of the cars') && t.includes('0.326 of the possible gains'), t)
ok('Panel A exact line: 0.600, 0.500, 0.333', (await role('lemons-exact')).includes('ends at 0.600, with 0.500 of the cars and 0.333 of the gains'), await role('lemons-exact'))
t0 = Date.now()
await click(PANEL, 0, 'Run')
await sleep(150)
const replaying = (await role('lemons-result')).includes('Round')
const tRun = await waitFor(async () => (await role('lemons-result')).includes('27 rounds'), 20000)
ok('Panel A "Run" replays the rounds one at a time and ends on the same result', replaying && tRun > 0, await role('lemons-result'))
info(`timing: Panel A "Run" (10,000 cars, 27 rounds replayed at 70 ms) ${((Date.now() - t0) / 1000).toFixed(1)} s; the computation itself is instant (see the self-check)`)
await click(PANEL, 0, 'New sample')
await sleep(150)
ok('Panel A "New sample": sample no. 2, 24 rounds, price 0.597', (await role('lemons-result')).includes('24 rounds') && (await role('lemons-result')).includes('0.597'), await role('lemons-result'))
await click(PANEL, 0, 'New sample') // back to a known seed by reloading the slider path below
await setSlider(PANEL, 0, 'q_min, the worst quality', 0)
await sleep(150)
t = await role('lemons-result')
ok('Panel A q_min = 0 (sample no. 3): the price slides to almost nothing', /ends at 0\.00\d/.test(t), t)
await setSlider(PANEL, 0, 'q_min, the worst quality', 0.4)
await sleep(150)
ok('Panel A q_min = 0.4: one round, the whole market (cars 1.000)', (await role('lemons-result')).startsWith('1 round (') && (await role('lemons-result')).includes('1.000 of the cars'), await role('lemons-result'))
ok('Panel A q_min = 0.4: the exact model trades the whole market at 1.050', (await role('lemons-exact')).includes('whole market trades, at 1.050'), await role('lemons-exact'))
await setSlider(PANEL, 0, 'q_min, the worst quality', 0.2)
await setSlider(PANEL, 0, 'N cars', 1000)
await sleep(150)
ok('Panel A N = 1,000 (sample no. 3)', (await role('lemons-result')).includes('rounds'), await role('lemons-result'))
t0 = Date.now()
await click(PANEL, 0, 'Survey')
const tSurvey = await waitFor(async () => (await has('lemons-survey')) && !(await p.evaluate((s) => document.querySelectorAll(s)[0].innerText, PANEL)).includes('Computing…'), 30000)
const dots = await p.$$eval('[data-role="lemons-survey"] svg circle', (c) => c.length)
ok('Panel A "Survey": two charts with 40 dots each (one sample per b and q_min)', tSurvey >= 0 && dots === 80, `${dots} dots`)
info(`timing: Panel A "Survey" (40 samples of 10,000 cars) ${tSurvey} ms (click to chart ${Date.now() - t0} ms)`)

// ---- Panel B: separate or pool?
ok('Panel B defaults: separation 1.000 to 2.000, pooling 0 to 0.300', (await role('signal-sep')).includes('from 1/c_L = 1.000 to 1/c_H = 2.000') && (await role('signal-pool')).includes('= 0.300'), await role('signal-levels'))
t = await role('signal-candidate')
ok('Panel B separating at 1: equilibrium, high 1.500, low 1.000, wasted 0.150, passes Cho–Kreps (observe 1)', t.includes('It is an equilibrium.') && t.includes('high type 1.500, low type 1.000') && t.includes('0.150') && t.includes('passes the Cho–Kreps test'), t)
await setSlider(PANEL, 1, 'e, the education level', 1.5)
await sleep(100)
ok('Panel B separating at 1.5: equilibrium, fails the test on 1.000–1.500', (await role('signal-ck')).includes('between 1.000 and 1.500'), await role('signal-ck'))
await setSlider(PANEL, 1, 'e, the education level', 0.5)
await sleep(100)
ok('Panel B separating at 0.5: the low type copies', (await role('signal-verdict')).includes('the low type would rather take 0.50'), await role('signal-verdict'))
await setSlider(PANEL, 1, 'e, the education level', 2.5)
await sleep(100)
ok('Panel B separating at 2.5: the high type drops to 0', (await role('signal-verdict')).includes('the high type would rather take 0.00'), await role('signal-verdict'))
await click(PANEL, 1, 'Pooling at e')
await setSlider(PANEL, 1, 'e, the education level', 0)
await sleep(100)
t = await role('signal-candidate')
ok('Panel B pooling at 0: both 1.300, fails the test on 0.700–1.400 (exercise 3)', t.includes('high type 1.300, low type 1.300') && t.includes('between 0.700 and 1.400'), t)
await setSlider(PANEL, 1, 'e, the education level', 0.3)
await sleep(100)
t = await role('signal-candidate')
ok('Panel B pooling at 0.3: high 1.150, low 1.000, wasted 0.255 (observe 3)', t.includes('high type 1.150, low type 1.000') && t.includes('0.255'), t)
await setSlider(PANEL, 1, 'λ, share of high types', 0.8)
await sleep(100)
ok('Panel B λ = 0.8: crossing at 0.500; pooling up to 0.800', (await role('signal-cross')).includes('= 0.500') && (await role('signal-pool')).includes('= 0.800'))
await setSlider(PANEL, 1, 'c_H, cost per unit for a high type', 1)
await sleep(100)
ok('Panel B c_H = c_L = 1: separation only at 1.000, both indifferent; no lines to compare', (await role('signal-sep')).includes('Separation only at e* = 1/c_L = 1/c_H = 1.000') && (await role('signal-cross')).includes('no strict separation'), await role('signal-sep'))
await setSlider(PANEL, 1, 'c_H, cost per unit for a high type', 1.5)
await sleep(100)
ok('Panel B c_H > c_L: no separation', (await role('signal-sep')).includes('No separation'), await role('signal-sep'))

// ---- Panel C: words that cost nothing
ok('Panel C defaults b = 0.1: two intervals, boundary 0.3000, loss 0.03083, delegation 0.01000 better', (await role('talk-bounds')).includes('0.3000') && (await role('talk-dm')).includes('0.03083') && (await role('talk-deleg')).includes('0.01000, less than') && (await p.$$eval('[data-role="talk-n"] button', (b) => b.length)) === 2)
t0 = Date.now()
await click(PANEL, 2, 'Simulate 10,000 cases')
const tSim = await waitFor(() => has('talk-sim'), 10000)
ok('Panel C "Simulate": 0.03080 and 0.04085 (observe 1)', (await role('talk-sim')).includes('decision maker 0.03080, expert 0.04085'), await role('talk-sim'))
info(`timing: Panel C "Simulate" ${tSim} ms (click to text ${Date.now() - t0} ms)`)
await click(PANEL, 2, '1')
await sleep(100)
ok('Panel C N = 1: loss 0.08333, no boundary', (await role('talk-dm')).includes('0.08333') && (await role('talk-bounds')).includes('No boundary'))
await setSlider(PANEL, 2, 'b, the expert’s bias', 0.05)
await sleep(100)
ok('Panel C b = 0.05: three intervals (back to the largest), boundaries 0.1333 and 0.4667, loss 0.01593', (await p.$$eval('[data-role="talk-n"] button', (b) => b.length)) === 3 && (await role('talk-bounds')).includes('0.1333, 0.4667') && (await role('talk-dm')).includes('0.01593'), await role('talk-bounds'))
await click(PANEL, 2, '2')
await sleep(100)
ok('Panel C b = 0.05, N = 2: loss 0.02333', (await role('talk-dm')).includes('0.02333'))
await setSlider(PANEL, 2, 'b, the expert’s bias', 0.02)
await sleep(100)
ok('Panel C b = 0.02: five intervals, 0.0400 … 0.6400', (await p.$$eval('[data-role="talk-n"] button', (b) => b.length)) === 5 && (await role('talk-bounds')).includes('0.0400, 0.1600, 0.3600, 0.6400'), await role('talk-bounds'))
await setSlider(PANEL, 2, 'b, the expert’s bias', 0.3)
await sleep(100)
ok('Panel C b = 0.3: one interval; delegation 0.09000 is worse', (await p.$$eval('[data-role="talk-n"] button', (b) => b.length)) === 1 && (await role('talk-deleg')).includes('0.09000, more than'), await role('talk-deleg'))
t0 = Date.now()
await click(PANEL, 2, 'Survey')
const tTalk = await waitFor(() => has('talk-survey'), 10000)
ok('Panel C "Survey": the drops 10 → 7 (b = 0.010) … 2 → 1 (b = 0.250)', (await role('talk-survey-n')).includes('10 → 7 (b = 0.010)') && (await role('talk-survey-n')).includes('2 → 1 (b = 0.250)'), await role('talk-survey-n'))
info(`timing: Panel C "Survey" ${tTalk} ms (click to chart ${Date.now() - t0} ms)`)

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
