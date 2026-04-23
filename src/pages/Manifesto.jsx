import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const tenets = [
  {
    title: 'Bitcoin as a Complex System',
    body: (
      <p>
        Bitcoin is a decentralized self-organizing system that mirrors the complexity of natural and social phenomena,
        from celestial mechanics to ecosystems to the Internet. It challenges conventional notions of value, governance,
        and coordination. The Institute recognizes this inherent complexity and treats Bitcoin as a unique laboratory for
        studying emergent behaviors, offering insights into the interplay of technology, economics, and sociology.
      </p>
    ),
  },
  {
    title: "Bitcoin's Game Theory and Autopoiesis",
    body: (
      <>
        <p>
          Bitcoin is analogous to biological cells that take inputs but create and control their own internal structures.
          Thus Bitcoin is autopoietic; that means it is self-creating and self-managing.
        </p>
        <p>
          The Nakamoto consensus mints Bitcoin, secures it, and puts it on an easily audited decentralized and time
          chained ledger. Bitcoin is on the opposite end of the spectrum from fiat currency, which is fully allopoietic,
          created and maintained externally. Gold sits in the middle of the spectrum; it is homeostatic in its elemental
          identity, but its monetary usage also requires external management.
        </p>
        <p>
          Bitcoin implements a self-sustaining game theory that causes rapid participant growth in a viral manner.
          Bitcoin's Proof of Work-based consensus algorithm is the cornerstone of this incentive structure.
        </p>
      </>
    ),
  },
  {
    title: "Bitcoin's Dynamism",
    body: (
      <>
        <p>
          Bitcoin is dynamic and persistent, manifesting anti-fragility and a Lindy nature. The longer it exists, the
          more it has annealed, evolved, and scaled.
        </p>
        <p>
          Its volatility and bubble dynamics decrease noticeably with network size, showing both a "core laminar flow"
          and turbulent bubble regions. Understanding these structures is vital for broad adoption by institutions,
          states, and risk-sensitive investors.
        </p>
      </>
    ),
  },
  {
    title: 'Stability Through Feedback Loops',
    body: (
      <p>
        Bitcoin's hash rate acts as a thermostat, stabilizing the network through a power-law relationship with price.
        Halvings, the difficulty adjustment, miner dynamics, and the Nakamoto consensus protocol ensure anti-inflationary
        properties, distinguishing Bitcoin from unsustainable exponential systems like fiat money, Ponzi schemes, or
        bubbles in financial markets. This balance enables steady power-law growth.
      </p>
    ),
  },
  {
    title: 'Network Effects Drive Value',
    body: (
      <p>
        Bitcoin's value is rooted in its network, and can be described by a generalized Metcalfe's Law for which value
        scales as V ~ n<sup>γ</sup>, with γ near to 2. Feedback loops among users, miners, and investors amplify adoption
        and price discovery, creating a self-reinforcing system. As the network scales it becomes eligible for new
        classes of investors to enter. Growing institutional participation enhances scaling by boosting liquidity and
        sentiment.
      </p>
    ),
  },
  {
    title: 'Bitcoin Follows Power Laws',
    body: (
      <>
        <p>
          The Power Law Theory is a scientific model with more than 90% explanatory accuracy across eight orders of
          magnitude of price.
        </p>
        <p>Bitcoin's price, hash rate, and active addresses exhibit power-law relationships:</p>
        <div className="my-8 rounded-lg border-l-4 border-orange-500 bg-slate-900 px-6 py-5 font-mono text-base text-orange-100 shadow-sm">
          <div className="flex flex-col gap-2">
            <span>Price <span className="text-orange-400">~</span> Time<sup>6</sup></span>
            <span>Addresses <span className="text-orange-400">~</span> Time<sup>3</sup></span>
            <span>Hash&nbsp;Rate <span className="text-orange-400">~</span> Price<sup>2</sup></span>
          </div>
        </div>
        <p>
          These scale-invariant patterns, observed over Bitcoin's entire history, demonstrate that it behaves like a
          physical system, not a speculative asset. Power laws govern complex networks—from social media to galaxies—and
          Bitcoin's adherence to them reveals its robustness and general predictability.
        </p>
      </>
    ),
  },
  {
    title: 'Predictive and Explanatory Power',
    body: (
      <p>
        The algorithmic structure of Bitcoin governance leads to predictive and explanatory power. As a prime example,
        the power law has successfully predicted price milestones and long-term trajectories. Unlike speculative models,
        it is testable, grounded in network theory, and validated by data.
      </p>
    ),
  },
  {
    title: 'A Universal Principle',
    body: (
      <p>
        Power laws are ubiquitous in physics, biology, and social systems, as noted by researchers such as Geoffrey West
        and Didier Sornette. Bitcoin's unique adherence to them sets it apart from other cryptocurrencies, underscoring
        its role as a paradigm for studying complex systems.
      </p>
    ),
  },
]

const missionItems = [
  {
    title: 'Research and Validation',
    body:
      'Conduct rigorous studies to refine power-law and related models, integrating data on price, hash rate, adoption, and global liquidity. Develop new indicators such as power-law bands, slope dynamics, Hurst exponents, and entropy measures to enhance predictive accuracy.',
  },
  {
    title: 'Interdisciplinary Collaboration',
    body:
      "Unite physicists, network theorists, economists, and data scientists to explore Bitcoin's parallels with natural and social systems, deepening understanding of its power dynamics.",
  },
  {
    title: 'Education and Outreach',
    body:
      'Disseminate science-based models and analysis through publications, conferences, and media. Translate complex findings into accessible tools, empowering investors, developers, and policymakers.',
  },
  {
    title: 'Community Representation',
    body:
      'Ensure the Institute reflects the broader Bitcoin community, amplifying voices often sidelined by marketing-driven narratives.',
  },
  {
    title: 'Innovation in Application',
    body:
      "Apply power-law insights to real-world challenges such as optimizing mining efficiency, modeling adoption curves, and informing regulatory frameworks. Explore Bitcoin's role in global liquidity and monetary policy.",
  },
]

const toc = [
  { id: 'summary', label: 'Summary' },
  { id: 'preamble', label: 'Preamble' },
  { id: 'core-tenets', label: 'Core Tenets' },
  { id: 'mission', label: 'Mission' },
  { id: 'vision', label: 'Vision' },
  { id: 'call-to-action', label: 'Call to Action' },
]

function SectionDivider() {
  return (
    <div className="my-20 flex justify-center" aria-hidden="true">
      <div className="h-px w-24 bg-orange-500/60" />
    </div>
  )
}

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Manifesto
          </h1>
          <p className="mt-6 text-slate-600 text-lg">
            A scientific case for Bitcoin as a complex adaptive system.
          </p>
        </div>

        {/* Table of Contents */}
        <nav
          aria-label="Manifesto sections"
          className="max-w-3xl mx-auto mt-12 px-6"
        >
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Contents
            </p>
            <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              {toc.map((item, i) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className="text-orange-500 font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={`#${item.id}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Summary / pull-quote */}
        <section id="summary" className="max-w-3xl mx-auto mt-16 px-6 scroll-mt-28">
          <div className="relative border-l-4 border-orange-500 bg-white px-8 py-10 shadow-sm rounded-r-lg">
            <p className="font-serif text-2xl md:text-[1.75rem] leading-relaxed text-slate-800 italic">
              We believe Bitcoin represents an historic change in how value is measured, exchanged, and stored.
            </p>
            <div className="mt-6 space-y-5 text-slate-700 text-lg leading-relaxed">
              <p>
                This advance coincides with the increasing digitization of human life and other emerging human-scale
                trends such as Artificial Intelligence. We believe Bitcoin and its behavior can be properly understood
                only through new application of science, mathematical models, and information theory. Traditional
                financial analyses have been unable to explain or predict Bitcoin over its history. The Scientific
                Bitcoin Institute aims to address this gap, building on more than a decade of scientific research by its
                founders. This body of work has been freely shared with the Bitcoin community.
              </p>
              <p>
                Our vision is to become the leading institute where Bitcoin is studied with the intellectual rigor of
                the natural sciences, through open, evidence-based, interdisciplinary research. Bitcoin is destined to
                play a key role in the future of global civilization. We aim to enhance humanity's understanding of this
                transformative technology of money and value. We encourage the Bitcoin community to participate and
                support this effort.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Preamble */}
        <section id="preamble" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8">
            Preamble
          </h2>
          <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
            <p>
              Bitcoin is more than a currency, an asset, or a technology — it is a self-organizing, decentralized
              system, rooted in energy and cryptography, governed by precise mathematical laws, and akin to natural
              phenomena such as planetary orbits, biological ecosystems, or social networks.
            </p>
            <p>
              At the heart of this system lies the{' '}
              <span className="text-orange-600 font-semibold">Power Law Theory</span>, the only coherent, empirically
              validated framework that explains Bitcoin's long-term behavior across price, adoption, and network metrics.
            </p>
            <p>
              Bitcoin's multifaceted nature demands broad inquiry. The Scientific Bitcoin Institute is established to
              foster rigorous, interdisciplinary studies of Bitcoin as a dynamic phenomenon, testing practical ideas in
              finance, society, and the physics of networks in real time. This manifesto establishes the Institute's
              mission: to advance the study, application, and dissemination of scientific models of Bitcoin, including
              the Power Law Theory and meta-network frameworks.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Core Tenets */}
        <section id="core-tenets" className="max-w-5xl mx-auto px-6 scroll-mt-28">
          <div className="max-w-3xl mx-auto mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
              Core Tenets
            </h2>
            <p className="text-slate-600 text-lg">
              Eight principles that frame our scientific approach to Bitcoin.
            </p>
          </div>

          <div className="space-y-8">
            {tenets.map((t, i) => (
              <article
                key={i}
                className="relative rounded-xl bg-white border border-slate-200 shadow-sm card-hover overflow-hidden"
              >
                <div className="grid md:grid-cols-[auto_1fr]">
                  <div className="bitcoin-gradient flex md:flex-col items-center justify-center gap-1 px-6 py-5 md:py-8 md:w-28 text-white">
                    <span className="text-xs uppercase tracking-widest opacity-90">Tenet</span>
                    <span className="font-serif text-4xl md:text-5xl font-semibold leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-8 md:p-10">
                    <h3 className="font-serif text-2xl md:text-[1.75rem] font-semibold text-slate-900 mb-5">
                      {t.title}
                    </h3>
                    <div className="space-y-5 text-slate-700 leading-relaxed text-[1.05rem]">
                      {t.body}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Mission */}
        <section id="mission" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8">
            Mission of the Institute
          </h2>
          <div className="space-y-10">
            {missionItems.map((m, i) => (
              <div key={i} className="border-l-2 border-slate-200 pl-6 hover:border-orange-500 transition-colors">
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-slate-900 mb-3">
                  {m.title}
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Vision */}
        <section id="vision" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8">
            Vision for the Future
          </h2>
          <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
            <p>
              The Scientific Bitcoin Institute will establish Bitcoin as a legitimate subject of scientific inquiry.
              Anchoring our work in evidence-based models such as the Power Law Theory, we will:
            </p>
            <ul className="space-y-4 mt-6">
              {[
                "Predict Bitcoin's trajectory with greater precision, guiding investors and developers.",
                "Reveal Bitcoin's role as a model for decentralized systems, inspiring innovations in technology and governance.",
                'Foster a global community of researchers who champion evidence over narrative.',
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    className="mt-2 inline-block w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SectionDivider />

        {/* Call to Action */}
        <section id="call-to-action" className="max-w-4xl mx-auto px-6 scroll-mt-28">
          <div className="relative rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-white to-orange-50 px-8 py-14 md:px-14 md:py-16 text-center shadow-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
              Call to Action
            </p>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl leading-snug text-slate-900">
              We invite scientists, developers, economists, sociologists, and Bitcoin advocates to join the Scientific
              Bitcoin Institute.
            </p>
            <p className="mt-6 text-slate-700 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Together we will build a legacy of discovery, using Bitcoin's complexity to illuminate the laws of nature
              and society.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
