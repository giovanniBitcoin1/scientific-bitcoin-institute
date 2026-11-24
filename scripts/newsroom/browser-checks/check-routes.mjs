// Opens every static route of the built site in headless Chrome, with and
// without the trailing slash, on a server that behaves like GitHub Pages.
//
//   node check-routes.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
//
// For each route: the server answers 200 (301 first without the slash), the
// static copy is in the HTML and is styled, the app replaces it and shows the
// expected <h1> exactly once, the canonical link is the route's own, and the
// console is clean. Also: the old newsletter addresses lead to the new ones,
// a route without a static file still opens through 404.html, and an unknown
// slug under each series shows its "not found" page.
import { buildRoutes } from '../lib/routes.mjs'
import { canonicalPath, canonicalUrl } from '../../../src/lib/site.js'
import { parseArgs, siteFromArgs, launch, newPage, reporter, sleep } from './lib.mjs'

const { opt } = parseArgs()
const { origin, routes, stubs, pieces } = buildRoutes()
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()

const h1s = (page) => page.$$eval('h1', (els) => els.map((e) => e.innerText.trim()))
const canonical = (page) => page.$$eval('link[rel="canonical"]', (els) => els.map((e) => e.getAttribute('href')))
const appStarted = (page) => page.evaluate(() => !document.querySelector('[data-static-fallback]') && !!document.querySelector('#root > *'))

async function open(page, url) {
  page.errors.length = 0
  const response = await page.goto(url, { waitUntil: 'networkidle0' })
  await sleep(300)
  return response
}

for (const width of [1280, 375]) {
  const ctx = await browser.createBrowserContext()
  const page = await newPage(ctx, { width })

  for (const route of routes) {
    const slash = canonicalPath(route.path)
    const bare = slash === '/' ? '/' : slash.slice(0, -1)
    for (const url of [...new Set([slash, bare])]) {
      const tag = `[${width}] ${url}`
      // The static copy as served, before any script runs.
      const raw = await (await fetch(site.url + url, { redirect: 'manual' })).text().catch(() => '')
      const first = site.log.filter(([, p]) => p === url).pop()
      if (url === bare && bare !== slash) ok(`${tag}: 301 to the address with the slash`, first && first[0] === 301)
      else ok(`${tag}: 200 with the static copy in the HTML`, first && first[0] === 200 && raw.includes('data-static-fallback'))

      const response = await open(page, site.url + url)
      ok(`${tag}: final answer 200`, response.status() === 200, `status ${response.status()}`)
      ok(`${tag}: the app has replaced the static copy`, await appStarted(page))
      const found = await h1s(page)
      const wanted = route.heading ? [route.heading] : route.headingOneOf
      ok(`${tag}: one <h1>, "${route.heading || 'a hero slide title'}"`, found.length === 1 && wanted.includes(found[0]), `found ${JSON.stringify(found)}`)
      const canon = await canonical(page)
      ok(`${tag}: one canonical link, ${canonicalUrl(origin, route.path)}`, canon.length === 1 && canon[0] === canonicalUrl(origin, route.path), `found ${JSON.stringify(canon)}`)
      ok(`${tag}: no horizontal scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      ok(`${tag}: no console error`, page.errors.length === 0, page.errors.join(' | '))
    }
  }

  // The static copy is styled like the page: same background, the heading in
  // the serif face, and no second copy left behind once the app runs.
  {
    const article = routes.find((r) => r.kind === 'article')
    const noJs = await newPage(ctx, { width })
    await noJs.setJavaScriptEnabled(false)
    await noJs.goto(site.url + canonicalPath(article.path), { waitUntil: 'networkidle0' })
    const style = await noJs.evaluate(() => {
      const h1 = document.querySelector('[data-static-fallback] h1')
      const shell = document.querySelector('[data-static-fallback]')
      return h1 && shell
        ? { font: getComputedStyle(h1).fontFamily, bg: getComputedStyle(shell).backgroundColor, top: Math.round(h1.getBoundingClientRect().top), text: h1.innerText }
        : null
    })
    ok(`[${width}] without JavaScript: the article is readable and styled`, style && /Crimson Pro/.test(style.font) && style.bg === 'rgb(248, 250, 252)' && style.text === article.heading, JSON.stringify(style))
    await open(page, site.url + canonicalPath(article.path))
    const top = await page.$eval('h1', (e) => Math.round(e.getBoundingClientRect().top))
    ok(`[${width}] the heading does not jump when the app takes over (static ${style?.top}px, app ${top}px)`, style && Math.abs(top - style.top) <= 80)
    await noJs.close()
  }

  // Old newsletter addresses: the static stub, then inside the app.
  for (const stub of stubs) {
    for (const url of [canonicalPath(stub.from), canonicalPath(stub.from).slice(0, -1)]) {
      // The stub sends the browser to the production address: check the stub
      // itself, then the router redirect that serves in-app navigation.
      const html = await (await fetch(site.url + canonicalPath(stub.from))).text()
      ok(`[${width}] ${url}: static stub points to ${canonicalUrl(origin, stub.to)}`, html.includes(`url=${canonicalUrl(origin, stub.to)}"`))
    }
    await open(page, `${site.url}/?/${stub.from.slice(1)}`)
    const at = await page.evaluate(() => location.pathname)
    ok(`[${width}] ${stub.from} inside the app leads to ${stub.to}`, at.replace(/\/$/, '') === stub.to, `at ${at}`)
  }

  // A route that has no static file still opens through 404.html.
  await open(page, `${site.url}/about/contact`)
  ok(`[${width}] /about/contact (no static file) still opens through 404.html`, (await h1s(page)).join() === 'Contact', (await h1s(page)).join())
  ok(`[${width}] /about/contact: the home page's copy is not shown and the canonical is its own`, (await appStarted(page)) && (await canonical(page)).join() === canonicalUrl(origin, '/about/contact'))

  // Static segments win over :slug; unknown slugs show a "not found" page.
  for (const [url, heading] of [
    ['/insights/dispatch/no-such-issue', 'Issue not found'],
    ['/insights/lens/no-such-piece', 'Piece not found'],
    ['/insights/no-such-article', 'Article not found'],
  ]) {
    await open(page, site.url + url)
    ok(`[${width}] ${url}: "${heading}"`, (await h1s(page)).join() === heading, (await h1s(page)).join())
  }

  // A series with nothing published is not shown anywhere.
  if (pieces.lens.length === 0) {
    await open(page, `${site.url}/insights/`)
    const hub = await page.evaluate(() => ({ lens: !!document.querySelector('#lens'), link: !!document.querySelector('a[href="/insights/lens"]') }))
    ok(`[${width}] hub with no Lens piece: no Lens section, no link to its archive`, !hub.lens && !hub.link)
    await open(page, `${site.url}/insights/lens/`)
    const lens = await page.evaluate(() => ({ sections: document.querySelectorAll('main > section').length, rows: document.querySelectorAll('main article').length, form: document.querySelectorAll('main form').length }))
    ok(`[${width}] /insights/lens with no piece: intro and subscribe block only`, lens.sections === 2 && lens.rows === 0 && lens.form === 1, JSON.stringify(lens))
    await open(page, `${site.url}/`)
    ok(`[${width}] home with no Lens piece: no card labelled The Lens`, !(await page.evaluate(() => document.body.innerText.includes('THE LENS'))))
  } else info('Lens pieces exist: the "empty series" checks are skipped')

  await ctx.close()
}

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
