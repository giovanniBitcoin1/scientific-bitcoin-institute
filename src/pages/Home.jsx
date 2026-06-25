import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import Testimonials from '../components/Testimonials.jsx'
import ResearchGrid from '../components/ResearchGrid.jsx'
import BitcoinPriceChart from '../components/charts/BitcoinPriceChart.jsx'
import FeaturedResearch from '../components/FeaturedResearch.jsx'
import CTA from '../components/CTA.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'
import Footer from '../components/Footer.jsx'

function ManifestoVideoSection() {
  return (
    <section className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 text-center mb-8 md:mb-10">
          The Scientific Bitcoin Institute Manifesto
        </h2>
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/bAd36_Z4VVw"
            title="The Scientific Bitcoin Institute Manifesto"
            loading="lazy"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="w-full h-full border-0"
          />
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/manifesto"
            className="text-orange-600 hover:text-orange-700 hover:underline transition-colors text-base font-medium"
          >
            Read the full Manifesto →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      <ManifestoVideoSection />
      <CTA />
      <Testimonials />
      <ResearchGrid />
      <BitcoinPriceChart />
      <FeaturedResearch />
      <NewsletterSignup />
      <div className="pb-16" />
      <Footer />
    </div>
  )
}
