import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

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

const outlineButton =
  'inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors'

export default function DeveloperRelations() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Collaborate
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Developer Relations
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
            The Scientific Bitcoin Institute maintains active interest in Bitcoin's open-source development community.
            Developer relations encompass collaboration with protocol developers on questions where scientific
            analysis informs technical decisions, the sponsorship of relevant Bitcoin Improvement Proposal (BIP)
            research, and support for development efforts that align with the Institute's research program. The
            Institute is building this program; developers and development organizations interested in collaboration
            are invited to make contact.
          </p>
        </section>

        <SectionDivider />

        {/* Contact CTA */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-12">
          <h3 className="font-serif text-2xl font-semibold text-slate-900">Get in touch</h3>
          <p className="text-slate-600 leading-relaxed mt-3">
            Organizations or researchers interested in this program are invited to contact the Institute directly.
          </p>

          <div className="mt-6 flex justify-center">
            <Link to="/about/contact" className={outlineButton}>
              Contact the Institute →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
