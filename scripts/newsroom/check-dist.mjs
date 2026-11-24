// Checks the finished build in dist/ (after `npm run build`).
//
//   node scripts/newsroom/check-dist.mjs              check dist/
//   node scripts/newsroom/check-dist.mjs --self-test  prove each check can fail
//
// For every static route: the file exists; exactly one title, canonical,
// og:title, og:description, og:url and og:image; the image file exists; the
// canonical address ends with "/"; the JSON-LD parses; the fallback carries the
// first sentence of the piece. The feed and the sitemap are well-formed and
// list the same articles. No draft and no fixture text anywhere.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { firstSentence } from '../../src/lib/newsroom-core.js'
import { FEED_PATH, canonicalPath, canonicalUrl } from '../../src/lib/site.js'
import { REPO, loadPieces, parseArgs, posix } from './lib/content.mjs'
import { buildRoutes } from './lib/routes.mjs'

export const FIXTURE_MARKER = 'NEWSROOM-FIXTURE'
const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.css', '.xml', '.json', '.txt', '.md', '.svg', '.map'])

// A view of dist/ that the self-test can overlay with changed or missing files.
function distView(dist, overlay = {}) {
  const real = (rel) => path.join(dist, ...rel.split('/'))
  return {
    exists: (rel) => (rel in overlay ? overlay[rel] !== null : existsSync(real(rel)) && statSync(real(rel)).isFile()),
    read: (rel) => (rel in overlay ? overlay[rel] : readFileSync(real(rel), 'utf8')),
    textFiles() {
      const out = new Set(Object.keys(overlay).filter((k) => overlay[k] !== null))
      const walk = (dir) => {
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          const abs = path.join(dir, e.name)
          if (e.isDirectory()) walk(abs)
          else if (TEXT_EXT.has(path.extname(e.name).toLowerCase())) {
            const rel = posix(path.relative(dist, abs))
            if (overlay[rel] !== null) out.add(rel)
          }
        }
      }
      walk(dist)
      return [...out].sort()
    },
  }
}

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

const textOf = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
// Text is compared with all white space removed: where an inline tag ends
// (<em>title</em>.) must not matter.
const squash = (s) => s.replace(/\s+/g, '')

const metas = (html, key) =>
  [...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"\s*\/?>/gi)].filter((m) => m[1] === key).map((m) => decode(m[2]))

const routeFile = (route) => [...canonicalPath(route).split('/').filter(Boolean), 'index.html'].join('/')

// Well-formedness of a small XML file: one root, tags balanced and nested,
// no stray "<" or "&".
export function xmlProblem(xml) {
  const body = xml.replace(/^\uFEFF?<\?xml[^?]*\?>\s*/, '')
  const stack = []
  let roots = 0
  let pos = 0
  const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/y
  while (pos < body.length) {
    const lt = body.indexOf('<', pos)
    const text = body.slice(pos, lt === -1 ? body.length : lt)
    if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(text)) return 'unescaped "&"'
    if (text.trim() && stack.length === 0) return 'text outside the root element'
    if (lt === -1) break
    tag.lastIndex = lt
    const m = tag.exec(body)
    if (!m) return `malformed tag near "${body.slice(lt, lt + 30)}"`
    if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(m[3])) return 'unescaped "&" in an attribute'
    if (m[1]) {
      if (stack.pop() !== m[2]) return `closing tag </${m[2]}> does not match`
    } else {
      if (stack.length === 0) roots++
      if (!m[4]) stack.push(m[2])
    }
    pos = tag.lastIndex
  }
  if (stack.length) return `<${stack.pop()}> is never closed`
  if (roots !== 1) return `expected one root element, found ${roots}`
  return ''
}

/**
 * Runs every check. Returns a list of { ok, name, detail }.
 * `overlay` maps a path inside dist to replacement text (or null = missing);
 * `drafts` overrides the draft pieces whose text must not appear.
 */
export function checkDist({ root = REPO, dist = path.join(REPO, 'dist'), overlay = {}, drafts } = {}) {
  const results = []
  const ok = (name, cond, detail = '') => {
    results.push({ ok: !!cond, name, detail: cond ? '' : detail })
    return !!cond
  }
  const view = distView(dist, overlay)
  const { origin, routes, stubs } = buildRoutes(root)

  for (const route of routes) {
    const tag = route.path
    const file = routeFile(route.path)
    if (!ok(`${tag}: file exists (${file})`, view.exists(file))) continue
    const html = view.read(file)
    const head = html.slice(0, html.indexOf('</head>'))

    const titles = head.match(/<title>[\s\S]*?<\/title>/gi) || []
    const canon = [...head.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/gi)].map((m) => decode(m[1]))
    const counts = { title: titles.length, canonical: canon.length }
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image']) counts[key] = metas(head, key).length
    const wrong = Object.entries(counts).filter(([, n]) => n !== 1).map(([k, n]) => `${k}×${n}`)
    ok(`${tag}: exactly one title, canonical, og:title, og:description, og:url, og:image`, wrong.length === 0, wrong.join(', '))

    const expected = canonicalUrl(origin, route.path)
    ok(`${tag}: canonical ends with "/" and is ${expected}`, canon[0] === expected && expected.endsWith('/'), `found ${canon[0]}`)
    ok(`${tag}: og:url equals the canonical address`, metas(head, 'og:url')[0] === expected, `found ${metas(head, 'og:url')[0]}`)

    const image = metas(head, 'og:image')[0] || ''
    const imageRel = image.startsWith(origin + '/') ? decodeURIComponent(image.slice(origin.length + 1)) : ''
    ok(`${tag}: og:image file exists in dist`, imageRel && existsSync(path.join(dist, ...imageRel.split('/'))), `og:image = ${image}`)
    ok(`${tag}: og:image has width and height`, metas(head, 'og:image:width').length === 1 && metas(head, 'og:image:height').length === 1)
    ok(`${tag}: feed link present`, new RegExp(`<link\\s+rel="alternate"\\s+type="application/atom\\+xml"[^>]*href="${origin}${FEED_PATH}"`).test(head))

    const ld = [...head.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1])
    if (route.kind === 'article') {
      let parsed = null
      try {
        parsed = ld.length === 1 ? JSON.parse(ld[0]) : null
      } catch {
        parsed = null
      }
      ok(`${tag}: JSON-LD parses and is an Article`, parsed && parsed['@type'] === 'Article' && parsed.headline === route.piece.title && parsed.publisher?.name, `${ld.length} block(s)`)
      ok(`${tag}: article:published_time and article:modified_time`, metas(head, 'article:published_time').length === 1 && metas(head, 'article:modified_time').length === 1)
    } else {
      ok(`${tag}: no stray JSON-LD`, ld.length === 0)
    }

    const rootStart = html.indexOf('<div id="root">')
    const fallback = rootStart === -1 ? '' : textOf(html.slice(rootStart, html.lastIndexOf('</body>')).replace(/<script[\s\S]*?<\/script>/gi, ''))
    if (route.kind === 'article') {
      const sentence = squash(firstSentence(route.piece.body))
      ok(`${tag}: fallback has the title and the first sentence`, sentence.length > 0 && squash(fallback).includes(squash(route.piece.title)) && squash(fallback).includes(sentence), `first sentence: "${firstSentence(route.piece.body).slice(0, 60)}…"`)
      ok(`${tag}: fallback images are absolute`, !/<img[^>]+src="(?!https?:\/\/)/.test(html.slice(rootStart)))
    } else {
      ok(`${tag}: fallback has the heading`, squash(fallback).includes(squash(route.fallback.heading)))
    }
  }

  // ---- Redirect stubs
  for (const stub of stubs) {
    const file = routeFile(stub.from)
    if (!ok(`stub ${stub.from}: file exists`, view.exists(file))) continue
    const html = view.read(file)
    const target = canonicalUrl(origin, stub.to)
    ok(
      `stub ${stub.from}: canonical, immediate refresh and visible link to ${target}`,
      html.includes(`<link rel="canonical" href="${target}"`) &&
        html.includes(`<meta http-equiv="refresh" content="0; url=${target}"`) &&
        html.includes(`<a href="${target}">`),
    )
    ok(`stub ${stub.from}: target has a static page`, view.exists(routeFile(stub.to)))
  }

  // ---- Every folder on the way to a route has an index.html
  const folders = new Set()
  for (const p of [...routes.map((r) => r.path), ...stubs.map((s) => s.from)]) {
    const parts = canonicalPath(p).split('/').filter(Boolean)
    for (let i = 1; i <= parts.length; i++) folders.add(parts.slice(0, i).join('/'))
  }
  const bare = [...folders].filter((f) => !view.exists(`${f}/index.html`))
  ok('every folder created for a route has an index.html', bare.length === 0, bare.join(', '))

  // ---- Feed and sitemap
  const articleUrls = routes.filter((r) => r.kind === 'article').map((r) => canonicalUrl(origin, r.path)).sort()
  const feedFile = FEED_PATH.slice(1)
  let feedUrls = []
  if (ok('feed exists', view.exists(feedFile))) {
    const feed = view.read(feedFile)
    const problem = xmlProblem(feed)
    ok('feed is well-formed XML', !problem, problem)
    feedUrls = [...feed.matchAll(/<entry>\s*<id>([^<]+)<\/id>/g)].map((m) => decode(m[1])).sort()
    ok('feed entries have summary, content and updated', (feed.match(/<entry>/g) || []).length === (feed.match(/<summary>[^<]+<\/summary>\s*<content type="html">[^<]+<\/content>/g) || []).length && (feed.match(/<updated>\d{4}-\d{2}-\d{2}T[^<]+<\/updated>/g) || []).length === feedUrls.length + 1)
    ok('feed lists every article (30 at most)', articleUrls.length > 30 ? feedUrls.length === 30 : feedUrls.join() === articleUrls.join(), `feed: ${feedUrls.length}, articles: ${articleUrls.length}`)
  }
  if (ok('sitemap exists', view.exists('sitemap.xml'))) {
    const map = view.read('sitemap.xml')
    const problem = xmlProblem(map)
    ok('sitemap is well-formed XML', !problem, problem)
    const locs = [...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]))
    const want = routes.filter((r) => r.inSitemap).map((r) => canonicalUrl(origin, r.path)).sort()
    ok('sitemap lists exactly the static routes (empty archives left out)', [...locs].sort().join() === want.join(), `sitemap: ${locs.length}, expected: ${want.length}`)
    ok('sitemap: every address has a lastmod', (map.match(/<lastmod>\d{4}-\d{2}-\d{2}[^<]*<\/lastmod>/g) || []).length === locs.length)
    const mapArticles = locs.filter((l) => articleUrls.includes(l)).sort()
    if (articleUrls.length <= 30) ok('feed and sitemap list the same article URLs', mapArticles.join() === feedUrls.join(), `sitemap: ${mapArticles.length}, feed: ${feedUrls.length}`)
  }
  ok('robots.txt allows everything and names the sitemap', view.exists('robots.txt') && /^Allow: \/\s*$/m.test(view.read('robots.txt')) && view.read('robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`))

  // ---- No draft text, no fixture text
  const draftPieces = drafts || loadPieces(root, { includeDrafts: true }).all.filter((p) => p.isDraft)
  const needles = [[FIXTURE_MARKER, 'fixture text']]
  for (const d of draftPieces) {
    for (const [what, text] of [['title', d.title], ['summary', d.summary], ['first sentence', firstSentence(d.body)]]) {
      if (text && text.length >= 12) needles.push([text, `the ${what} of the draft ${d.file || d.slug}`])
    }
    // An Explainer's file name is still a key of the glob in src/lib/insights.js.
    if (d.series !== 'explainer') needles.push([d.slug, `the file name of the draft ${d.file || d.slug}`])
  }
  const leaks = []
  for (const rel of view.textFiles()) {
    const text = view.read(rel)
    const plain = decode(text)
    for (const [needle, what] of needles) {
      if (text.includes(needle) || plain.includes(needle) || text.includes(JSON.stringify(needle).slice(1, -1))) leaks.push(`${what} in ${rel}`)
    }
  }
  ok(`no draft and no fixture text in dist (${draftPieces.length} draft${draftPieces.length === 1 ? '' : 's'} looked for)`, leaks.length === 0, leaks.slice(0, 5).join('; '))

  return results
}

function print(results, { quiet = false } = {}) {
  for (const r of results) if (!quiet || !r.ok) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  ${r.detail}` : ''}`)
  const fails = results.filter((r) => !r.ok).length
  console.log(`\n${fails} failures of ${results.length} checks`)
  return fails
}

// ------------------------------------------------------------ Self-test
// Each case damages the real build in one way (in memory only) and names the
// check that must then fail.
function selfTest(dist) {
  const base = checkDist({ dist })
  if (base.some((r) => !r.ok)) {
    console.log('FAIL  the build must pass before its checks can be tested: run "npm run build" and "npm run check:dist".')
    return 1
  }
  const { routes, stubs } = buildRoutes(REPO)
  const article = routes.find((r) => r.kind === 'article')
  const file = routeFile(article.path)
  const html = readFileSync(path.join(dist, ...file.split('/')), 'utf8')
  const feed = readFileSync(path.join(dist, 'insights', 'feed.xml'), 'utf8')
  const map = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  const stubFile = routeFile(stubs[0].from)
  const stubHtml = readFileSync(path.join(dist, ...stubFile.split('/')), 'utf8')
  const asset = readdirSync(path.join(dist, 'assets')).find((n) => /^index-.*\.js$/.test(n))
  const must = (text, find) => {
    if (!text.includes(find)) throw new Error(`self-test out of date: "${find}" not found`)
    return text
  }
  const sub = (text, find, replace) => must(text, find).replace(find, replace)
  const fakeDraft = { slug: '999-zz-draft-probe', file: 'a draft', title: 'Zz draft probe title', summary: 'Zz draft probe summary text.', body: 'Zz draft probe opening sentence.\n' }

  const cases = [
    ['static page missing', { [file]: null }, 'file exists'],
    ['two titles', { [file]: sub(html, '</head>', '<title>Second</title></head>') }, 'exactly one title'],
    ['no canonical', { [file]: html.replace(/<link rel="canonical"[^>]*>/, '') }, 'exactly one title'],
    ['og:image twice', { [file]: sub(html, '</head>', '<meta property="og:image" content="x" /></head>') }, 'exactly one title'],
    ['canonical without the trailing slash', { [file]: html.replace(/(<link rel="canonical" href="[^"]*)\/"/, '$1"') }, 'canonical ends with'],
    ['og:url differs from the canonical', { [file]: html.replace(/(<meta property="og:url" content=")[^"]*/, '$1https://example.org/') }, 'og:url equals'],
    ['og:image points to a missing file', { [file]: html.replace(/(<meta property="og:image" content=")[^"]*/, '$1https://scientificbitcoininstitute.org/og/missing.png') }, 'og:image file exists'],
    ['JSON-LD does not parse', { [file]: sub(html, '<script type="application/ld+json">{', '<script type="application/ld+json">{{') }, 'JSON-LD parses'],
    ['fallback emptied', { [file]: html.replace(/<div id="root">[\s\S]*<\/div>(\s*<\/body>)/, '<div id="root"></div>$1') }, 'fallback has the title'],
    ['fallback image not absolute', { [file]: sub(html, '<div id="root">', '<div id="root"><img src="/insights-media/x.png" alt="x"/>') }, 'fallback images are absolute'],
    ['stub without refresh', { [stubFile]: stubHtml.replace(/<meta http-equiv="refresh"[^>]*>/, '') }, 'immediate refresh'],
    ['feed not well-formed', { 'insights/feed.xml': sub(feed, '</entry>', '') }, 'feed is well-formed'],
    ['feed with an unescaped ampersand', { 'insights/feed.xml': sub(feed, '<subtitle>', '<subtitle>A & B ') }, 'feed is well-formed'],
    ['feed missing an article', { 'insights/feed.xml': feed.replace(/  <entry>[\s\S]*?<\/entry>\n/, '') }, 'feed lists every article'],
    ['sitemap missing an article', { 'sitemap.xml': map.replace(/  <url>\s*<loc>[^<]*\/insights\/[^<]*-[^<]*<\/loc>[\s\S]*?<\/url>\n/, '') }, 'sitemap lists exactly'],
    ['sitemap not well-formed', { 'sitemap.xml': sub(map, '</urlset>', '') }, 'sitemap is well-formed'],
    ['robots.txt without the sitemap', { 'robots.txt': 'User-agent: *\nAllow: /\n' }, 'robots.txt'],
    ['fixture text in a script', { [`assets/${asset}`]: `var x="${FIXTURE_MARKER} opening sentence"` }, 'no draft and no fixture text'],
    ['draft text in a page', { [file]: sub(html, '<div id="root">', '<div id="root"><p>Zz draft probe opening sentence.</p>') }, 'no draft and no fixture text', [fakeDraft]],
    ['draft address in the sitemap', { 'sitemap.xml': sub(map, '</urlset>', '<url><loc>https://x.org/insights/dispatch/999-zz-draft-probe/</loc><lastmod>2026-01-01</lastmod></url></urlset>') }, 'no draft and no fixture text', [fakeDraft]],
  ]
  let failures = 0
  for (const [name, overlay, expectFail, drafts] of cases) {
    const failed = checkDist({ dist, overlay, drafts }).filter((r) => !r.ok).map((r) => r.name)
    const hit = failed.some((n) => n.includes(expectFail))
    if (!hit) failures++
    console.log(`${hit ? 'PASS' : 'FAIL'}  ${name}: the check "${expectFail}…" fails${hit ? '' : `  (failed instead: ${failed.join(' | ') || 'nothing'})`}`)
  }
  const clean = checkDist({ dist, drafts: [fakeDraft] }).every((r) => r.ok)
  if (!clean) failures++
  console.log(`${clean ? 'PASS' : 'FAIL'}  untouched build with a draft to look for: passes`)
  console.log(`\n${failures} failures of ${cases.length + 1} checks`)
  return failures
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { opt } = parseArgs()
  const dist = typeof opt.dist === 'string' ? path.resolve(opt.dist) : path.join(REPO, 'dist')
  if (!existsSync(path.join(dist, 'index.html'))) {
    console.error(`No build in ${dist}. Run "npm run build" first.`)
    process.exit(1)
  }
  if (opt['self-test']) process.exit(selfTest(dist) ? 1 : 0)
  process.exit(print(checkDist({ dist }), { quiet: !!opt.quiet }) ? 1 : 0)
}
