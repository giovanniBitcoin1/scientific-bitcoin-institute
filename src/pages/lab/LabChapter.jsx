import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import sims from '../../components/lab/sims/index.js'
import modules from '../../data/lab/modules.json'

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

const COPY = {
  en: {
    module: 'Module',
    sim: 'Interactive simulation',
    all: '← All modules',
    next: 'Next module →',
    comingSoon: 'Coming soon',
    notFound: 'Module not available',
    notFoundText:
      "This module doesn't exist or hasn't been published yet. New modules are added regularly.",
    back: '← Back to the Complexity Lab',
  },
  it: {
    module: 'Modulo',
    sim: 'Simulazione interattiva',
    all: '← Tutti i moduli',
    next: 'Modulo successivo →',
    comingSoon: 'In arrivo',
    notFound: 'Modulo non disponibile',
    notFoundText:
      'Questo modulo non esiste o non è ancora stato pubblicato. Nuovi moduli vengono aggiunti regolarmente.',
    back: '← Torna al Complexity Lab',
  },
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

function NotFound({ c, lang, setLang }) {
  return (
    <section className="max-w-2xl mx-auto px-6 text-center">
      <div className="flex justify-center mb-8">
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
        Complexity Lab
      </p>
      <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
        {c.notFound}
      </h1>
      <p className="mt-6 text-slate-700 leading-relaxed">{c.notFoundText}</p>
      <Link to="/lab" className={`inline-block mt-6 ${orangeLink}`}>
        {c.back}
      </Link>
    </section>
  )
}

export default function LabChapter() {
  const { slug } = useParams()
  const [lang, setLang] = useLabLang()
  const c = COPY[lang]

  const index = modules.findIndex((m) => m.slug === slug)
  const mod = index >= 0 && modules[index].status === 'ready' ? modules[index] : null
  const lecture = mod ? getLecture(mod.slug, lang) || getLecture(mod.slug, 'en') : null
  const Sim = mod ? sims[mod.slug] : null
  const next = index >= 0 ? modules[index + 1] : null

  useEffect(() => {
    document.title = mod
      ? `${mod.number} · ${mod.title_en} — Complexity Lab — Scientific Bitcoin Institute`
      : 'Complexity Lab — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta && mod) meta.setAttribute('content', mod.summary_en)
  }, [mod])

  if (!mod || !lecture) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28 pb-24">
          <NotFound c={c} lang={lang} setLang={setLang} />
        </main>
        <Footer />
      </div>
    )
  }

  const title = lang === 'en' ? mod.title_en : mod.title_it

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
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
      </main>

      <Footer />
    </div>
  )
}
