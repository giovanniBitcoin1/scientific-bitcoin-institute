// The readable HTML placed inside <div id="root"> of every static page by
// scripts/newsroom/postbuild.mjs. A crawler, a link-preview bot or a reader
// without JavaScript gets the article; the React app replaces it on start.
//
// Never imported by the app. It lives in src/ only so that Tailwind sees its
// class names: the fallback uses the same shell and typography as the real
// pages, so there is no flash of unstyled content before React takes over.
import { createElement as h } from 'react'
import { DISPATCH, LENS, formatDate, formatDateTime } from './newsroom-core.js'
import { renderNewsroomMarkdown } from './newsroomMarkdown.js'

const eyebrow = 'text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono'
const link = 'text-orange-600 hover:text-orange-700 underline'

const shell = (...children) =>
  h('div', { className: 'min-h-screen bg-slate-50', 'data-static-fallback': '' }, h('main', { className: 'pt-28 pb-24' }, ...children))

function eyebrowOf(piece) {
  if (piece.series === DISPATCH) return `SBI Dispatch · No. ${piece.number} · ${piece.formattedDate}`
  if (piece.series === LENS) return `The Lens · ${piece.formattedDate}`
  return `Explainer · ${piece.formattedDate}`
}

/**
 * An article. `origin` makes every URL absolute; `resolveImage` (optional)
 * maps an image reference to its URL (Explainers keep their images elsewhere).
 */
export function articleFallback({ piece, origin, resolveImage }) {
  return shell(
    h(
      'header',
      { className: 'max-w-3xl mx-auto px-6 mt-8' },
      h('p', { className: eyebrow }, eyebrowOf(piece)),
      h('h1', { className: 'font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-3' }, piece.title),
      piece.dek || piece.subtitle
        ? h('p', { className: 'text-slate-700 text-xl md:text-2xl mt-4 leading-snug font-light italic' }, piece.dek || piece.subtitle)
        : null,
      h('p', { className: 'text-slate-700 text-lg leading-relaxed mt-6' }, piece.summary),
      piece.factsAsOf ? h('p', { className: 'text-slate-600 text-sm mt-4' }, `Facts as of ${formatDateTime(piece.factsAsOf)}`) : null,
      piece.updatedAt ? h('p', { className: 'text-slate-600 text-sm mt-1' }, `Updated ${formatDate(piece.updatedAt)}`) : null,
    ),
    h(
      'article',
      { className: 'max-w-3xl mx-auto px-6 mt-8' },
      renderNewsroomMarkdown({ body: piece.body, series: piece.series, slug: piece.slug, origin, resolveImage }),
      piece.updates && piece.updates.length
        ? h(
            'section',
            { className: 'mt-12' },
            h('h2', { className: 'font-serif text-2xl md:text-3xl text-slate-900 font-semibold' }, 'Updates'),
            h(
              'ul',
              { className: 'mt-4 space-y-4' },
              piece.updates.map((u) =>
                h('li', { key: u.at, className: 'border-l-2 border-orange-400 pl-4 text-slate-700' }, `${formatDateTime(u.at)} — ${u.note}`),
              ),
            ),
          )
        : null,
      piece.sources && piece.sources.length
        ? h(
            'section',
            { className: 'mt-12' },
            h('h2', { className: 'font-serif text-2xl md:text-3xl text-slate-900 font-semibold' }, 'Sources'),
            h(
              'ol',
              { className: 'mt-4 list-decimal pl-6 space-y-2 text-slate-700' },
              piece.sources.map((s) => h('li', { key: s.url }, h('a', { href: s.url, className: link }, s.title), ` · ${s.kind}`)),
            ),
          )
        : null,
      piece.instrument ? h('p', { className: 'mt-10 text-slate-700' }, `Instrument: ${piece.instrument}`) : null,
    ),
  )
}

/**
 * A page that is not an article: heading, paragraphs, and a list of links
 * ({ href, title, note }).
 */
export function pageFallback({ eyebrowText, heading, paragraphs = [], links = [], origin }) {
  return shell(
    h(
      'section',
      { className: 'max-w-4xl mx-auto px-6 text-center' },
      eyebrowText ? h('p', { className: eyebrow }, eyebrowText) : null,
      h('h1', { className: 'font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4' }, heading),
      paragraphs.map((text, i) =>
        h('p', { key: i, className: 'text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto' }, text),
      ),
    ),
    links.length
      ? h(
          'section',
          { className: 'max-w-3xl mx-auto mt-12 px-6' },
          h(
            'ul',
            { className: 'space-y-6' },
            links.map((l) =>
              h(
                'li',
                { key: l.href },
                h('a', { href: origin + l.href, className: 'font-serif text-2xl text-slate-900 leading-tight' }, l.title),
                l.note ? h('p', { className: 'text-slate-700 text-base mt-2 leading-relaxed' }, l.note) : null,
              ),
            ),
          ),
        )
      : null,
  )
}
