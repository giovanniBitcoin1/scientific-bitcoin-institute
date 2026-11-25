// Functional checks of Game Theory Lab module 06 "Repeated games and
// reputation": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises. It also times Panel A's chart
// (a change of n), Panel B's "New sample" and "Best rule", and Panel C's
// "10,000 chains". Panel B's small chart is computed once when the module's
// chunk loads; the self-check times it in Node.
//
//   node modules/game-theory-repeated-games-reputation.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/repeated-games-reputation`, 1500)

const PANEL = 'main section .space-y-14 > div'
const flat = (s) => s.replace(/\s+/g, ' ').trim()
const role = async (name) => flat(await p.$eval(`[data-role="${name}"]`, (e) => e.innerText))
const has = async (name) => !!(await p.$(`[data-role="${name}"]`))
const val = (scope, k) => p.$eval(`[data-role="${scope}"] [data-value="${k}"]`, (e) => e.innerText.trim())
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
let t

// ---- Figure F1: how much patience?
ok('F1 defaults T = 5, δ = 0.6: averages 3.000 and 2.600, δ* = 0.500, cooperation holds; 24 bars',
  (await val('patience-readout', 'coop')) === '3.000' && (await val('patience-readout', 'defect')) === '2.600' && (await val('patience-readout', 'star')) === '0.500' && (await val('patience-readout', 'winner')) === 'cooperation holds'
  && (await p.$$eval('[data-role="patience-bars"] [data-bar]', (b) => b.length)) === 24)
await setSlider('figure', 0, 'δ, patience', 0.5)
await sleep(100)
ok('F1 δ = 0.5: a tie at 3.000', (await val('patience-readout', 'defect')) === '3.000' && (await val('patience-readout', 'winner')) === 'a tie')
await setSlider('figure', 0, 'T, the temptation', 7)
await sleep(100)
ok('F1 T = 7, δ = 0.5: δ* = 0.667, defecting pays (exercise 1)', (await val('patience-readout', 'star')) === '0.667' && (await val('patience-readout', 'winner')) === 'defecting pays')
await setSlider('figure', 0, 'T, the temptation', 10)
await sleep(100)
ok('F1 T = 10: δ* = 0.778 (7/9)', (await val('patience-readout', 'star')) === '0.778')
await setSlider('figure', 0, 'T, the temptation', 4)
await sleep(100)
ok('F1 T = 4: δ* = 0.333', (await val('patience-readout', 'star')) === '0.333')

// ---- Figure F2: almost anything
const fv = (k) => val('folk-readout', k)
ok('F2 defaults δ = 0.75, point (2.50, 2.50): CD and DC half each, needs 0.4000, sustainable; three regions and the accent',
  (await fv('v')) === '(2.50, 2.50)' && (await fv('lottery')) === 'CD 0.50, DC 0.50' && (await fv('need')) === '0.4000' && (await fv('here')) === 'sustainable'
  && (await p.$$eval('[data-region="sustainable"]', (x) => x.length)) >= 1 && !!(await p.$('[data-region="feasible"]')) && !!(await p.$('[data-region="rational"]')))
await p.$eval('[data-role="folk-plane"]', (s) => s.focus())
for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight')
for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowUp')
await sleep(100)
ok('F2 arrow keys move by 0.05: (2.80, 2.80) is CC 0.60, CD 0.20, DC 0.20 and needs 0.5263', (await fv('v')) === '(2.80, 2.80)' && (await fv('lottery')) === 'CC 0.60, CD 0.20, DC 0.20' && (await fv('need')) === '0.5263', `${await fv('v')} ${await fv('lottery')}`)
// A mouse click on the plane moves the point there (to the nearest 0.01).
const at = async (v1, v2) => {
  const r = await p.$eval('[data-role="folk-plane"]', (s) => {
    const b = s.getBoundingClientRect()
    return { x: b.left, y: b.top, w: b.width, h: b.height }
  })
  const S = 260
  const sx = 22 + ((v1 + 0.5) / 6) * (S - 28)
  const sy = S - 22 - ((v2 + 0.5) / 6) * (S - 28)
  await p.mouse.click(r.x + (sx / S) * r.w, r.y + (sy / S) * r.h)
  await sleep(100)
}
await at(1.2, 4)
const clicked = await fv('v')
ok('F2 a mouse click moves the point (near (1.2, 4): needs about 0.91, not sustainable at 0.75)', /\(1\.(1|2)\d, (3\.9|4\.0)\d\)/.test(clicked) && (await fv('here')) === 'not sustainable', `${clicked} ${await fv('need')}`)
await at(1.5, 4.5)
ok('F2 (1.5, 4.5) is not feasible', (await fv('need')) === 'not feasible', await fv('v'))
await at(0.5, 3)
ok('F2 (0.5, 3) is never sustainable (below the minmax)', (await fv('need')).startsWith('never'), await fv('v'))
await setSlider('figure', 1, 'δ, patience', 0.4)
await sleep(100)
ok('F2 δ = 0.4: no sustainable polygon left but the DD dot', (await p.$$eval('[data-region="sustainable"]', (x) => x.length)) === 0)

// ---- Panel A: can the cartel hold?
const av = (k) => val('cartel-readout', k)
ok('Panel A defaults n = 2, δ = 0.5: 9.0000, 10.1250, 11.3906, δ* 0.5294; held 2.2941, 10.1211, share 0.997 (observe 1)',
  (await av('punish')) === '9.0000' && (await av('cartel')) === '10.1250' && (await av('cheat')) === '11.3906' && (await av('threshold')) === '0.5294' && (await av('held')) === '2.2941' && (await av('heldProfit')) === '10.1211' && (await av('share')) === '0.997')
await setSlider(PANEL, 0, 'δ, patience', 0.3)
await sleep(100)
ok('Panel A δ = 0.3: 2.5862, 9.8989, share 0.799 (observe 2, exercise 2)', (await av('held')) === '2.5862' && (await av('heldProfit')) === '9.8989' && (await av('share')) === '0.799')
await setSlider(PANEL, 0, 'δ, patience', 0.53)
await sleep(100)
ok('Panel A δ = 0.53: the whole cartel, 2.2500 and 10.1250', (await av('held')) === '2.2500' && (await av('heldProfit')) === '10.1250')
await click(PANEL, 0, 'Prices (Bertrand)')
await setSlider(PANEL, 0, 'δ, patience', 0.49)
await sleep(100)
ok('Panel A prices, δ = 0.49: nothing (price 1.00, profit 0)', (await av('held')) === '1.00' && (await av('heldProfit')) === '0.0000' && (await av('threshold')) === '0.5000')
await setSlider(PANEL, 0, 'δ, patience', 0.5)
await sleep(100)
ok('Panel A prices, δ = 0.5: the cartel price 5.50, profit 10.1250', (await av('held')) === '5.50' && (await av('heldProfit')) === '10.1250')
await click(PANEL, 0, 'Quantities (Cournot)')
let t0 = Date.now()
await setSlider(PANEL, 0, 'n, the number of firms', 10)
const tA = await waitFor(async () => (await av('threshold')) === '0.7516', 5000)
ok('Panel A n = 10, δ = 0.5: δ* 0.7516, held 0.6352, 1.6819, share 0.747 (observe 4)', (await av('held')) === '0.6352' && (await av('heldProfit')) === '1.6819' && (await av('share')) === '0.747')
info(`timing: Panel A chart and readouts after a change of n ${tA} ms (call to readout ${Date.now() - t0} ms)`)
ok('Panel A table: nine rows, n = 10 highlighted with 0.752 and 0.900', (await p.$$eval('[data-role="cartel-table"] tbody tr', (r) => r.length)) === 9 && flat(await p.$eval('[data-role="cartel-table"] tr[data-n="10"]', (e) => e.innerText)) === '10 0.752 0.900')
await setSlider(PANEL, 0, 'n, the number of firms', 3)
await sleep(100)
ok('Panel A n = 3: δ* 0.5714 (exercise 2)', (await av('threshold')) === '0.5714')

// ---- Panel B: price wars without cheating
const bv = (k) => val('wars-readout', k)
ok('Panel B defaults: p0 0.0228, p1 0.5987, margin 0.9377 (does not pay), value 10.0380, peace 0.8979, long run 10.0101 (observe 1)',
  (await bv('p0')) === '0.0228' && (await bv('p1')) === '0.5987' && (await bv('margin')) === '0.9377' && (await bv('verdict')) === 'cheating does not pay' && (await bv('value')) === '10.0380' && (await bv('peace')) === '0.8979' && (await bv('longRun')) === '10.0101')
ok('Panel B sample no. 1: 3 wars, quiet share 0.925, the war rounds shaded', (await role('wars-sample')) === 'In this sample: 3 wars, quiet share 0.925.' && (await p.$$eval('[data-war]', (x) => x.length)) === 15, await role('wars-sample'))
t0 = Date.now()
await click(PANEL, 1, 'New sample')
const tNew = await waitFor(async () => (await role('wars-seed')).includes('no. 2'), 5000)
ok('Panel B "New sample": no. 2 has 2 wars, quiet share 0.950 (observe 2)', (await role('wars-sample')) === 'In this sample: 2 wars, quiet share 0.950.', await role('wars-sample'))
info(`timing: Panel B "New sample" ${tNew} ms (click to readout ${Date.now() - t0} ms)`)
await click(PANEL, 1, 'New sample')
await click(PANEL, 1, 'New sample')
await sleep(100)
ok('Panel B sample no. 4: 8 wars, 0.800 (observe 2)', (await role('wars-sample')) === 'In this sample: 8 wars, quiet share 0.800.', await role('wars-sample'))
await setSlider(PANEL, 1, 'L, the length of a war', 2)
await sleep(100)
ok('Panel B L = 2: margin −0.1991, cheating pays (observe 3)', (await bv('margin')) === '-0.1991' && (await bv('verdict')) === 'cheating pays', await bv('margin'))
await setSlider(PANEL, 1, 'L, the length of a war', 3)
await sleep(100)
ok('Panel B L = 3: margin 0.2316', (await bv('margin')) === '0.2316')
t0 = Date.now()
await click(PANEL, 1, 'Best rule')
const tBest = await waitFor(() => has('wars-found'), 5000)
t = await role('wars-found')
ok('Panel B "Best rule": p̄ = 3.85, L = 19, value 10.1208, peace 0.9909 (observe 4); the sliders moved', t.includes('p̄ = 3.85, L = 19') && t.includes('10.1208') && t.includes('0.9909') && (await bv('margin')) === '0.0114' && (await bv('p1')) === '0.1469', t)
info(`timing: Panel B "Best rule" ${tBest} ms (click to text ${Date.now() - t0} ms)`)
await setSlider(PANEL, 1, 'σ, the noise in the price', 1)
await setSlider(PANEL, 1, 'p̄, the trigger price', 4.5)
await setSlider(PANEL, 1, 'L, the length of a war', 5)
await sleep(100)
ok('Panel B σ = 1 with the default rule: margin −0.2424 (observe 5)', (await bv('margin')) === '-0.2424', await bv('margin'))
await click(PANEL, 1, 'Best rule')
await sleep(100)
t = await role('wars-found')
ok('Panel B "Best rule" at σ = 1: p̄ = 3.45, L = 26, value 9.9616', t.includes('p̄ = 3.45, L = 26') && t.includes('9.9616'), t)
await setSlider(PANEL, 1, 'σ, the noise in the price', 0.5)
await setSlider(PANEL, 1, 'δ, patience', 0.6)
await sleep(100)
await click(PANEL, 1, 'Best rule')
await sleep(100)
ok('Panel B σ = 0.5, δ = 0.6: no rule works (observe 5)', (await role('wars-found')).startsWith('No rule'), await role('wars-found'))
ok('Panel B chart 2: 30 dots, the σ marker', (await p.$$eval('[data-role="wars-least"] svg circle', (c) => c.length)) === 30 && (await role('wars-least')).includes('σ'))

// ---- Panel C: a reputation for toughness
const cv = (k) => val('rep-readout', k)
const moves = () => p.$$eval('[data-role="rep-row"] [data-move]', (g) => g.map((x) => x.getAttribute('data-move')[0]).join(''))
ok('Panel C defaults: D 13, weak 66 (against 40), tough 76 with 4 entries, entries 6.1735, fights 0.8265 (observe 1, exercise 5)',
  (await cv('D')) === '13' && (await cv('weakPay')) === '66' && (await cv('toughPay')) === '76' && (await cv('toughEntries')) === '4 entries' && (await cv('entries')) === '6.1735' && (await cv('fights')) === '0.8265')
ok('Panel C history no. 1 (weak): 13 out, shares at market 14 and the last six enter', (await moves()) === 'ooooooooooooosssssss', await moves())
await click(PANEL, 2, 'Tough')
await sleep(100)
ok('Panel C tough: fights at 14, 16, 18, 20; out at 15, 17, 19 (observe 2)', (await moves()) === 'ooooooooooooofofofof', await moves())
await click(PANEL, 2, 'Weak')
t0 = Date.now()
await click(PANEL, 2, '10,000 chains')
const tChains = await waitFor(() => has('rep-sim'), 10000)
t = await role('rep-sim')
ok('Panel C "10,000 chains": 6.1697 entries, 0.8303 fights, payoff 66 in every chain (observe 3)', t.includes('6.1697 entries and 0.8303 fights') && t.includes('is 66 in every chain'), t)
info(`timing: Panel C "10,000 chains" ${tChains} ms (click to text ${Date.now() - t0} ms)`)
await click(PANEL, 2, 'New history')
await sleep(100)
ok('Panel C "New history": no. 2', (await role('rep-seed')).includes('no. 2'))
await setSlider(PANEL, 2, 'N, the markets', 5)
await sleep(100)
ok('Panel C N = 5: D 0, weak 10, entries 4.7204 (observe 5, exercise 6); the old simulation is hidden', (await cv('D')) === '0' && (await cv('weakPay')) === '10' && (await cv('entries')) === '4.7204' && !(await has('rep-sim')))
await setSlider(PANEL, 2, 'N, the markets', 30)
await sleep(100)
ok('Panel C N = 30: entries 6.1735 again', (await cv('entries')) === '6.1735')
await setSlider(PANEL, 2, 'N, the markets', 20)
await setSlider(PANEL, 2, 't, the chance that the incumbent is tough', 0)
await sleep(100)
ok('Panel C t = 0: D 0, weak 40, tough 60 with 20 entries (observe 4)', (await cv('D')) === '0' && (await cv('weakPay')) === '40' && (await cv('toughPay')) === '60' && (await cv('toughEntries')) === '20 entries')
await setSlider(PANEL, 2, 't, the chance that the incumbent is tough', 0.05)
await setSlider(PANEL, 2, 'w, a fought newcomer’s payoff', -2)
await sleep(100)
ok('Panel C w = −2: D 16, weak 72 (observe 6)', (await cv('D')) === '16' && (await cv('weakPay')) === '72')
await click(PANEL, 2, 'Drawn with probability t')
await sleep(100)
ok('Panel C "drawn": the page says which type was drawn', (await has('rep-drawn')) && (await role('rep-drawn')).startsWith('This time the incumbent is'))

ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
