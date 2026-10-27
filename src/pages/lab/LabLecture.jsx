import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LangToggle from '../../components/lab/LangToggle.jsx'
import sims from '../../components/lab/sims/index.js'
import modules from '../../data/lab/modules.json'

// The unlocked body of a module page: lecture, simulation, follow-up and
// module navigation. LabChapter loads this file with a dynamic import only
// when the Lab is unlocked, so while it is locked neither the lecture text nor
// the sims are fetched.

// Lecture text: src/content/lab/<slug>.<lang>.md, split at a line holding only
// <!-- simulation --> into the lecture (before) and the follow-up (after).
const rawFiles = import.meta.glob('../../content/lab/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function getLecture(slug, lang) {
  const raw = rawFiles[`../../content/lab/${slug}.${lang}.md`]
  if (raw == null) return null
  const [before, ...rest] = raw.split(/^[ \t]*<!--\s*simulation\s*-->[ \t]*$/m)
  // Remaining HTML comments (e.g. the DRAFT marker) are editorial notes, not content.
  const clean = (s) => s.replace(/<!--[\s\S]*?-->/g, '').trim()
  return { part1: clean(before), part2: clean(rest.join('\n')) }
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

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
  // Display equations are fenced ```math blocks; inline equations use `backticks`.
  pre: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg bg-slate-50 border border-slate-200 px-4 py-4 text-center font-mono text-base md:text-lg text-slate-900">
      {children}
    </div>
  ),
  code: ({ className, children }) =>
    className && className.startsWith('language-') ? (
      <code className="whitespace-pre">{children}</code>
    ) : (
      <code className="font-mono text-[0.92em] text-slate-900 bg-slate-100 rounded px-1.5 py-0.5 break-words">
        {children}
      </code>
    ),
}

function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  )
}

export default function LabLecture({ mod, index, lang, setLang, c, notFound }) {
  const lecture = getLecture(mod.slug, lang) || getLecture(mod.slug, 'en')
  if (!lecture) return notFound

  const Sim = sims[mod.slug]
  const next = modules[index + 1]
  const title = lang === 'en' ? mod.title_en : mod.title_it

  return (
    <>
      {/* Title + lecture */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/lab" className={orangeLink}>
              {c.all}
            </Link>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <p className="mt-10 text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
            {c.module} {mod.number}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 leading-tight mt-3">
            {title}
          </h1>
          <article className="mt-8">
            <Markdown>{lecture.part1}</Markdown>
          </article>
        </div>
      </section>

      {/* Simulation */}
      {Sim && (
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              {c.sim}
            </p>
            <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-6">
              <Sim lang={lang} />
            </div>
          </div>
        </section>
      )}

      {/* Follow-up: what to observe, further reading */}
      {lecture.part2 && (
        <section className="bg-white border-y border-slate-200">
          <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <Markdown>{lecture.part2}</Markdown>
          </article>
        </section>
      )}

      {/* Module navigation */}
      <nav className="max-w-3xl mx-auto px-6 mt-12 flex flex-wrap items-center justify-between gap-4">
        <Link to="/lab" className={orangeLink}>
          {c.all}
        </Link>
        {next &&
          (next.status === 'ready' ? (
            <Link to={`/lab/${next.slug}`} className={orangeLink}>
              {c.next}
            </Link>
          ) : (
            <span className="text-slate-400 font-semibold" aria-disabled="true">
              {c.next}{' '}
              <span className="ml-1 text-[11px] uppercase tracking-wider font-mono">
                {c.comingSoon}
              </span>
            </span>
          ))}
      </nav>
    </>
  )
}
