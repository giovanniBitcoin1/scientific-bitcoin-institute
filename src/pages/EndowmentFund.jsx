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

const outlineButton =
  'inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors'

export default function EndowmentFund() {
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
            Endowment Fund
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute is establishing a strategic fund denominated in Bitcoin to support the
            long-term sustainability of the Institute's research mission.
          </p>
        </section>

        <SectionDivider />

        {/* About the fund */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            About the fund
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The fund holds Bitcoin as a long-duration treasury asset — coherent with the Institute's broader
              commitment to Bitcoin as a foundational monetary technology and consistent with the Institute's belief
              that the cleanest expression of confidence in Bitcoin's mathematical foundations is to hold the asset
              itself.
            </p>
            <p>
              The strategic fund is designed to provide the Institute with operational stability over multiple
              decades, independent of short-term funding cycles or market conditions. By holding Bitcoin rather than
              converting to fiat, the fund's value grows with the long-run trajectory of the network the Institute
              studies.
            </p>
            <p>
              Donors who wish to contribute specifically to the strategic fund — rather than to operating support —
              can indicate this preference when making a donation.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Contributing */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Contributing to the fund
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            The Institute welcomes contributions of any size to the strategic fund. Major donors interested in
            seeding the fund or making substantial contributions are invited to contact the Institute directly to
            discuss the terms and structure of the contribution.
          </p>

          <div className="mt-6 flex justify-center">
            <Link to="/about/contact" className={outlineButton}>
              Contact the Institute →
            </Link>
          </div>
        </section>

        <SectionDivider />

        {/* Other ways */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            Other ways to give
          </h3>
          <p className="text-slate-700 mt-4 leading-relaxed">
            For one-time fiat donations to support operations, see the{' '}
            <Link to="/support/donate" className={inlineLink}>Donate</Link> page. For Bitcoin donations to general
            operating support, see the{' '}
            <Link to="/support/donate-bitcoin" className={inlineLink}>Donate Bitcoin</Link> page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
