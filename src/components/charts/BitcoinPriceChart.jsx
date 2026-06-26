import { useState } from 'react'

// The Power Law figure is generated daily by the physics-of-bitcoin repo
// (a GitHub Action) and published at thephysicsofbitcoin.com. We embed the
// live image directly so the homepage always shows the latest chart, instead
// of the previous /data/btc-price.json fetch that had no data source.
const FIGURE_URL = 'https://www.thephysicsofbitcoin.com/bitcoin_powerlaw.png'
const SOURCE_URL = 'https://www.thephysicsofbitcoin.com'

export default function BitcoinPriceChart() {
  const [failed, setFailed] = useState(false)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange-600 mb-2">
            Flagship research &middot; updated daily
          </p>
          <h2 className="text-4xl font-bold mb-2 font-serif">The Bitcoin Power Law</h2>
          <p className="text-sm text-slate-500">
            Long-term price model on a log&ndash;log scale, refreshed every day.
          </p>
        </div>

        {failed ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <p>The live chart is taking a moment to load.</p>
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="mt-3 text-orange-600 font-semibold hover:underline">
              View it on thephysicsofbitcoin.com &rarr;
            </a>
          </div>
        ) : (
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={FIGURE_URL}
              alt="Bitcoin price plotted against the long-term power-law model, updated daily"
              loading="lazy"
              onError={() => setFailed(true)}
              className="w-full rounded-lg shadow-sm border border-slate-100"
            />
          </a>
        )}

        <div className="mt-6 text-center">
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 hover:underline transition-colors text-base font-medium">
            Explore the full model &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
