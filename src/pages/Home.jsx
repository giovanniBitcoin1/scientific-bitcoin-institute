import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import StatsBanner from '../components/StatsBanner.jsx'
import Testimonials from '../components/Testimonials.jsx'
import ResearchGrid from '../components/ResearchGrid.jsx'
import BitcoinPriceChart from '../components/charts/BitcoinPriceChart.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      <StatsBanner />
      <Testimonials />
      <ResearchGrid />
      <BitcoinPriceChart />
      <CTA />
      <Footer />
    </div>
  )
}
