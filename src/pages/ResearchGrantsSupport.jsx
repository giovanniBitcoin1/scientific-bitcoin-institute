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

export default function ResearchGrantsSupport() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Support
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Research Grants
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute will pursue research grants from foundations, philanthropic
            organizations, and other institutional funders to support specific research projects in Bitcoin science.
          </p>
        </section>

        <SectionDivider />

        {/* About research grants */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            About research grants
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Research grants enable the Institute to undertake specific research initiatives in the mathematical,
              physical, and economic foundations of Bitcoin — including the Power Law Theory research program, mining
              science, cryptographic research, and educational initiatives. Grants may be awarded to the Institute
              for general research support, for specific projects, or for collaborative work with academic partners.
            </p>
            <p>
              The Institute's research independence is foundational to its credibility. Grants do not direct the
              Institute's research agenda; they enable the Institute to pursue specific lines of inquiry within its
              existing program. The Institute may decline grants if the terms would compromise the independence or
              integrity of its work.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Foundations and institutional funders */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Foundations and institutional funders
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            Foundations, philanthropic organizations, government bodies, and other institutional funders interested
            in supporting research at the Institute are invited to make contact. The Institute will be pleased to
            discuss specific research initiatives and grant structures aligned with the funder's priorities.
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
