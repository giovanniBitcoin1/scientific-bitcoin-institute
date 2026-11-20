import { Link } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import { PageShell, eyebrowClass, orangeLink } from '../components/newsroom/parts.jsx'
import { getClaims } from '../lib/newsroom.js'
import { DISPATCH, formatDate } from '../lib/newsroom-core.js'
import { COPY, PAGES } from '../lib/site.js'
import { usePageSEO } from '../lib/seo.js'

const STATUS_STYLE = {
  open: 'bg-slate-100 text-slate-700 border-slate-300',
  held: 'bg-green-50 text-green-800 border-green-300',
  failed: 'bg-red-50 text-red-800 border-red-300',
}
const STATUS_LABEL = { open: 'Open', held: 'Held', failed: 'Failed' }

// This route exists only while at least one claim does (see src/App.jsx).
export default function OnTheRecord() {
  usePageSEO('/insights/on-the-record')
  const claims = getClaims()

  return (
    <PageShell>
      <ScrollToHash />

      <main className="pt-28 pb-24">
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className={eyebrowClass}>
            <Link to="/insights" className="hover:text-orange-700">
              Insights
            </Link>{' '}
            · Accountability
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            {PAGES['/insights/on-the-record'].heading}
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">{COPY.onTheRecordIntro}</p>
        </section>

        <section className="max-w-3xl mx-auto mt-12 px-6 space-y-6">
          {claims.map((claim) => (
            <article key={claim.piece.path} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-block border text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded ${STATUS_STYLE[claim.status] || STATUS_STYLE.open}`}
                >
                  {STATUS_LABEL[claim.status] || claim.status}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                  Made {formatDate(claim.made)}
                  {claim.checkBy ? ` · Check by ${formatDate(claim.checkBy)}` : ''}
                </span>
              </div>
              <p className="font-serif text-xl text-slate-900 leading-snug mt-4">{claim.text}</p>
              {claim.note ? <p className="text-slate-700 text-sm leading-relaxed mt-3">{claim.note}</p> : null}
              <p className="text-sm mt-4">
                <Link to={claim.piece.path} className={orangeLink}>
                  {claim.piece.series === DISPATCH ? `SBI Dispatch No. ${claim.piece.number}` : 'The Lens'}:{' '}
                  {claim.piece.title}
                </Link>
              </p>
            </article>
          ))}
        </section>

        <SectionDivider />
        <NewsletterSignup />
      </main>
    </PageShell>
  )
}
