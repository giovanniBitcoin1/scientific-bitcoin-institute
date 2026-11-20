// Markdown renderer for Dispatch issues and Lens pieces.
//
// Written with createElement instead of JSX on purpose: the same file is
// imported by the pages and, in Node, by scripts/newsroom/ (static fallback,
// feed, validator). One renderer, so what a crawler reads and what a visitor
// sees come from the same code. The class names live here, inside src/, so
// Tailwind includes them in the stylesheet.
import { createElement as h } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { mediaUrl, slugify } from './newsroom-core.js'

const ALLOWED_INLINE_HTML = { '<sub>': 'sub', '<sup>': 'sup' }

// The markdown may use <sub> and <sup> (β<sub>A</sub>); nothing else. This
// rehype step turns those two pairs into real elements and hands every other
// piece of raw HTML to `onRaw`, so the validator can refuse it. react-markdown
// would otherwise print it as text.
export function rehypeNewsroom({ onRaw } = {}) {
  const walk = (node) => {
    if (!node || !Array.isArray(node.children)) return
    const out = []
    const kids = node.children
    for (let i = 0; i < kids.length; i++) {
      const kid = kids[i]
      const tag = kid.type === 'raw' ? ALLOWED_INLINE_HTML[String(kid.value).trim().toLowerCase()] : null
      if (tag) {
        const close = kids.findIndex((k, j) => j > i && k.type === 'raw' && String(k.value).trim().toLowerCase() === `</${tag}>`)
        if (close !== -1) {
          out.push({ type: 'element', tagName: tag, properties: {}, children: kids.slice(i + 1, close) })
          i = close
          continue
        }
      }
      if (kid.type === 'raw') {
        if (onRaw) onRaw(String(kid.value))
        continue
      }
      out.push(kid)
    }
    node.children = out
    out.forEach(walk)
  }
  return (tree) => walk(tree)
}

function nodeToText(children) {
  if (children == null) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(nodeToText).join('')
  if (typeof children === 'object' && children.props) return nodeToText(children.props.children)
  return ''
}

const LINK_CLASS = 'text-orange-600 hover:text-orange-700 underline break-words'

const isMath = (className) => typeof className === 'string' && /\blanguage-math\b/.test(className)

// `resolveImage(src)` maps "images/x.png" to the URL to load.
function components(resolveImage) {
  return {
    h1: ({ children }) =>
      h('h2', { className: 'font-serif text-3xl md:text-4xl mt-12 mb-6 text-slate-900 font-semibold' }, children),
    h2: ({ children }) =>
      h(
        'h2',
        {
          id: slugify(nodeToText(children)),
          className: 'font-serif text-2xl md:text-3xl mt-12 mb-4 text-slate-900 font-semibold scroll-mt-28',
        },
        children,
      ),
    h3: ({ children }) => h('h3', { className: 'font-serif text-xl mt-8 mb-3 text-slate-900 font-semibold' }, children),
    p: ({ children }) => h('p', { className: 'font-sans text-base leading-relaxed text-slate-700 my-4' }, children),
    ul: ({ children }) => h('ul', { className: 'list-disc pl-6 space-y-2 text-slate-700 my-4' }, children),
    ol: ({ children }) => h('ol', { className: 'list-decimal pl-6 space-y-2 text-slate-700 my-4' }, children),
    li: ({ children }) => h('li', { className: 'leading-relaxed' }, children),
    strong: ({ children }) => h('strong', { className: 'font-semibold text-slate-900' }, children),
    em: ({ children }) => h('em', { className: 'italic' }, children),
    a: ({ href = '', children }) =>
      h(
        'a',
        {
          href,
          className: LINK_CLASS,
          ...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
        children,
      ),
    // A blockquote is a callout box.
    blockquote: ({ children }) =>
      h(
        'blockquote',
        {
          className:
            'my-6 rounded-lg border border-orange-200 border-l-4 border-l-orange-500 bg-orange-50/60 px-5 py-1',
        },
        children,
      ),
    table: ({ children }) =>
      h(
        'div',
        { className: 'my-6 overflow-x-auto' },
        h('table', { className: 'table-auto w-full border-collapse border border-slate-300 text-sm' }, children),
      ),
    thead: ({ children }) => h('thead', { className: 'bg-slate-100' }, children),
    th: ({ children }) =>
      h('th', { className: 'border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900' }, children),
    td: ({ children }) => h('td', { className: 'border border-slate-300 px-4 py-2 text-slate-700' }, children),
    hr: () => h('hr', { className: 'my-10 border-t border-slate-200' }),
    // Display formulas are ```math fences holding plain Unicode text. Other
    // fences are ordinary code blocks.
    pre: ({ children }) => {
      const child = Array.isArray(children) ? children[0] : children
      const math = isMath(child?.props?.className)
      return h(
        'pre',
        {
          className: math
            ? 'my-6 overflow-x-auto rounded-lg bg-white border border-slate-200 px-4 py-4 text-center font-mono text-base md:text-lg text-slate-900 whitespace-pre'
            : 'my-6 overflow-x-auto rounded-lg bg-slate-900 px-4 py-4 font-mono text-sm text-slate-100 whitespace-pre',
        },
        children,
      )
    },
    code: ({ className, children }) =>
      className && className.startsWith('language-')
        ? h('code', { className }, children)
        : h(
            'code',
            { className: 'font-mono text-[0.92em] text-slate-900 bg-slate-100 rounded px-1.5 py-0.5 break-words' },
            children,
          ),
    img: ({ src = '', alt = '', title }) =>
      h(
        'span',
        { className: 'block my-8' },
        h('img', { src: resolveImage(src), alt, loading: 'lazy', className: 'w-full h-auto rounded-lg shadow-md' }),
        title ? h('span', { className: 'block italic text-slate-600 text-sm mt-3 text-center' }, title) : null,
      ),
  }
}

/**
 * The body of a Dispatch issue or a Lens piece as a React element.
 *
 * - `series`, `slug`: where the piece's media live.
 * - `origin`: when given ("https://example.org"), image and internal link URLs
 *   are made absolute (static fallback, feed).
 * - `linkAs`: a component (react-router's Link) used for links that start
 *   with "/", so they navigate inside the app instead of reloading the page.
 * - `onRaw`, `onImage`: collectors used by the validator (with `onImage` the
 *   images are reported instead of rendered).
 * A single "~" is kept as written ("~100"); only "~~text~~" strikes through.
 */
export function renderNewsroomMarkdown({ body, series, slug, origin = '', linkAs, onRaw, onImage }) {
  const resolveImage = (src) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return src
    return origin + mediaUrl(series, slug, src)
  }
  const map = components(resolveImage)
  if (onImage) {
    // The validator needs alt and title too.
    map.img = ({ src = '', alt = '', title }) => {
      onImage({ src, alt, title: title || '' })
      return null
    }
  }
  if (linkAs) {
    const link = map.a
    map.a = (props) =>
      props.href && props.href.startsWith('/') && !props.href.startsWith('//')
        ? h(linkAs, { to: props.href, className: LINK_CLASS }, props.children)
        : link(props)
  }
  if (origin) {
    const link = map.a
    map.a = (props) => link({ ...props, href: props.href && props.href.startsWith('/') ? origin + props.href : props.href })
  }
  return h(
    ReactMarkdown,
    { remarkPlugins: [[remarkGfm, { singleTilde: false }]], rehypePlugins: [[rehypeNewsroom, { onRaw }]], components: map },
    body || '',
  )
}

export default renderNewsroomMarkdown
