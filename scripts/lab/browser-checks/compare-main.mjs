// Regression compare: the same pages on a build of main and on this branch's
// build must show the same thing. Locked and admin, EN and IT, 1280 and 375 px.
//
//   node build-main.mjs                       (once: builds main into .main-dist/)
//   node compare-main.mjs [path …] [--old-dist <dir>] [--dist <dir>] [--chrome <path>] [--quiet]
//
// Without paths it compares DEFAULT_URLS (write a path as lab/small-worlds).
// Compared: the visible text of <main> (not the site header, whose nav differs
// from main since the "Labs" entry), title, meta description, links inside <main>, number of canvases, page height (±2 px),
// and a fingerprint of what every canvas has drawn once the page has settled
// (sims are seeded, so two builds of the same code draw the same pixels).
// --no-pixels skips the fingerprint.
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  parseArgs, serveDist, launch, newPage, go, settle, jsRequests, labsLocked, reporter, WIDTHS, LANGS, HERE, REPO,
} from './lib.mjs'

// Complexity Lab pages that share code with the Network Lab (graphUtils.js,
// LabMarkdown, LabLecture, the lab pages themselves). The index /lab is not
// on the list: it differs from main on purpose (the "All labs" link) and is
// covered by check-index.mjs.
const DEFAULT_URLS = [
  '/lab/what-is-complexity',
  '/lab/random-networks',
  '/lab/small-worlds',
  '/lab/scale-free',
  '/lab/bitcoin-complex-system',
]

const { pos, opt } = parseArgs()
// Paths may be given without the leading slash (lab/small-worlds): Git Bash
// on Windows rewrites an argument that starts with "/" into a file path.
if (pos.some((u) => /^[A-Za-z]:[\/]/.test(u))) {
  console.error('A path was rewritten by the shell. Write it without the leading slash: lab/small-worlds')
  process.exit(2)
}
const urls = pos.length ? pos.map((u) => (u.startsWith('/') ? u : `/${u}`)) : DEFAULT_URLS
const oldSite = await serveDist(typeof opt['old-dist'] === 'string' ? path.resolve(opt['old-dist']) : path.join(HERE, '.main-dist'))
const newSite = await serveDist(typeof opt.dist === 'string' ? path.resolve(opt.dist) : path.join(REPO, 'dist'))
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const modes = labsLocked() ? [false, true] : [true]

async function snap(page, base, url) {
  await page.bringToFront()
  await go(page, base + url, 1500)
  await settle(page)
  const s = await page.evaluate(() => ({
    text: (document.querySelector('main') || document.body).innerText,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content,
    links: [...document.querySelectorAll('main a')].map((x) => x.getAttribute('href')).join(','),
    height: document.documentElement.scrollHeight,
    hscroll: document.documentElement.scrollWidth > window.innerWidth,
    canvases: [...document.querySelectorAll('canvas')].map((c) => {
      try {
        return `${c.width}x${c.height}:${c.toDataURL()}`
      } catch {
        return `${c.width}x${c.height}:unreadable`
      }
    }),
  }))
  s.pixels = s.canvases.map((c) => createHash('sha1').update(c).digest('hex').slice(0, 10))
  return s
}

for (const width of WIDTHS) {
  for (const lang of LANGS) {
    for (const admin of modes) {
      const tag = `[${width} ${lang} ${admin ? 'admin' : 'locked'}]`
      const ctx = await browser.createBrowserContext()
      const a = await newPage(ctx, { width, lang, admin })
      const b = await newPage(ctx, { width, lang, admin })
      // Warm-up: the first page loaded in a fresh browser draws its canvases
      // before the web fonts are cached, the second one after. Load one page
      // on each side first, so both sides are measured with the fonts cached.
      await go(a, oldSite.url + urls[0], 800)
      await go(b, newSite.url + urls[0], 800)
      for (const url of urls) {
        const x = await snap(a, oldSite.url, url)
        const y = await snap(b, newSite.url, url)
        const [p1, p2] = [norm(x.text), norm(y.text)]
        let where = ''
        if (p1 !== p2) {
          let i = 0
          while (i < p1.length && p1[i] === p2[i]) i++
          where = `first difference at ${i}: main "${p1.slice(Math.max(0, i - 40), i + 60)}" vs branch "${p2.slice(Math.max(0, i - 40), i + 60)}"`
        }
        ok(`${tag} ${url}: same text as main (${p1.length} chars)`, p1 === p2, where)
        ok(
          `${tag} ${url}: same title, description, links, canvas count, page height`,
          x.title === y.title && x.desc === y.desc && x.links === y.links && x.canvases.length === y.canvases.length && Math.abs(x.height - y.height) <= 2,
          JSON.stringify({ title: [x.title, y.title], canvases: [x.canvases.length, y.canvases.length], height: [x.height, y.height], links: x.links === y.links }),
        )
        if (!opt['no-pixels'] && x.canvases.length)
          ok(`${tag} ${url}: ${x.canvases.length} canvases draw the same pixels`, x.pixels.join() === y.pixels.join(), `main ${x.pixels.join(' ')} vs branch ${y.pixels.join(' ')}`)
        ok(`${tag} ${url}: no horizontal scroll`, !y.hscroll)
      }
      ok(`${tag} no console errors on the branch`, b.errors.length === 0, b.errors.join(' | '))
      if (width === 1280 && lang === 'en') info(`${tag} js requested on the branch: ${jsRequests(b).join(', ')}`)
      await ctx.close()
    }
  }
}

await browser.close()
await oldSite.close()
await newSite.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
