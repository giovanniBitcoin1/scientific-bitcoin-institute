import { Link } from 'react-router-dom'

// The "Become a Member" button points to the membership page, where visitors
// see all tiers and can create a free Reader account. Keeping this internal
// (not straight to sign-up) lets people read the tiers and framing first.
const MEMBERSHIP_URL = '/support/membership?source=home-cta'

export default function CTA() {
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
          <Link to={MEMBERSHIP_URL} className="border border-white/50 text-white/90 font-medium rounded-full px-7 py-2.5 text-sm hover:bg-white/10 hover:border-white transition-colors">
            Become a Member
          </Link>
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
