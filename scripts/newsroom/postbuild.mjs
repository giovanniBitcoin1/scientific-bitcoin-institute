// Last step of `npm run build`. Turns the single-page build in dist/ into a
// site whose article URLs answer with real HTML:
//
//   1. one index.html per static route, with its own <head> (title,
//      description, canonical, Open Graph, Twitter, JSON-LD, feed link);
//   2. a readable copy of the page inside <div id="root">, replaced by the app;
//   3. redirect stubs for the old newsletter addresses;
//   4. the Atom feed and the sitemap.
//
//   node scripts/newsroom/postbuild.mjs [--dist <dir>]
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { EXPLAINER, mediaUrl, toInstant, toRfc3339 } from '../../src/lib/newsroom-core.js'
import { renderNewsroomMarkdown } from '../../src/lib/newsroomMarkdown.js'
import { articleFallback, pageFallback } from '../../src/lib/staticFallback.js'
import {
  FEED_PATH, FEED_TITLE, SITE_NAME, articleSeo, canonicalPath, canonicalUrl, pageSeo,
} from '../../src/lib/site.js'
import { REPO, explainerDir, mediaDir, parseArgs } from './lib/content.mjs'
import { imageSize } from './lib/image-size.mjs'
import { buildRoutes } from './lib/routes.mjs'

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ------------------------------------------------------------ Head

// Everything the route's own tags replace is taken out of the template first,
// so each tag appears exactly once.
function stripHead(html) {
  return html
    .replace(/<!-- Site-wide sharing defaults[\s\S]*?-->\s*/g, '')
    .replace(/\s*<title>[\s\S]*?<\/title>/gi, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<meta\s+(?:property|name)="(?:og|twitter|article):[^"]*"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="alternate"\s+type="application\/atom\+xml"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
}

export function headTags(seo, origin) {
  const lines = [
    `<title>${esc(seo.title)}</title>`,
    ...seo.meta.map((m) => `<meta ${m.attr}="${m.key}" content="${esc(m.content)}" />`),
    `<link rel="canonical" href="${esc(seo.canonical)}" />`,
    `<link rel="alternate" type="application/atom+xml" title="${esc(FEED_TITLE)}" href="${esc(origin + FEED_PATH)}" />`,
  ]
  // "<" is escaped so that no text in a title can close the script element.
  if (seo.jsonLd) lines.push(`<script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>`)
  return lines.map((l) => `    ${l}`).join('\n')
}

// dist/index.html is also what a visitor of any route WITHOUT a static file
// receives (through 404.html). For them the home page's copy and canonical
// address would be wrong, so this removes both before anything is painted.
const HOME_GUARD =
  "<script>if(location.pathname!=='/'){document.getElementById('root').innerHTML='';" +
  "document.querySelectorAll('link[rel=canonical],meta[property=\"og:url\"]').forEach(function(e){e.remove()})}</script>"

export function renderPage(template, { seo, origin, fallbackHtml, isHome }) {
  let html = stripHead(template).replace('</head>', `${headTags(seo, origin)}\n  </head>`)
  if (!html.includes('<div id="root"></div>')) throw new Error('The build template has no empty <div id="root"></div>')
  return html.replace('<div id="root"></div>', `<div id="root">${fallbackHtml}</div>${isHome ? HOME_GUARD : ''}`)
}

// ------------------------------------------------------------ Images

// The hashed copy Vite made of an Explainer image: the file in dist/assets
// with the same name stem and the same bytes as the source.
function builtAsset(dist, source) {
  if (!existsSync(source)) return ''
  const ext = path.extname(source)
  const stem = path.basename(source, ext)
  const bytes = readFileSync(source)
  const dir = path.join(dist, 'assets')
  const hit = readdirSync(dir).find(
    (name) => name.startsWith(`${stem}-`) && name.endsWith(ext) && readFileSync(path.join(dir, name)).equals(bytes),
  )
  return hit ? `/assets/${hit}` : ''
}

// The share image of a piece: its own, else an Explainer's hero, else null
// (buildSeo then uses the site default).
function shareImage(root, dist, piece) {
  if (piece.shareImage) {
    const size = imageSize(path.join(mediaDir(root, piece.series, piece.slug), piece.shareImage.split('/').pop()))
    return { url: mediaUrl(piece.series, piece.slug, piece.shareImage), width: size?.width, height: size?.height }
  }
  if (piece.series === EXPLAINER && piece.heroImage) {
    const source = path.join(explainerDir(root, piece.slug), piece.heroImage.split('/').pop())
    const url = builtAsset(dist, source)
    if (url) {
      const size = imageSize(source)
      return { url, width: size?.width, height: size?.height }
    }
  }
  return null
}

const imageResolver = (root, dist, origin, piece) =>
  piece.series === EXPLAINER
    ? (src) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return src
        const url = builtAsset(dist, path.join(explainerDir(root, piece.slug), src.split('/').pop()))
        return url ? origin + url : src
      }
    : undefined

// ------------------------------------------------------------ Feed, sitemap, stubs

const stripClasses = (html) => html.replace(/\sclass="[^"]*"/g, '')

function atomFeed({ origin, entries }) {
  const updated = entries.map((e) => e.updated).sort((a, b) => toInstant(b) - toInstant(a))[0] || '1970-01-01'
  const items = entries.map(
    (e) => `  <entry>
    <id>${esc(e.url)}</id>
    <title>${esc(e.title)}</title>
    <link rel="alternate" type="text/html" href="${esc(e.url)}" />
    <published>${toRfc3339(e.published)}</published>
    <updated>${toRfc3339(e.updated)}</updated>
    <author><name>${esc(e.author)}</name></author>
    <category term="${esc(e.series)}" />
    <summary>${esc(e.summary)}</summary>
    <content type="html">${esc(e.html)}</content>
  </entry>`,
  )
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${esc(canonicalUrl(origin, '/insights'))}</id>
  <title>${esc(FEED_TITLE)}</title>
  <subtitle>SBI Dispatch, The Lens and Explainers.</subtitle>
  <link rel="self" type="application/atom+xml" href="${esc(origin + FEED_PATH)}" />
  <link rel="alternate" type="text/html" href="${esc(canonicalUrl(origin, '/insights'))}" />
  <updated>${toRfc3339(updated)}</updated>
  <author><name>${esc(SITE_NAME)}</name></author>
${items.join('\n')}
</feed>
`
}

function sitemap({ origin, routes }) {
  const urls = routes
    .filter((r) => r.inSitemap)
    .map((r) => `  <url>\n    <loc>${esc(canonicalUrl(origin, r.path))}</loc>${r.lastmod ? `\n    <lastmod>${r.lastmod.length === 10 ? r.lastmod : toRfc3339(r.lastmod)}</lastmod>` : ''}\n  </url>`)
  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

function stubPage(origin, to) {
  const url = canonicalUrl(origin, to)
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This page has moved — ${esc(SITE_NAME)}</title>
    <link rel="canonical" href="${esc(url)}" />
    <meta http-equiv="refresh" content="0; url=${esc(url)}" />
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <p>This page has moved to <a href="${esc(url)}">${esc(url)}</a>.</p>
  </body>
</html>
`
}

// ------------------------------------------------------------ Main

export function postbuild({ root = REPO, dist = path.join(REPO, 'dist'), log = console.log } = {}) {
  const template = readFileSync(path.join(dist, 'index.html'), 'utf8')
  const { origin, pieces, routes, stubs } = buildRoutes(root)
  const created = new Set()
  const write = (route, html) => {
    const dir = path.join(dist, ...canonicalPath(route).split('/').filter(Boolean))
    // Remember every folder made on the way, to check each has an index.html.
    let walk = dir
    while (walk !== dist) {
      if (!existsSync(walk)) created.add(walk)
      walk = path.dirname(walk)
    }
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), html)
  }

  for (const route of routes) {
    let seo
    let fallback
    if (route.kind === 'article') {
      const piece = route.piece
      seo = articleSeo(origin, piece, shareImage(root, dist, piece))
      fallback = articleFallback({ piece, origin, resolveImage: imageResolver(root, dist, origin, piece) })
    } else {
      seo = pageSeo(origin, route.path)
      fallback = pageFallback({ ...route.fallback, origin })
    }
    write(route.path, renderPage(template, { seo, origin, fallbackHtml: renderToStaticMarkup(fallback), isHome: route.path === '/' }))
  }

  for (const stub of stubs) write(stub.from, stubPage(origin, stub.to))

  const missing = [...created].filter((dir) => !existsSync(path.join(dir, 'index.html')))
  if (missing.length) throw new Error(`Folders created without an index.html: ${missing.join(', ')}`)

  // Feed: the 30 most recent pieces of all series.
  const entries = [...pieces.all]
    .sort((a, b) => toInstant(b.date) - toInstant(a.date) || a.path.localeCompare(b.path))
    .slice(0, 30)
    .map((piece) => ({
      url: canonicalUrl(origin, piece.path),
      title: piece.title,
      series: piece.series,
      summary: piece.summary,
      published: piece.date,
      updated: piece.modified,
      author: piece.authors || piece.author || SITE_NAME,
      html: stripClasses(
        renderToStaticMarkup(
          renderNewsroomMarkdown({
            body: piece.body,
            series: piece.series,
            slug: piece.slug,
            origin,
            resolveImage: imageResolver(root, dist, origin, piece),
          }),
        ),
      ),
    }))
  mkdirSync(path.join(dist, 'insights'), { recursive: true })
  writeFileSync(path.join(dist, 'insights', 'feed.xml'), atomFeed({ origin, entries }))
  writeFileSync(path.join(dist, 'sitemap.xml'), sitemap({ origin, routes }))

  log(
    `Post-build: ${routes.length} static pages, ${stubs.length} redirect stubs, feed (${entries.length} entries) and sitemap written to ${path.relative(process.cwd(), dist) || dist}.`,
  )
  return { routes, stubs, entries }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { opt } = parseArgs()
  postbuild({ dist: typeof opt.dist === 'string' ? path.resolve(opt.dist) : path.join(REPO, 'dist') })
}
