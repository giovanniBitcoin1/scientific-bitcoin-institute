import { Link, useParams } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import {
  DraftRibbon, NotFound, PageShell, PieceBody, ShareLinks, eyebrowClass, orangeLink,
} from '../components/newsroom/parts.jsx'
import { getDispatchByNumber, getLensBySlug } from '../lib/newsroom.js'
import { formatDate, formatDateTime } from '../lib/newsroom-core.js'
import { canonicalUrl } from '../lib/site.js'
import { SITE_ORIGIN, usePieceSEO } from '../lib/seo.js'

export default function LensArticle() {
  const { slug } = useParams()
  const piece = getLensBySlug(slug)

  usePieceSEO(piece)

  if (!piece) {
    return (
      <NotFound
        title="Piece not found"
        text="We couldn't find the piece of The Lens you were looking for."
        backTo="/insights/lens"
        backLabel="← All pieces of The Lens"
      />
    )
  }

  const issue = piece.dispatch ? getDispatchByNumber(piece.dispatch) : null
  const h2 = 'font-serif text-2xl md:text-3xl text-slate-900 font-semibold scroll-mt-28'

  return (
    <PageShell>
      <ScrollToHash />
      <DraftRibbon piece={piece} />

      <main className="pt-28 pb-24">
        <header className="max-w-3xl mx-auto px-6 mt-8">
          <p className={eyebrowClass}>
            <Link to="/insights/lens" className="hover:text-orange-700">
              The Lens
            </Link>{' '}
            · {piece.formattedDate}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-3">{piece.title}</h1>
          {piece.dek ? (
            <p className="text-slate-700 text-xl md:text-2xl mt-4 leading-snug font-light italic">{piece.dek}</p>
          ) : null}

          {/* Times are shown as written in the file, with their offset. */}
          <p className="text-slate-600 text-sm mt-6">
            Facts as of {formatDateTime(piece.factsAsOf)}
          </p>
          {piece.updatedAt ? (
            <p className="mt-3 inline-block bg-orange-50 border border-orange-200 rounded px-3 py-1.5 text-sm text-slate-800">
              Updated {formatDate(piece.updatedAt)} ·{' '}
              <a href="#updates" className={orangeLink}>
                see what changed
              </a>
            </p>
          ) : null}
        </header>

        <article className="max-w-3xl mx-auto px-6 mt-8">
          <PieceBody piece={piece} />
        </article>

        <div className="max-w-3xl mx-auto px-6">
          {piece.updates.length > 0 ? (
            <section id="updates" className="mt-12 scroll-mt-28">
              <h2 className={h2}>Updates</h2>
              <ul className="mt-4 space-y-4">
                {piece.updates.map((u) => (
                  <li key={u.at} className="border-l-2 border-orange-400 pl-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-slate-500">{formatDateTime(u.at)}</p>
                    <p className="text-slate-700 leading-relaxed mt-1">{u.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {piece.sources.length > 0 ? (
            <section id="sources" className="mt-12 scroll-mt-28">
              <h2 className={h2}>Sources</h2>
              <ol className="mt-4 list-decimal pl-6 space-y-2 text-slate-700">
                {piece.sources.map((s) => (
                  <li key={s.url} className="leading-relaxed">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={`${orangeLink} break-words`}>
                      {s.title}
                    </a>{' '}
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500">· {s.kind}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <p className="mt-10 text-slate-700 leading-relaxed">
            <span className={eyebrowClass}>Instrument</span>
            <span className="block mt-1">{piece.instrument}</span>
          </p>

          {issue ? (
            <p className="mt-8">
              <Link to={issue.path} className={orangeLink}>
                Featured in SBI Dispatch No. {issue.number}
              </Link>
            </p>
          ) : null}

          <div className="mt-10 pt-6 border-t border-slate-200">
            <ShareLinks url={canonicalUrl(SITE_ORIGIN, piece.path)} title={piece.title} />
          </div>
        </div>

        <SectionDivider />
        <NewsletterSignup />

        <div className="max-w-3xl mx-auto px-6 mt-10">
          <Link to="/insights/lens" className={orangeLink}>
            ← All pieces of The Lens
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
