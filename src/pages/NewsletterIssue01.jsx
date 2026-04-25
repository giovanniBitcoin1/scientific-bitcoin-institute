import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

export default function NewsletterIssue01() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Title block */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <Link to="/news/newsletter" className={`text-sm ${orangeLink}`}>
            ← Back to Dispatches
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mt-6 mb-3 font-mono">
            Issue #1 &nbsp;·&nbsp; April 25, 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            The Power Law Lands
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-3xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-lg leading-relaxed">
            This is the inaugural issue of <em>Dispatches from the Scientific Bitcoin Institute</em>. We're starting
            where any new research institute should — with formal publications. This month we announce two milestones
            that together establish the Institute's research program.
          </p>
        </section>

        <SectionDivider />

        {/* Section 1: preprint */}
        <section id="preprint" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            A Mechanistic Derivation of the Power Law
          </h2>
          <div className="mt-6 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            <p>
              The Institute's first formal research publication is now available on Zenodo with a permanent DOI.{' '}
              <em>
                A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised
                Metcalfe Scaling
              </em>
              , by Director Giovanni Santostasi and Vice-Director Stephen Perrenod, establishes that Bitcoin's price
              has followed a power law in time across 5,696 daily observations from 2010 to 2026, with exponent
              β = 5.69 ± 0.05.
            </p>
            <p>
              The paper's central contribution is the derivation of this exponent from first principles, as the
              product of two independently measured physical scaling relations: the cubic growth of non-zero-balance
              Bitcoin addresses (β<sub>A</sub> ≈ 3.046, consistent with epidemic spreading on heterogeneous
              scale-free networks), and a generalised Metcalfe-type network-value scaling (β<sub>M</sub> ≈ 1.838).
              Their composition matches the directly observed price exponent to within 1.6%.
            </p>
            <p>
              This is the foundation on which the Institute's broader research program is built. The full preprint is
              openly available under a CC-BY 4.0 license.
            </p>
          </div>
          <p className="mt-6">
            <a
              href="https://doi.org/10.5281/zenodo.19387099"
              target="_blank"
              rel="noopener noreferrer"
              className={orangeLink}
            >
              Read the preprint →
            </a>
          </p>
        </section>

        <SectionDivider />

        {/* Section 2: book */}
        <section id="book" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            The Physics of Bitcoin Reaches #1
          </h2>
          <div className="mt-6 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            <p>
              Director Giovanni Santostasi's new book,{' '}
              <em>The Physics of Bitcoin: Not an Asset but a Force of Nature</em>, has reached #1 in Macroeconomics on
              Amazon. The book develops the Power Law Theory in full mathematical rigor and situates Bitcoin within
              the framework of statistical physics, the renormalization group, and self-organized criticality.
            </p>
            <p>
              The book argues that Bitcoin's architecture — fixed supply, programmatic issuance, decentralized
              consensus, and scale-free network topology — places the network at a fixed point in the mathematical
              sense, a state from which irrelevant perturbations cannot dislodge it. The same physics that explains
              why water and iron share critical exponents, why the Internet exhibits scale-free structure, and why
              sandpiles self-organize to criticality is shown to apply, with full quantitative rigour, to Bitcoin.
            </p>
            <p>It includes a Foreword by SBI Vice-Director Stephen Perrenod, Ph.D.</p>
          </div>
          <p className="mt-6">
            <Link to="/research/publications#physics-of-bitcoin" className={orangeLink}>
              More about the book →
            </Link>
          </p>
        </section>

        <SectionDivider />

        {/* Closing: subscribe */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-2xl font-semibold text-slate-900">Subscribe</h3>
          <p className="text-slate-600 leading-relaxed mt-3 max-w-xl mx-auto">
            If this dispatch was forwarded to you and you'd like to receive future issues directly, subscribe below.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
