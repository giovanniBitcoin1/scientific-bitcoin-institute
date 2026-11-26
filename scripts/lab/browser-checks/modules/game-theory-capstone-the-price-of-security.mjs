// Functional checks of Game Theory Lab module 14 "Capstone: the price of
// security": the two live figures and the three panels are driven like a
// reader would, and the numbers they show are compared with the ones in the
// lecture, the observe lists and the exercises (all pinned by
// check-game-theory-14.mjs). It also times the panels and checks the Italian
// readouts at 375 px.
//
//   node modules/game-theory-capstone-the-price-of-security.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('game-theory')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const SLUG = 'capstone-the-price-of-security'
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/${SLUG}`, 1500)

const PANEL = 'main section .space-y-14 > div'
const squash = (e) => e.innerText.replace(/\s+/g, ' ').trim()
const val = (scope, k, page = p) => page.$eval(`[data-role="${scope}"] [data-value="${k}"]`, squash)
const verdict = (scope, k, page = p) => page.$eval(`[data-role="${scope}"] [data-verdict="${k}"]`, squash)
const text = (sel, page = p) => page.$eval(sel, squash)
const clickSel = (sel, page = p) =>
  page.evaluate((s) => {
    const e = document.querySelector(s)
    if (!e) throw new Error('no element ' + s)
    e.click()
  }, sel)
const setSlider = (root, k, label, value, page = p) =>
  page.evaluate(
    (s, i, l, v) => {
      const r = document.querySelectorAll(s)[i]
      const lab = [...r.querySelectorAll('label')].find((x) => x.innerText.trim() === l)
      if (!lab) throw new Error('no slider ' + l)
      const input = document.getElementById(lab.htmlFor)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    root,
    k,
    label,
    value,
  )
const setField = (role, k, value, page = p) =>
  page.evaluate(
    (r, key, v) => {
      const input = document.querySelector(`[data-role="${r}"] [data-field="${key}"], [data-role="${r}"] [data-meta="${key}"]`)
      if (!input) throw new Error('no field ' + key)
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, String(v))
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    role,
    k,
    value,
  )
const timed = (fn, page = p) =>
  page.evaluate(async (src) => {
    const t0 = performance.now()
    // eslint-disable-next-line no-new-func
    new Function(src)()
    await new Promise((r) => setTimeout(r, 0))
    const t1 = performance.now()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    return `${Math.round(t1 - t0)} ms (second frame ${Math.round(performance.now() - t0)} ms)`
  }, fn)
const clickSrc = (sel) => `document.querySelector(${JSON.stringify(sel)}).click()`
const sliderSrc = (root, k, label, v) => `
  const r = document.querySelectorAll(${JSON.stringify(root)})[${k}]
  const lab = [...r.querySelectorAll('label')].find((x) => x.innerText.trim() === ${JSON.stringify(label)})
  const input = document.getElementById(lab.htmlFor)
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(String(v))})
  input.dispatchEvent(new Event('input', { bubbles: true }))`

// ---- Figure F1
const flow = async () => [await val('flow-readout', 't'), await val('flow-readout', 'At'), await val('flow-readout', 'share'), await val('flow-readout', 'star')].join(' | ')
ok('F1 default (k + e = 12, best A): t 13.99, A·t 20.00, share 58.8%, A* = 1.43 (exercise 1)', (await flow()) === '13.99 | 20.00 | 58.8% | A* = 1.43, A*·t(A*) = 20.00', await flow())
ok('F1 default ($1 billion, p_block $204,425): cost $4.09 million; needed $50.00 million (5.00%), $2.63 trillion a year, 244.6 × p_block; not deterred (exercises 2, 3)',
  (await val('flow-readout', 'cost')) === '$4.09 million' && (await val('flow-readout', 'need')) === '$50.00 million (5.00%)' && (await val('flow-readout', 'needYear')) === '$2.63 trillion' && (await val('flow-readout', 'needMult')) === '244.6' && (await val('flow-readout', 'verdict')).startsWith('Not deterred'),
  `${await val('flow-readout', 'need')} | ${await val('flow-readout', 'needYear')}`)
ok('F1 marks the current A on the curve', (await p.$$('[data-role="flow-dot"]')).length === 1)
await setSlider('figure', 0, 'A, the attacker’s multiple', 2)
await sleep(30)
ok('F1 A = 2: t(A) 12.20 (Table II), the "Best A" pill no longer active', (await val('flow-readout', 't')) === '12.20' && (await p.$eval('[data-role="flow-best"]', (e) => e.getAttribute('aria-pressed'))) === null, await val('flow-readout', 't'))
await clickSel('[data-role="flow-best"]')
await setSlider('figure', 0, 'k + e, blocks the merchant waits', 1000)
await sleep(30)
ok('F1 k + e = 1,008: A* = 1.07, A*·t(A*) = 1099.02', (await val('flow-readout', 'star')) === 'A* = 1.07, A*·t(A*) = 1099.02', await val('flow-readout', 'star'))
{
  const ms = await timed(sliderSrc('figure', 0, 'k + e, blocks the merchant waits', 999))
  info(`timing: F1, a change of k + e at 1,008: ${ms}`)
}

// ---- Figure F2
const row = async (y, page = p) => page.$eval(`[data-role="clock-table"] tr[data-year="${y}"]`, (e) => [...e.querySelectorAll('[data-value]')].map((x) => x.innerText.trim()).join(' '))
ok('F2 2028: subsidy 1.5625, fees needed 1.5825, 79.1 × today; 2032: 0.7813, 2.3638, 118.2 (exercise 5)', (await row(2028)).startsWith('1.5625 1.5825 79.1') && (await row(2032)).startsWith('0.7813 2.3638 118.2'), `${await row(2028)} | ${await row(2032)}`)
ok('F2 2036 and 2040: 2.7544 and 2.9497 BTC needed (137.7 and 147.5 ×)', (await row(2036)).includes('2.7544 137.7') && (await row(2040)).includes('2.9497 147.5'), `${await row(2036)} | ${await row(2040)}`)
ok('F2 with no fee growth the budget column is the subsidy plus 0.02', (await row(2028)).endsWith('1.5825'), await row(2028))
await setSlider('figure', 1, 'growth of fees, % a year', 10)
await sleep(30)
ok('F2 fees growing 10% a year: the budget of 2028 is above the subsidy plus 0.02', Number((await row(2028)).split(' ')[3]) > 1.5825, await row(2028))

// ---- Panel A
const at = (k) => val('at-out', k)
ok('Panel A dated defaults: p_block $189,882; A* 1.43 (58.8%); t 13.99; flow $3.80 million; hardware $26.62 billion; energy 45.85 GWh, $2.29 million (lecture, observe 1–3)',
  (await at('pBlock')) === '$189,882' && (await at('A')) === '1.43 (58.8%)' && (await at('t')) === '13.99' && (await at('flow')) === '$3.80 million' && (await at('hardware')) === '$26.62 billion' && (await at('energy')) === '45.85 GWh, $2.29 million',
  [await at('pBlock'), await at('flow'), await at('hardware'), await at('energy')].join(' | '))
ok('Panel A dated: every field shows its source', (await p.$$('[data-role="at-inputs"] [data-source]')).length === 11)
ok('Panel A verdicts: not deterred; she must own the hardware (0.87% against 143%); energy 60.4% of the flow cost; a week deters up to $208.68 million',
  (await verdict('at-out', 'flow')).endsWith('not deterred.') && (await verdict('at-out', 'rent')).includes('only 0.87% of the network is for rent, against the 143% she needs') && (await verdict('at-out', 'energy')).includes('60.4% of the flow cost') && (await verdict('at-out', 'wait')).includes('$208.68 million'),
  await verdict('at-out', 'rent'))
ok('Panel A zero-profit check (dated): $114,638 (60.4% of p_block); $75,245; $3.95 billion; 21.2% (observe 6)', (await at('honestEnergy')) === '$114,638 (60.4% of p_block)' && (await at('left')) === '$75,245; $3.95 billion' && (await at('capital')) === '21.2%', await at('left'))
await clickSel('[data-role="at-inputs"] [data-field="collapse"]')
await sleep(30)
ok('Panel A collapse, 50%: stock $13.31 billion; flow plus stock $13.32 billion: deterred (observe 4)', (await at('stock')) === '$13.31 billion' && (await verdict('at-out', 'stock')).includes('$13.32 billion: deterred'), await verdict('at-out', 'stock'))
await setField('at-inputs', 'loss', 1)
await sleep(30)
ok('Panel A collapse, 1%: $266.24 million, $270.04 million: not deterred', (await verdict('at-out', 'stock')).includes('$266.24 million') && (await verdict('at-out', 'stock')).includes('$270.04 million: not deterred'), await verdict('at-out', 'stock'))
await clickSel('[data-role="at-test"]')
await sleep(30)
ok('Panel A test values: p_block $204,425; flow $4.09 million; hardware $21.44 billion; energy 56.67 GWh, $2.83 million; 69.3%, 22.0% (exercises 2, 4; observe 6, 7)',
  (await at('pBlock')) === '$204,425' && (await at('flow')) === '$4.09 million' && (await at('hardware')) === '$21.44 billion' && (await at('energy')) === '56.67 GWh, $2.83 million' && (await at('honestEnergy')).includes('(69.3% of p_block)') && (await at('capital')) === '22.0%',
  [await at('pBlock'), await at('flow'), await at('hardware'), await at('energy')].join(' | '))
ok('Panel A test values: the sources are hidden (these are not dated figures)', (await p.$$('[data-role="at-inputs"] [data-source]')).length === 0)
await setField('at-inputs', 'n', 1008)
await sleep(30)
ok('Panel A test values, k + e = 1,008: deters up to $224.67 million (exercise 2)', (await at('flow')) === '$224.67 million', await at('flow'))
{
  const ms = await timed(`
    const input = document.querySelector('[data-role="at-inputs"] [data-field="n"]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '1000')
    input.dispatchEvent(new Event('input', { bubbles: true }))`)
  info(`timing: Panel A, k + e from 1,008 to 1,000 (the largest the field takes is 1,008): ${ms}`)
}
await clickSel('[data-role="at-dated"]')
await setField('at-inputs', 'n', 1008)
await sleep(30)
ok('Panel A dated, k + e = 1,008: A* 1.07, flow $208.68 million (observe 5)', (await at('A')).startsWith('1.07') && (await at('flow')) === '$208.68 million', await at('flow'))

// ---- Panel B
const fb = async (k, page = p) => page.$eval(`[data-role="fb-table"] tr[data-row="${k}"]`, (e) => [...e.querySelectorAll('[data-value]')].map((x) => x.innerText.trim()).join(' / '))
ok('Panel B default (today, 100,000 blocks): CV 0.00636, no block above twice the average (observe 1)', (await fb('cv')).startsWith('0.00636 / ') && (await fb('over2')) === '1.9 × 10^-69 / 0 ± 0', `${await fb('cv')} | ${await fb('over2')}`)
ok('Panel B draws 100 bars', (await p.$$('[data-role="fb-bars"] [data-bar]')).length === 100)
await clickSel('[data-preset="feesOnly"]')
await sleep(30)
ok('Panel B fees only: CV 1; 13.53% / 13.42% ± 0.11%; 4.98% / 4.91% ± 0.07% (observe 2, exercise 6)', (await fb('cv')).startsWith('1.00000') && (await fb('over2')) === '13.53% / 13.42% ± 0.11%' && (await fb('over3')) === '4.98% / 4.91% ± 0.07%', `${await fb('over2')} | ${await fb('over3')}`)
await clickSel('[data-role="fb-counts"] [data-count="1000"]')
await sleep(30)
ok('Panel B 1,000 blocks: 13.30% ± 1.07%, 5.70% ± 0.73% (observe 4)', (await fb('over2')).endsWith('13.30% ± 1.07%') && (await fb('over3')).endsWith('5.70% ± 0.73%'), `${await fb('over2')} | ${await fb('over3')}`)
await clickSel('[data-role="fb-counts"] [data-count="100000"]')
await clickSel('[data-preset="y2028"]')
await sleep(30)
ok('Panel B 2028 (S 1.5625, f 0.5): CV 0.24242; 0.59% / 0.58% ± 0.02% (observe 5, exercise 6)', (await fb('cv')).startsWith('0.24242') && (await fb('over2')) === '0.59% / 0.58% ± 0.02%', `${await fb('cv')} | ${await fb('over2')}`)
{
  const ms = await timed(clickSrc('[data-role="fb-again"]'))
  info(`timing: Panel B, "Run again" at 100,000 blocks: ${ms}`)
  const ms2 = await timed(sliderSrc(PANEL, 1, 'S, subsidy per block (BTC)', 0.5))
  info(`timing: Panel B, a change of S at 100,000 blocks: ${ms2}`)
}

// ---- Panel C
const summary = () => p.$eval('[data-role="es-summary"]', (e) => e.value)
ok('Panel C opens on the dated defaults: the sentence says $1.00 billion is not deterred (observe 2)', (await text('[data-role="es-sentence"]')) === 'Under these assumptions, an attack worth $1.00 billion is not deterred by the flow of payments to miners, with k + e = 12.', await text('[data-role="es-sentence"]'))
ok('Panel C summary lists the eleven inputs, their sources, the results and the verdicts', (await summary()).includes('- price, $ per BTC: 60,374 (CoinGecko, daily close of 25 November 2026; no date)') && (await summary()).includes('- p_block = price × (subsidy + fees): $189,882') && (await summary()).includes('Flow (Budish): the flow deters attacks up to $3.80 million') && (await summary()).split('\n').filter((l) => l.startsWith('- ')).length >= 11 + 1 + 9 + 6, (await summary()).split('\n').slice(0, 5).join(' / '))
await setField('es-inputs', 'price-date', '25 November 2026')
await setField('es-inputs', 'V', 3)
await sleep(30)
ok('Panel C: a date typed and V = $3 million: the summary carries both, and the sentence turns to "is deterred" (observe 3)', (await summary()).includes('CoinGecko, daily close of 25 November 2026; 25 November 2026)') && (await text('[data-role="es-sentence"]')).includes('an attack worth $3.00 million is deterred'), await text('[data-role="es-sentence"]'))
ok('Panel C stores nothing (no localStorage key of its own)', await p.evaluate(() => Object.keys(localStorage).every((k) => k.startsWith('sbi_'))), await p.evaluate(() => Object.keys(localStorage).join(',')))
{
  const ms = await timed(`
    const input = document.querySelector('[data-role="es-inputs"] [data-field="price"]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '70000')
    input.dispatchEvent(new Event('input', { bubbles: true }))`)
  info(`timing: Panel C, a change of price: ${ms}`)
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
info(`figure heights at 1280 px (EN): ${(await p.$$eval('figure', (fs) => fs.map((x) => Math.round(x.getBoundingClientRect().height)))).join(', ')}`)

// ---- Italian at 375 px
const q = await newPage(ctx, { width: 375, lang: 'it', admin: true })
await go(q, `${site.url}${lab.basePath}/${SLUG}`, 1500)
ok('Italian at 375 px: F1 t 13,99 and 2,63 mila miliardi di $; F2 1,5825; Panel A 189.882 $ and 26,62 miliardi di $; Panel B 0,00636',
  (await val('flow-readout', 't', q)) === '13,99' && (await val('flow-readout', 'needYear', q)) === '2,63 mila miliardi di $' && (await row(2028, q)).startsWith('1,5625 1,5825') && (await val('at-out', 'pBlock', q)) === '189.882 $' && (await val('at-out', 'hardware', q)) === '26,62 miliardi di $' && (await fb('cv', q)).startsWith('0,00636'),
  `${await val('flow-readout', 'needYear', q)} | ${await val('at-out', 'pBlock', q)}`)
ok('Italian at 375 px: the sentence of Panel C', (await text('[data-role="es-sentence"]', q)) === 'Con queste ipotesi, un attacco che vale 1,00 miliardi di $ non è scoraggiato dal flusso dei pagamenti ai miner, con k + e = 12.', await text('[data-role="es-sentence"]', q))
ok('Italian at 375 px: the sources are Italian', (await q.$eval('[data-role="at-inputs"] [data-source="price"]', squash)) === 'CoinGecko, chiusura giornaliera del 25 novembre 2026')
const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
ok('Italian at 375 px: no horizontal scroll', overflow <= 0, `${overflow}`)
for (const role of ['clock-table', 'fb-table', 'at-out', 'es-summary', 'es-inputs']) {
  const fits = await q.$eval(`[data-role="${role}"]`, (t) => Math.round(t.getBoundingClientRect().right - document.documentElement.clientWidth))
  ok(`Italian at 375 px: ${role} fits the screen`, fits <= 0, `${fits}`)
}
info(`figure heights at 375 px (IT): ${(await q.$$eval('figure', (fs) => fs.map((x) => Math.round(x.getBoundingClientRect().height)))).join(', ')}`)
const q2 = await newPage(ctx, { width: 1280, lang: 'it', admin: true })
await go(q2, `${site.url}${lab.basePath}/${SLUG}`, 1500)
info(`figure heights at 1280 px (IT): ${(await q2.$$eval('figure', (fs) => fs.map((x) => Math.round(x.getBoundingClientRect().height)))).join(', ')}`)
ok('no console errors (Italian)', q.errors.length === 0 && q2.errors.length === 0, [...q.errors, ...q2.errors].join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
