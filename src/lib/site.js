// Site-wide constants, the canonical-URL helper and the SEO model.
//
// Pure module (no Vite API, no DOM). The runtime (src/lib/seo.js) and the
// post-build script (scripts/newsroom/postbuild.mjs) both build their tags
// with buildSeo() and their addresses with canonicalUrl(), so the HTML written
// at build time and the tags set in the browser cannot disagree.
import { toRfc3339 } from './newsroom-core.js'

export const SITE_NAME = 'Scientific Bitcoin Institute'
export const SITE_TAGLINE = 'Rigorous research on Bitcoin as a complex adaptive system'
export const SITE_DESCRIPTION =
  'Scientific Bitcoin Institute — rigorous research on Bitcoin as a complex adaptive system.'
export const ORG_LOGO = '/assets/logo.jpg'
export const FEED_PATH = '/insights/feed.xml'
export const FEED_TITLE = 'Scientific Bitcoin Institute — Insights'
export const DEFAULT_SHARE_IMAGE = { url: '/og/default.png', width: 1200, height: 630 }

// The site's origin is whatever domain public/CNAME names.
export function originFromCname(text) {
  const host = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean)
  if (!host) throw new Error('public/CNAME is empty: the site origin is unknown')
  return `https://${host}`
}

// The one address of a page: no query, no hash, and a trailing slash, because
// that is the URL GitHub Pages answers with 200 (without the slash it answers
// 301 to it).
export function canonicalPath(path) {
  const clean = `/${String(path || '/').split(/[?#]/)[0]}`.replace(/\/{2,}/g, '/')
  return clean.endsWith('/') ? clean : `${clean}/`
}

export const canonicalUrl = (origin, path) => origin + canonicalPath(path)

export const absoluteUrl = (origin, url) => (/^https?:\/\//i.test(url) ? url : origin + url)

/**
 * Everything the <head> says about one page.
 *
 * `image` is { url, width?, height? }; `published` / `modified` are the date
 * strings of the piece ("2026-12-03" or with time and offset) and make the
 * page an article.
 */
export function buildSeo({ origin, path, title, fullTitle, description, image, published, modified, author }) {
  const url = canonicalUrl(origin, path)
  const img = image && image.url ? image : DEFAULT_SHARE_IMAGE
  const imageUrl = absoluteUrl(origin, img.url)
  const isArticle = !!published
  const publishedAt = isArticle ? toRfc3339(published) : ''
  const modifiedAt = isArticle ? toRfc3339(modified || published) : ''

  const meta = [
    ['name', 'description', description],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:type', isArticle ? 'article' : 'website'],
    ['property', 'og:url', url],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:image', imageUrl],
    ...(img.width && img.height
      ? [
          ['property', 'og:image:width', String(img.width)],
          ['property', 'og:image:height', String(img.height)],
        ]
      : []),
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', imageUrl],
    ...(isArticle
      ? [
          ['property', 'article:published_time', publishedAt],
          ['property', 'article:modified_time', modifiedAt],
        ]
      : []),
  ].map(([attr, key, content]) => ({ attr, key, content }))

  const authorName = author || SITE_NAME
  const jsonLd = isArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        author: { '@type': authorName === SITE_NAME ? 'Organization' : 'Person', name: authorName },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: canonicalUrl(origin, '/'),
          logo: { '@type': 'ImageObject', url: origin + ORG_LOGO },
        },
        image: imageUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      }
    : null

  return {
    title: fullTitle || `${title} | ${SITE_NAME}`,
    description,
    canonical: url,
    meta,
    jsonLd,
  }
}

// What a page without its own tags says: the defaults written in index.html.
export const defaultSeo = (origin, path = '/') =>
  buildSeo({ origin, path, title: SITE_NAME, fullTitle: SITE_NAME, description: SITE_DESCRIPTION })

// The keys buildSeo() may set. The runtime removes the ones a page leaves out.
export const MANAGED_META = [
  ['name', 'description'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:type'],
  ['property', 'og:url'],
  ['property', 'og:site_name'],
  ['property', 'og:image'],
  ['property', 'og:image:width'],
  ['property', 'og:image:height'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['property', 'article:published_time'],
  ['property', 'article:modified_time'],
]

// ------------------------------------------------------------ Editorial copy
// Shown by the pages and repeated in the static HTML written at build time.

export const COPY = {
  hubIntroLead:
    "Analysis from the Scientific Bitcoin Institute, in three forms. SBI Dispatch is our newsletter, sent every other Thursday. The Lens reads a news story through one of the Institute's instruments while it is still unfolding. Explainers are longer introductions to a single subject. All three are educational analysis, distinct from the Institute's ",
  hubIntroLink: 'research publications',
  hubIntroTail: '.',
  dispatchIntro:
    "SBI Dispatch is the Institute's newsletter. Every other Thursday: one news story read through an SBI instrument, one essay on the science of Bitcoin with a short reading list, and news from the Institute.",
  lensIntro:
    "The Lens applies one of the Institute's instruments to a news story while it is still unfolding. Each piece says what is confirmed, what is only reported, what the instrument shows and what it cannot show. Pieces are updated as the facts change, with dated notes.",
  signupEyebrow: 'Newsletter',
  signupHeading: 'SBI Dispatch',
  signupBody:
    "Rigorous analysis of Bitcoin in your inbox, every other Thursday: one news story read through the Institute's instruments, one essay, and news from the Institute. One email, twice a month.",
  signupFootnote: "Powered by Buttondown. We don't sell or share your address.",
  subscribeLensNote: 'The Lens is published on this site only; it is never sent by email.',
  onTheRecordIntro:
    'Checkable statements made in SBI Dispatch and in The Lens, each with the date it was made, the date by which it can be checked, and how it stands.',
}

export const hubIntroText = COPY.hubIntroLead + COPY.hubIntroLink + COPY.hubIntroTail

// Title, heading and description of the pages that are not articles.
export const PAGES = {
  '/': { heading: SITE_NAME, title: SITE_NAME, fullTitle: SITE_NAME, description: SITE_DESCRIPTION },
  '/insights': {
    heading: 'Insights',
    title: 'Insights',
    description:
      'Analysis from the Scientific Bitcoin Institute in three forms: SBI Dispatch, the newsletter; The Lens, news read through the Institute\'s instruments; and Explainers.',
  },
  '/insights/dispatch': {
    heading: 'SBI Dispatch',
    title: 'SBI Dispatch',
    description:
      "SBI Dispatch is the Institute's newsletter, sent every other Thursday. Read every issue in the archive.",
  },
  '/insights/lens': {
    heading: 'The Lens',
    title: 'The Lens',
    description:
      "The Lens applies one of the Institute's instruments to a news story while it is still unfolding, and is updated as the facts change.",
  },
  '/insights/on-the-record': {
    heading: 'On the record',
    title: 'On the record',
    description: COPY.onTheRecordIntro,
  },
  '/subscribe': {
    heading: 'Subscribe to SBI Dispatch',
    title: 'Subscribe to SBI Dispatch',
    description:
      "Rigorous analysis of Bitcoin in your inbox, every other Thursday. Subscribe to SBI Dispatch, the Scientific Bitcoin Institute's newsletter.",
  },
  '/news': {
    heading: 'Latest News',
    title: 'Latest News',
    description: 'News, research updates, and recent episodes from the Scientific Bitcoin Institute.',
  },
}

export function pageSeo(origin, path) {
  const page = PAGES[path]
  return buildSeo({
    origin,
    path,
    title: page.title,
    fullTitle: page.fullTitle || `${page.title} — ${SITE_NAME}`,
    description: page.description,
  })
}

// Head of an article page. `image` is resolved by the caller, because where a
// share image lives differs between the build and the browser.
export function articleSeo(origin, piece, image) {
  return buildSeo({
    origin,
    path: piece.path,
    title: piece.title,
    description: piece.summary,
    image,
    published: piece.date,
    modified: piece.modified || piece.date,
    author: piece.authors || piece.author || SITE_NAME,
  })
}
