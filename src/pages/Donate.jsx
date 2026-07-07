import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

// ─────────────────────────────────────────────────────────────────────────
// ONE-TIME GIFT LINKS — replace each value with the matching Square link.
// Recurring monthly giving now lives on the Become a Member page.
// Until you replace these, every button falls back to your existing Square
// donation link, so nothing ever leads to a dead page.
// ─────────────────────────────────────────────────────────────────────────
const SQUARE_FALLBACK = 'https://square.link/u/C6PPHkBM'

const ONE_TIME_AMOUNTS = [
  { amount: 25, url: SQUARE_FALLBACK },  // TODO: $25 one-time link
  { amount: 50, url: SQUARE_FALLBACK },  // TODO: $50 one-time link
  { amount: 100, url: SQUARE_FALLBACK }, // TODO: $100 one-time link
]

const ONE_TIME_OTHER_URL = SQUARE_FALLBACK // TODO: one-time "choose amount" link

const ext = { target: '_blank', rel: 'noopener noreferrer' }

const inlineLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

function SectionDivider() {
  return (
    <div className="my-16 flex justify-center" aria-hidden="true">
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

export default function Donate() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;&middot;&nbsp; Support
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Donate
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">
            The Scientific Bitcoin Institute is a non-profit and runs on tax-deductible
            contributions. Make a one-time gift of any size below. If you would like to support
            the Institute every month, you can{' '}
            <Link to="/support/become-a-member" className={inlineLink}>become a member</Link>.
          </p>
        </section>

        <div className="mt-14" />

        {/* One-time */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold font-mono text-center mb-2">
            Give once
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-slate-900 text-center mb-8">
            Make a one-time gift
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ONE_TIME_AMOUNTS.map((o) => (
              <a key={o.amount} href={o.url} {...ext} className="border border-slate-300 hover:border-orange-500 hover:text-orange-600 text-slate-800 font-semibold rounded-full px-7 py-3 transition-colors">
                ${o.amount}
              </a>
            ))}
            <a href={ONE_TIME_OTHER_URL} {...ext} className="border border-slate-300 hover:border-orange-500 hover:text-orange-600 text-slate-600 font-semibold rounded-full px-7 py-3 transition-colors">
              Other amount
            </a>
          </div>
          <p className="mt-4 text-center italic text-slate-500 text-xs">
            Payments are processed securely by Square. Opens in a new tab.
          </p>
        </section>

        <SectionDivider />

        {/* What happens next */}
        <section className="max-w-3xl mx-auto px-6">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            What happens after you donate
          </h3>
          <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
            <p>
              After completing your donation through the secure Square checkout, you will
              receive an automatic receipt by email.
            </p>
            <p>
              For tax-deductible donation acknowledgments suitable for IRS reporting, the
              Institute will send a separate written acknowledgment within five business days
              containing the donation amount, date, and the Institute's EIN, along with a
              statement that no goods or services were exchanged for the contribution.
            </p>
            <p>
              If you require an immediate written acknowledgment or have questions about your
              donation, please{' '}
              <Link to="/about/contact" className={inlineLink}>contact the Institute</Link>{' '}
              directly.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Other ways */}
        <section className="max-w-3xl mx-auto px-6">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            Other ways to give
          </h3>
          <p className="text-slate-700 mt-4 leading-relaxed">
            If you would prefer to donate Bitcoin, please see the{' '}
            <Link to="/support/donate-bitcoin" className={inlineLink}>Donate Bitcoin</Link> page.
            For information about contributing to the Institute's strategic Bitcoin reserve
            fund, see the{' '}
            <Link to="/support/endowment-fund" className={inlineLink}>Endowment Fund</Link>.
            Foundations and institutional funders are directed to the{' '}
            <Link to="/support/research-grants" className={inlineLink}>Research Grants</Link> page.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
