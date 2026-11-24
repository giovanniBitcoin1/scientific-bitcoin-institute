// Pure content model for the Insights series (SBI Dispatch, The Lens,
// Explainers). No Vite API and no DOM in this file: it is imported by the site
// (src/lib/newsroom.js) and by the Node scripts in scripts/newsroom/, so both
// read a markdown file in exactly the same way.
import yaml from 'js-yaml'

export const DISPATCH = 'dispatch'
export const LENS = 'lens'
export const EXPLAINER = 'explainer'

export const SERIES_LABEL = {
  [DISPATCH]: 'Dispatch',
  [LENS]: 'The Lens',
  [EXPLAINER]: 'Explainer',
}

export const SERIES_NAME = {
  [DISPATCH]: 'SBI Dispatch',
  [LENS]: 'The Lens',
  [EXPLAINER]: 'Explainers',
}

// Route prefixes. An Explainer lives directly under /insights, which is why it
// may not take one of the reserved names below.
export const SERIES_BASE = {
  [DISPATCH]: '/insights/dispatch',
  [LENS]: '/insights/lens',
  [EXPLAINER]: '/insights',
}

export const RESERVED_EXPLAINER_SLUGS = ['dispatch', 'lens', 'feed', 'on-the-record', 'subscribe']

export const STATUSES = ['draft', 'published']
export const EMAIL_MODES = ['none', 'draft', 'scheduled']
export const CLAIM_STATUSES = ['open', 'held', 'failed']
export const SOURCE_KINDS = ['primary', 'secondary']

export const TITLE_MAX = 90
export const SUMMARY_MAX = 200

// ------------------------------------------------------------ Frontmatter

// Splits "---\n<yaml>\n---\n<body>". The YAML is read with JSON_SCHEMA, which
// keeps `2026-12-03` and `2026-12-01T12:00:00+01:00` as the strings written in
// the file instead of turning them into Date objects: no day can shift and the
// written UTC offset is never lost.
export function parseFrontmatter(raw) {
  const text = String(raw || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const match = text.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/)
  if (!match) return { data: {}, content: text, error: 'no frontmatter block (the file must start with ---)' }
  try {
    const data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA })
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { data: {}, content: match[2], error: 'the frontmatter is not a list of "key: value" lines' }
    }
    return { data, content: match[2], error: null }
  } catch (e) {
    return { data: {}, content: match[2], error: `the frontmatter is not valid YAML (${e.reason || e.message})` }
  }
}

// ------------------------------------------------------------ Dates

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})$/

function validYmd(y, m, d) {
  if (m < 1 || m > 12 || d < 1) return false
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate()
}

// "YYYY-MM-DD", a real calendar day.
export function isIsoDate(value) {
  const m = typeof value === 'string' && value.match(DATE_RE)
  return !!m && validYmd(+m[1], +m[2], +m[3])
}

// "YYYY-MM-DDTHH:MM[:SS]" followed by an explicit offset ("+01:00") or "Z".
export function isIsoDateTime(value) {
  const m = typeof value === 'string' && value.match(DATETIME_RE)
  if (!m || !validYmd(+m[1], +m[2], +m[3])) return false
  if (+m[4] > 23 || +m[5] > 59 || (m[6] && +m[6] > 59)) return false
  if (m[7] !== 'Z') {
    const [oh, om] = m[7].slice(1).split(':').map(Number)
    if (oh > 14 || om > 59) return false
  }
  return true
}

// "2026-12-03" -> "December 3, 2026". Works on the first ten characters, so a
// date-time is shown on the day written in the file, whatever the reader's zone.
export function formatDate(value) {
  const m = typeof value === 'string' && value.slice(0, 10).match(DATE_RE)
  if (!m) return ''
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`
}

// "2026-12-01T12:00:00+01:00" -> "December 1, 2026, 12:00 (UTC+01:00)".
// The clock time and the offset are the ones written in the file.
export function formatDateTime(value) {
  const m = typeof value === 'string' && value.match(DATETIME_RE)
  if (!m) return formatDate(value)
  const zone = m[7] === 'Z' ? 'UTC' : `UTC${m[7]}`
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}, ${m[4]}:${m[5]} (${zone})`
}

// Milliseconds since the epoch, for ordering and comparing only. A date
// without a time counts as midnight UTC.
export function toInstant(value) {
  if (isIsoDate(value)) return Date.parse(`${value}T00:00:00Z`)
  if (isIsoDateTime(value)) return Date.parse(value)
  return NaN
}

// RFC 3339 text for feeds and structured data, offset preserved.
export function toRfc3339(value) {
  if (isIsoDate(value)) return `${value}T00:00:00Z`
  const m = typeof value === 'string' && value.match(DATETIME_RE)
  if (!m) return ''
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || '00'}${m[7]}`
}

// A local Date (as built by src/lib/insights.js) -> "YYYY-MM-DD".
export function ymdFromLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

// ------------------------------------------------------------ Text helpers

export function computeReadingTime(body) {
  const text = (body || '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Removes the markdown marks that may appear inside a heading or a sentence.
export function stripInlineMarkdown(text) {
  return String(text)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<\/?(?:sub|sup)>/g, '')
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .trim()
}

// Table of contents: the H2 headings of the body, outside code fences.
export function extractToc(body) {
  const toc = []
  let fenced = false
  for (const line of String(body || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced) continue
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/)
    if (!m) continue
    const text = stripInlineMarkdown(m[1])
    if (text) toc.push({ text, id: slugify(text) })
  }
  return toc
}

// File name without ".md": the URL slug of a piece.
export function slugFromFile(file) {
  return String(file).replace(/\\/g, '/').split('/').pop().replace(/\.md$/, '')
}

// Files starting with "_" (templates) are never pieces.
export const isIgnoredFile = (file) => slugFromFile(file).startsWith('_')

// "images/chart.png" in a Dispatch or Lens file -> its public, unhashed URL.
// Emails link to these files, so the URL must never change.
export function mediaUrl(series, slug, ref) {
  const name = String(ref || '').split('/').pop()
  return name ? `/insights-media/${series}/${slug}/${name}` : ''
}

export const piecePath = (series, slug) => `${SERIES_BASE[series]}/${slug}`

// ------------------------------------------------------------ Builders

const str = (v) => (typeof v === 'string' ? v : '')
const list = (v) => (Array.isArray(v) ? v : [])

function buildClaim(claim) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) return null
  return {
    text: str(claim.text),
    made: str(claim.made),
    checkBy: str(claim.check_by),
    status: str(claim.status),
    note: str(claim.note),
  }
}

function common(series, file, data, content) {
  const slug = slugFromFile(file)
  const date = str(data.date)
  return {
    series,
    slug,
    path: piecePath(series, slug),
    title: str(data.title),
    summary: str(data.summary),
    date,
    formattedDate: formatDate(date),
    status: str(data.status),
    tags: list(data.tags).filter((t) => typeof t === 'string'),
    shareImage: str(data.share_image),
    claim: buildClaim(data.claim),
    body: content,
    readingTime: computeReadingTime(content),
  }
}

export function buildDispatch(file, raw) {
  const { data, content } = parseFrontmatter(raw)
  const number = Number.isInteger(data.number) ? data.number : null
  const title = str(data.title)
  return {
    ...common(DISPATCH, file, data, content),
    number,
    subject: str(data.subject) || `SBI Dispatch No. ${number} · ${title}`,
    email: str(data.email) || 'none',
    sendAt: str(data.send_at),
    authors: str(data.authors),
    lens: str(data.lens),
  }
}

export function buildLens(file, raw) {
  const { data, content } = parseFrontmatter(raw)
  const updates = list(data.updates)
    .filter((u) => u && typeof u === 'object')
    .map((u) => ({ at: str(u.at), note: str(u.note) }))
    .sort((a, b) => (toInstant(b.at) || 0) - (toInstant(a.at) || 0))
  const sources = list(data.sources)
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({ title: str(s.title), url: str(s.url), kind: str(s.kind) }))
  // Primary sources first, otherwise the order written in the file.
  const ordered = [...sources.filter((s) => s.kind === 'primary'), ...sources.filter((s) => s.kind !== 'primary')]
  return {
    ...common(LENS, file, data, content),
    dek: str(data.dek),
    factsAsOf: str(data.facts_as_of),
    instrument: str(data.instrument),
    sources: ordered,
    updates,
    updatedAt: updates.length ? updates[0].at : '',
    dispatch: Number.isInteger(data.dispatch) ? data.dispatch : null,
  }
}

// Explainers keep their own, older frontmatter (see src/lib/insights.js).
export function buildExplainer(file, raw) {
  const { data, content } = parseFrontmatter(raw)
  const slug = str(data.slug) || slugFromFile(file)
  const date = str(data.date)
  return {
    series: EXPLAINER,
    slug,
    path: piecePath(EXPLAINER, slug),
    title: str(data.title),
    subtitle: str(data.subtitle),
    summary: str(data.summary),
    date,
    formattedDate: formatDate(date),
    status: str(data.status) || 'published',
    author: str(data.author),
    tags: list(data.tags).filter((t) => typeof t === 'string'),
    heroImage: str(data.hero_image),
    shareImage: '',
    claim: null,
    body: content,
    readingTime: computeReadingTime(content),
  }
}

export const BUILDERS = { [DISPATCH]: buildDispatch, [LENS]: buildLens, [EXPLAINER]: buildExplainer }

// A file is published only when it says so. Explainers written before the
// `status` field existed have none and count as published.
export function isPublishedSource(series, raw) {
  const { data } = parseFrontmatter(raw)
  if (series === EXPLAINER && data.status === undefined) return true
  return data.status === 'published'
}

// ------------------------------------------------------------ Ordering

export const byNumberDesc = (a, b) => (b.number ?? -1) - (a.number ?? -1) || b.slug.localeCompare(a.slug)

export const byDateDesc = (a, b) =>
  (toInstant(b.date) || 0) - (toInstant(a.date) || 0) ||
  (toInstant(b.factsAsOf || '') || 0) - (toInstant(a.factsAsOf || '') || 0) ||
  b.slug.localeCompare(a.slug)

// The n most recent pieces of all series together, newest first.
export function latestOf(pieces, n) {
  return [...pieces].sort(byDateDesc).slice(0, n)
}

// When the piece last changed: the latest dated update of a Lens piece,
// otherwise its publication date.
export function modifiedOf(piece) {
  return piece.updatedAt && toInstant(piece.updatedAt) > toInstant(piece.date) ? piece.updatedAt : piece.date
}

// Every checkable statement made in a Dispatch issue or a Lens piece.
export function collectClaims(pieces) {
  return pieces
    .filter((p) => p.claim && p.claim.text)
    .map((p) => ({ ...p.claim, piece: p }))
    .sort((a, b) => (toInstant(b.made) || 0) - (toInstant(a.made) || 0) || a.piece.slug.localeCompare(b.piece.slug))
}

// First sentence of the body's first paragraph, as plain text. Used by the
// build checks to prove that a page really carries its article.
export function firstSentence(body) {
  let fenced = false
  const para = []
  for (const line of String(body || '').replace(/\r\n?/g, '\n').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      if (para.length) break
      continue
    }
    if (fenced) continue
    const t = line.trim()
    if (!t) {
      if (para.length) break
      continue
    }
    if (/^(#{1,6}\s|>|!\[|\||---+$|\*\*\*+$|[-*+]\s|\d+\.\s)/.test(t)) {
      if (para.length) break
      continue
    }
    para.push(t)
  }
  const text = stripInlineMarkdown(para.join(' ')).replace(/\s+/g, ' ')
  const m = text.match(/^(.+?[.!?])(\s|$)/)
  return (m ? m[1] : text).trim()
}
