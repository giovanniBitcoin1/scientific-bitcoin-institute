import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import issues from '../data/newsletterIssues.json'

function SectionDivider() {
  return (
    <div className="my-20 flex justify-center" aria-hidden="true">
      <div className="h-px w-24 bg-orange-500/60" />
    </div>
  )
}

function ScrollToHash() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hash])
  return null
}

function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLongDateUpper(iso) {
  return parseIsoDate(iso)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase()
}

function IssueCard({ issue }) {
  return (
    <Link
      to={`/news/newsletter/${issue.slug}`}
      className="block rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
    >
      <article className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-8 py-6 border-b border-slate-100">
        <div>
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono leading-relaxed">
            Issue #{issue.issueNumber}
            <span className="block">{formatLongDateUpper(issue.date)}</span>
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-slate-900 leading-tight">{issue.title}</h2>
          <p className="text-slate-700 text-base mt-2 leading-relaxed">{issue.summary}</p>
          <p className="mt-3 text-sm font-semibold text-orange-600">Read this issue →</p>
        </div>
      </article>
    </Link>
  )
}

export default function NewsletterIndex() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Newsletter
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Dispatches
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            The Institute's monthly newsletter on the rigorous scientific study of Bitcoin — new research,
            publications, and developments in the analysis of Bitcoin as a complex adaptive system. Past issues are
            archived below. Subscribe at the bottom of the page or on the home page to receive future dispatches in
            your inbox.
          </p>
        </section>

        {/* Issue list */}
        <section className="max-w-3xl mx-auto mt-12 px-6">
          <div className="space-y-8">
            {issues.map((issue) => (
              <IssueCard key={issue.issueNumber} issue={issue} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Signup */}
        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
