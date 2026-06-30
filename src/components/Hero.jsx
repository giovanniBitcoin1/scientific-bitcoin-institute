import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from './Icons.jsx'
import heroSlides from '../data/heroSlides.json'

// Where the hero call-to-action sends visitors: the dashboard sign-up, where
// they create a free Reader account (newsletter + the full interactive
// power-law chart). The ?source tag lets the funnel be measured later.
const SIGNUP_URL = 'https://app.scientificbitcoininstitute.org/sign-up?source=home-hero'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const next = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prev = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const slide = heroSlides[currentSlide]

  return (
    <section className="relative h-screen">
      {/* Background slides */}
      <div className="absolute inset-0">
        {heroSlides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 hero-slide' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${s.color}dd 0%, ${s.color}88 100%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-slate-900/45" />

      {/* Content */}
      <div className="relative h-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center text-white">
        <img src="/assets/logo.jpg" alt="Scientific Bitcoin Institute" className="h-20 md:h-28 w-auto mb-6 object-contain drop-shadow-lg" />
        <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-orange-400 mb-4">Scientific Bitcoin Institute</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight font-serif">{slide.title}</h1>
        <div className="w-12 h-0.5 bg-orange-500 mb-6"></div>
        <p className="text-lg md:text-xl mb-8 font-light opacity-90 max-w-xl">{slide.description}</p>
        <a href={SIGNUP_URL} className="group px-8 py-4 bitcoin-gradient text-white rounded-full font-semibold inline-flex items-center gap-3 hover:gap-4 transition-all duration-300 shadow-lg hover:shadow-xl">
          {slide.cta}
          <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </a>
      </div>

      {/* Carousel controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={prev}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-12 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  )
}
