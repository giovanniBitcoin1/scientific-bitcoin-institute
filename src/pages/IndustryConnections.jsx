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

export default function IndustryConnections() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Industry Connections
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Corporate Sponsorship
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Corporate sponsorship is one of several ways industry organizations engage with the Scientific Bitcoin
            Institute. Sponsorship from forward-looking firms enables the Institute to pursue ambitious research
            without the constraints of traditional academic funding cycles. Sponsors do not direct the Institute's
            research agenda; their support enables the broader mission of bringing rigorous scientific methodology to
            the study of Bitcoin as a complex system.
          </p>
        </section>

        <SectionDivider />

        {/* Current Sponsors */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-3 font-mono">
              Our Sponsors
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Current Sponsors
            </h2>
          </div>

          <div className="max-w-3xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-[minmax(180px,260px)_1fr] gap-8 md:gap-12 items-start">
            <div>
              <a
                href="https://fulgur.ventures/"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <img
                  src="/assets/sponsors/fulgur-logo.png"
                  alt="Fulgur Ventures logo"
                  className="w-full max-w-[220px] mx-auto md:mx-0 h-auto object-contain rounded-lg p-4 bg-white border border-slate-200 transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
                />
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Principal Sponsor
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mt-2">
                Fulgur Ventures
              </h3>
              <p className="text-slate-700 text-base mt-4 leading-relaxed">
                Fulgur Ventures invests in early-stage startups building on Bitcoin and the Lightning Network. As
                principal sponsor of the Scientific Bitcoin Institute, Fulgur enables the Institute's mission of
                advancing the rigorous scientific study of Bitcoin as a complex system. Founded in 2019 and based in
                Wilmington, Delaware, Fulgur supports a portfolio of leading Bitcoin and Lightning companies including
                Blockstream, Casa, Voltage, Alby, and Umbrel, and is an active sponsor of the global Bitcoin developer
                and conference ecosystem.
              </p>
              <div className="mt-6">
                <a
                  href="https://fulgur.ventures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={outlineButton}
                >
                  Visit fulgur.ventures →
                </a>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Inquiries */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Sponsorship Inquiries
          </h2>
          <div className="mt-8 space-y-5 text-slate-700 leading-relaxed text-left max-w-2xl mx-auto">
            <p>
              The Institute is actively building its sponsor network. We welcome conversations with organizations
              whose values and interests align with rigorous scientific research on Bitcoin — including investment
              firms, technology companies, foundations, and individuals.
            </p>
            <p>
              A tiered sponsorship program with specific recognition and engagement opportunities for corporate
              sponsors is currently in development. Details will be announced in due course. In the meantime,
              organizations interested in becoming sponsors are invited to contact the Institute directly.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
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
