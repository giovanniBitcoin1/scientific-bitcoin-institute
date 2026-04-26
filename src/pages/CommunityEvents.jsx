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

export default function CommunityEvents() {
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
            Community Events
          </h1>
          <div className="mt-4">
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
              Coming soon
            </span>
          </div>
        </section>

        {/* Description */}
        <section className="max-w-2xl mx-auto mt-6 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Institute is developing community-focused events — meetups, study groups, and informal gatherings that
            bring together researchers, students, and Bitcoin practitioners interested in the scientific study of the
            network. Details on upcoming events will appear here.
          </p>
        </section>

        <SectionDivider />

        {/* Newsletter intro + signup */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-base leading-relaxed mt-12">
            Subscribe to the Institute's monthly dispatch to be notified when community events are announced.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
