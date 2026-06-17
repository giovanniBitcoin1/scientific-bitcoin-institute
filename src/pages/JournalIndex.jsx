import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import events from '../data/journalEvents.js'

function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLongDateUpper(iso) {
  return parseIsoDate(iso)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase()
}

function StatusBadge({ status }) {
  const isUpcoming = status === 'upcoming'
  return (
    <span
      className={
        'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider ' +
        (isUpcoming ? 'bg-orange-500 text-white' : 'bg-white/90 text-slate-700')
      }
    >
      {isUpcoming ? 'Upcoming' : 'Past'}
    </span>
  )
}

function EventCard({ event }) {
  return (
    <Link
      to={`/news/journal/${event.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={event.cover_image}
          alt={event.title_en}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <StatusBadge status={event.status} />
      </div>
      <div className="p-6">
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          {event.date_display || formatLongDateUpper(event.date)} &nbsp;·&nbsp; {event.location}
        </p>
        <h2 className="font-serif text-2xl text-slate-900 leading-tight mt-2">{event.title_en}</h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">{event.summary_en}</p>
        <p className="mt-4 text-sm font-semibold text-orange-600 group-hover:text-orange-700">
          View event →
        </p>
      </div>
    </Link>
  )
}

export default function JournalIndex() {
  useEffect(() => {
    document.title = 'Event Journal — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        "A visual diary of the Scientific Bitcoin Institute's conferences and events — past and upcoming, in photos and video.",
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; News + Events
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Event Journal
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mt-6 max-w-2xl mx-auto">
            A visual diary of the Institute's conferences and events — the summits, forums, and
            gatherings we have joined and those still ahead. In photos and video.
          </p>
        </section>

        {/* Event grid */}
        <section className="max-w-6xl mx-auto mt-14 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
