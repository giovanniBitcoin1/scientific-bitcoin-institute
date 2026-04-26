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

const inlineLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

export default function History() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; About
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            History
          </h1>
        </section>

        <SectionDivider />

        {/* Founding */}
        <section id="founding" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Founding
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The Scientific Bitcoin Institute was founded in November 2025 by Giovanni Santostasi and Stephen
              Perrenod, with the support of an international community of researchers, sponsors, and Bitcoin
              practitioners who believed Bitcoin deserved a dedicated research institution committed to the standards
              of the natural sciences.
            </p>
            <p>
              The Institute's intellectual foundations trace back over a decade. Director Giovanni Santostasi began
              studying Bitcoin as a complex adaptive system in 2014, applying methods from statistical physics,
              network science, and the renormalization group to questions about Bitcoin's price dynamics, network
              topology, and long-run behavior. By 2018, this work had identified the mathematical signature now known
              as the Power Law Theory of Bitcoin — a single scaling relationship that has described Bitcoin's growth
              across more than fifteen years and four orders of magnitude.
            </p>
            <p>
              Vice-Director Stephen Perrenod, an astrophysicist by training and a long-time analyst of Bitcoin mining
              and the broader Bitcoin economy, brought complementary perspectives from cosmology, high-performance
              computing, and quantitative finance. His independent work on Bitcoin's long-run trajectory and the
              application of log-periodic models to bubble dynamics provided the bridge between the theoretical
              physics of complex systems and the empirical study of Bitcoin markets.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Foundational publications */}
        <section id="foundational-publications" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Foundational publications
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The first formal output of the Institute's research program was the preprint{' '}
              <em>
                A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised
                Metcalfe Scaling
              </em>{' '}
              (Santostasi &amp; Perrenod, 2026), published on Zenodo with a permanent DOI. The preprint established
              that Bitcoin's price exponent is not a free parameter but a deterministic mathematical consequence of
              two independently measured network scaling laws — placing the Power Law Theory on a rigorous, derivable
              foundation.
            </p>
            <p>
              This was followed by the publication of{' '}
              <em>The Physics of Bitcoin: Not an Asset but a Force of Nature</em> (Santostasi, 2026), which reached
              #1 in Macroeconomics on Amazon and developed the broader framework of statistical physics and
              complex-systems science applied to Bitcoin in a form accessible to serious students and researchers.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* The Institute today */}
        <section id="institute-today" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            The Institute today
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The Scientific Bitcoin Institute is registered as a 501(c)(3) tax-exempt nonprofit organization,
              headquartered in San Diego, California. Its activities span original research, sponsored research
              engagements with academic partners, the <em>Physics of Bitcoin</em> weekly seminar series, the{' '}
              <em>Dispatches</em> newsletter, and an emerging program of conferences, seminars, and workshops. The
              Institute's Advisory Board includes Shahin Khan (technology and high-performance computing) and Pius
              Sprenger, Ph.D. (mathematics and finance), who provide guidance on the Institute's strategic direction.
            </p>
            <p>
              The Institute's mission, structure, and approach to research are detailed elsewhere on this site: see
              the <Link to="/manifesto" className={inlineLink}>Manifesto</Link> for the Institute's intellectual
              program, <Link to="/people" className={inlineLink}>People</Link> for the Institute's leadership and
              Research Fellows, and{' '}
              <Link to="/research/open-problems" className={inlineLink}>Open Problems</Link> for the active research
              agenda.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
