// Not a check: saves full-page screenshots of the given paths, to look at them.
//
//   node shots.mjs insights insights/dispatch [--width 375] [--dist <dir> | --base <url>]
//
// Write the paths without the leading slash (Git Bash on Windows rewrites
// "/insights" into a file path). "home" is the home page.
import { parseArgs, siteFromArgs, launch, newPage, shotPath, sleep } from './lib.mjs'

const { pos, opt } = parseArgs()
const width = Number(opt.width) || 1280
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const page = await newPage(await browser.createBrowserContext(), { width })
for (const p of pos.length ? pos : ['insights']) {
  const route = p === 'home' ? '' : p.replace(/^\/+/, '')
  await page.goto(`${site.url}/${route}`, { waitUntil: 'networkidle0' })
  await sleep(600)
  const file = shotPath(`${(route || 'home').replace(/[^a-z0-9]+/gi, '-')}-${width}.png`)
  await page.screenshot({ path: file, fullPage: !opt.viewport })
  console.log(file, page.errors.length ? `console errors: ${page.errors.join(' | ')}` : '')
}
await browser.close()
await site.close()
