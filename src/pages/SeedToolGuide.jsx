import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import guideRaw from '../content/seed-tool/kit-usage-and-safety-guide.md?raw'

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="font-serif text-3xl md:text-4xl mt-12 mb-6 text-slate-900 font-semibold">
      {children}
    </h1>
  ),
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
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 text-slate-700 my-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-slate-700 my-4">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href = '', children }) => {
    const isExternal = href.startsWith('http')
    return (
      <a
        href={href}
        className="text-orange-600 hover:text-orange-700 underline"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
  code: ({ children }) => (
    <code className="font-mono text-sm bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 break-all">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="font-mono text-sm bg-slate-100 text-slate-800 rounded-lg p-4 my-6 overflow-x-auto">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-slate-300 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-300 px-4 py-2 text-slate-700">{children}</td>
  ),
  hr: () => <hr className="my-10 border-t border-slate-200" />,
}

export default function SeedToolGuide() {
  useEffect(() => {
    document.title = 'Using the Kit Safely — Seed Tool — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'Why you must download the Physical Entropy Seed Kit app — and what to do with the seed afterwards. The Scientific Bitcoin Institute safety guide.'
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24 px-6">
        {/* Header */}
        <section className="max-w-3xl mx-auto">
          <Link
            to="/seed-tool"
            className="text-slate-600 hover:text-orange-600 text-sm"
          >
            ← Back to Seed Tool
          </Link>
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono mt-6">
            Scientific Bitcoin Institute · Seed Tool
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-4">
            Using the Kit Safely
          </h1>
          <p className="text-slate-700 text-lg mt-4 italic">
            Why you must download the app — and what to do with the seed afterwards.
          </p>
        </section>

        <SectionDivider />

        {/* Markdown body */}
        <article className="max-w-3xl mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {guideRaw}
          </ReactMarkdown>
        </article>

        {/* Bottom back link */}
        <div className="mt-16">
          <SectionDivider />
          <div className="max-w-3xl mx-auto text-center">
            <Link to="/seed-tool" className="text-orange-600 hover:text-orange-700 underline">
              ← Back to Seed Tool
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
