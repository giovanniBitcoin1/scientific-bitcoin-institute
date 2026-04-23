import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const topics = [
  {
    title: 'Bitcoin Fundamentals',
    desc: 'Core concepts through a complex-systems lens',
    href: '/education/bitcoin-fundamentals',
  },
  {
    title: 'Advanced Cryptography',
    desc: "The mathematical foundations of Bitcoin's security",
  },
  {
    title: 'Game Theory',
    desc: "Incentives, consensus, and Bitcoin's autopoietic structure",
  },
  {
    title: 'Network Science',
    desc: 'Power laws, adoption dynamics, and scale-invariant behavior',
  },
  {
    title: 'Economic Modeling',
    desc: 'Bitcoin as a conserved monetary system',
  },
  {
    title: 'Online Courses',
    desc: 'Structured curricula for self-directed learners',
  },
  {
    title: 'Summer School',
    desc: 'An annual program for early-career scientists',
  },
]

function TopicCard({ topic }) {
  const available = Boolean(topic.href)

  const inner = (
    <div className="h-full flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all">
      <h3 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
        {topic.title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed flex-1">{topic.desc}</p>
      {available ? (
        <span className="text-xs uppercase tracking-wider font-semibold text-orange-600">
          Available
        </span>
      ) : (
        <span className="text-xs italic text-slate-400">Coming soon</span>
      )}
    </div>
  )

  if (available) {
    return (
      <Link
        to={topic.href}
        className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <div className="h-full transition-all group-hover:-translate-y-1 group-hover:shadow-xl rounded-xl">
          {inner}
        </div>
      </Link>
    )
  }

  return <div className="opacity-70">{inner}</div>
}

export default function Education() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Education
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-3xl mx-auto mt-10 px-6">
          <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
            <p>
              The Scientific Bitcoin Institute's educational program introduces Bitcoin not as a financial product or a
              technology trend, but as a scientific subject worthy of rigorous study. Our materials are written for
              curious readers at every level — from the newcomer meeting Bitcoin for the first time to the researcher
              seeking the mathematical and physical foundations that give the network its behavior.
            </p>
            <p>
              Our current public resource is <em>Bitcoin Fundamentals</em>, an introduction to the network's core
              concepts from the perspective of complex systems science. In future, this program will expand to cover
              Advanced Cryptography, Game Theory, Network Science, and Economic Modeling at a level appropriate to
              graduate students, researchers, and technical professionals. We are also preparing online courses and an
              annual summer school for early-career scientists.
            </p>
          </div>
        </section>

        {/* Topic cards */}
        <section className="max-w-6xl mx-auto mt-16 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <TopicCard key={i} topic={topic} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
