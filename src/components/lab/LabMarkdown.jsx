import { createContext, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Markdown renderer shared by every lab: lecture text, "what to observe"
// lists, exercises. Beyond plain markdown it understands three fenced blocks:
//
//   ```math     a display equation (inline ones use `backticks`)
//   ```figure   a live figure: the body is the figure's id in the module's
//               `figures` map ({ id: { Component, caption: { en, it } } })
//   ```box      an optional box: the first line is its title, the rest is
//               markdown
//
// `figures` and `lang` travel through a context so the component map below
// stays the same object on every render and a figure keeps its state.
const LabContext = createContext({ figures: null, lang: 'en' })

const BOX = { en: 'Optional', it: 'Facoltativo' }

// A small interactive figure inside the lecture: about 340 px tall at most,
// full width on mobile, with a one-line caption.
function LiveFigure({ id }) {
  const { figures, lang } = useContext(LabContext)
  const fig = figures && figures[id]
  if (!fig) return null
  const { Component, caption } = fig
  return (
    <figure className="my-8">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 overflow-hidden">
        <Component lang={lang} />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-slate-500 leading-snug text-center">
          {caption[lang] || caption.en}
        </figcaption>
      )}
    </figure>
  )
}

function OptionalBox({ text }) {
  const { lang } = useContext(LabContext)
  const [title, ...body] = text.trim().split('\n')
  return (
    <aside className="my-8 rounded-xl border border-slate-200 border-l-4 border-l-orange-400 bg-slate-50 px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
        {BOX[lang] || BOX.en}
      </p>
      <p className="font-serif text-xl font-semibold text-slate-900 mt-1">{title}</p>
      <div className="text-[0.95rem]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {body.join('\n')}
        </ReactMarkdown>
      </div>
    </aside>
  )
}

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="font-serif text-2xl md:text-3xl mt-12 mb-4 text-slate-900 font-semibold">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-xl mt-8 mb-3 text-slate-900 font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="font-sans text-base leading-relaxed text-slate-700 my-4">{children}</p>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 text-slate-700 my-4">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-slate-700 my-4">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href = '', children }) => {
    if (href.startsWith('/')) {
      return (
        <Link to={href} className="text-orange-600 hover:text-orange-700 underline">
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        className="text-orange-600 hover:text-orange-700 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-orange-400 pl-4 italic text-slate-600 my-6">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-t border-slate-200" />,
  // Tables (remark-gfm) scroll inside their own box if they are wider than the column.
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-xs sm:text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-slate-50 border-b border-slate-200 px-2 sm:px-3 py-2 text-left align-bottom font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-2 sm:px-3 py-2 align-top text-slate-700 leading-snug">{children}</td>
  ),
  // Fenced blocks. Display equations are ```math; ```figure and ```box are
  // replaced by a live figure and an optional box.
  pre: ({ children }) => {
    const kind = children?.props?.className
    if (kind === 'language-figure' || kind === 'language-box') {
      const text = String(children.props.children ?? '')
      return kind === 'language-figure' ? <LiveFigure id={text.trim()} /> : <OptionalBox text={text} />
    }
    return (
      <div className="my-6 overflow-x-auto rounded-lg bg-slate-50 border border-slate-200 px-4 py-4 text-center font-mono text-base md:text-lg text-slate-900">
        {children}
      </div>
    )
  },
  code: ({ className, children }) =>
    className && className.startsWith('language-') ? (
      <code className="whitespace-pre">{children}</code>
    ) : (
      <code className="font-mono text-[0.92em] text-slate-900 bg-slate-100 rounded px-1.5 py-0.5 break-words">
        {children}
      </code>
    ),
}

export default function LabMarkdown({ children, figures = null, lang = 'en' }) {
  const value = useMemo(() => ({ figures, lang }), [figures, lang])
  return (
    <LabContext.Provider value={value}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {children}
      </ReactMarkdown>
    </LabContext.Provider>
  )
}
