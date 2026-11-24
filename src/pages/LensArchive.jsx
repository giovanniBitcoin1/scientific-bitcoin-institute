import { Link } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import { ArchiveRow, PageShell, eyebrowClass } from '../components/newsroom/parts.jsx'
import { getLensPieces } from '../lib/newsroom.js'
import { COPY, PAGES } from '../lib/site.js'
import { usePageSEO } from '../lib/seo.js'

export default function LensArchive() {
  usePageSEO('/insights/lens')
  const pieces = getLensPieces()

  return (
    <PageShell>
      <ScrollToHash />

      <main className="pt-28 pb-24">
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className={eyebrowClass}>
            <Link to="/insights" className="hover:text-orange-700">
              Insights
            </Link>{' '}
            · News analysis
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            {PAGES['/insights/lens'].heading}
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">{COPY.lensIntro}</p>
        </section>

        {/* With nothing published the page is the intro and the subscribe block only. */}
        {pieces.length > 0 ? (
          <section className="max-w-3xl mx-auto mt-12 px-6">
            {pieces.map((piece) => (
              <ArchiveRow key={piece.slug} piece={piece} label="The Lens" />
            ))}
          </section>
        ) : null}

        <SectionDivider />
        <NewsletterSignup />
      </main>
    </PageShell>
  )
}
