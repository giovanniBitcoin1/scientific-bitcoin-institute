export default function CTA() {
  return (
    <section className="py-20 bitcoin-gradient">
      <div className="max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
          Join the Bitcoin Research Community
        </h2>
        <p className="text-xl mb-8 opacity-95">
          Collaborate with leading researchers advancing the science of sound money
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl">
            Become a Member
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
            View Open Positions
          </button>
        </div>
      </div>
    </section>
  )
}
