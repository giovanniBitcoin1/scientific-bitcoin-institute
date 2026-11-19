// Functional checks of Network Lab module 01 "Reading a network": the three
// panels and two live figures are driven like a reader would, and the numbers
// they show are compared with the ones in the lecture and the exercises.
//
//   node modules/network-reading-a-network.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, reporter, sleep } from '../lib.mjs'

const { opt } = parseArgs()
const lab = await loadLab('network')
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
await go(p, `${site.url}${lab.basePath}/reading-a-network`, 1500)

const PANEL = 'main section .space-y-14 > div'
const panelText = (i) => p.evaluate((sel, k) => document.querySelectorAll(sel)[k].innerText, PANEL, i)
const click = (i, label) =>
  p.evaluate(
    (sel, k, l) => {
      const b = [...document.querySelectorAll(sel)[k].querySelectorAll('button')].find(
        (x) => x.innerText.trim().toLowerCase() === l.toLowerCase(),
      )
      if (!b) throw new Error('no button ' + l)
      b.click()
    },
    PANEL,
    i,
    label,
  )

// ---- Bridges
await click(0, 'Best possible')
await sleep(6 * 700 + 600)
let t = await panelText(0)
ok('bridges 1736: best possible 6 of 7, verdict impossible', t.includes('6 of 7') && t.includes('4 land masses have an odd number'), t.slice(-300))
ok('bridges 1736: Show a route disabled', await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /show a route/i.test(b.innerText)).disabled))
await click(0, 'Today')
await sleep(200)
await click(0, 'Show a route')
await sleep(5 * 700 + 600)
t = await panelText(0)
ok('bridges today: route crosses all five between the islands', /Every bridge crossed once, from (Kneiphof to Lomse|Lomse to Kneiphof)/.test(t) && t.includes('5 BRIDGES'), t.slice(-300))
await click(0, '1736')
await click(0, 'Edit')
await sleep(200)
const SLOT = `${PANEL}:nth-child(1) svg[viewBox="0 0 400 250"] g.cursor-pointer`
const slots = await p.$$(SLOT)
ok('bridges edit: 13 slots shown', slots.length === 13, String(slots.length))
await slots[9].evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(150)
t = await panelText(0)
ok('bridges 1736 + N-S: walk exists', t.includes('Two land masses have an odd number of bridges') && t.includes('8 BRIDGES'), t.slice(0, 400))
const slots2 = await p.$$(SLOT)
await slots2[12].evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(150)
t = await panelText(0)
ok('bridges 1736 + N-S + K-L: closed tour', t.includes('a closed tour exists') && t.includes('9 BRIDGES'), t.slice(0, 400))
await click(0, 'Show a route')
await sleep(9 * 700 + 600)
ok('bridges: closed tour animated back to start', (await panelText(0)).includes('a closed tour.'))
await click(0, 'Today')
await sleep(200)
ok('bridges: preset resets the walk', (await panelText(0)).includes('Tap a land mass'))

// ---- Microscope
const sel = async (v) => {
  await p.select(`${PANEL}:nth-child(2) select`, v)
  await sleep(400)
}
const stat = async () => (await panelText(1)).replace(/\s+/g, ' ')
await sel('windmill')
t = await stat()
ok('microscope windmill: 0.955 / 0.143 / 10 triangles', t.includes('Average clustering ⟨C⟩ 0.955') && t.includes('Transitivity 0.143') && t.includes('Triangles 10'), t.slice(0, 600))
await sel('ring')
t = await stat()
ok('microscope ring: clustering 0.500, diameter 5', t.includes('⟨C⟩ 0.500') && t.includes('Diameter 5'))
await sel('random')
t = await stat()
ok('microscope random: <k> 3.00, clustering 0.066', t.includes('⟨k⟩ 3.00') && t.includes('⟨C⟩ 0.066'), t.slice(0, 600))
await sel('path')
t = await stat()
ok('microscope path: diameter 9, distance 3.667', t.includes('Diameter 9') && t.includes('Average distance 3.667'))
await sel('complete')
t = await stat()
ok('microscope complete: L 28, density 1.000', t.includes('Links L 28') && t.includes('Density 1.000'))
await sel('groups')
t = await stat()
ok('microscope groups: 2 components', t.includes('Components 2 · largest 7'), t.slice(0, 500))
await click(1, 'Group by component')
await sleep(200)
await sel('florentine')
t = await stat()
ok('microscope florentine: N 15, L 20', t.includes('Nodes N 15') && t.includes('Links L 20'))
await sel('karate')
const canvas = await p.$(`${PANEL}:nth-child(2) canvas`)
await canvas.evaluate((c) => c.scrollIntoView({ block: 'center', behavior: 'instant' }))
await sleep(400)
const box = await canvas.boundingBox()
const found = {}
for (let gx = 0.03; gx < 1 && Object.keys(found).length < 34; gx += 0.02)
  for (let gy = 0.04; gy < 1; gy += 0.03) {
    await p.mouse.click(box.x + gx * box.width, box.y + gy * box.height)
    const m = (await panelText(1)).match(/Node (\d+): degree (\d+), clustering ([\d.]+), farthest node (\d+)/)
    if (m && !found[m[1]]) found[m[1]] = { k: +m[2], far: +m[4], x: box.x + gx * box.width, y: box.y + gy * box.height }
  }
ok('microscope karate: BFS readout, node 34 degree 17, node 1 degree 16', found['34']?.k === 17 && found['1']?.k === 16, JSON.stringify(found['34']) + JSON.stringify(found['1']))
info(`nodes found by tapping: ${Object.keys(found).length}; node 1 farthest ${found['1']?.far}, node 34 farthest ${found['34']?.far}`)
await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /✎/.test(b.innerText)).click())
await sleep(150)
await click(1, 'Delete')
await sleep(150)
await p.mouse.click(found['34'].x, found['34'].y)
await sleep(200)
await p.mouse.click(found['1'].x, found['1'].y)
await sleep(300)
t = await stat()
ok('microscope karate minus 34 and 1: N 32, 3 components, largest 26', t.includes('Nodes N 32') && t.includes('Components 3 · largest 26'), t.slice(0, 700))
await click(1, 'Clear all')
await click(1, 'Add')
await sleep(150)
await p.mouse.click(box.x + 100, box.y + 100)
await p.mouse.click(box.x + 300, box.y + 200)
await sleep(200)
await p.mouse.move(box.x + 100, box.y + 100)
await p.mouse.down()
await p.mouse.move(box.x + 200, box.y + 150, { steps: 5 })
await p.mouse.move(box.x + 300, box.y + 200, { steps: 5 })
await p.mouse.up()
await sleep(300)
t = await stat()
ok('microscope draw: two nodes added and linked by dragging', t.includes('Nodes N 2') && t.includes('Links L 1'), t.slice(0, 500))

// ---- Projection
t = (await panelText(2)).replace(/\s+/g, ' ')
ok('projection Exercise 6: 10 / 8 / 4 / 1', t.includes('Links, bipartite 10') && t.includes('Links among authors 8') && t.includes('Links among papers 4') && t.includes('Largest weight 1'), t.slice(0, 600))
await click(2, 'One big paper')
await sleep(200)
t = (await panelText(2)).replace(/\s+/g, ' ')
ok('projection one big paper: 8 / 28 / 0', t.includes('Links, bipartite 8') && t.includes('Links among authors 28') && t.includes('Links among papers 0'))
await p.select(`${PANEL}:nth-child(3) select`, 'transactions')
await sleep(200)
t = (await panelText(2)).replace(/\s+/g, ' ')
ok('projection theme transactions: labels only', t.includes('Links among addresses 28') && t.includes('ONE BIG TRANSACTION'), t.slice(0, 300))
const cells = await p.$$(`${PANEL}:nth-child(3) button[aria-pressed]`)
await cells[8].click()
await cells[9].click()
await sleep(200)
t = (await panelText(2)).replace(/\s+/g, ' ')
ok('projection: second top node sharing a and b gives weight 2', t.includes('Largest weight 2') && t.includes('Links among transactions 1'), t.slice(-300))

// ---- Figures
const linkCount = () => p.evaluate(() => document.querySelector('figure').innerText.match(/L = (\d+)/)[1])
const before = await linkCount()
await p.evaluate(() => [...document.querySelectorAll('figure button[aria-label]')].find((b) => b.getAttribute('aria-label').startsWith('1, 6')).click())
await sleep(150)
const after = await linkCount()
const sym = await p.evaluate(() => [...document.querySelectorAll('figure button[aria-label]')].find((b) => b.getAttribute('aria-label').startsWith('6, 1')).innerText)
ok('figure 1: tapping cell (1,6) adds the link in matrix (both halves), list and drawing', before === '7' && after === '8' && sym === '1' && (await p.evaluate(() => document.querySelectorAll('figure svg line[stroke-width="3.5"]').length)) === 1, `${before} ${after} ${sym}`)
ok('figure 2: readouts', (await p.evaluate(() => document.querySelectorAll('figure')[1].innerText.replace(/\s+/g, ' '))).includes('Density = 0.012'))
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
