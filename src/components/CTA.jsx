import { Link } from 'react-router-dom'

// Where the recurring-membership button points: the dashboard sign-up, where
// visitors create a free Reader account and enter the funnel. The same URL will
// later let them contribute, so this link does not need to change when paid
// tiers ship. The ?source tag lets the funnel be measured.
const MEMBERSHIP_URL = 'https://app.scientificbitcoininstitute.org/sign-up?source=home-cta'

const isExternal = (url) => /^https?:\/\//.test(url)

export default function CTA() {
  const external = isExternal(MEMBERSHIP_URL)
  const MembershipTag = external ? 'a' : Link
  const membershipProps = external
    ? { href: MEMBERSHIP_URL, target: '_blank', rel: 'noopener noreferrer' }
    : { to: MEMBERSHIP_URL }

  return (
    <section className="bg-orange-500 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-3 font-serif">Support independent Bitcoin research</h2>
        <p className="text-lg mb-8 text-white/90">
          The Institute runs on contributions. Donate once, or become a member and fund rigorous, open science.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link to="/support/donate" className="bg-white text-orange-600 font-semibold rounded-full px-10 py-3.5 shadow-sm hover:bg-white/90 transition-colors">
            Donate
          </Link>
          <MembershipTag {...membershipProps} className="border border-white/50 text-white/90 font-medium rounded-full px-7 py-2.5 text-sm hover:bg-white/10 hover:border-white transition-colors">
            Become a Member
          </MembershipTag>
        </div>

        <p className="mt-6 text-sm text-white/80">
          Researcher?{' '}
          <Link to="/collaborate/academic-programs" className="underline hover:text-white">
            View open positions
          </Link>
        </p>
      </div>
    </section>
  )
}
