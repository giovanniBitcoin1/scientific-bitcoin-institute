import { useState, useEffect } from 'react'
import testimonials from '../data/testimonials.json'

const featuredIn = [
  { name: 'Cointelegraph', logo: '/assets/logos/cointelegraph.jpg', url: 'https://cointelegraph.com/news/bitcoin-price-ten-million-2045-physicist-explains-power-law-model' },
  { name: 'CCN', logo: '/assets/logos/ccn.png', url: 'https://www.ccn.com/education/giovanni-santostasi-interview-predicting-bitcoin-price-movements-with-mathematical-precision/' },
  { name: 'Newhedge', logo: '/assets/logos/newhedge.png', url: 'https://newhedge.io/bitcoin/power-law' },
  { name: 'Samara Asset Group', logo: '/assets/logos/samara.png', url: 'https://www.samara-ag.com/market-insights/bitcoin-power-law' },
  { name: 'Fulgur Ventures', logo: '/assets/logos/fulgur.svg', url: 'https://medium.com/@fulgur.ventures/bitcoin-power-law-theory-executive-summary-report-837e6f00347e' },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h5 className="text-sm tracking-widest uppercase mb-4 text-slate-400 font-serif">
          Recognition
        </h5>
        <p className="text-sm md:text-base text-slate-400 mb-12 max-w-2xl mx-auto">
          Coverage and analysis of the Bitcoin Power Law — the Institute&rsquo;s flagship research by founder Giovanni Santostasi.
        </p>
        <div className="relative min-h-[200px] flex items-center justify-center">
          {testimonials.map((t, idx) => (
            <blockquote
              key={idx}
              className={`testimonial absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
                idx === current ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-2xl md:text-3xl font-light mb-8 leading-relaxed font-serif">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="text-orange-400 font-semibold tracking-wide">
                &mdash;{' '}
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {t.author}
                </a>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 text-slate-400">
          <span className="uppercase tracking-widest text-xs">As featured in</span>
          {featuredIn.map((outlet, idx) => (
            <a
              key={idx}
              href={outlet.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={outlet.name}
              className="inline-flex items-center bg-white/95 rounded-md px-3 py-1.5 shadow-sm hover:bg-white transition-colors"
            >
              <img
                src={outlet.logo}
                alt={outlet.name}
                className="h-6 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
