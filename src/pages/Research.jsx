import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const areas = [
  {
    id: 'cryptography',
    title: 'Cryptography & Security',
    body: [
      <>
        Bitcoin rests on a minimalist cryptographic foundation — elliptic-curve signatures, SHA-256 hashing, and the
        proof-of-work consensus — that has proven remarkably robust across sixteen years of adversarial conditions. The
        Scientific Bitcoin Institute studies this foundation not primarily as a problem in applied cryptography, but as
        a physical constraint that shapes the system's macroscopic behavior.
      </>,
      <>
        Our interest is in how cryptographic primitives interact with the network's game-theoretic incentives to produce
        a secure equilibrium. The hash rate is a cryptographic quantity — the number of SHA-256 evaluations per second
        — but it is also a physical one, representing real energy expenditure that gives the blockchain its economic
        weight. The power-law relationship between hash rate and price (hash rate scales as price squared) is one of
        the most striking regularities in the entire system, and it sits at the boundary where cryptography becomes
        physics.
      </>,
      <>
        We investigate the long-term security implications of this coupling: how cryptographic assumptions (collision
        resistance, signature unforgeability) translate into economic guarantees; how potential future threats (quantum
        computing, algorithmic advances) might propagate through the network's feedback structure; and how Bitcoin's
        layered security model — protocol, incentives, social consensus — achieves robustness that no individual layer
        could provide alone. This is cryptography studied as a substrate for complex-system behavior, not as an end in
        itself.
      </>,
    ],
  },
  {
    id: 'network',
    title: 'Network and Complex Systems Science',
    body: [
      <>
        Bitcoin is a decentralized, self-organizing system whose behavior mirrors a wide class of natural phenomena
        studied in complex systems science — from ecosystems and neural networks to planetary dynamics and the growth
        of cities. The Scientific Bitcoin Institute treats Bitcoin as a laboratory for testing the mathematical laws
        that govern such systems, and as a case study in how these laws manifest in a purely informational,
        human-constructed network.
      </>,
      <>
        The central empirical finding of our work is that Bitcoin exhibits scale-invariant behavior across more than
        seven orders of magnitude of price variation and sixteen years of operation. The Power Law Theory describes
        this formally: price scales as time to the sixth power, addresses as time to the third, hash rate as price
        squared. These are not curve fits imposed after the fact. They are structural consequences of the network's
        internal feedback dynamics, and they place Bitcoin in the same mathematical class as self-organized critical
        systems — earthquake distributions, neuronal avalanches, the luminosity function of galaxies.
      </>,
      <>
        We apply the toolkit of complexity science — network theory, self-organized criticality, power-law statistics,
        Hurst exponent analysis, entropy measures — to characterize Bitcoin's behavior at every scale from individual
        transactions to global adoption. This is the core research program of the Institute, and the foundation on
        which our other areas of study build.
      </>,
    ],
  },
  {
    id: 'monetary',
    title: 'Monetary Economics',
    body: [
      <>
        Bitcoin is the first monetary system in history whose supply schedule, issuance policy, and settlement
        infrastructure are governed entirely by transparent mathematical rules rather than by institutional discretion.
        The Scientific Bitcoin Institute studies Bitcoin's role in the broader landscape of monetary theory, with
        particular attention to what its measurable, predictable behavior reveals about the nature of money itself.
      </>,
      <>
        Traditional financial analysis has struggled to explain Bitcoin's price trajectory because the conceptual tools
        available — valuation models built for discounted cash flows, commodity analogies, currency comparisons — do
        not fit an asset that derives its value from network adoption rather than from income, utility, or sovereign
        backing. The Power Law Theory offers a quantitative alternative: Bitcoin's value scales with its network in a
        manner consistent with a generalized Metcalfe's Law, and its long-run trajectory is governed by the same
        adoption dynamics that characterize transformative communication technologies.
      </>,
      <>
        Our research examines Bitcoin as sound money in the tradition of Carl Menger, Ludwig von Mises, and the
        Austrian School, while grounding these classical arguments in quantitative network analysis. We study global
        liquidity cycles and their interaction with Bitcoin's deflationary schedule; the Kelly optimization of Bitcoin
        allocation in institutional portfolios; the role of Bitcoin as a reserve asset at the sovereign and corporate
        level; and the implications of its monetary properties for the future architecture of the international
        financial system.
      </>,
    ],
  },
  {
    id: 'game-theory',
    title: 'Game Theory',
    body: [
      <>
        Bitcoin is, at its mathematical core, a solution to a game-theoretic problem: how can a decentralized network
        of mutually distrusting participants agree on a shared history of transactions without a central authority?
        The Nakamoto consensus provides the answer by aligning private incentives with network security, so that the
        rational action for each participant — miners, nodes, users, developers — reinforces rather than degrades the
        system.
      </>,
      <>
        The Scientific Bitcoin Institute studies this incentive structure as a living example of what the biologist
        Humberto Maturana called autopoiesis: a system that creates and maintains its own organization through internal
        processes. Unlike fiat currencies, which are maintained externally by institutions, or gold, which is
        homeostatic in its elemental identity but requires external monetary infrastructure, Bitcoin is self-creating
        and self-sustaining. Its proof-of-work foundation produces an economic equilibrium in which defection is more
        expensive than cooperation, and this equilibrium strengthens rather than weakens as the network grows.
      </>,
      <>
        We investigate the game-theoretic properties of Bitcoin across multiple timescales: short-run trader and miner
        dynamics, medium-run institutional adoption games, and long-run geopolitical coordination among nation-states
        considering reserve allocation. We study how the incentive structure interacts with the power-law growth
        dynamics documented in our network research, producing a system whose stability, rather than being imposed,
        emerges from its mathematics.
      </>,
    ],
  },
  {
    id: 'scaling',
    title: 'Scaling Solutions',
    body: [
      <>
        Bitcoin's base layer is deliberately constrained. Its block size and confirmation time are not engineering
        compromises to be optimized, but design choices that preserve the decentralization, auditability, and security
        of the monetary base. The Scientific Bitcoin Institute studies how Bitcoin scales to global monetary usage
        through a layered architecture — base layer for final settlement, second layers for high-frequency payment,
        higher-order protocols for specialized functions — and how this layered structure echoes the hierarchical
        organization of other successful complex systems.
      </>,
      <>
        The Lightning Network, sidechains, and emerging protocols such as statechains and rollups collectively extend
        Bitcoin's transactional capacity by orders of magnitude while preserving the security guarantees of the base
        layer. This design pattern — a slow, secure, immutable foundation supporting faster, more flexible layers — is
        familiar from biological systems, from the layered protocols of the Internet, and from the architecture of
        functioning financial markets. It is an expression of the general principle that complex systems organize
        themselves hierarchically when they must satisfy competing demands for robustness and adaptability.
      </>,
      <>
        We study the scaling stack not as an engineering problem to be solved, but as a structural feature of a
        maturing monetary network. Our research examines the adoption dynamics of layered protocols, the economic flows
        between layers, the implications of Lightning liquidity for the velocity of digital money, and the role of
        these scaling solutions in expanding Bitcoin's addressable user base toward the billions of participants its
        Power Law trajectory implies.
      </>,
    ],
  },
  {
    id: 'mining',
    title: 'Mining & Energy',
    body: [
      <>
        Bitcoin mining is the physical substrate of the network's security. Every block is produced by real
        computation, consuming real energy, anchored in real hardware — and it is this physical grounding that
        distinguishes Bitcoin from every other digital monetary system. The Scientific Bitcoin Institute studies mining
        as the mechanism by which cryptographic proofs are converted into economic guarantees, and as one of the most
        instructive examples in the modern economy of the coupling between information and physical work.
      </>,
      <>
        The relationship between hash rate and price is one of the most striking regularities in the entire Bitcoin
        system: empirically, hash rate scales as price squared. This is not an accident but a structural feature,
        arising from the economic equilibrium of mining — higher prices draw more miners, raising the hash rate until
        the marginal cost of production reaches the market price. The result is a self-stabilizing feedback loop that
        functions like a thermostat for the network, anti-fragile under price shocks and progressively more secure as
        adoption grows.
      </>,
      <>
        We investigate the mining industry from a perspective informed by high-performance computing and complex
        systems science. This includes the evolution of specialized hardware, the geographic distribution of mining
        activity and its relationship to global energy markets, the role of Bitcoin mining in monetizing stranded or
        curtailed energy, and the longer-term implications of a global computational resource whose economic output can
        be transported anywhere at the speed of light. Our work produces a semiannual report on the mining industry in
        collaboration with the high-performance computing community, situating Bitcoin mining within the broader story
        of industrial computing.
      </>,
    ],
  },
]

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
      // Defer to next frame so scroll-mt / sticky header offsets apply correctly
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hash])
  return null
}

export default function Research() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Research Areas
          </h1>
          <p className="mt-8 text-slate-700 text-lg leading-relaxed max-w-3xl mx-auto">
            The Scientific Bitcoin Institute studies Bitcoin across six interconnected research areas, each grounded in
            the physics of complex systems and network dynamics. Together, these areas form a comprehensive program for
            advancing the rigorous scientific study of Bitcoin.
          </p>
        </section>

        {/* Table of Contents */}
        <nav
          aria-label="Research areas"
          className="max-w-3xl mx-auto mt-12 px-6"
        >
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Contents
            </p>
            <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              {areas.map((area, i) => (
                <li key={area.id} className="flex items-center gap-2">
                  <span className="text-orange-500 font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={`#${area.id}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {area.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <SectionDivider />

        {/* Sections */}
        <div className="max-w-3xl mx-auto px-6">
          {areas.map((area, i) => (
            <div key={area.id}>
              <section id={area.id} className="scroll-mt-28">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold mb-3 font-mono">
                  {String(i + 1).padStart(2, '0')} &nbsp;·&nbsp; Research Area
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8 leading-tight">
                  {area.title}
                </h2>
                <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                  {area.body.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </section>
              {i < areas.length - 1 && <SectionDivider />}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
