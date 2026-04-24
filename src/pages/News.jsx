import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import dispatches from '../data/dispatches.json'
import shows from '../data/shows.json'

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

// Parse "YYYY-MM-DD" as a local date (avoids UTC timezone shift)
function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLongDateUpper(iso) {
  return parseIsoDate(iso)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase()
}

function DispatchLink({ to, children }) {
  // Internal links use react-router Link; external fall back to plain anchor.
  const isExternal = /^https?:\/\//.test(to)
  const classes =
    'inline-block mt-4 text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors'
  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}

function DispatchCard({ dispatch }) {
  return (
    <article className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
        {formatLongDateUpper(dispatch.date)}
      </p>
      <h3 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mt-2">
        {dispatch.headline}
      </h3>
      <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
        {dispatch.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {dispatch.link && <DispatchLink to={dispatch.link.href}>{dispatch.link.text}</DispatchLink>}
    </article>
  )
}

function ShowCard({ show }) {
  return (
    <a
      href={show.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={show.thumbnailUrl}
        alt={`Thumbnail for ${show.title}`}
        className="w-full aspect-video object-cover"
      />
      <div className="px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          Episode {show.number} &nbsp;·&nbsp; {formatLongDateUpper(show.date)}
        </p>
        <h3 className="font-serif text-lg text-slate-900 leading-tight mt-2">{show.title}</h3>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">{show.description}</p>
        <p className="mt-3 text-sm font-semibold text-orange-600">Watch on YouTube →</p>
      </div>
    </a>
  )
}

function SecondaryButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors"
    >
      {children}
    </a>
  )
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

export default function News() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; News
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Latest News
          </h1>
          <p className="mt-8 text-slate-600 text-base leading-relaxed max-w-2xl mx-auto">
            News, research updates, and recent episodes from the Scientific Bitcoin Institute. Follow the Institute on
            X at{' '}
            <a
              href="https://x.com/ScientificBTC"
              target="_blank"
              rel="noopener noreferrer"
              className={orangeLink}
            >
              @ScientificBTC
            </a>{' '}
            and subscribe to the Physics of Bitcoin show on{' '}
            <a
              href="https://www.youtube.com/@Scientific_Bitcoin_Institute"
              target="_blank"
              rel="noopener noreferrer"
              className={orangeLink}
            >
              YouTube
            </a>{' '}
            for live updates.
          </p>
        </section>

        <SectionDivider />

        {/* Dispatches */}
        <section id="dispatches" className="scroll-mt-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-3 font-mono">
              Dispatches
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Institute Dispatches
            </h2>
          </div>

          <div className="mt-12 px-6 space-y-10">
            {dispatches.map((d, i) => (
              <DispatchCard key={i} dispatch={d} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Physics of Bitcoin show */}
        <section id="physics-of-bitcoin" className="scroll-mt-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-3 font-mono">
              Weekly Show
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              The Physics of Bitcoin
            </h2>
            <p className="mt-4 text-slate-600 text-base leading-relaxed max-w-2xl mx-auto">
              A weekly livestream hosted by Giovanni Santostasi and Stephen Perrenod exploring Bitcoin through the
              lens of physics, complex systems, and network science. New episodes every Wednesday.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mt-10 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <ShowCard key={show.number} show={show} />
            ))}
          </div>

          <div className="mt-10 flex justify-center px-6">
            <SecondaryButton href="https://www.youtube.com/@Scientific_Bitcoin_Institute">
              See all episodes
            </SecondaryButton>
          </div>
        </section>

        <SectionDivider />

        {/* Standing feature: institute intro video */}
        <section className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-6 items-center">
            <div>
              <iframe
                src="https://www.youtube.com/embed/bAd36_Z4VVw"
                title="An introduction to the Scientific Bitcoin Institute"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full aspect-video rounded-lg shadow-md border-0"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                About the Institute
              </p>
              <h3 className="font-serif text-2xl font-semibold text-slate-900 mt-2 leading-tight">
                An introduction to SBI
              </h3>
              <p className="text-slate-700 mt-3 leading-relaxed">
                A short introduction to the Scientific Bitcoin Institute — its mission, its research program, and its
                approach to studying Bitcoin as a complex adaptive system. For a deeper treatment, see the Institute's
                Manifesto.
              </p>
              <Link to="/manifesto" className={`inline-block mt-4 ${orangeLink}`}>
                Read the Manifesto →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
