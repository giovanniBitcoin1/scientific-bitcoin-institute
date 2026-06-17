import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import { getArticleBySlug } from '../lib/insights.js'
import { resolveInsightImage } from '../lib/insightImages.js'
import { useArticleSEO } from '../lib/seo.js'

// Slugify heading text into an id: lowercase, non-alphanumerics → hyphens,
// collapse repeats, trim leading/trailing hyphens.
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Flatten react-markdown heading children (string | node | array) to plain text.
function nodeToText(children) {
  if (children == null) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(nodeToText).join('')
  if (typeof children === 'object' && children.props) return nodeToText(children.props.children)
  return ''
}

// Build the table of contents from the markdown body: h2 headings only
// (lines beginning with exactly "## "). h3 subsections are intentionally excluded.
function extractToc(body) {
  const toc = []
  for (const line of (body || '').split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) {
      const text = m[1].replace(/\*\*/g, '').trim()
      if (text) toc.push({ text, id: slugify(text) })
    }
  }
  return toc
}

// Track the active section via IntersectionObserver: the active section is the
// topmost h2 whose top edge is at or above ~30% of the viewport height.
function useActiveSection(sections) {
  const [activeId, setActiveId] = useState('')
  const key = sections.map((s) => s.id).join('|')

  useEffect(() => {
    if (!sections.length) return
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!els.length) return

    const compute = () => {
      const line = window.innerHeight * 0.3
      let current = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top - line <= 1) {
          current = el.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    const observer = new IntersectionObserver(compute, {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0,
    })
    els.forEach((el) => observer.observe(el))
    compute()

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}

function TableOfContents({ sections, activeId }) {
  if (!sections.length) return null
  return (
    <aside className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          On this page
        </p>
        <nav className="mt-3">
          <ul>
            {sections.map((s) => {
              const isActive = s.id === activeId
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    className={
                      'block py-2 text-sm transition-colors ' +
                      (isActive
                        ? 'text-orange-600 font-medium border-l-2 border-orange-500 pl-3'
                        : 'text-slate-600 hover:text-orange-600 pl-3.5')
                    }
                  >
                    {s.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

function makeMarkdownComponents(slug) {
  return {
    h1: ({ children }) => (
      <h1 className="font-serif text-3xl md:text-4xl mt-12 mb-6 text-slate-900 max-w-3xl mx-auto">
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = slugify(nodeToText(children))
      return (
        <h2
          id={id}
          className="font-serif text-2xl md:text-3xl mt-12 mb-4 text-slate-900 font-semibold max-w-3xl mx-auto scroll-mt-28"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }) => (
      <h3 className="font-serif text-xl mt-8 mb-3 text-slate-900 font-semibold max-w-3xl mx-auto">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="font-sans text-base leading-relaxed text-slate-700 my-4 max-w-3xl mx-auto">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 text-slate-700 my-4 max-w-3xl mx-auto">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 text-slate-700 my-4 max-w-3xl mx-auto">
        {children}
      </ol>
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
      <blockquote className="border-l-4 border-orange-400 pl-4 italic text-slate-600 my-6 max-w-3xl mx-auto">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="max-w-4xl mx-auto my-6 overflow-x-auto">
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
    hr: () => <hr className="my-10 border-t border-slate-200 max-w-3xl mx-auto" />,
    img: ({ src = '', alt = '', title }) => {
      const resolved = resolveInsightImage(slug, src)
      return (
        <span className="block my-8 max-w-4xl mx-auto">
          <img src={resolved || src} alt={alt} className="w-full h-auto rounded-lg shadow-md" />
          {title ? (
            <span className="block italic text-slate-600 text-sm mt-3 text-center">{title}</span>
          ) : null}
        </span>
      )
    },
  }
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-28 pb-24">
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl font-semibold text-slate-900">Article not found</h1>
          <p className="text-slate-600 mt-4">
            We couldn't find the Insights article you were looking for.
          </p>
          <Link
            to="/insights"
            className="inline-block mt-8 text-orange-600 hover:text-orange-700 underline"
          >
            ← All Insights articles
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function InsightArticle() {
  const { slug } = useParams()
  const article = getArticleBySlug(slug)

  useArticleSEO(article)

  // Hooks must run unconditionally (before the NotFound early return).
  const sections = useMemo(() => extractToc(article?.body || ''), [article?.body])
  const activeId = useActiveSection(sections)

  if (!article) return <NotFound />

  const heroUrl = resolveInsightImage(article.slug, article.heroImage)
  const components = makeMarkdownComponents(article.slug)
  const publishMonthYear = article.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* 1. Tier badge strip (page level, outside the article+sidebar grid) */}
        <div className="bg-slate-100 border-y border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-3 text-center">
            <p className="text-slate-600 text-xs uppercase tracking-wider">
              Explainer · Accessible analysis, not peer-reviewed research
            </p>
            <Link
              to="/research/publications"
              className="text-orange-600 hover:text-orange-700 text-xs mt-1 inline-block"
            >
              See the Institute's peer-reviewed Publications →
            </Link>
          </div>
        </div>

        {/* Article + sidebar: single column below lg, two-column grid at lg and up */}
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 lg:max-w-6xl lg:mx-auto">
          {/* Main column */}
          <div className="min-w-0">
            {/* 2. Article header */}
            <header className="max-w-3xl mx-auto px-6 mt-12">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Scientific Bitcoin Institute · Insights · Explainer
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-3">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-slate-700 text-xl md:text-2xl mt-4 leading-snug font-light italic">
                  {article.subtitle}
                </p>
              )}
              <p className="text-slate-500 text-sm mt-6">
                {[article.author, article.formattedDate, article.readingTime]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 3. Hero image */}
            {heroUrl && (
              <div className="max-w-4xl mx-auto px-6 mt-10">
                <img
                  src={heroUrl}
                  alt={article.title}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* 4. Body */}
            <article className="max-w-4xl mx-auto px-6 mt-10">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {article.body}
              </ReactMarkdown>
            </article>

            {/* 5. Newsletter reminder */}
            <SectionDivider />
            <div className="max-w-2xl mx-auto bg-slate-50 rounded-lg p-6 mt-12 text-center">
              <p className="text-slate-700">
                Get new Insights articles in your inbox. The Institute's monthly dispatch covers
                research, events, and analyses.
              </p>
            </div>
            <NewsletterSignup />

            {/* 6. Disclaimer footer */}
            <SectionDivider />
            <div className="max-w-3xl mx-auto mt-10 bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-wider text-slate-500">
                Disclaimer
              </h2>
              <p className="text-slate-600 text-sm italic mt-3">
                This article is an educational explainer published by the Scientific Bitcoin
                Institute. It is not financial, legal, or investment advice. Figures are illustrative
                and reflect conditions as of {publishMonthYear}. Prices, rates, and balance-sheet
                details change continuously. Do your own research and consult a licensed professional
                before making any investment decision.
              </p>
            </div>
          </div>

          {/* Table-of-contents sidebar (right column, lg and up only) */}
          <TableOfContents sections={sections} activeId={activeId} />
        </div>

        {/* 7. Back to insights (page level, outside the grid) */}
        <div className="max-w-3xl mx-auto px-6 mt-10">
          <Link to="/insights" className="text-orange-600 hover:text-orange-700 underline">
            ← All Insights articles
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
