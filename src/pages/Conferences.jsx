import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'

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

const events = [
  {
    id: 'bitcoin-poland-2026',
    date: 'October 5–6, 2026',
    title: 'Bitcoin Poland Conference 2026',
    location: 'Poznań Congress Center, ul. Głogowska 14, Poznań, Poland',
    description: (
      <>
        The first major international conference in Poland dedicated entirely to Bitcoin, bringing together experts,
        entrepreneurs, investors and builders from Poland and abroad. Director Giovanni Santostasi is among the
        announced speakers. The event runs alongside Invest Cuffs Poznań, with a single ticket granting access to
        both conferences.
      </>
    ),
    role: 'Giovanni Santostasi among the announced speakers',
  },
  {
    id: 'lac-lugano-2026',
    date: 'October 22, 2026',
    title: 'The Future of Capital Markets',
    location: 'LAC Lugano Arte e Cultura, Piazza Bernardino Luini 6, Lugano',
    description: (
      <>
        An invitation-only, full-day event at the LAC (Lugano Arte e Cultura), organized by Bitfinex Securities
        together with Blockstream Capital Partners as part of Lugano's Plan ₿ Week (19–28 October 2026), gathering
        approximately 400 attendees. Director Giovanni Santostasi will deliver a 20-minute keynote and will be
        present at a dedicated Institute space throughout the event for discussion and book signing of{' '}
        <em>The Physics of Bitcoin</em>.
      </>
    ),
    role: 'Keynote address and Institute presence by Giovanni Santostasi',
  },
  {
    id: 'planb-forum-2026',
    date: 'October 23–24, 2026',
    title: 'Plan ₿ Forum',
    location: 'Lugano, Switzerland',
    description: (
      <>
        The Plan ₿ Forum is a major annual gathering of the European Bitcoin community. The Institute will participate
        with a session on a side stage of the conference. Specific session details will be announced as the program
        is finalized.
      </>
    ),
    role: 'Session led by Giovanni Santostasi',
  },
]

function EventCard({ event }) {
  return (
    <article
      id={event.id}
      className="scroll-mt-28 bg-white border-l-4 border-orange-500 rounded-r-lg shadow-sm p-8 mx-auto"
    >
      <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
        {event.date.toUpperCase()}
      </p>
      <h3 className="font-serif text-2xl text-slate-900 leading-tight mt-2">{event.title}</h3>
      <p className="text-slate-600 text-sm mt-1">{event.location}</p>
      <p className="text-slate-700 text-base mt-4 leading-relaxed">{event.description}</p>
      <p className="italic text-slate-600 text-sm mt-3">
        <span className="not-italic font-semibold text-slate-700">SBI Role:</span> {event.role}
      </p>
    </article>
  )
}

export default function Conferences() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; News + Events
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Conferences
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute participates in academic and industry conferences across Europe to
            advance the rigorous scientific study of Bitcoin. Below are upcoming events featuring SBI's Director,
            Giovanni Santostasi, and the Institute's research.
          </p>
        </section>

        <SectionDivider />

        {/* Upcoming events */}
        <section className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* In development */}
        <section className="max-w-3xl mx-auto px-6">
          <div className="bg-slate-50 rounded-lg p-6 text-center">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              In Development
            </p>
            <h3 className="font-serif text-xl text-slate-900 leading-tight mt-2">
              Forthcoming SBI academic event
            </h3>
            <p className="italic text-slate-600 text-sm mt-4 max-w-2xl mx-auto leading-relaxed">
              Lugano, October 20 or 21, 2026. The Scientific Bitcoin Institute is in discussions to host an academic
              event in Lugano, likely at SUPSI (Scuola universitaria professionale della Svizzera italiana), during
              Plan ₿ Week (19–28 October 2026). Full details will be published once finalized.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Newsletter intro + signup */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-base leading-relaxed">
            Subscribe to the Institute's monthly dispatch to be notified when conferences are announced.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
