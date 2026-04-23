import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const team = [
  {
    photo: '/assets/team/giovanni.png',
    name: 'Giovanni Santostasi',
    title: 'Director',
    bio: [
      <>
        Giovanni Santostasi is a physicist and neuroscientist, and the creator of the Bitcoin Power Law Theory — one
        of the most rigorously tested quantitative frameworks for understanding Bitcoin's long-run dynamics. He holds
        a Ph.D. in Astrophysics and has spent more than twelve years studying Bitcoin as a complex physical system,
        applying tools from complexity science, network theory, and statistical physics to a phenomenon that
        conventional economics has struggled to explain.
      </>,
      <>
        First identified in 2012 and refined across five complete market cycles, the Power Law describes an empirical
        regularity that has held for sixteen years and seven orders of magnitude of price variation. It makes specific,
        falsifiable predictions — a price corridor, exponent values, a consistency condition among three independent
        datasets — that each new year of data has confirmed. Giovanni's recent book,{' '}
        <em>The Physics of Bitcoin</em>, develops this framework for a general scientific audience.
      </>,
      <>
        In parallel, he pursues research in computational neuroscience — investigating sleep, memory consolidation,
        and the self-organized criticality of cortical dynamics. The mathematical structure that governs the sleeping
        brain is, at the deepest level, the same structure that governs Bitcoin.
      </>,
    ],
    links: [
      { label: 'The Physics of Bitcoin', href: 'https://thephysicsofbitcoin.com' },
      { label: 'X: @Giovann35084111', href: 'https://x.com/Giovann35084111' },
    ],
  },
  {
    photo: '/assets/team/stephen.jpg',
    name: 'Stephen Perrenod, Ph.D.',
    title: 'Vice-Director',
    bio: [
      <>
        Stephen Perrenod is a physicist, author, and Bitcoin researcher with deep expertise spanning astronomy,
        enterprise computing, and cryptocurrency economics. He holds a bachelor's degree in physics from MIT and a
        Ph.D. in astronomy from Harvard, and has published two books on cosmology and extragalactic astronomy.
      </>,
      <>
        His work in Bitcoin builds on a long career in high-performance computing — with senior roles at Cray, SGI,
        and Sun Microsystems — which provides an unusually grounded perspective on mining, network dynamics, and the
        computational physics of proof-of-work. Stephen has contributed original analyses of the Power Law in gold
        terms, the stability of the scaling relationships across regimes, the differentiation between Bitcoin's
        laminar and turbulent phases, and portfolio allocation through the Kelly optimization framework.
      </>,
      <>
        He is the author of a freely available semiannual report comparing the Bitcoin mining industry to the
        HPC/supercomputer sector, and co-hosts the weekly Physics of Bitcoin livestream with Giovanni Santostasi.
      </>,
    ],
    links: [
      { label: 'OrionX', href: 'https://orionx.net' },
    ],
  },
]

function TeamCard({ member }) {
  return (
    <article className="flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden card-hover">
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-8 md:p-10 flex flex-col gap-5">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
            {member.name}
          </h2>
          <p className="mt-1 text-sm italic text-slate-600">{member.title}</p>
        </div>
        <div className="space-y-4 text-slate-700 leading-relaxed text-[1.02rem]">
          {member.bio.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {member.links.length > 0 && (
          <div className="pt-2 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
            {member.links.map((link, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-slate-300" aria-hidden="true">•</span>}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function People() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Team
          </h1>
          <p className="mt-6 text-slate-600 text-lg leading-relaxed">
            The Institute is led by a small team of physicists and researchers applying the rigor of the natural
            sciences to Bitcoin as a complex adaptive system.
          </p>
        </section>

        {/* Team grid */}
        <section className="max-w-6xl mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {team.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
