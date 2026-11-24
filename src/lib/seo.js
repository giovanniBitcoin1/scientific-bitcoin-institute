// Runtime side of the SEO model: writes the tags built by src/lib/site.js into
// <head>. The same model is printed into the static HTML by
// scripts/newsroom/postbuild.mjs, so on a page that has a static file the tags
// are already there and are simply confirmed.
//
// No react-helmet: plain DOM calls inside effects.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { resolveInsightImage } from './insightImages.js'
import { mediaUrl, ymdFromLocalDate } from './newsroom-core.js'
import { MANAGED_META, articleSeo, canonicalUrl, defaultSeo, pageSeo } from './site.js'

// The site's origin comes from public/CNAME (see vite.config.js), never from
// window.location: a preview host or a "www." alias must not become canonical.
export const SITE_ORIGIN = __SITE_ORIGIN__

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function applySeo(seo) {
  document.title = seo.title
  for (const [attr, key] of MANAGED_META) {
    const tag = seo.meta.find((m) => m.attr === attr && m.key === key)
    if (tag) setMeta(attr, key, tag.content)
    else document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
  }
  setCanonical(seo.canonical)
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove())
  if (seo.jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(seo.jsonLd)
    document.head.appendChild(script)
  }
}

function useSeo(seo, key) {
  useEffect(() => {
    if (!seo) return undefined
    applySeo(seo)
    // Leaving the page: back to the site defaults, so a page without its own
    // tags does not keep the previous article's.
    return () => applySeo(defaultSeo(SITE_ORIGIN, window.location.pathname))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

// A page listed in PAGES (src/lib/site.js): hub, archives, subscribe…
export function usePageSEO(path) {
  useSeo(pageSeo(SITE_ORIGIN, path), path)
}

// A Dispatch issue or a Lens piece.
export function usePieceSEO(piece) {
  const image = piece && piece.shareImage ? { url: mediaUrl(piece.series, piece.slug, piece.shareImage), width: 1200, height: 630 } : null
  useSeo(piece ? articleSeo(SITE_ORIGIN, piece, image) : null, piece ? piece.path : '')
}

// An Explainer (article object from src/lib/insights.js).
export function useArticleSEO(article) {
  let seo = null
  if (article) {
    const hero = resolveInsightImage(article.slug, article.heroImage)
    const date = ymdFromLocalDate(article.date)
    seo = articleSeo(
      SITE_ORIGIN,
      { path: `/insights/${article.slug}`, title: article.title, summary: article.summary, date, author: article.author },
      hero ? { url: hero } : null,
    )
  }
  useSeo(seo, article ? article.slug : '')
}

// Mounted once inside the router: every route, with or without tags of its
// own, gets the canonical link and og:url of its own address.
export function RouteCanonical() {
  const { pathname } = useLocation()
  useEffect(() => {
    const url = canonicalUrl(SITE_ORIGIN, pathname)
    setCanonical(url)
    setMeta('property', 'og:url', url)
  }, [pathname])
  return null
}

export default useArticleSEO
