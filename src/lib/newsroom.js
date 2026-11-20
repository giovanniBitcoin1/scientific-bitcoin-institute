// Loader for the Insights series, as used by the pages. Modelled on
// src/lib/insights.js; the parsing itself lives in newsroom-core.js, which the
// Node scripts share.
//
// Drafts never reach this file in a production build: the `newsroom-drafts`
// plugin in vite.config.js replaces every file that is not `status: published`
// with an empty string before it is bundled. They are let through only by
// `npm run dev:drafts`, which also sets __NEWSROOM_DRAFTS__.
import explainerArticles from './insights.js'
import {
  DISPATCH, LENS, EXPLAINER, buildDispatch, buildLens, byNumberDesc, byDateDesc, latestOf, collectClaims,
  isIgnoredFile, modifiedOf, ymdFromLocalDate, piecePath, formatDate,
} from './newsroom-core.js'

const dispatchFiles = import.meta.glob('../content/dispatch/*.md', { eager: true, query: '?raw', import: 'default' })
const lensFiles = import.meta.glob('../content/lens/*.md', { eager: true, query: '?raw', import: 'default' })

export const DRAFTS_VISIBLE = typeof __NEWSROOM_DRAFTS__ !== 'undefined' && __NEWSROOM_DRAFTS__ === true

function load(files, build) {
  return Object.entries(files)
    .filter(([path, raw]) => !isIgnoredFile(path) && typeof raw === 'string' && raw.trim() !== '')
    .map(([path, raw]) => build(path, raw))
    .filter((piece) => piece.status === 'published' || DRAFTS_VISIBLE)
    .map((piece) => ({ ...piece, modified: modifiedOf(piece), isDraft: piece.status !== 'published' }))
}

const dispatches = load(dispatchFiles, buildDispatch).sort(byNumberDesc)
const lensPieces = load(lensFiles, buildLens).sort(byDateDesc)

// Explainers come from src/lib/insights.js, unchanged. Here they only get the
// few fields the cross-series lists need.
const explainers = explainerArticles.map((article) => {
  const date = ymdFromLocalDate(article.date)
  return {
    series: EXPLAINER,
    slug: article.slug,
    path: piecePath(EXPLAINER, article.slug),
    title: article.title,
    summary: article.summary,
    subtitle: article.subtitle,
    date,
    formattedDate: formatDate(date),
    modified: date,
    tags: article.tags,
    heroImage: article.heroImage,
    readingTime: article.readingTime,
    isDraft: false,
  }
})

export const getDispatches = () => dispatches
export const getLensPieces = () => lensPieces
export const getExplainers = () => explainers

export const getDispatchBySlug = (slug) => dispatches.find((d) => d.slug === slug) || null
export const getDispatchByNumber = (number) => dispatches.find((d) => d.number === number) || null
export const getLensBySlug = (slug) => lensPieces.find((l) => l.slug === slug) || null

// The n most recent pieces across the three series, newest first.
export const getLatest = (n) => latestOf([...dispatches, ...lensPieces, ...explainers], n)

// Every claim made in a Dispatch issue or a Lens piece, newest first.
export const getClaims = () => collectClaims([...dispatches, ...lensPieces])

export { DISPATCH, LENS, EXPLAINER }
