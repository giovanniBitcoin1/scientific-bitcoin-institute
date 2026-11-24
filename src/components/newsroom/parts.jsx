// Small shared pieces of the Insights pages (hub, archives, issue and article
// pages).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../Header.jsx'
import Footer from '../Footer.jsx'
import { DISPATCH, LENS, SERIES_LABEL } from '../../lib/newsroom-core.js'
import { renderNewsroomMarkdown } from '../../lib/newsroomMarkdown.js'
import { resolveInsightImage } from '../../lib/insightImages.js'

export const eyebrowClass = 'text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono'
export const orangeLink = 'text-orange-600 hover:text-orange-700 underline'

// The body of a Dispatch issue or a Lens piece.
export function PieceBody({ piece }) {
  return renderNewsroomMarkdown({ body: piece.body, series: piece.series, slug: piece.slug, linkAs: Link })
}

// Drafts exist only in `npm run dev:drafts`; this makes them impossible to
// mistake for published pages.
export function DraftRibbon({ piece }) {
  if (!piece || !piece.isDraft) return null
  return (
    <div
      role="status"
      className="fixed bottom-0 inset-x-0 z-[60] bg-red-600 text-white text-center font-mono text-sm font-semibold uppercase tracking-wider py-2"
    >
      Draft — not published
    </div>
  )
}

export function DraftBadge({ piece }) {
  if (!piece || !piece.isDraft) return null
  return (
    <span className="inline-block bg-red-600 text-white text-xs font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
      Draft
    </span>
  )
}

// "Dispatch", "The Lens" or "Explainer".
export function SeriesBadge({ series }) {
  return (
    <span className="inline-block self-start bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
      {SERIES_LABEL[series]}
    </span>
  )
}

// One line under a card title: what kind of piece, and when.
function metaLine(piece) {
  if (piece.series === DISPATCH) return `No. ${piece.number} · ${piece.formattedDate}`
  if (piece.series === LENS) return piece.formattedDate
  return [piece.formattedDate, piece.readingTime].filter(Boolean).join(' · ')
}

// A piece of any series as a card. `image` shows an Explainer's hero on top.
export function PieceCard({ piece, image = false }) {
  const heroUrl = image && piece.heroImage ? resolveInsightImage(piece.slug, piece.heroImage) : ''
  return (
    <Link
      to={piece.path}
      className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:border-orange-300 hover:shadow-md transition flex flex-col"
    >
      {heroUrl ? (
        <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
          <img
            src={heroUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : null}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <SeriesBadge series={piece.series} />
          <DraftBadge piece={piece} />
        </div>
        <h3 className="font-serif text-xl mt-3 text-slate-900 leading-snug group-hover:text-orange-700 transition-colors">
          {piece.title}
        </h3>
        <p className="text-slate-600 text-sm mt-2 line-clamp-3">{piece.summary}</p>
        <p className="text-slate-500 text-xs mt-auto pt-4">{metaLine(piece)}</p>
      </div>
    </Link>
  )
}

export function CardGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{children}</div>
}

// One row of an archive list: a mono column on the left, title and summary.
export function ArchiveRow({ piece, label }) {
  return (
    <Link to={piece.path} className="group block">
      <article className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-8 py-6 border-b border-slate-200">
        <p className={`${eyebrowClass} leading-relaxed`}>
          {label}
          <span className="block">{piece.formattedDate}</span>
        </p>
        <div>
          <h2 className="font-serif text-2xl text-slate-900 leading-tight group-hover:text-orange-700 transition-colors">
            {piece.title} <DraftBadge piece={piece} />
          </h2>
          <p className="text-slate-700 text-base mt-2 leading-relaxed">{piece.summary}</p>
        </div>
      </article>
    </Link>
  )
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

export function NotFound({ title, text, backTo, backLabel }) {
  return (
    <PageShell>
      <main className="pt-28 pb-24">
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl font-semibold text-slate-900">{title}</h1>
          <p className="text-slate-600 mt-4">{text}</p>
          <Link to={backTo} className={`inline-block mt-8 ${orangeLink}`}>
            {backLabel}
          </Link>
        </section>
      </main>
    </PageShell>
  )
}

// The active section is the last H2 whose top edge has passed 30% of the
// viewport height (same rule as the Explainer pages).
function useActiveSection(sections) {
  const [activeId, setActiveId] = useState('')
  const key = sections.map((s) => s.id).join('|')

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!els.length) return undefined
    const compute = () => {
      const line = window.innerHeight * 0.3
      let current = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top - line <= 1) current = el.id
        else break
      }
      setActiveId(current)
    }
    const observer = new IntersectionObserver(compute, { rootMargin: '0px 0px -70% 0px', threshold: 0 })
    els.forEach((el) => observer.observe(el))
    compute()
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}

// Table of contents built from the H2 headings. A sticky column on wide
// screens; `inline` gives the boxed list shown above the text on small ones.
export function TableOfContents({ sections, inline = false, title = 'In this issue' }) {
  const activeId = useActiveSection(sections)
  if (!sections.length) return null
  if (inline) {
    return (
      <nav aria-label="Table of contents" className="lg:hidden mt-8 bg-white border border-slate-200 rounded-lg p-5">
        <p className={eyebrowClass}>{title}</p>
        <ul className="mt-3 space-y-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-sm text-slate-700 hover:text-orange-600">
                {s.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
  return (
    <aside className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className={eyebrowClass}>{title}</p>
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

// Plain share links: ordinary anchors to each service's share address, and a
// button that copies the page address. No third-party script is loaded.
export function ShareLinks({ url, title }) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    ['X', `https://x.com/intent/post?url=${u}&text=${t}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['Telegram', `https://t.me/share/url?url=${u}&text=${t}`],
  ]
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', url)
    }
  }
  const item = 'border border-slate-300 text-slate-700 rounded px-3 py-1.5 text-sm font-medium hover:border-orange-400 hover:text-orange-700 transition-colors'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`${eyebrowClass} mr-1`}>Share</span>
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={item}>
          {label}
        </a>
      ))}
      <button type="button" onClick={copy} className={item}>
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  )
}
