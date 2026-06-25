import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="bg-orange-500 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-3">Join the Bitcoin Research Community</h2>
        <p className="text-lg mb-8 text-white/90">
          Collaborate with leading researchers advancing the science of sound money
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/collaborate" className="bg-white text-orange-600 font-semibold rounded-full px-8 py-3 hover:bg-white/90 transition-colors">
            Become a Member
          </Link>
          <Link to="/collaborate/academic-programs" className="border border-white text-white font-semibold rounded-full px-8 py-3 hover:bg-white/10 transition-colors">
            View Open Positions
          </Link>
        </div>
      </div>
    </section>
  )
}
