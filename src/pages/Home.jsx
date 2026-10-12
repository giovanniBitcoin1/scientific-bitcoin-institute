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

function AcademicDayBanner() {
  return (
    <section className="bg-slate-900 border-y border-orange-500/40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 text-center sm:text-left">
          <p className="text-sm md:text-base text-slate-200">
            <span className="font-mono text-xs md:text-sm uppercase tracking-wider text-bitcoin font-semibold">
              20 October 2026 &nbsp;·&nbsp; Lugano
            </span>
            <span className="hidden sm:inline text-slate-600 mx-3">|</span>
            <span className="block sm:inline mt-1 sm:mt-0">
              Academic Day: the public launch of the Scientific Bitcoin Institute
            </span>
          </p>
          <Link
            to="/events/academic-day"
            className="flex-shrink-0 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap"
          >
            Details &amp; registration →
          </Link>
        </div>
      </div>
    </section>
  )
}

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

function SeedToolSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              Institute Resource
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mt-4">
              Physical Entropy Seed Tool
            </h2>
            <p className="text-slate-700 text-lg mt-4 leading-relaxed">
              Generate your Bitcoin seed from coin flips or dice — with tools that contain no random
              number generator at all.
            </p>
            <p className="text-slate-600 text-base mt-6 leading-relaxed">
              A downloadable kit combining two independent implementations (browser and Python), a
              pen-and-paper worksheet, and complete verification of the BIP-39 standard. Cross-verify
              against the standard's test vectors before use. Free, open-source, and byte-verifiable.
            </p>
            <div className="mt-8">
              <Link
                to="/seed-tool"
                className="group inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
              >
                Open the Seed Tool
                <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Visual anchor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
            <img
              src="/assets/logo.jpg"
              alt="Scientific Bitcoin Institute"
              className="w-24 h-24 object-contain"
            />
            <p className="mt-6 text-xs uppercase tracking-wider text-slate-500 font-mono">
              Verify before use
            </p>
            <p className="mt-2 font-mono text-sm text-slate-700 break-all">
              SHA-256
            </p>
            <p className="mt-1 font-mono text-[11px] text-slate-400 break-all">
              78a917ae…bc3aaf9f
            </p>
          </div>
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
      <AcademicDayBanner />
      <ManifestoVideoSection />
      <CTA />
      <Testimonials />
      <ResearchGrid />
      <BitcoinPriceChart />
      <FeaturedResearch />
      <SeedToolSection />
      <NewsletterSignup />
      <div className="pb-16" />
      <Footer />
    </div>
  )
}
