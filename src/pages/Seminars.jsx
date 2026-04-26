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

export default function Seminars() {
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
            Seminars
          </h1>
          <div className="mt-6">
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
              Coming soon
            </span>
          </div>
        </section>

        {/* Description */}
        <section className="max-w-2xl mx-auto mt-8 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Institute is developing a seminar series on topics in Bitcoin science, complex systems, and the Power
            Law Theory. Recordings and announcements of upcoming sessions will appear on this page.
          </p>
        </section>

        <SectionDivider />

        {/* Newsletter intro + signup */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-base leading-relaxed mt-12">
            Subscribe to the Institute's monthly dispatch to be notified when new seminars are announced.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
