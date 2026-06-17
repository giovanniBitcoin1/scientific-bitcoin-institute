import { useEffect } from 'react'
import { resolveInsightImage } from './insightImages.js'

const SITE_NAME = 'Scientific Bitcoin Institute'
const ORG_LOGO = '/assets/logo.jpg'

// Ensure a <meta> tag exists for the given key/value attribute, set its content,
// and return it. Tags created here are tagged with data-managed so we can clean
// them up on unmount.
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  let created = false
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-managed-seo', 'true')
    document.head.appendChild(el)
    created = true
  }
  el.setAttribute('content', content || '')
  return { el, created }
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"][data-managed-seo="true"]`)
  let created = false
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-managed-seo', 'true')
    document.head.appendChild(el)
    created = true
  }
  el.setAttribute('href', href || '')
  return { el, created }
}

/**
 * Sets document title, meta description, Open Graph + Twitter card tags,
 * a canonical link, and JSON-LD structured data for an Insights article.
 * Cleans up the tags it created on unmount.
 */
export function useArticleSEO(article) {
  useEffect(() => {
    if (!article) return

    const prevTitle = document.title
    document.title = `${article.title} | ${SITE_NAME}`

    const url = window.location.href
    const origin = window.location.origin
    const heroUrl = resolveInsightImage(article.slug, article.heroImage)
    const absoluteImage = heroUrl
      ? heroUrl.startsWith('http')
        ? heroUrl
        : origin + heroUrl
      : ''

    // Track elements we create so we can remove only those on cleanup.
    const created = []
    const track = (result) => {
      if (result.created) created.push(result.el)
      return result.el
    }

    // Standard description (reuse existing tag if present, don't delete it).
    const descRes = setMeta('name', 'description', article.summary)
    track(descRes)

    // Open Graph
    track(setMeta('property', 'og:title', article.title))
    track(setMeta('property', 'og:description', article.summary))
    track(setMeta('property', 'og:type', 'article'))
    track(setMeta('property', 'og:url', url))
    track(setMeta('property', 'og:site_name', SITE_NAME))
    if (absoluteImage) track(setMeta('property', 'og:image', absoluteImage))

    // Twitter card
    track(setMeta('name', 'twitter:card', 'summary_large_image'))
    track(setMeta('name', 'twitter:title', article.title))
    track(setMeta('name', 'twitter:description', article.summary))
    if (absoluteImage) track(setMeta('name', 'twitter:image', absoluteImage))

    // Canonical URL
    track(setLink('canonical', url))

    // JSON-LD structured data (schema.org Article)
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.summary,
      datePublished: article.date instanceof Date ? article.date.toISOString() : undefined,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: origin + ORG_LOGO,
        },
      },
      image: absoluteImage || undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    }
    const ldScript = document.createElement('script')
    ldScript.type = 'application/ld+json'
    ldScript.setAttribute('data-managed-seo', 'true')
    ldScript.textContent = JSON.stringify(ld)
    document.head.appendChild(ldScript)

    return () => {
      document.title = prevTitle
      // Remove only tags we created; a pre-existing site description tag is
      // left in place (it was reused, not created).
      created.forEach((el) => el.remove())
      ldScript.remove()
    }
  }, [article])
}

export default useArticleSEO
