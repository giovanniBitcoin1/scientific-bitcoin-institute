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

export default function Donate() {
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
            Donate
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute welcomes tax-deductible donations from individuals and organizations.
            Donations support research, publications, educational programs, and the Institute's day-to-day operations.
          </p>
        </section>

        <SectionDivider />

        {/* Donation card */}
        <section className="max-w-2xl mx-auto px-6">
          <div className="bg-white border border-orange-200 rounded-2xl shadow-sm p-8 md:p-12 text-center">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              Tax-Deductible Donation
            </p>
            <h2 className="font-serif text-2xl text-slate-900 leading-tight mt-2">
              Make a donation
            </h2>
            <p className="text-slate-700 text-base mt-4">
              Donations are processed securely. You will be redirected to a hosted payment page where you can choose
              your contribution amount.
            </p>

            <div className="mt-6 flex justify-center">
              <a
                href="https://square.link/u/C6PPHkBM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
              >
                Donate to SBI →
              </a>
            </div>

            <p className="mt-4 italic text-slate-500 text-xs">
              Opens in a new tab. Payment processed securely by Square.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* What happens next */}
        <section className="max-w-3xl mx-auto px-6">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            What happens after you donate
          </h3>
          <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
            <p>
              After completing your donation through the secure Square checkout, you will receive an automatic
              receipt by email.
            </p>
            <p>
              For tax-deductible donation acknowledgments suitable for IRS reporting, the Institute will send a
              separate written acknowledgment within five business days containing the donation amount, date, and the
              Institute's EIN, along with a statement that no goods or services were exchanged for the contribution.
            </p>
            <p>
              If you require an immediate written acknowledgment or have questions about your donation, please{' '}
              <Link to="/about/contact" className={inlineLink}>contact the Institute</Link> directly.
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
            If you would prefer to donate Bitcoin, please see the{' '}
            <Link to="/support/donate-bitcoin" className={inlineLink}>Donate Bitcoin</Link> page. For information
            about contributing to the Institute's strategic Bitcoin reserve fund, see the{' '}
            <Link to="/support/endowment-fund" className={inlineLink}>Endowment Fund</Link>. Foundations and
            institutional funders are directed to the{' '}
            <Link to="/support/research-grants" className={inlineLink}>Research Grants</Link> page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
