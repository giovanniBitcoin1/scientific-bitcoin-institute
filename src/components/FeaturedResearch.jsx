import { Link } from 'react-router-dom'

const stats = [
  { figure: 'β = 5.69 ± 0.05', label: 'Power-law exponent' },
  { figure: 'R² = 0.961', label: 'Goodness of fit' },
  { figure: '5,696', label: 'Daily observations' },
]

export default function FeaturedResearch() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-400 font-semibold font-mono mb-5">
          Flagship Research
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-semibold leading-tight">
          A Mechanistic Derivation of the Bitcoin Price Power Law
        </h2>
        <p className="text-orange-400 font-medium mt-4">
          Giovanni Santostasi &amp; Stephen Perrenod
        </p>
        <p className="text-slate-300 text-lg leading-relaxed mt-6 max-w-2xl mx-auto">
          A first-principles derivation of Bitcoin&rsquo;s long-term price power law from network
          adoption dynamics and generalised Metcalfe scaling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 my-12 py-8 border-y border-white/10">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <div className="font-mono text-2xl md:text-3xl text-orange-400 font-semibold">
                {s.figure}
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-400 mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/research/publications#preprint"
            className="inline-flex items-center justify-center bg-orange-600 text-white rounded px-6 py-3 font-semibold text-sm hover:bg-orange-700 transition-colors"
          >
            Read the paper
          </Link>
          <a
            href="https://doi.org/10.5281/zenodo.19387099"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-white/30 text-white rounded px-6 py-3 font-semibold text-sm hover:border-white/60 hover:text-orange-400 transition-colors"
          >
            View on Zenodo (DOI)
          </a>
        </div>
      </div>
    </section>
  )
}
