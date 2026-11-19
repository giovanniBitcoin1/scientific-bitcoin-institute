// Element screenshots of one module, for looking at the result: every live
// figure and every panel, in the admin preview, at 1280 px (EN) and 375 px (IT).
//
//   node shots.mjs <labId> <slug> [--dist <dir> | --base <url>] [--chrome <path>]
//
// Saved as screenshots/el-<slug>-fig<N>-<width>.png and …-panel<N>-<width>.png.
import { parseArgs, loadLab, siteFromArgs, launch, newPage, go, settle, shotPath } from './lib.mjs'

const { pos, opt } = parseArgs()
const [labId, slug] = pos
if (!labId || !slug) {
  console.error('Usage: node shots.mjs <labId> <slug> [--dist <dir> | --base <url>] [--chrome <path>]')
  process.exit(2)
}
const lab = await loadLab(labId)
const site = await siteFromArgs(opt)
const browser = await launch(opt)
for (const [width, lang] of [[1280, 'en'], [375, 'it']]) {
  const ctx = await browser.createBrowserContext()
  const p = await newPage(ctx, { width, lang, admin: true })
  await go(p, `${site.url}${lab.basePath}/${slug}`, 2000)
  await settle(p)
  // The fixed site header would cover part of a tall element.
  await p.addStyleTag({ content: 'header { display: none !important; }' })
  const figs = await p.$$('figure')
  for (let i = 0; i < figs.length; i++) await figs[i].screenshot({ path: shotPath(`el-${slug}-fig${i + 1}-${width}.png`) })
  const panels = await p.$$('main section .space-y-14 > div')
  for (let i = 0; i < panels.length; i++) await panels[i].screenshot({ path: shotPath(`el-${slug}-panel${i + 1}-${width}.png`) })
  console.log(`${width} px (${lang}): ${figs.length} figures, ${panels.length} panels`)
  await ctx.close()
}
await browser.close()
await site.close()
