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

const pathways = [
  {
    eyebrow: 'Industry Connections',
    title: 'Industry Connections',
    description:
      'Corporate sponsorship and other industry partnerships enable the Institute to pursue ambitious research without the constraints of traditional academic funding cycles. Sponsors do not direct research; their support enables the broader mission.',
    href: '/collaborate/industry-connections',
  },
  {
    eyebrow: 'Sponsored Research',
    title: 'Sponsored research engagements',
    description:
      "The Institute partners with academic institutions to conduct sponsored research on specific questions in Bitcoin's mathematical, physical, and economic foundations. Engagements typically run six to twelve months and produce peer-reviewed publications.",
    href: '/research/sponsored-research',
  },
  {
    eyebrow: 'Research Program',
    title: 'Open problems in Bitcoin science',
    description:
      "Researchers interested in pursuing specific open questions — independently, collaboratively, or as part of a sponsored engagement — are invited to review the Institute's catalogue of open problems and identify areas of overlap.",
    href: '/research/open-problems',
  },
  {
    eyebrow: 'Get In Touch',
    title: 'Inquire about other collaboration',
    description:
      'Industry partnerships, developer relations, joint publications, conference engagements, and other forms of collaboration are welcomed. Please contact the Institute to discuss possibilities.',
    href: '/about/contact',
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

export default function Collaborate() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Collaborate
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Collaborate with the Institute
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            The Scientific Bitcoin Institute pursues its research mission through a network of sponsors, academic
            partners, and industry collaborators. We welcome inquiries from organizations interested in supporting or
            contributing to rigorous scientific research on Bitcoin as a complex system.
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
              Pathways for Collaboration
            </h2>
            <p className="text-slate-600 mt-5 leading-relaxed">
              There are several ways for organizations to engage with the Institute. Each pathway leads to a focused
              area of involvement.
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
            On the Institute's approach to collaboration
          </h3>
          <p className="text-slate-700 leading-relaxed mt-5">
            The Institute maintains independence in its research agenda. Sponsors and partners support the Institute's
            work; they do not direct it. This independence is foundational to the credibility of any conclusions the
            Institute reaches and is reflected in every collaboration the Institute enters.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
