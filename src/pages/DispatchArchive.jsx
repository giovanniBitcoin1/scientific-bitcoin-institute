import { Link } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import { ArchiveRow, PageShell, eyebrowClass } from '../components/newsroom/parts.jsx'
import { getDispatches } from '../lib/newsroom.js'
import { COPY, PAGES } from '../lib/site.js'
import { usePageSEO } from '../lib/seo.js'

export default function DispatchArchive() {
  usePageSEO('/insights/dispatch')
  const issues = getDispatches()

  return (
    <PageShell>
      <ScrollToHash />

      <main className="pt-28 pb-24">
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className={eyebrowClass}>
            <Link to="/insights" className="hover:text-orange-700">
              Insights
            </Link>{' '}
            · Newsletter
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            {PAGES['/insights/dispatch'].heading}
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">{COPY.dispatchIntro}</p>
        </section>

        {issues.length > 0 ? (
          <section className="max-w-3xl mx-auto mt-12 px-6">
            {issues.map((issue) => (
              <ArchiveRow key={issue.slug} piece={issue} label={`No. ${issue.number}`} />
            ))}
          </section>
        ) : null}

        <SectionDivider />
        <NewsletterSignup />
      </main>
    </PageShell>
  )
}
