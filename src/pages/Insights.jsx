import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import { CardGrid, PageShell, PieceCard, eyebrowClass, orangeLink } from '../components/newsroom/parts.jsx'
import { getClaims, getDispatches, getExplainers, getLatest, getLensPieces } from '../lib/newsroom.js'
import { COPY, PAGES } from '../lib/site.js'
import { usePageSEO } from '../lib/seo.js'

function SectionHeading({ eyebrow, title, allTo, allLabel }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-2">{title}</h2>
      </div>
      {allTo ? (
        <Link to={allTo} className="text-sm font-semibold text-orange-600 hover:text-orange-700 whitespace-nowrap">
          {allLabel} →
        </Link>
      ) : null}
    </div>
  )
}

// The hub has no separate Explainers archive: this section is the archive.
// It shows the three latest and, on request, all of them in place.
function ExplainersSection({ explainers }) {
  const [all, setAll] = useState(false)
  const shown = all ? explainers : explainers.slice(0, 3)
  return (
    <section id="explainers" className="max-w-6xl mx-auto px-6 scroll-mt-28">
      <SectionHeading eyebrow="Insights" title="Explainers" />
      <CardGrid>
        {shown.map((piece) => (
          <PieceCard key={piece.slug} piece={piece} image />
        ))}
      </CardGrid>
      {explainers.length > 3 && !all ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            All Explainers ({explainers.length}) →
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default function Insights() {
  usePageSEO('/insights')

  const latest = getLatest(6)
  const dispatches = getDispatches()
  const lensPieces = getLensPieces()
  const explainers = getExplainers()
  const hasClaims = getClaims().length > 0

  return (
    <PageShell>
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page header */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className={eyebrowClass}>Scientific Bitcoin Institute · Insights</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            {PAGES['/insights'].heading}
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">
            {COPY.hubIntroLead}
            <Link to="/research/publications" className={orangeLink}>
              {COPY.hubIntroLink}
            </Link>
            {COPY.hubIntroTail}
          </p>
          {hasClaims ? (
            <p className="text-slate-600 text-sm mt-4">
              <Link to="/insights/on-the-record" className={orangeLink}>
                On the record
              </Link>
              : the checkable statements we have made, and how they stand.
            </p>
          ) : null}
        </section>

        {/* Latest across the three series */}
        {latest.length > 0 ? (
          <>
            <SectionDivider />
            <section id="latest" className="max-w-6xl mx-auto px-6 scroll-mt-28">
              <SectionHeading eyebrow="Insights" title="Latest" />
              <CardGrid>
                {latest.map((piece) => (
                  <PieceCard key={piece.path} piece={piece} />
                ))}
              </CardGrid>
            </section>
          </>
        ) : null}

        {/* One section per series; a series with nothing published is not shown. */}
        {dispatches.length > 0 ? (
          <>
            <SectionDivider />
            <section id="dispatch" className="max-w-6xl mx-auto px-6 scroll-mt-28">
              <SectionHeading eyebrow="Newsletter" title="SBI Dispatch" allTo="/insights/dispatch" allLabel="All issues" />
              <CardGrid>
                {dispatches.slice(0, 3).map((piece) => (
                  <PieceCard key={piece.slug} piece={piece} />
                ))}
              </CardGrid>
            </section>
          </>
        ) : null}

        {lensPieces.length > 0 ? (
          <>
            <SectionDivider />
            <section id="lens" className="max-w-6xl mx-auto px-6 scroll-mt-28">
              <SectionHeading eyebrow="News analysis" title="The Lens" allTo="/insights/lens" allLabel="All pieces" />
              <CardGrid>
                {lensPieces.slice(0, 3).map((piece) => (
                  <PieceCard key={piece.slug} piece={piece} />
                ))}
              </CardGrid>
            </section>
          </>
        ) : null}

        {explainers.length > 0 ? (
          <>
            <SectionDivider />
            <ExplainersSection explainers={explainers} />
          </>
        ) : null}

        <SectionDivider />
        <NewsletterSignup />
      </main>
    </PageShell>
  )
}
