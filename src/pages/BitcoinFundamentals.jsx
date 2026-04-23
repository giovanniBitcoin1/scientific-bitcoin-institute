import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const sections = [
  {
    id: 'what-is-bitcoin',
    title: 'What Is Bitcoin?',
    body: [
      <>
        Bitcoin is a global, decentralized network for the issuance and transfer of a digitally scarce asset — the
        bitcoin — according to rules enforced by cryptography and economic incentives rather than by any institution.
        It launched on January 3, 2009, with a single block produced by an anonymous founder, Satoshi Nakamoto, and it
        has operated continuously ever since.
      </>,
      <>
        The conventional descriptions of Bitcoin emphasize what it does: it is a peer-to-peer payment system, a store
        of value, a hedge against inflation, a digital commodity. These descriptions are all correct but none of them
        capture what Bitcoin <em>is</em>. At a deeper level, Bitcoin is a self-organizing, energy-grounded,
        mathematically-governed system whose aggregate behavior is more interesting than any of its individual uses.
      </>,
      <>
        The Scientific Bitcoin Institute studies Bitcoin as a physical phenomenon — a decentralized network whose
        price, adoption, computational work, and monetary dynamics are measurable, reproducible, and governed by
        mathematical laws. These laws are not imposed by design. They emerge from the interaction of the network's
        simple rules at scale, much as the behavior of a galaxy emerges from the gravitational interaction of its
        stars, or the behavior of a brain emerges from the electrical activity of its neurons. Understanding Bitcoin at
        this level requires the toolkit of physics and complex systems science, not of conventional finance.
      </>,
    ],
  },
  {
    id: 'blockchain',
    title: 'The Blockchain: Ordered Time, Verifiable History',
    body: [
      <>
        Every Bitcoin transaction is recorded in a shared ledger called the blockchain. But the blockchain is not
        simply a database of transactions. It is a cryptographically ordered history in which every block references
        the one before it, so that the entire sequence can be verified by anyone and altered by no one.
      </>,
      <>
        Each block contains a set of transactions, a timestamp, and a reference — a cryptographic hash — of the
        previous block. This chaining means that modifying any historical transaction would invalidate the hash of
        every block after it, exposing the tampering immediately. The deeper a block sits in the chain, the more
        computational work an attacker would need to rewrite it; after a few dozen blocks, the cost becomes practically
        infinite.
      </>,
      <>
        The blockchain therefore solves a problem that had been considered unsolvable without a trusted central
        authority: how to produce a shared, tamper-resistant record of events among participants who do not know or
        trust one another. It does so by converting the problem of agreement into the problem of computational work,
        and by making that work expensive enough to secure the record and cheap enough to verify afterward. This is the
        foundation on which every other property of Bitcoin rests.
      </>,
    ],
  },
  {
    id: 'proof-of-work',
    title: 'Proof of Work and the Cost of Truth',
    body: [
      <>
        Bitcoin's blocks are produced by a process called proof of work, in which specialized computers (miners) race
        to find a mathematical solution — a hash with specific properties — that is easy to verify but computationally
        expensive to discover. The first miner to find a valid solution gets to add the next block to the chain and
        receives a reward in newly issued bitcoin.
      </>,
      <>
        Proof of work ties Bitcoin's security to physical reality. Every block in the chain represents real electricity
        consumed, real hardware operated, real energy expended. An attacker seeking to rewrite Bitcoin's history would
        have to replicate all that energy expenditure — and would have to do so faster than the honest network is
        producing new blocks, an escalating race they can never win in practice.
      </>,
      <>
        This is what the Scientific Bitcoin Institute calls the <em>cost of truth</em>. Bitcoin does not assume the
        good faith of its participants, nor does it rely on courts, regulators, or institutions to resolve disputes.
        It anchors its integrity in the thermodynamic cost of proof — a cost that can be measured, tracked over time,
        and studied as a feedback mechanism. The relationship between hash rate and price, one of the most stable
        empirical regularities in Bitcoin's history, is a direct consequence of this mechanism and a central object of
        our research.
      </>,
    ],
  },
  {
    id: 'conservation',
    title: 'The 21 Million: Conservation as a Design Principle',
    body: [
      <>
        Bitcoin has a maximum supply of 21 million coins. This number is not a policy subject to future revision. It is
        a fixed parameter of the protocol, and any attempt to change it would produce a different network that the
        existing Bitcoin community would not recognize as Bitcoin.
      </>,
      <>
        New bitcoins are issued through a predetermined schedule of block rewards, which are halved approximately every
        four years. The first block reward, in 2009, was 50 bitcoin. It has since fallen to 3.125 bitcoin per block
        following the 2024 halving, and will continue to halve until the final bitcoin is issued around the year 2140.
        Every bitcoin that will ever exist has already been defined by the protocol; the only question is when each one
        is released.
      </>,
      <>
        Most commentary describes this property as <em>scarcity</em>, but the word misses what is actually remarkable.
        Scarcity is an economic condition: a thing is scarce when the quantity available is less than the quantity
        desired. Many things are scarce in this sense, and scarcity can be created or destroyed by changes in supply or
        demand. What Bitcoin exhibits is something deeper and more rigorous — a <em>conservation law</em>.
      </>,
      <>
        In physics, conservation laws describe quantities that are neither created nor destroyed within a closed
        system: energy, momentum, electric charge, baryon number. These laws are not matters of policy or preference.
        They are mathematical consequences of the underlying symmetries of the system, as formalized by Noether's
        theorem in classical mechanics. Bitcoin's 21 million is conserved in precisely this sense. It is not a choice
        subject to later revision. It is a mathematical property of the protocol, derivable from the protocol's rules,
        and enforced by the network at every moment of its operation.
      </>,
      <>
        This framing matters because it changes what Bitcoin is being compared to. A scarce commodity competes against
        other scarce commodities — gold, silver, real estate, fine art — in a market where scarcity can be amplified,
        diluted, or circumvented. A conserved quantity does not compete in the same sense. It stands as an invariant of
        the system, a reference point that does not drift. For the first time, a monetary system possesses this
        property, and the implications for the long-term architecture of money, savings, and capital are among the most
        important questions studied at the Institute.
      </>,
    ],
  },
  {
    id: 'network',
    title: 'The Network: Nodes, Miners, and Consensus',
    body: [
      <>
        Bitcoin has no CEO, no board, no headquarters, no customer service department. It is run by a decentralized
        network of participants who each play a specific role.
      </>,
      <>
        <strong>Nodes</strong> are computers that run the Bitcoin software, maintain a full copy of the blockchain, and
        independently verify every transaction according to the protocol's rules. Anyone can run a node. The global
        count fluctuates around 15,000 publicly reachable nodes and many more that operate privately. Nodes are the
        reason Bitcoin's rules cannot be changed by any single party: each node enforces the rules it chooses to run,
        and a change that a majority of nodes reject simply fails to propagate.
      </>,
      <>
        <strong>Miners</strong> are a specialized category of participant that produce new blocks through the
        proof-of-work process. Miners compete with one another for the block reward, but they also depend on the
        broader network for the validity of the transactions they include. Their economic incentives — earning rewards,
        avoiding wasted effort — align them with the long-term health of the network.
      </>,
      <>
        <strong>Users</strong> are everyone else: holders, senders, recipients, applications built on top of the
        protocol. They interact with the network through wallets, which connect to nodes either directly or through
        intermediaries.
      </>,
      <>
        Agreement among these participants — on what transactions are valid, which block is next, what the current
        state of the ledger is — is called <em>consensus</em>, and in Bitcoin it is not negotiated but computed. Each
        node follows the same deterministic rules; when presented with the same data, they reach the same conclusion.
        This consensus mechanism is one of the most remarkable features of the system, and one of the richest objects
        of scientific study.
      </>,
    ],
  },
  {
    id: 'keys',
    title: 'Keys, Addresses, and Self-Custody',
    body: [
      <>
        Ownership of bitcoin is defined not by a name on an account but by possession of a cryptographic key. A Bitcoin
        private key is a large random number from which a corresponding public key can be derived. The public key in
        turn generates a Bitcoin address — the string you share with someone who wishes to send you bitcoin.
      </>,
      <>
        The private key grants the exclusive ability to authorize transactions from a given address. Whoever holds it
        controls the funds. There is no password reset, no customer service recovery, no bank that can unfreeze an
        account. This is what is meant by the phrase "not your keys, not your coins": if you hold your own private
        keys, you hold your own bitcoin; if someone else holds them on your behalf, you hold a claim against that
        entity, not bitcoin itself.
      </>,
      <>
        This property of self-custody is novel in the history of money. For the first time, an individual anywhere in
        the world can hold monetary value that is entirely their own, transferable at the speed of a network packet,
        seizable by no one without access to the key. The implications for political economy, property rights, and the
        architecture of financial systems are substantial, and they are among the subjects the Institute studies under
        monetary economics and game theory.
      </>,
    ],
  },
  {
    id: 'physical-system',
    title: 'Why Bitcoin Behaves Like a Physical System',
    body: [
      <>
        Bitcoin's protocol rules are simple. They fit in a few thousand lines of code. But the behavior of the network
        that runs them is not simple at all, and it is here that the scientific study of Bitcoin becomes most
        interesting.
      </>,
      <>
        The price of bitcoin, its hash rate, its user adoption, its transaction volume — these are all emergent
        properties of a system whose underlying rules say nothing about them directly. Yet they exhibit striking
        mathematical regularities. Price has followed a power law in time for sixteen years, across seven orders of
        magnitude, with an exponent near 6. Active addresses have followed a power law with exponent near 3. Hash rate
        scales as the square of price. These three relationships are mutually consistent, self-reinforcing, and
        difficult to produce by accident.
      </>,
      <>
        Patterns of this kind — scale-invariant, long-lived, robust across disturbances — are the signature of
        self-organized criticality, a phenomenon studied in physics and biology in systems ranging from earthquake
        distributions to neural avalanches. Their presence in Bitcoin suggests that the network is not a speculative
        asset undergoing random cycles of hype and disillusion, but a complex adaptive system operating at the edge of
        order and chaos, generating emergent structure through the interaction of its simple rules at scale.
      </>,
      <>
        Understanding Bitcoin at this level is the mission of the Scientific Bitcoin Institute. The rest of our
        research — the Power Law Theory, the network analysis, the game-theoretic modeling, the monetary economics —
        is built on the foundation laid out in this introduction. We invite curious readers to continue exploring.
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
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hash])
  return null
}

export default function BitcoinFundamentals() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Bitcoin Fundamentals
          </h1>
          <p className="mt-8 text-slate-700 text-lg leading-relaxed max-w-3xl mx-auto">
            This introduction to Bitcoin is written from the perspective of the Scientific Bitcoin Institute — not as a
            guide to buying or using Bitcoin, but as an orientation to what Bitcoin is as a physical and mathematical
            system. Each section introduces a core concept of the protocol while pointing toward the deeper scientific
            questions it raises, and toward the Institute's research on how those questions unfold across the network's
            behavior.
          </p>
        </section>

        {/* Table of Contents */}
        <nav
          aria-label="Bitcoin Fundamentals sections"
          className="max-w-3xl mx-auto mt-12 px-6"
        >
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Contents
            </p>
            <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              {sections.map((section, i) => (
                <li key={section.id} className="flex items-center gap-2">
                  <span className="text-orange-500 font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={`#${section.id}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <SectionDivider />

        {/* Sections */}
        <div className="max-w-3xl mx-auto px-6">
          {sections.map((section, i) => (
            <div key={section.id}>
              <section id={section.id} className="scroll-mt-28">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold mb-3 font-mono">
                  Section {i + 1}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8 leading-tight">
                  {section.title}
                </h2>
                <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                  {section.body.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </section>
              {i < sections.length - 1 && <SectionDivider />}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
