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

export default function ComplexityScience() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Banner + title */}
        <section className="max-w-5xl mx-auto px-6">
          <img
            src="/assets/education/complexity-science-banner.png"
            alt=""
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
        </section>
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Complexity Science
          </h1>
        </section>

        <SectionDivider />

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Complexity science is the study of systems whose behavior cannot be predicted from properties of their
            components alone — systems where structure emerges from local interactions, where order arises
            spontaneously, and where statistical regularities govern apparent chaos. Bitcoin is a paradigmatic
            example: a self-organizing global system whose long-run behavior is governed by mathematical laws that no
            central designer specified.
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
              The same physics that explains why water and iron share critical exponents at phase transitions, why
              earthquakes follow Gutenberg-Richter scaling, and why neural avalanches and sandpiles self-organize to
              criticality is the physics that governs Bitcoin's growth trajectory. Bitcoin sits at a fixed point in
              the mathematical sense — a state where its design parameters (fixed supply, programmatic issuance,
              decentralized consensus) determine the trajectory while irrelevant perturbations (exchange collapses,
              regulatory events, market sentiment) wash out under coarse-graining. The Power Law Theory applies the
              renormalization group to Bitcoin and finds that its dynamics belong to a specific complexity class —
              one shared by the most successful self-organizing systems in nature.
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
            The Institute is developing material on the complexity-science foundations of the Power Law Theory,
            including: self-organized criticality, the renormalization group and universality classes, scale
            invariance and fractal structure in time series, phase transitions and emergent order, and the empirical
            signatures that distinguish complex-system behavior from random or designed processes. This page will
            expand as the Institute's complexity-science curriculum is developed.
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
