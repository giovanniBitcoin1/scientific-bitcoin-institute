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

export default function SponsoredResearch() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Research
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Sponsored Research
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-3xl mx-auto mt-10 px-6">
          <div className="space-y-5 text-slate-700 text-base leading-relaxed">
            <p>
              The Scientific Bitcoin Institute engages leading academic partners in sponsored research collaborations
              that extend, validate, or generalize the Institute's work on Bitcoin as a complex system. These
              engagements place SBI's research — the Power Law Theory, the mechanistic derivation of network scaling,
              the study of proof-of-work as a physical system — under the scrutiny of independent mathematical,
              cryptographic, and complexity-science research groups. The goal is the same at every engagement: to bring
              Bitcoin research to the standard of rigor expected in the natural sciences, and to build a durable body
              of peer-reviewed literature.
            </p>
            <p>
              Typical engagements follow a three-phase structure: formal review and verification of existing Institute
              research, mathematical extension and refinement of the theoretical framework, and broader application to
              related questions in Bitcoin's network dynamics, cryptography, and monetary economics. Each engagement
              produces research deliverables intended for publication in peer-reviewed journals.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Current engagements */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Current Engagements
          </h2>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-8 md:p-10 text-center">
            <p className="italic text-slate-600 leading-relaxed">
              Two engagements with international academic partners are currently in preparation. Details will be
              published here as contracts are executed and public disclosure is agreed with each partner.
            </p>
          </div>

          <p className="mt-6 text-sm text-slate-500">Last updated: April 2026</p>
        </section>

        <SectionDivider />

        {/* Closing */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-16">
          <h3 className="font-serif text-2xl font-semibold text-slate-900 mb-4">
            Partner with us
          </h3>
          <p className="text-slate-600 leading-relaxed">
            SBI welcomes inquiries from academic research groups, universities, and industry partners interested in
            commissioning or co-sponsoring rigorous mathematical, physical, or network-scientific research on Bitcoin.
            Please contact the Institute to discuss possibilities.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/about/contact"
              className="inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors"
            >
              Contact the Institute
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
