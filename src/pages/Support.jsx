import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

function SectionDivider() {
  return (
    <div className="my-20 flex justify-center" aria-hidden="true">
      <div className="h-px w-24 bg-orange-500/60" />
    </div>
  )
}

function ScrollToHash() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hash])
  return null
}

const inlineLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

const pathways = [
  {
    eyebrow: 'One-time or recurring',
    title: 'Donate',
    description:
      "Support the Institute's day-to-day operations through a tax-deductible donation in any amount. Donations support research, publications, the weekly Physics of Bitcoin show, and the Institute's broader work.",
    href: '/support/donate',
  },
  {
    eyebrow: 'Bitcoin Donations',
    title: 'Donate Bitcoin',
    description:
      "Direct Bitcoin donations to the Institute. Donations may be directed toward operating support or to the Institute's strategic Bitcoin reserve fund.",
    href: '/support/donate-bitcoin',
  },
  {
    eyebrow: 'Strategic Reserve',
    title: 'Endowment Fund',
    description:
      'The Institute is establishing a strategic Bitcoin reserve fund to support long-term sustainability. Donors who wish to seed or contribute to this fund are invited to do so.',
    href: '/support/endowment-fund',
  },
  {
    eyebrow: 'Foundations and Institutions',
    title: 'Research Grants',
    description:
      'Foundations, philanthropic organizations, and other institutional funders interested in supporting specific research initiatives at the Institute are invited to make contact.',
    href: '/support/research-grants',
  },
]

function PathwayCard({ pathway }) {
  return (
    <Link
      to={pathway.href}
      className="block bg-white border border-slate-200 rounded-lg p-8 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
    >
      <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
        {pathway.eyebrow}
      </p>
      <h3 className="font-serif text-2xl font-semibold text-slate-900 leading-tight mt-3">
        {pathway.title}
      </h3>
      <p className="text-slate-700 mt-4 leading-relaxed">{pathway.description}</p>
      <p className="mt-5 text-sm font-semibold text-orange-600">Learn more →</p>
    </Link>
  )
}

export default function Support() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Support
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Support the Institute
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            The Scientific Bitcoin Institute is funded by individuals and organizations who believe Bitcoin deserves a
            dedicated research institution committed to scientific rigor. Donations support the Institute's research,
            publications, educational programs, and operations. The Institute is a 501(c)(3) tax-exempt nonprofit
            organization; donations are tax-deductible to the fullest extent permitted by law.
          </p>
        </section>

        <SectionDivider />

        {/* Pathways */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-3 font-mono">
              Get Involved
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Ways to support
            </h2>
            <p className="text-slate-600 mt-5 leading-relaxed">
              There are several ways to contribute to the Institute. Each pathway is appropriate for a different kind
              of supporter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {pathways.map((p, i) => (
              <PathwayCard key={i} pathway={p} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Closing */}
        <section className="max-w-3xl mx-auto px-6 text-center mt-16">
          <h3 className="font-serif text-2xl font-semibold text-slate-900 leading-tight">
            On research independence
          </h3>
          <p className="text-slate-700 leading-relaxed mt-5">
            Donors and sponsors do not direct the Institute's research agenda. The Institute's commitment to research
            independence is foundational to the credibility of its findings and is described in detail on the{' '}
            <Link to="/about/transparency" className={inlineLink}>Transparency page</Link>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
