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

export default function EconomicModels() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Banner + title */}
        <section className="max-w-5xl mx-auto px-6">
          <img
            src="/assets/education/economic-models-banner.png"
            alt=""
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
        </section>
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Economic Models
          </h1>
        </section>

        <SectionDivider />

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Economic modeling is the formal application of mathematical and statistical methods to understand
            monetary, financial, and market phenomena. Bitcoin sits at the intersection of monetary economics,
            network economics, and the economics of information — and admits of formal treatment in each domain.
          </p>
        </section>

        <SectionDivider />

        {/* Why it matters */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Why it matters for Bitcoin
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Bitcoin presents economists with phenomena that traditional economic models do not directly address:
              an asset whose supply is mathematically fixed by protocol rather than by central authority, a network
              whose value scales not linearly with users but with the cube or fifth power of network size, a
              monetary good with no issuer and no jurisdictional boundaries. The Institute's framework treats Bitcoin
              not as a speculative asset but as a complex system whose price emerges deterministically from network
              topology and adoption dynamics. Economic models that take this seriously must grapple with concepts
              that don't appear in standard textbooks: scale-invariant value laws, conservation of monetary supply
              as a design principle (rather than as a policy choice), and equilibrium dynamics in a system without
              central planning. The Institute's research connects Bitcoin's economic behavior to the more general
              study of complex systems in finance, including bubble dynamics, super-exponential growth, and the
              empirical signatures of phase transitions in markets.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Where this is going */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Where this is going
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            The Institute is developing material on the economic-modeling foundations of Bitcoin, including
            monetary economics and supply scarcity, network value scaling, the empirical detection of bubbles and
            anti-bubbles, the role of mining as an industrial-economic activity, and the connections between Bitcoin
            and the broader literature on econophysics and complex financial systems.
          </p>
        </section>

        <SectionDivider />

        {/* Newsletter intro + signup */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-base leading-relaxed mt-12">
            Subscribe to the Institute's monthly dispatch to be notified when new educational material is published.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
