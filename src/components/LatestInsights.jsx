import { Link } from 'react-router-dom'
import { SignupFootnote, SignupForm } from './NewsletterSignup.jsx'
import { CardGrid, PieceCard, eyebrowClass } from './newsroom/parts.jsx'
import { getDispatches, getLatest } from '../lib/newsroom.js'
import { COPY } from '../lib/site.js'

// Home page block: the latest issue of SBI Dispatch and up to two other recent
// pieces, with a compact signup form. Renders nothing while nothing is
// published.
export default function LatestInsights() {
  const latestDispatch = getDispatches()[0] || null
  const others = getLatest(3 + 1)
    .filter((p) => !latestDispatch || p.path !== latestDispatch.path)
    .slice(0, 2)
  const pieces = [latestDispatch, ...others].filter(Boolean)
  if (pieces.length === 0) return null

  return (
    <section className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className={eyebrowClass}>Insights</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-2">
              Latest analysis
            </h2>
          </div>
          <Link to="/insights" className="text-sm font-semibold text-orange-600 hover:text-orange-700 whitespace-nowrap">
            All Insights →
          </Link>
        </div>

        <CardGrid>
          {pieces.map((piece) => (
            <PieceCard key={piece.path} piece={piece} />
          ))}
        </CardGrid>

        <div className="mt-10 bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8 md:flex md:items-center md:gap-8">
          <div className="md:flex-1">
            <p className={eyebrowClass}>{COPY.signupEyebrow}</p>
            <p className="font-serif text-2xl font-semibold text-slate-900 mt-1">{COPY.signupHeading}</p>
            <p className="text-slate-600 text-sm mt-1">Every other Thursday. One email, twice a month.</p>
          </div>
          <div className="mt-5 md:mt-0 md:flex-1">
            <SignupForm />
            <SignupFootnote className="mt-3 text-center" />
          </div>
        </div>
      </div>
    </section>
  )
}
