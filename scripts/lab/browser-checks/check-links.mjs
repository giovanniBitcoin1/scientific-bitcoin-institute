// Where the labs are linked from.
//
//   node check-links.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
//
// The Network Lab is unlinked: no page, and no nav entry, points to it.
import { loadLab, parseArgs, siteFromArgs, launch, newPage, go, count, reporter } from './lib.mjs'

const { opt } = parseArgs()
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const network = await loadLab('network')

const PAGES = ['/', '/lab', '/lab/small-worlds', '/education', '/education/network-science', '/support/membership']

const ctx = await browser.createBrowserContext()
const p = await newPage(ctx, { width: 1280, lang: 'en', admin: true })
for (const url of PAGES) {
  await go(p, site.url + url, 600)
  ok(`unlinked: ${url} has no link to ${network.basePath}`, (await count(p, `a[href*="${network.basePath.slice(1)}"]`)) === 0)
}
ok('no console errors', p.errors.length === 0, p.errors.join(' | '))
await ctx.close()

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
