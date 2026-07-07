import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

// Free Reader access = the unified dashboard sign-up (Clerk). It creates the
// Reader account AND subscribes to the Dispatches newsletter in one step, and
// unlocks the interactive corridor chart. "Sign up for the newsletter" and
// "create a Free Reader account" are the same action.
const READER_SIGNUP_URL =
  'https://app.scientificbitcoininstitute.org/sign-up?source=membership-reader'

const inlineLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

// Paid tiers are PREVIEW ONLY — no active checkout until the perks ship on the
// dashboard. Perk descriptions here are placeholders to be finalized then.
const PAID_TIERS = [
  {
    name: 'Supporter',
    amount: 10,
    perks: [
      'Log-log version of the corridor chart',
      '3 power-law indicators (to be announced)',
      'Everything in Free Reader',
    ],
  },
  {
    name: 'Sustaining Supporter',
    amount: 20,
    perks: [
      'Everything in Supporter',
      '5 additional power-law indicators',
      'Statistical tools',
    ],
  },
  {
    name: 'Institute Patron',
    amount: 40,
    perks: [
      'Everything in Sustaining Supporter',
      'Full dashboard access',
      'News aggregator',
    ],
  },
]

function SectionDivider() {
  return (
    <div className="my-16 flex justify-center" aria-hidden="true">
      <div className="h-px w-24 bg-orange-500/60" />
    </div>
  )
}

function Check() {
  return (
    <svg className="w-4 h-4 text-orange-500 mt-1 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  )
}

export default function Membership() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;&middot;&nbsp; Membership
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Become a Member
          </h1>
          <p className="text-slate-700 text-base md:text-lg leading-relaxed mt-6 max-w-2xl mx-auto">
            Support rigorous, open Bitcoin research. Start free with the Power-Law Corridor chart
            and our newsletter, and go deeper as membership tiers open. The Institute is a
            501(c)(3) nonprofit; contributions are tax-deductible.
          </p>
        </section>

        {/* Chart embed section — drop into /support/membership between hero and tier cards */}
        <section className="py-8 md:py-12 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-4xl mx-auto mb-8 text-center">
              <p className="text-xs tracking-wider uppercase text-orange-500 font-mono mb-3">
                FREE — LIVE PREVIEW
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 font-serif">
                The Bitcoin Power-Law Corridor
              </h2>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed mt-4 max-w-2xl mx-auto">
                A live preview of the Power-Law Corridor in USD, calibrated by physicists over Bitcoin's full 16-year history. The complete view — all 15 currencies including gold and silver, plus the cycle-lows table — unlocks with a free Reader account.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <iframe
                src="https://app.scientificbitcoininstitute.org/embed/corridor?preview=1"
                style={{ width: '100%', height: '580px', border: 0, display: 'block' }}
                loading="lazy"
                title="Bitcoin Power-Law Corridor by Scientific Bitcoin Institute"
              />
            </div>

            {/* Unlock prompt — sits directly under the chart */}
            <div className="mt-6 max-w-2xl mx-auto text-center">
              <p className="text-slate-700 leading-relaxed">
                Sign up free to unlock the full view &mdash; all 15 currencies including gold and
                silver, the cycle-lows table, and research context &mdash; plus the monthly
                Dispatches newsletter. Account and newsletter are created in one step.
              </p>
              <div className="mt-5">
                <a
                  href={READER_SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bitcoin-gradient text-white rounded-full px-8 py-4 font-semibold hover:shadow-lg transition-shadow"
                >
                  Become a Reader &mdash; free
                </a>
              </div>
            </div>

            <p className="text-center text-xs italic text-slate-500 mt-6">
              Chart updated daily. Data from Scientific Bitcoin Institute's dashboard.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Membership tiers — PREVIEW ONLY */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold font-mono mb-3">
              Membership tiers
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              A preview of what&rsquo;s coming
            </h2>
            <p className="text-slate-600 mt-5 leading-relaxed">
              These are a preview. Detailed features are rolling out over the coming weeks, and
              tiers activate together once they&rsquo;re ready &mdash; so there&rsquo;s no checkout yet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {PAID_TIERS.map((t) => (
              <div key={t.name} className="flex flex-col bg-white border border-slate-200 rounded-lg p-8">
                <h3 className="font-serif text-2xl font-semibold text-slate-900 leading-tight">
                  {t.name}
                </h3>
                <p className="mt-3">
                  <span className="font-serif text-4xl font-semibold text-slate-900">${t.amount}</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {t.perks.map((p, i) => (
                    <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                      <Check />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <p className="text-center text-sm font-semibold text-slate-500 border border-slate-200 rounded-full px-6 py-3">
                    Coming soon
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 text-center mt-6 italic max-w-2xl mx-auto">
            Perk descriptions are previews and may change before launch. Everyone starts with the
            free Reader account above.
          </p>
        </section>

        <SectionDivider />

        {/* One-time cross-link */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            Prefer to give once?
          </h3>
          <p className="text-slate-700 leading-relaxed mt-4">
            You can support the Institute today with a one-time, tax-deductible gift on the{' '}
            <Link to="/support/donate" className={inlineLink}>Donate page</Link>.
          </p>
        </section>

        <SectionDivider />

        {/* 501(c)(3) framing */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
            A contribution, not a subscription
          </h3>
          <p className="text-slate-700 leading-relaxed mt-4">
            The Scientific Bitcoin Institute is a 501(c)(3) tax-exempt nonprofit organization
            (EIN 41-2154267). Member contributions are tax-deductible to the fullest extent
            permitted by law, and member benefits are provided in recognition of your support.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
