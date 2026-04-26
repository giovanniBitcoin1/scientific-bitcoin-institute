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

export default function NetworkScience() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Banner + title */}
        <section className="max-w-5xl mx-auto px-6">
          <img
            src="/assets/education/network-science-banner.png"
            alt=""
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
        </section>
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Network Science
          </h1>
        </section>

        <SectionDivider />

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Network science studies the structure and dynamics of connected systems — from social networks to power
            grids to neural networks. It is the natural framework for understanding Bitcoin: a system whose value,
            security, and behavior emerge from the topology of interactions among millions of addresses, transactions,
            and participants.
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
              Bitcoin's network exhibits scale-free topology — the same statistical pattern that characterizes the
              World Wide Web, citation graphs, and many biological networks. This structure is not incidental; it is
              what allows preferential attachment, where new participants connect to established hubs, generating the
              network's value-scaling behavior. The Institute's research has shown that this network topology is the
              foundation of Bitcoin's price power law: when address count grows as a cubic power of time and value
              scales with address count via a generalized Metcalfe's law, the price's t<sup>5.7</sup> scaling falls
              out as a deterministic mathematical consequence. Network science is therefore not a metaphor for
              Bitcoin's behavior — it is the technical substrate that explains it.
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
            The Institute is developing educational material on the network-science foundations of Bitcoin,
            including: scale-free networks and the mechanism of preferential attachment, the heterogeneity of
            Bitcoin addresses by transaction frequency, the network-value laws (Metcalfe, Reed,
            Briscoe-Odlyzko-Tilly), the distinct universality classes of network growth, and the empirical methods
            for measuring these properties on the Bitcoin blockchain.
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
