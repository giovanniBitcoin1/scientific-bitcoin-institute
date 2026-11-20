import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import {
  DraftRibbon, NotFound, PageShell, PieceBody, TableOfContents, eyebrowClass, orangeLink,
} from '../components/newsroom/parts.jsx'
import { getDispatchBySlug, getDispatches, getLensBySlug } from '../lib/newsroom.js'
import { extractToc } from '../lib/newsroom-core.js'
import { usePieceSEO } from '../lib/seo.js'

function IssueLink({ issue, label, align }) {
  if (!issue) return <span />
  return (
    <Link
      to={issue.path}
      className={`group block bg-white border border-slate-200 rounded-lg p-5 hover:border-orange-300 hover:shadow-md transition ${align}`}
    >
      <span className={eyebrowClass}>
        {label} · No. {issue.number}
      </span>
      <span className="block font-serif text-lg text-slate-900 leading-snug mt-1 group-hover:text-orange-700">
        {issue.title}
      </span>
    </Link>
  )
}

export default function DispatchIssue() {
  const { slug } = useParams()
  const issue = getDispatchBySlug(slug)

  usePieceSEO(issue)
  const sections = useMemo(() => extractToc(issue?.body || ''), [issue?.body])

  if (!issue) {
    return (
      <NotFound
        title="Issue not found"
        text="We couldn't find the issue of SBI Dispatch you were looking for."
        backTo="/insights/dispatch"
        backLabel="← All issues of SBI Dispatch"
      />
    )
  }

  // getDispatches() is newest first: the previous issue is the next in the list.
  const issues = getDispatches()
  const index = issues.findIndex((d) => d.slug === issue.slug)
  const newer = index > 0 ? issues[index - 1] : null
  const older = index < issues.length - 1 ? issues[index + 1] : null
  const lens = issue.lens ? getLensBySlug(issue.lens) : null

  return (
    <PageShell>
      <ScrollToHash />
      <DraftRibbon piece={issue} />

      <main className="pt-28 pb-24">
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12 lg:max-w-6xl lg:mx-auto">
          <div className="min-w-0">
            <header className="max-w-3xl mx-auto px-6 mt-8">
              <p className={eyebrowClass}>
                <Link to="/insights/dispatch" className="hover:text-orange-700">
                  SBI Dispatch
                </Link>{' '}
                · No. {issue.number} · {issue.formattedDate}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-3">{issue.title}</h1>
              <p className="text-slate-500 text-sm mt-6">
                {[issue.authors, issue.readingTime].filter(Boolean).join(' · ')}
              </p>
              <TableOfContents sections={sections} inline />
            </header>

            <article className="max-w-3xl mx-auto px-6 mt-8">
              <PieceBody piece={issue} />
            </article>

            {lens ? (
              <div className="max-w-3xl mx-auto px-6 mt-12">
                <Link
                  to={lens.path}
                  className="group block bg-white border border-slate-200 rounded-lg p-6 hover:border-orange-300 hover:shadow-md transition"
                >
                  <span className={eyebrowClass}>The Lens · featured in this issue</span>
                  <span className="block font-serif text-xl text-slate-900 leading-snug mt-2 group-hover:text-orange-700">
                    {lens.title}
                  </span>
                  <span className="block text-slate-600 text-sm mt-2">{lens.summary}</span>
                </Link>
              </div>
            ) : null}

            {newer || older ? (
              <nav aria-label="Other issues" className="max-w-3xl mx-auto px-6 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IssueLink issue={older} label="Previous" align="text-left" />
                <IssueLink issue={newer} label="Next" align="sm:text-right" />
              </nav>
            ) : null}

            <SectionDivider />
            <NewsletterSignup />
          </div>

          <TableOfContents sections={sections} />
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-10">
          <Link to="/insights/dispatch" className={orangeLink}>
            ← All issues of SBI Dispatch
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
