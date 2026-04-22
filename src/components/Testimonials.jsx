import { useState, useEffect } from 'react'
import testimonials from '../data/testimonials.json'

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
        <h5 className="text-sm tracking-widest uppercase mb-12 text-slate-400 font-serif">
          Recognition
        </h5>
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
                &mdash; {t.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
