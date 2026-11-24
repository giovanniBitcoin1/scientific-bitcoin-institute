// The list of routes that get a static HTML file, shared by the post-build
// script, the dist check and the browser checks, so the three always talk
// about the same pages.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DISPATCH, EXPLAINER, LENS, collectClaims, latestOf, toInstant } from '../../../src/lib/newsroom-core.js'
import { COPY, PAGES, SITE_NAME, SITE_TAGLINE, hubIntroText } from '../../../src/lib/site.js'
import { REPO, loadPieces, siteOrigin } from './content.mjs'

// Old newsletter addresses and where they lead now.
export function redirectStubs(pieces) {
  const first = pieces.dispatches.find((d) => d.number === 1)
  return [
    { from: '/news/newsletter', to: '/insights/dispatch' },
    ...(first ? [{ from: '/news/newsletter/issue-01', to: first.path }] : []),
    { from: '/newsletter', to: '/insights/dispatch' },
  ]
}

const latestDate = (list) => list.map((p) => p.modified).sort((a, b) => toInstant(b) - toInstant(a))[0] || ''

/**
 * { origin, pieces, claims, routes, stubs }.
 * A route is { path, kind, heading, lastmod, inSitemap, piece?, fallback? }:
 *   kind "article" — a published piece;
 *   kind "page"    — hub, archives, subscribe, on the record, home;
 *   kind "support" — a page written only because a redirect stub created its
 *                    folder (every folder in dist/ must have an index.html).
 * `heading` is the <h1> the running app must show (null: not fixed).
 */
export function buildRoutes(root = REPO) {
  const origin = siteOrigin(root)
  const pieces = loadPieces(root)
  const claims = collectClaims([...pieces.dispatches, ...pieces.lens])
  const all = pieces.all
  const newest = latestDate(all)
  const asLink = (p) => ({
    href: p.path,
    title: p.series === DISPATCH ? `SBI Dispatch No. ${p.number} · ${p.title}` : p.title,
    note: `${p.formattedDate} — ${p.summary}`,
  })
  const slides = JSON.parse(readFileSync(path.join(REPO, 'src', 'data', 'heroSlides.json'), 'utf8'))

  const routes = [
    {
      path: '/',
      kind: 'page',
      heading: null,
      headingOneOf: slides.map((s) => s.title),
      lastmod: newest,
      inSitemap: true,
      fallback: {
        heading: SITE_NAME,
        paragraphs: [`${SITE_TAGLINE}.`],
        links: latestOf(all, 3).map(asLink),
      },
    },
    {
      path: '/insights',
      kind: 'page',
      heading: PAGES['/insights'].heading,
      lastmod: newest,
      inSitemap: true,
      fallback: {
        eyebrowText: 'Scientific Bitcoin Institute · Insights',
        heading: PAGES['/insights'].heading,
        paragraphs: [hubIntroText],
        links: latestOf(all, 6).map(asLink),
      },
    },
    {
      path: '/insights/dispatch',
      kind: 'page',
      heading: PAGES['/insights/dispatch'].heading,
      lastmod: latestDate(pieces.dispatches),
      inSitemap: pieces.dispatches.length > 0,
      fallback: {
        eyebrowText: 'Insights · Newsletter',
        heading: PAGES['/insights/dispatch'].heading,
        paragraphs: [COPY.dispatchIntro],
        links: pieces.dispatches.map(asLink),
      },
    },
    {
      path: '/insights/lens',
      kind: 'page',
      heading: PAGES['/insights/lens'].heading,
      lastmod: latestDate(pieces.lens),
      // An archive with no piece yet is not announced to search engines.
      inSitemap: pieces.lens.length > 0,
      fallback: {
        eyebrowText: 'Insights · News analysis',
        heading: PAGES['/insights/lens'].heading,
        paragraphs: [COPY.lensIntro],
        links: pieces.lens.map(asLink),
      },
    },
    ...(claims.length
      ? [
          {
            path: '/insights/on-the-record',
            kind: 'page',
            heading: PAGES['/insights/on-the-record'].heading,
            lastmod: latestDate(claims.map((c) => c.piece)),
            inSitemap: true,
            fallback: {
              eyebrowText: 'Insights · Accountability',
              heading: PAGES['/insights/on-the-record'].heading,
              paragraphs: [COPY.onTheRecordIntro],
              links: claims.map((c) => ({
                href: c.piece.path,
                title: c.text,
                note: `Made ${c.made}${c.checkBy ? ` · check by ${c.checkBy}` : ''} · ${c.status}${c.note ? ` — ${c.note}` : ''}`,
              })),
            },
          },
        ]
      : []),
    {
      path: '/subscribe',
      kind: 'page',
      heading: PAGES['/subscribe'].heading,
      lastmod: newest,
      inSitemap: true,
      fallback: {
        eyebrowText: COPY.signupEyebrow,
        heading: PAGES['/subscribe'].heading,
        paragraphs: [COPY.signupBody, COPY.subscribeLensNote],
        links: [],
      },
    },
    ...all.map((piece) => ({
      path: piece.path,
      kind: 'article',
      heading: piece.title,
      lastmod: piece.modified,
      inSitemap: true,
      piece,
    })),
  ]

  const stubs = redirectStubs(pieces)
  // dist/news/ is created by the stubs under it, so /news needs a file too.
  if (stubs.some((s) => s.from.startsWith('/news/'))) {
    routes.push({
      path: '/news',
      kind: 'support',
      heading: PAGES['/news'].heading,
      lastmod: '',
      inSitemap: false,
      fallback: { eyebrowText: 'Scientific Bitcoin Institute · News', heading: PAGES['/news'].heading, paragraphs: [PAGES['/news'].description], links: [] },
    })
  }

  return { origin, pieces, claims, routes, stubs }
}

export { DISPATCH, LENS, EXPLAINER }
