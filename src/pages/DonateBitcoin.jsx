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

export default function DonateBitcoin() {
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
            Donate Bitcoin
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute welcomes Bitcoin donations from individuals and organizations. Donations
            may be directed toward operating support or to the Institute's strategic Bitcoin reserve fund.
          </p>
        </section>

        <SectionDivider />

        {/* Placeholder */}
        <section className="max-w-2xl mx-auto px-6">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 md:p-10 text-center">
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
              Coming soon
            </span>
            <p className="text-slate-700 text-base mt-4 leading-relaxed">
              The Institute's direct Bitcoin donation infrastructure is being finalized. In the meantime, donors
              interested in making a Bitcoin donation are invited to contact the Institute directly to arrange the
              contribution and receive a tax-deductible acknowledgment.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/about/contact" className={outlineButton}>
                Contact the Institute →
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Context */}
        <section className="max-w-3xl mx-auto px-6">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            Why Bitcoin donations
          </h3>
          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Bitcoin is uniquely suited to support an institute studying Bitcoin. Donating Bitcoin avoids
              fiat-conversion fees, simplifies the transaction, and aligns the form of support with the substance of
              the Institute's mission.
            </p>
            <p>
              Bitcoin donations to qualified 501(c)(3) organizations may also offer tax advantages over fiat
              donations for U.S. donors who hold Bitcoin with appreciated capital gains. Specific tax implications
              depend on individual circumstances; donors are advised to consult a qualified tax professional.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Other ways */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            Other ways to give
          </h3>
          <p className="text-slate-700 mt-4 leading-relaxed">
            For fiat donations through a secure card processor, see the{' '}
            <Link to="/support/donate" className={inlineLink}>Donate</Link> page. For information about the
            Institute's strategic Bitcoin reserve fund, see the{' '}
            <Link to="/support/endowment-fund" className={inlineLink}>Endowment Fund</Link> page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
